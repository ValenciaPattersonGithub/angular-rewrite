import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentSlideoutComponent } from './appointment-slideout.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SlideoutFilterComponent } from 'src/patient/common/components/slideout-filter/app-slideout-filter.component';
import { PatientFilterService } from 'src/patient/service/patient-filter.service';
import { PatientAdditionalIdentifierService } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { PatientFliterCategory, PatientTabFilter } from 'src/patient/common/models/patient-grid-response.model';
import { AppointmentRequest } from 'src/patient/common/models/patient-grid-request.model';
import { AppointmentGridFilter } from 'src/patient/common/models/patient-grid-filter.model';
import { Subscription, of } from 'rxjs';
import { SimpleChange, SimpleChanges } from '@angular/core';

describe('AppointmentSlideoutComponent', () => {
  let component: AppointmentSlideoutComponent;
  let fixture: ComponentFixture<AppointmentSlideoutComponent>;

  let childComponent: SlideoutFilterComponent;
  let childComponentFixture: ComponentFixture<SlideoutFilterComponent>;

  const emptyGuId = "00000000-0000-0000-0000-000000000000";

  const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };

  const appointmentTypes: PatientFliterCategory<string>[] = [
    { field: 'AppointmentTypes', value: 'all', key: 'All', isVisible: true, isSelected: true },
    { field: 'AppointmentTypes', value: '1', key: '234-234-1233-2344', isVisible: true, isSelected: true }
  ];

  const appointmentBlocks: PatientFliterCategory<string>[] = [
    { field: 'AppointmentBlocks', value: 'all', key: 'All', isVisible: true, isSelected: true },
    { field: 'AppointmentBlocks', value: 'Exclude Blocks', key: "1", isVisible: true, isSelected: false },
    { field: 'AppointmentBlocks', value: 'Include Blocks Only', key: "2", isVisible: true, isSelected: false }
  ];

  const rooms: PatientFliterCategory<string>[] = [
    { field: 'Rooms', value: 'all', key: 'All', isVisible: true, isSelected: true },
    { field: 'Rooms', value: '', key: emptyGuId, isVisible: true, isSelected: true }
  ];

  const providers: PatientFliterCategory<string>[] = [
    { field: 'Providers', value: 'All', key: 'All', isVisible: true, isSelected: true },
    { field: 'Providers', value: 'N/A', key: emptyGuId, isVisible: true, isSelected: true }
  ];

  const mockPatientFilterService = {
    initializeDefaultAppointmentFilters: jasmine.createSpy(),
    broadcastSelectedCount: jasmine.createSpy(),
    setDefaultGroupTypes: jasmine.createSpy(),
    setCommonStructure: jasmine.createSpy(),
    setDefaultPreferredDentist: jasmine.createSpy(),
    setDefaultPreferredHygienst: jasmine.createSpy(),
    getClearDateValues: () => {
      return {
        subscribe: (res) => {
          res(false)
        }
      }
    },
    currentFilterCriteria: [{ GroupTypes: ['00000000-0000-0000-0000-000000000000'] }],
    checkKeyAndItemInFilterCriteria: (criteria: string, itemId) => {
      if (mockPatientFilterService?.currentFilterCriteria[criteria] && mockPatientFilterService?.currentFilterCriteria[criteria]?.length > 0) {
        return mockPatientFilterService.currentFilterCriteria[criteria]?.includes(itemId) as boolean;
      } else {
        return true;
      }
    },
    isSelectAllOption: (sourceData: PatientFliterCategory<string>[]) => {
      let result = false;
      if (sourceData) {
        const index = sourceData?.findIndex(x => x?.isSelected == false);
        result = index > -1 ? false : true;
      }
      return result;
    },
    appointmentTypes: appointmentTypes,
    appointmentBlocks: appointmentBlocks,
    rooms: rooms,
    providers: providers,
    patientModelStatus: of(["test 1", "test 2"]),
    setAdditionalIdentifiers: jasmine.createSpy(),
    setDefaultAdditionalIdentifiers: jasmine.createSpy()
  }

  const mockPatientAdditionalIdentifierService = {
    get: () => {
      return {
        then: (success) => {
          success({ res: [] })
        }
      }
    },
    save: jasmine.createSpy(),
    update: jasmine.createSpy(),
    additionalIdentifiersWithPatients: jasmine.createSpy(),
  }


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), ReactiveFormsModule],
      declarations: [AppointmentSlideoutComponent],
      providers: [TranslateService, FormBuilder,
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: PatientFilterService, useValue: mockPatientFilterService },
        { provide: PatientAdditionalIdentifierService, useValue: mockPatientAdditionalIdentifierService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentSlideoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    childComponentFixture = TestBed.createComponent(SlideoutFilterComponent);
    childComponent = childComponentFixture.componentInstance;
    childComponentFixture.detectChanges();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should do nothing when activeGridData is not changed', () => {
      const changes: SimpleChanges = {
        activeGridData: new SimpleChange(null, null, false)
      };
      spyOn(component, 'getAppointmentTypes');
      spyOn(component, 'getRooms');
      spyOn(component, 'getProviders');
      component.ngOnChanges(changes);
      expect(component.getAppointmentTypes).not.toHaveBeenCalled();
      expect(component.getRooms).not.toHaveBeenCalled();
      expect(component.getProviders).not.toHaveBeenCalled();
    });
  
    it('should call getAppointmentTypes when AppointmentTypes is changed', () => {
      const changes: SimpleChanges = {
        activeGridData: new SimpleChange({ AppointmentTypes: [] }, { AppointmentTypes: ['Type1'] }, false)
      };
      spyOn(component, 'getAppointmentTypes');
      component.ngOnChanges(changes);
      expect(component.getAppointmentTypes).toHaveBeenCalled();
    });
  
    it('should call getRooms when Rooms is changed', () => {
      const changes: SimpleChanges = {
        activeGridData: new SimpleChange({ Rooms: [] }, { Rooms: ['Room1'] }, false)
      };
      spyOn(component, 'getRooms');
      component.ngOnChanges(changes);
      expect(component.getRooms).toHaveBeenCalled();
    });
  
    it('should call getProviders when Providers is changed', () => {
      const changes: SimpleChanges = {
        activeGridData: new SimpleChange({ Providers: [] }, { Providers: ['Provider1'] }, false)
      };
      spyOn(component, 'getProviders');
      component.ngOnChanges(changes);
      expect(component.getProviders).toHaveBeenCalled();
    });
  });
  
  describe('ngAfterViewInit', () => {
    it('should call createForm and getSectionData method', () => {
      spyOn(component, 'createForm');
      spyOn(component, 'getSectionData');
      component.ngAfterViewInit();
      expect(component.createForm).toHaveBeenCalled();
      expect(component.getSectionData).toHaveBeenCalled();
    });
  });

  describe('getSectionData', () => {
    it('should call initializeDefaultPropeties,getAppointmentTypes, getAppointmentTypes, getRooms, getProviders and setSoonerNotVisible method', () => {
      spyOn(component, 'initializeDefaultPropeties');
      spyOn(component, 'getAppointmentTypes');
      spyOn(component, 'getRooms');
      spyOn(component, 'getProviders');
      spyOn(component, 'setSoonerNotVisible');
      component.subscriptions = new Array<Subscription>();
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormBuilder().group({});
      component.getSectionData();
      expect(component.initializeDefaultPropeties).toHaveBeenCalled();
      expect(component.getAppointmentTypes).toHaveBeenCalled();
      expect(component.getRooms).toHaveBeenCalled();
      expect(component.getProviders).toHaveBeenCalled();
      expect(component.setSoonerNotVisible).toHaveBeenCalled();
    });
  });

  describe('initializeDefaultPropeties', () => {
    it('should call initializeDefaultAppointmentFilters', () => {
      component.initializeDefaultPropeties();
      expect(component.appointmentRequest).toEqual(component.appointmentsFilterCriteria);
    });
  });


  describe('createForm', () => {
    it('should initilize controls for patientFilterForm', () => {
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormBuilder().group({});
      component.createForm();
      expect(component.slideoutFilter.patientFilterForm.controls).not.toBeUndefined();
    });
  });



  describe('getAppointmentTypes', () => {
    it('should populate appointmentTypes and appointmentTypeForm', () => {
      component.isFirstLoad = true;
      component.activeGridData = { AppointmentTypes: appointmentTypes };
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientModelArray = [];
      component.appointmentTypes = [];
      component.getAppointmentTypes();
      expect(component.appointmentTypes.length).toEqual(4);
    });
  });

  describe('getAppointmentBlocks', () => {
    it('should call addToForm and setCommonStructure functions', () => {
      spyOn(component, 'addToForm');
      component.getAppointmentBlocks();
      expect(component.addToForm).toHaveBeenCalled();
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalled();
    });
  });

  describe('getRooms', () => {
    it('should call addToForm from getRooms', () => {
      spyOn(component, 'addToForm');
      component.activeGridData = { Rooms: rooms };
      component.getRooms();
      expect(component.rooms.length).toEqual(4);
      expect(component.addToForm).toHaveBeenCalled();
    });
  });

  describe('getProviders', () => {
    it('should call addToForm from getProviders', () => {
      spyOn(component, 'addToForm');
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        providers: new FormArray([])
      });
      component.providers = [];
      component.activeGridData = { Providers: [{ field: 'Providers 1', value: '123' }] };
      component.getProviders();
      expect(component.addToForm).toHaveBeenCalled();
      expect(component.providers.length).toEqual(3);
    });
  });

  describe('setSoonerNotVisible', () => {
    it('should call addToForm from setSoonerNotVisible', () => {
      spyOn(component, 'addToForm');
      component.slideoutFilter = childComponent;
      component.slideoutFilter.patientFilterForm = new FormGroup({
        soonerIfPossibleForm: new FormArray([])
      });
      component.setSoonerNotVisible();
      expect(component.addToForm).toHaveBeenCalled();
    });
  });

  describe('addToForm', () => {
    it('should add dataArray to patientModelArray if dataArray, slideoutFilter, and patientModelArray are defined', () => {
      const patientTabFilter = [{ dataTarget: 'div 1', filterText: 'filter 1', divClassId: '', divUlId: '123', liFormArrayName: '23', filter: [], formControls: null, formArray: null, isExpanded: false }];
      component.slideoutFilter = childComponent;
      component.addToForm(patientTabFilter);
      expect(component.slideoutFilter.patientModelArray.length).toEqual(1);
    });
  
    it('should handle cases where index < 0', () => {
      const dataArray = { dataTarget: 'nonExistentTarget' };
      component.slideoutFilter = childComponent
      component.addToForm(dataArray);
      expect(component.slideoutFilter.patientModelArray.length).toEqual(2);
    });
  });

  describe('setFilterData ', () => {
    it('should return 123 for AdditionalIdentifiers', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'AdditionalIdentifiers' });
      expect(component.appointmentRequest.FilterCriteria.AdditionalIdentifiers).toEqual('123');
    });

    it('should return 123 for AppointmentDate', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'AppointmentDates' });
      expect(component.appointmentRequest.FilterCriteria.AppointmentDate).toEqual('123');
    });

    it('should return 123 for AppointmentState', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'AppointmentState' });
      expect(component.appointmentRequest.FilterCriteria.AppointmentState).toEqual('123');
    });

    it('should return 123 for AppointmentStatusList', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'AppointmentStatusList' });
      expect(component.appointmentRequest.FilterCriteria.AppointmentStatusList).toEqual('123');
    });

    it('should return true for IsScheduled', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: 'true', filterHeader: 'IsScheduled' });
      expect(component.appointmentRequest.FilterCriteria.IsScheduled).toEqual('true');
    });

    it('should return 123 for AppointmentTypes', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'AppointmentTypes' });
      expect(component.appointmentRequest.FilterCriteria.AppointmentTypes).toEqual('123');
    });

    it('should return 123 for AppointmentBlocks', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'AppointmentBlocks' });
      expect(component.appointmentRequest.FilterCriteria.AppointmentBlocks).toEqual('123');
    });

    it('should return 123 for GroupTypes', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'GroupTypes' });
      expect(component.appointmentRequest.FilterCriteria.GroupTypes).toEqual('123');
    });

    it('should return 123 for PreferredDentists', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'PreferredDentists' });
      expect(component.appointmentRequest.FilterCriteria.PreferredDentists).toEqual('123');
    });

    it('should return 123 for PreferredHygienists', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'PreferredHygienists' });
      expect(component.appointmentRequest.FilterCriteria.PreferredHygienists).toEqual('123');
    });

    it('should return 123 for Providers', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'Providers' });
      expect(component.appointmentRequest.FilterCriteria.Providers).toEqual('123');
    });

    it('should return 123 for Rooms', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'Rooms' });
      expect(component.appointmentRequest.FilterCriteria.Rooms).toEqual('123');
    });

    it('should return 123 for SoonerIfPossible', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'SoonerIfPossible' });
      expect(component.appointmentRequest.FilterCriteria.SoonerIfPossible).toEqual('123');
    });

    it('should return 123 for BusinessDays', () => {
      component.appointmentRequest = new AppointmentRequest();
      component.appointmentRequest.FilterCriteria = new AppointmentGridFilter();
      component.setFilterData({ id: '123', filterHeader: 'BusinessDays' });
      expect(component.appointmentRequest.FilterCriteria.BusinessDays).toEqual('123');
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from subscriptions in ngOnDestroy', () => {
      const subscription1 = new Subscription();
      component.subscriptions = [subscription1];
      const unsubscribeSpy1 = spyOn(subscription1, 'unsubscribe');
      component.ngOnDestroy();
      expect(unsubscribeSpy1).toHaveBeenCalled();
    });
  })

});
