import { Component, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

declare let _: any;

@Component({
  selector: 'patient-account-note-menu',
  templateUrl: './patient-account-note-menu.component.html',
  styleUrls: ['./patient-account-note-menu.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class PatientAccountNoteMenuComponent implements OnInit {
  @Input() gridIndex: any;
  @Input() accountNotesRow: any;
  @Input() refreshSummaryPageDataForGrid: any;
  // @Input() patientData: any;
  @Input() showViewEobButton: any;
  @Input() showViewEligibilityButton: any;

  personAccountNote: any;
  isAddmode = false;
  mode = '';
  accountMembers: any;
  selectedPatientId: any;
  noaccessTooltipText = this.translate.instant('You do not have permission to view this information.');
  hasAccountNoteViewAccess = false;
  hasAccountNoteEditAccess = false;
  hasAccountNoteDeleteAccess = false;
  hasViewEOBAccess = false;
  hasViewRTEAccess = false;
  minEligibilityCheckDate = new Date('2024-10-31');

  constructor(
    @Inject("AccountNoteFactory") private accountNoteFactory,
    @Inject('PatientServices') private patientServices,
    @Inject('referenceDataService') private referenceDataService,
    @Inject('TimeZoneFactory') private timeZoneFactory,
    @Inject('localize') private localize,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('$uibModal') private uibModal,
    @Inject('$scope') private scope , private translate: TranslateService
    , @Inject('patSecurityService') private patSecurityService


  ) { }

  ngOnInit(): void {
    this.authAccess();
  }

  viewAccountNote() {
    if (this.hasAccountNoteViewAccess) {
      this.isAddmode = false;
      this.mode = 'view';
      this.showModalAccountNote();
    }
  };

  editAccountNote() {
    if (this.hasAccountNoteEditAccess) {
      this.mode = 'edit';
      this.showModalAccountNote();
    }
  };

  deleteAccountNote() {
    if (this.hasAccountNoteDeleteAccess)
      this.accountNoteFactory.deleteAccountNote(this.accountNotesRow.NoteType, this.accountNotesRow.ObjectIdLong, this.refreshSummaryPageDataForGrid);
  };

  viewEob() {
    if (this.hasViewEOBAccess)
      this.accountNoteFactory.viewEob(this.accountNotesRow.EraTransactionSetHeaderId, this.accountNotesRow.ObjectIdLong, this.accountNotesRow.PersonId);
  };

  viewRte() {
    if (this.hasViewRTEAccess)
      if (new Date(this.accountNotesRow.Date) > this.minEligibilityCheckDate){
        this.accountNoteFactory.viewRte(this.accountNotesRow.ObjectIdLong);
      } else {
        this.toastrFactory.error(this.localize.getLocalizedString('CHC Eligibility record cannot be retrieved'), 
          this.localize.getLocalizedString('View RTE Error'));
      }      
  };
  showModalAccountNote() {
    this.accountNoteFactory.getAccountNote(this.accountNotesRow.ObjectIdLong).then((res) => {
      this.personAccountNote = res.Value;
      this.getPersonAccountMembers();
    });
  }
  getPersonAccountMembers() {
    this.patientServices.Account.getAllAccountMembersByAccountId({
      accountId: this.personAccountNote.AccountId
    }, this.personAccountMemberSuccess, this.personAccountMemberFailure);
  }

  personAccountMemberSuccess = (res: any) => {
    if (this.personAccountNote.NoteType === 2 && this.mode !== 'view')
      return;
    var locations = this.referenceDataService.get(this.referenceDataService.entityNames.locations);
    this.scope.accountMembers = res.Value;
    this.scope.personAccountNote = this.personAccountNote;
    this.scope.mode = this.mode;
    var locationTmp = _.find(locations, { LocationId: this.personAccountNote.LocationId });
    var locationTimezone = locationTmp ? locationTmp.Timezone : '';
    this.personAccountNote.Date = this.timeZoneFactory.ConvertDateToMomentTZ(this.personAccountNote.DateEntered, locationTimezone);
    this.selectedPatientId = this.personAccountNote.PatientId;
    this.scope.previewModal = this.uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'App/Patient/components/createNote-modal/createNote-modal.html',
      controller: 'CreateNoteModalController',
      bindtoController: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      scope: this.scope
    });
  }
  personAccountMemberFailure = () => {
    this.toastrFactory.error(this.localize.getLocalizedString('Failed'), this.localize.getLocalizedString('Failed'));
    return;
  };
  authAccess = () => {
    this.hasAccountNoteViewAccess = this.authAccessByType("soar-per-acnote-view");
    this.hasAccountNoteEditAccess = this.authAccessByType("soar-per-acnote-edit");
    this.hasAccountNoteDeleteAccess = this.authAccessByType("soar-per-acnote-delete")
    this.hasViewEOBAccess = this.authAccessByType("soar-acct-aipmt-view");
    this.hasViewRTEAccess = this.authAccessByType("soar-ins-rte-view")
     
  }
  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
}
}
