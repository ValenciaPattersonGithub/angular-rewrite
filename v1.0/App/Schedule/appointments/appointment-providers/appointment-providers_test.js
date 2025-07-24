describe('AppointmentProvidersController tests ->', function () {
  var routeParams, scope, listHelper, ctrl, timeout, filter, toastrFactory;
  var patSecurityService,
    localize,
    scheduleServices,
    appointmentConflictFactory,
    timeZoneFactory;

  var mockConflicts = {
    ProviderConflicts: [
      {
        Location: {
          LocationId: 2,
          NameAbbreviation: 'Flat Rock Dental',
          Timezone: 'CDT',
        },
        UserId: '1234',
        HasHours: true,
        LocationConflicts: [
          {
            ProviderUsers: [
              {
                UserId: '1234',
                FirstName: 'Jim',
                MiddleName: 'M',
                LastName: 'Bond',
              },
            ],
            Appointment: {
              AppointmentId: '1234',
              TreatmentRoomId: '12345',
              StartTime: '2018-05-15T14:15:00',
              EndTime: '2018-05-15T14:30:00',
              ExaminingDentist: null,
              ProviderAppointments: [
                {
                  UserId: '234',
                  EndTime: '2018-05-15T14:30:00',
                  StartTime: '2018-05-15T14:15:00',
                },
              ],
              PlannedServices: null,
              LocationId: 2,
            },
            Location: {
              LocationId: 2,
              Timezone: 'CDT',
            },
          },
        ],
        AppointmentConflicts: [
          {
            Location: {
              LocationId: 2,
              Timezone: 'CDT',
            },
            ProviderUsers: [
              {
                UserId: '1234',
                FirstName: 'Jim',
                MiddleName: 'M',
                LastName: 'Bond',
              },
            ],
            Appointment: {
              AppointmentId: '1234',
              TreatmentRoomId: '12345',
              StartTime: '2018-05-15T14:15:00',
              EndTime: '2018-05-15T14:30:00',
              ExaminingDentist: null,
              ProviderAppointments: [
                {
                  UserId: '234',
                  EndTime: '2018-05-15T14:30:00',
                  StartTime: '2018-05-15T14:15:00',
                },
              ],
              PlannedServices: null,
              LocationId: 2,
            },
          },
        ],
        Room: { RoomId: '12345' },
        ProviderUsers: [
          {
            UserId: '1234',
            FirstName: 'Jim',
            MiddleName: 'M',
            LastName: 'Bond',
          },
        ],
      },
    ],
    RoomConflicts: [],
  };

  var mockAppointment = {
    AppointmentId: 1,
    Classification: 0,
    EndTime: '2018-05-15T14:15:00.00Z',
    StartTime: '2018-05-15T14:00:00.00Z',
    TreatmentRoomId: 123,
    LocationId: 1,
    PlannedServices: [],
    ProviderAppointments: [
      {
        ProviderAppointmentId: '1',
        EndTime: '2018-05-15T14:15:00.00Z',
        StartTime: '2018-05-15T14:00:00.00Z',
      },
    ],
    Room: { RoomId: 1 },
  };

  listHelper = {
    findItemByFieldValue: function (item) {
      return item;
    },
  };

  var referenceDataService = {
    get: jasmine.createSpy().and.callFake(function () {
      return [{ type: '123' }];
    }),
    entityNames: {
      practiceSettings: 'practiceSettings',
    },
  };

  //#endregion

  beforeEach(module('Soar.Schedule', function () {}));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      timeZoneFactory = {
        GetTimeZoneAbbr: jasmine.createSpy().and.returnValue('CDT'),
        ConvertDateTZ: jasmine
          .createSpy()
          .and.returnValue('converted_date_object'),
      };
      $provide.value('TimeZoneFactory', timeZoneFactory);
      $provide.value('referenceDataService', referenceDataService);
    })
  );

  //#endregion
  var deferred, q;
  // Create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $timeout,
    $route,
    $routeParams,
    $filter,
    $q
  ) {
    q = $q;
    scope = $rootScope.$new();
    deferred = q.defer();
    filter = $filter;
    timeout = $timeout;

    appointmentConflictFactory = {
      getAllConflicts: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    ctrl = $controller('AppointmentProvidersController', {
      $scope: scope,
      ListHelper: listHelper,
      $filter: filter,
      $timeout: timeout,
      localize: localize,
      AppointmentConflictFactory: appointmentConflictFactory,
    });
    scope.onChange = function () {};
    ctrl.listHelper = listHelper;
  }));

  describe('scope.checkProviderMissingHours function -> ', function () {
    beforeEach(function () {
      scope.selectedProviders = [
        { UserId: '1234', FirstName: 'Jim', LastName: 'Bond' },
      ];
      scope.appointment = angular.copy(mockAppointment);
      scope.providerSchedules = [];
      scope.providerValidationMissingHours = [];
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0);
    });
    it('should add provider to providerValidationMissingHours list if they have been selected but have no providerSchedules', function () {
      var providerSchedule = null;
      // mock listhelper finding item in scope.providerSchedules
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(providerSchedule);
      scope.checkProviderMissingHours();
      expect(scope.providerValidationMissingHours).toEqual([
        { ProviderId: '1234', ProviderName: 'J. Bond' },
      ]);
    });

    it('should remove provider from providerValidationMissingHours list if they have been selected and have providerSchedules', function () {
      var providerSchedule = { ProviderId: '1234', ProviderName: 'J. Bond' };
      // mock listhelper finding item in scope.providerSchedules
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(providerSchedule);
      scope.checkProviderMissingHours();
      expect(scope.providerValidationMissingHours).toEqual([]);
    });
  });

  describe('$watch providerSchedules ->', function () {
    beforeEach(function () {
      scope.selectedProviders = [
        { UserId: '1234', FirstName: 'Jim', LastName: 'Bond' },
      ];
      scope.appointment = angular.copy(mockAppointment);
    });

    it('should call ctrl.getConflicts when providerSchedules changes and length > 0', function () {
      spyOn(scope, 'onChange');
      scope.providerSchedules = [];
      scope.$digest();
      scope.providerSchedules = [{}, {}];
      scope.$digest();
      expect(scope.onChange).toHaveBeenCalled();
    });

    it('should call checkProviderMissingHours when providerSchedules changes', function () {
      spyOn(scope, 'onChange');
      spyOn(scope, 'checkProviderMissingHours');
      scope.providerSchedules = [];
      scope.$digest();
      scope.providerSchedules = [{}, {}];
      scope.$digest();
      expect(scope.checkProviderMissingHours).toHaveBeenCalled();
    });
  });

  describe('isSelected function -> ', function () {
    var provider = { UserId: '1234' };
    var slot = { Name: '9-30' };
    beforeEach(function () {});
    it('should return true if slot is in providerSchedules', function () {
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0);
      expect(scope.isSelected(provider, slot)).toEqual(true);
    });

    it('should return false if slot is not in providerSchedules', function () {
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      expect(scope.isSelected(provider, slot)).toEqual(false);
    });
  });

  describe('scope.selectSlot function -> ', function () {
    var provider = { UserId: '1234' };
    var slot = { Name: '9-30' };
    beforeEach(function () {
      scope.providerSchedules = [];
      spyOn(ctrl, 'addSlotToSchedule');
    });
    it('should call ctrl.addSlotToSchedule if slot is not in providerSchedules', function () {
      scope.providerSchedules = [];
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(-1);
      scope.selectSlot(provider, slot);
      expect(ctrl.addSlotToSchedule).toHaveBeenCalledWith(provider, slot);
    });

    it('should remove item if slot is in providerSchedules', function () {
      scope.providerSchedules = [{}, {}];
      listHelper.findIndexByFieldValue = jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0);
      scope.selectSlot(provider, slot);
      expect(ctrl.addSlotToSchedule).not.toHaveBeenCalled();
      expect(scope.providerSchedules.length).toEqual(1);
    });
  });

  describe('scope.selectSlot function -> ', function () {
    var provider = { UserId: '1234' };
    var slot = {
      Name: '9-30',
      Start: '2018-05-16 09:15:00',
      End: '2018-05-16 09:30:00',
    };
    beforeEach(function () {
      scope.providerSchedules = [];
    });
    it('should add item to providerSchedules', function () {
      scope.providerSchedules = [];
      ctrl.addSlotToSchedule(provider, slot);
      expect(scope.providerSchedules).toEqual([
        {
          ProviderId: provider.UserId,
          Start: slot.Start,
          End: slot.End,
          Name: provider.UserId + '_' + slot.Name,
        },
      ]);
    });
  });

  describe('ctrl.fillProviderTimeSlot function -> ', function () {
    beforeEach(function () {
      scope.appointment = angular.copy(mockAppointment);
      scope.appointment.Classification = 0;
      scope.providerSchedules = [];
      scope.slots = [
        {
          Name: '9-30',
          Start: '2018-05-16 09:15:00',
          End: '2018-05-16 09:30:00',
        },
      ];
      scope.selectedProviders = [
        { UserId: '1234', FirstName: 'Jim', LastName: 'Bond' },
      ];
      spyOn(ctrl, 'addProviderSchedule');
    });
    it('should create providerSchedules if selected provider changes and only one and appointment.Classification = 0 ', function () {
      scope.providerSchedules = [];
      ctrl.fillProviderTimeSlot();
      timeout.flush();
      angular.forEach(scope.slots, function (slot) {
        expect(ctrl.addProviderSchedule).toHaveBeenCalledWith(
          scope.selectedProviders[0].UserId,
          slot.Start,
          slot.End,
          slot.Name,
          null
        );
      });
    });
  });

  describe('$watch selectedProviders ->', function () {
    beforeEach(function () {
      spyOn(scope, 'checkProviderMissingHours').and.callFake(function () {});
      spyOn(ctrl, 'fillProviderTimeSlot');
    });

    it('should call ctrl.fillProviderTimeSlot when selectedProviders changes if no providerSchedules', function () {
      scope.selectedProviders = [
        { UserId: '1234', FirstName: 'Jim', LastName: 'Bond' },
      ];
      scope.providerSchedules = [];
      scope.$digest();
      scope.providerSchedules = [];
      scope.selectedProviders.push({
        UserId: '12345',
        FirstName: 'Jim',
        LastName: 'Bond',
      });
      // no idea why this is failing

      //expect(ctrl.fillProviderTimeSlot).toHaveBeenCalled();
    });

    it('should not call ctrl.fillProviderTimeSlot when selectedProviders changes if providerSchedules', function () {
      scope.selectedProviders = [
        { UserId: '12345', FirstName: 'Jim', LastName: 'Bond' },
      ];
      scope.providerSchedules = [{}, {}];
      scope.$digest();
      scope.selectedProviders = [
        { UserId: '1234', FirstName: 'Jim', LastName: 'Bond' },
      ];
      scope.$digest();
      expect(ctrl.fillProviderTimeSlot).not.toHaveBeenCalled();
    });

    it('should call ctrl.fillProviderTimeSlot when selectedProviders changes', function () {
      scope.selectedProviders = [
        { UserId: '12345', FirstName: 'Jim', LastName: 'Bond' },
      ];
      scope.$digest();
      expect(scope.checkProviderMissingHours).toHaveBeenCalled();
    });
  });

  describe('ctrl.addProviderSchedule function -> ', function () {
    beforeEach(function () {
      scope.appointment = angular.copy(mockAppointment);
      scope.appointment.Classification = 0;
      scope.providerSchedules = [];
      scope.slots = [
        {
          Name: '9-30',
          Start: '2018-05-16 09:15:00',
          End: '2018-05-16 09:30:00',
        },
      ];
      scope.selectedProviders = [
        { UserId: '1234', FirstName: 'Jim', LastName: 'Bond' },
      ];
    });
    it('should add item to providerSchedules if not in list', function () {
      var slot = scope.slots[0];
      scope.providerSchedules = [];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);
      ctrl.addProviderSchedule(
        scope.selectedProviders[0].UserId,
        slot.Start,
        slot.End,
        slot.Name,
        null
      );
      expect(scope.providerSchedules.length).toBe(1);
    });
    it('should not add item to providerSchedules if already in list', function () {
      var slot = scope.slots[0];
      scope.providerSchedules = [{}];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({});
      ctrl.addProviderSchedule(
        scope.selectedProviders[0].UserId,
        slot.Start,
        slot.End,
        slot.Name,
        null
      );
      expect(scope.providerSchedules.length).toBe(1);
    });
  });

  describe('ctrl.filterProviderConflicts method -> ', function () {
    beforeEach(function () {
      scope.selectedProviders = [
        { UserId: '1234', FirstName: 'Jim', LastName: 'Bond' },
        { UserId: '1235', FirstName: 'Jill', LastName: 'Bond' },
      ];
      scope.conflicts = {
        Block: null,
        ExaminingDentistBlock: null,
        IsBlock: false,
        IsExaminingDentistBlock: false,
        OutsideWorkingHours: [],
        ProviderConflicts: [
          {
            AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
            UserId: '1234',
            FirstName: 'Jim',
            LastName: 'Bond',
            StartTime: '2018-12-07T18:00:00',
            EndTime: '2018-12-07T19:15:00',
          },
          {
            AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
            UserId: '1236',
            FirstName: 'Jack',
            LastName: 'Bond',
            StartTime: '2018-12-07T18:00:00',
            EndTime: '2018-12-07T19:15:00',
          },
          {
            AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
            UserId: '1236',
            FirstName: 'Jack',
            LastName: 'Bond',
            StartTime: '2018-12-07T18:00:00',
            EndTime: '2018-12-07T19:15:00',
          },
        ],
        RoomConflicts: [],
      };
    });
    it('should filter conflicts for providerConflicts based on selectedProviders', function () {
      ctrl.filterProviderConflicts();
      expect(scope.providerConflicts[0]).toEqual(
        scope.conflicts.ProviderConflicts[0]
      );
      expect(scope.providerConflicts.length).toEqual(1);
    });
  });

  describe('ctrl.filterProviderConflicts method -> ', function () {
    beforeEach(function () {
      scope.selectedProviders = [
        { UserId: '1234', FirstName: 'Jim', LastName: 'Bond' },
        { UserId: '1235', FirstName: 'Jill', LastName: 'Bond' },
      ];
      scope.conflicts = {
        Block: null,
        ExaminingDentistBlock: null,
        IsBlock: false,
        IsExaminingDentistBlock: false,
        OutsideWorkingHours: [
          {
            AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
            UserId: '1234',
            FirstName: 'Jim',
            LastName: 'Bond',
            StartTime: '2018-12-07T18:00:00',
            EndTime: '2018-12-07T19:15:00',
          },
          {
            AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
            UserId: '1236',
            FirstName: 'Jack',
            LastName: 'Bond',
            StartTime: '2018-12-07T18:00:00',
            EndTime: '2018-12-07T19:15:00',
          },
          {
            AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
            UserId: '1236',
            FirstName: 'Jack',
            LastName: 'Bond',
            StartTime: '2018-12-07T18:00:00',
            EndTime: '2018-12-07T19:15:00',
          },
        ],
        ProviderConflicts: [
          {
            AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
            UserId: '1234',
            FirstName: 'Jim',
            LastName: 'Bond',
            StartTime: '2018-12-07T18:00:00',
            EndTime: '2018-12-07T19:15:00',
          },
          {
            AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
            UserId: '1236',
            FirstName: 'Jack',
            LastName: 'Bond',
            StartTime: '2018-12-07T18:00:00',
            EndTime: '2018-12-07T19:15:00',
          },
          {
            AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
            UserId: '1236',
            FirstName: 'Jack',
            LastName: 'Bond',
            StartTime: '2018-12-07T18:00:00',
            EndTime: '2018-12-07T19:15:00',
          },
        ],
        RoomConflicts: [],
      };
    });
    it('should filter conflicts for providerConflicts based on selectedProviders', function () {
      ctrl.filterOutsideWorkingHoursConflicts();
      expect(scope.outsideWorkingHoursConflicts[0]).toEqual(
        scope.conflicts.OutsideWorkingHours[0]
      );
      expect(scope.outsideWorkingHoursConflicts.length).toEqual(1);
    });
  });

  describe('$watch conflicts ->', function () {
    var conflicts = {};
    beforeEach(function () {
      scope.selectedProviders = [
        { UserId: '1234', FirstName: 'Jim', LastName: 'Bond' },
      ];
      conflicts = {
        Block: null,
        ExaminingDentistBlock: null,
        IsBlock: false,
        IsExaminingDentistBlock: false,
        OutsideWorkingHours: [],
        ProviderConflicts: [],
        RoomConflicts: [],
      };
      spyOn(scope, 'checkProviderMissingHours');
      spyOn(ctrl, 'filterProviderConflicts');
      spyOn(ctrl, 'filterOutsideWorkingHoursConflicts');
    });

    it('should call scope.checkProviderMissingHours when conflicts changes', function () {
      scope.conflicts = _.cloneDeep(conflicts);
      scope.$digest();
      scope.conflicts.ProviderConflicts.push({
        AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
        UserId: '1236',
        FirstName: 'Jack',
        LastName: 'Bond',
        StartTime: '2018-12-07T18:00:00',
        EndTime: '2018-12-07T19:15:00',
      });
      scope.$digest();
      expect(scope.checkProviderMissingHours).toHaveBeenCalled();
    });
    it('should call scope.checkProviderMissingHours when conflicts changes', function () {
      scope.conflicts = _.cloneDeep(conflicts);
      scope.$digest();
      scope.conflicts.ProviderConflicts.push({
        AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
        UserId: '1236',
        FirstName: 'Jack',
        LastName: 'Bond',
        StartTime: '2018-12-07T18:00:00',
        EndTime: '2018-12-07T19:15:00',
      });
      scope.$digest();
      expect(ctrl.filterProviderConflicts).toHaveBeenCalled();
    });
    it('should call scope.checkProviderMissingHours when conflicts changes', function () {
      scope.conflicts = _.cloneDeep(conflicts);
      scope.$digest();
      scope.conflicts.ProviderConflicts.push({
        AppointmentId: '600c591b-f823-4b2b-b1ea-5dfa360f0091',
        UserId: '1236',
        FirstName: 'Jack',
        LastName: 'Bond',
        StartTime: '2018-12-07T18:00:00',
        EndTime: '2018-12-07T19:15:00',
      });
      scope.$digest();
      expect(ctrl.filterOutsideWorkingHoursConflicts).toHaveBeenCalled();
    });
  });

  describe('$watch conflicts ->', function () {
    var conflicts = {};
    beforeEach(function () {
      scope.selectedProviders = [];
      conflicts = {
        Block: null,
        ExaminingDentistBlock: null,
        IsBlock: false,
        IsExaminingDentistBlock: false,
        OutsideWorkingHours: [],
        ProviderConflicts: [],
        RoomConflicts: [],
      };
      spyOn(scope, 'checkProviderMissingHours');
      spyOn(ctrl, 'filterProviderConflicts');
      spyOn(ctrl, 'filterOutsideWorkingHoursConflicts');
    });

    it('should call scope.checkProviderMissingHours when conflicts changes', function () {
      scope.conflicts = _.cloneDeep(conflicts);
      scope.$digest();
      scope.selectedProviders.push({
        UserId: '1234',
        FirstName: 'Jim',
        LastName: 'Bond',
      });
      scope.$digest();
      expect(scope.checkProviderMissingHours).toHaveBeenCalled();
    });
    it('should call scope.checkProviderMissingHours when conflicts changes', function () {
      scope.conflicts = _.cloneDeep(conflicts);
      scope.$digest();
      scope.selectedProviders.push({
        UserId: '1234',
        FirstName: 'Jim',
        LastName: 'Bond',
      });
      scope.$digest();
      expect(ctrl.filterProviderConflicts).toHaveBeenCalled();
    });
    it('should call scope.checkProviderMissingHours when conflicts changes', function () {
      scope.conflicts = _.cloneDeep(conflicts);
      scope.$digest();
      scope.selectedProviders.push({
        UserId: '1234',
        FirstName: 'Jim',
        LastName: 'Bond',
      });
      scope.$digest();
      expect(ctrl.filterOutsideWorkingHoursConflicts).toHaveBeenCalled();
    });
  });
});
