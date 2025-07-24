import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PatientAdditionalIdentifiers } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier';
import { PatientFliterCategory, PatientTabFilter } from '../common/models/patient-grid-response.model';
import { AllPatientRequest, AppointmentRequest, PreventiveCareRequest, TreatmentPlansRequest, OtherToDoRequest } from '../common/models/patient-grid-request.model';
import { TranslateService } from '@ngx-translate/core';
import { AllPatientGridFilter, AppointmentGridFilter, OtherToDoGridFilter, PreventiveCareGridFilter, TreatmentPlansGridFilter, ExpandStateArray } from '../common/models/patient-grid-filter.model';
import { SlideoutFilter } from '../common/models/enums/patient.enum';

@Injectable({
  providedIn: 'root'
})
export class PatientFilterService {
  disableDateInput = true; //shared for date input disable
  isApplyFilters = false;  //shared for apply filters
  CurrentPage = 0; //shared for current page
  constructor(private translate: TranslateService) { }
  additionalIdentifiers: PatientFliterCategory<string>[];
  groupTypes: PatientFliterCategory<string>[];
  preferredDentists: PatientFliterCategory<string>[];
  preferredHygienists: PatientFliterCategory<string>[];
  zipCodes: PatientFliterCategory<string>[];
  patientAdditionalIdentifiers: PatientAdditionalIdentifiers[];
  treatmentProviders: PatientFliterCategory<string>[];
  treatmentPlansDate: PatientFliterCategory<string>[];

  optionAll = this.translate.instant('All');
  optionNA = this.translate.instant('N/A');
  optionScheduled = this.translate.instant('Scheduled');
  optionUnScheduled = this.translate.instant('Unscheduled');

  allPatientRequest = new AllPatientRequest();
  preventiveCareRequest = new PreventiveCareRequest();
  treatmentPlansRequest = new TreatmentPlansRequest();
  OtherToDoRequest = new OtherToDoRequest();
  appointmentRequest = new AppointmentRequest();

  expandedState: ExpandStateArray[] = []; //To store expanded state of each row in grid

  //To store current filter criteria badge wise so it may content any of the following  
  currentFilterCriteria: AllPatientGridFilter | PreventiveCareGridFilter | TreatmentPlansGridFilter | AppointmentGridFilter | OtherToDoGridFilter;

  public readonly emptyGuId = "00000000-0000-0000-0000-000000000000";
  private selectedCountSubject = new Subject<number>();
  selectedCount$ = this.selectedCountSubject.asObservable();
  broadcastSelectedCount(count: number): void {
    this.selectedCountSubject.next(count);
  }

  // Model
  private modelSource = new BehaviorSubject<[]>(null);
  filterListing = this.modelSource.asObservable();

  // Ordering of Patient Model Array
  private patientModelSource = new BehaviorSubject<[]>(null);
  patientModelStatus = this.patientModelSource.asObservable();

  // to handle Expand/Collapse
  private expandCollapse = new BehaviorSubject<boolean>(false);
  expandCollapseFilter = this.expandCollapse.asObservable();

  // to handle clear treatment plan created date
  private clearTreatmentPlanCreatedDate = new BehaviorSubject<boolean>(false);

  patientModelArray: PatientTabFilter[] = [];

  // update Selected location Id
  selectedLocationId = new BehaviorSubject<number>(null);

  createdDateList: PatientFliterCategory<string>[] = [
    { field: 'treatmentPlanCreatedDate', value: this.translate.instant('createdDate'), key: '1', isSelected: false, },
  ];

  appointmentDates: PatientFliterCategory<string>[] = [
    { field: 'BusinessDays', value: this.translate.instant('Next Business Day'), key: '1', isSelected: false, },
    { field: 'BusinessDays', value: this.translate.instant('Next 7 Days'), key: '2', isSelected: false },
  ];

  appointmentStates: PatientFliterCategory<string>[] = [
    { field: 'AppointmentStatusList', value: this.translate.instant('Completed'), key: '3', isSelected: false, isVisible: true },
    { field: 'IsScheduled', value: this.optionScheduled, key: 'true', isSelected: false, isVisible: true },
    { field: 'IsScheduled', value: this.optionUnScheduled, key: 'false', isSelected: false, isVisible: true },
  ];

  appointmentTypes: PatientFliterCategory<string>[] = [
    { field: 'AppointmentTypes', value: this.optionNA, key: this.emptyGuId, isVisible: true, isSelected: true }
  ];

  appointmentBlocks: PatientFliterCategory<string>[] = [
    { field: 'AppointmentBlocks', value: this.translate.instant('Exclude Blocks'), key: "1", isVisible: true, isSelected: false },
    { field: 'AppointmentBlocks', value: this.translate.instant('Include Blocks Only'), key: "2", isVisible: true, isSelected: false }
  ];

  rooms: PatientFliterCategory<string>[] = [
    { field: 'Rooms', value: this.optionNA, key: this.emptyGuId, isVisible: true, isSelected: true }
  ];

  providers: PatientFliterCategory<string>[] = [
    { field: 'Providers', value: this.optionNA, key: this.emptyGuId, isVisible: true, isSelected: true }
  ];

  preventiveIsScheduled: PatientFliterCategory<string>[] = [
    { field: 'PreventiveCareIsScheduled', value: this.translate.instant('Yes'), key: 'true', isVisible: true, isSelected: true },
    { field: 'PreventiveCareIsScheduled', value: this.translate.instant('No'), key: 'false', isVisible: true, isSelected: true }
  ];

  pastDue: PatientFliterCategory<string>[] = [
    { field: 'DueLess30', value: this.translate.instant('< 30 Days'), key: 'true', isSelected: false },
    { field: 'Due30', value: this.translate.instant('30-59 Days'), key: 'true', isSelected: false },
    { field: 'Due60', value: this.translate.instant('60-89 Days'), key: 'true', isSelected: false },
    { field: 'DueOver90', value: this.translate.instant('> 90 Days'), key: 'true', isSelected: false }
  ];

  birthMonths: PatientFliterCategory<number>[] = [
    { field: 'BirthMonths', value: this.optionNA, key: 0, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('January'), key: 1, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('February'), key: 2, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('March'), key: 3, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('April'), key: 4, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('May'), key: 5, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('June'), key: 6, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('July'), key: 7, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('August'), key: 8, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('September'), key: 9, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('October'), key: 10, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('November'), key: 11, isSelected: true },
    { field: 'BirthMonths', value: this.translate.instant('December'), key: 12, isSelected: true },
  ];

  filterByIndex = [
    { index: 0, text: this.translate.instant('AdditionalIdentifiers') },
    { index: 1, text: this.translate.instant('BusinessDays') },
    { index: 2, text: this.translate.instant('AppointmentStatusList') },
    { index: 3, text: this.translate.instant('BirthMonths') },
  ]

  insuranceFilters: PatientFliterCategory<string>[] = [
    { field: 'HasInsurance', value: this.translate.instant('Yes'), key: 'true', isSelected: false },
    { field: 'HasInsurance', value: this.translate.instant('No'), key: 'false', isSelected: false },
  ];

  patientTypes: PatientFliterCategory<string>[] = [
    { field: 'IsActive', value: this.translate.instant('Active'), key: 'true', isSelected: true },
    { field: 'IsActive', value: this.translate.instant('Inactive'), key: 'false', isSelected: false },
    { field: 'IsPatient', value: this.translate.instant('Non-Patients'), key: 'false', isSelected: false },
    { field: 'IsPatient', value: this.translate.instant('Patients'), key: 'true', isSelected: true },
  ];

  preventiveCareStates: PatientFliterCategory<string>[] = [
    { field: 'IsNoDueDate', value: this.translate.instant('No Due Date'), key: 'true', isSelected: true },
    { field: 'PreventiveCareIsScheduled', value: this.optionScheduled, key: 'true', isSelected: true },
    { field: 'PreventiveCareIsScheduled', value: this.optionUnScheduled, key: 'false', isSelected: true },
  ];

  reminderStatus: PatientFliterCategory<string>[] = [
    { field: 'ReminderStatus', value: this.optionNA, key: '', isSelected: true },
    { field: 'ReminderStatus', value: this.translate.instant('Confirmed'), key: '2', isSelected: true },
    { field: 'ReminderStatus', value: this.translate.instant('Reminder Sent'), key: '1', isSelected: true },
    { field: 'ReminderStatus', value: this.translate.instant('Unconfirmed'), key: '0', isSelected: true },
  ];

  treatmentPlanStates: PatientFliterCategory<string>[] = [
    { field: 'TreatmentPlanStates', value: this.optionNA, key: '', isSelected: true },
    { field: 'TreatmentPlanStates', value: this.optionScheduled, key: 'true', isSelected: true },
    { field: 'TreatmentPlanStates', value: this.optionUnScheduled, key: 'false', isSelected: true },
  ];

  treatmentPlanStatus: PatientFliterCategory<string>[] = [
    { field: 'IsUnscheduled', value: this.optionUnScheduled, key: 'true', isSelected: true },
    { field: 'IsScheduled', value: this.optionScheduled, key: 'true', isSelected: true },
    { field: 'IsProposed', value: 'Proposed', key: 'true', isSelected: true },
    { field: 'IsAccepted', value: 'Accepted', key: 'true', isSelected: true }
  ]

  treatmentPlanCreate = [
    { field: 'PlanCreatedDateFrom', value: '', key: 'From' },
    { field: 'PlanCreatedDateTo', value: '', key: 'To' },
  ];

  treatmentPlanName: PatientFliterCategory<string>[] = [
    { field: 'TreatmentPlanName', value: '', key: 'Equal To', isSelected: true },
    { field: 'TreatmentPlanName', value: '', key: 'Contains', isSelected: true }
  ]

  dueDateItems: PatientFliterCategory<string>[] = [
    { field: 'DueDateItems', value: this.translate.instant('Due this week'), key: '1', isSelected: false },
    { field: 'DueDateItems', value: this.translate.instant('Due next week'), key: '2', isSelected: false },
    { field: 'DueDateItems', value: this.translate.instant('Overdue'), key: '3', isSelected: false },
  ];

  slideoutFilterKey: string[] = [ 
    SlideoutFilter.AdditionalIdentifiers, SlideoutFilter.AppointmentStatusList , SlideoutFilter.BusinessDays, SlideoutFilter.IsScheduled, SlideoutFilter.IsProposed,
    SlideoutFilter.BirthMonths, SlideoutFilter.GroupTypes, SlideoutFilter.HasInsurance, SlideoutFilter.IsActive, SlideoutFilter.IsPatient, SlideoutFilter.IsAccepted,
    SlideoutFilter.IsNoDueDate , SlideoutFilter.PreferredDentists, SlideoutFilter.PreferredHygienists, SlideoutFilter.PreventiveCareIsScheduled, SlideoutFilter.IsUnscheduled,
    SlideoutFilter.ReminderStatus, SlideoutFilter.TreatmentPlanStates, SlideoutFilter.ZipCodes, SlideoutFilter.DueDate, SlideoutFilter.HasUnreadCommunication,
    SlideoutFilter.Due30, SlideoutFilter.Due60, SlideoutFilter.DueLess30, SlideoutFilter.DueOver90, SlideoutFilter.TreatmentPlanProviders, 
    SlideoutFilter.TreatmentPlan, SlideoutFilter.PlanCreatedDateRange, SlideoutFilter.AppointmentBlocks, SlideoutFilter.AppointmentState,
    SlideoutFilter.AppointmentTypes, SlideoutFilter.Providers, SlideoutFilter.Rooms, SlideoutFilter.SoonerIfPossible, SlideoutFilter.DueDateItems 
  ];

  updateSelectedLocationId = (locationId: number) => {
    this.selectedLocationId.next(locationId);
  }

  setDefaultAdditionalIdentifiers = (isFirstLoad: boolean) => {
    this.additionalIdentifiers = [
      {
        field: 'AdditionalIdentifiers',
        value: this.optionNA,
        key: '00000000-0000-0000-0000-000000000000',
        isVisible: true,
        isSelected: isFirstLoad ? true : this.isItemSelected('AdditionalIdentifiers', '00000000-0000-0000-0000-000000000000')
      }
    ];
    return this.additionalIdentifiers;
  }

  setDefaultGroupTypes = (isFirstLoad: boolean) => {
    //Group Type
    this.groupTypes = [
      {
        field: 'GroupTypes',
        value: this.optionNA,
        key: this.emptyGuId,
        isVisible: true,
        isSelected: isFirstLoad ? true : this.checkKeyAndItemInFilterCriteria(SlideoutFilter.GroupTypes, this.emptyGuId),
      },
    ];
    return this.groupTypes;
  }

  setDefaultPreferredDentist = (isFirstLoad: boolean) => {
    //Group Type
    this.preferredDentists = [
      {
        field: 'PreferredDentists',
        value: this.optionNA,
        key: this.emptyGuId,
        isVisible: true,
        isSelected: isFirstLoad ? true : this.checkKeyAndItemInFilterCriteria(SlideoutFilter.PreferredDentists, this.emptyGuId),
      },
    ];
    return this.preferredDentists;
  }

  setDefaultPreferredHygienst = (isFirstLoad: boolean) => {
    //Group Type
    this.preferredHygienists = [
      {
        field: 'PreferredHygienists',
        value: this.optionNA,
        key: this.emptyGuId,
        isVisible: true,
        isSelected: isFirstLoad ? true : this.checkKeyAndItemInFilterCriteria(SlideoutFilter.PreferredHygienists, this.emptyGuId),
      },
    ];
    return this.preferredHygienists;
  }

  setLocationZipCodes = (isFirstLoad: boolean) => {
    this.zipCodes = [
      {
        field: 'ZipCodes',
        value: this.optionNA,
        key: '',
        isVisible: true,
        isSelected: isFirstLoad ? true : this.isItemSelected('ZipCodes', null),
      },
    ];
    return this.zipCodes;
  }

  setAdditionalIdentifiers = (additionalIdentifiers: PatientAdditionalIdentifiers[]) => {
    this.patientAdditionalIdentifiers = additionalIdentifiers;
  }

  setTreatmentPlanProvider = (treatmentProviders: PatientFliterCategory<string>[]) => {
    this.treatmentProviders = treatmentProviders;
  }

  setTreatmentPlanCreatedDate = () => {
    this.treatmentPlansDate = [
      {
        field: 'TreatmentPlanCreatedDate',
        value: 'All',
        key: 'All',
        isVisible: true,
        isSelected: true
      },
      {
        field: 'TreatmentPlanCreatedDate',
        value: 'From',
        key: 'gte',
        isVisible: true,
        isSelected: false
      },
      {
        field: 'TreatmentPlanCreatedDate',
        value: 'To',
        key: 'lte',
        isVisible: true,
        isSelected: false
      }
    ];
    return this.treatmentPlansDate;
  }

  isItemSelected = (strFilter, itemId) => {
    let result = true;
    switch (strFilter) {
      case 'AdditionalIdentifiers': {
        const index = this.patientAdditionalIdentifiers?.findIndex(x => x == itemId);
        result = index > -1 ? true : false;
        break;
      }
      case 'TreatmentProviders': {
        const index = this.treatmentProviders?.findIndex(x => x == itemId);
        result = index > -1 ? true : false;
        break;
      }
    }
    return result;
  }

  checkKeyAndItemInFilterCriteria = (criteria: string, itemId): boolean => {
    if (this.currentFilterCriteria[criteria] && this.currentFilterCriteria[criteria]?.length > 0) {
      return this.currentFilterCriteria[criteria]?.includes(itemId) as boolean;
    } else {
      return true;
    }
  }

  //To handle selection state of all checkbox while binding to filter
  isSelectAllOption = (sourceData: PatientFliterCategory<string>[]) => {
    let result = false;
    if (sourceData) {
      const index = sourceData?.findIndex(x => x?.isSelected == false);
      result = index > -1 ? false : true;
    }
    return result;
  }

  setCommonStructure = (dataTarget, divClass, divUl, filtrText, formArry, filter) => {
    const patientModel = new PatientTabFilter();
    patientModel.dataTarget = dataTarget
    patientModel.divClassId = divClass
    patientModel.divUlId = divUl
    patientModel.filterText = filtrText;
    patientModel.formArray = formArry;
    patientModel.filter = filter;
    this.patientModelSource?.next(null);
    return patientModel;
  }

  updateCommonModel = (patientModel: PatientTabFilter) => {
    this.patientModelArray?.push(patientModel);
  }

  getIndexByText = (text) => {
    const index = this.filterByIndex?.findIndex(x => x.text == text);
    return index;
  }

  getExpandCollapse = () => {
    return this.expandCollapse.asObservable();
  }

  setExpandCollapse = (data: boolean) => {
    this.expandCollapse.next(data);
  }

  getClearDateValues = () => {
    return this.clearTreatmentPlanCreatedDate.asObservable();
  }

  setClearDateValues = (data: boolean) => {
    this.clearTreatmentPlanCreatedDate.next(data);
  }

  initializeDefaultFilters = (locationId: number) => {
    this.allPatientRequest.CurrentPage = 0;// To Do : This needs to be updated with custom paging
    this.allPatientRequest.PageCount = 50;// To Do : This needs to be updated with custom page count
    this.allPatientRequest.FilterCriteria = {
      AppointmentStatusList: [''],
      BirthMonths: ['-1', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      HasInsurance: [],
      IsActive: ['true'],
      IsPatient: ['true'],
      LastCommunicationDate: null,
      LocationId: locationId,
      NextAppointmentDate: null,
      PatientDateOfBirth: null,
      PatientName: '',
      PreventiveCareDueDate: null,
      PreviousAppointmentDate: null,
      ResponsiblePartyName: '',
      TreatmentPlanTotalBalance: '',
    }
    // To Do : This needs to be updated with custom Grid filtering
    this.allPatientRequest.SortCriteria = {
      LastCommunicationDate: 0,
      NextAppointmentDate: 0,
      PatientDateOfBirth: 0,
      PatientName: 0,
      PreventiveCareDueDate: 0,
      PreviousAppointmentDate: 0,
      ResponsiblePartyName: 0,
      TreatmentPlanTotalBalance: 0
    };
    return this.allPatientRequest;
  }

  initializeDefaultPreventiveCareFilters = (locationId: number) => {
    this.preventiveCareRequest.CurrentPage = 0;
    this.preventiveCareRequest.PageCount = 50;
    this.preventiveCareRequest.FilterCriteria = {
      IsActive: ['true'],
      IsPatient: ['true'],
      LocationId: locationId,
      PatientName: '',
      ResponsiblePartyName: '',
      LastCommunicationDate: null,
      NextAppointmentDate: '',
      PatientDateOfBirth: '',
      PreventiveCareDueDate: '',
      PreviousAppointmentDate: '',
      TreatmentPlanTotalBalance: ' '
    }

    this.preventiveCareRequest.SortCriteria = {
      LastCommunicationDate: 0,
      NextAppointmentDate: 0,
      PatientDateOfBirth: 0,
      PatientName: 0,
      PreventiveCareDueDate: 0,
      PreviousAppointmentDate: 0,
      ResponsiblePartyName: 0,
      TreatmentPlanTotalBalance: 0
    };
    return this.preventiveCareRequest;
  }

  initializeDefaultTreatmentPlansFilters = (locationId: number) => {
    this.treatmentPlansRequest.CurrentPage = 0;
    this.treatmentPlansRequest.PageCount = 50;
    this.treatmentPlansRequest.FilterCriteria = {
      IsActive: ['true'],
      IsPatient: ['true'],
      LocationId: locationId,
      PatientName: '',
      ResponsiblePartyName: '',
      LastCommunicationDate: null,
      NextAppointmentDate: '',
      PatientDateOfBirth: '',
      PreventiveCareDueDate: '',
      PreviousAppointmentDate: '',
      TreatmentPlanTotalBalance: '',
      PlanCreatedDateRange: ['', ''],
      TreatmentPlanName: ['', '']
    }

    this.treatmentPlansRequest.SortCriteria = {
      LastCommunicationDate: 0,
      NextAppointmentDate: 0,
      PatientDateOfBirth: 0,
      PatientName: 0,
      PreventiveCareDueDate: 0,
      PreviousAppointmentDate: 0,
      ResponsiblePartyName: 0,
      TreatmentPlanTotalBalance: 0
    };
    return this.treatmentPlansRequest;
  }

  initializeDefaultOtherToDoFilters = (locationId: number) => {
    this.OtherToDoRequest.CurrentPage = 0;
    this.OtherToDoRequest.PageCount = 50;
    this.OtherToDoRequest.FilterCriteria = {
      DueDate: '',
      IsActive: ['true'],
      IsComplete: '',
      IsPatient: ['true'],
      LastCommunicationDate: null,
      LocationId: locationId,
      NextAppointmentDate: "",
      PatientName: '',
      PreviousAppointmentDate: "",
      ResponsiblePartyName: '',
    }

    this.OtherToDoRequest.SortCriteria = {
      PatientName: 0,
      ResponsiblePartyName: 0,
      DueDate: 0,
      IsComplete: 0,
      PreviousAppointmentDate: 0,
      NextAppointmentDate: 0,
      LastCommunicationDate: 0
    };
    return this.OtherToDoRequest;
  }

  //ToDo: Need to check
  initializeDefaultAppointmentFilters = (locationId: number) => {
    this.appointmentRequest.CurrentPage = 0;
    this.appointmentRequest.PageCount = 50;
    this.appointmentRequest.FilterCriteria = {
      AppointmentDateFrom: null,
      AppointmentDateTo: null,
      AppointmentState: ["0|Cancellation", "1|Missed"],
      AppointmentStatus: '',
      AppointmentBlocks: null,
      AppointmentDate: ['', ''],
      AppointmentStatusList: null,
      AppointmentTypes: null,
      BusinessDays: null,
      IsScheduled: ['true', 'false'],
      LastCommunicationDate: null,
      PatientDateOfBirth: "",
      PreventiveCareDueDateFrom: null,
      PreventiveCareDueDateTo: null,
      Providers: null,
      Rooms: null,
      SoonerIfPossible: null,
      IsActive: ['true'],
      IsPatient: ['true'],
      LocationId: locationId,
      PatientName: ''
    }
    this.appointmentRequest.SortCriteria = {
      AppointmentDate: 0,
      AppointmentStatus: 0,
      PatientDateOfBirth: 0,
      PreventiveCareDueDate: 0
    };
    return this.appointmentRequest;
  }

  // Date fields for grid columns
  getDateTimeFields = (): string[] => {
    const arr = ['PatientDateOfBirthFrom', 'PatientDateOfBirthTo', 'PreviousAppointmentDateFrom', 'PreviousAppointmentDateTo',
      'NextAppointmentDateFrom', 'NextAppointmentDateTo', 'PreventiveCareDueDateFrom', 'PreventiveCareDueDateTo', 'LastCommunicationFrom',
      'LastCommunicationTo', 'AppointmentDateFrom', 'AppointmentDateTo', 'DueDateFrom', 'DueDateTo'];
    return arr;
  }
  // End of Date fields for grid columns
}
