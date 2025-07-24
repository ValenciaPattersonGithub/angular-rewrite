import { TestBed, async } from '@angular/core/testing';
import { MicroServiceApiService } from 'src/security/providers';
import { ServiceEstimateCalculationService } from './service-estimate-calculation.service';


describe('ServiceEstimateCalculationService', () => {

    const mockLocalizeService: any = {
        getLocalizedString: () => 'translated text'
    };

    let mockServiceEstimateCalculationService: ServiceEstimateCalculationService;
    
    const mockSoarConfigService = {};
    const mockMicroServiceApiUrlConfig = {};
    const mockMicroServiceApiService = {
        enterpriseApiUrl: 'mockEntApiUrl'
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [

            ],
            declarations: [],
            providers: [ServiceEstimateCalculationService,
                { provide: 'SoarConfig', useValue: mockSoarConfigService },
                { provide: 'MicroServiceApiUrlConfig', useValue: mockMicroServiceApiUrlConfig },
                { provide: MicroServiceApiService, useValue: mockMicroServiceApiService },
                { provide: 'localize', useValue: mockLocalizeService }
            ]
        });

        mockServiceEstimateCalculationService = new ServiceEstimateCalculationService();

    }));
    describe('onCalculateDiscountAndTaxAndInsuranceEstimateSuccess', () => {

        it('servicesAndRecalculatedServicesWithMatchingInsuranceOrderPerformCalculationsWithBalanceOf0', function () {
            //Arrange
            let service: any = [{InsuranceOrder: 1}];
            let recalculatedService: any = [{ InsuranceOrder: 1, Discount: 60, Amount: 540, Tax: 0, InsuranceEstimates: [{ AdjEst: 0, AdjPaid: 0, AllowedAmount: null, EstInsurance: 540, Fee: 600 }], TotalEstInsurance: 540, TotalAdjEstimate: 0, Balance: 0 }];
               
            //Act
            let serviceReturned = mockServiceEstimateCalculationService.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(service, recalculatedService);
          
            //Assert
            expect(serviceReturned[0].InsuranceOrder).toEqual(recalculatedService[0].InsuranceOrder);
            expect(serviceReturned[0].Discount).toEqual(recalculatedService[0].Discount);
            expect(serviceReturned[0].Amount).toEqual(recalculatedService[0].Amount);
            expect(serviceReturned[0].Tax).toEqual(recalculatedService[0].Tax);
            expect(serviceReturned[0].InsuranceEstimates).toEqual(recalculatedService[0].InsuranceEstimates);
            expect(serviceReturned[0].TotalEstInsurance).toEqual(recalculatedService[0].TotalEstInsurance);
            expect(serviceReturned[0].TotalAdjEstimate).toEqual(recalculatedService[0].TotalAdjEstimate);
            expect(serviceReturned[0].Balance).toEqual(0);
        });

        it('servicesAndRecalculatedServicesWithMatchingInsuranceOrderPerformCalculationsWithBalanceGreaterThan0', function () {
            //Arrange
            let service: any = [{ InsuranceOrder: 1 }];
            let recalculatedService: any = [{ InsuranceOrder: 1, Discount: 60, Amount: 540, Tax: 0, InsuranceEstimates: [{ AdjEst: 0, AdjPaid: 0, AllowedAmount: null, EstInsurance: 70, Fee: 600 }], TotalEstInsurance: 70, TotalAdjEstimate: 0, Balance: 0 }];
           
            //Act
            let serviceReturned = mockServiceEstimateCalculationService.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(service, recalculatedService);

            //Assert
            expect(serviceReturned[0].InsuranceOrder).toEqual(recalculatedService[0].InsuranceOrder);
            expect(serviceReturned[0].Discount).toEqual(recalculatedService[0].Discount);
            expect(serviceReturned[0].Amount).toEqual(recalculatedService[0].Amount);
            expect(serviceReturned[0].Tax).toEqual(recalculatedService[0].Tax);
            expect(serviceReturned[0].InsuranceEstimates).toEqual(recalculatedService[0].InsuranceEstimates);
            expect(serviceReturned[0].TotalEstInsurance).toEqual(recalculatedService[0].TotalEstInsurance);
            expect(serviceReturned[0].TotalAdjEstimate).toEqual(recalculatedService[0].TotalAdjEstimate);
            expect(serviceReturned[0].Balance).toEqual(470);
        });

        it('servicesWithNoInsuranceOrderAndRecalculatedServicesWithInsuranceOrderDoesNotPerformCalculations', function () {
            //Arrange
            let service: any = [{}];
            let recalculatedService: any = [{ InsuranceOrder: 1, Discount: 60, Amount: 540, Tax: 0, InsuranceEstimates: [{ AdjEst: 0, AdjPaid: 0, AllowedAmount: null, EstInsurance: 70, Fee: 600 }], TotalEstInsurance: 70, TotalAdjEstimate: 0, Balance: 0 }];

            //Act
            let serviceReturned = mockServiceEstimateCalculationService.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(service, recalculatedService);

            //Assert
            expect(serviceReturned[0].InsuranceOrder).toEqual(undefined);
            expect(serviceReturned[0].Discount).toEqual(undefined);
            expect(serviceReturned[0].Amount).toEqual(undefined);
            expect(serviceReturned[0].Tax).toEqual(undefined);
            expect(serviceReturned[0].InsuranceEstimates).toEqual(undefined);
            expect(serviceReturned[0].TotalEstInsurance).toEqual(undefined);
            expect(serviceReturned[0].TotalAdjEstimate).toEqual(undefined);
            expect(serviceReturned[0].Balance).toEqual(undefined);
        });
              
        it('onCalculateDiscountAndTaxAndInsuranceEstimateSuccessShouldCallUpdateAllowedAmount', function () {
            //Arrange
            let service: any = [{ InsuranceOrder: 1 }];
            let recalculatedService: any = [{ InsuranceOrder: 1, Discount: 60, Amount: 540, Tax: 0, InsuranceEstimates: [{ AdjEst: 0, AdjPaid: 0, AllowedAmount: null, EstInsurance: 70, Fee: 600 }], TotalEstInsurance: 70, TotalAdjEstimate: 0, Balance: 0 }];
            mockServiceEstimateCalculationService.updateAllowedAmount = jasmine.createSpy();

            //Act
            mockServiceEstimateCalculationService.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(service, recalculatedService);

            //Assert
            expect(mockServiceEstimateCalculationService.updateAllowedAmount).toHaveBeenCalled();
        });

        it('onCalculateDiscountAndTaxAndInsuranceEstimateSuccessShouldNotCallUpdateAllowedAmount', function () {
            //Arrange
            let service: any = [{ InsuranceOrder: 1 }];
            let recalculatedService: any = [{ InsuranceOrder: 1, Discount: 60, Amount: 540, Tax: 0, InsuranceEstimates: [{ AdjEst: 0, AdjPaid: 0, AllowedAmount: null, EstInsurance: 70, Fee: 600 }], TotalEstInsurance: 70, TotalAdjEstimate: 0, Balance: 0 }];
            mockServiceEstimateCalculationService.updateAllowedAmount = jasmine.createSpy();

            //Act
            mockServiceEstimateCalculationService.onCalculateDiscountAndTaxAndInsuranceEstimateSuccess(service, recalculatedService, false);

            //Assert
            expect(mockServiceEstimateCalculationService.updateAllowedAmount).not.toHaveBeenCalled();
        });
    });

    describe('validateInsuranceOrder ->', () => {
        let services = [];
        beforeEach(() => {
            services = [{
                AccountMemberId: "c49",
                AllowedAmount: 11,
                Amount: 75,
                Description: "d0274",
                Fee: 75,
                InsuranceEstimates: [{
                    AdjEst: 0,
                    EstInsurance: 37.50,
                },],
                InsuranceOrder: null,
            }, {
                AccountMemberId: "c49",
                AllowedAmount: 11,
                Amount: 120,
                Description: "d0210",
                Fee: 120,
                InsuranceEstimates: [{
                    AdjEst: 0,
                    EstInsurance: 60,
                },],
                InsuranceOrder: null,
            }, {
                AccountMemberId: "c49",
                AllowedAmount: 0,
                Amount: 100,
                Description: "d1110",
                Fee: 100,
                InsuranceEstimates: [{
                    AdjEst: 0,
                    EstInsurance: 50,
                },],
                InsuranceOrder: null,
            }, {
                AccountMemberId: "c49",
                AllowedAmount: 0,
                Amount: 100,
                Description: "d2140",
                Fee: 100,
                InsuranceEstimates: [{
                    AdjEst: 0,
                    EstInsurance: 50,
                },],
                InsuranceOrder: null,
            }]
        });
        it('should set InsuranceOrder on services that have null InsuranceOrder - CASE all have Null InsuranceOrder', () => {
            mockServiceEstimateCalculationService.validateInsuranceOrder(services);
            expect(services[0].InsuranceOrder).toBe(1);
            expect(services[0].Description).toBe('d0274');
            expect(services[1].InsuranceOrder).toBe(2);
            expect(services[1].Description).toBe('d0210');
            expect(services[2].InsuranceOrder).toBe(3);
            expect(services[2].Description).toBe('d1110');
            expect(services[3].InsuranceOrder).toBe(4);
            expect(services[3].Description).toBe('d2140');
        });
        it('should set InsuranceOrder on services that have null InsuranceOrder - CASE if some have InsuranceOrder', () => {
            services[1].InsuranceOrder = 1;
            services[1].Description = 'd0210';
            mockServiceEstimateCalculationService.validateInsuranceOrder(services);
            expect(services[0].InsuranceOrder).toBe(1);
            expect(services[0].Description).toBe('d0210');
            expect(services[1].InsuranceOrder).toBe(2);
            expect(services[1].Description).toBe('d0274');
            expect(services[2].InsuranceOrder).toBe(3);
            expect(services[2].Description).toBe('d1110');
            expect(services[3].InsuranceOrder).toBe(4);
            expect(services[3].Description).toBe('d2140');
        });

        it('should set InsuranceOrder on services that have 0 for InsuranceOrder - CASE if all have InsuranceOrder of 0', () => {
            services[0].InsuranceOrder = 0;
            services[0].Description = 'd0274';

            services[1].InsuranceOrder = 0;
            services[1].Description = 'd0210';

            services[2].InsuranceOrder = 0;
            services[2].Description = 'd1110';

            services[3].InsuranceOrder = 0;
            services[3].Description = 'd2140';

            mockServiceEstimateCalculationService.validateInsuranceOrder(services);
            expect(services[0].InsuranceOrder).toBe(1);
            expect(services[0].Description).toBe('d0274');
            expect(services[1].InsuranceOrder).toBe(2);
            expect(services[1].Description).toBe('d0210');
            expect(services[2].InsuranceOrder).toBe(3);
            expect(services[2].Description).toBe('d1110');
            expect(services[3].InsuranceOrder).toBe(4);
            expect(services[3].Description).toBe('d2140');
        });

        it('should set InsuranceOrder on services that have 0 or null for InsuranceOrder - CASE if some NULL, some have InsuranceOrder of 0', () => {
            services[0].InsuranceOrder = 0;
            services[0].Description = 'd0274';

            services[1].InsuranceOrder = null;
            services[1].Description = 'd0210';

            services[2].InsuranceOrder = 0;
            services[2].Description = 'd1110';

            services[3].InsuranceOrder = null;
            services[3].Description = 'd2140';

            mockServiceEstimateCalculationService.validateInsuranceOrder(services);
            expect(services[0].InsuranceOrder).toBe(1);
            expect(services[0].Description).toBe('d0274');
            expect(services[1].InsuranceOrder).toBe(2);
            expect(services[1].Description).toBe('d0210');
            expect(services[2].InsuranceOrder).toBe(3);
            expect(services[2].Description).toBe('d1110');
            expect(services[3].InsuranceOrder).toBe(4);
            expect(services[3].Description).toBe('d2140');
        });

        it('should set InsuranceOrder on services that have 0 or null for InsuranceOrder - CASE if some NULL, some have InsuranceOrder of 0, some have > 0' +
            ' and should preserve existing InsuranceOrder > 0', () => {
                services[0].InsuranceOrder = 0;
                services[0].Description = 'd0274';

                services[1].InsuranceOrder = 1;
                services[1].Description = 'd0210';

                services[2].InsuranceOrder = 0;
                services[2].Description = 'd1110';

                services[3].InsuranceOrder = 2;
                services[3].Description = 'd2140';

                mockServiceEstimateCalculationService.validateInsuranceOrder(services);
                expect(services[0].InsuranceOrder).toBe(1);
                expect(services[0].Description).toBe('d0210');
                expect(services[1].InsuranceOrder).toBe(2);
                expect(services[1].Description).toBe('d2140');
                expect(services[2].InsuranceOrder).toBe(3);
                expect(services[2].Description).toBe('d0274');
                expect(services[3].InsuranceOrder).toBe(4);
                expect(services[3].Description).toBe('d1110');
            });
    });
});