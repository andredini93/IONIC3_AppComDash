import { TestBed } from '@angular/core/testing';
import { Globalization } from '@ionic-native/globalization';
import { TranslateService } from '@ngx-translate/core';
import { GeolocationService } from './geolocation.service';
describe('GeolocationService', () => {
  let service: GeolocationService;
  beforeEach(() => {
    const globalizationStub = {
      getPreferredLanguage: () => ({ then: () => ({ catch: () => ({}) }) })
    };
    const translateServiceStub = {
      setDefaultLang: string => ({}),
      use: arg => ({})
    };
    TestBed.configureTestingModule({
      providers: [
        GeolocationService,
        { provide: Globalization, useValue: globalizationStub },
        { provide: TranslateService, useValue: translateServiceStub }
      ]
    });
    service = TestBed.get(GeolocationService);
  });
  it('can load instance', () => {
    expect(service).toBeTruthy();
  });

});
