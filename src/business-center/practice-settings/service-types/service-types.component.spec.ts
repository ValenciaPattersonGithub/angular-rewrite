import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormGroup } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';

import { ServiceTypesComponent } from './service-types.component';
import { AppKendoGridComponent } from 'src/@shared/components/app-kendo-grid/app-kendo-grid.component';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { DialogContainerService, DialogRef, DialogService } from '@progress/kendo-angular-dialog';
import { ServiceTypes } from 'src/business-center/service-code/service-types';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ServiceTypesService } from './service-types.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { of } from 'rxjs';

describe('ServiceTypesComponent', () => {

    let component: ServiceTypesComponent;
    let fixture: ComponentFixture<ServiceTypesComponent>;
    let de: DebugElement;
    //#region mocks
    let mockLocalizeService;
    let mocklocation;
    let mockPatSecurityService;
    let mockServiceTypesList;
    let mockServiceTypesService;
    let mockToastrFactory;
    let mockConfirmationModalService;
    let mockFeatureFlagService;
    // confirmationModal objects
    let mockConfirmationModalSubscription;
    let mockDialogRef;
    let mockReferenceDataService;
    let mockError;
    let mockAuthzService;
    let mockColumns: { field: string, title: string, width: string, hasValidations: boolean, validation: { message: string, maxLength: string } }[];
    let mockFormGroup: FormGroup;
    let mockState;
    let mockFilters;
    //end region

    beforeEach(async () => {
        mockLocalizeService = {
            getLocalizedString: () => 'translated text'
        };

        mocklocation = {
            path: () => ''
        }

        mockPatSecurityService = {
            IsAuthorizedByAbbreviation: (AccessCode) => {
                if (AccessCode == "soar-biz-bizloc-view" || AccessCode == "soar-biz-bsvct-add" || AccessCode == "soar-biz-bsvct-delete" || AccessCode == "soar-biz-bsvct-edit") {
                    return true;
                }
                else {
                    return false;
                }

            },
            generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
        };

        mockServiceTypesList = [
            {
                ServiceTypeId: '00000000-0000-0000-0000-000000000001',
                IsSystemType: false,
                IsAssociatedWithServiceCode: false,
                Description: 'Service Type 1',
            },
            {
                ServiceTypeId: '00000000-0000-0000-0000-000000000002',
                IsSystemType: false,
                IsAssociatedWithServiceCode: false,
                Description: 'Service Type 2'
            },
            {
                ServiceTypeId: '00000000-0000-0000-0000-000000000001',
                IsSystemType: true,
                IsAssociatedWithServiceCode: false,
                Description: 'Service Type 3',
            },
            {
                ServiceTypeId: '00000000-0000-0000-0000-000000000001',
                IsSystemType: false,
                IsAssociatedWithServiceCode: true,
                Description: 'Service Type 3',
            },

        ];

        mockServiceTypesService = {
            getAll: () => of(mockServiceTypesList).toPromise(),
            save: (serviceType: ServiceTypes) => {
                return {
                    then: (res, error) => {
                        res({ Value: serviceType }),
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
            update: (serviceType: ServiceTypes) => {
                return {
                    then: (res, error) => {
                        res({ Value: serviceType }),
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
            delete: (serviceType: ServiceTypes) => {
                return {
                    then: (res) => {
                        res({ Value: serviceType })
                    }
                }
            },
        };

        mockToastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error')
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
                //subscribe: jasmine.createSpy(),
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

        mockDialogRef = {
            events: {
                pipe: jasmine.createSpy().and.returnValue({
                    subscribe: jasmine.createSpy().and.returnValue({ type: 'confirm' })
                }),
                // subscribe: jasmine.createSpy(),
                // unsubscribe: jasmine.createSpy(),
            },
            subscribe: jasmine.createSpy(),
            unsubscribe: jasmine.createSpy(),
            _subscriptions: jasmine.createSpy(),
            _parentOrParents: jasmine.createSpy(),
            close: jasmine.createSpy(),
        };

        mockReferenceDataService = {
            get: jasmine.createSpy().and.callFake(function () {
                return mockServiceTypesList;
            }),
            entityNames: {
                serviceTypes: 'serviceTypes'
            },
            forceEntityExecution: jasmine.createSpy().and.returnValue([]),
        }

        mockError = {
            data: {
                InvalidProperties: [{
                    ValidationMessage: ""
                }]
            }
        }

        mockAuthzService = {
            generateTitleMessage: () => ''
        };

        mockColumns = [
            {
                field: 'Description',
                title: 'Service Type',
                width: '700',
                hasValidations: true,
                validation: {
                    message: 'Service Type Name is required.',
                    maxLength: '64'
                }
            }
        ];

        mockState = {
            skip: 0,
            sort: [
                {
                    field: "Description",
                    dir: "asc",
                }
            ],
            filter: {
                logic: "and",
                filters: [{
                    field: "Description",
                    operator: "contains",
                    value: ""
                }],
            }
        };

        mockFilters = [{
            field: "Description",
            operator: "contains",
            value: ""
        }];

        mockFeatureFlagService = {
            getOnce$: jasmine.createSpy().and.returnValue(of(false))
        };

        await TestBed.configureTestingModule({
            declarations: [ServiceTypesComponent, AppKendoGridComponent],
            imports: [TranslateModule.forRoot(), GridModule, HttpClientTestingModule],
            providers: [DialogService, DialogContainerService,
                { provide: DialogRef, useValue: mockDialogRef },
                { provide: '$location', useValue: mocklocation },
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: ServiceTypesService, useValue: mockServiceTypesService },
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: 'AuthZService', useValue: mockAuthzService },
                { provide: 'SoarConfig', useValue: {} },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ServiceTypesComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        component.columns = mockColumns;
        component.formGroup = mockFormGroup;
        component.serviceTypes = mockServiceTypesList;
        component.state = mockState;
        component.state.filter.filters = mockFilters;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit ->', () => {

        it('should call the page navigation method ', async () => {
            spyOn(component, 'getPageNavigation');
            spyOn(component, 'initKendoColumns');
            spyOn(component, 'updateServiceTypesAccessRights');
            await component.ngOnInit();

            expect(component.getPageNavigation).toHaveBeenCalled();
            expect(component.initKendoColumns).toHaveBeenCalled();
            expect(component.serviceTypes).toEqual(mockServiceTypesList);
            expect(component.updateServiceTypesAccessRights).toHaveBeenCalled();
            expect(component.loading).toBe(false);
        });

    });

    describe("initKendoColumns method -> ", () => {
        it('should initialize kendo columns', () => {
            component.initKendoColumns();

            expect(component.columns).toEqual(mockColumns);
        });
    });

    describe('authViewAccess ->', () => {
        it('should call patSecurityService.IsAuthorizedByAbbreviation with the view ', () => {
            component.authViewAccess();
            expect(component.hasViewAccess).toEqual(true);
        });
    });

    describe('authCreateAccess ->', () => {
        it('should call patSecurityService.IsAuthorizedByAbbreviation with the create ', () => {
            component.authCreateAccess();
            expect(component.hasCreateAccess).toEqual(true);
        });
    });

    describe('authEditAccess ->', () => {
        it('should call patSecurityService.IsAuthorizedByAbbreviation with the edit ', () => {
            component.authEditAccess();
            expect(component.hasEditAccess).toEqual(true);
        });
    });

    describe('authDeleteAccess ->', () => {
        it('should call patSecurityService.IsAuthorizedByAbbreviation with the delete ', () => {
            component.authDeleteAccess();
            expect(component.hasEditAccess).toEqual(true);
        });
    });

    describe('authAccess ->', () => {
        it('should be show error toast if unautherized access', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false)
            component.authAccess();
            expect(component.hasViewAccess).toBe(false);
            expect(component.hasCreateAccess).toBe(false);
            expect(component.hasDeleteAccess).toBe(false);
            expect(component.hasEditAccess).toBe(false);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        });

        it('should be authorised when the user is authorized to be on this page', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true)
            component.authAccess();
            expect(component.hasViewAccess).toEqual(true);
            expect(component.hasEditAccess).toEqual(true);
            expect(component.hasDeleteAccess).toEqual(true);
            expect(component.hasCreateAccess).toEqual(true);
        });




    });

    describe('saveServiceType method ->', () => {
        it('should add new service type if isNew is true', () => {
            spyOn(component, 'addServiceType');
            component.saveServiceType({ event: {}, isNew: true });

            expect(component.addServiceType).toHaveBeenCalled();
        });

        it('should update service type if isNew is false', () => {
            spyOn(component, 'updateServiceType');
            component.saveServiceType({ event: {}, isNew: false });

            expect(component.updateServiceType).toHaveBeenCalled();
        });
    });

    describe('If new row is added ->', () => {
        it('should call addNewServiceType method', () => {
            spyOn(component, 'addNewServiceType');
            const kendoGridComponent = de.query(By.directive(AppKendoGridComponent));
            const cmp = kendoGridComponent.componentInstance;

            cmp.addNewItem.emit();

            expect(component.addNewServiceType).toHaveBeenCalled();
        });
    });

    describe('If clicked on edit icon ->', () => {
        it('should call editServiceType method', () => {
            spyOn(component, 'editServiceType');
            const kendoGridComponent = de.query(By.directive(AppKendoGridComponent));
            const cmp = kendoGridComponent.componentInstance;

            cmp.editItem.emit();

            expect(component.editServiceType).toHaveBeenCalled();
        });
    });

    describe('If clicked on delete icon ->', () => {
        it('should call deleteServiceType method', () => {
            spyOn(component, 'deleteServiceType');
            const kendoGridComponent = de.query(By.directive(AppKendoGridComponent));
            const cmp = kendoGridComponent.componentInstance;

            cmp.deleteItem.emit();

            expect(component.deleteServiceType).toHaveBeenCalled();
        });
    });

    describe('deleteServiceType ->', () => {
        it('should call openDeleteConfirmationModal method', () => {
            spyOn(component, 'openDeleteConfirmationModal');
            component.deleteServiceType({ dataItem: mockServiceTypesList[0] });

            expect(component.openDeleteConfirmationModal).toHaveBeenCalled();
        });
    });

    describe('updateDeleteRightsViewModel ->', () => {
        it('should check delete access', () => {
            component.authDeleteAccess();
            expect(component.hasDeleteAccess).toBe(true);

            //case 1: when serviceType.IsAssociatedWithServiceCode && serviceType.IsSystemType both true
            component.updateDeleteRightsViewModel(mockServiceTypesList[2]);

            //case 2: when serviceType.IsAssociatedWithServiceCode is true && serviceType.IsSystemType is false
            component.updateDeleteRightsViewModel(mockServiceTypesList[3]);

            //Case 3: when dont have access then execute if part
            component.hasDeleteAccess = false;
            component.updateDeleteRightsViewModel(mockServiceTypesList[2]);
        })
    });

    describe('addServiceType ->', () => {
        it('should add ServiceType', () => {
            spyOn(component, "createServiceTypeSuccess");
            component.addServiceType({ dataItem: mockServiceTypesList[0] });
            component.createServiceTypeSuccess({ dataItem: mockServiceTypesList[0] });
            expect(component.createServiceTypeSuccess).toHaveBeenCalled();
        });

        it('should not create record if dont have add rights', () => {
            spyOn(mockServiceTypesService, "save");
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.addServiceType({ dataItem: mockServiceTypesList[0] });
            expect(mockServiceTypesService.save).not.toHaveBeenCalled();
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
        })

        it('should create record on createServiceTypeSuccess and show success toaster', () => {
            component.createServiceTypeSuccess(mockServiceTypesList[0]);
            expect(mockToastrFactory.success).toHaveBeenCalled();
        })
    })

    describe('updateServiceType ->', () => {
        it('should Update ServiceType', () => {
            spyOn(component, "updateServiceTypeSuccess");
            //call to setup edit form
            component.editServiceType({ dataItem: mockServiceTypesList[0] });
            component.updateServiceType({ dataItem: mockServiceTypesList[0] });
            expect(component.updateServiceTypeSuccess).toHaveBeenCalled();
        })

        it('should not Update ServiceType when unauthrized to edit access', () => {
            spyOn(component, "updateServiceTypeSuccess");
            //call to setup edit form
            component.editServiceType({ dataItem: mockServiceTypesList[0] });
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.updateServiceType({ dataItem: mockServiceTypesList[0] });
            expect(component.updateServiceTypeSuccess).not.toHaveBeenCalled();
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
        })
    })

    describe('updateServiceTypeSuccess -->', () => {
        it('should call updateServiceTypeSuccess and show success toast message', () => {
            component.updateServiceTypeSuccess(mockServiceTypesList[0]);
            expect(mockToastrFactory.success).toHaveBeenCalled();
        })
    })

    describe('confirmDelete ->', () => {
        it('should delete ServiceType', () => {
            spyOn(component, "deleteServiceTypeSuccess");
            //call to setup edit form           
            component.confirmDelete(mockServiceTypesList[0]);
            component.deleteServiceType(mockServiceTypesList[0]);
            expect(component.deleteServiceTypeSuccess).toHaveBeenCalled();
        })

        it('should not delete ServiceType when unautherized to delete', () => {
            spyOn(mockServiceTypesService, "delete");
            //call to setup edit form           
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.confirmDelete(mockServiceTypesList[0]);
            expect(mockServiceTypesService.delete).not.toHaveBeenCalled();
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
        })

        it('should show delete failure msg on deleteServiceTypeFailure', () => {
            //call to setup edit form           
            component.deleteServiceTypeFailure();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })

    describe('openDeleteConfirmationModal ->', () => {
        it('should open openDeleteConfirmationModal', () => {
            component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
            component.openDeleteConfirmationModal(mockServiceTypesList[2]);
            mockConfirmationModalService.open = jasmine.createSpy().and.returnValue({
                events: {
                    pipe: jasmine.createSpy().and.returnValue({
                        type: "close",
                        subscribe: (success) => { success({ type: "close" }) }
                    }),
                },
                close: jasmine.createSpy()
            });
            component.openDeleteConfirmationModal(mockServiceTypesList[2]);
        })
    });

    describe('addNewServiceType ', () => {
        it('should call addNewServiceType ', () => {
            component.addNewServiceType();
            expect(component.formGroup.controls).not.toBeNull();
        })
    });

    describe('createServiceTypeError ', () => {
        it('should call createServiceTypeError in create error case', () => {
            component.createServiceTypeError(mockError);
            expect(mockToastrFactory.error).toHaveBeenCalled();
            component.updateServiceTypeError(mockError);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })
});