import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { ReferralSourcesComponent } from './referral-sources.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

let mockReferralSource;
let mockPatientReferralSource;
let mockReferralSourcesService;
let mockAuthZ;
let mockLocation;
let mockInjector;
let mockConfirmationModalSubscription;
let mockConfirmationModalService;
let mockPatSecurityService;
let mockToastrFactory;
let mockLocalizeService;

describe('ReferralSourcesComponent', () => {
    let component: ReferralSourcesComponent;
    let fixture: ComponentFixture<ReferralSourcesComponent>;

    beforeEach(() => {
        mockReferralSource = [{
            DataTag: "AAAAAAAeViY=",
            DateModified: "2022-12-02T18:17:12.0823269Z",
            PatientReferralSourceId: "56ba7f4d-25fe-4a64-96f0-15b444967efe",
            SourceName: "refsrc1",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
        }]

        mockPatientReferralSource = [{
            AddressReferrerId: null,
            DateOfBirth: "2022-10-03T00:00:00",
            FirstName: "testtest",
            IsActive: true,
            IsActiveAccountMember: false,
            IsPatient: true,
            IsResponsiblePerson: false,
            IsRxRegistered: false,
            LastName: "11",
            MiddleName: "1",
            PatientCode: "TE1",
            PatientId: "c6ea3acb-1a8c-40b5-9cfc-ebcc37349392",
            PhoneNumber: null,
            PreferredName: "12",
            PrimaryDuplicatePatientId: null,
            RelationshipToPolicyHolder: null,
            SuffixName: "",
            PatientReferralSourceId: "56ba7f4d-25fe-4a64-96f0-15b444967efe",
        }]

        mockReferralSourcesService = {
            get: jasmine.createSpy().and.callFake(() => {
                return { Value: mockReferralSource };
            }),
            save: (referralSource) => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ Value: referralSource }),
                                error({
                                    data: {
                                        InvalidProperties: [{
                                            PropertyName: "SourceName",
                                            ValidationMessage: "Not Allowed"
                                        }]
                                    }
                                })
                        }
                    }
                }
            },
            update: (referralSource) => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ Value: referralSource }),
                                error({
                                    data: {
                                        InvalidProperties: [{
                                            PropertyName: "SourceName",
                                            ValidationMessage: "Not Allowed"
                                        }]
                                    }
                                })
                        }
                    }
                }
            },
            delete: (referralSource) => {
                return {
                    $promise: {
                        then: (res, error) => {
                            res({ Value: referralSource }),
                                error({

                                })
                        }
                    }
                }
            },
            patientsWithSource: (Obj) => {
                return {
                    $promise: {
                        then: (res, error) => {
                            let tempData = [];
                            tempData = mockPatientReferralSource.filter(x => x.PatientReferralSourceId == Obj.Id);
                            if (tempData) {
                                res({ Value: tempData })
                            }
                            else {
                                res(null)
                            }
                            error({
                                data: {
                                    InvalidProperties: [{
                                        PropertyName: "SourceName",
                                        ValidationMessage: "Not Allowed"
                                    }]
                                }
                            })
                        }
                    }
                }
            },
        }

        mockAuthZ = {
            generateTitleMessage: () => { return 'Not Allowed' }
        }

        mockLocation = {
            path: () => ''
        }

        mockInjector = {
            get: jasmine.createSpy().and.returnValue({
                publish: jasmine.createSpy()
            })
        }

        mockConfirmationModalSubscription = {
            subscribe: jasmine.createSpy(),
            unsubscribe: jasmine.createSpy(),
            _subscriptions: jasmine.createSpy(),
            _parentOrParents: jasmine.createSpy(),
            close: jasmine.createSpy(),
        };

        mockConfirmationModalService = {
            open: jasmine.createSpy().and.returnValue({
                events: {
                    pipe: jasmine.createSpy().and.returnValue({
                        type: "confirm",
                        subscribe: (success) => {
                            success({ type: "confirm" })
                        },
                        filter: (f) => { return f }
                    }),
                },
                close: jasmine.createSpy(),
            }),
        };

        mockPatSecurityService = {
            IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
            generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
        };

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
        };

        mockLocalizeService = {
            getLocalizedString: () => 'translated text'
        };

        TestBed.configureTestingModule({
            declarations: [ReferralSourcesComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'ReferralSourcesService', useValue: mockReferralSourcesService },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'AuthZService', useValue: mockAuthZ },
                { provide: '$location', useValue: mockLocation },
                { provide: '$injector', useValue: mockInjector },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });


    beforeEach(() => {
        fixture = TestBed.createComponent(ReferralSourcesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.referralSources = mockReferralSource;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit -->', () => {
        it('should call all methods under ngOnInit', () => {
            spyOn(component, 'authAccess');
            spyOn(component, 'getPageNavigation');
            spyOn(component, 'initKendoColumns');
            spyOn(component, 'getReferralSources');
            component.ngOnInit();
            expect(component.authAccess).toHaveBeenCalled();
            expect(component.getPageNavigation).toHaveBeenCalled();
            expect(component.initKendoColumns).toHaveBeenCalled();
            expect(component.getReferralSources).toHaveBeenCalled();
        })
    })

    describe('authAccess -->', () => {
        it('should display toast error msg and redirect to home page if not unAuthorized', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.authAccess();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
        it('should set authAccess for CRUD operations', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.authAccess();
            expect(component.hasCreateAccess).toBe(true);
            expect(component.hasEditAccess).toBe(true);
            expect(component.hasDeleteAccess).toBe(true);
        })
    })

    describe('broadcastChannel -->', () => {
        it('should call broadcastChannel method', () => {
            component.broadcastChannel('referralSources', { mode: 'add', data: mockReferralSource });
            expect(mockInjector.get).toHaveBeenCalled();
        })
    })

    describe('getReferralSources -->', () => {
        it('should call referralSourcesGetSuccess', () => {
            spyOn(component, 'updateReferralSourcesAccessRights');
            component.referralSourcesGetSuccess({ Value: mockReferralSource });
            expect(component.loading).toBe(false);
            expect(component.updateReferralSourcesAccessRights).toHaveBeenCalled();
        })

        it('should call referralSourcesGetFailure', () => {
            component.referralSourcesGetFailure();
            expect(component.loading).toBe(false);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })

    describe('updateReferralSourcesAccessRights -->', () => {
        it('should check updateDeleteRightsViewModel & updateEditRightsViewModel on updateReferralSourcesAccessRights', () => {
            spyOn(component, 'updateEditRightsViewModel');
            spyOn(component, 'updateDeleteRightsViewModel');
            component.referralSources = mockReferralSource;
            component.updateReferralSourcesAccessRights();
            expect(component.updateEditRightsViewModel).toHaveBeenCalled();
            expect(component.updateDeleteRightsViewModel).toHaveBeenCalled();
        })

        it('should set disableDelete is true for unautherized login', () => {
            component.hasDeleteAccess = false;
            component.referralSources = mockReferralSource;
            component.updateReferralSourcesAccessRights();
            expect(component.referralSources[0]["disableDelete"]).toBe(true);

        })

        it('should set disableDelete is false for autherized login', () => {
            component.hasDeleteAccess = true;
            component.referralSources = mockReferralSource;
            component.updateReferralSourcesAccessRights();
            expect(component.referralSources[0]["disableDelete"]).toBe(false);
        })

        it('should set disableEdit is true for unautherized login', () => {
            component.hasEditAccess = false;
            component.referralSources = mockReferralSource;
            component.updateReferralSourcesAccessRights();
            expect(component.referralSources[0]["disableEdit"]).toBe(true);
            expect(component.referralSources[0]["editTooltipMessage"]).toEqual("Not Allowed");
        })

        it('should set disableEdit is false for autherized login', () => {
            component.hasEditAccess = true;
            component.referralSources = mockReferralSource;
            component.updateReferralSourcesAccessRights();
            expect(component.referralSources[0]["disableEdit"]).toBe(false);
        })

    })

    describe('createReferralSource -->', () => {
        it('should set formGroup', () => {
            component.createReferralSource();
            expect(component.formGroup).toBeDefined();
        })
    })

    describe('editReferralSource -->', () => {
        it('should set formGroup with edit functionality & set editMode as true', () => {
            let tempEvent = {
                action: "edit",
                dataItem: {
                    DataTag: "AAAAAAAeViY=",
                    DateModified: "2022-12-02T18:17:12.0823269Z",
                    PatientReferralSourceId: "56ba7f4d-25fe-4a64-96f0-15b444967efe",
                    SourceName: "sxz",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            component.editReferralSource(tempEvent);
            expect(component.formGroup).toBeDefined();
        })
    })

    describe('saveReferralSource -->', () => {
        it('should create new referral source when isNew=true', () => {
            spyOn(component, 'addReferralSource');
            let tempEvent = {
                action: "add",
                dataItem: {
                    DataTag: "AAAAAAAeViY=",
                    DateModified: "2022-12-02T18:17:12.0823269Z",
                    PatientReferralSourceId: "56ba7f4d-25fe-4a64-96f0-15b444967efe",
                    SourceName: "refsrc1",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            let tempPassData = {
                event: tempEvent,
                isNew: true
            }
            component.saveReferralSource(tempPassData);
            expect(component.nameLength).toEqual(tempEvent.dataItem.SourceName.length);
            expect(component.addReferralSource).toHaveBeenCalled();
        })

        it('should update referal source when isNew=false', () => {
            spyOn(component, 'updateReferralSource');
            let tempEvent = {
                action: "edit",
                dataItem: {
                    DataTag: "AAAAAAAeViY=",
                    DateModified: "2022-12-02T18:17:12.0823269Z",
                    PatientReferralSourceId: "56ba7f4d-25fe-4a64-96f0-15b444967efe",
                    SourceName: "refsrc1",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            let tempPassData = {
                event: tempEvent,
                isNew: false
            }
            component.saveReferralSource(tempPassData);
            expect(component.updateReferralSource).toHaveBeenCalled();
        })
    })



    describe('referralSourceEditWithPatientsFailure -->', () => {
        it('should show toast error on referralSourceEditWithPatientsFailure', () => {
            component.referralSourceEditWithPatientsFailure();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    describe('addReferralSource -->', () => {
        it('should not add record if unautherized to add', () => {
            let tempEvent = {
                action: "add",
                dataItem: {
                    DataTag: "AAAAAAAeVeo=",
                    DateModified: "2022-12-02T18:10:19.786773Z",
                    PatientReferralSourceId: "3b4c2281-582c-4705-926e-115e5874e283",
                    SourceName: "dec1",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            spyOn(component, 'createReferralSourceSuccess');
            spyOn(component, 'createReferralSourceError');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.addReferralSource(tempEvent);
            expect(component.createReferralSourceSuccess).not.toHaveBeenCalled();
            expect(component.createReferralSourceError).not.toHaveBeenCalled();
        })
        it('should add record if authrized to add', () => {
            let tempEvent = {
                action: "add",
                dataItem: {
                    DataTag: "AAAAAAAeVeo=",
                    DateModified: "2022-12-02T18:10:19.786773Z",
                    PatientReferralSourceId: "3b4c2281-582c-4705-926e-115e5874e283",
                    SourceName: "dec1",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            spyOn(component, 'createReferralSourceSuccess');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.addReferralSource(tempEvent);
            expect(component.createReferralSourceSuccess).toHaveBeenCalled();
        })
    })
    describe('createReferralSourceSuccess -->', () => {
        it('should show success toast message', () => {
            spyOn(component, 'broadcastChannel');
            component.createReferralSourceSuccess(mockReferralSource[0]);
            expect(component.broadcastChannel).toHaveBeenCalled();
            expect(mockToastrFactory.success).toHaveBeenCalled();
        })
    })

    describe('createReferralSourceError -->', () => {
        it('should show error toast message', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "SourceName",
                        ValidationMessage: "Not Allowed"
                    }]
                }
            }
            component.createReferralSourceError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })

        it('should show error toast message if length is greater than 64', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "SourceName",
                        ValidationMessage: "Referral Source cannot be longer than 64 characters"
                    }]
                }
            }
            component.nameLength = 66;
            component.createReferralSourceError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })
    describe('updateReferralSource -->', () => {
        it('should not update record if unautherized to edit', () => {
            let tempEvent = {
                action: "edit",
                dataItem: {
                    DataTag: "AAAAAAAeVeo=",
                    DateModified: "2022-12-02T18:10:19.786773Z",
                    PatientReferralSourceId: "3b4c2281-582c-4705-926e-115e5874e283",
                    SourceName: "dec1",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            spyOn(component, 'updateReferralSourceSuccess');
            spyOn(component, 'updateReferralSourceError');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.hasEditAccess = false;
            component.updateReferralSource(tempEvent);
            expect(component.updateReferralSourceSuccess).not.toHaveBeenCalled();
            expect(component.updateReferralSourceError).not.toHaveBeenCalled();
        })
        it('should update record if authrized to edit', () => {
            let tempEvent = {
                action: "edit",
                dataItem: {
                    DataTag: "AAAAAAAeVeo=",
                    DateModified: "2022-12-02T18:10:19.786773Z",
                    PatientReferralSourceId: "3b4c2281-582c-4705-926e-115e5874e283",
                    SourceName: "dec1",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            spyOn(component, 'updateReferralSourceSuccess');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.hasEditAccess = true;
            component.updateReferralSource(tempEvent);
            expect(component.updateReferralSourceSuccess).toHaveBeenCalled();
        })
    })
    describe('updateReferralSourceSuccess -->', () => {
        it('should show success toast message', () => {
            spyOn(component, 'broadcastChannel');
            component.updateReferralSourceSuccess(mockReferralSource[0]);
            expect(component.broadcastChannel).toHaveBeenCalled();
            expect(mockToastrFactory.success).toHaveBeenCalled();
        })
    })

    describe('updateReferralSourceError -->', () => {
        it('should show error toast message', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "SourceName",
                        ValidationMessage: "Not Allowed"
                    }]
                }
            }
            component.updateReferralSourceError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })

        it('should show error toast message for property name PatientReferralSource.PatientReferralSource_PracticeId_SourceName_Unique', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "PatientReferralSource.PatientReferralSource_PracticeId_SourceName_Unique",
                        ValidationMessage: "Not Allowed"
                    }]
                }
            }
            component.updateReferralSourceError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
        it('should show error toast message if length is greater than 64', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        ValidationMessage: "Referrable Source cannot be longer than 64 characters"
                    }]
                }
            }
            component.nameLength = 66;
            component.updateReferralSourceError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })

        it('should show error toast message if length is greater than 64', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "SourceName",
                        ValidationMessage: "Referrable Source cannot be longer than 64 characters"
                    }]
                }
            }
            component.nameLength = 66;
            component.updateReferralSourceError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })

    describe('deleteReferralSource -->', () => {
        it('should open dialog confirmation on delete button click', () => {
            let tempEvent = {
                action: "delete",
                dataItem: {
                    DataTag: "AAAAAAAeVeo=",
                    DateModified: "2022-12-02T18:10:19.786773Z",
                    PatientReferralSourceId: "3b4c2281-582c-4705-926e-115e5874e283",
                    SourceName: "dec1",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };

            spyOn(component, 'openDeleteConfirmationModal');
            component.deleteReferralSource(tempEvent);
            expect(component.openDeleteConfirmationModal).toHaveBeenCalled()
        })
    })

    describe('openDeleteConfirmationModal ->', () => {
        it('should open openDeleteConfirmationModal', () => {
            component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
            component.openDeleteConfirmationModal(mockReferralSource[0]);
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
            component.openDeleteConfirmationModal(mockReferralSource[0]);
        })
    })

    describe('validateDelete -->', () => {
        it('should check referralSourceWithPatients if any referral source related with any patient', () => {
            spyOn(component, 'referralSourceWithPatientsSuccess');
            component.validateDelete(mockReferralSource[0]);
            expect(component.deletingReferralSource).toBe(true);
            expect(component.checkingForPatients).toBe(true);
            expect(component.referralSourceWithPatientsSuccess).toHaveBeenCalled();
        });
    })

    describe('referralSourceWithPatientsSuccess -->', () => {
        it('should call confirmDelete method when no referral source exist with any patient', () => {
            spyOn(component, 'confirmDelete');
            let testData = mockReferralSource[0];
            testData.PatientReferralSourceId = "";
            component.validateDelete(testData);
            expect(component.confirmDelete).toHaveBeenCalled();
        })

        it('should show toast error that not able to delete if referral source exist with any patient', () => {
            let testData = mockReferralSource[0];
            testData.PatientReferralSourceId = "56ba7f4d-25fe-4a64-96f0-15b444967efe";
            component.validateDelete(testData);
            expect(component.cannotDeleteReferralSourceName).toEqual("refsrc1");
            expect(component.deletingReferralSource).toBe(false);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })

    describe('referralSourceWithPatientsFailure -->', () => {
        it('should show toast error on referralSourceWithPatientsFailure', () => {
            component.referralSourceWithPatientsFailure();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    describe('confirmDelete -->', () => {
        it('should set confirmingDelete is true and call confirmDeleteReferralSource', () => {
            spyOn(component, 'confirmDeleteReferralSource');
            component.confirmDelete();
            expect(component.confirmingDelete).toBe(true);
            expect(component.confirmDeleteReferralSource).toHaveBeenCalled();
        })
    });
    describe('deleteReferralSourceSuccess -->', () => {
        it('should not set confirmingDelete is false when unautherized to delete', () => {
            spyOn(component, 'deleteReferralSourceSuccess');
            component.hasDeleteAccess = false;
            component.confirmDelete();
            expect(component.confirmingDelete).toBe(true);
            expect(component.deleteReferralSourceSuccess).not.toHaveBeenCalled();
        })

        it('should set confirmingDelete is false and deletingReferralSource is true, also call deleteReferralSourceSuccess', () => {
            spyOn(component, 'deleteReferralSourceSuccess');
            component.hasDeleteAccess = true;
            component.confirmDelete();
            expect(component.confirmingDelete).toBe(false);
            expect(component.deleteReferralSourceSuccess).toHaveBeenCalled();
        })
    });
    describe('deleteReferralSourceSuccess -->', () => {
        it('should show success record if referral source not related with any patient group', () => {
            spyOn(component, 'updateReferralSourcesAccessRights');
            let testData = mockReferralSource[0];
            testData.PatientReferralSourceId = "";
            component.validateDelete(testData);
            expect(mockToastrFactory.success).toHaveBeenCalled();
            expect(component.deletingReferralSource).toBe(false);
            expect(component.updateReferralSourcesAccessRights).toHaveBeenCalled();
        })

        it('should not delete record if referral source is related with any patient group', () => {
            spyOn(component, 'updateReferralSourcesAccessRights');
            let testData = mockReferralSource[0];
            testData.PatientReferralSourceId = "56ba7f4d-25fe-4a64-96f0-15b444967efe";
            component.validateDelete(testData);
            expect(component.updateReferralSourcesAccessRights).not.toHaveBeenCalled();
        })
    });
    describe('deleteReferralSourceFailure -->', () => {
        it('should show toast error', () => {
            component.deleteReferralSourceFailure();
            expect(mockToastrFactory.error).toHaveBeenCalled();
            expect(component.deletingReferralSource).toBe(false);
        })
    });

    describe('cancelDelete -->', () => {
        it('should call cancelDelete', () => {
            component.cancelDelete();
            expect(component.confirmingDelete).toBe(false);
            expect(component.checkingForPatients).toBe(false);
        })
    });

});
