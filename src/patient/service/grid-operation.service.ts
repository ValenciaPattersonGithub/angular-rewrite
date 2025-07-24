import { Inject, Injectable } from '@angular/core';
import { PatientGridFilter } from '../common/models/patient-grid-filter.model';
import { PatientColumnsFields } from '../common/models/enums/patient.enum';
import { TranslateService } from '@ngx-translate/core';
import { ActiveTabService } from './active-tab.service';
import { DatePipe } from '@angular/common';
import { IGridHelper, IGridNumericHelper, IPrintMailingHelper } from './grid-helper.service';
import escape from 'lodash/escape';

@Injectable({
  providedIn: 'root'
})
export class GridOperationService {

  allPatientRowsData = [];
  attributesToDisplay: string[] = [];

  constructor(
    @Inject('toastrFactory') private toastrFactory,
    private translate: TranslateService,
    private activeTabService: ActiveTabService<IGridHelper & IGridNumericHelper & IPrintMailingHelper>,
    private datePipe: DatePipe) { }

  fetchDataAndSetLayout = (apiCall, request, url, gridTab, columns, attributesToDisplay, selectedLocation) => {
    const prinTableColHeaders: string[] = [];
    let patientName: string;
    columns?.forEach((col) => {
      if (col?.field != PatientColumnsFields.Schedule) {
        prinTableColHeaders?.push(col?.title);
      }
    });
    delete request?.CurrentPage;
    delete request?.PageCount;
    apiCall(request, url)?.then((res) => {
      this.allPatientRowsData = res?.Rows;
      patientName = this.allPatientRowsData?.map((row: PatientGridFilter) => {
        return row?.PatientName;
      })?.join(',');
      this.attributesToDisplay = attributesToDisplay;
      this.setPrintLayout(gridTab, prinTableColHeaders, selectedLocation);
    }, () => {
      this.toastrFactory.error(this.translate.instant('Failed to retrieve the list of {0}. Refresh the page to try again.', [patientName]));
    }
    );
  }

  setPrintLayout = (currentTab, prinTableColHeaders, selectedLocation): void => {

    const printedDate = this.datePipe?.transform(new Date(), 'MM/dd/YYYY - hh:mm a')?.toLowerCase();
    let printableContent = '';

    const htmlStart =
      '<html><head><meta charset="utf-8" />' +
      '<style>' +
      "table { border-collapse: collapse; font-family: ' Open Sans', sans-serif; font-size: 12px; }" +
      "#dateTimePreview { font-weight: normal; text-align: left; }" +
      'table > tbody > tr:nth-child(even) { background-color:  #eee; }' +
      'table > thead > tr:nth-child(2) > th { width: 11rem; text-align: left; border-bottom: 3px solid  #eee; }' +
      'table > tbody > tr > td { word-break: break-word; width: 10rem; padding: 0.5rem; }' +
      'h1 { margin: 2% 0px; text-align: center; }' +
      'h3 { text-align: left; }' +
      '@page {margin: 3px 10px auto 10px; }' +
      '</style>' +
      '<title></title></head><body>' +
      "<table><thead>" +
      "<tr><th colspan='" + `${String(prinTableColHeaders.length)}` + "'>" +
      "<div id='dateTimePreview'>" +
      `${String(printedDate)}` +
      '</div><h1>' +
      `${String(currentTab)}` +
      '</h1><h3>Location: ' +
      `${String(selectedLocation?.NameLine1)}` +
      '</h3>' +
      "</th></tr>" +
      "<tr>" +
      `${String(prinTableColHeaders?.map((col) => {
        return '<th>' + `${String(col)}` + '</th>';
      })?.join(''))}` + '</tr></thead><tbody>';

    const htmlEnd =
      '</tbody></table></body></html>';

    printableContent = this.allPatientRowsData?.map((row) => {
      const transformedRow = this.activeTabService.transformPatientData(row, true);
      return '<tr>' +
        this.attributesToDisplay?.map((attribute) => {
          const attributeValue = `${String(escape(String(transformedRow?.[attribute])))}`;
          return '<td>' + (attributeValue != undefined && attributeValue != null ? attributeValue : '') + '</td>';
        })?.join('') +
        '</tr>';
    })?.join('');

    const win = window?.open('', '', 'width=1000, height=650, resizable=1, scrollbars=1');
    const doc = win?.document?.open();

    doc?.write(`${String(htmlStart)}${String(printableContent)}${String(htmlEnd)}`);
    doc?.close();
    win?.print();
  }
}
