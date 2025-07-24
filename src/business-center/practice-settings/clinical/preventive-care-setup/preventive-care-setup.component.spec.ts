import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DialogContainerService, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { PreventiveCareSetupComponent } from './preventive-care-setup.component';
import { AppKendoGridComponent } from 'src/@shared/components/app-kendo-grid/app-kendo-grid.component';
import { BoldTextIfContainsPipe, Search1Pipe } from 'src/@shared/pipes';
import { CellClickEvent, GridModule } from '@progress/kendo-angular-grid';
import { TruncateTextPipe } from 'src/@shared/pipes/truncate/truncate-text.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PreventiveCareService } from 'src/@shared/providers/preventive-care.service';
import { PreventiveLinkedServices } from 'src/business-center/service-code/service-code-model';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { ServiceTypesService } from '../../service-types/service-types.service';

describe('PreventiveCareSetupComponent', () => {
  let component: PreventiveCareSetupComponent;
  let fixture: ComponentFixture<PreventiveCareSetupComponent>;

  let mockServiceTypesList;
  let mockConfirmationModalService;
  let mockAuthzService;
  let mockPatSecurityService;
  let mockToastrFactory;
  let mockReferenceDataService;
  let mockLocation;
  let mockPrevCareItems;
  let mockServiceCodes;
  let mockPreventiveCareService;
  let mockPreventiveLinkedServices;
  let mockCellClick: CellClickEvent;
  let mockDeletedServiceCode;
  let mockFeatureFlagService;
  const mocklocalize = {
      getLocalizedString: () => 'translated text'
  };

    beforeEach(async () => {
    mockServiceTypesList = [
      {
        ServiceTypeId: '00000000-0000-0000-0000-000000000001',
        IsSystemType: false,
        IsAssociatedWithServiceCode: false,
        Description: 'Service Type 1',
      },
      {
        ServiceTypeId: '00000000-0000-0000-0000-000000000002',
        IsSystemType: false,
        IsAssociatedWithServiceCode: false,
        Description: 'Service Type 2'
      },
      {
        ServiceTypeId: '00000000-0000-0000-0000-000000000001',
        IsSystemType: true,
        IsAssociatedWithServiceCode: true,
        Description: 'Service Type 3',
      },
      {
        ServiceTypeId: '00000000-0000-0000-0000-000000000001',
        IsSystemType: false,
        IsAssociatedWithServiceCode: true,
        Description: 'Service Type 3',
      },

    ];

    mockConfirmationModalService = {
      open: jasmine.createSpy().and.returnValue({
        events: {
          pipe: jasmine.createSpy().and.returnValue({
            type: "confirm",
            subscribe: (success) => {
              success({ type: "confirm" })
            },
            filter: (f) => { return f }
          }),
        },
        close: jasmine.createSpy(),
      }),
    };

    mockAuthzService = {
      generateTitleMessage: () => ''
    };

    mockPatSecurityService = {
      IsAuthorizedByAbbreviation: (AccessCode) => {
        if (AccessCode == "soar-biz-bizloc-view" || AccessCode == "soar-biz-bsvct-add" || AccessCode == "soar-biz-bsvct-delete" || AccessCode == "soar-biz-bsvct-edit") {
          return true;
        }
        else {
          return false;
        }

      },
      generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    mockReferenceDataService = {
      get: jasmine.createSpy().and.callFake(function () {
        return mockServiceTypesList;
      }),
      getData: jasmine.createSpy().and.returnValue(Promise.resolve({})),
      entityNames: {
        serviceTypes: 'serviceTypes'
      },
      forceEntityExecution: jasmine.createSpy().and.returnValue([]),
    }

    mockLocation = {
      path: jasmine.createSpy().and.returnValue('/')
    }

    mockPrevCareItems = [{
      DataTag: "AAAAAAAeJvw=",
      DateModified: "2022-11-28T15:13:36.7714453",
      Description: "Exam",
      IsAllowedToBeTrumpService: true,
      Order: 5,
      Frequency: '20',
      PracticeId: 38638,
      PreventiveServiceTypeId: "6ec72852-f227-498a-b964-87c0966f0f88",
      UseFrequencyToSetDueDate: true,
      UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
    },
    {
      DataTag: "AAAAAAAeGj8=",
      DateModified: "2022-11-28T12:31:20.0607333",
      Description: "Fluoride",
      IsAllowedToBeTrumpService: false,
      Order: 1,
      Frequency: '0',
      PracticeId: 38638,
      PreventiveServiceTypeId: "e1e562d8-391f-45ab-85f1-8d7d15892cb1",
      UseFrequencyToSetDueDate: false,
      UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
    }];

    mockServiceCodes = [
      { ServiceCodeId: '1', Description: 'Desc 0A1', Code: '0A1', isChecked: true },
      { ServiceCodeId: '2', Description: 'Desc 0B2', Code: '0B2', isChecked: true },
      { ServiceCodeId: '3', Description: 'Desc 0C3', Code: '0C3', isChecked: true },
      { ServiceCodeId: '4', Description: 'Desc 0D4', Code: '0D4', isChecked: true },
      { ServiceCodeId: '5', Description: 'Desc 0E5', Code: '0E5', isChecked: true },
    ];

    mockPreventiveCareService = {
      accessForServiceCode: jasmine.createSpy(),
      accessForServiceType: jasmine.createSpy(),
      prevCareItems: jasmine.createSpy().and.returnValue(Promise.resolve(mockPrevCareItems)),
      GetPreventiveServicesForServiceCode: (serviceCodeId) => {
        return [{
          DataTag: "DataTag",
          DateModified: "DateModified",
          FailedMessage: "FailedMessage",
          PreventiveServiceId: "1",
          PreventiveServiceTypeId: "PreventiveServiceTypeId",
          ServiceCodeId: "ServiceCodeId",
          UserModified: "",
          Description: "Description"
        }]
      },
      UpdatePreventiveService: jasmine.createSpy().and.returnValue(Promise.resolve({ Value: mockPrevCareItems })),
      GetPreventiveServicesForServiceType: jasmine.createSpy().and.callFake(() => {
        return {
          then(res, error) {
            res({ Value: mockPrevCareItems }),
              error({
                data: {
                  InvalidProperties: [{
                    PropertyName: "Service Code",
                    ValidationMessage: "Not Allowed"
                  }]
                }
              })
          }
        }
      }),
      AddPreventiveServices: jasmine.createSpy().and.returnValue(Promise.resolve({ Value: mockPrevCareItems })),
      RemovePreventiveServiceById: jasmine.createSpy().and.returnValue(Promise.resolve({ Value: mockPrevCareItems }))
    }

    mockPreventiveLinkedServices = [{
      DataTag: '',
      DateModified: '',
      FailedMessage: '',
      PreventiveServiceId: '',
      PreventiveServiceTypeId: '',
      ServiceCodeId: '1',
      UserModified: '',
      Code: '0A1',
      Description: 'Desc 0A1',
      InactivationDate: null,
      IsActive: true
    }, {
      DataTag: '',
      DateModified: '',
      FailedMessage: '',
      PreventiveServiceId: '',
      PreventiveServiceTypeId: '',
      ServiceCodeId: '2',
      UserModified: '',
      Code: '0A1',
      Description: 'Desc 0A1',
      InactivationDate: null,
      IsActive: true
    }]

    mockCellClick = {
      column: '',
      columnIndex: 0,
      dataItem: '',
      isEdited: false,
      originalEvent: '',
      rowIndex: 0,
      sender: null,
      type: null
    }

    mockDeletedServiceCode = {}

    mockFeatureFlagService = {
      getOnce$: jasmine.createSpy().and.returnValue(of(false)),
    }

    await TestBed.configureTestingModule({
      declarations: [PreventiveCareSetupComponent]
    })
      .compileComponents();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PreventiveCareSetupComponent, AppKendoGridComponent, BoldTextIfContainsPipe, TruncateTextPipe],
      imports: [TranslateModule.forRoot(), GridModule, HttpClientTestingModule, FormsModule],
      providers: [DialogService, DialogContainerService,
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: '$location', useValue: mockLocation },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: PreventiveCareService, useValue: mockPreventiveCareService },
        { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
        { provide: DialogRef, useValue: DialogRef },
        { provide: 'referenceDataService', useValue: mockReferenceDataService },
        { provide: 'AuthZService', useValue: mockAuthzService },
        { provide: "localize", useValue: mocklocalize },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
        { provide: ServiceTypesService, useValue: {}},
        Search1Pipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreventiveCareSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.filteredServiceCodesList = mockServiceCodes;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call ngOnInit', () => {
      component.ngOnInit = jasmine.createSpy();
      component.ngOnInit();
      expect(component.ngOnInit).toHaveBeenCalled();
    });

    it('should call the getPageNavigation method ', () => {
      component.getPageNavigation = jasmine.createSpy();
      component.ngOnInit();
      expect(component.getPageNavigation).toHaveBeenCalled();
    });

    it('should call the loadPreventiveCareServicesGrid method ', () => {
      component.loadPreventiveCareServicesGrid = jasmine.createSpy();
      component.ngOnInit();
      expect(component.loadPreventiveCareServicesGrid).toHaveBeenCalled();
    });
  });

  describe('loadPreventiveCareServicesGrid ->', () => {
    it('should sort preventiveCareServicesList', () => {
      const spy = component.loadPreventiveCareServicesGrid = jasmine.createSpy();
      component.preventiveCareServicesList = mockPrevCareItems;
      spyOn(component.preventiveCareServicesList, 'sort');
      component.loadPreventiveCareServicesGrid();
      expect(spy).toHaveBeenCalled();
    });

    it('should expect function to return 0', () => {
      const spy = component.loadPreventiveCareServicesGrid = jasmine.createSpy();
      mockPrevCareItems[0].Order = 1;
      mockPrevCareItems[1].Order = 1;
      component.preventiveCareServicesList = mockPrevCareItems;
      spyOn(component.preventiveCareServicesList, 'sort');
      component.loadPreventiveCareServicesGrid();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('cellClickHandler ->', () => {
    it('should call cellClickHandler', () => {
      component.cellClickHandler(mockCellClick);
      expect(component.frequencyValidationMessage).toBe(false);
    });
  });

  describe('setDueDateToFrequency ->', () => {
    it('should call setDueDateToFrequency', () => {
      component.updatePreventiveCareItem = jasmine.createSpy();
      component.setDueDateToFrequency(mockPrevCareItems[0]);
      expect(component.updatePreventiveCareItem).toHaveBeenCalled();
    });
  });

  describe('getFrequencyValidation ->', () => {
    it('should set frequencyValidationMessage to false', () => {
      component.getFrequencyValidation(mockPrevCareItems[0]);
      expect(component.frequencyValidationMessage).toBe(false);
    });

    it('should set frequencyValidationMessage to true', () => {
      mockPrevCareItems[0].Frequency = '-1';
      component.getFrequencyValidation(mockPrevCareItems[0]);
      expect(component.frequencyValidationMessage).toBe(true);
    });
  });

  describe('onChangeFrequency ->', () => {
    it('should call onChangeFrequency', () => {
      component.onChangeFrequency(mockPrevCareItems[0]);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.onChangeFrequency).toHaveBeenCalled();
      });
    });

    it('should set frequencyValidationMessage to true when frequency gretaer then 120', () => {
      mockPrevCareItems[0].Frequency = '121';
      component.onChangeFrequency(mockPrevCareItems[0]);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.frequencyValidationMessage).toBe(true);
      });
    });

    it('should set frequencyValidationMessage to false when frequency less then 0', () => {
      mockPrevCareItems[0].Frequency = '119';
      component.onChangeFrequency(mockPrevCareItems[0]);
      fixture.whenStable().then(() => {
        expect(component.frequencyValidationMessage).toBe(false);
        expect(component.updatePreventiveCareItem).toHaveBeenCalledWith(mockPrevCareItems[0]);
      });
    });
  });

  describe('updatePreventiveCareItem ->', () => {
    it('should call method updatePreventiveCareItem', () => {
      component.authAccessServiceType = { Create: false, Delete: false, Edit: true, View: false };
      component.updatePreventiveCareItem(mockPrevCareItems[0]);
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.updatePreventiveCareItem).toHaveBeenCalled();
        expect(component.updatePreventiveServiceGotSuccess).toHaveBeenCalled();
      })
    });
  });



  describe('updatePreventiveServiceGotSuccess ->', () => {
    it('should update data', () => {
      component.preventiveCareServicesList = mockPrevCareItems;
      component.updatePreventiveServiceGotSuccess(mockPrevCareItems);
      for (let i = 0; i < component.preventiveCareServicesList.length; i++) {
        if (component.preventiveCareServicesList[i].PreventiveServiceTypeId == mockPrevCareItems[i].PreventiveServiceTypeId) {
          component.preventiveCareServicesList[i].DataTag = mockPrevCareItems[i].DataTag;
          component.preventiveCareServicesList[i].DateModified = mockPrevCareItems[i].DateModified;
          component.preventiveCareServicesList[i].Frequency = mockPrevCareItems[i].Frequency;
          component.preventiveCareServicesList[i].UseFrequencyToSetDueDate = mockPrevCareItems[i].UseFrequencyToSetDueDate;
        }
        expect(component.preventiveCareServicesList[i].DataTag).toBe(mockPrevCareItems[i].DataTag);
        expect(component.preventiveCareServicesList[i].DateModified).toBe(mockPrevCareItems[i].DateModified);
        expect(component.preventiveCareServicesList[i].Frequency).toBe(mockPrevCareItems[i].Frequency);
        expect(component.preventiveCareServicesList[i].UseFrequencyToSetDueDate).toBe(mockPrevCareItems[i].UseFrequencyToSetDueDate);
      }
    });
  });

  describe('expandServiceRow ->', () => {
    it('should call method closeServiceRow', () => {
      component.closeServiceRow = jasmine.createSpy();
      component.activeRowIndex = 0;
      component.serviceCodes = mockServiceCodes;
      component.selectedPreventiveCareServiceId = "5ec72852-f227-498a-b964-87c0966f0f88";
      component.expandServiceRow(mockPrevCareItems[0], 1);
      expect(component.closeServiceRow).not.toHaveBeenCalled();
    });
  });

  describe('closeServiceRow ->', () => {
    it('should call preventiveGrid.closeServiceRow', () => {
      component.preventiveGrid.collapseRow = jasmine.createSpy();
      component.activeRowIndex = 1;
      component.closeServiceRow();
      expect(component.selectedPreventiveCareServiceName).toBe('');
      expect(component.selectedPreventiveCareServiceId).toBe(null);
      expect(component.activePrevCareItem).toBe(false);
      expect(component.preventiveGrid.collapseRow).toHaveBeenCalledWith(1);
    });
  });

  describe('loadServiceCodes ->', () => {
    it('should set loadingPreventiveCareLinkedServiceCodes to true', () => {
      component.selectedPreventiveCareServiceId = '6ec72852-f227-498a-b964-87c0966f0f88';
      component.serviceCodes = mockServiceCodes;
      component.authAccessServiceCode = { Create: false, Delete: false, Edit: false, View: true };
      component.loadServiceCodes(true);
      fixture.whenStable().then(() => {
        expect(mockPreventiveCareService.GetPreventiveServicesForServiceType).toHaveBeenCalled();
        expect(component.loadServiceCodesGetSuccess).toHaveBeenCalledWith(mockPrevCareItems[0]);
      });
    });
  });

  describe('loadServiceCodesGetFailure ->', () => {
    it('should set loadingPreventiveCareLinkedServiceCodes to false', () => {
      component.loadServiceCodesGetFailure();
      expect(component.loadingPreventiveCareLinkedServiceCodes).toBe(false)
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('loadServiceCodesGetSuccess ->', () => {
    it('should set preventiveCareLinkedServiceCodeList to mockPrevItems', () => {
      component.preventiveCareLinkedServiceCodeList = mockPreventiveLinkedServices;
      component.serviceCodes = mockServiceCodes;
      component.loadServiceCodesGetSuccess(mockPreventiveLinkedServices);
      fixture.whenStable().then(() => {
        component.preventiveCareLinkedServiceCodeList.forEach((linkedService) => {
          const serviceCode = mockServiceCodes.find(p => p.ServiceCodeId == linkedService.ServiceCodeId);
          if (serviceCode) {
            linkedService.Code = serviceCode.Code;
            linkedService.Description = serviceCode.Description;
          }
          expect(component.preventiveCareLinkedServiceCodeList).toBe(mockPreventiveLinkedServices);
          expect(linkedService.Code).toBe(serviceCode.Code);
          expect(linkedService.Description).toBe(serviceCode.Description);
        });
      });
    });
  });

  describe('filterServiceTypeList ->', () => {
    it('should set filteredServiceCodesList on the basis of showInactive true', () => {
      component.showInactive = true;
      component.serviceCodes = mockServiceCodes;
      component.filterServiceTypeList();
      expect(component.filteredServiceCodesList.length).toBe(5);
    });

    it('should set filteredServiceCodesList on the basis of showInactive false', () => {
      component.showInactive = false;
      component.serviceCodes = mockServiceCodes;
      component.filterServiceTypeList();
      expect(component.filteredServiceCodesList.length).toBe(0);
    });

    it('should set filteredServiceCodesList on the basis of selectedServiceType true', () => {
      component.selectedServiceType = 'true';
      component.showInactive = true;
      component.serviceCodes = mockServiceCodes;
      component.filterServiceTypeList();
      expect(component.filteredServiceCodesList.length).toBe(0);
    });

    it('should set filteredServiceCodesList on the basis of searchServiceCodesKeyword true', () => {
      component.searchServiceCodesKeyword = 'true';
      component.preventiveCareLinkedServiceCodeList = mockPreventiveLinkedServices;
      component.showInactive = true;
      component.serviceCodes = mockServiceCodes;
      component.filterServiceTypeList();
      expect(component.filteredServiceCodesList.length).toBe(0);
    });

    it('should splice element from clonedOfFilteredServiceCodesList', () => {
      component.preventiveCareLinkedServiceCodeList = mockPreventiveLinkedServices;
      component.showInactive = true;
      component.serviceCodes = mockServiceCodes;
      component.filterServiceTypeList();
      component.filteredServiceCodesList.filter(serviceCode => {
        component.preventiveCareLinkedServiceCodeList.forEach((linkedServiceCode) => {
          if (linkedServiceCode.ServiceCodeId == serviceCode.ServiceCodeId) {
            const indx = 0;
            component.filteredServiceCodesList.splice(indx, 1);
          }
        })
      });
      expect(component.filteredServiceCodesList.length).toBe(3);
    });
  });

  describe('selectServiceTypeFilter ->', () => {
    it('should call method selectServiceTypeFilter', () => {
      component.showInactive = true;
      component.searchServiceCodesKeyword = 'true';
      component.serviceCodes = mockServiceCodes;
      component.selectServiceTypeFilter('6ec72852-f227-498a-b964-87c0966f0f88');
      expect(component.selectedServiceType).toBe('6ec72852-f227-498a-b964-87c0966f0f88');
    });
  });

  describe('toggleShowInactive ->', () => {
    it('should call method toggleShowInactive', () => {
      component.filterServiceTypeList = jasmine.createSpy();
      const event = { target: { checked: true } };
      component.serviceCodes = mockServiceCodes;
      component.toggleShowInactive(event);
      expect(component.filterServiceTypeList).toHaveBeenCalled();
    });
  });

  describe('onSearchServiceCodesKeywordChange ->', () => {
    it('should call method onSearchServiceCodesKeywordChange', () => {
      component.filterServiceTypeList = jasmine.createSpy();
      component.serviceCodes = mockServiceCodes;
      component.showInactive = true;
      component.onSearchServiceCodesKeywordChange();
      expect(component.filterServiceTypeList).toHaveBeenCalled();
    });
  });

  describe('onServiceCodesListSorting ->', () => {
    it('should set serviceCodesSorting.asc to false or true when column name matches', () => {
      component.serviceCodesSorting.columnName = 'Description'
      component.serviceCodesSorting.asc = true;
      component.onServiceCodesListSorting('Description');
      expect(component.serviceCodesSorting.asc).toBe(false);
    });

    it('should set serviceCodesSorting.asc to true when column name not matches', () => {
      component.serviceCodesSorting.columnName = 'Description'
      component.onServiceCodesListSorting('Code');
      expect(component.serviceCodesSorting.asc).toBe(true);
    });
  });

  describe('serviceCodesListSorting ->', () => {
    it('should return true if column name passed', () => {
      component.serviceCodesSorting.columnName = 'Description'
      component.serviceCodesListSorting();
      expect(component.serviceCodesSorting.asc).toBe(true);
    });
  });

  describe('removePreventiveServiceGetSuccess ->', () => {
    it('should call removePreventiveServiceGetSuccess', () => {
      component.loadServiceCodes = jasmine.createSpy();
      component.removePreventiveServiceGetSuccess();
      expect(component.loadServiceCodes).toHaveBeenCalled();
    });
  });


  describe('addServiceCodesToPrevGotSuccess ->', () => {
    it('should call addServiceCodesToPrevGotSuccess', () => {
      component.loadServiceCodes = jasmine.createSpy();
      component.filteredServiceCodesList = mockServiceCodes;
      component.addServiceCodesToPrevGotSuccess();
      expect(component.loadServiceCodes).toHaveBeenCalled();
    });
  });

  describe('addServiceCodesToPrev ->', () => {
    it('should set selectedCodes when selectedServiceCode is provided', () => {
      component.authAccessServiceCode = { Create: true, Delete: false, Edit: false, View: false };
      component.selectedPreventiveCareServiceId = '';
      component.addServiceCodesToPrev(mockServiceCodes[0]);
      expect(mockPreventiveCareService.AddPreventiveServices).toHaveBeenCalled();
    });

    it('should set selectedCodes to [] when selectedServiceCode is null', () => {
      // NG15CLEANUP added authAccessServiceCode setup to this test to make it pass.
      component.authAccessServiceCode = { Create: true, Delete: false, Edit: false, View: false };
      component.selectedPreventiveCareServiceId = '';
      component.filteredServiceCodesList = mockServiceCodes;
      component.addServiceCodesToPrev(null);
      expect(mockPreventiveCareService.AddPreventiveServices).toHaveBeenCalled();
    });
  });

  describe('removeSrvcCode ->', () => {
    it('should call removeSrvcCode', () => {
      component.removeSrvcCode('', mockDeletedServiceCode);
      expect(mockConfirmationModalService.open).toHaveBeenCalled();
    });

    it('should call RemovePreventiveServiceById', () => {
      component.authAccessServiceCode = { Create: false, Delete: true, Edit: false, View: false };
      component.selectedPreventiveCareServiceId = '';
      component.removeSrvcCode('', mockDeletedServiceCode);
      expect(mockPreventiveCareService.RemovePreventiveServiceById).toHaveBeenCalled();
    });
  });
});
