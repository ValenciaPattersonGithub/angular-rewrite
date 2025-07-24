describe('toggleSwitch directive ->', function () {
  var element;
  var compile;
  var rootScope;
  var scope;

  beforeEach(module('common.directives'));
  beforeEach(module('soar.templates'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache) {
    compile = $compile;
    rootScope = $rootScope;
    scope = rootScope.$new();
  }));

  it('should inject template when compiled', function () {
    var toggleClass = 'toggle',
      switchId = 'switch';
    element = angular.element(
      '<toggle-switch switch-id="' +
        switchId +
        '" toggle-class="' +
        toggleClass +
        '" ng-model="model" true-text="true" false-text="false"></toggle-switch>'
    );
    compile(element)(scope);
    rootScope.$digest();

    var label = angular.element('label#' + switchId, element);

    expect(label.length).toBe(1);
    expect(label.hasClass(toggleClass + '-label')).toBe(true);
  });
});
