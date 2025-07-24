import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { RegistrationHeaderComponent } from './registration-header.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PatientDetailService } from 'src/patient/patient-detail/services/patient-detail.service';
import { DatePipe } from '@angular/common';
import { PatientOverview } from 'src/patient/common/models/patient-overview.model';
import { SimpleChanges } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BlueImagingService } from '../../imaging/services/blue.service';
import { ImagingMasterService } from '../../imaging/services/imaging-master.service';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { CommunicationDrawer } from 'src/patient/common/models/enums/patient.enum';

const mockPatientOverview: PatientOverview = {
    PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
    Flags: [],
    MedicalHistoryAlerts: [],
    ReferredPatients: [],
    Profile: {
        PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
        FirstName: "Hope",
        MiddleName: "M",
        LastName: "Baker",
        PreferredName: "TestPatient",
        Prefix: null,
        Suffix: "Jr",
        AddressReferrerId: null,
        AddressReferrer: null,
        AddressLine1: "TestAddress",
        AddressLine2: "555 Common Street",
        City: "Burch",
        State: "IL",
        ZipCode: "90210",
        Sex: "M",
        DateOfBirth: "1993-02-05T00:00:00",
        IsPatient: true,
        PatientSince: "2022-01-21T18:00:05.1665703",
        PatientCode: "BAKHO1",
        EmailAddress: null,
        EmailAddressRemindersOk: false,
        EmailAddress2: null,
        EmailAddress2RemindersOk: false,
        ThirdPartyPatientId: 0,
        PersonAccount: null,
        ResponsiblePersonType: 1,
        ResponsiblePersonId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
        ResponsiblePersonName: "Self",
        IsResponsiblePersonEditable: false,
        PreferredLocation: 6497004,
        PreferredDentist: null,
        PreferredHygienist: null,
        IsActive: true,
        IsSignatureOnFile: false,
        EmailAddresses: [],
        DirectoryAllocationId: "7aaf91e4-b49c-4747-b22c-46e40d8b0356",
        MailAddressRemindersOK: false,
        PatientLocations: null,
        PrimaryDuplicatePatientId: null,
        IsRxRegistered: false,
        HeightFeet: 0,
        HeightInches: 0,
        Weight: "0",
        DataTag: "AAAAAAAunMs=",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DateModified: "2023-10-30T06:35:07.0278833",
        preferredDentist: "No Preference",
        inactivePreferredDentist: false,
        preferredHygienist: "No Preference",
        inactivePreferredHygienist: false,
        PreferredLocationName: "AnglersLocNew",
        NextAppointment: {
            AppointmentId: '',
            StartTime: '',
            UserId: '',
            LocationId: 0,
            $$StartTimeLocal: '',
            nextAppointmentProviderDisplayName: 'test1'
        },
        nextAppointmentIsToday: false
    },
    BenefitPlans: [
        {
            PatientBenefitPlanId: "c15fbddd-1134-4ab0-95eb-3a2b46cea7cc",
            PolicyHolderId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
            PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
            BenefitPlanId: "6083e1f6-6d87-44e8-b387-69fd6ce7b7d9",
            PolicyHolderBenefitPlanId: "e8e41054-f354-4f89-8607-5caa944550f1",
            PolicyHolderStringId: "HardCodedHolderId",
            RelationshipToPolicyHolder: null,
            DependentChildOnly: false,
            EffectiveDate: null,
            IndividualDeductibleUsed: 88,
            IndividualMaxUsed: 0,
            Priority: 0,
            EligibleEPSDTTitleXIX: null,
            ObjectState: null,
            FailedMessage: null,
            PolicyHolderBenefitPlanDto: {
                PolicyHolderBenefitPlanId: "e8e41054-f354-4f89-8607-5caa944550f1",
                PolicyHolderId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
                BenefitPlanId: "6083e1f6-6d87-44e8-b387-69fd6ce7b7d9",
                FamilyDeductibleUsed: 106,
                BenefitPlanDto: {
                    BenefitId: "6083e1f6-6d87-44e8-b387-69fd6ce7b7d9",
                    CarrierId: "f2a89eff-1073-43d6-8745-0b9d29da4fec",
                    FeeScheduleId: "bbadd832-32ce-4418-83ee-839b6319476a",
                    Name: "PhillipGuy Benefit Plan",
                    AddressLine1: null,
                    AddressLine2: null,
                    City: null,
                    State: null,
                    ZipCode: null,
                    PhoneNumbers: [],
                    Website: null,
                    Email: null,
                    PlanGroupNumber: null,
                    PlanGroupName: null,
                    RenewalMonth: 8,
                    CoverageList: [],
                    ServiceCodeExceptions: [],
                    Carrier: null,
                    AlternativeBenefits: [],
                    IndividualDeductible: 428,
                    FamilyDeductible: 224,
                    AnnualBenefitMaxPerIndividual: 9588,
                    SubmitClaims: true,
                    ClaimMethod: 2,
                    TrackClaims: true,
                    ApplyAdjustments: null,
                    FeesIns: 1,
                    AuthorizePaymentToOffice: true,
                    BenefitClause: false,
                    TaxPreference: 1,
                    InsurancePaymentTypeId: null,
                    AdjustmentTypeId: null,
                    Notes: null,
                    SecondaryCalculationMethod: 1,
                    CarrierName: "RomanO'connor Insurance Company",
                    BillingLocationAdditionalIdentifierId: null,
                    ServiceLocationAdditionalIdentifierId: null,
                    AdditionalProviderAdditionalIdentifierId: null,
                    TaxCalculation: 1,
                    TaxAssignment: 1,
                    IsActive: true,
                    IsLinkedToPatient: true,
                    DataTag: "AAAAAAAuRLo=",
                    UserModified: "00000000-0000-0000-0000-000000000000",
                    DateModified: "2022-01-21T17:37:41.4128877"
                },
                IsDeleted: false,
                DataTag: "AAAAAAAtEzs=",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
                DateModified: "2023-08-31T12:55:44.4749263"
            },
            PolicyHolderDetails: null,
            IsDeleted: false,
            AdditionalBenefits: 0,
            DataTag: "AAAAAAAtEzk=",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            DateModified: "2023-08-31T12:55:44.4749263"
        }, {
            PatientBenefitPlanId: "c15fbddd-1134-4ab0-95eb-3a2b46cea7cc",
            PolicyHolderId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
            PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
            BenefitPlanId: "6083e1f6-6d87-44e8-b387-69fd6ce7b7d9",
            PolicyHolderBenefitPlanId: "e8e41054-f354-4f89-8607-5caa944550f1",
            PolicyHolderStringId: "HardCodedHolderId",
            RelationshipToPolicyHolder: null,
            DependentChildOnly: false,
            EffectiveDate: null,
            IndividualDeductibleUsed: 88,
            IndividualMaxUsed: 0,
            Priority: 1,
            EligibleEPSDTTitleXIX: null,
            ObjectState: null,
            FailedMessage: null,
            PolicyHolderBenefitPlanDto: null,
            PolicyHolderDetails: null,
            IsDeleted: false,
            AdditionalBenefits: 0,
            DataTag: "AAAAAAAtEzk=",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            DateModified: "2023-08-31T12:55:44.4749263"
        }
    ],
    PreventiveServicesDue: [{
        PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
        PreventiveServiceTypeId: "6ec72852-f227-498a-b964-87c0966f0f88",
        PreventiveServiceTypeDescription: "Exam",
        DateServiceDue: "2024-05-13T19:34:22.75",
        DateServiceLastPerformed: "2023-07-13T19:34:22.75",
        IsTrumpService: true,
        Frequency: 10,
        AppointmentId: null,
        AppointmentStartTime: null,
        DaysSinceLast: 108,
        DaysUntilDue: 196,
        PercentTimeRemaining: 64.47368421052632
    }],
    Phones: [{
        PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
        ContactId: "27e17f98-df00-4a64-827f-7b496c12c87f",
        PhoneNumber: "2546789823",
        Type: "Home",
        TextOk: false,
        ReminderOK: false,
        Notes: null,
        IsPrimary: true,
        ObjectState: "None",
        FailedMessage: null,
        PhoneReferrerId: null,
        PhoneReferrer: null,
        Links: null,
        DataTag: "AAAAAAAuma0=",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DateModified: "2023-10-27T15:29:29.2321665"
    }],
    Emails: [{
        PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
        PatientEmailId: "3ec526ce-5a3e-49f8-8bf9-d92a5609de1a",
        Email: "abc@test.com",
        ReminderOK: false,
        IsPrimary: true,
        AccountEmailId: null,
        AccountEMail: null,
        Links: null,
        ObjectState: "None",
        FailedMessage: null,
        DataTag: "AAAAAAAumak=",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DateModified: "2023-10-27T15:29:29.4665456"
    }],
    ActiveTreatmentPlanCount: 0,
    PatientLocations: [],
    PatientGroups: [],
    AccountMemberOverview: null,
    Updated: null,
    ResponsiblePersonType: 1,
    imageUrl: null,
    hasImage: null
};

const mockLocations = [{
    id: 6497004,
    name: "66",
    practiceid: 38638,
    merchantid: "",
    description: "",
    timezone: "Mountain Standard Time",
    deactivationTimeUtc: null
}, {
    id: 6606323,
    name: "67",
    practiceid: 38639,
    merchantid: "",
    description: "",
    timezone: "Mountain Standard",
    deactivationTimeUtc: null
}];

const mockGetPatientFlag = {
    ExtendedStatusCode: null,
    Value: [
        { PatientAlertId: "39d45674-67ee-4f22-926b-0304f601e245", MasterAlertId: "d9387eae-09e9-4f62-9f6c-8657105ecdbc", PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6", Description: "test1", SymbolId: null, ExpirationDate: null, ObjectState: null, FailedMessage: null, DataTag: "AAAAAAAuVoo=", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf", DateModified: "2023-10-17T07:14:43.5959247" },
        { PatientAlertId: "a1027316-bfbf-4baf-ba6e-22f36858cb61", MasterAlertId: "d7f96a0f-1f3a-43ab-9b87-870f968f3361", PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6", Description: "test", SymbolId: "12", ExpirationDate: null, ObjectState: null, FailedMessage: null, DataTag: "AAAAAAAuVow=", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf", DateModified: "2023-10-17T07:14:43.5803005" },
        { PatientAlertId: "a1027316-bfbf-4baf-ba6e-22f36858cb62", MasterAlertId: "d7f96a0f-1f3a-43ab-9b87-870f968f3362", PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6", Description: "test", SymbolId: "12", ExpirationDate: null, ObjectState: null, FailedMessage: null, DataTag: "AAAAAAAuVow=", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf", DateModified: "2023-10-17T07:14:43.5803005" },
        { PatientAlertId: "a1027316-bfbf-4baf-ba6e-22f36858cb63", MasterAlertId: "d7f96a0f-1f3a-43ab-9b87-870f968f3363", PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6", Description: "test", SymbolId: "12", ExpirationDate: null, ObjectState: null, FailedMessage: null, DataTag: "AAAAAAAuVow=", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf", DateModified: "2023-10-17T07:14:43.5803005" },
        { PatientAlertId: "a1027316-bfbf-4baf-ba6e-22f36858cb64", MasterAlertId: "d7f96a0f-1f3a-43ab-9b87-870f968f3364", PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6", Description: "test", SymbolId: "12", ExpirationDate: null, ObjectState: null, FailedMessage: null, DataTag: "AAAAAAAuVow=", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf", DateModified: "2023-10-17T07:14:43.5803005" },
        { PatientAlertId: "a1027316-bfbf-4baf-ba6e-22f36858cb65", MasterAlertId: "d7f96a0f-1f3a-43ab-9b87-870f968f3365", PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6", Description: "test", SymbolId: "12", ExpirationDate: null, ObjectState: null, FailedMessage: null, DataTag: "AAAAAAAuVow=", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf", DateModified: "2023-10-17T07:14:43.5803005" },
        { PatientAlertId: "a1027316-bfbf-4baf-ba6e-22f36858cb66", MasterAlertId: "d7f96a0f-1f3a-43ab-9b87-870f968f3366", PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6", Description: "test", SymbolId: "12", ExpirationDate: null, ObjectState: null, FailedMessage: null, DataTag: "AAAAAAAuVow=", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf", DateModified: "2023-10-17T07:14:43.5803005" },
        { PatientAlertId: "a1027316-bfbf-4baf-ba6e-22f36858cb67", MasterAlertId: "d7f96a0f-1f3a-43ab-9b87-870f968f3367", PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6", Description: "test", SymbolId: "12", ExpirationDate: null, ObjectState: null, FailedMessage: null, DataTag: "AAAAAAAuVow=", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf", DateModified: "2023-10-17T07:14:43.5803005" },
        { PatientAlertId: "a1027316-bfbf-4baf-ba6e-22f36858cb68", MasterAlertId: "d7f96a0f-1f3a-43ab-9b87-870f968f3368", PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6", Description: "test", SymbolId: "12", ExpirationDate: null, ObjectState: null, FailedMessage: null, DataTag: "AAAAAAAuVow=", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf", DateModified: "2023-10-17T07:14:43.5803005" },
    ],
    Count: null,
    InvalidProperties: null
};

const mockPatientMedicalHistoryAlerts = {
    ExtendedStatusCode: null,
    Value: null,
    Count: null,
    InvalidProperties: null
};

describe('RegistrationHeaderComponent', () => {
    let component: RegistrationHeaderComponent;
    let fixture: ComponentFixture<RegistrationHeaderComponent>;
    let personFactory;

    const mockFeatureFlagService = {
        getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(
            of({
                Value: []
            })),
    };

    const mockserviceImage = {
        IsAuthorizedByAbbreviation: (authtype: string) => { },
        getServiceStatus: () =>
            new Promise((resolve, reject) => {
                // the resolve / reject functions control the fate of the promise
            }),
        esCancelEvent: new BehaviorSubject<unknown>(undefined),
        isEnabled: () => new Promise((resolve, reject) => { }),
        getCurrentLocation: jasmine
            .createSpy()
            .and.returnValue({ practiceId: 'test' }),
    };
    const personInfo = {
        FirstName: 'Test', MiddleName: 'M',
        LastName: 'User', UserCode: 'TST01'
    };
    const mockFeatureService = {
        isEnabled: () => { return { then: (res) => { res(true) } } },
    };

    const mockMasterService = {

    }
    const mockservice = {
        get: jasmine.createSpy().and.returnValue([{}]),
        entityNames: { users: 'users' },
        findItemsByFieldValue: jasmine.createSpy().and.returnValue([personInfo]),
        getAllLocations: () => {
            return {
                then: (res) => {
                    res(mockLocations)
                }
            }
        },
        getRegistrationEvent: () => of({}),
        setRegistrationEvent: jasmine.createSpy().and.returnValue({}),
        IsAuthorizedByAbbreviation: () => { },
        generateMessage: jasmine.createSpy('patSecurityService.generateMessage'),
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message'),
        SetActiveNoteTemplate: jasmine.createSpy().and.callFake(function () { }),
        WarningModal: jasmine.createSpy('ModalFactory.WarningModal').and.callFake(() => {
            return { then() { return [] } };
        }),
        path: () => '',
        findIndexByFieldValue: () => { return { then: (res) => { res(0) } } },

    };
    const mockPatientDetailService = {
        getPatientDashboardOverviewByPatientId: () => {
            return {
                then: (res) => {
                    res(mockPatientOverview)
                }
            }
        }
    };
    const mockStaticData = {
        AlertIcons: () => { }
    };
    const patientMedicalHistoryAlertsFactory = {
        PatientMedicalHistoryAlerts: () => {
            return {
                then: (res) => {
                    res(mockPatientMedicalHistoryAlerts)
                }
            }
        }
    };
    const mockDatePipe = {
        transform: () => { }
    };
    const personResult = { Value: '' };
    const mockPersonFactory = {
        getById: jasmine.createSpy('PersonFactory.getById').and.returnValue({
            then: function (callback) {
                callback(personResult);
            }
        }),
        getPatientAlerts: () => {
            return {
                then: (res) => { res({ mockGetPatientFlag }) }
            }
        },
        SetPatientAlerts: () => {
            return {
                then: (res) => { res({ mockGetPatientFlag }) }
            }
        },
        PatientAlerts: () => {
            return {
                then: (res) => { res(null) }
            }
        },
        SetPatientMedicalHistoryAlerts: jasmine.createSpy(),
        $broadcast: jasmine.createSpy()
    };

    const mockDiscardChangesService = {
        onRegisterController: jasmine.createSpy(),
        currentChangeRegistration: { customMessage: false, controller: 'ChartCustomColorsController' }
    };

    const mockPatientNotesFactory = {
        setDataChanged: jasmine.createSpy(),
        DataChanged: ''
    }
    const mockSoarConfig = {
        domainUrl: 'https://localhost:35440',
    };

    const mockLocalizeService = {
        getLocalizedString: () => 'translated text'
    };

    const blueImagingServiceSpy = jasmine.createSpyObj('BlueImagingService', ['getImage']);

     const rootScope = {
        patAuthContext: {
            userInfo: { UserId: '1234' }
        },
        $on: jasmine.createSpy().and.returnValue({}),
    }

    const mockRouteParams = {}
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), OverlayModule, HttpClientTestingModule],
            declarations: [RegistrationHeaderComponent, AppButtonComponent],
            providers: [
                { provide: 'referenceDataService', useValue: mockservice },
                { provide: 'ListHelper', useValue: mockservice },
                { provide: 'windowObject', useValue: mockservice },
                { provide: PatientRegistrationService, useValue: mockservice },
                { provide: 'patSecurityService', useValue: mockservice },
                { provide: 'toastrFactory', useValue: mockservice },
                { provide: 'locationService', useValue: mockservice },
                { provide: PatientDetailService, useValue: mockPatientDetailService },
                { provide: DatePipe, useValue: mockDatePipe },
                { provide: 'StaticData', useValue: mockStaticData },
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: 'PersonFactory', useValue: mockPersonFactory },
                { provide: 'PatientMedicalHistoryAlertsFactory', useValue: patientMedicalHistoryAlertsFactory },
                { provide: 'FeatureService', useValue: mockFeatureService },
                { provide: 'NoteTemplatesHttpService', useValue: mockservice },
                { provide: 'DiscardChangesService', useValue: mockDiscardChangesService },
                { provide: 'PatientNotesFactory', useValue: mockPatientNotesFactory },
                { provide: 'ModalFactory', useValue: mockservice },
                { provide: 'SoarConfig', useValue: mockSoarConfig },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: '$location', useValue: mockservice },
                { provide: BlueImagingService, useValue: blueImagingServiceSpy },
                { provide: ImagingMasterService, useValue: mockserviceImage },
                { provide: '$rootScope', useValue: rootScope },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },

            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RegistrationHeaderComponent);
        spyOn(window.sessionStorage, 'getItem').and.callFake(() => (JSON.stringify({ Result: { User: '1' } })));
        component = fixture.componentInstance;
        personFactory = TestBed.get('PersonFactory');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should set value on ngOnInit ', () => {
            component.isPatientHeader = false
            spyOn(component,'highlightDrawer');
            component.ngOnInit()
            expect(component.todaysDate).not.toBe(null);
            expect(component.pageTitle).toBe('Add Person');
            expect(component.highlightDrawer).toHaveBeenCalled();
        });
    });

    describe('getUserInformation', () => {
        it('User Information Should be in Correct Format', () => {
            component.getUserInfromation();
            const expectedInfo = `${personInfo.FirstName} ${personInfo.MiddleName} ${personInfo.LastName} - ${personInfo.UserCode}`;
            expect(component.userInformation).toBe(expectedInfo);
        });
    });

    describe('toggleMoreInfo', () => {
        beforeEach(() => {
            component.patientDetail = mockPatientOverview;
        });
        it('should toggle displayMoreInfo from true to false', () => {
            component.displayMoreInfo = true;
            component.toggleMoreInfo();
            expect(component.displayMoreInfo).toBe(false);
        });

        it('should toggle displayMoreInfo from false to true', () => {
            component.displayMoreInfo = false;
            component.toggleMoreInfo();
            expect(component.displayMoreInfo).toBe(true);
            expect(component.prevCareDue).toEqual('2024-05-13T19:34:22.75');
            expect(component.displayPhone).toEqual('2546789823');
            expect(component.displayPhoneType).toEqual('Home');
            expect(component.displayEmail).toEqual('abc@test.com');
            expect(component.displayAddressLine1).toEqual('TestAddress');
            expect(component.displayAddressLine2).toEqual('555 Common Street');
            expect(component.displayCity).toEqual('Burch');
            expect(component.displayState).toEqual('IL');
            expect(component.displayZipCode).toEqual('90210');
        });

        it('should check patient Address in AddressReferrer', () => {
            component.patientDetail.Profile.AddressReferrer = {
                AddressLine1: "TestAddress1",
                AddressLine2: "555 Common Street1",
                City: "Burch test 1",
                State: "IL",
                ZipCode: "90210",
            }
            component.toggleMoreInfo();
            expect(component.displayAddressLine1).toEqual('TestAddress1');
            expect(component.displayAddressLine2).toEqual('555 Common Street1');
            expect(component.displayCity).toEqual('Burch test 1');
            expect(component.displayState).toEqual('IL');
            expect(component.displayZipCode).toEqual('90210');
            expect(component.displayProviderNextAppt).toEqual('test1');
        });

        it('should check patient About info', () => {
            component.toggleMoreInfo();
            expect(component.displayProviderNextAppt).toEqual('test1');
        });

        it('should call when AddressReferrer is null', () => {
            component.patientDetail.Profile.AddressReferrer = null;
            component.patientDetail.Profile = null;
            component.toggleMoreInfo();
            expect(component.displayAddressLine1).toEqual('No Address on File');
        });
    });

    describe('displayStatus', () => {
        it('should set value of displayStatus as In Collections', () => {
            component.patientProfile = mockPatientOverview;
            component.patientProfile.PersonAccount = {
                AccountId: '123',
                PersonId: '23',
                StatementAccountId: 12,
                DisplayStatementAccountId: '456',
                PersonAccountMember: null,
                InCollection: true,
                ReceivesStatements: true,
                ReceivesFinanceCharges: true,
                DataTag: '12',
                UserModified: 'Mona.K',
                DateModified: '02/03/2024'
            };
            component.isPatientHeader = true;
            component.getPatientStatusDisplay();
            expect(component.displayStatus).toBe('In Collections');
        });
        it('should set value of displayStatus as Active Patient', () => {
            component.patientProfile = mockPatientOverview;
            component.patientProfile.IsPatient = true;
            component.patientProfile.IsActive = true;
            component.patientProfile.PersonAccount.InCollection = false;
            component.isPatientHeader = true;
            component.getPatientStatusDisplay();
            expect(component.displayStatus).toBe('Active Patient');
        });


    });
    describe('cancel', () => {
        it('should toggle cancel method', () => {
            component.isOpen = false;
            component.cancel();
            expect(component.isOpen).toBe(true)
        });
    });

    describe('alertsFlagPopover', () => {
        it('should toggle alertsFlagPopover method', () => {
            component.togglePopover = false;
            component.alertsFlagPopover();
            expect(component.togglePopover).toBe(true)
        });
    });

    describe('ngOnChanges', () => {
        it('should correctly update properties when changes occur', () => {
            const changes: SimpleChanges = {
                patientProfile: {
                    currentValue: {
                        PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6",
                        FirstName: "Hope",
                        MiddleName: "M",
                        LastName: "Baker",
                        PreferredName: "TestPatient",
                        Prefix: null,
                        Suffix: "Jr",
                        PatientCode: "BAKHO1",
                        IsActive: true,
                        Sex: "M",
                        DateOfBirth: "1993-02-05T00:00:00",
                    },
                    isFirstChange: () => { return false; },
                    previousValue: undefined,
                    firstChange: false
                }
            }
            component.ngOnChanges(changes);
            expect(component.pageTitle).toBe('Baker Jr, Hope M (TestPatient)')
            expect(component.patientInitials).toBe('HB')
            expect(component.description).toBe('Male')
            expect(component.dateOfBirth).toBe('1993-02-05T00:00:00')
            expect(component.status).toBe('Active Non-Patient')
            expect(component.patientId).toBe('BAKHO1')
        });

        it('shound Check Secoundary Navigation Tab when routeParams in Clinical', () => {
            const changes: SimpleChanges = {}
            component.routeParams.Category = 'Clinical'
            component.ngOnChanges(changes);
            expect(component.showDrawerNav).toBeTruthy()
            expect(component.showCommunicationDrawerNav).toBeFalsy()
        });

        it('shound Check Secoundary Navigation Tab when routeParams in Communication', () => {
            const changes: SimpleChanges = {}
            component.routeParams.Category = 'Communication'
            component.ngOnChanges(changes);
            expect(component.showDrawerNav).toBeTruthy()
            expect(component.showCommunicationDrawerNav).toBeTruthy()
        });
    });

    describe('getMedicalHistoryAlerts', () => {
        it('should call patientMedicalHistoryAlertsFactory when PatientMedicalHistoryAlerts not found', () => {
            component.hasMedicalAlertsViewAccess = true;
            component.filterAlertsByType = jasmine.createSpy()
            component.getMedicalHistoryAlerts();
            expect(component.filterAlertsByType).toHaveBeenCalled()
        });
    });

    describe('filterAlertsByType', () => {
        it('should set patientAllergyAlerts', () => {
            const res = [{ MedicalHistoryAlertTypeId: 1 }, { MedicalHistoryAlertTypeId: 2 }]
            component.filterAlertsByType(res);
            expect(component.patientAllergyAlerts.length).toBeGreaterThan(0);
        });
    });

    describe('navigateNewProfile', () => {
        //UT for this method is not possible as it has window.location.href = '/'; which is causing issue.
    })

    describe('getPatientFlags', () => {
        it('should called when personFactory.PatientAlerts method is not null', () => {
            component.hasMedicalAlertsViewAccess = true;
            personFactory.PatientAlerts = mockGetPatientFlag.Value;
            component.patientAlertsServiceGetSuccess = jasmine.createSpy()
            component.getPatientFlags()
            expect(component.patientAlertsServiceGetSuccess).toHaveBeenCalled()
        });
        it('should called when personFactory.PatientAlerts method is null', () => {
            component.hasMedicalAlertsViewAccess = true;
            personFactory.PatientAlerts = null;
            component.patientAlertsServiceGetSuccess = jasmine.createSpy()
            component.getPatientFlags()
            expect(component.patientAlertsServiceGetSuccess).toHaveBeenCalled()
        });
    });

    describe('patientAlertsServiceGetSuccess', () => {
        it('should correctly set properties when res is defined and contains alerts', () => {
            component.masterAlerts = [];
            component.patientAlertsServiceGetSuccess(mockGetPatientFlag)
            expect(component.masterAlerts.length).toBeGreaterThan(0)
        });
        it('should check masterAlerts length is less then 8', () => {
            const mockPatientFlag = {
                ExtendedStatusCode: null,
                Value: [
                    { PatientAlertId: "a1027316-bfbf-4baf-ba6e-22f36858cb67", MasterAlertId: "d7f96a0f-1f3a-43ab-9b87-870f968f3367", PatientId: "6907bb9d-1769-44d1-ad3c-b97c2fabf3e6", Description: "test", SymbolId: "12", ExpirationDate: null, ObjectState: null, FailedMessage: null, DataTag: "AAAAAAAuVow=", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf", DateModified: "2023-10-17T07:14:43.5803005" }
                ],
                Count: null,
                InvalidProperties: null
            };
            component.patientAlertsServiceGetSuccess(mockPatientFlag)
            expect(component.Alerts.length).toBeGreaterThan(0)
        });
    });

    describe('HostListener', () => {
        it('should close popover when clicking outside', () => {
            component.togglePopover = true;
            // Mock the DOM element and event
            const fakePopoverElement = document.createElement('div');
            fakePopoverElement.classList.add('customStylingDynamicLinks');
            document.body.appendChild(fakePopoverElement);

            const fakeClickEvent = new MouseEvent('click');
            document.dispatchEvent(fakeClickEvent);
            fixture.detectChanges();
            expect(component.togglePopover).toBe(false);
            document.body.removeChild(fakePopoverElement);
        });
    });

    describe('getClass', () => {
        it('should return undefined for an invalid ID', () => {
            const id = 1;
            const result = component.getClass(id);
            expect(result).toBeUndefined();
        });
    });

    describe('getAlertDescription', () => {
        it('should return translated alert description', () => {
            const alert = [
                { MedicalHistoryAlertDescription: 'Alert 1' },
                { MedicalHistoryAlertDescription: 'Alert 2' }
            ];
            const expectedAlertMessage = 'Alert 1<br/>Alert 2<br/>';
            const result = component.getAlertDescription(alert);
            expect(result).toEqual(expectedAlertMessage);
        });
    });

    describe('patientHasAddress', () => {
        it('should return true if the profile has an address', () => {
            const profile = { AddressLine1: '123 Main St', City: 'Sample City', State: 'CA', ZipCode: '12345', };
            const result = component.patientHasAddress(profile);
            expect(result).toBe(true);
        });

        it('should return false if the profile has no address', () => {
            const profile = { FirstName: 'John', LastName: 'Doe', };
            const result = component.patientHasAddress(profile);
            expect(result).toBe(false);
        });
    });

    describe('savePatient', () => {
        it('should call setRegistrationEvent if hasCreateAccess is true', () => {
            component.hasCreateAccess = true;
            const triggerData = { data: 'some data' };
            const cancelEvent = false;
            component.savePatient(triggerData, cancelEvent);
            expect(mockservice.setRegistrationEvent).toHaveBeenCalledWith({
                eventtype: 9,
                data: { triggerData, cancelEvent },
            });
        });
    });
    
    describe('highlightDrawer', () => {
        it('should highlight the timeline drawer as per value in routeParams', () => {
            // Arrange
            component.routeParams.activeSubTab = '0';

            // Act
            component.highlightDrawer();

            //Assert
            expect(component.drawerChange).toEqual(CommunicationDrawer.TimelineDrawer);
        });

        it('should highlight the charting drawer as per value in routeParams', () => {
            // Arrange
            component.routeParams.activeSubTab = '1';

            // Act
            component.highlightDrawer();

            //Assert
            expect(component.drawerChange).toEqual(CommunicationDrawer.ChartingDrawer);
        });

        it('should highlight the treatment plan drawer as per value in routeParams', () => {
            // Arrange
            component.routeParams.activeSubTab = '2';

            // Act
            component.highlightDrawer();

            //Assert
            expect(component.drawerChange).toEqual(CommunicationDrawer.TreatmentPlanDrawer);
        });

        it('should highlight the notes drawer as per value in routeParams', () => {
            // Arrange
            component.routeParams.activeSubTab = '3';

            // Act
            component.highlightDrawer();

            //Assert
            expect(component.drawerChange).toEqual(CommunicationDrawer.NotesDrawer);
        });

        it('should highlight the timeline drawer when routeParams value is invalid', () => {
            // Arrange
            component.routeParams.activeSubTab = '10';

            // Act
            component.highlightDrawer();

            //Assert
            expect(component.drawerChange).toEqual(CommunicationDrawer.TimelineDrawer);
        });
    });
});


