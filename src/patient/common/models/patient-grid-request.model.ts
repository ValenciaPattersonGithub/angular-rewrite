import { AllPatientGridFilter, AppointmentGridFilter, OtherToDoGridFilter, PreventiveCareGridFilter, TreatmentPlansGridFilter } from "./patient-grid-filter.model";
import { AppointmentGridSort, OtherToDoGridSort, AllPatientGridSort, PreventiveGridSort, TreatmentGridSort } from "./patient-grid-sort.model";

export class PatientRequestBase {
    PageCount?: number;
    CurrentPage?: number;    
    TotalCount?: number;
}

export class AllPatientRequest extends PatientRequestBase {
    FilterCriteria?: AllPatientGridFilter;
    SortCriteria?: AllPatientGridSort;
}

export class PreventiveCareRequest extends PatientRequestBase {
    FilterCriteria?: PreventiveCareGridFilter;
    SortCriteria?: PreventiveGridSort;
}

export class TreatmentPlansRequest extends PatientRequestBase {
    FilterCriteria?: TreatmentPlansGridFilter;
    SortCriteria?: TreatmentGridSort;
}

export class AppointmentRequest extends PatientRequestBase {
    FilterCriteria?: AppointmentGridFilter;
    SortCriteria?: AppointmentGridSort;
}

export class OtherToDoRequest extends PatientRequestBase {
    FilterCriteria?: OtherToDoGridFilter;
    SortCriteria?: OtherToDoGridSort;
}

export class AllBadgesFilterCriteria {
    allPatients?: AllPatientRequest;
    preventiveCare?: PreventiveCareRequest;
    tratmentPlans?: TreatmentPlansRequest;
    appointments?: AppointmentRequest;
    otherToDo?: OtherToDoRequest;
}
