import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AdditionalInfoComponent } from './additional-info.component';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { of, throwError } from 'rxjs';
import { configureTestSuite } from 'src/configure-test-suite';

describe('AdditionalInfoComponent', () => {
    let component: AdditionalInfoComponent;
    let fixture: ComponentFixture<AdditionalInfoComponent>;
    let patientCommunicationService: any;

    const mockPatientCommunicationCenterService: any = {
        patientDetail: of({}),
        getAdditionalInfoByPatientId: (a: any) => of({})
    };
    const mockRouteParams = {
        patientId: '4321',
        accountId: '1234',
    };
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [AdditionalInfoComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: 'toastrFactory', useValue: mockTostarfactory }
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdditionalInfoComponent);
        patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('getAdditionalInfo', () => {
        it('should call patientCommunicationCenterService.getAdditionalInfoByPatientId when getPatientAccountOverview called', () => {
            spyOn(patientCommunicationService, 'getAdditionalInfoByPatientId').and.callThrough();
            component.getAdditionalInfo(mockRouteParams.patientId)
            expect(patientCommunicationService.getAdditionalInfoByPatientId)
                .toHaveBeenCalledWith(mockRouteParams.patientId);
        });

        it('should call getAdditionalInfoByPatientIdFailure when patientCommunicationCenterService.getAdditionalInfoByPatientId throw Error', () => {
            spyOn(patientCommunicationService, 'getAdditionalInfoByPatientId').and.returnValue(throwError('Error'));
            spyOn(component, 'getAdditionalInfoByPatientIdFailure').and.callThrough();
            component.getAdditionalInfo(mockRouteParams.patientId)
            expect(patientCommunicationService.getAdditionalInfoByPatientId)
                .toHaveBeenCalledWith(mockRouteParams.patientId);
            expect(component.getAdditionalInfoByPatientIdFailure).toHaveBeenCalled();
        });
    });
});
