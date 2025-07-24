import { Injectable, Inject } from '@angular/core';
import { AuthAccess } from 'src/@shared/models/auth-access.model';
import { groupBy } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PatientNotesService {
  constructor(@Inject('patSecurityService') private patSecurityService,
              @Inject('toastrFactory') private toastrFactory,
              @Inject('PatientServices') private patientServices,
              @Inject('localize') private localize,
  ) { }

  //#region authentication
  authCreateAccess() {
      return this.patSecurityService.IsAuthorizedByAbbreviation('rxapi-rx-rxpat-create');
  }
  authViewAccess() {
      return this.patSecurityService.IsAuthorizedByAbbreviation('soar-clin-clinrx-view');
  }
  getAuthAccess() {
    const authAccess = new AuthAccess();
    if (this.authViewAccess()) {
      authAccess.create = this.authCreateAccess();
      authAccess.view = true;
    }
    return authAccess;
  }

  getClinicalNotes(personId) {
    return new Promise((resolve, reject) => {
      this.patientServices.ClinicalNotes.get({ Id: personId }, (res) => {
        resolve(res);
      }, (err) => {
        this.toastrFactory.error(
          this.localize.getLocalizedString('Failed to retrieve the list of {0}. Refresh the page to try again.', ['Clinical Notes']),
          this.localize.getLocalizedString('Server Error'));
        reject(err);
      });
    });
  }

}
