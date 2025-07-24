import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CsvHelper {

  constructor() { }

  downloadCsvFile = (result:string, fileName:string) => {
    const currentDate = moment().format('M-DD-YYYY');
    const csv = '.csv';
    const csvFileName = fileName + '-' + currentDate + csv;
    if (navigator?.msSaveBlob) {
      const blob = new Blob([result], { type: 'text/csv;charset=utf-8;'});
      window?.navigator?.msSaveOrOpenBlob(blob, csvFileName);
    } else {
      const element = document.createElement('a');
      element?.setAttribute('href' , 'data:text/plain;charset=utf-8,' + encodeURIComponent(result));
      element?.setAttribute('download', csvFileName);
      element?.setAttribute('target', '_blank');
      element.style.display = 'none';
      document?.body?.appendChild(element);
      element?.click();
      document?.body?.removeChild(element);
    }
  }
}
