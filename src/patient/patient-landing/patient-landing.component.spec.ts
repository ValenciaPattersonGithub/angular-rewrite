import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PatientLandingComponent } from './patient-landing.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BadgeFilterType, PatientLocation } from '../common/models/patient-location.model';
import { PatientLandingGridService } from '../common/http-providers/patient-landing-grid.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { LocationsDisplayService } from 'src/practices/common/providers/locations-display.service';
import { LocationTimeService } from 'src/practices/common/providers';
import { DialogContainerService, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { PatientExportModalComponent } from './patient-export-modal/patient-export-modal.component';
import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { BadgeCSVFileName, CommonColumnsFields, PatientBadgeTabType, PatientSortField } from '../common/models/enums/patient.enum';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PatientService } from '../common/http-providers/patient.service';
import { CsvHelper } from 'src/@shared/providers/csv-helper.service';
import { MailingLabelPrintService } from 'src/@shared/providers/mailing-label-print.service';
import { TemplatePrintService } from 'src/@shared/providers/template-print.service';
import { SendMailingModalComponent } from './send-mailing-modal/send-mailing-modal.component';
import { PatientFilterService } from '../service/patient-filter.service';
import { TextFilterType } from '../common/models/patient-grid-filter.model';
import { AppointmentStatus, AppointmentStatusDataService } from 'src/scheduling/appointment-statuses';
import { ActiveTabService } from '../service/active-tab.service';
import { AllPatientsGridData, AppointmentGridData, IGridHelper, IGridNumericHelper, IPrintMailingHelper, OtherToDoGridData, PreventiveCareGridData, TreatmentPlansGridData } from '../service/grid-helper.service';
import { GridOperationService } from '../service/grid-operation.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { Sanitizer } from '@angular/core';


const mockPatientsResponse = {
  Count: null, ExtendedStatusCode: null, InvalidProperties: null,
  Value: {
    CurrentPage: 0,
    PageCount: 50,
    PreferredLocation: [],
    PreferredDentists: [],
    PreferredHygienists: [],
    PatientLocationZipCodes: [],
    AdditionalIdentifiers: [],
    GroupTypes: [],
    PerformanceCounter: {},
    Rows: [
      {
        PatientId: '0',
        PatientName: 'Test Patient',
        IsActive: true,
        IsPatient: true
    }],
    FilterCriteria: {
      AdditionalIdentifiers: null,
      AppointmentStatus: null,
      AppointmentStatusList: null,
      BirthMonths: ['-1'],
      BusinessDays: null,
      DeletedReason: null,
      GroupTypes: null,
      HasInsurance: null,
      HasUnreadCommunication: false,
      IsActive: ['true'],
      IsNoDueDate: null,
      IsPatient: ['true'],
      IsScheduled: null,
      LastCommunicationFrom: null,
      LastCommunicationTo: null,
      LocationId: 1583,
      NextAppointmentDateFrom: null,
      NextAppointmentDateTo: null,
      PatientDateOfBirthFrom: null,
      PatientDateOfBirthTo: null,
      PatientName: "",
      PreferredDentists: null,
      PreferredHygienists: null,
      PreferredLocation: null,
      PreventiveCareDueDateFrom: null,
      PreventiveCareDueDateTo: null,
      PreventiveCareIsScheduled: null,
      PreviousAppointmentDateFrom: null,
      PreviousAppointmentDateTo: null,
      ReminderStatus: null,
      ResponsiblePartyName: "",
      TreatmentPlanCountTotalTo: 0,
      TreatmentPlanStates: null,
      ZipCodes: null
    },
    SortCriteria: {
      LastCommunicationDate: 0,
      NextAppointmentDate: 0,
      PatientDateOfBirth: 0,
      PatientName: 0,
      PreventiveCareDueDate: 0,
      PreviousAppointmentDate: 0,
      ResponsiblePartyName: 0,
      TreatmentPlanTotalBalance: 0
    }
  }
};

const mockAllPatientsApiResponse = {
  Result: mockPatientsResponse,
  Rows:[]
}

const txPlanHoverMock = {
  PatientId : "33f243d5-a4df-40fd-9e86-99d0c8c072c6",
  TreatmentPlanId: "5ece562f-6f0f-459b-a354-b7dcc2380752",
  TreatmentPlanName: "Treatment Plan",
  TreatmentPlanCreatedDate: "2023-03-13T07:48:30.8131223",
  TreatmentPlanStatus: "Accepted",
  TreatmentPlanTotalBalance: 28
};

const responseBlockData = {
  locations: [
      {
          LocationId : 6606192,
          NameLine1: "66",
          NameLine2: null,
          NameAbbreviation: "Loremt555ze3",
          ImageFile: null,
          LogoFile: null,
          Website: null,
          Timezone: "Mountain Standard Time",
          DeactivationTimeUtc: null,
          AddressLine1: "df",
          AddressLine2: null,
          City: "Los Angeles",
          State: "AK",
          ZipCode: "543234445",
          Email: null,
          PrimaryPhone: null,
          SecondaryPhone: null,
          Fax: null,
          TaxId: null,
          TypeTwoNpi: null,
          TaxonomyId: null,
          LicenseNumber: null,
          ProviderTaxRate: 0.009,
          SalesAndUseTaxRate: 0.01,
          DefaultFinanceCharge: 3,
          AccountsOverDue: "30",
          MinimumFinanceCharge: null,
          Rooms: [],
          AdditionalIdentifiers: [],
          IsRxRegistered: false,
          PracticeId: 38638,
          DateModified: "0001-01-01T00:00:00",
          UserModified: "00000000-0000-0000-0000-000000000000",
          DataTag: "System.Byte[]"
      }
  ],
  appointment: {
      Appointment: {
          AppointmentId: "9b5a9b03-4169-4b1b-b48d-21a4aba385f2",
          AppointmentTypeId: "aa03d7b8-21ba-4354-86bc-e0934047e09c",
          PersonId: "ee2d796a-f081-490f-9494-b6b5d83b2a56",
          TreatmentRoomId: "50c983c2-0d9b-4b11-a47e-e65dd41f3dc9",
          UserId: "51993996-42bc-460d-be99-164539544dd6",
          Classification: 0,
          Description: "Appointment on 3/1/2022",
          Note: "Note: sbdjohocqjbbtvnouxfg",
          StartTime: "2022-03-01T09:30:00",
          EndTime: "2022-03-01T10:15:00",
          ActualStartTime: null,
          ActualEndTime: null,
          ProposedDuration: null,
          Status: 5,
          StatusNote: "StatusNote: teazvnymouuomrpdntai",
          ReminderMethod: 0,
          ExaminingDentist: "d2513fc5-6063-4891-aaa7-51546bb3a90f",
          IsExamNeeded: true,
          ProviderAppointments: [],
          PlannedServices: [],
          IsDeleted: false,
          IsBeingClipped: false,
          DeletedReason: null,
          IsSooner: false,
          IsPinned: false,
          LocationId: 5316664,
          LocationTimezoneInfo: null,
          MissedAppointmentTypeId: null,
          DataTag: "AAAAAAAIo8Y=",
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
          DateModified: "2022-05-02T14:32:24.4734425",
          ObjectState: "123",
          Location: {
            LocationId : 6606192,
          }
      } 
  }
}

const mockPreventiveCareResponse = {
  Count: null, ExtendedStatusCode: null, InvalidProperties: null,
  Value: {
    CurrentPage: 0,
    PageCount: 50,
    PreferredLocation: [],
    PreferredDentists: [],
    PreferredHygienists: [],
    GroupTypes: [],
    PerformanceCounter: {},
    Rows: [
      {
        AppointmentDuration: null,
        AppointmentEndTime: null,
        AppointmentStartTime: null,
        HasUnreadCommunication: false,
        IsActive: true,
        IsPatient: true,
        LastCommunicationDate: "2024-01-23T11:47:04.3330822",
        NextAppointmentDate: "2024-01-25T18:00:00",
        NextAppointmentDuration: 10,
        NextAppointmentEndTime: "2024-01-25T18:10:00",
        NextAppointmentId: "a56a9509-4f7c-4d01-a212-967b99471437",
        NextAppointmentStartTime: "2024-01-25T18:00:00",
        NextAppointmentTimezone: "Central Standard Time",
        NextAppointmentType: null,
        PatientAccountId: "e3e5a7db-cfda-4109-b9bc-5b0495b3b681",
        PatientDateOfBirth: "1970-01-01T00:00:00",
        PatientId: "68c72780-78e6-49e4-8a93-16a861407baa",
        PatientName: "mohan jr, jagan b",
        PreventiveCareDueDate: "2024-09-23T00:00:00",
        PreviousAppointmentDate: null,
        PreviousAppointmentId: null,
        PreviousAppointmentTimezone: null,
        PreviousAppointmentType: null,
        ResponsiblePartyId: "68c72780-78e6-49e4-8a93-16a861407baa",
        ResponsiblePartyName: "mohan jr, jagan b",
        TreatmentPlanCount: 1,
        TreatmentPlanTotalBalance: 500,
        UnreadEmailCount: 0,
        UnreadSmsCount: 0
      }
    ],
    FilterCriteria: {
      AdditionalIdentifiers: null,
      Due30: false,
      Due60: false,
      DueInFuture: false,
      DueLess30: false,
      DueOver90: false,
      GroupTypes: null,
      HasUnreadCommunication: false,
      IsActive: [
        true
      ],
      IsPatient: [
        true
      ],
      LastCommunicationFrom: null,
      LastCommunicationTo: null,
      LocationId: 5053276,
      NextAppointmentDateFrom: null,
      NextAppointmentDateTo: null,
      PatientDateOfBirthFrom: null,
      PatientDateOfBirthTo: null,
      PatientName: "",
      PreferredDentists: null,
      PreferredHygienists: null,
      PreventiveCareDueDateFrom: null,
      PreventiveCareDueDateTo: null,
      PreventiveCareIsScheduled: null,
      PreviousAppointmentDateFrom: null,
      PreviousAppointmentDateTo: null,
      ResponsiblePartyName: "",
      TreatmentPlanCountTotalFrom: 0,
      TreatmentPlanCountTotalTo: 0

    },
    SortCriteria: {
      LastCommunicationDate: 0,
      NextAppointmentDate: 0,
      PatientDateOfBirth: 0,
      PatientName: 0,
      PreventiveCareDueDate: 0,
      PreviousAppointmentDate: 0,
      ResponsiblePartyName: 0,
      TreatmentPlanTotalBalance: 0
    }
  }
};


const gropupDataRes: PatientLocation[] = [
  {
    PatientLocationId: null,
    PatientId: null,
    LocationId: 5303660,
    IsPrimary: null,
    PatientActivity: null,
    ObjectState: null,
    FailedMessage: null,
    DataTag: "AAAAAAALpY0=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2022-06-03T17:29:27.6216702",
    DeactivationTimeUtc: "2022-06-06T04:00:00+00:00",
    NameLine1: "Location5303660Practice38638_fl15 (Timezone Abbreviation) - 06/06/2022",
    LocationStatus: "Inactive",
    GroupOrder: 3,
    Timezone: "Mountain Standard Time",
    Value: []
  },
  {
    PatientLocationId: null,
    PatientId: null,
    LocationId: 6606192,
    IsPrimary: null,
    PatientActivity: null,
    ObjectState: null,
    FailedMessage: null,
    DataTag: "AAAAAAAskks=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2023-08-11T11:36:03.8049194",
    DeactivationTimeUtc: null,
    NameLine1: "66 (Timezone Abbreviation)",
    LocationStatus: "Active",
    GroupOrder: 1,
    Timezone: "Mountain Standard Time",
    Value: []
  },
  {
    PatientLocationId: null,
    PatientId: null,
    LocationId: 6280157,
    IsPrimary: null,
    PatientActivity: null,
    ObjectState: null,
    FailedMessage: null,
    DataTag: "AAAAAB1NsdY=",
    UserModified: "229ab3ec-5822-493e-9e53-d2f06b95aba3",
    DateModified: "2023-06-14T18:04:03.5221365",
    DeactivationTimeUtc: "2029-06-04T18:30:00+00:00",
    NameLine1: "Anglers (PDT) - 06/05/2029",
    LocationStatus: "Pending Inactive",
    GroupOrder: 2,
    Timezone: "Mountain Standard Time",
    Value: []
  }
];

const mockData = {
  name: "Anthony, Emanuel",
  dob: "01/18/1960    (Age: 64)",
  responsibleParty: "Anthony, Emanuel",
  lastAppt: "Crown Bridge Prep 01/10/2022",
  nextAppt: "N/A",
  preventiveCare: "N/A",
  treatmentPlans: "(0)$0.00",
  lastCommunication: "",
  patientId: "bc7bb7c4-a44f-442d-a45f-9b0744aa8956",
  responsiblePartyId: "bc7bb7c4-a44f-442d-a45f-9b0744aa8956",
  patientAccountId: "bc7bb7c4-a44f-442d-a45f-9b0744aa8956",
  nextAppointmentId: null,
  previousAppointmentId: "feb84cc5-2907-44a2-b4b6-9bd311df0bd9",
  appointmentStartTime: "2022-01-10T17:45:00",
  appointmentEndTime: "2022-01-10T18:30:00",
  previousAppointmentStartTime: '2022-09-01T11:45:00.0000000-05:00',
  previousAppointmentEndTime: '2022-09-01T01:30:00.0000000-05:00',
  nextAppointmentStartTime: "2022-01-10T17:45:00",
  nextAppointmentEndTime: "2022-01-10T18:30:00",
  previousAppointmentTimezone: "Central Standard Time",
  nextAppointmentTimezone: null,
  appointmentDate: "N/A N/A",
  dueDate: "N/A",
  otherStatus: "Incomplete",
  otherLastAppt: "Crown Bridge Prep 01/10/2022",
  appointmentDuration: 45,
  nextAppointmentDuration: null,
  isActivePatient: true
};

describe('PatientLandingComponent', () => {
  let component: PatientLandingComponent;
  let fixture: ComponentFixture<PatientLandingComponent>;
  let dialogService: DialogService;
  let csvHelper: CsvHelper;
  let patientService: PatientService;
  let activeTabService: ActiveTabService<IGridHelper & IGridNumericHelper & IPrintMailingHelper>;
  let gridOperationService: GridOperationService;
let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;

  const mockDialogRes = {
    PatientMailing: false,
    PatientEmail: false,
    PatientPrimaryPhone: false,
    PatientHomePhone: false,
    PatientMobilePhone: false,
    PatientWorkPhone: false,
    ResponsibleMailing: false,
    ResponsibleEmail: false,
    ResponsiblePrimaryPhone: false,
    ResponsibleHomePhone: false,
    ResponsibleMobilePhone: false,
    ResponsibleWorkPhone: false
  }

  const mockExportToCSVFile = {
    Value: {
      CsvRows: [
        "Name,Date of Birth,Age,Responsible Party,Last Appt,Last Appt Type,Next Appt,Next Appt Type,Preventive Care Due Date,Treatment Plans,Last Communication,Pt Address 1,Pt Address 2,Pt City,Pt State,Pt Zipcode,Pt Email,Pt Primary Phone,Pt Home Phone,Pt Mobile Phone,Pt Work Phone,RP Address 1,RP Address 2,RP City,RP State,RP Zipcode,RP Email,RP Primary Phone,RP Home Phone,RP Mobile Phone,RP Work Phone\r\n",
        "\"a'Z-A.z a'Z-A.z a'Z- imtkvuuclnbqgwtjhuwd\",09/01/1995,28,\"a'Z-A.z a'Z-A.z a'Z- imtkvuuclnbqgwtjhuwd\",N/A,N/A,N/A,N/A,N/A,\"(0) $0.00\",N/A,US,Us,Alaska,AK,26921,a@ass.com,1213311313,1213311313,,,US,Us,Alaska,AK,26921,a@ass.com,1213311313,1213311313,,\r\n",
        "\"lorem9999 lorem9999\",N/A,N/A,\"N/A\",N/A,N/A,N/A,N/A,N/A,\"(0) $0.00\",N/A,,,,,,,,,,,,,,,,,,,,\r\n"
      ]
    },
  };

  const mockLocationServices = {
    getPermittedLocations: () => {
      return {
        $promise: {
          then: (res, error) => {
            res({ Result: [] }),
              error({
                data: {
                  InvalidProperties: [{
                    PropertyName: "",
                    ValidationMessage: ""
                  }]
                }
              })
          }
        }
      }
    }
  };

  const getLocationObj = {
    $$hashKey: "object:39",
    deactivationTimeUtc: null,
    description: "Pract  001",
    id: 6296981,
    merchantid: "",
    name: "Aabb test (CDT)",
    practiceid: 38638,
    sort: 1,
    status: "Active",
    timezone: "Central Standard Time"
  }

  const mockLocationService = {
    getActiveLocations: jasmine.createSpy().and.returnValue([]),
    getCurrentLocation: jasmine.createSpy('LocationService.getCurrentLocation').and.returnValue(getLocationObj)
  };

  const mockTimeZoneFactory = {
    GetTimeZoneAbbr: jasmine.createSpy(),
    ConvertDateTZ: jasmine.createSpy()
  };

  const rootScope = {
    patAuthContext: {
      userInfo: {
        UserId: '1234'
      }
    },
    $on: jasmine.createSpy().and.returnValue(mockLocationService.getCurrentLocation),
    $broadcast: jasmine.createSpy().and.callThrough()
  }

  const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };

  const mockAppointmentViewVisibleService = {
    changeAppointmentViewVisible: jasmine.createSpy(),
    setAppointmentViewVisible: jasmine.createSpy(),
    setSecondaryAppointmentViewVisible: jasmine.createSpy(),
    registerObserver: jasmine.createSpy(),
    clearObserver: jasmine.createSpy()
  };

  const mockAppointmentViewLoadingService = {
    currentAppointmentSaveResult: jasmine.createSpy('AppointmentViewLoadingService.currentAppointmentSaveResult').and.returnValue({
      then: function (callback) {
        callback(true);
      }
    }),
    afterSaveEvent: jasmine.createSpy()
  };

  const mockservice = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
    isEnabled: () => new Promise(() => { }),
  };

  const mockFeatureService = {
    isEnabled: jasmine.createSpy('FeatureService.isEnabled').and.returnValue({
      then: function (callback) {
        callback(true);
      }
    }),
  };
  const PatientCountUpdate = {
    length: 1,
    name: "updateCount"
  }

  const mockPatientCountFactory = {
    getCount: jasmine.createSpy('FeatureService.isEnabled').and.returnValue({
      update: jasmine.createSpy().and.returnValue(PatientCountUpdate)
    }),
  }

  const mockSoarConfig = {
    domainUrl: 'https://localhost:35440',
  }

  const getCount = {
    allPatients: 1037,
    appointments: 622,
    loading: false,
    otherToDo: 9,
    preventiveCare: 3,
    treatmentPlans: 189
  }

  const mockPatientLandingGridService = {
    getAllPatients: jasmine.createSpy().and.returnValue({
      then: (res, error) => {
        res(mockAllPatientsApiResponse),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "",
                ValidationMessage: ""
              }]
            }
          })
      }
    }),
    getAllPreventiveCare: jasmine.createSpy().and.returnValue({
      then: (res, error) => {
        res({ Result: mockPreventiveCareResponse }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "",
                ValidationMessage: ""
              }]
            }
          })
      }
    }),
    getAllTreatmentPlans: jasmine.createSpy().and.returnValue({
      then: (res, error) => {
        res({ Result: mockPatientsResponse }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "",
                ValidationMessage: ""
              }]
            }
          })
      }
    }),
    getAllToDo: jasmine.createSpy().and.returnValue({
      then: (res, error) => {
        res({ Result: mockPatientsResponse }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "",
                ValidationMessage: ""
              }]
            }
          })
      }
    }),
    getAllAppointments: jasmine.createSpy().and.returnValue({
      then: (res, error) => {
        res({ Result: mockPatientsResponse }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "",
                ValidationMessage: ""
              }]
            }
          })
      }
    }),
    updatePatientCount: jasmine.createSpy().and.returnValue({
      then: (res, error) => {
        res({ Result: getCount }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "",
                ValidationMessage: ""
              }]
            }
          })
      }
    }),
  }

  const mockAppointmentViewDataLoadingService = {
    getViewData: jasmine.createSpy().and.callFake(() => {
      return of({});
    }),
    getBlockDataFromOutSideOfTheSchedule: jasmine.createSpy().and.callFake(() => {
      return of({});
    })
    };


  const mockTabLauncher = {
    launchNewTab: jasmine.createSpy()
  }

  const mockUibModal = {
    open: jasmine.createSpy()
  }

  const mockNewLocationsService = {
    locations: jasmine.createSpy().and.callFake((array) => {
      return {
        then(callback) {
          callback(array);
        }
      };
    })
  }

  const mockModalDataFactory = {
    GetCheckoutModalData: jasmine.createSpy().and.callFake((array) => {
      return {
        then(callback) {
          callback(array);
        }
      };
    }),
    GetBlockEditData: jasmine.createSpy().and.callFake((array) => {
      return {
        then(callback) {
          callback(array);
        }
      };
    })
  }

  const mockScheduleModalFactory = {
    ScheduleBlockModal: jasmine.createSpy().and.callFake((array) => {
      return {
        then(callback) {
          callback(array);
        }
      };
    })
  }

  const mockCurrencyPipe = new CurrencyPipe('en_US', 'USD');

  const mockLocationsDisplayService = jasmine.createSpyObj('LocationsDisplayService', ['setLocationDisplayText']);



  const mockPatientServices = {
    Patients: {
      get: jasmine.createSpy().and.callFake((array) => {
        return {
          then(callback) {
            callback(array);
          }
        };
      })
    },
    MailingLabel: {
      GetMailingLabelPatient: jasmine.createSpy().and.returnValue({
        $promise: {
          then: (res) => {
            res(true)
          }
        }
      }),
      GetMailingLabelAppointment: jasmine.createSpy().and.returnValue({
        $promise: {
          then: (res) => {
            res(true)
          }
        }
      }),
      GetMailingLabelTreatment: jasmine.createSpy().and.returnValue({
        $promise: {
          then: (res) => {
            res(true)
          }
        }
      }),
      GetMailingLabelPreventive: jasmine.createSpy().and.returnValue({
        $promise: {
          then: (res) => {
            res(true)
          }
        }
      })
    },
    TreatmentPlanHover: {
      get: jasmine.createSpy().and.returnValue({
        $promise: {
          then: (res) => {
            res(true)
          }
        }
      })
    },
  }

  const patientLocationAuthorization = { authorization: { UserIsAuthorizedToAtLeastOnePatientLocation: false } };
  const res = { Value: [] };

  const mockPatientValidationFactory = {
    PatientSearchValidation: jasmine.createSpy('PatientValidationFactory.PatientSearchValidation').and.returnValue({
      then(callback) {
        callback(patientLocationAuthorization);
      }
    }),
    LaunchPatientLocationErrorModal: jasmine.createSpy('PatientValidationFactory.LaunchPatientLocationErrorModal').and.returnValue({
      then(callback) {
        callback(res);
      }
    }),
  };

  const personResult = { Value: {
    PatientId : "33f243d5-a4df-40fd-9e86-99d0c8c072c6",
    FirstName: "Braylen",
    MiddleName: null,
    LastName: "Aceved",
    PreferredName: null,
    Prefix: null,
    Suffix: null,
    AddressReferrerId: null,
    AddressReferrer: null,
    AddressLine1: "4 West Rodriguez St",
    } 
  };

  const mockPersonFactory = {
    getById: jasmine.createSpy('PersonFactory.getById').and.returnValue({
      then: function (callback) {
        callback(personResult);
      }
    }),
  };

  const mockDialogRef = {
    close: () => { },
    open: () => { },
    content: {
      instance: {
        title: '',
      }
    },
  };

  const mockMailingLabelService = {
    getPrintHtml: jasmine.createSpy().and.returnValue({})
  }

  const mockTemplatePrintService = {
    getPrintHtml: jasmine.createSpy().and.returnValue({}),
    printBulkLetterPatient: jasmine.createSpy().and.returnValue({
      then: (success, error) => {
        success(res),
          error({})
      }
    }),
    PrintBulkPostcardPatient: jasmine.createSpy().and.returnValue({
      then: (success, error) => {
        success(res),
          error({})
      }
    }),
    PrintBulkLetterAppointment: jasmine.createSpy().and.returnValue({
      then: (success, error) => {
        success(res),
          error({})
      }
    }),
    PrintBulkPostcardAppointment: jasmine.createSpy().and.returnValue({
      then: (success, error) => {
        success(res),
          error({})
      }
    }),
    PrintBulkLetterTreatment: jasmine.createSpy().and.returnValue({
      then: (success, error) => {
        success(res),
          error({})
      }
    }),
    PrintBulkPostcardTreatment: jasmine.createSpy().and.returnValue({
      then: (success, error) => {
        success(res),
          error({})
      }
    }),
    PrintBulkLetterPreventive: jasmine.createSpy().and.returnValue({
      then: (success, error) => {
        success(res),
          error({})
      }
    }),
    PrintBulkPostcardPreventive: jasmine.createSpy().and.returnValue({
      then: (success, error) => {
        success(res),
          error({})
      }
    }),
    bindHtml: jasmine.createSpy().and.returnValue({}),
    failure: jasmine.createSpy().and.returnValue({})
  }

  const mocklocationTimeService = {
    getTimeZoneAbbr: jasmine.createSpy().and.returnValue('CDT'),
    toUTCDateKeepLocalTime: jasmine.createSpy(),
    convertDateTZ: jasmine.createSpy()    
  }

  const mockModalFactory = {
    ConfirmModal: jasmine.createSpy().and.callFake(() => {
      return {
        then(callback) {
          callback();
        }
      };
    })
  };

  const mockMailingRes = {
    communicationTypeId: 1,
    communicationTemplateId: null,
    isPrintMailingLabel: false,
    isPostcard: false,
    dataGrid: {}
  }

  const mockPatientFilterService = {
    CurrentPage: 0,
  }

  const mockAppointmentFilterList: AppointmentStatus[] = [{ description: 'test', id: 1, icon: 'test', sectionEnd: true, visibleInPatientGrid: true, descriptionNoSpace: '', descriptionTranslation: '' }];
  const mockAppointmentStatusDataService = {
    getAppointmentStatuses: () => { },
    getAppointmentStatusesForPatientGrid: jasmine.createSpy().and.returnValue(mockAppointmentFilterList),
  }

  const mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);

    beforeEach(async () => {
    mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
    mockFeatureFlagService.getOnce$.and.returnValue(of(false));
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [DialogContainerService, DialogService, FormBuilder, DatePipe,
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'LocationServices', useValue: mockLocationServices },
        { provide: 'locationService', useValue: mockLocationService },
        { provide: 'patSecurityService', useValue: mockservice },
        { provide: '$rootScope', useValue: rootScope },
        { provide: 'FeatureService', useValue: mockFeatureService },
        { provide: 'AppointmentViewVisibleService', useValue: mockAppointmentViewVisibleService },
        { provide: 'AppointmentViewLoadingService', useValue: mockAppointmentViewLoadingService },
        { provide: 'TimeZoneFactory', useValue: mockTimeZoneFactory },
        { provide: 'PatientCountFactory', useValue: mockPatientCountFactory },
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: PatientLandingGridService, useValue: mockPatientLandingGridService },
        { provide: 'AppointmentViewDataLoadingService', useValue: mockAppointmentViewDataLoadingService },
        { provide: 'tabLauncher', useValue: mockTabLauncher },
        { provide: '$uibModal', useValue: mockUibModal },
        { provide: 'NewLocationsService', useValue: mockNewLocationsService },
        { provide: 'ModalDataFactory', useValue: mockModalDataFactory },
        { provide: 'ScheduleModalFactory', useValue: mockScheduleModalFactory },
        { provide: CurrencyPipe, useValue: mockCurrencyPipe },
        { provide: LocationsDisplayService, useValue: mockLocationsDisplayService },
        { provide: 'PatientServices', useValue: mockPatientServices },
        { provide: 'PatientValidationFactory', useValue: mockPatientValidationFactory },
        { provide: 'PersonFactory', useValue: mockPersonFactory },
        { provide: LocationTimeService, useValue: mocklocationTimeService },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: MailingLabelPrintService, useValue: mockMailingLabelService },
        { provide: TemplatePrintService, useValue: mockTemplatePrintService },
        { provide: 'ModalFactory', useValue: mockModalFactory },
        { provide: TranslateService, usevalue: mockTranslateService },        
        { provide: PatientFilterService, usevalue: mockPatientFilterService },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
        { provide: AppointmentStatusDataService, useValue: mockAppointmentStatusDataService },   
        { provide: Sanitizer, useValue: {sanitize: (context, path) => path }},
        CsvHelper, PatientService, ActiveTabService, GridOperationService
      ],
      declarations: [PatientLandingComponent, PatientExportModalComponent]
    })
      .compileComponents();
  });

    beforeEach(() => {

    fixture = TestBed.createComponent(PatientLandingComponent);
    dialogService = TestBed.inject(DialogService);
    csvHelper = TestBed.inject(CsvHelper);
    patientService = TestBed.inject(PatientService);
    activeTabService = TestBed.inject(ActiveTabService);
    gridOperationService = TestBed.inject(GridOperationService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', async () => {
    beforeEach(() => {
        spyOn(component, 'getLocations').and.callFake(() => { });
        mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
        mockFeatureFlagService.getOnce$.and.returnValue(of(true));
    });

    it('should call getLocations ', () => {
      const getTabList = spyOn(component, 'getTabList');
      component.ngOnInit();
      expect(component.getLocations).toHaveBeenCalled();
      expect(getTabList).toHaveBeenCalled();
      expect(component.selectedLocation).toEqual({ NameLine1: 'Aabb test (CDT)', LocationId: 6296981 })
    });

    it('should set Active Tab filter', () => {
      component.activeFltrTab = BadgeFilterType.AllPatients
      spyOn(component, 'setActiveTab');
      component.ngOnInit();
      expect(component.setActiveTab).toHaveBeenCalledWith(BadgeFilterType.AllPatients);
    });

    it('should trigger method on location changed', () => {
      window.location.hash = "#/patient/#%2fallpatients"
      spyOn(component, 'onLocationChange');
      component.ngOnInit();
      expect(component.onLocationChange).toHaveBeenCalledWith(window.location.hash);
    });
  });

  describe('setActiveTab ->', () => {
    beforeEach(() => {
      spyOn(activeTabService, 'setActiveTab').and.callThrough();
    });
  
    it('should create a PreventiveCareGridData object and call setActiveTab with it when tabIndex is PreventiveCare', () => {
      component.setActiveTab(BadgeFilterType.PreventiveCare);
      expect(activeTabService.setActiveTab).toHaveBeenCalledWith(jasmine.any(PreventiveCareGridData));
    });
  
    it('should create a TreatmentPlansGridData object and call setActiveTab with it when tabIndex is TreatmentPlans', () => {
      component.setActiveTab(BadgeFilterType.TreatmentPlans);
      expect(activeTabService.setActiveTab).toHaveBeenCalledWith(jasmine.any(TreatmentPlansGridData));
    });

    it('should create a ToDoGridData object and call setActiveTab with it when tabIndex is ToDo', () => {
      component.setActiveTab(BadgeFilterType.otherToDo);
      expect(activeTabService.setActiveTab).toHaveBeenCalledWith(jasmine.any(OtherToDoGridData));
    });

    it('should create a AppointmentsGridData object and call setActiveTab with it when tabIndex is Appointments', () => {
      component.setActiveTab(BadgeFilterType.Appointments);
      expect(activeTabService.setActiveTab).toHaveBeenCalledWith(jasmine.any(AppointmentGridData));
    });
    
    it('should create an AllPatientsGridData object and call setActiveTab with it when tabIndex is not recognized', () => {
      component.setActiveTab(-1);
      expect(activeTabService.setActiveTab).toHaveBeenCalledWith(jasmine.any(AllPatientsGridData));
    });
  });

  describe('onLocationChange ->', () => {
    //not able to test $rootScope.$on('patCore:initlocation')
  });

  describe('authAccess ->', () => {
    //not able to test window.location.href 
  });

  describe('getLocationSuccess ->', () => {
    it('should get selected value on getLocationSuccess', () => {
      component.getLocationSuccess([]);
      expect(component.selectedLocation).toEqual({ NameLine1: 'Aabb test (CDT)', LocationId: 6296981 })
    });
  });

  describe('GetLocationFailed', () => {
    it('should display an error toast', () => {
      component.GetLocationFailed();
      expect(mockToastrFactory.error).toHaveBeenCalledWith('Failed to retrieve locations');
    });
  });

  describe('selectedLocationChanged ->', () => {
    it('should update patient count if LocationId is not null', () => {
      const LocationId = 6296981 ;
      const getCount = spyOn(component, 'getAllBadgesCount');
      component.selectedLocationChanged(LocationId);
      expect(getCount).toHaveBeenCalled();
    });

    it('should update patient count and call necessary services when LocationId is not null', () => {
      const collapseAll = spyOn(activeTabService, 'collapseAll');
      spyOn(component, 'getTabList');
      spyOn(component, 'fetchAndLoadGridData');
      const LocationId = 6296981;
      component.selectedLocationChanged(LocationId);
      expect(collapseAll).toHaveBeenCalled();
      expect(component.fetchAndLoadGridData).toHaveBeenCalled();
    });

    it('should not call any services when LocationId is null', () => {
      const collapseAll = spyOn(activeTabService, 'collapseAll');
      spyOn(component, 'getTabList');
      spyOn(component, 'fetchAndLoadGridData');
      const LocationId = null;
      component.selectedLocationChanged(LocationId);
      expect(collapseAll).not.toHaveBeenCalled();
      expect(component.getTabList).not.toHaveBeenCalled();
      expect(component.fetchAndLoadGridData).not.toHaveBeenCalled();
    });
  });

  describe('onBadgeChanged ->', () => {
    it('should set activeFltrTab event value', () => {
      const badgeIndex = 2;
      spyOn(component, 'resetSlideOutFilterCriteria');
      component.onBadgeChanged(badgeIndex);
      expect(component.activeFltrTab).toBe(badgeIndex);
    });

    it('should call hideDiv when hideMenu is false', () => {
      const badgeIndex = 2;
      component.hideMenu = false;
      const hideDiv = spyOn(component, 'hideDiv');
      component.onBadgeChanged(badgeIndex);
      expect(hideDiv).toHaveBeenCalled();
    });
  });

  describe('scrollToTop ->', () => {
    it('should scroll to the top when scrollToTop is called', () => {
      const scrollSpy = spyOn(window, 'scroll');
      component.scrollToTop();
      expect(scrollSpy).toHaveBeenCalledWith({ top: 0 });
    });
  });

  describe('onClose ->', () => {
    it('should hideDiv method on scroll ', () => {
      const hideDiv = spyOn(component, 'hideDiv');
      component.onClose();
      expect(hideDiv).toHaveBeenCalled();
    });
  });

  describe('addAPerson ->', () => {
    //window.location.href so unable to test
  });
  describe('addAFamily ->', () => {
    //window.location.href so unable to test
  });

  describe('filterUnreadCommunication ->', () => {
    it('should toggle filterUnreadCommunication botton', () => {
      component.isUnreadCommunication = true;
      component.setUnreadCommunicationFilter = jasmine.createSpy();
      component.fetchAndLoadGridData = jasmine.createSpy();
      component.filterUnreadCommunication();
      expect(component.setUnreadCommunicationFilter).toHaveBeenCalled();
      expect(component.fetchAndLoadGridData).toHaveBeenCalled();
    });
  });

  describe('exportCSV ->', () => {
    it('should call export with PatientBadgeTabType.Appointments if activeFltrTab is BadgeFilterType.Appointments', () => {
      component.activeGridData = { FilterCriteria: { LocationId: 123 } };
      const exportSpy = spyOn(component, 'export');
      component.activeFltrTab = BadgeFilterType.Appointments;
      component.exportCSV();
      expect(component.activeGridData?.FilterCriteria?.LocationId).toBe(component.selectedLocation.LocationId)
      expect(component.csvFileName).toEqual(BadgeCSVFileName.Appointments);
      expect(exportSpy).toHaveBeenCalledWith(PatientBadgeTabType.Appointments);
    });
    it('should call export with PatientBadgeTabType.AllPatients if activeFltrTab is BadgeFilterType.AllPatients', () => {
      const exportSpy = spyOn(component, 'export');
      component.activeFltrTab = BadgeFilterType.AllPatients;
      component.exportCSV();
      expect(component.csvFileName).toEqual(BadgeCSVFileName.AllPatients);
      expect(exportSpy).toHaveBeenCalledWith(PatientBadgeTabType.AllPatients);
    });
    it('should call export with PatientBadgeTabType.otherToDo if activeFltrTab is BadgeFilterType.otherToDo', () => {
      const exportSpy = spyOn(component, 'export');
      component.activeFltrTab = BadgeFilterType.otherToDo;
      component.exportCSV();
      expect(component.csvFileName).toEqual(BadgeCSVFileName.OtherToDo);
      expect(exportSpy).toHaveBeenCalledWith(PatientBadgeTabType.OtherToDo);
    });
    it('should call export with PatientBadgeTabType.TreatmentPlans if activeFltrTab is BadgeFilterType.TreatmentPlans', () => {
      const exportSpy = spyOn(component, 'export');
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.exportCSV();
      expect(component.csvFileName).toEqual(BadgeCSVFileName.TreatmentPlans);
      expect(exportSpy).toHaveBeenCalledWith(PatientBadgeTabType.TreatmentPlans);
    });
    it('should call export with PatientBadgeTabType.PreventiveCare if activeFltrTab is BadgeFilterType.PreventiveCare', () => {
      const exportSpy = spyOn(component, 'export');
      component.activeFltrTab = BadgeFilterType.PreventiveCare;
      component.exportCSV();
      expect(component.csvFileName).toEqual(BadgeCSVFileName.PreventiveCare);
      expect(exportSpy).toHaveBeenCalledWith(PatientBadgeTabType.PreventiveCare);
    });
  });

  describe('export ->', () => {
    it('should call dialogService.open with the correct arguments', () => {
      const openSpy = spyOn(dialogService, 'open');
      component.export(PatientBadgeTabType.AllPatients);
      expect(document.body.style.overflow).toBe('hidden');
      expect(openSpy).toHaveBeenCalledWith({
        appendTo: component.containerRef, content: PatientExportModalComponent,
        width: 'auto', height: 'auto'
      });
    });

    it('should call exportToCSVFileWithContactInfo and handle success response', () => {
      mockDialogRes.PatientEmail = true;
      spyOn(dialogService, 'open').and.returnValue({ content: { instance: {} }, result: of(mockDialogRes) });

      spyOn(patientService, 'exportToCSVFileWithContactInfo').and.returnValue(Promise.resolve(mockExportToCSVFile));
      spyOn(component, 'exportSuccess');
      spyOn(activeTabService, 'hasContactInfo').and.returnValue(true); // Ensure hasContactInfo returns true

      component.export(PatientBadgeTabType.AllPatients);

      expect(dialogService.open).toHaveBeenCalled();
      expect(activeTabService.hasContactInfo).toHaveBeenCalledWith(mockDialogRes);
      expect(patientService.exportToCSVFileWithContactInfo).toHaveBeenCalled();
    });

    it('should call ExportToCSVFile if response.PatientMailing is not undefined and hasContactInfo returns false', () => {
      spyOn(dialogService, 'open').and.returnValue({ content: { instance: {} }, result: of(mockDialogRes) });
      spyOn(patientService, 'exportToCSVFile').and.returnValue(Promise.resolve(mockExportToCSVFile));
      spyOn(component, 'exportSuccess');
      spyOn(activeTabService, 'hasContactInfo').and.returnValue(false);

      component.export(PatientBadgeTabType.AllPatients);

      expect(dialogService.open).toHaveBeenCalled();
      expect(activeTabService.hasContactInfo).toHaveBeenCalledWith(mockDialogRes);
      expect(patientService.exportToCSVFile).toHaveBeenCalled();
    });
  });

  describe('exportSuccess ->', () => {
    it('should call downloadCsvFile with the correct arguments', () => {
      const csv = mockExportToCSVFile.Value.CsvRows.join('');
      spyOn(csvHelper, 'downloadCsvFile');

      component.exportSuccess(mockExportToCSVFile);

      expect(csvHelper.downloadCsvFile).toHaveBeenCalledWith(csv, component.csvFileName);
    });
  });

  describe('exportFailure ->', () => {
    it('should call toastrFactory.error', () => {
      component.exportFailure();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('printMailinglabels ->', () => {
    let dialogConfig;
    beforeEach(() => {
      component.disableMailing = false;
      component.disablePrint = false;
      dialogConfig = {
        appendTo: component.mailingContainerRef,
        content: SendMailingModalComponent,
        width: '44%',
        height: '89%'
      };
      spyOn(dialogService, 'open').and.returnValue({ content: { instance: {} }, result: of(mockMailingRes) });
    })

    it('should open dialog with correct parameters', () => {
      spyOn(activeTabService, 'setPrintMailingLabel')
      component.printMailinglabels();
      expect(dialogService.open).toHaveBeenCalledWith(dialogConfig);
      expect(activeTabService.setPrintMailingLabel).toHaveBeenCalledWith(mockMailingRes, component.activeGridData);
    });
    it('should not called setPrintMailingLabel method when disableMailing & disablePrint is True', () => {
      component.disableMailing = true;
      component.disablePrint = true;
      spyOn(activeTabService, 'setPrintMailingLabel')
      component.printMailinglabels();
      expect(dialogService.open).not.toHaveBeenCalled();
      expect(activeTabService.setPrintMailingLabel).not.toHaveBeenCalled();
    });
  });

  describe('allRequestLocationUpdate ->', async () => {
    it('should update location id in all requests', () => {
      const locationId = gropupDataRes[0].LocationId;
      component.allRequestLocationUpdate(locationId);
      expect(component.allPatientRequest.FilterCriteria.LocationId).toEqual(locationId);
      expect(component.preventiveCareRequest.FilterCriteria.LocationId).toEqual(locationId);
      expect(component.treatmentPlansRequest.FilterCriteria.LocationId).toEqual(locationId);
      expect(component.appointmentRequest.FilterCriteria.LocationId).toEqual(locationId);
      expect(component.OtherToDoRequest.FilterCriteria.LocationId).toEqual(locationId);
    });
  });

  describe('onAppointmentViewVisibleChange ->', () => {
    it('should update visibility and broadcast event correctly', () => {
      const isVisible = false;
      const isSecondaryVisible = false;
      component.onAppointmentViewVisibleChange(isVisible, isSecondaryVisible);
      expect(component.isAppointmentViewVisible).toEqual(isVisible);
      expect(component.isSecondaryAppointmentViewVisible).toEqual(isSecondaryVisible);
    });

    it('should update visibility when no data', () => {
      const isVisible = true;
      const isSecondaryVisible = true;
      const data = null || undefined;
      mockAppointmentViewLoadingService.currentAppointmentSaveResult = data;
      component.onAppointmentViewVisibleChange(isVisible, isSecondaryVisible);
      expect(component.isAppointmentViewVisible).toEqual(isVisible);
      expect(component.isSecondaryAppointmentViewVisible).toEqual(isSecondaryVisible);
    });
  });

  describe('hideDiv ->', () => {
    it('should toggle state and update properties when hideMenu is true', () => {
      component.hideMenu = true;
      component.hideDiv();
      expect(component.hideMenu).toBe(false);
      expect(component.grdWidth).toBe('80%');
      expect(component.overflow).toBe('scroll');
      expect(component.slideOutText).toBe('Hide Filters');
    });

    it('should toggle state and update properties when hideMenu is false', () => {
      component.hideMenu = false;
      component.hideDiv();
      expect(component.hideMenu).toBe(true);
      expect(component.grdWidth).toBe('100%');
      expect(component.overflow).toBe('hidden');
      expect(component.slideOutText).toBe('Show Filters');
    });
  });

  describe('createAppointment ->', () => {
    const tmpAppt = {
      AppointmentId: null,
      AppointmentTypeId: null,
      Classification: 2,
      EndTime: null,
      PersonId: "001",
      PlannedServices: [],
      ProposedDuration: 15,
      ProviderAppointments: [],
      ServiceCodes: [],
      StartTime: null,
      TreatmentRoomId: null,
      UserId: null,
      WasDragged: false,
      Location: { LocationId: 6296981 },
      LocationId: 6296981,
      ObjectState: "Add",
      Person: {},
    };

    it('should create an appointment and load view data successfully', async () => {
      const getViewDataSpy = mockAppointmentViewDataLoadingService.getViewData.and.returnValue(Promise.resolve());
      component.createAppointment("001");
      expect(getViewDataSpy).toHaveBeenCalledWith(tmpAppt, false, null);
    });

    it('should call toastrFactory.error when getViewData fails', () => {
      const error = new Error('Ran into a problem loading the appointment');
      const getViewDataSpy = mockAppointmentViewDataLoadingService.getViewData.and.returnValue(Promise.reject(error));
      component.createAppointment("001");
      expect(getViewDataSpy).toHaveBeenCalledWith(tmpAppt, false, null);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('retrieveData ->', () => {
    it('should retrieve and show block appointment data', fakeAsync(() => {
      const appointmentId = 'blockAppointmentId';
      const accountId = '00012233';
      const classification = '1';
      const getBlockDataFromOutSideOfTheScheduleSpy = mockAppointmentViewDataLoadingService.getBlockDataFromOutSideOfTheSchedule.and.returnValue(Promise.resolve('blockAppointmentData'));

      spyOn(component, 'showAppointmentModal');
      component.retrieveData(appointmentId, accountId, classification);
      tick();
      expect(getBlockDataFromOutSideOfTheScheduleSpy).toHaveBeenCalledWith(appointmentId);
      expect(component.showAppointmentModal).toHaveBeenCalledWith('blockAppointmentData');
    }));

    it('should call toastrFactory.error when getBlockDataFromOutSideOfTheSchedule method fails', () => {
      const appointmentId = 'blockAppointmentId';
      const accountId = '00012233';
      const classification = '1';
      const error = new Error('Ran into a problem loading the appointment');
      const getBlockDataFromOutSideOfTheScheduleSpy = mockAppointmentViewDataLoadingService.getBlockDataFromOutSideOfTheSchedule.and.returnValue(Promise.reject(error));

      component.retrieveData(appointmentId, accountId, classification);
      expect(getBlockDataFromOutSideOfTheScheduleSpy).toHaveBeenCalledWith(appointmentId);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });

    it('should retrieve and show regular appointment data', fakeAsync(() => {
      const appointmentId = 'regularAppointmentId';
      const accountId = '00012233';
      const classification = '2';
      const getViewDataSpy = mockAppointmentViewDataLoadingService.getViewData.and.returnValue(Promise.resolve());
      const changeAppointmentViewVisibleSpy = mockAppointmentViewVisibleService.changeAppointmentViewVisible.and.returnValue(Promise.resolve());

      component.retrieveData(appointmentId, accountId, classification);
      tick();
      expect(getViewDataSpy).toHaveBeenCalled();
      expect(changeAppointmentViewVisibleSpy).toHaveBeenCalled();
    }));

    it('should handle null appointmentId', () => {
      const appointmentId = null;
      const accountId = '00012233';
      const classification = '1';
      const getBlockDataFromOutSideOfTheScheduleSpy = mockAppointmentViewDataLoadingService.getBlockDataFromOutSideOfTheSchedule.and.returnValue(Promise.resolve());
      const getViewDataSpy = mockAppointmentViewDataLoadingService.getViewData.and.returnValue(Promise.resolve());

      component.retrieveData(appointmentId, accountId, classification);
      expect(getBlockDataFromOutSideOfTheScheduleSpy).toHaveBeenCalled();
      expect(getViewDataSpy).toHaveBeenCalled();
    });

    it('should call toastrFactory.error when getViewData method fails', () => {
      const appointmentId = 'regularAppointmentId';
      const accountId = '00012233';
      const classification = '2';
      const error = new Error('Ran into a problem loading the appointment');
      const getViewDataSpy = mockAppointmentViewDataLoadingService.getViewData.and.returnValue(Promise.reject(error));

      component.retrieveData(appointmentId, accountId, classification);
      expect(getViewDataSpy).toHaveBeenCalled();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getAppointmentModalDataSuccess ->', () => {
    it('should call ScheduleBlockModal with correct data', () => {
      const appointmentEditData = { id: 1, name: 'Test' };
      const ScheduleBlockModalSpy = mockScheduleModalFactory.ScheduleBlockModal.and.returnValue(Promise.resolve());
      component.getAppointmentModalDataSuccess(appointmentEditData);
      expect(ScheduleBlockModalSpy).toHaveBeenCalledWith(appointmentEditData, false);
    });
  });

  describe('getClass ->', () => {
    it('should call getTxClass with the correct argument', () => {
      const status = 'Status';
      spyOn(activeTabService, 'getTxClass').and.callThrough();
  
      component.getClass(status);
  
      expect(activeTabService.getTxClass).toHaveBeenCalledWith(status);
    });
  });

  describe('patientGridData ->', () => {
    beforeEach(() => {
      spyOn(activeTabService, 'transformPatientData').and.callThrough();
    });
    it('should transform the patient data and update patientData when response contains Rows', () => {
      const response = { Rows: [{}] };
      component.patientGridData(response);
  
      expect(activeTabService.transformPatientData).toHaveBeenCalledWith(response.Rows[0], false);
      expect(component.patientData).toEqual([jasmine.any(Object)]);
    });
  
    it('should merge the transformed patient data with the existing patientData when response contains Rows and isCalledFromPatientGrid is true', () => {
      const response = { Rows: [{}] };
      component.patientData = [{}];
      component.patientGridData(response, true);
  
      expect(activeTabService.transformPatientData).toHaveBeenCalledWith(response.Rows[0], false);
      expect(component.patientData).toEqual([jasmine.any(Object), jasmine.any(Object)]);
    });
  
    it('should set patientData to an empty array when response does not contain Rows', () => {
      const response = {};
      component.patientGridData(response);
  
      expect(component.patientData).toEqual([]);
    });
  });

  describe('getAppointmentModalDataFailed ->', () => {
    it('should display an error toast on getAppointmentModalDataFailed', () => {
      component.getAppointmentModalDataFailed();
      expect(mockToastrFactory.error).toHaveBeenCalledWith('Failed to retrieve locations');
    });
  });

  describe('showAppointmentTooltip ->', () => {
    it('should return empty when no field or data is there', () => {
      const result = '';
      const field = '';
      const data = {};
      component.showAppointmentTooltip(data, field);
      expect(result).toBe('');
    });

    it('should generate tooltip for LastAppt field', () => {
      const field = CommonColumnsFields?.LastAppt;
      const result = '11:45 am - 12:30 pm CST (45m)';
      const data = {
        startTime: '11:45 am',
        endTime: '12:30 pm',
        timezoneAbbreviation: 'CST',
        timeDifference: 45,
        appointmentStartTime: '2021-09-01T11:45:00.0000000-05:00',
        appointmentEndTime: '2021-09-01T12:30:00.0000000-05:00',
      }
      component.showAppointmentTooltip(mockData, field);

      const expResult = data.startTime + ' - ' + data.endTime + ' ' + data.timezoneAbbreviation + ' (' + data.timeDifference + 'm)';
      expect(result).toBe(expResult);
    });

  });

  describe('setNormalLayout -> ',() => {
    it('should set normal layout for print', () => {
      component.setNormalLayout();

      expect(component.allPatientRequest.PageCount).toEqual(50);
      expect(component.preventiveCareRequest.PageCount).toEqual(50);
      expect(component.treatmentPlansRequest.PageCount).toEqual(50);
      expect(component.appointmentRequest.PageCount).toEqual(50);
      expect(component.OtherToDoRequest.PageCount).toEqual(50);
      expect(component.allPatientRequest.CurrentPage).toEqual(0);
      expect(component.preventiveCareRequest.CurrentPage).toEqual(0);
      expect(component.treatmentPlansRequest.CurrentPage).toEqual(0);
      expect(component.appointmentRequest.CurrentPage).toEqual(0);
      expect(component.OtherToDoRequest.CurrentPage).toEqual(0);
    })
  })
  
  describe('printGrid -> ',() => {
    beforeEach(function () {
      window.open = jasmine.createSpy().and.returnValue({
        document: {
          open: () => {}
        },
        print: () => {}
      });
    });
    it('should set layout as per active filter tab AllPatients', () => {
      component.activeFltrTab = BadgeFilterType.AllPatients;
      const spyFetchDataAndSetLayout = spyOn(gridOperationService,'fetchDataAndSetLayout')
      
      component.printGrid();
      expect(spyFetchDataAndSetLayout).toHaveBeenCalled();
      expect(mockPatientLandingGridService.getAllPatients).toHaveBeenCalled();
    });

    it('should set layout as per active filter tab Appointments', () => {
      component.activeFltrTab = BadgeFilterType.Appointments;
      component.printGrid();

      expect(mockPatientLandingGridService.getAllAppointments).toHaveBeenCalled();
    });

    it('should set layout as per active filter tab PreventiveCare', () => {
      component.activeFltrTab = BadgeFilterType.PreventiveCare;
      component.printGrid();

      expect(mockPatientLandingGridService.getAllPreventiveCare).toHaveBeenCalled();
    });

    it('should set layout as per active filter tab TreatmentPlans', () => {
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.printGrid();

      expect(mockPatientLandingGridService.getAllTreatmentPlans).toHaveBeenCalled();
    });

    it('should set layout as per active filter tab otherToDo', () => {
      component.activeFltrTab = BadgeFilterType.otherToDo;
      component.printGrid();

      expect(mockPatientLandingGridService.getAllToDo).toHaveBeenCalled();
    });

    it('should not set layout when invalid active filter type is passed', () => {
      component.activeFltrTab = 10 as BadgeFilterType;
      const spyfetchDataAndSetLayout = spyOn(gridOperationService,'fetchDataAndSetLayout')
      spyOn(component,'setNormalLayout')
      
      component.printGrid();

      expect(spyfetchDataAndSetLayout).not.toHaveBeenCalled();
      expect(component.setNormalLayout).toHaveBeenCalled();
    });
    it('setNormalLayout should not called when disablePrint is true', () => {
      component.disablePrint = true;
      spyOn(component,'setNormalLayout');
      component.printGrid();
      expect(component.setNormalLayout).not.toHaveBeenCalled();
    });
  })

  describe('setUnreadCommunicationFilter ->', () => {
    it('should false set unread communication filter', () => {
      component.activeFltrTab = BadgeFilterType.AllPatients;
      component.setUnreadCommunicationFilter(false);
      expect(component.allPatientRequest.FilterCriteria.HasUnreadCommunication).toBe(false);

      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.setUnreadCommunicationFilter(false);
      expect(component.treatmentPlansRequest.FilterCriteria.HasUnreadCommunication).toBe(false);

      component.activeFltrTab = BadgeFilterType.PreventiveCare;
      component.setUnreadCommunicationFilter(false);
      expect(component.preventiveCareRequest.FilterCriteria.HasUnreadCommunication).toBe(false);

      component.activeFltrTab = BadgeFilterType.Appointments;
      component.setUnreadCommunicationFilter(false);
      expect(component.appointmentRequest.FilterCriteria.HasUnreadCommunication).toBe(false);
    });
  })

  describe('showAppointmentModal ->', () => {
  
    it('should set the correct properties and call the correct methods', () => {
      component.showAppointmentModal(responseBlockData);
      expect(responseBlockData.appointment.Appointment.ObjectState).toEqual('None');
      expect(mockModalDataFactory.GetBlockEditData).toHaveBeenCalled();
    });

    it('should set location id when Appointment.LocationId not null', () => {
      responseBlockData.appointment.Appointment.LocationId = null;
      component.showAppointmentModal(responseBlockData);
      expect(mockModalDataFactory.GetBlockEditData).toHaveBeenCalled();
    });
  });

  describe('navToPatientProfile ->', () => {
  
    it('should not call any methods when personId is falsy', () => {
      component.navToPatientProfile('33f243d5-a4df-40fd-9e86-99d0c8c072c6');
      expect(mockPersonFactory.getById).toHaveBeenCalled();
    });
    
    it('should call any methods when patientInfo is null', () => {
      mockPersonFactory.getById.and.returnValue(Promise.resolve({ Value: null }));
      component.navToPatientProfile('33f243d5-a4df-40fd-9e86-99d0c8c072c6'); 
      expect(mockPatientValidationFactory.PatientSearchValidation).toHaveBeenCalled();
    });
  });

  describe('resetFilterCriteria ->', () => {
    it('should call setUnreadCommunicationFilter with false', () => {
      spyOn(component, 'setUnreadCommunicationFilter');
      spyOn(component, 'resetSlideOutFilterCriteria');
      spyOn(component, 'fetchAndLoadGridData');
      component.resetFilterCriteria();
      expect(component.setUnreadCommunicationFilter).toHaveBeenCalledWith(false);
      expect(component.resetSlideOutFilterCriteria).toHaveBeenCalled();
      expect(component.fetchAndLoadGridData).toHaveBeenCalled();
    });
  });
  describe('resetSlideOutFilterCriteria ->', () => {
    it('should call expandCollapseFilter and collapseAllPanels when patientSlideout is truthy', () => {
      component.patientSlideout = jasmine.createSpyObj('patientSlideout', ['expandCollapseFilter', 'collapseAllPanels']);
      component.resetSlideOutFilterCriteria();
      expect(component.patientSlideout.expandCollapseFilter).toHaveBeenCalled();
      expect(component.patientSlideout.collapseAllPanels).toHaveBeenCalled();
    });
    it('should call not call removeSlideOutFilter method when allPatientRequest is null', () => {
      component.activeFltrTab = BadgeFilterType.AllPatients;
      component.allPatientRequest = null;
      spyOn(component, 'removeSlideOutFilter');
      component.patientSlideout = jasmine.createSpyObj('patientSlideout', ['expandCollapseFilter', 'collapseAllPanels']);
      component.resetSlideOutFilterCriteria();
      expect(component.removeSlideOutFilter).not.toHaveBeenCalled();
    });
  });

  describe('filterGrid ->', () => {

    beforeEach(() => {
      spyOn(component, 'getRequestByFilterType').and.returnValue({});
      spyOn(activeTabService, 'slideOutFilterChange').and.callThrough();
      spyOn(component, 'getGridRecordsByTab').and.callThrough();
    });
  
    it('should reset CurrentPage, call slideOutFilterChange with the correct arguments, and call getGridRecordsByTab', () => {
      const filter = {};
  
      component.filterGrid(filter);
  
      expect(activeTabService.slideOutFilterChange).toHaveBeenCalledWith(jasmine.any(Object), filter);
      expect(component.getGridRecordsByTab).toHaveBeenCalled();
    });
  });

  describe('navToAppointment ->', () => {
    it('should call retrieveData with correct arguments when appointmentId is not "00000000-0000-0000-0000-000000000000"', () => {
      const appointmentId = "479141b1-2cd1-472f-9d92-56ab244a5bbb";
      const accountId = "b44c7456-0a0b-46f4-8236-3c60341673be";
      const classification = 'test';
      spyOn(component, 'retrieveData');
  
      component.navToAppointment(appointmentId, accountId, classification);
      expect(component.retrieveData).toHaveBeenCalledWith(appointmentId, accountId, classification);
    })

    it('should call retrieveData with correct arguments when appointmentId is "00000000-0000-0000-0000-000000000000"', () => {
      const appointmentId = "00000000-0000-0000-0000-000000000000";
      const accountId = "b44c7456-0a0b-46f4-8236-3c60341673be";
      const classification = 'test';
      spyOn(component, 'retrieveData');
  
      component.navToAppointment(appointmentId, accountId, classification);
      expect(component.retrieveData).not.toHaveBeenCalled();
    })
  })

  describe('openModal ->', () => {
    it('should open modal with correct path when tabIdentifier is 5', () => {
      const patientId = "33f243d5-a4df-40fd-9e86-99d0c8c072c6";
      const tabIdentifier = 5;
      const expectedPath = `#/Patient/${String(patientId)}/Communication/?withDrawerOpened=true&tabIdentifier=${String(tabIdentifier)}`;
  
      component.openModal(patientId, tabIdentifier, true);
      expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith(expectedPath);
    });
  
    it('should open modal with correct path when patientCommunication is false', () => {
      const patientId = '123';
      const tabIdentifier = 1;
      const expectedPath = `#/Patient/${String(patientId)}/Communication/?withDrawerOpened=true&tabIdentifier=${String(tabIdentifier)}&communicationType=-1`;
  
      component.openModal(patientId, tabIdentifier, false);
      expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith(expectedPath);
    });

    it('should open modal with correct path when patientCommunication is false', () => {
      const patientId = '123';
      const tabIdentifier = 1;
      const expectedPath = `#/Patient/${String(patientId)}/Communication/?withDrawerOpened=true&tabIdentifier=${String(tabIdentifier)}&communicationType=-1`;
  
      component.openModal(patientId, tabIdentifier, false);
      expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith(expectedPath);
    });

    it('should open modal with correct path when patientCommunication is true', () => {
      const patientId = '123';
      const tabIdentifier = 1;
      const expectedPath = `#/Patient/${String(patientId)}/Communication/`;
  
      component.openModal(patientId, tabIdentifier, true);
      expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith(expectedPath);
    });
  })

  describe('displayTxPlans ->', () => {
    it('should call txPlanHover when transactionPlanHoverData[curpatientId] is defined', () => {
      const mockEvent = { pageX: 952, pageY: 567 };
      const patientId = '33f243d5-a4df-40fd-9e86-99d0c8c072c6';
      component.transactionPlanHoverData[patientId] = 'testData';
      spyOn(component, 'txPlanHover');

      component.displayTxPlans(mockEvent, patientId);
      expect(component.mouseX).toEqual(942);
      expect(component.mouseY).toEqual(512);
      expect(component.txPlanHover).toHaveBeenCalledWith(component.transactionPlanHoverData[patientId]);
    });
  
    it('should call get with correct arguments and handle promise when transactionPlanHoverData[curpatientId] is undefined', () => {
      const testEvent = { pageX: 952, pageY: 567 };
      const patientId = '33f243d5-a4df-40fd-9e86-99d0c8c072c6';
      component.transactionPlanHoverData[patientId] = undefined;
      spyOn(component, 'getTxPlanHoverSuccess');
      component.displayTxPlans(testEvent, patientId);
      mockPatientServices.TreatmentPlanHover.get(patientId).$promise.then((res) => {
        expect(component.getTxPlanHoverSuccess).toHaveBeenCalledWith(patientId, res);
      });
    });
  });

  describe('getTxPlanHoverSuccess ->', () => {
    it('should set transactionPlanHoverData[patientId] to provided data', () => {
      const patientId = '33f243d5-a4df-40fd-9e86-99d0c8c072c6';
      const testRes = { Value: txPlanHoverMock};
      spyOn(component, 'txPlanHover');
      component.getTxPlanHoverSuccess(patientId, testRes);
      expect(component.transactionPlanHoverData[patientId]).toEqual(testRes.Value);
      expect(component.txPlanHover).toHaveBeenCalledWith(testRes.Value);
    });
  });

  describe('getTxPlanHoverFailure  ->', () => {
    it('should call toastrFactory.error', () => {
      component.getTxPlanHoverFailure();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('txPlanHover ->', () => {
    it('should set txPlansHover to provided data', () => {
      component.txPlanHover([txPlanHoverMock]);
      expect(component.txPlansHover).toEqual([txPlanHoverMock]);
      expect(component.isMouseUp).toBeTruthy();
      expect(component.keepShow).toBeTruthy();
    });

    it('should update mouseY when toolTipHeight is greater than window.outerHeight - 100', () => {
      const txPlanHover = new Array(100).fill(txPlanHoverMock);
      component.mouseY = 500;
      spyOnProperty(window, 'outerHeight').and.returnValue(500);
      component.txPlanHover(txPlanHover);
      expect(component.mouseY).toBeLessThan(500);
    });
  })

  describe('hideTxPlans ->', () => {
    it('should set keepShow to false', () => {
      component.hideTxPlans();
      expect(component.keepShow).toBeFalsy();
    });
  });

  describe('hideHoverTip ->', () => {
    it('should set isMouseUp to false when keepShow value is true', () => {
      component.keepShow = false;
      component.hideHoverTip();
      expect(component.isMouseUp).toBeFalsy();
    });

    it('should not set isMouseUp value when keepShow value is true', () => {
      component.keepShow = true;
      component.isMouseUp  = true;
      component.hideHoverTip();
      expect(component.isMouseUp).toBeTruthy();
    });
  });

  describe('applyTextValueFilter ->', () => {
    beforeEach(() => {
      spyOn(component, 'getRequestByFilterType').and.returnValue(component.allPatientRequest);
      spyOn(component, 'getGridRecordsByTab').and.callThrough();
    });
  
    it('should update PatientName and call getGridRecordsByTab when field is Name', () => {
      const gridFilterText = { field: TextFilterType.Name, operator: 'Operator', value: 'Value' };
  
      component.applyTextValueFilter(gridFilterText);
  
      expect(component.getRequestByFilterType(component.activeFltrTab).FilterCriteria.PatientName).toBe(gridFilterText.value);
      expect(component.getGridRecordsByTab).toHaveBeenCalled();
    });
  
    it('should update ResponsiblePartyName and call getGridRecordsByTab when field is ResponsibleParty', () => {
      const gridFilterText = { field: TextFilterType.ResponsibleParty, operator: 'Operator', value: 'Value' };
  
      component.applyTextValueFilter(gridFilterText);
  
      expect(component.getRequestByFilterType(component.activeFltrTab).FilterCriteria.ResponsiblePartyName).toBe(gridFilterText.value);
      expect(component.getGridRecordsByTab).toHaveBeenCalled();
    });
  
    it('should update IsComplete and call getGridRecordsByTab when field is Status', () => {
      const gridFilterText = { field: TextFilterType.Status, operator: 'Operator', value: 'Value' };
  
      component.applyTextValueFilter(gridFilterText);
  
      expect(component.OtherToDoRequest.FilterCriteria.IsComplete).toBe(gridFilterText.value);
      expect(component.getGridRecordsByTab).toHaveBeenCalled();
    });
  });

  describe('getRequestByFilterType ->', () => {
    it('should return allPatientRequest when filterType is AllPatients', () => {
      const getRequestByFilterType =  component.getRequestByFilterType(BadgeFilterType.AllPatients)
      component.getRequestByFilterType(BadgeFilterType.AllPatients);
      expect(getRequestByFilterType).toBe(component.allPatientRequest);
    });
  
    it('should return preventiveCareRequest when filterType is PreventiveCare', () => {
      const getRequestByFilterType =  component.getRequestByFilterType(BadgeFilterType.PreventiveCare)
      component.getRequestByFilterType(BadgeFilterType.PreventiveCare);
      expect(getRequestByFilterType).toBe(component.preventiveCareRequest);
    });
  
    it('should return treatmentPlansRequest when filterType is TreatmentPlans', () => {
      const getRequestByFilterType =  component.getRequestByFilterType(BadgeFilterType.TreatmentPlans)
      component.getRequestByFilterType(BadgeFilterType.TreatmentPlans);
      expect(getRequestByFilterType).toBe(component.treatmentPlansRequest);
    });
  
    it('should return appointmentRequest when filterType is Appointments', () => {
      const getRequestByFilterType =  component.getRequestByFilterType(BadgeFilterType.Appointments)
      component.getRequestByFilterType(BadgeFilterType.Appointments);
      expect(getRequestByFilterType).toBe(component.appointmentRequest);
    });
  
    it('should return OtherToDoRequest when filterType is otherToDo', () => {
      const getRequestByFilterType =  component.getRequestByFilterType(BadgeFilterType.otherToDo)
      component.getRequestByFilterType(BadgeFilterType.otherToDo);
      expect(getRequestByFilterType).toBe(component.OtherToDoRequest);
    });
  
    it('should return null when filterType is not recognized', () => {
      const badgeFilterType = { AllPatients: 10, PreventiveCare: 2, TreatmentPlans: 3, Appointments: 4, otherToDo: 5 };
      expect(component.getRequestByFilterType(badgeFilterType.AllPatients)).toBe(null);
    });
  });

  describe('applyDateRangeFilter ->', () => {

    beforeEach(() => {
      spyOn(component, 'getRequestByFilterType').and.returnValue(component.allPatientRequest);
      spyOn(activeTabService, 'dateRangeFilter').and.callThrough();
      spyOn(component, 'getGridRecordsByTab').and.callThrough();
    });
  
    it('should call dateRangeFilter with the correct arguments and call getGridRecordsByTab when dateFieldType is not null', () => {
      const response = { data: { startDate: new Date(), endDate: new Date() }, dateFieldType: 'DateFieldType' };
  
      component.applyDateRangeFilter(response);
  
      expect(activeTabService.dateRangeFilter).toHaveBeenCalledWith(component.allPatientRequest, response.data, response.dateFieldType);
      expect(component.getGridRecordsByTab).toHaveBeenCalled();
    });

    it('should not call dateRangeFilter & getGridRecordsByTab when dateFieldType is null', () => {
      const response = null;
  
      component.applyDateRangeFilter(response);
  
      expect(activeTabService.dateRangeFilter).not.toHaveBeenCalled();
      expect(component.getGridRecordsByTab).not.toHaveBeenCalled();
    });
  });

  describe('applyNumericRangeFilter ->', () => {

    beforeEach(() => {
      spyOn(component, 'getRequestByFilterType').and.returnValue(component.allPatientRequest);
      spyOn(activeTabService, 'numericRangeFilter').and.callThrough();
      spyOn(component, 'getGridRecordsByTab').and.callThrough();
    });

    it('should call numericRangeFilter with the correct arguments and call getGridRecordsByTab when data is not null', () => {
      const data = { from: 1, to: 10 };
      component.applyNumericRangeFilter(data);
  
      expect(activeTabService.numericRangeFilter).toHaveBeenCalledWith(component.allPatientRequest, data);
      expect(component.getGridRecordsByTab).toHaveBeenCalled();
    });

    it('should not call numericRangeFilter & getGridRecordsByTab method when data is null', () => {
      const data = null;
      component.applyNumericRangeFilter(data);
  
      expect(activeTabService.numericRangeFilter).not.toHaveBeenCalled();
      expect(component.getGridRecordsByTab).not.toHaveBeenCalled();
    });
  });

  describe('applyAppointmentStatusFilter ->', () => {
    it('should set AppointmentStatus and call getGridRecordsByTab', () => {
      const mockAppoinmentStatus = { selectedStatus: 1, field: 'testField' };
      spyOn(component, 'getGridRecordsByTab');
      component.applyAppointmentStatusFilter(mockAppoinmentStatus);
      expect(component.appointmentRequest.FilterCriteria.AppointmentStatus).toEqual(mockAppoinmentStatus.selectedStatus.toString());
      expect(component.getGridRecordsByTab).toHaveBeenCalled();
    });

    it('should set appointmentRequest when appointmentRequest.FilterCriteria is null', () => {
      const mockAppoinmentStatus = { selectedStatus: 1, field: 'testField' };
      component.appointmentRequest = null;
      spyOn(component, 'getGridRecordsByTab');
      component.applyAppointmentStatusFilter(mockAppoinmentStatus);
      expect(component.getGridRecordsByTab).toHaveBeenCalled();
    });
  });

  describe('navToPatientTxPlan ->', () => {
    it('should set isMouseUp to false', () => {
      component.navToPatientTxPlan('123', '456');
      expect(component.isMouseUp).toBeFalsy();
    });
  
    it('should call launchNewTab with correct argument when personId is not "null"', () => {
      const personId = '33f243d5-a4df-40fd-9e86-99d0c8c072c6';
      const treatmentPlanId = '456';
      const expectedRoute = `#/Patient/${personId}/Clinical?activeExpand=2&txPlanId=${treatmentPlanId}`;
      component.navToPatientTxPlan(personId, treatmentPlanId);
      expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith(expectedRoute);
    });

    it('should not call launchNewTab when personId is "null"', () => {
      component.navToPatientTxPlan('null', '1');
      expect(mockTabLauncher.launchNewTab).not.toHaveBeenCalledWith('');
    });
  });

  describe('onScroll ->', () => {
    it('should not call getGridRecordsByTab when isScrolledToBottom returns true', () => {
      spyOn(activeTabService, 'isScrolledToBottom').and.returnValue(true);
      spyOn(component, 'getGridRecordsByTab');
      component.loading = false;
      component.totalCount = 100;
      component.patientData = new Array(50).fill('testData');
      mockPatientFilterService.CurrentPage = 9;
      component.maxPage = 10;
      component.onScroll(new Event('scroll'));
      expect(mockPatientFilterService.CurrentPage).toBeGreaterThan(0);
      expect(component.getGridRecordsByTab).toHaveBeenCalledWith(true);
    });

    it('should not call getGridRecordsByTab methid when loading is true', () => {
      component.loading = true;
      spyOn(component, 'getGridRecordsByTab');
      component.onScroll(new Event('scroll'));
      expect(component.getGridRecordsByTab).not.toHaveBeenCalled();
    });
  });

  describe('getSortedData ->', () => {
    it('should sort data based on filter type', () => {
      const sortData = { sortField: 'name', sortDirection: 1 };
  
      component.activeFltrTab = BadgeFilterType.AllPatients;
      component.getSortedData(sortData);
      expect(component.allPatientRequest.SortCriteria[PatientSortField[sortData.sortField]]).toBe(sortData.sortDirection);
  
      component.activeFltrTab = BadgeFilterType.PreventiveCare;
      component.getSortedData(sortData);
      expect(component.preventiveCareRequest.SortCriteria[PatientSortField[sortData.sortField]]).toBe(sortData.sortDirection);
  
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.getSortedData(sortData);
      expect(component.treatmentPlansRequest.SortCriteria[PatientSortField[sortData.sortField]]).toBe(sortData.sortDirection);
  
      component.activeFltrTab = BadgeFilterType.Appointments;
      component.getSortedData(sortData);
      expect(component.appointmentRequest.SortCriteria[PatientSortField[sortData.sortField]]).toBe(sortData.sortDirection);
  
      component.activeFltrTab = BadgeFilterType.otherToDo;
      component.getSortedData(sortData);
      expect(component.OtherToDoRequest.SortCriteria[PatientSortField[sortData.sortField]]).toBe(sortData.sortDirection);
    });
  });
})