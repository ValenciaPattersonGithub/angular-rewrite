import { ApplyInsurancePaymentIsValidPipe } from './apply-insurance-payment-is-valid.pipe';
import {
  ClaimEntity,
  ServiceTransactionToClaimPaymentDto,
} from 'src/patient/common/models/patient-apply-insurance-payment.model';

describe('ApplyInsurancePaymentIsValidPipe', () => {
      let claimsList: ClaimEntity[];
      let services1: ServiceTransactionToClaimPaymentDto[];
      let services2: ServiceTransactionToClaimPaymentDto[];    
  
      beforeEach(() => {
          services1 = [
              {
                  ClaimId: 'c1',
                  AccountMemberId: 'a1',
                  ServiceTransactionId: 's1',
                  Charges: 100,
                  AllowedAmount: 80,
                  AdjustedEstimate: 0,
                  Balance: 20,
                  PaymentAmount: 50,
                  TotalInsurancePayments: 10,
                  OriginalAllowedAmount: 80,
                  ServiceTransactionToClaimId: '',
                  DateEntered: '',
                  Description: '',
                  ProviderUserId: '',
                  EncounterId: '',
                  PatientName: '',
                  ProviderName: '',
                  InsuranceEstimate: 0,
                  OriginalInsuranceEstimate: 0,
                  PaidInsuranceEstimate: 0,
                  Tooth: '',
                  Surface: '',
                  Roots: '',
                  InsuranceOrder: 0,
                  DateServiceCompleted: '',
                  EstimatedInsuranceId: '',
                  DataTag: '',
                  UserModified: '',
                  DateModified: '',
                  FeeScheduleId: null,
                  FeeScheduleGroupId: null,
                  FeeScheduleGroupDetailId: null,
                  ServiceCodeId: '',
                  AllowedAmountOverride: null
              },
              {
                  ClaimId: 'c1',
                  AccountMemberId: 'a1',
                  ServiceTransactionId: 's2',
                  Charges: 200,
                  AllowedAmount: 150,
                  AdjustedEstimate: 0,
                  Balance: 100,
                  PaymentAmount: 50,
                  TotalInsurancePayments: 100,
                  OriginalAllowedAmount: 150,
                  ServiceTransactionToClaimId: '',
                  DateEntered: '',
                  Description: '',
                  ProviderUserId: '',
                  EncounterId: '',
                  PatientName: '',
                  ProviderName: '',
                  InsuranceEstimate: 0,
                  OriginalInsuranceEstimate: 0,
                  PaidInsuranceEstimate: 0,
                  Tooth: '',
                  Surface: '',
                  Roots: '',
                  InsuranceOrder: 0,
                  DateServiceCompleted: '',
                  EstimatedInsuranceId: '',
                  DataTag: '',
                  UserModified: '',
                  DateModified: '',
                  FeeScheduleId: null,
                  FeeScheduleGroupId: null,
                  FeeScheduleGroupDetailId: null,
                  ServiceCodeId: '',
                  AllowedAmountOverride: null
              }
          ];
  
          services2 = [
              {
                  ClaimId: 'c2',
                  AccountMemberId: 'a2',
                  ServiceTransactionId: 's3',
                  Charges: 300,
                  AllowedAmount: 250,
                  AdjustedEstimate: 0,
                  Balance: 50,
                  PaymentAmount: 50,
                  TotalInsurancePayments: 200,
                  OriginalAllowedAmount: 250,
                  ServiceTransactionToClaimId: '',
                  DateEntered: '',
                  Description: '',
                  ProviderUserId: '',
                  EncounterId: '',
                  PatientName: '',
                  ProviderName: '',
                  InsuranceEstimate: 0,
                  OriginalInsuranceEstimate: 0,
                  PaidInsuranceEstimate: 0,
                  Tooth: '',
                  Surface: '',
                  Roots: '',
                  InsuranceOrder: 0,
                  DateServiceCompleted: '',
                  EstimatedInsuranceId: '',
                  DataTag: '',
                  UserModified: '',
                  DateModified: '',
                  FeeScheduleId: null,
                  FeeScheduleGroupId: null,
                  FeeScheduleGroupDetailId: null,
                  ServiceCodeId: '',
                  AllowedAmountOverride: null
              },
              {
                  ClaimId: 'c2',
                  AccountMemberId: 'a2',
                  ServiceTransactionId: 's4',
                  Charges: 400,
                  AllowedAmount: 350,
                  AdjustedEstimate: 0,
                  Balance: 100,
                  PaymentAmount: 250,
                  TotalInsurancePayments: 0,
                  OriginalAllowedAmount: 350,
                  ServiceTransactionToClaimId: '',
                  DateEntered: '',
                  Description: '',
                  ProviderUserId: '',
                  EncounterId: '',
                  PatientName: '',
                  ProviderName: '',
                  InsuranceEstimate: 0,
                  OriginalInsuranceEstimate: 0,
                  PaidInsuranceEstimate: 0,
                  Tooth: '',
                  Surface: '',
                  Roots: '',
                  InsuranceOrder: 0,
                  DateServiceCompleted: '',
                  EstimatedInsuranceId: '',
                  DataTag: '',
                  UserModified: '',
                  DateModified: '',
                  FeeScheduleId: null,
                  FeeScheduleGroupId: null,
                  FeeScheduleGroupDetailId: null,
                  ServiceCodeId: '',
                  AllowedAmountOverride: null
              }
          ];
          
          claimsList = [
              {
                ClaimId: 'c1',
                MinServiceDate: new Date(),
                MaxServiceDate: new Date(),
                ProviderName: '',
                CarrierName: 'Carrier1',
                PrimaryClaim: false,
                TotalCharges: 0,
                AllowedAmount: 0,
                TotalEstimatedInsurance: 0,
                TotalEstInsuranceAdj: 0,
                TotalPatientBalance: 0,
                PaymentAmount: 0,
                Status: 12,
                FinalPayment: false,
                ServiceTransactionToClaimPaymentDtos: services1,
                ClaimEntityId: '',
                LocationId: 0,
                AccountMemberId: '',
                PatientId: '',
                PatientName: '',
                AccountId: '',
                ProviderId: '',
                CarrierId: '',
                BenefitPlanId: '',
                Type: 0,
                DisplayDate: '',
                ApplyInsurancePaymentBackToPatientBenefit: false,
                RecreateClaim: false,
                IsReceived: false,
                ClaimEntityDataTag: '',
                DataTag: '',
                UserModified: '',
                DateModified: undefined,
                InsuranceEstimate: 0,
                Charges: 0,
                AdjustedEstimate: 0,
                Balance: 0
              },
              {
                ClaimId: 'c2',
                MinServiceDate: new Date(),
                MaxServiceDate: new Date(),
                ProviderName: '',
                CarrierName: 'Carrier2',
                PrimaryClaim: false,
                TotalCharges: 0,
                AllowedAmount: 0,
                TotalEstimatedInsurance: 0,
                TotalEstInsuranceAdj: 0,
                TotalPatientBalance: 0,
                PaymentAmount: 0,
                Status: 12,
                FinalPayment: false,
                ServiceTransactionToClaimPaymentDtos: services2,
                ClaimEntityId: '',
                LocationId: 0,
                AccountMemberId: '',
                PatientId: '',
                PatientName: '',
                AccountId: '',
                ProviderId: '',
                CarrierId: '',
                BenefitPlanId: '',
                Type: 0,
                DisplayDate: '',
                ApplyInsurancePaymentBackToPatientBenefit: false,
                RecreateClaim: false,
                IsReceived: false,
                ClaimEntityDataTag: '',
                DataTag: '',
                UserModified: '',
                DateModified: undefined,
                InsuranceEstimate: 0,
                Charges: 0,
                AdjustedEstimate: 0,
                Balance: 0
              }
          ];          
      });
  
      it('create an instance', () => {
         const pipe = new ApplyInsurancePaymentIsValidPipe();
         expect(pipe).toBeTruthy();
      }); 
  
      describe('when at least one claim has FinalPayment equals true', () => {
          it('should return true if at least one claim does have FinalPayment or PaymentAmount and all service payments are valid', () => {
              const pipe = new ApplyInsurancePaymentIsValidPipe();
              claimsList[0].FinalPayment = true;
              expect(pipe.transform(claimsList, true)).toEqual(true);
          });
  
          it('should return false if at least one claim does not have FinalPayment and PaymentAmount is 0', () => {
              const pipe = new ApplyInsurancePaymentIsValidPipe();
              claimsList[0].FinalPayment = false;
              claimsList[1].FinalPayment = false;
              claimsList[0].PaymentAmount = 0;
              claimsList[1].PaymentAmount = 0;
              expect(pipe.transform(claimsList, false)).toEqual(false);
          });
  
          it('should return false if at least one claim has FinalPayment set to true and PaymentAmount is more than 0' +
          ' and all service payments are valid', () => {
              const pipe = new ApplyInsurancePaymentIsValidPipe();
              claimsList[0].FinalPayment = true;        
              claimsList[0].PaymentAmount = 120;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].FeeScheduleGroupDetailId = null;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 120;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 200;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 100;
              expect(pipe.transform(claimsList, false)).toEqual(false);
          });
      });
  
      describe('when canEditAllowedAmount parameter is false', () => {
          it('should return true when payment exceeds the AllowedAmount if service not on FeeSchedule', () => {      
              const pipe = new ApplyInsurancePaymentIsValidPipe();
              claimsList[0].PaymentAmount = 50;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].FeeScheduleGroupDetailId = null;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 111.0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 111.00;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 0;
              expect(pipe.transform(claimsList, false)).toEqual(true);
          });
  
          it('should return true when payment is less than or equal the Charges', () => { 
              const pipe = new ApplyInsurancePaymentIsValidPipe();     
              claimsList[0].PaymentAmount = 50;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].FeeScheduleGroupDetailId = null;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 111.0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 111.00;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 0;
              expect(pipe.transform(claimsList, false)).toEqual(true);
          });
  
          it('should return false when payment exceeds the Charges', () => {
              const pipe = new ApplyInsurancePaymentIsValidPipe();     
              claimsList[0].PaymentAmount = 50;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].FeeScheduleGroupDetailId = null;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 111.0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 110.00;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 0;
              expect(pipe.transform(claimsList, false)).toEqual(false);
          });
  
      });
     
      describe('when canEditAllowedAmount parameter is true', () => {
          it('should return true when payment exceeds the AllowedAmount if AllowedAmount is 0 and OriginalAllowedAmount is 0 if not FeeSchedule item', () => {      
              const pipe = new ApplyInsurancePaymentIsValidPipe();
              claimsList[0].PaymentAmount = 50;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].FeeScheduleGroupDetailId = null;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].OriginalAllowedAmount = 0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 110.0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 110.00;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 0;
              expect(pipe.transform(claimsList, true)).toEqual(true);
          });        
  
          it('should return false when payment exceeds the AllowedAmount and service is on FeeSchedule', () => {      
              const pipe = new ApplyInsurancePaymentIsValidPipe();
              claimsList[0].PaymentAmount = 50;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].FeeScheduleGroupDetailId = '123';
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 100;
               claimsList[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 110.0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 110.00;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 0;
              expect(pipe.transform(claimsList, true)).toEqual(false);
          });
  
          it('should return true when payment doesnot exceed the AllowedAmount and service is on FeeSchedule', () => {      
              const pipe = new ApplyInsurancePaymentIsValidPipe();
              claimsList[0].PaymentAmount = 50;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].FeeScheduleGroupDetailId = '123';
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 100;
               claimsList[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 100.0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 110.00;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 0;
              expect(pipe.transform(claimsList, true)).toEqual(true);
          });

           it('should return false when payment does exceed the AllowedAmount and OriginalAllowedAmount is not equal AllowedAmount', () => {      
              const pipe = new ApplyInsurancePaymentIsValidPipe();
              claimsList[0].PaymentAmount = 50;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].FeeScheduleGroupDetailId = null;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 99;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].OriginalAllowedAmount = 50;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 100.0;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 110.00;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 0;
              expect(pipe.transform(claimsList, true)).toEqual(false);
          });
  
      });
      
      it('should always return true when service payment amount is 0 if other conditions met', () => {    
          const pipe = new ApplyInsurancePaymentIsValidPipe();
          claimsList[0].FinalPayment = false;  
          claimsList[0].PaymentAmount = 50;
          claimsList[0].ServiceTransactionToClaimPaymentDtos[0].FeeScheduleGroupDetailId = null;
          claimsList[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 0;
          claimsList[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 0.00;
          claimsList[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 110.98;
          claimsList[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 0;
          expect(pipe.transform(claimsList, false)).toEqual(true);
      });

      it('should return true when payment is exactly the same as the difference between AllowedAmount and previous payments and service is on FeeSchedule', () => {      
              const pipe = new ApplyInsurancePaymentIsValidPipe();
              claimsList[0].PaymentAmount = 8.6;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].FeeScheduleGroupDetailId = '123';
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 8.6;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 86;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 110.00;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 77.40;
              expect(pipe.transform(claimsList, true)).toEqual(true);
          });
      
          it('should return false when payment is more than the difference between AllowedAmount and previous payments and service is on FeeSchedule', () => {      
              const pipe = new ApplyInsurancePaymentIsValidPipe();
              claimsList[0].PaymentAmount = 8.6;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].FeeScheduleGroupDetailId = '123';
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].PaymentAmount = 8.6;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].AllowedAmount = 86;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].Charges = 110.00;
              claimsList[0].ServiceTransactionToClaimPaymentDtos[0].TotalInsurancePayments = 78.40;
              expect(pipe.transform(claimsList, true)).toEqual(false);
          });
      
  });
  