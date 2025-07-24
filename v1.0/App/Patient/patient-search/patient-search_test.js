describe('patient-search -> ', function () {
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(module('Soar.Patient'));

  var scope, ctrl, localize, location, toastrFactory;
  var usersFactory, userFactoryDeferred, $httpBackend;
  //#region mocks

  var mockProviders = [
    { FirstName: 'Bob', LastName: 'Bob', UserName: 'Bobb' },
    { FirstName: 'Sue', LastName: 'Bob', UserName: 'Bobby' },
    { FirstName: 'Billy', LastName: 'Bob', UserName: 'BobbySue' },
  ];
  var mockSearchResult = [
    {
      PatientId: '20000000-0000-0000-0000-000000000001',
      FirstName: 'Robert',
      LastName: 'Jackson',
      PreferredName: 'Bob',
      DateOfBirth: Date,
      IsActive: true,
      IsPatient: true,
      PhoneNumber: '1112223333',
    },
    {
      PatientId: '20000000-0000-0000-0000-00000000003',
      FirstName: 'Patricia',
      LastName: 'Jackson',
      PreferredName: 'Pat',
      DateOfBirth: Date,
      IsActive: true,
      IsPatient: true,
      PhoneNumber: '3334445555',
    },
    {
      PatientId: '20000000-0000-0000-0000-00000000002',
      FirstName: 'Sidney',
      LastName: 'Jackson',
      PreferredName: 'Sid',
      DateOfBirth: Date,
      IsActive: true,
      IsPatient: false,
      PhoneNumber: '2223334444',
    },
  ];
  var mockServiceReturnWrapperNoPatients = {
    Value: null,
    Count: 0,
  };
  var mockServiceReturnWrapper = {
    Value: mockSearchResult,
    Count: 3,
  };

  //#region service mocks

  var _patientServices_;
  beforeEach(
    module('Soar.Patient', function ($provide) {
      _patientServices_ = {
        Patients: {
          search: jasmine.createSpy().and.returnValue(mockServiceReturnWrapper),
        },
      };
      $provide.value('PatientServices', _patientServices_);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
      $provide.value('PatientValidationFactory', {});
      $provide.value('PersonFactory', {});
    })
  );

  // inject the search service to controller
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $route,
    $routeParams,
    _$location_,
    $q,
    $templateCache
  ) {
    scope = $rootScope.$new();

    usersFactory = {
      Users: jasmine.createSpy('usersFactory.Users').and.callFake(function () {
        userFactoryDeferred = $q.defer();
        userFactoryDeferred.resolve(1);
        return {
          result: userFactoryDeferred.promise,
          then: function () {},
        };
      }),
      UserName: jasmine.createSpy().and.returnValue(mockProviders[0].UserName),
    };

    ctrl = $controller('PatientSearchController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
      UsersFactory: usersFactory,
      $routeParams: { searchString: 'Bob' },
    });
    $httpBackend = $injector.get('$httpBackend');
    //$scope.searchResults = mockServiceReturnWrapper.Value;
    localize = $injector.get('localize');
    ctrl.sortOrders = {
      LastName: ['LastName', 'FirstName'],
      '-LastName': ['-LastName', '-FirstName'],
      FirstName: ['FirstName', 'LastName'],
      '-FirstName': ['-FirstName', '-LastName'],
    };
  }));

  describe('initializeSearch function -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set initial properties', function () {
      scope.initializeSearch();
      expect(scope.searchString).toEqual('Bob');
      expect(ctrl.initialized).toBe(true);
      expect(scope.hasAuthenticated).toBe(false);
      expect(scope.takeAmount).toEqual(45);
      expect(scope.limit).toEqual(15);
      expect(scope.limitResults).toBe(true);
      expect(scope.searchTerm).toEqual('');
      expect(scope.resultCount).toEqual(0);
      expect(scope.searchIsQueryingServer).toBe(false);
      expect(scope.noSearchResults).toBe(false);
      expect(scope.includeInactivePatients).toBe(false);
      expect(scope.sortCol).toEqual('LastName');
    });
  });

  describe('sortCol $watch -> ', function () {
    it('should set sort based on watch', function () {
      //scope.sortCol = 'LastName';
      //scope.$apply();
      //scope.sortCol = 'FirstName';
      //scope.$apply();
      //expect(scope.sort).toEqual('')
    });
  });

  describe('search function -> ', function () {
    // test the patientServices has been injected
    it('should have injected patientServices ', function () {
      expect(_patientServices_).not.toBeNull();
    });

    it('_patientServices_.Patients.search should be called on search', function () {
      scope.searchString = 'Bob';
      scope.search();
      expect(_patientServices_.Patients.search).toHaveBeenCalled();
    });
  });

  describe('searchGetOnSuccess function -> ', function () {
    it('searchGetOnSuccess should set searchResults', function () {
      spyOn(scope, 'getProviders').and.callFake(function () {
        return mockProviders;
      });
      scope.searchGetOnSuccess(mockServiceReturnWrapper);
      expect(scope.searchResults[0]).toBe(mockServiceReturnWrapper.Value[0]);
      expect(scope.searchResults[1]).toBe(mockServiceReturnWrapper.Value[1]);
      expect(scope.searchResults[2]).toBe(mockServiceReturnWrapper.Value[2]);
    });

    it('should set resultCount', function () {
      spyOn(scope, 'getProviders').and.callFake(function () {
        return mockProviders;
      });
      expect(scope.resultCount).toBe(0);
      scope.searchGetOnSuccess(mockServiceReturnWrapper);
      expect(scope.resultCount).toBe(3);
    });

    it('should set noSearchResults to false if resultCount', function () {
      spyOn(scope, 'getProviders').and.callFake(function () {
        return mockProviders;
      });
      scope.searchGetOnSuccess(mockServiceReturnWrapper);
      expect(scope.noSearchResults).toBe(false);
    });

    it('should set noSearchResults to true if resultCount equals 0', function () {
      spyOn(scope, 'getProviders').and.callFake(function () {
        return mockProviders;
      });
      scope.searchGetOnSuccess(mockServiceReturnWrapperNoPatients);
      expect(scope.noSearchResults).toBe(true);
    });

    it('should set searchIsQueryingServer to false', function () {
      spyOn(scope, 'getProviders').and.callFake(function () {
        return mockProviders;
      });
      scope.searchGetOnSuccess(mockServiceReturnWrapperNoPatients);
      expect(scope.searchIsQueryingServer).toBe(false);
    });
  });

  describe('searchGetOnError function -> ', function () {
    it('should set searchIsQueryingServer to false', function () {
      scope.searchGetOnError();
      expect(scope.searchIsQueryingServer).toBe(false);
    });

    it('should set resultCount to 0', function () {
      scope.searchGetOnError();
      expect(scope.resultCount).toBe(0);
    });

    it('should set searchResults to empty object', function () {
      scope.searchGetOnError();
      expect(scope.searchResults).toEqual([]);
    });

    it('should set noSearchResults to true', function () {
      scope.searchGetOnError();
      expect(toastrFactory.error).toHaveBeenCalled();
      expect(scope.noSearchResults).toBe(true);
    });
  });

  describe('getProviders function -> ', function () {
    it('should call get users api', function () {
      scope.getProviders();
      expect(scope.loadingProviders).toBe(true);
      expect(usersFactory.Users).toHaveBeenCalled();
    });
  });
});
