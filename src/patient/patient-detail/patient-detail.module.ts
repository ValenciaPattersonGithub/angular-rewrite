import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientHttpService } from '../common/http-providers/patient-http.service';
import { PatientDetailService } from './services/patient-detail.service';
 

@NgModule({
    declarations: [],
    imports: [
        CommonModule
    ],
    providers: [
        PatientHttpService,
        PatientDetailService 
    ]
})
export class PatientDetailModule { }