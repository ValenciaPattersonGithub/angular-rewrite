describe('capitalizeFirst directive tests -> ', function () {
  beforeEach(module('Soar.Common'));
});

describe('capitalizeFirstWithOverride directive tests ->', function () {
  var compile, scope, element, form, inputElement, rootScope, timeout;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.directives'));

  beforeEach(inject(function ($compile, $rootScope, $templateCache, $timeout) {
    compile = $compile;
    timeout = $timeout;
    rootScope = $rootScope;
    scope = rootScope.$new();
    scope.capitalizationOn = true;

    scope.inputValue = '';
    element = compile(
      '<form name="form"><div>' +
        ' <input class="form-input" id="inputValue" name="inputValue" type="text" ng-model="inputValue" capitalize-first-with-override /> ' +
        '</div></form>'
    )(scope);
    form = scope.form;
    compile(element)(scope);
    scope.$digest();
    scope = element.isolateScope() || element.scope();
    inputElement = element.find('input');
  }));

  describe('keyup function -> ', function () {
    it('should set capitalizationOn to false if backspace key is hit', function () {
      scope.capitalizationOn = true;
      var e = $.Event('keyup');
      spyOn(e, 'preventDefault');
      e.ctrlKey = true;
      e.keyCode = 8;
      inputElement.trigger(e);
      timeout.flush();
      timeout.verifyNoPendingTasks();

      expect(scope.capitalizationOn).toBe(false);
    });
  });

  describe('blur function -> ', function () {
    it('should set capitalizationOn to true on blur', function () {
      scope.capitalizationOn = false;
      var e = $.Event('blur');
      inputElement.trigger(e);
      timeout.flush();
      timeout.verifyNoPendingTasks();
      expect(scope.capitalizationOn).toBe(true);
    });
  });

  describe('capitalize function -> ', function () {
    it('should set first letter in first word capitalized if capitalizationOn is true', function () {
      scope.capitalizationOn = true;
      scope.inputValue = 'b';
      element = compile(
        '<form name="form"><div>' +
          ' <input class="form-input" id="inputValue" name="inputValue" type="text" ng-model="inputValue" capitalize-first-with-override /> ' +
          '</div></form>'
      )(scope);
      form = scope.form;
      compile(element)(scope);
      scope.$digest();
      expect(scope.form.inputValue.$viewValue).toBe('B');
    });

    it('should not set first letter in first word capitalized if capitalizationOn is false', function () {
      scope.capitalizationOn = false;
      scope.inputValue = 'b';
      element = compile(
        '<form name="form"><div>' +
          ' <input class="form-input" id="inputValue" name="inputValue" type="text" ng-model="inputValue" ccapitalize-first-with-override /> ' +
          '</div></form>'
      )(scope);
      form = scope.form;
      compile(element)(scope);
      scope.$digest();
      expect(scope.form.inputValue.$viewValue).toBe('b');
    });
  });
});
