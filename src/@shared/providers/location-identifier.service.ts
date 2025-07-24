import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MasterLocationIdentifier } from 'src/business-center/practice-settings/location-identifier';

@Injectable({
  providedIn: 'root'
})

export class LocationIdentifierService {

  constructor(private httpClient: HttpClient,
    @Inject('SoarConfig') private soarConfig,
    @Inject('patSecurityService') private patSecurityService) { }

  get = () => {
    if (this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-view')) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/locationidentifier`;
        this.httpClient.get<MasterLocationIdentifier>(url)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      })
    }
  };

  locationIdentifier = (masterLocationIdentifierId: string) => {
    if (masterLocationIdentifierId) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/locationidentifier/${String(masterLocationIdentifierId)}`;
        this.httpClient.get<MasterLocationIdentifier>(url)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      })
    }
  };

  save = (masterLocationIdentifier: MasterLocationIdentifier) => {
    if (masterLocationIdentifier) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/locationidentifier`;
        this.httpClient.post(url, masterLocationIdentifier)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
    }
  };

  update = (masterLocationIdentifier: MasterLocationIdentifier) => {
    if (masterLocationIdentifier) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/locationidentifier`;
        this.httpClient.put(url, masterLocationIdentifier)
          .toPromise()
          .then(res => {
            resolve(res);
          }, err => { // Error
            reject(err);
          })
      });
    }
  };

  delete = (masterLocationIdentifierId: string) => {
    if (masterLocationIdentifierId) {
      return new Promise((resolve, reject) => {
        const url = `${String(this.soarConfig.domainUrl)}/locationidentifier/${String(masterLocationIdentifierId)}`;
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
