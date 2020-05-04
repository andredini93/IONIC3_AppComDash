import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpService } from './http.service';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';

@Injectable()
export class ReportsService {

	@Output() showFilters = new EventEmitter(true);

    constructor(
		private _httpService: HttpService
	) { }

    getReportsList(projectId) {
        let url = `md/${projectId}/query/reports?showAll=1`;
        return this._httpService.get(url, {})
			.retry(3)
			.map(res => {
				return res.query.entries;
			});
    }

    getReportsByProject(projectId) {
		let url = `md/${projectId}/query/reports`;
		return this._httpService.get(url, {});
    }

    getReportsByApp(link) {
		let url = link.replace('/gdc/', '');
		
        return this._httpService.get(url, {})
        	.retry(3)
        	.map(res => {
                return res.domain;
			})
			.retry(2);
    }

    getReport(link) {
		let url = link.replace('/gdc/', '');
		
        return this._httpService.get(url, {})
        	.retry(3);
    }
    
    getDefinition(link) {
		let url = link.replace('/gdc/', '');
		
        return this._httpService.get(url , {});
    }
}
