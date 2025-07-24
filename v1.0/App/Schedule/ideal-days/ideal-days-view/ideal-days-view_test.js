describe('IdealDaysViewController ->', function () {
  var ctrl;
  var scope, timeout, toastrFactory, localize, location, staticData;
  var listHelper,
    idealDayTemplatesFactory,
    modalFactory,
    modalInstance,
    colorUtilities;

  var mockIdealDaysTemplate = {
    Name: 'Template1',
    TemplateId: 1,
    Details: [
      {
        StartTime: '2017-12-08 08:00:00.0000000',
        EndTime: '2017-12-08 10:00:00.0000000',
        AppointmentTypeId: '21',
      },
      {
        StartTime: '2017-12-08 10:00:00.0000000',
        EndTime: '2017-12-08 12:00:00.0000000',
        AppointmentTypeId: '482',
      },
    ],
  };

  //#region mocks
  var mockPracticeSettings = {
    Value: {
      SettingsName: 'SOAR',
      DefaultTimeIncrement: 10,
      IsProvisioned: true,
      IsEStatementEnabled: false,
    },
  };

  var mockAppointmentTypes = {
    Value: [
      {
        AppointmentTypeId: '21',
        Name: 'Consultation',
        AppointmentTypeColor: '#FFa980',
        FontColor: '#000000',
        PerformedByProviderTypeId: 1,
        DefaultDuration: 30,
      },
      {
        AppointmentTypeId: '482',
        Name: 'Crown Bridge Delivery',
        AppointmentTypeColor: '#FFFFBB',
        FontColor: '#000000',
        PerformedByProviderTypeId: 1,
        DefaultDuration: 40,
      },
      {
        AppointmentTypeId: '0e8a',
        Name: 'Crown Bridge Prep',
        AppointmentTypeColor: '#FFFF00',
        FontColor: '#000000',
        PerformedByProviderTypeId: 2,
        DefaultDuration: 90,
      },
      {
        AppointmentTypeId: '5d98',
        Name: 'Emergency',
        AppointmentTypeColor: '#FF2F2F',
        FontColor: '#000000',
        PerformedByProviderTypeId: 1,
        DefaultDuration: 45,
      },
    ],
  };

  //#endregion

  //#region before each

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy().and.callFake(function (val) {
          return val;
        }),
      };
      $provide.value('localize', localize);

      idealDayTemplatesFactory = {
        access: jasmine.createSpy().and.returnValue({
          View: true,
          Create: true,
        }),
      };
      $provide.value('IdealDayTemplatesFactory', idealDayTemplatesFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $timeout) {
    scope = $rootScope.$new();
    timeout = $timeout;
    listHelper = $injector.get('ListHelper');

    //mock for location
    location = {
      url: jasmine.createSpy('$location.url'),
    };

    ctrl = $controller('IdealDaysViewController', {
      $scope: scope,
      ModalFactory: modalFactory,
      ListHelper: listHelper,
      $timeout: timeout,
      toastrFactory: toastrFactory,
      $uibModalInstance: modalInstance,
      localize: localize,
      StaticData: staticData,
      $location: location,
      ColorUtilities: colorUtilities,
      practiceSettings: mockPracticeSettings.Value,
      appointmentTypes: mockAppointmentTypes.Value,
      idealDaysTemplate: mockIdealDaysTemplate,
    });
    scope.authAccess.View = true;
  }));

  //#endregion
  describe('init function -> ', function () {
    it('should set initial properties', function () {
      ctrl.init();
      expect(scope.idealDaysOccurrences).toEqual(
        new kendo.data.ObservableArray([])
      );
      expect(scope.idealDaysTemplateDto).toEqual(mockIdealDaysTemplate);
      expect(scope.defaultTimeIncrement).toEqual(
        mockPracticeSettings.Value.DefaultTimeIncrement
      );
      expect(scope.ticksPerHour).toEqual(
        60 / mockPracticeSettings.Value.DefaultTimeIncrement
      );
      expect(scope.appointmentTypes).toEqual(mockAppointmentTypes.Value);
    });

    it('should call ctrl.setEndTime ', function () {
      spyOn(ctrl, 'setEndTime');
      ctrl.init();
      expect(ctrl.setEndTime).toHaveBeenCalled();
    });

    it('should call ctrl.createScheduleOptions ', function () {
      spyOn(ctrl, 'createScheduleOptions');
      ctrl.init();
      expect(ctrl.createScheduleOptions).toHaveBeenCalled();
    });

    it('should call ctrl.setupOccurrences ', function () {
      spyOn(ctrl, 'setupOccurrences');
      ctrl.init();
      expect(ctrl.setupOccurrences).toHaveBeenCalled();
    });
  });

  describe('ctrl.setEndTime function -> ', function () {
    it('should set ctrl.endTimeString to 30 minutes after last occurrence for day with date based on 2015-01-01', function () {
      spyOn(ctrl, 'setEndTime');
      ctrl.setEndTime();
      expect(ctrl.endTimeString).toEqual('01/01/2015 12:30');
    });
  });

  describe('setupOccurrences function -> ', function () {
    beforeEach(function () {
      scope.viewIdealDaysScheduler = {
        setDataSource: function () {},
        refresh: function () {},
        view: function () {
          return {
            content: {
              find: function () {
                return [];
              },
            },
          };
        },
      };
    });

    it('should add event to idealDaysOccurrences for each detail in idealDaysTemplateDto with dates based on scheduler date(2015-01-01) plus occurrence time', function () {
      scope.idealDaysTemplateDto = angular.copy(mockIdealDaysTemplate);
      ctrl.setupOccurrences();
      timeout.flush(200);
      expect(scope.idealDaysOccurrences[0].start).toEqual(
        new Date('2015-01-01 08:00:00.0000000')
      );
      expect(scope.idealDaysOccurrences[0].end).toEqual(
        new Date('2015-01-01 10:00:00.0000000')
      );
      expect(scope.idealDaysOccurrences[1].start).toEqual(
        new Date('2015-01-01 10:00:00.0000000')
      );
      expect(scope.idealDaysOccurrences[1].end).toEqual(
        new Date('2015-01-01 12:00:00.0000000')
      );
      expect(scope.idealDaysOccurrences[0].AppointmentTypeId).toEqual(
        scope.idealDaysTemplateDto.Details[0].AppointmentTypeId
      );
      expect(scope.idealDaysOccurrences[1].AppointmentTypeId).toEqual(
        scope.idealDaysTemplateDto.Details[1].AppointmentTypeId
      );
    });
  });

  describe('getAppointmentType function -> ', function () {
    it('should return AppointmentType based on AppointmentTypeId', function () {
      var apptTypeId = mockAppointmentTypes.Value[1].AppointmentTypeId;
      expect(ctrl.getAppointmentType(apptTypeId)).toEqual(
        mockAppointmentTypes.Value[1]
      );
    });
  });
});
