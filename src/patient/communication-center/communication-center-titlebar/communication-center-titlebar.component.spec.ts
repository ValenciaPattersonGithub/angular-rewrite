import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommunicationCenterTitlebarComponent } from './communication-center-titlebar.component';
import { AppButtonComponent } from 'src/@shared/components/form-controls/button/button.component';
import { FormsModule } from '@angular/forms';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { of, BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';



describe('CommunicationCenterTitlebarComponent', () => {
    let component: CommunicationCenterTitlebarComponent;
    let fixture: ComponentFixture<CommunicationCenterTitlebarComponent>;
    let patSecurityService: any;
    let patientCommunicationCenterService: any;
    const updatePatientCommSubjectMock = new BehaviorSubject<{}>(undefined);

    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { }
    };
    const mockPatientCommunicationCenterService: any = {
        createPatientCommunication: (a: any, b: any) => of({}),
        getPatientCommunicationByPatientId: (a: any) => of({}),
        getCommunicationEvent: () => of({}),
        setCommunicationEvent: (a: any) => of({}),
        getPatientCommunicationToDoByPatientId: (a: any) => of([{}]),
        updatePatientCommunications$: updatePatientCommSubjectMock,
        GetPatientCommunicationTemplates: () => of({}),
        patientDetail: of({}),
        createAccountNoteCommunication: (a: any, b: any) => of({}),
        updatePatientCommunication: (a: any, b: any) => of({})
    };
    const mockRouteParams = {
        patientId: '4321',
        accountId: '1234',
    };
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, TranslateModule.forRoot()],
            providers: [
                { provide: 'patSecurityService', useValue: mockpatSecurityService },
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
                { provide: '$routeParams', useValue: mockRouteParams }
            ],
            declarations: [CommunicationCenterTitlebarComponent, AppButtonComponent]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationCenterTitlebarComponent);
        patSecurityService = TestBed.get('patSecurityService');
        patientCommunicationCenterService = TestBed.get(PatientCommunicationCenterService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
