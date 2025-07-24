import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CommunicationCenterFilterbarComponent } from './communication-center-filterbar.component';
import { AppSelectComponent } from 'src/@shared/components/form-controls/select-list/select-list.component';
import { FormsModule } from '@angular/forms';
import { of, BehaviorSubject } from 'rxjs';
import { PatientCommunicationCenterService } from 'src/patient/common/http-providers/patient-communication-center.service';
import { AppDatePickerComponent } from 'src/@shared/components/form-controls/date-picker/date-picker.component';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { configureTestSuite } from 'src/configure-test-suite';
import { AppLabelComponent } from '../../../@shared/components/form-controls/form-label/form-label.component';

describe('CommunicationCenterFilterbarComponent', () => {
  let component: CommunicationCenterFilterbarComponent;
  let fixture: ComponentFixture<CommunicationCenterFilterbarComponent>;
  const subjectMock = new BehaviorSubject<{}>(null);
  const updatePatientCommSubjectMock = new BehaviorSubject<{}>(undefined);
  let sortList: Array<{ text: string; value: number }> = [];

  const mockPatientCommunicationCenterService: any = {
    createPatientCommunication: (a: any, b: any) => of({}),
    getPatientCommunicationByPatientId: (a: any) => of({}),
    createAccountNoteCommunication: (a: any, b: any) => of({}),
    toggleDrawer: (a: any) => {},
    updatePatientCommunication: (a: any, b: any) => of({}),
    setCommunicationEvent: (a: any) => of({}),
    updatePatientCommunications$: updatePatientCommSubjectMock,
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      // TranslateModule import required for components that use ngx-translate in the view or componenet code
      imports: [FormsModule, TranslateModule.forRoot(), AppKendoUIModule],
      providers: [
        {
          provide: PatientCommunicationCenterService,
          useValue: mockPatientCommunicationCenterService,
        },
      ],
      declarations: [
        CommunicationCenterFilterbarComponent,
        AppSelectComponent,
        AppDatePickerComponent,
        AppLabelComponent,
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunicationCenterFilterbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('getSorts', () => {
    it('should populate sortList', () => {
      component.getSorts();
      sortList = component.sortList;
      expect(sortList).toBeDefined();
    });
  });
});
