import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { DashboardComponent } from './dashboard-component/dashboard.component';
import { WidgetbarComponent } from './widgets/bar-chart-widget/bar-chart-widget.component';
import { DashboardWidgetService } from './widgets/services/dashboard-widget.service';
import { TranslateModule } from '@ngx-translate/core';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
import { SharedModule } from 'src/@shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import 'hammerjs';
import { SelectOptionsComponent } from './widgets/select-options/select-options.component';
import { BarSolidAreaComponent } from './widgets/bar-solid-area/bar-solid-area.component';
import { OpenERAsWidgetComponent } from './widgets/open-eras-widget/open-eras-widget.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { NetGrossProductionGaugeWidgetComponent } from './widgets/templates/net-gross-production-gauge-widget/net-gross-production-gauge-widget.component';
import { GridsterModule } from 'angular-gridster2';
import { OpenClinicalNotesWidgetComponent } from './widgets/templates/open-clinical-notes-widget/open-clinical-notes-widget.component';
import { ProviderSelectorComponent } from 'src/@shared/components/provider-selector/provider-selector.component';
import { PendingClaimsHalfDonutWidgetComponent } from './widgets/templates/pending-claims-half-donut-widget/pending-claims-half-donut-widget.component';
import { InsuranceClaimsHalfDonutWidgetComponent } from './widgets/templates/insurance-claims-half-donut-widget/insurance-claims-half-donut-widget.component';
import { ReceivablesHalfDonutWidgetComponent } from './widgets/templates/receivables-half-donut-widget/receivables-half-donut-widget.component';
import { ScheduleUtilizationGaugeWidgetComponent } from './widgets/templates/schedule-utilization-gauge-widget/schedule-utilization-gauge-widget.component';
import { HygieneRetentionHalfDonutWidgetComponent } from './widgets/templates/hygiene-retention-half-donut-widget/hygiene-retention-half-donut-widget.component';
import { AppointmentsGridWidgetComponent } from './widgets/templates/appointments-grid-widget/appointments-grid-widget.component';

@NgModule({
    declarations: [DashboardComponent, WidgetbarComponent, SelectOptionsComponent, BarSolidAreaComponent, OpenERAsWidgetComponent, UserDashboardComponent, NetGrossProductionGaugeWidgetComponent, OpenClinicalNotesWidgetComponent, InsuranceClaimsHalfDonutWidgetComponent, PendingClaimsHalfDonutWidgetComponent, ReceivablesHalfDonutWidgetComponent, ScheduleUtilizationGaugeWidgetComponent, HygieneRetentionHalfDonutWidgetComponent, AppointmentsGridWidgetComponent],
  entryComponents: [DashboardComponent, WidgetbarComponent, OpenERAsWidgetComponent, UserDashboardComponent, NetGrossProductionGaugeWidgetComponent, OpenClinicalNotesWidgetComponent, InsuranceClaimsHalfDonutWidgetComponent, PendingClaimsHalfDonutWidgetComponent,
      ReceivablesHalfDonutWidgetComponent, ScheduleUtilizationGaugeWidgetComponent, HygieneRetentionHalfDonutWidgetComponent,AppointmentsGridWidgetComponent],
  providers: [
    DashboardWidgetService,
    { provide: 'SoarConfig', useFactory: ($injector: any) => $injector.get('SoarConfig'), deps: ['$injector'] },
    { provide: 'referenceDataService', useFactory: ($injector: any) => $injector.get('referenceDataService'), deps: ['$injector'] },
    { provide: 'referenceDataService', useFactory: ($injector: any) => $injector.get('referenceDataService'), deps: ['$injector'] },
    { provide: 'toastrFactory', useFactory: ($injector: any) => $injector.get('toastrFactory'), deps: ['$injector'] },
    { provide: 'localize', useFactory: ($injector: any) => $injector.get('localize'), deps: ['$injector'] },
    { provide: 'DashboardService', useFactory: ($injector: any) => $injector.get('DashboardService'), deps: ['$injector'] },
    { provide: 'UserServices', useFactory: ($injector: any) => $injector.get('UserServices'), deps: ['$injector'] },
    { provide: 'LocationServices', useFactory: ($injector: any) => $injector.get('LocationServices'), deps: ['$injector'] },
    { provide: 'WidgetInitStatus', useFactory: ($injector: any) => $injector.get('WidgetInitStatus'), deps: ['$injector'] },
    { provide: 'WidgetFactory', useFactory: ($injector: any) => $injector.get('WidgetFactory'), deps: ['$injector'] },
    { provide: 'ReportsFactory', useFactory: ($injector: any) => $injector.get('ReportsFactory'), deps: ['$injector'] },
    { provide: '$location', useFactory: ($injector: any) => $injector.get('$location'), deps: ['$injector'] },
    { provide: 'AppointmentViewVisibleService', useFactory: ($injector: any) => $injector.get('AppointmentViewVisibleService'), deps: ['$injector'] },
    { provide: 'AppointmentViewLoadingService', useFactory: ($injector: any) => $injector.get('AppointmentViewLoadingService'), deps: ['$injector'] },
    { provide: '$q', useFactory: ($injector: any) => $injector.get('$q'), deps: ['$injector'] }
  ],
  imports: [
    ChartsModule,
    CommonModule,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    AppKendoUIModule,
    TooltipModule,
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    GridsterModule
  ]
})
export class DashboardModule { }
