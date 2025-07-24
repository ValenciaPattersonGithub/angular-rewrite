describe('undo support directive ->', function () {
  var el, scope, controller;

  beforeEach(inject(function ($compile, $rootScope) {
    scope = $rootScope;
    scope.section = '';
    el = angular.element('<undo-support></undo-support>');
    $compile(el)(scope);
    scope.$digest();
    controller = el.controller();
  }));

  it('should do something to the scope', function () {
    expect(scope).toBeDefined();
  });
});
