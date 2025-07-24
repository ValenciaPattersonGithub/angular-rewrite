import { PatientFlags } from "./patient-overview.model";

export interface MedicalHistoryAlert {
    PatientId:                      string;
    MedicalHistoryAlertDescription: string;
    MedicalHistoryAlertTypeId:      number;
}