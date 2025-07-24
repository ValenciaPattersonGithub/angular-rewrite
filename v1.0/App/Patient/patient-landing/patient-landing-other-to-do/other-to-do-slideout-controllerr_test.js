/*
 * A - Arrange
 * A - Act
 * A - Assert
 */

describe('other-to-do-slideout ->', function () {
  var scope, controller;

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

    controller = $controller('OtherToDoSlideoutController', {
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
    /// Act & Assert using it
    it('it should be false', function () {
      //Assert
      expect(scope.isVisibleShowMorebuttonGroup).toBe(false);
      expect(scope.isVisibleShowLessbuttonGroup).toBe(false);

      expect(scope.isVisibleShowMorebuttonDentist).toBe(false);
      expect(scope.isVisibleShowLessbuttonDentist).toBe(false);
      expect(scope.isVisibleShowMorebuttonHygienist).toBe(false);
      expect(scope.isVisibleShowLessbuttonHygienist).toBe(false);
      expect(scope.isVisibleShowMorebuttonRoom).toBe(false);
      expect(scope.isVisibleShowLessbuttonRoom).toBe(false);
      expect(scope.isVisibleShowMorebuttonAI).toBe(false);
      expect(scope.isVisibleShowLessbuttonAI).toBe(false);
      expect(scope.isVisibleShowMorebuttonGroup).toBe(false);
      expect(scope.isVisibleShowLessbuttonGroup).toBe(false);
    });
  });

  describe('initialize value show more check function ->', function () {
    it('it should call showMoreCheck', function () {
      spyOn(controller, 'ShowMoreCheck');
      controller.ShowMoreCheck(false);
      expect(controller.ShowMoreCheck).toHaveBeenCalled();
    });
  });
});
