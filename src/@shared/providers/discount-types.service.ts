import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { DiscountType } from 'src/business-center/practice-settings/billing/discount-types/discount-type';

@Injectable({
  providedIn: 'root'
})
export class DiscountTypesService {

  constructor(
    private httpClient: HttpClient,
    @Inject('SoarConfig') private soarConfig) { }


  get = (): Promise<SoarResponse<Array<DiscountType>>>  => {
    return new Promise((resolve, reject) => {
      let url = this.soarConfig.domainUrl + '/discounttypes';
      this.httpClient.get(url)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    })
  }

  save = (newDiscountType: DiscountType): Promise<SoarResponse<DiscountType>>  => {
      return new Promise((resolve, reject) => {
        let url = this.soarConfig.domainUrl + '/discounttypes';
        this.httpClient.post(url, newDiscountType)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
  }

  update = (discounttypes: DiscountType): Promise<SoarResponse<DiscountType>>  => {
    return new Promise((resolve, reject) => {
      let url = this.soarConfig.domainUrl + '/discounttypes';
      this.httpClient.put(url, discounttypes)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    });
  }

  delete = (MasterDiscountTypeId: string) => {
      return new Promise((resolve, reject) => {
        let url = this.soarConfig.domainUrl + '/discounttypes/' + MasterDiscountTypeId;
        this.httpClient.delete(url)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
  }

  patientsWithDiscount = (MasterDiscountTypeId?: number) => {
    return new Promise((resolve, reject) => {

      let url;
      if (MasterDiscountTypeId > 0) {
        url = this.soarConfig.domainUrl + '/discounttypes/' + MasterDiscountTypeId;
      }
      else {
        url = this.soarConfig.domainUrl + '/discounttypes';
      }

      this.httpClient.get<DiscountType>(url)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    })
  }

}
 