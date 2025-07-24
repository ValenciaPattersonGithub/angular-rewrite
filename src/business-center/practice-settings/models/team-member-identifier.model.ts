export class TeamMemberIdentifier {
    TeamMemberIdentifierId?: string;
    UserId?: number;
    MasterUserIdentifierId?: string;
    Value?: string;
    Description?: string;

    constructor(TeamMemberIdentifierId: string, UserId: number,
        MasterUserIdentifierId: string, Value: string, Description: string) {
        this.TeamMemberIdentifierId = TeamMemberIdentifierId;
        this.UserId = UserId;
        this.MasterUserIdentifierId = MasterUserIdentifierId;
        this.Value = Value;
        this.Description = Description;
    }
}

export class MasterTeamMemberIdentifier {
    DataTag?: string;
    DateDeleted?: Date;
    DateModified?: Date;
    Description?: string;
    MasterUserIdentifierId?: string;
    Qualifier?: number;
    UserModified?: string;
    Value?: number;
    Text?: string;

    constructor(DataTag: string, DateDeleted: Date, DateModified: Date, Description: string,
        MasterUserIdentifierId: string, Qualifier: number, UserModified: string, Value: number, Text: string) {
        this.DataTag = DataTag;
        this.DateDeleted = DateDeleted;
        this.DateModified = DateModified;
        this.Description = Description;
        this.MasterUserIdentifierId = MasterUserIdentifierId;
        this.Qualifier = Qualifier;
        this.UserModified = UserModified;
        this.Value = Value;
        this.Text = Text;
    }
}


export class MasterAdditionalIdentifier {
    DataTag?: string;
    DateDeleted?: Date;
    DateModified?: Date;
    Description?: string;
    MasterUserIdentifierId?: string;
    Qualifier?: number;
    UserModified?: string;
    UserId?: string;
    Value?: string;
    UserIdentifierId?: string;
    constructor(DataTag: string, UserId: string,  Value: string,
         UserIdentifierId: string, DateDeleted: Date, DateModified: Date, Description: string,
        MasterUserIdentifierId: string, Qualifier: number, UserModified: string) {
        this.DataTag = DataTag;
        this.UserId = UserId;
        this.Value = Value;
        this.UserIdentifierId = UserIdentifierId;
        this.DateDeleted = DateDeleted;
        this.DateModified = DateModified;
        this.Description = Description;
        this.MasterUserIdentifierId = MasterUserIdentifierId;
        this.Qualifier = Qualifier;
        this.UserModified = UserModified;
    }
}