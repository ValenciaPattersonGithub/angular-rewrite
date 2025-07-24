import { Injectable, Inject } from '@angular/core';
import { ChartColorsHttpService } from '../../business-center/practice-settings/chart-custom-colors';
import { isNullOrUndefined } from 'util';

@Injectable()
export class ChartColorsService {

    constructor(
        @Inject(ChartColorsHttpService) private chartColorsHttpService
    ) { }
    
    chartColorData: any = {
        conditions: [
            { Color: '', Class: '' },
            { Color: '#2c97dd', Class:'cond-pres'}, // 1 - Present
            { Color: '#14527a', Class:'cond-rslv' }  // 2 - Resolved
        ],
        services: [ // index corresponds to service status id
            { Color: '', Class: '' },
            { Color: '#ea4b35', Class: 'prop' }, // 1 - Proposed
            { Color: '#9c56b9', Class: 'ref' },  // 2 - Referred
            { Color: '#6c5547', Class: 'rej' },  // 3 - Rejected
            { Color: '#1aaf5d', Class: 'comp' }, // 4 - Completed
            { Color: '#ea4b35', Class: 'pend' }, // 5 - Pending
            { Color: '#000000', Class: 'exis' }, // 6 - Existing
            { Color: '#9d2c1c', Class: 'acc' },  // 7 - Accepted
            { Color: '#5a2670', Class: 'rcomp' } // 8 - ReferredCompleted
        ]
    };

    loadChartColors(): Promise<any> {
        var promise = new Promise((resolve, reject) => {
            this.chartColorsHttpService.getAllChartColors().subscribe({
                next: result => {
                    result.Value.forEach(x => {
                        switch (x.StatusName) {
                            case "Proposed/Pending":
                                this.chartColorData.services[1].Color = x.Color;
                                this.chartColorData.services[5].Color = x.Color;
                                break;
                            case "Accepted":
                                this.chartColorData.services[7].Color = x.Color;
                                break;
                            case "Referred":
                                this.chartColorData.services[2].Color = x.Color;
                                break;
                            case "Referred Completed":
                                this.chartColorData.services[8].Color = x.Color;
                                break;
                            case "Rejected":
                                this.chartColorData.services[3].Color = x.Color;
                                break;
                            case "Completed":
                                this.chartColorData.services[4].Color = x.Color;
                                break;
                            case "Existing":
                                this.chartColorData.services[6].Color = x.Color;
                                break;
                            case "Condition Present":
                                this.chartColorData.conditions[1].Color = x.Color;
                                break;
                            case "Condition Resolved":
                                this.chartColorData.conditions[2].Color = x.Color;
                                break;
                        }                                                                      
                    });
                    resolve('');
                },
                error: error => {
                    console.log(error);                    
                    resolve(error);
                }
            });
        
            
        });
        return promise;
    }

    getChartColorData(recordType, status) {
        var data;
        if (recordType === 'Condition') {
            data = this.chartColorData.conditions[status];
        } else if (recordType === 'ServiceTransaction') {
            data = this.chartColorData.services[status];
        }

        return isNullOrUndefined(data) ? { Color: '', Class: ''} : data;
    };

    getChartColor(recordType, status) {
        return this.getChartColorData(recordType, status).Color;
    };

    getChartClass(recordType, status) {
        return this.getChartColorData(recordType, status).Class;
    };


}
