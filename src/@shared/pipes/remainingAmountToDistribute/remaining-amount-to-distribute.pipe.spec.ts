import { TestBed } from '@angular/core/testing';
import { RemainingAmountToDistributePipe } from './remaining-amount-to-distribute.pipe';
import {
  ClaimEntity,
  ServiceTransactionToClaimPaymentDto,
} from 'src/patient/common/models/patient-apply-insurance-payment.model';
import cloneDeep from 'lodash/cloneDeep';

describe('RemainingAmountToDistributePipe', () => {
  let pipe: RemainingAmountToDistributePipe;
  let serviceTransactionToClaimPaymentDto: ServiceTransactionToClaimPaymentDto;
  let claimsList: ClaimEntity[];
  beforeEach(() => {
    serviceTransactionToClaimPaymentDto = {
      ServiceTransactionToClaimId: '12345',
      ServiceTransactionId: '22345',
      ClaimId: '32345',
      DateEntered: '2021-07-01T00:00:00',
      Description: 'string',
      ProviderUserId: 'string',
      EncounterId: 'string',
      AccountMemberId: 'string',
      PatientName: 'string',
      ProviderName: 'string',
      Charges: 0,
      InsuranceEstimate: 0,
      AdjustedEstimate: 0,
      OriginalInsuranceEstimate: 0,
      PaidInsuranceEstimate: 0,
      Balance: 0,
      TotalInsurancePayments: 0,
      PaymentAmount: 0,
      AllowedAmount: 0,
      Tooth: 'string',
      Surface: 'string',
      Roots: 'string',
      InsuranceOrder: 1,
      DataTag: 'string',
      UserModified: 'string',
      DateModified: '2021-07-01T00:00:00',
      DateServiceCompleted: '2021-07-01T00:00:00',
      EstimatedInsuranceId: 'string',
      OriginalAllowedAmount: 0, 
      FeeScheduleId: null,
      FeeScheduleGroupId: null,
      FeeScheduleGroupDetailId: null,
      ServiceCodeId: null,  
      AllowedAmountOverride: null

    };

    claimsList = [
      {
        ClaimEntityId: '12345',
        ClaimId: '12345',
        LocationId: 123,
        AccountMemberId: '12587',
        PatientId: '14785',
        PatientName: 'Norman Bates',
        AccountId: '25874',
        ProviderId: '12587',
        ProviderName: '25874',
        CarrierId: '25412',
        BenefitPlanId: '52874',
        CarrierName: '12548',
        PrimaryClaim: false,
        Type: 25,
        MinServiceDate: new Date(),
        MaxServiceDate: new Date(),
        DisplayDate: '2021-07-01',
        ServiceTransactionToClaimPaymentDtos: [],
        ApplyInsurancePaymentBackToPatientBenefit: false,
        RecreateClaim: false,
        Status: 12,
        IsReceived: false,
        TotalCharges: 0,
        TotalEstimatedInsurance: 0,
        TotalEstInsuranceAdj: 0,
        TotalPatientBalance: 0,
        PaymentAmount: 0,
        FinalPayment: false,
        AllowedAmount: 0,
        ClaimEntityDataTag: 'string',
        DataTag: 'string',
        UserModified: 'string',
        DateModified: new Date(),
        InsuranceEstimate: 0,
        Charges: 0,
        AdjustedEstimate: 0,
        Balance: 0,
      },
    ];
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RemainingAmountToDistributePipe],
    });
    pipe = TestBed.inject(RemainingAmountToDistributePipe);
  });

  it('can load instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return the correct remaining amount after distribution', () => {
    const service1 = cloneDeep(serviceTransactionToClaimPaymentDto);
    service1.PaymentAmount = 10;
    const service2 = cloneDeep(serviceTransactionToClaimPaymentDto);
    service2.PaymentAmount = 20;
    const service3 = cloneDeep(serviceTransactionToClaimPaymentDto);
    service3.PaymentAmount = 15;
    const service4 = cloneDeep(serviceTransactionToClaimPaymentDto);
    service4.PaymentAmount = 25;
    claimsList[0].ServiceTransactionToClaimPaymentDtos.push(service1, service2, service3, service4);
    const amount = 100;
    const result = pipe.transform(claimsList, amount);
    expect(result).toEqual(amount - 10 - 20 - 15 - 25);
  });

  it('should return the original amount if claimsList is empty', () => {
    const claimsList: ClaimEntity[] = [];
    const amount = 100;

    const result = pipe.transform(claimsList, amount);

    expect(result).toEqual(amount);
  });
});
