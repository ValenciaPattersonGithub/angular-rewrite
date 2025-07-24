import { TestBed } from '@angular/core/testing';
import { GridOperationService } from './grid-operation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DatePipe } from '@angular/common';
import { ActiveTabService } from './active-tab.service';
import { PatientLandingGridService } from '../common/http-providers/patient-landing-grid.service';

const mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);

const mockModalFactory = {
  ConfirmModal: jasmine.createSpy().and.callFake(() => {
    return {
      then(callback) {
        callback();
      }
    };
  })
};

const mockToastrFactory = {
  success: jasmine.createSpy('toastrFactory.success'),
  error: jasmine.createSpy('toastrFactory.error')
};

const mockRequest = {
  "CurrentPage": 0,
  "PageCount": 50,
  "FilterCriteria": {
    "BirthMonths": [
      "-1"
    ],
    "IsActive": [
      "true"
    ],
    "IsPatient": [
      "true"
    ],
    "LastCommunicationDate": null,
    "LocationId": 6606192,
    "NextAppointmentDate": null,
    "PatientDateOfBirth": null,
    "PatientName": "",
    "PreventiveCareDueDate": null,
    "PreviousAppointmentDate": null,
    "ResponsiblePartyName": "",
    "TreatmentPlanTotalBalance": "",
    "HasUnreadCommunication": false
  },
  "SortCriteria": {
    "LastCommunicationDate": 0,
    "NextAppointmentDate": 0,
    "PatientDateOfBirth": 0,
    "PatientName": 0,
    "PreventiveCareDueDate": 0,
    "PreviousAppointmentDate": 0,
    "ResponsiblePartyName": 0,
    "TreatmentPlanTotalBalance": 0
  }
};

const mockUrl = 'https://TEST-Fuse-Service-2-api.practicemgmt-TEST.pattersondevops.com';

const mockColums = [
  {
    "field": "name",
    "title": "Name",
    "type": "text",
    "sortable": true,
    "filterable": true,
    "width": 150
  },
  {
    "field": "dob",
    "title": "Date of Birth",
    "type": "date",
    "sortable": true,
    "filterable": true,
    "width": 85
  },
  {
    "field": "responsibleParty",
    "title": "Responsible Party",
    "type": "text",
    "sortable": true,
    "filterable": true,
    "width": 100
  }
];

const mockAttributesToDisplay = [
  "PatientName",
  "PatientDateOfBirth",
  "ResponsiblePartyName",
  "PreviousAppointmentDate",
  "NextAppointmentDate",
  "PreventiveCareDueDate",
  "TreatmentPlanTotalBalance",
  "LastCommunicationDate"
];

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
  Rows: []
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
}

const mockActiveTabService = {
  transformPatientData: jasmine.createSpy()
}

describe('GridOperationService', () => {
  let service: GridOperationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [DatePipe,
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: 'ModalFactory', useValue: mockModalFactory },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: ActiveTabService, useValue: mockActiveTabService },
        { provide: PatientLandingGridService, useValue: mockPatientLandingGridService },
      ]
    });
    service = TestBed.inject(GridOperationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchDataAndSetLayout', () => {
    it('should call apiCall and setPrintLayout', () => {
      const apiCall = mockPatientLandingGridService.getAllPatients;
      const request = mockRequest;
      const url = mockUrl;
      const gridTab = 'All Patients List';
      const columns = mockColums;
      const attributesToDisplay = [];
      const selectedLocation = {
        "NameLine1": "66 (MST)",
        "LocationId": 6606192
      };
      service.fetchDataAndSetLayout(apiCall, request, url, gridTab, columns, attributesToDisplay, selectedLocation);
      expect(apiCall).toHaveBeenCalled();
      expect(service.allPatientRowsData).toEqual(mockAllPatientsApiResponse.Rows);
    });
  });

  describe('setPrintLayout -> ', () => {
    beforeEach(() => {
      window.open = jasmine.createSpy().and.returnValue({
        document: {
          open: () => { }
        },
        print: () => { }
      });
    });

    it('should set print layout and open window for PDF download for All Patients badge', () => {
      service.allPatientRowsData = mockColums;
      service.attributesToDisplay = mockAttributesToDisplay;
      const currentTab = 'All Patients List';
      const selectedLocation = {
        "NameLine1": "66 (MST)",
        "LocationId": 6606192
      };

      service.setPrintLayout(currentTab, mockAttributesToDisplay, selectedLocation);
      expect(service.allPatientRowsData).toEqual(mockColums);
    })
  })

});
