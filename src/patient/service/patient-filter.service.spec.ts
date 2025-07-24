import { TestBed } from '@angular/core/testing';
import { PatientFilterService } from './patient-filter.service';
import { TranslateModule } from '@ngx-translate/core';
import { PatientFliterCategory, PatientTabFilter } from '../common/models/patient-grid-response.model';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { PatientAdditionalIdentifiers } from 'src/business-center/practice-settings/patient-profile/patient-additional-identifiers/patient-additional-identifier';

const formBuilder = new FormBuilder();
const mockFormArray: FormArray = formBuilder.array([
  formBuilder.control('Value 1'),
  formBuilder.control('Value 2'),
]);
const mockPatientModelsArray: PatientTabFilter[] = [
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
        isVisible: true,
        key: "All",
        value: "All",
      }
    ],
    filterText: "Additional Identifiers",
    formArray: mockFormArray,
    isExpanded: false
  }
];

const mockAdditionalIdentifiers: PatientFliterCategory<string>[] = [
  {
    field: 'AdditionalIdentifiers',
    value: 'N/A',
    key: '00000000-0000-0000-0000-000000000000',
    isVisible: true,
    isSelected: true
  }
];

const mockPreferredDentists: PatientFliterCategory<string>[] = [
  {
    field: 'PreferredDentists',
    value: 'N/A',
    key: '00000000-0000-0000-0000-000000000000',
    isVisible: true,
    isSelected: true
  },
];

const mockPreferredHygienists: PatientFliterCategory<string>[] = [
  {
    field: 'PreferredHygienists',
    value: 'N/A',
    key: '00000000-0000-0000-0000-000000000000',
    isVisible: true,
    isSelected: true
  },
];

const mockTreatmentPlanStates: PatientFliterCategory<string>[] = [
  { field: 'TreatmentPlanStates', value: 'N/A', key: null, isSelected: true },
  { field: 'TreatmentPlanStates', value: 'Scheduled', key: 'true', isSelected: true },
  { field: 'TreatmentPlanStates', value: 'UnScheduled', key: 'false', isSelected: true },
];

const mockZipCodes: PatientFliterCategory<string>[] = [
  {
    field: 'ZipCodes',
    value: 'N/A',
    key: '',
    isVisible: true,
    isSelected: true,
  }
];

const mockFilterByIndex = [
  { index: 0, text: 'AdditionalIdentifiers' },
  { index: 1, text: 'BusinessDays' },
  { index: 2, text: 'AppointmentStatusList' },
  { index: 3, text: 'BirthMonths' }
];

const mockInput: PatientAdditionalIdentifiers[] = [{
  DataTag: "AAAAAAAg6W8=",
  DateModified: new Date(),
  Description: "Description_xwbnaslcia",
  IsSpecifiedList: true,
  IsSpecifiedListName: "Specified List",
  IsUsed: true,
  ListValues: [
    {
      DataTag: "AAAAAAAg6XB=",
      DateModified: new Date(),
      IsUsed: false,
      MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
      MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
      Order: 1,
      UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
      Value: "Description2",
    },
    {
      DataTag: "AAAAAAAg6ZC=",
      DateModified: new Date(),
      IsUsed: false,
      MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
      MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
      Order: 2,
      UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
      Value: "Description3",
    },
  ],
  MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
  UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
}];

describe('PatientFilterService', () => {
  let service: PatientFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
    });
    service = TestBed.inject(PatientFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('broadcastSelectedCount', () => {
    it('should broadcast selected count', (done: DoneFn) => {
      service.selectedCount$.subscribe((count) => {
        expect(count).toBeGreaterThanOrEqual(0);
        done();
      });
      service.broadcastSelectedCount(5);
    });
  });

  describe('setDefaultAdditionalIdentifiers', () => {
    it('should set AdditionalIdentifiers with isSelected as true if isFirstLoad is true', () => {
      const isFirstLoad = true;
      const result = service.setDefaultAdditionalIdentifiers(isFirstLoad);
      expect(result).toEqual(mockAdditionalIdentifiers);
    });
    it('should set AdditionalIdentifiers with isSelected based on isItemSelected result if isFirstLoad is false', () => {
      const isFirstLoad = false;
      spyOn(service, 'isItemSelected').and.returnValues(false, true);
      const result = service.setDefaultAdditionalIdentifiers(isFirstLoad);
      expect(result).toEqual([        
        {
          field: 'AdditionalIdentifiers',
          value: service.optionNA,
          key: service.emptyGuId,
          isVisible: true,
          isSelected: false,
        },
      ]);
    });
  })

  describe('setDefaultGroupTypes', () => {
    it('should set GroupTypes with isSelected based on isItemSelected result if isFirstLoad is true', () => {
      const isFirstLoad = true;
      spyOn(service, 'isItemSelected').and.returnValues(false, true);
      service.currentFilterCriteria = { GroupTypes: [service.emptyGuId] };
      const result = service.setDefaultGroupTypes(isFirstLoad);
      expect(result).toEqual([       
        {
          field: 'GroupTypes',
          value: service.optionNA,
          key: service.emptyGuId,
          isVisible: true,
          isSelected: true,
        },
      ]);
    });

    it('should set GroupTypes with isSelected based on isItemSelected result if isFirstLoad is false', () => {
      const isFirstLoad = false;
      spyOn(service, 'isItemSelected').and.returnValues(false, true);
      service.currentFilterCriteria = { GroupTypes: ["111"] };
      const result = service.setDefaultGroupTypes(isFirstLoad);
      expect(result).toEqual([       
        {
          field: 'GroupTypes',
          value: service.optionNA,
          key: service.emptyGuId,
          isVisible: true,
          isSelected: false,
        },
      ]);
    });
  });

  describe('setDefaultPreferredDentist', () => {
    it('should set PreferredDentists with isSelected as true if isFirstLoad is true', () => {
      const isFirstLoad = true;
      const result = service.setDefaultPreferredDentist(isFirstLoad);
      expect(result).toEqual(mockPreferredDentists);
    });
    it('should set PreferredDentists with isSelected based on isItemSelected result if isFirstLoad is false', () => {
      const isFirstLoad = false;
      spyOn(service, 'isItemSelected').and.returnValues(false, true);
      service.currentFilterCriteria = { PreferredDentists: ["111"] };
      const result = service.setDefaultPreferredDentist(isFirstLoad);
      expect(result).toEqual([        
        {
          field: 'PreferredDentists',
          value: service.optionNA,
          key: service.emptyGuId,
          isVisible: true,
          isSelected: false,
        },
      ]);
    });
  });

  describe('setDefaultPreferredHygienst', () => {
    it('should set PreferredHygienists with isSelected as true if isFirstLoad is true', () => {
      const isFirstLoad = true;
      const result = service.setDefaultPreferredHygienst(isFirstLoad);
      expect(result).toEqual(mockPreferredHygienists);
    });
    it('should set PreferredHygienists with isSelected based on isItemSelected result if isFirstLoad is false', () => {
      const isFirstLoad = false;
      service.currentFilterCriteria = { PreferredHygienists: ["111"] };
      spyOn(service, 'isItemSelected').and.returnValues(false, true);
      const result = service.setDefaultPreferredHygienst(isFirstLoad);
      expect(result).toEqual([       
        {
          field: 'PreferredHygienists',
          value: service.optionNA,
          key: service.emptyGuId,
          isVisible: true,
          isSelected: false,
        },
      ]);
    });
  });

  describe('setLocationZipCodes', () => {
    it('should set ZipCodes with isSelected as true if isFirstLoad is true', () => {
      const isFirstLoad = true;
      const result = service.setLocationZipCodes(isFirstLoad);
      expect(result).toEqual(mockZipCodes);
    });
    it('should set ZipCodes with isSelected based on isItemSelected result if isFirstLoad is false', () => {
      const isFirstLoad = false;
      spyOn(service, 'isItemSelected').and.returnValue(false);
      const result = service.setLocationZipCodes(isFirstLoad);
      expect(result).toEqual([       
        {
          field: 'ZipCodes',
          value: service.optionNA,
          key: '',
          isVisible: true,
          isSelected: false,
        },
      ]);
    });
  });

  describe('setAdditionalIdentifiers', () => {
    it('should set additional identifiers', () => {
      service.setAdditionalIdentifiers(mockInput);
      expect(service.patientAdditionalIdentifiers).toEqual(mockInput);
    });
  });

  describe('setTreatmentPlanProvider', () => {
    it('should set TreatmentPlanProvider', () => {
      service.setTreatmentPlanProvider(mockTreatmentPlanStates);
      expect(service.treatmentProviders).toEqual(mockTreatmentPlanStates);
    });
  });

  describe('setTreatmentPlanCreatedDate', () => {
    it('should set TreatmentPlanCreatedDate with isSelected as true for "All"', () => {
      const result = service.setTreatmentPlanCreatedDate();
      expect(result).toEqual([
        {
          field: 'TreatmentPlanCreatedDate',
          value: 'All',
          key: 'All',
          isVisible: true,
          isSelected: true,
        },
        {
          field: 'TreatmentPlanCreatedDate',
          value: 'From',
          key: 'gte',
          isVisible: true,
          isSelected: false,
        },
        {
          field: 'TreatmentPlanCreatedDate',
          value: 'To',
          key: 'lte',
          isVisible: true,
          isSelected: false,
        },
      ]);
    });
    it('should set TreatmentPlanCreatedDate with isSelected as false for "From" and "To"', () => {
      const result = service.setTreatmentPlanCreatedDate();
      expect(result[1].isSelected).toBeFalsy();
      expect(result[2].isSelected).toBeFalsy();
    });
  });

  describe('isItemSelected', () => {
    it('item is selected for AdditionalIdentifiers', () => {
      const strFilter = 'AdditionalIdentifiers';
      const itemId = '00000000-0000-0000-0000-000000000000';
      service.patientAdditionalIdentifiers = mockInput;
      const result = service.isItemSelected(strFilter, itemId);
      expect(result).toBe(false);
    });

    it('item is selected for TreatmentProviders', () => {
      const strFilter = 'TreatmentProviders';
      const itemId = '00000001-0000-0000-0000-000000000000';
      service.treatmentProviders = mockTreatmentPlanStates;
      const result = service.isItemSelected(strFilter, itemId);
      expect(result).toBe(false);
    });

  });

  describe('setCommonStructure', () => {
    it('should set common structure', () => {
      const dataTarget = 'additionalIdentifiersDiv';
      const divClass = 'additionalIdentifiersDiv';
      const divUl = 'AdditionalIdentifiers';
      const filtrText = 'Additional Identifiers';
      const formArray = mockFormArray;
      const filter = mockAdditionalIdentifiers;
      const result = service.setCommonStructure(dataTarget, divClass, divUl, filtrText, formArray, filter);
      expect(result.dataTarget).toEqual(dataTarget);
      expect(result.divClassId).toEqual(divClass);
      expect(result.divUlId).toEqual(divUl);
      expect(result.filterText).toEqual(filtrText);
      expect(result.formArray).toEqual(mockFormArray);
      expect(result.filter).toEqual(mockAdditionalIdentifiers);
    });
  });

  describe('updateCommonModel', () => {
    it('should update the common model', () => {
      service.updateCommonModel(mockPatientModelsArray[0]);
      const patientModelArray = service.patientModelArray;
      expect(patientModelArray).toContain(mockPatientModelsArray[0]);
    });
  });

  describe('getIndexByText', () => {
    it('should return the index by text', () => {
      service.filterByIndex = mockFilterByIndex;
      const index = mockFilterByIndex[1].index;
      service.getIndexByText(mockFilterByIndex[1].text);
      expect(index).toBe(1);
    });
  });

  describe('initializeDefaultFilters', () => {
    it('should initialize default filters', () => {
      const locationId = 123;
      const result = service.initializeDefaultFilters(locationId);
      expect(result).toEqual(jasmine.objectContaining({
        CurrentPage: 0,
        PageCount: 50,
        FilterCriteria: ({ AppointmentStatusList: [ '' ], BirthMonths: ['-1', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'], HasInsurance: [], IsActive: ['true'], IsPatient: ['true'], LastCommunicationDate: null, LocationId: 123, NextAppointmentDate: null, PatientDateOfBirth: null, PreventiveCareDueDate: null, PatientName: '', PreviousAppointmentDate: null, ResponsiblePartyName: '', TreatmentPlanTotalBalance: '' }),
        SortCriteria: ({ LastCommunicationDate: 0, NextAppointmentDate: 0, PatientDateOfBirth: 0, PatientName: 0, PreventiveCareDueDate: 0, PreviousAppointmentDate: 0, ResponsiblePartyName: 0, TreatmentPlanTotalBalance: 0 })
      }));
    });
  });

  describe('initializeDefaultPreventiveCareFilters', () => {
    it('should initialize default PreventiveCare filters', () => {
      const locationId = 123;
      const result = service.initializeDefaultPreventiveCareFilters(locationId);
      expect(result).toEqual(jasmine.objectContaining({
        CurrentPage: 0, PageCount: 50,
        FilterCriteria: ({ IsActive: ['true'], IsPatient: ['true'], LocationId: 123, PatientName: '', ResponsiblePartyName: '', LastCommunicationDate: null, NextAppointmentDate: '', PatientDateOfBirth: '', PreventiveCareDueDate: '', PreviousAppointmentDate: '', TreatmentPlanTotalBalance: ' ' }),
        SortCriteria: ({ LastCommunicationDate: 0, NextAppointmentDate: 0, PatientDateOfBirth: 0, PatientName: 0, PreventiveCareDueDate: 0, PreviousAppointmentDate: 0, ResponsiblePartyName: 0, TreatmentPlanTotalBalance: 0 }),
      }));
    });
  });

  describe('initializeDefaultTreatmentPlansFilters', () => {
    it('should initialize default TreatmentPlans filters', () => {
      const locationId = 123;
      const result = service.initializeDefaultTreatmentPlansFilters(locationId);
      expect(result).toEqual(jasmine.objectContaining({
        CurrentPage: 0, PageCount: 50, FilterCriteria: Object({ IsActive: ['true'], IsPatient: ['true'], LocationId: 123, PatientName: '', ResponsiblePartyName: '', LastCommunicationDate: null, NextAppointmentDate: '', PatientDateOfBirth: '', PreventiveCareDueDate: '', PreviousAppointmentDate: '', TreatmentPlanTotalBalance: '', PlanCreatedDateRange: ['', ''], TreatmentPlanName: ['', ''] }),
        SortCriteria: Object({ LastCommunicationDate: 0, NextAppointmentDate: 0, PatientDateOfBirth: 0, PatientName: 0, PreventiveCareDueDate: 0, PreviousAppointmentDate: 0, ResponsiblePartyName: 0, TreatmentPlanTotalBalance: 0 }),
      }));
    });
  });
  
  describe('getExpandCollapse', () => {
    it('should return an Observable from getExpandCollapse', () => {
      const result = service.getExpandCollapse();
      expect(result).toBeDefined();
      expect(result.subscribe).toBeDefined();
    });
  });

  describe('setExpandCollapse', () => {
    it('should emit the provided boolean value through the observable', () => {
      const data = true;
      service.setExpandCollapse(data);
      service.getExpandCollapse().subscribe((value) => {
        expect(value).toBe(data);
      });
    });
  });
  
  describe('setClearDateValues', () => {
    it('should set and get clear date values correctly', () => {
      service.setClearDateValues(true);
      service.getClearDateValues().subscribe(data => {
        expect(data).toBe(true);
      });
    });
  });

  describe('isSelectAllOption', () => {
    it('should return true when all items are selected', () => {
      const mockData: PatientFliterCategory<string>[] = [
        { field: 'field', value:"value1", key: '1', isSelected: true },
        { field: 'field', value:"value2", key: '2', isSelected: true },
        { field: 'field', value:"value3", key: '3', isSelected: true },
      ];

      expect(service.isSelectAllOption(mockData)).toBe(true);
    });

    it('should return false when at least one item is not selected', () => {
      const mockData = [
        { field: 'field', value:"value1", key: '1', isSelected: false },
        { field: 'field', value:"value2", key: '2', isSelected: true },
        { field: 'field', value:"value3", key: '3', isSelected: true },
      ];

      expect(service.isSelectAllOption(mockData)).toBe(false);
    });
  });
});