import { Component, Inject, Input, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddEvent, DataStateChangeEvent, GridDataResult } from '@progress/kendo-angular-grid';
import { LocationIdentifier, MasterLocationIdentifier, MasterLocationIdentifierQualifiers } from '../../location-identifier';
import { orderBy, process, SortDescriptor, State } from "@progress/kendo-data-query";
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { LocationIdentifierService } from 'src/@shared/providers/location-identifier.service';

const createFormGroup = dataItem => new FormGroup({
    'Description': new FormControl(dataItem.Description, [Validators.required]),
    'Qualifier': new FormControl(dataItem.Qualifier),
});

@Component({
    selector: 'locations-identifiers',
    templateUrl: './locations-identifiers.component.html',
    styleUrls: ['./locations-identifiers.component.scss']
})
export class LocationsIdentifiersComponent implements OnInit {
    masterLocationIdentifierQualifiers = MasterLocationIdentifierQualifiers;
    breadCrumbs: { name: string, path: string, title: string }[] = [];
    hasCreateAccess = false;
    hasViewAccess = false;
    hasEditAccess = false;
    hasDeleteAccess = false;
    loading = true;
    locationIdentifiers: Array<LocationIdentifier> = [];
    formGroup: FormGroup;
    editedRowIndex: number;
    isbtnVisible = false;
    sortColumnName: string;
    sortDirection: number;
    isDescending: boolean;
    defaultOrderKey = 'Description';
    masterLocationIdentifier: MasterLocationIdentifier = {};
    senderObject;
    // Properties used for delete
    locationIdentifierToDelete: MasterLocationIdentifier = {};
    deletingLocationIdentifier = false;
    cannotDeleteLocationIdentifierName = '';
    checkingForLocations = false;
    locationsWithLocationIdentifier: Array<MasterLocationIdentifier> = [];
    confirmingDelete = false;
    // End
    rowIndex: number;
    noRecordsMessageVal = "";

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
        sort: [],
        filter: {
            logic: "and",
            filters: [{
                field: "Description",
                operator: "contains",
                value: ""
            },
            {
                field: "Qualifier",
                operator: "eq",
                value: ""
            },],
        }
    };

    // For sorting
    public sort: SortDescriptor[] = [
        {
            field: "Description",
            dir: "asc",
        },
        {
            field: "Qualifier",
            dir: "asc",
        },
    ];

    public gridData: GridDataResult = process(this.locationIdentifiers, this.state);

    private loadLocationIdentifiers(locIdentifiers): void {
        const locationIdentifiers = locIdentifiers || this.locationIdentifiers;
        this.gridData = process(locationIdentifiers, this.state);
        if (this.loading == false && this.gridData?.data?.length == 0) {
            this.noRecordsMessageVal = this.localize.getLocalizedString('No records available');
        }
        else {
            this.noRecordsMessageVal = "";
        }
    }
    public dataStateChange(filterState: DataStateChangeEvent): void {
        this.state = filterState;
        this.loadLocationIdentifiers(this.locationIdentifiers);
    }
    constructor(@Inject('localize') private localize,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('$location') private $location,
        private confirmationModalService: ConfirmationModalService,
        private locationIdentifierService: LocationIdentifierService) {
    }

    ngOnInit(): void {
        this.getPageNavigation();
        this.authAccess();
        this.getLocationIdentifiers();
        this.state.filter.filters = [{
            field: "Description",
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
                name: this.localize.getLocalizedString('Location Additional Identifiers'),
                path: '/Business/PracticeSettings/Identifiers/',
                title: 'Location Additional Identifiers'
            }
        ];

    }

    authAccess = () => {
        this.authViewAccess();
        if (!this.hasViewAccess) {
            this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'), this.localize.getLocalizedString('Not Authorized'));
            this.$location.path('/');
        } else {
            this.authCreateAccess();
            this.authDeleteAccess();
            this.authEditAccess();
        }
    }

    authViewAccess = () => {
        this.hasViewAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-view');
    }

    authCreateAccess = () => {
        this.hasCreateAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-manage');
    };

    authDeleteAccess = () => {
        this.hasDeleteAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-manage');
    }

    authEditAccess = () => {
        this.hasEditAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-ailoc-manage');
    }

    getLocationIdentifiers = () => {
        this.locationIdentifierService.get()
            .then((res: MasterLocationIdentifier) => {
                this.locationIdentifiersGetSuccess(res);
            }, () => {
                this.locationIdentifiersGetFailure();
            });
    }

    locationIdentifiersGetSuccess = (res) => {
        this.loading = false;
        this.locationIdentifiers = res?.Value;
        this.loadLocationIdentifiers(this.locationIdentifiers);
        this.gridData = {
            data: orderBy(this.locationIdentifiers, this.sort),
            total: this.locationIdentifiers.length
        };
    }

    locationIdentifiersGetFailure = () => {
        this.loading = false;
        this.locationIdentifiers = [];
        this.loadLocationIdentifiers(this.locationIdentifiers);
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of additional identifiers. Refresh the page to try again.'), this.localize.getLocalizedString('Error'));
    }

    editHandler = ({ sender, rowIndex, dataItem }) => {
        this.closeEditor(sender);
        this.formGroup = createFormGroup(dataItem);
        this.editedRowIndex = rowIndex;
        sender.editRow(rowIndex, this.formGroup);
    }

    cancelHandler = ({ sender, rowIndex }) => {
        this.closeEditor(sender, rowIndex);
    }

    saveHandler = ({ sender, rowIndex, formGroup, isNew }) => {
        this.senderObject = sender;
        if (!isNew) {
            this.rowIndex = rowIndex;
            this.openUpdateConfirmationModal(null);
        } else {
            this.saveLocationIdentifier();
        }
        sender.closeRow(rowIndex);
    }

    saveLocationIdentifier = () => {
        this.masterLocationIdentifier = {};
        this.masterLocationIdentifier.Qualifier = this.formGroup?.controls['Qualifier']?.value;
        this.masterLocationIdentifier.Description = this.formGroup?.controls['Description']?.value;
        if (this.masterLocationIdentifier.Qualifier == 0) {
            this.masterLocationIdentifier.Qualifier = null;
        }
        this.locationIdentifierService.save(this.masterLocationIdentifier)
            .then(() => {
                this.savePostSuccess();
            }, () => {
                this.savePostFailure();
            });
    }

    savePostSuccess = () => {
        this.toastrFactory.success(this.localize.getLocalizedString('Additional identifier has been created.'), this.localize.getLocalizedString('Success'));
        this.getLocationIdentifiers();
    }

    savePostFailure = () => {
        this.loading = false;
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to create the additional identifier.'), this.localize.getLocalizedString('Error'));
    }

    updateLocationIdentifier = (rowIndex) => {
        this.rowIndex = rowIndex;
    }

    updatePostSuccess = () => {
        this.toastrFactory.success(this.localize.getLocalizedString('Update successful.'), this.localize.getLocalizedString('Success'));
        this.getLocationIdentifiers();
    }

    updatePostFailure = (error) => {
        this.loading = false;
        this.toastrFactory.error(this.localize.getLocalizedString(error?.data?.InvalidProperties[0]?.ValidationMessage), this.localize.getLocalizedString('Error'));
    }

    validateDelete = (locationIdentifier) => {
        this.locationIdentifierToDelete = locationIdentifier;
        this.deletingLocationIdentifier = true;
        this.cannotDeleteLocationIdentifierName = '';
        this.checkingForLocations = true;
        this.locationsWithLocationIdentifier = [];
        this.locationIdentifierService.locationIdentifier(locationIdentifier?.MasterLocationIdentifierId)
            .then((res) => {
                this.locationIdentifierWithLocationsSuccess(res, locationIdentifier);
            }, () => {
                this.locationIdentifierWithLocationsFailure();
            });
    }

    locationIdentifierWithLocationsSuccess = (res, locationIdentifier) => {
        this.locationsWithLocationIdentifier = res?.Value;
        this.checkingForLocations = false;
        // if no locations attached, go ahead and delete it.
        if (this.locationsWithLocationIdentifier && this.locationsWithLocationIdentifier?.length > 0) {
            // locationIdentifier will not be deleted
            this.cannotDeleteLocationIdentifierName = locationIdentifier?.Description;
            this.deletingLocationIdentifier = false;
            this.locationIdentifierToDelete = {};
        } else {
            this.confirmDelete(locationIdentifier)
        }
    }

    locationIdentifierWithLocationsFailure = () => {
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to get locations with the additional identifier. Try again.'), this.localize.getLocalizedString('Error'));
    }

    confirmDelete = (locIdentifier) => {
        this.confirmingDelete = true;
        this.openDeleteConfirmationModal(locIdentifier);
    }

    removeHandler = ({ dataItem }) => {
        if (this.hasDeleteAccess) {
            this.validateDelete(dataItem);
        }
    }

    deleteLocationIdentifierSuccess = () => {
        const index = this.locationIdentifiers?.findIndex(x => x.MasterLocationIdentifierId === this.locationIdentifierToDelete?.MasterLocationIdentifierId);
        if (index !== -1) {
            this.locationIdentifiers?.splice(index, 1);
            this.gridData.data = this.locationIdentifiers;
        }
        this.toastrFactory.success(this.localize.getLocalizedString('Successfully deleted the location additional identifier.'), this.localize.getLocalizedString('Success'));
        this.deletingLocationIdentifier = false;
        this.locationIdentifierToDelete = {};
    }

    deleteLocationIdentifierFailure = () => {
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to delete the location additional identifier. Try again.'), this.localize.getLocalizedString('Error'));
        this.deletingLocationIdentifier = false;
        this.locationIdentifierToDelete = {};
    }

    addHandler = ({ sender }: AddEvent) => {
        this.closeEditor(sender);
        this.formGroup = createFormGroup({
            'Description': '',
            'Qualifier': null
        });
        sender.addRow(this.formGroup);
    }

    getQualifier = (id: number) => {
        return this.masterLocationIdentifierQualifiers.find(x => x.Value === id);
    }

    closeEditor = (grid, rowIndex = this.editedRowIndex) => {
        grid.closeRow(rowIndex);
        this.editedRowIndex = undefined;
        this.formGroup = undefined;
    }


    sortChange = (sort: SortDescriptor[]): void => {
        if (sort) {
            this.sort = sort;
            this.getLocationIdentifiers();
        }
    }

    // Dialog
    openDeleteConfirmationModal = (data) => {
        this.confirmationModalData.message = this.localize.getLocalizedString(`Deleting "${String(data?.Description)}" will result in a loss of all information entered for this Additional Identifier. Continue?`);
        this.confirmationModalData.confirm = this.localize.getLocalizedString('Delete');
        data = this.confirmationModalData;
        this.confirmationRef = this.confirmationModalService.open({
            data
        });

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
                    this.locationIdentifierService.delete(this.locationIdentifierToDelete?.MasterLocationIdentifierId)
                        .then(() => {
                            this.deleteLocationIdentifierSuccess();
                        }, () => {
                            this.deleteLocationIdentifierFailure();
                        });
                    break;
                case 'close':
                    this.confirmationRef.close();
                    break;
            }
        });
    }

    openUpdateConfirmationModal = (data) => {
        this.confirmationModalData.message = this.localize.getLocalizedString('Changes will take effect for all locations. Continue?');
        this.confirmationModalData.confirm = this.localize.getLocalizedString('Save');
        data = this.confirmationModalData;
        this.confirmationRef = this.confirmationModalService.open({
            data
        });

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
                    this.masterLocationIdentifier = this.senderObject?.data?.data[this.rowIndex];
                    if (this.masterLocationIdentifier) {
                        this.masterLocationIdentifier.Qualifier = this.formGroup?.value?.Qualifier == 0 ? null : this.formGroup?.value?.Qualifier;
                        this.masterLocationIdentifier.Description = this.formGroup?.value?.Description;
                    }
                    this.locationIdentifierService.update(this.masterLocationIdentifier)
                        .then(() => {
                            this.updatePostSuccess();
                        }, (error) => {
                            this.updatePostFailure(error);
                        });
                    break;
                case 'close':
                    this.confirmationRef.close();
                    break;
            }
        });
    }
}

