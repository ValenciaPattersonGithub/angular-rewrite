import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentsGridWidgetComponent } from './appointments-grid-widget.component';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentStatusDataService } from 'src/scheduling/appointment-statuses';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { of, throwError } from 'rxjs';
import { ProviderType, RoleNames } from 'src/business-center/practice-settings/team-members/team-member';
import cloneDeep from 'lodash/cloneDeep';
import { AlertTypes, GridSortField, ProviderAppointments } from './appointments-grid-widget';
import moment from 'moment-timezone';
import { SortDescriptor } from '@progress/kendo-data-query';
import { PatSharedService } from 'src/@shared/providers';
import { SaveStates } from 'src/@shared/models/transaction-enum';
import { Location } from 'src/practices/common/models/location.model';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { LocationTimeService } from 'src/practices/common/providers/location-time.service';
import { PlaceOfTreatmentEnum } from '../../../../@core/data-services/claim-enum.service';

let mockSoarConfig;
let dashboardWidgetService: DashboardWidgetService;
let appointmentStatusDataService: AppointmentStatusDataService;
let mockAppointmentData;
let mockLocationStub: Location;
let mockLocations;
let mockLocation;
let mockUserLocation;
let tempUserData;
let tempPatContext;
let appointmentStatusDataServiceMock;
let usersFactoryMock;
let referenceDataServiceMock;
let toastrFactoryMock;
let tabLauncherMock;
let appointmentViewVisibleServiceMock;
let appointmentViewDataLoadingServiceMock;
let dashboardWidgetServiceMock;
let mockRootScope;
let mockPatSharedService;
let mocklocationTimeService;
let mockFeatureFlagService;
let mockSubscription;

describe('AppointmentsGridWidgetComponent', () => {
    let component: AppointmentsGridWidgetComponent;
    let fixture: ComponentFixture<AppointmentsGridWidgetComponent>;
    beforeEach(async () => {
        mockSoarConfig = {};
        dashboardWidgetService = new DashboardWidgetService(mockSoarConfig, null);
        appointmentStatusDataService = new AppointmentStatusDataService();

        mockAppointmentData = {
            DefaultFilter: null,
            Data: {},
            FilterList: [],
            Appointment: [
                {
                    MedicalHistoryAlerts: [
                        {
                            PatientId: "7bede823-c132-4745-ae7f-656cddd511b1",
                            MedicalHistoryAlertDescription: "Allergic to aspirin",
                            MedicalHistoryAlertTypeId: 1
                        }
                    ],
                    Appointment: {
                        AppointmentId: "e6d6b26d-20d3-4c1e-89a5-c63b699ef6a1",
                        AppointmentTypeId: "fa3e348d-7d07-4199-88bb-ebe9b7922d74",
                        PersonId: "7bede823-c132-4745-ae7f-656cddd511b1",
                        TreatmentRoomId: "cc70653f-0efa-4324-95ba-dce19c547a8c",
                        UserId: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                        Classification: 0,
                        Description: null,
                        Note: "New Appoitment",
                        StartTime: "2023-10-27T17:00:00",
                        EndTime: "2023-10-27T17:40:00",
                        ActualStartTime: null,
                        ActualEndTime: null,
                        ProposedDuration: null,
                        Status: 0,
                        StatusNote: null,
                        ReminderMethod: null,
                        ExaminingDentist: null,
                        IsExamNeeded: false,
                        ProviderAppointments: [
                            {
                                ProviderAppointmentId: "923aca7d-a5b5-4c63-a2ef-7171dbedb2b5",
                                UserId: "1",
                                AppointmentId: dashboardWidgetService.emptyGuId,
                                PracticeId: 0,
                                EndTime: "2023-10-27T17:30:00",
                                StartTime: "2023-10-27T17:15:00",
                                ObjectState: SaveStates.None,
                                FailedMessage: null,
                                DataTag: "AAAAAB3XUzM=",
                                UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                                DateModified: "2023-10-23T12:48:34.7931008"
                            },
                            {
                                ProviderAppointmentId: "88e9c8e4-51a0-4d03-876b-faaa7d00814e",
                                UserId: "1",
                                AppointmentId: dashboardWidgetService.emptyGuId,
                                PracticeId: 0,
                                EndTime: "2023-10-27T17:15:00",
                                StartTime: "2023-10-27T17:00:00",
                                ObjectState: SaveStates.None,
                                FailedMessage: null,
                                DataTag: "AAAAAB3XUzI=",
                                UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                                DateModified: "2023-10-23T12:48:34.7931008"
                            }
                        ],
                        PlannedServices: [],
                        IsDeleted: null,
                        IsBeingClipped: false,
                        DeletedReason: null,
                        IsSooner: false,
                        IsPinned: false,
                        LocationId: 1,
                        LocationTimezoneInfo: null,
                        MissedAppointmentTypeId: null,
                        DataTag: "AAAAAB3XUzE=",
                        UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                        DateModified: "2023-10-23T12:48:34.7931008",
                        Location: {
                            LocationId: 1
                        }
                    },
                    ContactInformation: null,
                    Alerts: null,
                    Person: {
                        PatientId: "7bede823-c132-4745-ae7f-656cddd511b1",
                        FirstName: "David ",
                        MiddleName: "C",
                        LastName: "Color",
                        PreferredName: "Dave.",
                        Prefix: null,
                        Suffix: "",
                        AddressReferrerId: null,
                        AddressReferrer: null,
                        AddressLine1: "1025 David color Street",
                        AddressLine2: "111 Main str",
                        City: "Fort Maine",
                        State: "AZ",
                        ZipCode: "414444444",
                        Sex: "M",
                        DateOfBirth: "1958-05-09T00:00:00",
                        IsPatient: true,
                        PatientSince: "2022-05-19T18:54:07.3868595",
                        PatientCode: "COLDA19",
                        EmailAddress: null,
                        EmailAddressRemindersOk: false,
                        EmailAddress2: null,
                        EmailAddress2RemindersOk: false,
                        ThirdPartyPatientId: 0,
                        PersonAccount: {
                            AccountId: dashboardWidgetService.emptyGuId,
                            PersonId: dashboardWidgetService.emptyGuId,
                            StatementAccountId: 0,
                            DisplayStatementAccountId: null,
                            PersonAccountMember: null,
                            InCollection: false,
                            ReceivesStatements: false,
                            ReceivesFinanceCharges: false,
                            DataTag: null,
                            UserModified: dashboardWidgetService.emptyGuId,
                            DateModified: "0001-01-01T00:00:00"
                        },
                        ResponsiblePersonType: 0,
                        ResponsiblePersonId: null,
                        ResponsiblePersonName: null,
                        IsResponsiblePersonEditable: false,
                        PreferredLocation: 3933677,
                        PreferredDentist: null,
                        PreferredHygienist: "ed421057-ea98-4d19-95ef-1e9df316763c",
                        IsActive: true,
                        IsSignatureOnFile: true,
                        EmailAddresses: null,
                        DirectoryAllocationId: "28ff2524-b38f-4920-92d1-139d198a15cd",
                        MailAddressRemindersOK: false,
                        PatientLocations: null,
                        PrimaryDuplicatePatientId: null,
                        IsRxRegistered: false,
                        HeightFeet: 0,
                        HeightInches: 0,
                        Weight: "0",
                        DataTag: "AAAAAB3IQS0=",
                        UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                        DateModified: "2023-10-16T11:20:45.4898199"
                    },
                    ServiceCodes: [],
                    Room: {
                        RoomId: "cc70653f-0efa-4324-95ba-dce19c547a8c",
                        LocationId: 1700070,
                        Name: "Room 101",
                        ObjectState: SaveStates.None,
                        FailedMessage: null,
                        DataTag: "AAAAAACzERs=",
                        UserModified: "c252df59-9604-4ebf-95b1-f1ca2095d241",
                        DateModified: "2019-02-10T16:54:18.6347373"
                    },
                    Location: {
                        LocationId: 1,
                        NameLine1: "Innovators",
                        NameLine2: "Test",
                        NameAbbreviation: "Innovators Location",
                        ImageFile: null,
                        LogoFile: null,
                        Website: null,
                        Timezone: "Central Standard Time",
                        DeactivationTimeUtc: null,
                        AddressLine1: "Address Line 1",
                        AddressLine2: null,
                        City: "City",
                        State: "MN",
                        ZipCode: "55000",
                        Email: "email@location.com",
                        PrimaryPhone: "1523432332",
                        SecondaryPhone: "1523432333",
                        Fax: "1523432334",
                        TaxId: "333333333",
                        TypeTwoNpi: "1000000006",
                        TaxonomyId: 1,
                        LicenseNumber: "4500023",
                        ProviderTaxRate: 0.02000,
                        SalesAndUseTaxRate: 0.05000,
                        DefaultFinanceCharge: 2.00000,
                        AccountsOverDue: "30",
                        MinimumFinanceCharge: 2.00000,
                        Rooms: [],
                        AdditionalIdentifiers: [],
                        MasterLocationAdditionalIdentifiers: [],
                        MerchantId: "C51D41D5CE6351043681E4FC8C51A963C9CE2D9447B4C4F8E4A3482A8DDB5FEA9452B55156974DDB5C",
                        IsPaymentGatewayEnabled: true,
                        DisplayCardsOnEstatement: false,
                        AcceptMasterCardOnEstatement: false,
                        AcceptDiscoverOnEstatement: false,
                        AcceptVisaOnEstatement: false,
                        AcceptAmericanExpressOnEstatement: false,
                        IncludeCvvCodeOnEstatement: false,
                        RemitAddressSource: 0,
                        RemitOtherLocationId: null,
                        RemitToNameLine1: null,
                        RemitToNameLine2: null,
                        RemitToAddressLine1: null,
                        RemitToAddressLine2: null,
                        RemitToCity: null,
                        RemitToState: null,
                        RemitToZipCode: null,
                        RemitToPrimaryPhone: null,
                        InsuranceRemittanceAddressSource: 0,
                        InsuranceRemittanceOtherLocationId: null,
                        InsuranceRemittanceNameLine1: null,
                        InsuranceRemittanceNameLine2: null,
                        InsuranceRemittanceAddressLine1: null,
                        InsuranceRemittanceAddressLine2: null,
                        InsuranceRemittanceCity: null,
                        InsuranceRemittanceState: null,
                        InsuranceRemittanceZipCode: null,
                        InsuranceRemittancePrimaryPhone: null,
                        InsuranceRemittanceTaxId: null,
                        InsuranceRemittanceTypeTwoNpi: null,
                        InsuranceRemittanceLicenseNumber: null,
                        FeeListId: 5,
                        IsRxRegistered: false,
                        DataTag: "AAAAAB19JDE=",
                        UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                        DateModified: "2023-06-26T07:36:17.5259304"
                    },
                    AppointmentType: {
                        AppointmentTypeId: "fa3e348d-7d07-4199-88bb-ebe9b7922d74",
                        Name: "Crown Bridge Delivery",
                        AppointmentTypeColor: "#FFFFBB",
                        FontColor: "#000000",
                        PerformedByProviderTypeId: 1,
                        DefaultDuration: 40,
                        UsualAmount: null,
                        UpdatesNextPreventiveAppointmentDate: false,
                        DataTag: "AAAAAAAACHA=",
                        UserModified: dashboardWidgetService.emptyGuId,
                        DateModified: "2019-02-06T16:48:10.109338"
                    },
                    ProviderUsers: [
                        {
                            UserId: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                            FirstName: "FuseOld",
                            MiddleName: null,
                            LastName: "Administrator",
                            PreferredName: null,
                            SuffixName: null,
                            DateOfBirth: "1992-05-01T23:59:00",
                            UserName: "fuseadmin@fakeemail.com",
                            UserCode: "ADMFU1",
                            ImageFile: null,
                            EmployeeStartDate: null,
                            EmployeeEndDate: null,
                            Address: {
                                AddressLine1: "Address 1",
                                AddressLine2: "Address 2",
                                City: "Minnesotta",
                                State: "AK",
                                ZipCode: "44444"
                            },
                            DepartmentId: null,
                            JobTitle: null,
                            RxUserType: 2,
                            TaxId: "684646514",
                            FederalLicense: "646468468498498",
                            DeaNumber: "",
                            NpiTypeOne: "1000000007",
                            PrimaryTaxonomyId: null,
                            SecondaryTaxonomyId: null,
                            DentiCalPin: null,
                            StateLicense: null,
                            AnesthesiaId: null,
                            IsActive: true,
                            StatusChangeNote: null,
                            ProfessionalDesignation: "DMD",
                            Locations: null,
                            Roles: null,
                            ShowCardServiceDisabledMessage: false,
                            IsRxRegistered: false,
                            DataTag: "AAAAAB1Na0s=",
                            UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                            DateModified: "2023-06-12T15:40:59.4044197"
                        },
                        {
                            UserId: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                            FirstName: "FuseOld",
                            MiddleName: null,
                            LastName: "Administrator",
                            PreferredName: null,
                            SuffixName: null,
                            DateOfBirth: "1992-05-01T23:59:00",
                            UserName: "fuseadmin@fakeemail.com",
                            UserCode: "ADMFU1",
                            ImageFile: null,
                            EmployeeStartDate: null,
                            EmployeeEndDate: null,
                            Address: {
                                AddressLine1: "Address 1",
                                AddressLine2: "Address 2",
                                City: "Minnesotta",
                                State: "AK",
                                ZipCode: "44444"
                            },
                            DepartmentId: null,
                            JobTitle: null,
                            RxUserType: 2,
                            TaxId: "684646514",
                            FederalLicense: "646468468498498",
                            DeaNumber: "",
                            NpiTypeOne: "1000000007",
                            PrimaryTaxonomyId: null,
                            SecondaryTaxonomyId: null,
                            DentiCalPin: null,
                            StateLicense: null,
                            AnesthesiaId: null,
                            IsActive: true,
                            StatusChangeNote: null,
                            ProfessionalDesignation: "DMD",
                            Locations: null,
                            Roles: null,
                            ShowCardServiceDisabledMessage: false,
                            IsRxRegistered: false,
                            DataTag: "AAAAAB1Na0s=",
                            UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
                            DateModified: "2023-06-12T15:40:59.4044197"
                        }
                    ],
                    MedicalAlerts: null,
                    DataTag: null,
                    UserModified: dashboardWidgetService.emptyGuId,
                    DateModified: "0001-01-01T00:00:00"
                }
            ]

        }

        mockLocationStub = {
            LocationId: 1,
            NameLine1: "Innovators",
            NameLine2: null,
            NameAbbreviation: "Innovators Location",
            ImageFile: null,
            LogoFile: null,
            Website: null,
            Timezone: "Central Standard Time",
            DeactivationTimeUtc: null,
            AddressLine1: "Address Line 1",
            AddressLine2: null,
            City: "City",
            State: "MN",
            ZipCode: "55000",
            Email: "email@location.com",
            PrimaryPhone: null,
            SecondaryPhone: null,
            Fax: null,
            TaxId: null,
            TypeTwoNpi: null,
            TaxonomyId: null,
            LicenseNumber: null,
            ProviderTaxRate: null,
            SalesAndUseTaxRate: null,
            DefaultFinanceCharge: null,
            AccountsOverDue: null,
            MinimumFinanceCharge: null,
            Rooms: [],
            AdditionalIdentifiers: [],
            MasterLocationAdditionalIdentifiers: [],
            MerchantId: null,
            IsPaymentGatewayEnabled: true,
            DisplayCardsOnEstatement: false,
            AcceptMasterCardOnEstatement: false,
            AcceptDiscoverOnEstatement: false,
            AcceptVisaOnEstatement: false,
            AcceptAmericanExpressOnEstatement: false,
            IncludeCvvCodeOnEstatement: false,
            RemitAddressSource: 0,
            RemitOtherLocationId: null,
            RemitToNameLine1: null,
            RemitToNameLine2: null,
            RemitToAddressLine1: null,
            RemitToAddressLine2: null,
            RemitToCity: null,
            RemitToState: null,
            RemitToZipCode: null,
            RemitToPrimaryPhone: null,
            InsuranceRemittanceAddressSource: 0,
            InsuranceRemittanceOtherLocationId: null,
            InsuranceRemittanceNameLine1: null,
            InsuranceRemittanceNameLine2: null,
            InsuranceRemittanceAddressLine1: null,
            InsuranceRemittanceAddressLine2: null,
            InsuranceRemittanceCity: null,
            InsuranceRemittanceState: null,
            InsuranceRemittanceZipCode: null,
            InsuranceRemittancePrimaryPhone: null,
            InsuranceRemittanceTaxId: null,
            InsuranceRemittanceTypeTwoNpi: null,
            InsuranceRemittanceLicenseNumber: null,
            FeeListId: 5,
            IsRxRegistered: false,
            DataTag: "AAAAAB19JDE=",
            UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
            DateModified: "2023-06-26T07:36:17.5259304",
            PlaceOfTreatment: PlaceOfTreatmentEnum.Office
        }

        mockLocations = [];

        for (let index = 0; index < 4; index++) {
            mockLocations.push(cloneDeep(mockLocationStub));
        }
        mockLocations[0].LocationId = 1;
        mockLocations[0].NameLine1 = 'First Office';
        mockLocations[1].LocationId = 2;
        mockLocations[1].NameLine1 = 'Second Office';
        mockLocations[2].LocationId = 3;
        mockLocations[2].NameLine1 = 'Third Office';
        mockLocations[3].LocationId = 4;
        mockLocations[3].NameLine1 = 'Fourth Office';

        mockLocation = {
            Value: [
                {
                    LocationId: 1, NameLine1: 'First Office', AddressLine1: '123 Apple St', AddressLine2: 'Suite 10', ZipCode: '62401', City: 'Effingham', State: 'IL', PrimaryPhone: '5551234567', SecondaryPhone: '5551234567', Fax: '5551234567',
                    TaxId: '123', RemitToZipCode: '1', InsuranceRemittanceZipCode: '1', ProviderTaxRate: 1, SalesAndUseTaxRate: 1, timezone: "Central Standard Time"
                },
                { LocationId: 2, NameLine1: 'Second Office', AddressLine1: '123 Count Rd', AddressLine2: '', ZipCode: '62858', City: 'Louisville', State: 'IL', PrimaryPhone: '5559876543', timezone: "Central Standard Time" },
                { LocationId: 3, NameLine1: 'Third Office', AddressLine1: '123 Adios St', AddressLine2: '', ZipCode: '60601', City: 'Chicago', State: 'IL', PrimaryPhone: '3124567890', timezone: "Central Standard Time" },
                { LocationId: 4, NameLine1: 'Fourth Office', AddressLine1: '123 Hello Rd', AddressLine2: '', ZipCode: '62895', City: 'Wayne City', State: 'IL', PrimaryPhone: '6187894563', SecondaryPhone: '', timezone: "Central Standard Time" }
            ]
        };

        mockUserLocation = {
            id: 1, NameLine1: 'First Office'
        }

        tempUserData = [{
            UserId: '1',
            FirstName: 'John',
            LastName: 'Doe',
            UserCode: 'JD'
        }]

        tempPatContext = { "isAuthorized": true, "accessLevel": "Practice", "userInfo": { "username": "fuseadmin@fakeemail.com", "firstname": "John", "lastname": "Doe", "userid": "1" } }

        appointmentStatusDataServiceMock = {
            appointmentStatuses: appointmentStatusDataService.appointmentStatuses
        };

        usersFactoryMock = {
            Users: () => {
                return {
                    then: (res, error) => {
                        res({ Value: tempUserData }),
                            error({
                            })
                    }
                }
            }
        };

        referenceDataServiceMock = {
            entityNames: {
                locations: "locations"
            },
            get: jasmine.createSpy().and.callFake(() => {
                return mockLocation.Value;
            })
        };

        toastrFactoryMock = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
        };

        tabLauncherMock = {
            launchNewTab: jasmine.createSpy()
        };

        appointmentViewVisibleServiceMock = {
            changeAppointmentViewVisible: jasmine.createSpy()
        };

        appointmentViewDataLoadingServiceMock = {
            getViewData: jasmine.createSpy().and.callFake(() => {
                return of({ Value: mockAppointmentData });
            })
        };

        dashboardWidgetServiceMock = {
            getWidgetData: jasmine.createSpy().and.callFake(() => {
                return of({ Value: mockAppointmentData });
            }),
        }

        mockRootScope = { $on: jasmine.createSpy(), $emit: jasmine.createSpy() }

        mockPatSharedService = {
            compareValues: (a, b) => {
                if (a < b) {
                    return -1;
                }
                if (a > b) {
                    return 1;
                }
                return 0;
            }
        }

        mockFeatureFlagService = {
            getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(
                of({
                    Value: []
                })),
        };

        mocklocationTimeService = {
            toUTCDateKeepLocalTime: jasmine.createSpy()
        }

        mockSubscription = {
            unsubscribe: jasmine.createSpy(),
            _subscriptions: jasmine.createSpy(),
            closed: true,
            add: jasmine.createSpy(),
            remove: jasmine.createSpy(),
            _parentOrParents: []
        };

        await TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), ReactiveFormsModule, FormsModule, GridModule],
            declarations: [AppointmentsGridWidgetComponent],
            providers: [
                { provide: AppointmentStatusDataService, useValue: appointmentStatusDataServiceMock },
                { provide: 'UsersFactory', useValue: usersFactoryMock },
                { provide: 'referenceDataService', useValue: referenceDataServiceMock },
                { provide: 'toastrFactory', useValue: toastrFactoryMock },
                { provide: 'tabLauncher', useValue: tabLauncherMock },
                { provide: 'AppointmentViewVisibleService', useValue: appointmentViewVisibleServiceMock },
                { provide: 'AppointmentViewDataLoadingService', useValue: appointmentViewDataLoadingServiceMock },
                { provide: DashboardWidgetService, useValue: dashboardWidgetServiceMock },
                { provide: PatSharedService, useValue: mockPatSharedService },
                { provide: '$rootScope', useValue: mockRootScope },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
                { provide: LocationTimeService, useValue: mocklocationTimeService }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppointmentsGridWidgetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit ->', () => {
        it('should initialize the form and call getAppointments on reload event', () => {
            spyOn(component, 'getAppointmentStatuses');
            spyOn(component, 'initialize');
            component.ngOnInit();
            expect(component.appointmentsGridWidgetForm).toBeDefined();
            expect(component.appointmentsGridWidgetForm.get('appointmentWidgetCalendar')).toBeDefined();
            expect(component.appointmentsGridWidgetForm.get('appointmentsGridWidgetLocationFilter')).toBeDefined();
            expect(component.appointmentsGridWidgetForm.get('appointmentsGridWidgetProviderFilter')).toBeDefined();
            expect(component.getAppointmentStatuses).toHaveBeenCalled();
            expect(component.initialize).toHaveBeenCalled();
            expect(component.$rootScope.$on).toHaveBeenCalledWith('soar:reload-appointments-widget', jasmine.any(Function));
            component.$rootScope.$emit('soar:reload-appointments-widget');
        });
    });

    describe('getAppointmentStatuses -->', () => {
        it('should set appointmentStatuses property', () => {
            component.getAppointmentStatuses();
            expect(component.appointmentStatuses).not.toBeNull();
            expect(component.appointmentStatuses?.length).toEqual(12);
        });
    });

    describe('initialize -->', () => {
        beforeEach(() => {
            sessionStorage.setItem('userLocation', JSON.stringify(mockUserLocation));
            sessionStorage.setItem('patAuthContext', JSON.stringify(tempPatContext));
        });
        it('should set filters and tempLocations properties', () => {
            component.initialize();
            expect(component.locationsFromServer).not.toBeNull();
            expect(component.locationsFromServer?.length).toEqual(4);
            expect(component.filters.locationFilter).toEqual([{ value: 1, text: 'First Office' }]);
            expect(component.tempLocations).toEqual([{ id: 1 }]);
        });

        it('should set usersFromServer and call getAppointments method', () => {
            component.initialize();
            expect(component.usersFromServer).not.toBeNull();
            expect(component.usersFromServer).toEqual([{ UserId: '1', FirstName: 'John', LastName: 'Doe', UserCode: 'JD' }]);
            expect(component.filters.providerFilter).toEqual([{ value: '1', text: 'John Doe - JD' }]);
            expect(component.tempProviders).toEqual([{ id: '1' }]);
        });

        afterEach(() => {
            sessionStorage.removeItem('userLocation');
            sessionStorage.removeItem('patAuthContext');
        });
    });

    describe('getAppointments -->', () => {
        beforeEach(() => { spyOn(component.loadingComplete, 'emit'); });
        it('should set loading status and emit loadingComplete event', () => {
            component.getAppointments();
            expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.Loaded);
            expect(component.loadingComplete.emit).toHaveBeenCalledWith(component.loadingStatus);
        });

        it('should call getWidgetData with correct parameters and process appointments', () => {
            component.tempLocations = [{ id: 1 }];
            component.tempProviders = [{ id: '1' }];
            component.dateFilter = new Date('2022-10-28');
            spyOn(component, 'processAppointments');
            component.getAppointments();
            expect(component.processAppointments).toHaveBeenCalled();
            expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.Loaded);
            expect(component.loadingComplete.emit).toHaveBeenCalledWith(component.loadingStatus);
        });

        it('should handle error when getting appointments', () => {
            dashboardWidgetServiceMock.getWidgetData = jasmine.createSpy().and.callFake(() => {
                return throwError('error');
            });
            component.getAppointments();
            expect(dashboardWidgetServiceMock.getWidgetData).toHaveBeenCalled();
            expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.error);
            expect(component.loadingComplete.emit).toHaveBeenCalledWith(component.loadingStatus);
        });
    });

    describe('processUsersFromServer -->', () => {
        it('should set providerFilterOptions property with correct values', () => {
            component.usersFromServer = [
                { UserId: '1', FirstName: 'John', LastName: 'Doe', UserCode: 'JD', ProviderTypeId: ProviderType.Assistant, Roles: [{ RoleName: RoleNames.PracticeAdmin }], Locations: [{ LocationId: 1 }] },
                { UserId: '2', FirstName: 'Mark', LastName: 'Doe', UserCode: 'MD', ProviderTypeId: ProviderType.Dentist, Roles: null, Locations: [{ LocationId: 2 }] },
                { UserId: '3', FirstName: 'Ray', LastName: 'Doe', UserCode: 'RD', ProviderTypeId: ProviderType.Hygienist, Roles: [{ RoleName: RoleNames.PracticeAdmin }], Locations: [{ LocationId: 3 }] },
                { UserId: '4', FirstName: 'Sam', LastName: 'Doe', UserCode: 'SD', ProviderTypeId: ProviderType.NotAProvider, Roles: [{ RoleName: RoleNames.PracticeAdmin }], Locations: [{ LocationId: 4 }] }
            ];
            component.filters = { locationFilter: [{ value: 1, text: "First Office" }], providerFilter: [{ value: '3', text: "Third Office" }] };
            component.processUsersFromServer();
            expect(component.options.providerFilterOptions).toEqual([
                { value: '1', text: 'John Doe - JD', isDisabled: false },
                { value: '3', text: 'Ray Doe - RD', isDisabled: false },
            ]);
        });

        it('should set providerFilter property to all providers when user is not a provider', () => {
            component.usersFromServer = [
                { UserId: '1', FirstName: 'John', LastName: 'Doe', UserCode: 'JD', ProviderTypeId: ProviderType.Dentist, Roles: [{ RoleName: RoleNames.PracticeAdmin }], Locations: [{ LocationId: 1 }] },
                { UserId: '2', FirstName: 'Mark', LastName: 'Doe', UserCode: 'MD', ProviderTypeId: ProviderType.Hygienist, Roles: null, Locations: [{ LocationId: 2 }] }
            ];
            component.filters = { locationFilter: [{ value: 1, text: "First Office" }], providerFilter: [{ value: '3', text: "Third Office" }] };
            component.processUsersFromServer();
            expect(component.filters.providerFilter).toEqual([
                { value: '1', text: 'John Doe - JD', isDisabled: false },
            ]);
        });

        it('should not add user to providerFilterOptions when user is not a provider or practice administrator or does not have location in locationFilter', () => {
            component.usersFromServer = [
                { UserId: '1', FirstName: 'John', LastName: 'Doe', UserCode: 'JD', ProviderTypeId: ProviderType.Assistant, Roles: [{ RoleName: "Patient" }], Locations: [{ LocationId: 1 }] },
                { UserId: '2', FirstName: 'Mark', LastName: 'Doe', UserCode: 'MD', ProviderTypeId: ProviderType.Dentist, Roles: null, Locations: [{ LocationId: 2 }] },
                { UserId: '3', FirstName: 'Ray', LastName: 'Doe', UserCode: 'RD', ProviderTypeId: ProviderType.Hygienist, Roles: [{ RoleName: RoleNames.RxUser }], Locations: [{ LocationId: 3 }] },
            ];
            component.filters = { locationFilter: [], providerFilter: [] };
            component.processUsersFromServer();
            expect(component.options.providerFilterOptions).toEqual([]);
        });

        it('should not add user to providerFilterOptions when usersFromServer is null', () => {
            component.usersFromServer = [];
            component.usersFromServer.length = 0;
            component.filters = { locationFilter: [], providerFilter: [] };
            component.processUsersFromServer();
            expect(component.options.providerFilterOptions).toEqual([]);
        });
    });

    describe('processLocationsFromServer -->', () => {
        it('should set locationFilterOptions property with correct values', () => {
            component.locationsFromServer = cloneDeep(mockLocations);
            component.processLocationsFromServer();
            expect(component.options.locationFilterOptions).toEqual([
                { text: 'First Office', value: 1, isDisabled: false },
                { text: 'Fourth Office', value: 4, isDisabled: false },
                { text: 'Second Office', value: 2, isDisabled: false },
                { text: 'Third Office', value: 3, isDisabled: false },
            ]);
        });

        it('should sort locationFilterOptions property by text', () => {
            component.locationsFromServer = cloneDeep(mockLocations);
            component.processLocationsFromServer();
            expect(component.options.locationFilterOptions).toEqual([
                { text: 'First Office', value: 1, isDisabled: false },
                { text: 'Fourth Office', value: 4, isDisabled: false },
                { text: 'Second Office', value: 2, isDisabled: false },
                { text: 'Third Office', value: 3, isDisabled: false },
            ]);
        });

        it('should not set locationFilterOptions property when locationsFromServer is null or empty', () => {
            component.locationsFromServer = null;
            component.processLocationsFromServer();
            expect(component.options.locationFilterOptions).toEqual([]);

            component.locationsFromServer = [];
            component.processLocationsFromServer();
            expect(component.options.locationFilterOptions).toEqual([]);
        });
    });

    describe('processAppointments -->', () => {
        it('should set allAppointments and providerAppointments properties with correct values', () => {
            component.filters = { locationFilter: [{ value: 1, text: "First Office" }], providerFilter: [{ value: '1', text: "Third Office" }] };
            component.processAppointments({ Appointment: mockAppointmentData.Appointment });
            expect(component.allAppointments?.length).toEqual(mockAppointmentData.Appointment?.length);
            expect(component.providerAppointments?.length).toEqual(component.allAppointments?.length);
        });

        it('should set allAppointments and providerAppointments properties to empty array when input is null or undefined', () => {
            component.processAppointments(null);
            expect(component.allAppointments).toEqual([]);
            expect(component.providerAppointments).toEqual([]);

            component.processAppointments(undefined);
            expect(component.allAppointments).toEqual([]);
            expect(component.providerAppointments).toEqual([]);
        });
    });


    describe('mapAppointments -->', () => {
        it('should map appointments to AllAppointments array with correct values', () => {
            const actualAllAppointments = component.mapAppointments(mockAppointmentData.Appointment);
            expect(actualAllAppointments?.length).toEqual(mockAppointmentData?.Appointment?.length);
        });
    });

    describe('filterProviderAppointments -->', () => {
        it('should filter provider appointments with correct values', () => {
            const mockProviderAppointments = [{
                appointment: mockAppointmentData.Appointment[0].Appointment, startTime: "2023-10-27T17:00:00",
                endTime: "2023-10-27T18:00:00", providerId: 1
            }]
            component.filters = { locationFilter: [{ value: 1, text: "First Office" }], providerFilter: [{ value: '1', text: "Third Office" }] };
            const actualProviderAppointments = component.filterProviderAppointments(mockProviderAppointments);
            expect(actualProviderAppointments?.length).toEqual(1);
        });

        it('should filter provider appointments and remove overlapping appointments', () => {
            const mockProviderAppointments = [
                { startTime: '2022-01-01T00:00:00Z', endTime: '2022-01-01T01:00:00Z', providerId: 1, appointment: mockAppointmentData.Appointment[0].Appointment },
                { startTime: '2022-01-01T01:00:00Z', endTime: '2022-01-01T02:00:00Z', providerId: 1, appointment: mockAppointmentData.Appointment[0].Appointment },
                { startTime: '2022-01-01T01:30:00Z', endTime: '2022-01-01T02:30:00Z', providerId: 1, appointment: mockAppointmentData.Appointment[0].Appointment },
                { startTime: '2022-01-01T02:00:00Z', endTime: '2022-01-01T03:00:00Z', providerId: 1, appointment: mockAppointmentData.Appointment[0].Appointment }
            ];
            component.filters = { locationFilter: [{ value: 1, text: "First Office" }], providerFilter: [{ value: '1', text: "Third Office" }] };
            const actualProviderAppointments = component.filterProviderAppointments(mockProviderAppointments);
            expect(actualProviderAppointments?.length).toEqual(2);
        });
    });

    describe('filterAndFillAppointments -->', () => {
        it('should filter and fill appointments with correct values', () => {
            const appointments = [
                {
                    Appointment: {
                        AppointmentId: '1',
                        ProviderAppointments: [
                            {
                                UserId: '1', StartTime: '2022-01-01T00:00:00Z', EndTime: '2022-01-01T01:00:00Z', MedicalHistoryAlerts: [
                                    { MedicalHistoryAlertTypeId: AlertTypes.allergyAlerts, AlertDetails: 'Peanuts' },
                                    { MedicalHistoryAlertTypeId: AlertTypes.medicalAlerts, AlertDetails: 'Heart condition' },
                                    { MedicalHistoryAlertTypeId: AlertTypes.premedAlerts, AlertDetails: 'None' }
                                ]
                            },
                            {
                                UserId: '2', StartTime: '2022-01-01T01:00:00Z', EndTime: '2022-01-01T02:00:00Z', MedicalHistoryAlerts: [
                                    { MedicalHistoryAlertTypeId: AlertTypes.allergyAlerts, AlertDetails: 'None' },
                                    { MedicalHistoryAlertTypeId: AlertTypes.medicalAlerts, AlertDetails: 'Asthma' },
                                    { MedicalHistoryAlertTypeId: AlertTypes.premedAlerts, AlertDetails: 'None' }
                                ]
                            }
                        ]
                    }
                },
                {
                    Appointment: {
                        AppointmentId: '2',
                        ProviderAppointments: [
                            {
                                UserId: '1', StartTime: '2022-01-01T02:00:00Z', EndTime: '2022-01-01T03:00:00Z', MedicalHistoryAlerts: [
                                    { MedicalHistoryAlertTypeId: AlertTypes.allergyAlerts, AlertDetails: 'None' },
                                    { MedicalHistoryAlertTypeId: AlertTypes.medicalAlerts, AlertDetails: 'Diabetes' },
                                    { MedicalHistoryAlertTypeId: AlertTypes.premedAlerts, AlertDetails: 'None' }
                                ]
                            }
                        ]
                    }
                }
            ];
            component.filters = { locationFilter: [{ value: 1, text: "First Office" }], providerFilter: [{ value: '1', text: "Third Office" }] };
            spyOn(component, 'filterProviderAppointments').and.returnValue([
                { providerId: '1', startTime: '2022-01-01T00:00:00Z', endTime: '2022-01-01T01:00:00Z', appointment: appointments[0].Appointment.ProviderAppointments[0] as unknown as ProviderAppointments['appointment'] } as unknown as ProviderAppointments,
                { providerId: '2', startTime: '2022-01-01T01:00:00Z', endTime: '2022-01-01T02:00:00Z', appointment: appointments[0].Appointment.ProviderAppointments[1] as unknown as ProviderAppointments['appointment'] } as unknown as ProviderAppointments,
                { providerId: '1', startTime: '2022-01-01T02:00:00Z', endTime: '2022-01-01T03:00:00Z', appointment: appointments[1].Appointment.ProviderAppointments[0] as unknown as ProviderAppointments['appointment'] } as unknown as ProviderAppointments,
            ]) as unknown as ProviderAppointments[];
            const actualProviderAppointments = component.filterAndFillAppointments(appointments);
            expect(actualProviderAppointments[0].alerts.medicalAlerts).not.toBeNull();
        });
    });

    describe('onDateChange -->', () => {
        it('should not call getAppointments method when oldDate is equal to newDate', () => {
            const newDate = moment('2022/01/01').toDate();
            component.oldDate = newDate;
            spyOn(component, 'getAppointments');
            component.onDateChange(newDate);
            expect(component.getAppointments).not.toHaveBeenCalled();
        });

        it('should set dateFilter property and call getAppointments method', () => {
            const newDate = moment('2023/01/01').toDate();
            component.oldDate = moment('2022/01/01').toDate();
            spyOn(component, 'getAppointments');
            component.onDateChange(newDate);
            expect(component.oldDate).toEqual(newDate);
            expect(component.dateFilter).toEqual(newDate);
            expect(component.getAppointments).toHaveBeenCalled();
        });
    });

    describe('onStartDateStateChange -->', () => {
        it('should set validEmpStartDateControl property to event value', () => {
            const event = true;
            component.onStartDateStateChange(event);
            expect(component.validEmpStartDateControl).toEqual(event);
        });
    });

    describe('formatPatientName -->', () => {
        it('should return formatted patient name', () => {
            const patient = { LastName: 'Doe', FirstName: 'John', PatientCode: '123' };
            const expectedName = 'Doe, John - 123';
            const actualName = component.formatPatientName(patient);
            expect(actualName).toEqual(expectedName);
        });
    });

    describe('findProviderName -->', () => {
        it('should return formatted provider name when provider exists', () => {
            const providerId = '1';
            const providers = [
                { UserId: '1', FirstName: 'John', LastName: 'Doe', UserCode: '001', suffixName: 'JD' },
                { UserId: '2', FirstName: 'Jane', LastName: 'Doe', UserCode: '002', suffixName: 'JD' }
            ];
            const expectedName = 'John Doe - 001';
            const actualName = component.findProviderName(providerId, providers);
            expect(actualName).toEqual(expectedName);
        });

        it('should return empty string when provider does not exist', () => {
            const providerId = '3';
            const providers = [
                { UserId: '1', FirstName: 'John', LastName: 'Doe', UserCode: '001', suffixName: 'JD' },
                { UserId: '2', FirstName: 'Jane', LastName: 'Doe', UserCode: '002', suffixName: 'JD' }
            ];
            const expectedName = '';
            const actualName = component.findProviderName(providerId, providers);
            expect(actualName).toEqual(expectedName);
        });

        it('should return empty string when providers is null or undefined', () => {
            const providerId = '1';
            const expectedName = '';
            const actualName1 = component.findProviderName(providerId, null);
            expect(actualName1).toEqual(expectedName);
            const actualName2 = component.findProviderName(providerId, undefined);
            expect(actualName2).toEqual(expectedName);
        });
    });

    describe('parseDate -->', () => {
        it('should return null when date is null', () => {
            mocklocationTimeService.toUTCDateKeepLocalTime.and.returnValue(null);
            expect(component.parseDate(null)).toBeNull();
        });

        it('should return utcDate ISO string when date is valid', () => {
            const date = new Date();
            mocklocationTimeService.toUTCDateKeepLocalTime.and.returnValue(date);
            expect(component.parseDate(date)).toBe(date.toISOString());
        });
    });

    describe('sortChange -->', () => {
        it('should call the correct sort method based on the sort field', () => {
            let sort: SortDescriptor[] = [{ field: GridSortField.startTime, dir: 'asc' }];
            spyOn(component, 'sortTime');
            spyOn(component, 'sortPatient');
            spyOn(component, 'sortApptType');
            spyOn(component, 'sortLocation');
            spyOn(component, 'sortRoom');
            spyOn(component, 'sortProvider');

            component.sortChange(sort);
            expect(component.sortTime).toHaveBeenCalled();

            sort = [{ field: GridSortField.Person, dir: 'asc' }];
            component.sortChange(sort);
            expect(component.sortPatient).toHaveBeenCalled();

            sort = [{ field: GridSortField.ApptType, dir: 'asc' }];
            component.sortChange(sort);
            expect(component.sortApptType).toHaveBeenCalled();

            sort = [{ field: GridSortField.Location, dir: 'asc' }];
            component.sortChange(sort);
            expect(component.sortLocation).toHaveBeenCalled();

            sort = [{ field: GridSortField.Room, dir: 'asc' }];
            component.sortChange(sort);
            expect(component.sortRoom).toHaveBeenCalled();

            sort = [{ field: "negativeCheck", dir: 'asc' }];
            component.sortChange(sort);
            expect(component.sortProvider).not.toHaveBeenCalled();

            sort = [{ field: GridSortField.Provider, dir: 'asc' }];
            component.sortChange(sort);
            expect(component.sortProvider).toHaveBeenCalled();
        });

        it('should not call any sort method when sort is null or undefined', () => {
            spyOn(component, 'sortTime');
            spyOn(component, 'sortPatient');
            spyOn(component, 'sortApptType');
            spyOn(component, 'sortLocation');
            spyOn(component, 'sortRoom');
            spyOn(component, 'sortProvider');
            component.sortChange(null);
            expect(component.sortTime).not.toHaveBeenCalled();
            expect(component.sortPatient).not.toHaveBeenCalled();
            expect(component.sortApptType).not.toHaveBeenCalled();
            expect(component.sortLocation).not.toHaveBeenCalled();
            expect(component.sortRoom).not.toHaveBeenCalled();
            expect(component.sortProvider).not.toHaveBeenCalled();
            component.sortChange(undefined);
            expect(component.sortTime).not.toHaveBeenCalled();
            expect(component.sortPatient).not.toHaveBeenCalled();
            expect(component.sortApptType).not.toHaveBeenCalled();
            expect(component.sortLocation).not.toHaveBeenCalled();
            expect(component.sortRoom).not.toHaveBeenCalled();
            expect(component.sortProvider).not.toHaveBeenCalled();
        });
    });

    describe('sortTime function ->', () => {
        it('sortTime should be called', () => {
            component.sortsAscending = {
                time: false,
                patient: true,
                apptType: true,
                location: true,
                room: true,
                provider: true,
            };
            component.providerAppointments = cloneDeep([
                { startTime: '2018-12-03T06:15:00' },
                { startTime: '2018-12-03T06:15:00' },
            ]) as unknown as ProviderAppointments[];
            component.sortTime();
            const result = component.patShared.compareValues(
                component.providerAppointments[0].startTime,
                component.providerAppointments[1].startTime
            );
            const expectedResult = component.sortsAscending.time ? result : -result;
            expect(expectedResult).toEqual(0);
            expect(component.sortsAscending.time).toBe(true);
        });
    });

    describe('sortLocation function ->', () => {
        it('sortLocation should be called', () => {
            component.sortsAscending = {
                time: false,
                patient: true,
                apptType: true,
                location: true,
                room: true,
                provider: true,
            };
            component.providerAppointments = cloneDeep([
                { appointment: { Location: { NameLine1: 'Default Practice - MB' } } },
                { appointment: { Location: { NameLine1: 'Jangaon' } } },
            ]) as unknown as ProviderAppointments[];
            component.sortLocation();
            const val1 = component.providerAppointments[0].appointment.Location.NameLine1;
            const val2 = component.providerAppointments[1].appointment.Location.NameLine1;
            const result = component.patShared.compareValues(val1, val2);
            expect(result).toEqual(-1);
            expect(component.sortsAscending.location).toBe(false);
        });
    });

    describe('sortRoom function ->', () => {
        it('sortRoom should be called', () => {
            component.sortsAscending = {
                time: false,
                patient: true,
                apptType: true,
                location: true,
                room: true,
                provider: true,
            };
            component.providerAppointments = cloneDeep([
                { appointment: { Room: { Name: 'Room 104' } } },
                { appointment: { Room: { Name: 'Room 108' } } },
            ]) as unknown as ProviderAppointments[];
            component.sortRoom();
            const val1 = component.providerAppointments[0].appointment.Room.Name;
            const val2 = component.providerAppointments[1].appointment.Room.Name;
            const result = component.patShared.compareValues(val1, val2);
            expect(result).toEqual(-1);
            expect(component.sortsAscending.room).toBe(false);
        });
    });

    describe('sortPatient function ->', () => {
        it('sortPatient should be called', () => {
            component.sortsAscending = {
                time: false,
                patient: true,
                apptType: true,
                location: true,
                room: true,
                provider: true,
            };
            const providerAppointments = [
                {
                    appointment: {
                        Person: cloneDeep({
                            FirstName: 'Ruby',
                            LastName: 'Brown',
                            PatientCode: 'BRORU1',
                        }),
                    },
                },
                {
                    appointment: {
                        Person: {
                            FirstName: 'Dornala',
                            LastName: 'Dornala',
                            PatientCode: 'JAGAN',
                        },
                    },
                },
            ];
            component.providerAppointments = cloneDeep(providerAppointments) as unknown as ProviderAppointments[];
            component.sortPatient();
            const firstObj = component.formatPatientName(
                component.providerAppointments[0].appointment.Person
            );
            const secondObj = component.formatPatientName(
                component.providerAppointments[1].appointment.Person
            );
            expect(firstObj).toEqual('Brown, Ruby - BRORU1');
            expect(secondObj).toEqual('Dornala, Dornala - JAGAN');
            const result = component.patShared.compareValues(firstObj, secondObj);
            expect(result).toEqual(-1);
            expect(component.sortsAscending.patient).toBe(false);
        });
    });

    describe('sortApptType function ->', () => {
        it('sortApptType should be called', () => {
            component.sortsAscending = {
                time: false,
                patient: true,
                apptType: true,
                location: true,
                room: true,
                provider: true,
            };
            const providerAppointments = [
                { appointment: { AppointmentType: { Name: 'Crown Bridge Delivery' } } },
                { appointment: { AppointmentType: { Name: 'Crown Bridge Delivery' } } },
            ];
            component.providerAppointments = cloneDeep(providerAppointments) as unknown as ProviderAppointments[];
            component.sortApptType();
            const val1 = component.providerAppointments[0].appointment.AppointmentType
                ? component.providerAppointments[0].appointment.AppointmentType.Name
                : '';
            const val2 = component.providerAppointments[1].appointment.AppointmentType
                ? component.providerAppointments[0].appointment.AppointmentType.Name
                : '';
            const result = component.patShared.compareValues(val1, val2);
            expect(result).toEqual(0);
            expect(component.sortsAscending.apptType).toBe(false);
        });
    });


    describe('sortProvider -->', () => {
        it('should sort providerAppointments array by provider name in ascending order', () => {
            const providerAppointments = [
                {
                    providerId: '1',
                    appointment: {
                        ProviderUsers: [{ UserId: '1', ProviderUserId: '1', FirstName: 'Alex', LastName: 'Alice', UserCode: '001', suffixName: 'AD' }]
                    }
                },
                {
                    providerId: '2',
                    appointment: {
                        ProviderUsers: [{ UserId: '2', ProviderUserId: '2', FirstName: 'Bob', LastName: 'Blast', UserCode: '002', suffixName: 'BD' }]
                    }
                },
                {
                    providerId: '3',
                    appointment: {
                        ProviderUsers: [{ UserId: '3', ProviderUserId: '3', FirstName: 'Catherien', LastName: 'Cat', UserCode: '003', suffixName: 'CA' }]
                    }
                }
            ];
            const expectedAppointments = [
                {
                    providerId: '1',
                    appointment: {
                        ProviderUsers: [{ UserId: '1', ProviderUserId: '1', FirstName: 'Alex', LastName: 'Alice', UserCode: '001', suffixName: 'AD' }]
                    }
                },
                {
                    providerId: '2',
                    appointment: {
                        ProviderUsers: [{ UserId: '2', ProviderUserId: '2', FirstName: 'Bob', LastName: 'Blast', UserCode: '002', suffixName: 'BD' }]
                    }
                },
                {
                    providerId: '3',
                    appointment: {
                        ProviderUsers: [{ UserId: '3', ProviderUserId: '3', FirstName: 'Catherien', LastName: 'Cat', UserCode: '003', suffixName: 'CA' }]
                    }
                }
            ] as unknown as ProviderAppointments[];
            component.providerAppointments = cloneDeep(providerAppointments) as unknown as ProviderAppointments[];
            component.sortsAscending.provider = true;
            component.sortProvider();
            expect(component.providerAppointments).toEqual(cloneDeep(expectedAppointments));
        });

        it('should sort providerAppointments array by provider name in descending order', () => {
            const providerAppointments = [
                {
                    providerId: '1',
                    appointment: {
                        ProviderUsers: [{ UserId: '1', ProviderUserId: '1', FirstName: 'Alex', LastName: 'Alice', UserCode: '001', suffixName: 'AD' }]
                    }
                },
                {
                    providerId: '2',
                    appointment: {
                        ProviderUsers: [{ UserId: '2', ProviderUserId: '2', FirstName: 'Bob', LastName: 'Blast', UserCode: '002', suffixName: 'BD' }]
                    }
                },
                {
                    providerId: '3',
                    appointment: {
                        ProviderUsers: [{ UserId: '3', ProviderUserId: '3', FirstName: 'Catherien', LastName: 'Cat', UserCode: '003', suffixName: 'CA' }]
                    }
                }
            ];
            const expectedAppointments = [
                {
                    providerId: '3',
                    appointment: {
                        ProviderUsers: [{ UserId: '3', ProviderUserId: '3', FirstName: 'Catherien', LastName: 'Cat', UserCode: '003', suffixName: 'CA' }]
                    }
                },
                {
                    providerId: '2',
                    appointment: {
                        ProviderUsers: [{ UserId: '2', ProviderUserId: '2', FirstName: 'Bob', LastName: 'Blast', UserCode: '002', suffixName: 'BD' }]
                    }
                },
                {
                    providerId: '1',
                    appointment: {
                        ProviderUsers: [{ UserId: '1', ProviderUserId: '1', FirstName: 'Alex', LastName: 'Alice', UserCode: '001', suffixName: 'AD' }]
                    }
                }

            ] as unknown as ProviderAppointments[];
            component.providerAppointments = cloneDeep(providerAppointments) as unknown as ProviderAppointments[];
            component.sortsAscending.provider = false;
            component.sortProvider();

            expect(component.providerAppointments).toEqual(cloneDeep(expectedAppointments));
        });
    });

    describe('getStatusIcon function ->', () => {
        it('getStatusIcon should be called', () => {
            const status = 0;
            component.appointmentStatuses = appointmentStatusDataServiceMock.appointmentStatuses;
            const stausResult = component.getStatusIcon(status);
            expect(stausResult).toEqual('fas fa-question');
        });
    });

    describe('getStatusDescription function ->', () => {
        it('getStatusDescription should be called', () => {
            const status = 0;
            component.appointmentStatuses = appointmentStatusDataServiceMock.appointmentStatuses;
            const stausResult = component.getStatusDescription(status);
            expect(stausResult).toEqual('Unconfirmed');
        });
    });

    describe('getAlertDescription -->', () => {
        it('should return concatenated alert description when alert is not null or undefined', () => {
            const alert = [
                { MedicalHistoryAlertDescription: 'Alert 1' },
                { MedicalHistoryAlertDescription: 'Alert 2' }
            ];
            const expectedDescription = 'Alert 1<br/>Alert 2<br/>';
            const actualDescription = component.getAlertDescription(alert);
            expect(actualDescription).toEqual(expectedDescription);
        });

        it('should return empty string when alert is null or undefined', () => {
            const expectedDescription = '';
            const actualDescription1 = component.getAlertDescription(null);
            expect(actualDescription1).toEqual(expectedDescription);
            const actualDescription2 = component.getAlertDescription(undefined);
            expect(actualDescription2).toEqual(expectedDescription);
        });
    });

    describe('getOverViewUrl -->', () => {
        it('should return the correct overview URL when dataItem is not null or undefined', () => {
            const dataItem = {
                appointment: {
                    Person: {
                        PatientId: '1'
                    }
                }
            };
            const expectedUrl = '#/Patient/1/Overview/';
            const actualUrl = component.getOverViewUrl(dataItem);
            expect(actualUrl).toEqual(expectedUrl);
        });
    });

    describe('navigate -->', () => {
        it('should launch a new tab with the correct URL', () => {
            const url = 'https://example.com/';
            const dateFilter = '2022-01-01';
            component.dateFilter = cloneDeep(dateFilter);
            component.navigate(url);
            const expectedUrl = url + moment(dateFilter).format('YYYY-M-DD');
            expect(component.tabLauncher.launchNewTab).toHaveBeenCalledWith(expectedUrl);
        });
    });

    describe('providerChange -->', () => {
        it('should update tempProviders and call getAppointments when providerChange is called with a new list', () => {
            const list = [{ value: '1' }, { value: '2' }];
            const getAppointmentsSpy = spyOn(component, 'getAppointments');
            component.providerChange(list);
            expect(component.tempProviders).toEqual([{ id: '1' }, { id: '2' }]);
            expect(getAppointmentsSpy).toHaveBeenCalled();
        });

        it('should not update tempProviders or call getAppointments when providerChange is called with the same list', () => {
            component.tempProviders = [{ id: '1' }, { id: '2' }];
            const list = [{ value: '1' }, { value: '2' }];
            const getAppointmentsSpy = spyOn(component, 'getAppointments');
            component.providerChange(list);
            expect(component.tempProviders).toEqual([{ id: '1' }, { id: '2' }]);
            expect(getAppointmentsSpy).not.toHaveBeenCalled();
        });

        it('should update tempProviders and call getAppointments when providerChange is called with a different list', () => {
            component.tempProviders = [{ id: '1' }, { id: '2' }];
            const list = [{ value: '1' }, { value: '3' }];
            const getAppointmentsSpy = spyOn(component, 'getAppointments');
            component.providerChange(list);
            expect(component.tempProviders).toEqual([{ id: '1' }, { id: '3' }]);
            expect(getAppointmentsSpy).toHaveBeenCalled();
        });

        it('should update tempProviders and call getAppointments when providerChange is called with an empty list', () => {
            component.tempProviders = [{ id: '1' }, { id: '2' }];
            const list = [];
            const getAppointmentsSpy = spyOn(component, 'getAppointments');
            component.providerChange(list);
            expect(component.tempProviders).toEqual([]);
            expect(getAppointmentsSpy).toHaveBeenCalled();
        });
    });

    describe('locationChange -->', () => {
        it('should update tempLocations and call getAppointments when locationChange is called with a new list', () => {
            const list = [{ value: 1 }, { value: 2 }];
            const getAppointmentsSpy = spyOn(component, 'getAppointments');
            component.locationChange(list);
            expect(component.tempLocations).toEqual([{ id: 1 }, { id: 2 }]);
            expect(getAppointmentsSpy).toHaveBeenCalled();
        });

        it('should not update tempLocations or call getAppointments when locationChange is called with the same list', () => {
            component.tempLocations = [{ id: 1 }, { id: 2 }];
            const list = [{ value: '1' }, { value: '2' }];
            const getAppointmentsSpy = spyOn(component, 'getAppointments');
            component.locationChange(list);
            expect(component.tempLocations).toEqual([{ id: 1 }, { id: 2 }]);
            expect(getAppointmentsSpy).not.toHaveBeenCalled();
        });

        it('should update tempLocations and call getAppointments when locationChange is called with a different list', () => {
            component.tempLocations = [{ id: 1 }, { id: 1 }];
            const list = [{ value: 1 }, { value: 3 }];
            const getAppointmentsSpy = spyOn(component, 'getAppointments');
            component.locationChange(list);
            expect(component.tempLocations).toEqual([{ id: 1 }, { id: 3 }]);
            expect(getAppointmentsSpy).toHaveBeenCalled();
        });

        it('should update tempLocations and call getAppointments when locationChange is called with an empty list', () => {
            component.tempLocations = [{ id: 1 }, { id: 2 }];
            const list = [];
            const getAppointmentsSpy = spyOn(component, 'getAppointments');
            component.locationChange(list);
            expect(component.tempLocations).toEqual([]);
            expect(getAppointmentsSpy).toHaveBeenCalled();
        });

    });

    describe('showAppointmentModal -->', () => {
        it('should call getViewData and changeAppointmentViewVisible when showAppointmentModal is called', () => {
            const providerAppointment = {
                appointment: {
                    Appointment: {
                        AppointmentId: '1'
                    }
                }
            };
            const getViewDataSpy = appointmentViewDataLoadingServiceMock.getViewData.and.returnValue(Promise.resolve());
            component.showAppointmentModal(providerAppointment);
            expect(getViewDataSpy).toHaveBeenCalledWith({ AppointmentId: '1' }, false, 'soar:reload-appointments-widget');
        });

        it('should call toastrFactory.error when getViewData fails', () => {
            const providerAppointment = {
                appointment: {
                    Appointment: {
                        AppointmentId: '1'
                    }
                }
            };
            const getViewDataSpy = appointmentViewDataLoadingServiceMock.getViewData.and.returnValue(Promise.reject({ error: 'getViewData failed' }));
            component.showAppointmentModal(providerAppointment);
            expect(getViewDataSpy).toHaveBeenCalledWith({ AppointmentId: '1' }, false, 'soar:reload-appointments-widget');
            expect(toastrFactoryMock.error).toHaveBeenCalledWith('WidgetLoadingError', 'Failed to load data.');
        });
    });

    describe('ngOnDestroy ->', () => {
        it('should unsubscribe subscriptions on destroy', () => {
            component.subscriptions.push(mockSubscription);
            component.ngOnDestroy();
            expect(mockSubscription.unsubscribe).toHaveBeenCalled();
        })
    });
});