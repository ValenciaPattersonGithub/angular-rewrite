import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { AppointmentTypesDropdownComponent } from './appointment-types-dropdown.component';

import { configureTestSuite } from 'src/configure-test-suite';
import { AppointmentTypesService } from '../appointment-types.service';

describe('AppointmentTypesDropdownComponent', () => {
    let component: AppointmentTypesDropdownComponent;
    let fixture: ComponentFixture<AppointmentTypesDropdownComponent>;

    // mock factories and other data

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [AppointmentTypesDropdownComponent],
            //imports: [],
            providers: [
                {
                    provide: AppointmentTypesService,
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
        fixture = TestBed.createComponent(AppointmentTypesDropdownComponent);
        component = fixture.componentInstance;
        //
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // describe('ngOnInit', () => {
    //     beforeEach(() => {
    //     });
    //     it('should call ngOnInit', () => {
    //         component.ngOnInit();
    //     });

    // });


});
