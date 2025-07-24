import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogContainerService, DialogService } from '@progress/kendo-angular-dialog';
import { GridModule } from '@progress/kendo-angular-grid';
import { ConditionsService } from 'src/@shared/providers/conditions.service';
import { AppKendoGridComponent } from '../../../../../@shared/components/app-kendo-grid/app-kendo-grid.component';
import { ConfirmationModalService } from '../../../../../@shared/components/confirmation-modal/confirmation-modal.service';
import { SoarSelectListComponent } from '../../../../../@shared/components/soar-select-list/soar-select-list.component';
import { ConditionsLandingComponent } from './conditions-landing.component';
import { ConditionModel } from './conditions.model';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs';
import { DrawTypesService } from 'src/@shared/providers/drawtypes.service';

describe('ConditionsLandingComponent', () => {
  let component: ConditionsLandingComponent;
  let fixture: ComponentFixture<ConditionsLandingComponent>;
  let listHelper;
  let toastrFactory

  const mockColumns: { field: string, title: string, width: string, hasValidations: boolean, validation: { message: string, maxLength: string } }[] = [
    {
      field: 'Description',
      title: 'Description',
      width: '700',
      hasValidations: true,
      validation: {
        message: 'Description is required.',
        maxLength: '64'
      }
    }
  ];

  let mockRouteParams = {}
  const mockConfirmationModalService = {
    open: jasmine.createSpy().and.returnValue({
      events: {
        pipe: (event) => {
          return {
            type: "confirm",
            subscribe: (success) => {
              success({ type: "confirm" })
            },
            filter: (f) => { return f }
          }
        }
      },
      close: jasmine.createSpy(),
    }),
  };

  let mockdrawTypesList = [
    { AffectedAreaId: 1, AffectedAreaName: "Mouth", DataTag: "AAAAAAAADzM=", DateModified: "2022-01-21T17:33:25.2251733", Description: "test", DrawType: "Static", DrawTypeId: "5ded394f-8089-4385-8832-8aac5b3c727b", GroupNumber: 2, PathLocator: "#three_quarter_crown", PracticeId: 38638, UserModified: "00000000-0000-0000-0000-000000000000" },
    { AffectedAreaId: 2, AffectedAreaName: "Quadrant", DataTag: "AAAAAAAADzM=", DateModified: "2022-01-21T17:33:25.2251733", Description: "test2", DrawType: "Static", DrawTypeId: "5ded394f-8089-4385-8832-8aac5b3c727b", GroupNumber: 2, PathLocator: "#three_quarter_crown", PracticeId: 38638, UserModified: "00000000-0000-0000-0000-000000000000" },
    { AffectedAreaId: 3, AffectedAreaName: "Root", DataTag: "AAAAAAAADzM=", DateModified: "2022-01-21T17:33:25.2251733", Description: "test2", DrawType: "Static", DrawTypeId: "5ded394f-8089-4385-8832-8aac5b3c727b", GroupNumber: 2, PathLocator: "#three_quarter_crown", PracticeId: 38638, UserModified: "00000000-0000-0000-0000-000000000000" },
    { AffectedAreaId: 4, AffectedAreaName: "Surface", DataTag: "AAAAAAAADzM=", DateModified: "2022-01-21T17:33:25.2251733", Description: "test3", DrawType: "Static", DrawTypeId: "5ded394f-8089-4385-8832-8aac5b3c727b", GroupNumber: 1, PathLocator: "#three_quarter_crown", PracticeId: 38638, UserModified: "00000000-0000-0000-0000-000000000000" },
    { AffectedAreaId: 5, AffectedAreaName: "Tooth", DataTag: "AAAAAAAADzM=", DateModified: "2022-01-21T17:33:25.2251733", Description: "test4", DrawType: "Static", DrawTypeId: "5ded394f-8089-4385-8832-8aac5b3c727b", GroupNumber: 2, PathLocator: "#three_quarter_crown", PracticeId: 38638, UserModified: "00000000-0000-0000-0000-000000000000" }
  ];


  let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
    generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
  };

  let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };

  let mockLocalizeService = {
    getLocalizedString: () => 'translated text'
  };


  let mockReferenceService = {
    get: jasmine.createSpy('referenceDataService.get(users)').and.returnValue(mockdrawTypesList),
    entityNames: {
      drawTypes: 'drawTypes'
    },
    forceEntityExecution: jasmine.createSpy().and.returnValue([]),

  };

  let mockAuthZ = {
    generateTitleMessage: () => { return 'Not Allowed' }
  }

  let mockLocation = {
    path: () => ''
  };

  let mockListHelper = {
    findItemByFieldValue: jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue(null),
    findIndexByFieldValue: jasmine.createSpy('listHelper.findIndexByFieldValue').and.returnValue(0)
  };

  let mockSoarConfig = {
    domainUrl: 'https://localhost:35440',
  };

  let mockFeatureFlagService = {
    getOnce$: jasmine.createSpy().and.returnValue(of(false))
  };

  let mockDrawtypesService = {
    getAll: jasmine.createSpy().and.returnValue(of([]).toPromise())
  }

  let mockConditionsService = {
    getAll: () => {
      return {
        then: (success, error) => {
          success(mockConditions),
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
    },
    get: (id: string) => {
      return {
        then: (success, error) => {
          success({ Value: mockConditions[0] }),
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
    },
    delete: (condition: ConditionModel) => {
      return {
        then: (res, error) => {
          res({ Value: condition }),
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
    },
    save: () => {
      return {
        then: (res, error) => {
          res({ Value: mockConditions }),
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
    },
    update: (condition: ConditionModel) => {
      return {
          then: (res, error) => {
              res({ Value: condition }),
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
  };

  const retValue = { $promise: { then: jasmine.createSpy() } };

  const mockStaticDataService = {
    AffectedAreas: () => {
      return {
        then: (callback) => { return callback(mockAffectedAreas); }
      };
    }
  };

  var mockAffectedAreas = {
    Value: [
      { "Id": 1, "Name": "Mouth", "Order": 1 },
      { "Id": 2, "Name": "Quadrant", "Order": 2 },
      { "Id": 3, "Name": "Root", "Order": 3 },
      { "Id": 4, "Name": "Surface", "Order": 4 },
      { "Id": 5, "Name": "Tooth", "Order": 5 }
    ]
  };

  // confirmationModal objects
  const mockConfirmationModalSubscription = {
    subscribe: jasmine.createSpy(),
    unsubscribe: jasmine.createSpy(),
    _subscriptions: jasmine.createSpy(),
    _parentOrParents: jasmine.createSpy(),
    closed: jasmine.createSpy(),
  };

  const mockDialogRef = {
    events: {
      pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy().and.returnValue({ type: 'confirm' }) }),
      // subscribe: jasmine.createSpy(),
      // unsubscribe: jasmine.createSpy(),
    },
    subscribe: jasmine.createSpy(),
    unsubscribe: jasmine.createSpy(),
    _subscriptions: jasmine.createSpy(),
    _parentOrParents: jasmine.createSpy(),
    closed: jasmine.createSpy(),
  };

  let mockConditions = [
    {
      Abbreviation: null,
      AffectedAreaId: 3,
      ConditionId: "c9d43cf6-cd51-4216-a1c8-6300763aecb9",
      DataTag: "AAAAAAAg/FQ=",
      DateModified: "2022-12-31T11:52:38.534119",
      Description: "Blunted Roots",
      DrawTypeId: "1013522d-e533-4aae-a226-3d1bcc95e9cb",
      IconName: "blunted_roots",
      IsDefault: true,
      UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
    },
    {

      Abbreviation: null,
      AffectedAreaId: 3,
      ConditionId: "d340cb25-6735-4a57-ae37-a8240633363f",
      DataTag: "AAAAAAAg/Fg=",
      DateModified: "2022-12-31T12:01:47.5373681",
      Description: "Abscess",
      DrawTypeId: "74281d3a-d274-4306-8873-86b0b4427f2a",
      IconName: "abscess",
      IsDefault: true,
      UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
    }


  ]
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConditionsLandingComponent, AppKendoGridComponent],
      imports: [TranslateModule.forRoot(), GridModule, HttpClientTestingModule],
      providers: [DialogService, DialogContainerService,
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'referenceDataService', useValue: mockReferenceService },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'AuthZService', useValue: mockAuthZ },
        { provide: '$location', useValue: mockLocation },
        { provide: '$routeParams', useValue: mockRouteParams },
        { provide: 'ListHelper', useValue: mockListHelper },
        { provide: 'StaticData', useValue: mockStaticDataService },
        { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
        { provide: ConditionsService, useValue: mockConditionsService },
        { provide: DrawTypesService, useValue: mockDrawtypesService },
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConditionsLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    listHelper = TestBed.get('ListHelper');
    toastrFactory = TestBed.get('toastrFactory');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call all ngoninit methods', async () => {
      spyOn(component, 'initKendoColumns');
      spyOn(component, 'getPageNavigation');
      spyOn(component, 'affectedAreaName');
      await component.ngOnInit();
      component.loading = true;
      expect(component.initKendoColumns).toHaveBeenCalled();
      expect(component.getPageNavigation).toHaveBeenCalled();
      expect(component.affectedAreaName).toHaveBeenCalled();
      expect(mockDrawtypesService.getAll).toHaveBeenCalled();
    });
  });

  describe('ngAfterViewChecked', () => {
    it('should call detect changes', () => {
      const changeDetectorRef = fixture.debugElement.injector.get(ChangeDetectorRef);
      const detectChangesSpy = spyOn(changeDetectorRef.constructor.prototype, 'detectChanges');
      component.ngAfterViewChecked();
      expect(detectChangesSpy).toHaveBeenCalled();
    })
  });

  describe('should call the auth view access -> ', () => {
    it('should get the boolean value', () => {
      const val = component.authViewAccess();
      expect(val).not.toBeNull();
    });
  });

  describe('should call the auth create access -> ', () => {
    it('should get the boolean value', () => {
      const val = component.authCreateAccess();
      expect(val).not.toBeNull();
    });
  });

  describe('should call the auth delete access -> ', () => {
    it('should get the boolean value', () => {
      const val = component.authDeleteAccess();
      expect(val).not.toBeNull();
    });
  });

  describe('should call the auth edit access -> ', () => {
    it('should get the boolean value', () => {
      const val = component.authEditAccess();
      expect(val).not.toBeNull();
    });
  });

  describe('authorization success ->', () => {
    it('should set acess', () => {
      component.authAccess();
      expect(component.hasViewAccess).toBe(true);
      expect(component.hasCreateAccess).toBe(true);
      expect(component.hasDeleteAccess).toBe(true);
      expect(component.hasEditAccess).toBe(true);
    });
  });


  describe('should show a toastr notification in case of no view access -> ', () => {
    it('should trigger the toastr error', () => {
      spyOn(component, 'authViewAccess');
      component.authAccess();
      expect(component.authViewAccess).toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getPageNavigation method -->', () => {
    it('should set the breadCrumbs property', () => {
      component.getPageNavigation();
      expect(component.breadCrumbs).not.toBe(undefined);
    });
  });

  describe("initKendoColumns method -> ", () => {
    it('should initialize kendo columns', () => {
      component.initKendoColumns();
      expect(component.columns).toEqual(mockColumns);
    });
  });

  describe("addNewCondition method -> ", () => {
    it('should be closeDialog  and edit mode false', () => {
      component.addNewCondition();
      expect(component.closeDialog).toBe(false);
      expect(component.editMode).toBe(false);
    });
  });

  describe("deleteConditions method -> ", () => {
    it('should be open delete confirmation modal', () => {
      spyOn(component, 'openDeleteConfirmationModal')
      let event = {
        action: "edit",
        dataItem: mockConditions[0],
        rowIndex: 0
      }
      component.deleteConditions(event);
      expect(component.openDeleteConfirmationModal).toHaveBeenCalledWith(event.dataItem)
    });
  });

  describe('openDeleteConfirmationModal ->', () => {
    it('should open openDeleteConfirmationModal', () => {
      component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
      component.openDeleteConfirmationModal(mockConditions[0]);
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue({
        events: {
          pipe: (event) => {
            return {
              type: "close",
              subscribe: (success) => {
                success({ type: "close" })
              },
              filter: (f) => { return f }
            }
          }
        },
        close: jasmine.createSpy()
      });
      component.openDeleteConfirmationModal(mockConditions[0]);
    })
  });

  describe('confirmDelete -->', () => {
    it('should not set confirmingDelete is false when unautherized to delete', () => {
      spyOn(component, 'deleteConditionSuccess');

      component.confirmDelete(mockConditions[0]);
      expect(component.hasDeleteAccess).toBe(true)
      expect(component.deleteConditionSuccess).toHaveBeenCalled();
    });
    it('should set hasDeleteAccess is false  also call deleteConditionFailure', () => {
      spyOn(component, 'deleteConditionFailure');
      component.confirmDelete(mockConditions[0]);
      component.hasDeleteAccess = false;
      expect(component.deleteConditionFailure).toHaveBeenCalled();
    });
  });

  describe('cancelConditionPopup  ->', () => {
    it('should set closeDialog true', () => {
      component.cancelConditionPopup();
      expect(component.closeDialog).toBe(true)
    });
  });

  describe('affectedAreaChange function ->', () => {
    it('should set draw-type-id to null when affected area selection changes and current draw-type-id is not null but matching record for it is not found in updated filteredDrawTypes list', () => {
      component.drawTypes = [
        { DrawTypeId: "edc35f12-ecb6-442c-99d3-ebb6ea163730", Description: "DrawTypeOne", AffectedAreaId: 5, DrawType: "Static" },
        { DrawTypeId: "cdc35f12-ecb6-555c-99d3-ebb6ea163731", Description: "DrawTypeTwo", AffectedAreaId: 4, DrawType: "Static" },
        { DrawTypeId: "9dc35f12-ecb6-552c-99d3-ebb6ea163730", Description: "DrawTypeThree", AffectedAreaId: 5, DrawType: "Static" },
        { DrawTypeId: "cdc35f12-ecb6-542c-99d3-ebb6ea163732", Description: "DrawTypeFour", AffectedAreaId: 3, DrawType: "Static" }
      ];

      let affectedArea = {
        Id: 5,
      };
      component.editMode = false
      component.soarSelectListComponent = new SoarSelectListComponent();
      component.affectedAreaChange(affectedArea.Id);
      expect(component.condition.DrawTypeId).toBeNull();
      component.affectedAreaChange(false);
      expect(component.condition.DrawTypeId).toBeNull();
    })

    it('should not set draw-type-id to null when affected area selection changes and current draw-type-id is not null and matching record for it is found in updated filteredDrawTypes list', () => {
      component.drawTypes = [
        { DrawTypeId: "edc35f12-ecb6-442c-99d3-ebb6ea163730", Description: "DrawTypeOne", AffectedAreaId: 5, DrawType: "Static" },
        { DrawTypeId: "cdc35f12-ecb6-555c-99d3-ebb6ea163731", Description: "DrawTypeTwo", AffectedAreaId: 4, DrawType: "Static" },
        { DrawTypeId: "9dc35f12-ecb6-552c-99d3-ebb6ea163730", Description: "DrawTypeThree", AffectedAreaId: 5, DrawType: "Static" },
        { DrawTypeId: "cdc35f12-ecb6-542c-99d3-ebb6ea163732", Description: "DrawTypeFour", AffectedAreaId: 3, DrawType: "Static" }
      ];
      component.condition = {
        DrawTypeId: "edc35f12-ecb6-442c-99d3-ebb6ea163730",
        Description: 'a data1',
        AffectedAreaId: 2,
        Abbreviation: null,
        ConditionId: "c9d43cf6-cd51-4216-a1c8-6300763aecb9",
        DataTag: "AAAAAAAg/FQ=",
        DateModified: "2022-12-31T11:52:38.534119",
        IconName: "blunted_roots",
        IsDefault: true,
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        PracticeId: 2
      }
      listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue({
        AffectedAreaId: 5, DrawTypeId: "edc35f12-ecb6-442c-99d3-ebb6ea163730a", Description: 'a data1'
      });
      component.soarSelectListComponent = new SoarSelectListComponent();
      component.editData = true
      component.affectedAreaChange(5);
      expect(component.condition.DrawTypeId).not.toBeNull();
    });
  });

  describe('editCondition  ->', () => {
    it('should set closeDialog false and editMode true', () => {
      let event = {
        action: "edit",
        dataItem: mockConditions[0],
        rowIndex: 0
      };
      component.editCondition(event);
      expect(component.closeDialog).toBe(false);
      expect(component.editMode).toBe(true);
    });
  });

  describe('save condition method ->', function () {
    it('should call the method', function () {
      spyOn(component, 'saveConditionSuccess')
      mockConditionsService.save = jasmine.createSpy().and.returnValue({
        then: (success, failure) => { failure({}), success("") }
      }),
       component.saveCondition();
      expect(component.saveConditionSuccess).toHaveBeenCalled();
    });
  });

  describe('saveConditionSuccess  ->', () => {
    it('should set closeDialog true ', () => {
      let mockConditionsdata = {
        DrawTypeId: "edc35f12-ecb6-442c-99d3-ebb6ea163730",
        Description: 'a data1',
        AffectedAreaId: 2,
        Abbreviation: null,
        ConditionId: "c9d43cf6-cd51-4216-a1c8-6300763aecb9",
        DataTag: "AAAAAAAg/FQ=",
        DateModified: "2022-12-31T11:52:38.534119",
        IconName: "blunted_roots",
        IsDefault: true,
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        PracticeId: 2
      }
      component.saveConditionSuccess(mockConditionsdata);
      expect(component.closeDialog).toBe(true);
    });
  });

  describe('updateCondition ->', () => {
    it('should updateCondition', () => {
      spyOn(component, 'updateConditionSuccess');
      component.updateCondition();
      component.updateConditionSuccess(mockConditions);
      expect(component.updateConditionSuccess).toHaveBeenCalledWith(mockConditions);
    });
  });

  describe('updateConditionSuccess success ->', function () {
    it('should call toastr success and closeDialog is true', () => {
      component.updateConditionSuccess(mockConditions[0]);
      expect(component.closeDialog).toBe(true);
      expect(toastrFactory.success).toHaveBeenCalled();
    });
  });

  describe('updateConditionFailure  ->', function () {
    it('should call toastr error and closeDialog is true', () => {
      component.updateConditionFailure(mockConditions[0]);
      expect(component.closeDialog).toBe(true);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

});