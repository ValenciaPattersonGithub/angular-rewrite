import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppDateSelectorComponent } from '../../MigrationTransit/app-date-selector/app-date-selector.component';
import moment from 'moment';
import { CommonFormatterService } from 'src/@shared/filters/common-formatter.service';

@Component({
    selector: 'app-date-range-selector',
    templateUrl: './date-range-selector.component.html',
    styleUrls: ['./date-range-selector.component.scss']
})
export class DateRangeSelectorComponent implements OnInit, ControlValueAccessor {

    constructor(private elementRef : ElementRef, public datepipe: DatePipe,
        private translate: TranslateService, public fb: FormBuilder,
        public commonFormatterService:CommonFormatterService) { }

    @Input() startDate: Date;
    @Input() endDate: Date;
    startDateControl = new FormControl("");
    endDateControl = new FormControl("");

    //Types of Validation  
    @Input() dateRangeValidator = false; // if true, it will validate that the 'Start Date' should less then 'End Date'. 
    @Input() requiredBothDates = false; // if true, it will make 'Start Date' and 'End Date' Required.
    @Input() showErrorMessages = true; // if false, it will not show validation message only.  

    @Input() minStartDate: Date = new Date(1900, 1, 1);
    @Input() maxStartDate: Date = new Date(2099, 11, 31);
    @Input() minEndDate: Date = new Date(1900, 1, 1);
    @Input() maxEndDate = new Date(2099, 11, 31);

    @Input() selectedDateResponseFormat = null;
    @Input() applyBtnLabel = this.translate.instant('Apply');
    @Input() clearBtnLabel = this.translate.instant('Clear');
    @Input() popUpFixWidth = true;
    @Input() tooltipPosition = 'dateRangepicker';

    @Input() hideDateControl = false;
    @Input() hideOnClear = false;
    @Input() showPopOver = false;
    @Input() hideOnClickOutSide = true;
    @Input() showPlaceholder = true;
    @Input() enableIncompleteDateValidation = true;
    @Input() isScheduleUtilization = false;

    // Output events  
    @Output() onApply = new EventEmitter<object>();
    @Output() onClear = new EventEmitter<object>();
    @Output() onPopupOpen = new EventEmitter();

    @ViewChild('startDate') public startDateContainer: AppDateSelectorComponent;
    @ViewChild('endDate') public endDateContainer: AppDateSelectorComponent;

    formGroup: FormGroup;
    frmDateRangePicker: FormGroup;
    startDateLabel = this.translate.instant('Start Date');
    EndDateLabel = this.translate.instant('End Date');

    isOutsideClick = false;
    dateFormat = 'MM/dd/yyyy';

    // Support ControlValueAccessor in Reactive Form
    writeValue = () => { };
    onChange = () => { };
    onTouched = () => { };

    registerOnTouched(fn) {
        this.onTouched = fn;
    }

    registerOnChange(fn) {
        this.onChange = fn;
    }

    ngOnInit(): void {
        this.formGroup = this.fb?.group({
            dateRange: ['', '']
        });

        this.frmDateRangePicker = this.fb?.group({
            startDate: [this.startDate, this.requiredBothDates ? [Validators.required] : ''],
            endDate: [this.endDate, this.requiredBothDates ? [Validators.required] : ''],
        });

        if (this.frmDateRangePicker?.valid) {
            const startDate = this.frmDateRangePicker?.controls?.startDate?.value;
            const endDate = this.frmDateRangePicker?.controls?.endDate?.value;
            let dateRange = '';
            if (startDate || endDate) {
                const startDisplay = startDate ? this.datepipe.transform(startDate, this.dateFormat) : '';
                const endDisplay = endDate ? this.datepipe.transform(endDate, this.dateFormat) : '';
                if (startDisplay != '' && endDisplay != '') {
                    dateRange = `${startDisplay} to ${endDisplay}`;
                } else {
                    if (startDisplay != '') {
                        dateRange = `>= ${startDisplay}`;
                    } else if (endDisplay != '') {
                        dateRange = `<= ${endDisplay}`;
                    }
                }
            }
            this.formGroup?.controls?.dateRange?.setValue(dateRange);
        }else{
            this.formGroup?.controls?.dateRange?.setValue("");
        }
        this.closePopUp();
    }

    toggle = () => {
        this.showPopOver = !this.showPopOver;
        this.isOutsideClick = !this.isOutsideClick;
        if (this.showPopOver) {
            this.frmDateRangePicker?.reset();
            this.frmDateRangePicker?.setValue({ startDate: this.startDate ? this.startDate : '', endDate: this.endDate ? this.endDate : '' });
            this.onPopupOpen.emit();
        }
    };

    closePopUp = () => {
        this.showPopOver = false;
        this.isOutsideClick = false;
    }

    clear = () => {
        this.frmDateRangePicker.reset();

        if (this.startDateContainer) {
            this.startDateContainer.selectedDate = null;
            this.startDateContainer.dateForm?.controls?.datePicker?.reset();
            this.startDateContainer.dateForm?.controls?.datePicker?.setErrors(null);
        }

        if (this.endDateContainer) {
            this.endDateContainer.selectedDate = null;
            this.endDateContainer.dateForm?.reset();
            this.endDateContainer.dateForm?.controls?.datePicker?.reset();
            this.endDateContainer.dateForm?.controls?.datePicker?.setErrors(null);
        }

        if (this.hideOnClear) {
            this.formGroup?.controls?.dateRange?.patchValue('');
            this.isOutsideClick = false;
            this.showPopOver = false;
            this.onClear.emit({ startDate: null, endDate: null });
        }

        if (!this.formGroup?.controls?.dateRange?.value) {
            this.startDate = null;
            this.endDate = null;
        }
    }

    isEndDateValid = true;
    isChildFormIsValid = (isValid: boolean) => {
        if (isValid) {
            this.frmDateRangePicker?.setErrors({ 'invalid': null })
            this.frmDateRangePicker?.updateValueAndValidity();
        } else {
            this.frmDateRangePicker?.setErrors({ 'invalid': true })
        }
    }

    apply = () => {
            this.startDate = this.frmDateRangePicker?.controls?.startDate?.value;
            this.endDate = this.frmDateRangePicker?.controls?.endDate?.value;
            let dateRange = '';
            if (this.startDate || this.endDate) {
                const startDisplay = this.startDate ? this.datepipe.transform(this.startDate, this.dateFormat) : '';
                const endDisplay = this.endDate ? this.datepipe.transform(this.endDate, this.dateFormat) : '';
                if (startDisplay != '' && endDisplay != '') {
                    dateRange = `${startDisplay} to ${endDisplay}`;
                } else {
                    if (startDisplay != '') {
                        dateRange = `>= ${startDisplay}`;
                    } else if (endDisplay != '') {
                        dateRange = `<= ${endDisplay}`;
                    }
                }                
            }
            this.formGroup?.controls?.dateRange?.setValue(dateRange);                        
            // If the date range is for schedule utilization, then we need to check if both the dates are valid
            if (this.isScheduleUtilization) {                
                if (this.startDate && this.endDate) {
                 this.closePopUp();
                }
            } else {
                this.closePopUp();
            }
            this.onApply.emit({ startDate: this.startDate, endDate: this.endDate });
    };

    onDateChange = (value, controlName) => {
        const startDateControlName = Object?.keys(this.frmDateRangePicker?.controls)[0];
        const endDateControlName = Object?.keys(this.frmDateRangePicker?.controls)[1];

        if (controlName == startDateControlName) {
            this.startDate = value;
            this.frmDateRangePicker?.patchValue({ startDate: value });
        } else if (controlName == endDateControlName) {
            this.endDate = value;
            this.frmDateRangePicker?.patchValue({ endDate: value });
        }

        this.startDateLessThenEndDate();
    }

    // Check if the from date is greator then to date
    startDateLessThenEndDate = () => {
        if (this.dateRangeValidator) {
            const endDateIsLess = moment(this.frmDateRangePicker?.controls?.startDate?.value)?.format('YYYY/MM/DD') > moment(this.frmDateRangePicker?.controls?.endDate?.value)?.format('YYYY/MM/DD');
            if (endDateIsLess) {
                this.frmDateRangePicker?.controls?.startDate?.setErrors({ 'invalidDateRange': true })
                this.frmDateRangePicker?.controls?.endDate?.setErrors({ 'invalidDateRange': true });
            } else {
                this.frmDateRangePicker?.controls?.startDate?.setErrors({ 'invalidDateRange': null });
                this.frmDateRangePicker?.controls?.startDate?.updateValueAndValidity();
                this.frmDateRangePicker?.controls?.endDate?.setErrors({ 'invalidDateRange': null });
                this.frmDateRangePicker?.controls?.endDate?.updateValueAndValidity();

            }
        }
    }

    //Event will call once we click on any document
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const clickedInside : boolean = this.elementRef?.nativeElement?.contains(event?.target);

        if(this.startDateContainer != undefined){
            if(!clickedInside){
                const isStartDatePickerOpen : boolean = this.startDateContainer?.datePickerComponent?.isOpen;
                const isEndDatePickerOpen : boolean = this.endDateContainer?.datePickerComponent?.isOpen;
                const selectedStartDate = this.startDateContainer?.selectedDate;
                const selectedEndDate = this.endDateContainer?.selectedDate;
                const isClickedOnCalenderDate : boolean = isNaN(Number((event?.target as HTMLSpanElement)?.innerText))

                if(this.hideOnClickOutSide){ //using for patient-grid date-range filters hiding
                    if(!isStartDatePickerOpen && !isEndDatePickerOpen && isClickedOnCalenderDate){
                        this.closePopUp();
                    }
                } else if(!isStartDatePickerOpen && !isEndDatePickerOpen && !selectedStartDate && !selectedEndDate && !(this.startDate && this.endDate)) {
                    this.closePopUp();
                    this.onClear.emit({ startDate: null, endDate: null });
                }
            }
        }
    }
}
