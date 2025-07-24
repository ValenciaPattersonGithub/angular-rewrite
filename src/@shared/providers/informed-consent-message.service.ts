import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { InformedConsentModel } from 'src/business-center/practice-settings/models/informed-consent.model';

@Injectable({
  providedIn: 'root'
})
export class InformedConsentMessageService {

  constructor(private httpClient: HttpClient,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('SoarConfig') private soarConfig
  ) { }

  hasAccess = {
    Create: false, Delete: false, Edit: false, View: false
  }

  deleteAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-icmsg-delete');
  }

  editAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-icmsg-edit');
  }

  viewAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-icmsg-view');
  }

  access = () => {
    if (!this.viewAccess()) {
    } else {
      this.hasAccess.Edit = this.editAccess();
      this.hasAccess.View = true;
    }
    return this.hasAccess;
  }

  getInformedConsentMessage = () => {
    return new Promise((resolve, reject) => {
      let url = this.soarConfig.domainUrl + '/practiceSettings/informedconsenttext';
      this.httpClient.get<InformedConsentModel>(url)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          this.toastrFactory.error(this.localize.getLocalizedString("Failed to retrieve the {0}. Refresh the page to try again.", ['Informed Consent Message']), this.localize.getLocalizedString('Server Error'));
          reject(err);
        })
    });
  }

  save = (informedConsentMessage: InformedConsentModel) => {
    if (this.editAccess) {
      if (informedConsentMessage?.DateModified) {
        return new Promise((resolve, reject) => {
          let url = this.soarConfig.domainUrl + '/practiceSettings/informedconsenttext';
          this.httpClient.put(url, informedConsentMessage)
            .toPromise()
            .then(res => {
              this.toastrFactory.success(this.localize.getLocalizedString('Your {0} has been updated.', ['Informed Consent Message']), this.localize.getLocalizedString('Success'));
              resolve(res);
            }, err => { // Error
              this.toastrFactory.error(this.localize.getLocalizedString('Save was unsuccessful. Please retry your save.'), this.localize.getLocalizedString('Server Error'));
              reject(err);
            })
        });
      } else {
        return new Promise((resolve, reject) => {
          let url = this.soarConfig.domainUrl + '/practiceSettings/informedconsenttext';
          this.httpClient.post(url, informedConsentMessage)
            .toPromise()
            .then(res => {
              this.toastrFactory.success(this.localize.getLocalizedString('Your {0} has been added.', ['Informed Consent Message']), this.localize.getLocalizedString('Success'));
              resolve(res);
            }, err => { // Error
              this.toastrFactory.error(this.localize.getLocalizedString('Save was unsuccessful. Please retry your save.'), this.localize.getLocalizedString('Server Error'));
              reject(err);
            })
        });
      }
    }
  }
}
