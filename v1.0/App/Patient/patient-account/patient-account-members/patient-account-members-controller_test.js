describe('Controller: PatientAccountMembersController', function () {
  var ctrl,
    scope,
    rootscope,
    controller,
    localize,
    patientServices,
    toastrFactory,
    timeout,
    shareData,
    patientValidationFactory;
  function createController() {
    ctrl = controller('PatientAccountMembersController', {
      $scope: scope,
      localize: localize,
      PatientServices: patientServices,
      toastrFactory: toastrFactory,
      ShareData: shareData,
    });
  }

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
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

      var deregisterObserver = function () {};
      var personFactory = {
        AccountMemberDetails: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        ActiveAccountOverview: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        observeActiveAccountOverview: jasmine
          .createSpy()
          .and.returnValue(deregisterObserver),
      };
      $provide.value('PersonFactory', personFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    rootscope = $rootScope;
    controller = $controller;

    //set scope variables
    scope.patientId = 1;
    scope.accountId = 1;

    var additionalDataObj = {
      PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
      FirstName: 'John',
      LastName: 'Smith',
      PreferredName: 'John',
      DateOfBirth: '1991-12-03T00:00:00Z',
      IsPatient: true,
      PhoneNumber: null,
    };

    //scope.$parent.$parent.$parent.additionalData =
    scope.$parent = rootscope.$new();
    scope.$parent.$parent = rootscope.$new();
    scope.$parent.$parent.additionalData = additionalDataObj;
    scope.$parent.$parent.$parent = rootscope.$new();
    scope.$parent.$parent.$parent.additionalData = additionalDataObj;
    scope.$parent.$parent.$parent.$parent = rootscope.$new();
    scope.$parent.$parent.$parent.$parent.additionalData = additionalDataObj;

    shareData = {};

    //mock for patient services
    patientServices = {
      Patients: {
        get: jasmine.createSpy().and.returnValue(''),
      },
      Account: {
        getAllAccountMembersByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
        getAccountMembersDetailByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
      },
      Encounter: {
        getEncounterServiceTransactionLinkByPersonId: jasmine
          .createSpy()
          .and.returnValue(''),
      },
    };

    //mock for toaster functionality
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    //mock for localization
    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.returnValue(
          'An error has occurred while getting all account members.'
        ),
    };

    timeout = $injector.get('$timeout');
    spyOn(timeout, 'cancel');
  }));

  //controller
  it('PatientAccountMembersController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  //getAllAccountMembersSuccess
  describe('getAllAccountMembersSuccess function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));
    it('should handle success callback of get all account members', function () {
      var successResponse = {
        Value: [
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'John',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
        ],
      };
      ctrl.getAllAccountMembersSuccess(successResponse);
      expect(toastrFactory.error).not.toHaveBeenCalled();
    });
    it('should load all account members', function () {
      var successResponse = {
        Value: [
          {
            PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
            FirstName: 'John',
            LastName: 'Smith',
            PreferredName: 'John',
            DateOfBirth: '1991-12-03T00:00:00Z',
            IsPatient: true,
            PhoneNumber: null,
          },
        ],
      };
      ctrl.getAllAccountMembersSuccess(successResponse);
      expect(scope.accountMembers).toEqual(successResponse.Value);
    });
  });

  //getAccountMembersFailure
  describe('getAllAccountMembersFailure  function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));
    it('should handle failure callback of get all account members', function () {
      ctrl.getAllAccountMembersFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  //getAllAccountMembers
  describe('getAllAccountMembers  function ->', function () {
    beforeEach(inject(function () {
      createController();
    }));
    it('should call getAllAccountMembersByAccountId of patient account service', function () {
      scope.loadingAccountMembers = true;
      spyOn(ctrl, 'getAllAccountMembersSuccess');
      spyOn(ctrl, 'getAllAccountMembersFailure');
      ctrl.getAllAccountMembers();
      expect(
        patientServices.Account.getAllAccountMembersByAccountId
      ).toHaveBeenCalled();
    });

    it('should call getAllAccountMembersByAccountId of patient account service', function () {
      scope.loadingAccountMembers = true;
      shareData.AllAccountMembers = [{ AccountId: 1 }];
      spyOn(ctrl, 'getAllAccountMembersSuccess');
      ctrl.getAllAccountMembers();
      expect(ctrl.getAllAccountMembersSuccess).toHaveBeenCalled();
    });
  });

  // Watch the additionalData if patient profile has been updated
  describe('watcher $parent.$parent.$parent.additionalData ->', function () {
    beforeEach(inject(function () {
      createController();
    }));

    it('should call ctrl.getAllAccountMembers function to get latest data if account member profile is changed', function () {
      spyOn(ctrl, 'getAllAccountMembers');
      var additionalDataObj = {
        PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
        FirstName: 'John',
        LastName: 'Smith',
        PreferredName: 'John',
        DateOfBirth: '1991-12-03T00:00:00Z',
        IsPatient: true,
        PhoneNumber: null,
      };

      scope.$parent.$parent.additionalData = additionalDataObj;
      scope.$parent.$parent.$parent.additionalData = additionalDataObj;
      scope.$parent.$parent.$parent.$parent.additionalData = additionalDataObj;

      scope.$apply();
      timeout.flush(100);

      additionalDataObj = {
        PatientId: '3ac618be-9915-4a6a-b7f3-8ec9568dcab3',
        FirstName: 'Mary',
        LastName: 'Smith',
        PreferredName: 'Mary',
        DateOfBirth: '1991-12-03T00:00:00Z',
        IsPatient: true,
        PhoneNumber: null,
      };

      scope.$parent.$parent.additionalData = additionalDataObj;
      scope.$parent.$parent.$parent.additionalData = additionalDataObj;
      scope.$parent.$parent.$parent.$parent.additionalData = additionalDataObj;

      scope.$apply();
      timeout.flush(100);

      expect(ctrl.getAllAccountMembers).toHaveBeenCalled();
    });
  });
});
