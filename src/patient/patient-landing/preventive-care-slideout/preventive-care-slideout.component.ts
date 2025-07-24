import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SlideoutFilterComponent } from 'src/patient/common/components/slideout-filter/app-slideout-filter.component';
import { PreventiveCareRequest } from 'src/patient/common/models/patient-grid-request.model';
import { PatientFilterService } from 'src/patient/service/patient-filter.service';
import { Location } from 'src/business-center/practice-settings/location';
import { SlideoutFilter } from 'src/patient/common/models/enums/patient.enum';
import { PatientFliterCategory } from 'src/patient/common/models/patient-grid-response.model';
import { OrderByPipe } from 'src/@shared/pipes';

@Component({
  selector: 'preventive-care-slideout',
  templateUrl: './preventive-care-slideout.component.html',
  styleUrls: ['./preventive-care-slideout.component.scss']
})
export class PreventiveCareSlideoutComponent implements AfterViewInit {
  @Input() activeFltrTab: number;
  @Input() activeGridData;
  @Input() preventiveCareFilterCriteria: PreventiveCareRequest;
  @Input() selectedLocation: Location;
  @ViewChild(SlideoutFilterComponent) public slideoutFilter: SlideoutFilterComponent;

  preventiveCareRequest = new PreventiveCareRequest();
  subscriptions: Array<Subscription> = new Array<Subscription>();

  pastDue: PatientFliterCategory<string>[];
  preventiveCareIsScheduled: PatientFliterCategory<string>[];
  
  constructor(private patientFilterService: PatientFilterService, public fb: FormBuilder) { }

  ngAfterViewInit(): void {
    this.createForm();
    this.getSectionData();
  }

  getSectionData = () => {
    this.initializeDefaultPropeties();
    if (this.slideoutFilter?.patientFilterForm) {
      this.getPastDue();
      this.getPreventiveCareIsScheduled();
      this.subscriptions?.push(this.patientFilterService?.patientModelStatus?.subscribe(() => {
        const orderPipe = new OrderByPipe();
        this.slideoutFilter.patientModelArray = orderPipe.transform(this.slideoutFilter.patientModelArray, { sortColumnName: "filterText", sortDirection: 1 });
      }));
    }
  }

  initializeDefaultPropeties = () => {
    this.preventiveCareRequest = this.preventiveCareFilterCriteria;
  }

  createForm = () => {
    this.slideoutFilter?.patientFilterForm?.addControl("pastDue", new FormArray([]));
    this.slideoutFilter?.patientFilterForm?.addControl("preventiveCareIsScheduled", new FormArray([]));
  }

  setFilterData = (param: { id, filterHeader: string }) => {
    const selectedId = param?.id;
    const filterHeader = param?.filterHeader;
    switch (filterHeader) {
      case SlideoutFilter.IsActive:
        this.preventiveCareRequest.FilterCriteria.IsActive = selectedId;
        break;
      case SlideoutFilter.IsPatient:
        this.preventiveCareRequest.FilterCriteria.IsPatient = selectedId;
        break;
      case SlideoutFilter.AdditionalIdentifiers:
        this.preventiveCareRequest.FilterCriteria.AdditionalIdentifiers = selectedId;
        break;
      case SlideoutFilter.GroupTypes:
        this.preventiveCareRequest.FilterCriteria.GroupTypes = selectedId;
        break;
      case SlideoutFilter.PreferredDentists:
        this.preventiveCareRequest.FilterCriteria.PreferredDentists = selectedId;
        break;
      case SlideoutFilter.PreferredHygienists:
        this.preventiveCareRequest.FilterCriteria.PreferredHygienists = selectedId;
        break;
      case SlideoutFilter.PreventiveCareIsScheduled:
        this.preventiveCareRequest.FilterCriteria.PreventiveCareIsScheduled = selectedId;
        break;
    }

     // past due filter options
    if (this.pastDueForm?.value) {
      this.pastDueForm?.value?.forEach(element => {
        const selectedValue = element?.isSelected ? 'true' : 'false';
        switch (element?.field) {
          case SlideoutFilter.DueLess30:
            this.preventiveCareRequest.FilterCriteria.DueLess30 = selectedValue;
            break;
          case SlideoutFilter.Due30:
            this.preventiveCareRequest.FilterCriteria.Due30 = selectedValue;
            break;
          case SlideoutFilter.Due60:
            this.preventiveCareRequest.FilterCriteria.Due60 = selectedValue;
            break;
          case SlideoutFilter.DueOver90:
            this.preventiveCareRequest.FilterCriteria.DueOver90 = selectedValue;
            break;
        }
      });
    }

    // When under 'Patient/Non-Patients' filter 'All' checkbox is checked/unchecked -> removed the related properties from filter criteria
    if (filterHeader == SlideoutFilter.PatientTypeStatus) {      
      delete this.preventiveCareRequest?.FilterCriteria?.IsActive;
      delete this.preventiveCareRequest?.FilterCriteria?.IsPatient;
    }
  }
 
  getPastDue = () => {
    this.pastDue = [];
    // Add "All" option to the past due array 
    const control = { field: SlideoutFilter.PastDue, isSelected: false, isVisible: true, key: "", value: "" };    
    this.pastDue = this.patientFilterService?.pastDue;
    this.pastDueForm?.clear();
    this.pastDueForm.push(new FormControl(control));
    this.pastDue = this.pastDue?.map((item) => {
      return {
        ...item,
        isSelected: false,
        isVisible: true
      }
    });
    if (this.activeGridData?.pastDue) {
      this.activeGridData?.pastDue?.forEach((item) => {
        this.pastDue?.push({
          field: SlideoutFilter.PastDue,
          value: item?.Value,
          key: item?.Key,
          isVisible: this.pastDue?.length > 4 ? false : true,
          isSelected: false
        })
      });
    }
    for (let i = 0; i < this.pastDue?.length; i++) {
      this.pastDueForm?.push(new FormControl(this.pastDue[i]))
    }
    const pastDue = this.patientFilterService?.setCommonStructure('pastDueDiv', 'pastDueDiv', SlideoutFilter.PastDue, 'Past Due',
      this.pastDueForm, this.pastDue);
    this.addToForm(pastDue);
  }

  getPreventiveCareIsScheduled = () => {
    this.preventiveCareIsScheduled = [];
    // Add "All" option to the past due array 
    const control = { field: SlideoutFilter.PreventiveCareIsScheduled, isSelected: true, isVisible: true, key: "", value: "" };    
    this.preventiveCareIsScheduled = this.patientFilterService?.preventiveIsScheduled;
    this.preventiveCareIsScheduledForm?.clear();
    this.preventiveCareIsScheduledForm.push(new FormControl(control));
    this.preventiveCareIsScheduled = this.preventiveCareIsScheduled?.map((item) => {
      return {
        ...item,
        isSelected: true,
        isVisible: true
      }
    });
    if (this.activeGridData?.PreventiveCareIsScheduled) {
      this.activeGridData?.PreventiveCareIsScheduled?.forEach((item) => {
        this.preventiveCareIsScheduled.push({
          field: "PreventiveCareIsScheduled",
          value: item?.Value,
          key: item?.Key,
          isVisible: this.preventiveCareIsScheduled?.length > 4 ? false : true,
          isSelected: true
        })
      });
    }

    for (let i = 0; i < this.preventiveCareIsScheduled?.length; i++) {
      this.preventiveCareIsScheduledForm?.push(new FormControl(this.preventiveCareIsScheduled[i]))
    }
    const preventiveCareIsScheduled = this.patientFilterService?.setCommonStructure('preventiveIsScheduledDiv', 'preventiveIsScheduledDiv', SlideoutFilter.PreventiveIsScheduled, 'Preventive Appt Scheduled',
      this.preventiveCareIsScheduledForm, this.preventiveCareIsScheduled);
    this.addToForm(preventiveCareIsScheduled);
  }

  addToForm = (dataArray) => {
    const index = this.slideoutFilter?.patientModelArray?.findIndex(x => x?.dataTarget == dataArray?.dataTarget);
    if (index < 0) {
      this.slideoutFilter?.patientModelArray?.push(dataArray);
    } else {
      this.slideoutFilter.patientModelArray[index] = dataArray;
    }
  }

  get preventiveCareIsScheduledForm() {
    return this.slideoutFilter?.patientFilterForm?.controls?.preventiveCareIsScheduled as FormArray;
  }

  get pastDueForm() {
    return this.slideoutFilter?.patientFilterForm?.controls?.pastDue as FormArray;
  }

  ngOnDestroy() {
    this.subscriptions?.forEach((subscription) => subscription?.unsubscribe());
  }

}
