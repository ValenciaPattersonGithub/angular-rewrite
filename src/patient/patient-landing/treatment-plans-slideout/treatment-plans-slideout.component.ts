import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OrderByPipe } from 'src/@shared/pipes';
import { SlideoutFilterComponent } from 'src/patient/common/components/slideout-filter/app-slideout-filter.component';
import { SlideoutFilter } from 'src/patient/common/models/enums/patient.enum';
import { TreatmentPlansGridFilter } from 'src/patient/common/models/patient-grid-filter.model';
import { TreatmentPlansRequest } from 'src/patient/common/models/patient-grid-request.model';
import { PatientFliterCategory } from 'src/patient/common/models/patient-grid-response.model';
import { BadgeFilterType } from 'src/patient/common/models/patient-location.model';
import { PatientFilterService } from 'src/patient/service/patient-filter.service';

@Component({
  selector: 'treatment-plans-slideout',
  templateUrl: './treatment-plans-slideout.component.html',
  styleUrls: ['./treatment-plans-slideout.component.scss']
})
export class TreatmentPlansSlideoutComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  treatmentPlansCreateDate: PatientFliterCategory<string>[];
  treatmentStatus: PatientFliterCategory<string>[];
  treatmentPlanName: PatientFliterCategory<string>[];
  treatmentProviders: PatientFliterCategory<string>[];
  isFirstLoad = true
  treatmentPlanForm: FormGroup;
  treatmentPlansRequest = new TreatmentPlansRequest();
  subscriptions: Array<Subscription> = new Array<Subscription>();

  @Input() activeFltrTab: number;
  @Input() activeGridData;
  @Input() tratmentPlansFilterCriteria: TreatmentPlansRequest;
  @Input() selectedLocation = { LocationId: 0, LocationName: '' };
  @ViewChild(SlideoutFilterComponent) public slideoutFilter: SlideoutFilterComponent;

  constructor(private patientFilterService: PatientFilterService) { }

  ngOnChanges() {
    if (this.activeGridData?.TreatmentProviders && this.slideoutFilter) {
      this.getTreatmentPlanProviders();
    }
  }

  ngAfterViewInit(): void {
    this.treatmentPlansRequest.FilterCriteria = new TreatmentPlansGridFilter();
    this.initializeDefaultPropeties();
    if (this.slideoutFilter) {
      this.createForm();
      this.getTreatmentPlanCreatedDate();
      this.getTreatmentPlanName();
      this.getTreatmentPlanStatus();
      this.subscriptions?.push(this.patientFilterService?.patientModelStatus?.subscribe(() => {
        const orderPipe = new OrderByPipe();
        this.slideoutFilter.patientModelArray = orderPipe.transform(this.slideoutFilter.patientModelArray, { sortColumnName: "filterText", sortDirection: 1 });
      }));
    }
  }

  ngOnInit(): void {
    this.patientFilterService.isApplyFilters = false;
  }

  //#region "Initialize Default Properties"
  initializeDefaultPropeties = () => {
    this.treatmentPlansRequest = this.tratmentPlansFilterCriteria;
  }
  //#endregion

  //#region "Create Form"
  createForm = () => {
    // Adding control treatmentPlanCreatedDate
    this.slideoutFilter?.patientFilterForm?.addControl('treatmentPlanCreatedDate', new FormArray([]));
    this.treatmentPlansCreatedDateArray?.push(new FormControl('treatmentDateFrom'));
    this.treatmentPlansCreatedDateArray?.push(new FormControl('treatmentDateTo'));
    // Adding control treatmentPlanName
    this.slideoutFilter?.patientFilterForm?.addControl('treatmentPlanName', new FormArray([]));
    // Adding control treatmentPlanStatus
    this.slideoutFilter?.patientFilterForm?.addControl('treatmentPlanStatus', new FormArray([]));
    // Adding control treatmentPlanProviders
    this.slideoutFilter?.patientFilterForm?.addControl('treatmentPlanProviders', new FormArray([]));
  }
  //#endregion

  //#region "Treatment Plan Created Date"
  getTreatmentPlanCreatedDate = () => {
    if (this.activeFltrTab == BadgeFilterType.TreatmentPlans) {
      this.treatmentPlansCreateDate = [];
      this.treatmentPlansCreateDate = this.patientFilterService?.createdDateList;
      // Add "All" option to the insurance array
      const control = { field: SlideoutFilter.CreatedDateList, isSelected: true, isVisible: true, key: "", value: "" };
      this.treatmentPlansCreatedDateArray?.clear();
      this.treatmentPlansCreatedDateArray?.push(new FormControl(control));
      for (let i = 0; i < this.treatmentPlansCreateDate?.length; i++) {
        this.treatmentPlansCreatedDateArray?.push(new FormControl(this.treatmentPlansCreateDate[i]))
      }

      const treatmentPlanCreatedDateModel = this.patientFilterService.setCommonStructure('createdDate', 'createdDate', SlideoutFilter.CreatedDateList, 'Treatment Plan Create Date',
        this.treatmentPlansCreatedDateArray, this.treatmentPlansCreateDate);
      const index = this.slideoutFilter?.patientModelArray?.findIndex(x => x?.dataTarget == treatmentPlanCreatedDateModel?.dataTarget);
      if (index < 0) {
        this.slideoutFilter?.patientModelArray?.push(treatmentPlanCreatedDateModel);
      } else {
        this.slideoutFilter.patientModelArray[index] = treatmentPlanCreatedDateModel;
      }
    }
  }
  //#endregion

  //#region "Treatment Plan Name"
  getTreatmentPlanName = () => {
    if (this.activeFltrTab == BadgeFilterType.TreatmentPlans) {
      this.treatmentPlanName = this.patientFilterService?.treatmentPlanName;
      // Add "All" option to the birth months array 
      const control = { field: SlideoutFilter.TreatmentPlan, isSelected: true, isVisible: true, key: "", value: "" };
      this.treatmentPlansNameArray?.clear();
      this.treatmentPlansNameArray.push(new FormControl(control));
      for (let i = 0; i < this.treatmentPlanName?.length; i++) {
        this.treatmentPlansNameArray?.push(new FormControl(this.treatmentPlanName[i]))
      }
      const treatmentPlanNameModel = this.patientFilterService.setCommonStructure('treatmentName', 'treatmentName', 'TreatmentPlanName', 'Treatment Plan Name',
        this.treatmentPlansNameArray, this.treatmentPlanName);
      const index = this.slideoutFilter?.patientModelArray?.findIndex(x => x?.dataTarget == treatmentPlanNameModel?.dataTarget);
      if (index < 0) {
        this.slideoutFilter?.patientModelArray?.push(treatmentPlanNameModel);
      } else {
        this.slideoutFilter.patientModelArray[index] = treatmentPlanNameModel;
      }
    }
  }
  //#endregion

  //#region "Treatment Plan Status"
  getTreatmentPlanStatus = () => {
    this.treatmentStatus = this.patientFilterService?.treatmentPlanStatus;
    this.treatmentPlanStatusArray?.clear();
    // Add "All" option to the insurance array
    const control = { field: "", isSelected: true, isVisible: true, key: "", value: "" };
    this.treatmentPlanStatusArray.push(new FormControl(control));
    for (let i = 0; i < this.treatmentStatus?.length; i++) {
      this.treatmentPlanStatusArray?.push(new FormControl(this.treatmentStatus[i]))
    }
    const treatmentStatusModel = this.patientFilterService?.setCommonStructure('treatmentPlanStatesDiv', 'treatmentPlanStatesDiv', 'TreatmentPlanStates', 'Treatment Plan Status',
      this.treatmentPlanStatusArray, this.treatmentStatus);

    const index = this.slideoutFilter?.patientModelArray?.findIndex(x => x?.dataTarget == treatmentStatusModel?.dataTarget);
    if (index < 0) {
      this.slideoutFilter?.patientModelArray?.push(treatmentStatusModel);
    } else {
      this.slideoutFilter.patientModelArray[index] = treatmentStatusModel;
    }
  }
  //#endregion

  //#region "Treatment Plan Providers"
  getTreatmentPlanProviders = () => {
    if (!this.patientFilterService.isApplyFilters) {
      this.treatmentProviders = [];
      this.treatmentPlanProvidersArray?.clear();
      // Add "All" option to the insurance array
      const control = { field: SlideoutFilter.TreatmentPlanProviders, isSelected: true, isVisible: true, key: "", value: "" };
      this.treatmentPlanProvidersArray.push(new FormControl(control));
      // Iterate over the preferred location array
      this.activeGridData?.TreatmentProviders?.forEach(item => {
        const providers = {
          field: SlideoutFilter.TreatmentPlanProviders, value: item?.Value,
          key: item?.Key, isVisible: this.treatmentProviders?.length > 4 ? false : true,
          isSelected: this.isFirstLoad ? true : this.isItemSelected('TreatmentProviders', item?.Key)
        };
        const index = this.treatmentPlanProvidersArray?.value?.findIndex(x => x?.value == this.treatmentProviders[item]?.value);
        if (index < 0) {
          this.treatmentProviders?.push(providers);
        }
      });
      for (let i = 0; i < this.treatmentProviders?.length; i++) {
        this.treatmentPlanProvidersArray?.push(new FormControl(this.treatmentProviders[i]))
      }
      const treatmentProvidersModel = this.patientFilterService?.setCommonStructure('treatmentProviders', 'treatmentProviders', SlideoutFilter.TreatmentPlanProviders, 'Treatment Plan Provider',
        this.treatmentPlanProvidersArray, this.treatmentProviders);
      const index = this.slideoutFilter?.patientModelArray?.findIndex(x => x?.dataTarget == treatmentProvidersModel?.dataTarget);
      if (index < 0) {
        this?.slideoutFilter?.patientModelArray?.push(treatmentProvidersModel);
      } else {
        this.slideoutFilter.patientModelArray[index] = treatmentProvidersModel;
      }
    }
  }
  //#endregion

  //#region "isItemSelected"
  isItemSelected = (strFilter, itemId) => {
    let result = true;
    switch (strFilter) {
      case 'TreatmentProviders':
        result = this.activeGridData?.TreatmentProviders?.findIndex(x => x == itemId) > -1 ? true : false;
        break;
    }
    return result;
  }
  //#endregion

  //#region "Getter Properties"
  get treatmentPlanStatusArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.treatmentPlanStatus as FormArray;
  }

  get treatmentPlanProvidersArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.treatmentPlanProviders as FormArray;
  }

  get treatmentPlansCreatedDateArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.treatmentPlanCreatedDate as FormArray;
  }

  get treatmentPlansNameArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.treatmentPlanName as FormArray;
  }
  //#endregion

  //NOTE: the handling of dates in the stored procedure involves standardizing the format for Date of Birth and 
  // explicitly appending the time for Treatment Plan Created Date to achieve consistent and accurate filtering in both cases.
  // This method ensures explicitly appending the time (23:59:59) for Treatment Plan Created Date to achieve accurate filtering.
  formatAndSetDateRange = (dateStrings): string => {
    return dateStrings?.map((dateString, index) => {
      let formattedDate: string;
      let date = new Date(dateString);
      if(index == 0){
        if(!dateString){
          formattedDate = "";
        }else{
          formattedDate = date?.toLocaleString([], { hour12: false });
        }
      }
      // Set the time for the end date to 23:59:59
      if (index == 1) {
        if(!dateString){
          date = new Date();
        }
        date?.setHours(23, 59, 59);
        formattedDate = date?.toLocaleString([], { hour12: false });
      }
      return formattedDate;
    }) as string;
  }

  //#region "Prepare Filter Data"
  setFilterData = (param: { id: string[], filterHeader: string }) => {
    const selectedId = param?.id;
    const filterHeader = param?.filterHeader;
    if (!this.treatmentPlansRequest.FilterCriteria) {
      this.treatmentPlansRequest.FilterCriteria = new TreatmentPlansGridFilter();
    }
    switch (filterHeader) {
      case SlideoutFilter.TreatmentPlanCreatedDate: {
              // Update the PlanCreatedDateRange in the FilterCriteria
        const [formattedStartDate, formattedEndDate] = this.formatAndSetDateRange(selectedId);
        this.treatmentPlansRequest.FilterCriteria.PlanCreatedDateRange = [formattedStartDate, formattedEndDate];
        break;
      }
      case SlideoutFilter.TreatmentPlanName:
        this.treatmentPlansRequest.FilterCriteria.TreatmentPlanName = selectedId;
        break;
      case SlideoutFilter.IsActive:
        this.treatmentPlansRequest.FilterCriteria.IsActive = selectedId;
        break;
      case SlideoutFilter.IsPatient:
        this.treatmentPlansRequest.FilterCriteria.IsPatient = selectedId;
        break;
      case SlideoutFilter.PreferredDentists:
        this.treatmentPlansRequest.FilterCriteria.PreferredDentists = selectedId;
        break;
      case SlideoutFilter.PreferredHygienists:
        this.treatmentPlansRequest.FilterCriteria.PreferredHygienists = selectedId;
        break;
      case SlideoutFilter.AdditionalIdentifiers:
        this.treatmentPlansRequest.FilterCriteria.AdditionalIdentifiers = selectedId;
        break;
      case SlideoutFilter.GroupTypes:
        this.treatmentPlansRequest.FilterCriteria.GroupTypes = selectedId;
        break;
      case SlideoutFilter.TreatmentPlanProviders:
        this.treatmentPlansRequest.FilterCriteria.TreatmentProviders = (selectedId?.length == 0 ? null : selectedId);
        break;

    }

    // Set the filter criteria for treatment plan status
    if (this.treatmentPlanStatusArray?.value) {
      this.treatmentPlanStatusArray?.value?.forEach(element => {
        const selectedValue = element?.isSelected ? 'true' : 'false';
        switch (element?.field) {
          case SlideoutFilter.IsUnscheduled:
            this.treatmentPlansRequest.FilterCriteria.IsUnscheduled = selectedValue;
            break;
          case SlideoutFilter.IsScheduled:
            this.treatmentPlansRequest.FilterCriteria.IsScheduled = selectedValue;
            break;
          case SlideoutFilter.IsProposed:
            this.treatmentPlansRequest.FilterCriteria.IsProposed = selectedValue;
            break;
          case SlideoutFilter.IsAccepted:
            this.treatmentPlansRequest.FilterCriteria.IsAccepted = selectedValue;
            break;
        }
      });
    }
    
    // When under 'Patient/Non-Patients' filter 'All' checkbox is checked/unchecked -> removed the related properties from filter criteria
    if (filterHeader == SlideoutFilter.PatientTypeStatus) {      
      delete this.treatmentPlansRequest?.FilterCriteria?.IsActive;
      delete this.treatmentPlansRequest?.FilterCriteria?.IsPatient;
    }
  }
  //#endregion

  ngOnDestroy() {
    this.subscriptions?.forEach((subscription) => subscription?.unsubscribe());
  }
}
