import { SessionService } from './../../providers/session.service';
import { SelectProjectPage } from './../select-project/select-project';
import { MenuPage } from './../menu/menu';
import { ProjectsService } from './../../providers/projects.service';
import { MingleService } from '@totvs/mobile-mingle';
import { Component } from '@angular/core';
import { NavController, NavParams, Platform, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';


@Component({
	selector: 'page-reload-project',
	templateUrl: 'reload-project.html',
})
export class ReloadProject {
	selectedProject: string;
	projectList: any;
	showLogo = true;
	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		private mingle: MingleService,
		private projectsService: ProjectsService,
		private loadingCtrl: LoadingController,
		private sessionService: SessionService,
		private platform: Platform,
		private translate: TranslateService
	) {
		let showLogo = this.navParams.get('showLogo');
		if (showLogo || showLogo === undefined)
			this.showLogo = true;
		else {
			this.showLogo = false;
		}
	}
	ionViewWillEnter() {
		if (!this.showLogo) {
			this.platform.registerBackButtonAction(() => {
				this.navCtrl.pop();
			}, 300);
		}
	}

	ionViewDidLoad() {
		let loader = this.loadingCtrl.create({});
		setTimeout(() => {
			loader.present();
		}, 200);
		this.mingle.getUserData('projects')
			.subscribe((projectList: any) => {
				this.projectList = projectList.projects.reduce((a, b) => {
					if (a.map(i => i.id).indexOf(b.id) < 0) a.push(b);
					return a;
				}, []);
				setTimeout(() => {
					loader.dismiss();
				}, 200);
			}, error => {
				setTimeout(() => {
					loader.dismiss();
				}, 200);
			});
	}

	reloadProject() {
		if (this.projectList) {
			let loader = this.loadingCtrl.create({});
			loader.present();
			this.mingle.getUserData(this.selectedProject)
				.subscribe((project: any) => {
					this.projectsService.setProject(project).then(
						() => {
							this.sessionService.projectId = project.id;
							this.sessionService.projectName = project.name;
							loader.dismiss();
							this.navCtrl.setRoot(MenuPage);
						}
					);
				}, error => {
					loader.dismiss();
				});
		}
	}

	setNewProject() {
		this.navCtrl.push(SelectProjectPage, { configuredProjects: this.projectList });
	}

	ionViewWillLeave() {
		this.platform.registerBackButtonAction(() => {
			if (this.navCtrl.canGoBack())
				this.navCtrl.pop();
		}, 300);
	}
}
