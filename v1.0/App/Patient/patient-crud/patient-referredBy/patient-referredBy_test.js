describe('patient-referredBy -> ', function () {
  var scope,
    rootScope,
    routeParams,
    ctrl,
    httpBackend,
    localize,
    timeout,
    element;

  //#region mocks
  var patientReferralEmptyMock = {
    Value: {
      PatientReferralId: '0000',
      ReferredPatientId: null,
      ReferralType: 0,
      ReferralSourceId: null,
      SourceDescription1: null,
      SourceDescription2: null,
    },
  };
  var patientSearchMock = {
    Value: [
      { PatientId: '1', FirstName: 'John', LastName: 'Doe' },
      { PatientId: '2', FirstName: 'Jane', LastName: 'Doe' },
    ],
    Count: 2,
  };
  var referralSourcesServiceMock = {
    Value: [{ Description: 'Radio' }, { Description: 'Newspaper' }],
  };
  var patientReferralTypesMock = [
    { Name: 'None', Id: 0 },
    { Name: 'Other', Id: 1 },
    { Name: 'Person', Id: 2 },
  ];

  var frmReferredByMock = {
    $valid: true,
    inpReferralSource: {
      $valid: true,
    },
    inpPatientSearch: {
      $valid: true,
    },
    personTypeAhead: {
      $valid: true,
    },
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

  // mock the injected factory
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  describe('when user is authorized -> ', function () {
    var referralSourcesService,
      patientServices,
      staticData,
      deferred,
      globalSearchFactory;
    // Create spies for services
    beforeEach(
      module('Soar.Patient', function ($provide) {
        referralSourcesService = {
          get: jasmine.createSpy(),
        };
        $provide.value('ReferralSourcesService', referralSourcesService);

        patientServices = {
          Patients: {
            search: jasmine.createSpy(),
          },
          Referrals: {
            GetReferral: jasmine.createSpy(),
          },
        };
        $provide.value('PatientServices', patientServices);

        staticData = {};
        $provide.value('StaticData', staticData);

        globalSearchFactory = {
          SaveMostRecentPerson: jasmine.createSpy(),
          LoadRecentPersons: jasmine.createSpy(),
        };
        $provide.value('GlobalSearchFactory', globalSearchFactory);
      })
    );

    // inject the search service to controller
    beforeEach(inject(function (
      $rootScope,
      $controller,
      $injector,
      $routeParams,
      $timeout,
      $q
    ) {
      timeout = $timeout;
      rootScope = $rootScope;
      scope = $rootScope.$new();
      routeParams = $routeParams;

      staticData.ReferralTypes = jasmine.createSpy().and.callFake(function () {
        deferred = $q.defer();
        return deferred.promise;
      });

      httpBackend = $injector.get('$httpBackend');

      localize = $injector.get('localize');

      scope.frmReferredBy = frmReferredByMock;

      ctrl = $controller('PatientReferredByController', {
        $scope: scope,
        person: mockNewPerson,
        patSecurityService: _authPatSecurityService_,
      });
    }));

    describe('initializeSearch function -> ', function () {
      it('should initialize search parameters', function () {
        ctrl.initializeSearch();
        expect(scope.disablePerson).toBe(false);
        expect(scope.searchLabel).toBe('Find a Person');
        expect(scope.takeAmount).toBe(45);
        expect(scope.resultCount).toBe(0);
        expect(scope.limit).toBe(15);
        expect(scope.limitResults).toBe(true);
        expect(scope.searchResults).toEqual([]);
        expect(scope.fullPatientList).toEqual([]);
        expect(scope.searchIsQueryingServer).toBe(false);
        expect(scope.includeInactivePatients).toBe(true);
        expect(scope.searchString).toBe('');
        expect(scope.searchTerm).toBe('');
        expect(scope.searchTimeout).toBe(null);
      });
    });

    it('should set scope properties', function (done) {
      scope.patientReferralTypesData.then(function (result) {
        scope.patientReferralTypesData.values = result;

        expect(scope.patientReferralTypes).not.toEqual({});
        expect(scope.editMode).toBe(false);
        expect(scope.patientId).toBeNull();
        expect(scope.fullPatientList.length).toBe(0);

        var tmp = {
          PatientReferralId: null,
          ReferredPatientId: null,
          ReferralType: null,
          ReferralSourceId: null,
          SourceDescription1: null,
          SourceDescription2: null,
        };
        expect(scope.tempReferral).toEqual(tmp);
        expect(scope.referralHasBeenSet).toBe(false);
        expect(scope.referralType).toBeNull();
        expect(scope.referral).toEqual(tmp);
        expect(scope.referralSources.length).toBe(0);
        expect(scope.referralSource).toBeNull();
        expect(scope.formIsValid).toBe(true);

        done();
      });

      deferred.promise.values = patientReferralTypesMock;
      deferred.resolve(patientReferralTypesMock);
      rootScope.$apply();
    });

    describe('staticData.ReferralTypes function -> ', function () {
      it('should call staticData.ReferralTypes', function () {
        expect(staticData.ReferralTypes).toHaveBeenCalled();
      });
    });

    describe('patientReferralsGetReferralSuccess function -> ', function () {
      beforeEach(function (done) {
        scope.patientReferralTypesData.then(function (result) {
          scope.patientReferralTypesData.values = result;
          done();
        });

        deferred.promise.values = patientReferralTypesMock;
        deferred.resolve(patientReferralTypesMock);
        rootScope.$apply();
      });

      it("should set referral and then referralHasBeenSet to true when referral's referralType is Other", function () {
        var otherReferral = {
          Value: {
            PatientReferralId: '1111',
            ReferredPatientId: 1,
            ReferralType: 1,
            ReferralSourceId: '1234',
            SourceDescription1: 'Radio',
            SourceDescription2: null,
          },
        };
        scope.patientReferralsGetReferralSuccess(otherReferral);

        expect(scope.referral).toEqual(otherReferral.Value);
        expect(scope.referralType).toEqual(scope.patientReferralTypes.Other);
        expect(scope.referralHasBeenSet).toBe(true);
        expect(scope.selectedId).toEqual(otherReferral.Value.ReferralSourceId);
      });

      it("should set referral and then referralHasBeenSet to true when referral's referralType is Person", function () {
        var patientReferral = {
          Value: {
            PatientReferralId: '1111',
            ReferredPatientId: 1,
            ReferralType: 2,
            ReferralSourceId: '1234',
            SourceDescription1: 'First',
            SourceDescription2: 'Last',
          },
        };
        scope.patientReferralsGetReferralSuccess(patientReferral);

        expect(scope.referral).toEqual(patientReferral.Value);
        expect(scope.referralType).toEqual(scope.patientReferralTypes.Person);
        expect(scope.referralHasBeenSet).toBe(true);
      });

      it("should set referral.PatientReferralId to null when referral's referralType is None", function () {
        spyOn(scope, 'ResetReferral');
        scope.patientReferralsGetReferralSuccess(patientReferralEmptyMock);

        expect(scope.referral.PatientReferralId).toBeNull();
        expect(scope.ResetReferral).toHaveBeenCalled();
      });
    });

    describe('patientReferralsGetReferralFailure function -> ', function () {
      it('should call toastr.error function', function () {
        scope.patientReferralsGetReferralFailure();

        expect(_toastr_.error).toHaveBeenCalled();
      });
    });

    describe('getReferralSources function -> ', function () {
      it('should call referralSources.get', function () {
        scope.getReferralSources();

        expect(referralSourcesService.get).toHaveBeenCalled();
      });
    });

    describe('referralSourcesServiceGetSuccess function -> ', function () {
      it('should set scope property', function () {
        scope.referralSourcesServiceGetSuccess(referralSourcesServiceMock);

        expect(scope.referralSources).toEqual(referralSourcesServiceMock.Value);
      });
    });

    describe('referralSourcesServiceGetFailure function -> ', function () {
      it('should call toastr error', function () {
        scope.referralSourcesServiceGetFailure();

        expect(_toastr_.error).toHaveBeenCalled();
      });
    });

    describe('validSearch function -> ', function () {
      it('should return true if search is valid', function () {
        var searchString = '999-';
        var returnVal = scope.validSearch(searchString);
        expect(returnVal).toBe(true);

        searchString = '99-';
        returnVal = scope.validSearch(searchString);
        expect(returnVal).toBe(true);

        searchString = '99/';
        returnVal = scope.validSearch(searchString);
        expect(returnVal).toBe(true);
      });

      it('should return false if search is not valid', function () {
        var searchString = '999';
        var returnVal = scope.validSearch(searchString);
        expect(returnVal).toBe(false);

        searchString = '99';
        returnVal = scope.validSearch(searchString);
        expect(returnVal).toBe(false);

        searchString = '9';
        returnVal = scope.validSearch(searchString);
        expect(returnVal).toBe(false);
      });
    });

    describe('search function -> ', function () {
      it('should not call patientServices.Patients.search when searchIsQueryingServer is true', function () {
        scope.searchIsQueryingServer = true;
        scope.search();

        expect(patientServices.Patients.search).not.toHaveBeenCalled();
      });

      it('should not call patientServices.Patients.search when patientCount is greater than 0 and fullPatientList equals patientCount', function () {
        scope.patientCount = 1;
        scope.fullPatientList = [{ FirstName: 'John', LastName: 'Doe' }];
        scope.search();

        expect(patientServices.Patients.search).not.toHaveBeenCalled();
      });

      it('should not call patientServices.Patients.search when searchString equals 0', function () {
        scope.searchString = '';
        scope.search();

        expect(patientServices.Patients.search).not.toHaveBeenCalled();
      });

      it('should call patientServices.Patients.search', function () {
        scope.searchIsQueryingServer = false;
        scope.patientCount = 2;
        scope.fullPatientList = [{ FirstName: 'John', LastName: 'Doe' }];
        scope.searchString = 'J';
        scope.includeInactivePatients = false;
        scope.search();

        expect(patientServices.Patients.search).toHaveBeenCalled();
      });
    });

    describe('searchGetOnSuccess function -> ', function () {
      it('should set scope properties', function () {
        scope.searchGetOnSuccess(patientSearchMock);

        expect(scope.resultCount).toBe(2);
        expect(scope.searchResults.length).toBe(2);
        expect(scope.noSearchResults).toBe(false);
        expect(scope.searchIsQueryingServer).toBe(false);
      });

      it('should set noSearchResults to true when no results were found', function () {
        scope.searchGetOnSuccess({ Value: [], Count: 0 });

        expect(scope.resultCount).toBe(0);
        expect(scope.searchResults.length).toBe(0);
        expect(scope.noSearchResults).toBe(true);
        expect(scope.searchIsQueryingServer).toBe(false);
      });
    });

    describe('searchGetOnError function -> ', function () {
      it('should set scope properties', function () {
        scope.searchGetOnError(patientSearchMock);

        expect(_toastr_.error).toHaveBeenCalled();
        expect(scope.resultCount).toBe(0);
        expect(scope.searchResults.length).toBe(0);
        expect(scope.noSearchResults).toBe(true);
        expect(scope.searchIsQueryingServer).toBe(false);
      });
    });

    describe('activateSearch function -> ', function () {
      it('should set initial search parameters', function () {
        var searchTerm = 'Bob';
        scope.searchString = 'Jim';
        scope.disablePerson = false;
        scope.activateSearch(searchTerm);

        expect(scope.resultCount).toBe(0);
        expect(scope.limit).toBe(15);
        expect(scope.limitResults).toBe(true);
        expect(scope.searchString).toEqual(searchTerm);
        expect(scope.searchResults).toEqual([]);
      });

      it('should call search if searchString not equal to searchTerm and disablePerson is false', function () {
        spyOn(scope, 'search');

        var searchTerm = 'Bob';
        scope.searchString = 'Jim';
        scope.disablePerson = false;
        scope.activateSearch(searchTerm);

        expect(scope.search).toHaveBeenCalled();
      });

      it('should call not search if searchString is equal to searchTerm or disablePerson is false', function () {
        spyOn(scope, 'search');

        var searchTerm = 'Bob';
        scope.searchString = 'Bob';
        scope.disablePerson = false;
        scope.activateSearch(searchTerm);
        expect(scope.search).not.toHaveBeenCalled();

        searchTerm = 'Bob';
        scope.searchString = 'Jim';
        scope.disablePerson = true;
        scope.activateSearch(searchTerm);
        expect(scope.search).not.toHaveBeenCalled();
      });
    });

    describe('editMode when patientId not null -> ', function () {
      // inject the controller
      beforeEach(inject(function ($rootScope, $controller) {
        routeParams.patientId = '111';

        ctrl = $controller('PatientReferredByController', { $scope: scope });
      }));

      it('should set scope properties', function () {
        expect(scope.editMode).toBe(true);
        expect(scope.patientId).toBe('111');
      });
    });

    describe('ResetReferral function -> ', function () {
      it('should set scope properties', function () {
        spyOn(scope, 'validate');
        scope.person = angular.copy(mockNewPerson);
        scope.ResetReferral();

        expect(scope.referralSource).toBeNull();
        expect(scope.validate).toHaveBeenCalled();
      });

      it('should null out all properties in referral when resetted and had no referral assigned before', function () {
        scope.referral = angular.copy(scope.tempReferral);
        scope.referral.ReferralSourceId = 2;
        scope.person = angular.copy(mockNewPerson);
        scope.ResetReferral();

        expect(scope.referral.ReferralType).toBeNull();
        expect(scope.referral.ReferralSourceId).toBeNull();
      });

      it('should null out all properties except ReferralType in referral when resetted and has a referral assigned to them', function () {
        scope.referral = angular.copy(scope.tempReferral);
        scope.referral.PatientReferralId = 2;
        scope.person = angular.copy(mockNewPerson);
        scope.ResetReferral();

        expect(scope.referral.ReferralType).toBe(patientReferralTypesMock.None);
      });

      it('should set referralType to None when referralHasBeenSet is true', function () {
        scope.referralHasBeenSet = true;
        scope.person = angular.copy(mockNewPerson);
        scope.ResetReferral();

        expect(scope.referralType).toBe(patientReferralTypesMock.None);
      });
    });

    describe('editMode when patientId is null -> ', function () {
      // inject the controller
      beforeEach(inject(function ($rootScope, $controller) {
        routeParams.patientId = null;

        ctrl = $controller('PatientReferredByController', { $scope: scope });
      }));

      it('should set scope properties', function () {
        expect(scope.editMode).toBe(false);
        expect(scope.patientId).toBe(null);
      });
    });

    describe('$watch selectedId -> ', function () {
      it('should call selectReferralSource function', function () {
        spyOn(scope, 'selectReferralSource');
        scope.selectedId = '1234';
        scope.$apply();

        expect(scope.selectReferralSource).toHaveBeenCalled();
      });
    });

    describe('selectReferralSource function -> ', function () {
      beforeEach(function (done) {
        scope.patientReferralTypesData.then(function (result) {
          scope.patientReferralTypesData.values = result;
          done();
        });

        deferred.promise.values = patientReferralTypesMock;
        deferred.resolve(patientReferralTypesMock);
        rootScope.$apply();
      });

      it('should return referral of a Person when "person" radio button is selected', function () {
        spyOn(scope, 'validate');
        scope.referralType = scope.patientReferralTypes.Person;
        scope.referral = angular.copy(scope.tempReferral);
        var selected = { PatientId: 2, FirstName: 'John', LastName: 'Doe' };
        scope.selectReferralSource(selected);

        expect(scope.referral.SourceDescription1).toEqual(selected.FirstName);
        expect(scope.referral.SourceDescription2).toEqual(selected.LastName);
        expect(scope.validate).toHaveBeenCalled();
        expect(scope.searchString).toBe('');
        expect(scope.fullPatientList.length).toBe(0);
        expect(scope.referralSource).toBeNull();
      });

      it('should return referral of a Source when "other" radio button is selected ', function () {
        spyOn(scope, 'validate');
        scope.referralType = scope.patientReferralTypes.Other;
        scope.referral = angular.copy(scope.tempReferral);
        var selected = { PatientReferralSource: 2, SourceName: 'Other' };
        scope.selectReferralSource(selected);

        expect(scope.referral.SourceDescription1).toEqual(selected.SourceName);
        expect(scope.referral.SourceDescription2).toBeNull();
        expect(scope.validate).toHaveBeenCalled();
        expect(scope.searchString).toBe('');
        expect(scope.fullPatientList.length).toBe(0);
        expect(scope.referralSource).toBeNull();
      });

      it('should return null properties in referral when "none" radio button is selected ', function () {
        spyOn(scope, 'ResetReferral');
        scope.referralType = patientReferralTypesMock.None;
        scope.referral = angular.copy(scope.tempReferral);
        scope.selectReferralSource(null);

        expect(scope.ResetReferral).toHaveBeenCalled();
        expect(scope.searchString).toBe('');
        expect(scope.fullPatientList.length).toBe(0);
        expect(scope.referralSource).toBeNull();
      });
    });

    describe('referralType $watch', function () {
      it('should call validate function', function () {
        spyOn(scope, 'validate');
        scope.referralType = patientReferralTypesMock[0];
        scope.$apply();
        scope.referralType = patientReferralTypesMock[1];
        scope.$apply();

        expect(scope.validate).toHaveBeenCalled();
      });

      it('should not call validate function', function () {
        spyOn(scope, 'validate');
        scope.referralType = patientReferralTypesMock[0];
        scope.$apply();
        scope.referralType = patientReferralTypesMock[0];
        scope.$apply();

        expect(scope.validate).not.toHaveBeenCalled();
      });
    });

    describe('referralTypeChanged function', function () {
      it('should call ResetReferral', function () {
        spyOn(scope, 'ResetReferral');
        scope.referralTypeChanged();
        timeout.flush(0);
        expect(scope.ResetReferral).toHaveBeenCalled();
        expect(scope.hasErrors).toBe(false);
      });

      it('should not call validate function', function () {
        spyOn(scope, 'validate');
        scope.referralType = patientReferralTypesMock[0];
        scope.$apply();
        scope.referralType = patientReferralTypesMock[0];
        scope.$apply();

        expect(scope.validate).not.toHaveBeenCalled();
      });
    });

    describe('validate function -> ', function () {
      it('should set valid to false when viewValue is null and referralType is not 0', function () {
        scope.referral.ReferralSourceId = null;
        scope.referralType = 1;
        scope.person = angular.copy(mockNewPerson);
        scope.validate();

        expect(scope.valid).toBe(false);
      });

      it('should set valid and formIsValid to true when viewValue is not null and referralType is not 0', function () {
        scope.referral.ReferralSourceId = '1';
        scope.referralType = 1;
        scope.person = angular.copy(mockNewPerson);
        scope.validate();

        expect(scope.valid).toBe(true);
        expect(scope.formIsValid).toBe(true);
      });
    });

    describe('clearPerson function -> ', function () {
      it('should call initializeSearch', function () {
        spyOn(ctrl, 'initializeSearch');
        scope.person = angular.copy(mockNewPerson);
        scope.clearPerson();

        expect(ctrl.initializeSearch).toHaveBeenCalled();
      });

      it('should reset scope properties', function () {
        scope.person = angular.copy(mockNewPerson);
        scope.clearPerson();
        expect(scope.referral.ReferralSourceId).toBe(null);
        expect(scope.referral.SourceDescription1).toBe(null);
        expect(scope.referral.SourceDescription2).toBe(null);
      });

      it('should call validate', function () {
        scope.person = angular.copy(mockNewPerson);
        spyOn(scope, 'validate');
        scope.clearPerson();

        expect(scope.validate).toHaveBeenCalled();
      });
    });

    describe('setReferral function -> ', function () {
      it('should set person.Referral to scope.referral if valid', function () {
        scope.valid = true;
        scope.referral = patientReferralEmptyMock;
        scope.referral.ReferralType = 1;
        scope.referral.ReferralSourceId = 1;
        scope.person = angular.copy(mockNewPerson);
        ctrl.setReferral();

        expect(scope.person.Referral).toEqual(scope.referral);
      });

      it('should set person.Referral to null if not valid', function () {
        scope.valid = false;
        scope.referral = patientReferralEmptyMock;
        scope.referral.ReferralType = 1;
        scope.referral.ReferralSourceId = 1;
        scope.person = angular.copy(mockNewPerson);
        ctrl.setReferral();

        expect(scope.person.Referral).toBe(null);
      });
    });

    describe('setFocusOnInput watch -> ', function () {
      it('should call setFocusOnElement', function () {
        spyOn(scope, 'setFocusOnElement');
        scope.setFocusOnInput = false;
        scope.$apply();
        scope.person = angular.copy(mockNewPerson);
        scope.setFocusOnInput = true;
        scope.$apply();
        expect(scope.setFocusOnElement).toHaveBeenCalled();
      });
    });

    describe('setFocusOnElement function -> ', function () {
      it('should set focus on invalid input ', function () {
        element = {
          focus: jasmine.createSpy(),
        };
        spyOn(angular, 'element').and.returnValue(element);

        scope.frmReferredBy = frmReferredByMock;
        scope.frmReferredBy.inpReferralSource.$valid = false;
        scope.setFocusOnElement();
        timeout.flush();
        expect(angular.element('#inpReferralSource').focus).toHaveBeenCalled();

        scope.frmReferredBy.inpReferralSource.$valid = true;
        scope.frmReferredBy.inpPatientSearch.$valid = false;
        scope.setFocusOnElement();
        timeout.flush();
        expect(angular.element('#inpPatientSearch').focus).toHaveBeenCalled();

        scope.frmReferredBy.inpReferralSource.$valid = true;
        scope.frmReferredBy.inpPatientSearch.$valid = true;
        scope.frmReferredBy.personTypeAhead.$valid = false;
        scope.setFocusOnElement();
        timeout.flush();
        expect(angular.element('#personTypeAhead').focus).toHaveBeenCalled();
      });
    });
  });
});
