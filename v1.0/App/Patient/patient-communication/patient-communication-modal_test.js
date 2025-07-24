describe('patient-communication-modal ->', function () {
  var scope;
  var controller, referenceDataService, patientBenefitPlansFactory;

  var patientService = {
    get: jasmine.createSpy(),
  };

  var toastrFactory = {
    error: jasmine.createSpy(),
  };

  var userServices = {
    Users: {
      get: jasmine.createSpy(),
    },
  };

  beforeEach(
    module('Soar.Patient', function ($provide) {
      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          locations: 'locations',
        },
      };

      $provide.value('referenceDataService', referenceDataService);
    })
  );

  // Controller Setup
  var $q;
  beforeEach(inject(function ($rootScope, $controller, _$q_) {
    $q = _$q_;

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([]);
    });

    scope = $rootScope.$new();

    var dependencies = {
      $scope: scope,
      toastrFactory: toastrFactory,
      PatientServices: patientService,
      UserServices: userServices,
      PatientBenefitPlansFactory: patientBenefitPlansFactory,
    };

    controller = $controller(
      'patientCommunicationModalController',
      dependencies
    );
  }));

  // Tests
  describe('initialize controller ->', function () {
    it('should exist', function () {
      expect(controller).not.toBeNull();
      //expect(patientService.get).toHaveBeenCalled();
    });
  });

  //note: inital test for patient communication, still inprogress
});
