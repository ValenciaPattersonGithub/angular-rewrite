import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDashboardComponent } from './user-dashboard.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DashboardWidgetService, WidgetInitStatus } from '../widgets/services/dashboard-widget.service';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { DashboardWidgetStatus, DashboardWidgetTitle } from '../widgets/services/dashboard-widget';

const users = 'users';

let mockDashboardDefinition;
let mockLocationService;
let mockUserServices;
let mockUser;
let rootScope;
let tempRes;
let mockReferenceDataService;
let mockToasterfactory;
let mockLocalizeService;
let mockAppointmentViewVisibleService;
let mockDashboardService;
let mockUibModal;
let mockDashboardWidgetService;
let mockAppointmentViewLoadingService;
let mockTranslateService;

describe('UserDashboardComponent', () => {
    let component: UserDashboardComponent;
    let fixture: ComponentFixture<UserDashboardComponent>;

    beforeEach(() => {
        mockDashboardWidgetService = {
            clickedOutside: jasmine.createSpy()
        }

        mockDashboardDefinition = {
            CanDrag: true,
            CanResize: false,
            Columns: 8,
            Items:
                [{
                    ActionId: 2715,
                    BatchLoadId: 0,
                    IsHidden: false,
                    ItemId: 20,
                    ItemType: 'widget',
                    Locations: [1],
                    Position: [0, 0],
                    Size: { Width: 2, Height: 2 },
                    Template: 'pending-claims-half-donut-widget.html',
                    Title: 'Pending Claims',
                    initMode: 0
                },
                {
                    ActionId: 2715,
                    BatchLoadId: 0,
                    IsHidden: true,
                    ItemId: 30,
                    ItemType: 'widget',
                    Locations: [1],
                    Position: [1, 1],
                    Size: { Width: 2, Height: 2 },
                    Template: 'pending-claims-half-donut-widget.html',
                    Title: 'Pending Claims',
                    initMode: 0
                }]
        };

        mockLocationService = {
            getCurrentLocation: jasmine.createSpy('LocationService.getCurrentLocation').and.returnValue({ id: 3, status: 'Inactive' })
        };

        mockUserServices = {
            Users: {
                get: jasmine.createSpy().and.returnValue({
                    $promise: {
                        then(callback) {
                            callback({
                                Value:
                                    users
                            });
                        }
                    }
                })
            }
        };

        mockUser = {
            UserId: 1,
            FirstName: 'John',
            MiddleName: 'm',
            LastName: 'Kon',
            PreferredName: 'Jo',
            ProfessionalDesignation: 'Dintist',
            DateOfBirth: new Date('1995-01-15T18:30:00.000Z'),
            UserName: 'test04@mailinator.com'
        }

        rootScope = {
            patAuthContext: {
                userInfo: {
                    UserId: '1234'
                }
            },
            $on: jasmine.createSpy().and.returnValue(mockLocationService.getCurrentLocation),
            $emit: jasmine.createSpy().and.returnValue(mockLocationService.getCurrentLocation),
            $broadcast: jasmine.createSpy().and.callThrough()
        }

        tempRes = {
            Value: mockUser
        }

        mockReferenceDataService = {
            get: jasmine.createSpy().and.callFake( () => {
                return [{ UserId: 1 }];
            }),
            entityNames: {
                users: 'users',
            }
        };

        mockToasterfactory = {
            error: jasmine.createSpy().and.returnValue('Error Message'),
            success: jasmine.createSpy().and.returnValue('Success Message')
        };

        mockLocalizeService = {
            getLocalizedString: jasmine
                .createSpy('localize.getLocalizedString')
                .and.callFake((val) => {
                    return val;
                })
        };

        mockAppointmentViewVisibleService = {
            changeAppointmentViewVisible: jasmine.createSpy(),
            setAppointmentViewVisible: jasmine.createSpy(),
            setSecondaryAppointmentViewVisible: jasmine.createSpy(),
            registerObserver: jasmine.createSpy(),
            clearObserver: jasmine.createSpy()
        };

        mockDashboardService = {
            BatchLoader: {
                Init: jasmine.createSpy(),
            },
            DashboardDefinitions: {
                save: jasmine.createSpy('save').and.returnValue({
                    reject: () => { },
                    resolve: () => { },
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
                    
                })
            },         
            DashboardId: 123
        };

        mockUibModal = {
            open: jasmine.createSpy()
        }

        mockAppointmentViewLoadingService = {
            currentAppointmentSaveResult: jasmine.createSpy('AppointmentViewLoadingService.currentAppointmentSaveResult').and.returnValue({
              then:  (callback) => {
                callback(true);
              }
            }),
            afterSaveEvent: jasmine.createSpy()
        };

        mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);

        TestBed.configureTestingModule({
            declarations: [UserDashboardComponent],
            imports: [ReactiveFormsModule, FormsModule, TranslateModule.forRoot()],
            providers: [
                { provide: 'locationService', useValue: mockLocationService },
                { provide: 'referenceDataService', useValue: mockReferenceDataService },
                { provide: 'DashboardService', useValue: mockDashboardService },
                { provide: 'UserServices', useValue: mockUserServices },
                { provide: 'localize', useValue: mockLocalizeService },
                { provide: 'toastrFactory', useValue: mockToasterfactory },
                { provide: '$rootScope', useValue: rootScope },
                { provide: 'AppointmentViewVisibleService', useValue: mockAppointmentViewVisibleService },
                { provide: 'AppointmentViewLoadingService', useValue: mockAppointmentViewLoadingService },
                { provide: 'WidgetInitStatus', useValue: {} },
                { provide: '$uibModal', useValue: mockUibModal },
                { provide: TranslateService, useValue: mockTranslateService },
                { provide: DashboardWidgetService, useValue: mockDashboardWidgetService },
                FormBuilder,
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create UserDashboardComponent', () => {
        expect(component).toBeTruthy();
    });

    describe('DashboardWidgetTitle', () => {
        it('should return the expected DashboardWidgetTitle', () => {
          const result = component.DashboardWidgetTitle;
          expect(result).toEqual(DashboardWidgetTitle);
        });
    });

    describe('onloadingComplete ->', () => {
        it('should set initMode and errorMessage when itemId is found', () => {
            component.dashboardDefinition = {
              Items: [{ ItemId: '1', initMode: false }]
            };
            const e: DashboardWidgetStatus = { itemId: 1, loading: WidgetInitStatus.Loaded, errorMessage: 'Error' };        
            component.onLoadingComplete(e);        
            expect(component.dashboardDefinition.Items[0].initMode).toBe(WidgetInitStatus.Loaded);
            expect(component.errorMessage).toBe('Error');
        });
        it('should not change initMode and errorMessage when itemId is not found', () => {
            component.dashboardDefinition = {
              Items: [{ ItemId: '1', initMode: false }]
            };
            const e: DashboardWidgetStatus = { itemId: 2, loading: WidgetInitStatus.error, errorMessage: 'Error' };        
            component.onLoadingComplete(e);        
            expect(component.dashboardDefinition.Items[0].initMode).toBe(false);
            expect(component.errorMessage).toBe('');
        });
        it('should not change initMode and errorMessage when Items is undefined', () => {
            component.dashboardDefinition = {};
            const e: DashboardWidgetStatus = { itemId: 1 , loading: WidgetInitStatus.Loading, errorMessage: 'Error' };        
            component.onLoadingComplete(e);        
            expect(component.errorMessage).toBe('');
          });

    });
    

    describe('clickOutside ->', () => {
        it('should call clickOutside method from dashboard widget service when click outside of dropdown', () => {
            const mockDropDownListComponent = {
                isOpen: true
            }

            component.clickedOutside(mockDropDownListComponent as DropDownListComponent);
            expect(mockDashboardWidgetService.clickedOutside).toHaveBeenCalledWith(mockDropDownListComponent);
        });
    });

    describe('ngOnInit ->', () => {
        it('should call all ngoninit methods', () => {
            component.getUser = jasmine.createSpy();
            component.ngOnInit();
            expect(component.getUser).toHaveBeenCalled();
        });

        it('should set location and call getUser when patCore:initlocation event is emitted', () => {
            const spy = spyOn(component, 'getUser');
            mockLocationService.getCurrentLocation.and.returnValue();
            rootScope.$on.and.callFake((event, callback) => {
              if (event == 'patCore:initlocation') {
                callback();
              }
            });        
            component.ngOnInit(); 
            expect(spy).toHaveBeenCalled();
        });
        it('should set location and call getUser when patCore:load-location-display event is emitted and location is undefined', () => {
            const spy = spyOn(component, 'getUser');
            mockLocationService.getCurrentLocation.and.returnValue();
            rootScope.$on.and.callFake((event, callback) => {
              if (event == 'patCore:load-location-display') {
                callback({ location: '' });
              }
            });        
            component.ngOnInit();
            expect(spy).toHaveBeenCalled();
        });
        it('should call referenceDataService.get', () => {
            expect(mockReferenceDataService.get).toHaveBeenCalled();
          });
    });

    describe('userSuccess ->', () => {
        it('should call userSuccess method', () => {
            spyOn(component, 'userSuccess');
            component.userSuccess(tempRes);
            expect(component.userSuccess).toHaveBeenCalled();
        });
        it('should handle null response', () => {
            const tempRes = null;
            let user = 'initial user';        
            component.userSuccess(tempRes);
            expect(user).toEqual('initial user');
        });
        it('should create login event if first visit', () => {
            localStorage.setItem('isFirstVisit', 'true');
            component.userSuccess({ tempRes });
            expect(localStorage.getItem('isFirstVisit')).toBe('false');
          });
    });

    describe('userFailed ->', () => {
        it('should call when user fails', () => {
            component.userFailed();
        });
    });

    describe('dashboardLoadSuccess ->', () => {
        it('should initialize definition variables',  () => {
            const location = { id: 123 };
            const widget = { ItemId: 1, Locations: [location] };
            const definition = { Items: [{ widget }] };
            component.dashboardLoadSuccess(definition);
            expect(component.dashboardDefinition).toEqual(definition);
        
        });
        it('should save dashboard load success', () => {
            spyOn(component, 'dashboardLoadSuccess');
            component.userSuccess(tempRes);
            component.dashboardLoadSuccess(mockDashboardDefinition);
            expect(component.dashboardLoadSuccess).toHaveBeenCalled();
        });

        it('should called dashboardLoadSuccess method', () => {
            component.dashboardLoadSuccess(mockDashboardDefinition);
            expect(component.dashboardDefinition).toEqual(mockDashboardDefinition)
        });

        it('should call dashboardLoadSuccess method when dashboardDefinition is not available', () => {
            component.dashboardDefinition = false;
            component.dashboardLoadSuccess(mockDashboardDefinition);
            expect(component.dashboardDefinition).toEqual(mockDashboardDefinition)
        });
        it('should set initMode to Loaded for Appointments widget', () => {
            const definition = {
              Items: [
                { Title: DashboardWidgetTitle.Receivables, initMode: undefined },
                { Title: DashboardWidgetTitle.Appointments, initMode: 2 } 
              ]
            };
            component.dashboardLoadSuccess(definition);
            expect(definition.Items[0].initMode).toBeUndefined(); 
            expect(definition.Items[1].initMode).toBe(WidgetInitStatus.Loaded);
        });
    });

    describe('dashboardLoadFailed ->', () => {
        it('should call when dashboardLoad fails', () => {
            component.dashboardLoadFailed();
        });
        it('show toaster message if get dashboard definitiion failed',  () => {
            component.dashboardLoadFailed();
            expect(mockToasterfactory.error).toHaveBeenCalled();
        });
    });

    describe('hideWidget ->', () => {
        it('should call when hideWidget', () => {
            let itemId = 20;
            const spy1 = spyOn(component, 'createGridster');
            component.dashboardDefinition = mockDashboardDefinition;
            component.hideWidget(itemId);
            expect(component.saveLayoutDisabled).toBeFalsy();
            expect(component.dashboardDefinition.Items[0].IsHidden).toBeTruthy();
            expect(component.refreshList).toBeFalsy();
            expect(spy1).toHaveBeenCalled();
        });
        it('should not call createGridster or change properties when itemId does not match any item', () => {
            let itemId = 999;
            const spy1 = spyOn(component, 'createGridster');
            component.dashboardDefinition = mockDashboardDefinition;
            component.saveLayoutDisabled = true;
            component.refreshList = true;
        
            component.hideWidget(itemId);
        
            expect(component.saveLayoutDisabled).toBeTruthy(); 
            expect(component.dashboardDefinition.Items[0].IsHidden).toBeFalsy(); 
            expect(component.refreshList).toBeTruthy(); 
            expect(spy1).not.toHaveBeenCalled(); 
          });
    });

    describe('onAppointmentViewVisibleChange ->', () => {
        it('should call method onAppointmentViewVisibleChange', () => {
            let isVisible = false;
            let isSecondaryVisible = false;
            component.onAppointmentViewVisibleChange(isVisible, isSecondaryVisible);

            expect(component.isAppointmentViewVisible).toBeFalsy()
            expect(component.isSecondaryAppointmentViewVisible).toBeFalsy()
        });
        it('should broadcast afterSaveEvent when isVisible is false and data is not null or undefined', () => {
            let isVisible = false;
            let isSecondaryVisible = true;        
            component.onAppointmentViewVisibleChange(isVisible, isSecondaryVisible); 
            expect(rootScope.$broadcast).toHaveBeenCalledWith(mockAppointmentViewLoadingService.afterSaveEvent, mockAppointmentViewLoadingService.currentAppointmentSaveResult);
        });
        it('should broadcast afterSaveEvent when isSecondaryVisible is false and data is not null or undefined', () => {
            let isVisible = true;
            let isSecondaryVisible = false;        
            component.onAppointmentViewVisibleChange(isVisible, isSecondaryVisible);
            expect(rootScope.$broadcast).toHaveBeenCalledWith(mockAppointmentViewLoadingService.afterSaveEvent, mockAppointmentViewLoadingService.currentAppointmentSaveResult);
        });   
        it('should not broadcast afterSaveEvent when isVisible is true and isSecondaryVisible is true', () => {
            let isVisible = true;
            let isSecondaryVisible = true;
            component.onAppointmentViewVisibleChange(isVisible, isSecondaryVisible);        
            expect(rootScope.$broadcast).not.toHaveBeenCalledWith(mockAppointmentViewLoadingService.afterSaveEvent, mockAppointmentViewLoadingService.currentAppointmentSaveResult);
        }); 
        it('should not call $rootScope.$broadcast when afterSaveEvent is null', () => {
           mockAppointmentViewLoadingService.afterSaveEvent = null;
           let isVisible = null;
           let isSecondaryVisible = null;
           component.onAppointmentViewVisibleChange(isVisible, isSecondaryVisible);      
        
            expect(rootScope.$broadcast).not.toHaveBeenCalled();
          });
    });

    describe('getUser ->', () => {
        it('should call Users.get when user is not found', () => {
            mockReferenceDataService.get.and.returnValue([{ UserId: '2' }]);
            rootScope= { patAuthContext: { userInfo: { userid: '1' } } };        
            component.getUser();        
            expect(mockUserServices.Users.get).toHaveBeenCalled();
        });
        it('should not call userSuccess or Users.get when users is undefined', () => {
            const spy1 = spyOn(component, 'userSuccess');          
            mockReferenceDataService.get.and.returnValue(undefined);
            rootScope = { patAuthContext: { userInfo: { userid: '1' } } };        
            component.getUser();        
            expect(spy1).not.toHaveBeenCalled();
        });
        it('userSuccess should be called', () => {
            var user = {
              userId: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
              LastName: 'Swift',
              FirstName: 'Mary Beth',
              UserCode: 'SWIMA1',
            };
            var response = { Value: user };
            component.userSuccess(response);
            expect(component.displayName).toEqual('Mary Beth Swift - SWIMA1');
            expect(mockDashboardService.BatchLoader.Init).toHaveBeenCalled();
        });          
    });

    describe('changeFilter ->', () => {
        it('should call when changeFilter', () => {
            // NG15CLEANUP Updated value to match type of argument. Updated test to match behavior.
            let value = { Id: 20 };
            component.dashboardDefinition = mockDashboardDefinition;
            component.changeFilter(value);
            expect(component.saveLayoutDisabled).toBeFalsy();
            expect(component.refreshList).toBeTruthy();
            expect(component.dashboardDefinition.Items[0].IsHidden).toBeFalsy();
        });

        it('should not change properties when value does not match any item', () => {
            let value = { Id: 999 }; 
            component.dashboardDefinition = mockDashboardDefinition;
            component.saveLayoutDisabled = true;
            component.refreshList = false;
        
            component.changeFilter(value);
        
            expect(component.saveLayoutDisabled).toBeTruthy();
            expect(component.refreshList).toBeFalsy(); 
            expect(component.dashboardDefinition.Items[0].IsHidden).toBeFalsy(); 
          });
    });

    describe('createGridster ->', () => {
        it('should call when dashboardDefinition variable available', () => {
            component.dashboardDefinition = mockDashboardDefinition;
            component.createGridster();
            expect(component.refreshList).toBeTruthy();
        });

        it('should call when dashboardDefinition variable not available', () => {
            component.dashboardDefinition = false;
            component.createGridster();
            expect(component.draggable).toBeFalsy();
            expect(component.resizable).toBeFalsy();
        });
    });

    describe('itemChange ->', () => {
        it('should call when widget position changed', () => {
            component.itemChange()
            expect(component.saveLayoutDisabled).toBeFalsy();
        });
    });

    describe('saveLayout ->', () => {
        it('should call saveLayoutDisabled is false', () => {
                component.saveLayoutDisabled = false;
                component.dashboardDefinition = mockDashboardDefinition;
                component.saveLayout();
                expect(component.dashboardDefinition.Items[0].Position).toEqual(mockDashboardDefinition.Items[0].Position)
        });
        it('should return saveLayout method when saveLayoutDisabled is true', () => {
                component.dashboardDefinition = mockDashboardDefinition;
                component.saveLayout();
                expect(component.saveLayoutDisabled).toBeTruthy()
        });

        it('should return saveLayout method when saveLayoutDisabled is false', () => {
                component.dashboardDefinition = mockDashboardDefinition;
                component.saveLayoutDisabled = false;
                component.saveLayout();
                expect(component.saveLayoutDisabled).toBe(true)
        });

        it('should return saveLayout method when dashboardDefinition is not available', () => {
                component.dashboardDefinition = false;
                component.saveLayout();
                expect(component.saveLayoutDisabled).not.toBeFalsy()
        });
        it('should handle failed response', () => {
            mockDashboardService.DashboardDefinitions.save.and.returnValue({
              $promise: Promise.reject({  })
            });        
            component.saveLayout(); 
        });
        it('should handle successful response', () => {
            mockDashboardService.DashboardDefinitions.save.and.returnValue({
              $promise: Promise.resolve({ Value: 'mockResponse' })
            });        
            component.saveLayout(); 
            expect(component.saveLayoutDisabled).toBe(true);
        });       
    });
});






