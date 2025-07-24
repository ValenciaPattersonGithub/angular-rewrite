import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PreventiveCareSlideoutComponent } from './preventive-care-slideout.component';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PatientFilterService } from 'src/patient/service/patient-filter.service';
import { PatientTabFilter } from 'src/patient/common/models/patient-grid-response.model';
import { SlideoutFilterComponent } from 'src/patient/common/components/slideout-filter/app-slideout-filter.component';
import { PatientAdditionalIdentifierService } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { SlideoutFilter } from 'src/patient/common/models/enums/patient.enum';
import { Subscription } from 'rxjs';

describe('PreventiveCareSlideoutComponent', () => {
  let component: PreventiveCareSlideoutComponent;
  let fixture: ComponentFixture<PreventiveCareSlideoutComponent>;
  let slideoutFilterComponent: SlideoutFilterComponent;

  const mockPatientTabFilter: PatientTabFilter[] = [{
    dataTarget: "1",
    divClassId: "123",
    divUlId: "123",
    filterText: "filtrText",
    filter: [],
    formArray: null,
    formControls: null,
    liFormArrayName: "123"
  }];

  const mockPatientTabFilter2: PatientTabFilter[] = [{
    dataTarget: "11",
    divClassId: "123",
    divUlId: "123",
    filterText: "filtrText",
    filter: [],
    formArray: null,
    formControls: null,
    liFormArrayName: "123"  
  }];

  const mockPatientFilterService = {
    setCommonStructure: jasmine.createSpy().and.returnValue(mockPatientTabFilter[0]),
    setLocationZipCodes: jasmine.createSpy(),
    setDefaultGroupTypes: jasmine.createSpy(),
    setDefaultPreferredDentist: jasmine.createSpy(),
    setDefaultPreferredHygienst: jasmine.createSpy(),
    broadcastSelectedCount: jasmine.createSpy(),
    setAdditionalIdentifiers: jasmine.createSpy(),
    setDefaultAdditionalIdentifiers: jasmine.createSpy(),
    setSelectedFilter: jasmine.createSpy(),
    initializeDefaultPreventiveCareFilters: jasmine.createSpy('initializeDefaultPreventiveCareFilters'),
  
    appointmentDates: [
      { field: 'BusinessDays', value: 'All', key: 'All', isSelected: true },
      { field: 'BusinessDays', value: 'Next Business Day', key: '1', isSelected: false },
      { field: 'BusinessDays', value: 'Next 7 Days', key: '2', isSelected: false },
    ],
  
    appointmentStates: [
      { field: '', value: 'All', key: 'All' },
      { field: 'AppointmentStatusList', value: 'Completed', key: '3' },
      { field: 'IsScheduled', value: 'Scheduled', key: 'true' },
      { field: 'IsScheduled', value: 'UnScheduled', key: 'false' },
    ],
  
    groupTypes: [
      {
        field: 'GroupTypes',
        value: 'All',
        key: 'All',
        isVisible: true,
        isSelected: true
      },
      {
        field: 'GroupTypes',
        value: 'N/A',
        key: '00000000-0000-0000-0000-000000000000',
        isVisible: true,
        isSelected: true
      },
    ],
  
    patientTypes: [
      { field: '', value: 'All', key: 'false', isSelected: false },
      { field: 'IsActive', value: 'Active', key: 'true', isSelected: true },
      { field: 'IsActive', value: 'Inactive', key: 'false', isSelected: false },
      { field: 'IsPatient', value: 'Non-Patients', key: 'false', isSelected: false },
      { field: 'IsPatient', value: 'Patients', key: 'true', isSelected: true },
    ],
  
    preferredDentists: [
      {
        field: 'PreferredDentists',
        value: 'All',
        key: 'All',
        isVisible: true,
        isSelected: true,
      },
      {
        field: 'PreferredDentists',
        value: 'NA',
        key: '00000000-0000-0000-0000-000000000000',
        isVisible: true,
        isSelected: true
      },
    ],
  
    preferredHygienst: [
      {
        field: 'PreferredHygienists',
        value: 'All',
        key: 'All',
        isVisible: true,
        isSelected: true,
      },
      {
        field: 'PreferredHygienists',
        value: 'NA',
        key: '00000000-0000-0000-0000-000000000000',
        isVisible: true,
        isSelected: true
      },
    ],
  
    additionalIdentifiers: [
      {
        field: 'AdditionalIdentifiers',
        value: 'All',
        key: 'All',
        isVisible: true,
        isSelected: true
      },
      {
        field: 'AdditionalIdentifiers',
        value: 'NA',
        key: '00000000-0000-0000-0000-000000000000',
        isVisible: true,
        isSelected: true
      }
    ],
  
    treatmentPlanName: [
      { field: 'TreatmentPlanName', value: '', key: 'All', isSelected: true },
      { field: 'TreatmentPlanName', value: '', key: 'Equal To', isSelected: true },
      { field: 'TreatmentPlanName', value: '', key: 'Contains', isSelected: true }
    ],

    preventiveIsScheduled: [
      { field: 'PreventiveCareIsScheduled', value: 'All', key: 'All', isVisible: true, isSelected: true },
      { field: 'PreventiveCareIsScheduled', value: 'Yes', key: 'true', isVisible: true, isSelected: true },
      { field: 'PreventiveCareIsScheduled', value: 'No', key: 'false', isVisible: true, isSelected: true }
    ],
  
    pastDue: [
      { field: 'PastDue', value: 'All', key: 'All', isSelected: false },
      { field: 'DueLess30', value: '< 30 Days', key: 'true', isSelected: false },
      { field: 'Due30', value: '30-59 Days', key: 'true', isSelected: false },
      { field: 'Due60', value: '60-89 Days', key: 'true', isSelected: false },
      { field: 'DueOver90', value: '> 90 Days', key: 'true', isSelected: false }
    ]
  }

  const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };

  const mockPatientAdditionalIdentifierService = {
    save: jasmine.createSpy(),
    update: jasmine.createSpy(),
    get: jasmine.createSpy(),
    additionalIdentifiersWithPatients: jasmine.createSpy()
  };

  const mockPreventiveCareRequest = {
    CurrentPage: 0,
    FilterCriteria: {
      LocationId: 6606192,
      PatientName: "",
      PatientDateOfBirthFrom: null,
      PatientDateOfBirthTo: null,
      LastCommunicationFrom: null,
      LastCommunicationTo: null,
      NextAppointmentDateFrom: null,
      NextAppointmentDateTo: null,
      PreventiveCareDueDateFrom: null,
      PreventiveCareDueDateTo: null,
      PreviousAppointmentDateFrom: null,
      PreviousAppointmentDateTo: null,
      ResponsiblePartyName: "",
      TreatmentPlanCountTotalFrom: 0,
      TreatmentPlanCountTotalTo: 0,
      AdditionalIdentifiers: null,
      Due30: 'false',
      Due60: 'false',
      DueInFuture: 'false',
      DueLess30: 'false',
      DueOver90: 'false',
      GroupTypes: null,
      HasUnreadCommunication: false,
      IsActive: ['true'],
      IsPatient: ['true'],
      PreferredDentists: null,
      PreferredHygienists: null,
      PreventiveCareIsScheduled: null,
    },
    GroupTypes: [],
    PageCount: 50,
    SortCriteria: {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[TranslateModule.forRoot(), ReactiveFormsModule],
      declarations: [ PreventiveCareSlideoutComponent ],
      providers: [
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: PatientAdditionalIdentifierService, useValue: mockPatientAdditionalIdentifierService },
        { provide: PatientFilterService, useValue: mockPatientFilterService },
        TranslateService,FormBuilder
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreventiveCareSlideoutComponent);
    component = fixture.componentInstance;
    const fixtureSlideoutFilterComponent = TestBed.createComponent(SlideoutFilterComponent);
    slideoutFilterComponent = fixtureSlideoutFilterComponent.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit ->', () => {
    it('should call createForm, getSectionData when ngAfterViewInit is called', () => {
      spyOn(component, 'createForm');
      spyOn(component, 'getSectionData');
      component.ngAfterViewInit();
      expect(component.createForm).toHaveBeenCalled();
      expect(component.getSectionData).toHaveBeenCalled();
    });
  });
  
  describe('getSectionData ->', () => {
    beforeEach(() => {
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm =  new FormGroup({
        pastDue: new FormArray([]),
        preventiveCareIsScheduled: new FormArray([])
      });
    });
   
    it('should initialize default properties and subscribe to patientModelStatus', () => {
      spyOn(component, 'initializeDefaultPropeties');
      spyOn(component, 'getPastDue').and.callThrough();
      spyOn(component, 'getPreventiveCareIsScheduled').and.callThrough();  
      component.getSectionData();  
      expect(component.initializeDefaultPropeties).toHaveBeenCalled();         
      expect(component.getPastDue).toHaveBeenCalled();
      expect(component.getPreventiveCareIsScheduled).toHaveBeenCalled();
    });
  });

  describe('getPastDue ->', () => {
    it('should get past dues', () => {
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        pastDue: new FormArray([]),
        preventiveCareIsScheduled: new FormArray([])
      });

      component.slideoutFilter.patientModelArray = mockPatientTabFilter;

      component.activeGridData = mockPatientFilterService.pastDue
      component.getPastDue();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('pastDueDiv', 'pastDueDiv', 'PastDue', 'Past Due',
        component.pastDueForm, component.pastDue);
      expect(component.slideoutFilter.patientModelArray.length).toEqual(1);
    });

    it('should get past due when dataTarget not matched', () => {
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        pastDue: new FormArray([]),
        preventiveCareIsScheduled: new FormArray([])
      });

      component.slideoutFilter.patientModelArray = mockPatientTabFilter2;

      component.activeGridData = mockPatientFilterService.pastDue;
      component.getPastDue();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('pastDueDiv', 'pastDueDiv', 'PastDue', 'Past Due',
        component.pastDueForm, component.pastDue);
      expect(component.slideoutFilter.patientModelArray.length).toEqual(2);
    });
  });

  describe('getPreventiveCareIsScheduled ->', () => {
    it('should get PreventiveCareIsScheduled', () => {
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        pastDue: new FormArray([]),
        preventiveCareIsScheduled: new FormArray([])
      });

      component.slideoutFilter.patientModelArray = mockPatientTabFilter;

      component.activeGridData = mockPatientFilterService.preventiveIsScheduled;
      component.getPreventiveCareIsScheduled();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('preventiveIsScheduledDiv', 'preventiveIsScheduledDiv', SlideoutFilter.PreventiveIsScheduled, 'Preventive Appt Scheduled',
        component.preventiveCareIsScheduledForm, component.preventiveCareIsScheduled);
      expect(component.slideoutFilter.patientModelArray.length).toEqual(1);
    });

    it('should get preferred location when dataTarget not matched', () => {
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        pastDue: new FormArray([]),
        preventiveCareIsScheduled: new FormArray([])
      });

      component.slideoutFilter.patientModelArray = mockPatientTabFilter2;

      component.activeGridData = mockPatientFilterService.preventiveIsScheduled;
      component.getPreventiveCareIsScheduled();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('preventiveIsScheduledDiv', 'preventiveIsScheduledDiv', SlideoutFilter.PreventiveIsScheduled, 'Preventive Appt Scheduled',
        component.preventiveCareIsScheduledForm, component.preventiveCareIsScheduled);
      expect(component.slideoutFilter.patientModelArray.length).toEqual(2);
    });
  });


  describe('setFilterData ->', () => {
    it('should set filter data for AdditionalIdentifiers', () => {
      const selectedId = 'exampleId';
      const filterHeader = SlideoutFilter.AdditionalIdentifiers;  
      component.initializeDefaultPropeties();
      component.preventiveCareRequest = mockPreventiveCareRequest;
      component.setFilterData({ id: selectedId, filterHeader });      
      expect(component.preventiveCareRequest.FilterCriteria.AdditionalIdentifiers).toBe(selectedId);
    });
    it('should set filter data for grouptypes', () => {
      const selectedId = 'exampleId';
      const filterHeader = SlideoutFilter.GroupTypes;  
      component.initializeDefaultPropeties();
      component.preventiveCareRequest = mockPreventiveCareRequest;
      component.setFilterData({ id: selectedId, filterHeader });      
      expect(component.preventiveCareRequest.FilterCriteria.GroupTypes).toBe(selectedId);
    });
    it('should set filter data for isActive', () => {
      const selectedId = 'true';
      const filterHeader = SlideoutFilter.IsActive;  
      component.initializeDefaultPropeties();
      component.preventiveCareRequest = mockPreventiveCareRequest;
      component.setFilterData({ id: selectedId, filterHeader });      
      expect(component.preventiveCareRequest.FilterCriteria.IsActive).toBe(selectedId);
    });
    it('should set filter data for isPatient', () => {
      const selectedId = 'true';
      const filterHeader = SlideoutFilter.IsPatient;  
      component.initializeDefaultPropeties();
      component.preventiveCareRequest = mockPreventiveCareRequest;
      component.setFilterData({ id: selectedId, filterHeader });      
      expect(component.preventiveCareRequest.FilterCriteria.IsPatient).toBe(selectedId);
    });
    it('should set filter data for PreferredDentists', () => {
      const selectedId = 'dentist';
      const filterHeader = SlideoutFilter.PreferredDentists;  
      component.initializeDefaultPropeties();
      component.preventiveCareRequest = mockPreventiveCareRequest;
      component.setFilterData({ id: selectedId, filterHeader });      
      expect(component.preventiveCareRequest.FilterCriteria.PreferredDentists).toBe(selectedId);
    });
    it('should set filter data for PreferredHygienists', () => {
      const selectedId = 'hygienist';
      const filterHeader = SlideoutFilter.PreferredHygienists;  
      component.initializeDefaultPropeties();
      component.preventiveCareRequest = mockPreventiveCareRequest;
      component.setFilterData({ id: selectedId, filterHeader });      
      expect(component.preventiveCareRequest.FilterCriteria.PreferredHygienists).toBe(selectedId);
    });
    it('should set filter data for PreventiveIsScheduled', () => {
      const selectedId = [];
      const filterHeader = SlideoutFilter.PreventiveCareIsScheduled;  
      component.initializeDefaultPropeties();
      component.preventiveCareRequest = mockPreventiveCareRequest;
      component.setFilterData({ id: selectedId, filterHeader });      
      expect(component.preventiveCareRequest.FilterCriteria.PreventiveCareIsScheduled).toBe(selectedId);
    });
    it('should set filter data for DueLess30 from pastDueForm', () => {
      const mockPastDueForm = { value: [{ field: SlideoutFilter.DueLess30, isSelected: true }] };
      spyOnProperty(component, 'pastDueForm', 'get').and.returnValue(mockPastDueForm);  
      component.initializeDefaultPropeties();
      component.preventiveCareRequest = mockPreventiveCareRequest;  
      component.setFilterData({ id: 'true', filterHeader: SlideoutFilter.DueLess30 });  
      expect(component.preventiveCareRequest.FilterCriteria.DueLess30).toBe('true');
    });
    it('should set filter data for Due30 from pastDueForm', () => {
      const mockPastDueForm = { value: [{ field: SlideoutFilter.Due30, isSelected: true }] };
      spyOnProperty(component, 'pastDueForm', 'get').and.returnValue(mockPastDueForm);  
      component.initializeDefaultPropeties();
      component.preventiveCareRequest = mockPreventiveCareRequest;  
      component.setFilterData({ id: 'true', filterHeader: SlideoutFilter.Due30 });  
      expect(component.preventiveCareRequest.FilterCriteria.Due30).toBe('true');
    });
    it('should set filter data for Due60 from pastDueForm', () => {
      const mockPastDueForm = { value: [{ field: SlideoutFilter.Due60, isSelected: true }] };
      spyOnProperty(component, 'pastDueForm', 'get').and.returnValue(mockPastDueForm);  
      component.initializeDefaultPropeties();
      component.preventiveCareRequest = mockPreventiveCareRequest;  
      component.setFilterData({ id: 'true', filterHeader: SlideoutFilter.Due60 });  
      expect(component.preventiveCareRequest.FilterCriteria.Due60).toBe('true');
    });
    it('should set filter data for Dueover90 from pastDueForm', () => {
      const mockPastDueForm = { value: [{ field: SlideoutFilter.DueOver90, isSelected: true }] };
      spyOnProperty(component, 'pastDueForm', 'get').and.returnValue(mockPastDueForm);  
      component.initializeDefaultPropeties();
      component.preventiveCareRequest = mockPreventiveCareRequest;  
      component.setFilterData({ id: 'true', filterHeader: SlideoutFilter.DueOver90 });  
      expect(component.preventiveCareRequest.FilterCriteria.DueOver90).toBe('true');
    });
    
    it('should remove Patient/Non-Patients filter related properties from filter criteria when All option is checked', () => {
      component.preventiveCareRequest = { FilterCriteria: { IsPatient: ['true', 'false'], IsActive: ['false','true'] } };  

      component.setFilterData({ id: [], filterHeader: SlideoutFilter.PatientTypeStatus});  

      expect(component.preventiveCareRequest.FilterCriteria.IsActive).toBeUndefined();
      expect(component.preventiveCareRequest.FilterCriteria.IsPatient).toBeUndefined();
    });
  });

  describe('ngOnDestroy -> ', () => {
    it('should unsubscribe from subscriptions on ngOnDestroy', () => {
      const mockSubscription1 = new Subscription();
      const mockSubscription2 = new Subscription();  
      spyOn(mockSubscription1, 'unsubscribe');
      spyOn(mockSubscription2, 'unsubscribe');
      component.subscriptions = [mockSubscription1, mockSubscription2];
      component.ngOnDestroy();
      expect(mockSubscription1.unsubscribe).toHaveBeenCalled();
      expect(mockSubscription2.unsubscribe).toHaveBeenCalled();
    });

  });
 
});
