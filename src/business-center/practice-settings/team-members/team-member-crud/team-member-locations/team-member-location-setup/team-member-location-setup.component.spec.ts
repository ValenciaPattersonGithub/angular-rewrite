import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogContainerService, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { ReplaySubject, of } from 'rxjs';
import { TeamMemberLocationSetupComponent } from './team-member-location-setup.component';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { SoarSelectListComponent } from 'src/@shared/components/soar-select-list/soar-select-list.component';
import { User, UserLocationRoles, UserLocationSetup } from '../../../team-member';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { TeamMemberLocationService } from '../team-member-location.service';
import { OrderByPipe } from 'src/@shared/pipes/order-by/order-by.pipe';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ApplicationBillingInfoService } from '../../../../../../@core/http-services/application-billing-info.service';
import { FeatureFlagService } from '../../../../../../featureflag/featureflag.service';
import { fakeAsync, tick } from '@angular/core/testing';

let dialogservice: DialogService;

let mockDialogRef;
let mockRoles;
let mockUserServices;
let mockLocalizeService;
let mockToastrFactory;
let mockReferenceDataService;
let mockuserLocationRoles: Array<UserLocationRoles>;
let allLocations;
let mockTeamMemberLocationService;
let mockConfirmationModalService;
let mockUser: User;
let mockUserLocationSetup: UserLocationSetup;
let mockUserLocationSetupWithOutSelf: UserLocationSetup;
let mockLocation;
let mockApplicationBillingInfoService;
let mockFeatureFlagService;
let modalEvents: ReplaySubject<any>;
describe('TeamMemberLocationSetupComponent', () => {
    let component: TeamMemberLocationSetupComponent;
    let fixture: ComponentFixture<TeamMemberLocationSetupComponent>;

    beforeEach(async () => {
        mockDialogRef = {
            close: () => of({}),
            open: () => { },
            content: {
                instance: {
                    title: ''
                }
            }
        }

        mockRoles = [
            { RoleName: 'Assistant', Order: 1 },
            { RoleName: 'Associate Dentist', Order: 2 },
            { RoleName: 'low', Order: 3 },
            { RoleName: 'medium', Order: 4 },
            { RoleName: 'high', Order: 5 }];

        mockUserServices = {
            Users: {
                update: jasmine.createSpy().and.returnValue({ Value: { UserId: '1234' } }),
                save: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } })
            },
            UserScheduleLocation: {
                get: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
                update: jasmine.createSpy()
            },
            UserStatus: {
                getVerificationStatus: jasmine.createSpy(),
                getVerificationStatusById: jasmine.createSpy(),
                resendUserVerificationEmail: jasmine.createSpy(),
            },
            UsersScheduleStatus: {
                get: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } }),
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
            Roles: {
                get: () => {
                    return {
                        $promise: {
                            then: (res, error) => {
                                res({ Result: mockRoles }),
                                    error({
                                        data: {
                                            Message: "This field is required"
                                        }
                                    })
                            }
                        }
                    }
                }
            },
        };

        mockLocalizeService = {
            getLocalizedString: () => 'translated text'
        };

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
        };

        mockReferenceDataService = {
            get: jasmine.createSpy().and.returnValue([{
                UserId: '',
                FirstName: 'John',
                MiddleName: 'm',
                IsActive: true,
                ProviderTypeId: '1'
            }]),
            forceEntityExecution: jasmine.createSpy(),
            entityNames: {
                locations: 'locations',
            }
        };

        mockuserLocationRoles = [{
            ApplicationId: 34,
            DataTag: '343',
            LocationId: 12,
            PracticeId: '324',
            RoleDesc: '234',
            RoleId: 1,
            RoleName: 'Admin ',
            $$ObjectState: 'Deleted'
        }]

        allLocations = [{
            LocationId: null,
            NameLine1: 'LOC 1',
            NameLine2: 'LOC 1'
        }]


        mockTeamMemberLocationService = {
            getProviderTypes: jasmine.createSpy().and.returnValue({}),
            getPermittedLocations: jasmine.createSpy().and.returnValue({
                then: jasmine.createSpy().and.returnValue({})
            }),
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
            rxRoleFilter: jasmine.createSpy().and.returnValue({})

        }

        modalEvents = new ReplaySubject(1);
        mockConfirmationModalService = {
            open: jasmine.createSpy('open').and.returnValue({
                events: modalEvents.asObservable(),
                close: jasmine.createSpy('close')
            })
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
        };

        mockUserLocationSetup = {
            Color: "#3f48cc",
            DataTag: "AAAAAAAnDho=",
            DateModified: "2023-05-15T17:20:11.2420611",
            FailedMessage: null,
            IsActive: false,
            LocationId: 5378673,
            ObjectState: "Update",
            IsLocumDentist: false,
            ProviderOnClaimsId: "3755119f-4ae4-433e-b275-2f606ad724e8",
            ProviderOnClaimsRelationship: 1,
            ProviderQualifierType: 2,
            ProviderTypeId: 2,
            UserId: "3755119f-4ae4-433e-b275-2f606ad724e8",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            UserProviderSetupLocationId: "3242a0f4-460e-4c0b-acfc-38e8e2b70622",
            $$UserLocationRoles: [{
                ApplicationId: 0,
                DataTag: "AAAAACW4548=",
                PracticeId: null,
                RoleDesc: "Practice Administrator or Executive Dentist for Fuse Practices",
                RoleId: 190786,
                RoleName: "Practice Admin/Exec. Dentist"
            }]
        }

        mockUserLocationSetupWithOutSelf = {
            Color: "#3f48cc",
            DataTag: "AAAAAAAnDho=",
            DateModified: "2023-05-15T17:20:11.2420611",
            FailedMessage: null,
            IsActive: true,
            LocationId: 5378673,
            ObjectState: "Update",
            ProviderOnClaimsId: "3755119f-4ae4-433e-b275-2f606ad724e8",
            ProviderOnClaimsRelationship: 2,
            ProviderQualifierType: 2,
            ProviderTypeId: 2,
            UserId: "3755119f-4ae4-433e-b275-2f606ad724e8",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            UserProviderSetupLocationId: "3242a0f4-460e-4c0b-acfc-38e8e2b70622"
        }

        mockLocation = [{
            LocationId: 1,
            NameLine1: 'Location 1',
            NameLine2: 'L1'
        }, {
            LocationId: 2,
            NameLine1: 'Location 2',
            NameLine2: 'L2'
        }, {
            LocationId: 3,
            NameLine1: 'Location 3',
            NameLine2: 'L3'
        }]

        mockApplicationBillingInfoService = {
            applicationBilling$: of({
                Result: {
                    ApplicationBillingInfoId: 1,
                    ApplicationId: 2,
                    BillingModel: 2,
                },
            }),
        };

        mockFeatureFlagService = {
            getOnce$: jasmine.createSpy('getOnce$').and.returnValue(of(true))
        };

        await TestBed.configureTestingModule({
            declarations: [TeamMemberLocationSetupComponent, SoarSelectListComponent, OrderByPipe],
            imports: [ReactiveFormsModule, FormsModule, TranslateModule.forRoot(), HttpClientTestingModule, NoopAnimationsModule],
            providers: [DialogService, DialogContainerService, FormBuilder,
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                { provide: 'UserServices', useValue: mockUserServices },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: TeamMemberLocationService, useValue: mockTeamMemberLocationService },
                { provide: ApplicationBillingInfoService, useValue: mockApplicationBillingInfoService },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService }
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TeamMemberLocationSetupComponent);
        component = fixture.componentInstance;
        dialogservice = TestBed.inject(DialogService)
        fixture.detectChanges();
    });

  describe('ngOnInit ->', () => {
    it('Should Call initialize', () => {
      component.initialize = jasmine.createSpy();
      component.ngOnInit();
      expect(component.initialize).toHaveBeenCalled();
      expect(component.providerOnClaimsPlaceholder).not.toEqual('');
    });
  });

  describe('initialize ->', () => {
    it('Should Call createForm, getLocations, getRoles, getActiveUsers', () => {
      component.createForm = jasmine.createSpy();
      component.getLocations = jasmine.createSpy();
      component.getRoles = jasmine.createSpy();
      component.getActiveUsers = jasmine.createSpy();
      component.initialize();
      expect(component.createForm).toHaveBeenCalled();
      expect(component.getLocations).toHaveBeenCalled();
      expect(component.getRoles).toHaveBeenCalled();
      expect(component.getActiveUsers).toHaveBeenCalled();
      expect(component.filteredActiveProviders).toEqual(component.activeUsers);
      expect(component.employeeStatusOptions.length).toBeGreaterThan(0);
    });
  });

  describe('createForm ->', () => {
    it('Should Create form', () => {
      component.teamMemberLocationSetup = undefined;
      component.createForm();
      expect(component.teamMemberLocationSetup).not.toEqual(undefined)
    });
  });

  describe('setDynamicValidations ->', () => {
    it('Call setDynamicValidations with true, should not set selEmployeeStatus as required field', () => {
      component.teamMemberLocationSetup = component.fb?.group({
        selEmployeeStatus: new FormControl()
      });
      component.setDynamicValidations(true);
      expect(component.teamMemberLocationSetup?.controls?.selEmployeeStatus.invalid).toEqual(false);
    });

    it('Call setDynamicValidations with false, should set selEmployeeStatus as required field', () => {
      component.teamMemberLocationSetup = component.fb?.group({
        selEmployeeStatus: new FormControl()
      });

      component.teamMemberLocationSetup.patchValue({ selEmployeeStatus: 1 })
      component.setDynamicValidations(false);
      expect(component.teamMemberLocationSetup?.controls?.selEmployeeStatus.invalid).toEqual(false);
    });
  });

  describe('openLocationSetupCrudModal ->', () => {

    it('Call openLocationSetupCrudModal with Add mode, should set default Values', () => {
      component.filterLocations = jasmine.createSpy();
      component.openLocationSetupCrudModal(null);
      expect(component.editMode).toEqual(false);
      expect(component.selectedRoles).toEqual([]);
      expect(component.selectedRolesBackup).toEqual([]);
      expect(component.hasRoleErrors).toEqual(false);
      expect(component.isProviderActive).toEqual(false);
      expect(component.providerOnClaimsError).toEqual(false);
      expect(component.ifAnyChange).toEqual(false);
      expect(component.providerOnClaimsName).toEqual(null);
      expect(component.providerOnClaimsId).toEqual(null);
      expect(component.ifProviderOnClaimsTypeIsSelf).toEqual(true);
      expect(component.filterLocations).toHaveBeenCalled();
    });

    it('Call openLocationSetupCrudModal with edit mode with ProviderOnClaimsRelationship.Self, should set Provided values', () => {
      component.filterLocations = jasmine.createSpy();
      component.teamMemberLocationSetup = component.fb?.group({
        inpLocation: ['', [Validators.required]],
        inpProviderType: ['', [Validators.required]],
        selEmployeeStatus: ['', ''],
        providerOnClaims: ['', ''],
        isActive: [component.userLocationSetup?.IsActive, '']
      });
      component.openLocationSetupCrudModal(mockUserLocationSetup);
      expect(component.editMode).toEqual(true);
      expect(component.selectedRoles).toEqual([{ text: 'Practice Admin/Exec. Dentist', value: 190786 }]);
      expect(component.selectedRolesBackup).toEqual([{ text: 'Practice Admin/Exec. Dentist', value: 190786, ObjectState: 'None' }]);
      expect(component.hasRoleErrors).toEqual(false);
      expect(component.isProviderActive).toEqual(true);
      expect(component.providerOnClaimsError).toEqual(false);
      expect(component.ifAnyChange).toEqual(false);
      expect(component.providerOnClaimsName).toEqual(null);
      expect(component.providerOnClaimsId).toEqual(null);
      expect(component.ifProviderOnClaimsTypeIsSelf).toEqual(true);
      expect(component.filterLocations).toHaveBeenCalled();
    });

    it('Call openLocationSetupCrudModal with edit mode with ProviderOnClaimsRelationship.Other, should set Provided values', () => {
      component.filterLocations = jasmine.createSpy();
      component.teamMemberLocationSetup = component.fb?.group({
        inpLocation: ['', [Validators.required]],
        inpProviderType: ['', [Validators.required]],
        selEmployeeStatus: ['', ''],
        providerOnClaims: ['', ''],
        isActive: [component.userLocationSetup?.IsActive, '']
      });
      component.filteredActiveProviders = [{ UserId: "3755119f-4ae4-433e-b275-2f606ad724e8", FirstName: "User A" }];
      component.openLocationSetupCrudModal(mockUserLocationSetupWithOutSelf);
      expect(component.editMode).toEqual(true);
      expect(component.selectedRoles).toEqual([]);
      expect(component.selectedRolesBackup).toEqual([]);
      expect(component.hasRoleErrors).toEqual(false);
      expect(component.isProviderActive).toEqual(true);
      expect(component.providerOnClaimsError).toEqual(false);
      expect(component.ifAnyChange).toEqual(false);
      expect(component.ifProviderOnClaimsTypeIsSelf).toEqual(false);
      expect(component.filterLocations).toHaveBeenCalled();
      expect(component.providerOnClaimsName).toEqual("User A");
      expect(component.providerOnClaimsId).toEqual("3755119f-4ae4-433e-b275-2f606ad724e8");
    });

    it('Call openLocationSetupCrudModal with userLocationSetup Role has Delete flag', () => {
      component.filterLocations = jasmine.createSpy();
      component.teamMemberLocationSetup = component.fb?.group({
        inpLocation: ['', [Validators.required]],
        inpProviderType: ['', [Validators.required]],
        selEmployeeStatus: ['', ''],
        providerOnClaims: ['', ''],
        isActive: [component.userLocationSetup?.IsActive, '']
      });

      let userLocationSetup = mockUserLocationSetup;
      userLocationSetup.$$UserLocationRoles = [
        {
          ApplicationId: 0,
          DataTag: "AAAAACW4548=",
          PracticeId: null,
          RoleDesc: "Practice Administrator or Executive Dentist for Fuse Practices",
          RoleId: 190786,
          RoleName: "Practice Admin/Exec. Dentist",
          $$ObjectState: 'None'
        }]

      component.openLocationSetupCrudModal(userLocationSetup);
      expect(component.selectedRoles.length).toEqual(1);
      expect(component.selectedRolesBackup.length).toEqual(1);

    });



  });

  describe('Dialog box ->', () => {
    beforeEach(() => {
      dialogservice.open = jasmine.createSpy()
    });
    it('On Open Dialog box', () => {
      component.openDialog();
      expect(dialogservice.open).toHaveBeenCalled();
    });
  });

    describe('confirmClose  ->', () => { 
      it('Close dialog with confirmation box', fakeAsync(() => {
      component.teamMemberLocationSetup = component.fb?.group({
        inpLocation: ['', [Validators.required]],
        inpProviderType: ['', [Validators.required]],
        selEmployeeStatus: ['', ''],
        providerOnClaims: ['', ''],
        isActive: [component.userLocationSetup?.IsActive, '']
      });
      component.ifAnyChange = true;
      component.userLocationSetup = mockUserLocationSetup;

      component.confirmationModalData = {
        header: "Header",
        message: "This is message",
        confirm: "Confirm",
        cancel: "Cancel",
        height: 890,
        width: 890
      }
      spyOn(component, 'close');
      component.confirmClose();
      tick();   

      // First time opens the dialog
      expect(mockConfirmationModalService.open).toHaveBeenCalled();
      expect(component.close).not.toHaveBeenCalled();

      modalEvents.next({ type: 'confirm' });
      tick();

      // Confirm close the after confirm
      expect(component.close).toHaveBeenCalled();
    }));

    it('Close dialog without confirmation box', () => {
      component.ifAnyChange = false;
      spyOn(component, 'close');
      component.confirmClose();
      expect(component.close).toHaveBeenCalled();
    });
  });

  describe('Dialog box ->', () => {
    it('On Open Dialog box', () => {
      component.getActiveUsers();
      expect(mockReferenceDataService.get).toHaveBeenCalled();
    });
  });

  describe('getLocations->', () => {
    it('Should Call PermittedLocations', () => {
      component.getLocations();
      expect(mockTeamMemberLocationService.getPermittedLocations).toHaveBeenCalled();
    });
  });


  describe('locationsGetSuccess->', () => {
    it('Should Call filterLocations', () => {
      spyOn(component, 'filterLocations');
      component.locationsGetSuccess(mockLocation);
      expect(component.filterLocations).toHaveBeenCalled();
    });
  });

  describe('locationsGetFailure->', () => {
    it('Should Call toastrFactory.error(', () => {
      component.locationsGetFailure({});
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('filterLocations->', () => {
    it('Should add filteredLocations', () => {
      component.allLocations = allLocations;
      component.userLocationSetups = [];
      component.userLocationSetups.push(mockUserLocationSetup);
      component.filterLocations();
      expect(component.filteredLocations).not.toEqual(undefined);
    });
  });

  describe('getRoles ->', () => {
    it('Should Call mockUserServices.Roles', () => {
      mockUserServices.Roles.get = jasmine.createSpy().and.returnValue({
        $promise: {
          then: (res, error) => {
            res({ Result: mockRoles }),
              error({
                data: {
                  Message: "This field is required"
                }
              })
          }
        }
      });
      spyOn(component, 'rolesGetSuccess')
      component.getRoles();
      expect(mockUserServices.Roles.get).toHaveBeenCalled();
      expect(component.rolesGetSuccess).toHaveBeenCalled();
    });
  });

  describe('rolesGetFailure->', () => {
    it('Should Call toastrFactory.error', () => {
      component.rolesGetFailure({});
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('onRoleSelectedChange ->', () => {
    it('Should Call validateUserLocationSetup', () => {
      spyOn(component, 'validateUserLocationSetup');
      let newItems = [{ text: 'A', value: 1 }, { text: 'B', value: 2 }, { text: 'C', value: 3 }]
      component.onRoleSelectedChange(newItems);
      expect(component.ifAnyChange).toEqual(true);
      expect(component.selectedRoles.length).toEqual(3);
      expect(component.validateUserLocationSetup).toHaveBeenCalled();
    });
  });

  describe('removeRoles ->', () => {
    it('Should Call validateUserLocationSetup', () => {
      spyOn(component, 'validateUserLocationSetup');
      component.selectedRoles = [{ text: 'A', value: 1 }, { text: 'B', value: 2 }, { text: 'C', value: 3 }]
      let removedItems = { text: 'A', value: 1 };
      component.removeRoles(removedItems);
      expect(component.selectedRoles.length).toEqual(2);
      expect(component.validateUserLocationSetup).toHaveBeenCalled();
    });
  });


  describe('providerTypeChange  ->', () => {
    it('Called with not a provider option, Should set isProviderActive as false', () => {
      component.providerTypeChange(4);
      expect(component.isProviderActive).toEqual(false);
    });

    it('Called with a provider option, Should set isProviderActive as true', () => {
      component.providerTypeChange(1);
      expect(component.isProviderActive).toEqual(true);
    });
  });

  describe('activeInactive  ->', () => {
    it('Called with not a provider option, userLocationSetup.IsActive as false', () => {
      component.userLocationSetup = mockUserLocationSetup;
      component.activeInactive();
      expect(component.userLocationSetup.IsActive).toEqual(true);
    });
  });

  describe('colorChanged->', () => {
    it('Should set colour for selectedColor', () => {
      component.colorChanged('#fff');
      expect(component.selectedColor).toEqual('#fff');
    });
  });

  describe('cancelProviderType->', () => {
    it('Should set colour for selectedColor', () => {
      component.teamMemberLocationSetup = component.fb?.group({
        inpProviderType: ['', [Validators.required]],
      });

      component.teamMemberLocationSetup?.patchValue({
        inpProviderType: '3434'
      })
      component.cancelProviderType();
      expect(component.isProviderActive).toEqual(false);
    });
  });


  describe('providerChange->', () => {
    it('Should set ifProviderOnClaimsTypeIsSelf, providerOnClaimsName and providerOnClaimsError when value is true', () => {
      component.providerChange(true);
      expect(component.ifProviderOnClaimsTypeIsSelf).toEqual(true);
      expect(component.providerOnClaimsName).toEqual(null);
      expect(component.providerOnClaimsError).toEqual(false);
    });

    it('Should set ifProviderOnClaimsTypeIsSelf, providerOnClaimsName and providerOnClaimsError when value is false', () => {
      component.providerChange(false);
      expect(component.ifProviderOnClaimsTypeIsSelf).toEqual(false);
      expect(component.providerOnClaimsName).toEqual(null);
      expect(component.providerOnClaimsError).not.toBeDefined();
    });
  });

  describe('selectProviderResult ->', () => {
    it('Should set  providerOnClaimsError, providerOnClaimsId', () => {
      spyOn(component, 'validateUserLocationSetup')
      component.filteredActiveProviders = [{ FirstName: "Test name", UserId: 'user1' }]
      component.selectProviderResult('user1');
      expect(component.providerOnClaimsError).toEqual(false);
      expect(component.providerOnClaimsId).toEqual('user1');
      expect(component.providerOnClaimsName).toEqual('Test name');
      expect(component.validateUserLocationSetup).toHaveBeenCalledWith(false);
    });
  });

  describe('filterValueChange  ->', () => {
    it('Should call validateUserLocationSetup', () => {
      spyOn(component, 'validateUserLocationSetup')
      component.filterValueChange();
      expect(component.providerOnClaimsError).toEqual(false);
      expect(component.validateUserLocationSetup).toHaveBeenCalledWith(false);
    });
  });

  describe('validateUserLocationSetup when saveData is false->', () => {
    describe('When User is active and not a Practice admin->', () => {

      it('Should set hasRoleErrors as true, because and roles length is 0 ', () => {
        component.user = mockUser;
        component.user.IsActive = true;
        component.user.$$isPracticeAdmin = false;
        component.selectedRoles = [];
        component.userLocationSetup = mockUserLocationSetup;
        component.validateUserLocationSetup(false);
        expect(component.hasRoleErrors).toEqual(true);
      });
      it('Should set hasRoleErrors as false, because and roles length is 1', () => {
        component.user = mockUser;
        component.user.IsActive = true;
        component.user.$$isPracticeAdmin = false;
        component.selectedRoles = [{ text: 'Role 1', value: 1 }];
        component.userLocationSetup = mockUserLocationSetup;
        component.validateUserLocationSetup(false);
        expect(component.hasRoleErrors).toEqual(false);
      });

    });

    describe('isProviderActive is Inactive ->', () => {
      it('Should set ProviderOnClaimsRelationship and  ProviderQualifierType as 0 ', () => {
        component.user = mockUser;
        component.userLocationSetup = mockUserLocationSetup;
        component.isProviderActive = false;
        component.validateUserLocationSetup(false);
          expect(component.userLocationSetup.ProviderOnClaimsRelationship).toEqual(0);
          expect(component.userLocationSetup.ProviderOnClaimsId).toEqual(null);
        expect(component.userLocationSetup.ProviderQualifierType).toEqual(0);
      });
    });

    describe('isProviderActive is Actice ->', () => {
      describe('When ifProviderOnClaimsTypeIsSelf is true ->', () => {
        it('Should set hasRoleErrors as true, because and roles length is 0 ', () => {
          component.user = mockUser;
          component.userLocationSetup = mockUserLocationSetup;
          component.isProviderActive = true;
          component.ifProviderOnClaimsTypeIsSelf = true;
          component.validateUserLocationSetup(false);
          expect(component.userLocationSetup.ProviderOnClaimsRelationship).toEqual(1);
          expect(component.userLocationSetup.ProviderOnClaimsId).toEqual(null);

        });

        it('ifProviderOnClaimsTypeIsSelf is false, providerOnClaimsId is not null ', () => {
          component.user = mockUser;
          component.userLocationSetup = mockUserLocationSetup;
          component.isProviderActive = true;
          component.providerOnClaimsId = '3434';
          component.ifProviderOnClaimsTypeIsSelf = false;
          component.validateUserLocationSetup(false);
          expect(component.userLocationSetup.ProviderOnClaimsRelationship).toEqual(2);
          expect(component.userLocationSetup.ProviderOnClaimsId).toEqual('3434');
        });

        it('ifProviderOnClaimsTypeIsSelf is false, providerOnClaimsId is null ', () => {
          component.user = mockUser;
          component.userLocationSetup = mockUserLocationSetup;
          component.isProviderActive = true;
          component.providerOnClaimsId = null;
          component.ifProviderOnClaimsTypeIsSelf = false;
          component.validateUserLocationSetup(false);
          expect(component.providerOnClaimsError).toEqual(true);
        });
      });
    });
  });

  describe('validateUserLocationSetup when saveData is true->', () => {
    describe('When User is active and not a Practice admin->', () => {
      it('Should set hasRoleErrors as true, because and roles length is 0 ', () => {
        spyOn(component, 'close')
        component.user = mockUser;
        component.user.IsActive = false;
        component.userLocationSetup = mockUserLocationSetup;
        component.addUserLocationSetupCallback.emit = jasmine.createSpy();
        component.validateUserLocationSetup(true);
        expect(component.close).toHaveBeenCalled();
        expect(component.addUserLocationSetupCallback.emit).toHaveBeenCalled();
      });
    });
  });

  describe('saveUserLocationSetup when saveData is true->', () => {
    describe('When The form is vaild->', () => {
      it('Should Call validateUserLocationSetup with true', () => {
        spyOn(component, 'validateUserLocationSetup');

        component.teamMemberLocationSetup = component.fb?.group({
          inpLocation: ['', [Validators.required]],
          inpProviderType: ['', [Validators.required]],
          selEmployeeStatus: ['', ''],
          providerOnClaims: ['', ''],
          isActive: [component.userLocationSetup?.IsActive, '']
        });

        component.teamMemberLocationSetup?.patchValue({
          inpLocation: 'Test Location',
          inpProviderType: 'Provider Type',
          selEmployeeStatus: 'Employee Status',
          providerOnClaims: 'provider On Claims'
        })
        component.hasRoleErrors = false;
        component.saveUserLocationSetup();
        expect(component.validateUserLocationSetup).toHaveBeenCalledWith(true);
      });

      it('Should Set LocationId, ProviderTypeId and Color', () => {

        component.teamMemberLocationSetup = component.fb?.group({
          inpLocation: ['', [Validators.required]],
          inpProviderType: ['', [Validators.required]],
          selEmployeeStatus: ['', ''],
          providerOnClaims: ['', ''],
          isActive: [component.userLocationSetup?.IsActive, '']
        });

        component.teamMemberLocationSetup?.patchValue({
          inpLocation: 123,
          inpProviderType: 1,
          selEmployeeStatus: 'Employee Status',
          providerOnClaims: 'provider On Claims'
        })

        component.userLocationSetup = mockUserLocationSetup;
        component.selectedColor = '#fff';
        component.selectedRolesBackup = [{ text: 'Admin', value: 1, ObjectState: null }]
        component.selectedRoles = [{ text: 'Admin', value: 1 }]
        component.roles = [{ RoleName: 'Admin', RoleId: 1, $$ObjectState: null }]
        component.saveUserLocationSetup();
        expect(component.userLocationSetup.LocationId).toEqual(123);
        expect(component.userLocationSetup.ProviderTypeId).toEqual(1);
        expect(component.userLocationSetup.Color).toEqual('#fff');
        //expect(component.userLocationSetup.$$UserLocationRoles.length).toBeGreaterThan(0);
      });

      it('Should Call $$UserLocationRole from User Role', () => {

        component.teamMemberLocationSetup = component.fb?.group({
          inpLocation: ['', [Validators.required]],
          inpProviderType: ['', [Validators.required]],
          selEmployeeStatus: ['', ''],
          providerOnClaims: ['', ''],
          isActive: [component.userLocationSetup?.IsActive, '']
        });

        component.teamMemberLocationSetup?.patchValue({
          inpLocation: 123,
          inpProviderType: 1,
          selEmployeeStatus: 'Employee Status',
          providerOnClaims: 'provider On Claims'
        })

        component.userLocationSetup = mockUserLocationSetup;
        component.user = mockUser;
        component.user.$$isPracticeAdmin = false;
        component.userLocationSetup.$$UserLocationRoles = [{ RoleName: 'Admin', RoleId: 1, $$ObjectState: null }];
        component.user.Roles = [{ RoleName: 'User Role', RoleId: 111 }];
        component.saveUserLocationSetup();
        expect(component.userLocationSetup.$$UserLocationRoles[0]).toEqual({ RoleName: 'User Role', RoleId: 111 });
      });
    });
  });

  describe('deletedRolesFilter  ->', () => {
    it('Should call validateUserLocationSetup', () => {
      component.deletedRolesFilter(mockuserLocationRoles);
    });
  });

  describe('rxRoleFilter  ->', () => {
    it('should filter user practice roles', () => {
      component.user = {
        $$UserPracticeRoles: [
          { RoleName: 'role1' },
          { RoleName: 'role2' },
          { RoleName: 'RxUser' }
        ],
        $$locations: []
      };
      const result = component.rxRoleFilter();
      expect(result).not.toEqual([{ RoleName: 'role1' }, { RoleName: 'role2' }]);
    });
  });

  describe('canChangeProvider  ->', () => {
    it('Should return true when value is not 4', () => {
      component.editMode = true;
      spyOn(component, 'checkMustBeAProvider')
      component.canChangeProvider('3', '1');
      expect(component.checkMustBeAProvider).toHaveBeenCalled();
    });

    it('Should return false when value is 4', () => {
      component.editMode = true;
      component.userLocationSetup = { 'LocationId': 626589 };
      component.user = {
        '$$scheduleStatuses': [{
          'LocationId': 626589,
          'HasProviderAppointments': true,
          'HasProviderRoomOccurrences': true
        }]
      };
      component.confirmationModalData = {
        header: "Header",
        message: "This is message",
        confirm: "Confirm",
        cancel: "Cancel",
        height: 890,
        width: 890
      }
      let res = component.canChangeProvider('4', '1');
      expect(res).toBe(false);
    });
  });

  describe('checkMustBeAProvider  ->', () => {
    it('Should return false when no scheduled appointments /provider room occurrences at specific location', () => {
      component.userLocationSetup = mockUserLocationSetup;
      component.user = {
        '$$scheduleStatuses': []
      }
      let res = component.checkMustBeAProvider();
      expect(res).toBe(false);
    });

    it('Should return true when scheduled appointments /provider room occurrences at specific location', () => {
      component.userLocationSetup = { LocationId: 5378673 };
      component.user = {
        $$scheduleStatuses: [{
          'LocationId': 5378673,
          'HasProviderAppointments': true,
          'HasProviderRoomOccurrences': true
        }]
      };
      let res = component.checkMustBeAProvider();
      expect(res).toBe(true);
    });
  });

  describe('confirmProviderTypeChangeSubscription  ->', () => {
    it('Should open the modal using confirmationModalService when BillingModel is 2 and provider is dentist', async () => {
      component.editMode = true;
      component.affirmedSubscription = false;
      component.confirmationModalData = {
        header: "Header",
        message: "This is message",
        confirm: "Confirm",
        cancel: "Cancel",
        height: 890,
        width: 890
        }

        mockApplicationBillingInfoService.applicationBilling$.subscribe((res) => {
            component.confirmProviderTypeChangeSubscription('1');
            expect(mockConfirmationModalService.open).toHaveBeenCalled();
        }
        )
    });

      it('Should open the modal using confirmationModalService when BillingModel is 1 and provider is Hygienist', async () => {
          component.editMode = true;
          component.affirmedSubscription = false;
          component.confirmationModalData = {
              header: "Header",
              message: "This is message",
              confirm: "Confirm",
              cancel: "Cancel",
              height: 890,
              width: 890
          }
          mockApplicationBillingInfoService.applicationBilling$ = of({
              Result: {
                  ApplicationBillingInfoId: 1,
                  PracticeId: 1,
                  ApplicationId: 2,
                  BillingModel: 1,
              },
          })

          mockApplicationBillingInfoService.applicationBilling$.subscribe((res) => {
              component.confirmProviderTypeChangeSubscription('2');
              expect(mockConfirmationModalService.open).toHaveBeenCalled();
          }
          )
      });

      it('Should not open the modal using confirmationModalService when BillingModel is 2 and provider is Hygienist', async () => {
          component.editMode = true;
          component.affirmedSubscription = false;
          component.confirmationModalData = {
              header: "Header",
              message: "This is message",
              confirm: "Confirm",
              cancel: "Cancel",
              height: 890,
              width: 890
          }

          mockApplicationBillingInfoService.applicationBilling$ = of({
              Result: {
                  ApplicationBillingInfoId: 1,
                  ApplicationId: 2,
                  BillingModel: 2,
              },
          })

          mockApplicationBillingInfoService.applicationBilling$.subscribe((res) => {
              component.confirmProviderTypeChangeSubscription('2');
              expect(mockConfirmationModalService.open).not.toHaveBeenCalled();
          }
          )

      });

      it('Should not open the modal using confirmationModalService when BillingModel is 3', async () => {
          component.editMode = true;
          component.affirmedSubscription = false;
          component.confirmationModalData = {
              header: "Header",
              message: "This is message",
              confirm: "Confirm",
              cancel: "Cancel",
              height: 890,
              width: 890
          }

          mockApplicationBillingInfoService.applicationBilling$ = of({
              Result: {
                  ApplicationBillingInfoId: 1,
                  ApplicationId: 2,
                  BillingModel: 3,
              },
          })

          mockApplicationBillingInfoService.applicationBilling$.subscribe((res) => {
              component.confirmProviderTypeChangeSubscription('1');
              expect(mockConfirmationModalService.open).not.toHaveBeenCalled();
          }
          )

      });

      describe('isLocumDentist selection tests', () => {

          beforeEach(() => {
              (mockConfirmationModalService.open as jasmine.Spy).calls.reset();
          });

          it('should open the confirmation modal when the checkbox is checked', fakeAsync(() => {
              component.isLocumTenensFeatureFlagEnabled = true;
              component.createForm();
              component.listenForLocumDentistChanges();
              const locumDentistCtrl = component.teamMemberLocationSetup.get('isLocumDentist');

              locumDentistCtrl.patchValue(true);
              locumDentistCtrl.markAsDirty();
              tick();

              expect(mockConfirmationModalService.open).toHaveBeenCalled();
          }));

          it('should keep the checkbox checked if the user acknowledges the confirmation', fakeAsync(() => {
              component.isLocumTenensFeatureFlagEnabled = true;
              component.createForm();
              component.listenForLocumDentistChanges();
              const locumDentistCtrl = component.teamMemberLocationSetup.get('isLocumDentist');

              locumDentistCtrl.patchValue(true);
              locumDentistCtrl.markAsDirty();
              tick();

              modalEvents.next({ type: 'confirm' });
              tick();

              expect(locumDentistCtrl.value).toBe(true);
          }));

          it('should uncheck the checkbox if the user cancels the confirmation', fakeAsync(() => {
              component.isLocumTenensFeatureFlagEnabled = true;
              component.createForm();
              component.listenForLocumDentistChanges();
              const locumDentistCtrl = component.teamMemberLocationSetup.get('isLocumDentist');

              locumDentistCtrl.patchValue(true);
              locumDentistCtrl.markAsDirty();
              tick();

              modalEvents.next({ type: 'close' });
              tick();

              expect(locumDentistCtrl.value).toBe(false);
          }));

          it('should reset the view model when the confirmation dialog is canceled', fakeAsync(() => {
              component.isLocumTenensFeatureFlagEnabled = true;
              component.createForm();
              component.listenForLocumDentistChanges();
              const locumDentistCtrl = component.teamMemberLocationSetup.get('isLocumDentist');

              locumDentistCtrl.patchValue(true);
              locumDentistCtrl.markAsDirty();
              tick();

              expect(component.locumDentistCheckedState).toBe(true);

              modalEvents.next({ type: 'close' });
              tick();

              expect(component.locumDentistCheckedState).toBe(false);
          }));

          it('should correctly set the final value when saving', () => {
              component.isLocumTenensFeatureFlagEnabled = true;
              component.createForm();
              component.listenForLocumDentistChanges();
              component.hasRoleErrors = false;
              component.userLocationSetup = new UserLocationSetup();
              const form = component.teamMemberLocationSetup;
              form.patchValue({
                  inpLocation: 123,
                  inpProviderType: 1  
              });
              const locumDentistCtrl = component.teamMemberLocationSetup.get('isLocumDentist');

              locumDentistCtrl.patchValue(true);
              spyOn(component.addUserLocationSetupCallback, 'emit');

              component.saveUserLocationSetup();

              expect(component.userLocationSetup.IsLocumDentist).toBe(true);
          });
      });
    
  });
});

