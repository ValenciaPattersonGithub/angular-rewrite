import { EraClaimPaymentInfo } from './claim-payment-info/era-claim-payment-info';

export class EraHeaderNumber {
//Provider Summary Information
    //Provider Identifier
    ProviderIdentifier?: string;
    //Fiscal Period Date
    FiscalPeriodDate?: string;
    //Total Claim Count
    TotalClaimCount?: number;
    //Total Charge Amount
    TotalClaimChargeAmount?: number;
//Claims
    ClaimPaymentInfos: EraClaimPaymentInfo[] = [];
}
