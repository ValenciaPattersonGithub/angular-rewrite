import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PracticeProviderSelectorComponent } from './practice-provider-selector.component';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  SimpleChange,
} from '@angular/core';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { FormsModule } from '@angular/forms';
import cloneDeep from 'lodash/cloneDeep';
import { configureTestSuite } from 'src/configure-test-suite';

describe('PracticeProviderSelectorComponent', () => {
  let component: PracticeProviderSelectorComponent;
  let fixture: ComponentFixture<PracticeProviderSelectorComponent>;
  let mockProviderList = [
    {
      ProviderId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
      UserId: 'd46e2bb2-f3f9-41de-b2bd-1a1f7a84438e',
      Name: 'Bob Jones',
      IsPreferred: false,
      Locations: [
        { LocationId: 2, ProviderTypeId: 1 },
        { LocationId: 3, ProviderTypeId: 1 },
      ],
    },
    {
      ProviderId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
      UserId: '43189973-d808-4fd1-a8cc-fabf84c9f18f',
      Name: 'Sid Jones',
      IsPreferred: false,
      Locations: [{ LocationId: 2, ProviderTypeId: 1 }],
    },
    {
      ProviderId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
      UserId: 'ab796156-f6f9-4057-a463-4d4c23a74dca',
      Name: 'Larry Jones',
      IsPreferred: false,
      Locations: [
        { LocationId: 2, ProviderTypeId: 3 },
        { LocationId: 3, ProviderTypeId: 1 },
      ],
    },
    {
      ProviderId: 'eedf5827-6735-4832-9d20-99758df70a8b',
      UserId: 'eedf5827-6735-4832-9d20-99758df70a8b',
      Name: 'Pat Jones',
      IsPreferred: false,
      Locations: [
        { LocationId: 2, ProviderTypeId: 1 },
        { LocationId: 3, ProviderTypeId: 1 },
        { LocationId: 4, ProviderTypeId: 1 },
      ],
    },
    {
      ProviderId: '517ce215-b71b-408f-8b20-62a4c1386f77',
      UserId: '517ce215-b71b-408f-8b20-62a4c1386f77',
      Name: 'Sylvia Jones',
      IsPreferred: false,
      Locations: [{ LocationId: 2, ProviderTypeId: 2 }],
    },
  ];

  const mockreferenceDataService: any = {
    get: function (x) {
      return [];
    },
    entityNames: {
      users: [],
    },
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [PracticeProviderSelectorComponent],
      imports: [FormsModule, DropDownsModule],
      providers: [
        { provide: 'referenceDataService', useValue: mockreferenceDataService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeProviderSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('addDynamicColumnsToProviders function ->', () => {
    it('should add FullName, Name, and ProviderId to list if not there', () => {
      component.allProvidersList = cloneDeep(mockProviderList);

      component.allProvidersList[0].Name = '';
      component.allProvidersList[0].FullName = '';
      component.allProvidersList[0].ProviderId = '';
      component.allProvidersList[0].FirstName = 'Bob';
      component.allProvidersList[0].LastName = 'Smith';
      component.allProvidersList[0].UserId = '1234';
      component.addDynamicColumnsToProviders();
      expect(component.allProvidersList[0].Name).toBe('Bob Smith');
      expect(component.allProvidersList[0].FullName).toBe('Bob Smith');
      expect(component.allProvidersList[0].ProviderId).toBe('1234');
    });
  });

  describe('ngOnInit function ->', () => {
    it('should load providerList', () => {
      component.loadProviders = jasmine.createSpy();
      component.ngOnInit();
      expect(component.loadProviders).toHaveBeenCalled();
    });
  });

  describe('filterProviderListForOnlyActive function ->', () => {
    beforeEach(function () {
      component.allProvidersList = cloneDeep(mockProviderList);
      component.allProvidersList.forEach(provider => {
        provider.IsActive = true;
      });
    });

    it('should filter the providerList for only providers who are active if onlyActive is true ', () => {
      component.onlyActive = true;
      var inactiveProvider = component.allProvidersList[0];
      inactiveProvider.IsActive = false;
      var filteredList = component.filterProviderListForOnlyActive(
        component.allProvidersList
      );
      expect(filteredList.length).toBe(component.allProvidersList.length - 1);
      expect(filteredList).not.toContain(inactiveProvider);
    });

    it('should not filter the providerList for only providers who are active if onlyActive is false ', () => {
      component.onlyActive = false;
      var inactiveProvider = component.allProvidersList[0];
      inactiveProvider.IsActive = false;
      var filteredList = component.filterProviderListForOnlyActive(
        component.allProvidersList
      );
      expect(filteredList.length).toBe(component.allProvidersList.length);
      expect(filteredList).toContain(inactiveProvider);
    });
  });

  describe('filterProviderList function ->', function () {
    beforeEach(function () {
      component.allProvidersList = cloneDeep(mockProviderList);
      component.filteredProviderList = cloneDeep(mockProviderList);
      component.filterProviderListForOnlyActive = jasmine
        .createSpy()
        .and.callFake(function () {
          return component.filteredProviderList;
        });
      component.filterByProviderOnClaimsOnly = jasmine
        .createSpy()
        .and.callFake(function () {
          return component.filteredProviderList;
        });
    });

    it('should call filterProviderListForOnlyActive ', function () {
      component.filterProviderList(component.allProvidersList);
      expect(component.filterProviderListForOnlyActive).toHaveBeenCalledWith(
        component.allProvidersList
      );
    });

    it('should call filterByProviderOnClaimsOnly ', function () {
      component.filterProviderList(component.allProvidersList);
      expect(component.filterByProviderOnClaimsOnly).toHaveBeenCalledWith(
        component.filteredProviderList
      );
    });
  });

  describe('filterByProviderOnClaimsOnly function ->', function () {
    beforeEach(function () {
      component.allProvidersList = cloneDeep(mockProviderList);
      component.allProvidersList.forEach(provider => {
        provider.Locations[0].ProviderOnClaimsRelationship = 1;
      });
    });

    it('should return only providers who have at least one location with ProviderOnClaimsRelationShip set to Self if scope.providerOnClaimsOnly is true', function () {
      component.providerOnClaimsOnly = true;
      component.allProvidersList[0].Locations[0].ProviderOnClaimsRelationship = 0;
      var filteredProviderList = component.filterByProviderOnClaimsOnly(
        component.allProvidersList
      );
      expect(filteredProviderList).not.toContain(component.allProvidersList[0]);
      expect(filteredProviderList.length).toEqual(
        component.allProvidersList.length - 1
      );
    });

    it('should return all providers passed to the method if scope.providerOnClaimsOnly is false', function () {
      component.providerOnClaimsOnly = false;
      var filteredProviderList = component.filterByProviderOnClaimsOnly(
        component.allProvidersList
      );
      expect(filteredProviderList).toEqual(component.allProvidersList);
    });
  });

  describe('sortProviderList function', function () {
    var providerList = [
      { LastName: 'A', IsActive: true },
      { LastName: 'I', IsActive: false },
      { LastName: 'Z', IsActive: true },
      { LastName: 'K', IsActive: false },
      { LastName: 'C', IsActive: true },
      { LastName: 'G', IsActive: false },
    ];

    it('should sort by IsActive & LastName', function () {
      providerList = component.sortProviderList(providerList);
      expect(providerList[0].LastName).toEqual('A');
      expect(providerList[1].LastName).toEqual('C');
      expect(providerList[2].LastName).toEqual('Z');
      expect(providerList[3].LastName).toEqual('G');
      expect(providerList[4].LastName).toEqual('I');
      expect(providerList[5].LastName).toEqual('K');
    });
  });

  describe('ngOnChanges ->', () => {
    let providerId = '000-000-1234';

    beforeEach(() => {
      component.filteredProviderList = [
        { UserId: providerId },
        { UserId: 'Hello-World' },
      ];
    });

    it('should not do anything if this is the first pass', () => {
      var initialProvId = 'Hi-Mom';
      component.selectedProviderId = initialProvId;
      var changes = new SimpleChange(null, providerId, true);

      component.ngOnChanges({ selectedProviderId: changes });

      expect(component.selectedProviderId).toBe(initialProvId);
    });

    it('should set selectedProviderId to null if unable to find provider', () => {
      var initialProvId = 'Hi-Mom';
      component.selectedProviderId = initialProvId;
      var changes = new SimpleChange(initialProvId, providerId, false);

      component.ngOnChanges({ selectedProviderId: changes });

      expect(component.selectedProviderId).toBe(null);
    });

    it('should not set selectedProviderId if valid provider', () => {
      component.selectedProviderId = providerId;
      var changes = new SimpleChange('Hi-Mom', providerId, false);

      component.ngOnChanges({ selectedProviderId: changes });

      expect(component.selectedProviderId).toBe(providerId);
    });
  });
});
