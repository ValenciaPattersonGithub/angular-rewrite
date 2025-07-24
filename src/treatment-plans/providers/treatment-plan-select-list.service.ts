import { Injectable, Inject } from '@angular/core';

@Injectable()
export class TreatmentPlanSelectListService {
    serviceTypeSelectList: any[] = [];

    constructor() {

    }

    getServiceTypeSelectList() {

        let list = [
            {
                Text: 'All Services Types',
                Value: 'All'
            }//,
            //{
            //    Text: 'Preventive (######)',
            //    Value: 'Preventive'
            //}
        ];

        return list;
    }

    getProposedOrderingSelectList() {

        let list = [
            {
                Text: 'Sort by: Tooth',
                Value: '1'
            },
            {
                Text: 'Sort by: Description',
                Value: '2'
            },
            {
                Text: 'Sort by: Provider',
                Value: '3'
            },
            {
                Text: 'Sort by: Location',
                Value: '4'
            }
        ];

        return list;
    }
}
