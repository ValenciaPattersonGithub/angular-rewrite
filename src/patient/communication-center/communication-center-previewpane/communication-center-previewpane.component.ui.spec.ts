import { TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { CommunicationCenterPreviewpaneComponent } from './communication-center-previewpane.component';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { PatientDetailService } from 'src/patient/patient-detail/services/patient-detail.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { render, screen } from '@testing-library/angular';
import { ProviderOnScheduleDropdownService } from 'src/scheduling/providers/provider-on-schedule-dropdown.service';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { PatientCommunication } from 'src/patient/common/models/patient-communication.model';
import { HttpClient } from '@angular/common/http';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { CommunicationConstants } from '../communication-constants/communication.costants';
import { DialogService } from '@progress/kendo-angular-dialog';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

const mockCommunicationEvent = { eventtype: 12, data: {"PatientCommunicationId": 1641,
                                                        "PatientId": "8cd337cd-7a65-4065-b299-e6c79b8d21e4",
                                                        "CommunicationType": 7,
                                                        "CommunicationCategory": 1,
                                                        "Reason": 10,
                                                        "Notes": "test",
                                                        "DueDate": null,
                                                        "CommunicationDate": "2024-08-28T10:41:52.000Z",
                                                        "IsComplete": null,
                                                        "LetterTemplate": null,
                                                        "CommunicationTemplateId": null,
                                                        "Status": 2,
                                                        "IsRead": null,
                                                        "PatientCommunicationData": null,
                                                        "CreatedBy": "c1be4333-7ec2-42ba-4a5f-08dc8287b22b",
                                                        "PersonAccountNoteId": 285399,
                                                        "AccountId": "00000000-0000-0000-0000-000000000000",
                                                        "CommunicationMode": 0,
                                                        "LetterTemplateName": null,
                                                        "DataTag": "AAAAAB6kyRI=",
                                                        "UserModified": "c1be4333-7ec2-42ba-4a5f-08dc8287b22b",
                                                        "DateModified": "2024-08-28T10:41:52.000Z",
                                                        "Index": 3,
                                                        "AddedBy": "Megha Bhargava, Dentist"} };
const mockPatientInfo = { patientId: '4321', firstName: 'John', lastName: 'Doe' };
const mockAppointment = { appointmentId: 999, time: '2024-10-10T10:00:00' };

// Mock Subject for updatePatientCommunications$
const updatePatientCommSubjectMock = new Subject<PatientCommunication>(); // Use a Subject, not of()
const mockPatientCommunicationCenterService = jasmine.createSpyObj('PatientCommunicationCenterService', [
    'getPatientCommunicationByPatientId',
    'getCommunicationEvent',
    'setCommunicationEvent',
    'GetPatientCommunicationTemplates',
    'patientDetail',
    'createAccountNoteCommunication',
    'updatePatientCommunication',
    'getPatientInfoByPatientId',
    'getPatientNextAppointment',
    'getUserdetail'
]);

// Mock the updatePatientCommunications$ as a Subject
mockPatientCommunicationCenterService.updatePatientCommunications$ = updatePatientCommSubjectMock; // No need for `and.returnValue()`

// Mocking the return value for other methods
mockPatientCommunicationCenterService.getPatientCommunicationByPatientId.and.returnValue(of([{}]));
mockPatientCommunicationCenterService.getCommunicationEvent.and.returnValue(of(mockCommunicationEvent));
mockPatientCommunicationCenterService.setCommunicationEvent.and.returnValue(of(mockCommunicationEvent));
mockPatientCommunicationCenterService.GetPatientCommunicationTemplates.and.returnValue(of(mockCommunicationEvent));
mockPatientCommunicationCenterService.patientDetail.and.returnValue(of(mockPatientInfo));
mockPatientCommunicationCenterService.createAccountNoteCommunication.and.returnValue(of({ message: 'Note Created' }));
mockPatientCommunicationCenterService.updatePatientCommunication.and.returnValue(of({ message: 'Communication Updated' }));
mockPatientCommunicationCenterService.getPatientInfoByPatientId.and.returnValue(of(mockPatientInfo));
mockPatientCommunicationCenterService.getPatientNextAppointment.and.returnValue(of(mockAppointment));
mockPatientCommunicationCenterService.getUserdetail.and.returnValue(of([{}]));

// PatientDetailService Mock
const mockPatientDetailService = jasmine.createSpyObj('PatientDetailService', [
    'getPatientDashboardOverviewByPatientId',
    'setPatientPreferredDentist',
    'setPatientPreferredHygienist',
    'getNextAppointmentStartTimeLocalized'
]);

mockPatientDetailService.getPatientDashboardOverviewByPatientId.and.returnValue(Promise.resolve(mockPatientInfo));
mockPatientDetailService.setPatientPreferredDentist.and.returnValue(of({ dentistId: '123', name: 'Dr. Smith' }));
mockPatientDetailService.setPatientPreferredHygienist.and.returnValue(of({ hygienistId: '456', name: 'Ms. Lee' }));
mockPatientDetailService.getNextAppointmentStartTimeLocalized.and.returnValue('2024-10-10 10:00 AM');

// RouteParams Mock
const mockRouteParams = {
    patientId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
};

// ReferenceDataService Mock
const mockreferenceDataService = jasmine.createSpyObj('ReferenceDataService', ['get']);
mockreferenceDataService.get.and.returnValue([mockPatientInfo]);
mockreferenceDataService.entityNames = {
    users: 'users'
};

// Tostarfactory Mock
const mockTostarfactory = jasmine.createSpyObj('Tostarfactory', ['error', 'success']);
mockTostarfactory.error.and.returnValue('Error: Communication failed');
mockTostarfactory.success.and.returnValue('Success: Communication completed');

// TabLauncher and DatePipe Mocks
const mockTabLauncher = jasmine.createSpy('TabLauncher');
const mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
mockDatePipe.transform.and.returnValue('2024-10-10');

const mockReferralManagementHttpService = {
    getReferral: jasmine.createSpy('getReferral').and.returnValue(of([{}])),
    getPracticeProviders: jasmine.createSpy('getPracticeProviders').and.returnValue(of([{}])),

    // Properly mocking a Promise for getSources
    getSources: jasmine.createSpy('getSources').and.returnValue(Promise.resolve({ Value: '' }))
};

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

let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
    generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
};

const mockFeatureFlagService = {
    getOnce$: jasmine.createSpy().and.returnValue(of("white"))
}

describe('CommunicationCenterPreviewpaneComponent', () => {
    beforeEach(async () => {

        await TestBed.configureTestingModule({
            declarations: [CommunicationCenterPreviewpaneComponent, EnumAsStringPipe, AppButtonComponent],
            imports: [HttpClientTestingModule, TranslateModule.forRoot()],
            providers: [HttpClient,
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: 'tabLauncher', useValue: mockTabLauncher },
                { provide: DatePipe, useValue: mockDatePipe },
                { provide: PatientDetailService, useValue: mockPatientDetailService },
                { provide: 'SoarConfig', useValue: {} },
                { provide: 'ReferralSourcesService', useValue: mockReferralSourcesService },
                { provide: 'providerOnScheduleDropdownService', useValue: {} },
                { provide: ProviderOnScheduleDropdownService, useValue: {} },
                { provide: ReferralManagementHttpService, useValue: mockReferralManagementHttpService },
                { provide: ConfirmationModalService, useValue: {} },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: CommunicationConstants, useValue: {} },
                { provide: DialogService, useValue: {} },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });
    it('should render the Communication Center Preview Pane Component', async () => {
        await render(CommunicationCenterPreviewpaneComponent, {
            // Add necessary providers, declarations, imports, etc.
        });
    });
});








