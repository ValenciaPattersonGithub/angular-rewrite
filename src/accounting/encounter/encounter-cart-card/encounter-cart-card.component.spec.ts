import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { EncounterCartCardComponent } from './encounter-cart-card.component';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../../@shared/shared.module';
import { ServiceTotalEstinsPipe, ServiceAdjEstPipe } from '../../../@shared/pipes/service/service-totals.pipe';
import { ToothAreaDataService } from '../../../@shared/providers/tooth-area-data.service';
import { ToothAreaService } from '../../../@shared/providers/tooth-area.service';
import { configureTestSuite } from 'src/configure-test-suite';
import { TaxAssignment } from '../../../treatment-plans/models/treatment-plan-coverage';

describe('EncounterCartCardComponent', () => {
    let component: EncounterCartCardComponent;
    let fixture: ComponentFixture<EncounterCartCardComponent>;
    const mockreferenceDataService: any = {
        get: function (x) {
            return [
                {
                    Code: 'D0120', Description: 'code1', ServiceCodeId: '1', $$locationTaxableServiceTypeId: '1',
                    Locations: [{ ProviderOnClaimsId: '1' }]
                }];
        },
        getData: function (x) {
            return [
                {
                    Code: 'D0120', Description: 'code1', ServiceCodeId: '1', $$locationTaxableServiceTypeId: '1',
                    Locations: [{ ProviderOnClaimsId: '1' }]
                }];
        },
        entityNames: {
            users: { Locations: { LocationId: '2', ProviderOnClaimsId: '1' } }
        }
    };

    let patientServices: any;
    let encounterService: any;
    let mockToastrFactory: any = {
        error: jasmine.createSpy()
    };
    const mockStaticDataService: any = {
        ToothRangeToCodeMap: () => new Promise((resolve, reject) => { })
    };
    
    const mockLocalizeService: any = {
        getLocalizedString: jasmine.createSpy().and.returnValue('Service Date')
    };
    let mockLocationService: any = {
        getCurrentLocation: jasmine.createSpy('LocationService.getCurrentLocation').and.returnValue({ id: 3, status: 'Inactive' })
    };
    let mockPatientLandingfactory = {
        setPreferredProvider: jasmine.createSpy()
    };
    let scheduleFactoryPromise: Promise<any> = new Promise<any>((resolve, reject) => { });
    let mockShowOnScheduleFactory: any = {
        getAll: jasmine.createSpy().and.returnValue(scheduleFactoryPromise)
    };
    let mockListHelper: any = {
        findItemByFieldValue: jasmine.createSpy().and.returnValue({}), get: jasmine.createSpy().and.returnValue({})
    };
    let mockPatientServices: any = {
        Patients: {
            get: jasmine.createSpy().and.callFake((array) => {
                return {
                    then(callback) {
                        callback(array);
                    }
                };
            })
        }
    };

    const routeParams = {
        patientId: '4321',
        accountId: '1234',
        encounterId: '5678',
        PrevLocation: 'AccountSummary'
    };

    configureTestSuite(() => {
        const mockEncounterService = {
            serviceHasChanged$: { subscribe: jasmine.createSpy().and.returnValue({ unsubscribe: () => { } }) },
            notifyServiceHasChanged: jasmine.createSpy().and.callFake(() => { })
        };
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), AppKendoUIModule, FormsModule, SharedModule],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: 'PatientEncounterService', useValue: mockEncounterService },
                { provide: 'StaticData', useValue: mockStaticDataService },
                { provide: 'locationService', useValue: mockLocationService },
                { provide: 'PatientLandingFactory', useValue: mockPatientLandingfactory },
                { provide: 'ProviderShowOnScheduleFactory', useValue: mockShowOnScheduleFactory },
                { provide: 'ListHelper', useValue: mockListHelper },
                { provide: '$routeParams', useValue: routeParams },
                { provide: 'PatientServices', useValue: mockPatientServices },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: ToothAreaService, useValue: ToothAreaService },
                { provide: ToothAreaDataService, useValue: ToothAreaDataService },
            ],
            declarations: [EncounterCartCardComponent, ServiceTotalEstinsPipe, ServiceAdjEstPipe]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EncounterCartCardComponent);
        component = fixture.componentInstance;
        component.serviceCode = { Description: 'code1', ServiceCodeId: '1', $$locationTaxableServiceTypeId: '1', Code: 'D0120', AffectedAreaId: 1 };
        component.service = {
            $toothAreaData: {
                toothSelection: '',
                areaSelection: [],
                availableTeeth: [],
                availableAreas: [],
                serviceCode: component.serviceCode,
                originalServiceCode: component.serviceCode
            },
            ServiceCodeId: '1',
            DateEntered: '', Description: 'Hello World',
            Fee: 100, InsuranceEstimates: [{ IsUserOverRidden: true, IsMostRecentOverride: true }], ProviderOnClaimsId: '1', ProviderUserId: '1'
        };

        fixture.detectChanges();

        patientServices = TestBed.get('PatientServices');
        encounterService = TestBed.get('PatientEncounterService');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit function ->', () => {
        beforeEach(() => {
            component.serviceCode = { Code: 'D0120', Description: 'code1', ServiceCodeId: '1', $$locationTaxableServiceTypeId: '1', };
        });

        it('should set servicedate and add Z to DateEntered if it has no Z ->', () => {
            component.service.DateEntered = '2000-1-2 12:00:00.0000000';
            component.ngOnInit();
            expect(component.serviceDate.toLocaleDateString()).toBe('1/2/2000');
            expect(component.service.DateEntered).toBe('2000-1-2 12:00:00.0000000Z');
        });

        it('should set servicedate and not add Z to DateEntered if it already has Z ->', () => {
            component.service.DateEntered = '2000-1-2 12:00:00.0000000Z';
            component.ngOnInit();
            expect(component.serviceDate.toLocaleDateString()).toBe('1/2/2000');
            expect(component.service.DateEntered).toBe('2000-1-2 12:00:00.0000000Z');
        });

        it('should bypass if servicedate is null ->', () => {
            component.service = null;
            component.serviceDate = new Date('1999-9-9');
            component.ngOnInit();
            expect(component.serviceDate.toLocaleDateString()).toBe('9/9/1999');
        });

        it('should set taxableServiceTypeId when service code is found', () => {
            component.service = { Description: 'code1:desc1', ServiceCodeId: '1', applyDiscount: true, TaxableServiceTypeId: '1' };

            component.ngOnInit();

            expect(component.service.TaxableServiceTypeId).toBe('1');
        });

        it('should not set taxableServiceTypeId when service code is not found', () => {
            component.serviceCode = null;
            component.service = { Description: 'code1:desc1', ServiceCodeId: '2', applyDiscount: true, TaxableServiceTypeId: '0' };

            component.ngOnInit();

            expect(component.service.TaxableServiceTypeId).toBe('0');
        });
    });

    describe('onServiceClosed function ->', () => {
        it('should call serviceClosed.emit()', () => {
            component.serviceClosed.emit = jasmine.createSpy();
            component.onServiceClosed();
            expect(component.serviceClosed.emit).toHaveBeenCalled();
        });
    });

    describe('onServiceDateChanged function ->', () => {
        it('should set dateEntered to be value passed in', () => {
            component.service.DateEntered = 'Hello World';
            component.serviceDate = new Date('2000-9-9');
            let newDate = new Date('1999-9-9');
            component.onServiceDateChanged(newDate);
            expect(component.service.DateEntered).toBe(newDate);
            expect(component.serviceDate).toBe(newDate);
        });

        it('should ignore dateEntered if passed in value is null', () => {
            let dateValue = new Date('2000-9-9');
            component.service.DateEntered = 'Hello World';
            component.serviceDate = dateValue;
            component.onServiceDateChanged(null);
            expect(component.service.DateEntered).toBe('Hello World');
            expect(component.serviceDate).toBe(dateValue);
        });

        it('should set isValidDateRange to false when dateValue is over max', () => {
          let dateValue = new Date('02/13/2024');
          component.maxServiceDate = new Date('02/12/2024');
          component.isValidDateRange = true;
          component.onServiceDateChanged(dateValue);
          expect(component.isValidDateRange).toBe(false);
        });

        it('should set isValidDateRange to false when dateValue is under minimum', () => {
          let dateValue = new Date('12/31/1899');
          component.isValidDateRange = true;
          component.onServiceDateChanged(dateValue);
          expect(component.isValidDateRange).toBe(false);
        });

        it('should set isValidDateRange to true when dateValue is over minimum and under max', () => {
          let dateValue = new Date('02/12/2024');
          component.maxServiceDate = new Date('02/12/2024');
          component.isValidDateRange = false;
          component.onServiceDateChanged(dateValue);
          expect(component.isValidDateRange).toBe(true);
        });
    });

    describe('onFeeChanged function ->', () => {
        let result;

        beforeEach(() => {
            // component.Discount = 9;
            // component.tax = 11;
            component.serviceCode = [{ Description: 'code1', ServiceCodeId: '1', DiscountableServiceTypeId: '1' }];
        });


        it('should call calculate for discount', () => {
            patientServices.Discount = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: function () { return result; } }
                })
            };

            patientServices.TaxAfterDiscount = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: function () { } }
                })
            };
            component.calculateDiscount = jasmine.createSpy().and.returnValue(Promise.resolve(1));
            component.calculateTaxAfterDiscount = jasmine.createSpy().and.returnValue(Promise.resolve(1));

            component.onFeeChanged({ Code: 'code1' });

            expect(component.calculateDiscount).toHaveBeenCalled();
        });

        it('should call calculate for tax', () => {

            patientServices.Discount = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: function () { return result; } }
                })
            };

            patientServices.TaxAfterDiscount = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: function () { } }
                })
            };
            component.calculateTaxAfterDiscount = jasmine.createSpy();

            component.onFeeChanged({ Code: 'code1' });

            expect(component.calculateTaxAfterDiscount).toHaveBeenCalled();
        });

        it('should set service amount, discount, and tax', () => {
            component.calculateDiscount = jasmine.createSpy().and.returnValue(Promise.resolve(1));
            component.calculateTaxAfterDiscount = jasmine.createSpy().and.returnValue(Promise.resolve(1));
            component.serviceCode = { Code: 'code1', Fee: 100, Tax: 5, Discount: 6 };
            component.service.Tax = 2;
            component.service.Discount = 3;
            component.onFeeChanged('').then(() => {
                expect(component.service.Tax).toBe(2);
                expect(component.service.Discount).toBe(3);
            });
        });

        it('should set overridden properties on insurance to false', () => {
            component.calculateDiscount = jasmine.createSpy().and.returnValue(Promise.resolve(1));
            component.calculateTaxAfterDiscount = jasmine.createSpy().and.returnValue(Promise.resolve(1));
            component.serviceCode = { Code: 'code1', Fee: 100, Tax: 5, Discount: 6 };
            component.service.Tax = 2;
            component.service.Discount = 3;
            component.onFeeChanged('').then(() => {
                expect(component.service.InsuranceEstimates[0].IsUserOverRidden).toBe(false);
                expect(component.service.InsuranceEstimates[0].IsMostRecentOverride).toBe(false);
            });
        });
    });

    describe('calculateDiscount function ->', () => {

        beforeEach(() => {
            patientServices.Discount = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: function () { } }
                })
            };

            component.service = { Description: 'code1', ServiceCodeId: '1', DiscountableServiceTypeId: '1' };
        });

        it('should set discountableServiceTypeId when service code is found', () => {
            let serviceCode = { Description: 'code1:desc1', ServiceCodeId: '1', applyDiscount: true, DiscountableServiceTypeId: '0' };
            component.serviceCode = serviceCode;

            component.calculateDiscount();

            expect(component.service.DiscountableServiceTypeId).toBe('1');
            expect(patientServices.Discount.get).toHaveBeenCalled();
        });

        it('should not set discountableServiceTypeId when service code is not found', () => {
            component.serviceCode = null;

            component.calculateDiscount();
            expect(component.service.DiscountableServiceTypeId).toBe('1');
            expect(patientServices.Discount.get).toHaveBeenCalled();
        });
    });

    describe('calculateDiscount success function ->', () => {
        let result, updateTitleSpy;
        beforeEach(() => {
            patientServices.Discount = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: function () { } }
                })
            };

            result = {};
            patientServices.Discount.get = () => {
                return {
                    $promise: {
                        then: (success) => success(result)
                    }
                };
            };
        });

        it('should call calculateDiscountOnSuccess when calculateDiscount succeeds', () => {
            let service = { Description: 'code1:desc1', ServiceCodeId: '2', applyDiscount: true, DiscountableServiceTypeId: '0' };
            component.service = {};

            component.calculateDiscountOnSuccess = jasmine.createSpy();
            component.calculateDiscount();

            expect(component.calculateDiscountOnSuccess).toHaveBeenCalled();
        });
    });

    describe('calculateDiscount failure function ->', () => {
        beforeEach(() => {
            patientServices.Discount = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: function () { } }
                })
            };

            patientServices.Discount.get = () => {
                return {
                    $promise: {
                        then: (success, failure) => failure()
                    }
                };
            };

            component.serviceCode = { Description: 'code1', ServiceCodeId: '1', DiscountableServiceTypeId: '1' };
        });


        it('should call calculateDiscountOnError when calculateDiscount fails', () => {
            let service = { Description: 'code1:desc1', ServiceCodeId: '2', applyDiscount: true, DiscountableServiceTypeId: '0' };
            component.service = {};

            component.calculateDiscountOnError = jasmine.createSpy();
            component.calculateDiscount();

            expect(component.calculateDiscountOnError).toHaveBeenCalled();
        });

    });

    describe('calculateDiscountOnSuccess function ->', () => {
        it('should set discount to response and adjust amount when applyDiscount is true and service is found', () => {
            component.service = { ServiceTransactionId: 1, Fee: 10, Amount: 20, Discount: 10, applyDiscount: true };

            component.calculateDiscountOnSuccess({ Value: 66 });
            expect(component.service.Discount).toBe(66);
        });
        it('should set discount to 0 and adjust amount when applyDiscount is false and service is found', () => {
            component.service = { ServiceTransactionId: 1, Fee: 10, Amount: 20, Discount: 10, applyDiscount: false };

            component.calculateDiscountOnSuccess({ Value: 66 });
            expect(component.service.Discount).toBe(0);
        });
    });

    describe('calculateDiscountOnError function ->', () => {
        it('should call toastrFactory error', () => {
            component.calculateDiscountOnError();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('calculateTax success function ->', () => {
        let result;
        beforeEach(() => {
            patientServices.TaxAfterDiscount = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: function () { } }
                })
            };

            result = {};
            patientServices.TaxAfterDiscount.get = () => {
                return {
                    $promise: {
                        then: (success) => success(result)
                    }
                };
            };
        });

        it('should call calculateTaxOnSuccess when calculateTaxAfterDiscount succeeds', () => {
            component.service = { Description: 'code1:desc1', ServiceCodeId: '2', applyDiscount: true, TaxableServiceTypeId: '0' };

            component.calculateTaxOnSuccess = jasmine.createSpy();
            component.calculateTaxAfterDiscount();

            expect(component.calculateTaxOnSuccess).toHaveBeenCalled();
        });
    });

    describe('calculateTax failure function ->', () => {
        beforeEach(() => {
            patientServices.TaxAfterDiscount = {
                get: jasmine.createSpy().and.returnValue({
                    $promise: { then: function () { } }
                })
            };

            patientServices.TaxAfterDiscount.get = () => {
                return {
                    $promise: {
                        then: (success, failure) => failure()
                    }
                };
            };

            component.serviceCode = { Description: 'code1', ServiceCodeId: '1', TaxableServiceTypeId: '1' };
        });


        it('should call calculateTaxOnError when calculateTaxAfterDiscount fails', () => {
            component.service = { Description: 'code1:desc1', ServiceCodeId: '2', applyDiscount: true, TaxableServiceTypeId: '0' };

            component.calculateTaxOnError = jasmine.createSpy();
            component.calculateTaxAfterDiscount();

            expect(component.calculateTaxOnError).toHaveBeenCalled();
        });

    });

    describe('calculateTaxOnSuccess function ->', () => {
        it('should set tax to response and adjust amount when service is found', () => {
            component.service = { ServiceTransactionId: 1, Fee: 10, Amount: 20, Discount: 10, applyDiscount: true };

            component.calculateTaxOnSuccess({ Value: 66 });
            expect(component.service.Tax).toBe(66);
        });
    });

    describe('calculateTaxOnError function ->', () => {
        it('should call toastrFactory error', () => {
            component.calculateTaxOnError();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('toggleInsuranceMenu function ->', () => {
        it('should set showInsuranceEstimates to false when it is true', () => {
            component.showInsuranceEstimates = true;
            component.toggleInsuranceMenu();
            expect(component.showInsuranceEstimates).toBe(false);
        });
        it('should set showInsuranceEstimates to true when it is false', () => {
            component.showInsuranceEstimates = false;
            component.toggleInsuranceMenu();
            expect(component.showInsuranceEstimates).toBe(true);
        });
    });

    describe('forceTotalInsuranceUpdate function ->', () => {
        it('should set triggerEstInsUpdate to false when it is true', () => {
            component.triggerInsuranceUpdate = true;
            component.forceTotalInsuranceUpdate();
            expect(component.triggerInsuranceUpdate).toBe(false);
        });
        it('should set triggerEstInsUpdate to true when it is false', () => {
            component.triggerInsuranceUpdate = false;
            component.forceTotalInsuranceUpdate();
            expect(component.triggerInsuranceUpdate).toBe(true);
        });
    });

    describe('onEstimateChanged function ->', () => {
        beforeEach(() => {
            component.service = {
                Fee: 3, Tax: 4, Discount: 5, InsuranceEstimates:
                    [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1 , PatientBenefitPlanId: 3},
                    { IsUserOverRidden: true, IsMostRecentOverride: true, EstInsurance: 1 , PatientBenefitPlanId: 3}]
            }
            component.benefitPlans = [
                { PatientBenefitPlanId: 3, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test3', TaxAssignment: TaxAssignment.Charge } } },
                { PatientBenefitPlanId: 7, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test7', TaxAssignment: TaxAssignment.FeeSchedule } } },
                { PatientBenefitPlanId: 10, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test10', TaxAssignment: TaxAssignment.PatientPortion } } },
                { PatientBenefitPlanId: 13, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test13', TaxAssignment: TaxAssignment.AfterCoverage } } }]
            spyOn(component, 'recalculateServiceTransaction');
        });

        it('should set triggerEstInsUpdate to true when it is false', () => {
            component.triggerInsuranceUpdate = false;
            component.forceTotalInsuranceUpdate();
            expect(component.triggerInsuranceUpdate).toBe(true);
        });

        it('should call recalculateServiceTransaction when estimate is less than charge or allowed amount', async () => {
            component.recalculateServiceTransaction = jasmine.createSpy();
            await component.onEstimateChanged({ OldValue: 1, NewValue: 2 }, 0);
            expect(component.recalculateServiceTransaction).toHaveBeenCalled();
        });

        it('should set EstInsurance to OldValue when estimate is more than charge or allowed amount', async () => {
            await component.onEstimateChanged({ OldValue: 2, NewValue: 4 }, 0);
            expect(component.service.InsuranceEstimates[0].EstInsurance).toBe(2);
        });

        it('should display error when estimate is more than charge or allowed amount', async () => {
            component.estInsErrorSubject.next = jasmine.createSpy();
            await component.onEstimateChanged({ OldValue: 2, NewValue: 4 }, 0);
            expect(component.estInsErrorSubject.next).toHaveBeenCalled();
        });

        it('should modify estimate if newEstimate is less than or equal to charge plus tax or or fee schedule plus tax amount if taxAssignment is Charge ', async () => {
            component.benefitPlans = [
                { PatientBenefitPlanId: 3, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test', TaxAssignment: TaxAssignment.Charge } } }];
            var originalEstimateAmount = 156.50;
            component.service = {
                Fee: 200, Tax: 12.50, Discount: 5, InsuranceEstimates:
                    [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1, AllowedAmount: 0, EstIns: originalEstimateAmount, Balance: 16.00, PatientBenefitPlanId: 3 }]
            }
            var feePlusTax = component.service.Fee - component.service.Discount + component.service.Tax;
            await component.onEstimateChanged({ OldValue: originalEstimateAmount, NewValue: feePlusTax }, 0);
            expect(component.service.InsuranceEstimates[0].EstInsurance).toBe(feePlusTax);
            expect(component.showEstInsError).toBe(false);
        });

        it('should modify estimate if newEstimate is less than or equal to charge plus tax or or fee schedule plus tax amount if taxAssignment is AfterCoverage ', async () => {
            component.benefitPlans = [
                { PatientBenefitPlanId: 3, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test', TaxAssignment: TaxAssignment.AfterCoverage } } }];
            var originalEstimateAmount = 156.50;
            component.service = {
                Fee: 200, Tax: 12.50, Discount: 5, InsuranceEstimates:
                    [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1, AllowedAmount: 0, EstIns: originalEstimateAmount, Balance: 16.00, PatientBenefitPlanId: 3 }]
            }
            var feePlusTax = component.service.Fee - component.service.Discount + component.service.Tax;
            await component.onEstimateChanged({ OldValue: originalEstimateAmount, NewValue: feePlusTax }, 0);
            expect(component.service.InsuranceEstimates[0].EstInsurance).toBe(feePlusTax);            
            expect(component.showEstInsError).toBe(false);
        });

        it('should show error and revert estimate if newEstimate is more than charge plus tax or or fee schedule plus tax amount if taxAssignment is PatientPortion ', async () => {
            component.benefitPlans = [
                { PatientBenefitPlanId: 3, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test', TaxAssignment: TaxAssignment.PatientPortion } } }];
            var originalEstimateAmount = 156.50;
            component.service = {
                Fee: 200, Tax: 12.50, Discount: 5, InsuranceEstimates:
                    [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1, AllowedAmount: 0, EstIns: originalEstimateAmount, Balance: 16.00, PatientBenefitPlanId: 3 }]
            }
            var feePlusTax = component.service.Fee - component.service.Discount + component.service.Tax;
            await component.onEstimateChanged({ OldValue: originalEstimateAmount, NewValue: feePlusTax }, 0);
            expect(component.service.InsuranceEstimates[0].EstInsurance).toBe(originalEstimateAmount);              
            expect(component.showEstInsError).toBe(true);
        });

        it('should show error and revert estimate if newEstimate is more than charge plus tax or or fee schedule plus tax amount if taxAssignment is FeeSchedule ', async () => {
            component.benefitPlans = [
                { PatientBenefitPlanId: 3, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test', TaxAssignment: TaxAssignment.FeeSchedule } } }];
            var originalEstimateAmount = 156.50;
            component.service = {
                Fee: 200, Tax: 12.50, Discount: 5, InsuranceEstimates:
                    [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1, AllowedAmount: 0, EstIns: originalEstimateAmount, Balance: 16.00, PatientBenefitPlanId: 3 }]
            }
            var feePlusTax = component.service.Fee - component.service.Discount + component.service.Tax;
            await component.onEstimateChanged({ OldValue: originalEstimateAmount, NewValue: feePlusTax }, 0);  
            expect(component.service.InsuranceEstimates[0].EstInsurance).toBe(originalEstimateAmount);             
            expect(component.showEstInsError).toBe(true);
        });

        it('should show error if newEstimate is $0.10 more than charge  plus tax minus discount if taxAssignment is Charge ', async () => {
            component.benefitPlans = [
                { PatientBenefitPlanId: 3, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test', TaxAssignment: TaxAssignment.Charge } } }];
            var originalEstimateAmount = 122.26;
            component.service = {
                Fee: 271.70, Tax: 2.18, Discount: 27.17, InsuranceEstimates:
                    [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1, AllowedAmount: 0, EstIns: originalEstimateAmount, Balance: 122.27, PatientBenefitPlanId: 3 }]
            }
            var feeMinusDiscount = parseFloat((component.service.Fee - component.service.Discount + component.service.Tax).toFixed(2))
            await component.onEstimateChanged({ OldValue: originalEstimateAmount, NewValue: feeMinusDiscount + 0.1 }, 0);
            expect(component.service.InsuranceEstimates[0].EstInsurance).toBe(originalEstimateAmount);
            expect(component.showEstInsError).toBe(true);
        });

        it('should not show error if newEstimate is the same as charge  plus tax minus discount if taxAssignment is Charge ', async () => {
            component.benefitPlans = [
                { PatientBenefitPlanId: 3, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test', TaxAssignment: TaxAssignment.Charge } } }];
            var originalEstimateAmount = 122.26;
            component.service = {
                Fee: 271.70, Tax: 2.18, Discount: 27.17, InsuranceEstimates:
                    [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1, AllowedAmount: 0, EstIns: originalEstimateAmount, Balance: 122.27, PatientBenefitPlanId: 3 }]
            }
            var feeMinusDiscount = parseFloat((component.service.Fee - component.service.Discount + component.service.Tax).toFixed(2))
            await component.onEstimateChanged({ OldValue: originalEstimateAmount, NewValue: feeMinusDiscount }, 0);
            expect(component.service.InsuranceEstimates[0].EstInsurance).toBe(feeMinusDiscount);
            expect(component.showEstInsError).toBe(false);
        });

        it('should not show error if newEstimate is the same as feeScheduleFee plus tax if taxAssignment is Charge ', async () => {
            component.benefitPlans = [
                { PatientBenefitPlanId: 3, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test', TaxAssignment: TaxAssignment.Charge } } }];
            var originalEstimateAmount = 122.26;
            component.service = {
                Fee: 271.70, Tax: 2.18, Discount: 27.17, AllowedAmount: 22.00, InsuranceEstimates:
                    [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1, AllowedAmount: 0, EstIns: originalEstimateAmount, Balance: 122.27, PatientBenefitPlanId: 3 }]
            }
            var allowedAmount = parseFloat((component.service.AllowedAmount + component.service.Tax).toFixed(2))
            await component.onEstimateChanged({ OldValue: originalEstimateAmount, NewValue: allowedAmount }, 0);
            expect(component.service.InsuranceEstimates[0].EstInsurance).toBe(allowedAmount);
            expect(component.showEstInsError).toBe(false);
        });
    });

    describe('toggleInsuranceMenu function ->', () => {
        it('should switch showInsuranceEstimates to false when it is true', () => {
            component.showInsuranceEstimates = true;
            component.toggleInsuranceMenu()
            expect(component.showInsuranceEstimates).toBe(false);
        });
        it('should switch showInsuranceEstimates to true when it is false', () => {
            component.showInsuranceEstimates = false;
            component.toggleInsuranceMenu()
            expect(component.showInsuranceEstimates).toBe(true);
        });
    });

    describe('getPlanNameString function ->', () => {
        beforeEach(() => {
            component.benefitPlans = [{ PatientBenefitPlanId: 1, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test' } } }]
        });

        it('should return Primary when priority is 0', () => {
            var returnValue = component.getPlanNameString({ PatientBenefitPlanId: 1 }, 0);
            expect(returnValue).toBe('(Primary) Test');
        });

        it('should return Secondary when priority is 1', () => {
            var returnValue = component.getPlanNameString({ PatientBenefitPlanId: 1 }, 1);
            expect(returnValue).toBe('(Secondary) Test');
        });

        it('should return Tertiary when priority is 2', () => {
            var returnValue = component.getPlanNameString({ PatientBenefitPlanId: 1 }, 2);
            expect(returnValue).toBe('(Tertiary) Test');
        });

        it('should return 4th when priority is 3', () => {
            var returnValue = component.getPlanNameString({ PatientBenefitPlanId: 1 }, 3);
            expect(returnValue).toBe('(4th) Test');
        });

        it('should return 5th when priority is 4', () => {
            var returnValue = component.getPlanNameString({ PatientBenefitPlanId: 1 }, 4);
            expect(returnValue).toBe('(5th) Test');
        });

        it('should return 6th when priority is 5', () => {
            var returnValue = component.getPlanNameString({ PatientBenefitPlanId: 1 }, 5);
            expect(returnValue).toBe('(6th) Test');
        });

        it('should only include priority if no matching benefit plan (removed insurance)', () => {
            var returnValue = component.getPlanNameString({ PatientBenefitPlanId: 2 }, 1);
            expect(returnValue).toBe('(Secondary) ');
        });
    });

    describe('onProviderOnClaimsChanged function ->', () => {
        it('should call serviceChange emit', () => {
            component.serviceChange.emit = jasmine.createSpy();
            component.onProviderOnClaimsChanged('1');
            expect(component.serviceChange.emit).toHaveBeenCalled();
        });
    });

    describe('areaChanged function ->', () => {
        it('should call recalculateServiceTransaction if service code has changed', async () => {
            component.recalculateServiceTransaction = jasmine.createSpy();
            component.recalculateServiceTransaction = jasmine.createSpy();
            component.service = { ServiceCodeId: 1 };
            component.serviceCode = { ServiceCodeId: 2 }

            await component.areaChanged('1');
            expect(component.recalculateServiceTransaction).toHaveBeenCalled();
        });


        it('should call serviceChange.emit', async () => {
            component.serviceChange.emit = jasmine.createSpy();
            component.recalculateServiceTransaction = jasmine.createSpy();
            component.service = { ServiceCodeId: 1 };
            component.serviceCode = { ServiceCodeId: 1 }
            await component.areaChanged('1');
            expect(component.serviceChange.emit).toHaveBeenCalled();
            expect(component.recalculateServiceTransaction).not.toHaveBeenCalled();
        });


    });



    describe('toothChanged function ->', () => {
        it('should call recalculateServiceTransaction if service code has changed', () => {
            component.recalculateServiceTransaction = jasmine.createSpy();
            component.service = { ServiceCodeId: 1 };
            component.serviceCode = { ServiceCodeId: 2 }

            component.toothChanged('1');
            expect(component.recalculateServiceTransaction).toHaveBeenCalled();
        });


        it('should call serviceChange.emit', () => {
            component.serviceChange.emit = jasmine.createSpy();
            component.recalculateServiceTransaction = jasmine.createSpy();
            component.service = { ServiceCodeId: 1 };
            component.serviceCode = { ServiceCodeId: 1 }
            component.toothChanged('1');
            expect(component.serviceChange.emit).toHaveBeenCalled();
            expect(component.recalculateServiceTransaction).not.toHaveBeenCalled();
        });

        it('should set tooth on service', () => {
            component.serviceChange.emit = jasmine.createSpy();
            component.recalculateServiceTransaction = jasmine.createSpy();
            component.service = { ServiceCodeId: 1, Tooth: 'test' };
            component.serviceCode = { ServiceCodeId: 1 }
            component.toothChanged('1');
            expect(component.service.Tooth).toBe('1');
        });


    });

    describe('onProviderOnServicesChanged function ->', () => {
        beforeEach(() => {
            component.service = {
                Fee: 3, Tax: 4, Discount: 5, InsuranceEstimates:
                    [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1 },
                    { IsUserOverRidden: true, IsMostRecentOverride: true, EstInsurance: 1 }]
            }
        });

        it('should emit serviceChange if newProvider is not null', () => {
            component.serviceChange.emit = jasmine.createSpy();
            component.onProviderOnServicesChanged(component.service.ProviderUserId);
            expect(component.serviceChange.emit).toHaveBeenCalledWith(component.service);
        });

        it('should emit serviceChange if newProvider is  null', () => {
            component.serviceChange.emit = jasmine.createSpy();
            component.onProviderOnServicesChanged(null);
            expect(component.serviceChange.emit).toHaveBeenCalledWith(component.service);
        });

        it('should set service.ProviderOnClaimsId to newProvider.UserLocationSetup.ProviderOnClaimsId if ' +
            'newProvider.UserLocadtionSetup.ProviderOnClaimsRelationship is 2 and ' +
            'newProvider.UserLocadtionSetup.ProviderOnClaimsId is not null', () => {
                let newProvider = {
                    ProviderId: '1234',
                    UserLocationSetup: { ProviderOnClaimsRelationship: 2, ProviderOnClaimsId: '5678' }
                };
                component.onProviderOnServicesChanged(newProvider);
                expect(component.service.ProviderOnClaimsId).toBe(newProvider.UserLocationSetup.ProviderOnClaimsId);
            });

        it('should set service.ProviderOnClaimsId to newProvider.ProviderId if ' +
            'newProvider.UserLocadtionSetup.ProviderOnClaimsId is null', () => {
                let newProvider = {
                    ProviderId: '1234',
                    UserLocationSetup: { ProviderOnClaimsRelationship: 2, ProviderOnClaimsId: null }
                };
                component.onProviderOnServicesChanged(newProvider);
                expect(component.service.ProviderOnClaimsId).toBe(newProvider.ProviderId);
            });

        it('should set service.ProviderOnClaimsId to newProvider.ProviderId if ' +
            'newProvider.UserLocadtionSetup.ProviderOnClaimsRelationship is not 2', () => {
                let newProvider = {
                    ProviderId: '1234',
                    UserLocationSetup: { ProviderOnClaimsRelationship: 1, ProviderOnClaimsId: '5678' }
                };
                component.onProviderOnServicesChanged(newProvider);
                expect(component.service.ProviderOnClaimsId).toBe(newProvider.ProviderId);
            });
        });

    describe('onAllowedAmountChanged function ->', () => {
        
        beforeEach(() => {
            component.service = {
                Fee: 200, Tax: 12.50, Discount: 5, AllowedAmount:100, InsuranceEstimates:
                    [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1, AllowedAmount:100, AllowedAmountOverride: null },
                    { IsUserOverRidden: true, IsMostRecentOverride: true, EstInsurance: 1 }]
            }
            spyOn(component, 'recalculateServiceTransaction').and.returnValue(Promise.resolve());
        });

        it('should set estimate AllowedAmountDisplay and serviceTransaction.AllowedAmount to newValue and other properties when new Value', async () => {
            await component.onAllowedAmountChanged({ OldValue: 100, NewValue: 125 }, 0);
            expect(component.service.AllowedAmount).toEqual(125);
            expect(component.service.InsuranceEstimates[0].AllowedAmountOverride).toEqual(125);
            expect(component.service.InsuranceEstimates[0].AllowedAmountDisplay).toEqual(125);
            expect(component.service.InsuranceEstimates[0].AllowedAmount).toEqual(100);
        });

        it('should not override AllowedAmount to newValue', async() => {
            await component.onAllowedAmountChanged({ OldValue: 100, NewValue: 125 }, 0);
            expect(component.service.AllowedAmount).toEqual(125);            
            expect(component.service.InsuranceEstimates[0].AllowedAmount).toEqual(100);
        });

        it('should emit serviceChange', async() => {
            component.serviceChange.emit = jasmine.createSpy();
            await component.onAllowedAmountChanged({ OldValue: 100, NewValue:125 }, 0);
            expect(component.serviceChange.emit).toHaveBeenCalledWith(component.service);
        });
        
        it('should call recalculateServiceTransaction', async() => {
            component.recalculateServiceTransaction = jasmine.createSpy();
            await component.onAllowedAmountChanged({ OldValue: 100, NewValue:125 }, 0);
            expect(component.recalculateServiceTransaction).toHaveBeenCalled();
        });
    });

    describe('getTaxAssignment function ->', () => {
        var estimate;        
        beforeEach(() => {
            estimate ={ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1, AllowedAmount:100, AllowedAmountOverride: null, PatientBenefitPlanId: 3 };
            component.benefitPlans = [
                { PatientBenefitPlanId: 3, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test', TaxAssignment: TaxAssignment.Charge } } },
                { PatientBenefitPlanId: 13, PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Test13', TaxAssignment: TaxAssignment.AfterCoverage } } }]
            
        });

        it('should return TaxAssignment value if patientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto', () => {
            var returnValue = component.getTaxAssignment(estimate);
            expect(returnValue).toEqual(TaxAssignment.Charge); 
        });

        it('should return null value if no patientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto', () => {
            estimate.PatientBenefitPlanId = null;
            var returnValue = component.getTaxAssignment(estimate);
            expect(returnValue).toBeNull();
        });
    });

    describe('recalculateServiceTransaction function ->', () => {
        beforeEach(() => {
            component.service = {
                Fee: 271.70, Tax: 12.50, Discount: 27.17, Amount: 100, InsuranceEstimates:
                    [{ IsUserOverRidden: false, IsMostRecentOverride: false, EstInsurance: 1, AllowedAmount: 100, AllowedAmountOverride: null },
                    { IsUserOverRidden: true, IsMostRecentOverride: true, EstInsurance: 1 }]
            }
            component.calculateDiscount = jasmine.createSpy().and.returnValue(Promise.resolve());
            component.calculateTaxAfterDiscount = jasmine.createSpy().and.returnValue(Promise.resolve());
            component.transactionRecalculated.emit = jasmine.createSpy();
        });

        it('should set correct service amount to be fee minus discount plus tax', async () => {
            var amount = parseFloat((component.service.Fee - component.service.Discount + component.service.Tax).toFixed(2));

            await component.recalculateServiceTransaction();
            
            expect(component.service.Amount).toEqual(amount);
            expect(component.transactionRecalculated.emit).toHaveBeenCalledWith(component.service);
        });
    });

   
});
