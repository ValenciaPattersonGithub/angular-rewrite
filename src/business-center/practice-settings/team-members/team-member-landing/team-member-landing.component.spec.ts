import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BoldTextIfContainsPipe, OrderByPipe } from '../../../../@shared/pipes';
import { TeamMemberLandingComponent } from './team-member-landing.component';
import cloneDeep from 'lodash/cloneDeep';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
let mockLocalizeService = {
    getLocalizedString: (text) => 'translated text'
};
let tempUserData = [{
    Address: { AddressLine1: null, AddressLine2: null, City: null, State: null, ZipCode: null },
    AnesthesiaId: null,
    DataTag: "AAAAABSJYJE=",
    DateModified: "2022-05-31T15:38:35.7232476",
    DateOfBirth: null,
    DeaNumber: null,
    DentiCalPin: null,
    DepartmentId: 1,
    EmployeeEndDate: null,
    EmployeeStartDate: null,
    FederalLicense: null,
    FirstName: "User1FirstName",
    ImageFile: null,
    IsActive: true,
    JobTitle: null,
    LastName: "User1LastName",
    Locations: [{
        Color: null,
        DataTag: "AAAAABSJYJY=",
        DateModified: "2022-05-31T15:38:35.8794476",
        FailedMessage: null,
        IsActive: true,
        Location: null,
        LocationId: 1703574,
        ObjectState: null,
        PracticeId: 26899,
        ProviderOnClaimsId: null,
        ProviderOnClaimsRelationship: 0,
        ProviderQualifierType: 0,
        ProviderTypeId: 4,
        UserId: "1",
        UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
        UserProviderSetupLocationId: "4135c7c0-0b6c-4744-874d-fe442840a1d9"
    }],
    MiddleName: null,
    NpiTypeOne: null,
    PracticeId: 26899,
    PreferredName: null,
    PrimaryTaxonomyId: null,
    ProfessionalDesignation: null,
    Roles: null,
    RxUserType: 0,
    SecondaryTaxonomyId: null,
    ShowCardServiceDisabledMessage: false,
    StateLicense: null,
    StatusChangeNote: null,
    SuffixName: null,
    TaxId: null,
    UserCode: "CODE1",
    UserId: "1",
    UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
    UserName: "a@a.com",
    DepartmentName: "",
    ProviderTypeId: 4
}, {
    Address: { AddressLine1: null, AddressLine2: null, City: null, State: null, ZipCode: null },
    AnesthesiaId: null,
    DataTag: "AAAAABSJYJE=",
    DateModified: "2022-05-31T15:38:35.7232476",
    DateOfBirth: null,
    DeaNumber: null,
    DentiCalPin: null,
    DepartmentId: 2,
    EmployeeEndDate: null,
    EmployeeStartDate: null,
    FederalLicense: null,
    FirstName: "User2FirstName",
    ImageFile: null,
    IsActive: true,
    JobTitle: null,
    LastName: "User2LastName",
    Locations: [{
        Color: null,
        DataTag: "AAAAABSJYJY=",
        DateModified: "2022-05-31T15:38:35.8794476",
        FailedMessage: null,
        IsActive: true,
        Location: null,
        LocationId: 1703574,
        ObjectState: null,
        PracticeId: 26899,
        ProviderOnClaimsId: null,
        ProviderOnClaimsRelationship: 0,
        ProviderQualifierType: 0,
        ProviderTypeId: 4,
        UserId: "2",
        UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
        UserProviderSetupLocationId: "4135c7c0-0b6c-4744-874d-fe442840a1d9"
    }],
    MiddleName: null,
    NpiTypeOne: null,
    PracticeId: 26899,
    PreferredName: null,
    PrimaryTaxonomyId: null,
    ProfessionalDesignation: null,
    Roles: null,
    RxUserType: 0,
    SecondaryTaxonomyId: null,
    ShowCardServiceDisabledMessage: false,
    StateLicense: null,
    StatusChangeNote: null,
    SuffixName: null,
    TaxId: null,
    UserCode: "CODE2",
    UserId: "2",
    UserModified: "46036023-d22b-4b0e-a0f6-c0120e19b7e0",
    UserName: "b@b.com",
    ProviderTypeId: 3,
}, { UserImage: '', UserId: 1, FirstName: 'Reed', LastName: 'Richards', PreferredName: 'Stretch', ProviderTypeId: '1', DepartmentId: '1', UserName: 'rrichards', UserCode: 'Ricre', IsActive: false },
{ UserImage: '', UserId: 2, FirstName: 'Susan', LastName: 'Storm', PreferredName: '', ProviderTypeId: '1', DepartmentId: '1', UserName: 'sstorm', UserCode: 'Stosu', IsActive: false },
{ UserImage: '', UserId: 3, FirstName: 'Benjamin', LastName: 'Grimm', PreferredName: 'Rock', ProviderTypeId: '2', DepartmentId: '3', UserName: 'bgrimm', UserCode: 'Gribe', IsActive: true },
{ UserImage: '', UserId: 4, FirstName: 'Justin', LastName: 'Storm', PreferredName: 'Torch', ProviderTypeId: '3', DepartmentId: null, UserName: 'jstorm', UserCode: 'Stoju', IsActive: true },
{ UserImage: '', UserId: 5, FirstName: 'Stan', LastName: 'Lee', PreferredName: '', ProviderTypeId: null, DepartmentId: null, UserName: 'jstorm', UserCode: 'Stoju', IsActive: true },
]

let tempProviderTypes = [
    { "ProviderTypeId": 4, "Id": 4, "Name": "Not a Provider", "Order": 1, "IsAppointmentType": false },
    { "ProviderTypeId": 1, "Id": 1, "Name": "Dentist", "Order": 2, "IsAppointmentType": true },
    { "ProviderTypeId": 2, "Id": 2, "Name": "Hygienist", "Order": 3, "IsAppointmentType": true },
    { "ProviderTypeId": 3, "Id": 3, "Name": "Assistant", "Order": 4, "IsAppointmentType": false },
    { "ProviderTypeId": 5, "Id": 5, "Name": "Other", "Order": 5, "IsAppointmentType": false }
]

let tempDepartment = [
    { DataTag: "AAAAAAAACHa=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 1, Name: "Dentist", Order: 1, UserModified: "00000000-0000-0000-0000-000000000000" },
    { DataTag: "AAAAAAAACHb=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 2, Name: "Assistant", Order: 2, UserModified: "00000000-0000-0000-0000-000000000000" },
    { DataTag: "AAAAAAAACHc=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 3, Name: "Hygienist", Order: 3, UserModified: "00000000-0000-0000-0000-000000000000" },
    { DataTag: "AAAAAAAACHd=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 4, Name: "Administrative", Order: 4, UserModified: "00000000-0000-0000-0000-000000000000" },
    { DataTag: "AAAAAAAACHe=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 5, Name: "Executive", Order: 5, UserModified: "00000000-0000-0000-0000-000000000000" },
    { DataTag: "AAAAAAAACHf=", DateModified: "2019-02-06T16:48:10.440946", DepartmentId: 6, Name: "Business Partner", Order: 6, UserModified: "00000000-0000-0000-0000-000000000000" }
]

let locationsList = {
    Value: [
        { LocationId: '1', NameLine1: 'First Office', AddressLine1: '123 Apple St', AddressLine2: 'Suite 10', ZipCode: '62401', City: 'Effingham', State: 'IL', PrimaryPhone: '5551234567', Timezone: 12, isActiveLoc: true },
        { LocationId: '2', NameLine1: 'Second Office', AddressLine1: '123 Count Rd', AddressLine2: '', ZipCode: '62858', City: 'Louisville', State: 'IL', PrimaryPhone: '5559876543', isActiveLoc: true },
        { LocationId: '3', NameLine1: 'Third Office', AddressLine1: '123 Adios St', AddressLine2: '', ZipCode: '60601', City: 'Chicago', State: 'IL', PrimaryPhone: '3124567890', isActiveLoc: true },
        { LocationId: '4', NameLine1: 'Fourth Office', AddressLine1: '123 Hello Rd', AddressLine2: '', ZipCode: '62895', City: 'Wayne City', State: 'IL', PrimaryPhone: '6187894563', SecondaryPhone: '6181234567', isActiveLoc: true }
    ]
}


let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
    generateMessage: jasmine.createSpy('patSecurityService.generateMessage'),
    IsAuthorizedByAbbreviationAtPractice: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviationAtPractice').and.returnValue(true),
    IsAuthorizedByAbbreviationAtLocation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviationAtLocation').and.returnValue(true),
};

let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};

let mockAuthZ = {
    generateTitleMessage: () => { return 'Not Allowed' }
}

let mockLocation = {
    path: () => ''
}

const mockUsersFactory = {
    Users: () => {
        return {
            then: (res, error) => {
                res({ Value: tempUserData }),
                    error({
                    })
            }
        }
    }
};

const mockStaticData = {
    Departments: () => {
        return {
            then: (res) => {
                res({ Value: tempDepartment })
            }
        }
    },
    ProviderTypes: () => {
        return {
            then: (res) => {
                res({ Value: tempProviderTypes })
            }
        }
    }
};

let mockreferenceDataService = {
    entityNames: {
        practiceSettings: 'practiceSettings'
    },
    get: (refType) => {
        return locationsList.Value;
    }
};

let mockpracticeService = {
    getCurrentPractice: jasmine.createSpy().and.returnValue({ id: 'practiceId' })
};

const mockservice = {
    IsAuthorizedByAbbreviation: (authtype: string) => { },
    getServiceStatus: () => new Promise((resolve, reject) => {
        // the resolve / reject functions control the fate of the promise
    }),
    isEnabled: () => new Promise((resolve, reject) => {
    }),
    getCurrentLocation: jasmine.createSpy().and.returnValue({ practiceId: 'test' }),
    locationId: 1
};

let mockUserServices = {
    Roles: {
        getAllRolesByPractice: (practiceId) => {
            return {
                $promise: {
                    then: (res, error) => {
                        res({ locationsList }),
                            error({
                                data: {
                                    InvalidProperties: [{
                                        PropertyName: "GroupTypeName",
                                        ValidationMessage: "Not Allowed"
                                    }]
                                }
                            })
                    }
                }
            }
        },
        getAllRolesByLocation: (locationId) => {
            return {
                $promise: {
                    then: (res, error) => {
                        res({ locationsList }),
                            error({
                                data: {
                                    InvalidProperties: [{
                                        PropertyName: "GroupTypeName",
                                        ValidationMessage: "Not Allowed"
                                    }]
                                }
                            })
                    }
                }
            }
        }
    }
}

let mockRoleNames = {
    PracticeAdmin: 'Practice Admin/Exec. Dentist',
    RxUser: 'Rx User'
}

let errorObj = {
    data: {
        Message: "Server Error"
    }
}

const mockRootScope = { $on: jasmine.createSpy()}

describe('TeamMemberLandingComponent', () => {
    let component: TeamMemberLandingComponent;
    let fixture: ComponentFixture<TeamMemberLandingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TeamMemberLandingComponent, OrderByPipe, BoldTextIfContainsPipe],
            imports: [TranslateModule.forRoot(), FormsModule, ReactiveFormsModule],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'AuthZService', useValue: mockAuthZ },
                { provide: '$location', useValue: mockLocation },
                { provide: 'UsersFactory', useValue: mockUsersFactory },
                { provide: 'StaticData', useValue: mockStaticData },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: 'practiceService', useValue: mockpracticeService },
                { provide: 'UserServices', useValue: mockUserServices },
                { provide: 'RoleNames', useValue: mockRoleNames },
                { provide: '$routeParams', useValue: mockservice },
                { provide: '$rootScope', useValue: mockRootScope },                

            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TeamMemberLandingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit -->', () => {
        it('should call getPageNavigation method', () => {
            spyOn(component, 'getPageNavigation');
            spyOn(component, 'authAccess');
            spyOn(component, 'getPracticeUsers');
            spyOn(component, 'getLocations');
            component.ngOnInit();
            expect(component.authAccess).toHaveBeenCalled();
            expect(component.getPracticeUsers).toHaveBeenCalled();
            expect(component.getLocations).toHaveBeenCalled();
            expect(component.getPageNavigation).toHaveBeenCalled();
        })
    })

    describe('authAccess -->', () => {
        it('should call method on authAccess', () => {
            spyOn(component, 'authViewAccess');
            component.authAccess();
            expect(component.authViewAccess).toHaveBeenCalled();
        });
        it('should show toast error if no access for authview', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.authAccess();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
        it('should not show toast error if has access for authview', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.authAccess();
            //expect(mockToastrFactory.error).not.toHaveBeenCalled();
        });
    });

    describe('getPracticeUsers -->', () => {
        it('should call userServicesGetSuccess on successful data fetch', () => {
            spyOn(component, "userServicesGetSuccess");
            component.getPracticeUsers();
            expect(component.loading).toBe(false);
            expect(component.userServicesGetSuccess).toHaveBeenCalled();
        })
    })

    describe('userServicesGetSuccess', () => {
        it('should call calculateUserInfo,getDepartments,getProviderTypes methods on success get data & loading should be false', () => {
            spyOn(component, "calculateUserInfo");
            spyOn(component, "getDepartments");
            spyOn(component, "getProviderTypes");
            component.userServicesGetSuccess({ Value: tempUserData });
            expect(component.loading).toBe(false);
            expect(component.calculateUserInfo).toHaveBeenCalled();
            expect(component.getDepartments).toHaveBeenCalled();
            expect(component.getProviderTypes).toHaveBeenCalled();
        })
    })

    describe('userServicesGetFailure', () => {
        it('should show toast error & loading should be false', () => {
            component.userServicesGetFailure(errorObj);
            expect(component.loading).toBe(false);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })

    describe('calculateUserInfo', () => {
        it('should set inactiveUsersCount & activeUsersCount', () => {
            component.users = cloneDeep(tempUserData);
            component.calculateUserInfo();
            expect(component.inactiveUsersCount).toBe(2);
            expect(component.activeUsersCount).toBe(5);
        })
    })

    describe('getDepartments', () => {
        it('should call setDepartment on success of getDepartments', () => {
            component.users = cloneDeep(tempUserData);
            spyOn(component, "setDepartment");
            component.getDepartments();
            expect(component.setDepartment).toHaveBeenCalled();
        })
    })

    describe('setDepartment', () => {
        it('should set departmentname as per the department id', () => {
            component.users = cloneDeep(tempUserData);
            component.departmentTypes = cloneDeep(tempDepartment);
            component.setDepartment();
            expect(component.users[0].DepartmentName).toEqual("Dentist");
            expect(component.users[1].DepartmentName).toEqual("Assistant");
        })
    })

    describe('getProviderTypes', () => {
        it('should call setProviderType on success of getProviderTypes', () => {
            component.users = cloneDeep(tempUserData);
            spyOn(component, "setProviderType");
            component.getProviderTypes();
            expect(component.setProviderType).toHaveBeenCalled();
        })
    })

    describe('setDepartment', () => {
        it('should set ProviderTypeName as per the ProviderTypeId ', () => {
            component.users = cloneDeep(tempUserData);
            component.providerTypes = cloneDeep(tempProviderTypes);
            component.setProviderType();
            expect(component.users[0].ProviderTypeName).toEqual("Not a Provider");
            expect(component.users[1].ProviderTypeName).toEqual("Assistant");
        })
    })

    describe('getLocations', () => {
        it('should set locations & call getLocationRoles ', () => {
            spyOn(component, "getLocationRoles");
            component.users = cloneDeep(tempUserData);
            component.getLocations();
            expect(component.getLocationRoles).toHaveBeenCalled();
        })

        it('should filter location on the basis of location id', () => {
            spyOn(component, "getLocationRoles");
            component.users = cloneDeep(tempUserData);
            component.getLocations();
            expect(component.getLocationRoles).toHaveBeenCalled();
            let locations = component.locations.filter(x => x.LocationId == parseInt(component.$routeParams.locationId));
            /** filter returns an array, but we only want one.. so hard coding 0 index to set to active */
            expect(locations.length).toBeGreaterThan(0);
        })
    })

    describe('getLocationRoles', () => {
        it('should call getPracticeUserRolesSuccess on Successful data fetch', () => {
            spyOn(component, 'getPracticeUserRolesSuccess');
            component.getLocationRoles(locationsList.Value);
            expect(component.getPracticeUserRolesSuccess).toHaveBeenCalled();
        })
        it('should call getLocationUserRolesSuccess on Successful data fetch', () => {
            spyOn(component, 'getLocationUserRolesSuccess');
            component.getLocationRoles(locationsList.Value);
            expect(component.getLocationUserRolesSuccess).toHaveBeenCalled();
        })
    })

    describe('getLocationUserRolesSuccess', () => {
        it('should set locationUsersRetrieved is true & set AssignedUserIds as []', () => {
            let tempRes = {
                Result: [{
                    User: { UserId: 3 }
                }]
            }
            component.getLocationUserRolesSuccess(locationsList.Value, tempRes);
            expect(component.locationUsersRetrieved).toBe(true);
        })

        it('should set locationUsersRetrieved is true & set AssignedUserIds', () => {
            let tempRes = {
                Result: [{
                    User: { UserId: 3 }
                }]
            }
            component.listItems.push({
                text: "Chicago", value: "1",
                AssignedUserIds: [], IsDisabled: false
            }, {
                text: "Chicago", value: "2",
                AssignedUserIds: [], IsDisabled: false
            });
            component.getLocationUserRolesSuccess(locationsList.Value, tempRes);
            expect(component.locationUsersRetrieved).toBe(true);
        })

        it('should set isDisabled to false & set AssignedUserIds', () => {
            let tempRes = {
                Result: [{
                    User: { UserId: 3 }
                }]
            }
            let tempLocation = {
                LocationId: '1'
            };

            component.listItems.push({
                text: "Chicago", value: "1",
                AssignedUserIds: [], IsDisabled: true
            }, {
                text: "Chicago", value: "2",
                AssignedUserIds: [], IsDisabled: true
            });
            component.getLocationUserRolesSuccess(tempLocation, tempRes);
            expect(component.locationUsersRetrieved).toBe(true);
        })
    })

    describe('getRolesFailure', () => {

        it('should call error message rroles failure', () => {
            component.getRolesFailure(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })




    describe('getPracticeUserRolesSuccess function ->', () => {
        var result = { Result: {} };
        beforeEach(() => {
            component.practiceUsers = [];
        });

        it('should add user to practiceUsers if isPracticeAdmin returns true', () => {
            result.Result = [{ User: { UserId: "12" }, Roles: [{ RoleId: 8, RoleName: 'Practice Administrator' }, { RoleId: 13, RoleName: 'Rx User' }] },];
            spyOn(component, 'isPracticeAdmin').and.returnValue(true);
            component.getPracticeUserRolesSuccess(result);
            expect(component.practiceUsers[0]).toEqual("12");
        });

        it('should not add user to practiceUsers if isPracticeAdmin returns false', () => {
            result.Result = [{ User: { UserId: 12 }, Roles: [{ RoleId: 13, RoleName: 'Rx User' }] },];
            spyOn(component, 'isPracticeAdmin').and.returnValue(false)
            component.getPracticeUserRolesSuccess(result);
            expect(component.practiceUsers).toEqual([]);
        });
    });

    describe('isPracticeAdmin function ->', () => {
        let result = { Roles: [] };
        beforeEach(() => {
            component.practiceUsers = [];
        })

        it('should return true if user practice roles contains practice admin', () => {
            result = { Roles: [{ RoleId: 8, RoleName: mockRoleNames.PracticeAdmin }, { RoleId: 13, RoleName: 'Rx User' }] };
            expect(component.isPracticeAdmin(result.Roles)).toBe(true);
        });

        it('should return false if user practice roles does not contain practice admin', () => {
            result = { Roles: [{ RoleId: 13, RoleName: 'Rx User' }] };
            expect(component.isPracticeAdmin(result.Roles)).toBe(false);
        });
    });

    describe('hasLocation function ->', () => {
        var locations = [];
        beforeEach(() => {
            component.practiceUsers = ["3", "4"];
            locations = [{ LocationId: 1, AssignedUserIds: [1, 2] }];
        });

        it('should return true if practiceUsers list contains userId', () => {
            expect(component.hasLocation(locations, 3)).toBe(true);
        });

        it('should return true if location.AssignUserIds contains userId', () => {
            expect(component.hasLocation(locations, 1)).toBe(true);
        });

        it('should return false if location.AssignUserIds and practiceUsers does not contain userId', () => {
            expect(component.hasLocation(locations, 5)).toBe(false);
        });
    });
    describe('userFilter  ->', () => {

        it('should call calculateUserInfo', () => {
            component.users = cloneDeep(tempUserData);
            spyOn(component, 'calculateUserInfo');
            component.userFilter("Richards");
            expect(component.calculateUserInfo).toHaveBeenCalled();
        });

        it('should filter out users based on filter text', () => {
            component.users = cloneDeep(tempUserData);
            spyOn(component, 'calculateUserInfo');
            component.practiceUsers = ["1", "3"];
            // Richards matches 1st in array
            component.userFilter("Richards");
            expect(component.filteredUsers.length).toBeGreaterThanOrEqual(1);
            component.userFilter("Richardss");
            expect(component.filteredUsers.length).toEqual(0);
        });

        it('should filter out users based on inactiveFilter', () => {
            component.users = cloneDeep(tempUserData);

            spyOn(component, 'calculateUserInfo');
            // Richards matches 1st in array
            component.filter = 'Richards';
            component.inactiveFilter = true;
            component.practiceUsers = ["1", "3"];
            component.userFilter("Richards");
            expect(component.filteredUsers.length).toBeGreaterThanOrEqual(1);


            component.selectedList = [{
                text: mockLocalizeService.getLocalizedString("Active Team Members"),
                value: "activeFilter", AssignedUserIds: [], IsDisabled: false
            }]
            // uncheck active
            component.inactiveFilter = false;
            component.userFilter("Richards");
            expect(component.filteredUsers.length).toEqual(0);
        });

        it('should filter out users based on activeFilter', () => {
            component.users = cloneDeep(tempUserData);
            spyOn(component, 'calculateUserInfo');
            component.practiceUsers = ["1", "3"];
            // Richards matches 1st in array and is active
            component.filter = 'Benjamin';
            component.activeFilter = true;
            component.userFilter("Benjamin");
            expect(component.filteredUsers.length).toBeGreaterThanOrEqual(1);

            component.selectedList = [{
                text: mockLocalizeService.getLocalizedString("No User Access"),
                value: "inactiveFilter", AssignedUserIds: [], IsDisabled: false
            }]
            // uncheck active
            component.activeFilter = false;
            component.userFilter("Benjamin");
            expect(component.filteredUsers.length).toEqual(0);
        });

        it('should set same as userData if not filter', () => {
            component.users = cloneDeep(tempUserData);
            component.selectedList = [{
                text: mockLocalizeService.getLocalizedString("No User Access"),
                value: "inactiveFilter", AssignedUserIds: [], IsDisabled: false
            }, {
                text: mockLocalizeService.getLocalizedString("Active Team Members"),
                value: "activeFilter", AssignedUserIds: [], IsDisabled: false
            }]
            component.userFilter("");
            expect(component.users.length).toEqual(component.filteredUsers.length);
        })
    });

    describe('userFilter  ->', () => {
        it('should add record in selected list and filter the records', () => {
            let mockSelectedRecord = [{
                text: "Chicago", value: "1",
                AssignedUserIds: [], IsDisabled: false
            }]
            component.selectedList = [];
            component.getSelectedList(mockSelectedRecord)
            expect(component.selectedList.length).toBe(1);
        })
    })

    describe('removeChips  ->', () => {
        it('should remove record in selected list and filter the records', () => {
            let mockSelectedRecord = [{
                text: mockLocalizeService.getLocalizedString("No User Access"),
                value: "inactiveFilter", AssignedUserIds: [], IsDisabled: false
            }, {
                text: mockLocalizeService.getLocalizedString("Active Team Members"),
                value: "activeFilter", AssignedUserIds: [], IsDisabled: false
            }, {
                text: "Chicago", value: "1",
                AssignedUserIds: [], IsDisabled: false
            }]
            component.removeChips(mockSelectedRecord, 2)
            expect(component.selectedList.length).toBe(2);
        })
    })

});
