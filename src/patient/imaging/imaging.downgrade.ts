import { downgradeComponent, downgradeInjectable } from '@angular/upgrade/static';
import { PatientLookupComponent } from './patient-lookup/patient-lookup.component';
import { BlueImagingService } from './services/blue.service';
import { ImagingMasterService } from './services/imaging-master.service';
import { ImagingProviderService } from './services/imaging-provider.service';

declare var angular: angular.IAngularStatic;

export function ImagingDowngrade() {
  angular
    .module('Soar.Main')
    .directive('patientLookup', downgradeComponent({ component: PatientLookupComponent }))
    .factory('BlueImagingService', downgradeInjectable(BlueImagingService))
    .factory('ImagingMasterService', downgradeInjectable(ImagingMasterService))
    .factory('imagingProviderFactory', downgradeInjectable(ImagingProviderService));
}
