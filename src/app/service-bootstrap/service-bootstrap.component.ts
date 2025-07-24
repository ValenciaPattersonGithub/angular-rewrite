import { Component, HostListener, OnDestroy } from '@angular/core';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

@Component({
  selector: 'app-service-bootstrap',
  template: ''
})
export class ServiceBootstrapComponent implements OnDestroy {

  constructor(private flagService: FeatureFlagService) {}

  @HostListener('window:beforeunload')
  ngOnDestroy(): void {
    // flush any LaunchDarkly telemetry on tab close
    this.flagService.close();
  }
}
