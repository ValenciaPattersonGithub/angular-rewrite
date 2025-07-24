export interface AccountMembersAccountInfo {
    AccountMemberId: string;
    AccountId?: string;
    ResponsiblePersonId?: string;
    PersonId: string;
    Balance30: number;
    Balance60: number;
    Balance90: number;
    Balance120: number;
    BalanceCurrent: number;
    BalanceInsurance: number;
    EstimatedInsurance30: number;
    EstimatedInsurance60: number;
    EstimatedInsurance90: number;
    EstimatedInsurance120: number;
    EstimatedInsuranceCurrent: number;
    AdjustedEstimate30: number;
    AdjustedEstimate60: number;
    AdjustedEstimate90: number;
    AdjustedEstimate120: number;
    AdjustedEstimateCurrent: number;
    IsActive: boolean;
    DataTag?: string;
    UserModified?: string;
    DateModified?: string;
}