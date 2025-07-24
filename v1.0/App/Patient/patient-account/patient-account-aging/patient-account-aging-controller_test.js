describe('Controller: PatientAccountAgingController', function () {
  var ctrl, scope, localize, controller;
  var q;

  // function to create instance for the controller
  function createController() {
    ctrl = controller('PatientAccountAgingController', {
      $scope: scope,
      localize: localize,
    });
  }

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();

    controller = $controller;

    localize = $injector.get('localize');

    // graph data container
    scope.graphData = {
      moreThanThirtyBalance: 30,
      moreThanSixtyBalance: 60,
      moreThanNintyBalance: 90,
      currentBalance: 100,
    };

    //create controller
    createController();
  }));

  //controller
  it('PatientAccountAgingController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('notifyNotAuthorized function->', function () {
    it('should throw error message when called', function () {
      scope.graphId = 1;
      scope.graphData = {
        moreThanThirtyBalance: 50,
        moreThanSixtyBalance: 10,
        moreThanNintyBalance: 30,
        currentBalance: 90,
      };
      createController();
      expect(scope.chartId).toBe('chart1');
    });
  });

  describe('graphData watch ->', function () {
    it('should call loadChart if there is any change in $scope.graphData', function () {
      scope.graphData = {
        moreThanThirtyBalance: 50,
        moreThanSixtyBalance: 10,
        moreThanNintyBalance: 30,
        currentBalance: 90,
      };

      scope.$apply();

      scope.graphData = {
        moreThanThirtyBalance: 60,
        moreThanSixtyBalance: 10,
        moreThanNintyBalance: 30,
        currentBalance: 90,
      };
      spyOn(ctrl, 'loadChart');
      scope.$apply();

      expect(ctrl.loadChart).toHaveBeenCalled();
    });
  });
});
