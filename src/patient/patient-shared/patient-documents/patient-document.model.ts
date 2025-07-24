import { AccountValidation } from "src/patient/common/models/patient-overview.model";

export interface Document {
  FileAllocationId: number,
  DateUploaded: Date,
  DocumentGroupId: number,
  DocumentId: number,
  MimeType: string,
  Name: string,
  OriginalFileName: string,
  ParentId: string,
  ParentType: string,
  UploadedByUserId: string,
  NumberOfBytes: number,
  ToothNumbers: string[];
  Description: string,
  DataTag: string,
  UserModified: string,
  DateModified: string,
}

//DocumentGroupDto
export interface DocumentGroup {
  DocumentGroupId: number,
  Description: string,
  IsSystemDocumentGroup: boolean,
  DataTag: string,
  UserModified: string,
  DateModified: string,
}

//TreatmentPlanSnapshotDto
export interface TreatmentPlanSnapshot {
  PatientName: string;
  LocationId: number;
  LocationNameLine1: string;
  LocationNameLine2: string;
  LocationAddressLine1: string;
  LocationAddressLine2: string;
  LocationCityStateZip: string;
  TreatmentPlanName: string;
  CreatedDate: string;
  Status: string;
  IsRecommended: boolean;
  Stages: TreatmentPlanSnapshotStage[];
  Note?: string;
  Charges: number;
  InsuranceEstimated: number;
  AdjustmentEstimated: number;
  PatientBalance: number;
  ConsentText: string;
  SignatureFileAllocationId: number;
  SnapshotDate: string;
  HiddenSnapshotColumns: string;
}

export interface TreatmentPlanSnapshotStage {
  Details: TreatmentPlanSnapshotDetail[];
  NumberOfServices: number;
  Charges: number;
  InsuranceEstimated: number;
  AdjustmentEstimated: number;
  PatientBalance: number;
}

export interface TreatmentPlanSnapshotDetail {
  LocationId: number;
  Description: string;
  Tooth?: string;
  Area: string;
  Provider: string;
  Charges: number;
  InsuranceEstimated: number;
  AdjustmentEstimated: number;
  PatientBalance: number;
}

//InformedConsentDto
export interface InformedConsent {
  PatientCode: string;
  TreatmentPlanId: string;
  LocationId: number;
  TreatmentPlanName: string;
  ProviderComments: string;
  Notes: string;
  Message: string;
  CreatedDate: string;
  PatientSignatureFileAllocationId: number;
  WitnessSignatureFileAllocationId: number;
  Services: InformedConsentService[];
  PatientFirstName: string;
  PatientLastName: string;
  PatientMiddleName: string;
  PatientPreferredName: string;
  PatientSuffixName: string;
  DataTag?: string;
  UserModified: string;
  DateModified: string;
  PrintUnsigned: boolean;
  PatientName: string;
  FileAllocationId: number;
}

export interface InformedConsentService {
  ServiceTransactionId: string;
  LocationId: number;
  Date: string;
  Description: string;
  Tooth?: string;
  Area?: string;
  ProviderCode: string;
  Status: string;
  Fee: number;
}

export interface PatientSearch {
  PatientId: string;
  FirstName: string;
  LastName: string;
  MiddleName: string;
  Suffix: string;
  PreferredName: string;
  Sex: string;
  DateOfBirth: Date;
  IsPatient: boolean;
  PatientCode: string;
  IsActive: boolean;
  DirectoryAllocationId: string;
  DisplayStatementAccountId: string;
}

export interface PatientSearchValidation {
  authorization: AccountValidation;
  profile: PatientSearch;
  allAccountAuthorization: AccountValidation[];
}

export interface ActivityEvent {
  ActivityEventId: number;
  EventDate: string;
  EventUserId: string;
  LocationId: number;
  Area: number;
  Type: number;
  Action: number;
  ProviderId?: number;
  PatientId: string;
  Description: string;
  Amount?: number;
  TotalAmount?: number;
  FailedMessage?: string;
  ExtendedProperties?: string;
  DataTag: string;
  UserModified: string;
  DateModified: string;
}
