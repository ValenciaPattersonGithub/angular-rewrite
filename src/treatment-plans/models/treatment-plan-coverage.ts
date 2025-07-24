import { TreatmentPlanServiceCoverage } from './treatment-plan-service-coverage';

export enum FeesIns {
    None = 0,
    ApplyToPatientBalance,
    AdjustOff
}

export enum TaxCalculation {
    Location = 1,
    FeeSchedule
}

export enum TaxAssignment {
    Charge = 1,
    FeeSchedule,
    PatientPortion,
    AfterCoverage
}

export enum SecondaryCalculationMethod {
    None = 0,
    Traditional,
    NonDuplication,
    MaintenanceOfBenefits,
    DoNotEstimate
}

export interface TreatmentPlanCoverage {
    PrimaryDeductibleLeft: number;
    PrimaryLeftBeforeMax: number;
    PrimaryIndividualDeductible: number;
    PrimaryAnnualMax: number;
    PrimaryFeesIns: FeesIns;
    PrimaryTaxCalculation: TaxCalculation;
    PrimaryTaxAssignment: TaxAssignment;
    PrimaryRenewalMonth: bigint;
    SecondaryDeductibleLeft: number;
    SecondaryLeftBeforeMax: number;
    SecondaryIndividualDeductible: number;
    SecondaryAnnualMax: number;
    SecondaryFeesIns: FeesIns;
    SecondaryTaxCalculation: TaxCalculation;
    SecondaryTaxAssignment: TaxAssignment;
    SecondaryRenewalMonth: bigint;
    SecondaryCalculationMethod: SecondaryCalculationMethod;
    PatientDiscountRate: number;
    Services: TreatmentPlanServiceCoverage[];
}