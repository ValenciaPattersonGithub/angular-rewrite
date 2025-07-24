export class DiscountType {
    MasterDiscountTypeId? :string;
    DiscountName?: string;
    DiscountRate?: number;
    DiscountRateDisplay?: string;
    IsActive?: boolean;
    DataTag?: string;
    UserModified?: string;
    DateModified?: Date;

    constructor(MasterDiscountTypeId: string, DataTag: string, DateModified: Date, DiscountName: string, DiscountRate: number, IsActive : boolean, UserModified: string) {
        this.MasterDiscountTypeId = MasterDiscountTypeId;
        this.DataTag = DataTag;
        this.DiscountName = DiscountName
        this.DiscountRate = DiscountRate;
        this.DiscountRateDisplay = (DiscountRate * 100).toFixed(2);
        this.IsActive  = IsActive;
        this.UserModified = UserModified;
        this.DateModified = DateModified;
    }
}





