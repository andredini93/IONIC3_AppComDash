import { TestBed } from '@angular/core/testing';
import { MingleService } from '@totvs/mobile-mingle';
import { Storage } from '@ionic/storage';
import { HttpService } from './http.service';
import { SessionService } from './session.service';
import { ProjectsService } from './projects.service';
describe('ProjectsService', () => {
  let service: ProjectsService;
  beforeEach(() => {
    const mingleServiceStub = {
      getUserData: string => ({ subscribe: () => ({}), flatMap: () => ({}) }),
      saveUserData: (string, projectList) => ({
        subscribe: () => ({}),
        toPromise: () => ({})
      })
    };
    const storageStub = {
      set: (string, project) => ({ then: () => ({}) }),
      get: string => ({ then: () => ({}) })
    };
    const httpServiceStub = { get: (url, object) => ({ map: () => ({}) }) };
    const sessionServiceStub = { USER_ID: {} };
    TestBed.configureTestingModule({
      providers: [
        ProjectsService,
        { provide: MingleService, useValue: mingleServiceStub },
        { provide: Storage, useValue: storageStub },
        { provide: HttpService, useValue: httpServiceStub },
        { provide: SessionService, useValue: sessionServiceStub }
      ]
    });
    service = TestBed.get(ProjectsService);
  });
  it('can load instance', () => {
    expect(service).toBeTruthy();
  });
  describe('getProjects', () => {
    it('makes expected calls', () => {
      const httpServiceStub: HttpService = TestBed.get(HttpService);
      spyOn(httpServiceStub, 'get').and.callThrough();
      service.getProjects();
      expect(httpServiceStub.get).toHaveBeenCalled();
    });
  });
  describe('getSavedProject', () => {
    it('makes expected calls', () => {
      const storageStub: Storage = TestBed.get(Storage);
      spyOn(storageStub, 'get').and.callThrough();
      service.getSavedProject();
      expect(storageStub.get).toHaveBeenCalled();
    });
  });
});
