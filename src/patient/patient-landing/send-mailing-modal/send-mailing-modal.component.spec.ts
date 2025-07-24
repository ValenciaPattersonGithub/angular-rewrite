import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SendMailingModalComponent } from './send-mailing-modal.component';
import { FormBuilder } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { BadgeFilterType } from 'src/patient/common/models/patient-location.model';
import { CommunicationType, MailingLabel, PatientEmptyGuid } from 'src/patient/common/models/enums/patient.enum';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { CommunicationTemplateModel } from 'src/@shared/models/send-mailing.model';
import { SoarSelectListComponent } from 'src/@shared/components/soar-select-list/soar-select-list.component';

const dialogContentInstance = {
  activeFltrTab: BadgeFilterType.AllPatients,
  activeGridDataCount: {
    allPatients: 100,
    appointments: 200,
    otherToDo: 300,
    preventiveCare: 400,
    treatmentPlans: 500
  }
}

const mockDialogRef = {
  close: () => { },
  open: () => { },
  content: {
    instance: dialogContentInstance
  }
}

const mockToastrFactory = {
  success: jasmine.createSpy('toastrFactory.success'),
  error: jasmine.createSpy('toastrFactory.error')
}

const mockCommTemplate: SoarResponse<CommunicationTemplateModel[]> = {
  Value: [
    { CommunicationTemplateId: 1, TemplateName: 'template101' },
    { CommunicationTemplateId: 2, TemplateName: 'template102' }
  ]
}

const mockPatientServices = {
  Patients: {
    get: jasmine.createSpy().and.callFake((array) => {
      return {
        then(callback) {
          callback(array);
        }
      };
    })
  },
  Communication: {
    getTemplatesByGroupId: jasmine.createSpy().and.callFake(() => {
      return {
        $promise: {
          then: (callback, errorCallback) => {
            callback(mockCommTemplate),
              errorCallback({ data: { message: 'error' } })
          }
        }
      }
    })
  },
}

const mockCategorySource = [
  { id: 1, tab: 0, name: 'Account' },
  { id: 3, tab: 2, name: 'Patient' },
  { id: 2, tab: 1, name: 'Appointments' },
  { id: 5, tab: 5, name: 'Other To Do' },
  { id: 4, tab: 7, name: 'Preventive Care' },
  { id: 5, tab: 6, name: 'Treatment Plans' }
]

describe('SendMailingModalComponent', () => {
  let component: SendMailingModalComponent;
  let fixture: ComponentFixture<SendMailingModalComponent>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        FormBuilder, TranslateService,
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'PatientServices', useValue: mockPatientServices }
      ],
      declarations: [SendMailingModalComponent, SoarSelectListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SendMailingModalComponent);
    component = fixture.componentInstance;
    formBuilder = TestBed.inject(FormBuilder);   
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set activeFltrTab, mailingTitle, and activeGridDataCount correctly for All Patients', () => {
      component.ngOnInit();
      expect(component.activeFltrTab).toBe(BadgeFilterType.AllPatients);
      expect(component.mailingTitle).toBe(MailingLabel.AllPatients);
      expect(component.activeGridDataCount).toBe(dialogContentInstance.activeGridDataCount.allPatients);
    });

    it('should set activeFltrTab, mailingTitle, and activeGridDataCount correctly for Appointments', () => {
      dialogContentInstance.activeFltrTab = BadgeFilterType.Appointments;
      component.ngOnInit();
      expect(component.activeFltrTab).toBe(BadgeFilterType.Appointments);
      expect(component.mailingTitle).toBe(MailingLabel.Appointments);
      expect(component.activeGridDataCount).toBe(dialogContentInstance.activeGridDataCount.appointments);
    });

    it('should set activeFltrTab, mailingTitle, and activeGridDataCount correctly for other to do', () => {
      dialogContentInstance.activeFltrTab = BadgeFilterType.otherToDo;
      component.ngOnInit();
      expect(component.activeFltrTab).toBe(BadgeFilterType.otherToDo);
      expect(component.mailingTitle).toBe(MailingLabel.OtherToDo);
      expect(component.activeGridDataCount).toBe(dialogContentInstance.activeGridDataCount.otherToDo);
    });

    it('should set activeFltrTab, mailingTitle, and activeGridDataCount correctly for preventive care', () => {
      dialogContentInstance.activeFltrTab = BadgeFilterType.PreventiveCare;
      component.ngOnInit();
      expect(component.activeFltrTab).toBe(BadgeFilterType.PreventiveCare);
      expect(component.mailingTitle).toBe(MailingLabel.PreventiveCare);
      expect(component.activeGridDataCount).toBe(dialogContentInstance.activeGridDataCount.preventiveCare);
    });

    it('should set activeFltrTab, mailingTitle, and activeGridDataCount correctly for treatment plans', () => {
      dialogContentInstance.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.ngOnInit();
      expect(component.activeFltrTab).toBe(BadgeFilterType.TreatmentPlans);
      expect(component.mailingTitle).toBe(MailingLabel.TreatmentPlans);
      expect(component.activeGridDataCount).toBe(dialogContentInstance.activeGridDataCount.treatmentPlans);
    });
  });

  describe('close', () => {
    it('should call close method of dialog', () => {
      spyOn(mockDialogRef, 'close');
      component.close();
      expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should not call close method of dialog if dialog is undefined', () => {
      component.dialog = undefined;
      component.close();
      expect(component.dialog).toBeUndefined();
    });
  });

  describe('confirm', () => {
    it('should set isPrintMailingLabel and call close method of dialog with correct parameter', () => {
      component.checked = true;
      component.mailingForm = formBuilder.group({ test: 'value' });
      spyOn(mockDialogRef, 'close');
      component.confirm();
      expect(component.isPrintMailingLabel).toBe(true);
      expect(mockDialogRef.close).toHaveBeenCalledWith({ test: 'value' });
    });    
  });

  describe('templateIdChanged', () => {
    it('should set communicationTemplateId, selected, and disabled correctly', () => {
      component.commTypeId = CommunicationType.Postcard;
      component.templateIdChanged('testId');
      expect(component.communicationTemplateId).toBe('testId');
      expect(component.selected).toBe(true);
      expect(component.disabled).toBe(false);
    });

    it('should set communicationTemplateId to null if newValue is null or commTypeId is not UsMail or Postcard', () => {
      component.commTypeId = 0;
      component.templateIdChanged(null);
      expect(component.communicationTemplateId).toBe(null);
    });
  });

  describe('communicationTypeIdChanged', () => {   
    it('should set properties and call getTemplatesByGroupId correctly', () => {      
      component.categorySource = mockCategorySource;
      component.communicationTemplateId = 'testId';
      component.activeFltrTab = BadgeFilterType.AllPatients;
      component.mailingForm = formBuilder.group({ isPostcard: '' });
      spyOn(component, 'getTemplatesByGroupSuccess');
      component.communicationTypeIdChanged(4);
      expect(component.communicationTemplateId).not.toBe(null);
      expect(component.disabled).toBe(true);
      expect(component.commTypeId).toBe(4);
      expect(component.communicationTypeId).toBe(4);
      expect(component.isPostcard).toBe(true);
      expect(component.mailingForm.controls.isPostcard.value).toBe(true);
      expect(component.groupId).toBe(3);
      expect(component.patientId).toBe(PatientEmptyGuid);
      expect(mockPatientServices.Communication.getTemplatesByGroupId).toHaveBeenCalledWith({ Id: PatientEmptyGuid, mediaTypeId: 4, GroupId: 3 });
      expect(component.getTemplatesByGroupSuccess).toHaveBeenCalledWith(mockCommTemplate);
    });

    it('should set properties and call getTemplatesByGroupId correctly when newValue is empty', () => {
      component.soarSelectList = new SoarSelectListComponent();
      component.communicationTypeIdChanged('');
      expect(component.communicationTemplateId).toBe(null);
      expect(component.disabled).toBe(true);
      expect(component.commTypeId).toBe(0);
    });
  });

  describe('getTemplatesByGroupSuccess', () => {   
    it('should set templateSource and soarSelectList correctly', () => {
      component.soarSelectList = new SoarSelectListComponent();
      spyOn(component.soarSelectList, 'initSelectionList');
      component.getTemplatesByGroupSuccess(mockCommTemplate);
      expect(component.templateSource).toEqual(mockCommTemplate.Value);
      expect(component.soarSelectList.optionList).toEqual(mockCommTemplate.Value);
      expect(component.soarSelectList.initSelectionList).toHaveBeenCalled();
    });
  });

  describe('setPrintMailing', () => {
    it('should set checked correctly', () => {
      component.mailingForm = formBuilder.group({ isPrintMailingLabel: true });
      component.setPrintMailing();
      expect(component.checked).toBe(true);
    });

    it('should set checked to false if isPrintMailingLabel is not set', () => {
      component.mailingForm = formBuilder.group({});
      component.setPrintMailing();
      expect(component.checked).toBe(undefined);
    });
  });
});
