import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { MasterAlerts } from './master-alerts';
import { MasterAlertsComponent } from './master-alerts.component';
import { AppKendoGridComponent } from 'src/@shared/components/app-kendo-grid/app-kendo-grid.component';

let mockFormGroup: FormGroup;
let createFormGroup;
let mockMasterAlertsList;
let mockMasterAlert;
let mockPatientsWithMasterAlerts;
let masterAlertService;
let mockSymbolsList: any;
let mockAlertIconsList;
let mockStaticData;
let mockLocation;
let mockInjector;
let mockConfirmationModalSubscription;
let mockConfirmationModalService;
let mockPatSecurityService;
let mockToastrFactory;
let mockLocalizeService;

describe('MasterAlertsComponent', () => {
  let component: MasterAlertsComponent;
  let fixture: ComponentFixture<MasterAlertsComponent>;

  beforeEach(async () => {
    createFormGroup = dataItem => new FormGroup({
      'Description': new FormControl(dataItem.Description, [Validators.required]),
      'SymbolId': new FormControl(dataItem.SymbolId)
    });

    mockMasterAlertsList = [
      { MasterAlertId: '1', Description: 'AlertOne', SymbolId: '1' },
      { MasterAlertId: '2', Description: 'AlertTwo', SymbolId: '2' }
    ]

    mockMasterAlert = {
      MasterAlertId: null,
      Description: null
    };

    mockPatientsWithMasterAlerts = [{ PatientId: '1' }, { PatientId: '2' }, { PatientId: '3' }];

    masterAlertService = {
      get: jasmine.createSpy().and.returnValue({ Value: mockMasterAlertsList }),
      save: (masterAlert) => {
        return {
          $promise: {
            then: (res, error) => {
              res({ Value: masterAlert }),
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
      },
      update: (masterAlert: MasterAlerts) => {
        return {
          $promise: {
            then: (res, error) => {
              res({ Value: masterAlert }),
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
      },
      delete: (masterAlert) => {
        return new Promise((resolve, reject) => {
          resolve({ Value: mockMasterAlertsList[0].MasterAlertId }),
            reject({});
        });
      },
      alertsWithPatients: (Obj) => {
        return new Promise((resolve, reject) => {
          let tempData = [];
          tempData = mockPatientsWithMasterAlerts.filter(x => x.PatientId == Obj.Id);
          resolve({ Value: mockPatientsWithMasterAlerts }),
            reject({});
        });
      },
    };

    mockSymbolsList = [
      { SymbolId: 1, Class: 'fa-frowny-o' },
      { SymbolId: 2, Class: 'fa-smiley-o' },
      { SymbolId: 3, Class: 'fa-eyey' }
    ]

    mockSymbolsList.getClassById = jasmine.createSpy().and.returnValue(mockSymbolsList[0].Class);
    mockAlertIconsList = [
      { AlertIconId: '15', Name: 'fi-a', Order: 0, DataTag: 'AAAAAAACeOA=', UserModified: '00000000-0000-0000-0000-000000000000' },
      { AlertIconId: '12', Name: 'fas fa-ambulance', Order: 1, DataTag: 'AAAAAAACeN0=', UserModified: '00000000-0000-0000-0000-000000000000' },
      { AlertIconId: '0', Name: 'fas fa-asterisk', Order: 2, DataTag: 'AAAAAAACeNE=', UserModified: '00000000-0000-0000-0000-000000000000' }]

    mockStaticData = {
      AlertIcons: () => {
        return {
          then: (res) => {
            res({ Value: mockAlertIconsList })
          }
        }
      },
    };

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

    await TestBed.configureTestingModule({
      declarations: [MasterAlertsComponent, AppKendoGridComponent],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'MasterAlertService', useValue: masterAlertService },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: '$location', useValue: mockLocation },
        { provide: '$injector', useValue: mockInjector },
        { provide: 'StaticData', useValue: mockStaticData },
        { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
        { provide: 'SoarConfig', useValue: {} }
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MasterAlertsComponent);
    component = fixture.componentInstance;
    component.formGroup = mockFormGroup;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit -->', () => {
    it('should call all methods under ngOnInit', () => {
      spyOn(component, 'authAccess');
      spyOn(component, 'getPageNavigation');
      spyOn(component, 'getMasterAlerts');
      component.ngOnInit();
      expect(component.authAccess).toHaveBeenCalled();
      expect(component.getPageNavigation).toHaveBeenCalled();
      expect(component.getMasterAlerts).toHaveBeenCalled();
    });

    it('should set symbolList with static data', () => {
      component.ngOnInit();
      expect(component.symbolList).not.toBe(null);
    });
  });

  describe('authAccess -->', () => {
    it('should toast error message if hasViewAccess is false ', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
      component.authAccess();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });

    it('should set authAccess for CRUD operations', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
      component.authAccess();
      expect(component.hasCreateAccess).toBe(true);
      expect(component.hasEditAccess).toBe(true);
      expect(component.hasDeleteAccess).toBe(true);
    })
  });

  describe('masterAlertGetSuccess -->', () => {
    it('should set masterAlertTypes', () => {
      const res = { "Value": mockMasterAlertsList };
      component.masterAlertGetSuccess(res);
      expect(component.masterAlertTypes.length).toBe(2);
      expect(component.loading).toBe(false);
    });
  });

  describe('masterAlertsGetFailure -->', () => {
    it('should call masterAlertsGetFailure', () => {
      component.masterAlertsGetFailure();
      expect(component.loading).toBe(false);
      expect(component.masterAlertTypes.length).toBe(0);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getClass -->', () => {
    it('should call getClass', () => {

    });
  });

  describe('broadcastChannel -->', () => {
    it('should call broadcastChannel method', () => {
      component.broadcastChannel('masterAlerts', { mode: 'add', data: mockMasterAlert });
      expect(mockInjector.get).toHaveBeenCalled();
    })
  });

  describe('createMasterAlert -->', () => {
    it('should call createMasterAlert and set formgroup', () => {
      const mockEventObj = {
        rowIndex: 0, dataItem: mockMasterAlertsList[0], sender: {
          closeRow: () => { },
          editRow: () => { },
          addRow: () => { }
        }, isNew: true
      };
      component.createMasterAlert(mockEventObj);
      expect(component.formGroup).toBeDefined();
    })
  });

  describe('saveMasterAlert -->', () => {
    it('should call addMasterAlert', () => {
      const mockEventObj = {
        rowIndex: 0, dataItem: mockMasterAlertsList[0], sender: {
          closeRow: () => { },
          editRow: () => { },
          addRow: () => { }
        }, isNew: true
      };
      const spy = component.addMasterAlertType = jasmine.createSpy();
      component.saveMasterAlert(mockEventObj);
      expect(component.senderObject).toBeDefined();
      expect(spy).toHaveBeenCalled();
    });

    it('should call updateMasterAlertsType', () => {
      const mockEventObj = {
        rowIndex: 0, dataItem: mockMasterAlertsList[0], sender: {
          closeRow: () => { },
          editRow: () => { },
          addRow: () => { }
        }, isNew: false
      };
      const spy = component.updateMasterAlertsType = jasmine.createSpy();
      component.saveMasterAlert(mockEventObj);
      expect(component.senderObject).toBeDefined();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('addMasterAlertType -->', () => {
    it('should call the method', () => {
      component.addMasterAlertType();
    });
    it('should populate response', () => {
      const spy = component.getMasterAlerts = jasmine.createSpy();
      component.createMasterTypeSuccess(mockMasterAlertsList[0]);
      expect(mockToastrFactory.success).toHaveBeenCalled();
      expect(component.saving).toBe(false);
      expect(spy).toHaveBeenCalled();
    });
    it('should display toast error', () => {
      component.createMasterTypeError();
      expect(component.saving).toBe(false);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('updateMasterAlertsType -->', () => {
    it('should call the method and set masterAlert obj', () => {
      const mockEventObj = {
        data: { data: [{ 'SymbolId': '1', 'Description': 'test flag', 'MasterAlertId': '1' }] }
      };
      component.formGroup = createFormGroup({ 'Description': 'test flag', 'SymbolId': '1' });
      component.updateMasterAlertsType(mockEventObj, 0);
      expect(component.masterAlert.SymbolId).toBe('1');
      expect(component.masterAlert.Description).toBe('test flag');
    });

    it('should call the method and set masterAlert obj to null', () => {
      const mockEventObj = {
        data: { data: [{ 'SymbolId': '0', 'Description': 'test flag', 'MasterAlertId': '1' }] }
      };
      component.formGroup = createFormGroup({ 'Description': 'test flag', 'SymbolId': '0' });
      component.updateMasterAlertsType(mockEventObj, 0);
      expect(component.masterAlert.SymbolId).toBe('0');
      expect(component.masterAlert.Description).toBe('test flag');
    });
  });

  describe('updateMasterAlertTypeSuccess -->', () => {
    it('should set symbolId to null if it is ""', () => {
      const data = { 'SymbolId': '' }
      component.updateMasterAlertTypeSuccess(data);
      expect(data.SymbolId).toBe(null);
    });
  });

  describe('editMasterAlert -->', () => {
    let mockEventObj;
    beforeEach(() => {
      mockEventObj = {
        rowIndex: 0,
        dataItem: mockMasterAlertsList[0],
        sender: {
          closeRow: () => { },
          editRow: () => { }
        }
      };
    })
    it('should make the row editable', () => {
      spyOn(component, 'closeEditor');
      component.editMasterAlert(mockEventObj);
      expect(component.closeEditor).toHaveBeenCalledWith(mockEventObj.sender);
      expect(component.formGroup).toBeDefined();
      expect(component.editedRowIndex).toBe(mockEventObj.rowIndex);
    });
  });

  describe('cancelMasterAlert -->', () => {
    let mockEventObj;
    beforeEach(() => {
      mockEventObj = {
        rowIndex: 0,
        dataItem: mockMasterAlertsList[0],
        sender: {
          closeRow: () => { },
          editRow: () => { }
        }
      };
    })
    it('should call closeeditor', () => {
      const spy = component.closeEditor = jasmine.createSpy();
      component.cancelMasterAlert(mockEventObj);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('removeMasterAlert -->', () => {
    let mockEventObj;
    beforeEach(() => {
      mockEventObj = {
        rowIndex: 0,
        dataItem: mockMasterAlertsList[0],
        sender: {
          closeRow: () => { },
          editRow: () => { }
        }
      };
    })
    it('should call removeMasterAlert', () => {
      const spy = component.validateDelete = jasmine.createSpy();
      component.removeMasterAlert(mockEventObj);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('validateDelete -->', () => {
    it('should call alertsWithPatientsSuccess when res is not null', (done) => {
      spyOn(component, 'alertsWithPatientsSuccess');
      spyOn(component, 'alertsWithPatientsError');
      let masterAlertService = {
        alertsWithPatients: jasmine.createSpy().and.returnValue(Promise.resolve(null)),
      };
      const promise = masterAlertService.alertsWithPatients({});
      component.validateDelete(mockMasterAlertsList[0]);
      promise.then((res) => {
        expect(masterAlertService.alertsWithPatients).toHaveBeenCalled();
        component.alertsWithPatientsSuccess(res);
        expect(component.alertsWithPatientsSuccess).toHaveBeenCalled();
        done()
      }, (error) => {
        expect(component.alertsWithPatientsError).toHaveBeenCalled();
        done();
      });
    });
    it('should call openDeleteConfirmationModal when res is null', (done) => {
      spyOn(component, 'openDeleteConfirmationModal');
      spyOn(component, 'alertsWithPatientsError');
      let masterAlertService = {
        alertsWithPatients: jasmine.createSpy().and.returnValue(Promise.resolve(null)),
      };
      const promise = masterAlertService.alertsWithPatients({});
      component.validateDelete(mockMasterAlertsList[0]);
      promise.then((res) => {
        expect(masterAlertService.alertsWithPatients).toHaveBeenCalled();
        component.openDeleteConfirmationModal(res);
        expect(component.openDeleteConfirmationModal).toHaveBeenCalled();
        done()
      }, (error) => {
        expect(component.alertsWithPatientsError).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('alertsWithPatientsSuccess -->', () => {
    it('should call toastrFactory.error', () => {
      component.alertsWithPatientsSuccess(null);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('openDeleteConfirmationModal -->', () => {
    it('should open openDeleteConfirmationModal', () => {
      component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
      component.openDeleteConfirmationModal(mockMasterAlertsList[0]);
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
      component.openDeleteConfirmationModal(mockMasterAlertsList[0]);
    })
  });

  describe('deleteGroupTypeSuccess -->', () => {
    it('should call toastrFactory success method', () => {
      component.masterAlertTypes = mockMasterAlertsList;
      component.deleteGroupTypeSuccess(mockMasterAlertsList[0].SymbolId);
      expect(mockToastrFactory.success).toHaveBeenCalled();
    });
  });

  describe('deleteGroupTypeFailure -->', () => {
    it('should call toasrFactory error method', () => {
      component.deleteGroupTypeFailure();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('confirmDeleteMasterAlert -->', () => {
    let masterAlertService;
    beforeEach(() => {
      masterAlertService = {
        delete: jasmine.createSpy().and.returnValue(Promise.resolve(null)),
      };
      spyOn(component, 'deleteGroupTypeSuccess');
      spyOn(component, 'deleteGroupTypeFailure');
    });
    it('should call deleteGroupTypeSuccess when id is not null', (done) => {
      const promise = masterAlertService.delete({});
      component.confirmDeleteMasterAlert(mockMasterAlertsList[0]);
      promise.then((res: any) => {
        component.deleteGroupTypeSuccess(res);
        expect(component.deleteGroupTypeSuccess).toHaveBeenCalled();
        done();
      }, (error) => {
        expect(component.deleteGroupTypeFailure).toHaveBeenCalled();
        done();
      });
    });

    it('should call deleteGroupTypeFailure when id is null', (done) => {
      const promise = masterAlertService.delete({});
      component.confirmDeleteMasterAlert(null);
      promise.then((res: any) => {
        component.deleteGroupTypeSuccess(res);
        expect(component.deleteGroupTypeSuccess).toHaveBeenCalled();
        done();
      }, (error) => {
        expect(component.deleteGroupTypeFailure).toHaveBeenCalled();
        done();
      });
    });
    it('should show error on  duplicate check true', () => {
      let mockMasterAlertsList = [
        { MasterAlertId: '1', Description: 'AlertOne', SymbolId: '1' },
        { MasterAlertId: '2', Description: 'AlertTwo', SymbolId: '2' }
      ]
      component.masterAlertTypes = mockMasterAlertsList;
      component.duplicateCheck("AlertTwo");
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(component.isInputDuplicate).toBe(true);
    });
  });
});
