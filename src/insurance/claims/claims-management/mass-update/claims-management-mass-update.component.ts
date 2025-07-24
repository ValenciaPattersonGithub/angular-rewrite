import { Component, OnInit, Input, Inject, ViewChild, ViewContainerRef, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import { ClaimsManagementMassUpdateDialogComponent } from './claims-management-mass-update-dialog.component';

@Component({
  selector: 'claims-management-mass-update',
  templateUrl: './claims-management-mass-update.component.html',
})
export class ClaimsManagementMassUpdateComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef, static: false })
  public containerRef: ViewContainerRef;
  @Input() claims: any;
  @Output() update = new EventEmitter<any[]>();
  constructor(private translate: TranslateService,
              private dialogService: DialogService,
              @Inject('patSecurityService') private patSecurityService,
  ) { }

  hasClaimEditAccess: boolean;
  massUpdateTooltip: string;
  dialog: DialogRef;

  ngOnInit() {
    this.authAccess();
  }

  authAccess() {
      this.hasClaimEditAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-ins-iclaim-edit');
  }

  massUpdateAllowed() {
      var count = 0;
      var foundNonPrimaryOrSecondary = false;
      var isAllowed = false;
      this.claims.forEach(claim => {
          if (claim.Selected) {
              count++;
              if (claim.PatientBenefitPlanPriority > 1) {
                  foundNonPrimaryOrSecondary = true;
              }
          }
      });
      if (count > 1) {
          if (foundNonPrimaryOrSecondary) {
              this.massUpdateTooltip = this.translate.instant('Mass Update can only be used for Primary and Secondary claims.');
          } else {
              this.massUpdateTooltip = '';
              isAllowed = true;
          }
      }
      else {
          this.massUpdateTooltip = this.translate.instant('Multiple claims or predeterminations must be selected.');
      }

      return isAllowed;
  }

  openMassUpdateDialog() {
    if (this.hasClaimEditAccess) {
      const selectedClaims = this.claims.filter(member => member.Selected === true);
      this.dialog = this.dialogService.open({ appendTo: this.containerRef, content: ClaimsManagementMassUpdateDialogComponent });
      this.dialog.content.instance.title = 'Mass Update';
      this.dialog.content.instance.claims = selectedClaims;
      this.dialog.result.subscribe((massUpdateResponseObject: any) => {
          this.update.emit(massUpdateResponseObject);
      });
    }
  }
}
