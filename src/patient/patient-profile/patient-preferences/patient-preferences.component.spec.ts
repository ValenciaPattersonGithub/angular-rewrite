import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { PatientDetailService } from 'src/patient/patient-detail/services/patient-detail.service';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { PatientPreferencesComponent } from './patient-preferences.component';
import { MockRepository } from 'src/patient/patient-profile/patient-profile-mock-repo';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

describe('PatientPreferencesComponent', () => {
    let component: PatientPreferencesComponent;
    let fixture: ComponentFixture<PatientPreferencesComponent>;
    let patientCommunicationCenterService: PatientCommunicationCenterService;
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
            declarations: [PatientPreferencesComponent, AppLabelComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: 'referenceDataService', useValue: mockRepo.mockService },
                { provide: '$routeParams', useValue: mockRepo.mockService },
                { provide: PatientCommunicationCenterService, useValue: mockRepo.mockService },
                { provide: PatientDetailService, useValue: mockRepo.mockService },
                { provide: PatientRegistrationService, useValue: mockRepo.mockService },
                { provide: 'toastrFactory', useValue: mockRepo.mockService },
                { provide: 'StaticData', useValue: mockRepo.mockService },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
                
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientPreferencesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        patientCommunicationCenterService = TestBed.inject(PatientCommunicationCenterService);
        patSecurityService = TestBed.get('patSecurityService');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('getAdditionalInfo', () => {
        it('should call patientCommunicationCenterService.getAdditionalInfoByPatientId when getAdditionalInfo called', () => {
            spyOn(patientCommunicationCenterService, 'getAdditionalInfoByPatientId').and
                .returnValue(of(mockRepo.mockAdditionalInfo));
            component.getAdditionalInfo(mockRepo.mockService.patientId);
            expect(patientCommunicationCenterService.getAdditionalInfoByPatientId).toHaveBeenCalled();
            expect(component.patientGroups).toEqual(mockRepo.mockAdditionalInfo.GroupDescription);
        });
        it('should call getAdditionalInfoByPatientIdFailure when patientCommunicationCenterService.getAdditionalInfoByPatientId throw Error', () => {
            spyOn(patientCommunicationCenterService, 'getAdditionalInfoByPatientId').and.returnValue(throwError(() => new Error('Error')));
            spyOn(component, 'getAdditionalInfoByPatientIdFailure').and.callThrough();
            component.getAdditionalInfo(mockRepo.mockService.patientId);
            expect(patientCommunicationCenterService.getAdditionalInfoByPatientId).toHaveBeenCalled();
            expect(component.getAdditionalInfoByPatientIdFailure).toHaveBeenCalled();
        });
    });
    describe('getPatientDiscount', () => {
        it('should call patientCommunicationCenterService.getPatientDiscountByPatientId when getPatientDiscount called', () => {
            spyOn(patientCommunicationCenterService, 'getPatientDiscountByPatientId').and
                .returnValue(of(mockRepo.mockDiscount));
            component.getPatientDiscount(mockRepo.mockService.patientId);
            expect(patientCommunicationCenterService.getPatientDiscountByPatientId).toHaveBeenCalled();
            expect(component.patientDiscount).toEqual(mockRepo.mockDiscount.DiscountName);
        });
        it('should call getPatientDiscountByPatientIdFailure when patientCommunicationCenterService.getPatientDiscountByPatientId throw Error', () => {
            spyOn(patientCommunicationCenterService, 'getPatientDiscountByPatientId').and.returnValue(throwError(() => new Error('Error')));
            spyOn(component, 'getPatientDiscountByPatientIdFailure').and.callThrough();
            component.getPatientDiscount(mockRepo.mockService.patientId);
            expect(patientCommunicationCenterService.getPatientDiscountByPatientId).toHaveBeenCalled();
            expect(component.getPatientDiscountByPatientIdFailure).toHaveBeenCalled();
        });
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
