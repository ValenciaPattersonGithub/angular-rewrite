import { TestBed} from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { CommunicationCenterTimelineComponent } from './communication-center-timeline.component';
import { CommunicationCardComponent } from '../communication-card/communication-card.component';
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



// Mock data for getReferrals with In Referral and Out Referral
const mockReferralsData = [
    // For In Referral
    {
      referralDirectionType: 'In Referral',
      referralCategory: 'Specialist Provider',
      referralDirectionTypeId: 2,
      referralCategoryId: 1,
      referralAffiliate: {
        firstName: 'John',
        lastName: 'Doe',
        isExternal: true,
        referralAffiliateId: 'affiliate123'
      },
      otherSource: {
        sourceId: 'source123'
      },
      referringProviderId: 'provider123'
    },
    // For Out Referral
    {
      referralDirectionType: 'Out Referral',
      referralCategory: 'General Provider',
      referralDirectionTypeId: 1,
      referralCategoryId: 2,
      referralAffiliate: {
        firstName: 'Alice',
        lastName: 'Smith',
        isExternal: false,
        referralAffiliateId: 'affiliate456'
      },
      otherSource: {
        sourceId: 'source456'
      },
      referringProviderId: 'provider456'
    }
  ];
  
  // Mock data for getPracticeProviders
  const mockPracticeProvidersData = [
    // Provider for In Referral
    {
      provider: {
        firstName: 'Jane',
        lastName: 'Doe',
        providerAffiliateId: 'provider123',
        address1: '123 Main St',
        address2: 'Suite 456',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '555-1234',
        emailAddress: 'jane.doe@example.com'
      },
      practice: {
        name: 'Jane Doe Clinic'
      }
    },
    // Provider for Out Referral
    {
      provider: {
        firstName: 'Emily',
        lastName: 'Johnson',
        providerAffiliateId: 'provider456',
        address1: '456 Elm St',
        address2: 'Apt 789',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        phone: '555-5678',
        emailAddress: 'emily.johnson@example.com'
      },
      practice: {
        name: 'Emily Johnson Clinic'
      }
    }
  ];
  

// Mock Data
const mockPatientCommunication = [
	{
		"PatientCommunicationId": 1707,
		"PatientId": "8cd337cd-7a65-4065-b299-e6c79b8d21e4",
		"CommunicationType": 10,
		"CommunicationCategory": 2,
		"Reason": 14,
		"Notes": "test",
		"DueDate": null,
		"CommunicationDate": "2024-10-03T16:30:17.000Z",
		"IsComplete": false,
		"LetterTemplate": null,
		"CommunicationTemplateId": null,
		"Status": 2,
		"IsRead": null,
		"PatientCommunicationData": null,
		"CreatedBy": "c1be4333-7ec2-42ba-4a5f-08dc8287b22b",
		"PersonAccountNoteId": null,
		"AccountId": "00000000-0000-0000-0000-000000000000",
		"CommunicationMode": 0,
		"LetterTemplateName": null,
		"DataTag": "AAAAAB7YKUw=",
		"UserModified": "c1be4333-7ec2-42ba-4a5f-08dc8287b22b",
		"DateModified": "2024-10-03T16:30:17.000Z",
		"Index": 0,
		"AddedBy": "Megha Bhargava, Dentist"
	},
	{
		"PatientCommunicationId": 0,
		"PatientId": "8cd337cd-7a65-4065-b299-e6c79b8d21e4",
		"CommunicationType": 10,
		"CommunicationCategory": 4,
		"Reason": 9,
		"Notes": "rggsdfgfdgdfgwrgs",
		"DueDate": null,
		"CommunicationDate": "2024-09-25T10:05:30.000Z",
		"IsComplete": null,
		"LetterTemplate": null,
		"CommunicationTemplateId": null,
		"Status": 0,
		"IsRead": null,
		"PatientCommunicationData": null,
		"CreatedBy": "c1be4333-7ec2-42ba-4a5f-08dc8287b22b",
		"PersonAccountNoteId": null,
		"AccountId": "00000000-0000-0000-0000-000000000000",
		"CommunicationMode": 0,
		"LetterTemplateName": null,
		"DataTag": null,
		"UserModified": "c1be4333-7ec2-42ba-4a5f-08dc8287b22b",
		"DateModified": "0001-01-01T00:00:00",
		"Index": 1,
		"AddedBy": "Megha Bhargava, Dentist"
	},
	{
		"PatientCommunicationId": 0,
		"PatientId": "8cd337cd-7a65-4065-b299-e6c79b8d21e4",
		"CommunicationType": 10,
		"CommunicationCategory": 4,
		"Reason": 9,
		"Notes": "test note",
		"DueDate": null,
		"CommunicationDate": "2024-09-20T11:16:51.000Z",
		"IsComplete": null,
		"LetterTemplate": null,
		"CommunicationTemplateId": null,
		"Status": 0,
		"IsRead": null,
		"PatientCommunicationData": null,
		"CreatedBy": "0fe38ff7-ca24-4398-833a-08dcc18396e8",
		"PersonAccountNoteId": null,
		"AccountId": "00000000-0000-0000-0000-000000000000",
		"CommunicationMode": 0,
		"LetterTemplateName": null,
		"DataTag": null,
		"UserModified": "0fe38ff7-ca24-4398-833a-08dcc18396e8",
		"DateModified": "0001-01-01T00:00:00",
		"Index": 2,
		"AddedBy": "Innovators Testing"
	},
	{
		"PatientCommunicationId": 1641,
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
		"AddedBy": "Megha Bhargava, Dentist"
	}];
const mockCommunicationEvent = { id: 101, type: 'Event' };
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
mockPatientCommunicationCenterService.getPatientCommunicationByPatientId.and.returnValue(of(mockPatientCommunication));
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
    getReferral: jasmine.createSpy('getReferral').and.returnValue(of(mockReferralsData)),
    getPracticeProviders: jasmine.createSpy('getPracticeProviders').and.returnValue(of(mockPracticeProvidersData)),

    // Properly mocking a Promise for getSources
    getSources: jasmine.createSpy('getSources').and.returnValue(Promise.resolve({ Value: '' }))
  };
  
  const mockProviderOnScheduleDropdownService = {
    getProvidersFromCache: jasmine.createSpy('getProvidersFromCache').and.returnValue([
      {
        UserId: '123',
        FirstName: 'John',
        LastName: 'Doe',
        // Add more properties if required
      },
      {
        UserId: '124',
        FirstName: 'Jane',
        LastName: 'Smith',
        // Add more properties if required
      }
    ]),
    // You can mock other methods of this service similarly if needed
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

describe('PatientReferralsComponent', () => {
    beforeEach(async () => {

        await TestBed.configureTestingModule({
            declarations: [CommunicationCenterTimelineComponent, CommunicationCardComponent,EnumAsStringPipe, AppButtonComponent],
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
                { provide: 'ReferralSourcesService', useValue:mockReferralSourcesService},
                { provide: 'providerOnScheduleDropdownService', useValue: {} },
                { provide: ProviderOnScheduleDropdownService, useValue: mockProviderOnScheduleDropdownService },
                { provide: ReferralManagementHttpService, useValue: mockReferralManagementHttpService},
                { provide: ConfirmationModalService, useValue: {} },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: CommunicationConstants, useValue: {} },
                { provide: DialogService, useValue: {} },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA], // Fix the schema issue
        }).compileComponents();
    });
    it('should render the Communication Center Timeline Component', async () => {
        await render(CommunicationCenterTimelineComponent, {
          // Add necessary providers, declarations, imports, etc.
        });
      
        
         
      });

     
      
      
});








