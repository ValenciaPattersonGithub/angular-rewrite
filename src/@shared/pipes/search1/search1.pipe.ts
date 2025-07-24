import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search1'
})

export class Search1Pipe implements PipeTransform {
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
      items = filteredarray.filter(item => {
        return filterKeys.some((keyName) => {
          if (item[keyName] != null && item[keyName] != undefined) {
            const value = item[keyName]?.toString()?.toLowerCase();
            return value.includes(filter[keyName]?.toString()?.toLowerCase());
          }
        });
      });
      return items;
    }
  }
}
