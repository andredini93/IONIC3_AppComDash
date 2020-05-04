import { Report } from './../models/report';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/retryWhen';

import { Observable } from 'rxjs/Observable';
import { HttpService } from './http.service';
import { SessionService } from './session.service';
import { UnformattedChartError } from '../errors/unformatted-chart.error';
import { UnsupportedChartError } from '../errors/unsupported-chart.error';

enum ChartType {
	Line = 1,
	Bar,
	VerticalBar,
	HorizontalBar
};

@Injectable()
export class ReportService {

	constructor(
		private _httpService: HttpService,
		private session: SessionService
	) { }

	getReport(savedReport: any): Observable<any> {
		let report = new Report();
		return this.getReportDefinitions(savedReport.link)
			.flatMap(value => {
				return this.getLatestDefinition(value.report.content.definitions);
			}).flatMap(definition => {
				return this.executeReport(definition);
			}).flatMap(executeValue => {
				let reportView = executeValue['execResult'].reportView;
				let executeDataResult = executeValue['execResult'].dataResult;

				/** Recupera as preferências de usuário */
				report.showLegend = savedReport.showLegend;
				report.showValues = savedReport.showValues;
				report.showYAxes = savedReport.showYAxes;
				report.showXAxes = savedReport.showXAxes;
				report.roundValues = savedReport.roundValues || savedReport.roundValues == undefined ? true : false;
				report.format = reportView.format;
				if (reportView.format === 'chart') {
					report.type = reportView.chart.type;
				}

				/** Rcupera os dados gerais do GoodData: resumo, atributos e métricas */
				report.title = reportView.reportName;
				report.summary = reportView.summary;
				report.metrics = reportView.metrics;
				report.attributes = reportView.rows.length < 1 ? reportView.columns : reportView.rows;

				/** Formato da métrica */
				report.metricFormat = reportView.metrics[0].format;

				/** Filtros  */
				report.filters = this.getFilters(reportView);

				/** Se o report for do tipo grid, muda os atributos */
				if (reportView.format === 'grid') {
					report.attributes = reportView.rows;
				}

				if (Object.prototype.toString.call(report.attributes[report.attributes.length - 1]) === '[object String]' && reportView.format !== 'grid') {
					report.attributes.pop();
				}

				return this.getReportData(executeDataResult).map(dataResult => ({ executeValue, dataResult }));
			}).flatMap(({ executeValue, dataResult }) => {
				let retorno: any;
				let newReportView = executeValue['execResult'].reportView;
				if (dataResult) {
					try {
						if (newReportView.format === 'chart') {
							report.reportType = 'chart';
							retorno = this.setReport(dataResult, report);
						} else if (newReportView.format === 'oneNumber') {
							report.reportType = 'oneNumber';
							report.data = dataResult.xtab_data.data[0];
							let format = report.metricFormat.split(" ");
							format[0] = format[0].replace('[=null]', '');
							if (format[0].includes('%')) {
								format[0] = '%';
								let porcent: any = report.data;
								report.data = report.roundValues ? (porcent * 100).toFixed(2) + format[0] : (porcent * 100) + format[0];
							} else if (format[0].includes('$')) {
								let data: number = +report.data;
								report.data = format[0] + data.toLocaleString('pt-BR');
							} else if (format.length == 1) {
								if (report.metricFormat.indexOf("%") != -1) {
									let porcent: any = report.data;
									report.data = report.roundValues ? (porcent * 100).toFixed(2) + "%" : (porcent * 100) + "%";
								} else {
									let fmtValue: any = report.data;
									report.data = (fmtValue * 1).toLocaleString();
								}
							}

							retorno = report;
						} else if (newReportView.format === 'grid') {
							report.reportType = 'grid';
							report = this.setGridReport(dataResult, report, executeValue);
							retorno = report;
						}

						let obs = Observable.create(observer => {
							if (retorno == 'invalid report') {
								observer.error(new UnsupportedChartError());
							} else {
								observer.next(retorno);
							}
							observer.complete();
						});
						return obs;
					} catch (error) {
						throw new UnformattedChartError();
					}
				}
			});
	}

	private setReport(dataResult, report: Report) {
		switch (report.type) {
			case 'stackedBar':
			case 'bar':
			case 'line':
			case 'area':
			case 'stackedArea':
			case 'donut':
			case 'pie':
				break;
			default:
				return 'invalid report';
		}

		report.options = this.getReportOptions(report);
		report.colors = this.getColors(report.type);

		if (report.type == 'line') {
			this.getLabels(dataResult.xtab_data, report, 1);
			report.datasets = this.parseLineGraphs(dataResult);
		}

		if (report.type == 'bar' || report.type == 'stackedBar') {
			report.type = 'bar';
			this.getLabels(dataResult.xtab_data, report, ChartType.Bar);
			report.datasets = this.parseBarGraphs(dataResult, report);
		}

		if (report.type == 'donut' || report.type == 'pie') {
			if (report.type == 'donut') report.type = 'doughnut';
			// if(dataResult.xtab_data.columns.lookups.length > 2 ){
			// this.getLabels(dataResult.xtab_data, report, 2);
			// }else{
			this.getLabels(dataResult.xtab_data, report, 1);
			// }
			report.datasets = this.parsePieAndDonutGraphs(dataResult);
		}

		if (report.type == 'area' || report.type == 'stackedArea') {
			report.type = "line";
			this.getLabels(dataResult.xtab_data, report, 1);
			report.datasets = this.parseAreaGraphs(dataResult);
		}

		return report;
	}

	private getLabels(tabData, report, modelo) {
		let chartLabels = [];

		if (modelo == 1) {
			const index = Object.keys(tabData.columns.lookups[0]).length == tabData.data[0].length ? 0 : 1;
			if (index === 0) {
				chartLabels = tabData.columns.tree.index;
			} else if (index == 1) {
				chartLabels = tabData.columns.tree.children[0].index;
			} else {
				chartLabels = tabData.columns.tree.index;
			}

			for (let label in chartLabels) {
				if (this.checkPrivateLabel(label)) {
					continue;
				}

				if (tabData.columns.lookups.length === 3) {
					report.labels[chartLabels[label][0]] = this.mntLabelText(tabData.columns.lookups[1][label]);
				} else {
					if (tabData.columns.lookups.length == 2) {
						if (Object.keys(tabData.columns.lookups[0]).length == tabData.data[0].length) {
							report.labels[chartLabels[label][0]] = this.mntLabelText(tabData.columns.lookups[0][label]);
						} else {
							report.labels[chartLabels[label][0]] = this.mntLabelText(tabData.columns.lookups[1][label]);
						}
					} else {
						report.labels[chartLabels[label][0]] = this.mntLabelText(tabData.columns.lookups[0][label]);
					}
				}
				if (report.showLegend && report.attributes && report.attributes.length > 0) {
					report.options.scales.xAxes[0]['scaleLabel'] = {
						display: true,
						// labelString: report.attributes[report.attributes.length - 1].title 
						labelString: report.attributes[0].title
					};
				}
			}
		}

		if (modelo == 2) {
			let direction = '';
			let baseIndex = 0;
			let opIndex = 0;

			if (tabData.overall_size.columns >= tabData.overall_size.rows) {
				direction = 'columns';
				baseIndex = 1;
				if (report.showLegend && report.attributes && report.attributes.length > 0) {
					report.options.scales.xAxes[0]['scaleLabel'] = {
						display: true,
						// labelString: report.attributes[report.attributes.length - 1].title 
						labelString: report.attributes[0].title
					};
				}
			} else {
				direction = 'rows';
				opIndex = 1;
				report.type = 'horizontalBar';
				if (report.showLegend && report.attributes && report.attributes.length > 0) {
					report.options.scales.yAxes[0]['scaleLabel'] = {
						display: true,
						// labelString: report.attributes[report.attributes.length - 1].title 
						labelString: report.attributes[0].title
					};
				}
			}

			if (tabData.sortedLookups) {
				if (direction == 'columns') {
					if (tabData.columns.lookups.length === 2) {
						report.labels[0] = this.mntLabelText(this.parseXAxesValues(tabData.rows.lookups[0][0]));
					} else {
						for (let labelId in tabData.columns.lookups[0]) {
							report.labels.push(tabData.columns.lookups[0][labelId])
						}
					}
				} else {
					if (tabData.columns.lookups.length === 2) {
						report.labels[0] = this.mntLabelText(this.parseXAxesValues(tabData.rows.lookups[0][0]));
					} else {
						if (tabData.rows.lookups.length == 1) {
							report.labels[0] = this.mntLabelText(this.parseXAxesValues(tabData.columns.lookups[0][0]));

						} else {
							for (let labelId in tabData.rows.lookups[0]) {
								report.labels.push(tabData.rows.lookups[0][labelId])
							}
						}
					}
				}
			}
			else if (tabData.columns.lookups.length === 2) {
				if (direction == 'columns') {
					chartLabels = tabData.columns.tree.index;
				}
				else {
					chartLabels = tabData.rows.tree.children[0].index;
				}

				for (let labels in chartLabels) {
					if (this.checkPrivateLabel(labels)) continue;

					if (report.type == "pie" || report.type == "doughnut") {
						report.labels[chartLabels[labels][0]] = this.mntLabelText(tabData[direction].lookups[opIndex][labels]);
					}
					report.labels[chartLabels[labels][0]] = this.mntLabelText(this.parseXAxesValues(tabData[direction].lookups[opIndex][labels]));
				}
			} else {
				for (let i in tabData[direction].tree.index) {
					const position = tabData[direction].tree.index[i][0] // posição no array
					let legenda = tabData[direction].lookups[0][i]
					report.labels[position] = legenda;
				}
			}
		}
	}

	private mntLabelText(label) {
		label = label.trim().replace(/\s\s+/g, ' ');;

		if (label.length > 12) {
			label = label.substring(0, 12) + '...';
		}

		return label;
	}

	private getReportOptions(report: Report) {
		let _self = this;
		let options = {
			layout: {
				padding: {
					top: report.showValues ? 15 : 0
				}
			},
			responsive: true,
			maintainAspectRatio: false,
			tooltips: {
				mode: 'nearest'
			},
			pieceLabel: {
				render: (args) => {

					if(report.showValues && (report.type == 'pie' || report.type == 'doughnut')){
						if (report.roundValues) {
							if (args.value >= 1000000) {
								return (args.value / 1000000).toFixed(1) + 'M';
							}
							if (args.value >= 1000) {
								return (args.value / 1000).toFixed(1) + 'k';
							}
						}
						return args.value;
					}
				},
				fontStyle: 'bold',
				overlap: true,
				fontColor: '#000'
			},
			animation: {
				easing: 'easeOutBounce',
				animateScale: true,
				animateRotate: true,
				// onProgress: function(animation) {
				//     console.log(animation);

				//     animation.onAnimationComplete = () => {
				//         let ctx = this.chart.ctx;
				//         this.chart.height = ctx.canvas.height;
				//     }
				// },
				onComplete: function () {
					if (report.showValues && !(report.type == 'pie' || report.type == 'doughnut')) {
						var chartInstance = this.chart, ctx = chartInstance.ctx;
						ctx.textBaseline = 'bottom';
						this.data.datasets.forEach(function (dataset, i) {
							var meta = chartInstance.controller.getDatasetMeta(i);
							if (!meta.hidden) {
								meta.data.forEach(function (bar, index) {
									let data = dataset.data[index];
									data = _self.fmtData(data, report.valueFormat, report.roundValues);
									ctx.textAlign = "center";
									ctx.fillText(data, bar._model.x, bar._model.y);
								});
							}
						});
					}
				}
			},
			scales: {
				xAxes: [{
					stacked: false,
					display: report.showXAxes && (report.type != 'pie' && report.type != 'donut'),
					ticks: {
						beginAtZero: true,
						autoSkip: report.type == 'bar' || report.type == 'stackedBar' ? false : true,
						callback: (value, index, values) => {
							let format = report.metricFormat.split(" ", 1);
							let parsedFormat;
							if ((format[0] === '%' || format[0] === '$') && !isNaN(Number(String(value).replace(/[,kK]/g, '')))) {
								parsedFormat = format[0];
							}
							else {
								parsedFormat = '';
							}
							if (report.roundValues) {
								if (value >= 1000000) {
									return parsedFormat + (value / 1000000) + 'M';
								}
								if (value >= 1000) {
									return parsedFormat + (value / 1000) + 'k';
								}
								if (value < 1 && value > 0) {
									return parsedFormat + value.toFixed(1);
								}
								if (format[0] === '%') {
									return value + parsedFormat;
								}
							}
							return parsedFormat + value;
						}
					}
				}],
				yAxes: [{
					stacked: false,
					display: report.showYAxes && (report.type != 'pie' && report.type != 'donut'),
					ticks: {
						beginAtZero: true,
						callback: (value, index, values) => {
							let format = report.metricFormat.split(" ", 1);
							format[0] = format[0].replace('[=null]', '');
							let parsedFormat;
							if (typeof format[0] === 'string' && format[0].includes('%') && !isNaN(Number(String(value).replace(/[,kK]/g, '')))) {
								parsedFormat = '%';
								report.valueFormat = '%';
							} else if (typeof format[0] === 'string' && format[0].includes('$') && !isNaN(Number(String(value).replace(/[,kK]/g, '')))) {
								parsedFormat = '$';
								report.valueFormat = '$';
							}
							else {
								parsedFormat = '';
								report.valueFormat = '';
							}

							if (report.roundValues) {
								if (value >= 1000000) {
									return parsedFormat + (value / 1000000) + 'M';
								}
								if (value >= 1000) {
									return parsedFormat + (value / 1000) + 'k';
								}
								if (value < 1 && value > 0) {

									return parsedFormat === '$' ? parsedFormat + value.toFixed(1) : (value * 100) + parsedFormat;
								}
								if (parsedFormat === '%') {
									return value + parsedFormat;
								}

							}
							return parsedFormat + value;
						}
					}
				}]
			},
			legend: {
				position: 'bottom',
				display: report.showLegend,
				fontFamily: 'Nunito-Regular'
			}
		}

		if (report.type == 'stackedArea' || report.type == "stackedBar") {
			options.scales.xAxes[0].stacked = true;
			options.scales.yAxes[0].stacked = true;
		}

		return options;
	}

	private fmtData(data, valueFormat: string, roundValues?: boolean) {
		data = data * 1;
		if (roundValues) {
			if (data >= 1000000) {
				return (data / 1000000).toFixed(1) + 'M';
			}
			if (data >= 1000) {
				return (data / 1000).toFixed(1) + 'k';
			}
			if (data < 1 && data > 0) {
				return valueFormat === '%' ? (data * 100).toFixed(0) + valueFormat : data.toFixed(0);
				// return data.toFixed(0);
			}
		}

		return data;
	}

	private getColors(reportType) {
		let colors = [
			['azul', 'rgba(  65, 105, 225, [OPP] )'],
			['laranja', 'rgba( 255, 140,   0, [OPP] )'],
			['purple', 'rgba( 128,   0, 128, [OPP] )'],
			['chocolate', 'rgba( 210, 105,  30, [OPP] )'],
			['darkcyan', 'rgba(   0, 139, 139, [OPP] )'],
			['pink', 'rgba( 244, 119, 220, [OPP] )'],
			['yellow', 'rgba( 251, 242,  48, [OPP] )'],
			['grape', 'rgba( 101,  73, 148, [OPP] )'],
			['strangegreen', 'rgba( 177, 197,   8, [OPP] )'],
			['salmon', 'rgba( 254, 170, 144, [OPP] )'],
			['darkblue', 'rgba(  26,  53,  71, [OPP] )'],
			['gold', 'rgba( 216, 161,  27, [OPP] )'],
			['wine', 'rgba( 124,   0,   0, [OPP] )']
		];

		let ret = [];
		for (let i = 0; i < colors.length; i++) {
			let corSolid = colors[i][1].replace('[OPP]', '1');
			let corGrad = colors[i][1].replace('[OPP]', '0.7');
			let corPreen = colors[i][1].replace('[OPP]', '0.3');

			if (reportType.toLowerCase().indexOf('area') == -1) {
				corPreen = corSolid;
			}

			if (reportType == 'pie' || reportType == 'donut') {
				ret.push(corSolid);
			} else {
				ret.push({
					backgroundColor: corPreen,
					borderColor: corSolid,
					pointBackgroundColor: corSolid,
					pointBorderColor: corSolid,
					pointHoverBackgroundColor: corSolid,
					pointHoverBorderColor: corGrad
				});
			}
		}

		if (reportType == 'pie' || reportType == 'donut') {
			return [{ backgroundColor: ret }];
		}

		return ret;
	}


	private setGridReport(dataResult, report: Report, reportMeta) {
		let headers = [];
		if (report.attributes.length > 0) {
			for (let header in report.attributes) {
				if (report.attributes[header] !== 'metricGroup') {
					headers.push(report.attributes[header].title);
				} else {
					headers.push("");
				}
			}
		} else {
			headers.push("");
		}

		for (let header in dataResult.xtab_data.columns.lookups[0]) {
			headers.push(dataResult.xtab_data.columns.lookups[0][header])
		}
		report.table.headers = headers;
		let rows = [];

		let lines = 0;
		let rowsIndex = dataResult.xtab_data.rows.tree.index;
		let lookupValues = dataResult.xtab_data.rows.lookups;
		//rows   [{"12345": [0]},{"12346": [1]},{"12354": [3]}]
		for (let rowId in rowsIndex) {
			//rowId ex "12345"
			let columnIndex = 0;

			// rowValue ex "Jan 2016"
			let rowValue = !isNaN(parseInt(rowId)) ? lookupValues[columnIndex][rowId] : rowId;
			let row = {
				id: rowId,
				value: rowValue,
				childs: []
			};

			// segundo nivel
			let childNode = dataResult.xtab_data.rows.tree.children[rowsIndex[rowId][0]]
			if (childNode.children.length < 1) {
				let values = dataResult.xtab_data.data[childNode.first];
				row['values'] = values;
			}
			columnIndex++;
			for (let childId in childNode.index) {
				let childRow = {
					id: childId,
					value: lookupValues[columnIndex][childId],
					childs: []
				}
				let subChildNode = dataResult.xtab_data.rows.tree.children[rowsIndex[rowId][0]].children[childNode.index[childId]]
				if (subChildNode.children.length < 1) {
					let values = dataResult.xtab_data.data[subChildNode.first];
					childRow['values'] = values;
				}

				columnIndex++;
				for (let subChildId in subChildNode.index) {
					let subChildRow = {
						id: subChildId,
						value: lookupValues[columnIndex][subChildId],
						childs: []
					}
					if (subChildNode.children.length < 1) {
						let values = dataResult.xtab_data.data[subChildNode.first];
						subChildRow['values'] = values;
					}


					//terceiro nivel
					let subChild2Node = dataResult.xtab_data.rows.tree.children[rowsIndex[rowId][0]].children[childNode.index[childId]].children[subChildNode.index[subChildId]]
					subChildRow['rowspan'] = subChild2Node.children.length;
					if (subChild2Node.children.length < 1) {
						let values = dataResult.xtab_data.data[subChild2Node.first];
						subChildRow['values'] = values;
						subChildRow['rowspan'] = 1;
					}
					columnIndex++;
					for (let subChild2Id in subChild2Node.index) {
						let subChild2Row = {
							id: subChild2Id,
							value: lookupValues[columnIndex][subChild2Id],
							childs: []
						}
						let subChild3Node = dataResult.xtab_data.rows.tree.children[rowsIndex[rowId][0]].children[childNode.index[childId]].children[subChildNode.index[subChildId]].children[subChild2Node.index[subChild2Id]]
						if (subChild3Node.children.length < 1) {
							lines++;
							let values = dataResult.xtab_data.data[subChild3Node.first];
							subChild2Row['values'] = values;
						}
						subChild2Row['rowspan'] = subChildRow.childs.length;
						subChildRow.childs.push(subChild2Row);
					}
					columnIndex--;
					childRow.childs.push(subChildRow);
				}
				childRow['rowspan'] = 0;
				childRow.childs.map(row => {
					childRow['rowspan'] = childRow['rowspan'] + row.childs.length;
					return row;
				});
				row.childs.push(childRow);
				columnIndex--;
			}
			columnIndex--;

			row['rowspan'] = lines

			rows.push(row)
			lines = 0;

		}
		report.table.rows = rows;
		return report;
	}


	getReportDefinitions(link) {
		let url = link.replace('/gdc/', '');

		return this._httpService.get(url);
	}

	getLatestDefinition(reportDefinitions) {
		let latest = reportDefinitions[reportDefinitions.length - 1];
		let url = latest.replace('/gdc/', '');

		return this._httpService.get(url)
			.retry(2);
	}

	executeReport(definition) {
		let url = `/projects/${this.session.projectId}/execute`;
		let body = {
			report_req: {
				reportDefinition: definition.reportDefinition.meta.uri
			}
		};

		return this._httpService.post(url, body);

	}

	getFilters(reportView) {
		let filters = [];
		for (let filter of reportView.filters) {
			let temp = {};
			//get type
			temp['type'] = filter.tree.type;
			//get attribute / filters

			if (filter.tree.content) {
				temp['elements'] = {
					attribute: '',
					ids: []
				}
				for (let content of filter.tree.content) {
					temp['elements'].type = content.type;
					if (temp['elements'].type === 'attribute object') {
						temp['elements'].attribute = content.value;
					}
					if (temp['elements'].type === 'list') {
						for (let id of content.content) {
							temp['elements'].ids.push(id.value);
						}
					}
					if (temp['elements'].type === '-' || temp['elements'].type === '+' || temp['elements'].type === '=') {
						temp['elements'].expression = content.type;
						for (let id of content.content) {
							temp['elements'].ids.push(id.value);
						}
					}
					if (temp['elements'].type === 'time macro') {
						temp['elements'].ids.push(content.value);
					}
				}

				filters.push(temp);
			}
			if (filter.tree.value) {
				temp['elements'] = {
					value: '',
					expression: ''
				}
				temp['elements'].value = filter.tree.value;
				temp['elements'].expression = filter.expression;

				filters.push(temp);
			}
		}
		return filters;
	}

	getReportData(uri) {
		let url = uri.replace('/gdc/', '');

		return this._httpService.get(url, { observe: 'response' })
			.map(response => {
				if (response.status === 202) {
					throw 'refaça a chamda, http status 202';
				}

				if (response.status === 204) {
					return null;
				}

				return response.body;
			})
			.retryWhen(error => {
				return error.delay(300);
			});
	}

	parseLineGraphs(dataResult) {
		let values = [];
		//parse dos dados
		let items = dataResult.xtab_data.rows.lookups[0];
		for (let v of dataResult.xtab_data.rows.tree.children) {
			for (let i in items) {
				if (i == v.id) {
					for (let data in dataResult.xtab_data.data) {
						if ((data >= v.first) && (data <= v.last)) {
							let d = {
								label: items[i],
								data: dataResult.xtab_data.data[data],
								borderWidth: 2,
								pointBorderWidth: 1,
								pointHoverRadius: 2,
								pointHoverBorderWidth: 2,
								pointRadius: 1.5
							}
							values.push(d);
						}
					}
				}
			}
		}
		//Deixa as linhas sem curvas
		for (let v in values) {
			values[v]['fill'] = false;
			values[v]['stepped'] = true;
		}
		return values;
	}

	parseAreaGraphs(dataResult) {
		let values = [];
		//parse dos dados
		let items = dataResult.xtab_data.rows.lookups[0];
		for (let v of dataResult.xtab_data.rows.tree.children) {
			for (let i in items) {
				if (i == v.id) {
					for (let data in dataResult.xtab_data.data) {
						if ((data >= v.first) && (data <= v.last)) {
							let d = {
								label: items[i],
								data: dataResult.xtab_data.data[data],
								borderWidth: 2,
								pointBorderWidth: 1,
								pointHoverRadius: 2,
								pointHoverBorderWidth: 2,
								pointRadius: 1.5
							}
							values.push(d);
						}
					}
				}
			}
		}
		return values;
	}

	parseBarGraphs(dataResult, report) {
		//verificar como descobrir se é agrupado por atributo. sortedLookup esta errado;
		let values = [];
		if (dataResult.xtab_data.sortedLookups) {

			if (dataResult.xtab_data.columns.lookups.length <= 2) {
				let path;
				if (Object.keys(dataResult.xtab_data.columns.lookups[0]).length > 1) {
					path = 'columns';
				} else if (Object.keys(dataResult.xtab_data.rows.lookups[0]).length > 1) {
					path = 'rows';
				} else {
					console.log(dataResult);
					throw new Error('Caiu em um caso que o dataResult iria crashar o gráfico');
				}

				// Premissas
				// O dado já vem ordenado da forma que deve ser exibido.
				let keyOrdered = Object.keys(dataResult.xtab_data[path].tree.index)
					.sort((a, b) => {
						if (dataResult.xtab_data[path].tree.index[a] < dataResult.xtab_data[path].tree.index[b]) {
							return -1;
						}

						if (dataResult.xtab_data[path].tree.index[a] > dataResult.xtab_data[path].tree.index[b]) {
							return 1;
						}

						return 0;
					});


				let labels = keyOrdered.map(key => {
					let legendObj = dataResult.xtab_data[path].lookups[0];
					return legendObj[key];
				});

				if (path == 'rows') {
					if (dataResult.xtab_data.rows.lookups.length == 1) {
						let values = [];

						let legends = dataResult.xtab_data.rows.lookups[0];
						for (let item in legends) {
							let items = [];
							let data = [];

							let dataIndex = dataResult.xtab_data.rows.tree.index[item][0];
							data = dataResult.xtab_data.data[dataIndex];
							let color = this.getColors('pie')[0].backgroundColor[item];
							let d = {
								label: legends[item],
								data: data,
								backgroundColor: color
							}
							values.push(d);
						}
						return values;
					}
					if (dataResult.xtab_data.rows.lookups.length > 1) {
						let dataSets = dataResult.xtab_data.rows.lookups[1];
						let dataSetsParsed = []
						for (let dataSet in dataSets) {
							let dataSetParsed = {};
							dataSetParsed['label'] = dataSets[dataSet]
							dataSetParsed['data'] = [];

							let items = dataResult.xtab_data.rows.tree.index;
							for (let v in items) {
								let index = items[v][0];
								let item = dataResult.xtab_data.rows.tree.children[index];
								if (dataSet in item.index) {
									let dataID = item.index[dataSet][0]
									dataID = item.children[dataID].first;
									let data = dataResult.xtab_data.data[dataID][0]
									dataSetParsed['data'].push(data)
								} else {
									dataSetParsed['data'].push(0)
								}
							}
							dataSetsParsed.push(dataSetParsed)
						}

						values = dataSetsParsed;
					}
				} else {
					values = dataResult.xtab_data.data[0].map((data, index) => {
						return {
							label: labels[index],
							data: [data]
						};
					});
				}
			} else {
				let path;
				if (Object.keys(dataResult.xtab_data.columns.lookups[1]).length > 1) {
					path = 'columns';
				} else if (Object.keys(dataResult.xtab_data.rows.lookups[0]).length >= 1) {
					path = 'rows';
				} else {
					console.log(dataResult);
					throw new Error('Caiu em um caso que o dataResult iria crashar o gráfico');
				}

				let dataSets = dataResult.xtab_data.columns.lookups[1];
				let dataSetsParsed = []
				for (let dataSet in dataSets) {
					let dataSetParsed = {};
					dataSetParsed['label'] = dataSets[dataSet]
					dataSetParsed['data'] = [];

					let items = dataResult.xtab_data.columns.tree.index;
					for (let v in items) {
						let index = items[v][0];
						let item = dataResult.xtab_data.columns.tree.children[index];
						if (dataSet in item.index) {
							let dataID = item.index[dataSet][0]
							dataID = item.children[dataID].first;
							let data = dataResult.xtab_data.data[0][dataID]
							dataSetParsed['data'].push(data)
						} else {
							dataSetParsed['data'].push(0)
						}
					}
					dataSetsParsed.push(dataSetParsed)
				}

				values = dataSetsParsed;

			}


			return values;
		}

		if (dataResult.xtab_data.columns.lookups.length === 1) {
			return this.parseBarGraphs1Lookups(dataResult);
		}
		if (dataResult.xtab_data.columns.lookups.length === 2) {
			return this.parseBarGraphs2Lookups(dataResult);
		}
		if (dataResult.xtab_data.columns.lookups.length === 3) {
			return this.parseBarGraphs3Lookups(dataResult);
		}

		throw new UnsupportedChartError();
	}

	private parseBarGraphs1Lookups(dataResult) {
		let values = [];

		let legends = dataResult.xtab_data.columns.lookups[0];
		for (let item in legends) {
			let items = [];
			let data = [];
			for (let dataItem in dataResult.xtab_data.data) {
				data.push(dataResult.xtab_data.data[dataItem][0]);
			}
			let color = this.getColors('pie')[0].backgroundColor[item];
			let d = {
				label: legends[item],
				data: data,
				backgroundColor: color
			}
			values.push(d);
		}
		return values;
	}

	private parseBarGraphs2Lookups(dataResult) {
		let values = [];

		let legends = dataResult.xtab_data.columns.lookups[1];
		for (let item in legends) {
			let items = [];
			let data = [];
			for (let value of dataResult.xtab_data.columns.tree.children) {

				for (let v in value.index) {
					if (value.index[v][0] == item) {
						data.push(dataResult.xtab_data.data[0][value.children[v].first]);
					}
				}
			}
			let color = this.getColors('pie')[0].backgroundColor[item];
			let d = {
				label: legends[item],
				data: data,
				backgroundColor: color
			}
			values.push(d);
		}
		return values;
	}

	private parseBarGraphs3Lookups(dataResult) {
		let values = [];

		let labels = dataResult.xtab_data.columns.lookups[2];
		for (let label in labels) {
			let data = [];
			for (let value in dataResult.xtab_data.columns.tree.children[0].children) {
				for (let v of dataResult.xtab_data.columns.tree.children[0].children[value].children) {
					if (v.id === label) {
						data.push(dataResult.xtab_data.data[0][v.first]);
					}
				}
			}
			let d = {
				label: labels[label],
				data: data
			}
			values.push(d);
		}
		return values;
	}

	parsePieAndDonutGraphs(dataResult) {
		let values = [];
		let order = dataResult.xtab_data.columns.tree.index;

		let items = dataResult.xtab_data.rows.lookups[0];

		for (let v of dataResult.xtab_data.rows.tree.children) {
			for (let i in items) {
				if (i == v.id) {
					for (let data in dataResult.xtab_data.data) {
						if ((data >= v.first) && (data <= v.last)) {
							let d = {
								label: items[i],
								borderWidth: 1,
								data: dataResult.xtab_data.data[data]
							}
							values.push(d);
						}
					}
				}
			}
		}
		return values;
	}

	private parseXAxesValues(value: string) {
		if (value.length > 19) {
			return value.substring(0, 16) + '...';
		}
		return value;
	}

	checkPrivateLabel(label) {
		switch (label) {
			case 'avg':
			case 'max':
			case 'med':
			case 'min':
			case 'nat':
			case 'sum':
				return true;
			default:
				return false;
		}
	}
}
