import { ReactiveFormsModule } from '@angular/forms';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NavController } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ConfigPage } from './config';
describe('ConfigPage', () => {
  let component: ConfigPage;
  let fixture: ComponentFixture<ConfigPage>;
  beforeEach(() => {
    const navControllerStub = { push: selectProjectPage => ({}) };
    const navParamsStub = {};
    const translateServiceStub = {};
    TestBed.configureTestingModule({
	  imports: [ReactiveFormsModule, TranslateModule],
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ConfigPage],
      providers: [
        { provide: NavController, useValue: navControllerStub },
        { provide: NavParams, useValue: navParamsStub },
        { provide: TranslateService, useValue: translateServiceStub }
      ]
    });
    fixture = TestBed.createComponent(ConfigPage);
    component = fixture.componentInstance;
  });
  it('can load instance', () => {
    expect(component).toBeTruthy();
  });
  describe('goToConfig', () => {
    it('makes expected calls', () => {
      const navControllerStub: NavController = fixture.debugElement.injector.get(
        NavController
      );
      spyOn(navControllerStub, 'push').and.callThrough();
      component.goToConfig();
      expect(navControllerStub.push).toHaveBeenCalled();
    });
  });
});
