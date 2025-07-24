import { Component, OnInit, Inject, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { TranslateService } from '@ngx-translate/core';
import { PatientCommunication } from 'src/patient/common/models/patient-communication.model';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subscription } from 'rxjs';
import { take, filter, debounceTime } from 'rxjs/operators';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { DatePipe } from '@angular/common';
import {
    CommunicationReason, CommunicationType, CommunicationMode, CommunicationCategory,
    CommunicationStatus, FormMode, CommunicationEvent, CommunicationTab, TabIdentifier, CommunicationHeader
} from '../../common/models/enums';
import { CommunicationCustomEvent } from 'src/patient/common/models/communication-custom-event.model';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { CommunicationConstants } from '../communication-constants/communication.costants';
declare var window: any;

@Component({
    selector: 'communication-center-addrecord',
    templateUrl: './communication-center-addrecord.component.html',
    styleUrls: ['./communication-center-addrecord.component.scss']
})
export class CommunicationCenterAddrecordComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('note', { static: false }) note: ElementRef;
    addCommunicationCenter: FormGroup;
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;
    toolTipMessage: any;
    isCreateToolTipText = this.translate.instant('You do not have permission to view this information.');
    CommunicationReason = CommunicationReason;
    CommunicationType = CommunicationType;
    CommunicationCategory = CommunicationCategory;
    CommunicationStatus = CommunicationStatus;
    PatientCommunicationId: any;
    soarAuthNoteAddKey = 'soar-per-acnote-add';
    hasCreateAccess: any;
    communicationReasons: any;

    soarAuthPCommEditKey = 'soar-per-pcomm-edit';
    hasEditAccess: any;
    isModified: any;
    editedBy: any;
    isFormChanged = false;
    isResponsiblePerson = true;
    accountNoteMaxLength: number;
    personDetail: any;
    CommunicationMode = CommunicationMode;
    private unsubscribe$: Subject<any> = new Subject<any>();
    defaultCommunicationCategory: any;
    defaultCommunicationType: any;
    defaultFormValue: any;
    formValuesChanged: boolean;
    height: any;
    smallScreenHeight: any = 60;
    bigScreenHeight: any = 240;

    constructor(
        @Inject('toastrFactory') private toastrFactory,
        @Inject('$routeParams') private route,
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        private translate: TranslateService,
        private fb: FormBuilder,
        private confirmationModalService: ConfirmationModalService,
        @Inject('patSecurityService') private patSecurityService,
        private datepipe: DatePipe,
        public communicationConstants: CommunicationConstants) {

    }

    ngOnInit() {
        if (window.innerHeight > 700 && window.innerHeight < 900) {
            this.height = this.smallScreenHeight;
        } else if (window.innerHeight > 900) {
            this.height = this.bigScreenHeight;
        }
        this.formValuesChanged = false;
        this.createFormControls();
        this.subscribeInitializations();
        this.authAccess();
        setTimeout(() => {
            const patientDetail = this.patientCommunicationCenterService.patientDetail;
            if (patientDetail.Profile) {
                this.isResponsiblePerson = !!patientDetail.Profile.ResponsiblePersonId;
            }
        }, 800);
        this.defaultCommunicationValuesOnNewTab();
        this.defaultFormValue = this.addCommunicationCenter.value;
        this.handleCachedTab();
        this.communicationConstants.CommunicationReasons = this.communicationConstants.CommunicationReasons.filter(reason => reason.value !== CommunicationReason.Referral);
    }
    ngAfterViewInit() {
        if (this.route.withDrawerOpened) {
            if (this.note) {
                setTimeout(() => {
                    this.note.nativeElement.focus();
                }, 800);
            }
        }
    }
    handleCachedTab = () => {
        const cachedTab = this.patientCommunicationCenterService.cachedCommunicationTab;
        if (cachedTab && cachedTab.activeTab === CommunicationTab.Communication) {
            if (!(JSON.stringify(cachedTab.cachedFormData.value) === JSON.stringify(this.defaultFormValue))) {
                const communicationCategory = Number(cachedTab.cachedFormData.value.CommunicationCategory);
                this.patientCommunicationCenterService.drawerMode = cachedTab.cachedFormMode;
                this.communicationReasons =
                    this.communicationConstants.CommunicationReasons.filter(x => x.category === communicationCategory);
                this.addCommunicationCenter = this.patientCommunicationCenterService.cachedCommunicationTab.cachedFormData;
                setTimeout(() => {
                    this.patientCommunicationCenterService.formValuesChanged = true;
                }, 300);

            }
        } else {
            this.patientCommunicationCenterService.cachedCommunicationTab = null;
        }
    }
    subscribeInitializations = () => {
        this.addCommunicationCenter.valueChanges.pipe(debounceTime(300)).subscribe(
            (value: any) => {
                if (!this.defaultFormValue) { this.defaultFormValue = value; }
                this.formValuesChanged = !(JSON.stringify(value) === JSON.stringify(this.defaultFormValue));
                this.patientCommunicationCenterService.formValuesChanged = this.formValuesChanged;
            }
        );
        this.patientCommunicationCenterService.getCommunicationEvent().pipe(takeUntil(this.unsubscribe$)).subscribe(
            (event: CommunicationCustomEvent) => {
                if (event) {
                    switch (event.eventtype) {
                        case CommunicationEvent.DrawerStatus:
                            this.handleDrawerStatusValidityEvent(event);
                            break;
                        case CommunicationEvent.EditCommunication:
                            this.handleEditCommunicationEvent(event);
                            break;
                        case CommunicationEvent.SetDefaultValues:
                            if (this.isFormChanged || this.isModified) {
                                this.openConfirmationModal(this.communicationConstants.confirmationModalData);
                            } else {
                                this.setdefaultValuesByCommunicationType(Number(event.data));
                            }
                            break;
                    }
                }
            });
    }

    bindForm = (eventData: any) => {
        this.communicationReasons =
            this.communicationConstants.CommunicationReasons.filter(x => x.category === eventData.CommunicationCategory);
        this.defaultFormValue = {
            CommunicationType: eventData.CommunicationType,
            CommunicationCategory: eventData.CommunicationCategory,
            Reason: String(eventData.Reason),
            Status: String(eventData.Status),
            Notes: eventData.Notes,
            PatientId: eventData.PatientId,
            PatientCommunicationId: eventData.PatientCommunicationId,
            DataTag: eventData.DataTag,
            PersonAccountNoteId: eventData.PersonAccountNoteId,
            CommunicationDate: eventData.CommunicationDate
        };
        this.addCommunicationCenter.setValue(this.defaultFormValue);
    }
    closeDrawer = () => {
        this.patientCommunicationCenterService.setCommunicationEvent(
            {
                eventtype: CommunicationEvent.CommunicationIconsVisibility,
                data: { drawerType: CommunicationHeader.CommunicationDrawer, state: false }
            });

        this.patientCommunicationCenterService.setCommunicationEvent({
            eventtype: CommunicationEvent.DrawerVisibility,
            data: { drawerType: CommunicationHeader.CommunicationDrawer, data: false }
        });
    }

    patchNotesValue = () => {
        var notesValue = this.addCommunicationCenter.value.Notes;

        var match = notesValue.match('^[-+=@\t\n\r]+(.+)');
        if (match != null && match.length > 1) {
            notesValue = notesValue.replace(match[0], match[1]);
        }

        if (this.accountNoteMaxLength !== null && notesValue.length > this.accountNoteMaxLength) {
            notesValue = notesValue.slice(0, this.accountNoteMaxLength);
        }

        if (notesValue != this.addCommunicationCenter.value.Notes) {
            this.addCommunicationCenter.patchValue({ Notes: notesValue });
        }
    }

    openConfirmationModal = (data: any) => {
        this.confirmationRef = this.confirmationModalService.open({
            data
        });
        this.patientCommunicationCenterService.isModalOpen = true;
        this.confirmationModalSubscription = this.confirmationRef.events.pipe(
            filter((event) => !!event),
            filter((event) => {
                return event.type === 'confirm' || event.type === 'close';
            }),
            take(1)
        ).subscribe((events) => {
            switch (events.type) {
                case 'confirm':
                    this.defaultFormValue = null;
                    this.patientCommunicationCenterService.isModalOpen = false;
                    this.confirmationRef.close();
                    if (this.patientCommunicationCenterService.drawerMode === FormMode.EditMode && !this.isFormChanged) {
                        if (events.data.formdata) {
                            this.bindForm(events.data.formdata);
                            this.communicationConstants.confirmationModalData.formdata = null;
                        }
                        this.isFormChanged = false;
                    } else if (this.patientCommunicationCenterService.drawerMode === FormMode.EditMode && this.isFormChanged &&
                        events.data.isAccount) {
                        if (this.addCommunicationCenter.value.Notes.length > this.accountNoteMaxLength
                            && this.accountNoteMaxLength !== null
                            && String(this.addCommunicationCenter.value.CommunicationCategory) === String(CommunicationCategory.Account)) {
                            this.addCommunicationCenter
                                .patchValue({ Notes: this.addCommunicationCenter.value.Notes.slice(0, this.accountNoteMaxLength) });
                        }
                    } else {
                        this.isFormChanged = false;
                        this.patientCommunicationCenterService.drawerMode = FormMode.default;
                        this.patientCommunicationCenterService.isModalOpen = false;
                        this.closeDrawer();
                        this.resetFormValues();
                    }
                    break;
                case 'close':
                    this.confirmationRef.close();
                    if (this.patientCommunicationCenterService.drawerMode === FormMode.EditMode && this.isFormChanged &&
                        (this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData &&
                            this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData.Communication)) {
                        this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData = null;
                    }
                    this.patientCommunicationCenterService.isModalOpen = false;
                    break;
            }
        });
    }
    createFormControls = () => {
        this.addCommunicationCenter = this.fb.group({
            CommunicationType: ['0', [Validators.required, Validators.min(2)]],
            CommunicationCategory: ['0', [Validators.required, Validators.min(1)]],
            Reason: ['0', [Validators.required, Validators.min(1)]],
            Status: ['0'],
            Notes: ['', [Validators.required]],
            PatientId: this.route.patientId,
            PatientCommunicationId: 0,
            DataTag: '',
            PersonAccountNoteId: '',
            CommunicationDate: ''
        });
        this.communicationReasons = null;
    }
    onCategorySelected = (event: any) => {
        this.isFormChanged = true;
        const selectedCategory = Number(event.target.value);
        if (selectedCategory) {
            this.communicationReasons = this.communicationConstants.CommunicationReasons.filter(x => x.category === selectedCategory);
            this.addCommunicationCenter.patchValue({ Reason: this.communicationReasons[0].value });
            this.accountNoteMaxLength = null;
            if (selectedCategory === CommunicationCategory.Account) {
                this.accountNoteMaxLength = 500;
                if ((this.addCommunicationCenter.value.Notes.length > this.accountNoteMaxLength)) {
                    this.openConfirmationModal(this.communicationConstants.editAccountNoteconfirmationModalData);
                } else {
                    this.patchNotesValue();
                }
            }
        } else {
            this.communicationReasons = null;
        }

    }
    addCommunication = () => {
        if (this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData) {
            if (this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData.Communication &&
                this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData.Mode === FormMode.EditMode) {
                this.patientCommunicationCenterService.drawerMode = FormMode.EditMode;
            }
        }
        const drawerMode = this.patientCommunicationCenterService.drawerMode;
        if (drawerMode === FormMode.EditMode) {
            this.updateCommunication();
        } else {
            const patientDetail = this.patientCommunicationCenterService.patientDetail;
            if (patientDetail.Profile) {
                this.personDetail = {
                    AccountId: patientDetail.Profile.PersonAccountId
                };
            }
            this.patchNotesValue();
            this.patientCommunicationCenterService
                .createPatientCommunication(this.route.patientId, this.addCommunicationCenter.value, this.personDetail)
                .subscribe((data: PatientCommunication) => this.addCommunicationSuccess(data),
                    error => this.addCommunicationFailure());


        }
    }
    addCommunicationSuccess = (res: any) => {
        if (res) {
            this.resetFormValues();
            this.patientCommunicationCenterService.cachedCommunicationTab = null;
            this.isFormChanged = false;
            this.patientCommunicationCenterService.drawerMode = FormMode.default;
            this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData = null;
            this.closeDrawer();
        }
        this.toastrFactory.success(
            this.translate.instant('The record of this communication has been saved.'),
            this.translate.instant('Success'));
    }
    addCommunicationFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('There was an error and this communication was not created.'),
            this.translate.instant('Server Error'));
    }
    updateCommunication = () => {
        if (this.hasEditAccess) {
            const updatedModel: any = this.addCommunicationCenter.value;
            const patientDetail = this.patientCommunicationCenterService.patientDetail;
            if (patientDetail.Profile) {
                updatedModel.AccountId = patientDetail.Profile.PersonAccountId;
            }
            this.patientCommunicationCenterService
                .updatePatientCommunication(updatedModel.PatientCommunicationId, updatedModel)
                .subscribe((data: any) => this.updateCommunicationSuccess(data), error => this.updateCommunicationFailure());
        }
    }
    resetFormValues = () => {
        this.addCommunicationCenter.reset(this.createFormControls());
        this.communicationReasons = null;
        this.accountNoteMaxLength = null;
    }

    authAccess = () => {
        this.hasCreateAccess = this.authAccessByType(this.soarAuthNoteAddKey);
        this.hasEditAccess = this.authAccessByType(this.soarAuthPCommEditKey);
    }
    authAccessByType = (authtype: string) => {
        const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
        return result;
    }
    toolTipText = () => {
        if (!this.hasCreateAccess) {
            this.toolTipMessage = this.isCreateToolTipText;
        }
    }
    getCheckedStatus = (value: any) => {
        return this.addCommunicationCenter.get('Status').value === value;
    }
    updateCommunicationSuccess = (res: any) => {
        if (res) {
            this.resetFormValues();
            this.patientCommunicationCenterService.cachedCommunicationTab = null;
            this.isFormChanged = false;
            this.patientCommunicationCenterService.drawerMode = FormMode.default;
            this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData = null;
            this.closeDrawer();
        }
        this.toastrFactory.success(
            this.translate.instant('The record of this communication has been updated.'),
            this.translate.instant('Success'));
    }
    updateCommunicationFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('There was an error and this communication was not updated.'),
            this.translate.instant('Server Error'));
    }
    onTypeSelected = () => {
        this.patientCommunicationCenterService.formValuesChanged = this.isFormChanged = true;
    }
    onNotesChange = () => {
        this.patientCommunicationCenterService.formValuesChanged = this.isFormChanged = true;
    }
    onReasonChange = () => {
        this.patientCommunicationCenterService.formValuesChanged = this.isFormChanged = true;
    }
    onRbChange = () => {
        this.patientCommunicationCenterService.formValuesChanged = this.isFormChanged = true;
    }
    editCommunicationUserDetails = (eventData: any) => {
        const dateModified = this.datepipe.transform(eventData.DateModified, 'MM/dd/yyyy:HH:mm:ss');
        const commDate = this.datepipe.transform(eventData.CommunicationDate, 'MM/dd/yyyy:HH:mm:ss');
        this.isModified = (dateModified > commDate);
        if (this.isModified) {
            this.editedBy = this.patientCommunicationCenterService.getUserdetail(eventData.UserModified, false);
            this.editedBy = eventData.EditedBy;
        }
    }
    updateNotes = (event: any) => {
        if (event.target.value) {
            const value = this.addCommunicationCenter.get('CommunicationCategory').value;
            if (String(value) === String(CommunicationCategory.Account)) {
                this.accountNoteMaxLength = 500;
                if (event.target.value.length > this.accountNoteMaxLength) {
                    this.addCommunicationCenter.value.Notes = event.target.value.slice(0, this.accountNoteMaxLength);
                }
            }
        }
    }
    defaultCommunicationValuesOnNewTab = () => {
        if (this.route.communicationType) {
            this.setdefaultValuesByCommunicationType(Number(this.route.communicationType));
        }
    }
    setdefaultValuesByCommunicationType = (communicationType: CommunicationType) => {
        let selectedCategory = CommunicationCategory.MiscCommunication;
        let selectedReason = CommunicationReason.GeneralNote;
        const tabIdentifier = Number(this.route.tabIdentifier);
        // @ts-ignore
        if (communicationType === 999) {
            this.communicationReasons = this.communicationConstants.CommunicationReasons.filter(x => x.value === CommunicationReason.AccountNote);
        } else if (tabIdentifier === TabIdentifier.PreventiveCare || tabIdentifier === TabIdentifier.TreatmentPlans) {
            selectedCategory = CommunicationCategory.PatientCare;
            this.communicationReasons =
                this.communicationConstants.CommunicationReasons.filter(x => x.category === selectedCategory);
            selectedReason = (tabIdentifier === TabIdentifier.PreventiveCare)
                ? CommunicationReason.PreventiveCare : CommunicationReason.TreatmentPlan;
        } else {
            this.communicationReasons = [{ text: this.translate.instant('General Note'), value: CommunicationReason.GeneralNote }];
        }

        const values = {
            // @ts-ignore
            CommunicationType: (communicationType === -1 || communicationType === 999) ? 0 : communicationType,
            // @ts-ignore
            CommunicationCategory: (communicationType === 999) ? CommunicationCategory.Account : selectedCategory,
            // @ts-ignore
            Reason: (communicationType === 999) ? CommunicationReason.AccountNote : selectedReason,
            Status: '0',
            Notes: '',
            PatientId: this.route.patientId,
            PatientCommunicationId: 0,
            DataTag: '',
            PersonAccountNoteId: '',
            CommunicationDate: '',
        };
        this.addCommunicationCenter.setValue(values);
        this.isFormChanged = true;
    }
    FormStatus = (formType: any) => {
        return this.formValuesChanged;
    }
    handleDrawerStatusValidityEvent = (custoEvent: CommunicationCustomEvent) => {
        if (this.formValuesChanged) {
            this.openConfirmationModal(this.communicationConstants.confirmationModalData);
        } else {
            this.resetFormValues();
            this.patientCommunicationCenterService.drawerMode = FormMode.default;
            this.patientCommunicationCenterService.setCommunicationEvent(
                { eventtype: CommunicationEvent.DrawerVisibility, data: { drawerType: CommunicationHeader.CommunicationDrawer, data: false } });
        }
    }

    handleEditCommunicationEvent = (customEvent: CommunicationCustomEvent) => {
        if ((customEvent.data && customEvent.data.Communication)
            && (customEvent.data && customEvent.data.Communication.CommunicationMode === CommunicationMode.GeneralCommunication)) {
            this.patientCommunicationCenterService.drawerMode = FormMode.EditMode;
            if (this.isFormChanged) {
                this.communicationConstants.confirmationModalData.formdata = customEvent.data.Communication;
                this.openConfirmationModal(this.communicationConstants.confirmationModalData);
            } else {
                this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData = customEvent.data;
                setTimeout(() => {
                    this.bindForm(customEvent.data.Communication);
                    const value = this.addCommunicationCenter.get('CommunicationCategory').value;
                    if (String(value) === String(CommunicationCategory.Account)) {
                        this.accountNoteMaxLength = 500;
                        this.patchNotesValue();
                    }
                }, 200);

                const patientDetail = this.patientCommunicationCenterService.patientDetail;
                if (patientDetail) {
                    this.isResponsiblePerson = !!patientDetail.Profile.ResponsiblePersonId;
                }
                this.patientCommunicationCenterService.formValuesChanged = true;
                this.editCommunicationUserDetails(customEvent.data.Communication);
                this.patientCommunicationCenterService
                    .setCachedTabWithData(CommunicationTab.Communication, this.addCommunicationCenter, FormMode.EditMode);
                this.patientCommunicationCenterService.formValuesChanged = false;
            }

        }
    }
    onResize = (event) => {
        if (event.target.innerHeight > 700 && event.target.innerHeight < 900) {
            this.height = this.smallScreenHeight;
        } else if (event.target.innerHeight > 900) {
            this.height = this.bigScreenHeight;
        }

    }
    ngOnDestroy() {
        this.defaultFormValue = null;
        this.route.withDrawerOpened = this.route.communicationType = null;
        this.communicationConstants.editAccountNoteconfirmationModalData.oldFormData = null;
        this.patientCommunicationCenterService
            .setCachedTabWithData(CommunicationTab.Communication, this.addCommunicationCenter,
                this.patientCommunicationCenterService.drawerMode);
        this.patientCommunicationCenterService.resetPatientCommunicationService();
        this.isFormChanged = false;
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}
