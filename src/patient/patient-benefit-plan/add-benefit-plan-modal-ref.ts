import { OverlayRef } from "@angular/cdk/overlay";
import { BehaviorSubject } from "rxjs/internal/BehaviorSubject";

export class AddBenefitPlanModalRef {
    public events = new BehaviorSubject<any>(null);
    constructor(private overlayRef: OverlayRef) { }
    
    close(): void {
        this.overlayRef.dispose();
    }
}
