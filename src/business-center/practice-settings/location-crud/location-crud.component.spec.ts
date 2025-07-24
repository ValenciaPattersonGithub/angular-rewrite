import { ComponentFixture, TestBed} from '@angular/core/testing';
import {
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SoarSelectListComponent } from 'src/@shared/components/soar-select-list/soar-select-list.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { TimeZoneModel } from '../location';
import { LocationCrudComponent } from './location-crud.component';
import { OrderByPipe, ZipCodePipe } from 'src/@shared/pipes';
import { TaxonomySelectorComponent } from 'src/@shared/components/taxonomy-selector/taxonomy-selector.component';
import { AppCheckBoxComponent } from 'src/@shared/components/form-controls/check-box/check-box.component';
import { FeeListLocationComponent } from 'src/@shared/components/fee-list-location/fee-list-location.component';
import { BrowserModule, By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeeListsService } from 'src/@shared/providers/fee-lists.service';
import { LocationIdentifierService } from 'src/@shared/providers/location-identifier.service';
import { LocationDataService } from '../service/location-data.service';
import { NO_ERRORS_SCHEMA, SimpleChanges } from '@angular/core';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { of } from 'rxjs';
import { PaymentProvider } from '../../../@shared/enum/accounting/payment-provider';
import { ConfirmationModalService } from '../../../@shared/components/confirmation-modal/confirmation-modal.service';
import { ApplicationBillingInfoService } from '../../../@core/http-services/application-billing-info.service';
import {
    DialogContainerService,
    DialogRef,
    DialogService,
} from '@progress/kendo-angular-dialog';
import { ClaimEnumService } from '../../../@core/data-services/claim-enum.service';
import { SaveStates } from 'src/@shared/models/transaction-enum';


let locationsList;
let mockTimeZones: TimeZoneModel[];
let mockFrmLocationCrud;
let mockStateTypeValue;
let mockOverdueValues;
let mockReferenceService;
let mockRxService;
let mockLocationService;
let mockLocation;
let mockLocationIdentifierService;
let mockError;
let mockDialog;
let mockTranslateService;
let dialogservice: DialogService;
let mockConfirmationModalService;
let mockClaimEnumService;

describe('LocationCrudComponent', () => {
    let component: LocationCrudComponent;
    let fixture: ComponentFixture<LocationCrudComponent>;
    let toastrFactory;
    let modalFactory;
    let retValue;
    let stateService;
    let mockLocalizeService;
    let mockToastrFactory;
    let mockListHelper;
    let mockGetLocationServices;
    let mockPatSecurityService;
    let mockCacheFactory;
    let mockObjectService;
    let routeParams;
    let mockModalFactory;
    let mockRooms;
    let mockFeeListService;
    let mockZipcodePipe;
    let mockLocationDataService;
    let mocklocation;
    let rootScope;
    let mockFeatureFlagService;
    let mockApplicationBillingInfoService;
    let mockConfirmationModalService;
    let mockPlaceOfTreatmentList

    configureTestSuite(() => {
        retValue = { $promise: { then: jasmine.createSpy() } };

        stateService = {
            States: jasmine.createSpy(),
            TaxonomyCodes: jasmine.createSpy().and.callFake(() => {
                return new Promise((resolve, reject) => {
                    resolve({ Value: '' }), reject({});
                });
            }),
        };

        mockLocalizeService = {
            getLocalizedString: () => 'translated text',
        };

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error'),
        };

        mockListHelper = {
            findItemByFieldValue: () => {
                return mockStateTypeValue;
            },
            findIndexByFieldValue: () => 2,
        };

        mockGetLocationServices = {
            get: jasmine.createSpy().and.callFake(() => retValue),
            updateFromEditLocation: jasmine.createSpy("updateFromEditLocationSpy").and.callFake(array => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ Value: { Rooms: mockRooms } }),
                                error({
                                    data: {
                                        InvalidProperties: [
                                            {
                                                PropertyName: 'GroupTypeName',
                                                ValidationMessage: 'Not Allowed',
                                            },
                                        ],
                                    },
                                });
                        },
                    },
                };
            }),
            save: jasmine.createSpy().and.callFake(array => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ Value: { Rooms: mockRooms } }),
                                error({
                                    data: {
                                        InvalidProperties: [
                                            {
                                                PropertyName: 'GroupTypeName',
                                                ValidationMessage: 'Not Allowed',
                                            },
                                        ],
                                    },
                                });
                        },
                    },
                };
            }),
            IsNameUnique: jasmine.createSpy().and.callFake(array => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ Value: 'res' }),
                                error({
                                    data: {
                                        InvalidProperties: [
                                            {
                                                PropertyName: 'GroupTypeName',
                                                ValidationMessage: 'Not Allowed',
                                            },
                                        ],
                                    },
                                });
                        },
                    },
                };
            }),
            IsAbbreviatedNameUnique: jasmine.createSpy().and.callFake(array => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ Value: 'res' }),
                                error({
                                    data: {
                                        InvalidProperties: [
                                            {
                                                PropertyName: 'GroupTypeName',
                                                ValidationMessage: 'Not Allowed',
                                            },
                                        ],
                                    },
                                });
                        },
                    },
                };
            }),
            getUsers: jasmine.createSpy().and.callFake((Id: 12121) => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ Value: [{ userId: '' }] }),
                                error({
                                    data: {
                                        InvalidProperties: [
                                            {
                                                PropertyName: 'GroupTypeName',
                                                ValidationMessage: 'Not Allowed',
                                            },
                                        ],
                                    },
                                });
                        },
                    },
                };
            }),
            getRoomScheduleStatus: jasmine.createSpy().and.callFake(array => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ scheduleRooms: { Value: mockRooms } }),
                                error({
                                    data: {
                                        InvalidProperties: [
                                            {
                                                PropertyName: 'GroupTypeName',
                                                ValidationMessage: 'Not Allowed',
                                            },
                                        ],
                                    },
                                });
                        },
                    },
                };
            }),
            getRooms: jasmine.createSpy().and.callFake((Id: 12121) => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ Value: mockRooms }),
                                error({
                                    data: {
                                        InvalidProperties: [
                                            {
                                                PropertyName: 'GroupTypeName',
                                                ValidationMessage: 'Not Allowed',
                                            },
                                        ],
                                    },
                                });
                        },
                    },
                };
            }),
            getAdditionalIdentifiers: jasmine
                .createSpy()
                .and.callFake((Id: 12121) => {
                    return {
                        $promise: {
                            then: (res, error) => {
                                res({ Value: [{ duplicate: true, ObjectState: '' }] }),
                                    error({
                                        data: {
                                            InvalidProperties: [
                                                {
                                                    PropertyName: 'GroupTypeName',
                                                    ValidationMessage: 'Not Allowed',
                                                },
                                            ],
                                        },
                                    });
                            },
                        },
                    };
                }),
            getLocationEstatementEnrollmentStatus: jasmine
                .createSpy()
                .and.callFake(array => {
                    return {
                        $promise: {
                            then: (res, error) => {
                                res({ Value: 'res' }),
                                    error({
                                        data: {
                                            InvalidProperties: [
                                                {
                                                    PropertyName: 'GroupTypeName',
                                                    ValidationMessage: 'Not Allowed',
                                                },
                                            ],
                                        },
                                    });
                            },
                        },
                    };
                }),
            getMerchantRegistrationAsync: jasmine.createSpy().and.callFake(() => {
                    return {
                        $promise: {
                            then: (res, error) => {
                                res({ Value: { MerchantCredentials: mockMerchantCredentials } });
                            },
                    },
                };
            }),
                
                
        };

        mockPatSecurityService = {
            IsAuthorizedByAbbreviation: jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.returnValue(true),
        };

        mockCacheFactory = {
            GetCache: () => new Promise((resolve, reject) => {}),
            ClearCache: () => new Promise((resolve, reject) => {}),
        };

        mockObjectService = {
            objectAreEqual: () => new Promise((resolve, reject) => {}),
        };

        routeParams = {
            locationId: -1,
        };

        mockModalFactory = {
            CancelModal: jasmine
                .createSpy('ModalFactory.CancelModal')
                .and.returnValue({ then: () => {} }),
            ConfirmModal: jasmine
                .createSpy('ModalFactory.ConfirmModal')
                .and.returnValue({ then: () => {} }),
        };

        mockRooms = [
            {
                RoomId: 1,
                Name: 'Room 1',
                duplicate: false,
                ObjectState: '',
            },
            {
                RoomId: 2,
                Name: 'Room 2',
                duplicate: false,
                ObjectState: '',
            },
        ];

        mockFeeListService = {
            access: jasmine
                .createSpy()
                .and.returnValue([
                    { view: true, create: true, update: true, delete: true },
                ]),
            getFeeLists: jasmine.createSpy(),
            save: jasmine.createSpy(),
            new: jasmine.createSpy(),
            delete: jasmine.createSpy().and.returnValue({
                then: jasmine.createSpy().and.returnValue({}),
            }),
            deleteDraft: jasmine.createSpy().and.returnValue({
                then: jasmine.createSpy().and.returnValue({}),
            }),
            getById: jasmine.createSpy(),
            validateName: jasmine.createSpy(),
            get: jasmine.createSpy(),
        };

        mockZipcodePipe = {
            transform: () => {},
        };

        mockLocationDataService = {};

        mocklocation = {
            path: jasmine.createSpy(),
            search: jasmine.createSpy(),
        };

        mockFeatureFlagService = {
            getOnce$: jasmine
                .createSpy('FeatureFlagService.getOnce$')
                .and.returnValue(of(true)),
        };

        mockPlaceOfTreatmentList = [
            { code: 1, description: 'Pharmacy' },
            { code: 2, description: 'Telehealth Provided Other than in Patient’s Home' },
        ];

        rootScope = {
            $broadcast: jasmine.createSpy().and.callThrough(),
        };
 
        locationsList = {
            Value: [
                {
                    LocationId : '1',
                    NameLine1: 'First Office',
                    AddressLine1: '123 Apple St',
                    AddressLine2: 'Suite 10',
                    ZipCode: '62401',
                    City: 'Effingham',
                    State: 'IL',
                    PrimaryPhone: '5551234567',
                    SecondaryPhone: '5551234567',
                    Fax: '5551234567',
                    TaxId: '123',
                    RemitToZipCode: '1',
                    InsuranceRemittanceZipCode: '1',
                    ProviderTaxRate: 1,
                    SalesAndUseTaxRate: 1,
                    Timezone:'Alaskan Standard Time',            
                    PaymentProvider :PaymentProvider.TransactionsUI,
                    IsPaymentGatewayEnabled:true ,
                    PaymentProviderAccountCredential:'123'
                    
                },
                {
                    LocationId: 2,
                    NameLine1: 'Second Office',
                    AddressLine1: '123 Count Rd',
                    AddressLine2: '',
                    ZipCode: '62858',
                    City: 'Louisville',
                    State: 'IL',
                    PrimaryPhone: '5559876543',
                    PaymentProvider :PaymentProvider.OpenEdge,
                    IsPaymentGatewayEnabled:true ,
                    PaymentProviderAccountCredential:null,
                    MerchantId:'123'
                },
                {
                    LocationId: 3,
                    NameLine1: 'Third Office',
                    AddressLine1: '123 Adios St',
                    AddressLine2: '',
                    ZipCode: '60601',
                    City: 'Chicago',
                    State: 'IL',
                    PrimaryPhone: '3124567890',
                    PaymentProvider :PaymentProvider.TransactionsUI,
                    IsPaymentGatewayEnabled:true ,
                    PaymentProviderAccountCredential:'789',
                    MerchantId:null,
                },
                {
                    LocationId: 4,
                    NameLine1: 'Fourth Office',
                    AddressLine1: '123 Hello Rd',
                    AddressLine2: '',
                    ZipCode: '62895',
                    City: 'Wayne City',
                    State: 'IL',
                    PrimaryPhone: '6187894563',
                    SecondaryPhone: '',
                    PaymentProvider :PaymentProvider.OpenEdge,
                    IsPaymentGatewayEnabled:true ,
                    PaymentProviderAccountCredential:null,
                    MerchantId:'789'
                },
            ],
        };

        mockTimeZones = [
            { Value: 'Alaskan Standard Time', Display: 'Alaskan Time Zone' },
            { Value: 'Central Standard Time', Display: 'Central Time Zone' },
            { Value: 'Eastern Standard Time', Display: 'Eastern Time Zone' },
            { Value: 'Aleutian Standard Time', Display: 'Hawaii–Aleutian Time Zone' },
            {
                Value: 'Hawaiian Standard Time',
                Display: 'Hawaii Standard Time (Honolulu)',
            },
            {
                Value: 'Mountain Standard Time',
                Display: 'Mountain Time Zone (Denver)',
            },
            {
                Value: 'US Mountain Standard Time',
                Display: 'Mountain Time Zone (Phoenix)',
            },
            { Value: 'Pacific Standard Time', Display: 'Pacific Time Zone' },
        ];

        mockFrmLocationCrud = new FormGroup({
            isActiveLoc: new FormControl(),
            NameLine1: new FormControl(),
            NameLine2: new FormControl(),
            NameAbbreviation: new FormControl(),
            Email: new FormControl(),
            Website: new FormControl(),
            PrimaryPhone: new FormControl(),
            SecondaryPhone: new FormControl(),
            Fax: new FormControl(),
            AddressLine1: new FormControl(),
            AddressLine2: new FormControl(),
            City: new FormControl(),
            State: new FormControl(),
            ZipCode: new FormControl(),
            Timezone: new FormControl(),
            ProviderTaxRate: new FormControl(),
            SalesAndUseTaxRate: new FormControl(),
            DefaultFinanceCharge: new FormControl(),
            MerchantId: new FormControl(),
            DisplayCardsOnEstatement: new FormControl(),
            MinimumFinanceCharge: new FormControl(),
            RemitAddressSource: new FormControl(),
            RemitToNameLine1: new FormControl(),
            RemitToNameLine2: new FormControl(),
            RemitToAddressLine1: new FormControl(),
            RemitToAddressLine2: new FormControl(),
            RemitToCity: new FormControl(),
            RemitToState: new FormControl(),
            RemitToZipCode: new FormControl(),
            RemitToPrimaryPhone: new FormControl(),
            InsuranceRemittanceAddressSource: new FormControl(),
            InsuranceRemittanceNameLine1: new FormControl(),
            InsuranceRemittanceNameLine2: new FormControl(),
            InsuranceRemittanceAddressLine1: new FormControl(),
            InsuranceRemittanceAddressLine2: new FormControl(),
            InsuranceRemittanceCity: new FormControl(),
            InsuranceRemittanceState: new FormControl(),
            InsuranceRemittanceZipCode: new FormControl(),
            InsuranceRemittancePrimaryPhone: new FormControl(),
            InsuranceRemittanceTaxId: new FormControl(),
            InsuranceRemittanceTypeTwoNpi: new FormControl(),
            InsuranceRemittanceLicenseNumber: new FormControl(),
            TaxId: new FormControl(),
            TypeTwoNpi: new FormControl(),
            LicenseNumber: new FormControl(),
            RemitOtherLocationId: new FormControl(),
            InsuranceRemittanceOtherLocationId: new FormControl(),
            AccountsOverDue: new FormControl(),
            TaxonomyId: new FormControl(),
            EnableCreditDebitCard: new FormControl(),
            FeeListId: new FormControl(),
            IncludeCvvCodeOnEstatement: new FormControl(),
            AcceptAmericanExpressOnEstatement: new FormControl(),
            AcceptVisaOnEstatement: new FormControl(),
            AcceptDiscoverOnEstatement: new FormControl(),
            AcceptMasterCardOnEstatement: new FormControl(),
            PaymentProvider: new FormControl(),
            PaymentProviderAccountCredential: new FormControl(),
            PlaceOfTreatment: new FormControl(),
        });

        mockStateTypeValue = {
            Name: 'Alaska',
            Abbreviation: 'Alaska',
        };

        mockOverdueValues = {
            Id: '1',
            Value: '1',
        };

        mockReferenceService = {
            get: () => new Promise((resolve, reject) => {}),
            forceEntityExecution: () => new Promise((resolve, reject) => {}),
            entityNames: {},
        };

        mockRxService = {
            saveRxClinic: jasmine.createSpy().and.callFake(() => {
                return {
                    then: (res, error) => {
                        res({ Value: '' }), error({});
                    },
                };
            }),
        };

        mockLocationService = {
            search: (location, rxLocation) =>
                jasmine.createSpy().and.callFake(() => retValue),
            getCurrentLocation: () =>
                jasmine.createSpy().and.callFake(() => retValue),
            getLocationEnterpriseId: (locationId) => 975,
        };

        mockLocation = [
            {
                LocationId: 1,
                NameLine1: 'Test',
                NameLine2: 'Location',
                NameAbbreviation: null,
                Website: null,
                AddressLine1: null,
                AddressLine2: null,
                City: null,
                State: null,
                ZipCode: '30092',
                Email: 'stmt@test.com',
                PrimaryPhone: null,
                SecondaryPhone: null,
                Fax: null,
                TaxId: null,
                TypeTwoNpi: null,
                TaxonomyId: null,
                Timezone: 'Central Standard Time',
                LicenseNumber: null,
                ProviderTaxRate: null,
                SalesAndUseTaxRate: null,
                Rooms: [],
                AdditionalIdentifiers: [],
                DefaultFinanceCharge: null,
                DeactivationTimeUtc: null,
                AccountsOverDue: null,
                MinimumFinanceCharge: null,
                MerchantId: null,
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
                DisplayCardsOnEstatement: false,
                PaymentProvider: null,
                PaymentProviderAccountCredential: null,
                PlaceOfTreatment: null,
            },
            {
                LocationId: 2,
                NameLine1: 'Miniphilisipe',
                NameLine2: 'Alaksa',
                NameAbbreviation: null,
                Website: null,
                AddressLine1: null,
                AddressLine2: null,
                City: null,
                State: null,
                ZipCode: '30092',
                Email: 'stmt@test.com',
                PrimaryPhone: null,
                SecondaryPhone: null,
                Fax: null,
                TaxId: null,
                TypeTwoNpi: null,
                TaxonomyId: null,
                Timezone: 'Central Standard Time',
                LicenseNumber: null,
                ProviderTaxRate: null,
                SalesAndUseTaxRate: null,
                Rooms: [],
                AdditionalIdentifiers: [],
                DefaultFinanceCharge: null,
                DeactivationTimeUtc: null,
                AccountsOverDue: null,
                MinimumFinanceCharge: null,
                MerchantId: null,
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
                DisplayCardsOnEstatement: false,
                PaymentProvider: 0,
                PaymentProviderAccountCredential: null,
                PlaceOfTreatment: -1,
            },
            {
                LocationId: 3,
                NameLine1: 'Test',
                NameLine2: 'Aqrsm',
                NameAbbreviation: null,
                Website: null,
                AddressLine1: null,
                AddressLine2: null,
                City: null,
                State: null,
                ZipCode: '30092',
                Email: 'stmt@test.com',
                PrimaryPhone: null,
                SecondaryPhone: null,
                Fax: null,
                TaxId: null,
                TypeTwoNpi: null,
                TaxonomyId: null,
                Timezone: 'Central Standard Time',
                LicenseNumber: null,
                ProviderTaxRate: null,
                SalesAndUseTaxRate: null,
                Rooms: [],
                AdditionalIdentifiers: [],
                DefaultFinanceCharge: null,
                DeactivationTimeUtc: null,
                AccountsOverDue: null,
                MinimumFinanceCharge: null,
                MerchantId: null,
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
                DisplayCardsOnEstatement: false,
                PaymentProvider: 0,
                PaymentProviderAccountCredential: null,
                PlaceOfTreatment: 11,
            },
            {
                LocationId: 4,
                NameLine1: 'Miniphilisipe',
                NameLine2: 'Alaksa',
                NameAbbreviation: null,
                Website: null,
                AddressLine1: null,
                AddressLine2: null,
                City: null,
                State: null,
                ZipCode: '30092',
                Email: 'stmt@test.com',
                PrimaryPhone: null,
                SecondaryPhone: null,
                Fax: null,
                TaxId: null,
                TypeTwoNpi: null,
                TaxonomyId: null,
                Timezone: 'Central Standard Time',
                LicenseNumber: null,
                ProviderTaxRate: null,
                SalesAndUseTaxRate: null,
                Rooms: [],
                AdditionalIdentifiers: [],
                DefaultFinanceCharge: null,
                DeactivationTimeUtc: null,
                AccountsOverDue: null,
                MinimumFinanceCharge: null,
                MerchantId: null,
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
                DisplayCardsOnEstatement: false,
                PaymentProvider: null,
                PaymentProviderAccountCredential: null,
                PlaceOfTreatment: -1
            },
        ];

        retValue = { $promise: { then: jasmine.createSpy() } };

        mockLocationIdentifierService = {
            get: jasmine.createSpy().and.callFake(() => {
                return {
                    then: (res, error) => {
                        res({ Value: 'res' });
                        error({});
                    },
                };
            }),
        };

        mockClaimEnumService = {
            getPlaceOfTreatment: jasmine
                .createSpy()
                .and.returnValue([
                    { placeOfTreatments: mockPlaceOfTreatmentList },
                ])
        };

        mockError = {
            data: {
                InvalidProperties: [
                    {
                        PropertyName: 'LocationName',
                        ValidationMessage: 'Not Allowed',
                    },
                ],
            },
        };

        mockConfirmationModalService = {
            open: jasmine.createSpy().and.returnValue({
                events: {
                    pipe: event => {
                        return {
                            type: 'confirm',
                            subscribe: success => {
                                success({ type: 'confirm' });
                            },
                            filter: f => {
                                return f;
                            },
                        };
                    },
                },
                close: jasmine.createSpy(),
            }),
        };

        mockApplicationBillingInfoService = {
            applicationBilling$: of({
                Result: {
                    ApplicationBillingInfoId: 1,
                    ApplicationId: 2,
                    BillingModel: 2,
                },
            }),
        };

        mockDialog = {
            close: () => {},
            open: () => {},
            content: {
                instance: {
                    title: '',
                },
            },
        };
        mockTranslateService = jasmine.createSpyObj<TranslateService>(
            'TranslateService',
            ['instant']
        );
      const  mockMerchantCredentials ='123';

        TestBed.configureTestingModule({
            imports: [
                FormsModule,
                ReactiveFormsModule,
                TranslateModule.forRoot(),
                BrowserModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
            ],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'locationService', useValue: mockLocationService },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'ListHelper', useValue: mockListHelper },
                { provide: 'LocationServices', useValue: mockGetLocationServices },
                { provide: 'StaticData', useValue: stateService },
                { provide: 'ModalFactory', useValue: mockModalFactory },
                { provide: 'TimeZones', useValue: mockTimeZones },
                { provide: 'AccountsOverdueValues', useValue: mockOverdueValues },
                { provide: 'AccountsOverdueValues', useValue: mockOverdueValues },
                { provide: 'referenceDataService', useValue: mockReferenceService },
                { provide: FeeListsService, useValue: mockFeeListService },
                { provide: FeeListsService, useValue: mockFeeListService },
                { provide: 'PatCacheFactory', useValue: mockCacheFactory },
                { provide: 'ObjectService', useValue: mockObjectService },
                { provide: '$routeParams', useValue: routeParams },
                { provide: 'RxService', useValue: mockRxService },
                { provide: '$location', useValue: mocklocation },
                { provide: '$rootScope', useValue: rootScope },
                { provide: FeeListsService, useValue: mockFeeListService },
                { provide: LocationDataService, useValue: mockLocationDataService },
                { provide: ZipCodePipe, useValue: mockZipcodePipe },
                {
                    provide: LocationIdentifierService,
                    useValue: mockLocationIdentifierService,
                },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
                {
                    provide: ApplicationBillingInfoService,
                    useValue: mockApplicationBillingInfoService,
                },
                {
                    provide: ConfirmationModalService,
                    useValue: mockConfirmationModalService,
                },
                { provide: DialogRef, useValue: mockDialog },
                DialogService,
                DialogContainerService,
                { provide: ClaimEnumService, useValue: mockClaimEnumService },
            ],
            declarations: [
                LocationCrudComponent,
                SoarSelectListComponent,
                TaxonomySelectorComponent,
                OrderByPipe,
                AppCheckBoxComponent,
                FeeListLocationComponent,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LocationCrudComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LocationCrudComponent);
        component = fixture.componentInstance;
        toastrFactory = TestBed.get('toastrFactory');
        modalFactory = TestBed.get('ModalFactory');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngAfterContentInit function -> ', () => {
        it('should set frmLocationCrud Values', () => {
            component.selectedLocation = mockLocation.values[0];
            component.ngAfterContentInit();
            expect(component.frmLocationCrud).not.toBeUndefined();
        });
    });

    describe('ngOnchanges function -> ', () => {
        it('should set input values changes', () => {
            let changes: SimpleChanges = {
                selectedLocation: {
                    currentValue: locationsList.Value[3],
                    previousValue: null,
                    firstChange: false,
                    isFirstChange: () => {
                        return false;
                    },
                },
            };
            component.placeOfTreatmentList = mockPlaceOfTreatmentList;
            component.selectedLocation = { PlaceOfTreatment: 68 };
            component.editMode = false;

            component.ngOnChanges(changes);
            expect(component.selectedLocation).not.toBeNull();
        });
    });

    describe('selectedLocationWatch function -> ', () => {
        it('should call updateDataHasChangedFlag', () => {
            const newValue = { LocationId: 123 };
            const oldValue = { LocationId: 123 };
            component.updateDataHasChangedFlag = jasmine.createSpy();
            component.selectedLocationWatch(newValue, oldValue);
            expect(component.updateDataHasChangedFlag).toHaveBeenCalled();
        });
    });

    describe('ngOnInit ->', () => {
        it('should call following funcations', () => {
            component.createForm = jasmine.createSpy();
            component.createGroup = jasmine.createSpy();
            component.authAccesss = jasmine.createSpy();
            component.getTaxnomyCodes = jasmine.createSpy();
            component.checkFeatureFlags = jasmine.createSpy();
            component.ngOnInit();
            expect(mockConfirmationModalService.open).toHaveBeenCalled();
            expect(component.checkFeatureFlags).toHaveBeenCalled();
            expect(component.showPaymentProvider).toBe(true);
            expect(component.createForm).toHaveBeenCalled();
            expect(component.createGroup).toHaveBeenCalled();
            expect(component.authAccesss).toHaveBeenCalled();
            expect(component.timeZoneModel?.length).toBe(mockTimeZones?.length);
            expect(component.getTaxnomyCodes).toHaveBeenCalled();
        });

        it('should show User is not authorized to access this area toaster error', () => {
            routeParams.locationId = -1;
            component.hasLocationAddAccess = false;
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.returnValue(false);
            component.ngOnInit();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('toggleLocationStatus function -> ', () => {
        it('should set isActiveLoc value', () => {
            let event = {
                target: {
                    checked: true,
                },
            };
            component.toggleLocationStatus(event);
            expect(component.isActiveLoc).toEqual(true);
        });
    });

    describe('OnDefaultDateChanged function-> ', () => {
        it('should set defaultDate value', () => {
            let date = new Date();
            component.OnDefaultDateChanged(date);
            expect(component.defaultDate).toEqual(date);
        });
    });

    describe('createForm function -> ', () => {
        it('Should Call hasChanged', () => {
            component.selectedLocation = locationsList.Value[0];
            component.selectedLocation.DefaultFinanceCharge = 0;
            component.InsuranceRemittanceAddressSource.setValue(2);
            component.RemitAddressSource.setValue(2);
            component.frmLocationCrud = mockFrmLocationCrud;
            component.createForm();
            expect(
                component.frmLocationCrud.controls.RemitAddressSource.value
            ).toEqual('0');
        });
        it('Should Call hasChanged', () => {
            component.selectedLocation = locationsList.Value[0];
            component.selectedLocation.DefaultFinanceCharge = 0;
            component.InsuranceRemittanceAddressSource.setValue(1);
            component.RemitAddressSource.setValue(1);
            component.frmLocationCrud = mockFrmLocationCrud;
            component.createForm();
            expect(
                component.frmLocationCrud.controls.RemitAddressSource.value
            ).toEqual('0');
        });
    });

    describe('createGroup function -> ', () => {
        it('Should Call hasChanged', () => {
            component.selectedLocation = locationsList.Value[0];
            component.selectedLocation.AdditionalIdentifiers = [];

            component.createGroup();
            expect(component.isIdentifierAdded).toEqual(true);
        });
    });

    describe('getTaxnomyCodes function -> ', () => {
        it('should call static data TaxonomyCodes', () => {
            component.getTaxnomyCodes();
            expect(stateService.TaxonomyCodes).toHaveBeenCalled();
        });
    });

    describe('taxonomyOnSuccess function -> ', () => {
        it('Should Call hasChanged', () => {
            component.taxonomyOnSuccess({ Value: [] });
            expect(component.taxonomyCodesSpecialties).toEqual([]);
        });
    });

    describe('authAccesss function -> ', () => {
        it('Should call authAdditionalIdentifierAccess', () => {
            component.authAdditionalIdentifierAccess = jasmine.createSpy();
            component.authAccesss();
            expect(component.authAdditionalIdentifierAccess).toHaveBeenCalled();
        });
    });

    describe('authAdditionalIdentifierAccess function -> ', () => {
        it('should call the authAdditionalIdentifierAccess function', () => {
            component.authAdditionalIdentifierAccess();
            expect(component.hasAdditionalIdentifierViewAccess).not.toBeNull();
            expect(component.hasAdditionalIdentifierEditAccess).not.toBeNull();
            expect(component.hasTreatmentRoomsViewAccess).not.toBeNull();
        });
    });

    describe('getEstatementEnrollmentStatus function -> ', () => {
        it('should Call mockGetLocationServices.getLocationEstatementEnrollmentStatus', () => {
            component.getEstatementEnrollmentStatus();
            expect(
                mockGetLocationServices.getLocationEstatementEnrollmentStatus
            ).toHaveBeenCalled();
        });

        it('should Call getEstatementEnrollmentStatusSuccess', () => {
            component.getEstatementEnrollmentStatusSuccess = jasmine.createSpy();
            component.getEstatementEnrollmentStatus();
            mockGetLocationServices.getLocationEstatementEnrollmentStatus();
            expect(component.getEstatementEnrollmentStatusSuccess).toHaveBeenCalled();
        });
    });

    describe('getEstatementEnrollmentStatusSuccess function -> ', () => {
        it('should set the isEstatementsEnabled property', () => {
            component.getEstatementEnrollmentStatusSuccess({ Result: false });
            expect(component.isEstatementsEnabled).toEqual(false);
        });
    });

    describe('getEstatementEnrollmentStatusFailure function -> ', () => {
        it('should trigger the toastr error', () => {
            component.getEstatementEnrollmentStatusFailure();
            expect(toastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('displayTaxonomyCodeByField function-> ', () => {
        it('should return ', () => {
            const res = component.displayTaxonomyCodeByField('1', '');
            expect(res).toEqual('');
        });
    });

    describe('setDefaultValues function -> ', () => {
        it('should set the location default values', () => {
            if (
                component.selectedLocation == null ||
                component.selectedLocation == undefined
            ) {
                component.selectedLocation = locationsList.Value[0];
            }

            let ofcLocation = locationsList.Value[0];
            ofcLocation.ProviderTaxRate = 1;

            component.setDefaultValues(ofcLocation);
            expect(component.selectedLocation).not.toBeNull();
        });
    });

  describe('paymentGatewayChanged function -> ', () => {
    it('should call the disablePaymentGatewayWarning function if IsPaymentGatewayEnabled is false', () => {
      const spy = (component.disablePaymentGatewayWarning =
        jasmine.createSpy());
      let event = {
        currentTarget: {
          checked: false,
        },
      };
      component.selectedLocation = locationsList.Value[0];
      component.paymentGatewayChanged(event);
      expect(spy).toHaveBeenCalled();
      expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
        null
      );
    });
    it('should set PaymentProvider to OpenEdge by default if IsPaymentGatewayEnabled is true', () => {
      component.setVisibilityWhenPaymentProviderChanged = jasmine.createSpy();
      component.setDefaultPaymentProvider = jasmine
        .createSpy()
        .and.returnValue(component.paymentProviders[0].Value);
      let event = {
        currentTarget: {
          checked: true,
        },
      };
      component.paymentGatewayChanged(event);
      expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
        PaymentProvider.OpenEdge
      );
      expect(
        component.frmLocationCrud.controls.EnableCreditDebitCard.value
      ).toEqual(true);
      expect(component.setDefaultPaymentProvider).toHaveBeenCalled();
      expect(
        component.setVisibilityWhenPaymentProviderChanged
      ).toHaveBeenCalled();
      expect(component.accountTokenInputHidden.OpenEdgeEnabled).toBeFalsy();
      expect(
        component.accountTokenInputHidden.PaymentIntegrationEnabled
      ).toBeTruthy();
    });


    it('should call warningGPIPaymentProviderChange when unchecked and conditions are met', () => {
        component.selectedLocation =locationsList.Value[0];
        component.createForm();
        component.editMode =true;
        const event = { currentTarget: { checked: false } };
        spyOn(component, 'warningGPIPaymentProviderChange').and.callThrough();
    
        component.paymentGatewayChanged(event);
    
        expect(component.warningGPIPaymentProviderChange).toHaveBeenCalledWith(true);
        expect(component.frmLocationCrud.controls['EnableCreditDebitCard'].value).toBeFalsy();
        expect(component.frmLocationCrud.controls['PaymentProviderAccountCredential'].disabled).toBeTruthy();
    });

    it('should call disablePaymentGatewayWarning when unchecked and conditions are met', () => {
        const event = { currentTarget: { checked: false } };
        spyOn(component, 'disablePaymentGatewayWarning').and.callThrough();

        // Change selectedLocation to test this path
        component.selectedLocation = {
            LocationId: 1,
            IsPaymentGatewayEnabled: true,
            PaymentProvider: PaymentProvider.OpenEdge // Not matching TransactionsUI
        };
        component.createForm();
        component.editMode =true;

        component.paymentGatewayChanged(event);

        expect(component.disablePaymentGatewayWarning).toHaveBeenCalled();
        expect(component.frmLocationCrud.controls['EnableCreditDebitCard'].value).toBeFalsy();
    });

    it('should call updateValueforModal when unchecked and no payment gateway is enabled', () => {
        const event = { currentTarget: { checked: false } };
        spyOn(component, 'updateValueforModal').and.callThrough();

        component.selectedLocation = {
            LocationId: null,
            IsPaymentGatewayEnabled: false,
            PaymentProvider: null
        };

        component.paymentGatewayChanged(event);

        expect(component.updateValueforModal).toHaveBeenCalled();
        expect(component.frmLocationCrud.controls['EnableCreditDebitCard'].value).toBeFalsy();
    });
  });

    describe('disablePaymentGatewayWarning function -> ', () => {
        it('should call the modalfactory instance', () => {
            component.disablePaymentGatewayWarning();
            expect(modalFactory.ConfirmModal).toHaveBeenCalled();
        });
    });

    describe('closeModals function -> ', () => {
    it('component.selectedLocation.IsPaymentGatewayEnabled ', () => {
      component.closeModals();
      expect(
        component.frmLocationCrud.controls.EnableCreditDebitCard.value
      ).toEqual(true);
    });

    it('should call setDefaultPaymentProvider', () => {
      component.setDefaultPaymentProvider = jasmine.createSpy();
      component.closeModals();
      expect(
        component.frmLocationCrud.controls.EnableCreditDebitCard.value
      ).toEqual(true);
      expect(component.setDefaultPaymentProvider).toHaveBeenCalled();
    });
    });

    describe('updateValueforModal function -> ', () => {
        it('should set the IsPaymentGatewayEnabled property to true', () => {
            component.selectedLocation = locationsList.Value[0];
            component.updateValueforModal();
            expect(
                component.frmLocationCrud.controls.EnableCreditDebitCard.value
            ).toEqual(false);
        });
    });

    describe('displayCardsOnEstatementChange function -> ', () => {
        it('should set the properties value', () => {
            if (
                component.selectedLocation == null ||
                component.selectedLocation == undefined
            ) {
                component.selectedLocation = locationsList.Value[0];
            }
            component.displayCardsOnEstatementChange(true);
            expect(component.selectedLocation.AcceptAmericanExpressOnEstatement).toBe(
                true
            );
            expect(component.selectedLocation.AcceptDiscoverOnEstatement).toBe(true);
            expect(component.selectedLocation.AcceptMasterCardOnEstatement).toBe(
                true
            );
            expect(component.selectedLocation.AcceptVisaOnEstatement).toBe(true);
            expect(component.selectedLocation.IncludeCvvCodeOnEstatement).toBe(false);
        });

        it('should set the properties value as false', () => {
            if (
                component.selectedLocation == null ||
                component.selectedLocation == undefined
            ) {
                component.selectedLocation = locationsList.Value[0];
            }
            component.displayCardsOnEstatementChange(false);
            expect(component.selectedLocation.AcceptAmericanExpressOnEstatement).toBe(
                false
            );
            expect(component.selectedLocation.AcceptDiscoverOnEstatement).toBe(false);
            expect(component.selectedLocation.AcceptMasterCardOnEstatement).toBe(
                false
            );
            expect(component.selectedLocation.AcceptVisaOnEstatement).toBe(false);
            expect(component.selectedLocation.IncludeCvvCodeOnEstatement).toBe(false);
        });
    });

    describe('remitAddressSourceChanged function -> ', () => {
        it('should set the properties value', () => {
            let event = {
                currentTarget: {
                    checked: true,
                },
            };
            if (
                component.selectedLocation == null ||
                component.selectedLocation == undefined
            ) {
                component.selectedLocation = locationsList.Value[0];
            }
            component.remitAddressSourceChanged(event);
            component.selectedLocation.RemitAddressSource = 3;
            expect(component.selectedLocation.RemitToNameLine1).toBe('');
            expect(component.selectedLocation.RemitToNameLine2).toBe('');
            expect(component.selectedLocation.RemitToAddressLine1).toBe('');
            expect(component.selectedLocation.RemitToAddressLine2).toBe('');
            expect(component.selectedLocation.RemitToCity).toBe('');
            expect(component.selectedLocation.RemitToState).toBe('');
            expect(component.selectedLocation.RemitToZipCode).toBe('');
            expect(component.selectedLocation.RemitToPrimaryPhone).toBe('');
        });
    });

    describe('remittanceInsuranceSourceChanged function -> ', () => {
        it('should set the properties value', () => {
            let event = {
                currentTarget: {
                    checked: true,
                },
            };
            if (
                component.selectedLocation == null ||
                component.selectedLocation == undefined
            ) {
                component.selectedLocation = locationsList.Value[0];
            }
            component.remittanceInsuranceSourceChanged(event);
            component.selectedLocation.InsuranceRemittanceAddressSource = 3;
            expect(component.selectedLocation.InsuranceRemittanceNameLine1).toBe('');
            expect(component.selectedLocation.InsuranceRemittanceNameLine2).toBe('');
            expect(component.selectedLocation.InsuranceRemittanceAddressLine1).toBe(
                ''
            );
            expect(component.selectedLocation.InsuranceRemittanceAddressLine2).toBe(
                ''
            );
            expect(component.selectedLocation.InsuranceRemittanceCity).toBe('');
            expect(component.selectedLocation.InsuranceRemittanceState).toBe('');
            expect(component.selectedLocation.InsuranceRemittanceZipCode).toBe('');
            expect(component.selectedLocation.InsuranceRemittancePrimaryPhone).toBe(
                ''
            );
            expect(component.InsuranceRemittanceTaxId).toBe('');
            expect(component.InsuranceRemittanceTypeTwoNpi).toBe('');
            expect(component.InsranceRemittanceLicenseNumber).toBe('');
        });
    });

    describe('selectedLocInit function -> ', () => {
        it('should set isActiveLoc is true when DeactivationTimeUtc is null', () => {
            component.selectedLocation = {
                DeactivationTimeUtc: null,
            };
            component.selectedLocInit();
            expect(component.isActiveLoc).toEqual(true);
        });

        it('should set isActiveLoc is true when DeactivationTimeUtc is not null', () => {
            component.selectedLocation = {
                DeactivationTimeUtc: new Date(),
            };
            component.selectedLocInit();
            expect(component.isActiveLoc).toEqual(false);
        });
    });

    describe('checkForUniqueLocationName function -> ', () => {
        it('should set locationNameIsUnique as true, when form has no values', () => {
            component.frmLocationCrud = null;
            component.checkForUniqueLocationName();
            expect(component.locationNameIsUnique).toEqual(true);
        });

        it('should call mockGetLocationServices.IsNameUnique, when form has values', () => {
            component.frmLocationCrud = new FormGroup({
                NameLine1: new FormControl(),
            });
            component.frmLocationCrud?.controls?.NameLine1.patchValue(
                'Location Test'
            );
            component.checkForUniqueLocationName();
            expect(mockGetLocationServices.IsNameUnique).toHaveBeenCalled();
        });

        it('should call mockGetLocationServices.IsNameUnique, when form has values', () => {
            component.frmLocationCrud = new FormGroup({
                NameLine1: new FormControl(),
            });
            component.checkForUniqueLocationNameSuccess = jasmine.createSpy();
            component.frmLocationCrud?.controls?.NameLine1.patchValue(
                'Location Test'
            );
            component.checkForUniqueLocationName();
            mockGetLocationServices.IsNameUnique();
            expect(component.checkForUniqueLocationNameSuccess).toHaveBeenCalled();
        });
    });

    describe('checkForUniqueLocationNameSuccess function -> ', () => {
        it('should set locationNameIsUnique as true, when getting API reponse as true', () => {
            component.checkForUniqueLocationNameSuccess({ Value: true });
            expect(component.locationNameIsUnique).toEqual(true);
        });

        it('should set locationNameIsUnique as false, when getting API reponse as false', () => {
            component.checkForUniqueLocationNameSuccess({ Value: false });
            expect(component.locationNameIsUnique).toEqual(false);
            expect(component.uniqueLocationServerMessage).not.toEqual(null);
        });
    });

    describe('checkForUniqueLocationNameFailure function -> ', () => {
        it('should set locationNameIsUnique as false, when getting API failure', () => {
            component.checkForUniqueLocationNameFailure();
            expect(component.locationNameIsUnique).toEqual(false);
        });
    });

    describe('checkForUniqueDisplayName function -> ', () => {
        it('should set displayNameIsUnique as true', () => {
            component.selectedLocation = { NameAbbreviation: '' };
            component.checkForUniqueDisplayName();
            expect(component.displayNameIsUnique).toEqual(true);
        });

        it('should call the checkForUniqueDisplayName', () => {
            component.selectedLocation = { NameAbbreviation: 'test' };
            component.checkForUniqueDisplayName();
            expect(
                mockGetLocationServices.IsAbbreviatedNameUnique
            ).toHaveBeenCalled();
        });

        it('should call the checkForUniqueDisplayNameSuccess', () => {
            component.selectedLocation = { NameAbbreviation: 'test' };
            component.checkForUniqueDisplayNameSuccess = jasmine.createSpy();

            component.checkForUniqueDisplayName();
            mockGetLocationServices.IsAbbreviatedNameUnique();
            expect(component.checkForUniqueDisplayNameSuccess).toHaveBeenCalled();
        });
    });

    describe('checkForUniqueDisplayNameSuccess function -> ', () => {
        it('should set displayNameIsUnique as true, when API response is true', () => {
            let response = { Value: true };
            component.checkForUniqueDisplayNameSuccess(response);
            expect(component.displayNameIsUnique).toEqual(true);
        });

        it('should set displayNameIsUnique as false, when API response is false', () => {
            let response = { Value: false };
            component.checkForUniqueDisplayNameSuccess(response);
            expect(component.displayNameIsUnique).toEqual(false);
            expect(component.uniqueDisplayNameServerMessage).not.toEqual(null);
        });
    });

    describe('checkForUniqueDisplayNameFailure function -> ', () => {
        it('should set displayNameIsUnique is false', () => {
            component.checkForUniqueDisplayNameFailure();
            expect(component.displayNameIsUnique).toEqual(false);
            expect(component.savingLocation).toEqual(false);
            expect(component.uniqueDisplayNameServerMessage).not.toEqual(null);
        });
    });

    describe('setAccountsOverDue function -> ', () => {
        it('should set enableAccountsOverDue as true', () => {
            let data = { DefaultFinanceCharge: null };
            component.frmLocationCrud = new FormGroup({
                DefaultFinanceCharge: new FormControl(),
            });
            component.frmLocationCrud.controls.DefaultFinanceCharge.patchValue(
                'Test'
            );
            component.setAccountsOverDue(data);
            expect(component.enableAccountsOverDue).toEqual(true);
        });

        it('should set enableAccountsOverDueList as true', () => {
            let data = { DefaultFinanceCharge: null };
            component.frmLocationCrud = new FormGroup({
                DefaultFinanceCharge: new FormControl(),
            });
            component.frmLocationCrud.controls.DefaultFinanceCharge.patchValue('T');
            component.setAccountsOverDue(data);
            expect(component.enableAccountsOverDueList).toEqual(true);
        });

        it('should set enableAccountsOverDue as false', () => {
            let data = {};
            component.frmLocationCrud = new FormGroup({});
            component.setAccountsOverDue(data);
            expect(component.enableAccountsOverDue).toEqual(false);
        });
    });

    describe('validatePaste function -> ', () => {
        it('should remove numaric value from city', () => {
            component.selectedLocation.City = 'test123';
            component.validatePaste();
            expect(component.selectedLocation.City).toEqual('test');
        });
    });

    describe('addRoom function -> ', () => {
        it('should set selectedRooms, when selectedLocation.Rooms and selectedRooms are not defined', () => {
            component.selectedLocation = {};
            component.addRoom();
            expect(component.selectedRooms?.length).toBeGreaterThan(0);
        });

        it('should set selectedRooms , when selectedRooms are not defined', () => {
            component.selectedLocation.Rooms = [];
            component.selectedRooms = undefined;
            component.addRoom();
            expect(component.selectedRooms?.length).toBeGreaterThan(0);
        });

        it('should set selectedRooms, when selectedLocation.Rooms are defined', () => {
            component.selectedLocation.Rooms = [];
            component.addRoom();
            expect(component.selectedRooms?.length).toBeGreaterThan(0);
        });
    });

    describe('roomOnChange function -> ', () => {
        it('should call checkForRoomDuplicates', () => {
            component.checkForRoomDuplicates = jasmine.createSpy();
            component.roomOnChange({}, 0, 'Room 1');
            expect(component.checkForRoomDuplicates).toHaveBeenCalled();
        });

        it('should Set component.selectedLocation.Rooms[0].Name', () => {
            component.checkForRoomDuplicates = jasmine.createSpy();
            let room = {
                RoomId: '123',
                Name: 'Room 1',
                ObjectState: 'Add',
                $unique: true,
            };
            component.selectedLocation = {
                Rooms: [
                    { Name: 'Room 1', ObjectState: 'Add', $unique: true },
                    { Name: 'Room 2', ObjectState: '', $unique: true },
                ],
            };
            component.roomOnChange(room, 0, 'Room 1');
            expect(component.selectedLocation.Rooms[0].Name).toEqual('Room 1');
        });

        it('should Set component.selectedLocation.Rooms[0].Name', () => {
            component.checkForRoomDuplicates = jasmine.createSpy();
            let room = { Name: 'Room 1', ObjectState: 'Add', $unique: true };
            component.selectedLocation = {
                Rooms: [
                    { Name: 'Room 1', ObjectState: 'Add', $unique: true },
                    { Name: 'Room 2', ObjectState: '', $unique: true },
                ],
            };
            component.roomOnChange(room, 0, 'Room 1');
            expect(component.selectedLocation.Rooms[0].Name).toEqual('Room 1');
        });

        it('should call checkForRoomDuplicates', () => {
            component.checkForRoomDuplicates = jasmine.createSpy();
            let room = { Name: null, ObjectState: 'Add', $unique: true };
            component.selectedLocation = {
                Rooms: [
                    { Name: null, ObjectState: '', $unique: true },
                    { Name: 'Room 2', ObjectState: '', $unique: true },
                ],
            };
            component.roomOnChange(room, 0, 'Room 1');
            expect(component.selectedLocation.Rooms[0].Name).toEqual('Room 1');
        });
    });

    describe('checkForRoomDuplicates  function -> ', () => {
        it('should call checkForRoomDuplicates', () => {
            component.selectedLocation = {
                Rooms: [
                    { Name: 'Room 3', ObjectState: 'Update', $unique: true },
                    { Name: 'Room 4', ObjectState: 'Add', $unique: true },
                ],
            };

            component.originalLocation = {
                Rooms: [
                    { Name: 'Room 1', ObjectState: '', $unique: true },
                    { Name: 'Room 2', ObjectState: '', $unique: true },
                ],
            };
            component.checkForRoomDuplicates();
        });
    });

    describe('deleteRoom  function -> ', () => {
        it('should set ObjectState as delete', () => {
            component.selectedLocation = {
                Rooms: [
                    { RoomId: '1', Name: 'Room 3', ObjectState: 'Update', $unique: true },
                    { Name: 'Room 4', ObjectState: 'Add', $unique: true },
                ],
            };
            let room = {
                RoomId: '1',
                Name: 'Room 1',
                ObjectState: 'Add',
                $unique: true,
            };
            component.deleteRoom(room, 0);
            expect(component.selectedLocation.Rooms[0].ObjectState).toEqual('Delete');
        });

        it('should remove room', () => {
            component.selectedLocation = {
                Rooms: [
                    { Name: 'Room 1', ObjectState: 'Update', $unique: true },
                    { Name: 'Room 4', ObjectState: 'Add', $unique: true },
                ],
            };
            let room = { Name: 'Room 1', ObjectState: 'Add', $unique: true };
            component.deleteRoom(room, 0);
            expect(component.selectedLocation.Rooms?.length).toEqual(1);
        });
    });

    describe('onstatechange  function -> ', () => {
        it('should set component.selectedLocation.State', () => {
            component.selectedLocation.State = '';
            component.onstatechange('delete');
            expect(component.selectedLocation.State).toEqual('delete');
        });
    });

    describe('onfeeChange function -> ', () => {
        it('should set selectedLocation.FeeListId', () => {
            component.selectedLocation.FeeListId = 0;
            component.onfeeChange(5);
            expect(component.selectedLocation.FeeListId).toEqual(5);
        });
    });

    describe('publishOutputFunctions function -> ', () => {
        it('should call output funcations', () => {
            spyOn(component.editFuncChange, 'emit');
            spyOn(component.saveFuncChange, 'emit');
            spyOn(component.cancelFuncChange, 'emit');
            spyOn(component.addFuncChange, 'emit');

            component.publishOutputFunctions();
            expect(component.editFuncChange.emit).toHaveBeenCalled();
            expect(component.saveFuncChange.emit).toHaveBeenCalled();
            expect(component.cancelFuncChange.emit).toHaveBeenCalled();
            expect(component.addFuncChange.emit).toHaveBeenCalled();
        });
    });

    describe('getLocationIdentifiers function -> ', () => {
        it('should call mockLocationIdentifierService.get', () => {
            component.hasAdditionalIdentifierViewAccess = true;

            component.getLocationIdentifiers();
            expect(mockLocationIdentifierService.get).toHaveBeenCalled();
        });

        it('should call locationIdentifiersGetSuccess', () => {
            component.hasAdditionalIdentifierViewAccess = true;
            component.locationIdentifiersGetSuccess = jasmine.createSpy();
            component.getLocationIdentifiers();
            mockLocationIdentifierService.get();
            expect(component.locationIdentifiersGetSuccess).toHaveBeenCalled();
        });
    });

    describe('getPlaceOfTreatmentList function -> ', () => {
        it('should call the getPlaceOfTreatment', () => {
            expect(mockClaimEnumService.getPlaceOfTreatment).toHaveBeenCalled();
        })
    })

    describe('locationIdentifiersGetSuccess function -> ', () => {
        it('should call createGroup', () => {
            let res = { Value: [] };
            component.createGroup = jasmine.createSpy();
            component.selectedLocation = {};
            component.locationIdentifiersGetSuccess(res);
            expect(component.additionalIdentifiers).toEqual([]);
            expect(component.createGroup).toHaveBeenCalled();
        });

        it('should call the locationIdentifiersGetSuccess', () => {
            const res = {
                Value: [
                    { MasterLocationIdentifierId: 1 },
                    { MasterLocationIdentifierId: 2 },
                ],
            };
            component.locationIdentifiersGetSuccess(res);
            expect(component.loading).toEqual(false);
        });
    });

    describe('locationIdentifiersGetFailure function -> ', () => {
        it('should call createGroup', () => {
            component.locationIdentifiersGetFailure();
            expect(component.loading).toEqual(false);
            expect(component.locationIdentifiers?.length).toEqual(0);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('updateDataHasChangedFlag  function -> ', () => {
        it('should call setDisplayTimezone', () => {
            component.editMode = true;
            component.ofcLocation = { AddressLine1: 'Test' };
            component.setDisplayTimezone = jasmine.createSpy();
            component.updateDataHasChangedFlag(true);
            expect(component.selectedLocation.AddressLine1).toEqual('Test');
            expect(component.setDisplayTimezone).toHaveBeenCalled();
        });

        it('should set hasChanges', () => {
            component.editMode = true;
            component.ofcLocation = { AddressLine1: 'Test' };
            component.dataHasChanged = true;
            component.updateDataHasChangedFlag(false);
            expect(component.hasChanges).toEqual(false);
        });
    });

    describe('setDisplayTimezone function -> ', () => {
        it('should set selectedLocation.AddressLine1', () => {
            component.selectedLocation = { AddressLine1: 'Test',  Timezone:'IST' };
            component.setDisplayTimezone();
            expect(component.displayTimezone).toEqual(undefined);
        });

        it('should call the setDisplayTimezone', () => {
            component.selectedLocation = locationsList.Value[0];
            component.setDisplayTimezone();
            expect(component.displayTimezone).not.toBe(null);
            expect(component.displayTimezone).toEqual('Alaskan Time Zone');
        });
    });

    describe('hasChanged function -> ', () => {
        it('should return true', () => {
            component.dataHasChanged = true;
            const result = component.hasChanged();
            expect(result).toBe(true);
            expect(component.hasChanges).toEqual(true);
        });
    });

    describe('getUsersByLocation function -> ', () => {
        it('should call mockGetLocationServices.getUsers', () => {
            let ofcLocation = locationsList.Value[0];
            component.getUsersByLocation(ofcLocation);
            expect(mockGetLocationServices.getUsers).toHaveBeenCalled();
        });
        it('should userCount equal to 1', () => {
            let ofcLocation = locationsList.Value[0];
            component.getUsersByLocation(ofcLocation);
            mockGetLocationServices.getUsers();
            expect(component.userCount).toEqual(1);
        });
    });

    describe('getRoomsByLocation function -> ', () => {
        it('should call the mockGetLocationServices.getRoomScheduleStatus', () => {
            let ofcLocation = locationsList.Value[0];
            component.hasTreatmentRoomsViewAccess = true;
            mockGetLocationServices.getRooms = jasmine
                .createSpy()
                .and.callFake(array => {
                    return {
                        $promise: {
                            then(resolve) {
                                resolve({ Value: mockRooms });
                            },
                        },
                    };
                });

            component.getRoomsByLocation(ofcLocation);
            mockGetLocationServices.getRooms();
            expect(mockGetLocationServices.getRoomScheduleStatus).toHaveBeenCalled();
        });
    });

    describe('getIdentifierByLocation function -> ', () => {
        it('should call the getIdentifierByLocation', () => {
            let ofcLocation = locationsList.Value[0];
            component.hasAdditionalIdentifierViewAccess = true;
            component.getIdentifierByLocation(ofcLocation);
            expect(
                mockGetLocationServices.getAdditionalIdentifiers
            ).toHaveBeenCalled();
        });
    });

    describe('addFunc function -> ', () => {
        it('should editMode,isAdding  true', () => {
            component.initializeDefaultModel = jasmine.createSpy();
            component.bindData = jasmine.createSpy();
            component.addFunc();
            expect(component.editMode).toEqual(true);
            expect(component.isAdding).toEqual(true);
            expect(component.initializeDefaultModel).toHaveBeenCalled();
            expect(component.bindData).toHaveBeenCalled();
        });
    });

    describe('initializeDefaultModel function -> ', () => {
        // NG15CLEANUP This test will not work since getAdditionalIdentifiers is not called in this function
        xit('should mockGetLocationServices.getAdditionalIdentifiers', () => {
            component.initializeDefaultModel();
            expect(
                mockGetLocationServices.getAdditionalIdentifiers
            ).toHaveBeenCalled();
        });

        it('should mockGetLocationServices.getAdditionalIdentifiers', () => {
            component.initializeDefaultModel();
            mockGetLocationServices.getAdditionalIdentifiers();
            expect(component.selectedLocation.AdditionalIdentifiers.length).toEqual(
                0
            );
        });
    });

    describe('bindData function -> ', () => {
        it('should createForm', () => {
            component.createForm = jasmine.createSpy();
            component.bindData();
            expect(component.createForm).toHaveBeenCalled();
        });
    });

    describe('saveFunc function -> ', () => {
        it('should validateForm', () => {
            component.validateForm = jasmine.createSpy();
            component.saveFunc();
            expect(component.validateForm).toHaveBeenCalled();
        });

        it('should setAccountTokenOnSave', () => {
            component.setAccountTokenOnSave = jasmine.createSpy();
            component.saveFunc();
            expect(component.setAccountTokenOnSave).toHaveBeenCalled();
        });

    it('should disableAccountTokenInputOnSave', () => {
      component.disableAccountTokenInputOnSave = jasmine.createSpy();
      component.saveFunc();
      expect(component.disableAccountTokenInputOnSave).toHaveBeenCalled();
    });

    it('mockGetLocationServices.IsNameUnique', () => {
      component.validateForm = jasmine.createSpy();
      component.selectedLocation = locationsList.Value[0];
      component.formIsValid = true;
      component.saveFunc();
      expect(mockGetLocationServices.IsNameUnique).toHaveBeenCalled();
    });

        it('should savingLocation as false', () => {
            component.validateForm = jasmine.createSpy();
            component.selectedLocation = locationsList.Value[0];
            component.formIsValid = false;
            component.saveFunc();
            expect(component.savingLocation).toEqual(false);
            expect(component.locationChanges).toEqual(true);
        });

        it('should set credit card integration properties on POST request object when IsPaymentGatewayEnabled is false', () => {
            let event = {
                currentTarget: {
                    checked: false,
                },
            };
            component.locationAddUpdateSuccess = jasmine.createSpy();
            component.paymentGatewayChanged(event);
            component.saveFunc();
            component.hasCreateAccess = true;
            component.saveLocationAfterUniqueChecks();

            expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
                null
            );
            expect(component.frmLocationCrud.controls.MerchantId.disabled).toEqual(
                true
            );
            expect(
                component.frmLocationCrud.controls.PaymentProviderAccountCredential
                    .disabled
            ).toEqual(true);
            expect(mockGetLocationServices.save).toHaveBeenCalledWith(
                jasmine.objectContaining({
                    PaymentProvider: null,
                    EnableCreditDebitCard: false,
                    MerchantId: null,
                })
            );
        });

        it('should set credit card integration properties on POST request object when IsPaymentGatewayEnabled is true and OpenEdge is selected', () => {
            let event = {
                currentTarget: {
                    checked: true,
                },
            };
            component.locationAddUpdateSuccess = jasmine.createSpy();
            component.paymentGatewayChanged(event);
            component.frmLocationCrud.controls.MerchantId.setValue(123);
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.OpenEdge
            );
            component.saveFunc();
            component.hasCreateAccess = true;
            component.saveLocationAfterUniqueChecks();

      expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
        PaymentProvider.OpenEdge
      );
      expect(component.frmLocationCrud.controls.MerchantId.disabled).toEqual(
        false
      );
      expect(
        component.frmLocationCrud.controls.PaymentProviderAccountCredential
          .disabled
      ).toEqual(true);
      expect(mockGetLocationServices.save).toHaveBeenCalledWith(
        jasmine.objectContaining({
          PaymentProvider: 0,
          EnableCreditDebitCard: true,
          MerchantId: 123,
          PaymentProviderAccountCredential: null,
        })
      );
    });

        it('should set credit card integration properties on POST request object when IsPaymentGatewayEnabled is true and GPI is selected', () => {
            let event = {
                currentTarget: {
                    checked: true,
                },
            };
            component.locationAddUpdateSuccess = jasmine.createSpy();
            component.paymentGatewayChanged(event);
            component.frmLocationCrud.controls.PaymentProviderAccountCredential.setValue(
                123
            );
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );
            component.saveFunc();
            component.hasCreateAccess = true;
            component.saveLocationAfterUniqueChecks();

      expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
        PaymentProvider.TransactionsUI
      );
      expect(component.frmLocationCrud.controls.MerchantId.disabled).toEqual(
        true
      );
      expect(
        component.frmLocationCrud.controls.PaymentProviderAccountCredential
          .disabled
      ).toEqual(false);
      expect(mockGetLocationServices.save).toHaveBeenCalledWith(
        jasmine.objectContaining({
          PaymentProvider: 1,
          EnableCreditDebitCard: true,
          MerchantId: null,
          PaymentProviderAccountCredential: 123,
        })
      );
    });

        it('should set credit card integration properties on PUT request object when IsPaymentGatewayEnabled is false', () => {
            let event = {
                currentTarget: {
                    checked: false,
                },
            };
            component.locationAddUpdateSuccess = jasmine.createSpy();
            component.paymentGatewayChanged(event);
            component.saveFunc();
            component.editMode = true;
            component.hasEditAccess = true;
            component.selectedLocation.LocationId = 1;
            component.saveLocationAfterUniqueChecks();

            expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
                null
            );
            expect(component.frmLocationCrud.controls.MerchantId.disabled).toEqual(
                true
            );
            expect(
                component.frmLocationCrud.controls.PaymentProviderAccountCredential
                    .disabled
            ).toEqual(true);
            expect(mockGetLocationServices.updateFromEditLocation).toHaveBeenCalledWith(
                jasmine.objectContaining({enterpriseId: 975}),
                jasmine.objectContaining({
                    PaymentProvider: null,
                    EnableCreditDebitCard: false,
                    MerchantId: null,
                    PaymentProviderAccountCredential: null,
                })
            );
        });

        it('should set credit card integration properties on PUT request object when IsPaymentGatewayEnabled is true and OpenEdge is selected', () => {
            let event = {
                currentTarget: {
                    checked: true,
                },
            };
            component.locationAddUpdateSuccess = jasmine.createSpy();
            component.paymentGatewayChanged(event);
            component.frmLocationCrud.controls.MerchantId.setValue(123);
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.OpenEdge
            );
            component.saveFunc();
            component.editMode = true;
            component.hasEditAccess = true;
            component.selectedLocation.LocationId = 1;
            component.saveLocationAfterUniqueChecks();

      expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
        PaymentProvider.OpenEdge
      );
      expect(component.frmLocationCrud.controls.MerchantId.disabled).toEqual(
        false
      );
      expect(
        component.frmLocationCrud.controls.PaymentProviderAccountCredential
          .disabled
      ).toEqual(true);
      expect(mockGetLocationServices.updateFromEditLocation).toHaveBeenCalledWith(
        jasmine.objectContaining({enterpriseId: 975}),
        jasmine.objectContaining({
          PaymentProvider: 0,
          EnableCreditDebitCard: true,
          MerchantId: 123,
          PaymentProviderAccountCredential: null,
        })
      );
    });

        it('should set credit card integration properties on PUT request object when IsPaymentGatewayEnabled is true and GPI is selected', () => {
            let event = {
                currentTarget: {
                    checked: true,
                },
            };
            component.locationAddUpdateSuccess = jasmine.createSpy();
            component.paymentGatewayChanged(event);
            component.frmLocationCrud.controls.PaymentProviderAccountCredential.setValue(
                123
            );
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );
            component.saveFunc();
            component.editMode = true;
            component.hasEditAccess = true;
            component.selectedLocation.LocationId = 1;
            component.saveLocationAfterUniqueChecks();

      expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
        PaymentProvider.TransactionsUI
      );
      expect(component.frmLocationCrud.controls.MerchantId.disabled).toEqual(
        true
      );
      expect(
        component.frmLocationCrud.controls.PaymentProviderAccountCredential
          .disabled
      ).toEqual(false);
      expect(mockGetLocationServices.updateFromEditLocation).toHaveBeenCalledWith(
        jasmine.objectContaining({enterpriseId: 975}),
        jasmine.objectContaining({
          PaymentProvider: 1,
          EnableCreditDebitCard: true,
          MerchantId: null,
          PaymentProviderAccountCredential: 123,
        })
      );
    });
  });

    describe('saveLocationAfterUniqueChecks function -> ', () => {
        it('should return false when isActiveLoc is false and defaultDate not defined ', () => {
            component.phoneNumberPlaceholder = '5551234567';
            component.phoneNumberPlaceholder = '5551234567';
            component.phoneNumberPlaceholder = '5551234567';
            component.taxIdPlaceholder = '123';
            component.editMode = true;
            component.hasEditAccess = true;
            component.selectedLocation = locationsList.Value[0];
            component.isActiveLoc = false;
            const res = component.saveLocationAfterUniqueChecks();
            expect(res).toEqual(false);
        });

        it('should call mockGetLocationServices.updateFromEditLocation, when edit mode', () => {
            component.clearCacheFactoryCache = jasmine.createSpy();
            component.locationAddUpdateSuccess = jasmine.createSpy();
            component.locationAddUpdateFailure = jasmine.createSpy();
            component.editMode = true;
            component.hasEditAccess = true;
            component.isActiveLoc = true;
            component.defaultDate = new Date();
            component.toUpdate = true;
            component.selectedLocation = locationsList.Value[0];
            component.saveLocationAfterUniqueChecks();
            expect(mockGetLocationServices.updateFromEditLocation).toHaveBeenCalled();
        });

        it('should call mockGetLocationServices.save, when add mode', () => {
            component.clearCacheFactoryCache = jasmine.createSpy();
            component.locationAddUpdateSuccess = jasmine.createSpy();
            component.locationAddUpdateFailure = jasmine.createSpy();
            component.selectedLocation = {...locationsList.Value[0]};
            component.selectedLocation.LocationId = null;
            component.editMode = false;
            component.hasCreateAccess = true;
            component.saveLocationAfterUniqueChecks();
            expect(mockGetLocationServices.save).toHaveBeenCalled();
        });

        it('should call component.locationAddUpdateSuccess', () => {
            component.clearCacheFactoryCache = jasmine.createSpy();
            component.locationAddUpdateSuccess = jasmine.createSpy();
            component.locationAddUpdateFailure = jasmine.createSpy();
            component.selectedLocation = {...locationsList.Value[0]};
            component.selectedLocation.LocationId = null;
            component.editMode = false;
            component.hasCreateAccess = true;
            component.saveLocationAfterUniqueChecks();
            mockGetLocationServices.save();
            expect(component.locationAddUpdateSuccess).toHaveBeenCalled();
        });
    });

    describe('clearCacheFactoryCache function -> ', () => {
        it('should call ClearCache', () => {
            mockCacheFactory.GetCache = jasmine.createSpy();
            component.clearCacheFactoryCache('');
            expect(mockCacheFactory.GetCache).toHaveBeenCalled();
        });
    });

    describe('cancelFunc  function -> ', () => {
        it('should set originalLocation as 0 and locationChange should true', () => {
            component.cancelConfirmed = jasmine.createSpy();
            component.selectedLocation = { FeeListId: 0 };
            component.originalLocation = null;
            component.cancelFunc();
            expect(component.locationChanges).toEqual(true);
        });

        it('should set originalLocation as 11', () => {
            component.cancelConfirmed = jasmine.createSpy();
            component.selectedLocation = { FeeListId: 0 };
            component.originalLocation = null;
            component.originalLocation = { AddressLine1: 'Test', FeeListId: 11 };
            component.cancelFunc();
            expect(component.originalLocation.FeeListId).toEqual(0);
        });
    });

    describe('confirmCancel function -> ', () => {
        it('should call selectedLocInit, cancelConfirmed ', () => {
            component.selectedLocInit = jasmine.createSpy();
            component.cancelConfirmed = jasmine.createSpy();
            component.confirmCancel();
            expect(component.selectedLocInit).toHaveBeenCalled();
            expect(component.cancelConfirmed).toHaveBeenCalled();
        });
    });

    describe('saveCheckForUniqueLocationNameSuccess function -> ', () => {
        it('should call locationNameIsUnique ', () => {
            let successResponse = { Value: true };
            component.selectedLocation = { NameAbbreviation: 'Abc' };
            component.saveCheckForUniqueLocationNameSuccess(successResponse);
            expect(component.locationNameIsUnique).toEqual(true);
        });
    });

    describe('saveCheckForUniqueDisplayNameSuccess function -> ', () => {
        it('should call the validateRxClinic', () => {
            const request = { Value: true };
            component.validateRxClinic = jasmine.createSpy();
            component.selectedLocation = locationsList.Value[0];
            component.saveCheckForUniqueDisplayNameSuccess(request);
            expect(component.displayNameIsUnique).toEqual(true);
            expect(component.validateRxClinic).toHaveBeenCalled();
        });

        it('should set displayNameIsUnique as false', () => {
            const request = { Value: false };
            component.selectedLocation = locationsList.Value[0];
            component.saveCheckForUniqueDisplayNameSuccess(request);
            expect(component.displayNameIsUnique).toEqual(false);
        });
    });

    describe('taxonomyIdBlur function -> ', () => {
        it('component.selectedLocation.IsPaymentGatewayEnabled ', () => {
            component.taxonomyCodesSpecialties = [
                { Category: '', TaxonomyCodeId: '123' },
            ];
            component.frmLocationCrud = new FormGroup({});
            component.frmLocationCrud.markAsDirty();
            component.taxonomyIdBlur('123');
            expect(component.selectedLocation.TaxonomyId).toEqual(null);
        });
    });

    describe('locationAddUpdateSuccess function -> ', () => {
        it('should editMode will false', () => {
            component.updateDataHasChangedFlag = jasmine.createSpy();
            component.locationWatch = jasmine.createSpy();
            component.saveSuccessful = jasmine.createSpy();
            component.setDefaultValues = jasmine.createSpy();
            component.setDisplayTimezone = jasmine.createSpy();
            component.selectedLocInit = jasmine.createSpy();
            component.changeLocationUrl = jasmine.createSpy();
            component.saveRxClinic = jasmine.createSpy();
            component.locationAddUpdateSuccess({ Value: { Rooms: mockRooms } }, '');
            expect(component.editMode).toEqual(false);
        });
    });

    describe('locationAddUpdateFailure  function -> ', () => {
        it('Should call toastrFactory.error', () => {
            component.locationAddUpdateFailure(mockError, '');
            expect(toastrFactory.error).toHaveBeenCalled();
            expect(component.savingLocation).toEqual(false);
        });
    });

    describe('changeMasterCard function -> ', () => {
        it('Should set selectedLocation.AcceptMasterCardOnEstatement as true', () => {
            const event = { target: { checked: true } };
            component.changeMasterCard(event);
            expect(component.selectedLocation.AcceptMasterCardOnEstatement).toEqual(
                true
            );
        });
    });

    describe('changeDiscoverCard function -> ', () => {
        it('Should set selectedLocation.AcceptDiscoverOnEstatement as true', () => {
            const event = { target: { checked: true } };
            component.changeDiscoverCard(event);
            expect(component.selectedLocation.AcceptDiscoverOnEstatement).toEqual(
                true
            );
        });
    });

    describe('changeVisaCard function -> ', () => {
        it('Should set selectedLocation.AcceptVisaOnEstatement as true', () => {
            const event = { target: { checked: true } };
            component.changeVisaCard(event);
            expect(component.selectedLocation.AcceptVisaOnEstatement).toEqual(true);
        });
    });

    describe('changeAmericanCard function -> ', () => {
        it('Should set selectedLocation.AcceptAmericanExpressOnEstatement as true', () => {
            const event = { target: { checked: true } };
            component.changeAmericanCard(event);
            expect(
                component.selectedLocation.AcceptAmericanExpressOnEstatement
            ).toEqual(true);
        });
    });

    describe('changeCvvCode function -> ', () => {
        it('Should set selectedLocation.IncludeCvvCodeOnEstatement  as true', () => {
            const event = { target: { checked: true } };
            component.changeCvvCode(event);
            expect(component.selectedLocation.IncludeCvvCodeOnEstatement).toEqual(
                true
            );
        });
    });

    describe('editFunc function -> ', () => {
        it('should call the editFunc', () => {
            component.selectedLocation = locationsList.Value[0];
            const spy = (component.bindData = jasmine.createSpy());
            const spy1 = (component.getRoomsByLocation = jasmine.createSpy());
            const spy2 = (component.getIdentifierByLocation = jasmine.createSpy());
            routeParams.locationId = 1;
            component.editFunc();
            expect(spy).toHaveBeenCalled();
            expect(spy1).toHaveBeenCalled();
            expect(spy2).toHaveBeenCalled();
        });
    });

    describe('validateForm function -> ', () => {
        it('Should call toastrFactory.error', () => {
            component.selectedLocation = { AddressLine1: 'Test', TimeZone: 'IST' };
            component.frmLocationCrud = mockFrmLocationCrud;
            component.validateForm();
            expect(component.originalLocation).not.toEqual(undefined);
        });
    });

    describe('authAccess function -> ', () => {
        it('Should call authViewAccess,authCreateAccess and authEditAccess', () => {
            component.authViewAccess = jasmine.createSpy();
            component.authCreateAccess = jasmine.createSpy();
            component.authEditAccess = jasmine.createSpy();
            component.hasViewAccess = false;

            component.authAccess();
            expect(component.authViewAccess).toHaveBeenCalled();
            expect(component.authCreateAccess).toHaveBeenCalled();
            expect(component.authEditAccess).toHaveBeenCalled();
        });
    });

    describe('authViewAccess function -> ', () => {
        it('should call the authViewAccess', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.returnValue(true);
            component.authViewAccess();
            expect(component.hasViewAccess).toEqual(true);
        });
    });

    describe('authCreateAccess function -> ', () => {
        it('should call the authViewAccess', () => {
            component.authCreateAccess();
            expect(component.hasCreateAccess).toEqual(true);
        });
    });

    describe('authEditAccess function -> ', () => {
        it('should call the authEditAccess', () => {
            component.authEditAccess();
            expect(component.hasEditAccess).toEqual(true);
        });
    });

    describe('confirmNoRxAccessOnSave function -> ', () => {
        it('should call the confirmNoRxAccessOnSave', () => {
            component.confirmNoRxAccessOnSave();
            expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
        });
    });

    describe('resumeSave function -> ', () => {
        it('should Call saveLocationAfterUniqueChecks', () => {
            component.saveLocationAfterUniqueChecks = jasmine.createSpy();
            component.resumeSave();
            expect(component.saveLocationAfterUniqueChecks).toHaveBeenCalled();
        });
    });

    describe('validateRxClinic function -> ', () => {
        it('should set addRxClinic as true, and should call saveLocationAfterUniqueChecks', () => {
            component.selectedLocation = {
                NameLine1: '123',
                City: 'NY',
                AddressLine1: '#234',
                State: 'LA',
                ZipCode: '1001',
                Fax: '3243244',
                PrimaryPhone: '23423423',
            };
            component.saveLocationAfterUniqueChecks = jasmine.createSpy();
            component.validateRxClinic();
            expect(component.saveLocationAfterUniqueChecks).toHaveBeenCalled();
            expect(component.addRxClinic).toEqual(true);
        });

        it('should set addRxClinic as false, and should call confirmNoRxAccessOnSave', () => {
            component.selectedLocation = { NameLine1: '123' };
            component.confirmNoRxAccessOnSave = jasmine.createSpy();
            component.validateRxClinic();
            expect(component.confirmNoRxAccessOnSave).toHaveBeenCalled();
            expect(component.addRxClinic).toEqual(false);
        });
    });

    describe('createRxLocation function -> ', () => {
        it('should return location data', () => {
            const res = component.createRxLocation(locationsList.Value[0]);
            expect(res.Name).toEqual('First Office');
        });
    });

    describe('saveRxClinic function -> ', () => {
        it('should call the saveRxClinic', () => {
            component.hasCreateAccess = true;
            component.addRxClinic = true;
            component.saveRxClinic(locationsList.Value[0]);
            expect(mockRxService.saveRxClinic).toHaveBeenCalled();
        });
    });

    describe('saveRxClinicSuccess function -> ', () => {
        it('should set invalidDataForRx false', () => {
            component.saveRxClinicSuccess();
            expect(component.invalidDataForRx).toEqual(false);
        });
    });

    describe('saveRxClinicFailed function -> ', () => {
        it('should set invalidDataForRx true', () => {
            component.saveRxClinicFailed();
            expect(component.invalidDataForRx).toEqual(true);
        });
    });

    describe('locationIdWatch function -> ', () => {
        it('Should set addRxClinic as true', () => {
            component.locationIdWatch();
            expect(component.invalidDataForRx).toEqual(false);
            expect(component.addRxClinic).toEqual(true);
        });
    });

    describe('locationWatch function -> ', () => {
        it('Should Call hasChanged', () => {
            const nv = { LocationId: 12 };
            component.hasChanged = jasmine.createSpy();
            component.cancelFunc = jasmine.createSpy();
            component.cancelConfirmed = jasmine.createSpy();
            component.getUsersByLocation = jasmine.createSpy();
            component.getRoomsByLocation = jasmine.createSpy();
            component.getIdentifierByLocation = jasmine.createSpy();
            component.setDefaultValues = jasmine.createSpy();
            component.selectedLocInit = jasmine.createSpy();
            component.setDisplayTimezone = jasmine.createSpy();
            component.locationWatch(nv);
            component.editMode = true;
            expect(component.hasChanged).toHaveBeenCalled();
        });
    });

    describe('isAnyCardTypeSelected function -> ', () => {
        it('Should return true', () => {
            const location = {
                LocationId: 12,
                AcceptMasterCardOnEstatement: true,
                AcceptDiscoverOnEstatement: true,
            };
            const res = component.isAnyCardTypeSelected(location);
            expect(res).toEqual(true);
        });
    });

    describe('ngOnDestroy function -> ', () => {
        it('should unsubscribe component.obs.unsubscribe', () => {
            let mockSubscription = {
                unsubscribe: jasmine.createSpy(),
            };
            component.obs = Object.assign(mockSubscription);
            component.ngOnDestroy();
            expect(component.obs.unsubscribe).toHaveBeenCalled();
        });
    });

    describe('setOldTaxRate ->', () => {
        it('should set old tax rate correctly', () => {
            const location = {
                ProviderTaxRate: 200,
                SalesAndUseTaxRate: 300,
            };
            component.setOldTaxRate(location);
            expect(component.selectedLocation.ProviderTaxRate).toEqual(2);
            expect(component.selectedLocation.SalesAndUseTaxRate).toEqual(3);
        });
    });

  describe('setDefaultPaymentProvider ->', () => {
    it('should return OpenEdge paymentProvider when selectedLocation.PaymentProvider is null', () => {
      component.selectedLocation.PaymentProvider = null;
      expect(component.setDefaultPaymentProvider()).toEqual(PaymentProvider.OpenEdge);
    });

    it('should return OpenEdge paymentProvider when selectedLocation.PaymentProvider is OpenEdge', () => {
      component.selectedLocation.PaymentProvider = PaymentProvider.OpenEdge;
      expect(component.setDefaultPaymentProvider()).toEqual(PaymentProvider.OpenEdge);
    });

    it('should return TransactionsUI paymentProvider when selectedLocation.PaymentProvider is TransactionsUI', () => {
      component.selectedLocation.PaymentProvider = PaymentProvider.TransactionsUI;
      expect(component.setDefaultPaymentProvider()).toEqual(PaymentProvider.TransactionsUI);
    });
  });

  describe('setVisibilityWhenPaymentProviderChanged ->', () => {
    it('should display OpenEdge Account Credentials by default when selectedLocationPaymentProvider is null', () => {
      component.frmLocationCrud.controls.PaymentProvider.setValue(null);

      component.setVisibilityWhenPaymentProviderChanged(
        component.frmLocationCrud.controls.PaymentProvider.value
      );
      expect(component.accountTokenInputHidden.OpenEdgeEnabled).toBeFalsy();
      expect(
        component.accountTokenInputHidden.PaymentIntegrationEnabled
      ).toBeTruthy();
      expect(component.frmLocationCrud.controls.MerchantId.valid).toBeFalsy();
      expect(
        component.frmLocationCrud.controls.PaymentProviderAccountCredential
          .disabled
      ).toBeTruthy();
    });

    it('should display OpenEdge Account Credentials when OpenEdge Payment Provider is selected', () => {
      component.frmLocationCrud.controls.PaymentProvider.setValue(
        PaymentProvider.OpenEdge
      );
      component.frmLocationCrud.controls.MerchantId.setValue('123456789');

      component.setVisibilityWhenPaymentProviderChanged(
        component.frmLocationCrud.controls.PaymentProvider.value
      );
      expect(component.accountTokenInputHidden.OpenEdgeEnabled).toBeFalsy();
      expect(
        component.accountTokenInputHidden.PaymentIntegrationEnabled
      ).toBeTruthy();
      expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
        PaymentProvider.OpenEdge
      );
      expect(component.frmLocationCrud.controls.MerchantId.value).toBe(
        '123456789'
      );
      expect(component.frmLocationCrud.controls.MerchantId.valid).toBeTruthy();
      expect(
        component.frmLocationCrud.controls.PaymentProviderAccountCredential
          .disabled
      ).toBeTruthy();
    });

        it('should display GPI Account Credentials when GPI Payment Provider is selected', () => {
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );
            component.frmLocationCrud.controls.PaymentProviderAccountCredential.setValue(
                '123456789'
            );

      component.setVisibilityWhenPaymentProviderChanged(
        component.frmLocationCrud.controls.PaymentProvider.value
      );
      expect(component.accountTokenInputHidden.OpenEdgeEnabled).toBeTruthy();
      expect(
        component.accountTokenInputHidden.PaymentIntegrationEnabled
      ).toBeFalsy();
      expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
        PaymentProvider.TransactionsUI
      );
      expect(
        component.frmLocationCrud.controls.PaymentProviderAccountCredential
          .value
      ).toBe('123456789');
      expect(
        component.frmLocationCrud.controls.PaymentProviderAccountCredential
          .valid
      ).toBeTruthy();
      expect(
        component.frmLocationCrud.controls.MerchantId.disabled
      ).toBeTruthy();
    });
  });

    describe('setAccountCredentialsOnSave ->', () => {
        it('should set merchantId to OpenEdge Account Credentials when OpenEdge Payment Provider is selected', () => {
            component.selectedLocation.MerchantId = null;
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.OpenEdge
            );
            component.frmLocationCrud.controls.MerchantId.setValue('123456789');

            component.setAccountTokenOnSave(
                component.frmLocationCrud.controls.PaymentProvider.value
            );
            expect(component.selectedLocation.MerchantId).toBe('123456789');
            expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
                PaymentProvider.OpenEdge
            );
            expect(
                component.selectedLocation.PaymentProviderAccountCredential
            ).toBeNull();
        });

        it('should set paymentProviderAccountCredential to GPI Account Credentials when GPI Payment Provider is selected', () => {
            component.selectedLocation.PaymentProviderAccountCredential = null;
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );
            component.frmLocationCrud.controls.EnableCreditDebitCard.setValue(
                true
             );
            component.frmLocationCrud.controls.PaymentProviderAccountCredential.setValue(
                '123456789'
            );

            component.setAccountTokenOnSave(
                component.frmLocationCrud.controls.PaymentProvider.value
            );
            expect(component.selectedLocation.PaymentProviderAccountCredential).toBe(
                '123456789'
            );
            expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
                PaymentProvider.TransactionsUI
            );
            expect(component.selectedLocation.MerchantId).toBeNull();
        });

        it('should set merchantId to null when GPI Payment Provider is selected', () => {
            component.selectedLocation.MerchantId = '987654321';
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );
            component.frmLocationCrud.controls.EnableCreditDebitCard.setValue(
                true
             );
            component.frmLocationCrud.controls.PaymentProviderAccountCredential.setValue(
                '123456789'
            );

            component.setAccountTokenOnSave(
                component.frmLocationCrud.controls.PaymentProvider.value
            );
            expect(component.selectedLocation.PaymentProviderAccountCredential).toBe(
                '123456789'
            );
            expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
                PaymentProvider.TransactionsUI
            );
            expect(component.selectedLocation.MerchantId).toBeNull();
        });

        it('should set paymentProviderAccountCredential to null when OpenEdge Payment Provider is selected', () => {
            component.selectedLocation.PaymentProviderAccountCredential = '987654321';
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.OpenEdge
            );
            component.frmLocationCrud.controls.MerchantId.setValue('123456789');

            component.setAccountTokenOnSave(
                component.frmLocationCrud.controls.PaymentProvider.value
            );
            expect(component.selectedLocation.MerchantId).toBe('123456789');
            expect(component.frmLocationCrud.controls.PaymentProvider.value).toEqual(
                PaymentProvider.OpenEdge
            );
            expect(
                component.selectedLocation.PaymentProviderAccountCredential
            ).toBeNull();
        });

        
        it('should set paymentProviderAccountCredential to null when Transaction UI Payment Provider is selected and Account credential value not changed and not revealed', () => {
            component.selectedLocation = locationsList.Value[0];
            component.editMode = true;
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );
            component.frmLocationCrud.controls.PaymentProviderAccountCredential.setValue(component.FAKE_MASK_ACCOUNT_CREDENTIALS);

            component.setAccountTokenOnSave(
                component.frmLocationCrud.controls.PaymentProvider.value
            );
            expect(
                component.selectedLocation.PaymentProviderAccountCredential
            ).toBeNull();
        });
        
        it('should set paymentProviderAccountCredential to null when Transaction UI Payment Provider is selected and Account credential value not changed manually after revealed it', () => {
            component.selectedLocation = locationsList.Value[0];
            component.editMode = true;
            component.createForm();
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );
            component.revealMask();
            component.setAccountTokenOnSave(
                component.frmLocationCrud.controls.PaymentProvider.value
            );
            expect(component.realAccountCredential).toBe('123')
            expect(component.frmLocationCrud.controls.PaymentProviderAccountCredential.value).toBe('123')
            expect(
                component.selectedLocation.PaymentProviderAccountCredential
            ).toBeNull();
        });

        it('should set paymentProviderAccountCredential to its control value when Transaction UI Payment Provider is selected and Account credential value changed', () => {
            component.selectedLocation = locationsList.Value[0];
            component.editMode = true;
            component.realAccountCredential ='1234';
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );
            component.frmLocationCrud.controls.EnableCreditDebitCard.setValue(
                true
             );
            
            component.frmLocationCrud.controls.PaymentProviderAccountCredential.setValue('12345');

            component.setAccountTokenOnSave(
                component.frmLocationCrud.controls.PaymentProvider.value
            );
            expect(
                component.selectedLocation.PaymentProviderAccountCredential
            ).toBe('12345');
        });

        it('should set paymentProviderAccountCredential to null when EnableCreditDebitCard is unchecked', () => {
            component.selectedLocation = locationsList.Value[0];
            component.editMode = true;
            component.createForm();
            component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );
            component.frmLocationCrud.controls.EnableCreditDebitCard.setValue(
                false
             );
            component.frmLocationCrud.controls.PaymentProviderAccountCredential.setValue('12345');
            component.setAccountTokenOnSave(
                component.frmLocationCrud.controls.PaymentProvider.value
            );

            expect(
                component.selectedLocation.PaymentProviderAccountCredential
            ).toBeNull();
        });

    });

  describe('disableAccountTokenInputOnSave ->', () => {
    it('should set OpenEdge and TransactionsUI inputs to disabled when isPaymentGateway is not enabled', () => {
      component.selectedLocation.IsPaymentGatewayEnabled = false;
      component.frmLocationCrud.controls.PaymentProvider.setValue(null);
      component.disableAccountTokenInputOnSave(
        component.frmLocationCrud.controls.PaymentProvider.value
      );

      expect(
        component.frmLocationCrud.controls.PaymentProviderAccountCredential
          .disabled
      ).toBeTruthy();
      expect(
        component.frmLocationCrud.controls.MerchantId.disabled
      ).toBeTruthy();
    });

    it('should set OpenEdge input to enabled and TransactionsUI input to disabled when isPaymentGateway is enabled and PaymentProvider is OpenEdge', () => {
      component.selectedLocation.IsPaymentGatewayEnabled = true;
      component.frmLocationCrud.controls.PaymentProvider.setValue(
        PaymentProvider.OpenEdge
      );
      component.disableAccountTokenInputOnSave(
        component.frmLocationCrud.controls.PaymentProvider.value
      );

      expect(
        component.frmLocationCrud.controls.PaymentProviderAccountCredential
          .disabled
      ).toBeTruthy();
      expect(
        component.frmLocationCrud.controls.MerchantId.disabled
      ).toBeFalsy();
    });

    it('should set OpenEdge input to disabled and TransactionsUI input to enabled when isPaymentGateway is enabled and PaymentProvider is TransactionsUI', () => {
      component.selectedLocation.IsPaymentGatewayEnabled = true;
      component.frmLocationCrud.controls.PaymentProvider.setValue(
        PaymentProvider.TransactionsUI
      );
      component.disableAccountTokenInputOnSave(
        component.frmLocationCrud.controls.PaymentProvider.value
      );

      expect(
        component.frmLocationCrud.controls.PaymentProviderAccountCredential
          .disabled
      ).toBeFalsy();
      expect(
        component.frmLocationCrud.controls.MerchantId.disabled
      ).toBeTruthy();
    });
  });

  describe('card Reader Section -> ', () => {
        it('should show card reader grid and Add card reader button ', () => {
      component.editMode = true;
      component.showPaymentProvider = true;
      component.frmLocationCrud.controls.EnableCreditDebitCard.patchValue(true);
      component.frmLocationCrud.controls.PaymentProvider.patchValue(
        PaymentProvider.TransactionsUI
      );
      fixture.detectChanges();
      let cardReaderSection = fixture.debugElement.query(
        By.css('.card-reader-section')
      );
      let btnAddReader = fixture.debugElement.query(By.css('#btnAddReader'));

            expect(cardReaderSection).not.toBeNull();
            expect(btnAddReader).not.toBeNull();
        });
        it('should hide card reader grid ', () => {
            component.editMode = true;
            component.showPaymentProvider = true;
            component.frmLocationCrud.controls.EnableCreditDebitCard.patchValue(true);
            component.frmLocationCrud.controls.PaymentProvider.patchValue(
                PaymentProvider.OpenEdge
            );
            fixture.detectChanges();
            let cardReaderSection = fixture.debugElement.query(
                By.css('.card-reader-section')
            );

            expect(cardReaderSection).toBeNull();
        });
        it('should show card reader grid and hide Add card reader button ', () => {
            component.editMode = false;
            component.showPaymentProvider = true;
            component.selectedLocation.IsPaymentGatewayEnabled = true;
            component.selectedLocation.PaymentProvider =
                PaymentProvider.TransactionsUI;
            fixture.detectChanges();
            let cardReaderSection = fixture.debugElement.query(
                By.css('.card-reader-section')
            );
            let btnAddReader = fixture.debugElement.query(By.css('#btnAddReader'));

            expect(cardReaderSection).not.toBeNull();
            expect(btnAddReader).toBeNull();
        });
        it('should call addCardReader function on Add card reader button click', () => {
            spyOn(component, 'addCardReader');
            component.editMode = true;
            component.showPaymentProvider = true;
            component.frmLocationCrud.controls.EnableCreditDebitCard.patchValue(true);
            component.frmLocationCrud.controls.PaymentProvider.patchValue(
                PaymentProvider.TransactionsUI
            );
            fixture.detectChanges();
            let btnAddReader = fixture.debugElement.query(By.css('#btnAddReader'));
            btnAddReader.triggerEventHandler('click', null);
            fixture.detectChanges();

            fixture.whenStable().then(() => {
                expect(component.addCardReader).not.toHaveBeenCalled();
            });
        });      
    });


    describe('cardReaderChange -> ', () => {
        beforeEach(()=>{
            component.cardReaderList = [   {
                DeviceFriendlyName: "Citi Group",
                PartnerDeviceId: '1',
                PaymentIntegrationDeviceId: 1,
                ObjectState: SaveStates.None
            },
            {
                DeviceFriendlyName: "Bank of America",
                PartnerDeviceId: '2',
                PaymentIntegrationDeviceId: 2,
                ObjectState: SaveStates.None
            },]
        })
    
        it('should add new card reader in list ', () => {         
           var addCardReader = {PaymentIntegrationDeviceId : null,DeviceFriendlyName:"American Express",PartnerDeviceId : '3',ObjectState :SaveStates.Add};
            component.cardReaderChange(addCardReader);
            expect(component.cardReaderList.length).toBe(3);          
         });

         it('should update edited card reader in list ', () => {         
            var updateCardReader ={PaymentIntegrationDeviceId : 2,DeviceFriendlyName:"Wells Fargo",PartnerDeviceId : '2',ObjectState :SaveStates.Update,rowIndex:1}
             component.cardReaderChange(updateCardReader);
             fixture.detectChanges();
             expect(component.cardReaderList[1].DeviceFriendlyName).toBe("Wells Fargo");          
          });

          it('should delete card reader in list ', () => {         
            var deleteCardReader ={PaymentIntegrationDeviceId : 1,DeviceFriendlyName:"Citi Group",PartnerDeviceId : '1',ObjectState :SaveStates.Delete,rowIndex:0}
             component.cardReaderChange(deleteCardReader);
             fixture.detectChanges();
             expect(component.cardReaderList[0].ObjectState).toBe(SaveStates.Delete);          
          });
       
    });

    describe('Account Credential Input behaviour',()=>{
       it('On edit Location Account Credentials input type should be password and fake value when Payment Provider value is Global Payment Intergarted',()=>{
        const FAKE_MASK_ACCOUNT_CREDENTIALS = "zzzzzzzzzz";
        component.selectedLocation = locationsList.Value[0];
        component.showPaymentProvider = true;
        component.revealMaskAccountCredentials = false;
        component.editMode = true;
        component.hasEditAccess = true;
        component.createForm();
        fixture.detectChanges();
    
        const inputPaymentProviderAccountCredential = fixture.debugElement.query(By.css('#inpPaymentProviderAccountCredential'));
        const inputElement = inputPaymentProviderAccountCredential.nativeElement;
        

        expect(inputElement.type).toBe('password');
        expect(inputElement.value).toBe(FAKE_MASK_ACCOUNT_CREDENTIALS);
        expect(inputElement.disabled).toBeTruthy();
       })

       it('On edit Location Account Credentials input type should be text when Payment Provider value is Open edge',()=>{
        component.selectedLocation = locationsList.Value[1];;
        component.showPaymentProvider = true;
        component.revealMaskAccountCredentials = false;
        component.editMode = true;
        component.hasEditAccess = true;
        component.createForm();
    
        // Set initial fake mask value
        fixture.detectChanges();
    
        const inputPaymentProviderAccountCredential = fixture.debugElement.query(By.css('#inpMerchantId'));
        const inputElement = inputPaymentProviderAccountCredential.nativeElement;
        
        expect(inputElement.type).toBe('text');
        expect(inputElement.value).toBe('123');
        expect(inputElement.disable).toBeFalsy();
       })

       it('On Add Location Account Credentials input type should be text when Payment Provider value is Global Payment Intergarted',()=>{
        component.selectedLocation = null;
        component.showPaymentProvider = true;
        component.revealMaskAccountCredentials = true;
        component.editMode = true;
        component.hasEditAccess = true;
        component.createForm();
        component.frmLocationCrud.controls['EnableCreditDebitCard'].setValue(true);
        component.frmLocationCrud.controls['PaymentProvider'].setValue(PaymentProvider.TransactionsUI);
        component.setVisibilityWhenPaymentProviderChanged(
            component.frmLocationCrud.controls.PaymentProvider.value
          );
        fixture.detectChanges();
    
        const inputPaymentProviderAccountCredential = fixture.debugElement.query(By.css('#inpPaymentProviderAccountCredential'));
        const inputElement = inputPaymentProviderAccountCredential.nativeElement;
        

        expect(inputElement.type).toBe('text');
        expect(inputElement.value).toBe('');
        expect(inputElement.disabled).toBeFalsy();
       })
      
       it('On Add Location Account Credentials input type should be text when Payment Provider value is Open edge',()=>{
        component.selectedLocation = null;
        component.showPaymentProvider = true;
        component.revealMaskAccountCredentials = false;
        component.editMode = true;
        component.hasEditAccess = true;
        component.createForm();
        component.frmLocationCrud.controls['PaymentProvider'].setValue(PaymentProvider.OpenEdge);
        component.setVisibilityWhenPaymentProviderChanged(
            component.frmLocationCrud.controls.PaymentProvider.value
          );
        fixture.detectChanges();
    
        const inputPaymentProviderAccountCredential = fixture.debugElement.query(By.css('#inpMerchantId'));
        const inputElement = inputPaymentProviderAccountCredential.nativeElement;
        

        expect(inputElement.type).toBe('text');
        expect(inputElement.value).toBe('');
        expect(inputElement.disabled).toBeFalsy();
       })

    });

    describe('revealMask function',()=>{
        beforeEach(()=>{
            mockGetLocationServices.getMerchantRegistrationAsync.calls.reset();
        })
        it('should call revealMask function and update the input value with Actual Account Credentials',() => {
            component.selectedLocation = locationsList.Value[0];
            component.showPaymentProvider = true;
            component.editMode = true;
            component.createForm();
            fixture.detectChanges();
        
            const inputPaymentProviderAccountCredential = fixture.debugElement.query(By.css('#inpPaymentProviderAccountCredential'));
            const inputElement = inputPaymentProviderAccountCredential.nativeElement;
            spyOn(component, 'revealMask').and.callThrough(); // Spy on the actual revealMask function to allow it to be called
            
            // Simulate button click to reveal mask
            const btnRevealMask = fixture.debugElement.query(By.css('#btnRevealMask')).nativeElement;          
            btnRevealMask.click();

             fixture.detectChanges(); 
             expect(inputElement.type).toBe('text'); 
             expect(inputElement.value).toBe('123'); 
             expect(btnRevealMask).toBeTruthy(); 
             expect(component.revealMask).toHaveBeenCalled();
        
        });
   
   
        it('should call getMerchantRegistrationAsync api one time from revealMask function after clicking masked button multiple times',() => {
            component.selectedLocation = locationsList.Value[0];
            component.showPaymentProvider = true;
            component.editMode = true;
            component.createForm();
            fixture.detectChanges(); 

            const inputPaymentProviderAccountCredential = fixture.debugElement.query(By.css('#inpPaymentProviderAccountCredential'));
            const inputElement = inputPaymentProviderAccountCredential.nativeElement;
            const btnRevealMask = fixture.debugElement.query(By.css('#btnRevealMask')).nativeElement;          
            btnRevealMask.click();
            btnRevealMask.click();
             expect(inputElement.value).toBe('123'); 
             expect(mockGetLocationServices.getMerchantRegistrationAsync).toHaveBeenCalledTimes(1);
           
        });
    });

    describe('updatePaymentProviderAccountCredentialDisableState function',()=>{

       it('should Account Credentials input enabled when IsPaymentGatewayEnabled and revealMaskAccountCredentials is true ',() => {
            component.selectedLocation.IsPaymentGatewayEnabled = true;
            component.hasEditAccess=true;
            component.showPaymentProvider = true;
            component.editMode = true;
            component.revealMaskAccountCredentials = true;
            component.frmLocationCrud.controls['PaymentProvider'].setValue(PaymentProvider.TransactionsUI);
           
            component.updatePaymentProviderAccountCredentialDisableState();

            fixture.detectChanges();
            expect(component.frmLocationCrud.controls['PaymentProviderAccountCredential'].enabled).toBeTruthy();
        
        });

        it('should PaymentProviderAccountCredential disabled when IsPaymentGatewayEnabled is false ',() => {
            component.selectedLocation.IsPaymentGatewayEnabled = false;
            component.showPaymentProvider = true;
            component.editMode = true;
            component.revealMaskAccountCredentials = true;
   
            fixture.detectChanges();

            expect(component.frmLocationCrud.controls['PaymentProviderAccountCredential'].enabled).toBeFalsy();       
        });

        it('should PaymentProviderAccountCredential disabled when revealMaskAccountCredentialsd is false ',() => {
            component.selectedLocation.IsPaymentGatewayEnabled =  true;
            component.showPaymentProvider = true;
            component.editMode = true;
            component.revealMaskAccountCredentials = false;
   
            fixture.detectChanges();

            expect(component.frmLocationCrud.controls['PaymentProviderAccountCredential'].enabled).toBeFalsy();       
        });
   
    });


    describe('updateValueforGPIWarningModal -> ', () => {
        it('should call updateValueforGPIWarningModal with disablePaymentProvider when user confirms', async () => {
            component.selectedLocation = locationsList.Value[0];
            modalFactory.ConfirmModal.and.returnValue(Promise.resolve()); // Simulate user clicking 'Ok'
            spyOn(component, 'updateValueforGPIWarningModal').and.callThrough();
            component.warningGPIPaymentProviderChange(true);
        
            expect(component.updateValueforGPIWarningModal).toHaveBeenCalledWith(true);
            expect(component.frmLocationCrud.controls['PaymentProvider'].disabled).toBeTruthy();
            expect(component.frmLocationCrud.controls['EnableCreditDebitCard'].value).toBeFalsy();
            expect(component.frmLocationCrud.controls['MerchantId'].disabled).toBeTruthy();
            expect(component.frmLocationCrud.controls['PaymentProviderAccountCredential'].disabled).toBeTruthy();
        });

        it('should call closeGPIWarningModals when user cancels', async () => {
            component.selectedLocation = locationsList.Value[0];
            modalFactory.ConfirmModal.and.returnValue(Promise.reject());
            spyOn(component, 'closeGPIWarningModals').and.callThrough();
            await component.warningGPIPaymentProviderChange(true);
        
            expect(component.closeGPIWarningModals).toHaveBeenCalled();
            expect(component.frmLocationCrud.controls['PaymentProvider'].value).toBe(component.selectedLocation.PaymentProvider);
            expect(component.accountTokenInputHidden.OpenEdgeEnabled).toBeTruthy();
            expect(component.accountTokenInputHidden.PaymentIntegrationEnabled).toBeFalsy();
            expect(component.frmLocationCrud.controls['EnableCreditDebitCard'].value).toBeTruthy();
            expect(component.frmLocationCrud.controls['PaymentProvider'].disabled).toBeFalsy();
        });
    });


    describe('showCardReaders -> ', () => {
        it('show card readers in location landing page when showPaymentProvider feature flag, IsPaymentGatewayEnabled true and PaymentProvider is TransactionUI ',()=>{
          component.showPaymentProvider = true;
          component.selectedLocation.IsPaymentGatewayEnabled  = true;
          component.selectedLocation.PaymentProvider =PaymentProvider.TransactionsUI;

          expect(component.showCardReaders()).toBeTruthy();
        })
        it('Hide card readers in location landing page when feature flag when showPaymentProvider feature flag is false ',()=>{
            component.showPaymentProvider = false;
            component.selectedLocation.IsPaymentGatewayEnabled  = true;
            component.selectedLocation.PaymentProvider =PaymentProvider.TransactionsUI;
  
            expect(component.showCardReaders()).toBeFalsy();
        })
        it('Hide card readers in location landing page when selected location IsPaymentGatewayEnabled is false ',()=>{
            component.showPaymentProvider = true;
            component.selectedLocation.IsPaymentGatewayEnabled  = false;
            component.selectedLocation.PaymentProvider =PaymentProvider.TransactionsUI;
  
            expect(component.showCardReaders()).toBeFalsy();
        })
        it('Hide card readers in location landing page when selected location PaymentProvider is not TransactionUI ',()=>{
            component.showPaymentProvider = true;
            component.selectedLocation.IsPaymentGatewayEnabled  = true;
            component.selectedLocation.PaymentProvider =PaymentProvider.OpenEdge;
  
            expect(component.showCardReaders()).toBeFalsy();
        })
        it('show card readers in location edit when showPaymentProvider feature flag, EnableCreditDebitCard formcontrol value is true and PaymentProvider formcontrol value is TransactionUI ',()=>{
            component.editMode = true;
            component.showPaymentProvider = true;
            component.frmLocationCrud.controls.EnableCreditDebitCard.setValue(
                true
             );
             component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );  
            expect(component.showCardReaders()).toBeTruthy();
          })
          it('hide card readers in location edit when showPaymentProvider feature flag is false',()=>{
            component.editMode = true;
            component.showPaymentProvider = false;
            component.frmLocationCrud.controls.EnableCreditDebitCard.setValue(
                true
             );
             component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );  
            expect(component.showCardReaders()).toBeFalsy();
          })
          it('hide card readers in location edit when EnableCreditDebitCard formcontrol value is false',()=>{
            component.editMode = true;
            component.showPaymentProvider = true;
            component.frmLocationCrud.controls.EnableCreditDebitCard.setValue(
                false
             );
             component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.TransactionsUI
            );  
            expect(component.showCardReaders()).toBeFalsy();
          })

          it('hide card readers in location edit when PaymentProvider formcontrol value is not TransactionUI',()=>{
            component.editMode = true;
            component.showPaymentProvider = true;
            component.frmLocationCrud.controls.EnableCreditDebitCard.setValue(
                true
             );
             component.frmLocationCrud.controls.PaymentProvider.setValue(
                PaymentProvider.OpenEdge
            );  
            expect(component.showCardReaders()).toBeFalsy();
          })

    });
  
    describe('disable GPI',()=>{
     it('when EnableCreditDebitCard unchecked deletes all Card reader with Account credentials on save', ()=>{
            component.editMode = true;
            component.selectedLocation= {
                PaymentProvider :PaymentProvider.TransactionsUI,
                IsPaymentGatewayEnabled:true ,
                PaymentProviderAccountCredential:'zzzzzzzzzz',
                CardReaders :[   {
                    PaymentIntegrationDeviceId:1,
                    PartnerDeviceId: 'item 3',
                    DeviceFriendlyName: 'Display Name 3',
                    ObjectState:null
                  },
                  {
                    PaymentIntegrationDeviceId:2,
                    PartnerDeviceId: 'item 2',
                    DeviceFriendlyName: 'Display Name 2',
                    ObjectState:null
                  }]
            }       
            component.showPaymentProvider = true;
            component.createForm();
            component.frmLocationCrud.controls.EnableCreditDebitCard.setValue(
                false
             );
           component.saveFunc();
           fixture.detectChanges();
           expect(component.selectedLocation.CardReaders[0].ObjectState).toBe(SaveStates.Delete)
           expect(component.selectedLocation.CardReaders[1].ObjectState).toBe(SaveStates.Delete)
           expect(component.selectedLocation.PaymentProviderAccountCredential).toBe(null);
           expect(component.selectedLocation.PaymentProvider).toBe(null);
     });

     it('when PaymentProvider changed to Open edge deletes all Card readers with Account credentials on save', ()=>{
        component.editMode = true;
        component.selectedLocation= {
            PaymentProvider :PaymentProvider.TransactionsUI,
            IsPaymentGatewayEnabled:true ,
            PaymentProviderAccountCredential:'zzzzzzzzzz',
            CardReaders :[   {
                PaymentIntegrationDeviceId:1,
                PartnerDeviceId: 'item 3',
                DeviceFriendlyName: 'Display Name 3',
                ObjectState:null
              },
              {
                PaymentIntegrationDeviceId:2,
                PartnerDeviceId: 'item 2',
                DeviceFriendlyName: 'Display Name 2',
                ObjectState:null
              }]
        }       
        component.showPaymentProvider = true;
        component.createForm();
        component.frmLocationCrud.controls.EnableCreditDebitCard.setValue(
            true
         );
         component.frmLocationCrud.controls.PaymentProvider.setValue(
            PaymentProvider.OpenEdge
        ); 
        component.frmLocationCrud.controls.PaymentProviderAccountCredential.setValue('123')
       component.saveFunc();
       fixture.detectChanges();
       expect(component.selectedLocation.CardReaders[0].ObjectState).toBe(SaveStates.Delete)
       expect(component.selectedLocation.CardReaders[1].ObjectState).toBe(SaveStates.Delete)
       expect(component.selectedLocation.PaymentProviderAccountCredential).toBe(null);
       expect(component.selectedLocation.PaymentProvider).toBe(PaymentProvider.OpenEdge);
     });

    })
});
