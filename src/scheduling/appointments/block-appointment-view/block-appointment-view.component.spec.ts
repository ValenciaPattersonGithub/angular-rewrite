import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { BlockAppointmentViewComponent } from './block-appointment-view.component';

import { configureTestSuite } from 'src/configure-test-suite';

describe('BlockAppointmentViewComponent', () => {
    let component: BlockAppointmentViewComponent;
    let fixture: ComponentFixture<BlockAppointmentViewComponent>;

    // mock factories and other data

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [BlockAppointmentViewComponent],
            imports: [],
            providers: [
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BlockAppointmentViewComponent);
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
