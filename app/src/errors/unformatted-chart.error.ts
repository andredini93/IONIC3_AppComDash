
export class UnformattedChartError {

	public name: string = 'UnformattedChartError';
	public message: string;
	public stack: any;

	constructor(message?: string) {
		this.message = message || 'Unformatted chart';
	}
}

UnformattedChartError.prototype = Object.create(UnformattedChartError.prototype);