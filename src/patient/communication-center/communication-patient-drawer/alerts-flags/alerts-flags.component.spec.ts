import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TruncateTextPipe } from 'src/@shared/pipes/truncate/truncate-text.pipe';
import { AlertsFlagsComponent } from './alerts-flags.component';
import { TranslateModule } from '@ngx-translate/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { of, throwError } from 'rxjs';
import { configureTestSuite } from 'src/configure-test-suite';

describe('AlertsFlagsComponent', () => {
    let component: AlertsFlagsComponent;
    let fixture: ComponentFixture<AlertsFlagsComponent>;
    let patientCommunicationService: any;

    const mockStaticData = {
        AlertIcons: () => { }
    };
    const mockPatientCommunicationCenterService: any = {
        patientDetail: of({}),
        getPatientFlagsAndAlertsByPatientId: (a: any) => of({})
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
            declarations: [AlertsFlagsComponent, TruncateTextPipe],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: 'StaticData', useValue: mockStaticData },
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: 'toastrFactory', useValue: mockTostarfactory }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlertsFlagsComponent);
        patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('getPatientFlagsAndAlert', () => {
        it('should call patientCommunicationCenterService.getPatientFlagsAndAlertsByPatientId when getPatientFlagsAndAlert called', () => {
            spyOn(patientCommunicationService, 'getPatientFlagsAndAlertsByPatientId').and.callThrough();
            component.getPatientFlagsAndAlert(mockRouteParams.patientId)
            expect(patientCommunicationService.getPatientFlagsAndAlertsByPatientId)
                .toHaveBeenCalledWith(mockRouteParams.patientId);
        });

        it('should call getPatientFlagsAndAlertsByPatientIdFailure when patientCommunicationCenterService.getAdditionalInfoByPatientId throw Error', () => {
            spyOn(patientCommunicationService, 'getPatientFlagsAndAlertsByPatientId').and.returnValue(throwError('Error'));
            spyOn(component, 'getPatientFlagsAndAlertsByPatientIdFailure').and.callThrough();
            component.getPatientFlagsAndAlert(mockRouteParams.patientId)
            expect(patientCommunicationService.getPatientFlagsAndAlertsByPatientId)
                .toHaveBeenCalledWith(mockRouteParams.patientId);
            expect(component.getPatientFlagsAndAlertsByPatientIdFailure).toHaveBeenCalled();
        });
    });
});
