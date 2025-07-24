import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ServiceTypes } from 'src/business-center/service-code/service-types';
import { MicroServiceApiService } from 'src/security/providers';
import { SoarResponse } from 'src/@core/models/core/soar-response';

@Injectable({
  providedIn: 'root'
})
export class ServiceTypesService {

  constructor(
    private httpClient: HttpClient,
    @Inject('patSecurityService') private patSecurityService,
    private microServiceApis: MicroServiceApiService,
  ) {
    
  }

  getAll = (): Promise<ServiceTypes[]> => {
    return new Promise((resolve, reject) => {
      let url = this.microServiceApis.getPracticesUrl() + `/api/v1/servicetypes`;
      this.httpClient.get<SoarResponse<ServiceTypes[]>>(url)
        .toPromise()
        .then(res => {
          resolve(res.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }

  get = (serviceTypeId: string) => {
    return new Promise((resolve, reject) => {
      let url = this.microServiceApis.getPracticesUrl() + `/api/v1/servicetypes/${serviceTypeId}`;
      this.httpClient.get<SoarResponse<ServiceTypes>>(url)
        .toPromise()
        .then(res => {
          resolve(res.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }

  save = (serviceType: ServiceTypes) => {
    return new Promise((resolve, reject) => {
      let url = this.microServiceApis.getPracticesUrl() + '/api/v1/servicetypes';
      this.httpClient.post<SoarResponse<ServiceTypes>>(url, serviceType)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    });
  }

  update = (serviceType: ServiceTypes) => {
    return new Promise((resolve, reject) => {
      let url = this.microServiceApis.getPracticesUrl() + '/api/v1/servicetypes';
      this.httpClient.put<SoarResponse<ServiceTypes>>(url, serviceType)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    });
  }

  delete = (serviceTypeId: string) => {
    if (this.patSecurityService?.IsAuthorizedByAbbreviation('soar-biz-bsvct-delete')) {
      return new Promise((resolve, reject) => {
        let url = this.microServiceApis.getPracticesUrl() + `/api/v1/servicetypes/${serviceTypeId}`;
        this.httpClient.delete(url)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
    }
  }
}