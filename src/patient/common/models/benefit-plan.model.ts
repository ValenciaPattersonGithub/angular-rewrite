import { PolicyHolderBenefitPlanDto } from './policy-holder-benefit-plan.model';
import { Patient } from './patient.model';

export interface BenefitPlan {
    AdditionalBenefits: number;
    BenefitPlanId: string;
    PatientBenefitPlanId: string;
    PolicyHolderId: string;
    PatientId: string;
    PolicyHolderBenefitPlanId: string;
    PolicyHolderStringId: string;
    RelationshipToPolicyHolder: string;
    DependentChildOnly: boolean;
    EffectiveDate: string;
    IndividualDeductibleUsed: number;
    IndividualMaxUsed: number;
    Priority: number;
    EligibleEPSDTTitleXIX?: string;
    ObjectState?: string;
    FailedMessage?: string;
    PolicyHolderBenefitPlanDto: PolicyHolderBenefitPlanDto;
    PolicyHolderDetails: Patient;
    IsDeleted: boolean;
    DataTag: string;
    UserModified: string;
    DateModified: string;
}