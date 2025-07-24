import {Component, OnInit, Input, ElementRef, AfterViewInit, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss']
})
export class AppButtonComponent implements OnInit {
    @Input() buttonLabel: string;
    @Input() variation: string;
    @Input() id?: string;
    @Input() isDisabled?: boolean;
    @Input() type: string = 'button';
    @Output() onClick = new EventEmitter<any>();

    onClickButton(event) {
        this.onClick.emit(event);
    }

    constructor() { }

    ngOnInit() {

    }

}
