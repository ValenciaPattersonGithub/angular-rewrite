import { EraServiceDate } from './era-service-date';
import { EraServiceAdjustment } from './era-service-adjustment';

export class EraServicePaymentInfo {
    ServiceDates: EraServiceDate[];
    CompositeMedicalProcedureIdentifier: string;
    LineItemChargeAmount: number;
    LineItemProviderPaymentAmount: number;
    ServiceAdjustments: EraServiceAdjustment[];
}
