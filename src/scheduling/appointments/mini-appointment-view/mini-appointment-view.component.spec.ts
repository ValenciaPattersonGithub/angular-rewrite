import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { MiniAppointmentViewComponent } from './mini-appointment-view.component';

import { configureTestSuite } from 'src/configure-test-suite';

describe('MiniAppointmentViewComponent', () => {
    let component: MiniAppointmentViewComponent;
    let fixture: ComponentFixture<MiniAppointmentViewComponent>;

    // mock factories and other data

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [MiniAppointmentViewComponent],
            imports: [],
            providers: [
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MiniAppointmentViewComponent);
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
