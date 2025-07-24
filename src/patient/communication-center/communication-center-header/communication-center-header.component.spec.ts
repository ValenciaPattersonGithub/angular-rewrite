import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of, BehaviorSubject } from 'rxjs';
import { CommunicationCenterHeaderComponent } from './communication-center-header.component';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from 'src/configure-test-suite';

describe('CommunicationCenterHeaderComponent', () => {
  let component: CommunicationCenterHeaderComponent;
  let fixture: ComponentFixture<CommunicationCenterHeaderComponent>;
  const updatePatientCommSubjectMock = new BehaviorSubject<{}>(undefined);

  const mockPatientCommunicationCenterService: any = {
    createPatientCommunication: (a: any, b: any) => of({}),
    getPatientCommunicationByPatientId: (a: any) => of({}),
    createAccountNoteCommunication: (a: any, b: any) => of({}),
    updatePatientCommunication: (a: any, b: any) => of({}),
    setCommunicationEvent: (a: any) => of({}),
    getCommunicationEvent: () => of({}),
    patientDetail: of({}),
    updatePatientCommunications$: updatePatientCommSubjectMock
  };
  const mockRouteParams = {
    patientId: '4321',
    accountId: '1234',
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      // TranslateModule import required for components that use ngx-translate in the view or componenet code
      imports: [FormsModule, ReactiveFormsModule, TranslateModule.forRoot(), AppKendoUIModule, BrowserAnimationsModule],
      providers: [
        { provide: PatientCommunicationCenterService, useValue: mockPatientCommunicationCenterService },
        { provide: '$routeParams', useValue: mockRouteParams }
      ],
      declarations: [ CommunicationCenterHeaderComponent ]
    });
   });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationCenterHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
