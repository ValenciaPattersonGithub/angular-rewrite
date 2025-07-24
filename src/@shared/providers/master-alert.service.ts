import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { MasterAlerts } from 'src/business-center/practice-settings/patient-profile/master-alerts/master-alerts';

@Injectable({
  providedIn: 'root'
})
export class MasterAlertService {

  constructor(private httpClient: HttpClient,
    @Inject('SoarConfig') private soarConfig,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('localize') private localize) { }

  get = () => {
    return new Promise((resolve, reject) => {
      if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bmalrt-view')) {
        let url = encodeURI(this.soarConfig.domainUrl + '/patientalerts');

        this.httpClient.get<MasterAlerts[]>(url)
          .toPromise()
          .then(res => { resolve(res); }, err => { // Error

            reject(err);
          })
      }
    });
  }

  // creation call
  save = (masterAlertDTO: MasterAlerts) => {
    if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bmalrt-add')) {
      return new Promise((resolve, reject) => {
        let url = encodeURI(this.soarConfig.domainUrl + '/patientalerts');
        this.httpClient.post(url, masterAlertDTO)
          .toPromise()
          .then(res => {
            resolve(res);
          },
            err => { // Error
              reject(err);
            })
      });
    }
  };

  update = (masterAlertDTO: MasterAlerts) => {
    if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bmalrt-edit')) {
      return new Promise((resolve, reject) => {
        let url = encodeURI(this.soarConfig.domainUrl + '/patientalerts');
        this.httpClient.put(url, masterAlertDTO)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
    }
  };

  // delete call 
  delete = (masterAlertId) => {
    if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bmalrt-delete')) {

      return new Promise((resolve, reject) => {

        let url = encodeURI(this.soarConfig.domainUrl + '/patientalerts/' + masterAlertId);
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

  alertsWithPatients = (masterAlertId) => {
    if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bmalrt-view')) {
      return new Promise((resolve, reject) => {
        if (masterAlertId) {
          let url = encodeURI(this.soarConfig.domainUrl + '/patientalerts/' + masterAlertId + '/patients');
          this.httpClient.get(url)
            .toPromise()
            .then(res => { resolve(res); }, err => { // Error
              reject(err);
            })
        }
      });
    }
  };
}
