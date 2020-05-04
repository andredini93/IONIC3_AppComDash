import { IonicStorageModule } from '@ionic/storage';
import { SessionService } from './session.service';
import { HttpService } from './http.service';
import { TestBed } from "@angular/core/testing";
import { StorageService } from "./storage.service";
import { ReportService } from "./report.service";

describe('ReportService ', () => {

  let reportService;

  class MockDefault {

  }
  beforeEach(() => {
    const storageStub = {
      get: key => ({}),
      ready: () => ({ then: () => ({}) }),
      set: (key, value) => ({}),
      remove: key => ({}),
      keys: () => ({ find: () => ({}) })
    };
    TestBed.configureTestingModule({
		imports: [IonicStorageModule.forRoot()],
      providers: [
		  {provide: HttpService, useClass: MockDefault},
		  {provide: SessionService, useClass: MockDefault},
		  { provide: StorageService, useClass: StorageService},
		  ReportService
		 ]
    });
    reportService = TestBed.get(StorageService);
  });
  it('can load instance', () => {
    expect(reportService).toBeTruthy();
  });
});
