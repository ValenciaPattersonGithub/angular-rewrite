
export class ConfigSettingsModel {
    EnterpriseUrl: string;
    EnterpriseSettingUrl: string;
    PDCOEnterpriseUrl: string;
    PlatformUserServiceUrl: string;
    PaymentPayPageUrl: string;
    FileApiURL: string;
    RteApiUrl: string;
    RxApiUrl: string;
    ClaimApiUrl: string;
    EraApiUrl: string;
    Tenant: string;
    ClientId: string;
    RootUrl: string;
    ResetPasswordUrl: string;
    SupportChatUrl: string;
    SupportEmailUrl: string;
    EnvironmentName: string;
    SupportLiveChatUrl: string;
    SupportLiveChatProductCode: string;
    ScanningKey: string;
    EnableBlue: string;
    EnableUlt: string;
    ClinicalApiUrl: string;
    SapiSchedulingApiUrl: string;
    InsuranceSapiUrl: string;
    StatusPageUrl: string;
    FuseNewReportingApiUrl: string;
    FuseExportApiUrl: string;
    FuseReferralManagementApiUrl: string;
    ApimSubscriptionKey: string;
    ApimNotiSubscriptionKey: string;
    PRMUrl: string;

    constructor(EnterpriseUrl: string, EnterpriseSettingUrl: string, PDCOEnterpriseUrl: string, PlatformUserServiceUrl: string, PaymentPayPageUrl: string,
        FileApiURL: string, RteApiUrl: string, RxApiUrl: string, ClaimApiUrl: string, EraApiUrl: string, Tenant: string, ClientId: string,
        RootUrl: string, ResetPasswordUrl: string, SupportChatUrl: string, SupportEmailUrl: string, EnvironmentName: string, SupportLiveChatUrl: string,
        SupportLiveChatProductCode: string, ScanningKey: string, EnableBlue: string, EnableUlt: string, ClinicalApiUrl: string,
        SapiSchedulingApiUrl: string, InsuranceSapiUrl: string, StatusPageUrl: string, FuseNewReportingApiUrl: string, FuseExportApiUrl: string,
        FuseReferralManagementApiUrl: string, ApimSubscriptionKey: string, ApimNotiSubscriptionKey:string, PRMUrl: string) {

        this.EnterpriseUrl = EnterpriseUrl;
        this.EnterpriseSettingUrl = EnterpriseSettingUrl;
        this.PDCOEnterpriseUrl = PDCOEnterpriseUrl;
        this.PlatformUserServiceUrl = PlatformUserServiceUrl;
        this.PaymentPayPageUrl = PaymentPayPageUrl;
        this.FileApiURL = FileApiURL;
        this.RteApiUrl = RteApiUrl;
        this.RxApiUrl = RxApiUrl;
        this.ClaimApiUrl = ClaimApiUrl;
        this.EraApiUrl = EraApiUrl;
        this.Tenant = Tenant;
        this.ClientId = ClientId;
        this.RootUrl = RootUrl;
        this.ResetPasswordUrl = ResetPasswordUrl;
        this.SupportChatUrl = SupportChatUrl;
        this.SupportEmailUrl = SupportEmailUrl;
        this.EnvironmentName = EnvironmentName;
        this.SupportLiveChatUrl = SupportLiveChatUrl;
        this.SupportLiveChatProductCode = SupportLiveChatProductCode;
        this.ScanningKey = ScanningKey;
        this.EnableBlue = EnableBlue;
        this.EnableUlt = EnableUlt;
        this.ClinicalApiUrl = ClinicalApiUrl;
        this.SapiSchedulingApiUrl = SapiSchedulingApiUrl;
        this.InsuranceSapiUrl = InsuranceSapiUrl;
        this.StatusPageUrl = StatusPageUrl;
        this.FuseNewReportingApiUrl = FuseNewReportingApiUrl;
        this.FuseExportApiUrl = FuseExportApiUrl;
        this.FuseReferralManagementApiUrl = FuseReferralManagementApiUrl;
        this.ApimSubscriptionKey = ApimSubscriptionKey;
        this.ApimNotiSubscriptionKey = ApimNotiSubscriptionKey;
        this.PRMUrl = PRMUrl;	}
}