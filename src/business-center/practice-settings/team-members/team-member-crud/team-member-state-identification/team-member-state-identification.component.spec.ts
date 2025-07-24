import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import cloneDeep from 'lodash/cloneDeep';
import { States, User } from '../../team-member';
import { spaceValidator, TeamMemberStateIdentificationComponent } from './team-member-state-identification.component';


let localize;
let stateIdentificationFormGroup: FormGroup;
const mockSaveStates = {
    None: 'None',
    Add: 'Add',
    Update: 'Update',
    Delete: 'Delete',
    Failed: 'Failed'
};
let mockUser: User = {
    UserId: '1234',
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
    $$originalStateLicenses: []
}
let mockResultItem = {
    StateLicenseId: '1234',
    Flag: 0,
    StateId: 1,
    StateAbbreviation: 'AL',
    StateLicenseNumber: 'A12',
    AnesthesiaId: "1",
    IsEdit: false,
    ObjectState: 'Add',
    DataTag: null,
    StateIdUndefined: false,
    StateLicenseUndefined: false,
};
let mockOriginalStates: States[] = [
    {
        Abbreviation: 'AL',
        DataTag: 'AA',
        DateModified: '',
        Name: 'Alabama',
        StateId: 1,
        UserModified: ''
    }]
    ;
let mockStates = {
    Value: [
        { Disabled: false, StateId: 1, Abbreviation: 'AL' },
        { Disabled: true, StateId: 2, Abbreviation: 'AK' }
    ]
};
let mockStaticDataService = {
    States: () => {
        return {
            then: (callback) => {
                callback(mockStates);
            }
        };
    }
};

let mockLocalizeService = {
    getLocalizedString: () => 'translated text'
};
let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};

let mockUserServices = {
    Licenses: {
        get: () => {
            return {
                $promise: {
                    then: (res, error) => {
                        res({ Value: mockResultItem }),
                            error({
                                data: {

                                }
                            })
                    }
                }
            }
        },
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

let mockSubscription = {
    unsubscribe: jasmine.createSpy(),
    closed: true
};

describe('TeamMemberStateIdentificationComponent', () => {
    let component: TeamMemberStateIdentificationComponent;
    let fixture: ComponentFixture<TeamMemberStateIdentificationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TeamMemberStateIdentificationComponent],
            imports: [TranslateModule.forRoot(), ReactiveFormsModule, FormsModule],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'StaticData', useValue: mockStaticDataService },
                { provide: 'UserServices', useValue: mockUserServices }
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TeamMemberStateIdentificationComponent);
        component = fixture.componentInstance;
        localize = TestBed.get('localize');
        stateIdentificationFormGroup = component.fb.group({
            state: 1,
            stateLicenseNumber: '123456',
            anesthesiaId: 'A123'
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('spaceValidator', () => {
        let control: AbstractControl;
        beforeEach(() => {
            control = new FormControl();
        });
        it('should set control value to empty string and return required error if it contains only spaces', () => {
            control.setValue(' ');
            const result = spaceValidator(control);
            expect(result).toEqual({ required: true });
            expect(control.value).toBe('');
        });
    });
    describe('handleKeyboardEvent -->', () => {
        it('should call preventDefault if ENTER key is pressed', () => {
            const eventInit: KeyboardEventInit = {
                key: 'ENTER',
                ctrlKey: true
            };
            eventInit['keyCode'] = 13;
            const event = new KeyboardEvent('keypress', eventInit);
            const preventDefaultSpy = spyOn(event, 'preventDefault').and.stub();
            component.handleKeyboardEvent(event);
            expect(preventDefaultSpy).toHaveBeenCalled();
        });
    });

    describe('ngOnInit -->', () => {
        it('should call ngOnInit methods', () => {
            component.getStates = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getStates).toHaveBeenCalled();
        })
    });

    describe('createForm', () => {
        it('should create a form with default values', () => {
            component.createForm();
            expect(component.stateIdentificationFormGroup.get('state').value).toEqual(0);
            expect(component.stateIdentificationFormGroup.get('stateLicenseNumber').value).toBeNull();
            expect(component.stateIdentificationFormGroup.get('anesthesiaId').value).toBeNull();
        });
        it('should initialize form and subscribe to value changes', () => {
            component.createForm();
            expect(component.NewUserStateLicense.StateId).toEqual(0);
            component.stateIdentificationFormGroup.setValue({
                state: 1,
                stateLicenseNumber: '123456',
                anesthesiaId: 'A123'
            });
            expect(component.NewUserStateLicense.StateId).toEqual(1);
            expect(component.NewUserStateLicense.StateLicenseNumber).toEqual('123456');
            expect(component.NewUserStateLicense.AnesthesiaId).toEqual('A123');
        });
    });
    describe('getStates -->', () => {
        it('should call getStates', () => {
            component.states = [];
            let mockUser = { UserId: '' };
            component.user = cloneDeep(mockUser);
            spyOn(component, 'getLicenses');
            component.originalStates = mockStates.Value;
            component.getStates();
            let item = {
                Disabled: false,
                StateId: 3,
                Abbreviation: 'NY'
            };
            expect(component.states.length).toEqual(2);
            expect(component.user.UserId).toEqual('');
            expect(component.getLicenses).toHaveBeenCalled();
        })
    });
    describe('getStateAbbreviation -->', () => {
        it('should call getStateAbbreviation', () => {
            component.originalStates = mockOriginalStates;
            let item = { stateId: 1 };
            component.getStateAbbreviation(item);
            expect(component.originalStates).toEqual(mockOriginalStates);
        })
    });

    describe('getLicenses -->', () => {
        it('should call getLicenses', () => {
            spyOn(component, 'userLicensesGetSuccess')
            let mockUser = { UserId: '1234' };
            component.user = cloneDeep(mockUser);
            component.getLicenses();
            expect(component.userLicensesGetSuccess).toHaveBeenCalled();
        });
    });

    describe('userLicensesGetSuccess -->', () => {
        it('should get data successfully', () => {
            component.sendUpdatedLicensesToValidate = jasmine.createSpy();
            let tempRes = {
                Value: [{
                    AnesthesiaId: "AI", DataTag: "AAAAAAAmDZE=", DateModified: "2023-04-26T16:37:23.9141245", IsActive: true, IsDeleted: false, ObjectState: "None", StateId: 12, StateLicenseId: 63, StateLicenseNumber: "SL1", UserId: "3f033191-243a-4799-913d-b62196feb594", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                }]
            }
            component.user = cloneDeep(mockUser);
            component.userLicensesGetSuccess(tempRes);
            expect(component.sendUpdatedLicensesToValidate).toHaveBeenCalled();
        })
        it('should get data successfully', () => {
            component.sendUpdatedLicensesToValidate = jasmine.createSpy();
            let tempRes = {}
            component.user = cloneDeep(mockUser);
            component.userLicensesGetSuccess(tempRes);
            expect(component.sendUpdatedLicensesToValidate).toHaveBeenCalled();
        })
        it('should get data successfully', () => {
            component.sendUpdatedLicensesToValidate = jasmine.createSpy();
            component.originalStates = null;
            let tempRes = {}
            component.user = cloneDeep(mockUser);
            component.userLicensesGetSuccess(tempRes);
            expect(component.sendUpdatedLicensesToValidate).toHaveBeenCalled();
        })
    });
    describe('userLicensesGetFailure -->', () => {
        it('should call userLicensesGetFailure and display toast error', () => {
            spyOn(localize, 'getLocalizedString').and.returnValue('Failed to get User Licenses');
            component.userLicensesGetFailure({ data: { Message: 'Failed to get User Licenses' } });
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('allowLicenseAdd -->', () => {
        it('should add license', () => {
            component.allowLicenseAdd();
            component.createForm = jasmine.createSpy();
            expect(component.validateForm).toBe(false);
            expect(component.isAdding).toBe(true);
        });
        it('should check if editmode & isAdding are true', () => {
            component.isOnEditMode = true;
            component.isAdding = true;
            component.allowLicenseAdd();
            expect(component.isAdding).toBe(true);
            expect(component.isOnEditMode).toBe(true);
        })
    });
    describe('addUserStateLicense -->', () => {
        it('should add data successfully', () => {
            let tempItem = {
                AnesthesiaId: "AI",
                StateId: "1",
                StateLicenseNumber: "SL2"
            }
            component.UserStateLicenses = cloneDeep([{
                AnesthesiaId: "AI", DataTag: "AAAAAAAmDZE=", DateModified: "2023-04-26T16:37:23.9141245", IsActive: true, IsDeleted: false, ObjectState: "None", StateId: 12, StateLicenseId: 63, StateLicenseNumber: "SL1", UserId: "3f033191-243a-4799-913d-b62196feb594", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
            }])
            component.sendUpdateLicense = jasmine.createSpy();
            component.states = cloneDeep(mockStates.Value);
            component.NewUserStateLicense = cloneDeep(tempItem);
            component.user = cloneDeep(mockUser);
            component.addUserStateLicense(tempItem);
            expect(component.sendUpdateLicense).toHaveBeenCalled();
        })
    });

    describe('editUserStateLicense -->', () => {
        it('should edit data successfully', () => {
            let tempItem = {
                AnesthesiaId: "AI",
                StateId: "1",
                StateLicenseNumber: "SL2"
            }
            component.UserStateLicenses = cloneDeep([{
                AnesthesiaId: "AI", DataTag: "AAAAAAAmDZE=", DateModified: "2023-04-26T16:37:23.9141245", IsActive: true, IsDeleted: false, ObjectState: "None", StateId: 12, StateLicenseId: 63, StateLicenseNumber: "SL1", UserId: "3f033191-243a-4799-913d-b62196feb594", UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
            }])
            component.states = cloneDeep(mockStates.Value);
            component.NewUserStateLicense = cloneDeep(tempItem);
            component.user = cloneDeep(mockUser);
            component.editUserStateLicense(tempItem, 0);
            expect(component.isOnEditMode).toBe(true);
        })
        it('should check if editmode is true', () => {
            let tempItem = {
                AnesthesiaId: "AI",
                StateId: "1",
                StateLicenseNumber: "SL2"
            }
            component.isOnEditMode = true;
            component.editUserStateLicense(tempItem, 0);
            expect(component.isOnEditMode).toBe(true);
        })
    });
    describe('persistUpdateStateLicense', () => {
        it('should persist the updated state license', () => {
            const mockItem = {
                IsEdit: true,
                ObjectState: 'original',
                StateId: 1
            };
            component.originalStateLicenseCode = 2;
            component.states = [{ StateId: 1, Disabled: true, Abbreviation: 'CA' }, { StateId: 2, Disabled: false, Abbreviation: 'CA' }, { StateId: 3, Disabled: false, Abbreviation: 'CA' }];
            component.persistUpdateStateLicense(mockItem);
            expect(component.validateForm).toBe(true);
            expect(component.isOnEditMode).toBe(false);
            expect(mockItem.IsEdit).toBe(false);
            expect(mockItem.ObjectState).toBe(component.saveState.Update);
            expect(component.states[0].Disabled).toBe(false);
            expect(component.states[1].Disabled).toBe(false);
            expect(component.states[2].Disabled).toBe(false);

        });

        it('should not persist the updated state license if form is invalid', () => {
            let mockItem = {
                IsEdit: true,
                ObjectState: 'original',
                StateId: 1
            };
            spyOn(component, "clearUserStateLicense");
            spyOn(component, "sendUpdateLicense");
            component.originalStateLicenseCode = 2;
            component.states = [{ StateId: 1, Disabled: true, Abbreviation: 'CA' }, { StateId: 2, Disabled: false, Abbreviation: 'CA' }, { StateId: 3, Disabled: false, Abbreviation: 'CA' }];
            component.persistUpdateStateLicense(mockItem);
            expect(component.validateForm).toBe(true);
            expect(component.isOnEditMode).toBe(false);
            expect(component.states[0].Disabled).toBe(false);
            expect(component.states[1].Disabled).toBe(false);
            expect(component.states[2].Disabled).toBe(false);
        });
    });
    describe('discardChangesStateLicense -->', () => {
        it('should call discardChangesStateLicense to reset the values', () => {
            component.originalValue = cloneDeep(mockResultItem);
            component.discardChangesStateLicense(mockResultItem);
            expect(component.isOnEditMode).toBe(false);
            expect(mockResultItem.IsEdit).toBe(false);
            expect(mockResultItem.StateId).toBe(component.originalValue.StateId);
            expect(mockResultItem.StateLicenseNumber).toBe(component.originalValue.StateLicenseNumber);
            expect(mockResultItem.StateAbbreviation).toBe(component.originalValue.StateAbbreviation);
            expect(mockResultItem.AnesthesiaId).toBe(component.originalValue.AnesthesiaId);
        })
    });
    describe('removeUserStateLicense', () => {
        it('should remove user state license and disable state if it exists', () => {
            const item = {
                ObjectState: 'Add',
                StateId: 123,
                StateAbbreviation: 'CA'
            };
            const state = {
                Abbreviation: "CA",
                StateId: 123,
                Disabled: true,
            };
            const sendUpdateLicenseSpy = spyOn(component, 'sendUpdateLicense');
            component.UserStateLicenses = [item];
            component.states = [state];
            component.removeUserStateLicense(item);
            expect(item.ObjectState).toEqual(mockSaveStates.Delete);
            expect(component.UserStateLicenses).not.toContain(item);
            expect(state.Disabled).toBe(false);
            expect(sendUpdateLicenseSpy).toHaveBeenCalled();
        });
        it('should remove newly added user state license if it does not exist', () => {
            const item = {
                ObjectState: 'Add',
                StateId: 123,
                StateAbbreviation: 'CA'
            };

            const sendUpdateLicenseSpy = spyOn(component, 'sendUpdateLicense');
            component.UserStateLicenses = [];
            component.states = [];
            component.removeUserStateLicense(item);
            expect(item.ObjectState).toEqual(mockSaveStates.Delete);
            expect(component.UserStateLicenses).not.toContain(item);
            expect(component.sendUpdateLicense).toHaveBeenCalled();
        });
        it('should not remove user state license if it does not exist', () => {
            const item = {
                ObjectState: 'Add',
                StateId: 123,
                StateAbbreviation: 'CA'
            };
            component.UserStateLicenses = [];
            component.states = [];
            const sendUpdateLicenseSpy = spyOn(component, 'sendUpdateLicense');
            component.removeUserStateLicense(item);
            expect(item.ObjectState).toEqual(mockSaveStates.Delete);
            expect(component.UserStateLicenses).not.toContain(item);
            expect(sendUpdateLicenseSpy).toHaveBeenCalled();
        });
    });
    describe('clearUserStateLicense -->', () => {
        it('clearUserStateLicense should reset the values', () => {
            component.clearUserStateLicense();
            expect(component.NewUserStateLicense.Flag).toBe(1);
            expect(component.NewUserStateLicense.StateId).toBe(0);
            expect(component.NewUserStateLicense.StateLicenseNumber).toBe("");
            expect(component.NewUserStateLicense.AnesthesiaId).toBe("");
            expect(component.isAdding).toBe(false);
        })
    });
    describe('sendUpdateLicense ->', () => {
        beforeEach(() => {
            const mockStateLicenseData = jasmine.createSpyObj('mockStateLicenseData', ['emit']);
            component.StateLicenseData = mockStateLicenseData;
        });
        it('should emit UserStateLicenses array', () => {
            component.sendUpdateLicense();
            expect(component.StateLicenseData.emit).toHaveBeenCalledWith(component.UserStateLicenses);
        });
    });

    describe('sendUpdatedLicensesToValidate ->', () => {
        beforeEach(() => {
            const mockSendLicensesToValidate = jasmine.createSpyObj('mockSendLicensesToValidate', ['emit']);
            component.sendLicensesToValidate = mockSendLicensesToValidate;
        });
        it('should call emit method of sendLicensesToValidate with UserStateLicenses array', () => {
            component.sendUpdatedLicensesToValidate();
            expect(component.sendLicensesToValidate.emit).toHaveBeenCalledWith(component.UserStateLicenses);
        });
    });

    describe('clearStateDropdownValidation -->', () => {
        it('clearStateDropdownValidation should reset the values of stateLicenseNumber and anesthesiaId', () => {
            stateIdentificationFormGroup = component.fb.group({
                state: 1,
                stateLicenseNumber: '123456',
                anesthesiaId: 'A123'
            });
            component.stateIdentificationFormGroup = stateIdentificationFormGroup;
            component.clearStateDropdownValidation();
            expect(component.validateForm).toBe(false);
        })
    });

    describe('ngOnDestroy -->', () => {
        it('should close subscription on destroy', () => {
            component.formSubscription = Object.assign(mockSubscription);
            component.ngOnDestroy();
            expect(component.formSubscription.closed).toBe(true);
        })
    });
});

