// this is the object that will contain any data needed passed to the modal window
// extend this by adding a new parameter and add (?)
import { InjectionToken, Type } from '@angular/core';

// setup data for inversion of control configuration used in overlayref, modal service and the component of the confirmation modal
export const ADD_BENEFIT_PLAN_MODAL_DATA = new InjectionToken<AddBenefitPlanModalData>('ADD_BENEFIT_PLAN_MODAL_DATA');

export interface AddBenefitPlanModalData {    
    cancel?: string;
    confirm?: string;
    data?: {};
    size?: string;
    patient: any;
    plan: any;
    allowedPlans: 0;
    editing: boolean;
    selfonly: boolean;
    nextAvailablePriority: number;
}
