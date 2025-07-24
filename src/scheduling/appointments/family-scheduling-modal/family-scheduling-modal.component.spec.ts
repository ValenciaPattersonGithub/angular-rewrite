import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilySchedulingModalComponent } from './family-scheduling-modal.component';

import { ScheduleDisplayPatientService } from 'src/scheduling/common/providers/schedule-display-patient.service';
import { LocationHttpService } from '../../../practices/http-providers/location-http.service';
import { LocationsService } from '../../../practices/providers/locations.service';
import { LocationTimeService } from '../../../practices/common/providers/location-time.service';
import { ScheduleAppointmentHttpService } from '../../common/http-providers';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { TranslateService } from '@ngx-translate/core';
import { FamilySchedulingModalServiceService } from './family-scheduling-modal-service.service';
import { HttpClient } from '@angular/common/http';
import { MicroServiceApiService } from 'src/security/providers';

import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';

describe('FamilySchedulingModalComponent', () => {
    let component: FamilySchedulingModalComponent;
    let fixture: ComponentFixture<FamilySchedulingModalComponent>;

    const mockService = {
        // define called methods
    };


    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot(), OverlayModule],
            declarations: [FamilySchedulingModalComponent],
            providers: [
                { provide: ScheduleDisplayPatientService, useValue: mockService },
                { provide: LocationHttpService, useValue: mockService },
                { provide: LocationsService, useValue: mockService },
                { provide: LocationTimeService, useValue: mockService },
                { provide: ScheduleAppointmentHttpService, userValue: mockService },
                { provide: ConfirmationModalOverlayRef, useValue: mockService },
                { provide: ConfirmationModalService, useValue: mockService },
                { provide: TranslateService, useValue: mockService },
                { provide: FamilySchedulingModalServiceService, useValue: mockService },
                { provide: 'referenceDataService', useValue: mockService },
                { provide: 'CommonServices', useValue: mockService },
                { provide: 'toastrFactory', useValue: mockService },
                { provide: 'locationService', useValue: mockService },
                { provide: 'ClipboardAppointmentUpdateService', useValue: mockService },
                { provide: HttpClient, useValue: mockService },
                { provide: MicroServiceApiService, useValue: mockService },
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(FamilySchedulingModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
