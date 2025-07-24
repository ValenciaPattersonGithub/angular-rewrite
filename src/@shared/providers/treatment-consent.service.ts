import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { filter } from '@progress/kendo-data-query/dist/es/transducers';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TreatmentConsentModel } from 'src/business-center/practice-settings/models/treatment-consent.model';

@Injectable({
    providedIn: 'root'
})
export class TreatmentConsentService {

    constructor(private httpClient: HttpClient,
        @Inject('SoarConfig') private soarConfig,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('localize') private localize) { }


  getConsent = () => {
    return new Promise((resolve, reject) => {
      if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-tpmsg-view')) {
        let url = encodeURI(this.soarConfig.domainUrl + '/practiceSettings/treatmentConsentText');
        this.httpClient.get<TreatmentConsentModel>(url)
          .toPromise()
          .then(res => { resolve(res); }, err => { // Error
            this.toastrFactory.error(
              this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['Clinical Notes']),
              this.localize.getLocalizedString('Server Error'));
            reject(err);
          })
      }
    });
  }

  // creation call
  createConsent = (treatmentConsentTextDto) => {
    if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-tpmsg-add')) {
      return new Promise((resolve, reject) => {
        if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-tpmsg-view')) {
          let url = encodeURI(this.soarConfig.domainUrl + '/practiceSettings/treatmentConsentText');
          this.httpClient.post(url, treatmentConsentTextDto)
            .toPromise()
            .then(res => {
              resolve(res);
              this.toastrFactory.success(this.localize.getLocalizedString('Your Treatment Consent Letter has been updated.'), this.localize.getLocalizedString('Success'));
            },
              err => { // Error
                this.toastrFactory.error(this.localize.getLocalizedString('Save was unsuccessful. Please retry your save.'), this.localize.getLocalizedString('Server Error'));
                reject(err);
              })
        }
      });
    }
  };
  updateConsent = (treatmentConsentTextDto) => {
    if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-tpmsg-edit')) {
      return new Promise((resolve, reject) => {

        let url = encodeURI(this.soarConfig.domainUrl + '/practiceSettings/treatmentConsentText');
        this.httpClient.put(url, treatmentConsentTextDto)
          .toPromise()
          .then(res => {
            this.toastrFactory.success(this.localize.getLocalizedString('Your Treatment Consent Letter has been updated.'), this.localize.getLocalizedString('Success'));
            resolve(res);
          }, err => { // Error
            this.toastrFactory.error(this.localize.getLocalizedString('Update  was unsuccessful. Please retry your save.'), this.localize.getLocalizedString('Server Error'));
            reject(err);
          })
      });
    }
  };

  // delete call 
  deleteConsent = () => {
    if (this.patSecurityService.IsAuthorizedByAbbreviation(' soar-biz-tpmsg-delete')) {
      return new Promise((resolve, reject) => {

        let url = encodeURI(this.soarConfig.domainUrl + '/practiceSettings/treatmentConsentText');
        this.httpClient.delete(url)
          .toPromise()
          .then(res => {
            this.toastrFactory.success(this.localize.getLocalizedString('Your Treatment Consent Letter has been deleted.'), this.localize.getLocalizedString('Success'));
            resolve(res);
          }, err => { // Error
            this.toastrFactory.error(this.localize.getLocalizedString('Update  was unsuccessful. Please retry your save.'), this.localize.getLocalizedString('Server Error'));
            reject(err);
          })
      });
    }
  };
}
