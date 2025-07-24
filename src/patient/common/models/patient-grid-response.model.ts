import { FormArray, FormControl } from "@angular/forms";
import { PatientContactInfo } from "./patient-contact-info.model";
import { AllPatientGridFilter, AppointmentGridFilter, OtherToDoGridFilter, PreventiveCareGridFilter, TreatmentPlansGridFilter } from "./patient-grid-filter.model";
import { AppointmentGridSort, OtherToDoGridSort, AllPatientGridSort, PreventiveGridSort, TreatmentGridSort } from "./patient-grid-sort.model";
import { AllPatientDetails, PatientAppointmentDetails, PatientOtherToDoDetails, PatientPreventiveCareDetails, PatientTreatmentPlansDetails } from "./patient.model";

// Patient Grid Base Class
export class PatientGridBase {
    CurrentPage?: number;
    PageCount?: number;
    TotalCount?: number;
}

// Generic class for Key/Value pairs
export class KeyValuePair<TKey, TVal> {
    Key?: TKey;
    Value?: TVal;
}

// Performace Counter
export class PerformanceCounter {
    ServiceTotalTime?: number;
    DtoMappingTotalTime?: number;
    FilterOptionsTotalTime?: number;
    PopulateRowsTotalTime?: number;
}

// Patient Management Count
export class PatientManagementCount {
    AllPatientsCount?: number;
    PreventiveCareCount?: number;
    TreatmentPlansCount?: number;
    AppointmentsCount?: number;
    MiscellaneousCount?: number;
    OtherToDoCount?: number;
    isActiveFltrTab?: number;
    isDiabled?: boolean;
    countKey?: string;
    headerId?: string;
    buttonId?: string;
    label?: string;
    iconClass?: string;
}

export class CountUpdate {
    allPatients?: number;
    preventiveCare?: number;
    treatmentPlans?: number;
    appointments?: number;
    otherToDo?: number;
    loading?: boolean;
}

// All Patients Grid Display
export class AllPatient extends PatientGridBase {
    PreferredLocation?: KeyValuePair<number, string>[];
    PreferredDentists?: KeyValuePair<string, string>[];
    PreferredHygienists?: KeyValuePair<string, string>[];
    PatientLocationZipCodes?: KeyValuePair<string, string>[];
    AdditionalIdentifiers?: KeyValuePair<string, string>[];
    GroupTypes?: KeyValuePair<string, string>[];
    PerformanceCounter?: PerformanceCounter;
    Rows?: AllPatientDetails[];
    FilterCriteria?: AllPatientGridFilter;
    SortCriteria?: AllPatientGridSort;
}

// Preventive care Grid Display
export class PreventiveCare extends PatientGridBase {
    PreferredLocation?: KeyValuePair<number, string>[];
    PreferredDentists?: KeyValuePair<string, string>[];
    PreferredHygienists?: KeyValuePair<string, string>[];
    GroupTypes?: KeyValuePair<string, string>[];
    PerformanceCounter?: PerformanceCounter;
    Rows?: PatientPreventiveCareDetails[];
    FilterCriteria?: PreventiveCareGridFilter;
    SortCriteria?: PreventiveGridSort;
}

// Treatment plans Grid Display
export class TreatmentPlans extends PatientGridBase {
    PreferredLocation?: KeyValuePair<number, string>[];
    PreferredDentists?: KeyValuePair<string, string>[];
    PreferredHygienists?: KeyValuePair<string, string>[];
    PatientLocationZipCodes?: KeyValuePair<string, string>[];
    TreatmentProviders?: KeyValuePair<string, string>[];
    AdditionalIdentifiers?: KeyValuePair<string, string>[];
    GroupTypes?: KeyValuePair<string, string>[];
    PerformanceCounter?: PerformanceCounter;
    Rows?: PatientTreatmentPlansDetails[];
    FilterCriteria?: TreatmentPlansGridFilter;
    SortCriteria?: TreatmentGridSort;
}

// Appointment Grid Display
export class Appointment extends PatientGridBase {
    PreferredDentists?: KeyValuePair<string, string>[];
    PreferredHygienists?: KeyValuePair<string, string>[];
    GroupTypes?: KeyValuePair<string, string>[];
    AdditionalIdentifiers?: KeyValuePair<string, string>[];
    AppointmentStatusOptions?: KeyValuePair<number, string>[];
    AppointmentTypes?: KeyValuePair<string, string>[];
    Providers?: KeyValuePair<string, string>[];
    Rooms?: KeyValuePair<string, string>[];
    Rows?: PatientAppointmentDetails[];
    FilterCriteria?: AppointmentGridFilter;
    SortCriteria?: AppointmentGridSort;
}

// OtherToDo Grid Display
export class OtherToDo extends PatientGridBase {
    PreferredLocation?: KeyValuePair<number, string>[];
    PreferredDentists?: KeyValuePair<string, string>[];
    PreferredHygienists?: KeyValuePair<string, string>[];
    PatientLocationZipCodes?: KeyValuePair<string, string>[];
    Providers?: KeyValuePair<string, string>[];
    GroupTypes?: KeyValuePair<string, string>[];
    Rows?: PatientOtherToDoDetails[];
    FilterCriteria?: OtherToDoGridFilter;
    SortCriteria?: OtherToDoGridSort;
}

//############## Export to CSV ##############
export class AllPatientGridToCSV {
    grid?: AllPatient;
    contactInfo?: PatientContactInfo;
}

export class PreventiveCareGridToCSV {
    grid?: PreventiveCare;
    contactInfo?: PatientContactInfo;
}

export class TreatmentPlansGridToCSV {
    grid?: TreatmentPlans;
    contactInfo?: PatientContactInfo;
}

export class AppointmentGridToCSV {
    grid?: Appointment;
    contactInfo?: PatientContactInfo;
}

export class OtherToDoGridToCSV {
    grid?: OtherToDo;
    contactInfo?: PatientContactInfo;
}

export class PatientTabFilter {
    filterText: string;
    dataTarget: string;
    divClassId: string;
    divUlId: string;
    liFormArrayName: string;
    formControls: FormControl;
    formArray: FormArray;
    filter: PatientFliterCategory<string>[];  
    isExpanded?: boolean = false; 
}

export class PatientFliterCategory<key> {
    field: string;
    value: string;
    key: key;
    isVisible?: boolean;
    isSelected?: boolean
}