
export class UnsupportedChartError {

	public name: string = 'UnsupportedChartError';
	public message: string;
	public stack: any;

	constructor(message?: string) {
		this.message = message || 'Usupported chart';
	}
}

UnsupportedChartError.prototype = Object.create(UnsupportedChartError.prototype);