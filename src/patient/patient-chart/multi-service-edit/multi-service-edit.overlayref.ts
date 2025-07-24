import { OverlayRef } from '@angular/cdk/overlay';
import { BehaviorSubject } from 'rxjs';

// overlayref containing the subject that ties the events to the action of the modal
export class MultiServiceEditOverlayRef {
    // this contains the confirm and close events used in a normal confirmation modal
    // if you need to extend ... you should probably make a new modal component
    public events = new BehaviorSubject<any>(null);

    constructor(private overlayRef: OverlayRef) { }

    //a clean DOM is a happy DOM
    public close(): void {
        this.overlayRef.dispose();
    }
}