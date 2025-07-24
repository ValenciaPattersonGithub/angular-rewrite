import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllPatientSlideoutComponent } from './all-patient-slideout.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PatientFilterService } from '../../service/patient-filter.service';
import { PatientFliterCategory, PatientTabFilter } from '../../common/models/patient-grid-response.model';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SlideoutFilterComponent } from '../../common/components/slideout-filter/app-slideout-filter.component';
import { PatientAdditionalIdentifierService } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { AllPatientGridFilter } from '../../common/models/patient-grid-filter.model';
import { AllPatientRequest } from '../../common/models/patient-grid-request.model';
import { OrderByPipe } from 'src/@shared/pipes';
import { SlideoutFilter } from 'src/patient/common/models/enums/patient.enum';
import { BehaviorSubject, Observable } from 'rxjs';

const mockbirthMonths = [
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
]

const mockInsuranceFilters: PatientFliterCategory<string>[] = [
  { field: 'HasInsurance', value: '', key: 'All', isSelected: true },
  { field: 'HasInsurance', value: 'Yes', key: 'true', isSelected: false },
  { field: 'HasInsurance', value: 'No', key: 'false', isSelected: false },
];

const mockPreferredLocations: PatientFliterCategory<string>[] = [
  {
    field: 'PreferredLocations',
    value: 'all',
    key: 'All',
    isVisible: true,
    isSelected: true
  },
];

const mockPatientTabFilter: PatientTabFilter[] = [{
  dataTarget: "1",
  divClassId: "123",
  divUlId: "123",
  filterText: "filtrText",
  filter: [],
  formArray: null,
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false
}];

const mockPatientTabFilter2: PatientTabFilter[] = [{
  dataTarget: "11",
  divClassId: "123",
  divUlId: "123",
  filterText: "filtrText",
  filter: [],
  formArray: null,
  formControls: null,
  liFormArrayName: "123",
  isExpanded: false
}];

const mockPreventiveCareStates: PatientFliterCategory<string>[] = [
  { field: 'IsNoDueDate', value: 'all', key: 'All', isSelected: true },
  { field: 'IsNoDueDate', value: 'No Due Date', key: 'true', isSelected: true },
  { field: 'PreventiveCareIsScheduled', value: '1', key: 'true', isSelected: true },
  { field: 'PreventiveCareIsScheduled', value: '2', key: 'false', isSelected: true },
];

const mockReminderStatus: PatientFliterCategory<string>[] = [
  { field: 'ReminderStatus', value: 'all', key: 'All', isSelected: true },
  { field: 'ReminderStatus', value: 'none', key: null, isSelected: true },
  { field: 'ReminderStatus', value: 'Confirmed', key: '2', isSelected: true },
  { field: 'ReminderStatus', value: 'Reminder Sent', key: '1', isSelected: true },
  { field: 'ReminderStatus', value: 'Unconfirmed', key: '0', isSelected: true },
];

const mockTreatmentPlanStates: PatientFliterCategory<string>[] = [
  { field: 'TreatmentPlanStates', value: 'all', key: 'All', isSelected: true },
  { field: 'TreatmentPlanStates', value: 'none', key: null, isSelected: true },
  { field: 'TreatmentPlanStates', value: 'true', key: 'true', isSelected: true },
  { field: 'TreatmentPlanStates', value: 'false', key: 'false', isSelected: true },
];

const mockZipCodes: PatientFliterCategory<string>[] = [
  {
    field: 'ZipCodes',
    value: 'all',
    key: '',
    isVisible: true,
    isSelected: true,
  },
  {
    field: 'ZipCodes',
    value: 'ZipCode 1',
    key: '1',
    isVisible: true,
    isSelected: true,
  }
];

const mockGroupTypes: PatientFliterCategory<string>[] = [
  {
    field: 'GroupTypes',
    value: 'all',
    key: '',
    isVisible: true,
    isSelected: true,
  }
];

const mockPreferredDentist: PatientFliterCategory<string>[] = [
  {
    field: 'PreferredDentist',
    value: 'all',
    key: '',
    isVisible: true,
    isSelected: true,
  }
];

const mockPreferredHygeniest: PatientFliterCategory<string>[] = [
  {
    field: 'PreferredHygeniest',
    value: 'all',
    key: '',
    isVisible: true,
    isSelected: true,
  }
];

const mockPatientAdditionalIdentifierService = {
  save: jasmine.createSpy(),
  update: jasmine.createSpy(),
  get: jasmine.createSpy(),
  additionalIdentifiersWithPatients: jasmine.createSpy()
}

const mockPatientFilterService = {
  isApplyFilters: false,
  birthMonths: mockbirthMonths,
  insuranceFilters: mockInsuranceFilters,
  preferredLocations: mockPreferredLocations,
  preventiveCareStates: mockPreventiveCareStates,
  reminderStatus: mockReminderStatus,
  treatmentPlanStates: mockTreatmentPlanStates,
  setCommonStructure: jasmine.createSpy().and.returnValue(mockPatientTabFilter[0]),
  setLocationZipCodes: jasmine.createSpy().and.returnValue(mockZipCodes),
  setDefaultGroupTypes: jasmine.createSpy().and.returnValue(mockGroupTypes),
  setDefaultPreferredDentist: jasmine.createSpy().and.returnValue(mockPreferredDentist),
  setDefaultPreferredHygienst: jasmine.createSpy().and.returnValue(mockPreferredHygeniest),
  broadcastSelectedCount: jasmine.createSpy(),
  initializeDefaultFilters: jasmine.createSpy().and.returnValue(new AllPatientRequest()),
  patientModelStatus: new BehaviorSubject<[]>(null) as Observable<[]>
}

const mockToastrFactory = {
  success: jasmine.createSpy('toastrFactory.success'),
  error: jasmine.createSpy('toastrFactory.error')
};

describe('AllPatientSlideoutComponent', () => {
  let component: AllPatientSlideoutComponent;
  let fixture: ComponentFixture<AllPatientSlideoutComponent>;
  let slideoutFilterComponent: SlideoutFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AllPatientSlideoutComponent
      ],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: PatientAdditionalIdentifierService, useValue: mockPatientAdditionalIdentifierService },
        { provide: PatientFilterService, useValue: mockPatientFilterService },
        FormBuilder, TranslateService
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllPatientSlideoutComponent);
    component = fixture.componentInstance;

    const fixtureSlideoutFilterComponent = TestBed.createComponent(SlideoutFilterComponent);
    slideoutFilterComponent = fixtureSlideoutFilterComponent.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit ->', () => {
    it('should get data on ngAfterViewInit', () => {
      const orderPipe = new OrderByPipe();
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientModelArray = mockPatientTabFilter;
      component.allPatientsRequest = new AllPatientRequest();
      component.allPatientsRequest.FilterCriteria = new AllPatientGridFilter();

      spyOn(orderPipe, 'transform').and.returnValue(component.slideoutFilter.patientModelArray);
      spyOn(component.subscriptions, 'push');
      spyOn(component, 'getBirthMonths');
      spyOn(component, 'getInsurance');
      spyOn(component, 'getPreventiveCare');
      spyOn(component, 'getReminderStatus');
      spyOn(component, 'getTreatmentPlans');

      component.ngAfterViewInit();
      expect(component.getBirthMonths).toHaveBeenCalled();
      expect(component.getInsurance).toHaveBeenCalled();
      expect(component.getPreventiveCare).toHaveBeenCalled();
      expect(component.getReminderStatus).toHaveBeenCalled();
      expect(component.getTreatmentPlans).toHaveBeenCalled();
      expect(component.subscriptions.push).toHaveBeenCalled();
    });

  });

  describe('ngOnDestroy ->', () => {
    it('should unsubscribe from all subscriptions', () => {
      const mockSubscription1 = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      const mockSubscription2 = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      component.subscriptions = [mockSubscription1, mockSubscription2];
    
      component.ngOnDestroy();
    
      expect(mockSubscription1.unsubscribe).toHaveBeenCalled();
      expect(mockSubscription2.unsubscribe).toHaveBeenCalled();
    });
  })

  describe('ngOnChanges ->', () => {
    beforeEach(() => {
      component.slideoutFilter = slideoutFilterComponent;
    })
    it('should get preferred location and zip codes on changes', () => {
      spyOn(component, 'getPreferredLocation');
      spyOn(component, 'getZipCodes');
      component.activeGridData = {
        PreferredLocations: ['Location 1', 'Location 2'],
        PatientLocationZipCodes: ['ZipCode 1', 'ZipCode 2']
      };
      component.ngOnChanges();
      expect(component.getPreferredLocation).toHaveBeenCalled();
      expect(component.getZipCodes).toHaveBeenCalled();
    });

    it('should not get preferred location and zip codes if activeGridData is not set', () => {
      spyOn(component, 'getPreferredLocation');
      spyOn(component, 'getZipCodes');
      component.activeGridData = null;
      component.ngOnChanges();
      expect(component.getPreferredLocation).not.toHaveBeenCalled();
      expect(component.getZipCodes).not.toHaveBeenCalled();
    });

  });

  describe('getBirthMonths ->', () => {
    it('should get birth months', () => {
        const mockControl = new FormControl({ field: SlideoutFilter.BirthMonths, isSelected: true, isVisible: true, key: "", value: "" });
        
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        birthMonths: new FormArray([mockControl])
      });
  
      component.getBirthMonths();
      
      expect(component.birthMonths?.length).toBe(14);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('birthMonths', 'birthMonths', 'BirthMonths', 'Birthday Month',
      component.birthMonthsArray, component.birthMonths);
      expect(component.slideoutFilter.patientModelArray[0]).toEqual(mockPatientTabFilter[0]);
    });  
  })

  describe('getInsurance ->', () => {
    it('should get insurance', () => {
      const mockControl = new FormControl({ field: SlideoutFilter.Insurance, isSelected: true, isVisible: true, key: "", value: "" });
      
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        insurance: new FormArray([mockControl])
      });
  
      component.getInsurance();
  
      expect(component.insurance?.length).toEqual(3);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('hasInsuranceDiv', 'hasInsuranceDiv', 'InsuranceFilter', 'Insurance',
      component.insuranceArray, component.insurance);
      expect(component.insuranceArray.controls[0]).toEqual(mockControl);
      expect(component.slideoutFilter.patientModelArray[0]).toEqual(mockPatientTabFilter[0]);
    });  
  })

  describe('isItemSelected  -> ', () => {
    it('should return true if item is selected', () => {
      component.activeGridData = {
        PreferredLocations: ['Location 1', 'Location 2'],
        PatientLocationZipCodes: ['ZipCode 1', 'ZipCode 2']
      };
      const response = component.isItemSelected('PreferredLocations', 'Location 1');
      expect(response).toEqual(true);

      const response2 = component.isItemSelected('PatientLocationZipCodes', 'ZipCode 2');
      expect(response2).toEqual(true);
    });

    it('should return false if item is not selected', () => {
      component.activeGridData = {
        PreferredLocations: ['Location 1', 'Location 2'],
        PatientLocationZipCodes: ['ZipCode 1', 'ZipCode 2']
      };

      const response = component.isItemSelected('PreferredLocations', 'Location 3');
      expect(response).toEqual(false);

      const response2 = component.isItemSelected('PatientLocationZipCodes', 'ZipCode 3');
      expect(response2).toEqual(false);

    });
  });

  describe('getZipCodes ->', () => {

    it('should get zip codes', () => {
      const mockControl = new FormControl({ field: SlideoutFilter.ZipCodes, isSelected: true, isVisible: true, key: "", value: "" });
      const mockPatientFilterCategory = new Array<PatientFliterCategory<string>>();
      
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        zipCodes: new FormArray([])
      });
      component.zipCodesArray.push(mockControl);
      component.zipCodes = mockPatientFilterCategory;
      component.slideoutFilter.patientModelArray = mockPatientTabFilter;            
      component.activeGridData = {
        PatientLocationZipCodes: [
          { Value: 'ZipCode 1', Key: '1' },
          { Value: 'ZipCode 3', Key: '3' }
        ]
      };

      spyOn(component.zipCodesArray, 'clear');
      spyOn(component.zipCodesArray, 'push');

      component.getZipCodes();

      expect(component.zipCodesArray.clear).toHaveBeenCalled();
      expect(component.zipCodesArray.push).toHaveBeenCalledTimes(5);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('zipCodes', 'zipCodes', 'ZipCodes', 'Zip Codes',
        component.zipCodesArray, component.zipCodes);
    });

    it('should get zip codes when patientModelArray and zipCodes does not have matching records', () => {      
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        zipCodes: new FormArray([])
      });
      
      spyOn(component.zipCodesArray, 'clear');
      spyOn(component.zipCodesArray, 'push');
      
      component.getZipCodes();
      expect(component.zipCodesArray.clear).toHaveBeenCalled();
      expect(component.zipCodesArray.push).toHaveBeenCalledTimes(5);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('zipCodes', 'zipCodes', 'ZipCodes', 'Zip Codes',
        component.zipCodesArray, component.zipCodes);
      });

    it('should get zip codes, when patientModelArray exists', () => {
      component.zipCodes = [];

      component.activeGridData = {
        PatientLocationZipCodes: [
          { Value: 'ZipCode 1', Key: '1' },
          { Value: 'ZipCode 3', Key: '3' }
        ]
      };

      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        zipCodes: new FormArray([])
      });

      component.slideoutFilter.patientModelArray = mockPatientTabFilter;

      spyOn(component.zipCodesArray, 'clear');
      spyOn(component.zipCodesArray, 'push');

      component.getZipCodes();
      expect(component.zipCodesArray.clear).toHaveBeenCalled();
      expect(component.zipCodesArray.push).toHaveBeenCalledTimes(7);
    });
    it('should not modify zipcodesArray or zipcodesArray when isApplyFilters is true', () => {
      mockPatientFilterService.isApplyFilters = true;
      component.zipCodes = [];
      const initialzipCodesArray = component.zipCodesArray?.value;
    
      component.getZipCodes();
    
      expect(component.zipCodes).toEqual([]);
      expect(component.zipCodesArray?.value).toEqual(initialzipCodesArray);
    });

  });

  describe('getPreferredLocation ->', () => {
    it('should get preferred location', () => {
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        zipCodes: new FormArray([]),
        preferredLocation: new FormArray([])
      });

      component.slideoutFilter.patientModelArray = mockPatientTabFilter;

      component.activeGridData = {
        PreferredLocation: [
          { Value: 'Location 1', Key: '1' },
          { Value: 'Location 3', Key: '3' }
        ]
      };
      component.getPreferredLocation();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('prefferedLocDiv', 'prefferedLocDiv', 'PreferredLocations', 'Preferred Location',
        component.preferredLocationArray, component.preferredLocation);
      expect(component.slideoutFilter.patientModelArray.length).toEqual(1);
    });

    it('should get preferred location when dataTarget not matched', () => {
      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        zipCodes: new FormArray([]),
        preferredLocation: new FormArray([])
      });

      component.slideoutFilter.patientModelArray = mockPatientTabFilter2;

      component.activeGridData = {
        PreferredLocation: [
          { Value: 'Location 1', Key: '1' },
          { Value: 'Location 3', Key: '3' }
        ]
      };
      component.getPreferredLocation();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('prefferedLocDiv', 'prefferedLocDiv', 'PreferredLocations', 'Preferred Location',
        component.preferredLocationArray, component.preferredLocation);
      expect(component.slideoutFilter.patientModelArray.length).toEqual(2);
    });
    it('should not modify preferredLocation or preferredLocationArray when isApplyFilters is true', () => {
      mockPatientFilterService.isApplyFilters = true;
      component.preferredLocation = [];
      const initialPreferredLocationArray = component.preferredLocationArray?.value;
    
      component.getPreferredLocation();
    
      expect(component.preferredLocation).toEqual([]);
      expect(component.preferredLocationArray?.value).toEqual(initialPreferredLocationArray);
    });
  });

  describe('getPreventiveCare', () => {
    it('should push preventive care grid filteration data in patient model array',() => {
      const mockControl = new FormControl({ field: SlideoutFilter.IsNoDueDate, isSelected: true, isVisible: true, key: "", value: "" });

      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        preventiveCare: new FormArray([mockControl])
      });

      component.getPreventiveCare();

      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('preventiveCareStateDiv', 'preventiveCareStateDiv', 'PreventiveCare', 'Preventive Care',
      component.preventiveCareArray, component.preventiveCare);
      expect(component.slideoutFilter.patientModelArray[0]).toEqual(mockPatientTabFilter[0])
    })
  })  
  
  describe('getReminderStatus', () => {
    it('should push reminder status grid filteration data in patient model array',() => {
      const mockFormControl = new FormControl({ field: SlideoutFilter.ReminderStatus, isSelected: true, isVisible: true, key: "", value: "" });

      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        reminderStatus: new FormArray([mockFormControl])
      });

      component.getReminderStatus();

      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('reminderStatusDiv', 'reminderStatusDiv', 'ReminderStatus', 'Reminder Status', component.reminderStatusArray, component.reminderStatus);
      expect(component.slideoutFilter.patientModelArray[0]).toEqual(mockPatientTabFilter[0])
    })
  })

  describe('getTreatmentPlans', () => {
    it('should push Treatment States grid filteration data in patient model array',() => {
      const mockFormControl = new FormControl({ field: SlideoutFilter.TreatmentPlanStates, isSelected: true, isVisible: true, key: "", value: "" });

      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        treatmentPlans: new FormArray([mockFormControl])
      });

      component.getTreatmentPlans();

      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('treatmentPlanStatesDiv', 'treatmentPlanStatesDiv', 'TreatmentPlanStates', 'Treatment Plans',
      component.treatmentPlansArray, component.treatmentPlans);
      expect(component.slideoutFilter.patientModelArray[0]).toEqual(mockPatientTabFilter[0])
    })
  })


  describe('setFilterData ->', () => {
    it('should set filter data', () => {    
      component.allPatientsRequest = new AllPatientRequest();
      component.allPatientsRequest.FilterCriteria = new AllPatientGridFilter();  
      component.setFilterData({ id: [], filterHeader: 'BusinessDays' });
      component.setFilterData({ id: [], filterHeader: 'AdditionalIdentifiers' });
      component.setFilterData({ id: [], filterHeader: 'IsScheduled' });
      component.setFilterData({ id: [], filterHeader: 'AppointmentStatusList' });
      component.setFilterData({ id: [], filterHeader: 'BirthMonths' });
      component.setFilterData({ id: [], filterHeader: 'GroupTypes' });
      component.setFilterData({ id: [], filterHeader: 'HasInsurance' });
      component.setFilterData({ id: [], filterHeader: 'IsActive' });
      component.setFilterData({ id: [], filterHeader: 'IsPatient' });
      component.setFilterData({ id: [], filterHeader: 'PreferredDentists' });
      component.setFilterData({ id: [], filterHeader: 'PreferredHygienists' });
      component.setFilterData({ id: [], filterHeader: 'PreferredLocations' });
      component.setFilterData({ id: [], filterHeader: 'IsNoDueDate' });
      component.setFilterData({ id: [], filterHeader: 'PreventiveCareIsScheduled' });
      component.setFilterData({ id: [], filterHeader: 'ReminderStatus' });
      component.setFilterData({ id: [], filterHeader: 'TreatmentPlanStates' });
      component.setFilterData({ id: [], filterHeader: 'ZipCodes' });
      expect(component.allPatientsRequest.FilterCriteria.BusinessDays).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.AdditionalIdentifiers).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.BirthMonths).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.GroupTypes).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.HasInsurance).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.IsActive).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.IsPatient).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.PreferredDentists).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.PreferredHygienists).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.PreferredLocation).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.IsNoDueDate).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.PreventiveCareIsScheduled).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.ReminderStatus).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.TreatmentPlanStates).toEqual([]);
      expect(component.allPatientsRequest.FilterCriteria.ZipCodes).toEqual([]);
    });
    
    it('should set filter data for appointment', () => {
      component.allPatientsRequest = { FilterCriteria: { IsScheduled: ['true', 'false'], AppointmentStatusList: ['3'] } };    
      component.setFilterData({ id: [], filterHeader: 'AppointmentStatusList' });    
      expect(component.allPatientsRequest.FilterCriteria.IsScheduled).toEqual(['true', 'false']);
      expect(component.allPatientsRequest.FilterCriteria.AppointmentStatusList).toEqual(['3']);
    });
    
    it('should remove Patient/Non-Patients filter related properties from filter criteria when All option is checked', () => {
      component.allPatientsRequest = { FilterCriteria: { IsPatient: ['true', 'false'], IsActive: ['false','true'] } };  

      component.setFilterData({ id: [], filterHeader: SlideoutFilter.PatientTypeStatus});  

      expect(component.allPatientsRequest.FilterCriteria.IsActive).toBeUndefined();
      expect(component.allPatientsRequest.FilterCriteria.IsPatient).toBeUndefined();
    });
  });
});
