import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ButtonOnoffComponent } from './button-onoff.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { AppLabelComponent } from '../form-controls/form-label/form-label.component';
import { By } from '@angular/platform-browser';
import { ElementRef } from '@angular/core';
import { ExpectedConditions } from 'protractor';

describe('AppButtonOnOff', () => {
  let component: ButtonOnoffComponent;
  let fixture: ComponentFixture<ButtonOnoffComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ButtonOnoffComponent, AppLabelComponent],
    });
  });

  beforeEach(() => {
    component = new ButtonOnoffComponent();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggleSelection ->', () => {
    it('should set isChecked to true when it is false', () => {
      component.isChecked = false;

      component.toggleSelection();

      expect(component.isChecked).toBe(true);
    });

    it('should set isChecked to false when it is true', () => {
      component.isChecked = true;

      component.toggleSelection();

      expect(component.isChecked).toBe(false);
    });

    it('should call checkChanged.emit', () => {
      component.isChecked = true;
      component.checkChanged.emit = jasmine.createSpy();

      component.toggleSelection();

      expect(component.checkChanged.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('ngOnDestroy ->', () => {
    it('should call checkChanged.unsubscribe', () => {
      component.checkChanged.unsubscribe = jasmine.createSpy();

      component.ngOnDestroy();

      expect(component.checkChanged.unsubscribe).toHaveBeenCalled();
    });
  });
});
