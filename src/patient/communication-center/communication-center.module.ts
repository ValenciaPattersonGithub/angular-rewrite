import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationCenterComponent } from './communication-center.component';
import { CommunicationCenterFilterbarComponent } from './communication-center-filterbar/communication-center-filterbar.component';
import { CommunicationCenterTimelineComponent } from './communication-center-timeline/communication-center-timeline.component';
import { CommunicationCenterPreviewpaneComponent } from './communication-center-previewpane/communication-center-previewpane.component';
import { CommunicationCenterTitlebarComponent } from './communication-center-titlebar/communication-center-titlebar.component';
import { SharedModule } from 'src/@shared/shared.module';
import { CommunicationCenterAddrecordComponent } from './communication-center-addrecord/communication-center-addrecord.component';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { PatientCommunicationCenterService } from '../common/http-providers/patient-communication-center.service';
import { TranslateModule } from '@ngx-translate/core';
import { CommunicationCardComponent } from './communication-card/communication-card.component';
import { EnumAsStringPipe } from 'src/@shared/pipes/enumAsString/enum-as-string.pipe';
import { CommunicationPrintPreviewComponent } from './communication-print-preview/communication-print-preview.component';
import { CommunicationHoverMenuComponent } from './communication-hover-menu/communication-hover-menu.component';
import { CommunicationToDoComponent } from './communication-to-do/communication-to-do.component';
import { forwardRef } from '@angular/core';
import { CommunicationTodoCollapsibleSectionComponent } from './communication-todo-collapsible-section/communication-todo-collapsible-section.component';
import { CommunicationDrawerTabsComponent } from './communication-drawer-tabs/communication-drawer-tabs.component';
import { CommunicationConstants } from './communication-constants/communication.costants';
import { CommunicationGenerateLetterComponent } from './communication-generate-letter/communication-generate-letter.component';
import { CommunicationCenterHeaderComponent } from './communication-center-header/communication-center-header.component';
import { CommunicationPatientDrawerComponent } from './communication-patient-drawer/communication-patient-drawer.component';
import { GeneralInfoComponent } from './communication-patient-drawer/general-info/general-info.component';
import { AlertsFlagsComponent } from './communication-patient-drawer/alerts-flags/alerts-flags.component';
import { PatientContactComponent } from './communication-patient-drawer/patient-contact/patient-contact.component';
import { ProvidersLocationsComponent } from './communication-patient-drawer/providers-locations/providers-locations.component';
import { PatientFinancialComponent } from './communication-patient-drawer/patient-financial/patient-financial.component';
import { AccountMembersComponent } from './communication-patient-drawer/account-members/account-members.component';
import { AdditionalInfoComponent } from './communication-patient-drawer/additional-info/additional-info.component';
import { PatientInsuranceComponent } from './communication-patient-drawer/patient-insurance/patient-insurance.component';
import { SchedulingModule } from '../../scheduling/scheduling.module';

@NgModule({
    declarations: [
        CommunicationCenterComponent,
        CommunicationCenterFilterbarComponent,
        CommunicationCenterTimelineComponent,
        CommunicationCenterPreviewpaneComponent,
        CommunicationCenterTitlebarComponent,
        CommunicationCenterAddrecordComponent,
        CommunicationCardComponent,
        CommunicationPrintPreviewComponent,
        CommunicationHoverMenuComponent,
        CommunicationToDoComponent,
        CommunicationTodoCollapsibleSectionComponent,
        CommunicationDrawerTabsComponent,
        CommunicationGenerateLetterComponent,
        CommunicationCenterHeaderComponent,
        CommunicationPatientDrawerComponent,
        GeneralInfoComponent,
        AlertsFlagsComponent,
        PatientContactComponent,
        ProvidersLocationsComponent,
        AccountMembersComponent,
        AdditionalInfoComponent,
        PatientFinancialComponent,
        AccountMembersComponent,
        PatientInsuranceComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        AppKendoUIModule,
        TranslateModule,
        SchedulingModule
    ],
    entryComponents: [
        CommunicationCenterComponent,
        CommunicationDrawerTabsComponent,
        CommunicationPrintPreviewComponent,
        CommunicationHoverMenuComponent,
        CommunicationToDoComponent,
        CommunicationCenterHeaderComponent
    ],
    providers: [
        PatientCommunicationCenterService,
        EnumAsStringPipe,
        CommunicationConstants,
        { provide: 'referenceDataService', useFactory: ($injector: any) => $injector.get('referenceDataService'), deps: ['$injector'] },
        { provide: 'tabLauncher', useFactory: ($injector: any) => $injector.get('tabLauncher'), deps: ['$injector'] },
        { provide: 'TimeZoneFactory', useFactory: ($injector: any) => $injector.get('TimeZoneFactory'), deps: ['$injector'] },
        { provide: 'ModalDataFactory', useFactory: ($injector: any) => $injector.get('ModalDataFactory'), deps: ['$injector'] },
        { provide: 'ModalFactory', useFactory: ($injector: any) => $injector.get('ModalFactory'), deps: ['$injector'] },
        { provide: 'PatientValidationFactory', useFactory: ($injector: any) => $injector.get('PatientValidationFactory'), deps: ['$injector'] },
        { provide: 'ListHelper', useFactory: ($injector: any) => $injector.get('ListHelper'), deps: ['$injector'] },
        { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => CommunicationToDoComponent) },
        { provide: 'ScheduleServices', useFactory: ($injector: any) => $injector.get('ScheduleServices'), deps: ['$injector'] },
        { provide: 'AppointmentViewVisibleService', useFactory: ($injector: any) => $injector.get('AppointmentViewVisibleService'), deps: ['$injector'] },
        { provide: 'AppointmentViewDataLoadingService', useFactory: ($injector: any) => $injector.get('AppointmentViewDataLoadingService'), deps: ['$injector'] },
    ],
    exports: [CommunicationHoverMenuComponent, CommunicationCenterHeaderComponent],
})
export class CommunicationCenterModule { }
