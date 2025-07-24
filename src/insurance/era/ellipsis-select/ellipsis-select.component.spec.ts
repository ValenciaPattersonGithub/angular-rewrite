import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { configureTestSuite } from 'src/configure-test-suite';

import { EllipsisSelectComponent } from './ellipsis-select.component';

describe('EllipsisSelectComponent', () => {
    let component: EllipsisSelectComponent;
    let fixture: ComponentFixture<EllipsisSelectComponent>;

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [EllipsisSelectComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EllipsisSelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    describe('initialize', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('toggle', () => {
        it('should toggle isOpen', () => {
            expect(component.isOpen).toEqual(false);
            component.toggle();

            expect(component.isOpen).toEqual(true);
            component.toggle();

            expect(component.isOpen).toEqual(false);
        });
    });
    describe('select', () => {
        it('should toggle only if option is disabled', () => {
            component.functionCall.emit = jasmine.createSpy('functionCall.emit');
            component.select({ click: ()=>{}, disabled: true });

            expect(component.isOpen).toEqual(true);
            expect(component.functionCall.emit).not.toHaveBeenCalled();
        });

        it('should toggle and emit if option is not disabled', () => {
            component.functionCall.emit = jasmine.createSpy('functionCall.emit');
            component.refObject = {};
            component.select({ disabled: false, click: 'test' });

            expect(component.isOpen).toEqual(true);
            expect(component.functionCall.emit).toHaveBeenCalledWith({ func: 'test', ref: {} });
        });
    });
});
