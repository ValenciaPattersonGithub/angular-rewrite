import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AddEvent, DataStateChangeEvent, GridModule } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { ConfirmationModalService } from '../../../../@shared/components/confirmation-modal/confirmation-modal.service';
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { DiscountTypesComponent } from './discount-types.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { DiscountType } from './discount-type';
import { DiscountTypesService } from 'src/@shared/providers/discount-types.service';

let gridData;
let mockDiscountTypes = [
    {
        MasterDiscountTypeId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704",
        DiscountTypeName: "TestDiscount",
        DiscountRate: 0.2,
        DiscountRateDisplay: "20",
        IsActive: true,
        DataTag: "AAAAAAAX5y0=",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DateModified: new Date('2022-11-09T10:10:921738')
    },
    {
        MasterDiscountTypeId: "592bd95a-6584-4148-ad30-fdcc1cf2aa20",
        DiscountTypeName: "PersonalDiscount",
        DiscountRate: 0.2,
        DiscountRateDisplay: "20",
        IsActive: true,
        DataTag: "AAAAAAAXwM4=",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DateModified: new Date('2022-11-09T10:10:921738')
    }
]

let mockDiscountTypesService = {
    get: () => {
      return {
        then: (success, error) => {
          success({ Value: mockDiscountTypes }),
            error({
              data: {
                InvalidProperties: [{
                  PropertyName: "DiscountTypeName",
                  ValidationMessage: "Not Allowed"
                }]
              }
            })
        }  
      }
    },
    delete: (discounttype: DiscountType) => {
      return {
        then: (res, error) => {
          res({ Value: discounttype }),
            error({
              data: {
                InvalidProperties: [{
                  PropertyName: "DiscountTypeName",
                  ValidationMessage: "Not Allowed"
                }]
              }
            })
        }
      }
    },
    save: () => {
      return {
        then: (res, error) => {
          res({ Value: mockDiscountTypes }),
            error({
              data: {
                InvalidProperties: [{
                  PropertyName: "DiscountTypeName",
                  ValidationMessage: "Not Allowed"
                }]
              }
            })
        }
      }
    },
    update: (discounttype: DiscountType) => {
      return {
          then: (res, error) => {
              res({ Value: discounttype }),
                  error({
                      data: {
                          InvalidProperties: [{
                              PropertyName: "DiscountTypeName",
                              ValidationMessage: "Not Allowed"
                          }]
                      }
                  })
          }
      }
  }
};

let mockAuthZ = {
    generateTitleMessage: () => { return 'Not Allowed' }
}

let mockLocation = {
    path: () => ''
}

let mockInjector = {
    get: jasmine.createSpy().and.returnValue({
        publish: jasmine.createSpy()
    })
}
let mockRouteParams = {}
const mockConfirmationModalService = {
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

let mockDataStateChangeEvent: DataStateChangeEvent = {
    skip: 1,
    take: 1,
    group: [],
    sort: []
};

// confirmationModal objects
const mockConfirmationModalSubscription = {
    subscribe: jasmine.createSpy(),
    unsubscribe: jasmine.createSpy(),
    _subscriptions: jasmine.createSpy(),
    _parentOrParents: jasmine.createSpy(),
    close: jasmine.createSpy(),
};
let mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
    generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
};

let mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error')
};

let mockLocalizeService = {
    getLocalizedString: () => 'translated text'
};

const mockListHelper = {
    findItemByFieldValueIgnoreCase: () => {
        return mockDiscountTypes[0];
    },
    findIndexByFieldValue : () => {
        return 0;
    }
};

const mockService = {
    // define called methods
};

const mockSort: SortDescriptor[] = [
    {
        field: "DiscountName",
        dir: "asc",
    },
    {
        field: "DiscountRate",
        dir: "asc",
    },
    {
        field: "IsActive",
        dir: "asc",
    }
];

let mockMasterListStatus = [
    { "Value": true, "Text": "Active" },
    { "Value": false, "Text": "InActive" }
]


describe('DiscountTypesComponent', () => {
    let component: DiscountTypesComponent;
    let fixture: ComponentFixture<DiscountTypesComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [DiscountTypesComponent],
            imports: [
                FormsModule,
                ReactiveFormsModule,
                AppKendoUIModule,
                GridModule,
                TranslateModule.forRoot()],
            providers: [
                { provide: 'toastrFactory', useValue: mockToastrFactory },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'patSecurityService', useValue: mockPatSecurityService },
                { provide: 'AuthZService', useValue: mockAuthZ },
                { provide: '$location', useValue: mockLocation },
                { provide: '$routeParams', useValue: mockRouteParams },
                { provide: '$injector', useValue: mockInjector },
                { provide: 'MasterListStatus', useValue: mockMasterListStatus },
                { provide: ConfirmationModalOverlayRef, useValue: mockService },
                { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
                { provide: DiscountTypesService, useValue: mockDiscountTypesService },
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DiscountTypesComponent);
        component = fixture.componentInstance;
        gridData = mockDiscountTypes;
        fixture.detectChanges();

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    describe('ngOnInit -->', () => {
        it('should call all methods under ngOnInit', () => {
            spyOn(component, 'getPageNavigation');
            spyOn(component, 'authAccess');
            spyOn(component, 'getDiscountTypes');
            component.ngOnInit();
            expect(component.authAccess).toHaveBeenCalled();
            expect(component.getPageNavigation).toHaveBeenCalled();
            expect(component.getDiscountTypes).toHaveBeenCalled();
        })

        it('should call the page navigation method ', () => {
            component.getPageNavigation = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getPageNavigation).toHaveBeenCalled();
        });


        it('should set showBackButton as true $routeParams.subcategory is PatientDiscountTypes', () => {
            component.routeParams.subcategory = "PatientDiscountTypes";
            component.ngOnInit();
            expect(component.showBackButton).toBe(true);
        })

        it('should set showBackButton as false when $routeParams.subcategory not PatientDiscountTypes', () => {
            component.routeParams.subcategory = "";
            component.ngOnInit();
            expect(component.showBackButton).toBe(false);
        })
    })

    describe('CreateDiscountType method ->', function () {
        const mockEventObj = {
          rowIndex: 0, dataItem: mockDiscountTypes[0], sender: {
            closeRow: () => { },
            editRow: () => { },
            addRow: () => { }
          }, isNew: true
        };
        it('should call the method', function () {
    
          component.createDiscountType(mockEventObj);
        });
      });
    
    describe('authAccess -->', () => {
        it('should display toast error msg and redirect to home page if not unAuthorized', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.authAccess();
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
        it('should set authAccess for CRUD operations', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.authAccess();
            expect(component.hasViewAccess).toBe(true);
            expect(component.hasCreateAccess).toBe(true);
            expect(component.hasEditAccess).toBe(true);
        })
    })

    describe('broadcastChannel -->', () => {
        it('should call broadcastChannel method', () => {
            component.broadcastChannel('discountTypes', { mode: 'add', data: mockDiscountTypes });
            expect(mockInjector.get).toHaveBeenCalled();
        })
    })

    describe('getStatus method ->', () => {
        it('should return Status matching from masterListStatus', () => {
            const id = mockDiscountTypes[1].IsActive;
            const status = component.getStatus(id);
            expect(status).toBe(mockMasterListStatus[0]);
        });
    });

    describe('getDiscountTypes -->', () => {
        it('should call discountTypesGetSuccess', () => {
            spyOn(component, 'updateDiscountTypesAccessRights');
            component.discountTypesGetSuccess({ Value: mockDiscountTypes });
            expect(component.loading).toBe(false);
            expect(component.updateDiscountTypesAccessRights).toHaveBeenCalled();
        })

        it('should call discountTypesGetFailure', () => {
            component.discountTypesGetFailure();
            expect(component.loading).toBe(false);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })

    describe('updateDiscountTypesAccessRights -->', () => {
        it('should check updateEditRightsViewModel on updateDiscountTypesAccessRights', () => {
            spyOn(component, 'updateEditRightsViewModel');
            component.discountTypes = mockDiscountTypes;
            component.updateDiscountTypesAccessRights();
            expect(component.updateEditRightsViewModel).toHaveBeenCalled();
        })

        it('should set disableEdit is true for unauthorized login', () => {
            component.hasEditAccess = false;
            component.discountTypes = mockDiscountTypes;
            component.updateDiscountTypesAccessRights();
            expect(component.discountTypes[0]["disableEdit"]).toBe(true);
            expect(component.discountTypes[1]["disableEdit"]).toBe(true);
            expect(component.discountTypes[0]["editTooltipMessage"]).toEqual("Not Allowed");
            expect(component.discountTypes[1]["editTooltipMessage"]).toEqual("Not Allowed");
        })

        it('should set disableEdit is false for authorized login', () => {
            component.hasEditAccess = true;
            component.discountTypes = mockDiscountTypes;
            component.updateDiscountTypesAccessRights();
            expect(component.discountTypes[0]["disableEdit"]).toBe(false);
            expect(component.discountTypes[1]["disableEdit"]).toBe(false);
        })

    });

    describe('dataStateChange  method ->', () => {
        it('should call the method', () => {
            component.dataStateChange(mockDataStateChangeEvent);
            expect(component.state).toBe(mockDataStateChangeEvent);
        });
    });

    describe('sortChange method -> ', () => {
        it('should sort the grid data', () => {
            spyOn(component, 'getDiscountTypes');
            component.sortChange(mockSort);
            expect(component.sort).toEqual(mockSort);
        });
    });
    describe('cancelHandler method->', () => {
        const mockEventObj = {
            sender: {
                closeRow: () => { },
                editRow: () => { }
            },
            rowIndex: 0
        };
        it('should make the row cancel', () => {
            spyOn(component, 'closeEditor');
            component.onCancel(mockEventObj);
            expect(component.closeEditor).toHaveBeenCalledWith(mockEventObj.sender, mockEventObj.rowIndex);
        });
    });

    describe('editDiscountType -->', () => {
        it('should set formGroup with edit functionality & set editMode as true', () => {
            const mockEventObj = {
                rowIndex: 0, dataItem: mockDiscountTypes[0], sender: {
                  closeRow: () => { },
                  editRow: () => { }
                },
              };
            spyOn(component, 'closeEditor');
            component.editDiscountType(mockEventObj);
            expect(component.closeEditor).toHaveBeenCalledWith(mockEventObj.sender);
            expect(component.formGroup).toBeDefined();
            expect(component.discountTypeId).toBe('3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae704');
            expect(component.editedRowIndex).toBe(mockEventObj.rowIndex);
        })
    })

    describe('openUpdateActiveToInactiveConfirm ->', () => {
        it('should open openUpdateActiveToInactiveConfirm', () => {
            component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
            component.openUpdateActiveToInactiveConfirm(mockDiscountTypes[0], mockDiscountTypes[0].IsActive);
            mockConfirmationModalService.open = jasmine.createSpy().and.returnValue({
                events: {
                    pipe: jasmine.createSpy().and.returnValue({
                        type: "close",
                        subscribe: (success) => { success({ type: "close" }) }
                    }),
                },
                close: jasmine.createSpy()
            });
            component.openUpdateActiveToInactiveConfirm(mockDiscountTypes[0], mockDiscountTypes[0].IsActive);
        })
    });
    describe('saveDiscountType -->', () => {
        it('should add discount type when isNew=true', () => {
            spyOn(component, 'addDiscountType');
            component.hasCreateAccess = true;
            spyOn(component, 'isDuplicateDescription');
            const mockEventObj = {
                rowIndex: 0, dataItem: mockDiscountTypes[0], sender: {
                  closeRow: () => { },
                  editRow: () => { },
                  addRow: () => { }
                },
              };
            let tempPassData = {
                event: mockEventObj,
                isNew: true
            }
            spyOn(component, 'closeEditor');
            component.saveDiscountType(tempPassData);
            expect(component.addDiscountType).toHaveBeenCalled();
        })
        it('should add discount type when isNew=false', () => {
            spyOn(component, 'validateDiscountTypeForUpdate');
            component.hasCreateAccess = true;
            // jasmine.createSpy('findItemByFieldValueIgnoreCase').and.returnValue(Promise.resolve(mockDiscountTypes[0]));
            spyOn(component, 'isDuplicateDescription');
            const mockEventObj = {
                rowIndex: 0, dataItem: mockDiscountTypes[0], sender: {
                  closeRow: () => { },
                  editRow: () => { },
                  addRow: () => { }
                },
              };
            let tempPassData = {
                event: mockEventObj,
                isNew: false
            }
            spyOn(component, 'closeEditor');
            component.saveDiscountType(tempPassData);
            expect(component.validateDiscountTypeForUpdate).toHaveBeenCalled();
        })
        it('should update discount type when isNew=false and showInactiveStatusWarning =false', () => {
            spyOn(component, 'validateDiscountTypeForUpdate')
            component.hasEditAccess = true;
            component.showInactiveStatusWarning = false;
            spyOn(component, 'isDuplicateDescription');
            let tempEvent = {
                action: "edit",
                dataItem: mockDiscountTypes[0],
                rowIndex: 0
            }
            let tempPassData = {
                event: tempEvent,
                isNew: false
            }
            spyOn(component, 'closeEditor');
             spyOn(component, 'updateDiscountType');
            component.updateDiscountType(tempPassData.event.dataItem);
            expect(component.updateDiscountType).toHaveBeenCalled();
        })
        it('should update discount type when isNew=false and showInactiveStatusWarning =true', () => {
            component.hasEditAccess = true;
            component.showInactiveStatusWarning = true;
            spyOn(component, 'isDuplicateDescription');
            let tempEvent = {
                action: "edit",
                dataItem: mockDiscountTypes[0],
                rowIndex: 0
            }
            let tempPassData = {
                event: tempEvent,
                isNew: false
            }
            spyOn(component, 'openUpdateActiveToInactiveConfirm');
            component.openUpdateActiveToInactiveConfirm(tempPassData.event.dataItem, mockDiscountTypes[0].IsActive);
        })

    });

    describe('validateDiscountTypeForUpdate -->', () => {
        it('should validate discount type for update', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            spyOn(component, 'validateDiscountTypeForUpdate');
            spyOn(component, 'isDuplicateDescription');
            component.validateDiscountTypeForUpdate(mockDiscountTypes[0]);
            expect(component.validateDiscountTypeForUpdate).toHaveBeenCalled();
        })
    })
    describe('updateDiscountType -->', () => {
        it('should update discount type', () => {
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            spyOn(mockDiscountTypesService, 'update');
            spyOn(component, 'updateDiscountType');
            component.updateDiscountType(mockDiscountTypes[0]);
            expect(component.updateDiscountType).toHaveBeenCalled();
        })
    })

    describe('addDiscountType -->', () => {
        it('should not add record if unauthorized to add', () => {
            let tempEvent = {
                action: "add",
                dataItem: mockDiscountTypes[0],
                rowIndex: 0
            }
            let tempPassData = {
                event: tempEvent,
                isNew: true
            }
            spyOn(component, 'addDiscountType');
            spyOn(component, 'addDiscountTypeSuccess');
            spyOn(component, 'addDiscountTypeFailure');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.addDiscountType(tempEvent);
            expect(component.addDiscountTypeSuccess).not.toHaveBeenCalled();
            expect(component.addDiscountTypeFailure).not.toHaveBeenCalled();
        })

        it('should add record if authorized to add', () => {
            let tempEvent = {
                action: "add",
                dataItem: mockDiscountTypes[0],
                rowIndex: 0
            }, isNew = true;
            spyOn(component, 'addDiscountType');
            spyOn(component, 'addDiscountTypeSuccess');
            spyOn(component, 'addDiscountTypeFailure');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.addDiscountType(tempEvent);
        })

    })

    describe('addDiscountTypePostSuccess -->', () => {
        it('should show success toast message', () => {
            spyOn(component, 'broadcastChannel');
            component.addDiscountTypeSuccess(mockDiscountTypes[0]);
            expect(component.broadcastChannel).toHaveBeenCalled();
            expect(mockToastrFactory.success).toHaveBeenCalled();
        })
    })

    describe('addDiscountTypePostFailure -->', () => {
        it('should show error toast message', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "DiscountTypeName",
                        ValidationMessage: "Not Allowed"
                    }]
                }
            }
            component.addDiscountTypeFailure(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })

        it('should show error toast message if length is greater than 64', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "DiscountTypeName",
                        ValidationMessage: "Discount Type Name cannot be longer than 64 characters"
                    }]
                }
            }
            component.discountNameLength = 66;
            component.addDiscountTypeFailure(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })

    describe('closeEditor method ->', () => {
        it('should close grid editor', () => {
            const spy = component.closeEditor = jasmine.createSpy();
            component.closeEditor(mockDiscountTypes, 0);
            expect(spy).toHaveBeenCalled();
        });
    });

    describe('isDuplicateDescription -->', () => {
        let nonDuplicateDiscountType = {
            MasterDiscountTypeId: "3ae408ba-4c9f-4fb6-9bb1-f7a8db9ae705",
            DiscountTypeName: "EmpDiscount",
            DiscountRate: 0.2,
            DiscountRateDisplay: "20",
            IsActive: true,
            DataTag: "AAAAAAAX5y0=",
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            DateModified: new Date('2022-11-09T10:10:921738')
        }
        it('should return false for isDuplicateDescription', () => {
            expect(component.isDuplicateDescription(mockDiscountTypes[0])).toBe(false);
        });
        it('should return true for isDuplicateDescription', () => {
            expect(component.isDuplicateDescription(nonDuplicateDiscountType)).not.toBe(true);
        });
    });

    describe('editDiscountType -->', () => {
        it('should not update record if unauthorized to edit', () => {
            let tempUpdateEvent = {
                sender: {
                    closeRow: () => { },
                    editRow: () => { }
                },
                updateDataItem: mockDiscountTypes[0],
                updateRowIndex: 0
            };
            spyOn(component, 'isDuplicateDescription');
            spyOn(component, 'updatePostSuccess');
            spyOn(component, 'updatePostFailure');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
            component.hasEditAccess = false;
            component.editDiscountType(tempUpdateEvent);
            expect(component.updatePostSuccess).not.toHaveBeenCalled();
            expect(component.updatePostFailure).not.toHaveBeenCalled();
        });
        it('should update record if unauthorized to edit', () => {
            let tempUpdateEvent = {
                sender: {
                    closeRow: () => { },
                    editRow: () => { }
                },
                updateDataItem: mockDiscountTypes[0],
                updateRowIndex: 0
            };
            spyOn(component, 'isDuplicateDescription');
            spyOn(component, 'updatePostSuccess');
            spyOn(component, 'updatePostFailure');
            mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
            component.hasEditAccess = true;
            component.editDiscountType(tempUpdateEvent);
            expect(component.updatePostSuccess).not.toHaveBeenCalled();
            expect(component.updatePostFailure).not.toHaveBeenCalled();
        });
    });

    describe('updatePostSuccess -->', () => {
        it('should show success toast message', () => {
            spyOn(component, 'broadcastChannel');
            component.updatePostSuccess(mockDiscountTypes[0]);
            expect(component.broadcastChannel).toHaveBeenCalled();
            expect(mockToastrFactory.success).toHaveBeenCalled();
        })
    })

    describe('updatePostFailure -->', () => {
        it('should show error toast message', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "DiscountTypeName",
                        ValidationMessage: "Not Allowed"
                    }]
                }
            }
            component.updatePostFailure(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })

        it('should show error toast message for property name MasterDiscountType.MasterDiscountType_PracticeId_DiscountTypeName_Unique', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "MasterDiscountType.MasterDiscountType_PracticeId_DiscountTypeName_Unique",
                        ValidationMessage: "Not Allowed"
                    }]
                }
            }
            component.updatePostFailure(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
        it('should show error toast message if length is greater than 64', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "DiscountTypeName",
                        ValidationMessage: "Discount Type Name cannot be longer than 64 characters"
                    }]
                }
            }
            component.discountNameLength = 66;
            component.updatePostFailure(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })

        it('should show error toast message when discountRate < 0 or > 100', () => {
            let errorObj = {
                data: {
                    InvalidProperties: [{
                        PropertyName: "DiscountRate",
                        ValidationMessage: "Must be between 1 and 100"
                    }]
                }
            }
            component.discountRateValue = 101;
            component.updatePostFailure(errorObj);
            expect(mockToastrFactory.error).toHaveBeenCalled();
        })
    })
})
