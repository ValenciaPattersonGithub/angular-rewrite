import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CellClickEvent, GridComponent } from '@progress/kendo-angular-grid';
import { State } from "@progress/kendo-data-query";
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { Search1Pipe } from 'src/@shared/pipes';
import { PreventiveCareService } from 'src/@shared/providers/preventive-care.service';
import { PreventiveLinkedServices, PreventiveServices, ServiceCodeModel, ServiceCodesSorting } from 'src/business-center/service-code/service-code-model';
import { PreventiveCareItems } from './preventive-care.model';
import cloneDeep from 'lodash/cloneDeep';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { ServiceTypesService } from '../../service-types/service-types.service';
import { ServiceTypes } from 'src/business-center/service-code/service-types';

@Component({
    selector: 'preventive-care-setup',
    templateUrl: './preventive-care-setup.component.html',
    styleUrls: ['./preventive-care-setup.component.scss']
})

export class PreventiveCareSetupComponent implements OnInit {
    authAccessServiceType = { Create: false, Delete: false, Edit: false, View: false };
    authAccessServiceCode = { Create: false, Delete: false, Edit: false, View: false };
    expandBtnTitleBtn = '';
    hasDeleteServiceCodeAccess = false;
    disableInput = false;
    breadCrumbs: { name: string, path: string, title: string }[] = [];
    @ViewChild(GridComponent) preventiveGrid: GridComponent;
    public state: State = {};
    preventiveCareServicesList: Array<PreventiveCareItems> = new Array<PreventiveCareItems>();
    dataForCrudOperation: { ShowServiceCodesList: boolean } = { ShowServiceCodesList: true };
    //Current selected Preventive care Type id and name
    selectedPreventiveCareServiceId?= null;
    selectedPreventiveCareServiceName = '';
    activePrevCareItem = false;
    activeRowIndex: number;
    frequencyValidationMessage = false;
    loading = false;
    //List of all 'Service Codes' Inherited from parent Components
    @Input() serviceCodes: Array<ServiceCodeModel>
    filteredServiceCodesList: Array<ServiceCodeModel> = new Array<ServiceCodeModel>();
    searchServiceCodesKeyword = '';
    showInactive = false;
    serviceCodesSorting: ServiceCodesSorting = new ServiceCodesSorting();
    //'Service Types' List to show for Drop-down binding to filter 'Service codes'  
    serviceTypesList: Array<ServiceTypes> = new Array<ServiceTypes>();
    loadingServiceTypesList = true;
    selectedServiceType: string;
    //List of 'Service Codes' which are linked to current selected Preventive care Type
    preventiveCareLinkedServiceCodeList: Array<PreventiveLinkedServices> = new Array<PreventiveLinkedServices>();
    loadingPreventiveCareLinkedServiceCodes = false;
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;
    serviceChangesSubscription: Subscription;
    // Remove 'Service Code' from Preventive Care Type confirm modal configurations
    deleteConfirmationData = {
        data: {
            header: this.translate.instant('Remove'),
            message: '',
            message2: this.translate.instant("Are you sure you want to delete the ' Service Code '?."),
            confirm: this.translate.instant('Yes'),
            cancel: this.translate.instant('No'),
            height: 200.00,
            width: 800
        }
    };

    constructor(private translate: TranslateService,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('$location') private $location,
        @Inject('toastrFactory') private toastrFactory,
        private confirmationModalService: ConfirmationModalService,
        @Inject('referenceDataService') private referenceDataService,
        private searchPipe: Search1Pipe,
        @Inject('AuthZService') private authZ,
        private preventiveCareService: PreventiveCareService,
        @Inject('localize') private localize,
        private serviceTypesService: ServiceTypesService
    ) {
    }

    ngOnInit() {
        this.authAccessServiceType = this.preventiveCareService.accessForServiceType();
        this.authAccessServiceCode = this.preventiveCareService.accessForServiceCode();
        if (!this.authAccessServiceType?.View) {
            this.toastrFactory.error(this.patSecurityService.generateMessage('soar-biz-bprsvc-view'), 'Not Authorized');
            this.$location.path('/');
        }
        this.getPageNavigation();
        this.loadPreventiveCareServicesGrid();
        this.loadServiceTypes().then(() => {
            this.expandBtnTitleBtn = this.authZ.generateTitleMessage();
            this.hasDeleteServiceCodeAccess = this.authDeleteAccess();
            this.getServiceCodes();
            this.serviceCodes = this.serviceCodes?.filter(p => !p.IsSwiftPickCode);
        }).catch(err => console.error(err));
    }

    authDeleteAccess = () => {
        this.hasDeleteServiceCodeAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bprsvc-dsvcs');
        return this.hasDeleteServiceCodeAccess;
    };

    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.translate.instant('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings/',
                title: 'Practice Settings'
            },
            {
                name: this.translate.instant('Preventive Care'),
                path: '/Business/PracticeSettings/PreventiveCare/',
                title: 'Preventive Care'
            }
        ];
    }

    sortPreventiveCareServicesList = (preventiveCareServicesList) => {
        if (preventiveCareServicesList?.length) {
            preventiveCareServicesList = preventiveCareServicesList?.sort((a, b) => {
                if (a['Order'] > b['Order']) {
                    return 1;
                }
                if (a['Order'] < b['Order']) {
                    return -1;
                }
                return 0;
            });
        }
    }

    //Load Preventive Care Services main Grid
    loadPreventiveCareServicesGrid = () => {
        this.preventiveCareService.prevCareItems()
            .then(data => {
                this.preventiveCareServicesList = data;
                this.sortPreventiveCareServicesList(this.preventiveCareServicesList);
            })
            .catch(err => {
                this.toastrFactory.error(this.localize.getLocalizedString('Failed to load preventive care services.', ['Preventive Care Items']), this.localize.getLocalizedString('Server Error'));
            });
    };


    //Re-Load Preventive Care Services main Grid
    reloadPreventiveCareServicesGrid = () => {
        this.referenceDataService.invalidate(this.referenceDataService.entityNames.preventiveServiceTypes);
        this.referenceDataService.getData(this.referenceDataService.entityNames.preventiveServiceTypes).then((res) => {
            if (res !== undefined) {
                this.preventiveCareServicesList = cloneDeep(res);
            }
            this.sortPreventiveCareServicesList(this.preventiveCareServicesList);
        });
    }


    // Load List of 'Service Types' to bind with the Dropdown to filter 'Service Code' accordingly
    loadServiceTypes = async () => {
        const serviceTypes = await this.serviceTypesService.getAll();
        this.serviceTypesList = serviceTypes;
        this.loadingServiceTypesList = false;
    };

    //Event Fired on Save Frequency and Due Date
    cellClickHandler = (args: CellClickEvent): void => {
        this.frequencyValidationMessage = false;
        if (!args?.isEdited) {
            args.sender?.editCell(
                args.rowIndex,
                args.columnIndex
            );
        }
    }

    //Set Due Date for 'Preventive Care Items'
    setDueDateToFrequency = (dataItem: PreventiveCareItems) => {
        dataItem.UseFrequencyToSetDueDate = true;
        this.updatePreventiveCareItem(dataItem);
    }

    //Update Frequency for 'Preventive Care Items'
    getFrequencyValidation = (dataItem: PreventiveCareItems) => {
        if (isNaN(Number(dataItem?.Frequency)) || Number(dataItem?.Frequency) < 0 || Number(dataItem?.Frequency) > 120) {
            this.frequencyValidationMessage = true;
        } else {
            this.frequencyValidationMessage = false;
        }
    }

    onChangeFrequency = (dataItem: PreventiveCareItems) => {
        this.frequencyValidationMessage = false;

        this.preventiveCareService.prevCareItems()
            .then(actualPreventiveCareItems => {
                let oldFrequencyValue;
                if (actualPreventiveCareItems?.length) {
                    oldFrequencyValue = actualPreventiveCareItems.find(p => p.PreventiveServiceTypeId == dataItem?.PreventiveServiceTypeId)?.Frequency;
                }

                if (Number(dataItem?.Frequency) < 0 || Number(dataItem?.Frequency) > 120) {
                    this.frequencyValidationMessage = true;
                    this.loadPreventiveCareServicesGrid();
                } else {
                    this.frequencyValidationMessage = false;
                    if (oldFrequencyValue != dataItem?.Frequency) {
                        this.updatePreventiveCareItem(dataItem);
                    }
                }
            })
            .catch(err => {
                this.toastrFactory.error(this.localize.getLocalizedString('Failed to load preventive care services.', ['Preventive Care Items']), this.localize.getLocalizedString('Server Error'));
           });
    }

    //API Call to update Frequency and setDue Date
    updatePreventiveCareItem = (dataItem: PreventiveCareItems) => {
        this.loading = true;
        if (this.authAccessServiceType?.Edit) {
            this.disableInput = true;
            this.preventiveCareService.UpdatePreventiveService(dataItem).then((response: SoarResponse<PreventiveCareItems[]>) => {
                if (response) {
                    this.updatePreventiveServiceGotSuccess(response?.Value);
                    this.reloadPreventiveCareServicesGrid();
                    this.disableInput = false;
                }
            }).catch(() => { this.disableInput = false; });
        } else {
            this.toastrFactory.error(this.translate.instant('User is not authorized to access this area.'), this.translate.instant('Not Authorized'));
        }
    }

    updatePreventiveServiceGotSuccess = (response: Array<PreventiveCareItems>) => {
        response?.forEach(newData => {
            this.preventiveCareServicesList?.forEach(actualItem => {
                if (newData?.PreventiveServiceTypeId == actualItem?.PreventiveServiceTypeId) {
                    actualItem.DataTag = newData?.DataTag;
                    actualItem.DateModified = newData?.DateModified;
                    actualItem.UseFrequencyToSetDueDate = newData?.UseFrequencyToSetDueDate;
                    actualItem.Frequency = newData?.Frequency;
                }
            })
        })
        this.loading = false;
    }

    //On Expand'Preventive Care Types' Item open details
    expandServiceRow = (dataItem: PreventiveCareItems, rowIndex: number) => {

        if (this.activeRowIndex >= 0)
            this.preventiveGrid.collapseRow(this.activeRowIndex);
        if (this.selectedPreventiveCareServiceId && this.selectedPreventiveCareServiceId == dataItem?.PreventiveServiceTypeId) {
            this.closeServiceRow();
        } else {
            this.selectedPreventiveCareServiceName = dataItem?.Description;
            this.selectedPreventiveCareServiceId = dataItem?.PreventiveServiceTypeId;
            this.activePrevCareItem = true;
            this.preventiveGrid.expandRow(rowIndex);
            this.activeRowIndex = rowIndex;
            this.loadServiceCodes(true);
        }
    }

    //On Close 'Preventive Care Types' Item close details
    closeServiceRow = () => {
        this.selectedPreventiveCareServiceName = '';
        this.selectedPreventiveCareServiceId = null;
        this.activePrevCareItem = false;
        if (this.activeRowIndex >= 0)
            this.preventiveGrid.collapseRow(this.activeRowIndex);
    }

    //Load 'Service Codes' for the current selected 'Preventive Care' Type
    loadServiceCodes = (reloading: boolean) => {
        if (this.selectedPreventiveCareServiceId) {
            this.loadingPreventiveCareLinkedServiceCodes = reloading;
            if (this.authAccessServiceCode?.View) {
                this.preventiveCareService.GetPreventiveServicesForServiceType(this.selectedPreventiveCareServiceId)
                    .then((response: SoarResponse<PreventiveServices[]>) => {
                        if (response && response?.Value) {
                            this.loadServiceCodesGetSuccess(response?.Value);
                        }
                    }, () => {
                        this.loadServiceCodesGetFailure();
                    });
            } else {
                this.toastrFactory.error(this.translate.instant('User is not authorized to access this area.'), this.translate.instant('Not Authorized'));
            }
        }
    }

    loadServiceCodesGetFailure = () => {
        this.loadingPreventiveCareLinkedServiceCodes = false;
        this.toastrFactory.error(this.translate.instant('Failed to retrieve the list of service codes. Refresh the page to try again.'), this.translate.instant('Error'));
    }

    loadServiceCodesGetSuccess = (allServiceDataSource: Array<PreventiveLinkedServices>) => {
        this.preventiveCareLinkedServiceCodeList = allServiceDataSource;
        this.preventiveCareLinkedServiceCodeList.forEach(linkedService => {
            const serviceCode = this.serviceCodes.find(p => p.ServiceCodeId == linkedService.ServiceCodeId);
            if (serviceCode) {
                linkedService.Code = serviceCode.Code;
                linkedService.Description = serviceCode.Description;
                linkedService.InactivationDate = serviceCode.InactivationDate;
                linkedService.IsActive = serviceCode.IsActive;
            }
        });

        this.preventiveCareLinkedServiceCodeList.sort((a, b) => {
            if (a['Code'] > b['Code']) {
                return 1;
            }
            if (a['Code'] < b['Code']) {
                return -1;
            }
            return 0;
        })

        this.loadingPreventiveCareLinkedServiceCodes = false;
        this.filterServiceTypeList();
    }

    // Filter 'Service Codes List' According to all filters
    filterServiceTypeList = () => {

        // Filter according to show active/inactive
        this.filteredServiceCodesList = this.showInactive ? this.serviceCodes : this.serviceCodes.filter(serviceCode => serviceCode.IsActive);

        // Filter according to selected 'Service Type'
        this.filteredServiceCodesList = this.selectedServiceType ? this.filteredServiceCodesList.filter(serviceCode => serviceCode.ServiceTypeId == this.selectedServiceType) : this.filteredServiceCodesList;

        if (this.searchServiceCodesKeyword) {
            this.filteredServiceCodesList = this.searchPipe.transform(this.filteredServiceCodesList, { Code: this.searchServiceCodesKeyword, CdtCodeName: this.searchServiceCodesKeyword, Description: this.searchServiceCodesKeyword });
        }

        const clonedOfFilteredServiceCodesList = Object.assign([], this.filteredServiceCodesList);
        // Remove 'Service Codes' from the 'Service Codes List' Which are already Linked to service
        this.filteredServiceCodesList.filter(serviceCode => {
            // (!this.checkIfServiceCodeExistInPreventiveCare(serviceCode.ServiceCodeId))
            this.preventiveCareLinkedServiceCodeList.forEach(linkedServiceCode => {
                if (linkedServiceCode.ServiceCodeId == serviceCode.ServiceCodeId) {
                    const indx = clonedOfFilteredServiceCodesList.indexOf(serviceCode);
                    clonedOfFilteredServiceCodesList.splice(indx, 1);
                }
            })
        })

        this.filteredServiceCodesList = clonedOfFilteredServiceCodesList;
        this.serviceCodesListSorting();
    }

    //Filter 'Service Codes List' According to 'Service type'
    selectServiceTypeFilter = (serviceTypeId: string) => {
        this.selectedServiceType = serviceTypeId;
        this.filterServiceTypeList();
    }

    //Filter 'Service Codes List' According to 'Service type' Toggle Swith funcationality to show and hide Inavtive
    toggleShowInactive = (event) => {
        this.showInactive = event.target.checked;
        this.filterServiceTypeList();
    }

    //On Search 'Service Code List'
    onSearchServiceCodesKeywordChange = () => {
        this.filterServiceTypeList();
    }

    //'Service Codes' List sorting 
    onServiceCodesListSorting = (column: string) => {
        if (this.serviceCodesSorting.columnName == column) {
            this.serviceCodesSorting.asc = !this.serviceCodesSorting?.asc;
        } else {
            this.serviceCodesSorting.columnName = column;
            this.serviceCodesSorting.asc = true;
        }
        this.serviceCodesListSorting();
    }

    serviceCodesListSorting = () => {
        if (this.serviceCodesSorting?.columnName) {
            this.filteredServiceCodesList = (this.filteredServiceCodesList || []).sort((a, b) => {
                if (a[this.serviceCodesSorting.columnName] > b[this.serviceCodesSorting.columnName]) {
                    return this.serviceCodesSorting.asc ? -1 : 1;
                }
                if (a[this.serviceCodesSorting.columnName] < b[this.serviceCodesSorting.columnName]) {
                    return this.serviceCodesSorting.asc ? 1 : -1;
                }
                return 0;
            })
        }
    }

    //Disable 'Quick Add' and 'Add Service' btn according to selected service codes  
    disableQuickAdd = (): boolean => {
        return this.filteredServiceCodesList.some(p => p.isChecked);
    }

    //Add 'Service Code' in the 'Preventive Care' Item
    addServiceCodesToPrev = (selectedServiceCode: ServiceCodeModel) => {
        if (this.selectedPreventiveCareServiceId != null) {
            const selectedCodes = [];
            if (selectedServiceCode) {
                selectedCodes.push({ ServiceCodeId: selectedServiceCode.ServiceCodeId, PreventiveServiceTypeId: this.selectedPreventiveCareServiceId });
            } else {
                this.filteredServiceCodesList.forEach(serviceCode => {
                    if (serviceCode.isChecked) {
                        selectedCodes.push({ ServiceCodeId: serviceCode.ServiceCodeId, PreventiveServiceTypeId: this.selectedPreventiveCareServiceId });
                    }
                })
            }
            if (this.authAccessServiceCode?.Create) {
                this.disableInput = true;
                this.preventiveCareService.AddPreventiveServices(this.selectedPreventiveCareServiceId, selectedCodes)
                    .then((response: PreventiveServices) => {
                        if (response) {
                            this.addServiceCodesToPrevGotSuccess();
                            this.disableInput = false;
                        }
                    }).catch(() => { this.disableInput = false; });
            } else {
                this.toastrFactory.error(this.translate.instant('User is not authorized to access this area.'), this.translate.instant('Not Authorized'));
            }
        }
    };

    addServiceCodesToPrevGotSuccess = () => {
        this.filteredServiceCodesList?.forEach(p => p.isChecked = false);
        this.loadServiceCodes(false);
    }

    //Remove 'Service Code' from the 'Preventive Care' Item
    removeSrvcCode = (e, dataItem: PreventiveLinkedServices) => {
        this.confirmationRef = this.confirmationModalService.open(this.deleteConfirmationData);
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
                    if (this.selectedPreventiveCareServiceId != null) {
                        this.loading = true;
                        if (this.authAccessServiceCode?.Delete) {
                            this.disableInput = true;
                            this.preventiveCareService.RemovePreventiveServiceById(this.selectedPreventiveCareServiceId, dataItem?.PreventiveServiceId).then((response: PreventiveServices) => {
                                if (response) {
                                    this.removePreventiveServiceGetSuccess();
                                    this.disableInput = false;
                                }
                            }).catch(() => { this.disableInput = false; });
                        } else {
                            this.toastrFactory.error(this.translate.instant('User is not authorized to access this area.'), this.translate.instant('Not Authorized'));
                        }
                    }
                    break;
                case 'close':
                    this.confirmationRef.close();
                    break;
            }
        });
    }

    removePreventiveServiceGetSuccess = () => {
        this.loading = false;
        this.loadServiceCodes(false);
    }

    getServiceCodes = () => {
        this.referenceDataService.getData(this.referenceDataService.entityNames.serviceCodes)
            .then((res: ServiceCodeModel[]) => {
                this.serviceCodes = res;
            });
    }
}

