export class PatientAdditionalIdentifiers {
    MasterPatientIdentifierId?: string;
    Description?: string;
    IsSpecifiedList?: boolean;
    DateDeleted?: Date;
    IsUsed?: boolean;
    ListValues?: (IdentifiersListItems)[] | null;
    DataTag?: string;
    UserModified?: string;
    DateModified?: Date;
    IsSpecifiedListName?: string;
    constructor(MasterPatientIdentifierId: string,
        Description: string,
        IsSpecifiedList: boolean,
        DateDeleted?: Date,
        IsUsed?: boolean,
        ListValues?: IdentifiersListItems[],
        DataTag?: string,
        UserModified?: string,
        DateModified?: Date, IsSpecifiedListName?: string) {
        this.MasterPatientIdentifierId = MasterPatientIdentifierId;
        this.Description = Description;
        this.IsSpecifiedList = IsSpecifiedList;
        this.DateDeleted = DateDeleted;
        this.IsUsed = IsUsed;
        this.ListValues = ListValues
        this.DataTag = DataTag;
        this.UserModified = UserModified;
        this.DateModified = DateModified;
        this.IsSpecifiedListName = IsSpecifiedListName
    }
}
export class IdentifiersListItems {
    MasterPatientIdentifierListItemsId: string;
    MasterPatientIdentifierId: string;
    Value: string;
    Order: number;
    IsUsed: boolean;
    DateDeleted?: Date;
    DataTag: string;
    UserModified: string;
    DateModified: Date;
    constructor(
        MasterPatientIdentifierId?: string,
        Value?: string,
        Order?: number,
        IsUsed?: boolean,
        DateDeleted?: Date,
        DataTag?: string,
        UserModified?: string,
        DateModified?: Date) {
        this.MasterPatientIdentifierId = MasterPatientIdentifierId;
        this.Value = Value;
        this.Order = Order;
        this.DateDeleted = DateDeleted;
        this.IsUsed = IsUsed;
        this.DataTag = DataTag;
        this.UserModified = UserModified;
        this.DateModified = DateModified;
    }
}
