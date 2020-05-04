import { Component } from '@angular/core';
import {  NavController, NavParams } from 'ionic-angular';
import{ SelectProjectPage } from '../select-project/select-project';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'page-config',
  templateUrl: 'config.html',
})
export class ConfigPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,private translate: TranslateService) {
  }

  ionViewDidLoad() {
  }


  goToConfig(){
    this.navCtrl.push(SelectProjectPage)
  }
}
