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

describe('CommunicationGenerateLetterComponent', () => {
    let component: CommunicationGenerateLetterComponent;
    let fixture: ComponentFixture<CommunicationGenerateLetterComponent>;
    let patientCommunicationService: any;
    let refDataService: any;
    const fb: FormBuilder = new FormBuilder();
    let patSecurityService: any;
    let dialogservice: DialogService;
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

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            // TranslateModule import required for components that use ngx-translate in the view or componenet code
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
            declarations: [CommunicationGenerateLetterComponent, AppRadioButtonComponent, AppButtonComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationGenerateLetterComponent);
        patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
        patSecurityService = TestBed.get('patSecurityService');
        refDataService = TestBed.get('referenceDataService');
        dialogservice = TestBed.get(DialogService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('createFormControls', () => {
        it('should create FormControls', () => {
            component.createFormControls();
            const communicationType = component.generateLetterCommunication.controls.CommunicationType;
            expect(communicationType).toBeDefined();
            const notes = component.generateLetterCommunication.controls.Notes;
            expect(notes).toBeDefined();
            const reason = component.generateLetterCommunication.controls.Reason;
            expect(reason).toBeDefined();
            const category = component.generateLetterCommunication.controls.CommunicationCategory;
            expect(category).toBeDefined();
            const status = component.generateLetterCommunication.controls.Status;
            expect(status).toBeDefined();
        });
    });
    describe('addGenerateLetterCommunication', () => {
        it('should call patientCommunicationCenterService.createPatientCommunication when addCommunication called', () => {
            component.generateLetterCommunication = fb.group({
                CommunicationType: 5,
                CommunicationCategory: '0',
                Reason: '0',
                CommunicationTemplateId: '0',
                Status: '1',
                Notes: 'Test',
                LetterTemplate: '',
                LetterTemplateName: '',
                PatientId: '4321',
                CommunicationMode: CommunicationMode.LetterCommunication
            });
            component.formMode = FormMode.AddMode;
            component.templateOutput = 'Test';
            component.selectedTemplate = {
                TemplateName: 'Test Name'
            };
            spyOn(component, 'addGenerateLetterCommunicationSuccess').and.callThrough();
            spyOn(patientCommunicationService, 'createPatientCommunication').and.callThrough();
            component.personDetail = {
                AccountId: '98BFA2C2-8DB8-46AC-AA01-2E2144613054'
            };
            component.addGenerateLetterCommunication(null, null);
            component.generateLetterCommunication.value.Notes = 'Test';

            expect(component.addGenerateLetterCommunicationSuccess).toHaveBeenCalled();
            expect(patientCommunicationService.createPatientCommunication);
        });
        it('should call addGenerateLetterCommunicationFailure when patientCommunicationCenterService.createPatientCommunication throw Error', () => {
            spyOn(patientCommunicationService, 'createPatientCommunication').and.returnValue(throwError('Error'));
            spyOn(component, 'addGenerateLetterCommunicationFailure').and.callThrough();
            component.personDetail = {
                AccountId: '98BFA2C2-8DB8-46AC-AA01-2E2144613054'
            };

            component.formMode = FormMode.AddMode;
            // component.templateOutput = 'This is Test Template 2';
            // component.selectedTemplate = {
            //   TemplateName: 'Template 2'
            // };
            component.generateLetterCommunication.value.Notes = 'Test';
            component.addGenerateLetterCommunication(null, null);
            component.generateLetterCommunication.value.Notes = 'Test';
            expect(patientCommunicationService.createPatientCommunication)
                .toHaveBeenCalledWith(mockRouteParams.patientId, component.generateLetterCommunication.value, component.personDetail);
            expect(component.addGenerateLetterCommunicationFailure).toHaveBeenCalled();
            expect(patientCommunicationService.createPatientCommunication);
        });
    });
    describe('resetFormValues', () => {
        it('should reset the form values to default values', () => {
            component.resetFormValues();
            expect(component.generateLetterCommunication.value).toBeDefined();
            expect(component.generateLetterCommunication.value.CommunicationCategory).toEqual('0');
            expect(component.generateLetterCommunication.value.Reason).toEqual('0');
            expect(component.generateLetterCommunication.value.Status).toEqual('1');
            expect(component.generateLetterCommunication.value.Notes).toEqual('');
            expect(component.accountNoteMaxLength).toEqual(null);
        });
    });
    describe('openConfirmationModal', () => {
        beforeEach(() => {
            component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
        });
        it('should call modal to ask user to confirm Discard Changes', () => {
            component.openConfirmationModal(cancelConfirmationData);
            expect(mockConfirmationModalService.open).toHaveBeenCalled();
        });
    });
    describe('authAccess', () => {
        it('should call authAccess and set value true to hasEditAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').
                and.returnValue(true);
            component.authAccess();
            expect(component.hasEditAccess).toEqual(true);
        });
        it('should call authAccess and set value false to hasEditAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').
                and.returnValue(false);
            component.authAccess();
            expect(component.hasEditAccess).toEqual(false);
        });
    });
    describe('updateCommunication', () => {
        it('should call patientCommunicationCenterService.updatePatientCommunication when updateCommunication called', () => {
            spyOn(component, 'resetFormValues').and.callThrough();
            spyOn(patientCommunicationService, 'updatePatientCommunication').and.returnValue(Promise.resolve({ Value: mockEditCommunication }));
            component.updateCommunication();
            patientCommunicationService.updatePatientCommunication(mockEditCommunication.PatientCommunicationId, mockEditCommunication)
                .then((result: any) => {
                    component.updateLetterCommunicationSuccess(result);
                    expect(component.isFormChanged).toEqual(false);
                    expect(component.resetFormValues).toHaveBeenCalled();
                }, () => {
                });
            expect(patientCommunicationService.updatePatientCommunication);
        });
        it('should call updateCommunicationFailure when patientCommunicationCenterService.updatePatientCommunication throw Error', () => {
            component.hasEditAccess = true;
            component.generateLetterCommunication = fb.group({
                CommunicationType: mockEditCommunication.CommunicationType,
                CommunicationCategory: mockEditCommunication.CommunicationCategory,
                Reason: mockEditCommunication.Reason,
                Status: mockEditCommunication.Status,
                Notes: mockEditCommunication.Notes,
                PatientId: mockEditCommunication.PatientId,
                PatientCommunicationId: mockEditCommunication.PatientCommunicationId,
                DataTag: mockEditCommunication.DataTag,
                PersonAccountNoteId: mockEditCommunication.PersonAccountNoteId,
                CommunicationDate: mockEditCommunication.CommunicationDate
            });
            spyOn(patientCommunicationService, 'updatePatientCommunication').and.returnValue(throwError('Error'));
            spyOn(component, 'updateLetterCommunicationFailure').and.callThrough();
            component.updateCommunication();
            expect(patientCommunicationService.updatePatientCommunication)
                .toHaveBeenCalledWith(mockEditCommunication.PatientCommunicationId, mockEditCommunication);
            expect(component.updateLetterCommunicationFailure).toHaveBeenCalled();
            expect(patientCommunicationService.updatePatientCommunication);
        });
        it('should call patientCommunicationCenterService.updatePatientCommunication when updateCommunication is a success', () => {
            component.hasEditAccess = true;
            component.generateLetterCommunication = fb.group({
                CommunicationType: mockEditCommunication.CommunicationType,
                CommunicationCategory: mockEditCommunication.CommunicationCategory,
                Reason: mockEditCommunication.Reason,
                Status: mockEditCommunication.Status,
                Notes: mockEditCommunication.Notes,
                PatientId: mockEditCommunication.PatientId,
                PatientCommunicationId: mockEditCommunication.PatientCommunicationId,
                DataTag: mockEditCommunication.DataTag,
                PersonAccountNoteId: mockEditCommunication.PersonAccountNoteId,
                CommunicationDate: mockEditCommunication.CommunicationDate
            });
            spyOn(patientCommunicationService, 'updatePatientCommunication').and.callThrough();
            spyOn(component, 'updateLetterCommunicationSuccess').and.callThrough();
            component.updateCommunication();
            expect(patientCommunicationService.updatePatientCommunication)
                .toHaveBeenCalledWith(mockEditCommunication.PatientCommunicationId, mockEditCommunication);
            expect(component.updateLetterCommunicationSuccess).toHaveBeenCalled();
            expect(patientCommunicationService.updatePatientCommunication);
        });
    });
});
