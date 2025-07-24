import { PersonAccountMember } from './person-account-member.model';

export interface PersonAccount {
    AccountId:                 string;
    PersonId:                  string;
    StatementAccountId:        number;
    DisplayStatementAccountId: string;
    PersonAccountMember:       PersonAccountMember;
    InCollection:              boolean;
    ReceivesStatements:        boolean;
    ReceivesFinanceCharges:    boolean;
    DataTag:                   string;
    UserModified:              string;
    DateModified:              string;
}