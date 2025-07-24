import { Injectable, Inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(@Inject("windowObject") private window:Window, private domSanitizer: DomSanitizer) {}

  viewPdfInNewWindow (data, pageTitle, documentName) {
      var file = new Blob([data], { type: 'application/pdf' });
      if (this.window.navigator.msSaveOrOpenBlob) {//internet explorer. Is this really necessary since we (really) don't support IE?
          this.window.navigator.msSaveOrOpenBlob(file, documentName + '.pdf');
      }
      else {
          var myWindow = this.window.open("");
          var fileURL = URL.createObjectURL(file);
          this.domSanitizer.bypassSecurityTrustResourceUrl(fileURL);
          var html = `<html><head><title>${pageTitle}</title></head><body><iframe style='width:100%;height:100%;' src=${fileURL}></iframe></body></div></html>`;
          myWindow.document.write(html);
          myWindow.document.close();
      }
  }
}
