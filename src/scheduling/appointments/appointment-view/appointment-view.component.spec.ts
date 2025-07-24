import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { AppointmentViewComponent } from './appointment-view.component';

import { configureTestSuite } from 'src/configure-test-suite';

describe('AppointmentViewComponent', () => {
    let component: AppointmentViewComponent;
    let fixture: ComponentFixture<AppointmentViewComponent>;

    // mock factories and other data

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [AppointmentViewComponent],
            imports: [],
            providers: [
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppointmentViewComponent);
        component = fixture.componentInstance;
        //
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        beforeEach(() => {
        });
        it('should call ngOnInit', () => {
            component.ngOnInit();
        });

    });


});
