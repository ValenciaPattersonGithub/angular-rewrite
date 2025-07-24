import { BenefitPlanDto } from './benefit-plan-dto.model'

export interface PolicyHolderBenefitPlanDto {
    PolicyHolderBenefitPlanId: string;
    PolicyHolderId: string;
    BenefitPlanId: string;
    FamilyDeductibleUsed: number;
    BenefitPlanDto: BenefitPlanDto;
    IsDeleted: boolean;
    DataTag: string;
    UserModified: string;
    DateModified: string;
}