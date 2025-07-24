export class MasterAlerts {
    DataTag?: string;
    DateModified?: string;
    Description?: string;
    MasterAlertId?: string;
    SymbolId?: string;
    UserModified?: string;

    constructor(DataTag: string, DateModified: string, Description: string, MasterAlertId: string,
        SymbolId: string, UserModified: string) {
        this.DataTag = DataTag;
        this.DateModified = DateModified;
        this.Description = Description;
        this.MasterAlertId = MasterAlertId;
        this.SymbolId = SymbolId;
        this.UserModified = UserModified;
    }

}
