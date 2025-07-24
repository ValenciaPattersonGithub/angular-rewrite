describe('Controller: PerioStatsToothTileController', function () {
  var ctrl, scope;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    scope.perioStatsToothExam = {
      DepthPocket: [null, 2, 3, null, 5, 6],
      GingivalMarginPocket: [null, 8, 7, 6, 5, null],
    };

    // create controller
    ctrl = $controller('PerioStatsToothTileController', {
      $scope: scope,
    });
  }));

  //controller
  it('PerioStatsToothTileController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
    expect(ctrl).not.toBeUndefined();
  });

  describe(' calculateAttachmentLevel function ->', function () {
    it('should return true if index=0', function () {
      ctrl.calculateAttachmentLevel();
      expect(scope.AttachmentLevel).toEqual(['', 10, 10, '6', 10, '6']);
    });
  });

  describe(' init function ->', function () {
    it('should return true if index=0', function () {
      spyOn(ctrl, 'calculateAttachmentLevel');
      ctrl.init();
      expect(ctrl.calculateAttachmentLevel).toHaveBeenCalled();
    });
  });
});
