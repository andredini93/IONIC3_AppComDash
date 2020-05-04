import { IonicStorageModule } from '@ionic/storage';
import { MingleService } from '@totvs/mobile-mingle';
import { LoginService } from './../../providers/login.service';
import { LoadingController, NavController, ToastController, App } from 'ionic-angular';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginPage } from './login';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

xdescribe('LoginPage', () => {
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
			  TranslateModule.forRoot(),
        	  CommonModule

			],
	providers: [
		{provide: App, Useclass: MockDefault },
		{provide: FormBuilder, Useclass: MockFormGroup },
		{provide: LoadingController, Useclass: MockDefault },
		{provide: LoginService, Useclass: MockDefault },
		{provide: MingleService, Useclass: MockDefault },
		{provide: NavController, Useclass: MockDefault },
		{provide: ToastController, Useclass: MockDefault },
		{provide: TranslateService, Useclass: MockDefault },
		LoginPage
	]
    })
    
  }));

  beforeEach(() => {
    login = TestBed.get(LoginPage);

  });

  it('should create', () => {
    expect(login).toBeTruthy();
  });
});