import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { ExportCSV } from '../models/patient-location.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private httpClient: HttpClient) { }

  exportToCSVFile(params, fileName: string , apiUrl: string) {
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${apiUrl}/patients/${fileName}/csvFile`, params).toPromise()
        .then((res: SoarResponse<ExportCSV>) => {
          resolve(res);
        }, err => {
          reject(err);
        })
    });
  };

  exportToCSVFileWithContactInfo(params, fileName: string, apiUrl:string) {
    return new Promise((resolve, reject) => {
      this.httpClient.post(`${apiUrl}/patients/${fileName}/csvFileWithContactInfo`, params).toPromise()
        .then((res: SoarResponse<ExportCSV>) => {
          resolve(res);
        }, err => {
          reject(err);
        })
    });
  };

}
