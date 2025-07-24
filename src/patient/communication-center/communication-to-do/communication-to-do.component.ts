import { Component, OnInit, Inject, OnDestroy, SecurityContext } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
    CommunicationType, CommunicationCategory,
    CommunicationReason, CommunicationEvent, CommunicationTab, FormMode
} from '../../common/models/enums';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { PatientCommunication } from 'src/patient/common/models/patient-communication.model';
import { DatePipe } from '@angular/common';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { CommunicationCustomEvent } from 'src/patient/common/models/communication-custom-event.model';
import { Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'communication-to-do',
    templateUrl: './communication-to-do.component.html',
    styleUrls: ['./communication-to-do.component.scss']
})
export class CommunicationToDoComponent implements OnInit, OnDestroy {
    toDoTypeLists: Array<{ text: string, value: number }> = [];
    selectedToDoTypeItem: any;
    minDate: Date;
    toDoCommunicationCenter: FormGroup;
    personDetail: any;
    dueDateError: boolean;
    defaultFormValue: any;
    isModified: any;
    editedBy: any;
    hideBtn: any;
    isEdit: any;
    soarAuthPCommEditKey = 'soar-per-pcomm-edit';
    hasEditAccess: any;
    formValuesChanged: boolean;
    private unsubscribe$: Subject<any> = new Subject<any>();

    constructor(
        private translate: TranslateService,
        private fb: FormBuilder,
        @Inject('toastrFactory') private toastrFactory,
        private patientCommunicationCenterService: PatientCommunicationCenterService,
        @Inject('$routeParams') private route,
        private datepipe: DatePipe,
        @Inject('patSecurityService') private patSecurityService,
        private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.formValuesChanged = false;
        this.minDate = new Date();
        this.createFormControls();
        this.subscribeInitializations();
        this.authAccess();
        this.defaultFormValue = this.toDoCommunicationCenter.value;
        this.handleCachedTab();
    }
    handleCachedTab = () => {
        const cachedTab = this.patientCommunicationCenterService.cachedCommunicationTab;
        if (cachedTab && cachedTab.activeTab === CommunicationTab.ToDo) {
            this.isEdit = cachedTab.cachedFormMode;
            if (!(JSON.stringify(cachedTab.cachedFormData.value) === JSON.stringify(this.defaultFormValue))) {
                this.toDoCommunicationCenter = this.patientCommunicationCenterService.cachedCommunicationTab.cachedFormData;
                this.patientCommunicationCenterService.formValuesChanged = true;
            }
        } else {
            this.patientCommunicationCenterService.cachedCommunicationTab = null;
        }
    }
    subscribeInitializations = () => {
        this.toDoCommunicationCenter.valueChanges.pipe(debounceTime(300)).subscribe(
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
                        case CommunicationEvent.EditInCompleteCommunication:
                            this.hideBtn = true;
                            this.handleEditInCompleteCommunicationEvent(event);
                            break;
                    }
                }
            });
    }
    createFormControls = () => {
        this.toDoCommunicationCenter = this.fb.group({
            CommunicationType: CommunicationType.Text,
            Notes: ['', [Validators.required]],
            DueDate: [this.minDate, [Validators.required]],
            IsComplete: false,
            CommunicationCategory: CommunicationCategory.ToDo,
            Reason: CommunicationReason.GeneralNote,
            PatientId: this.route.patientId,
            PatientCommunicationId: 0,
            DataTag: '',
            PersonAccountNoteId: '',
            CommunicationDate: ''
        });
    }
    addToDoCommunication = () => {
        const patientDetail = this.patientCommunicationCenterService.patientDetail;
        if (patientDetail.Profile) {
            this.personDetail = {
                AccountId: patientDetail.Profile.PersonAccountId
            };
        }
        this.toDoCommunicationCenter.patchValue({ Notes: this.toDoCommunicationCenter.value.Notes });
        this.patientCommunicationCenterService
            .createToDoCommunication(this.route.patientId, this.toDoCommunicationCenter.value, this.personDetail)
            .subscribe((data: PatientCommunication) => this.addToDoCommunicationSuccess(data),
                error => this.addToDoCommunicationFailure());
    }
    addToDoCommunicationSuccess = (res: any) => {
        if (res) {
            this.resetFormValues();
            setTimeout(() => {
                this.patientCommunicationCenterService.formValuesChanged = false;
                this.patientCommunicationCenterService.cachedCommunicationTab = null;
            }, 500);
        }
        this.toastrFactory.success(
            this.translate.instant('The record of this communication has been saved.'),
            this.translate.instant('Success'));
    }
    addToDoCommunicationFailure = () => {
        this.toastrFactory.error(
            this.translate.instant('There was an error and this communication was not created.'),
            this.translate.instant('Server Error'));
    }
    resetFormValues = () => {
        this.toDoCommunicationCenter.reset(this.createFormControls());
        this.minDate = new Date();
    }
    handleEditInCompleteCommunicationEvent = (customEvent: CommunicationCustomEvent) => {
        if (customEvent.data) {
            this.defaultFormValue = {
                CommunicationType: customEvent.data.Communication.CommunicationType,
                Notes: customEvent.data.Communication.Notes,
                DueDate: new Date(customEvent.data.Communication.DueDate ? customEvent.data.Communication.DueDate : new Date()),
                IsComplete: customEvent.data.Communication.IsComplete,
                CommunicationCategory: customEvent.data.Communication.CommunicationCategory,
                Reason: String(customEvent.data.Communication.Reason),
                PatientId: customEvent.data.Communication.PatientId,
                PatientCommunicationId: customEvent.data.Communication.PatientCommunicationId,
                DataTag: customEvent.data.Communication.DataTag,
                PersonAccountNoteId: customEvent.data.Communication.PersonAccountNoteId,
                CommunicationDate: customEvent.data.Communication.CommunicationDate,
            };
            this.toDoCommunicationCenter.setValue(this.defaultFormValue);
            this.patientCommunicationCenterService.formValuesChanged = true;
            this.patientCommunicationCenterService
                .setCachedTabWithData(CommunicationTab.ToDo, this.toDoCommunicationCenter, customEvent.data.IsEdit);
            this.patientCommunicationCenterService.formValuesChanged = false;
            this.isEdit = customEvent.data.IsEdit;
        }
    }
    updateInCompleteToDoCommunication = () => {
        if (this.hasEditAccess && this.isEdit) {
            const updatedModel: any = this.toDoCommunicationCenter.value;
            const patientDetail = this.patientCommunicationCenterService.patientDetail;
            if (patientDetail.Profile) {
                updatedModel.AccountId = patientDetail.Profile.PersonAccountId;
            }
            this.patientCommunicationCenterService
                .updateToDoPatientCommunication(updatedModel.PatientCommunicationId, updatedModel)
                .subscribe((data: any) => this.updateCommunicationSuccess(data), error => this.updateCommunicationFailure());

        }
    }
    updateCommunicationSuccess = (res: any) => {
        if (res) {
            this.resetFormValues();
            this.patientCommunicationCenterService.resetPatientCommunicationService();
            this.hideBtn = false;
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
    editInCompleteCommunicationUserDetails = (communication: any) => {
        const dateModified = this.datepipe.transform(communication.DateModified, 'MM/dd/yyyy:HH:mm:ss');
        const commDate = this.datepipe.transform(communication.CommunicationDate, 'MM/dd/yyyy:HH:mm:ss');
        this.isModified = (dateModified > commDate);
        if (this.isModified) {
            this.editedBy = this.patientCommunicationCenterService.getUserdetail(communication.UserModified, false);
            this.editedBy = communication.EditedBy;
        }
    }
    authAccess = () => {
        this.hasEditAccess = this.authAccessByType(this.soarAuthPCommEditKey);
    }
    authAccessByType = (authtype: string) => {
        const result = this.patSecurityService.IsAuthorizedByAbbreviation(authtype);
        return result;
    }
    cancelInCompleteCommunication = () => {
        this.resetFormValues();
        this.hideBtn = false;
        this.patientCommunicationCenterService.setCommunicationEvent({ eventtype: CommunicationEvent.GetToDoCommunications, data: null });
    }
    ngOnDestroy() {
        this.defaultFormValue = null;
        this.patientCommunicationCenterService.setCachedTabWithData(CommunicationTab.ToDo, this.toDoCommunicationCenter, this.isEdit);
        this.patientCommunicationCenterService.resetPatientCommunicationService();

    }
}
