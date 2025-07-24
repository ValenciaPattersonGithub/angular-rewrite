import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NumericRangeSelectorComponent } from './numeric-range-selector.component';

describe('NumericRangeSelectorComponent', () => {
  let component: NumericRangeSelectorComponent;
  const mockTranslateService = {
    instant: () => 'translated text'
  };  
  let fixture: ComponentFixture<NumericRangeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NumericRangeSelectorComponent],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule, FormsModule],
      providers: [{ provide: TranslateService, useValue: mockTranslateService }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumericRangeSelectorComponent);
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

  describe('apply', () => {
    it('should set selectedRange an empty if from-to values are null', () => {
      component.frmNumericRangePicker.get('fromValue').setValue(null);
      component.frmNumericRangePicker.get('toValue').setValue(null);
      component.apply();
      expect(component.formGroup.get('numberRangePicker').value).toBe('');
    });

    it('should set selectedRange based on current from-to values', () => {
      component.frmNumericRangePicker.get('fromValue').setValue(2);
      component.frmNumericRangePicker.get('toValue').setValue(10);
      component.apply();
      expect(component.formGroup.get('numberRangePicker').value).toBe('>= 2 and <= 10');
      expect(component.showPopOverNumeric).toBeFalsy();
    });

    it('should set only from Value', () => {
      component.frmNumericRangePicker.get('fromValue').setValue(10);
      component.apply();
      expect(component.formGroup.get('numberRangePicker').value).toBe('>= 10');
    });

    it('should set only two value', () => {
      component.frmNumericRangePicker.get('toValue').setValue(5);
      component.apply();
      expect(component.formGroup.get('numberRangePicker').value).toBe('<= 5');
    });
  });

  describe('clear', () => {
    it('should reset all values to null on clear call', () => {
      component.frmNumericRangePicker.get('fromValue').setValue(2);
      component.frmNumericRangePicker.get('toValue').setValue(10); 
      component.clear();
      expect(component.frmNumericRangePicker.get('fromValue').value).toBeNull();
      expect(component.frmNumericRangePicker.get('toValue').value).toBeNull(); 
    });
  });

  describe('toggle', () => {
    it('should set showPopOverNumeric to true', () => {
      component.showPopOverNumeric = false;
      component.toggle(true);
      expect(component.showPopOverNumeric).toBeTruthy();
    });
  });

});
