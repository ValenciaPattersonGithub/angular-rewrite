import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PatientGridColumnSetting } from './patient-grid.model';
import { DateRangeFilterType, DateRangeFilterTypes, NumericRangeFilterTypes, TextFilterType } from 'src/patient/common/models/patient-grid-filter.model';
import { AppointmentStatus, AppointmentStatusDataService } from 'src/scheduling/appointment-statuses';
import { KeyValuePair } from 'src/patient/common/models/patient-grid-response.model';
import {  OtherToDoColumnsFields, PatientColumnsFields, PatientSortField, PatientSortOrder } from 'src/patient/common/models/enums/patient.enum';
import { CompositeFilterDescriptor, SortDescriptor, State } from '@progress/kendo-data-query';
import { BadgeFilterType } from 'src/patient/common/models/patient-location.model';
import { GridComponent, GridDataResult } from '@progress/kendo-angular-grid';
import { Observable, Subscription, of } from 'rxjs';
import isEqual from 'lodash/isEqual';
import { PatientFilterService } from 'src/patient/service/patient-filter.service';
import { AllBadgesFilterCriteria } from 'src/patient/common/models/patient-grid-request.model';
import { AllPatientGridSort, AppointmentGridSort, OtherToDoGridSort, PreventiveGridSort, TreatmentGridSort } from 'src/patient/common/models/patient-grid-sort.model';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'patient-grid',
  templateUrl: './patient-grid.component.html',
  styleUrls: ['./patient-grid.component.scss']
})
export class PatientGridComponent implements OnInit, OnChanges,OnDestroy, ControlValueAccessor {
  @Input() gridData: [];
  @Input() columns: PatientGridColumnSetting;
  @Input() navToPatientProfile: (dataItem) => void;
  @Input() toCreateAppointment: (patientId: string) => void;
  @Input() openAppointmentPopup: (appointmentId: string, patientAccountId: string, classification:string) => void;
  @Input() showApptToolTip: (dataItem, field) => void;
  @Input() openCommunicationModal: (patientId: string, tabIdentifier: number, patientCommunication: boolean) => void;
  @Input() showTreatmentPlanToolTip: (event, curpatientId) => void;
  @Input() hideTreatmentPlan: () => void;
  @Input() getTxClass: (status) => void;
  @Input() navigateTxPlan: (patientId, treatmentPlanId) => void;
  @Input() isMouseUp = false;
  @Input() keepShow = true;
  @Input() txPlansHover: [];
  @Input() totalRecords = 0;
  @Input() activeFltrTab: number;
  @Input() loading: boolean;
  @Input() gridFilterDate: AllBadgesFilterCriteria;

  @Output() onApplyDateRangeFilter = new EventEmitter<{ data: { startDate: Date, endDate: Date }, dateFieldType: string }>();
  @Output() onApplyNumericRangeFilter = new EventEmitter<{ from: number, to: number }>();
  @Output() onAppointmentStatusFilter = new EventEmitter<{ selectedStatus: number, field: string }>();
  @Output() onTextValuefilter = new EventEmitter();
  @Output() onGetSortedData = new EventEmitter<{sortField:string, sortDirection: number}>();

  dateRangeFilter: DateRangeFilterTypes = new DateRangeFilterTypes();
  numericRangeFilter: NumericRangeFilterTypes = new NumericRangeFilterTypes();
  subscriptions: Subscription[];

  @ViewChild("patientGrid") patientGrid: GridComponent;

  // Property for accessing Enums
  public get dateRangeFilterType(): typeof DateRangeFilterType {
    return DateRangeFilterType;
  }

  public get patientColumnsFields(): typeof PatientColumnsFields {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return PatientColumnsFields;
  }

  public get otherToDoColumnsFields(): typeof OtherToDoColumnsFields {
    return OtherToDoColumnsFields;
  }

  showDobPopOver = false
  showLastApptPopOver = false;
  showNextApptPopOver = false;
  showPreventiveCarePopOver = false;
  showLastCommunicationPopOver = false;
  dueDatePopOver = false;
  showAppointmentsPopOver = false; 
  showOtherToDoLastApptPopOver = false;

  patientfromDate: Date = null;
  patienttoDate: Date = null;
  displayFullDateRange = null;
  showPopOver = false
  fromDate = this.translate.instant('From: ');
  toDate = this.translate.instant(' To: ');
  dynamicAmfa = 'soar-per-perdem-view';
  tooltipContent;
  currentPatientId: string;
  appointmentStatuses: AppointmentStatus[];
  appointmentFilterList: KeyValuePair<number, string>[];
  loadingText = this.translate.instant('Loading...');
  currentIndex: number;
  gridfilterTextvalue = [];
  textFilterType = TextFilterType
  noValue = this.translate.instant('N/A');
  sortDirection = 0;
  public defaultItem: { Value: string, Key: number } = {
    Value: this.translate.instant('-Select-'),
    Key: null,
  };
  public popupSettings = { width: 'auto', popupClass: 'appointment-FilterList' };
  public filter: CompositeFilterDescriptor = {logic: 'and', filters: []};
  textFieldFilter: FormGroup;

  public state: State = {
      skip: 0,
      take: 50,
      sort: []
  };
  
  public patientGridData: Observable<GridDataResult>;

  constructor(private translate: TranslateService, private appointmentStatusDataService: AppointmentStatusDataService, 
    private patienFilterService: PatientFilterService, public fb: FormBuilder) { }

  // Support ControlValueAccessor
  writeValue = () => { }
  onChange = () => { };
  onTouched = () => { };

  registerOnTouched(fn) {
    this.onTouched = fn;
  }
  registerOnChange(fn) {
    this.onChange = fn;
  }

  ngOnInit(): void {
    this.appointmentFilterList = [];
    this.textFieldFilter = this.fb?.group({
      nameField: [''],
      responsiblePartyField: [''],
      otherStatusField: [''],

    });
    this.appointmentStatuses = this.appointmentStatusDataService.getAppointmentStatusesForPatientGrid();
    if (this.appointmentStatuses ) {
      this.appointmentFilterList = this.appointmentStatuses.filter(x=>x.visibleInPatientGrid==true).map(x=>{return {Key:x.id,Value:this.translate.instant(x.description)}});   
      this.appointmentFilterList = this.appointmentFilterList.sort((a, b) => a?.Key - b?.Key);
    }

    this.registerTextFieldsObserver(this.textFieldFilter?.controls?.nameField, TextFilterType.Name);
    this.registerTextFieldsObserver(this.textFieldFilter?.controls?.responsiblePartyField, TextFilterType.ResponsibleParty);
    this.registerTextFieldsObserver(this.textFieldFilter?.controls?.otherStatusField, TextFilterType.Status);
  }

  registerTextFieldsObserver = (control: AbstractControl, field: string) =>{
    const subscription: Subscription =
    control?.valueChanges?.pipe(
      debounceTime(500)
    )?.subscribe(searchTerm => {
      const filterData = { field: field, operator: 'contains', value: searchTerm };
      if(control?.dirty)
        this.onTextValuefilter.emit(filterData);
    });
    this.subscriptions?.push(subscription);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      const nv = changes?.activeFltrTab?.previousValue;
      const ov = changes?.activeFltrTab?.currentValue;
      if (nv != ov && nv && ov) {
        // Make controls untouched on changing badges
        this.textFieldFilter?.controls?.nameField?.markAsPristine();
        this.textFieldFilter?.controls?.responsiblePartyField?.markAsPristine();
        this.textFieldFilter?.controls?.otherStatusField?.markAsPristine();
        //Reset grid and currentpage when badge changes
        this.patientGridData = of({ data: [], total: 0 });
        this.patienFilterService.CurrentPage = 0;
        
        this.patientGrid.sort = [];
        
        switch (this.activeFltrTab) {
          case BadgeFilterType.AllPatients:
            if(this.gridFilterDate?.allPatients?.FilterCriteria)
              this.applyStoreData(this.gridFilterDate?.allPatients?.FilterCriteria);
              this.setInitialSorting(this.gridFilterDate?.allPatients?.SortCriteria);
          break;
          case BadgeFilterType.PreventiveCare:
            if(this.gridFilterDate?.preventiveCare?.FilterCriteria)
              this.applyStoreData(this.gridFilterDate?.preventiveCare?.FilterCriteria);
              this.setInitialSorting(this.gridFilterDate?.preventiveCare?.SortCriteria);
          break;
          case BadgeFilterType.TreatmentPlans:
            if(this.gridFilterDate?.tratmentPlans?.FilterCriteria)
              this.applyStoreData(this.gridFilterDate?.tratmentPlans?.FilterCriteria);
              this.setInitialSorting(this.gridFilterDate?.tratmentPlans?.SortCriteria);
          break;
          case BadgeFilterType.Appointments:
            if(this.gridFilterDate?.appointments?.FilterCriteria)
              this.applyStoreData(this.gridFilterDate?.appointments?.FilterCriteria);
              this.setInitialSorting(this.gridFilterDate?.appointments?.SortCriteria);
          break;
          case BadgeFilterType.otherToDo:
            if(this.gridFilterDate?.otherToDo?.FilterCriteria)
              this.applyStoreData(this.gridFilterDate?.otherToDo?.FilterCriteria);
              this.setInitialSorting(this.gridFilterDate?.otherToDo?.SortCriteria);
          break;
          default:
            if(this.gridFilterDate?.allPatients?.FilterCriteria) 
              this.applyStoreData(this.gridFilterDate?.allPatients?.FilterCriteria);
              this.setInitialSorting(this.gridFilterDate?.allPatients?.SortCriteria);
            break;
        }
      }      
      
      if (!isEqual(changes?.gridData?.previousValue, changes?.gridData?.currentValue) && this.gridData) {
        this.patientGridData = of({ data: this.gridData, total: this.gridData?.length });        
      } 
      
      if (changes?.loading && this.patientGrid) {
        // Update the loading property based on the new value of isLoading
        this.patientGrid.loading = this.loading;
      }
    }
  }

  applyStoreData = (value) => {
    this.textFieldFilter?.controls?.nameField?.setValue(value?.PatientName?.length ? value?.PatientName : "");
    this.textFieldFilter?.controls?.responsiblePartyField?.setValue(value?.ResponsiblePartyName?.length ? value?.ResponsiblePartyName: "");
    this.textFieldFilter?.controls?.statusField?.setValue(value?.IsComplete ?.length ? value?.IsComplete: "");
    this.dateRangeFilter.PatientDateOfBirthFrom = value?.PatientDateOfBirthFrom;
    this.dateRangeFilter.PatientDateOfBirthTo = value?.PatientDateOfBirthTo;
    this.dateRangeFilter.PreviousAppointmentDateFrom = value?.PreviousAppointmentDateFrom;
    this.dateRangeFilter.PreviousAppointmentDateTo = value?.PreviousAppointmentDateTo;
    this.dateRangeFilter.NextAppointmentDateFrom = value?.NextAppointmentDateFrom;
    this.dateRangeFilter.NextAppointmentDateTo = value?.NextAppointmentDateTo;
    this.dateRangeFilter.PreventiveCareDueDateFrom = value?.PreventiveCareDueDateFrom;
    this.dateRangeFilter.PreventiveCareDueDateTo = value?.PreventiveCareDueDateTo;
    this.dateRangeFilter.AppointmentDateFrom = value?.AppointmentDateFrom;
    this.dateRangeFilter.AppointmentDateTo = value?.AppointmentDateTo;
    this.dateRangeFilter.LastCommunicationFrom = value?.LastCommunicationFrom;
    this.dateRangeFilter.LastCommunicationTo = value?.LastCommunicationTo;
    this.dateRangeFilter.DueDateFrom =  value?.DueDateFrom;
    this.dateRangeFilter.DueDateTo = value?.DueDateTo;
    if(value?.AppointmentStatus){
      const obj = this.appointmentFilterList.find(x => x.Key == value?.AppointmentStatus);
      this.defaultItem = { Value: obj.Value, Key: Number(value?.AppointmentStatus)};
    }
    this.numericRangeFilter.TreatmentPlanCountTotalFrom = value?.TreatmentPlanCountTotalFrom;
    this.numericRangeFilter.TreatmentPlanCountTotalTo = value?.TreatmentPlanCountTotalTo;
  }

  applyAction = (data) => {
    this.patientfromDate = data?.startDate;
    this.patienttoDate = data?.endDate;
    this.showPopOver = false;
    this.displayFullDateRange = `${String(this.fromDate)} ${String(this.patientfromDate)} ${String(this.toDate)} ${String(this.patienttoDate)}`;
  }

  //navigating to patient
  triggerNavToPatientProfile = (id: string) => {
    if (this.navToPatientProfile) {
      this.navToPatientProfile(id);
    }
  }

  // to open appointment modal
  createAppointments = (patientId: string) => {
    if (this.toCreateAppointment) {
      this.toCreateAppointment(patientId);
    }
  }

  //Open Appointment popup
  navigateToAppointment= (appointmentId: string, patientAccountId: string, classification = "") => {
    if (this.openAppointmentPopup) {
      this.openAppointmentPopup(appointmentId, patientAccountId, classification);
    }
  }

  //show tooltip for lastAppt and nextAppt
  populateTooltipContent = (dataItem, field: string) => {
    if (this.showApptToolTip) {
      this.tooltipContent = this.showApptToolTip(dataItem, field);
    }
  }

  //navigate to communication page.
  openLastCommunicationModal = (patientId: string, tabIdentifier: number, patientCommunication: boolean) => {
    if (this.openCommunicationModal) {
      this.openCommunicationModal(patientId, tabIdentifier, patientCommunication);
    }
  }

  showTooltip = (event, curpatientId, currentIndex) => {
    this.currentPatientId = curpatientId;
    this.currentIndex = currentIndex;
    if (this.showTreatmentPlanToolTip) {
      this.showTreatmentPlanToolTip(event, curpatientId);
    }
  }

  hideTxPlan = () => {
    this.currentPatientId = '';
    if (this.hideTreatmentPlan) {
      this.hideTreatmentPlan();
    }
  }

  getClass = (status) => {
    if (this.getTxClass) {
      return this.getTxClass(status)
    }
    return '';
  }

  navToPatientTxPlan = (patientId: string, treatmentPlanId: string) => {
    if (this.navigateTxPlan) {
      this.navigateTxPlan(patientId, treatmentPlanId);
    }
  }

  onPopupOpen = (type: string) => {
    this.showDobPopOver = (type == DateRangeFilterType.DateOfBirth);
    this.showLastApptPopOver = (type == DateRangeFilterType.LastAppointment);
    this.showNextApptPopOver = (type == DateRangeFilterType.NextAppointment);
    this.showPreventiveCarePopOver = (type == DateRangeFilterType.PreventiveCare);
    this.showLastCommunicationPopOver = (type == DateRangeFilterType.LastCommunication);
    this.dueDatePopOver = (type == DateRangeFilterType.DueDate);
    this.showAppointmentsPopOver = (type == DateRangeFilterType.Appointments);
    this.showOtherToDoLastApptPopOver = (type == DateRangeFilterType.OtherToDoLastAppointment);
  }

  applyDateRangeFilter = (data: { startDate: Date, endDate: Date }, field: string) => {
    this.onApplyDateRangeFilter.emit({ data: data, dateFieldType: field });
  }

  applyNumericRangeFilter = (data: { from: number, to: number }) => {
    const response = { from: data?.from, to: data?.to };
    this.onApplyNumericRangeFilter.emit(response);
  }

  clearField = ( fieldFilter: string) => {
    this.textFieldFilter?.controls[`${fieldFilter}Field`]?.setValue("");   
    this.textFieldFilter?.controls[`${fieldFilter}Field`]?.markAsDirty();   
  }
  
  onAppointmentStatusChanged = (event, field: string) => {
    this.onAppointmentStatusFilter.emit({ selectedStatus: event?.Key, field: field });
  }

  sortChange(sortDescriptor: SortDescriptor[]): void {
    this.state.sort = sortDescriptor;
    //if data is present in database filter on database data
    if (this.gridData?.length > 0) {      
      if (sortDescriptor[0]?.dir == PatientSortOrder.asc) {
        this.sortDirection = 2;
      }
      else if (sortDescriptor[0]?.dir == PatientSortOrder.desc) {
        this.sortDirection = 1;
      }
      else {
        this.sortDirection = 0;
      }
      this.onGetSortedData.emit({ sortDirection: this.sortDirection, sortField: sortDescriptor[0]?.field });
    }
  }

  setInitialSorting = (sortCriteria: AllPatientGridSort | AppointmentGridSort | OtherToDoGridSort | PreventiveGridSort | TreatmentGridSort) => {
    if (!sortCriteria) {
      this.state.sort = [];
      this.patientGrid.sort = [];
      return;
    }
    const fieldsWithSortingValue = Object.keys(sortCriteria).find(key => sortCriteria[key] > 0);
    if (fieldsWithSortingValue) {
      const filteredKeys = Object.keys(PatientSortField).filter(key => PatientSortField[key] == fieldsWithSortingValue);
      if (filteredKeys && filteredKeys.length > 0) {
        let sortField = "";
        //In case of otherLastAppt it will return 2 keys, so we need to check if the active tab is otherToDo and the field is otherLastAppt
        if (filteredKeys?.length == 2) {
          if (this.activeFltrTab == BadgeFilterType.otherToDo) {
            sortField = "otherLastAppt";
          }
          else {
            sortField = "lastAppt";    
          }
        }
        else {
          sortField = filteredKeys[0];
        }
        
        if (fieldsWithSortingValue && sortField) {
          switch (sortCriteria[fieldsWithSortingValue]) {
            case 1:
              this.state.sort = [{ field: sortField, dir: PatientSortOrder.desc }];
              break;
            case 2:
              this.state.sort = [{ field: sortField, dir: PatientSortOrder.asc }];
              break;
            default:
              this.state.sort = [];
          }
        }
      }        
    } 
    else{
      this.state.sort = [];
    }      
    this.patientGrid.sort = this.state.sort;
  }

  ngOnDestroy = () => {
    this.subscriptions?.forEach((subscription) => subscription?.unsubscribe());
  }
 }