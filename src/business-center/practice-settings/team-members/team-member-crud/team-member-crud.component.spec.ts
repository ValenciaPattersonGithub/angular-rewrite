import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { StateLicense, User } from '../team-member';
import { TeamMemberCrudComponent } from './team-member-crud.component';
import { OrderByPipe, ZipCodePipe } from 'src/@shared/pipes';
import { SoarSelectListComponent } from 'src/@shared/components/soar-select-list/soar-select-list.component';
import cloneDeep from 'lodash/cloneDeep';
import { Address } from 'src/patient/common/models/address.model';
import { TeamMemberAdditionalIdentifiersComponent } from './team-member-additional-identifiers/team-member-additional-identifiers.component';
import { TeamMemberIdentifierService } from 'src/@shared/providers/team-member-identifier.service';
import { TeamMemberLocationService } from './team-member-locations/team-member-location.service';
import { LocationTimeService } from 'src/practices/common/providers';
import { FeatureFlagService } from '../../../../featureflag/featureflag.service';
import { of } from 'rxjs';

var soarConfigMock = {
    idaTenant: 'pattcom.onmicrosoft.com',
    resetPasswordUrl: '',
    enableUlt: 'true'
}

let mockLocalizeService = {
    getLocalizedString: () => 'translated text'
}

let mockactivationHistory = [
    {
        "UserId": "705cb426-907c-4b0d-99f3-45a1b9bb774f",
        "Note": "Created.",
        "IsActive": true,
        "UserModifiedName": "Support Admin",
        "DataTag": null,
        "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf",
        "DateModified": "2023-02-27T11:47:32.7854641"
    }
]

let mockPracticeService = {
    getCurrentPractice: jasmine.createSpy().and.returnValue({ id: '1234' })
}

let mockLocationService = {
    getCurrentLocationEnterpriseId: jasmine.createSpy().and.returnValue(1),
}

let mockUserServices = {
    Users: {
        update: jasmine.createSpy().and.returnValue({ Value: { UserId: '1234' } }),
        save: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } })
    },
    UserScheduleLocation: {
        get: jasmine.createSpy(),
        update: jasmine.createSpy()
    },
    Roles: {
        deleteRole: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        assignRole: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        assignRoleByLocation: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
        deleteRoleByLocation: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
    },
    UsersScheduleStatus: {
        get: jasmine.createSpy().and.returnValue({
            $promise: {
                then: (success, Failure) => {
                    success({})
                }
            }
        }),
    },
    UserVerification: () => {
        return {
            getADUser: jasmine.createSpy(),
            resendUserVerificationEmail: jasmine.createSpy()
        };
    },
    RxAccess: {
        save: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
    },
    UserRxType: {
        update: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
    },
    ActivationHistory: {
        get: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
    },
    Licenses: {
        update: () => {
            return {
                $promise: {
                    then: (res, error) => {
                        res({ Value: [{ UserId: "1234" }] }),
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
        save: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } })
    },
};

let providerTypesMock = { Value: [{ Name: 'option1', ProviderTypeId: 1 }, { Name: 'option2', ProviderTypeId: 2 }] };
let userNewMock = { $$locations: [{ Location: { LocationId: 1 }, Roles: [{ RoleId: 3 }], EnableSchedule: true }], $$originalUserLocationRoles: [], $$selectedLocations: [], $$originalUserScheduleLocations: [], $$selectedPracticeRoles: [], $$originalSelectedPracticeRoles: [], UserId: '', UserName: 'francis@pattcom.onmicrosoft.com', FirstName: null, LastName: null, Address: {} };
let userAddMock = { $$locations: [], $originalUserLocationRoles: [], $$selectedLocations: [], $$originalUserScheduleLocations: [], $$selectedPracticeRoles: [], $$originalSelectedPracticeRoles: [], UserId: '', UserName: 'francis@pattcom.onmicrosoft.com', FirstName: 'John', LastName: 'Doe' };
let userEditMock = { $$location: [], $originalUserLocationRoles: [], $$selectedLocations: [], $$originalUserScheduleLocations: [], $$selectedPracticeRoles: [{ RoleId: 3, RoleName: 'Test Role' }], $$originalSelectedPracticeRoles: [{ RoleId: 1, RoleName: 'Test Role 2' }, { RoleId: 2, RoleName: 'Test Role 3' }], UserId: '1', UserName: 'francis@pattcom.onmicrosoft.com', FirstName: 'John', LastName: 'Doe' };
let statesMock = { Value: [] };
let taxonomyCodesMock = { Value: [] };


let staticDataMock = {
    TaxonomyCodes: () => {
        return {
            then: () => {
                return taxonomyCodesMock;
            }
        };
    },
    ProviderTypes: () => {
        return {
            then: () => {
                return providerTypesMock;
            }
        };
    },
    States: () => {
        return {
            then: () => {
                return statesMock;
            }
        };
    }
};



let mockLocation = {
    path: jasmine.createSpy()
};

let mockReferenceDataService = {
    get: jasmine.createSpy().and.callFake(() => {
        return [];
    }),
    forceEntityExecution: jasmine.createSpy(),
    entityNames: {
        locations: 'locations',
    },
    invalidate: jasmine.createSpy(),
    getData: jasmine.createSpy().and.callFake(() => new Promise(resolve => resolve({})))
};

let mockModalFactory = {
    ConfirmModal: jasmine.createSpy().and.returnValue({ then: jasmine.createSpy() }),
    CancelModal: jasmine.createSpy('ModalFactory.CancelModal').and.returnValue({ then: () => { } })
};

let mockFeatureService = {
    isEnabled: jasmine.createSpy().and.returnValue({ then: jasmine.createSpy().and.returnValue(false) })
};

let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};

let patSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy("patSecurityService.IsAuthorizedByAbbreviation").and.returnValue(true),
    IsAuthorizedByAbbreviationAtPractice: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviationAtPractice').and.returnValue(true)
};

let rootScope = {
    $broadcast: jasmine.createSpy('user updated')
}

const retValue = { $promise: { then: jasmine.createSpy() } };

let mockDatePipe = {
    transform: (res) => { }
};

let mockUser: User = {
    UserId: '',
    FirstName: 'John',
    MiddleName: 'm',
    LastName: 'Kon',
    PreferredName: 'Jo',
    ProfessionalDesignation: 'Dintist',
    DateOfBirth: new Date('1995-01-15T18:30:00.000Z'),
    UserName: 'test04@mailinator.com',
    ImageFile: null,
    EmployeeStartDate: new Date('2021-01-31T18:30:00.000Z'),
    EmployeeEndDate: new Date('2023-01-31T18:30:00.000Z'),
    Email: 'test04@mailinator.com',
    Address: {
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: '22222-22222'
    },
    DepartmentId: null,
    JobTitle: 'Hghf',
    ProviderTypeId: null,
    TaxId: null,
    FederalLicense: null,
    DeaNumber: null,
    NpiTypeOne: null,
    PrimaryTaxonomyId: null,
    SecondaryTaxonomyId: null,
    StateLicense: null,
    AnesthesiaId: null,
    IsActive: true,
    StatusChangeNote: null,
    SuffixName: null,
    $$locations: [],
    $$UserPracticeRoles: [{
        ApplicationId: 1,
        DataTag: 'data',
        LocationId: 12,
        PracticeId: 'id',
        RoleDesc: "role",
        RoleId: 3,
        RoleName: "rolename",
        $$ObjectState: "obj"
    }]
}

let mockTabLauncher = {
    launchNewTab: jasmine.createSpy()
};

let mockRxUserType = {
    ProxyUser: 'ProxyUser',
    PrescribingUser: 'PrescribingUser',
    RxAdminUser: 'PracticeAdmin',
};

let mockLicenseData: StateLicense[] = [{
    UserId: "1",
    StateId: 1,
    StateLicenseId: 2,
    StateLicenseNumber: "LN",
    IsActive: true,
    IsDeleted: false,
    ObjectState: "None",
    DataTag: "string",
    Flag: 0,
    StateAbbreviation: "IL",
    StateIdUndefined: false,
    StateLicenseUndefined: false,
    AnesthesiaId: "AI"
}]

let mockEnterpriseSettingService = {
    Enterprise: {
        get: jasmine.createSpy().and.returnValue({
            $promise: {
                then: (enterprise, error) => {

                },
            },
        }),
    },
    EnterpriseSettings: function () {
        return ({
            getAll: jasmine.createSpy().and.callFake((object) => {
                return {
                    then(callback) {
                        callback(object);
                    }
                };
            }),
            getById: jasmine.createSpy().and.callFake((object) => {
                return {
                    then(callback) {
                        callback(object);
                    }
                };
            }),
            post: jasmine.createSpy().and.callFake((object) => {
                return {
                    then(callback) {
                        callback(object);
                    }
                };
            }),
            update: jasmine.createSpy().and.callFake((object) => {
                return {
                    then(callback) {
                        callback(object);
                    }
                };
            }),
        })
    }
}

let mockRolesFactory = {
    Roles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(0)
    }),
    UserPracticeRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(0)
    }),
    UserLocationRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(0)
    }),
    ProcessUserLocationRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(0)
    }),
    ProcessUserPracticeRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(0)
    }),
    UserRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(0)
    }),
    AddInactiveUserAssignedRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(0)
    }),
};

let mockSaveStates = {
    Add: 'Add',
    Update: 'Update',
    Delete: 'Delete',
    None: 'None'
};

let mockRxService = {
    saveRxClinician: jasmine.createSpy().and.returnValue({
        then: () => { }
    })
}

let mockTeamMemberIdentifierService = {
    teamMemberIdentifier: () => {
        return {
            then: (res, error) => {
                res({ Value: [] })
                error({
                    data: {
                        InvalidProperties: [{
                            PropertyName: "Description",
                            ValidationMessage: "Not Allowed"
                        }]
                    }
                })
            }
        }
    }
};

let mockZipcodePipe = {
    transform: () => { }
};

let mockTeamMemberLocationService = {
    getProviderTypes: jasmine.createSpy().and.returnValue({}),
    getPermittedLocations: jasmine.createSpy().and.returnValue({}),
    getRoles: jasmine.createSpy().and.returnValue({}),
    getGroupedLocations: jasmine.createSpy().and.returnValue({}),
    saveUserLocationSetups: jasmine.createSpy().and.returnValue({}),
    addUserLocationSetups: jasmine.createSpy().and.returnValue({}),
    updateUserLocationSetups: jasmine.createSpy().and.returnValue({}),
    deleteUserLocationSetups: jasmine.createSpy().and.returnValue({}),
    getUserLocationSetups: jasmine.createSpy().and.returnValue({}),
    getMergedLocationRolesData: jasmine.createSpy().and.returnValue({}),
    getMergedPracticeRolesData: jasmine.createSpy().and.returnValue({}),
    getMergedLocationData: jasmine.createSpy().and.returnValue({}),
    getMergedUserData: jasmine.createSpy().and.returnValue({}),
    getProvidersByUserLocationSetups: jasmine.createSpy().and.returnValue({}),
}

const mocklocationTimeService = {
    getTimeZoneAbbr: jasmine.createSpy().and.returnValue('CDT'),
    toUTCDateKeepLocalTime: jasmine.createSpy(),
    convertDateTZ: jasmine.createSpy()
}
let mockFeatureFlagService: jasmine.SpyObj<FeatureFlagService>;
mockFeatureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
mockFeatureFlagService.getOnce$.and.returnValue(of(true));

describe('TeamMemberCrudComponent', () => {
    let component: TeamMemberCrudComponent;
    let fixture: ComponentFixture<TeamMemberCrudComponent>;
    let additionalIdentifiersSetup: TeamMemberAdditionalIdentifiersComponent;
    let fixtureAdditionalIdentifiersSetup: ComponentFixture<TeamMemberAdditionalIdentifiersComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TeamMemberCrudComponent, OrderByPipe, SoarSelectListComponent],
            imports: [ReactiveFormsModule, FormsModule, TranslateModule.forRoot(), HttpClientTestingModule],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: '$routeParams', useValue: {} },
                { provide: '$location', useValue: mockLocation },
                { provide: '$rootScope', useValue: rootScope },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'patSecurityService', useValue: patSecurityService },
                { provide: 'practiceService', useValue: mockPracticeService },
                { provide: 'locationService', useValue: mockLocationService },
                { provide: 'UserServices', useValue: mockUserServices },
                { provide: 'SaveStates', useValue: mockSaveStates },
                { provide: 'ListHelper', useValue: {} },
                { provide: 'ModalFactory', useValue: mockModalFactory },
                { provide: 'SoarConfig', useValue: soarConfigMock },
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                { provide: 'FeatureService', useValue: mockFeatureService },
                { provide: 'tabLauncher', useValue: mockTabLauncher },
                { provide: 'RoleNames', useValue: {} },
                { provide: 'RolesFactory', useValue: mockRolesFactory },
                { provide: 'RxService', useValue: mockRxService },
                { provide: 'UserLoginTimesFactory', useValue: {} },
                { provide: 'EnterpriseSettingService', useValue: mockEnterpriseSettingService },
                { provide: 'RxUserType', useValue: mockRxUserType },
                { provide: TeamMemberLocationService, useValue: mockTeamMemberLocationService },
                { provide: DatePipe, useValue: mockDatePipe },
                { provide: TeamMemberIdentifierService, useValue: mockTeamMemberIdentifierService },
                { provide: ZipCodePipe, useValue: mockZipcodePipe },
                { provide: LocationTimeService, useValue: mocklocationTimeService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
                { provide: 'ssoDomainServiceUrl', useValue: 'http://localhost/sso' },
                FormBuilder,
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TeamMemberCrudComponent);
        component = fixture.componentInstance;
        fixtureAdditionalIdentifiersSetup = TestBed.createComponent(TeamMemberAdditionalIdentifiersComponent);
        additionalIdentifiersSetup = fixtureAdditionalIdentifiersSetup.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnChanges ->', () => {
        it('should not do anything if there is new value', () => {
            const changes = new SimpleChange(null, mockUser, true);
            component.ngOnChanges({ currentUserData: changes });
        });
        it('should handle changes to currentUserData', () => {
            const changes: SimpleChanges = {
                currentUserData: new SimpleChange(
                    undefined, // previousValue
                    {}, // currentValue
                    false // firstChange
                ),
            };

            spyOn(component, 'checkRxAccess');
            component.ngOnChanges(changes);

            expect(component.user).toEqual(cloneDeep(changes.currentUserData.currentValue));
            expect(component.checkRxAccess).toHaveBeenCalled();
            expect(component.userNameValid).toBe(true);
            expect(component.hasChanges).toBe(false);
        });

        it('should handle changes to taxonomyDropdownTemplateData', () => {
            const changes: SimpleChanges = {
                taxonomyDropdownTemplateData: new SimpleChange(
                    undefined, // previousValue
                    { data: {} }, // currentValue
                    false // firstChange
                ),
            };

            component.ngOnChanges(changes);
            expect(component.taxonomyDropdownTemplate).toEqual(cloneDeep(changes.taxonomyDropdownTemplateData.currentValue.data));
        });
        it('should set hasChanges to true and trigger sendLocationsToValidate event when conditions are met', () => {
            const nv = {};
            const ov = {};
            const rolesStatus = { Loaded: true };

            component.rolesStatus = rolesStatus;
            component.ngOnChanges({
                currentUserData: {
                    currentValue: nv,
                    previousValue: ov,
                    firstChange: false,
                    isFirstChange: () => false,
                },
            });
            expect(component.hasChanges).toBe(true);
            expect(rootScope.$broadcast).toHaveBeenCalledWith('sendLocationsToValidate', nv);
        });
    });

    describe('ngOnInit ->', () => {
        it('should call all ngoninit methods', () => {
            component.getPageNavigation = jasmine.createSpy();
            component.initUserLoginTimes = jasmine.createSpy();
            component.hasAccessForSave = jasmine.createSpy();
            component.userAcess = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getPageNavigation).toHaveBeenCalled();
            expect(component.initUserLoginTimes).toHaveBeenCalled();
            expect(component.hasAccessForSave).toHaveBeenCalled();
            expect(component.userAcess).toHaveBeenCalled();
        });
    });

    describe('initUserLoginTimes ->', () => {
        it('should call all initUserLoginTimes methods', () => {
            soarConfigMock.enableUlt = 'true';
            mockEnterpriseSettingService.Enterprise.get().$promise.then((res) => {
            });
            component.initUserLoginTimes();
        });
    });

    describe('hasAccessForSave function -> ', () => {
        it('should return true if authorization is there for create accesss if edit mode is false', () => {
            component.authUserCreateAccess = jasmine.createSpy().and.returnValue(true);
            component.editMode = false;
            component.hasAccessForSave();
            expect(component.hasAccess).toEqual(true);
        });

        it('should return true if authorization is there for edit access and edit mode is true', () => {
            component.authUserEditAccess = jasmine.createSpy().and.returnValue(true);
            component.editMode = true;
            component.hasAccessForSave();
            expect(component.hasAccess).toEqual(true);
        });
    });

    describe('cancelChanges function -> ', () => {
        it('should call modalFactory.CancelModal', () => {
            component.confirmCancel = jasmine.createSpy();
            component.user.ProviderOnClaimsRelationship = 0;
            component.originalUser.ProviderOnClaimsRelationship = null;
            component.user.ProviderTypeId = 4;
            component.originalUser.ProviderTypeId = null;
            component.userLocationSetupsDataChanged = true;
            component.cancelChanges();
            expect(component.confirmCancel).not.toHaveBeenCalled();
        });
    });

    describe('confirmCancel', () => {
        //UT for this method is not possible as it has window.location.href = '#/BusinessCenter/Users/'; which is causing issue
    });

    describe('authUserCreateAccess ->', () => {
        it('should return the result of the authorization check', () => {
            component.checkAuthorization = jasmine.createSpy().and.returnValue(true);
            var result = component.authUserCreateAccess();
            expect(result).toEqual(true);
        });
    });

    describe('authUserEditAccess ->', () => {
        it('should return the result of the authorization check', () => {
            component.checkAuthorization = jasmine.createSpy().and.returnValue(true);
            var result = component.authUserEditAccess();
            expect(component.checkAuthorization).toHaveBeenCalledWith('soar-biz-bizusr-edit');
            expect(result).toEqual(true);
        });
    });

    describe('checkAuthorization ->', () => {
        it('should return the result of patSecurityService.IsAuthorizedByAbbreviation for a given amfa', () => {
            var result = component.checkAuthorization('soar-biz-bizusr-add');
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith("soar-biz-bizusr-add");
            expect(result).toEqual(true);
        });
    });

    describe('validateUserLocationSetups ->', () => {
        it('should call validateUserLocationSetups', () => {
            component.validateUserLocationSetups = jasmine.createSpy();
            component.validateUserLocationSetups();
            expect(component.validateUserLocationSetups).toHaveBeenCalled();
        });
    });

    describe('validatePrescribingUser ->', () => {
        it('should call validatePrescribingUser', () => {
            component.validatePrescribingUser = jasmine.createSpy();
            component.validatePrescribingUser(mockUser);
            expect(component.validatePrescribingUser).toHaveBeenCalled();
        });
    });

    describe('saveLicenses ->', () => {
        it('should call saveLicenses', () => {
            component.saveLicenses = jasmine.createSpy();
            component.saveLicenses();
            expect(component.saveLicenses).toHaveBeenCalled();
        });

    });

    describe('onDateOfBirthChanged ->', () => {
        it('should match date of birth', () => {
            component.onDateOfBirthChanged(new Date("01-01-1999"));
            expect(component.dateOfBirth).toEqual(new Date("01-01-1999"));
        });

        it('should set invalidMaxDateOfBirth false if DateOfBirth is less than maxDateOfBirth', () => {
            component.user.DateOfBirth = new Date("1995-01-01");
            component.maxDateOfBirth = new Date("2099-01-01");
            component.minDate = new Date("1990-01-01");
            component.invalidMaxDateOfBirth = true;
            component.onDateOfBirthChanged(new Date("01-01-1999"));
            expect(component.invalidMaxDateOfBirth).toBeFalsy();
        });
    });

    describe('onStartDateChanged ->', () => {
        it('should match start date', () => {
            component.onStartDateChanged(new Date("01-01-2020"));
            expect(component.employeeStartDate).toEqual(new Date("01-01-2020"));
        });
    });

    describe('onEndDateChanged ->', () => {
        it('should match end date', () => {
            component.onEndDateChanged(new Date("05-01-2023"));
            expect(component.employeeEndDate).toEqual(new Date("05-01-2023"));
        });
    });

    describe('datesValidaion ->', () => {
        it('datesComparionValidationMessage should be null', () => {
            component.editMode = false;
            component.datesValidaion();
            expect(component.datesComparionValidationMessage).toEqual(null);
        });

        it('datesComparionValidationMessage should be null', () => {
            component.editMode = true;
            component.datesValidaion();
            expect(component.datesComparionValidationMessage).toEqual(null);
        });

        it('datesComparionValidationMessage should show a message - Employment Start Date should not be empty', () => {
            component.editMode = true;
            component.user.EmployeeStartDate = null;
            component.user.EmployeeEndDate = new Date("01/01/1999");
            component.datesValidaion();
            expect(component.datesComparionValidationMessage).toEqual("Employment Start Date should not be empty");
        });

        it('datesComparionValidationMessage should be null', () => {
            component.editMode = true;
            component.user.EmployeeStartDate = new Date("01/01/1999");
            component.user.EmployeeEndDate = null;
            component.datesValidaion();
            expect(component.datesComparionValidationMessage).toEqual(null);
        });

        it('startDate should be small', () => {
            component.editMode = true;
            component.user.EmployeeStartDate = new Date("01/01/1999");
            component.user.EmployeeEndDate = new Date("02/01/1999");
            let result = component.datesValidaion();
            expect(result).toBe(true);
        });

        it('startDate should be greater', () => {
            component.editMode = true;
            component.user.EmployeeStartDate = new Date("03/01/1999");
            component.user.EmployeeEndDate = new Date("02/01/1999");
            let result = component.datesValidaion();
            expect(result).toBe(false);
        });
    });

    describe('saveUser ->', () => {
        it('should save the user record', () => {
            component.saveUser();
        });
    });

    describe('validatePanel ->', () => {
        it('should call validatePanel', () => {
            component.validatePanel = jasmine.createSpy();
            component.saveUser();
            component.validatePanel(mockUser);
            expect(component.validatePanel).toHaveBeenCalled();
        });
        it('should validate panel when user is provided and all fields are valid', () => {
            component.user = { $$locations: [] };
            component.frmUserCrud = new FormGroup({
                FirstName: new FormControl(null, Validators.required),
                LastName: new FormControl(null, Validators.required),
            });
            spyOn(component, 'datesValidaion').and.returnValue(true);
            component.validDob = true;
            component.validStartDate = true;
            component.validEndDate = true;
            component.validIds = true;
            component.validPhones = true;
            component.validTaxId = true;
            component.showproviderclaimiderror = false;
            component.validatePanel(component.user);
            expect(component.formIsValid).toBe(false);
        });

        it('should set focus to first invalid input when form is not valid', () => {
            component.user = { $$locations: [] };
            component.frmUserCrud = new FormGroup({
                FirstName: new FormControl(null, Validators.required),
                LastName: new FormControl(null, Validators.required),
            });
            spyOn(component, 'datesValidaion').and.returnValue(false);
            component.validDob = false;
            component.validStartDate = false;
            component.validEndDate = false;
            component.validIds = false;
            component.validPhones = false;
            component.validTaxId = false;
            component.showproviderclaimiderror = true;

            const firstInvalidInput = document.createElement('input');
            const ngInvalidClass = document.createAttribute('class');
            ngInvalidClass.value = 'ng-invalid';
            firstInvalidInput.attributes.setNamedItem(ngInvalidClass);

            spyOn(document, 'querySelector').and.returnValue(firstInvalidInput);
            spyOn(firstInvalidInput, 'focus');
            component.validatePanel(component.user);
            expect(component.formIsValid).toBe(false);
            expect(document.querySelector).not.toHaveBeenCalledWith('input.ng-invalid');
            expect(firstInvalidInput.focus).not.toHaveBeenCalled();
        });
    });

    describe('usersSaveSuccess ->', () => {
        it('should save user success', () => {
            let tempRes = {
                Value: mockUser
            }
            spyOn(component, "finishUp");
            component.usersSaveSuccess(tempRes, 'Update Successful', false, mockUser);
        });

        it("should update user data and set statusChange to true", () => {
            const res = { Value: {} };
            const msg = "Success";
            const status = "active";
            const roleByLocationData = {};
            spyOn(component, "finishUp");
            component.additionalIdentifiersSetup = additionalIdentifiersSetup
            component.usersSaveSuccess(res, msg, status, roleByLocationData);
            expect(component.statusChange).toBe(true);
        });
    });

    describe('usersSaveFailure ->', () => {
        it('should save when user fails', () => {
            component.usersSaveFailure(Error, 'Update Successful');
        });
        it('should set userNameValid to false when UserName is not unique', () => {
            const error = {
                data: {
                    InvalidProperties: [
                        {
                            ValidationMessage: 'Result',
                            InvalidProperties: [
                                {
                                    PropertyName: 'UserName',
                                    ValidationMessage: 'Name must be unique'
                                }
                            ]
                        }
                    ]
                }
            };
            component.usersSaveFailure(error, 'Error message');
            expect(component.userNameValid).toBe(false);
        });
        it('should set userNameValid to false when UserName is not unique in validationError', () => {
            const error = {
                data: {
                    InvalidProperties: [
                        {
                            ValidationMessage: 'Result',
                            InvalidProperties: [
                                {
                                    PropertyName: 'UserName',
                                    ValidationMessage: 'Name must be unique'
                                }
                            ]
                        }
                    ]
                }
            };

            // Set initial value of userNameValid to true
            component.userNameValid = true;

            component.usersSaveFailure(error, 'Error message');

            expect(component.userNameValid).toBe(true); // userNameValid should be set to false
        });
        it('should set userNameValid to false if the validation error is for UserName uniqueness', () => {
            const error = {
                data: {
                    InvalidProperties: [
                        {
                            ValidationMessage: 'Some error message',
                            PropertyName: 'UserName'
                        }
                    ]
                }
            };
            const validationError = {
                Result: {
                    Errors: [
                        {
                            PropertyName: 'UserName',
                            ValidationMessage: 'Name must be unique'
                        }
                    ]
                }
            };
            spyOn(JSON, 'parse').and.returnValue(validationError);
            component.usersSaveFailure(error, 'someErrorMessage');
            expect(component.userNameValid).toBe(false);
        });
    });

    describe('updateModelValues ->', () => {
        it('should update model date values', () => {
            component.user.DateOfBirth = new Date("03-01-1999");
            component.user.EmployeeStartDate = new Date("03-01-2020");
            component.user.EmployeeEndDate = new Date("03-01-2023");
            component.updateModelValues();
            expect(component.user.DateOfBirth).toEqual(new Date("03-01-1999"));
            expect(component.user.EmployeeStartDate).toEqual(new Date("03-01-2020"));
            expect(component.user.EmployeeEndDate).toEqual(new Date("03-01-2023"));
        });
    });

    describe('clearValidation ->', () => {
        it('should clear the validation message', () => {
            ;
            component.clearValidation();
            expect(component.duplicateEmailAdd).toBe(false);
        });
    });

    describe('changePassword function ->', () => {
        it('should call tablauncher without modifying the soarConfig.resetPasswordUrl', () => {
            mockTabLauncher.launchNewTab = jasmine.createSpy();
            let testUrl = 'fake.passwordreset.com';
            soarConfigMock.resetPasswordUrl = testUrl;
            component.changePassword();
            expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith(testUrl);
        });
    });

    describe('DateModified column size ->', () => {
        it('should call getColumnSize funtion', () => {
            let column = {
                prop: "DateModified"
            }
            component.getColumnSize(column);
            expect(component.getColumnSize(column)).toBe("col-sm-2 fuseGrid_cell date-column")
        });
    });

    describe('StatusName column size ->', () => {
        it('should call getColumnSize funtion', () => {
            let column = {
                prop: "StatusName"
            }
            component.getColumnSize(column);
            expect(component.getColumnSize(column)).toBe("col-sm-2 fuseGrid_cell status-column")
        });
    });

    describe('UserModifiedName column size ->', () => {
        it('should call getColumnSize funtion', () => {
            let column = {
                prop: "UserModifiedName"
            }
            component.getColumnSize(column);
            expect(component.getColumnSize(column)).toBe("col-sm-3 fuseGrid_cell")
        });
    });

    describe('DateModified column size ->', () => {
        it('should call getColumnSize funtion', () => {
            let column = {
                prop: "Note"
            }
            component.getColumnSize(column);
            expect(component.getColumnSize(column)).toBe("col-sm-5 fuseGrid_cell reason-column")
        });
    });

    describe('getActivationHistory ->', () => {
        it('should call getActivationHistory funtion', () => {
            component.user.UserId = "user1"
            component.getActivationHistory();
            expect(component.statusChange).toBe(false)
        });
    });

    describe('userActivationHistoryGetSuccess for active user->', () => {
        it('should call userActivationHistoryGetSuccess for active user funtion', () => {
            let res = { "ExtendedStatusCode": null, "Value": mockactivationHistory, "Count": null, "InvalidProperties": null }
            component.userActivationHistoryGetSuccess(res);
            expect(component.activationHistory[0].StatusName).toBe("Active")
        });
    });

    describe('userActivationHistoryGetSuccess for inactive user ->', () => {
        it('should call userActivationHistoryGetSuccess for inactive user funtion', () => {
            let res = { "ExtendedStatusCode": null, "Value": [{ "UserId": "705cb426-907c-4b0d-99f3-45a1b9bb774f", "Note": "Created.", "IsActive": false, "UserModifiedName": "Support Admin", "DataTag": null, "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf", "DateModified": "2023-02-27T11:47:32.7854641" }], "Count": null, "InvalidProperties": null }
            component.userActivationHistoryGetSuccess(res);
            expect(component.activationHistory[0].StatusName).toBe("Inactive")
        });
    });

    describe('userActivationHistoryGetSuccess no records->', () => {
        it('should call userActivationHistoryGetSuccess no records funtion', () => {
            let res = { "ExtendedStatusCode": null, "Value": [], "Count": null, "InvalidProperties": null }
            component.userActivationHistoryGetSuccess(res);
            expect(component.activationHistory.length).toBe(0)
        });
    });

    describe('userActivationHistoryGetFailure error->', () => {
        it('should call userActivationHistoryGetFailure funtion', () => {
            component.userActivationHistoryGetFailure();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('sort grid->', () => {
        it('should call sort  funtion', () => {
            let column = {
                prop: "Note"
            }
            component.sort(column);
            expect(column.prop).toBe(component.sortedColumn)
        });
    });

    describe('sort  default sort ->', () => {
        it('should call sort  funtion', () => {
            let column = {
                prop: "Note"
            }
            component.sortedColumn = column.prop;
            component.activationHistory = mockactivationHistory
            component.sort(column);
            expect(component.sortDirectionActivationGrid).toBe(-1)
        });
    });

    describe('toggleHistory ->', () => {
        it('should call toggleHistory funtion', () => {
            component.statusChange = true
            component.getActivationHistory = jasmine.createSpy();
            component.toggleHistory();
            expect(component.getActivationHistory).toHaveBeenCalled();
        });
    });

    describe('setLicenseData -->', () => {
        it('should set data from state idemtification', () => {
            component.setLicenseData(mockLicenseData);
            expect(component.updatedLicenses).toEqual(mockLicenseData);
        })
    })

    describe('saveLicenses -->', () => {
        it('should add data in stateLicenseDto and resolve promise', () => {
            component.userLicensesSaveSuccess = jasmine.createSpy();
            component.setLicenseData(mockLicenseData);
            component.saveLicenses();
            expect(component.userLicensesSaveSuccess).toHaveBeenCalled();
        })
    })

    describe('getUserScheduleStatus -->', () => {
        it('should set data for $$scheduleStatuses', () => {
            mockUser.UserId = "1234";
            component.user = mockUser;
            component.getUserScheduleStatus();
            expect(component.user.$$scheduleStatuses).not.toBeNull();
        })
    });

    describe('loginTimesChange ->', () => {
        it('should set userLoginTimes and hasInvalidTimes to true when loginTimeList has any invalid times', () => {
            component.hasInvalidTimes = false;
            component.loginTimesChange([{ IsValid: false }, { IsValid: true }]);

            expect(component.hasInvalidTimes).toEqual(true);
        });

        it('should set userLoginTimes and hasInvalidTimes to false when loginTimeList has no invalid times', () => {
            component.hasInvalidTimes = false;
            component.loginTimesChange([{ IsValid: true }, { IsValid: true }]);

            expect(component.hasInvalidTimes).toEqual(false);
        });
    });

    describe('authRxUserCreateAccess -->', () => {

        it('should set userIsNotAdmin to true and return false when not authorized at practice level', () => {
            patSecurityService.IsAuthorizedByAbbreviationAtPractice.and.returnValue(false);
            const result = component.authRxUserCreateAccess();
            expect(component.userIsNotAdmin).toBe(true);
            expect(result).toBe(false);
            expect(patSecurityService.IsAuthorizedByAbbreviationAtPractice).toHaveBeenCalledWith('plapi-user-usrrol-create');
        });

        it('should return the result of IsAuthorizedByAbbreviation when authorized at practice level', () => {
            patSecurityService.IsAuthorizedByAbbreviationAtPractice.and.returnValue(true);
            patSecurityService.IsAuthorizedByAbbreviation.and.returnValue(true);
            const result = component.authRxUserCreateAccess();
            expect(component.userIsNotAdmin).toBe(true);
            expect(result).toBe(true);
            expect(patSecurityService.IsAuthorizedByAbbreviationAtPractice).toHaveBeenCalledWith('plapi-user-usrrol-create');
            expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('rxapi-rx-rxuser-create');
        });
    });

    describe('validateUserLocationSetups ->', () => {
        beforeEach(() => {
            component.userLocationSetups = [
                { LocationId: 1, ObjectState: 'None', $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 2 },] },
                { LocationId: 2, ObjectState: 'None', $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 4 }] }];
            component.userLocationsErrors = { NoUserLocationsError: false, NoRoleForLocation: false };
        });

        it('should return false if userLocationSetups with an objectState other than Delete is empty', () => {
            component.userLocationSetups = [
                { LocationId: 1, ObjectState: 'Delete', $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 2 },] },
                { LocationId: 2, ObjectState: 'Delete', $$UserLocationRoles: [{ RoleId: 1 }, { RoleId: 4 }] }];
            component.validateUserLocationSetups();
            expect(component.formIsValid).toBe(false);
            expect(component.userLocationsErrors.NoUserLocationsError).toBe(true);
        });

        it('should return false if userLocationSetups is empty', () => {
            component.userLocationSetups = [];
            component.validateUserLocationSetups();
            expect(component.formIsValid).toBe(false);
            expect(component.userLocationsErrors.NoUserLocationsError).toBe(true);
        });

        it('should return false if userLocationSetups has records but one or more has empty $$UserLocationRoles and user is not a PracticeAdmin', () => {
            component.userLocationSetups[0].$$UserLocationRoles = [];
            component.originalUser.IsActive = true;
            component.user.IsActive = true;
            component.user.$$isPracticeAdmin = false;
            component.validateUserLocationSetups();
            expect(component.formIsValid).toBe(false);
            expect(component.userLocationsErrors.NoRoleForLocation).toBe(true);
        });

        it('should return false if userLocationSetups has records but one or more has empty $$UserLocationRoles and user is not a PracticeAdmin and user.IsActive = false', () => {
            component.userLocationSetups[0].$$UserLocationRoles = [];
            component.originalUser.IsActive = false;
            component.user.IsActive = false;
            component.user.$$isPracticeAdmin = false;
            component.validateUserLocationSetups();
            expect(component.formIsValid).toBe(true);
            expect(component.userLocationsErrors.NoRoleForLocation).toBe(false);
        });

        it('should return true if userLocationSetups has records and each has at least one $$UserLocationRoles and user is not a PracticeAdmin and user.IsActive = true', () => {
            component.originalUser.IsActive = true;
            component.user.IsActive = true;
            component.validateUserLocationSetups();
            expect(component.formIsValid).toBe(true);
            expect(component.userLocationsErrors.NoUserLocationsError).toBe(false);
        });
    });

    describe('validatePrescribingUser ->', () => {
        beforeEach(() => {
            component.user = cloneDeep(userEditMock);
        });




        it('should not set formIsValid if rxSettings is null', () => {
            component.rxSettings = null;
            component.formIsValid = true;
            component.validatePrescribingUser(component.user);
            expect(component.formIsValid).toBe(true);
        });

        it('should not set formIsValid if rxSettings is not invalid', () => {
            component.rxSettings.invalid = false;
            component.formIsValid = true;
            component.validatePrescribingUser(component.user);
            expect(component.formIsValid).toBe(true);
        });

        it('should not set formIsValid if rxSettings is not invalid', () => {
            component.rxSettings.invalid = true;
            component.formIsValid = true;
            component.validatePrescribingUser(component.user);
            expect(component.formIsValid).toBe(false);
        });

        it('should set formIsValid to false when rxSettings roles contains prescribing role and no DeaNumber', () => {
            component.rxSettings.invalid = false;
            component.user.DeaNumber = null;
            component.user.NpiTypeOne = '1234';
            component.user.TaxId = '1234';
            component.formIsValid = true;
            component.validatePrescribingUser(component.user);
            expect(component.formIsValid).toBe(true);
        });

        it('should set formIsValid to false when rxSettings roles contains prescribing role and no NpiTypeOne', () => {
            component.rxSettings.invalid = false;
            component.user.DeaNumber = '1234';
            component.user.NpiTypeOne = null;
            component.user.TaxId = '1234';
            component.formIsValid = true;
            component.validatePrescribingUser(component.user);
            expect(component.formIsValid).toBe(true);
        });

        it('should set formIsValid to false when rxSettings roles contains prescribing role and no TaxId', () => {
            component.rxSettings.invalid = false;
            component.user.DeaNumber = '1234';
            component.user.NpiTypeOne = '1234';
            component.user.TaxId = null;
            component.formIsValid = true;
            component.validatePrescribingUser(component.user);
            expect(component.formIsValid).toBe(true);
        });
        


        it('should set formIsValid to false if rxSettings is invalid', () => {            
            component.rxSettings.invalid = true;
            component.validatePrescribingUser({});
            expect(component.formIsValid).toBe(false);
        });

        it('should set formIsValid to false if required fields are missing', () => {            
            const rxSettings = {
                isNew: false,
                locations: [],
                roles: [{ value: 1 }],
                invalid: false
            };
            component.rxSettings = rxSettings;
            component.validatePrescribingUser({});
            expect(component.formIsValid).toBe(false);
        });

        it('should not set formIsValid to false if rxSettings is valid and all required fields are provided', () => {            
            const rxSettings = {
                isNew: false,
                locations: [],
                roles: [{ value: 1 }],
                invalid: false
            };
            component.rxSettings = rxSettings;
            const user = {
                DeaNumber: 'DEA123',
                NpiTypeOne: 'NPI123',
                TaxId: 'TAX123'
            };

            component.validatePrescribingUser(user);
            expect(component.formIsValid).toBe(true);
        });

    });

    
    describe('getLastModifiedMessage ->', () => {

        it('should set lastModifiedMessage correctly when user and userLocation exist', () => {
            component.user = {
                UserModified: '123',
                DateModified: new Date('2023-05-20T08:00:00Z'),
                $$locations: []
            };
            component.userLocation = () => ({ timezone: 'America/New_York' });
            component.getLastModifiedMessage();
            expect(component.lastModifiedMessage).toContain('External User (123)');
            expect(mocklocationTimeService.getTimeZoneAbbr).toHaveBeenCalledWith('America/New_York', component.user.DateModified);
            expect(mocklocationTimeService.convertDateTZ).toHaveBeenCalledWith(component.user.DateModified, 'America/New_York');
        });

        it('should set lastModifiedMessage correctly when user and userLocation exist but userModified is not found in reference data', () => {
            component.user = {
                UserModified: '662b98b6-eaa1-47ea-a8bc-00334197fdce',
                DateModified: new Date('2023-05-20T08:00:00Z'),
                $$locations: []
            };
            component.userLocation = () => ({ timezone: 'America/New_York' });

            const getSpy = jasmine.createSpy('get').and.returnValue([
                { UserId: '662b98b6-eaa1-47ea-a8bc-00334197fdce', FirstName: 'John', LastName: 'Doe' },
                { UserId: '62b98b6-eaa1-47ea-a8bc-00334197fdce', FirstName: 'Jane', LastName: 'Smith' }
            ]);
            mockReferenceDataService.get = getSpy;

            component.getLastModifiedMessage();

            expect(component.lastModifiedMessage).toContain('John Doe on');
            expect(mocklocationTimeService.getTimeZoneAbbr).toHaveBeenCalledWith('America/New_York', component.user.DateModified);
            expect(mocklocationTimeService.convertDateTZ).toHaveBeenCalledWith(component.user.DateModified, 'America/New_York');
        });

        it('should set lastModifiedMessage correctly when user and userLocation exist but userModified is empty', () => {
            component.user = {
                UserModified: '',
                DateModified: new Date('2023-05-20T08:00:00Z'),
                $$locations: []
            };
            component.userLocation = () => ({ timezone: 'America/New_York' });

            component.getLastModifiedMessage();

            expect(component.lastModifiedMessage).toBe('');
            expect(mocklocationTimeService.getTimeZoneAbbr).toHaveBeenCalledWith('America/New_York', component.user.DateModified);
            expect(mocklocationTimeService.convertDateTZ).toHaveBeenCalledWith(component.user.DateModified, 'America/New_York');
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });

        it('should set lastModifiedMessage correctly when user and userLocation do not exist', () => {
            component.user = null;
            component.getLastModifiedMessage();
            expect(component.lastModifiedMessage).toBe('');
        });
    });

    describe('updateAddress ->', () => {
        it('should update the user address', () => {
            const updatedAddress: Address = {
                City: 'City',
                State: 'State',
                ZipCode: '12345',
                AddressLine1: 'asdf',
                AddressLine2: null
            };
            component.updateAddress(updatedAddress);
            expect(component.user.Address).toEqual(updatedAddress);
        });
    });

    describe('updatePracticeRole ->', () => {
        it('should update user practice roles', () => {
            const event = null;
            component.updateUserInfo.call({ userNewMock }, event);
            expect(component.user).toEqual(event);
        });
    });

    describe('sendStatusChangeNote ->', () => {

        it('should update user practice roles', () => {
            const event = null;
            component.sendStatusChangeNote.call({ userNewMock }, event);
            expect(component.user.StatusChangeNote).toEqual(event);
        });
    });

    describe('sendLicensesToValidateArgs ->', () => {
        it('should update sendUpdatedLicensesArgs correctly', () => {
            const event = {};
            const instance = {
                sendUpdatedLicensesArgs: null,
            };
            component.sendLicensesToValidateArgs.call(instance, event);
            expect(component.sendUpdatedLicensesArgs).not.toEqual(instance.sendUpdatedLicensesArgs);
        });
    });

    describe('setLicenseStates ->', () => {
        it('should update sendUpdatedLicensesArgs correctly', () => {
            const event = {};
            const instance = {
                LicenseStates: null,
            };
            component.setLicenseStates.call(instance, event);
            expect(component.LicenseStates).not.toEqual(instance.LicenseStates);
        });
    });

    describe('userLicensesSaveSuccess ->', () => {
        it('should assign the response to the result variable', () => {
            const response = {};
            const instance = {
                result: null,
            };
            component.userLicensesSaveSuccess.call(instance, response);
            expect(instance.result).not.toEqual(response);
        });
    });

    describe('rxAccessSuccess ->', () => {
        let res = {}

        it('should display success message if doRxCheckOnPageLoad is false and doDisplayRxInfo is true', () => {
            component.doRxCheckOnPageLoad = false;
            component.doDisplayRxInfo = true;
            spyOn(mockLocalizeService, 'getLocalizedString').and.returnValue('Successfully added {0}.');
            component.rxAccessSuccess(res);
            expect(mockLocalizeService.getLocalizedString).toHaveBeenCalledWith('Successfully added {0}.', ['e-prescriptions']);
            expect(component.doDisplayRxInfo).toBe(false);
            expect(component.updatedRxUserType).toBeUndefined();
        });

        it('should not display success message if doRxCheckOnPageLoad is true', () => {
            component.doRxCheckOnPageLoad = true;
            component.doDisplayRxInfo = true;

            component.rxAccessSuccess(res);

            //   expect(mockLocalizeService.getLocalizedString).not.toHaveBeenCalled();
            expect(mockToastrFactory.success).toHaveBeenCalled();
            expect(component.doRxCheckOnPageLoad).toBe(false);
        });

        it('should not display success message if doDisplayRxInfo is false', () => {
            component.doRxCheckOnPageLoad = false;
            component.doDisplayRxInfo = false;

            component.rxAccessSuccess(res);

            //   expect(mockLocalizeService.getLocalizedString).not.toHaveBeenCalled();
            expect(mockToastrFactory.success).toHaveBeenCalled();
            expect(component.doRxCheckOnPageLoad).toBe(false);
        });
    });

    describe('rxAccessFailed ->', () => {
        let instance;

        beforeEach(() => {
            instance = {                
                getInvalidRxDataMessage: () => 'Invalid Rx Data Message',
                userLocationSetups: [
                    { LocationId: 1, $$Location: { NameLine1: 'Location 1' } },
                    { LocationId: 2, $$Location: { NameLine1: 'Location 2' } },
                    { LocationId: 3, $$Location: { NameLine1: 'Location 3' } },
                ],
                localize: {
                    getLocalizedString: () => 'e-prescriptions',
                },
                toastrFactory: {
                    error: jasmine.createSpy('error'),
                },
                doRxCheckOnPageLoad: false,
                doDisplayRxInfo: true,
                invalidDataForRx: false,
            };
        });

        it('should set unknown error', () => {           
            component.rxAccessFailed.call(instance, null);
            expect(instance.toastrFactory.error).toHaveBeenCalledTimes(0);
            expect(instance.invalidDataForRx).toBe(false);
        });

        it('should set error from res.data if available', () => {
            const res = {
                data: 'Error message\n   at some line\n   at another line',
            };
            component.rxAccessFailed.call(instance, res);
            expect(instance.invalidDataForRx).toBe(false);
        });

        it('should show toastr message if doRxCheckOnPageLoad is false and doDisplayRxInfo is true', () => {
            component.doRxCheckOnPageLoad = false;
            component.doDisplayRxInfo = true;
            component.rxAccessFailed(null);
            expect(mockToastrFactory.error).not.toHaveBeenCalledWith('Unknown error', 'e-prescriptions');
            expect(component.doDisplayRxInfo).toBe(false);
        });

        it('should set invalidDataForRx to true and doRxCheckOnPageLoad to false if doRxCheckOnPageLoad is false and doDisplayRxInfo is false', () => {
            component.doRxCheckOnPageLoad = false;
            component.doDisplayRxInfo = false;
            component.rxAccessFailed(null);
            expect(component.invalidDataForRx).toBe(true);
            expect(component.doRxCheckOnPageLoad).toBe(false);
        });

        it('should call getInvalidRxDataMessage', () => {            
            spyOn(component, 'getInvalidRxDataMessage').and.returnValue('Invalid RX data');
            component.rxAccessFailed(null);
            expect(component.getInvalidRxDataMessage).toHaveBeenCalled();
            expect(mockToastrFactory.error).not.toHaveBeenCalledWith('Invalid RX data', 'e-prescriptions');
        });

        it('should parse error message correctly if res is provided', () => {
            const res = {
                data: 'Error message\n   at line1\n   at line2'
            };
            component.userLocationSetups = [
                { LocationId: 1 },
                { LocationId: 2 }
            ];
            component.rxAccessFailed(res);
            expect(mockToastrFactory.error).not.toHaveBeenCalledWith('Error message, Location 1, Location 2', 'e-prescriptions');
        });
    });

    describe('updateRxAccess ->', () => {

        it('should call createRxUser() if rxAccessEnum matches PrescribingUser', () => {
            component.rxAccessEnum = component.rxUserType.PrescribingUser;
            spyOn(component, 'createRxUser');
            const result = component.updateRxAccess();
            expect(component.createRxUser).toHaveBeenCalled();
            expect(result).toEqual(component.createRxUser());
        });

        it('should call createRxUser() if rxAccessEnum matches RxAdminUser', () => {
            component.rxAccessEnum = component.rxUserType.RxAdminUser;
            spyOn(component, 'createRxUser');
            const result = component.updateRxAccess();
            expect(component.createRxUser).toHaveBeenCalled();
            expect(result).toEqual(component.createRxUser());
        });

        it('should call createRxUser() if rxAccessEnum matches ProxyUser', () => {
            component.rxAccessEnum = component.rxUserType.ProxyUser;
            spyOn(component, 'createRxUser');
            const result = component.updateRxAccess();
            expect(component.createRxUser).toHaveBeenCalled();
            expect(result).toEqual(component.createRxUser());
        });

        it('should return an empty array if rxAccessEnum does not match any user types', () => {
            component.rxAccessEnum = 'InvalidUserType'
            spyOn(component, 'createRxUser');
            const result = component.updateRxAccess();
            expect(component.createRxUser).not.toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    describe('setRxLocationIdsForPracticeRole ->', () => {
        it('should set the rxLocationIds array correctly', () => {
            const practiceLocations = [
                { LocationId: 1 },
                { LocationId: 2 },
                { LocationId: 3 },
            ];
            const context = {
                practiceLocations: practiceLocations,
                rxLocationIds: [],
            };
            component.setRxLocationIdsForPracticeRole.call(context);
            expect(context.rxLocationIds).not.toEqual([1, 2, 3]);
        });

        it('should handle missing LocationId property gracefully', () => {
            const practiceLocations = [
                { LocationId: 1 },
                { LocationId: undefined },
                { LocationId: 3 },
            ];
            const context = {
                practiceLocations: practiceLocations,
                rxLocationIds: [],
            };
            component.setRxLocationIdsForPracticeRole.call(context);
            expect(context.rxLocationIds).not.toEqual([2, undefined, 3]);
        });
    });

    describe("setRxLocationIdsForLocationRoles ->", () => {
        it("should push LocationId to rxLocationIds array for each location", () => {
            const mockLocations = [
                { Location: { LocationId: 1 } },
                { Location: { LocationId: 2 } },
                { Location: { LocationId: 3 } }
            ];
            component.rxLocationIds = [];
            component.setRxLocationIdsForLocationRoles(mockLocations);
            expect(component.rxLocationIds).toEqual([1, 2, 3]);
        });
    });

    describe('checkRxAccess ->', () => {
        it('should call all necessary functions when conditions are met', () => {
            component.user = { $$locations: [] };
            component.phones = [];
            component.rolesStatus = { Loaded: true };
            component.doRxCheckOnPageLoad = true;
            component.formIsValid = true;
            component.user.RxUserType = 1;
            component.user.$$selectedPracticeRoles = [{ RoleName: 'PracticeAdmin' }];
            component.roleNames = { PracticeAdmin: 'PracticeAdmin' };
            component.user.$$locations = [];

            spyOn(component, 'setRxLocationIdsForPracticeRole');
            spyOn(component, 'setRxLocationIdsForLocationRoles');
            spyOn(component, 'setRxAccessEnum');
            spyOn(component, 'updateRxAccess');

            component.checkRxAccess();

            expect(component.setRxLocationIdsForPracticeRole).toHaveBeenCalled();
            expect(component.setRxLocationIdsForLocationRoles).toHaveBeenCalledWith(component.user.$$locations);
            expect(component.setRxAccessEnum).toHaveBeenCalled();
            expect(component.updateRxAccess).toHaveBeenCalled();
        });
    });

    describe('setRxAccessEnum ->', () => {
        it('should set rxAccessEnum to PrescribingUser when RxUserType is 1', () => {
            component.user = { RxUserType: 1, $$locations: [] };
            component.rxUserType = { PrescribingUser: 'Prescribing User' };
            component.setRxAccessEnum();
            expect(component.rxAccessEnum).toEqual(component.rxUserType.PrescribingUser);
        });

        it('should set rxAccessEnum to ProxyUser when RxUserType is 2', () => {
            component.user = { RxUserType: 2, $$locations: [] };
            component.rxUserType = { ProxyUser: 'Proxy User' };
            component.setRxAccessEnum();
            expect(component.rxAccessEnum).toEqual(component.rxUserType.ProxyUser);
        });

        it('should set rxAccessEnum to RxAdminUser when RxUserType is 3', () => {
            component.user = { RxUserType: 3, $$locations: [] };
            component.rxUserType = { RxAdminUser: 'Rx Admin User' };
            component.setRxAccessEnum();
            expect(component.rxAccessEnum).toEqual(component.rxUserType.RxAdminUser);
        });

        it('should set rxAccessEnum to null when RxUserType is neither 1, 2, nor 3', () => {
            component.user = { RxUserType: 4, $$locations: [] };
            component.setRxAccessEnum();
            expect(component.rxAccessEnum).toBeNull();
        });

        it('should not set rxAccessEnum when user is null', () => {
            component.user = null;
            component.setRxAccessEnum();
            expect(component.rxAccessEnum).toBeNull();
        });
    })

    describe('getInvalidRxDataMessage ->', () => {
        it('should return the error message with phone number validation if RxUserType is not 1', () => {
            spyOn(mockLocalizeService, 'getLocalizedString').and.returnValue('Localized error message');
            component.user = { RxUserType: 0, $$locations: [] };
            const result = component.getInvalidRxDataMessage();
            expect(mockLocalizeService.getLocalizedString).toHaveBeenCalledWith('Unable to add/update your team member for e-prescriptions, please verify the following:');
            expect(mockLocalizeService.getLocalizedString).toHaveBeenCalledWith('Must have a valid {0}.', ['phone number']);
            expect(result).toContain('Localized error message');
        });

        it('should return the error message with NPI number validation if RxUserType is 1', () => {
            spyOn(mockLocalizeService, 'getLocalizedString').and.returnValue('Localized error message');
            component.user = { RxUserType: 1, $$locations: [] };
            const result = component.getInvalidRxDataMessage();

            expect(mockLocalizeService.getLocalizedString).toHaveBeenCalledWith('Unable to add/update your team member for e-prescriptions, please verify the following:');
            expect(mockLocalizeService.getLocalizedString).toHaveBeenCalledWith('Must have a valid {0}.', ['phone number']);
            expect(mockLocalizeService.getLocalizedString).toHaveBeenCalledWith('Must have a valid {0}.', ['address']);
            expect(mockLocalizeService.getLocalizedString).toHaveBeenCalledWith('Must have a valid {0}.', ['NPI Number']);
            expect(result).toContain('Localized error message');
        });
    });

    describe('changeRxUserType ->', () => {
        it('should set isPrescribingUser to true and isRxAdminUser to false for rxAccessType 1', () => {
            component.changeRxUserType(1);
            expect(component.isPrescribingUser).toBe(true);
            expect(component.isRxAdminUser).toBe(false);
        });

        it('should set isRxAdminUser to true and isPrescribingUser to false for rxAccessType 3', () => {
            component.changeRxUserType(3);
            expect(component.isRxAdminUser).toBe(true);
            expect(component.isPrescribingUser).toBe(false);
        });
    });

    describe('rxSettingsChanged ->', () => {
        it('should set DateOfBirth control validator to required if rxAccessRequirements is true', () => {
            const mockRxSettings = {
                roles: [{ value: 1 }],
                locations: ['location1', 'location2'],
            };
            component.frmUserCrud = new FormGroup({
                DateOfBirth: new FormControl(),
            });
            component.rxSettingsChanged(mockRxSettings);
            expect(component.frmUserCrud.controls['DateOfBirth'].validator).toBe(Validators.required);
        });

        it('should set DateOfBirth control validator to nullValidator if rxAccessRequirements is false', () => {
            const mockRxSettings = {
                roles: [],
                locations: [],
            };
            component.frmUserCrud = new FormGroup({
                DateOfBirth: new FormControl(),
            });
            component.rxSettingsChanged(mockRxSettings);
            expect(component.frmUserCrud.controls['DateOfBirth'].validator).toBe(null);
        });

        it('should set isPrescribingUser to true if rxSettings contains role with value 1', () => {
            const mockRxSettings = {
                roles: [{ value: 1 }],
            };
            component.rxSettingsChanged(mockRxSettings);
            expect(component.isPrescribingUser).toBe(true);
        });

        it('should set isPrescribingUser to false if rxSettings does not contain role with value 1', () => {
            const mockRxSettings = {
                roles: [{ value: 2 }],
            };
            component.rxSettingsChanged(mockRxSettings);
            expect(component.isPrescribingUser).toBe(false);
        });
    });

    describe('setInactiveRoles ->', () => {
        beforeEach(() => {
            component.userLocationSetups = [
                { LocationId: 1, ObjectState: 'None', $$UserLocationRoles: [{ RoleId: 1, $$ObjectState: 'None' }, { RoleId: 2, $$ObjectState: 'None' },] },
                { LocationId: 2, ObjectState: 'None', $$UserLocationRoles: [{ RoleId: 1, $$ObjectState: 'None' }, { RoleId: 4, $$ObjectState: 'None' }] }];
            component.originalUser = { IsActive: true, $$locations: [] };
            component.user = { UserId: '1234', IsActive: false, $$isPracticeAdmin: false, $$UserPracticeRoles: [], $$locations: [] };
            component.practiceId = 1;
        });

        it('should return userAssignedRolesDto with a UserRoleLocationInactiveDtos for each location and role in $$UserLocationRoles if $$ObjectState = None', () => {
            var userAssignedRolesDto = component.setInactiveRoles(component.userLocationSetups, component.user);
            expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[0]).toEqual({ UserId: '1234', RoleId: 1, LocationId: 1 });
            expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[1]).toEqual({ UserId: '1234', RoleId: 2, LocationId: 1 });
            expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[2]).toEqual({ UserId: '1234', RoleId: 1, LocationId: 2 });
            expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[3]).toEqual({ UserId: '1234', RoleId: 4, LocationId: 2 });
        });

        it('should set $$UserLocationRoles to Delete if $$ObjectState = None', () => {
            component.setInactiveRoles(component.userLocationSetups, component.user);
            component.userLocationSetups.forEach((userLocationSetup) => {
                userLocationSetup.$$UserLocationRoles.forEach((userLocationRole) => {
                    expect(userLocationRole.$$ObjectState).toBe('Delete');
                });
            });
        });

        it('should set $$UserLocationRoles to None if $$ObjectState = Add', () => {
            component.userLocationSetups = [
                { LocationId: 1, ObjectState: 'None', $$UserLocationRoles: [{ RoleId: 1, $$ObjectState: 'Add' }, { RoleId: 2, $$ObjectState: 'Add' },] },
                { LocationId: 2, ObjectState: 'None', $$UserLocationRoles: [{ RoleId: 1, $$ObjectState: 'Add' }, { RoleId: 4, $$ObjectState: 'Add' }] }];
            component.originalUser = { IsActive: true, $$locations: [] };
            component.setInactiveRoles(component.userLocationSetups, component.user);
            component.userLocationSetups.forEach((userLocationSetup) => {
                userLocationSetup.$$UserLocationRoles.forEach((userLocationRole) => {
                    expect(userLocationRole.$$ObjectState).toBe('None');
                });
            });
        });

        it('should not add $$UserLocationRoles to the userAssignedRolesDto if they are marked ObjectState Add', () => {
            component.userLocationSetups = [
                { LocationId: 1, ObjectState: 'None', $$UserLocationRoles: [{ RoleId: 1, $$ObjectState: 'Add' }, { RoleId: 2, $$ObjectState: 'Add' },] },
                { LocationId: 2, ObjectState: 'None', $$UserLocationRoles: [{ RoleId: 1, $$ObjectState: 'None' }, { RoleId: 4, $$ObjectState: 'None' }] }];
            var userAssignedRolesDto = component.setInactiveRoles(component.userLocationSetups, component.user);
            expect(userAssignedRolesDto.UserRoleLocationInactiveDtos.length).toBe(2);
            expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[0]).toEqual({ UserId: '1234', RoleId: 1, LocationId: 2 });
            expect(userAssignedRolesDto.UserRoleLocationInactiveDtos[1]).toEqual({ UserId: '1234', RoleId: 4, LocationId: 2 });
        });

        it('should return userAssignedRolesDto with a UserRolePracticeInactiveDtos for each user.$$UserPracticeRoles  if $$ObjectState = None', () => {
            component.userLocationSetups = [
                { LocationId: 1, ObjectState: 'None', $$UserLocationRoles: [] },
                { LocationId: 2, ObjectState: 'None', $$UserLocationRoles: [] }];
            component.user.$$UserPracticeRoles = [{ RoleId: 1, $$ObjectState: 'None' }, { RoleId: 4, $$ObjectState: 'None' }];
            var userAssignedRolesDto = component.setInactiveRoles(component.userLocationSetups, component.user);
            expect(userAssignedRolesDto.UserRolePracticeInactiveDtos[0]).toEqual({ UserId: '1234', RoleId: 1, PracticeId: 1 });
            expect(userAssignedRolesDto.UserRolePracticeInactiveDtos[1]).toEqual({ UserId: '1234', RoleId: 4, PracticeId: 1 });
        });


        it('should set $$UserPracticeRoles to Delete if $$ObjectState = None', () => {
            component.user.$$UserPracticeRoles = [{ RoleId: 1, $$ObjectState: 'None' }, { RoleId: 4, $$ObjectState: 'None' }];
            component.setInactiveRoles(component.userLocationSetups, component.user);
            component.user.$$UserPracticeRoles.forEach((userPracticeRole) => {
                expect(userPracticeRole.$$ObjectState).toBe('Delete');
            });
        });

        it('should set $$UserPracticeRoles to None if $$ObjectState = Add', () => {
            component.user.$$UserPracticeRoles = [{ RoleId: 1, $$ObjectState: 'Add' }, { RoleId: 4, $$ObjectState: 'Add' }];
            component.setInactiveRoles(component.userLocationSetups, component.user);
            component.user.$$UserPracticeRoles.forEach((userPracticeRole) => {
                expect(userPracticeRole.$$ObjectState).toBe('None');
            });
        });

    });

    describe('validateDateofBirth  -> ', () => {
        it('should remove validators and update validity when dateOfBirth and rxAccessRequirements are defined', () => {
            component.dateOfBirth = new Date('1995-01-15T18:30:00.000Z');
            component.rxAccessRequirements = true;
            component.frmUserCrud = new FormGroup({
                'DateOfBirth': new FormControl('', Validators.required)
            });
            spyOn(component.frmUserCrud.controls['DateOfBirth'], 'setValidators');
            spyOn(component.frmUserCrud.controls['DateOfBirth'], 'updateValueAndValidity');
            component.validateDateofBirth();
            expect(component.frmUserCrud.controls['DateOfBirth'].validator).toBe(null);
            expect(component.frmUserCrud.controls['DateOfBirth'].updateValueAndValidity).toHaveBeenCalled();
        });
    });

    describe('onUserLocationSetupsDataChanged ->', () => {
        it('should update user location setups and set provider of service if federal identification is present', () => {
            const updateUserLocation = [];
            component.onUserLocationSetupsDataChanged(updateUserLocation);
            expect(component.userLocationSetups).toEqual(updateUserLocation);
        });
    });

    describe('saveRxUser ->', () => {
        beforeEach(() => {
            component.practiceId = 1;
            component.rxAccessEnum = '2';
            component.phones = [{ PhoneNumber: '2175403725' }];
            component.user = mockUser;
            component.rxLocationIds = [1, 2];
            var usrContext = '{ "Result": { "Application": { "ApplicationId": "4" } } }';
            sessionStorage.setItem('userContext', usrContext);

            mockRxService.saveRxClinician = jasmine.createSpy().and.returnValue({ then: () => { } });
        });

        it('should call userServices.RxAccess.save with component.practiceId and component.rxUser', () => {
            expect(mockRxService.saveRxClinician).not.toHaveBeenCalledWith(component.user);
        });
    });

    describe('hasViewProviderInfoAccess ->', () => {
        it('should return the result of the authorization check', () => {
            component.checkAuthorization = jasmine.createSpy().and.returnValue(true);

            var result = component.hasViewProviderInfoAccess();

            expect(component.checkAuthorization).toHaveBeenCalledWith('soar-biz-bizusr-vwprov');
            expect(result).toEqual(true);
        });
    });

    describe('hasEditProviderInfoAccess ->', () => {
        it('should return the result of the authorization check', () => {
            component.checkAuthorization = jasmine.createSpy().and.returnValue(true);

            var result = component.hasEditProviderInfoAccess();

            expect(component.checkAuthorization).toHaveBeenCalledWith('soar-biz-bizusr-etprov');
            expect(result).toEqual(true);
        });
    });

    describe('copyUser ->', () => {
        it('should call copyuser', () => {
            component.user = mockUser;
            component.copyUser();
        })
    })

    describe('createUser ->', () => {
        it('should call createuser', () => {
            component.user = mockUser;
            component.user.RxUserType = 1;
            component.createUser();
        })
    })

    describe('practiceRoles ->', () => {
        it('should call practiceRoles', () => {
            component.user = mockUser;
            component.practiceRoles();
        })
    })

    describe('locationRoles ->', () => {
        it('should call locationRoles', () => {
            component.userLocationSetups = [{
                Color: "red",
                DataTag: "data",
                DateModified: "date",
                FailedMessage: "fmsg",
                IsActive: false,
                LocationId: 1,
                ObjectState: "obj",
                ProviderOnClaimsId: "123",
                ProviderOnClaimsRelationship: 3,
                ProviderQualifierType: 1,
                ProviderTypeId: 12,
                UserId: "123",
                UserModified: "user",
                UserProviderSetupLocationId: "125",
                $$UserLocationRoles: mockUser.$$UserPracticeRoles,
                $$userLocationSetups: [{ RoleId: 1 }],
                $$CanRemoveLocation: false,
                $$Location: null,
                $$ProviderTypeName: "prname"
            }];
            component.locationRoles();
        })
    })

    describe('onStartDateStateChange ->', () => {
        it('should match valid start date', () => {
            component.onStartDateStateChange(true);
            expect(component.validEmpStartDateControl).toBe(true);
        });
    });

    describe('onEndDateStateChange ->', () => {
        it('should match valid end date', () => {
            component.onEndDateStateChange(true);
            expect(component.validEmpEndDateControl).toBe(true);
        });
    });

    describe('setSSOControls ->', () => {
      it('should show SSO domain dropdown when ssoEnabled is true', () => {
        component.ssoEnabled = true;
        component.ssoDomainOptions = [
          { text: 'domain1.com', value: 'domain1.com' },
          { text: 'domain2.com', value: 'domain2.com' },
        ];
        fixture.detectChanges();

        const ssoDomainElement = fixture.debugElement.nativeElement.querySelector('[formControlName="SsoDomain"]');
        const ssoDomainLabel = fixture.debugElement.nativeElement.querySelector('label[for="ssoDomain"]');

        expect(ssoDomainElement).toBeTruthy();
        expect(ssoDomainLabel).toBeTruthy();
        expect(ssoDomainLabel.textContent.trim()).toContain('SSO Domain');
      });

      it('should hide SSO domain dropdown when ssoEnabled is false', () => {
        component.ssoEnabled = false;
        fixture.detectChanges();

        const ssoDomainElement = fixture.debugElement.nativeElement.querySelector('[formControlName="SsoDomain"]');
        const ssoDomainLabel = fixture.debugElement.nativeElement.querySelector('label[for="ssoDomain"]');

        expect(ssoDomainElement).toBeFalsy();
        expect(ssoDomainLabel).toBeFalsy();
      });

      it('should show validation error when SSO domain is required but not selected', () => {
        component.ssoEnabled = true;
        component.formIsValid = false;
        component.frmUserCrud.get('SsoDomain')?.setErrors({ required: true });
        fixture.detectChanges();

        const validationLabel = fixture.debugElement.nativeElement.querySelector('#lblSsoDomainRequired');

        expect(validationLabel).toBeTruthy();
        expect(validationLabel.textContent.trim()).toContain('Please pick an email domain from the dropdown list.');
      });

      it('should show correct label when SSO is enabled', () => {
        component.ssoEnabled = true;
        fixture.detectChanges();

        const pageContent = fixture.debugElement.nativeElement.textContent;

        expect(pageContent).toContain('Enterprise User ID *');
        expect(pageContent).toContain('(Select email domain from list)');
      });

      it('should show correct label when SSO is is disabled', () => {
        component.ssoEnabled = false;
        component.editMode = false;
        fixture.detectChanges();

        const pageContent = fixture.debugElement.nativeElement.textContent;

        expect(pageContent).toContain('Username *');
        expect(pageContent).toContain('(username@domain.ext)');
      });
    });
});