import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { ProjectsService } from '../../providers/projects.service';
import { DashboardPage } from './dashboard';
describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;
  beforeEach(() => {
    const navControllerStub = {};
    const navParamsStub = {
      data: { title: { replace: () => ({}) }, reports: { filter: () => ({}) } }
    };
    const projectsServiceStub = {
      updateTabReport: data => ({ then: () => ({ catch: () => ({}) }) })
    };
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [DashboardPage],
      providers: [
        { provide: NavController, useValue: navControllerStub },
        { provide: NavParams, useValue: navParamsStub },
        { provide: ProjectsService, useValue: projectsServiceStub }
      ]
    });
    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
  });
  it('can load instance', () => {
    expect(component).toBeTruthy();
  });

});
