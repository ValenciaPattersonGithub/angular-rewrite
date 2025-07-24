
import { Overlay, OverlayConfig} from '@angular/cdk/overlay';
import { Injectable, Injector } from '@angular/core';
import { CoreModule } from 'src/@core/core.module';
import { ClaimAlertHistoryModalComponent } from './claim-alert-history-modal/claim-alert-history-modal.component';
import { ComponentPortal } from '@angular/cdk/portal';
import { CLAIM_ALERT_HISTORY_MODAL_DATA, ClaimAlertHistoryModalData, ClaimAlertHistoryModalRef } from './claim-alert-history.models';

// configuration values needed for the overlay nad portal
const DEFAULT_CONFIG: AppModalOverlayConfig = {
  hasBackdrop: true,
  backdropClass: 'wait-overlay-backdrop',
  panelClass: 'wait-overlay',
}

@Injectable({
  providedIn: CoreModule
})

// service responsible for creating ComponentPortal with ClaimAlertHistoryModalComponent
export class ClaimAlertHistoryModalService {
  public appModalRef: ClaimAlertHistoryModalRef;

  constructor(
    private injector: Injector,
    private overlay: Overlay) { }

  open(config: AppModalOverlayConfig = {}) {
    // Override default configuration with any passed properties
    const waitConfig = { ...DEFAULT_CONFIG, ...config };

    // Returns an OverlayRef which is a PortalHost
    const overlayRef = this.createOverlay(waitConfig);

    // Instantiate remote control
    const appModalRef = new ClaimAlertHistoryModalRef(overlayRef);
    // create a custom injector with the config.data and pass to ComponentPortal
    const injector = Injector.create({
      parent: this.injector,
      providers: [
        { provide: CLAIM_ALERT_HISTORY_MODAL_DATA, useValue: waitConfig.data },
        { provide: ClaimAlertHistoryModalRef, useValue: appModalRef }
      ]
    })
    const waitOverlayPortal = new ComponentPortal(ClaimAlertHistoryModalComponent, null, injector);

    // Attach ComponentPortal to PortalHost
    overlayRef.attach(waitOverlayPortal);
    this.appModalRef = appModalRef;
    return appModalRef;
  }

  // Returns an OverlayRef
  private createOverlay(config: AppModalOverlayConfig) {
    const overlayConfig = this.getOverlayConfig(config);
    return this.overlay.create(overlayConfig);
  }

  // Returns an OverlayConfig
  private getOverlayConfig(config: AppModalOverlayConfig): OverlayConfig {
    const positionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const overlayConfig = new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy,
    });
    return overlayConfig;
  }
}

// setup data for ioc configuration used in overlayref, overlay service
interface AppModalOverlayConfig {
  panelClass?: string;
  hasBackdrop?: boolean;
  backdropClass?: string;
  data?: ClaimAlertHistoryModalData;
  component?: any;
}

