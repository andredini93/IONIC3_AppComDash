import { Device } from '@ionic-native/device';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MingleService } from '@totvs/mobile-mingle';
import { TranslateService } from '@ngx-translate/core';
import { LaunchReview } from '@ionic-native/launch-review'

@Injectable()
export class AppLaunchReview {
	constructor(
		private mingle: MingleService,
		private _translate: TranslateService,
		private _appLaunchReview: LaunchReview,
		private device: Device
	) {
	}
	launch() {

		if (this.device.platform === 'iOS') {
			if (this._appLaunchReview.isRatingSupported()) {
				this._appLaunchReview.rating();
			}
		}else
			this._appLaunchReview.launch();
	}
}