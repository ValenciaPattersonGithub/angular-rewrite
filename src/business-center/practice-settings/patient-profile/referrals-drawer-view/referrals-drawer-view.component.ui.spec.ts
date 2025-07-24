import { TestBed } from '@angular/core/testing';
import { ComponentRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'; // Import CUSTOM_ELEMENTS_SCHEMA
import { fireEvent, render, screen } from '@testing-library/angular';
import { BehaviorSubject, of, Subject } from 'rxjs';
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
import { GridComponent, GridModule } from '@progress/kendo-angular-grid';
import { GetReferralsResponseDto, OtherAffiliateSource, ReferralAffiliateResponse } from 'src/business-center/practice-settings/patient-profile/referral-type/referral-type.model';
import { ReferralsDrawerViewComponent } from './referrals-drawer-view.component';
import { PatientReferralPrintService } from 'src/patient/patient-registration/patient-referrals/patient-referral-print.service';
import { Button } from 'protractor';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';


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

const mockreferenceDataService: any = {
  get: function (x) {
    return [];
  },
  entityNames: {
    users: [],
  },
};

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
  getReferral: jasmine.createSpy('getReferral').and.returnValue(of(mockReferralsData)),
  getPracticeProviders: jasmine.createSpy('getPracticeProviders').and.returnValue(of(mockPracticeProvidersData)),
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

const mockPatientReferralPrintService = {
    downloadPatientReferral: jasmine.createSpy('downloadPatientReferral').and.returnValue(of({
      success: true,
      message: 'Referral printed successfully',
      data: {
        referralId: 'referral123',
        downloadUrl: 'http://example.com/download/referral123',
        patientName: 'John Doe',
        dateOfBirth: '1980-01-01',
        phone: '123-456-7890',
        workPhone: '098-765-4321',
        email: 'john.doe@example.com',
        gender: 'Male',
        responsibleParty: 'Jane Doe',
        height: '5\'10"',
        weight: '170 lbs',
        alerts: [],
        signatureOnFile: true,
        statusPatient: 'Active',
        notes: 'Some notes about the referral',
        referringOfficeAddress1: '123 Provider St, Provider City, PC 12345',
        referringOfficeAddress2: '',
        practiceName: 'Sample Practice',
        referringOfficeName: 'Sample Referring Office',
        referringDoctorName: 'Dr. Smith',
        referringPatientEmail: 'john.doe@example.com',
        treatmentPlan: 'Plan 1',
        services: ['Service 1', 'Service 2'],
        reportType: 'Referral Out',
        referralSource: 'Source 2'
      }
    }))
  };

  let routeParams = {
    patientId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
}



  const mockPatientServices = {
    PatientLocations: {
      get: jasmine.createSpy('get').and.returnValue(Promise.resolve([]))
    },
    TreatmentPlans: {
      getTreatmentPlansWithServicesByPersonId: jasmine.createSpy('getTreatmentPlansWithServicesByPersonId').and.returnValue({
        $promise: Promise.resolve({
          Value: [
            {
              TreatmentPlanHeader: {
                TreatmentPlanId: 1,
                TreatmentPlanName: 'Plan 1'
              },
              TreatmentPlanServices: [
                {
                  ServiceTransaction: {
                    ServiceTransactionStatusId: 2,
                    Description: 'Service 1'
                  }
                },
                {
                  ServiceTransaction: {
                    ServiceTransactionStatusId: 1,
                    Description: 'Service 2'
                  }
                }
              ]
            }
          ]
        })
      })
    },
  };
  
  const mockBlueImagingService = {
    getImageThumbnailByPatientId: jasmine.createSpy('getImageThumbnailByPatientId').and.returnValue(Promise.resolve(new Blob(['mockImage'], { type: 'image/jpeg' }))),
  };

  const mockPatientHttpService = jasmine.createSpyObj('PatientHttpService', ['getAppointmentsByPatientId']);
  mockPatientHttpService.getAppointmentsByPatientId.and.returnValue(of([])); // Return an observable with an empty array or mock data
  
 
  


describe('PatientReferralsComponent', () => {
    beforeEach(async () => {

        await TestBed.configureTestingModule({
            declarations: [ReferralsDrawerViewComponent, AppLabelComponent],
            imports: [HttpClientTestingModule, TranslateModule.forRoot(), GridModule],
            providers: [
                HttpClient,
                { provide: '$routeParams', useValue: routeParams },
                { provide: DialogService, useValue: mockDialogService },
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                ProviderOnScheduleDropdownService,
                DialogContainerService,
                ComponentRef,
                EnumAsStringPipe,
                MicroServiceApiService,
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: 'toastrFactory', useValue: mockTostarfactory },
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                { provide: 'ProviderShowOnScheduleFactory', useValue: mockShowOnScheduleFactory },
                { provide: 'DialogRef', useValue: mockDialogService },
                { provide: 'SoarConfig', useValue: {} },
                { provide: BlueImagingService, useValue: mockBlueImagingService },
                { provide: ImagingMasterService, useValue: mockService },
                { provide: 'PatientMedicalHistoryAlertsFactory', useValue: mockPatientMedicalHistoryAlertsFactory },
                { provide: 'PersonFactory', useValue: mockPersonFactory },
                { provide: ReferralManagementHttpService, useValue: mockReferralManagementHttpService },
                { provide: 'PatientServices', useValue: mockPatientServices },
                { provide: PatientHttpService, useValue: mockPatientHttpService },
                { provide: PatientReferralPrintService, useValue: mockPatientReferralPrintService },
                { provide: 'referenceDataService', useValue: mockreferenceDataService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA], // Fix the schema issue
        }).compileComponents();
    });

  
  it('should render the Referrals Drawer View Component', async () => {
    await render(ReferralsDrawerViewComponent, {
      componentProperties: {
        editAccessToolTipText:'',
      }
    });
  });
  

  it('should display Referral In information', async () => {
    await render(ReferralsDrawerViewComponent, {
      componentProperties: {
        editAccessToolTipText:'',
      }
    });
    expect(screen.getByText('Referral In -')).toBeTruthy();
    // expect(screen.getByText('Referral To: John Doe')).toBeTruthy();
  });

  it('should display Referral Out information', async () => {
    await render(ReferralsDrawerViewComponent, {
      componentProperties: {
        editAccessToolTipText:'',
      }
    });
    expect(screen.getByText('Referral Out -')).toBeTruthy();
    // expect(screen.getByText('Referral from: Jane Smith')).toBeTruthy();
  });

  it('should have Edit, Print, and Delete buttons', async () => {
    await render(ReferralsDrawerViewComponent, {
      componentProperties: {
        editAccessToolTipText: '',
      }
    });

    const editButtons = screen.getAllByText('Edit');
    const printButtons = screen.getAllByText('Print');
    const deleteButtons = screen.getAllByText('Delete');

    expect(editButtons.length).toBeGreaterThan(0);
    expect(printButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);

    expect(editButtons).toBeTruthy();
    expect(printButtons).toBeTruthy();
    expect(deleteButtons).toBeTruthy();

  });

    it('should open dialog on clicking buttons', async () => {

        const { fixture } = await render(ReferralsDrawerViewComponent);

        const componentInstance = fixture.componentInstance;
        componentInstance.hasDeleteAccess = true;
        componentInstance.hasAddAccess = true;

        var del = screen.getAllByText('Delete');
        fireEvent.click(del[0]);

        expect(mockDialogService.open).toHaveBeenCalled();

        var addBtn = screen.getByText('Add Referral');
        fireEvent.click(addBtn);

        expect(mockDialogService.open).toHaveBeenCalled();

    });
});
