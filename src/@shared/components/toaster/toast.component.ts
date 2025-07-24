import {
    Component,
    OnInit,
    OnDestroy,
    Inject,
    TemplateRef
} from '@angular/core';
import { AnimationEvent } from '@angular/animations';

import { ToastData, TOAST_CONFIG_TOKEN, ToastConfig } from './toast/toast-config';
import { ToastRef } from './toast/toast-ref';
import { toastAnimations, ToastAnimationState } from './toast/toast-animation';

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    styleUrls: ['./toast.component.scss'],
    animations: [toastAnimations.fadeToast]
})
export class ToastComponent implements OnInit, OnDestroy {
    animationState: ToastAnimationState = 'default';
    iconType: string;
    content: TemplateRef<any>;
    private intervalId: ReturnType<typeof setTimeout>;

    constructor(
        readonly data: ToastData,
        readonly ref: ToastRef,
        @Inject(TOAST_CONFIG_TOKEN) public toastConfig: ToastConfig
    ) {
        this.iconType = data.type === 'success' ? 'done' : data.type;
        this.content = data.template;
        if (toastConfig.disableAnimation) {
            toastConfig.animation.fadeOut = 1;
        }
    }

    ngOnInit() {
        this.intervalId = setTimeout(() => (this.animationState = 'closing'), 3000);
    }

    ngOnDestroy() {
        clearTimeout(this.intervalId);
    }

    close() {
        this.ref.close();
    }

    onFadeFinished(event: AnimationEvent) {
        if (!this.toastConfig.disableAnimation) {
            const { toState } = event;
            const isFadeOut = (toState as ToastAnimationState) === 'closing';
            const itFinished = this.animationState === 'closing';

            if (isFadeOut && itFinished) {
                this.close();
            }
        }
    }
}
