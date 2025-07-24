import { Component, OnInit, Input, ElementRef, AfterViewInit } from '@angular/core';

@Component({
    selector: 'collapsable-drawer',
    templateUrl: './collapsable-drawer.component.html',
    styleUrls: ['./collapsable-drawer.component.scss']
})
export class CollapsableDrawerComponent implements OnInit {
    @Input() content: any;
    @Input() isOpen: boolean;
    constructor() { }

    ngOnInit() {
    }

}
