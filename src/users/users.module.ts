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

//import { Treatmentplan } from './components/treatment-plan-edit-services-view/treatment-plan-edit-services-view.component';


import { SharedModule } from '../@shared/shared.module';
import { UserLoginTimePanelComponent } from './crud/user-login-time-panel/user-login-time-panel.component';
//import { DatePipe } from '@progress/kendo-angular-intl';

@NgModule({
    declarations: [
        UserLoginTimePanelComponent
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
    exports: [
        UserLoginTimePanelComponent
    ],
    entryComponents: [
        UserLoginTimePanelComponent
    ],
    providers: [
        { provide: 'UserLoginTimesFactory', useFactory: ($injector: any) => $injector.get('UserLoginTimesFactory'), deps: ['$injector'] },
        { provide: 'UserServices', useFactory: ($injector: any) => $injector.get('UserServices'), deps: ['$injector'] },
        { provide: 'practiceService', useFactory: ($injector: any) => $injector.get('practiceService'), deps: ['$injector'] },
    ]
})
export class UsersModule { }
