/*
 * A - Arrange
 * A - Act
 * A - Assert
 */

describe('all-patient-slideout ->', function () {
  var scope, controller;
  var mockPatientAdditionalIdentifierService = {
    get: jasmine.createSpy().and.callFake(function () {
      return { then: jasmine.createSpy() };
    }),
  };

  beforeEach(module('Soar.Patient'));

  ///Arrange
  ///Mocking & Dependency Injection
  var allPatientsGridFactory;

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $timeout,
    PatientAdditionalIdentifierService,
    toastrFactory,
    localize
  ) {
    scope = $rootScope.$new();

    controller = $controller('AllPatientSlideoutController', {
      $scope: scope,
      $timeout: $timeout,
      allPatientsGridFactory: allPatientsGridFactory,
      PatientAdditionalIdentifierService:
        mockPatientAdditionalIdentifierService,
      toastrFactory: toastrFactory,
      localize: localize,
    });
  }));

  describe('Match Controller to be defined function ->', function () {
    /// Act & Assert using it
    it('should be created successfully', function () {
      //Assert
      expect(controller).toBeDefined();
      expect(controller).not.toBeNull();
    });
  });

  describe('initialize value show more/less button ->', function () {
    it('it should call showMoreLessButtonInitialize', function () {
      spyOn(controller, 'showMoreLessButtonInitialize');
      controller.showMoreLessButtonInitialize();
      expect(controller.showMoreLessButtonInitialize).toHaveBeenCalled();
    });

    /// Act & Assert using it
    it('it should be false', function () {
      //Assert
      expect(scope.isVisibleShowMorebuttonDentist).toBe(false);
      expect(scope.isVisibleShowLessbuttonDentist).toBe(false);

      expect(scope.isVisibleShowMorebuttonHygienist).toBe(false);
      expect(scope.isVisibleShowLessbuttonHygienist).toBe(false);

      expect(scope.isVisibleShowMorebuttonZipCodes).toBe(false);
      expect(scope.isVisibleShowLessbuttonZipCodes).toBe(false);

      expect(scope.isVisibleShowMorebuttonPrefferedLoc).toBe(false);
      expect(scope.isVisibleShowLessbuttonPrefferedLoc).toBe(false);

      expect(scope.isVisibleShowMorebuttonAI).toBe(false);
      expect(scope.isVisibleShowLessbuttonAI).toBe(false);
    });
  });

  describe('initialize value show more check function ->', function () {
    it('it should call showMoreCheck', function () {
      spyOn(controller, 'showMoreCheck');
      controller.showMoreCheck(false);
      expect(controller.showMoreCheck).toHaveBeenCalled();
    });
  });

  describe('initialize patient insurance filter ->', function () {
    it('it should initialize patient insurance filter', function () {
      const insFilter = scope.insuranceFilters;
      expect(insFilter).toBeDefined();
    });
  });

  describe('reset insuranace filter ->', function () {
    it('it should reset insurance filter when clear filter applied', function () {
      spyOn(controller, 'reset');
      controller.reset('insFilter');
      expect(controller.reset).toHaveBeenCalled();
    });
  });
});
