import { NgModule } from '@angular/core';
import { DialogModule } from '@progress/kendo-angular-dialog';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { GridModule } from '@progress/kendo-angular-grid';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { ChartsModule } from '@progress/kendo-angular-charts';
import { TooltipModule } from '@progress/kendo-angular-tooltip';
@NgModule({
    exports: [DialogModule, LayoutModule, GridModule, DateInputsModule, DropDownsModule, ChartsModule, TooltipModule]
})
export class AppKendoUIModule { }
