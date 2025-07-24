import { Injectable } from "@angular/core";

export class UserSetting {
    userId: string;
    scheduleColumnOrder: string;
    defaultProviderColumnCount: number;
    defaultRoomColumnCount: number;
    defaultHourColumnCount: number;
    defaultScheduleViewType: number;
    printInvoice: boolean;
    isScheduleInPrivacyMode: boolean;
    roomViewAppointmentColorType: string;

    enableNewTreatmentPlanFeatures: boolean;
    enableNewClinicalNavigation: boolean;
    enableNewAppointmentPage: boolean;
    enableAppointmentDrawer: boolean;
}
