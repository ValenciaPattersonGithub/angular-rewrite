import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { PatientGridComponent } from './patient-grid.component';
import { TranslateModule } from '@ngx-translate/core';
import { AppointmentStatus, AppointmentStatusDataService } from 'src/scheduling/appointment-statuses';
import { DateRangeFilterType, TextFilterType } from 'src/patient/common/models/patient-grid-filter.model';
import { OtherToDoColumnsFields, PatientColumnsFields, PatientSortOrder } from 'src/patient/common/models/enums/patient.enum';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SortDescriptor } from '@progress/kendo-data-query/dist/es/sort-descriptor';
import { BadgeFilterType } from 'src/patient/common/models/patient-location.model';
import cloneDeep from 'lodash/cloneDeep';
import { debounceTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';


const mockAppointmentFilterList: AppointmentStatus[] = [{ description: 'test', id: 1, icon: 'test', sectionEnd: true, visibleInPatientGrid: true, descriptionNoSpace: '', descriptionTranslation: '' }];
const mockAppointmentStatusDataService = {
  getAppointmentStatuses: () => { },
  getAppointmentStatusesForPatientGrid: jasmine.createSpy().and.returnValue(mockAppointmentFilterList),
}

const mockData = [
  {
    appointmentDate: "N/A N/A",
    appointmentDuration: null,
    appointmentEndTime: null,
    appointmentId: undefined,
    appointmentStartTime: null,
    appointmentTimezone: undefined,
    classification: undefined,
    dob: "N/A",
    dueDate: "N/A",
    isActivePatient: true,
    lastAppt: "N/A",
    lastCommunication: "01/16/2024",
    name: "aaoxbydnavtnwkmaidrf, a'Z-A.z a'Z-A.z a'Z- M",
    nextAppointmentDuration: null,
    nextAppointmentEndTime: null,
    nextAppointmentId: null,
    nextAppointmentStartTime: null,
    nextAppointmentTimezone: null,
    nextAppt: "N/A",
    otherLastAppt: "N/A",
    otherStatus: "Incomplete",
    patientAccountId: "8903dfbe-2489-4d99-8b93-8a34e5a5ecc6",
    patientId: "8903dfbe-2489-4d99-8b93-8a34e5a5ecc6",
    preventiveCare: "N/A",
    previousAppointmentDuration: undefined,
    previousAppointmentEndTime: undefined,
    previousAppointmentId: null,
    previousAppointmentStartTime: undefined,
    previousAppointmentTimezone: null,
    responsibleParty: "aaoxbydnavtnwkmaidrf, a'Z-A.z a'Z-A.z a'Z- M",
    responsiblePartyId: "8903dfbe-2489-4d99-8b93-8a34e5a5ecc6",
    status: undefined,
    treatmentPlans: "(0)$0.00"
  }
];


const mockSort: SortDescriptor[] = [
  {
    field: "fieldName",
    dir: "asc",
  }
];

const mockGridData = [
  {
    PatientLocationId: null,
    PatientId: null,
    LocationId: 5303660,
    IsPrimary: null,
    PatientActivity: null,
    ObjectState: null,
    FailedMessage: null,
    DataTag: "AAAAAAALpY0=",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DateModified: "2022-06-03T17:29:27.6216702",
    DeactivationTimeUtc: "2022-06-06T04:00:00+00:00",
    NameLine1: "Location5303660Practice38638_fl15 (Timezone Abbreviation) - 06/06/2022",
    LocationStatus: "Inactive",
    GroupOrder: 3,
    Timezone: "Mountain Standard Time",
    Value: mockData
  },
]

const mockResponse = {
  PatientName: 'John Doe',
  ResponsiblePartyName: 'Jane Doe',
  IsComplete: 'Complete',
  PatientDateOfBirthFrom: new Date(),
  PatientDateOfBirthTo: new Date(),
  TreatmentPlanCountTotalFrom: 1,
  TreatmentPlanCountTotalTo: 2,
  PreviousAppointmentDateFrom: new Date(),
  PreviousAppointmentDateTo: new Date(),
  AppointmentStatus:1,
};


describe('PatientGridComponent', () => {
  let component: PatientGridComponent;
  let fixture: ComponentFixture<PatientGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientGridComponent],
      imports: [TranslateModule.forRoot()],
      providers: [FormBuilder, { provide: AppointmentStatusDataService, useValue: mockAppointmentStatusDataService }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return the DateRangeFilterType enum', () => {
    expect(component.dateRangeFilterType).toEqual(DateRangeFilterType);
  });

  it('should return the OtherToDoColumnsFields enum', () => {
    expect(component.otherToDoColumnsFields).toEqual(OtherToDoColumnsFields);
  });

  it('should return the PatientColumnsFields enum', () => {
    expect(component.patientColumnsFields).toEqual(PatientColumnsFields);
  });

  describe('writeValue -->', () => {   
    it('should call writeValue method', () => {
      const writeValueSpy = spyOn(component, 'writeValue'); 
      component.writeValue();
      expect(writeValueSpy).toHaveBeenCalled();
    });
  })

  describe('onChange -->', () => {   
    it('should call onChange method', () => {
      const onChangeSpy = spyOn(component, 'onChange');
      component.onChange(); 
      expect(onChangeSpy).toHaveBeenCalled();
    });
  })

  describe('onTouched -->', () => {   
    it('should call onTouched method', () => {
      const onTouchedSpy = spyOn(component, 'onTouched'); 
      component.onTouched(); 
      expect(onTouchedSpy).toHaveBeenCalled(); 
    });
  })

  describe('registerOnTouched ->', () => {
    it('should set onTouched', () => {
      component.registerOnTouched('fn');
      expect(component.onTouched).toEqual('fn');
    });
  });

  describe('registerOnChange ->', () => {
    it('should set onChange ', () => {
      component.registerOnChange('fn');
      expect(component.onChange).toEqual('fn');
    });
  });

  describe('ngOnChanges', () => {
    it('should set filter as null when parameter is null', () => {
      const changes: SimpleChanges = null;
      component.filter = null
      component.ngOnChanges(changes);
      expect(component.filter).toEqual(null);
    });

    it('should not update filter value when current Value and previous Value are same', () => {
      const changes: SimpleChanges = {
        activeFltrTab: {
          currentValue: '1',
          previousValue: '1',
          firstChange: false,
          isFirstChange: () => false
        }
      };
      component.filter = null
      component.ngOnChanges(changes);
      expect(component.filter).toEqual(null);
    });

    it('should update filter value when current Value and previous Values are not same', () => {
      const changes: SimpleChanges = {
        activeFltrTab: {
          currentValue: '1',
          previousValue: '2',
          firstChange: false,
          isFirstChange: () => false
        }
      };
      component.gridFilterDate = {
        allPatients: { FilterCriteria: {} }
      };
      spyOn(component, 'applyStoreData');
      component.ngOnChanges(changes);
      expect(component.applyStoreData).toHaveBeenCalledWith(component.gridFilterDate?.allPatients?.FilterCriteria);
    });
    it('should call applyStoreData with allPatients.FilterCriteria when activeFltrTab is AllPatients', () => {
      component.activeFltrTab = BadgeFilterType.AllPatients;
      component.gridFilterDate = {
        allPatients: { FilterCriteria: {} },
      };
      spyOn(component, 'applyStoreData');
      component.ngOnChanges({ activeFltrTab: { currentValue: '1', previousValue: '2', firstChange: false, isFirstChange: () => false } });
      expect(component.applyStoreData).toHaveBeenCalledWith(component.gridFilterDate?.allPatients?.FilterCriteria);
    });
    it('should call applyStoreData with allPatients.FilterCriteria when activeFltrTab is PreventiveCare', () => {
      component.activeFltrTab = BadgeFilterType.PreventiveCare;
      component.gridFilterDate = {
        preventiveCare: { FilterCriteria: {} },
      };
      spyOn(component, 'applyStoreData');
      component.ngOnChanges({ activeFltrTab: { currentValue: '1', previousValue: '2', firstChange: false, isFirstChange: () => false } });
      expect(component.applyStoreData).toHaveBeenCalledWith(component.gridFilterDate?.preventiveCare?.FilterCriteria);
    });
    it('should call applyStoreData with allPatients.FilterCriteria when activeFltrTab is TreatmentPlan', () => {
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      component.gridFilterDate = {
        tratmentPlans: { FilterCriteria: {} },
      };
      spyOn(component, 'applyStoreData');
      component.ngOnChanges({ activeFltrTab: { currentValue: '1', previousValue: '2', firstChange: false, isFirstChange: () => false } });
      expect(component.applyStoreData).toHaveBeenCalledWith(component.gridFilterDate?.tratmentPlans?.FilterCriteria);
    });
    it('should call applyStoreData with allPatients.FilterCriteria when activeFltrTab is Appointment', () => {
      component.activeFltrTab = BadgeFilterType.Appointments;
      component.gridFilterDate = {
        appointments: { FilterCriteria: {
          PatientDateOfBirth: ''
        } },
      };
      spyOn(component, 'applyStoreData');
      component.ngOnChanges({ activeFltrTab: { currentValue: '1', previousValue: '2', firstChange: false, isFirstChange: () => false } });
      expect(component.applyStoreData).toHaveBeenCalledWith(component.gridFilterDate?.appointments?.FilterCriteria);
    });
    it('should call applyStoreData with allPatients.FilterCriteria when activeFltrTab is OtherToDO', () => {
      component.activeFltrTab = BadgeFilterType.otherToDo;
      component.gridFilterDate = {
        otherToDo: { FilterCriteria: {} },
      };
      spyOn(component, 'applyStoreData');
      component.ngOnChanges({ activeFltrTab: { currentValue: '1', previousValue: '2', firstChange: false, isFirstChange: () => false } });
      expect(component.applyStoreData).toHaveBeenCalledWith(component.gridFilterDate?.otherToDo?.FilterCriteria);
    });
    it('should update patientGridData when gridData changes using of', () => { 
       const changes: SimpleChanges = { gridData: new SimpleChange([], [mockGridData], false) };
      component.gridData = cloneDeep(mockGridData);
      component.ngOnChanges(changes);
      component.patientGridData?.subscribe((data) => {
        expect(data).toEqual({ data: mockGridData, total: mockGridData?.length });
      });
    });
    it('should update patientGrid loading property when loading changes', () => {
      const mockChanges = { loading: new SimpleChange(false, true, false) };
      component.loading = true;
      component.ngOnChanges(mockChanges);
      expect(component.patientGrid.loading).toBe(true);
    });
  });


  describe('ngOnInit ->', () => {
    it('should set appointmentFilterList', () => {
      component.ngOnInit();
      expect(component.appointmentFilterList.length).toEqual(1);
    });

    it('should set appointmentFilterList null', () => {
      mockAppointmentStatusDataService.getAppointmentStatusesForPatientGrid = jasmine.createSpy().and.returnValue(null);
      component.ngOnInit();
      expect(component.appointmentFilterList.length).toEqual(0);
    });
    it('should sort appointmentFilterList based on Key', () => {
      const appointmentStatuses = [
          { id: 3, description: 'Description 3', visibleInPatientGrid: true },
          { id: 1, description: 'Description 1', visibleInPatientGrid: true },
          { id: 2, description: 'Description 2', visibleInPatientGrid: true },
      ];
      mockAppointmentStatusDataService.getAppointmentStatusesForPatientGrid = jasmine.createSpy().and.returnValue(appointmentStatuses);
      component.ngOnInit();
      expect(component.appointmentFilterList).toEqual([
          { Key: 1, Value: 'Description 1' },
          { Key: 2, Value: 'Description 2' },
          { Key: 3, Value: 'Description 3' },
      ]);
    });  

    it('should register all text field filter observers', () => {
      const mockNameField = 'name';
      const mockResponsiblePartyField = 'responsibleParty';
      const mockStatusField = 'otherStatus';

      spyOn(component, 'registerTextFieldsObserver');      

      component.ngOnInit();

      expect(component.registerTextFieldsObserver).toHaveBeenCalledTimes(3);
      expect(component.registerTextFieldsObserver).toHaveBeenCalledWith(component.textFieldFilter?.controls?.nameField, mockNameField);
      expect(component.registerTextFieldsObserver).toHaveBeenCalledWith(component.textFieldFilter?.controls?.responsiblePartyField, mockResponsiblePartyField);
      expect(component.registerTextFieldsObserver).toHaveBeenCalledWith(component.textFieldFilter?.controls?.otherStatusField, mockStatusField);
    })
  });

  describe('applyAction ->', () => {
    it('should set patientfromDate and patienttoDate', () => {
      const data = { startDate: new Date(), endDate: new Date() };
      component.applyAction(data);
      expect(component.showPopOver).toEqual(false);
    });
  });

  describe('triggerNavToPatientProfile  ->', () => {
    it('should Call onNavToPatientProfile', () => {
      component.navToPatientProfile = jasmine.createSpy().and.returnValue(true);
      component.triggerNavToPatientProfile('12345');
      expect(component.navToPatientProfile).toHaveBeenCalled();
    });

    it('should not Call onNavToPatientProfile', () => {
      component.navToPatientProfile = undefined;
      component.triggerNavToPatientProfile('12345');
      expect(component.navToPatientProfile).toEqual(undefined);
    });

  });

  describe('createAppointments   ->', () => {
    it('should Call toCreateAppointment', () => {
      component.toCreateAppointment = jasmine.createSpy().and.returnValue(true);
      component.createAppointments('12345');
      expect(component.toCreateAppointment).toHaveBeenCalled();
    });

    it('should not Call toCreateAppointment', () => {
      component.toCreateAppointment = undefined;
      component.createAppointments('12345');
      expect(component.toCreateAppointment).toEqual(undefined);
    });
  });

  describe('navigateToAppointment   ->', () => {
    it('should Call openAppointmentPopup', () => {
      component.openAppointmentPopup = jasmine.createSpy().and.returnValue(true);
      component.navigateToAppointment('12345', '234');
      expect(component.openAppointmentPopup).toHaveBeenCalled();
    });

    it('should not Call openAppointmentPopup', () => {
      component.openAppointmentPopup = undefined;
      component.navigateToAppointment('12345', '234');
      expect(component.openAppointmentPopup).toEqual(undefined);
    });

  });

  describe('populateTooltipContent ->', () => {
    it('should Call showApptToolTip', () => {
      component.showApptToolTip = jasmine.createSpy().and.returnValue(true);
      component.populateTooltipContent('12345', '234');
      expect(component.showApptToolTip).toHaveBeenCalled();
    });

    it('should not Call showApptToolTip', () => {
      component.showApptToolTip = undefined;
      component.populateTooltipContent('12345', '234');
      expect(component.showApptToolTip).toEqual(undefined);
    });

  });

  describe('openLastCommunicationModal ->', () => {
    it('should Call openCommunicationModal', () => {
      component.openCommunicationModal = jasmine.createSpy().and.returnValue(true);
      component.openLastCommunicationModal('12345', 1, true);
      expect(component.openCommunicationModal).toHaveBeenCalled();
    });

    it('should not Call openCommunicationModal', () => {
      component.openCommunicationModal = undefined;
      component.openLastCommunicationModal('12345', 1, true);
      expect(component.openCommunicationModal).toEqual(undefined);
    });
  });

  describe('showTooltip ->', () => {
    it('should Call showTreatmentPlanToolTip', () => {
      component.showTreatmentPlanToolTip = jasmine.createSpy().and.returnValue(true);
      component.showTooltip('12345', '234',0);
      expect(component.currentPatientId).toEqual('234');
      expect(component.showTreatmentPlanToolTip).toHaveBeenCalled();
      expect(component.showTreatmentPlanToolTip).toHaveBeenCalledWith('12345', '234');
    });
    it('should not Call showTreatmentPlanToolTip', () => {
      component.showTreatmentPlanToolTip = undefined;
      component.showTooltip('12345', '234',0);
      expect(component.currentPatientId).toEqual('234');
      expect(component.showTreatmentPlanToolTip).toEqual(undefined);
    });
  });

  describe('hideTxPlan ->', () => {
    it('should Call hideTreatmentPlan', () => {
      component.hideTreatmentPlan = jasmine.createSpy().and.returnValue(true);
      component.hideTxPlan();
      expect(component.hideTreatmentPlan).toHaveBeenCalled();
    });

    it('should not Call hideTreatmentPlan', () => {
      component.hideTreatmentPlan = undefined;
      component.hideTxPlan();
      expect(component.hideTreatmentPlan).toEqual(undefined);
    });
  });

  describe('getClass ->', () => {
    it('should return empty string', () => {
      const response = component.getClass('12345');
      expect(response).toEqual('');
    });

    it('should Call getTxClass', () => {
      component.getTxClass = jasmine.createSpy().and.returnValue(true);
      component.getClass('12345');
      expect(component.getTxClass).toHaveBeenCalled();
    });
  });

  describe('navToPatientTxPlan  ->', () => {
    it('should Call navigateTxPlan', () => {
      component.navigateTxPlan = jasmine.createSpy().and.returnValue(true);
      component.navToPatientTxPlan('12345', '234');
      expect(component.navigateTxPlan).toHaveBeenCalled();
    });

    it('should not Call navigateTxPlan', () => {
      component.navigateTxPlan = undefined;
      component.navToPatientTxPlan('12345', '234');
      expect(component.navigateTxPlan).toEqual(undefined);
    });
  });

  describe('onPopupOpen ->', () => {
    it('should set showDobPopOver true', () => {
      component.onPopupOpen(DateRangeFilterType.DateOfBirth);
      expect(component.showDobPopOver).toEqual(true);
    });
  });

  describe('applyDateRangeFilter ->', () => {
    it('should call onApplyDateRangeFilter', () => {
      spyOn(component.onApplyDateRangeFilter, 'emit');
      const data = { startDate: new Date(), endDate: new Date() };
      component.applyDateRangeFilter(data, '');
      expect(component.onApplyDateRangeFilter.emit).toHaveBeenCalled();
    });
  });

  describe('applyNumericRangeFilter ->', () => {
    it('should call onApplyNumericRangeFilter', () => {
      spyOn(component.onApplyNumericRangeFilter, 'emit');
      const data = { from: 1, to: 2 };
      component.applyNumericRangeFilter(data);
      expect(component.onApplyNumericRangeFilter.emit).toHaveBeenCalledWith(data);
    });
  });

  describe('clearField ->', () => {
    it('should clear the specified field', () => {
      const fieldFilter = TextFilterType.Name;
      component.textFieldFilter.controls.nameField.setValue('initialValue');  

      component.clearField(fieldFilter);

      expect(component.textFieldFilter.controls.nameField.value).toBe('');
    });
    it('should clear the specified field for responsiblePartyField', () => {
      const fieldFilter = TextFilterType.ResponsibleParty;
      component.textFieldFilter.controls.responsiblePartyField.setValue('initialValue');  

      component.clearField(fieldFilter);

      expect(component.textFieldFilter.controls.responsiblePartyField.value).toBe('');
    });
    it('should clear the specified field for Status', () => {
      const fieldFilter = TextFilterType.Status;
      component.textFieldFilter.controls.otherStatusField.setValue('initialValue');  

      component.clearField(fieldFilter);

      expect(component.textFieldFilter.controls.otherStatusField.value).toBe('');
    });  
  });

  describe('onAppointmentStatusChangedm ->', () => {
    it('should call onAppointmentStatusFilter', () => {
      spyOn(component.onAppointmentStatusFilter, 'emit');
      const event = { Key: '12345' };
      component.onAppointmentStatusChanged(event, 'field');
      expect(component.onAppointmentStatusFilter.emit).toHaveBeenCalled();
    });
  });

  describe('applyStoreData -> ', () => {
    it('should set values based on store data', () => { 
      component.appointmentFilterList = [{Value:'test', Key:1}];
      component.applyStoreData(mockResponse);  
      expect(component.textFieldFilter?.controls?.nameField?.value).toBe(mockResponse.PatientName);
      expect(component.textFieldFilter?.controls?.responsiblePartyField?.value).toBe(mockResponse.ResponsiblePartyName);
      expect(component.textFieldFilter?.controls?.statusField?.value).toBeUndefined();  
      expect(component.dateRangeFilter.PatientDateOfBirthFrom).toBe(mockResponse.PatientDateOfBirthFrom);
      expect(component.dateRangeFilter.PatientDateOfBirthTo).toBe(mockResponse.PatientDateOfBirthTo);    
      expect(component.dateRangeFilter.PreviousAppointmentDateFrom).toEqual(mockResponse.PreviousAppointmentDateFrom);
      expect(component.dateRangeFilter.PreviousAppointmentDateTo).toEqual(mockResponse.PreviousAppointmentDateTo);
  
      const obj = component.appointmentFilterList.find(x => x.Key == mockResponse.AppointmentStatus);
      if (obj) {
        expect(component.defaultItem).toEqual({ Value: obj.Value, Key: Number(mockResponse.AppointmentStatus) });
      } else {
        expect(component.defaultItem).toEqual({ Value: '-Select-', Key: null });
      }  
      expect(component.numericRangeFilter.TreatmentPlanCountTotalFrom).toBe(mockResponse.TreatmentPlanCountTotalFrom);
      expect(component.numericRangeFilter.TreatmentPlanCountTotalTo).toBe(mockResponse.TreatmentPlanCountTotalTo);
    });
  });  

  describe('sortChange -> ', () => {
    it('should sort data based on sort descriptor', () => {
      let sortDescriptor: SortDescriptor[] = [{ field: 'PatientName', dir: PatientSortOrder.asc }];

      spyOn(component.onGetSortedData, 'emit');
      component.patientGrid.data = [];
      component.gridData = [];
      component.sortChange(mockSort);
      expect(component.state.sort).toEqual(mockSort);
      expect(component.onGetSortedData.emit).not.toHaveBeenCalled();

      component.totalRecords = 100;
      component.gridData = cloneDeep(mockGridData);
      component.sortChange(sortDescriptor);
      expect(component.onGetSortedData.emit).toHaveBeenCalled();
      expect(component.state.sort[0].dir).toEqual(PatientSortOrder.asc);

      sortDescriptor = [{ field: 'PatientName', dir: PatientSortOrder.desc }];
      component.sortChange(sortDescriptor);
      expect(component.onGetSortedData.emit).toHaveBeenCalled();
      expect(component.state.sort[0].dir).toEqual( PatientSortOrder.desc);

      sortDescriptor = [{ field: 'PatientName', dir: null }];
      component.sortChange(sortDescriptor);
      expect(component.onGetSortedData.emit).toHaveBeenCalled();
      expect(component.state.sort[0].dir).toEqual(null);

      component.totalRecords = mockGridData.length;
      component.patientGrid.data = mockGridData;
      component.gridData = cloneDeep(mockGridData);
      component.sortChange(mockSort);
      expect(component.state.sort).toEqual(mockSort);
      
    });
  });

  describe('setInitialSorting -> ', () => {
  it('should set initial sorting', () => {
    let sortCriteria = { PatientName: 1, PreviousAppointmentDate: 0, LastCommunicationDate: 0, ResponsiblePartyName: 0, PatientDateOfBirth: 0, NextAppointmentDate: 0, PreventiveCareDueDate: 0, TreatmentPlanTotalBalance: 0 };

    component.activeFltrTab = BadgeFilterType.AllPatients;
    component.setInitialSorting(sortCriteria);

    expect(component.state.sort).toEqual([{ field: 'name', dir: PatientSortOrder.desc }]);
    expect(component.patientGrid.sort).toEqual([{ field: 'name', dir: PatientSortOrder.desc }]);

    sortCriteria = { PatientName: 0, PreviousAppointmentDate: 1, LastCommunicationDate: 0, ResponsiblePartyName: 0, PatientDateOfBirth: 0, NextAppointmentDate: 0, PreventiveCareDueDate: 0, TreatmentPlanTotalBalance: 0 };

    component.activeFltrTab = BadgeFilterType.AllPatients;
    component.setInitialSorting(sortCriteria);

    expect(component.state.sort).toEqual([{ field: 'lastAppt', dir: PatientSortOrder.desc }]);
    expect(component.patientGrid.sort).toEqual([{ field: 'lastAppt', dir: PatientSortOrder.desc }]);
    

    component.activeFltrTab = BadgeFilterType.otherToDo;
    component.setInitialSorting(sortCriteria);

    expect(component.state.sort).toEqual([{ field: 'otherLastAppt', dir: PatientSortOrder.desc }]);
    expect(component.patientGrid.sort).toEqual([{ field: 'otherLastAppt', dir: PatientSortOrder.desc }]);

    sortCriteria = { PatientName: 0, PreviousAppointmentDate: 0, LastCommunicationDate: 2, ResponsiblePartyName: 0, PatientDateOfBirth: 0, NextAppointmentDate: 0, PreventiveCareDueDate: 0, TreatmentPlanTotalBalance: 0 };
    component.activeFltrTab = BadgeFilterType.TreatmentPlans;
    component.setInitialSorting(sortCriteria);

    expect(component.state.sort).toEqual([{ field: 'lastCommunication', dir: PatientSortOrder.asc }]);
    expect(component.patientGrid.sort).toEqual([{ field: 'lastCommunication', dir: PatientSortOrder.asc }]);

    sortCriteria = { PatientName: 0, PreviousAppointmentDate: 0, LastCommunicationDate: 0, ResponsiblePartyName: 0, PatientDateOfBirth: 0, NextAppointmentDate: 0, PreventiveCareDueDate: 0, TreatmentPlanTotalBalance: 0 };
    component.activeFltrTab = BadgeFilterType.TreatmentPlans;
    component.setInitialSorting(sortCriteria);

    expect(component.state.sort).toEqual([]);
    expect(component.patientGrid.sort).toEqual([]);
  });
});

  describe('registerTextFieldsObserver ->', () => {
    it('should emit event when change in value for Name text field is observed', fakeAsync(() => {
      const nameFieldFilter = TextFilterType.Name;
      const filterValue = 'Mark';
      spyOn(component.textFieldFilter.controls.nameField.valueChanges, 'pipe').and.returnValue({
        subscribe: jasmine.createSpy()
      });
      spyOn(component.onTextValuefilter, 'emit');

      component.registerTextFieldsObserver(component.textFieldFilter?.controls?.nameField, nameFieldFilter);
      component.textFieldFilter?.controls?.nameField.setValue(filterValue);
      component.textFieldFilter.controls.nameField.markAsDirty();
      tick(500);

      expect(component.onTextValuefilter.emit).toHaveBeenCalledWith({ field: nameFieldFilter, operator: 'contains', value: filterValue });
      expect(component.textFieldFilter.controls.nameField.valueChanges.pipe(debounceTime(500)).subscribe).toHaveBeenCalled();
    }));

    it('should emit event when change in value for Responsible Party text field is observed', fakeAsync(() => {
      const responsiblePartyFieldFilter = TextFilterType.ResponsibleParty;
      const filterValue = 'Celeste';
      
      spyOn(component.textFieldFilter.controls.responsiblePartyField.valueChanges, 'pipe').and.returnValue({
        subscribe: jasmine.createSpy()
      });
      spyOn(component.onTextValuefilter, 'emit');
      
      component.registerTextFieldsObserver(component.textFieldFilter?.controls?.responsiblePartyField, responsiblePartyFieldFilter);
      component.textFieldFilter?.controls?.responsiblePartyField.setValue(filterValue);
      component.textFieldFilter.controls.responsiblePartyField.markAsDirty();
      tick(500);

      expect(component.onTextValuefilter.emit).toHaveBeenCalledWith({ field: responsiblePartyFieldFilter, operator: 'contains', value: filterValue });
      expect(component.textFieldFilter.controls.responsiblePartyField.valueChanges.pipe(debounceTime(500)).subscribe).toHaveBeenCalled();
    }));

    it('should emit event when change in value for Status text field is observed', fakeAsync(() => {
      const statusFieldFilter = TextFilterType.Status;
      const filterValue = 'incomplete';
      
      spyOn(component.textFieldFilter.controls.otherStatusField.valueChanges, 'pipe').and.returnValue({
        subscribe: jasmine.createSpy()
      });
      spyOn(component.onTextValuefilter, 'emit');
      
      component.registerTextFieldsObserver(component.textFieldFilter?.controls?.otherStatusField, statusFieldFilter);
      component.textFieldFilter?.controls?.otherStatusField.setValue(filterValue);
      component.textFieldFilter.controls.otherStatusField.markAsDirty();
      tick(500);

      expect(component.onTextValuefilter.emit).toHaveBeenCalledWith({ field: statusFieldFilter, operator: 'contains', value: filterValue });
      expect(component.textFieldFilter.controls.otherStatusField.valueChanges.pipe(debounceTime(500)).subscribe).toHaveBeenCalled();
    }));
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