import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';

import { CommunicationHoverMenuComponent } from './communication-hover-menu.component';

describe('CommunicationHoverMenuComponent', () => {
    let component: CommunicationHoverMenuComponent;
    let fixture: ComponentFixture<CommunicationHoverMenuComponent>;
    const mockTabLauncher = jasmine.createSpy();
    const mockRouteParams = {
        patientId: '4321'
    };
    const mockPatientCommunicationCenterService: any = {
        setCommunicationEvent: (a: any) => { }
    };
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            declarations: [CommunicationHoverMenuComponent],
            providers: [
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: 'tabLauncher', useValue: mockTabLauncher },
                { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationHoverMenuComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
