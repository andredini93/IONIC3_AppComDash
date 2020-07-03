import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, Provider } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { UserAgent } from '@ionic-native/user-agent';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { MyApp } from './app.component';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Storage } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage';

//MODULES
import { SuperTabsModule } from 'ionic2-super-tabs';
import { ChartsModule } from 'ng2-charts';
import { MomentModule } from 'angular2-moment';
import { MingleModule, Configuration, MingleHttpInterceptor } from '@totvs/mobile-mingle'

//PAGES
import { LoginPage } from '../pages/login/login';
import { MenuPage } from '../pages/menu/menu';
import { HomePage } from '../pages/home/home';
import { ConfigPage } from '../pages/config/config';
import { SelectProjectPage } from '../pages/select-project/select-project';
import { SelectAppPage } from '../pages/select-app/select-app';
import { SelectReportPage } from '../pages/select-report/select-report';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { ReorderTabsPage } from '../pages/reorder-tabs/reorder-tabs';
import { ReorderReportsPage } from '../pages/reorder-reports/reorder-reports';
import { ReloadProject } from '../pages/reload-project/reload-project';
import { DashboardKpiPage } from '../pages/dashboard-kpi/dashboard-kpi';


//COMPONENTS
import { ThfToolbarComponent } from '../shared/thf-toolbar/thf-toolbar.component';
import { ScrollableTabs } from '../shared/scrollable-tabs/scrollable-tabs';
import { ReportGeneratorComponent, PopoverPage, ModalTable } from '../shared/report-generator/report-generator';


//SERVICES
import { GeolocationService } from '../providers/geolocation.service';
import { LoginService } from '../providers/login.service';
import { ProjectsService } from '../providers/projects.service';
import { AppService } from '../providers/app.service';
import { SessionService } from '../providers/session.service';
import { HttpService } from '../providers/http.service';
import { ReportsService } from '../providers/reports.service';
import { ReportService } from '../providers/report.service';
import { StorageService } from '../providers/storage.service';
import { AppLaunchReview } from './../providers/app.launch-review';
import { AppReviewService } from '../providers/app.review';



//IONIC NATIVE SERVICES
import { Globalization } from '@ionic-native/globalization';
import { Geolocation } from '@ionic-native/geolocation';
import { Device } from '@ionic-native/device';
import { SocialSharing } from '@ionic-native/social-sharing';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { EmailComposer } from '@ionic-native/email-composer';
import { AppRate } from '@ionic-native/app-rate';
import { LaunchReview } from '@ionic-native/launch-review';
import { HttpsRequestInterceptor } from '../intercept/interceptor.module';


export function createTranslateLoader(http: HttpClient) {
	return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

declare const webpackGlobalVars: any;
export function configFactory() {
	let config = new Configuration();
	config.app_identifier = webpackGlobalVars.APP_ID;
	config.environment = webpackGlobalVars.ENV;
	config.server = webpackGlobalVars.SERVER_ADDRESS;
	config.modules.crashr = false;
	config.modules.usage_metrics = true;
	config.modules.gateway = true;
	config.modules.push_notification = false;
	config.modules.user_data = true;
	config.modules.ocr = false;
	return config;
}

@NgModule({
	declarations: [
		MyApp,
		LoginPage,
		SelectProjectPage,
		HomePage,
		ConfigPage,
		SelectAppPage,
		SelectReportPage,
		ThfToolbarComponent,
		MenuPage,
		ScrollableTabs,
		DashboardPage,
		ReorderTabsPage,
		PopoverPage,
		ReorderReportsPage,
		ReloadProject,
		ModalTable,
		DashboardKpiPage,
		ReportGeneratorComponent
	],
	imports: [
		IonicStorageModule.forRoot(),
		SuperTabsModule.forRoot(),
		BrowserModule,
		HttpClientModule,
		MomentModule,
		MingleModule.forRoot({
			provide: Configuration,
			useFactory: configFactory
		}),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: createTranslateLoader,
				deps: [HttpClient]
			}
		}),
		IonicModule.forRoot(MyApp, {
			mode: 'md'
		}),
		ChartsModule
	],
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp,
		LoginPage,
		MenuPage,
		SelectProjectPage,
		HomePage,
		ConfigPage,
		SelectAppPage,
		SelectReportPage,
		DashboardPage,
		PopoverPage,
		ReorderTabsPage,
		ModalTable,
		ReloadProject,
		DashboardKpiPage,
		ReorderReportsPage
	],
	providers: [
		StatusBar,
		SplashScreen,
		Globalization,
		Device,
		GeolocationService,
		SocialSharing,
		LoginService,
		PhotoLibrary,
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
		SQLite,
		EmailComposer,
		Geolocation,
		ProjectsService,
		AppService,
		SessionService,
		HttpService,
		ReportsService,
		ReportService,
		StorageService,
		AppReviewService,
		AppRate,
		LaunchReview,
		AppLaunchReview,
		// {
		// 	provide: HTTP_INTERCEPTORS,
		// 	useClass: HttpsRequestInterceptor,
		// 	multi: true
		// },
		UserAgent,
		InAppBrowser
	]
})
export class AppModule { }
