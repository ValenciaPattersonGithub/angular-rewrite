describe('BluePreferencesController ->', function () {
  var scope, ctrl;
  var imagingMasterService, routeParams, sce, imagingProviders;

  beforeEach(module('Soar.Common'));
  beforeEach(module('Soar.BusinessCenter'));

  // create spies for services
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      imagingMasterService = {};
      $provide.value('ImagingMasterService', imagingMasterService);

      imagingProviders = { Blue: 'blue' };
      $provide.value('ImagingProviders', imagingProviders);
    })
  );

  // Create controller and scope
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    routeParams = {};

    sce = {
      trustAsResourceUrl: jasmine.createSpy().and.callFake(val => `sce_${val}`),
    };

    ctrl = $controller('BluePreferencesController', {
      $scope: scope,
      $routeParams: routeParams,
      $sce: sce,
    });
  }));

  it('should exist', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('ctrl.init function ->', function () {
    var results;
    beforeEach(function () {
      ctrl.error = jasmine.createSpy();

      results = {};
      imagingMasterService.getReadyServices = jasmine
        .createSpy()
        .and.returnValue({ then: cb => cb(results) });
    });

    describe('when routeParams.blueUrl is null ->', function () {
      beforeEach(function () {
        routeParams = {};
      });

      it('should call ctrl.error', function () {
        ctrl.init();

        expect(ctrl.error).toHaveBeenCalled();
      });

      it('should not call imagingMasterService.getReadyServices', function () {
        ctrl.init();

        expect(imagingMasterService.getReadyServices).not.toHaveBeenCalled();
      });
    });

    describe('when routeParams.blueUrl is "undefined" ->', function () {
      beforeEach(function () {
        routeParams.blueUrl = 'undefined';
      });

      it('should call ctrl.error', function () {
        ctrl.init();

        expect(ctrl.error).toHaveBeenCalled();
      });

      it('should not call imagingMasterService.getReadyServices', function () {
        ctrl.init();

        expect(imagingMasterService.getReadyServices).not.toHaveBeenCalled();
      });
    });

    describe('when routeParams.blueUrl is defined ->', function () {
      beforeEach(function () {
        routeParams.blueUrl = 'blueUrl';
      });

      it('should call imagingMasterService.getReadyServices', function () {
        ctrl.init();

        expect(imagingMasterService.getReadyServices).toHaveBeenCalled();
      });

      describe('when imagingMasterService does not return data for imagingProviders.Blue ->', function () {
        beforeEach(function () {
          results[imagingProviders.Blue + 'x'] = { status: 'ready' };
        });

        it('should call ctrl.error', function () {
          ctrl.init();

          expect(ctrl.error).toHaveBeenCalled();
        });
      });

      describe('when imagingMasterService returns not ready for imagingProviders.Blue ->', function () {
        beforeEach(function () {
          results[imagingProviders.Blue] = { status: 'error' };
        });

        it('should call ctrl.error', function () {
          ctrl.init();

          expect(ctrl.error).toHaveBeenCalled();
        });
      });

      describe('when imagingMasterService returns ready for imagingProviders.Blue ->', function () {
        beforeEach(function () {
          scope.showBlue = false;
          scope.frameSource = '';

          results[imagingProviders.Blue] = { status: 'ready' };

          ctrl.error = jasmine.createSpy();
        });

        it('should set frameSource and showBlue', function () {
          ctrl.init();

          expect(sce.trustAsResourceUrl).toHaveBeenCalledWith(
            routeParams.blueUrl
          );
          expect(scope.showBlue).toBe(true);
          expect(scope.frameSource).toBe(`sce_${routeParams.blueUrl}`);
        });
      });
    });
  });

  describe('ctrl.error function ->', function () {
    it('should set scope.errorMessage', function () {
      scope.errorMessage = null;

      ctrl.error();

      expect(scope.errorMessage).not.toBeNull();
    });
  });
});
