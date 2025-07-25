import { OverlayRef } from "@angular/cdk/overlay";

export class CloseClaimOptionsRef {

    constructor(private overlayRef: OverlayRef) { }

    close(): void {
        this.overlayRef.dispose();
    }
}

