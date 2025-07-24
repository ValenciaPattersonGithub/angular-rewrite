// test suite
describe('localize-controller tests ->', function () {
  var scope;
  var ctrl;

  // before each set up any definitions to be createed before the specs are run...
  beforeEach(module('common.factories'));

  // inject the localize factory
  var _localize_ = {};
  beforeEach(
    module('common.controllers', function ($provide) {
      _localize_ = {
        setLanguage: jasmine.createSpy(),
      };
      $provide.value('localize', _localize_);
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('LocaleCtrl', { $scope: scope });
  }));

  // test specs
  it('should exist', function () {
    expect(ctrl).not.toBeNull();
  });

  it('should have a initLang function', function () {
    expect(angular.isFunction(scope.setLang)).toBe(true);
  });

  it('should have a setLang function', function () {
    expect(angular.isFunction(scope.initLang)).toBe(true);
  });

  it('initLang function should set initialize language to English', function () {
    scope.initLang();
    expect(scope.lang).toBe('English');
    expect(scope.initLanguage).toBe('en_us');
  });
});
