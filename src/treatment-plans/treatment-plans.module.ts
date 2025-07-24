import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { ViewportRuler, ScrollDispatcher } from '@angular/cdk/scrolling';

// try to keep this organized by file location and in A - Z order please 
// this make it easier to find items in the list 
// and they display this way in the file system so why not repeat that idea.
import { TranslateModule } from '@ngx-translate/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

import { TreatmentPlanEditServicesViewComponent } from './components/treatment-plan-edit-services-view/treatment-plan-edit-services-view.component';
import { TreatmentPlanServicesDrawerViewComponent } from './components/treatment-plan-services-drawer-view/treatment-plan-services-drawer-view.component';
import { TreatmentPlanServicesReorderViewComponent } from './components/treatment-plan-services-reorder-view/treatment-plan-services-reorder-view.component';

import { TreatmentPlanHttpService } from './http-providers';

import { TreatmentPlanEditServicesService } from './component-providers';

import { TreatmentPlanServicesDrawerDragService } from './providers';
import { TreatmentPlanEditDetailsService } from './providers';
import { TreatmentPlanTimelineService } from './providers';
import { TreatmentPlanViewDetailsService } from './providers';
import { TreatmentPlansService } from './providers';
import { TreatmentPlanConfirmationModalDataService } from './providers';
import { TreatmentPlanOrderingService } from './providers';
import { TreatmentPlanSelectListService } from './providers';
import { TreatmentPlanFilteringService } from './providers';

import { SharedModule } from '../@shared/shared.module';
import { DatePipe } from '@progress/kendo-angular-intl';

@NgModule({
    declarations: [
        TreatmentPlanEditServicesViewComponent,
        TreatmentPlanServicesDrawerViewComponent,
        TreatmentPlanServicesReorderViewComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        DragDropModule,
        SharedModule,
        TranslateModule,
        AppKendoUIModule,
        BrowserModule,
        BrowserAnimationsModule,
        DropDownsModule,
    ],
    entryComponents: [

        TreatmentPlanEditServicesViewComponent,
        TreatmentPlanServicesDrawerViewComponent,
        TreatmentPlanServicesReorderViewComponent
    ],
    providers: [
        TreatmentPlanHttpService,
        TreatmentPlanEditDetailsService,
        TreatmentPlanEditServicesService,
        TreatmentPlanTimelineService,
        TreatmentPlanViewDetailsService,
        TreatmentPlansService,
        TreatmentPlanServicesDrawerDragService,
        ViewportRuler,
        TreatmentPlanConfirmationModalDataService,
        TreatmentPlanOrderingService,
        TreatmentPlanSelectListService,
        TreatmentPlanFilteringService,
        DatePipe
    ]
})
export class TreatmentPlansModule { }
