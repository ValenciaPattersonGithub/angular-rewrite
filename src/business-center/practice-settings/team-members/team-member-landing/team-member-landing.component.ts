import { Component, Inject, OnInit } from '@angular/core';
import { ProviderTypes } from 'src/business-center/service-code/service-code-model';
import { Location } from '../../location';
import { DepartmentTypes, TeamMemberLandingItem, User } from '../team-member';
import cloneDeep from 'lodash/cloneDeep';

@Component({
    selector: 'team-member-landing',
    templateUrl: './team-member-landing.component.html',
    styleUrls: ['./team-member-landing.component.scss']
})
export class TeamMemberLandingComponent implements OnInit {

    breadCrumbs: { name: string, path: string, title: string }[] = [];
    teamMemberCrudCreateURL: string = "#/BusinessCenter/Users/Create/";

    fadeIn: boolean = true;
    users: User[] = [];
    filteredUsers: User[] = [];
    locations: Location[] = [];
    listItems: Array<TeamMemberLandingItem> = [];
    selectedList: Array<TeamMemberLandingItem> = [];
    practiceUsers: string[];
    departmentTypes: DepartmentTypes[] = [];
    providerTypes: ProviderTypes[] = [];
    activeUsersCount: number = 0;
    inactiveUsersCount: number = 0;
    activeFilter: boolean = true;
    inactiveFilter: boolean = true;
    filter: string = "";
    locationUsersRetrieved: boolean = false;
    locationUsersError: boolean = false;
    loading: boolean = false;
    teamMemberCrudURL: string = "#/BusinessCenter/Users/Edit/";

    constructor(@Inject('localize') private localize,
        @Inject('$location') private $location,
        @Inject('patSecurityService') private patSecurityService,
        @Inject('toastrFactory') private toastrFactory,
        @Inject('UsersFactory') private usersFactory,
        @Inject('StaticData') private staticData,
        @Inject('referenceDataService') private referenceDataService,
        @Inject('practiceService') private practiceService,
        @Inject('UserServices') private userServices,
        @Inject('RoleNames') private roleNames,
        @Inject('$routeParams') public $routeParams,
        @Inject('$rootScope') private $rootScope) { }

    ngOnInit(): void {
        this.$rootScope.$on('soar:rds:force-entity-execution', () => {
            this.getPracticeUsers();
        });
        this.getPageNavigation();
        this.authAccess();
        this.getPracticeUsers();
        this.getLocations();
        this.selectedList.push(new TeamMemberLandingItem(
            this.localize.getLocalizedString("Active Team Members"), "activeFilter", [], false
        ));
        this.selectedList.push(new TeamMemberLandingItem(
            this.localize.getLocalizedString("No User Access"), "inactiveFilter", [], false
        ));
    }
    getPageNavigation = () => {
        this.breadCrumbs = [
            {
                name: this.localize.getLocalizedString('Practice Settings'),
                path: '#/BusinessCenter/PracticeSettings/',
                title: 'Practice Settings'
            },
            {
                name: this.localize.getLocalizedString('All Team Members'),
                path: '#/BusinessCenter/Users/',
                title: 'All Team Members'
            }
        ];
    }



    authAccess = () => {
        if (!this.authViewAccess()) {
            this.toastrFactory.error(this.localize.getLocalizedString('User is not authorized to access this area.'),
                this.localize.getLocalizedString('Not Authorized'));
            this.$location.path('/');
        }
    }

    authViewAccess = () => {
        return this.patSecurityService.IsAuthorizedByAbbreviation('soar-biz-bizusr-view');
    }

    getPracticeUsers = () => {
        this.loading = false;
        this.usersFactory.Users().then((res) => {
            this.userServicesGetSuccess(res);
        }, (error) => {
            this.userServicesGetFailure(error);
        })
    }

    userServicesGetSuccess = (res) => {
        this.loading = false;
        this.users = res.Value;
        // Filter user by role        
        let tempUsers = [];
        this.users?.forEach(user => {
            const userRole = user?.Roles?.find(x => x?.RoleName?.toLowerCase() == 'patterson support admin');
            if (!userRole) {
                tempUsers.push(user);
            }
        });
        this.users = tempUsers;
        this.filteredUsers = cloneDeep(this.users);
        this.calculateUserInfo();
        this.getDepartments();
        this.getProviderTypes();
    }

    userServicesGetFailure = (error) => {
        this.loading = false;
        this.users = [];
        this.toastrFactory.error(this.localize.getLocalizedString('Failed to retrieve the list of users. Refresh the page to try again.'),
            this.localize.getLocalizedString('Server Error' + error?.data?.Message));
    }

    calculateUserInfo = () => {
        if (this.users && this.users?.length > 0) {
            this.inactiveUsersCount = this.users?.filter(x => x.IsActive == false)?.length;
            this.activeUsersCount = this.users?.filter(x => x.IsActive == true)?.length;
        }
    }

    getDepartments = () => {
        this.staticData.Departments().then((res) => {
            this.departmentTypes = res?.Value;
            this.setDepartment();
        })
    }

    setDepartment = () => {
        this.users.forEach((user) => {
            if (user?.DepartmentId != undefined && user?.DepartmentId != null) {
                let department = this.departmentTypes?.filter(x => x?.DepartmentId?.toString() == user?.DepartmentId?.toString());
                if (department) {
                    user.DepartmentName = department[0]?.Name;
                }
            }
        })
    }

    getProviderTypes = () => {
        this.staticData.ProviderTypes().then((res) => {
            this.providerTypes = res?.Value;
            this.setProviderType();
        })
    }

    setProviderType = () => {
        this.users.forEach((user) => {
            if (user?.ProviderTypeId != undefined && user?.ProviderTypeId != null) {
                let providerType = this.providerTypes.filter(x => x?.Id == user?.ProviderTypeId);
                user.ProviderTypeName = providerType[0]?.Name;
            }
        })
    }

    getLocations = () => {
        this.locations = this.referenceDataService.get(this.referenceDataService.entityNames.locations);
        this.listItems.push(new TeamMemberLandingItem(
            this.localize.getLocalizedString("Active Team Members"), "activeFilter", [], false
        ));
        this.listItems.push(new TeamMemberLandingItem(
            this.localize.getLocalizedString("No User Access"), "inactiveFilter", [], false
        ));
        //Add static values & locations values to single array
        this.listItems = this.listItems.concat(this.locations?.map(label => new TeamMemberLandingItem(label?.NameLine1, label?.LocationId?.toString(), [], true)));

        this.getLocationRoles(this.locations);
        if (this.$routeParams?.locationId) {
            let locations = this.locations.filter(x => x?.LocationId == parseInt(this.$routeParams?.locationId));
            /** filter returns an array, but we only want one.. so hard coding 0 index to set to active */
            if (locations && locations?.length > 0) {
                locations[0].isActiveLoc = true;
                this.selectedList.push(new TeamMemberLandingItem(
                    locations[0]?.NameLine1, location[0]?.LocationId?.toString(), [], false
                ));
            }
        }
    }

    getLocationRoles = (locations) => {
        let currentPractice = this.practiceService.getCurrentPractice();
        if (currentPractice && this.patSecurityService.IsAuthorizedByAbbreviationAtPractice('soar-biz-bizusr-view')) {
            this.userServices.Roles.getAllRolesByPractice({ practiceId: currentPractice?.id }).$promise.then((res) => {
                this.getPracticeUserRolesSuccess(res);
            }, (error) => {
                this.getRolesFailure(error);
            });
        }
        locations?.forEach(location => {
            if (this.patSecurityService.IsAuthorizedByAbbreviationAtLocation('soar-biz-bizusr-view', location?.LocationId)) {
                this.userServices.Roles.getAllRolesByLocation({ locationId: location?.LocationId }).$promise.then((res) => {
                    this.getLocationUserRolesSuccess(location, res);
                }, (error) => {
                    this.getRolesFailure(error);
                });
            } else {
                let tempIndex = this.listItems.findIndex(x => x.value == location?.LocationId?.toString());

                if (this.listItems[tempIndex]) {
                    var tempListItem = this.listItems[tempIndex] as TeamMemberLandingItem;
                    tempListItem.IsDisabled = true;
                }
            }
        });
    }

    getLocationUserRolesSuccess = (location, res) => {
        const tempIndex = this.listItems?.findIndex(x => x.value == location?.LocationId?.toString());
        if (res && res?.Result) {
            this.locationUsersRetrieved = true;
            location.AssignedUserIds = res.Result.map((item) => {
                return item?.User?.UserId;
            });

            if (this.listItems[tempIndex]) {
                var tempListItem = this.listItems[tempIndex] as TeamMemberLandingItem;
                tempListItem.AssignedUserIds = location?.AssignedUserIds;
                tempListItem.IsDisabled = false;
            }
        }
        else {
            if (this.listItems[tempIndex]) {
                var tempListItem = this.listItems[tempIndex] as TeamMemberLandingItem;
                tempListItem.AssignedUserIds = [];
                tempListItem.IsDisabled = false;
            }
        }
    };


    getPracticeUserRolesSuccess = (res) => {
        this.practiceUsers = [];
        if (res && res?.Result && res?.Result?.length > 0) {
            res?.Result?.forEach((result) => {
                if (this.isPracticeAdmin(result?.Roles)) {
                    this.practiceUsers.push(result?.User?.UserId);
                }
            })
        }
    }

    getRolesFailure = (error) => {
        this.toastrFactory.error({
            Text: this.localize.getLocalizedString('Failed to retrieve list of {0}. Please try again.'),
            Params: ['users by location']
        }, this.localize.getLocalizedString('Server Error' + error?.data?.Message));
        this.locationUsersError = true;
        //Set all location checkbox as disabled
        this.listItems = this.listItems.map(label => new TeamMemberLandingItem( label?.text, label?.value, [], true ));
    }

    isPracticeAdmin = (practiceRoles) => {
        let isPracticeAdmin = false;
        practiceRoles?.forEach((role) => {
            if ((role?.RoleName)?.toLowerCase()?.trim() === this.roleNames?.PracticeAdmin?.toLowerCase()?.trim()) {
                isPracticeAdmin = true;
            }
        })
        return isPracticeAdmin;
    }

    userFilter = (filter) => {
        //removes any dashes in scope property;
        let locationFilter = this.selectedList.filter(x => x.value != "activeFilter" && x.value != "inactiveFilter");

        //handle active & inactive filter
        if (this.selectedList) {
            let tempIndex = this.selectedList?.findIndex(x => x.value == "activeFilter");
            if (tempIndex > -1) {
                this.activeFilter = true;
            }
            else {
                this.activeFilter = false;
            }

            tempIndex = this.selectedList?.findIndex(x => x.value == "inactiveFilter");
            if (tempIndex > -1) {
                this.inactiveFilter = true;
            }
            else {
                this.inactiveFilter = false;
            }
        }

        filter = filter?.trim();
        filter = filter?.toLowerCase();
        this.filteredUsers = [];

        this.users.forEach((item) => {
            if (((item?.FirstName && item?.FirstName.toLowerCase().indexOf(filter) != -1)
                || (item?.LastName && item?.LastName.toLowerCase().indexOf(filter) != -1)
                || (item?.PreferredName && item?.PreferredName.toLowerCase().indexOf(filter) != -1)
                || (item?.DepartmentName && item?.DepartmentName.toLowerCase().indexOf(filter) != -1)
                || (item?.UserName && item?.UserName.toLowerCase().indexOf(filter) != -1)
                || (item?.UserCode && item?.UserCode.toLowerCase().indexOf(filter) != -1)
                || (item?.ProviderTypeName && item?.ProviderTypeName.toLowerCase().indexOf(filter) != -1) || filter?.length == 0)
                && (item?.IsActive === true && item?.IsActive === this.activeFilter || item?.IsActive === false && item?.IsActive != this.inactiveFilter)) {
                this.calculateUserInfo();
                if (locationFilter && locationFilter?.length > 0) {
                    if (this.hasLocation(locationFilter, item?.UserId)) {
                        this.filteredUsers.push(item);
                    }
                }
                else {
                    this.filteredUsers.push(item);
                }
            }
            else {
                this.calculateUserInfo();
            }
        });
    }


    hasLocation = (locations, userId) => {
        // if user is practice admin, they should always appear in filtered results
        if (this.practiceUsers) {
            if (this.practiceUsers.filter(x => x == userId)?.length > 0) {
                return true;
            }
        }
        let wasFound = false;

        locations?.forEach((location) => {
            if (!wasFound && location?.AssignedUserIds) {
                let locationHasUser = location?.AssignedUserIds?.filter(x => x == userId)?.length > 0;
                if (locationHasUser === true) {
                    wasFound = true;
                }
            }
        });
        return wasFound;
    }

    //Get Selected records from multi-select
    getSelectedList = (data) => {
        if (data) {
            this.selectedList = data;
            this.userFilter(this.filter);
        }
    }

    //On Remove chips it will update selected list
    removeChips = ($event, index) => {
        if ($event) {
            this.selectedList.splice(index, 1);
            this.userFilter(this.filter);
        }
    }
}

