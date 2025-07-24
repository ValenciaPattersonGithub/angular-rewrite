import { AllPatient, Appointment, PreventiveCare, TreatmentPlans } from "src/patient/common/models/patient-grid-response.model";

export class PatientMailingInfo {
    communicationTypeId?: string;
    communicationTemplateId?: string;
    isPrintMailingLabel: boolean;
    isPostcard: boolean;
    dataGrid?: AllPatient | PreventiveCare | TreatmentPlans | Appointment;
}

export class PatientPostcardInfo {
    AddressLine1?: string;
    AddressLine2?: string;
    Content?: string;
    LocationCityStateZip?: string;
    PatientName?: string;
}

export class CommunicationTemplateModel {
    CommunicationTemplateId?: number;
    DataTag?: string;
    DateModified?: string;
    GroupId?: number;
    MediaTypeId?: number;
    Note?: string;
    Reason?: number;
    TemplateName?: string;
    UserModified?: string;
}