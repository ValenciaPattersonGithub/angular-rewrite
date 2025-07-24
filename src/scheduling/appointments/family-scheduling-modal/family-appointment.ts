import { DurationItem } from '../../appointment-duration';

export interface FamilyAppointment {
    IsChecked: boolean;
    IsResponsiblePerson: boolean;
    PatientId: string;
    FirstName: string;
    LastName: string;
    DateOfBirth: string;
    PreferredLocation: string;
    PreferredProvider: string;
    PreferredHygienist: string;
    NextPreventiveDue: string;
    NextPreventiveScheduled: string;
    Locations: any[];
    SelectedLocation: string;
    Providers: any[];
    SelectedProvider: string;
    SelectedAppointmentTypeId: string;
    SelectedAppointmentType: any; // complex object .. make change for duration
    SelectedDuration: DurationItem;
    ShowLocationError: boolean;
    LocationError: string;
    ShowDurationError: boolean;
    DurationError: string;
}