import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PatientSlideoutComponent } from './patient-slideout.component';
import { TranslateModule } from '@ngx-translate/core';
import { ElementRef, QueryList, Renderer2 } from '@angular/core';
import { PatientFilterService } from '../service/patient-filter.service';
import { AllPatientSlideoutComponent } from '../patient-landing/all-patient-slideout/all-patient-slideout.component';
import { PatientTabFilter } from '../common/models/patient-grid-response.model';
import { SlideoutFilterComponent } from '../common/components/slideout-filter/app-slideout-filter.component';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { PatientAdditionalIdentifierService } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { AllPatientGridFilter, AppointmentGridFilter, OtherToDoGridFilter, PreventiveCareGridFilter } from '../common/models/patient-grid-filter.model';
import { Subscription, of } from 'rxjs';
import { TreatmentPlansSlideoutComponent } from '../patient-landing/treatment-plans-slideout/treatment-plans-slideout.component';
import { BadgeFilterType } from '../common/models/patient-location.model';
import { OtherToDoSlideoutComponent } from '../patient-landing/other-to-do-slideout/other-to-do-slideout.component';
import { AppointmentSlideoutComponent } from '../patient-landing/appointment-slideout/appointment-slideout.component';
import { PreventiveCareSlideoutComponent } from '../patient-landing/preventive-care-slideout/preventive-care-slideout.component';
import { SlideoutFilter } from '../common/models/enums/patient.enum';

const mockPatientTabFilter: PatientTabFilter[] = [{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "AdditionalIdentifiers",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "AppointmentStates",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" }),
  new FormControl({ isSelected: true, value: "Completed" })]),
  formControls: null,
  liFormArrayName: "123"  ,
  isExpanded: false
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "PatientTypeStatus",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray(
    [new FormControl({ isSelected: true, value: "Active" }),
    new FormControl({ isSelected: true, value: "All" }),
    new FormControl({ isSelected: true, value: "All" }),
    new FormControl({ isSelected: true, value: "All" }),
    new FormControl({ isSelected: true, value: "All" })]),
  formControls: null,
  liFormArrayName: "123" ,
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "GroupTypes",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123"  ,
  isExpanded: false
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "PreferredDentists",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false  
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "PreferredHygienists",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "PreventiveCare",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false  
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "ReminderStatus",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false  
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "TreatmentPlanStates",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "ZipCodes",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false  
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "BirthMonths",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "PreferredLocations",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "DueDateItems",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "TreatmentPlanName",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: false, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "TreatmentProviders",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: false, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "Providers",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: false, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "Rooms",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: false, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "SoonerIfPossible",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "AppointmentTypes",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "PastDue",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: true, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
},
{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "PreventiveIsScheduled",
  filterText: "filtrText",
  filter: [],
  formArray: new FormArray([new FormControl({ isSelected: false, isVisible: true, key: "All", value: "All" })]),
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false 
}
];


const mockPatientFilterService = {
  selectedIdentifiers: of(["test 1", "test 2"]),
  selectedAppointmentDates: of(["test 1", "test 2"]),
  selectedAppointmentStatus: of(["test 1", "test 2"]),
  birthMonthStatus: of(["test 1", "test 2"]),
  groupTypesStatus: of(["test 1", "test 2"]),
  InsuranceStatus: of(["test 1", "test 2"]),
  activeTypeStatus: of(["test 1", "test 2"]),
  patientTypeStatus: of(["test 1", "test 2"]),
  preferredDentistStatus: of(["test 1", "test 2"]),
  preferredHygienistsStatus: of(["test 1", "test 2"]),
  preferredLocationsStatus: of(["test 1", "test 2"]),
  isNoDueDateStatus: of(["test 1", "test 2"]),
  preventiveCareStatus: of(["test 1", "test 2"]),
  remindersStatus: of(["test 1", "test 2"]),
  treatmentPlansStatus: of(["test 1", "test 2"]),
  zipCodesStatus: of(["test 1", "test 2"]),
  selectedCount$: of(3),
  initializeDefaultFilters: jasmine.createSpy(),
  initializeDefaultOtherToDoFilters: jasmine.createSpy(),
  initializeDefaultTreatmentPlansFilters: jasmine.createSpy(),
  initializeDefaultAppointmentFilters: jasmine.createSpy(),
  initializeDefaultPreventiveCareFilters: jasmine.createSpy(),
  setClearDateValues: jasmine.createSpy(),
  expandCollapseFilter: of(true),

}

export class mockElementRef extends ElementRef {
  nativeElement: {
    classList: {
      contains: () => true
    },
    querySelectorAll: () => ['test 1', 'test 2','.panel-collapse.in'],
  }
}

const mockRenderer2 = {
  setProperty: jasmine.createSpy(),
  removeClass: jasmine.createSpy(),
  addClass: jasmine.createSpy()
};

const mockToastrFactory = {
  success: jasmine.createSpy('toastrFactory.success'),
  error: jasmine.createSpy('toastrFactory.error')
};

const mockPatientAdditionalIdentifierService = {
  save: jasmine.createSpy(),
  update: jasmine.createSpy(),
  delete: jasmine.createSpy(),
  additionalIdentifiersWithPatients: jasmine.createSpy()
}

describe('PatientSlideoutComponent', () => {
  let component: PatientSlideoutComponent;
  let fixture: ComponentFixture<PatientSlideoutComponent>;

  let allPatientSlideoutComponent: AllPatientSlideoutComponent;
  let allPatientSlideoutComponentFixture: ComponentFixture<AllPatientSlideoutComponent>;

  let slideoutFilterComponent: SlideoutFilterComponent;
  let slideoutFilterComponentFixture: ComponentFixture<SlideoutFilterComponent>;


  let treatmentPlansSlideoutComponent: TreatmentPlansSlideoutComponent;
  let treatmentPlansSlideoutComponentFixture: ComponentFixture<TreatmentPlansSlideoutComponent>;

  let otherToDoSlideoutComponent: OtherToDoSlideoutComponent;
  let otherToDoSlideoutComponentFixture: ComponentFixture<OtherToDoSlideoutComponent>;

  let appointmentSlideoutComponent: AppointmentSlideoutComponent;
  let appointmentSlideoutComponentFixture: ComponentFixture<AppointmentSlideoutComponent>;

  let preventiveCareSlideoutComponent: PreventiveCareSlideoutComponent;
  let preventiveCareSlideoutComponentFixture: ComponentFixture<PreventiveCareSlideoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: PatientFilterService, useValue: mockPatientFilterService },
        { provide: ElementRef, useClass: mockElementRef },
        { provide: Renderer2, useValue: mockRenderer2 },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: PatientAdditionalIdentifierService, useValue: mockPatientAdditionalIdentifierService },
        FormBuilder
      ],
      declarations: [PatientSlideoutComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientSlideoutComponent);
    component = fixture.componentInstance;

    allPatientSlideoutComponentFixture = TestBed.createComponent(AllPatientSlideoutComponent);
    allPatientSlideoutComponent = allPatientSlideoutComponentFixture.componentInstance;

    slideoutFilterComponentFixture = TestBed.createComponent(SlideoutFilterComponent);
    slideoutFilterComponent = slideoutFilterComponentFixture.componentInstance;

    treatmentPlansSlideoutComponentFixture = TestBed.createComponent(TreatmentPlansSlideoutComponent);
    treatmentPlansSlideoutComponent = treatmentPlansSlideoutComponentFixture.componentInstance;

    otherToDoSlideoutComponentFixture = TestBed.createComponent(OtherToDoSlideoutComponent);
    otherToDoSlideoutComponent = otherToDoSlideoutComponentFixture.componentInstance;

    appointmentSlideoutComponentFixture = TestBed.createComponent(AppointmentSlideoutComponent);
    appointmentSlideoutComponent = appointmentSlideoutComponentFixture.componentInstance;

    preventiveCareSlideoutComponentFixture = TestBed.createComponent(PreventiveCareSlideoutComponent);
    preventiveCareSlideoutComponent = preventiveCareSlideoutComponentFixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should initialize component properties', () => {
      const filterCriteria = new AllPatientGridFilter();
      expect(component.allPatientRequest.FilterCriteria).toEqual(filterCriteria);
      expect(component.allPatientRequest.CurrentPage).toEqual(0);
      expect(component.allPatientRequest.PageCount).toEqual(50);
      expect(component.allPatientRequest.SortCriteria).toEqual({});
      expect(component.allPatientRequest.TotalCount).toEqual(0);
      expect(component.textExpandCollapse).toEqual(component.collapseAll);
      expect(component.classExpandCollapse).toEqual(true);
      component.ngOnInit();
      expect(component.appliedFiltersCount).toEqual(3);
    });

    it('should subscribe to expandCollapseFilter and update classExpandCollapse and textExpandCollapse', () => {
      mockPatientFilterService.expandCollapseFilter = of(false);
      component.ngOnInit();
  
      expect(component.classExpandCollapse).toBe(false);
      expect(component.textExpandCollapse).toEqual(component.expandAll);
    });
  });

  describe('hideDiv ->', () => {
    it('should emit closePatientSlideout on hideDiv', () => {
      spyOn(component.closePatientSlideout, 'emit');
      component.hideDiv();
      expect(component.closePatientSlideout.emit).toHaveBeenCalled();
    });
  });

  describe('collapsePanel ->', () => {

    it('should expand filters when textExpandCollapse is expandAll', () => {
      component.textExpandCollapse = component.expandAll;
      spyOn(component, 'expandFilters');
      spyOn(component, 'collapseFilters');
      component.collapsePanel();
      expect(component.expandFilters).toHaveBeenCalled();
      expect(component.collapseFilters).not.toHaveBeenCalled();
    });

    it('should collapse filters when textExpandCollapse is not expandAll', () => {
      component.textExpandCollapse = 'not expandAll';
      spyOn(component, 'expandFilters');
      spyOn(component, 'collapseFilters');
      component.collapsePanel();
      expect(component.expandFilters).not.toHaveBeenCalled();
      expect(component.collapseFilters).toHaveBeenCalled();
    });

  });

  describe('collapseFilters ->', () => {
    it('should collapse filters', () => {
      component.expandAll = 'Expand All';
      component.textExpandCollapse = 'Collapse All';
      component.classExpandCollapse = false;
      component.collapseFilters();
      expect(component.textExpandCollapse).toEqual('Expand All');
      expect(component.classExpandCollapse).toEqual(true);
    });
  });

  describe('expandFilters ->', () => {
    it('should expand filters', () => {
      component.collapseAll = 'Collapse All';
      component.textExpandCollapse = 'Expand All';
      component.classExpandCollapse = true;
      component.expandFilters();
      expect(component.textExpandCollapse).toEqual('Collapse All');
    });
  });

  describe('resetOtherToDoFilters ->', () => {
    beforeEach(() => {
      component.otherToDoSlideout = otherToDoSlideoutComponent;
      component.otherToDoSlideout.slideoutFilter = slideoutFilterComponent;
      component.otherToDoSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;
      component.expandCollapseFilter = jasmine.createSpy();
    });
  
    it('should reset OtherToDoSlideout filters and emit FilterCriteria', () => {
      component.resetOtherToDoFilters();
      expect(component.otherToDoSlideout.slideoutFilter.patientModelArray[0].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.otherToDoSlideout.slideoutFilter.patientModelArray[1].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.otherToDoSlideout.slideoutFilter.patientModelArray[12].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.otherToDoSlideout.slideoutFilter.patientModelArray[3].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.otherToDoSlideout.slideoutFilter.patientModelArray[4].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.otherToDoSlideout.slideoutFilter.patientModelArray[6].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.otherToDoSlideout.slideoutFilter.patientModelArray[2].formArray.controls[0].value.isSelected).toBe(true);
      
      expect(component.expandCollapseFilter).toHaveBeenCalledWith(false);
    });
  });

  describe('resetTreatmentPlanFilters ->', () => {
    beforeEach(() => {
      component.treatmentPlanSlideout = treatmentPlansSlideoutComponent;
      component.treatmentPlanSlideout.slideoutFilter = slideoutFilterComponent;
      component.treatmentPlanSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;
      component.treatmentPlanSlideout.slideoutFilter.treatmentPlanInput = [{ nativeElement: { value: 'value1' } }] as unknown as QueryList<ElementRef>;
      spyOn(component.filterCriteria, 'emit');
      component.expandCollapseFilter = jasmine.createSpy();
    });
  
    it('should reset treatmentPlanSlideout filters and emit FilterCriteria', () => {
      component.resetTreatmentPlanFilters();
      expect(component.treatmentPlanSlideout.slideoutFilter.patientModelArray[0].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.treatmentPlanSlideout.slideoutFilter.patientModelArray[1].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.treatmentPlanSlideout.slideoutFilter.patientModelArray[3].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.treatmentPlanSlideout.slideoutFilter.patientModelArray[4].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.treatmentPlanSlideout.slideoutFilter.patientModelArray[6].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.treatmentPlanSlideout.slideoutFilter.patientModelArray[2].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.treatmentPlanSlideout.slideoutFilter.treatmentPlanInput[0].nativeElement.value).toBe('');
      expect(component.expandCollapseFilter).toHaveBeenCalledWith(false);
    });
  });

  describe('resetAppointmentFilters ->', () => {
    beforeEach(() => {
      component.appointmentSlideout = appointmentSlideoutComponent;
      component.appointmentSlideout.slideoutFilter = slideoutFilterComponent;
      component.appointmentSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;
      spyOn(component.filterCriteria, 'emit');
      component.expandCollapseFilter = jasmine.createSpy();
    });
  
    it('should reset appointmentSlideout filters and emit FilterCriteria', () => {
      component.resetAppointmentFilters();
      expect(component.appointmentSlideout.slideoutFilter.patientModelArray[0].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.appointmentSlideout.slideoutFilter.patientModelArray[1].formArray.controls[1].value.isSelected).toBe(false);
      expect(component.appointmentSlideout.slideoutFilter.patientModelArray[3].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.appointmentSlideout.slideoutFilter.patientModelArray[4].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.appointmentSlideout.slideoutFilter.patientModelArray[6].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.appointmentSlideout.slideoutFilter.patientModelArray[2].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.appointmentSlideout.slideoutFilter.patientModelArray[15].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.appointmentSlideout.slideoutFilter.patientModelArray[16].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.appointmentSlideout.slideoutFilter.patientModelArray[17].formArray.controls[0].value.isSelected).toBe(false);
      expect(component.expandCollapseFilter).toHaveBeenCalledWith(false);
    });
  });

  describe('resetPreventiveCareFilters ->', () => {
    beforeEach(() => {
      component.preventiveCareSlideout = preventiveCareSlideoutComponent;
      component.preventiveCareSlideout.slideoutFilter = slideoutFilterComponent;
      component.preventiveCareSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;
      spyOn(component.filterCriteria, 'emit');
      component.expandCollapseFilter = jasmine.createSpy();
    });
  
    it('should reset preventiveCareSlideout filters and emit FilterCriteria', () => {
      component.resetPreventiveCareFilters();
      expect(component.preventiveCareSlideout.slideoutFilter.patientModelArray[0].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.preventiveCareSlideout.slideoutFilter.patientModelArray[1].formArray.controls[1].value.isSelected).toBe(false);
      expect(component.preventiveCareSlideout.slideoutFilter.patientModelArray[3].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.preventiveCareSlideout.slideoutFilter.patientModelArray[4].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.preventiveCareSlideout.slideoutFilter.patientModelArray[6].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.preventiveCareSlideout.slideoutFilter.patientModelArray[2].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.preventiveCareSlideout.slideoutFilter.patientModelArray[19].formArray.controls[0].value.isSelected).toBe(false);
      expect(component.preventiveCareSlideout.slideoutFilter.patientModelArray[20].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.expandCollapseFilter).toHaveBeenCalledWith(false);
    });
  });

  describe('resetFilters ->', () => {
    it('should reset filters', () => {
      component.collapseAllPanels = jasmine.createSpy();
      component.activeFltrTab = 2;
      component.allPatientSlideout = allPatientSlideoutComponent;
      component.allPatientSlideout.slideoutFilter = slideoutFilterComponent;
      component.allPatientSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;

      component.resetFilters();
      expect(component.collapseAllPanels).toHaveBeenCalled();
    });

    it('should call resetTreatmentPlanFilters when activeFltrTab is BadgeFilterType.TreatmentPlans', () => {
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      spyOn(component, 'resetTreatmentPlanFilters');
      component.resetFilters();
      expect(component.resetTreatmentPlanFilters).toHaveBeenCalled();
    });

    it('should call resetOtherToDoFilters when activeFltrTab is BadgeFilterType.otherToDo', () => {
      component.activeFltrTab = BadgeFilterType.otherToDo;
      spyOn(component, 'resetOtherToDoFilters');
      component.resetFilters();
      expect(component.resetOtherToDoFilters).toHaveBeenCalled();
    });

    it('should call resetAppointmentFilters when activeFltrTab is BadgeFilterType.Appointments', () => {
      component.activeFltrTab = BadgeFilterType.Appointments;
      spyOn(component, 'resetAppointmentFilters');
      component.resetFilters();
      expect(component.resetAppointmentFilters).toHaveBeenCalled();
    });

    it('should call resetPreventiveCareFilters when activeFltrTab is BadgeFilterType.PreventiveCare', () => {
      component.activeFltrTab = BadgeFilterType.PreventiveCare;
      spyOn(component, 'resetPreventiveCareFilters');
      component.resetFilters();
      expect(component.resetPreventiveCareFilters).toHaveBeenCalled();
    });
  });

  describe('collapseAllPanels ->', () => {
    it('should collapse all Patient panels', () => {
      component.activeFltrTab = BadgeFilterType.AllPatients
      component.allPatientSlideout = allPatientSlideoutComponent;
      component.allPatientSlideout.slideoutFilter = slideoutFilterComponent;
      component.allPatientSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;
      spyOn(document, 'getElementById').and.returnValues({ classList: { contains: () => true, remove: () => { } } }, { classList: { contains: () => true, remove: () => { } } });
      component.collapseAllPanels();
      expect(document.getElementById).toHaveBeenCalled();
    });

    it('should collapse all TreatmentPlans panels', () => {
      component.activeFltrTab = BadgeFilterType.TreatmentPlans
      component.treatmentPlanSlideout = treatmentPlansSlideoutComponent;
      component.treatmentPlanSlideout.slideoutFilter = slideoutFilterComponent;
      component.treatmentPlanSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;
      spyOn(document, 'getElementById').and.returnValues({ classList: { contains: () => true, remove: () => { } } }, { classList: { contains: () => true, remove: () => { } } });
      component.collapseAllPanels();
      expect(document.getElementById).toHaveBeenCalled();
    });

    it('should collapse all otherToDo panels', () => {
      component.activeFltrTab = BadgeFilterType.otherToDo
      component.otherToDoSlideout = otherToDoSlideoutComponent;
      component.otherToDoSlideout.slideoutFilter = slideoutFilterComponent;
      component.otherToDoSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;
      spyOn(document, 'getElementById').and.returnValues({ classList: { contains: () => true, remove: () => { } } }, { classList: { contains: () => true, remove: () => { } } });
      component.collapseAllPanels();
      expect(document.getElementById).toHaveBeenCalled();
    });

    it('should collapse all Appointment panels', () => {
      component.activeFltrTab = BadgeFilterType.Appointments
      component.appointmentSlideout = appointmentSlideoutComponent;
      component.appointmentSlideout.slideoutFilter = slideoutFilterComponent;
      component.appointmentSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;
      spyOn(document, 'getElementById').and.returnValues({ classList: { contains: () => true, remove: () => { } } }, { classList: { contains: () => true, remove: () => { } } });
      component.collapseAllPanels();
      expect(document.getElementById).toHaveBeenCalled();
    });

    it('should collapse all PreventiveCare panels', () => {
      component.activeFltrTab = BadgeFilterType.PreventiveCare
      component.preventiveCareSlideout = preventiveCareSlideoutComponent;
      component.preventiveCareSlideout.slideoutFilter = slideoutFilterComponent;
      component.preventiveCareSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;
      spyOn(document, 'getElementById').and.returnValues({ classList: { contains: () => true, remove: () => { } } }, { classList: { contains: () => true, remove: () => { } } });
      component.collapseAllPanels();
      expect(document.getElementById).toHaveBeenCalled();
    });
  });

  describe('selectOnReset ->', () => {
    it('should select on reset', () => {
      const filterOption = [
        { setValue: jasmine.createSpy() },
        { setValue: jasmine.createSpy() },
      ];
      component.selectOnReset(filterOption);
      expect(filterOption[0].setValue).toHaveBeenCalledWith({ value: SlideoutFilter.All || '', isSelected: true });
    });
  });

  describe('applyFilters ->', () => {
    it('should apply filters for all patients', () => {
      component.allPatientRequest.FilterCriteria = new AllPatientGridFilter();
      component.activeFltrTab = BadgeFilterType.AllPatients;
      component.subscriptions = [];
      spyOn(component.filterCriteria, 'emit');
      component.applyFilters();
      expect(component.filterCriteria.emit).toHaveBeenCalled();
    });

    it('should apply filters for TreatmentPlans', () => {
      component.allPatientRequest.FilterCriteria = new AllPatientGridFilter();
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.subscriptions = [];
      component.treatmentPlanSlideout = treatmentPlansSlideoutComponent;
      spyOn(component.filterCriteria, 'emit');
      component.applyFilters();
      expect(component.filterCriteria.emit).toHaveBeenCalled();
    });

    it('should apply filters for otherToDo', () => {
      component.otherToDoRequest.FilterCriteria = new OtherToDoGridFilter();
      component.activeFltrTab = BadgeFilterType.otherToDo;
      component.subscriptions = [];
      component.otherToDoSlideout = otherToDoSlideoutComponent;
      spyOn(component.filterCriteria, 'emit');
      component.applyFilters();
      expect(component.filterCriteria.emit).toHaveBeenCalled();
    });

    it('should apply filters for Appointments', () => {
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.activeFltrTab = BadgeFilterType.Appointments;
      component.subscriptions = [];
      component.appointmentSlideout = appointmentSlideoutComponent;
      spyOn(component.filterCriteria, 'emit');
      component.applyFilters();
      expect(component.filterCriteria.emit).toHaveBeenCalled();
    });

    it('should apply filters for PreventiveCare', () => {
      component.preventiveCareRequest.FilterCriteria = new PreventiveCareGridFilter();
      component.activeFltrTab = BadgeFilterType.PreventiveCare;
      component.subscriptions = [];
      component.preventiveCareSlideout = preventiveCareSlideoutComponent;
      spyOn(component.filterCriteria, 'emit');
      component.applyFilters();
      expect(component.filterCriteria.emit).toHaveBeenCalled();
    });
  });

  describe('setDefaultSlideOutFilter ->', () => {
    it('should update isSelected when activeFltrTab is in defaultFilterKey and all controls in formArray are not selected', () => {
      component.activeFltrTab = BadgeFilterType.AllPatients;
      spyOn(component, 'getActiveSlideOutFilter').and.returnValue([{ divUlId: SlideoutFilter.ZipCodes, formArray: new FormArray([new FormControl({ isSelected: false })]) }]);
  
      component.setDefaultSlideOutFilter();
  
      const patientModelArray = component.getActiveSlideOutFilter();
      expect(patientModelArray[0].formArray.controls[0].value.isSelected).toBe(true);
    });
  });

  describe('getActiveSlideOutFilter ->', () => {
    it('should return the correct patientModelArray for treatmentPlanSlideout', () => {
      component.treatmentPlanSlideout = treatmentPlansSlideoutComponent;
      component.treatmentPlanSlideout.slideoutFilter = slideoutFilterComponent;
      component.treatmentPlanSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;

      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      const patientModelArray = component.getActiveSlideOutFilter();

      expect(patientModelArray).toBe(component.treatmentPlanSlideout.slideoutFilter.patientModelArray);
    });

    it('should return the correct patientModelArray for otherToDoSlideout', () => {
      component.activeFltrTab = BadgeFilterType.otherToDo;
      component.otherToDoSlideout = otherToDoSlideoutComponent;
      component.otherToDoSlideout.slideoutFilter = slideoutFilterComponent;
      component.otherToDoSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;

      const patientModelArray = component.getActiveSlideOutFilter();

      expect(patientModelArray).toBe(component.otherToDoSlideout.slideoutFilter.patientModelArray);
    });
  });

  describe('expandCollapseFilter ->', () => {

    it('should expand all filters when isExpanded is true', () => {
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.treatmentPlanSlideout = treatmentPlansSlideoutComponent;
      component.treatmentPlanSlideout.slideoutFilter = slideoutFilterComponent;
      component.treatmentPlanSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;  
      component.expandCollapseFilter(true);    
      expect(component.treatmentPlanSlideout?.slideoutFilter?.patientModelArray[0].isExpanded).toBe(true);
    });

    it('should expand appointment filters when isExpanded is true', () => {
      component.activeFltrTab = BadgeFilterType.Appointments;
      component.appointmentSlideout = appointmentSlideoutComponent;
      component.appointmentSlideout.slideoutFilter = slideoutFilterComponent;
      component.appointmentSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;  
      component.expandCollapseFilter(true);    
      expect(component.appointmentSlideout?.slideoutFilter?.patientModelArray[0].isExpanded).toBe(true);
    });

    it('should expand otherToDo filters when isExpanded is true', () => {
      component.activeFltrTab = BadgeFilterType.otherToDo;
      component.otherToDoSlideout = otherToDoSlideoutComponent;
      component.otherToDoSlideout.slideoutFilter = slideoutFilterComponent;
      component.otherToDoSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;  
      component.expandCollapseFilter(true);    
      expect(component.otherToDoSlideout?.slideoutFilter?.patientModelArray[0].isExpanded).toBe(true);
    });

    it('should expand preventiveCare filters when isExpanded is true', () => {
      component.activeFltrTab = BadgeFilterType.PreventiveCare;
      component.preventiveCareSlideout = preventiveCareSlideoutComponent;
      component.preventiveCareSlideout.slideoutFilter = slideoutFilterComponent;
      component.preventiveCareSlideout.slideoutFilter.patientModelArray = mockPatientTabFilter;  
      component.expandCollapseFilter(true);    
      expect(component.preventiveCareSlideout?.slideoutFilter?.patientModelArray[0].isExpanded).toBe(true);
    });
  });

  describe('ngOnDestroy ->', () => {

    it('should unsubscribe from all subscriptions', () => {
      const subscription1 = new Subscription();
      const subscription2 = new Subscription();
      spyOn(subscription1, 'unsubscribe');
      spyOn(subscription2, 'unsubscribe');
      component.subscriptions = [subscription1, subscription2];
      component.ngOnDestroy();
      expect(subscription1.unsubscribe).toHaveBeenCalled();
      expect(subscription2.unsubscribe).toHaveBeenCalled();
    });

  });

});
