import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientLandingGridService } from './patient-landing-grid.service';
import { AppointmentRequest } from '../models/patient-grid-request.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { Appointment } from '../models/patient-grid-response.model';

describe('PatientLandingGridService', () => {
  let service: PatientLandingGridService;
  let httpTestingController: HttpTestingController;  
  
  const mockErrorResponse = { status: 404, statusText: 'Deliberate 404' };

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

  const mockPatientsRequest = {
    CurrentPage: 0,
    PageCount: 50,
    FilterCriteria: {
      BirthMonths: ['-1'],
      IsActive: ['true'],
      IsPatient: ['true'],
      LocationId: 1583,
      PatientName: "",
      ResponsiblePartyName: "",
      TreatmentPlanTotalBalance: "",
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

  const mockAppointmentRequest:AppointmentRequest = {
    CurrentPage: 0,
    PageCount: 50,
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
      PreventiveCareDueDateFrom:null,
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

  const mockAppointmentResponse:SoarResponse<Appointment> = {
    ExtendedStatusCode: null, InvalidProperties: null,
    Value: {
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
  };

  const mockSoarConfig = {
    domainUrl: 'https://localhost:35440',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [],
      providers: [
        { provide: 'SoarConfig', useValue: mockSoarConfig }
      ]
    })

    service = TestBed.inject(PatientLandingGridService);
    httpTestingController = TestBed.inject(HttpTestingController);    
  });

  beforeEach(() => {
    service = TestBed.inject(PatientLandingGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('All Patients ->', () => {
    it('should return all patients', () => {
      service.getAllPatients(mockPatientsRequest, mockSoarConfig.domainUrl).then(response => {
        expect(response).toEqual(mockPatientsResponse.Value);
      });

      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patients/PatientTab`);
      expect(req.request.method).toBe('POST');
      req.flush(mockPatientsResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Not found';
      service.getAllPatients(mockPatientsRequest, mockSoarConfig.domainUrl).then(response => {
        expect(response).toEqual(mockPatientsResponse.Value);
      });
      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patients/PatientTab`);
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });
  });

  describe('Treatment Plans ->', () => {
    it('should return all treatment plans', () => {
      service.getAllTreatmentPlans(mockPatientsRequest, mockSoarConfig.domainUrl).then(response => {
        expect(response).toEqual(mockPatientsResponse.Value);
      });

      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patients/TreatmentPlans`);
      expect(req.request.method).toBe('POST');
      req.flush(mockPatientsResponse);
    });

    it('should turn 404 error into user-facing error for Treatment Plans', () => {
      const msg = 'Not found';
      service.getAllTreatmentPlans(mockPatientsRequest, mockSoarConfig.domainUrl).then(response => {
        expect(response).toEqual(mockPatientsResponse.Value);
      });
      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patients/TreatmentPlans`);
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });
  });

  describe('Appointments ->', () => {
    it('should return all appointments', () => {
      service.getAllAppointments(mockAppointmentRequest, mockSoarConfig.domainUrl).then(response => {
        expect(response).toEqual(mockAppointmentResponse.Value);
      });

      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patients/AppointmentTab`);
      expect(req.request.method).toBe('POST');
      req.flush(mockAppointmentResponse);
    });

    it('should turn 404 error into user-facing error for Appointments', () => {
      const msg = 'Not found';
      service.getAllAppointments(mockAppointmentRequest, mockSoarConfig.domainUrl).then(response => {
        expect(response).toEqual(mockAppointmentResponse.Value);
      });
      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patients/AppointmentTab`);
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });
  });

  describe('Preventive Care ->', () => {
    it('should return all preventive care plans', () => {
      service.getAllPreventiveCare(mockPatientsRequest, mockSoarConfig.domainUrl).then(response => {
        expect(response).toEqual(mockPatientsResponse.Value);
      });

      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patients/PreventiveCarePlans`);
      expect(req.request.method).toBe('POST');
      req.flush(mockPatientsResponse);
    });

    it('should turn 404 error into user-facing error for Preventive Care', () => {
      const msg = 'Not found';
      service.getAllPreventiveCare(mockPatientsRequest, mockSoarConfig.domainUrl).then(response => {
        expect(response).toEqual(mockPatientsResponse.Value);
      });
      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patients/PreventiveCarePlans`);
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });
  });

  describe('Other To Do  ->', () => {
    it('should return all other to do items', () => {
      service.getAllToDo(mockPatientsRequest, mockSoarConfig.domainUrl).then(response => {
        expect(response).toEqual(mockPatientsResponse.Value);
      });

      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patients/OtherToDoTab`);
      expect(req.request.method).toBe('POST');
      req.flush(mockPatientsResponse);
    });

    it('should turn 404 error into user-facing error for Other To DO', () => {
      const msg = 'Not found';
      service.getAllToDo(mockPatientsRequest, mockSoarConfig.domainUrl).then(response => {
        expect(response).toEqual(mockPatientsResponse.Value);
      });
      const req = httpTestingController.expectOne(`${mockSoarConfig.domainUrl}/patients/OtherToDoTab`);
      req.flush(msg, mockErrorResponse);// respond with a 404 and the error message in the body
    });
  });
});