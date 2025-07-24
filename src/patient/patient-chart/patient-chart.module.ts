import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientRxService } from './patient-rx/providers/patient-rx.service';
import { PatientNotesService } from './patient-notes/providers/patient-notes.service';
import { PatientPerioService } from './patient-perio/patient-perio.service';
import { MultiServiceEditComponent } from './multi-service-edit/multi-service-edit.component';
import { SharedModule } from 'src/@shared/shared.module';
import { MultiServiceEditService } from './multi-service-edit/multi-service-edit.service';
import { TreatmentPlanPrintOptionsComponent } from './treatment-plans/treatment-plan-print-options/treatment-plan-print-options.component';
import { ChartColorsService } from './chart-colors.service';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [MultiServiceEditComponent, TreatmentPlanPrintOptionsComponent],
  imports: [
      CommonModule, SharedModule, TranslateModule      
  ],
  providers: [
    PatientRxService,
      PatientNotesService,
      PatientPerioService,
      MultiServiceEditService,
      ChartColorsService
    ],    
    entryComponents: [
        MultiServiceEditComponent, TreatmentPlanPrintOptionsComponent
    ],
    exports: [MultiServiceEditComponent],
})
export class PatientChartModule { }
