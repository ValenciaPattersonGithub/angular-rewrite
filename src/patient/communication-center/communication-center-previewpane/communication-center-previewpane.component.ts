import { Component, OnInit, OnDestroy, Inject, ViewContainerRef } from '@angular/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { PatientCommunication } from 'src/patient/common/models/patient-communication.model';
import {
  CommunicationReason, CommunicationType, CommunicationCategory,
  CommunicationStatus, FormMode, CommunicationEvent, CommunicationTab, CommunicationHeader
} from '../../common/models/enums';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subscription, Subject } from 'rxjs';
import { take, filter, takeUntil } from 'rxjs/operators';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { Input } from '@angular/core';
import { CommunicationCustomEvent } from 'src/patient/common/models/communication-custom-event.model';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { PatientCommunicationTemplate } from 'src/patient/common/models/patient-communication-templates.model';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import { RichTextSanitizerService } from '../../../@shared/filters/rich-text-sanitizer.service';
import moment from 'moment';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
declare let _: any;
@Component({
  selector: 'communication-center-previewpane',
  templateUrl: './communication-center-previewpane.component.html',
  styleUrls: ['./communication-center-previewpane.component.scss']
})
export class CommunicationCenterPreviewpaneComponent implements OnInit, OnDestroy {
  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;
  @Input() communicationModel: PatientCommunication;
  @Input() printPreview: boolean;
  CommunicationReason = CommunicationReason;
  CommunicationType = CommunicationType;
  CommunicationCategory = CommunicationCategory;
  CommunicationStatus = CommunicationStatus;
  defaultClinicalNoteToolTipText = this.translate.instant('Clinical Note Communications must be managed from the Clinical page');
  toolTipMessage: any;
  isClinicalNote: any;

  soarAuthPCommEditKey = 'soar-per-pcomm-edit';
  hasEditAccess: any;
  formMode: any;
  drawerValue: any;
  isModified: any;
  userName: any;
  soarAuthCommDeleteKey = 'soar-per-pcomm-delete';
  hasDeleteAccess: any;

  soarAuthNoteEditKey = 'soar-per-acnote-edit';
  hasAccNoteEditAccess: any;

  soarAuthNoteDeleteKey = 'soar-per-acnote-delete';
  hasAccNoteDeleteAccess: any;
  filteredTemplates: Array<PatientCommunicationTemplate>;
  private unsubscribe$: Subject<any> = new Subject<any>();

  dialog: DialogRef;
  @Input() containerRef: ViewContainerRef;
  constructor(
    private patientCommunicationCenterService: PatientCommunicationCenterService,
    private translate: TranslateService,
    @Inject('patSecurityService') private patSecurityService,
    private datepipe: DatePipe,
    private confirmationModalService: ConfirmationModalService,
    @Inject('toastrFactory') private toastrFactory,
    public communicationConstants: CommunicationConstants,
      private dialogService: DialogService,
      private richTextSanitizerService: RichTextSanitizerService,
      private referralManagementHttpService: ReferralManagementHttpService,
  ) { }

  ngOnInit() {
    this.formMode = FormMode.Preview;
    this.patientCommunicationCenterService.GetPatientCommunicationTemplates().subscribe((templates: any) => {
      this.patientCommunicationCenterService.communicationTemplates = templates;
    });
    if (!this.printPreview) {
      this.patientCommunicationCenterService.getCommunicationEvent().pipe(takeUntil(this.unsubscribe$)).subscribe(
        (event: CommunicationCustomEvent) => {
          if (event) {
            switch (event.eventtype) {
              case CommunicationEvent.PreviewCommunication:
                if (event.data) {
                  this.handlePreviewCommunicationEvent(event.data);
                } else {
                  this.communicationModel = null;
                }
                break;
            }
          }
        });
      this.authAccess();
    } else {
      this.editCommunicationUserDetails();

    }
  }
  toolTipText = () => {
    if (this.communicationModel.Reason === CommunicationReason.ClinicalNote) {
      this.isClinicalNote = true;
      this.toolTipMessage = this.defaultClinicalNoteToolTipText;
    } else {
      this.isClinicalNote = false;
      this.toolTipMessage = '';
    }
  }
    editPatientCommunication = (communication: any) => {
    communication.Notes = _.unescape(communication.Notes);
    this.patientCommunicationCenterService.activeTab = (!communication.CommunicationMode) ? CommunicationTab.Communication : CommunicationTab.GenerateLetter;
     this.patientCommunicationCenterService.oldCommunication = communication;
    if (!this.isClinicalNote && this.hasEditAccess) {
      this.editCommunication(communication);
    }
  }

  deleteCommunication = (patientCommunicationId: any) => {
    if (this.hasDeleteAccess &&
      String(this.communicationModel.Reason) !== String(CommunicationReason.ClinicalNote) &&
      String(this.communicationModel.CommunicationCategory) !== String(CommunicationCategory.Account)) {
      this.openConfirmationModal(this.communicationConstants.deleteConfirmationModalData, patientCommunicationId);
    } else if (this.hasDeleteAccess && this.hasAccNoteDeleteAccess &&
      String(this.communicationModel.Reason) !== String(CommunicationReason.ClinicalNote)) {
      this.openConfirmationModal(this.communicationConstants.deleteConfirmationModalData, patientCommunicationId);
    }
  }

  deleteReferralCommunication = (referralCommunicationId: any) => {
    this.openConfirmationModal(this.communicationConstants.deleteConfirmationModalData, referralCommunicationId, true);
  }

  openConfirmationModal = (data, patientCommunicationId, isReferralCommunication = false) => {
    this.confirmationRef = this.confirmationModalService.open({
      data
    });
    this.confirmationModalSubscription = this.confirmationRef.events.pipe(
      filter((event) => !!event),
      filter((event) => {
        return event.type === 'confirm' || event.type === 'close';
      }),
      take(1)
    ).subscribe((events) => {
      switch (events.type) {
        case 'confirm':
          if (isReferralCommunication === true){
            this.referralManagementHttpService.deleteReferralCommunication(patientCommunicationId).then((res) => {
              this.deleteCommunicationSuccess();
            }, () => {
              this.deleteCommunicationFailure();
            });
          } else {
            this.patientCommunicationCenterService
            .deletePatientCommunicationById(patientCommunicationId,
              this.communicationModel.PersonAccountNoteId ? this.communicationModel.PersonAccountNoteId : 0)
            .subscribe(() => this.deleteCommunicationSuccess(), error => this.deleteCommunicationFailure());
          }
          
          this.confirmationRef.close();
          break;
        case 'close':
          this.confirmationRef.close();
          break;
      }
    });
  }
  deleteCommunicationSuccess = () => {
    this.patientCommunicationCenterService
      .setCommunicationEvent({ eventtype: CommunicationEvent.UpdateTimeLine, data: this.communicationModel });
    this.toastrFactory.success(
      this.translate.instant('Successfully deleted the communication.'),
      this.translate.instant('Success'));
  }
  deleteCommunicationFailure = () => {
    this.toastrFactory.error(
      this.translate.instant('Failed to delete the communication. Try again.'),
      this.translate.instant('Server Error'));
  }
  authAccess = () => {
    this.hasEditAccess = this.authAccessByType(this.soarAuthPCommEditKey);
    this.hasDeleteAccess = this.authAccessByType(this.soarAuthCommDeleteKey);
    this.hasAccNoteEditAccess = this.authAccessByType(this.soarAuthNoteEditKey);
    this.hasAccNoteDeleteAccess = this.authAccessByType(this.soarAuthNoteDeleteKey);
  }
  authAccessByType = (authtype: string) => {
    const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
    return result;
  }
  ngOnDestroy() {
    this.communicationModel = null;
    this.patientCommunicationCenterService
      .setCommunicationEvent({ eventtype: CommunicationEvent.PreviewCommunication, data: null });
  }
  editCommunicationUserDetails = () => {
    const dateModified = this.datepipe.transform(this.communicationModel.DateModified, 'MM/dd/yyyy:HH:mm:ss');
    const commDate = this.datepipe.transform(this.communicationModel.CommunicationDate, 'MM/dd/yyyy:HH:mm:ss');
    this.isModified = (dateModified > commDate);
    if (this.isModified) {
      const formattedModifiedDate = this.datepipe.transform(this.communicationModel.DateModified, 'MM/dd/yyyy');
      this.communicationModel.EditedBy = this.patientCommunicationCenterService.getUserdetail(this.communicationModel.UserModified, false);
      if (this.communicationModel.EditedBy !== '') {
        this.communicationModel.EditedBy = `${this.communicationModel.EditedBy ? this.communicationModel.EditedBy : ''} ${' on '} ${formattedModifiedDate ? formattedModifiedDate : ''} `;
      }
    }
  }
  editCommunication = (communication: any) => {
    this.patientCommunicationCenterService.cachedCommunicationTab = null;
     const drawerState: any = this.patientCommunicationCenterService.isDrawerOpened;
       if (!drawerState) {
         this.patientCommunicationCenterService.setCommunicationEvent({ eventtype: CommunicationEvent.DrawerVisibility, data: {drawerType: CommunicationHeader.CommunicationDrawer, data: true} });
       }
       this.patientCommunicationCenterService.setCommunicationEvent({ eventtype: CommunicationEvent.EditCommunication, data: {Communication: communication, Mode: FormMode.EditMode } });
   }
  handlePreviewCommunicationEvent = (previewcommunication: any) => {
    if (previewcommunication) {
        this.communicationModel = previewcommunication;
        previewcommunication.Notes = this.decodeHtmlEntities(previewcommunication.Notes);   
        previewcommunication.LetterTemplate = this.sanitizeNote(previewcommunication.LetterTemplate);        
      if (this.communicationModel.CommunicationTemplateId && (this.patientCommunicationCenterService.communicationTemplates && this.patientCommunicationCenterService.communicationTemplates.length)) {
        this.filteredTemplates =  this.patientCommunicationCenterService.communicationTemplates.filter(x => x.CommunicationTemplateId === this.communicationModel.CommunicationTemplateId);
        this.communicationModel.LetterTemplateName =(this.filteredTemplates.length)?this.filteredTemplates[0].TemplateName:"N/A";
      }
      this.editCommunicationUserDetails();
    } else {
      this.communicationModel = null;
    }
  }
  initializeCommunicationModal = () => {
    this.communicationModel = null;
  }
  previewLetterCommunication = (templateRef: any, actionTemplate: any) => {
    if (this.formMode === FormMode.Preview) {
      this.openPreviewDialog(templateRef, actionTemplate);
    } else if (this.formMode === FormMode.SaveAndPreview){
      this.patientCommunicationCenterService.PrintTemplate(this.communicationModel.LetterTemplate);
      this.dialog.close();
    }
  }
  openPreviewDialog = (templateRef: any, actionTemplate: any) => {
    this.dialog = this.dialogService.open({
      content: templateRef,
      actions: actionTemplate
    });
    this.formMode = FormMode.SaveAndPreview;
    this.dialog.result.subscribe((result: any) => {
      if (!result.primary) {
        if (this.formMode === FormMode.SaveAndPreview) {
          this.formMode = FormMode.Preview;
        }
        this.dialog.close();
      } 
    });

    }

    sanitizeNote = (note: any) => {
        return this.richTextSanitizerService.sanitizeRichText(note);
    }

    decodeHtmlEntities = (text: string) => {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = text;
        return textarea.value;
    };

    formatPhoneNumber(phoneNumber: string): string {
      if (phoneNumber) {
        return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      }
      return '--';
    }
    
    calculateAge(dateOfBirth: Date): string {
      if (dateOfBirth) {
        return moment().diff(dateOfBirth, 'years').toString();
      }
      return '--';
    }
    getWorkPhone(): string {
      return this.formatPhoneNumber(this.communicationModel.PatientInfo.PhoneNumbers != null && this.communicationModel.PatientInfo.PhoneNumbers?.find(x => x.Type == 'Work') != null ? 
      this.communicationModel.PatientInfo.PhoneNumbers?.find(x => x.Type == 'Work')?.PhoneNumber : '')
    }
}
