import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientInsuranceComponent } from './patient-insurance/patient-insurance.component';
import { PatientInsuranceCardComponent } from './patient-insurance/patient-insurance-card/patient-insurance-card.component';
import { SharedModule } from 'src/@shared/shared.module';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PatientAccountMembersComponent } from './patient-account-members/patient-account-members.component';
import { PatientDocumentsComponent } from './patient-documents/patient-documents.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { PatientRegistrationService } from '../common/http-providers/patient-registration.service';
import { OdontogramSnapshotComponent } from './odontogram-snapshot/odontogram-snapshot.component';
import { PatientAccountAgingComponent } from './patient-account-aging/patient-account-aging.component';



@NgModule({
    declarations: [
        PatientInsuranceComponent,
        PatientInsuranceCardComponent,
        PatientAccountMembersComponent,
        PatientDocumentsComponent,
        OdontogramSnapshotComponent,
        PatientAccountAgingComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        AppKendoUIModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule,
        OverlayModule
    ],
    exports: [
        PatientInsuranceComponent, PatientInsuranceCardComponent, PatientAccountMembersComponent, PatientDocumentsComponent, OdontogramSnapshotComponent,
        PatientAccountAgingComponent
    ],
    providers: [
        PatientRegistrationService
    ],
    entryComponents: [
        OdontogramSnapshotComponent,
        PatientAccountAgingComponent]
})
export class PatientSharedModule {
}
