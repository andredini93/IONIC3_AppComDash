import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { ConfigPage } from '../config/config'
import { SelectAppPage } from '../select-app/select-app';
import { ProjectsService} from '../../providers/projects.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from 'ionic-angular';

@Component({
  selector: 'page-select-project',
  templateUrl: 'select-project.html',
})

export class SelectProjectPage {
  projects: any [];
  selectedProject: any ;
  configuredProjects:any[];
  nextButton:string;

  constructor(
      public navCtrl: NavController, 
      public navParams: NavParams, 
      public projectsServ:ProjectsService,
      private translate: TranslateService,
      public alertCtrl: AlertController,
      private loadingCtrl: LoadingController,
      private toastCtrl: ToastController
  )
  {
      this.translate.get('COMMOM.NEXT').subscribe(
          msg => {
              this.nextButton = msg;
          }
      );
      this.configuredProjects = this.navParams.get('configuredProjects');
  }

  ionViewDidLoad(){
    let loader = this.loadingCtrl.create({
		});

    loader.present();

    this.projectsServ.getProjects().subscribe(
      projects =>{
        this.projects = projects;
        if(this.configuredProjects){
            let projetsFiltred = [];
            for(let proj of projects){
                let p = this.configuredProjects.filter(
                    item => {return item.id === proj.id}
                );
                if(p.length < 1){
                  projetsFiltred.push(proj);
                }
            }
            this.projects = projetsFiltred;
        }

        loader.dismiss();
      }, 
      error => {
        loader.dismiss();
        this.showErrorToast();
      }
    );
  }

  showErrorToast() {
    this.translate.get('COMMOM.ERROR').subscribe(
      value => {
        // value is our translated string
        let toast = this.toastCtrl.create({
          message: value,
          duration: 3000,
          cssClass:'error',
		  position: 'top',
		  closeButtonText: 'Ok',
		  showCloseButton: true
        });
        toast.present(toast);
      }
    )
  }

  nextPage(){
    let project = this.projects.find(
        project => {
          return project.id === this.selectedProject;
        }
    );
    this.selectedProject ? this.navCtrl.push(SelectAppPage,{project:project}) : '';
  }

}

