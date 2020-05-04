import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { SelectReportPage } from '../select-report/select-report';
import { AppService } from '../../providers/app.service';
import { ReportsService } from '../../providers/reports.service';


@Component({
    selector: 'page-select-app',
    templateUrl: 'select-app.html',

})
export class SelectAppPage {
    project: any;
    apps: any[];
    selectedApps: any[];
    nextButton:string;
    private hasSelected: boolean;

    constructor(
        public nvCtrl: NavController,
        public navParams: NavParams,
        private translate: TranslateService,
        private appService: AppService,
        private reportService: ReportsService,
        private loadingCtrl: LoadingController,
        private toastCtrl: ToastController
    ) {
        this.project = this.navParams.get('project');
        this.translate.get('COMMOM.NEXT').subscribe(
            msg => {
                this.nextButton = msg;
            }
        );
    }

    ionViewDidLoad() {
        let loader = this.loadingCtrl.create({
        });
    
        loader.present();

        this.appService.getAppsByProject(this.project.id).subscribe(
            res => {
                if(res.length > 0){
                    this.apps = res;
                    this.apps = this.apps.map(
                        app => {
                            app.visible = true;
                            app.reports = [];
                            return app;
                    });
                    this.hasSelected = true;
                }else{
                    this.apps = [];
                    this.hasSelected = false;
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
                    cssClass:'error',
                    duration: 3000,
					position: 'top',
					closeButtonText: 'Ok',
					showCloseButton: true
                });
                toast.present(toast);
            }
        )
    }

    toggle(appItem) {
        appItem.visible = !appItem.visible;
    }
    checkNextPage() {
        let hasSelected =false;
        for (let app of this.apps) {
            app.visible ? hasSelected = true: '';
        }
        hasSelected ? this.hasSelected = true : this.hasSelected = false;
    }

    nextPage() {
        this.project['apps'] = this.apps;
        this.nvCtrl.push(SelectReportPage, { project: this.project });
    }

}

