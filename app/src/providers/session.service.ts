import { Injectable, EventEmitter } from '@angular/core';
import 'rxjs/add/operator/map';
import { Platform } from 'ionic-angular'
import { StorageService } from './storage.service';

@Injectable()
export class SessionService {

	public nav = new EventEmitter();

	public projectId: string;
	public projectName: string;
	public userAgent: string;
	public TOKEN_TT: string;

	private _ALIAS;
	get ALIAS(): string {
		return this._ALIAS;
	}
	set ALIAS(alias: string) {
		this._storageService.set('ALIAS', alias);
    this._ALIAS = alias;
		if (!this._platform.is('cordova')) {
			this.SERVER = 'gooddata/'
			this.userAgent = navigator.userAgent;
		}
		else if (alias == 'FASTANALYTICS' || alias == 'TOTVSANALYTICS') {
			this.SERVER = 'https://analytics.totvs.com.br/gdc'
			this.userAgent = 'Analytics/1';
		} else {
			this.SERVER = 'https://analytics.fluig.com/gdc'
			this.userAgent = 'Analytics/1';
    }
    alert('SERVER: ' + this.SERVER);
	}

	private _REMEMEBER_ME
	get REMEMEBER_ME(): boolean {
		return this._REMEMEBER_ME;
	}
	set REMEMEBER_ME(rememberMe: boolean) {
		this._REMEMEBER_ME = rememberMe;
		this._storageService.set('rememberMe', rememberMe);
	}

	private _SERVER;
	get SERVER(): string {
		return this._SERVER;
	}
	set SERVER(server: string) {
		this._storageService.set('SERVER', server);
		this._SERVER = server;
	}

	private _TOKEN_SST;
	get TOKEN_SST(): string {
		return this._TOKEN_SST;
	}
	set TOKEN_SST(TOKEN_SST: string) {
		this._storageService.set('TOKEN_SST', TOKEN_SST);
		this._TOKEN_SST = TOKEN_SST;
	}

	private _USER_ID;
	get USER_ID(): string {
		return this._USER_ID;
	}
	set USER_ID(USER_ID: string) {
		this._storageService.set('USER_ID', USER_ID);
		this._USER_ID = USER_ID;
	}

	private _EMAIL;
	get EMAIL(): string {
		return this._EMAIL;
	}
	set EMAIL(email: string) {
		this._storageService.set('EMAIL', email);
		this._EMAIL = email;
	}

	constructor(
		private _platform: Platform,
		private _storageService: StorageService
	) { }

	//VERIFICA SE TEM SALVO NO STORAGE O SST E O USER_ID , 
	//caso não tenha, será forçado um erro para que o user faço o login novamente.
	// Porém, se o usuário não tiver selecionado o remeamber me, ele também lançara uma exception.
	public async initSession() {

		await this._loadoutSessionValues();
		this.setUserAgent();
		if (!this._TOKEN_SST || !this._USER_ID || !this._EMAIL) {
			throw new Error('There is no login info to update');
		}
		await this._shouldIRemember();
	}

	private async _shouldIRemember() {
		let key = 'rememberMe';
		let isReminderSet = await this._storageService.isKeySet(key);
		if (isReminderSet) {
			let shouldIRemember = await this._storageService.get(key);

			if (!shouldIRemember) {
				await this.clear();
				throw new Error('I\'m sorry, I musn\'t remember you');
			}
		}
	}

	public async clear(): Promise<void> {
		await this._storageService.remove('ALIAS');
		await this._storageService.remove('EMAIL');
		await this._storageService.remove('project')
		await this._storageService.remove('SERVER');
		await this._storageService.remove('TOKEN_SST');
		await this._storageService.remove('USER_ID');
	}

	public navigation(page: string) {
		this.nav.emit(page);
	}

	private setUserAgent(): void {
		if (!this._platform.is('cordova')) {
			this.SERVER = 'gooddata/'
			this.userAgent = navigator.userAgent;
		} else {
			this.userAgent = 'Analytics/1';
		}
	}

	private async _loadoutSessionValues() {
		this._ALIAS = await this._storageService.get('ALIAS');
		this._EMAIL = await this._storageService.get('EMAIL');
		this._SERVER = await this._storageService.get('SERVER');
		this._TOKEN_SST = await this._storageService.get('TOKEN_SST');
		this._USER_ID = await this._storageService.get('USER_ID');
	}
}
