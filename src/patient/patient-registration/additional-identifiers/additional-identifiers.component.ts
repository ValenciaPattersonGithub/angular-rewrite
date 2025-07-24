import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { BroadcastService } from 'src/@shared/providers/broad-cast.service';
import { PatientAdditionalIdentifiers } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier';
import { PatientAdditionalIdentifierService } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';

@Component({
    selector: 'additional-identifiers',
    templateUrl: './additional-identifiers.component.html',
    styleUrls: ['./additional-identifiers.component.scss']
})
export class AdditionalIdentifiersComponent implements OnInit {

    @Input() patientIdentifiers: any[] = [];
    @Input() additionalIdentifiers: FormGroup;
    subscriptions: Array<Subscription> = new Array<Subscription>();

    constructor(
        private patientAdditionalIdentifierService: PatientAdditionalIdentifierService,
        private fb: FormBuilder,
        private broadCastService: BroadcastService

    ) { }

    ngOnInit(): void {
        if ((this.patientIdentifiers && this.patientIdentifiers.length)) {
            this.patientIdentifiers = this.patientIdentifiers.map(identifier => ({
                MasterPatientIdentifierId: identifier.MasterPatientIdentifierId,
                Value: identifier.Value,
                Description: identifier.Description,
                IsSpecifiedList: identifier.IsSpecifiedList,
                ListValues: identifier.SpecifiedListValues.map(v => ({ Value: v })),
                DataTag: identifier.DataTag,
                ObjectState: identifier.ObjectState,
                PatientId: identifier.PatientId,
                PatientIdentifierId: identifier.PatientIdentifierId
            }));
            this.patientIdentifiers.map(identifier => this.generatePatientIdentifiersGroup(identifier));
        }
        else {
            this.getPatientAdditionalIdentifiers();
        }
        this.broadCastService.messagesOfType('additionalIdentifiers').subscribe(message => {
            this.updatePatientIdentifer(message);
        });
    }

    getPatientAdditionalIdentifiers = () => {
        this.subscriptions.push(this.patientAdditionalIdentifierService.getPatientAdditionalIdentifiers()?.subscribe({
            next: (additionalIdentifiersList: SoarResponse<Array<PatientAdditionalIdentifiers>>) => this.patientAdditionalIdGetSuccess(additionalIdentifiersList),
            error: () => this.patientAdditionalIdGetFailure()
        }));
    }
    patientAdditionalIdGetSuccess = (identifiers: SoarResponse<Array<PatientAdditionalIdentifiers>>) => {
        if (identifiers?.Value) {
            this.patientIdentifiers = [];
            this.patientIdentifiers = identifiers.Value;
            this.patientIdentifiers.map(identifier => this.generateIdentifiersGroup(identifier));
        }
    }
    patientAdditionalIdGetFailure = () => {

    }
    updatePatientIdentifer = (message) => {
        if (message) {
            const payload = message.payload;
            if (payload.mode === 'add') {
                this.patientIdentifiers.push(payload.data);
            } else if (payload.mode === 'update') {
                const identifier = this.patientIdentifiers.
                    filter(x => x.MasterPatientIdentifierId === payload.data.MasterPatientIdentifierId);
                if (identifier && identifier.length) {
                    identifier[0].Description = payload.data.Description;
                    identifier[0].IsSpecifiedList = payload.data.IsSpecifiedList;
                    identifier[0].ListValues = payload.data.ListValues;
                }
            } else if (payload.mode === 'delete') {
                const index = this.patientIdentifiers.
                    findIndex(x => x.MasterPatientIdentifierId === payload.data.MasterPatientIdentifierId);
                this.patientIdentifiers.splice(index, 1);
            }
            this.patientIdentifiers.map(identifier => this.generatePatientIdentifiersGroup(identifier));
        }
    }
    private generateIdentifiersGroup(identifier) {
        const identifiedArray = this.additionalIdentifiers.controls.PatientIdentifiers as FormArray;
        identifiedArray.push(this.fb.group({
            MasterPatientIdentifierId: [identifier.MasterPatientIdentifierId],
            Value: [''],
            Description: [identifier.Description],
            IsSpecifiedList: [identifier.IsSpecifiedList],
            SpecifiedListValuesDropdown: [identifier.ListValues],
            PatientIdentifierId: [null],
            ObjectState: [null]
        }));
    }
    private generatePatientIdentifiersGroup(identifier) {
        const identifiedArray = this.additionalIdentifiers.controls.PatientIdentifiers as FormArray;
        identifiedArray.push(this.fb.group({
            MasterPatientIdentifierId: [identifier.MasterPatientIdentifierId],
            Value: [identifier.Value],
            Description: [identifier.Description],
            IsSpecifiedList: [identifier.IsSpecifiedList],
            DataTag: [identifier.DataTag],
            ObjectState: [identifier.ObjectState],
            PatientId: [identifier.PatientId],
            PatientIdentifierId: [identifier.PatientIdentifierId]

        }));
    }
    UpdateObjectState = (index: any, event: any) => {
        const patientIdentifiers = this.additionalIdentifiers.controls.PatientIdentifiers as FormArray;
        const identifier = patientIdentifiers.controls[index];
        let objectState = 'Add';
        if (identifier.value.PatientIdentifierId && identifier.value.PatientIdentifierId !== '00000000-0000-0000-0000-000000000000') {
            if (event.target.value) {
                objectState = 'Update';
            } else {
                objectState = 'Delete';
            }
        }
        identifier.patchValue({
            ObjectState: objectState
        });
    }

    ngOnDestroy() {
        this.subscriptions?.forEach((subscription) => subscription?.unsubscribe())
    }
}
