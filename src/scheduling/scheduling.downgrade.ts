import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { AppointmentDurationService } from './appointment-duration';
import { AppointmentDurationDropdownComponent } from './appointment-duration/appointment-duration-dropdown/appointment-duration-dropdown.component';
import { AppointmentStatusHandlingService, AppointmentStatusService } from './appointment-statuses';
import { AppointmentStatusCardDropdownComponent } from './appointment-statuses/appointment-status-card-dropdown/appointment-status-card-dropdown.component';
import { AppointmentStatusHoverComponent } from './appointment-statuses/appointment-status-hover/appointment-status-hover.component';
import { AppointmentStatusSelectorComponent } from './appointment-statuses/appointment-status-selector/appointment-status-selector.component';
import { AppointmentTypesService } from './appointment-types';
import { AppointmentTypesDropdownComponent } from './appointment-types/appointment-types-dropdown/appointment-types-dropdown.component';
import { AppointmentViewServicesComponent } from './appointments/appointment-view/appointment-view-services/appointment-view-services.component';
import { AppointmentViewComponent } from './appointments/appointment-view/appointment-view.component';
import { BlockAppointmentViewComponent } from './appointments/block-appointment-view/block-appointment-view.component';
import { FamilySchedulingModalComponent } from './appointments/family-scheduling-modal/family-scheduling-modal.component';
import { MiniAppointmentViewComponent } from './appointments/mini-appointment-view/mini-appointment-view.component';
import { PinnedAppointmentCardComponent } from './appointments/pinned-appointment-card/pinned-appointment-card.component';
import { ScheduleAppointmentCardComponent } from './appointments/schedule-appointment-card/schedule-appointment-card.component';
import { ProviderHourOccurrencesHttpService, ScheduleAppointmentHttpService } from './common/http-providers';
import {
  AppointmentModalProvidersService,
  AppointmentServiceProcessingRulesService,
  AppointmentTimeService,
  ColorUtilitiesService,
  ScheduleAppointmentUtilitiesService,
  ScheduleDisplayPatientService,
  ScheduleDisplayPlannedServicesService,
  ScheduleProvidersService,
} from './common/providers';
import {
  AppointmentStorageService,
  AppointmentViewLoadingService,
  PinnedAppointmentsService,
  ScheduleDisplayService,
  UnscheduledAppointmentsService,
  HolidaysService
} from './providers';
import { AppointmentViewValidationNewService } from './providers/appointment-view-validation-new.service';
import { LocationDropdownService } from './providers/location-dropdown.service';
import { ProviderOnScheduleDropdownService } from './providers/provider-on-schedule-dropdown.service';
import { RoomDropdownService } from './providers/room-dropdown.service';
import { LocationDropdownComponent } from './scheduler-controller-dropdowns/location-dropdown.component';
import { ProviderOnScheduleDropdownComponent } from './scheduler-controller-dropdowns/provider-on-schedule-dropdown.component';
import { RoomDropdownComponent } from './scheduler-controller-dropdowns/room-dropdown.component';
import { AppointmentServiceTransactionsService } from './service-transactions/appointment-service-transactions.service';
import { SchedulingMFENavigator } from './common/scheduling-mfe-navigator';

declare var angular: angular.IAngularStatic;

export function SchedulingDowngrade() {
  angular
    .module('Soar.Main')
    .factory('AppointmentDurationService', downgradeInjectable(AppointmentDurationService))
    .directive('appointmentDurationDropdown', downgradeComponent({ component: AppointmentDurationDropdownComponent }))
    .factory('AppointmentStatusHandlingService', downgradeInjectable(AppointmentStatusHandlingService))
    .factory('AppointmentStatusService', downgradeInjectable(AppointmentStatusService))
    .directive('appointmentStatusCardDropdown', downgradeComponent({ component: AppointmentStatusCardDropdownComponent }))
    .directive(
      'appointmentStatusHover',
      downgradeComponent({
        component: AppointmentStatusHoverComponent,
        inputs: ['statusListModel', 'appointment', 'isClickable'],
        outputs: ['updateAppointmentStatus'],
      })
    )
    .directive(
      'downgradedAppointmentStatusSelector',
      downgradeComponent({
        component: AppointmentStatusSelectorComponent,
        inputs: ['statusListModel', 'appointment', 'disableStatusDropdown'],
        outputs: ['appointmentStatusChanged', 'setDisableStatusDropdown'],
      })
    )
    .factory('schedulingMFENavigator', downgradeInjectable(SchedulingMFENavigator))
    .factory('NewAppointmentTypesService', downgradeInjectable(AppointmentTypesService))
    .directive('appointmentTypesDropdown', downgradeComponent({ component: AppointmentTypesDropdownComponent }))
    .directive('newAppointmentView', downgradeComponent({ component: AppointmentViewComponent }))
    .directive('appointmentViewServices', downgradeComponent({ component: AppointmentViewServicesComponent }))
    .directive('blockAppointmentView', downgradeComponent({ component: BlockAppointmentViewComponent }))
    .directive('familySchedulingModal', downgradeComponent({ component: FamilySchedulingModalComponent }))
    .directive('miniAppointmentView', downgradeComponent({ component: MiniAppointmentViewComponent }))
    .directive('pinnedAppointmentCard', downgradeComponent({ component: PinnedAppointmentCardComponent }))
    .directive('scheduleAppointmentCard', downgradeComponent({ component: ScheduleAppointmentCardComponent }))
    .factory('ProviderHourOccurrencesHttpService', downgradeInjectable(ProviderHourOccurrencesHttpService))
    .factory('ScheduleAppointmentHttpService', downgradeInjectable(ScheduleAppointmentHttpService))
    .factory('AppointmentModalProvidersService', downgradeInjectable(AppointmentModalProvidersService))
    .factory('AppointmentServiceProcessingRulesService', downgradeInjectable(AppointmentServiceProcessingRulesService))
    .factory('AppointmentTimeService', downgradeInjectable(AppointmentTimeService))
    .factory('ColorUtilitiesService', downgradeInjectable(ColorUtilitiesService))
    .factory('NewScheduleAppointmentUtilitiesService', downgradeInjectable(ScheduleAppointmentUtilitiesService))
    .factory('ScheduleDisplayPatientService', downgradeInjectable(ScheduleDisplayPatientService))
    .factory('ScheduleDisplayPlannedServicesService', downgradeInjectable(ScheduleDisplayPlannedServicesService))
    .factory('ScheduleProvidersService', downgradeInjectable(ScheduleProvidersService))
    .factory('AppointmentStorageService', downgradeInjectable(AppointmentStorageService))
    .factory('AppointmentViewLoadingService', downgradeInjectable(AppointmentViewLoadingService))
    .factory('AppointmentViewValidationNewService', downgradeInjectable(AppointmentViewValidationNewService))
    .factory('LocationDropdownService', downgradeInjectable(LocationDropdownService))
    .factory('PinnedAppointmentsService', downgradeInjectable(PinnedAppointmentsService))
    .factory('ProviderOnScheduleDropdownService', downgradeInjectable(ProviderOnScheduleDropdownService))
    .factory('RoomDropdownService', downgradeInjectable(RoomDropdownService))
    .factory('ScheduleDisplayService', downgradeInjectable(ScheduleDisplayService))
    .factory('UnscheduledAppointmentsService', downgradeInjectable(UnscheduledAppointmentsService))
    .factory('HolidaysService', downgradeInjectable(HolidaysService))
    .directive(
      'downgradedLocationDropdownComponent',
      downgradeComponent({
        component: LocationDropdownComponent,
        inputs: ['list', 'globalSelectedLocation', 'currentScheduleView'],
        outputs: ['shareCheckedList'],
      })
    )
    .directive(
      'downgradedProviderOnScheduleDropdownComponent',
      downgradeComponent({
        component: ProviderOnScheduleDropdownComponent,
        inputs: ['reorderColumnsChanged', 'currentScheduleView', 'globalSelectedLocation'],
        outputs: ['shareCheckedList', 'locationDropdownLoaded'],
      })
    )
    .directive(
      'downgradedRoomDropdownComponent',
      downgradeComponent({
        component: RoomDropdownComponent,
        inputs: ['reorderColumnsChanged', 'currentScheduleView', 'globalSelectedLocation'],
        outputs: ['shareCheckedList', 'locationDropdownLoaded'],
      })
    )
    .factory('AppointmentServiceTransactionsService', downgradeInjectable(AppointmentServiceTransactionsService));
}
