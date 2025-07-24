

import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CloseClaimOptionsComponent } from './close-claim-options/close-claim-options.component';
import { ConfirmationModalData, CONFIRMATION_MODAL_DATA } from 'src/@shared/components/confirmation-modal/confirmation-modal.data';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';

interface ConfirmationModalConfig {
    panelClass?: string;
    hasBackdrop?: boolean;
    backdropClass?: string;
    data?: ConfirmationModalData;
}

// configuration values needed for the overlay nad portal
const DEFAULT_CONFIG: ConfirmationModalConfig = {
    hasBackdrop: true,
    backdropClass: 'app-confirmation-modal-overlay-backdrop',
    panelClass: 'app-confirmation-modal-panel',
};

@Injectable()
export class CloseClaimOptionsService {
    public dialogRef: ConfirmationModalOverlayRef;

    constructor(
        private injector: Injector,
        private overlay: Overlay
    ) { }

    open(config: ConfirmationModalConfig) {
        // Override default configuration with any passed properties
        const modalConfig = { ...DEFAULT_CONFIG, ...config };
        
        let overlayRef = this.createOverlay(modalConfig);
        
        // Returns an OverlayRef which is a PortalHost
        let dialogRef = new ConfirmationModalOverlayRef(overlayRef);

                // create a custom injector with the config.data and pass to ComponentPortal
        const injector = Injector.create({
            parent: this.injector,
            providers: [
                { provide: CONFIRMATION_MODAL_DATA, useValue: modalConfig.data },
                { provide: ConfirmationModalOverlayRef, useValue: dialogRef }
            ]
        })
        const portal = new ComponentPortal(CloseClaimOptionsComponent, null, injector);

        // Attach ComponentPortal to PortalHost
        overlayRef.attach(portal);
        this.dialogRef = dialogRef;
        return dialogRef;

    }

    private createOverlay(config: ConfirmationModalConfig) {
        // Returns an OverlayConfig
        const overlayConfig = this.getOverlayConfig(config);

        // Returns an OverlayRef
        return this.overlay.create(overlayConfig);
    }

    private getOverlayConfig(config: ConfirmationModalConfig): OverlayConfig {
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

    allowEstimateOption(renewalMonth: number, services: any[]) {
        if (renewalMonth === 0){
            return false;
        }
        let canAllow: boolean = false;
        let today = new Date();
        // determine renewal date
        let renewalDateStart = new Date(today.getFullYear(), renewalMonth - 1, 1);
        if (renewalMonth > today.getMonth() + 1){
            renewalDateStart = new Date(today.getFullYear() - 1, renewalMonth - 1, 1);
        }          
        services.forEach(x => { 
            if ((new Date(x.DateEntered)) < renewalDateStart){                                
                canAllow = true;
            }
        })        
        return canAllow; 
    }
}
