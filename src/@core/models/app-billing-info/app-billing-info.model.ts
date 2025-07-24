export class ApplicationBillingInfoModel
{
    ApplicationBillingInfoId: number;
    ApplicationId: number;
    BillingModel: number;
    BillingMonth?: number;
}


export class ApplicationBillingInfoModelWrapper {
    Result: ApplicationBillingInfoModel
}