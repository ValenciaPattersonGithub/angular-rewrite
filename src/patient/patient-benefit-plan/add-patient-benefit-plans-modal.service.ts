import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, Type } from '@angular/core';
import { CoreModule } from 'src/@core/core.module';
import { AddPatientBenefitPlansModalComponent } from './add-patient-benefit-plans-modal/add-patient-benefit-plans-modal.component';
import { AddBenefitPlanModalRef } from './add-benefit-plan-modal-ref';
import { ADD_BENEFIT_PLAN_MODAL_DATA, AddBenefitPlanModalData } from './add-benefit-plan-modal.data';

const DEFAULT_CONFIG: AppModalOverlayConfig = {
    hasBackdrop: true,
    backdropClass: 'wait-overlay-backdrop',
    panelClass: 'wait-overlay',
}

@Injectable({
    providedIn: CoreModule
})
export class AddPatientBenefitPlansModalService {
    public appModalRef: AddBenefitPlanModalRef;
    
    constructor(
        private injector: Injector,
        private overlay: Overlay) { }

    open(config: AppModalOverlayConfig = {}) {
        // Override default configuration with any passed properties
        const waitConfig = { ...DEFAULT_CONFIG, ...config };

        // Returns an OverlayRef which is a PortalHost
        const overlayRef = this.createOverlay(waitConfig);

        // Instantiate remote control
        const appModalRef = new AddBenefitPlanModalRef(overlayRef);
        // create a custom injector with the config.data and pass to ComponentPortal
        const injector = Injector.create({
            parent: this.injector,
            providers: [
                { provide: ADD_BENEFIT_PLAN_MODAL_DATA, useValue: waitConfig.data },
                { provide: AddBenefitPlanModalRef, useValue: appModalRef   }                
            ]
        })
        const waitOverlayPortal = new ComponentPortal(AddPatientBenefitPlansModalComponent, null, injector);

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
    data?: AddBenefitPlanModalData;
    component?: any;
}

