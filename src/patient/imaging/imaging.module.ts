import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/@shared/shared.module';
import { ImagingProviderService } from './services/imaging-provider.service';
import { ImagingMasterService } from './services/imaging-master.service';
import { SidexisImagingService } from './services/sidexis.service';
import { BlueImagingService } from './services/blue.service';
import { PatientLookupComponent } from './patient-lookup/patient-lookup.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
    declarations: [
    PatientLookupComponent
  ],
    imports: [
        CommonModule, SharedModule, TranslateModule
    ],
    providers: [
        { provide: 'apteryxImagingService', useFactory: ($injector: any) => $injector.get('apteryxImagingService'), deps: ['$injector'] },
        { provide: 'apteryxImagingService2', useFactory: ($injector: any) => $injector.get('apteryxImagingService2'), deps: ['$injector'] },
        { provide: 'platformSessionService', useFactory: ($injector: any) => $injector.get('platformSessionService'), deps: ['$injector'] },
        { provide: 'DcaConfig', useFactory: ($injector: any) => $injector.get('DcaConfig'), deps: ['$injector'] },
        ImagingProviderService,
        ImagingMasterService,
        SidexisImagingService,
        BlueImagingService
    ],
    entryComponents: [
        PatientLookupComponent
    ]
})
export class ImagingModule { }
