import { SessionService } from './session.service';
import { HttpClient } from '@angular/common/http';
import { IonicStorageModule } from '@ionic/storage';
import { MingleService } from '@totvs/mobile-mingle';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LoginService } from './login.service';


describe('LoginPage', () => {
  let login; 

  class MockDefault {

	
  }
  class MockFormGroup {
	group() {
		
	}
  }
  beforeEach(async(() => {
    TestBed.configureTestingModule({
	imports: [IonicStorageModule.forRoot(),
			  TranslateModule.forRoot()
			],

	providers: [
		{provide: HttpClient, Useclass: MockDefault },
		{provide: MingleService, Useclass: MockDefault },
		{provide: SessionService, Useclass: MockDefault },
		LoginService
	]
    })
    
  }));

  beforeEach(() => {
    login = TestBed.get(LoginService);

  });

  it('should create', () => {
    expect(login).toBeTruthy();
  });
});