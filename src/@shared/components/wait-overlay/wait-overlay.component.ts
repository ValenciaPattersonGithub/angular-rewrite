import { Component, Inject, OnInit } from '@angular/core';
import { WaitOverlayData, WAIT_OVERLAY_DATA } from './wait-overlay-data';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'wait-overlay',
    templateUrl: './wait-overlay.component.html',
    styleUrls: ['./wait-overlay.component.scss']
})
export class WaitOverlayComponent implements OnInit {

    constructor(
        private translate: TranslateService,
        // TODO make injected messages available
       @Inject(WAIT_OVERLAY_DATA) public data: WaitOverlayData
    ) { }

    ngOnInit(): void {
    }
}
