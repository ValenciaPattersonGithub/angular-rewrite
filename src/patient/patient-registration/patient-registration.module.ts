import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RegistrationLandingComponent } from "./registration-landing/registration-landing.component";
import { RegistrationHeaderComponent } from "./registration-header/registration-header.component";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "src/@shared/shared.module";
import { TableOfContentComponent } from "./table-of-content/table-of-content.component";
import { AppKendoUIModule } from "src/app-kendo-ui/app-kendo-ui.module";
import { PatientRegistrationService } from "../common/http-providers/patient-registration.service";
import { PersonalDetailsComponent } from "./personal-details/personal-details.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ContactDetailsComponent } from "./contact-details/contact-details.component";
import { PatientAccountModule } from "../patient-account/patient-account.module";
import { InsuranceDetailsComponent } from "./insurance-details/insurance-details.component";
import { PreferencesComponent } from "./preferences/preferences.component";
import { DentalRecordsComponent } from "./dental-records/dental-records.component";
import { ReferralsComponent } from "./referrals/referrals.component";
import { AdditionalIdentifiersComponent } from "./additional-identifiers/additional-identifiers.component";
import { PatientSharedModule } from "../patient-shared/patient-shared.module";
import { OverlayModule } from "@angular/cdk/overlay";
import { AgePipe } from "src/@shared/pipes/age/age.pipe";
import { PatientFamilyRegistrationComponent } from "../patient-family-registration/patient-family-registration.component";
import { MatTabsModule } from "@angular/material/tabs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { CommunicationCenterModule } from "../communication-center/communication-center.module";
import { PatientReferralCrudComponent } from './patient-referrals/patient-referral-crud/patient-referral-crud.component';
import { ReferralPatientDetailsComponent } from './patient-referrals/referral-patient-details/referral-patient-details.component';
@NgModule({
  declarations: [
    RegistrationLandingComponent,
    RegistrationHeaderComponent,
    TableOfContentComponent,
    PersonalDetailsComponent,
    ContactDetailsComponent,
    InsuranceDetailsComponent,
    PreferencesComponent,
    DentalRecordsComponent,
    ReferralsComponent,
    AdditionalIdentifiersComponent,
    PatientFamilyRegistrationComponent,
    PatientReferralCrudComponent,
    ReferralPatientDetailsComponent
  ],
  imports: [CommonModule, MatTabsModule, MatButtonModule, MatIconModule, TranslateModule, SharedModule, AppKendoUIModule, FormsModule, ReactiveFormsModule, PatientAccountModule, PatientSharedModule, OverlayModule, CommunicationCenterModule],
  exports: [RegistrationHeaderComponent],
  entryComponents: [RegistrationLandingComponent, PatientFamilyRegistrationComponent,RegistrationHeaderComponent],
  providers: [
    AgePipe,
    {
      provide: "ModalFactory",
      useFactory: ($injector: any) => $injector.get("ModalFactory"),
      deps: ["$injector"],
    },
    {
      provide: "DocumentService",
      useFactory: ($injector: any) => $injector.get("DocumentService"),
      deps: ["$injector"],
    },
    {
      provide: "TreatmentPlanDocumentFactory",
      useFactory: ($injector: any) => $injector.get("TreatmentPlanDocumentFactory"),
      deps: ["$injector"],
    },
    {
      provide: "InformedConsentFactory",
      useFactory: ($injector: any) => $injector.get("InformedConsentFactory"),
      deps: ["$injector"],
    },
    {
      provide: "FileUploadFactory",
      useFactory: ($injector: any) => $injector.get("FileUploadFactory"),
      deps: ["$injector"],
    },
    {
      provide: "PatientAppointmentsFactory",
      useFactory: ($injector: any) => $injector.get("PatientAppointmentsFactory"),
      deps: ["$injector"],
    },
    {
      provide: "PersonServices",
      useFactory: ($injector: any) => $injector.get("PersonServices"),
      deps: ["$injector"],
    },
    {
      provide: "patSecurityService",
      useFactory: ($injector: any) => $injector.get("patSecurityService"),
      deps: ["$injector"],
    },
    {
      provide: "ImagingPatientService",
      useFactory: ($injector: any) => $injector.get("ImagingPatientService"),
      deps: ["$injector"],
    },
    {
      provide: "PersonFactory",
      useFactory: ($injector: any) => $injector.get("PersonFactory"),
      deps: ["$injector"],
    },

    {
      provide: "$window",
      useFactory: ($injector: any) => $injector.get("$window"),
      deps: ["$injector"],
    },
    {
      provide: "DocumentsLoadingService",
      useFactory: ($injector: any) => $injector.get("DocumentsLoadingService"),
      deps: ["$injector"],
    },
    {
      provide: "PatientMedicalHistoryAlertsFactory",
      useFactory: ($injector: any) => $injector.get("PatientMedicalHistoryAlertsFactory"),
      deps: ["$injector"],
    },
    {
      provide: "StaticData",
      useFactory: ($injector: any) => $injector.get("StaticData"),
      deps: ["$injector"],
    },
    { provide: "FeatureService", useFactory: ($injector: any) => $injector.get("FeatureService"), deps: ["$injector"] },
    { provide: "PatientNotesFactory", useFactory: ($injector: any) => $injector.get("PatientNotesFactory"), deps: ["$injector"] },
    { provide: "DiscardChangesService", useFactory: ($injector: any) => $injector.get("DiscardChangesService"), deps: ["$injector"] },
    { provide: "$rootScope", useFactory: ($injector: any) => $injector.get("$rootScope"), deps: ["$injector"] },
    PatientRegistrationService
    ],
})
export class PatientRegistrationModule {}
