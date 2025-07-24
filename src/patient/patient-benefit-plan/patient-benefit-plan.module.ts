import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddPatientBenefitPlansModalComponent } from './add-patient-benefit-plans-modal/add-patient-benefit-plans-modal.component';
import { AddPatientBenefitPlanComponent } from './add-patient-benefit-plan/add-patient-benefit-plan.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/@shared/shared.module';

@NgModule({
    declarations: [
        AddPatientBenefitPlansModalComponent,
        AddPatientBenefitPlanComponent,
    ],
    entryComponents: [
        AddPatientBenefitPlansModalComponent
      ],
    imports: [
        CommonModule,
        SharedModule,
        TranslateModule,
    ]
})
export class PatientBenefitPlanModule { }
