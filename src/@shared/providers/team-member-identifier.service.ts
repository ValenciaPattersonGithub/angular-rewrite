import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { MasterAdditionalIdentifier, MasterTeamMemberIdentifier } from 'src/business-center/practice-settings/models/team-member-identifier.model';

@Injectable({
  providedIn: 'root'
})
export class TeamMemberIdentifierService {

  constructor(private httpClient: HttpClient,
    @Inject('SoarConfig') private soarConfig,
    @Inject('patSecurityService') private patSecurityService) { }

  get = () => {
    return new Promise((resolve, reject) => {
      let url = this.soarConfig.domainUrl + '/masteruseridentifiers';
      this.httpClient.get<MasterTeamMemberIdentifier>(url)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    })
  }

  teamMemberIdentifier = (MasterUserIdentifierId?: number) => {
    return new Promise((resolve, reject) => {

      let url;
      if (MasterUserIdentifierId > 0) {
        url = this.soarConfig.domainUrl + '/masteruseridentifiers/' + MasterUserIdentifierId;
      }
      else {
        url = this.soarConfig.domainUrl + '/masteruseridentifiers';
      }

      this.httpClient.get<MasterAdditionalIdentifier>(url)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    })
  }

  save = (masterTeamMemberIdentifier: MasterTeamMemberIdentifier) => {
    return new Promise((resolve, reject) => {
      let url = this.soarConfig.domainUrl + '/masteruseridentifiers';
      this.httpClient.post(url, masterTeamMemberIdentifier)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    });
  }

  update = (masterTeamMemberIdentifier: MasterTeamMemberIdentifier) => {
    return new Promise((resolve, reject) => {
      let url = this.soarConfig.domainUrl + '/masteruseridentifiers';
      this.httpClient.put(url, masterTeamMemberIdentifier)
        .toPromise()
        .then(res => {
          resolve(res);
        }, err => { // Error
          reject(err);
        })
    });
  }

  delete = (MasterUserIdentifierId: string) => {
    if (this.patSecurityService?.IsAuthorizedByAbbreviation('soar-biz-bsvct-delete')) {
      return new Promise((resolve, reject) => {
        let url = this.soarConfig.domainUrl + '/masteruseridentifiers/' + MasterUserIdentifierId;
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
