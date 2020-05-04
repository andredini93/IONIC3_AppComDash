export class Report {
    reportType:string;
    datasets:any;
    showYAxes:boolean;
	showXAxes:boolean;
	roundValues:boolean;
	format: string;
    showLegend:boolean;
    showValues:boolean;
    labels:any[] = [];
    options:any;
    legend:any;
    colors:any;
    type:string;
    title:string;
    summary:string;
    metrics:any;
    metricFormat:any;
    attributes:any;
    filters:any[];
    valueFormat:string;
    
    //one number properties
    data:string;

    //table properties
    table =  {
        headers:[],
        rows:[]
    }


    constructor() { }
}