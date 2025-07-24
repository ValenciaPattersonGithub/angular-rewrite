import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { ContactDetails, TextFilterType } from 'src/patient/common/models/patient-grid-filter.model';

@Component({
  selector: 'patient-export-modal',
  templateUrl: './patient-export-modal.component.html',
  styleUrls: ['./patient-export-modal.component.scss']
})

export class PatientExportModalComponent implements OnInit {

  constructor(
    private fb: FormBuilder, 
    public dialog: DialogRef,
    private translate: TranslateService
  ) {}

  exportForm: FormGroup;
  textFilterType = TextFilterType;
  selectedItems = { value: ContactDetails.ExcludeContact, text: this.translate.instant("No, Don't Include Contact Details") }
  items = [
    { value: ContactDetails.ExcludeContact , text: this.translate.instant("No, Don't Include Contact Details")},
    { value: ContactDetails.IncludeContact, text: this.translate.instant("Responsible Party and/or Patient Contact Details")},
  ];
  patientCheckBox = false;
  responsiblePartyCheckBox = false;
  checkBoxSection = false;

  ngOnInit() {
    this.exportForm = this.fb?.group({
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
    })
  }

  setCategory = (event) => {
    const selectedValue = event?.target?.value;
    if(selectedValue == ContactDetails.IncludeContact){
      this.checkBoxSection = true;
      this.patientCheckBox = true;
      this.responsiblePartyCheckBox = true;
    }else{
      this.checkBoxSection = false;
      this.patientCheckBox = false;
      this.responsiblePartyCheckBox = false;
    }
    this.patientSectionCheckBox(this.patientCheckBox)
    this.ResponsibleSectionCheckBox(this.responsiblePartyCheckBox)
    this.exportForm?.updateValueAndValidity();
  }

  toggleCheckBoxes = (checkBoxSection: string) => {
    if (checkBoxSection == TextFilterType.Patient) {
      this.patientCheckBox = !this.patientCheckBox;
      this.patientSectionCheckBox(this.patientCheckBox)
    } else {
      this.responsiblePartyCheckBox = !this.responsiblePartyCheckBox;
      this.ResponsibleSectionCheckBox(this.responsiblePartyCheckBox)
    }  
    this.exportForm?.updateValueAndValidity();
  }

  patientCheckBoxes = () => {
    const patientControls = this.exportForm?.controls;
    this.patientCheckBox = Object.values(patientControls)?.every(control => control?.value);
  }
  
  responsibleCheckBoxes = () => {
    const responsibleControls = this.exportForm?.controls;
    this.responsiblePartyCheckBox = Object.values(responsibleControls)?.every(control => control?.value);
  }

  patientSectionCheckBox = (value:boolean) => {
    this.exportForm?.controls?.PatientMailing?.setValue(value);
    this.exportForm?.controls?.PatientEmail?.setValue(value);
    this.exportForm?.controls?.PatientPrimaryPhone?.setValue(value);
    this.exportForm?.controls?.PatientHomePhone?.setValue(value);
    this.exportForm?.controls?.PatientMobilePhone?.setValue(value);
    this.exportForm?.controls?.PatientWorkPhone?.setValue(value);
  }

  ResponsibleSectionCheckBox = (value:boolean) => {
    this.exportForm?.controls?.ResponsibleMailing?.setValue(value);
    this.exportForm?.controls?.ResponsibleEmail?.setValue(value);
    this.exportForm?.controls?.ResponsiblePrimaryPhone?.setValue(value);
    this.exportForm?.controls?.ResponsibleHomePhone?.setValue(value);
    this.exportForm?.controls?.ResponsibleMobilePhone?.setValue(value);
    this.exportForm?.controls?.ResponsibleWorkPhone?.setValue(value);
  }

  export = () => {
    this.dialog?.close(this.exportForm?.value);
    document.body.style.overflow = 'auto';
  }

  cancel = () => {
    this.exportForm?.reset();
    this.dialog?.close(null);
    document.body.style.overflow = 'auto';
  }

}
