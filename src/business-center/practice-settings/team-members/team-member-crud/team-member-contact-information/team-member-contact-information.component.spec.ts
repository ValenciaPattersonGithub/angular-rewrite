import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Address } from 'src/patient/common/models/address.model';
import { TeamMemberContactInformationComponent } from './team-member-contact-information.component';
import { User } from '../../team-member';
import cloneDeep from 'lodash/cloneDeep';
import { OrderByPipe } from 'src/@shared/pipes';
import { Component, ViewChild } from '@angular/core';
import { PhoneInfoComponent } from 'src/@shared/components/phone-info/phone-info.component';
import { configureTestSuite } from 'src/configure-test-suite';

@Component({
    template: `
                <phone-info #child></phone-info>
               `
})

class Test {
    @ViewChild('PhoneInfoComponent') child;
}

let mockUser: User = {
    UserId: '1111',
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
    $$locations: []
};

let mockPhones = [
    {
        CanAddNew: false,
        ContactId: "6d9af825-3633-40b7-9b88-94693ae438dd",
        IsPrimary: false,
        NewlyAdded: true,
        Notes: null,
        ObjectState: "Delete",
        PatientInfo: null,
        PhoneNumber: "1111111111",
        ReminderOK: true,
        TextOk: true,
        Type: "Work",
        UserId: "bd61b836-a897-498c-8d6f-db13ddb72f48",
        duplicateNumber: false
    },
    {
        CanAddNew: false,
        ContactId: "6d9af825-3633-40b7-9b88-94693ae438d8",
        IsPrimary: false,
        NewlyAdded: true,
        Notes: null,
        ObjectState: "None",
        PatientInfo: null,
        PhoneNumber: "2222222222",
        ReminderOK: true,
        TextOk: true,
        Type: "Home",
        UserId: "bd61b836-a897-498c-8d6f-db13ddb72f48",
        duplicateNumber: false
    },
    {
        CanAddNew: false,
        ContactId: "6d9af825-3633-40b7-9b88-94693ae438d9",
        IsPrimary: false,
        NewlyAdded: true,
        Notes: null,
        ObjectState: "Successful",
        PatientInfo: null,
        PhoneNumber: "2222222222",
        ReminderOK: true,
        TextOk: true,
        Type: "Home",
        UserId: "bd61b836-a897-498c-8d6f-db13ddb72f48",
        duplicateNumber: false
    }
];

let mockPhone = [{
    CanAddNew: false,
    ContactId: "6d9af825-3633-40b7-9b88-94693ae438d8",
    IsPrimary: false,
    NewlyAdded: true,
    Notes: null,
    ObjectState: "Delete",
    PatientInfo: null,
    PhoneNumber: "2222222222",
    ReminderOK: true,
    TextOk: true,
    Type: "Home",
    UserId: "bd61b836-a897-498c-8d6f-db13ddb72f48",
    duplicateNumber: false
}];

let mockPhoneSuccess = {
    Value: [
        {
            CanAddNew: false,
            ContactId: "6d9af825-3633-40b7-9b88-94693ae438d8",
            IsPrimary: false,
            NewlyAdded: true,
            Notes: null,
            ObjectState: "Successful",
            PatientInfo: null,
            PhoneNumber: "2222222222",
            ReminderOK: true,
            TextOk: true,
            Type: "Home",
            UserId: "bd61b836-a897-498c-8d6f-db13ddb72f48",
            duplicateNumber: false
        }
    ]
};

let mockContacts = {
    Value: [
        {
            UserId: "a505eb6b-3645-4254-b7c9-b3d2db912e82",
            ContactId: "6d9af825-3633-40b7-9b88-94693ae438dd",
            PhoneNumber: "7777777777",
            Type: "Mobile",
            TextOk: true,
            Notes: null,
            OrderColumn: 0,
            ObjectState: null,
            FailedMessage: null,
            DataTag: "AAAAAAAi4bI=",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            DateModified: "2023-03-17T11:52:03.8295054"
        }
    ]
};

let mockLocalizeService = {
    getLocalizedString: () => 'translated text'
};

let rootScope = {
    $broadcast: jasmine.createSpy('user updated')
}

let mockUserServices = {

    Users: {
        update: jasmine.createSpy().and.returnValue({ Value: { UserId: '1234' } }),
        save: jasmine.createSpy().and.returnValue({ $promise: { then: jasmine.createSpy() } })
    },
    Contacts: {
        get: () => {
            return {
                $promise: {
                    then: (res, error) => {
                        res({ Value: mockContacts }),
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
        save: () => {
            return {
                then: (res, error) => {
                    res({ Value: mockContacts }),
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
let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};

let mockAddress: Address = { AddressLine1: 'AddressLine1', AddressLine2: null, City: 'City', State: 'State', ZipCode: 'ZipCode' };

const mockStaticDataService = {
    PhoneTypes: () => new Promise((resolve, reject) => {
    })
};

let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
};

let mockSubscription = {
    unsubscribe: jasmine.createSpy(),
    closed: true
};

let mockSaveStates = {
    None: 'None',
    Delete: 'Delete',
    Successful: 'Successful'
};

describe('ContactInformationComponent', () => {
    let component: TeamMemberContactInformationComponent;
    let fixture: ComponentFixture<TeamMemberContactInformationComponent>;
    let childFixture: ComponentFixture<PhoneInfoComponent>;
    let childComponent: PhoneInfoComponent;
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            declarations: [TeamMemberContactInformationComponent, PhoneInfoComponent, OrderByPipe],
            imports: [TranslateModule.forRoot(), ReactiveFormsModule, FormsModule],
            providers: [
                FormBuilder,
                { provide: "localize", useValue: mockLocalizeService },
                { provide: "toastrFactory", useValue: mockToastrFactory },
                { provide: "UserServices", useValue: mockUserServices },
                { provide: "SaveStates", useValue: mockSaveStates },                
                { provide: "$rootScope", useValue: rootScope },
                { provide: 'StaticData', useValue: mockStaticDataService },
                { provide: 'patSecurityService', useValue: mockPatSecurityService }
            ]
        });
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TeamMemberContactInformationComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TeamMemberContactInformationComponent);
        component = fixture.componentInstance;
        //child component PhoneInfoComponent 
        childFixture = TestBed.createComponent(PhoneInfoComponent);
        childComponent = childFixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit -->', () => {
        it('should call all methods under ngOnInit', () => {
            component.contactForm = new FormGroup({
                addressLine1: new FormControl(),
                addressLine2: new FormControl(),
                state: new FormControl(),
                city: new FormControl(),
                zip: new FormControl(),
            });
            component.rxAccessRequirements = true;
            component.address = mockAddress;
            component.ngOnInit();
            expect(component.contactForm).not.toBeUndefined();
        })
    });

    describe('getPhones -->', () => {
        it('should call getPhones', () => {
            component.user = mockUser
            component.user.UserId = "123";
            component.phones = mockPhones;
            component.getPhones();
            expect(component.phones).toBe(mockPhones);
        });
    });

    describe('userContactsGetSuccess-->', () => {
        it('should call userContactsGetSuccess with response', () => {
            component.user = mockUser
            let response = {
                Value: [{
                    "CanAddNew": false,
                    "ContactId": "6d9af825-3633-40b7-9b88-94693ae438dd",
                    "IsPrimary": false,
                    "NewlyAdded": true,
                    "Notes": null,
                    "ObjectState": "None",
                    "PatientInfo": null,
                    "PhoneNumber": "1111111111",
                    "ReminderOK": true,
                    "TextOk": true,
                    "Type": "Work",
                    "UserId": "123",
                    "duplicateNumber": false
                }],
            }
            component.phones = mockPhones;
            component.userContactsGetSuccess(response);
            expect(component.phones.length).toBe(1);
        });
    });

    describe('userContactsGetFailure -->', () => {
        it('should call getPhones failure ', () => {
            component.userContactsGetFailure();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('onstatechange -->', () => {
        it('should set selectedState as selected state ', () => {
            component.selectedState = 'CO';
            component.onstatechange('AK');
            expect(component.selectedState).toEqual('AK');
        });
    });

    describe('updateAddress -->', () => {
        it('should set address object ', () => {
            component.address = { AddressLine1: '', AddressLine2: null, City: '', State: '', ZipCode: '' }
            component.contactForm = new FormGroup({
                addressLine1: new FormControl(),
                addressLine2: new FormControl(),
                state: new FormControl(),
                city: new FormControl(),
                zip: new FormControl(),
            });
            component.contactForm.patchValue({
                addressLine1: 'A1',
                addressLine2: 'A2',
                state: 'Ak',
                city: 'C1',
                zip: '1234',
            })
            component.onUpdateAddress.emit = jasmine.createSpy();
            component.updateAddress({
                addressLine1: 'A1',
                addressLine2: 'A2',
                state: 'Ak',
                city: 'C1',
                zip: '1234'
            });
            expect(component.onUpdateAddress.emit).toHaveBeenCalled();
        });
    });

    describe('rxSettingsChanged -->', () => {
        it('should call rxSettingsChanged ', () => {
            component.checkRxPhoneValid(component.rxAccessRequirements);
            component.rxSettingsChanged(true);
            fixture.detectChanges();
            expect(component.rxAccessRequirements).toBe(true);
        });
    });

    describe('checkRxPhoneValid -->', () => {
        it('should call checkRxPhoneValid ', () => {
            const spy = spyOn(component, 'checkRxPhoneValid');
            component.phones = component.phoneInfoSetup?.phones;
            component.rxSettingsChanged(component.rxAccessRequirements);
            expect(spy).toHaveBeenCalledWith(component.rxAccessRequirements);
        });
    });

    describe('buildInstance -->', () => {
        it('should call buildInstance ', () => {
            let result = JSON.stringify(mockPhones);
            component.buildInstance(mockPhones);
            expect(component.backupPhones).toBe(result);
        });
    });

    describe('checkValidPhone -->', () => {
        it('should call checkValidPhone ', () => {
            spyOn(component, 'checkValidPhone').and.returnValue(true);
            component.checkValidPhone(mockPhone);
            expect(component.checkValidPhone).toHaveBeenCalledWith(mockPhone);
        });
    });

    describe('savePhones-->', () => {
        it('should add savePhones', () => {
            component.user = mockUser;
            component.phoneInfoSetup.phones = mockPhones;
            component.phones = mockPhone;
            component.savePhones(mockUser);
            expect(component.phones.length).toBe(3);
        });

        it('should check phonesToSend when not empty while saving phone', () => {
            let phonesToSend = mockPhones;
            component.phones = mockPhones;
            component.savePhones(mockUser);
            expect(phonesToSend.length).toBe(3);
        });

        it('ObjectState Delete', () => {
            spyOn(component, 'checkValidPhone').and.returnValue(true);
            component.checkValidPhone(mockPhone);
            component.phones = mockPhones;
            mockPhones[0].ObjectState = 'Delete';
            component.savePhones(mockUser);
            expect(component.checkValidPhone).toHaveBeenCalledWith(mockPhone);
        });

        it('should keep track of phonesToSend items while saving phone', () => {
            let phonesToSend = [];
            component.phones = mockPhones;
            component.savePhones(mockUser);
            expect(phonesToSend.length).toBe(0);
        });
    });

    describe('userContactsSaveSuccess -->', () => {

        it('After save savePhones', () => {
            let response = {
                Value: [{
                    "CanAddNew": false,
                    "ContactId": "6d9af825-3633-40b7-9b88-94693ae438dd",
                    "IsPrimary": false,
                    "NewlyAdded": true,
                    "PatientInfo": null,
                    "PhoneNumber": "1111111111",
                    "ReminderOK": true,
                    "TextOk": true,
                    "UserId": "bd61b836-a897-498c-8d6f-db13ddb72f48",
                    "duplicateNumber": false
                }]
            }
            component.phones = mockPhones;
            component.userContactsSaveSuccess(response);
            expect(component.phones[0].duplicateNumber).toBe(false);
        });
        
        it('ObjectState Successful', () => {
            component.phones = mockPhones;
            mockPhones[2].ObjectState = 'Successful';
            component.userContactsSaveSuccess(mockPhoneSuccess);
            expect(component.phones[2].ObjectState).toBe('Successful');
        });
        
    });

    describe('userContactsSaveFailure -->', () => {
        it('save failure savePhones', () => {
            component.userContactsSaveFailure();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('deletePhonesList -->', () => {
        it('should call deletePhonesList ', () => {
            component.deletedPhones = [];
            component.deletedPhones = cloneDeep(mockPhones);
            let res = mockPhone;
            component.deletePhonesList(res);
            expect(res.length).toBe(1);
        });
    });

    describe('ngOnDestroy -->', () => {
        it('should close subscription on destroy', () => {
            component.subscription = Object.assign(mockSubscription);
            component.ngOnDestroy();
            expect(component.subscription.closed).toBe(true);
        })
    });

});
