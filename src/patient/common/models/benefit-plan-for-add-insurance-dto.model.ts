export interface BenefitPlanForAddInsuranceDto {
    BenefitPlanId: string;
    BenefitPlanCarrierId: string;
    CarrierName: string;
    BenefitPlanName: string;
    CarrierAddressLine1: string;
    CarrierAddressLine2: string;
    CarrierCity: string;
    CarrierState: string;
    CarrierZipCode: string;
    BenefitPlanGroupNumber: string;
    BenefitPlanGroupName: string;
    BenefitPlanIsActive: boolean;
    PatientHasPlan?: boolean;
}
