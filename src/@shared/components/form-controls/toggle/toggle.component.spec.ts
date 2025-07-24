import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AppToggleComponent } from './toggle.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { AppLabelComponent} from '../form-label/form-label.component';
import { By } from '@angular/platform-browser';
import {ElementRef} from '@angular/core';

describe('AppToggleComponent', () => {
    let component: AppToggleComponent;
    let fixture: ComponentFixture<AppToggleComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule],
            declarations: [AppToggleComponent, AppLabelComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppToggleComponent);
        component = fixture.componentInstance;
        component.id = 'testID';
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have an ID to match what is passed', () => {
        expect(component.id).toEqual('testID');
    });

    it('should be unchecked by default', () => {
        expect(component.isChecked).not.toBeTruthy();
    });

    it('should be checked when checked', () => {
        const input = fixture.debugElement.query(By.css('.checkbox')).nativeElement;
        expect(input.checked).toBe(false);
        component.isChecked = true;
        fixture.detectChanges();
        expect(input.checked).toEqual(true);
    });

    it('should be disabled', () => {
        const input = fixture.debugElement.query(By.css('.checkbox')).nativeElement;
        expect(input.disabled).toBe(false);
        component.isDisabled = true;
        fixture.detectChanges();
        expect(input.disabled).toBe(true);
    });

});
