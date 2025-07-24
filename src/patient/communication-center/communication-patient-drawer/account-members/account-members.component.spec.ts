import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AccountMembersComponent } from './account-members.component';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { of, throwError } from 'rxjs';
import { AgePipe } from 'src/@shared/pipes/age/age.pipe';
import { configureTestSuite } from 'src/configure-test-suite';

describe('AccountMembersComponent', () => {
    let component: AccountMembersComponent;
    let fixture: ComponentFixture<AccountMembersComponent>;
    let patientCommunicationService: any;

    const mockRouteParams = {
        patientId: '4321',
        accountId: '1234',
    };
    const mockTabLauncher = jasmine.createSpy();
    const mockPatientCommunicationCenterService: any = {
        getPatientCommunicationByPatientId: (a: any) => of([{}]),
        patientDetail: {
            Profile: {
                PersonAccountId: '1234'
            }
        },
        getPatientAccountOverviewByAccountId: (a: any) => of({})
    };
    const mockTostarfactory: any = {
        error: jasmine.createSpy().and.returnValue('Error Message'),
        success: jasmine.createSpy().and.returnValue('Success Message')
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: 'tabLauncher', useValue: mockTabLauncher },
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: 'toastrFactory', useValue: mockTostarfactory }
            ],
            declarations: [AccountMembersComponent, AgePipe],
            imports: [TranslateModule.forRoot()]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountMembersComponent);
        patientCommunicationService = TestBed.get(PatientCommunicationCenterService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('getPatientAccountOverview', () => {
        it('should call patientCommunicationCenterService.getPatientAccountOverviewByAccountId when getPatientAccountOverview called', () => {
            spyOn(patientCommunicationService, 'getPatientAccountOverviewByAccountId').and.callThrough();
            component.getPatientAccountOverview(mockPatientCommunicationCenterService.patientDetail.Profile.PersonAccountId)
            expect(patientCommunicationService.getPatientAccountOverviewByAccountId)
                .toHaveBeenCalledWith(mockPatientCommunicationCenterService.patientDetail.Profile.PersonAccountId);
        });

        it('should call getPatientAccountOverviewByAccountIdFailure when patientCommunicationCenterService.getPatientAccountOverviewByAccountId throw Error', () => {
            spyOn(patientCommunicationService, 'getPatientAccountOverviewByAccountId').and.returnValue(throwError('Error'));
            spyOn(component, 'getPatientAccountOverviewByAccountIdFailure').and.callThrough();
            component.getPatientAccountOverview(mockPatientCommunicationCenterService.patientDetail.Profile.PersonAccountId)
            expect(patientCommunicationService.getPatientAccountOverviewByAccountId)
                .toHaveBeenCalledWith(mockPatientCommunicationCenterService.patientDetail.Profile.PersonAccountId);
            expect(component.getPatientAccountOverviewByAccountIdFailure).toHaveBeenCalled();
        });
    });
});
