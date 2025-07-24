describe('HeightWeightController', function () {
  beforeEach(module('Soar.Patient', function ($provide) {}));

  var scope, ctrl;

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    scope.master = { HeightInches: -99, HeightFee: -99, Weight: -99 };
    scope.patientInfo = { HeightInches: -99, HeightFee: -99, Weight: -99 };
    scope.user = { HeightInches: -99, HeightFee: -99, Weight: -99 };

    ctrl = $controller('HeightWeightController', {
      $scope: scope,
    });
  }));

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('ctrl.$onInit', function () {
    it('Controller Initialization works', function () {
      ctrl.$onInit();
      expect(scope.master).toEqual(scope.patientInfo);
      expect(scope.user).toEqual(scope.master);
      expect(scope.editing).toEqual(false);
      expect(scope.cancelling).toEqual(false);
      expect(scope.hasErrors).toEqual(false);
      expect(scope.title).toEqual('Weight & Height');
    });
  });

  describe('$scope.reset', function () {
    it('Copy Master record to User record', function () {
      scope.reset();
      expect(scope.user).toEqual(scope.master);
    });
  });

  describe('$scope.editHeightWeight', function () {
    it('Select Edit Control', function () {
      scope.editHeightWeight();
      expect(scope.editing).toEqual(true);
    });
  });

  describe('$scope.savePanelEdit', function () {
    it('Select Save Control', function () {
      scope.savePanelEdit();
      expect(scope.editing).toEqual(false);
      expect(scope.user).toEqual(scope.master);
    });
  });

  describe('$scope.cancelPanelEdit', function () {
    beforeEach(inject(function () {
      scope.reset = jasmine.createSpy();
    }));

    it('Select Cancel Control', function () {
      scope.cancelPanelEdit();
      expect(scope.editing).toEqual(false);
      expect(scope.cancelling).toEqual(true);
      expect(scope.reset).toHaveBeenCalled();
    });
  });

  describe('$scope.roundMyNumber', function () {
    beforeEach(inject(function () {
      scope.user.Weight = 99.92;
    }));

    it('Editing Weight = 99.92', function () {
      scope.roundMyNumber();
      expect(99.9).toEqual(scope.user.Weight);
    });
  });

  describe('$scope.roundMyNumber', function () {
    beforeEach(inject(function () {
      scope.user.Weight = 100;
    }));

    it('Editing Weight = 100', function () {
      scope.roundMyNumber();
      expect(100).toEqual(scope.user.Weight);
    });
  });
});
