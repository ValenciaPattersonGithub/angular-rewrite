describe('ArchesController tests ->', function () {
  var ctrl, scope, parent, arches;

  arches = [
    {
      ArchName: 'UA',
    },
    {
      ArchName: 'LA',
    },
  ];

  beforeEach(module('Soar.Common'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    parent = $rootScope.$new();
    scope.$parent = {
      $parent: {
        activeArch: null,
        validateForm: function () {},
      },
    };
    scope.data = arches;
    ctrl = $controller('ArchesController', {
      $scope: scope,
    });
  }));

  describe('selectArch function -> ', function () {
    it('should set passed in arch to selected', function () {
      scope.selectArch(arches[0]);
      expect(arches[0].selected).toBe(true);
      expect(arches[1].selected).toBe(false);
    });

    it('should scope.$parent.$parent.activeArch to passed in arch', function () {
      scope.selectArch(arches[1]);
      expect(scope.$parent.$parent.activeArch).toBe(arches[1]);
    });
  });
});
