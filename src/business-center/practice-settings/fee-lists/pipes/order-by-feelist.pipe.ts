import { Pipe, PipeTransform } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';

@Pipe({
  name: 'orderByFeelist'
})
export class OrderByFeelistPipe implements PipeTransform {

    transform(records: Array<any>, args?: any): any {
        if (!records) { return records; }

        return cloneDeep(records).sort((a, b) => {
            if (typeof (a[args.sortColumnName]) === 'string') {
                let lowerA = a[args.sortColumnName].toLowerCase(),
                    lowerB = b[args.sortColumnName].toLowerCase();

                if (lowerA < lowerB || !lowerA) {
                    return -args.sortDirection;
                } else {
                    if (lowerA > lowerB || !lowerB) {
                        return args.sortDirection;
                    } else {
                        return -args.sortDirection;
                    }
                }
            } else {
                return a[args.sortColumnName] > b[args.sortColumnName]
                    ? args.sortDirection
                    : -args.sortDirection;
            }
        });
    }
}