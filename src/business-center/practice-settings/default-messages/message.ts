export class Message {
    AccountStatementMessageId: string;
    DataTag: string;
    DateModified?: Date;
    Message: string;
    Name: string;
    UserModified?: string;
    Value?:string;

    constructor(DataTag: string, DateModified: Date, Description: string, Message: string, Name: string, AccountStatementMessageId: string,
        UserModified: string,Value:string) {
        this.DataTag = DataTag;
        this.DateModified = DateModified;
        this.Message = Message;
        this.AccountStatementMessageId = AccountStatementMessageId;
        this.Name = Name;
        this.UserModified = UserModified;
        this.Value = Value;
    }

}