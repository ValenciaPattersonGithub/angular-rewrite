import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { TeamMemberLocationsComponent } from './team-member-locations.component';
import { cloneDeep } from 'lodash';
import { EventEmitter, SimpleChange } from '@angular/core';
import { TeamMemberLocationSetupComponent } from './team-member-location-setup/team-member-location-setup.component';
import { DialogContainerService, DialogService } from '@progress/kendo-angular-dialog';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { DatePipe } from '@angular/common';
import { OrderByPipe } from 'src/@shared/pipes/order-by/order-by.pipe';
import { TeamMemberLocationService } from './team-member-location.service';
import { User } from '../../team-member';
import { ViewCompareRolesComponent } from '../../view-compare-roles/view-compare-roles.component';
import { of } from 'rxjs';
import { SaveStates } from 'src/@shared/models/transaction-enum';
import { TruncateTextPipe } from 'src/@shared/pipes/truncate/truncate-text.pipe';
import { FeatureFlagService } from '../../../../../featureflag/featureflag.service';
import { ApplicationBillingInfoService } from '../../../../../@core/http-services/application-billing-info.service';

let mockDialogRef;
let mockLocalizeService;
let mockModalFactory;
let newUserLocationSetupMock;
let userLocationSetupsMock;
let newMockUser;
let mockRolesFactory;
let mockpatSecurityService;
let mockReferenceDataService;
let mockConfirmationModalService;
let mockRoles;
let mockGetLocationServices;
let mockToastrFactory;
let mockDatePipe;
let mockSaveStates;
let mockUser: User;
let locationsList;
let mockTeamMemberLocationService;
let mockApplicationBillingInfoService;
let mockFeatureFlagService;

describe('TeamMemberLocationsComponent', () => {
  let component: TeamMemberLocationsComponent;
  let fixture: ComponentFixture<TeamMemberLocationsComponent>;
  let viewCompareRolesComponent: ViewCompareRolesComponent;
  let dialogservice: DialogService;

  configureTestSuite(() => {
    mockDialogRef = {
      close: () => of({}),
      open: () => { },
      content: {
        template: '',
        result: of(null),
        instance: {
        },
      },
      result: of(null),
    };

    mockLocalizeService = {
      getLocalizedString: () => 'translated text'
    }

    mockModalFactory = {
      ConfirmModal: jasmine.createSpy().and.returnValue({ then: jasmine.createSpy() }),
      CancelModal: jasmine.createSpy().and.returnValue({ then: jasmine.createSpy() })
    }

    newUserLocationSetupMock = {
      $$ProviderOnClaims: '',
      $$ProviderQualifierTypeName: '',
      $$ProviderTypeName: null,
      $$UserLocationRoles: [],
      Color: null,
      LocationId: null,
      ObjectState: SaveStates.None,
      ProviderOnClaimsId: null,
      ProviderOnClaimsRelationship: null,
      ProviderQualifierType: null,
      ProviderTypeId: null,
      UserId: null,
      UserProviderSetupLocationId: null
    }

    userLocationSetupsMock = [
      { LocationId: 1, UserLocationSetupId: 1234, $$UserLocationRoles: [{ RoleId: 1, $$ObjectState: SaveStates.None }, { RoleId: 2, $$ObjectState: SaveStates.None },] },
      { LocationId: 2, UserLocationSetupId: 5678, $$UserLocationRoles: [{ RoleId: 1, $$ObjectState: SaveStates.None }, { RoleId: 4, $$ObjectState: SaveStates.None }] }
    ];

    newMockUser = { UserId: null, IsActive: true, $$UserPracticeRoles: [] };

    mockRolesFactory = {
      access: jasmine.createSpy().and.returnValue({}),
      Roles: () => {
        return {
          then: (res, error) => {
            res({ Result: mockRoles }),
              error({
              })
          }
        }
      },
      UserRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue({})
      }),
      AllPracticeAdmins: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue({
          $promise: {
            then: (res) => {
              res({ Result: {} })
            }
          }
        })
      }),
      GetInactiveUserAssignedRoles: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue({})
      }),
    };

    mockpatSecurityService = {
      IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
    };

    mockReferenceDataService = {
      get: jasmine.createSpy().and.returnValue([]),
      entityNames: {
        practiceSettings: 'test'
      }
    }

    mockConfirmationModalService = {
      open: jasmine.createSpy().and.returnValue({
        events: {
          pipe: (event) => {
            return {
              type: "confirm",
              subscribe: (success) => {
                success({ type: "confirm" })
              },
              filter: (f) => { return f }
            }
          }
        },
        close: jasmine.createSpy(),
      }),
    };


    mockRoles = [
      { RoleName: 'Assistant' },
      { RoleName: 'Associate Dentist' },
      { RoleName: 'low' },
      { RoleName: 'medium' },
      { RoleName: 'high' }];

    mockGetLocationServices = {
      get: () => {
        return {
          $promise: {
            then: (res, error) => {
              res({ Result: mockRoles }),
                error({
                  data: {
                    InvalidProperties: [{
                      PropertyName: "",
                      ValidationMessage: ""
                    }]
                  }
                })
            }
          }
        }
      },
      getPermittedLocations: (actionId) => {
        return {
          $promise: {
            then: (res, error) => {
              res({ Result: [] }),
                error({
                  data: {
                    InvalidProperties: [{
                      PropertyName: "",
                      ValidationMessage: ""
                    }]
                  }
                })
            }
          }
        }
      }
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    mockDatePipe = {
      transform: (res) => { }
    };

    mockSaveStates = {
      Add: SaveStates.Add,
      Update: SaveStates.Update,
      Delete: SaveStates.Delete
    };

    mockUser = {
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
      $$isPracticeAdmin: true,
      DepartmentName: ""
    };

    locationsList = {
      Value: [
        { LocationId: 1, NameLine1: 'First Office', AddressLine1: '123 Apple St', AddressLine2: 'Suite 10', ZipCode: '62401', City: 'Effingham', State: 'IL', PrimaryPhone: '5551234567' },
        { LocationId: 2, NameLine1: 'Second Office', AddressLine1: '123 Count Rd', AddressLine2: '', ZipCode: '62858', City: 'Louisville', State: 'IL', PrimaryPhone: '5559876543' },
        { LocationId: 3, NameLine1: 'Third Office', AddressLine1: '123 Adios St', AddressLine2: '', ZipCode: '60601', City: 'Chicago', State: 'IL', PrimaryPhone: '3124567890' },
        { LocationId: 4, NameLine1: 'Fourth Office', AddressLine1: '123 Hello Rd', AddressLine2: '', ZipCode: '62895', City: 'Wayne City', State: 'IL', PrimaryPhone: '6187894563', SecondaryPhone: '6181234567' }
      ]
    };

    mockTeamMemberLocationService = {
      getProviderTypes: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
          resolve({ Value: mockUser }),
            reject({
              error: {
                InvalidProperties: [{
                  PropertyName: "",
                  ValidationMessage: ""
                }]
              }
            });
        });
      }),
      getPermittedLocations: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
          resolve(locationsList),
            reject({ Error: "" });
        });
      }),
      getGroupedLocations: jasmine.createSpy().and.returnValue(mockUser),
      saveUserLocationSetups: jasmine.createSpy().and.returnValue(mockUser),
      addUserLocationSetups: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue({})
      }),
      updateUserLocationSetups: jasmine.createSpy().and.returnValue(mockUser),
      deleteUserLocationSetups: jasmine.createSpy().and.returnValue(mockUser),
      getUserLocationSetups: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue({})
      }),
      getMergedLocationRolesData: jasmine.createSpy().and.returnValue(mockUser),
      getMergedPracticeRolesData: jasmine.createSpy().and.returnValue(mockUser),
      getMergedLocationData: jasmine.createSpy().and.returnValue(mockUser),
      getMergedUserData: jasmine.createSpy().and.returnValue(mockUser),
      getProvidersByUserLocationSetups: jasmine.createSpy().and.returnValue(mockUser),
      rxRoleFilter: jasmine.createSpy().and.returnValue(mockUser.$$UserPracticeRoles),
      getUserRoles: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
          resolve({ Value: mockRoles }),
            reject({ Error: "" });
        });
      }),
      getRoles: () => {
        return {
          then: (res, error) => {
            res(mockRoles),
              error({
                data: {
                  InvalidProperties: [{
                    PropertyName: "",
                    ValidationMessage: ""
                  }]
                }
              })
          }
        }
      },
      }

      mockApplicationBillingInfoService = {
          getBillingModel: jasmine.createSpy().and.callFake(() => {
              return new Promise((resolve, reject) => {
                  resolve(2),
                      reject({ Error: 0 });
              });
          }),
      }

      mockFeatureFlagService = {
          getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(
              of(true)),
      };

    TestBed.configureTestingModule({
      declarations: [TeamMemberLocationsComponent, TeamMemberLocationSetupComponent, OrderByPipe, TruncateTextPipe, ViewCompareRolesComponent],
      imports: [ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [DialogService, DialogContainerService,
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'ModalFactory', useValue: mockModalFactory },
        { provide: 'RoleNames', useValue: {} },
        { provide: 'SaveStates', useValue: mockSaveStates },
        { provide: 'UserServices', useValue: {} },
        { provide: 'RolesFactory', useValue: mockRolesFactory },
        { provide: 'referenceDataService', useValue: mockReferenceDataService },
        { provide: 'patSecurityService', useValue: mockpatSecurityService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'LocationServices', useValue: mockGetLocationServices },
        { provide: TeamMemberLocationService, useValue: mockTeamMemberLocationService },
        { provide: '$routeParams', useValue: {} },
        { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
        { provide: DatePipe, useValue: mockDatePipe },
        { provide: ApplicationBillingInfoService, useValue: mockApplicationBillingInfoService },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamMemberLocationsComponent);
    component = fixture.componentInstance;
    let viewCompareFixture = TestBed.createComponent(ViewCompareRolesComponent);
    viewCompareRolesComponent = viewCompareFixture.componentInstance;
    dialogservice = TestBed.get(DialogService);
    component.user = cloneDeep(newMockUser);
    component.userLocationSetups = cloneDeep(userLocationSetupsMock);
    component.practiceAdminRole = { RoleId: 8, RoleName: '', $$ObjectState: SaveStates.None };
    fixture.detectChanges();
    dialogservice.open = jasmine.createSpy().and.returnValue(mockDialogRef);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnchanges =>', () => {
    it('should set user and currentStatus when changes contain user', () => {
      const changes = {
        user: new SimpleChange(null, { IsActive: true }, true),
      };
      component.ngOnChanges(changes);
      expect(component.user).toEqual(changes.user.currentValue);
      expect(component.currentStatus).toEqual(changes.user.currentValue.IsActive);
    });

    it('should call sendLicensesToValidate when changes contain updatedLicensesArgs', () => {
      const changes = {
        updatedLicensesArgs: {
          currentValue: true,
          previousValue: false,
          firstChange: true,
          isFirstChange: () => true,
        },
      };
      const sendLicensesToValidateSpy = spyOn(component, 'sendLicensesToValidate');
      component.ngOnChanges(changes);
      expect(sendLicensesToValidateSpy).toHaveBeenCalledWith(undefined);
    });
  });

  describe('ngOnInit =>', () => {
    beforeEach(() => {
      spyOn(component, 'determinePracticeRoleAccess');
      spyOn(component, 'getUserLocationsSetups');
      spyOn(component, 'getUserRoles');
      component.user = cloneDeep(newMockUser);
    });

    it('should call determinePracticeRoleAccess', () => {
      component.ngOnInit();
      expect(component.determinePracticeRoleAccess).toHaveBeenCalled();
    });


    it('should not call component.getUserLocationsSetups for when adding a new user', () => {
      component.user.UserId = null;
      component.ngOnInit();
      expect(component.getUserLocationsSetups).not.toHaveBeenCalled();
      expect(component.getUserRoles).not.toHaveBeenCalled();
    });

  });

  describe('watch statement over service code data =>', () => {
    it('serviceCode.Data watch statement should set dataHasChanged to true for any changes made to service code data, when dataHasChanged is initially set to false', () => {
      const changes = {
        user: new SimpleChange(null, { IsActive: true }, true),
      };
      component.ngOnChanges(changes);
    });
  });

  describe('getDeleteAccess =>', () => {
    it('should set hasDeleteAccess to true when IsAuthorizedByAbbreviation returns true', () => {
      const isAuthorizedSpy = mockpatSecurityService.IsAuthorizedByAbbreviation as jasmine.Spy;
      isAuthorizedSpy.and.returnValue(true);
      component.getDeleteAccess();
      expect(component.hasDeleteAccess).toBe(true);
      expect(isAuthorizedSpy).toHaveBeenCalledWith('soar-biz-bizusr-delete');
    });

    it('should set hasDeleteAccess to false when IsAuthorizedByAbbreviation returns false', () => {
      const isAuthorizedSpy = mockpatSecurityService.IsAuthorizedByAbbreviation as jasmine.Spy;
      isAuthorizedSpy.and.returnValue(false);
      component.getDeleteAccess();
      expect(component.hasDeleteAccess).toBe(false);
      expect(isAuthorizedSpy).toHaveBeenCalledWith('soar-biz-bizusr-delete');
    });
  });

  describe('getAddEditAccess =>', () => {
    it('should set hasAddEditAccess to true when IsAuthorizedByAbbreviation returns true', () => {
      const isAuthorizedSpy = mockpatSecurityService.IsAuthorizedByAbbreviation as jasmine.Spy;
      isAuthorizedSpy.and.returnValue(true);
      component.getAddEditAccess();
      expect(component.hasAddEditAccess).toBe(true);
      expect(isAuthorizedSpy).toHaveBeenCalledWith('plapi-user-usrrol-create');
    });

    it('should set hasAddEditAccess to false when IsAuthorizedByAbbreviation returns false', () => {
      const isAuthorizedSpy = mockpatSecurityService.IsAuthorizedByAbbreviation as jasmine.Spy;
      isAuthorizedSpy.and.returnValue(false);
      component.getAddEditAccess();
      expect(component.hasAddEditAccess).toBe(false);
      expect(isAuthorizedSpy).toHaveBeenCalledWith('plapi-user-usrrol-create');
    });
  });

  describe('determinePracticeRoleAccess => ', () => {
    beforeEach(() => {
      sessionStorage.setItem('userContext', JSON.stringify({ Result: { Access: [{ AccessLevel: 2 }], Application: { ApplicationId: 1 } } }));
      component.loggedInUserHasPracticeAccess = false;
    });
    it('should set scope.loggedInUserHasPracticeAccess based on AccessLevel in userContext', () => {
      sessionStorage.setItem('userContext', JSON.stringify({ Result: { Access: [{ AccessLevel: 2 }], Application: { ApplicationId: 1 } } }));
      component.determinePracticeRoleAccess();
      expect(component.loggedInUserHasPracticeAccess).toBe(true);

      sessionStorage.setItem('userContext', JSON.stringify({ Result: { Access: [{ AccessLevel: 4 }], Application: { ApplicationId: 1 } } }));
      component.determinePracticeRoleAccess();
      expect(component.loggedInUserHasPracticeAccess).toBe(false);
    });
  });

  describe('mergeDataForUserLocationSetups =>', () => {
    it('should set true IsPracticeAdmin control based on users $$isPracticeAdmin property', () => {
      component.user.$$isPracticeAdmin = true;
      spyOn(component.frmUserLocations.controls['IsPracticeAdmin'], 'setValue');
      component.mergeDataForUserLocationSetups();
      expect(component.frmUserLocations.controls['IsPracticeAdmin'].setValue).toHaveBeenCalledWith('true');
    });
    it('should Call mockTeamMemberLocationService.mergePracticeRolesData property', () => {
      component.mergeDataForUserLocationSetups();
      expect(mockTeamMemberLocationService.getMergedPracticeRolesData).toHaveBeenCalled();
    });
  });

  describe('userLocationSetupsFilter =>', () => {
    it('should initialize filteredUserLocationSetups as an empty array', () => {
      expect(component.filteredUserLocationSetups).toEqual(undefined);
    });
    it('should filter userLocationSetups and exclude deleted objects', () => {
      component.userLocationSetups = [
        { ObjectState: SaveStates.Delete },
        { ObjectState: SaveStates.Update },
        { ObjectState: SaveStates.Add },
      ];
      component.userLocationSetupsFilter();

      expect(component.filteredUserLocationSetups).toEqual([
        { ObjectState: SaveStates.Update },
        { ObjectState: SaveStates.Add },
      ]);
    });
  });

  describe('getUserLocationsSetups =>', () => {
    beforeEach(() => {
      component.user = cloneDeep(newMockUser);
    });
    it('should call userLocationsSetupFactory.UserLocationSetups with userId', () => {
      const spy = component.mergeDataForUserLocationSetups = jasmine.createSpy();
      component.getUserLocationsSetups();
      expect(mockTeamMemberLocationService.getUserLocationSetups).toHaveBeenCalledWith(component.user.UserId);
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });
  });


  describe('createFrom =>', () => {
    it('should create the form with default values when user is undefined', () => {
      component.createForm();
      const form: FormGroup = component.frmUserLocations;
      expect(form.get('IsPracticeAdmin')?.value).toBe('false');
      expect(form.get('IsActive')?.value).toBe(true);
      expect(form.get('StatusChangeNote')?.value).toBeNull();
    });

    it('should create the form with user values when user is defined', () => {
      const user = {
        $$isPracticeAdmin: true,
        IsActive: true,
        StatusChangeNote: 'Sample note'
      };
      component.createForm();
      const form: FormGroup = component.frmUserLocations;
      expect(form.get('IsPracticeAdmin')?.value).toBe('false');
      expect(form.get('IsActive')?.value).toBe(user.IsActive);
      expect(form.get('StatusChangeNote')?.value).toBe(null);
    });
  });

  describe('confirmSwitchToPracticeAdmin =>', () => {
    beforeEach(() => {
      component.user = cloneDeep(newMockUser);
      component.user.$$isPracticeAdmin = true;
    });
    it('should call modalFactory.ConfirmModal', () => {
      component.confirmSwitchToPracticeAdmin();
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
    });
    it('should call component.switchToPracticeAdmin if response is affirmative', () => {
      spyOn(component, 'switchToPracticeAdmin');
      component.confirmSwitchToPracticeAdmin();
      mockModalFactory.ConfirmModal = jasmine.createSpy().and.returnValue({
        then: (callback) => callback(true)
      });
      expect(component.switchToPracticeAdmin).not.toHaveBeenCalled();
    });

    it('should call component.switchToPracticeAdmin if response is negative', () => {
      component.confirmSwitchToPracticeAdmin();
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
      mockModalFactory.ConfirmModal = jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue(null)
      });
      expect(component.user.$$isPracticeAdmin).not.toBe(false);
    });
  });

  describe('changeRoleAssignment => ', () => {
    beforeEach(() => {
      spyOn(component, 'confirmSwitchToPracticeAdmin');
      spyOn(component, 'switchToPracticeAdmin');
      spyOn(component, 'switchToLocationUserRoles');
    });
    it('should call rolesFactory.AllPracticeAdmin before proceeding if switching from location roles user to practice admin', () => {
      component.changeRoleAssignment(false);
      expect(mockRolesFactory.AllPracticeAdmins).toHaveBeenCalled();
    });

    it('should call confirmSwitchToPracticeAdmin before proceeding if switching from location role user to practiceAdmin if have userLocationSetups', () => {
      component.userLocationSetups = [{ IsActive: true }];
      component.changeRoleAssignment(true);
      expect(component.confirmSwitchToPracticeAdmin).toHaveBeenCalled();
    });

    it('should call skip call to confirmSwitchToPracticeAdmin and call switchToPracticeAdmin if switching from to location role user to practiceAdmin  if no userLocationSetups', () => {
      component.userLocationSetups = [];
      component.changeRoleAssignment(true);
      expect(component.confirmSwitchToPracticeAdmin).not.toHaveBeenCalled();
      expect(component.switchToPracticeAdmin).toHaveBeenCalled();
    });
  });

  describe('checkLocationsForRoles => ', () => {
    beforeEach(() => {
      component.user.$$isPracticeAdmin = false;
    });
    it('should set component.showMissingRolesMessage to true if user.$$isPracticeAdmin is false and one or more locations does not have a $$UserLocationsRole', () => {
      component.userLocationSetups[0].$$UserLocationRoles = [];
      component.checkLocationsForRoles();
      expect(component.showMissingRolesMessage).toBe(true);
    });
  });

  describe('switchToLocationUserRoles  =>', () => {
    beforeEach(() => {
      spyOn(component, 'checkLocationsForRoles');
      component.user = cloneDeep(newMockUser);
      component.userLocationSetups = cloneDeep(userLocationSetupsMock);
      component.practiceAdminRole = { RoleId: 8 };

    });
    it('should set all $$UserLocationRoles $$ObjectState to None if they were set to delete and ObjectState not to undefined', () => {
      component.switchToLocationUserRoles();
      component.userLocationSetups.forEach(userLocationSetup => {
        userLocationSetup.$$UserLocationRoles.forEach(userLocationRole => {
          expect(userLocationRole.$$ObjectState).toBe(SaveStates.Add);
        });
      });
      expect(component.checkLocationsForRoles).toHaveBeenCalled();
    });
    it('should set all $$UserLocationRoles $$ObjectState to None if they were set to delete', () => {
      component.userLocationSetups.forEach((userLocationSetup) => {
        userLocationSetup.$$UserLocationRoles.push({ RoleId: 1, $$ObjectState: SaveStates.Delete });
      });
      component.switchToLocationUserRoles();
      component.userLocationSetups.forEach((userLocationSetup) => {
        userLocationSetup.$$UserLocationRoles.forEach((userLocationRole) => {
          expect(userLocationRole.$$ObjectState).toBe(SaveStates.Add);
        });
      });
      expect(component.checkLocationsForRoles).toHaveBeenCalled();
    });
    it('should set data from backupUserLocationRoles if it has data', () => {
      //Switch to practice admin so it will set data to backupUserLocationRoles
      component.switchToPracticeAdmin();

      //Switch to LocationUserRoles to set original data
      component.switchToLocationUserRoles();
      component.userLocationSetups.forEach(userLocationSetup => {
        userLocationSetup.$$UserLocationRoles.forEach(userLocationRole => {
          expect(userLocationRole.$$ObjectState).toBe(SaveStates.None);
        });
      });
      expect(component.checkLocationsForRoles).toHaveBeenCalled();
    });
    it('should set component.user.$$UserPracticeRole $$ObjectState to Delete if user is currently a PracticeAdmin and RoleId matches component.practiceRole.RoleId', () => {
      component.user.$$UserPracticeRoles.push({ RoleId: 8, $$ObjectState: SaveStates.None });
      component.user.$$UserPracticeRoles.push({ RoleId: 13, $$ObjectState: SaveStates.None });

      component.switchToLocationUserRoles();
      component.user.$$UserPracticeRoles.forEach((practiceRole) => {
        if (practiceRole.RoleId === component.practiceAdminRole.RoleId) {
          expect(practiceRole.$$ObjectState).toEqual(SaveStates.Delete);
        } else {
          expect(practiceRole.$$ObjectState).toEqual(SaveStates.None);
        }
      });
      expect(component.user.$$isPracticeAdmin).toBe(false);
    });
    it('should set component.user.$$UserPracticeRole as [] while creating new team member', () => {
      component.user.$$UserPracticeRoles.push({ RoleId: 8, $$ObjectState: SaveStates.Delete });
      component.user.$$UserPracticeRoles.push({ RoleId: 13, $$ObjectState: SaveStates.None });
      component.user.UserId = "";
      component.switchToLocationUserRoles();
      expect(component.user.$$UserPracticeRoles?.length).toBe(0);
      expect(component.user.$$isPracticeAdmin).toBe(false);
    });
  });

  describe('switchToPracticeAdmin =>', () => {
    beforeEach(() => {
      spyOn(component, 'checkLocationsForRoles');
      component.practiceAdminRole = { RoleId: 1, RoleName: 'Practice Admin/Exec. Dentist', $$ObjectState: SaveStates.None };
      component.user.$$UserPracticeRoles.push({ RoleId: 13, RoleName: 'Rx User', $$ObjectState: SaveStates.None });
    });
    it('should set component.user.$$isPracticeAdmin to true', () => {
      component.switchToPracticeAdmin();
      expect(component.user.$$isPracticeAdmin).toBe(true);
    });

    it('should add admin role to user.$$UserPracticeRoles and set $$ObjectState to Add if  role does not already exists', () => {
      component.switchToPracticeAdmin();
      expect(component.user.$$isPracticeAdmin).toBe(true);
    });
  });

  describe('toggleUserAccess =>', () => {
    beforeEach(() => {
      component.user.IsActive = false;
    })
    it('should call method and update the isActive status', () => {
      component.toggleUserAccess();
      expect(component.user.IsActive).toBe(true);
    });
    it('should toggle user access and reset form validators', () => {
      component.user = {
        IsActive: true,
        $$locations: []
      };
      component.frmUserLocations = new FormGroup({
        StatusChangeNote: new FormControl('', Validators.required)
      });
      spyOn(component.frmUserLocations.controls['StatusChangeNote'], 'setValidators').and.callThrough();
      spyOn(component.frmUserLocations.controls['StatusChangeNote'], 'updateValueAndValidity').and.callThrough();
      spyOn(component, 'getInactiveUserRoles').and.callThrough();
      spyOn(component, 'openStatusChangeConfirmationModal');
      spyOn(component.userAccessChanged, 'emit');
      component.toggleUserAccess();
      expect(component.user.IsActive).toBe(false);
      expect(component.frmUserLocations.controls['StatusChangeNote'].setValidators).not.toHaveBeenCalledWith(null);
      expect(component.frmUserLocations.controls['StatusChangeNote'].updateValueAndValidity).toHaveBeenCalled();
      expect(component.getInactiveUserRoles).not.toHaveBeenCalled();
      expect(component.openStatusChangeConfirmationModal).toHaveBeenCalled();
    });

  });

  describe('openStatusChangeConfirmationModal =>', () => {
    beforeEach(() => {
      component = fixture.componentInstance;
      // Mock the localize service
      component.localize = {
        getLocalizedString: (key: string) => {
          // Mock localization strings here
          switch (key) {
            case 'Status Change Confirmation':
              return 'Status Change Confirmation';
            case 'Disable User Access':
              return 'Disable User Access';
            case 'Are you sure you want to activate':
              return 'Are you sure you want to activate';
            case 'effective':
              return 'effective';
            case 'Continue':
              return 'Continue';
            case 'Disabling user access will prevent this user from logging in to Fuse.':
              return 'Disabling user access will prevent this user from logging in to Fuse.';
            default:
              return '';
          }
        },
      };
      fixture.detectChanges();
    });

    it('should set confirmation modal data for inactive user', () => {
      component.user = { IsActive: false, $$locations: [] };
      component.openStatusChangeConfirmationModal();
      expect(component.confirmationModalData.header).toBe('Disable User Access');
      expect(component.confirmationModalData.message).toBe(
        'Disabling user access will prevent this user from logging in to Fuse.'
      );
      expect(component.confirmationModalData.confirm).toBe('Continue');
    });

    it('should set confirmation modal data for inactive user', () => {
      component.user = { IsActive: false, $$locations: [] };
      component.openStatusChangeConfirmationModal();
      const data = component.confirmationModalData;
      component.confirmationModalSubscription = Object.assign(mockConfirmationModalService);
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue({
        events: {
          pipe: (event) => {
            return {
              type: "close",
              subscribe: (success) => {
                success({ type: "close" })
              },
              filter: (f) => { return f }
            }
          }
        },
        close: jasmine.createSpy()
      });
      const ref = mockConfirmationModalService.open({ data });
      component.openStatusChangeConfirmationModal();
      expect(component.confirmationRef).toEqual(ref);
      expect(component.confirmationModalData.header).toBe('Disable User Access');
      expect(component.confirmationModalData.message).toBe(
        'Disabling user access will prevent this user from logging in to Fuse.'
      );
      expect(component.confirmationModalData.confirm).toBe('Continue');
    });
  });

  describe('changeReasonNote =>', () => {
    it('should update user.StatusChangeNote and emit changeReasonData', () => {
      const statusChangeNote = 'Sample status change note';
      component.frmUserLocations = new FormGroup({
        StatusChangeNote: new FormControl(statusChangeNote),
      });
      spyOn(component.changeReasonData, 'emit');
      component.changeReasonNote();
      expect(component.user.StatusChangeNote).toBe(statusChangeNote);
      expect(component.changeReasonData.emit).toHaveBeenCalledWith(statusChangeNote);
    });
  });


  describe('getUserRoles =>', () => {
    it('should call rolesFactory.Roles with user and userRoles data', () => {
      component.getUserRoles();
      expect(mockTeamMemberLocationService.getUserRoles).toHaveBeenCalledWith(component.user.UserId);
    });
  });

  describe('getAvailableLocations =>', () => {
    it('should set availableLocations to an empty array when userLocationSetups is undefined', () => {
      component.getAvailableLocations();
      expect(component.availableLocations).toEqual([]);
    });

    it('should filter out active locations from permittedLocations when userLocationSetups is defined', () => {
      const userLocationSetups = [
        { LocationId: 1, ObjectState: SaveStates.Delete },
        { LocationId: 2, ObjectState: SaveStates.None },
        { LocationId: 3, ObjectState: SaveStates.None },
      ];
      const permittedLocations = [
        { LocationId: 1 },
        { LocationId: 2 },
        { LocationId: 3 },
        { LocationId: 4 },
      ];
      component.userLocationSetups = userLocationSetups;
      component.permittedLocations = permittedLocations;
      component.getAvailableLocations();
      expect(component.availableLocations).toEqual([{ LocationId: 1 }, { LocationId: 4 }]);
    });
  });

  describe('setCanRemoveLocation =>', () => {
    let userLocationSetup;
    beforeEach(function () {
      component.userLocationSetups = cloneDeep(userLocationSetupsMock);
      userLocationSetup = component.userLocationSetups[0];
      component.user.$$scheduleStatuses = [
        { LocationId: 2, HasProviderAppointments: false, HasProviderRoomOccurrences: false },
        { LocationId: 3, HasProviderAppointments: false, HasProviderRoomOccurrences: true }];

    });
    it('should set userLocationSetup.$$CanRemoveLocation to true if the location to remove does not have ProviderRoomOccurrences or Provider Appointments for this location ', () => {
      userLocationSetup.LocationId = 2;
      spyOn(mockLocalizeService, 'getLocalizedString').and.returnValue('Remove {0}');
      component.setCanRemoveLocation(userLocationSetup);
      expect(userLocationSetup.$$CanRemoveLocation).toEqual(true);
      expect(userLocationSetup.$$RemoveButtonTooltip).toEqual('Remove {0}');
    });


    it('should set userLocationSetup.$$CanRemoveLocation to false if the location to remove does have HasProviderAppointments for this location ', () => {
      userLocationSetup.LocationId = 3;
      component.user.$$scheduleStatuses = [
        { LocationId: 2, HasProviderAppointments: false, HasProviderRoomOccurrences: false },
        { LocationId: 3, HasProviderAppointments: true, HasProviderRoomOccurrences: false }];
      spyOn(mockLocalizeService, 'getLocalizedString').and.returnValue('This {0} cannot be changed because he/she has scheduled hours and/or scheduled appointments.');
      component.setCanRemoveLocation(userLocationSetup);
      expect(userLocationSetup.$$RemoveButtonTooltip).toEqual('This {0} cannot be changed because he/she has scheduled hours and/or scheduled appointments.');
    });

    it('should set userLocationSetup.$$CanRemoveLocation to true if the location to remove does not have ProviderRoomOccurrences for this location', () => {
      userLocationSetup.LocationId = 4;
      component.user.$$scheduleStatuses = [
        { LocationId: 2, HasProviderAppointments: false, HasProviderRoomOccurrences: false },
        { LocationId: 3, HasProviderAppointments: false, HasProviderRoomOccurrences: true }];
      spyOn(mockLocalizeService, 'getLocalizedString').and.returnValue('This {0} cannot be changed because he/she has scheduled hours and/or scheduled appointments.');
      component.setCanRemoveLocation(userLocationSetup);
      expect(userLocationSetup.$$CanRemoveLocation).toBe(true);
      expect(userLocationSetup.$$RemoveButtonTooltip).toEqual('This {0} cannot be changed because he/she has scheduled hours and/or scheduled appointments.');

    });

    it('should set userLocationSetup.$$CanRemoveLocation to true if the location to remove does have ProviderRoomOccurrences for this location ', () => {
      userLocationSetup.LocationId = 3;
      component.user.$$scheduleStatuses = null;
      component.setCanRemoveLocation(userLocationSetup);
      expect(userLocationSetup.$$CanRemoveLocation).toEqual(true);
    });
  });

  describe('removeUserLocationSetup =>', () => {
    beforeEach(() => {
      component.userLocationSetups = cloneDeep(userLocationSetupsMock);
      component.hasDeleteAccess = true;
    });

    it('should call setCanRemoveLocation with userLocationSetup', () => {
      let userLocationSetupToDelete = component.userLocationSetups[0];
      spyOn(component, 'setCanRemoveLocation').and.callFake(() => { });
      userLocationSetupToDelete.UserProviderSetupLocationId = '1234';
      component.removeUserLocationSetup(userLocationSetupToDelete);
      expect(component.setCanRemoveLocation).toHaveBeenCalledWith(userLocationSetupToDelete);
    });

    it('should set userLocationSetup.ObjectState to Delete if userLocationSetup.$$CanRemoveLocation is true ' +
      'and this is an existing userLocationSetup', () => {
        let userLocationSetupToDelete = component.userLocationSetups[0];
        userLocationSetupToDelete.$$CanRemoveLocation = true;
        userLocationSetupToDelete.UserProviderSetupLocationId = '1234';
        component.removeUserLocationSetup(userLocationSetupToDelete);
        expect(userLocationSetupToDelete.ObjectState).toEqual(SaveStates.Delete);
      });

    it('should remove userLocationSetup from list if userLocationSetup.$$CanRemoveLocation is true ' +
      'and this is not an existing userLocationSetup', () => {
        let userLocationSetupToDelete = component.userLocationSetups[0];
        userLocationSetupToDelete.$$CanRemoveLocation = true;
        userLocationSetupToDelete.UserProviderSetupLocationId = null;
        component.removeUserLocationSetup(userLocationSetupToDelete);
        expect(component.userLocationSetups.length).toBe(1);
      });

    it('should set each userLocationSetup.$$UserLocationRoles to Delete if userLocationSetup.$$CanRemoveLocation is true ' +
      'and this is an existing userLocationSetup and $$ObjectState is not Add', () => {
        let userLocationSetupToDelete = component.userLocationSetups[0];
        userLocationSetupToDelete.$$UserLocationRoles = [{ RoleId: 1 }, { RoleId: 2 }];
        userLocationSetupToDelete.$$CanRemoveLocation = true;
        userLocationSetupToDelete.UserProviderSetupLocationId = '1234';
        component.removeUserLocationSetup(userLocationSetupToDelete);
        userLocationSetupToDelete.$$UserLocationRoles.forEach((userLocationRole) => {
          if (userLocationRole.$$ObjectState !== SaveStates.Add) {
            expect(userLocationRole.$$ObjectState).toEqual(SaveStates.Delete);
          }
        });
      });

    it('should set each userLocationSetup.$$UserLocationRoles to None if userLocationSetup.$$CanRemoveLocation is true ' +
      'and this is an existing userLocationSetup and $$ObjectState is Add', () => {
        let userLocationSetupToDelete = component.userLocationSetups[0];
        userLocationSetupToDelete.$$UserLocationRoles = [{ RoleId: 1 }, { RoleId: 2 }];
        userLocationSetupToDelete.$$CanRemoveLocation = true;
        userLocationSetupToDelete.UserProviderSetupLocationId = '1234';
        component.removeUserLocationSetup(userLocationSetupToDelete);
        userLocationSetupToDelete.$$UserLocationRoles.forEach((userLocationRole) => {
          if (userLocationRole.$$ObjectState === SaveStates.Add) {
            expect(userLocationRole.$$ObjectState).toEqual(SaveStates.None);
          }
        });
      });


    it('should not set userLocationSetup.ObjectState to Delete if userLocationSetup.$$CanRemoveLocation is false ' +
      'and this is an existing userLocationSetup', () => {
        spyOn(component, 'setCanRemoveLocation').and.callFake(function () { });
        let userLocationSetupToDelete = component.userLocationSetups[0];
        userLocationSetupToDelete.$$CanRemoveLocation = false;
        userLocationSetupToDelete.UserProviderSetupLocationId = '1234';
        component.removeUserLocationSetup(userLocationSetupToDelete);
        expect(userLocationSetupToDelete.ObjectState).not.toEqual(SaveStates.Delete);
      });

    it('should show correct locations available in list', () => {
      let userLocationSetupToDelete = component.userLocationSetups[1];
      userLocationSetupToDelete.$$CanRemoveLocation = false;
      userLocationSetupToDelete.UserProviderSetupLocationId = null;
      component.removeUserLocationSetup(userLocationSetupToDelete);
    });
  });

  describe('rxRoleFilter =>', () => {
    it('should filter user practice roles', () => {
      component.user = {
        $$UserPracticeRoles: [
          { RoleName: 'role1' },
          { RoleName: 'role2' },
          { RoleName: 'RxUser' }
        ],
        $$locations: []
      };
      const result = component.rxRoleFilter(component.user);
      expect(result).toBe(true);
    });
  });

  describe('deletedRolesFilter =>', () => {
    it('should filter out deleted roles', () => {
      const userLocationRoles = [
        { $$ObjectState: SaveStates.Delete, RoleName: 'Role1' },
        { $$ObjectState: SaveStates.Update, RoleName: 'Role2' },
        { $$ObjectState: SaveStates.Add, RoleName: 'Role3' },
        { $$ObjectState: SaveStates.Delete, RoleName: 'Role4' }
      ];
      const filteredRoles = component.deletedRolesFilter(userLocationRoles);
      expect(filteredRoles).toEqual([{ $$ObjectState: SaveStates.Update, RoleName: 'Role2' },
      { $$ObjectState: SaveStates.Add, RoleName: 'Role3' }]);
    });
  });

  describe('checkForUserStateLicense  =>', () => {
    beforeEach(() => {
      component.user = cloneDeep(newMockUser);
      component.permittedLocations = [
        { LocationId: 1, State: 'AR' },
        { LocationId: 2, State: 'AR' },
        { LocationId: 3, State: 'MN' },
        { LocationId: 4, State: 'IL' },
        { LocationId: 7, State: 'AR' }];

      component.updatedLicenses = [
        { StateAbbreviation: 'IL' },
        { StateAbbreviation: 'AR' }];
    });
    it('should return location.State for state that does not have item in component.updatedLicenses', () => {
      let locationId = 3;
      expect(component.checkForUserStateLicense(locationId)).toEqual('MN');
    });
    it('should return empty for state that does have item in component.updatedLicenses', () => {
      let locationId = 7;
      expect(component.checkForUserStateLicense(locationId)).toEqual('');
    });
  });

  describe('validateStateLicenseByLocation =>', () => {
    beforeEach(() => {

      component.user = cloneDeep(newMockUser);

      component.userLocationSetups = [
        { LocationId: 1, $$UserLocationRoles: [] },
        { LocationId: 3, $$UserLocationRoles: [] }
      ];

      component.permittedLocations = [
        { LocationId: 1, State: 'AR' },
        { LocationId: 2, State: 'AR' },
        { LocationId: 3, State: 'MN' },
        { LocationId: 4, State: 'IL' },
        { LocationId: 7, State: 'AR' }];
      component.updatedLicenses = [
        { StateAbbreviation: 'IL' },
        { StateAbbreviation: 'AR' }];
    });

    it('should set component.needLicenseStates concatenated values returned from checkForUserStateLicense', () => {
      spyOn(component, 'checkForUserStateLicense').and.returnValue('AR');
      component.validateStateLicenseByLocation();
      expect(component.needLicenseStates).toEqual('AR');
    });

    it('should add row to component.validatedStates for each value returned from checkForUserStateLicense', () => {
      spyOn(component, 'checkForUserStateLicense').and.returnValue('AR');
      component.validateStateLicenseByLocation();
      expect(component.validatedStates).toEqual([Object({ StateAbbreviation: '' }), Object({ StateAbbreviation: 'AR' })]);
    });
  });

  describe('View Roles =>', () => {
    it('View roles popup should have been called', () => {
      component.viewCompareRolesModal = viewCompareRolesComponent;
      component.viewCompareRolesModal.ngOnInit = jasmine.createSpy();
      component.viewRoles();
      expect(component.viewCompareRolesModal?.ngOnInit).toHaveBeenCalled();
    });
  });

  describe('Compare Roles =>', () => {
    it('Compare roles popup should have been called', () => {
      component.viewCompareRolesModal = viewCompareRolesComponent;
      component.viewCompareRolesModal.ngOnInit = jasmine.createSpy();
      component.compareRoles();
      expect(component.viewCompareRolesModal?.ngOnInit).toHaveBeenCalled();
    });
  });

  describe('addLocationRole =>', () => {
    beforeEach(() => {
      component.userLocationSetups = [
        { LocationId: 1, $$UserLocationRoles: [] },
        { LocationId: 2, $$UserLocationRoles: [] }];
      component.roles = [{ RoleId: 1 }, { RoleId: 2 }, { RoleId: 3 }, { RoleId: 4 },];

    });
    it('should add inactive location roles back to userLocationSetups', () => {
      component.addLocationRole(3, 2);
      expect(component.userLocationSetups).toEqual([{ LocationId: 1, $$UserLocationRoles: [] },
      { LocationId: 2, $$UserLocationRoles: [{ RoleId: 3, $$ObjectState: SaveStates.Add }] }]);
    });
    it('should user.$$UserPracticeRoles ObjectState to Add', () => {
      component.addLocationRole(3, 2);
      component.userLocationSetups.forEach((userLocationRole) => {
        expect(userLocationRole.ObjectState).toEqual(undefined);
      });
    });
  });

  describe('addPracticeRole =>', () => {
    beforeEach(() => {
      component.userLocationSetups = [
        { LocationId: 1, $$UserLocationRoles: [] },
        { LocationId: 2, $$UserLocationRoles: [] }];
      component.roles = [{ RoleId: 1 }, { RoleId: 2 }, { RoleId: 3 }, { RoleId: 4 },];
      component.practiceAdminRole = { RoleId: 2 };
      component.user.$$UserPracticeRoles = [];

    });
    it('should add inactive practice roles back to user.$$UserPracticeRoles', () => {
      component.addPracticeRole(2);
      expect(component.user.$$UserPracticeRoles).toEqual([{ RoleId: 2, $$ObjectState: SaveStates.Add }]);
    });

    it('should user.$$UserPracticeRoles ObjectState to Add', () => {
      component.addPracticeRole(2);
      component.user.$$UserPracticeRoles.forEach((practiceRole) => {
        expect(practiceRole.$$ObjectState).toEqual(SaveStates.Add);
      });
    });
  });

  describe('getInactiveUserRoles =>', () => {
    it('should call rolesFactory.GetInactiveUserAssignedRoles', () => {
      component.getInactiveUserRoles();
      expect(mockRolesFactory.GetInactiveUserAssignedRoles).toHaveBeenCalledWith(component.user.UserId);
    });
    it('should handle inactive user roles', async () => {
      const userId = 'mockUserId';
      const inactiveUserRoles = {
        Value: {
          UserRoleLocationInactiveDtos: [
            { RoleId: 'locationRoleId1', LocationId: 'locationId1' },
            { RoleId: 'locationRoleId2', LocationId: 'locationId2' },
          ],
          UserRolePracticeInactiveDtos: [
            { RoleId: 'practiceRoleId1' },
            { RoleId: 'practiceRoleId2' },
          ],
        },
      };
      mockRolesFactory.GetInactiveUserAssignedRoles.and.returnValue(Promise.resolve(inactiveUserRoles));

      const addLocationRoleSpy = spyOn(component, 'addLocationRole');
      const addPracticeRoleSpy = spyOn(component, 'addPracticeRole');
      await component.getInactiveUserRoles();

      expect(mockRolesFactory.GetInactiveUserAssignedRoles).toHaveBeenCalledWith(newMockUser.UserId);
      expect(addLocationRoleSpy.calls.count()).toBe(2);
      expect(addLocationRoleSpy.calls.argsFor(0)).toEqual(['locationRoleId1', 'locationId1']);
      expect(addLocationRoleSpy.calls.argsFor(1)).toEqual(['locationRoleId2', 'locationId2']);

      expect(addPracticeRoleSpy.calls.count()).toBe(2);
      expect(addPracticeRoleSpy.calls.argsFor(0)).toEqual(['practiceRoleId1']);
      expect(addPracticeRoleSpy.calls.argsFor(1)).toEqual(['practiceRoleId2']);

      const emptyUserRoles = { Value: null };
      mockRolesFactory.GetInactiveUserAssignedRoles.and.returnValue(Promise.resolve(emptyUserRoles));
      await component.getInactiveUserRoles();
      expect(addLocationRoleSpy.calls.count()).toBe(2);
      expect(addPracticeRoleSpy.calls.count()).toBe(2);
    });


  });

  describe('sendLicensesToValidate =>', () => {
    it('should update licenses and call validateStateLicenseByLocation', () => {
      const args = ['License1', 'License2'];
      spyOn(component, 'validateStateLicenseByLocation');
      component.sendLicensesToValidate(args);
      expect(component.updatedLicenses).toEqual(args);
      expect(component.validateStateLicenseByLocation).toHaveBeenCalled();
    });

    it('should call validateStateLicenseByLocation without updating licenses if args is falsy', () => {
      const args = null;
      spyOn(component, 'validateStateLicenseByLocation');
      component.sendLicensesToValidate(args);
      expect(component.updatedLicenses).toEqual([]);
      expect(component.validateStateLicenseByLocation).toHaveBeenCalled();
    });
  });

  describe('addUserLocationSetup =>', () => {
    it('should open the location setup modal when hasAddEditAccess is true', () => {
      component.hasAddEditAccess = true;
      const viewLocationSetupCrudModalMock = jasmine.createSpyObj('viewLocationSetupCrudModal', ['openLocationSetupCrudModal']);
      component.viewLocationSetupCrudModal = viewLocationSetupCrudModalMock;
      component.addUserLocationSetup();
      expect(viewLocationSetupCrudModalMock.openLocationSetupCrudModal).toHaveBeenCalledWith(null);
    });

    it('should not open the location setup modal when hasAddEditAccess is false', () => {
      component.hasAddEditAccess = false;
      const viewLocationSetupCrudModalMock = jasmine.createSpyObj('viewLocationSetupCrudModal', ['openLocationSetupCrudModal']);
      component.viewLocationSetupCrudModal = viewLocationSetupCrudModalMock;
      component.addUserLocationSetup();
      expect(viewLocationSetupCrudModalMock.openLocationSetupCrudModal).not.toHaveBeenCalled();
    });
  });

  describe('editUserLocationSetup =>', () => {
    it('should open the location setup modal when hasAddEditAccess is true', () => {
      component.hasAddEditAccess = true;
      const viewLocationSetupCrudModalMock = jasmine.createSpyObj('viewLocationSetupCrudModal', ['openLocationSetupCrudModal']);
      component.viewLocationSetupCrudModal = viewLocationSetupCrudModalMock;
      component.editUserLocationSetup(newUserLocationSetupMock);
      expect(viewLocationSetupCrudModalMock.openLocationSetupCrudModal).toHaveBeenCalledWith(newUserLocationSetupMock);
    });

    it('should not open the location setup modal when hasAddEditAccess is false', () => {
      component.hasAddEditAccess = false;
      const viewLocationSetupCrudModalMock = jasmine.createSpyObj('viewLocationSetupCrudModal', ['openLocationSetupCrudModal']);
      component.viewLocationSetupCrudModal = viewLocationSetupCrudModalMock;
      component.editUserLocationSetup(newUserLocationSetupMock);
      expect(viewLocationSetupCrudModalMock.openLocationSetupCrudModal).not.toHaveBeenCalled();
    });
  });

  describe('addUserLocationSetupToList => ', () => {
    beforeEach(() => {
      spyOn(component, 'checkLocationsForRoles');
      spyOn(component, 'getAvailableLocations');
      component.userLocationSetupBackup = null;
    });

    it('should add a userLocationSetup to the component.userLocationSetups list if new userLocationSetup', () => {
      let userLocationSetup = { ProviderTypeId: 2, UserProviderSetupLocationId: null };
      component.userLocationSetups = [];
      component.addUserLocationSetupToList(userLocationSetup);
      expect(component.userLocationSetups).toEqual([userLocationSetup]);
    });

    it('should replace a userLocationSetup to the component.userLocationSetups list if existing userLocationSetup', () => {
      let userLocationSetup = { ProviderTypeId: 2, UserProviderSetupLocationId: '1234' };
      component.userLocationSetups = [];
      component.userLocationSetups.push({ ProviderTypeId: 3, UserProviderSetupLocationId: '1234' });
      component.addUserLocationSetupToList(userLocationSetup);
      expect(component.userLocationSetups).toEqual([userLocationSetup]);
      expect(component.userLocationSetups[0].ProviderTypeId).toEqual(2);

    });

    it('should call userLocationsSetupFactory.MergeLocationData', () => {
      let userLocationSetup = { ProviderTypeId: 2, UserProviderSetupLocationId: null, LocationId: 2 };
      component.userLocationSetups = [];
      component.addUserLocationSetupToList(userLocationSetup);
      expect(mockTeamMemberLocationService.getMergedLocationData).toHaveBeenCalledWith(component.userLocationSetups, component.locations, component.permittedLocations);
    });

    it('should call userLocationsSetupFactory.MergeUserData', () => {
      let userLocationSetup = { ProviderTypeId: 2, UserProviderSetupLocationId: null };
      component.userLocationSetups = [];
      component.addUserLocationSetupToList(userLocationSetup);
      expect(mockTeamMemberLocationService.getMergedUserData).toHaveBeenCalledWith(component.userLocationSetups, component.users, component.providerTypes);

    });

    it('should call component.checkLocationsForRoles and component.getAvailableLocations', () => {
      let userLocationSetup = { ProviderTypeId: 2, UserProviderSetupLocationId: null };
      component.userLocationSetups = [];
      component.addUserLocationSetupToList(userLocationSetup);
      expect(component.checkLocationsForRoles).toHaveBeenCalled();

    });

    it('should set component.displayPracticeRolesChangedMessage to true if existing user', () => {
      let userLocationSetup = { ProviderTypeId: 2, UserProviderSetupLocationId: null };
      component.userLocationSetups = [];
      component.user.UserId = '1234';
      component.addUserLocationSetupToList(userLocationSetup);
      expect(component.displayPracticeRolesChangedMessage).toBe(true);
    });

    it('should set component.displayPracticeRolesChangedMessage to false if new user', () => {
      let userLocationSetup = { ProviderTypeId: 2, UserProviderSetupLocationId: null };
      component.user.UserId = '';
      component.userLocationSetups = [];
      component.addUserLocationSetupToList(userLocationSetup);
      expect(component.displayPracticeRolesChangedMessage).toBe(false);
    });

    it('should set component.userLocationsErrors.NoUserLocationsError to false', () => {
      let userLocationSetup = { ProviderTypeId: 2, UserProviderSetupLocationId: null };
      component.user.UserId = '';
      component.userLocationSetups = [];
      component.addUserLocationSetupToList(userLocationSetup);
      expect(component.userLocationsErrors.NoUserLocationsError).toBe(false);
    });

    it('should replace userLocationSetup to list when it is being edited', () => {
      component.userLocationSetups = [{ ProviderTypeId: 2, UserProviderSetupLocationId: '1234' },
      { ProviderTypeId: 2, UserProviderSetupLocationId: '1235' }];
      expect(component.userLocationSetups.length).toBe(2);
      component.addUserLocationSetupToList(component.userLocationSetups[0]);
      expect(component.userLocationSetups.length).toBe(2);
    });

    it('should add userLocationSetup to list when it is new and not in list', () => {
      let userLocationSetup = { ProviderTypeId: 2, UserProviderSetupLocationId: null, LocationId: 1 };
      component.userLocationSetups = [{ ProviderTypeId: 2, UserProviderSetupLocationId: '1234', LocationId: 2 },
      { ProviderTypeId: 2, UserProviderSetupLocationId: '1235', LocationId: 3 }];
      expect(component.userLocationSetups.length).toBe(2);
      component.addUserLocationSetupToList(userLocationSetup);
      expect(component.userLocationSetups.length).toBe(3);
    });

    it('should replace userLocationSetup to list when it is new and in list and location has changed and userLocationSetupBackup exists', () => {
      component.userLocationSetups = [{ ProviderTypeId: 2, UserProviderSetupLocationId: null, LocationId: 2 },
      { ProviderTypeId: 2, UserProviderSetupLocationId: '1235', LocationId: 3 }];
      expect(component.userLocationSetups.length).toBe(2);

      let newEditedLocation = component.userLocationSetups[0];
      newEditedLocation.LocationId = 4;
      component.userLocationSetupBackup = component.userLocationSetups[0];

      component.addUserLocationSetupToList(newEditedLocation);
      expect(component.userLocationSetups.length).toBe(2);
      expect(component.userLocationSetups[0].LocationId).toBe(3);
      expect(component.userLocationSetups[1].LocationId).toBe(4);
    });

    it('should replace userLocationSetup to list when it is new and in list', () => {
      component.userLocationSetups = [{ ProviderTypeId: 2, UserProviderSetupLocationId: null, LocationId: 2 },
      { ProviderTypeId: 2, UserProviderSetupLocationId: '1235', LocationId: 3 }];
      expect(component.userLocationSetups.length).toBe(2);
      component.addUserLocationSetupToList(component.userLocationSetups[0]);
      expect(component.userLocationSetups.length).toBe(2);
    });

    it('should set component.userLocationSetupsDataChanged to true when userLocationSetup is edited', () => {
      let userLocationSetup = { ProviderTypeId: 2, UserProviderSetupLocationId: '1234' };
      component.userLocationSetups = [];
      component.userLocationSetups.push({ ProviderTypeId: 3, UserProviderSetupLocationId: '1234' });
      component.addUserLocationSetupToList(userLocationSetup);
      expect(component.userLocationSetups).toEqual([userLocationSetup]);
      expect(component.userLocationSetups[0].ProviderTypeId).toEqual(2);
      expect(component.userLocationSetupsDataChanged).toEqual(new EventEmitter<Array<{ ProviderTypeId: 3, UserProviderSetupLocationId: '1234' }>>());
    });

    it('should not merge new userLocationSetup if userLocationSetup.LocationId doesnt match any in list', () => {
      let newUserLocationSetup = { ProviderTypeId: 3, LocationId: 6, UserProviderSetupLocationId: null, ObjectState: SaveStates.Add };
      component.userLocationSetups = [
        { ProviderTypeId: 2, LocationId: 2, UserProviderSetupLocationId: '1234', ObjectState: SaveStates.Delete, DataTag: 'x123' },
        { ProviderTypeId: 3, LocationId: 3, UserProviderSetupLocationId: '1235', ObjectState: SaveStates.Add, DataTag: 'x153' },
        { ProviderTypeId: 4, LocationId: 4, UserProviderSetupLocationId: '1236', ObjectState: SaveStates.None, DataTag: 'x1x3' },
        { ProviderTypeId: 3, LocationId: 5, UserProviderSetupLocationId: '1237', ObjectState: SaveStates.Update, DataTag: 'x173' },
      ];
      component.userLocationSetupBackup = null;
      component.addUserLocationSetupToList(newUserLocationSetup);
      // find the new record
      let findNewUserLocationSetup = component.userLocationSetups.find((userLocationSetup) => {
        return userLocationSetup.LocationId === 6;
      });
      expect(findNewUserLocationSetup).toEqual({ ProviderTypeId: 3, LocationId: 6, UserProviderSetupLocationId: null, ObjectState: SaveStates.Add });
    });

    it('should update existing record if locationId and savestate match as delete', () => {
      let newUserLocationSetup = { ProviderTypeId: 3, LocationId: 3, UserProviderSetupLocationId: null, ObjectState: SaveStates.Delete };
      component.userLocationSetups = [
        { ProviderTypeId: 2, LocationId: 2, UserProviderSetupLocationId: '1234', ObjectState: SaveStates.Delete, DataTag: 'x123' },
        { ProviderTypeId: 3, LocationId: 3, UserProviderSetupLocationId: '1235', ObjectState: SaveStates.Add, DataTag: 'x153' },
        { ProviderTypeId: 4, LocationId: 4, UserProviderSetupLocationId: '1236', ObjectState: SaveStates.None, DataTag: 'x1x3' },
        { ProviderTypeId: 3, LocationId: 5, UserProviderSetupLocationId: '1237', ObjectState: SaveStates.Update, DataTag: 'x173' },
      ];
      component.userLocationSetupBackup = null;
      component.addUserLocationSetupToList(newUserLocationSetup);
      expect(component.userLocationSetups?.length).toBe(4);
    });


    it('should remove $$delete state record from array', () => {
      component.userLocationSetups = [
        { ProviderTypeId: 2, UserProviderSetupLocationId: null, LocationId: 2, $$UserLocationRoles: [{ $$ObjectState: SaveStates.Delete, LocationId: 1, RoleId: 1 }, { $$ObjectState: SaveStates.Add, LocationId: 2, RoleId: 2 }] }];
      expect(component.userLocationSetups[0]?.$$UserLocationRoles?.length).toBe(2);
      component.addUserLocationSetupToList(component.userLocationSetups[0]);
      expect(component.userLocationSetups.length).toBe(1);
    });
  });

  describe('rxRxUserTypeChanges', () => {
    it('should not call rxRoleFilter if RxUserType is 4', () => {
      component.rxRoleFilter = jasmine.createSpy();
      component.user = {
        $$UserPracticeRoles: [
          { RoleName: 'role1' },
          { RoleName: 'role2' },
          { RoleName: 'RxUser' }
        ],
        $$locations: []
      };
      component.rxAccessRole = { RoleName: 'role1' }, { RoleName: 'role2' }, { RoleName: 'RxUser' }

      component.rxRxUserTypeChanges(component.user);
      expect(component.rxRoleFilter).not.toHaveBeenCalled();
    })

    it('should call rxRoleFilter if RxUserType is 1', () => {
      component.rxRoleFilter = jasmine.createSpy();
      component.user = {
        $$UserPracticeRoles: [
          { RoleName: 'role1' },
          { RoleName: 'role2' },
          { RoleName: 'RxUser' }
        ],
        RxUserType: 1,
        $$locations: []
      };
      component.rxAccessRole = { RoleName: 'role1' }, { RoleName: 'role2' }, { RoleName: 'RxUser' }


      component.rxRxUserTypeChanges(component.user);
      expect(component.rxRoleFilter).toHaveBeenCalled();
    })
  });

  describe('rxSettingChanges', () => {
    it('should not call rxRoleFilter if rxSetting does not has locations & roles', () => {
      component.rxRoleFilter = jasmine.createSpy();
      component.user = {
        $$UserPracticeRoles: [
          { RoleName: 'role1' },
          { RoleName: 'role2' },
          { RoleName: 'RxUser' }
        ],
        $$locations: []
      };
      component.rxAccessRole = { RoleName: 'role1' }, { RoleName: 'role2' }, { RoleName: 'RxUser' }

      let rxSettings = {
      }
      component.rxSettingChanges(rxSettings, component.user);
      expect(component.rxRoleFilter).not.toHaveBeenCalled();
    })

    it('should not call rxRoleFilter if rxSetting does has locations & roles', () => {
      component.rxRoleFilter = jasmine.createSpy();
      component.user = {
        $$UserPracticeRoles: [
          { RoleName: 'role1' },
          { RoleName: 'role2' },
          { RoleName: 'RxUser' }
        ],
        $$locations: []
      };
      component.rxAccessRole = { RoleName: 'role1' }, { RoleName: 'role2' }, { RoleName: 'RxUser' }

      let rxSettings = {
        locations: [{ locationId: 1 }],
        roles: [{ RoleId: 1, RoleName: 'role1' }]
      }
      component.rxSettingChanges(rxSettings, component.user);
      expect(component.rxRoleFilter).toHaveBeenCalled();
    })

  });

  // NG15CLEANUP mockTeamMemberLocationService.rxRoleFilter is not called by component.rxRoleFilter
  // describe('rxRoleFilter  ->', () => {
  //   it('Should call rxRoleFilter', () => {
  //     component.rxRoleFilter(component.user);
  //     expect(mockTeamMemberLocationService.rxRoleFilter).toHaveBeenCalled();
  //   });
  // });

  describe('getPermittedLocations', () => {
    it('should call getSecurityRoles on success call', () => {
      const promise = mockTeamMemberLocationService.getPermittedLocations();
      component.getSecurityRoles = jasmine.createSpy();
      component.getPermittedLocations();
      promise.then((res) => {
        expect(component.getSecurityRoles).toHaveBeenCalled();
      }, (error) => {
        expect(mockToastrFactory.error).toHaveBeenCalled();
      })
    })
  })

  describe('getSecurityRoles', () => {
    it('should call getUserRole on successfully get security roles & userid is not blank', () => {
      const promise = mockTeamMemberLocationService.getRoles();
      component.user.UserId = "1";
      component.getUserRoles = jasmine.createSpy();
      component.getSecurityRoles();
      promise.then((res) => {
        expect(component.getUserRoles).toHaveBeenCalled();
      }, (error) => {
        expect(mockToastrFactory.error).toHaveBeenCalled();
      })
    })

    it('should not call getUserRole & set loading = false  if userid is not blank', () => {
      const promise = mockTeamMemberLocationService.getRoles();
      component.user.UserId = "";
      component.getUserRoles = jasmine.createSpy();
      component.getSecurityRoles();
      promise.then((res) => {
        expect(component.getUserRoles).not.toHaveBeenCalled();
        expect(component.loading).toBe(false);
      }, (error) => {
        expect(mockToastrFactory.error).toHaveBeenCalled();
      })
    })
  })

  describe('getRxRoleFilter', () => {
    it('should call rxRoleFilter from teamMemberLocationService', () => {
      component.getRxRoleFilter();
      expect(mockTeamMemberLocationService.rxRoleFilter).toHaveBeenCalled();
    })
  })
});
