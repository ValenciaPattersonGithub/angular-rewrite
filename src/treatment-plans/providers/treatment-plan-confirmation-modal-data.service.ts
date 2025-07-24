import { Injectable, Inject } from '@angular/core';

@Injectable()
export class TreatmentPlanConfirmationModalDataService {

    
    constructor() {
      
    }

    //fee Tx Plan Modal Data for Confirmation Prompt
    readonly feeConfirmationModalData = {
        header: 'Use New Location Fee?',
        message: 'This location charges a different fee than the originally proposed. Use new location fee and update estimated patient charges?',
        confirm: 'Yes',
        cancel: 'No',
        height: 200,
        width: 400
    };

    //cancel Tx Plan Modal Data for Confirmation Prompt
    readonly cancelConfirmationModalData = {
        header: 'Discard',
        message: 'Are you sure you want to discard these changes?',
        confirm: 'Yes',
        cancel: 'No',
        height: 170,
        width: 350
    }

    //cancel Tx Plan Modal Data for Confirmation Prompt
    readonly cancelConfirmationModalData2 = {
        header: 'Unsaved Changes!',
        message: 'You have unsaved changes. Are you sure you want to leave the page?',
        confirm: 'Yes',
        cancel: 'No',
        height: 190,
        width: 350
    }

    //delete Treatment Plan Modal Data for Confirmation Prompt
    readonly saveRequestNoServicesConfirmationModalData = {
        header: 'No Services Added',
        message: 'You must have at least one service added to your treatment plan to save it.',
        confirm: 'OK',
        height: 180,
        width: 425
    };

    //delete Stage Modal Data for Confirmation Prompt
    readonly deleteStageConfirmationModalData = {
        header: 'Delete Stage?',
        message: 'Are you sure you want to delete this stage?',
        confirm: 'Yes',
        cancel: 'No',
        height: 170,
        width: 350
    };

    //Confirmation Prompt for removing a service from an appointment on a Tx Plan
    readonly removeServiceFromAppointmentConfirmationModalData = {
        header: 'Remove Services from Appointment?',
        message: 'Some of the services you selected to remove are currently scheduled.',
        message2: 'Would you like to remove these services from their scheduled appointment as well?',
        confirm: 'Yes',
        cancel: 'No',
        height: 210,
        width: 500
    };

    //Confirmation Prompt for deleting service from Tx Plan
    readonly removeServiceConfirmationModalData = {
        header: 'Remove Service?',
        message: 'Are you sure you want to remove this service?',
        confirm: 'Yes',
        cancel: 'No',
        height: 170,
        width: 350
    };
 
}
