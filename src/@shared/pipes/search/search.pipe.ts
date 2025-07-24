import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'search'
})

export class SearchPipe implements PipeTransform {
    transform(items: any, filter?: any): any {
        if (!filter) {
            return items;
        }

        if (!Array.isArray(items)) {
            return items;
        }

        if (filter && Array.isArray(items)) {
            const filteredarray = [...items];
            const filterKeys = Object.keys(filter);
            const filtervalues = Object.values(filter);
            const [first] = filtervalues;
            if (!first) { return items; }
            return items = filteredarray.filter(item => {
                return filterKeys.some((keyName) => {
                    if (item[keyName] != null && item[keyName] != undefined) {
                        return new RegExp(filter[keyName], 'gi').test(item[keyName]);
                    }
                });
            });

        }
    }
}
