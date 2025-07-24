import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'orderBy'
})

export class OrderByPipe implements PipeTransform {
    transform(records: Array<any>, args?: any): any {
        if (!records) { return records; }
        return records.sort((a, b) => {
            if (!a[args.sortColumnName]) {
                return 1 * args.sortDirection;
            } else if (!b[args.sortColumnName]) {
                return -1 * args.sortDirection;
            }
            if (typeof (a[args.sortColumnName]) === 'string') {
                if (a[args.sortColumnName].toLowerCase() < b[args.sortColumnName].toLowerCase()) {
                    return -1 * args.sortDirection;
                } else {
                    if (a[args.sortColumnName].toLowerCase() > b[args.sortColumnName].toLowerCase()) {
                        return 1 * args.sortDirection;
                    } else {
                        return -1 * args.sortDirection;
                    }
                }
            } else {
                if (a[args.sortColumnName] < b[args.sortColumnName]) {
                    return -1 * args.sortDirection;
                } else {
                    if (a[args.sortColumnName] > b[args.sortColumnName]) {
                        return 1 * args.sortDirection;
                    } else {
                        return -1 * args.sortDirection;
                    }
                }
            }
        });
    }
}
