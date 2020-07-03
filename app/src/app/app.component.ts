import { Component, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Http, HttpModule } from '@angular/http';
import { first } from 'rxjs/operators';
import 'rxjs/add/operator/toPromise';

//IONIC
import { Platform, Config, NavController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//PAGES
import { LoginPage } from '../pages/login/login';
import { ProjectListPage } from '../pages/project-list/project-list';
import { HomePage } from '../pages/home/home';
import { MenuPage } from '../pages/menu/menu';
import { ConfigPage } from '../pages/config/config';
import { SelectApkPage } from '../pages/select-apk/select-apk';

//SERVICES
import { GeolocationService } from '../providers/geolocation.service';
import { ConfigService } from '../services/config.service';
import { SessionService } from '../providers/session.service';
import { LoginService } from '../providers/login.service';
import { ProjectsService } from '../providers/projects.service';
import { MingleService } from '@totvs/mobile-mingle'
import { AppReviewService } from '../providers/app.review';

import { ReloadProject } from '../pages/reload-project/reload-project';
import { Storage } from '@ionic/storage';
import { DashboardKpiPage } from '../pages/dashboard-kpi/dashboard-kpi';


@Component({
	templateUrl: 'app.html'
})
export class MyApp {
	rootPage: any;
	@ViewChild('nav') nav: NavController;

	constructor(
		private _config: Config,
		private _geolocationService: GeolocationService,
		private _loginService: LoginService,
		private _mingleService: MingleService,
		private _platform: Platform,
		private _projectsService: ProjectsService,
		private _sessionService: SessionService,
		private _splashScreen: SplashScreen,
		private _statusBar: StatusBar,
		private _translateService: TranslateService, 
		private _storageService: Storage,
		private _appReview: AppReviewService //necessario para inicializacao do app Review
	) {
		this._init();
	}

	private async _init() {
		await this._platform.ready();
			
		//configura i18n
		this._geolocationService.config();

		this._translateService.get(['COMMOM.BACK_BUTTON'])
			.subscribe(values => {
				this._config.set('ios', 'backButtonText', values['COMMOM.BACK_BUTTON']);
			});

		// this._statusBar.overlaysWebView(false);
		this._statusBar.backgroundColorByName("white");
		this._statusBar.styleDefault();

		try {
			//verifica se o TOKEN SST e o USER_ID estão salvos e se deveria iniciar a sessão ou refazer o login
			await this._sessionService.initSession();
			//refresh do token TT (GoodData)
			await this._loginService.refreshToken().toPromise();
			// Listen to mingle user sign out
			this._mingleService.registerAnalyticsToken(this._sessionService.TOKEN_TT, this._sessionService.userAgent);

			// Init mingle service
			await this._mingleService.init().toPromise();
			this._listenMingleSignOut();
			await this._getSavedProject();
		} catch(error){
			this._mingleService.auth.logout().subscribe();
			this._sessionService.clear();
			await this._mingleService.init().toPromise();
			this.rootPage = LoginPage;
			console.error(error);
		} finally {
			this._splashScreen.hide();
		}
	}

	private async _getSavedProject() {
		try {
			let project = await this._projectsService.getSavedProject();
	
			this._sessionService.projectId = project.id;
			this._sessionService.projectName = project.name;
			this.rootPage = MenuPage;
		} catch(error) {
			let projects = await this._mingleService.getUserData('projects').toPromise();

			if (Object.keys(projects).length === 0 || projects['projects'].length === 0) {
				this.rootPage = ConfigPage;
			} else {
				this.rootPage = ReloadProject;
			}
		}
	}

	private generateExecId() {
		var id = 0;
		var date = new Date();
		id = date.getTime();
		return id;
	}

	private _listenMingleSignOut() {
		// Se Usuário do mingle está == undefined
        this._mingleService.getUser()
            .subscribe(user => {
				// Se não há dados de sessão no mingle
				let test = this._mingleService.getSessionInfo().user;
				// Se nao há usuario nem dados de sssão = mingle já rolou o sign out
				if (!user && !test) {
					// Limpar os dados da sessão do good data
					this._sessionService.clear()
						.then(() => {
							//exibir mensagem para o usuário e voltar para tela de login
							this.nav.setRoot(LoginPage);
						});
				}
			}, err => {
				console.log(err)
			});
	}
}