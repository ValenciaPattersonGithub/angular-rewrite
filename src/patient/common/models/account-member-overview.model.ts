import { AccountMembersAccountInfo } from './account-members-account-info.model';
import { AccountMembersProfileInfo } from './account-members-profile-info.model';

export interface AccountMemberOverview {
    AccountId:                 string;
    AccountMembersProfileInfo: AccountMembersProfileInfo[];
    AccountMembersAccountInfo: AccountMembersAccountInfo[];
}

