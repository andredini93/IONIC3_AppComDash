import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage';
import { StorageService } from './storage.service';
describe('StorageService', () => {
  let service: StorageService;
  beforeEach(() => {
    const storageStub = {
      get: key => ({}),
      ready: () => ({ then: () => ({}) }),
      set: (key, value) => ({}),
      remove: key => ({}),
      keys: () => ({ find: () => ({}) })
    };
    TestBed.configureTestingModule({
      providers: [StorageService, { provide: Storage, useValue: storageStub }]
    });
    service = TestBed.get(StorageService);
  });
  it('can load instance', () => {
    expect(service).toBeTruthy();
  });
});
