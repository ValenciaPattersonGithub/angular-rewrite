export interface AppointmentData {
  id: string;
  locationId: string;
  appointmentTypeId?: string;
  patientId?: string;
  serviceTransactionIds?: string[];
}
