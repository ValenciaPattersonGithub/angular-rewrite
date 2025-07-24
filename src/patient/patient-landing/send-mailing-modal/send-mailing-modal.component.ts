import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { SoarSelectListComponent } from 'src/@shared/components/soar-select-list/soar-select-list.component';
import { CommunicationTemplateModel } from 'src/@shared/models/send-mailing.model';
import { CommunicationType, PatientEmptyGuid } from 'src/patient/common/models/enums/patient.enum';
import { BadgeFilterType } from 'src/patient/common/models/patient-location.model';

@Component({
  selector: 'send-mailing-modal',
  templateUrl: './send-mailing-modal.component.html',
  styleUrls: ['./send-mailing-modal.component.scss']
})
export class SendMailingModalComponent implements OnInit {
  mailingTitle = '';
  communicationType = [];
  templateSource: CommunicationTemplateModel[];
  commTypeId = 0 || null;
  disabled = true;
  checked = false;
  activeFltrTab = 0;
  activeGridDataCount = 0;
  patientId = null;
  groupId = null;
  categorySource = [];
  isPostcard = false;
  isPrintMailingLabel = false;
  communicationTemplateId = null;
  communicationTypeId = 0;
  selected = false;
  mailingForm: FormGroup;
  @ViewChild("lstCommTemplate") soarSelectList: SoarSelectListComponent;
  popupSettings = { width: '1rem', popupClass: 'soar-select-list-popup' };

  constructor(public dialog: DialogRef,
    @Inject('PatientServices') private patientServices,
    @Inject('toastrFactory') private toastrFactory,
    private translate: TranslateService,
    private fb: FormBuilder
  ) { }

  //#region Life cycle hooks
  ngOnInit(): void {
    this.createForm();
    if (this.dialog?.content?.instance) {
      this.activeFltrTab = this.dialog?.content?.instance?.activeFltrTab;
      if (this.activeFltrTab == BadgeFilterType.AllPatients) {
        this.mailingTitle = this.translate.instant('All Patients');
        this.activeGridDataCount = this.dialog?.content?.instance?.activeGridDataCount?.allPatients;
      } else if (this.activeFltrTab == BadgeFilterType.Appointments) {
        this.mailingTitle = this.translate.instant('Appointments');
        this.activeGridDataCount = this.dialog?.content?.instance?.activeGridDataCount?.appointments;
      } else if (this.activeFltrTab == BadgeFilterType.otherToDo) {
        this.mailingTitle = this.translate.instant('Other to do');
        this.activeGridDataCount = this.dialog?.content?.instance?.activeGridDataCount?.otherToDo;
      } else if (this.activeFltrTab == BadgeFilterType.PreventiveCare) {
        this.mailingTitle = this.translate.instant('Preventive Care');
        this.activeGridDataCount = this.dialog?.content?.instance?.activeGridDataCount?.preventiveCare;
      } else if (this.activeFltrTab == BadgeFilterType.TreatmentPlans) {
        this.mailingTitle = this.translate.instant('Treatment Plans');
        this.activeGridDataCount = this.dialog?.content?.instance?.activeGridDataCount?.treatmentPlans;
      }
    }
    // Category source
    this.categorySource = [
      { id: 1, tab: 0, name: this.translate.instant('Account') },
      { id: 3, tab: 2, name: this.translate.instant('Patient') },
      { id: 2, tab: 1, name: this.translate.instant('Appointments') },
      { id: 5, tab: 5, name: this.translate.instant('Other To Do') },
      { id: 4, tab: 7, name: this.translate.instant('Preventive Care') },
      { id: 5, tab: 6, name: this.translate.instant('Treatment Plans') }
    ];

    // Communication type
    this.communicationType = [
      { Id: 1, Name: this.translate.instant('US Mail Template') },
      { Id: 4, Name: this.translate.instant('Post Card Template') },
      { Id: 3, Name: this.translate.instant('Mailing Labels Only') }
    ];
  }
  //#endregion

  //#region Form
  createForm = () => {
    this.mailingForm = this.fb?.group({
      communicationTypeId: ['', null],
      communicationTemplateId: ['', null],
      isPrintMailingLabel: ['', null],
      isPostcard: ['', null]
    })
  }
  //#endregion

  //#region Modal popup
  close = () => {
    this.dialog?.close();
  }

  confirm = () => {
    this.isPrintMailingLabel = this.checked;
    this.dialog?.close(this.mailingForm?.value);
  }
  //#endregion

  templateIdChanged = (newValue) => {
    this.communicationTemplateId = newValue;
    this.selected = false;
    if (newValue && (this.commTypeId == CommunicationType.UsMail || this.commTypeId == CommunicationType.Postcard)) {
      this.selected = true;
      this.disabled = false;
    } else {
      this.communicationTemplateId = null;
    }
  }

  //#region Communication Type
  communicationTypeIdChanged = (newValue) => {

    if (!newValue) {
      this.commTypeId = 0;
      return; // Exit the method if newValue is null, undefined, or empty
    }

    if (!this.communicationTemplateId || newValue == '') {
      this.communicationTemplateId = null;
      this.disabled = true;
    }
    
    this.commTypeId = newValue;
    this.communicationTypeId = this.commTypeId;
    this.isPostcard = this.commTypeId == 4;
    this.mailingForm?.controls?.isPostcard?.setValue(this.isPostcard);
    this.groupId = this.categorySource?.find(x => x.tab == this.activeFltrTab)?.id;
    this.patientId = PatientEmptyGuid;

    const params = { Id: this.patientId, mediaTypeId: this.commTypeId, GroupId: this.groupId };
    this.patientServices?.Communication?.getTemplatesByGroupId(params).$promise.then(res => {
      this.getTemplatesByGroupSuccess(res);
    }, () => {
      this.toastrFactory.error(this.translate.instant('Failed to retrieve Communication Type data'), this.translate.instant('Error'));
    });
  }

  getTemplatesByGroupSuccess = (res: SoarResponse<CommunicationTemplateModel[]>) => {
    this.templateSource = [];
    res?.Value?.forEach(val => {
      if (val) {
        const item = {
          CommunicationTemplateId: val?.CommunicationTemplateId,
          TemplateName: val?.TemplateName,
        };
        this.templateSource?.push(item);
      }
    });
    if (res?.Value?.length > 0) {
      this.soarSelectList.optionList = this.templateSource;
      this.soarSelectList?.initSelectionList();
    }
  }

  setPrintMailing = () => {
    this.checked = this.mailingForm?.controls?.isPrintMailingLabel?.value;
  }
  //#endregion
}
