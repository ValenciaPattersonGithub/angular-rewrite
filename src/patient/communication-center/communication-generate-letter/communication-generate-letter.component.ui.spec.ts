import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { CommunicationGenerateLetterComponent } from './communication-generate-letter.component';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { CommunicationReason, CommunicationCategory, CommunicationType, CommunicationMode, FormMode } from 'src/patient/common/models/enums';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { AppRadioButtonComponent } from 'src/@shared/components/form-controls/radio-button/radio-button.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { DialogService, DialogContainerService, DialogRef } from '@progress/kendo-angular-dialog';
import { DatePipe } from '@angular/common';
import { configureTestSuite } from 'src/configure-test-suite';
import { ReferralManagementHttpService } from '../../../@core/http-services/referral-management-http.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { fireEvent, render,screen } from '@testing-library/angular';

describe('CommunicationGenerateLetterComponent', () => {
    let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };
    const mockPatientCommunicationCenterService: any = {
        createPatientCommunication: (a: any, b: any) => of({}),
        getPatientCommunicationByPatientId: (a: any) => of({}),
        createAccountNoteCommunication: (a: any, b: any) => of({}),
        updatePatientCommunication: (a: any, b: any) => of({}),
        setCommunicationEvent: (a: any) => of({}),
        getCommunicationEvent: () => of({}),
        patientDetail: of({}),
        GetPatientCommunicationTemplates: () => of({}),
        setCachedTabWithData: () => { },
        resetPatientCommunicationService: () => { }
    };
    const mockRouteParams = {
        patientId: '4321',
        accountId: '1234',
    };
    const mockConfirmationModalService = {
        open: jasmine.createSpy().and.returnValue({
            events: {
                pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
            },
            subscribe: jasmine.createSpy(),
            closed: jasmine.createSpy(),
        }),

    };
    const mockConfirmationModalSubscription = {
        subscribe: jasmine.createSpy(),
        closed: jasmine.createSpy(),
    };
    const cancelConfirmationData = {
    };
    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { }
    };
    const mockreferenceDataService = {
        get: (a: any) => { },
        entityNames: {
            users: [{ UserId: '12', FirstName: 'FN', LastName: 'LN' }]
        }
    };
    const mockCommunicationConstants = {
        CommunicationReasons: [
            { text: 'Account Letter', value: CommunicationReason.AccountLetter, category: CommunicationCategory.Account },
            { text: 'Account Note', value: CommunicationReason.AccountNote, category: CommunicationCategory.Account },
            { text: 'Insurance Letter', value: CommunicationReason.InsuranceLetter, category: CommunicationCategory.Insurance },
            { text: 'Other Insurance', value: CommunicationReason.OtherInsurance, category: CommunicationCategory.Insurance },
            { text: 'General Letter', value: CommunicationReason.GeneralLetter, category: CommunicationCategory.MiscCommunication },
            { text: 'General Note', value: CommunicationReason.GeneralNote, category: CommunicationCategory.MiscCommunication },
            { text: 'Other Patient Care', value: CommunicationReason.OtherPatientCare, category: CommunicationCategory.PatientCare },
            { text: 'Appointments', value: CommunicationReason.Appointments, category: CommunicationCategory.PatientCare },
            { text: 'Preventive Care', value: CommunicationReason.PreventiveCare, category: CommunicationCategory.PatientCare },
            { text: 'Treatment Plan', value: CommunicationReason.TreatmentPlan, category: CommunicationCategory.PatientCare },
            { text: 'Referral', value: CommunicationReason.Referral, category: CommunicationCategory.PatientCare }
        ],
        CommunicationCategories:
            [
             { text: 'Account', cateory: CommunicationCategory.Account },
             { text: 'Insurance', cateory: CommunicationCategory.Insurance },
             { text: 'MiscCommunication', cateory: CommunicationCategory.MiscCommunication },
             { text: 'PatientCare', cateory: CommunicationCategory.PatientCare },
            ],
        CommunicationTypes: [
            { text: 'Email', value: CommunicationType.Email },
            { text: 'In Person', value: CommunicationType.InPerson },
            { text: 'Other', value: CommunicationType.Other },
            { text: 'Phone', value: CommunicationType.Phone },
            { text: 'Text', value: CommunicationType.Text },
            { text: 'US Mail', value: CommunicationType.USMail }
        ],
        editAccountNoteconfirmationModalData: {
            header: 'Warning ',
            message: 'The Communication you have selected is larger than 500 characters. Account Notes cannot exceed 500 characters. If you continue, your Communication will be truncated to 500 characters. Do you wish to continue?',
            confirm: 'Yes',
            cancel: 'No',
            height: 180,
            width: 750,
            oldFormData: null,
            isAccount: true
        }
    };
    const mockDialogRef = {
        close: () => of({}),
        open: (dialogResult: any) => { },
        content: {
            instance: {
                title: ''
            }
        }
    }
    const mockDatePipe: any = {
        transform: (a: any) => { }
    };
    const mockEditCommunication = {
        PatientCommunicationId: '123',
        CommunicationType: 1,
        CommunicationCategory: 2,
        Reason: '3',
        Status: '0',
        Notes: 'Update',
        PatientId: '4321',
        DataTag: '0x000000000002DDF4',
        PersonAccountNoteId: '111',
        CommunicationDate: new Date()
    };
    mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
    mockFeatureFlagService.getOnce$.and.returnValue(of(true));

    var personResult = { Value: '' };
    const mockReferralManagementHttpService = {
        getSources: jasmine.createSpy().and.returnValue({
            then: function (callback) {
                callback(personResult);
            }
        }),
        getPracticeProviders: () => of({
        }),
    }

    beforeEach(async () => {

        await TestBed.configureTestingModule({
            declarations: [CommunicationGenerateLetterComponent, AppRadioButtonComponent, AppButtonComponent],
            imports: [FormsModule, ReactiveFormsModule, TranslateModule.forRoot(), AppKendoUIModule, BrowserAnimationsModule],
            providers: [DialogService, DialogContainerService,
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: CommunicationConstants, useValue: mockCommunicationConstants },
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: DatePipe, useValue: mockDatePipe },
                { provide: ReferralManagementHttpService, useValue: mockReferralManagementHttpService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
            ],
        }).compileComponents();
    });
    it('should render the Communication Center Generate Letter Component', async () => {
        await render(CommunicationGenerateLetterComponent, {
            // Add necessary providers, declarations, imports, etc.
        });
    });

    it('should populate communicationCategory dropdown', async () => {

        const category = screen.getByTestId('communicationCategory');
        expect(category).toBeDefined();

    });
});
