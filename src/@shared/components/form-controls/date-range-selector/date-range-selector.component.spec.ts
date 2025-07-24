import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DateRangeSelectorComponent } from './date-range-selector.component';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ElementRef } from '@angular/core';
import { CommonFormatterService } from 'src/@shared/filters/common-formatter.service';
import { AppDateSelectorComponent } from '../../MigrationTransit/app-date-selector/app-date-selector.component';

const datePipe = {
  transform: (res) => { return res }
};

export class mockElementRef extends ElementRef {
  nativeElement: {
    classList: {
      contains: () => false
    }
  }
}

const mockCommonFormatterService = {
  commonDateFormat: "MM/DD/YYYY"
}

describe('DateRangeSelectorComponent', () => {
  let component: DateRangeSelectorComponent;
  let fixture: ComponentFixture<DateRangeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateRangeSelectorComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        DatePipe,
        FormBuilder,
        { provide: ElementRef, useClass: mockElementRef },
        { provide: CommonFormatterService, useValue: mockCommonFormatterService }
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateRangeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('registerOnTouched', () => {
    component.registerOnTouched('');
    expect(component.onTouched).toEqual('')
  });

  it('registerOnChange', () => {
    component.registerOnChange('');
    expect(component.onChange).toEqual('')
  });

  describe('ngOnInit ->', () => {
    it('should set date range', () => {
      component.startDate = new Date('2023-01-01');
      component.endDate = new Date('2023-02-01');

      component.ngOnInit();

      expect(component.frmDateRangePicker?.controls?.startDate?.value).toEqual(component.startDate);
      expect(component.frmDateRangePicker?.controls?.endDate?.value).toEqual(component.endDate);
    });

    it('should clear value frmDateRangePicker is null', () => {
      component.requiredBothDates = true
      component.frmDateRangePicker?.controls?.startDate?.setValue(null);
      component.frmDateRangePicker?.controls?.endDate?.setValue(null);

      component.ngOnInit();

      expect(component.formGroup?.controls?.dateRange?.value).toEqual("");
    });
  });

  describe('OnDocumentClick ->', () => {
    it('should call closePopUp method when clicking outside without open pickers or selected dates for patient-grid', () => {      
      TestBed.inject(ElementRef);
      const mockStartDateContainer = {
        datePickerComponent : {
          isOpen : false
        },
        selectedDate : new Date('2023-01-01')
      }
      
      const mockEndtDateContainer = {
        datePickerComponent : {
          isOpen : false
        },
        selectedDate : new Date('2023-01-01')
      }

      component.startDateContainer = mockStartDateContainer as AppDateSelectorComponent;
      component.endDateContainer = mockEndtDateContainer as AppDateSelectorComponent

      spyOn(component, 'closePopUp');  
      document.dispatchEvent(new MouseEvent('click'));
      expect(component.closePopUp).toHaveBeenCalled();
    });

    it('should call closePopUp method when clicking outside and dates are not selected for schedule utilization', () => {      
      TestBed.inject(ElementRef);
      component.hideOnClickOutSide = false;
      const mockStartDateContainer = {
        datePickerComponent : {
          isOpen : false
        },
        selectedDate : null
      }
      
      const mockEndtDateContainer = {
        datePickerComponent : {
          isOpen : false
        },
        selectedDate : null
      }

      component.startDateContainer = mockStartDateContainer as AppDateSelectorComponent;
      component.endDateContainer = mockEndtDateContainer as AppDateSelectorComponent

      spyOn(component, 'closePopUp');  
      document.dispatchEvent(new MouseEvent('click'));
      expect(component.closePopUp).toHaveBeenCalled();
    });
  });

  describe('onDateChange ->', () => {
    it('should update startDate with provided date', () => {
      const value = new Date('2022-01-01');
      component.onDateChange(value, "startDate");
      expect(component.frmDateRangePicker?.controls?.startDate?.value).toBe(value);
    });

    it('should update endDate with provided date', () => {
      const value = new Date('2022-01-01');
      component.onDateChange(value, "endDate");
      expect(component.frmDateRangePicker?.controls?.endDate?.value).toBe(value);
    });

  });

  describe('closePopUp ->', () => {
    it('should close the pop up', () => {
      component.closePopUp();
      expect(component.showPopOver).toEqual(false);
      expect(component.isOutsideClick).toEqual(false);
    });
  });

  describe('toggle ->', () => {
    it('should update showPopOver to true', () => {
      component.showPopOver = false;
      component.startDate = new Date();
      component.endDate = new Date();
      component.frmDateRangePicker = new FormGroup({
        startDate: new FormControl(),
        endDate: new FormControl()
      })
      component.toggle();
      expect(component.showPopOver).toEqual(true);
    });
  });

  describe('clear ->', () => {
    it('should reset both forms on clear', () => {
      component.startDate = new Date();
      component.endDate = new Date(); 
      component.formGroup.controls.dateRange.patchValue({ dateRange: '2022-01-01 2022-01-02' });
      
      component.clear();
      expect(component.frmDateRangePicker?.controls?.startDate?.value).toBeNull();
      expect(component.frmDateRangePicker?.controls?.endDate?.value).toBeNull();
    });

    it('should hide popover when hideOnClear is true', () => {
      component.hideOnClear = true;
      component.showPopOver = true; 
      component.clear();
      expect(component.showPopOver).toBeFalsy();
    });
  });

  describe('isChildFormIsValid ->', () => {

    it('should set start date valid when the date is valid', () => {
      component.frmDateRangePicker = new FormGroup({
        startDate: new FormControl(),
        endDate: new FormControl()
      })
      component.isChildFormIsValid(true);
      expect(component.frmDateRangePicker?.valid).toEqual(true);
    });

    it('should set start date not valid when the date is Invalid', () => {
      component.frmDateRangePicker = new FormGroup({
        startDate: new FormControl(),
        endDate: new FormControl()
      })
      component.isChildFormIsValid(false);
      expect(component.frmDateRangePicker?.valid).toEqual(false);
    });

    it('should set end date valid when the date is Invalid', () => {
      component.frmDateRangePicker = new FormGroup({
        startDate: new FormControl(),
        endDate: new FormControl()
      })
      component.isChildFormIsValid(true);
      expect(component.frmDateRangePicker?.controls?.endDate?.valid).toEqual(true);
    });

    it('should set end date not valid when the date is Invalid', () => {
      component.frmDateRangePicker = new FormGroup({
        startDate: new FormControl(),
        endDate: new FormControl()
      })
      component.isChildFormIsValid(false);
      expect(component.frmDateRangePicker?.valid).toEqual(false);
    });

  });

  describe('apply ->', () => {    
    it('should update date range with both from and to values', () => {
      component.frmDateRangePicker = new FormGroup({
        startDate: new FormControl(),
        endDate: new FormControl()
      })
      component.frmDateRangePicker.patchValue({
        startDate: new Date("07/20/2023"),
        endDate: new Date("07/25/2023")
      });

      const spy = spyOn(datePipe, 'transform').and.returnValue("07/20/2023");
      datePipe.transform(component.startDate);
      datePipe.transform(component.endDate);
      component.apply();
      expect(component.formGroup.controls.dateRange.value).toBe('07/20/2023 to 07/25/2023');
      expect(spy).toHaveBeenCalled();
    });

    it('should update date range with only start date', () => {
      component.frmDateRangePicker = new FormGroup({
        startDate: new FormControl(),
        endDate: new FormControl()
      })
      component.frmDateRangePicker.patchValue({
        startDate: new Date("07/20/2023")
      });

      const spy = spyOn(datePipe, 'transform').and.returnValue("07/20/2023");
      datePipe.transform(component.startDate);
      datePipe.transform(component.endDate);
      component.apply();
      expect(component.formGroup.controls.dateRange.value).toBe('>= 07/20/2023');
      expect(spy).toHaveBeenCalled();
    });

    it('should update date range with only end date', () => {
      component.frmDateRangePicker = new FormGroup({
        startDate: new FormControl(),
        endDate: new FormControl()
      })
      component.frmDateRangePicker.patchValue({
        endDate: new Date("07/25/2023")
      });

      const spy = spyOn(datePipe, 'transform').and.returnValue("07/20/2023");
      datePipe.transform(component.startDate);
      datePipe.transform(component.endDate);
      component.apply();
      expect(component.formGroup.controls.dateRange.value).toBe('<= 07/25/2023');
      expect(spy).toHaveBeenCalled();
    });

    it('should update date range empty when both dates are empty', () => {
      const spy = spyOn(datePipe, 'transform').and.returnValue("07/20/2023");
      datePipe.transform(component.startDate);
      datePipe.transform(component.endDate);
      component.apply();
      expect(component.formGroup.controls.dateRange.value).toBe('');
      expect(spy).toHaveBeenCalled();
    });

    it('should call closePopUp when isScheduleUtilization is true and startDate and endDate are defined', () => {
      component.frmDateRangePicker = new FormGroup({
        startDate: new FormControl('07/20/2023'),
        endDate: new FormControl('07/25/2023')
      })      
      spyOn(component, 'closePopUp');
      component.isScheduleUtilization = true;
      component.apply();
      expect(component.closePopUp).toHaveBeenCalled();
    });
  
    it('should call closePopUp when isScheduleUtilization is false', () => {
      component.isScheduleUtilization = false;
      spyOn(component, 'closePopUp');  
      component.apply();
      expect(component.closePopUp).toHaveBeenCalled();
    });
  });

  describe('startDateLessThenEndDate ->', () => {
    it('should set form valid  if "endDate" is less then "startDate"', () => {
      component.dateRangeValidator = true;
      component.frmDateRangePicker = new FormGroup({
        startDate: new FormControl(),
        endDate: new FormControl()
      })

      component.frmDateRangePicker.patchValue({
        startDate: new Date("07/20/2023"),
        endDate: new Date("07/25/2023")
      });

      component.startDateLessThenEndDate();
      expect(component.frmDateRangePicker?.valid).toBeTruthy(true);
    });

    it('should set form invalid if "endDate" is less then "startDate"', () => {
      component.dateRangeValidator = true;
      component.frmDateRangePicker = new FormGroup({
        startDate: new FormControl(),
        endDate: new FormControl()
      })

      component.frmDateRangePicker.patchValue({
        startDate: new Date("07/30/2023"),
        endDate: new Date("07/25/2023")
      });

      component.startDateLessThenEndDate();
      expect(component.frmDateRangePicker?.invalid).toBeTruthy(true);
    });
  });

});
