export interface PatientLocation {
    PatientLocationId: number;
    PatientId:         string;
    LocationId:        number;
    IsPrimary:         boolean;
    PatientActivity:   boolean;
    //have to check this type 
    ObjectState:       string;
    FailedMessage:     string;
    LocationName?:      string;
    DataTag:           string;
    UserModified:      string;
    DateModified:      string;
    DeactivationTimeUtc: string;
    NameLine1:         string;
    LocationStatus:    string;
    GroupOrder:        number;
    Timezone:          string;   
    Value :            Array<PatientLocation>;
};

export interface PatientCurrentLocation {
    id:                 number,
    name:               string,
    practiceid:         number,
    merchantid:         string,
    description:        string,
    timezone:           string,
    deactivationTimeUtc: string,
    status:             string,
    sort: 1
}

export interface PatientLocationType {
    DeactivationTimeUtc: string | null;
    NameLine1: string;
    LocationStatus?: string;
    GroupOrder?: number;
    SortingIndex?: number;
}

export interface ExportCSV {
    CsvRows: string[];
}

export enum BadgeAccessType {
    Appointments =      '1',
    AllPatients  =      '2',
    PreventiveCare =    '3',
    TreatmentPlans =    '4',
    otherToDo =         '5',
}

export enum BadgeFilterType {
    Appointments =      1,
    AllPatients  =      2,
    PreventiveCare =    7,
    TreatmentPlans =    6,
    otherToDo =         5,
}

export enum DocumentTitles {
    AllPatients = 'Pt Mgmt - All Pts',
    Appointments = 'Pt Mgmt - Appointments',
    PreventiveCare = 'Preventive Care',
    TreatmentPlans = 'Treatment Plans',
    OtherToDo = 'Pt Mgmt - Other'
}