import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { BankAccountRequest, locationList, Row } from './bank-account';
import { BankAccountService } from './bank-account.service';
import { filter, take } from 'rxjs/operators';
import {
  orderBy,
  process,
  SortDescriptor,
  State,
} from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Observable, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { LocationTimeService } from 'src/practices/common/providers';
@Component({
  selector: 'bank-accounts',
  templateUrl: './bank-accounts.component.html',
  styleUrls: ['./bank-accounts.component.scss'],
})
export class BankAccountsComponent implements OnInit {
  constructor(
    @Inject('localize') private localize,
    @Inject('patSecurityService') private patSecurityService,
    @Inject('toastrFactory') private toastrFactory,
    @Inject('$location') private $location,
    @Inject('AuthZService') private authZ,
    @Inject('LocationServices') private locationServices,
    @Inject('SoarConfig') private soarConfig,
    private httpClient: HttpClient,
    private bankAccountService: BankAccountService,
    private dialogService: DialogService,
    private fb: FormBuilder,
    private confirmationModalService: ConfirmationModalService,
    private locationTimeService:LocationTimeService
  ) {}

  @ViewChild('templateRef') templateElement: TemplateRef<NgTemplateOutlet>;
  public dialog: DialogRef;
  bankAccounts = [];
  columns: { field: string; title: string; width: string }[] = [];
  breadCrumbs: { name: string; path: string; title: string }[] = [];
  hasViewAccess = false;
  hasCreateAccess = false;
  hasDeleteAccess = false;
  hasEditAccess = false;
  loading = true;
  request: BankAccountRequest;
  kendoRowData;
  editedRowIndex: number;
  modalMode: string;
  isEditBank: boolean;
  fadeIn = false;
  fadeOut = false;
  sortable = true;
  subscriptions: Subscription[] = [];
  ifLocationsUpdated = false;
  // For sorting
  public sort: SortDescriptor[] = [
    {
      field: 'Name',
      dir: 'asc',
    },
  ];
  state: State = {
    sort: [
      {
        field: 'Name',
        dir: 'asc',
      },
    ],
  };

  public gridData: GridDataResult = process(this.bankAccounts, this.state);

  //--------Add Edit Modal Pop-Up properties
  public bankAccountForm: FormGroup;
  locationsList: Array<locationList>;
  selectedLocationsList: Array<locationList>;
  selectedBankAccount: Row;
  isActive: boolean;
  loadingLocations: boolean;

  cancelConformationModal: {
    header: string;
    message: string;
    confirm: string;
    cancel: string;
    height: number;
    width: number;
  } = {
    header: this.localize.getLocalizedString('Discard'),
    message: this.localize.getLocalizedString(
      'Are you sure you want to discard these changes?'
    ),
    confirm: 'Yes',
    cancel: 'No',
    height: 200,
    width: 550,
  };
  cancelConformationRef: ConfirmationModalOverlayRef;
  cancelConformationRefSubscription: Subscription;
  ifBankAccountUpdated = false;
  bankAccountLoctionsIdsPendingToLoad: Array<string>;
  savingBankAccount = false;

  ngOnInit(): void {
    this.initKendoColumns();
    this.initRequest();
    this.getPageNavigation();
    this.getBankAccounts(this.request);
    this.authAccess();
    this.getLocation();
  }

  getPageNavigation = () => {
    this.breadCrumbs = [
      {
        name: this.localize.getLocalizedString('Practice Settings'),
        path: '#/BusinessCenter/PracticeSettings/',
        title: 'Practice Settings',
      },
      {
        name: this.localize.getLocalizedString('Bank Accounts'),
        path: '/BusinessCenter/BankAccounts/',
        title: 'Bank Accounts',
      },
    ];
  };

  authCreateAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation(
      'soar-biz-banks-add'
    ) as boolean;
  };

  authEditAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation(
      'soar-biz-banks-add'
    ) as boolean;
  };

  authViewAccess = () => {
    return this.patSecurityService.IsAuthorizedByAbbreviation(
      'soar-biz-banks-view'
    ) as boolean;
  };

  authAccess = () => {
    if (!this.authViewAccess()) {
      this.toastrFactory.error(
        this.localize.getLocalizedString(
          'User is not authorized to access this area.'
        ),
        this.localize.getLocalizedString('Not Authorized')
      );
      this.$location.path('/');
    } else {
      this.hasViewAccess = this.authViewAccess();
      this.hasCreateAccess = this.authCreateAccess();
      this.hasEditAccess = this.authEditAccess();
    }
  };
  // Get list of all bank accounts
  getBankAccounts = filter => {
    this.bankAccountService
      .getBankAccounts(filter)
      .pipe(take(1))
      .subscribe(
        data => {
          this.loading = false;
          if (data?.Value) {
            this.bankAccounts = data?.Value?.Rows;
            this.gridData = {
              data: orderBy(this.bankAccounts, this.sort),
              total: this.bankAccounts?.length,
            };
            this.updateGroupTypesAccessRights();
          }
        },
        error => {}
      );
  };

  //add keys to each bank accounts to check for edit/delete rights
  updateGroupTypesAccessRights = () => {
    this.bankAccounts = this.bankAccounts.map(st => {
      st = this.updateEditRightsViewModel(st);
      return st as Row;
    });
  };
  //add keys related to edit rights in each bank accounts
  updateEditRightsViewModel = bankAccount => {
    const st = bankAccount;
    if (!this.hasEditAccess) {
      st.disableEdit = true;
      st.editTooltipMessage = this.authZ.generateTitleMessage();
    } else {
      st.disableEdit = false;
    }
    return st as Row;
  };
  //kendo columns
  initKendoColumns() {
    this.columns = [
      {
        field: 'Name',
        title: 'Bank Account',
        width: '200',
      },
      {
        field: 'Locations',
        title: 'Location',
        width: '175',
      },
      {
        field: 'Institution',
        title: 'Institution',
        width: '175',
      },
      {
        field: 'Description',
        title: 'Description',
        width: '175',
      },
      {
        field: 'AccountNumber',
        title: 'Account Number',
        width: '175',
      },
      {
        field: 'RoutingNumber',
        title: 'Routing Number',
        width: '150',
      },
    ];
  }

  sortChange = (sort: SortDescriptor[]): void => {
    if (sort) {
      this.sort = sort;
      this.gridData = {
        data: orderBy(this.bankAccounts, this.sort),
        total: this.bankAccounts?.length,
      };
    }
  };
  onCheckChanged = event => {
    this.loading = true;
    this.request.FilterCriteria.InActive = event?.target?.checked;
    this.getBankAccounts(this.request);
  };

  initRequest = () => {
    this.request = {
      uiSuppressModal: true,
      PageCount: 50,
      CurrentPage: 0,
      FilterCriteria: {
        Name: '',
        Locations: '',
        Institution: '',
        Description: '',
        AccountNumber: '',
        RoutingNumber: '',
        BankAccountId: '',
        LocationId: null,
        InActive: false,
      },
      SortCriteria: {
        Name: 0,
        Locations: 0,
        Institution: 0,
        Description: 0,
        AccountNumber: 0,
        RoutingNumber: 0,
        BankAccountId: 0,
      },
    };
  };

  editHandler = event => {
    this.ifLocationsUpdated = false;
    this.savingBankAccount = false;
    this.bankAccountLoctionsIdsPendingToLoad = new Array<string>();
    this.selectedLocationsList = new Array<locationList>();
    if (event !== undefined && event !== null) {
      this.modalMode = this.localize.getLocalizedString('Edit a Bank Account');
      const bankAccount = event?.dataItem;
      if (bankAccount) {
        const locationsIds = event?.dataItem?.BankLocations;
        if (locationsIds?.length > 0) {
          if (this.locationsList?.length > 0) {
            locationsIds.forEach(locationId => {
              const loc = this.locationsList?.find(
                p => p.locationId == locationId
              );
              if (loc) {
                this.selectedLocationsList.push({
                  nameLine1: loc.nameLine1,
                  inactiveDate: loc.inactiveDate,
                  locationId: loc.locationId,
                  text: loc.nameLine1,
                  value: Number(loc.locationId),
                });
              }
            });
          } else {
            locationsIds.forEach(locationId => {
              if (locationId) {
                this.bankAccountLoctionsIdsPendingToLoad.push(locationId);
              }
            });
          }

          this.bankAccountForm = this.fb?.group({
            name: [
              bankAccount.Name,
              [Validators.required, Validators.maxLength(100)],
            ],
            institution: [
              bankAccount.Institution,
              [Validators.required, Validators.maxLength(100)],
            ],
            description: [
              bankAccount.Description,
              [Validators.required, Validators.maxLength(500)],
            ],
            accountNumber: [
              bankAccount.AccountNumber,
              [Validators.maxLength(15)],
            ],
            routingNumber: [
              bankAccount.RoutingNumber,
              [Validators.maxLength(9)],
            ],
          });
          this.isActive = bankAccount.IsActive;
        }
        this.selectedBankAccount = bankAccount;
      }
      this.isEditBank = true;
      this.openDialog();
    }
  };

  addHandler = event => {
    this.ifLocationsUpdated = false;
    this.savingBankAccount = false;
    this.selectedLocationsList = new Array<locationList>();
    if (event !== undefined && event !== null) {
      this.bankAccountForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        institution: ['', [Validators.required, Validators.maxLength(100)]],
        description: ['', [Validators.required, Validators.maxLength(500)]],
        accountNumber: ['', [Validators.maxLength(15)]],
        routingNumber: ['', [Validators.maxLength(9)]],
      });
      this.isActive = true;
      this.modalMode = this.localize.getLocalizedString('Add a Bank Account');
      this.isEditBank = false;

      this.openDialog();
    }
  };

  openDialog = () => {
    if (this.dialogService) {
      this.dialog = this.dialogService.open({
        content: this.templateElement,
        width: '50%',
      });
    }

    if (this.dialog.result) {
      this.dialog.result.pipe(take(1)).subscribe(result => {
        if (result) {
          this.dialog.close();
        }
      });
    }
  };

  save = () => {
    if (this.bankAccountForm?.valid && this.selectedLocationsList?.length > 0) {
      this.ifBankAccountUpdated = false;
      this.savingBankAccount = true;
      this.loading = true;
      const bankAccount = {
        Name: this.bankAccountForm.controls?.name?.value,
        Institution: this.bankAccountForm.controls?.institution?.value,
        Description: this.bankAccountForm.controls?.description?.value,
        AccountNumber: this.bankAccountForm.controls?.accountNumber?.value,
        RoutingNumber: this.bankAccountForm.controls?.routingNumber?.value,
        IsActive: this.isActive,
        BankAccountId: this.isEditBank
          ? this.selectedBankAccount?.BankAccountId
          : 0,
        DataTag: this.selectedBankAccount?.DataTag,
        Locations: [],
      };

      if (this.selectedLocationsList?.length > 0) {
        this.selectedLocationsList.forEach(location => {
          const loc = this.locationsList?.find(
            p => p?.locationId == location?.locationId
          );
          if (loc) {
            bankAccount?.Locations?.push(loc);
          }
        });
      }
      if (this.isEditBank) {
        this.subscriptions.push(
          this.updateBankAccountAPI(bankAccount)?.subscribe(
            this.editSuccess,
            this.saveEditFailure
          )
        );
      } else {
        this.subscriptions.push(
          this.createBankAccountAPI(bankAccount)?.subscribe(
            this.saveSuccess,
            this.saveEditFailure
          )
        );
      }
    }
  };

  saveSuccess = () => {
    this.toastrFactory.success(
      this.localize.getLocalizedString('{0} saved.', ['New bank Account'])
    );
    this.getBankAccounts(this.request);
    this.closeModal();
  };

  editSuccess = () => {
    this.toastrFactory.success(
      this.localize.getLocalizedString('{0} updated.', ['Bank Account'])
    );
    this.getBankAccounts(this.request);
    this.closeModal();
  };

  saveEditFailure = result => {
    this.savingBankAccount = false;
    const InvalidProperties = result?.error?.InvalidProperties;
    const errorMessage = result?.error?.Message;
    this.loading = false;
    if (InvalidProperties?.length) {
      InvalidProperties?.forEach(v => {
        this.toastrFactory.error(
          v.ValidationMessage,
          this.localize.getLocalizedString('Update Error')
        );
      });
    } else if (errorMessage) {
      this.toastrFactory.error(
        errorMessage,
        this.localize.getLocalizedString('Update Error')
      );
    } else {
      this.toastrFactory.error(
        'Server Error',
        this.localize.getLocalizedString('Update Error')
      );
    }
  };

  closeModal = () => {
    this.dialog.close();
  };

  getLocation = () => {
    this.loadingLocations = true;
    this.locationServices
      .get({})
      .$promise.then(this.GetLocationSuccess, this.GetLocationFailed);
  };

  GetLocationSuccess = result => {
    this.groupLocations(result?.Value);
  };

  groupLocations = locations => {
    this.locationsList = new Array<locationList>();
    let inactivelocationsList: Array<locationList> = new Array<locationList>();
    let pendingInactive: Array<locationList> = new Array<locationList>();
    const dateNow = new Date();
    if (locations?.length > 0) {
      locations.forEach(location => {
        if (location?.DeactivationTimeUtc) {
          const toCheck = new Date(location.DeactivationTimeUtc);
          const deactivationTimeUtcString = new Date(
            location.DeactivationTimeUtc
          )?.toLocaleDateString();
          if (toCheck < dateNow || toCheck == dateNow) {
            inactivelocationsList?.push({
              locationId: location.LocationId,
              value: location.LocationId,
              nameLine1:
                String(location.NameLine1) +
                ' (' +
                this.locationTimeService.getTimeZoneAbbr(location?.Timezone) +
                ')' +
                ' - ' +
                deactivationTimeUtcString,
              text:
              String(location.NameLine1) +
                ' (' +
                this.locationTimeService.getTimeZoneAbbr(location?.Timezone) +
                ')' +
                ' - ' +
                deactivationTimeUtcString,
              inactiveDate: ' - ' + deactivationTimeUtcString,
              subcategory: 'Inactive',
              deactivationTimeUtc: location.DeactivationTimeUtc,
            });
          } else {
            pendingInactive?.push({
              locationId: location.LocationId,
              value: location.LocationId,
              nameLine1:
              String(location.NameLine1) +
                ' (' +
                this.locationTimeService.getTimeZoneAbbr(location?.Timezone) +
                ')' +
                ' - ' +
                deactivationTimeUtcString,
              text:
              String(location.NameLine1) +
                ' (' +
                this.locationTimeService.getTimeZoneAbbr(location?.Timezone) +
                ')' +
                ' - ' +
                deactivationTimeUtcString,
              inactiveDate: ' - ' + deactivationTimeUtcString,
              subcategory: 'Pending Inactive',
              deactivationTimeUtc: location.DeactivationTimeUtc,
            });
          }
        } else {
          this.locationsList.push({
            locationId: location.LocationId,
            value: location.LocationId,
            nameLine1:
            String(location.NameLine1) +
              ' (' +
              this.locationTimeService.getTimeZoneAbbr(location?.Timezone) +
              ')',
            text:
            String(location.NameLine1) +
              ' (' +
              this.locationTimeService.getTimeZoneAbbr(location?.Timezone) +
              ')',
            inactiveDate: '',
            subcategory: 'Active',
          });
        }
      });

      this.locationsList = this.sortByColumn(this.locationsList, 'nameLine1');
      inactivelocationsList = this.sortByColumn(
        inactivelocationsList,
        'deactivationTimeUtc',
        'asc'
      );
      pendingInactive = this.sortByColumn(
        pendingInactive,
        'deactivationTimeUtc'
      );

      inactivelocationsList?.forEach(inactiveItem => {
        this.locationsList?.push(inactiveItem);
      });
      pendingInactive?.forEach(pendingInactiveItem => {
        this.locationsList?.push(pendingInactiveItem);
      });
    }
    this.loadingLocations = false;
    this.setLocationsforForm();
  };

  setLocationsforForm = () => {
    if (this.bankAccountLoctionsIdsPendingToLoad?.length > 0) {
      this.bankAccountLoctionsIdsPendingToLoad.forEach(locationId => {
        const loc = this.locationsList?.find(p => p.locationId == locationId);
        if (loc) {
          this.selectedLocationsList.push({
            nameLine1: loc.nameLine1,
            inactiveDate: loc.inactiveDate,
            locationId: loc.locationId,
            text: loc.nameLine1,
            value: Number(loc.locationId),
          });
        }
      });
    }
  };

  sortByColumn = (
    list: Array<locationList>,
    column: string,
    direction = 'desc'
  ): Array<locationList> => {
    const sortedArray = (list || []).sort((a, b) => {
      if (a[column] > b[column]) {
        return direction === 'desc' ? 1 : -1;
      }
      if (a[column] < b[column]) {
        return direction === 'desc' ? -1 : 1;
      }
      return 0;
    });
    return sortedArray;
  };

  GetLocationFailed = result => {
    const InvalidProperties = result?.error?.InvalidProperties;
    InvalidProperties?.forEach(v => {
      this.toastrFactory.error(
        String(v.PropertyName) + ': ' + String(v.ValidationMessage),
        this.localize.getLocalizedString('Locations Error')
      );
    });
    this.loadingLocations = false;
  };

  getSelectedList = (locations: Array<locationList>) => {
    this.ifLocationsUpdated = true;
    this.ifBankAccountUpdated = true;
    this.selectedLocationsList = new Array<locationList>();
    this.selectedLocationsList = locations;
    this.bankAccountForm?.markAsDirty();
  };

  removeSelectedLocations = ($event, index: number) => {
    this.ifBankAccountUpdated = true;
    this.ifLocationsUpdated = true;
    if ($event) {
      this.selectedLocationsList?.splice(index, 1);
    }
    this.bankAccountForm?.markAsDirty();
  };

  setActive = (item: boolean) => {
    this.isActive = item;
    this.ifBankAccountUpdated = true;
  };

  onChangeForm = (event, field: string) => {
    const newValue = event?.target?.value;
    if (field == 'description') {
      this.bankAccountForm?.patchValue({
        description: newValue?.trim(),
      });
    } else if (field == 'institution') {
      this.bankAccountForm?.patchValue({
        institution: newValue?.trim(),
      });
    } else if (field == 'name') {
      this.bankAccountForm?.patchValue({
        name: newValue?.trim(),
      });
    }
    this.ifBankAccountUpdated = true;
  };

  confirmCancelBankAccountChanges = () => {
    if (this.ifBankAccountUpdated) {
      const data = this.cancelConformationModal;
      this.cancelConformationRef = this.confirmationModalService?.open({
        data,
      });
      this.cancelConformationRefSubscription =
        this.cancelConformationRef?.events
          ?.pipe(
            filter(event => !!event),
            filter(event => {
              return event?.type === 'confirm' || event?.type === 'close';
            }),
            take(1)
          )
          .subscribe(events => {
            switch (events?.type) {
              case 'confirm':
                this.cancelBankAccountChanges();
                break;
              case 'close':
                this.cancelConformationRef?.close();
                break;
            }
          });
    } else {
      this.cancelBankAccountChanges();
    }
  };

  cancelBankAccountChanges = () => {
    this.cancelConformationRef?.close();
    this.ifBankAccountUpdated = false;
    this.dialog?.close();
  };

  //API Call to save and update bank account/ this api is only used in this component so we directly calling from here
  createBankAccountAPI = (filter): Observable<Row> => {
    return this.httpClient.post<Row>(
      encodeURI(String(this.soarConfig.domainUrl) + '/practice/bankAccounts/add'),
      filter
    );
  };

  updateBankAccountAPI = (filter): Observable<Row> => {
    return this.httpClient.put<Row>(
      encodeURI(String(this.soarConfig.domainUrl) + '/practice/bankAccounts/update'),
      filter
    );
  };

  validatePasteEvent = event => {
    if (
      event?.target?.id == 'inpAcctNum' ||
      event?.target?.id == 'inpRouteNum'
    ) {
      event.preventDefault();
    }
  };

  @HostListener('paste', ['$event']) blockPaste(event: KeyboardEvent) {
    this.validatePasteEvent(event);
  }

  @HostListener('copy', ['$event']) blockCopy(event: KeyboardEvent) {
    this.validatePasteEvent(event);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
