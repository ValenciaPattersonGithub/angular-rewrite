import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeeScheduleUpdateOnPaymentComponent } from './fee-schedule-update-on-payment/fee-schedule-update-on-payment.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { SharedModule } from 'src/@shared/shared.module';


@NgModule({
  declarations: [
    FeeScheduleUpdateOnPaymentComponent
  ],
  entryComponents: [FeeScheduleUpdateOnPaymentComponent],
  imports: [
    CommonModule,
    SharedModule,
    TranslateModule,
    ScrollingModule,
    AppKendoUIModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class FeeScheduleModule { }
