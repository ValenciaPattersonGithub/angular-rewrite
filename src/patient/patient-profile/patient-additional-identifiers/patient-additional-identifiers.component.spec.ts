import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { MockRepository } from 'src/patient/patient-profile/patient-profile-mock-repo';
import { PatientAdditionalIdentifiersComponent } from './patient-additional-identifiers.component';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

describe('PatientAdditionalIdentifiersComponent', () => {
    let component: PatientAdditionalIdentifiersComponent;
    let fixture: ComponentFixture<PatientAdditionalIdentifiersComponent>;
    let patientHttpService: PatientHttpService;
    let patSecurityService: any;
    let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;
    
    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { }
    };
    let mockRepo;
    beforeEach(async () => {
        mockRepo = MockRepository();
        mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
        mockFeatureFlagService.getOnce$.and.returnValue(of(true));
        await TestBed.configureTestingModule({
            declarations: [PatientAdditionalIdentifiersComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: '$routeParams', useValue: mockRepo.mockService },
                { provide: PatientHttpService, useValue: mockRepo.mockService },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientAdditionalIdentifiersComponent);
        component = fixture.componentInstance;
        patientHttpService = TestBed.inject(PatientHttpService);
        patSecurityService = TestBed.get('patSecurityService');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('getAdditionalIdentifiers', () => {
        it('should call patientHttpService.getPatientAdditionalIdentifiers when getAdditionalIdentifiers called', () => {
            spyOn(patientHttpService, 'getPatientAdditionalIdentifiers').and
                .returnValue(of(mockRepo.mockPatientAdditionalIdentifiersList));
            component.getAdditionalIdentifiers(mockRepo.mockService.patientId);
            expect(patientHttpService.getPatientAdditionalIdentifiers).toHaveBeenCalled();
            expect(component.patientAdditionalIdentifiers).toEqual(mockRepo.mockPatientAdditionalIdentifiersList);
            expect(component.patientAdditionalIdentifiers.length).toEqual(mockRepo.mockPatientAdditionalIdentifiersList.length);
        });
        it('should call getPatientAdditionalIdentifiersByPatientIdFailure when patientHttpService.getPatientAdditionalIdentifiers throw Error', () => {
            spyOn(patientHttpService, 'getPatientAdditionalIdentifiers').and.returnValue(throwError(() => new Error('Error')));
            spyOn(component, 'getPatientAdditionalIdentifiersByPatientIdFailure').and.callThrough();
            component.getAdditionalIdentifiers(mockRepo.mockService.patientId);
            expect(patientHttpService.getPatientAdditionalIdentifiers).toHaveBeenCalled();
            expect(component.getPatientAdditionalIdentifiersByPatientIdFailure).toHaveBeenCalled();
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
