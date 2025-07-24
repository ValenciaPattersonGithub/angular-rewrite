import { TestBed } from '@angular/core/testing';
import { TemplatePrintService } from './template-print.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { AllPatient, Appointment, PreventiveCare, TreatmentPlans } from 'src/patient/common/models/patient-grid-response.model';
import { PatientMailingInfo, PatientPostcardInfo } from '../models/send-mailing.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';

const soarResponseTemplateTypes: SoarResponse<string[]> = {
  Value: ["USMail_AllPatient", "preventivecare_usmail","TreatmentPlan_USmail", "USMail_Appointment" ]
}

const mockPatientPostCardInfo1: PatientPostcardInfo = {
  AddressLine1: "Atlanta",
  AddressLine2: "USA",
  Content: "Data",
  LocationCityStateZip: "4532354",
  PatientName: "John Doe"
}

const mockPatientPostCardInfo2: PatientPostcardInfo = {
  AddressLine1: "Ohio",
  AddressLine2: "CAN",
  Content: "Data",
  LocationCityStateZip: "9072354",
  PatientName: "Albert"
}

const soarResponsePatienPostCardInfo: SoarResponse<PatientPostcardInfo[]> = {
  Value: [mockPatientPostCardInfo1, mockPatientPostCardInfo2]
}

const mockErrorHtmlTemplate = `<html><head><meta charset='utf-8'> <title>Print US Mail</title><style>body { background-color:#ffffff; padding: 0; border: 0; margin: 0; }.page { background-color: #ffffff; margin: .25in auto;}.page-content { margin-top: .5in; margin-left: .27in; }.page-content::after { content: ' '; display: block; height: 0; clear: both; }.page-content { margin-top: .5in; margin-left: .27in; }button {border-color: #0d6ba3; background-color: #0F7BBB; color: #FFF; font-size: 14px; padding: 8px 12px; border: 1px solid transparent; position: absolute; margin-left: .27in; margin-top:.06in }@media print { .body { background-color: transparent; } button { display: none;} .page { background-color: transparent; border: none; page-break-after: always; width: 8.5in; height: auto; } .label { border: none; } }</style></head><body><div class="page"><div class="page-content">The Template is null or empty and no output could be generated. Please select a different template.</div></div></body></html>`

const mockPatient = {
  PatientId: "8903dfbe-2489-4d99-8b93-8a34e5a5ecc6",
  PatientAccountId: "8903dfbe-2489-4d99-8b93-8a34e5a5ecc6",
  PatientName: "aaoxbydnavtnwkmaidrf, a'Z-A.z a'Z-A.z a'Z- M",
  LastCommunicationDate: new Date("12/02/24"),
  TreatmentPlanCount: 0,
  TreatmentPlanTotalBalance: 0,
  ResponsiblePartyId: "8903dfbe-2489-4d99-8b93-8a34e5a5ecc6",
  ResponsiblePartyName: "aaoxbydnavtnwkmaidrf, a'Z-A.z a'Z-A.z a'Z- M",
  HasUnreadCommunication: false,
  UnreadSmsCount: 0,
  UnreadEmailCount: 1,
  IsActive: true,
  IsPatient: true
}    

const mockAllPatient: AllPatient = {
  PreferredLocation: [
      {
          Key: 5053276,
          Value: "PracticePerf38638"
      }
  ],
  PreferredDentists: [
      {
          Key: "286c7431-bf2a-441d-ab51-2ab5c5fe3ecb",
          Value: "Admin, Support"
      },
      {
          Key: "eff02076-80b1-4105-9831-a07606608ddf",
          Value: "Barlow, Ian"
      }
  ],
  PreferredHygienists: [
      {
          Key: "286c7431-bf2a-441d-ab51-2ab5c5fe3ecb",
          Value: "Admin, Support"
      },
      {
          Key: "eff02076-80b1-4105-9831-a07606608ddf",
          Value: "Barlow, Ian"
      }
  ],
  PatientLocationZipCodes: [
      {
          Key: "11110",
          Value: "11110"
      },
      {
          Key: "11111",
          Value: "11111"
      }
  ],
  AdditionalIdentifiers: [],
  GroupTypes: [
      {
          Key: "23c7b32f-d2eb-40e2-949f-a35da5383a97",
          Value: "DG_esexgrmaik"
      },
      {
          Key: "c12522e6-12af-4d32-9b94-0942bf9c132d",
          Value: "DG_pleagbowbv"
      }
  ],
  PerformanceCounter: {
      ServiceTotalTime: 250,
      DtoMappingTotalTime: 0,
      FilterOptionsTotalTime: 0,
      PopulateRowsTotalTime: 0
  },
  PageCount: 1,
  CurrentPage: 0,
  FilterCriteria: {
      LocationId: 5053276,
      PatientName: "",
      TreatmentPlanCountTotalFrom: 0,
      TreatmentPlanCountTotalTo: 0,
      ResponsiblePartyName: "",
      IsPatient: [
          "true"
      ],
      IsActive: [
          "true"
      ],
      PreventiveCareIsScheduled: [
          "true",
          "false"
      ],
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
  TotalCount: 1,
  Rows: [
    mockPatient     
  ]
}

const mockAppointment: Appointment = {
  CurrentPage: 0,
  PageCount: 50,
  PreferredDentists: [],
  PreferredHygienists: [],
  AdditionalIdentifiers: [],
  GroupTypes: [],
  Rows: [
    {
      PatientId: '0',
      PatientName: 'Test Patient',
      IsActive: true,
      IsPatient: true
    }],
  FilterCriteria: {
    AppointmentDateFrom: null,
    AppointmentDateTo: null,
    AppointmentState: ["0|Cancellation", "0|Cancellation"],
    AppointmentStatus: '',
    AppointmentBlocks: ['', ''],
    AppointmentDate: ['', ''],
    AppointmentStatusList: ['', ''],
    AppointmentTypes: ['', ''],
    BusinessDays: ['', ''],
    IsScheduled: ['true', 'false'],
    LastCommunicationDate: null,
    PatientDateOfBirth: "",
    PreventiveCareDueDateFrom: null,
    PreventiveCareDueDateTo: null,
    Providers: ['', ''],
    Rooms: ['', ''],
    SoonerIfPossible: ['', ''],
    IsActive: ['true'],
    IsPatient: ['true'],
    LocationId: 1,
    PatientName: ''
  },
  SortCriteria: {
    AppointmentDate: 0,
    AppointmentStatus: 0,
    PatientDateOfBirth: 0,
    PreventiveCareDueDate: 0
  }
}
  
const mockTreatmentPlans: TreatmentPlans = {
  CurrentPage: 0,
  PageCount: 50,
  PreferredDentists: [],
  PreferredHygienists: [],
  AdditionalIdentifiers: [],
  GroupTypes: [],
  Rows: [
    {
      PatientId: '0',
      PatientName: 'Test Patient',
      IsActive: true,
      IsPatient: true
    }],
  FilterCriteria: { 
    IsActive: ['true'],
    IsPatient: ['true'],
    LocationId: 1583,
    PatientName: "",
    ResponsiblePartyName: "",
    TreatmentPlanTotalBalance: "",
  },
  SortCriteria: {
    PatientDateOfBirth: 0,
    PreventiveCareDueDate: 0,
    PatientName:0,
    ResponsiblePartyName: 0
  }
}
  
const mockPreventiveCare: PreventiveCare = {
  CurrentPage: 0,
  PageCount: 50,
  PreferredDentists: [],
  PreferredHygienists: [],
  GroupTypes: [],
  Rows: [
    {
      PatientId: '0',
      PatientName: 'Test Patient',
      IsActive: true,
      IsPatient: true
    }],
  FilterCriteria: { 
    IsActive: ['true'],
    IsPatient: ['true'],
    LocationId: 1583,
    PatientName: "",
    ResponsiblePartyName: "",
    TreatmentPlanTotalBalance: "",
  },
  SortCriteria: {
    PatientDateOfBirth: 0,
    PreventiveCareDueDate: 0,
    PatientName:0,
    ResponsiblePartyName: 0
  }
}

const mockPatientMailingInfoAllPatient: PatientMailingInfo = {
  isPostcard: true,
  isPrintMailingLabel: true,
  dataGrid: mockAllPatient,
  communicationTemplateId: '13'
}

const mockPatientMailingInfoAppointment: PatientMailingInfo = {
  isPostcard: true,
  isPrintMailingLabel: true,
  dataGrid: mockAppointment,
  communicationTemplateId: '6'
}

const mockPatientMailingInfoTreatmentPlans: PatientMailingInfo = {
  isPostcard: true,
  isPrintMailingLabel: true,
  dataGrid: mockTreatmentPlans,
  communicationTemplateId: '19'
}

const mockPatientMailingInfoPreventiveCare: PatientMailingInfo = {
  isPostcard: true,
  isPrintMailingLabel: true,
  dataGrid: mockPreventiveCare,
  communicationTemplateId: '17'
}

const mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);

const mockHtmlElement = {
  hidden: false
} as HTMLElement;

const mockDocumentOpen = {
  write: jasmine.createSpy(),
  getElementById: jasmine.createSpy().and.returnValue(mockHtmlElement),
}

const mockDomainUrl = 'https://localhost:35440';

const mockSoarConfig = {
  domainUrl: mockDomainUrl,
}

const mockPromisePatientPostCardInfo = {
  then: (res, err) => {
    res(soarResponsePatienPostCardInfo),
    err({})
  }
}  

const mockPromiseTemplateTypes = {
  then: (res, err) => {
    res(soarResponseTemplateTypes),
    err({})
  }
}

describe('TemplatePrintService', () => {
  let service: TemplatePrintService;
  let httpTestingController: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: TranslateService, usevalue: mockTranslateService }
      ]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(TemplatePrintService);
    httpClient = TestBed.inject(HttpClient);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPrintHtml ->', () => {
    beforeEach(() => {

      window.open = jasmine.createSpy().and.returnValue({
        document: {
          open: () => mockDocumentOpen,
          write: jasmine.createSpy()
        },
      });
    });
    
    it('should create new Html window for Print US Postcard', () => {
      mockPatientMailingInfoAllPatient.isPostcard = true;
    
      service.getPrintHtml(mockPatientMailingInfoAllPatient);

      expect(window.open).toHaveBeenCalled();
      expect(mockDocumentOpen.getElementById).toHaveBeenCalledWith('Progress');
      expect(mockDocumentOpen.write).toHaveBeenCalledWith(' <title>Print Post Card</title>');
      expect(mockDocumentOpen.write).toHaveBeenCalledWith("<div id='Progress'>Please wait while report is being generated...</div>");   
    });

    it('should create new Html window for Print US Mail HTML', () => {      
      mockPatientMailingInfoAllPatient.isPostcard = false;

      service.getPrintHtml(mockPatientMailingInfoAllPatient);

      expect(window.open).toHaveBeenCalled();
      expect(mockDocumentOpen.getElementById).toHaveBeenCalledWith('Progress');
      expect(mockDocumentOpen.write).toHaveBeenCalledWith(' <title>Print US Mail</title>');
      expect(mockDocumentOpen.write).toHaveBeenCalledWith("<div id='Progress'>Please wait while report is being generated...</div>");   
    })
  })

  describe('bindHtml ->', () => {
    it("should bind html for US Post Card type", () => {
      service.doc = document;
      service.doc.write = jasmine.createSpy();
      service.doc.close = jasmine.createSpy();
      service.progressDiv = mockHtmlElement;

      service.bindHtml([mockPatientPostCardInfo1], true);

      expect(service.doc.write).toHaveBeenCalled();
      expect(service.doc.close).toHaveBeenCalled();
      expect(service.doc.title).toEqual("Post Card Preview");
    })
    
    it("should bind html for US Post Card type when there is more data", () => {
      service.doc = document;
      service.doc.write = jasmine.createSpy();
      service.doc.close = jasmine.createSpy();
      service.progressDiv = mockHtmlElement;

      service.bindHtml([mockPatientPostCardInfo1, mockPatientPostCardInfo2], true);

      expect(service.doc.write).toHaveBeenCalled();
      expect(service.doc.close).toHaveBeenCalled();
      expect(service.doc.title).toEqual("Post Card Preview");
    })

    it("should bind html for US Mail type", () => {
      service.doc = new Document;
      service.doc.write = jasmine.createSpy();
      service.doc.close = jasmine.createSpy();
      service.progressDiv = mockHtmlElement;

      service.bindHtml([mockPatientMailingInfoAllPatient], false);

      expect(service.doc.write).toHaveBeenCalled();
      expect(service.doc.close).toHaveBeenCalled();
      expect(service.progressDiv.hidden).toEqual(true);
    })

    it("should bind html with error message for US Mail type when empty data set provided", () => {
      service.doc = new Document;
      service.doc.write = jasmine.createSpy();
      service.doc.close = jasmine.createSpy();
      service.progressDiv = mockHtmlElement;

      service.bindHtml([], false);

      expect(service.doc.write).toHaveBeenCalledWith(mockErrorHtmlTemplate);
      expect(service.doc.close).toHaveBeenCalled();
      expect(service.progressDiv.hidden).toEqual(true);
    })
  })

  describe("failure ->", () => {
    it("should show Report generation failed error for Print Post Card", () => {      
      service.doc = new Document;
      service.doc.write = jasmine.createSpy();
      service.doc.close = jasmine.createSpy();
      service.progressDiv = mockHtmlElement;

      service.failure(true);

      expect(service.doc.write).toHaveBeenCalledWith(' <title>Print Post Card</title>');
      expect(service.doc.write).toHaveBeenCalledWith('Report generation failed.');
      expect(service.doc.close).toHaveBeenCalled();
      expect(service.progressDiv.hidden).toEqual(true);
    })
    
    it("should show Report generation failed error for Print US Mail", () => {      
      service.doc = new Document;
      service.doc.write = jasmine.createSpy();
      service.doc.close = jasmine.createSpy();
      service.progressDiv = mockHtmlElement;

      service.failure(false);

      expect(service.doc.write).toHaveBeenCalledWith(' <title>Print US Mail</title>');
      expect(service.doc.write).toHaveBeenCalledWith('Report generation failed.');
      expect(service.doc.close).toHaveBeenCalled();
      expect(service.progressDiv.hidden).toEqual(true);
    })
  })

  describe("printBulkLetterPatient ->", () => {
    it("should get patient data to print bulk letter format", () => {      
      mockPatientMailingInfoAllPatient.isPostcard = false;
      httpClient.post = jasmine.createSpy().and.returnValue({ 
        toPromise: () => mockPromiseTemplateTypes
      })      

      service.printBulkLetterPatient(mockPatientMailingInfoAllPatient);

      expect(httpClient.post).toHaveBeenCalledWith(`${mockDomainUrl}/patients/13/PrintBulkLetterPatient?uiSuppressModal: true`, mockAllPatient);
    })
  })
  
  describe("PrintBulkLetterAppointment ->", () => {
    it("should get appointment data to print bulk letter format", () => {
      mockPatientMailingInfoAllPatient.isPostcard = false;
      httpClient.post = jasmine.createSpy().and.returnValue({ 
        toPromise: () => mockPromiseTemplateTypes
      })

      service.PrintBulkLetterAppointment(mockPatientMailingInfoAppointment);

      expect(httpClient.post).toHaveBeenCalledWith(`${mockDomainUrl}/patients/6/PrintBulkLetterAppointment?uiSuppressModal: true`, mockAppointment);
    })
  })
  
  describe("PrintBulkLetterTreatment ->", () => {
    it("should get treatment data to print bulk letter format", () => {
      mockPatientMailingInfoAllPatient.isPostcard = false;
      httpClient.post = jasmine.createSpy().and.returnValue({ 
        toPromise: () => mockPromiseTemplateTypes
      })

      service.PrintBulkLetterTreatment(mockPatientMailingInfoTreatmentPlans);

      expect(httpClient.post).toHaveBeenCalledWith(`${mockDomainUrl}/patients/19/PrintBulkLetterTreatment?uiSuppressModal: true`, mockTreatmentPlans);
    })
  })
  
  describe("PrintBulkLetterPreventive ->", () => {
    it("should get preventive care data to print bulk letter format", () => {
      mockPatientMailingInfoAllPatient.isPostcard = false;
      httpClient.post = jasmine.createSpy().and.returnValue({ 
        toPromise: () => mockPromiseTemplateTypes
      })

      service.PrintBulkLetterPreventive(mockPatientMailingInfoPreventiveCare);

      expect(httpClient.post).toHaveBeenCalledWith(`${mockDomainUrl}/patients/17/PrintBulkLetterPreventive?uiSuppressModal: true`, mockPreventiveCare);
    })
  })

  describe("PrintBulkPostcardPatient ->", () => {
    it("should get patient data to print bulk post card format", () => {
      mockPatientMailingInfoAllPatient.isPostcard = true;
      httpClient.post = jasmine.createSpy().and.returnValue({ 
        toPromise: () => mockPromisePatientPostCardInfo
      })

      service.PrintBulkPostcardPatient(mockPatientMailingInfoAllPatient);

      expect(httpClient.post).toHaveBeenCalledWith(`${mockDomainUrl}/patients/13/PrintBulkPostcardPatient`, mockAllPatient);
    })
  })

  describe("PrintBulkPostcardAppointment ->", () => {
    it("should get appointment data to print bulk post card format", () => {         
      mockPatientMailingInfoAllPatient.isPostcard = true;
      httpClient.post = jasmine.createSpy().and.returnValue({ 
        toPromise: () => mockPromisePatientPostCardInfo
      })

      service.PrintBulkPostcardAppointment(mockPatientMailingInfoAppointment);

      expect(httpClient.post).toHaveBeenCalledWith(`${mockDomainUrl}/patients/6/PrintBulkPostcardAppointment?uiSuppressModal: true`, mockAppointment);
    })
  })

  describe("PrintBulkPostcardTreatment ->", () => {
    it("should get treatment data to print bulk post card format", () => {         
      mockPatientMailingInfoAllPatient.isPostcard = true;
      httpClient.post = jasmine.createSpy().and.returnValue({ 
        toPromise: () => mockPromisePatientPostCardInfo
      })

      service.PrintBulkPostcardTreatment(mockPatientMailingInfoTreatmentPlans);

      expect(httpClient.post).toHaveBeenCalledWith(`${mockDomainUrl}/patients/19/PrintBulkPostcardTreatment?uiSuppressModal: true`, mockTreatmentPlans);
    })
  })

  describe("PrintBulkPostcardPreventive ->", () => {
    it("should get preventive care data to print bulk post card format", () => {
      mockPatientMailingInfoAllPatient.isPostcard = true;
      httpClient.post = jasmine.createSpy().and.returnValue({ 
        toPromise: () => mockPromisePatientPostCardInfo
      })

      service.PrintBulkPostcardPreventive(mockPatientMailingInfoPreventiveCare);

      expect(httpClient.post).toHaveBeenCalledWith(`${mockDomainUrl}/patients/17/PrintBulkPostcardPreventive?uiSuppressModal: true`, mockPreventiveCare);
    })
  })

});
