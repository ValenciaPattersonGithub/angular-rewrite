import { OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, InjectionToken, Injector } from '@angular/core';
import { Overlay } from '@angular/cdk/overlay';
import { BehaviorSubject } from 'rxjs';
import { CoreModule } from 'src/@core/core.module';
import { FeeScheduleUpdateOnPaymentComponent } from './fee-schedule-update-on-payment.component';


const DEFAULT_CONFIG: AppModalOverlayConfig = {
    hasBackdrop: true,
    backdropClass: 'wait-overlay-backdrop',
    panelClass: 'wait-overlay',
}

@Injectable({
    providedIn: CoreModule
})
export class FeeScheduleUpdateModalService {
    public appModalRef: FeeScheduleUpdateModalRef;
    
    constructor(
        private injector: Injector,
        private overlay: Overlay) { }

    open(config: AppModalOverlayConfig = {}) {
        // Override default configuration with any passed properties
        const waitConfig = { ...DEFAULT_CONFIG, ...config };

        // Returns an OverlayRef which is a PortalHost
        const overlayRef = this.createOverlay(waitConfig);

        // Instantiate remote control
        const appModalRef = new FeeScheduleUpdateModalRef(overlayRef);
        // create a custom injector with the config.data and pass to ComponentPortal
        const injector = Injector.create({
            parent: this.injector,
            providers: [
                { provide: FEE_SCHEDULE_UPDATE_MODAL_DATA, useValue: waitConfig.data },
                { provide: FeeScheduleUpdateModalRef, useValue: appModalRef   }                
            ]
        })
        const waitOverlayPortal = new ComponentPortal(FeeScheduleUpdateOnPaymentComponent, null, injector);

        // Attach ComponentPortal to PortalHost
        overlayRef.attach(waitOverlayPortal);
        this.appModalRef = appModalRef;
        return appModalRef;
    }
    
    private createOverlay(config: AppModalOverlayConfig) {
        const overlayConfig = this.getOverlayConfig(config);
        return this.overlay.create(overlayConfig);
    }

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
    data?: FeeScheduleUpdateModalData;
    component?: any;
}

// setup data for inversion of control configuration used in overlayref, modal service and the component of the confirmation modal
export const FEE_SCHEDULE_UPDATE_MODAL_DATA = new InjectionToken<FeeScheduleUpdateModalData>('FEE_SCHEDULE_UPDATE_MODAL_DATA');

export interface FeeScheduleUpdateModalData {    
    cancel?: string;
    confirm?: string;
    data?: {};
    size?: string;
    header?: string;    
}

export class FeeScheduleUpdateModalRef {
    public events = new BehaviorSubject<any>(null);
    constructor(private overlayRef: OverlayRef) { }
    
    close(): void {
        this.overlayRef.dispose();
    }
}



