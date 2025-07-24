import { TestBed } from '@angular/core/testing';
import { PatientService } from './patient.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { ExportCSV } from '../models/patient-location.model';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController; 

  const mockSoarConfig = {
    domainUrl: 'https://localhost:35440',
  };
  const fileNameMock = 'PatientTab';

  const paramsMock = {
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

  const mockCsvResponse: SoarResponse<ExportCSV> = {
    ExtendedStatusCode: null,
    Value: {
        CsvRows: [
            "Name,Responsible Party,Due Date,Status,Last Appt,Last Appt Type,Next Appt,Next Appt Type,Last Communication\r\n",
            "\"Anglers Jr, Patient M\",\"Anglers Jr, Patient M\",12/11/2023,Incomplete,N/A,\"N/A\",N/A,\"N/A\",12/11/2023\r\n",
            "\"Anthony, Kingston\",\"Anthony, Haven\",12/11/2023,Incomplete,01/14/2022,\"N/A\",N/A,\"N/A\",12/11/2023\r\n",
            "\"Alvarado, Eric\",\"Alvarado, Daxton\",12/15/2023,Incomplete,N/A,\"N/A\",N/A,\"N/A\",12/15/2023\r\n",
            "\"Alvarado, Kimberly\",\"Alvarado, Daxton\",12/18/2023,Incomplete,N/A,\"N/A\",N/A,\"N/A\",12/18/2023\r\n"
        ]
    },
    InvalidProperties: null
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService]
    });

    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('exportToCSVFile', () => {
    it('should post data and return a promise', () => {
      service.exportToCSVFile(paramsMock, fileNameMock, mockSoarConfig.domainUrl).then(res => {
        expect(res).toEqual(mockCsvResponse);
      });
      const req = httpMock.expectOne(`${mockSoarConfig.domainUrl}/patients/${fileNameMock}/csvFile`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(paramsMock);
      req.flush(mockCsvResponse);
    });

    it('should handle errors', () => {
      const mockError = 'Error';
      service.exportToCSVFile(paramsMock, fileNameMock, mockSoarConfig.domainUrl).catch(err => {
        expect(err.status).toEqual(500);
      });
      const req = httpMock.expectOne(`${mockSoarConfig.domainUrl}/patients/${fileNameMock}/csvFile`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(paramsMock);
      req.flush(mockError, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('exportToCSVFileWithContactInfo', () => {
    it('should post data and return a promise', () => {
      service.exportToCSVFileWithContactInfo(paramsMock, fileNameMock, mockSoarConfig.domainUrl).then(res => {
        expect(res).toEqual(mockCsvResponse);
      });
      const req = httpMock.expectOne(`${mockSoarConfig.domainUrl}/patients/${fileNameMock}/csvFileWithContactInfo`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(paramsMock);
      req.flush(mockCsvResponse);
    });

    it('should handle errors', () => {
      const mockError = 'Error';
      service.exportToCSVFileWithContactInfo(paramsMock, fileNameMock, mockSoarConfig.domainUrl).catch(err => {
        expect(err.status).toEqual(500);
      });
      const req = httpMock.expectOne(`${mockSoarConfig.domainUrl}/patients/${fileNameMock}/csvFileWithContactInfo`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(paramsMock);
      req.flush(mockError, { status: 500, statusText: 'Server Error' });
    });
  });
});
