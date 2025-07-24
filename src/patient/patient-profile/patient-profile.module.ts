import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PatientProfileLandingComponent } from "./patient-profile-landing/patient-profile-landing.component";
import { PatientProfileFamilyLandingComponent } from "./patient-profile-family-landing/patient-profile-family-landing.component";
import { SharedModule } from "src/@shared/shared.module";
import { AppKendoUIModule } from "src/app-kendo-ui/app-kendo-ui.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { PatientPreferencesComponent } from "./patient-preferences/patient-preferences.component";
import { PatientContactDetailsComponent } from "./patient-contact-details/patient-contact-details.component";
import { PatientAdditionalIdentifiersComponent } from "./patient-additional-identifiers/patient-additional-identifiers.component";
import { PatientReferralsComponent } from "./patient-referrals/patient-referrals.component";
import { PatientDentalRecordsComponent } from "./patient-dental-records/patient-dental-records.component";
import { PatientCardComponent } from "./patient-card/patient-card.component";
import { SchedulingModule } from "src/scheduling/scheduling.module";
import { PatientSharedModule } from "../patient-shared/patient-shared.module";
import { MatTabsModule } from "@angular/material/tabs";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
@NgModule({
  declarations: [
    PatientProfileLandingComponent,
    PatientProfileFamilyLandingComponent,
    PatientPreferencesComponent,
    PatientContactDetailsComponent,
    PatientAdditionalIdentifiersComponent,
    PatientReferralsComponent,
    PatientDentalRecordsComponent,
    PatientCardComponent,
    ],
  imports: [CommonModule, SharedModule, AppKendoUIModule, FormsModule, ReactiveFormsModule, TranslateModule, SchedulingModule, PatientSharedModule, MatTabsModule, MatButtonModule, MatIconModule],
  exports: [],
  entryComponents: [PatientProfileLandingComponent, PatientProfileFamilyLandingComponent],
})
export class PatientProfileModule {}
