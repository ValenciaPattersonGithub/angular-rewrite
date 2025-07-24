import { Component, Inject, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import find from 'lodash/find';
import isUndefined from 'lodash/isUndefined';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, finalize, map, shareReplay, startWith, tap } from 'rxjs/operators';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { Search1Pipe } from 'src/@shared/pipes';
import { FeeListLocationDTO, FeeListDto, FeeListsService, FeeListServiceCodeDto } from 'src/@shared/providers/fee-lists.service';
import { TaxableServices } from 'src/business-center/service-code/service-code-model';

@Component({
  selector: 'fee-list-crud',
  templateUrl: './fee-list-crud.component.html',
  styleUrls: ['./fee-list-crud.component.scss']
})
export class FeeListCrudComponent implements OnInit, OnChanges {
  @Input() editOrViewMode: boolean;
  @Input() feeListData = {
    EditMode: false,
    ViewOnly: false,
    Create: false,
    SaveAsDraft: true,
    BackupFeeList: {
      ServiceCodes: []
    },
    DataHasChanged: false,
    DraftDataHasChanged: false,
    FeeList: {
      ServiceCodes: [],
      FeeListId: 0,
      DraftDate: null,
      Name: null,
    },
  };
  @Input() feeLists: FeeListLocationDTO[];

  @Output() saveFeeList = new EventEmitter<FeeListDto>();
  @Output() deleteDraft = new EventEmitter<FeeListDto>();
  @Output() cancel = new EventEmitter<FeeListDto>();

  private serviceCodes$ = new BehaviorSubject<FeeListServiceCodeDto[]>([]);
  filteredServiceCodes$: Observable<FeeListServiceCodeDto[]>;
  loadingFeeList: boolean = false;


  updateByPercentage: number;
  roundResult: boolean = true;
  disableImport: boolean = true;
  listToImport: FeeListLocationDTO = new FeeListLocationDTO();
  formIsValid: boolean = true;
  taxableServices: TaxableServices[];
  searchServiceCodesKeyword = new FormControl(null);

  showInactive = new FormControl(false);

  newFeeCheck: number;
  isInputDuplicate: boolean = false;
  isInputRequired: boolean = false;

  constructor(
    @Inject('localize') private localize,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('StaticData') private staticData,
    @Inject('ModalFactory') private modalFactory,
    public searchPipe: Search1Pipe,
    private feeListsService: FeeListsService) { }

  ngOnInit(): void {
    this.getTaxableServices();
    this.feeListData?.FeeList?.ServiceCodes?.forEach(x => {
      this.newFeeCheck = x?.NewFee;
      x.NewFee = (x?.NewFee)?.toFixed(2)
    });

    this.serviceCodes$.next(this.feeListData?.FeeList?.ServiceCodes);

    this.filteredServiceCodes$ = combineLatest([
      this.serviceCodes$,
      this.searchServiceCodesKeyword.valueChanges
        .pipe(
          startWith(this.searchServiceCodesKeyword.value),
          distinctUntilChanged()
        ),
      this.showInactive.valueChanges
        .pipe(
          startWith(this.showInactive.value),
          distinctUntilChanged()
        )
    ]).pipe(
      map(([serviceCodes, search, showInactive]) => {
        let filteredServiceCodes = [...serviceCodes];
        if (!showInactive) {
          filteredServiceCodes = filteredServiceCodes.filter(x => x.IsActive == true);
        }
        if (search) {
          filteredServiceCodes = this.searchPipe.transform(filteredServiceCodes,
            { Code: search, CdtCodeName: search, Description: search, ServiceTypeDescription: search });
        }
        return filteredServiceCodes;
      }),
      shareReplay(1)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.feeListData) {
      const nv = changes.data?.currentValue;
      const ov = changes.data?.previousValue;
      if (nv && nv != ov) {
        this.updateByPercentage = 0;
        this.roundResult = true;
      }
      this.serviceCodes$.next(this.feeListData?.FeeList?.ServiceCodes);
    }
  }

  getTaxableServices = () => {
    this.staticData.TaxableServices().then((res) => {
      if (res && res?.Value) {
        this.taxableServices = res?.Value;
      }
    });
  }

  //#region handle cancel button
  close = () => {
    this.cancelChanges();
  }


  cancelChanges = () => {
    this.searchServiceCodesKeyword.setValue(null);
    if (this.cancel) {
      this.formIsValid = true;
      this.cancel?.emit();
      this.listToImport = null;
    }

    this.disableImport = true;
    this.showInactive.setValue(false);
  }

  // confirm cancel if changes
  cancelListChanges = () => {
    if (this.feeListData?.DataHasChanged === true) {
      this.editOrViewMode = false;
      this.modalFactory.CancelModal().then(this.cancelChanges, () => { this.editOrViewMode = true; });
    }
    else {
      this.cancelChanges();
    }
  }

  //#endregion

  //#region
  changeFeeList = (serviceCode, updatedTaxableServiceTypeId?: number) => {
    // Because the selectedItemValueChange event occurs before the model is updated we need to use the event value if provided
    const taxableServiceTypeId = updatedTaxableServiceTypeId ? updatedTaxableServiceTypeId : serviceCode?.NewTaxableServiceTypeId;
    let origServiceCode = this.feeListData?.FeeList?.ServiceCodes?.filter(item => item?.ServiceCodeId === serviceCode?.ServiceCodeId)[0];

    if (serviceCode?.NewFee || serviceCode?.NewTaxableServiceTypeId) {
      let backupCode = this.feeListData?.BackupFeeList?.ServiceCodes?.filter(item => item?.ServiceCodeId === serviceCode?.ServiceCodeId);
      serviceCode.$$Modified = (taxableServiceTypeId !== backupCode[0]?.TaxableServiceTypeId) || (serviceCode?.NewFee != backupCode[0]?.Fee);
      serviceCode.$$DraftModified = (taxableServiceTypeId !== backupCode[0]?.NewTaxableServiceTypeId) || (serviceCode?.NewFee != backupCode[0]?.NewFee);
    }
    // reset $$NewTaxableServiceTypeIdError
    serviceCode.$$NewTaxableServiceTypeIdError = false;
    let taxableService = find(this.taxableServices, { Id: taxableServiceTypeId });
    if (isUndefined(taxableService)) {
      this.formIsValid = false;
      serviceCode.$$NewTaxableServiceTypeIdError = true;
    }
    // reset $$MaxFeeError
    serviceCode.$$MaxFeeError = false;
    if (serviceCode?.NewFee < 0 || serviceCode?.NewFee > 999999.99) {
      this.formIsValid = false;
      serviceCode.$$MaxFeeError = true;
    }

    if (origServiceCode) {
      origServiceCode.NewFee = serviceCode.NewFee;
      origServiceCode.NewTaxableServiceTypeId = taxableServiceTypeId;
      origServiceCode.$$Modified = serviceCode.$$Modified;
      origServiceCode.$$DraftModified = serviceCode.$$DraftModified;
      origServiceCode.$$NewTaxableServiceTypeIdError = serviceCode.$$NewTaxableServiceTypeIdError;
      origServiceCode.$$MaxFeeError = serviceCode.$$MaxFeeError;

      this.feeListData.DataHasChanged = this.feeListData?.FeeList?.ServiceCodes.filter(sc => sc?.$$Modified === true).length > 0;
      this.feeListData.DraftDataHasChanged = this.feeListData?.FeeList?.ServiceCodes.filter(sc => sc.$$DraftModified === true).length > 0;
    }
  }
  //#endregion

  //#region validation
  ensureUniqueName = () => {
    this.formIsValid = true;
    this.isInputDuplicate = false;
    if (this.feeListData?.FeeList?.FeeListId > 0) {
      return this.feeListsService.validateName(this.feeListData.FeeList).then((res) => {
        let isDuplicateName = res === false;
        this.isInputDuplicate = isDuplicateName;
        this.formIsValid = !isDuplicateName;
        return this.formIsValid;
      }, (_error) => {
        this.toastrFactory.error(this.localize.getLocalizedString('Error Validating Unique Name', 'Server Error'))
      });
    }
    return this.feeListsService.validateNameCreate(this.feeListData.FeeList).then((res) => {
      let isDuplicateName = res === false;
      this.isInputDuplicate = isDuplicateName;
      this.formIsValid = !isDuplicateName;
      return this.formIsValid;
    }, (_error) => {
      this.toastrFactory.error(this.localize.getLocalizedString('Error Validating Unique Name', 'Server Error'))
    });
  };


  // validation method
  validateForm = () => {
    this.formIsValid = true;
    if (this.isInputRequired || this.isInputDuplicate) {
      this.formIsValid = false;
    };
    this.feeListData?.FeeList?.ServiceCodes.forEach(
      (serviceCode) => {
        serviceCode.$$MaxFeeError = false;
        if (serviceCode?.NewFee < 0 || serviceCode?.NewFee > 999999.99) {
          this.formIsValid = false;
          serviceCode.$$MaxFeeError = true;
        }
        // ensure that we have a valid NewTaxableServiceTypeId
        serviceCode.$$NewTaxableServiceTypeIdError = false;
        let index = this.taxableServices?.findIndex(sc => sc.Id == serviceCode?.NewTaxableServiceTypeId)
        if (index === -1) {
          this.formIsValid = false;
          serviceCode.$$NewTaxableServiceTypeIdError = true;
        }
      });
    this.serviceCodes$.next(this.feeListData?.FeeList?.ServiceCodes);
  }

  isRequired() {
    let inputFeelist = this.feeListData?.FeeList?.Name;
    if (["", '', undefined, null].includes(inputFeelist))
      return true;
    else if (inputFeelist?.replace(/\s/g, '')?.length == 0 && inputFeelist?.indexOf(" ") >= 0)
      return true;
    else
      return false;
  }

  //#endregion
  //#region crud methods
  saveList = () => {
    if (this.feeListData?.DataHasChanged) {
      return this.ensureUniqueName()
        .then((isValid) => {
          if (isValid) {
            this.validateForm();
            if (this.formIsValid) {
              if (this.saveFeeList) {
                this.saveFeeList?.emit();
                this.disableImport = true;
                this.cancelChanges();
              }
            }
          }
        });
    } else {
      this.cancelChanges();
    }
    return Promise.resolve();
  };

  //#endregion

  // #region - Sorting

  // scope variable that holds ordering details
  orderByFeelist = {
    field: 'Code',
    asc: true
  }

  // function to apply orderBy functionality
  changeSortingForGrid = (field) => {
    let asc = this.orderByFeelist?.field === field ? !this.orderByFeelist?.asc : true;
    this.orderByFeelist = {
      field: field,
      asc: asc
    };
  }

  // #endregion



  //TODO methods
  updateFeeList = (saveAsDraft) => {
    // TODO set column to indicate publish / save as draft
    if (this.feeListData?.DataHasChanged || this.feeListData?.FeeList?.DraftDate) {
      this.feeListData.SaveAsDraft = saveAsDraft;
      return this.ensureUniqueName()
        .then((isValid) => {
          if (isValid) {
            this.validateForm();
            if (this.formIsValid) {
              if (this.saveFeeList) {
                this.saveFeeList?.emit();
                this.cancelChanges();
              }
            }
          }
        });
    } else {
      this.cancelChanges();
    }
    return Promise.resolve();
  }

  //#region Import Fee List

  importFeeList = (importId) => {
    // capture the user entered name of the new fee list and reset the name feeList from on imported list
    this.loadingFeeList = true;
    let forImport = true;
    if (importId) {
      let importFeeList: Observable<SoarResponse<FeeListDto>> = null;
      importFeeList = this.feeListsService.getById(importId.FeeListId, forImport);
      importFeeList
        .pipe(finalize(() => this.loadingFeeList = false))
        .subscribe({
          next: (importFeeListResponse: SoarResponse<FeeListDto>) => this.handleFeeListImportSuccess(importFeeListResponse),
          error: () => this.handleFeeListImportError()
        });
    }
  }


  handleFeeListImportSuccess(importFeeListResponse: SoarResponse<FeeListDto>) {
    importFeeListResponse?.Value?.ServiceCodes.forEach(
      (serviceCode) => {
        delete serviceCode.FeeListId;
        delete serviceCode.FeeListServiceCodeId;
      });
    let feeListName = this.feeListData.FeeList.Name;
    this.feeListData.FeeList = importFeeListResponse?.Value;
    delete this.feeListData.FeeList.FeeListId;
    this.feeListData.FeeList.Name = feeListName;
    this.loadingFeeList = false;
    this.feeListData.DataHasChanged = true;
    this.listToImport = null;
    this.disableImport = true;
    this.feeListData.FeeList.ServiceCodes.forEach(x => {
      x.NewFee = (x.NewFee).toFixed(2).toString()
    });
    this.serviceCodes$.next(this.feeListData?.FeeList?.ServiceCodes);

    this.toastrFactory.success(this.localize.getLocalizedString('Import Successful'),
      this.localize.getLocalizedString('Success'));
  }

  handleFeeListImportError() {
    this.toastrFactory.error(this.localize.getLocalizedString('Error Importing List.'),
      this.localize.getLocalizedString('Server Error'));
  }

  // Disable the import button when there is no selected list to import
  setImportList = (event) => {
    this.listToImport = this.feeLists.find(x => x.FeeListId == parseInt(event));
    if (this.listToImport && (this.listToImport != undefined)) {
      this.disableImport = false;
    } else {
      this.disableImport = true;
    }
  }

  //#endregion

  //#region update by percentage

  applyPercentage = () => {
    let updatePercentage = (parseFloat(this.updateByPercentage?.toString()) / 100.0);
    if (this.updateByPercentage <= 100 && this.updateByPercentage >= -100) {
      this.feeListData?.FeeList?.ServiceCodes?.forEach((serviceCode) => {
        if (serviceCode.Fee > 0) {
          let newFee = serviceCode?.Fee + (serviceCode?.Fee * updatePercentage);
          if (this.roundResult) {
            newFee = Math.round(newFee);
          }
          serviceCode.NewFee = newFee;
          this.changeFeeList(serviceCode);
        }
      });
      this.serviceCodes$.next(this.feeListData?.FeeList?.ServiceCodes);
    }
  }

  //#endregion

  //#region delete draft

  deleteFeelistDraft = () => {
    if (this.deleteDraft) {
      this.deleteDraft?.emit();
    }
  };
}
