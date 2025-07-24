import { NgTemplateOutlet } from '@angular/common';
import { Component, OnInit, Inject, TemplateRef, ViewChild, Input, Output, EventEmitter, ViewContainerRef } from '@angular/core';
import { DialogAction, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { distinctUntilChanged, filter, take } from 'rxjs/operators';
import { ProviderOnClaimsRelationship, ProviderType, providerTypes, RolesType, User, UserLocationRoles, UserLocationSetup, TeamMemberLocations } from '../../../team-member';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderByPipe } from '../../../../../../@shared/pipes';

import { Subscription } from 'rxjs';
import cloneDeep from 'lodash/cloneDeep';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { TeamMemberLocationService } from '../team-member-location.service';
import { SaveStates } from 'src/@shared/models/transaction-enum';
import { ApplicationBillingInfoService } from '../../../../../../@core/http-services/application-billing-info.service';
import { BillingModel } from '../../../../../../@core/models/app-billing-info/billing-model.enum';
import { FeatureFlagService } from '../../../../../../featureflag/featureflag.service';
import { FuseFlag } from '../../../../../../@core/feature-flags';

@Component({
    selector: 'team-member-location-setup',
    templateUrl: './team-member-location-setup.component.html',
    styleUrls: ['./team-member-location-setup.component.scss']
})

export class TeamMemberLocationSetupComponent implements OnInit {
    @Input() user: User;
    @Input() providerTypes: Array<providerTypes>;
    @Input() userLocationSetups: Array<UserLocationRoles>;
    @Output() addUserLocationSetupCallback = new EventEmitter<UserLocationSetup>();
    @ViewChild('templateRef') templateElement: TemplateRef<NgTemplateOutlet>;
    @ViewChild("container", { read: ViewContainerRef })
    public containerRef: ViewContainerRef;

    public teamMemberLocationSetup: FormGroup;
    public dialog: DialogRef;

    //kendo color palette
    public color: FormControl;
    public selectedColor = '';

    activeUsers: Array<User> = new Array<User>();
    filteredActiveProviders: Array<User> = new Array<User>();
    allLocations: Array<TeamMemberLocations> = new Array<TeamMemberLocations>();
    filteredLocations: Array<TeamMemberLocations> = new Array<TeamMemberLocations>();
    roles: Array<UserLocationRoles>;
    allRoles: Array<{ text?: string; value?: number; }>;
    selectedRoles: Array<{ text?: string; value?: number; }>;
    selectedRolesBackup: Array<{ text?: string; value?: number; ObjectState?: string }>;
    providerOnClaimsName: string = null;
    providerOnClaimsId: string = null;

    employeeStatusOptions = [];
    editMode = false;
    isProviderActive = false;

    userLocationSetup: UserLocationSetup;
    providerOnClaimsPlaceholder: string;
    hasRoleErrors: boolean;
    providerOnClaimsError: boolean;
    ifProviderOnClaimsTypeIsSelf = true;
    ifAnyChange = false;
    selectRolesPlaceholder: string = this.localize?.getLocalizedString('Select roles');
    template = 'kendoAutoCompleteSearchUserInAddEdit';
    billingModel: number;

    confirmationModalData: { header: string, message: string, confirm: string, cancel: string, height: number, width: number } = {
        header: this.localize?.getLocalizedString('Notice - Monthly Subscription Fee Increase'),
        message: this.localize?.getLocalizedString('Setting a user as a provider incurs an increase in the Practice monthly subscription fee. Please contact the Patterson Technology Center for details at (844) 426-2304.'),
        confirm: 'Acknowledge',
        cancel: 'Cancel',
        height: 200,
        width: 800
    };
    confirmProviderTypeConfirmationRef: ConfirmationModalOverlayRef;
    confirmProviderTypeSubscription: Subscription;
    confirmCancelChangesRef: ConfirmationModalOverlayRef;
    locumDentistSub: Subscription;
    orderPipe = new OrderByPipe();
    availableRoles = [];
    userLocationSetupBackup: UserLocationSetup;
    affirmedSubscription = false;
    isLocumTenensFeatureFlagEnabled = false
    shouldShowLocumTenensDentistField = false;
    locumDentistCheckedState = false;
    private locumConfirmationShown = false;
    constructor(
        @Inject('referenceDataService') private referenceDataService,
        @Inject('UserServices') private userServices,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('localize') private localize,
        private featureFlagService: FeatureFlagService,
        private confirmationModalService: ConfirmationModalService,
        private dialogService: DialogService,
        public fb: FormBuilder,
        private teamMemberLocationService: TeamMemberLocationService,
        private applicationBillingInfoService: ApplicationBillingInfoService,
    ) {
    }

    ngOnInit(): void {
        this.initialize();
        this.providerOnClaimsPlaceholder = this.localize?.getLocalizedString('Search by First or Last Name');
        this.featureFlagService.getOnce$(FuseFlag.EnableLocumTenensDentist).subscribe((value) => {
            this.isLocumTenensFeatureFlagEnabled = value;
            this.updateLocumTenensVisibility(this.teamMemberLocationSetup.get('inpProviderType')?.value);
            if (this.isLocumTenensFeatureFlagEnabled) {
                this.listenForLocumDentistChanges();
            }
        });
    }

    initialize = () => {
        this.createForm();
        this.getLocations();
        this.getRoles();
        this.getActiveUsers();
        this.filteredActiveProviders = cloneDeep(this.activeUsers);
        //Employment status
        this.employeeStatusOptions?.push({ Value: 1, Name: this.localize?.getLocalizedString('Part Time') });
        this.employeeStatusOptions?.push({ Value: 2, Name: this.localize?.getLocalizedString('Full Time') });
        this.teamMemberLocationService.availableLocation?.pipe(take(1))?.subscribe(location => this.filteredLocations = location);
    }

    //Createform
    createForm = () => {
        this.teamMemberLocationSetup = this.fb?.group({
            inpLocation: ['', [Validators.required]],
            inpProviderType: ['', [Validators.required]],
            selEmployeeStatus: ['', ''],
            providerOnClaims: ['', ''],
            isActive: [this.userLocationSetup?.IsActive, ''],
            isLocumDentist: [this.userLocationSetup?.IsLocumDentist || false]
        });
    }

    setDynamicValidations = (notProvider: boolean) => {
        if (!notProvider) {
            this.teamMemberLocationSetup?.controls?.selEmployeeStatus?.setValidators(Validators.required);
            this.teamMemberLocationSetup?.controls?.selEmployeeStatus?.updateValueAndValidity();
        } else {
            this.teamMemberLocationSetup?.controls?.selEmployeeStatus?.clearValidators();
            this.teamMemberLocationSetup?.controls?.selEmployeeStatus?.updateValueAndValidity();
        }
    }

    openLocationSetupCrudModal = (userLocationSetup?: UserLocationSetup) => {
        this.editMode = userLocationSetup?.UserProviderSetupLocationId == null || userLocationSetup?.UserProviderSetupLocationId == undefined ? false : true;
        this.selectedRoles = new Array<{ text?: string; value?: number; }>();
        this.selectedRolesBackup = new Array<{ text?: string; value?: number; ObjectState?: string }>();
        this.hasRoleErrors = false;
        this.isProviderActive = false;
        this.providerOnClaimsError = false;
        this.teamMemberLocationSetup.reset();
        this.ifAnyChange = false;
        this.providerOnClaimsName = null;
        this.providerOnClaimsId = null;
        this.ifProviderOnClaimsTypeIsSelf = true;
        this.userLocationSetup = new UserLocationSetup();
        this.locumConfirmationShown = false;
        this.locumDentistCheckedState = false;
        this.filterLocations();
        if (userLocationSetup) {
            this.userLocationSetup = userLocationSetup;
            this.userLocationSetupBackup = cloneDeep(this.userLocationSetup);
            this.locumDentistCheckedState = this.userLocationSetup?.IsLocumDentist;
            this.teamMemberLocationSetup?.patchValue({
                inpLocation: this.userLocationSetup?.LocationId,
                inpProviderType: this.userLocationSetup?.ProviderTypeId,
                color: this.userLocationSetup?.Color,
                selEmployeeStatus: this.userLocationSetup?.ProviderQualifierType,
                providerOnClaims: this.userLocationSetup?.ProviderOnClaimsRelationship,
                isLocumDentist: this.userLocationSetup?.IsLocumDentist || false
            }, { emitEvent: false })

            //Push existing location to list to visible while editing location
            const tempLocaton = this.allLocations.filter(x => x.LocationId === this.userLocationSetup?.LocationId)[0];
            this.filteredLocations.push(tempLocaton);
            this.filteredLocations = this.orderPipe?.transform(this.filteredLocations, { sortColumnName: 'NameLine1', sortDirection: 1 });

            if (this.userLocationSetup?.ProviderTypeId && this.userLocationSetup?.ProviderTypeId !== ProviderType.NotAProvider) {
                this.isProviderActive = true;
            }
            this.selectedColor = this.userLocationSetup?.Color ? this.userLocationSetup.Color : '';

            if (this.userLocationSetup?.ProviderOnClaimsRelationship == ProviderOnClaimsRelationship.Self) {
                this.ifProviderOnClaimsTypeIsSelf = true;
            } else if (this.userLocationSetup?.ProviderOnClaimsRelationship == ProviderOnClaimsRelationship.Other) {
                this.ifProviderOnClaimsTypeIsSelf = false;
                const provider = this.filteredActiveProviders?.find(p => p.UserId == this.userLocationSetup?.ProviderOnClaimsId);
                if (provider?.FirstName) {
                    this.providerOnClaimsName = provider.FirstName;
                    this.providerOnClaimsId = provider.UserId;
                }
            }

            if (this.userLocationSetup?.$$UserLocationRoles) {
                if (this.userLocationSetup?.$$UserLocationRoles?.length > 0) {
                    this.userLocationSetup?.$$UserLocationRoles.forEach(p => {
                        if (p.$$ObjectState != SaveStates.Delete) {
                            this.selectedRoles.push({ text: p?.RoleName, value: p?.RoleId })
                            this.selectedRolesBackup.push({ text: p?.RoleName, value: p?.RoleId, ObjectState: SaveStates.None })
                        }
                    })
                }
            }
        } else {
            this.selectedColor = '';
            this.userLocationSetup.IsActive = true;
            this.teamMemberLocationSetup?.patchValue({
                inpLocation: null,
                inpProviderType: ProviderType.NotAProvider,
                color: this.userLocationSetup?.Color,
                selEmployeeStatus: 0,
                providerOnClaims: 0,
            }, { emitEvent: false })

        }

        this.updateLocumTenensVisibility(this.teamMemberLocationSetup.get('inpProviderType')?.value);
        this.openDialog();
    }

    openDialog = () => {
        if (this.dialogService) {
            this.dialog = this.dialogService?.open({
                content: this.templateElement,
                appendTo: this.containerRef,
            });
        }

        if (this.dialog?.result) {
            this.dialog?.result
                .pipe(take(1))
                .subscribe((result?: DialogAction) => {
                    if (!result?.primary) {
                        this.dialog?.close();
                    }
                });
        }
    }

    close = () => {
        this.confirmCancelChangesRef?.close();
        this.dialog?.close();
        this.affirmedSubscription = false;
        document.body.style.overflow = 'auto';
    }

    confirmClose = () => {
        if ((this.teamMemberLocationSetup?.dirty || this.ifAnyChange) && this.confirmationModalData) {
            this.confirmationModalData.header = this.localize.getLocalizedString('Discard');
            this.confirmationModalData.message = this.localize.getLocalizedString('Are you sure you want to discard these changes?');
            this.confirmationModalData.confirm = this.localize?.getLocalizedString('Yes');
            this.confirmationModalData.cancel = this.localize?.getLocalizedString('No');
            this.confirmationModalData.height = 200;
            this.confirmationModalData.width = 550;
            const data = this.confirmationModalData;

            this.confirmCancelChangesRef = this.confirmationModalService?.open({ data });
            this.confirmProviderTypeSubscription = this.confirmCancelChangesRef?.events?.pipe(
                filter((event) => !!event),
                filter((event) => {
                    return event.type === 'confirm' || event.type === 'close';
                }),
                take(1)
            ).subscribe((events) => {
                switch (events?.type) {
                    case 'confirm':
                        this.close();
                        this.userLocationSetup = this.userLocationSetupBackup;
                        break;
                    case 'close':
                        this.confirmCancelChangesRef?.close();
                        break;
                }
            });
        } else {
            this.close();
        }
        document.body.style.overflow = 'auto';
    }

    // list of active users for providerOnClaims
    getActiveUsers = () => {
        const users = this.referenceDataService?.get(this.referenceDataService?.entityNames?.users);
        this.activeUsers = users?.filter(user => user?.IsActive && user?.ProviderTypeId !== ProviderType.NotAProvider && user?.UserId !== this.user?.UserId)
    };

    //#region Locations
    getLocations = () => {
        this.teamMemberLocationService.getPermittedLocations().then(res => {
            this.locationsGetSuccess(res?.Value);
        }, (error) => {
            this.locationsGetFailure(error);
        });
    };

    locationsGetSuccess = (res: TeamMemberLocations[]) => {
        this.allLocations = res;
        this.allLocations = this.teamMemberLocationService.getGroupedLocations(this.allLocations);
        this.filterLocations();
    };

    locationsGetFailure = (error) => {
        this.toastrFactory?.error(this.localize?.getLocalizedString('{0} {1}', ['Locations', 'failed to load.']), [this.localize?.getLocalizedString('Server Error'), error?.data?.Message]);
    };

    filterLocations = () => {
        this.filteredLocations = new Array<TeamMemberLocations>();
        this.filteredLocations = this.allLocations?.filter(allLoc => !this.userLocationSetups?.some(alreadySelectedLoc => alreadySelectedLoc?.$$ObjectState != SaveStates.Delete && alreadySelectedLoc?.LocationId === allLoc?.LocationId));
        this.filteredLocations = this.orderPipe?.transform(this.filteredLocations, { sortColumnName: 'NameLine1', sortDirection: 1 });
    }
    //#endregion

    //#region Security Roles
    // Get roles from server and load in dropdown list
    getRoles = () => {
        const userContext = JSON.parse(sessionStorage?.getItem('userContext'));
        const applicationId = userContext?.Result?.Application?.ApplicationId;
        this.userServices?.Roles?.get({ applicationId: applicationId }).$promise.then((res) => {
            this.rolesGetSuccess(res);
        }, (error) => {
            this.rolesGetFailure(error);
        });
    };

    // Handle success response when roles fetched from server successfully
    rolesGetSuccess = (res) => {
        this.roles = new Array<UserLocationRoles>();
        this.allRoles = new Array<{ text?: string; value?: number; }>();
        if (res?.Result?.length > 0) {
            this.roles = res?.Result;
            this.roles?.forEach(role => {
                const restrictedRoles = Object.values(RolesType)?.map((v) => v?.toString()?.toLowerCase());
                if (!restrictedRoles?.includes(role?.RoleName?.toLowerCase())) {
                    this.allRoles?.push({ text: role?.RoleName, value: role?.RoleId });
                }
            })

            const orderPipe = new OrderByPipe();
            this.allRoles = this.allRoles.filter(x => x.text != 'Patterson Support Admin');
            this.allRoles = orderPipe?.transform(this.allRoles, { sortColumnName: 'text', sortDirection: 1 });
        }
    };

    rolesGetFailure = (error) => {
        this.toastrFactory?.error(this.localize?.getLocalizedString('{0} failed to load.', ['Roles']), this.localize?.getLocalizedString('Server Error'), error?.data?.Message);
    }

    onRoleSelectedChange = (newItems: Array<{ text?: string; value?: number; }>) => {
        this.ifAnyChange = true;
        this.selectedRoles = new Array<{ text?: string; value?: number; }>();
        if (newItems) {
            this.selectedRoles = newItems;
        }
        this.validateUserLocationSetup(false);
    };

    removeRoles = (role: { text?: string; value?: number; }) => {
        this.ifAnyChange = true;
        if (role?.value) {
            const index = this.selectedRoles?.findIndex(d => d?.value === role.value);
            this.selectedRoles?.splice(index, 1);
        }
        this.validateUserLocationSetup(false);
    };

    //#endregion

    //#region Provider Type
    providerTypeChange = (event) => {
        //Save previous value of dropdown
        const ov = this.teamMemberLocationSetup?.controls?.inpProviderType?.value;
        const value = event;
        if (value) {
            if (this.canChangeProvider(value, ov)) {
                this.ifAnyChange = true;
                if (value.toString() == ProviderType.NotAProvider.toString()) {
                    this.isProviderActive = false;
                    this.setDynamicValidations(true);
                    this.teamMemberLocationSetup?.patchValue({
                        providerOnClaims: 0,
                        selEmployeeStatus: 0

                    })
                } else {
                    this.isProviderActive = true;
                    this.setDynamicValidations(false);
                    this.teamMemberLocationSetup?.patchValue({
                        selEmployeeStatus: 2,
                        providerOnClaims: 1
                    })
                }
            }
            this.confirmProviderTypeChangeSubscription(value);
            this.updateLocumTenensVisibility(value);
        }
    }

    // NOTE cant change to Not a provider if you have scheduled appointments /provider room occurrences at this location
    canChangeProvider = (value, ov) => {
        if (this.editMode) {
            const mustBeAProvider = this.checkMustBeAProvider();
            if (value && value?.toString() == ProviderType.NotAProvider.toString() && mustBeAProvider) {
                if (this.confirmationModalData) {
                    this.confirmationModalData.header = this.localize.getLocalizedString('Warning');
                    this.confirmationModalData.message = this.localize.getLocalizedString('This {0} cannot be changed because he/she has scheduled hours and/or scheduled appointments.', ['provider']);
                    this.confirmationModalData.cancel = "";
                    this.confirmationModalData.confirm = this.localize?.getLocalizedString('Close');
                    this.confirmationModalData.height = 200;
                    this.confirmationModalData.width = 800;
                }
                const data = this.confirmationModalData;
                this.confirmProviderTypeConfirmationRef = this.confirmationModalService?.open({ data });
                this.confirmProviderTypeSubscription = this.confirmProviderTypeConfirmationRef?.events?.pipe(
                    filter((event) => !!event),
                    filter((event) => {
                        return event?.type?.toString() === 'confirm';
                    }),
                    take(1)
                ).subscribe((events) => {
                    switch (events?.type) {
                        case 'confirm':
                            this.teamMemberLocationSetup?.patchValue({
                                inpProviderType: ov
                            })
                            this.confirmProviderTypeConfirmationRef?.close();
                            break;
                    }
                });
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    }

    // NOTE cant change to Not a provider if you have scheduled appointments /provider room occurrences at this location
    checkMustBeAProvider = () => {
        if (this.user?.$$scheduleStatuses && this.userLocationSetup?.LocationId) {
            // does this user have a scheduleStatus record for this location
            const scheduleStatusRecord = this.user?.$$scheduleStatuses?.find(record => record?.LocationId == this.userLocationSetup?.LocationId);
            if (scheduleStatusRecord) {
                if (scheduleStatusRecord?.HasProviderAppointments || scheduleStatusRecord?.HasProviderRoomOccurrences) {
                    return true;
                }
            }
        }
        return false;
    }

    activeInactive = () => {
        this.userLocationSetup.IsActive = !this.userLocationSetup?.IsActive;
    }

    updateLocumTenensVisibility = (providerType?: number) => {
        if (this.isLocumTenensFeatureFlagEnabled) {
            const isDentist = providerType === ProviderType.Dentist;
            this.shouldShowLocumTenensDentistField = isDentist;
        }
    }

    listenForLocumDentistChanges() {
        const locumDentistCtrl = this.teamMemberLocationSetup.get('isLocumDentist');
        this.locumDentistSub = locumDentistCtrl.valueChanges
            .pipe(
                filter(value => value !== null && value !== undefined),
                distinctUntilChanged()
        ).subscribe(checkBoxEvent => {
            const isChecked = this.getCheckboxValue(checkBoxEvent);
            this.locumDentistCheckedState = isChecked;
            if (isChecked && !this.locumConfirmationShown) {
                this.locumConfirmationShown = true;
                this.openLocumDentistConfirmation();
            }
            else if (!isChecked) {
                this.locumConfirmationShown = false;
            }
        });
    }

    openLocumDentistConfirmation() {
        const data = {
            header: this.localize?.getLocalizedString('Notice'),
            message: this.localize?.getLocalizedString('This checkbox should only be selected if the dentist is filling in on a temporary basis. For a full or part time permanent dentist, this checkbox should not be selected.'),
            message2: this.localize?.getLocalizedString('When editing an existing dentist, the provider\'s role will be updated, but any open claims will remain unchanged.'),
            confirm: this.localize?.getLocalizedString('Acknowledge'),
            cancel: this.localize?.getLocalizedString('Cancel'),
            height: 250,
            width: 550
        };

        const confirmRef = this.confirmationModalService.open({ data });

        confirmRef.events
            .pipe(
                filter(event => !!event),
                filter(event => event.type === 'confirm' || event.type === 'close'),
                take(1)
            )
            .subscribe(event => {
                if (event?.type === 'close') {
                    this.teamMemberLocationSetup.patchValue({ isLocumDentist: false }, { emitEvent: false });
                    this.locumDentistCheckedState = false;
                    this.locumConfirmationShown = false; 
                }
                confirmRef.close();
            });
    }


    colorChanged = (item: string) => {
        this.selectedColor = item;
    }

    confirmProviderTypeChangeSubscription = value => {
        //ToDo: Need to check & compare this popup with angular code in edit == true & false including the UT Fixes

        let alertMessage = null;

        this.applicationBillingInfoService.applicationBilling$.subscribe(res => {

            if (
                (res.Result.BillingModel == BillingModel.ProviderFee ||
                    res.Result.BillingModel == BillingModel.LocationFee) &&
                value?.toString() == ProviderType.Dentist
            ) {
                alertMessage =
                    'Setting a Dentist as a provider incurs an increase in the Practice monthly subscription fee. Please contact the Patterson Technology Center at 800.294.8504 | Press 1 for billing.';
            } else if (
                res.Result.BillingModel == BillingModel.ProviderFee &&
                value?.toString() == ProviderType.Hygienist
            ) {
                alertMessage =
                    'Setting a Hygenist as a provider incurs an increase in the Practice monthly subscription fee. Please contact the Patterson Technology Center at 800.294.8504 | Press 1 for billing.';
            }

            if (alertMessage) {
                if (this.confirmationModalData) {
                    this.confirmationModalData.header = this.localize?.getLocalizedString(
                        'Notice - Monthly Subscription Fee Increase'
                    );
                    this.confirmationModalData.message =
                        this.localize?.getLocalizedString(alertMessage);
                    this.confirmationModalData.confirm =
                        this.localize?.getLocalizedString('Acknowledge');
                    this.confirmationModalData.cancel =
                        this.localize?.getLocalizedString('Cancel');
                    this.confirmationModalData.height = 200;
                    this.confirmationModalData.width = 800;
                }

                if (this.editMode) {
                    if (!this.affirmedSubscription) {
                        if (this.confirmationModalData) {
                            const data = this.confirmationModalData;
                            this.confirmProviderTypeConfirmationRef =
                                this.confirmationModalService?.open({ data });
                            this.confirmProviderTypeSubscription =
                                this.confirmProviderTypeConfirmationRef?.events
                                    ?.pipe(
                                        filter(event => !!event),
                                        filter(event => {
                                            return event.type === 'confirm' || event.type === 'close';
                                        }),
                                        take(1)
                                    )
                                    .subscribe(events => {
                                        switch (events?.type) {
                                            case 'confirm':
                                                this.affirmedSubscription = true;
                                                this.acknowledgeProviderType(value);
                                                break;
                                            case 'close':
                                                this.cancelProviderType();
                                                break;
                                        }
                                    });
                        }
                    }
                }

                if (!this.editMode) {
                    if (!this.affirmedSubscription) {
                        if (this.confirmationModalData) {
                            const data = this.confirmationModalData;
                            this.confirmProviderTypeConfirmationRef =
                                this.confirmationModalService?.open({ data });
                            this.confirmProviderTypeSubscription =
                                this.confirmProviderTypeConfirmationRef?.events
                                    ?.pipe(
                                        filter(event => !!event),
                                        filter(event => {
                                            return event.type === 'confirm' || event.type === 'close';
                                        }),
                                        take(1)
                                    )
                                    .subscribe(events => {
                                        switch (events?.type) {
                                            case 'confirm':
                                                this.affirmedSubscription = true;
                                                this.acknowledgeProviderType(value);
                                                break;
                                            case 'close':
                                                this.cancelProviderType();
                                                break;
                                        }
                                    });
                        }
                    }
                }
            }
        });
    };


    acknowledgeProviderType = (value) => {
        if (value?.toString() == ProviderType.NotAProvider.toString()) {
            this.isProviderActive = false;
        } else {
            this.isProviderActive = true;
        }
        this.confirmProviderTypeConfirmationRef?.close();
    }

    cancelProviderType = () => {
        this.isProviderActive = false;
        this.confirmProviderTypeConfirmationRef?.close();
        this.teamMemberLocationSetup?.patchValue({
            inpProviderType: null
        })
    }

    providerChange = (providerOnClaims: boolean) => {
        this.ifProviderOnClaimsTypeIsSelf = providerOnClaims;
        this.providerOnClaimsName = null;
        if (this.ifProviderOnClaimsTypeIsSelf) {
            this.providerOnClaimsError = false;
        }
    }

    selectProviderResult = (userId: string) => {
        this.providerOnClaimsError = false;
        const provider = this.filteredActiveProviders?.find(p => p?.UserId == userId);
        this.providerOnClaimsId = provider?.UserId;
        this.providerOnClaimsName = provider?.FirstName;
        this.validateUserLocationSetup(false);
    }


    filterValueChange = () => {
        this.providerOnClaimsError = false;
        this.validateUserLocationSetup(false);
    }

    validateUserLocationSetup = (saveData: boolean) => {
        this.hasRoleErrors = false;
        this.providerOnClaimsError = false;
        // validate that user has at least one location role that is not marked as $$ObjectState.Delete if they have Access (user.IsActive = true).  
        // If user.IsActive is false, they do not have access and therefore would not be required to have roles
        if (!this.user?.$$isPracticeAdmin && this.user?.IsActive) {
            this.hasRoleErrors = this.selectedRoles?.length == 0;
            if (this.hasRoleErrors) {
                return;
            }
        }

        if (this.isProviderActive) {
            if (this.ifProviderOnClaimsTypeIsSelf) {
                this.userLocationSetup.ProviderOnClaimsRelationship = 1;
                this.userLocationSetup.ProviderOnClaimsId = null;
            } else {
                this.userLocationSetup.ProviderOnClaimsRelationship = 2;

                if (!this.providerOnClaimsId) {
                    this.providerOnClaimsError = true;
                    return;
                } else {
                    this.userLocationSetup.ProviderOnClaimsId = this.providerOnClaimsId;
                }
            }
        } else {
            this.userLocationSetup.ProviderOnClaimsRelationship = 0;
            this.userLocationSetup.ProviderOnClaimsId = null;
            this.userLocationSetup.ProviderQualifierType = 0;
        }

        if (saveData) {
            this.addUserLocationSetupCallback.emit(this.userLocationSetup);
            this.close();
        }
    };

    saveUserLocationSetup = () => {
        if (this.teamMemberLocationSetup?.valid && !this.hasRoleErrors) {
            // validate object before callback
            if (this.teamMemberLocationSetup?.controls && this.userLocationSetup) {
                this.userLocationSetup.LocationId = this.teamMemberLocationSetup?.controls?.inpLocation?.value;
                this.userLocationSetup.ProviderTypeId = this.teamMemberLocationSetup?.controls?.inpProviderType?.value;
                this.userLocationSetup.Color = this.selectedColor == '' ? null : this.selectedColor;

                if (this.selectedColor != '') {
                    this.userLocationSetup.Color = this.selectedColor;
                }
                this.userLocationSetup.ProviderOnClaimsRelationship = this.teamMemberLocationSetup?.controls?.providerOnClaims?.value;
                this.userLocationSetup.ProviderQualifierType = this.teamMemberLocationSetup?.controls?.selEmployeeStatus?.value;

                if (this.isLocumTenensFeatureFlagEnabled) {
                    const locumValue = this.teamMemberLocationSetup?.controls?.isLocumDentist?.value;
                    this.userLocationSetup.IsLocumDentist = this.getCheckboxValue(locumValue);
                }

                this.userLocationSetup.$$UserLocationRoles = new Array<UserLocationRoles>();
                const tempRole = cloneDeep(this.roles);
                this.selectedRolesBackup?.forEach(orignalExisingRole => {
                    if (!this.selectedRoles?.find(selectedRole => selectedRole?.value == orignalExisingRole?.value)) {
                        const deletedRole = tempRole?.find(p => p?.RoleId == orignalExisingRole?.value);
                        deletedRole.$$ObjectState = SaveStates.Delete;
                        this.userLocationSetup.$$UserLocationRoles.push(deletedRole);
                    }
                });

                this.selectedRoles?.forEach(orignalExisingRole => {
                    const existingRec = this.selectedRolesBackup.find(selectedRole => selectedRole?.value === orignalExisingRole?.value)
                    if (existingRec) {
                        const existingRole = tempRole?.find(p => p?.RoleId == orignalExisingRole?.value);
                        existingRole.$$ObjectState = SaveStates.None;
                        this.userLocationSetup.$$UserLocationRoles.push(existingRole);
                    } else {
                        const newAddedRole = tempRole?.find(p => p?.RoleId == orignalExisingRole?.value);
                        newAddedRole.$$ObjectState = SaveStates.Add;
                        this.userLocationSetup.$$UserLocationRoles.push(newAddedRole);
                    }
                });

                this.userLocationSetup.UserId = this.user?.UserId;
                this.userLocationSetup.ObjectState = this.editMode ? "Update" : "Add";
                // Add location roles
                if (this.user?.$$isPracticeAdmin == false && this.userLocationSetup?.$$UserLocationRoles?.length == 0) {
                    this.userLocationSetup.$$UserLocationRoles = this.user?.Roles;
                }
            }
            this.validateUserLocationSetup(true);
        }
    };

    deletedRolesFilter = (userLocationRoles: Array<UserLocationRoles>): Array<UserLocationRoles> => {
        return userLocationRoles?.filter(practiceRole => practiceRole?.$$ObjectState !== SaveStates.Delete)
    }

    rxRoleFilter = () => {
        return this.teamMemberLocationService.rxRoleFilter(this.user);
    }

    ngOnDestroy() {
        this.confirmProviderTypeSubscription?.unsubscribe();
        this.locumDentistSub?.unsubscribe();
    }

    /**
     * Helper function for handling a bug in the check box component which doesn't emit boolean values. 
     * This handles getting the inital value of the control and also the check event.
     */
    private getCheckboxValue(value: boolean | { target?: { checked?: boolean } } | null): boolean {
        if (typeof value === 'boolean') {
            return value;
        }
        if (value && typeof value.target?.checked !== 'undefined') {
            return value.target.checked;
        }
        return false;
    }
}
