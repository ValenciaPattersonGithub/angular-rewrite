import { Component, OnInit, Input, Output, EventEmitter, HostListener, RendererFactory2, Inject, ElementRef, Renderer2, LOCALE_ID, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { formatNumber } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'currency-input',
    templateUrl: './currency-input.component.html',
    styleUrls: ['./currency-input.component.scss']
})
export class CurrencyInputComponent implements OnInit {
    @Input() amount: any;
    @Input() isDisabled?: boolean = false;
    @Input() label?: string;
    @Input() id?: string;
    @Input() labelDirection?: string;
    @Input() allowNoValue: boolean = false;
    @Input() inError?: boolean = false;
    @Output() amountChange = new EventEmitter();
    @Output() newFee = new EventEmitter();
    @Output() amountChanging = new EventEmitter();
    @Output() numericKeyPressed = new EventEmitter();
    @Input() emitOnBlur?: boolean = false;

    displayValue: string;
    oldValue: any;
    subject = new Subject();
    typingInterval: any;
    newValue: any;
    hasChanged: boolean;
    placeholder: any;
    txtId = '';
    constructor(
        @Inject(LOCALE_ID) private locale: string,
        @Inject(ChangeDetectorRef) private changeDetectorRef: ChangeDetectorRef
    ) { }

    onFocus(event) {
        event.target.select();
    }

    onKeyDown(event) {
        var smallKeyBoard = function (event) {
            var which = event.which;
            return ((which >= 96 && which <= 105) || which == 46);
        };
        var numberKeyBoard = function (event) {
            var which = event.which;
            return (which >= 48 && which <= 57) && !event.shiftKey;
        };
        var functionKeyBoard = function (event) {
            var which = event.which;
            return (which <= 40) || (navigator.platform.indexOf('Mac') > -1 && event.metaKey) || (navigator.platform.indexOf('Win') > -1 && event.ctrlKey);
        };

        var floatKeyBoard = function (event, viewValue, hasChanged) {
            var which = event.which;
            return [188].indexOf(which) != -1 || ((which === 190 || which === 110) && viewValue.toString().indexOf('.') === -1 && hasChanged)
                || ((which === 190 || which === 110) && viewValue.toString().indexOf('.') !== -1 && !hasChanged);
        };

        var viewValue = event.target.value ? event.target.value : '';
        if (!(smallKeyBoard(event) || numberKeyBoard(event) || functionKeyBoard(event)
            || floatKeyBoard(event, viewValue, this.hasChanged))) {
            event.stopPropagation();
            event.preventDefault();
        } else {
            // This is used in the apply-insurance-payment.component.ts
            // file to temporarily disable to APPLY button while the 
            // amount entered is validated/calculated: Bug 589289
            this.numericKeyPressed.emit();
        }

        if (event.which == 32) {
            event.stopPropagation();
            event.preventDefault();
        }
    }


    async input(value) {
        // signal that amount is being modified
        if (this.hasChanged === false) {
            this.amountChanging.emit();
            this.hasChanged = true;
        }
        var viewValue = value ? value : '';
        var num = viewValue.replace(/[^0-9.]/g, '');
        var result = parseFloat(num);
        if (this.allowNoValue && this.isEmptyOrSpaces(value)) {
            this.newValue = null;
        }
        else {
            value = isNaN(result) ? 0 : parseFloat(result.toFixed(2));

            await this.sanitizeInput(value);
        }
        

        this.subject.next(this.newValue);
    }

    ngOnInit() {
        this.txtId = this.id ? 'txt' + this.id : '';
        this.placeholder = this.allowNoValue ? "" : "0.00";
        this.hasChanged = false;

        if (this.allowNoValue && this.isEmptyOrSpaces(this.amount)) {
            this.displayValue = null;
        }
        else {
            this.displayValue = formatNumber(this.amount, this.locale, '1.2-2');
        }
        
        this.oldValue = this.amount;
        if (!this.emitOnBlur) {
            this.subject.pipe(debounceTime(2000)).subscribe(() => {
                this.emitAfterTimeout();
            });
        }
    }

    ngOnChanges() {
        this.oldValue = this.amount;

        if (this.allowNoValue && this.newValue != 0 && this.isEmptyOrSpaces(this.amount)) {
            this.displayValue = null;
        }
        else {
            this.displayValue = formatNumber(this.amount, this.locale, '1.2-2');
        }
    }

    emitAfterTimeout() {
        if (!this.emitOnBlur) {
            this.emitChange();
        }
    }

    sanitizeInput(changedValue: number) {
        this.newFee.emit(changedValue)
        if (changedValue > 999999.99) {
            this.newValue = 999999.99;
        }
        else if (changedValue < 0) {
            this.newValue = 0;
        }
        else {
            this.newValue = changedValue;
        }
    }

    isEmptyOrSpaces(str) {
        var emptyRegex = new RegExp('/^ *$/')
        return str === null || str == '' || emptyRegex.test(str);
    }

    emitChange() {
        this.displayValue = this.newValue;
        this.changeDetectorRef.detectChanges();
        if (this.allowNoValue && (this.newValue != 0 && this.isEmptyOrSpaces(this.newValue))) {
            this.displayValue = null;
            this.amountChange.emit(
                {
                    NewValue: this.newValue,
                    OldValue: Number(this.oldValue)
                }
            );
        }
        else {
            this.displayValue = formatNumber(this.newValue, this.locale, '1.2-2');

            this.amountChange.emit(
                {
                    NewValue: Number(this.newValue),
                    OldValue: Number(this.oldValue)
                }
            );
        }
        this.hasChanged = false;
    }
    onBlur() {
        if (this.emitOnBlur && this.newValue != undefined && this.newValue != null && this.hasChanged) {
            this.emitChange();
        } else if (this.emitOnBlur && this.allowNoValue && this.hasChanged) {
            this.emitChange();
        }
    }
}
