import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DrawTypesLandingComponent } from './draw-types-landing.component';
import { TranslateModule } from '@ngx-translate/core';
import { GridModule } from '@progress/kendo-angular-grid';
import { DialogContainerService, DialogService } from '@progress/kendo-angular-dialog';

import { AppKendoGridComponent } from 'src/@shared/components/app-kendo-grid/app-kendo-grid.component';
import { DrawTypesService } from 'src/@shared/providers/drawtypes.service';
import { of } from 'rxjs';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

describe('DrawTypesLandingComponent', () => {
  let component: DrawTypesLandingComponent;
  let fixture: ComponentFixture<DrawTypesLandingComponent>;
  let toastrFactory;

  //#region mocks
  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text'
  };

  const mocklocation = {
    path: () => ''
  };

  let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
    generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
  };

  let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };

  let mockAuthzService = {
    generateTitleMessage: () => ''
  };

  const mockColumns: { field: string, title: string, width: string }[] = [
    {
      field: 'Description',
      title: 'Description',
      width: '500',
    },
    {
      field: 'AffectedAreaName',
      title: 'Impacts',
      width: '500',
    }
  ];

  const mockState = {
    skip: 0,
    sort: [
      {
        field: "Description",
        dir: "asc",
      },
      {
        field: "AffectedAreaName",
        dir: "asc",
      }
    ],
    filter: {
      logic: "and",
      filters: [
        {
          field: "Description",
          operator: "contains",
          value: ""
        },
        {
          field: "AffectedAreaName",
          operator: "contains",
          value: ""
        }
      ],
    }
  };
  
  const mockFilters = [{
    field: "Description",
    operator: "contains",
    value: ""
  },
  {
    field: "Description",
    operator: "AffectedAreaName",
    value: ""
  }
  ];

  const mockStaticDataService: any = {
    AffectedAreas: () => {
      return {
      then:  (callback) => { return callback(mockAffectedAreas); }
      };
    }
  };

  var mockDrawTypes = [
    { AffectedAreaId: 1, AffectedAreaName: "Mouth", DataTag: "AAAAAAAADzM=", DateModified: "2022-01-21T17:33:25.2251733", Description: "test", DrawType: "Static", DrawTypeId: "5ded394f-8089-4385-8832-8aac5b3c727b", GroupNumber: 2, PathLocator: "#three_quarter_crown", PracticeId: 38638, UserModified: "00000000-0000-0000-0000-000000000000" },
    { AffectedAreaId: 2, AffectedAreaName: "Quadrant", DataTag: "AAAAAAAADzM=", DateModified: "2022-01-21T17:33:25.2251733", Description: "test2", DrawType: "Static", DrawTypeId: "5ded394f-8089-4385-8832-8aac5b3c727b", GroupNumber: 2, PathLocator: "#three_quarter_crown", PracticeId: 38638, UserModified: "00000000-0000-0000-0000-000000000000" },
    { AffectedAreaId: 3, AffectedAreaName: "Root", DataTag: "AAAAAAAADzM=", DateModified: "2022-01-21T17:33:25.2251733", Description: "test2", DrawType: "Static", DrawTypeId: "5ded394f-8089-4385-8832-8aac5b3c727b", GroupNumber: 2, PathLocator: "#three_quarter_crown", PracticeId: 38638, UserModified: "00000000-0000-0000-0000-000000000000" },
    { AffectedAreaId: 4, AffectedAreaName: "Surface", DataTag: "AAAAAAAADzM=", DateModified: "2022-01-21T17:33:25.2251733", Description: "test3", DrawType: "Static", DrawTypeId: "5ded394f-8089-4385-8832-8aac5b3c727b", GroupNumber: 1, PathLocator: "#three_quarter_crown", PracticeId: 38638, UserModified: "00000000-0000-0000-0000-000000000000" },
    { AffectedAreaId: 5, AffectedAreaName: "Tooth", DataTag: "AAAAAAAADzM=", DateModified: "2022-01-21T17:33:25.2251733", Description: "test4", DrawType: "Static", DrawTypeId: "5ded394f-8089-4385-8832-8aac5b3c727b", GroupNumber: 2, PathLocator: "#three_quarter_crown", PracticeId: 38638, UserModified: "00000000-0000-0000-0000-000000000000" }
  ];

  var mockAffectedAreas = {
    Value: [
      { "Id": 1, "Name": "Mouth", "Order": 1 },
      { "Id": 2, "Name": "Quadrant", "Order": 2 },
      { "Id": 3, "Name": "Root", "Order": 3 },
      { "Id": 4, "Name": "Surface", "Order": 4 },
      { "Id": 5, "Name": "Tooth", "Order": 5 }
    ]
  };

  let mockReferenceService = {
    get: jasmine.createSpy('referenceDataService.get(users)').and.returnValue(mockDrawTypes),
    entityNames: {
      drawTypes: 'drawTypes'
    },
    forceEntityExecution: jasmine.createSpy().and.returnValue([]),
  };

  let mockDrawtypesService = {
    getAll: jasmine.createSpy().and.returnValue(of([]).toPromise())
  }

  let mockFeatureFlagService = {
    getOnce$: jasmine.createSpy().and.returnValue(of(false))
  };
  //end region

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DrawTypesLandingComponent, AppKendoGridComponent],
      imports: [TranslateModule.forRoot(), GridModule],
      providers: [
        DialogService, DialogContainerService,
        { provide: '$location', useValue: mocklocation },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'AuthZService', useValue: mockAuthzService },
        { provide: 'StaticData', useValue: mockStaticDataService },
        { provide: DrawTypesService, useValue: mockDrawtypesService },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
        { provide: 'referenceDataService', useValue: mockReferenceService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawTypesLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.columns = mockColumns;
    component.state = mockState;
    component.state.filter.filters = mockFilters;
    component.drawTypes = mockDrawTypes;
    toastrFactory = TestBed.get('toastrFactory');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should call affectedAreaName method if there are changes in drawTypes', () => {
      spyOn(component, 'affectedAreaName');
      const changes = new SimpleChange(null, mockDrawTypes, true);
      component.ngOnChanges({ drawTypes: changes });

      expect(component.affectedAreaName).toHaveBeenCalled();
    });

    it('should do nothing when drawTypes are not changed', () => {
      component.ngOnChanges({});
    });
  });

  describe('ngOnInit ->', () => {
    it('should call getPageNavigation, initKendoColumns, affectedAreaName method ', async () => {
      spyOn(component, 'getPageNavigation');
      spyOn(component, 'initKendoColumns');
      await component.ngOnInit();

      expect(component.getPageNavigation).toHaveBeenCalled();
      expect(component.initKendoColumns).toHaveBeenCalled();
      expect(component.loadingMessageNoResults).not.toBe(undefined);
    });
  });

  describe('authViewAccess method -> ',  () => {
     it('should return boolean variable respective to view rights', () => {
       const val = component.authViewAccess();

       expect(val).toBe(true);
     });
  });

  describe('authAccess ->', () => {
    //UT for this method is not possible as it has window.location.href = '/'; which is causing issue.
  })

  describe('affectedAreaName function -> ', () => {
    it('should get the affectedAreaName value', () => {
      component.affectedAreaName();
      var val = component.drawTypes
      expect(val[0].AffectedAreaName).toEqual('Mouth')
      expect(val[1].AffectedAreaName).toEqual('Quadrant');
      expect(val[2].AffectedAreaName).toEqual('Root');
      expect(val[3].AffectedAreaName).toEqual('Surface');
      expect(val[4].AffectedAreaName).toEqual('Tooth');
    });
  });

  describe('getPageNavigation method -->', () => {
    it('should set the breadCrumbs property', () => {
      component.getPageNavigation();

      expect(component.breadCrumbs).not.toBe(undefined);
    });
  });

  describe('should show a toastr notification in case of no view access -> ', () => {
    //UT for this method is not possible as it has window.location.href = '/'; which is causing issue.
  });

  describe("initKendoColumns method -> ", () => {
    it('should initialize kendo columns', () => {
      component.initKendoColumns();
      expect(component.columns).toEqual(mockColumns);
    });
  });

})

  
