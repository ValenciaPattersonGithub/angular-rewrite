import { OverlayRef } from "@angular/cdk/overlay";
import { InjectionToken } from "@angular/core";
import { BehaviorSubject } from "rxjs";

// Claim status history item for a claim
export class EClaimEventDTO {
    EClaimEventId: string = null;
    Message: string = null;
    EventTimeUtc  = undefined;
    // Non-DTO / Component to display claim timezone adjusted Date and Time
    FormattedEventTime?: any = null
}

// overlayref containing the subject that ties the events to the action of the modal
export class ClaimAlertHistoryModalRef {
    public events = new BehaviorSubject<any>(null);
    constructor(private overlayRef: OverlayRef) { }

    close(): void {
        this.overlayRef.dispose();
    }
}

// setup data for inversion of control configuration used in overlayref, modal service and the component
export const CLAIM_ALERT_HISTORY_MODAL_DATA = new InjectionToken<ClaimAlertHistoryModalData>('CLAIM_ALERT_HISTORY_MODAL_DATA');

export interface ClaimAlertHistoryModalData {
    cancel?: string;
    claimId: string;
    claimTimezone: string;

}
