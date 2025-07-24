import { Component, OnInit, AfterViewInit, Inject } from '@angular/core';
import { DialogContentBase, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'merge-duplicate-patients-dialog',
  templateUrl: './merge-duplicate-patients-dialog.component.html',
  styleUrls: ['./merge-duplicate-patients-dialog.component.scss']
})
export class MergeDuplicatePatientsDialogComponent extends DialogContentBase implements OnInit, AfterViewInit {
  title: any;
  accountMembers: any;
  isValid: boolean;
  hasEditAccess: boolean;
  validationMessage: any;
  constructor(
    private translate: TranslateService,
    @Inject('PatientServices') private patientServices,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('patSecurityService') private patSecurityService,
    public dialog: DialogRef
    ) {
      super(dialog);
    }

  ngOnInit() {
    this.authAccess();
    this.isValid = false;
    this.title = this.dialog.content.instance.title;
    this.accountMembers = this.dialog.content.instance.accountMembers;
  }

  authAccess() {
    this.hasEditAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-per-perdem-modify');
  }

  cancelDialog() {
    this.dialog.close();
  }

  // validate selection of primary -duplicate patient rules
  validateDuplicates() {
    const selectedPrimary = this.accountMembers.find(x => x.IsPrimaryDuplicate === true);
    // if a patient has duplicates, it can't be a duplicate for another patient
    const duplicates = this.accountMembers.filter(x => x.IsPrimaryDuplicate === false);
    const duplicateThatIsAPrimary = duplicates.find(x => x.DuplicatePatients.length > 0);
    if (duplicateThatIsAPrimary) {
      this.validationMessage = duplicateThatIsAPrimary.Name +
        this.translate.instant(' is already a Primary Account.');
      return false;
    }
    // if the selected primary is a duplicate for another patient, it can't be selected as primary
    if (selectedPrimary.PrimaryDuplicatePatientId !== null && selectedPrimary.PrimaryDuplicatePatientId !== '') {
      this.validationMessage = 'The selected Primary Account is already a duplicate for another patient.';
      return false;
    }
    // if the selected primary is a responsible party they must be the selected primary
    const oneOfGroupIsResponsibleParty = this.accountMembers.filter(x => x.IsResponsiblePerson === true);
    if (oneOfGroupIsResponsibleParty.length > 0 && oneOfGroupIsResponsibleParty[0].PatientId !== selectedPrimary.PatientId) {
       this.validationMessage = 'The Responsible Party can not be a duplicate for another patient.';
       return false;
    }
    if (selectedPrimary.PrimaryDuplicatePatientId !== null && selectedPrimary.PrimaryDuplicatePatientId !== '') {
      this.validationMessage = 'The selected Primary Account is already a duplicate for another patient.';
      return false;
    }
    return true;
  }

  updatePatientDuplicates() {
    return new Promise((resolve, reject) => {
      this.patientServices.PatientDuplicates.update(this.accountMembers).$promise.then((res) => {
          this.accountMembers = res.Value;
          this.toastrFactory.success(
            this.translate.instant('Your Primary Account has saved.'),
            this.translate.get('Success'));
          resolve(res);
        }, (ex) => {
          // tslint:disable-next-line: max-line-length
          this.toastrFactory.error(this.translate.instant('Failed to update duplicate patients. Refresh the page to try again.'),
          this.translate.get('Server Error'));
          reject();
        }
      );
    });
  }

  // save the primaryDuplicate and then return this new dto to list to be merged...
  savePrimaryDuplicate() {
    if (this.hasEditAccess === true) {
      if (this.validateDuplicates() === true) {
        this.updatePatientDuplicates().then((res) => {
          this.dialog.close(this.accountMembers);
        }, (ex) => {
        });
      }
    }
  }

  // sets thePrimaryDuplicatePatientId
  toggleSelected(accountMember) {
    this.validationMessage = '';
    this.accountMembers.forEach( member => {
      if (member.PatientId !== accountMember.PatientId) {
        member.IsPrimaryDuplicate = false;
        member.PrimaryDuplicatePatientId = accountMember.PatientId;
      }
      if (member.PatientId === accountMember.PatientId) {
        member.IsPrimaryDuplicate = true;
        member.PrimaryDuplicatePatientId = '';
      }
    });
    this.isValid = true;
  }
}
