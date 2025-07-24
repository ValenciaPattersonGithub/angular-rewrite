import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { UpgradeModule } from '@angular/upgrade/static';

import { A11yModule } from '@angular/cdk/a11y';
import { OverlayModule } from '@angular/cdk/overlay';
import { PortalModule } from '@angular/cdk/portal';

import { SharedModule } from '../@shared/shared.module';

// try to keep this organized by file location and in A - Z order please
// this make it easier to find items in the list
// and they display this way in the file system so why not repeat that idea.

import { ProviderHourOccurrencesHttpService } from './common/http-providers';
import { ScheduleAppointmentHttpService } from './common/http-providers';

import { AppointmentModalProvidersService } from './common/providers';
import { AppointmentServiceProcessingRulesService } from './common/providers';
import { AppointmentTimeService } from './common/providers';
import { ColorUtilitiesService } from './common/providers';
import { ScheduleAppointmentUtilitiesService } from './common/providers';
import { ScheduleDisplayPatientService } from './common/providers';
import { ScheduleDisplayPlannedServicesService } from './common/providers';
import { ScheduleProvidersService } from './common/providers';

import { AppointmentStorageService, HolidaysService } from './providers';
import { AppointmentViewLoadingService } from './providers';
import { PinnedAppointmentsService } from './providers';
import { ScheduleDisplayService } from './providers';
import { UnscheduledAppointmentsService } from './providers';

import { AppointmentStatusDataService } from './appointment-statuses';
import { AppointmentStatusHandlingService } from './appointment-statuses';
import { AppointmentStatusService } from './appointment-statuses';
import { AppointmentTypesService } from './appointment-types';
import { AppointmentDurationService } from './appointment-duration/appointment-duration.service';
import { AppointmentServiceTransactionsService } from './service-transactions/appointment-service-transactions.service';

import { AppointmentStatusCardDropdownComponent } from './appointment-statuses/appointment-status-card-dropdown/appointment-status-card-dropdown.component';
import { AppointmentStatusSelectorComponent } from './appointment-statuses/appointment-status-selector/appointment-status-selector.component';
import { AppointmentStatusHoverComponent } from './appointment-statuses/appointment-status-hover/appointment-status-hover.component';

import { AppointmentDurationDropdownComponent } from './appointment-duration/appointment-duration-dropdown/appointment-duration-dropdown.component';
import { AppointmentTypesDropdownComponent } from './appointment-types/appointment-types-dropdown/appointment-types-dropdown.component';

import { AppointmentViewComponent } from 'src/scheduling/appointments/appointment-view/appointment-view.component';
import { AppointmentViewServicesComponent } from 'src/scheduling/appointments/appointment-view/appointment-view-services/appointment-view-services.component';
import { BlockAppointmentViewComponent } from 'src/scheduling/appointments/block-appointment-view/block-appointment-view.component';
import { CommunicationAppointmentsComponent } from 'src/scheduling/appointments/communication-appointments/communication-appointments.component';
import { DrawerAppointmentCardsComponent } from 'src/scheduling/appointments/communication-appointments/drawer-appointment-cards/drawer-appointment-cards.component';
import { FamilySchedulingModalComponent } from 'src/scheduling/appointments/family-scheduling-modal/family-scheduling-modal.component';
import { MiniAppointmentViewComponent } from 'src/scheduling/appointments/mini-appointment-view/mini-appointment-view.component';
import { PinnedAppointmentCardComponent } from 'src/scheduling/appointments/pinned-appointment-card/pinned-appointment-card.component';
import { ScheduleAppointmentCardComponent } from 'src/scheduling/appointments/schedule-appointment-card/schedule-appointment-card.component';
import { FamilySchedulingSearchComponent } from './appointments/family-scheduling-modal/family-scheduling-search/family-scheduling-search.component';
import { FamilySchedulingModalServiceService } from './appointments/family-scheduling-modal/family-scheduling-modal-service.service';
import { AppointmentViewValidationNewService } from '../scheduling/providers/appointment-view-validation-new.service';

import { RoomDropdownComponent } from '../scheduling/scheduler-controller-dropdowns/room-dropdown.component';
import { RoomDropdownService } from '../scheduling/providers/room-dropdown.service';
import { ProviderOnScheduleDropdownComponent } from '../scheduling/scheduler-controller-dropdowns/provider-on-schedule-dropdown.component';
import { ProviderOnScheduleDropdownService } from '../scheduling/providers/provider-on-schedule-dropdown.service';

import { LocationDropdownComponent } from '../scheduling/scheduler-controller-dropdowns/location-dropdown.component';
import { LocationDropdownService } from '../scheduling/providers/location-dropdown.service';
import { ProviderAppointmentValidationService } from '../scheduling/common/providers/provider-appointment-validation.service';
import { SchedulingMFENavigator } from './common/scheduling-mfe-navigator';

@NgModule({
  declarations: [
    AppointmentStatusCardDropdownComponent,
    AppointmentStatusSelectorComponent,
    AppointmentStatusHoverComponent,
    AppointmentTypesDropdownComponent,
    AppointmentDurationDropdownComponent,
    AppointmentViewComponent,
    AppointmentViewServicesComponent,
    BlockAppointmentViewComponent,
    CommunicationAppointmentsComponent,
    DrawerAppointmentCardsComponent,
    FamilySchedulingModalComponent,
    MiniAppointmentViewComponent,
    PinnedAppointmentCardComponent,
    ScheduleAppointmentCardComponent,
    FamilySchedulingSearchComponent,
    RoomDropdownComponent,
    ProviderOnScheduleDropdownComponent,
    LocationDropdownComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    // We must import `UpgradeModule` to get access to the AngularJS core services
    UpgradeModule,
    A11yModule,
    OverlayModule,
    PortalModule,
  ],
  exports: [
    AppointmentStatusCardDropdownComponent,
    AppointmentStatusSelectorComponent,
    AppointmentStatusHoverComponent,
    AppointmentTypesDropdownComponent,
    AppointmentViewComponent,
    AppointmentViewServicesComponent,
    BlockAppointmentViewComponent,
    CommunicationAppointmentsComponent,
    DrawerAppointmentCardsComponent,
    FamilySchedulingModalComponent,
    MiniAppointmentViewComponent,
    PinnedAppointmentCardComponent,
    ScheduleAppointmentCardComponent,
    RoomDropdownComponent,
    ProviderOnScheduleDropdownComponent,
    LocationDropdownComponent,
  ],
  providers: [
    ProviderHourOccurrencesHttpService,
    SchedulingMFENavigator,
    ScheduleAppointmentHttpService,
    AppointmentModalProvidersService,
    AppointmentServiceProcessingRulesService,
    AppointmentStatusDataService,
    AppointmentStatusService,
    AppointmentStatusHandlingService,
    AppointmentTimeService,
    AppointmentTypesService,
    AppointmentDurationService,
    AppointmentServiceTransactionsService,
    AppointmentViewLoadingService,
    ColorUtilitiesService,
    ScheduleAppointmentUtilitiesService,
    ScheduleDisplayPatientService,
    ScheduleDisplayPlannedServicesService,
    ScheduleProvidersService,
    AppointmentStorageService,
    PinnedAppointmentsService,
    ScheduleDisplayService,
    UnscheduledAppointmentsService,
    HolidaysService,
    FamilySchedulingModalServiceService,
    {
      provide: 'ClipboardAppointmentUpdateService',
      useFactory: ($injector: any) =>
        $injector.get('ClipboardAppointmentUpdateService'),
      deps: ['$injector'],
    },
    AppointmentViewValidationNewService,
    RoomDropdownService,
    ProviderOnScheduleDropdownService,
    LocationDropdownService,
    {
      provide: 'userSettingsDataService',
      useFactory: ($injector: any) => $injector.get('userSettingsDataService'),
      deps: ['$injector'],
      },
      ProviderAppointmentValidationService,
  ],
  //All components that are to be "downgraded" must be declared as `entryComponents`
  entryComponents: [
    AppointmentStatusCardDropdownComponent,
    AppointmentStatusSelectorComponent,
    AppointmentStatusHoverComponent,
    AppointmentTypesDropdownComponent,
    AppointmentDurationDropdownComponent,
    AppointmentViewComponent,
    AppointmentViewServicesComponent,
    BlockAppointmentViewComponent,
    CommunicationAppointmentsComponent,
    DrawerAppointmentCardsComponent,
    FamilySchedulingModalComponent,
    MiniAppointmentViewComponent,
    PinnedAppointmentCardComponent,
    ScheduleAppointmentCardComponent,
    RoomDropdownComponent,
    ProviderOnScheduleDropdownComponent,
    LocationDropdownComponent,
  ],
})
export class SchedulingModule {
  constructor(public upgrade: UpgradeModule) {}
}
