import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoarSelectListWithGroupingComponent } from './soar-select-list-with-grouping.component';
import { EventEmitter } from '@angular/core';

describe('SoarListWithGroupingComponent', () => {
  let component: SoarSelectListWithGroupingComponent;
  let fixture: ComponentFixture<SoarSelectListWithGroupingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoarSelectListWithGroupingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SoarSelectListWithGroupingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('registerOnChange', () => {
    it('should set onchange event', () => {
      const event: EventEmitter<string> = new EventEmitter<string>();
      component.registerOnChange(event);
      expect(component.onChange).not.toBeNull();
    });
  });

  describe('registerOnTouched', () => {
    it('should set onTouched event', () => {
      const event: EventEmitter<string> = new EventEmitter<string>();
      component.registerOnTouched(event);
      expect(component.onTouched).not.toBeNull();
    });
  });

  describe('onLocationChange', () => {        
    it('should emit data on valueChange method', () => {
      const location = { NameLine1: 'aa', LocationId: 123 };
      component.selectedItemValueChange.emit = jasmine.createSpy();
      component.valueChange(location);            
      expect(component.selectedItemValueChange.emit).toHaveBeenCalledWith(location);
      expect(component.groupLocationForms.controls.selectedItem.value).toEqual(location);
    });        
  });
});
