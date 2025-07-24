import { NgModule } from '@angular/core';
import { FeatureFlagEnabledPipe } from './feature-flag-enabled.pipe';
import { FeatureFlagService } from './featureflag.service';

@NgModule({
  declarations: [
    FeatureFlagEnabledPipe
  ],
  imports: [],
  providers: [
    FeatureFlagService
  ],
  exports: [
    FeatureFlagEnabledPipe
  ]
})
export class FeatureFlagModule { }
