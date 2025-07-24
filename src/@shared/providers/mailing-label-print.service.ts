import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StartItemThirty } from 'src/patient/common/models/enums/patient.enum';
import escape from 'lodash/escape';

@Injectable({
    providedIn: 'root'
})
export class MailingLabelPrintService {
    doc: Document
    style = '';

    constructor(private translate: TranslateService) { }

    getPrintHtml = (results) => {
        let newTab = window.open();
        this.doc = newTab.document.open();
        this.doc.write("");
        this.labelPrint(results);
    }

    labelPrint = (results) => {
        this.style = this.getStyle();
        let outputlabelRows = '';
        let startItem = 0;
        results?.Rows?.forEach(row => {
            const name = row?.PatientName;
            const address1 = !row?.Address1 ? '' : row?.Address1;
            const address2 = !row?.Address2 ? '' : row?.Address2;
            const city = !row?.City ? '' : row?.City;
            const state = !row.State ? '' : row?.State;
            const zip = !row?.ZipCode ? '' : row?.ZipCode;

            let citystatezip = '';
            if (city != '' && state != '' && zip != '') {
                citystatezip = city + ', ' + state + ' ' + zip;
            }
            else if (city == '' && state != '' && zip != '') {
                citystatezip = state + ' ' + zip;
            }
            else if (city == '' && state == '' && zip == '') {
                citystatezip = '';
            }

            if (startItem % StartItemThirty == 0) {
                outputlabelRows =
                    outputlabelRows +
                    "<div class='page'>" +
                    "<div><button id='printBtn' onclick='window.print(); window.document.close()'>" + this.translate.instant('Print') + "</button></div>" +
                    "<div class='page-content'>";
            }
            outputlabelRows = outputlabelRows + "<div class='label'>" + "<div class='label-content'>"
                + "<div class='row'>" + String(escape(name)) + '</div>'
                + "<div class='row'>" + String(escape(address1)) + ' ' + String(escape(address2)) + '</div>'
                + "<div class='row'>" + String(escape(citystatezip)) + '</div>'
                + '<br />' + '</div>' + '</div>';

            if (startItem % StartItemThirty == 29) {
                outputlabelRows = outputlabelRows + '</div>' + '</div>';
            }
            startItem = startItem + 1;
        });
        const outputLabels = '<html>' + '<head>' + "<meta charset='utf-8'>" +
            '<title>' + this.translate.instant('Print Mailing Labels') + '</title>' + this.style + '</head>' + '<body>' +
            outputlabelRows + '</body>' + '</html>';
        this.doc?.write(outputLabels);
        this.doc?.close();
    }

    private getStyle = (): string => {
        return '<style>' +
            'body { background-color: #dddddd; padding: 0; border: 0; margin: 0; }' +
            '.page { background-color: #ffffff; width: 8.5in; height: 11in; margin: .25in auto; border: 1px dotted #888888; }' +
            '.page-content { margin-top: .5in; margin-left: .27in; }' +
            ".page-content::after { content: ' '; display: block; height: 0; clear: both; }" +
            '.label { width: 2.63in; height: 1in; margin-right: 0; float: left; text-align: center; overflow: hidden; border: 1px dotted; border-radius: 5px; }' +
            '.label-content { margin: .125in .125in 0; }' +
            'button {border-color: #0d6ba3; background-color: #0F7BBB; color: #FFF; font-size: 14px; padding: 8px 12px; border: 1px solid transparent; position: absolute; margin-left: .27in; margin-top:.06in }' +
            '@media print { .body { background-color: transparent; } button { display: none;} .page { background-color: transparent; border: none; page-break-after: always; width: 8.5in; height: auto; } .label { border: none; } }' +
            '</style>';
    }
}
