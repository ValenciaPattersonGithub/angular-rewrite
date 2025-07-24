import { Injectable, Inject } from '@angular/core';
import { TreatmentPlanHeader } from '../models/treatment-plan-header';

@Injectable()
export class TreatmentPlansService {
    private treatmentPlans: TreatmentPlanHeader[];
    private activeTreatmentPlan: TreatmentPlanHeader;

    private orderingServicesTreatmentPlan: any;
    constructor() { }

    setTreatmentPlans(plans: TreatmentPlanHeader[]) {
        this.treatmentPlans = plans;
    }

    getTreatmentPlans() {
        return this.treatmentPlans;
    }

    setActiveTreatmentPlan(plan) {
        if (plan !== null && plan !== undefined) {
            this.activeTreatmentPlan = plan.TreatmentPlanHeader;
            this.activeTreatmentPlan.TreatmentPlanServices = plan.TreatmentPlanServices;
        }
        else {
            this.activeTreatmentPlan = {
                TreatmentPlanId: null,
                TreatmentPlanName: null,
                TreatmentPlanDescription: null,
                RejectedReason: null,
                CreatedDate: null,
                AlternateGroupId: null,
                Note: null,
                IsRecommended: false,
                PersonId: 0,
                SignatureFileAllocationId: null,
                SortSettings: null,
                Status: null,
                HasAtLeastOnePredetermation: false,
                PredeterminationMessage: null,
                CreatedAtLocationId: 0,
                DataTag: null,
                UserModified: null,
                DateModified: null,
                TreatmentPlanServices: []
            };
        }
    }

    getActiveTreatmentPlan() {
        return this.activeTreatmentPlan;
    }

    setOrderingServicesTreatmentPlan(plan) {
        this.orderingServicesTreatmentPlan = plan;
    }

    getOrderingServicesTreatmentPlan() {
        return this.orderingServicesTreatmentPlan;
    }

}
