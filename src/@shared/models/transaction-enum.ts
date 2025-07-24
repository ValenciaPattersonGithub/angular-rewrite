export enum SaveStates {
    None = 'None',
    Update =  'Update',
    Add =  'Add',
    Delete =  'Delete',
    Successful = 'Successful',
    Failed =  'Failed',
}


export enum TransactionTypes {
    Service = 1,
    Payment = 2,
    InsurancePayment = 3,
    NegativeAdjustment = 4,
    PositiveAdjustment = 5,
    FinanceCharge = 6,
    CreditPayment = 7,
    VoidService= 8,
    VoidPayment= 9,
}
