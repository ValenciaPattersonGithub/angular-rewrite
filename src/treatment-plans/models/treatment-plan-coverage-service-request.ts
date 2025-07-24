export interface TreatmentPlanCoverageServiceRequest {
    AccountMemberId: string;
    ServiceTransactionId: string;
    ServiceCodeId: string;
    LocationId: number;
    Fee: number;
    ServiceTransactionStatusId: number;    
}