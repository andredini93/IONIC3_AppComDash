import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import { Config } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { GeolocationService } from '../providers/geolocation.service';
import { SessionService } from '../providers/session.service';
import { LoginService } from '../providers/login.service';
import { ProjectsService } from '../providers/projects.service';
import { MingleService } from '@totvs/mobile-mingle';
import { AppReviewService } from '../providers/app.review';
import { Storage, IonicStorageModule } from '@ionic/storage';
import { MyApp } from './app.component';
describe('App component ', () => {
  let component: MyApp;
  let fixture: ComponentFixture<MyApp>;
  beforeEach(() => {
    const translateServiceStub = { get: array => ({ subscribe: () => ({}) }) };
    const platformStub = { ready: () => ({}) };
    const configStub = { set: (string, string1, arg) => ({}) };
    const statusBarStub = {
      backgroundColorByName: string => ({}),
      styleDefault: () => ({})
    };
    const splashScreenStub = { hide: () => ({}) };
    const geolocationServiceStub = { config: () => ({}) };
    const sessionServiceStub = {
      initSession: () => ({}),
      TOKEN_TT: {},
      userAgent: {},
      clear: () => ({ then: () => ({}) }),
      projectId: {},
      projectName: {}
    };
    const loginServiceStub = {
      refreshToken: () => ({ toPromise: () => ({}) })
    };
    const projectsServiceStub = {
      getSavedProject: () => ({ id: {}, name: {} })
    };
    const mingleServiceStub = {
      registerAnalyticsToken: (tOKEN_TT, userAgent) => ({}),
      init: () => ({ toPromise: () => ({}) }),
      auth: { logout: () => ({ subscribe: () => ({}) }) },
      getUserData: string => ({ toPromise: () => ({ length: {} }) }),
      getUser: () => ({ subscribe: () => ({}) }),
      getSessionInfo: () => ({ user: {} })
    };
    const appReviewServiceStub = {};
    const storageStub = {};
    TestBed.configureTestingModule({
		imports: [IonicStorageModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [MyApp],
      providers: [
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: Platform, useValue: platformStub },
        { provide: Config, useValue: configStub },
        { provide: StatusBar, useValue: statusBarStub },
        { provide: SplashScreen, useValue: splashScreenStub },
        { provide: GeolocationService, useValue: geolocationServiceStub },
        { provide: SessionService, useValue: sessionServiceStub },
        { provide: LoginService, useValue: loginServiceStub },
        { provide: ProjectsService, useValue: projectsServiceStub },
        { provide: MingleService, useValue: mingleServiceStub },
        { provide: AppReviewService, useValue: appReviewServiceStub },
        { provide: Storage, useValue: storageStub }
      ]
    });
    fixture = TestBed.createComponent(MyApp);
    component = fixture.componentInstance;
  });
  it('can load instance', () => {
    expect(component).toBeTruthy();
  });
});
