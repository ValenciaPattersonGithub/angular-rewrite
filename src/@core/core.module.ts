import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureFlagModule } from 'src/featureflag/featureflag.module';
import { LegacyLocationService } from './data-services/legacy-location.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FeatureFlagModule
  ],
  providers: [
    { provide: 'locationService', useFactory: ($injector: any) => $injector.get('locationService'), deps: ['$injector'] },
    { provide: LegacyLocationService, useFactory: ($injector: any) => $injector.get('locationService'), deps: ['$injector'] }
  ]
})
export class CoreModule { }
