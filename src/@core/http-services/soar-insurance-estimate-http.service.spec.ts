import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SoarInsuranceEstimateHttpService } from './soar-insurance-estimate-http.service';

describe('SoarInsuranceEstimateHttpService', () => {
    let service: SoarInsuranceEstimateHttpService;

    let serviceTransactionDtos;

    beforeEach((() => {
        serviceTransactionDtos = [{
            AccountMemberId: '123',
            Amount: 123,
            AppointmentId: '123',
            RelatedRecordId: '123',
            DateCompleted: new Date(),
            DateEntered: new Date(),
            Description: ' serviceTransaction.Description',
            Discount: 0,
            EncounterId: null,
            EnteredByUserId: '1125',
            Fee: 140,
            PriorFee: 0,
            LocationId: 1258,
            Note: 'serviceTransaction.Note',
            ProviderUserId: '3358',
            RejectedReason: 'serviceTransaction.RejectedReason',
            ServiceCodeId: '22358',
            ServiceTransactionId: '11258',
            ServiceTransactionStatusId: 11225,
            Surface: 'Surface',
            SurfaceSummaryInfo: 'SurfaceSummaryInfo',
            Roots: '',
            RootSummaryInfo: '',
            Tax: 0,
            Tooth: 'Tooth',
            TransactionTypeId: '123',
            ObjectState: 'None',
            FailedMessage: 'FailedMessage',
            Balance: 20,
            AgingDate: new Date(),
            ProposedAtLocationId: '123',
            InsuranceEstimates:
                [{
                    EstimatedInsuranceId: '1234',
                    AccountMemberId: '123',
                    EncounterId: '1234',
                    ServiceTransactionId: '11258',
                    ServiceCodeId: '22358',
                    PatientBenefitPlanId: '45678',
                    Fee: 140,
                    EstInsurance: 100,
                    IsUserOverRidden: false,
                    FamilyDeductibleUsed: 20,
                    IndividualDeductibleUsed: 20,
                    CalculationDescription: 'calculation',
                    CalcWithoutClaim: false,
                    PaidAmount: 0,
                    ObjectState: 'None',
                    FailedMessage: '',
                    AdjEst: 0,
                    AdjPaid: 0,
                    AreBenefitsApplied: false,
                    IsMostRecentOverride: false,
                    AllowedAmountOverride: null,
                    AllowedAmountDisplay: 60,
                    AllowedAmount: 60,
                    DataTag: 'doo',
                    DateModified: undefined,
                    UserModified: undefined,
                }, {
                    EstimatedInsuranceId: '1235',
                    AccountMemberId: '123',
                    EncounterId: '1234',
                    ServiceTransactionId: '11259',
                    ServiceCodeId: '22359',
                    PatientBenefitPlanId: '45679',
                    Fee: 140,
                    EstInsurance: 20,
                    IsUserOverRidden: false,
                    FamilyDeductibleUsed: 20,
                    IndividualDeductibleUsed: 20,
                    CalculationDescription: 'calculation',
                    CalcWithoutClaim: false,
                    PaidAmount: 0,
                    ObjectState: 'None',
                    FailedMessage: '',
                    AdjEst: 0,
                    AdjPaid: 0,
                    AreBenefitsApplied: false,
                    IsMostRecentOverride: false,
                    AllowedAmountOverride: null,
                    AllowedAmountDisplay: 90.00,
                    AllowedAmount: 90,
                    DataTag: 'doo',
                    DateModified: undefined,
                    UserModified: undefined,
                }],
            TotalEstInsurance: 100,
            TotalInsurancePaidAmount: 20,
            TotalAdjEstimate: 20,
            TotalAdjPaidAmount: 20,
            TotalUnpaidBalance: 120,
            CreatedDate: new Date(),
            IsDeleted: false,
            IsBalanceAlreadyUpdated: false,
            IsForClosingClaim: false,
            PredeterminationHasResponse: false,
            IsDiscounted: false,
            ProviderOnClaimsId: '1234',
            IsOnInformedConsent: false,
            InsuranceOrder: 1,
            MasterDiscountTypeId: '1234',
            OldServiceTransactionId: '1234',
            AgingCategoryId: '1234',
            BypassSnapshotQueue: false,
            OnClaimBeingClosed: false,
            ProposedProviderId: '12345',
            DataTag: '12358',
            DateModified: new Date(),
            UserModified: '12347',
            $toothAreaData: '123',
        }];

        TestBed.configureTestingModule({

            imports: [HttpClientTestingModule],
            declarations: [],
            providers: [SoarInsuranceEstimateHttpService,
                { provide: 'SoarConfig', useValue: {} },
            ]
        });
        service = TestBed.inject(SoarInsuranceEstimateHttpService);
    }));

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('calculateDiscountAndTaxAndInsuranceEstimate', () => {
        it('should call mapToServiceTransactionEstimateDto', function () {
            spyOn(service, 'mapToServiceTransactionEstimateDto');
            service.calculateDiscountAndTaxAndInsuranceEstimate(serviceTransactionDtos);
            expect(service.mapToServiceTransactionEstimateDto).toHaveBeenCalled();
        });
    });

    describe('mapServiceTransactionToObject', () => {
        it('should map IServiceTransactionDto list without dynamic properties', function () {
            let mappedServices = service.mapToServiceTransactionEstimateDto(serviceTransactionDtos);
            expect(mappedServices[0].AccountMemberId).toEqual(serviceTransactionDtos[0].AccountMemberId);
            expect(mappedServices[0].Amount).toEqual(serviceTransactionDtos[0].Amount);
            expect(mappedServices[0].Discount).toEqual(serviceTransactionDtos[0].Discount);
            expect(mappedServices[0]['$toothAreaData']).toBe(undefined);
        });
    });

    describe('mapServiceTransactionToObject', () => {
        it('should map EstimateDto list without dynamic properties', function () {
            let mappedServices = service.mapToServiceTransactionEstimateDto(serviceTransactionDtos);
            // AllowedAmount is dto property            
            expect(mappedServices[0].InsuranceEstimates[0].AllowedAmount).toEqual(serviceTransactionDtos[0].InsuranceEstimates[0].AllowedAmount);
            expect(mappedServices[0].InsuranceEstimates[1].AllowedAmount).toEqual(serviceTransactionDtos[0].InsuranceEstimates[1].AllowedAmount);
            // AllowedAmountDisplay is dynamic property
            expect(mappedServices[0].InsuranceEstimates[0].AllowedAmountDisplay).toBe(undefined);
            expect(mappedServices[0].InsuranceEstimates[1].AllowedAmountDisplay).toBe(undefined);
        });
    });

    describe('mapServiceTransactionToObject', () => {
        it('should map EstimateDto list without dynamic properties when only one estimate', function () {
            serviceTransactionDtos[0].InsuranceEstimates.splice(1, 1)
            console.log(serviceTransactionDtos[0].InsuranceEstimates.length)
            let mappedServices = service.mapToServiceTransactionEstimateDto(serviceTransactionDtos);
            // AllowedAmount is dto property            
            expect(mappedServices[0].InsuranceEstimates[0].AllowedAmount).toEqual(serviceTransactionDtos[0].InsuranceEstimates[0].AllowedAmount);
            // AllowedAmountDisplay is dynamic property
            expect(mappedServices[0].InsuranceEstimates[0].AllowedAmountDisplay).toBe(undefined);
            expect(serviceTransactionDtos[0].InsuranceEstimates.length).toBe(1)
        });
    });

    describe('mapServiceTransactionToObject', () => {
        it('should map ServiceTransactionDto.InsuranceEstimates even when no estimates on dto', function () {
            serviceTransactionDtos[0].InsuranceEstimates = [];
            let mappedServices = service.mapToServiceTransactionEstimateDto(serviceTransactionDtos);
            expect(mappedServices[0].InsuranceEstimates).toEqual([]);
        });
    });
});
