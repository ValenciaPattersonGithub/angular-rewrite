import { OverlayRef } from "@angular/cdk/overlay";

export class WaitOverlayRef {
    constructor(private overlayRef: OverlayRef) { }

    close(): void {
        this.overlayRef.dispose();
    }
}
