import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { CommunicationCenterAddrecordComponent } from './communication-center-addrecord.component';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { CommunicationReason, CommunicationCategory } from 'src/patient/common/models/enums';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { AppRadioButtonComponent } from 'src/@shared/components/form-controls/radio-button/radio-button.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { configureTestSuite } from 'src/configure-test-suite';

describe('CommunicationCenterAddrecordComponent', () => {
    let component: CommunicationCenterAddrecordComponent;
    let fixture: ComponentFixture<CommunicationCenterAddrecordComponent>;
    let patientCommunicationService: any;
    let communicationReasons: Array<{ text: string, value: number }> = [];
    let refDataService: any;
    const fb: FormBuilder = new FormBuilder();
    let patSecurityService: any;
    const updatePatientCommSubjectMock = new BehaviorSubject<{}>(undefined);

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
        setCachedTabWithData: () => { },
        resetPatientCommunicationService: () => { },
        patientDetail: of({}),
        updatePatientCommunications$: updatePatientCommSubjectMock
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
    const mockDatePipe: any = {
        transform: (a: any) => { }
    };
    const mockreferenceDataService = {
        get: (a: any) => { },
        entityNames: {
            users: [{ UserId: '12', FirstName: 'FN', LastName: 'LN' }]
        }
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
    const mockCommunicationConstants = {
        CommunicationReasons: [
            { text: 'Account Note', value: CommunicationReason.AccountNote, category: CommunicationCategory.Account },
            { text: 'Other Insurance', value: CommunicationReason.OtherInsurance, category: CommunicationCategory.Insurance },
            { text: 'General Note', value: CommunicationReason.GeneralNote, category: CommunicationCategory.MiscCommunication },
            { text: 'Appointments', value: CommunicationReason.Appointments, category: CommunicationCategory.PatientCare },
            { text: 'Preventive Care', value: CommunicationReason.PreventiveCare, category: CommunicationCategory.PatientCare },
            { text: 'Treatment Plan', value: CommunicationReason.TreatmentPlan, category: CommunicationCategory.PatientCare }
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

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            // TranslateModule import required for components that use ngx-translate in the view or componenet code
            imports: [FormsModule, ReactiveFormsModule, TranslateModule.forRoot(), AppKendoUIModule, BrowserAnimationsModule],
            providers: [
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: DatePipe, useValue: mockDatePipe },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: CommunicationConstants, useValue: mockCommunicationConstants }
            ],
            declarations: [CommunicationCenterAddrecordComponent, AppRadioButtonComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationCenterAddrecordComponent);
        component = fixture.componentInstance;
        patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
        patSecurityService = TestBed.get('patSecurityService');
        refDataService = TestBed.get('referenceDataService');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('createFormControls', () => {
        it('should create FormControls', () => {
            component.createFormControls();
            const communicationType = component.addCommunicationCenter.controls.CommunicationType;
            expect(communicationType).toBeDefined();
            const notes = component.addCommunicationCenter.controls.Notes;
            expect(notes).toBeDefined();
            const reason = component.addCommunicationCenter.controls.Reason;
            expect(reason).toBeDefined();
        });
    });
    describe('addCommunication', () => {
        it('should call patientCommunicationCenterService.createPatientCommunication when addCommunication called', () => {
            component.hasCreateAccess = true;
            component.addCommunicationCenter = fb.group({
                CommunicationType: '0',
                CommunicationCategory: '0',
                Reason: '0',
                Status: '0',
                Notes: 'Test',
                PatientId: mockEditCommunication.PatientId,
                PatientCommunicationId: 0,
                DataTag: '',
                PersonAccountNoteId: '',
                CommunicationDate: ''
            });
            spyOn(patientCommunicationService, 'createPatientCommunication').and.callThrough();
            component.personDetail = {
                AccountId: '98BFA2C2-8DB8-46AC-AA01-2E2144613054'
            };
            component.addCommunication();
            component.addCommunicationCenter.value.Notes = 'Test';
            expect(patientCommunicationService.createPatientCommunication)
                .toHaveBeenCalledWith(mockRouteParams.patientId, component.addCommunicationCenter.value, component.personDetail);
            expect(patientCommunicationService.createPatientCommunication);
        });

        it('should call addCommunicationFailure when patientCommunicationCenterService.createPatientCommunication throw Error', () => {
            component.hasCreateAccess = true;
            spyOn(patientCommunicationService, 'createPatientCommunication').and.returnValue(throwError('Error'));
            spyOn(component, 'addCommunicationFailure').and.callThrough();
            component.personDetail = {
                patientDetail: {
                    AccountId: '98BFA2C2-8DB8-46AC-AA01-2E2144613054'
                }
            };
            component.addCommunicationCenter.value.Notes = 'Test';
            component.addCommunication();
            component.addCommunicationCenter.value.Notes = 'Test';
            expect(patientCommunicationService.createPatientCommunication)
                .toHaveBeenCalledWith(mockRouteParams.patientId, component.addCommunicationCenter.value, component.personDetail);
            expect(component.addCommunicationFailure).toHaveBeenCalled();
            expect(patientCommunicationService.createPatientCommunication);
        });
    });
    describe('onCategorySelected', () => {
        it('should populate communicationReasons when communicationCategory Account is selected', () => {
            const mockEvent: any = {
                target: { value: '1' }
            };
            component.onCategorySelected(mockEvent);
            communicationReasons = component.communicationReasons;
            expect(communicationReasons).toBeDefined();
            expect(component.addCommunicationCenter.value.Reason).toEqual(10);
            expect(communicationReasons[0].value).toEqual(10);
        });
        it('should populate communicationReasons when communicationCategory Insurance is selected', () => {
            const mockEvent: any = {
                target: { value: '2' }
            };
            component.onCategorySelected(mockEvent);
            communicationReasons = component.communicationReasons;
            expect(communicationReasons).toBeDefined();
            expect(component.addCommunicationCenter.value.Reason).toEqual(11);
            expect(communicationReasons[0].value).toEqual(11);
        });
        it('should populate communicationReasons when communicationCategory Misc Communication is selected', () => {
            const mockEvent: any = {
                target: { value: '3' }
            };
            component.onCategorySelected(mockEvent);
            communicationReasons = component.communicationReasons;
            expect(communicationReasons).toBeDefined();
            expect(component.addCommunicationCenter.value.Reason).toEqual(2);
            expect(communicationReasons[0].value).toEqual(2);
        });
        it('should populate communicationReasons when communicationCategory Patient Care is selected', () => {
            const mockEvent: any = {
                target: { value: '4' }
            };
            component.onCategorySelected(mockEvent);
            communicationReasons = component.communicationReasons;
            expect(communicationReasons).toBeDefined();
            expect(component.addCommunicationCenter.value.Reason).toEqual(4);
        });
        it('should set reasonOnChangeCategory to 0 when communicationCategory Select Options are selected', () => {
            const mockEvent: any = {
                target: { value: '0' }
            };
            component.onCategorySelected(mockEvent);
            communicationReasons = component.communicationReasons;
            expect(communicationReasons).toBeDefined();
        });
    });
    describe('resetFormValues', () => {
        it('should reset the form values to default values', () => {
            component.resetFormValues();
            expect(component.addCommunicationCenter.value).toBeDefined();
            expect(component.addCommunicationCenter.value.CommunicationType).toEqual('0');
            expect(component.addCommunicationCenter.value.CommunicationCategory).toEqual('0');
            expect(component.addCommunicationCenter.value.Reason).toEqual('0');
            expect(component.addCommunicationCenter.value.Status).toEqual('0');
            expect(component.addCommunicationCenter.value.Notes).toEqual('');
            expect(component.communicationReasons).toEqual(null);
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
        it('should call authAccess and set value true to hasCreateAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').
                and.returnValue(true);
            component.authAccess();
            expect(component.hasCreateAccess).toEqual(true);
            expect(component.hasEditAccess).toEqual(true);
        });
        it('should call authAccess and set value false to hasCreateAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').
                and.returnValue(false);
            component.authAccess();
            expect(component.hasCreateAccess).toEqual(false);
            expect(component.hasEditAccess).toEqual(false);
        });
    });
    describe('toolTipText', () => {
        it('should call toolTipText and set value if user has not create access.', () => {
            component.hasCreateAccess = false;
            component.isCreateToolTipText = 'You do not have permission to view this information.';
            component.toolTipText();
            expect(component.toolTipMessage).toEqual(component.isCreateToolTipText);
        });
    });
    describe('updateCommunication', () => {
        it('should call patientCommunicationCenterService.updatePatientCommunication when updateCommunication called', () => {
            spyOn(component, 'resetFormValues').and.callThrough();
            spyOn(patientCommunicationService, 'updatePatientCommunication').and.returnValue(Promise.resolve({ Value: mockEditCommunication }));
            component.updateCommunication();
            patientCommunicationService.updatePatientCommunication(mockEditCommunication.PatientCommunicationId, mockEditCommunication)
                .then((result: any) => {
                    component.updateCommunicationSuccess(result);
                    expect(component.isFormChanged).toEqual(false);
                    expect(component.resetFormValues).toHaveBeenCalled();
                }, () => {
                });
            expect(patientCommunicationService.updatePatientCommunication);
        });
        it('should call updateCommunicationFailure when patientCommunicationCenterService.updatePatientCommunication throw Error', () => {
            component.hasEditAccess = true;
            component.addCommunicationCenter = fb.group({
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
            spyOn(component, 'updateCommunicationFailure').and.callThrough();
            component.updateCommunication();
            expect(patientCommunicationService.updatePatientCommunication)
                .toHaveBeenCalledWith(mockEditCommunication.PatientCommunicationId, mockEditCommunication);
            expect(component.updateCommunicationFailure).toHaveBeenCalled();
            expect(patientCommunicationService.updatePatientCommunication);
        });
        it('should call patientCommunicationCenterService.updatePatientCommunication when updateCommunication is a success', () => {
            component.hasEditAccess = true;
            component.addCommunicationCenter = fb.group({
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
            spyOn(component, 'updateCommunicationSuccess').and.callThrough();
            component.updateCommunication();
            expect(patientCommunicationService.updatePatientCommunication)
                .toHaveBeenCalledWith(mockEditCommunication.PatientCommunicationId, mockEditCommunication);
            expect(component.updateCommunicationSuccess).toHaveBeenCalled();
            expect(patientCommunicationService.updatePatientCommunication);
        });
    });
});
