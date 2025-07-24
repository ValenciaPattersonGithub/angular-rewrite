import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { ScheduleAppointmentCardComponent } from './schedule-appointment-card.component';

import { configureTestSuite } from 'src/configure-test-suite';

describe('ScheduleAppointmentCardComponent', () => {
    let component: ScheduleAppointmentCardComponent;
    let fixture: ComponentFixture<ScheduleAppointmentCardComponent>;

    // mock factories and other data

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [ScheduleAppointmentCardComponent],
            imports: [],
            providers: [
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ScheduleAppointmentCardComponent);
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
