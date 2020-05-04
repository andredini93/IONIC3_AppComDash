import { AlertController } from 'ionic-angular/components/alert/alert-controller';
import { AppLaunchReview } from './app.launch-review';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppRate } from '@ionic-native/app-rate';
import { MingleService } from '@totvs/mobile-mingle';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { AppVersion } from '@ionic-native/app-version';
import { Platform } from 'ionic-angular';

@Injectable()
export class AppReviewService {
	private readonly USES_UNTIL_PROMPT = 5;

	private lastAnswer;
	private appVersionNumber;
	private rated:boolean;


	private _counter: number;
	set counter(counter: number) {
		this._counter = counter;
		this._storage.set('rate-counter', counter);
	}
	get counter() {
		return this._counter;
	}

	constructor(
		private _alertCtrl: AlertController,
		private _storage: Storage,
		private _appVersion: AppVersion,
		private mingle: MingleService,
		private platform: Platform,
		private _translate: TranslateService,
		private _appLaunch: AppLaunchReview
	) {
		if (document.URL.startsWith('http')) {
			return;
		}
		this._storage.get('rate-counter').then(counter => {
			this.counter = counter ? counter : 0;
		});

		this._appVersion.getVersionNumber().then(appVersion => {
			this.appVersionNumber = appVersion;
			this._storage.get('app-version').then(storageVersion => {
				if (appVersion !== storageVersion) {
					this.reset(appVersion);
					this.rated = false;
				}else{
					this.rated = true;
				}
			});
		})

		this._storage.get('lastAnswer').then(lastAnswer => {
			this.lastAnswer = lastAnswer ? lastAnswer : AnswersTypes.LATER;
		})
	}

	public rate() {
		this.counter++;
		if (this.lastAnswer !== AnswersTypes.LATER) {
			return;
		}
		if (this.rated) {
			return;
		}
		if (this._counter > this.USES_UNTIL_PROMPT) {
			this.presentAlertCtrl();
		} 
	}

	private reset(appVersion) {
		this._storage.set('rate-counter', 0);
		this.counter = 0;
		this._storage.set('app-version', appVersion);
		this._storage.set('lastAnswer', AnswersTypes.LATER);
	}

	private presentAlertCtrl() {
		this._translate.get(['APP-RATE.TITLE', 'APP-RATE.MESSAGE', 'APP-RATE.RATE', 'APP-RATE.LATER', 'APP-RATE.NO']).subscribe(msgs => {
			let alert = this._alertCtrl.create({
				title: msgs['APP-RATE.TITLE'],
				message: msgs['APP-RATE.MESSAGE'],
				buttons: [
					{
						text: msgs['APP-RATE.RATE'],
						handler: () => {
							this.handleAnswer(AnswersTypes.RATE);
							this.mingle.registerMetric('RATE_ACCEPTED');
						}
					},
					{
						text: msgs['APP-RATE.LATER'],
						role: 'cancel',
						handler: () => {
							this.handleAnswer(AnswersTypes.LATER);
							this.mingle.registerMetric('RATE_POSTPONED');
						}
					},
					{
						text: msgs['APP-RATE.NO'],
						handler: () => {
							this.handleAnswer(AnswersTypes.DO_NOT);
							this.mingle.registerMetric('RATE_REFUSED');
						}
					}
				]
			});
			let backButton = this.platform.registerBackButtonAction(() => {
				alert.dismiss();
				backButton();
			}, 300);
			alert.present();
		});
	}


	handleAnswer(status) {
		this._storage.set('lastAnswer', status);
		this._storage.set('app-version', this.appVersionNumber);
		this.lastAnswer = status;
		if (status === AnswersTypes.RATE) {
			this._appLaunch.launch();
		}else if(status == AnswersTypes.LATER){
			this.reset(this.appVersionNumber);
		}
	}

}

enum AnswersTypes {
	RATE = 1,
	LATER,
	DO_NOT
};
