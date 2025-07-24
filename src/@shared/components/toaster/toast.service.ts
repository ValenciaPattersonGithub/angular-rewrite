import { Injectable, Injector, Inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';

import { ToastComponent } from './toast.component';
import { ToastData, TOAST_CONFIG_TOKEN, ToastConfig } from './toast/toast-config';
import { ToastRef } from './toast/toast-ref';

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private lastToast: ToastRef;
    private toasrRefs: Array<ToastRef> = [];

    constructor(
        private overlay: Overlay,
        private parentInjector: Injector,
        @Inject(TOAST_CONFIG_TOKEN) private toastConfig: ToastConfig
    ) { }

    close = () => {
        this.overlay.position().global().bottom();
        const visibleToasters = this.toasrRefs.filter(x => x.isVisible());
        visibleToasters.forEach(x => {
            x.close();
        });
    }
    show(data: ToastData, manualClose: boolean) {
        if (!manualClose) {
            this.close();
        }

        const positionStrategy = this.getPositionStrategy();
        const overlayRef = this.overlay.create({ positionStrategy });
        this.toastConfig.disableAnimation = !manualClose;
        const toastRef = new ToastRef(overlayRef);
        this.lastToast = toastRef;
        this.toasrRefs.push(toastRef);
        const injector = this.getInjector(data, toastRef, this.parentInjector);
        const toastPortal = new ComponentPortal(ToastComponent, null, injector);
        overlayRef.detach();
        overlayRef.attach(toastPortal);

        return toastRef;
    }

    getPositionStrategy() {
        return this.overlay
            .position()
            .global()
            .bottom(this.getPosition())
            .right(this.toastConfig.position.right + 'px');
    }

    getPosition() {
        const lastToastIsVisible = this.lastToast && this.lastToast.isVisible();
        const visibleToasters = this.toasrRefs.filter(x => x.isVisible()).length;
        let position = lastToastIsVisible
            ? this.lastToast.getPosition().height +
            (this.lastToast.getPosition().height + 10) * (visibleToasters - 1)
            : this.toastConfig.position.top;
        if (visibleToasters === 1) {
            position = 125;
        }
        return position + 'px';
    }

    getInjector(data: ToastData, toastRef: ToastRef, parentInjector: Injector) {
        const tokens = new WeakMap();
        tokens.set(ToastData, data);
        tokens.set(ToastRef, toastRef);
        return new PortalInjector(parentInjector, tokens);
    }
}
