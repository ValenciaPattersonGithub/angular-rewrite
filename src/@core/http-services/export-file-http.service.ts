import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ExportFileHttpService {
  constructor(
    @Inject('SoarConfig') private soarConfig: any,
    private httpClient: HttpClient
  ) { }

  exportFile(queryDto: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const url = `${this.soarConfig.fuseExportApiUrl}/api/Export/exportfile`;
      this.httpClient.post(url, queryDto, { responseType: 'blob' })
        .toPromise()
        .then((response: Blob) => {
          const blob = new Blob([response], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          try {
            const newWindow = window.open(url, '_blank');
            if (newWindow) {
              newWindow.focus();
              resolve();
            }
          } catch (error) {
          }
        })
        .catch(err => {
        });
    });
  }
}
