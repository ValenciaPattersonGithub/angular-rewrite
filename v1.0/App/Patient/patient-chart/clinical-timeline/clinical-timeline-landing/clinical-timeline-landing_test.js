import { of } from 'rsjs';

describe('Controller: ClinicalTimelineLandingController', function () {
  var ctrl, scheduleServices, usersFactory;
  var scope, rootScope, q, filter, patientServices;
  var treatmentPlansFactory,
    routeParams,
    documentGroupsService,
    medicalHistoryFactory,
    externalImagingWorkerFactory,
    fileUploadFactory;
  var timeZoneFactory, patientRxFactory, toothSelectionService;
  var clinicalTimelineBusinessService, referenceDataService, patientLogic, featureFlagService;
  var deferred, patientPerioExamFactory, filters;
  var personId = '12345678-1234-1234-1234-123456789abc';
  var imagingMasterService, imagingProviders, patientImagingExamFactory;
  var createPatientDirectoryReturnValue = {};

  var existingExternalImages = [
    {
      ThirdPartyImagingRecordId: '458821',
      PatientId: '1234',
      ImageCreatedDate: '2020-03-10T15:30:53.207',
      ImageId: '12',
      OriginalImageFilename: 'Imported File',
      ImagingProviderId: 1,
      ToothNumbers: '2, 3',
    },
    {
      ThirdPartyImagingRecordId: '458822',
      PatientId: '1234',
      ImageCreatedDate: '2020-03-10T15:30:53.207',
      ImageId: '13',
      OriginalImageFilename: 'Imported File',
      ImagingProviderId: 1,
      ToothNumbers: '4, 5',
    },
    {
      PatientId: '1234',
      ImageCreatedDate: '2020-03-08T15:30:53.207',
      ImageId: '20',
      OriginalImageFilename: 'Imported File',
      ImagingProviderId: 1,
      ToothNumbers: '',
    },
  ];

  var filteredNewImages = [
    {
      ThirdPartyImagingRecordId: null,
      PatientId: '1234',
      ImageCreatedDate: '2020-03-10T15:30:53.207',
      ImageId: '12',
      OriginalImageFilename: 'Imported File',
      ImagingProviderId: 1,
      ToothNumbers: '2, 3',
    },
    {
      ThirdPartyImagingRecordId: null,
      PatientId: '1234',
      ImageCreatedDate: '2020-03-10T15:30:53.207',
      ImageId: '13',
      OriginalImageFilename: 'Imported File',
      ImagingProviderId: 1,
      ToothNumbers: '12,13',
    },
    {
      ThirdPartyImagingRecordId: null,
      PatientId: '1234',
      ImageCreatedDate: '2020-03-10T15:30:53.207',
      ImageId: '20',
      OriginalImageFilename: 'Imported File',
      ImagingProviderId: 1,
      ToothNumbers: '2,3',
    },
  ];

  var sidexisExams = [
    {
      studyId: null,
      date: '2020-03-10T00:00:00',
      description: null,
      series: [
        {
          seriesId: null,
          date: '2020-03-10T00:00:00',
          description: null,
          images: [
            {
              imageId: '12',
              date: '2020-03-10T15:30:53.207',
              toothNumbers: '11,12',
              description: 'Imported File',
              imageNumber: 12,
            },
            {
              imageId: '13',
              date: '2020-03-10T15:30:53.207',
              toothNumbers: '12,13',
              description: 'Imported File',
              imageNumber: 13,
            },
            {
              imageId: '14',
              date: '2020-03-10T15:30:53.207',
              toothNumbers: '',
              description: 'Imported File',
              imageNumber: 14,
            },
          ],
        },
      ],
    },
    {
      studyId: null,
      date: '2020-03-10T00:00:00',
      description: null,
      series: [
        {
          seriesId: null,
          date: '2020-03-10T00:00:00',
          description: null,
          images: [
            {
              imageId: '2',
              date: '2020-03-02T15:30:53.207',
              toothNumbers: '5,6',
              description: 'Imported File',
              imageNumber: 2,
            },
            {
              imageId: '3',
              date: '2020-03-02T15:30:53.207',
              toothNumbers: '',
              description: 'Imported File',
              imageNumber: 3,
            },
          ],
        },
      ],
    },
  ];

  var appointmentData = [
    {
      AppointmentId: '1234',
      Status: 4,
      Classification: 0,
      StartTime: '2018-12-24 21:00:00.0000000',
      EndTime: '2018-12-24 21:30:00.0000000',
    },
    {
      AppointmentId: '1235',
      Status: 3,
      Classification: 0,
      StartTime: '2019-01-20 21:00:00.0000000',
      EndTime: '2019-01-20 21:30:00.0000000',
    },
    {
      AppointmentId: '1236',
      Status: 2,
      Classification: 0,
      StartTime: '2019-02-20 21:00:00.0000000',
      EndTime: '2019-02-20 21:30:00.0000000',
    },
    {
      AppointmentId: '1237',
      Status: 4,
      Classification: 0,
      StartTime: '2019-01-20 21:00:00.0000000',
      EndTime: '2019-01-20 21:30:00.0000000',
    },
    {
      AppointmentId: '1238',
      Status: 0,
      Classification: 2,
      StartTime: '2019-02-20 21:00:00.0000000',
      EndTime: '2019-02-20 21:30:00.0000000',
    },
  ];

  beforeEach(
    module('Soar.Patient', function ($provide) {
      imagingProviders = {
        Apteryx: 'apteryx',
        Apteryx2: 'apteryx2',
        Sidexis: 'sidexis',
      };
      $provide.value('ImagingProviders', imagingProviders);

      patientPerioExamFactory = {
        get: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        getSummary: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        getAllExamsByPatientId: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('PatientPerioExamFactory', patientPerioExamFactory);

      toothSelectionService = {
        selection: {
          teeth: [{ position: 10, toothId: 10 }],
        },
      };
      $provide.value('toothSelectionService', toothSelectionService);

      createPatientDirectoryReturnValue.then = function (callback) {
        callback({ res: '9999' });
      };
      fileUploadFactory = {
        CreatePatientDirectory: jasmine
          .createSpy()
          .and.returnValue(createPatientDirectoryReturnValue),
      };
      $provide.value('FileUploadFactory', fileUploadFactory);

      externalImagingWorkerFactory = {
        saveImages: jasmine.createSpy().and.callFake(function () {}),
        syncImages: jasmine.createSpy().and.callFake(function () {}),
      };
      $provide.value(
        'ExternalImagingWorkerFactory',
        externalImagingWorkerFactory
      );

      patientImagingExamFactory = {
        getRefreshPromise: jasmine
          .createSpy()
          .and.returnValue({ then: () => {} }),
      };
      $provide.value('PatientImagingExamFactory', patientImagingExamFactory);
    })
  );

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      usersFactory = {
        Users: jasmine.createSpy().and.returnValue({ then: function () {} }),
      };
      $provide.value('UsersFactory', usersFactory);
    })
  );

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      scheduleServices = {
        Lists: {
          Appointments: {
            GetSingleForTimeline: jasmine.createSpy().and.callFake(function () {
              deferred = q.defer();
              deferred.$promise = deferred.promise;
              deferred.resolve({ Value: [] });
              return deferred;
            }),
            GetAll: jasmine
              .createSpy('scheduleServices.Lists.Appointments.GetAll')
              .and.callFake(function () {}),
            GetAllForTimeline: jasmine.createSpy().and.callFake(function () {
              deferred = q.defer();
              deferred.$promise = deferred.promise;
              deferred.resolve({ Value: [] });
              return deferred;
            }),
          },
        },
        Dtos: {
          Appointment: {
            Operations: {
              Update: jasmine.createSpy('AppointmentUpdate'),
              Delete: jasmine.createSpy('AppointmentDelete'),
            },
          },
        },
        SoftDelete: {
          Appointment: jasmine.createSpy(),
        },
        AppointmentStatus: {
          Update: jasmine.createSpy(),
        },
      };
      $provide.value('ScheduleServices', scheduleServices);
    })
  );

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      imagingMasterService = {
        getPatientByFusePatientId: jasmine
          .createSpy()
          .and.returnValue({ then: () => {} }),
        getReadyServices: jasmine
          .createSpy()
          .and.returnValue({ then: () => {} }),
      };
      $provide.value('ImagingMasterService', imagingMasterService);

      documentGroupsService = {
        getAll: jasmine.createSpy().and.returnValue({}),
        get: jasmine.createSpy().and.callFake(function () {
          deferred = q.defer();
          deferred.$promise = deferred.promise;
          deferred.resolve({ Value: [] });
          return deferred;
        }),
      };
      $provide.value('DocumentGroupsService', documentGroupsService);
      clinicalTimelineBusinessService = {
        getFilterButtons: jasmine.createSpy().and.returnValue([
          { RecordType: 'TreatmentPlan', Active: false },
          { RecordType: 'ServiceTransaction', Active: false },
          { RecordType: 'Condition', Active: false },
          { RecordType: 'ClinicalNote', Active: false },
          { RecordType: 'Appointment', Active: false },
        ]),
        setIsDeleted: jasmine.createSpy().and.returnValue({}),
        createTimelineIcon: jasmine.createSpy().and.returnValue('fa-so'),
        checkToothAssociated: jasmine.createSpy().and.returnValue(true),
      };

      $provide.value(
        'ClinicalTimelineBusinessService',
        clinicalTimelineBusinessService
      );

      patientLogic = {
        GetFormattedname: jasmine.createSpy().and.callFake(function () {
          return 'Duncan Frapples';
        }),
      };
      $provide.value('patientLogic', patientLogic);

      medicalHistoryFactory = {
        access: jasmine.createSpy().and.returnValue({ View: true }),
        getSummariesByPatientId: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
      };
      $provide.value('MedicalHistoryFactory', medicalHistoryFactory);

      patientRxFactory = {
        Medications: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        getMedications: jasmine
          .createSpy()
          .and.returnValue({ then: function () {} }),
        access: jasmine.createSpy().and.returnValue(true),
      };
      $provide.value('PatientRxFactory', patientRxFactory);

      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          locations: 'locations',
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      treatmentPlansFactory = {
        ExistingTreatmentPlans: jasmine.createSpy().and.returnValue({}),
        SetActiveTreatmentPlan: jasmine.createSpy(),
        ObserveExistingTreatmentPlansForTimeline: jasmine
          .createSpy()
          .and.returnValue({}),
        ClearObservers: jasmine.createSpy(),
      };
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue(of(false)),
      }
      $provide.value('featureFlagService', featureFlagService);
    })
  );

  var mockGroupByFilter = function () {
    return null;
  };

  beforeEach(function () {
    module(function ($provide) {
      $provide.value('groupByFilter', mockGroupByFilter);
    });
  });

  // create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $q,
    $routeParams
  ) {
    rootScope = $rootScope;
    scope = $rootScope.$new();
    scope.personId = personId;
    scope.data = { patientInfo: {} };
    scope.filterButtons = [
      { RecordType: 'TreatmentPlan', Active: false },
      { RecordType: 'ServiceTransaction', Active: false },
      { RecordType: 'Condition', Active: false },
      { RecordType: 'ClinicalNote', Active: false },
    ];
    routeParams = $routeParams;

    filter = $injector.get('$filter');
    q = $q;

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([]);
    });

    /*

documentGroupsService = {
            
            getAllDocuments: jasmine.createSpy().and.callFake(function () {
                deferred = q.defer();
                deferred.$promise = deferred.promise;
                deferred.resolve({ Value: [] });
                return deferred;
            })
        };

        */
    patientServices = {
      ExternalImages: {
        get: jasmine.createSpy().and.callFake(function () {
          deferred = q.defer();
          deferred.$promise = deferred.promise;
          deferred.resolve({ Value: [] });
          return deferred;
        }),
        create: jasmine.createSpy().and.callFake(function () {
          deferred = q.defer();
          deferred.$promise = deferred.promise;
          deferred.resolve({ Value: [] });
          return deferred;
        }),
      },
      Documents: {
        getAllDocuments: jasmine.createSpy().and.callFake(function () {
          deferred = q.defer();
          deferred.$promise = deferred.promise;
          deferred.resolve({ Value: [] });
          return deferred;
        }),
      },
      ServiceTransactions: {
        getServiceTransactionsForTimeline: jasmine
          .createSpy('getServiceTransactionsForTimeline')
          .and.callFake(function () {
            deferred = q.defer();
            deferred.resolve([{}, {}]);
            return deferred.promise;
          }),
      },
      TreatmentPlans: {
        getHeadersWithServicesSummary: jasmine.createSpy().and.returnValue(''),
      },
      PatientAppointment: {
        AppointmentsForAccount: jasmine
          .createSpy(
            'patientServices.PatientAppointment.AppointmentsForAccount'
          )
          .and.callFake(function () {
            deferred = q.defer();
            deferred.$promise = deferred.promise;
            deferred.resolve({ Value: [] });
            return deferred;
          }),
      },
    };

    timeZoneFactory = {
      GetTimeZoneAbbr: jasmine.createSpy().and.returnValue({}),
      ConvertAppointmentDatesTZ: jasmine.createSpy().and.returnValue({}),
    };
    routeParams = { activeExpand: true, txPlanId: '1234' };

    // create controller
    ctrl = $controller('ClinicalTimelineLandingController', {
      $scope: scope,
      $routeParams: routeParams,
      $rootScope: rootScope,
      PatientServices: patientServices,
      TimeZoneFactory: timeZoneFactory,
      ClinicalTimelineBusinessService: clinicalTimelineBusinessService,
    });

    scope.data = {
      patientInfo: {
        PatientId: '1234',
        FirstName: 'Duncan',
        LastName: 'Frapples',
        DirectoryAllocationId: 1234,
        PatientLocations: [{ LocationId: 111 }, { LocationId: 222 }],
      },
    };

    ctrl.initialized = {
      ServiceAndCondition: false,
      TreatmentPlan: false,
      ClinicalNote: false,
      Appointment: false,
      PerioStatsMouth: false,
      PerioStatsTooth: false,
      Documents: false,
      MedicalHistoryForms: false,
      ImageExam: false,
      PatientRx: false,
    };

    scope.loading = {
      ServiceAndCondition: true,
      TreatmentPlan: true,
      ClinicalNote: true,
      Appointment: true,
      PerioStatsMouth: true,
      PerioStatsTooth: false,
      Documents: false,
      MedicalHistoryForms: false,
      ImageExam: true,
      PatientRx: true,
    };
  }));

  //controller
  it('ClinicalTimelineLandingController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe(' scope.isDateVisible function ->', function () {
    it('should return true if all filteredTimelineRecords in group are loaded', function () {
      var filteredTimelineRecords = [{ load: true }, { load: true }];
      var result = scope.isDateVisible(1, filteredTimelineRecords);
      expect(result).toEqual(true);
    });

    it('should return false if all filteredTimelineRecords in group are not loaded', function () {
      var filteredTimelineRecords = [{ load: false }, { load: false }];
      var result = scope.isDateVisible(1, filteredTimelineRecords);
      expect(result).toEqual(false);
    });
  });

  describe(' ctrl.updateAndSortFilteredTimelineRecords function ->', function () {
    var timelineRecords = [];
    var newArray = [];
    var list = {
      record: [
        {
          DateModified: '2019-06-04T14:40:19.5538887',
          FileAllocationId: null,
          FormAnswersId: 741,
          IsDeleted: false,
          isDisabled: true,
          recordType: 'MedicalHx',
        },
        {
          DateModified: '2019-06-04T14:40:46.9180426',
          FileAllocationId: null,
          FormAnswersId: 742,
          IsDeleted: false,
          isDisabled: false,
          recordType: 'MedicalHx',
        },
        {
          DateModified: '2019-06-04T14:47:47.443492',
          FileAllocationId: null,
          FormAnswersId: 743,
          IsDeleted: false,
          isDisabled: true,
          recordType: 'MedicalHx',
        },
      ],
    };
    beforeEach(function () {
      scope.showActive = true;
      var todaysDate = new Date();

      scope.filteredTimelineRecords = [];
      timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Appointment',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
        },
      });
      timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'TreatmentPlan',
        record: { IsDeleted: false },
      });
      timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'TreatmentPlan',
        record: { IsDeleted: false },
      });
      // add record with todays date and Appointment recordType and Status of 4
      timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Appointment',
        record: { StartTime: todaysDate, Status: 4, IsDeleted: false },
      });
    });

    it('should filter filteredTimelineRecords to remove any records that are for today and are Appointment recordType and Status = 4', function () {
      ctrl.updateAndSortFilteredTimelineRecords(timelineRecords);
      for (var index in scope.filteredTimelineRecords) {
        if (index === '2019-02-18') {
          expect(scope.filteredTimelineRecords[index]).toContain(
            timelineRecords[0]
          );
          expect(scope.filteredTimelineRecords[index]).not.toContain(
            timelineRecords[3]
          );
        }
        if (index === '2019-01-18') {
          expect(scope.filteredTimelineRecords[index]).toContain(
            timelineRecords[1]
          );
          expect(scope.filteredTimelineRecords[index]).toContain(
            timelineRecords[2]
          );
        }
      }
    });

    it('should filter filteredTimelineRecords to remove any records that are for today and are Appointment recordType and Status = 4 and load these to scope.todaysAppts', function () {
      ctrl.updateAndSortFilteredTimelineRecords(timelineRecords);
      expect(scope.todaysAppts).toContain(timelineRecords[3]);
    });

    it('should load filteredTimelineRecords by groups based on groupDate', function () {
      ctrl.updateAndSortFilteredTimelineRecords(timelineRecords);

      for (var index in scope.filteredTimelineRecords) {
        if (index === '2019-02-18') {
          expect(scope.filteredTimelineRecords[index]).toContain(
            timelineRecords[0]
          );
        }
        if (index === '2019-01-18') {
          expect(scope.filteredTimelineRecords[index]).toContain(
            timelineRecords[1]
          );
          expect(scope.filteredTimelineRecords[index]).toContain(
            timelineRecords[2]
          );
        }
      }
    });

    it('should hide todaysAppts if Show Deleted filter is selected', function () {
      scope.showActive = false;
      ctrl.updateAndSortFilteredTimelineRecords(timelineRecords);
      expect(scope.showTodaysAppts).toBe(false);
    });

    it('should show todaysAppts if Hide Deleted filter is selected', function () {
      scope.showActive = true;
      ctrl.updateAndSortFilteredTimelineRecords(timelineRecords);
      expect(scope.showTodaysAppts).toBe(true);
    });

    it('should identify the unique records', function () {
      angular.forEach(list, function (value) {
        if (value.recordType === 'MedicalHx') {
          var exists = false;
          angular.forEach(newArray, function (val2) {
            if (value.record.FormAnswersId === val2.record.FormAnswersId) {
              expect(exists).toBe(true);
            }
          });
          if (exists === false) {
            newArray.push(value);
          }
        }
      });
    });
    it('should bind the unique records to existing list items', function () {
      var i = 1;
      angular.forEach(newArray, function (value) {
        var arrCount = 2;
        if (i == arrCount) {
          expect(value.record.isDisabled).toBe(false);
          list.push(value);
        } else {
          expect(value.record.isDisabled).toBe(true);
          list.push(value);
        }
      });
    });
  });

  /*
// special handling for images which can have a record type of 'Images' or 'ExternalImages'
                    timelineRecordType = timelineRecordType === 'ExternalImageExam' ? 'ImageExam' : timelineRecordType;
                    
    */
  describe('ctrl.filterRecords method ->', function () {
    beforeEach(function () {
      scope.timelineRecords = [];
      // add records to timeline records
      scope.timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Appointment',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
        },
      });
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'TreatmentPlan',
        record: { IsDeleted: false },
      });
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'TreatmentPlan',
        record: { IsDeleted: false },
      });
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'Medical History',
        Tooth: 2,
        Active: true,
        record: { IsDeleted: false },
      });
      scope.timelineRecords.push({
        groupDate: '2019-02-15',
        date: '2019-02-15',
        load: true,
        recordType: 'ImageExam',
        record: {
          StartTime: '2019-02-15 10:00:000',
          Status: 1,
          IsDeleted: false,
        },
      });
      scope.timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'ExternalImageExam',
        record: {
          StartTime: '2019-02-18 10:00:000',
          Status: 1,
          IsDeleted: false,
        },
      });
      scope.timelineRecords.push({
        groupDate: '2019-02-20',
        date: '2019-02-20',
        load: true,
        recordType: 'ExternalImageExam',
        record: {
          StartTime: '2019-02-20 10:00:000',
          Status: 1,
          IsDeleted: false,
        },
      });
      ctrl.filterTimeline = true;
      ctrl.everythingIsLoaded = true;
      ctrl.filteredTimelineRecordsCollection = [];
    });

    it('should do nothing if ctrl.filterTimeline is false or ctrl.everythingIsLoaded is false', function () {
      ctrl.filterTimeline = false;
      ctrl.filterRecords();
      expect(ctrl.filteredTimelineRecordsCollection.length).toBe(0);

      ctrl.filterTimeline = true;
      ctrl.everythingIsLoaded = false;
      ctrl.filterRecords();
      expect(ctrl.filteredTimelineRecordsCollection.length).toBe(0);
    });

    it('should show both ExternalImageExams and ImageExams when the Med ImageExam filter is active', function () {
      scope.appliedFilters = [{ RecordType: 'ImageExam', Active: true }];
      ctrl.buttonFiltersApplied = true;
      ctrl.filterRecords();
      expect(ctrl.filteredTimelineRecordsCollection.length).toBe(3);
      expect(ctrl.filteredTimelineRecordsCollection[0].recordType).toBe(
        'ImageExam'
      );
      expect(ctrl.filteredTimelineRecordsCollection[1].recordType).toBe(
        'ExternalImageExam'
      );
      expect(ctrl.filteredTimelineRecordsCollection[2].recordType).toBe(
        'ExternalImageExam'
      );
    });

    it('should show documents in the Medical History doc group, these need to show up when the Med Hx filter is active', function () {
      scope.appliedFilters = [{ RecordType: 'MedicalHx', Active: true }];
      ctrl.buttonFiltersApplied = true;
      ctrl.filterRecords();
      expect(ctrl.filteredTimelineRecordsCollection.length).toBe(1);
      expect(ctrl.filteredTimelineRecordsCollection[0].recordType).toBe(
        'Medical History'
      );
    });

    it('should handle Consent documents correctly', function () {
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'Consent',
        Tooth: 2,
        Active: true,
        record: { IsDeleted: false },
      });
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'DigitalConsent',
        Tooth: 2,
        Active: true,
        record: { IsDeleted: false },
      });
      scope.appliedFilters = [{ RecordType: 'Consent', Active: true }];
      ctrl.buttonFiltersApplied = true;
      ctrl.filterRecords();
      expect(ctrl.filteredTimelineRecordsCollection.length).toBe(2);
      expect(ctrl.filteredTimelineRecordsCollection[0].recordType).toBe(
        'Consent'
      );
      expect(ctrl.filteredTimelineRecordsCollection[1].recordType).toBe(
        'DigitalConsent'
      );
    });

    it('should not filter records if ctrl.buttonFiltersApplied is false', function () {
      ctrl.buttonFiltersApplied = false;
      ctrl.filterRecords();
      expect(ctrl.filteredTimelineRecordsCollection.length).toBe(7);
    });

    it('should filter records for PerioStatusMouth if appliedRecordType is PerioStatsMouth', function () {
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'PerioStatsMouth',
        Tooth: 4,
        Active: true,
        record: { IsDeleted: false },
      });
      scope.appliedFilters = [{ RecordType: 'PerioStatsMouth', Active: true }];
      ctrl.buttonFiltersApplied = true;
      ctrl.filterRecords();
      expect(ctrl.filteredTimelineRecordsCollection.length).toBe(1);
      expect(ctrl.filteredTimelineRecordsCollection[0].recordType).toBe(
        'PerioStatsMouth'
      );
    });

    it('should call to get exam details if appliedRecordType is PerioStatsMouth and has security access and ctrl.toothFilterApplied', function () {
      spyOn(
        ctrl,
        'getPerioStatsToothExamDetailsByPatientId'
      ).and.callFake(function () {});
      ctrl.hasClinicalPerioStatsViewAccess = true;
      ctrl.toothFilterApplied = true;
      ctrl.reloadPerio = true;
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'PerioStatsMouth',
        Tooth: 4,
        Active: true,
        record: { IsDeleted: false },
      });
      scope.appliedFilters = [{ RecordType: 'PerioStatsMouth', Active: true }];
      ctrl.buttonFiltersApplied = true;
      ctrl.filterRecords();
      expect(ctrl.filteredTimelineRecordsCollection.length).toBe(1);
      expect(ctrl.filteredTimelineRecordsCollection[0].recordType).toBe(
        'PerioStatsMouth'
      );
      expect(
        ctrl.getPerioStatsToothExamDetailsByPatientId
      ).toHaveBeenCalledWith(ctrl.filteredTimelineRecordsCollection);
    });

    it('should call updateAndSortFilteredTimelineRecords if appliedRecordType is PerioStatsMouth and has security access and not ctrl.toothFilterApplied', function () {
      spyOn(
        ctrl,
        'updateAndSortFilteredTimelineRecords'
      ).and.callFake(function () {});
      ctrl.hasClinicalPerioStatsViewAccess = true;
      ctrl.toothFilterApplied = false;
      ctrl.reloadPerio = true;
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'PerioStatsMouth',
        Tooth: 4,
        Active: true,
        record: { IsDeleted: false },
      });
      scope.appliedFilters = [{ RecordType: 'PerioStatsMouth', Active: true }];
      ctrl.buttonFiltersApplied = true;
      ctrl.filterRecords();
      expect(ctrl.filteredTimelineRecordsCollection.length).toBe(1);
      expect(ctrl.filteredTimelineRecordsCollection[0].recordType).toBe(
        'PerioStatsMouth'
      );
      expect(ctrl.updateAndSortFilteredTimelineRecords).toHaveBeenCalledWith(
        ctrl.filteredTimelineRecordsCollection
      );
    });
  });

  describe(' ctrl.shouldIFilterRecords method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'filterRecords');
      scope.loading = {
        ServiceAndCondition: false,
        TreatmentPlan: false,
        ClinicalNote: false,
        Appointment: false,
        PerioStatsMouth: false,
        PerioStatsTooth: false,
        Documents: false,
        MedicalHistory: false,
        ImageExam: false,
        ImageExamExternal: false,
        PatientRx: false,
      };
    });

    it('should call filterRecords ', function () {
      ctrl.shouldIFilterRecords();
      expect(ctrl.filterRecords).toHaveBeenCalled();
    });
  });

  describe('ctrl.resetTxPlanTimeline method ->', function () {
    beforeEach(function () {
      scope.timelineRecords = [];
      // add records to timeline records
      scope.timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'TreatmentPlan',
        record: {
          IsDeleted: false,
          TreatmentPlanHeader: { TreatmentPlanId: '12344' },
        },
      });
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'TreatmentPlan',
        record: {
          IsDeleted: false,
          TreatmentPlanHeader: { TreatmentPlanId: '12354' },
        },
      });
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'TreatmentPlan',
        record: {
          IsDeleted: false,
          TreatmentPlanHeader: { TreatmentPlanId: '12364' },
        },
      });

      ctrl.treatmentPlans = [
        { record: { TreatmentPlanHeader: { TreatmentPlanId: '12344' } } },
        { record: { TreatmentPlanHeader: { TreatmentPlanId: '12354' } } },
        { record: { TreatmentPlanHeader: { TreatmentPlanId: '12364' } } },
        { record: { TreatmentPlanHeader: { TreatmentPlanId: '12374' } } },
      ];
    });

    it('should handle reload of treatmentPlans due to nested treatmentPlanId  ', function () {
      var clonedList = _.cloneDeep(scope.timelineRecords);
      clonedList = ctrl.resetTxPlanTimeline(
        ctrl.treatmentPlans,
        clonedList,
        'TreatmentPlan'
      );
      expect(clonedList[0].record.TreatmentPlanHeader.TreatmentPlanId).toEqual(
        '12344'
      );
      expect(clonedList[1].record.TreatmentPlanHeader.TreatmentPlanId).toEqual(
        '12354'
      );
      expect(clonedList[2].record.TreatmentPlanHeader.TreatmentPlanId).toEqual(
        '12364'
      );
      expect(clonedList[3].record.TreatmentPlanHeader.TreatmentPlanId).toEqual(
        '12374'
      );
    });

    it('should reload the treatment plan timeline records and remove tx plan items that are no longer in the list', function () {
      var clonedList = _.cloneDeep(scope.timelineRecords);
      expect(clonedList.length).toEqual(3);
      // remove last 2 from ctrl.treatmentPlans
      ctrl.treatmentPlans.splice(2, 1);
      ctrl.treatmentPlans.splice(2, 1);
      clonedList = ctrl.resetTxPlanTimeline(
        ctrl.treatmentPlans,
        clonedList,
        'TreatmentPlan'
      );
      expect(clonedList[0].record.TreatmentPlanHeader.TreatmentPlanId).toEqual(
        '12344'
      );
      expect(clonedList[1].record.TreatmentPlanHeader.TreatmentPlanId).toEqual(
        '12354'
      );
      expect(clonedList.length).toEqual(2);
    });
  });

  describe('ctrl.resetTxPlanTimeline method ->', function () {
    beforeEach(function () {
      scope.timelineRecords = [];
      // add records to timeline records
      scope.timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'ServiceTransaction',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ServiceTransactionId: '2222',
        },
      });
      scope.timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'ServiceTransaction',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ServiceTransactionId: '2223',
        },
      });
      scope.timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'TreatmentPlan',
        record: {
          IsDeleted: false,
          TreatmentPlanHeader: { TreatmentPlanId: '12344' },
        },
      });
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'TreatmentPlan',
        record: {
          IsDeleted: false,
          TreatmentPlanHeader: { TreatmentPlanId: '12354' },
        },
      });
      scope.timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'TreatmentPlan',
        record: {
          IsDeleted: false,
          TreatmentPlanHeader: { TreatmentPlanId: '12364' },
        },
      });

      ctrl.treatmentPlans = [
        { record: { TreatmentPlanHeader: { TreatmentPlanId: '12344' } } },
        { record: { TreatmentPlanHeader: { TreatmentPlanId: '12354' } } },
      ];
    });

    it('should reload the treatment plan timeline records and remove tx plan items that are no longer in the list', function () {
      var clonedList = _.cloneDeep(scope.timelineRecords);
      expect(clonedList.length).toEqual(5);

      clonedList = ctrl.resetTxPlanTimeline(
        ctrl.treatmentPlans,
        clonedList,
        'TreatmentPlan'
      );
      expect(clonedList[0].record.ServiceTransactionId).toBe('2222');
      expect(clonedList[1].record.ServiceTransactionId).toBe('2223');
      expect(clonedList[2].record.TreatmentPlanHeader.TreatmentPlanId).toEqual(
        '12344'
      );
      expect(clonedList[3].record.TreatmentPlanHeader.TreatmentPlanId).toEqual(
        '12354'
      );

      expect(clonedList.length).toEqual(4);
    });
  });

  describe('ctrl.resetItemsInTimeLine method ->', function () {
    var timelineRecords = [];
    beforeEach(function () {
      // add records to timeline records
      timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Appointment',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          AppointmentId: '2222',
        },
      });
      timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Appointment',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          AppointmentId: '2224',
        },
      });
      // timelineRecords.push( {groupDate:'2019-01-18',date:'2019-01-18', load:true, IsDeleted:true, recordType:'TreatmentPlan',
      //     record:{IsDeleted:false} });
      // timelineRecords.push( {groupDate:'2019-01-18',date:'2019-01-18', load:true, IsDeleted:true, recordType:'TreatmentPlan',
      //     record:{IsDeleted:false} });
      timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'Medical History',
        Tooth: 2,
        Active: true,
        record: { IsDeleted: false },
      });
      timelineRecords.push({
        groupDate: '2019-01-18',
        date: '2019-01-18',
        load: true,
        IsDeleted: true,
        recordType: 'Medical History',
        Tooth: 2,
        Active: true,
        record: { IsDeleted: false },
      });
      timelineRecords.push({
        groupDate: '2019-01-16',
        date: '2019-01-16',
        load: true,
        IsDeleted: true,
        recordType: 'ClinicalNote',
        Active: true,
        record: { IsDeleted: false, NoteId: '5252' },
      });
      timelineRecords.push({
        groupDate: '2019-01-16',
        date: '2019-01-16',
        load: true,
        IsDeleted: true,
        recordType: 'ClinicalNote',
        Active: true,
        record: { IsDeleted: false, NoteId: '5555' },
      });
      spyOn(ctrl, 'resetSingleItemInTimeline').and.returnValue([]);
    });

    it('should call ctrl.resetSingleItemInTimeline for each timelineRecord based on recordType', function () {
      var data = _.cloneDeep(timelineRecords);
      var appointmentRecords = _.filter(data, function (timelineRecord) {
        return (timelineRecord.recordType = 'Appointment');
      });
      ctrl.resetItemsInTimeLine(
        appointmentRecords,
        [],
        'Appointment',
        'AppointmentId'
      );
      expect(ctrl.resetSingleItemInTimeline).toHaveBeenCalledWith(
        appointmentRecords[0],
        [],
        'Appointment',
        'AppointmentId'
      );
      expect(ctrl.resetSingleItemInTimeline).toHaveBeenCalledWith(
        appointmentRecords[1],
        [],
        'Appointment',
        'AppointmentId'
      );

      var clinicalNoteRecords = _.filter(data, function (timelineRecord) {
        return (timelineRecord.recordType = 'ClinicalNote');
      });
      ctrl.resetItemsInTimeLine(
        clinicalNoteRecords,
        [],
        'ClinicalNote',
        'NoteId'
      );
      expect(ctrl.resetSingleItemInTimeline).toHaveBeenCalledWith(
        clinicalNoteRecords[0],
        [],
        'ClinicalNote',
        'NoteId'
      );
      expect(ctrl.resetSingleItemInTimeline).toHaveBeenCalledWith(
        clinicalNoteRecords[1],
        [],
        'ClinicalNote',
        'NoteId'
      );
    });
  });

  describe(' ctrl.resetSingleItemInTimeline method ->', function () {
    var timelineRecords = [];
    beforeEach(function () {
      timelineRecords = [];
      // add records to timeline records
      timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Appointment',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          AppointmentId: '2222',
        },
      });
      timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Appointment',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          AppointmentId: '2224',
        },
      });
    });

    it('should replace matching item in timeline based on propName if item exists in timeline', function () {
      var clonedList = [];
      clonedList = _.cloneDeep(timelineRecords);
      expect(clonedList.length).toBe(2);
      expect(clonedList[0].record.IsDeleted).toBe(false);
      var updatedItem = {
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Appointment',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: true,
          AppointmentId: '2222',
        },
      };
      clonedList = ctrl.resetSingleItemInTimeline(
        updatedItem,
        clonedList,
        'Appointment',
        'AppointmentId'
      );
      expect(clonedList[0].record.IsDeleted).toBe(true);
      expect(clonedList.length).toBe(2);
    });

    it('should add item in timeline based on propName if item does not exist in timeline', function () {
      var clonedList = [];
      clonedList = _.cloneDeep(timelineRecords);
      expect(clonedList.length).toBe(2);
      var newItem = {
        groupDate: '2019-02-20',
        date: '2019-02-18',
        load: true,
        recordType: 'Appointment',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          AppointmentId: '3333',
        },
      };
      clonedList = ctrl.resetSingleItemInTimeline(
        newItem,
        clonedList,
        'Appointment',
        'AppointmentId'
      );
      expect(clonedList.length).toBe(3);
    });
  });

  describe(' ctrl.resetTxPlanTimeline method ->', function () {
    it('should return true if all filteredTimelineRecords in group are loaded', function () {});

    it('should return false if all filteredTimelineRecords in group are not loaded', function () {});
  });

  describe('loadServicesAndConditions ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'executeServiceLoadingFallback').and.callFake(function () {});
      spyOn(ctrl, 'getConditions').and.callFake(function () {});
      spyOn(ctrl, 'getServiceCodes').and.callFake(function () {});
    });

    it('should call ctrl.executeServiceLoadingFallback if scope.loading.ServiceAndCondition is true and ctrl.initialized.ServiceAndCondition is true', function () {
      ctrl.initialized = { ServiceAndCondition: true };
      scope.loading = { ServiceAndCondition: true };
      ctrl.loadServicesAndConditions();
      expect(ctrl.executeServiceLoadingFallback).toHaveBeenCalled();
    });

    it('should call ctrl.executeServiceLoadingFallback if ctrl.initialized.ServiceAndCondition is false or ctrl.loading.ServiceAndCondition is false', function () {
      ctrl.initialized = { ServiceAndCondition: false };
      ctrl.loading = { ServiceAndCondition: false };
      ctrl.loadServicesAndConditions();
      expect(ctrl.executeServiceLoadingFallback).not.toHaveBeenCalled();
    });

    it('should call ctrl.getConditions and ctrl.getServiceCodes', function () {
      ctrl.initialized = { ServiceAndCondition: false };
      ctrl.loading = { ServiceAndCondition: false };
      ctrl.loadServicesAndConditions();
      ctrl.loadServicesAndConditions();
      expect(ctrl.getConditions).toHaveBeenCalled();
      expect(ctrl.getServiceCodes).toHaveBeenCalled();
    });
  });

  describe('fetchServiceAndConditionRecordsOnSuccess function ->', function () {
    beforeEach(function () {
      ctrl.initialized = {
        ServiceAndCondition: false,
        TreatmentPlan: false,
        ClinicalNote: false,
        Appointment: false,
        PerioStatsMouth: false,
        PerioStatsTooth: false,
        Documents: false,
        MedicalHistoryForms: false,
        ImageExam: false,
        PatientRx: false,
      };
      spyOn(ctrl, 'executeServiceLoadingFallback').and.callFake(function () {});
      scope.personId = '123456789';
    });

    it('should reset list before updating records', function () {
      ctrl.fetchServiceAndConditionRecordsOnSuccess();
      expect(ctrl.patientServicesAndConditions).toEqual([]);
    });

    it('should call patientServices.ServiceTransactions.getServiceTransactionsForTimeline', function () {
      ctrl.fetchServiceAndConditionRecordsOnSuccess();
      expect(
        patientServices.ServiceTransactions.getServiceTransactionsForTimeline
      ).toHaveBeenCalledWith({ personId: '123456789' }, jasmine.any(Function));
    });

    // NOTE code changes required to test this accurately
    // it('should call ctrl.addServiceCodeToItem if asked for services to display in timeline ', function () {
    //     spyOn(ctrl, 'addServiceCodeToItem');
    //     scope.chartLedgerServices = [{ ServiceCodeId: 1, ConditionId: 0 }];
    //     scope.hasClinicalServiceViewAccess = true;
    //     ctrl.fetchServiceAndConditionRecordsOnSuccess();
    //     expect(ctrl.addServiceCodeToItem).toHaveBeenCalled();
    // });

    // it('should call ctrl.addConditionToItem if asked for conditions to display in timeline ', function () {
    //     spyOn(ctrl, 'addConditionToItem');
    //     scope.chartLedgerServices = [{ ServiceCodeId: 0, ConditionId: 1 }];
    //     scope.hasClinicalConditionViewAccess = true;
    //     ctrl.fetchServiceAndConditionRecordsOnSuccess();
    //     //expect(ctrl.addConditionToItem).toHaveBeenCalled();
    // });

    // it('should set ctrl.initialized.ServiceAndCondition to true if service transaction and patient condition are initialized for the first time', function () {
    //     ctrl.initialized.ServiceAndCondition = false;
    //     ctrl.fetchServiceAndConditionRecordsOnSuccess();
    //     //expect(ctrl.initialized.ServiceAndCondition).toBe(true);
    // });

    // it('should set scope.loading.ServiceAndCondition to false', function () {
    //     ctrl.fetchServiceAndConditionRecordsOnSuccess();
    //     expect(scope.loading.ServiceAndCondition).toBe(true);
    // });
  });

  describe('fetchServiceAndConditionRecordsOnError function ->', function () {
    it('should reset list and vars before updating records', function () {
      spyOn(ctrl, 'executeServiceLoadingFallback').and.callFake(function () {});
      ctrl.fetchServiceAndConditionRecordsOnError();
      expect(ctrl.patientServicesAndConditions).toEqual([]);
      expect(ctrl.initialized.ServiceAndCondition).toBe(true);
      expect(ctrl.executeServiceLoadingFallback).toHaveBeenCalled();
    });
  });

  describe('ctrl.executeServiceLoadingFallback method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'shouldIFilterRecords').and.callFake(function () {});
    });

    it('should set scope.loading.ServiceAndCondition to false', function () {
      ctrl.executeServiceLoadingFallback();
      expect(scope.loading.ServiceAndCondition).toEqual(false);
    });

    it('should call ctrl.shouldIFilterRecords', function () {
      ctrl.executeServiceLoadingFallback();
      expect(ctrl.shouldIFilterRecords).toHaveBeenCalled();
    });
  });

  describe('ctrl.addServiceCodeToItem method ->', function () {
    var chartLedgerService = {};
    beforeEach(function () {
      spyOn(ctrl, 'shouldIFilterRecords').and.callFake(function () {});
      chartLedgerService = {
        DateEntered: '2019-05-19',
        ServiceCodeId: '12345',
      };
      ctrl.patientServicesAndConditions = [];
      spyOn(ctrl, 'createTimelineItem').and.callFake(function () {
        return { record: {} };
      });
      ctrl.serviceCodes = [
        {
          ServiceCodeId: '12345',
          DisplayAs: '12345',
          AffectedAreaId: 'M',
          Code: '124',
        },
        { ServiceCodeId: '12344' },
      ];
    });

    it('should set serviceCode properties on item', function () {
      ctrl.addServiceCodeToItem(chartLedgerService);
      expect(chartLedgerService.recordType).toEqual('ServiceTransaction');
    });

    it('should add record with serviceCode properties to ctrl.patientServicesAndConditions if matching serviceCode is found', function () {
      ctrl.addServiceCodeToItem(chartLedgerService);
      expect(ctrl.patientServicesAndConditions[0].record.DisplayAs).toEqual(
        ctrl.serviceCodes[0].DisplayAs
      );
      expect(
        ctrl.patientServicesAndConditions[0].record.AffectedAreaId
      ).toEqual(ctrl.serviceCodes[0].AffectedAreaId);
      expect(ctrl.patientServicesAndConditions[0].record.CdtCodeName).toEqual(
        ctrl.serviceCodes[0].Code
      );
    });

    it('should add record to ctrl.patientServicesAndConditions if matching serviceCode is found', function () {
      ctrl.addServiceCodeToItem(chartLedgerService);
      expect(ctrl.patientServicesAndConditions.length).toEqual(1);
    });
  });

  describe('ctrl.addConditionToItem method ->', function () {
    var chartLedgerService = {};
    beforeEach(function () {
      spyOn(ctrl, 'shouldIFilterRecords').and.callFake(function () {});
      chartLedgerService = {
        DateEntered: '2019-05-19',
        RecordType: 'Condition',
        ConditionId: '12345',
      };
      ctrl.patientServicesAndConditions = [];
      spyOn(ctrl, 'createTimelineItem').and.callFake(function () {
        return { record: {} };
      });
      ctrl.conditions = [
        {
          ConditionId: '12345',
          Description: 'ConditionDescription',
          AffectedAreaId: 'M',
        },
        { ConditionId: '12344' },
      ];
    });

    it('should add record with condition properties to ctrl.patientServicesAndConditions if matching condition is found', function () {
      ctrl.addConditionToItem(chartLedgerService);
      expect(ctrl.patientServicesAndConditions[0].record.Description).toEqual(
        ctrl.conditions[0].Description
      );
      expect(
        ctrl.patientServicesAndConditions[0].record.AffectedAreaId
      ).toEqual(ctrl.conditions[0].AffectedAreaId);
    });

    it('should add record to ctrl.patientServicesAndConditions if matching serviceCode is found', function () {
      ctrl.addConditionToItem(chartLedgerService);
      expect(ctrl.patientServicesAndConditions.length).toEqual(1);
    });
  });

  describe('chartLedgerServices watch ->', function () {
    beforeEach(function () {
      scope.chartLedgerServices = [];
      spyOn(ctrl, 'createTimelineItem').and.callFake(function () {
        return { record: { recordType: 'Condition' } };
      });
      ctrl.conditions = [
        {
          ConditionId: '12345',
          Description: 'ConditionDescription',
          AffectedAreaId: 'M',
        },
        { ConditionId: '12344' },
      ];
      ctrl.serviceCodes = [
        {
          ServiceCodeId: '12345',
          DisplayAs: '12345',
          AffectedAreaId: 'M',
          Code: '124',
        },
        { ServiceCodeId: '12344' },
      ];
      scope.timelineRecords = [];
    });

    it(
      'should call ctrl.createTimelineItem for each chartLedgerServices if ctrl.initialized.ServiceAndCondition is true ' +
        ' and item has been modified and ctrl.reloadingChartLedger is true',
      function () {
        spyOn(ctrl, 'loadServicesAndConditions');
        ctrl.initialized.ServiceAndCondition = true;
        ctrl.reloadingChartLedger = true;
        scope.chartLedgerServices = [
          {
            ServiceCodeId: 1,
            CreationDate: '2019-02-19',
            RecordType: 'ServiceTransaction',
            Tooth: 10,
          },
        ];
        scope.$apply();
        scope.chartLedgerServices = [
          {
            ServiceCodeId: 1,
            CreationDate: '2019-02-19',
            RecordType: 'ServiceTransaction',
            Tooth: 9,
          },
        ];
        scope.$apply();
        _.forEach(scope.chartLedgerServices, function (cls) {
          expect(ctrl.createTimelineItem).toHaveBeenCalledWith(
            cls.CreationDate,
            cls,
            cls.RecordType
          );
        });
      }
    );

    it('should call ctrl.createTimelineItem for each chartLedgerServices if ctrl.initialized.ServiceAndCondition is true', function () {
      spyOn(ctrl, 'loadServicesAndConditions');
      ctrl.initialized.ServiceAndCondition = true;
      scope.chartLedgerServices = [
        {
          ServiceCodeId: 1,
          CreationDate: '2019-02-19',
          RecordType: 'ServiceTransaction',
        },
      ];
      scope.$apply();
      scope.chartLedgerServices = [
        {
          ServiceCodeId: 1,
          CreationDate: '2019-02-19',
          RecordType: 'ServiceTransaction',
        },
        {
          ServiceCodeId: 2,
          CreationDate: '2019-02-19',
          RecordType: 'ServiceTransaction',
        },
      ];
      scope.$apply();
      _.forEach(scope.chartLedgerServices, function (cls) {
        expect(ctrl.createTimelineItem).toHaveBeenCalledWith(
          cls.CreationDate,
          cls,
          cls.RecordType
        );
      });
    });

    it('should remove timelineRecords when chartLedgerServices does not contain them', function () {
      spyOn(ctrl, 'loadServicesAndConditions');
      ctrl.initialized.ServiceAndCondition = true;

      scope.timelineRecords = [
        {
          recordType: 'ServiceTransaction',
          record: {
            ServiceCodeId: 1,
            CreationDate: '2019-02-19',
            RecordType: 'ServiceTransaction',
            RecordId: '1234',
          },
        },
        {
          recordType: 'ServiceTransaction',
          record: {
            ServiceCodeId: 2,
            CreationDate: '2019-02-19',
            RecordType: 'ServiceTransaction',
            RecordId: '1236',
          },
        },
        {
          recordType: 'ServiceTransaction',
          record: {
            ServiceCodeId: 5,
            CreationDate: '2019-06-25',
            RecordType: 'ServiceTransaction',
            RecordId: '1238',
          },
        },
        {
          recordType: 'Condition',
          record: {
            ServiceCodeId: 5,
            CreationDate: '2019-06-25',
            RecordType: 'Condition',
            RecordId: '12381',
          },
        },
        {
          recordType: 'ClinicalNote',
          record: {
            ServiceCodeId: 5,
            CreationDate: '2019-06-25',
            RecordType: 'ClinicalNote',
            RecordId: '551238',
          },
        },
        {
          recordType: 'ClinicalNote',
          record: {
            ServiceCodeId: 5,
            CreationDate: '2019-06-25',
            RecordType: 'ClinicalNote',
            RecordId: '551238',
          },
        },
      ];

      scope.chartLedgerServices = [
        {
          ServiceCodeId: 1,
          CreationDate: '2019-02-19',
          RecordType: 'ServiceTransaction',
          RecordId: '1234',
        },
        {
          ServiceCodeId: 2,
          CreationDate: '2019-02-19',
          RecordType: 'ServiceTransaction',
          RecordId: '1236',
        },
        {
          ServiceCodeId: 5,
          CreationDate: '2019-06-25',
          RecordType: 'ServiceTransaction',
          RecordId: '1238',
        },
        {
          ServiceCodeId: 5,
          CreationDate: '2019-06-25',
          RecordType: 'Condition',
          RecordId: '12381',
        },
      ];
      scope.$apply();
      // remove recordid 1238
      scope.chartLedgerServices = [
        {
          ServiceCodeId: 1,
          CreationDate: '2019-02-19',
          RecordType: 'ServiceTransaction',
          RecordId: '1234',
        },
        {
          ServiceCodeId: 2,
          CreationDate: '2019-02-19',
          RecordType: 'ServiceTransaction',
          RecordId: '1236',
        },
        {
          ServiceCodeId: 5,
          CreationDate: '2019-06-25',
          RecordType: 'Condition',
          RecordId: '12381',
        },
      ];
      scope.$apply();
      _.forEach(scope.chartLedgerServices, function (cls) {
        if (cls.RecordId !== '1238') {
          expect(ctrl.createTimelineItem).toHaveBeenCalledWith(
            cls.CreationDate,
            cls,
            cls.RecordType
          );
        }
        if (cls.RecordId === '1238') {
          expect(ctrl.createTimelineItem).toHaveBeenCalledWith(
            cls.CreationDate,
            cls,
            cls.RecordType
          );
        }
      });
    });
  });

  describe('appliedFilters watch ->', function () {
    beforeEach(function () {});

    it('should todays appts if filters are applied and none of them are appt', function () {
      scope.appliedFilters = [{ RecordType: 'Appointment' }];
      scope.$apply();
      scope.appliedFilters = [
        { RecordType: 'Appointment' },
        { RecordType: 'ServiceTransaction' },
      ];
      scope.$apply();
      expect(scope.showTodaysAppts).toBe(true);
    });

    it('should todays appts if filters are applied and none of them are appt', function () {
      scope.appliedFilters = [{ RecordType: 'Condition' }];
      scope.$apply();
      scope.appliedFilters = [
        { RecordType: 'Condition' },
        { RecordType: 'ServiceTransaction' },
      ];
      scope.$apply();
      expect(scope.showTodaysAppts).toBe(false);
    });
  });

  describe(' $on chart-ledger:patient-condition-deleted event ->', function () {
    var timelineRecords = [];
    beforeEach(function () {
      timelineRecords = [];
      // add records to timeline records
      timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Condition',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ConditionId: '2222',
        },
      });
      timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Condition',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ConditionId: '2224',
        },
      });
      spyOn(ctrl, 'executeServiceLoadingFallback');
    });

    it('should remove record from timelineRecords when deleted', function () {
      scope.timelineRecords = _.cloneDeep(timelineRecords);
      expect(scope.timelineRecords.length).toBe(2);
      var deletedRecord = {
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Condition',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ConditionId: '2224',
        },
      };
      scope.$emit('chart-ledger:patient-condition-deleted', deletedRecord);
      expect(scope.timelineRecords.length).toBe(1);
    });

    it('should call ctrl.executeServiceLoadingFallback', function () {
      scope.timelineRecords = _.cloneDeep(timelineRecords);

      var deletedRecord = {
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Condition',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ConditionId: '2224',
        },
      };
      scope.$emit('chart-ledger:patient-condition-deleted', deletedRecord);
      expect(ctrl.executeServiceLoadingFallback).toHaveBeenCalled();
    });
  });

  describe(' $on chart-ledger:service-transaction-deleted event ->', function () {
    var timelineRecords = [];
    beforeEach(function () {
      timelineRecords = [];
      // add records to timeline records
      timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'ServiceTransaction',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ServiceTransactionId: '2222',
        },
      });
      timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'Condition',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ConditionId: '2224',
        },
      });
      spyOn(ctrl, 'executeServiceLoadingFallback');
      spyOn(ctrl, 'loadAppointments');
    });

    it('should remove record from timelineRecords when deleted', function () {
      scope.timelineRecords = _.cloneDeep(timelineRecords);
      expect(scope.timelineRecords.length).toBe(2);
      var deletedRecord = {
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'ServiceTransaction',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ServiceTransactionId: '2222',
        },
      };
      scope.$emit('chart-ledger:service-transaction-deleted', deletedRecord);
      expect(scope.timelineRecords.length).toBe(1);
    });

    it('should call ctrl.loadAppointments', function () {
      scope.timelineRecords = _.cloneDeep(timelineRecords);
      var deletedRecord = {
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'ServiceTransaction',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ServiceTransactionId: '2222',
        },
      };
      scope.$emit('chart-ledger:service-transaction-deleted', deletedRecord);
      expect(ctrl.loadAppointments).toHaveBeenCalled();
    });

    it('should call ctrl.executeServiceLoadingFallback', function () {
      scope.timelineRecords = _.cloneDeep(timelineRecords);
      var deletedRecord = {
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'ServiceTransaction',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ServiceTransactionId: '2222',
        },
      };
      scope.$emit('chart-ledger:service-transaction-deleted', deletedRecord);
      expect(ctrl.executeServiceLoadingFallback).toHaveBeenCalled();
    });
  });

  describe('ctrl.processClinicalNotes function ->', function () {
    var notes = [];
    beforeEach(function () {
      notes = [
        { CreatedDate: '2019-02-10', NoteId: '111' },
        { CreatedDate: '2019-02-18', NoteId: '112' },
        { CreatedDate: '2019-02-19', NoteId: '113' },
        { CreatedDate: '2019-02-20', NoteId: '114' },
      ];

      spyOn(ctrl, 'executeClinicalNotesLoadingFallback');
      spyOn(ctrl, 'createTimelineItem').and.returnValue({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'ClinicalNote',
        record: { IsDeleted: false },
      });
      spyOn(ctrl, 'getRecentClinicalNotes').and.returnValue(notes);
    });

    it('should call resetItemsInTimeLine if ctrl.initialized.ClinicalNotes is true (indicates clinical notes already exist in the timeline records ', function () {
      ctrl.initialized.ClinicalNote = true;
      spyOn(ctrl, 'resetItemsInTimeLine').and.returnValue([]);
      scope.timelineRecords = [];
      ctrl.processClinicalNotes(notes);
      expect(ctrl.resetItemsInTimeLine).toHaveBeenCalled();
    });

    it('should initialize the clinical notes timeline records ctrl.initialized.ClinicalNotes is false (indicates clinical notes do not exist in the timeline records ', function () {
      ctrl.initialized.ClinicalNote = false;
      scope.timelineRecords = [];
      ctrl.processClinicalNotes(notes);
      expect(scope.timelineRecords.length).toEqual(4);
    });

    it('should set scope.timelineRecords to contain ctrl.clinicalNotes and set ctrl.initialized.ClinicalNotes to true', function () {
      scope.timelineRecords = [];
      ctrl.initialized.ClinicalNote = false;
      ctrl.processClinicalNotes(notes);
      expect(ctrl.initialized.ClinicalNote).toBe(true);
      expect(scope.timelineRecords.length).toEqual(4);
    });

    it('should call remove note records from timelineRecords that are no longer in the notes list ', function () {
      ctrl.initialized.ClinicalNote = true;

      scope.timelineRecords = [
        {
          date: '2019-02-10',
          recordType: 'ClinicalNote',
          record: { CreatedDate: '2019-02-10', NoteId: '111' },
        },
        {
          date: '2019-02-18',
          recordType: 'ClinicalNote',
          record: { CreatedDate: '2019-02-18', NoteId: '112' },
        },
        {
          date: '2019-02-19',
          recordType: 'ClinicalNote',
          record: { CreatedDate: '2019-02-19', NoteId: '113' },
        },
        {
          date: '2019-02-20',
          recordType: 'ClinicalNote',
          record: { CreatedDate: '2019-02-20', NoteId: '114' },
        },
        {
          date: '2019-01-10',
          recordType: 'ClinicalNote',
          record: { CreatedDate: '2019-01-10', NoteId: '115' },
        },
      ];
      spyOn(ctrl, 'resetItemsInTimeLine').and.returnValue(
        scope.timelineRecords
      );
      expect(scope.timelineRecords.length).toBe(5);
      ctrl.processClinicalNotes(notes);
      // NoteId 115 is no longer in list
      expect(scope.timelineRecords.length).toBe(4);
    });
  });

  //TODO ctrl.processTreatmentPlans

  describe(' $on appointment:startup-show-appointment-model event ->', function () {
    beforeEach(function () {
      spyOn(rootScope, '$broadcast');
    });

    it('should broadcast appointment:begin-appointment if appointment is not null', function () {
      var appointment = {};
      scope.$emit('appointment:startup-show-appointment-model', appointment);
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'appointment:begin-appointment',
        appointment
      );
      expect(scope.isAppointmentDisabled).toBe(true);
    });
  });

  describe(' $on appointment:start-appointment event ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'processAppointmentRecord').and.callFake(function () {
        return { StartTime: '2019-02-19 10:00:000' };
      });
      spyOn(ctrl, 'createTimelineItem').and.callFake(function () {
        return { record: { AppointmentId: '1234', recordType: 'Appointment' } };
      });
      spyOn(
        ctrl,
        'executeAppointmentLoadingFallback'
      ).and.callFake(function () {});
    });

    it('should call ctrl.processAppointmentRecord with appointment', function () {
      var appointment = {};
      scope.$emit('appointment:start-appointment', appointment);
      expect(scope.isAppointmentDisabled).toBe(true);
      expect(ctrl.processAppointmentRecord).toHaveBeenCalledWith(appointment);
    });

    it('should call ctrl.createTimelineItem with resulting item from ctrl.processAppointmentRecord', function () {
      var appointment = {};
      scope.$emit('appointment:start-appointment', appointment);
      expect(ctrl.processAppointmentRecord).toHaveBeenCalledWith(appointment);
      expect(ctrl.createTimelineItem).toHaveBeenCalledWith(
        '2019-02-19 10:00:000',
        { StartTime: '2019-02-19 10:00:000' },
        'Appointment'
      );
    });

    it('should call ctrl.executeAppointmentLoadingFallback', function () {
      var appointment = {};
      scope.$emit('appointment:start-appointment', appointment);
      expect(ctrl.executeAppointmentLoadingFallback).toHaveBeenCalled();
    });

    it('should not add appointment in timelineRecords if no records', function () {
      var appointment = {};
      scope.timelineRecords = [];
      scope.$emit('appointment:start-appointment', appointment);
      expect(scope.timelineRecords.length).toBe(0);
    });

    it('should replace appointment in timelineRecords if matching record', function () {
      var appointment = {};
      scope.timelineRecords = [
        { record: { AppointmentId: '1234', recordType: 'Appointment' } },
      ];
      scope.$emit('appointment:start-appointment', appointment);
      expect(scope.timelineRecords.length).toBe(1);
    });
  });

  describe(' $on appointment:update-appointment event ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'processAppointmentRecord').and.callFake(function () {
        return { StartTime: '2019-02-19 10:00:000' };
      });
      spyOn(ctrl, 'createTimelineItem').and.callFake(function () {
        return { record: { AppointmentId: '1234', recordType: 'Appointment' } };
      });
      spyOn(
        ctrl,
        'executeAppointmentLoadingFallback'
      ).and.callFake(function () {});
    });

    it('should call ctrl.processAppointmentRecord with appointment', function () {
      var appointment = { AppointmentId: '1234' };
      scope.$emit('appointment:update-appointment', appointment);
      expect(
        scheduleServices.Lists.Appointments.GetSingleForTimeline
      ).toHaveBeenCalledWith(appointment);
    });

    // TODO refactor this event for ease of unit testing
  });

  describe(' loadAppointments method ->', function () {
    beforeEach(function () {
      spyOn(
        ctrl,
        'executeAppointmentLoadingFallback'
      ).and.callFake(function () {});
      spyOn(ctrl, 'getServiceCodes').and.callFake(function () {});
      spyOn(ctrl, 'getProviders').and.callFake(function () {});
      spyOn(ctrl, 'retrieveAppointments').and.callFake(function () {});
      ctrl.initialized = { Appointment: false };
      scope.loading = { Appointment: false };
      scope.hasClinicalAppointmentViewAccess = true;
    });

    it(
      'should call ctrl.processAppointmentRecord with appointment if ctrl.initialized.Appointment is false or scope.loading.Appointment is false' +
        'or scope.hasClinicalAppointmentViewAccess is true ',
      function () {
        ctrl.loadAppointments();
        expect(ctrl.getServiceCodes).toHaveBeenCalled();
        expect(ctrl.getProviders).toHaveBeenCalled();
        expect(ctrl.retrieveAppointments).toHaveBeenCalled();
        expect(referenceDataService.getData).toHaveBeenCalled();
      }
    );

    it(
      'should call ctrl.executeAppointmentLoadingFallback if ctrl.initialized.Appointment is true and scope.loading.Appointment is true' +
        'and scope.hasClinicalAppointmentViewAccess is false',
      function () {
        ctrl.initialized.Appointment = true;
        scope.loading.Appointment = true;
        scope.hasClinicalAppointmentViewAccess = false;
        ctrl.loadAppointments();
        expect(ctrl.executeAppointmentLoadingFallback).toHaveBeenCalled();
      }
    );
  });

  describe(' ctrl.retrieveAppointments method ->', function () {
    it('should load appointments with Classification of 0 to ctrl.appointmentData', function () {
      ctrl.retrieveAppointments();
      expect(
        scheduleServices.Lists.Appointments.GetAllForTimeline
      ).toHaveBeenCalledWith({ PatientId: scope.personId });
    });
  });

  describe(' ctrl.processAppointmentRecord method ->', function () {
    var appointment = {};
    beforeEach(function () {
      appointment = {
        LocationTimezoneInfo: 'CMT',
        ProviderId: '1234',
        PlannedServices: [
          { ServiceCodeId: '12345', ProviderUserId: '1235', Surface: 'M,NO,P' },
          { ServiceCodeId: '12344', ProviderUserId: '1236', Surface: null },
        ],
      };
      ctrl.serviceCodes = [
        {
          ServiceCodeId: '12345',
          DisplayAs: 'ServiceTwo',
          AffectedAreaId: 'MN',
          Code: 'Code1',
          Description: 'Description1',
          CdtCodeName: 'CdtCodeName1',
        },
        {
          ServiceCodeId: '12344',
          DisplayAs: 'ServiceOne',
          Code: 'Code2',
          AffectedAreaId: 'OP',
          Description: 'Description2',
          CdtCodeName: 'CdtCodeName2',
        },
      ];
      ctrl.providers = [
        { UserCode: 'KSJ', UserId: '1234' },
        { UserCode: 'DOBBY', UserId: '1235' },
        { UserCode: 'UBOB', UserId: '1236' },
      ];
      spyOn(ctrl, 'appendProviderData').and.callFake(function () {});
    });

    it('should call ctrl.processAppointmentRecord', function () {
      ctrl.processAppointmentRecord(appointment);
      expect(timeZoneFactory.ConvertAppointmentDatesTZ).toHaveBeenCalled();
    });

    it('should set dynamic properties on planned services based on matching service code data', function () {
      ctrl.processAppointmentRecord(appointment);

      expect(appointment.PlannedServices[0].CodeName).toEqual('Code1');
      expect(appointment.PlannedServices[1].CodeName).toEqual('Code2');

      expect(appointment.PlannedServices[0].DescriptionWithCDT).toEqual(
        'Description1 (CdtCodeName1)'
      );
      expect(appointment.PlannedServices[1].DescriptionWithCDT).toEqual(
        'Description2 (CdtCodeName2)'
      );

      expect(appointment.PlannedServices[0].AffectedAreaId).toEqual('MN');
      expect(appointment.PlannedServices[1].AffectedAreaId).toEqual('OP');

      expect(appointment.ServiceCodeDisplayAs).toEqual(
        'ServiceTwo, ServiceOne'
      );
    });
    it('should set plannedService.Area based on plannedService.Surface if not null', function () {
      appointment.PlannedServices[0].Root = null;
      appointment.PlannedServices[1].Root = null;
      appointment.PlannedServices[0].Surface = 'M,NO,P';
      appointment.PlannedServices[1].Surface = null;

      ctrl.processAppointmentRecord(appointment);

      expect(appointment.PlannedServices[0].Area).toEqual(['M', 'NO', 'P']);
      expect(appointment.PlannedServices[1].Area).toEqual(null);
    });

    it('should set plannedService.Area based on plannedService.Root if not null', function () {
      appointment.PlannedServices[0].Surface = null;
      appointment.PlannedServices[1].Surface = null;
      appointment.PlannedServices[0].Root = 'DB,P,MB';
      appointment.PlannedServices[1].Root = null;

      ctrl.processAppointmentRecord(appointment);

      expect(appointment.PlannedServices[0].Area).toEqual(['DB', 'P', 'MB']);
      expect(appointment.PlannedServices[1].Area).toEqual(null);
    });

    it('should call ctrl.appendProviderData', function () {
      ctrl.processAppointmentRecord(appointment);
      expect(ctrl.appendProviderData).toHaveBeenCalledWith(
        appointment,
        appointment.ProviderId
      );
    });
  });

  describe(' processAppointments method ->', function () {
    var mockAppointment = {};
    beforeEach(function () {
      spyOn(
        ctrl,
        'executeAppointmentLoadingFallback'
      ).and.callFake(function () {});
      spyOn(ctrl, 'createTimelineItem').and.callFake(function () {
        return {
          record: {
            AppointmentId: '1234',
            recordType: 'Appointment',
            StartTime: '2019-01-20 21:00:00.0000000',
          },
        };
      });
      spyOn(ctrl, 'processAppointmentRecord').and.callFake(function () {
        return mockAppointment;
      });
      spyOn(ctrl, 'resetItemsInTimeLine').and.callFake(function () {});
      mockAppointment = {
        AppointmentId: '1238',
        Status: 0,
        Classification: 2,
        StartTime: '2019-02-20 21:00:00.0000000',
        EndTime: '2019-02-20 21:30:00.0000000',
      };
      ctrl.appointmentData = _.cloneDeep(appointmentData);
      spyOn(rootScope, '$broadcast');
    });

    it('should call ctrl.processAppointmentRecord if ctrl.appointmentData.length > 0', function () {
      ctrl.initialized.Appointment = true;

      ctrl.processAppointments();
      _.forEach(ctrl.appointmentData, function (appointment) {
        expect(ctrl.processAppointmentRecord).toHaveBeenCalledWith(appointment);
        expect(ctrl.createTimelineItem).toHaveBeenCalledWith(
          mockAppointment.StartTime,
          mockAppointment,
          'Appointment'
        );
      });
      expect(ctrl.appointments.length).toEqual(ctrl.appointmentData.length);
      expect(ctrl.resetItemsInTimeLine).toHaveBeenCalledWith(
        ctrl.appointments,
        [],
        'Appointment',
        'AppointmentId'
      );
    });

    it('should call ctrl.processAppointmentRecord if ctrl.appointmentData.length > 0', function () {
      ctrl.initialized.Appointment = true;
      ctrl.processAppointments();
      expect(ctrl.appointments.length).toEqual(ctrl.appointmentData.length);
      expect(ctrl.resetItemsInTimeLine).toHaveBeenCalledWith(
        ctrl.appointments,
        [],
        'Appointment',
        'AppointmentId'
      );
    });

    it('should add ctrl.appointments to scope.timelineRecords if ctrl.initialized.Appointment = false', function () {
      ctrl.initialized.Appointment = false;

      ctrl.processAppointments();
      expect(ctrl.appointments.length).toEqual(ctrl.appointmentData.length);
      expect(ctrl.resetItemsInTimeLine).not.toHaveBeenCalled();
      expect(scope.timelineRecords.length).toEqual(5);
    });

    it('should call ctrl.executeAppointmentLoadingFallback', function () {
      ctrl.processAppointments();
      expect(ctrl.executeAppointmentLoadingFallback).toHaveBeenCalled();
    });

    it('should call ctrl.executeAppointmentLoadingFallback', function () {
      ctrl.processAppointments();
      expect(ctrl.executeAppointmentLoadingFallback).toHaveBeenCalled();
    });

    it('should appointment:appointment-reloaded', function () {
      ctrl.processAppointments();
      expect(rootScope.$broadcast).toHaveBeenCalledWith(
        'appointment:appointment-reloaded'
      );
    });
  });

  describe(' ctrl.executeAppointmentLoadingFallback method ->', function () {
    beforeEach(function () {
      scope.loading.Appointment = true;
      spyOn(ctrl, 'shouldIFilterRecords').and.callFake(function () {});
    });

    it('should call shouldIFilterRecords', function () {
      ctrl.executeAppointmentLoadingFallback();
      expect(scope.loading.Appointment).toEqual(false);
      expect(ctrl.shouldIFilterRecords).toHaveBeenCalled();
    });
  });

  describe(' ctrl.groupMedicalHxItems method ->', function () {
    beforeEach(function () {
      ctrl.parentDocuments = [
        { record: { FileAllocationId: '1234' } },
        { record: { FileAllocationId: '1236' } },
      ];
      ctrl.medicalHistoryForms = [
        { record: { FileAllocationId: '1234' } },
        { record: { FileAllocationId: '1235' } },
      ];
    });

    it('should add $$GroupingClass to medicalHistoryForms and related documents based on AllocationId', function () {
      ctrl.groupMedicalHxItems();
      expect(ctrl.medicalHistoryForms[0].record.$$GroupingClass).toEqual(
        'groupedTop'
      );
      expect(ctrl.parentDocuments[0].record.$$GroupingClass).toEqual(
        'groupedBottom'
      );
    });

    it('should not add $$GroupingClass to medicalHistoryForms and documents if not relation based on AllocationId', function () {
      ctrl.groupMedicalHxItems();
      expect(ctrl.medicalHistoryForms[1].record.$$GroupingClass).not.toEqual(
        'groupedTop'
      );
      expect(ctrl.parentDocuments[1].record.$$GroupingClass).not.toEqual(
        'groupedBottom'
      );
    });

    it('should only add $$GroupingClass to medicalHistoryForms based on AllocationId to first medicalHistoryDocument', function () {
      ctrl.parentDocuments = [
        { record: { FileAllocationId: '1234' } },
        { record: { FileAllocationId: '1234' } },
      ];
      ctrl.medicalHistoryForms = [
        { record: { FileAllocationId: '1234' } },
        { record: { FileAllocationId: '1234' } },
      ];
      ctrl.groupMedicalHxItems();
      expect(ctrl.medicalHistoryForms[0].record.$$GroupingClass).toEqual(
        'groupedTop'
      );
      expect(ctrl.parentDocuments[0].record.$$GroupingClass).toEqual(
        'groupedBottom'
      );
      expect(ctrl.parentDocuments[1].record.$$GroupingClass).toEqual(
        'groupedBottom'
      );
      expect(ctrl.medicalHistoryForms[1].record.$$GroupingClass).not.toEqual(
        'groupedTop'
      );
    });
  });

  describe('ctrl.loadDocuments method ->', function () {
    beforeEach(function () {
      scope.hasClinicalDocumentsViewAccess = true;
      routeParams = { PatientId: '1234' };
    });

    it('should call documentGroupsService.get to load documents', function () {
      ctrl.loadDocuments();
      expect(documentGroupsService.get).toHaveBeenCalled();
    });
  });

  describe('ctrl.processDocuments method ->', function () {
    var documentRecordsMock = [];
    beforeEach(function () {
      ctrl.documentRecords = [
        {
          DateModified: '2019-02-28T14:55:44.8789235',
          DateUploaded: '2019-02-28T14:55:44.8789235',
          Description: null,
          DocumentGroupId: 3,
          DocumentId: 11,
          FileAllocationId: 825730,
          OriginalFileName: 'consent.txt',
          ParentId: '1234',
          ParentType: 'Patient',
        },
      ];

      documentRecordsMock = [
        { Description: 'Consent', MimeType: 'Digital', DocumentGroupId: 2 },
        { Description: 'Consent', MimeType: 'text', DocumentGroupId: 2 },
        {
          Description: 'Treatment Plans',
          MimeType: 'Digital',
          DocumentGroupId: 4,
        },
        {
          Description: 'Treatment Plans',
          MimeType: 'Digital',
          DocumentGroupId: 4,
        },
        { Description: 'Insurance', MimeType: 'Digital', DocumentGroupId: 3 },
        { Description: 'Insurance', MimeType: 'Digital', DocumentGroupId: 3 },
        {
          Description: 'Medical History',
          MimeType: 'Digital',
          DocumentGroupId: 8,
        },
        {
          Description: 'Medical History',
          MimeType: 'Digital',
          DocumentGroupId: 8,
        },
      ];
      scope.documentgroups = [
        { Description: 'Lab', DocumentGroupId: 1 },
        { Description: 'Consent', DocumentGroupId: 2 },
        { Description: 'Insurance', DocumentGroupId: 3 },
        { Description: 'Treatment Plans', DocumentGroupId: 4 },
        { Description: 'EOB', DocumentGroupId: 5 },
      ];
      spyOn(ctrl, 'createTimelineItem').and.callFake(function () {
        return { record: { DocumentId: 1234, DateModified: '2019-03-28' } };
      });
      spyOn(ctrl, 'groupMedicalHxItems').and.callFake(function () {});
      spyOn(ctrl, 'showDocumentInTimeline').and.returnValue(true);
    });

    it('should call ctrl.createTimelineItem with recordType.Description of Insurance if recordType.Description is EOB', function () {
      ctrl.documentRecords[0].DocumentGroupId = 5;
      ctrl.processDocuments();
      expect(ctrl.createTimelineItem).toHaveBeenCalledWith(
        ctrl.documentRecords[0].DateUploaded,
        ctrl.documentRecords[0],
        'Insurance'
      );
    });

    it('should add record to ctrl.parentDocuments if recordType.Description is EOB', function () {
      ctrl.documentRecords[0].DocumentGroupId = 5;
      ctrl.processDocuments();
      expect(ctrl.parentDocuments[0]).toEqual({
        record: { DocumentId: 1234, DateModified: '2019-03-28' },
        $$iconUrl: 'fa-so',
        $$subGroup: 'EOB',
      });
    });

    it('should replace documents in timelineRecords if exists and this is not the initial load', function () {
      scope.timelineRecords = [
        { record: { DocumentId: 1234, DateModified: '2019-02-28' } },
      ];
      ctrl.documentRecords = [
        { record: { DocumentId: 1234, DateModified: '2019-03-28' } },
      ];

      ctrl.initialized.Documents = true;
      expect(scope.timelineRecords[0].record.DateModified).toEqual(
        '2019-02-28'
      );
      ctrl.processDocuments();
      expect(scope.timelineRecords[0].record.DateModified).toEqual(
        '2019-03-28'
      );
    });

    it('should add documents in timelineRecords if this is the initial load', function () {
      scope.timelineRecords = [];
      ctrl.documentRecords = [
        { record: { DocumentId: 1234, DateModified: '2019-03-28' } },
      ];

      ctrl.initialized.Documents = false;
      ctrl.processDocuments();
      expect(scope.timelineRecords[0].record.DateModified).toEqual(
        '2019-03-28'
      );
    });

    it('should call ctrl.showDocumentInTimeline to filter out documents that should not show in timeline ', function () {
      ctrl.documentRecords = _.cloneDeep(documentRecordsMock);
      ctrl.processDocuments();
      _.forEach(ctrl.documentRecords, function () {
        expect(ctrl.showDocumentInTimeline).toHaveBeenCalled();
      });
    });

    it('should not call ctrl.createTimelineItem if ctrl.showDocumentInTimeline returns false', function () {
      ctrl.showDocumentInTimeline = jasmine.createSpy().and.returnValue(false);
      ctrl.processDocuments();
      expect(ctrl.createTimelineItem).not.toHaveBeenCalled();
    });

    it('should use Consent for item type if document group is Consent and MimeType is not Digital', function () {
      var document = {
        Description: 'Consent',
        MimeType: 'text',
        DocumentGroupId: 2,
        DateUploaded: 'dateuploaded',
      };
      ctrl.documentRecords = [document];

      ctrl.processDocuments();

      expect(ctrl.createTimelineItem).toHaveBeenCalledWith(
        document.DateUploaded,
        document,
        'Consent'
      );
    });

    it('should use DigitalConsent for item type if document group is Consent and MimeType is Digital', function () {
      var document = {
        Description: 'Consent',
        MimeType: 'Digital',
        DocumentGroupId: 2,
        DateUploaded: 'dateuploaded',
      };
      ctrl.documentRecords = [document];

      ctrl.processDocuments();

      expect(ctrl.createTimelineItem).toHaveBeenCalledWith(
        document.DateUploaded,
        document,
        'DigitalConsent'
      );
    });
  });

  describe(' ctrl.showDocumentInTimeline method ->', function () {
    it('should return false if document.MimeType is Digital and recordType.Description is not Consent', function () {
      var document = {
        Description: 'Treatment Plans',
        MimeType: 'Digital',
        DocumentGroupId: 4,
      };
      var recordType = { Description: 'Treatment Plans' };
      expect(ctrl.showDocumentInTimeline(document, recordType)).toEqual(false);

      document = {
        Description: 'Medical History',
        MimeType: 'Digital',
        DocumentGroupId: 8,
      };
      recordType = { Description: 'Medical History' };
      expect(ctrl.showDocumentInTimeline(document, recordType)).toEqual(false);
    });

    it('should return true if document.MimeType is Digital and recordType.Description is Consent', function () {
      var document = {
        Description: 'Consent',
        MimeType: 'Digital',
        DocumentGroupId: 2,
      };
      var recordType = { Description: 'Consent' };
      expect(ctrl.showDocumentInTimeline(document, recordType)).toEqual(true);
    });

    it('should return true if document.MimeType is not Digital and recordType.Description is not Consent', function () {
      var document = {
        Description: 'Medical History',
        MimeType: 'text',
        DocumentGroupId: 8,
      };
      var recordType = { Description: 'Medical History' };
      expect(ctrl.showDocumentInTimeline(document, recordType)).toEqual(true);
    });
  });

  describe(' ctrl.executeDocumentLoadingFallback method ->', function () {
    beforeEach(function () {
      scope.loading.Documents = true;
      spyOn(ctrl, 'shouldIFilterRecords').and.callFake(function () {});
    });

    it('should call ctrl.shouldIFilterRecords', function () {
      ctrl.executeDocumentLoadingFallback();
      expect(scope.loading.Documents).toEqual(false);
      expect(ctrl.shouldIFilterRecords).toHaveBeenCalled();
    });
  });

  describe('ctrl.loadMedicalHistoryForms method ->', function () {
    beforeEach(function () {
      scope.canView = true;
      routeParams = { patientId: '1234' };
    });

    it('should call medicalHistoryFactory.getSummariesByPatientId to load medicalHistory', function () {
      ctrl.loadMedicalHistoryForms();
      expect(
        medicalHistoryFactory.getSummariesByPatientId
      ).toHaveBeenCalledWith(routeParams.PatientId);
    });
  });

  describe('ctrl.processMedicalHistoryForms method ->', function () {
    beforeEach(function () {
      scope.medicalHistoryRecords = [
        { DateModified: '2019-03-19', FormAnswersId: '1234' },
      ];

      spyOn(ctrl, 'createTimelineItem').and.callFake(function () {
        return { record: { DocumentId: 1234, DateModified: '2019-03-28' } };
      });
      spyOn(ctrl, 'groupMedicalHxItems').and.callFake(function () {});
    });

    it('should replace documents in timelineRecords if exists and this is not the initial load', function () {
      scope.timelineRecords = [
        { record: { DocumentId: 1234, DateModified: '2019-02-21' } },
      ];
      ctrl.initialized.MedicalHistoryForms = true;
      ctrl.processMedicalHistoryForms();
      expect(ctrl.medicalHistoryForms).toEqual([
        { record: Object({ DocumentId: 1234, DateModified: '2019-03-28' }) },
      ]);
    });

    it('should add documents in timelineRecords if this is the initial load', function () {
      scope.timelineRecords = [];
      ctrl.initialized.MedicalHistoryForms = false;
      ctrl.processMedicalHistoryForms();
      expect(scope.timelineRecords[0].record.DateModified).toEqual(
        '2019-03-28'
      );
    });
  });

  describe(' ctrl.executeMedicalHistoryLoadingFallback method ->', function () {
    beforeEach(function () {
      scope.loading.MedicalHistory = true;
      spyOn(ctrl, 'shouldIFilterRecords').and.callFake(function () {});
    });

    it('should call ctrl.shouldIFilterRecords', function () {
      ctrl.executeMedicalHistoryLoadingFallback();
      expect(scope.loading.MedicalHistory).toEqual(false);
      expect(ctrl.shouldIFilterRecords).toHaveBeenCalled();
    });
  });

  describe('ctrl.processPerioStatsMouth function ->', function () {
    beforeEach(function () {
      ctrl.perioStatsMouthData = [
        { ExamDate: '2019-02-10', ExamId: '1234' },
        { ExamDate: '2019-02-10', ExamId: '1235' },
        { ExamDate: '2019-03-10', ExamId: '1238' },
        { ExamDate: '2019-03-15', ExamId: '1239' },
        { ExamDate: '2019-03-19', ExamId: '1240' },
      ];

      spyOn(ctrl, 'executePerioStatsMouthLoadingFallback');
      spyOn(ctrl, 'createTimelineItem').and.returnValue({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'PerioStatsMouth',
        record: { IsDeleted: false },
      });
      spyOn(ctrl, 'resetItemsInTimeLine');
    });

    it('should call resetItemsInTimeLine if ctrl.initialized.PerioStatsMouth is true (indicates PerioStatsMouth already exist in the timeline records ', function () {
      ctrl.initialized.PerioStatsMouth = true;
      scope.timelineRecords = _.cloneDeep(ctrl.perioStatsMouthData);
      ctrl.processPerioStatsMouth();
      expect(ctrl.resetItemsInTimeLine).toHaveBeenCalled();
    });

    it('should initialize the PerioStatsMouth timeline records ctrl.initialized.PerioStatsMouth is false (indicates PerioStatsMouth do not exist in the timeline records ', function () {
      ctrl.initialized.PerioStatsMouth = false;
      scope.timelineRecords = [];
      ctrl.processPerioStatsMouth();
      expect(scope.timelineRecords.length).toEqual(5);
      expect(ctrl.initialized.PerioStatsMouth).toBe(true);
    });
  });

  describe(' ctrl.executePerioStatsMouthLoadingFallback method ->', function () {
    beforeEach(function () {
      scope.loading.PerioStatsMouth = true;
      spyOn(ctrl, 'shouldIFilterRecords').and.callFake(function () {});
    });

    it('should call ctrl.shouldIFilterRecords', function () {
      ctrl.executePerioStatsMouthLoadingFallback();
      expect(scope.loading.PerioStatsMouth).toEqual(false);
      expect(ctrl.shouldIFilterRecords).toHaveBeenCalled();
    });
  });

  describe('scope.openDocUploader method ->', function () {
    beforeEach(function () {
      scope.docCtrls = {
        setOptions: jasmine.createSpy().and.callFake(function () {}),
        open: jasmine.createSpy().and.callFake(function () {}),
        content: jasmine.createSpy().and.callFake(function () {}),
      };
    });

    it('should call ctrl.shouldIFilterRecords', function () {
      scope.openDocUploader();
      expect(scope.docCtrls.open).toHaveBeenCalled();
    });
  });

  describe('ctrl.getImageExams function ->', function () {
    describe('when scope.hasClinicalImagingViewAccess is true', function () {
      beforeEach(function () {
        scope.hasClinicalImagingViewAccess = true;
        scope.loading.ImageExam = false;

        imagingMasterService.getReadyServices = jasmine
          .createSpy()
          .and.returnValue({ then: () => {} });
      });

      it('should set scope.loading.ImageExam to true', function () {
        ctrl.getImageExams();

        expect(scope.loading.ImageExam).toBe(true);
      });

      it('should call imagingMasterService.getReadyServices', function () {
        ctrl.getImageExams();

        expect(imagingMasterService.getReadyServices).toHaveBeenCalled();
      });

      describe('getReadyServices success callback ->', function () {
        let provider;
        beforeEach(function () {
          provider = 'testProvider';
          let servicesRes = {
            sidexis: {},
          };
          servicesRes[provider] = {};

          imagingMasterService.getReadyServices = jasmine
            .createSpy()
            .and.returnValue({
              then: cb => {
                cb(servicesRes);
              },
            });
          imagingMasterService.getPatientByFusePatientId = jasmine
            .createSpy()
            .and.returnValue({ then: () => {} });
        });

        it('should call imagingMasterService.getPatientByFusePatientId with correct parameters', function () {
          ctrl.getImageExams();

          expect(
            imagingMasterService.getPatientByFusePatientId
          ).toHaveBeenCalledWith(scope.personId, scope.personId, [provider]);
        });

        describe('getPatientByFusePatientId success callback', function () {
          let patResults;
          beforeEach(function () {
            patResults = {};

            imagingMasterService.getPatientByFusePatientId = jasmine
              .createSpy()
              .and.returnValue({
                then: cb => {
                  cb(patResults);
                },
              });
            ctrl.getImageExamsFailure = jasmine.createSpy();
            imagingMasterService.getAllByPatientId = jasmine
              .createSpy()
              .and.returnValue({ then: () => {} });
          });

          it('should call ctrl.getImageExamsFailure when patRes is null', function () {
            patResults[provider] = null;

            ctrl.getImageExams();

            expect(ctrl.getImageExamsFailure).toHaveBeenCalled();
          });

          it('should call ctrl.getImageExamsFailure when patRes.success is false', function () {
            patResults[provider] = { success: false };

            ctrl.getImageExams();

            expect(ctrl.getImageExamsFailure).toHaveBeenCalled();
          });

          it('should not call imagingMasterService.getAllByPatientId when patRes.result is null', function () {
            patResults[provider] = { success: true, result: null };

            ctrl.getImageExams();

            expect(
              imagingMasterService.getAllByPatientId
            ).not.toHaveBeenCalled();
          });

          it('should not call imagingMasterService.getAllByPatientId when patRes.Value is null and patRes.result.data is null', function () {
            patResults[provider] = {
              success: true,
              result: { data: null },
            };

            ctrl.getImageExams();

            expect(
              imagingMasterService.getAllByPatientId
            ).not.toHaveBeenCalled();
          });

          it('should not call imagingMasterService.getAllByPatientId when patRes.Value is null and patRes.result.data.Records is null', function () {
            patResults[provider] = {
              success: true,
              result: { data: { Records: null } },
            };

            ctrl.getImageExams();

            expect(
              imagingMasterService.getAllByPatientId
            ).not.toHaveBeenCalled();
          });

          it('should not call imagingMasterService.getAllByPatientId when patRes.Value is null and patRes.result.data.Records is empty', function () {
            patResults[provider] = {
              success: true,
              result: { data: { Records: [] } },
            };

            ctrl.getImageExams();

            expect(
              imagingMasterService.getAllByPatientId
            ).not.toHaveBeenCalled();
          });

          it('should call imagingMasterService.getAllByPatientId when patRes.Value is null and patRes.result.data.Records is not empty', function () {
            let patientId = 'testPatientId';
            patResults[provider] = {
              success: true,
              result: { data: { Records: [{ Id: patientId }] } },
            };

            ctrl.getImageExams();

            expect(imagingMasterService.getAllByPatientId).toHaveBeenCalledWith(
              patientId,
              provider
            );
          });

          it('should call imagingMasterService.getAllByPatientId when patRes.Value is not null', function () {
            let patientId = 'testPatientId';
            patResults[provider] = {
              success: true,
              result: { Value: { Id: patientId } },
            };

            ctrl.getImageExams();

            expect(imagingMasterService.getAllByPatientId).toHaveBeenCalledWith(
              patientId,
              provider
            );
          });

          describe('getAllByPatientId callback ->', function () {
            let getAllResults, deferred;
            beforeEach(function () {
              let patientId = 'testPatientId';
              patResults[provider] = {
                success: true,
                result: { Value: { Id: patientId } },
              };
              getAllResults = {};

              deferred = q.defer();

              imagingMasterService.getAllByPatientId = jasmine
                .createSpy()
                .and.returnValue({
                  then: function (cb) {
                    cb(getAllResults);
                    return deferred.promise;
                  },
                });
              ctrl.processImageExams = jasmine.createSpy();
            });

            it('should call ctrl.getImageExamsFailure if res is null', function () {
              imagingMasterService.getAllByPatientId = jasmine
                .createSpy()
                .and.returnValue({
                  then: function (cb) {
                    cb(null);
                  },
                });

              ctrl.getImageExams();

              expect(ctrl.getImageExamsFailure).toHaveBeenCalled();
            });

            it('should call ctrl.getImageExamsFailure if res.success is false', function () {
              getAllResults.success = false;

              ctrl.getImageExams();

              expect(ctrl.getImageExamsFailure).toHaveBeenCalled();
            });

            it('should call ctrl.getImageExamsFailure if res.result is null', function () {
              getAllResults.success = true;
              getAllResults.result = null;

              ctrl.getImageExams();

              expect(ctrl.getImageExamsFailure).toHaveBeenCalled();
            });
          });

          it('should call executeImageLoadingFallback if no results', function () {
            imagingMasterService.getAllByPatientId = jasmine
              .createSpy()
              .and.returnValue({
                then: function (cb) {
                  cb(null);
                },
              });
            ctrl.executeImageLoadingFallback = jasmine.createSpy();

            ctrl.getImageExams();

            expect(ctrl.executeImageLoadingFallback).toHaveBeenCalled();
          });
        });

        it('should call ctrl.getImageExamsFailure when an exception is thrown', function () {
          imagingMasterService.getPatientByFusePatientId = jasmine
            .createSpy()
            .and.throwError('test');
          ctrl.getImageExamsFailure = jasmine.createSpy();

          ctrl.getImageExams();

          expect(ctrl.getImageExamsFailure).toHaveBeenCalled();
        });
      });

      describe('when ctrl.imagingRefreshPromise is null', function () {
        let refreshPromise;
        beforeEach(function () {
          refreshPromise = { then: jasmine.createSpy() };
          ctrl.imagingRefreshPromise = null;

          patientImagingExamFactory.getRefreshPromise = jasmine
            .createSpy()
            .and.returnValue(refreshPromise);
        });

        it('should call patientImagingExamFactory.getRefreshPromise and call .then', function () {
          ctrl.getImageExams();

          expect(
            patientImagingExamFactory.getRefreshPromise
          ).toHaveBeenCalled();
          expect(refreshPromise.then).toHaveBeenCalledWith(
            null,
            null,
            ctrl.getImageExams
          );
        });
      });

      describe('when ctrl.imagingRefreshPromise is not null', function () {
        beforeEach(function () {
          ctrl.imagingRefreshPromise = true;
        });

        it('should not call patientImagingExamFactory.getRefreshPromise', function () {
          ctrl.getImageExams();

          expect(
            patientImagingExamFactory.getRefreshPromise
          ).toHaveBeenCalled();
        });
      });
    });

    describe('when scope.hasClinicalImagingViewAccess is false', function () {
      it('should call ctrl.executeImageLoadingFallback', function () {
        ctrl.executeImageLoadingFallback = jasmine.createSpy();
        scope.hasClinicalImagingViewAccess = false;

        ctrl.getImageExams();

        expect(ctrl.executeImageLoadingFallback).toHaveBeenCalled();
      });
    });
  });

  describe('ctrl.processImageExams function ->', function () {
    var exams = [];
    beforeEach(function () {
      exams = [
        {
          ExamDate: '2019-02-10',
          ExamId: '1234',
          Series: [
            {
              Images: [{ AdultTeeth: '1,2,3', DeciduousTeeth: '11,12,13' }],
            },
          ],
        },
        {
          ExamDate: '2019-02-19',
          ExamId: '1235',
          Series: [
            {
              Images: [{ AdultTeeth: '1,', DeciduousTeeth: '11,' }],
            },
          ],
        },
      ];

      spyOn(ctrl, 'executeImageLoadingFallback');
      spyOn(ctrl, 'createTimelineItem').and.returnValue({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'ImageExam',
        record: { IsDeleted: false },
      });
      spyOn(ctrl, 'resetItemsInTimeLine');
    });

    it('should call resetItemsInTimeLine if ctrl.initialized.ImageExam is true (indicates ImageExam already exist in the timeline records ', function () {
      ctrl.initialized.ImageExam = true;
      scope.timelineRecords = _.cloneDeep(exams);
      ctrl.processImageExams(exams);
      expect(ctrl.resetItemsInTimeLine).toHaveBeenCalled();
    });

    it('should initialize the ImageExam timeline records ctrl.initialized.ImageExam is false (indicates ImageExam do not exist in the timeline records ', function () {
      ctrl.initialized.ImageExam = false;
      scope.timelineRecords = [];

      ctrl.processImageExams(exams);
      expect(scope.timelineRecords.length).toEqual(2);
      expect(ctrl.initialized.ImageExam).toBe(true);
    });

    it('should set the exam date to utc when time is 00:00:00', function () {
      ctrl.initialized.ImageExam = false;
      scope.timelineRecords = [];

      var date1 = '2019-07-26T00:00:00';
      var date2 = '2019-07-26T00:00:01';
      exams[0].Date = date1;
      exams[1].Date = date2;

      ctrl.processImageExams(exams);

      expect(exams[0].Date).toBe(
        moment(date1).utc().format('YYYY-MM-DDTHH:mm:ss')
      );
      expect(exams[1].Date).toBe(date2);
    });

    it('should not throw an exception when AdultTeeth or DeciduousTeeth is null', function () {
      ctrl.initialized.ImageExam = false;
      scope.timelineRecords = [];

      exams[0].Series[0].Images[0].AdultTeeth = null;
      exams[1].Series[0].Images[0].DeciduousTeeth = null;

      // no exception thrown
    });
  });

  describe(' ctrl.executeImageLoadingFallback method ->', function () {
    beforeEach(function () {
      scope.loading.ImageExam = true;
      spyOn(ctrl, 'shouldIFilterRecords').and.callFake(function () {});
    });

    it('should call ctrl.shouldIFilterRecords', function () {
      ctrl.executeImageLoadingFallback();
      expect(scope.loading.ImageExam).toEqual(false);
      expect(ctrl.shouldIFilterRecords).toHaveBeenCalled();
    });
  });

  describe('ctrl.createTimelineItem  method ->', function () {
    var record;
    beforeEach(function () {
      record = {};
    });

    it('should return listItem based on parameters', function () {
      var returnValue = ctrl.createTimelineItem(
        '2019-03-19',
        record,
        'Insurance',
        2
      );
      expect(returnValue.date).toEqual(new Date('2019-03-19'));
      expect(returnValue.groupDate).toEqual(
        filter('date')(new Date('2019-03-19'), 'EEEE, MMMM d y')
      );
      expect(returnValue.record).toEqual(record);
      expect(returnValue.recordType).toEqual('Insurance');
      expect(returnValue.load).toEqual(false);
    });
  });

  describe('ctrl.init  method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'initImageExams').and.callFake(function () {});
      spyOn(ctrl, 'initAppointments').and.callFake(function () {});
      spyOn(ctrl, 'initServicesAndConditions').and.callFake(function () {});
      spyOn(ctrl, 'initDocuments').and.callFake(function () {});
      spyOn(ctrl, 'initTreatmentPlans').and.callFake(function () {});
      spyOn(ctrl, 'initClinicalNotes').and.callFake(function () {});
      spyOn(ctrl, 'initMedicalHxForms').and.callFake(function () {});
    });

    it('should call child functions', function () {
      ctrl.init();
      expect(ctrl.initImageExams).toHaveBeenCalled();
      expect(ctrl.initAppointments).toHaveBeenCalled();
      expect(ctrl.initServicesAndConditions).toHaveBeenCalled();
      expect(ctrl.initDocuments).toHaveBeenCalled();
      expect(ctrl.initTreatmentPlans).toHaveBeenCalled();
      expect(ctrl.initClinicalNotes).toHaveBeenCalled();
      expect(ctrl.initMedicalHxForms).toHaveBeenCalled();
    });
  });

  describe(' soar:document-properties-edited event ->', function () {
    var editedDocument;
    beforeEach(function () {
      // add records to timeline records
      scope.timelineRecords = [
        {
          record: {
            DocumentId: 1234,
            DocumentGroupId: 2,
            DateModified: '2019-02-28',
          },
        },
      ];
      editedDocument = {
        DocumentId: 1234,
        DocumentGroupId: 2,
        DateModified: '2019-03-19',
      };
      scope.documentgroups = [
        { Description: 'Lab', DocumentGroupId: 1 },
        { Description: 'Consent', DocumentGroupId: 2 },
        { Description: 'Insurance', DocumentGroupId: 3 },
        { Description: 'Treatment Plans', DocumentGroupId: 4 },
        { Description: 'EOB', DocumentGroupId: 5 },
      ];
      spyOn(ctrl, 'executeDocumentLoadingFallback');
    });

    it('should replace record from timelineRecords when edited', function () {
      expect(scope.timelineRecords.length).toBe(1);
      expect(scope.timelineRecords[0].record.DateModified).toBe('2019-02-28');
      scope.$emit('soar:document-properties-edited', editedDocument);
      expect(scope.timelineRecords.length).toBe(1);
      expect(scope.timelineRecords[0].record.DateModified).toBe('2019-03-19');
    });

    it('should call ctrl.ctrl.executeDocumentLoadingFallback', function () {
      scope.$emit('soar:document-properties-edited', editedDocument);
      expect(ctrl.executeDocumentLoadingFallback).toHaveBeenCalled();
    });
  });

  describe('soar:edit-document-properties event ->', function () {
    beforeEach(function () {
      // add records to timeline records
      scope.filteredTimelineRecords = [
        {
          'Tuesday, March 5 2019': {
            $$iconUrl: 'Images/TimelineFilterIcons/document.svg',
            date: '2019-03-05',
            groupDate: 'Tuesday, March 5 2019',
            load: true,
            recordType: 'Consent',
            record: {
              FileAllocationId: '1234',
              DateModified: '2019-03-05T21:58:46.798267',
              DateUploaded: '2019-03-05T21:58:46.798267',
              DocumentGroupId: 2,
              DocumentId: 12,
              MimeType: 'text/plain',
            },
          },
        },
      ];

      scope.data = {
        patientInfo: { FirstName: 'Duncan', LastName: 'Frapples' },
      };
      spyOn(ctrl, 'openDocumentProperties').and.callFake(function () {});
    });

    it('should set record.$$EditingDisabled to true on matching record', function () {
      scope.$emit('soar:edit-document-properties', '1234', true, '123456789');
      _.forEach(scope.filteredTimelineRecords, function (ftr) {
        _.forEach(ftr, function (item) {
          if (item.record.DocumentId === '1234') {
            expect(item.record.$$EditingDisabled).toBe(true);
          }
        });
      });
    });

    it('should call ctrl.openDocumentProperties', function () {
      scope.$emit('soar:edit-document-properties', '1234', true, '123456789');
      expect(ctrl.openDocumentProperties).toHaveBeenCalledWith(
        '1234',
        'Frapples, Duncan (undefined)'
      );
    });
  });

  describe('scope.openDocumentProperties method ->', function () {
    beforeEach(function () {
      scope.docCtrls = {
        setOptions: jasmine.createSpy().and.callFake(function () {}),
        open: jasmine.createSpy().and.callFake(function () {}),
        content: jasmine.createSpy().and.callFake(function () {}),
      };
    });

    it('should call ctrl.shouldIFilterRecords', function () {
      ctrl.openDocumentProperties('1234', 'Bob White');
      expect(scope.docCtrls.open).toHaveBeenCalled();
    });
  });

  describe('loadClinicalOverviewData ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'loadExamHeaders').and.callFake(function () {});
      spyOn(ctrl, 'loadNotes').and.callFake(function () {});
      scope.clinicalDataLoaded = false;
      scope.loading = { PerioStatsMouth: false };
      scope.data = { PerioExamSummaries: [], Notes: [] };
    });

    it('should call loadExamHeaders', function () {
      ctrl.loadClinicalOverviewData();
      expect(ctrl.loadExamHeaders).toHaveBeenCalledWith(
        scope.data.PerioExamSummaries
      );
    });

    it('should call loadNotes', function () {
      ctrl.loadClinicalOverviewData();
      expect(ctrl.loadNotes).toHaveBeenCalledWith(scope.data.Notes);
    });

    it('should set scope.properties', function () {
      ctrl.loadClinicalOverviewData();
      expect(scope.loading.PerioStatsMouth).toBe(true);
      expect(scope.clinicalDataLoaded).toBe(true);
    });
  });

  describe('ctrl.loadNotes method->', function () {
    var notes = [];
    beforeEach(function () {
      spyOn(ctrl, 'processClinicalNotes').and.callFake(function () {});
      notes = [];
    });

    it('should call processClinicalNotes', function () {
      ctrl.loadNotes(notes);
      expect(ctrl.processClinicalNotes).toHaveBeenCalledWith(notes);
    });
  });

  describe('ctrl.loadExamHeaders method->', function () {
    var examHeaders = [];
    beforeEach(function () {
      spyOn(ctrl, 'processPerioStatsMouth').and.callFake(function () {});
      examHeaders = [];
      ctrl.perioStatsMouthData = [];
    });

    it('should set ctrl.perioStatsMouthData to examHeaders param', function () {
      ctrl.loadExamHeaders(examHeaders);
      expect(ctrl.perioStatsMouthData).toEqual(examHeaders);
    });

    it('should call processPerioStatsMouth', function () {
      ctrl.loadExamHeaders(examHeaders);
      expect(ctrl.processPerioStatsMouth).toHaveBeenCalledWith();
    });
  });

  describe('data watch ->', function () {
    beforeEach(function () {
      scope.clinicalDataLoaded = false;
      spyOn(ctrl, 'loadClinicalOverviewData').and.callFake(function () {});
      spyOn(ctrl, 'createNewExternalImages').and.callFake(function () {});

      ctrl.clinicalOverviewDeferred = {
        resolve: jasmine.createSpy(),
      };
    });

    it('should call ctrl.loadClinicalOverviewData if PerioExamSummaries exist and Notes exist and $scope.clinicalDataLoaded is false', function () {
      scope.data = {};
      scope.$apply();
      scope.data = { PerioExamSummaries: [{}, {}], Notes: [{}, {}] };
      scope.$apply();
      expect(ctrl.loadClinicalOverviewData).toHaveBeenCalled();
      expect(ctrl.clinicalOverviewDeferred.resolve).toHaveBeenCalled();
    });

    it('should not call ctrl.loadClinicalOverviewData if all conditions not met', function () {
      scope.data = {};
      scope.$apply();
      scope.data = { PerioExamSummaries: [{}, {}] };
      scope.$apply();
      expect(ctrl.loadClinicalOverviewData).not.toHaveBeenCalled();
      expect(ctrl.clinicalOverviewDeferred.resolve).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.processPatientMedications method->', function () {
    var patientMedications = [
      { DateWritten: '2019-03-19' },
      { DateWritten: '2019-03-19' },
      { DateWritten: '2019-03-19' },
    ];
    beforeEach(function () {
      ctrl.patientMedicationRecords = [
        {
          groupDate: '2019-03-19',
          date: '2019-03-19',
          load: true,
          recordType: 'PatientRx',
          record: { IsDeleted: false },
        },
        {
          groupDate: '2019-03-19',
          date: '2019-03-19',
          load: true,
          recordType: 'PatientRx',
          record: { IsDeleted: false },
        },
      ];
      spyOn(ctrl, 'executeMedicationsLoadingFallback');
      spyOn(ctrl, 'createTimelineItem').and.returnValue({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'PatientRx',
        record: { IsDeleted: false },
      });
      spyOn(ctrl, 'resetItemsInTimeLine');
    });

    it('should call resetItemsInTimeLine if ctrl.initialized.PatientRx is true (indicates PatientRx already exist in the timeline records ', function () {
      ctrl.initialized.PatientRx = true;
      scope.timelineRecords = _.cloneDeep(ctrl.patientMedicationRecords);
      ctrl.processPatientMedications(patientMedications);
      expect(ctrl.resetItemsInTimeLine).toHaveBeenCalled();
    });

    it('should initialize the PatientRx timeline records ctrl.initialized.PatientRx is false (indicates PatientRx do not exist in the timeline records ', function () {
      ctrl.initialized.PatientRx = false;
      scope.timelineRecords = [];
      ctrl.processPatientMedications(patientMedications);
      expect(ctrl.resetItemsInTimeLine).not.toHaveBeenCalled();
    });

    it('should call executeMedicationsLoadingFallback ', function () {
      ctrl.processPatientMedications(patientMedications);
      expect(ctrl.executeMedicationsLoadingFallback).toHaveBeenCalled();
    });
  });

  describe('ctrl.initMedications function ->', function () {
    beforeEach(function () {
      scope.hasRxViewAccess = true;
      scope.rxData = 'test';
      spyOn(
        ctrl,
        'executeMedicationsLoadingFallback'
      ).and.callFake(function () {});
      ctrl.processPatientMedications = jasmine.createSpy();
      scope.personId = '1234';
    });

    it('should call ctrl.processPatientMedications if scope.hasRxViewAccess is true and rxData has a value', function () {
      scope.hasRxViewAccess = true;
      ctrl.initMedications();
      expect(ctrl.processPatientMedications).toHaveBeenCalledWith('test');
    });

    it('should set scope properties if scope.hasRxViewAccess is true and rxData has a value', function () {
      scope.hasRxViewAccess = true;
      ctrl.initMedications();
      expect(scope.loading.PatientRx).toBe(true);
      expect(scope.loadingPatientMedication).toBe(true);
    });

    it('should call  executeMedicationsLoadingFallback if scope.hasRxViewAccess is false', function () {
      scope.hasRxViewAccess = false;
      ctrl.initMedications();
      expect(ctrl.executeMedicationsLoadingFallback).toHaveBeenCalled();
    });
  });

  describe(' ctrl.executeMedicationsLoadingFallback method ->', function () {
    beforeEach(function () {
      scope.loading.PatientRx = true;
      spyOn(ctrl, 'shouldIFilterRecords').and.callFake(function () {});
    });

    it('should call ctrl.shouldIFilterRecords', function () {
      ctrl.executeMedicationsLoadingFallback();
      expect(scope.loading.PatientRx).toEqual(false);
      expect(ctrl.shouldIFilterRecords).toHaveBeenCalled();
    });
  });

  describe('scope.toggleActive method ->', function () {
    beforeEach(function () {
      scope.showActive = true;
    });

    it('should call ctrl.shouldIFilterRecords', function () {
      scope.toggleActive();
      expect(scope.showActive).toEqual(false);
      expect(scope.toggleLabel).toEqual('Hide');

      scope.toggleActive();
      expect(scope.showActive).toEqual(true);
      expect(scope.toggleLabel).toEqual('Show');
    });
  });

  describe('scope.toggleTimelineActive method ->', function () {
    beforeEach(function () {
      scope.timelineActive = true;
    });

    it('should call ctrl.shouldIFilterRecords', function () {
      scope.toggleTimelineActive();
      expect(scope.timelineActive).toEqual(false);
      expect(scope.timelineLabel).toEqual('Show');

      scope.toggleTimelineActive();
      expect(scope.timelineActive).toEqual(true);
      expect(scope.timelineLabel).toEqual('Hide');
    });
  });

  describe('subtabs watch ->', function () {
    beforeEach(function () {
      scope.subtabs = { timelineActive: false };
      spyOn(ctrl, 'filterRecords');
    });

    it('should set ctrl.filterTimeline by timelineActive', function () {
      scope.subtabs = { timelineActive: false };
      scope.$apply();

      scope.subtabs = { timelineActive: true };
      scope.$apply();
      expect(ctrl.filterTimeline).toBe(true);

      scope.subtabs = { timelineActive: false };
      scope.$apply();
      expect(ctrl.filterTimeline).toBe(false);
    });

    it('should call ctrl.filterRecordds', function () {
      scope.subtabs = { timelineActive: false };
      scope.$apply();

      scope.subtabs = { timelineActive: true };
      scope.$apply();
      expect(ctrl.filterRecords).toHaveBeenCalled();
    });
  });

  describe('ctrl.$onInit method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'IsNavigatedFromAppts');
      spyOn(ctrl, 'filterRecords');
      spyOn(ctrl, 'getTeethDefinitions');
    });

    it('should call ctrl.IsNavigatedFromAppts if routeParams.activeExpand and txPlanId', function () {
      ctrl.$onInit();
      expect(ctrl.IsNavigatedFromAppts).toHaveBeenCalled();
      expect(ctrl.filterRecords).not.toHaveBeenCalled();
    });

    it('should not call ctrl.IsNavigatedFromAppts if routeParams not contain activeExpand and txPlanId', function () {
      routeParams.activeExpand = undefined;
      ctrl.$onInit();
      expect(ctrl.IsNavigatedFromAppts).not.toHaveBeenCalled();
    });

    it('should call ctrl.filterRecords if routeParams not contain activeExpand and txPlanId', function () {
      routeParams.activeExpand = undefined;
      ctrl.$onInit();
      expect(ctrl.filterRecords).toHaveBeenCalled();
      expect(ctrl.reloadPerio).toEqual(true);
    });

    it('should always call ctrl.getTeethDefinitions', function () {
      ctrl.$onInit();
      expect(ctrl.getTeethDefinitions).toHaveBeenCalled();
    });
  });

  describe('ctrl.getPerioStatsToothExamDetailsByPatientId method ->', function () {
    var list = [];
    beforeEach(function () {
      list = [{}];
    });

    it('should call patientPerioExamFactory.getAllExamsByPatientId when ctrl.reloadPerio is true', function () {
      ctrl.reloadPerio = true;
      scope.personId = '1234';
      ctrl.latestExamId = undefined;
      ctrl.getPerioStatsToothExamDetailsByPatientId(list);
      expect(
        patientPerioExamFactory.getAllExamsByPatientId
      ).toHaveBeenCalledWith(scope.personId, []);
    });

    it('should do nothing ctrl.reloadPerio is false', function () {
      ctrl.reloadPerio = false;
      ctrl.getPerioStatsToothExamDetailsByPatientId(list);
      expect(patientPerioExamFactory.get).not.toHaveBeenCalledWith(
        scope.personId
      );
      expect(patientPerioExamFactory.getById).not.toHaveBeenCalledWith(
        scope.personId,
        ctrl.latestExamId
      );
    });
  });

  describe('ctrl.getPerioStatsToothExamDetailsByPatientIdSuccess method ->', function () {
    var successResponse = {};
    beforeEach(function () {
      successResponse = {
        Value: [
          { ExamDate: '2019-03-19' },
          { ExamDate: '2019-02-19' },
          { ExamDate: '2019-01-19' },
        ],
      };
      spyOn(ctrl, 'updateAndSortFilteredTimelineRecords');
    });

    it('should call ctrl.updateAndSortFilteredTimelineRecords if Value.length equals 0', function () {
      successResponse.Value = [];
      ctrl.getPerioStatsToothExamDetailsByPatientIdSuccess(successResponse);
      expect(ctrl.updateAndSortFilteredTimelineRecords).toHaveBeenCalled();
    });
  });

  describe('ctrl.getPerioStatsToothExamDetailsByPatientIdFailure method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'updateAndSortFilteredTimelineRecords');
    });

    it('should call ctrl.updateAndSortFilteredTimelineRecords if Value.length equals 0', function () {
      ctrl.getPerioStatsToothExamDetailsByPatientIdFailure({});
      expect(ctrl.updateAndSortFilteredTimelineRecords).toHaveBeenCalled();
    });
  });

  describe('ctrl.getPerioStatsToothExamDetailsByPatientIdFailure method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'updateAndSortFilteredTimelineRecords');
    });

    it('should call ctrl.updateAndSortFilteredTimelineRecords if Value.length equals 0', function () {
      ctrl.getPerioStatsToothExamDetailsByPatientIdFailure({});
      expect(ctrl.updateAndSortFilteredTimelineRecords).toHaveBeenCalled();
    });
  });

  describe('ctrl.filterPerioStatsToothDetailsByReading method ->', function () {
    var perioStatsToothExamDetail = {
      ToothId: '4',
      DepthPocket: [1, 1, 2],
      GingivalMarginPocket: [3, 2, 1],
    };
    beforeEach(function () {
      ctrl.perioStatsToothExamDetailsByTooth = [];
    });

    it('should create ctrl.perioStatsToothExamDetailsByTooth records', function () {
      ctrl.filterPerioStatsToothDetailsByReading(perioStatsToothExamDetail);
      expect(ctrl.perioStatsToothExamDetailsByTooth[0].ToothId).toEqual('4');
      expect(ctrl.perioStatsToothExamDetailsByTooth[0].DepthPocket).toEqual([
        1,
        1,
        2,
      ]);
      expect(
        ctrl.perioStatsToothExamDetailsByTooth[0].GingivalMarginPocket
      ).toEqual([3, 2, 1]);
    });
  });

  describe('ctrl.createTimelineItemForFilter method ->', function () {
    var record = {};

    beforeEach(function () {
      record = {
        StartTime: '2019-02-11 10:00:000',
        Status: 1,
        IsDeleted: false,
        ConditionId: '2224',
      };
      scope.timelineRecords = [];
      // add records to timeline records
      scope.timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'ServiceTransaction',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ServiceTransactionId: '2222',
        },
      });
    });

    it('should create ctrl.createTimelineItemForFilter records', function () {
      var timeLineItem = ctrl.createTimelineItemForFilter(
        '3019-03-19 10:00:00',
        record,
        'Insurance'
      );
      expect(timeLineItem.groupDate).toEqual('Friday, March 19 3019');
      expect(timeLineItem.load).toEqual(true);
      expect(timeLineItem.recordType).toEqual('Insurance');
      expect(timeLineItem.record.StartTime).toEqual('2019-02-11 10:00:000');
      expect(timeLineItem.record.IsDeleted).toEqual(false);
      expect(timeLineItem.record.Status).toEqual(1);
      expect(timeLineItem.record.ConditionId).toEqual('2224');
    });
  });

  describe('ctrl.isShowUpload method ->', function () {
    beforeEach(function () {
      filters = [
        { RecordType: 'Lab' },
        { RecordType: 'Specialist' },
        { RecordType: 'Account' },
      ];
    });

    it('should return true if filters length > 0', function () {
      expect(ctrl.isShowUpload(filters)).toEqual(true);
    });

    it('should return false if filters length equals 0', function () {
      filters = [];
      expect(ctrl.isShowUpload(filters)).toEqual(false);
    });
  });

  describe('ctrl.setAllRecordsToLoadTrue method ->', function () {
    beforeEach(function () {
      ctrl.allRecordsAreVisibleForFiltering = false;
      scope.timelineRecords.push({
        groupDate: '2019-02-18',
        date: '2019-02-18',
        load: true,
        recordType: 'ServiceTransaction',
        record: {
          StartTime: '2019-02-11 10:00:000',
          Status: 1,
          IsDeleted: false,
          ServiceTransactionId: '2222',
        },
      });
    });

    it('should set ctrl.allRecordsAreVisibleForFiltering to true if ctrl.allRecordsAreVisibleForFiltering is false and scope.timelineRecords.length > 0', function () {
      ctrl.setAllRecordsToLoadTrue();
      expect(ctrl.allRecordsAreVisibleForFiltering).toEqual(true);
    });

    it('should not set ctrl.allRecordsAreVisibleForFiltering to true if scope.timelineRecords.length = 0', function () {
      scope.timelineRecords = [];
      ctrl.setAllRecordsToLoadTrue();
      expect(ctrl.allRecordsAreVisibleForFiltering).toEqual(false);
    });
  });

  describe('scope.addOrRemoveFilter method ->', function () {
    var event = { currentTarget: {} };
    var filterButton = {};
    beforeEach(function () {
      event = {};
      filterButton = { Active: true };
      scope.filterButtons = [
        { Active: true },
        { Active: true },
        { Active: false },
      ];
      scope.appliedFilters = [];
      spyOn(ctrl, 'setAllRecordsToLoadTrue');
      spyOn(ctrl, 'isShowUpload');
      spyOn(ctrl, 'filterRecords');
    });

    it('should call ctrl.setAllRecordsToLoadTrue', function () {
      scope.addOrRemoveFilter(event, filterButton);
      expect(ctrl.setAllRecordsToLoadTrue).toHaveBeenCalled();
    });

    it('should set scope.appliedFilters to equal all scope.filterButtons where Active is true when passed to method', function () {
      scope.addOrRemoveFilter(event, filterButton);
      expect(scope.appliedFilters).toEqual([
        { Active: true },
        { Active: true },
      ]);
    });

    it('should set scope.showUpload to false if no filterButtons are Active ', function () {
      scope.filterButtons = [
        { Active: false },
        { Active: false },
        { Active: false },
      ];
      scope.addOrRemoveFilter(event, filterButton);
      expect(scope.showUpload).toEqual(false);
    });

    it('should call ctrl.isShowUpload with active filterButtons', function () {
      scope.addOrRemoveFilter(event, filterButton);
      expect(ctrl.isShowUpload).toHaveBeenCalledWith([
        { Active: true },
        { Active: true },
      ]);
    });

    it('should set filterButton.Active to false if filterButton.Active is true when passed to method', function () {
      scope.addOrRemoveFilter(event, filterButton);
      expect(filterButton.Active).toEqual(false);
    });

    it('should add filterButton to scope.appliedFilters is filterButton.Active is false when passed to method', function () {
      filterButton = { Active: false };
      scope.addOrRemoveFilter(event, filterButton);
      expect(scope.appliedFilters).toEqual([{ Active: true }]);
    });

    it('should set filterButton.Active to true if filterButton.Active is false  when passed to method', function () {
      filterButton = { Active: false };
      scope.addOrRemoveFilter(event, filterButton);
      expect(filterButton.Active).toEqual(true);
    });

    it('should if filterButton.Active is false  when passed to method', function () {
      filterButton = { Active: false };
      scope.addOrRemoveFilter(event, filterButton);
      expect(ctrl.setAllRecordsToLoadTrue).toHaveBeenCalled();
    });

    it('should set ctrl.buttonFiltersApplied to true if there are active scope.filterButtons', function () {
      filterButton = { Active: false };
      scope.addOrRemoveFilter(event, filterButton);
      expect(ctrl.buttonFiltersApplied).toBe(true);
    });

    it('should set ctrl.buttonFiltersApplied to false if there are no active scope.filterButtons', function () {
      filterButton = { Active: true };
      scope.filterButtons = [];
      scope.addOrRemoveFilter(event, filterButton);
      expect(ctrl.buttonFiltersApplied).toBe(false);
    });

    it('should call ctrl.filterRecords', function () {
      scope.addOrRemoveFilter(event, filterButton);
      expect(ctrl.filterRecords).toHaveBeenCalled();
    });
  });

  describe('ctrl.IsNavigatedFromAppts method ->', function () {
    beforeEach(function () {
      scope.filterButtons = [
        { RecordType: 'TreatmentPlan', Active: true },
        { RecordType: 'Insurance', Active: true },
        { RecordType: 'Lab', Active: false },
      ];
      spyOn(ctrl, 'filterRecords');
    });

    it('should call ctrl.filterRecords', function () {
      ctrl.IsNavigatedFromAppts();
      expect(ctrl.filterRecords).toHaveBeenCalled();
    });
  });

  describe('showActive watch ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setAllRecordsToLoadTrue');
    });

    it('should call ctrl.setAllRecordsToLoadTrue if ctrl.allRecordsAreVisibleForFiltering equals false and showActive is false', function () {
      ctrl.allRecordsAreVisibleForFiltering = false;
      scope.showActive = true;
      scope.$apply();
      scope.showActive = false;
      scope.$apply();
      expect(ctrl.setAllRecordsToLoadTrue).toHaveBeenCalled();
    });

    it('should not call ctrl.setAllRecordsToLoadTrue if ctrl.allRecordsAreVisibleForFiltering equals true', function () {
      ctrl.allRecordsAreVisibleForFiltering = true;
      scope.showActive = true;
      scope.$apply();
      scope.showActive = false;
      scope.$apply();
      expect(ctrl.setAllRecordsToLoadTrue).not.toHaveBeenCalled();
    });

    it('should not call ctrl.setAllRecordsToLoadTrue if showActive is true', function () {
      ctrl.allRecordsAreVisibleForFiltering = true;
      scope.showActive = true;
      scope.$apply();
      scope.showActive = false;
      scope.$apply();
      expect(ctrl.setAllRecordsToLoadTrue).not.toHaveBeenCalled();
    });
  });

  describe(' $on show-service-modal event ->', function () {
    var args;
    beforeEach(function () {
      args = {
        type: 'service',
        title: 'D2140 ',
        isSwiftCode: false,
        firstCode: true,
        lastCode: true,
      };
      spyOn(scope, 'openToothCtrls');
    });

    it('should call openToothCtrls with args if args not empty', function () {
      scope.$emit('show-service-modal', args);
      expect(scope.openToothCtrls).toHaveBeenCalledWith(
        'service',
        'D2140 ',
        false,
        true,
        true
      );
    });

    it('should not call openToothCtrls with args if args empty', function () {
      args = null;
      scope.$emit('show-service-modal', args);
      expect(scope.openToothCtrls).not.toHaveBeenCalled();
    });
  });

  describe('scope.openToothCtrls method ->', function () {
    beforeEach(function () {
      scope.docCtrls = {
        setOptions: jasmine.createSpy().and.callFake(function () {}),
        open: jasmine.createSpy().and.callFake(function () {}),
        content: jasmine.createSpy().and.callFake(function () {}),
      };
    });

    it('should call ctrl.shouldIFilterRecords', function () {
      scope.openToothCtrls('service', 'D2140 ', false, true, true);
      expect(scope.docCtrls.open).toHaveBeenCalled();
    });
  });

  describe(' $on show-condition-modal event ->', function () {
    var args;
    beforeEach(function () {
      args = { mode: 'edit', title: 'Missing Tooth' };
      spyOn(scope, 'openPatientConditionCreateUpdate');
    });

    it('should call scope.openPatientConditionCreateUpdate with args if args not empty', function () {
      scope.$emit('show-condition-modal', args);
      expect(scope.openPatientConditionCreateUpdate).toHaveBeenCalledWith(
        'edit',
        'Missing Tooth'
      );
    });

    it('should not call scope.openPatientConditionCreateUpdate with args if args empty', function () {
      args = null;
      scope.$emit('show-condition-modal', args);
      expect(scope.openPatientConditionCreateUpdate).not.toHaveBeenCalled();
    });
  });

  describe(' ctrl.onExistingTreatmentPlanChange method ->', function () {
    var existingTreatmentPlans = [];
    beforeEach(function () {
      existingTreatmentPlans = [{}, {}, {}];
    });

    // TODO test anonomous function
    it('should reload existingTreatmentPlans if user has security', function () {
      scope.hasClinicalTxPlanViewAccess = true;
      ctrl.onExistingTreatmentPlanChange(existingTreatmentPlans);
      //expect(updateExistingTreatmentPlans).toHaveBeenCalledWith(existingTreatmentPlans)
    });
  });

  describe(' ctrl.initializeObservers method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'onExistingTreatmentPlanChange');
    });

    it('should initialize the observer', function () {
      ctrl.initializeObservers();
      expect(
        treatmentPlansFactory.ObserveExistingTreatmentPlansForTimeline
      ).toHaveBeenCalledWith(ctrl.onExistingTreatmentPlanChange);
    });

    it('should load existing treatment plans', function () {
      ctrl.initializeObservers();
      expect(ctrl.onExistingTreatmentPlanChange).toHaveBeenCalledWith(
        treatmentPlansFactory.ExistingTreatmentPlans
      );
    });
  });

  describe(' ctrl.executeImageLoadingFallback method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'shouldIFilterRecords');
    });

    it('should only check scope.loading if not undefined', function () {
      scope.loading = null;
      ctrl.executeImageLoadingFallback();
      expect(scope.loading).toBe(null);

      scope.loading = {
        ImageExam: true,
      };
      ctrl.executeImageLoadingFallback();
      expect(scope.loading.ImageExam).toBe(false);
    });

    it('should only call ctrl.shouldIFilterRecords if scope.loading is not undefined', function () {
      scope.loading = null;
      ctrl.executeImageLoadingFallback();
      expect(ctrl.shouldIFilterRecords).not.toHaveBeenCalled();

      scope.loading = {
        ImageExam: true,
      };
      ctrl.executeImageLoadingFallback();
      expect(ctrl.shouldIFilterRecords).toHaveBeenCalled();
    });
  });

  describe('ctrl.shouldIFilterRecords method ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'filterRecords');
    });

    it('should only call ctrl.filterRecords if all properties are false', function () {
      scope.loading = null;
      ctrl.shouldIFilterRecords();
      expect(ctrl.filterRecords).not.toHaveBeenCalled();
      expect(ctrl.everythingIsLoaded).toBe(false);

      scope.loading = {
        ServiceAndCondition: false,
        MedicalHistory: false,
        TreatmentPlan: false,
        Appointment: false,
        ClinicalNote: false,
        Documents: false,
        PerioStatsMouth: false,
        ImageExam: false,
        ImageExamExternal: false,
        PatientRx: false,
      };
      ctrl.shouldIFilterRecords();
      expect(ctrl.filterRecords).toHaveBeenCalled();
      expect(ctrl.everythingIsLoaded).toBe(true);
    });
  });

  describe('scope.onUpLoadCancel method', function () {
    beforeEach(function () {
      scope.docCtrls = {
        close: jasmine.createSpy(),
      };
    });

    it('should call docCtrls.close()', function () {
      scope.onUpLoadCancel();
      expect(scope.docCtrls.close).toHaveBeenCalled();
    });
  });

  describe('scope.onUpLoadSuccess method', function () {
    var doc = {};
    beforeEach(function () {
      doc = { DocumentId: 1234 };
      scope.docCtrls = {
        close: jasmine.createSpy(),
      };
      spyOn(ctrl, 'loadDocuments').and.callFake(function () {});
      ctrl.initialized = { Documents: true };
    });

    it('should call docCtrls.close()', function () {
      scope.onUpLoadSuccess(doc);
      expect(scope.docCtrls.close).toHaveBeenCalled();
    });

    it('should call ctrl.loadDocuments if ctrl.initialized.Documents = true', function () {
      scope.onUpLoadSuccess(doc);
      expect(ctrl.loadDocuments).toHaveBeenCalled();
    });
  });

  describe('ctrl.createNewExternalImages method', function () {
    beforeEach(function () {
      ctrl.existingExternalImages = _.cloneDeep(filteredNewImages);
    });

    it('should call fileUploadFactory.CreatePatientDirectory', function () {
      ctrl.createNewExternalImages();
      expect(fileUploadFactory.CreatePatientDirectory).toHaveBeenCalledWith(
        Object({
          PatientId: '12345678-1234-1234-1234-123456789abc',
          DirectoryAllocationId: 1234,
        }),
        [111, 222],
        'plapi-files-fsys-write'
      );
    });

    it('should call externalImagingWorkerFactory.saveImages if fileUploadFactory.CreatePatientDirectory success and  ctrl.existingExternalImages.length > 0 and ctrl.externalPatientId', function () {
      createPatientDirectoryReturnValue.then = function (callback) {
        callback({ res: '9999' });
      };
      ctrl.externalPatientId = '1234';
      ctrl.existingExternalImages = [{}, {}];
      ctrl.createNewExternalImages();
      expect(externalImagingWorkerFactory.saveImages).toHaveBeenCalled();
    });

    it('should not call externalImagingWorkerFactory.saveImages if fileUploadFactory.CreatePatientDirectory success and  ctrl.existingExternalImages.length > 0 and ctrl.externalPatientId is null', function () {
      createPatientDirectoryReturnValue.then = function (callback) {
        callback({ res: '9999' });
      };
      ctrl.externalPatientId = null;
      ctrl.existingExternalImages = [{}, {}];
      ctrl.createNewExternalImages();
      expect(externalImagingWorkerFactory.saveImages).not.toHaveBeenCalled();
    });

    it('should not call externalImagingWorkerFactory.saveImages if fileUploadFactory.CreatePatientDirectory success and  ctrl.existingExternalImages.length is 0', function () {
      createPatientDirectoryReturnValue.then = function (callback) {
        callback({ res: '9999' });
      };
      ctrl.externalPatientId = '1234';
      ctrl.existingExternalImages = [];
      ctrl.createNewExternalImages();
      expect(externalImagingWorkerFactory.saveImages).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.filterExamsForRemovedImages method', function () {
    let sidexisExams = [];
    let existingImages = [];
    beforeEach(function () {
      scope.personId = '1234';
      sidexisExams = [
        {
          studyId: null,
          date: '2020-03-10T00:00:00',
          description: null,
          series: [
            {
              seriesId: null,
              date: '2020-03-10T00:00:00',
              description: null,
              images: [
                {
                  imageId: '1234',
                  date: '2020-03-10T15:30:53.207',
                  toothNumbers: '11,12',
                  description: 'Imported File',
                  imageNumber: 1234,
                },
                {
                  imageId: '1235',
                  date: '2020-03-10T15:30:53.207',
                  toothNumbers: '12,13',
                  description: 'Imported File',
                  imageNumber: 1235,
                },
              ],
            },
          ],
        },
      ];
      existingImages = [
        { ImageId: '1234' },
        { ImageId: '1235' },
        { ImageId: '1236' },
        { ImageId: '1237' },
      ];
    });

    it('should set MarkDeleted to true for existing images not in sidexis data', function () {
      ctrl.filterExamsForRemovedImages(existingImages, sidexisExams);
      expect(existingImages.length).toEqual(4);
      expect(existingImages[0]).toEqual({
        ImageId: '1234',
        MarkDeleted: false,
      });
      expect(existingImages[1]).toEqual({
        ImageId: '1235',
        MarkDeleted: false,
      });
      expect(existingImages[2]).toEqual({ ImageId: '1236', MarkDeleted: true });
      expect(existingImages[3]).toEqual({ ImageId: '1237', MarkDeleted: true });
    });
  });

  describe('ctrl.filterExamsForNewImages method', function () {
    let newExams = [];
    let existingImages = [];
    beforeEach(function () {
      scope.personId = '1234';
      newExams = _.cloneDeep(sidexisExams);
      existingImages = _.cloneDeep(existingExternalImages);
    });

    it('should filter exams for new image records based on ImageId', function () {
      let filteredNewImages = ctrl.filterExamsForNewImages(
        existingImages,
        newExams
      );
      expect(filteredNewImages.length).toEqual(3);
      expect(filteredNewImages[0].ImageId).toEqual('14');
      expect(filteredNewImages[1].ImageId).toEqual('2');
      expect(filteredNewImages[2].ImageId).toEqual('3');
    });
  });

  describe('ctrl.mergeExternalImages method', function () {
    let newImageDtos = [];
    beforeEach(function () {
      scope.personId = '1234';
      ctrl.existingExternalImages = _.cloneDeep(existingExternalImages);
      ctrl.externalImageStudies = _.cloneDeep(sidexisExams);
      spyOn(ctrl, 'filterExamsForNewImages').and.callFake(function () {
        return newImageDtos;
      });
      spyOn(ctrl, 'createNewExternalImages').and.callFake(function () {});
      spyOn(ctrl, 'processExternalImageExams').and.callFake(function () {});
    });

    it('should call ctrl.filterExamsForNewImages', function () {
      ctrl.mergeExternalImages();
      expect(ctrl.filterExamsForNewImages).toHaveBeenCalledWith(
        ctrl.existingExternalImages,
        ctrl.externalImageStudies
      );
    });

    it('should call ctrl.createNewExternalImages', function () {
      newImageDtos = _.cloneDeep(filteredNewImages);
      ctrl.mergeExternalImages();
      expect(ctrl.createNewExternalImages).toHaveBeenCalled();
    });

    it('should call ctrl.processExternalImageExams', function () {
      ctrl.mergeExternalImages();
      expect(ctrl.processExternalImageExams).toHaveBeenCalledWith(
        ctrl.existingExternalImages
      );
    });
  });

  describe('ctrl.processExternalImageExams method', function () {
    let existingImages = [];
    beforeEach(function () {
      var existingExternalImages = [
        {
          ThirdPartyImagingRecordId: '458821',
          PatientId: '1234',
          ImageCreatedDate: '2020-03-10T15:30:53.207',
          ImageId: 'f11ac445-1b63-45b4',
          OriginalImageFilename: 'Imported File',
          ImagingProviderId: 1,
          ToothNumbers: ['2', '3'],
        },
        {
          ThirdPartyImagingRecordId: '458822',
          PatientId: '1234',
          ImageCreatedDate: '2020-03-10T15:30:53.207',
          ImageId: 'f11ac445-1b63-46b4',
          OriginalImageFilename: 'Imported File',
          ImagingProviderId: 1,
          ToothNumbers: ['4', '5'],
        },
        {
          PatientId: '1234',
          ImageCreatedDate: '2020-03-08T15:30:53.207',
          ImageId: 'f12ac445-1b63-45b4',
          OriginalImageFilename: 'Imported File',
          ImagingProviderId: 1,
          ToothNumbers: [],
        },
      ];
      existingImages = _.cloneDeep(existingExternalImages);
    });

    it('should organize images into exams grouped by date', function () {
      ctrl.processExternalImageExams(existingImages);
      expect(ctrl.externalImageExams.length).toBe(2);
    });

    it('should filter out externalImages that have MarkDeleted set to true', function () {
      existingImages[0].MarkDeleted = true;
      existingImages[1].MarkDeleted = true;
      ctrl.processExternalImageExams(existingImages);
      expect(ctrl.externalImageExams.length).toBe(1);
    });

    it('should organize images into exams grouped by date', function () {
      ctrl.processExternalImageExams(existingImages);
      expect(ctrl.externalImageExams.length).toBe(2);
      expect(ctrl.externalImageExams[0].groupDate).toEqual(
        'Tuesday, March 10 2020'
      );
      expect(ctrl.externalImageExams[1].groupDate).toEqual(
        'Sunday, March 8 2020'
      );
    });

    it('should set recordType to ExternalImages', function () {
      ctrl.processExternalImageExams(existingImages);
      expect(ctrl.externalImageExams[0].recordType).toEqual(
        'ExternalImageExam'
      );
      expect(ctrl.externalImageExams[1].recordType).toEqual(
        'ExternalImageExam'
      );
    });

    it('should concatenate ToothNumbers for images in group', function () {
      ctrl.processExternalImageExams(existingImages);
      expect(ctrl.externalImageExams[0].record.ToothNumbers).toEqual([
        '2',
        '3',
        '4',
        '5',
      ]);
      expect(ctrl.externalImageExams[1].record.ToothNumbers).toEqual([]);
    });

    it('should call ctrl.createTimelineItem for each group', function () {
      spyOn(ctrl, 'createTimelineItem');
      ctrl.processExternalImageExams(existingImages);
      expect(ctrl.createTimelineItem).toHaveBeenCalled();
    });

    it('should set ctrl.initialized.ImageExamExternal to true ', function () {
      spyOn(ctrl, 'createTimelineItem');
      ctrl.processExternalImageExams(existingImages);
      expect(ctrl.initialized.ImageExamExternal).toBe(true);
    });

    it('should call ctrl.executeExternalImageLoadingFallback', function () {
      spyOn(ctrl, 'executeExternalImageLoadingFallback');
      ctrl.processExternalImageExams(existingImages);
      expect(ctrl.executeExternalImageLoadingFallback).toHaveBeenCalled();
    });
  });

  describe('ctrl.getSidexisExternalImageExams method ->', function () {
    var sidexis;
    beforeEach(function () {
      sidexis = 'sidexisKey';
      imagingProviders.Sidexis = sidexis;

      ctrl.executeImageLoadingFallback = jasmine.createSpy();
      ctrl.getExternalImageExamsFailure = jasmine.createSpy();
    });

    describe('when scope.hasClinicalImagingViewAccess is true ->', function () {
      var patientId, thirdPartyId;
      beforeEach(function () {
        patientId = 'fakePatientId';
        thirdPartyId = 'fakeThirdPartyId';

        scope.personId = patientId;
        scope.data.patientInfo.ThirdPartyPatientId = thirdPartyId;
        scope.hasClinicalImagingViewAccess = true;
        scope.loading.ImageExamExternal = false;

        ctrl.clinicalOverviewDeferred = {
          promise: { then: jasmine.createSpy() },
        };
      });

      it('should set scope.loading.ImageExamExternal to true and wait for ctrl.clinicalOverviewDeferred.promise', function () {
        ctrl.getSidexisExternalImageExams();

        expect(scope.loading.ImageExamExternal).toBe(true);
        expect(ctrl.clinicalOverviewDeferred.promise.then).toHaveBeenCalled();
      });

      describe('ctrl.clinicalOverviewDeferred.promise callback ->', function () {
        beforeEach(function () {
          ctrl.clinicalOverviewDeferred = {
            promise: { then: cb => cb() },
          };
        });

        it('should call imagingMasterService.getPatientByFusePatientId with correct parameters', function () {
          ctrl.getSidexisExternalImageExams();

          expect(
            imagingMasterService.getPatientByFusePatientId
          ).toHaveBeenCalledWith(patientId, thirdPartyId, [sidexis]);
        });

        describe('getPatientByFusePatientId success callback ->', function () {
          var getPatientResult;
          beforeEach(function () {
            spyOn(ctrl, 'syncPatientData').and.callFake(function () {});
            getPatientResult = {};
            imagingMasterService.getPatientByFusePatientId = jasmine
              .createSpy()
              .and.returnValue({ then: s => s(getPatientResult.res) });
          });

          describe('when id is returned ->', function () {
            var sidexisId;
            beforeEach(function () {
              sidexisId = 'sidexisId';
              getPatientResult.res = {};
              getPatientResult.res[sidexis] = {
                success: true,
                result: { id: sidexisId },
              };

              imagingMasterService.getAllByPatientId = jasmine
                .createSpy()
                .and.returnValue({ then: () => {} });
            });

            it('should call imagingMasterService.getAllByPatientId', function () {
              ctrl.getSidexisExternalImageExams();

              expect(
                imagingMasterService.getAllByPatientId
              ).toHaveBeenCalledWith(sidexisId, sidexis);
            });

            describe('getAllByPatientId callback ->', function () {
              var getAllResult;
              beforeEach(function () {
                getAllResult = {};
                imagingMasterService.getAllByPatientId = jasmine
                  .createSpy()
                  .and.returnValue({ then: cb => cb(getAllResult.res) });
              });

              it('should set externalImageStudies when res is not empty', function () {
                var result = 'result';
                getAllResult.res = { result: result };
                ctrl.externalImageStudies = null;

                ctrl.getSidexisExternalImageExams();

                expect(ctrl.externalImageStudies).toBe(result);
              });

              it('should call ctrl.getExternalImageExamsFailure when result is empty', function () {
                getAllResult.res = null;

                ctrl.getSidexisExternalImageExams();

                expect(ctrl.getExternalImageExamsFailure).toHaveBeenCalled();
              });
            });
          });

          it('should call ctrl.executeImageLoadingFallback when res is not returned', function () {
            getPatientResult.res = null;

            ctrl.getSidexisExternalImageExams();

            expect(ctrl.executeImageLoadingFallback).toHaveBeenCalled();
          });

          it('should call ctrl.executeImageLoadingFallback when res[sidexis] is not returned', function () {
            getPatientResult.res = {};

            ctrl.getSidexisExternalImageExams();

            expect(ctrl.executeImageLoadingFallback).toHaveBeenCalled();
          });

          it('should call ctrl.executeImageLoadingFallback when res[sidexis].success is false', function () {
            getPatientResult.res = {};
            getPatientResult.res[sidexis] = {
              success: false,
            };

            ctrl.getSidexisExternalImageExams();

            expect(ctrl.executeImageLoadingFallback).toHaveBeenCalled();
          });

          it('should call ctrl.executeImageLoadingFallback when res[sidexis].result is not returned', function () {
            getPatientResult.res = {};
            getPatientResult.res[sidexis] = {
              success: true,
              result: null,
            };

            ctrl.getSidexisExternalImageExams();

            expect(ctrl.executeImageLoadingFallback).toHaveBeenCalled();
          });

          it('should call ctrl.executeImageLoadingFallback when id is not returned', function () {
            getPatientResult.res = {};
            getPatientResult.res[sidexis] = {
              success: true,
              result: {},
            };

            ctrl.getSidexisExternalImageExams();

            expect(ctrl.executeImageLoadingFallback).toHaveBeenCalled();
          });
        });

        describe('getPatientByFusePatientId failure callback ->', function () {
          beforeEach(function () {
            imagingMasterService.getPatientByFusePatientId = jasmine
              .createSpy()
              .and.returnValue({ then: (s, f) => f() });
          });

          it('should call ctrl.getExternalImageExamsFailure', function () {
            ctrl.getSidexisExternalImageExams();

            expect(ctrl.getExternalImageExamsFailure).toHaveBeenCalled();
          });
        });
      });
    });

    it('should call ctrl.executeImageLoadingFallback when scope.hasClinicalImagingViewAccess is false ->', function () {
      scope.hasClinicalImagingViewAccess = false;

      ctrl.getSidexisExternalImageExams();

      expect(ctrl.executeImageLoadingFallback).toHaveBeenCalled();
    });
  });

  describe('ctrl.getSidexisExternalImageExams method', function () {
    var existingExternalImages;
    var exam;
    beforeEach(function () {
      scope.examToPreview = null;

      existingExternalImages = [
        {
          ThirdPartyImagingRecordId: 458821,
          PatientId: '1234',
          ImageCreatedDate: '2020-03-10T15:30:53.207',
          ImageId: 'f11ac445-1b63-45b4',
          OriginalImageFilename: 'Imported File',
          ImagingProviderId: 1,
          FileAllocationId: 1234,
          ToothNumbers: ['2', '3'],
        },
        {
          ThirdPartyImagingRecordId: 458822,
          PatientId: '1234',
          ImageCreatedDate: '2020-03-10T15:30:53.207',
          ImageId: 'f11ac445-1b63-46b5',
          OriginalImageFilename: 'Imported File',
          FileAllocationId: 1235,
          ImagingProviderId: 1,
          ToothNumbers: ['4', '5'],
        },
      ];
      spyOn(ctrl, 'filterRecords');
      scope.timelineRecords = [
        {
          recordType: 'ExternalImageExam',
          record: {
            Series: [
              {
                Images: [
                  {
                    ImageId: 'f11ac445-1b63-45b4',
                    ThirdPartyImagingRecordId: 458821,
                    FileAllocationId: 1234,
                  },
                  {
                    ImageId: 'f11ac445-1b63-46b5',
                    ThirdPartyImagingRecordId: 458822,
                    FileAllocationId: 1235,
                  },
                ],
              },
            ],
          },
        },
      ];

      exam = {
        recordType: 'ExternalImageExam',
        record: {
          Series: [
            {
              Images: [
                {
                  ImageId: 'f11ac445-1b63-45b4',
                  ThirdPartyImagingRecordId: 458821,
                  FileAllocationId: 1234,
                },
                {
                  ImageId: 'f11ac445-1b63-46b5',
                  ThirdPartyImagingRecordId: 458822,
                  FileAllocationId: 1234,
                },
              ],
            },
          ],
        },
      };
    });

    it('should update scope.timelineRecords FileAllocationId and ThirdPartyImagingRecordId with latest externalImages ', function () {
      scope.timelineRecords[0].record.Series[0].Images[0].FileAllocationId = 0;
      scope.timelineRecords[0].record.Series[0].Images[0].ThirdPartyImagingRecordId = null;

      scope.timelineRecords[0].record.Series[0].Images[1].FileAllocationId = null;
      scope.timelineRecords[0].record.Series[0].Images[1].ThirdPartyImagingRecordId = 1235;

      ctrl.updateExternalImageExams(existingExternalImages, exam);

      expect(
        scope.timelineRecords[0].record.Series[0].Images[0].FileAllocationId
      ).toBe(1234);
      expect(
        scope.timelineRecords[0].record.Series[0].Images[0]
          .ThirdPartyImagingRecordId
      ).toBe(458821);

      expect(
        scope.timelineRecords[0].record.Series[0].Images[1].FileAllocationId
      ).toBe(1235);
      expect(
        scope.timelineRecords[0].record.Series[0].Images[1]
          .ThirdPartyImagingRecordId
      ).toBe(458822);
    });

    it('should call ctrl.filterRecords ', function () {
      ctrl.updateExternalImageExams(existingExternalImages, exam);
      expect(ctrl.filterRecords).toHaveBeenCalled();
    });

    it('should set scope.examToPreview to passed in exam ', function () {
      ctrl.updateExternalImageExams(existingExternalImages, exam);
      expect(scope.examToPreview).toEqual(exam);
    });
  });

  describe(' $on soar:update-external-images event ->', function () {
    let returnValue = function (callback) {
      callback();
    };
    let exam = {};
    beforeEach(function () {
      ctrl.existingExternalImages = [{}, {}];
      scope.exam = {};
      returnValue.then = function (callback) {
        callback();
      };
      spyOn(ctrl, 'getExistingExternalImages').and.returnValue(returnValue);
      spyOn(ctrl, 'updateExternalImageExams');
    });

    it('should call ctrl.getExistingExternalImages then ctrl.updateExternalImageExams', function () {
      scope.$emit('soar:update-external-images', exam);
      expect(ctrl.getExistingExternalImages).toHaveBeenCalled();
      expect(ctrl.updateExternalImageExams).toHaveBeenCalledWith(
        ctrl.existingExternalImages,
        exam
      );
    });
  });

  describe(' ctrl.filterExamsForNewImages method ->', function () {
    let existingImages = [];
    let newExams = [];
    let newImageDtos = [];
    beforeEach(function () {
      (scope.personId = '1234'), (existingImages = [{}, {}]);
      newExams = _.cloneDeep(sidexisExams);
    });

    it('should create new image records with concatenated OriginalImageFilename ', function () {
      newImageDtos = ctrl.filterExamsForNewImages(existingImages, newExams);
      let toothArray = [];
      _.forEach(
        newExams[0].series[0].images[0].toothNumbers.split(','),
        function (toothNumber) {
          toothArray.push(toothNumber);
        }
      );
      expect(newImageDtos[0]).toEqual({
        ThirdPartyImagingRecordId: null,
        PatientId: scope.personId,
        ImageCreatedDate: newExams[0].series[0].images[0].date,
        ImageId: newExams[0].series[0].images[0].imageNumber.toString(),
        OriginalImageFilename:
          newExams[0].series[0].images[0].description +
          '_' +
          newExams[0].series[0].images[0].imageNumber.toString(),
        ImagingProviderId: 1,
        ToothNumbers: toothArray,
      });
      toothArray = [];
      _.forEach(
        newExams[0].series[0].images[1].toothNumbers.split(','),
        function (toothNumber) {
          toothArray.push(toothNumber);
        }
      );
      expect(newImageDtos[1]).toEqual({
        ThirdPartyImagingRecordId: null,
        PatientId: scope.personId,
        ImageCreatedDate: newExams[0].series[0].images[1].date,
        ImageId: newExams[0].series[0].images[1].imageNumber.toString(),
        OriginalImageFilename:
          newExams[0].series[0].images[1].description +
          '_' +
          newExams[0].series[0].images[1].imageNumber.toString(),
        ImagingProviderId: 1,
        ToothNumbers: toothArray,
      });

      expect(newImageDtos[2]).toEqual({
        ThirdPartyImagingRecordId: null,
        PatientId: scope.personId,
        ImageCreatedDate: newExams[0].series[0].images[2].date,
        ImageId: newExams[0].series[0].images[2].imageNumber.toString(),
        OriginalImageFilename:
          newExams[0].series[0].images[2].description +
          '_' +
          newExams[0].series[0].images[2].imageNumber.toString(),
        ImagingProviderId: 1,
        ToothNumbers: [],
      });
    });

    describe('syncPatientData method ->', function () {
      let fusePatient = {};
      let sidexisPatient = {};
      let getUrlResponse = { res: { success: true } };
      beforeEach(function () {
        fusePatient = {
          ThirdPartyPatientId: '1234',
          LastName: 'Johnson',
          FirstName: 'Bob',
          Sex: 'M',
          DateOfBirth: '03/15/1947',
        };
        sidexisPatient = {
          firstName: 'Bob',
          lastName: 'Johnson',
          gender: 'Male',
          birthdate: '03/15/1947',
        };
        imagingMasterService.updatePatientData = jasmine
          .createSpy()
          .and.returnValue({ then: cb => cb(getUrlResponse.res) });
      });

      it('should not call imagingMasterService.updatePatientData if patient.FirstName or patient.LastName has changed ', function () {
        ctrl.syncPatientData(sidexisPatient, fusePatient);
        expect(imagingMasterService.updatePatientData).not.toHaveBeenCalledWith(
          {
            patientId: '1234',
            lastName: 'Johnson',
            firstName: 'Bob',
            gender: 'M',
            birthDate: '03/15/1947',
          },
          'sidexis'
        );
      });

      it('should call imagingMasterService.updatePatientData if patient.FirstName or patient.LastName has changed ', function () {
        fusePatient.FirstName = 'Robert';
        ctrl.syncPatientData(sidexisPatient, fusePatient);
        expect(imagingMasterService.updatePatientData).toHaveBeenCalledWith(
          {
            patientId: '1234',
            lastName: 'Johnson',
            firstName: 'Robert',
            gender: 'Male',
            birthDate: '1947-03-15',
          },
          'sidexis'
        );
      });

      it('should call imagingMasterService.updatePatientData if patient.DateOfBirth has changed ', function () {
        fusePatient.DateOfBirth = '03/22/1953';
        ctrl.syncPatientData(sidexisPatient, fusePatient);
        expect(imagingMasterService.updatePatientData).toHaveBeenCalledWith(
          {
            patientId: '1234',
            lastName: 'Johnson',
            firstName: 'Bob',
            gender: 'Male',
            birthDate: '1953-03-22',
          },
          'sidexis'
        );
      });
    });

    describe('on soar:chart-services-retrieved broadcast function ->', function () {
      it('should set ctrl.reloadingChartLedger  to true if passed true ', function () {
        ctrl.reloadingChartLedger = false;
        scope.$emit('soar:chart-services-retrieved', true);
        expect(ctrl.reloadingChartLedger).toBe(true);
      });
    });
  });
});
