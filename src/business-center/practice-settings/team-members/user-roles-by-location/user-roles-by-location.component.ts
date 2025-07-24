import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Location } from '../../location';
import { Roles } from '../team-member';
import { ViewCompareRoleType } from '../view-compare-roles/roles-matrix.model';
import { ViewCompareRolesComponent } from '../view-compare-roles/view-compare-roles.component';
import { OrderByPipe } from 'src/@shared/pipes';
import { SaveStates } from 'src/@shared/models/transaction-enum';

@Component({
    selector: 'user-roles-by-location',
    templateUrl: './user-roles-by-location.component.html',
    styleUrls: ['./user-roles-by-location.component.scss']
})
export class UserRolesByLocationComponent implements OnInit {
    breadCrumbs: { name: string, path: string, title: string }[] = [];
    authAccess = { Create: false, Delete: false, Edit: false, View: false }
    dataForCrudOperation = {
        BreadCrumbs: []
    }
    orderBy = {
        field: 'LastName',
        asc: true
    }

    selectedLocations = [];
    currentUserLocations = [];
    currentLocation: { id: number, name: string };
    locations: Location[] = [];
    roles: Roles[] = [];
    rolesList: Array<{ text: string, value: number, IsDisabled: boolean, subcategory: string }> = [];
    users = [];
    locationRoles = [];
    filterRoles = [];
    copyUser = [];

    searchNamesKeyword = "";
    titleMessage: string;
    numberOfRolesToProcess = 0;
    selectedCurrentLocation: number;

  loadingUsers= false;
  savingRoles= false;
  dataHasChanged= false;
  hasErrors= false;
    formIsValid = true;
  loading= false;
  hasFailures= false;
    teamMemberUrl = "#/BusinessCenter/Users/Edit/";


    @ViewChild(ViewCompareRolesComponent) public viewCompareRolesModal: ViewCompareRolesComponent;

    constructor(
        @Inject('toastrFactory') private toastrFactory,
        @Inject('localize') private localize,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('$location') private $location,
        @Inject('$rootScope') private $rootScope,
        @Inject('UsersFactory') private usersFactory,
        @Inject('UserServices') private userServices,
        @Inject('RoleNames') private roleNames,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('RolesFactory') private rolesFactory,
        @Inject('ModalFactory') private modalFactory,
        @Inject('SoarConfig') private soarConfig,
        private httpClient: HttpClient) { }


    ngOnInit(): void {
        this.getPageNavigation();
        this.getCurrentUserLocations();
        this.getCurrentLocation();
        this.getAccess();
        this.getRoles();
        this.loading = true;
    }

    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('Assign Roles'),
                path: '/BusinessCenter/Users/',
                title: 'Assign Roles'
            }
        ];
        this.dataForCrudOperation.BreadCrumbs = this.breadCrumbs;
    }

    getAccess = () => {
        this.authAccess = this.usersFactory.access();
        if (!this.authAccess.View) {
            this.toastrFactory.error(this.patSecurityService.generateMessage('plapi-user-usrrol-read'), this.localize.getLocalizedString('Not Authorized'));
            this.$location.path('/');
        }
    }

    setSelectedLocation = () => {
        if (this.currentLocation && this.currentUserLocations) {
            const index = this.currentUserLocations.findIndex(x => x.LocationId == this.currentLocation?.id);
            if (index > -1) {
                this.selectedLocations?.push(this.currentUserLocations[index]);
            }
        }
    }

    getCurrentUserLocations = () => {
        this.loadingUsers = true;
        if (this.$rootScope.patAuthContext) {
            const currentUser = this.$rootScope.patAuthContext.userInfo;

            // get all practice locations
            this.locations = this.referenceDataService.get(this.referenceDataService.entityNames.locations);

            // get practice roles for current user
            this.rolesFactory.UserPracticeRoles(currentUser?.userid).then((res) => {
                const userRoles = res?.Result;
                if (userRoles?.length > 0) {
                    this.currentUserLocations = this.locations;
                    // set current user current location as selected
                    this.setSelectedLocation();
                } else {
                    // or if none get location roles for current user
                    this.locations?.forEach((location) => {
                        this.rolesFactory.UserLocationRoles(currentUser?.userid, location?.LocationId).then((res) => {
                            const locationRoles = res?.Result;

                            // if user has roles add this location to user
                            if (locationRoles?.length > 0) {
                                this.currentUserLocations?.push(location);
                                this.setSelectedLocation();
                            }
                        });
                    });
                }
            });
            this.getPracticeUsers();
        }
    }


    // get a list of all users for practice
    getPracticeUsers = () => {
        this.loadingUsers = true;
        this.usersFactory?.Users().then((res) => {
            this.loading = false
            this.users = res?.Value;
            // Filter user by role        
            let tempUsers = [];
            this.users?.forEach(user => {
                const userRole = user?.Roles?.find(x => x?.RoleName?.toLowerCase() == 'patterson support admin');
                if (!userRole) {
                    tempUsers.push(user);
                }
            });
            this.users = tempUsers;
            this.users?.forEach((user) => {
                user.displayName = this.teamMemberName(user);

                // initialize lists
                user.$$UserLocations = [];
                user.$$UserPracticeRoles = [];
                user.$$AvailableRoles = [];
            });         
            this.getUsersRoles(this.users);
            this.copyUser = this.users;
        });
    }
    //#endregion

    getCurrentLocation = () => {
        const cachedLocation = JSON.parse(sessionStorage?.getItem('userLocation'));
        this.currentLocation = typeof cachedLocation !== 'undefined' ? cachedLocation : null;
        if (this.currentLocation && this.currentLocation?.id) {
            this.selectedCurrentLocation = this.currentLocation?.id;
        }
    }


    teamMemberName = (person) => {
        let displayName = '';
        if (!person) {// If person is not available then return blank
            return '';
        }
        // set suffix (handles patient (Suffix) or user (SuffixName)
        const suffix = person?.Suffix ? person?.Suffix : (person?.SuffixName ? person?.SuffixName : "");
        const preferredName = person?.PreferredName ? `(${person.PreferredName as string})` : "";// Set preferredName
        const middleName = person?.MiddleName ? `${(person.MiddleName as string)?.charAt(0) ?? ""}.` : "";// Set middleName

        displayName = ([person?.FirstName, preferredName, middleName].filter((text) => { return text; }).join(' ')) + " " + [person?.LastName, suffix].filter((text) => { return text; }).join(', ');
        return displayName?.trim(); // remove trailing whitespace from the computed name.
    }

    // add location role to user
    setUserLocationRoles = (user, locationId, locationRoles) => {
        if (locationRoles?.length > 0) {
            const userLocation = { LocationId: locationId, $$UserLocationRoles: locationRoles }
            userLocation.$$UserLocationRoles = locationRoles;
            user.$$UserLocations?.push(userLocation);
            this.setAvailableRoles(user);
        }
    }

    //#region practice roles

    setUserPracticeRoles = (user, practiceRoles) => {
        // filter out Rx roles - not to be displayed
        const rolesToDisplay = practiceRoles?.filter(role => { return this.rxRoleFilter(role) })
        if (rolesToDisplay?.length > 0) {
            // practice roles exist for all current locations so add these to the user locations
            this.currentUserLocations?.forEach((location) => {
                const userLocation = { LocationId: location?.LocationId, }
                user.$$UserLocations?.push(userLocation);
            });
            rolesToDisplay?.forEach((userRole) => {
                user.$$UserPracticeRoles.push(userRole);
            });
        }

    }
    //#endregion

    setUserRoles = (user, userRoles) => {
        if (userRoles?.PracticeRoles) {
            Object.values(userRoles?.PracticeRoles)?.forEach((practiceRoles) => {
                this.setUserPracticeRoles(user, practiceRoles);
            });
        }
        if (userRoles?.LocationRoles) {
            Object.entries(userRoles?.LocationRoles)?.forEach(([key, locationRoles]) => {
                const locationId = parseInt(key);
                this.setUserLocationRoles(user, locationId, locationRoles);
            });
        }
    }

    // get all roles for each user
    getUsersRoles = (users) => {
        users.forEach((user) => {
            this.rolesFactory?.UserRoles(user?.UserId).then((res) => {
                const userRoles = res?.Result;
                this.setUserRoles(user, userRoles);
                this.loadingUsers = false;
            });
        });
    }
    //#endregion

    getRoles = () => {
        this.loading = false;
        this.rolesFactory?.Roles().then((res) => {
            this.roles = res?.Result;
            this.rolesList = this.roles?.filter(role => role && role.RoleName?.toLowerCase() != 'patterson support admin').map(role => {
                return {
                    text: role?.RoleName,
                    value: role?.RoleId,
                    IsDisabled: false,
                    subcategory: 'Inactive'
                }
            });
            this.setLocationRoles();
        });
    }

    // roles only available for location roles
    setLocationRoles = () => {
        this.locationRoles = [];
        this.roles?.forEach((role) => {
            if ((role?.RoleName)?.toLowerCase() !== this.roleNames?.RxUser?.toLowerCase() && (role?.RoleName)?.toLowerCase() !== this.roleNames?.PracticeAdmin?.toLowerCase() && (role?.RoleName)?.toLowerCase() != 'patterson support admin') {
                this.locationRoles?.push(role);
            }
        })
    }

    // set the available roles for each teammember at initialization
    setAvailableRoles = (user) => {
        // add dynamic column for available roles per location
        user.$$UserLocations?.forEach((userLocation) => {
            this.setAvailableRolesByUserLocation(userLocation);
        });
    }

    // this function must be called when a role is added or removed from user location
    setAvailableRolesByUserLocation = (userLocation) => {
        userLocation.$$AvailableRoles = [];
        this.locationRoles?.forEach((role) => {
            const hasRole = userLocation?.$$UserLocationRoles?.find(x => x.RoleId == role?.RoleId);
            if (!hasRole) {
                userLocation.$$AvailableRoles = userLocation.$$AvailableRoles.filter(x => x.RoleName?.toLowerCase() != 'patterson support admin');
                userLocation.$$AvailableRoles?.push(role)
            }
        });
        const orderPipe = new OrderByPipe();
        userLocation.$$AvailableRoles = orderPipe.transform(userLocation.$$AvailableRoles, { sortColumnName: "RoleName", sortDirection: this.orderBy.asc });
    }



    selectedLocationChange = (event) => {
        this.selectedLocations = [];
        const selectedLocationName = this.currentUserLocations?.find(x => x.LocationId == event?.LocationId);
        this.currentLocation.name = selectedLocationName?.NameLine1;
        this.currentLocation.id = selectedLocationName?.LocationId;
        this.selectedLocations?.push(event);
    }

    // function to apply orderBy functionality
    changeSortingForGrid = (field) => {
        const asc = this.orderBy.field === field ? !this.orderBy.asc : true;
        this.orderBy = {
            field: field, asc: asc
        }
        this.users = this.copyUser;
        this.users?.sort(x => x.LastName).reverse();
    }


    // always filter rx role from dropdown
    rxRoleFilter = (item) => {
        if (item) {
            return ((item?.RoleName)?.toLowerCase() === this.roleNames?.RxUser?.toLowerCase()) ? false : true;
        }
        return true;
    }

    // filters deleted roles from userLocationRoles
    deletedRolesFilter = (userLocationRoles) => {
        if (userLocationRoles && userLocationRoles?.$$ObjectState) {
            return userLocationRoles.$$ObjectState !== SaveStates?.Delete;
        }
        return true;
    }

    // filter locations by selected location
    locationsFilter = (item) => {
        if (item != null && this.selectedLocations != null && this.selectedLocations?.length > 0 && this.selectedLocations[0] != null) {
            return item?.LocationId === this.selectedLocations[0]?.LocationId;
        }
        return true;
    }


    // filter team members by roles in a selected location
    teamMemberLocationFilter = (teamMember) => {
        let match = false;

        // if team member is practice admin can see all locations
        if (teamMember && teamMember?.$$UserPracticeRoles && teamMember?.$$UserPracticeRoles?.length > 0) {
            match = true;
        }
        else {
            if (teamMember && teamMember?.$$UserLocations && teamMember?.$$UserLocations?.length > 0) {
                teamMember?.$$UserLocations?.forEach((location) => {
                    if (location?.LocationId === this.selectedLocations[0]?.LocationId) {
                        match = true;
                    }
                })
            }
        }
        return match;
    }

    teamMemberRoleByLocationFilter = (teamMember) => {
        let match = false;
        // if member is practice admin can see all locations, filter by only roles
        if (teamMember && teamMember?.$$UserPracticeRoles && teamMember?.$$UserPracticeRoles?.length > 0) {
            if (this.filterRoles?.length === 0) {
                match = true;
            }
            else {
                this.filterRoles?.forEach((role) => {
                    const roleIndex = teamMember?.$$UserPracticeRoles?.findIndex(x => x.RoleId == role?.Id);
                    if (roleIndex > -1) {
                        match = true;
                    }
                });
            }
            // otherwise filter on locations and roles
        } else {
            if (teamMember && teamMember?.$$UserLocations && teamMember?.$$UserLocations?.length > 0 && this.selectedLocations[0]) {
                // only filter on this location
                const locationIndex = teamMember?.$$UserLocations?.findIndex(x => x.LocationId == this.selectedLocations[0]?.LocationId);
                if (locationIndex > -1) {
                    if (this.filterRoles?.length === 0) {
                        match = true
                    }
                    else {
                        this.filterRoles?.forEach((role) => {
                            const roleIndex = teamMember?.$$UserLocations[locationIndex]?.$$UserLocationRoles.findIndex(x => x.RoleId == role.Id);
                            if (roleIndex > -1) {
                                match = true;
                            }
                        });
                    }
                }
            }
        }
        return match;
    }

    onSearch = (teamMember) => {
        this.users = this.copyUser;
        if (teamMember && teamMember?.length > 0) {
            const filteredUsers = [];
            this.users?.forEach(x => {
                if (this.teamMemberName(x)?.toLowerCase()?.includes(teamMember?.toLowerCase())) {
                    filteredUsers?.push(x);
                }
            });
            this.users = filteredUsers;
        }
        else {
            this.users = this.copyUser;
        }
    }

    //#region add remove roles
    // add $$UserLocationRoles from select list to userLocation.$$UserLocationRoles
    addLocationRole = (role, userLocation) => {
        if (this.authAccess.Create) {
            // if userLocation.$$UserLocationRoles has an objectState of delete, just switch back to null
            const roleIndex = userLocation?.$$UserLocationRoles.findIndex(x => x.RoleId ==  role?.RoleId);
            if (roleIndex > -1) {
                if (userLocation?.$$UserLocationRoles[roleIndex]?.$$ObjectState && userLocation?.$$UserLocationRoles[roleIndex]?.$$ObjectState === SaveStates?.Delete) {
                    userLocation.$$UserLocationRoles[roleIndex].$$ObjectState = SaveStates?.None;
                }
            }
            else {
                // otherwise this is a new role for user, set object state to add
                const newLocationRole = {
                    RoleId: role?.RoleId,
                    RoleName: role?.RoleName,
                    RoleDesc: role?.RoleDesc,
                    $$ObjectState: SaveStates?.Add
                }
                userLocation?.$$UserLocationRoles?.push(newLocationRole);
            }
            this.dataHasChanged = true;
            this.validateUserLocationRoles(userLocation);
            this.setAvailableRolesByUserLocation(userLocation);
            userLocation.$$SelectedRole = [];
        }
    }

    // each team member with location roles must have at least one role per location to save
    validateUserLocationRoles = (userLocation) => {
        if (userLocation?.$$UserLocationRoles) {
            const numberOfLocationRoles = userLocation?.$$UserLocationRoles?.filter(x => x.$$ObjectState != SaveStates?.Delete);
            userLocation.$$NoRoleError = (numberOfLocationRoles?.length === 0);
            return !(numberOfLocationRoles?.length === 0)
        }
        return true;
    }

    // remove role from $$UserLocationRoles
    removeLocationRole = (userLocationRole, userLocation) => {
        if (this.authAccess?.Delete) {
            // if role hasn't been saved yet, just delete object state
            if (userLocationRole?.$$ObjectState && userLocationRole?.$$ObjectState === SaveStates?.Add) {
                delete userLocationRole.$$ObjectState;
                const index = userLocation?.$$UserLocationRoles.findIndex(x => x.RoleId == userLocationRole?.RoleId);
                if (index !== -1) {
                    userLocation?.$$UserLocationRoles?.splice(index, 1);
                }
            }
            else {
                userLocationRole.$$ObjectState = SaveStates?.Delete;
            }
            this.dataHasChanged = true;
            this.validateUserLocationRoles(userLocation);
            // adding removed one to available list and reordering
            userLocation.$$SelectedRole = null;
            userLocation?.$$AvailableRoles?.push(userLocationRole);
            const orderPipe = new OrderByPipe();
            userLocation.$$AvailableRoles = orderPipe.transform(userLocation.$$AvailableRoles, { sortColumnName: "RoleName", sortDirection: this.orderBy.asc });
        }
    }

    //#endregion


    // helper function to set state on list of userRoles
    setObjectState = (userRoles, state) => {
        userRoles?.forEach((userRole) => {
            userRole.$$NewObjectState = state;
        });
    }

    // helper function to to create object required by enterprise api
    createUserRolesDto = (userRoles, locationId) => {
        // NOTE currently we can only add LocationRoles from this page
        const userRolesDto = { EnterpriseRoles: {}, PracticeRoles: {}, LocationRoles: {} }
        const roles = [];
        for (let i = 0; i < userRoles?.length; i++) {
            roles?.push(userRoles[i]?.RoleId);
        }
        userRolesDto.LocationRoles[locationId] = roles;
        return userRolesDto;
    }


    // crud method to remove role from user
    removeLocationAssignment = (userId, userRoles, locationId) => {
        if (this.authAccess?.Delete) {
            const userRolesDto = this.createUserRolesDto(userRoles, locationId)
            return new Promise((resolve, reject) => {
                const url = `${String(this.soarConfig.webApiUrl)}/api/users/roles/${String(userId)}`;
                const options = {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                    }),
                    body: userRolesDto
                }
                this.httpClient.delete(url, options)
                    .toPromise()
                    .then(res => {
                        resolve(res);
                        this.setObjectState(userRoles, SaveStates?.Successful);
                    }, err => { // Error
                        reject(err);
                        this.setObjectState(userRoles, SaveStates?.Failed);
                    })
            });
        }
    }

    // crud method to add role to user
    addLocationAssignment = (userId, userRoles, locationId) => {
        return new Promise((resolve, reject) => {
            if (this.authAccess?.Create) {
                const userRolesDto = this.createUserRolesDto(userRoles, locationId)
                this.userServices?.UserRoles?.save({ userId: userId }, userRolesDto).$promise.then((res) => {
                    resolve(res);
                    this.setObjectState(userRoles, SaveStates?.Successful);
                },
                    () => {
                        reject();
                        this.setObjectState(userRoles, SaveStates?.Failed);
                    });
            }
        });
    }

    // queue processes for adding and removing role assignments
    processRoleAssignmentsByTeamMember = (teamMember) => {
        if (teamMember && teamMember?.$$UserLocations && teamMember?.$$UserLocations?.length > 0) {
            const processes = [];
            // only filter on this location
            const locationIndex = teamMember?.$$UserLocations.findIndex(x => x.LocationId == this.selectedLocations[0]?.LocationId);
            if (locationIndex > -1) {
                const userLocation = teamMember?.$$UserLocations[locationIndex];
                // get all of the 'saveStates.Add' for this team member and location

                if (userLocation?.$$UserLocationRoles) {
                    const rolesToAdd = userLocation?.$$UserLocationRoles?.filter(x => x.$$ObjectState == SaveStates?.Add);
                    if (rolesToAdd && rolesToAdd?.length) {
                        processes?.push(this.addLocationAssignment(teamMember?.UserId, rolesToAdd, userLocation?.LocationId));
                    }
                    // get all of the 'saveStates.Delete' for this team member
                    const rolesToRemove = userLocation?.$$UserLocationRoles.filter(x => x.$$ObjectState == SaveStates?.Delete);
                    if (rolesToRemove && rolesToRemove?.length) {
                        processes.push(this.removeLocationAssignment(teamMember?.UserId, rolesToRemove, userLocation?.LocationId));
                    }
                }
            }
            return processes;
        }
    }


    // update failed role assignments by userLocation
    updateRoleAssignments = (userLocation, userLocationRole) => {
        if (userLocationRole?.$$NewObjectState === SaveStates?.Failed) {
            // handling for failed deletes

            // handling for failed adds
            if (userLocationRole?.$$ObjectState === SaveStates?.Add) {
                // remove role from userLocation.$$UserLocationRoles.
                const index = userLocation?.$$UserLocationRoles?.findIndex(x => x.RoleId == userLocationRole?.RoleId);
                if (index > -1) {
                    userLocation?.$$UserLocationRoles?.splice(index, 1);
                }
            }
            // reset object states
            userLocationRole.$$NewObjectState = SaveStates?.None;
            userLocationRole.$$ObjectState = SaveStates?.None;
        } else if (userLocationRole.$$NewObjectState === SaveStates?.Successful) {
            // handling for successful deletes
            if (userLocationRole.$$ObjectState === SaveStates?.Delete) {
                // remove role from userLocation.$$UserLocationRoles.
                const index = userLocation?.$$UserLocationRoles.findIndex(x => x.RoleId == userLocationRole?.RoleId);
                if (index > -1) {
                    userLocation?.$$UserLocationRoles?.splice(index, 1);
                }
            }
            // reset object states
            userLocationRole.$$NewObjectState = SaveStates?.None;
            userLocationRole.$$ObjectState = SaveStates?.None;
        }
    }


    // after save operation update the lists
    refreshList = () => {
        this.users.forEach((teamMember) => {
            if (teamMember && teamMember?.$$UserLocations && teamMember?.$$UserLocations?.length > 0) {
                // only filter on this location
                const locationIndex = teamMember?.$$UserLocations.findIndex(x => x.LocationId == this.selectedLocations[0]?.LocationId);
                if (locationIndex > -1) {
                    const userLocation = teamMember?.$$UserLocations[locationIndex];
                    if (userLocation?.$$UserLocationRoles) {
                        // for selected location handle roles update loop backwards because we will sometimes need to splice from list
                        for (let i = userLocation?.$$UserLocationRoles?.length - 1; i >= 0; i--) {
                            this.updateRoleAssignments(userLocation, userLocation?.$$UserLocationRoles[i]);
                        }
                        // reset availableRoles for this teamMember and location
                        this.setAvailableRolesByUserLocation(userLocation);
                    }
                }
            }
        });
    }

    processRoleAssignments = () => {
        const locationRolesToProcess = [];
        if (this.users) {
            this.users.forEach((teamMember) => {
                const processes = this.processRoleAssignmentsByTeamMember(teamMember);
                if (processes) {
                    processes.forEach((process) => {
                        locationRolesToProcess.push(process);
                    });
                }
            });
        }

        const processPromise = Promise.allSettled(locationRolesToProcess)
            .then((res) => {
                if (res) {
                    res?.forEach((result) => {
                        if (result?.status === "rejected") {
                            this.hasFailures = true;
                        }
                    });
                }
                if (this.hasFailures) {
                    this.toastrFactory.error(
                        this.localize?.getLocalizedString('Failed to save at least some of the {0}. Refresh the page and try again.', ['Roles']), 'Error');
                } else {
                    this.toastrFactory.success(this.localize?.getLocalizedString('Roles assigned successfully.'), this.localize?.getLocalizedString('Success'));
                }

                this.refreshList();
                this.dataHasChanged = false;
                this.savingRoles = false;
                this.hasFailures = false;
                window.location.href = '#/BusinessCenter/PracticeSettings/';
            })
            .catch(() => {
            });

        void processPromise;
    };

    validateRoleAssigments = () => {
        this.formIsValid = true;
        this.users.forEach((teamMember) => {
            // only on this location
            const locationIndex = teamMember.$$UserLocations?.findIndex(x =>x.LocationId == this.selectedLocations[0]?.LocationId);

            // only validate if user has location roles
            if (locationIndex > -1) {
                const userLocation = teamMember?.$$UserLocations[locationIndex];
                if (userLocation) {
                    if (this.validateUserLocationRoles(userLocation) === false) {
                        this.formIsValid = false;
                    }
                }
            }
        });
    }


    saveRolesByLocation = () => {
        this.validateRoleAssigments();
        if (this.formIsValid) {
            this.savingRoles = true;
            this.numberOfRolesToProcess = 0;
            this.processRoleAssignments();
        }
    }

    //#endregion

    //#region cancel changes

    cancelListChanges = () => {
        if (this.dataHasChanged === true) {
            this.modalFactory?.CancelModal().then(this.cancelChanges, () => {
            });
        }
        else {
            this.cancelChanges();
        }
    }


    cancelChanges = () => {
        // revert any unsaved added or deleted roles
        this.revertUnsavedChanges();
        this.dataHasChanged = false;
        window.location.href = '#/BusinessCenter/PracticeSettings/';
    }


    // on cancel changes revert all unsaved changes
    revertUnsavedChanges = () => {
        this.users.forEach((teamMember) => {

            // only on this location
            const locationIndex = teamMember.$$UserLocations?.findIndex(x => x.LocationId == this.selectedLocations[0]?.LocationId);
            if (locationIndex > -1) {
                const userLocation = teamMember?.$$UserLocations[locationIndex];
                if (userLocation.$$UserLocationRoles) {
                    for (let i = userLocation?.$$UserLocationRoles?.length - 1; i >= 0; i--) {
                        if (userLocation?.$$UserLocationRoles[i]?.$$ObjectState === SaveStates?.Add) {
                            userLocation.$$UserLocationRoles[i].$$ObjectState = SaveStates?.None;

                            // remove added roles
                            const index = userLocation?.$$UserLocationRoles.findIndex(x => x.RoleId == userLocation?.$$UserLocationRoles[i].RoleId);
                            if (index > -1) {
                                userLocation?.$$UserLocationRoles?.splice(index, 1);
                            }
                        } else if (userLocation?.$$UserLocationRoles[i]?.$$ObjectState === SaveStates?.Delete) {
                            userLocation.$$UserLocationRoles[i].$$ObjectState = SaveStates?.None;
                        }
                    }

                    // clear errors
                    userLocation.$$NoRoleError = false;
                    this.formIsValid = true;
                    // reset availableRoles for this teamMember and location
                    this.setAvailableRolesByUserLocation(userLocation);
                }
            }
        });
    }

    // discard service method
    resetData = () => {
        this.dataHasChanged = false;
    }

    // dynamically setting title for no perms message
    showTitle = (e) => {
        if (!this.authAccess?.Delete) {
            e.currentTarget.title = this.titleMessage;
        }
    }

    // roles filter
    getSelectedList = (roles) => {
        const filteredUsers = [];
        this.users = this.copyUser;
        if (roles && roles.length > 0) {
            roles = roles.filter(x => x?.RoleName?.toString() != 'Patterson Support Admin')
            roles.forEach(role => {
                this.users.forEach(user => {
                    const filteredUserLocation = user.$$UserLocations?.filter(x => x?.LocationId?.toString() == this.selectedLocations[0]?.LocationId?.toString());
                    const locations = filteredUserLocation[0]?.$$UserLocationRoles?.filter(x => x?.RoleId?.toString() == role?.value?.toString());
                    const practice = user.$$UserPracticeRoles.filter(userPracticeroles => userPracticeroles?.RoleId == role?.value);

                    if (locations && locations?.length > 0) {
                        filteredUsers?.push(user);
                    }

                    else if (practice && practice?.length > 0) {
                        filteredUsers?.push(user);
                    }
                });
            });
            this.users = filteredUsers;
        }
        else {
            this.users = this.copyUser;
        }
    }

    isItemDisabled = (dataItem) => {
        if (dataItem?.index === -1) {
            return true;
        } else {
            return false;
        }
    }

    viewRoles = () => {
        this.viewCompareRolesModal.ngOnInit();
        this.viewCompareRolesModal?.openViewComapreModal(ViewCompareRoleType.view);
        document.body.style.position = 'fixed';
    }

    compareRoles = () => {
        this.viewCompareRolesModal.ngOnInit();
        this.viewCompareRolesModal?.openViewComapreModal(ViewCompareRoleType.compare);
        document.body.style.position = 'fixed';
    }

}