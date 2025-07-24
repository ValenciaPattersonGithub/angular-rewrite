import { Output } from '@angular/core';
import { Component, OnInit, Input, EventEmitter, } from '@angular/core';

@Component({
    selector: 'app-label',
    templateUrl: './form-label.component.html',
    styleUrls: ['./form-label.component.scss']
})

export class AppLabelComponent implements OnInit {
    @Input() label: string;
    @Input() fieldId: string;
    @Input() labelClass: string;
    // Use ariaLabel for form controls that have hidden or multiple labels (ie checkboxes, radio, and toggles)
    @Input() ariaLabel?: string;
    @Input() isErrorColor = false;
    @Input() isBold = false;
    ngOnInit() {

    }
}
