import { Component, OnInit, AfterViewInit, Inject, ChangeDetectorRef } from '@angular/core';
import { DialogContentBase, DialogRef } from '@progress/kendo-angular-dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'claims-management-mass-update-dialog',
  templateUrl: './claims-management-mass-update-dialog.component.html',
  styleUrls: ['./claims-management-mass-update-dialog.component.scss'],
})
export class ClaimsManagementMassUpdateDialogComponent extends DialogContentBase implements OnInit, AfterViewInit {
  title: any;
  claims: any;
  isValid: boolean;
  hasClaimEditAccess: boolean;
  validationMessage: any;
  submissionMethodNames: string[];
  submissionMethodOptions: any[];
  selectedSubmissionMethod: number;
  inProcess: boolean;
  updateFailed: boolean;
  responseObject: any;
  constructor(
    private translate: TranslateService,
    @Inject('CommonServices') private commonServices,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('patSecurityService') private patSecurityService,
    public dialog: DialogRef,
    private changeDetectorRef: ChangeDetectorRef
  ) {
      super(dialog);
    }

  ngOnInit() {
    this.authAccess();
    this.isValid = false;
    this.title = this.dialog.content.instance.title;
    this.claims = this.dialog.content.instance.claims;
    this.submissionMethodNames = ['', 'eClaims - Dental', 'ADA 2019 - Paper', 'CMS 1500 - Paper'];
    this.setSubmissionMethodOptions();
    this.selectedSubmissionMethod = 0;
    this.inProcess = false;
    this.updateFailed = false;
    this.responseObject = { SelectedSubmissionMethod: 0, FailedUpdateClaimIds: []};
  }

  authAccess() {
      this.hasClaimEditAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-ins-iclaim-edit');
    }

  setSubmissionMethodOptions() {
      if (this.claims.find(claim => claim.Type === 2)) {
          this.submissionMethodOptions =
              [{ name: 'eClaims - Dental', value: 1 }, { name: 'ADA 2019 - Paper', value: 2 }];
      } else {
          this.submissionMethodOptions = [
              { name: 'eClaims - Dental', value: 1 }, { name: 'ADA 2019 - Paper', value: 2 },
              { name: 'CMS 1500 - Paper', value: 3 }
          ];
      }
  }

  cancelDialog() {
    this.dialog.close();
  }

  closeDialog() {
    this.dialog.close(this.responseObject);
  }

  getColor(claim) {
    if (claim.MassUpdateFailureMessage) return 'red';
    else if (claim.Type === 2) return 'green';
    else return 'black';
  }

  validate() {
      if (this.selectedSubmissionMethod !== 0) this.isValid = true;
      else this.isValid = false;
  }

  updateClaim(claim) {
      return new Promise((resolve, reject) => {
          this.commonServices.Insurance.Claim.changeSubmissionMethod(
              { claimId: claim.ClaimId },
              { ClaimId: claim.ClaimId, SubmittalMethod: this.selectedSubmissionMethod, DataTag: claim.DataTag }).$promise.then((res) => {
                  claim.SubmittalMethod = res.Value.SubmittalMethod;
                  claim.Status = res.Value.Status;                  
                  claim.DataTag = res.Value.DataTag;
                  resolve(res);
              },
              (ex) => {
                  this.responseObject.FailedUpdateClaimIds.push(claim.ClaimId);
                  claim.Selected = false;
                  if (ex.data.InvalidProperties) {
                      let message = '';
                      for (let property of ex.data.InvalidProperties) {
                          message += '[' + property.PropertyName + ': ' + property.ValidationMessage + ']';
                      }
                      claim.MassUpdateFailureMessage = message;
                  } else if (ex.data.Message){
                    claim.MassUpdateFailureMessage = ex.data.Message;
                  }  
                  resolve(null);
              }
          );
      });
  }

  async performMassUpdate() {
      if (this.hasClaimEditAccess) {
          if (this.isValid) {
              this.inProcess = true;
              this.changeDetectorRef.detectChanges();
              let x = 1;
              for (let claim of this.claims) {
                  this.validationMessage = 'Updating ' + x + '/' + this.claims.length + '...';
                  this.changeDetectorRef.detectChanges();
                  if (claim.SubmittalMethod !== this.selectedSubmissionMethod) {
                      await this.updateClaim(claim);
                  }
                  x++;
              };

              this.responseObject.SelectedSubmissionMethod = this.selectedSubmissionMethod;

              if (this.responseObject.FailedUpdateClaimIds.length === 0) {
                  this.dialog.close(this.responseObject);
                  this.toastrFactory.success(
                      this.translate.instant('All claims were updated successfully.'),
                      this.translate.get('Success'));
              } else {
                  this.updateFailed = true;
                  this.validationMessage = (x - 1 - this.responseObject.FailedUpdateClaimIds.length) +
                      ' passed, ' +
                      this.responseObject.FailedUpdateClaimIds.length +
                      ' failed. Please check the above grid for failure details. Claims that could not be updated will be deselected when you close this window.';
              }
          }
      }
  }
}
