import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content } from 'ionic-angular';

import { ProjectsService } from '../../providers/projects.service';

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage {
  title:string;
  reports:any[]=[];
  @ViewChild(Content) content: Content;
  constructor(public navCtrl: NavController,private params: NavParams, private projectsService:ProjectsService) {

  }

  ionViewDidLoad() {
    let tab = this.params.data;
    this.title = tab.title.replace('#Mobile ','');
    tab.reports = tab.reports.filter(
      report =>{
          return report.visible
        }
    );
    this.reports = tab.reports;
  }

  removeReport(ev){
      this.reports.splice(this.reports.indexOf(ev),1);
      this.params.data.reports = this.reports;
      this.projectsService.updateTabReport(this.params.data).then(
          ()=>{
          }
      ).catch(
        (err) =>{
          console.log(err);
        }
      );
    }

    hideReport(ev){
        this.reports.splice(this.reports.indexOf(ev),1);
    }

}
