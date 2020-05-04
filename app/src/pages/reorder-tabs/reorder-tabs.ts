import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { Component } from '@angular/core';
import { MingleService } from '@totvs/mobile-mingle'
import { NavController, NavParams, reorderArray, LoadingController, ToastController, App, Platform } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/Observable';
import { from } from 'rxjs/observable/from';
import 'rxjs/add/operator/toArray';

import { AppService } from '../../providers/app.service';
import { ConfigPage } from '../config/config';
import { DashboardPage } from '../dashboard/dashboard';
import { HomePage } from '../home/home';
import { ProjectsService } from '../../providers/projects.service';
import { ReloadProject } from '../reload-project/reload-project';
import { ReportService } from './../../providers/report.service';
import { ReportsService } from './../../providers/reports.service';
import { ReorderReportsPage } from '../reorder-reports/reorder-reports';
import { SessionService } from '../../providers/session.service';

@Component({
	selector: 'page-reorder-tabs',
	templateUrl: 'reorder-tabs.html'
})
export class ReorderTabsPage {

	title: string;
	reports: any[] = [];
	project: any;
	tabs: any[] = [];
	private _unregisterBackButton: any;

	constructor(
		public navCtrl: NavController,
		private mingle: MingleService,
		private appService: AppService,
		private reportsService: ReportsService,
		private projectsService: ProjectsService,
		private alertCtrl: AlertController,
		private translateService: TranslateService,
		private sessionService: SessionService,
		private loadingCtrl: LoadingController,
		private toastCtrl: ToastController,
		private platform: Platform,
		private app: App

	) {
	}

	ionViewWillEnter() {
		this._unregisterBackButton = this.platform.registerBackButtonAction(() => {
			this.sessionService.navigation('DashboardPage');
			this.navCtrl.pop();
		}, 300);
	}

	ionViewWillLeave() {
		this._unregisterBackButton();
	}

	ionViewDidLoad() {
		this._init();
	}

	private _init() {
		this.projectsService.getSavedProject()
			.then(project => {
				this.project = project;

				for (let tab of this.project.tabs) {
					tab['new'] = 0;
					this.tabs.push(tab);
				}

				this._syncTabs().subscribe();
			})
			.catch(() => { });
	}

	private _syncTabs() {
		return this.appService.getAppsByProject(this.project.id)
			.flatMap(goodDataTabs => {
				this._removeDeletedTabs(goodDataTabs);
				this._addNewTabs(goodDataTabs);
				this._checkRenamedTabs(goodDataTabs);

				return this.projectsService.setProject(this.project);
			})
			.flatMap(() => {
				return this._addNewReportsCount();
			});
	}

	private _removeDeletedTabs(goodDataTabs) {
		this.project.tabs = this.project.tabs.filter(tab => {
			return goodDataTabs.some(goodDataTab => goodDataTab.link === tab.uri)

		});
		this.tabs = this.project.tabs;
	}

	private _addNewTabs(goodDataTabs) {
		goodDataTabs.forEach((gDataTab, index) => {
			let shoulAddTab = this.tabs.every(tab => tab.id != gDataTab.identifier);

			if (shoulAddTab) {
				let newTab = {
					id: gDataTab.identifier,
					title: gDataTab.title,
					reports: [],
					visible: false,
					uri: gDataTab.link,
					removable: false,
					new: 0
				};
				// this.projectsService.addNewTab(newTab);
				// this.tabs.push(newTab);
				this.project.tabs.push(newTab);
			}
		});
	}

	private _checkRenamedTabs(goodDataTabs) {


		this.project.tabs = this.project.tabs.map( tab => {
			let goodDataTab = goodDataTabs.filter(goodDataTab => goodDataTab.link === tab.uri);
			if(goodDataTab[0].title){
				tab.title = goodDataTab[0].title;
				return tab;
			}
		});
		this.tabs = this.project.tabs;
	}

	private _addNewReportsCount(): Observable<any> {
		return from(this.tabs)
			.flatMap((tab, index) => {
				return this.reportsService.getReportsByApp(tab.uri)
					.map(reports => {
						this.tabs[index].new = reports.content.entries.length - tab.reports.length;
					});
			});
	}

	public reorderTabs(indexes) {
		this.tabs = reorderArray(this.tabs, indexes);
		this.project.tabs = this.tabs;
		this.projectsService.setProject(this.project)
			.then(() => {
				let data = {
					projectId: this.sessionService.projectId,
					projectName: this.sessionService.projectName
				};

				this.mingle.registerMetric('TABS_REORDERED', data);
			});
	}

	public toggleVisibility(tab) {
		this.project.tabs = this.tabs;
		this.projectsService.setProject(this.project)
			.then(() => {
				let data;
				if (tab.visible) {
					data = {
						projectId: this.sessionService.projectId,
						projectName: this.sessionService.projectName,
						reportName: tab.title
					};

					this.mingle.registerMetric('TAB_INCLUDED', data);
				} else {
					data = {
						projectId: this.sessionService.projectId,
						projectName: this.sessionService.projectName,
						reportName: tab.title
					};

					this.mingle.registerMetric('TAB_REMOVED', data);
				}
			});
	}

	public navigateToReorderReports(index) {
		this.navCtrl.push(ReorderReportsPage, { tabIndex: index, callback: this.reorderReportsCallback.bind(this) });
	}

	public reorderReportsCallback(tab, index) {
		this.tabs[index] = tab;
		this.tabs[index].new = 0;
		this.project.tabs = this.tabs;
		this.projectsService.setProject(this.project);
	}

	private deleteProject() {
		this.translateService.get(['REORDER_TABS.DIALOG_TITLE', 'REORDER_TABS.DIALOG_MSG', 'REORDER_TABS.CONFIRM', 'REORDER_TABS.CANCEL']).subscribe(
			msg => {
				let alert = this.alertCtrl.create({
					title: msg['REORDER_TABS.DIALOG_TITLE'],
					message: msg['REORDER_TABS.DIALOG_MSG'],
					buttons: [
						{
							text: msg['REORDER_TABS.CANCEL'],
							role: 'cancel',
							handler: () => {
							}
						},
						{
							text: msg['REORDER_TABS.CONFIRM'],
							handler: () => {
								let loading = this.loadingCtrl.create({});
								loading.present();
								this.projectsService.removeProjectSettings(this.sessionService.projectId)
									.subscribe(res => {
										loading.dismiss();
										this.mingle.getUserData('projects')
											.subscribe((projectList: any) => {
												if (projectList.projects.length > 0) {
													this.app.getRootNav().setRoot(ReloadProject);
												} else {
													this.app.getRootNav().setRoot(ConfigPage);
												}
											});

										this.navCtrl.setRoot(ReloadProject);
									}, error => {
										loading.dismiss();
										this.translateService.get('REORDER_TABS.REMOVE_ERROR')
											.subscribe(msg => {
												this.showToast(msg);
											});
									});
							}
						}
					]
				});
				alert.present();

			});
	}

	showToast(msg: string) {
		// value is our translated string
		let toast = this.toastCtrl.create({
			message: msg,
			duration: 5000,
			cssClass: 'error',
			position: 'top',
			closeButtonText: 'Ok',
			showCloseButton: true
		});
		toast.present(toast);
	}

}
