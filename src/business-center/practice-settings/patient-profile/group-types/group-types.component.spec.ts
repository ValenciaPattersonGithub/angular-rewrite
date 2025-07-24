import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationModalService } from '../../../../@shared/components/confirmation-modal/confirmation-modal.service';
import { GroupTypesComponent } from './group-types.component';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { GroupType } from './group-type';
import { Observable, of, throwError } from 'rxjs';
import { GroupTypeService } from 'src/@shared/providers/group-type.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';

let mockGroupType;
let mockSaveUpdateGroupAPiResponse: SoarResponse<GroupType>;
let mockGroupTypeService;
let mockAuthZ;
let mockLocation;
let mockInjector;
let mockRouteParams;
let mockConfirmationModalService;
// confirmationModal objects
let mockConfirmationModalSubscription;
let mockPatSecurityService;
let mockToastrFactory;
let mockLocalizeService;

describe('GroupTypesComponent', () => {
    let component: GroupTypesComponent;
    let fixture: ComponentFixture<GroupTypesComponent>;

    beforeEach(async () => {
        mockGroupType = [
            {
                DataTag: "AAAAAAAX5y0=",
                DateModified: "2022-11-14T16:20:37.4412041",
                GroupTypeName: "Group1",
                MasterPatientGroupId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
            },
            {
                DataTag: "AAAAAAAXwM4=",
                DateModified: "2022-11-11T14:03:28.403477",
                GroupTypeName: "Group2",
                MasterPatientGroupId: "592bd95a-6584-4148-ad30-fdcc1cf2aa20",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
            }
        ]

        mockSaveUpdateGroupAPiResponse = {
            ExtendedStatusCode: null,
            InvalidProperties: [],
            Value:
            {
                DataTag: "AAAAAAAX5y0=",
                DateModified: "2022-11-14T16:20:37.4412041",
                GroupTypeName: "Group1",
                MasterPatientGroupId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704",
                UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
            }
        }

        mockGroupTypeService = {
            save: jasmine.createSpy(),
            update: jasmine.createSpy(),
            get: jasmine.createSpy(),
            delete: jasmine.createSpy(),
            groupTypeWithPatients: jasmine.createSpy(),
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
        mockRouteParams = {}
        mockConfirmationModalService = {
            open: jasmine.createSpy().and.returnValue({
                events: {
                    //pipe: jasmine.createSpy().and.returnValue({
                    //    type: "confirm",
                    //    subscribe: (success) => {
                    //        success({ type: "confirm" })
                    //    },
                    //    filter: (f) => { return f }
                    //}),
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
        // confirmationModal objects
        mockConfirmationModalSubscription = {
            subscribe: jasmine.createSpy(),
            unsubscribe: jasmine.createSpy(),
            _subscriptions: jasmine.createSpy(),
            _parentOrParents: jasmine.createSpy(),
            close: jasmine.createSpy(),
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

        await TestBed.configureTestingModule({
            declarations: [GroupTypesComponent],
            imports: [TranslateModule.forRoot()],
            providers: [
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: GroupTypeService, useValue: mockGroupTypeService },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'AuthZService', useValue: mockAuthZ },
                { provide: '$location', useValue: mockLocation },
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: '$injector', useValue: mockInjector },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
            ],
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupTypesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.groupTypes = mockGroupType;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit -->', () => {
        it('should call all methods under ngOnInit', () => {
            spyOn(component, 'authAccess');
            spyOn(component, 'getPageNavigation');
            spyOn(component, 'initKendoColumns');
            spyOn(component, 'getGroupTypes');
            component.ngOnInit();
            expect(component.authAccess).toHaveBeenCalled();
            expect(component.getPageNavigation).toHaveBeenCalled();
            expect(component.initKendoColumns).toHaveBeenCalled();
            expect(component.getGroupTypes).toHaveBeenCalled();
        })

        it('should set showBackButton as true $routeParams.subcategory is PatientGroupTypes', () => {
            component.$routeParams.subcategory = "PatientGroupTypes";
            component.ngOnInit();
            expect(component.showBackButton).toBe(true);
        })

        it('should set showBackButton as false when $routeParams.subcategory not PatientGroupTypes', () => {
            component.$routeParams.subcategory = "";
            component.ngOnInit();
            expect(component.showBackButton).toBe(false);
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
            component.broadcastChannel('groupTypes', { mode: 'add', data: mockGroupType });
            expect(mockInjector.get).toHaveBeenCalled();
        })
    })

    describe('getGroupTypes -->', () => {
        it('should call groupTypesGetSuccess', () => {
            spyOn(component, 'updateGroupTypesAccessRights');
            component.groupTypesGetSuccess({ Value: mockGroupType });
            expect(component.loading).toBe(false);
            expect(component.updateGroupTypesAccessRights).toHaveBeenCalled();
        })

        it('should call groupTypesGetFailure', () => {
            component.groupTypesGetFailure();
            expect(component.loading).toBe(false);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })

    describe('updateGroupTypesAccessRights -->', () => {
        it('should check updateDeleteRightsViewModel & updateEditRightsViewModel on updateGroupTypesAccessRights', () => {
            spyOn(component, 'updateEditRightsViewModel');
            spyOn(component, 'updateDeleteRightsViewModel');
            component.groupTypes = mockGroupType;
            component.updateGroupTypesAccessRights();
            expect(component.updateEditRightsViewModel).toHaveBeenCalled();
            expect(component.updateDeleteRightsViewModel).toHaveBeenCalled();
        })

        it('should set disableDelete is true for unautherized login', () => {
            component.hasDeleteAccess = false;
            component.groupTypes = mockGroupType;
            component.updateGroupTypesAccessRights();
            expect(component.groupTypes[0]["disableDelete"]).toBe(true);
            expect(component.groupTypes[1]["disableDelete"]).toBe(true);

        })

        it('should set disableDelete is false for autherized login', () => {
            component.hasDeleteAccess = true;
            component.groupTypes = mockGroupType;
            component.updateGroupTypesAccessRights();
            expect(component.groupTypes[0]["disableDelete"]).toBe(false);
            expect(component.groupTypes[1]["disableDelete"]).toBe(false);
        })

        it('should set disableEdit is true for unautherized login', () => {
            component.hasEditAccess = false;
            component.groupTypes = mockGroupType;
            component.updateGroupTypesAccessRights();
            expect(component.groupTypes[0]["disableEdit"]).toBe(true);
            expect(component.groupTypes[1]["disableEdit"]).toBe(true);
            expect(component.groupTypes[0]["editTooltipMessage"]).toEqual("Not Allowed");
            expect(component.groupTypes[1]["editTooltipMessage"]).toEqual("Not Allowed");
        })

        it('should set disableEdit is false for autherized login', () => {
            component.hasEditAccess = true;
            component.groupTypes = mockGroupType;
            component.updateGroupTypesAccessRights();
            expect(component.groupTypes[0]["disableEdit"]).toBe(false);
            expect(component.groupTypes[1]["disableEdit"]).toBe(false);
        })

    });

    describe('createGroupType -->', () => {
        it('should set formGroup', () => {
            component.createGroupType();
            expect(component.formGroup).toBeDefined();
        })
    })

    describe('editGroupType -->', () => {
        it('should set formGroup with edit functionality & set editMode as true', () => {
            let tempEvent = {
                action: "edit",
                dataItem: {
                    DataTag: "AAAAAAAX5y0=",
                    DateModified: "2022-11-14T16:20:37.4412041",
                    GroupTypeName: "Group1",
                    MasterPatientGroupId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            component.editGroupType(tempEvent);
            expect(component.formGroup).toBeDefined();
            expect(component.groupTypeId).toBe("3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704");
            expect(component.editMode).toBe(true);
        })
    })

    describe('saveGroupType -->', () => {
        it('should create new group type when isNew=true', () => {
            spyOn(component, 'addGroupType');
            let tempEvent = {
                action: "add",
                dataItem: {
                    DataTag: "AAAAAAAX5y0=",
                    DateModified: "2022-11-14T16:20:37.4412041",
                    GroupTypeName: "Group1",
                    MasterPatientGroupId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            let tempPassData = {
                event: tempEvent,
                isNew: true
            }
            component.saveGroupType(tempPassData);
            expect(component.nameLength).toEqual(tempEvent.dataItem.GroupTypeName.length);
            expect(component.addGroupType).toHaveBeenCalled();
        })
        it('should update group type when isNew=false', () => {
            spyOn(component, 'updateGroupType');
            let tempEvent = {
                action: "edit",
                dataItem: {
                    DataTag: "AAAAAAAX5y0=",
                    DateModified: "2022-11-14T16:20:37.4412041",
                    GroupTypeName: "Group1",
                    MasterPatientGroupId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            let tempPassData = {
                event: tempEvent,
                isNew: false
            }
            component.saveGroupType(tempPassData);
            //   expect(component.nameLength).toEqual(tempEvent.dataItem.GroupTypeName.length);
            expect(component.updateGroupType).toHaveBeenCalled();
        })
    })

    describe('addGroupType -->', () => {
        it('should not add record if unautherized to add', () => {
            let tempEvent = {
                action: "add",
                dataItem: {
                    DataTag: "AAAAAAAX5y0=",
                    DateModified: "2022-11-14T16:20:37.4412041",
                    GroupTypeName: "Group1",
                    MasterPatientGroupId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            spyOn(component, 'createGroupTypeSuccess');
            spyOn(component, 'createGroupTypeError');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.addGroupType(tempEvent);
            expect(component.createGroupTypeSuccess).not.toHaveBeenCalled();
            expect(component.createGroupTypeError).not.toHaveBeenCalled();
        })

        it('should add record if authrized to add', () => {
            let tempEvent = {
                action: "add",
                dataItem: {
                    DataTag: "AAAAAAAX5y0=",
                    DateModified: "2022-11-14T16:20:37.4412041",
                    GroupTypeName: "Group1",
                    MasterPatientGroupId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            spyOn(component, 'createGroupTypeSuccess');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            mockGroupTypeService.save = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<GroupType>>());
            component.addGroupType(tempEvent);
            expect(mockGroupTypeService.save).toHaveBeenCalled();
        })
    })

    describe('createGroupTypeSuccess -->', () => {
        it('should show success toast message', () => {
            spyOn(component, 'broadcastChannel');
            component.createGroupTypeSuccess(mockSaveUpdateGroupAPiResponse);
            expect(component.broadcastChannel).toHaveBeenCalled();
            expect(mockToastrFactory.success).toHaveBeenCalled();
        })
    })

    describe('createGroupTypeError -->', () => {
        it('should show error toast message', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "GroupTypeName",
                        ValidationMessage: "Not Allowed"
                    }]
                }
            }
            component.createGroupTypeError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })

        it('should show error toast message if length is greater than 64', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "GroupTypeName",
                        ValidationMessage: "Group Type Name cannot be longer than 64 characters"
                    }]
                }
            }
            component.nameLength = 66;
            component.createGroupTypeError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })

    describe('updateGroupType -->', () => {
        it('should not update record if unautherized to edit', () => {
            let tempEvent = {
                action: "edit",
                dataItem: {
                    DataTag: "AAAAAAAX5y0=",
                    DateModified: "2022-11-14T16:20:37.4412041",
                    GroupTypeName: "Group1",
                    MasterPatientGroupId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            spyOn(component, 'updateGroupTypeSuccess');
            spyOn(component, 'updateGroupTypeError');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.hasEditAccess = false;
            component.updateGroupType(tempEvent);
            expect(component.updateGroupTypeSuccess).not.toHaveBeenCalled();
            expect(component.updateGroupTypeError).not.toHaveBeenCalled();
        })

        it('should update record if authrized to edit', () => {
            let tempEvent = {
                action: "edit",
                dataItem: {
                    DataTag: "AAAAAAAX5y0=",
                    DateModified: "2022-11-14T16:20:37.4412041",
                    GroupTypeName: "Group1",
                    MasterPatientGroupId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };
            spyOn(component, 'updateGroupTypeSuccess');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.hasEditAccess = true;
            mockGroupTypeService.update = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<GroupType>>());
            component.updateGroupType(tempEvent);
            expect(mockGroupTypeService.update).toHaveBeenCalled();
        })
    })

    describe('updateGroupTypeSuccess -->', () => {
        it('should show success toast message', () => {
            spyOn(component, 'broadcastChannel');
            component.updateGroupTypeSuccess(mockSaveUpdateGroupAPiResponse);
            expect(component.broadcastChannel).toHaveBeenCalled();
            expect(mockToastrFactory.success).toHaveBeenCalled();
        })
    })

    describe('updateGroupTypeError -->', () => {
        it('should show error toast message', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "GroupTypeName",
                        ValidationMessage: "Not Allowed"
                    }]
                }
            }
            component.updateGroupTypeError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })

        it('should show error toast message for property name MasterPatientGroup.MasterPatientGroup_PracticeId_GroupTypeName_Unique', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "MasterPatientGroup.MasterPatientGroup_PracticeId_GroupTypeName_Unique",
                        ValidationMessage: "Not Allowed"
                    }]
                }
            }
            component.updateGroupTypeError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })


        it('should show error toast message if length is greater than 64', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        ValidationMessage: "Group Type Name cannot be longer than 64 characters"
                    }]
                }
            }
            component.nameLength = 66;
            component.updateGroupTypeError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })

        it('should show error toast message if length is greater than 64', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "GroupTypeName",
                        ValidationMessage: "Group Type Name cannot be longer than 64 characters"
                    }]
                }
            }
            component.nameLength = 66;
            component.updateGroupTypeError(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })

    describe('deleteGroupType -->', () => {
        it('should open dialog confirmation on delete button click', () => {
            let tempEvent = {
                action: "delete",
                dataItem: {
                    DataTag: "AAAAAAAX5y0=",
                    DateModified: "2022-11-14T16:20:37.4412041",
                    GroupTypeName: "Group1",
                    MasterPatientGroupId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704",
                    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
                },
                rowIndex: 0
            };

            spyOn(component, 'openDeleteConfirmationModal');
            component.deleteGroupType(tempEvent);
            expect(component.openDeleteConfirmationModal).toHaveBeenCalled()
        })
    })
    // NG15CLEANUP  can fix incrementally after merge to DEV
    // no expectation
    describe('openDeleteConfirmationModal ->', () => {
        it('should open openDeleteConfirmationModal', () => {
            component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
            component.openDeleteConfirmationModal(mockGroupType[0]);
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
            component.openDeleteConfirmationModal(mockGroupType[0]);
        })
    });

    describe('validateDelete -->', () => {
        it('should check groupTypeWithPatients if any group type related with any patient', () => {
            spyOn(component, 'groupTypeWithPatientsSuccess');
            mockGroupTypeService.groupTypeWithPatients = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<GroupType>>());
            mockGroupTypeService.groupTypeWithPatients("3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704");
            expect(component.groupTypeWithPatientsSuccess).not.toHaveBeenCalled();
        });
    })

    describe('groupTypeWithPatientsSuccess -->', () => {
        it('should call confirmDelete method when not group exist with any patient', () => {
            spyOn(component, 'confirmDelete');
            mockGroupTypeService.groupTypeWithPatients = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<GroupType>>());
            let testData = mockGroupType[1];
            testData.MasterPatientGroupId = "";
            component.validateDelete(testData);
            expect(mockGroupTypeService.groupTypeWithPatients).toHaveBeenCalled();
        })

        it('should show toast error that not able to delete if group exist with any patient', () => {
            let testData = mockGroupType[0];
            testData.MasterPatientGroupId = "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704";
            mockGroupTypeService.groupTypeWithPatients = jasmine.createSpy().and.returnValue(throwError(() => new Error('test error')));
            component.validateDelete(testData);
            expect(component.deletingGroupType).toBe(true);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });
    })

    describe('groupTypeWithPatientsFailure -->', () => {
        it('should show toast error on groupTypeWithPatientsFailure', () => {
            component.groupTypeWithPatientsFailure();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    });

    describe('confirmDelete -->', () => {
        it('should set confirmingDelete is true and call confirmDeleteGroupType', () => {
            spyOn(component, 'confirmDeleteGroupType');
            component.confirmDelete();
            expect(component.confirmingDelete).toBe(true);
            expect(component.confirmDeleteGroupType).toHaveBeenCalled();
        })
    });

    describe('confirmDeleteGroupType -->', () => {
        it('should not set confirmingDelete is false when unautherized to delete', () => {
            spyOn(component, 'deleteGroupTypeSuccess');
            component.hasDeleteAccess = false;
            component.confirmDelete();
            expect(component.confirmingDelete).toBe(true);
            expect(component.deleteGroupTypeSuccess).not.toHaveBeenCalled();
        })

        it('should set confirmingDelete is false and deletingGroupType is true, also call deleteGroupTypeSuccess', () => {
            spyOn(component, 'deleteGroupTypeSuccess');
            mockGroupTypeService.delete = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<GroupType>>());
            component.hasDeleteAccess = true;
            component.confirmDelete();
            expect(component.confirmingDelete).toBe(false);
            expect(mockGroupTypeService.delete).toHaveBeenCalled();
        })
    });

    describe('deleteGroupTypeSuccess -->', () => {
        it('should show success record if group type not related with any patient group', () => {
            spyOn(component, 'updateGroupTypesAccessRights');
            mockGroupTypeService.groupTypeWithPatients = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<GroupType>>());
            let testData = mockGroupType[1];
            testData.MasterPatientGroupId = "";
            component.validateDelete(testData);
            expect(mockGroupTypeService.groupTypeWithPatients).toHaveBeenCalled();
            expect(component.deletingGroupType).toBe(true);
        })

        it('should not delete record if group type is related with any patient group', () => {
            spyOn(component, 'updateGroupTypesAccessRights');
            let testData = mockGroupType[0];
            testData.MasterPatientGroupId = "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704";
            component.validateDelete(testData);
            expect(component.updateGroupTypesAccessRights).not.toHaveBeenCalled();
        })
    });

    describe('deleteGroupTypeFailure -->', () => {
        it('should show toast error', () => {
            component.deleteGroupTypeFailure();
            expect(mockToastrFactory.error).toHaveBeenCalled();
            expect(component.deletingGroupType).toBe(false);
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
