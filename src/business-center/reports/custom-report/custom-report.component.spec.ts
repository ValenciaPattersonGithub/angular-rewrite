import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomReportComponent } from './custom-report.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToDisplayTimePipe } from 'src/@shared/pipes/time/to-display-time.pipe';
import { ToShortDisplayDatePipe } from 'src/@shared/pipes/dates/to-short-display-date.pipe';
import { configureTestSuite } from 'src/configure-test-suite';
import { GroupTypeService } from 'src/@shared/providers/group-type.service';

let reportData;
let originalReportData;
let mockProviders;
let mockPatientGroups;
let mockLocations;
let mockTostarfactory: any;
let mockGroupTypeService;
let mockCustomReportService;
let mockreportsFactory;
let mockLocalizeService;
let mockModalFactory;
let mockPatSecurityService;
let mockReportsService;

describe('CustomReportComponent', () => {
  let component: CustomReportComponent;
  let fixture: ComponentFixture<CustomReportComponent>;
  let routeParams;

  configureTestSuite(() => {
    routeParams = {
      Id: 3
    };

    reportData = {
      IncludeAllLocations: false,
      IncludeAllPatientGroups: true,
      IncludeAllProviders: false,
      LocationIds: [],
      ProviderIds: [],
      PatientGroupIds: [],
      DateFilter: 1,
      Category: 5,
      Ignore: 1,
      origStartDate: null,
      origEndtDate: null,
      FromDate: null,
      ToDate: null,
      Name: '',
      Description: '',
      IncludeProduction: false,
      IncludeCollections: false,
      IncludeAdjustments: false,
      GeneratedByUserCode: '123'
    };

    originalReportData = {
      LocationIds: [],
      ProviderIds: [],
      PatientGroupIds: [],
      DateFilter: 1,
      Ignore: 1,
      Name: '',
      IncludeProduction: false,
      IncludeCollections: false,
      IncludeAdjustments: false
    };
    mockProviders = [
      {
        DateModified: '2018-10-01T15:17:15.7411065',
        FirstName: 'Ruby',
        LastName: 'Brown',
        UserCode: 'U123',
        LocationIds: [1, 2, 3, 4, 5, 163],
        MiddleName: null,
        PreferredName: null,
        SuffixName: null,
        UserId: '34de62b5-b6b6-e811-bfd7-4c34889071c5',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
      },
      {
        DateModified: '2018-09-12T18:07:19.8939835',
        FirstName: 'Khloe',
        LastName: 'Dickson',
        LocationIds: [1, 2, 3, 4, 5, 163],
        MiddleName: null,
        PreferredName: null,
        SuffixName: null,
        UserId: 'adb31dad-b6b6-e811-bfd7-4c34889071c5',
        UserModified: '89a839b7-df1b-e811-b7c1-a4db3021bfa0'
      },
      {
        DateModified: '2018-09-12T18:07:14.8578641',
        FirstName: 'Cody',
        LastName: 'Flores',
        LocationIds: [1, 2, 3, 4, 5, 163],
        MiddleName: null,
        PreferredName: null,
        SuffixName: null,
        UserId: '0ae49696-b6b6-e811-bfd7-4c34889071c5',
        UserModified: '89a839b7-df1b-e811-b7c1-a4db3021bfa0'
      },
      {
        DateModified: '2018-09-12T18:07:32.7646174',
        FirstName: 'Molly',
        LastName: 'Franklin',
        LocationIds: [1, 2, 3, 4, 5, 163],
        MiddleName: null,
        PreferredName: null,
        SuffixName: null,
        UserId: '37de62b5-b6b6-e811-bfd7-4c34889071c5',
        UserModified: '89a839b7-df1b-e811-b7c1-a4db3021bfa0'
      },
      {
        DateModified: '2018-09-12T18:07:44.4505127',
        FirstName: 'April',
        LastName: 'Gordon',
        LocationIds: [1, 2, 3, 4, 5, 163],
        MiddleName: null,
        PreferredName: null,
        SuffixName: null,
        UserId: 'b71b4bbc-b6b6-e811-bfd7-4c34889071c5',
        UserModified: '89a839b7-df1b-e811-b7c1-a4db3021bfa0'
      },
      {
        DateModified: '2018-09-12T18:07:23.7207919',
        FirstName: 'Selena',
        LastName: 'Hughes',
        LocationIds: [1, 2, 3, 4, 5, 163],
        MiddleName: null,
        PreferredName: null,
        SuffixName: null,
        UserId: 'b0b31dad-b6b6-e811-bfd7-4c34889071c5',
        UserModified: '89a839b7-df1b-e811-b7c1-a4db3021bfa0'
      },
      {
        DateModified: '2018-09-12T18:07:40.4282129',
        FirstName: 'Malaysia',
        LastName: 'Kirkland',
        LocationIds: [1, 2, 3, 4, 5, 163],
        MiddleName: null,
        PreferredName: null,
        SuffixName: null,
        UserId: 'b41b4bbc-b6b6-e811-bfd7-4c34889071c5',
        UserModified: '89a839b7-df1b-e811-b7c1-a4db3021bfa0'
      },
      {
        DateModified: '2018-09-12T18:07:36.5684445',
        FirstName: 'Phillip',
        LastName: 'Maldonado',
        LocationIds: [1, 2, 3, 4, 5, 163],
        MiddleName: null,
        PreferredName: null,
        SuffixName: null,
        UserId: '3ade62b5-b6b6-e811-bfd7-4c34889071c5',
        UserModified: '89a839b7-df1b-e811-b7c1-a4db3021bfa0'
      },
      {
        DateModified: '2018-02-27T17:05:37.5386182',
        FirstName: 'Mary Beth',
        LastName: 'Swift',
        LocationIds: [1, 2, 3, 4, 5, 163],
        MiddleName: null,
        PreferredName: null,
        SuffixName: null,
        UserId: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
        UserModified: '89a839b7-df1b-e811-b7c1-a4db3021bfa0'
      }
    ];
    mockPatientGroups = [
      {
        MasterPatientGroupId: '739345e0-1465-4bf4-bb3a-3bd38479297e',
        GroupTypeName: 'AAAAAAAAAAA',
        DataTag: 'AAAAAAALsnU=',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
        DateModified: '2018-10-27T09:23:41.7161205'
      },
      {
        MasterPatientGroupId: 'da2070e6-42af-4fd0-8f43-ebd1027ba582',
        GroupTypeName: 'BBBBBBBB',
        DataTag: 'AAAAAAALsnc=',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
        DateModified: '2018-10-27T09:23:49.9883264'
      },
      {
        MasterPatientGroupId: '5956bceb-5c03-4f7a-a0b2-3d05d24c8818',
        GroupTypeName: 'CCCCCCCCCCc',
        DataTag: 'AAAAAAALsnk=',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
        DateModified: '2018-10-27T09:23:56.2844245'
      },
      {
        MasterPatientGroupId: '03426903-c842-4d8d-9912-dc98c658d71c',
        GroupTypeName: 'DDDDDDDDDDD',
        DataTag: 'AAAAAAALsns=',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
        DateModified: '2018-10-27T09:24:02.5052991'
      },
      {
        MasterPatientGroupId: '8071b37b-587a-4dbb-a3f8-d26903e67305',
        GroupTypeName: 'EEEEEEEEEe',
        DataTag: 'AAAAAAALsn0=',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
        DateModified: '2018-10-27T09:24:08.3817427'
      },
      {
        MasterPatientGroupId: '5eb700c2-0108-4e1f-8a14-cfa5b29b227d',
        GroupTypeName: 'FFFFFFFFFff',
        DataTag: 'AAAAAAALsn8=',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
        DateModified: '2018-10-27T09:24:15.3651358'
      },
      {
        MasterPatientGroupId: 'bcc69156-f321-4254-b84c-d7d0590b69e2',
        GroupTypeName: 'GGGGGGGGGgg',
        DataTag: 'AAAAAAALsoE=',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
        DateModified: '2018-10-27T09:24:21.2574627'
      }
    ];
    mockLocations = [
      {
        DataTag: 'AAAAAAAJIJI=',
        DateModified: '2018-09-17T06:42:14.7327338',
        DeactivationTimeUtc: null,
        LocationId: 5,
        NameAbbreviation: '@123',
        NameLine1: '@123',
        NameLine2: null,
        State: 'AR',
        Timezone: 'Eastern Standard Time',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
      },
      {
        DataTag: 'AAAAAAAJII4=',
        DateModified: '2018-09-17T06:41:10.7225359',
        DeactivationTimeUtc: null,
        LocationId: 3,
        NameAbbreviation: '123',
        NameLine1: '123',
        NameLine2: null,
        State: 'AR',
        Timezone: 'Hawaiian Standard Time',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
      },
      {
        DataTag: 'AAAAAAAJIJA=',
        DateModified: '2018-09-17T06:41:42.9125004',
        DeactivationTimeUtc: null,
        LocationId: 4,
        NameAbbreviation: '123abc',
        NameLine1: '123abc',
        NameLine2: null,
        State: 'AR',
        Timezone: 'Aleutian Standard Time',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
      },
      {
        DataTag: 'AAAAAAAMA9k=',
        DateModified: '2018-11-26T11:13:01.0611821',
        DeactivationTimeUtc: null,
        LocationId: 1,
        NameAbbreviation: 'Practice',
        NameLine1: 'Default Practice - MB',
        NameLine2: null,
        State: 'MN',
        Timezone: 'Central Standard Time',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
      },
      {
        DataTag: 'AAAAAAALr2I=',
        DateModified: '2018-10-24T09:21:08.1730362',
        DeactivationTimeUtc: null,
        LocationId: 163,
        NameAbbreviation: 'Jangaon',
        NameLine1: 'Jangaon',
        NameLine2: null,
        State: 'AR',
        Timezone: 'Aleutian Standard Time',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
      },
      {
        DataTag: 'AAAAAAAMH1s=',
        DateModified: '2018-12-04T11:55:17.8837416',
        DeactivationTimeUtc: '2018-12-04T11:54:55.372+00:00',
        LocationId: 2,
        NameAbbreviation: '#abc',
        NameLine1: '#abc',
        NameLine2: null,
        State: 'AK',
        Timezone: 'Aleutian Standard Time',
        UserModified: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0'
      }
    ];

    mockTostarfactory = {
      error: jasmine.createSpy().and.returnValue('Error Message'),
      success: jasmine.createSpy().and.returnValue('Success Message')
    };

    mockGroupTypeService = {
      save: jasmine.createSpy(),
      update: jasmine.createSpy(),
      get: jasmine.createSpy(),
      delete: jasmine.createSpy(),
      groupTypeWithPatients: jasmine.createSpy(),
    };

    mockCustomReportService = {
      getLocations: jasmine.createSpy().and.returnValue({}),
      getProviders: jasmine.createSpy().and.returnValue({})
    };

    mockreportsFactory = {
      AddPrintedReportActivityEvent: jasmine.createSpy().and.returnValue({})
    };
    mockLocalizeService = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake((val) => {
          return val;
        })
    };
    mockModalFactory = {
      CancelModal: jasmine
        .createSpy('ModalFactory.CancelModal')
        .and.returnValue({ then: () => { } })
    };
    mockPatSecurityService = {
      IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
    };

    mockReportsService = {
      GetCustom: jasmine.createSpy('LocationServices.getPermittedLocations').and.returnValue({
        $promise: {
          Value: [
            { Value: [{ customReportId: 3 }] }
          ]
          ,
          then: (callback) => {
            callback({
              Value: reportData
            });
          }
        }
      }),
      GetCustomReportGrid: jasmine.createSpy('LocationServices.getPermittedLocations').and.returnValue({
        $promise: {
          Value: [
            { Value: [{ customReportId: 3 }] }

          ]
          ,
          then: (callback) => {
            callback({
              // Value:
              //   locationResponce.Value
            });
          }
        }
      }),

      CreateCustom: jasmine
        .createSpy('mockReportsService.CreateCustom')
        .and.returnValue({
          then: () => { }
        }),
      UpdateCustom: jasmine
        .createSpy('mockReportsService.UpdateCustom')
        .and.returnValue({
          then: () => { }
        })
    };

    TestBed.configureTestingModule({
      declarations: [CustomReportComponent, ToShortDisplayDatePipe, ToDisplayTimePipe],
      imports: [FormsModule, ReactiveFormsModule,
        TranslateModule.forRoot()  // Required import for componenets that use ngx-translate in the view or componenet code
      ],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'toastrFactory', useValue: mockTostarfactory },
        { provide: 'ReportsFactory', useValue: mockreportsFactory },
        { provide: '$routeParams', useValue: routeParams },
        { provide: 'CustomReportService', useValue: mockCustomReportService },
        { provide: GroupTypeService, useValue: mockGroupTypeService },
        { provide: 'ReportsService', useValue: mockReportsService },
        { provide: '$location', useValue: {} },
        { provide: 'ModalFactory', useValue: mockModalFactory },
        { provide: 'patSecurityService', useValue: mockPatSecurityService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomReportComponent);
    component = fixture.componentInstance;
    component.methodCallFlag = false;
    component.report = reportData;
    component.originalReport = originalReportData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
    });
    it('should call ngOnInit', () => {
      component.methodCallFlag = false;
      component.ngOnInit();
    });
  });

  describe('getOptions', () => {
    beforeEach(() => {
    });
    it('should call getOptions', () => {
      component.getOptions();
      const name = 'All Sources';
      expect(name).toEqual(mockLocalizeService.getLocalizedString('All Sources'));
    });
  });

  describe('filerCount', () => {
    beforeEach(() => {
    });
    it('should call filerCount', () => {
      component.filerCount();
      expect(component.filerCount()).toEqual(1);
    });

    it('should call filerCount IncludeProduction 2', () => {
      component.report.IncludeProduction = true;
      component.filerCount();
      expect(component.filerCount()).toEqual(2);
    });

    it('should call filerCount 2', () => {
      component.report.IncludeProduction = false;
      component.report.IncludeCollections = true;
      component.filerCount();
      expect(component.filerCount()).toEqual(2);
    });
    it('should call filerCount  3', () => {
      component.report.IncludeCollections = false;
      component.report.IncludeAdjustments = true;
      component.report.IncludeCollections = true;
      component.filerCount();
      expect(component.filerCount()).toEqual(3);
    });
    it('should call filerCount 4', () => {
      component.report.IncludeProduction = true;
      component.report.IncludeAdjustments = true;
      component.report.IncludeCollections = true;
      component.filerCount();
      expect(component.filerCount()).toEqual(4);
    });
  });

  describe('changeOption', () => {
    beforeEach(() => {
    });
    it('should call changeOption', () => {
      component.changeOption('DR', 0);
      expect(component.report.origEndtDate).toBe(null);
      expect(component.report.origStartDate).toBe(null);
    });
    it('should call changeOption with OTD', () => {
      component.changeOption('OTD', 0);
      expect(component.report.origEndtDate).toBe(null);
      expect(component.report.origStartDate).toBe(null);
    });
    it('should call changeOption with 4', () => {
      component.changeOption('DR', 4);
      expect(component.report.FromDate).toBe(null);
      expect(component.report.ToDate).toBe(null);
    });
  });

  describe('component.toggleSelect -> ', () => {
    it('component.toggleSelect should be called when location selected', () => {
      component.providers = mockProviders;
      component.report = reportData;
      const list = 'Location';
      const id = 3;
      component.toggleSelect(list, id);
      expect(component.filteredProviders[0].UserId).toEqual('34de62b5-b6b6-e811-bfd7-4c34889071c5');
      expect(component.filteredProviders[5].UserId).toEqual('b0b31dad-b6b6-e811-bfd7-4c34889071c5');
    });

    it('component.toggleSelect should be called when PatientGroup selected', () => {
      component.report = reportData;
      const list = 'PatientGroup';
      const id = '8071b37b-587a-4dbb-a3f8-d26903e67305';
      component.toggleSelect(list, id);
      expect(component.report.PatientGroupIds[0]).toEqual('8071b37b-587a-4dbb-a3f8-d26903e67305');
    });
    it('component.toggleSelect should be called when Provider selected', () => {
      component.report = reportData;
      const list = 'Provider';
      const id = 'adb31dad-b6b6-e811-bfd7-4c34889071c5';
      component.toggleSelect(list, id);
      expect(component.report.ProviderIds).toEqual(['adb31dad-b6b6-e811-bfd7-4c34889071c5']);
    });
  });

  describe('component.retrieveGridSuccess -> ', () => {
    it('component.retrieveGridSuccess should be called', () => {
      const res = {
        Count: null,
        ExtendedStatusCode: null,
        InvalidProperties: null,
        Value: {
          GeneratedAtDateTime: '2019-02-14T09:26:49.047605Z',
          GeneratedByUserCode: 'SWIMA1',
          LocationOrPracticeEmail: '',
          LocationOrPracticeName: 'Default Practice - MB',
          LocationOrPracticePhone: '',
          Providers: [],
          ReportTitle: 'Custom Report',
          TotalAdjustmentsForReport: 0,
          TotalCollectionsForReport: 0,
          TotalProductionForReport: 0
        }
      };
      const date = new Date();
      component.retrieveGridSuccess(res);
      expect(component.showGrid).toEqual(true);
      expect(component.userCode).toEqual('SWIMA1');
    });
  });

  describe('component.setDisplayPatientGroups -> ', () => {
    it('component.setDisplayPatientGroups should be called', () => {
      component.patientGroups = mockPatientGroups;
      component.appliedReport = {
        PatientGroupIds: [
          'da2070e6-42af-4fd0-8f43-ebd1027ba582',
          '5956bceb-5c03-4f7a-a0b2-3d05d24c8818',
          '03426903-c842-4d8d-9912-dc98c658d71c'
        ]
      };
      component.setDisplayPatientGroups();
      expect(component.displayedPatientGroups).toEqual(
        'BBBBBBBB, CCCCCCCCCCc, DDDDDDDDDDD'
      );
    });
  });

  describe('component.print -> ', () => {
    it('mockReportsFactory.AddPrintedReportActivityEvent should be called', () => {
      spyOn(window, 'print');
      component.print();
      expect(
        mockreportsFactory.AddPrintedReportActivityEvent
      ).toHaveBeenCalled();
    });
  });

  describe('component.getLocationsSuccess -> ', () => {
    it('component.getLocationsSuccess should be called', () => {
      component.locations = [];
      const res = {
        Count: null,
        ExtendedStatusCode: null,
        InvalidProperties: null,
        Value: mockLocations
      };
      component.getLocationsSuccess(res);
      expect(component.locations[0].LocationId).toEqual(5);
    });
  });

  describe('component.getProvidersSuccess -> ', () => {
    it('component.getProvidersSuccess should be called', () => {
      component.providers = [];
      const res = {
        Count: null,
        ExtendedStatusCode: null,
        InvalidProperties: null,
        Value: mockProviders
      };
      component.getProvidersSuccess(res);
      expect(component.providers[0].UserId).toEqual(
        '34de62b5-b6b6-e811-bfd7-4c34889071c5'
      );
    });
  });


  describe('component.getPatientGroupsSuccess -> ', () => {
    it('component.getPatientGroupsSuccess should be called', () => {
      component.appliedReport = {
        PatientGroupIds: [
          '739345e0-1465-4bf4-bb3a-3bd38479297e',
          'da2070e6-42af-4fd0-8f43-ebd1027ba582'
        ]
      };
      component.patientGroups = [];
      const res = {
        Count: 7,
        ExtendedStatusCode: null,
        InvalidProperties: null,
        Value: mockPatientGroups
      };
      component.getPatientGroupsSuccess(res);
      expect(component.readyToDisplayPatientGroups).toBe(true);
    });
  });


  describe('component.setDisplayLocations -> ', () => {
    it('component.setDisplayLocations should be called', () => {
      component.locations = mockLocations;
      component.appliedReport = {
        LocationIds: [5, 3, 1, 163]
      };
      component.setDisplayLocations();
      expect(component.displayedLocations).toEqual(
        '@123, 123, Default Practice - MB, Jangaon'
      );
    });
  });

  describe('component.setDisplayProviders -> ', () => {
    it('component.setDisplayProviders should be called', () => {
      component.providers = mockProviders;
      component.appliedReport = {
        ProviderIds: [
          '34de62b5-b6b6-e811-bfd7-4c34889071c5',
          'adb31dad-b6b6-e811-bfd7-4c34889071c5',
          '0ae49696-b6b6-e811-bfd7-4c34889071c5'
        ]
      };
      component.setDisplayProviders();
      expect(component.displayedProviders).toEqual('Brown, Ruby - U123; Dickson, Khloe; Flores, Cody');
    });
  });

  describe('component.setDisplayPatientGroups -> ', () => {
    it('component.setDisplayPatientGroups should be called', () => {
      component.patientGroups = mockPatientGroups;
      component.appliedReport = {
        PatientGroupIds: [
          'da2070e6-42af-4fd0-8f43-ebd1027ba582',
          '5956bceb-5c03-4f7a-a0b2-3d05d24c8818',
          '03426903-c842-4d8d-9912-dc98c658d71c'
        ]
      };
      component.setDisplayPatientGroups();
      expect(component.displayedPatientGroups).toEqual(
        'BBBBBBBB, CCCCCCCCCCc, DDDDDDDDDDD'
      );
    });
  });
});
