import { TestBed } from '@angular/core/testing';
import { HttpService } from './http.service';
import { ReportsService } from './reports.service';
describe('ReportsService', () => {
  let service: ReportsService;
  beforeEach(() => {
    const httpServiceStub = {
      get: (url, object) => ({
        retry: () => ({ map: () => ({ retry: () => ({}) }) })
      })
    };
    TestBed.configureTestingModule({
      providers: [
        ReportsService,
        { provide: HttpService, useValue: httpServiceStub }
      ]
    });
    service = TestBed.get(ReportsService);
  });
  it('can load instance', () => {
    expect(service).toBeTruthy();
  });
});
