import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommunicationReason, CommunicationCategory } from 'src/patient/common/models/enums';
import { CommunicationCardComponent } from './communication-card.component';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { BehaviorSubject, of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { DialogService, DialogContainerService, DialogRef } from '@progress/kendo-angular-dialog';
import { configureTestSuite } from 'src/configure-test-suite';
import { HttpClient } from '@microsoft/signalr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';

describe('CommunicationCardComponent', () => {
    let component: CommunicationCardComponent;
    let fixture: ComponentFixture<CommunicationCardComponent>;
    let patSecurityService: any;
    let refDataService: any;
    let patientCommunicationService: any;
    let httpClient: HttpClient;
    const updatePatientCommSubjectMock = new BehaviorSubject<{}>(undefined);
    let toastrFactory: any;

    const mockreferenceDataService = {
        get: (a: any) => { },
        entityNames: {
            users: [{ UserId: '12', FirstName: 'FN', LastName: 'LN' }]
        }
    };
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
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
    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { }
    };
    const confirmationModalData = {
        header: 'Communication Center',
        message: 'Are you sure you want to delete this communication?',
        confirm: 'Yes',
        cancel: 'No'
    };
    const mockPatientCommunicationCenterService: any = {
        getPatientCommunicationByPatientId: (a: any) => of([{}]),
        updatePreview: (a: any) => { },
        deletePatientCommunicationById: (a: any) => of({}),
        setCommunicationEvent: (a: any) => of({}),
        getCommunicationEvent: () => of({}),
        GetPatientCommunicationTemplates: () => of({}),
        patientDetail: of({}),
        createAccountNoteCommunication: (a: any, b: any) => of({}),
        updatePatientCommunication: (a: any, b: any) => of({}),
        updatePatientCommunications$: updatePatientCommSubjectMock
    };
    const mockDatePipe: any = {
        transform: (a: any) => { }
    };
    const mockCommunicationConstants = {
        CommunicationReasons: [
            { text: 'Account Note', value: CommunicationReason.AccountNote, category: CommunicationCategory.Account },
            { text: 'Other Insurance', value: CommunicationReason.OtherInsurance, category: CommunicationCategory.Insurance },
            { text: 'General Note', value: CommunicationReason.GeneralNote, category: CommunicationCategory.MiscCommunication },
            { text: 'Appointments', value: CommunicationReason.Appointments, category: CommunicationCategory.PatientCare },
            { text: 'Preventive Care', value: CommunicationReason.PreventiveCare, category: CommunicationCategory.PatientCare },
            { text: 'Treatment Plan', value: CommunicationReason.TreatmentPlan, category: CommunicationCategory.PatientCare }
        ]
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
    const mockReferralSourcesService = {
        get: jasmine.createSpy('get').and.returnValue({
          $promise: Promise.resolve({
            Value: [
              { value: "00000000-0000-0000-0000-000000000001", text: "Email" },
              { value: "00000000-0000-0000-0000-000000000002", text: "Instagram" },
              { value: "00000000-0000-0000-0000-000000000003", text: "Facebook" },
              { value: "00000000-0000-0000-0000-000000000004", text: "LinkedIn" },
              { value: "00000000-0000-0000-0000-000000000005", text: "Twitter" },
              { value: "00000000-0000-0000-0000-000000000006", text: "Other" }
            ]
          })
        })
      };
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), HttpClientTestingModule],
            providers: [DialogService, DialogContainerService, HttpClient, ReferralManagementHttpService,
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: DatePipe, useValue: mockDatePipe },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: CommunicationConstants, useValue: mockCommunicationConstants },
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: 'SoarConfig', useValue: {} },
                { provide: 'ReferralSourcesService', useValue: mockReferralSourcesService }   
            ],
            declarations: [CommunicationCardComponent, EnumAsStringPipe, AppButtonComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationCardComponent);
        component = fixture.componentInstance;
        patSecurityService = TestBed.get('patSecurityService');
        refDataService = TestBed.get('referenceDataService');
        toastrFactory = TestBed.get('toastrFactory');
        patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('toolTipText', () => {
        it('should call toolTipText and set value if communication is clinical note', () => {
            component.defaultClinicalNoteToolTipText = 'Clinical Note Communications must be managed from the Clinical page.';
            component.communicationModel.Reason = CommunicationReason.ClinicalNote;
            component.toolTipText();
            expect(component.toolTipMessage).toEqual(component.defaultClinicalNoteToolTipText);
            expect(component.isClinicalNote).toEqual(true);
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
    describe('deleteCommunication', () => {
        it('should call patientCommunicationCenterService.deletePatientCommunicationById when deleteCommunication called', () => {
            const patientCommunicationId = 19;
            component.hasDeleteAccess = true;
            component.communicationModel.Reason = CommunicationReason.Appointments;
            component.deleteCommunication(patientCommunicationId);
            expect(mockConfirmationModalService.open).toHaveBeenCalled();
        });
        it('should call deleteCommunicationSuccess when patientCommunicationService.deletePatientCommunicationById return success', () => {
            const patientCommunicationId = 19;
            const personAccountNoteId = 0;
            spyOn(patientCommunicationService, 'deletePatientCommunicationById').and.returnValue(Promise.resolve({ result: 'success' }));
            patientCommunicationService.deletePatientCommunicationById(patientCommunicationId, personAccountNoteId)
                .then(() => {
                    component.deleteCommunicationSuccess();
                    expect(toastrFactory.success).toHaveBeenCalled();
                }, () => {
                });
            expect(patientCommunicationService.patientCommunicationId);
        });
        it('should call deleteCommunicationFailure when patientCommunicationService.deletePatientCommunicationById return failed', () => {
            const patientCommunicationId = 19;
            const personAccountNoteId = 0;
            spyOn(patientCommunicationService, 'deletePatientCommunicationById').and.returnValue(Promise.resolve({ result: 'failed' }));
            patientCommunicationService.deletePatientCommunicationById(patientCommunicationId, personAccountNoteId)
                .then(() => {
                }, () => {
                    component.deleteCommunicationFailure();
                    expect(component.deleteCommunicationFailure).toHaveBeenCalled();
                });
        });
    });
    describe('openConfirmationModal', () => {
        it('should call deleteCommunicationSuccess when patientCommunicationService.deletePatientCommunicationById return success', () => {
            const patientCommunicationId = 19;
            spyOn(mockPatientCommunicationCenterService, 'deletePatientCommunicationById')
                .and.returnValue(Promise.resolve({ result: 'success' }));
            component.openConfirmationModal(confirmationModalData, patientCommunicationId);
            patientCommunicationService.deletePatientCommunicationById(patientCommunicationId)
                .then(() => component.deleteCommunicationSuccess(),
                    () => {
                    });
            expect(patientCommunicationService.patientCommunicationId);
        });
        it('should call deleteCommunicationSuccess when patientCommunicationService.deletePatientCommunicationById return failure', () => {
            const patientCommunicationId = 20;
            spyOn(mockPatientCommunicationCenterService, 'deletePatientCommunicationById')
                .and.returnValue(Promise.resolve({ result: 'failure' }));
            component.openConfirmationModal(confirmationModalData, patientCommunicationId);
            patientCommunicationService.deletePatientCommunicationById(patientCommunicationId)
                .then(() => component.deleteCommunicationFailure(),
                    () => {
                    });
            expect(patientCommunicationService.patientCommunicationId);
        });
    });
    describe('editPatientCommunication', () => {
        it('should call editCommunication with valid parameter ', () => {
            component.isClinicalNote = false;
            component.hasEditAccess = true;
            const communication: any = {
                CommunicationType: 1,
                CommunicationCategory: 2,
                Reason: '2',
                Status: '0',
                Notes: 'test',
                PatientId: '1'
            };
            spyOn(component, 'editCommunication').and.callThrough();
            component.editPatientCommunication(communication);
            expect(component.editCommunication).toHaveBeenCalledWith(communication);
        });
    });
});
