export class ServiceTypes {
    DataTag?: string;
    DateModified?: Date;
    Description?: string;
    IsAssociatedWithServiceCode?: boolean;
    IsSystemType?: boolean;
    PracticeId?: number;
    ServiceTypeId?: string;
    UserModified?: string;
    Value?: string;

    constructor(DataTag: string, DateModified: Date, Description: string, IsAssociatedWithServiceCode: boolean,
        IsSystemType: boolean, PracticeId: number, ServiceTypeId: string, UserModified: string, Value: string) {
        this.DataTag = DataTag;
        this.DateModified = DateModified;
        this.Description = Description;
        this.IsAssociatedWithServiceCode = IsAssociatedWithServiceCode;
        this.IsSystemType = IsSystemType;
        this.PracticeId = PracticeId;
        this.ServiceTypeId = ServiceTypeId;
        this.UserModified = UserModified;
        this.Value = Value;
    }
}
