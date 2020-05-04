import { ProjectsService } from './../../providers/projects.service';
import { DashboardPage } from './../../pages/dashboard/dashboard';
import { ReportService } from './../../providers/report.service';
import { Component, ElementRef, Input, Output, EventEmitter, ViewChild, Inject, forwardRef } from '@angular/core';
import { App, NavController, NavParams, ModalController, ViewController, PopoverController, LoadingController, Platform, ActionSheetController, ToastController } from 'ionic-angular';
import { HttpService } from '../../providers/http.service';
import { SessionService } from '../../providers/session.service';
import { ReportsService } from '../../providers/reports.service';
import { SocialSharing } from '@ionic-native/social-sharing';
import { MingleService } from '@totvs/mobile-mingle'
import { TranslateService } from '@ngx-translate/core';

import * as html2canvas from 'html2canvas';
import 'chart.piecelabel.js/build/Chart.PieceLabel.min.js';
import { Report } from '../../models/report';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { EmailComposer } from '@ionic-native/email-composer';
import { UnsupportedChartError } from '../../errors/unsupported-chart.error';
import { UnformattedChartError } from '../../errors/unformatted-chart.error';
//declare var pieceLabel: any;


@Component({
	selector: 'sa-report',
	templateUrl: 'report-generator.html',
})
export class ReportGeneratorComponent {
	@Input() report: any;
	@Output() excluded = new EventEmitter();
	@Output() hide = new EventEmitter();
	@ViewChild('graph') grafico: any;
	private type;
	private dataResult;
	private series;
	private definitionUri;
	private barChartLabels = [];
	private isLoading = true;
	public barChartOptions: any;
	public showUnsupportedChartError: boolean = false;
	public showUnableToRenderChartError: boolean = false;
	public projectBlocked: boolean = false;
	private graph;
	private invalidReport = false;
	private options = [];
	private isExporting = false;
	parsedReport = new Report();

	private reportRenderedMetric = {
		reportId: null,
		reportName: null,
		metrics: [{}],
		attributes: [{}]
	}

	private colors = [];

	constructor(
		private http: HttpService,
		private mingle: MingleService,
		private reportService: ReportService,
		private sessionService: SessionService,
		private platform: Platform,
		private elRef: ElementRef,
		private socialSharing: SocialSharing,
		public modalCtrl: ModalController,
		public loadingCtrl: LoadingController,
		private emailComposer: EmailComposer,
		private translate: TranslateService,
		private actionSheetCtrl: ActionSheetController,
		private reportsService: ReportsService,
		private photoLibrary: PhotoLibrary,
		public toastCtrl: ToastController,
		private projectService: ProjectsService,
		@Inject(forwardRef(() => DashboardPage)) private _parentContent,
		private popoverCtrl: PopoverController
	) {
		this.getTranslatedValues();
	}
	ngOnInit() {
		this.loadReport();
	}

	refresh() {
		this.isLoading = true;
		this.parsedReport = new Report();

		this.loadReport();
	}

	loadReport() {
		this.reportService.getReport(this.report)
			.subscribe(report => {
				this.showUnsupportedChartError = false;
				this.showUnableToRenderChartError = false;
				this.invalidReport = false;

				if (report.title) {
					this.report.title = report.title;
				}

				this.parsedReport = report;

				this.isLoading = false;
				this.graph = document.getElementById(this.report.identifier);

				//registrar métrica de relatório carregado.                   
				let metrics = [];
				for (let metric in this.parsedReport.metrics) {
					let m = {
						metricId: this.parsedReport.metrics[metric].metricId,
						metricName: this.parsedReport.metrics[metric].title
					};
					metrics.push(m);
				}
				let attributes = [];
				for (let attribute in this.parsedReport.attributes) {
					let a = {
						attributeId: this.parsedReport.attributes[attribute].attributeId,
						attributeName: this.parsedReport.attributes[attribute].title
					};
					attributes.push(a);
				}
				let metrics_params = {
					reportId: this.report.identifier,
					reportName: this.parsedReport.title,
					metrics: metrics,
					attributes: attributes,
					projectId: this.sessionService.projectId,
					projectName: this.sessionService.projectName
				}
				this.mingle.registerMetric('REPORT_RENDERED', metrics_params);
			},
				(error) => {
					this.isLoading = false;
					this.invalidReport = true;
					// Este tipo de gráfico não é suportado
					this.showUnsupportedChartError = error instanceof UnsupportedChartError ? true : false;
					// Não foi possível exibir o gráfico
					this.showUnableToRenderChartError = error instanceof UnformattedChartError ? true : false;

					if (!this.showUnableToRenderChartError && !this.showUnsupportedChartError) {

						if (error.status === 403) {
							this.projectBlocked = true;
						}
						else {
							this.showUnableToRenderChartError = true;
						}
						if (error.status === 404) {
							// Gráfico removido
							this.excluded.emit(this.report);
						}
					}
				}
			);
	}

	private showModal() {
		if (this.parsedReport.reportType && this.parsedReport.reportType === 'grid') {
			let copy = JSON.parse(JSON.stringify(this.parsedReport));
			let profileModal = this.modalCtrl.create(ModalTable, { reportParsed: copy });
			profileModal.present();
		}
	}

	showPopOver(ev) {
		let popover = this.popoverCtrl.create(PopoverPage, { ref: this });
		popover.present({
			ev: ev,
		});
	}

	hideReport(ev?) {
		this.report.visible = false;
		this.projectService.updateReprot(this.report).then(
			() => {
				this.hide.emit(this.report);
			},
			() => {
				this.showErrorToast(this.options['REMOVE_REPORT_ERROR']);
			}
		);
		//this.refresh();
	}

	showActionSheet(ev) {

		let buttons: Array<any> = [
			{
				text: this.options['REFRESH'],
				icon: 'refresh',
				handler: () => {
					this.refresh();
				}
			},
			{
				text: this.options['SHOW_DETAILS'],
				icon: 'more',
				handler: () => {
					this.showDetails();
				}
			},

			{
				text: this.options['SHARE_EMAIL'],
				icon: 'mail',
				handler: () => {
					this.shareViaEmail();
				}
			},
			{
				text: this.options['EXPORT'],
				icon: 'download',
				handler: () => {
					this.exportToLibrary();
				}
			},
			{
				text: this.options['REMOVE'],
				icon: 'close',
				handler: () => {
					this.hideReport();
				}
			},
			{
				text: this.options['CANCEL'],
				role: 'cancel',
				handler: () => {
					console.log('Cancel clicked');
				}
			}
		];

		if (this.parsedReport.reportType === 'grid' && !this.invalidReport) {
			buttons = [
				{
					text: this.options['REFRESH'],
					role: 'destructive',
					icon: 'refresh',
					handler: () => {
						this.refresh();
					}
				},
				{
					text: this.options['SHOW_DETAILS'],
					icon: 'more',
					handler: () => {
						this.showDetails();
					}
				},
				{
					text: this.options['REMOVE'],
					icon: 'close',
					handler: () => {
						this.hideReport();
					}
				},
				{
					text: this.options['CANCEL'],
					icon: 'close',
					role: 'cancel',
					handler: () => {
						console.log('Cancel clicked');
					}
				}
			];
		}

		if (this.invalidReport) {
			buttons = [
				{
					text: this.options['REFRESH'],
					icon: 'refresh',
					handler: () => {
						this.refresh();
					}
				},
				{
					text: this.options['REMOVE'],
					icon: 'close',
					handler: () => {
						this.hideReport();
					}
				},
				{
					text: this.options['CANCEL'],
					role: 'cancel',
					handler: () => {
						console.log('Cancel clicked');
					}
				}
			];

		}


		let actionSheet = this.actionSheetCtrl.create({
			buttons: buttons
		});

		actionSheet.present();
	}

	private shareViaEmail() {
		this.isExporting = true;
		let loading = this.loadingCtrl.create({});
		loading.present();
		this.scrollElement();
		setTimeout(() => {
			let img = document.getElementById(this.report.identifier);
			html2canvas(img)
				.then((canvas) => {
					let attach = canvas.toDataURL('image/png', 1.0);
					this.socialSharing.share(this.options['SHARE_MSG'], this.report.title, [attach]).then(() => {
						this.mingle.registerMetric('REPORT_SHARED', { projectId: this.sessionService.projectId, projectName: this.sessionService.projectName, reportName: this.report.title });
						loading.dismiss();
						this.isExporting = false;
					}).catch((err) => {
						this.mingle.registerMetric('ERROR_REPORT_SHARED', { projectId: this.sessionService.projectId, projectName: this.sessionService.projectName, reportName: this.report.title });
						loading.dismiss();
						this.isExporting = false;
					});
				})
				.catch(err => {
					loading.dismiss();
					this.isExporting = false;
					this.showErrorToast(this.options['PHOTO_SAVE_ERROR']);
				});
		}, 300);
	}

	private exportToLibrary() {
		this.isExporting = true;
		let loading = this.loadingCtrl.create({});
		loading.present();
		this.scrollElement();
		setTimeout(() => {
			let img = document.getElementById(this.report.identifier);
			html2canvas(img)
				.then((canvas) => {
					this.photoLibrary.requestAuthorization()
						.then(() => {
							this.photoLibrary.saveImage(canvas.toDataURL('image/png', 1.0), 'TOTVS Analytics')
								.then(() => {
									this.mingle.registerMetric('REPORT_EXPORTED', { projectId: this.sessionService.projectId, projectName: this.sessionService.projectName, reportName: this.report.title });
									loading.dismiss();
									this.showSuccessToast(this.options['PHOTO_SAVED'])
									this.isExporting = false;
								})
								.catch(err => {
									loading.dismiss();
									this.showErrorToast(this.options['PHOTO_SAVE_ERROR']);
									this.isExporting = false;
								});
						})
						.catch(err => {
							this.showErrorToast(this.options['PHOTO_SAVE_ERROR'])
							loading.dismiss();
							this.isExporting = false;
						});
				});
		}, 500);
	}

	showErrorToast(msg: string) {
		let toast = this.toastCtrl.create({
			message: msg,
			duration: 3000,
			cssClass: 'error',
			position: 'top',
			closeButtonText: 'Ok',
			showCloseButton: true
		});
		toast.present();
	}

	showSuccessToast(msg: string) {
		let toast = this.toastCtrl.create({
			message: msg,
			cssClass: 'success',
			duration: 3000,
			position: 'top',
			closeButtonText: 'Ok',
			showCloseButton: true
		});
		toast.present();
	}
	public scrollElement() {
		let element = document.getElementById(this.report.identifier);
		this._parentContent.content.scrollTo(0, element.offsetTop - 150, 200);
	}

	showDetails() {
		this.reportsService.showFilters.emit({
			ref: this
		});
	}

	hexToRgb(hex) {
		var bigint = parseInt(hex, 16);
		var r = (bigint >> 16) & 255;
		var g = (bigint >> 8) & 255;
		var b = bigint & 255;

		return r + "," + g + "," + b;
	}

	private parseXAxesValues(value: string) {
		value = value.trim();
		if (value.length > 19) {
			return value.substring(0, 16) + '...';
		}
		return value;
	}

	getTranslatedValues() {
		this.translate.get('REPORT.SHARE_MSG').subscribe(
			value => {
				this.options['SHARE_MSG'] = value;
			});
		this.translate.get('REPORT.REFRESH').subscribe(
			value => {
				this.options['REFRESH'] = value;
			});
		this.translate.get('REPORT.SHOW_DETAILS').subscribe(
			value => {
				this.options['SHOW_DETAILS'] = value;
			});
		this.translate.get('REPORT.SHARE_EMAIL').subscribe(
			value => {
				this.options['SHARE_EMAIL'] = value;
			});
		this.translate.get('REPORT.EXPORT').subscribe(
			value => {
				this.options['EXPORT'] = value;
			});
		this.translate.get('COMMOM.CANCEL').subscribe(
			value => {
				this.options['CANCEL'] = value;
			});
		this.translate.get('REPORT.PHOTO_SAVE_ERROR').subscribe(
			value => {
				this.options['PHOTO_SAVE_ERROR'] = value;
			});
		this.translate.get('REPORT.PHOTO_SAVED').subscribe(
			value => {
				this.options['PHOTO_SAVED'] = value;
			});
		this.translate.get('REPORT.REMOVE_REPORT_ERROR').subscribe(
			value => {
				this.options['REMOVE_REPORT_ERROR'] = value;
			});
		this.translate.get('REPORT.REMOVE').subscribe(
			value => {
				this.options['REMOVE'] = value;
			});
	}
}

@Component({
	template: `
    <ion-list>
      <ion-item (click)="refresh()">{{'REPORT.REFRESH' | translate}}</ion-item>
      <ion-item (click)="showDetails()">{{'REPORT.SHOW_DETAILS' | translate}}</ion-item>
      <ion-item (click)="exportGraph()">{{'REPORT.SHARE' | translate}}</ion-item>
    </ion-list>
  `
})
export class PopoverPage {
	private options = [];

	constructor(
		public viewCtrl: ViewController,
		public navParams: NavParams,
		private socialSharing: SocialSharing,
		private reportsService: ReportsService,
		public loadingCtrl: LoadingController,
		private translate: TranslateService,
		private platform: Platform,
		private mingle: MingleService

	) {
		this.getTranslatedValues();
	}

	close() {
		this.viewCtrl.dismiss();
	}
	exportGraph() {

	}

	refresh() {
		this.navParams.get('ref').refresh();
		this.close();
	}

	showDetails() {
		let ref = this.navParams.get('ref');

		this.reportsService.showFilters.emit({
			ref: ref
		});
		this.close();
	}
	getTranslatedValues() {
		this.translate.get('REPORT.SHARE_MSG').subscribe(
			value => {
				this.options['SHARE_MSG'] = value;
			});
	}



}


@Component({
	selector: 'modal-sa-report-table',
	templateUrl: 'table.html'
})
export class ModalTable {
	report: any;
	tableRows: any[] = [];
	agrupadores;
	totalizadores = ['avg', 'max', 'med', 'min', 'nat', 'sum'];

	constructor(private translate: TranslateService, private viewController: ViewController, navParams: NavParams) {
		this.report = null;
		this.tableRows = []
		this.report = navParams.get('reportParsed');
		this.createTable();
		// "TABLE": {
		// 	"AVG": "Está gostando do Analytics?",
		// 	"MAX": "Você poderia nos avaliar na loja? Leva apenas alguns segundos!",
		// 	"MED": "Avaliar",
		// 	"MIN": "Avaliar depois",
		// 	"SUM": "Não, obrigado."
		// }
		this.translate.get(['TABLE.avg', 'TABLE.max', 'TABLE.med', 'TABLE.min', 'TABLE.nat', 'TABLE.sum']).subscribe(values => this.agrupadores = values)

	}

	private closeModal() {
		this.viewController.dismiss();
	}

	createTable() {
		this.printCol(this.report.table.rows);
	}

	printCol(linhas) {
		for (let i = 0; i < linhas.length; i++) {
			let col = linhas[i].value ? linhas[i].value : linhas[i].id;
			if (linhas[i].childs && linhas[i].childs.length > 0) {
				for (let j = 0; j < linhas[i].childs.length; j++) {
					if (linhas[i].parent)
						linhas[i].childs[j].parent = linhas[i].parent.concat([col]);
					else
						linhas[i].childs[j].parent = [col];
				}
				this.printCol(linhas[i].childs);
			} else {
				if (linhas[i].parent) {
					linhas[i].parent.push(col);
				} else {
					linhas[i].parent = [col];
				}

				for (let k = 0; k < linhas[i].values.length; k++) {
					if ((linhas[i].values && linhas[i].values.length + 1) < this.report.table.headers.length && this.totalizadores.indexOf(linhas[i].value) >= 0) {
						const diff = this.report.table.headers.length - (linhas[i].values && linhas[i].values.length + 1);
						for (let j = 0; j < diff; j++) {
							linhas[i].parent.push('');
						}
					}
					linhas[i].parent.push(linhas[i].values[k]);
				}
				this.tableRows.push(linhas[i].parent);
			}
		}
	}

	handleValue(value: string) {
		let parsedValue = isNaN(parseFloat(value)) ? value : "" + parseFloat(value);
		if (this.report.roundValues && !isNaN(parseFloat(value))) {
			parsedValue = parseFloat(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
		} else {
			let exist = this.totalizadores.indexOf(parsedValue)
			if (exist >= 0) {
				parsedValue = this.agrupadores['TABLE.' + parsedValue];
			}
		}
		return parsedValue;
	}
}   