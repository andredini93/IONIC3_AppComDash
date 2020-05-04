import { MingleService } from '@totvs/mobile-mingle';
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides, ToastController, LoadingController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { AppService } from '../../providers/app.service';
import { ReportsService } from '../../providers/reports.service';
import { ProjectsService } from '../../providers/projects.service';
import { Observable } from 'rxjs/Observable';
import { SelectReportOrderPage } from '../select-report-order/select-report-order';
import { MenuPage } from '../menu/menu';
import { SessionService } from '../../providers/session.service';
import { Loading } from 'ionic-angular/components/loading/loading';

@Component({
    selector: 'page-select-report',
    templateUrl: 'select-report.html',

})
export class SelectReportPage {
    project: any;
    apps: any[];
    currentSlide;
    reports: any[] = [];
    validator: any[];
    selectedReports: any[] = [];
    rawReports: any = [];
    selectOneMsg: string = '';
    hiddenReports: any[] = [];
    hiddenTabs = [];
    nextButton: string;
    @ViewChild(Slides) slides: Slides;

    constructor(
        public nvCtrl: NavController,
        public navParams: NavParams,
        private translate: TranslateService,
        private appService: AppService,
        private reportService: ReportsService,
        private projectsService: ProjectsService,
        private sessionService: SessionService,
        private toastCtrl: ToastController,
        private mingle: MingleService,
        private loadingCtrl: LoadingController
    ) {
        this.project = this.navParams.get('project');
        this.translate.get(['CONFIG_REPORTS.NO_SELECTED_MSG']).subscribe(
            value => {
                this.selectOneMsg = value['CONFIG_REPORTS.NO_SELECTED_MSG'];
            });
    }

    ionViewDidLoad() {
        this.apps = this.project.apps;
        let loader = this.loadingCtrl.create({
        });

        loader.present();
        this.reportService.getReportsList(this.project.id).subscribe(
            reportList => {
                let obsArr = [];

                for (let app of this.project.apps) {
                    obsArr.push(this.reportService.getReportsByApp(app.link));
                }
                let merged = Observable.merge(...obsArr);

                merged.subscribe(
                    res => {
                        this.rawReports.push(res);
                    },
                    (e) => {
                        console.error(e);
                    },
                    () => {
                        for (let i = 0; i < this.rawReports.length; i++) {
                            if (this.rawReports[i].content.entries.length === 0) {
                                //this.hiddenTabs.push(this.rawReports[i]);
                                this.hiddenTabs.push({
                                    name: this.rawReports[i].meta.title,
                                    identifier: this.rawReports[i].meta.identifier,
                                    uri: this.rawReports[i].meta.uri
                                });
                                delete this.rawReports[i];
                            } else {
                                this.reports[i] = {
                                    app: {
                                        name: this.rawReports[i].meta.title,
                                        identifier: this.rawReports[i].meta.identifier,
                                        uri: this.rawReports[i].meta.uri
                                    }
                                };



                                this.reports[i].reports = this.rawReports[i].content.entries.map(
                                    curr => {
                                        var obj = reportList.filter(x => { return x.link == curr.link });
                                        curr = {
                                            identifier: obj[0].identifier,
                                            link: obj[0].link,
                                            title: obj[0].title,
                                            visible: false,
                                            showLegend: true,
                                            showYAxes: true,
											showXAxes: true,
											roundValues: true,
                                            showValues: false
                                        };

                                        return curr;
                                    }
                                )
                            }

                            this.hiddenReports = this.reports.filter(
                                report => {
                                    for (let app of this.apps) {
                                        if (!app.visible && app.identifier === report.app.identifier) {
                                            return report;
                                        }
                                    }
                                }
                            );
                            this.reports = this.reports.filter(
                                report => {
                                    for (let app of this.apps) {
                                        if (app.visible && app.identifier === report.app.identifier) {
                                            return report;
                                        }
                                    }
                                }
                            );
                        }
                        this.translate.get(['CONFIG_REPORTS.FINISH', 'CONFIG_REPORTS.NEXT']).subscribe(
                            value => {
                                if (this.reports.length === 1) {
                                    this.nextButton = value['CONFIG_REPORTS.FINISH'];
                                } else
                                    this.nextButton = value['CONFIG_REPORTS.NEXT'];
                            }
                        );
                        loader.dismiss();

                    }

                );
            },
            error => {
                loader.dismiss();
            }
        );
    }

    nextPage() {
        let loader = this.loadingCtrl.create({
        });
        loader.present();
        let selecteds = this.getSelecteds();
        //verifica se alguma aba não tem relatório selecionado
        for (let i = 0; i < selecteds.length; i++) {
            if (selecteds[i].reports.length === 0) {
                this.slides.slideTo(i);
                this.presentToast();
                return;
            }
        }

        let tabs = [];
        let visibleReports = [];
        for (let tab of selecteds) {
            let reports = [];


            for (let report of tab.reports) {

                //report.visible ? visibleReports.push(report.title) :'';
                if (report.visible) {
                    let vreport = {
                        reportName: report.title,
                        reportId: report.identifier
                    }
                    visibleReports.push(vreport);
                }
                reports.push(report);
            }
            let t = {
                id: tab.app.identifier,
                title: tab.app.name,
                reports: reports,
                visible: true,
                uri: tab.app.uri,
                removable: false
            }
            tabs.push(t);
        }
        for (let hiddenTab of this.hiddenTabs) {
            let t = {
                id: hiddenTab.identifier,
                title: hiddenTab.name,
                uri: hiddenTab.uri,
                reports: [],
                visible: false,
                removable: false
            }
            tabs.push(t);
        }

        //Add tabs/reports ocultos como visible = false
        for (let tab of this.hiddenReports) {
            let reports = [];
            for (let report of tab.reports) {
                reports.push(report);
            }
            let t = {
                title: tab.app.name,
                reports: reports,
                visible: false,
                removable: false
            }
            tabs.push(t);
        }


        this.project.apps = selecteds;
        this.project.tabs = tabs;
        this.projectsService.addProject(this.project).subscribe(
            value => {
                this.mingle.registerMetric('FINISHED_SETTINGS', { ProjectName: this.project.name, ProjectId: this.project.id, visibleReports: visibleReports });
                this.sessionService.projectId = this.project.id;
                this.sessionService.projectName = this.project.name;
                loader.dismiss();
                this.nvCtrl.setRoot(MenuPage);
            },
            error => {
                loader.dismiss();
            }
        );
    }

    private getSelecteds() {
        let selecteds = [];
        for (let report of this.reports) {
            let r = {};
            report.reports.sort(
                (a, b) => {
                    return a.visible < b.visible
                }
            );
            r['app'] = report.app;
            r['reports'] = report.reports;
            selecteds.push(r)
        }
        return selecteds;
    }

    next() {
        if (this.slides.getActiveIndex() === this.slides.length() - 1) {
            this.nextPage();
            return;
        }
        if (this.slides.getActiveIndex() + 1 === this.slides.length() - 1) {
            this.translate.get('CONFIG_REPORTS.FINISH').subscribe(
                msg => {
                    this.nextButton = msg;
                }
            );
        } else {
            this.translate.get('CONFIG_REPORTS.NEXT').subscribe(
                msg => {
                    this.nextButton = msg;
                }
            );
        }
        this.slides.slideNext();

    }

    toggle(report) {
        report.visible = !report.visible;
    }

    presentToast() {
        let toast = this.toastCtrl.create({
            message: this.selectOneMsg,
            cssClass:'warning',
            duration: 3000,
			position: 'top',
			closeButtonText: 'Ok',
			showCloseButton: true
        });

        toast.onDidDismiss(() => {
        });

        toast.present();
    }
}