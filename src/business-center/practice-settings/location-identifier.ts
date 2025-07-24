export class LocationIdentifier {
    LocationIdentifierId?: string;
    LocationId?: number;
    MasterLocationIdentifierId?: string;
    Value?: string;
    Description?: string;

    constructor(LocationIdentifierId: string, LocationId: number,
        MasterLocationIdentifierId: string, Value: string, Description: string) {
        this.LocationIdentifierId = LocationIdentifierId;
        this.LocationId = LocationId;
        this.MasterLocationIdentifierId = MasterLocationIdentifierId;
        this.Value = Value;
        this.Description = Description;
    }
}

export class MasterLocationIdentifier {
    DataTag?: string;
    DateDeleted?: Date;
    DateModified?: Date;
    Description?: string;
    MasterLocationIdentifierId?: string;
    Qualifier?: number;
    UserModified?: string;
    Value?: string;

    constructor(DataTag: string, DateDeleted: Date, DateModified: Date, Description: string,
        MasterLocationIdentifierId: string, Qualifier: number, UserModified: string, Value: string) {
        this.DataTag = DataTag;
        this.DateDeleted = DateDeleted;
        this.DateModified = DateModified;
        this.Description = Description;
        this.MasterLocationIdentifierId = MasterLocationIdentifierId;
        this.Qualifier = Qualifier;
        this.UserModified = UserModified;
        this.Value = Value;
    }
}

export const MasterLocationIdentifierQualifiers = [
    { "Value": 0, "Text": "None" },
    { "Value": 1, "Text": "0B   State License Number" },
    { "Value": 3, "Text": "G2   Provider Commercial Number" },
    { "Value": 4, "Text": "LU   Location Number" },
    { "Value": 5, "Text": "ZZ   Provider Taxonomy" }
]