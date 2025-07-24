describe('ProviderOccurrencesController ->', function () {
  var ctrl, scope, timeout, toastrFactory, localize, patSecurityService;
  var listHelper, modalInstance, filter, scheduleServices, timeZoneFactory;

  //#region mocks
  var providers = [
    { UserId: '1', FullName: 'James Los', LastName: 'Los' },
    { UserId: '2', FullName: 'Jacky Suh', LastName: 'Suh' },
    { UserId: '3', FullName: 'Jone Ja', LastName: 'Ja' },
  ];

  var currentLocation = {
    id: 1,
    Name: 'Rockville',
  };

  var rooms = [
    { RoomId: 1, Name: 'Savena' },
    { RoomId: 2, Name: 'Saroo' },
  ];

  //#endregion

  //#region before each

  beforeEach(
    module('Soar.Schedule', function ($provide) {
      scheduleServices = {
        ProviderRoomSetup: {
          GetAll: jasmine.createSpy().and.returnValue([]),
        },
      };

      $provide.value('ScheduleServices', scheduleServices);

      timeZoneFactory = {
        ConvertDateTZ: jasmine
          .createSpy()
          .and.returnValue({ Timezone: 'Central Standard Time' }),
      };

      $provide.value('TimeZoneFactory', timeZoneFactory);

      patSecurityService = {
        generateMessage: jasmine.createSpy().and.returnValue(''),
        IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
      };

      localize = {
        getLocalizedString: jasmine.createSpy().and.callFake(function (val) {
          return val;
        }),
      };

      $provide.value('localize', localize);

      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('ModalInstance', modalInstance);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $timeout,
    $compile,
    $q
  ) {
    scope = $rootScope.$new();
    timeout = $timeout;
    filter = $injector.get('$filter');
    listHelper = $injector.get('ListHelper');

    ctrl = $controller('ProviderOccurrencesController', {
      $scope: scope,
      $timeout: timeout,
      toastrFactory: toastrFactory,
      localize: localize,
      patSecurityService: patSecurityService,
      filter: filter,
      ListHelper: listHelper,
      $uibModalInstance: modalInstance,
      providers: providers,
      currentLocation: currentLocation,
      rooms: rooms,
      scheduleServices: scheduleServices,
      timeZoneFactory: timeZoneFactory,
    });
  }));

  //#endregion

  describe('init function -> ', function () {
    it('should call getProviderOccurrences ', function () {
      spyOn(ctrl, 'getProviderOccurrences');
      ctrl.init();
      expect(ctrl.getProviderOccurrences).toHaveBeenCalled();
    });
  });

  describe('closeModal function -> ', function () {
    it('should call modalInstance close and dismiss ', function () {
      scope.closeModal();
      expect(modalInstance.close).toHaveBeenCalled();
      expect(modalInstance.dismiss).toHaveBeenCalled();
    });
  });

  describe('viewProviderOccurrencesAccess function -> ', function () {
    it('should call patSecurityService IsAuthorizedByAbbreviation', function () {
      ctrl.viewProviderOccurrencesAccess();
      expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalled();
    });
  });

  describe('getProviderOccurrences function -> ', function () {
    it('should call scheduleServices.ProviderRoomSetup.GetAll', function () {
      ctrl.getProviderOccurrences();
      expect(patSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalled();
      expect(scheduleServices.ProviderRoomSetup.GetAll).toHaveBeenCalled();
    });
  });

  describe('prepareProviderOccurrences function -> ', function () {
    it('should have providerOccurrences ', function () {
      ctrl.providerRoomSetups = [
        {
          LocationId: 1,
          UserId: 1,
          RoomId: 1,
          StartTime: '2018-02-19 13:00:00',
          EndTime: '2018-02-22 14:00:00',
          RecurrenceSetup: {
            StartDate: '2018-02-19',
            EndDate: '2018-02-22',
          },
        },
      ];

      ctrl.providerRoomOccurences = [
        {
          LocationId: 1,
          UserId: 1,
          RoomId: 1,
          StartTime: '2018-02-23 12:00:00',
          EndTime: '2018-02-23 13:00:00',
        },
      ];
      ctrl.prepareProviderOccurrences();
      expect(scope.providerOccurrences.length).toEqual(2);
      expect(localize.getLocalizedString).toHaveBeenCalledWith('None');
    });
  });

  describe('providerChanged function -> ', function () {
    it('should set selectedProviderId with newValue', function () {
      scope.providerChanged(1);
      expect(scope.selectedProviderId).toEqual(1);
    });
  });
});
