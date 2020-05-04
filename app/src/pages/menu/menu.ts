import { ReloadProject } from './../reload-project/reload-project';
import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, MenuController } from 'ionic-angular';

import { ProjectsService } from '../../providers/projects.service';
import { LoginService } from '../../providers/login.service';
import { ReportsService } from '../../providers/reports.service';
import { HttpService } from '../../providers/http.service';
import { MingleService } from '@totvs/mobile-mingle'
import { LoginPage } from '../login/login'
import { TranslateService } from '@ngx-translate/core';

import { HomePage } from '../home/home'
import { ReorderTabsPage } from '../reorder-tabs/reorder-tabs'
import * as moment from 'moment';
import { SessionService } from '../../providers/session.service';
import { DashboardKpiPage } from '../dashboard-kpi/dashboard-kpi';


@Component({
	selector: 'page-menu',
	templateUrl: 'menu.html',
})
export class MenuPage {

	project: any;
	rootPage: any = HomePage;

	cacheConfig: any;

	title: string;
	summary: string;
	metrics: any;
	attributes: any;
	filters: any;
	listFiltersText = [];
	report: any;
	ref: any;
	hasInvalidFilters = false;
	btGroup: number = 1;
	type: string;

	current: string = 'DashboardPage';

	private options = [];



	constructor(
		public navCtrl: NavController,
		public navParams: NavParams,
		private projectsService: ProjectsService,
		private loginService: LoginService,
		private reportService: ReportsService,
		private _http: HttpService,
		private alertCtrl: AlertController,
		public menuCtrl: MenuController,
		private translate: TranslateService,
		private mingle: MingleService,
		private sessionService: SessionService
	) {
		this.getTranslatedValues();
	}

	ionViewDidLoad() {
		this.sessionService.nav.subscribe(page => {
			this.navigate(page);
		});
		this.reportService.showFilters.subscribe(
			data => {
				this.showDetails(data);
			});
	}

	showConfirmLogout() {
		let confirm = this.alertCtrl.create({
			title: this.options['LOGOUT_TITLE'],
			message: this.options['LOGOUT_MSG'],
			buttons: [
				{
					text: this.options['LOGOUT_CANCEL'],
					handler: () => {
						console.log('Disagree clicked');
					}
				},
				{
					text: this.options['LOGOUT_CONFIRM'],
					handler: () => {
						this.logout();
					}
				}
			]
		});
		confirm.present();
	}
	private logout() {
		this.loginService.logout().then(
			value => {
				this.mingle.registerMetric('LOGOUT');
				this.navCtrl.setRoot(LoginPage);
			}
		)
	}

	public navigate(page: string) {
		this.current = page;

		switch (page) {
			case 'DashboardKpiPage':
				this.rootPage = DashboardKpiPage;
				break;
			case 'DashboardPage':
				this.rootPage = HomePage;
				break;
			case 'ReorderTabsPage':
				this.rootPage = ReorderTabsPage;
				break;
			case 'ChangeProject':
				// this.rootPage = ReloadProject;
				this.navCtrl.push(ReloadProject, { showLogo: false });
				break;
		}
	}

	showDetails(params) {
		this.metrics = null;
		this.attributes = null;
		this.filters = null;
		this.listFiltersText = [];


		this.title = params.ref.parsedReport.title;
		this.summary = params.ref.parsedReport.summary;
		this.metrics = params.ref.parsedReport.metrics;
		this.attributes = params.ref.parsedReport.attributes;
		this.filters = params.ref.parsedReport.filters;
		this.type = params.ref.parsedReport.format;
		this.report = params.ref.report;
		this.cacheConfig = {
			showLegend: this.report.showLegend,
			showValues: this.report.showValues,
			showYAxes: this.report.showYAxes,
			showXAxes: this.report.showXAxes,
			roundValues: params.ref.parsedReport.roundValues,
			format: params.ref.parsedReport.format
		}
		this.ref = params.ref;

		let listFilters = [];

		for (let filter of this.filters) {
			let url;

			if (filter.elements.attribute) {
				url = filter.elements.attribute.replace('/gdc/', '');
			}
			else if (filter.elements.value) {
				url = filter.elements.value.replace('/gdc/', '');
			} else {
				this.hasInvalidFilters = true;
				continue;
			}

			this._http.get(url, {}).subscribe(
				data => {
					let filterResult = {};
					if (data.attribute) {
						//get attribute
						filterResult['attribute'] = data.attribute.meta.title;

						//get attribute
						filterResult['type'] = filter.type;


						if (filterResult['type'] === 'not between' || filterResult['type'] === 'between') {
							if (filter.elements.type === 'time macro') {
								let base1;
								let calc2;
								for (let id of filter.elements.ids) {
									if (id === 'THIS') {
										//base1 = 'hoje';
										base1 = moment().format('DD-MM-YYYY');
									}
									else {
										filter.elements.expression === '-' ? calc2 = moment().subtract(id, 'days').format('DD-MM-YYYY') : calc2 = moment().add(id, 'days').format('DD-MM-YYYY');
									}
								}
								let filterText = filterResult['attribute'] + ' ' + filter.type + ' ' + calc2 + ' and ' + base1;
								this.listFiltersText.push(filterText);
							}
							if (filter.elements.type === 'list') {


							}
						}

						if (filterResult['type'] === '<>' || filterResult['type'] === '=') {
							if (filter.elements.type === 'time macro') {
								let base1;
								for (let id of filter.elements.ids) {
									if (id === 'PREVIOUS') {
										base1 = moment().subtract(1, 'days').format('DD-MM-YYYY');
									}
									if (id === 'THIS') {
										base1 = moment().format('DD-MM-YYYY');
									}
									if (id === 'NEXT') {
										base1 = moment().add(1, 'days').format('DD-MM-YYYY');
									}
								}
								let filterText = filterResult['attribute'] + ' não é ' + base1;
								this.listFiltersText.push(filterText);
							}
						}

						if (filter.type === 'in' || filter.type === 'not in') {
							let id = data.attribute.content.displayForms[0];
							let url = id.links.elements.replace('/gdc/', '');

							this._http.get(url, {})
								.subscribe(data => {
									let ids = data.attributeElements.elements;
									let temp = [];
									for (let q of filter.elements.ids) {
										for (let id of ids) {
											if (q === id.uri) {
												temp.push(id.title)
											}
										}
									}
									filterResult['filters'] = temp;
									let filterText = `${filterResult['attribute']} ${filterResult['type']} ${filterResult['filters']}`
									this.listFiltersText.push(filterText);
									listFilters.push(filterResult);
								});
						}
					} else {
						if (data.prompt) {
							//FILTROS DE VARIÁVEIS
							let filterText = 'Variable: ' + data.prompt.meta.title;
							this.listFiltersText.push(filterText);
							// let options = {
							//   url: data.prompt.content.attribute.replace('/gdc/', '')
							// }
							// this._http.get(options).map(res => res.json()).subscribe(data2 => {
							//   console.log(data2);
							//   filterText = filterText + ' ( '+ data2.attribute.meta.title +' )'
							//   listFilters.push(filterResult);
							// let options2 = {};
							// options2['payload'] = {
							//   "variablesSearch": {
							//     "variables": [
							//       data.prompt.meta.uri
							//     ],
							//     "context": []
							//   },
							// }
							// options2['url'] = 'md/dkrwpz8ki4iplckqups7luwz8uiviacy/variables/search';
							// this._http.post(options2).map(res => res.json()).subscribe(res => {
							//   console.log(res);
							// })
							// });
						}
						// this.hasInvalidFilters = true;
					}

				},
				err => {
				});
		}


		this.menuCtrl.toggle('right');
	}

	private parseBetweenFilters() {

	}

	saveOptions() {
		this.report.showLegend = this.cacheConfig.showLegend;
		this.report.showValues = this.cacheConfig.showValues;
		this.report.showYAxes = this.cacheConfig.showYAxes;
		this.report.showXAxes = this.cacheConfig.showXAxes;
		this.report.format = this.cacheConfig.format;
		this.report.roundValues = this.cacheConfig.roundValues || this.cacheConfig.roundValues == undefined ? true : false;


		this.projectsService.updateReprot(this.report).then(
			() => {
				this.mingle.registerMetric('LOCAL_SETTINGS_CHANGED', { projectId: this.sessionService.projectId, projectName: this.sessionService.projectName, showY: this.report.showYAxes, showX: this.report.showXAxes, roundValues: this.report.roundValues, showValues: this.report.showValues, showLegend: this.report.showLegend });
				this.ref.refresh();
				this.menuCtrl.close();
			}
		);
	}

	parseGroupFilter() {

	}

	parseDateFilter() {

	}
	getTranslatedValues() {
		this.translate.get('MENU.LOGOUT_TITLE').subscribe(
			value => {
				this.options['LOGOUT_TITLE'] = value;
			});
		this.translate.get('MENU.LOGOUT_MSG').subscribe(
			value => {
				this.options['LOGOUT_MSG'] = value;
			});
		this.translate.get('MENU.LOGOUT_CONFIRM').subscribe(
			value => {
				this.options['LOGOUT_CONFIRM'] = value;
			});
		this.translate.get('MENU.LOGOUT_CANCEL').subscribe(
			value => {
				this.options['LOGOUT_CANCEL'] = value;
			});
	}

	changeSegment(id: number) {
		this.btGroup = id;
		if (id === 3) {
			this.mingle.registerMetric('FILTERS_VIEWED');
		}
	}

}
