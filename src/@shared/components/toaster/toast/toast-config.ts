import { InjectionToken, TemplateRef } from '@angular/core';

export class ToastData {
    type: ToastType;
    text?: string;
    template?: TemplateRef<any>;
    templateContext?: {};
    title?: string;
}

export type ToastType = 'warning' | 'error' | 'success';

export interface ToastConfig {
    position?: {
        top: number;
        right: number;
    };
    animation?: {
        fadeOut: number;
        fadeIn: number;
    };
    disableAnimation?: boolean;
}

export const defaultToastConfig: ToastConfig = {
    position: {
        top: 20,
        right: 20
    },
    animation: {
        fadeOut: 2500,
        fadeIn: 300
    },
    disableAnimation: true
};

export const TOAST_CONFIG_TOKEN = new InjectionToken('toast-config');
