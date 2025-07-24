import { Component, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ProviderType, providerTypes, RoleNames, StateLicense, TeamMemberRoles, User, UserLocationRoles, UserLocationsErrors, UserLocationSetup } from '../../team-member';
import cloneDeep from 'lodash/cloneDeep';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TeamMemberLocationSetupComponent } from './team-member-location-setup/team-member-location-setup.component';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { Subscription } from 'rxjs';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { filter, take } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { TeamMemberLocationService } from './team-member-location.service';
import { ViewCompareRolesComponent } from '../../view-compare-roles/view-compare-roles.component';
import { ViewCompareRoleType } from '../../view-compare-roles/roles-matrix.model';
import { SaveStates } from 'src/@shared/models/transaction-enum';

@Component({
    selector: 'team-member-locations',
    templateUrl: './team-member-locations.component.html',
    styleUrls: ['./team-member-locations.component.scss']
})
export class TeamMemberLocationsComponent implements OnInit, OnChanges {

    @Input() user: User;
    @Output() userLocationSetupsDataChanged = new EventEmitter<Array<UserLocationSetup>>();
    @Output() userAccessChanged = new EventEmitter<boolean>();
    @Input() userLocationsErrors: UserLocationsErrors = { NoUserLocationsError: false, NoRoleForLocation: false };
    @Input() updatedLicensesArgs: StateLicense;
    @Output() stateLicenseValidation: EventEmitter<string> = new EventEmitter<string>();
    @Output() changeReasonData = new EventEmitter<string>();
    @Output() onUpdateUserInfo = new EventEmitter<User>();

    frmUserLocations: FormGroup;
    loggedInUserHasPracticeAccess = true;
    loading = false;
    disableTeamMemberType = false;
    availableLocations = [];
    practiceOnlyHasOneAdmin = false;
    practiceAdminRole: UserLocationRoles;
    showMissingRolesMessage = false;
    needLicenseStates = '';
    displayPracticeRolesChangedMessage = false;
    currentStatus = false;
    userLocationSetupBackup = null;
    userLocationSetups: UserLocationSetup[];
    filteredUserLocationSetups: UserLocationSetup[];
    savingUserLocationSetup = false;
    providerTypes: Array<providerTypes>;
    users: [] = [];
    locations: [] = [];
    userRoles: TeamMemberRoles = new TeamMemberRoles();
    permittedLocations = [];
    roles = [];
    rxAccessRole: UserLocationRoles = new UserLocationRoles();
    validatedStates: [{ StateAbbreviation: string }] = [{ StateAbbreviation: "" }];
    noStateLicense = false;
    updatedLicenses = [];
    hasDeleteAccess = false;
    hasAddEditAccess = false;
    notAProvider: number = ProviderType?.NotAProvider;
    reasonPlaceHolder = '';
    toggleTrue = false;
    // For modal
    confirmationRef: ConfirmationModalOverlayRef;
    confirmationModalSubscription: Subscription;
    confirmationModalData = {
        header: '',
        message: '',
        confirm: '',
        cancel: 'Cancel',
        height: 180,
        width: 650
    }
    deleteLocation = false;
    editLocation = false;
    orderBy = {
        field: '$$Location?.NameLine1',
        asc: 1
    };
    backupUserLocationRoles: Array<{ locationId: number, UserLocationRoles: UserLocationRoles[] }> = new Array<{ locationId: number, UserLocationRoles: UserLocationRoles[] }>();

    @ViewChild(TeamMemberLocationSetupComponent) public viewLocationSetupCrudModal: TeamMemberLocationSetupComponent;
    @ViewChild('btnAddUserLocationSetup') btnAddUserLocationSetup: ElementRef;
    @ViewChild('StatusChangeNote', { static: false }) reasonBox: ElementRef;
    @ViewChild(ViewCompareRolesComponent) public viewCompareRolesModal: ViewCompareRolesComponent;
    @ViewChild('radioAssignRolesByLocation') radioAssignRolesByLocation: ElementRef;
    @ViewChild('radioAssignRolesByPractice') radioAssignRolesByPractice: ElementRef;
    constructor(
        @Inject('RolesFactory') private rolesFactory,
        @Inject('localize') public localize,
        @Inject('ModalFactory') private modalFactory,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('toastrFactory') private toastrFactory,
        private teamMemberLocationService: TeamMemberLocationService,
        private fb: FormBuilder,
        private confirmationModalService: ConfirmationModalService,
        private datepipe: DatePipe,
        private changeDetector: ChangeDetectorRef) { }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.user) {
            const nv = changes?.user?.currentValue;
            if (nv) {
                this.user = cloneDeep(nv);
            }
        }

        if (changes.updatedLicensesArgs) {
            this.sendLicensesToValidate(this.updatedLicensesArgs);
        }
    }

    ngOnInit(): void {
        this.loading = true;
        this.savingUserLocationSetup = false;
        this.currentStatus = this.user?.IsActive;
        //placeholder for reason textField
        this.reasonPlaceHolder = this.localize?.getLocalizedString('Reason to ' + (this.user?.IsActive ? 'disable' : 'enable') + ' user access');
        this.getDeleteAccess();
        this.getAddEditAccess();

        // determine whether logged in user can change a user from location roles to practice admin roles
        this.determinePracticeRoleAccess();

        this.users = this.referenceDataService?.get(this.referenceDataService?.entityNames?.users);
        this.locations = this.referenceDataService?.get(this.referenceDataService?.entityNames?.locations);
        this.teamMemberLocationService.getProviderTypes().then((res) => {
            this.providerTypes = new Array<providerTypes>();
            if (res) {
                this.providerTypes = res?.Value;
            }
            this.getPermittedLocations();
        }, (errorMsg) => {
            this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve {0}. Refresh the page to try again.', [errorMsg]), this.localize.getLocalizedString('Server Error'));
        });
        this.createForm();
    }

    getPermittedLocations = () => {
        this.teamMemberLocationService.getPermittedLocations().then((res) => {
            if (res) {
                this.permittedLocations = this.teamMemberLocationService?.getGroupedLocations(res?.Value);
                this.availableLocations = this.permittedLocations;
            }
            this.getSecurityRoles();
        }, (errorMsg) => {
            this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve {0}. Refresh the page to try again.', [errorMsg]), this.localize.getLocalizedString('Server Error'));
        })
    }

    getSecurityRoles = () => {
        this.teamMemberLocationService.getRoles().then((res) => {
            this.roles = new Array<UserLocationRoles>();
            if (res) {
                // remove rxRoles                
                this.roles = res;
                // grab the practiceAdmin role
                this.practiceAdminRole = this.roles?.find(role =>
                    role?.RoleName?.toLowerCase() === RoleNames.PracticeAdmin?.toLowerCase()
                );
                this.rxAccessRole = this.roles?.find(role =>
                    role?.RoleName?.toLowerCase() === RoleNames.RxUser?.toLowerCase()?.trim()
                );
            }
            if (this.user?.UserId) {
                this.getUserRoles();
            } else {
                this.loading = false;
            }
        }, (errorMsg) => {
            this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve {0}. Refresh the page to try again.', [errorMsg]), this.localize.getLocalizedString('Server Error'));
        })
    }

    getDeleteAccess = () => {
        this.hasDeleteAccess = this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizusr-delete');
    }

    getAddEditAccess = () => {
        this.hasAddEditAccess = this.patSecurityService.IsAuthorizedByAbbreviation('plapi-user-usrrol-create');
    }

    determinePracticeRoleAccess = () => {
        const userContext = JSON.parse(sessionStorage.getItem('userContext'));
        const access = userContext?.Result?.Access;
        this.loggedInUserHasPracticeAccess = (access && (access[0]?.AccessLevel === 2)) ? true : false;
    };

    //#region merge data to get displayNames
    mergeDataForUserLocationSetups = () => {

        // merge location info to the userLocationSetups
        this.teamMemberLocationService.getMergedLocationData(this.userLocationSetups, this.locations, this.permittedLocations);

        // merge user info to the userLocationSetups
        this.teamMemberLocationService.getMergedUserData(this.userLocationSetups, this.users, this.providerTypes);

        // merge location roles info to the userLocationSetups
        this.userLocationSetups?.forEach(userLocationSetup => {
            userLocationSetup.$$UserLocationRoles = [];
        });
        // merge practice roles info to the userLocationSetups
        this.teamMemberLocationService.getMergedLocationRolesData(this.userLocationSetups, this.userRoles);

        this.user.$$UserPracticeRoles = [];
        this.user = this.teamMemberLocationService.getMergedPracticeRolesData(this.userRoles, this.user);

        // Add user Location Roles for practice admin
        if (this.user?.$$isPracticeAdmin == true) {
            this.frmUserLocations?.controls['IsPracticeAdmin']?.setValue('true');
        } else {
            this.frmUserLocations?.controls['IsPracticeAdmin']?.setValue('false');
        }
        this.frmUserLocations?.controls['IsPracticeAdmin']?.updateValueAndValidity();

        // sort the userLocationSetups
        this.userLocationSetups = this.userLocationSetups?.sort((a, b) => a?.$$Location?.NameLine1?.localeCompare(b?.$$Location?.NameLine1));

        this.userLocationSetupsFilter();

        // check licenses for this user by state
        this.validateStateLicenseByLocation();

        // build a list of locations that can be added
        this.getAvailableLocations();
        this.loading = false;

        this.onUpdateUserInfo?.emit(this.user);
    };



    userLocationSetupsFilter = () => {
        this.filteredUserLocationSetups = [];
        this.filteredUserLocationSetups = this.userLocationSetups?.filter(userLocation =>
            userLocation?.ObjectState !== SaveStates.Delete
        )
        //Added change Detector here as grid loading was taking time to bind data and binding after some UI changes
        this.changeDetector.detectChanges();
        this.userLocationSetupsDataChanged.emit(this.userLocationSetups);
    };

    // get this users current provider location setup
    getUserLocationsSetups = () => {
        this.teamMemberLocationService.getUserLocationSetups(this.user?.UserId).then((res) => {
            this.userLocationSetups = res?.Value;
            this.mergeDataForUserLocationSetups();
        }, () => {
            this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve {0}. Refresh the page to try again.', ['locations']), this.localize.getLocalizedString('Server Error'));
        });
    };



    createForm = () => {
        this.frmUserLocations = this.fb.group({
            IsPracticeAdmin: [this.user?.$$isPracticeAdmin == undefined ? 'false' : this.user?.$$isPracticeAdmin?.toString(), null],
            IsActive: [this.user?.IsActive, null],
            StatusChangeNote: [this.user?.StatusChangeNote, null]
        });
    }

    // warning when switching from location user to practice roles user
    confirmSwitchToPracticeAdmin = () => {
        const title = this.localize.getLocalizedString('Warning');
        let message = this.localize.getLocalizedString('Changing this user to a Practice Admin/Exec. Dentist will remove all existing location roles and provide global access.');
        message = this.user?.ProviderTypeId != 4 ? `${String(message)} ${String(this.localize.getLocalizedString('Any Provider time assigned to the weekly setup will remain on the schedule.'))}` : message;
        const button1Text = this.localize.getLocalizedString('Continue');
        const button2Text = this.localize.getLocalizedString('Cancel');
        this.modalFactory.ConfirmModal(title, message, button1Text, button2Text).then(
            () => {
                this.switchToPracticeAdmin();
            }, () => {
                // user cancelled action                    
                this.user.$$isPracticeAdmin = false;
                this.frmUserLocations?.get('IsPracticeAdmin')?.setValue('false');
                this.frmUserLocations?.get('IsPracticeAdmin')?.updateValueAndValidity();
            }
        );
    }

    changeRoleAssignment = (toPracticeAdmin) => {
        if (toPracticeAdmin == true) {
            // if no userLocationSetups, just switch it
            if (this.userLocationSetups?.length === 0) {
                this.switchToPracticeAdmin();
            } else {
                this.confirmSwitchToPracticeAdmin();
            }
        }

        if (toPracticeAdmin === false) {
            // if changing from practice admin to location roles user
            // check to see if this is the only practice admin before proceeding (NOTE removing practice role prohibited if only one admin)                    
            this.rolesFactory.AllPracticeAdmins().then(res => {
                this.practiceOnlyHasOneAdmin = res?.Result?.length > 1 ? false : true;
                if (this.practiceOnlyHasOneAdmin == true) {
                    // STOP do not allow switch to practice admin 
                    this.user.$$isPracticeAdmin = true;
                } else {
                    this.switchToLocationUserRoles();
                }
            });
        }
    }
    // if user.IsActive they are required to have at least one location role per location
    // or to be a PracticeAdmin (which would dictate they have one Practice role)
    checkLocationsForRoles = () => {
        this.showMissingRolesMessage = false;
        if (!this.user?.$$isPracticeAdmin && this.user?.IsActive) {
            this.userLocationSetups?.forEach(userLocationSetup => {
                if (!userLocationSetup?.$$UserLocationRoles || userLocationSetup?.$$UserLocationRoles?.length == 0) {
                    this.showMissingRolesMessage = true;
                }
            });
        }
    }

    // switch from location user roles to practice role and set objectStates
    switchToLocationUserRoles = () => {
        // if roles have ObjectState of Delete it means this action hasn't been saved yet
        if (this.backupUserLocationRoles && this.backupUserLocationRoles?.length > 0) {
            this.userLocationSetups?.forEach(userLocationSetup => {
                const currUserLocationRoles = this.backupUserLocationRoles?.find(x => x?.locationId == userLocationSetup?.LocationId);
                if (currUserLocationRoles) {
                    userLocationSetup.$$UserLocationRoles = currUserLocationRoles?.UserLocationRoles;
                }
            });
        }
        else {
            this.userLocationSetups?.forEach(userLocationSetup => {
                userLocationSetup?.$$UserLocationRoles?.forEach(role => {
                    role.$$ObjectState = SaveStates.Add;
                });
            });
        }

        if (this.practiceAdminRole) {
            if (this.user?.UserId != "") {
                // if user has a practice admin role,add delete as object state
                this.user?.$$UserPracticeRoles?.forEach(practiceRole => {
                    if (practiceRole?.RoleId == this.practiceAdminRole?.RoleId) {
                        practiceRole.$$ObjectState = SaveStates.Delete;
                    }
                });
            }
            else {
                //If we are creating new record in such case $$ObjectState delete will not work we need to remove it from array
                this.user.$$UserPracticeRoles = [];
            }

            this.user.$$isPracticeAdmin = false;
            this.onUpdateUserInfo?.emit(this.user);
        }
        this.checkLocationsForRoles();
    }

    // switch from location user roles to practice role and set objectStates
    switchToPracticeAdmin = () => {
        //Adding backup of UserLocationRoles which we have to use when we again switch to assign roles without saving the team member data
        this.backupUserLocationRoles = [];
        this.userLocationSetups?.forEach(userLocationSetup => {
            this.backupUserLocationRoles.push({ locationId: userLocationSetup.LocationId, UserLocationRoles: cloneDeep(userLocationSetup?.$$UserLocationRoles) });
            userLocationSetup?.$$UserLocationRoles?.forEach(role => {
                role.$$ObjectState = SaveStates.Delete;
            });
        });

        if (this.practiceAdminRole) {
            this.user.$$isPracticeAdmin = true;
            const role = cloneDeep(this.practiceAdminRole);
            // if role already exists just set the object state to None otherwise Add
            const practiceRole = this.user?.$$UserPracticeRoles?.find(role => role?.RoleName?.toLowerCase() == RoleNames.PracticeAdmin?.toLowerCase());
            if (practiceRole) {
                practiceRole.$$ObjectState = SaveStates.Add;
            } else {
                role.$$ObjectState = SaveStates.Add;
                this.user.$$UserPracticeRoles = new Array<UserLocationRoles>()
                this.user?.$$UserPracticeRoles.push(role);
            }
            this.onUpdateUserInfo?.emit(this.user);
        }
        this.checkLocationsForRoles();
    }

    toggleUserAccess = () => {
        this.user.IsActive = !this.user?.IsActive;
        if (this.currentStatus != this.user?.IsActive) {
            this.frmUserLocations?.controls['StatusChangeNote']?.setValidators(Validators.required);
        }
        else {
            this.frmUserLocations?.controls['StatusChangeNote']?.clearValidators();
        }
        this.frmUserLocations?.controls['StatusChangeNote']?.updateValueAndValidity();
        this.toggleTrue = true;
        this.openStatusChangeConfirmationModal();
    }

    openStatusChangeConfirmationModal = () => {
        const todayDate = this.datepipe.transform(new Date(), 'MM/dd/yyyy');
        const name = this.user?.FirstName + ' ' + this.user?.LastName;
        if (this.user?.IsActive) {
            this.confirmationModalData.header = this.localize.getLocalizedString('Status Change Confirmation');
            this.confirmationModalData.message = this.localize.getLocalizedString('Are you sure you want to activate ' + name + ' ' + 'effective ' + todayDate + ' ?');
            this.confirmationModalData.confirm = this.localize.getLocalizedString('Continue');
        }
        else {
            this.confirmationModalData.header = this.localize.getLocalizedString('Disable User Access');
            this.confirmationModalData.message = this.localize.getLocalizedString('Disabling user access will prevent this user from logging in to Fuse.');
            this.confirmationModalData.confirm = this.localize.getLocalizedString('Continue');
        }
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
                    if (this.user?.IsActive == true && this.user?.UserId) {
                        this.getInactiveUserRoles();
                    }
                    this.userAccessChanged.emit(this.user?.IsActive);
                    this.confirmationRef.close();
                    break;
                case 'close':
                    this.confirmationRef.close();
                    this.user.IsActive = !this.user?.IsActive;
                    break;
            }
        });
    }

    changeReasonNote = () => {
        this.user.StatusChangeNote = this.frmUserLocations?.controls["StatusChangeNote"]?.value;
        this.changeReasonData.emit(this.user?.StatusChangeNote);
    }

    // get all user roles
    getUserRoles = () => {
        this.teamMemberLocationService.getUserRoles(this.user?.UserId).then((res) => {
            this.userRoles = res;
            this.getUserLocationsSetups();
        }, () => {
            this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve {0}. Refresh the page to try again.', ['Roles']), this.localize.getLocalizedString('Server Error'));
        });
    };

    // filter list to remove any active user locations        
    getAvailableLocations = () => {
        this.availableLocations = [];
        // build a list of locationIds on existing userLocationSetups (exclude ones with ObjectState.Delete)
        const activeLocations = this.userLocationSetups?.filter(location => location?.ObjectState !== SaveStates.Delete);
        if (activeLocations) {
            this.availableLocations = this.permittedLocations?.filter(v => !activeLocations.some(x => x.LocationId == v.LocationId));
        }
    };

    // NOTE cannot remove a location if you have scheduled appointments /provider room occurrences at this location 
    // This method disables the trash can button and adds a tooltip for a location if provider has provider hours or appointments for this location
    // Also sets the remove button tooltip for this location       
    setCanRemoveLocation = (userLocationSetup) => {
        userLocationSetup.$$RemoveButtonTooltip = this.localize.getLocalizedString('Remove {0}', ['User Location Setup']);
        userLocationSetup.$$CanRemoveLocation = true;
        if (this.user?.$$scheduleStatuses && userLocationSetup?.LocationId) {
            userLocationSetup.$$CanRemoveLocation = true;

            // does this user have a scheduleStatus record for this location
            const scheduleStatusRecord = this.user.$$scheduleStatuses?.find(record =>
                record?.LocationId === userLocationSetup?.LocationId
            );
            if (scheduleStatusRecord) {
                if (scheduleStatusRecord?.HasProviderAppointments || scheduleStatusRecord?.HasProviderRoomOccurrences) {
                    userLocationSetup.$$CanRemoveLocation = false;
                }
            }
        }
        if (userLocationSetup.$$CanRemoveLocation === false) {
            userLocationSetup.$$RemoveButtonTooltip = this.localize.getLocalizedString('This {0} cannot be changed because he/she has scheduled hours and/or scheduled appointments.', ['provider']);
        }
    };

    removeUserLocationSetup = (userLocationSetup: UserLocationSetup) => {
        // can we remove this location
        this.deleteLocation = true;
        this.setCanRemoveLocation(userLocationSetup);
        if (userLocationSetup?.$$CanRemoveLocation && this.hasDeleteAccess) {
            if (userLocationSetup?.UserProviderSetupLocationId) {
                userLocationSetup.ObjectState = SaveStates.Delete;
                // mark all location roles for this location as ObjectState.Delete
                userLocationSetup.$$UserLocationRoles?.forEach(role => {
                    if (role.$$ObjectState === 'Add') {
                        role.$$ObjectState = SaveStates.None;
                    } else {
                        role.$$ObjectState = SaveStates.Delete;
                    }
                });
                this.userLocationSetupsFilter();
            } else {
                const newIndex = this.userLocationSetups?.findIndex(locationSetup => {
                    return Number(locationSetup?.LocationId) === Number(userLocationSetup?.LocationId);
                });
                if (newIndex !== -1) {
                    this.userLocationSetups?.splice(newIndex, 1);
                    this.userLocationSetupsFilter();
                }
            }
            // rebuild a list of locations that can be added
            this.getAvailableLocations();
        }
    }

    rxRoleFilter = (item) => {
        if (item) {
            return item?.RoleName?.toLowerCase() === RoleNames.RxUser.toLowerCase()
                ? false
                : true;
        }
        return true;
    }

    deletedRolesFilter = (userLocationRoles: Array<UserLocationRoles>): Array<UserLocationRoles> => {
        return userLocationRoles?.filter(practiceRole => practiceRole?.$$ObjectState !== SaveStates.Delete)
    }

    checkForUserStateLicense = (locationId) => {
        const ofcLocation = this.permittedLocations?.find(p => p.LocationId === locationId);
        let returnState = "";
        if (ofcLocation) {
            const locationHasLicense = this.updatedLicenses?.filter(license => license?.StateAbbreviation === ofcLocation?.State);
            if (locationHasLicense?.length === 0) {
                returnState = ofcLocation?.State?.toString();
                return returnState;
            }
        }
        return returnState;
    }

    validateStateLicenseByLocation = () => {
        this.noStateLicense = false;
        this.needLicenseStates = '';
        this.userLocationSetups?.forEach(userLocationSetups => {
            const stateWithNoLicense = this.checkForUserStateLicense(userLocationSetups?.LocationId);
            if (stateWithNoLicense) {
                const stateInListIndex = this.validatedStates?.findIndex(state =>
                    state.StateAbbreviation == stateWithNoLicense
                );
                if (!(stateInListIndex > -1)) {
                    // array of states that need licenses
                    this.validatedStates?.push({ StateAbbreviation: stateWithNoLicense });
                    // display for licenses needed
                    this.needLicenseStates += `${String(stateWithNoLicense)}, `;
                }
            }
        })
        if (this.needLicenseStates !== '') {
            this.needLicenseStates = this.needLicenseStates?.toString()?.slice(0, -2);
        }
        const needLicenseStatesMessage = this.needLicenseStates === '' ? '' : 'Please add a State License for ' + this.needLicenseStates;
        //$rootScope.$broadcast('stateLicenseValidation', needLicenseStatesMessage);
        this.stateLicenseValidation.emit(needLicenseStatesMessage);
    }

    viewRoles = () => {
        this.viewCompareRolesModal.ngOnInit();
        this.viewCompareRolesModal?.openViewComapreModal(ViewCompareRoleType.view);
        document.body.style.overflow = 'hidden';
    }

    compareRoles = () => {
        this.viewCompareRolesModal.ngOnInit();
        this.viewCompareRolesModal?.openViewComapreModal(ViewCompareRoleType.compare);
        document.body.style.position = 'fixed';
    }

    //#region InactiveUser and store roles

    // after restoring user access, adds aaretained location role back to user by location
    addLocationRole = (roleId, locationId) => {
        if (roleId && locationId) {
            // look up role in list
            const locationRoleToAdd = this.roles?.find(role => {
                return role?.RoleId === Number(roleId);
            });
            if (locationRoleToAdd) {
                // find matching location
                const matchingLocationSetup = this.userLocationSetups?.find(userLocationSetup => {
                    return Number(userLocationSetup?.LocationId) === Number(locationId);
                });

                if (matchingLocationSetup) {
                    // add to users location roles and set ObjectState
                    locationRoleToAdd.$$ObjectState = SaveStates.Add;
                    matchingLocationSetup?.$$UserLocationRoles?.push(locationRoleToAdd);
                    this.userLocationSetupsDataChanged.emit(this.userLocationSetups);
                }
            }
        }
    };

    // after restoring user access, adds a retained practice role roles back to user
    addPracticeRole = (roleId) => {
        if (roleId) {
            // look up role in list
            const practiceRoleToAdd = this.roles?.find(role => {
                return role?.RoleId === Number(roleId);
            });

            if (practiceRoleToAdd) {
                // add to users location roles and set ObjectState
                practiceRoleToAdd.$$ObjectState = SaveStates.Add;
                this.user.$$UserPracticeRoles = Array<UserLocationRoles>();
                this.user?.$$UserPracticeRoles?.push(practiceRoleToAdd);
            }
        }

        // if user has a practice admin role, set them to practice admin
        this.user.$$UserPracticeRoles?.find(practiceRole => {
            if (practiceRole?.RoleId === this.practiceAdminRole?.RoleId) {
                this.user.$$isPracticeAdmin = true;
                this.frmUserLocations?.controls['IsPracticeAdmin']?.setValue('true');
            }
        });

        this.onUpdateUserInfo.emit(this.user);
    };

    // gets roles that were stored  when user access set to false
    getInactiveUserRoles = () => {
        this.rolesFactory.GetInactiveUserAssignedRoles(this.user?.UserId).then((res) => {
            const inactiveUserRole = res?.Value;

            // merge these into new roles and mark as add
            inactiveUserRole?.UserRoleLocationInactiveDtos?.forEach(userLocationRole => {
                // add location roles
                this.addLocationRole(userLocationRole?.RoleId, userLocationRole?.LocationId);
            });

            inactiveUserRole?.UserRolePracticeInactiveDtos?.forEach(userPracticeRole => {
                // add practice roles                
                this.addPracticeRole(userPracticeRole?.RoleId);
            });
        });
    };

    sendLicensesToValidate = (args) => {
        if (args) {
            this.updatedLicenses = args;
        }
        this.validateStateLicenseByLocation();
    }

    addUserLocationSetup = () => {
        // NOTE open modal to add a user location
        this.userLocationSetupBackup = null;
        if (this.hasAddEditAccess) {
            this.viewLocationSetupCrudModal?.openLocationSetupCrudModal(null);
        }
        document.body.style.overflow = 'hidden';
    }

    editUserLocationSetup = (userLocationSetup: UserLocationSetup) => {
        this.editLocation = true;
        this.userLocationSetupBackup = null;
        // keep a backup of this userLocationSetup from list if it is a new user location           
        if (!userLocationSetup?.UserProviderSetupLocationId) {
            const newIndex = this.userLocationSetups?.findIndex(locationSetup => locationSetup?.LocationId === userLocationSetup?.LocationId);
            if (newIndex !== -1) {
                this.userLocationSetupBackup = this.userLocationSetups[newIndex];
            }
        }
        if (this.hasAddEditAccess) {
            this.viewLocationSetupCrudModal?.openLocationSetupCrudModal(userLocationSetup);
        }
    }

    // when user completes new location setup or edit, merge that data to the userLocationSetup table        
    // on cancel check to see if we have userLocationSetup changes
    addUserLocationSetupToList = (locationSetup: UserLocationSetup) => {
        if (locationSetup) {
            locationSetup.ProviderTypeId = Number(locationSetup?.ProviderTypeId);
            locationSetup.LocationId = Number(locationSetup?.LocationId);

            //Initialize array if it undefined or null
            if (!this.userLocationSetups) {
                this.userLocationSetups = new Array<UserLocationSetup>();
            }
            if (!locationSetup?.UserProviderSetupLocationId) {
                //This filter is only work in case of Adding new location case
                //Select roles which only has Add/Update $$ObjectState as record is not created in db hence Delete $$ObjectState will not work in this case
                const addFlagRoles = locationSetup?.$$UserLocationRoles?.filter(x => x?.$$ObjectState != SaveStates.Delete);
                if (addFlagRoles) {
                    locationSetup.$$UserLocationRoles = addFlagRoles;
                }

                const matchingIndex = this.userLocationSetups?.findIndex((userLocationSetup) => userLocationSetup?.LocationId === locationSetup?.LocationId && locationSetup?.ObjectState === SaveStates.Delete);

                if (matchingIndex > -1) {
                    // if this is a new userLocationSetup that matches a userLocationSetup that has an objectState of Delete
                    // merge to the existing and change objectState to Update                   
                    locationSetup.DataTag = this.userLocationSetups[matchingIndex]?.DataTag;
                    locationSetup.UserProviderSetupLocationId = this.userLocationSetups[matchingIndex]?.UserProviderSetupLocationId;
                    locationSetup.ObjectState = SaveStates.Update;
                    // UserLocationRoles
                    // If the existing UserLocationSetup has a role that matches the new one, we don't need to do anything with it
                    // otherwise add the role to be deleted to the collection
                    this.userLocationSetups[matchingIndex]?.$$UserLocationRoles?.forEach((userLocationRole) => {
                        const matchingRole = locationSetup?.$$UserLocationRoles?.find((newUserLocationRole) => newUserLocationRole?.RoleId === userLocationRole?.RoleId);
                        if (matchingRole) {
                            userLocationRole.$$ObjectState = SaveStates.None;
                        } else {
                            locationSetup?.$$UserLocationRoles?.push(userLocationRole);
                        }
                    });
                    this.userLocationSetups?.splice(matchingIndex, 1);
                    this.userLocationSetups?.push(locationSetup);
                }
            }
            // if this is a new userLocationSetup that is being edited, replace in the list
            // otherwise push to list
            if (!(locationSetup?.UserProviderSetupLocationId)) {
                const newIndex = this.userLocationSetups?.findIndex((userLocationSetup) => userLocationSetup?.LocationId === locationSetup?.LocationId);
                if (newIndex > -1) {
                    this.userLocationSetups?.splice(newIndex, 1);
                    this.userLocationSetups?.push(locationSetup);
                } else {
                    // if we have a backup then this userLocationSetup was new, then edited, and the location has been changed
                    // in this case we need to remove the backup from the list
                    if (this.userLocationSetupBackup !== null) {
                        const backupIndex = this.userLocationSetups?.findIndex((userLocationSetup) => userLocationSetup?.LocationId === this.userLocationSetupBackup?.LocationId);
                        if (backupIndex > -1) {
                            this.userLocationSetups?.splice(backupIndex, 1);
                        }
                    }
                    this.userLocationSetups?.push(locationSetup);
                }
            }
            // if this is an existing setup, replace it in the list
            if (locationSetup?.UserProviderSetupLocationId) {
                const updateIndex = this.userLocationSetups?.findIndex((userLocationSetup) => userLocationSetup?.UserProviderSetupLocationId === locationSetup?.UserProviderSetupLocationId);
                if (updateIndex > -1) {
                    this.userLocationSetups?.splice(updateIndex, 1);
                    this.userLocationSetups?.push(locationSetup);
                }
            }

            // reset merged data
            // merge location info to the userLocationSetups
            this.teamMemberLocationService.getMergedLocationData(this.userLocationSetups, this.locations, this.permittedLocations);
            // merge user info to the userLocationSetups
            this.teamMemberLocationService.getMergedUserData(this.userLocationSetups, this.users, this.providerTypes);

            //sorting for location
            // sort after NameLine has been added
            this.userLocationSetups = this.userLocationSetups?.sort((a, b) => a?.$$Location?.NameLine1?.toLowerCase()?.localeCompare(b?.$$Location?.NameLine1?.toLowerCase()));

            this.checkLocationsForRoles();
            // notify user they will need to sign out and back in Only if they are an existing user
            if (this.user.UserId) {
                this.displayPracticeRolesChangedMessage = true;
            }
            this.userLocationsErrors.NoUserLocationsError = false;
            this.userLocationSetupsFilter();
        }
    }

    rxRxUserTypeChanges = (user) => {
        if (user?.$$UserPracticeRoles == null || user?.$$UserPracticeRoles == undefined) {
            user.$$UserPracticeRoles = [];
        }

        if (user?.RxUserType === 1 || user?.RxUserType === 2 || user?.RxUserType === 3) {
            if (this.rxAccessRole) {
                //const rxRole = this.rxRoleFilter(user);
                const rxRole = user?.$$UserPracticeRoles?.filter(role => {
                    return !this.rxRoleFilter(role)
                })
                if (!rxRole || rxRole?.length == 0) {
                    this.rxAccessRole.$$ObjectState = SaveStates.Add;
                    user?.$$UserPracticeRoles?.push(this.rxAccessRole);
                }
            }
        } else if (this.rxAccessRole) {
            const index = user?.$$UserPracticeRoles?.findIndex((userPracticeRole) =>
                userPracticeRole.RoleId === this.rxAccessRole?.RoleId
            );
            if (index > -1) {
                user.$$UserPracticeRoles[index].$$ObjectState = SaveStates.Delete;
            }
        }

    }

    rxSettingChanges = (rxSettings, user) => {
        if (rxSettings) {
            if (user?.$$UserPracticeRoles == null || user?.$$UserPracticeRoles == undefined) {
                user.$$UserPracticeRoles = [];
            }
            if (rxSettings?.locations && rxSettings?.roles) {
                if (this.rxAccessRole) {
                    //  const rxRole = this.rxRoleFilter(user);
                    const rxRole = user?.$$UserPracticeRoles?.filter(role => {
                        return !this.rxRoleFilter(role)
                    })
                    if (!rxRole || rxRole?.length == 0) {
                        this.rxAccessRole.$$ObjectState = SaveStates.Add;
                        user?.$$UserPracticeRoles?.push(this.rxAccessRole);
                    }
                }
            } else if (this.rxAccessRole) {
                const index = user?.$$UserPracticeRoles?.findIndex((userPracticeRole) => userPracticeRole?.RoleId === this.rxAccessRole?.RoleId);
                if (index > -1) {
                    user.$$UserPracticeRoles[index].$$ObjectState = SaveStates.Delete;
                }
            }
        }
    }

    getRxRoleFilter = () => {
        return this.teamMemberLocationService.rxRoleFilter(this.user);
    }
}
