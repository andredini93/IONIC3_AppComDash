import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { App } from 'ionic-angular';
import { NavController } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { ThfToolbarComponent } from './thf-toolbar.component';
describe('ThfToolbarComponent', () => {
  let component: ThfToolbarComponent;
  let fixture: ComponentFixture<ThfToolbarComponent>;
  beforeEach(() => {
    const appStub = {};
    const navControllerStub = {
      viewDidLoad: { subscribe: () => ({}) },
      canGoBack: () => ({})
    };
    const modalControllerStub = {};
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
      declarations: [ThfToolbarComponent],
      providers: [
        { provide: App, useValue: appStub },
        { provide: NavController, useValue: navControllerStub },
        { provide: ModalController, useValue: modalControllerStub }
      ]
    });
    fixture = TestBed.createComponent(ThfToolbarComponent);
    component = fixture.componentInstance;
  });
  it('can load instance', () => {
    expect(component).toBeTruthy();
  });
  it('showMenu defaults to: false', () => {
    expect(component.showMenu).toEqual(false);
  });
  it('buttonDisabled defaults to: false', () => {
    expect(component.buttonDisabled).toEqual(false);
  });
  it('showShadow defaults to: true', () => {
    expect(component.showShadow).toEqual(true);
  });
  it('showLogo defaults to: false', () => {
    expect(component.showLogo).toEqual(false);
  });
  describe('ngOnInit', () => {
    it('makes expected calls', () => {
      const navControllerStub: NavController = fixture.debugElement.injector.get(
        NavController
      );
      spyOn(navControllerStub, 'canGoBack').and.callThrough();
      component.ngOnInit();
      expect(navControllerStub.canGoBack).toHaveBeenCalled();
    });
  });
});
