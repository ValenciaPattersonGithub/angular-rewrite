/*
 * A - Arrange
 * A - Act
 * A - Assert
 */

describe('treatmentplans-patient-slideout ->', function () {
  var scope, controller;

  beforeEach(module('Soar.Patient'));

  ///Arrange
  ///Mocking & Dependency Injection

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $timeout,
    PatientAdditionalIdentifierService,
    toastrFactory,
    localize
  ) {
    scope = $rootScope.$new();

    controller = $controller('TreatmentPlansSlideoutController', {
      $scope: scope,
      $timeout: $timeout,
      PatientAdditionalIdentifierService: PatientAdditionalIdentifierService,
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
      expect(scope.isVisibleShowMorebuttonApptType).toBe(false);
      expect(scope.isVisibleShowLessbuttonApptType).toBe(false);

      expect(scope.isVisibleShowMorebuttonApptType).toBe(false);
      expect(scope.isVisibleShowLessbuttonApptType).toBe(false);

      expect(scope.isVisibleShowMorebuttonGroup).toBe(false);
      expect(scope.isVisibleShowLessbuttonGroup).toBe(false);

      expect(scope.isVisibleShowMorebuttonDentist).toBe(false);
      expect(scope.isVisibleShowLessbuttonDentist).toBe(false);

      expect(scope.isVisibleShowMorebuttonHygienist).toBe(false);
      expect(scope.isVisibleShowLessbuttonHygienist).toBe(false);

      expect(scope.isVisibleShowLessbuttonTreatmentProviders).toBe(false);
      expect(scope.isVisibleShowMorebuttonTreatmentProviders).toBe(false);

      expect(scope.isVisibleShowMorebuttonRoom).toBe(false);
      expect(scope.isVisibleShowLessbuttonRoom).toBe(false);

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
});
