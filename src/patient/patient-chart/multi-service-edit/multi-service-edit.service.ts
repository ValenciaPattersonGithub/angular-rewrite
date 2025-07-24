import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Injector } from '@angular/core';

import { MultiServiceEditOverlayRef } from './multi-service-edit.overlayref';
import { MultiServiceEditData, MULTI_SERVICE_EDIT_DATA } from './multi-service-edit.data';

import { MultiServiceEditComponent } from './multi-service-edit.component';

// all of these can be over written but the defaults are listed in the constant which uses this interface
interface MultiServiceEditConfig {
    panelClass?: string;
    hasBackdrop?: boolean;
    backdropClass?: string;
    // not required so this can combine with the Default_config without error
    data?: MultiServiceEditData;
}

// configuration values needed for the overlay nad portal
const DEFAULT_CONFIG: MultiServiceEditConfig = {
    hasBackdrop: true,
    backdropClass: 'app-confirmation-modal-overlay-backdrop',
    panelClass: 'app-confirmation-modal-panel',
};

@Injectable()
export class MultiServiceEditService {

    public dialogRef: MultiServiceEditOverlayRef;

    constructor(
        private injector: Injector,
        private overlay: Overlay
    ) { }

    open(config: MultiServiceEditConfig) {

        // returns an OverlayRef (which is a type of PortalHost)
        let modalConfig = { ...DEFAULT_CONFIG, ...config };
        let overlayRef = this.createOverlay(modalConfig);
        let dialogRef = new MultiServiceEditOverlayRef(overlayRef);

        let overlayComponent = this.putThePiecesTogether(overlayRef, modalConfig, dialogRef);

        this.dialogRef = dialogRef;
        return dialogRef;
    }

    private putThePiecesTogether(overlayRef: OverlayRef, config: MultiServiceEditConfig, dialogRef: MultiServiceEditOverlayRef) {

        // using inversion of control to put things together
        // portal injector
        const injectionTokens = new WeakMap();
        injectionTokens.set(MultiServiceEditOverlayRef, dialogRef);
        injectionTokens.set(MULTI_SERVICE_EDIT_DATA, config.data);
        let portalInjector = new PortalInjector(this.injector, injectionTokens);

        // confirmation modal overlayref
        const containerPortal = new ComponentPortal(MultiServiceEditComponent, null, portalInjector);
        const containerRef: ComponentRef<MultiServiceEditComponent> = overlayRef.attach(containerPortal);
        return containerRef.instance;
    }

    private buildOverlayConfig(config: MultiServiceEditConfig): OverlayConfig {

        // ensure height is set
        if (config.data.height === null || config.data.height === undefined) {
            config.data.height = 120;
        }

        // ensure width is set
        if (config.data.width === null || config.data.width === undefined) {
            config.data.width = 300;
        }

        // setting the positioning the overlay - placement - height - width
        const positionStrategy = this.overlay.position()
            .global().centerHorizontally().centerVertically()
            .height(config.data.height.toString() + 'px').width(config.data.width.toString() + 'px');

        const overlayConfig = new OverlayConfig({
            hasBackdrop: config.hasBackdrop,
            backdropClass: config.backdropClass,
            panelClass: config.panelClass,
            // no one wants a page to scroll while a confirmation modal is present so do not allow it
            scrollStrategy: this.overlay.scrollStrategies.block(),
            positionStrategy
        });

        return overlayConfig;
    }

    private createOverlay(config: MultiServiceEditConfig) {
        // Returns an OverlayConfig
        const overlayConfig = this.buildOverlayConfig(config);

        // Returns an OverlayRef
        return this.overlay.create(overlayConfig);
    }
}
