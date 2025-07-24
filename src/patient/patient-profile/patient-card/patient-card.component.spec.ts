import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { PatientCardComponent } from './patient-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { DrawerAppointmentCardsComponent } from 'src/scheduling/appointments/communication-appointments/drawer-appointment-cards/drawer-appointment-cards.component';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { DatePipe } from '@angular/common';
import { MockRepository } from 'src/patient/patient-profile/patient-profile-mock-repo';
import { BlueImagingService } from '../../imaging/services/blue.service';
import { ImagingMasterService } from '../../imaging/services/imaging-master.service';
import { AppointmentStatusHandlingService } from 'src/scheduling/appointment-statuses/appointment-status-handling.service';
import { FeatureFlagService } from '../../../featureflag/featureflag.service';
import { of } from 'rxjs';

describe('PatientCardComponent', () => {
    let component: PatientCardComponent;
    let fixture: ComponentFixture<PatientCardComponent>;
    let patSecurityService: any;
    let blueImagingService: any;
    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { }
    };
    const mockBlueImagingService = {

    };
    let mockRepo;
    const mockFeatureFlagService = {
        getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(
            of({
                Value: []
            })),
    };


    beforeEach(async () => {
        mockRepo = MockRepository();
        await TestBed.configureTestingModule({
            declarations: [PatientCardComponent, AppLabelComponent, DrawerAppointmentCardsComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: '$routeParams', useValue: mockRepo.mockService },
                { provide: PatientCommunicationCenterService, useValue: mockRepo.mockService },
                { provide: PatientHttpService, useValue: mockRepo.mockService },
                { provide: 'toastrFactory', useValue: mockRepo.mockService },
                { provide: 'TimeZoneFactory', useValue: mockRepo.mockService },
                { provide: 'ModalDataFactory', useValue: mockRepo.mockService },
                { provide: 'ModalFactory', useValue: mockRepo.mockService },
                { provide: 'PatientValidationFactory', useValue: mockRepo.mockService },
                { provide: 'ListHelper', useValue: mockRepo.mockService },
                { provide: AppointmentStatusHandlingService, useValue: mockRepo.mockService },
                { provide: 'AppointmentStatusDataService', useValue: mockRepo.mockService },
                { provide: 'tabLauncher', useValue: mockRepo.mockService },
                { provide: 'locationService', useValue: mockRepo.mockService },
                { provide: 'FeatureService', useValue: mockRepo.mockService },
                { provide: 'ScheduleServices', useValue: mockRepo.mockService },
                { provide: 'AppointmentViewVisibleService', useValue: mockRepo.mockService },
                { provide: 'AppointmentViewDataLoadingService', useValue: mockRepo.mockService },
                { provide: DatePipe, useValue: mockRepo.mockService },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: BlueImagingService, useValue: mockRepo.mockService },
                { provide: ImagingMasterService, useValue: mockRepo.mockService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },

            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientCardComponent);
        component = fixture.componentInstance;
        patSecurityService = TestBed.get('patSecurityService');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('authAccess', () => {
        it('should call authAccess and set value true to hasEditAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            component.authAccess();
            expect(component.hasEditAccess).toEqual(true);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.editAuthAbbreviation);
            expect(component.editAuthAbbreviation).toEqual("soar-per-perdem-modify");
        });
        it('should call authAccess and set value false to hasEditAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(false);
            component.authAccess();
            expect(component.hasEditAccess).toEqual(false);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.editAuthAbbreviation);
            expect(component.editAuthAbbreviation).toEqual("soar-per-perdem-modify");
        });
        it('should call authAccess and set value true to hasAppointmentEditAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            component.authAccess();
            expect(component.hasAppointmentEditAccess).toEqual(true);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.editAppointmentAbbreviation);
            expect(component.editAppointmentAbbreviation).toEqual("soar-sch-sptapt-edit");
        });
        it('should call authAccess and set value false to hasAppointmentEditAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(false);
            component.authAccess();
            expect(component.hasAppointmentEditAccess).toEqual(false);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.editAppointmentAbbreviation);
            expect(component.editAppointmentAbbreviation).toEqual("soar-sch-sptapt-edit");
        });
    });
});
