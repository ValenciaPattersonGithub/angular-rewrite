import { EraHeaderNumber } from './header-number/era-header-number'
import { EraProviderAdjustment } from './provider-adjustment/era-provider-adjustment';
import { ContactInfo } from './contact-info/contact-info';
import { EraReferenceIdentification } from './reference-identification/era-reference-identification';
export class FullEraDto {
//Payer Details
    //Payer Name
    PayerName?: string;
    //Address
    PayerAddressLine?: string;
    //Address 2
    PayerAddressLine2?: string;
    //City, State, Zip
    PayerCityName?: string;
    PayerStateCode?: string;
    PayerPostalCode?: string;
    //Claim Office Contact
    PayerBusinessContactName?: string;
    //Claim Office Fax - use the one with 'FX' Qualifier
    //Claim Office Telephone - use the one with 'TE' Qualifier
    PayerBusinessCommunicationNumber1?: string;
    PayerBusinessCommunicationNumberQualifier1?: string;
    PayerBusinessCommunicationNumber2?: string;
    PayerBusinessCommunicationNumberQualifier2?: string;
    PayerBusinessCommunicationNumber3?: string;
    PayerBusinessCommunicationNumberQualifier3?: string;
    //Tech Contact - display for each
    //Tech Telephone - use qualifier to determine telephone 'TE'
    TechnicalContactInfos?: ContactInfo[];
    //General Info URL
    WebsiteCommunicationNumber1?: string;
    //PayerID
    PayerId?: string;
    //Tax ID
    PayerIdentifier?: string;
//Payee Identification
    //Payee Name
    BillingDentistName?: string;
    //Address
    BillingDentistAddress1?: string;
    BillingDentistAddress2?: string;
    //City, State, Zip
    BillingDentistCity?: string;
    BillingDentistState?: string;
    BillingDentistPostalCode?: string;
    //NPI
    BillingDentistId?: string;
    //Tax ID - Qualifier 'TJ'
    //State License Number - Qualifier 'OB'
    //Payee ID - Qualifier 'PQ'
    ReceiverId?: string; //POSSIBLE TODO?: Current TaxId, should use PayeeAdditionalIdentifications Qualifier 'TJ' instead
    PayeeEntityIdentifierCode?: string;//POSSIBLE TODO?: Current State License Number, should use PayeeAdditionalIdentifications Qualifier 'OB' instead
    PayeeAdditionalIdentifications?: EraReferenceIdentification[];
//Financial Information
    //Description
    TransactionType?: string;
    //Payment Method
    PaymentMethod?: string;
    //Payment Amount
    TotalProviderPayment?: number;
    //Check/EFT Date
    PaymentDate?: string;
    //Check/EFT Number
    TransactionSetControlNumber?: string;
    //Payer Routing Number
    SenderBankNumber?: string; 
    //Payer Account Number
    SenderAccountNumber?: string; 
    //Provider Bank ID Number
    ReceiverBankNumber?: string; 
    //Provider Account Numberpera
    ReceiverAccountNumber?: string; 
//Headers/Claims/Services
    HeaderNumbers?: EraHeaderNumber[];
//Provider Adjsutments
    ProviderAdjustments?: EraProviderAdjustment[];
}
