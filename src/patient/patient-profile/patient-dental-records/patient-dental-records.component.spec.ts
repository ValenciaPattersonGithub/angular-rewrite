import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';
import { PatientDentalRecordsComponent } from './patient-dental-records.component';
import { PhoneNumberPipe } from 'src/@shared/pipes/phone-number/phone-number.pipe';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { MockRepository } from 'src/patient/patient-profile/patient-profile-mock-repo';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

describe('PatientDentalRecordsComponent', () => {
    let component: PatientDentalRecordsComponent;
    let fixture: ComponentFixture<PatientDentalRecordsComponent>;
    let patientHttpService: PatientHttpService;
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
            declarations: [PatientDentalRecordsComponent, PhoneNumberPipe, AppLabelComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: 'referenceDataService', useValue: mockRepo.mockService },
                { provide: '$routeParams', useValue: mockRepo.mockService },
                { provide: PatientHttpService, useValue: mockRepo.mockService },
                { provide: PatientRegistrationService, useValue: mockRepo.mockService },
                { provide: 'toastrFactory', useValue: mockRepo.mockService },
                { provide: 'StaticData', useValue: mockRepo.mockService },
                { provide: PatientCommunicationCenterService, useValue: mockRepo.mockService },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientDentalRecordsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        patientHttpService = TestBed.inject(PatientHttpService);
        patSecurityService = TestBed.get('patSecurityService');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('getDentalOfficeRecord', () => {
        it('should call patientHttpService.getPatientDentalRecord when getDentalOfficeRecord called', () => {
            spyOn(patientHttpService, 'getPatientDentalRecord').and
                .returnValue(of(mockRepo.mockDentalOfficeRecord));
            component.getDentalOfficeRecord(mockRepo.mockService.patientId);
            expect(patientHttpService.getPatientDentalRecord).toHaveBeenCalled();
            expect(component.dentalOffice).toEqual(mockRepo.mockDentalOfficeRecord);
            expect(component.address)
                .toBe(mockRepo.mockDentalOfficeRecord.Address.AddressLine1 + ' '
                    + mockRepo.mockDentalOfficeRecord.Address.AddressLine2 + ' ');
            expect(component.displayCityStateZipCode)
                .toBe(mockRepo.mockDentalOfficeRecord.Address.City + ', '
                    + mockRepo.mockDentalOfficeRecord.Address.State + ' ' + mockRepo.mockDentalOfficeRecord.Address.ZipCode);
        });
        it('should call getPatientDentalRecordPatientIdFailure when patientHttpService.getPatientDentalRecord throw Error', () => {
            spyOn(patientHttpService, 'getPatientDentalRecord').and.returnValue(throwError(() => new Error('Error')));
            spyOn(component, 'getPatientDentalRecordPatientIdFailure').and.callThrough();
            component.getDentalOfficeRecord(mockRepo.mockService.patientId);
            expect(patientHttpService.getPatientDentalRecord).toHaveBeenCalled();
            expect(component.getPatientDentalRecordPatientIdFailure).toHaveBeenCalled();
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
