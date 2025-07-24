import { Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { PatientFilterService } from '../../service/patient-filter.service';
import { SlideoutFilterComponent } from '../../common/components/slideout-filter/app-slideout-filter.component';
import { PatientFliterCategory } from '../../common/models/patient-grid-response.model';
import { Subscription } from 'rxjs';
import { OrderByPipe } from 'src/@shared/pipes';
import { SlideoutFilter } from '../../common/models/enums/patient.enum';
import { AllPatientRequest } from '../../common/models/patient-grid-request.model';
import { AllPatientGridFilter } from '../../common/models/patient-grid-filter.model';

@Component({
  selector: 'all-patient-slideout',
  templateUrl: './all-patient-slideout.component.html',
  styleUrls: ['./all-patient-slideout.component.scss']
})
export class AllPatientSlideoutComponent implements OnInit, OnChanges, OnDestroy {
  birthMonths: PatientFliterCategory<number>[];
  insurance: PatientFliterCategory<string>[];
  preferredLocation: PatientFliterCategory<string>[];
  preventiveCare: PatientFliterCategory<string>[];
  reminderStatus: PatientFliterCategory<string>[];
  treatmentPlans: PatientFliterCategory<string>[];
  zipCodes: PatientFliterCategory<string>[];
  subscriptions: Array<Subscription> = new Array<Subscription>();
  isFirstLoad = true
  allPatientsRequest = new AllPatientRequest();

  @Input() activeFltrTab: number;
  @Input() activeGridData;
  @Input() selectedLocation: { LocationId: 0, LocationName: '' };
  @Input() allPatientsFilterCriteria: AllPatientRequest;

  @ViewChild(SlideoutFilterComponent) public slideoutFilter: SlideoutFilterComponent;

  constructor(
    private patientFilterService: PatientFilterService
  ) { }

  ngOnChanges() {
    if (this.activeGridData && this.slideoutFilter) {
      this.getPreferredLocation();
      this.getZipCodes();
    }
  }

  ngAfterViewInit(): void {
    this.allPatientsRequest.FilterCriteria = new AllPatientGridFilter();
    this.initializeDefaultPropeties();
    if (this.slideoutFilter) {
      this.getBirthMonths();
      this.getInsurance();
      this.getPreventiveCare();
      this.getReminderStatus();
      this.getTreatmentPlans();
      this.subscriptions?.push(this.patientFilterService?.patientModelStatus?.subscribe(() => {
        const orderPipe = new OrderByPipe();
        this.slideoutFilter.patientModelArray = orderPipe.transform(this.slideoutFilter.patientModelArray, { sortColumnName: "filterText", sortDirection: 1 });
      }));
    }
  }

  ngOnInit(): void {
    this.patientFilterService.isApplyFilters = false;
  }

  initializeDefaultPropeties = () => {
    this.allPatientsRequest = this.allPatientsFilterCriteria;
  }

  getBirthMonths = () => {
    this.birthMonths = [];
    // Add "All" option to the birth months array 
    const control = { field: SlideoutFilter.BirthMonths, isSelected: true, isVisible: true, key: "", value: "" };
    this.birthMonths = this.patientFilterService?.birthMonths;
    this.birthMonthsArray?.clear();
    this.birthMonthsArray?.push(new FormControl(control));
    this.birthMonths = this.birthMonths?.map((item) => {
      return {
        ...item,
        isSelected: true,
        isVisible: true
      }
    });
    for (let i = 0; i < this.birthMonths?.length; i++) {
      this.birthMonthsArray?.push(new FormControl(this.birthMonths[i]))
    }
    const birthMonthsModel = this.patientFilterService?.setCommonStructure('birthMonths', 'birthMonths', 'BirthMonths', 'Birthday Month',
      this.birthMonthsArray, this.birthMonths);
    this.slideoutFilter?.patientModelArray?.push(birthMonthsModel);
  }

  getInsurance = () => {
    this.insurance = this.patientFilterService?.insuranceFilters;
    // Add "All" option to the insurance array
    const control = { field: SlideoutFilter.HasInsurance, isSelected: true, isVisible: true, key: "", value: "" };
    this.insuranceArray?.push(new FormControl(control));
    for (let i = 0; i < this.insurance?.length; i++) {
      this.insuranceArray?.push(new FormControl(this.insurance[i]))
    }
    const insuranceModel = this.patientFilterService?.setCommonStructure('hasInsuranceDiv', 'hasInsuranceDiv', 'InsuranceFilter', 'Insurance',
      this.insuranceArray, this.insurance);
    this.slideoutFilter?.patientModelArray?.push(insuranceModel);
  }

  getPreferredLocation = () => {
    if (!this.patientFilterService.isApplyFilters) {
      this.preferredLocation = [];
      this.preferredLocationArray?.clear();
      // Add "All" option to the preferred location array
      const control = { field: SlideoutFilter.PreferredLocations, isSelected: true, isVisible: true, key: "", value: "" };
      this.preferredLocationArray?.push(new FormControl(control));
      // Iterate over the preferred location array
      this.activeGridData?.PreferredLocation?.forEach(item => {
        const preferredLoc = { field: SlideoutFilter.PreferredLocations, value: item?.Value, key: item?.Key, isVisible: true, isSelected: this.isFirstLoad ? true : this.isItemSelected('PreferredLocations', item?.Key) };
        const index = this.preferredLocationArray?.value?.findIndex(x => x?.value == this.preferredLocation[item]?.value);
        if (index < 0) {
          this.preferredLocation?.push(preferredLoc);
        }
      });
      for (let i = 0; i < this.preferredLocation?.length; i++) {
        const index = this.preferredLocationArray?.value?.findIndex(x => x?.value == this.preferredLocation[i]?.value);
        if (index < 0) {
          this.preferredLocationArray?.push(new FormControl(this.preferredLocation[i]))
        }
      }
      const locationModel = this.patientFilterService?.setCommonStructure('prefferedLocDiv', 'prefferedLocDiv', 'PreferredLocations', 'Preferred Location',
        this.preferredLocationArray, this.preferredLocation);
      const index = this.slideoutFilter?.patientModelArray?.findIndex(x => x?.dataTarget == locationModel?.dataTarget);
      if (index < 0) {
        this.slideoutFilter?.patientModelArray?.push(locationModel);
      } else {
        this.slideoutFilter.patientModelArray[index] = locationModel;
      }
    }
  }

  getPreventiveCare = () => {
    this.preventiveCare = [];
    // Add "All" option to the preventive care array
    const control = { field: SlideoutFilter.IsNoDueDate, isSelected: true, isVisible: true, key: "", value: "" };
    this.preventiveCare = this.patientFilterService?.preventiveCareStates;
    this.preventiveCareArray?.clear();
    this.preventiveCareArray?.push(new FormControl(control));
    this.preventiveCare = this.preventiveCare?.map((item) => {
      return {
        ...item,
        isSelected: true,
        isVisible: true
      }
    });
    for (let i = 0; i < this.preventiveCare?.length; i++) {
      this.preventiveCareArray?.push(new FormControl(this.preventiveCare[i]))
    }
    const preventiveModel = this.patientFilterService?.setCommonStructure('preventiveCareStateDiv', 'preventiveCareStateDiv', 'PreventiveCare', 'Preventive Care',
      this.preventiveCareArray, this.preventiveCare);
    this.slideoutFilter?.patientModelArray?.push(preventiveModel);
  }

  getReminderStatus = () => {
    this.reminderStatus = [];
    // Add "All" option to the reminder status array
    const control = { field: SlideoutFilter.ReminderStatus, isSelected: true, isVisible: true, key: "", value: "" };
    this.reminderStatus = this.patientFilterService?.reminderStatus;
    this.reminderStatusArray?.clear();
    this.reminderStatusArray?.push(new FormControl(control));
    this.reminderStatus = this.reminderStatus?.map((item) => {
      return {
        ...item,
        isSelected: true,
        isVisible: true
      }
    });
    for (let i = 0; i < this.reminderStatus?.length; i++) {
      this.reminderStatusArray?.push(new FormControl(this.reminderStatus[i]))
    }
    const reminderStatusModel = this.patientFilterService?.setCommonStructure('reminderStatusDiv', 'reminderStatusDiv', 'ReminderStatus', 'Reminder Status',
      this.reminderStatusArray, this.reminderStatus);
    this.slideoutFilter?.patientModelArray?.push(reminderStatusModel);
  }

  getTreatmentPlans = () => {
    this.treatmentPlans = [];
    // Add "All" option to the treatment plans array
    const control = { field: SlideoutFilter.TreatmentPlanStates, isSelected: true, isVisible: true, key: "", value: "" };
    this.treatmentPlans = this.patientFilterService?.treatmentPlanStates;
    this.treatmentPlansArray?.clear();
    this.treatmentPlansArray?.push(new FormControl(control));
    this.treatmentPlans = this.treatmentPlans?.map((item) => {
      return {
        ...item,
        isSelected: true,
        isVisible: true
      }
    });
    for (let i = 0; i < this.treatmentPlans?.length; i++) {
      this.treatmentPlansArray?.push(new FormControl(this.treatmentPlans[i]))
    }
    const treatmentPlansModel = this.patientFilterService?.setCommonStructure('treatmentPlanStatesDiv', 'treatmentPlanStatesDiv', 'TreatmentPlanStates', 'Treatment Plans',
      this.treatmentPlansArray, this.treatmentPlans);
    this.slideoutFilter?.patientModelArray?.push(treatmentPlansModel);
  }

  getZipCodes = () => {
    if (!this.patientFilterService.isApplyFilters) {
      this.zipCodes = this.patientFilterService?.setLocationZipCodes(true);
      this.zipCodesArray?.clear();
      // Add "All" option to the zip codes array
      const control = { field: SlideoutFilter.ZipCodes, isSelected: true, isVisible: true, key: "", value: "" };
      this.zipCodesArray?.push(new FormControl(control));
      // Iterate over the preferred location array
      this.activeGridData?.PatientLocationZipCodes?.forEach(item => {
        const ZipCodes = { field: SlideoutFilter.ZipCodes, value: item?.Value, key: item?.Key, isVisible: true, isSelected: this.isFirstLoad ? true : this.isItemSelected('PatientLocationZipCodes', item?.Key) };
        this.zipCodes?.push(ZipCodes);
      });
      for (let i = 0; i < this.zipCodes?.length; i++) {
        const index = this.zipCodesArray?.value?.findIndex(x => x?.value == this.zipCodes[i]?.value);
        if (index < 0) {
          this.zipCodesArray?.push(new FormControl(this.zipCodes[i]));
        }
      }
      const zipCodesModel = this.patientFilterService?.setCommonStructure('zipCodes', 'zipCodes', 'ZipCodes', 'Zip Codes',
        this.zipCodesArray, this.zipCodes);
      const index = this.slideoutFilter?.patientModelArray?.findIndex(x => x?.dataTarget == zipCodesModel?.dataTarget);
      if (index < 0) {
        this.slideoutFilter?.patientModelArray?.push(zipCodesModel);
      } else {
        this.slideoutFilter.patientModelArray[index] = zipCodesModel;
      }
    }
  }

  isItemSelected = (strFilter, itemId) => {
    let result = true;
    switch (strFilter) {
      case SlideoutFilter.PreferredLocations:
        result = this.activeGridData?.PreferredLocations?.findIndex(x => x == itemId) > -1 ? true : false;
        break;
      case SlideoutFilter.PatientLocationZipCodes:
        result = this.activeGridData?.PatientLocationZipCodes?.findIndex(x => x == itemId) > -1 ? true : false;
        break;
    }
    return result;
  }

  //#region "Prepare Filter Data"
  setFilterData = (param: { id: [], filterHeader: string }) => {
    const selectedId = param?.id;
    const filterHeader = param?.filterHeader;
    switch (filterHeader) {
      case SlideoutFilter.AdditionalIdentifiers:
        this.allPatientsRequest.FilterCriteria.AdditionalIdentifiers = selectedId;
        break;
      case SlideoutFilter.BusinessDays:
        this.allPatientsRequest.FilterCriteria.BusinessDays = selectedId;
        break;
      case SlideoutFilter.IsScheduled:
        this.allPatientsRequest.FilterCriteria.IsScheduled = selectedId;
        break;
      case SlideoutFilter.AppointmentStatusList:
        this.allPatientsRequest.FilterCriteria.AppointmentStatusList = selectedId;
        break;
      case SlideoutFilter.BirthMonths:
        this.allPatientsRequest.FilterCriteria.BirthMonths = selectedId;
        break;
      case SlideoutFilter.GroupTypes:
        this.allPatientsRequest.FilterCriteria.GroupTypes = selectedId;
        break;
      case SlideoutFilter.HasInsurance:
        this.allPatientsRequest.FilterCriteria.HasInsurance = selectedId;
        break;
      case SlideoutFilter.IsActive:
        this.allPatientsRequest.FilterCriteria.IsActive = selectedId;
        break;
      case SlideoutFilter.IsPatient:
        this.allPatientsRequest.FilterCriteria.IsPatient = selectedId;
        break;
      case SlideoutFilter.PreferredDentists:
        this.allPatientsRequest.FilterCriteria.PreferredDentists = selectedId;
        break;
      case SlideoutFilter.PreferredHygienists:
        this.allPatientsRequest.FilterCriteria.PreferredHygienists = selectedId;
        break;
      case SlideoutFilter.PreferredLocations:
        this.allPatientsRequest.FilterCriteria.PreferredLocation = selectedId;
        break;
      case SlideoutFilter.IsNoDueDate:
        this.allPatientsRequest.FilterCriteria.IsNoDueDate = selectedId;
        break;
      case SlideoutFilter.PreventiveCareIsScheduled:
        this.allPatientsRequest.FilterCriteria.PreventiveCareIsScheduled = selectedId;
        break;
      case SlideoutFilter.ReminderStatus:
        this.allPatientsRequest.FilterCriteria.ReminderStatus = selectedId;
        break;
      case SlideoutFilter.TreatmentPlanStates:
        this.allPatientsRequest.FilterCriteria.TreatmentPlanStates = selectedId;
        break;
      case SlideoutFilter.ZipCodes:
        this.allPatientsRequest.FilterCriteria.ZipCodes = selectedId;
        break;
    }

    if (filterHeader == SlideoutFilter.AppointmentStatusList) {
      if (selectedId?.length == 0) {
        this.allPatientsRequest.FilterCriteria.AppointmentStatusList = [SlideoutFilter.AppointmentStatusConfirmed];
        this.allPatientsRequest.FilterCriteria.IsScheduled = [SlideoutFilter.AppointmentStatusIsScheduled, SlideoutFilter.AppointmentStatusIsUnscheduled];
      }
    }

    // When under 'Patient/Non-Patients' filter 'All' checkbox is checked/unchecked -> removed the related properties from filter criteria
    if (filterHeader == SlideoutFilter.PatientTypeStatus) {      
      delete this.allPatientsRequest?.FilterCriteria?.IsActive;
      delete this.allPatientsRequest?.FilterCriteria?.IsPatient;
    }
  }
  //#endregion

  //#region 'Getter Properties'
  get birthMonthsArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.birthMonths as FormArray;
  }

  get insuranceArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.insurance as FormArray;
  }

  get preferredLocationArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.preferredLocation as FormArray;
  }

  get preventiveCareArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.preventiveCare as FormArray;
  }

  get reminderStatusArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.reminderStatus as FormArray;
  }

  get treatmentPlansArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.treatmentPlans as FormArray;
  }

  get zipCodesArray() {
    return this.slideoutFilter?.patientFilterForm?.controls?.zipCodes as FormArray;
  }
  //#endregion

  ngOnDestroy() {
    this.subscriptions?.forEach((subscription) => subscription?.unsubscribe());
  }
}
