import { Appointment } from './appointment.model';
import { ProviderUser } from 'src/practices/common/models/provider-user.model';
import { Room } from 'src/practices/common/models/room.model';
import { Patient } from 'src/patient/common/models/patient.model';
import { Location } from 'src/practices/common/models/location.model';

export interface AppointmentDetails {
    Appointment:        Appointment;
    ContactInformation: any;
    Alerts:             any;
    Person:             Patient;
    ServiceCodes:       any[];
    Room:               Room;
    Location:           Location;
    AppointmentType:    any;
    ProviderUsers:      ProviderUser[];
    MedicalAlerts:      any;
    DataTag:            any;
    UserModified:       string;
    DateModified:       string;
}