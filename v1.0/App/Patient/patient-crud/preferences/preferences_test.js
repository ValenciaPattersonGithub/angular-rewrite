describe('PreferencesController ->', function () {
  var timeout, scope, ctrl, localize;
  var personServices,
    saveStates,
    usersFactory,
    referenceDataService,
    userFactoryDeferred,
    toastrFactory,
    rolesFactory,
    timezoneFactory,
    locationService;

  var $q;

  // mock all locations in practice
  var allLocationsMock = [
    { LocationId: 1 },
    { LocationId: 2 },
    { LocationId: 11 },
    { LocationId: 12 },
  ];
  // mock locations the user has access to
  var userLocationsMock = [{ id: 1 }, { id: 2 }];
  //#region mocks
  var providersMockResponse = {
    Value: [
      {
        UserId: 10,
        FirstName: 'Bill',
        LastName: 'Murray',
      },
      {
        UserId: 11,
        FirstName: 'Dan',
        LastName: 'Belushi',
      },
    ],
  };

  var providersMock = providersMockResponse.Value;

  var mockDentists = {
    Value: [
      {
        UserId: 10,
        FirstName: 'Bill',
        LastName: 'Murray',
      },
      {
        UserId: 11,
        FirstName: 'Dan',
        LastName: 'Belushi',
      },
    ],
  };

  var mockHygienists = {
    Value: [
      {
        UserId: 10,
        FirstName: 'Bill',
        LastName: 'Murray',
      },
      {
        UserId: 11,
        FirstName: 'Dan',
        LastName: 'Belushi',
      },
    ],
  };

  var locationsMock = [{ LocationId: 1 }, { LocationId: 2 }];

  saveStates = {
    Add: 'Add',
    Update: 'Update',
    Delete: 'Delete',
    None: 'None',
  };

  var mockNewPerson = {
    Profile: {
      PatientId: null,
      FirstName: '',
      MiddleName: '',
      LastName: '',
      PreferredName: '',
      Prefix: '',
      Suffix: '',
      AddressLine1: '',
      AddressLine2: '',
      City: '',
      State: '',
      ZipCode: '',
      Sex: '',
      DateOfBirth: null,
      IsPatient: true,
      PatientCode: null,
      EmailAddress: '',
      EmailAddress2: '',
      EmailAddressRemindersOk: false,
      EmailAddress2RemindersOk: false,
      PersonAccount: null,
      ResponsiblePersonType: null,
      ResponsiblePersonId: null,
      PreferredLocation: null,
      PreferredDentist: null,
      PreferredHygienist: null,
      IsValid: false,
    },
    Phones: [],
    PreviousDentalOffice: null,
    Referral: null,
    Flags: [],
  };

  //#endregion

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          locations: 'locations',
          users: 'users',
        },
      };
      $provide.value('referenceDataService', referenceDataService);

      locationService = {
        getCurrentPracticeLocations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(userLocationsMock),
        }),
      };
      $provide.value('locationService', locationService);
    })
  );

  describe('when user is authorized -> ', function () {
    var staticData = {};

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    // Create spies for services
    beforeEach(
      module('Soar.Patient', function ($provide) {
        personServices = {
          Persons: {
            save: jasmine.createSpy(),
          },
        };
        $provide.value('PersonServices', personServices);
      })
    );

    beforeEach(
      module('Soar.Common', function ($provide) {
        localize = {
          getLocalizedString: jasmine.createSpy(),
        };
        $provide.value('localize', localize);

        timezoneFactory = {
          GetTimeZoneAbbr: jasmine.createSpy().and.returnValue(''),
        };
        $provide.value('TimeZoneFactory', timezoneFactory);
      })
    );

    // Create controller and scope
    beforeEach(inject(function (
      $rootScope,
      $controller,
      $injector,
      $route,
      $routeParams,
      $compile,
      $timeout,
      $location,
      _$q_
    ) {
      timeout = $timeout;
      $q = _$q_;

      scope = $rootScope.$new();

      referenceDataService.getData.and.callFake(function () {
        return $q.resolve([{}]);
      });

      usersFactory = {
        Users: jasmine
          .createSpy('usersFactory.Users')
          .and.callFake(function () {
            userFactoryDeferred = $q.defer();
            userFactoryDeferred.resolve(providersMockResponse);
            return {
              result: userFactoryDeferred.promise,
              then: function () {},
            };
          }),
        Dentists: jasmine
          .createSpy('usersFactory.Users')
          .and.callFake(function () {
            userFactoryDeferred = $q.defer();
            userFactoryDeferred.resolve(mockDentists);
            return {
              result: userFactoryDeferred.promise,
              then: function () {},
            };
          }),
        Hygienists: jasmine
          .createSpy('usersFactory.Users')
          .and.callFake(function () {
            userFactoryDeferred = $q.defer();
            userFactoryDeferred.resolve(mockHygienists);
            return {
              result: userFactoryDeferred.promise,
              then: function () {},
            };
          }),
        UserName: jasmine
          .createSpy()
          .and.returnValue(providersMock[0].UserName),
      };

      rolesFactory = {};

      ctrl = $controller('PreferencesController', {
        $scope: scope,
        StaticData: staticData,
        SaveStates: saveStates,
        location: $location,
        localize: localize,
        timeout: $timeout,
        PersonServices: personServices,
        toastrFactory: toastrFactory,
        UsersFactory: usersFactory,
        RolesFactory: rolesFactory,
      });
    }));

    it('should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });

    describe('initializeController function -> ', function () {
      it('should call getProviders', function () {
        spyOn(ctrl, 'getProviders');
        ctrl.initializeController();
        scope.$apply();
        expect(ctrl.getProviders).toHaveBeenCalled();
      });

      it('should call getLocations', function () {
        spyOn(ctrl, 'getLocations');
        ctrl.initializeController();
        scope.$apply();
        expect(ctrl.getLocations).toHaveBeenCalled();
      });

      it('should set loading to false', function () {
        ctrl.initializeController();
        scope.$apply();
        expect(scope.loading).toBe(false);
      });
    });

    describe('clearPreferredProviders function ->', function () {
      it('should clear preferred provider values', function () {
        scope.person = {
          Profile: {
            PreferredDentist: 'dentist',
            PreferredHygienist: 'hygienist',
          },
        };

        ctrl.clearPreferredProviders();

        expect(scope.person.Profile.PreferredDentist).toBeNull();
        expect(scope.person.Profile.PreferredHygienist).toBeNull();
      });
    });

    describe('setDefaultIfOnlyOneExists -> ', function () {
      it('should scope.person.Profile.PreferredDentist if list has only one item', function () {
        scope.person = angular.copy(mockNewPerson);
        scope.dentists = angular.copy(mockDentists.Value);
        ctrl.setDefaultIfOnlyOneExists(
          scope.dentists,
          'UserId',
          'PreferredDentist'
        );
        scope.$apply();
        expect(scope.person.Profile.PreferredDentist).toBe(null);
        scope.dentists = angular.copy(mockDentists.Value);
        scope.dentists = scope.dentists.slice(1);
        ctrl.setDefaultIfOnlyOneExists(
          scope.dentists,
          'UserId',
          'PreferredDentist'
        );
        scope.$apply();
        timeout.flush();
        expect(scope.person.Profile.PreferredDentist).toBe(11);
      });

      it('should scope.person.Profile.PreferredHygienist if list has only one item', function () {
        scope.person = angular.copy(mockNewPerson);
        scope.hygienists = angular.copy(mockHygienists.Value);
        ctrl.setDefaultIfOnlyOneExists(
          scope.hygienists,
          'UserId',
          'PreferredHygienist'
        );
        scope.$apply();
        expect(scope.person.Profile.PreferredHygienist).toBe(null);
        scope.hygienists = angular.copy(mockHygienists.Value);
        scope.hygienists = scope.hygienists.slice(0, 1);
        ctrl.setDefaultIfOnlyOneExists(
          scope.hygienists,
          'UserId',
          'PreferredHygienist'
        );
        scope.$apply();
        timeout.flush();
        expect(scope.person.Profile.PreferredHygienist).toBe(10);
      });

      it('should scope.person.Profile.PreferredLocation if list has only one item', function () {
        scope.person = angular.copy(mockNewPerson);
        scope.person.PatientLocations = [];
        scope.locations = angular.copy(locationsMock);
        ctrl.setDefaultIfOnlyOneExists(
          scope.locations,
          'LocationId',
          'PreferredLocation'
        );
        scope.$apply();
        expect(scope.person.Profile.PreferredLocation).toBe(null);
        scope.locations = angular.copy(locationsMock);
        scope.locations = scope.locations.slice(0, 1);
        ctrl.setDefaultIfOnlyOneExists(
          scope.locations,
          'LocationId',
          'PreferredLocation'
        );
        scope.$apply();
        timeout.flush();
        expect(scope.person.Profile.PreferredLocation).toBe(1);
      });
    });

    describe('getProviders function -> ', function () {
      beforeEach(function () {
        spyOn(ctrl, 'setDefaultIfOnlyOneExists').and.callFake(function () {
          return '';
        });
      });

      it('should set loadingProviders', function () {
        ctrl.getProviders();
        expect(referenceDataService.getData).toHaveBeenCalled();
      });
    });

    describe('getLocations function -> ', function () {
      var refDataResult;
      beforeEach(function () {
        refDataResult = [];
        ctrl.locationServicesGetOnSuccess = jasmine.createSpy();
        referenceDataService.getData.and.callFake(function () {
          return $q.resolve(refDataResult);
        });
      });

      it('should call referenceDataService.getData', function () {
        ctrl.getLocations();
        expect(referenceDataService.getData).toHaveBeenCalledWith('locations');
      });

      it('should call ctrl.locationServicesGetOnSuccess when locations are not empty', function () {
        refDataResult.push('test');

        ctrl.getLocations();
        scope.$apply();

        expect(ctrl.locationServicesGetOnSuccess).toHaveBeenCalledWith({
          Value: refDataResult,
        });
      });

      it('should not call ctrl.locationServicesGetOnSuccess when locations are empty', function () {
        ctrl.getLocations();

        expect(ctrl.locationServicesGetOnSuccess).not.toHaveBeenCalled();
      });
    });

    describe('locationServicesGetOnSuccess function -> ', function () {
      var allLocations = [];
      var userLocations = [];
      var filteredLocations = [{ LocationId: 4 }, { LocationId: 5 }];
      beforeEach(function () {
        scope.person = {};
        allLocations = _.clone(allLocationsMock);
        userLocations = _.clone(userLocationsMock);
        spyOn(ctrl, 'filterLocationsByUserLocations').and.callFake(function () {
          return filteredLocations;
        });
        scope.alternateOptions = [];
        spyOn(scope, 'updateAlternateOptionsList');
        spyOn(ctrl, 'isLoading');
      });

      it('should call ctrl.filterLocationsByUserLocations', function () {
        ctrl.filterLocations(allLocations, userLocations);
        expect(ctrl.filterLocationsByUserLocations).toHaveBeenCalledWith(
          allLocations,
          userLocations
        );
      });

      it('should call ctrl.groupLocations with filteredLocations', function () {
        spyOn(ctrl, 'groupLocations').and.callFake(function () {
          return [
            {
              LocationId: 4,
              LocationNameWithDate: 'undefined ()',
              LocationStatus: 'Active',
              GroupOrder: 1,
              SortingIndex: 1,
            },
          ];
        });
        ctrl.filterLocations(allLocations, userLocations);
        expect(ctrl.groupLocations).toHaveBeenCalledWith(filteredLocations);
      });

      it('should set scope.locationsDDL to groupedLocations', function () {
        ctrl.filterLocations(allLocations, userLocations);
        expect(scope.locationsDDL.data[0]).toEqual({
          LocationId: 4,
          LocationNameWithDate: 'undefined ()',
          LocationStatus: 'Active',
          GroupOrder: 1,
          SortingIndex: 1,
        });
        expect(scope.locationsDDL.data[1]).toEqual({
          LocationId: 5,
          LocationNameWithDate: 'undefined ()',
          LocationStatus: 'Active',
          GroupOrder: 1,
          SortingIndex: 2,
        });
      });

      it('should call scope.updateAlternateOptionsList', function () {
        ctrl.filterLocations(allLocations, userLocations);
        expect(scope.updateAlternateOptionsList).toHaveBeenCalled();
      });

      it('should call isLoading', function () {
        ctrl.filterLocations(allLocations, userLocations);
        expect(ctrl.isLoading).toHaveBeenCalled();
      });
    });

    describe('locationServicesGetOnSuccess function -> ', function () {
      var allLocations = [];
      var userLocations = [];
      beforeEach(function () {
        scope.person = {};
        allLocations = _.clone(allLocationsMock);
        userLocations = _.clone(userLocationsMock);
        locationService.getCurrentPracticeLocations = jasmine
          .createSpy()
          .and.returnValue({
            then: jasmine.createSpy().and.returnValue(userLocations),
          });
      });

      it('should set loadingLocations', function () {
        ctrl.locationServicesGetOnSuccess(allLocations);
        expect(ctrl.loadingLocations).toBe(false);
      });

      it('should call locationService.getCurrentPracticeLocations', function () {
        ctrl.locationServicesGetOnSuccess({ Value: allLocations });
        expect(locationService.getCurrentPracticeLocations).toHaveBeenCalled();
      });
    });
  });
});
