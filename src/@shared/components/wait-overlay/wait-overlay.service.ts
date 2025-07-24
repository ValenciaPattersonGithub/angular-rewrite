import { Injectable, Inject, InjectionToken, Injector, ComponentRef } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal, DomPortalHost, PortalInjector } from '@angular/cdk/portal';
import { WaitOverlayComponent } from './wait-overlay.component';
import { WaitOverlayRef } from './wait-overlay-ref';
import { WaitOverlayData, WAIT_OVERLAY_DATA } from './wait-overlay-data';
interface WaitOverlayConfig {
    panelClass?: string;
    hasBackdrop?: boolean;
    backdropClass?: string;
    data?: WaitOverlayData;
}

const DEFAULT_CONFIG: WaitOverlayConfig = {
    hasBackdrop: true,
    backdropClass: 'wait-overlay-backdrop',
    panelClass: 'wait-overlay',
}

@Injectable()
export class WaitOverlayService {

    public waitOverlayRef: WaitOverlayRef;
    constructor(
        private injector: Injector,
        private overlay: Overlay) { }

    open(config: WaitOverlayConfig = {}) {
        // Override default configuration with any passed properties
        const waitConfig = { ...DEFAULT_CONFIG, ...config };

        // Returns an OverlayRef which is a PortalHost
        const overlayRef = this.createOverlay(waitConfig);

        // Instantiate remote control
        const waitOverlayRef = new WaitOverlayRef(overlayRef);
        // create a custom injector with the config.data and pass to ComponentPortal
        const injector = Injector.create({
            parent: this.injector,
            providers: [
                { provide: WAIT_OVERLAY_DATA, useValue: waitConfig.data }
            ]
        })

        const waitOverlayPortal = new ComponentPortal(WaitOverlayComponent, null, injector);

        // Attach ComponentPortal to PortalHost
        overlayRef.attach(waitOverlayPortal);
        this.waitOverlayRef = waitOverlayRef;
        return waitOverlayRef;
    }

    private createOverlay(config: WaitOverlayConfig) {
        const overlayConfig = this.getOverlayConfig(config);
        return this.overlay.create(overlayConfig);
    }

    private getOverlayConfig(config: WaitOverlayConfig): OverlayConfig {
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
