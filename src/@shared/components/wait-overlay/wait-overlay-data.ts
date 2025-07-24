import { InjectionToken } from "@angular/core";

// setup data for ioc configuration used in overlayref, overlay service and the wait component 
export const WAIT_OVERLAY_DATA = new InjectionToken<WaitOverlayData>('WAIT_OVERLAY_DATA');

export interface WaitOverlayData { 
    header: string;   
    message: string;
    message2?: string;
    boldTextMessage?: string;
}
