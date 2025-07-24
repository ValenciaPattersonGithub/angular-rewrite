import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { PatientContactDetailsComponent } from './patient-contact-details.component';
import { MockRepository } from 'src/patient/patient-profile/patient-profile-mock-repo';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs';

describe('PatientContactDetailsComponent', () => {
    let component: PatientContactDetailsComponent;
    let fixture: ComponentFixture<PatientContactDetailsComponent>;
    let patSecurityService: any;
    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { }
    };
    const mockFeatureFlagService = {
        getOnce$: jasmine.createSpy('getOnce$').and.returnValue(of(true))
    };
    let mockRepo;
    beforeEach(async () => {
        mockRepo = MockRepository();
        await TestBed.configureTestingModule({
            declarations: [PatientContactDetailsComponent, AppLabelComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: '$routeParams', useValue: mockRepo.mockService },
                { provide: PatientCommunicationCenterService, useValue: mockRepo.mockService },
                { provide: 'toastrFactory', useValue: mockRepo.mockService },
                { provide: PatientRegistrationService, useValue: mockRepo.mockService },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
            ]

        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientContactDetailsComponent);
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
    });
});
