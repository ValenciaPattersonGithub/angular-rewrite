import { CUSTOM_ELEMENTS_SCHEMA, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Search1Pipe } from 'src/@shared/pipes';
import { OrderByFeelistPipe } from '../pipes/order-by-feelist.pipe';
import cloneDeep from 'lodash/cloneDeep';
import { FeeListCrudComponent } from './fee-list-crud.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FeeListDto, FeeListsService, TaxableServiceType } from 'src/@shared/providers/fee-lists.service';
import { FeeListLocationDTO } from 'src/@shared/providers/fee-lists.service';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { BrowserTestingModule } from '@angular/platform-browser/testing';

describe('FeeListCrudComponent', () => {
  let component: FeeListCrudComponent;
  let fixture: ComponentFixture<FeeListCrudComponent>;
  let dummyData;

  let mockFeeListServiceCodes = function (listId, codeId, srvCodeId, fee) {
    let listItem = {
      FeeListServiceCodeId: codeId,
      FeeListId: listId,
      ServiceCodeId: srvCodeId,
      Code: codeId + srvCodeId,
      Description: 'Desc' + srvCodeId,
      CdtCode: 'CdtCode' + codeId,
      ServiceType: 'SrvdType' + codeId,
      Fee: fee,
      NewFee: 0
    };
    return listItem;
  };

  let feeLists = [];
  for (let i = 1; i < 4; i++) {
    feeLists.push({
      Name: "Fee List " + i,
      FeeListId: i,
      ServiceCodes: [{ IsActive: true }, { IsActive: false }]
    });
  }

  let feeListImport: FeeListLocationDTO[] = [];
  for (let i = 1; i < 4; i++) {
    feeListImport.push({
      Name: "Fee List " + i,
      FeeListId: i,
      DraftDate: null,

    });
  }

  let res = {
    Value: feeLists
  };

  //#endregion

  let taxableServiceData = [
    { Id: 1, Name: 'Not A Taxable Service', Order: 1 },
    { Id: 2, Name: 'Provider', Order: 2 },
    { Id: 3, Name: 'Sales and Use', Order: 3 }]

  let mocklocalize = {
    getLocalizedString: () => 'translated text'
  };

  const mockModalFactoryService = {
    CancelModal: jasmine
      .createSpy('ModalFactory.CancelModal')
      .and.returnValue({ then: () => { } })
  };

  let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
  };

  let mockStaticData = {
    TaxableServices: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy()
    })
  };

  let mockFeeListService = {
    access: jasmine.createSpy().and.returnValue([{ view: true, create: true, update: true, delete: true }]),
    getFeeLists: jasmine.createSpy(),
    save: jasmine.createSpy(),
    new: jasmine.createSpy(),
    delete: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue({})
    }),
    deleteDraft: jasmine.createSpy().and.returnValue({
      then: jasmine.createSpy().and.returnValue({})
    }),
    getById: jasmine.createSpy(),
    validateName: jasmine.createSpy().and.returnValue(Promise.resolve(true)),
    validateNameCreate: jasmine.createSpy().and.returnValue(Promise.resolve(true)),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeeListCrudComponent, OrderByFeelistPipe],
      imports: [
        TranslateModule.forRoot(),
        FormsModule,
        HttpClientTestingModule,
        BrowserTestingModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: 'localize', useValue: mocklocalize },
        { provide: 'ModalFactory', useValue: mockModalFactoryService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'StaticData', useValue: mockStaticData },
        { provide: FeeListsService, useValue: mockFeeListService },
        Search1Pipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    dummyData = {
      DataTag: "AAAAAAAO0Ug=",
      DraftDate: null,
      FeeListId: 2,
      Name: "RARTVMQJTEWOZB",
      PublishDate: "2022-08-30T05:33:38.8192973",
      ServiceCodes: [{
        CdtCodeId: "17b87dff-292d-46c1-baa0-b3953a78fa70",
        CdtCodeName: "D9942",
        Code: "D9942",
        DataTag: "AAAAAAAO0y4=",
        Description: "repair and/or reline of occlusal guard",
        Fee: 51,
        FeeListId: 2,
        FeeListServiceCodeId: 1445,
        InactivationDate: null,
        IsActive: true,
        NewFee: 51,
        NewTaxableServiceTypeId: 3,
        ServiceCodeId: "bd00d294-4c6f-445c-9ea2-0020487a73c4",
        ServiceTypeDescription: "Adjunctive General Services",
        ServiceTypeId: "d80667df-df6c-4166-bd4d-75009207eaf2",
        TaxableServiceTypeId: 3,
      },
      {
        CdtCodeId: "17b87dff-292d-46c1-baa0-b3953a78fa70",
        CdtCodeName: "D9942",
        Code: "D9942",
        DataTag: "AAAAAAAO0y4=",
        Description: "repair and/or reline of occlusal guard",
        Fee: 52,
        FeeListId: 2,
        FeeListServiceCodeId: 1445,
        InactivationDate: null,
        IsActive: false,
        NewFee: 52,
        NewTaxableServiceTypeId: 3,
        ServiceCodeId: "bd00d294-4c6f-445c-9ea2-0020487a73c4",
        ServiceTypeDescription: "Adjunctive General Services",
        ServiceTypeId: "d80667df-df6c-4166-bd4d-75009207eaf2",
        TaxableServiceTypeId: 3,
      }],
      BreadCrumbs: [],
      Create: false,
      DataHasChanged: false,
      DraftDataHasChanged: false,
      EditMode: true,
      FeeList: {
        FeeListId: 2,
        Name: 'RARTVMQJTEWOZB',
        PublishDate: '2022-08-30T05:33:38.8192973',
        DraftDate: null,
        ServiceCodes: [{
          CdtCodeId: "17b87dff-292d-46c1-baa0-b3953a78fa70",
          CdtCodeName: "D9942",
          Code: "D9942",
          DataTag: "AAAAAAAO0y4=",
          Description: "repair and/or reline of occlusal guard",
          Fee: 51,
          FeeListId: 2,
          FeeListServiceCodeId: 1445,
          InactivationDate: null,
          IsActive: true,
          NewFee: 51,
          NewTaxableServiceTypeId: 3,
          ServiceCodeId: "bd00d294-4c6f-445c-9ea2-0020487a73c4",
          ServiceTypeDescription: "Adjunctive General Services",
          ServiceTypeId: "d80667df-df6c-4166-bd4d-75009207eaf2",
          TaxableServiceTypeId: 3,
        }]
      },
      backupServiceCodes: [{
        CdtCodeId: "17b87dff-292d-46c1-baa0-b3953a78fa70",
        CdtCodeName: "D9942",
        Code: "D9942",
        DataTag: "AAAAAAAO0y4=",
        Description: "repair and/or reline of occlusal guard",
        Fee: 51,
        FeeListId: 2,
        FeeListServiceCodeId: 1445,
        InactivationDate: null,
        IsActive: true,
        NewFee: 51,
        NewTaxableServiceTypeId: 3,
        ServiceCodeId: "bd00d294-4c6f-445c-9ea2-0020487a73c4",
        ServiceTypeDescription: "Adjunctive General Services",
        ServiceTypeId: "d80667df-df6c-4166-bd4d-75009207eaf2",
        TaxableServiceTypeId: 3,
      },
      {
        CdtCodeId: "17b87dff-292d-46c1-baa0-b3953a78fa70",
        CdtCodeName: "D9942",
        Code: "D9942",
        DataTag: "AAAAAAAO0y4=",
        Description: "repair and/or reline of occlusal guard",
        Fee: 51,
        FeeListId: 2,
        FeeListServiceCodeId: 1445,
        InactivationDate: null,
        IsActive: true,
        NewFee: 51,
        NewTaxableServiceTypeId: 3,
        ServiceCodeId: "bd00d294-4c6f-445c-9ea2-0020487a73c4",
        ServiceTypeDescription: "Adjunctive General Services",
        ServiceTypeId: "d80667df-df6c-4166-bd4d-75009207eaf2",
        TaxableServiceTypeId: 3,
      }],
      backupServiceCodesActiveOnly: null,
      SaveAsDraft: true,
      ViewOnly: false,
      BackupFeeList: {
        FeeListId: 2, Name: 'RARTVMQJTEWOZB', PublishDate: '2022-08-30T05:33:38.8192973',
        DraftDate: null, ServiceCodes: [{
          CdtCodeId: "17b87dff-292d-46c1-baa0-b3953a78fa70",
          CdtCodeName: "D9942",
          Code: "D9942",
          DataTag: "AAAAAAAO0y4=",
          Description: "repair and/or reline of occlusal guard",
          Fee: 51,
          FeeListId: 2,
          FeeListServiceCodeId: 1445,
          InactivationDate: null,
          IsActive: true,
          NewFee: 51,
          NewTaxableServiceTypeId: 3,
          ServiceCodeId: "bd00d294-4c6f-445c-9ea2-0020487a73c4",
          ServiceTypeDescription: "Adjunctive General Services",
          ServiceTypeId: "d80667df-df6c-4166-bd4d-75009207eaf2",
          TaxableServiceTypeId: 3,
        }]
      }
    };
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FeeListCrudComponent);
    component = fixture.componentInstance;
    component.feeListData = dummyData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getTaxableServices', () => {
    it('should set taxableServices when TaxableServices returns a value', () => {
      const mockResponse = {
        Value: taxableServiceData,
      };
      mockStaticData.TaxableServices.and.returnValue(Promise.resolve(mockResponse));
      component.getTaxableServices();
      setTimeout(() => {
        expect(component.taxableServices).toEqual(mockResponse.Value);
      });
    });

    it('should not set taxableServices when TaxableServices does not return a value', () => {
      mockStaticData.TaxableServices.and.returnValue(Promise.resolve(undefined));
      component.getTaxableServices();
      expect(component.taxableServices).toBeUndefined();
    });
  });

  describe('ngOnChanges', () => {
    it('should not update properties when feeListData does not change', () => {
      const mockChanges = {
        feeListData: {
          currentValue: [
            { ServiceCode: 'sc1', IsActive: true },
            { ServiceCode: 'sc2', IsActive: false },
            { ServiceCode: 'sc3', IsActive: true }
          ],
          previousValue: [
            { ServiceCode: 'sc1', IsActive: true },
            { ServiceCode: 'sc2', IsActive: false },
            { ServiceCode: 'sc3', IsActive: true }
          ],
          isFirstChange: () => false,
          firstChange: false
        }
      };

      component.updateByPercentage = 5;
      component.roundResult = false;
      component.ngOnChanges(mockChanges);
      expect(component.updateByPercentage).toBe(5);
      expect(component.roundResult).toBe(false);
    });
  });

  describe('cancelChanges function -> ', () => {
    it('should call parent cancel method if exists ', () => {
      spyOn(component, 'cancel');
      component.cancel = new EventEmitter<FeeListDto>();
      component.cancel.emit = jasmine.createSpy();
      component.cancelChanges();
      expect(component.formIsValid).toBe(true);
      expect(component.cancel.emit).toHaveBeenCalled();
    });
  })
  describe('isRequired function -> ', () => {
    it('should return true when inputFeelist is empty, undefined, or null', () => {
      dummyData.FeeList.Name = '';
      component.feeListData = dummyData;
      expect(component.isRequired()).toBe(true);

      dummyData.FeeList.Name = undefined;
      component.feeListData = dummyData;
      expect(component.isRequired()).toBe(true);

      dummyData.FeeList.Name = null;
      component.feeListData = dummyData;
      expect(component.isRequired()).toBe(true);
    });

    it('should return true when inputFeelist has only whitespace characters', () => {
      dummyData.FeeList.Name = "";
      component.feeListData = dummyData;
      expect(component.isRequired()).toBe(true);
    });

    it('should return true when inputFeelist contains whitespace characters', () => {
      dummyData.FeeList.Name = '  ';
      component.feeListData = dummyData;
      expect(component.isRequired()).toBe(true);
    });

    it('should return false when inputFeelist is not empty and does not contain whitespace characters', () => {
      dummyData.FeeList.Name = 'Valid Name';
      component.feeListData = dummyData
      expect(component.isRequired()).toBe(false);
    });
  })


  describe('close -> ', () => {
    it('should call cancelChanges', () => {
      spyOn(component, 'cancelChanges');
      component.close();
      expect(component.cancelChanges).toHaveBeenCalled();
    });
  });

  describe('cancelListChanges function -> ', () => {
    it('should call CancelModal if dataHasChanged is true', () => {
      component.feeListData.DataHasChanged = true;
      component.cancelListChanges();
      expect(component.editOrViewMode).toBe(false);
      expect(mockModalFactoryService.CancelModal).toHaveBeenCalled();
    });

    it('should call cancel if dataHasChanged is false', () => {
      spyOn(component, 'cancelChanges');
      component.feeListData.DataHasChanged = false;
      component.cancelListChanges();
      expect(component.cancelChanges).toHaveBeenCalled();
    });
  })

  describe('setImportList function', () => {
    beforeEach(() => {
      component.feeLists = feeListImport;
    })
    it('should set listToImport and disableImport when a matching FeeListId is found', () => {
      component.setImportList(2);
      expect(component.listToImport).toEqual({ FeeListId: 2, Name: 'Fee List 2', DraftDate: null });
      expect(component.disableImport).toBe(false);
    });

    it('should set listToImport as undefined and disableImport as true when no matching FeeListId is found', () => {
      component.setImportList(4);
      expect(component.listToImport).toBeUndefined();
      expect(component.disableImport).toBe(true);
    });
  })

  describe('changeFeeList function -> ', () => {
    it('should set scope.feeListData.DataChanged to be undefined', () => {
      component.changeFeeList(component.feeListData);
      const spy = component.changeFeeList = jasmine.createSpy();
      fixture.detectChanges();
      expect(spy).not.toEqual(null);
    });
    it('should set $$MaxFeeError and formIsValid to false when serviceCode.NewFee is less than 0', () => {
      component.feeListData = dummyData;
      component.feeListData.FeeList.ServiceCodes[0].NewFee = -100;
      component.changeFeeList(component.feeListData.FeeList.ServiceCodes[0]);
      expect(component.feeListData.FeeList.ServiceCodes[0].$$MaxFeeError).toBe(true);
      expect(component.formIsValid).toBe(false);
    });
    it('should set $$MaxFeeError and formIsValid to false when serviceCode.NewFee is greater than 999999.99', () => {
      component.feeListData = dummyData;
      component.feeListData.FeeList.ServiceCodes[0].NewFee = 1000000;
      component.changeFeeList(component.feeListData.FeeList.ServiceCodes[0]);
      expect(component.feeListData.FeeList.ServiceCodes[0].$$MaxFeeError).toBe(true);
      expect(component.formIsValid).toBe(false);
    });

  })
  describe('ensureUniqueName function -> ', () => {
    it('should set isInputDuplicate to false if FeeListId is greater than 0', waitForAsync(() => {
      component.feeListData.FeeList.FeeListId = 1;
      mockFeeListService.validateName.and.returnValue(Promise.resolve(true));
      component.ensureUniqueName()
        .then(() => {
          expect(mockFeeListService.validateName).toHaveBeenCalled();
          expect(component.isInputDuplicate).toBe(false);
          expect(component.formIsValid).toBe(true);
        });
    }));

    it('should set isInputDuplicate based on the result of validateNameCreate if FeeListId is 0', waitForAsync(() => {
      component.feeListData.FeeList.FeeListId = 0;

      mockFeeListService.validateNameCreate.and.returnValue(Promise.resolve(true));
      component.ensureUniqueName().then(() => {
        expect(mockFeeListService.validateNameCreate).toHaveBeenCalled();
        expect(component.isInputDuplicate).toBe(false);
        expect(component.formIsValid).toBe(true);
      });
    }));
  })

  describe('saveList function', () => {
    it('should save the fee list and emit saveFeeList', fakeAsync(() => {
      component.feeListData.DataHasChanged = true;
      spyOn(component, 'ensureUniqueName').and.returnValue(Promise.resolve(true));
      spyOn(component, 'validateForm');
      const saveFeeListSpy = jasmine.createSpyObj('saveFeeList', ['emit']);
      component.saveFeeList = saveFeeListSpy;
      component.disableImport = false;
      spyOn(component, 'cancelChanges');
      component.saveList();
      tick();
      expect(component.ensureUniqueName).toHaveBeenCalled();
      expect(component.validateForm).toHaveBeenCalled();
      expect(component.formIsValid).toBe(true);
      expect(saveFeeListSpy.emit).toHaveBeenCalled();
      expect(component.disableImport).toBe(true);
      expect(component.cancelChanges).toHaveBeenCalled();
    }));

    it('should cancel changes if fee list data has not changed', () => {
      dummyData.DataHasChanged = false;
      component.feeListData = dummyData;
      spyOn(component, 'cancelChanges');
      component.saveList();
      expect(component.cancelChanges).toHaveBeenCalled();
    });
  });

  describe('changeSortingForGrid function -> ', () => {
    beforeEach(() => {
      component.orderByFeelist = {
        field: 'Code',
        asc: true
      };
    });

    it('should initialize sort order to asc ', () => {
      expect(component.orderByFeelist.asc).toBe(true);
    });

    it('should change sort order to desc if sort column selected again ', () => {
      expect(component.orderByFeelist.asc).toBe(true);
      component.changeSortingForGrid('Code');
      expect(component.orderByFeelist.asc).toBe(false);
      component.changeSortingForGrid('Code');
      expect(component.orderByFeelist.asc).toBe(true);
    });
  })

  describe('updateFeeList function -> ', () => {
    let feeListMockData = {};
    beforeEach(() => {
      let feeLists = cloneDeep(res.Value);
      let feeList = feeLists[0];
      for (let i = 1; i < 4; i++) {
        let svcCode = mockFeeListServiceCodes(feeList.FeeListId, 'Code' + i, 'ServiceCode' + i, i * 10);
        feeList.ServiceCodes.push(svcCode);
      }

      feeListMockData = {
        SaveAsDraft: true,
        EditMode: false,
        ViewOnly: false,
        Create: false,
        DataHasChanged: true,
        BreadCrumbs: [],
        FeeList: feeList, BackupFeeList: feeList,
        backupServiceCodesActiveOnly: null
      };
      component.feeListData = cloneDeep(feeListMockData);
    });

    it('should call ensureUniqueName if feeListData.DataHasChanged is true', waitForAsync(() => {
      spyOn(component, 'ensureUniqueName').and.callThrough();
      component.updateFeeList(true)
        .then(() => {
          expect(component.feeListData.SaveAsDraft).toBe(true);
          expect(component.ensureUniqueName).toHaveBeenCalled();
        });
    }));

    it('should update fee list and emit saveFeeList', waitForAsync(() => {
      const saveAsDraft = true;
      spyOn(component, 'ensureUniqueName').and.returnValue(Promise.resolve(true));
      spyOn(component, 'validateForm').and.callThrough();
      const saveFeeListSpy = jasmine.createSpyObj('saveFeeList', ['emit']);
      component.saveFeeList = saveFeeListSpy;
      spyOn(component, 'cancelChanges');
      component.updateFeeList(saveAsDraft)
        .then(() => {
          expect(dummyData.SaveAsDraft).toBe(saveAsDraft);
          expect(component.ensureUniqueName).toHaveBeenCalled();
          expect(component.validateForm).toHaveBeenCalled();
          expect(saveFeeListSpy.emit).toHaveBeenCalled();
          expect(component.cancelChanges).toHaveBeenCalled();
          fixture.detectChanges();
        });
    }));

    it('should cancel changes if fee list data has not changed', waitForAsync(() => {
      component.feeListData.SaveAsDraft = false;
      component.feeListData.DataHasChanged = false;
      spyOn(component, 'cancelChanges');
      component.updateFeeList(false)
        .then(() => {
          expect(component.cancelChanges).toHaveBeenCalled();
        });
    }));
  })

  describe('importFeeList function', () => {
    it('should handle the next value in the subscription', fakeAsync(() => {
      const importId = { FeeListId: 2 };
      const forImport = true;
      const mockImportFeeListResponse = {
        Value: {
          DataTag: "AAAAAAAO0Ug=",
          DateModified: "2022-08-30T05:33:38.8192973",
          DraftDate: null,
          FeeListId: 2,
          Name: 'Imported Fee List',
          PublishDate: "2022-08-30T05:33:38.8192973",
          ServiceCodes: [
            { FeeListServiceCodeId: 1, FeeListId: 2, IsActive: true, NewFee: 10.99 },
            { FeeListServiceCodeId: 2, FeeListId: 2, IsActive: true, NewFee: 15.99 }
          ]
        }
      }

      spyOn(component, 'handleFeeListImportSuccess');
      mockFeeListService.getById.and.returnValue(of(mockImportFeeListResponse));
      component.loadingFeeList = true;
      component.importFeeList(importId);
      tick();
      expect(mockFeeListService.getById).toHaveBeenCalledWith(importId.FeeListId, forImport);
      expect(component.handleFeeListImportSuccess).toHaveBeenCalledWith(mockImportFeeListResponse);
      expect(component.loadingFeeList).toBe(false);
    }));
    it('should handle error value in the subscription', fakeAsync(() => {
      const importId = { FeeListId: -1 };
      let errorResponse = new HttpErrorResponse({
        error: 'test 404 error',
        status: 404, statusText: 'Not Found'
      })
      component.loadingFeeList = true;
      spyOn(component, 'handleFeeListImportError');
      mockFeeListService.getById.and.returnValue(throwError(errorResponse));
      component.importFeeList(importId);
      tick();
      expect(component.handleFeeListImportError).toHaveBeenCalled();
    }));
  })

  describe('handleFeeListImportSuccess', () => {
    it('should update fee list and display success toast', fakeAsync(() => {
      const importFeeListResponse = {
        Value: {
          FeeListId: 1,
          Name: 'Mock Fee List',
          PublishDate: new Date('2022-01-01'),
          DraftDate: new Date('2021-12-01'),
          ServiceCodes: [
            {
              FeeListServiceCodeId: 1,
              FeeListId: 1,
              ServiceCodeId: 'SC001',
              CdtCodeId: 'CDT001',
              CdtCodeName: 'CDT Code 1',
              Code: 'CODE001',
              Description: 'Service Code 1',
              ServiceTypeId: 'ST001',
              ServiceTypeDescription: 'Service Type 1',
              Fee: 10.5,
              TaxableServiceTypeId: TaxableServiceType.Provider,
              NewFee: 15.0,
              NewTaxableServiceTypeId: TaxableServiceType.SalesAndUse,
              IsActive: true,
              InactivationDate: null,
              DataTag: "AAAAAAAO0Ug="
            },
            {
              FeeListServiceCodeId: 2,
              FeeListId: 1,
              ServiceCodeId: 'SC002',
              CdtCodeId: 'CDT002',
              CdtCodeName: 'CDT Code 2',
              Code: 'CODE002',
              Description: 'Service Code 2',
              ServiceTypeId: 'ST002',
              ServiceTypeDescription: 'Service Type 2',
              Fee: 20.0,
              TaxableServiceTypeId: TaxableServiceType.SalesAndUse,
              NewFee: 25.0,
              NewTaxableServiceTypeId: TaxableServiceType.Provider,
              IsActive: true,
              InactivationDate: null,
              DataTag: "AAAAAAAO0Ug="
            }
          ],
          DataTag: "AAAAAAAO0Ug="
        }
      };
      component.handleFeeListImportSuccess(importFeeListResponse);
      tick();
      expect(importFeeListResponse.Value.ServiceCodes[0].FeeListId).toBeUndefined();
      expect(importFeeListResponse.Value.ServiceCodes[0].FeeListServiceCodeId).toBeUndefined();
      expect(importFeeListResponse.Value.ServiceCodes[1].FeeListId).toBeUndefined();
      expect(importFeeListResponse.Value.ServiceCodes[1].FeeListServiceCodeId).toBeUndefined();
      expect(component.feeListData.FeeList.Name).toBe('RARTVMQJTEWOZB');
      expect(component.feeListData.FeeList.FeeListId).toBeUndefined();
      expect(component.loadingFeeList).toBe(false);
      expect(component.feeListData.DataHasChanged).toBe(true);
      expect(component.listToImport).toBeNull();
      expect(component.disableImport).toBe(true);
      expect(component.feeListData.FeeList.ServiceCodes[0].NewFee).toBe('15.00');
      expect(component.feeListData.FeeList.ServiceCodes[1].NewFee).toBe('25.00');
      expect(mockToastrFactory.success).toHaveBeenCalled();
      component.filteredServiceCodes$
        .subscribe((serviceCodes) => {
          expect(serviceCodes).toEqual(importFeeListResponse.Value.ServiceCodes.filter(x => x.IsActive == true));
        });
    }));
  });

  describe('handleFeeListImportError function', () => {
    it('should display error', () => {
      component.handleFeeListImportError();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    })
  })

  describe('applyPercentage function -> ', () => {
    it('should do nothing if updatePercentage outside of range -100 to 100', () => {
      component.feeListData.FeeList.ServiceCodes[0].NewFee = 0;
      component.updateByPercentage = 101;
      component.applyPercentage();
      expect(component.feeListData.FeeList.ServiceCodes[0].NewFee).toEqual(0);
    });
    it('should update the fees based on the percentage', () => {
      component.updateByPercentage = 10;
      component.applyPercentage();
      expect(component.feeListData.FeeList.ServiceCodes[0].NewFee).toBe(56);
    });
  })

  describe('filterServiceCodesActiveStatus function -> ', () => {
    it('should set scope.feeListData.FeeList.ServiceCodes based on status', fakeAsync(() => {
      component.showInactive.setValue(false);
      tick();
      component.filteredServiceCodes$
        .pipe(
          take(1)
        )
        .subscribe((serviceCodes) => {
          expect(serviceCodes).toEqual(component.feeListData?.FeeList?.ServiceCodes?.filter(x => x.IsActive == true));
        });
      component.showInactive.setValue(true);
      tick();
      component.filteredServiceCodes$
        .pipe(
          take(1)
        )
        .subscribe((serviceCodes) => {
          expect(serviceCodes).toEqual(component.feeListData?.FeeList?.ServiceCodes);
        });
    }));
  })

  describe('deleteFeelistDraft', () => {
    it('should emit the deleteDraft event', () => {
      spyOn(component.deleteDraft, 'emit');
      component.deleteFeelistDraft();
      expect(component.deleteDraft.emit).toHaveBeenCalled();
    });
  })

  describe('onsearchServiceCodesKeyword', () => {
    it('should filter service codes when search keyword is empty', (done) => {
      component.searchServiceCodesKeyword.setValue('');
      component.filteredServiceCodes$
        .pipe(
          take(1)
        )
        .subscribe((serviceCodes) => {
          expect(serviceCodes).toEqual(component.feeListData?.FeeList?.ServiceCodes?.filter(x => x.IsActive == true));
          done();
        });
    });

    it('should filter service codes based on search keyword', (done) => {
      const searchKeyword = 'repair';
      component.searchServiceCodesKeyword.setValue(searchKeyword);
      const expectedFilteredList = component.searchPipe?.transform(
        component.feeListData?.FeeList?.ServiceCodes?.filter(x => x.IsActive == true),
        { Code: searchKeyword, CdtCodeName: searchKeyword, Description: searchKeyword, ServiceTypeDescription: searchKeyword }
      );
      component.filteredServiceCodes$
        .pipe(
          take(1)
        )
        .subscribe((serviceCodes) => {
          expect(serviceCodes).toEqual(expectedFilteredList);
          done();
        });
    });
  })

  describe('validateForm', () => {
    beforeEach(() => {
      component.feeListData = dummyData;
    })
    it('should set formIsValid to false when isInputRequired is true', () => {
      component.isInputRequired = true;
      component.validateForm();
      expect(component.formIsValid).toBe(false);
    });
    it('should set formIsValid to false when isInputDuplicate is true', () => {
      component.isInputDuplicate = true;
      component.validateForm();
      expect(component.formIsValid).toBe(false);
    });
    it('should set $$MaxFeeError and formIsValid to false when serviceCode.NewFee is less than 0', () => {
      component.feeListData.FeeList.ServiceCodes[0].NewFee = -100;
      component.validateForm();
      expect(component.feeListData.FeeList.ServiceCodes[0].$$MaxFeeError).toBe(true);
      expect(component.formIsValid).toBe(false);
    });
    it('should set $$MaxFeeError and formIsValid to false when serviceCode.NewFee is greater than 999999.99', () => {
      component.feeListData.FeeList.ServiceCodes[0].NewFee = 1000000;
      component.validateForm();
      expect(component.feeListData.FeeList.ServiceCodes[0].$$MaxFeeError).toBe(true);
      expect(component.formIsValid).toBe(false);
    });
    it('should set $$NewTaxableServiceTypeIdError and formIsValid to false when serviceCode.NewTaxableServiceTypeId is not found', () => {
      component.taxableServices = [
        { Id: 1 },
        { Id: 2 }
      ];
      component.validateForm();
      expect(component.feeListData.FeeList.ServiceCodes[0].$$NewTaxableServiceTypeIdError).toBe(true);
      expect(component.formIsValid).toBe(false);
    });
  })

});