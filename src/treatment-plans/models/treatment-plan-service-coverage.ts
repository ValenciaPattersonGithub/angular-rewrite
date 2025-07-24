import { TreatmentPlanServiceBenefit } from './treatment-plan-service-benefit';
import { ServiceTransaction } from './service-transaction';
export interface TreatmentPlanServiceCoverage {
    AccountMemberId: string;
    ServiceCodeId: string;
    LocationId: bigint;
    TaxRate: number;
    DiscountEligible: boolean;
    PrimaryCoverage: TreatmentPlanServiceBenefit;
    SecondaryCoverage: TreatmentPlanServiceBenefit;
}