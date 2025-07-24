export class Practice {
  PracticeName: string;
  AddressLine1: string;
  AddressLine2: string;
  City: string;
  State: string;
  ZipCode: string;
  PrimaryPhone: string;
  SecondaryPhone: string;
  Fax: string;
  MainContact: string;
  CustomerID: string;
  MerchantId: string;
  Timezone: string;
  PracticeId: number;

  constructor(id?: number, name?: string, custID?: string, contactName?: string, address1?: string, address2?: string, city?: string, stateProvince?: string, postalCode?: string, phone1?: string, phone2?: string, fax?: string, merchantID?: string, timezone?: string) {
    this.PracticeName = name;
    this.AddressLine1 = address1;
    this.AddressLine2 = address2;
    this.City = city;
    this.State = stateProvince;
    this.ZipCode = postalCode;
    this.PrimaryPhone = phone1;
    this.SecondaryPhone = phone2;
    this.Fax = fax;  // Needs to be included when fax PBI is ready
    this.MainContact = contactName;
    this.PracticeId = id;
    this.CustomerID = custID;
    this.MerchantId = merchantID;
    this.Timezone = timezone;
  }
}

export class PracticeDataResponseWrapper {
  Result: PracticeDataResponseModel
}

export class PracticeDataResponseModel {
  DataTag?: string;
  DateModified?: string;
  Description?: string;
  LegacyId?: string;
  MerchantId?: string;
  Name?: string;
  PracticeId?: number;
  PrimaryContactAddress1?: string;
  PrimaryContactAddress2?: string;
  PrimaryContactCity?: string;
  PrimaryContactCountry?: string;
  PrimaryContactEmail?: string;
  PrimaryContactName?: string;
  PrimaryContactPhone1?: string;
  PrimaryContactPhone1Description?: string;
  PrimaryContactPhone1SupportsTextMsg?: boolean;
  PrimaryContactPhone2?: string;
  PrimaryContactPhone2Description?: string;
  PrimaryContactPhone2SupportsTextMsg?: boolean;
  PrimaryContactPostalCode?: string;
  PrimaryContactStateProvince?: string;
  SAPCustomerId?: string;
  SecondaryContactAddress1?: string;
  SecondaryContactAddress2?: string;
  SecondaryContactCity?: string;
  SecondaryContactCountry?: string;
  SecondaryContactEmail?: string;
  SecondaryContactName?: string;
  SecondaryContactPhone1?: string;
  SecondaryContactPhone1Description?: string;
  SecondaryContactPhone1SupportsTextMsg?: boolean;
  SecondaryContactPhone2?: string;
  SecondaryContactPhone2Description?: string;
  SecondaryContactPhone2SupportsTextMsg?: boolean;
  SecondaryContactPostalCode?: string;
  SecondaryContactStateProvince?: string;
  Status?: number;
  StatusUpdateDateTimeUTC?: string;
  Timezone?: string;
  UserModified?: string;


}


export type MFAMethodType =  'none' | 'phone' | 'authenticator';

export class MFASettings {
  mfaEnabled: boolean;
  preferredMFAMethod: MFAMethodType;
}

export class PracticeSettings {
  DataTag?: string;
  DateModified?: string;
  DefaultTimeIncrement?: number;
  IsCommunicationCenterEnabled?: boolean;
  IsEStatementV3Enabled?: boolean;
  IsLiveChatEnabled?: boolean;
  IsMigrationEnabled?: boolean;
  IsProvisioned?: boolean;  
  IsSolutionReachEnabled?: boolean;
  PracticeId?: number;
  PracticeSettingId?: string;
  SettingsName?: string;
  UserModified?: string;
}

export class EnterpriseSettings {
  enterpriseID?: number;
  settingName?: string;
  settingType?: number;
  settingValue?: string;
  applicationID?: number;
  createDate?: string;
  modifiedDate?: string;
  createUser?: string;
  modifiedUser?: string;
  dataTag?: string;
}