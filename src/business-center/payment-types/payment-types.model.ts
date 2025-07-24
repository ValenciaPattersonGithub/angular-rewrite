export class PaymentTypes {
    CurrencyTypeId?: number;
    CurrencyTypeName?: string;
    DataTag?: string;
    DateModified?: string;
    Description?: string;
    IsActive?: boolean;
    IsDefaultTypeOnBenefitPlan?: boolean;
    IsSystemType?: boolean;
    IsUsedInCreditTransactions?: boolean;
    PaymentTypeCategory?: number;
    PaymentTypeId?: string;
    Prompt?: string;
    UserModified?: string;
    IsAutoApplied?: boolean;
}

export enum PaymentTypeCategory {
    AccountPayment = 1,
    InsurancePayment = 2
}

export class CurrencyTypes {
    Id: number;
    Name: string;
    Order: number;
}