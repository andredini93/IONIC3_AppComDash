import { Component } from '@angular/core';
import { NavController, NavParams, reorderArray } from 'ionic-angular';
import { MingleService } from '@totvs/mobile-mingle';

import { ReportsService } from '../../providers/reports.service';
import { ProjectsService } from '../../providers/projects.service';
import { SessionService } from '../../providers/session.service';


@Component({
	selector: 'page-reorder-reports',
	templateUrl: 'reorder-reports.html'
})
export class ReorderReportsPage {

	public title: string;
	public reports: any[];
	public project: any;
	public tabIndex: number;
	public tab: any;
	private _callback: any;

	constructor(
		public navCtrl: NavController,
		private params: NavParams,
		private projectsService: ProjectsService,
		private mingle: MingleService,
		private reportsService: ReportsService,
		private sessionService: SessionService
	) {
		this.tabIndex = this.params.get('tabIndex');
		this._callback = this.params.get('callback');
		this._loadReports();
	}
	
	ionViewWillLeave() {
		this._callback(this.tab, this.tabIndex);
		this.project.tabs[this.tabIndex].reports = this.reports;
		this.projectsService.setProject(this.project);
	}

	private _loadReports() {

		let requests = [
			this.projectsService.getSavedProject(),
			this.projectsService.getTabByIndex(this.tabIndex)
		];

		Promise.all(requests)
			.then(responses => {
				this.project = responses[0];
				this.tab = responses[1];

				this.title = this.tab.title.replace('#Mobile ', '');
				this.reports = this.tab.reports;
				this.checkForNewReports(this.tab);
			})
			.catch(() => { });
	}

	private checkForNewReports(tab) {
		this.reportsService.getReportsByApp(tab.uri)
			.subscribe(goodDataReports => {
				this._syncRemovedReports(goodDataReports.content.entries, tab.reports);

				for (let gooddataReport of goodDataReports.content.entries) {
					this.reportsService.getReport(gooddataReport.link)
						.subscribe(report => {
							report = report.report['meta'];
							
							let index = this.reports.findIndex(r => r.identifier == report.identifier);

							if (index != -1) {
								this.reports[index].title = report.title;
							} else {
								let newReport = {
									identifier: report.identifier,
									link: report.uri,
									showLegend: true,
									showValues: false,
									showXAxes: true,
									showYAxes: true,
									roundValues: true,
									title: report.title,
									visible: false
								};
								
								this.reports.push(newReport);
							}
						}
					);
				}
			},
			(err) => {
				console.log(err);
			}
		);
	}

	private _syncRemovedReports(newReportSet, oldReportSet) {
		oldReportSet.forEach((report, index) => {
			let existReport = newReportSet.some(gdReport => {
				return report.link == gdReport.link;
			});

			if (!existReport) {
				oldReportSet.splice(index, 1);
			}
		});
	
	}

	reordedReport() {
		this.mingle.registerMetric('REPORTS_REORDERED', { projectId: this.sessionService.projectId, projectName: this.sessionService.projectName });
	}

	toggleVisibility(report) {
		let data = {
			projectId: this.sessionService.projectId,
			projectName: this.sessionService.projectName,
			reportName: report.title 
		};

		if (report.visible) {
			this.mingle.registerMetric('REPORT_INCLUDED', data);
			return;
		}

		this.mingle.registerMetric('REPORT_REMOVED', data);
	}

}
