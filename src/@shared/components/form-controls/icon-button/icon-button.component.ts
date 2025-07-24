import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-icon-button',
    templateUrl: './icon-button.component.html',
    styleUrls: ['./icon-button.component.scss']
})

export class AppIconButtonComponent {
    @Input() iconName: string;
    @Input() iconHeight: number = 16;
    @Input() iconWidth: number = 16;
    @Input() variation: string;
    @Input() ariaLabel: string;
    @Input() id?: string;
    @Input() isDisabled?: boolean;
    @Input() selected: boolean = false;
    @Output() onClick = new EventEmitter<any>();

    onClickButton(event) {
        this.onClick.emit(event);
    }

    constructor() { }
}
