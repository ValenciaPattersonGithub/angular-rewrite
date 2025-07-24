import { Component, Output, EventEmitter, OnDestroy } from '@angular/core';
import { DocScanControlService } from './doc-scan-control.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'doc-scanner',
    templateUrl: './doc-scanner.component.html',
    styleUrls: ['./doc-scanner.component.scss']    
})
export class DocScannerComponent implements OnDestroy {

    @Output() scanSuccess = new EventEmitter();
    @Output() scanFailure = new EventEmitter();
    scanSuccessSubscription: Subscription;
    scanFailureSubscription: Subscription;

    constructor(private controlService: DocScanControlService) {
        this.scanSuccessSubscription = controlService.scanSuccess$.subscribe(() => this.scanSuccess.next());
        this.scanFailureSubscription = controlService.scanFailure$.subscribe(() => this.scanFailure.next());
    }  

    scanAddPage() {
        this.controlService.addPage();
    }

    ngOnDestroy() {
        this.scanSuccessSubscription.unsubscribe();
        this.scanFailureSubscription.unsubscribe();
    }

}
