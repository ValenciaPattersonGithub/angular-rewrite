import { TestBed } from '@angular/core/testing';

import { PatientDetailService } from './patient-detail.service';
import { PatientOverview } from 'src/patient/common/models/patient-overview.model';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { HttpClient } from '@angular/common/http';
import { Patient } from 'src/patient/common/models/patient.model';
import { promise } from 'protractor';
import { Appointment } from 'src/scheduling/common/models/appointment.model';
import { empty } from 'rxjs';
import { AppointmentDetails } from 'src/scheduling/common/models/appointment-details.model';
import { MicroServiceApiService } from 'src/security/providers';
import { PersonAccount } from 'src/patient/common/models/person-account.model';
import { AppointmentPreview } from 'src/scheduling/common/models/appointment-preview.model';

describe('PatientDetailService', () => {

    let service: PatientDetailService;

    const mockLocalizeService: any = {
        getLocalizedString: () => 'translated text'
    };

    const mockMicroServiceApiService: MicroServiceApiService = new MicroServiceApiService([{
        enterpriseApiUrl: 'steve',
        stsApiUrl: 'trish',
        domainApiUrl: 'billy',
        claimApiUrl: 'danny',
        eraApiUrl: 'sally',
        fileApiUrl: 'grandma',
        rxApiUrl: 'jonestrip',
        schedulingApiUrl: 'sauna',
        practicesApiUrl: 'skilodge',
        insuranceApiUrl: 'edina',
        treatmentPlansApiUrl: 'leftthelightson'
    }]);

    const emptyLocations = [];
    const emptyCentralTimeZoneLocation = {
        LocationId: 1,
        Timezone: "Central Standard Time"
    };

    emptyLocations.push(emptyCentralTimeZoneLocation);

    const mockReferenceDataService: any = {};

    const mockStaticData = {};

    const mockToastrFactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };

    const mockTimeZoneFactory: any = {};

    const mockSoarConfig = {};

    const mockPatientHttpService = new PatientHttpService(mockSoarConfig, new HttpClient(null), mockMicroServiceApiService);

    const emptyPatient: Patient = {
        PatientId: "",
        FirstName: "",
        MiddleName: "",
        LastName: "",
        PreferredName: "",
        Prefix: "",
        Suffix: "",
        AddressReferrerId: null,
        AddressReferrer: null,
        AddressLine1: "",
        AddressLine2: "",
        City: "",
        State: "",
        ZipCode: "",
        Sex: "",
        DateOfBirth: null,
        IsPatient: true,
        PatientSince: "",
        PatientCode: "",
        EmailAddress: null,
        EmailAddressRemindersOk: false,
        EmailAddress2: null,
        EmailAddress2RemindersOk: false,
        ThirdPartyPatientId: 0,
        PersonAccount: null, // PersonAccount type
        ResponsiblePersonType: 0,
        ResponsiblePersonId: "",
        ResponsiblePersonName: "",
        IsResponsiblePersonEditable: false,
        PreferredLocation: 0,
        PreferredLocationName: "",
        PreferredDentist: null, /* the UserId of the patient's preferred dentist, if they have one set */
        PreferredHygienist: null, /* the UserId of the patient's preferred hygienist, if they have one set */
        IsActive: true,
        IsSignatureOnFile: false,
        EmailAddresses: null,
        DirectoryAllocationId: "",
        MailAddressRemindersOK: false,
        PatientLocations: null,
        DataTag: "",
        UserModified: "",
        DateModified: "",

        preferredDentist: "",
        inactivePreferredDentist: false,

        preferredHygienist: "",
        inactivePreferredHygienist: false,

        NextAppointment: null,
        nextAppointmentIsToday: false
    };

    const emptyPatientOverview: PatientOverview = {
        PatientId: "",
        Flags: null,
        MedicalHistoryAlerts: null,
        ReferredPatients: null,
        Profile: emptyPatient, // Patient type
        BenefitPlans: null,
        PreventiveServicesDue: null,
        Phones: null,
        Emails: null,
        ActiveTreatmentPlanCount: null,
        PatientLocations: null,
        PatientGroups: null,
        AccountMemberOverview: null,
        imageUrl: null,
        hasImage: null
    }

    const emptyPersonAccount: PersonAccount = {
        AccountId: "",
        PersonId: "",
        StatementAccountId: 1,
        DisplayStatementAccountId: "",
        PersonAccountMember: null,
        InCollection: false,
        ReceivesStatements: false,
        ReceivesFinanceCharges: false,
        DataTag: "",
        UserModified: "",
        DateModified: ""
    }

    const emptyAppointment: Appointment = {
        AppointmentId: "",
        AppointmentTypeId: "",
        PersonId: "",
        TreatmentRoomId: "",
        UserId: "",
        Classification: 0,
        Description: "",
        Note: "",
        StartTime: "",
        EndTime: "",
        ActualStartTime: "",
        ActualEndTime: "",
        ProposedDuration: "",
        Status: 0,
        StatusNote: "",
        ReminderMethod: "",
        ExaminingDentist: "",
        IsExamNeeded: false,
        ProviderAppointments: null,
        PlannedServices: "",
        IsDeleted: "",
        IsBeingClipped: false,
        DeletedReason: "",
        IsSooner: false,
        IsPinned: false,
        LocationId: 0,
        LocationTimezoneInfo: "",
        MissedAppointmentTypeId: "",
        DataTag: "",
        UserModified: "",
        DateModified: "",

        $$StartTimeLocal: "",
        AppointmentDetails: ""
    }

    const emptyAppointmentDetails: AppointmentDetails = {
        Appointment: null,
        ContactInformation: null,
        Alerts: null,
        Person: null,
        ServiceCodes: null,
        Room: null,
        Location: null,
        AppointmentType: null,
        ProviderUsers: null,
        MedicalAlerts: null,
        DataTag: null,
        UserModified: null,
        DateModified: null,
    }

    const emptyAppointmentPreview: AppointmentPreview = {
        AppointmentId: "",
        StartTime: "",
        UserId: "",
        LocationId: 1,
        $$StartTimeLocal: "",
        nextAppointmentProviderDisplayName: ""
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                PatientDetailService,
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'TimeZoneFactory', useValue: mockTimeZoneFactory },
                { provide: 'StaticData', useValue: mockStaticData },
                { provide: PatientHttpService, useValue: mockPatientHttpService }
            ]
        });

        service = TestBed.get(PatientDetailService);
    });

    /*
    it('test name', () => {
        // arrange 

        // act

        // assert
    })    
    */

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getPatientDashboardOverviewByPatientId', () => {
        beforeEach(() => {
            let patientId = 'my test patient id';
            let promisedData = emptyPatientOverview;

            promisedData.PatientId = patientId;
            promisedData.Profile = emptyPatient;
            promisedData.Profile.PersonAccount = emptyPersonAccount;
            promisedData.Profile.PersonAccount.AccountId = 'laksdjfasdf';

            spyOn(service, 'getPatientOverviewByPatientIdPromise').and.returnValue(Promise.resolve(promisedData));
            spyOn(service, 'getPatientDetailsPromise').and.returnValue(Promise.resolve(promisedData.Profile));
            spyOn(mockPatientHttpService, 'getPatientAccountOverviewByAccountId').and.returnValue(Promise.resolve(null));
        });

        it('should call getPatientOverviewByPatientIdPromise', async () => {
            // arrange
            let patientId = 'my test patient id';

            // act
            var serviceResult = await service.getPatientDashboardOverviewByPatientId(patientId);

            // assert
            expect(service.getPatientOverviewByPatientIdPromise).toHaveBeenCalledWith(patientId);
        });

        it('should call getPatientDetailByPatientId', async () => {
            // arrange
            let patientId = 'my test patient id';

            // act
            var serviceResult = await service.getPatientDashboardOverviewByPatientId(patientId);

            // assert
            expect(service.getPatientDetailsPromise).toHaveBeenCalledWith(patientId);
        });

        it('should call patientHttpService.getPatientAccountOverviewByAccountId', async () => {
            // arrange
            let patientId = 'my test patient id';
            let accountId = 'laksdjfasdf'

            // act
            var serviceResult = await service.getPatientDashboardOverviewByPatientId(patientId);

            // assert
            expect(mockPatientHttpService.getPatientAccountOverviewByAccountId).toHaveBeenCalledWith(accountId);
        });
    });

    describe('getProviderDisplayName', () => {
        beforeEach(() => {

        });

        it('should return first initial, period, last name, hygiensit/dentist [happy path]', () => {
            // arrange
            let dummyProvider = {
                FirstName: "Sally",
                LastName: "Schreiber"
            };
            let dummyProviderType = {
                Name: "Dentist"
            }
            let targetResult = "S. Schreiber Dentist";

            // act
            let result = service.getProviderDisplayName(dummyProvider, dummyProviderType);

            // assert
            expect(result).toEqual(targetResult);
        });

        it('should return first initial, period, hygiensit/dentist when provider does not have a last name', () => {
            // arrange
            let dummyProvider = {
                FirstName: "Sally",
                LastName: ""
            };
            let dummyProviderType = {
                Name: "Dentist"
            }
            let targetResult = "S. Dentist";

            // act
            let result = service.getProviderDisplayName(dummyProvider, dummyProviderType);

            // assert
            expect(result).toEqual(targetResult);
        });

        it('should return last name hygiensit/dentist when provider does not have a first name', () => {
            // arrange
            let dummyProvider = {
                FirstName: "",
                LastName: "Schreiber"
            };
            let dummyProviderType = {
                Name: "Dentist"
            }
            let targetResult = "Schreiber Dentist";

            // act
            let result = service.getProviderDisplayName(dummyProvider, dummyProviderType);

            // assert
            expect(result).toEqual(targetResult);
        });

        it('should return first letter of first name, period, last name, when providerType is empty', () => {
            // arrange
            let dummyProvider = {
                FirstName: "Sally",
                LastName: "Schreiber"
            };
            let dummyProviderType = null;
            let targetResult = "S. Schreiber";

            // act
            let result = service.getProviderDisplayName(dummyProvider, dummyProviderType);

            // assert
            expect(result).toEqual(targetResult);
        });

        it('should dentist/hygienst when the provider does not have a name', () => {
            // arrange
            let dummyProvider = {
                FirstName: "",
                LastName: ""
            };
            let dummyProviderType = {
                Name: "Dentist"
            }
            let targetResult = "Dentist";

            // act
            let result = service.getProviderDisplayName(dummyProvider, dummyProviderType);

            // assert
            expect(result).toEqual(targetResult);
        });

        it('should return an empty string when the provider has no name and providerType is empty', () => {
            // arrange
            let dummyProvider = {
                FirstName: "",
                LastName: ""
            };
            let dummyProviderType = {
                Name: ""
            }
            let targetResult = "";

            // act
            let result = service.getProviderDisplayName(dummyProvider, dummyProviderType);

            // assert
            expect(result).toEqual(targetResult);
        });
    });

    describe('getPatientDetailsPromise', () => {
        beforeEach(() => {

        });

        it('should call patientHttpService.getPatientByPatientId', async () => {
            // arrange
            let patientId = 'my test patient id';
            let promisedData = emptyPatientOverview;
            promisedData.PatientId = patientId;

            spyOn(mockPatientHttpService, 'getPatientByPatientId').and.returnValue(Promise.resolve(promisedData));

            // act
            var serviceResult = await service.getPatientDetailsPromise(patientId);

            // assert
            expect(mockPatientHttpService.getPatientByPatientId).toHaveBeenCalledWith(patientId);
        });

        it('should call toastrFactory.error when the httpService call fails', async () => {
            // arrange 
            let patientId = 'my test patient id';
            let promisedData = emptyPatientOverview;
            promisedData.PatientId = patientId;

            spyOn(mockPatientHttpService, 'getPatientByPatientId').and.returnValue(Promise.reject('someone set up us the bomb'));

            // act 
            var serviceResult = await service.getPatientDetailsPromise(patientId);

            // assert
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });

        it('should call setPatientPreferredDentist', async () => {
            // arrange
            let patientId = 'my test patient id';
            let promisedData = emptyPatient;
            promisedData.PatientId = patientId;

            spyOn(mockPatientHttpService, 'getPatientByPatientId').and.returnValue(Promise.resolve(promisedData));
            spyOn(service, 'setPatientPreferredDentist');

            // act
            var serviceResult = await service.getPatientDetailsPromise(patientId);

            // assert
            expect(service.setPatientPreferredDentist).toHaveBeenCalled();
        });

        it('should call setPatientPreferredHygienist', async () => {
            // arrange
            let patientId = 'my test patient id';
            let promisedData = emptyPatient;
            promisedData.PatientId = patientId;

            spyOn(mockPatientHttpService, 'getPatientByPatientId').and.returnValue(Promise.resolve(promisedData));
            spyOn(service, 'setPatientPreferredHygienist');

            // act
            var serviceResult = await service.getPatientDetailsPromise(patientId);

            // assert
            expect(service.setPatientPreferredHygienist).toHaveBeenCalled();
        });
    });

    describe('getPatientNextAppointmentPromise', () => {
        beforeEach(() => {

        });

        it('should call patientHttpService.getPatientNextAppointment', async () => {
            // arrange
            let patientId = 'my test patient id';
            let promisedData = emptyAppointment;

            spyOn(mockPatientHttpService, 'getPatientNextAppointment').and.returnValue(Promise.resolve(promisedData));

            // act
            var serviceResult = await service.getPatientNextAppointmentPromise(patientId);

            // assert
            expect(mockPatientHttpService.getPatientNextAppointment).toHaveBeenCalledWith(patientId);
        });

        it('should call toastrFactory.error when the httpService call fails', async () => {
            // arrange 
            let patientId = 'my test patient id';
            let promisedData = emptyPatientOverview;
            promisedData.PatientId = patientId;

            spyOn(mockPatientHttpService, 'getPatientNextAppointment').and.returnValue(Promise.reject('someone set up us the bomb'));

            // act
            let testResult = await service.getPatientNextAppointmentPromise(patientId);

            // assert
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('getPatientOverviewByPatientIdPromise', () => {
        beforeEach(() => {

        });

        it('should call patientHttpService.getPatientDashboardOverviewByPatientId', async () => {
            // arrange 
            let patientId = 'my test patient id';
            let promisedData = emptyPatientOverview;
            promisedData.PatientId = patientId;

            spyOn(mockPatientHttpService, 'getPatientDashboardOverviewByPatientId').and.returnValue(Promise.resolve(promisedData));

            // act 
            let testResult = await service.getPatientOverviewByPatientIdPromise(patientId);

            // assert
            expect(mockPatientHttpService.getPatientDashboardOverviewByPatientId).toHaveBeenCalledWith(patientId);
        });

        it('should return the expected PatientOverview object on successful promise resolve', async () => {
            // arrange 
            let patientId = 'my test patient id';
            let promisedData = emptyPatientOverview;
            promisedData.PatientId = patientId;

            spyOn(mockPatientHttpService, 'getPatientDashboardOverviewByPatientId').and.returnValue(Promise.resolve(promisedData));

            // act 
            let testResult = await service.getPatientOverviewByPatientIdPromise(patientId);

            // assert
            expect(testResult).toEqual(promisedData);
            expect(testResult.PatientId).toEqual(patientId);
        });

        it('should call toastrFactory.error when the httpService call fails', async () => {
            // arrange 
            let patientId = 'my test patient id';
            let promisedData = emptyPatientOverview;
            promisedData.PatientId = patientId;

            spyOn(mockPatientHttpService, 'getPatientDashboardOverviewByPatientId').and.returnValue(Promise.reject('someone set up us the bomb'));

            // act 
            let testResult = await service.getPatientOverviewByPatientIdPromise(patientId);

            // assert
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });
});