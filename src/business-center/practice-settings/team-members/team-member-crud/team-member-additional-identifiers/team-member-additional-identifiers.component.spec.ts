import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TeamMemberIdentifierService } from 'src/@shared/providers/team-member-identifier.service';
import { User } from '../../team-member';
import { TeamMemberAdditionalIdentifiersComponent } from './team-member-additional-identifiers.component';

describe('TeamMemberAdditionalIdentifiersComponent', () => {
    let component: TeamMemberAdditionalIdentifiersComponent;
    let fixture: ComponentFixture<TeamMemberAdditionalIdentifiersComponent>;

    let mockLocalizeService;
    let mockPracticeService;
    let mockUserServices;
    let userLocationsSetupFactory;
    let mockTeamMemberIdentifierService;
    let mockFeatureService;
    let mockToastrFactory;
    let mockUser: User;

    beforeEach(async () => {
        mockLocalizeService = {
            getLocalizedString: () => 'translated text'
        }
        mockPracticeService = {
            getCurrentPractice: jasmine.createSpy().and.returnValue({ id: '1234' })
        }

        mockUserServices = {

            AdditionalIdentifiers: {
                getAllAdditionalIdentifiers: (res) => {
                    return {
                        $promise: {
                            then: (res, error) => {
                                res({ Value: [] }),
                                    error({
                                        data: {

                                        }
                                    })
                            }
                        }
                    }
                },
                create: (res) => {
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
                },
                update: (res) => {
                    return {
                        then: (res, error) => {
                            res({ Value: [] }),
                                error({
                                    data: {

                                    }
                                })
                        }
                    }
                }

            },

        };

        userLocationsSetupFactory = {
            SaveUserLocationSetups: jasmine.createSpy().and.returnValue({
                then: jasmine.createSpy().and.returnValue({})
            }),
        };

        mockTeamMemberIdentifierService = {
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

        mockFeatureService = {
            isEnabled: jasmine.createSpy().and.returnValue({ then: jasmine.createSpy().and.returnValue(false) })
        };

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
        };
        mockUser = {
            UserId: '1',
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
        }

        await TestBed.configureTestingModule({
            declarations: [TeamMemberAdditionalIdentifiersComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'practiceService', useValue: mockPracticeService },
                { provide: 'UserServices', useValue: mockUserServices },
                { provide: 'FeatureService', useValue: mockFeatureService },
                { provide: 'UserLocationsSetupFactory', useValue: userLocationsSetupFactory },
                { provide: 'EnterpriseSettingService', useValue: {} },
                { provide: TeamMemberIdentifierService, useValue: mockTeamMemberIdentifierService }
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TeamMemberAdditionalIdentifiersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('masterAdditionalIdentifersGetSuccess -->', () => {
        it('should get masterAdditionalIdentifers', () => {
            let response = {
                Value: [{
                    "DataTag": "AAAAAAAh9ZA=",
                    "DateDeleted": null,
                    "DateModified": "2023-03-07T09:15:51.3743289",
                    "Description": "Description_melsemtubn",
                    "MasterUserIdentifierId": 279,
                    "Qualifier": null,
                    "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf"
                }]
            };
            component.getAdditionalIdenfiers = jasmine.createSpy();
            component.masterAdditionalIdentifersGetSuccess(response);
            expect(component.getAdditionalIdenfiers).toHaveBeenCalled();
        });
    })
    describe('additionalIdentifiersGetFailure -->', () => {
        it('should show additionalIdentifiersGetFailure error', () => {

            component.additionalIdentifiersGetFailure()
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    })
    describe('masterAdditionalIdentifiersGetFailure  -->', () => {
        it('should show masterAdditionalIdentifiersGetFailure  error', () => {

            component.masterAdditionalIdentifiersGetFailure()
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    })
    describe('getAdditionalIdenfiers when user is not found -->', () => {
        it('should when user is not found', () => {
            component.user = null;
            component.masterAdditionalIdentifiers = [{
                "DataTag": "AAAAAAAh9ZA=",
                "DateDeleted": null,
                "Description": "Description_melsemtubn",
                "Qualifier": null,
                "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf"
            }]
            component.getAdditionalIdenfiers()
            expect(component.masterAdditionalIdentifiers[0].UserId).toBe("");
            expect(component.masterAdditionalIdentifiers[0].Value).toBe("");
            expect(component.masterAdditionalIdentifiers[0].UserIdentifierId).toBe("");
        });
    })


    describe('getAdditionalIdenfiers no response-->', () => {
        it('should get getAdditionalIdenfiers', () => {

            component.user = mockUser
            let response = {
                Value: {
                    isEmpty: true
                },
            }

            component.masterAdditionalIdentifiers = [{
                "DataTag": "AAAAAAAh9ZA=",
                "DateDeleted": null,
                "Description": "Description_melsemtubn",
                "Qualifier": null,
                "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf"
            }]
            component.additionalIdentifersGetSuccess(response)
            expect(component.masterAdditionalIdentifiers[0].UserId).toBe("");
            expect(component.masterAdditionalIdentifiers[0].Value).toBe("");
            expect(component.masterAdditionalIdentifiers[0].UserIdentifierId).toBe("");
        });
    })
    describe('getAdditionalIdenfiers -->', () => {
        it('should get getAdditionalIdenfiers', () => {

            component.user = mockUser
            component.user.UserId = "123"
            component.masterAdditionalIdentifiers = [{
                "DataTag": "AAAAAAAh9ZA=",
                "DateDeleted": null,
                "Description": "Description_melsemtubn",
                "Qualifier": null,
                "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf"
            }]
            component.getAdditionalIdenfiers()
            expect(component.masterAdditionalIdentifiers[0].UserId).toBe("");
            expect(component.masterAdditionalIdentifiers[0].Value).toBe("");
            expect(component.masterAdditionalIdentifiers[0].UserIdentifierId).toBe("");
        });
    })
    describe('update  master AdditionalIdenfiers from AdditionalIdenfiers-->', () => {
        it('should upade  master AdditionalIdenfiers', () => {
            component.user = mockUser
            let response = {
                Value: [{
                    "DataTag": "AAAAAAAh9ZA=",
                    "DateDeleted": null,
                    "Description": "Description_melsemtubn",
                    "Qualifier": null,
                    "Value": "123",
                    "MasterUserIdentifierId": "123",
                    "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf"
                }],
            }
            component.masterAdditionalIdentifiers = [{
                "DataTag": "AAAAAAAh9ZA=",
                "DateDeleted": null,
                "MasterUserIdentifierId": "123",
                "Description": "Description_melsemtubn",
                "Qualifier": null,
                "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf"
            }]
            component.additionalIdentifersGetSuccess(response)
            expect(component.masterAdditionalIdentifiers.length).toBe(1);
        });
    })

    describe('Add  AdditionalIdenfiers to user-->', () => {
        it('should add AdditionalIdenfiers', () => {
            component.user = mockUser
            component.masterAdditionalIdentifiers = [{
                "DataTag": "AAAAAAAh9ZA=",
                "DateDeleted": null,
                "MasterUserIdentifierId": "123",
                "Description": "Description_melsemtubn",
                "Qualifier": null,
                "UserIdentifierId": "",
                "Value": "test",
                "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf"
            }]
            let promise = component.saveAdditionalIdentifiers(mockUser)
            expect(promise.length).toBe(1);
        });
    })

    describe('Update  AdditionalIdenfiers to user-->', () => {
        it('should update AdditionalIdenfiers', () => {
            component.user = mockUser
            component.masterAdditionalIdentifiers = [{
                "DataTag": "AAAAAAAh9ZA=",
                "DateDeleted": null,
                "MasterUserIdentifierId": "123",
                "Description": "Description_melsemtubn",
                "Qualifier": null,
                "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf"
            }]
            component.saveAdditionalIdentifiers(mockUser)
            let promise = component.saveAdditionalIdentifiers(mockUser)
            expect(promise.length).toBe(1);
        });
    })
    describe('After save AdditionalIdenfiers-->', () => {
        it('After save  AdditionalIdenfiers', () => {
            let response = {
                Value: [{
                    "DataTag": "AAAAAAAh9ZA=",
                    "DateDeleted": null,
                    "MasterUserIdentifierId": "123",
                    "Description": "Description_melsemtubn",
                    "Qualifier": null,
                    "UserModified": "a162c864-8f50-4e84-8942-7194bc8070cf"
                }]
            }
            component.additionalIdentifersSaveSuccess(response)
            expect(component.masterAdditionalIdentifiers[0].MasterUserIdentifierId).toBe("123");
            expect(component.masterAdditionalIdentifiers[0].Description).toBe("Description_melsemtubn");
        });
    })

    describe('Save failure AdditionalIdenfiers-->', () => {
        it('save  failure AdditionalIdenfiers', () => {
            component.additionalIdentifersSaveFailure()
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    })
});
