import { LoginService } from './login.service';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { SessionService } from "./session.service";
import { App } from 'ionic-angular';
import { HttpRequestOptions } from '@totvs/mobile-mingle';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';

@Injectable()
export class HttpService {

	constructor(
		private _app: App,
		private _http: HttpClient,
		private _loginService: LoginService,
		private _sessionService: SessionService,
		private _storage: Storage
	) { }

	public get(url: string, options: any = {}) {
		options.headers = this._setHeaders(options.headers);
		
		return this._http.get(this._sessionService.SERVER + url, options)
			.catch(error => {
				if (error.status === 401 || error.status === 0 || error.status == null) {
					return this._loginService.refreshToken()
						.flatMap(authToken => {
							options.headers = this._setHeaders(options.headers);
							return this._http.get(this._sessionService.SERVER + url, options);
						});
				}
				return Observable.throw(error);
			});
	}

	public put(urn: string, body: any, options: any = {}) {
		options.headers = this._setHeaders(options.headers);
		return this._http.put(this._sessionService.SERVER + urn, body, options);
	}

	public post(urn: string, body: any, options: any = {}) {
		options.headers = this._setHeaders(options.headers);
		return this._http.post(this._sessionService.SERVER + urn, body, options);
	}

	public delete(urn: string, options: any = {}) {
		options.headers = this._setHeaders(options.headers);
		return this._http.delete(this._sessionService.SERVER + urn, options);
	}

	public patch(urn: string, options: any = {}) {
		options.headers = this._setHeaders(options.headers);
		return this._http.patch(this._sessionService.SERVER + urn, options);
	}

	private _setHeaders(headers: HttpHeaders) {
		if (!headers) {
			headers = new HttpHeaders();
		}

		headers = headers.set('Content-Type', 'application/json');
		headers = headers.set('X-GDC-AuthTT', this._sessionService.TOKEN_TT);
		return headers;
	}
}