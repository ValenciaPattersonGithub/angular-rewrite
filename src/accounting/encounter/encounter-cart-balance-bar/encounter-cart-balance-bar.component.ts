import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'encounter-cart-balance-bar',
    templateUrl: './encounter-cart-balance-bar.component.html',
    styleUrls: ['./encounter-cart-balance-bar.component.scss']
})
export class EncounterCartBalanceBarComponent implements OnInit {
    @Input() services: any;

    triggerValue:number = 0;

    constructor() { }

    ngOnInit() {  
    }

    public forceUpdate() {
        if (this.triggerValue++ > 100) {
            this.triggerValue = 0;
        }
    }
}
