import { AppLaunchReview } from './../../providers/app.launch-review';
import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { ProjectsService } from '../../providers/projects.service';
import { DashboardPage } from '../dashboard/dashboard';
import { SuperTabsController } from 'ionic2-super-tabs';
import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { TranslateService } from '@ngx-translate/core';
import { AppReviewService } from '../../providers/app.review';
import { Observable } from 'rxjs/Observable'
import { timer } from 'rxjs/observable/timer';
@Component({
	selector: 'page-home',
	templateUrl: 'home.html',
})
export class HomePage {
	project: any;
	scrollableTabsopts: any = {};
	dashboardPage: any = DashboardPage;

	tabsColor: string = "default";
	tabsMode: string = "md";
	tabsPlacement: string = "top";

	tabs: any[] = [];
	config = {
		dragThreshold: 40,
		maxDragAngle: 15
	}

	private _rateTimer;

	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		private projectsService: ProjectsService,
		private superTabsCtrl: SuperTabsController,
		private platform: Platform,
		private _alertCtrl: AlertController,
		private _translateService: TranslateService,
		private _appReview: AppReviewService,
		private _appLaunch: AppLaunchReview,
	) {

	}

	ionViewWillEnter() {
		this.platform.registerBackButtonAction(() => {
			this.confirmLeave();
		}, 300);

	}

	ionViewDidLoad() {
		this.projectsService.getSavedProject().then(
			project => {
				this.project = project;
				for (let tab of this.project.tabs) {
					if (tab.visible) {
						this.tabs.push(tab);
					}
				}
				let rateTimer = timer(12000);
				this._rateTimer = rateTimer.subscribe(()=>{
					this._appReview.rate();
				})
			}
		).catch(
			() => {

			});
	}

	ionViewWillLeave() {
		this.platform.registerBackButtonAction(() => {
			if (this.navCtrl.canGoBack())
				this.navCtrl.pop();
		}, 300);
		this._rateTimer.unsubscribe();
	}

	refreshScrollbarTabs() {
		this.scrollableTabsopts = { refresh: true };
	}

	private confirmLeave() {
		this._translateService.get(['COMMOM.LEAVE_TITLE', 'COMMOM.LEAVE_MSG', 'COMMOM.LEAVE_CONFIRM', 'COMMOM.CANCEL']).subscribe(values => {
			let alert = this._alertCtrl.create({
				title: values['COMMOM.LEAVE_TITLE'],
				message: values['COMMOM.LEAVE_MSG'],
				buttons: [
					{
						text: values['COMMOM.CANCEL'],
						role: 'cancel',
						handler: () => {
							this.platform.registerBackButtonAction(() => {
								this.confirmLeave();
							}, 300);
						}
					},
					{
						text: values['COMMOM.LEAVE_CONFIRM'],
						handler: () => {
							this.platform.exitApp();
						}
					}
				]
			});
			this.platform.registerBackButtonAction(() => {
				this.platform.registerBackButtonAction(() => {
					this.confirmLeave();
				}, 300);
				alert.dismiss();
			}, 300);
			alert.present();
		});
	}

}
