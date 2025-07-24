import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AppointmentDurationDropdownComponent } from './appointment-duration-dropdown.component';

import { configureTestSuite } from 'src/configure-test-suite';
import { AppointmentDurationService } from '../appointment-duration.service';

describe('AppointmentDurationDropdownComponent', () => {
    let component: AppointmentDurationDropdownComponent;
    let fixture: ComponentFixture<AppointmentDurationDropdownComponent>;

    // mock factories and other data

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [AppointmentDurationDropdownComponent],
            //imports: [],
            providers: [
                {
                    provide: AppointmentDurationService,
                    useValue: {}
                },
                {
                    provide: 'referenceDataService',
                    useValue: {}
                }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AppointmentDurationDropdownComponent);
        component = fixture.componentInstance;
        //
        component.appointmentDuration = {};
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    //    describe('ngOnInit', () => {
    //        beforeEach(() => {
    //        });
    //        it('should call ngOnInit', () => {
    //            component.ngOnInit();
    //        });

    //    });


});
