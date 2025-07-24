describe('appointment-slideout-controller ->', function () {
  var scope;
  var controller;

  var mockPatientAdditionalIdentifierService = {
    get: jasmine.createSpy().and.callFake(function () {
      return { then: jasmine.createSpy() };
    }),
  };

  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    controller = $controller('AppointmentSlideoutController', {
      $scope: scope,
      PatientAdditionalIdentifierService:
        mockPatientAdditionalIdentifierService,
    });
  }));

  describe('initial values ->', function () {
    it('controller should exist', function () {
      expect(controller).not.toBeUndefined();
      expect(controller).not.toBeNull();
    });
  });

  describe('reset functionality ->', function () {
    // The tests below can be ignored for now
    //describe('appointment date ->', function() {
    //    it('should check all', function() {
    //        controller.reset();
    //    });
    //});

    //describe('appointment states ->', function () {
    //    it('should uncheck all, cancelled, completed, missed', function () {
    //        controller.reset();
    //    });

    //    it('should check scheduled, unscheduled', function () {
    //        controller.reset();
    //    });
    //});

    describe('visible flags ->', function () {
      it('should reset all to false', function () {
        scope.isVisibleShowMoreButtonApptType = true;
        scope.isVisibleShowLessButtonApptType = true;
        scope.isVisibleShowMoreButtonGroup = true;
        scope.isVisibleShowLessButtonGroup = true;
        scope.isVisibleShowMoreButtonDentist = true;
        scope.isVisibleShowLessButtonDentist = true;
        scope.isVisibleShowMoreButtonHygienist = true;
        scope.isVisibleShowLessButtonHygienist = true;
        scope.isVisibleShowMoreButtonProvider = true;
        scope.isVisibleShowLessButtonProvider = true;
        scope.isVisibleShowMoreButtonRoom = true;
        scope.isVisibleShowLessButtonRoom = true;

        controller.ShowMoreCheck = jasmine.createSpy();

        controller.reset();

        expect(scope.isVisibleShowMorebuttonApptType).toBe(false);
        expect(scope.isVisibleShowLessbuttonApptType).toBe(false);
        expect(scope.isVisibleShowMorebuttonGroup).toBe(false);
        expect(scope.isVisibleShowLessbuttonGroup).toBe(false);
        expect(scope.isVisibleShowMorebuttonDentist).toBe(false);
        expect(scope.isVisibleShowLessbuttonDentist).toBe(false);
        expect(scope.isVisibleShowMorebuttonHygienist).toBe(false);
        expect(scope.isVisibleShowLessbuttonHygienist).toBe(false);
        expect(scope.isVisibleShowMorebuttonProvider).toBe(false);
        expect(scope.isVisibleShowLessbuttonProvider).toBe(false);
        expect(scope.isVisibleShowMorebuttonRoom).toBe(false);
        expect(scope.isVisibleShowLessbuttonRoom).toBe(false);

        expect(controller.ShowMoreCheck).toHaveBeenCalled();
      });
    });
  });
});
