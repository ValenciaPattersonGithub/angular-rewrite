describe('Controller: SectionsAccordionController', function () {
  var controller, scope;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    controller = $controller('SectionsAccordionController', { $scope: scope });
  }));

  //controller
  it('should check if controller exists', function () {
    expect(controller).not.toBeNull();
  });

  //expandPane
  it('expandPane should expand the selected pane', function () {
    var pane = { id: 2, expanded: true };
    scope.panes = [
      { id: 1, expanded: true },
      { id: 2, expanded: true },
      { id: 3, expanded: true },
    ];

    scope.expandPane(pane);
    expect(scope.panes[0].expanded).toBe(false);
    expect(scope.panes[2].expanded).toBe(false);
  });

  //addPane

  it('addPane should add new pane to the UI', function () {
    var pane = { id: 4, expanded: true };
    scope.panes = [
      { id: 1, expanded: true },
      { id: 2, expanded: true },
      { id: 3, expanded: true },
    ];
    scope.addPane(pane);
    expect(scope.panes.length).toBe(4);
  });
});
