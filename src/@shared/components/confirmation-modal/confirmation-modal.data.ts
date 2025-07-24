// all the data that you can pass into the confirmation modal component when opening it
// if you want to extend this just add a new parameter and add (?) so that nothing else breaks
import { InjectionToken } from '@angular/core';

// setup data for inversion of control configuration used in overlayref, modal service and the component of the confirmation modal
export const CONFIRMATION_MODAL_DATA = new InjectionToken<ConfirmationModalData>('CONFIRMATION_MODAL_DATA');

export interface ConfirmationModalData {
    itemId?: string;
    itemName?: string;
    message: string;
    message2?: string;
    boldTextMessage?: string;
    cancel?: string;
    confirm?: string;
    height: number,
    width: number,

}