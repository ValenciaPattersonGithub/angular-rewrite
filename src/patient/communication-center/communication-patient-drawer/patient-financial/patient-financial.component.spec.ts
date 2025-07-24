import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { PatientFinancialComponent } from './patient-financial.component';
import { of, throwError } from 'rxjs';
import { configureTestSuite } from 'src/configure-test-suite';

describe('PatientFinancialComponent', () => {
    let component: PatientFinancialComponent;
    let fixture: ComponentFixture<PatientFinancialComponent>;
    let patientCommunicationService: any;

    const mockRouteParams = {
        patientId: '4321',
        accountId: '1234',
    };
    const mockPatientCommunicationCenterService: any = {
        getPatientDiscountByPatientId: (a: any) => of({}),
    };
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [PatientFinancialComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: 'toastrFactory', useValue: mockTostarfactory }
            ],
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientFinancialComponent);
        patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('getPatientDiscount', () => {
        it('should call patientCommunicationCenterService.getPatientDiscountByPatientId when getPatientDiscount called', () => {
            spyOn(patientCommunicationService, 'getPatientDiscountByPatientId').and.callThrough();
            component.patientProfile = {
                AccountId: '98BFA2C2-8DB8-46AC-AA01-2E2144613054'
            };
            component.getPatientDiscount(mockRouteParams.patientId)
            expect(patientCommunicationService.getPatientDiscountByPatientId)
                .toHaveBeenCalledWith(mockRouteParams.patientId);
        });

        it('should call getPatientDiscountByPatientIdFailure when patientCommunicationCenterService.getPatientDiscountByPatientId throw Error', () => {
            spyOn(patientCommunicationService, 'getPatientDiscountByPatientId').and.returnValue(throwError('Error'));
            spyOn(component, 'getPatientDiscountByPatientIdFailure').and.callThrough();
            component.patientProfile = {
                AccountId: '98BFA2C2-8DB8-46AC-AA01-2E2144613054'
            };
            component.getPatientDiscount(mockRouteParams.patientId);
            expect(patientCommunicationService.getPatientDiscountByPatientId)
                .toHaveBeenCalledWith(mockRouteParams.patientId);
            expect(component.getPatientDiscountByPatientIdFailure).toHaveBeenCalled();
        });
    });
});
