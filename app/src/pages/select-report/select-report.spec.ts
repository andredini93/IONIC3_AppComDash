import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MingleService } from '@totvs/mobile-mingle';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { ToastController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../providers/app.service';
import { ReportsService } from '../../providers/reports.service';
import { ProjectsService } from '../../providers/projects.service';
import { SessionService } from '../../providers/session.service';
import { SelectReportPage } from './select-report';
describe('SelectReportPage', () => {
  let component: SelectReportPage;
  let fixture: ComponentFixture<SelectReportPage>;
  beforeEach(() => {
    const mingleServiceStub = { registerMetric: (string, object) => ({}) };
    const navControllerStub = { setRoot: menuPage => ({}) };
    const navParamsStub = { get: string => ({}) };
    const toastControllerStub = {
      create: object => ({ onDidDismiss: () => ({}), present: () => ({}) })
    };
    const loadingControllerStub = {
      create: object => ({ present: () => ({}), dismiss: () => ({}) })
    };
    const translateServiceStub = { get: array => ({ subscribe: () => ({}) }) };
    const appServiceStub = {};
    const reportsServiceStub = {
      getReportsList: id => ({ subscribe: () => ({}) }),
      getReportsByApp: link => ({})
    };
    const projectsServiceStub = {
      addProject: project => ({ subscribe: () => ({}) })
    };
    const sessionServiceStub = { projectId: {}, projectName: {} };
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [SelectReportPage],
      providers: [
        { provide: MingleService, useValue: mingleServiceStub },
        { provide: NavController, useValue: navControllerStub },
        { provide: NavParams, useValue: navParamsStub },
        { provide: ToastController, useValue: toastControllerStub },
        { provide: LoadingController, useValue: loadingControllerStub },
        { provide: TranslateService, useValue: translateServiceStub },
        { provide: AppService, useValue: appServiceStub },
        { provide: ReportsService, useValue: reportsServiceStub },
        { provide: ProjectsService, useValue: projectsServiceStub },
        { provide: SessionService, useValue: sessionServiceStub }
      ]
    });
    fixture = TestBed.createComponent(SelectReportPage);
    component = fixture.componentInstance;
  });
  it('can load instance', () => {
    expect(component).toBeTruthy();
  });
  it('reports defaults to: []', () => {
    expect(component.reports).toEqual([]);
  });
  it('selectedReports defaults to: []', () => {
    expect(component.selectedReports).toEqual([]);
  });
  it('rawReports defaults to: []', () => {
    expect(component.rawReports).toEqual([]);
  });
  it('hiddenReports defaults to: []', () => {
    expect(component.hiddenReports).toEqual([]);
  });
  it('hiddenTabs defaults to: []', () => {
    expect(component.hiddenTabs).toEqual([]);
  });

});
