import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientExportModalComponent } from './patient-export-modal.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { TextFilterType } from 'src/patient/common/models/patient-grid-filter.model';


const mockDialogRef = {
  close: () => { },
  open: () => { },
  content: {
      instance: {
          title: '',
      }
  }
}
describe('PatientExportModalComponent', () => {
  let component: PatientExportModalComponent;
  let fixture: ComponentFixture<PatientExportModalComponent>;
  let formBuilder: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        FormBuilder, TranslateService,
        { provide: DialogRef, useValue: mockDialogRef}
      ],
      declarations: [ PatientExportModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientExportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    formBuilder = TestBed.inject(FormBuilder);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize the exportForm with the expected controls', () => {
      component.ngOnInit();
      const expectedForm = formBuilder.group({
        PatientMailing: [false],
        PatientEmail: [false],
        PatientPrimaryPhone: [false],
        PatientHomePhone: [false],
        PatientMobilePhone: [false],
        PatientWorkPhone: [false],
        ResponsibleMailing: [false],
        ResponsibleEmail: [false],
        ResponsiblePrimaryPhone: [false],
        ResponsibleHomePhone: [false],
        ResponsibleMobilePhone: [false],
        ResponsibleWorkPhone: [false]
      });
      expect(component.exportForm.value).toEqual(expectedForm.value);
    });
  });

  describe('setCategory', () => {
    it('should set checkBoxSection, patientCheckBox, responsiblePartyCheckBox to true and call getAllCheckBox if selectedValue is IncludeContact', () => {
      const patientSectionCheckBox = spyOn(component, 'patientSectionCheckBox');
      const ResponsibleSectionCheckBox = spyOn(component, 'ResponsibleSectionCheckBox');
      const event = { target: { value: '1' } };
      component.setCategory(event);
      expect(component.checkBoxSection).toBe(true);
      expect(component.patientCheckBox).toBe(true);
      expect(component.responsiblePartyCheckBox).toBe(true);
      expect(patientSectionCheckBox).toHaveBeenCalledWith(component.patientCheckBox);
      expect(ResponsibleSectionCheckBox).toHaveBeenCalledWith(component.responsiblePartyCheckBox);
    });
  
    it('should set checkBoxSection, patientCheckBox, responsiblePartyCheckBox to false and call getAllCheckBox if selectedValue is not IncludeContact', () => {
      const event = { target: { value: '0' } };
      component.setCategory(event);
      expect(component.checkBoxSection).toBe(false);
      expect(component.patientCheckBox).toBe(false);
      expect(component.responsiblePartyCheckBox).toBe(false);
    });
  });

  describe('toggleCheckBoxes', () => {
    it('should toggle responsiblePartyCheckBox when checkBoxSection is not Patient', () => {
      component.responsiblePartyCheckBox = false;
      component.toggleCheckBoxes(TextFilterType.ResponsibleParty);
      expect(component?.responsiblePartyCheckBox).toBe(true);
      expect(component?.exportForm?.controls?.ResponsibleMailing?.value).toBe(true);
      expect(component?.exportForm?.controls?.ResponsibleEmail?.value).toBe(true);
      expect(component?.exportForm?.controls?.ResponsiblePrimaryPhone?.value).toBe(true);
      expect(component?.exportForm?.controls?.ResponsibleHomePhone?.value).toBe(true);
      expect(component?.exportForm?.controls?.ResponsibleMobilePhone?.value).toBe(true);
      expect(component?.exportForm?.controls?.ResponsibleWorkPhone?.value).toBe(true);
    });
  
    it('should call getAllCheckBox after toggling checkboxes', () => {
      component.patientCheckBox = false;
      component.toggleCheckBoxes(TextFilterType.Patient);
      expect(component?.patientCheckBox).toBe(true);
      expect(component?.exportForm?.controls?.PatientMailing?.value).toBe(true);
      expect(component?.exportForm?.controls?.PatientEmail?.value).toBe(true);
      expect(component?.exportForm?.controls?.PatientPrimaryPhone?.value).toBe(true);
      expect(component?.exportForm?.controls?.PatientHomePhone?.value).toBe(true);
      expect(component?.exportForm?.controls?.PatientMobilePhone?.value).toBe(true);
      expect(component?.exportForm?.controls?.PatientWorkPhone?.value).toBe(true);
    });
  });

  describe('patientCheckBoxes', () => {
    it('should set patientCheckBox to true if all patient controls are true', () => {
      const mockFormControls = {
        PatientMailing:  new FormControl(true),
        PatientEmail:  new FormControl(true),
        PatientPrimaryPhone:  new FormControl(true),
        PatientHomePhone:  new FormControl(true),
        PatientMobilePhone:  new FormControl(true),
        PatientWorkPhone:  new FormControl(true),
      };
      component.exportForm = new FormGroup(mockFormControls);
      component.patientCheckBoxes();
      expect(component.patientCheckBox).toBe(true);
    });
  
    it('should set patientCheckBox to false if all patient controls are false', () => {
      const mockFormControls = {
        PatientMailing:  new FormControl(false),
        PatientEmail:  new FormControl(false),
        PatientPrimaryPhone:  new FormControl(false),
        PatientHomePhone:  new FormControl(false),
        PatientMobilePhone:  new FormControl(false),
        PatientWorkPhone:  new FormControl(false),
      };
      component.exportForm = new FormGroup(mockFormControls);
      component.patientCheckBoxes();
      expect(component.patientCheckBox).toBe(false);
    });
  });

  describe('responsibleCheckBoxes', () => {
    it('should set responsiblePartyCheckBox to true if all responsible controls are true', () => {
      const mockFormControls = {
        ResponsibleMailing:  new FormControl(true),
        ResponsibleEmail:  new FormControl(true),
        ResponsiblePrimaryPhone:  new FormControl(true),
        ResponsibleHomePhone:  new FormControl(true),
        ResponsibleMobilePhone:  new FormControl(true),
        ResponsibleWorkPhone:  new FormControl(true),
      };
      component.exportForm = new FormGroup(mockFormControls);
      component.responsibleCheckBoxes();
      expect(component.responsiblePartyCheckBox).toBe(true);
    });
  
    it('should set responsiblePartyCheckBox to false if all responsible controls are false', () => {
      const mockFormControls = {
        ResponsibleMailing:  new FormControl(false),
        ResponsibleEmail:  new FormControl(false),
        ResponsiblePrimaryPhone:  new FormControl(false),
        ResponsibleHomePhone:  new FormControl(false),
        ResponsibleMobilePhone:  new FormControl(false),
        ResponsibleWorkPhone:  new FormControl(false),
      };
      component.exportForm = new FormGroup(mockFormControls);
      component.responsibleCheckBoxes();
      expect(component.responsiblePartyCheckBox).toBe(false);
    });
  });

  describe('export', () => {
    it('should close the dialog with the value of the exportForm', () => {
      const formValue = { 
        PatientMailing: component.patientCheckBox,
        PatientEmail: false,
        PatientPrimaryPhone: false,
        PatientHomePhone: true,
        PatientMobilePhone: false,
        PatientWorkPhone: false,
        ResponsibleMailing: true,
        ResponsibleEmail: true,
        ResponsiblePrimaryPhone: false,
        ResponsibleHomePhone: true,
        ResponsibleMobilePhone: true,
        ResponsibleWorkPhone: true,
       };
      const closeSpy = spyOn(component.dialog, 'close');
      component.exportForm.setValue(formValue);
      component.export();
      expect(closeSpy).toHaveBeenCalledWith(formValue);
    });
  });

  describe('cancel', () => {
    it('should close the dialog without passing any value', () => {
      const closeSpy = spyOn(component.dialog, 'close');
      component.cancel();
      expect(closeSpy).toHaveBeenCalledWith(null);
    });
  });
});
