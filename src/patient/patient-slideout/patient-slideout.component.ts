import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { PatientFilterService } from '../service/patient-filter.service';
import { AllPatientGridFilter, AppointmentGridFilter, TreatmentPlansGridFilter, OtherToDoGridFilter, PreventiveCareGridFilter } from '../common/models/patient-grid-filter.model';
import { AllPatientRequest, AppointmentRequest, TreatmentPlansRequest, OtherToDoRequest, PreventiveCareRequest, AllBadgesFilterCriteria } from '../common/models/patient-grid-request.model';
import { BadgeFilterType } from '../common/models/patient-location.model';
import { AllPatientSlideoutComponent } from '../patient-landing/all-patient-slideout/all-patient-slideout.component';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { TreatmentPlansSlideoutComponent } from '../patient-landing/treatment-plans-slideout/treatment-plans-slideout.component';
import { SlideoutFilter } from '../common/models/enums/patient.enum';
import { OtherToDoSlideoutComponent } from '../patient-landing/other-to-do-slideout/other-to-do-slideout.component';
import { AppointmentSlideoutComponent } from '../patient-landing/appointment-slideout/appointment-slideout.component';
import { PreventiveCareSlideoutComponent } from '../patient-landing/preventive-care-slideout/preventive-care-slideout.component';

@Component({
  selector: 'patient-slideout',
  templateUrl: './patient-slideout.component.html',
  styleUrls: ['./patient-slideout.component.scss']
})
export class PatientSlideoutComponent implements OnInit, OnDestroy {
  classExpandCollapse = true;
  @Input() activeFltrTab: number;
  @Input() activeGridData;
  @Input() selectedLocation;
  @Input() allBadgeFilterCriteria: AllBadgesFilterCriteria;
  @Output() closePatientSlideout = new EventEmitter();
  @Output() filterCriteria = new EventEmitter();
  @Output() resetFilterCriteria = new EventEmitter();
  @ViewChild(AllPatientSlideoutComponent) public allPatientSlideout: AllPatientSlideoutComponent;
  @ViewChild(TreatmentPlansSlideoutComponent) public treatmentPlanSlideout: TreatmentPlansSlideoutComponent;
  @ViewChild(OtherToDoSlideoutComponent) public otherToDoSlideout: OtherToDoSlideoutComponent;
  @ViewChild(AppointmentSlideoutComponent) public appointmentSlideout: AppointmentSlideoutComponent;
  @ViewChild(PreventiveCareSlideoutComponent) public preventiveCareSlideout: PreventiveCareSlideoutComponent;

  appliedFiltersCount: number;
  additionalIdentifiers: string[];
  appointmentDates: number[];
  appointmentStatus: string[] = ['true', 'false'];
  birthMonthStatus: string[] = ['-1', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  hasInsurance: string[] = [];
  dueDate: number[] = [];
  groupTypes: string[];
  IsPatient?: string[] = ['true'];
  IsActive?: string[] = ['true'];
  preferredDentist?: string[];
  preferredHygienists?: string[];
  preferredLocations?: number[];
  isNoDueDate?: string[];
  preventiveCare?: string[] = ['true', 'false'];
  reminderStatus?: number[];
  treatmentPlans?: string[];
  zipCodes?: string[];
  IsNoDueDate?: boolean[];
  PreventiveCareIsScheduled?: string[];
  allPatientRequest = new AllPatientRequest();
  treatmentPlanRequest = new TreatmentPlansRequest();
  allPatientGridFilter = new AllPatientGridFilter();
  appointmentRequest = new AppointmentRequest();
  otherToDoRequest = new OtherToDoRequest();
  preventiveCareRequest = new PreventiveCareRequest();
  subscriptions: Array<Subscription> = new Array<Subscription>();
  optionAll = this.translate.instant('All');
  collapseAll = this.translate.instant('Collapse All');
  expandAll = this.translate.instant('Expand All');
  resetBtn = this.translate.instant('Reset');
  applyFiltersBtn = this.translate.instant('Apply Filters');
  subscription: Subscription;
  expandCollapseSubscription: Subscription;
  textExpandCollapse: string;
  

  constructor(private patientFilterService: PatientFilterService,
    private translate: TranslateService,
    private el: ElementRef,
    private renderer: Renderer2) { }

  ngOnInit(): void {
    this.allPatientRequest.FilterCriteria = new AllPatientGridFilter();
    this.allPatientRequest.CurrentPage = 0;
    this.allPatientRequest.PageCount = 50;
    this.allPatientRequest.SortCriteria = {};
    this.allPatientRequest.TotalCount = 0;
    this.textExpandCollapse = this.expandAll;
    this.classExpandCollapse = true;
    this.subscription = this.patientFilterService.selectedCount$?.subscribe(
      count => this.appliedFiltersCount = count
    );

    this.expandCollapseSubscription = this.patientFilterService.expandCollapseFilter?.subscribe(
      (isExapanded) => {
        this.classExpandCollapse = isExapanded;
        if (isExapanded) {

          this.textExpandCollapse = this.collapseAll;
        }
        else {
          this.textExpandCollapse = this.expandAll;
        }
      });
  }

  hideDiv = () => {
    this.closePatientSlideout?.emit();
  }

  collapsePanel = () => {
    if (this.textExpandCollapse === this.expandAll) {
      this.expandFilters();
    } else {
      this.collapseFilters();
    }
  }

  collapseFilters = () => {
    this.patientFilterService.expandedState = [];
    this.classExpandCollapse = true;
    this.textExpandCollapse = this.expandAll;
    const panels = this.el?.nativeElement?.querySelectorAll('.panel-collapse.in');
    panels?.forEach((panel, i) => {
      this.renderer?.removeClass(panel, 'in');
      this.patientFilterService.expandedState?.push({ Index: i, IsExpanded: false });
    });
    this.expandCollapseFilter(false);
  }

  expandFilters = () => {
    this.patientFilterService.expandedState?.forEach((state) => {
      state.IsExpanded = true;
    });
    this.classExpandCollapse = false;
    this.textExpandCollapse = this.collapseAll;    
    const panels = this.el?.nativeElement?.querySelectorAll('.panel-collapse:not(.in)');
    panels?.forEach((panel, i) => {
      this.renderer?.addClass(panel, 'in');
      this.patientFilterService.expandedState?.push({ Index: i, IsExpanded: true });
    });
    this.expandCollapseFilter(true);
  }

  resetFilters = () => {
    // For All Patients
    if (this.activeFltrTab == BadgeFilterType.AllPatients) {
      this.resetAllPatientFilters();
    } else if (this.activeFltrTab == BadgeFilterType.TreatmentPlans) {
      this.resetTreatmentPlanFilters();
    } else if (this.activeFltrTab == BadgeFilterType.otherToDo) {
      this.resetOtherToDoFilters();
    } else if (this.activeFltrTab == BadgeFilterType.Appointments) {
      this.resetAppointmentFilters();
    } else if (this.activeFltrTab == BadgeFilterType.PreventiveCare) {
      this.resetPreventiveCareFilters();
    }
    this.patientFilterService.expandedState = [];
    this.resetFilterCriteria.emit();
    this.collapseAllPanels();
  }

  selectOnReset = (filterOption) => {
    filterOption?.forEach((state, index) => {
        state.setValue({ 
            value: index == 0 ? SlideoutFilter.All || '' : state?.value?.value, 
            isSelected: index == 0
        });
    });
  }

  // Reset Other ToDo filters tab
  resetOtherToDoFilters = () => {
    //Additional Identifier
    const addIdentifier = this.otherToDoSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.AdditionalIdentifiers)[0]?.formArray?.controls;
    addIdentifier?.map(x => x.value.isSelected = true);

    // Due Date
    const dueDateOption = this.otherToDoSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.DueDateItems)[0]?.formArray?.controls;
    this.selectOnReset(dueDateOption);

    // Group Types
    const groupTypes = this.otherToDoSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.GroupTypes)[0]?.formArray?.controls;
    groupTypes?.map(x => x.value.isSelected = true);

    // Preferred Dentist
    const preferredDentist = this.otherToDoSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreferredDentists)[0]?.formArray?.controls;
    preferredDentist?.map(x => x.value.isSelected = true);

    const PreferredHygienists = this.otherToDoSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreferredHygienists)[0]?.formArray?.controls;
    PreferredHygienists?.map(x => x.value.isSelected = true);

    // Patient Type Status
    const patientType = this.otherToDoSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PatientTypeStatus)[0]?.formArray?.controls;
    patientType?.forEach(state => {
      if (state?.value?.value == SlideoutFilter.Active || state?.value?.value == SlideoutFilter.Patients) {
        state.value.isSelected = true;
      } else {
        state.value.isSelected = false;
      }
    });


    //collapse panel on reset with chevron position
    this.expandCollapseFilter(false);
  }

  // Reset All Patient filters
  resetAllPatientFilters = () => {
    // Additional Identifiers
    const addIdentifier = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.AdditionalIdentifiers)[0]?.formArray?.controls;
    addIdentifier.map(x => x.value.isSelected = true);

    // Appointment Date
    const appointmentDateOption = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.AppointmentDates)[0]?.formArray?.controls;    
    this.selectOnReset(appointmentDateOption);

    // Appointment State
    const appointmentState = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.AppointmentStates)[0]?.formArray?.controls;
    appointmentState?.map(x => x.value.isSelected = false);

    // Patient Type Status
    const patientType = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PatientTypeStatus)[0]?.formArray?.controls;
    patientType?.forEach(state => {
      if (state?.value?.value == SlideoutFilter.Active || state?.value?.value == SlideoutFilter.Patients) {
        state.value.isSelected = true;
      } else {
        state.value.isSelected = false;
      }
    });

    // Group Types
    const groupTypes = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.GroupTypes)[0]?.formArray?.controls;
    groupTypes?.map(x => x.value.isSelected = true);

    // Preferred Dentist
    const preferredDentist = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreferredDentists)[0]?.formArray?.controls;
    preferredDentist?.map(x => x.value.isSelected = true);

    // Preferred Hygienist
    const PreferredHygienists = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreferredHygienists)[0]?.formArray?.controls;
    PreferredHygienists?.map(x => x.value.isSelected = true);

    // Insurance
    const insuranceOption = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.InsuranceFilter)[0]?.formArray?.controls;
    this.selectOnReset(insuranceOption);

    // Preventive Care
    const preventiveCare = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreventiveCare)[0]?.formArray?.controls;
    preventiveCare?.map(x => x.value.isSelected = true);

    // Reminder Status
    const reminderStatus = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.ReminderStatus)[0]?.formArray?.controls;
    reminderStatus?.map(x => x.value.isSelected = true);

    // Treatment Plans
    const treatmentPlans = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.TreatmentPlanStates)[0]?.formArray?.controls;
    treatmentPlans?.map(x => x.value.isSelected = true);

    // Zipcode
    const zipcode = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.ZipCodes)[0]?.formArray?.controls;
    zipcode?.map(x => x.value.isSelected = true);

    // Birth Months
    const birthMonths = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.BirthMonths)[0]?.formArray?.controls;
    birthMonths?.map(x => x.value.isSelected = true);

    // Group Types
    const preferredLocation = this.allPatientSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreferredLocations)[0]?.formArray?.controls;
    preferredLocation?.map(x => x.value.isSelected = true);

    //collapse panel on reset with chevron position
    this.expandCollapseFilter(false);
  }

  // Reset Treatment Plan filters
  resetTreatmentPlanFilters = () => {
    // Additional Identifiers
    const addIdentifier = this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.AdditionalIdentifiers)[0]?.formArray?.controls;
    addIdentifier.map(x => x.value.isSelected = true);

    // Group Types
    const groupTypes = this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.GroupTypes)[0]?.formArray?.controls;
    groupTypes?.map(x => x.value.isSelected = true);

    // Preferred Dentist
    const preferredDentist = this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreferredDentists)[0]?.formArray?.controls;
    preferredDentist?.map(x => x.value.isSelected = true);

    // Preferred Hygienist
    const PreferredHygienists = this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreferredHygienists)[0]?.formArray?.controls;
    PreferredHygienists?.map(x => x.value.isSelected = true);

    // Patient-Non Patient
    const patientType = this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PatientTypeStatus)[0]?.formArray?.controls;
    patientType?.forEach(state => {
      if (state?.value?.value == SlideoutFilter.Active || state?.value?.value == SlideoutFilter.Patients) {
        state.value.isSelected = true;
      } else {
        state.value.isSelected = false;
      }
    });

    // Treatment Plans Created Date
    const planDate = this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.CreatedDateList)[0]?.formArray?.controls;
    this.patientFilterService.setClearDateValues(true);
    this.selectOnReset(planDate);
    this.patientFilterService.disableDateInput = true;
    
   // Treatment Plans Name
    const treatmentPlanSlideout = this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.TreatmentPlan)[0]?.formArray?.controls;
    treatmentPlanSlideout.map(x => x.value.isSelected = true);
    this.treatmentPlanSlideout.slideoutFilter.treatmentPlanInput.map(x => x.nativeElement.value = '');

    // Treatment Plans Status
    const planStatus = this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.TreatmentPlanStates)[0]?.formArray?.controls;
    planStatus?.map(x => x.value.isSelected = true);

    // Treatment Provider
    const treatmentProvider = this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.TreatmentPlanProviders)[0]?.formArray?.controls;
    treatmentProvider?.map(x => x.value.isSelected = true);

    //collapse panel on reset with chevron position
    this.expandCollapseFilter(false);
  }

  // Reset Appointment filters
  resetAppointmentFilters = () => {
    // Additional Identifiers
    const addIdentifier = this.appointmentSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.AdditionalIdentifiers)[0]?.formArray?.controls;
    addIdentifier?.map(x => x.value.isSelected = true);

    //Appointment Date
    const appointmentDateOption = this.appointmentSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.AppointmentDates)[0]?.formArray?.controls;    
    this.selectOnReset(appointmentDateOption);

    //Appointment State
    const appointmentState = this.appointmentSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.AppointmentStates)[0]?.formArray?.controls;
    appointmentState.forEach((state) => {
      if (state?.value?.value == SlideoutFilter.Completed || state?.value?.value == '') {
        state.value.isSelected = false;
      } else {
        state.value.isSelected = true;
      }
    })

    //Appointment Type
    const appointmentTypes = this.appointmentSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.AppointmentTypes)[0]?.formArray?.controls;
    appointmentTypes?.map(x => x.value.isSelected = true);

    //Appointment Blocks
    const blockOption = this.appointmentSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.AppointmentBlocks)[0]?.formArray?.controls;
    this.selectOnReset(blockOption);

    //Group Types
    const groupTypes = this.appointmentSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.GroupTypes)[0]?.formArray?.controls;
    groupTypes?.map(x => x.value.isSelected = true);

    //Preferred Dentist
    const preferredDentist = this.appointmentSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreferredDentists)[0]?.formArray?.controls;
    preferredDentist?.map(x => x.value.isSelected = true);

    //Preferred Hygienist
    const PreferredHygienists = this.appointmentSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreferredHygienists)[0]?.formArray?.controls;
    PreferredHygienists?.map(x => x.value.isSelected = true);

    //providers
    const providers = this.appointmentSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.Providers)[0]?.formArray?.controls;
    providers?.map(x => x.value.isSelected = true);

    //Room
    const rooms = this.appointmentSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.Rooms)[0]?.formArray?.controls;
    rooms?.map(x => x.value.isSelected = true);

    //soonerIfPossible
    const soonerIfPossible = this.appointmentSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.SoonerIfPossible)[0]?.formArray?.controls;
    soonerIfPossible?.map(x => x.value.isSelected = false);

    //collapse panel on reset with chevron position
    this.expandCollapseFilter(false);
  }

  // Reset PreventiveCare filters
  resetPreventiveCareFilters = () => {
    // Additional Identifiers
    const addIdentifier = this.preventiveCareSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.AdditionalIdentifiers)[0]?.formArray?.controls;
    addIdentifier?.map(x => x.value.isSelected = true);

    //Group Types
    const groupTypes = this.preventiveCareSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.GroupTypes)[0]?.formArray?.controls;
    groupTypes?.map(x => x.value.isSelected = true);

    //Past Due
    const pastDue = this.preventiveCareSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PastDue)[0]?.formArray?.controls;
    pastDue?.map(x => x.value.isSelected = false);

    // Patient Type Status
    const patientType = this.preventiveCareSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PatientTypeStatus)[0]?.formArray?.controls;
    patientType?.forEach(state => {
      if (state?.value?.value == SlideoutFilter.Active || state?.value?.value == SlideoutFilter.Patients) {
        state.value.isSelected = true;
      } else {
        state.value.isSelected = false;
      }
    });

    //Preferred Dentist
    const preferredDentist = this.preventiveCareSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreferredDentists)[0]?.formArray?.controls;
    preferredDentist?.map(x => x.value.isSelected = true);

    //Preferred Hygienist
    const PreferredHygienists = this.preventiveCareSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreferredHygienists)[0]?.formArray?.controls;
    PreferredHygienists?.map(x => x.value.isSelected = true);

    //Preventive Appt Scheduled
    const preventiveIsScheduled = this.preventiveCareSlideout?.slideoutFilter?.patientModelArray?.filter(x => x.divUlId == SlideoutFilter.PreventiveIsScheduled)[0]?.formArray?.controls;
    preventiveIsScheduled?.map(x => x.value.isSelected = true);

    //collapse panel on reset with chevron position
    this.expandCollapseFilter(false);
  }

  //collapse panel on reset
  collapseAllPanels = (): void => {
    if (this.activeFltrTab == BadgeFilterType.AllPatients) {
      this.allPatientSlideout?.slideoutFilter?.patientModelArray?.forEach(filter => {
        const panel: HTMLElement = document.getElementById(filter?.divClassId);
        if (panel?.classList?.contains('in')) {
          panel?.classList?.remove('in');
        }
      });
    } else if (this.activeFltrTab == BadgeFilterType.TreatmentPlans) {
      this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray?.forEach(filter => {
        const panel: HTMLElement = document.getElementById(filter?.divClassId);
        if (panel?.classList?.contains('in')) {
          panel?.classList?.remove('in');
        }
      });
    } else if (this.activeFltrTab == BadgeFilterType.Appointments) {
      this.appointmentSlideout?.slideoutFilter?.patientModelArray?.forEach(filter => {
        const panel: HTMLElement = document.getElementById(filter?.divClassId);
        if (panel?.classList?.contains('in')) {
          panel?.classList?.remove('in');
        }
      });
    } else if (this.activeFltrTab == BadgeFilterType.otherToDo) {
      this.otherToDoSlideout?.slideoutFilter?.patientModelArray?.forEach(filter => {
        const panel: HTMLElement = document.getElementById(filter?.divClassId);
        if (panel?.classList?.contains('in')) {
          panel?.classList?.remove('in');
        }
      });
    }
    else if (this.activeFltrTab == BadgeFilterType.PreventiveCare) {
      this.preventiveCareSlideout?.slideoutFilter?.patientModelArray?.forEach(filter => {
        const panel: HTMLElement = document.getElementById(filter?.divClassId);
        if (panel?.classList?.contains('in')) {
          panel?.classList?.remove('in');
        }
      });
    }
    this.classExpandCollapse = true;
    this.textExpandCollapse = this.expandAll;
  }

  applyFilters = () => {
    if (this.activeFltrTab == BadgeFilterType.AllPatients) {
      this.allPatientRequest.FilterCriteria = new AllPatientGridFilter();
      this.allPatientRequest.FilterCriteria = this.allPatientSlideout?.allPatientsRequest?.FilterCriteria;
      // Emits the FilterCriteria to the parent component
      this.filterCriteria.emit(this.allPatientRequest?.FilterCriteria);
    } else if (this.activeFltrTab == BadgeFilterType.TreatmentPlans) {
      this.treatmentPlanRequest.FilterCriteria = new TreatmentPlansGridFilter();
      this.treatmentPlanRequest.FilterCriteria = this.treatmentPlanSlideout?.treatmentPlansRequest?.FilterCriteria;
      // Emits the FilterCriteria to the parent component
      this.filterCriteria.emit(this.treatmentPlanRequest?.FilterCriteria);
    } else if (this.activeFltrTab == BadgeFilterType.otherToDo) {
      this.otherToDoRequest.FilterCriteria = new OtherToDoGridFilter();
      this.otherToDoRequest.FilterCriteria = this.otherToDoSlideout?.OtherToDoRequest?.FilterCriteria;
      // Emits the FilterCriteria to the parent component
      this.filterCriteria.emit(this.otherToDoRequest?.FilterCriteria);
    } else if (this.activeFltrTab == BadgeFilterType.Appointments) {
      this.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      this.appointmentRequest.FilterCriteria = this.appointmentSlideout?.appointmentRequest?.FilterCriteria;
      // Emits the FilterCriteria to the parent component
      this.filterCriteria.emit(this.appointmentRequest?.FilterCriteria);
    } else if (this.activeFltrTab == BadgeFilterType.PreventiveCare) {
      this.preventiveCareRequest.FilterCriteria = new PreventiveCareGridFilter();
      this.preventiveCareRequest.FilterCriteria = this.preventiveCareSlideout?.preventiveCareRequest?.FilterCriteria;
      // Emits the FilterCriteria to the parent component
      this.filterCriteria.emit(this.preventiveCareRequest?.FilterCriteria);
    }
    this.setDefaultSlideOutFilter();
    this.patientFilterService.isApplyFilters = true;
  }

  setDefaultSlideOutFilter = () => {
    const defaultFilterKey = {
      [BadgeFilterType.AllPatients]: [ SlideoutFilter.ZipCodes, SlideoutFilter.PreferredLocations, SlideoutFilter.PreferredHygienists, SlideoutFilter.PreferredDentists, SlideoutFilter.GroupTypes],
      [BadgeFilterType.PreventiveCare]: [ SlideoutFilter.GroupTypes, SlideoutFilter.PreferredHygienists, SlideoutFilter.PreferredDentists],
      [BadgeFilterType.TreatmentPlans]: [ SlideoutFilter.TreatmentPlanProviders, SlideoutFilter.PreferredHygienists, SlideoutFilter.PreferredDentists, SlideoutFilter.GroupTypes],
      [BadgeFilterType.Appointments]: [SlideoutFilter.Rooms, SlideoutFilter.Providers, SlideoutFilter.PreferredHygienists, SlideoutFilter.PreferredDentists, SlideoutFilter.GroupTypes, SlideoutFilter.AppointmentTypes],
      [BadgeFilterType.otherToDo]: [ SlideoutFilter.GroupTypes, SlideoutFilter.PreferredDentists, SlideoutFilter.PreferredHygienists],
    }
    const patientModelArray = this.getActiveSlideOutFilter();
    defaultFilterKey[this.activeFltrTab]?.forEach(filterField => {
      const filterObj = patientModelArray?.find(filter => filter.divUlId == filterField);
      if (filterObj) {
        const checkField = filterObj.formArray.value.every(val => !val.isSelected);
        if (checkField) {
          filterObj?.formArray?.controls?.forEach(control => {
            control.value.isSelected = true;
          });
        }
      }
    });
  };

  getActiveSlideOutFilter = () => { 
    switch (this.activeFltrTab) {
      case BadgeFilterType.TreatmentPlans:
        return this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray;
      case BadgeFilterType.Appointments:
        return this.appointmentSlideout?.slideoutFilter?.patientModelArray;
      case BadgeFilterType.otherToDo:
        return this.otherToDoSlideout?.slideoutFilter?.patientModelArray;
      case BadgeFilterType.PreventiveCare:
        return this.preventiveCareSlideout?.slideoutFilter?.patientModelArray;
      default:
        return this.allPatientSlideout?.slideoutFilter?.patientModelArray;
    }
  }

  expandCollapseFilter = (isExpanded: boolean) => {
    const setExpandedState = (filter) => {
      filter.isExpanded = isExpanded;
    };
  
    if (this.activeFltrTab == BadgeFilterType.AllPatients) {
      this.allPatientSlideout?.slideoutFilter?.patientModelArray?.forEach(setExpandedState);
    } else if (this.activeFltrTab == BadgeFilterType.TreatmentPlans) {
      this.treatmentPlanSlideout?.slideoutFilter?.patientModelArray?.forEach(setExpandedState);
    } else if (this.activeFltrTab == BadgeFilterType.Appointments) {
      this.appointmentSlideout?.slideoutFilter?.patientModelArray?.forEach(setExpandedState);
    } else if (this.activeFltrTab == BadgeFilterType.otherToDo) {
      this.otherToDoSlideout?.slideoutFilter?.patientModelArray?.forEach(setExpandedState);
    } else if (this.activeFltrTab == BadgeFilterType.PreventiveCare) {
      this.preventiveCareSlideout?.slideoutFilter?.patientModelArray?.forEach(setExpandedState);
    }
  }
  
  ngOnDestroy() {
    this.subscriptions?.forEach((subscription) => subscription?.unsubscribe());
  }

}
