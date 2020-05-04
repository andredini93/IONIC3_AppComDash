import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import 'rxjs/add/operator/map';

@Injectable()
export class AppService {
	
	constructor(
		private _httpService: HttpService
	) { }
	
    public getAppsByProject(projectId){
		let url = `md/${projectId}/query/domains`;
		
		return this._httpService.get(url, {})
			.map(res => {
                let appList = res.query.entries.filter(app =>{
					return app.title.startsWith("#Mobile");
				});

                return appList;
            });
    }

}
