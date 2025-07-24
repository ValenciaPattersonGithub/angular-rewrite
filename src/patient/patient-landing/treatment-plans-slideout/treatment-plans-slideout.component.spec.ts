import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentPlansSlideoutComponent } from './treatment-plans-slideout.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SlideoutFilterComponent } from 'src/patient/common/components/slideout-filter/app-slideout-filter.component';
import { PatientFilterService } from 'src/patient/service/patient-filter.service';
import { PatientFliterCategory, PatientTabFilter } from 'src/patient/common/models/patient-grid-response.model';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { PatientAdditionalIdentifierService } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { TreatmentPlansRequest } from 'src/patient/common/models/patient-grid-request.model';
import { BadgeFilterType } from 'src/patient/common/models/patient-location.model';
import { SlideoutFilter } from 'src/patient/common/models/enums/patient.enum';
import { Subscription, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TreatmentPlansSlideoutComponent', () => {
  let component: TreatmentPlansSlideoutComponent;
  let fixture: ComponentFixture<TreatmentPlansSlideoutComponent>;

  let childComponent: SlideoutFilterComponent;
  let childComponentFixture: ComponentFixture<SlideoutFilterComponent>;

  let mockbirthMonths;
  let mockInsuranceFilters: PatientFliterCategory<string>[];
  let mockPreferredLocations: PatientFliterCategory<string>[];
  let mockPatientTabFilter: PatientTabFilter[];
  let mockPatientTabFilter2: PatientTabFilter[];
  let mockPreventiveCareStates: PatientFliterCategory<string>[];
  let mockReminderStatus: PatientFliterCategory<string>[];
  let mockTreatmentPlanStates: PatientFliterCategory<string>[];
  let mockZipCodes: PatientFliterCategory<string>[];
  let mockTreatmentPlansRequest: TreatmentPlansRequest;
  let mockTreatmentPlanName: PatientFliterCategory<string>[];
  let mockTreatmentPlanStatus: PatientFliterCategory<string>[];
  let mockPatientFilterService;
  let mockToastrFactory;
  let mockPatientAdditionalIdentifierService;

  beforeEach(async () => {
    mockbirthMonths = [
      { field: 'BirthMonths', value: 0, key: -1, isSelected: true },
      { field: 'BirthMonths', value: 1, key: 0, isSelected: true },
      { field: 'BirthMonths', value: 'January', key: 1, isSelected: true },
      { field: 'BirthMonths', value: 'February', key: 2, isSelected: true },
      { field: 'BirthMonths', value: 'March', key: 3, isSelected: true },
      { field: 'BirthMonths', value: 'April', key: 4, isSelected: true },
      { field: 'BirthMonths', value: 'May', key: 5, isSelected: true },
      { field: 'BirthMonths', value: 'June', key: 6, isSelected: true },
      { field: 'BirthMonths', value: 'July', key: 7, isSelected: true },
      { field: 'BirthMonths', value: 'August', key: 8, isSelected: true },
      { field: 'BirthMonths', value: 'September', key: 9, isSelected: true },
      { field: 'BirthMonths', value: 'October', key: 10, isSelected: true },
      { field: 'BirthMonths', value: 'November', key: 11, isSelected: true },
      { field: 'BirthMonths', value: 'December', key: 12, isSelected: true },
    ];

    mockInsuranceFilters = [
      { field: 'HasInsurance', value: '', key: 'All', isSelected: true },
      { field: 'HasInsurance', value: 'Yes', key: 'true', isSelected: false },
      { field: 'HasInsurance', value: 'No', key: 'false', isSelected: false },
    ];

    mockPreferredLocations = [
      {
        field: 'PreferredLocations',
        value: 'all',
        key: 'All',
        isVisible: true,
        isSelected: true
      },
    ];

    mockPatientTabFilter = [{
      dataTarget: "1",
      divClassId: "123",
      divUlId: "123",
      filterText: "filtrText",
      filter: [],
      formArray: null,
      formControls: null,
      liFormArrayName: "123"
    }];

    mockPatientTabFilter2 = [{
      dataTarget: "1",
      divClassId: "123",
      divUlId: "123",
      filterText: "filtrText",
      filter: [],
      formArray: null,
      formControls: null,
      liFormArrayName: "123"
    }];

    mockPreventiveCareStates = [
      { field: 'IsNoDueDate', value: 'all', key: 'All', isSelected: true },
      { field: 'IsNoDueDate', value: 'No Due Date', key: 'true', isSelected: true },
      { field: 'PreventiveCareIsScheduled', value: '1', key: 'true', isSelected: true },
      { field: 'PreventiveCareIsScheduled', value: '2', key: 'false', isSelected: true },
    ];

    mockReminderStatus = [
      { field: 'ReminderStatus', value: 'all', key: 'All', isSelected: true },
      { field: 'ReminderStatus', value: 'none', key: null, isSelected: true },
      { field: 'ReminderStatus', value: 'Confirmed', key: '2', isSelected: true },
      { field: 'ReminderStatus', value: 'Reminder Sent', key: '1', isSelected: true },
      { field: 'ReminderStatus', value: 'Unconfirmed', key: '0', isSelected: true },
    ];

    mockTreatmentPlanStates = [
      { field: 'TreatmentPlanStates', value: 'all', key: 'All', isSelected: true },
      { field: 'TreatmentPlanStates', value: 'none', key: null, isSelected: true },
      { field: 'TreatmentPlanStates', value: 'true', key: 'true', isSelected: true },
      { field: 'TreatmentPlanStates', value: 'false', key: 'false', isSelected: true },
    ];

    mockZipCodes = [
      {
        field: 'ZipCodes',
        value: 'all',
        key: '',
        isVisible: true,
        isSelected: true,
      }
    ];

    mockTreatmentPlansRequest = {
      CurrentPage: 0,
      PageCount: 50
    };

    mockTreatmentPlanName = [
      { field: 'TreatmentPlanName', value: '', key: 'Equal To', isSelected: true },
      { field: 'TreatmentPlanName', value: '', key: 'Contains', isSelected: true }
    ];

    mockTreatmentPlanStatus = [
      { field: 'IsUnscheduled', value: '', key: 'true', isSelected: true },
      { field: 'IsScheduled', value: '', key: 'true', isSelected: true },
      { field: 'IsProposed', value: 'Proposed', key: 'true', isSelected: true },
      { field: 'IsAccepted', value: 'Accepted', key: 'true', isSelected: true }
    ];

    mockPatientFilterService = {
      birthMonths: mockbirthMonths,
      insuranceFilters: mockInsuranceFilters,
      preferredLocations: mockPreferredLocations,
      preventiveCareStates: mockPreventiveCareStates,
      reminderStatus: mockReminderStatus,
      treatmentPlanStates: mockTreatmentPlanStates,
      treatmentPlanName: mockTreatmentPlanName,
      setCommonStructure: jasmine.createSpy().and.returnValue(mockPatientTabFilter[0]),
      setLocationZipCodes: jasmine.createSpy().and.returnValue(mockZipCodes),
      setDefaultGroupTypes: jasmine.createSpy(),
      setDefaultPreferredDentist: jasmine.createSpy(),
      setDefaultPreferredHygienst: jasmine.createSpy(),
      broadcastSelectedCount: jasmine.createSpy(),
      initializeDefaultFilters: jasmine.createSpy(),
      initializeDefaultTreatmentPlansFilters: jasmine.createSpy().and.returnValue(mockTreatmentPlansRequest),
      patientModelStatus: of(["test 1", "test 2"]),
      treatmentPlanStatus: mockTreatmentPlanStatus
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    mockPatientAdditionalIdentifierService = {
      save: jasmine.createSpy(),
      update: jasmine.createSpy(),
      get: jasmine.createSpy(),
      additionalIdentifiersWithPatients: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      declarations: [TreatmentPlansSlideoutComponent],
      providers: [
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: PatientAdditionalIdentifierService, useValue: mockPatientAdditionalIdentifierService },
        { provide: PatientFilterService, useValue: mockPatientFilterService },
        FormBuilder,
        TranslateService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentPlansSlideoutComponent);
    component = fixture.componentInstance;

    childComponentFixture = TestBed.createComponent(SlideoutFilterComponent);
    childComponent = childComponentFixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges ->', () => {
    it('should call getTreatmentPlanProviders', () => {
      spyOn(component, 'getTreatmentPlanProviders');
      component.slideoutFilter = childComponent;
      component.activeGridData = { TreatmentProviders: [] };
      component.ngOnChanges();
      expect(component.getTreatmentPlanProviders).toHaveBeenCalled();
    });
    it('should not call getTreatmentPlanProviders', () => {
      spyOn(component, 'getTreatmentPlanProviders');
      component.slideoutFilter = childComponent;
      component.activeGridData = null;
      component.ngOnChanges();
      expect(component.getTreatmentPlanProviders).not.toHaveBeenCalled();
    });
  });

  describe('Default properties ->', () => {
    it('should set properties', () => {
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        treatmentPlanStatus: new FormArray([]),
        treatmentPlanProviders: new FormArray([]),
        treatmentPlanCreatedDate: new FormArray([]),
        treatmentPlanName: new FormArray([])
      });
      expect(component.treatmentPlanStatusArray).toBeDefined();
      expect(component.treatmentPlanProvidersArray).toBeDefined();
      expect(component.treatmentPlansCreatedDateArray).toBeDefined();
      expect(component.treatmentPlansNameArray).toBeDefined();
    });
  });

  describe('ngAfterViewInit ->', () => {
    it('should only call initializeDefaultPropeties', () => {
      spyOn(component, 'initializeDefaultPropeties');
      spyOn(component, 'createForm');
      component.treatmentPlansRequest = new TreatmentPlansRequest();
      component.ngAfterViewInit();
      expect(component.initializeDefaultPropeties).toHaveBeenCalled();
      expect(component.createForm).not.toHaveBeenCalled();
    });

    it('should call initializeDefaultPropeties, createForm and other functions', () => {
      component.slideoutFilter = childComponent;
      spyOn(component, 'initializeDefaultPropeties');
      spyOn(component, 'createForm');
      spyOn(component, 'getTreatmentPlanCreatedDate');
      spyOn(component, 'getTreatmentPlanName');
      spyOn(component, 'getTreatmentPlanStatus');
      component.treatmentPlansRequest = new TreatmentPlansRequest();
      component.ngAfterViewInit();
      expect(component.initializeDefaultPropeties).toHaveBeenCalled();
      expect(component.createForm).toHaveBeenCalled();
      expect(component.getTreatmentPlanCreatedDate).toHaveBeenCalled();
      expect(component.getTreatmentPlanName).toHaveBeenCalled();
      expect(component.getTreatmentPlanStatus).toHaveBeenCalled();
      expect(component.slideoutFilter.patientModelArray.length).toEqual(0);
    });

  });

  describe('initializeDefaultPropeties ->', () => {
    it('should return default Values ', () => {
      component.initializeDefaultPropeties();
      expect(component.treatmentPlansRequest).toEqual(component.tratmentPlansFilterCriteria);
    });
  });

  describe('createForm  ->', () => {
    it('should set patientFilter Form ', () => {
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({});
      component.slideoutFilter.patientFilterForm.controls.treatmentPlanCreatedDate = new FormArray([]);

      component.createForm();
      expect(component.slideoutFilter.patientFilterForm.controls.treatmentPlanCreatedDate).toBeDefined();
      expect(component.slideoutFilter.patientFilterForm.controls.treatmentPlanName).toBeDefined();
      expect(component.slideoutFilter.patientFilterForm.controls.treatmentPlanStatus).toBeDefined();
      expect(component.slideoutFilter.patientFilterForm.controls.treatmentPlanProviders).toBeDefined();
      expect(component.slideoutFilter.patientFilterForm.controls.treatmentPlanCreatedDate).toBeDefined();
    });
  });

  describe('getTreatmentPlanCreatedDate   ->', () => {
    it('should not call setCommonStructure', () => {
      component.activeFltrTab = undefined
      component.slideoutFilter = childComponent;
      component.getTreatmentPlanCreatedDate();
      expect(mockPatientFilterService.setCommonStructure).not.toHaveBeenCalled();
    });

    it('should call setCommonStructure from getTreatmentPlanCreatedDate, when patientModelArray is empty', () => {
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientModelArray = [];
      component.getTreatmentPlanCreatedDate();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
      expect(component.slideoutFilter.patientModelArray.length).toEqual(1);
    });

    it('should call setCommonStructure from getTreatmentPlanCreatedDate', () => {
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientModelArray = mockPatientTabFilter2;
      component.getTreatmentPlanCreatedDate();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
      expect(component.slideoutFilter.patientModelArray.length).toEqual(1);
    });

  });

  describe('getTreatmentPlanName ->', () => {
    it('should not set treatmentPlanName', () => {
      component.activeFltrTab = null;
      component.getTreatmentPlanName();
      expect(component.treatmentPlanName).toEqual(undefined);
    });

    it('should set treatmentPlanName', () => {
      component.treatmentPlanName = [];
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientModelArray = mockPatientTabFilter2;
      component.slideoutFilter.patientFilterForm = new FormGroup({ treatmentPlanName: new FormArray([]) });
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.getTreatmentPlanName();
      expect(component.treatmentPlanName.length).toEqual(2);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
    });

    it('should set treatmentPlanName, when patientModelArray is empty', () => {
      component.treatmentPlanName = [];
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientModelArray = [];
      component.slideoutFilter.patientFilterForm = new FormGroup({ treatmentPlanName: new FormArray([]) });
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.getTreatmentPlanName();
      expect(component.treatmentPlanName.length).toEqual(2);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
    });
  });

  describe('getTreatmentPlanStatus ->', () => {
    it('should define treatmentPlanStatusArray', () => {
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientModelArray = mockPatientTabFilter2;
      component.slideoutFilter.patientFilterForm = new FormGroup({ treatmentPlanStatus: new FormArray([]) });
      component.getTreatmentPlanStatus();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
      expect(component.slideoutFilter.patientModelArray.length).toEqual(1);
      expect(component.treatmentPlanStatusArray).toBeDefined();
    });

    it('should define treatmentPlanStatusArray, when patientModelArray is empty', () => {
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({ treatmentPlanStatus: new FormArray([]) });
      component.slideoutFilter.patientModelArray = [];
      component.getTreatmentPlanStatus();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
      expect(component.slideoutFilter.patientModelArray.length).toEqual(1);
      expect(component.treatmentPlanStatusArray).toBeDefined();
    });

  });

  describe('getTreatmentPlanProviders ->', () => {

    it('should call setCommonStructure, when patientModelArray is null', () => {
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({ treatmentPlanProviders: new FormArray([]) });
      component.activeGridData = { TreatmentProviders: [{ key: '1', value: 1 }, { key: '2', value: 2 }] };
      component.slideoutFilter.patientModelArray = [];
      component.getTreatmentPlanProviders();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
      expect(component.slideoutFilter.patientModelArray.length).toEqual(1);
    });

    it('should call setCommonStructure', () => {
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({ treatmentPlanProviders: new FormArray([]) });
      component.slideoutFilter.patientModelArray = mockPatientTabFilter2;
      component.activeGridData = { TreatmentProviders: [{ key: '1', value: 1 }, { key: '2', value: 2 }] };
      component.getTreatmentPlanProviders();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
      expect(component.slideoutFilter.patientModelArray.length).toEqual(1);
    });

    it('should call setCommonStructure when treatmentProviders is empty array, isItemSelected', () => {
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({ treatmentPlanProviders: new FormArray([]) });
      component.slideoutFilter.patientModelArray = mockPatientTabFilter2;
      component.activeGridData = { TreatmentProviders: [{ key: '1', value: 1 }, { key: '2', value: 2 }] };
      component.isFirstLoad = false;
      component.treatmentProviders = [];
      spyOn(component, 'isItemSelected');
      component.getTreatmentPlanProviders();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
      expect(component.isItemSelected).toHaveBeenCalled();
      expect(component.treatmentPlanProvidersArray.value.length).toEqual(3);
    });

    it('should call setCommonStructure, isItemSelected', () => {
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({ treatmentPlanProviders: new FormArray([]) });
      component.slideoutFilter.patientModelArray = mockPatientTabFilter2;
      component.activeGridData = { TreatmentProviders: [{ field: '1', key: '1', value: '1' }, { field: '2', key: '2', value: '2' }] };
      component.isFirstLoad = false;
      component.treatmentProviders = [{ field: '1', key: '1', value: '1' }, { field: '2', key: '2', value: '2' }];
      spyOn(component, 'isItemSelected');
      component.getTreatmentPlanProviders();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
      expect(component.isItemSelected).toHaveBeenCalled();
      expect(component.treatmentPlanProvidersArray.value.length).toEqual(3);
    });

  });

  describe('isItemSelected ->', () => {
    it('should return true', () => {
      component.activeGridData = { TreatmentProviders: ['1', '2', '123'] };
      const result = component.isItemSelected('TreatmentProviders', '123');
      expect(result).toEqual(true);
    });

    it('should return false', () => {
      component.activeGridData = { TreatmentProviders: [] };
      const result = component.isItemSelected('TreatmentProviders', '123');
      expect(result).toEqual(false);
    });
  });

  describe('setFilterData ->', () => {
    beforeEach(() => {
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        treatmentPlanStatus: new FormArray([]),
        treatmentPlanProviders: new FormArray([]),
        treatmentPlanCreatedDate: new FormArray([]),
        treatmentPlanName: new FormArray([])
      });
      component.getTreatmentPlanStatus();
    })
    it('should set PlanCreatedDateRange when filterHeader is SlideoutFilter.TreatmentPlanCreatedDate', () => {
      component.treatmentPlansRequest = { FilterCriteria: { PlanCreatedDateRange: [''] } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.TreatmentPlanCreatedDate });
      // formatted start and end dates
      const [formattedStartDate, formattedEndDate] = component.formatAndSetDateRange(['1']);
      expect(component.treatmentPlansRequest.FilterCriteria.PlanCreatedDateRange).toEqual([formattedStartDate, formattedEndDate]);
    });

    it('should set TreatmentPlanName when filterHeader is SlideoutFilter.TreatmentPlanName', () => {
      component.treatmentPlansRequest = { FilterCriteria: { TreatmentPlanName: [''] } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.TreatmentPlanName });
      expect(component.treatmentPlansRequest.FilterCriteria.TreatmentPlanName).toEqual(['1']);
    });

    it('should set IsActive when filterHeader is SlideoutFilter.IsActive ', () => {
      component.treatmentPlansRequest = { FilterCriteria: { IsActive: [''] } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.IsActive });
      expect(component.treatmentPlansRequest.FilterCriteria.IsActive).toEqual(['1']);
    });

    it('should set IsPatient when filterHeader is SlideoutFilter.IsPatient ', () => {
      component.treatmentPlansRequest = { FilterCriteria: { IsPatient: [''] } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.IsPatient });
      expect(component.treatmentPlansRequest.FilterCriteria.IsPatient).toEqual(['1']);
    });

    it('should set TreatmentProviders when filterHeader is SlideoutFilter.TreatmentProviders ', () => {
      component.treatmentPlansRequest = { FilterCriteria: { TreatmentProviders: [''] } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.TreatmentPlanProviders });
      expect(component.treatmentPlansRequest.FilterCriteria.TreatmentProviders).toEqual(['1']);
    });

    it('should set PreferredDentists when filterHeader is SlideoutFilter.PreferredDentists ', () => {
      component.treatmentPlansRequest = { FilterCriteria: { PreferredDentists: [''] } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.PreferredDentists });
      expect(component.treatmentPlansRequest.FilterCriteria.PreferredDentists).toEqual(['1']);
    });

    it('should set PreferredHygienists when filterHeader is SlideoutFilter.PreferredHygienists ', () => {
      component.treatmentPlansRequest = { FilterCriteria: { PreferredHygienists: [''] } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.PreferredHygienists });
      expect(component.treatmentPlansRequest.FilterCriteria.PreferredHygienists).toEqual(['1']);
    });

    it('should set AdditionalIdentifiers  when filterHeader is SlideoutFilter.AdditionalIdentifiers  ', () => {
      component.treatmentPlansRequest = { FilterCriteria: { AdditionalIdentifiers: [''] } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.AdditionalIdentifiers });
      expect(component.treatmentPlansRequest.FilterCriteria.AdditionalIdentifiers).toEqual(['1']);
    });

    it('should set GroupTypes  when filterHeader is SlideoutFilter.GroupTypes  ', () => {
      component.treatmentPlansRequest = { FilterCriteria: { GroupTypes: [''] } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.GroupTypes });
      expect(component.treatmentPlansRequest.FilterCriteria.GroupTypes).toEqual(['1']);
    });

    it('should return true for IsUnscheduled', () => {
      component.treatmentPlanStatusArray?.value?.map(element => element.isSelected = true);
      component.treatmentPlansRequest = { FilterCriteria: { IsUnscheduled: '' } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.IsUnscheduled });
      expect(component.treatmentPlansRequest.FilterCriteria.IsUnscheduled).toEqual('true');
    });

    it('should return false for IsUnscheduled', () => {
      component.treatmentPlanStatusArray?.value?.map(element => element.isSelected = false);
      component.treatmentPlansRequest = { FilterCriteria: { IsUnscheduled: '' } };
      component.setFilterData({ id: [""], filterHeader: SlideoutFilter.IsUnscheduled });
      expect(component.treatmentPlansRequest.FilterCriteria.IsUnscheduled).toEqual('false');
    });

    it('should return true for IsScheduled', () => {
      component.treatmentPlanStatusArray?.value?.map(element => element.isSelected = true);
      component.treatmentPlansRequest = { FilterCriteria: { IsScheduled: '' } };
      component.setFilterData({ id: ['true'], filterHeader: SlideoutFilter.IsScheduled });
      expect(component.treatmentPlansRequest.FilterCriteria.IsScheduled).toEqual('true');
    });

    it('should return false for IsScheduled', () => {
      component.treatmentPlanStatusArray?.value?.map(element => element.isSelected = false);
      component.treatmentPlansRequest = { FilterCriteria: { IsScheduled: '' } };
      component.setFilterData({ id: [], filterHeader: SlideoutFilter.IsScheduled });
      expect(component.treatmentPlansRequest.FilterCriteria.IsScheduled).toEqual('false');
    });

    it('should return true for IsProposed', () => {
      component.treatmentPlanStatusArray?.value?.map(element => element.isSelected = true);
      component.treatmentPlansRequest = { FilterCriteria: { IsProposed: '' } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.IsProposed });
      expect(component.treatmentPlansRequest.FilterCriteria.IsProposed).toEqual('true');
    });

    it('should return false for IsProposed', () => {
      component.treatmentPlanStatusArray?.value?.map(element => element.isSelected = false);
      component.treatmentPlansRequest = { FilterCriteria: { IsProposed: '' } };
      component.setFilterData({ id: [], filterHeader: SlideoutFilter.IsProposed });
      expect(component.treatmentPlansRequest.FilterCriteria.IsProposed).toEqual('false');
    });

    it('should return true for IsAccepted', () => {
      component.treatmentPlanStatusArray?.value?.map(element => element.isSelected = true);
      component.treatmentPlansRequest = { FilterCriteria: { IsAccepted: '' } };
      component.setFilterData({ id: ['1'], filterHeader: SlideoutFilter.IsAccepted });
      expect(component.treatmentPlansRequest.FilterCriteria.IsAccepted).toEqual('true');
    });

    it('should return false for IsAccepted', () => {
      component.treatmentPlanStatusArray?.value?.map(element => element.isSelected = false);
      component.treatmentPlansRequest = { FilterCriteria: { IsAccepted: '' } };
      component.setFilterData({ id: [], filterHeader: SlideoutFilter.IsAccepted });
      expect(component.treatmentPlansRequest.FilterCriteria.IsAccepted).toEqual('false');
    });
    
    it('should remove Patient/Non-Patients filter related properties from filter criteria when All option is checked', () => {
      component.treatmentPlansRequest = { FilterCriteria: { IsPatient: ['true', 'false'], IsActive: ['false','true'] } };  

      component.setFilterData({ id: [], filterHeader: SlideoutFilter.PatientTypeStatus});  

      expect(component.treatmentPlansRequest.FilterCriteria.IsActive).toBeUndefined();
      expect(component.treatmentPlansRequest.FilterCriteria.IsPatient).toBeUndefined();
    });
  });

  describe('formatAndSetDateRange', () => {
    it('should format and set date range correctly', () => {
      const dateStrings = ["1/2/2024", "1/2/2024"];
      const result = component.formatAndSetDateRange(dateStrings);
      expect(result.length).toBe(2);
      const formattedEndDate = result[1];
      expect(formattedEndDate.endsWith('23:59:59')).toBe(true);
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
