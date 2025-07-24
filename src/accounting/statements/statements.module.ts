import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatementsComponent } from '../statements/statements.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LabelModule } from '@progress/kendo-angular-label';
import { FormFieldModule } from '@progress/kendo-angular-inputs';
import { DropDownListModule } from '@progress/kendo-angular-dropdowns';
import { DatePickerModule } from '@progress/kendo-angular-dateinputs';

@NgModule({
  declarations: [
    StatementsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LabelModule,
    FormFieldModule,
    DropDownListModule,
    DatePickerModule,
  ],
  entryComponents: [
    StatementsComponent
  ]
})
export class StatementsModule { }
