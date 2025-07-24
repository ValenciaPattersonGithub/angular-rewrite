import { PaymentProvider } from "src/@shared/enum/accounting/payment-provider";

// TODO may need more columns
export class LocationDto {
    LocationId: number;
    NameLine1: string;
    NameLine2: string;
    AddressLine1: string;
    AddressLine2: string;
    City: string;
    State: string;
    ZipCode: string;    
    PrimaryPhone:string;
    PracticeId: string;
    TaxId: string;
    TypeTwoNpi: string;
    TaxonomyId: string;
    LicenseNumber: string;
    ProviderTaxRate: number;
    SalesAndUseTaxRate: number;
    DefaultFinanceCharge : number;   
    MinimumFinanceCharge : number;
    Timezone: string;
    MerchantId: string; // Account credential associated with openEdge. To be deprecated
    IsPaymentGatewayEnabled: boolean; 
    PaymentProvider: PaymentProvider
    IsRxRegistered: boolean; 
    Selected: boolean;
    DeactivationTimeUtc:Date;
    PaymentProviderAccountCredential: string; // Account credential associated with GPI
}