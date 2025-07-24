import { TreatmentPlanServiceHeader } from './treatment-plan-service-header';
import { ServiceTransaction } from './service-transaction';

export interface TreatmentPlanService {
    ServiceTransaction: ServiceTransaction;
    TreatmentPlanServiceHeader: TreatmentPlanServiceHeader;
}