export class ReferralType {
    referralTypeId?: string;
    address1?: string;
    address2?: string;
    city?: string;
    dataTag?: string;
    dateModified?: string;
    emailAddress?: string;
    firstName?: string;
    isDeleted?: boolean;
    isAssociatedWithOther?: boolean;
    middleName?: string;
    lastName?: string;
    phone?: string;
    practiceName?: string;
    referralSourceType?: number;
    state?: string;
    zipCode?: string;
    status?: boolean;
    userModified?: string;
    isDuplicate?: boolean;
}

export enum ReferralSourceType {
    Both = 0,
    Source = 1,
    Recipient = 2
}


export class BreadCrum {
    name?: string;
    path?: string;
    title?: string;
}

export class ReferralFilterType {
    text?: string;
    value?: string;
}

export class PracticeSearchResult {
    name?: string;
    referralTypeId?: string;
}

export class GetPracticeAffiliatesRequest {
    PracticeId?: number;
    Search?: string;
}

export class GetPatientAffiliatesRequest {
    PatientId?: string;
    Search?: string;
}

export class GetPracticeProvidersRequest {
    PracticeId?: number;
    Search?: string;
    UserId?: string;
}

export class GetProviderReferralAffiliatesRequest {
    PageNumber?: number;
    PageSize?: number;
    PracticeId?: number;
    ProviderAffiliateId?: string;
    Search?: string;
    SortColumn?: string;
    SortOrder?: string;
    Status?: boolean;
}

export class GetReferralRequest {
    PatientId: string;
    GetAll?: boolean;
}

export class DeleteReferralRequest {
    ReferralId: string;
    PatientId: string;
}

export interface GetReferralsResponseDto {
    referralAffiliate: ReferralAffiliateResponse;
    referralCategory: string;
    referralCategoryId: number;
    referralDirectionType: string;
    referralDirectionTypeId: number;
    dateCreated: string;
    otherSource: OtherAffiliateSource;
    referringProviderId: string | null;
    treatmentPlanId: string | null;
    isPrintTreatmentPlan: boolean;
    referralId: string;
    note: string;
    referralAffiliateName: string;
    referringTo: string;
    referringFrom: string;
    address1: string;
    address2: string;
    patientEmailAddress: string;
    returnDate: Date | null;
    actualReturnDate?: Date | null;
}

export interface ReferralAffiliateResponse {
    referralAffiliateId: string | null;
    firstName: string;
    lastName: string;
    middleName: string;
    emailAddress: string;
    phone: string;
    isExternal: boolean;
    practiceAffiliateName: string;
}

export interface OtherAffiliateSource {
    otherSourceAffiliateId: string | null;
    sourceId: string;
    campaignName: string;
}

export interface GetPatientAffiliatesResponse {
    PatientAffiliateId: string;
    FirstName: string;
    LastName: string;
    EmailAddress: string;
    Phone: string;
    Status: string;
    PracticeId: string | null;
}

export class GetReferralTotals {
    practiceId: number;
    startDate: string;
    endDate: string;
}

export const sourceNameArray = [
    { value: 1, text: "Email" },
    { value: 2, text: "Instagram" },
    { value: 3, text: "Facebook" },
    { value: 4, text: "LinkedIn" },
    { value: 5, text: "Twitter" },
    { value: 6, text: "Other" }
];

export class CreateReferralCommunicationRequest {
    PatientId :string;
    CommunicationType: number;
    CommunicationCategory: number;
    Reason: number;
    Notes: string;
    LetterTemplate: string;
    CommunicationMode: number;
    LetterTemplateName: string;
    CommunicateTemplateId: number;
    Status: number;
}

export interface GetCommunicationReferralsResponseDto {
    referrals: GetReferralsResponseDto[];
    referralCommunications: GetCommunicationsResponseDto[];
}

export interface GetCommunicationsResponseDto {
    referralCommunicationId: number;
    patientId: string;
    communicationType: number;
    reason: number;
    notes: string;
    communicationDate: Date;
    dueDate?: Date;
    practiceId: number;
    userModified: string;
    dateModified: Date;
    isComplete?: boolean;
    letterTemplate: string;
    communicationTemplateId?: number;
    status?: number;
    isRead?: boolean;
    communicationCategory?: number;
    createdBy?: string;
    communicationMode: number;
}

export class UpdateReferralCommunicationRequest extends CreateReferralCommunicationRequest {
    ReferralCommunicationId: number;
}