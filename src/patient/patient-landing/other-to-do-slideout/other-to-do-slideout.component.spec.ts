import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OtherToDoSlideoutComponent } from './other-to-do-slideout.component';
import { PatientFilterService } from '../../service/patient-filter.service';
import { TranslateModule } from '@ngx-translate/core';
import { SlideoutFilterComponent } from '../../common/components/slideout-filter/app-slideout-filter.component';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PatientAdditionalIdentifierService } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { OtherToDoRequest } from 'src/patient/common/models/patient-grid-request.model';
import { OtherToDoGridFilter } from 'src/patient/common/models/patient-grid-filter.model';
import { SlideoutFilter } from 'src/patient/common/models/enums/patient.enum';
import { PatientFliterCategory, PatientTabFilter } from 'src/patient/common/models/patient-grid-response.model';

const mockToastrFactory = {
  success: jasmine.createSpy('toastrFactory.success'),
  error: jasmine.createSpy('Failed to retrieve locations')
};

const mockPatientAdditionalIdentifierService = {
  save: jasmine.createSpy(),
  update: jasmine.createSpy(),
  get: jasmine.createSpy().and.callFake(() => {
    return new Promise((resolve, reject) => {
      resolve({ Value: {} }),
        reject({});
    });
  }),
  getPatientAdditionalIdentifiers: jasmine.createSpy(),
  delete: jasmine.createSpy(),
  additionalIdentifiersWithPatients: jasmine.createSpy()
}

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

const mockPatientFilterService = {
  broadcastSelectedCount: jasmine.createSpy(),
  setAdditionalIdentifiers: jasmine.createSpy(),
  setDefaultGroupTypes: jasmine.createSpy().and.returnValue(mockGroupTypes),
  setDefaultPreferredDentist: jasmine.createSpy().and.returnValue(mockPreferredDentist),
  setDefaultPreferredHygienst: jasmine.createSpy().and.returnValue(mockPreferredHygeniest),
  isSelectAllOption: jasmine.createSpy().and.returnValue(true),
  setCommonStructure: jasmine.createSpy().and.returnValue(mockPatientTabFilter[0]),
  dueDateItems: [
    { field: 'DueDateItems', value: 'Due this week', key: '1', isSelected: false },
    { field: 'DueDateItems', value: 'Due next week', key: '2', isSelected: false },
    { field: 'DueDateItems', value: 'Overdue', key: '3', isSelected: false },
  ],
  getClearDateValues: jasmine.createSpy().and.returnValue(new Observable()),
  setDefaultAdditionalIdentifiers: jasmine.createSpy().and.returnValue([
    {
      field: 'AdditionalIdentifiers',
      value: 'N/A',
      key: '00000000-0000-0000-0000-000000000000',
      isVisible: true,
      isSelected: true
    }
  ]),
  patientModelStatus: new BehaviorSubject<[]>(null) as Observable<[]>
}


describe('OtherToDoSlideoutComponent', () => {
  let component: OtherToDoSlideoutComponent;
  let fixture: ComponentFixture<OtherToDoSlideoutComponent>;
  let slideoutFilterComponent: SlideoutFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: PatientFilterService , useValue: mockPatientFilterService},
        { provide: PatientAdditionalIdentifierService, useValue: mockPatientAdditionalIdentifierService },
        FormBuilder
      ],
      declarations: [ OtherToDoSlideoutComponent, SlideoutFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherToDoSlideoutComponent);
    component = fixture.componentInstance;

    const fixtureSlideoutFilterComponent = TestBed.createComponent(SlideoutFilterComponent);
    slideoutFilterComponent = fixtureSlideoutFilterComponent.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit',()=>{
    it('should call createForm and getDueDateItem in ngAfterViewInit', () => {
      component.slideoutFilter.patientModelArray = []
      component.getDueDateItem = jasmine.createSpy()
      component.createForm = jasmine.createSpy()
      component.OtherToDoRequest = new OtherToDoRequest();
      component.OtherToDoRequest.FilterCriteria = new OtherToDoGridFilter();
      const mockSubscription = jasmine.createSpyObj('Subscription', ['push']);
      component.subscriptions = [mockSubscription];

      component.ngAfterViewInit();
      expect(component.getDueDateItem).toHaveBeenCalled();
      expect(component.createForm ).toHaveBeenCalled();
    });
  });

  describe('createForm',()=>{
    it('should add a control to patientFilterForm when createForm is called', () => {
      const addControlSpy = spyOn(component.slideoutFilter?.patientFilterForm, 'addControl');
      component.createForm();
      expect(addControlSpy).toHaveBeenCalledWith('dueDate', jasmine.any(FormArray));
    });
  });

  describe('ngOnDestroy',()=>{
    it('should unsubscribe from subscriptions in ngOnDestroy', () => {
      const subscription1 = new Subscription();
      const subscription2 = new Subscription();
      component.subscriptions = [subscription1, subscription2];
      const unsubscribeSpy1 = spyOn(subscription1, 'unsubscribe');
      const unsubscribeSpy2 = spyOn(subscription2, 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubscribeSpy1).toHaveBeenCalled();
      expect(unsubscribeSpy2).toHaveBeenCalled();
    });
  })
  
  describe('setFilterData ->', () => {
    it('should set filter data', () => {    
      component.OtherToDoRequest = new OtherToDoRequest();
      component.OtherToDoRequest.FilterCriteria = new OtherToDoGridFilter();  
      component.setFilterData({ id: [], filterHeader: 'AdditionalIdentifiers' });
      component.setFilterData({ id: ['1','2'], filterHeader: 'DueDateItems' });
      component.setFilterData({ id: [], filterHeader: 'IsActive' });
      component.setFilterData({ id: [], filterHeader: 'IsPatient' });
      component.setFilterData({ id: [], filterHeader: 'GroupTypes' });
      component.setFilterData({ id: ["asd45-sdf789-sc45ve-xc890"], filterHeader: 'PreferredDentists' });
      component.setFilterData({ id: [], filterHeader: 'PreferredHygienists' });
      expect(component.OtherToDoRequest.FilterCriteria.AdditionalIdentifiers).toEqual([]);
      expect(component.OtherToDoRequest.FilterCriteria.DueDateItems).toEqual(['1','2']);
      expect(component.OtherToDoRequest.FilterCriteria.IsActive).toEqual([]);
      expect(component.OtherToDoRequest.FilterCriteria.IsPatient).toEqual([]);
      expect(component.OtherToDoRequest.FilterCriteria.GroupTypes).toEqual([]);
      expect(component.OtherToDoRequest.FilterCriteria.PreferredDentists).toEqual(["asd45-sdf789-sc45ve-xc890"]);
      expect(component.OtherToDoRequest.FilterCriteria.PreferredHygienists).toEqual([]);
    });
    
    it('should remove Patient/Non-Patients filter related properties from filter criteria when All option is checked', () => {
      component.OtherToDoRequest = { FilterCriteria: { IsPatient: ['true', 'false'], IsActive: ['false','true'] } };  

      component.setFilterData({ id: [], filterHeader: SlideoutFilter.PatientTypeStatus});  

      expect(component.OtherToDoRequest.FilterCriteria.IsActive).toBeUndefined();
      expect(component.OtherToDoRequest.FilterCriteria.IsPatient).toBeUndefined();
    });
  });

  describe('initializeDefaultPropeties ->', () => {
    it('should intialize OtherToDoRequest with otherToDoFilterCriteria', () => { 
      const mockOtherToDoFilterCriteria: OtherToDoRequest = {
        CurrentPage: 0,
        PageCount: 20,
        TotalCount: 50
      }
      component.otherToDoFilterCriteria = mockOtherToDoFilterCriteria;

      component.initializeDefaultPropeties()

      expect(component.OtherToDoRequest.CurrentPage).toEqual(mockOtherToDoFilterCriteria.CurrentPage);
      expect(component.OtherToDoRequest.PageCount).toEqual(mockOtherToDoFilterCriteria.PageCount);
      expect(component.OtherToDoRequest.TotalCount).toEqual(mockOtherToDoFilterCriteria.TotalCount);
    });
  });

  describe('getDueDateItem', () => {
    it('should get due date item',() => {
      const mockControl = new FormControl({ field: SlideoutFilter.DueDateItems, isSelected: true, isVisible: true, key: "", value: "" });
      const mockPatientFilterCategory = new Array<PatientFliterCategory<string>>();

      component.slideoutFilter = slideoutFilterComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        dueDate: new FormArray([])
      });
      component.dueDateArray.push(mockControl);
      component.dueDateItem = mockPatientFilterCategory;

      component.getDueDateItem();

      expect(component.dueDateArray.controls[0]).toEqual(mockControl);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith('dueDateDiv', 'dueDateDiv', 'DueDateItems', 'Due Date',
      component.dueDateArray, component.dueDateItem);
      expect(component.slideoutFilter.patientModelArray[0]).toEqual(mockPatientTabFilter[0])
    })
  })
});
