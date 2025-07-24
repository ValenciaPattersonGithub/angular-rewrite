import { Component, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'notification-badge',
    templateUrl: './notification-badge.component.html',
    styleUrls: ['./notification-badge.component.scss']
})
export class NotificationBadgeComponent implements OnInit {
    @Input() badgeCount: number = 0;
    @Input() badgeText: string;
    @Input() hasOverlayContent: boolean = false;
    @Input() triggerOverlayClose: Subject<void> = new Subject();

    hideOverlay: boolean = false;

    constructor() { }

    ngOnInit(): void {        
        this.triggerOverlayClose.subscribe(() => {
            // This disengages the hover state so the overlay will close.
            this.hideOverlay = true;
            setTimeout(() => this.hideOverlay = false, 100);
        });
    }
}
 