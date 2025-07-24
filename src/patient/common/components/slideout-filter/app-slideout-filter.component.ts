import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, QueryList, ViewChildren, OnChanges, SimpleChanges } from '@angular/core';
import { PatientFliterCategory, PatientTabFilter } from '../../models/patient-grid-response.model';
import { PatientFilterService } from 'src/patient/service/patient-filter.service';
import { ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PatientAdditionalIdentifiers } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier';
import { OrderByPipe } from 'src/@shared/pipes';
import { PatientAdditionalIdentifierService } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { AllPatientGridFilter } from '../../models/patient-grid-filter.model';
import { TranslateService } from '@ngx-translate/core';
import { PatientSlideout, SlideoutFilter } from '../../models/enums/patient.enum';
import { BadgeFilterType } from '../../models/patient-location.model';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { AppDateSelectorComponent } from 'src/@shared/components/MigrationTransit/app-date-selector/app-date-selector.component';
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import isEqual from 'lodash/isEqual';
@Component({
  selector: 'app-slideout-filter',
  templateUrl: './app-slideout-filter.component.html',
  styleUrls: ['./app-slideout-filter.component.scss']
})
export class SlideoutFilterComponent implements OnInit, ControlValueAccessor, AfterViewInit, OnChanges {

  isFirstLoad = true;
  patientModel = new PatientTabFilter();
  patientModelArray: PatientTabFilter[] = [];
  additionalIdentifiers: PatientFliterCategory<string>[];
  hasIdentifiers = false;
  patientAdditionalIdentifiers: PatientAdditionalIdentifiers[];
  orderPipe = new OrderByPipe();
  patientFilterForm: FormGroup;
  treatmentPlanForm: FormGroup;
  isVisibleShowMorebutton = false;
  isVisibleShowLessbutton = false;
  appointmentDates: PatientFliterCategory<string>[];
  appointmentStates: PatientFliterCategory<string>[];
  groupTypes: PatientFliterCategory<string>[];
  patientTypes: PatientFliterCategory<string>[];
  preferredDentist: PatientFliterCategory<string>[];
  preferredHygienst: PatientFliterCategory<string>[];
  allPatientGridFilter: AllPatientGridFilter;
  defaultFilterCount: number = null;
  createdGte = null;
  createdLte = null;
  invalidDateRange = false;
  errorRequiredDate = this.translate.instant('A required date is missing');
  errorDateRange = this.translate.instant('Please enter a valid To and From date range');
  @Input() activeFltrTab: number; // To Do - This will need later for any changes with respect to selected tab
  @Input() activeGridData;
  showMoreLength = 4;
  showMoreStates: { [key: string]: boolean } = {};
  maxCreatedDate = new Date();
  defaultDate = '';
  defaultEmpty = true;
  nameArr: string[] = ["", ""];
  showLessText = this.translate.instant('Show Less');
  showMoreText = this.translate.instant('Show More');
  subscriptions: Array<Subscription> = new Array<Subscription>();
  appointmentState = ["0|Cancellation", "1|Missed"];
  isScheduled = ['true', 'false']
  appointmentStatusList = [];
  isExpandGroupTypes = false;
  isExpandPreferredDentists = false;
  isExpandPreferredHygienists = false;
  @Output() treatmentPlansData = new EventEmitter<{ id: string[], filterHeader: string }>();
  @Output() otherToDoData = new EventEmitter<{ id: string[], filterHeader: string }>();
  @Output() appointmentSlidoutData = new EventEmitter<{ id: string[], filterHeader: string }>();
  @Output() allPatientsData = new EventEmitter<{ id: string[], filterHeader: string }>();
  @Output() preventiveCareSlideoutData = new EventEmitter<{ id: string[], filterHeader: string }>();
  @ViewChildren("inpPlanName") treatmentPlanInput: QueryList<ElementRef>;
  @ViewChildren("date") dates: QueryList<AppDateSelectorComponent> = new QueryList<AppDateSelectorComponent>();

  constructor(private patientFilterService: PatientFilterService,
    private fb: FormBuilder,
    @Inject('toastrFactory') private toastrFactory,
    private patientAdditionalIdentifierService: PatientAdditionalIdentifierService,
    private translate: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.activeGridData) {
      //Filter data which is coming from the activeGridData
      const nv = changes?.activeGridData?.currentValue;
      const ov = changes?.activeGridData?.previousValue
      if (!isEqual(nv, ov)) {
        //Check if GroupTypes data changes
        if (!isEqual(nv?.GroupTypes, ov?.GroupTypes)) {
          this.getGroupTypes();
        }

        //Check if PreferredDentists data changes
        if (!isEqual(nv?.PreferredDentists, ov?.PreferredDentists)) {
          this.getPreferredDentist();
        }

        //Check if PreferredHygienists data changes
        if (!isEqual(nv?.PreferredHygienists, ov?.PreferredHygienists)) {
          this.getPreferredHygienist();
        }
        this.broadcastCurrentCount();
      }     
    }
  }

  ngAfterViewInit() {    
    this.getPatientAdditionalIdentifiers();
    if (this.activeFltrTab != BadgeFilterType.otherToDo) {
      this.getAppointmentDates();
      this.getAppointmentStates();
    }
    this.getGroupTypes();
    this.getPatientTypes();
    this.getPreferredDentist();
    this.getPreferredHygienist();
    this.broadcastCurrentCount();
    
    this.patientFilterService.disableDateInput = true;

    //Required to reset dates to null while resetting filter
    this.patientFilterService.getClearDateValues().subscribe((res: boolean) => {
      if (res) {
        this.dateRangeSelector(SlideoutFilter.All);
      }
    })

    // Pushing the static key for Appointment Status List to the array
    this.appointmentStatusList?.push(this.patientFilterService.appointmentStates?.find(x => x?.field == SlideoutFilter.AppointmentStatusList)?.key);
  }

  // Support ControlValueAccessor
  writeValue = () => { }
  onChange = () => { };
  onTouched = () => { };

  registerOnTouched = (fn) => {
    this.onTouched = fn;
  }
  registerOnChange = (fn) => {
    this.onChange = fn;
  }

  //#region "Init"
  ngOnInit(): void {
    this.createForm();
    this.allPatientGridFilter = new AllPatientGridFilter();
    this.broadcastCurrentCount();
  }
  //#endregion "Init"

  //#region "Form"
  createForm = () => {
    this.patientFilterForm = this.fb.group({
      additionalIdentifiers: new FormArray([]),
      appointmentDates: new FormArray([]),
      appointmentStates: new FormArray([]),
      birthMonths: new FormArray([]),
      groupTypes: new FormArray([]),
      insurance: new FormArray([]),
      patientTypes: new FormArray([]),
      preferredDentist: new FormArray([]),
      preferredHygienist: new FormArray([]),
      preferredLocation: new FormArray([]),
      preventiveCare: new FormArray([]),
      reminderStatus: new FormArray([]),
      treatmentPlans: new FormArray([]),
      zipCodes: new FormArray([])
    });
  }
  //#endregion "Form"

  //#region "Appointment Dates"
  getAppointmentDates = () => {
    if (this.activeFltrTab == BadgeFilterType.Appointments || this.activeFltrTab == BadgeFilterType.AllPatients) {
      this.appointmentDates = this.patientFilterService?.appointmentDates;
      this.appointmentDatesArray?.clear();
      // Add "All" option to the appointment dates array
      const control = { field: SlideoutFilter.BusinessDays, isSelected: true, isVisible: true, key: "", value: "" };
      this.appointmentDatesArray?.push(new FormControl(control));
      // For Appointment Dates mapping
      for (let i = 0; i < this.appointmentDates?.length; i++) {
        const index = this.appointmentDatesArray?.value?.findIndex(x => x?.value == this.appointmentDates[i]?.value);
        if (index < 0) {
          this.appointmentDatesArray?.push(new FormControl(this.appointmentDates[i]))
        }
      }
      const appointmentModel = this.patientFilterService.setCommonStructure('appointmentDateDiv', 'appointmentDateDiv', 'AppointmentDates', 'Appointment Date',
        this.appointmentDatesArray, this.appointmentDates);
      const index = this.patientModelArray?.findIndex(x => x?.dataTarget == appointmentModel?.dataTarget);
      if (index < 0) {
        this.patientModelArray?.push(appointmentModel);
      } else {
        this.patientModelArray[index] = appointmentModel;
      }
    }
  }
  //#endregion "Appointment Dates"

  //#region "Appointment Status"
  getAppointmentStates = () => {
    if (this.activeFltrTab == BadgeFilterType.Appointments || this.activeFltrTab == BadgeFilterType.AllPatients) {
      this.appointmentStatesArray?.clear();
      this.appointmentStates = [];
      this.appointmentStates = cloneDeep(this.patientFilterService?.appointmentStates);
      // Add "All" option to the appointment dates array
      const control = { field: "", isSelected: false, isVisible: true, key: "", value: "" };
      this.appointmentStatesArray?.push(new FormControl(control));
      if (this.activeFltrTab == BadgeFilterType.Appointments) {
        this.appointmentStates?.push({
          field: SlideoutFilter.AppointmentState,
          value: this.translate.instant('Cancelled'),
          key: '0|Cancellation',
          isSelected: true,
          isVisible: true
        },
          {
            field: SlideoutFilter.AppointmentState,
            value: this.translate.instant('Missed'),
            key: '1|Missed',
            isSelected: true,
            isVisible: true
          })
        this.appointmentStates.forEach(state => {
          if (state?.field == SlideoutFilter.IsScheduled || state?.field == SlideoutFilter.AppointmentState) {
            state.isSelected = true;
          } else if (state?.field == SlideoutFilter.AppointmentStatusList) {
            state.isSelected = false;
          }
        })
      }

      this.appointmentStates = this.orderPipe.transform(this.appointmentStates, { sortColumnName: "value", sortDirection: 1 });
      // For Appointment Dates mapping
      for (let i = 0; i < this.appointmentStates?.length; i++) {
        const index = this.appointmentStatesArray?.value?.findIndex(x => x?.value == this.appointmentStates[i]?.value);
        if (index < 0) {
          this.appointmentStatesArray?.push(new FormControl(this.appointmentStates[i]))
        }
      }
      const appointmentStatesModel = this.patientFilterService.setCommonStructure('apptStateDiv', 'apptStateDiv', 'AppointmentStates', 'Appointment State',
        this.appointmentStatesArray, this.appointmentStates);
      const index = this.patientModelArray?.findIndex(x => x?.dataTarget == appointmentStatesModel?.dataTarget);
      if (index < 0) {
        this.patientModelArray?.push(appointmentStatesModel);
      } else {
        this.patientModelArray[index] = appointmentStatesModel;
      }
    }
  }
  //#endregion "Appointment Status"

  //#region "Group Types"
  getGroupTypes = () => {
    this.groupTypes = this.patientFilterService?.setDefaultGroupTypes(this.isFirstLoad);
    this.groupTypesArray?.clear();
    
    // Iterate over the preferred location array
    this.activeGridData?.GroupTypes?.forEach(item => {
      const obj = { field: SlideoutFilter.GroupTypes, value: item?.Value, key: item?.Key, isVisible: true, isSelected: this.isFirstLoad ? true : this.patientFilterService.checkKeyAndItemInFilterCriteria(SlideoutFilter.GroupTypes, item?.Key) };
      this.groupTypes?.push(obj);
    });

    // Add "All" option to the group types array
    const control = { field: SlideoutFilter.GroupTypes, isSelected: this.patientFilterService.isSelectAllOption(this.groupTypes), isVisible: true, key: "", value: "" };
    this.groupTypesArray?.push(new FormControl(control));

    // For Appointment Dates mapping
    for (let i = 0; i < this.groupTypes?.length; i++) {
      const index = this.groupTypesArray?.value?.findIndex(x => x?.value == this.groupTypes[i]?.value);
      if (index < 0) {
        this.groupTypesArray?.push(new FormControl(this.groupTypes[i]));
      }
    }
    const groupTypesModel = this.patientFilterService.setCommonStructure('groupTypesDiv', 'groupTypesDiv', 'GroupTypes', 'Group Types',
      this.groupTypesArray, this.groupTypes);
    const index = this.patientModelArray?.findIndex(x => x?.dataTarget == groupTypesModel?.dataTarget);
    if (index < 0) {
      this.patientModelArray?.push(groupTypesModel);
    } else {
      this.patientModelArray[index] = groupTypesModel;
    }
    this.expandFilter(index, SlideoutFilter.GroupTypes);
  }
  //#endregion "Group Types"

  //#region "Patient Types"
  getPatientTypes = () => { 
    if (this.activeFltrTab != BadgeFilterType.Appointments) {
      this.patientTypes = cloneDeep(this.patientFilterService?.patientTypes);
      this.patientTypesArray?.clear();
      //  Add "All" option to the payment types array
      const control = { field: "", isSelected: false, isVisible: true, key: "", value: "" };
      this.patientTypesArray?.push(new FormControl(control));
      for (let i = 0; i < this.patientTypes?.length; i++) {
        const index = this.patientTypesArray?.value?.findIndex(x => x?.value == this.patientTypes[i]?.value);
        if (index < 0) {
          this.patientTypesArray?.push(new FormControl(this.patientTypes[i]))
        }
      }
      const patientTypesModel = this.patientFilterService.setCommonStructure('patientTypeStatus', 'patientTypeStatus', 'PatientTypeStatus', 'Patients/Non-Patients',
        this.patientTypesArray, this.patientTypes);
      const index = this.patientModelArray?.findIndex(x => x?.dataTarget == patientTypesModel?.dataTarget);
      if (index < 0) {
        this.patientModelArray?.push(patientTypesModel);
      } else {
        this.patientModelArray[index] = patientTypesModel;
      }
    }
  }
  //#endregion "Patient Types"

  //#region "Preferred Dentist"
  getPreferredDentist = () => {
    this.preferredDentist = this.patientFilterService?.setDefaultPreferredDentist(this.isFirstLoad);
    this.preferredDentistArray?.clear();
    // Iterate over the preferred location array
    this.activeGridData?.PreferredDentists?.forEach(item => {
      const obj = { field: SlideoutFilter.PreferredDentists, value: item?.Value, key: item?.Key, isVisible: true, isSelected: this.isFirstLoad ? true : this.patientFilterService.checkKeyAndItemInFilterCriteria(SlideoutFilter.PreferredDentists, item?.Key) };
      this.preferredDentist?.push(obj);
    });

    // Add "All" option to the preferred location array
    const control = { field: SlideoutFilter.PreferredDentists, isSelected: this.patientFilterService.isSelectAllOption(this.preferredDentist), isVisible: true, key: "", value: "" };
    this.preferredDentistArray?.push(new FormControl(control));

    // For Appointment Dates mapping
    for (let i = 0; i < this.preferredDentist?.length; i++) {
      const index = this.preferredDentistArray?.value?.findIndex(x => x?.value == this.preferredDentist[i]?.value);
      if (index < 0) {
        this.preferredDentistArray?.push(new FormControl(this.preferredDentist[i]))
      }
    }
    const preferredDentistModel = this.patientFilterService.setCommonStructure('preferredDentistsDiv', 'preferredDentistsDiv', 'PreferredDentists', 'Preferred Dentist',
      this.preferredDentistArray, this.preferredDentist);
    const index = this.patientModelArray?.findIndex(x => x?.dataTarget == preferredDentistModel?.dataTarget);
    if (index < 0) {
      this.patientModelArray?.push(preferredDentistModel);
    } else {
      this.patientModelArray[index] = preferredDentistModel;
    }
    this.expandFilter(index, SlideoutFilter.PreferredDentists);
  }
  //#endregion "Preferred Dentist"

  //#region "Preferred Hygienist"
  getPreferredHygienist = () => {
    this.preferredHygienst = this.patientFilterService?.setDefaultPreferredHygienst(this.isFirstLoad);
    this.preferredHygienistArray?.clear();
   
    // Iterate over the preferred location array
    this.activeGridData?.PreferredHygienists?.forEach(item => {
      const obj = { field: SlideoutFilter.PreferredHygienists, value: item?.Value, key: item?.Key, isVisible: true, isSelected: this.isFirstLoad ? true : this.patientFilterService.checkKeyAndItemInFilterCriteria(SlideoutFilter.PreferredHygienists, item?.Key) };
      this.preferredHygienst?.push(obj);
    });

    // Add "All" option to the preferred hygienist array
    const control = { field: SlideoutFilter.PreferredHygienists, isSelected: this.patientFilterService.isSelectAllOption(this.preferredHygienst), isVisible: true, key: "", value: "" };
    this.preferredHygienistArray?.push(new FormControl(control));

    // For Appointment Dates mapping
    for (let i = 0; i < this.preferredHygienst?.length; i++) {
      const index = this.preferredHygienistArray?.value?.findIndex(x => x?.value == this.preferredHygienst[i]?.value);
      if (index < 0) {
        this.preferredHygienistArray?.push(new FormControl(this.preferredHygienst[i]))
      }
    }
    const preferredHygienistModel = this.patientFilterService.setCommonStructure('preferredHygienistsDiv', 'preferredHygienistsDiv', 'PreferredHygienists', 'Preferred Hygienist',
      this.preferredHygienistArray, this.preferredHygienst);
    const index = this.patientModelArray?.findIndex(x => x?.dataTarget == preferredHygienistModel?.dataTarget);
    if (index < 0) {
      this.patientModelArray?.push(preferredHygienistModel);
    } else {
      this.patientModelArray[index] = preferredHygienistModel;
    }
    this.expandFilter(index, SlideoutFilter.PreferredHygienists);
  }
  //#endregion "Preferred Dentist"

  //#region "Getter Properties"
  get additionalIdentifierArray() {
    return this.patientFilterForm?.controls?.additionalIdentifiers as FormArray;
  }

  get appointmentDatesArray() {
    return this.patientFilterForm?.controls?.appointmentDates as FormArray;
  }

  get appointmentStatesArray() {
    return this.patientFilterForm?.controls?.appointmentStates as FormArray;
  }

  get groupTypesArray() {
    return this.patientFilterForm?.controls?.groupTypes as FormArray;
  }

  get patientTypesArray() {
    return this.patientFilterForm?.controls?.patientTypes as FormArray;
  }

  get preferredDentistArray() {
    return this.patientFilterForm?.controls?.preferredDentist as FormArray;
  }

  get preferredHygienistArray() {
    return this.patientFilterForm?.controls?.preferredHygienist as FormArray;
  }

  //#endregion "Getter Properties"

  //#region "Additional Identifiers"
  getPatientAdditionalIdentifiers = () => {
    this.patientAdditionalIdentifierService.get().then(res => {
      this.patientAdditionalIdGetSuccess(res);
    }, () => {
      this.patientAdditionalIdGetFailure();
    })
  }

  patientAdditionalIdGetSuccess = (res) => {
    this.patientAdditionalIdentifiers = res?.Value != null ? res?.Value : [];
    this.patientFilterService.setAdditionalIdentifiers(this.patientAdditionalIdentifiers);
    this.additionalIdentifiers = this.patientFilterService.setDefaultAdditionalIdentifiers(this.isFirstLoad);
    this.additionalIdentifierArray?.clear();
    if (this.patientAdditionalIdentifiers?.length > 0) {    
      // Using order by from lodash to sort the additional identifiers, as using orderByPipe is changing the order of the 
      // additional identifers and causing the issue while filtering and we are not getting the expected response from the API
      // To Do - Check the orderByPipe and fix the issue 
      const sortedAI = orderBy(this.patientAdditionalIdentifiers, ['Description'], ['asc']);
      sortedAI?.forEach(item => {
        this.additionalIdentifiers?.push({
          field: this.translate.instant('AdditionalIdentifiers'),
          value: item?.Description,
          key: item?.MasterPatientIdentifierId,
          isVisible: this.patientAdditionalIdentifiers?.length > 4 ? false : true,
          isSelected: this.isFirstLoad ? true : this.patientFilterService.isItemSelected('AdditionalIdentifiers', item?.Key)
        });
      });
    }

    this.hasIdentifiers = this.patientAdditionalIdentifiers?.length > 0 ? true : false;
    // Update IsVisible for first 5 AI to true
    this.additionalIdentifiers?.map((v, i) => v ? (i < 5) ? this.additionalIdentifiers[i].isVisible = true : false : false);
    // Add "All" option to the additional identifiers array
    const control = { field: SlideoutFilter.AdditionalIdentifiers, isSelected: true, isVisible: true, key: "", value: "" };
    this.additionalIdentifierArray.push(new FormControl(control));
    // using form array for Additional identifier mapping
    for (let i = 0; i < this.additionalIdentifiers?.length; i++) {
      const index = this.additionalIdentifierArray?.value?.findIndex(x => x?.value == this.additionalIdentifiers[i]?.value);
      if (index < 0) {
        this.additionalIdentifierArray?.push(new FormControl(this.additionalIdentifiers[i]))
      }
    }
    const additionIdenModel = this.patientFilterService.setCommonStructure('additionalIdentifiersDiv', 'additionalIdentifiersDiv', 'AdditionalIdentifiers', 'Additional Identifiers',
      this.additionalIdentifierArray, this.additionalIdentifiers);
    const index = this.patientModelArray?.findIndex(x => x?.dataTarget == additionIdenModel?.dataTarget);
    if (index < 0) {
      this.patientModelArray?.unshift(additionIdenModel);
    } else {
      this.patientModelArray[index] = additionIdenModel;
    }
  }

  patientAdditionalIdGetFailure = () => {
    this.patientAdditionalIdentifiers = [];
    this.toastrFactory.error(this.translate.instant('Failed to retrieve the list of patient additional identifiers. Refresh the page to try again.'), this.translate.instant('Error'));
  }
  //#endregion "Additional Identifiers"

  //#region "ALL"
  selectAll = (formControlIndex, event, filterValue) => {
    if (event?.target?.checked) {
      this.patientModelArray[formControlIndex]?.filter?.forEach(x => x.isSelected = true);
      this.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected = true;
    } else if (event?.target?.type == 'checkbox') {
      this.patientModelArray[formControlIndex]?.filter?.forEach(x => x.isSelected = false);
      this.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected = false;
    } else if (event?.target?.type == 'radio') {
      //Reset all the values to false from the formArray
      this.patientModelArray[formControlIndex]?.formArray?.controls?.map(item => {
        item.value.isSelected = false,
          item?.value?.isVisible, item?.value?.key, item?.value?.value
      });
      //Set the selected value to true from the formArray
      this.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected = true;
    }
    if (this.patientModelArray[formControlIndex]?.filter[0]?.field == SlideoutFilter.TreatmentPlanCreatedDateField) {
      this.dateRangeSelector(filterValue);
    }
    if (this.activeFltrTab != BadgeFilterType.Appointments) {
      //Custom logic when under 'Patient/Non-Patients' filter 'All' checkbox is checked -> related properties from filter criteria should be removed
      if(this.patientModelArray[formControlIndex]?.divUlId == SlideoutFilter.PatientTypeStatus){
          this.setPatientModel([], SlideoutFilter.PatientTypeStatus);
      }else
        this.setPatientModel([], this.patientModelArray[formControlIndex]?.filter[0]?.field);
    } else {
      // Handle custom logic for appointment state for Appointment TAB
      this.checkAppointmentStateFilter(event, formControlIndex);
    }
  }
  //#endregion

  //#region  "Check Appointment State Filter"
  checkAppointmentStateFilter = (event, index) => {
    if (this.patientModelArray[index]?.filter[0]?.field == SlideoutFilter.AppointmentState) {
      if (event?.target?.checked) {
        this.setPatientModel(this.appointmentState, SlideoutFilter.AppointmentState);
        this.setPatientModel(this.isScheduled, SlideoutFilter.IsScheduled);
        this.setPatientModel(this.appointmentStatusList, SlideoutFilter.AppointmentStatusList);
      } else {
        this.setPatientModel([], SlideoutFilter.AppointmentState);
        this.setPatientModel([], SlideoutFilter.IsScheduled);
        this.setPatientModel([], SlideoutFilter.AppointmentStatusList);
      }
    } else {
      this.setPatientModel([], this.patientModelArray[index]?.filter[0]?.field);
    }
  }
  //#endregion

  //#region "Toggle"
  toggleSelect = (filterValue, filterHeader, selectedIndex, formControlIndex, event) => {
    this.isFirstLoad = false;
    let tempAddId = [];
    this.checkAllFilters(filterValue, filterHeader, event, formControlIndex, selectedIndex);
    // Uncheck the "All" option if it's any other option is unchecked
    if (!event?.target?.checked) {
      this.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected = false;
    } else if (event?.target?.type == 'checkbox') {
      const checkUnselectedFilter = this.patientModelArray[formControlIndex]?.filter?.find(item => item.isSelected == false);
      if (!checkUnselectedFilter)
        this.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected = true;
    } else if (event?.target?.type == 'radio') {
      if (this.patientModelArray[formControlIndex]?.filter[0]?.field == SlideoutFilter.TreatmentPlanCreatedDateField) {
        this.dateRangeSelector(filterValue);
      }
      //Reset all the values to false from the formArray
      this.patientModelArray[formControlIndex]?.formArray?.controls?.map(item => {
        item.value.isSelected = false,
          item?.value?.isVisible, item?.value?.key, item?.value?.value
      });
      //Set the selected value to true from the formArray
      if(this.patientModelArray[formControlIndex]?.formArray?.controls[(Number(selectedIndex) + 1)]?.value?.isSelected)
        this.patientModelArray[formControlIndex].formArray.controls[(Number(selectedIndex) + 1)].value.isSelected = true;
      
      //Reset all the values to false from the filter
      this.patientModelArray[formControlIndex]?.filter?.map(item => {
        item.isSelected = false,
          item?.isVisible, item?.key, item?.value
      });
      //Set the selected value to true from the filter
      this.patientModelArray[formControlIndex].filter[selectedIndex].isSelected = true;
    }

    if (filterHeader == SlideoutFilter.TreatmentPlan) {
      this.setTreatmentPlanFilterValues(formControlIndex);
    }

    tempAddId = this.patientModelArray[formControlIndex]?.filter?.map((v, i) => v ?
      this.patientModelArray[formControlIndex]?.filter[i]?.isSelected == true
        && this.patientModelArray[formControlIndex]?.filter[i]?.field.toLowerCase() == filterHeader.toLowerCase() ?
        this.patientModelArray[formControlIndex]?.filter[i]?.key : null : null)
      .filter(v => v !== null);
    this.broadcastCurrentCount();
    this.setPatientModel(tempAddId, filterHeader);
  }

  broadcastCurrentCount = () => {
    let totalSelected = 0;
    for (const filter of this.patientModelArray) {
      if (filter?.divUlId != SlideoutFilter.AppointmentDates && filter?.divUlId != SlideoutFilter.InsuranceFilter
        && filter?.divUlId != SlideoutFilter.CreatedDateList && filter?.divUlId != SlideoutFilter.DueDateItems) {
        totalSelected += filter?.filter?.filter(item => item?.isSelected)?.length;
      }
      else if ((filter?.divUlId == SlideoutFilter.AppointmentDates || filter?.divUlId == SlideoutFilter.InsuranceFilter || filter?.divUlId == SlideoutFilter.DueDateItems) && filter?.filter?.some(item => item?.isSelected)) {
        totalSelected++;
      }
    }
    if (this.defaultFilterCount === null) {
      this.defaultFilterCount = totalSelected;
    } else {
      totalSelected = (this.defaultFilterCount) + (totalSelected) - (this.defaultFilterCount);
    }
    this.patientFilterService.broadcastSelectedCount(totalSelected);
  }
  //#endregion "Toggle"

  //#region "Set Patient Model"
  setPatientModel = (tempAddId: string[], filterHeader: string) => {
    if (this.activeFltrTab == BadgeFilterType.TreatmentPlans) {
      this.treatmentPlansData?.emit({ id: tempAddId, filterHeader: filterHeader });
    } else if (this.activeFltrTab == BadgeFilterType.otherToDo) {
      this.otherToDoData?.emit({ id: tempAddId, filterHeader: filterHeader });
    } else if (this.activeFltrTab == BadgeFilterType.Appointments) {
      this.appointmentSlidoutData?.emit({ id: tempAddId, filterHeader: filterHeader });
    } else if (this.activeFltrTab == BadgeFilterType.AllPatients) {
      this.allPatientsData?.emit({ id: tempAddId, filterHeader: filterHeader });
    } else if (this.activeFltrTab == BadgeFilterType.PreventiveCare) {
      this.preventiveCareSlideoutData?.emit({ id: tempAddId, filterHeader: filterHeader });
    }
  }
  //#endregion

  //#region "Check/Uncheck filters"
  checkAllFilters = (filterValue, filterHeader, event, formControlIndex, selectedIndex) => {
    switch (filterHeader) {
      case PatientSlideout.SoonerIfPossible:
        this.patientModelArray[formControlIndex].filter[selectedIndex].isSelected =
          !this.patientModelArray[formControlIndex]?.filter[selectedIndex].isSelected;
        break;
      default:
        this.patientModelArray[formControlIndex].filter[selectedIndex].isSelected =
          !this.patientModelArray[formControlIndex]?.filter[selectedIndex].isSelected;
        break;
    }
  }
  //#endregion "Check/Uncheck filters"

  //#region "Show More/Less"
  toggleShowMore(filterId: string) {
    if (this.showMoreStates[filterId] == undefined) {
      this.showMoreStates[filterId] = true;
    } else {
      this.showMoreStates[filterId] = !this.showMoreStates[filterId];
    }
  }
  shouldShowMore(filterId: string): boolean {
    return this.showMoreStates[filterId];
  }
  //#endregion "Show More/Less"

  //#region "checked"
  isChecked(formControlIndex: number): boolean {
    const isSelected = this.patientModelArray[formControlIndex]?.formArray?.controls[0]?.value?.isSelected;
    return isSelected == true ? true : false;
  }
  //#endregion "checked"

  //#region "Expand-Collapse"
  expandCollapse = (index: number) => {
    this.patientModelArray[index].isExpanded = !this.patientModelArray[index]?.isExpanded;
    const tempIndex = this.patientFilterService.expandedState?.findIndex(x=> x?.Index == index);
    if(tempIndex > -1){
      this.patientFilterService.expandedState[tempIndex].IsExpanded = this.patientModelArray[index]?.isExpanded;
    } else {
      this.patientFilterService.expandedState?.push({ Index: index, IsExpanded: this.patientModelArray[index]?.isExpanded});
    }
    const patientModelArrayCount = this.patientModelArray?.filter(x => x?.filterText != "")?.length;
    const expandedCount = this.patientModelArray.filter(x => x?.isExpanded == true && x?.filterText != "")?.length;
    const collapseCount = this.patientModelArray.filter(x => x?.isExpanded == false && x?.filterText != "")?.length;

    if (expandedCount == patientModelArrayCount) {
      this.patientFilterService?.setExpandCollapse(true)
    }
    if (collapseCount == patientModelArrayCount) {
      this.patientFilterService?.setExpandCollapse(false)
    }
  }
  //#endregion "Expand-Collapse"

  //#region "Date Selection"
  onDateChanged = (date: Date, index: number) => {
    this.invalidDateRange = false;
    if (index == 0) { // From Date selected
      this.createdGte = date;
    } else { // To Date selected
      this.createdLte = date;
    }
    if (this.createdGte && this.createdLte) {
      if (this.createdGte > this.createdLte) {
        this.invalidDateRange = true;
      }
    }
    const dateArray = [this.createdGte ? moment(this.createdGte)?.format('MM/DD/YYYY') : this.createdGte,
    this.createdLte ? moment(this.createdLte)?.format('MM/DD/YYYY') : this.createdLte];
    this.setPatientModel(dateArray, SlideoutFilter.TreatmentPlanCreatedDate);
  }

  dateRangeSelector = (filterValue: string) => {
    if (filterValue && filterValue == SlideoutFilter.All) {
      this.patientFilterService.disableDateInput = true;
      this.invalidDateRange = false;
      this.createdGte = null;
      this.createdLte = null;
      this.dates.map(x => x.selectedDate = null);
      this.setPatientModel(["", ""], SlideoutFilter.TreatmentPlanCreatedDate);
    } else {
      this.patientFilterService.disableDateInput = false;
    }
  }
  //#endregion

  //#region "Treatment Plan Name"
  inputValue = (val, index: number, filter: string) => {
    //Need to check
    const filterIndex = this.patientModelArray?.findIndex(x => x?.dataTarget == filter);
    const tempData = this.patientModelArray[filterIndex]?.formArray?.controls;
    if (tempData) {
      if (tempData[index + 1]?.value?.isSelected) {
        this.nameArr[index] = val?.target?.value; //To clear the first value
      }
      else {
        this.nameArr[index] = ""; //To clear the first value
      }
    }
    this.setPatientModel(this.nameArr, SlideoutFilter.TreatmentPlanName);
  }

  setTreatmentPlanFilterValues = (formControlIndex: number) => {
    const tempData = this.patientModelArray[formControlIndex]?.formArray?.controls;
    if (tempData) {
      tempData.map((item, index) => {
        if (index > 0) {//TO Skip selection of first value
          if (item?.value?.isSelected) {
            this.nameArr[index - 1] = this.treatmentPlanInput?.toArray()[index - 1]?.nativeElement?.value;
          }
          else {
            this.nameArr[index - 1] = "";
          }
        }
      })
      this.setPatientModel(this.nameArr, SlideoutFilter.TreatmentPlanName);
    }
  }
  //#endregion

  //#region "expandFilter"
  expandFilter = (index: number, filter: string) => {
    if(!this.isFirstLoad){
      const isExpanded = this.patientFilterService.expandedState?.find(x => x?.Index == index)?.IsExpanded ? true : false;
      switch(filter) {
        case SlideoutFilter.PreferredDentists:
          this.isExpandPreferredDentists = isExpanded;
          break;
        case SlideoutFilter.PreferredHygienists:
          this.isExpandPreferredHygienists = isExpanded;
          break;
        case SlideoutFilter.GroupTypes:
          this.isExpandGroupTypes = isExpanded;
          break;
      }
      this.patientModelArray[index].isExpanded = isExpanded;
    }
  }
  //#endregion
}
