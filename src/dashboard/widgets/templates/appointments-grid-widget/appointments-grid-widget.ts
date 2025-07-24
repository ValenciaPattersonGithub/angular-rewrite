import { AppointmentDetails } from "src/scheduling/common/models/appointment-details.model";

export class AllAppointments {
    appointment: AppointmentDetails;
    startTime: string
    endTime: string;
    providerId: string;
}

export class ProviderAppointments extends AllAppointments {
    alerts: {
        allergyAlerts: Array<AlertsDetails>;
        medicalAlerts: Array<AlertsDetails>;
        premedAlerts: Array<AlertsDetails>;
    };
    ObjectState?: string;//ToDo: Check while appoitment migration that this is working fine with all cases
}

export class AlertsDetails {
    MedicalHistoryAlertDescription: string;
    MedicalHistoryAlertTypeId: number;
    PatientId: string;
}

export class FilterOptions {
    text: string;
    value: string;
    isDisabled?: boolean;
    subCategory?: string
}

export enum AlertTypes {
    allergyAlerts = 1,
    medicalAlerts = 2,
    premedAlerts = 3
}

export enum GridSortField {
    startTime = 'startTime',
    Person = 'Person',
    ApptType = 'ApptType',
    Location = 'Location',
    Room = 'Room',
    Provider = 'Provider'
}