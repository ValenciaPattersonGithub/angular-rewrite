import { Component, Inject,OnInit } from '@angular/core';
import { CONFIRMATION_MODAL_DATA } from 'src/@shared/components/confirmation-modal/confirmation-modal.data';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';

@Component({
    selector: 'close-claim-options',
    templateUrl: './close-claim-options.component.html',
    styleUrls: ['./close-claim-options.component.scss']
})
export class CloseClaimOptionsComponent implements OnInit {
    
    constructor(
        public dialogRef: ConfirmationModalOverlayRef,
        @Inject(CONFIRMATION_MODAL_DATA) public data: any
    ) { }    
    ngOnInit(): void {
        
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
            data: this.data
        });
    }
    
}

