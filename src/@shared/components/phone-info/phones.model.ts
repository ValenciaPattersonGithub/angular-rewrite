export class Phones {
    CanAddNew?: boolean;
    ContactId?: string;
    IsPrimary?: boolean;
    NewlyAdded?: boolean;
    Notes?: string;
    ObjectState?: string;
    OrderColumn?: number
    PatientInfo?: string;
    PhoneNumber?: string;
    ReminderOK?: boolean;
    TextOk?: boolean;
    Type?: string;
    UserId?: string;
    duplicateNumber?: boolean;
    hasErrors?: boolean;
    _tempId?: number;
    object?: object;

    constructor(CanAddNew?: boolean,
        ContactId?: string,
        IsPrimary?: boolean,
        NewlyAdded?: boolean,
        Notes?: string,
        ObjectState?: string,
        OrderColumn?: number,
        PatientInfo?: string,
        PhoneNumber?: string,
        ReminderOK?: boolean,
        TextOk?: boolean,
        Type?: string,
        UserId?: string,
        duplicateNumber?: boolean,
        hasErrors?: boolean,
        _tempId?: number,
        object?: object) {

        this.CanAddNew = CanAddNew;
        this.ContactId = ContactId;
        this.IsPrimary = IsPrimary;
        this.NewlyAdded = NewlyAdded;
        this.Notes = Notes;
        this.ObjectState = ObjectState;
        this.OrderColumn = OrderColumn;
        this.PatientInfo = PatientInfo;
        this.PhoneNumber = PhoneNumber;
        this.ReminderOK = ReminderOK;
        this.TextOk = TextOk;
        this.Type = Type;
        this.UserId = UserId;
        this.duplicateNumber = duplicateNumber;
        this.hasErrors = hasErrors;
        this._tempId = _tempId;
        this.object = object;

    }

}

export class PhoneTypes {
    DataTag?: string;
    DateModified?: string;
    Name?: string;
    Order?: number;
    PhoneTypeId?: number;
    UserModified?: string;

    constructor(
        DataTag?: string,
        DateModified?: string,
        Name?: string,
        Order?: number,
        PhoneTypeId?: number,
        UserModified?: string,
    ) {
        this.DataTag = DataTag;
        this.DateModified = DateModified;
        this.Name = Name;
        this.Order = Order;
        this.PhoneTypeId = PhoneTypeId;
        this.UserModified = UserModified;
    }
}