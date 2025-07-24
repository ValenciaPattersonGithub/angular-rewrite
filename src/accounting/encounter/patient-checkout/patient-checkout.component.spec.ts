import { PatientCheckoutComponent } from './patient-checkout.component';
import { TranslateService } from '@ngx-translate/core';
import { EncounterService } from '../models/encounter-service.model';
import { AuthAccess } from 'src/@shared/models/auth-access.model';
import { Component, Input } from '@angular/core';
import { BestPracticePatientNamePipe } from 'src/@shared/pipes/best-practice/best-practice-patient-name.pipe';
import { CreditTransaction, ServiceTransactionDto } from '../models/patient-encounter.model';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import cloneDeep from 'lodash/cloneDeep';
import { TransactionTypes } from 'src/@shared/models/transaction-enum';
import { CurrencyPipe } from '@angular/common';
import { WaitOverlayService } from 'src/@shared/components/wait-overlay/wait-overlay.service';
import { fakeAsync, tick } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { GatewayTransactionType } from 'src/@core/models/payment-gateway/transaction-type.enum';
import { PaymentProvider } from 'src/@shared/enum/accounting/payment-provider';


describe('PatientCheckoutComponent', () => {
    let component: PatientCheckoutComponent;
    let mockPatientCheckoutService;
    let mockTeamMemberLocationService;
    let mockCreditTransactionDto;
    let mockReturn;
    let mockAdjustmentTypesService;
    let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;
    let mockLocalizeService;

    // mock the currency Pipe
    let currencyPipe: CurrencyPipe;

    beforeEach(() => {
          currencyPipe = new CurrencyPipe('100');
    });

    // mock PatientSummaryCheckout
    @Component({
        // tslint:disable-next-line: component-selector
        selector: 'patient-summary-checkout',
        template: ''
    })
    class PatientSummaryCheckout {

    }

    const mockWaitOverlayService = jasmine.createSpyObj<WaitOverlayService>('mockWaitOverlayService', ['open']);

    // mock PatientCheckoutPayments
    @Component({
        // tslint:disable-next-line: component-selector
        selector: 'patient-checkout-payments',
        template: ''
    })
    class MockPatientCheckoutPayments {
        @Input() paymentTypes: any[];
        @Input() creditTransactions: any[];
        @Input() creditTransactionDto: any;
        @Input() negativeAdjustmentTypes: any;
        @Input() dataForUnappliedTransactions: any;
    }
    let result;
    const mockCurrentLocation = { id: 12 };
    
    const mockConfirmationModalService = jasmine.createSpyObj<ConfirmationModalService>('mockConfirmationModalService', ['open']);

    const mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);

    const mockPaymentGatewayService = {
        createCreditForEncounter: jasmine.createSpy().and.callFake((array) => {
            return {
                then(callback) {
                    callback(array);
                }
            };
        }),
        createDebitForEncounter: jasmine.createSpy().and.callFake((array) => {
            return {
                then(callback) {
                    callback(array);
                }
            };
        }),
        encounterDebitCardReturn: jasmine.createSpy().and.callFake((array) => {
            return {
                then(callback) {
                    callback(array);
                }
            };
        }),
    }

    sanitizerSpy = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    mockLocalizeService = {
        getLocalizedString: () => 'translated text'
    };

    const mockConfirmationModalSubscription = {
        subscribe: jasmine.createSpy(),
        unsubscribe: jasmine.createSpy(),
        _subscriptions: jasmine.createSpy(),
        _parentOrParents: jasmine.createSpy(),
        closed: jasmine.createSpy(),
    };

    const mockUibModal: any = {
        open: jasmine.createSpy()
    };
    const retValue = { $promise: { then: jasmine.createSpy() } };


    let mockReturnData = [{}, {}];
    const mockLocationServices = {
        get: jasmine.createSpy().and.callFake(() => retValue)
    };

    const mockFinancialService = {
        RecalculateInsuranceWithCascadingEstimates: jasmine.createSpy().and.callFake((array) => {
            return {
                then(callback) {
                    callback(array);
                }
            };
        })
    };

    const mockLocationService = {
        getCurrentLocation: jasmine.createSpy().and.callFake(() => mockCurrentLocation)
    };

    const mockPriorAdjustments = [
        { Code: null, DateEntered: '2020-08-5 18:54:48.5599445', CompleteDescription: 'Positive Adjustment Affects Production', ProviderUserId: '1234', Balance: 100, AccountMemberId: '1235' },
        { Code: null, DateEntered: '2020-08-6 18:54:48.5599445', CompleteDescription: 'Positive Adjustment Affects Production', ProviderUserId: '1234', Balance: 300, AccountMemberId: '1234' },
        { Code: null, DateEntered: '2020-08-8 18:54:48.5599445', CompleteDescription: 'Positive Adjustment Affects Collection', ProviderUserId: '1234', Balance: 100, AccountMemberId: '1235' },
    ];


    const mockEncounter = {
        PatientName: 'Bob Frapples', EncounterId: 123456,
        Status: 2, AccountMemberId: '1234', ServiceTransactionDtos: [
            {
                DateEntered: '2020-08-10 18:54:48.5599445',
                LocationId: 12,
                Code: '',
                Description: 'D3221,	pulpal debridement, primary and permanent teeth',
                CompleteDescription: '',
                ProviderUserId: '9999',
                ProviderName: '',
                Fee: 300,
                DueNow: 300,
                Adjustment: 0,
                AccountMemberId: '1234',
                IsDeleted: false,
                EncounterId: 123456,
                DebitTransactionId: null,
                ServiceTransactionId: '1111',
                Discount: 0,
                Tax: 10.00,
                ServiceCodeId: '1234',
                TotalEstInsurance: 0,
                TotalAdjEstimate: 0,
                Balance: 300,
                Amount: 300,
                AdjustmentAmount: 0,
                isAdjustment: false,
                canCreateClaim: true,
                CreateClaim: true,
                PatientName: 'Bob Frapples',
                InsuranceEstimates: []
            },
            {
                DateEntered: '2020-08-04 18:54:48.5599445',
                LocationId: 12,
                Code: '',
                Description: 'D6750;	crown - porcelain fused to high noble metal',
                CompleteDescription: '',
                ProviderUserId: '9999',
                ProviderName: '',
                Fee: 200,
                DueNow: 200,
                Adjustment: 0,
                EncounterId: 123456,
                DebitTransactionId: null,
                AccountMemberId: '1234',
                IsDeleted: true,
                ServiceTransactionId: '1111',
                Discount: 0,
                Tax: 10.00,
                ServiceCodeId: '1236',
                TotalEstInsurance: 0,
                TotalAdjEstimate: 0,
                Balance: 200,
                Amount: 200,
                AdjustmentAmount: 0,
                isAdjustment: false,
                canCreateClaim: true,
                CreateClaim: false,
                PatientName: 'Bob Frapples',
                InsuranceEstimates: []
            }
        ]

    };

    const mockEncounters = [
        {
            PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', TotalAdjustedEstimate: 0, ServiceTransactionDtos: [
                {
                    DateEntered: '2020-08-10 18:54:48.5599445',
                    LocationId: 12,
                    Code: '',
                    Description: 'D3221,	pulpal debridement, primary and permanent teeth',
                    CompleteDescription: '',
                    ProviderUserId: '9999',
                    ProviderName: '',
                    Fee: 300,
                    DueNow: 300,
                    Adjustment: 0,
                    AccountMemberId: '1235',
                    IsDeleted: false,
                    EncounterId: '1236',
                    DebitTransactionId: null,
                    ServiceTransactionId: '1111',
                    Discount: 0,
                    Tax: 10.00,
                    ServiceCodeId: '1234',
                    TotalEstInsurance: 0,
                    TotalAdjEstimate: 0,
                    Balance: 300,
                    Amount: 300,
                    AdjustmentAmount: 0,
                    isAdjustment: false,
                    canCreateClaim: true,
                    CreateClaim: true,
                    PatientName: 'Charley Daniels',
                    InsuranceEstimates: []
                },
                {
                    DateEntered: '2020-08-04 18:54:48.5599445',
                    LocationId: 12,
                    Code: '',
                    Description: 'D6750;	crown - porcelain fused to high noble metal',
                    CompleteDescription: '',
                    ProviderUserId: '9999',
                    ProviderName: '',
                    Fee: 200,
                    DueNow: 200,
                    Adjustment: 0,
                    EncounterId: '1236',
                    DebitTransactionId: null,
                    AccountMemberId: '1235',
                    IsDeleted: true,
                    ServiceTransactionId: '1111',
                    Discount: 0,
                    Tax: 10.00,
                    ServiceCodeId: '1236',
                    TotalEstInsurance: 0,
                    TotalAdjEstimate: 0,
                    Balance: 200,
                    Amount: 200,
                    AdjustmentAmount: 0,
                    isAdjustment: false,
                    canCreateClaim: true,
                    CreateClaim: false,
                    PatientName: 'Charley Daniels',
                    InsuranceEstimates: []
                }
            ]

        },
        {
            PatientName: 'Hazel Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1234', TotalAdjustedEstimate: 0, ServiceTransactionDtos: [
                {
                    DateEntered: '2020-08-02 18:54:48.5599445',
                    LocationId: 12,
                    Code: '',
                    AccountMemberId: '1234',
                    Description: 'D3221,	pulpal debridement, primary and permanent teeth',
                    CompleteDescription: '',
                    ProviderUserId: '9999',
                    ProviderName: '',
                    Fee: 100,
                    DueNow: 100,
                    Adjustment: 0,
                    EncounterId: '1234',
                    DebitTransactionId: null,
                    ServiceTransactionId: '1111',
                    Discount: 0,
                    IsDeleted: false,
                    Tax: 10.00,
                    ServiceCodeId: '1234',
                    TotalEstInsurance: 0,
                    TotalAdjEstimate: 0,
                    Balance: 100,
                    Amount: 100,
                    AdjustmentAmount: 0,
                    isAdjustment: false,
                    PatientName: 'Hazel Daniels',
                    canCreateClaim: false,
                    CreateClaim: false,
                    InsuranceEstimates: []
                },
                {
                    DateEntered: '2020-08-16 18:54:48.5599445',
                    LocationId: 12,
                    AccountMemberId: '1234',
                    Code: '',
                    Description: 'D6750;	crown - porcelain fused to high noble metal',
                    CompleteDescription: '',
                    ProviderUserId: '9999',
                    ProviderName: '',
                    Fee: 200,
                    DueNow: 200,
                    Adjustment: 0,
                    EncounterId: '1234',
                    DebitTransactionId: null,
                    ServiceTransactionId: '1111',
                    Discount: 0,
                    Tax: 10.00,
                    IsDeleted: false,
                    ServiceCodeId: '1236',
                    TotalEstInsurance: 0,
                    TotalAdjEstimate: 0,
                    Balance: 200,
                    Amount: 200,
                    AdjustmentAmount: 0,
                    isAdjustment: false,
                    PatientName: 'Hazel Daniels',
                    canCreateClaim: true,
                    CreateClaim: true,
                    InsuranceEstimates: []
                }
            ]
        },
        {
            PatientName: 'Charley Daniels', EncounterId: 1236, Status: 1, AccountMemberId: '1235', TotalAdjustedEstimate: 0, ServiceTransactionDtos: [
                {
                    DateEntered: '2020-08-05 18:54:48.5599445',
                    LocationId: 12,
                    Code: '',
                    AccountMemberId: '1235',
                    Description: 'D3221,	pulpal debridement, primary and permanent teeth',
                    CompleteDescription: '',
                    ProviderUserId: '9999',
                    ProviderName: '',
                    Fee: 200,
                    DueNow: 200,
                    Adjustment: 0,
                    EncounterId: '1236',
                    DebitTransactionId: null,
                    ServiceTransactionId: '1111',
                    Discount: 0,
                    Tax: 10.00,
                    IsDeleted: false,
                    ServiceCodeId: '1234',
                    TotalEstInsurance: 0,
                    TotalAdjEstimate: 0,
                    Balance: 200,
                    Amount: 200,
                    AdjustmentAmount: 0,
                    isAdjustment: false,
                    canCreateClaim: true,
                    CreateClaim: true,
                    PatientName: 'Charley Daniels',
                    InsuranceEstimates: []
                },
                {
                    DateEntered: '2020-08-02 18:54:48.5599445',
                    LocationId: 12,
                    Code: '',
                    AccountMemberId: '1235',
                    Description: 'D6750;	crown - porcelain fused to high noble metal',
                    CompleteDescription: '',
                    ProviderUserId: '9999',
                    ProviderName: '',
                    Fee: 200,
                    DueNow: 200,
                    Adjustment: 0,
                    EncounterId: '1236',
                    DebitTransactionId: null,
                    ServiceTransactionId: '1111',
                    Discount: 0,
                    Tax: 10.00,
                    ServiceCodeId: '1236',
                    TotalEstInsurance: 0,
                    TotalAdjEstimate: 0,
                    IsDeleted: false,
                    Balance: 200,
                    Amount: 200,
                    AdjustmentAmount: 0,
                    isAdjustment: false,
                    canCreateClaim: true,
                    CreateClaim: true,
                    PatientName: 'Charley Daniels',
                    InsuranceEstimates: []
                }
            ]

        },
    ];

    const mockProviders = [
        {
            DateModified: '2018-10-01T15:17:15.7411065',
            FirstName: 'Ruby',
            LastName: 'Brown',
            SuffixName: null,
            ProfessionalDesignation: '',
            UserId: '1234',
            Locations: [{ LocationId: 12 }, { LocationId: 13 }]

        },
        {
            FirstName: 'Khloe',
            LastName: 'Dickson',
            SuffixName: null,
            ProfessionalDesignation: 'DMH',
            UserId: '1235',
            Locations: [{ LocationId: 12 }, { LocationId: 13 }]
        },
        {
            FirstName: 'Cody',
            LastName: 'Flores',
            SuffixName: null,
            ProfessionalDesignation: 'DMD',
            UserId: '1236',
            Locations: [{ LocationId: 12 }]
        },
        {
            FirstName: 'Molly',
            LastName: 'Franklin',
            SuffixName: null,
            ProfessionalDesignation: null,
            UserId: '1237',
        },];

    const mockReferenceDataService = {
        get: jasmine.createSpy(),
        getData: jasmine.createSpy(),
        setFeesByLocation: jasmine.createSpy(),
        entityNames: {
            serviceTypes: 'serviceTypes',
            serviceCodes: 'serviceCodes'
        }
    };

    const mockPatientOdontogramFactory = {
        TeethDefinitions: jasmine.createSpy().and.callFake((array) => {
            return {
                then(callback) {
                    callback(array);
                }
            };
        })
    };

    const mockTabLauncher = jasmine.createSpy();

    const mockSaveStates = {
        None: 'None',
        Add: 'Add',
        Update: 'Update',
        Delete: 'Delete',
        Failed: 'Failed'
    };   

    const mockModalFactory = {
        GetCheckoutModalData: jasmine.createSpy().and.callFake((array) => {
            return {
                then(callback) {
                    callback(array);
                }
            };
        })
    };

    const mockModalDataFactory = {
        GetCheckoutModalData: jasmine.createSpy().and.callFake((array) => {
            return {
                then(callback) {
                    callback(array);
                }
            };
        })
    };

    const mockStaticDataService: any = {
        TeethDefinitions: () => new Promise((resolve, reject) => {
        }),
        CdtCodeGroups: () => new Promise((resolve, reject) => {
        }),
    };

    beforeEach(() => {
        mockCreditTransactionDto = new CreditTransaction();
        mockCreditTransactionDto.AdjustmentTypeId = null;
        mockCreditTransactionDto.Amount = 0;
        mockCreditTransactionDto.AppliedAmount = 0;
        mockCreditTransactionDto.AssignedAdjustmentTypeId = 1;
        mockCreditTransactionDto.ClaimId = null;
        mockCreditTransactionDto.CreditTransactionId = '00000000-0000-0000-0000-000000000000';
        mockCreditTransactionDto.DateEntered = new Date();
        mockCreditTransactionDto.Description = null;
        mockCreditTransactionDto.EnteredByUserId = '00000000-0000-0000-0000-000000000000';
        mockCreditTransactionDto.OriginalPosition = 0;
        mockCreditTransactionDto.Note = '';
        mockCreditTransactionDto.PaymentTypeId = '';
        mockCreditTransactionDto.PaymentTypePromptValue = null;
        mockCreditTransactionDto.PromptTitle = null;
        mockCreditTransactionDto.TransactionTypeId = 2;
        mockCreditTransactionDto.ValidDate = true;
        mockCreditTransactionDto.CreditTransactionDetails = [];
        mockCreditTransactionDto.FeeScheduleAdjustmentForEncounterId = null;
        mockCreditTransactionDto.IsFeeScheduleWriteOff = false;
        mockCreditTransactionDto.CreditTransactionDetails = [];
        mockReturn = [{ ServiceTransactionId: '1999', Code: '1234' }, { ServiceTransactionId: '2999', Code: '1235' }];
        mockPatientCheckoutService = {
            getCheckoutTotals: jasmine.createSpy(),
            getUnappliedCreditTransactionDetailAmount: jasmine.createSpy(),
            getTotalUnappliedAmountFromCreditTransactions: jasmine.createSpy(),
            getUnappliedCreditTransactions: jasmine.createSpy(),
            isAnEmptyId: jasmine.createSpy(),
            isAnUnappliedCreditTransactionDetail: jasmine.createSpy(),
            checkForAffectedAreaChanges: jasmine.createSpy().and.callFake(() => mockReturn),
            initializeCreditTransaction: jasmine.createSpy().and.callFake(() => cloneDeep(mockCreditTransactionDto)),
            setCreditTransactionOriginalPosition: jasmine.createSpy().and.callFake(() => cloneDeep(mockCreditTransactionDto)),
            resetCurrentCreditTransaction: jasmine.createSpy().and.callFake(() => cloneDeep(mockCreditTransactionDto)),
            calculateServiceTransactionAmounts: jasmine.createSpy(),
        };

        mockTeamMemberLocationService = {
            getProvidersByUserLocationSetups: jasmine.createSpy().and.returnValue({})
        }
    })

    mockAdjustmentTypesService = {
        get: jasmine.createSpy().and.callFake((array) => {
            return {
                then(callback) {
                    callback(array);
                }
            };
        })
    };
    
    const mockCreditTransactionDtoDetails = {
        Value: [
            { Amount: 50 },]
    };

    let mockServiceEstimates = [[{},{},{}], [{},{}]]

    const mockPatientServices = {
        ServiceTransactions:{
            serviceEstimates: jasmine.createSpy().and.returnValue({
                $promise: { then() { return mockServiceEstimates; } }
            }),            
        },
        Encounter: {
            checkoutEncounters: jasmine.createSpy().and.callFake((array) => {
                return {
                    then(callback) {
                        callback(array);
                    }
                };
            }),
            getDebitTransactionsByAccountId: jasmine.createSpy().and.callFake((array) => {
                return {
                    then(callback) {
                        callback(array);
                    }
                };
            }),
        },
        CheckoutInfo: {
            getCheckoutInfo: jasmine.createSpy().and.callFake((array) => {
                return {
                    then(callback) {
                        callback(array);
                    }
                };
            })
        },
        CreditTransactions: {
            creditDistributionForSelectedServiceTransactions: jasmine.createSpy().and.returnValue({
                $promise: { then() { return mockCreditTransactionDtoDetails; } }
            }),
            create: jasmine.createSpy().and.returnValue({
                $promise: { then() { return mockCreditTransactionDtoDetails; } }
            }),
            markAccountPaymentAsDeleted: jasmine.createSpy().and.returnValue({
                $promise: { then() { return []; } }
            }),
        },
    };

    const mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error')
    };

    const patSecurityServiceMock = {
        generateMessage: jasmine.createSpy().and.returnValue(''),
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
    };

    const routeParams = {
        patientId: '4321',
        accountId: '1234',
        encounterId: '5678',
        PrevLocation: 'AccountSummary'
    };

    // for initial layout only
    const encounterServices = [];
    const encounterService = new EncounterService();
    encounterService.CreateClaim = true;
    encounterService.ServiceDate = new Date();
    encounterService.ServiceDescription = 'D2150 amalgam - two surfaces, primary or permanent';
    encounterService.ProviderUserName = 'Morrison, A.';
    encounterService.PatientBalance = 85.00;
    encounterService.AmountApplied = 0;
    encounterService.BalanceDue = 85.00;
    encounterServices.push(encounterService);


    encounterService.CreateClaim = true;
    encounterService.ServiceDate = new Date();
    encounterService.ServiceDescription = 'D2150 amalgam - two surfaces, primary or permanent';
    encounterService.ProviderUserName = 'Morrison, A.';
    encounterService.PatientBalance = 85.00;
    encounterService.AmountApplied = 0;
    encounterService.BalanceDue = 85.00;
    encounterServices.push(encounterService);


    encounterService.CreateClaim = true;
    encounterService.ServiceDate = new Date();
    encounterService.ServiceDescription = 'D2393 resin-based composite - three surfaces, posterior';
    encounterService.ProviderUserName = 'Morrison, A.';
    encounterService.PatientBalance = 55.00;
    encounterService.AmountApplied = 0;
    encounterService.BalanceDue = 55.00;
    encounterServices.push(encounterService);


    encounterService.CreateClaim = true;
    encounterService.ServiceDate = new Date();
    encounterService.ServiceDescription = '2394 resin-based composite - four or more surfaces, posterior';
    encounterService.ProviderUserName = 'Morrison, A.';
    encounterService.PatientBalance = 55.00;
    encounterService.AmountApplied = 0;
    encounterService.BalanceDue = 55.00;
    encounterServices.push(encounterService);



    beforeEach(() => {
        const mockBestPracticePatientNamePipe = new BestPracticePatientNamePipe();
        component = new PatientCheckoutComponent(
            mockTranslateService,
            mockWaitOverlayService,
            currencyPipe,
            mockPatientCheckoutService,
            routeParams,
            mockToastrFactory,
            patSecurityServiceMock,
            mockPatientServices,
            mockAdjustmentTypesService,
            mockStaticDataService,
            mockPatientOdontogramFactory,
            mockModalFactory,
            mockModalDataFactory,
            mockTeamMemberLocationService,
            mockReferenceDataService,
            mockLocationService,
            mockLocationServices,
            mockFinancialService,
            mockSaveStates,
            mockUibModal,
            mockTabLauncher,
            mockBestPracticePatientNamePipe,
            mockConfirmationModalService,
            mockPaymentGatewayService,
            sanitizerSpy,
            mockLocalizeService
        );
        component.patientInfo = {
            PersonAccount: { AccountId: '1234', PersonAccountMember: { AccountMemberId: '1234' } }
        };
        component.authAccess = new AuthAccess();
        component.authAccess.view = true;
    });

    it('should create component', () => {
        spyOn(component, 'getCheckoutInfo');
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
            spyOn(component, 'loadDependancies').and.callFake(() => { });
            spyOn(component, 'getPageNavigation').and.callFake(() => { });
            spyOn(component, 'getCheckoutInfo').and.callFake(() => { });
            component.patientId = '1234';
        });

        it('should call getPageNavigation ', () => {
            component.ngOnInit();
            expect(component.getPageNavigation).toHaveBeenCalled();
        });

        it('should call loadDependancies ', () => {
            component.ngOnInit();
            expect(component.getCheckoutInfo).toHaveBeenCalled();
        });

        it('should load patientId, accountId, and encounterId from route ', () => {
            component.ngOnInit();
            expect(component.patientId).toEqual('4321');
            expect(component.accountId).toEqual('1234');
            expect(component.encounterId).toEqual('5678');
        });

        it('should load fromLocation if route.PrevLocation has value', () => {
            routeParams.PrevLocation = 'AccountSummary';
            component.ngOnInit();
            expect(component.fromLocation).toEqual('AccountSummary');
        });

        it('should set default initial values', () => {
            component.ngOnInit();
            expect(component.showAppliedAmountError).toBe(false);
            expect(component.addCreditTransactionToList).toBe(false);
            expect(component.hasDistributionChanges).toBe(false);
            expect(component.checkoutIsInProgress).toBe(false);

            expect(component.disableSummary).toBe(true);
            expect(component.disableCreditDistribution).toBe(true);
            expect(component.loadingCheckout).toBe(true);
            expect(component.includePriorBalance).toBe(true);
        });
    });

    describe('getCheckoutInfo method', () => {
        const patientAccountId = '1234';
        const encounterId = '5678';
        beforeEach(() => {
            spyOn(component, 'getPageNavigation');
            spyOn(component, 'loadPatientEncounters');
        });

        it('should call patientServices.CheckoutInfo.getCheckoutInfo ', () => {
            component.authAccess.view = true;
            component.getCheckoutInfo(patientAccountId, encounterId);
            expect(mockPatientServices.CheckoutInfo.getCheckoutInfo).toHaveBeenCalled();
        });

        it('should call patientServices.Encounter.getDebitTransactionsByAccountId ', () => {
            component.authAccess.view = true;
            component.getCheckoutInfo(patientAccountId, encounterId);
            expect(mockPatientServices.Encounter.getDebitTransactionsByAccountId).toHaveBeenCalled();
        });
    });

    describe('loadPatientEncounters method', () => {
        const checkoutInfo = { EncounterDtoList: [] };
     
        beforeEach(() => {         
            checkoutInfo.EncounterDtoList = [
                {
                    displayDate: '2020-08-04 18:54:48.5599445',
                    EncounterId: 1,
                    TotalAdjustedEstimate: 0,
                    Status: 2,
                    AccountMemberId: '1234',
                    ServiceTransactionDtos: [
                        {
                            DateEntered: '2020-08-04 18:54:48.5599445',
                            LocationId: 12,
                            InsuranceEstimates: []
                        }
                    ]
                },
                {
                    displayDate: '2020-08-04 18:54:48.5599445',
                    EncounterId: 2,
                    TotalAdjustedEstimate: 0,
                    Status: 2,
                    AccountMemberId: '1234',
                    ServiceTransactionDtos: []
                }
            ];
            spyOn(component, 'getEncounterData');
        });
        

        it('should filter out corrupt encounters containing no services', () => {
            component.patientEncounters = [];
            component.loadPatientEncounters(checkoutInfo);
            expect(component.patientEncounters.length).toBe(1);
        });
    });

    describe('loadBenefitPlans method', () => {
        const patientPlans = [];
        let planObject = {};
        beforeEach(() => {
            planObject = {
                1234: [
                    { PatientId: '1234', BenefitPlanId: 5, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan1', CarrierName: 'Carrier1' } }, PatientBenefitPlanId: 10, Priority: 0 },
                    { PatientId: '1234', BenefitPlanId: 7, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan3', CarrierName: 'Carrier3' } }, PatientBenefitPlanId: 30, Priority: 1 },
                ],
                5678: [
                    { PatientId: '5678', BenefitPlanId: 6, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan2', CarrierName: 'Carrier2' } }, PatientBenefitPlanId: 20, Priority: 0 },
                ],
            };
            spyOn(component, 'loadPatientEncounters');
        });

        it('should not add plans if planObject is empty', () => {
            component.allMemberPlans = [];
            planObject = {};
            component.loadBenefitPlans(planObject);
            expect(component.allMemberPlans).toEqual([]);
        });

        it('should add plans to allMemberPlans if planObject is not empty', () => {
            component.allMemberPlans = [];
            component.loadBenefitPlans(planObject);
            expect(component.allMemberPlans.length).toEqual(3);
        });

        it('should add plans to allMemberPlans and sort by Priority', () => {
            component.allMemberPlans = [];
            component.loadBenefitPlans(planObject);
            expect(component.allMemberPlans[0].Priority).toBe(0);
            expect(component.allMemberPlans[1].Priority).toBe(1);
            expect(component.allMemberPlans[2].Priority).toBe(0);
        });
    });

    describe('getFeeScheduleAdjustments method', () => {
        const checkoutInfo = { EncounterDtoList: [] };
        beforeEach(() => {
            spyOn(component, 'addBenefitPlanData');
            checkoutInfo.EncounterDtoList = [
                {
                    EncounterId: '789', AccountMemberId: '1234', hasAdjustedEstimate: true,
                    benefitPlan: {
                        PatientId: '2345', BenefitPlanId: 5, PatientBenefitPlanId: 10, Priority: 0,
                        PolicyHolderBenefitPlanDto:
                            { BenefitPlanDto: { Name: 'Plan1', CarrierName: 'Carrier1', ApplyAdjustments: 1, FeesIns: 2 } }
                    },
                    ServiceTransactionDtos: [
                        {
                            EncounterId: '789',
                            ServiceTransactionId: '1111',
                            InsuranceEstimates: [{
                                AdjEst: 0
                            }]
                        },
                    ]
                }
            ];
        });

        it('should set encounter.hasAdjustedEstimate to true if any ServiceTransactionDto on encounter ' +
            'has InsuranceEstimates.AdjEst more than 0', () => {
                checkoutInfo.EncounterDtoList[0].ServiceTransactionDtos[0].InsuranceEstimates[0].AdjEst = 40;
                component.getFeeScheduleAdjustments(checkoutInfo);
                expect(checkoutInfo.EncounterDtoList[0].hasAdjustedEstimate).toBe(true);
            });

        it('should set hasFeeScheduleAdjustments to true for each checkoutInfo.EncounterDtoList if ' +
            'encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.ApplyAdjustments is 1 and ' +
            ' PolicyHolderBenefitPlanDto.BenefitPlanDto.FeesIns is 2' +
            'and EncounterDtoList.hasAdjustedEstimate is true ', () => {
                checkoutInfo.EncounterDtoList[0].ServiceTransactionDtos[0].InsuranceEstimates[0].AdjEst = 40;
                component.getFeeScheduleAdjustments(checkoutInfo);
                expect(checkoutInfo.EncounterDtoList[0].hasFeeScheduleAdjustments).toBe(true);
            });

        it('should set hasFeeScheduleAdjustments to false for each checkoutInfo.EncounterDtoList if ' +
            'encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.ApplyAdjustments is 1 and ' +
            ' PolicyHolderBenefitPlanDto.BenefitPlanDto.FeesIns is 2' +
            'and EncounterDtoList.hasAdjustedEstimate is false ', () => {
                checkoutInfo.EncounterDtoList[0].ServiceTransactionDtos[0].InsuranceEstimates[0].AdjEst = 0;
                component.getFeeScheduleAdjustments(checkoutInfo);
                expect(checkoutInfo.EncounterDtoList[0].hasFeeScheduleAdjustments).toBe(false);
            });

        it('should set hasFeeScheduleAdjustments to false for each checkoutInfo.EncounterDtoList if ' +
            'encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.ApplyAdjustments is 1 and ' +
            ' PolicyHolderBenefitPlanDto.BenefitPlanDto.FeesIns is not 2' +
            'and EncounterDtoList.hasAdjustedEstimate is true ', () => {
                checkoutInfo.EncounterDtoList[0].ServiceTransactionDtos[0].InsuranceEstimates[0].AdjEst = 40;
                checkoutInfo.EncounterDtoList[0].benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.FeesIns = 1;
                component.getFeeScheduleAdjustments(checkoutInfo);
                expect(checkoutInfo.EncounterDtoList[0].hasFeeScheduleAdjustments).toBe(false);
            });

        it('should set hasFeeScheduleAdjustments to false for each checkoutInfo.EncounterDtoList if ' +
            'encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.ApplyAdjustments is not 1', () => {
                checkoutInfo.EncounterDtoList[0].ServiceTransactionDtos[0].InsuranceEstimates[0].AdjEst = 0;
                checkoutInfo.EncounterDtoList[0].benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.ApplyAdjustments = null;
                component.getFeeScheduleAdjustments(checkoutInfo);
                expect(checkoutInfo.EncounterDtoList[0].hasFeeScheduleAdjustments).toBe(false);
            });

        it('should set hasFeeScheduleAdjustments to false for each checkoutInfo.EncounterDtoList if ' +
            'no benefitPlan on encounter', () => {
                checkoutInfo.EncounterDtoList[0].benefitPlan = null;
                component.getFeeScheduleAdjustments(checkoutInfo);
                expect(checkoutInfo.EncounterDtoList[0].hasFeeScheduleAdjustments).toBe(false);
                expect(component.loadingFeeScheduleAdjustments).toBe(false);
            });

    });

    describe('getEncounterBalanceDue method', () => {
        let encounter;
        beforeEach(() => {
            encounter = {
                PatientName: 'Bob Frapples', EncounterId: 123456, Status: 2, AccountMemberId: '1234',
                ServiceTransactionDtos: [
                    {
                        Fee: 160.00,
                        DueNow: 150.00,
                        Adjustment: 0,
                        ServiceTransactionId: '1111',
                        Discount: 0,
                        Tax: 10.00,
                        ServiceCodeId: '1234',
                        TotalEstInsurance: 0,
                        TotalAdjEstimate: 0,
                        Balance: 150.00,
                        Amount: 160.00,
                        AdjustmentAmount: 10,
                        InsuranceEstimates: []
                    },
                    {
                        Fee: 160.00,
                        DueNow: 150.00,
                        Adjustment: 0,
                        ServiceTransactionId: '1113',
                        Discount: 0,
                        Tax: 10.00,
                        ServiceCodeId: '1234',
                        TotalEstInsurance: 0,
                        TotalAdjEstimate: 0,
                        Balance: 150.00,
                        Amount: 160.00,
                        AdjustmentAmount: 10,
                        InsuranceEstimates: []
                    },
                ]
            };
        });

        // tslint:disable-next-line: max-line-length
        it('should call getEncounterBalanceDue to set encounter.BalanceDue based on sum of ' +
            'serviceTransactions DueNow ', () => {
                let balanceDue = 0;
                encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                    balanceDue += serviceTransaction.DueNow;
                });
                component.getEncounterBalanceDue(encounter);
                expect(encounter.BalanceDue).toBe(balanceDue.toFixed(2));
            });
    });


    describe('processRequiredPropertiesForServiceTransaction method', () => {
        let encounter = { benefitPlan: null, hasAdjustedEstimate: false, TotalAdjustedEstimate: 0, ServiceTransactionDtos: [] };

        beforeEach(() => {
            spyOn(component, 'getPatientName').and.callFake(() => 'Charley Daniels');
            component.providers = mockProviders;
            component.allProvidersList = mockProviders;
            const mockBenefitPlan = {
                PatientId: '2345', BenefitPlanId: '5', PatientBenefitPlanId: '10', Priority: 0,
                PolicyHolderBenefitPlanDto:
                    { BenefitPlanDto: { Name: 'Plan1', CarrierName: 'Carrier1', ApplyAdjustments: 1, FeesIns: 2, SubmitClaims: true } }
            };

            encounter = {
                hasAdjustedEstimate: false, TotalAdjustedEstimate: 0,
                benefitPlan: mockBenefitPlan, ServiceTransactionDtos: [
                    { DateEntered: new Date(), InsuranceEstimate: [{ AdjEst: 50, EstInsurance: 100 }], ServiceCodeId: '1234', ProviderUserId: '9999', ProviderOnClaimsId: '9999', Description: 'D7287:	exfoliative cytological sample collection', AdjustmentAmount: 10 },
                    { DateEntered: new Date(), InsuranceEstimate: [{ AdjEst: 50, EstInsurance: 100 }], ServiceCodeId: '1236', ProviderUserId: '9999', ProviderOnClaimsId: '8888', Description: 'D6750;	crown - porcelain fused to high noble metal', AdjustmentAmount: 10 },
                ]
            };
            component.serviceCodes = [
                { ServiceCodeId: '1234', AffectedAreaId: 1, UseCodeForRangeOfTeeth: false, IsEligibleForDiscount: true, UsuallyPerformedByProviderTypeId: 2, CdtCodeId: '12345', SubmitOnInsurance: true },
                { ServiceCodeId: '1235', AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, IsEligibleForDiscount: false, UsuallyPerformedByProviderTypeId: 1, CdtCodeId: '12346', SubmitOnInsurance: true },
                { ServiceCodeId: '1236', AffectedAreaId: 3, UseCodeForRangeOfTeeth: false, IsEligibleForDiscount: false, UsuallyPerformedByProviderTypeId: 2, CdtCodeId: '12347', SubmitOnInsurance: true },
                { ServiceCodeId: '1237', AffectedAreaId: 1, UseCodeForRangeOfTeeth: true, IsEligibleForDiscount: true, UsuallyPerformedByProviderTypeId: 4, CdtCodeId: '12348', SubmitOnInsurance: true },
            ];
        });


        it('should add dynamic columns based on matching service codes for all serviceTransactions in encounters passed to method', () => {
            spyOn(component, 'getProviderName');
            component.processRequiredPropertiesForServiceTransaction(encounter);

            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                const serviceCodeItem = component.serviceCodes.find(x => x.ServiceCodeId === serviceTransaction.ServiceCodeId);
                expect(serviceTransaction.AffectedAreaId).toEqual(serviceCodeItem.AffectedAreaId);
                expect(serviceTransaction.UseCodeForRangeOfTeeth).toEqual(serviceCodeItem.UseCodeForRangeOfTeeth);
                expect(serviceTransaction.UsuallyPerformedByProviderTypeId).toEqual(serviceCodeItem.UsuallyPerformedByProviderTypeId);
                expect(serviceTransaction.CdtCodeId).toEqual(serviceCodeItem.CdtCodeId);
                expect(serviceTransaction.SubmitOnInsurance).toEqual(serviceCodeItem.SubmitOnInsurance);
            });

        });

        it('should set dynamic properties based on serviceTransaction properties', () => {
            spyOn(component, 'getProviderName');
            component.processRequiredPropertiesForServiceTransaction(encounter);

            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                const split = serviceTransaction.Description.split(':');
                expect(serviceTransaction.CompleteDescription).toEqual(split[1]);
                expect(serviceTransaction.Code).toEqual(serviceTransaction.Description.slice(0, 5));
                if (serviceTransaction.AdjustmentAmount === null) {
                    expect(serviceTransaction.AdjustmentAmount).toEqual(0);
                }
            });

        });

        it('should call getProviderName with ProviderUserId', () => {
            spyOn(component, 'getProviderName');
            component.processRequiredPropertiesForServiceTransaction(encounter);

            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                const serviceCodeItem = component.serviceCodes.find(x => x.ServiceCodeId === serviceTransaction.ServiceCodeId);
                expect(component.getProviderName).toHaveBeenCalledWith(serviceTransaction.ProviderUserId, component.providers);
                expect(component.getProviderName).toHaveBeenCalledWith(serviceTransaction.ProviderOnClaimsId, component.providers);
            });

        });

        it('should call getPatientName with AccountMemberId', () => {
            component.processRequiredPropertiesForServiceTransaction(encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(component.getPatientName).toHaveBeenCalledWith(serviceTransaction.AccountMemberId);
            });
        });



        // tslint:disable-next-line: max-line-length
        it('should set CreateClaim to true and canCreateClaim to true if encounter has benefitPlan and serviceTransaction.SubmitOnInsurance is true '+
        'and CdtCodeId is not null and encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.SubmitClaims is true', () => {
            spyOn(component, 'getProviderName');
            component.processRequiredPropertiesForServiceTransaction(encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.canCreateClaim).toBe(true);
                expect(serviceTransaction.CreateClaim).toBe(true);
            });
        });

        it('should default CreateClaim to false and canCreateClaim to true if encounter has benefitPlan and serviceTransaction.SubmitOnInsurance is true '+
        'and CdtCodeId is not null and encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.SubmitClaims is false', () => {
            spyOn(component, 'getProviderName');
            encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.SubmitClaims = false;
            component.processRequiredPropertiesForServiceTransaction(encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.canCreateClaim).toBe(true);
                expect(serviceTransaction.CreateClaim).toBe(false);
            });
        });

        it('should default CreateClaim to true and canCreateClaim to true if encounter has benefitPlan and serviceTransaction.SubmitOnInsurance is true '+
        'and CdtCodeId is not null and encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.SubmitClaims is undefined', () => {
            spyOn(component, 'getProviderName');
            encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto = {};
            component.processRequiredPropertiesForServiceTransaction(encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.canCreateClaim).toBe(true);
                expect(serviceTransaction.CreateClaim).toBe(true);
            });
        });

        // tslint:disable-next-line: max-line-length
        it('should set canCreateClaim to false and set claimsTooltip if encounter has benefitPlan and serviceTransaction.SubmitOnInsurance is false or CdtCodeId is null', () => {
            spyOn(component, 'getProviderName');
            const serviceCodeItem = component.serviceCodes.find(x => x.ServiceCodeId === '12347');
            if (serviceCodeItem) {
                serviceCodeItem.SubmitOnInsurance = false;
            }
            component.processRequiredPropertiesForServiceTransaction(encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                if (serviceTransaction.ServiceCodeId === '12347') {
                    expect(serviceTransaction.canCreateClaim).toBe(false);
                    expect(serviceTransaction.CreateClaim).toBe(false);
                    expect(serviceTransaction.claimsTooltip).toEqual('Bob');
                }
            });

            if (serviceCodeItem) {
                serviceCodeItem.SubmitOnInsurance = true;
                serviceCodeItem.CdtCodeId = null;
            }
            component.processRequiredPropertiesForServiceTransaction(encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                if (serviceTransaction.ServiceCodeId === '12347') {
                    expect(serviceTransaction.canCreateClaim).toBe(false);
                    expect(serviceTransaction.CreateClaim).toBe(false);
                    expect(serviceTransaction.claimsTooltip).toBe('Bob');
                }
            });

        });

        it('should set canCreateClaim to false if encounter does not have associated benefitPlan', () => {
            spyOn(component, 'getProviderName');
            encounter.benefitPlan = null;
            component.processRequiredPropertiesForServiceTransaction(encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                const serviceCodeItem = component.serviceCodes.find(x => x.ServiceCodeId === serviceTransaction.ServiceCodeId);
                expect(serviceTransaction.canCreateClaim).toBe(false);
                expect(serviceTransaction.CreateClaim).toBe(false);
            });
        });

        it('should set encounter.TotalAdjustedEstimate based on serviceTransaction.InsuranceEstimates', () => {
            spyOn(component, 'getProviderName');
            encounter.ServiceTransactionDtos[0].InsuranceEstimates = [{
                AdjEst: 10,
                EstInsurance: 90,
                PatientBenefitPlanId: '10',
            }, {
                AdjEst: 20,
                EstInsurance: 50,
                PatientBenefitPlanId: '10',
            },];
            encounter.ServiceTransactionDtos[1].InsuranceEstimates = [{
                AdjEst: 30,
                EstInsurance: 30,
                PatientBenefitPlanId: '10',
            },];

            component.processRequiredPropertiesForServiceTransaction(encounter);
            expect(encounter.hasAdjustedEstimate).toBe(true);
            expect(encounter.TotalAdjustedEstimate).toEqual(60);
            encounter.TotalAdjustedEstimate = 0;
            encounter.hasAdjustedEstimate = false;
            encounter.ServiceTransactionDtos[0].InsuranceEstimates = [{
                AdjEst: 0,
                EstInsurance: 90,
                PatientBenefitPlanId: '10',
            }, {
                AdjEst: 0,
                EstInsurance: 50,
                PatientBenefitPlanId: '10',
            },];
            encounter.ServiceTransactionDtos[1].InsuranceEstimates = [{
                AdjEst: 0,
                EstInsurance: 30,
                PatientBenefitPlanId: '10',
            },];

            component.processRequiredPropertiesForServiceTransaction(encounter);
            expect(encounter.hasAdjustedEstimate).toBe(false);
            expect(encounter.TotalAdjustedEstimate).toEqual(0);
        });

        it('should set encounter.TotalAdjustedEstimate to false if no benefit plan', () => {
            spyOn(component, 'getProviderName');
            encounter.benefitPlan = null;
            encounter.ServiceTransactionDtos[0].DateEntered = new Date();
            encounter.ServiceTransactionDtos[0].InsuranceEstimates = [{
                AdjEst: 10,
                EstInsurance: 90,
                PatientBenefitPlanId: '10',
            }, {
                AdjEst: 20,
                EstInsurance: 50,
                PatientBenefitPlanId: '10',
            },];
            encounter.ServiceTransactionDtos[1].DateEntered = new Date();
            encounter.ServiceTransactionDtos[1].InsuranceEstimates = [{
                AdjEst: 30,
                EstInsurance: 30,
                PatientBenefitPlanId: '10',
            },];
            component.processRequiredPropertiesForServiceTransaction(encounter);
            expect(encounter.hasAdjustedEstimate).toBe(false);
            expect(encounter.TotalAdjustedEstimate).toEqual(0);
        });

        it('should call patientCheckoutService.calculateServiceTransactionAmounts with each serviceTransaction to calculate' +
            'Charges, BalanceDue, and DueNow', () => {
                component.processRequiredPropertiesForServiceTransaction(encounter);
                encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                    expect(mockPatientCheckoutService.calculateServiceTransactionAmounts).toHaveBeenCalledWith(serviceTransaction);
                });
            });

        it('should create ExtendedDescription to Equal Description if it Tooth, RootSummaryInfo, and SurfaceSummaryInfo are null', () => {
            encounter.ServiceTransactionDtos[0].Description = 'D5740: reline maxillary partial denture (chairside) (D5740)';            
            component.processRequiredPropertiesForServiceTransaction(encounter);
            expect(encounter.ServiceTransactionDtos[0].ExtendedDescription).toEqual(encounter.ServiceTransactionDtos[0].Description)
        });

        it('should create ExtendedDescription by appending  Tooth information to Description if it exists', () => {
            encounter.ServiceTransactionDtos[0].Description = 'D5740: reline maxillary partial denture (chairside) (D5740)';
            encounter.ServiceTransactionDtos[0].Tooth= '2-4,9';
            component.processRequiredPropertiesForServiceTransaction(encounter);
            expect(encounter.ServiceTransactionDtos[0].ExtendedDescription).toEqual(encounter.ServiceTransactionDtos[0].Description + ' #'+ encounter.ServiceTransactionDtos[0].Tooth)
        });

        it('should create ExtendedDescription by appending SummaryRootInfo information to Description if it exists', () => {
            encounter.ServiceTransactionDtos[0].Description = 'D3220: therapeutic pulpotomy (excluding final restoration) - removal of pulp coronal to the dentinocemental junction and application of medicament (D3220)'; 
            encounter.ServiceTransactionDtos[0].Tooth= '2';
            encounter.ServiceTransactionDtos[0].RootSummaryInfo= 'DBPMB';
            component.processRequiredPropertiesForServiceTransaction(encounter);
            expect(encounter.ServiceTransactionDtos[0].ExtendedDescription).toEqual(encounter.ServiceTransactionDtos[0].Description + ' #'+ encounter.ServiceTransactionDtos[0].Tooth +', '+ encounter.ServiceTransactionDtos[0].RootSummaryInfo)
        });

        it('should create ExtendedDescription by appending  SummarySurfaceInfo information to Description if it exists', () => {
            encounter.ServiceTransactionDtos[0].Description = 'D2150: amalgam - two surfaces, primary or permanent (D2150)';
            encounter.ServiceTransactionDtos[0].Tooth = '2';
            encounter.ServiceTransactionDtos[0].SurfaceSummaryInfo = 'MO';            
            component.processRequiredPropertiesForServiceTransaction(encounter);
            expect(encounter.ServiceTransactionDtos[0].ExtendedDescription).toEqual(encounter.ServiceTransactionDtos[0].Description + ' #'+ encounter.ServiceTransactionDtos[0].Tooth  +', '+ encounter.ServiceTransactionDtos[0].SurfaceSummaryInfo)
        });
    });

    describe('getProviderName method', () => {
        let allProviders: any[];
        beforeEach(() => {
            allProviders = [...mockProviders,
                {
                    DateModified: '2018-10-01T15:17:15.7411065',
                    FirstName: 'James',
                    LastName: 'Doe',
                    SuffixName: null,
                    ProfessionalDesignation: 'DDS',
                    UserId: '9876',
                    Locations: [{ LocationId: 12 }, { LocationId: 13 }]
                }
            ];
        });
        it('should return dynamic Name for provider', () => {
            expect(component.getProviderName('1234', mockProviders)).toEqual('Ruby Brown');
            expect(component.getProviderName('1235', mockProviders)).toEqual('Khloe Dickson, DMH');
            expect(component.getProviderName('1236', mockProviders)).toEqual('Cody Flores, DMD');
            expect(component.getProviderName('1237', mockProviders)).toEqual('Molly Franklin');
            expect(component.getProviderName('9876', allProviders)).toEqual('James Doe, DDS');
        });

        it('should return empty string if no match', () => {
            expect(component.getProviderName('1238', mockProviders)).toEqual('');
            expect(component.getProviderName('1238', allProviders)).toEqual('');
        });
    });

    describe('getPatientName method', () => {
        const accountMemberId = '1234';
        beforeEach(() => {
            component.accountMembersDetails = [
                { AccountMemberId: '1234', PersonId: '2345' },
                { AccountMemberId: '1235', PersonId: '2346' },
                { AccountMemberId: '1236', PersonId: '2347' }];

            component.accountMembersList = [
                { PatientId: '2345', FirstName: 'Bob', LastName: 'Frapples', SuffixName: 'Jr.' },
                { PatientId: '2346', FirstName: 'Duncan', LastName: 'Frapples', SuffixName: null },
                { PatientId: '2347', FirstName: 'Lucy', LastName: 'Frapples', SuffixName: 'Sr.' }];

        });
        it('should return dynamic Name for patient name display', () => {
            expect(component.getPatientName('1234')).toEqual('Bob Frapples, Jr.');
            expect(component.getPatientName('1235')).toEqual('Duncan Frapples');
            expect(component.getPatientName('1236')).toEqual('Lucy Frapples, Sr.');
        });

        it('should return empty string if no match', () => {
            expect(component.getPatientName('1237')).toEqual('');
        });

    });

    describe('setData method', () => {
        const hasInvalidCodes = false;
        beforeEach(() => {
            spyOn(component, 'initializeCreditTransactionDetails');
            spyOn(component, 'setSummaryRowClaimsCheckbox');
            component.accountMembersDetails = [
                { AccountMemberId: '1234', PersonId: '2345' },
                { AccountMemberId: '1235', PersonId: '2346' },
                { AccountMemberId: '1236', PersonId: '2347' }];

            component.serviceTransactionToClaimDtoList = [];

            component.accountMembersList = [
                { PatientId: '2345', FirstName: 'Bob', LastName: 'Frapples', SuffixName: '' },
                { PatientId: '2346', FirstName: 'Duncan', LastName: 'Frapples', SuffixName: null },
                { PatientId: '2347', FirstName: 'Lucy', LastName: 'Frapples', SuffixName: '' }];

            // spyOn(component, 'getPatientName').and.callFake(() => 'Charley Daniels');
            spyOn(component, 'hasInvalidServiceCodes').and.callFake(() => hasInvalidCodes);
            spyOn(component, 'getProviderName').and.callFake(() => { });
            spyOn(component, 'getEncounterBalanceDue').and.callFake(() => { });
            spyOn(component, 'addBenefitPlanData').and.callFake(() => { });
            spyOn(component, 'loadServiceAndDebitTransactionDtos').and.callFake(() => { });
            spyOn(component, 'updateTotals').and.callFake(() => { });
            spyOn(component, 'processRequiredPropertiesForServiceTransaction').and.callFake(() => { });
            spyOn(component, 'updateServiceAdjustmentAmount').and.callFake(() => { });
            spyOn(component, 'updateCreditTransactionDtoDetails').and.callFake(() => { });
            spyOn(component, 'getDebitTransactionsByAccountId').and.callFake((any) => {
                return {
                    then(callback) {
                        callback(mockReturnData);
                    }
                };
            });
            spyOn(component, 'loadAllDebitTransactions').and.callFake(() => { });

            component.patientEncounters = cloneDeep(mockEncounters);
            component.dataForPage = { PendingEncounters: [] };
            component.encounterId = null;
            // TODO move these to top level

            component.allMemberPlans = [
                // tslint:disable-next-line: max-line-length
                {
                    PatientId: '2345', BenefitPlanId: 5, PolicyHolderBenefitPlanDto:
                        { BenefitPlanDto: { Name: 'Plan1', CarrierName: 'Carrier1', ApplyAdjustments: 1, FeesIns: 2 } },
                    PatientBenefitPlanId: 10, Priority: 0
                },
                // tslint:disable-next-line: max-line-length
                {
                    PatientId: '1235', BenefitPlanId: 7, PolicyHolderBenefitPlanDto:
                        { BenefitPlanDto: { Name: 'Plan3', CarrierName: 'Carrier3', ApplyAdjustments: 1, FeesIns: 2 } },
                    PatientBenefitPlanId: 30, Priority: 1
                },
                // tslint:disable-next-line: max-line-length
                {
                    PatientId: 1, BenefitPlanId: 6, PolicyHolderBenefitPlanDto:
                        { BenefitPlanDto: { Name: 'Plan2', CarrierName: 'Carrier2', ApplyAdjustments: 1, FeesIns: 1 } },
                    PatientBenefitPlanId: 20, Priority: 2
                },
            ];

            component.serviceCodes = [
                { ServiceCodeId: '1234', AffectedAreaId: 1, UseCodeForRangeOfTeeth: false, IsEligibleForDiscount: true, UsuallyPerformedByProviderTypeId: 2, CdtCodeId: '12345', SubmitOnInsurance: true },
                { ServiceCodeId: '1235', AffectedAreaId: 5, UseCodeForRangeOfTeeth: true, IsEligibleForDiscount: false, UsuallyPerformedByProviderTypeId: 1, CdtCodeId: '12346', SubmitOnInsurance: true },
                { ServiceCodeId: '1236', AffectedAreaId: 3, UseCodeForRangeOfTeeth: false, IsEligibleForDiscount: false, UsuallyPerformedByProviderTypeId: 2, CdtCodeId: '12347', SubmitOnInsurance: true },
                { ServiceCodeId: '1237', AffectedAreaId: 1, UseCodeForRangeOfTeeth: true, IsEligibleForDiscount: true, UsuallyPerformedByProviderTypeId: 4, CdtCodeId: '12348', SubmitOnInsurance: true },
            ];
        });

        // tslint:disable-next-line: max-line-length
        it('should set the servicesHaveDifferentDates on each allEncounters encounter to true if encounters have serviceTransactions with differnt dates', () => {
            component.setData(component.dataForPage);
            expect(component.patientEncounters[0].servicesHaveDifferentDates).toBe(true);
            expect(component.patientEncounters[1].servicesHaveDifferentDates).toBe(true);
        });

        it('should set the displayDate with Z on end for utc conversion on each allEncounters encounter to oldest serviceTransaction date on encounter', () => {
            component.setData(component.dataForPage);
            expect(component.patientEncounters[0].displayDate).toEqual('2020-08-04 18:54:48.5599445Z');
            expect(component.patientEncounters[1].displayDate).toEqual('2020-08-02 18:54:48.5599445Z');
        });

        it('should sort all ServiceTransactionDtos by InsuranceOrder within each encounter', () => {
            const encounters = [
                {
                    displayDate: '2020-08-04 18:54:48.5599445', EncounterId: 1234, AccountMemberId: '1234', ServiceTransactionDtos: [
                        {
                            DateEntered: '2020-08-04 18:54:48.5599445',
                            InsuranceOrder: 4,
                            LocationId: 12,
                            InsuranceEstimates: []
                        },
                        {
                            DateEntered: '2020-08-04 18:54:48.5599445',
                            InsuranceOrder: 3,
                            LocationId: 12,
                            InsuranceEstimates: []
                        },
                        {
                            DateEntered: '2020-07-04 18:54:48.5599445',
                            InsuranceOrder: 2,
                            LocationId: 12,
                            InsuranceEstimates: []
                        },
                        {
                            DateEntered: '2020-07-04 18:54:48.5599445',
                            InsuranceOrder: 1,
                            LocationId: 12,
                            InsuranceEstimates: []
                        }]
                }];

            component.patientEncounters = encounters;
            component.dataForPage.PendingEncounters = [];
            component.setData(component.dataForPage);
            component.allEncounters.forEach(encounter => {
                expect(encounter.ServiceTransactionDtos[0].InsuranceOrder).toBe(1);
                expect(encounter.ServiceTransactionDtos[1].InsuranceOrder).toBe(2);
                expect(encounter.ServiceTransactionDtos[2].InsuranceOrder).toBe(3);
                expect(encounter.ServiceTransactionDtos[3].InsuranceOrder).toBe(4);
            });

        });


        it('should create component.allEncounters with encounters that have a status of 2 sorted by encounter.PatientName then displayDate', () => {
            const encounters = [
                {
                    displayDate: '2020-08-04 18:54:48.5599445', EncounterId: 1234, TotalAdjustedEstimate: 0, Status: 2, AccountMemberId: '1234', ServiceTransactionDtos: [
                        {
                            DateEntered: '2020-08-04 18:54:48.5599445',
                            LocationId: 12,
                            InsuranceEstimates: []
                        }]
                },
                {
                    displayDate: '2020-07-04 18:54:48.5599445', EncounterId: 1235, TotalAdjustedEstimate: 0, Status: 2, AccountMemberId: '1235', ServiceTransactionDtos: [
                        {
                            DateEntered: '2020-08-04 18:54:48.5599445',
                            LocationId: 12,
                            InsuranceEstimates: []
                        },
                        {
                            DateEntered: '2020-07-04 18:54:48.5599445',
                            LocationId: 12,
                            InsuranceEstimates: []
                        }]
                },
                {
                    displayDate: '2020-07-04 18:54:48.5599445', EncounterId: 1236, TotalAdjustedEstimate: 0, Status: 2, AccountMemberId: '1234', ServiceTransactionDtos: [
                        {
                            DateEntered: '2020-07-04 18:54:48.5599445',
                            LocationId: 12,
                            InsuranceEstimates: []
                        }]
                }];


            component.patientEncounters = encounters;
            component.dataForPage.PendingEncounters = [];
            component.setData(component.dataForPage);
            expect(component.allEncounters[0].PatientName).toEqual('Bob Frapples');
            expect(component.allEncounters[0].displayDate).toEqual('2020-08-04 18:54:48.5599445Z');
            expect(component.allEncounters[1].PatientName).toEqual('Bob Frapples');
            expect(component.allEncounters[1].displayDate).toEqual('2020-07-04 18:54:48.5599445Z');
            expect(component.allEncounters[2].PatientName).toEqual('Duncan Frapples');
            expect(component.allEncounters[2].displayDate).toEqual('2020-07-04 18:54:48.5599445Z');
        });

        it('should add Z to date to handle utc conversion on display', () => {
            const encounters = [
                {
                    displayDate: '2020-08-04 18:54:48.5599445', EncounterId: 1234, TotalAdjustedEstimate: 0,
                    Status: 2, AccountMemberId: '1234', ServiceTransactionDtos: [
                        {
                            DateEntered: '2020-08-04 18:54:48.5599445',
                            LocationId: 12,
                            InsuranceEstimates: []
                        }
                    ]
                }];
            component.patientEncounters = encounters;
            component.dataForPage.PendingEncounters = [];
            component.setData(component.dataForPage);
            expect(component.allEncounters[0].displayDate).toEqual('2020-08-04 18:54:48.5599445Z');
            expect()
        });

        it('should call loadAllDebitTransactions', () => {
            mockReturnData = [];
            component.setData(component.dataForPage);
            component.dataForPage.PendingEncounters.forEach(encounter => {
                expect(component.loadAllDebitTransactions).toHaveBeenCalled();                
            });
        });


        it('should call getEncounterBalanceDue for each encounter (allEncounters and priorBalance)', () => {
            component.setData(component.dataForPage);
            component.dataForPage.PendingEncounters.forEach(encounter => {
                expect(component.getEncounterBalanceDue).toHaveBeenCalledWith(encounter);
            });
        });

        it('should add encounters with Status of 1 to priorBalances list if they have a BalanceDue', () => {
            component.patientEncounters[2].Status = 1;
            component.patientEncounters[2].BalanceDue = 200.00;
            component.setData(component.dataForPage);
            expect(component.priorBalances.length).toBe(1);
            expect(component.priorBalances[0].EncounterId).toBe(1236);
        });


        it('should call addBenefitPlanData for each encounter in dataForPage.PendingEncounters ', () => {
            component.setData(component.dataForPage);
            component.dataForPage.PendingEncounters.forEach(encounter => {
                expect(component.addBenefitPlanData).toHaveBeenCalledWith(encounter);
            });
        });

        it('should call loadServiceAndDebitTransactionDtos ', () => {
            component.setData(component.dataForPage);
            expect(component.loadServiceAndDebitTransactionDtos).toHaveBeenCalled();
        });

        it('should call updateTotals ', () => {
            component.setData(component.dataForPage);
            expect(component.updateTotals).toHaveBeenCalled();
        });

        it('should call updateServiceAdjustmentAmount ', () => {
            component.setData(component.dataForPage);
            expect(component.updateServiceAdjustmentAmount).toHaveBeenCalled();
        });

        it('should call initializeCreditTransactionDetails ', () => {
            component.setData(component.dataForPage);
            expect(component.initializeCreditTransactionDetails).toHaveBeenCalled();
        });

        it('should call processRequiredPropertiesForServiceTransaction for each encounter in dataForPage.PendingEncounters ', () => {
            component.setData(component.dataForPage);
            component.dataForPage.PendingEncounters.forEach(encounter => {
                expect(component.processRequiredPropertiesForServiceTransaction).toHaveBeenCalledWith(encounter);
            });
        });

    });
    
    describe('setSummaryRowClaimsCheckboxTooltip method', () => {

        let encounter;
        beforeEach(() => {
            encounter = cloneDeep(mockEncounter);
            encounter.canCreateClaims = false;
        });

        it('should set encounter.disableCreateClaimsTooltip to empty message if encounter.canCreateClaims is false ', () => {
            encounter.canCreateClaims = false;
            component.setSummaryRowClaimsCheckboxTooltip(encounter);
            expect(encounter.disableCreateClaimsTooltip).toEqual('There are no services marked to submit to insurance');
        });

        it('should set encounter.disableCreateClaimsTooltip to empty string if encounter.canCreateClaims is true ', () => {
            encounter.canCreateClaims = true;
            component.setSummaryRowClaimsCheckboxTooltip(encounter);
            expect(encounter.disableCreateClaimsTooltip).toEqual('');
        });
    });

    describe('setSummaryRowClaimsCheckbox method', () => {

        let encounter;
        beforeEach(() => {
            encounter = cloneDeep(mockEncounter);
            encounter.benefitPlan = { BenefitPlanId: 7, PolicyHolderBenefitPlanDto:
                { BenefitPlanDto: { Name: 'Plan1', CarrierName: 'Carrier1', ApplyAdjustments: 1, FeesIns: 2, SubmitClaims: true } }};
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.InsuranceEstimates.push({ AdjEst: 50.00 })
            });
        });

        it('should set encounter.CreateClaims to encounter.canCreateClaims if encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.SubmitClaims is true ', () => {
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;
            component.setSummaryRowClaimsCheckbox(encounter);
            expect(encounter.CreateClaims).toEqual(true);
        });
        it('should set encounter.CreateClaims based on ServiceTransactions on encounter', () => {
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.canCreateClaim = false;
            });
            component.setSummaryRowClaimsCheckbox(encounter);
            expect(encounter.CreateClaims).toEqual(false);
        });

        it('should set encounter.canCreateClaims based on ServiceTransactions on encounter', () => {
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;
            component.setSummaryRowClaimsCheckbox(encounter);
            expect(encounter.canCreateClaims).toEqual(true);
        });

        it('should set encounter.canCreateClaims based on ServiceTransactions on encounter', () => {
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.canCreateClaim = false;
            });
            component.setSummaryRowClaimsCheckbox(encounter);
            expect(encounter.canCreateClaims).toEqual(false);
        });

        it('should set encounter.allowSelectClaims to false until detail checkboxes are active', () => {
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;
            component.setSummaryRowClaimsCheckbox(encounter);
            expect(encounter.allowSelectClaims).toEqual(false);
        });

        it('should default encounter.CreateClaims to false if encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.SubmitClaims is false ', () => {
            encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.SubmitClaims = false          
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;
            component.setSummaryRowClaimsCheckbox(encounter);
            expect(encounter.CreateClaims).toEqual(false);
        });

        it('should default encounter.CreateClaims to true if serviceTransaction.canCreateClaim is true and encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.SubmitClaims is undefined', () => {
            encounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto = {};          
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;
            component.setSummaryRowClaimsCheckbox(encounter);
            expect(encounter.CreateClaims).toEqual(true);
        });
    });

   

    describe('resetCurrentCreditTransactionDistribution method', () => {

        beforeEach(async () => {
            component.disableSummary = false;
            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.Amount = 100.00;
            component.creditTransactionDto.TransactionTypeId = 2;
            component.creditTransactionDto.PaymentTypeId = '';
            component.creditTransactionDto.PromptTitle = 'PromptTitle';
            component.creditTransactionDto.PaymentTypePromptValue = 'PaymentTypePromptValue';
            component.creditTransactionDto.AdjustmentTypeId = '2';
            component.creditTransactionDto.Amount = 100;
            component.creditTransactionDto.DateEntered = new Date();
            component.creditTransactionDto.Description = 'Cash';
            component.creditTransactionDto.Note = '';
            component.creditTransactionDto.CreditTransactionDetails = [];
            component.creditTransactionDto.CreditTransactionDetails.push(
                { AppliedToServiceTransationId: '1234', AccountMemberId: '123456' });
            component.creditTransactionDto.CreditTransactionDetails.push(
                { AppliedToServiceTransationId: '1235', AccountMemberId: '123456' });
            spyOn(component, 'removeCredit');
            component.addCreditTransactionToList = false;
        });

        it('should call removeCredit to remove current CreditTransaction from list if Amount more than 0', () => {
            component.resetCurrentCreditTransactionDistribution();
            expect(component.removeCredit).toHaveBeenCalledWith(component.creditTransactionDto);
            expect(component.disableSummary).toBe(true);
        });

        it('should call patientCheckoutService.resetCurrentCreditTransaction if Amount more than 0', fakeAsync(() => {
            component.creditTransactionDtoList = [{}];
            component.resetCurrentCreditTransactionDistribution();
            tick();

            expect(mockPatientCheckoutService.resetCurrentCreditTransaction).toHaveBeenCalled();
        }));

        it('should set properties on component.creditTransactionDto to original creditTransactionDto', () => {
            component.resetCurrentCreditTransactionDistribution();
            expect(component.creditTransactionDto.Amount).toBe(100);
            expect(component.creditTransactionDto.PromptTitle).toBe('PromptTitle');
            expect(component.creditTransactionDto.PaymentTypePromptValue).toBe('PaymentTypePromptValue');
            expect(component.creditTransactionDto.TransactionTypeId).toBe(2);
        });

        it('should call updateCreditTransactionDtoDetails to redistribute amounts', fakeAsync(() => {
            spyOn(component, 'updateCreditTransactionDtoDetails');
            component.creditTransactionDto.Amount = 100;
            component.resetCurrentCreditTransactionDistribution();
            component.removeCredit(component.creditTransactionDto);
            tick();

            expect(component.updateCreditTransactionDtoDetails).toHaveBeenCalled();
            expect(component.disableSummary).toBe(true);
        }));

        it('should not call removeCredit Amount less than or equal to 0', fakeAsync(() => {
            component.creditTransactionDto.Amount = 0;
            component.resetCurrentCreditTransactionDistribution();
            tick();
            
            expect(component.removeCredit).not.toHaveBeenCalled();
        }));
    });
    
    describe('toggleClaimSelected method ', () => {
        let createClaim;
        let serviceTransactionEstimatesList ;
        let servicesToExclude; 
        let encounter;
        beforeEach(() => {
            component.allEncounters = [{
                PatientName: 'Charley Daniels', EncounterId: '1234', Status: 2, AccountMemberId: '1235',
                ServiceTransactionDtos: [
                    {
                        Adjustment: 0,
                        AccountMemberId: '1235',
                        ServiceTransactionId: '1111',
                        AdjustmentAmount: 0,
                        InsuranceEstimates: [],
                        AgingDate: '2020-09-25',
                        ProviderUserId: '2525',
                    },
                    {
                        Adjustment: 0,
                        AccountMemberId: '1235',
                        ServiceTransactionId: '1112',
                        $$ObjectWasUpdated: true,
                        AdjustmentAmount: 0,
                        InsuranceEstimates: [],
                        AgingDate: '2020-09-30',
                        ProviderUserId: '2526'
                    }
                ]
            },
            {
                PatientName: 'Charley Daniels', EncounterId: '1236', Status: 2, AccountMemberId: '1235', TotalAdjustedEstimate: 0,
                ServiceTransactionDtos: [
                    {
                        Code: '',
                        Description: 'D3221, pulpal debridement, primary and permanent teeth',
                        Fee: 300,
                        DueNow: 300,
                        Adjustment: 0,
                        AccountMemberId: '1235',
                        IsDeleted: false,
                        EncounterId: '1236',
                        DebitTransactionId: null,
                        ServiceTransactionId: '1111',
                        Discount: 0,
                        Tax: 10.00,
                        TotalEstInsurance: 0,
                        TotalAdjEstimate: 0,
                        Balance: 300,
                        Amount: 300,
                        AdjustmentAmount: 0,
                        isAdjustment: false,
                        canCreateClaim: true,
                        CreateClaim: true,
                        PatientName: 'Charley Daniels',
                        InsuranceEstimates: []
                    },
                    {
                        Code: '',
                        Description: 'D6750;	crown - porcelain fused to high noble metal',
                        Fee: 200,
                        DueNow: 200,
                        Adjustment: 0,
                        EncounterId: '1236',
                        DebitTransactionId: null,
                        AccountMemberId: '1235',
                        ServiceTransactionId: '1112',
                        Discount: 0,
                        Tax: 10.00,
                        ServiceCodeId: '1236',
                        TotalEstInsurance: 0,
                        TotalAdjEstimate: 0,
                        Balance: 200,
                        Amount: 200,
                        AdjustmentAmount: 0,
                        isAdjustment: false,
                        canCreateClaim: true,
                        CreateClaim: false,
                        PatientName: 'Charley Daniels',
                        InsuranceEstimates: []
                    }
                ]
            }];
            encounter = component.allEncounters[1];            
            component.adjustmentEncounters = [cloneDeep(encounter)];
            spyOn(component, 'updateTotals').and.callFake(() => { });
            component.disableCreateClaims = false;
            spyOn(component, 'getEncounterBalanceDue').and.callFake(() => { });
            spyOn(component, 'resetCurrentCreditTransactionDistribution').and.callFake(() => { });
            ///spyOn(component, 'getServiceTransactionEstimatesList').and.callFake(() => [{}, {}]);
            spyOn(component, 'removeCreditTransactionForFeeScheduleAdjustments').and.callFake(() => { });
            spyOn(component, 'buildFeeScheduleAdjustment').and.callFake(() => { }); 
            spyOn(component, 'resetInsuranceEstimate').and.callFake(() => { });
            //spyOn(component, 'getServicesToExclude').and.callFake(() => ['1233', '1232']);

            component.patientEncounters = [{
                EncounterId: '1234', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '2222', CreateClaim: true }, 
                    { ServiceTransactionId: '2223', CreateClaim: true }]}, {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '3333', CreateClaim: true },
                    { ServiceTransactionId: '3334', CreateClaim: true }]}, {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '3335', CreateClaim: true }]
            }];

            component.calculateServiceEstimates = jasmine.createSpy().and.callFake((array) => {
                return {
                    then(callback) {
                        callback({});
                    }
                };
            })
        });

        it('should set each serviceTransaction.CreateClaim to true if createClaim parameter is false and serviceTransaction.canCreateClaim is true', () => {
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.CreateClaim = false;            
                serviceTransaction.canCreateClaim = true;
            });            
            createClaim = false;
            component.toggleClaimSelected(encounter.ServiceTransactionDtos, createClaim, encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.CreateClaim).toEqual(true);
            });
        });

        
       
        it('should not set each serviceTransaction.CreateClaim to true if createClaim parameter is false and serviceTransaction.canCreateClaim is false', () => {
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.CreateClaim = false;            
                serviceTransaction.canCreateClaim = false;
            });            
            createClaim = false;
            component.toggleClaimSelected(encounter.ServiceTransactionDtos, createClaim, encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.CreateClaim).toEqual(false);
            });  
        });

        it('should do nothing if component.disableCreateClaims is true', () => {
            component.disableCreateClaims = true;
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.CreateClaim = false;            
                serviceTransaction.canCreateClaim = false;
            });            
            createClaim = false;
            component.toggleClaimSelected(encounter.ServiceTransactionDtos, createClaim, encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.CreateClaim).toEqual(false);
            });
        });

        it('should set serviceTransaction.CreateClaim to false if it is true', () => {
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.CreateClaim = true;            
                serviceTransaction.canCreateClaim = true;
            });            
            createClaim = true;
            component.toggleClaimSelected(encounter.ServiceTransactionDtos, createClaim, encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.CreateClaim).toEqual(false);
            });
        });

        it('should call component.updateTotals', () => {
            component.updateSummary = false;
            let serviceTransaction = encounter.ServiceTransactionDtos[0];    
            createClaim = false;
            component.toggleClaimSelected(encounter.ServiceTransactionDtos, createClaim, encounter);            
            expect(component.updateTotals).toHaveBeenCalled();
        });

        it('should call component.getEncounterBalanceDue for each encounter in allEncounters', () => {
            component.updateSummary = false;
            let serviceTransaction = encounter.ServiceTransactionDtos[0];    
            createClaim = false;
            component.toggleClaimSelected(encounter.ServiceTransactionDtos, createClaim, encounter);
            component.allEncounters.forEach(encounter => {
                expect(component.getEncounterBalanceDue).toHaveBeenCalled();
            });
        });


        it('should call component.resetCurrentCreditTransactionDistribution', () => {
            component.updateSummary = false;
            let serviceTransaction = encounter.ServiceTransactionDtos[0];    
            createClaim = false;
            component.toggleClaimSelected(encounter.ServiceTransactionDtos, createClaim, encounter);            
            expect(component.resetCurrentCreditTransactionDistribution).toHaveBeenCalled();
        });
        
        it('should patientCheckoutService.calculateServiceTransactionAmounts for each service if '+
        'disableCreateClaims is false and serviceTransaction.canCreateClaim is true', () => {
            component.disableCreateClaims = false;

            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.CreateClaim = false;            
                serviceTransaction.canCreateClaim = true;
            });            
            createClaim = false;
            component.toggleClaimSelected(encounter.ServiceTransactionDtos, createClaim, encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(mockPatientCheckoutService.calculateServiceTransactionAmounts).toHaveBeenCalledWith(serviceTransaction);
            });
        });

        it('should set Encounter.CreateClaims and AreCreatingClaimOnCheckout to false if no services on the encounter are checked to CreateClaims', () => {
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.CreateClaim = true;            
                serviceTransaction.canCreateClaim = true;
            });            
            createClaim = true;
            component.toggleClaimSelected(encounter.ServiceTransactionDtos, createClaim, encounter);
            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.CreateClaim).toEqual(false);
            });
            expect(encounter.CreateClaims).toBe(false);
            expect(encounter.AreCreatingClaimOnCheckout).toBe(false);
        });

        it('should set Encounter.CreateClaims and AreCreatingClaimOnCheckout to true if one or more services on the encounter are checked to CreateClaims', () => {
            encounter.ServiceTransactionDtos[0].CreateClaim = false;            
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;     
            encounter.ServiceTransactionDtos[0].CreateClaim = false;            
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;                      
            createClaim = false;
            component.toggleClaimSelected([encounter.ServiceTransactionDtos[0]], createClaim, encounter);            
            expect(encounter.ServiceTransactionDtos[0].CreateClaim).toEqual(true);
            expect(encounter.ServiceTransactionDtos[1].CreateClaim).toEqual(false);
            expect(encounter.CreateClaims).toBe(true);
            expect(encounter.AreCreatingClaimOnCheckout).toBe(true);
        });

        it('should call scope.resetInsuranceEstimate for all services in encounters to be checked out', () => {
            encounter.ServiceTransactionDtos[0].CreateClaim = false;            
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;
            encounter.ServiceTransactionDtos[0].InsuranceEstimates=[{AdjEst:45.00}];                    
            createClaim = false;
            component.toggleClaimSelected([encounter.ServiceTransactionDtos[0]], createClaim, encounter); 
            expect(component.resetInsuranceEstimate).toHaveBeenCalled();
        });

        it('should call buildFeeScheduleAdjustment and removeCreditTransactionForFeeScheduleAdjustments for each encounter in '+
        'adjustmentEncounters when there are adjustmentEncounters ', () => {
            encounter.ServiceTransactionDtos[0].CreateClaim = false;            
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;
            encounter.ServiceTransactionDtos[0].InsuranceEstimates=[{AdjEst:45.00}];                    
            createClaim = false;
            component.toggleClaimSelected([encounter.ServiceTransactionDtos[0]], createClaim, encounter); 
            component.adjustmentEncounters.forEach(encounter => {
                expect(component.removeCreditTransactionForFeeScheduleAdjustments).toHaveBeenCalledWith(encounter);
                expect(component.buildFeeScheduleAdjustment).toHaveBeenCalledWith(encounter);
            })
        });

        it('should call financialService.RecalculateInsuranceWithCascadingEstimates for all services in encounters to be checked out', () => {            
            encounter.ServiceTransactionDtos[0].CreateClaim = false;            
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;
            encounter.ServiceTransactionDtos[0].InsuranceEstimates=[{AdjEst:45.00}];                    
            createClaim = false;
            component.toggleClaimSelected([encounter.ServiceTransactionDtos[0]], createClaim, encounter); 
            expect(component.calculateServiceEstimates).toHaveBeenCalled();
        });

        it('should call buildFeeScheduleAdjustment and removeCreditTransactionForFeeScheduleAdjustments for each encounter in '+
        'adjustmentEncounters when there are adjustmentEncounters ', (done) => {
            encounter.ServiceTransactionDtos[0].CreateClaim = false;            
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;
            encounter.ServiceTransactionDtos[0].InsuranceEstimates=[{AdjEst:45.00}];                    
            createClaim = false;
            component.toggleClaimSelected([encounter.ServiceTransactionDtos[0]], createClaim, encounter); 
            component.calculateServiceEstimates(serviceTransactionEstimatesList, servicesToExclude, component.feeScheduleAdjustmentRemoved).then((result) => {
                component.adjustmentEncounters.forEach(encounter => {
                    expect(component.removeCreditTransactionForFeeScheduleAdjustments).toHaveBeenCalledWith(encounter);
                    expect(component.buildFeeScheduleAdjustment).toHaveBeenCalledWith(encounter);
                })               
                done();
            });
        });

        it('should call patientCheckoutService.calculateServiceTransactionAmounts for all services in all encounters being checked out', (done) => {
            encounter.ServiceTransactionDtos[0].CreateClaim = false;            
            encounter.ServiceTransactionDtos[0].canCreateClaim = true;
            encounter.ServiceTransactionDtos[0].InsuranceEstimates=[{AdjEst:45.00}];                    
            createClaim = false;
            component.toggleClaimSelected([encounter.ServiceTransactionDtos[0]], createClaim, encounter);
            component.calculateServiceEstimates(serviceTransactionEstimatesList, servicesToExclude, component.feeScheduleAdjustmentRemoved).then((result) => {
                component.allEncounters.forEach(encounter => {
                    encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                        expect(mockPatientCheckoutService.calculateServiceTransactionAmounts).toHaveBeenCalledWith(serviceTransaction);
                    })  
                })               
                done();
            });
        });
    });

    describe('resetInsuranceEstimate method ', () => {
        let serviceTransaction;
        beforeEach(() => {
            serviceTransaction =
            {
                CreateClaim: false,
                Adjustment: 0,
                TotalAdjEstimate: 45,
                TotalEstInsurance: 150,
                Balance: 40,
                Amount: 235,
                AccountMemberId: '1235',
                ServiceTransactionId: '1111',
                AdjustmentAmount: 0,
                InsuranceEstimates: [
                    {AdjEst: 45, EstInsurance: 120.00, CalculationDescription: 'Original Description1', ObjectState:'None',
                        IsUserOverRidden:false, IsMostRecentOverride: false, FamilyDeductibleUsed: 130, IndividualDeductibleUsed: 165}, 
                    {AdjEst: 0, EstInsurance: 30.00, CalculationDescription: 'Original Description2', ObjectState:'None',
                        IsUserOverRidden:false, IsMostRecentOverride: false, FamilyDeductibleUsed: 30, IndividualDeductibleUsed: 30}],
                AgingDate: '2020-09-25',
                ProviderUserId: '2525',
            }
        })

        it('should add serviceTransaction to backupServiceTransactionDtos when serviceTransaction.CreateClaim is false'+
        ' and disableCreateClaims is false', () => { 
            component.backupServiceTransactionDtos = [];
            component.disableCreateClaims =false;
            let originalCreateClaimValue = true;
            serviceTransaction.CreateClaim = false;                   
            component.resetInsuranceEstimate(serviceTransaction, originalCreateClaimValue);
            expect(component.backupServiceTransactionDtos).toContain(serviceTransaction);
        });

        it('should set InsuranceEstimates values to original values when originalCreateClaimValue is false and serviceTransaction.CreateClaim is true'+
        ' and disableCreateClaims is false', () => { 
            component.backupServiceTransactionDtos = [];
            serviceTransaction.CreateClaim = true;
            // assume this service transaction would be in backup list
            let cloneServiceTransaction = cloneDeep(serviceTransaction)
            component.backupServiceTransactionDtos.push(cloneServiceTransaction);
            component.disableCreateClaims =false;
            let originalCreateClaimValue = false;                   
            component.resetInsuranceEstimate(serviceTransaction, originalCreateClaimValue);
            expect(serviceTransaction.TotalAdjEstimate).toEqual(45.00);
            expect(serviceTransaction.TotalEstInsurance).toEqual(150.00);
            expect(serviceTransaction.Balance).toEqual(40);

            expect(serviceTransaction.InsuranceEstimates[0].AdjEst).toEqual(45);
            expect(serviceTransaction.InsuranceEstimates[0].EstInsurance).toEqual(120);
            expect(serviceTransaction.InsuranceEstimates[0].CalculationDescription).toEqual('Original Description1');
            expect(serviceTransaction.InsuranceEstimates[0].ObjectState).toEqual('None');

            expect(serviceTransaction.InsuranceEstimates[1].AdjEst).toEqual(0);
            expect(serviceTransaction.InsuranceEstimates[1].EstInsurance).toEqual(30);
            expect(serviceTransaction.InsuranceEstimates[1].CalculationDescription).toEqual('Original Description2');
            expect(serviceTransaction.InsuranceEstimates[1].ObjectState).toEqual('None');
        });
    })

    describe('toggleEncounterCreateClaims method ', () => {
        let createClaim;
        let encounter;
        beforeEach(() => {
            encounter = {
                PatientName: 'Charley Daniels', CreateClaims: true, canCreateClaims:true, EncounterId: '1236', Status: 2, AccountMemberId: '1235', TotalAdjustedEstimate: 0,
                ServiceTransactionDtos: [
                    {
                        Code: '',
                        Description: 'D3221, pulpal debridement, primary and permanent teeth',
                        Fee: 300,
                        DueNow: 300,
                        Adjustment: 0,
                        AccountMemberId: '1235',
                        IsDeleted: false,
                        EncounterId: '1236',
                        DebitTransactionId: null,
                        ServiceTransactionId: '1111',
                        Discount: 0,
                        Tax: 10.00,
                        TotalEstInsurance: 0,
                        TotalAdjEstimate: 0,
                        Balance: 300,
                        Amount: 300,
                        AdjustmentAmount: 0,
                        isAdjustment: false,
                        canCreateClaim: true,
                        CreateClaim: true,
                        PatientName: 'Charley Daniels',
                        InsuranceEstimates: []
                    },
                    {
                        Code: '',
                        Description: 'D6750;	crown - porcelain fused to high noble metal',
                        Fee: 200,
                        DueNow: 200,
                        Adjustment: 0,
                        EncounterId: '1236',
                        DebitTransactionId: null,
                        AccountMemberId: '1235',
                        ServiceTransactionId: '1112',
                        Discount: 0,
                        Tax: 10.00,
                        ServiceCodeId: '1236',
                        TotalEstInsurance: 0,
                        TotalAdjEstimate: 0,
                        Balance: 200,
                        Amount: 200,
                        AdjustmentAmount: 0,
                        isAdjustment: false,
                        canCreateClaim: true,
                        CreateClaim: false,
                        PatientName: 'Charley Daniels',
                        InsuranceEstimates: []
                    }
                ]
            };
            component.disableCreateClaims = false;
            spyOn(component, 'toggleClaimSelected').and.callFake(() => { });
        });

        it('should call if encounter.canCreateClaims is true and component.disableCreateClaims is false', () => {                     
            encounter.CreateClaims = true;
            component.disableCreateClaims=false;
            component.toggleEncounterCreateClaims(encounter);  
            expect(component.toggleClaimSelected).toHaveBeenCalledWith(encounter.ServiceTransactionDtos, encounter.CreateClaims, encounter);                      
        });

        it('should not call if encounter.canCreateClaims is true and component.disableCreateClaims is true', () => {                     
            encounter.CreateClaims = true;
            component.disableCreateClaims=true;
            component.toggleEncounterCreateClaims(encounter);  
            expect(component.toggleClaimSelected).not.toHaveBeenCalled();                      
        });

        it('should not call if encounter.canCreateClaims is false', () => {                     
            encounter.canCreateClaims = false;
            component.disableCreateClaims=false;
            component.toggleEncounterCreateClaims(encounter);  
            expect(component.toggleClaimSelected).not.toHaveBeenCalled();                      
        });        
    });

    describe('loadAllDebitTransactions method', () => {
        let checkedOutEncounters = [];
        let priorAdjustments = [];
        let mockPriorAdjustments = [];
        beforeEach(() => {
            mockPriorAdjustments = [
                {
                    PatientName: 'Charley Daniels', Code: null, DateEntered: '2020-08-5 18:54:48.5599445',
                    CompleteDescription: 'Positive Adjustment Affects Production', ProviderUserId: '1234', Balance: 100, AccountMemberId: '1235'
                },
                {
                    PatientName: 'Charley Daniels', Code: null, DateEntered: '2020-08-6 18:54:48.5599445',
                    CompleteDescription: 'Positive Adjustment Affects Production', ProviderUserId: '1234', Balance: 300, AccountMemberId: '1234'
                },
                {
                    PatientName: 'Charley Daniels', Code: null, DateEntered: '2020-08-8 18:54:48.5599445',
                    CompleteDescription: 'Positive Adjustment Affects Collection', ProviderUserId: '1234', Balance: 100, AccountMemberId: '1235'
                },
            ];

            component.allDebitTransactions = [];
            spyOn(component, 'loadServiceAndDebitTransactionDtos');
            spyOn(component, 'updateTotals');
            checkedOutEncounters = [
                {
                    PatientName: 'Charley Daniels', EncounterId: 1234, DateEntered: '2020-08-16 18:54:48.5599445', AccountMemberId: '1235',
                    ServiceTransactionDtos: [
                        {
                            AccountMemberId: '1235',
                            DateEntered: '2020-08-10 18:54:48.5599445',
                            Description: 'D3221,	pulpal debridement, primary and permanent teeth',
                            DueNow: 300,
                            Adjustment: 0,
                            PatientName: 'Charley Daniels',
                            IsDeleted: true,
                            ServiceTransactionId: '1110',
                            Balance: 300,
                            Amount: 300,
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        },
                        {
                            AccountMemberId: '1235',
                            DateEntered: '2020-08-04 18:54:48.5599445',
                            Description: 'D6750;	crown - porcelain fused to high noble metal',
                            DueNow: 200,
                            Adjustment: 0,
                            PatientName: 'Charley Daniels',
                            IsDeleted: false,
                            ServiceTransactionId: '1111',
                            Balance: 200,
                            Amount: 200,
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        }
                    ]

                },
                {
                    PatientName: 'Hazel Daniels', EncounterId: 1235, DateEntered: '2020-08-16 18:54:48.5599445', AccountMemberId: '1234',
                    ServiceTransactionDtos: [
                        {
                            AccountMemberId: '1234',
                            DateEntered: '2020-08-02 18:54:48.5599445',
                            Description: 'D3221,	pulpal debridement, primary and permanent teeth',
                            DueNow: 100,
                            Adjustment: 0,
                            PatientName: 'Hazel Daniels',
                            ServiceTransactionId: '1122',
                            IsDeleted: false,
                            Balance: 100,
                            Amount: 100,
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        },
                        {
                            AccountMemberId: '1234',
                            DateEntered: '2020-08-16 18:54:48.5599445',
                            Description: 'D6750;	crown - porcelain fused to high noble metal',
                            DueNow: 200,
                            Adjustment: 0,
                            PatientName: 'Hazel Daniels',
                            ServiceTransactionId: '1133',
                            IsDeleted: false,
                            Balance: 200,
                            Amount: 200,
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        }
                    ]
                }
            ];

            component.priorBalances = [];

            spyOn(component, 'getPatientName').and.callFake((accountMemberId: string) => {
                if (accountMemberId === '1234') {
                    return 'Hazel Daniels';
                } else {
                    return 'Charley Daniels';
                }
            });
            spyOn(component, 'getProviderName').and.callFake(() => 'James Bond');
        });

        it('should set PatientBalance equal to total of DueNow on  on prior balance transactions', () => {
            component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
            expect(component.priorBalanceTransactionsByPatient[0].PatientBalance).toEqual(component.priorBalanceTransactionsByPatient[0].DueNow);
            expect(component.priorBalanceTransactionsByPatient[1].PatientBalance).toEqual(component.priorBalanceTransactionsByPatient[1].DueNow);
        });

        

        it('should set DateEnteredDisplay to DateEntered plus Z to handle utc to local conversion on display ', () => {
            component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
            component.priorBalanceTransactionsByPatient.forEach(debitTransaction => {
                debitTransaction.ServiceTransactionDtos.forEach(serviceTransaction => {
                    expect(serviceTransaction.DateEnteredDisplay.endsWith('Z')).toBe(true);
                });
            });
        });

        it('should add each serviceTransaction from checkedOutEncounters to component.allDebitTransactions if it has a Balance other than 0 and IsDeleted is false', () => {
            component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
            checkedOutEncounters.forEach(x => {
                x.ServiceTransactionDtos.forEach(serviceTransaction => {
                    if (serviceTransaction.Balance > 0 || serviceTransaction.Balance < 0 && serviceTransaction.IsDeleted === false) {
                        const foundTransaction = component.allDebitTransactions.find(a => a.ServiceTransactionId === serviceTransaction.ServiceTransactionId);
                        expect(foundTransaction.ServiceTransactionId).toBe(serviceTransaction.ServiceTransactionId);
                    }
                });
            });
        });
        it('should not add each serviceTransaction from checkedOutEncounters to component.allDebitTransactions if IsDeleted is true', () => {
            component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
            checkedOutEncounters.forEach(x => {
                x.ServiceTransactionDtos.forEach(serviceTransaction => {
                    if (serviceTransaction.IsDeleted === true) {
                        const foundTransaction = component.allDebitTransactions.find(a => a.ServiceTransactionId === serviceTransaction.ServiceTransactionId);
                        expect(foundTransaction.ServiceTransactionId).toBe(undefined);
                    }
                });
            });
        });

        it('should group the priorBalanceTransactionsByPatient by patient A - Z', () => {
            component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
            expect(component.priorBalanceTransactionsByPatient[0].PatientName).toEqual('Charley Daniels');
            expect(component.priorBalanceTransactionsByPatient[1].PatientName).toEqual('Hazel Daniels');
        });

        it('should sort the ServiceTransactionDtos in each priorBalanceTransactionsByPatient by Patient then DateEntered oldest to newest', () => {
            component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
            expect(component.priorBalanceTransactionsByPatient[0].ServiceTransactionDtos[0].DateEntered).toEqual('2020-08-04 18:54:48.5599445');
            expect(component.priorBalanceTransactionsByPatient[1].ServiceTransactionDtos[0].DateEntered).toEqual('2020-08-02 18:54:48.5599445');
            expect(component.priorBalanceTransactionsByPatient[1].ServiceTransactionDtos[1].DateEntered).toEqual('2020-08-16 18:54:48.5599445');
        });

        it('should calculate priorBalanceTransactionsByPatient.BalanceDue to be the sum of Balance from the ServiceTransactionDtos ' +
            'in each group if IsDeleted is false', () => {
                component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
                expect(component.priorBalanceTransactionsByPatient[0].ServiceTransactionDtos[0].Balance).toBe(200);
                expect(component.priorBalanceTransactionsByPatient[0].BalanceDue).toBe(200);

                component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
                expect(component.priorBalanceTransactionsByPatient[1].ServiceTransactionDtos[0].Balance).toBe(100);
                expect(component.priorBalanceTransactionsByPatient[1].ServiceTransactionDtos[1].Balance).toBe(200);
                expect(component.priorBalanceTransactionsByPatient[1].BalanceDue).toBe(300);
            });

        it('should include priorAdjustments in allDebitTransactions', () => {
            priorAdjustments = cloneDeep(mockPriorAdjustments);
            component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
            expect(component.priorBalanceTransactionsByPatient[0].BalanceDue).toBe(400);
            expect(component.priorBalanceTransactionsByPatient[1].BalanceDue).toBe(600);
        });

        it('should not include Balance from ServiceTransaction if IsDeleted is false', () => {
            priorAdjustments = [];
            checkedOutEncounters[0].ServiceTransactionDtos[0].IsDeleted = true;
            component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
            expect(component.priorBalanceTransactionsByPatient[0].BalanceDue).toBe(200);
            expect(component.priorBalanceTransactionsByPatient[1].BalanceDue).toBe(300);
        });


        it('should add debitTransaction to encounter and then add encounter to priorBalances', () => {
            priorAdjustments = [];
            checkedOutEncounters[0].ServiceTransactionDtos[0].IsDeleted = true;
            component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
        });

        it('should call updateTotals', () => {
            checkedOutEncounters[0].ServiceTransactionDtos[0].IsDeleted = true;
            component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
            expect(component.updateTotals).toHaveBeenCalled();
        });

        it('should call loadServiceAndDebitTransactionDtos', () => {
            checkedOutEncounters[0].ServiceTransactionDtos[0].IsDeleted = true;
            component.loadAllDebitTransactions(checkedOutEncounters, priorAdjustments);
            expect(component.loadServiceAndDebitTransactionDtos).toHaveBeenCalled();
        });
    });

    describe('getDebitTransactionsByAccountId method', () => {
        beforeEach(() => {
            component.accountId = '1234';
            component.creditTransactionDto = new CreditTransaction();
        });

        it('should call patientServices.Encounter.getDebitTransactionsByAccountId ', () => {
            component.getDebitTransactionsByAccountId();
            expect(mockPatientServices.Encounter.getDebitTransactionsByAccountId)
                .toHaveBeenCalledWith({ accountId: '1234', includeFinanceCharge: true }, jasmine.any(Function), jasmine.any(Function));
        });
    });

    describe('addBenefitPlanData method', () => {
        let encounter;

        beforeEach(() => {
            // encounter = cloneDeep(mockEncounters[0]);
            encounter = JSON.parse(JSON.stringify(mockEncounter));
            encounter.AccountMemberId = '1235';
            component.accountMembersDetails = [
                { AccountMemberId: '1234', PersonId: '2345' },
                { AccountMemberId: '1235', PersonId: '2346' },
                { AccountMemberId: '1236', PersonId: '2347' }];
            component.allMemberPlans = [
                {
                    PatientId: '2346', BenefitPlanId: 5, PolicyHolderBenefitPlanDto:
                        { BenefitPlanDto: { Name: 'Plan1', CarrierName: 'Carrier1', ApplyAdjustments: 1, FeesIns: 2 } },
                    PatientBenefitPlanId: 10, Priority: 0
                },
                {
                    PatientId: '1235', BenefitPlanId: 7, PolicyHolderBenefitPlanDto:
                        { BenefitPlanDto: { Name: 'Plan3', CarrierName: 'Carrier3', ApplyAdjustments: 1, FeesIns: 2 } },
                    PatientBenefitPlanId: 30, Priority: 1
                },
                {
                    PatientId: 1, BenefitPlanId: 6, PolicyHolderBenefitPlanDto:
                        { BenefitPlanDto: { Name: 'Plan2', CarrierName: 'Carrier2', ApplyAdjustments: 1, FeesIns: 1 } },
                    PatientBenefitPlanId: 20, Priority: 2
                },
            ];

            encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                serviceTransaction.InsuranceEstimates.push({ AdjEst: 0, EstInsurance: 120 });
            });


        });

        it('should set benefitPlan on encounter if finds matching plan in allMemberPlans', () => {
            encounter.AccountMemberId = '1235';
            component.addBenefitPlanData(encounter);
            expect(encounter.benefitPlan.BenefitPlanId).toBe(5);
        });

        it('should set benefitPlan on encounter to null if no matching plan in allMemberPlans', () => {
            encounter.AccountMemberId = '1237';
            component.addBenefitPlanData(encounter);
            expect(encounter.benefitPlan).toBe(null);
        });
    });
    
   describe('getDebitTransactionDetail method', () => {
    beforeEach(() => {
        component.creditTransactionDto = new CreditTransaction();
        component.creditTransactionDto.CreditTransactionDetails = [];
        component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId:null, AccountMemberId: '123456', Amount:200 });
        component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToDebitTransactionId: '1235', AppliedToServiceTransationId: null, AccountMemberId: '123456' , Amount:125});
        component.priorBalances = [{
            EncounterId: '1236', AccountMemberId: '123456', ServiceTransactionDtos: [
                { DebitTransactionId: '2345' }, { ServiceTransactionId: '1112' }]
        }, {
            EncounterId: '12376', AccountMemberId: '123456', ServiceTransactionDtos: [
                { ServiceTransactionId: '2111' }, { ServiceTransactionId: '2112' }]
        }];
    });

    it('should return matching detail from creditTransactionDto.CreditTransactionDetails if found', () => {
        const debitTransactionId = '1234';
        expect(component.getDebitTransactionDetail(debitTransactionId)).toEqual(
            component.creditTransactionDto.CreditTransactionDetails[0]);
    });

    it('should return matching detail from priorBalances if match for creditTransactionDto.CreditTransactionDetails not found', () => {
        const debitTransactionId = '2345';
        expect(component.getDebitTransactionDetail(debitTransactionId)).toEqual(
            { AppliedToDebitTransactionId: '2345', Amount: 0, EncounterId: '1236', AccountMemberId: '123456' });
    });

    it('should return calculated detail if match not found', () => {
        const debitTransactionId = '3111';
        expect(component.getDebitTransactionDetail(debitTransactionId)).toEqual(
            { AppliedToDebitTransactionId: '3111', Amount: 0, EncounterId: null, AccountMemberId: null });
    });
});


    describe('getServiceDetail method', () => {
        beforeEach(() => {
            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.CreditTransactionDetails = [];
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1234', AccountMemberId: '123456' });
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1235', AccountMemberId: '123456' });
            component.priorBalances = [{
                EncounterId: '1236', AccountMemberId: '123456', ServiceTransactionDtos: [
                    { ServiceTransactionId: '1111' }, { ServiceTransactionId: '1112' }]
            }, {
                EncounterId: '12376', AccountMemberId: '123456', ServiceTransactionDtos: [
                    { ServiceTransactionId: '2111' }, { ServiceTransactionId: '2112' }]
            }];
        });

        it('should return matching detail from creditTransactionDto.CreditTransactionDetails if found', () => {
            const serviceTransactionId = '1234';
            expect(component.getServiceDetail(serviceTransactionId)).toEqual(
                component.creditTransactionDto.CreditTransactionDetails[0]);
        });

        it('should return matching detail from priorBalances if match for creditTransactionDto.CreditTransactionDetails not found', () => {
            const serviceTransactionId = '2111';
            expect(component.getServiceDetail(serviceTransactionId)).toEqual(
                { AppliedToServiceTransationId: '2111', Amount: 0, EncounterId: '12376', AccountMemberId: '123456' });
        });

        it('should return calculated detail if match not found', () => {
            const serviceTransactionId = '3111';
            expect(component.getServiceDetail(serviceTransactionId)).toEqual(
                { AppliedToServiceTransationId: '3111', Amount: 0, EncounterId: null, AccountMemberId: null });
        });
    });

    describe('calculateFeeScheduleAdjustment', () => {
        let encounter;
        beforeEach(() => {
            const mockBenefitPlan = {
                PatientId: '2345', BenefitPlanId: 5, PatientBenefitPlanId: 10, Priority: 0,
                PolicyHolderBenefitPlanDto:
                    { BenefitPlanDto: { Name: 'Plan5', Carrier: { Name: 'Carrier5' }, ApplyAdjustments: 1, FeesIns: 2 } }
            };
            encounter = {
                EncounterId: '100', hasAdjustedEstimate: true, benefitPlan: mockBenefitPlan,
                hasFeeScheduleAdjustments: true, Date: '2020-08-31', PatientName: 'Bob Frapples', CreateClaim: true,
                ServiceTransactionDtos: [
                    {
                        ServiceTransactionId: 1001, ServiceCodeId: '1234', AdjustmentAmount: 0,
                        Balance: 50.00, CreateClaim: true, Charges: 201.88,
                        InsuranceEstimates: [{
                            AdjEst: 40,
                            EstInsurance: 95.69,
                            PatientBenefitPlanId: '10',
                        },]
                    },
                    {
                        ServiceTransactionId: 1006, ServiceCodeId: '1234', AdjustmentAmount: 0,
                        Balance: 50.00, CreateClaim: true, Charges: 201.88,
                        InsuranceEstimates: [{
                            AdjEst: 40,
                            EstInsurance: 95.69,
                            PatientBenefitPlanId: '10',
                        },]
                    },
                    {
                        ServiceTransactionId: 1002, ServiceCodeId: '1236', AdjustmentAmount: 0,
                        Balance: 25.00, CreateClaim: true, Charges: 223.25,
                        InsuranceEstimates: [{
                            AdjEst: 0,
                            EstInsurance: 200.92,
                            PatientBenefitPlanId: '10',
                        }]
                    },
                ]
            };

            component.negativeAdjustmentTypes = [{
                AdjustmentTypeId: 123, Description: 'AdjustmentType123', IsDefaultTypeOnBenefitPlan: true,
            }, {
                AdjustmentTypeId: 124, Description: 'AdjustmentType124', IsDefaultTypeOnBenefitPlan: false,
            }, {
                AdjustmentTypeId: 125, Description: 'AdjustmentType125', IsDefaultTypeOnBenefitPlan: true,
            }];
            encounter = {
                EncounterId: '100', AccountMemberId: '1235', hasAdjustedEstimate: true,
                hasFeeScheduleAdjustments: true, Date: '2020-08-31', PatientName: 'Bob Frapples',
                benefitPlan: {
                    PatientId: '2345', BenefitPlanId: 5, PatientBenefitPlanId: 10, Priority: 0,
                    PolicyHolderBenefitPlanDto:
                        { BenefitPlanDto: { Name: 'Plan5', Carrier: { Name: 'Carrier5' }, ApplyAdjustments: 1, FeesIns: 2, AdjustmentTypeId: 123 } }
                },
                ServiceTransactionDtos: [
                    {
                        ServiceTransactionId: 1003, AdjustmentAmount: null, Charges: 120.00,
                        Balance: 30.00, CreateClaim: true, ProviderOnClaimsId: '123457',
                        InsuranceEstimates: [{
                            AdjEst: 50,
                            TotalEstInsurance: 90,
                            TotalAdjEstimate: 0,
                            EstInsurance: 90,
                            PatientBenefitPlanId: '11',
                        }]
                    },
                    {
                        ServiceTransactionId: 1004, AdjustmentAmount: 0, Charges: 120.00,
                        Balance: 50.00, CreateClaim: true, ProviderOnClaimsId: '123456',
                        InsuranceEstimates: [{
                            AdjEst: 50,
                            TotalEstInsurance: 70,
                            TotalAdjEstimate: 0,
                            EstInsurance: 70,
                            PatientBenefitPlanId: '11',
                        }, {
                            AdjEst: 0,
                            TotalEstInsurance: 50,
                            TotalAdjEstimate: 0,
                            EstInsurance: 50,
                            PatientBenefitPlanId: '11',
                        },]
                    },]
            };
        });

        it('should calculate the encounter.FeeScheduleAdjustment to be total InsuranceEstimates[0].AdjEst ' +
            ' if encounter.hasFeeScheduleAdjustments is true and serviceTransaction.CreateClaim is true ', () => {
                encounter.hasFeeScheduleAdjustments = true;
                component.calculateFeeScheduleAdjustment(encounter);
                expect(encounter.FeeScheduleAdjustment).toEqual(100);
            });

        it('should calculate the encounter.FeeScheduleAdjustment to be 0 if encounter.hasFeeScheduleAdjustments is false ', () => {
            encounter.hasFeeScheduleAdjustments = false;
            component.calculateFeeScheduleAdjustment(encounter);
            expect(encounter.FeeScheduleAdjustment).toEqual(0);

        });
    });

    
    describe('buildFeeScheduleAdjustment', () => {
        const result = { Value: [{ Amount: 50 }] };
        let adjustmentEncounter;
        beforeEach(() => {
            component.creditTransactionDtoList = [{ OriginalPosition: 0 }, { OriginalPosition: 1 }];
            const description = 'fake description';
            const creditTransactionDto = new CreditTransaction();
            creditTransactionDto.CreditTransactionDetails = [];
            spyOn(component, 'updateCreditTransactionDtoDetailsSuccess').and.callFake(() => { });           
            spyOn(component, 'addCreditTransactionDescription').and.callFake(() => description);
            spyOn(component, 'createCreditTransactionsForFeeScheduleAdjustments').and.callFake(() => { });
            adjustmentEncounter = {
                EncounterId: '789', AccountMemberId: '1234', hasAdjustedEstimate: true,
                benefitPlan: {
                    PatientId: '2345', BenefitPlanId: 5, PatientBenefitPlanId: 10, Priority: 0,
                    PolicyHolderBenefitPlanDto:
                        { BenefitPlanDto: { Name: 'Plan1', CarrierName: 'Carrier1', ApplyAdjustments: 1, FeesIns: 2, AdjustmentTypeId: 1234 } }
                },
                ServiceTransactionDtos: [
                    {
                        AccountMemberId: '1234',
                        EncounterId: '789',
                        Balance: 0,
                        CreateClaim: true,
                        ServiceTransactionId: '1111',
                        InsuranceEstimates: [{
                            AdjEst: 50
                        }]
                    },
                    {
                        AccountMemberId: '1234',
                        EncounterId: '789',
                        Balance: 0,
                        CreateClaim: true,
                        ServiceTransactionId: '1112',
                        InsuranceEstimates: [{
                            AdjEst: 25
                        }]
                    },
                ]
            };
        });

        it('should only include serviceTransaction.InsuranceEstimates.AdjEst in distributionParams.amount if CreateClaim is true ', () => {
            adjustmentEncounter.ServiceTransactionDtos[0].InsuranceEstimates[0].AdjEst = 45.00;
            adjustmentEncounter.ServiceTransactionDtos[0].CreateClaim = false;
            adjustmentEncounter.ServiceTransactionDtos[1].InsuranceEstimates[0].AdjEst = 25.00;
            adjustmentEncounter.ServiceTransactionDtos[1].CreateClaim = true;
            component.creditTransactionDtoList = [{ OriginalPosition: 1, }, { OriginalPosition: 2 }];
            component.buildFeeScheduleAdjustment(adjustmentEncounter);
            expect(mockPatientServices.CreditTransactions.creditDistributionForSelectedServiceTransactions.calls.first().args[0]).
                toEqual({accountMemberId:'1234', uiSuppressModal: true, amount:25.00});
        });

        it('should set boolean properties for isFeeScheduleAdjustment ', () => {
            component.buildFeeScheduleAdjustment(adjustmentEncounter);
            expect(component.isFeeScheduleAdjustment).toBe(true);
        });

        it('should patientServices.CreditTransactions.creditDistributionForSelectedServiceTransactions to have been called with ', () => {
            component.creditTransactionDtoList = [{ OriginalPosition: 1, }, { OriginalPosition: 2 }];
            component.buildFeeScheduleAdjustment(adjustmentEncounter);
            expect(mockPatientServices.CreditTransactions.creditDistributionForSelectedServiceTransactions).toHaveBeenCalled();
        });
        
    });

  
    describe('setFeeScheduleAdjustmentDates', () => {
        let allEncounters = [];
        let creditTransactionList = [];
        let encounterCreditTransactionCheckoutDto = { Encounters: null, CreditTransactions: null, CreditPaymentOrder: [] };
        // tslint:disable-next-line: no-trailing-whitespace
        beforeEach(() => {
            allEncounters = [{
                PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235',
                ServiceTransactionDtos: [
                    {
                        Adjustment: 0,
                        AccountMemberId: '1235',
                        ServiceTransactionId: '1111',
                        AdjustmentAmount: 0,
                        InsuranceEstimates: [],
                        AgingDate: '2020-09-25',
                        ProviderUserId: '2525',
                    },
                    {
                        Adjustment: 0,
                        AccountMemberId: '1235',
                        ServiceTransactionId: '1112',
                        $$ObjectWasUpdated: true,
                        AdjustmentAmount: 0,
                        InsuranceEstimates: [],
                        AgingDate: '2020-09-30',
                        ProviderUserId: '2526'
                    }
                ]
            }];
            creditTransactionList = [
                {
                    OriginalPosition: 1, IsFeeScheduleWriteOff: true, FeeScheduleAdjustmentForEncounterId: 1234,
                    CreditTransactionDetails: [{ AppliedToServiceTransationId: '1111' }]
                },
                {
                    OriginalPosition: 2, IsFeeScheduleWriteOff: true, FeeScheduleAdjustmentForEncounterId: 1235,
                    CreditTransactionDetails: [{ AppliedToServiceTransationId: '1112' }]
                }
            ];

            encounterCreditTransactionCheckoutDto = {
                Encounters: allEncounters,
                CreditTransactions: creditTransactionList,
                CreditPaymentOrder: []
            };
        });

        it('should not set the DateEntered on each creditTransactionDto based on ' +
            'the encounter that matches the creditTransactions.FeeScheduleAdjustmentForEncounterId and' +
            'the serviceTransaction that matches the creditTransaction.CreditTransactionDetails[0].AppliedToServiceTransationId ' +
            'if no creditTransaction.CreditTransactionDetails', () => {
                encounterCreditTransactionCheckoutDto.CreditTransactions = [
                    {
                        OriginalPosition: 1, IsFeeScheduleWriteOff: true, FeeScheduleAdjustmentForEncounterId: 1234,
                        CreditTransactionDetails: []
                    },
                ];
                const associatedService = allEncounters[0].ServiceTransactionDtos.find(
                    serviceTransaction => serviceTransaction.ServiceTransactionId === '1111');
                component.setFeeScheduleAdjustmentDates(encounterCreditTransactionCheckoutDto);
                encounterCreditTransactionCheckoutDto.CreditTransactions.forEach(creditTransaction => {
                    expect(creditTransaction.DateEntered = null);
                });
            });

        it('should set the DateEntered on each creditTransactionDto based on ' +
            'the encounter that matches the creditTransactions.FeeScheduleAdjustmentForEncounterId and' +
            'the serviceTransaction that matches the creditTransaction.CreditTransactionDetails[0].AppliedToServiceTransationId ' +
            'if any and if creditTransaction.IsFeeScheduleWriteOff is true', () => {
                const associatedService = allEncounters[0].ServiceTransactionDtos.find(
                    serviceTransaction => serviceTransaction.ServiceTransactionId === '1111');
                component.setFeeScheduleAdjustmentDates(encounterCreditTransactionCheckoutDto);
                encounterCreditTransactionCheckoutDto.CreditTransactions.forEach(creditTransaction => {
                    const associatedService = allEncounters[0].ServiceTransactionDtos.find(
                        serviceTransaction => serviceTransaction.ServiceTransactionId === creditTransaction.AppliedToServiceTransationId);
                    if (associatedService) {
                        expect(creditTransaction.DateEntered = associatedService.AgingDate);
                    }
                });
            });

        it('should set the creditTransaction.CreditTransactionDetail.DateEntered and ProviderUserId on each creditTransactionDto based on ' +
            'the encounter that matches the creditTransactions.FeeScheduleAdjustmentForEncounterId and' +
            'the serviceTransaction that matches the creditTransaction.CreditTransactionDetails[0].AppliedToServiceTransationId ' +
            'if any and if creditTransaction.IsFeeScheduleWriteOff is true', () => {
                const associatedService = allEncounters[0].ServiceTransactionDtos.find(
                    serviceTransaction => serviceTransaction.ServiceTransactionId === '1111');
                component.setFeeScheduleAdjustmentDates(encounterCreditTransactionCheckoutDto);
                encounterCreditTransactionCheckoutDto.CreditTransactions.forEach(creditTransaction => {
                    const associatedService = allEncounters[0].ServiceTransactionDtos.find(
                        serviceTransaction => serviceTransaction.ServiceTransactionId === creditTransaction.AppliedToServiceTransationId);
                    if (associatedService) {
                        creditTransaction.CreditTransactionDetails.forEach(creditTransactionDetail => {
                            creditTransactionDetail.DateEntered = associatedService.AgingDate;
                            creditTransactionDetail.ProviderUserId = associatedService.ProviderUserId;
                        });
                    }
                });
            });
    });


    describe('loadServiceAndDebitTransactionDtos method', () => {
        beforeEach(() => {
            component.priorBalances = [
                {
                    PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235',
                    ServiceTransactionDtos: [
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        },
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        }
                    ]

                },];
            component.allEncounters = [
                {
                    PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235',
                    ServiceTransactionDtos: [
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        },
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        }
                    ]

                },
                {
                    PatientName: 'Hazel Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1234',
                    ServiceTransactionDtos: [
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        },
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        }
                    ]
                },];
            spyOn(component, 'getServiceTransactionInsuranceList').and.callFake(() => { });
            spyOn(component, 'getServiceDetail').and.callFake(() => { });
            spyOn(component, 'getDebitTransactionDetail');
        });

        it('should load each serviceTransaction from allEncounters and priorBalances to serviceAndDebitTransactionDtos if includePriorBalance is true ', () => {
            component.includePriorBalance = true;
            component.loadServiceAndDebitTransactionDtos();
            expect(component.serviceAndDebitTransactionDtos.length).toEqual(6);
        });

        it('should add encounterType of Current to each serviceTransaction  from allEncounters to serviceAndDebitTransactionDtos', () => {
            component.includePriorBalance = false;
            component.loadServiceAndDebitTransactionDtos();
            component.serviceAndDebitTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.EncounterType).toEqual('Current');
            });
        });

        it('should load each serviceTransaction from allEncounters to serviceAndDebitTransactionDtos if includePriorBalance is false ', () => {
            component.includePriorBalance = false;
            component.loadServiceAndDebitTransactionDtos();
            expect(component.serviceAndDebitTransactionDtos.length).toEqual(4);
        });

        it('should add encounterType of Prior to each serviceTransaction  from priorBalances to serviceAndDebitTransactionDtos', () => {
            component.includePriorBalance = true;
            component.allEncounters = [];
            component.loadServiceAndDebitTransactionDtos();
            component.serviceAndDebitTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.EncounterType).toEqual('Prior');
            });
        });

        it('should call getServiceDetail for each serviceTransaction', () => {
            component.includePriorBalance = true;
            component.loadServiceAndDebitTransactionDtos();
            component.serviceAndDebitTransactionDtos.forEach(serviceTransaction => {
                if (serviceTransaction.DebitTransactionId ===null || serviceTransaction.DebitTransactionId === undefined ){
                    expect(component.getServiceDetail).toHaveBeenCalled();
                }
            });
        });

        it('should call getDebitTransactionDetail for each debitTransaction in priorBalances.ServiceTransactionDtos', () => {
            component.priorBalances[0].ServiceTransactionDtos.push({
                Adjustment: 0,                
                AccountMemberId: '1235',
                ServiceTransactionId: null,
                AdjustmentAmount: 0,
                DebitTransactionId: '1236',
            });
            component.includePriorBalance = true;
            component.loadServiceAndDebitTransactionDtos();
            component.serviceAndDebitTransactionDtos.forEach(transaction => {
                if (transaction.DebitTransactionId !== null && transaction.DebitTransactionId !== undefined ){
                    expect(component.getDebitTransactionDetail).toHaveBeenCalled();
                }
            });
        });
    });

    describe('getPatientNamesFromEncounters', () => {
        beforeEach(() => {
            component.priorBalances = [
                { PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ServiceTransactionDtos: [] },
                { PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ServiceTransactionDtos: [] },
                { PatientName: 'Bill Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1236', ServiceTransactionDtos: [] },];
            component.allEncounters = [
                { PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ServiceTransactionDtos: [] },
                { PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ServiceTransactionDtos: [] },
                { PatientName: 'Hazel Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1234', ServiceTransactionDtos: [] },
                { PatientName: 'Hazel Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1234', ServiceTransactionDtos: [] }];

        });

        it('should create a unique list of PatientNames and AccountMemberIds from pending encounters ', () => {
            const encounterNames = component.getPatientNamesFromEncounters();
            expect(encounterNames).toEqual([
                { AccountMemberId: '1235', PatientName: 'Charley Daniels' },
                { AccountMemberId: '1234', PatientName: 'Hazel Daniels' },
            ]);
        });
    });

    describe('beginCheckout', () => {
        let hasInvalidCodes = false;
        let serviceTransactionsEstimates;
        let servicesToExclude;    
        beforeEach(() => {
            serviceTransactionsEstimates =  [{}, {}];
            servicesToExclude = ['',''];
            component.calculateServiceEstimates = jasmine.createSpy().and.callFake(() => {
                return {
                    then(callback) {
                        callback({});
                    }
                };
            })
            spyOn(component, 'getServiceTransactionEstimatesList').and.callFake(() => serviceTransactionsEstimates);
            spyOn(component, 'getServicesToExclude').and.callFake(() => servicesToExclude);
            spyOn(component, 'continueCheckout').and.callFake(() => { });
            spyOn(component, 'hasInvalidServiceCodes').and.callFake(() => hasInvalidCodes);
            component.creditTransactionDtoList = [
                { CreditTransactionDetails: [{ Amount: 50 }] },
                { CreditTransactionDetails: [{ Amount: 100 }] },];
            component.allEncounters = [
                {
                    PatientName: 'Charley Daniels', EncounterId: 8888, Status: 2, AccountMemberId: '1235',
                    ServiceTransactionDtos: [
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        },
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            $$ObjectWasUpdated: true,
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        }
                    ]

                },
                {
                    PatientName: 'Hazel Daniels', EncounterId: 9999, Status: 2, AccountMemberId: '1234',
                    ServiceTransactionDtos: [
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            $$ObjectWasUpdated: true,
                            InsuranceEstimates: []
                        },
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        }
                    ]
                }
            ];
            spyOn(component, 'checkServicesForErrors');
            spyOn(component, 'promptToSaveOrRollbackDistribution');
        });

        it('should call promptToSaveOrRollbackDistribution only if hasDistributionChanges is true', () => {
            component.hasDistributionChanges = true;
            component.beginCheckout();           
            expect(component.promptToSaveOrRollbackDistribution).toHaveBeenCalled();
        });

        it('should not process hasInvalidServiceCodes call', () => {
            component.hasDistributionChanges = true;
            component.beginCheckout(); 
            expect(component.hasInvalidServiceCodes).not.toHaveBeenCalled();
        });

        it('should not proceed with checkout if hasInvalidServiceCodes returns true', () => {
            hasInvalidCodes = true;
            component.beginCheckout();
            expect(component.getServiceTransactionEstimatesList).not.toHaveBeenCalled();
        });


        it('should clear out any creditTransactionDtoList CreditTransactionDetail rows if Amount is 0 or less (Should ignore ObjectState)' +
            ' if patientCheckoutService.checkForAffectedAreaChanges returns emptyList', () => {
                hasInvalidCodes = false;
                component.creditTransactionDtoList = [
                    { CreditTransactionDetails: [{ Amount: 0 }, { Amount: 10,  ObjectState: 'Delete' }, { Amount: 20 }, {Amount: 0, ObjectState: 'Delete'}] },
                    { CreditTransactionDetails: [{ Amount: 10 }, { Amount: 20 }, { Amount: 0 }] },
                ];
                component.allEncounters.forEach(encounter => {
                    encounter.ServiceTransactionDtos.forEach(serviceTransaction => {
                        serviceTransaction.$$ObjectWasUpdated = false;
                    });
                });
                component.beginCheckout();
                expect(component.creditTransactionDtoList[0].CreditTransactionDetails.length).toEqual(2);
                expect(component.creditTransactionDtoList[1].CreditTransactionDetails.length).toEqual(2);
                expect(component.creditTransactionDtoList[0].CreditTransactionDetails[0].Amount).toEqual(10);
                expect(component.creditTransactionDtoList[0].CreditTransactionDetails[1].Amount).toEqual(20);
                expect(component.creditTransactionDtoList[1].CreditTransactionDetails[0].Amount).toEqual(10);
                expect(component.creditTransactionDtoList[1].CreditTransactionDetails[1].Amount).toEqual(20);
            });

        it('should call component.getServiceTransactionInsuranceList and getServicesToExclude if servicesHaveBeenReEstimated is false and' +
            ' patientCheckoutService.checkForAffectedAreaChanges returns emptyList', () => {
                hasInvalidCodes = false;
                component.creditTransactionDtoList = [
                    { CreditTransactionDetails: [{ Amount: 0 }, { Amount: 10 }, { Amount: 20 }] },
                    { CreditTransactionDetails: [{ Amount: 10 }, { Amount: 20 }, { Amount: 0 }] },
                ];
                component.servicesHaveBeenReEstimated = false;
                component.beginCheckout();
                expect(component.getServiceTransactionEstimatesList).toHaveBeenCalled();
                expect(component.getServicesToExclude).toHaveBeenCalled();
            });

        it('should call component.calculateServiceEstimates  if servicesHaveBeenReEstimated is false and' +
            ' patientCheckoutService.checkForAffectedAreaChanges returns emptyList', () => {
                hasInvalidCodes = false;
                component.creditTransactionDtoList = [
                    { CreditTransactionDetails: [{ Amount: 0 }, { Amount: 10 }, { Amount: 20 }] },
                    { CreditTransactionDetails: [{ Amount: 10 }, { Amount: 20 }, { Amount: 0 }] },
                ];
                component.servicesHaveBeenReEstimated = false;
                component.beginCheckout();
                expect(component.calculateServiceEstimates).toHaveBeenCalledWith(serviceTransactionsEstimates, servicesToExclude, component.feeScheduleAdjustmentRemoved);
            });

        it('should call checkout after component.calculateServiceEstimates resolves ', (done) => {
            hasInvalidCodes = false;
            component.creditTransactionDtoList = [
                { CreditTransactionDetails: [{ Amount: 0 }, { Amount: 10 }, { Amount: 20 }] },
                { CreditTransactionDetails: [{ Amount: 10 }, { Amount: 20 }, { Amount: 0 }] },
            ];
            component.feeScheduleAdjustmentRemoved = [];
            component.servicesHaveBeenReEstimated = false;
            component.beginCheckout();
            component.calculateServiceEstimates(serviceTransactionsEstimates, servicesToExclude, component.feeScheduleAdjustmentRemoved).then((result) => {
                expect(component.continueCheckout).toHaveBeenCalled();
                done();
            });
        });

        it('should call checkout without calling calculateServiceEstimates if servicesHaveBeenReEstimated is true', () => {
            hasInvalidCodes = false;
            component.creditTransactionDtoList = [
                { CreditTransactionDetails: [{ Amount: 0 }, { Amount: 10 }, { Amount: 20 }] },
                { CreditTransactionDetails: [{ Amount: 10 }, { Amount: 20 }, { Amount: 0 }] },
            ];
            component.servicesHaveBeenReEstimated = true;
            component.beginCheckout();
            expect(component.calculateServiceEstimates).not.toHaveBeenCalled();
            expect(component.continueCheckout).toHaveBeenCalled();
        });
    });


    describe('updateCreditTransactionDtoDetailsSuccess', () => {
        let res;
        let creditTransactionDetails;
        beforeEach(() => {
            creditTransactionDetails = [{}, {}];
            res = { Value: creditTransactionDetails };
            component.serviceAndDebitTransactionDtos = [{}, {}];
            spyOn(component, 'loadServiceAndDebitTransactionDtos').and.callFake(() => { });
            spyOn(component, 'addCreditDistribution').and.callFake(() => { });
            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.CreditTransactionDetails = [];
            spyOn(component, 'checkHasPriorBalanceDistributions');
            spyOn(component, 'setAccountMemberIdOnUnapplied');
        });

        it('should call checkHasPriorBalanceDistributions to set creditTransactionDto.hasPriorBalanceAmounts', () => {
            component.addCreditTransactionToList = true;
            component.updateCreditTransactionDtoDetailsSuccess(res);
            expect(component.checkHasPriorBalanceDistributions).toHaveBeenCalled();
        });

        it('should call addCreditDistribution if addCreditTransactionToList is true', () => {
            component.addCreditTransactionToList = true;
            component.updateCreditTransactionDtoDetailsSuccess(res);
            expect(component.addCreditDistribution).toHaveBeenCalled();
        });

        it('should not call addCreditDistribution if addCreditTransactionToList is false', () => {
            component.addCreditTransactionToList = false;
            component.updateCreditTransactionDtoDetailsSuccess(res);
            expect(component.addCreditDistribution).not.toHaveBeenCalled();
        });

        it('should match distribution by AppliedToDebitTransactionId if not null', () => {
            component.creditTransactionDto.CreditTransactionDetails = [
                {AppliedToDebitTransactionId: '1234', Amount:0},
                {AppliedToServiceTransationId: '1235', Amount:0} ];
            let res = {Value:[{AppliedToDebitTransactionId: '1234', Amount: 200}, 
            {AppliedToServiceTransationId: '1235', Amount:125}]}
            component.updateCreditTransactionDtoDetailsSuccess(res);
            expect(component.creditTransactionDto.CreditTransactionDetails[0].Amount).toBe(200);
        });

        it('should match distribution by AppliedToServiceTransationId if not null', () => {
            component.creditTransactionDto.CreditTransactionDetails = [
                {AppliedToDebitTransactionId: '1234', Amount:0},
                {AppliedToServiceTransationId: '1235', Amount:0} ];
            let res = {Value:[{AppliedToDebitTransactionId: '1234', Amount: 200},
             {AppliedToServiceTransationId: '1235', Amount:125}]}
            component.updateCreditTransactionDtoDetailsSuccess(res);
            expect(component.creditTransactionDto.CreditTransactionDetails[1].Amount).toBe(125)
        });

        it('should set serviceAndDebitTransactionDtos.Amount by match distribution in priorBalance by AppliedToDebitTransactionId if not null', () => {
            component.serviceAndDebitTransactionDtos = [
                {DebitTransactionId: '1234', Amount:10},
                {ServiceTransactionId:'2345', Amount:10},
                {ServiceTransactionId:'2346', Amount: 30}
            ]
            component.priorBalances = [
                {EncounterId:'666', Amount: 0},
                {EncounterId:'777', Amount: 0}
            ];
            component.creditTransactionDto.CreditTransactionDetails = [
                {AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount:200, EncounterId: '666'},
                {AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '1235', Amount:0, EncounterId: '777'}, ];
            let res = {Value:[{AppliedToDebitTransactionId: '1234', Amount: 200, EncounterId:'666'}, {AppliedToServiceTransationId: '1235', Amount:125, EncounterId:'777'}]}
            component.updateCreditTransactionDtoDetailsSuccess(res);
            expect(component.serviceAndDebitTransactionDtos[0].Amount).toBe(200);
            
        });

        it('should set serviceAndDebitTransactionDtos.Amount by match distribution in priorBalance by AppliedToServiceTransationId if '+
            'not null and AppliedToDebitTransactionId is null', () => {
            component.serviceAndDebitTransactionDtos = [
                {DebitTransactionId: '1234', Amount:10},
                {ServiceTransactionId:'2345', Amount:10},
                {ServiceTransactionId:'2346', Amount: 30}
            ];
            component.priorBalances = [
                {EncounterId:'666', Amount: 0},
                {EncounterId:'777', Amount: 0}
            ];
            component.creditTransactionDto.CreditTransactionDetails = [
                {AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount:0, EncounterId: '666'},
                {AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '2345', Amount:0, EncounterId: '777'}, ];

            let res = {Value:[
                {AppliedToDebitTransactionId: '1234', Amount: 200, EncounterId:'666'}, 
                {AppliedToServiceTransationId: '2345', Amount:125, EncounterId:'777'}]}
            component.updateCreditTransactionDtoDetailsSuccess(res);
            expect(component.serviceAndDebitTransactionDtos[1].Amount).toBe(125);
            
        });

        it('should set serviceAndDebitTransactionDtos.Amount by match distribution in priorBalance by AppliedToServiceTransationId '+
            'if not null and AppliedToDebitTransactionId is null and creditTransactionDetail.EncounterId = priorBalance.EncounterId', () => {
            component.serviceAndDebitTransactionDtos = [
                {DebitTransactionId: '1234', Amount:10},
                {ServiceTransactionId:'2345', Amount:10},
                {ServiceTransactionId:'2346', Amount: 30}
            ];
            component.priorBalances = [
                {EncounterId:'666', Amount: 0},
                {EncounterId:'777', Amount: 0}
            ];
            component.creditTransactionDto.CreditTransactionDetails = [
                {AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount:0, EncounterId: '666'},
                {AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '2345', Amount:0, EncounterId: '777'}, ];

            let res = {Value:[
                {AppliedToDebitTransactionId: '1234', Amount: 200, EncounterId:'666'}, 
                {AppliedToServiceTransationId: '2345', Amount:125, EncounterId:'777'}]}
            component.updateCreditTransactionDtoDetailsSuccess(res);
            expect(component.serviceAndDebitTransactionDtos[1].Amount).toBe(125);
            
        });

        it('should set serviceAndDebitTransactionDtos.Amount by match distribution in priorBalance by AppliedToServiceTransationId '+
            'if not null and AppliedToDebitTransactionId is null', () => {
            component.serviceAndDebitTransactionDtos = [
                {DebitTransactionId: '1234', Amount:10},
                {ServiceTransactionId:'2345', Amount:10},
                {ServiceTransactionId:'2346', Amount: 30}
            ];
            component.priorBalances = [
                {EncounterId:'666', Amount: 0},
                {EncounterId:'777', Amount: 0}
            ];
            component.creditTransactionDto.CreditTransactionDetails = [
                {AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount:0, EncounterId: '666'},
                {AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '2345', Amount:0, EncounterId: '777'}, ];

            let res = {Value:[
                {AppliedToDebitTransactionId: '1234', Amount: 200, EncounterId:'666'}, 
                {AppliedToServiceTransationId: '2345', Amount:125, EncounterId:'777'}]}
            component.updateCreditTransactionDtoDetailsSuccess(res);
            expect(component.serviceAndDebitTransactionDtos[1].Amount).toBe(125);
            
        });

        it('should update properties in the unappliedCreditTransactionDetail record if AppliedToServiceTransationId '+
            'is null and AppliedToDebitTransactionId is null and unappliedCreditTransactionDetail exists', () => {
            component.serviceAndDebitTransactionDtos = [
                {AccountMemberId:'1234', DebitTransactionId: '1234', Amount:10},
                {AccountMemberId:'1234', ServiceTransactionId:'2345', Amount:10},
                {AccountMemberId:'1234', ServiceTransactionId:'2346', Amount: 30}
            ];
            component.priorBalances = [
                {EncounterId:'666', Amount: 0},
                {EncounterId:'777', Amount: 0}
            ];
            component.creditTransactionDto.CreditTransactionDetails = [
                {AccountMemberId:'1234', AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount:0, EncounterId: '666'},
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '2345', Amount:0, EncounterId: '777'},
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: null, Amount:0, EncounterId: null}, ];

            let res = {Value:[
                {AccountMemberId:'1234', AppliedToDebitTransactionId: '1234', Amount: 200, EncounterId:'666'}, 
                {AccountMemberId:'1234', AppliedToServiceTransationId: '2345', Amount:125, EncounterId:'777'},
                {AccountMemberId:'1234', AppliedToServiceTransationId: null, Amount: 99,EncounterId: null}]};
                component.updateCreditTransactionDtoDetailsSuccess(res);
                // find record for unapplied creditTransaction
                let unappliedCreditTransactionDetail = component.creditTransactionDto.CreditTransactionDetails.find(
                    x => x.AppliedToServiceTransationId === null && x.AppliedToDebitTransactionId === null );
                expect(unappliedCreditTransactionDetail.Amount).toEqual(99);
            
        });

        it('should add unappliedCreditTransactionDetail record if AppliedToServiceTransationId '+
        'is null and AppliedToDebitTransactionId is null and unappliedCreditTransactionDetail does not exist', () => {
            component.serviceAndDebitTransactionDtos = [
                {AccountMemberId:'1234', DebitTransactionId: '1234', Amount:10},
                {AccountMemberId:'1234', ServiceTransactionId:'2345', Amount:10},
                {AccountMemberId:'1234', ServiceTransactionId:'2346', Amount: 30}
            ];
            component.priorBalances = [
                {EncounterId:'666', Amount: 0},
                {EncounterId:'777', Amount: 0}
            ];
            component.creditTransactionDto.CreditTransactionDetails = [
                {AccountMemberId:'1234', AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount:0, EncounterId: '666'},
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '2345', Amount:0, EncounterId: '777'}, ];

            let res = {Value:[
                {AccountMemberId:'1234', AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount: 200, EncounterId:'666'}, 
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null, AppliedToServiceTransationId: '2345', Amount:125, EncounterId:'777'},
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null, AppliedToServiceTransationId: null, Amount: 99,EncounterId: null}]};
            component.updateCreditTransactionDtoDetailsSuccess(res);
            // find record for unapplied creditTransaction
            let unappliedCreditTransactionDetail = component.creditTransactionDto.CreditTransactionDetails.find(
                x => x.AppliedToServiceTransationId === null && x.AppliedToDebitTransactionId === null );
            expect(unappliedCreditTransactionDetail.Amount).toEqual(99);            
        });
        
        
        it('should add unappliedCreditTransactionDetailToDelete record after this.creditTransactionDto.CreditTransactionDetails redistribution '+
        'if this is a PaymentGatewayTransaction and if unappliedCreditTransactionDetailToDelete exists ', () => {
            component.creditTransactionDto.PaymentGatewayTransactionId = 555;
            component.serviceAndDebitTransactionDtos = [
                {AccountMemberId:'1234', DebitTransactionId: '1234', Amount:10},
                {AccountMemberId:'1234', ServiceTransactionId:'2345', Amount:10},
                {AccountMemberId:'1234', ServiceTransactionId:'2346', Amount: 30}
            ];
            component.accountMembersDetails = [
                { ResponsiblePersonId: '1111', PersonId: '1111', AccountMemberId:'1239' }
            ]
            component.priorBalances = [
                {EncounterId:'666', Amount: 0},
                {EncounterId:'777', Amount: 0}
            ];
            component.creditTransactionDto.CreditTransactionDetails = [
                {AccountMemberId:'1234', AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount:0, EncounterId: '666'},
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '2345', Amount:0, EncounterId: '777'}, ];

            let res = {Value:[
                {AccountMemberId:'1234', AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount: 200, EncounterId:'666'}, 
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null, AppliedToServiceTransationId: '2345', Amount:125, EncounterId:'777'},
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null, AppliedToServiceTransationId: null, Amount: 99,EncounterId: null}]};

            component.unappliedCreditTransactionDetailToDelete = {CreditTransactionDetailId:'1239', Amount:99, ObjectState:'Delete'}
            
            component.updateCreditTransactionDtoDetailsSuccess(res);
            expect(component.creditTransactionDto.CreditTransactionDetails.length).toBe(4);
            expect(component.creditTransactionDto.CreditTransactionDetails[3].CreditTransactionDetailId).toEqual('1239'); 
            expect(component.creditTransactionDto.CreditTransactionDetails[3].ObjectState).toEqual('Delete'); 
            expect(component.creditTransactionDto.CreditTransactionDetails[3].Amount).toEqual(99);            
        });
        
        it('should call setAccountMemberIdOnUnapplied if more than one unique AccountMemberId in CreditTransaction.CreditTransactionDetail', () => {
            component.creditTransactionDto.PaymentGatewayTransactionId = null;
            component.creditTransactionDto.CreditTransactionDetails = [
                {AccountMemberId:'1235', AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount:0, EncounterId: '666'},
                {AccountMemberId:'1236', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '2345', Amount:0, EncounterId: '777'}, ];

            let res = {Value:[
                {AccountMemberId:'1235', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '5588', Amount:30}, 
                {AccountMemberId:'1236', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '5678', Amount:110}, 
                {AccountMemberId:'1237', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: null, Amount:55} ]};
            component.updateCreditTransactionDtoDetailsSuccess(res);        
            expect(component.setAccountMemberIdOnUnapplied).toHaveBeenCalledWith(component.creditTransactionDto);
        });

        it('should not call setAccountMemberIdOnUnapplied if only one unique AccountMemberId in CreditTransaction.CreditTransactionDetail and '+
        ' PaymentGatewayTransactionId is null', () => {            
            component.creditTransactionDto.PaymentGatewayTransactionId = null;
            component.creditTransactionDto.CreditTransactionDetails = [
                {AccountMemberId:'1234', AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount:0, EncounterId: '666'},
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '2345', Amount:0, EncounterId: '777'}, ];

            let res = {Value:[                
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '5588', Amount:30}, 
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '5678', Amount:110}, 
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: null, Amount:55} ]};
            component.updateCreditTransactionDtoDetailsSuccess(res);
            expect(component.setAccountMemberIdOnUnapplied).not.toHaveBeenCalled();
        });

        it('should call setAccountMemberIdOnUnapplied if CreditTransaction.PaymentGatewayTransactionId is not null or undefined', () => {
            component.creditTransactionDto.PaymentGatewayTransactionId = '2345'; 
            component.creditTransactionDto.CreditTransactionDetails = [
                {AccountMemberId:'1235', AppliedToDebitTransactionId: '1234', AppliedToServiceTransationId: null, Amount:0, EncounterId: '666'},
                {AccountMemberId:'1235', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '2345', Amount:0, EncounterId: '777'}, ];

            let res = {Value:[                
                {AccountMemberId:'1235', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '5588', Amount:30}, 
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '5678', Amount:110}, 
                {AccountMemberId:'1234', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: null, Amount:55} ]};                   
                component.updateCreditTransactionDtoDetailsSuccess(res);           
            expect(component.setAccountMemberIdOnUnapplied).toHaveBeenCalledWith(component.creditTransactionDto);
        });
    });

    describe('setAccountMemberIdOnUnapplied', () => {
        beforeEach(() => {            
            component.accountMembersDetails = [
                { ResponsiblePersonId: '1111', PersonId: '1111', AccountMemberId:'1234' },
                { ResponsiblePersonId: '1111', PersonId: '1112', AccountMemberId:'1235' },
                { ResponsiblePersonId: '1111', PersonId: '1113', AccountMemberId:'1236' },
                { ResponsiblePersonId: '1111', PersonId: '1113', AccountMemberId:'1237' }
            ]
            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.CreditTransactionDetails = [
                {AccountMemberId:'1235', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '5588', Amount:30}, 
                {AccountMemberId:'1236', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: '5678', Amount:110}, 
                {AccountMemberId:'1237', AppliedToDebitTransactionId: null , AppliedToServiceTransationId: null, Amount:55}, ];            
        });

        it('should set AccountMemberId to responsiblePerson.AccountMemberId on unapplied detail', () => {            
            component.setAccountMemberIdOnUnapplied(component.creditTransactionDto);            
            expect(component.creditTransactionDto.CreditTransactionDetails[2].AccountMemberId).toEqual('1234');
        });
    });

    describe('finishCheckout', () => {

        beforeEach(() => {
            spyOn(component, 'getServicesToExclude').and.callFake(() => ['5555','6666']);
            component.authAccess.view = true;
            component.allEncounters = [{
                PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }, {
                PatientName: 'Charley Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }];
            component.creditTransactionDtoList = [{}, {}];
            component.creditPaymentOrder = ['1111', '4444', '6666'];
            spyOn(component, 'setCreditTransactionListDetails');
           
        });

        it('should set disableSummary to true and checkoutIsInProgress to true', () => {
            component.checkoutIsInProgress = false;
            component.finishCheckout();
            expect(component.disableSummary).toBe(true);
            expect(component.checkoutIsInProgress).toBe(true);
        });

        it('should return if checkoutIsInProgress is true', () => {
            component.checkoutIsInProgress = true;
            component.finishCheckout();
            expect(component.setCreditTransactionListDetails).not.toHaveBeenCalled();
        });

        it('should call getServicesToExclude if compoenent.checkoutIsInProgress is false', () => {
            component.checkoutIsInProgress = false;
            component.finishCheckout();
            expect(component.getServicesToExclude).toHaveBeenCalled();
        });

        it('should call setFeeScheduleAdjustmentDates', () => {
            spyOn(component, 'setFeeScheduleAdjustmentDates').and.callFake(() => { });
            component.checkoutIsInProgress = false;
            component.finishCheckout();
            expect(component.setFeeScheduleAdjustmentDates).toHaveBeenCalled();
        });

        it('should call patientServices.Encounter.checkoutEncounters', () => {
            component.checkoutIsInProgress = false;
            component.hasDistributionChanges = false;
            component.finishCheckout();
            expect(mockPatientServices.Encounter.checkoutEncounters).toHaveBeenCalled();
        });

        it('should call patientServices.Encounter.checkoutEncounters and pass allEncounters and creditTransactionDtoList', () => {
            component.checkoutIsInProgress = false;
            component.finishCheckout();
            expect(mockPatientServices.Encounter.checkoutEncounters.calls.first().args[0].Encounters).toEqual(component.allEncounters);
            expect(mockPatientServices.Encounter.checkoutEncounters.calls.first().args[0].CreditTransactions).toEqual(component.creditTransactionDtoList);
        });

        it('should call patientServices.Encounter.checkoutEncounters and pass CreditPaymentOrder', () => {
            component.checkoutIsInProgress = false;
            component.hasDistributionChanges = false;
            component.finishCheckout();
            expect(mockPatientServices.Encounter.checkoutEncounters.calls.first().args[0].CreditPaymentOrder).toEqual(['1111', '4444', '6666']);
        });

        it('should call patientServices.Encounter.checkoutEncounters and pass ExcludeFromClaim', () => {
            component.checkoutIsInProgress = false;
            component.hasDistributionChanges = false;
            component.finishCheckout();
            expect(mockPatientServices.Encounter.checkoutEncounters.calls.first().args[0].ServicesToExcludeFromClaim).toEqual(['5555', '6666']);
        });

        it('should set disableSummary to true', () => {
            component.finishCheckout();
            expect(component.disableSummary).toBe(true);
        });
    });

    describe('addUnappliedCredit', () => {
        let unappliedCredit;
        beforeEach(() => {
            unappliedCredit = {
                AvailableUnassignedAmount: 50, TransactionTypeId: 2, PaymentTypeId: 2,
                PaymentTypePromptValue: '', Note: '', AdjustmentTypeId: null, Description: '', CreditTransactionId: '1239'
            };
            component.creditTransactionDto = new CreditTransaction();
            spyOn(component, 'updateCreditTransactionDtoDetails').and.callFake(() => { });
            component.creditPaymentOrder = [];
            component.hasDistributionChanges = false;
        });

        it('should set addCreditTransactionToList to true if hasDistributionChanges is false', () => {
            component.addUnappliedCredit(unappliedCredit);
            expect(component.addCreditTransactionToList).toBe(true);
        });

        it('should set creditTransactionDto properties based on parameter  if hasDistributionChanges is false', () => {
            component.addUnappliedCredit(unappliedCredit);
            expect(component.creditTransactionDto.Description).toEqual(unappliedCredit.Description);
            expect(component.creditTransactionDto.RelatedCreditTransactionId).toEqual(unappliedCredit.CreditTransactionId);
        });

        it('should set creditTransactionDto.TransactionTypeId to TransactionTypes.CreditPayment  if hasDistributionChanges is false', () => {
            component.addUnappliedCredit(unappliedCredit);
            expect(component.creditTransactionDto.TransactionTypeId).toEqual(TransactionTypes.CreditPayment);
        });

        it('should call updateCreditTransactionDtoDetails  if hasDistributionChanges is false', () => {
            component.addUnappliedCredit(unappliedCredit);
            expect(component.updateCreditTransactionDtoDetails).toHaveBeenCalled();
        });

        it('should set creditTransactionDto.Amount to unappliedCredit.Amount if' +
            ' its less than dataForUnappliedTransactions.totalBalanceDue and  if hasDistributionChanges is false', () => {
                component.dataForUnappliedTransactions.totalBalanceDue = 80.00;
                unappliedCredit.UnassignedAmount = 75.00;
                component.addUnappliedCredit(unappliedCredit);
                expect(component.creditTransactionDto.TransactionTypeId).toEqual(7);
                expect(component.creditTransactionDto.Amount).toBe(75.00);
            });

        it('should set unappliedCredit.UnassignedAmount.IsDisabled and Applied to equal true  if hasDistributionChanges is false', () => {
            component.dataForUnappliedTransactions.totalBalanceDue = 80.00;
            unappliedCredit.UnassignedAmount = 75.00;
            component.addUnappliedCredit(unappliedCredit);
        });

        it('should set all unappliedCreditTransactions IsDisabled to true if ' +
            'unappliedCredit.UnassignedAmount is more than dataForUnappliedTransactions.totalBalanceDues and  if hasDistributionChanges is false', () => {
                component.dataForUnappliedTransactions.totalBalanceDue = 80.00;
                unappliedCredit.UnassignedAmount = 95.00;
                component.addUnappliedCredit(unappliedCredit);
                component.dataForUnappliedTransactions.unappliedCreditTransactions.forEach(transaction => {
                    expect(transaction.IsDisabled).toBe(true);
                });
            });

        it('should set creditTransactionDto.Amount to to unappliedCredit.Amount  if ' +
            'unappliedCredit.Amount is more than dataForUnappliedTransactions.totalBalanceDue and hasDistributionChanges is false', () => {
                component.dataForUnappliedTransactions.totalBalanceDue = 80.00;
                unappliedCredit.UnassignedAmount = 85.00;
                component.addUnappliedCredit(unappliedCredit);
                expect(component.creditTransactionDto.TransactionTypeId).toEqual(7);
                expect(component.creditTransactionDto.Amount).toBe(85.00);
            });

        it('should set creditTransactionDto.Amount to unappliedCredit.Amount  if ' +
            'unappliedCredit.Amount is more than dataForUnappliedTransactions.totalBalanceDue and hasDistributionChanges is false', () => {
                component.dataForUnappliedTransactions.totalBalanceDue = 70.00;
                unappliedCredit.UnassignedAmount = 75.00;
                component.addUnappliedCredit(unappliedCredit);
                expect(component.creditTransactionDto.Amount).toBe(75.00);
            });

        it('should set creditTransaction.Amount to unappliedCredit.Amount if unappliedCredit.UnassignedAmount is more than ' +
            'dataForUnappliedTransactions.totalBalanceDue and hasDistributionChanges is false', () => {
                component.dataForUnappliedTransactions.totalBalanceDue = 70.00;
                unappliedCredit.UnassignedAmount = 75.00;
                component.addUnappliedCredit(unappliedCredit);
                expect(component.creditTransactionDto.Amount).toBe(75.00);
            });

        it('should add the unapplied CreditTransactionId to creditPaymentOrder if hasDistributionChanges is false', () => {
            component.creditPaymentOrder = ['1111', '2222'];
            unappliedCredit.CreditTransactionId = '3333';
            component.addUnappliedCredit(unappliedCredit);
            expect(component.creditPaymentOrder).toEqual(['1111', '2222', '3333']);
        });

        it('should call promptToSaveOrRollbackDistribution if hasDistributionChanges is true', () => {
            spyOn(component, 'promptToSaveOrRollbackDistribution');
            component.hasDistributionChanges = true;
            component.creditPaymentOrder = ['1111', '2222'];
            unappliedCredit.CreditTransactionId = '3333';
            component.addUnappliedCredit(unappliedCredit);
            expect(component.promptToSaveOrRollbackDistribution).toHaveBeenCalled();
        });

        it('should set unappliedCredit.AvailableUnassignedAmount to 0', () => {
            component.dataForUnappliedTransactions.unappliedCreditTransactions = [
                { CreditTransactionId: '1234', IsDisabled: false, AvailableUnassignedAmount: 50.00 },
                { CreditTransactionId: '1235', IsDisabled: false, AvailableUnassignedAmount: 100.00 },
                { CreditTransactionId: '1236', IsDisabled: false, AvailableUnassignedAmount: 30.00 },
            ];
            component.creditPaymentOrder = ['1234', '1235', '1236'];
            component.addUnappliedCredit(component.dataForUnappliedTransactions.unappliedCreditTransactions[0]);
            expect(component.dataForUnappliedTransactions.unappliedCreditTransactions[0].AvailableUnassignedAmount).toEqual(0);
        });
    });

    describe('creditTransactionChange', () => {
        let creditTransactionToRemove;
        beforeEach(() => {
            creditTransactionToRemove = { Amount: 50, OriginalPosition: 2, RelatedCreditTransactionId: 1234 };
            spyOn(component, 'removeUnappliedCredit').and.callFake(() => { });
            spyOn(component, 'removeCredit').and.callFake(() => { });
            spyOn(component, 'removeFeeScheduleAdjustmentItem').and.callFake(() => { });
        });

        it('should call removeUnappliedCredit if finds match by OriginalPosition and action equals removeUnappliedCredit', () => {
            component.creditTransactionChange({ action: 'removeUnappliedCredit', creditTransaction: creditTransactionToRemove });
            expect(component.removeUnappliedCredit).toHaveBeenCalledWith(creditTransactionToRemove);
        });

        it('should call removeCredit if finds match by OriginalPosition and action equals removeCredit', () => {
            component.creditTransactionChange({ action: 'removeCredit', creditTransaction: creditTransactionToRemove });
            expect(component.removeCredit).toHaveBeenCalledWith(creditTransactionToRemove);
        });

        it('should call removeFeeScheduleAdjustmentItem if finds match by OriginalPosition and action equals removeFeeScheduleAdjustmentItem', () => {
            let removeFeeScheduleAdjustmentItem = {FeeScheduleAdjustmentForEncounterId: '2222'};
            component.creditTransactionChange({ action: 'removeFeeScheduleAdjustmentItem', feeScheduleAdjustmentItem: removeFeeScheduleAdjustmentItem });
            expect(component.removeFeeScheduleAdjustmentItem).toHaveBeenCalledWith(removeFeeScheduleAdjustmentItem);
        });
    });


    describe('removeCredit', () => {

        let creditTransactionToRemove;
        beforeEach(() => {
            component.paymentTypes = [
                { PaymentTypeId: 1, CurrencyTypeId: 3 },
                { PaymentTypeId: 2, CurrencyTypeId: 5 },
                { PaymentTypeId: 3, CurrencyTypeId: 4 }
            ];
            component.userLocation = {
                IsPaymentGatewayEnabled: true
            }

            creditTransactionToRemove = { Amount: 50, OriginalPosition: 3 };
            component.creditTransactionDtoList = [
                { OriginalPosition: 1, PaymentGatewayTransactionId: '1', PaymentTypeId: 1, CreditTransactionDetails: [{ CreditTransactionDetailId: '11111111-1111-1111-1111-111111111111' }] },
                { OriginalPosition: 2, Amount: 5, PaymentGatewayTransactionId: '1', PaymentTypeId: 3, CreditTransactionDetails: [{ CreditTransactionDetailId: '11111111-1111-1111-1111-111111111111' }] },
                { OriginalPosition: 3 }
            ];


            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.OriginalPosition = 2;
            spyOn(component, 'updateCreditTransactionDtoDetails');
            spyOn(component, 'getEncounterBalanceDue');
            spyOn(component, 'updateServiceAdjustmentAmount');
            spyOn(component, 'updateTotals');
            spyOn(component, 'setDisableCreateClaims');
            spyOn(component, 'clearDistributionValidation');
            component.hasDistributionChanges = false;

            component.allEncounters = [{
                PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }, {
                PatientName: 'Charley Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }];
            spyOn(component, 'checkServicesForErrors');
            spyOn(component, 'promptToSaveOrRollbackDistribution');
            spyOn(component, 'continueRemoveCreditTransactionItem');
            spyOn(component, 'deleteDebitCardTransaction');
        });


        it('should decrement the paymentOrRefundPlaceholderAmount amount if credit transaction to remove has a PaymentGatewayTransactionId ', () => {
            component.creditTransactionDtoList[0].PaymentGatewayTransactionId=456;
            component.creditTransactionDtoList[0].Amount=56;
            let creditTransactionToRemove = cloneDeep(component.creditTransactionDtoList[0]);
            component.paymentOrRefundPlaceholderAmount = 100;
            component.removeCredit(creditTransactionToRemove);           
            expect(component.paymentOrRefundPlaceholderAmount).toEqual(44.00);
        });

        it('should call promptToSaveOrRollbackDistribution only if hasDistributionChanges is true', () => {
            component.hasDistributionChanges = true;
            component.removeCredit(creditTransactionToRemove);
            expect(component.promptToSaveOrRollbackDistribution).toHaveBeenCalled();
        });

        it('should not process method if component.hasDistributionChanges is true', () => {
            component.hasDistributionChanges = true;
            component.userLocation = { IsPaymentGatewayEnabled: true };
            creditTransactionToRemove = { Amount: 50, OriginalPosition: 1 };
            component.removeCredit(creditTransactionToRemove);
            expect(mockPatientServices.CreditTransactions.markAccountPaymentAsDeleted).not.toHaveBeenCalled();
            expect(component.updateServiceAdjustmentAmount).not.toHaveBeenCalled();
            expect(component.setDisableCreateClaims).not.toHaveBeenCalled();
        });

        it('should call continueRemoveCreditTransactionItem if payment gateway enabled and currency type is not 4', () => {
            component.hasDistributionChanges = false;
            component.userLocation.IsPaymentGatewayEnabled = true;
            creditTransactionToRemove = { Amount: 50, OriginalPosition: 1 };

            component.removeCredit(creditTransactionToRemove);
            expect(component.continueRemoveCreditTransactionItem).toHaveBeenCalled();
            expect(component.deleteDebitCardTransaction).not.toHaveBeenCalled();
        });

        it('should call deleteDebitCardTransaction if payment gateway enabled and currency type is 4', () => {
            component.hasDistributionChanges = false;
            component.userLocation.IsPaymentGatewayEnabled = true;
            creditTransactionToRemove = { Amount: 50, OriginalPosition: 2 };

            component.removeCredit(creditTransactionToRemove);
            expect(component.continueRemoveCreditTransactionItem).not.toHaveBeenCalled();
            expect(component.deleteDebitCardTransaction).toHaveBeenCalled();
        });

        it('should remove creditTransaction from creditTransactionDtoList if finds match and is not an open edge payment', () => {
            creditTransactionToRemove = { Amount: 50, OriginalPosition: 3 };
            component.removeCredit(creditTransactionToRemove);
            expect(component.creditTransactionDtoList).toEqual([
                { OriginalPosition: 1, PaymentGatewayTransactionId: '1', PaymentTypeId: 1, CreditTransactionDetails: [{ CreditTransactionDetailId: '11111111-1111-1111-1111-111111111111' }] },
                { OriginalPosition: 2, Amount: 5, PaymentGatewayTransactionId: '1', PaymentTypeId: 3, CreditTransactionDetails: [{ CreditTransactionDetailId: '11111111-1111-1111-1111-111111111111' }] },
            ]);
        });

        it('should call continueRemoveCreditTransactionItem if finds match and is not an open edge payment', () => {
            creditTransactionToRemove = { Amount: 50, OriginalPosition: 3 };
            component.removeCredit(creditTransactionToRemove);
            expect(component.continueRemoveCreditTransactionItem).toHaveBeenCalled();
            expect(component.deleteDebitCardTransaction).not.toHaveBeenCalled();
        });

        it ('should initialize the card reader select modal when payment is debit and provider is TUI', () => {
            spyOn(component, 'getGatewayTransactionTypeFromMap').and.returnValue(GatewayTransactionType.DebitCard);
            spyOn(component, 'initializeCardReaderSelectModal');
            creditTransactionToRemove = { Amount: 50, OriginalPosition: 2 };
            component.hasDistributionChanges = false;
            component.userLocation.IsPaymentGatewayEnabled = true;
            component.location = { PaymentProvider: PaymentProvider.TransactionsUI };
            component.removeCredit(creditTransactionToRemove);
            expect(component.initializeCardReaderSelectModal).toHaveBeenCalled();
        });

        it('should not adjust the paymentOrRefundPlaceholderAmount before initializing the card reader select modal', () => {
            spyOn(component, 'getGatewayTransactionTypeFromMap').and.returnValue(GatewayTransactionType.DebitCard);
            spyOn(component, 'initializeCardReaderSelectModal');
            creditTransactionToRemove = { Amount: 5, OriginalPosition: 2 };
            component.hasDistributionChanges = false;
            component.userLocation.IsPaymentGatewayEnabled = true;
            component.location = { PaymentProvider: PaymentProvider.TransactionsUI };
            component.paymentOrRefundPlaceholderAmount = 10;
            component.removeCredit(creditTransactionToRemove);
            expect(component.paymentOrRefundPlaceholderAmount).toEqual(10);
            expect(component.initializeCardReaderSelectModal).toHaveBeenCalled();
        });

        it('should adjust the paymentOrRefundPlaceholderAmount before removing a credit transaction', () => {
            spyOn(component, 'getGatewayTransactionTypeFromMap').and.returnValue(GatewayTransactionType.CreditCard);
            spyOn(component, 'initializeCardReaderSelectModal');
            creditTransactionToRemove = { Amount: 5, OriginalPosition: 2 };
            component.hasDistributionChanges = false;
            component.userLocation.IsPaymentGatewayEnabled = true;
            component.location = { PaymentProvider: PaymentProvider.TransactionsUI };
            component.paymentOrRefundPlaceholderAmount = 10;
            component.removeCredit(creditTransactionToRemove);
            expect(component.paymentOrRefundPlaceholderAmount).toEqual(5);
            expect(component.initializeCardReaderSelectModal).not.toHaveBeenCalled();
            expect(component.continueRemoveCreditTransactionItem).toHaveBeenCalled();
        });
    });

    describe('should handle loaded card readers', () => {
        beforeEach(() => {
            spyOn(component, 'onCardReaderSelectionComplete');
        });

        it('should load zero card readers', () => {
            const readers = [];
            component.handleLoadedCardReaders(readers);
            expect(component.onCardReaderSelectionComplete).not.toHaveBeenCalled();
        });

        it('should load a single card reader', () => {
            const readers = [
                { PartnerDeviceId: 'bogus-id-1', value: 'blah' }
            ];
            component.handleLoadedCardReaders(readers);
            expect(component.onCardReaderSelectionComplete).toHaveBeenCalledWith('bogus-id-1');
        });

        it('should load a two card readers', () => {
            const readers = [
                { PartnerDeviceId: 'bogus-id-1', value: 'blah' },
                { PartnerDeviceId: 'bogus-id-2', value: 'blah blah' },
            ];
            component.handleLoadedCardReaders(readers);
            expect(component.onCardReaderSelectionComplete).not.toHaveBeenCalled();
            expect(component.cardReaders.length).toEqual(2);
            expect(component.showCardReaderSelectModal).toBeTruthy();
        });
    });

    it('should select a card reader', () => {
        spyOn(component, 'initiatePaypageReturn');
        component.onCardReaderSelectionComplete('bogus');
        expect(component.selectedCardReader).toEqual('bogus');
        expect(component.showCardReaderSelectModal).toBeFalsy();
        expect(component.initiatePaypageReturn).toHaveBeenCalled();
    });

    it('should cancel card reader selection', () => {
        component.selectedCardReader = 'bogus';
        component.showCardReaderSelectModal = true;
        component.refundTransaction = { id: 'bogus' };
        component.cancelCardReaderSelection();
        expect(component.selectedCardReader).toEqual(null);
        expect(component.showCardReaderSelectModal).toBeFalsy();
        expect(component.refundTransaction).toEqual(null);
    });

    it('should open the paypage', () => {
        component.showPayPageModal = false;
        sessionStorage.removeItem('isPaypageModalOpen');
        expect(component.showPayPageModal).toBeFalsy();
        expect(sessionStorage.getItem('isPaypageModalOpen')).toEqual(null);
        component.openPaypage();
        expect(component.showPayPageModal).toBeTruthy();
        expect(sessionStorage.getItem('isPaypageModalOpen')).toEqual('true');
    });

    it('should close paypage', () => {
        component.showPayPageModal = true;
        expect(component.showPayPageModal).toBeTruthy();
        component.closePaypage();
        expect(component.showPayPageModal).toBeFalsy();
    });

    it('should continue debit refund when a refund transaction is available', () => {
        spyOn(component, 'continueRemoveCreditTransactionItem');
        component.refundTransaction = { PaymentGatewayTransactionId: 'bogus' };
        component.continueDebitRefund();
        expect(component.continueRemoveCreditTransactionItem).toHaveBeenCalledWith('bogus');
    });

    describe('deleteDebitCardTransaction', () => {

        let creditTransactionToRemove;
        beforeEach(() => {
            component.paymentTypes = [
                { PaymentTypeId: 1, CurrencyTypeId: 3 },
                { PaymentTypeId: 2, CurrencyTypeId: 5 },
                { PaymentTypeId: 3, CurrencyTypeId: 4 }
            ];
            component.userLocation = {
                IsPaymentGatewayEnabled: true
            }

            creditTransactionToRemove = { Amount: 50, OriginalPosition: 3 };
            component.creditTransactionDtoList = [
                { OriginalPosition: 1, PaymentGatewayTransactionId: '1', PaymentTypeId: 1, CreditTransactionDetails: [{ CreditTransactionDetailId: '11111111-1111-1111-1111-111111111111' }] },
                { OriginalPosition: 2, PaymentGatewayTransactionId: '1', PaymentTypeId: 3, CreditTransactionDetails: [{ CreditTransactionDetailId: '11111111-1111-1111-1111-111111111111' }] },
                { OriginalPosition: 3 }
            ];


            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.OriginalPosition = 2;
            spyOn(component, 'updateCreditTransactionDtoDetails');
            spyOn(component, 'getEncounterBalanceDue');
            spyOn(component, 'updateServiceAdjustmentAmount');
            spyOn(component, 'updateTotals');
            spyOn(component, 'setDisableCreateClaims');
            spyOn(component, 'clearDistributionValidation');
            component.hasDistributionChanges = false;

            component.allEncounters = [{
                PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }, {
                PatientName: 'Charley Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }];
            spyOn(component, 'checkServicesForErrors');
            spyOn(component, 'promptToSaveOrRollbackDistribution');
            spyOn(component, 'continueRemoveCreditTransactionItem');
            
            spyOn(component, 'getCardTransactionOverlay');
        });

        it('should call getCardTransactionLoadingModal', () => {            
            component.deleteDebitCardTransaction(creditTransactionToRemove);
            expect(component.getCardTransactionOverlay).toHaveBeenCalled();
            expect(component.waitOverlay).not.toBeNull();
        });        

        it('should call paymentGatewayService encounterDebitCardReturn', () => {
            component.deleteDebitCardTransaction(creditTransactionToRemove);
            expect(mockPaymentGatewayService.encounterDebitCardReturn).toHaveBeenCalled();
        });        
    });

    describe('cardTransactionOnErrorCallback', () => {        
        beforeEach(() => { 
            spyOn(component, 'removeWaitOverlay')                      
        });

        it('should call removeWaitOverlay', () => { 
            component.cardTransactionOnErrorCallback();
            expect(component.removeWaitOverlay).toHaveBeenCalled();            
        });
    });

    describe('getCardTransactionOverlay', () => {
        beforeEach(() => {            
        });

        it('should call mockWaitOverlayService.open', () => {
            component.getCardTransactionOverlay();
            expect(mockWaitOverlayService.open).toHaveBeenCalled();
        });
    });

    describe('continueRemoveCreditTransactionItem', () => {
        
        let creditTransactionToRemove;
        beforeEach(() => {
            component.paymentTypes = [
                { PaymentTypeId: 1, CurrencyTypeId: 3 },
                { PaymentTypeId: 2, CurrencyTypeId: 5 },
                { PaymentTypeId: 3, CurrencyTypeId: 4 },
            ];

            creditTransactionToRemove = { Amount: 50, OriginalPosition: 3 };
            component.creditTransactionDtoList = [
                { OriginalPosition: 1, PaymentGatewayTransactionId: '1', PaymentTypeId: 1, CreditTransactionDetails: [{ CreditTransactionDetailId: '11111111-1111-1111-1111-111111111111' }] },
                { OriginalPosition: 2, PaymentGatewayTransactionId: '2', PaymentTypeId: 3, CreditTransactionDetails: [{ CreditTransactionDetailId: '11111111-1111-1111-1111-111111111111' }] },
                { OriginalPosition: 3 }
            ];


            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.OriginalPosition = 2;
            spyOn(component, 'updateCreditTransactionDtoDetails');
            spyOn(component, 'getEncounterBalanceDue');
            spyOn(component, 'updateServiceAdjustmentAmount');
            spyOn(component, 'updateTotals');
            spyOn(component, 'setDisableCreateClaims');
            spyOn(component, 'clearDistributionValidation');    
            component.hasDistributionChanges = false;

            component.allEncounters = [{
                PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }, {
                PatientName: 'Charley Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }];
            spyOn(component, 'checkServicesForErrors');
            spyOn(component, 'promptToSaveOrRollbackDistribution');
        });        

        it('should call markAccountPaymentAsDelete if PaymentGatewayTransactionId and IsPaymentGatewayEnabled', () => {
            spyOn(component, 'getGatewayTransactionTypeFromMap').and.returnValue(1);
            component.userLocation = { IsPaymentGatewayEnabled: true };
            component.creditTransactionMatch = { OriginalPosition: 1, PaymentGatewayTransactionId: '1', PaymentTypeId: 1, CreditTransactionDetails: [{ CreditTransactionDetailId: '11111111-1111-1111-1111-111111111111' }] }
            component.continueRemoveCreditTransactionItem(null);
            expect(mockPatientServices.CreditTransactions.markAccountPaymentAsDeleted).toHaveBeenCalled();
        });        


        it('should call markAccountPaymentAsDelete if PaymentGatewayTransactionId and IsPaymentGatewayEnabled', () => {
            component.userLocation = { IsPaymentGatewayEnabled: true };
            spyOn(component, 'getGatewayTransactionTypeFromMap').and.returnValue(2);
            component.creditTransactionMatch = { OriginalPosition: 2, PaymentGatewayTransactionId: '2', PaymentTypeId: 3, CreditTransactionDetails: [{ CreditTransactionDetailId: '11111111-1111-1111-1111-111111111111' }] }
            component.continueRemoveCreditTransactionItem('test');
            expect(mockPatientServices.CreditTransactions.markAccountPaymentAsDeleted).toHaveBeenCalled();
            expect(component.creditTransactionMatch.PaymentGatewayTransactionRefundId).toBe('test');
        });        

        it('should call patientCheckoutService.resetCurrentCreditTransaction, then updateCreditTransactionDtoDetails' +
            ' if creditTransactionToRemove.OriginalPosition equals creditTransactionDto.OriginalPosition', () => {
            mockPatientCheckoutService.resetCurrentCreditTransaction = jasmine.createSpy().and.callFake((creditTransactionDto, []) => {
                creditTransactionDto.Amount = 0;
            });
            spyOn(component, 'getGatewayTransactionTypeFromMap').and.returnValue(undefined);
            component.creditTransactionDto.OriginalPosition = 3;

            component.creditTransactionMatch = { Amount: 50, OriginalPosition: 3 };           
            component.continueRemoveCreditTransactionItem(null);
            expect(mockPatientCheckoutService.resetCurrentCreditTransaction)
                .toHaveBeenCalledWith(component.creditTransactionDto, component.creditTransactionDtoList);
            expect(component.updateCreditTransactionDtoDetails).toHaveBeenCalled();
            expect(component.creditTransactionDto.Amount).toBe(0);
            });


        it('should call updateServiceAdjustmentAmount ', () => {
            component.creditTransactionMatch = { Amount: 50, OriginalPosition: 3 };
            component.continueRemoveCreditTransactionItem(null);
            expect(component.updateServiceAdjustmentAmount).toHaveBeenCalled();
        });

        it('should call getEncounterBalanceDue for each encounter in allEncounters ', () => {
            component.creditTransactionMatch = { Amount: 50, OriginalPosition: 3 };
            component.continueRemoveCreditTransactionItem(null);
            component.allEncounters.forEach(encounter => {
                expect(component.getEncounterBalanceDue).toHaveBeenCalledWith(encounter);
            });
        });

        it('should call setDisableCreateClaims ', () => {
            component.creditTransactionMatch = { Amount: 50, OriginalPosition: 3 };
            component.continueRemoveCreditTransactionItem(null);
            expect(component.setDisableCreateClaims).toHaveBeenCalled();
        });

        it('should call updateTotals ', () => {
            component.creditTransactionMatch = { Amount: 50, OriginalPosition: 3 };
            component.continueRemoveCreditTransactionItem(null);
            expect(component.updateTotals).toHaveBeenCalled();
        });

        it('should reset currentUnappliedAmount to 0', () => {
            component.currentUnappliedAmount = 100.00;
            component.creditTransactionMatch = { Amount: 50, OriginalPosition: 3 };
            component.continueRemoveCreditTransactionItem(null);
            expect(component.currentUnappliedAmount).toEqual(0);
        });

        it('should call clearDistributionValidation', () => {
            component.creditTransactionMatch = { Amount: 50, OriginalPosition: 3 };
            component.continueRemoveCreditTransactionItem(null);
            expect(component.clearDistributionValidation).toHaveBeenCalledWith();
        });
    });

    describe('addCreditCardPayment', () => {
        let creditTransactionToRemove;
        beforeEach(() => {
            component.paymentTypes = [
                { PaymentTypeId: 1, CurrencyTypeId: 3 },
                { PaymentTypeId: 2, CurrencyTypeId: 5 }
            ];

            creditTransactionToRemove = { Amount: 50, OriginalPosition: 3 };
            component.creditTransactionDtoList = [
                { OriginalPosition: 1, PaymentGatewayTransactionId: '1', PaymentTypeId: 1, CreditTransactionDetails: [{ CreditTransactionDetailId: '11111111-1111-1111-1111-111111111111' }] },
                { OriginalPosition: 2 },
                { OriginalPosition: 3 }
            ];
        });

        it('should call promptSaveDistribution hasDistributionChanges is true', () => {
            component.hasDistributionChanges = true;

            creditTransactionToRemove = { Amount: 50, OriginalPosition: 1 };
            component.promptSaveDistribution = jasmine.createSpy();
            component.addCreditCardPayment(creditTransactionToRemove);

            expect(component.promptSaveDistribution).toHaveBeenCalled();
        });


        it('should set variables when hasDistributionChanges is false', () => {
            component.hasDistributionChanges = false;
            component.disableSummary = false;
            component.addCreditTransactionToList = false;
            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.RelatedCreditTransactionId = '2';

            creditTransactionToRemove = { CreditTransactionId: '1', Amount: 50, OriginalPosition: 1 };
            component.promptSaveDistribution = jasmine.createSpy();
            component.addCreditCardPayment(creditTransactionToRemove);

            expect(component.disableSummary).toBe(true);
            expect(component.creditTransactionDto.RelatedCreditTransactionId).toBe('1');
            expect(component.addCreditTransactionToList).toBe(true);
        });


        it('should not call promptSaveDistribution when hasDistributionChanges is false', () => {
            component.hasDistributionChanges = false;
            component.disableSummary = false;
            component.addCreditTransactionToList = false;
            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.RelatedCreditTransactionId = '2';

            creditTransactionToRemove = { CreditTransactionId: '1', Amount: 50, OriginalPosition: 1 };
            component.promptSaveDistribution = jasmine.createSpy();
            component.addCreditCardPayment(creditTransactionToRemove);
            creditTransactionToRemove = { Amount: 50, OriginalPosition: 1 };
            component.promptSaveDistribution = jasmine.createSpy();

            expect(component.promptSaveDistribution).not.toHaveBeenCalled();
        });
    });

    describe('removeUnappliedCredit', () => {
        let unappliedCreditTransaction;
        beforeEach(() => {
            unappliedCreditTransaction = { Amount: 50, OriginalPosition: 3 };
            component.creditTransactionDtoList = [
                { OriginalPosition: 1, RelatedCreditTransactionId: '1111' },
                { OriginalPosition: 2, RelatedCreditTransactionId: '4444' },
                { OriginalPosition: 3, RelatedCreditTransactionId: '6666' }];

            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.OriginalPosition = 2;
            spyOn(component, 'clearDistributionValidation');
            spyOn(component, 'updateCreditTransactionDtoDetails');
            spyOn(component, 'getEncounterBalanceDue');
            spyOn(component, 'updateServiceAdjustmentAmount');
            spyOn(component, 'updateTotals');
            spyOn(component, 'setDisableCreateClaims');

            component.allEncounters = [{
                PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }, {
                PatientName: 'Charley Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }];

            component.dataForUnappliedTransactions.unappliedCreditTransactions = [
                { CreditTransactionId: '1234', IsDisabled: true },
                { CreditTransactionId: '1235', IsDisabled: false },
                { CreditTransactionId: '1236', IsDisabled: false },
            ];
            component.creditPaymentOrder = ['1234', '1235', '1236'];
            spyOn(component, 'checkServicesForErrors');
            spyOn(component, 'promptToSaveOrRollbackDistribution');
        });

        it('should call promptToSaveOrRollbackDistribution only if hasDistributionChanges is true', () => {
            component.hasDistributionChanges = true;            
            component.removeUnappliedCredit(unappliedCreditTransaction);  
            expect(component.promptToSaveOrRollbackDistribution).toHaveBeenCalled();
        });

        it('should not process method if component.hasDistributionChanges is true', () => {
            component.hasDistributionChanges = true;                
            component.removeUnappliedCredit(unappliedCreditTransaction);
            expect(mockPatientCheckoutService.resetCurrentCreditTransaction).not.toHaveBeenCalled();
            expect(component.updateTotals).not.toHaveBeenCalled();
        });

        it('should call remove creditTransaction from creditTransactionDtoList if finds match', () => {
            component.removeUnappliedCredit(unappliedCreditTransaction);
            expect(component.creditTransactionDtoList).toEqual([{ OriginalPosition: 1, RelatedCreditTransactionId: '1111' },
            { OriginalPosition: 2, RelatedCreditTransactionId: '4444' }]);
        });

        it('should call remove creditTransaction from creditTransactionDtoList if finds match based on RelatedCreditTransactionId', () => {
            component.creditPaymentOrder = ['1111', '4444', '6666'];
            unappliedCreditTransaction.OriginalPosition = 1;
            unappliedCreditTransaction.RelatedCreditTransactionId = '1111';
            component.removeUnappliedCredit(unappliedCreditTransaction);
            expect(component.creditPaymentOrder).toEqual(['4444', '6666']);
        });

        it('should call patientCheckoutService.resetCurrentCreditTransaction, then updateCreditTransactionDtoDetails' +
            ' if unappliedCreditTransaction.OriginalPosition equals creditTransactionDto.OriginalPosition', () => {
            mockPatientCheckoutService.resetCurrentCreditTransaction = jasmine.createSpy().and.callFake((creditTransactionDto, []) => {
                creditTransactionDto.Amount = 0;
            });
            component.creditTransactionDto.OriginalPosition = 3;
            component.removeUnappliedCredit(unappliedCreditTransaction);
            expect(mockPatientCheckoutService.resetCurrentCreditTransaction)
                .toHaveBeenCalledWith(component.creditTransactionDto, component.creditTransactionDtoList);
            expect(component.updateCreditTransactionDtoDetails).toHaveBeenCalled();
            expect(component.creditTransactionDto.Amount).toBe(0);
        });

        it('should update IsDisabled to false on dataForUnappliedTransactions.unappliedCreditTransactions ', () => {
            component.dataForUnappliedTransactions.unappliedCreditTransactions = [
                { CreditTransactionId: 1234, IsDisabled: true, Applied: true },
                { CreditTransactionId: 1235, IsDisabled: true, Applied: true },
                { CreditTransactionId: 1236, IsDisabled: true, Applied: false },
            ];
            unappliedCreditTransaction.CreditTransactionId = 1235;
            component.removeUnappliedCredit(unappliedCreditTransaction);
            component.dataForUnappliedTransactions.unappliedCreditTransactions.forEach(transaction => {
                expect(transaction.IsDisabled).toEqual(false);
            });
        });

        it('should call updateServiceAdjustmentAmount ', () => {
            component.removeUnappliedCredit(unappliedCreditTransaction);
            expect(component.updateServiceAdjustmentAmount).toHaveBeenCalled();
        });

        it('should call getEncounterBalanceDue for each encounter in allEncounters ', () => {
            component.removeUnappliedCredit(unappliedCreditTransaction);
            component.allEncounters.forEach(encounter => {
                expect(component.getEncounterBalanceDue).toHaveBeenCalledWith(encounter);
            });
        });

        it('should call updateTotals ', () => {
            component.removeUnappliedCredit(unappliedCreditTransaction);
            expect(component.updateTotals).toHaveBeenCalled();
        });

        it('should call setDisableCreateClaims ', () => {
            component.removeUnappliedCredit(unappliedCreditTransaction);
            expect(component.setDisableCreateClaims).toHaveBeenCalled();
        });

        it('should reset currentUnappliedAmount to 0', () => {
            component.currentUnappliedAmount = 100.00;
            component.removeUnappliedCredit(unappliedCreditTransaction);
            expect(component.currentUnappliedAmount).toEqual(0);
        });

        it('should call clearDistributionValidation', () => {
            component.removeUnappliedCredit(unappliedCreditTransaction);
            expect(component.clearDistributionValidation).toHaveBeenCalledWith();
        });
    });

    describe('continueCheckout', () => {

        // tslint:disable-next-line: no-trailing-whitespace
        beforeEach(() => {
            spyOn(component, 'finishCheckout').and.callFake(() => { });
            component.authAccess.view = true;
            component.allEncounters = [{
                PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }, {
                PatientName: 'Charley Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }];
        });

        it('should call confirmUnappliedCredits if there are unappliedCredits during checkout', () => {
            spyOn(component, 'confirmUnappliedCredits');
            component.checkoutIsInProgress = false;
            component.unappliedAmount = 110.00;
            component.continueCheckout();
            expect(component.confirmUnappliedCredits).toHaveBeenCalledWith(component.unappliedConfirmationData);
        });

    });

    describe('getServiceTransactionInsuranceList', () => {
        // tslint:disable-next-line: no-trailing-whitespace
        beforeEach(() => {
            component.patientEncounters = [{
                EncounterId: '1234', Status: 2, ServiceTransactionDtos: [{ ServiceTransactionId: '2222', CreateClaim: true }, { ServiceTransactionId: '2223', CreateClaim: true }]
            }, {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [{ ServiceTransactionId: '3333', CreateClaim: true }, { ServiceTransactionId: '3334', CreateClaim: true }]
            },
            {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [{ ServiceTransactionId: '3335', CreateClaim: true }]
            }];

            component.priorBalances = [{
                EncounterId: '1236', ServiceTransactionDtos: [{ ServiceTransactionId: '1111', CreateClaim: true }, { ServiceTransactionId: '1112', CreateClaim: true }]
            }, {
                EncounterId: '12376', ServiceTransactionDtos: [{ ServiceTransactionId: '2111', CreateClaim: true }, { ServiceTransactionId: '2112', CreateClaim: true }]
            }];
        });

        it('should return a list of lists of all serviceTransactions where CreateClaim equals true grouped by encounter from pending encounters', () => {
            component.includePriorBalance = false;
            expect(component.getServiceTransactionInsuranceList().length).toBe(3);
        });

        it('should return a list of lists of all serviceTransactions grouped by encounter from pending encounters', () => {
            component.includePriorBalance = false;
            const returnList = component.getServiceTransactionInsuranceList();           
            
            expect(returnList[0].length).toBe(2);
            expect(returnList[0][0].ServiceTransactionId).toBe('2222')
            expect(returnList[0][1].ServiceTransactionId).toBe('2223')

            expect(returnList[1].length).toBe(2);
            expect(returnList[1][0].ServiceTransactionId).toBe('3333');
            expect(returnList[1][1].ServiceTransactionId).toBe('3334');
            
            expect(returnList[2].length).toBe(1);
            expect(returnList[2][0].ServiceTransactionId).toBe('3335');
        });


        it('should not include priorBalances serviceTransactions if includePriorBalance is true', () => {
            component.includePriorBalance = true;
            const returnList = component.getServiceTransactionInsuranceList();
            expect(returnList.length).toBe(3);           
            
            expect(returnList[0].length).toBe(2);
            expect(returnList[0][0].ServiceTransactionId).toBe('2222');
            expect(returnList[0][1].ServiceTransactionId).toBe('2223');

            expect(returnList[1].length).toBe(2);
            expect(returnList[1][0].ServiceTransactionId).toBe('3333');
            expect(returnList[1][1].ServiceTransactionId).toBe('3334');
            
            expect(returnList[2].length).toBe(1);
            expect(returnList[2][0].ServiceTransactionId).toBe('3335');
        });
    });

    describe('updateCreditTransactionDtoDetails', () => {
        let allServices = [];
        // tslint:disable-next-line: no-trailing-whitespace
        beforeEach( async () => {
            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.Amount = 0;
            allServices = [
                { ServiceTransactionId: '1234', AdjustmentAmount: 10, PatientBalance:60,  Balance: 50 , DueNow: 50, AccountMemberId:'1234', EncounterType:'Current', DateEntered: '2020-12-13 19:16:10.0770000'},
                { ServiceTransactionId: '1235', AdjustmentAmount: 0, PatientBalance:25, Balance: 25 , DueNow: 25, AccountMemberId:'1234', EncounterType:'Current', DateEntered: '2020-12-13 19:18:10.0770000'},            
                { ServiceTransactionId: '1129', AdjustmentAmount: 10, PatientBalance:85, Balance: 75 , DueNow: 75, AccountMemberId:'1234', EncounterType:'Prior', DateEntered: '2020-12-13 19:12:10.0770000'},
                { ServiceTransactionId: '1127', AdjustmentAmount: 0, PatientBalance:44, Balance: 44 , DueNow: 44, AccountMemberId:'1234', EncounterType:'Prior', DateEntered: '2020-12-13 19:13:10.0770000'},
                { ServiceTransactionId: '1130', AdjustmentAmount: 0, PatientBalance:33, Balance: 33 , DueNow: 33, AccountMemberId:'1234', EncounterType:'Prior', DateEntered: '2020-12-13 19:14:10.0770000'}];
        });
        
        it('should not send prior balance services if includePriorBalance is false', async () => {
            component.serviceAndDebitTransactionDtos = cloneDeep(allServices);
            let includePriorBalance = false;
            component.hasPendingUpdateCreditTransaction = false;
            
            let servicesToSend =  [
                { ServiceTransactionId: '1234', AdjustmentAmount: 10, PatientBalance:60,  Balance: 50 , DueNow: 50, AccountMemberId:'1234', EncounterType:'Current', DateEntered: '2020-12-13 19:16:10.0770000'},
                { ServiceTransactionId: '1235', AdjustmentAmount: 0, PatientBalance:25, Balance: 25 , DueNow: 25, AccountMemberId:'1234', EncounterType:'Current', DateEntered: '2020-12-13 19:18:10.0770000'}];
            await component.updateCreditTransactionDtoDetails(includePriorBalance);
            expect(mockPatientServices.CreditTransactions.creditDistributionForSelectedServiceTransactions.calls.mostRecent().args[1]).toEqual(servicesToSend);
        });

        it('should send prior balance services to use up unapplied amount  '+
            'if includePriorBalance is true and CreditTransaction.Amount is more than total of pending serviceAndDebitTransactionDtos DueNow', async () => {
            let includePriorBalance = true;
            component.serviceAndDebitTransactionDtos = cloneDeep(allServices);
            component.hasPendingUpdateCreditTransaction = false;
            component.creditTransactionDto.Amount = 300.00; 
            let servicesToSend =  [
                { ServiceTransactionId: '1234', AdjustmentAmount: 10, PatientBalance:60,  Balance: 50 , DueNow: 50, AccountMemberId:'1234', EncounterType:'Current', DateEntered: '2020-12-13 19:16:10.0770000'},
                { ServiceTransactionId: '1235', AdjustmentAmount: 0, PatientBalance:25, Balance: 25 , DueNow: 25, AccountMemberId:'1234', EncounterType:'Current', DateEntered: '2020-12-13 19:18:10.0770000'},            
                { ServiceTransactionId: '1129', AdjustmentAmount: 10, PatientBalance:85, Balance: 75 , DueNow: 75, AccountMemberId:'1234', EncounterType:'Prior', DateEntered: '2020-12-13 19:12:10.0770000'},
                { ServiceTransactionId: '1127', AdjustmentAmount: 0, PatientBalance:44, Balance: 44 , DueNow: 44, AccountMemberId:'1234', EncounterType:'Prior', DateEntered: '2020-12-13 19:13:10.0770000'},
                { ServiceTransactionId: '1130', AdjustmentAmount: 0, PatientBalance:33, Balance: 33 , DueNow: 33, AccountMemberId:'1234', EncounterType:'Prior', DateEntered: '2020-12-13 19:14:10.0770000'}];
            await component.updateCreditTransactionDtoDetails(includePriorBalance);
            expect(mockPatientServices.CreditTransactions.creditDistributionForSelectedServiceTransactions.calls.mostRecent().args[1]).toEqual(servicesToSend);
        });
        
        it('should only send enough prior balance services to use up unapplied amount  '+
            'if includePriorBalance is true and CreditTransaction.Amount is more than total of pending serviceAndDebitTransactionDtos DueNow', async () => {
            let includePriorBalance = true;
            component.serviceAndDebitTransactionDtos = cloneDeep(allServices);
            component.hasPendingUpdateCreditTransaction = false;
            component.creditTransactionDto.Amount = 150.00;
            
            let servicesToSend =  [
                { ServiceTransactionId: '1234', AdjustmentAmount: 10, PatientBalance:60,  Balance: 50 , DueNow: 50, AccountMemberId:'1234', EncounterType:'Current', DateEntered: '2020-12-13 19:16:10.0770000'},
                { ServiceTransactionId: '1235', AdjustmentAmount: 0, PatientBalance:25, Balance: 25 , DueNow: 25, AccountMemberId:'1234', EncounterType:'Current', DateEntered: '2020-12-13 19:18:10.0770000'},            
                { ServiceTransactionId: '1129', AdjustmentAmount: 10, PatientBalance:85, Balance: 75 , DueNow: 75, AccountMemberId:'1234', EncounterType:'Prior', DateEntered: '2020-12-13 19:12:10.0770000'}];
            
            await component.updateCreditTransactionDtoDetails(includePriorBalance);
            expect(mockPatientServices.CreditTransactions.creditDistributionForSelectedServiceTransactions.calls.mostRecent().args[1]).toEqual(servicesToSend);
        });

        it('should set showPriorBalance to true if includePriorBalance is true and CreditTransaction.Amount is more than total of pending serviceAndDebitTransactionDtos DueNow', async () => {
            let includePriorBalance = true;
            component.serviceAndDebitTransactionDtos = cloneDeep(allServices);
            component.hasPendingUpdateCreditTransaction = false;
            component.creditTransactionDto.Amount = 150.00;
            component.showPriorBalance = false;
            
            let servicesToSend =  [
                { ServiceTransactionId: '1234', AdjustmentAmount: 10, PatientBalance:60,  Balance: 50 , DueNow: 50, AccountMemberId:'1234', EncounterType:'Current', DateEntered: '2020-12-13 19:16:10.0770000'},
                { ServiceTransactionId: '1235', AdjustmentAmount: 0, PatientBalance:25, Balance: 25 , DueNow: 25, AccountMemberId:'1234', EncounterType:'Current', DateEntered: '2020-12-13 19:18:10.0770000'},            
                { ServiceTransactionId: '1129', AdjustmentAmount: 10, PatientBalance:85, Balance: 75 , DueNow: 75, AccountMemberId:'1234', EncounterType:'Prior', DateEntered: '2020-12-13 19:12:10.0770000'}];
            
            await component.updateCreditTransactionDtoDetails(includePriorBalance);
            expect(component.showPriorBalance).toBe(true);
        });
    });

    describe('getNegativeAdjustmentTypes ->', () => {
        it('should call adjustmentTypesService.get with active=false', () => {
            component.getNegativeAdjustmentTypes();
            expect(mockAdjustmentTypesService.get.calls.first().args[0]).toEqual({ active: false });
        });
    });

    describe('removeCreditTransactionForFeeScheduleAdjustments', () => {
        let encounter;
        beforeEach(() => {
            encounter = { EncounterId: '1234' };
            component.creditTransactionDtoList = [{
                FeeScheduleAdjustmentForEncounterId: '1234', Amount: 50.00
            }, {
                FeeScheduleAdjustmentForEncounterId: '1235', Amount: 50.00
            }];
            spyOn(component, 'removeCredit');
        })
        it('should call removeCredit if matching creditTransaction found in creditTransactionDtoList ' +
            ' based on FeeScheduleAdjustmentForEncounterId', () => {
                encounter = { EncounterId: '1234' };
                component.removeCreditTransactionForFeeScheduleAdjustments(encounter);
                expect(component.removeCredit).toHaveBeenCalledWith({ FeeScheduleAdjustmentForEncounterId: '1234', Amount: 50.00 });
            });
    })

    describe('createCreditTransactionsForFeeScheduleAdjustments', () => {
        const adjustmentEncounter = {
            EncounterId: '789', AccountMemberId: '1234', hasAdjustedEstimate: true,
            benefitPlan: {
                PatientId: '2345', BenefitPlanId: 5, PatientBenefitPlanId: 10, Priority: 0,
                PolicyHolderBenefitPlanDto:
                    { BenefitPlanDto: { Name: 'Plan1', CarrierName: 'Carrier1', ApplyAdjustments: 1, FeesIns: 2, AdjustmentTypeId: 1234 } }
            },
            ServiceTransactionDtos: [
                {
                    EncounterId: '789',
                    ServiceTransactionId: '1111',
                    InsuranceEstimates: [{
                        AdjEst: 50
                    }]
                },
                {
                    EncounterId: '789',
                    ServiceTransactionId: '1112',
                    InsuranceEstimates: [{
                        AdjEst: 25
                    }]
                },
            ]
        };
        let creditTransaction;
        beforeEach(() => {
            spyOn(component, 'updateTotals').and.callFake(() => { });
            const description = 'fake description';
            const creditTransactionDto = new CreditTransaction();
            creditTransactionDto.CreditTransactionDetails = [];

            spyOn(component, 'addCreditTransactionDescription').and.callFake(() => description);
            spyOn(component, 'updateCreditTransactionDtoDetails').and.callFake(() => { });
            component.patientInfo = { PersonAccount: { AccountId: 1234 } };
            component.location = { LocationId: '1234' };

            component.allEncounters = [{}, {}]
            spyOn(component, 'getEncounterBalanceDue');

        });

        it('should call initializeCreditTransactionDto to initialize a CreditTransactionDto for each encounter ', () => {
            component.creditTransactionDtoList = [];
            let creditTransactionDetails = [{
                AccountMemberId: '1234',
                Amount: 50,
                EncounterId: '789',
            }, {
                AccountMemberId: '1234',
                Amount: 25,
                EncounterId: '789',
            }];
            component.createCreditTransactionsForFeeScheduleAdjustments(creditTransactionDetails, adjustmentEncounter);
            expect(mockPatientCheckoutService.initializeCreditTransaction).toHaveBeenCalled();
        });

        it('should not create creditTransaction if creditTransactionDetail.Amounts is zero', () => {
            component.creditTransactionDtoList = [];
            let creditTransactionDetails = [{
                AccountMemberId: '1234', Amount: 0, EncounterId: '789',
            }, {
                AccountMemberId: '1234', Amount: 0, EncounterId: '789',
            }];
            component.createCreditTransactionsForFeeScheduleAdjustments(creditTransactionDetails, adjustmentEncounter);
            expect(component.creditTransactionDtoList).toEqual([]);
        });


        it('should set OriginalPosition on new creditTransactionDto and add to creditTransactionDtoList', () => {
            const creditTransactionDetails = [{
                AccountMemberId: '1234', Amount: 100, EncounterId: '789',
            }, {
                AccountMemberId: '1234', Amount: 50, EncounterId: '789',
            }];
            component.creditTransactionDtoList = [];
            component.creditTransactionDtoList = [{ OriginalPosition: 1 }, { OriginalPosition: 2 }];
            mockCreditTransactionDto.OriginalPosition = 3;
            component.createCreditTransactionsForFeeScheduleAdjustments(creditTransactionDetails, adjustmentEncounter);
            expect(component.creditTransactionDtoList[0].OriginalPosition).toEqual(1);
            expect(component.creditTransactionDtoList[1].OriginalPosition).toEqual(2);
            expect(component.creditTransactionDtoList[2].OriginalPosition).toEqual(3);
        });

        it('should set properties on creditTransactionDto and add to creditTransactionDtoList', () => {
            component.creditTransactionDtoList = [
                { OriginalPosition: 1, Amount: 100 },
                { OriginalPosition: 2, Amount: 100 }];
            const creditTransactionDetails = [{
                AccountMemberId: '1234',
                Amount: 50,
                EncounterId: '789',
            }, {
                AccountMemberId: '1234',
                Amount: 50,
                EncounterId: '789',
            }];
            component.createCreditTransactionsForFeeScheduleAdjustments(creditTransactionDetails, adjustmentEncounter);
            // find new rows in creditTransactionDtoList
            expect(component.creditTransactionDtoList[2].Description).toBe('fake description')
            expect(component.creditTransactionDtoList[2].IsFeeScheduleWriteOff).toBe(true)
            expect(component.creditTransactionDtoList[2].TransactionTypeId).toBe(TransactionTypes.NegativeAdjustment);
            expect(component.creditTransactionDtoList[2].FeeScheduleAdjustmentForEncounterId).toEqual(adjustmentEncounter.EncounterId);
            expect(component.creditTransactionDtoList[2].PatientBenefitPlanId).toEqual(adjustmentEncounter.benefitPlan.PatientBenefitPlanId);

            expect(component.creditTransactionDtoList[3].Description).toBe('fake description')
            expect(component.creditTransactionDtoList[3].IsFeeScheduleWriteOff).toBe(true)
            expect(component.creditTransactionDtoList[3].TransactionTypeId).toBe(TransactionTypes.NegativeAdjustment);
            expect(component.creditTransactionDtoList[3].FeeScheduleAdjustmentForEncounterId).toEqual(adjustmentEncounter.EncounterId);
            expect(component.creditTransactionDtoList[3].PatientBenefitPlanId).toEqual(adjustmentEncounter.benefitPlan.PatientBenefitPlanId);
        });

        it('should set Amount on creditTransactionDto based on each of CreditTransactionDetail.Amount', () => {
            component.creditTransactionDtoList = [
                { OriginalPosition: 1, Amount: 100 },
                { OriginalPosition: 2, Amount: 100 }];
            const creditTransactionDetails = [{
                AccountMemberId: '1234',
                Amount: 50,
                EncounterId: '789',
            }, {
                AccountMemberId: '1234',
                Amount: 25,
                EncounterId: '789',
            }];
            component.createCreditTransactionsForFeeScheduleAdjustments(creditTransactionDetails, adjustmentEncounter);
            expect(component.creditTransactionDtoList[0].Amount).toEqual(100.00);
            expect(component.creditTransactionDtoList[1].Amount).toEqual(100.00);
            expect(component.creditTransactionDtoList[2].Amount).toEqual(50.00);
            expect(component.creditTransactionDtoList[3].Amount).toEqual(25.00);
        });

        it('should create one creditTransaction with one CreditTransactionDetail for each detail', () => {
            component.creditTransactionDtoList = [
                { OriginalPosition: 1, Amount: 100 },
                { OriginalPosition: 2, Amount: 100 }];
            let creditTransactionDetails = [{
                AccountMemberId: '1234',
                Amount: 50,
                EncounterId: '789',
            }, {
                AccountMemberId: '1234',
                Amount: 25,
                EncounterId: '789',
            }];
            component.createCreditTransactionsForFeeScheduleAdjustments(creditTransactionDetails, adjustmentEncounter);
            expect(component.creditTransactionDtoList[0].Amount).toEqual(100.00);
            expect(component.creditTransactionDtoList[1].Amount).toEqual(100.00);
            expect(component.creditTransactionDtoList[2].Amount).toEqual(50.00);
            expect(component.creditTransactionDtoList[3].Amount).toEqual(25.00);
        });

        it('should set properties on creditTransactionDto based on encounter.benefitPlan', () => {
            component.creditTransactionDtoList = [{ OriginalPosition: 1 }, { OriginalPosition: 2 }];
            const creditTransactionDetails = [{
                AccountMemberId: '1234',
                Amount: 50,
                EncounterId: '789',
            }, {
                AccountMemberId: '1234',
                Amount: 25,
                EncounterId: '789',
            }];
            component.createCreditTransactionsForFeeScheduleAdjustments(creditTransactionDetails, adjustmentEncounter);
            for (let index = 0; index < component.creditTransactionDtoList.length; index++) {
                expect(component.creditTransactionDtoList[2].AdjustmentTypeId).toEqual(
                    adjustmentEncounter.benefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto.AdjustmentTypeId);
            }
        });
    });

    describe('setDisableCreateClaims method', () => {
        beforeEach(() => {
            component.disableCreateClaims = false;
            mockTranslateService.instant = jasmine.createSpy().and.returnValue('Credits, Payments or Adjustments are already distributed to this encounter.');               
           
            component.allEncounters = [
                { PatientName: 'Charley Daniels', EncounterId: '1234', disableCreateClaims: false, disableCreateClaimsTooltip: '',ServiceTransactionDtos: [] },
                { PatientName: 'Charley Daniels', EncounterId:'1235', disableCreateClaims: false, disableCreateClaimsTooltip: '',ServiceTransactionDtos: [] },
                { PatientName: 'Hazel Daniels', EncounterId: '1236', disableCreateClaims: false, disableCreateClaimsTooltip: '',ServiceTransactionDtos: [] }]
        });

        it('should set encounter.disableCreateClaims to true if creditTransactionDtoList has creditTransactions that are marked IsFeeScheduleWriteOff equals false'+
        ' and EncounterId matches CreditTransactionDetail.EncounterId and Amount is more than 0', () => {
            component.disableCreateClaims = false;
            component.creditTransactionDtoList = [
                { CreditTransactionId: null, IsFeeScheduleWriteOff: true, 
                    CreditTransactionDetails:[{EncounterId:'1234', Amount:20},{EncounterId:'1234', Amount:20}] },
                { CreditTransactionId: null, IsFeeScheduleWriteOff: false, 
                    CreditTransactionDetails:[{EncounterId:null, Amount:0},{EncounterId:null, Amount:0}] },
                { CreditTransactionId: null, IsFeeScheduleWriteOff: false, 
                    CreditTransactionDetails:[{EncounterId:null, Amount:0},{EncounterId:'1234', Amount:20}] },
            ]
            component.setDisableCreateClaims();
            expect(component.allEncounters[0].disableCreateClaims).toEqual(true);
            expect(component.allEncounters[0].disableCreateClaimsTooltip).toEqual('Credits, Payments or Adjustments are already distributed to this encounter.');

            expect(component.allEncounters[1].disableCreateClaims).toEqual(false);
            expect(component.allEncounters[1].disableCreateClaimsTooltip).toEqual('');

            expect(component.allEncounters[2].disableCreateClaims).toEqual(false);
            expect(component.allEncounters[2].disableCreateClaimsTooltip).toEqual('');
        });

        it('should set encounter.disableCreateClaims to false if creditTransactionDtoList only has creditTransactions that are marked IsFeeScheduleWriteOff equals true', () => {
            component.disableCreateClaims = false;
            component.creditTransactionDtoList = [
                { CreditTransactionId: null, IsFeeScheduleWriteOff: true, CreditTransactionDetails:[{EncounterId:'1234', Amount:20},{EncounterId:'1234', Amount:20}] }
            ]
            component.setDisableCreateClaims();
            expect(component.allEncounters[0].disableCreateClaims).toEqual(false);
            expect(component.allEncounters[0].disableCreateClaimsTooltip).toEqual('');

            expect(component.allEncounters[1].disableCreateClaims).toEqual(false);
            expect(component.allEncounters[1].disableCreateClaimsTooltip).toEqual('');

            expect(component.allEncounters[2].disableCreateClaims).toEqual(false);
            expect(component.allEncounters[2].disableCreateClaimsTooltip).toEqual('');
        });

        it('should set serviceTransaction.disableCreateClaims to same as parent encounter.disableCreateClaims', () => {
            component.creditTransactionDtoList = [
                { CreditTransactionId: null, IsFeeScheduleWriteOff: true, CreditTransactionDetails:[{EncounterId:'1234', Amount:20},{EncounterId:'1234', Amount:20}] },
                { CreditTransactionId: null, IsFeeScheduleWriteOff: false, CreditTransactionDetails:[{EncounterId:null, Amount:0},{EncounterId:null, Amount:0}] },
                { CreditTransactionId: null, IsFeeScheduleWriteOff: false, CreditTransactionDetails:[{EncounterId:null, Amount:0},{EncounterId:'1234', Amount:20}] },
            ]
            component.setDisableCreateClaims();
            expect(component.allEncounters[0].disableCreateClaims).toEqual(true);
            component.allEncounters[0].ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.disableCreateClaims).toEqual(true);                
            });

            expect(component.allEncounters[1].disableCreateClaims).toEqual(false);
            component.allEncounters[1].ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.disableCreateClaims).toEqual(false);           
            });


            expect(component.allEncounters[2].disableCreateClaims).toEqual(false);
            component.allEncounters[2].ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.disableCreateClaims).toEqual(false);           
            });
        });

        it('should set serviceTransaction.claimsTooltip if serviceTransaction.canCreateClaim is true', () => {
            component.allEncounters[0].ServiceTransactionDtos.push({canCreateClaim : true, claimsTooltip: ''});
            component.creditTransactionDtoList = [
                { CreditTransactionId: null, IsFeeScheduleWriteOff: false, CreditTransactionDetails:[{EncounterId:null, Amount:0},{EncounterId:'1234', Amount:20}] },
            ]
            component.setDisableCreateClaims();
            expect(component.allEncounters[0].disableCreateClaims).toEqual(true);
            component.allEncounters[0].ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.claimsTooltip).toEqual('Credits, Payments or Adjustments are already distributed to this encounter.');          
            });
        });

        it('should not set serviceTransaction.claimsTooltip if serviceTransaction.canCreateClaim is false', () => {
            component.allEncounters[0].ServiceTransactionDtos.push({canCreateClaim : false, claimsTooltip: ''});
            component.creditTransactionDtoList = [
                { CreditTransactionId: null, IsFeeScheduleWriteOff: false, CreditTransactionDetails:[{EncounterId:null, Amount:0},{EncounterId:'1234', Amount:20}] },
            ]
            component.setDisableCreateClaims();
            expect(component.allEncounters[0].disableCreateClaims).toEqual(true);
            component.allEncounters[0].ServiceTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.claimsTooltip).toEqual('');          
            });
        });
    });

    // load an unapplied credit transaction to the credittransactiondtolist but leave as current creditTransaction
    // until some other action is taken
    describe('addCreditDistribution', () => {
        beforeEach(() => {
            spyOn(component, 'updateServiceAdjustmentAmount').and.callFake(() => { });
            spyOn(component, 'updateTotals').and.callFake(() => { });
            spyOn(component, 'updateCreditTransactionDtoDetails').and.callFake(() => { });
            spyOn(component, 'setDisableCreateClaims');
            component.dataForUnappliedTransactions = {
                totalAvailableCredit: 0,
                totalBalanceDue: 0, totalUnappliedAmount: 0,
                unappliedCreditTransactions: []
            };
            component.dataForUnappliedTransactions.unappliedCreditTransactions = [
                { AvailableUnassignedAmount: 50 },
                { AvailableUnassignedAmount: 25 },
                { AvailableUnassignedAmount: 0 },
            ];
            component.creditTransactionDtoList = [];
            component.allEncounters = [{}, {}];
            spyOn(component, 'getEncounterBalanceDue').and.callFake(() => { });

            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.CreditTransactionDetails = [];
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1234' });
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1235' });
        });

        it('should set DateEntered on creditTransactionDetails to match CreditTransaction', () => {
            component.creditTransactionDto.DateEntered = new Date();
            component.addCreditDistribution();
            component.creditTransactionDto.CreditTransactionDetails.forEach(creditTransactionDetail => {
                expect(creditTransactionDetail.DateEntered).toEqual(component.creditTransactionDto.DateEntered);
            });
        });

        it('should call supporting methods', () => {
            component.addCreditDistribution();
            expect(component.updateServiceAdjustmentAmount).toHaveBeenCalled();
            expect(component.updateTotals).toHaveBeenCalled();
            expect(component.setDisableCreateClaims).toHaveBeenCalled();
        });

        it('should setcomponent.disableCreditDistribution to false', () => {
            component.addCreditDistribution();
            expect(component.disableCreditDistribution).toBe(false);
        });

        it('should set component.hasDistributionChanges to false', () => {
            component.addCreditDistribution();
            expect(component.hasDistributionChanges).toBe(false);
        });

    });

    describe('hasInvalidServiceCodes', () => {

        beforeEach(() => {
            spyOn(component, 'calculateCurrentUnapplied');
            spyOn(component, 'confirmChangesNeeded').and.callFake(() => { });
            component.creditTransactionDtoList = [
                { CreditTransactionDetails: [{ Amount: 50 }] },
                { CreditTransactionDetails: [{ Amount: 100 }] },];
            component.allEncounters = [
                {
                    PatientName: 'Charley Daniels', EncounterId: 8888, Status: 2, AccountMemberId: '1235',
                    ServiceTransactionDtos: [
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        },
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            $$ObjectWasUpdated: true,
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        }
                    ]

                },
                {
                    PatientName: 'Hazel Daniels', EncounterId: 9999, Status: 2, AccountMemberId: '1234',
                    ServiceTransactionDtos: [
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            $$ObjectWasUpdated: true,
                            InsuranceEstimates: []
                        },
                        {
                            Adjustment: 0,
                            AccountMemberId: '1235',
                            ServiceTransactionId: '1111',
                            AdjustmentAmount: 0,
                            InsuranceEstimates: []
                        }
                    ]
                }
            ];
        });

        it('should call patientCheckoutService.checkForAffectedAreaChanges for each encounter in component.allEncounters', () => {
            mockReturn = [{ ServiceTransactionId: '1999', Code: '1234' }, { ServiceTransactionId: '2999', Code: '1235' }];
            component.hasInvalidServiceCodes();
            component.allEncounters.forEach(encounter => {
                expect(mockPatientCheckoutService.checkForAffectedAreaChanges).toHaveBeenCalledWith(
                    encounter.ServiceTransactionDtos, component.serviceCodes);
            });
        });

        it('should pass the encounterId of the first encounter with invalidCodes ' +
            'if patientCheckoutService.checkForAffectedAreaChanges returns list of serviceTransactions that need modified', () => {
                mockReturn = [{ ServiceTransactionId: '1999', Code: '1234' }, { ServiceTransactionId: '2999', Code: '1235' }];
                component.hasInvalidServiceCodes();
                expect(component.confirmChangesNeeded).toHaveBeenCalledWith(
                    component.confirmationData, ['1234', '1235'], component.allEncounters[0].EncounterId);
            });

        it('should create a list of invalid serviceTransaction.Code if patientCheckoutService.checkForAffectedAreaChanges returns ' +
            ' list of serviceTransactions that need modified', () => {
                mockReturn = [{ ServiceTransactionId: '1999', Code: '1234' }, { ServiceTransactionId: '2999', Code: '1235' }];
                component.hasInvalidServiceCodes();
                expect(component.confirmChangesNeeded).toHaveBeenCalledWith(
                    component.confirmationData, ['1234', '1235'], component.allEncounters[0].EncounterId);
            });


        it('should call confirmChangesNeeded if component.hasInvalidServiceCodes returns ' +
            ' list of serviceTransactions that need modified', () => {
                mockReturn = [{ ServiceTransactionId: '1999', Code: '1234' }, { ServiceTransactionId: '2999', Code: '2234' }];
                const returnVal = component.hasInvalidServiceCodes();
                component.hasInvalidServiceCodes();
                expect(component.confirmChangesNeeded).toHaveBeenCalled();
                expect(returnVal).toBe(true);
            });

        it('should not call confirmChangesNeeded if patientCheckoutService.checkForAffectedAreaChanges ' +
            'returns empty list of serviceTransactions that need modified', () => {
                mockReturn = [];
                const returnVal = component.hasInvalidServiceCodes();
                expect(component.confirmChangesNeeded).not.toHaveBeenCalled();
                expect(returnVal).toBe(false);
            });


    });

    describe('updateServiceAdjustmentAmount', () => {

        beforeEach(() => {
            spyOn(component, 'calculateCurrentUnapplied');
            component.serviceAndDebitTransactionDtos = [
                { ServiceTransactionId: '1234', AdjustmentAmount: 10, Balance: 50 },
                { ServiceTransactionId: '1235', AdjustmentAmount: 0, Balance: 25 }];
            component.priorBalances = [{}, {}];
            component.creditTransactionDtoList = [
                { OriginalPosition: 1, },
                { OriginalPosition: 2 },
                { OriginalPosition: 3 }];
            component.creditTransactionDto = new CreditTransaction();
            spyOn(component, 'updateTotals');
            component.priorBalanceTransactionsByPatient=[];
        });

        it('should recalculate the BalanceDue for each patient group in priorBalanceTransactionsByPatient', () => {
            component.creditTransactionDtoList = [];
            component.priorBalanceTransactionsByPatient = [{
                AccountMemberId: '1234', BalanceDue: 0, PatientName: 'Bob', ServiceTransactionDtos: [{DueNow: 125.00}, {DueNow: 110.00}]
                },{ AccountMemberId: '1234', BalanceDue: 0, PatientName: 'Sue', ServiceTransactionDtos: [{DueNow: 30.00}, {DueNow: 40.00}]
                },{ AccountMemberId: '1234', BalanceDue: 0, PatientName: 'Josh', ServiceTransactionDtos: [{DueNow: 20.00}, {DueNow: 30.00}]
            }];

            component.serviceAndDebitTransactionDtos = [
                { ServiceTransactionId: '1239', AdjustmentAmount: 10, Balance: 100 },
                { ServiceTransactionId: '1235', AdjustmentAmount: 0, Balance: 25 }];

            component.paymentOrRefundPlaceholderAmount = 0;
            component.unappliedAmount = 50.00;
            component.updateServiceAdjustmentAmount();

            expect(component.priorBalanceTransactionsByPatient[0].PatientName).toEqual('Bob');
            expect(component.priorBalanceTransactionsByPatient[0].BalanceDue).toEqual(235);
            expect(component.priorBalanceTransactionsByPatient[1].PatientName).toEqual('Sue');
            expect(component.priorBalanceTransactionsByPatient[1].BalanceDue).toEqual(70);

            expect(component.priorBalanceTransactionsByPatient[2].PatientName).toEqual('Josh');
            expect(component.priorBalanceTransactionsByPatient[2].BalanceDue).toEqual(50);
        });

        it('should recalculate the unappliedAmount to equal the sum of the CreditTransactionDetail amounts ' +
            ' that have AppliedToServiceTransationId equal to null and AppliedToDebitTransactionId equal to null' +
            ' if the paymentOrRefundPlaceholderAmount amount is 0', () => {
                component.creditTransactionDtoList = [
                    {
                        IsFeeScheduleWriteOff: false, CreditTransactionDetails: [
                            { Amount: 50.00, AppliedToServiceTransationId: null, AppliedToDebitTransactionId: null, EncounterId: '2345' },
                            { Amount: 10.00, AppliedToServiceTransationId: null, AppliedToDebitTransactionId: null, EncounterId: '2345' },
                        ]
                    },
                    {
                        IsFeeScheduleWriteOff: false, CreditTransactionDetails: [
                            { Amount: 30, AppliedToServiceTransationId: null, AppliedToDebitTransactionId: null, EncounterId: '2346' },
                            { Amount: 20, AppliedToServiceTransationId: null, AppliedToDebitTransactionId: null, EncounterId: '2346' },
                        ]
                    }
                ];

                component.serviceAndDebitTransactionDtos = [
                    { ServiceTransactionId: '1239', AdjustmentAmount: 10, Balance: 100 },
                    { ServiceTransactionId: '1235', AdjustmentAmount: 0, Balance: 25 }];

                component.paymentOrRefundPlaceholderAmount = 0;
                component.unappliedAmount = 50.00;
                component.updateServiceAdjustmentAmount();
                expect(component.unappliedAmount).toEqual(110.00);
            });

        it('should recalculate the unappliedAmount to equal the sum of the CreditTransactionDetail amounts ' +
            ' that have AppliedToServiceTransationId equal to null and AppliedToDebitTransactionId equal to null' +
            ' minus the paymentOrRefundPlaceholderAmount if it is more than 0', () => {
                component.paymentOrRefundPlaceholderAmount = 75.00;
                component.unappliedAmount = 50.00;
                component.creditTransactionDtoList = [
                    {
                        IsFeeScheduleWriteOff: false, CreditTransactionDetails: [
                            { Amount: 50.00, AppliedToServiceTransationId: null, AppliedToDebitTransactionId: null, EncounterId: '2345' },
                            { Amount: 10.00, AppliedToServiceTransationId: null, AppliedToDebitTransactionId: null, EncounterId: '2345' },
                        ]
                    },
                    {
                        IsFeeScheduleWriteOff: false, CreditTransactionDetails: [
                            { Amount: 20, AppliedToServiceTransationId: null, EncounterId: '2346' },
                            { Amount: 30, AppliedToServiceTransationId: null, EncounterId: '2346' },
                        ]
                    }
                ];
                component.serviceAndDebitTransactionDtos = [
                    { ServiceTransactionId: '1240', AdjustmentAmount: 10, Balance: 100 },
                    { ServiceTransactionId: '1241', AdjustmentAmount: 0, Balance: 25 }];
                component.updateServiceAdjustmentAmount();
                expect(component.unappliedAmount).toEqual(35);
            });

        it('should set serviceAndDebitTransactionDtos serviceTransaction.AdjustmentAmount to 0 ' +
            'if component.creditTransactionDtoList is empty', () => {
                component.creditTransactionDtoList = [];
                component.updateServiceAdjustmentAmount();
                component.serviceAndDebitTransactionDtos.forEach(serviceTransaction => {
                    expect(serviceTransaction.AdjustmentAmount).toBe(0);
                    const dueNow = serviceTransaction.Balance - serviceTransaction.AdjustmentAmount;
                    expect(mockPatientCheckoutService.calculateServiceTransactionAmounts).toHaveBeenCalledWith(serviceTransaction);
                });
            });

        it('should set priorBalances serviceTransaction.AdjustmentAmount to 0 if component.creditTransactionDtoList is empty', () => {
            component.creditTransactionDtoList = [];
            component.updateServiceAdjustmentAmount();
            component.priorBalances.forEach(serviceTransaction => {
                expect(serviceTransaction.AdjustmentAmount).toBe(0);
            });
        });

        it('should set serviceTransaction.AdjustmentAmount to sum of all CreditTransactionDetail.Amount ' +
            'if component.creditTransactionDtoList is not empty' +
            ' and creditTransaction.IsFeeScheduleWriteOff is false ', () => {
                component.creditTransactionDtoList = [
                    {
                        IsFeeScheduleWriteOff: false, CreditTransactionDetails: [
                            { Amount: 50.00, AppliedToServiceTransationId: '1234', EncounterId: '2345' },
                            { Amount: 10.00, AppliedToServiceTransationId: '1234', EncounterId: '2345' },
                        ]
                    },
                    {
                        IsFeeScheduleWriteOff: false, CreditTransactionDetails: [
                            { Amount: 51, AppliedToServiceTransationId: '1235', EncounterId: '2346' },
                            { Amount: 22, AppliedToServiceTransationId: '1235', EncounterId: '2346' },
                        ]
                    }
                ];

                component.serviceAndDebitTransactionDtos = [
                    { ServiceTransactionId: '1234', AdjustmentAmount: 10, Balance: 100 },
                    { ServiceTransactionId: '1235', AdjustmentAmount: 0, Balance: 25 }];

                component.updateServiceAdjustmentAmount();
                expect(component.serviceAndDebitTransactionDtos[0].AdjustmentAmount).toEqual(60);
                expect(component.serviceAndDebitTransactionDtos[1].AdjustmentAmount).toEqual(73);
            });

        it('should set serviceTransaction.DueNow sum of serviceTransaction.Balance minus serviceTransaction.AdjustmentAmount ', () => {
            component.creditTransactionDtoList = [
                {
                    IsFeeScheduleWriteOff: false, CreditTransactionDetails: [
                        { Amount: 50.00, AppliedToServiceTransationId: '1234', EncounterId: '2345' },
                        { Amount: 10.00, AppliedToServiceTransationId: '1234', EncounterId: '2345' },
                    ]
                },
                {
                    IsFeeScheduleWriteOff: false, CreditTransactionDetails: [
                        { Amount: 51, AppliedToServiceTransationId: '1235', EncounterId: '2346' },
                        { Amount: 22, AppliedToServiceTransationId: '1235', EncounterId: '2346' },
                    ]
                }
            ];

            component.serviceAndDebitTransactionDtos = [
                { ServiceTransactionId: '1234', AdjustmentAmount: 10, Balance: 100 },
                { ServiceTransactionId: '1235', AdjustmentAmount: 0, Balance: 125 }];

            component.updateServiceAdjustmentAmount();
            expect(mockPatientCheckoutService.calculateServiceTransactionAmounts).
                toHaveBeenCalledWith(component.serviceAndDebitTransactionDtos[0]);
            expect(mockPatientCheckoutService.calculateServiceTransactionAmounts).
                toHaveBeenCalledWith(component.serviceAndDebitTransactionDtos[0]);
        });

        /* placeholder tests for same functionality when we have AppliedToDebitTransactionId  */
    });

    describe('addPaymentOrAdjustment', () => {
        let paymentOrAdjustment;
        beforeEach(() => {
            paymentOrAdjustment = {
                Amount: 50, TransactionTypeId: 2, PaymentTypeId: 2,
                PaymentTypePromptValue: '', Note: '', AdjustmentTypeId: null, Description: ''
            };
            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.CreditTransactionDetails = [];
            component.accountMembersDetails = [
                { ResponsiblePersonId: '1', PersonId: '1' }
            ]
            spyOn(component, 'updateCreditTransactionDtoDetails').and.callFake(() => { });
            component.hasDistributionChanges = false;
        });

        it('should call resetCurrentCreditTransaction  if hasDistributionChanges is false', () => {
            component.addPaymentOrAdjustment(paymentOrAdjustment);
            expect(mockPatientCheckoutService.resetCurrentCreditTransaction).toHaveBeenCalled();
        });

        it('should set properties on component.creditTransactionDto based on parameter  if hasDistributionChanges is false', () => {
            paymentOrAdjustment.PaymentGatewayTransactionId = '15'

            component.addPaymentOrAdjustment(paymentOrAdjustment);

            expect(component.creditTransactionDto.Amount).toEqual(paymentOrAdjustment.Amount);
            expect(component.creditTransactionDto.TransactionTypeId).toEqual(paymentOrAdjustment.TransactionTypeId);
            expect(component.creditTransactionDto.AdjustmentTypeId).toEqual(paymentOrAdjustment.AdjustmentTypeId);
            expect(component.creditTransactionDto.Note).toEqual(paymentOrAdjustment.Note);
            expect(component.creditTransactionDto.PaymentTypePromptValue).toEqual(paymentOrAdjustment.PaymentTypePromptValue);
            expect(component.creditTransactionDto.Description).toEqual(paymentOrAdjustment.Description);
            expect(component.creditTransactionDto.PaymentGatewayTransactionId).toEqual(paymentOrAdjustment.PaymentGatewayTransactionId);
        });

        it('should set addCreditTransactionToList to true  if hasDistributionChanges is false and no paymentGatewayTransactionId', () => {
            component.addPaymentOrAdjustment(paymentOrAdjustment);
            expect(component.addCreditTransactionToList).toBe(true);
            expect(component.disableSummary).toBe(true);
        });

        it('should set creditTransactionDto.Description to equal the unappliedCredit.Description  if hasDistributionChanges is false', () => {
            component.addPaymentOrAdjustment(paymentOrAdjustment);
            expect(component.creditTransactionDto.Description).toEqual(paymentOrAdjustment.Description);
        });

        it('should call updateCreditTransactionDtoDetails if hasDistributionChanges is false and no paymentGatewayTransactionId', () => {
            component.addPaymentOrAdjustment(paymentOrAdjustment);
            expect(component.updateCreditTransactionDtoDetails).toHaveBeenCalled();
        });


        it('should not call promptSaveDistribution if hasDistributionChanges is false', () => {
            spyOn(component, 'promptSaveDistribution');
            component.addPaymentOrAdjustment(paymentOrAdjustment);
            expect(component.promptSaveDistribution).not.toHaveBeenCalled();
        });


        it('should call addCreditCardPayment when hasDistributionChanges is true and has paymentGatewayTransactionId', () => {
            let successResult = {
                Value: {
                    CreditTransactionId: '1', IsAuthorized: false, DataTag: '2', EnteredByUserId: '3',
                    CreditTransactionDetails: [{ ObjectState: 'Add', Amount: 6 }]
                }
            };

            mockPatientServices.CreditTransactions.create = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => success(successResult) }
            });

            paymentOrAdjustment.PaymentGatewayTransactionId = '15'
            component.addCreditCardPayment = jasmine.createSpy();

            component.addPaymentOrAdjustment(paymentOrAdjustment);

            expect(component.addCreditCardPayment).toHaveBeenCalled();
        });

        
        it('should add credittransaction.Amount to paymentOrRefundPlaceholderAmount when creditTransaction has paymentGatewayTransactionId', () => {
            let successResult = {
                Value: {
                    CreditTransactionId: '1', IsAuthorized: false, DataTag: '2', EnteredByUserId: '3',
                    CreditTransactionDetails: [{ ObjectState: 'Add', Amount: 44.00 }]
                }
            };
            mockPatientServices.CreditTransactions.create = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => success(successResult) }
            });
            component.paymentOrRefundPlaceholderAmount = 100;
            paymentOrAdjustment.PaymentGatewayTransactionId = '15'
            component.addCreditCardPayment = jasmine.createSpy();
            component.addPaymentOrAdjustment(paymentOrAdjustment);
            expect(component.paymentOrRefundPlaceholderAmount).toEqual(144.00)
        });

        it('should call create for unapplied creditTransaction when hasDistributionChanges is true and has paymentGatewayTransactionId', () => {
            let successResult = {
                Value: {
                    CreditTransactionId: '1', IsAuthorized: false, DataTag: '2', EnteredByUserId: '3',
                    CreditTransactionDetails: [{ ObjectState: 'Add', Amount: 6 }]
                }
            };

            mockPatientServices.CreditTransactions.create = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => success(successResult) }
            });

            paymentOrAdjustment.PaymentGatewayTransactionId = '15'

            component.addPaymentOrAdjustment(paymentOrAdjustment);

            expect(mockPatientServices.CreditTransactions.create).toHaveBeenCalled();
        });

        it('should call promptOpenEdgeCreditTransactionUpdateFailed when patientServices.CreditTransactions.create returns error '+
        'and this.creditTransactionDto.PaymentGatewayTransactionId is not null', () => {
            spyOn(component, 'promptOpenEdgeCreditTransactionUpdateFailed')
            let errorResult = {};
            mockPatientServices.CreditTransactions.create = jasmine.createSpy().and.returnValue({
                $promise: { then: (success, failure) => failure(errorResult) }
            });
            paymentOrAdjustment.PaymentGatewayTransactionId = '15';
            component.addPaymentOrAdjustment(paymentOrAdjustment);
            expect(component.promptOpenEdgeCreditTransactionUpdateFailed).toHaveBeenCalled();
        });



        it('should not call promptToSaveOrRollbackDistribution if hasDistributionChanges is false', () => {
            spyOn(component, 'promptToSaveOrRollbackDistribution');
            component.addPaymentOrAdjustment(paymentOrAdjustment);
            expect(component.promptToSaveOrRollbackDistribution).not.toHaveBeenCalled();
        });

        it('should call promptToSaveOrRollbackDistribution if hasDistributionChanges is true', () => {
            spyOn(component, 'promptToSaveOrRollbackDistribution');
            component.hasDistributionChanges = true;
            component.addPaymentOrAdjustment(paymentOrAdjustment);
            expect(component.promptToSaveOrRollbackDistribution).toHaveBeenCalled();
        });
    });

    describe('rollbackDistributionChanges method', () => {

        beforeEach(async () => {
            component.creditTransactionDtoList = [];
            component.disableSummary = false;

            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.Amount = 100.00;
            component.creditTransactionDto.TransactionTypeId = 2;
            component.creditTransactionDto.AdjustmentTypeId = '2';
            component.creditTransactionDto.Amount = 100;
            component.creditTransactionDto.OriginalPosition = 1;
            component.creditTransactionDto.CreditTransactionDetails = [];
            component.creditTransactionDto.CreditTransactionDetails.push(
                { AppliedToServiceTransationId: '1234', AccountMemberId: '123456', Amount: 75.00 });
            component.creditTransactionDto.CreditTransactionDetails.push(
                { AppliedToServiceTransationId: '1235', AccountMemberId: '123456', Amount: 25.00 });
            component.addCreditTransactionToList = false;

            // add to list  
            const creditTransaction = cloneDeep(component.creditTransactionDto)
            component.creditTransactionDtoList.push(creditTransaction);

            component.allEncounters = [{}, {}];

            spyOn(component, 'loadServiceAndDebitTransactionDtos');
            spyOn(component, 'updateServiceAdjustmentAmount');
            spyOn(component, 'getEncounterBalanceDue');
            spyOn(component, 'updateTotals');
            spyOn(component, 'setDisableCreateClaims');
            spyOn(component, 'clearDistributionValidation');
        });

        it('should rollback edited CreditTransactionDetail Amounts to initial value', () => {
            component.creditTransactionDto.CreditTransactionDetails[0].Amount = 95.00;
            component.creditTransactionDto.CreditTransactionDetails[1].Amount = 55.00;
            component.rollbackDistributionChanges();
            expect(component.creditTransactionDto.CreditTransactionDetails[0].Amount).toEqual(75.00);
            expect(component.creditTransactionDto.CreditTransactionDetails[1].Amount).toEqual(25.00);

            expect(component.updateServiceAdjustmentAmount).toHaveBeenCalled();
            expect(component.loadServiceAndDebitTransactionDtos).toHaveBeenCalled();
            expect(component.getEncounterBalanceDue).toHaveBeenCalled();
            expect(component.updateTotals).toHaveBeenCalled();
            expect(component.setDisableCreateClaims).toHaveBeenCalled();
        });

        it('should call updateServiceAdjustmentAmount ', () => {
            component.rollbackDistributionChanges();
            expect(component.updateServiceAdjustmentAmount).toHaveBeenCalled();
        });

        it('should call setDisableCreateClaims ', () => {
            component.rollbackDistributionChanges();
            expect(component.setDisableCreateClaims).toHaveBeenCalled();
        });

        it('should call loadServiceAndDebitTransactionDtos ', () => {
            component.rollbackDistributionChanges();
            expect(component.loadServiceAndDebitTransactionDtos).toHaveBeenCalled();
        });

        it('should call updateTotals ', () => {
            component.rollbackDistributionChanges();
            expect(component.updateTotals).toHaveBeenCalled();
        });

        it('should call getEncounterBalanceDue for each Encounter ', () => {
            component.rollbackDistributionChanges();
            component.allEncounters.forEach(encounter => {
                expect(component.getEncounterBalanceDue).toHaveBeenCalled();
            })
        });


        it('should reset allowDistribution and disableSummary and hasDistributionChanges to false ', () => {
            component.allowSaveDistribution = true;
            component.hasDistributionChanges = true;
            component.disableSummary = true;
            component.clearDistributionValidation = jasmine.createSpy().and.callFake(() => {
                component.hasDistributionChanges = false;
            });
            component.rollbackDistributionChanges();
            expect(component.allowSaveDistribution).toBe(false);
            expect(component.disableSummary).toBe(false);
            expect(component.hasDistributionChanges).toBe(false);
        });

        it('should call clearDistributionValidation ', () => {
            component.rollbackDistributionChanges();
            expect(component.clearDistributionValidation).toHaveBeenCalled();
        });
    });

    describe('setCreditTransactionListDetails', () => {
        beforeEach(() => {
            component.priorAdjustments = [];
            component.creditTransactionDtoList = [
                {
                    IsFeeScheduleWriteOff: false, CreditTransactionDetails: [
                        {
                            Amount: 50.00, AppliedToServiceTransationId: null, AppliedToDebitTransactionId: null,
                            EncounterId: '2345', AccountMemberId: '1234', ProviderUserId: null
                        },
                        {
                            Amount: 10.00, AppliedToServiceTransationId: null, AppliedToDebitTransactionId: null,
                            EncounterId: '2345', AccountMemberId: '1234', ProviderUserId: null
                        },
                    ]
                },
                {
                    IsFeeScheduleWriteOff: false, CreditTransactionDetails: [
                        {
                            Amount: 30, AppliedToServiceTransationId: null, AppliedToDebitTransactionId: null,
                            EncounterId: '2346', AccountMemberId: '1235', ProviderUserId: null
                        },
                        {
                            Amount: 20, AppliedToServiceTransationId: null, AppliedToDebitTransactionId: null,
                            EncounterId: '2346', AccountMemberId: '1239', ProviderUserId: null
                        },
                    ]
                }
            ];
        });

        it('should set creditTransaction.IsAllAccountMembersSelected to true if CreditTransaction has more than one account member', () => {
            component.setCreditTransactionListDetails(component.creditTransactionDtoList);
            expect(component.creditTransactionDtoList[0].IsAllAccountMembersSelected).toBe(false);
            expect(component.creditTransactionDtoList[1].IsAllAccountMembersSelected).toBe(true);
        });

        // if creditTransactionDetail is not applied to a service transaction and does not have EncounterId set
        // then its is unapplied, set the ProviderUserId to providerOnUnappliedCredits if one has been selected

        it('should set the ProviderUserId to providerOnUnappliedCredits if providerOnUnappliedCredits is not null' +
            ' and the creditTransactionDetail.EncounterId equals null and AppliedToServiceTransationId equal null', () => {
                component.providerOnUnappliedCredits = '9999';
                component.creditTransactionDtoList[0].CreditTransactionDetails[0].AppliedToDebitTransactionId = '1234';
                component.creditTransactionDtoList[0].CreditTransactionDetails[0].EncounterId = '2345';
                component.creditTransactionDtoList[0].CreditTransactionDetails[1].AppliedToDebitTransactionId = null;
                component.creditTransactionDtoList[0].CreditTransactionDetails[1].EncounterId = null;
                component.setCreditTransactionListDetails(component.creditTransactionDtoList);
                expect(component.creditTransactionDtoList[0].CreditTransactionDetails[0].ProviderUserId).toEqual(null);
                expect(component.creditTransactionDtoList[0].CreditTransactionDetails[1].ProviderUserId).toEqual(component.providerOnUnappliedCredits);
            });

        it('should set CreditTransactionDetails to details from priorAdjustments if match is found', () => {
            component.priorAdjustments = [{ DebitTransactionId: '7777' }];
            component.creditTransactionDtoList[0].CreditTransactionDetails[0].EncounterId = '7777';
            component.setCreditTransactionListDetails(component.creditTransactionDtoList);
            component.creditTransactionDtoList.forEach(creditTransaction => {
                creditTransaction.CreditTransactionDetails.forEach(creditTransactionDetail => {
                    if (creditTransactionDetail.EncounterId === '7777') {
                        expect(creditTransactionDetail.AppliedToServiceTransationId).toBe(null);
                        expect(creditTransactionDetail.EncounterId).toBe(null);
                        expect(creditTransactionDetail.AppliedToDebitTransactionId).toEqual(component.priorAdjustments[0].EncounterId);
                        expect(creditTransactionDetail.AccountMemberId).toBe(component.priorAdjustments[0].AccountMemberId);
                    }
                });
            });
        });
    });

    describe('calculateCurrentUnapplied', () => {
        beforeEach(() => {
            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.CreditTransactionDetails = [];
        });

        it('should calculate currentUnappliedAmount based on creditTransactionDto.CreditTransactionDetails unapplied', () => {
            component.creditTransactionDto.CreditTransactionDetails.push(
                { AppliedToServiceTransationId: null, AppliedToDebitTransactionId: null, EncounterId: null, Amount: 50.00 });
            component.creditTransactionDto.CreditTransactionDetails.push(
                { AppliedToServiceTransationId: '1235', AppliedToDebitTransactionId: null, EncounterId: '123456', Amount: 150.00 });
            component.calculateCurrentUnapplied();
            expect(component.currentUnappliedAmount).toEqual(50);
        });

        it('should calculate currentUnappliedAmount to 0 based on creditTransactionDto.CreditTransactionDetails when no unapplied', () => {
            component.creditTransactionDto.CreditTransactionDetails.push(
                { AppliedToServiceTransationId: '1236', AppliedToDebitTransactionId: null, AccounEncounterIdtMemberId: null, Amount: 50.00 });
            component.creditTransactionDto.CreditTransactionDetails.push(
                { AppliedToServiceTransationId: '1235', AppliedToDebitTransactionId: null, EncounterId: '123456', Amount: 150.00 });
            component.calculateCurrentUnapplied();
            expect(component.currentUnappliedAmount).toEqual(0);
        });
    });

    describe('onCreditAmountChange', () => {
        let serviceTransaction;
        let amount;
        let isValid;
        beforeEach(() => {
            isValid = true;
            component.creditTransactionDto = new CreditTransaction();
            serviceTransaction = { DueNow: 100.00, Detail: { Amount: 0, } };
            amount = { OldValue: 0, NewValue: 25.00 };
            spyOn(component, 'validateCreditTransactionDto').and.callFake(() => isValid);
            spyOn(component, 'updateUnappliedCreditAmount');
            spyOn(component, 'validateServiceTransaction');
        });

        it('should call validateServiceTransaction', () => {
            amount = { OldValue: 0, NewValue: 25.00 };
            component.onCreditAmountChange(serviceTransaction, amount);
            expect(component.validateServiceTransaction).toHaveBeenCalledWith(serviceTransaction);
        });

        it('should set DueNow to DueNow plus Difference between OldValue and NewValue', () => {
            amount = { OldValue: 0, NewValue: 25.00 };
            component.onCreditAmountChange(serviceTransaction, amount);
            expect(serviceTransaction.DueNow).toEqual(75.00);
        });

        it('should set serviceTransaction.Detail.Amount to NewValue', () => {

            amount = { OldValue: 0, NewValue: 25.00 };
            component.onCreditAmountChange(serviceTransaction, amount);
            expect(serviceTransaction.Detail.Amount).toEqual(25.00);
        });

        it('should call this.updateUnappliedCreditAmount', () => {
            component.onCreditAmountChange(serviceTransaction, amount);
            expect(component.updateUnappliedCreditAmount).toHaveBeenCalled();
        });

        it('should call this.validateCreditTransactionDto', () => {
            component.onCreditAmountChange(serviceTransaction, amount);
            expect(component.validateCreditTransactionDto).toHaveBeenCalled();
        });

        it('should not set hasDistributionChanges to true if validateCreditTransactionDto returns false', () => {
            isValid = false;
            component.onCreditAmountChange(serviceTransaction, amount);
            expect(component.allowSaveDistribution).toBe(false);
        });

        it('should set allowSaveDistribution to true if validateCreditTransactionDto returns true', () => {
            isValid = true;
            component.onCreditAmountChange(serviceTransaction, amount);
            expect(component.allowSaveDistribution).toBe(true);
        });
    });

    describe('setHasDistributionChanges', () => {
        beforeEach(() => {
            component.hasDistributionChanges = false;
            component.allowSaveDistribution = true;
        });

        it('should set hasDistributionChanges to true ', () => {
            component.setHasDistributionChanges('test');
            expect(component.hasDistributionChanges).toBe(true);
        });

        it('should set allowSaveDistribution to false', () => {
            component.setHasDistributionChanges('test');
            expect(component.allowSaveDistribution).toBe(false);
        });
    });

    describe('saveDistribution', () => {
        let isValid = true;
        beforeEach(() => {
            spyOn(component, 'validateCreditTransactionDto').and.callFake(() => isValid);
            spyOn(component, 'updateServiceAdjustmentAmount').and.callFake(() => { });
            spyOn(component, 'updateTotals').and.callFake(() => { });
            spyOn(component, 'updateCreditTransactionDtoDetails').and.callFake(() => { });
            spyOn(component, 'checkHasPriorBalanceDistributions');
            component.dataForUnappliedTransactions = {
                totalAvailableCredit: 0,
                totalBalanceDue: 0, totalUnappliedAmount: 0,
                unappliedCreditTransactions: []
            };
            component.dataForUnappliedTransactions.unappliedCreditTransactions = [
                { AvailableUnassignedAmount: 50 },
                { AvailableUnassignedAmount: 25 },
                { AvailableUnassignedAmount: 0 },
            ];
            component.creditTransactionDtoList = [];
            component.allEncounters = [{}, {}];
            spyOn(component, 'getEncounterBalanceDue').and.callFake(() => { });

            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.CreditTransactionDetails = [];
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1234' });
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1235' });
        });

        it('should call updateServiceAdjustmentAmount if validateCreditTransactionDto returns true ', () => {
            isValid = true;
            component.saveDistribution();
            expect(component.updateServiceAdjustmentAmount).toHaveBeenCalled();
        });


        it('should call checkHasPriorBalanceDistributions', () => {
            isValid = true;
            component.saveDistribution();
            expect(component.checkHasPriorBalanceDistributions).toHaveBeenCalled();
        });

        it('should not call updateServiceAdjustmentAmount if validateCreditTransactionDto returns false ', () => {
            isValid = false;
            component.saveDistribution();
            expect(component.updateServiceAdjustmentAmount).not.toHaveBeenCalled();
        });

        it('should call component.getEncounterBalanceDue for allEncounters if validateCreditTransactionDto returns true', () => {
            isValid = true;
            component.saveDistribution();
            component.allEncounters.forEach(encounter => {
                expect(component.getEncounterBalanceDue).toHaveBeenCalledWith(encounter);
            });
        });

        it('should call patientCheckoutService.resetCurrentCreditTransaction if validateCreditTransactionDto returns true ', () => {
            isValid = true;
            mockPatientCheckoutService.resetCurrentCreditTransaction = jasmine.createSpy().and.callFake((creditTransactionDto, []) => {
                creditTransactionDto.Amount = 0;
            });
            component.saveDistribution();
            expect(mockPatientCheckoutService.resetCurrentCreditTransaction).toHaveBeenCalled();
            expect(component.creditTransactionDto.Amount).toBe(0);
        });

        it('should call updateCreditTransactionDtoDetails if validateCreditTransactionDto returns true ', () => {
            isValid = true;
            component.saveDistribution();
            expect(component.updateCreditTransactionDtoDetails).toHaveBeenCalled();
        });

        it('should call updateTotals and reset variables if validateCreditTransactionDto returns true ', async () => {
            isValid = true;
            component.saveDistribution();
            await component.updateCreditTransactionDtoDetails();
            expect(component.updateTotals).toHaveBeenCalled();
            expect(component.hasDistributionChanges).toBe(false);
            expect(component.disableSummary).toBe(false);
            expect(component.allowSaveDistribution).toBe(false);            
        });

        it('should set component.disableCreditDistribution to true', async () => {
            component.saveDistribution();
            await component.updateCreditTransactionDtoDetails();
            expect(component.disableCreditDistribution).toBe(true);
        });

        it('should set currentUnappliedAmount to zero', async () => {
            component.saveDistribution();
            await component.updateCreditTransactionDtoDetails();
            expect(component.currentUnappliedAmount).toEqual(0);
        });
    });


    describe('validateCreditTransactionDto method', () => {
        let creditTransactionDto;
        beforeEach(() => {
            creditTransactionDto = new CreditTransaction();
            creditTransactionDto.CreditTransactionDetails = [];
            creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: null, Amount: 20 });
            creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: null, Amount: 30.00 });

            component.serviceAndDebitTransactionDtos = [
                { DueNow: 11.00, Detail: { Amount: 20.00 } },
                { DueNow: 11.00, Detail: { Amount: 20.00 } },
            ];
        });
        it('should return false if both creditTransactionDto.AdjustmentTypeId and PaymentTypeId are null or empty', () => {
            creditTransactionDto.AdjustmentTypeId = null;
            creditTransactionDto.PaymentTypeId = null;
            expect(component.validateCreditTransactionDto(creditTransactionDto)).toBe(false);
        });

        it('should return false if creditTransactionDto.Amount is negative', () => {
            creditTransactionDto.AdjustmentTypeId = null;
            creditTransactionDto.PaymentTypeId = 2;
            creditTransactionDto.Amount = -2;
            expect(component.validateCreditTransactionDto(creditTransactionDto)).toBe(false);
        });

        it('should return false if creditTransactionDto.Amount does not equal the total of the CreditTransactionDetails amounts', () => {
            creditTransactionDto.AdjustmentTypeId = null;
            creditTransactionDto.PaymentTypeId = 2;
            creditTransactionDto.Amount = 49;
            expect(component.validateCreditTransactionDto(creditTransactionDto)).toBe(false);
        });

        it('should return false if creditTransactionDto.Amount does not equal the total of the CreditTransactionDetails amounts that dont have ObjectState = Delete', () => {
            creditTransactionDto.CreditTransactionDetails = [];
            creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: null, Amount: 20 });
            creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: null, Amount: 30.00 });
            creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1235', Amount: 50.00, ObjectState: 'Delete'});

            creditTransactionDto.AdjustmentTypeId = null;
            creditTransactionDto.PaymentTypeId = 2;
            creditTransactionDto.Amount = 49.00;
            expect(component.validateCreditTransactionDto(creditTransactionDto)).toBe(false);
        });

        it('should return true if creditTransactionDto.Amount does equal the total of the CreditTransactionDetails amounts that dont have ObjectState = Delete', () => {
            creditTransactionDto.CreditTransactionDetails = [];
            creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: null, Amount: 20 });
            creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: null, Amount: 30.00 });
            creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1235', Amount: 50.00, ObjectState: 'Delete'});

            creditTransactionDto.AdjustmentTypeId = null;
            creditTransactionDto.PaymentTypeId = 2;
            creditTransactionDto.Amount = 50;
            expect(component.validateCreditTransactionDto(creditTransactionDto)).toBe(true);
        });


        it('should return false if any of the serviceTransactionDtos.Detail.DueNow is negative', () => {
            creditTransactionDto.AdjustmentTypeId = null;
            creditTransactionDto.PaymentTypeId = 2;
            creditTransactionDto.Amount = 50;
            component.dataForUnappliedTransactions.totalAvailableCredit = 50.00;
            component.serviceAndDebitTransactionDtos = [
                { DueNow: -11.00, Detail: { Amount: 20.00 } },
                { DueNow: 11.00, Detail: { Amount: 20.00 } },
            ];
            expect(component.validateCreditTransactionDto(creditTransactionDto)).toBe(false);
        });


        it('should return true if all above conditions are met', () => {
            creditTransactionDto.AdjustmentTypeId = null;
            creditTransactionDto.PaymentTypeId = 2;
            creditTransactionDto.Amount = 50;
            component.dataForUnappliedTransactions.totalAvailableCredit = 50.00;
            component.serviceAndDebitTransactionDtos = [
                { DueNow: 11.00, Detail: { Amount: 20.00 } },
                { DueNow: 11.00, Detail: { Amount: 20.00 } },
            ];
            expect(component.validateCreditTransactionDto(creditTransactionDto)).toBe(true);
        });
    });

    describe('displayAppliedAmountError method', () => {
        let serviceTransaction;
        beforeEach(() => {
            serviceTransaction = { HasExcessiveAppliedAmount: false, HasNegativeBalance: false };
        });
    });

    describe('validateServiceTransaction method', () => {
        let serviceTransaction;
        beforeEach(() => {
            component.serviceAndDebitTransactionDtos = [];
            component.serviceAndDebitTransactionDtos.push({ ServiceTransactionId: '1234', HasExcessiveAppliedAmount: false, HasNegativeBalance: false, DueNow: 0 });
            component.serviceAndDebitTransactionDtos.push({ ServiceTransactionId: '1235', HasExcessiveAppliedAmount: false, HasNegativeBalance: false, DueNow: 0 });
            component.serviceAndDebitTransactionDtos.push({ ServiceTransactionId: '1236', HasExcessiveAppliedAmount: false, HasNegativeBalance: false, DueNow: 0 });
            component.serviceAndDebitTransactionDtos.push({ ServiceTransactionId: '1237', HasExcessiveAppliedAmount: false, HasNegativeBalance: false, DueNow: 0 });

            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.CreditTransactionDetails = [];
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1234', Amount: 50.00 });
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1235', Amount: 25.00 });
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1236', Amount: 10.00 });
        });
        it('should set serviceTransaction.HasNegativeBalance to true and InvalidInputErrorMessage if serviceTransaction.DueNow is negative amount', () => {
            serviceTransaction = component.serviceAndDebitTransactionDtos[1];
            serviceTransaction.showAppliedAmountError = false;
            serviceTransaction.HasNegativeBalance = false;
            mockTranslateService.instant = jasmine.createSpy().and.returnValue('Applied amount cannot exceed Patient Balance.');
            serviceTransaction.DueNow = -10.00;
            component.validateServiceTransaction(serviceTransaction);
            expect(serviceTransaction.HasNegativeBalance).toBe(true);
            expect(serviceTransaction.InvalidInputErrorMessage).toBe('Applied amount cannot exceed Patient Balance.');
        });


        it('should set serviceTransaction.HasExcessiveAppliedAmount to false on all of the other serviceTransactions if sum of ' +
        'creditTransactionDetail.Amount is more than the creditTransactionDto.Amount (should Ignore credit transaction details with ObjectState of Delete)', () => {
            serviceTransaction = component.serviceAndDebitTransactionDtos[1];
            serviceTransaction.DueNow = 0;
            
            mockTranslateService.instant = jasmine.createSpy().and.returnValue('Applied amount cannot exceed Payment or Adjustment amount.');
            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.Amount = 50.00;
            component.creditTransactionDto.CreditTransactionDetails = [];
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1234', Amount: 45.00 });
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1235', Amount: 25.00 });
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1236', Amount: 10.00 });
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: null, Amount: 25.00, ObjectState: 'Delete' });

            component.validateServiceTransaction(serviceTransaction);
            component.serviceAndDebitTransactionDtos.forEach(x => {
                if (x.ServiceTransactionId === serviceTransaction.ServiceTransactionId) {
                    expect(x.HasExcessiveAppliedAmount).toBe(true);
                    expect(x.InvalidInputErrorMessage).toBe('Applied amount cannot exceed Payment or Adjustment amount.');
                } else {
                    expect(x.HasExcessiveAppliedAmount).toBe(false);
                    expect(x.InvalidInputErrorMessage).toBe(undefined);
                }
            })
        });

        it('should set serviceTransaction.HasExcessiveAppliedAmount to false on serviceTransaction param if sum of ' +
        'creditTransactionDetail.Amount is less than or equal to the creditTransactionDto.Amount (should Ignore credit transaction details with ObjectState of Delete)', () => {
            serviceTransaction = component.serviceAndDebitTransactionDtos[1];
            serviceTransaction.DueNow = 0;
            
            mockTranslateService.instant = jasmine.createSpy().and.returnValue('Applied amount cannot exceed Payment or Adjustment amount.');
            component.creditTransactionDto = new CreditTransaction();
            component.creditTransactionDto.Amount = 80.00;
            component.creditTransactionDto.CreditTransactionDetails = [];
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1234', Amount: 45.00 });
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1235', Amount: 25.00 });
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: '1236', Amount: 10.00 });
            component.creditTransactionDto.CreditTransactionDetails.push({ AppliedToServiceTransationId: null, Amount: 25.00, ObjectState: 'Delete' });
            component.validateServiceTransaction(serviceTransaction);
            component.serviceAndDebitTransactionDtos.forEach(x => {
                if (x.ServiceTransactionId === serviceTransaction.ServiceTransactionId) {
                    expect(x.HasExcessiveAppliedAmount).toBe(false);
                    expect(x.InvalidInputErrorMessage).toBe('');
                } else {
                    expect(x.HasExcessiveAppliedAmount).toBe(false);
                    expect(x.InvalidInputErrorMessage).toBe(undefined);
                }
            })
        });
    });

    describe('updateTotals', () => {
        beforeEach(() => {
            mockPatientCheckoutService.getCheckoutTotals = jasmine.createSpy().and.returnValue({ totalUnappliedCredit: 50 });
            component.dataForUnappliedTransactions = {
                totalAvailableCredit: 0,
                totalBalanceDue: 0, totalUnappliedAmount: 0,
                unappliedCreditTransactions: []
            };
            component.dataForUnappliedTransactions.unappliedCreditTransactions = [
                { AvailableUnassignedAmount: 50 },
                { AvailableUnassignedAmount: 25 },
                { AvailableUnassignedAmount: 0 },
            ];
            component.creditTransactionDtoList = [
                { OriginalPosition: 1, RelatedCreditTransactionId: '1111' },
                { OriginalPosition: 2, RelatedCreditTransactionId: '4444' },
                { OriginalPosition: 3, RelatedCreditTransactionId: '6666' }];

            spyOn(component, 'calculateFeeScheduleAdjustment');
            component.allEncounters = [
                { FeeScheduleAdjustment: 50.00 },
                { FeeScheduleAdjustment: 150.00 },
            ];
        });

        it('should set updateSummary to not updateSummary', () => {
            component.updateSummary = true;
            component.updateTotals();
            expect(component.updateSummary).toBe(false);
        });

        it('should call patientCheckoutService.getCheckoutTotals', () => {
            component.updateTotals();
            expect(mockPatientCheckoutService.getCheckoutTotals).toHaveBeenCalled();
        });

        it('should call calculateFeeScheduleAdjustment for each encounter in checkout', () => {
            component.updateTotals();
            component.allEncounters.forEach(encounter => {
                expect(component.calculateFeeScheduleAdjustment).toHaveBeenCalledWith(encounter);
            })
        });

        it('should calculate dataForUnappliedTransactions.totalAvailableCredit to equal ' +
            'dataForUnappliedTransactions.totalUnappliedAmount minus summaryTotals.totalUnappliedCredit', () => {
                component.dataForUnappliedTransactions.totalUnappliedAmount = 100.00;
                mockPatientCheckoutService.getCheckoutTotals = jasmine.createSpy().and.returnValue(
                    { totalUnappliedCredit: 50, totalBalanceDue: 25.00 });

                component.updateTotals();
                expect(component.dataForUnappliedTransactions.totalAvailableCredit).toEqual(50.00);
                expect(component.dataForUnappliedTransactions.totalBalanceDue).toEqual(25.00);
            });
    })

    describe('clearDistributionValidation', () => {
        beforeEach(() => {
            component.serviceAndDebitTransactionDtos = [
                { ServiceTransactionId: '1234', AdjustmentAmount: 10, Balance: 100 },
                { ServiceTransactionId: '1235', AdjustmentAmount: 10, Balance: 75 },
                { ServiceTransactionId: '1236', AdjustmentAmount: 10, Balance: 50 },
                { ServiceTransactionId: '1237', AdjustmentAmount: 0, Balance: 25 }];

        });

        it('should set all serviceTransaction distribution validation messages to initial state', () => {
            component.serviceAndDebitTransactionDtos[0] = {
                ServiceTransactionId: '1234',
                AdjustmentAmount: 10,
                HasExcessiveAppliedAmount: true,
                HasNegativeBalance: true,
                InvalidInputErrorMessage: 'Fake Error Message',
                showAppliedAmountError: true,
                DueNow: -15.00,
                Balance: 100
            },
            component.clearDistributionValidation();
            component.serviceAndDebitTransactionDtos.forEach(serviceTransaction => {
                expect(serviceTransaction.HasExcessiveAppliedAmount).toBe(false);
                expect(serviceTransaction.HasNegativeBalance).toBe(false);
                expect(serviceTransaction.showAppliedAmountError).toBe(false);
                expect(serviceTransaction.InvalidInputErrorMessage).toBe('');
            })
        });

        it('should set showAppliedAmountError and hasDistributionChanges to false', () => {
            component.showAppliedAmountError = true;
            component.hasDistributionChanges = true;
            component.clearDistributionValidation();
            expect(component.hasDistributionChanges).toBe(false);
            expect(component.showAppliedAmountError).toBe(false);
        });
    });

    describe('promptToSaveOrRollbackDistribution', () => {
        beforeEach(() => {
            component.serviceAndDebitTransactionDtos = [
                { ServiceTransactionId: '1234', AdjustmentAmount: 10, Balance: 100 },
                { ServiceTransactionId: '1235', AdjustmentAmount: 10, Balance: 75 },
                { ServiceTransactionId: '1236', AdjustmentAmount: 10, Balance: 50 },
                { ServiceTransactionId: '1237', AdjustmentAmount: 0, Balance: 25 }];
            component.hasDistributionChanges = true;
        });

        it('should set call promptDistributionWarning if hasDistributionChanges is true and distribution has validation errors', () => {
            spyOn(component, 'promptDistributionWarning');
            component.serviceAndDebitTransactionDtos[0] = {
                ServiceTransactionId: '1234',
                AdjustmentAmount: 10,
                HasExcessiveAppliedAmount: true,
                HasNegativeBalance: true,
                InvalidInputErrorMessage: 'Fake Error Message',
                showAppliedAmountError: true,
                DueNow: -15.00,
                Balance: 100
            }
            component.promptToSaveOrRollbackDistribution();
            expect(component.promptDistributionWarning).toHaveBeenCalled();

        });

        it('should set call promptSaveDistribution if hasDistributionChanges is true and distribution does not have validation errors', () => {
            spyOn(component, 'promptSaveDistribution');
            component.serviceAndDebitTransactionDtos[0] = {
                ServiceTransactionId: '1234',
                AdjustmentAmount: 10,
                HasExcessiveAppliedAmount: false,
                HasNegativeBalance: false,
                InvalidInputErrorMessage: '',
                showAppliedAmountError: false,
                DueNow: 15.00,
                Balance: 100
            }
            component.promptToSaveOrRollbackDistribution();
            expect(component.promptSaveDistribution).toHaveBeenCalled();

        });
    });

    describe('togglePriorBalanceSection', () => {
        beforeEach(() => {
            component.showPriorBalance = true;
        });

        it('should set showPriorBalance to false if includePriorBalance is false', () => {
            component.includePriorBalance = false;
            component.togglePriorBalanceSection();
            expect(component.showPriorBalance).toBe(false);
        });

        it('should not set showPriorBalance to false if includePriorBalance is true', () => {
            component.includePriorBalance = true;
            component.togglePriorBalanceSection();
            expect(component.showPriorBalance).toBe(true);
        });
    });

    describe('checkHasCompletedPriorBalanceDistributions', () => {

        it('should return true if at least one creditTransaction in creditTransactionDtoList has hasPriorBalanceAmounts set to true', () => {
            component.creditTransactionDtoList = [
                { hasPriorBalanceAmounts: true },
                { hasPriorBalanceAmounts: false },
                {}];
            expect(component.checkHasCompletedPriorBalanceDistributions()).toBe(true);
        });

        it('should return false if no creditTransactions in creditTransactionDtoList has hasPriorBalanceAmounts set to true', () => {
            component.creditTransactionDtoList = [
                { hasPriorBalanceAmounts: false },
                { hasPriorBalanceAmounts: false },
                {}];
            expect(component.checkHasCompletedPriorBalanceDistributions()).toBe(false);
        });
    });

    describe('checkHasPriorBalanceDistributions', () => {

        it('should return true if at least one serviceAndDebitTransactionDtos EncounterType is Prior and Detail.Amount is more than 0', () => {
            component.serviceAndDebitTransactionDtos = [
                { EncounterType: 'Prior', Detail: { Amount: .00 } },
                { EncounterType: 'Prior', Detail: { Amount: 50.00 } },
                { EncounterType: 'Prior', Detail: { Amount: .00 } },]
            expect(component.checkHasPriorBalanceDistributions()).toBe(true);
        });

        it('should return false if no serviceAndDebitTransactionDtos EncounterType is Prior and Detail.Amount is more than 0', () => {
            component.serviceAndDebitTransactionDtos = [
                { EncounterType: 'Prior', Detail: { Amount: .00 } },
                { EncounterType: 'Current', Detail: { Amount: 50.00 } },
                { EncounterType: 'Prior', Detail: { Amount: .00 } },]
            expect(component.checkHasPriorBalanceDistributions()).toBe(false);
        });

        it('should return false if serviceAndDebitTransactionDtos EncounterType is Prior but no Detail', () => {
            component.serviceAndDebitTransactionDtos = [
                { EncounterType: 'Prior',  },
                { EncounterType: 'Current', Detail: { Amount: 50.00 }}];
                
            expect(component.checkHasPriorBalanceDistributions()).toBe(false);
        });
    });

    describe('checkServicesForErrors', () => {

        it('should return true if at least one serviceAndDebitTransactionDtos HasExcessiveAppliedAmount is true', () => {
            component.serviceAndDebitTransactionDtos = [
                { EncounterType: 'Prior', HasExcessiveAppliedAmount: true, Detail: { Amount: .00 } },
                { EncounterType: 'Prior', Detail: { Amount: 50.00 } },
                { EncounterType: 'Prior', Detail: { Amount: .00 } },]
            expect(component.checkServicesForErrors()).toBe(true);
        });

        it('should return true if at least one serviceAndDebitTransactionDtos HasNegativeBalance is true', () => {
            component.serviceAndDebitTransactionDtos = [
                { EncounterType: 'Prior', HasNegativeBalance: true, Detail: { Amount: .00 } },
                { EncounterType: 'Prior', Detail: { Amount: 50.00 } },
                { EncounterType: 'Prior', Detail: { Amount: .00 } },]
            expect(component.checkServicesForErrors()).toBe(true);
        });
        it('should return false if no serviceAndDebitTransactionDtos HasNegativeBalance is true and HasExcessiveAppliedAmount is true', () => {
            component.serviceAndDebitTransactionDtos = [
                { EncounterType: 'Prior', HasNegativeBalance: false, Detail: { Amount: .00 } },
                { EncounterType: 'Prior', Detail: { Amount: 0.00 } },
                { EncounterType: 'Prior', Detail: { Amount: .00 } },]
            expect(component.checkServicesForErrors()).toBe(false);
        });
    });

    describe('includePriorBalanceChange', () => {
        beforeEach(() => {
            spyOn(component, 'promptModalWarning');
            spyOn(component, 'updateTotals');
            spyOn(component, 'togglePriorBalanceSection');
            spyOn(component, 'promptToSaveOrRollbackDistribution');
            spyOn(component, 'loadServiceAndDebitTransactionDtos');
        });

        it('should call promptModalWarning if checkHasCompletedPriorBalanceDistributions returns true', () => {
            spyOn(component, 'checkHasCompletedPriorBalanceDistributions').and.returnValue(true);
            component.includePriorBalanceChange(true);
            expect(component.includePriorBalance).toBe(true);
            expect(component.promptModalWarning).toHaveBeenCalled();
        });

        it('should call promptToSaveOrRollbackDistribution if checkHasCompletedPriorBalanceDistributions returns false' +
            'and checkHasPriorBalanceDistributions returns true', () => {
                spyOn(component, 'checkHasCompletedPriorBalanceDistributions').and.returnValue(false);
                spyOn(component, 'checkHasPriorBalanceDistributions').and.returnValue(true);
                component.includePriorBalanceChange(true);
                expect(component.includePriorBalance).toBe(true);
                expect(component.promptToSaveOrRollbackDistribution).toHaveBeenCalled();
            });

        it('should call loadServiceAndDebitTransactionDtos if checkHasCompletedPriorBalanceDistributions returns false' +
            'and checkHasPriorBalanceDistributions returns false', () => {
                spyOn(component, 'checkHasCompletedPriorBalanceDistributions').and.returnValue(false);
                spyOn(component, 'checkHasPriorBalanceDistributions').and.returnValue(false);
                component.includePriorBalanceChange(true);
                expect(component.includePriorBalance).toBe(true);
                expect(component.loadServiceAndDebitTransactionDtos).toHaveBeenCalled();
                expect(component.updateTotals).toHaveBeenCalled();
                expect(component.togglePriorBalanceSection).toHaveBeenCalled();
            });
    });

   
    describe('getPatientId method', () => {
        const encounterId = '1234';
        beforeEach(() => {
            component.allEncounters = [{
                PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }, {
                PatientName: 'Charlene Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1236', ObjectState: 'None',
                ServiceTransactionDtos: []
            }];
            component.accountMembersDetails = [
                { AccountMemberId: '1234', PersonId: '2345' },
                { AccountMemberId: '1235', PersonId: '2346' },
                { AccountMemberId: '1236', PersonId: '2347' }];            
        });
        it('should return PatientId based on AccountMemberId from encounter that matches encounterId if matching accountMemberDetails', () => {
            expect(component.getPatientId(1235)).toEqual('2347');
            expect(component.getPatientId(1234)).toEqual('2346');
        });

        it('should return null if no match', () => {
            expect(component.getPatientId(1237)).toEqual(null);
        });
    });

    describe('cancelCheckout', () => {
        it('should emit with data object if parameter is not null', () => {
            spyOn(component, 'getPatientId').and.returnValue('5678')
            var encounterId = '1234';
            spyOn(component.cancel, 'emit');            
            component.cancelCheckout(encounterId);
            expect(component.cancel.emit).toHaveBeenCalledWith({EncounterId: '1234', PatientId:'5678'});
        });

        it('should emit with null data.PatientId if null returned from getPatientId', () => { 
            spyOn(component, 'getPatientId').and.returnValue(null)
            var encounterId = '1234';           
            spyOn(component.cancel, 'emit');            
            component.cancelCheckout(encounterId);
            expect(component.cancel.emit).toHaveBeenCalledWith({EncounterId: '1234', PatientId:null});
        });

        it('should emit with no parameter if encounterId is undefined', () => {
            spyOn(component, 'getPatientId').and.returnValue(null) 
            var encounterId = undefined;           
            spyOn(component.cancel, 'emit');            
            component.cancelCheckout(encounterId);
            expect(component.cancel.emit).toHaveBeenCalled();
        });
    })

    
    describe('updateUnappliedCreditAmount', () => {
       
        it('should update unappliedAmount to reflect difference between applied amounts and CreditTransaction.Amount', () => {
            component.currentUnappliedAmount=0;
            component.creditTransactionDto = new CreditTransaction(); 
            component.creditTransactionDto.Amount = 400;
            component.creditTransactionDto.CreditTransactionDetails=[
                {AppliedToServiceTransationId:'1234', EncounterId: '5678', AppliedToDebitTransactionId: null, Amount: 100},
                {AppliedToServiceTransationId:'1234', EncounterId: '5678', AppliedToDebitTransactionId: null, Amount: 50},
                {AppliedToServiceTransationId:null, EncounterId: '5678', AppliedToDebitTransactionId: '91011', Amount: 100},
                { AppliedToServiceTransationId:null, EncounterId:null, AppliedToDebitTransactionId: null, Amount:0 }
            ];        
            component.updateUnappliedCreditAmount();
            expect(component.currentUnappliedAmount).toEqual(150);
        });

        it('should not update unappliedAmount when no unnappllied record is found', () => {
            component.currentUnappliedAmount=0;
            component.creditTransactionDto = new CreditTransaction(); 
            component.creditTransactionDto.Amount = 400;
            component.creditTransactionDto.CreditTransactionDetails=[
                {AppliedToServiceTransationId:'1234', EncounterId: '5678', AppliedToDebitTransactionId: null, Amount: 100},
                {AppliedToServiceTransationId:'1234', EncounterId: '5678', AppliedToDebitTransactionId: null, Amount: 50},
                {AppliedToServiceTransationId:null, EncounterId: '5678', AppliedToDebitTransactionId: '91011', Amount: 100}
            ];        
            component.updateUnappliedCreditAmount();
            expect(component.currentUnappliedAmount).toEqual(0);
        });
    })

    describe('getServiceTransactionEstimatesList', () => {
         beforeEach(() => {
            component.patientEncounters = [{
                EncounterId: '1234', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '2222', CreateClaim: true }, 
                    { ServiceTransactionId: '2223', CreateClaim: true }]}, {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '3333', CreateClaim: true },
                    { ServiceTransactionId: '3334', CreateClaim: true }]}, {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '3335', CreateClaim: true }]
            }];
            
        });

        it('should return a single list of services for all pending encounters in checkout', () => {  
            let serviceTransactionEstimatesList = component.getServiceTransactionEstimatesList();
            expect(serviceTransactionEstimatesList[0]).toEqual(component.patientEncounters[0].ServiceTransactionDtos[0]);
            expect(serviceTransactionEstimatesList[1]).toEqual(component.patientEncounters[0].ServiceTransactionDtos[1]);            
            expect(serviceTransactionEstimatesList[2]).toEqual(component.patientEncounters[1].ServiceTransactionDtos[0]);            
            expect(serviceTransactionEstimatesList[3]).toEqual(component.patientEncounters[1].ServiceTransactionDtos[1]);            
            expect(serviceTransactionEstimatesList[4]).toEqual(component.patientEncounters[2].ServiceTransactionDtos[0]);            
        });
    });

    describe('calculateServiceEstimates', () => {
        let serviceTransactionEstimatesList: any[];
        let servicesToExclude : any[];
        beforeEach(() => {
            component.feeScheduleAdjustmentRemoved = [];
            component.patientEncounters = [{
                EncounterId: '1234', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '2222', CreateClaim: true }, 
                    { ServiceTransactionId: '2223', CreateClaim: true }]}, {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '3333', CreateClaim: true },
                    { ServiceTransactionId: '3334', CreateClaim: false }]}, {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '3335', CreateClaim: true }]
            }];
            // create list of all services on pending encounters to checkout
            serviceTransactionEstimatesList = component.getServiceTransactionEstimatesList();
            // create array of services guids to exclude
            servicesToExclude = component.getServicesToExclude();
            let res = {Value: {Services: serviceTransactionEstimatesList, ExcludeFromClaim: servicesToExclude}}
            spyOn(component, 'updateMatchingServiceTransaction');
            mockPatientServices.ServiceTransactions = {
                serviceEstimates: jasmine.createSpy().and.returnValue({
                    $promise: { then: (success, failure) => success(res) }
                }),               
            };
        });
        
        it('should call patientServices.ServiceTransactions.serviceEstimates with list all services on pending encounters in checkout '+
        ' and list of guids to exclude from estimates for claim', () => {  
            component.calculateServiceEstimates(serviceTransactionEstimatesList, servicesToExclude, component.feeScheduleAdjustmentRemoved);
            expect(mockPatientServices.ServiceTransactions.serviceEstimates).toHaveBeenCalledWith({Services: serviceTransactionEstimatesList, ExcludeFromClaim: servicesToExclude, RemoveAdjustment: []})
        });

        it('should call component.updateMatchingServiceTransaction for each service in resolve.Services', (done) => {
            // mock return object
            const objReturned = {Value:{Services: serviceTransactionEstimatesList, ExcludeFromClaim: servicesToExclude}};
            component.calculateServiceEstimates(serviceTransactionEstimatesList, servicesToExclude, component.feeScheduleAdjustmentRemoved);
            mockPatientServices.ServiceTransactions.serviceEstimates().$promise.then((res) => {
                res.Value.Services.forEach(service => {                
                    expect(component.updateMatchingServiceTransaction).toHaveBeenCalledWith(service, serviceTransactionEstimatesList)
                });                            
                done();
            });
        });
    });

    describe('removeFeeScheduleAdjustmentItem', () => {

        let feeScheduleAdjustmentItem;
        beforeEach(() => {
            component.paymentTypes = [
                { PaymentTypeId: 1, CurrencyTypeId: 3 },
                { PaymentTypeId: 2, CurrencyTypeId: 5 },
                { PaymentTypeId: 3, CurrencyTypeId: 4 }
            ];
            component.userLocation = {
                IsPaymentGatewayEnabled: true
            }

            feeScheduleAdjustmentItem = { Amount: 50, OriginalPosition: 3, FeeScheduleAdjustmentForEncounterId: '1122' };

            component.creditTransactionDtoList = [
                { OriginalPosition: 3, PaymentGatewayTransactionId: '1235', PaymentTypeId: 1, CreditTransactionDetails:  [{ CreditTransactionDetailId: null, AppliedToServiceTransactionId: '2222' }] },
                { OriginalPosition: 2, PaymentGatewayTransactionId: '1236', PaymentTypeId: 3, CreditTransactionDetails:  [{ CreditTransactionDetailId: null, AppliedToServiceTransactionId: '2223'}] },
                { OriginalPosition: 1, FeeScheduleAdjustmentForEncounterId: '1122', CreditTransactionDetails: [
                    { CreditTransactionDetailId: null , AppliedToServiceTransationId: '2224'}] },
            ];

            component.feeScheduleAdjustmentRemoved = [];
            spyOn(component, 'removeCredit')
            spyOn(component, 'getServiceTransactionEstimatesList');
            component.calculateServiceEstimates = jasmine.createSpy().and.callFake(() => {
                return {
                    then(callback) {
                        callback({});
                    }
                };
            })
            spyOn(component, 'getServicesToExclude');
            component.serviceAndDebitTransactionDtos = [{ServiceTransactionId: '1234', }, {ServiceTransactionId: '2232', }, {ServiceTransactionId: '2224', }];

            component.allEncounters = [{
                PatientName: 'Charley Daniels', EncounterId: 1234, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }, {
                PatientName: 'Charley Daniels', EncounterId: 1235, Status: 2, AccountMemberId: '1235', ObjectState: 'None',
                ServiceTransactionDtos: []
            }];
            
        });

        it('should add matching serviceTransaction.ServiceTransactionId to component.feeScheduleAdjustmentRemoved for all '+
        'serviceTransactions that match the AppliedToServiceTransationId from the fee schedule adjustment ', () => { 
            component.removeFeeScheduleAdjustmentItem(feeScheduleAdjustmentItem);
            expect(component.feeScheduleAdjustmentRemoved).toEqual(['2224']);
        }); 

        it('should call getServiceTransactionEstimatesList ', () => { 
            component.removeFeeScheduleAdjustmentItem(feeScheduleAdjustmentItem);
            expect(component.getServiceTransactionEstimatesList).toHaveBeenCalled();
        });

        it('should call getServiceTransactionEstimatesList ', () => { 
            component.removeFeeScheduleAdjustmentItem(feeScheduleAdjustmentItem);
            expect(component.getServicesToExclude).toHaveBeenCalled();
        });

        it('should call getServiceTransactionEstimatesList ', () => { 
            component.removeFeeScheduleAdjustmentItem(feeScheduleAdjustmentItem);
            expect(component.calculateServiceEstimates).toHaveBeenCalled();
        });

        it('should call removeCredit after successful call to calculateServiceEstimates ', () => { 
            component.removeFeeScheduleAdjustmentItem(feeScheduleAdjustmentItem);
            expect(component.removeCredit).toHaveBeenCalled();
        });
    });

    describe('getServicesToExclude', () => {
        beforeEach(() => {
            component.patientEncounters = [{
                EncounterId: '1234', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '2222', CreateClaim: true }, 
                    { ServiceTransactionId: '2223', CreateClaim: false }]}, {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '3333', CreateClaim: false },
                    { ServiceTransactionId: '3334', CreateClaim: true }]}, {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '3335', CreateClaim: true }]
            }];         
        });

        it('should return a list of guids for serviceTransactions where CreateClaim is false ', () => { 
            expect(component.getServicesToExclude()).toEqual(['2223', '3333'])
        });
    });
       
    describe('updateMatchingServiceTransaction', () => {
        let serviceTransactionsForInsuranceList: any[];
        beforeEach(() => {
            component.patientEncounters = [{
                EncounterId: '1234', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '2222', CreateClaim: true , Amount: 200}, 
                    { ServiceTransactionId: '2223', CreateClaim: true , Amount: 20}]}, {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '3333', CreateClaim: true , Amount: 200},
                    { ServiceTransactionId: '3334', CreateClaim: true , Amount: 20}]}, {
                EncounterId: '1235', Status: 2, ServiceTransactionDtos: [
                    { ServiceTransactionId: '3335', CreateClaim: true , Amount: 100}]
            }];
            // create list of services from component.patientEncounters
            serviceTransactionsForInsuranceList = component.getServiceTransactionEstimatesList();           
        });
       
        it('should reload matching insurance estimates in serviceTransactionsForInsuranceList based on service ', () => { 
            const updatedServiceEstimate =  { ServiceTransactionId: '3333', CreateClaim: true, 
                TotalEstInsurance:50, TotalAdjEstimate:75, InsuranceEstimates:[{}] }
            component.updateMatchingServiceTransaction(updatedServiceEstimate, serviceTransactionsForInsuranceList);
            expect(serviceTransactionsForInsuranceList[2].ServiceTransactionId).toEqual(updatedServiceEstimate.ServiceTransactionId);
            expect(serviceTransactionsForInsuranceList[2].InsuranceEstimates).toEqual(updatedServiceEstimate.InsuranceEstimates);
            expect(serviceTransactionsForInsuranceList[2].TotalEstInsurance).toEqual(updatedServiceEstimate.TotalEstInsurance);
            expect(serviceTransactionsForInsuranceList[2].TotalAdjEstimate).toEqual(updatedServiceEstimate.TotalAdjEstimate);
            let balance = serviceTransactionsForInsuranceList[2].Amount - updatedServiceEstimate.TotalAdjEstimate - updatedServiceEstimate.TotalEstInsurance;
            expect(serviceTransactionsForInsuranceList[2].Balance).toEqual(balance);
        });
    });

    describe('initializeCreditTransactionDetails', () => {
        let serviceTransactionsForInsuranceList: any[];
        beforeEach(() => {            
            spyOn(component, 'updateCreditTransactionDtoDetails');
            spyOn(component, 'updateCreditTransactionDtoDetailsSuccess');
            component.creditTransactionDto = new CreditTransaction(); 
            component.creditTransactionDto.Amount = 0;
        });

        it('should set creditTransaction.Amount to sum of summaryTotals totalBalanceDue and totalPriorBalanceDue ',  () => {
            component.summaryTotals = {totalBalanceDue:500, totalPriorBalanceDue:200}
            const totalBalanceDue = component.summaryTotals.totalBalanceDue + component.summaryTotals.totalPriorBalanceDue;  
            component.initializeCreditTransactionDetails();
            expect(component.creditTransactionDto.Amount).toBe(700);
        });
       
        it('should call updateCreditTransactionDtoDetails ', () => {
            component.summaryTotals = {totalBalanceDue:500, totalPriorBalanceDue:200}
            const totalBalanceDue = component.summaryTotals.totalBalanceDue + component.summaryTotals.totalPriorBalanceDue;  
            component.initializeCreditTransactionDetails();
            expect(component.updateCreditTransactionDtoDetails).toHaveBeenCalledWith(true);
        });

        it('should set creditTransaction.Amount to 0 after call to component.updateCreditTransactionDtoDetails ', async (done) => {
            component.summaryTotals = {totalBalanceDue:500, totalPriorBalanceDue:200}
            const totalBalanceDue = component.summaryTotals.totalBalanceDue + component.summaryTotals.totalPriorBalanceDue;  
            await component.initializeCreditTransactionDetails();            
            done();
            expect(component.creditTransactionDto.Amount).toBe(0);
            expect(component.updateCreditTransactionDtoDetailsSuccess).toHaveBeenCalled();
        });

        it('should call updateCreditTransactionDtoDetailsSuccess with empty list in resolve after call to component.updateCreditTransactionDtoDetails ', async (done) => {
            component.summaryTotals = {totalBalanceDue:500, totalPriorBalanceDue:200}
            const totalBalanceDue = component.summaryTotals.totalBalanceDue + component.summaryTotals.totalPriorBalanceDue;  
            await component.initializeCreditTransactionDetails();            
            done();
            let res = {Value:[]}
            expect(component.updateCreditTransactionDtoDetailsSuccess).toHaveBeenCalledWith(res);
        });
    });

    describe('removeUnappliedWithNoDetailsToProcess', () => {
        beforeEach(() => {
            component.creditTransactionDtoList = [
                { OriginalPosition: 1, RelatedCreditTransactionId: '5555', CreditTransactionDetails:[
                    {Amount:10, AppliedToServiceTransationId:'1234',AppliedToDebitTransactionId: null},
                    {Amount:15, AppliedToServiceTransationId:'1235',AppliedToDebitTransactionId: null},
                ]},
                { OriginalPosition: 2, RelatedCreditTransactionId: '4444', CreditTransactionDetails:[
                    {Amount:20, AppliedToServiceTransationId:null,AppliedToDebitTransactionId: null},
                    {Amount:25, AppliedToServiceTransationId:null,AppliedToDebitTransactionId: null},
                ]},
                { OriginalPosition: 3, RelatedCreditTransactionId: null, CreditTransactionDetails:[
                    {Amount:30, AppliedToServiceTransationId:null,AppliedToDebitTransactionId: null},
                    {Amount:35, AppliedToServiceTransationId:'1111',AppliedToDebitTransactionId: null},
                ]},];         
        });
        it('should filter out creditTransactions where RelatedCreditTransactionId is not null and '+
        'no creditTransactionDetails have been applied', () => { 
            component.removeUnappliedWithNoDetailsToProcess();
            expect(component.creditTransactionDtoList.length).toBe(2);            
        });

        it('should not filter out creditTransactions where RelatedCreditTransactionId is not null and '+
        'creditTransactionDetails have been applied', () => { 
            component.removeUnappliedWithNoDetailsToProcess();
            expect(component.creditTransactionDtoList[0].OriginalPosition).toEqual(1);
            expect(component.creditTransactionDtoList[0].RelatedCreditTransactionId).toEqual('5555')
            expect(component.creditTransactionDtoList[1].OriginalPosition).toEqual(3);
            expect(component.creditTransactionDtoList[1].RelatedCreditTransactionId).toBeNull();
        });

        it('should not filter out creditTransactions where RelatedCreditTransactionId is not null and '+
        'at least one of the creditTransactionDetails have been applied', () => { 
            component.creditTransactionDtoList[1].CreditTransactionDetails[0].AppliedToServiceTransationId = '9999';
            component.removeUnappliedWithNoDetailsToProcess();
            expect(component.creditTransactionDtoList[0].OriginalPosition).toEqual(1);
            expect(component.creditTransactionDtoList[0].RelatedCreditTransactionId).toEqual('5555')
            expect(component.creditTransactionDtoList[1].OriginalPosition).toEqual(2);
            expect(component.creditTransactionDtoList[1].RelatedCreditTransactionId).toEqual('4444')
            expect(component.creditTransactionDtoList[2].OriginalPosition).toEqual(3);
            expect(component.creditTransactionDtoList[2].RelatedCreditTransactionId).toBeNull();
            expect(component.creditTransactionDtoList.length).toBe(3);
        });
    });

    it('should check if current location is Open Edge or not', () => {
        component.userLocation = { PaymentProvider: PaymentProvider.OpenEdge };
        expect(component.isOpenEdgeLocation).toBeTruthy();

        component.userLocation = { PaymentProvider: PaymentProvider.TransactionsUI };
        expect(component.isOpenEdgeLocation).toBeFalsy();
    });

});
