import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { AdjustmentTypes } from 'src/business-center/practice-settings/adjustment-types/adjustment-types';
import { PatSharedService } from './pat-shared.service';

@Injectable({
  providedIn: 'root'
})
export class AdjustmentTypesService {

  constructor(
    private httpClient: HttpClient,
    private patSharedService: PatSharedService,
    @Inject('SoarConfig') private soarConfig
    ) { }

  get = (searchParams): Promise<SoarResponse<Array<AdjustmentTypes>>>  => {
    return new Promise((resolve, reject) => {
      let queryParams: Params = {};
      if (searchParams) {
          queryParams = this.patSharedService.setParameter(searchParams);
      }

      const url = `${String(this.soarConfig.insuranceSapiUrl)}/adjustmenttypes`
      this.httpClient.get(url, { params: queryParams })
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    })
  }

  create = (adjustmentType: AdjustmentTypes ): Promise<SoarResponse<Array<AdjustmentTypes>>>  => {
    return new Promise((resolve, reject) => {
      const url = `${String(this.soarConfig.insuranceSapiUrl)}/adjustmenttypes`
      this.httpClient.post(url, adjustmentType)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    })
  }

  update = (adjustmentType: AdjustmentTypes ): Promise<SoarResponse<Array<AdjustmentTypes>>>  => {
    return new Promise((resolve, reject) => {
      const url = `${String(this.soarConfig.insuranceSapiUrl)}/adjustmenttypes`;
      this.httpClient.put(url, adjustmentType)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    });
  }

  deleteAdjustmentTypeById  = (adjustmentTypeId: string) => {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.insuranceSapiUrl)}/adjustmenttypes/${String(adjustmentTypeId)}`;
        this.httpClient.delete(url)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
  }

  GetAllAdjustmentTypesWithOutCheckTransactions = (searchParams): Promise<SoarResponse<Array<AdjustmentTypes>>>  => {
    return new Promise((resolve, reject) => {
      let queryParams: Params = {};
      if (searchParams) {
          queryParams = this.patSharedService.setParameter(searchParams);
      }

      const url = `${String(this.soarConfig.insuranceSapiUrl)}/adjustmenttypes`;
      this.httpClient.get(url, { params: queryParams })
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    })
  }

  GetAdjustmentTypeAssociatedWithTransactions = (adjustmentTypeId: string) => {
    return new Promise((resolve, reject) => {
      const url = `${String(this.soarConfig.insuranceSapiUrl)}/adjustmenttypes/${String(adjustmentTypeId)}`;
      this.httpClient.get<AdjustmentTypes[]>(url)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    });
  }

  
  

}
