import {
    Component, OnInit, Input, Inject, ElementRef, ViewChild, AfterViewInit, HostListener, ViewContainerRef
} from '@angular/core';
import { PatientCommunication } from '../../common/models/patient-communication.model';
import {
    CommunicationReason, CommunicationType, CommunicationCategory, CommunicationStatus, FormMode, CommunicationEvent, CommunicationTab, CommunicationHeader
} from '../../common/models/enums';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subscription } from 'rxjs';
import { take, filter } from 'rxjs/operators';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { DialogService, DialogRef } from '@progress/kendo-angular-dialog';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
declare let _: any;
@Component({
    selector: 'app-communication-card',
    templateUrl: './communication-card.component.html',
    styleUrls: ['./communication-card.component.scss']
})
export class CommunicationCardComponent implements OnInit, AfterViewInit {
    @Input() communicationModel: PatientCommunication;
    @Input() selectedCommunication: PatientCommunication;
    @Input() index: number;
    @ViewChild('communicationCard', { static: false }) communicationCard: ElementRef;
    CommunicationReason = CommunicationReason;
    CommunicationType = CommunicationType;
    CommunicationCategory = CommunicationCategory;
    CommunicationStatus = CommunicationStatus;
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;
    defaultClinicalNoteToolTipText = this.translate.instant('Clinical Note Communications must be managed from the Clinical page');
    toolTipMessage: any;
    isClinicalNote: any;
    isModified: any;
    drawerValue: any;
    soarAuthPCommEditKey = 'soar-per-pcomm-edit';
    hasEditAccess: any;
    formMode: any;
    userName: any;

    soarAuthCommDeleteKey = 'soar-per-pcomm-delete';
    hasDeleteAccess: any;

    soarAuthNoteEditKey = 'soar-per-acnote-edit';
    hasAccNoteEditAccess: any;

    soarAuthNoteDeleteKey = 'soar-per-acnote-delete';
    hasAccNoteDeleteAccess: any;

    dialog: DialogRef;
    @Input() containerRef: ViewContainerRef;

    constructor(
        private translate: TranslateService,
        private confirmationModalService: ConfirmationModalService,
        @Inject('patSecurityService') private patSecurityService,
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        @Inject('toastrFactory') private toastrFactory,
        private datepipe: DatePipe,
        public communicationConstants: CommunicationConstants,
        private dialogService: DialogService,
        private referralManagementHttpService: ReferralManagementHttpService) { }

    ngOnInit() {
        this.formMode = FormMode.Preview;
        if (!this.communicationModel) {
            this.initializeCommunicationModal();
        } else {
            this.userCommunicationEditDetails();
        }
        this.authAccess();
    }
    ngAfterViewInit() {
        if (this.communicationModel === this.selectedCommunication) {
            if (this.communicationCard) {
                this.communicationCard.nativeElement.focus();
            }
        }
    }
    onCardSelection = (communication: PatientCommunication) => {
        this.selectedCommunication = communication;
        this.patientCommunicationCenterService
            .setCommunicationEvent({ eventtype: CommunicationEvent.PreviewCommunication, data: communication });
    }

    @HostListener('keydown', ['$event']) onKeyUp = (e: any) => {

        switch (e.keyCode) {
            case 16:
                e.preventDefault();
                this.patientCommunicationCenterService
                    .setCommunicationEvent({ eventtype: CommunicationEvent.KeyBoard, data: { element: this, action: 'UP' } });
                break;
            case 38:
                this.patientCommunicationCenterService
                    .setCommunicationEvent({ eventtype: CommunicationEvent.KeyBoard, data: { element: this, action: 'UP' } });
                break;
            case 40:
                this.patientCommunicationCenterService
                    .setCommunicationEvent({ eventtype: CommunicationEvent.KeyBoard, data: { element: this, action: 'DOWN' } });
                break;
            case 9:
                e.preventDefault();
                this.patientCommunicationCenterService
                    .setCommunicationEvent({ eventtype: CommunicationEvent.KeyBoard, data: { element: this, action: 'DOWN' } });
                break;
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

    editPatientCommunication = (communication: any) => {
        this.patientCommunicationCenterService.activeTab = (!communication.CommunicationMode) ?
            CommunicationTab.Communication : CommunicationTab.GenerateLetter;
        this.patientCommunicationCenterService.oldCommunication = communication;        
        if (!this.isClinicalNote && this.hasEditAccess) {
            this.editCommunication(communication);
        }
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
    initializeCommunicationModal = () => {
        this.communicationModel = {
            Status: 0
        };
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
    userCommunicationEditDetails = () => {
        this.communicationModel.AddedBy = this.patientCommunicationCenterService.getUserdetail(this.communicationModel.CreatedBy ?
            this.communicationModel.CreatedBy : this.communicationModel.UserModified, true);
            

        if (this.communicationModel.AddedBy !== null) {
            const dateModified = this.datepipe.transform(this.communicationModel.DateModified, 'MM/dd/yyyy:HH:mm:ss');
            const commDate = this.datepipe.transform(this.communicationModel.CommunicationDate, 'MM/dd/yyyy:HH:mm:ss');
            this.isModified = (dateModified > commDate);

            if (this.communicationModel.Notes && this.communicationModel.Reason !== CommunicationReason.ClinicalNote) {
              this.communicationModel.Notes = _.escape(this.communicationModel.Notes);
            }


            if (this.isModified) {
                this.communicationModel.EditedBy = this.patientCommunicationCenterService.
                    getUserdetail(this.communicationModel.UserModified, false);
                const formattedModifiedDate = this.datepipe.transform(this.communicationModel.DateModified, 'MM/dd/yyyy');
                this.communicationModel.EditedBy =
                    `${this.communicationModel.EditedBy ? this.communicationModel.EditedBy : ''} ${' on '} ${formattedModifiedDate ? formattedModifiedDate : ''} `;
            }
        }
    }
    editCommunication = (communication: any) => {
       communication.Notes = _.unescape(communication.Notes);  
        const drawerState: any = this.patientCommunicationCenterService.isDrawerOpened;        
        this.patientCommunicationCenterService.cachedCommunicationTab = null;
        if (!drawerState) {
            this.patientCommunicationCenterService.setCommunicationEvent(
                {
                    eventtype: CommunicationEvent.DrawerVisibility,
                    data: { drawerType: CommunicationHeader.CommunicationDrawer, data: true }
                });
        }
        this.patientCommunicationCenterService.setCommunicationEvent(
            {
                eventtype: CommunicationEvent.EditCommunication,
                data: { Communication: communication, Mode: FormMode.EditMode }
            });
    }
    previewLetterCommunication = (templateRef: any, actionTemplate: any) => {
        if (this.formMode === FormMode.Preview) {
            this.openPreviewDialog(templateRef, actionTemplate);
        } else if (this.formMode === FormMode.SaveAndPreview) {
            const myWindow = window.open('', '', 'width=800,height=500');            
            myWindow.document.write(document.getElementById("communication-preview-letterTemplate-content").innerHTML);
            myWindow.document.close();
            myWindow.focus();
            myWindow.print();
            myWindow.onafterprint = () => {
                myWindow.close();
            };
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
}
