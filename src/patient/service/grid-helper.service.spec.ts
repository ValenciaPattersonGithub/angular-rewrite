import { TranslateService } from "@ngx-translate/core";
import { PatientLandingGridService } from "../common/http-providers/patient-landing-grid.service";
import { AllPatientsGridData, AppointmentGridData, OtherToDoGridData, PreventiveCareGridData, TreatmentPlansGridData } from "./grid-helper.service";
import { PatientFilterService } from "./patient-filter.service";
import { LocationTimeService } from "src/practices/common/providers";
import { TemplatePrintService } from "src/@shared/providers/template-print.service";
import { MailingLabelPrintService } from "src/@shared/providers/mailing-label-print.service";
import { AllPatientGridFilter, AppointmentGridFilter, DateRangeFilterType, OtherToDoGridFilter, PreventiveCareGridFilter, TreatmentPlansGridFilter } from "../common/models/patient-grid-filter.model";
import { AllPatientRequest, AppointmentRequest, OtherToDoRequest, PreventiveCareRequest, TreatmentPlansRequest } from "../common/models/patient-grid-request.model";
import { AllPatientGridSort, AppointmentGridSort, OtherToDoGridSort, PreventiveGridSort, TreatmentGridSort } from "../common/models/patient-grid-sort.model";
import { PatientSortField } from "../common/models/enums/patient.enum";
import { PatientMailingInfo } from "src/@shared/models/send-mailing.model";


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
}
const mockDateTimeFields = ['PatientDateOfBirthFrom', 'PatientDateOfBirthTo'];
const mockPatientFilterService = {
  CurrentPage: 0,
  currentFilterCriteria: {},
  getDateTimeFields: jasmine.createSpy().and.returnValue(mockDateTimeFields),
}
const mocklocationTimeService = {
  getTimeZoneAbbr: jasmine.createSpy().and.returnValue('CDT'),
  toUTCDateKeepLocalTime: jasmine.createSpy(),
  convertDateTZ: jasmine.createSpy()
}
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
const res = { Value: [] };
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
const mockMailingLabelService = {
  getPrintHtml: jasmine.createSpy().and.returnValue({})
}
const mockPatientRquestObj = {
  CurrentPage: 0,
  PageCount: 50,
  FilterCriteria: {
    AppointmentStatusList: [""],
    BirthMonths: ["-1",],
    HasInsurance: [],
    IsActive: ["true"],
    IsPatient: ["true"],
    LastCommunicationDate: null,
    LocationId: 6606192,
    NextAppointmentDate: null,
    PatientDateOfBirth: null,
    PatientDateOfBirthFrom: null,
    PatientDateOfBirthTo: null,
    PatientName: "",
    PreventiveCareDueDate: null,
    PreviousAppointmentDate: null,
    ResponsiblePartyName: "",
    TreatmentPlanTotalBalance: ""
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
};
const mockOtherToDoRquestObj = {
  CurrentPage: 0,
  PageCount: 50,
  FilterCriteria: {
    LastCommunicationDate: null,
    LocationId: 6606192,
    NextAppointmentDate: "",
    PatientName: "a",
    PreviousAppointmentDate: "",
    ResponsiblePartyName: "",
    DueDateFrom: null,
    DueDateTo: null,

  },
  SortCriteria: {
    PatientName: 0,
    ResponsiblePartyName: 0,
    DueDate: 0,
    IsComplete: 0,
    PreviousAppointmentDate: 0,
    NextAppointmentDate: 0,
    LastCommunicationDate: 0
  }
};
const mockUrl = 'https://TEST-Fuse-Service-2-api.practicemgmt-TEST.pattersondevops.com';
const activeGridData = {
  AdditionalIdentifiers: [],
  PerformanceCounter: {
    ServiceTotalTime: 113,
    DtoMappingTotalTime: 0,
    FilterOptionsTotalTime: 0,
    PopulateRowsTotalTime: 0
  },
  PageCount: 50,
  CurrentPage: 0,
  FilterCriteria: {
    LocationId: 6606192,
  },
  SortCriteria: {
    PatientName: 0,
    PatientDateOfBirth: 0,
    PreviousAppointmentDate: 0,
    NextAppointmentDate: 0,
    LastCommunicationDate: 0,
    PreventiveCareDueDate: 0,
    TreatmentPlanTotalBalance: 0,
    ResponsiblePartyName: 0
  },
  TotalCount: 3,
  Rows: [
    {
      PatientId: "88f59921-880c-4a44-a4a7-73922c45bba8",
      PatientAccountId: "88f59921-880c-4a44-a4a7-73922c45bba8",
      PatientDateOfBirth: null
    }
  ]
}
const mockMailingRes: PatientMailingInfo = {
  communicationTypeId: '1',
  communicationTemplateId: '2',
  isPrintMailingLabel: false,
  isPostcard: false,
  dataGrid: {}
};

//AllPatientsGridData
describe('AllPatientsGridData', () => {
  let allPatientService: AllPatientsGridData;
  let translateService: TranslateService;
  let patientLandingGridService: PatientLandingGridService;
  let patientFilterService: PatientFilterService
  let locationTimeService: LocationTimeService;
  let templatePrintService: TemplatePrintService;
  let mailingLabelPrintService: MailingLabelPrintService;

  beforeEach(() => {
    translateService = mockTranslateService;
    patientLandingGridService = mockPatientLandingGridService as unknown as PatientLandingGridService;
    patientFilterService = mockPatientFilterService as unknown as PatientFilterService;
    mailingLabelPrintService = mockMailingLabelService as unknown as MailingLabelPrintService;
    templatePrintService = mockTemplatePrintService as unknown as TemplatePrintService;
    locationTimeService = mocklocationTimeService as unknown as LocationTimeService;
    allPatientService = new AllPatientsGridData(translateService, patientLandingGridService, patientFilterService, locationTimeService, mockPatientServices, templatePrintService, mailingLabelPrintService, mockModalFactory);
  });

  it('should be created AllPatientService', () => {
    expect(allPatientService).toBeTruthy();
  });

  describe('AllPatient fetch', () => {
    it('should update Location & AllPatientRequest request and call transformRequestData', () => {
      const tempRequest = mockPatientRquestObj;
      const locationId = 6606192;
      const transformRequestData = spyOn(allPatientService, 'transformRequestData').and.returnValue(tempRequest);

      allPatientService.fetch(mockPatientRquestObj, tempRequest, mockUrl, locationId);

      expect(mockPatientRquestObj.FilterCriteria.LocationId).toBe(locationId);
      expect(mockPatientRquestObj.CurrentPage).toBe(patientFilterService.CurrentPage);
      expect(patientFilterService.currentFilterCriteria).toBe(mockPatientRquestObj.FilterCriteria);
      expect(transformRequestData).toHaveBeenCalledWith(tempRequest);
      expect(patientLandingGridService.getAllPatients).toHaveBeenCalledWith(tempRequest, mockUrl);
    });
  });

  describe('AllPatient transformRequestData', () => {
    it('should update FilterCriteria for each key in AllPatientFields', () => {
      const tempRequest = mockPatientRquestObj;
      allPatientService.transformRequestData(tempRequest);

      expect(mockPatientFilterService.getDateTimeFields).toHaveBeenCalled();
    });
  });

  describe('AllPatient onDateRangeFilter', () => {
    it('should update AllPatientRequest FilterCriteria based on field and data', () => {
      const allPatientRequest = mockPatientRquestObj;
      const data = { startDate: new Date(), endDate: new Date() };
      const field = DateRangeFilterType.DateOfBirth;

      const onDateRangeFilter = allPatientService.onDateRangeFilter(allPatientRequest, data, field);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthFrom).toBe(data.startDate);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthTo).toBe(data.endDate);
    });

    it('should delete AllPatientRequest FilterCriteria key based on field and data', () => {
      const allPatientRequest = mockPatientRquestObj;
      const data = { startDate: null, endDate: null };
      const field = DateRangeFilterType.DateOfBirth;

      const onDateRangeFilter = allPatientService.onDateRangeFilter(allPatientRequest, data, field);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthFrom).toBeUndefined();
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthTo).toBeUndefined();
    });

    it('should not set Date Range value when AllPatient field is null', () => {
      const allPatientRequest = mockPatientRquestObj;
      const data = { startDate: null, endDate: null };

      const onDateRangeFilter = allPatientService.onDateRangeFilter(allPatientRequest, data, null);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
    });
  });

  describe('AllPatient onNumericRangeFilter', () => {
    it('should update allPatientRequest FilterCriteria based on data', () => {
      const allPatientRequest = new AllPatientRequest();
      allPatientRequest.FilterCriteria = new AllPatientGridFilter();
      const data = { from: 1, to: 2 };

      const result = allPatientService.onNumericRangeFilter(allPatientRequest, data);

      expect(result.FilterCriteria.TreatmentPlanCountTotalFrom).toBe(data.from);
      expect(result.FilterCriteria.TreatmentPlanCountTotalTo).toBe(data.to);
    });

    it('should update allPatientRequest FilterCriteria if All request FilterCriteria is null', () => {
      const allPatientRequest = new AllPatientRequest();
      allPatientRequest.FilterCriteria = new AllPatientGridFilter();
      const data = { from: 1, to: 2 };

      const result = allPatientService.onNumericRangeFilter(null, data);

      expect(result.FilterCriteria.TreatmentPlanCountTotalFrom).toBe(data.from);
      expect(result.FilterCriteria.TreatmentPlanCountTotalTo).toBe(data.to);
    });
  });

  describe('AllPatient onSortGridData', () => {
    it('should update allPatientGridSort based on sortData', () => {
      const sortData = { sortField: 'PatientName', sortDirection: 1 };
      const expectedSort = new AllPatientGridSort();
      expectedSort[PatientSortField[sortData.sortField]] = sortData.sortDirection;

      const result = allPatientService.onSortGridData(sortData);

      expect(result).toEqual(expectedSort);
    });
  });

  describe('AllPatient onSlideOutFilterChange', () => {
    it('should update AllPatientRequest FilterCriteria based on filter', () => {
      const allPatientRequest = new AllPatientRequest();
      const filter = new AllPatientGridFilter();

      const result = allPatientService.onSlideOutFilterChange(allPatientRequest, filter);

      expect(result.FilterCriteria).toBe(filter);
    });
  });

  describe('AllPatient onPrintMailingLabel ->', () => {
    it('should call AllPatient GetMailingLabelPatient and getPrintHtml with correct parameters', () => {
      mockMailingRes.isPrintMailingLabel = true;

      allPatientService.onPrintMailingLabel(mockMailingRes, activeGridData);
      mockPatientServices.MailingLabel.GetMailingLabelPatient(activeGridData).$promise.then((res) => {
        expect(mockPatientServices.MailingLabel.GetMailingLabelPatient).toHaveBeenCalled();
        expect(mockMailingLabelService.getPrintHtml).toHaveBeenCalledWith(res.Value);
      });
    });

    it('should call AllPatient showWarningModal based on activeGridData.TotalCount', () => {
      mockMailingRes.communicationTemplateId = '200';
      mockMailingRes.isPostcard = false;
      activeGridData.TotalCount = 201;
      spyOn(allPatientService, 'showWarningModal');
      allPatientService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(allPatientService.showWarningModal).toHaveBeenCalled();
    });

    it('should call getPrintHtml based on activeGridData.TotalCount and call printBulkLetterPatient in allPatientService', () => {
      mockMailingRes.isPostcard = false;
      activeGridData.TotalCount = 100;
      spyOn(allPatientService, 'showWarningModal');
      allPatientService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(allPatientService.showWarningModal).not.toHaveBeenCalled();
      expect(mockTemplatePrintService.printBulkLetterPatient).toHaveBeenCalled();
    });

    it('should call getPrintHtml based on activeGridData.TotalCount and call PrintBulkPostcardPatient in allPatientService', () => {
      mockMailingRes.isPostcard = true;
      
      spyOn(allPatientService, 'showWarningModal');
      allPatientService.onPrintMailingLabel(mockMailingRes, null);
      expect(allPatientService.showWarningModal).not.toHaveBeenCalled();
      expect(mockTemplatePrintService.PrintBulkPostcardPatient).toHaveBeenCalled();
    });

    it('should not call AllPatient showWarningModal method', () => {
      mockMailingRes.isPrintMailingLabel = false;
      mockMailingRes.communicationTemplateId = null;
      spyOn(allPatientService, 'showWarningModal');
      allPatientService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(allPatientService.showWarningModal).not.toHaveBeenCalled();
    });

    it('should AllPatient handle when response is undefined', () => {
      const response = undefined;
      const activeGrid = null;
      spyOn(allPatientService, 'showWarningModal');
  
      allPatientService.onPrintMailingLabel(response, activeGrid);
      expect(allPatientService.showWarningModal).not.toHaveBeenCalled();
    });
  });

  describe('AllPatient showWarningModal ->', () => {
    it('should call AllPatient ConfirmModal with correct parameters', () => {
      allPatientService.showWarningModal();
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
    });
  });

});

//PreventiveCareGridData
describe('PreventiveCareGridData', () => {
  let PreventiveCareService: PreventiveCareGridData;
  let translateService: TranslateService;
  let patientLandingGridService: PatientLandingGridService;
  let patientFilterService: PatientFilterService
  let locationTimeService: LocationTimeService;
  let templatePrintService: TemplatePrintService;
  let mailingLabelPrintService: MailingLabelPrintService;

  
  beforeEach(() => {
    translateService = mockTranslateService;
    patientLandingGridService = mockPatientLandingGridService as unknown as PatientLandingGridService;
    patientFilterService = mockPatientFilterService as unknown as PatientFilterService;
    mailingLabelPrintService = mockMailingLabelService as unknown as MailingLabelPrintService;
    templatePrintService = mockTemplatePrintService as unknown as TemplatePrintService;
    PreventiveCareService = new PreventiveCareGridData(translateService, patientLandingGridService, patientFilterService, locationTimeService, mockPatientServices, templatePrintService, mailingLabelPrintService, mockModalFactory);
  });

  it('should be created PreventiveCareService', () => {
    expect(PreventiveCareService).toBeTruthy();
  });

  describe('Preventivecare fetch', () => {
    it('should update Location & Preventivecare request and call transformRequestData', () => {
      const tempRequest = mockPatientRquestObj;
      const locationId = 6606192;
      const transformRequestData = spyOn(PreventiveCareService, 'transformRequestData').and.returnValue(tempRequest);

      PreventiveCareService.fetch(mockPatientRquestObj, tempRequest, mockUrl, locationId);

      expect(mockPatientRquestObj.FilterCriteria.LocationId).toBe(locationId);
      expect(mockPatientRquestObj.CurrentPage).toBe(patientFilterService.CurrentPage);
      expect(patientFilterService.currentFilterCriteria).toBe(mockPatientRquestObj.FilterCriteria);
      expect(transformRequestData).toHaveBeenCalledWith(tempRequest);
      expect(patientLandingGridService.getAllPreventiveCare).toHaveBeenCalledWith(tempRequest, mockUrl);
    });
  });

  describe('Preventivecare transformRequestData', () => {
    it('should update FilterCriteria for each key in PreventivecareFields', () => {
      const tempRequest = mockPatientRquestObj;
      PreventiveCareService.transformRequestData(tempRequest);

      expect(mockPatientFilterService.getDateTimeFields).toHaveBeenCalled();
    });
  });

  describe('Preventivecare onDateRangeFilter', () => {
    it('should update PreventivecareRequest FilterCriteria based on field and data', () => {
      const preventivecareRequest = mockPatientRquestObj;
      const data = { startDate: new Date(), endDate: new Date() };
      const field = DateRangeFilterType.DateOfBirth;

      const onDateRangeFilter = PreventiveCareService.onDateRangeFilter(preventivecareRequest, data, field);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthFrom).toBe(data.startDate);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthTo).toBe(data.endDate);
    });

    it('should delete PreventivecareRequest FilterCriteria key based on field and data', () => {
      const preventivecareRequest = mockPatientRquestObj;
      const data = { startDate: null, endDate: null };
      const field = DateRangeFilterType.DateOfBirth;

      const onDateRangeFilter = PreventiveCareService.onDateRangeFilter(preventivecareRequest, data, field);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthFrom).toBeUndefined();
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthTo).toBeUndefined();
    });

    it('should not set Date Range value when PreventiveCare field is null', () => {
      const preventivecareRequest = mockPatientRquestObj;
      const data = { startDate: null, endDate: null };

      const onDateRangeFilter = PreventiveCareService.onDateRangeFilter(preventivecareRequest, data, null);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
    });
  });

  describe('Preventivecare onNumericRangeFilter', () => {
    it('should update preventivecareRequest FilterCriteria based on data', () => {
      const preventivecareRequest = new PreventiveCareRequest();
      preventivecareRequest.FilterCriteria = new PreventiveCareGridFilter();
      const data = { from: 1, to: 2 };

      const result = PreventiveCareService.onNumericRangeFilter(preventivecareRequest, data);

      expect(result.FilterCriteria.TreatmentPlanCountTotalFrom).toBe(data.from);
      expect(result.FilterCriteria.TreatmentPlanCountTotalTo).toBe(data.to);
    });

    it('should update preventivecareRequest FilterCriteria if All request FilterCriteria is null', () => {
      const preventivecareRequest = new PreventiveCareRequest();
      preventivecareRequest.FilterCriteria = new PreventiveCareGridFilter();
      const data = { from: 1, to: 2 };

      const result = PreventiveCareService.onNumericRangeFilter(null, data);

      expect(result.FilterCriteria.TreatmentPlanCountTotalFrom).toBe(data.from);
      expect(result.FilterCriteria.TreatmentPlanCountTotalTo).toBe(data.to);
    });
  });

  describe('Preventivecare onSortGridData', () => {
    it('should update PreventiveGridSort based on sortData', () => {
      const sortData = { sortField: 'PatientName', sortDirection: 1 };
      const expectedSort = new PreventiveGridSort();
      expectedSort[PatientSortField[sortData.sortField]] = sortData.sortDirection;

      const result = PreventiveCareService.onSortGridData(sortData);

      expect(result).toEqual(expectedSort);
    });
  });

  describe('Preventivecare onSlideOutFilterChange', () => {
    it('should update PreventiveCareRequest FilterCriteria based on filter', () => {
      const preventiveCareRequest = new PreventiveCareRequest();
      const filter = new PreventiveCareGridFilter();

      const result = PreventiveCareService.onSlideOutFilterChange(preventiveCareRequest, filter);

      expect(result.FilterCriteria).toBe(filter);
    });
  });

  describe('Preventivecare onPrintMailingLabel ->', () => {
    it('should call Preventivecare GetMailingLabelPatient and getPrintHtml with correct parameters', () => {
      mockMailingRes.isPrintMailingLabel = true;

      PreventiveCareService.onPrintMailingLabel(mockMailingRes, activeGridData);
      mockPatientServices.MailingLabel.GetMailingLabelPreventive(activeGridData).$promise.then((res) => {
        expect(mockPatientServices.MailingLabel.GetMailingLabelPreventive).toHaveBeenCalled();
        expect(mockMailingLabelService.getPrintHtml).toHaveBeenCalledWith(res.Value);
      });
    });

    it('should call Preventivecare showWarningPreventiveCareModal based on activeGridData.TotalCount', () => {
      mockMailingRes.communicationTemplateId = '200';
      mockMailingRes.isPostcard = false;
      activeGridData.TotalCount = 1800;
      spyOn(PreventiveCareService, 'showWarningPreventiveCareModal');
      PreventiveCareService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(PreventiveCareService.showWarningPreventiveCareModal).toHaveBeenCalled();
    });

    it('should call getPrintHtml based on activeGridData.TotalCount and call PrintBulkLetterPreventive in PreventiveCareService', () => {
      mockMailingRes.isPostcard = false;
      spyOn(PreventiveCareService, 'showWarningPreventiveCareModal');
      PreventiveCareService.onPrintMailingLabel(mockMailingRes, null);
      expect(PreventiveCareService.showWarningPreventiveCareModal).not.toHaveBeenCalled();
      expect(mockTemplatePrintService.PrintBulkLetterPreventive).toHaveBeenCalled();
    });

    it('should call getPrintHtml based on activeGridData.TotalCount and call PrintBulkPostcardPreventive in PreventiveCareService', () => {
      mockMailingRes.isPostcard = true;
      activeGridData.TotalCount = 100;
      spyOn(PreventiveCareService, 'showWarningPreventiveCareModal');
      PreventiveCareService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(PreventiveCareService.showWarningPreventiveCareModal).not.toHaveBeenCalled();
      expect(mockTemplatePrintService.PrintBulkPostcardPreventive).toHaveBeenCalled();
    });

    it('should not call Preventivecare showWarningPreventiveCareModal method', () => {
      mockMailingRes.isPrintMailingLabel = false;
      mockMailingRes.communicationTemplateId = null;
      spyOn(PreventiveCareService, 'showWarningPreventiveCareModal');
      PreventiveCareService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(PreventiveCareService.showWarningPreventiveCareModal).not.toHaveBeenCalled();
    });

    it('should Preventivecare handle when response is undefined', () => {
      const response = undefined;
      const activeGrid = null;
      spyOn(PreventiveCareService, 'showWarningPreventiveCareModal');
  
      PreventiveCareService.onPrintMailingLabel(response, activeGrid);
      expect(PreventiveCareService.showWarningPreventiveCareModal).not.toHaveBeenCalled();
    });
  });

  describe('Preventivecare showWarningPreventiveCareModal ->', () => {
    it('should call PreventiveCare ConfirmModal with correct parameters', () => {
      PreventiveCareService.showWarningPreventiveCareModal();
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
    });
  });

});

//TreatmentPlansGridData
describe('TreatmentPlansGridData', () => {
  let treatmentPlansService: TreatmentPlansGridData;
  let translateService: TranslateService;
  let patientLandingGridService: PatientLandingGridService;
  let patientFilterService: PatientFilterService
  let locationTimeService: LocationTimeService;
  let templatePrintService: TemplatePrintService;
  let mailingLabelPrintService: MailingLabelPrintService;

  
  beforeEach(() => {
    translateService = mockTranslateService;
    patientLandingGridService = mockPatientLandingGridService as unknown as PatientLandingGridService;
    patientFilterService = mockPatientFilterService as unknown as PatientFilterService;
    mailingLabelPrintService = mockMailingLabelService as unknown as MailingLabelPrintService;
    templatePrintService = mockTemplatePrintService as unknown as TemplatePrintService;
    treatmentPlansService = new TreatmentPlansGridData(translateService, patientLandingGridService, patientFilterService, locationTimeService, mockPatientServices, templatePrintService, mailingLabelPrintService, mockModalFactory);
  });

  it('should be created TreatmentPlansService', () => {
    expect(treatmentPlansService).toBeTruthy();
  });

  describe('TreatmentPlan fetch', () => {
    it('should update Location & TreatmentPlan request and call transformRequestData', () => {
      const tempRequest = mockPatientRquestObj;
      const locationId = 6606192;
      const transformRequestData = spyOn(treatmentPlansService, 'transformRequestData').and.returnValue(tempRequest);

      treatmentPlansService.fetch(mockPatientRquestObj, tempRequest, mockUrl, locationId);

      expect(mockPatientRquestObj.FilterCriteria.LocationId).toBe(locationId);
      expect(mockPatientRquestObj.CurrentPage).toBe(patientFilterService.CurrentPage);
      expect(patientFilterService.currentFilterCriteria).toBe(mockPatientRquestObj.FilterCriteria);
      expect(transformRequestData).toHaveBeenCalledWith(tempRequest);
      expect(patientLandingGridService.getAllTreatmentPlans).toHaveBeenCalledWith(tempRequest, mockUrl);
    });
  });

  describe('TreatmentPlan transformRequestData', () => {
    it('should update FilterCriteria for each key in TreatmentPlanFields', () => {
      const tempRequest = mockPatientRquestObj;
      treatmentPlansService.transformRequestData(tempRequest);

      expect(mockPatientFilterService.getDateTimeFields).toHaveBeenCalled();
    });

  });

  describe('TreatmentPlan onDateRangeFilter', () => {
    it('should update TeatmentPlanRequest FilterCriteria based on field and data', () => {
      const teatmentPlanRequest = mockPatientRquestObj;
      const data = { startDate: new Date(), endDate: new Date() };
      const field = DateRangeFilterType.DateOfBirth;

      const onDateRangeFilter = treatmentPlansService.onDateRangeFilter(teatmentPlanRequest, data, field);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthFrom).toBe(data.startDate);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthTo).toBe(data.endDate);
    });

    it('should delete TeatmentPlanRequest FilterCriteria key based on field and data', () => {
      const teatmentPlanRequest = mockPatientRquestObj;
      const data = { startDate: null, endDate: null };
      const field = DateRangeFilterType.DateOfBirth;
      mockPatientRquestObj.FilterCriteria.PatientDateOfBirth = data.startDate;
      mockPatientRquestObj.FilterCriteria.PatientDateOfBirthTo = data.endDate;

      const onDateRangeFilter = treatmentPlansService.onDateRangeFilter(teatmentPlanRequest, data, field);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthFrom).toBeUndefined();
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthTo).toBeUndefined();
    });

    it('should not set Date Range value when TreatmentPlans field is null', () => {
      const teatmentPlanRequest = mockPatientRquestObj;
      const data = { startDate: null, endDate: null };

      const onDateRangeFilter = treatmentPlansService.onDateRangeFilter(teatmentPlanRequest, data, null);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
    });
  });

  describe('TreatmentPlan onNumericRangeFilter', () => {
    it('should update teatmentPlanRequest FilterCriteria based on data', () => {
      const teatmentPlanRequest = new TreatmentPlansRequest();
      teatmentPlanRequest.FilterCriteria = new TreatmentPlansGridFilter();
      const data = { from: 1, to: 2 };

      const result = treatmentPlansService.onNumericRangeFilter(teatmentPlanRequest, data);

      expect(result.FilterCriteria.TreatmentPlanCountTotalFrom).toBe(data.from);
      expect(result.FilterCriteria.TreatmentPlanCountTotalTo).toBe(data.to);
    });

    it('should update teatmentPlanRequest FilterCriteria if All request FilterCriteria is null', () => {
      const teatmentPlanRequest = new TreatmentPlansRequest();
      teatmentPlanRequest.FilterCriteria = new TreatmentPlansGridFilter();
      const data = { from: 1, to: 2 };

      const result = treatmentPlansService.onNumericRangeFilter(null, data);

      expect(result.FilterCriteria.TreatmentPlanCountTotalFrom).toBe(data.from);
      expect(result.FilterCriteria.TreatmentPlanCountTotalTo).toBe(data.to);
    });
  });

  describe('TreatmentPlan onSortGridData', () => {
    it('should update TreatmentGridSort based on sortData', () => {
      const sortData = { sortField: 'PatientName', sortDirection: 1 };
      const expectedSort = new TreatmentGridSort();
      expectedSort[PatientSortField[sortData.sortField]] = sortData.sortDirection;

      const result = treatmentPlansService.onSortGridData(sortData);

      expect(result).toEqual(expectedSort);
    });
  });

  describe('TreatmentPlan onSlideOutFilterChange', () => {
    it('should update TreatmentPlansRequest FilterCriteria based on filter', () => {
      const treatmentPlansRequest = new TreatmentPlansRequest();
      const filter = new TreatmentPlansGridFilter();

      const result = treatmentPlansService.onSlideOutFilterChange(treatmentPlansRequest, filter);

      expect(result.FilterCriteria).toBe(filter);
    });
  });

  describe('TreatmentPlan onPrintMailingLabel ->', () => {
    it('should call TreatmentPlan GetMailingLabelPatient and getPrintHtml with correct parameters', () => {
      mockMailingRes.isPrintMailingLabel = true;

      treatmentPlansService.onPrintMailingLabel(mockMailingRes, activeGridData);
      mockPatientServices.MailingLabel.GetMailingLabelTreatment(activeGridData).$promise.then((res) => {
        expect(mockPatientServices.MailingLabel.GetMailingLabelTreatment).toHaveBeenCalled();
        expect(mockMailingLabelService.getPrintHtml).toHaveBeenCalledWith(res.Value);
      });
    });

    it('should call TreatmentPlan showWarningModal based on activeGridData.TotalCount', () => {
      mockMailingRes.communicationTemplateId = '200';
      mockMailingRes.isPostcard = false;
      activeGridData.TotalCount = 201;
      spyOn(treatmentPlansService, 'showWarningModal');
      treatmentPlansService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(treatmentPlansService.showWarningModal).toHaveBeenCalled();
    });

    it('should call getPrintHtml based on activeGridData.TotalCount and call PrintBulkLetterPreventive in treatmentPlansService', () => {
      mockMailingRes.isPostcard = false;
      spyOn(treatmentPlansService, 'showWarningModal');
      treatmentPlansService.onPrintMailingLabel(mockMailingRes, null);
      expect(treatmentPlansService.showWarningModal).not.toHaveBeenCalled();
      expect(mockTemplatePrintService.PrintBulkLetterTreatment).toHaveBeenCalled();
    });

    it('should call getPrintHtml based on activeGridData.TotalCount and call PrintBulkPostcardPreventive in treatmentPlansService', () => {
      mockMailingRes.isPostcard = true;
      activeGridData.TotalCount = 100;
      spyOn(treatmentPlansService, 'showWarningModal');
      treatmentPlansService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(treatmentPlansService.showWarningModal).not.toHaveBeenCalled();
      expect(mockTemplatePrintService.PrintBulkPostcardTreatment).toHaveBeenCalled();
    });

    it('should not call TreatmentPlan showWarningModal method', () => {
      mockMailingRes.isPrintMailingLabel = false;
      mockMailingRes.communicationTemplateId = null;
      spyOn(treatmentPlansService, 'showWarningModal');
      treatmentPlansService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(treatmentPlansService.showWarningModal).not.toHaveBeenCalled();
    });

    it('should Treatment plan handle when response is undefined', () => {
      const response = undefined;
      const activeGrid = null;
      spyOn(treatmentPlansService, 'showWarningModal');
  
      treatmentPlansService.onPrintMailingLabel(response, activeGrid);
      expect(treatmentPlansService.showWarningModal).not.toHaveBeenCalled();
    });
  });

  describe('TreatmentPlan showWarningModal ->', () => {
    it('should call Treatment Plan ConfirmModal with correct parameters', () => {
      treatmentPlansService.showWarningModal();
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
    });
  });

});

//AppointmentGridData
describe('AppointmentGridData', () => {
  let appointmentService: AppointmentGridData;
  let translateService: TranslateService;
  let patientLandingGridService: PatientLandingGridService;
  let patientFilterService: PatientFilterService
  let locationTimeService: LocationTimeService;
  let templatePrintService: TemplatePrintService;
  let mailingLabelPrintService: MailingLabelPrintService;

  
  beforeEach(() => {
    translateService = mockTranslateService;
    patientLandingGridService = mockPatientLandingGridService as unknown as PatientLandingGridService;
    patientFilterService = mockPatientFilterService as unknown as PatientFilterService;
    mailingLabelPrintService = mockMailingLabelService as unknown as MailingLabelPrintService;
    templatePrintService = mockTemplatePrintService as unknown as TemplatePrintService;
    appointmentService = new AppointmentGridData(translateService, patientLandingGridService, patientFilterService, locationTimeService, mockPatientServices, templatePrintService, mailingLabelPrintService, mockModalFactory);
  });

  it('should be created AppointmentService', () => {
    expect(appointmentService).toBeTruthy();
  });

  describe('Appoinment fetch', () => {
    it('should update Location & Appoinment request and call transformRequestData', () => {
      const tempRequest = mockPatientRquestObj;
      const locationId = 6606192;
      const transformRequestData = spyOn(appointmentService, 'transformRequestData').and.returnValue(tempRequest);

      appointmentService.fetch(mockPatientRquestObj, tempRequest, mockUrl, locationId);

      expect(mockPatientRquestObj.FilterCriteria.LocationId).toBe(locationId);
      expect(mockPatientRquestObj.CurrentPage).toBe(patientFilterService.CurrentPage);
      expect(patientFilterService.currentFilterCriteria).toBe(mockPatientRquestObj.FilterCriteria);
      expect(transformRequestData).toHaveBeenCalledWith(tempRequest);
      expect(patientLandingGridService.getAllAppointments).toHaveBeenCalledWith(tempRequest, mockUrl);
    });
  });

  describe('Appoinment transformRequestData', () => {
    it('should update FilterCriteria for each key in AppoinmentFields', () => {
      const tempRequest = mockPatientRquestObj;
      appointmentService.transformRequestData(tempRequest);

      expect(mockPatientFilterService.getDateTimeFields).toHaveBeenCalled();
    });
  });

  describe('Appoinment onDateRangeFilter', () => {
    it('should update AppoinmentRequest FilterCriteria based on field and data', () => {
      const appoinmentRequest = mockPatientRquestObj;
      const data = { startDate: new Date(), endDate: new Date() };
      const field = DateRangeFilterType.DateOfBirth;

      const onDateRangeFilter = appointmentService.onDateRangeFilter(appoinmentRequest, data, field);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthFrom).toBe(data.startDate);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthTo).toBe(data.endDate);
    });

    it('should delete AppoinmentRequest FilterCriteria key based on field and data', () => {
      const appoinmentRequest = mockPatientRquestObj;
      const data = { startDate: null, endDate: null };
      const field = DateRangeFilterType.DateOfBirth;

      const onDateRangeFilter = appointmentService.onDateRangeFilter(appoinmentRequest, data, field);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthFrom).toBeUndefined();
      expect(onDateRangeFilter.FilterCriteria.PatientDateOfBirthTo).toBeUndefined();
    });

    it('should not set Date Range value when Appointment field is null', () => {
      const appoinmentRequest = mockPatientRquestObj;
      const data = { startDate: null, endDate: null };

      const onDateRangeFilter = appointmentService.onDateRangeFilter(appoinmentRequest, data, null);
      expect(onDateRangeFilter).toBe(mockPatientRquestObj);
    });
  });

  describe('Appoinment onSortGridData', () => {
    it('should update AppointmentGridSort based on sortData', () => {
      const sortData = { sortField: 'PatientName', sortDirection: 1 };
      const expectedSort = new AppointmentGridSort();
      expectedSort[PatientSortField[sortData.sortField]] = sortData.sortDirection;

      const result = appointmentService.onSortGridData(sortData);

      expect(result).toEqual(expectedSort);
    });
  });

  describe('Appoinment onSlideOutFilterChange', () => {
    it('should update AppointmentRequest FilterCriteria based on filter', () => {
      const appointmentRequest = new AppointmentRequest();
      const filter = new AppointmentGridFilter();

      const result = appointmentService.onSlideOutFilterChange(appointmentRequest, filter);

      expect(result.FilterCriteria).toBe(filter);
    });
  });

  describe('Appoinment onPrintMailingLabel ->', () => {
    it('should call Appoinment GetMailingLabelPatient and getPrintHtml with correct parameters', () => {
      mockMailingRes.isPrintMailingLabel = true;

      appointmentService.onPrintMailingLabel(mockMailingRes, activeGridData);
      mockPatientServices.MailingLabel.GetMailingLabelAppointment(activeGridData).$promise.then((res) => {
        expect(mockPatientServices.MailingLabel.GetMailingLabelAppointment).toHaveBeenCalled();
        expect(mockMailingLabelService.getPrintHtml).toHaveBeenCalledWith(res.Value);
      });
    });

    it('should call Appoinment showWarningModal based on activeGridData.TotalCount', () => {
      mockMailingRes.communicationTemplateId = '200';
      mockMailingRes.isPostcard = false;
      activeGridData.TotalCount = 201;
      spyOn(appointmentService, 'showWarningModal');
      appointmentService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(appointmentService.showWarningModal).toHaveBeenCalled();
    });

    it('should call getPrintHtml based on activeGridData.TotalCount and call PrintBulkLetterAppointment in appointmentService', () => {
      mockMailingRes.isPostcard = false;
      spyOn(appointmentService, 'showWarningModal');
      appointmentService.onPrintMailingLabel(mockMailingRes, null);
      expect(appointmentService.showWarningModal).not.toHaveBeenCalled();
      expect(mockTemplatePrintService.PrintBulkLetterAppointment).toHaveBeenCalled();
    });

    it('should call getPrintHtml based on activeGridData.TotalCount and call PrintBulkPostcardAppointment in appointmentService', () => {
      mockMailingRes.isPostcard = true;
      activeGridData.TotalCount = 100;
      spyOn(appointmentService, 'showWarningModal');
      appointmentService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(appointmentService.showWarningModal).not.toHaveBeenCalled();
      expect(mockTemplatePrintService.PrintBulkPostcardAppointment).toHaveBeenCalled();
    });

    it('should not call Appoinment showWarningModal method', () => {
      mockMailingRes.isPrintMailingLabel = false;
      mockMailingRes.communicationTemplateId = null;
      spyOn(appointmentService, 'showWarningModal');
      appointmentService.onPrintMailingLabel(mockMailingRes, activeGridData);
      expect(appointmentService.showWarningModal).not.toHaveBeenCalled();
    });

    it('should Appointment handle when response is undefined', () => {
      const response = undefined;
      const activeGrid = null;
      spyOn(appointmentService, 'showWarningModal');
  
      appointmentService.onPrintMailingLabel(response, activeGrid);
      expect(appointmentService.showWarningModal).not.toHaveBeenCalled();
    });
  });

  describe('Appoinment showWarningModal ->', () => {
    it('should call Appoinment ConfirmModal with correct parameters', () => {
      appointmentService.showWarningModal();
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
    });
  });

});

//OtherToDoGridData
describe('OtherToDoGridData', () => {
  let otherToDoService: OtherToDoGridData;
  let translateService: TranslateService;
  let patientLandingGridService: PatientLandingGridService;
  let patientFilterService: PatientFilterService
  let locationTimeService: LocationTimeService;

  
  beforeEach(() => {
    translateService = mockTranslateService;
    patientLandingGridService = mockPatientLandingGridService as unknown as PatientLandingGridService;
    patientFilterService = mockPatientFilterService as unknown as PatientFilterService;
    otherToDoService = new OtherToDoGridData(translateService, patientLandingGridService, patientFilterService, locationTimeService);
  });

  it('should be created otherToDoService', () => {
    expect(otherToDoService).toBeTruthy();
  });

  describe('OtherToDo fetch', () => {
    it('should update Location & OtherToDo request and call transformRequestData', () => {
      const tempRequest = mockPatientRquestObj;
      const locationId = 6606192;
      const transformRequestData = spyOn(otherToDoService, 'transformRequestData').and.returnValue(tempRequest);

      otherToDoService.fetch(mockPatientRquestObj, tempRequest, mockUrl, locationId);

      expect(mockPatientRquestObj.FilterCriteria.LocationId).toBe(locationId);
      expect(mockPatientRquestObj.CurrentPage).toBe(patientFilterService.CurrentPage);
      expect(patientFilterService.currentFilterCriteria).toBe(mockPatientRquestObj.FilterCriteria);
      expect(transformRequestData).toHaveBeenCalledWith(tempRequest);
      expect(patientLandingGridService.getAllToDo).toHaveBeenCalledWith(tempRequest, mockUrl);
    });
  });

  describe('OtherToDo transformRequestData', () => {
    it('should update FilterCriteria for each key in OtherToDoFields', () => {
      const tempRequest = mockPatientRquestObj;
      otherToDoService.transformRequestData(tempRequest);

      expect(mockPatientFilterService.getDateTimeFields).toHaveBeenCalled();
    });
  });

  describe('OtherToDo onDateRangeFilter', () => {
    it('should update otherToDoRequest FilterCriteria based on field and data', () => {
      const otherToDoRequest = mockOtherToDoRquestObj;
      const data = { startDate: new Date(), endDate: new Date() };
      const field = DateRangeFilterType.DueDate;

      const onDateRangeFilter = otherToDoService.onDateRangeFilter(otherToDoRequest, data, field);
      expect(onDateRangeFilter).toBe(mockOtherToDoRquestObj);
      expect(onDateRangeFilter.FilterCriteria.DueDateFrom).toBe(data.startDate);
      expect(onDateRangeFilter.FilterCriteria.DueDateTo).toBe(data.endDate);
    });

    it('should delete otherToDoRequest FilterCriteria key based on field and data', () => {
      const otherToDoRequest = mockOtherToDoRquestObj;
      const data = { startDate: null, endDate: null };
      const field = DateRangeFilterType.DueDate;

      const onDateRangeFilter = otherToDoService.onDateRangeFilter(otherToDoRequest, data, field);
      expect(onDateRangeFilter).toBe(mockOtherToDoRquestObj);
      expect(mockOtherToDoRquestObj.FilterCriteria.DueDateFrom).toBeUndefined();
      expect(mockOtherToDoRquestObj.FilterCriteria.DueDateTo).toBeUndefined();
    });

    it('should not set Date Range value when OtherToDo field is null', () => {
      const otherToDoRequest = mockOtherToDoRquestObj;
      const data = { startDate: null, endDate: null };

      const onDateRangeFilter = otherToDoService.onDateRangeFilter(otherToDoRequest, data, null);
      expect(onDateRangeFilter).toBe(mockOtherToDoRquestObj);
    });
  });

  describe('OtherToDo onSortGridData', () => {
    it('should update OtherToDoGridSort based on sortData', () => {
      const sortData = { sortField: 'PatientName', sortDirection: 1 };
      const expectedSort = new OtherToDoGridSort();
      expectedSort[PatientSortField[sortData.sortField]] = sortData.sortDirection;

      const result = otherToDoService.onSortGridData(sortData);

      expect(result).toEqual(expectedSort);
    });
  });

  describe('OtherToDo onSlideOutFilterChange', () => {
    it('should update OtherToDoRequest FilterCriteria based on filter', () => {
      const otherToDoRequest = new OtherToDoRequest();
      const filter = new OtherToDoGridFilter();

      const result = otherToDoService.onSlideOutFilterChange(otherToDoRequest, filter);

      expect(result.FilterCriteria).toBe(filter);
    });

    it('should delete DueDateItems key is empty', () => {
      const otherToDoRequest = mockOtherToDoRquestObj;
      const filter = new OtherToDoGridFilter();
      filter['DueDateItems'] = ['test'];

      const result = otherToDoService.onSlideOutFilterChange(otherToDoRequest, filter);

      expect(result.FilterCriteria).toBe(filter);
    });
  });

});