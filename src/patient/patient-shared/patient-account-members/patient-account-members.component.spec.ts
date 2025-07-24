import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AppLabelComponent } from 'src/@shared/components/form-controls/form-label/form-label.component';
import { configureTestSuite } from 'src/configure-test-suite';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { PatientHttpService } from 'src/patient/common/http-providers/patient-http.service';
import { PatientRegistrationService } from 'src/patient/common/http-providers/patient-registration.service';

import { PatientAccountMembersComponent } from './patient-account-members.component';

describe('PatientAccountMembersComponent', () => {
    let component: PatientAccountMembersComponent;
    let fixture: ComponentFixture<PatientAccountMembersComponent>;
    let patSecurityService: any;
    const mockpatSecurityService = {
        IsAuthorizedByAbbreviation: (authtype: string) => { }
    };
    const mockservice = {
        getRegistrationEvent: (a: any) => of({}),
        setRegistrationEvent: (a: any) => of({}),
        getAllAccountMembersByAccountId: (a: any) => of({}),
        getPatientInfoByPatientId: (a: any) => of({}),
        patientId: '4321',
        accountId: '1234',
    };

    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [PatientAccountMembersComponent, AppLabelComponent],
            providers: [
                { provide: PatientRegistrationService, useValue: mockservice },
                { provide: 'tabLauncher', useValue: mockservice },
                { provide: PatientHttpService, useValue: mockservice },
                { provide: PatientCommunicationCenterService, useValue: mockservice },
                { provide: '$routeParams', useValue: mockservice },
                { provide: 'patSecurityService', useValue: mockpatSecurityService },

            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientAccountMembersComponent);
        component = fixture.componentInstance;
        patSecurityService = TestBed.get('patSecurityService');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('authAccess', () => {
        it('should call authAccess and set value true to hasViewAccess', () => {
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(true);
            component.authAccess();
            expect(component.hasViewAccess).toEqual(true);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.viewAuthAbbreviation);
            expect(component.viewAuthAbbreviation).toEqual("soar-per-perdem-add");
        });
        it('should call authAccess and set value false to hasViewAccess',()=>{
            spyOn(patSecurityService, 'IsAuthorizedByAbbreviation').and.returnValue(false);
            component.authAccess();
            expect(component.hasViewAccess).toEqual(false);
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith(component.viewAuthAbbreviation);
            expect(component.viewAuthAbbreviation).toEqual("soar-per-perdem-add");
        });
    });
});
