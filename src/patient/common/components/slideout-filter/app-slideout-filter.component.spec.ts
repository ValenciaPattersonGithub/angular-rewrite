import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SlideoutFilterComponent } from './app-slideout-filter.component';
import { PatientAdditionalIdentifierService } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier.service';
import { PatientFilterService } from 'src/patient/service/patient-filter.service';
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PatientFliterCategory, PatientTabFilter } from '../../models/patient-grid-response.model';
import { PatientSlideout, SlideoutFilter } from '../../models/enums/patient.enum';
import { BadgeFilterType } from '../../models/patient-location.model';
import { EventEmitter } from '@angular/core';

let mockToastrFactory;
let mockPatientAdditionalIdentifier;
let mockPatientAdditionalIdentifierService;
let mockPatientFilterService;
let formBuilder;
let mockFormArray: FormArray;
let mockPatientModelsArray: PatientTabFilter[];
let mockTempId;

describe('SlideoutFilterComponent', () => {
  let component: SlideoutFilterComponent;
  let fixture: ComponentFixture<SlideoutFilterComponent>;
  let service: PatientFilterService;

  beforeEach(async () => {
    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    mockPatientAdditionalIdentifierService = {
      get: () => {
        return {
          then: (success, error) => {
            success({ res: mockPatientAdditionalIdentifier }),
              error({
                data: {
                  InvalidProperties: [{
                    PropertyName: "Description",
                    ValidationMessage: "Not Allowed"
                  }]
                }
              })
          }
        }
      }
    }

    mockPatientFilterService = {
      setCommonStructure: jasmine.createSpy(),
      setLocationZipCodes: jasmine.createSpy(),
      setDefaultGroupTypes: jasmine.createSpy(),
      setDefaultPreferredDentist: jasmine.createSpy(),
      setDefaultPreferredHygienst: jasmine.createSpy(),
      broadcastSelectedCount: jasmine.createSpy(),
      setAdditionalIdentifiers: jasmine.createSpy(),
      setDefaultAdditionalIdentifiers: jasmine.createSpy(),
      setSelectedFilter: jasmine.createSpy(),
      setExpandCollapse: jasmine.createSpy(),
      getExpandCollapse: jasmine.createSpy(),
      getClearDateValues: () => {
        return {
          subscribe: (res) => {
            res(false)
          }
        }
      },
      currentFilterCriteria: [{ GroupTypes: ['00000000-0000-0000-0000-000000000000'] }],
      checkKeyAndItemInFilterCriteria: (criteria: string, itemId) => {
        if (mockPatientFilterService.currentFilterCriteria[criteria] && mockPatientFilterService.currentFilterCriteria[criteria]?.length > 0) {
          return mockPatientFilterService.currentFilterCriteria[criteria]?.includes(itemId) as boolean;
        } else {
          return true;
        }
      },
      isSelectAllOption: (sourceData: PatientFliterCategory<string>[]) => {
        let result = false;
        if (sourceData) {
          const index = sourceData.findIndex(x => x?.isSelected == false);
          result = index > -1 ? false : true;
        }
        return result;
      },
      disableDateInput: true,
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
        { field: 'IsActive', value: 'Active', key: 'true', isSelected: true },
        { field: 'IsActive', value: 'Inactive', key: 'false', isSelected: false },
        { field: 'IsPatient', value: 'Non-Patients', key: 'false', isSelected: false },
        { field: 'IsPatient', value: 'Patients', key: 'true', isSelected: true },
      ],

      preferredDentists: [
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
          value: 'NA',
          key: '00000000-0000-0000-0000-000000000000',
          isVisible: true,
          isSelected: true
        },
      ],

      additionalIdentifiers: [
        {
          field: 'AdditionalIdentifiers',
          value: 'NA',
          key: '00000000-0000-0000-0000-000000000000',
          isVisible: true,
          isSelected: true
        }
      ],

      treatmentPlanName: [
        { field: 'TreatmentPlanName', value: '', key: 'Equal To', isSelected: true },
        { field: 'TreatmentPlanName', value: '', key: 'Contains', isSelected: true }
      ],
    }

    formBuilder = new FormBuilder();
    mockFormArray = formBuilder.array([
      formBuilder.control(''),
      formBuilder.control(''),
    ]);

    const mockControl = new FormControl({ field: SlideoutFilter.BirthMonths, isSelected: true, isVisible: true, key: "", value: "" });
    mockPatientModelsArray = [
      {
        dataTarget: "additionalIdentifiersDiv",
        divClassId: "additionalIdentifiersDiv",
        divUlId: "AdditionalIdentifiers",
        liFormArrayName: "AdditionalIdentifiers",
        formControls: new FormControl,
        filter: [
          {
            field: "AdditionalIdentifiers",
            isSelected: true,
            isVisible: false,
            key: "All",
            value: "All",
          },
          {
            field: "AdditionalIdentifiers",
            isSelected: false,
            isVisible: false,
            key: "N/A",
            value: "N/A",
          }
        ],
        filterText: "Additional Identifiers",
        formArray: new FormArray([new FormControl(mockControl), new FormControl(mockControl)]),
        isExpanded: false
      },
      {
        divUlId: 'AppointmentDates',
        filterText: "Appointment Date",
        formArray: new FormArray([new FormControl(mockControl), new FormControl(mockControl)]),
        dataTarget: "appointmentDatesDiv",
        divClassId: "appointmentDatesDiv",
        liFormArrayName: "AppointmentDates",
        formControls: new FormControl,
        filter: [
          {
            isSelected: true,
            field: "BusinessDays",
            key: "All",
            value: "All"
          },
          {
            isSelected: false,
            field: "BusinessDays",
            key: "1",
            value: "Next Business Day"
          },
        ],
        isExpanded: true
      },
      {
        divUlId: 'AppointmentStates',
        filterText: "Appointment State",
        formArray: new FormArray([new FormControl(mockControl), new FormControl(mockControl)]),
        dataTarget: "apptStateDiv",
        divClassId: "apptStateDiv",
        liFormArrayName: "AppointmentStates",
        formControls: new FormControl,
        filter: [
          {
            isSelected: true,
            field: SlideoutFilter.AppointmentState,
            key: "0|Cancellation",
            value: "Cancelled"
          },
          {
            isSelected: true,
            field: SlideoutFilter.AppointmentState,
            key: "1|Missed",
            value: "Missed"
          },
        ],
        isExpanded: true
      },
      {
        divUlId: 'AppointmentStates',
        filterText: "Appointment State",
        formArray: new FormArray([new FormControl(mockControl), new FormControl(mockControl)]),
        dataTarget: "apptStateDiv",
        divClassId: "apptStateDiv",
        liFormArrayName: "AppointmentStates",
        formControls: new FormControl,
        filter: [
          {
            isSelected: true,
            field: SlideoutFilter.TreatmentPlanCreatedDateField,
            key: "0|Cancellation",
            value: "Cancelled"
          },
          {
            isSelected: true,
            field: SlideoutFilter.TreatmentPlanCreatedDateField,
            key: "1|Missed",
            value: "Missed"
          },
        ],
        isExpanded: true
      }
    ];

    mockTempId = ['00fa8825-bbbf-4f96-a1a7-d3965f6acfd6', '976447ff-cec7-4e22-9c21-e960d4e6f9d3', '04586658-c360-4db4-9c1d-7ae1d289f91c', '4463b28e-88be-4d09-9ac5-774203c58d37', 'fb19b1cd-3398-4bcd-b83e-e81d9b7d3296', '4f9fbee0-ba04-46da-8fac-fa342e062d33', '910d166e-f3b7-44e7-911e-06b982903946', 'f9c5bb31-46ee-40bc-92c8-128923bd2633', '685f78dd-10e3-4831-8f66-778e252dee32', '04d09cd0-eda3-4dba-b33a-e6d1caa9ad75', 'bfad081c-373c-42e3-8489-e469224ad5e7', '9fc5db54-34d8-4663-9139-1a83437e8f16', '7d6ed6c4-a9b9-4f9d-a1ee-352858986e61', '82f72142-d5c5-4c0b-97d8-efba75942f63', '408bd7e5-3914-4ad9-9ba2-781c0b03cb06', 'e6e29978-0600-4218-b2be-e367975eac8a', '28aa05fa-79ab-4dc0-84a2-6ea2195ff055', '461d3838-8ed8-4b63-94ab-642188c44b69', 'bb73bbde-3c36-403c-9b0f-d62a784710e4', '01cb2229-0093-48b1-863b-ba611c36f232', 'ed705170-edcf-4750-bff3-f17fd2ede2c0', '4311b0a5-f7a8-4d98-a62e-c3bedc58b29b', '3e731013-0baa-446c-92d6-25aa0e1ac251', 'bf147f83-eeee-4597-94a1-8c00a0406304', '5b2a6d60-e3db-426b-96ee-4626a862af1f', '036d54ca-aceb-4c8f-9723-7621ff5019e0', 'cf79e7f1-ff7a-416b-89bb-09f42c12f9c6', '2616e7b2-86ec-4efd-a60c-034e5e6b55e8', '53e81918-6ad4-4624-8572-b6699871ec35', '8a7970cd-2c58-46e2-8e88-f3e96184d45a', '19098c95-18de-49ff-85d3-a02ccc2100f6', 'dfc69cc5-d282-40e7-a75d-f01784b13e89', 'e06f60aa-7711-4a46-a0bf-0085dea3a63d', 'fa821903-fc0e-4523-9aaf-15e14b466d72', '56923841-2a99-4d33-b83e-9a62d4fa36de', '314dd976-6f17-4451-a49b-12db58cf11a0', 'fc43889e-6e0b-4aed-989e-2b92c34f4fde', '29370bee-9181-468e-950b-de1d52391fa7', '16959d7c-1f3e-4ab3-b225-6244b96d9d2b', 'c54493c2-0e53-449a-8eb1-d2a9eb649264'];

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
      declarations: [SlideoutFilterComponent],
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
    fixture = TestBed.createComponent(SlideoutFilterComponent);
    component = fixture.componentInstance;
    service = TestBed.get(PatientFilterService);
    service.setExpandCollapse(false);
    service.setExpandCollapse(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('registerOnChange', () => {
    it('should set onchange event', () => {
      const event: EventEmitter<string> = new EventEmitter<string>();
      component.registerOnChange(event);
      expect(component.onChange).not.toBeNull();
    });
  });

  describe('registerOnTouched', () => {
    it('should set onTouched event', () => {
      const event: EventEmitter<string> = new EventEmitter<string>();
      component.registerOnTouched(event);
      expect(component.onTouched).not.toBeNull();
    });
  });

  describe('onTouched', () => {
    it('should call onTouched method when touched', () => {
      const onTouchedSpy = spyOn(component, 'onTouched');
      component.onTouched();
      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewInit', () => {
    it('should call ngAfterViewInit', () => {
      spyOn(component, 'getAppointmentDates');
      spyOn(component, 'getAppointmentStates');
      spyOn(component, 'getGroupTypes');
      spyOn(component, 'getPatientTypes');
      spyOn(component, 'getPreferredDentist');
      spyOn(component, 'getPreferredHygienist');
      spyOn(component, 'broadcastCurrentCount');
      component.ngAfterViewInit();
      expect(component.getAppointmentDates).toHaveBeenCalled();
      expect(component.getAppointmentStates).toHaveBeenCalled();
      expect(component.getGroupTypes).toHaveBeenCalled();
      expect(component.getPatientTypes).toHaveBeenCalled();
      expect(component.getPreferredDentist).toHaveBeenCalled();
      expect(component.getPreferredHygienist).toHaveBeenCalled();
      expect(component.broadcastCurrentCount).toHaveBeenCalled();
    });
  });

  describe('getAppointmentDates', () => {
    it('should update appointmentDates and patientModelArray if activeFltrTab is Appointments or AllPatients', () => {
      component.activeFltrTab = BadgeFilterType.Appointments;
      component.patientModelArray = mockPatientModelsArray;
      component.getAppointmentDates();
      expect(component.appointmentDatesArray.value.length).toBeGreaterThan(0);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith(
        'appointmentDateDiv',
        'appointmentDateDiv',
        'AppointmentDates',
        'Appointment Date',
        component.appointmentDatesArray,
        component.appointmentDates
      );
      expect(component.patientModelArray.length).toBeGreaterThan(0);
    });

    it('should not update appointmentDates or patientModelArray if activeFltrTab is not Appointments or AllPatients', () => {
      component.activeFltrTab = BadgeFilterType.PreventiveCare;
      component.patientModelArray = [];
      component.getAppointmentDates();
      expect(component.appointmentDatesArray.length).toBe(0);
      expect(component.patientModelArray.length).toBe(0);
    });
  });

  describe('getAppointmentStates', () => {
    it('should update appointmentStates and patientModelArray if activeFltrTab is Appointments or AllPatients', () => {
      component.activeFltrTab = BadgeFilterType.Appointments;
      component.patientModelArray = mockPatientModelsArray;
      component.getAppointmentStates();
      expect(component.appointmentStatesArray.value.length).toBeGreaterThan(0);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith(
        'apptStateDiv',
        'apptStateDiv',
        'AppointmentStates',
        'Appointment State',
        component.appointmentStatesArray,
        component.appointmentStates,
      );
      expect(component.patientModelArray.length).toBeGreaterThan(0);
    });

    it('should not update appointmentStates or patientModelArray if activeFltrTab is not Appointments or AllPatients', () => {
      component.activeFltrTab = BadgeFilterType.PreventiveCare;
      component.patientModelArray = [];
      component.getAppointmentStates();
      expect(component.appointmentStatesArray.length).toBe(0);
      expect(component.patientModelArray.length).toBe(0);
    });

  })

  describe('getGroupTypes', () => {
    it('should update groupTypes and patientModelArray if isFirstLoad is true', () => {
      component.isFirstLoad = true;
      component.activeGridData = {
        GroupTypes: [
          {
            field: 'GroupTypes',
            value: 'N/A',
            key: '00000000-0000-0000-0000-000000000000',
            isVisible: true,
            isSelected: true
          },
          {
            field: 'GroupTypes',
            value: 'AAA',
            key: '00000000-0000-0000-0000-000000000000',
            isVisible: true,
            isSelected: true
          }
        ],
      };
      component.patientModelArray = [];
      (mockPatientFilterService.setDefaultGroupTypes).and.returnValue(mockPatientFilterService.groupTypes);
      component.getGroupTypes();
      expect(component.groupTypes).toEqual(mockPatientFilterService.groupTypes);
      expect(component.groupTypesArray.length).toBeGreaterThan(0);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith(
        'groupTypesDiv',
        'groupTypesDiv',
        'GroupTypes',
        'Group Types',
        component.groupTypesArray,
        mockPatientFilterService.groupTypes
      );
      expect(component.patientModelArray.length).toBeGreaterThan(0);
    });
  });

  describe('getpatientTypess', () => {
    it('should populate patientTypessArray correctly', () => {
      const patientTypessArray = component.patientTypesArray;
      component.getPatientTypes();
      expect(patientTypessArray.length).toBe(5);
    });

    it('should update patientTypess and patientModelArray', () => {
      component.patientModelArray = [];
      component.getPatientTypes();
      expect(component.patientTypes).toEqual(mockPatientFilterService.patientTypes);
      expect(component.patientTypesArray.length).toBe(5);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith(
        'patientTypeStatus',
        'patientTypeStatus',
        'PatientTypeStatus',
        'Patients/Non-Patients',
        component.patientTypesArray,
        component.patientTypes
      );
      expect(component.patientModelArray.length).toBeGreaterThan(0);
    });
  })

  describe('getPreferredDentist', () => {
    it('should update preferredDentist, preferredDentistArray, and patientModelArray if isFirstLoad is true', () => {
      component.isFirstLoad = true;
      component.activeGridData = {
        PreferredDentists: [
          {
            field: 'PreferredDentists',
            value: 'N/A',
            key: '00000000-0000-0000-0000-000000000000',
            isVisible: true,
            isSelected: true
          },
          {
            field: 'PreferredDentists',
            value: 'BBB',
            key: '00000099-0000-0000-0000-000000000000',
            isVisible: true,
            isSelected: true
          }
        ],
      };
      component.patientModelArray = [];
      (mockPatientFilterService.setDefaultPreferredDentist as jasmine.Spy).and.returnValue(mockPatientFilterService.preferredDentists);
      component.getPreferredDentist();
      expect(component.preferredDentist).toEqual(mockPatientFilterService.preferredDentists);
      expect(component.preferredDentistArray.length).toBe(component.activeGridData.PreferredDentists.length + 1);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith(
        'preferredDentistsDiv',
        'preferredDentistsDiv',
        'PreferredDentists',
        'Preferred Dentist',
        component.preferredDentistArray,
        mockPatientFilterService.preferredDentists
      );
      expect(component.patientModelArray.length).toBeGreaterThan(0);
    });
  });

  describe('getPreferredHygienist', () => {
    it('should update preferredHygienst, preferredHygienistArray, and patientModelArray if isFirstLoad is true', () => {
      component.isFirstLoad = true;
      component.activeGridData = {
        PreferredHygienists: [
          {
            field: 'PreferredHygienists',
            value: 'All',
            key: 'All',
            isVisible: true,
            isSelected: true,
          },
          {
            field: 'PreferredHygienists',
            value: 'N/A',
            key: '00000000-0000-0000-0000-000000000000',
            isVisible: true,
            isSelected: true
          },
          {
            field: 'PreferredHygienists',
            value: 'BBB',
            key: '00000000-0000-0000-0000-000000000000',
            isVisible: true,
            isSelected: true
          }
        ],
      };
      component.patientModelArray = [];
      (mockPatientFilterService.setDefaultPreferredHygienst as jasmine.Spy).and.returnValue(mockPatientFilterService.preferredHygienst);
      component.getPreferredHygienist();
      expect(component.preferredHygienst).toEqual(mockPatientFilterService.preferredHygienst);
      expect(component.preferredHygienistArray.length).toBe(component.activeGridData.PreferredHygienists.length);
      expect(mockPatientFilterService.setCommonStructure).toHaveBeenCalledWith(
        'preferredHygienistsDiv',
        'preferredHygienistsDiv',
        'PreferredHygienists',
        'Preferred Hygienist',
        component.preferredHygienistArray,
        mockPatientFilterService.preferredHygienst
      );
      expect(component.patientModelArray.length).toBeGreaterThan(0);
    });
  })

  describe('additionalIdentifierArray', () => {
    it('should return the additionalIdentifiers as FormArray', () => {
      const additionalIdentifierArray = component.additionalIdentifierArray;
      expect(additionalIdentifierArray instanceof FormArray).toBe(true);
    });
  });

  describe('getPatientAdditionalIdentifiers', () => {
    it('should call patientAdditionalIdGetSuccess', () => {
      const spy = spyOn(component, 'patientAdditionalIdGetSuccess');
      component.getPatientAdditionalIdentifiers();
      component.patientAdditionalIdGetSuccess(mockPatientAdditionalIdentifier);
      expect(spy).toHaveBeenCalledWith(mockPatientAdditionalIdentifier);
    });
    it('should call patientAdditionalIdGetFailure', () => {
      component.patientAdditionalIdentifiers = [];
      component.patientAdditionalIdGetFailure();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    })
  });

  describe('toggleSelect', () => {
    beforeEach(() => {
      mockPatientModelsArray[0].formArray.clear();
      const control = { field: "AdditionalIdentifiers", isSelected: true, isVisible: true, key: "", value: "" };
      mockPatientModelsArray[0].formArray.push(new FormControl(control));
    })

    it('should toggle select', () => {
      const filterValue = 'test';
      const filterHeader = 'testHeader';
      const selectedIndex = 0;
      const formControlIndex = 0;
      const event = { target: { checked: true } };
      component.patientModelArray = mockPatientModelsArray;
      component.toggleSelect(filterValue, filterHeader, selectedIndex, formControlIndex, event);
      expect(component.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.patientModelArray[formControlIndex].filter[0].isSelected).toBe(false);
    });

    it('should uncheck "All" option if any other option is unchecked', () => {
      const formControlIndex = 0;
      component.patientModelArray = mockPatientModelsArray;
      component.toggleSelect('filterValue', 'filterHeader', 1, formControlIndex, { target: { checked: false, type: 'checkbox' } });
      expect(component.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected).toBe(false);
    });

    it('should check "All" option if all other options are checked', () => {
      const formControlIndex = 0;
      component.patientModelArray = mockPatientModelsArray;
      component.toggleSelect('filterValue', 'filterHeader', 0, formControlIndex, { target: { checked: true, type: 'checkbox' } });
      expect(component.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected).toBe(true);
    });

    it('should set the correct properties when event.target.checked is falsy', () => {
      const formControlIndex = 0;
      component.patientModelArray = mockPatientModelsArray;
      component.toggleSelect('filterValue', 'filterHeader', 1, formControlIndex, { target: { checked: true, type: 'checkbox' } });
      expect(component.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected).toBe(true);
    });

    it('should call dateRangeSelector method when field is TreatmentPlanCreatedDateField', () => {
      const formControlIndex = 3;
      component.patientModelArray = mockPatientModelsArray;
      spyOn(component, 'dateRangeSelector');
      component.toggleSelect('filterValue', 'filterHeader', 0, formControlIndex, { target: { checked: true, type: 'radio' } });
      expect(component.dateRangeSelector).toHaveBeenCalled();
    });
    
    it('should set the correct properties when event.target.type is checkbox and all filters are selected', () => {
      const formControlIndex = 0;
      component.patientModelArray = mockPatientModelsArray;
      component.toggleSelect('filterValue', 'filterHeader', 0, formControlIndex, { target: { checked: true, type: 'radio' } });
      expect(component.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected).toBe(false);
      expect(component.patientModelArray[formControlIndex].filter[1].isSelected).toBe(false);
    });

    it('should call TreatmentPlan method when field is setTreatmentPlanFilterValues', () => {
      const formControlIndex = 0;
      spyOn(component, 'setTreatmentPlanFilterValues');
      component.patientModelArray = mockPatientModelsArray;
      component.toggleSelect('filterValue', SlideoutFilter.TreatmentPlan, 0, formControlIndex, { target: { checked: true, type: 'radio' } });
      expect(component.setTreatmentPlanFilterValues).toHaveBeenCalled();
    });
  });

  describe('setPatientModel', () => {
    it('should emit treatmentPlansData if activeFltrTab is TreatmentPlans', () => {
      component.activeFltrTab = BadgeFilterType.TreatmentPlans;
      spyOn(component.treatmentPlansData, 'emit');
      component.setPatientModel(mockTempId, 'AdditionalIdentifiers');
      expect(component.treatmentPlansData.emit).toHaveBeenCalledWith({ id: mockTempId, filterHeader: 'AdditionalIdentifiers' });
    });

    it('should not emit treatmentPlansData if activeFltrTab is not TreatmentPlans', () => {
      component.activeFltrTab = BadgeFilterType.PreventiveCare;
      spyOn(component.treatmentPlansData, 'emit');
      component.setPatientModel(mockTempId, 'AdditionalIdentifiers');
      expect(component.treatmentPlansData.emit).not.toHaveBeenCalled();
    });
    it('should emit otherToDoData event when activeFltrTab is otherToDo', () => {
      component.activeFltrTab = BadgeFilterType.otherToDo;
      const tempAddId: string[] = ['id1', 'id2'];
      const filterHeader = 'Other ToDo';
      const spy = spyOn(component.otherToDoData, 'emit');
      component.setPatientModel(tempAddId, filterHeader);
      expect(spy).toHaveBeenCalledWith({ id: tempAddId, filterHeader: filterHeader });
    });
    it('should emit appointmentSlidoutData event when activeFltrTab is Appointments', () => {
      component.activeFltrTab = BadgeFilterType.Appointments;
      const tempAddId: string[] = ['id1', 'id2'];
      const filterHeader = 'Appointments';
      const spy = spyOn(component.appointmentSlidoutData, 'emit');
      component.setPatientModel(tempAddId, filterHeader);
      expect(spy).toHaveBeenCalledWith({ id: tempAddId, filterHeader: filterHeader });
    });
    it('should emit allpatientSlideout event when activeFltrTab is AllPatient', () => {
      component.activeFltrTab = BadgeFilterType.AllPatients;
      const tempAddId: string[] = ['id1', 'id2'];
      const filterHeader = 'AllPatient';
      const spy = spyOn(component.allPatientsData, 'emit');
      component.setPatientModel(tempAddId, filterHeader);
      expect(spy).toHaveBeenCalledWith({ id: tempAddId, filterHeader: filterHeader });
    });

  });

  describe('broadcastCurrentCount', () => {
    it('should calculate totalSelected when divUlId is not AppointmentDates or InsuranceFilter', () => {
      component.patientModelArray = [
        {
          divUlId: 'AppointmentDates',
          filterText: "Appointment Date",
          formArray: mockFormArray,

          dataTarget: "appointmentDatesDiv",
          divClassId: "appointmentDatesDiv",
          liFormArrayName: "AppointmentDates",
          formControls: new FormControl,
          filter: [
            {
              isSelected: true,
              field: "BusinessDays",
              key: "All",
              value: "All"
            },
            {
              isSelected: false,
              field: "BusinessDays",
              key: "All",
              value: "All"
            },
          ],
        },
        {
          divUlId: 'InsuranceFilter',
          filterText: "Insurance Filter",
          formArray: mockFormArray,

          dataTarget: "insuranceFilterDiv",
          divClassId: "insuranceFilterDiv",
          liFormArrayName: "InsuranceFilter",
          formControls: new FormControl,
          filter: [
            {
              isSelected: false,
              field: "HasInsurance",
              key: "All",
              value: "All"
            }
          ],
        },
      ];
      component.defaultFilterCount = null;
      const totalSelected = 0;
      component.broadcastCurrentCount();
      expect(component.defaultFilterCount).toBe(1);
      expect(totalSelected).toBe(0);
    });

    it('should handle the case when defaultFilterCount is null', () => {
      component.patientModelArray = mockPatientModelsArray;
      component.defaultFilterCount;
      component.broadcastCurrentCount();
      expect(component.defaultFilterCount).toBe(0);
    });

    it('should calculate totalSelected when divUlId is AppointmentDates or InsuranceFilter', () => {
      component.patientModelArray = mockPatientModelsArray;
      component.defaultFilterCount;
      const totalSelected = 5;
      component.broadcastCurrentCount();
      expect(component.defaultFilterCount).toBe(0);
      expect(totalSelected).toBeGreaterThan(0);
    });
  });

  describe('checkAllFilters', () => {
    it('should not do anything for PatientSlideout.SoonerIfPossible', () => {
      const filterHeader = PatientSlideout.SoonerIfPossible;
      const formControlIndex = 0;
      const event = { target: { checked: true } };
      component.patientModelArray = mockPatientModelsArray;
      component.checkAllFilters(null, filterHeader, event, formControlIndex, 0);
    });

    it('should toggle selection for filterValue "All"', () => {
      const filterValue = 'All';
      const formControlIndex = 0;
      const event = { target: { checked: true } };
      component.patientModelArray = mockPatientModelsArray;
      component.checkAllFilters(filterValue, null, event, formControlIndex, 0);
      event.target.checked = false;
      component.checkAllFilters(filterValue, null, event, formControlIndex, 0);
    });

    it('should toggle selection for filterValue other than "All"', () => {
      const filterValue = 'N/A';
      const formControlIndex = 0;
      const selectedIndex = 0;
      component.patientModelArray = mockPatientModelsArray;
      component.checkAllFilters(filterValue, null, null, formControlIndex, selectedIndex);
    });
  });

  describe('toggleShowMore', () => {
    it('should toggle showMoreState when it is defined', () => {
      const filterId = 'AdditionalIdentifiers';
      component.showMoreStates[filterId] = true;
      component.toggleShowMore(filterId);
      expect(component.showMoreStates[filterId]).toBeFalsy();
    });

    it('should initialize showMoreState to false when it is undefined', () => {
      const filterId = 'AdditionalIdentifiers';
      component.toggleShowMore(filterId);
      expect(component.showMoreStates[filterId]).toBeTruthy();
    });
  });

  describe('shouldShowMore', () => {
    it('should return true if showMoreState is true', () => {
      const filterId = 'AdditionalIdentifiers';
      component.showMoreStates[filterId] = true;
      const result = component.shouldShowMore(filterId);
      expect(result).toBeTruthy();
    });

    it('should return false if showMoreState is false', () => {
      const filterId = 'AdditionalIdentifiers';
      component.showMoreStates[filterId] = false;
      const result = component.shouldShowMore(filterId);
      expect(result).toBeFalsy();
    });
  });

  describe('onDateChanged', () => {
    it('should update createdGte and set value in formArray for From Date', () => {
      const date = new Date('2023-01-01');
      const index = 0;
      component.patientModelArray = mockPatientModelsArray;
      component.onDateChanged(date, index);
      expect(component.createdGte).toEqual(date);
    });

    it('should update createdLte and set value in formArray for To Date', () => {
      const date = new Date('2023-02-01');
      const index = 1;
      component.patientModelArray = mockPatientModelsArray;
      component.onDateChanged(date, index);
      expect(component.createdLte).toEqual(date);
    });

    it('should set invalidDateRange to true for an invalid date range', () => {
      const fromDate = new Date('2023-02-01');
      const toDate = new Date('2023-01-01');
      const index = 1;
      component.onDateChanged(fromDate, 0);
      component.onDateChanged(toDate, index);
      expect(component.invalidDateRange).toBe(true);
    });

    it('should set invalidDateRange to false for a valid date range', () => {
      const fromDate = new Date('2023-01-01');
      const toDate = new Date('2023-02-01');
      const index = 1;
      component.onDateChanged(fromDate, 0);
      component.onDateChanged(toDate, index);
      expect(component.invalidDateRange).toBe(false);
    });
  });

  describe('dateRangeSelector', () => {
    it('should disable date input and reset date values when filterValue is "all"', () => {
      const filterValue = 'All';
      mockPatientFilterService.disableDateInput = false;
      component.invalidDateRange = true;
      component.createdGte = new Date('2023-01-01');
      component.createdLte = new Date('2023-02-01');
      // NG15CLEANUP Needed to configure the formArray to have a values
      mockPatientModelsArray[0].formArray.at(0).patchValue({ isSelected: true });
      mockPatientModelsArray[0].formArray.at(1).patchValue({ isSelected: true });
      component.patientModelArray = mockPatientModelsArray;
      component.dateRangeSelector(filterValue);
      expect(mockPatientFilterService.disableDateInput).toBe(true);
      expect(component.invalidDateRange).toBe(false);
      expect(component.createdGte).toBeNull();
      expect(component.createdLte).toBeNull();
      expect(component.patientModelArray[0].formArray.controls[0]?.value).not.toBeNull();
      expect(component.patientModelArray[0].formArray.controls[1]?.value).not.toBeNull();
    });

    it('should enable date input when filterValue is not "all"', () => {
      const filterValue = 'Custom';
      mockPatientFilterService.disableDateInput = true;
      component.dateRangeSelector(filterValue);
      expect(mockPatientFilterService.disableDateInput).toBe(false);
    });
  });

  describe('inputValue', () => {
    it('should set values in formArray and call setPatientModel', () => {
      const val = { target: { value: 'Treatment Plan 0' } };
      const index = 1;
      spyOn(component, 'setPatientModel');
      component.patientModelArray = mockPatientModelsArray;
      component.nameArr = ['Treatment Plan 0', 'Treatment Plan 1'];
      component.inputValue(val, index, "treatmentName");
      expect(component.nameArr).toEqual(['Treatment Plan 0', 'Treatment Plan 1']);
      expect(component.setPatientModel).toHaveBeenCalled();
    });
  });

  describe('expandCollapse', () => {
    it('should expand the item and call setExpandCollapse as true if all items are expanded', () => {
      component.patientModelArray = mockPatientModelsArray;
      component.expandCollapse(0);
      expect(mockPatientFilterService.setExpandCollapse).toHaveBeenCalledWith(true);
    });

    it('should call setExpandCollapse as false if all items are collapsed', () => {
      component.patientModelArray = mockPatientModelsArray;
      component.expandCollapse(0);
      expect(mockPatientFilterService.setExpandCollapse).toHaveBeenCalledWith(false);
    });
  });

  describe('isChecked', () => {
    it('should return true if isSelected is true', () => {
      const formControlIndex = 0;
      // NG15CLEANUP Need to configure the formArray to have a value
      mockPatientModelsArray[formControlIndex].formArray.at(0).patchValue({ isSelected: true });
      component.patientModelArray = mockPatientModelsArray;
      const result = component.isChecked(formControlIndex);
      expect(result).toBe(true);
    });
  })

  describe('selectAll', () => {
    const filterValue = 'All';
    const formControlIndex = 0;

    it('should select all items if the checkbox is checked', () => {
      // NG15CLEANUP Needed to configure the formArray to have a values
      mockPatientModelsArray[formControlIndex].formArray.controls.forEach(control => control.patchValue({ isSelected: false }));
      component.patientModelArray = mockPatientModelsArray;
      component.selectAll(formControlIndex, { target: { checked: true, type: 'checkbox' } }, filterValue);
      expect(component.patientModelArray[formControlIndex].filter.every(x => x.isSelected)).toBe(true);
      expect(component.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected).toBe(true);
    });

    it('should deselect all items if the checkbox is unchecked', () => {
      // NG15CLEANUP Needed to configure the formArray to have a values
      mockPatientModelsArray[formControlIndex].formArray.controls.forEach(control => control.patchValue({ isSelected: true }));
      component.patientModelArray = mockPatientModelsArray;
      component.selectAll(formControlIndex, { target: { checked: false, type: 'checkbox' } }, filterValue);
      expect(component.patientModelArray[formControlIndex].filter.every(x => !x.isSelected)).toBe(true);
      expect(component.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected).toBe(false);
    });
    it('should reset and select the first item if the event type is radio', () => {
      // NG15CLEANUP Needed to configure the formArray to have a values
      mockPatientModelsArray[formControlIndex].formArray.controls.forEach(control => control.patchValue({ isSelected: false }));
      component.patientModelArray = mockPatientModelsArray;
      component.selectAll(formControlIndex, { target: { type: 'radio' } }, filterValue);
      expect(component.patientModelArray[formControlIndex]?.formArray?.controls[0]?.value?.isSelected).toBe(true);
    });

    it('should select all items if All checkbox option under Patients/Non Patients filter is checked and call setPatientModel', () => {
      mockPatientModelsArray[formControlIndex].formArray.controls.forEach(control => control.patchValue({ isSelected: false }));
      mockPatientModelsArray[formControlIndex].divUlId = SlideoutFilter.PatientTypeStatus;
      component.patientModelArray = mockPatientModelsArray;
      spyOn(component, 'setPatientModel');

      component.selectAll(formControlIndex, { target: { checked: true, type: 'checkbox' } }, filterValue);

      expect(component.patientModelArray[formControlIndex].filter.every(x => x.isSelected)).toBe(true);
      expect(component.patientModelArray[formControlIndex].formArray.controls[0].value.isSelected).toBe(true);
      expect(component.setPatientModel).toHaveBeenCalledWith([],SlideoutFilter.PatientTypeStatus);
    });
  })

  describe('setTreatmentPlanFilterValues', () => {
    it('should set treatment plan filter values correctly', () => {
      component.patientModelArray = mockPatientModelsArray;
      component.nameArr = ['Plan 1', ''];
      component.setPatientModel = jasmine.createSpy();
      component.setTreatmentPlanFilterValues(0);
      expect(component.setPatientModel).toHaveBeenCalledWith(component.nameArr, SlideoutFilter.TreatmentPlanName);
    });
  });

  describe('checkAppointmentStateFilter', () => {
    it('should call setPatientModel with correct parameters when All is selected', () => {
      const event = { target: { checked: true } };
      const index = 2;
      component.patientModelArray = mockPatientModelsArray;
      spyOn(component, 'setPatientModel');
      component.checkAppointmentStateFilter(event, index);
      expect(component.setPatientModel).toHaveBeenCalledWith(["0|Cancellation", "1|Missed"], SlideoutFilter.AppointmentState);
      expect(component.setPatientModel).toHaveBeenCalledWith(['true', 'false'], SlideoutFilter.IsScheduled);
      expect(component.setPatientModel).toHaveBeenCalledWith(["3"], SlideoutFilter.AppointmentStatusList);
    });

    it('should call setPatientModel with correct parameters when All is not selected', () => {
      const event = { target: { checked: false } };
      const index = 2;
      component.patientModelArray = mockPatientModelsArray;
      spyOn(component, 'setPatientModel');
      component.checkAppointmentStateFilter(event, index);
      expect(component.setPatientModel).toHaveBeenCalledWith([], SlideoutFilter.AppointmentState);
      expect(component.setPatientModel).toHaveBeenCalledWith([], SlideoutFilter.IsScheduled);
      expect(component.setPatientModel).toHaveBeenCalledWith([], SlideoutFilter.AppointmentStatusList);
    });
  });
});
