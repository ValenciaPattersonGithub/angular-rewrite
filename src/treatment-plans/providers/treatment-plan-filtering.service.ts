import { Injectable, Inject } from '@angular/core';

@Injectable()
export class TreatmentPlanFilteringService {

    constructor() {
    }

    filterListByServiceTypeSelectListValue(list, value) {
        if (value === 'All') {
            for (let i = 0; i < list.length; i++) {
                list[i].displayProposed = true;
            }
        //} else if (value === 'Preventative') {
        //    // figure out which service code types are considered preventative
        //    debugger;
        } else {
            // filter the list only returning the type you wanted.
            for (let i = 0; i < list.length; i++) {
                if (list[i].ServiceTransaction.ServiceTypeId !== null
                    && list[i].ServiceTransaction.ServiceTypeId !== undefined
                    && list[i].ServiceTransaction.ServiceTypeId === value) {
                    list[i].displayProposed = true;
                } else {
                    list[i].displayProposed = false;
                }
            }
        }

        return list;
    }
}
