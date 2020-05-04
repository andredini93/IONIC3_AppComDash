import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';
import { Http, XHRBackend, RequestOptions, Request, RequestOptionsArgs, RequestMethod, Response, Headers } from '@angular/http';
declare var $: any;

@Injectable()
export class Resource extends Http {
	public pendingRequests: number = 0;
	protected http: Http;

	constructor(backend: XHRBackend, defaultOptions: RequestOptions, http: Http) {
		super(backend, defaultOptions);
		this.http = http;
	}

	intercept(observable: Observable<Response>): Observable<Response> {
		let msgRet: any;
		let erro: string;

		this.pendingRequests++;
		return observable
			.catch((err, source) => {
				erro = err.status;
				erro = erro.toString().substring(0, 1);
				if (err == "4" || err == "5") {
					if (err.status == 401 || err.status == 419) {
						msgRet =
							{
								code: err.status,
								message: "Sua sessão expirou, você deverá fazer o login novamente",
								detail: ""
							}
					}
				} else if (err == "0") {
					msgRet = "";
					msgRet =
						{
							code: 0,
							message: "A conexão com o sistema foi perdida. Verifique se o servidor de aplicação está em execução e operando corretamente",
							detail: ""
						}
				}

				console.log(msgRet);

				return Observable.throw(err);
			})
			.do((res: Response) => {
				console.log("Resposta: " + res);
			}, (err: any) => {
				console.log("Erro: " + err);
			})
			.finally(() => {
				console.log("Finally.. delaying, though.")
			});
	}

	request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
		return this.intercept(super.request(url, options));
	}

	get(url: string, options?: RequestOptionsArgs): Observable<Response> {
		return this.intercept(super.get(url, options));
	}

	getUrl(url: string, headerP: any) {

		console.log("Realizando Chamadas GET.");
		let headers = new Headers();
		let requestOptions = new RequestOptions({
			method: RequestMethod.Get,
			url: url,
			headers: headers,
			body: ''
		});

		headers = this.appendHeader(headerP);

		return this.http
			.request(new Request(requestOptions))
			.map((res: Response) => {
				console.log(res);
				return res;
			});
	}

	post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
		return this.intercept(super.post(url, body, this.getRequestOptionArgs(options)));
	}

	postUrl(url: string, bodyP: string, headerP: any) {
		console.log("Realizando Chamadas Post.");
		var headers = new Headers();
		var requestOptions = new RequestOptions({
			method: RequestMethod.Post,
			url: url,
			headers: headers,
			body: bodyP
		});

		headers = this.appendHeader(headerP);

		return this.http
			.request(new Request(requestOptions))
			.map((res: Response) => {
				console.log(res);
				return res;
			});
	}

	put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
		return this.intercept(super.put(url, body, this.getRequestOptionArgs(options)));
	}

	puttUrl(url: string, bodyP: string, headerP: any) {
		console.log("Realizando Chamadas Put.");
		var headers = new Headers();
		var requestOptions = new RequestOptions({
			method: RequestMethod.Put,
			url: url,
			headers: headers,
			body: bodyP
		});

		headers = this.appendHeader(headerP);

		return this.http
			.request(new Request(requestOptions))
			.map((res: Response) => {
				console.log(res);
				return res;
			});
	}

	delete(url: string, bodyP: string, options?: RequestOptionsArgs): Observable<Response> {
		return this.intercept(super.delete(url, options));
	}

	deleteUrl(url: string, bodyP: string, headerP: any, ) {
		console.log("Realizando Chamadas Delete.");
		var headers = new Headers();
		var requestOptions = new RequestOptions({
			method: RequestMethod.Delete,
			url: url,
			headers: headers,
			body: bodyP
		});

		headers = this.appendHeader(headerP);

		return this.http
			.request(new Request(requestOptions))
			.map((res: Response) => {
				console.log(res);
				return res;
			});
	}

	getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
		return options;
	}

	appendHeader(headerp: any) {
		let headers = new Headers({ 'Accept': 'application/json', 'Content-Type': 'application/json' });

		for (let item of headerp) {
			headers.append(item[0], item[1])

		}
		return headers;

	}

}
