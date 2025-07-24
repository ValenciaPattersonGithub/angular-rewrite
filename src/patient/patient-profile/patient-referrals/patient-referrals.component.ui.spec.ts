import { TestBed } from '@angular/core/testing';
import { ComponentRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // Import CUSTOM_ELEMENTS_SCHEMA
import { fireEvent, render, screen } from '@testing-library/angular';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { PatientReferralsComponent } from './patient-referrals.component';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { HttpClient } from '@angular/common/http';
import { DialogContainerService, DialogService } from '@progress/kendo-angular-dialog';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { ProviderOnScheduleDropdownService } from 'src/scheduling/providers/provider-on-schedule-dropdown.service';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { MicroServiceApiService } from 'src/security/providers';
import { ImagingMasterService } from 'src/patient/imaging/services/imaging-master.service';
import { BlueImagingService } from 'src/patient/imaging/services/blue.service';
import { MockRepository } from '../patient-profile-mock-repo';
import { GridComponent, GridModule } from '@progress/kendo-angular-grid';
import { GetReferralsResponseDto, OtherAffiliateSource, ReferralAffiliateResponse } from 'src/business-center/practice-settings/patient-profile/referral-type/referral-type.model';

// Mock data for ReferralAffiliateResponse
const mockReferralAffiliateResponse: ReferralAffiliateResponse = {
  referralAffiliateId: 'referral123',
  firstName: 'John',
  lastName: 'Doe',
  middleName: 'M',
  emailAddress: 'john.doe@example.com',
  phone: '123-456-7890',
  isExternal: true,
  practiceAffiliateName: 'John Doe Clinic'
};

// Mock data for OtherAffiliateSource
const mockOtherAffiliateSource: OtherAffiliateSource = {
  otherSourceAffiliateId: 'source123',
  sourceId: 'source-id-123',
  campaignName: 'Campaign XYZ'
};

// Mock data for GetReferralsResponseDto
const mockGetReferralsResponse: GetReferralsResponseDto[] = [{
  referralAffiliate: mockReferralAffiliateResponse,
  referralCategory: 'Specialist',
  referralCategoryId: 1,
  referralDirectionType: 'Inbound',
  referralDirectionTypeId: 1,
  dateCreated: '2023-07-25T12:00:00Z',
  otherSource: mockOtherAffiliateSource,
  referringProviderId: 'provider123',
  treatmentPlanId: 'treatment123',
  isPrintTreatmentPlan: true,
  referralId: 'referral123',
  note: 'Patient needs further evaluation.',
  referralAffiliateName: 'Dr. John Doe',
  referringTo: 'Specialist Clinic',
  referringFrom: 'General Hospital',
  address1: '123 Main St',
  address2: 'Suite 456',
  patientEmailAddress: 'patient@example.com',
  returnDate: null,
  actualReturnDate: null
}];

const mockreferenceDataService: any = {
  get: function (x) {
    return [];
  },
  entityNames: {
    users: [],
  },
};

const mockPatientInfo = {
  AddressLine1: 'Address 1',
  AddressLine2: 'Address 2',
  City: 'Newyork',
  DateOfBirth: '1983-05-17T23:59:00',
  DisplayStatementAccountId: '1-41863',
  EmailAddress: '',
  Emails: [{ Email: 'test@gmail.com', IsPrimary: true, ReminderOK: true }],
  FirstName: 'Patient FN',
  IsActive: true,
  IsPatient: true,
  LastName: 'Patient LN',
  Locations: [],
  MiddleName: 'Patient MN',
  PatientCode: 'CODE',
  PersonAccountId: '91630d5f-4cf7-4baf-a96b-da71087fba07',
  PhoneNumber: null,
  PhoneNumbers: [{ PhoneNumber: '3344556677', IsPrimary: true, ReminderOK: true, Type: 'M' }],
  PhoneType: null,
  PreferredDentist: 'Dentist',
  PreferredHygienist: 'Hygienist',
  PreferredLocation: 1,
  PreferredName: '',
  PrefixName: '',
  ReceivesFinanceCharges: true,
  ReceivesStatements: true,
  ResponsibleFirstName: null,
  ResponsibleLastName: null,
  ResponsibleMiddleName: null,
  ResponsiblePersonId: 'fd1fec8a-d596-4a27-b0f0-31698fa86ce2',
  ResponsiblePersonName: 'Self',
  ResponsiblePreferredName: null,
  ResponsiblePrefixName: null,
  ResponsibleSuffix: null,
  Sex: 'M',
  SignatureOnFile: false,
  State: 'Test',
  Suffix: 'T',
  ZipCode: 'zipCode'
}

const mockPatientMedicalHistoryAlerts = {
  ExtendedStatusCode: null,
  Value: null,
  Count: null,
  InvalidProperties: null
};
let scheduleFactoryPromise: Promise<any> = new Promise<any>((resolve, reject) => { });
let dialogservice: DialogService;

const mockpatSecurityService = jasmine.createSpyObj('patSecurityService', ['IsAuthorizedByAbbreviation']);
const mockTostarfactory = jasmine.createSpyObj('Tostarfactory', {
  error: 'Error Message',
  success: 'Success Message'
});

const mockReferralManagementHttpService = {
  getReferral: jasmine.createSpy('getReferral').and.returnValue(of(mockGetReferralsResponse)),
  getSources: jasmine.createSpy().and.returnValue({
    then: function (callback) {
        callback({ Value: '' });
    }
  })
};

const mockPatientCommunicationCenterService = {
  getPatientInfoByPatientId: jasmine.createSpy('getPatientInfoByPatientId').and.returnValue(of({ FirstName: 'Jane', LastName: 'Smith' })),
};

const mockDialogService = {
  open: jasmine.createSpy('open').and.returnValue({
    dialog: {
      location: {
        nativeElement: {
          children: [{}, { classList: { add: jasmine.createSpy('add') } }]
        }
      }
    },
    result: new Subject()
  })
};

const blueImagingServiceSpy = jasmine.createSpyObj('BlueImagingService', ['getImage']);
const mockService = {
  IsAuthorizedByAbbreviation: jasmine.createSpy('IsAuthorizedByAbbreviation').and.callFake((authtype: string) => { }),
  getServiceStatus: jasmine.createSpy('getServiceStatus').and.returnValue(new Promise((resolve, reject) => {
    // the resolve / reject functions control the fate of the promise
  })),
  esCancelEvent: new BehaviorSubject<{}>(undefined),
  isEnabled: jasmine.createSpy('isEnabled').and.returnValue(new Promise((resolve, reject) => { })),
  getCurrentLocation: jasmine.createSpy('getCurrentLocation').and.returnValue({ practiceId: 'test' }),
  getPatientResponsiblePartyPhonesAndEmails: jasmine.createSpy('getPatientResponsiblePartyPhonesAndEmails').and.returnValue(of({})),
};

const mockPatientMedicalHistoryAlertsFactory = {
  PatientMedicalHistoryAlerts: jasmine.createSpy('PatientMedicalHistoryAlerts').and.returnValue({
    then: (res) => {
      res(mockPatientMedicalHistoryAlerts);
    }
  })
};

var personResult = { Value: '' };
const mockPersonFactory = {
  SetPatientMedicalHistoryAlerts: jasmine.createSpy('SetPatientMedicalHistoryAlerts'),
  getById: jasmine.createSpy('getById').and.returnValue({
    then: (res) => {
      res(personResult);
    }
  }),
};

const mockReferenceDataService = {
  get: jasmine.createSpy('get').and.returnValue([]),
  entityNames: {
    practiceSettings: 'test'
  }
};
let mockShowOnScheduleFactory: any = {
  getAll: jasmine.createSpy().and.returnValue(scheduleFactoryPromise)
};
const mockSortReferrals = jasmine.createSpy('sortReferrals').and.returnValue(mockGetReferralsResponse);


let mockRepo;
describe('PatientReferralsComponent', () => {
  beforeEach(async () => {
    mockRepo = MockRepository();
    await TestBed.configureTestingModule({
      declarations: [PatientReferralsComponent, AppLabelComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot(), GridModule],
      providers: [
        { provide: ReferralManagementHttpService, useValue: mockReferralManagementHttpService },
        HttpClient,
        DialogService,
        { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
        ProviderOnScheduleDropdownService,
        DialogContainerService,
        ComponentRef,
        EnumAsStringPipe,
        MicroServiceApiService,
        { provide: 'patSecurityService', useValue: mockpatSecurityService },
        { provide: '$routeParams', useValue: mockRepo.mockService },
        { provide: 'toastrFactory', useValue: mockTostarfactory },
        { provide: 'referenceDataService', useValue: mockReferenceDataService },
        { provide: 'ProviderShowOnScheduleFactory', useValue: mockShowOnScheduleFactory },
        { provide: 'DialogRef', useValue: mockDialogService },
        { provide: 'SoarConfig', useValue: {} },
        { provide: BlueImagingService, useValue: blueImagingServiceSpy },
        { provide: ImagingMasterService, useValue: mockService },
        { provide: 'PatientMedicalHistoryAlertsFactory', useValue: mockPatientMedicalHistoryAlertsFactory },
        { provide: 'PersonFactory', useValue: mockPersonFactory },
        { provide: 'mockReferralManagementHttpService', useValue: mockReferralManagementHttpService },
        { provide: 'referenceDataService', useValue: mockreferenceDataService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA], // Fix the schema issue
    }).compileComponents();
  });

  it('should render the PatientReferralsComponent', async () => {
    const isTabView = true; // Set the value for `isTabView`
    const { container } =  await render(PatientReferralsComponent, {
      componentProperties: {
        // Pass the mock data here
        patientProfile: mockPatientInfo,
        isTabView,
        patientReferralsList: mockGetReferralsResponse,
        sortReferrals: mockSortReferrals
      }

    });
    expect(container).toBeTruthy();
    
  });

  it('should display text "Recent Referrals"', async () => {
    await render(PatientReferralsComponent)
    const textElement = screen.getByText(/Recent Referrals/i);
    expect(textElement).toBeTruthy();
  });

  it('should display correct column headers', async () => {
    await render(PatientReferralsComponent, {
      componentProperties: {
        patientProfile: mockPatientInfo,
        isTabView: true,
        patientReferralsList: mockGetReferralsResponse,
        sortReferrals: mockSortReferrals
      }
    });
    const headers = screen.getAllByRole('columnheader');
    expect(headers[0].textContent).toContain('Date');
    expect(headers[1].textContent).toContain('Referral Directions');
    expect(headers[2].textContent).toContain('Referral Categories');
    expect(headers[3].textContent).toContain('Provider');
    expect(headers[4].textContent).toContain('Referring To');
    expect(headers[5].textContent).toContain('Referring From');
  
  });

  it('should display correct referral data in the grid', async () => {
     await render(PatientReferralsComponent, {
      componentProperties: {
        patientReferralsList: mockGetReferralsResponse
      }
    });
    const dateElement = screen.getByText('07/25/2023');
    const directionElement = screen.getByText(/Inbound/i);
    const categoryElement = screen.getByText('Specialist');
    const referringToElement = screen.getByText('Specialist Clinic');
    const referringFromElement = screen.getByText('General Hospital');

    expect(dateElement).toBeTruthy();
    expect(directionElement).toBeTruthy();
    expect(categoryElement).toBeTruthy();
    expect(referringToElement).toBeTruthy();
    expect(referringFromElement).toBeTruthy();
  });

  it('should have edit and delete buttons', async () => {
    await render(PatientReferralsComponent, {
      componentProperties: {
        patientProfile: mockPatientInfo,
        isTabView: true,
        patientReferralsList: mockGetReferralsResponse,
        sortReferrals: mockSortReferrals
      }
      
    });
    const editButton = screen.getByText('Edit');
    const deleteButton = screen.getByText('Delete');
    expect(editButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();
  });

  it('should handle empty referral list', async () => {
    mockReferralManagementHttpService.getReferral.and.returnValue(of([]));
    await render(PatientReferralsComponent, {
      componentProperties: {
        patientProfile: mockPatientInfo,
        isTabView: true,
        patientReferralsList: [],
        sortReferrals: mockSortReferrals
      }
    });
  
    const noDataMessage = screen.getByText(/No Content Available/i);
    expect(noDataMessage).toBeTruthy();
  });
  

});
