describe('PatientResponsiblePartyController ->', function () {
  var q,
    ctrl,
    scope,
    modalInstance,
    toastrFactory,
    patientServices,
    localize,
    timeout,
    filter,
    element,
    modalFactory,
    modalFactoryDeferred,
    patientValidationFactory,
    locationsFactory;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy(),
      };
      $provide.value('localize', localize);

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
        GetAllAccountValidation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      locationsFactory = {
        UserLocations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('LocationsFactory', locationsFactory);

      patientValidationFactory = {};
      $provide.value('PatientValidationFactory', patientValidationFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    q = $q;
    scope = $rootScope.$new();
    scope.patient = { ResponsiblePersonId: null };
    //mock for modal
    modalInstance = {
      open: jasmine.createSpy('modalInstance.open'),
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    //mock for toaster functionality
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    //mock of ModalFactory
    modalFactory = {
      ConfirmModal: jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    //mock of PatientServices
    patientServices = {
      Patients: {
        get: jasmine
          .createSpy('patientServices.Patients.get')
          .and.returnValue({
            Value: {
              PersonAccount: {
                PersonAccountMember: { ResponsiblePersonId: '201' },
              },
            },
          }),
        search: jasmine
          .createSpy('patientServices.Patients.search')
          .and.returnValue(''),
      },
    };

    ctrl = $controller('PatientResponsiblePartyController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      PatientServices: patientServices,
      ModalFactory: modalFactory,
    });
    timeout = $injector.get('$timeout');
    filter = $injector.get('$filter');

    var scrollIntoViewObject = {
      scrollIntoView: jasmine.createSpy(),
    };

    element = {
      focus: jasmine.createSpy(),
      get: jasmine.createSpy().and.returnValue(scrollIntoViewObject),
    };
    spyOn(angular, 'element').and.returnValue(element);
    spyOn(window, '$');
  }));

  //controller
  it('PatientEncounterController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  it('PatientEncounterController : should initialize required properties', function () {
    expect(scope.takeAmount).toBe(45);
    expect(scope.limit).toBe(15);
    expect(scope.limitResults).toBe(true);
    expect(scope.searchTerm).toBe('');
    expect(scope.searchString).toBe('');
    expect(scope.resultCount).toBe(0);
    expect(scope.searchResults.length).toBe(0);
    expect(scope.searchTimeout).toBe(null);
    expect(scope.searchIsQueryingServer).toBeFalsy();
    expect(scope.includeInactivePatients).toBeFalsy();
  });

  it('PatientEncounterController : should set focus on summary combo box on page load when defaultFocus is set to true', function () {
    scope.defaultFocus = true;
    spyOn(ctrl, 'setFocusOnResponsiblePerson');

    timeout.flush(999);
    timeout.flush(1);

    expect(ctrl.setFocusOnResponsiblePerson).toHaveBeenCalled();
  });

  it('PatientEncounterController : should set not focus on summary combo box on page load when defaultFocus is set to false', function () {
    scope.defaultFocus = false;

    expect(angular.element('#inpSelf').focus).not.toHaveBeenCalled();
    expect(
      angular.element('#lblResponsiblePerson').get(0).scrollIntoView
    ).not.toHaveBeenCalled();

    timeout.flush(999);

    expect(angular.element('#inpSelf').focus).not.toHaveBeenCalled();
    expect(
      angular.element('#lblResponsiblePerson').get(0).scrollIntoView
    ).not.toHaveBeenCalled();

    timeout.flush(1);

    expect(angular.element('#inpSelf').focus).not.toHaveBeenCalled();
    expect(
      angular.element('#lblResponsiblePerson').get(0).scrollIntoView
    ).not.toHaveBeenCalled();
  });

  //toastrFactory
  it('should check that toastrFactory is not null', function () {
    expect(toastrFactory).not.toBe(null);
  });

  it('should check that toastrFactory is not undefined', function () {
    expect(toastrFactory).not.toBeUndefined();
  });

  //initializeSearch
  it('initializeSearch should initialize search properties', function () {
    ctrl.initializeSearch();

    expect(scope.takeAmount).toBe(45);
    expect(scope.limit).toBe(15);
    expect(scope.limitResults).toBe(true);
    expect(scope.searchTerm).toBe('');
    expect(scope.searchString).toBe('');
    expect(scope.resultCount).toBe(0);
    expect(scope.searchResults.length).toBe(0);
    expect(scope.searchTimeout).toBe(null);
  });

  //responsiblePersonSuccess
  it("responsiblePersonSuccess should set search term with responsible person information if the responsible person's detail is not null", function () {
    var response = {
      Value: {
        FirstName: 'First',
        LastName: 'Last',
        DateOfBirth: '1992-03-05',
        PatientCode: 'FIRSLA1',
        PhoneNumber: '123-4567890',
      },
    };
    scope.searchTerm = null;

    ctrl.responsiblePersonSuccess(response);

    expect(scope.searchTerm).toBe(
      'First Last (RP)          ID: FIRSLA1          DoB: 03/05/1992'
    );
  });

  it("responsiblePersonSuccess should not set search term with responsible person information if the responsible person's detail is null", function () {
    var response = { Value: null };
    scope.searchTerm = null;

    ctrl.responsiblePersonSuccess(response);

    expect(scope.searchTerm).toBeNull();
  });

  //responsiblePersonFailure
  it('responsiblePersonFailure should call error method of toastrFactory', function () {
    var error = {};

    ctrl.responsiblePersonFailure(error);

    expect(toastrFactory.error).toHaveBeenCalled();
  });

  //getResponsiblePersonById
  it('getResponsiblePersonById should call get method of patientServices.Patients', function () {
    var responsiblePersonId = '201';

    ctrl.getResponsiblePersonById(responsiblePersonId);

    expect(patientServices.Patients.get).toHaveBeenCalledWith(
      { Id: responsiblePersonId },
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  //setResponsiblePerson
  it("setResponsiblePerson should call getResponsiblePersonById if patient's ResponsiblePersonId is not null", function () {
    scope.patient = { ResponsiblePersonId: '201' };
    spyOn(ctrl, 'getResponsiblePersonById').and.returnValue({});

    ctrl.setResponsiblePerson();

    expect(ctrl.getResponsiblePersonById).toHaveBeenCalledWith(
      scope.patient.ResponsiblePersonId
    );
  });

  it("setResponsiblePerson should not call getResponsiblePersonById if patient's ResponsiblePersonId is null", function () {
    scope.patient = { ResponsiblePersonId: null };
    spyOn(ctrl, 'getResponsiblePersonById').and.returnValue({});

    ctrl.setResponsiblePerson();

    expect(ctrl.getResponsiblePersonById).not.toHaveBeenCalled();
  });

  //validSearch
  it('validSearch should allow search for phone numbers starting with XXX-', function () {
    var searchString = '123-';

    var result = scope.validSearch(searchString);

    expect(result).toBeTruthy();
  });

  it('validSearch should prevent search for phone numbers having format X', function () {
    var searchString = '1';
    var result = scope.validSearch(searchString);
    expect(result).toBeFalsy();
  });

  it('validSearch should prevent search for phone numbers having format XX', function () {
    var searchString = '12';
    var result = scope.validSearch(searchString);
    expect(result).toBeFalsy();
  });

  it('validSearch should prevent search for phone numbers having format XXX', function () {
    var searchString = '123';
    var result = scope.validSearch(searchString);
    expect(result).toBeFalsy();
  });

  it('validSearch should allow search for date having format XX-', function () {
    var searchString = '11-';
    var result = scope.validSearch(searchString);
    expect(result).toBeTruthy();
  });

  it('validSearch should allow search for date having format XX/', function () {
    var searchString = '11/';
    var result = scope.validSearch(searchString);
    expect(result).toBeTruthy();
  });

  it('validSearch should allow search for a patter that does not match phone or date format', function () {
    var searchString = 'Abcd';
    var result = scope.validSearch(searchString);
    expect(result).toBeTruthy();
  });

  //showRpMessage
  it('set RpMesage when Rp is not editable', function () {
    scope.patient = {
      ResponsiblePersonId: '9EB00C3C-ED1D-4FA1-B45E-9FFF88709844',
      IsResponsiblePersonEditable: false,
    };
    scope.showRpMessage();
    expect(scope.rpMessage).toEqual(
      'Please use the Transfer functionality as this patient has account activity that needs to be transferred.'
    );
  });

  //watch on patient.DateOfBirth
  it('watch on DateOfBirth should set ageCheck to true ', function () {
    scope.ageCheck = false;

    scope.patient.DateOfBirth = '2001-01-01';
    scope.$apply();
    scope.patient.DateOfBirth = '2002-01-01';
    scope.$apply();

    expect(scope.ageCheck).toBe(true);
  });

  //watch on defaultFocus
  it('watch on DateOfBirth should set ageCheck to true ', function () {
    spyOn(ctrl, 'setFocusOnResponsiblePerson');
    scope.defaultFocus = false;
    scope.$apply();
    timeout.flush(300);

    scope.defaultFocus = true;
    scope.$apply();

    timeout.flush(300);
    expect(ctrl.setFocusOnResponsiblePerson).toHaveBeenCalled();
  });

  //watch on searchTerm
  it('watch on searchTerm should activate search on new value if the new value is defined, is not an empty string, and is a valid search string', function () {
    spyOn(scope, 'validSearch').and.returnValue(true);
    spyOn(scope, 'activateSearch');

    scope.searchTerm = 'P';
    scope.$apply();
    scope.searchTerm = 'Pa';
    scope.$apply();
    scope.searchTerm = 'Pat';
    scope.$apply();

    expect(scope.validSearch).toHaveBeenCalled();
    expect(scope.activateSearch).not.toHaveBeenCalled();
    timeout.flush(500);
    expect(scope.activateSearch).toHaveBeenCalled();
  });

  it('watch on searchTerm should not activate search on new value if the new value it is not a valid search string', function () {
    spyOn(scope, 'validSearch').and.returnValue(false);
    spyOn(scope, 'activateSearch');
    spyOn(timeout, 'cancel');

    scope.searchTerm = 'P';
    scope.$apply();
    scope.searchTerm = 'Pa';
    scope.$apply();
    scope.searchTerm = 'Pat';
    scope.$apply();

    expect(scope.validSearch).toHaveBeenCalled();
    expect(scope.activateSearch).not.toHaveBeenCalled();
    timeout.flush(500);
    expect(scope.activateSearch).not.toHaveBeenCalled();
  });

  it('watch on searchTerm should activate search on old value if the new value is not defined, and the old value is defined, is not an empty string, and is a valid search string', function () {
    spyOn(scope, 'validSearch').and.returnValue(true);
    spyOn(scope, 'activateSearch');

    scope.searchTerm = 'Pat';
    scope.$apply();
    scope.searchTerm = 'Pa';
    scope.$apply();
    scope.searchTerm = null;
    scope.$apply();

    expect(scope.validSearch).toHaveBeenCalled();
    expect(scope.activateSearch).not.toHaveBeenCalled();
    timeout.flush(500);
    expect(scope.activateSearch).toHaveBeenCalled();
  });

  it('watch on searchTerm should not activate search on old value if the old value it is not a valid search string, when the new value is not defined', function () {
    spyOn(scope, 'validSearch').and.returnValue(false);
    spyOn(scope, 'activateSearch');
    spyOn(timeout, 'cancel');

    scope.searchTerm = 'Pat';
    scope.$apply();
    scope.searchTerm = 'Pa';
    scope.$apply();
    scope.searchTerm = null;
    scope.$apply();

    expect(scope.validSearch).toHaveBeenCalled();
    expect(scope.activateSearch).not.toHaveBeenCalled();
    timeout.flush(500);
    expect(scope.activateSearch).not.toHaveBeenCalled();
  });

  //search
  it('search function should not search for matching result if the previous search is still in progress', function () {
    scope.searchIsQueryingServer = true;
    scope.searchResults = [];
    scope.resultCount = 2;
    scope.searchString = 'Patient1';

    scope.search();

    expect(patientServices.Patients.search).not.toHaveBeenCalled();
  });

  it('search function should not search for matching result if the search is already done', function () {
    scope.searchIsQueryingServer = false;
    scope.searchResults = [{ value: 'Patient1' }];
    scope.resultCount = 1;
    scope.searchString = 'Patient1';

    scope.search();

    expect(patientServices.Patients.search).not.toHaveBeenCalled();
  });

  it('search function should not search for matching result if search string is empty', function () {
    scope.searchIsQueryingServer = false;
    scope.searchResults = [];
    scope.resultCount = 0;
    scope.searchString = '';

    scope.search();

    expect(patientServices.Patients.search).not.toHaveBeenCalled();
  });

  it('search function should search for matching result if the search string is not empty and search on the string is not in progress or complete', function () {
    scope.searchIsQueryingServer = false;
    scope.searchResults = [];
    scope.resultCount = 0;
    scope.searchString = 'Patient1';
    scope.takeAmount = 45;
    scope.sortCol = 'FirstName';
    scope.includeInactive = false;
    var value;
    var searchParams = {
      searchFor: scope.searchString,
      skip: scope.searchResults.length,
      take: scope.takeAmount,
      sortBy: scope.sortCol,
      includeInactive: scope.includeInactive,
      excludePatient: value,
    };

    scope.search();

    expect(scope.searchIsQueryingServer).toBe(true);
    expect(patientServices.Patients.search).toHaveBeenCalledWith(
      searchParams,
      jasmine.any(Function),
      jasmine.any(Function)
    );
  });

  //searchGetOnSuccess
  it('searchGetOnSuccess should set the search properties as per the search results', function () {
    scope.searchResults = [];
    scope.resultCount = 0;
    scope.searchIsQueryingServer = true;
    var result = { Count: 1, Value: [{ value: 'Patient1' }] };

    scope.searchGetOnSuccess(result);

    expect(scope.resultCount).toBe(1);
    expect(scope.searchResults.length).toBe(1);
    expect(scope.searchResults[0]).toBe(result.Value[0]);
    expect(scope.noSearchResults).toBe(false);
    expect(scope.searchIsQueryingServer).toBe(false);
  });

  //searchGetOnError
  it('searchGetOnError should call error method of toastrFactory and reset search properties', function () {
    scope.searchIsQueryingServer = true;
    scope.resultCount = 1;
    scope.searchResults = [{ value: 'Patient1' }];
    scope.noSearchResults = false;

    scope.searchGetOnError();

    expect(scope.searchIsQueryingServer).toBe(false);
    expect(scope.resultCount).toBe(0);
    expect(scope.searchResults.length).toBe(0);
    expect(scope.noSearchResults).toBe(true);
  });

  //activateSearch
  it('activateSearch should search when search string is changed', function () {
    var searchTerm = 'Abcd';
    scope.searchString = 'Ab';
    scope.disableParty = false;
    spyOn(scope, 'search');

    scope.activateSearch(searchTerm);

    expect(scope.limit).toBe(15);
    expect(scope.limitResults).toBe(true);
    expect(scope.searchString).toBe(searchTerm);
    expect(scope.resultCount).toBe(0);
    expect(scope.searchResults.length).toBe(0);
    expect(scope.search).toHaveBeenCalled();
  });

  it('activateSearch should not search when search string is unchanged', function () {
    var searchTerm = 'Ab';
    scope.searchString = 'Ab';
    spyOn(scope, 'search');

    scope.activateSearch(searchTerm);

    expect(scope.search).not.toHaveBeenCalled();
  });

  //clearResponsiblePerson
  it('clearResponsiblePerson should clear responsible person information and re-initialize search properties', function () {
    scope.responsiblePerson = { FirstName: 'Responsible' };
    scope.patient = { ResponsiblePersonId: '201' };
    spyOn(ctrl, 'initializeSearch');

    scope.clearResponsiblePerson();

    expect(ctrl.initializeSearch).toHaveBeenCalled();
    expect(scope.patient.ResponsiblePersonId).toBeNull();
    expect(scope.responsiblePerson).toBeNull();
  });

  it('clearResponsiblePerson should set focus on element with id inpSelf if ResponsiblePersonType is not equal to 2', function () {
    scope.responsiblePerson = { FirstName: 'Responsible' };
    scope.patient = { ResponsiblePersonId: '201', ResponsiblePersonType: '1' };
    spyOn(ctrl, 'initializeSearch');

    scope.clearResponsiblePerson();

    expect(angular.element('#inpSelf').focus).toHaveBeenCalled();
    expect(scope.patient.ResponsiblePersonType).toBeNull();
  });

  it('clearResponsiblePerson should set focus on element with id personTypeAheadInput if ResponsiblePersonType is equal to 2', function () {
    scope.responsiblePerson = { FirstName: 'Responsible' };
    scope.patient = { ResponsiblePersonId: '201', ResponsiblePersonType: '2' };
    spyOn(ctrl, 'initializeSearch');

    scope.clearResponsiblePerson();

    expect(
      angular.element('#personTypeAheadInput').focus
    ).not.toHaveBeenCalled();
    timeout.flush(199);
    expect(
      angular.element('#personTypeAheadInput').focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(angular.element('#personTypeAheadInput').focus).toHaveBeenCalled();
  });

  //continueResponsiblePerson
  it('continueResponsiblePerson  should set disableResponsiblePerson to true', function () {
    scope.selectedRp = {};

    scope.continueResponsiblePerson();

    expect(scope.disableResponsiblePerson).toBeTruthy();
  });

  //uncheckResponsiblePersonType
  it("uncheckResponsiblePersonType should clear ResponsiblePersonType of patient if it is equal to click event's target value", function () {
    var event = { target: { value: 'Self' } };
    scope.patient = { ResponsiblePersonType: 'Self' };

    scope.uncheckResponsiblePersonType(event);

    expect(scope.patient.ResponsiblePersonType).toBe(null);
  });

  it("uncheckResponsiblePersonType should not clear ResponsiblePersonType of patient if it is not equal to click event's target value", function () {
    var event = { target: { value: 'Self' } };
    scope.patient = { ResponsiblePersonType: 'Other' };

    scope.uncheckResponsiblePersonType(event);

    expect(scope.patient.ResponsiblePersonType).toBe('Other');
  });

  //checkUncheckResponsiblePersonTypeOnKeyDown
  it("checkUncheckResponsiblePersonTypeOnKeyDown should clear ResponsiblePersonType of patient if it is equal to click event's target value", function () {
    var event = { keyCode: 32, target: { value: '1' } };
    scope.patient = { ResponsiblePersonType: '1' };

    scope.checkUncheckResponsiblePersonTypeOnKeyDown(event);
    timeout.flush(900);
    //expect(ctrl.initializeSearch).toHaveBeenCalledWith();
    expect(scope.patient.ResponsiblePersonType).toBe(null);
  });

  it("checkUncheckResponsiblePersonTypeOnKeyDown should clear ResponsiblePersonType of patient if it is equal to click event's target value", function () {
    var event = { keyCode: 32, target: { value: '2' } };
    scope.patient = { ResponsiblePersonType: '2' };

    scope.checkUncheckResponsiblePersonTypeOnKeyDown(event);
    timeout.flush(900);
    // expect(ctrl.initializeSearch).toHaveBeenCalledWith();
    expect(scope.patient.ResponsiblePersonType).toBe(null);
  });

  it("checkUncheckResponsiblePersonTypeOnKeyDown should clear ResponsiblePersonType of patient if it is equal to click event's target value", function () {
    var event = { keyCode: 32, target: { value: 1 } };
    scope.patient = {
      ResponsiblePersonType: 2,
      IsResponsiblePersonEditable: true,
    };

    scope.checkUncheckResponsiblePersonTypeOnKeyDown(event);
    timeout.flush(200);
    expect(scope.patient.ResponsiblePersonType).toBe(1);
  });

  //uncheckResponsiblePersonType
  it("checkUncheckResponsiblePersonTypeOnKeyDown should remain same ResponsiblePersonType of patient if it is equal to click event's target value and keypressed is not space bar", function () {
    var event = { keyCode: 9, target: { value: 1 } };
    scope.patient = { ResponsiblePersonType: 1 };

    scope.checkUncheckResponsiblePersonTypeOnKeyDown(event);
    timeout.flush(200);
    expect(scope.patient.ResponsiblePersonType).toBe(1);
  });

  //responsiblePersonTypeChange
  it("responsiblePersonTypeChange should validate age if patient's responsible person type is equal to 1", function () {
    scope.patient = {
      ResponsiblePersonType: '1',
      IsResponsiblePersonEditable: true,
    };
    spyOn(scope, 'validateAge');
    spyOn(ctrl, 'initializeSearch');

    scope.responsiblePersonTypeChange();
    timeout.flush(100);
    expect(scope.validateAge).toHaveBeenCalledWith(scope.patient);
  });

  it("responsiblePersonTypeChange should set focus on element with id personTypeAheadInput if patient's responsible person type is not equal to 1", function () {
    scope.patient = {
      ResponsiblePersonType: '2',
      IsResponsiblePersonEditable: true,
    };
    spyOn(scope, 'validateAge');
    spyOn(ctrl, 'initializeSearch');
    scope.responsiblePersonTypeChange();
    timeout.flush(100);
    expect(scope.validateAge).not.toHaveBeenCalled();
    expect(
      angular.element('#personTypeAheadInput').focus
    ).not.toHaveBeenCalled();
    timeout.flush(199);
    expect(
      angular.element('#personTypeAheadInput').focus
    ).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(angular.element('#personTypeAheadInput').focus).toHaveBeenCalled();
  });

  it('responsiblePersonTypeChange should re-initialize search properties and responsible person information', function () {
    scope.patient = {
      ResponsiblePersonType: '1',
      IsResponsiblePersonEditable: true,
    };
    spyOn(scope, 'validateAge');
    spyOn(ctrl, 'initializeSearch');
    scope.responsiblePersonTypeChange();
    timeout.flush(100);
    expect(ctrl.initializeSearch).toHaveBeenCalledWith();
    expect(scope.responsiblePerson).toBeNull();
    expect(scope.patient.ResponsiblePersonId).toBeNull();
  });

  //validateAge
  it("validateAge should not open confirmation dialog if the the patient's date of birth is not set", function () {
    var patient = { FirstName: 'First', LastName: 'Last', DateOfBirth: null };
    scope.selectedRp = {};

    scope.validateAge(patient);

    expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
  });

  it("validateAge should not open confirmation dialog if the the patient's age is 18 years or above", function () {
    var patient = {
      FirstName: 'First',
      LastName: 'Last',
      DateOfBirth: '1992-02-05',
    };
    scope.selectedRp = {};

    scope.validateAge(patient);

    expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
  });

  it("validateAge should open confirmation dialog if the the patient's age is below 18 years, when patient's FirstName and LastName are defined", function () {
    var patient = {
      FirstName: 'First',
      LastName: 'Last',
      DateOfBirth: moment().format('YYYY-MM-DD'),
    };
    var message = 'First Last is under the age of 18.';
    scope.ageCheck = true;

    scope.validateAge(patient);

    expect(modalFactory.ConfirmModal).toHaveBeenCalled();
  });

  it("validateAge should open confirmation dialog if the the patient's age is below 18 years, when patient's FirstName and LastName are not defined", function () {
    var patient = {
      FirstName: null,
      LastName: null,
      DateOfBirth: moment().format('YYYY-MM-DD'),
    };
    var message = '  is under the age of 18.';
    scope.ageCheck = true;

    scope.validateAge(patient);
    expect(scope.ageCheck).toBe(false);
  });

  it("validateAge should open confirmation dialog if the the patient's age is below 18 years, when patient's FirstName and LastName are defined and ageCheck is true", function () {
    var patient = {
      FirstName: 'First',
      LastName: 'Last',
      DateOfBirth: moment().format('YYYY-MM-DD'),
    };
    scope.ageCheck = true;
    scope.validateAge(patient);

    expect(scope.ageCheck).toBe(false);
  });

  //checkForResponsiblePersonAccountAndAge
  it('checkForResponsiblePersonAccountAndAge should not open confirmation dialog if the patient is null', function () {
    scope.patient = null;
    scope.selectedRp = {};
    ctrl.checkForResponsiblePersonAccountAndAge(null);

    expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
  });

  it("checkForResponsiblePersonAccountAndAge should open confirmation dialog if the the patient is not responsible for himself/herself, when patient's FirstName and LastName are defined", function () {
    var patient = {
      FirstName: 'First',
      LastName: 'Last',
      ResponsiblePersonId: null,
    };
    var message =
      'First Last cannot be selected as the responsible person as he/she is not the responsible person for his/her own account.';

    ctrl.checkForResponsiblePersonAccountAndAge(patient);

    expect(modalFactory.ConfirmModal).toHaveBeenCalled();
  });

  it('checkForResponsiblePersonAccountAndAge should validate age when responsible person id exists', function () {
    var patient = {
      FirstName: 'First',
      LastName: 'Last',
      ResponsiblePersonId: 1,
    };
    scope.patient = patient;
    spyOn(scope, 'validateAge');

    ctrl.checkForResponsiblePersonAccountAndAge(patient);

    expect(scope.validateAge).toHaveBeenCalledWith(scope.patient);
  });

  it("checkForResponsiblePersonAccountAndAge should open confirmation dialog if the the patient is not responsible for himself/herself, when patient's FirstName and LastName are not defined", function () {
    var patient = {
      FirstName: null,
      LastName: null,
      ResponsiblePersonId: null,
    };
    var message =
      '  cannot be selected as the responsible person as he/she is not the responsible person for his/her own account.';

    ctrl.checkForResponsiblePersonAccountAndAge(patient);
    expect(localize.getLocalizedString).toHaveBeenCalled();
  });

  it("checkForResponsiblePersonAccountAndAge should validate age if patient's ResponsiblePersonId is not null", function () {
    var patient = {
      FirstName: 'First',
      LastName: 'Last',
      ResponsiblePersonId: '201',
      DateOfBirth: null,
    };
    scope.patient = patient;
    spyOn(scope, 'validateAge');

    ctrl.checkForResponsiblePersonAccountAndAge(patient);

    expect(scope.validateAge).toHaveBeenCalledWith(scope.patient);
  });

  //watch on defaultFocus
  it('watch on defaultFocus should set focus on Self responsible person and should call scrollInToView function when defaultFocus property is set to true', function () {
    spyOn(ctrl, 'setFocusOnResponsiblePerson');
    scope.defaultFocus = false;
    scope.$apply();
    timeout.flush(300);

    scope.defaultFocus = true;
    scope.$apply();

    timeout.flush(400);
    expect(ctrl.setFocusOnResponsiblePerson).toHaveBeenCalled();
  });

  it('watch on defaultFocus should not set focus on Self responsible person and should not call scrollInToView function when defaultFocus property is set to false', function () {
    scope.defaultFocus = true;
    scope.$apply();
    scope.defaultFocus = false;
    scope.$apply();

    timeout.flush(300);
    expect(angular.element('#inpSelf').focus).not.toHaveBeenCalled();

    timeout.flush(400);
    expect(angular.element('#inpSelf').focus).not.toHaveBeenCalled();
  });

  //setFocusOnResponsiblePerson
  it('setFocusOnResponsiblePerson should set focust to inpSelf and call scroll to top', function () {
    scope.defaultFocus = false;

    ctrl.setFocusOnResponsiblePerson();
    expect(angular.element('#inpSelf').focus).toHaveBeenCalled();
  });

  //$on broadcast patsoar:setreasponsiblepersonfocus
  describe('$on patsoar:setreasponsiblepersonfocus broadcast function ->', function () {
    it('should handle broadcast event and sets location data', function () {
      scope.defaultFocus = true;
      spyOn(ctrl, 'setFocusOnResponsiblePerson');
      scope.$broadcast('patsoar:setreasponsiblepersonfocus');
      timeout.flush(400);
      expect(ctrl.setFocusOnResponsiblePerson).toHaveBeenCalled();
    });
  });
});
