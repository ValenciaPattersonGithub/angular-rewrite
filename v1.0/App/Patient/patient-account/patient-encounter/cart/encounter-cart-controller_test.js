
describe('PatientEncounterCartController ->', function () {
  var ctrl, scope, routeParams, location, patientServices, referenceDataService, featureFlagService, fuseFlag;
  var controller;
  var $q;
  routeParams = {
    PrevLocation: 'AccountSummary',
    accountId: '816dcfbe-d211-44af-be8f-d8e7350d919d',
    patientId: '96487890-fb85-4d71-b180-49c9f1f46713',
  };

  location = {};

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          locations: 'locationsName',
        },
      };

      featureFlagService = {
        getOnce$: jasmine.createSpy()
      };
              
      fuseFlag = {
      };

      $provide.value('FeatureFlagService', featureFlagService);
      $provide.value('FuseFlag', fuseFlag);
      $provide.value('referenceDataService', referenceDataService);
    })
  );

  function createController() {
    ctrl = controller('PatientEncounterCartController', {
      $scope: scope,
      $routeParams: routeParams,
      $location: location,
      PatientServices: patientServices,
      featureFlagService: featureFlagService
    });
  }

  beforeEach(inject(function ($rootScope, $controller, _$q_) {
    $q = _$q_;
    scope = $rootScope.$new();

    referenceDataService.getData.and.returnValue($q.resolve([]));
    featureFlagService.getOnce$.and.returnValue({ subscribe: function () {}});

    patientServices = {
      Patients: {
        get: jasmine
          .createSpy()
          .and.returnValue({ $promise: { Value: 2, then: function () {} } }),
      },
    };

    controller = $controller;
    createController(scope.obj);
  }));

  //controller
  it('should exist', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  it('should set initial values', function () {
    expect(scope.patientId).toBe(routeParams.patientId);
    expect(scope.encounterId).toBe(routeParams.encounterId);
    expect(scope.accountId).toBe(routeParams.accountId);
    expect(routeParams.Category).toBe('Summary');
  });

  describe('ctrl.init function ->', function () {
    var locationsResult = 'locations';
    beforeEach(function () {
      ctrl.getCurrentPatientById = jasmine
        .createSpy()
        .and.returnValue({ then: function () {} });
      referenceDataService.getData.and.returnValue($q.resolve(locationsResult));
    });

    it('should call referenceDataService.get and ctrl.getCurrentPatientById', function () {
      ctrl.init();
      scope.$apply();

      expect(featureFlagService.getOnce$).toHaveBeenCalled();
      expect(referenceDataService.getData).toHaveBeenCalledWith(
        referenceDataService.entityNames.locations
      );
      expect(ctrl.locations).toEqual(locationsResult);
      expect(ctrl.getCurrentPatientById).toHaveBeenCalled();
    });

    describe('getCurrentPatientById callback ->', function () {
      var result, locations;
      beforeEach(function () {
        result = {
          Value: {
            PatientId: 'patientid',
            ResponsiblePersonName: 'responsibleperson',
            PreferredLocation: 2,
          },
        };
        locations = [{ LocationId: 1 }, { LocationId: 2 }];
        referenceDataService.getData.and.returnValue($q.resolve(locations));
        ctrl.getCurrentPatientById = function () {
          return {
            then: function (cb) {
              cb(result);
            },
          };
        };
        patientServices.Contacts = {
          getAllPhonesWithLinks: jasmine.createSpy(),
        };
      });

      it('should set values correctly', function () {
        ctrl.init();
        scope.$apply();
        expect(scope.patientHeaderObj).toBe(result.Value);
        expect(scope.patientHeaderObj.ResponsibleParty).toBe(
          result.Value.ResponsiblePersonName
        );
        expect(scope.patientHeaderObj.ResponsiblePersonName).toBe(
          result.Value.ResponsiblePersonName
        );
        expect(scope.patientHeaderObj.PrimaryLocation).toEqual({
          LocationId: 2,
        });
      });

      it('should set $$DisplayStatus correctly when person is a patient', function () {
        result.Value.IsPatient = true;

        ctrl.init();
        scope.$apply();
        expect(scope.patientHeaderObj.$$DisplayStatus).toBe('Active Patient');
      });

      it('should set $$DisplayStatus correctly when person is a patient', function () {
        result.Value.IsPatient = false;

        ctrl.init();
        scope.$apply();
        expect(scope.patientHeaderObj.$$DisplayStatus).toBe('Active Person');
      });

      it('should call patientServices.Contacts.getAllPhonesWithLinks', function () {
        ctrl.init();
        scope.$apply();
        expect(
          patientServices.Contacts.getAllPhonesWithLinks
        ).toHaveBeenCalledWith(
          { Id: result.Value.PatientId },
          ctrl.getPatientPhonesSuccess,
          ctrl.getPatientPhonesFailure
        );
      });
    });
  });

  describe('ctrl.getCurrentPatientById function ->', function () {
    var resultPromise;
    beforeEach(function () {
      resultPromise = '$promise';
      patientServices.Patients.get = jasmine
        .createSpy()
        .and.returnValue({ $promise: resultPromise });
    });

    it('should call patientServices.Patients.get and return $promise property', function () {
      var result = ctrl.getCurrentPatientById();

      expect(patientServices.Patients.get).toHaveBeenCalledWith({
        Id: routeParams.patientId,
      });
      expect(result).toBe(resultPromise);
    });
  });

  describe('ctrl.getPatientPhonesSuccess function ->', function () {
    it('should set scope.patientHeaderObj.primaryPhone', function () {
      var result = { Value: ['newValue', 'wrongValue'] };
      scope.patientHeaderObj = { primaryPhone: 'oldValue' };

      ctrl.getPatientPhonesSuccess(result);

      expect(scope.patientHeaderObj.primaryPhone).toBe(result.Value[0]);
    });
  });

  describe('ctrl.getScheduleLink function ->', function () {
    it('should get v2 schedule when ShowScheduleV2 is set to true', function () {
      scope.ShowScheduleV2 = true;
      let link = ctrl.getScheduleLink();
      
      expect(link).toBe('/schedule/v2');
    });
  });

  describe('scope.cancelClicked function ->', function () {
    beforeEach(function () {
      location.url = jasmine.createSpy();
    });

    it('should call $location with correct url when routeParams.PrevLocation is Schedule and routeParams.open is null', function () {
      routeParams.PrevLocation = 'Schedule';
      routeParams.date = 'routedate';
      routeParams.view = 'routeview';
      routeParams.group = 'routegroup';
      routeParams.providers = 'routeproviders';
      routeParams.location = 'routelocation';
      routeParams.index = 'routeindex';

      scope.cancelClicked();

      expect(location.url).toHaveBeenCalledWith(
        '/Schedule?date=' +
          routeParams.date +
          '&view=' +
          routeParams.view +
          '&group=' +
          routeParams.group +
          '&providers=' +
          routeParams.providers +
          '&location=' +
          routeParams.location +
          '&index=' +
          routeParams.index
      );
    });

    it('should call $location with correct url when routeParams.PrevLocation is Schedule and routeParams.open is not null', function () {
      routeParams.PrevLocation = 'Schedule';
      routeParams.date = 'routedate';
      routeParams.view = 'routeview';
      routeParams.group = 'routegroup';
      routeParams.providers = 'routeproviders';
      routeParams.location = 'routelocation';
      routeParams.index = 'routeindex';
      routeParams.open = 'routeopen';

      scope.cancelClicked();

      expect(location.url).toHaveBeenCalledWith(
        '/Schedule?date=' +
          routeParams.date +
          '&view=' +
          routeParams.view +
          '&group=' +
          routeParams.group +
          '&providers=' +
          routeParams.providers +
          '&location=' +
          routeParams.location +
          '&index=' +
          routeParams.index +
          '&open=' +
          routeParams.open
      );
    });

    it('should call $location with correct url when routeParams.PrevLocation is AccountSummary', function () {
      routeParams.PrevLocation = 'AccountSummary';

      scope.cancelClicked();

      expect(location.url).toHaveBeenCalledWith(
        '/Patient/' + scope.patientId + '/Summary/?tab=Account Summary'
      );
    });

    it('should call $location with correct url when routeParams.PrevLocation is PatientOverview', function () {
      routeParams.PrevLocation = 'PatientOverview';

      scope.cancelClicked();

      expect(location.url).toHaveBeenCalledWith(
        '/Patient/' + scope.patientId + '/Overview/'
      );
    });
  });
});
