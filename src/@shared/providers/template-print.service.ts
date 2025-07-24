import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { PatientMailingInfo, PatientPostcardInfo } from '../models/send-mailing.model';
import { TranslateService } from '@ngx-translate/core';
import { PostcardCount } from 'src/patient/common/models/enums/patient.enum';
import escape from 'lodash/escape';

@Injectable({
  providedIn: 'root'
})
export class TemplatePrintService {
  style = '';
  url = `${String(this.soarConfig.domainUrl)}`;
  progressDiv: HTMLElement
  doc: Document;

  constructor(private httpClient: HttpClient,
    @Inject('SoarConfig') private soarConfig,
    private translate: TranslateService) { }

  getPrintHtml = (param: PatientMailingInfo) => {
    let newTab = window.open();
    this.doc = newTab.document.open();
    if (param?.isPostcard) {
      this.doc?.write(' <title>' + this.translate.instant('Print Post Card') + '</title>');
    } else {
      this.doc?.write(' <title>' + this.translate.instant('Print US Mail') + '</title>');
    }
    this.doc?.write("<div id='Progress'>" + this.translate.instant('Please wait while report is being generated...') + "</div>");
    this.progressDiv = this.doc?.getElementById('Progress');
  }

  bindHtml = (results, isPostcard: boolean) => {
    if (isPostcard) {
      this.style = this.getPostCardStyle();
      this.progressDiv.hidden = true;
      let postcardHTML = '';
      let i = 0;
      let j = 0;
      let lenghtArray = results?.length - 1;
      let divPostcard = '';
      results?.forEach((res: PatientPostcardInfo) => {
        if (i <= PostcardCount) { // it will print 4 postcards in one page
            let divMessage =
            '<div class="postcard-message">' + res?.Content + '</div>';
          let pcPatientName = String(escape(res?.PatientName));
          let pcAddressLine1 = '<br />' + String(escape(res?.AddressLine1));
          let pcAddressLine2 = res?.AddressLine2 == '' ? '' : '<br />' + String(escape(res?.AddressLine2));
          let pcLocationCityStateZip = '<br />' + String(escape(res?.LocationCityStateZip));

          divPostcard +=
            '<div class="postcard">' +
            divMessage +
            '<div class="postcard-content">' +
            '    <div class="postcard-stamp"></div>' +
            '    <div class="postcard-address">' +
            pcPatientName +
            pcAddressLine1 +
            pcAddressLine2 +
            pcLocationCityStateZip +
            '    </div>' +
            '</div>' +
            '</div>';
        }
        if (i == PostcardCount || j == lenghtArray) {
          let pcHTML =
            '<div class="page"><div class="page-content">' +
            divPostcard +
            '</div></div>';

          postcardHTML += pcHTML;
          divPostcard = '';
          i = 0; // Assigning i to 0 to print next 4 postcards in next page
        } else {
          i++;
        }
        j++;
      });

      let outputHtml =
        '<html>' +
        '<head>' +
        '<title>' + this.translate.instant('Print Post Card') + '</title>' +
        this.style +
        '</head>' +
        '<body><div class="printBtn"><button onclick="window.print(); window.document.close()">' + this.translate.instant('Print') + '</button></div>' +
        postcardHTML +
        '</body></html>';

      this.doc.write(outputHtml);
      this.doc.title = this.translate.instant('Post Card Preview');
      this.doc.close();
    } else {
      this.style = this.getUSMailStyle();
      let outputlabelRows = '';
      let outputlabelRowsTemp = '';
      let outputlabelRowsTemp2 = '';
      let printButton = '';
      let startItem = 0;
      if (results == null || results?.length == 0) {
        outputlabelRows +=
          '<div class="page"><div class="page-content">The Template is null or empty and no output could be generated. Please select a different template.</div></div>';
      }
      results?.forEach(row => {
        printButton = '';
        outputlabelRowsTemp = row;
        if (startItem == 0) {
          printButton =
            "<div><button id='printBtn' onclick='window.print(); window.document.close()'>" + this.translate.instant('Print') + "</button></div><br/>";
        }
        outputlabelRowsTemp2 =
          " <div class='page'>" +
          printButton +
          "<div class='page-content'>" +
          outputlabelRowsTemp +
          '<br />' +
          '</div>' +
          '</div>';

        outputlabelRows += outputlabelRowsTemp2;
        startItem = startItem + 1;
      });

      this.progressDiv.hidden = true;

      let outputTemplates =
        '<html>' +
        '<head>' +
        "<meta charset='utf-8'>" +
        ' <title>' + this.translate.instant('Print US Mail') + '</title>' +
        this.style +
        '</head>' +
        '<body>' +
        outputlabelRows +
        '</body>' +
        '</html>';

      this.doc.write(outputTemplates);
      this.doc.close();
    }
  }

  failure = (isPostcard) => {
    this.progressDiv.hidden = true;
    if (isPostcard) {
      this.doc?.write(' <title>' + this.translate.instant('Print Post Card') + '</title>');
    } else {
      this.doc?.write(' <title>' + this.translate.instant('Print US Mail') + '</title>');
    }
    this.doc?.write(this.translate.instant('Report generation failed.'));
    this.doc?.close();
  }

  //#region Private Methods
  private getPostCardStyle = (): string => {
    return '<style>' +
      'body {background-color: #dddddd;padding: 0;border: 0;margin: 0;padding-top: 10px; font-family: "Open Sans", sans-serif;}' +
      '.page {background-color: #ffffff;width: 11in;height: 8.5in;margin: .25in auto;outline: 1px dashed #888888;}' +
      '.page-content {}' +
      '.page-content::after {content: " ";display: block;height: 0;clear: both;}' +
      '.postcard {width: 5.5in;height: 4.25in;float: left;overflow: hidden;outline: 1px dotted #888888;}' +
      '.postcard-content {position: relative;padding-top: 1.525in;}' +
      '.postcard-message {width: 2.75in;float: left;padding-top: .25in;padding-left: .25in;max-height: 380px;overflow: hidden;min-height: 250px;}' +
      '.postcard-address {float: left;padding-top: .25in;padding-left: .5in;width: 190px; nowrap;overflow: hidden;}' +
      'button {border-color: #0d6ba3; background-color: #0F7BBB; color: #FFF; font-size: 14px; padding: 8px 12px; border: 1px solid transparent; position: absolute; margin-left: .27in; margin-top:.06in }' +
      '@media screen {.postcard-stamp {width: .87in;height: .979in;position: absolute;top: .125in;right: .125in;outline: 4px double #888888;}}' +
      '@media print {.body {background-color: transparent;}' +
      '.printBtn { display: none;}' +
      '.page {background-color: transparent;outline: none;page-break-after: always;height: auto;margin: 0;}' +
      '.postcard {outline: none;max-height: 4.16in;}}' +
      '</style>';
  }

  private getUSMailStyle = (): string => {
    return '<style>' +
      'body { background-color:#ffffff; padding: 0; border: 0; margin: 0; }' +
      '.page { background-color: #ffffff; margin: .25in auto;}' +
      '.page-content { margin-top: .5in; margin-left: .27in; }' +
      ".page-content::after { content: ' '; display: block; height: 0; clear: both; }" +
      '.page-content { margin-top: .5in; margin-left: .27in; }' +
      'button {border-color: #0d6ba3; background-color: #0F7BBB; color: #FFF; font-size: 14px; padding: 8px 12px; border: 1px solid transparent; position: absolute; margin-left: .27in; margin-top:.06in }' +
      '@media print { .body { background-color: transparent; } button { display: none;} .page { background-color: transparent; border: none; page-break-after: always; width: 8.5in; height: auto; } .label { border: none; } }' +
      '</style>'
  }
  //#endregion

  //#region Http methods
  //#region Http methods for Patient TAB
  printBulkLetterPatient = (printMailing: PatientMailingInfo) => {
    return new Promise((resolve, reject) => {
      const url = this.url + '/patients/' + printMailing?.communicationTemplateId + '/PrintBulkLetterPatient?uiSuppressModal: true';
      this.httpClient.post(url, printMailing?.dataGrid)
        .toPromise()
        .then((res: SoarResponse<string[]>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }

  // Called in case of PostCard Type is selected
  PrintBulkPostcardPatient = (printMailing: PatientMailingInfo) => {
    return new Promise((resolve, reject) => {
      const url = this.url + '/patients/' + printMailing?.communicationTemplateId + '/PrintBulkPostcardPatient';
      this.httpClient.post(url, printMailing?.dataGrid)
        .toPromise()
        .then((res: SoarResponse<PatientPostcardInfo[]>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }
  //#endregion

  //#region Http methods for Appointment TAB
  PrintBulkLetterAppointment = (printMailing: PatientMailingInfo) => {
    return new Promise((resolve, reject) => {
      const url = this.url + '/patients/' + printMailing?.communicationTemplateId + '/PrintBulkLetterAppointment?uiSuppressModal: true';
      this.httpClient.post(url, printMailing?.dataGrid)
        .toPromise()
        .then((res: SoarResponse<string[]>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }

  PrintBulkPostcardAppointment = (printMailing: PatientMailingInfo) => {
    return new Promise((resolve, reject) => {
      const url = this.url + '/patients/' + printMailing?.communicationTemplateId + '/PrintBulkPostcardAppointment?uiSuppressModal: true';
      this.httpClient.post(url, printMailing?.dataGrid)
        .toPromise()
        .then((res: SoarResponse<PatientPostcardInfo[]>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }
  //#endregion

  //#region Http methods for Treatment Plans TAB
  PrintBulkLetterTreatment = (printMailing: PatientMailingInfo) => {
    return new Promise((resolve, reject) => {
      const url = this.url + '/patients/' + printMailing?.communicationTemplateId + '/PrintBulkLetterTreatment?uiSuppressModal: true';
      this.httpClient.post(url, printMailing?.dataGrid)
        .toPromise()
        .then((res: SoarResponse<string[]>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }

  PrintBulkPostcardTreatment = (printMailing: PatientMailingInfo) => {
    return new Promise((resolve, reject) => {
      const url = this.url + '/patients/' + printMailing?.communicationTemplateId + '/PrintBulkPostcardTreatment?uiSuppressModal: true';
      this.httpClient.post(url, printMailing?.dataGrid)
        .toPromise()
        .then((res: SoarResponse<PatientPostcardInfo[]>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }
  //#endregion

  //#region Http methods for Preventive Care TAB
  PrintBulkLetterPreventive = (printMailing: PatientMailingInfo) => {
    return new Promise((resolve, reject) => {
      const url = this.url + '/patients/' + printMailing?.communicationTemplateId + '/PrintBulkLetterPreventive?uiSuppressModal: true';
      this.httpClient.post(url, printMailing?.dataGrid)
        .toPromise()
        .then((res: SoarResponse<string[]>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }

  PrintBulkPostcardPreventive = (printMailing: PatientMailingInfo) => {
    return new Promise((resolve, reject) => {
      const url = this.url + '/patients/' + printMailing?.communicationTemplateId + '/PrintBulkPostcardPreventive?uiSuppressModal: true';
      this.httpClient.post(url, printMailing?.dataGrid)
        .toPromise()
        .then((res: SoarResponse<PatientPostcardInfo[]>) => {
          resolve(res?.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }
  //#endregion
  //#endregion

}
