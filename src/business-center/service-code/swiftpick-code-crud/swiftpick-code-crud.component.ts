import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogAction, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import cloneDeep from 'lodash/cloneDeep';
import { ServiceCodesPickerModalComponent } from '../service-codes-picker-modal/service-codes-picker-modal.component';
import { NgForm } from '@angular/forms';
import { take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ServiceCodesService } from 'src/@shared/providers/service-codes.service';
import { ServiceCodeModel } from '../service-code-model';
import { NewStandardServiceModel } from 'src/@shared/models/new-standard-service.model';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { ServiceSwiftCodeService } from '../service-swift-code-service/service-swift-code.service';

@Component({
    selector: 'swiftpick-code-crud',
    templateUrl: './swiftpick-code-crud.component.html',
    styleUrls: ['./swiftpick-code-crud.component.scss']
})
export class SwiftpickCodeCrudComponent implements OnInit, OnChanges {
    editMode = false;
    isPopupVisible = false;
    serviceCode = new NewStandardServiceModel<ServiceCodeModel>();
    serviceCodeInitial;
    dataHasChanged = false;
    confirmCancel = false;
    isAtleastOneServiceCode = false;
    displayActiveStatusConfirmation = false;
    uniqueSwiftPickCodeServerMessage = '';
    showServiceCodesModal = false;
    Saving = false;
    SwiftPickServiceCodesTotal = 0;
    // ---------Search Properties----------
    takeAmount = 45;
    // initial limit (rows showing)
    limit = 15;
    limitResults = true;
    // Empty string for search
    searchTerm = '';
    //current searchString
    searchString = '';
    // Set the default search variables
    resultCount = 0;
    // to hold result list
    searchResults = [];
    // Search timeout queue
    searchTimeout = null;
    sortCol = null;
    includeInactive = false;
    // ---------End Search Properties--------
    // Boolean to display search loading gif
    searchIsQueryingServer = false;
    noSearchResults = false;
    template = 'kendoAutoCompleteServiceCodeTemplate';
    placeholder = 'Search by service code, CDT Code, description, fee...';
    dialog: DialogRef;
    obs: Subscription;
    tempServiceCode = { Code: '', Description: '', DisplayAs: '', IsActive: true, IsSwiftPickCode: true, ServiceCodeId: null, ServiceTypeDescription: 'Swift Code', SwiftPickServiceCodes: [] };

    @Input() data: ServiceCodeModel = {};

    @Output() closeModal: EventEmitter<ServiceCodeModel> = new EventEmitter<ServiceCodeModel>();
    @ViewChild('templateRef') templateElement: TemplateRef<NgTemplateOutlet>;
    @ViewChild(ServiceCodesPickerModalComponent) serviceModal: ServiceCodesPickerModalComponent
    @ViewChild('inpActive') private activeElem: ElementRef;
    @ViewChild("kendoAutoCompleteInstance") searchAutoComplete;
    @ViewChild("container", { read: ViewContainerRef })
    public containerRef: ViewContainerRef;
    public swiftCodeForm: NgForm;
    isAccessEnabled = false;
    serviceObj;

    @ViewChild('addSwiftPickCodeForm') set controlElRef(elementRef: NgForm) {
        this.swiftCodeForm = elementRef;
        if (this.swiftCodeForm != undefined && this.swiftCodeForm != null) {
            this.obs = this.swiftCodeForm.valueChanges
                .subscribe(() => {
                    this.setDataChangedValue();
                });
        }
    }

    constructor(private dialogService: DialogService,
        @Inject('localize') private localize,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('PatCacheFactory') private cacheFactory,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('ModalFactory') private modalFactory,
        @Inject('patSecurityService') private patSecurityService,
        private serviceCodesService: ServiceCodesService,
        private swiftCodeService: ServiceSwiftCodeService) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.data) {
            const nv = changes.data?.currentValue;
            const ov = changes.data?.previousValue;
            if (nv && nv != ov) {
                if (!this.dataHasChanged) {
                    this.serviceCode.Data = nv;
                }
            }
        }
    }

    // check if user has access to open service codes modal
    authAccess = () => {
        this.isAccessEnabled = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bsvccd-spcasc');
    }

    ngOnInit(): void {
        this.serviceCode.Data = this.tempServiceCode;
        this.serviceCode.Name = this.serviceCode?.Data?.IsSwiftPickCode ? this.localize.getLocalizedString('Swift Code') : this.localize.getLocalizedString('Service Code');
        //Store initial copy of service code, to check for data modification
        this.serviceCodeInitial = cloneDeep(this.serviceCode?.Data);
        this.dataHasChanged = false;
        this.confirmCancel = false;
        this.editMode = this.serviceCode?.Data?.ServiceCodeId ? true : false;
        this.setSwiftpickFees(this.serviceCode?.Data);
        this.authAccess();
    }

    // Set the fees for swift picks when editing
    setSwiftpickFees = (serviceCode) => {
        if (serviceCode?.SwiftPickServiceCodes) {
            const codesList = this.serviceCode?.Data?.SwiftPickServiceCodes;
            const services = [];
            this.serviceCode.Data.SwiftPickServiceCodes = [];
            codesList.forEach(code => {
                services.push(this.referenceDataService.setFeesByLocation(code));
            });
            this.serviceCode.Data.SwiftPickServiceCodes = services;
        }
        this.sumFilter(this.serviceCode?.Data?.SwiftPickServiceCodes);
    };

    openDialog = () => {
        this.SwiftPickServiceCodesTotal = 0;
        this.displayActiveStatusConfirmation = false;
        if (!this.editMode) { // Add
            this.dataHasChanged = true;
            this.serviceCode.Data = { Code: '', Description: '', DisplayAs: '', IsActive: true, IsSwiftPickCode: true, ServiceCodeId: null, ServiceTypeDescription: 'Swift Code', SwiftPickServiceCodes: [] };
        } else { // Edit
            if (this.serviceCode?.Data?.SwiftPickServiceCodes != null && this.serviceCode.Data.SwiftPickServiceCodes != undefined) {
                this.sumFilter(this.serviceCode.Data.SwiftPickServiceCodes);
            }
            this.dataHasChanged = false;
        }

        if (this.dialogService) {
            this.dialog = this.dialogService.open({
                content: this.templateElement,
                appendTo: this.containerRef,
                width: "90%",
                maxHeight: "90%",
                height: "auto"
            });
        }

        if (this.dialog.result) {
            this.dialog.result
                .pipe(take(1))
                .subscribe((result?: DialogAction) => {
                    if (!result.primary) {
                        this.dialog.close();
                    }
                });
        }
    }

    cancelOnClick = () => {
        if (this.swiftCodeForm != null && this.swiftCodeForm != undefined) {
            this.dataHasChanged = this.swiftCodeForm.dirty;
        }

        if (this.dataHasChanged == true) {
            this.modalFactory.CancelModal().then(() => { this.close(), () => { } });
        }
        else
            this.close();
    }

    close = (selectedServiceCodes = null) => {
        selectedServiceCodes ? this.dialog?.close(selectedServiceCodes) : this.dialog?.close();
    }

    serviceCodeOnChange = () => {
        this.serviceCode.IsDuplicate = false;
    }

    inputKeyDown = (e) => {
        if (e?.keyCode == 13) {
            e?.originalEvent.preventDefault();
        }
    }

    saveSwiftPickCode = () => {        
        this.swiftCodeService?.validate(this.serviceCode?.Data).then(res => {
            this.serviceCode.Valid = res;
            if (this.serviceCode?.Valid) {
                //Check if duplicate swift pick code exists before saving
                const serviceCodeId = this.serviceCode?.Data?.ServiceCodeId ? this.serviceCode?.Data?.ServiceCodeId : "00000000-0000-0000-0000-000000000000";
                const params = { "ServiceCodeId": serviceCodeId, "Code": (this.serviceCode?.Data?.Code)?.trim() };
                this.swiftCodeService.checkDuplicate(params).then((res: SoarResponse<boolean>) => {
                    this.serviceCode.IsDuplicate = res?.Value;
                    this.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess();
                }, () => {
                    this.checkUniqueServiceCodeGetFailure();
                });
            }
        }, () => {
            const errorMessage = "Failed to validate {0}.";
            this.toastrFactory.error(this.localize.getLocalizedString(errorMessage, [this.serviceCode?.Name]), 'Error');
        });
    }

    saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess = () => {
        // Check if service code already exists
        if (this.serviceCode.IsDuplicate == true) {
            this.uniqueSwiftPickCodeServerMessage = this.localize.getLocalizedString('A code with this name already exists...');
            // Set focus to code input box      
            document.getElementById('inpSwiftPickCode')?.focus();
        }
        else {
            this.isAtleastOneServiceCode = this.serviceCode?.Data?.SwiftPickServiceCodes?.length > 0 ? true : false;
            // if we're valid  and atleast, one service code
            if (this.serviceCode?.Valid && this.isAtleastOneServiceCode) {
                if (this.serviceCode?.Data?.Fee > 0)
                    this.serviceCode.Data.Fee = 0;
                if (this.displayActiveStatusConfirmation)
                    this.serviceCode.Data.IsActive = true;

                if (this.serviceCode?.Data?.LocationSpecificInfo) {
                    this.serviceCode.Data.LocationSpecificInfo = null;
                }
                if (this.serviceCode?.Data?.TaxableServiceTypeId) {
                    this.serviceCode.Data.TaxableServiceTypeId = 0;
                }

                // clearing the service code cache since one is being added
                const scCache = this.cacheFactory.GetCache('ServiceCodesService', 'aggressive', 60000, 60000);
                if (scCache) {
                    this.cacheFactory.ClearCache(scCache);
                }
                this.swiftCodeService.save(this.serviceCode?.Data, 'ServiceCodeId').then((res: ServiceCodeModel) => {
                    this.afterSaveSuccess(res);
                }, () => {
                    this.serviceCode.Saving = false;
                    const errorMessage = "Failed to create {0}.";
                    this.toastrFactory.error(this.localize.getLocalizedString(errorMessage, [this.serviceCode?.Name]), 'Error');
                })
            }
        }
    }

    afterSaveSuccess = (result: ServiceCodeModel) => {
        const isUpdate = this.serviceCode.Data['ServiceCodeId'] ? true : false;
        const updatedServiceCode = result;
        this.closeModal?.emit(updatedServiceCode);
        this.close();
        this.serviceCode.Data = result;
        this.serviceCode.OriginalData = cloneDeep(this.serviceCode?.Data);
        this.serviceCode.Saving = false;
        if (!isUpdate) { // Create
            this.toastrFactory.success(this.localize.getLocalizedString("{0} created successfully.", [this.serviceCode?.Name]), 'Success');
        } else { // Update
            this.toastrFactory.success(this.localize.getLocalizedString("{0} updated successfully.", [this.serviceCode?.Name]), 'Success');
        }
    }

    checkUniqueServiceCodeGetFailure = () => {
        this.serviceCode.IsDuplicate = true;
        this.uniqueSwiftPickCodeServerMessage = this.localize.getLocalizedString('Could not verify unique Swift Code. Please try again');
    }

    checkUniqueServiceCode = () => {
        if (this.serviceCode?.Data?.Code) {
            const serviceCodeId = this.serviceCode?.Data?.ServiceCodeId ? this.serviceCode?.Data?.ServiceCodeId : "00000000-0000-0000-0000-000000000000";
            const params = { "ServiceCodeId": serviceCodeId, "Code": this.serviceCode?.Data?.Code };
            this.swiftCodeService.checkDuplicate(params).then((res: SoarResponse<boolean>) => {
                this.serviceCode.IsDuplicate = res?.Value;
                this.checkUniqueServiceCodeGetSuccess();
            }, () => {
                this.checkUniqueServiceCodeGetFailure();
            })
        }
    }

    // Success callback handler to notify user after verifying unique service code
    checkUniqueServiceCodeGetSuccess = () => {
        // Check if service code already exists
        if (this.serviceCode?.IsDuplicate == true)
            this.uniqueSwiftPickCodeServerMessage = this.localize.getLocalizedString('A code with this name already exists...');
    }

    swiftPickCodeIsActiveOnChange = (event) => {
        if (event?.target?.checked == false) {
            this.displayActiveStatusConfirmation = true;
            this.serviceCode.Data.IsActive = false;
            this.activeElem?.nativeElement?.prop('checked', false);
        }
        else {
            this.displayActiveStatusConfirmation = false;
            this.serviceCode.Data.IsActive = true;
            this.activeElem?.nativeElement?.prop('checked', true);
        }
        this.dataHasChanged = true;
        this.swiftCodeForm?.control?.markAsDirty();
    }

    removeServiceCode = (selectedService) => {
        this.dataHasChanged = true;
        this.swiftCodeForm?.control?.markAsDirty();
        if (this.serviceCode?.Data?.IsActive) {
            if (this.editMode && this.serviceCode?.Data?.SwiftPickServiceCodes?.indexOf(selectedService) == 0 && this.serviceCode?.Data?.SwiftPickServiceCodes?.length == 1) {
                this.serviceCode.Data.SwiftPickServiceCodes = [];
            }
            else {
                this.serviceCode?.Data?.SwiftPickServiceCodes?.splice(this.serviceCode?.Data?.SwiftPickServiceCodes?.indexOf(selectedService), 1);
            }
        }
        this.sumFilter(this.serviceCode?.Data?.SwiftPickServiceCodes);
    }

    //#region Service Codes Modal
    showServiceCodesPicker = () => {
        if (this.isAccessEnabled) {
            this.serviceModal.openDialog();
        }
    }

    onServiceCodeModalClose = (serviceCodes) => {
        if (serviceCodes != null) {
            this.dataHasChanged = true;
            this.swiftCodeForm?.control?.markAsDirty();
            if (serviceCodes) {
                if (Array.isArray(serviceCodes)) {
                    serviceCodes.forEach(serviceObj => {
                        this.serviceCode?.Data?.SwiftPickServiceCodes?.push(serviceObj);
                    });
                } else {
                    this.serviceCode?.Data?.SwiftPickServiceCodes?.push(serviceCodes);
                }
            }
            this.sumFilter(this.serviceCode?.Data?.SwiftPickServiceCodes);
            if (this.serviceModal != null && this.serviceModal != undefined) {
                this.serviceModal.close();
            }
        }
    }

    sumFilter = (values) => {
        let total = 0;
        for (let i = 0; i < values?.length; i++) {
            if (values[i]?.$$locationFee) {
                total += values[i]?.$$locationFee;
            }
        }
        this.SwiftPickServiceCodesTotal = total;
    }
    //end region

    // Handle click event to select service code
    selectResult = (selectedServices) => {
        this.dataHasChanged = true;
        this.swiftCodeForm?.control?.markAsDirty();
        if (selectedServices) {
            if (Array.isArray(selectedServices)) {
                selectedServices.forEach(service => {
                    this.getServiceObj(service);
                    this.serviceCode?.Data?.SwiftPickServiceCodes?.push(this.serviceObj);
                });
            } else {
                this.getServiceObj(selectedServices);
                if (this.serviceObj) {
                    this.serviceCode?.Data?.SwiftPickServiceCodes?.push(this.serviceObj);
                    this.searchTerm = selectedServices?.Code;
                }
            }
            this.sumFilter(this.serviceCode?.Data?.SwiftPickServiceCodes);
        }
    }

    getServiceObj = (serviceCode) => {
        const ind = this.searchResults?.findIndex(x => x.Code == serviceCode);
        if (ind > -1) {
            this.serviceObj = this.searchResults[ind];
        }
    }

    // notify of search string change
    activateSearch = (searchTerm) => {
        if (this.searchString != searchTerm) {
            // reset limit when search changes
            this.limit = 15;
            this.limitResults = true;
            this.searchString = searchTerm;
            this.resultCount = 0;
            this.searchResults = [];
            this.search(searchTerm);
        } else {
            this.noSearchResults = false;
        }
    };

    // Perform the search
    search = (term) => {
        if (term) {
            // Don't search if not needed!
            if (this.searchIsQueryingServer || (this.resultCount > 0 && this.searchResults?.length == this.resultCount) || this.searchString?.length === 0) {
                this.noSearchResults = false;
                return;
            }
            // set variable to indicate status of search
            this.searchIsQueryingServer = true;

            const searchParams = {
                search: this.searchString,
                skip: this.searchResults.length,
                take: this.takeAmount,
                sortBy: this.sortCol,
                includeInactive: this.includeInactive
            };
            this.serviceCodesService?.search(searchParams).then((res) => {
                this.searchGetOnSuccess(res);
            }, () => {
                this.searchGetOnError();
            });
        }
    }

    searchGetOnSuccess = (res) => {
        this.resultCount = res.Count;
        // Set the cdt code list
        this.searchResults = this.referenceDataService.setFeesByLocation(res.Value);
        if (this.searchResults?.length > 0) {
            this.searchResults?.forEach(code => {
                code["Name"] = code?.Code;
            });
        }
        // set variable to indicate whether any results
        this.noSearchResults = this.searchString?.length <= 0 ? false : (this.resultCount === 0);
        // reset  variable to indicate status of search = false
        this.searchIsQueryingServer = false;
    }

    searchGetOnError = () => {
        // Toastr alert to show error
        this.toastrFactory.error(this.localize.getLocalizedString('Please search again.'), this.localize.getLocalizedString('Server Error'));
        // if search fails reset all scope var
        this.searchIsQueryingServer = false;
        this.resultCount = 0;
        this.searchResults = [];
        this.noSearchResults = true;
    }

    //Function to reset the displayActiveStatusConfirmation property
    okStatusConfirmation = () => {
        this.displayActiveStatusConfirmation = false;
        this.serviceCode.Data.IsActive = false;
        this.activeElem?.nativeElement.prop('checked', false);
    }

    //Function to reset the displayActiveStatusConfirmation property
    cancelStatusConfirmation = () => {
        this.displayActiveStatusConfirmation = false;
        this.serviceCode.Data.IsActive = true;
        this.activeElem?.nativeElement.prop('checked', true);
    };

    setDataChangedValue = () => {
        if (this.swiftCodeForm != null && this.swiftCodeForm != undefined) {
            this.dataHasChanged = this.swiftCodeForm.dirty;
        }
    }

    ngOnDestroy() {
        this.obs && this.obs.unsubscribe();
    }
}
