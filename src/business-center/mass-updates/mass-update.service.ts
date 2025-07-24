import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class MassUpdateService {
  constructor(
    @Inject('SoarConfig') private soarConfig,
    private httpClient: HttpClient
  ) {}

  /* Public */
  runMassUpdate(massUpdate) {
    return this.httpClient.post(
      this.soarConfig.domainUrl + '/massupdatepatients',
      massUpdate
    );
  }

  massUpdateCheckForPendingBatch() {
    return this.httpClient.get(
      this.soarConfig.domainUrl + '/massUpdateCheckForPendingBatch'
    );
  }
  massUpdateCheckForPendingBatchByActivityArea(activityArea) {
    return this.httpClient.get(
      this.soarConfig.domainUrl +
        '/massUpdateCheckForPendingBatch/' +
        activityArea
    );
  }

  getMassUpdatePatientInfo(massupdateId) {
    return this.httpClient.get(
      this.soarConfig.domainUrl + '/getMassUpdatePatientInfo/' + massupdateId
    );
  }
  getMassUpdateAppointmentInfo(massupdateId) {
    return this.httpClient.get(
      this.soarConfig.domainUrl +
        '/getMassUpdateAppointmentInfo/' +
        massupdateId
    );
  }

  validateFromProvider(locationId, providerId, type, isActivePatient) {
    return this.httpClient.get(
      this.soarConfig.domainUrl +
        '/ValidateFromProvider/' +
        providerId +
        '/' +
        type +
        '/' +
        isActivePatient +
        '/' +
        locationId
    );
  }
  validateFromAppointments(providerId, locationId) {
    return this.httpClient.get(
      this.soarConfig.domainUrl +
        '/ValidateFromAppointments/' +
        providerId +
        '/' +
        locationId
    );
  }
  getRecentPatientMassUpdates() {
    return this.httpClient.get(
      this.soarConfig.domainUrl + '/GetRecentPatientMassUpdates'
    );
  }
  GetRecentPatientAppointmentsMassUpdates(activityArea) {
    return this.httpClient.get(
      this.soarConfig.domainUrl +
        '/GetRecentPatientAppointmentsMassUpdates/' +
        activityArea
    );
  }
}
