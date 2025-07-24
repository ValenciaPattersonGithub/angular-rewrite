import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { PinnedAppointmentCardComponent } from './pinned-appointment-card.component';

import { configureTestSuite } from 'src/configure-test-suite';

describe('PinnedAppointmentCardComponent', () => {
    let component: PinnedAppointmentCardComponent;
    let fixture: ComponentFixture<PinnedAppointmentCardComponent>;

    // mock factories and other data

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [PinnedAppointmentCardComponent],
            imports: [],
            providers: [
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PinnedAppointmentCardComponent);
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
