describe('PatientAccountInsuranceAdjustedEstimateController ->', function () {
  var ctrl,
    routeParams,
    patientServices,
    commonServices,
    q,
    listHelper,
    modalDataFactory,
    scope;

  beforeEach(module('Soar.Common'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    scope.person = {
      PersonAccount: {
        PersonAccountMember: {
          AccountId: 'AccountId',
          AccountMemberId: 'AccountMemberId',
        },
      },
    };
    scope = scope.$new();
    scope = scope.$new();

    routeParams = {};

    patientServices = {
      PatientBenefitPlan: {
        get: jasmine.createSpy(),
      },
      Account: {
        getAccountMembersDetailByAccountId: jasmine.createSpy(),
      },
    };

    commonServices = {
      Insurance: {
        BenefitPlan: {
          get: jasmine.createSpy(),
        },
        Carrier: {
          get: jasmine.createSpy(),
        },
      },
    };

    q = {
      all: jasmine.createSpy(),
    };

    listHelper = {
      findIndexByFieldValue: jasmine.createSpy(),
      findItemByFieldValue: jasmine.createSpy(),
    };

    modalDataFactory = {};

    ctrl = $controller('PatientAccountInsuranceAdjustedEstimateController', {
      $scope: scope,
      $routeParams: routeParams,
      PatientServices: patientServices,
      CommonServices: commonServices,
      $q: q,
      ListHelper: listHelper,
      ModalDataFactory: modalDataFactory,
    });
  }));
});
