import { Component, Inject, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddEvent, DataStateChangeEvent, EditEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { orderBy, process, SortDescriptor, State } from '@progress/kendo-data-query';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { DiscountType } from './discount-type';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { DiscountTypesService } from 'src/@shared/providers/discount-types.service';
import { SoarResponse } from 'src/@core/models/core/soar-response';

const createFormGroup = dataItem => new FormGroup({
  'DiscountName': new FormControl(dataItem?.DiscountName, [Validators.required, Validators.minLength(1), Validators.maxLength(64)]),
  'DiscountRate': new FormControl(dataItem?.DiscountRate, Validators.compose([Validators.required, Validators.min(1), Validators.max(100)])),
  'IsActive': new FormControl(dataItem?.IsActive, [Validators.required])
});

@Component({
  selector: 'discount-types',
  templateUrl: './discount-types.component.html',
  styleUrls: ['./discount-types.component.scss']
})

export class DiscountTypesComponent implements OnInit {
  loading: boolean = true;
  discountTypes: DiscountType[] = [];
  discountRatedataSource: Array<DiscountType> = [];
  modifiedDiscountType: DiscountType = {};
  breadCrumbs: { name: string, path: string, title: string }[] = [];
  hasViewAccess: boolean = false;
  hasCreateAccess: boolean = false;
  hasDeleteAccess: boolean = false;
  hasEditAccess: boolean = false;
  confirmingEdit: boolean = false;
  formGroup: FormGroup = new FormGroup({});
  editedRowIndex: number;
  showBackButton: boolean = false;
  discountTypeId: string;
  discountNameLength: number;
  discountRateValue: number;
  showInactiveStatusWarning: boolean = false;
  @Input() containerRef: ViewContainerRef;

  // For modal
  confirmationRef: ConfirmationModalOverlayRef;
  confirmationModalSubscription: Subscription;
  confirmationModalData = {
    header: '',
    message: '',
    confirm: '',
    cancel: 'Cancel',
    height: 200,
    width: 350
  }

  // Initial filter descriptor
  public state: State = {
    skip: 0,
    sort: [{
      field: "DiscountName",
      dir: "asc",
    },
    {
      field: "DiscountRate",
      dir: "asc",
    },
    {
      field: "IsActive",
      dir: "asc",
    }],
    filter: {
      logic: "and",
      filters: [{
        field: "DiscountName",
        operator: "contains",
        value: ""
      },
      {
        field: "DiscountRate",
        operator: "eq",
        value: ""
      },
      {
        field: "IsActive",
        operator: "eq",
        value: ""
      }
      ]
    }
  };
  // For sorting
  public sort: SortDescriptor[] = [
    {
      field: "DiscountName",
      dir: "asc",
    },
    {
      field: "DiscountRate",
      dir: "asc",
    },
    {
      field: "IsActive",
      dir: "asc",
    }
  ];


  public gridData: GridDataResult = process(this.discountTypes, this.state);

  private loadDiscountTypes = (discounttypes: DiscountType[]): void => {
    const discountTypes = discounttypes || this.discountTypes;
    this.loadDiscountRates(discountTypes);
    this.gridData = process(discountTypes, this.state);
  }
  private loadDiscountRates = (discountTypes: DiscountType[]): void => {
    for (let i = 0; i < discountTypes.length; i++) {
      discountTypes[i].DiscountRateDisplay = (discountTypes[i]?.DiscountRate * 100).toFixed(2);
    }
    this.discountRatedataSource = discountTypes.filter(
      (discountType, i, arr) => arr.findIndex(t => t.DiscountRate === discountType.DiscountRate) === i
    );
  }

  public dataStateChange = (filterState: DataStateChangeEvent): void => {
    this.state = filterState;
    this.gridData = process(this.discountTypes, this.state);
  }

  getStatus = (IsActive: boolean) => {
    return this.masterListStatus.find(x => x.Value === IsActive);
  }
  noRecordsMessage: string;

  constructor(@Inject('$routeParams') public routeParams,
    @Inject('localize') private localize,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('$location') private location,
    @Inject('AuthZService') private authZ,
    @Inject('$injector') private $injector,
    @Inject('MasterListStatus') private masterListStatus,
    private confirmationModalService: ConfirmationModalService,
    private discountTypesService : DiscountTypesService) {
  }

  ngOnInit(): void {
    this.authAccess();
    this.getPageNavigation();
    this.showBackButton = this.routeParams.subcategory === 'PatientDiscountTypes' ? true : false;
    this.getDiscountTypes();
    this.noRecordsMessage = this.localize.getLocalizedString('No records available');
    //this.loadDiscountTypes(this.discountTypes);
    this.state.filter.filters = [{
      field: "DiscountName",
      operator: "contains",
      value: ""
    }];
  }

  getPageNavigation = () => {
    this.breadCrumbs = [
      {
        name: this.localize.getLocalizedString('Practice Settings'),
        path: '#/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings'
      },
      {
        name: this.localize.getLocalizedString('Discount Types'),
        path: '/BusinessCenter/billing/DiscountTypes/',
        title: 'Discount Types'
      }
    ];
  }

  //#region Authorization
  authViewAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizdsc-view');
  }

  authCreateAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizdsc-add');
  };

  authEditAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizdsc-edit');
  };

  authAccess = () => {
    if (!this.authViewAccess()) {
      this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'), this.localize.getLocalizedString('Not Authorized'));
      this.location.path('/');
    }

    this.hasViewAccess = this.authViewAccess();
    this.hasCreateAccess = this.authCreateAccess();
    this.hasEditAccess = this.authEditAccess();
  }

  getDiscountTypes = () => {
      this.discountTypesService.get().then((res: SoarResponse<Array<DiscountType>>) => {
      this.discountTypesGetSuccess(res);
    }, (error) => {
      this.discountTypesGetFailure();
    });
  }

  discountTypesGetSuccess = (res) => {
    this.loading = false;
    this.discountTypes = res.Value;
    this.loadDiscountRates(this.discountTypes);
    this.gridData = { data: orderBy(this.discountTypes, this.sort), total: this.discountTypes?.length }
    this.updateDiscountTypesAccessRights();
  }

  discountTypesGetFailure = () => {
    this.loading = false;
    this.discountTypes = [];
    this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of discount types. Refresh the page to try again.'), this.localize.getLocalizedString('Error'));
  }

  broadcastChannel = (broadcastType, broadcastPayLoad) => {
    let broadCastService = this.$injector.get('BroadCastService');
    broadCastService.publish({ type: broadcastType, payload: broadcastPayLoad });
  }
  // returns true if DiscountName is same as existing discountname 
  isDuplicateDescription = (modifiedDiscountType: DiscountType) => {
    let item = this.discountTypes.find(x => x?.DiscountName?.toLowerCase() == modifiedDiscountType?.DiscountName?.toLowerCase());
    if (item != null && item.MasterDiscountTypeId != modifiedDiscountType.MasterDiscountTypeId) {
      return true;
    }
    return false;
  }

  sortChange = (sort: SortDescriptor[]): void => {
    if (sort) {
      this.sort = sort;
      this.gridData = { data: orderBy(this.discountTypes, this.sort), total: this.discountTypes?.length }
    }
  }
  //add keys to each discount types to check for edit/delete rights
  updateDiscountTypesAccessRights = () => {
    this.discountTypes = this.discountTypes.map((st) => {
      st = this.updateEditRightsViewModel(st);
      return st;
    });
  }

  //add keys related to edit rights in each discount types
  updateEditRightsViewModel = (discountTypes) => {
    const st = discountTypes;
    if (!this.hasEditAccess) {
      st.disableEdit = true;
      st.editTooltipMessage = this.authZ.generateTitleMessage();
    }
    else {
      st.disableEdit = false;
    }
    return st;
  }

  //end region

  createDiscountType = ({ sender }) => {
    this.closeEditor(sender);
    this.formGroup = createFormGroup({
      'DiscountName': '',
      'DiscountRate': 0,
      'IsActive': true
    });
    sender.addRow(this.formGroup);
  }

  editDiscountType = (event) => {
    this.closeEditor(event?.sender);
    this.discountTypeId = event?.dataItem?.MasterDiscountTypeId;
    this.formGroup = createFormGroup({
      'DiscountName': event?.dataItem?.DiscountName,
      'DiscountRate': parseFloat(event?.dataItem?.DiscountRateDisplay),
      'IsActive': event?.dataItem?.IsActive
    });
    this.editedRowIndex = event?.rowIndex;
    event?.sender.editRow(this.editedRowIndex, this.formGroup);
  }

  onCancel = ({ sender, rowIndex }) => {
    this.closeEditor(sender, rowIndex);
  }

  saveDiscountType = (event) => {
    this.discountNameLength = event?.dataItem?.DiscountName?.length;
    if (event?.isNew) {
      this.addDiscountType(event);
    }
    else {
      this.validateDiscountTypeForUpdate(event);

    }
    this.closeEditor(event?.sender);
  }

  addDiscountType = (event: any) => {
    if (this.authCreateAccess) {
      const newDiscountType = event?.dataItem;
      newDiscountType.DiscountName = this.formGroup?.controls['DiscountName']?.value;
      this.discountNameLength = newDiscountType.DiscountName?.length;
      newDiscountType.DiscountRate = this.formGroup?.controls.DiscountRate?.value / 100;
      this.discountRateValue = newDiscountType.DiscountRate;
      newDiscountType.DiscountRateDisplay = (newDiscountType.DiscountRate * 100).toFixed(2);
      newDiscountType.IsActive = this.formGroup?.controls['IsActive']?.value;
      if (this.isDuplicateDescription(newDiscountType)) {
        this.toastrFactory.error(this.localize.getLocalizedString('A discount type with this name already exists.', newDiscountType.DiscountName));
      }
      else {
        this.discountTypesService.save(newDiscountType).then((res:SoarResponse<DiscountType>) => {
            this.addDiscountTypeSuccess(res?.Value);
          }, (error) => {
            this.addDiscountTypeFailure(error);
          });
      }
    }
  }
  addDiscountTypeSuccess = (discountType) => {
    this.manageDiscountTypeChanges(discountType);
    this.toastrFactory.success(this.localize.getLocalizedString('Discount Type {0} has been created.', [discountType.DiscountName]));
    this.broadcastChannel('discountTypes', { mode: 'add', data: discountType });
    this.getDiscountTypes();
  }

  addDiscountTypeFailure = (error) => {
    this.loading = false;
    error?.data?.InvalidProperties?.forEach((v, k) => {
      if (v?.PropertyName) {
        var property = ': ' + v.PropertyName;
      }
      if (v.PropertyName === "DiscountName" && this.discountNameLength > 64) {
        this.toastrFactory.error(this.localize.getLocalizedString('Discount Name cannot be longer than 64 characters.'),
          this.localize.getLocalizedString('Save Error'));
      }
      if (v.PropertyName === "DiscountRate" && (this.discountRateValue < 0.01 || this.discountRateValue > 1)) {
        this.toastrFactory.error(this.localize.getLocalizedString('Discount Rate must be between 1 and 100.'),
          this.localize.getLocalizedString('Save Error'));
      }
      else {
        this.toastrFactory.error(v.ValidationMessage + '.', this.localize.getLocalizedString('Error') + property);
      }
    });
  }

  manageDiscountTypeChanges = (discountType: DiscountType) => {
    let index = this.discountTypes.find(x => x.MasterDiscountTypeId === discountType?.MasterDiscountTypeId)
    if (Number(index) > -1) {
      this.discountTypes.splice(Number(index), 1, discountType);
    } else {
      this.discountTypes.push(discountType);
    }
  }

  validateDiscountTypeForUpdate = (event: any) => {
    if (this.hasEditAccess) {
      event.dataItem.DiscountName = this.formGroup?.controls.DiscountName?.value;
      if (event.dataItem.DiscountRate != this.formGroup?.value?.DiscountRate) {
          event.dataItem.DiscountRate = this.formGroup?.controls.DiscountRate?.value / 100;
      }
      event.dataItem.DiscountRateDisplay = (event.dataItem.DiscountRate * 100).toFixed(2);

      const discountTypeToUpdate = event.dataItem;
      this.showInactiveStatusWarning = (discountTypeToUpdate.IsActive == true) && (this.formGroup?.controls.IsActive?.value == false);
      if (this.isDuplicateDescription(discountTypeToUpdate)) {
        this.toastrFactory.error(this.localize.getLocalizedString('A discount type with this name already exists.'), discountTypeToUpdate.DiscountName);
      }
      else if (this.showInactiveStatusWarning) {
        this.openUpdateActiveToInactiveConfirm(discountTypeToUpdate, this.formGroup?.controls.IsActive?.value);
      }
      else {
        discountTypeToUpdate.IsActive = this.formGroup?.controls.IsActive?.value;
        this.updateDiscountType(discountTypeToUpdate);
      }
    }
  }

  updateDiscountType = (discountType: DiscountType) => {
    this.discountTypesService.update(discountType).then((res:SoarResponse<DiscountType>) => {
      this.updatePostSuccess(res?.Value);
    }, (error) => {
      this.updatePostFailure(error);
    });
  }

  openUpdateActiveToInactiveConfirm = (discountType: DiscountType, isActive: boolean) => {
    this.confirmationModalData.message = this.localize.getLocalizedString('Inactivating {0} will remove it from all associated patients.', [discountType.DiscountName]);
    this.confirmationModalData.confirm = 'Save';
    const data = this.confirmationModalData;
    this.confirmationRef = this.confirmationModalService.open({ data });

    this.confirmationModalSubscription = this.confirmationRef.events.pipe(
      filter((event) => !!event),
      filter((event) => {
        return event.type === 'confirm' || event.type === 'close';
      }),
      take(1)
    ).subscribe((events) => {
      switch (events.type) {
        case 'confirm':
          this.confirmationRef.close();
          discountType.IsActive = isActive;
          this.updateDiscountType(discountType);
          break;
        case 'close':
          this.confirmationRef.close();
          break;
      }
    });
  }

  closeEditor = (grid, rowIndex = this.editedRowIndex) => {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  updatePostSuccess = (discountType) => {
    this.manageDiscountTypeChanges(discountType);
    this.loading = false;

    const st = this.updateEditRightsViewModel(discountType);

    this.broadcastChannel('discountTypes', { mode: 'update', data: discountType });
    this.toastrFactory.success(this.localize.getLocalizedString('Update successful.'), this.localize.getLocalizedString('Success'));
    this.getDiscountTypes();
  }

  updatePostFailure = (error) => {
    this.loading = false;
    error?.data?.InvalidProperties?.forEach((v, k) => {
      if (v?.PropertyName) {
        var property = ': ' + v.PropertyName;
      }
      if (v.PropertyName === "DiscountName" && this.discountNameLength > 64) {
        this.toastrFactory.error(this.localize.getLocalizedString('Discount Name cannot be longer than 64 characters.'),
          this.localize.getLocalizedString('Update Error'));
      }
      if (v.PropertyName === "DiscountRate" && (this.discountRateValue < 0.01 || this.discountRateValue > 1)) {
        this.toastrFactory.error(this.localize.getLocalizedString('Discount Rate must be between 1 and 100.'),
          this.localize.getLocalizedString('Update Error'));
      }
      else {
        this.toastrFactory.error(v.ValidationMessage + '.', this.localize.getLocalizedString('Error') + property);
      }
    });
  }

}


