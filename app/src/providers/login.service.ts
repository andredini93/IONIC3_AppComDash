import { Injectable ,Inject} from '@angular/core';
import { SessionService } from './session.service';
import { MingleService, HttpRequestOptions } from '@totvs/mobile-mingle'
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';

@Injectable()
export class LoginService {

    constructor(
        private _http: HttpClient, 
		private _mingleService: MingleService,
		private _sessionService: SessionService
	) { }

    doLogin(user: string, password: string, alias: string) {
        let payload = {
            postUserLogin: {
                login: user,
                password: password,
                remember: 1,
                verify_level: 2,
                alias: alias
			}
		};
		
		// Devemos assinalar o alias que está sendo usado utilizadno antes de tentar o login,
		// para que o session service defina o servidor que devera realizar o login
    this._sessionService.ALIAS = alias;

        return this._http.post(this._sessionService.SERVER + '/account/login', payload, { observe: 'response' })
            .flatMap((res: any) => {
                debugger
                this._sessionService.EMAIL = user;
                this._sessionService.USER_ID = res.body.userLogin.profile.replace('/gdc/account/profile/', '');
                console.log('SST - ' + res.headers.get('X-GDC-AuthSST'));
                console.log('GDCAuthTT - ' + res.headers.get('X-GDC-AuthTT'));
                this._sessionService.TOKEN_SST = res.headers.get('X-GDC-AuthSST');
                this._sessionService.TOKEN_TT = res.headers.get('X-GDC-AuthTT');
                document.cookie = "GDCAuthSST=" + this._sessionService.TOKEN_SST;
                let custom = {
                    authTT: this._sessionService.TOKEN_TT,
					          alias: this._sessionService.ALIAS,
                    // para rodar no browser: userAgent: navigator.userAgent
                    userAgent: this._sessionService.userAgent
                };
				
				return this._mingleService.auth.analytics(custom.authTT, custom.userAgent, alias)
					.map(() => custom);
			});
    }

    refreshToken() {
		let header = new HttpHeaders();
        header = header.append('Accept', 'application/json');
        header = header.append('X-GDC-AuthSST', this._sessionService.TOKEN_SST);
        return this._http.get(this._sessionService.SERVER + 'gdc/account/token', { headers: header, observe: 'response' })
            .map((res: HttpResponse<any>) => {
                this._sessionService.TOKEN_TT = res.headers.get('X-GDC-AuthTT');
				this._mingleService.registerAnalyticsToken(this._sessionService.TOKEN_TT, this._sessionService.userAgent);
                return res;
            }
        );
    }

    public logout() {
		return Promise.all([
			this._mingleService.auth.logout().toPromise(),
			this._sessionService.clear()
		]);
    }

}