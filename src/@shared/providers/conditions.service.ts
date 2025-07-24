import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FuseFlag } from 'src/@core/feature-flags';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { ConditionModel } from 'src/business-center/practice-settings/clinical/conditions/conditions-landing/conditions.model';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { MicroServiceApiService } from 'src/security/providers';

@Injectable({
  providedIn: 'root'
})
export class ConditionsService {

  private usePracticesApi: boolean = false;

  constructor(private httpClient: HttpClient,
    @Inject('SoarConfig') private soarConfig,
    @Inject('patSecurityService') private patSecurityService,
    private microServiceApis: MicroServiceApiService,
    featureFlagService: FeatureFlagService
  ) {
    featureFlagService.getOnce$(FuseFlag.UsePracticeApiForConditions).subscribe((value) => this.usePracticesApi = value);
  }

  getAll = (): Promise<ConditionModel[]> => {
    return new Promise((resolve, reject) => {
      let url = this.usePracticesApi ? this.microServiceApis.getPracticesUrl() + `/api/v1/conditions`
        : this.soarConfig.domainUrl + '/conditions/';
      this.httpClient.get<SoarResponse<ConditionModel[]>>(url)
        .toPromise()
        .then(res => {
          resolve(res.Value);
        }, err => { // Error
          reject(err);
        })
    });
  }

  get = (conditionId: string): Promise<SoarResponse<ConditionModel>> => {
    if (conditionId) {
      return new Promise((resolve, reject) => {
        let url = encodeURI(this.usePracticesApi ? this.microServiceApis.getPracticesUrl() + `/api/v1/conditions/${conditionId}`
          : this.soarConfig.domainUrl + '/conditions/' + conditionId);
        this.httpClient.get<SoarResponse<ConditionModel>>(url)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      })
    }
  };

  save = (condition: ConditionModel): Promise<ConditionModel> => {
    if (condition && this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bsvct-add')) {
      return new Promise((resolve, reject) => {
        let url = encodeURI(this.usePracticesApi ? this.microServiceApis.getPracticesUrl() + '/api/v1/conditions'
          : this.soarConfig.domainUrl + '/conditions');
        this.httpClient.post(url, condition)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
    }
  };

  update = (condition: ConditionModel): Promise<ConditionModel> => {
    if (condition) {
      return new Promise((resolve, reject) => {
        let url = encodeURI(this.usePracticesApi ? this.microServiceApis.getPracticesUrl() + '/api/v1/conditions'
          : this.soarConfig.domainUrl + '/conditions');
        this.httpClient.put(url, condition)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
    }
  };

  delete = (conditionId: string) => {
    if (conditionId && this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bsvct-delete')) {
      return new Promise((resolve, reject) => {
        let url = encodeURI(this.usePracticesApi ? this.microServiceApis.getPracticesUrl() + `/api/v1/conditions/${conditionId}`
          : this.soarConfig.domainUrl + '/conditions/' + conditionId);
        this.httpClient.delete(url)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
    }
  };
}