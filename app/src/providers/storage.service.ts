import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from 'ionic-angular';
// import { fromPromise } from 'rxjs/observable/fromPromise';
// import { Observable } from 'rxjs/Observable';

@Injectable()
export class StorageService {

	// private _remember: boolean;

	constructor(
		private _storage: Storage
		// private _platform: Platform
	) { 
		// this._platform.ready()
		// 	.then(() => {
		// 		this._shouldIRemember();
		// 	});
	}

	// private _shouldIRemember(): void {
	// 	this._storage.get('rememberMe')
	// 		.then(rememberMe => {
	// 			this._remember = rememberMe});
	// }

	public get(key: string): Promise<any> {
		return this._storage.get(key);
	}

	public set(key: string, value: any): void {
		this._storage.ready()
			.then(() => {
				return this._storage.set(key, value);
			})
	}

	public remove(key: string): Promise<void> {
		return this._storage.remove(key);
	}

	public async isKeySet(key: string): Promise<boolean> {
		let keys = await this._storage.keys();
		
		let myKey = keys.find(k => {
			return k == key;
		});
		
		return myKey != undefined;
	}
}