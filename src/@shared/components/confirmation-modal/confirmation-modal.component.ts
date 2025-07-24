import { Component, OnInit, Inject } from '@angular/core';
import { CONFIRMATION_MODAL_DATA } from './confirmation-modal.data';
import { ConfirmationModalOverlayRef } from './confirmation-modal.overlayref';
@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {

    constructor(
        public dialogRef: ConfirmationModalOverlayRef,
        @Inject(CONFIRMATION_MODAL_DATA) public data: any
    ) { }

    ngOnInit() {
    }

    public closeModal($event) {
        this.dialogRef.events.next({
            type: 'close',
            data: null
        });
    }

    public confirmModal($event) {
        this.dialogRef.events.next({
            type: 'confirm',
            // we want to pass back that the user confirmed
            data: this.data
        });
    }
}
