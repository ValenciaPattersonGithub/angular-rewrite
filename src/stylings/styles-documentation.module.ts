import { NgModule } from '@angular/core';
import {ColorDocumentationComponent } from './color-documentation/color-documentation.component';
import {CommonModule} from "@angular/common";

@NgModule({
    declarations: [
        ColorDocumentationComponent
    ],
    imports: [
        CommonModule
    ],
    entryComponents: [
        ColorDocumentationComponent
    ],
    providers: [],
})

export class StylesDocumentationModule { }
