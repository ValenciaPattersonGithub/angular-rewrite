import { EraStatementDate } from './era-statement-date';
import { EraServicePaymentInfo } from './service-payment-info/era-service-payment-info';
import { EraReferenceIdentification } from '../../reference-identification/era-reference-identification';
import { ContactInfo } from '../../contact-info/contact-info';
import { EraAmountData } from '../../amount-data/era-amount-data';

export class EraClaimPaymentInfo {
    ClaimCommonId?: string;
//Claim Payment Information
    //Patient Name
    PatientLastName?: string;
    PatientNameSuffix?: string;
    PatientFirstName?: string;
    PatientMiddleName?: string;
    //Insured Name
    PolicyHolderLastName?: string;
    PolicyHolderFirstName?: string;
    PolicyHolderMiddleName?: string;
    PolicyHolderNameSuffix?: string;
    //Insured ID
    PatientId?: string;
    //Corrected Insured
    CorrectedLastName?: string;
    CorrectedFirstName?: string;
    CorrectedMiddleName?: string;
    CorrectedNameSuffix?: string;
    //Corrected Insured ID
    CorrectedId?: string;
    //Group Or Policy Number
    PolicyHolderId?: string;
    //Class of Contract Code - Identifier 'CE'
    OtherClaimRelatedIdentifications?: EraReferenceIdentification[];
    //Claim Control Number
    PayerClaimControlNumber?: string;
//-->   NPI
        //TODO
    //Claim Office Telephone - 'TE' Qualifier
    ClaimContactInformations?: ContactInfo[];
    //Claim Date
    StatementDates?: EraStatementDate[];
    //Claim Received
    ClaimReceivedDate?: string;
    //Billed Amount
    TotalClaimChargeAmount?: number;
    //Claim Payment Amount
    ClaimPaymentAmount?: number;
    //Patient Resp Amount
    PatientResponsibilityAmount?: number;
    //Coverage Amount - 'AU' Qualifier
    //Patient Amount Paid - 'F5' Qualifier
    ClaimSupplementalInformations?: EraAmountData[];   
    //Claim Status
    ClaimStatusCode?: string;
    //Payer Reference Number
    TreatingDentistId?: string;
//Inpatient Adjudication Information (MIA segment)
    InpatientCoveredDaysOrVisitsCount?: number;
    InpatientPPSOperatingOutlierAmount?: number; 
    InpatientLifetimePsychiatricDaysCount?: number;
    InpatientClaimDRGAmount?: number;
    InpatientClaimPaymentRemarkCode?: string;
    InpatientClaimDisproportionateShareAmount?: number;
    InpatientClaimMSPPassthroughAmount?: number;
    InpatientClaimPPSCapitalAmount?: number;
    InpatientPPSCapitalFSPDRGAmount?: number;
    InpatientPPSCapitalHSPDRGAmount?: number;
    InpatientPPSCapitalDSHDRGAmount?: number;
    InpatientOldCapitalAmount?: number;
    InpatientPPSCapitalIMEAmount?: number;
    InpatientPPSOperatingHospitalSpecificDRGAmount?: number;
    InpatientCostReportDayCount?: number;
    InpatientPPSOperatingFederalSpecificDRGAmount?: number;
    InpatientClaimPPSCapitalOutlierAmount?: number;
    InpatientClaimIndirectTeachingAmount?: number;
    InpatientNonpayableProfessionalComponentAmount?: number;
    InpatientClaimPaymentRemarkCode1?: string;
    InpatientClaimPaymentRemarkCode2?: string;
    InpatientClaimPaymentRemarkCode3?: string;
    InpatientClaimPaymentRemarkCode4?: string;
    InpatientPPSCapitalExceptionAmount?: number;
//Outpatient Adjudication Information (MOA segment) 
    OutpatientReimbursementRate?: number;
    OutpatientClaimHCSPCSPayableAmount?: number;
    OutpatientClaimPaymentRemarkCode1?: string;
    OutpatientClaimPaymentRemarkCode2?: string;
    OutpatientClaimPaymentRemarkCode3?: string;
    OutpatientClaimPaymentRemarkCode4?: string;
    OutpatientClaimPaymentRemarkCode5?: string;
    OutpatientClaimESRDPaymentAmount?: number;
    OutpatientNonpayableProfessionalComponentAmount?: number;
//Services
    ServicePaymentInfos?: EraServicePaymentInfo[];
}
