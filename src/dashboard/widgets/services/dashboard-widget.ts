import { WidgetInitStatus } from "./dashboard-widget.service";

export enum WidgetCommon{
  PracticeAtAGlanceURL = "/BusinessCenter/PracticeAtAGlance",
  _hole_ = '_hole_'
}

export enum NetGrossProductionGauge {
    Gross = 'Gross',
    Net = 'Net',
    GrossProductionURL = "/widgets/financial/GrossProduction",
    NetProductionURL = "/widgets/financial/NetProduction",
    UserDashboardGrossProductionURL = "widgets/financial/UserDashboardGrossProduction",
    UserDashboardNetProductionURL = "widgets/financial/UserDashboardNetProduction",
    Value = "Value",
  }

export enum PendingClaims {
  PendingClaimsURL = "widgets/financial/PendingClaims",
  UserDashboardPendingClaimsURL = "widgets/financial/UserDashboardPendingClaims",
}

export enum InsuranceClaims {
  InsuranceClaimsURL = "widgets/financial/InsuranceClaims",
  UserDashboardInsuranceClaimsURL = "widgets/financial/UserDashboardInsuranceClaims",  
}

export class DashboardWidgetStatus {
    itemId?: number;
    loading?: WidgetInitStatus;
    errorMessage?: string;
    constructor(itemId: number, loading: WidgetInitStatus, errorMessage: string) {
        this.itemId = itemId;
        this.loading = loading;
        this.errorMessage = errorMessage;
    }
}

export enum ReceivablesWidget {
  ReceivablesUrl = "widgets/financial/Receivables",
  UserDashboardReceivablesUrl = "widgets/financial/UserDashboardReceivables",
  DisplayType_All = "0",
  DisplayType_Patient_Only = "1",
  DisplayType_Insurance_Only = "2"
}

export enum OpenClinicalNotes {
  OpenClinicalNotesUrl = "widgets/performance/OpenClinicalNotes",
  Active = "Active",
  PendingInactive = "Pending Inactive",
  Inactive = "Inactive"
}

export enum ScheduleUtilization {
  ScheduleUtilizationURL = "widgets/schedule/ScheduleUtilization",
  Booked = "Booked"
}

export enum AppointmentsWidget {
  AppointmentsUrl = "widgets/schedule/Appointments",
  ScheduleDate = "#/Schedule/?date="
}

export enum SimpleHalfDonut { 
  Scheduled = "scheduled",
  baseUrl = "#/BusinessCenter/Receivables/TotalReceivables/",
}
export enum DashboardWidgetTitle {
    Appointments =  'Appointments',
    GrossProduction =  'Gross Production',
    NetProduction = 'Net Production',
    OpenClinicalNotes =  'Open Clinical Notes',
    ScheduleUtilization =  'Schedule Utilization',
    InsuranceClaims = 'Insurance Claims',
    PendingClaims = 'Pending Claims',
    Receivables = 'Receivables',
    HygieneRetention =  'Hygiene Retention',
}

