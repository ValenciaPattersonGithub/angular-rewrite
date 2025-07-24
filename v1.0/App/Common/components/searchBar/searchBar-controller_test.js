//// top level test suite
describe('SearchBarController tests when auth ->', function () {
  var scope, ctrl, rootScope, location, toastrFactory, timeout;
  var globalSearchFactory,
    globalSearchFactoryDeferred,
    q,
    patientValidationFactory,
    locationsFactory;

  //'var practiceIdPrefix = "10000000-0000-0000-0000-00000000000";
  var mockPatientResult = [
    {
      PatientId: '20000000-0000-0000-0000-000000000001',
      FirstName: 'Robert',
      LastName: 'Jackson',
      PreferredName: 'Bob',
      DateOfBirth: Date,
      IsActive: true,
      IsPatient: true,
      PhoneNumber: '1112223333',
      DisplayStatementAccountId: '1-2179',
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
      DisplayStatementAccountId: '1-2179',
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
      DisplayStatementAccountId: '1-2179',
    },
  ];

  var mockServiceReturnWrapper = {
    Value: mockPatientResult,
    Count: 3,
  };

  //#region service mocks

  // mock the injected factory
  beforeEach(
    module('Soar.Common', function ($provide) {
      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      patientValidationFactory = {
        ObservePatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        GetPatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        CheckPatientLocation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        PatientSearchValidation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      var userServices = {
        users: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('UserServices', userServices);

      locationsFactory = {
        UserLocations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('LocationsFactory', locationsFactory);

      var locationsService = {
        locations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('NewLocationsService', locationsService);
    })
  );

  beforeEach(module('common.factories'));

  // provide the PatientServices.Patients and have it return the mockPatientResult when called
  var _patientServices_;
  beforeEach(
    module('Soar.Patient', function ($provide) {
      _patientServices_ = {
        Patients: {
          search: jasmine.createSpy().and.returnValue(mockServiceReturnWrapper),
          overview: jasmine.createSpy().and.returnValue({
            then: jasmine.createSpy(),
          }),
        },
      };
      $provide.value('PatientServices', _patientServices_);

      //mock for location
      location = {
        path: jasmine.createSpy(),
      };
      $provide.value('$location', location);
      $provide.value('PersonFactory', {});
    })
  );

  //#endregion

  // inject the search service to controller
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    _$location_,
    $q,
    $timeout
  ) {
    rootScope = $rootScope;
    scope = $rootScope.$new();

    q = $q;
    globalSearchFactory = {
      MostRecentPersons: jasmine
        .createSpy('globalSearchFactory.MostRecentPersons')
        .and.callFake(function () {
          globalSearchFactoryDeferred = q.defer();
          globalSearchFactoryDeferred.resolve(1);
          return {
            result: globalSearchFactoryDeferred.promise,
            then: function () {},
          };
        }),
      SaveMostRecentPerson: jasmine
        .createSpy('globalSearchFactory.SaveMostRecentPerson')
        .and.callFake(function () {
          globalSearchFactoryDeferred = q.defer();
          globalSearchFactoryDeferred.resolve(1);
          return {
            result: globalSearchFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    ctrl = $controller('SearchBarController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
      GlobalSearchFactory: globalSearchFactory,
    });
    scope.fullPatientList = mockServiceReturnWrapper.Value;
    $rootScope.$apply();
    timeout = $timeout;
  }));

  describe('when user is authorized - >', function () {
    // test controller exists
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    // test the patientServices has been injected
    it('should have injected _patientServices_.Patients ', function () {
      expect(_patientServices_.Patients).not.toBeNull();
    });

    describe('authorization function ->', function () {
      it('authPatientSearchAccess should be true ', function () {
        expect(scope.authPatientSearchAccess()).toEqual(true);
      });
    });

    describe('initializeSearch function ->', function () {
      it('should set default values ', function () {
        scope.initializeSearch();
        expect(scope.takeAmount).toBe(45);
        expect(scope.limit).toBe(15);
        expect(scope.limitResults).toBe(true);
        expect(scope.searchTerm).toBe('');
        expect(scope.searchString).toBe('');
        expect(scope.resultCount).toBe(0);
        expect(scope.searchResults).toEqual([]);
        expect(scope.searchTimeout).toBe(null);
        expect(scope.searchIsQueryingServer).toBe(false);
        expect(scope.includeInactivePatients).toBe(false);
        expect(scope.sort).toEqual(['LastName', 'FirstName']);
        expect(scope.accountNumberlabel).toEqual('ACCT.# ');
      });
    });

    describe('$routeChangeStart event ->', function () {
      it('should call initializeSearch ', function () {
        spyOn(scope, 'initializeSearch');
        rootScope.$broadcast('$routeChangeStart', 'anyRoute', 'anyOtherRoute');
        expect(scope.initializeSearch).toHaveBeenCalled();
      });
    });

    describe('validSearch function ->', function () {
      it('should return true if searchString is valid for phone search (format XXX-)', function () {
        var mockSearchString = '217-';
        expect(scope.validSearch(mockSearchString)).toBe(true);

        mockSearchString = '217-999';
        expect(scope.validSearch(mockSearchString)).toBe(true);
      });

      it('should return true if searchString is valid for date search (if format XX- or XX/ allow search)', function () {
        var mockSearchString = '12-';
        expect(scope.validSearch(mockSearchString)).toBe(true);

        mockSearchString = '12/';
        expect(scope.validSearch(mockSearchString)).toBe(true);
      });

      it('should return true if searchString is valid for statement account id (if format X or XX or XXX... allow search)', function () {
        var mockSearchString = '217';
        expect(scope.validSearch(mockSearchString)).toBe(true);

        mockSearchString = '21';
        expect(scope.validSearch(mockSearchString)).toBe(true);
      });
    });

    describe('searchTerm watch - >', function () {
      it('should call activateSearch function if validSearch', function () {
        spyOn(scope, 'activateSearch');
        scope.searchTerm = '217';
        scope.$apply();
        timeout.flush();
        expect(scope.activateSearch).toHaveBeenCalledWith(scope.searchTerm);

        scope.searchTerm = '217-';
        scope.$apply();
        timeout.flush();
        expect(scope.activateSearch).toHaveBeenCalledWith(scope.searchTerm);
      });

      it('should cancel search if searchtimeout', function () {
        spyOn(scope, 'activateSearch');
        spyOn(timeout, 'cancel');
        scope.searchTerm = '217-';
        scope.searchTimeout = true;
        scope.$apply();
        expect(scope.activateSearch).not.toHaveBeenCalled();
        expect(timeout.cancel).toHaveBeenCalled();
      });
    });

    describe('sort function ->', function () {
      it('should equal sorCol', function () {
        scope.sortCol = 'LastName';
        scope.$apply();
        expect(scope.sort).toEqual(['LastName', 'FirstName']);

        scope.sortCol = '-LastName';
        scope.$apply();
        expect(scope.sort).toEqual(['-LastName', '-FirstName']);

        scope.sortCol = 'FirstName';
        scope.$apply();
        expect(scope.sort).toEqual(['FirstName', 'LastName']);

        scope.sortCol = '-FirstName';
        scope.$apply();
        expect(scope.sort).toEqual(['-FirstName', '-LastName']);
      });
    });

    describe('search function ->', function () {
      it('should return  without searching if search is in progress', function () {
        spyOn(scope, 'search');
        scope.searchIsQueryingServer = true;
        scope.search();
        expect(_patientServices_.Patients.search).not.toHaveBeenCalled();
      });

      it('should return  without searching if searchResults equal resultCount', function () {
        spyOn(scope, 'search');
        scope.searchResults = mockPatientResult;
        scope.resultCount = 3;
        scope.search();
        expect(_patientServices_.Patients.search).not.toHaveBeenCalled();
      });

      it('should return without searching if searchString is empty', function () {
        spyOn(scope, 'search');
        scope.searchString = '';
        scope.search();
        expect(_patientServices_.Patients.search).not.toHaveBeenCalled();
      });

      it('should set searchParams if search conditions are valid', function () {
        scope.searchIsQueryingServer = false;
        scope.searchString = 'mockSearch';
        scope.searchResults = [];
        scope.resultCount = 0;

        scope.search();
        expect(_patientServices_.Patients.search).toHaveBeenCalled();
      });

      it('should call patientServices Patient search if valid search ', function () {
        scope.searchString = 'Anything I want';
        scope.search();
        expect(_patientServices_.Patients.search).toHaveBeenCalled();
        scope.$apply();
        expect(scope.searchIsQueryingServer).toBe(true);
        expect(scope.fullPatientList).toBe(mockServiceReturnWrapper.Value);
        //With([({ searchFor: 'Anything I want', skip: 0, take: 45, sortBy: 'LastName', includeInactive: undefined }), jasmine.any(Function), jasmine.any(Function)]);
      });

      it('should set fullPatientList', function () {
        scope.searchString = 'Anything I want';
        scope.search();
        scope.$apply();
        expect(scope.fullPatientList).toBe(mockServiceReturnWrapper.Value);
      });

      it('should set selected property to null', function () {
        scope.searchString = '';
        scope.holdSearchTerm = true;
        scope.resultCount = 0;
        scope.searchResults = [];
        scope.search();

        expect(scope.selected).toBeNull();
      });
    });

    describe('searchGetOnSuccess function ->', function () {
      it('should set searchResults', function () {
        scope.searchGetOnSuccess(mockServiceReturnWrapper);
        scope.$apply();
        expect(scope.fullPatientList[0]).toBe(
          mockServiceReturnWrapper.Value[0]
        );
        expect(scope.fullPatientList[1]).toBe(
          mockServiceReturnWrapper.Value[1]
        );
        expect(scope.fullPatientList[2]).toBe(
          mockServiceReturnWrapper.Value[2]
        );
      });

      it('should set patientCount if gets results', function () {
        expect(scope.resultCount).toBe(0);
        scope.searchGetOnSuccess(mockServiceReturnWrapper);
        scope.$apply();
        expect(scope.searchIsQueryingServer).toBe(false);
        expect(scope.resultCount).toBe(3);
      });

      it('should set noSearchResults to false if gets results', function () {
        scope.searchGetOnSuccess(mockServiceReturnWrapper);
        scope.$apply();
        expect(scope.noSearchResults).toBe(false);
      });
    });

    describe('searchGetOnError function ->', function () {
      it('should set scope variables ', function () {
        scope.searchGetOnError();
        expect(scope.searchIsQueryingServer).toBe(false);
        expect(scope.resultCount).toBe(0);
        expect(scope.searchResults).toEqual([]);
        expect(scope.noSearchResults).toBe(true);
      });

      it('should should call toastr error ', function () {
        scope.searchGetOnError();
        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });

    describe('activateSearch function ->', function () {
      it('should not do search if user is not authorized for search ', function () {
        scope.hasAuthenticated = false;
        scope.hasSearchAccess = false;
        spyOn(scope, 'search');
        expect(scope.search).not.toHaveBeenCalled();
      });

      it('should set scope variables and call search if user is authorized for search ', function () {
        spyOn(scope, 'search');
        scope.searchTerm = 'mockTerm';
        scope.activateSearch(scope.searchTerm);
        expect(scope.searchString).toEqual(scope.searchTerm);
        expect(scope.limit).toBe(15);
        expect(scope.limitResults).toBe(true);
        expect(scope.resultCount).toBe(0);
        expect(scope.searchResults).toEqual([]);
        expect(scope.search).toHaveBeenCalled();
      });
    });

    //describe('viewResult function ->', function () {

    //    it('should redirect to Patient Dashboard if patient selected ', function () {
    //        mockPatientResult[0].$$authorized = true;
    //        var mockPatientId = mockPatientResult[0].PatientId;
    //        scope.viewResult(mockPatientResult[0]);

    //        expect(location.path).toHaveBeenCalledWith('Patient/' + mockPatientId + '/Overview/');
    //    });

    //    it('should call initializeSearch', function () {
    //        mockPatientResult[0].$$authorized = true;
    //        spyOn(scope, 'initializeSearch');
    //        var mockPatientId = mockPatientResult[0].PatientId;
    //        scope.viewResult(mockPatientResult[0]);

    //        expect(scope.initializeSearch).toHaveBeenCalled();
    //    });

    //    it('should set searchTerm when holdSearchTerm is true', function() {
    //        var result = { FirstName: 'Mike', LastName: 'Taylor' };
    //        scope.selectMode = true;
    //        scope.holdSearchTerm = true;
    //        scope.viewResult(result);

    //        expect(scope.searchTerm).toEqual('Mike Taylor');
    //    });

    //});

    describe('viewAll function ->', function () {
      it('should set properties to see entire list', function () {
        scope.viewAll();
        expect(scope.limit).toBe(500);
        expect(scope.limitResults).toBe(false);
      });

      it('should call search method since searchTerm has not changed', function () {
        spyOn(scope, 'search');
        scope.viewAll();
        expect(scope.search).toHaveBeenCalled();
      });
    });

    describe('setViewAllMessage function ->', function () {
      it('should set message based on scope properties', function () {
        scope.limitResults = true;
        scope.resultCount = 40;
        scope.limit = 20;
        scope.setViewAllMessage();
        expect(scope.viewAllMessage).toEqual('View all 40 results');
      });

      it('should set message empty if all records are visible', function () {
        scope.limitResults = false;
        scope.resultCount = 10;
        scope.limit = 10;
        scope.setViewAllMessage();
        expect(scope.viewAllMessage).toEqual('');
      });
    });

    describe('clear function ->', function () {
      it('should set searchTerm to empty string', function () {
        scope.clear();

        expect(scope.searchTerm).toBe('');
      });

      it('should set selected to null', function () {
        scope.clear();

        expect(scope.selected).toBeNull();
      });
    });

    describe('saveMostRecent function ->', function () {
      it('should call globalSearchFactory.SaveMostRecentPerson', function () {
        scope.saveMostRecent('123456789');
        expect(globalSearchFactory.SaveMostRecentPerson).toHaveBeenCalled();
      });
    });

    describe('displayRecents function ->', function () {
      it('should set searchResults to recent list', function () {
        scope.recents = angular.copy(mockPatientResult);
        scope.searchResults = [];
        scope.displayRecents();
        expect(scope.searchResults).toEqual(scope.recents);
        expect(scope.showRecents).toBe(true);
      });
    });

    describe('getMostRecent function ->', function () {
      it('should not call globalSearchFactory.MostRecentPersons if loading recents ', function () {
        scope.loadingRecents = true;
        ctrl.getMostRecent();
        //expect(globalSearchFactory.MostRecentPersons).not.toHaveBeenCalled();
      });

      it('should call globalSearchFactory.MostRecentPersons if not loading recents ', function () {
        scope.loadingMostRecent = false;
        ctrl.getMostRecent();
        expect(globalSearchFactory.MostRecentPersons).toHaveBeenCalled();
        expect(scope.loadingMostRecent).toBe(true);
      });
    });

    describe('proceedToView function ->', function () {
      var result = {};
      beforeEach(function () {
        result = { PatientId: '112233' };
      });

      it('should call scope.saveMostRecent with patientId', function () {
        spyOn(scope, 'saveMostRecent');
        scope.proceedToView(result, false);
        expect(scope.saveMostRecent).toHaveBeenCalledWith(result.PatientId);
      });

      it('should set selected to result if selectMode', function () {
        scope.selectMode = true;
        spyOn(scope, 'saveMostRecent');
        scope.proceedToView(result, false);
        expect(scope.selected).toEqual(result);
      });

      it('should emit selected if documentPatients', function () {
        scope.selectedPatient = result;
        spyOn(scope, '$emit');
        scope.documentPatients = true;
        scope.selectMode = true;
        spyOn(scope, 'saveMostRecent');
        scope.proceedToView(result, false);
        expect(scope.$emit).toHaveBeenCalledWith('patientSelected', result);
      });

      it('should not emit selected if not documentPatients', function () {
        scope.selectedPatient = result;
        spyOn(scope, '$emit');
        scope.documentPatients = false;
        scope.selectMode = true;
        spyOn(scope, 'saveMostRecent');
        scope.proceedToView(result, false);
        expect(scope.$emit).not.toHaveBeenCalled();
      });

      it('should call initializeSearch if not selectMode', function () {
        scope.selectMode = false;
        spyOn(scope, 'saveMostRecent');
        spyOn(scope, 'initializeSearch');
        scope.proceedToView(result, false);
        expect(scope.initializeSearch).toHaveBeenCalled();
      });
    });
  });
  describe('removeDuplicateValue function ->', function () {
    var myArray = [
      {
        DateOfBirth: '1994-05-08T23:59:00',
        DirectoryAllocationId: '5023b1c7-e982-e911-87f2-4851b7bfd303',
        FirstName: 'Raghu',
        IsActive: true,
        IsPatient: true,
        LastName: 'Nadh',
        MiddleName: '',
        PatientCode: 'NADRA1',
        PatientId: '508dbebe-d761-43bf-87cd-1b25a6b029eb',
        PreferredName: '',
        Suffix: '',
      },
      {
        DateOfBirth: '1994-06-28T23:59:00',
        DirectoryAllocationId: '2bd569e8-c499-e911-87fa-4851b7bfd307',
        FirstName: 'Document',
        IsActive: true,
        IsPatient: true,
        LastName: 'Testing',
        MiddleName: '',
        PatientCode: 'TESDO1',
        PatientId: '3',
        PreferredName: '',
      },
      {
        DateOfBirth: '1994-06-28T23:59:00',
        DirectoryAllocationId: '2bd569e8-c499-e911-87fa-4851b7bfd307',
        FirstName: 'Document',
        IsActive: true,
        IsPatient: true,
        LastName: 'Testing',
        MiddleName: '',
        PatientCode: 'TESDO1',
        PatientId: '3',
        PreferredName: '',
      },
    ];
    it('should remove duplicates patientId and check if the patientId is null or not', function () {
      var newArray = scope.removeDuplicateValue(myArray);
      expect(newArray.length).toBe(2);
    });
  });
});
