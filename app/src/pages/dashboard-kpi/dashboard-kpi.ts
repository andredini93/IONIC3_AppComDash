import { Component, OnInit, AfterContentInit, ElementRef } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { InAppBrowser, InAppBrowserOptions, InAppBrowserEvent } from '@ionic-native/in-app-browser';
import { LoginService } from '../../providers/login.service';
import { DomSanitizer } from '@angular/platform-browser';
import { SessionService } from '../../providers/session.service';

declare var FuncaoTeste;

@Component({
  templateUrl: 'dashboard-kpi.html',
})
export class DashboardKpiPage implements OnInit, AfterContentInit{

  URL_: any;

  constructor(public navCtrl: NavController, 
              public navParams: NavParams,
              private _sanitizer: DomSanitizer,
              private inappbrowser: InAppBrowser,
              private _sessioService: SessionService,
              private loginService: LoginService) {
                
  }
  ngAfterContentInit(): void {
    
  }
  ngOnInit(): void {
    document.cookie = "GDCAuthSST=" + this._sessioService.TOKEN_SST;
    this.URL_ = this._sanitizer.bypassSecurityTrustResourceUrl('https://analytics.totvs.com.br/dashboards/embedded/#/project/p25mdfc7x86riaqqzxjpqjezzpktqs5r/dashboard/aenEsRP8aBL8');
    
    
    
    //https://localhost:5050/dashboard.html#project=/gdc/projects/py3vi2nuetwdrviur27c2yja99dx0dz9&dashboard=/gdc/md/py3vi2nuetwdrviur27c2yja99dx0dz9/obj/21717';
  }

  
}
