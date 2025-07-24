import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { PatientAdditionalIdentifiers } from './patient-additional-identifier';
import { Observable } from 'rxjs';
import { SoarResponse } from 'src/@core/models/core/soar-response';

@Injectable({
  providedIn: 'root'
})
export class PatientAdditionalIdentifierService {

  constructor(private httpClient: HttpClient,
    @Inject('SoarConfig') private soarConfig) { }

  getPatientAdditionalIdentifiers = (): Observable<SoarResponse<Array<PatientAdditionalIdentifiers>>> => {
    let url = this.soarConfig.domainUrl + '/masterpatientidentifiers';
    return this.httpClient.get<SoarResponse<Array<PatientAdditionalIdentifiers>>>(url);
  }

  save = (identifierDto: PatientAdditionalIdentifiers): Observable<SoarResponse<PatientAdditionalIdentifiers>> => {
    let url = this.soarConfig.domainUrl + '/masterpatientidentifiers';
    return this.httpClient.post<SoarResponse<PatientAdditionalIdentifiers>>(url, identifierDto);
  }

  update = (identifierDto: PatientAdditionalIdentifiers): Observable<SoarResponse<PatientAdditionalIdentifiers>> => {
    let url = this.soarConfig.domainUrl + '/masterpatientidentifiers';
    return this.httpClient.put<SoarResponse<PatientAdditionalIdentifiers>>(url, identifierDto);
  }

  delete = (identifierId: string) => {
    let url = this.soarConfig.domainUrl + '/masterpatientidentifiers/' + identifierId;
    return this.httpClient.delete(url);
  }

  additionalIdentifiersWithPatients = (patientAdditionalIdentifierId): Observable<SoarResponse<Array<PatientAdditionalIdentifiers>>> => {
    let url = this.soarConfig.domainUrl + '/masterpatientidentifiers/' + patientAdditionalIdentifierId + '/patients';
    return this.httpClient.get<SoarResponse<Array<PatientAdditionalIdentifiers>>>(url);
  }

  // This function is implemented using promise to support use in angularJS
  get = () => {
    return new Promise((resolve, reject) => {
      let url = this.soarConfig.domainUrl + '/masterpatientidentifiers';
      this.httpClient.get<SoarResponse<Array<PatientAdditionalIdentifiers>>>(url)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    })
  }

}
