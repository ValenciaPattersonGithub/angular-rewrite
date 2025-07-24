import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
declare var angular: any;
@Component({
    selector: 'app-chips',
    templateUrl: './chips.component.html',
    styleUrls: ['./chips.component.scss']
})
export class ChipsComponent implements OnInit {
    @Input() variation: string;
    @Input() chipsText: string;
    @Input() isDisabled?: boolean;
    @Input() showIcon = false;
    @Output() removeChips = new EventEmitter<any>();
    IsRemoved = false;
    constructor() { }

    ngOnInit(): void {

    }

    remove(event: any) {
        this.IsRemoved = true;
        this.removeChips.emit(this.IsRemoved);
    }

}
