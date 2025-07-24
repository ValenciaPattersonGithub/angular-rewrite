import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { AppointmentStatusCardDropdownComponent } from './appointment-status-card-dropdown.component';

import { configureTestSuite } from 'src/configure-test-suite';

describe('AppointmentTypesDropdownComponent', () => {
    let component: AppointmentStatusCardDropdownComponent;
    let fixture: ComponentFixture<AppointmentStatusCardDropdownComponent>;

    // mock factories and other data

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [AppointmentStatusCardDropdownComponent],
            imports: [],
            providers: [
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppointmentStatusCardDropdownComponent);
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
