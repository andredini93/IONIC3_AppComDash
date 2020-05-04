import { MingleService } from '@totvs/mobile-mingle';
import { Component, ViewChild } from '@angular/core';
import { NavController, App, ToastController, LoadingController } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ConfigPage } from '../config/config';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginService } from '../../providers/login.service';
import { TranslateService } from '@ngx-translate/core';
import { Device } from 'ionic-native';
import { AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage'

import { ReloadProject } from '../reload-project/reload-project';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
	selector: 'page-login',
	templateUrl: 'login.html'
})
export class LoginPage {
	login: FormGroup;
	showErrors: boolean = false;
	public rememberMe = true;
	public aliases = [
		{
			value: 'TOTVSANALYTICS',
			label: 'Fast Analytics'
		},
		{
			value: 'TOTVSANALYTICS',
			label: 'Smart Analytics'
		},
		{
			value: 'FLUIGANALYTICS',
			label: 'Fluig Analytics'
		}
	];

	constructor(
		private _app: App,
		private _formBuilder: FormBuilder,
		private _loadingCtrl: LoadingController,
		private _loginService: LoginService,
		private _mingleService: MingleService,
		private _navCtrl: NavController,
		private _storage: Storage,
		private _toastCtrl: ToastController,
		private _translateService: TranslateService
	) {

		this.login = this._formBuilder.group({
			user: ['', Validators.required],
			password: ['', Validators.required],
			showPassword: false,
			alias: this.aliases[0]
		});
	}

	public async ionViewDidLoad() {
		let key = 'rememberMe';
		let shouldRemember = await this._storage.get(key);
		if (shouldRemember == null || shouldRemember == undefined) {
			await this._storage.set(key, true);
			return;
		}

		this.rememberMe = shouldRemember;
	}

	public doLogin(user: string, password: string, alias: any) {
		if (alias instanceof Array) {
			alias = alias[0];
		}

		let loader = this._loadingCtrl.create({});
		loader.present();

		this._loginService.doLogin(user, password, alias.value)
			.flatMap(auth => {
				this._mingleService.registerMetric('GOODATA_ALIAS', { alias: alias.label });
				return this._mingleService.getUserData('projects');
			})
			.subscribe(projects => {
				if (Object.keys(projects).length === 0 || projects['projects'].length === 0) {
					this._navCtrl.setRoot(ConfigPage);
				} else {
					this._navCtrl.setRoot(ReloadProject);
				}
				loader.dismiss();
			},
				(authError) => {
					loader.dismiss();
					this._showErrorToast(authError);
				});
	}

	public managePwd(passwordEl) {
		passwordEl.type = this.login.controls.showPassword.value ? 'text' : 'password';
		passwordEl.setBlur();
		passwordEl.setFocus();
	}

	private _showErrorToast(authError) {
		this._translateService.get(['LOGIN.INVALID_LOGIN', 'LOGIN.NETWORK_ERROR', 'LOGIN.ERROR']).subscribe(
			value => {
				let msg = value['LOGIN.ERROR']
				if (authError.status == 0) {
					msg = value['LOGIN.NETWORK_ERROR']
				}
				if (authError.status == 401) {
					msg = value['LOGIN.INVALID_LOGIN']
				}
				let toast = this._toastCtrl.create({
					message: msg,
					cssClass: 'error',
					duration: 3000,
					position: 'top',
					closeButtonText: 'Ok',
					showCloseButton: true
				});
				toast.present(toast);
			}
		)
	}

	public processKeyUp(e, el) {
		if (e.keyCode == 13) { // 13 = enter
			el.setFocus();
		}
	}

	public processKeyUpLogin(e, user: string, password: string, alias: string) {
		if (e.keyCode == 13) { // 13 = enter
			this.doLogin(user, password, alias);
		}
	}

	public async rememberUser(rememberMe) {
		await this._storage.set('rememberMe', rememberMe);
	}

	public aliasCompareFn(a, b) {
		return a.label == b.label;
	}
}
