import { Component, OnInit, Input, HostListener, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'button-menu',
    templateUrl: './button-menu.component.html',
    styleUrls: ['./button-menu.component.scss']
})
export class ButtonMenuComponent implements OnInit {
    //Consider renaming to..... Action Menu? Maybe
    @Input() id: string;
    @Input() buttonText: string;
    @Input() options: any;
    @Input() isDisabled: boolean; 
    @Input() isPrimButton?: boolean;   
    @Output() selectedOption = new EventEmitter();
    variation: any;
    constructor() { }

    ngOnInit() {
        this.isPrimButton = this.isPrimButton ? true : false;
        this.variation = this.isPrimButton === true ? 'primary' : 'secondary';        
    }

    optionClicked(itemString) {
        this.selectedOption.emit(itemString);
    }

}

