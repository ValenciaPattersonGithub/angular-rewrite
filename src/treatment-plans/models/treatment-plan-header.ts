import { TreatmentPlanService } from './treatment-plan-service';

export interface TreatmentPlanHeader {
    TreatmentPlanId: string;
    TreatmentPlanName: string;
    TreatmentPlanDescription: string;
    RejectedReason: string;
    CreatedDate: Date;
    AlternateGroupId: string;
    Note: string;
    IsRecommended: boolean;
    PersonId: number;
    SignatureFileAllocationId: string;
    SortSettings: string;
    Status: string;
    HasAtLeastOnePredetermation: boolean;
    PredeterminationMessage: string;
    CreatedAtLocationId: number;
    DataTag: string;
    UserModified: string;
    DateModified: string;
    TreatmentPlanServices: TreatmentPlanService[]
}