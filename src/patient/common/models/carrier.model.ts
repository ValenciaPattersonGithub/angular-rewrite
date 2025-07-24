export interface Carrier {
    CarrierId: string;
    Name: string;
    PayerId: string;
    AddressLine1: string;
    AddressLine2: string;
    City: string;
    State: string;
    ZipCode: string;
    PhoneNumbers: string[];
    FaxNumber: string;
    Website: string;
    Email: string;
    Notes: string;
    FeeScheduleList: FeeSchedule[];
    ClaimFilingIndicatorCode: string;
    IsActive: boolean;
    IsLinkedToActiveBenefitPlan: boolean;
    DataTag: string;
    UserModified: string;
    DateModified: string;
}

export class FeeSchedule {
    FeeScheduleId: string;
    FeeScheduleName: string;
    FeeScheduleDetailDtos: FeeScheduleDetail[];
    FeeScheduleGroupDtos: FeeScheduleGroup[];
}

export class FeeScheduleDetail {
    FeeScheduleId: string;
    FeeScheduleDetailId: string;
    ServiceCodeId: string;
    ObjectState: string;
    FailedMessage: string;
    IsManagedCare: boolean;
}

export class FeeScheduleGroup {
    FeeScheduleGroupId: number;
    FeeScheduleId: string;
    SortOrder: number;
    LocationIds: number[];
    FeeScheduleGroupDetails: FeeScheduleGroupDetail[];
    ObjectState: string;
    FailedMessage: string;
}
export class FeeScheduleGroupDetail {
    FeeScheduleGroupDetailId: number;
    FeeScheduleGroupId: number;
    AllowedAmount: number;
    ServiceCodeId: string;
    ObjectState: string;
    FailedMessage: string;
}