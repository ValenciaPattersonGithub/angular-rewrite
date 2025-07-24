describe('validEmail directive ->', function () {
  var compile, rootScope, scope;

  beforeEach(module('common.directives'));
  beforeEach(module('soar.templates'));

  beforeEach(inject(function ($compile, $rootScope) {
    compile = $compile;
    rootScope = $rootScope;
    scope = rootScope.$new();
    scope.emailAddress = '';
    var html =
      '<form name="form"><input name="email" type="text" ng-model="emailAddress" valid-email /></form>';
    var element = compile(html)(scope);
    rootScope.$digest();
  }));

  it('invalid email - should set email field to invalid', function () {
    scope.form.email.$setViewValue('^&T%*^n67');
    rootScope.$digest();
    expect(scope.form.email.$valid).toBe(false);
  });

  it('valid email - should set email field to valid', function () {
    scope.form.email.$setViewValue('a@a.com');
    rootScope.$digest();
    expect(scope.form.email.$valid).toBe(true);
  });

  it('empty email - should set email field to valid', function () {
    scope.form.email.$setViewValue('');
    rootScope.$digest();
    expect(scope.form.email.$valid).toBe(true);
  });

  it('too long - should set email field to invalid', function () {
    var email257 =
      '11111111111111111111111111111111111111111111111111' +
      '11111111111111111111111111111111111111111111111111' +
      '11111111111111111111111111111111111111111111111111' +
      '11111111111111111111111111111111111111111111111111' +
      '11111111111111111111111111111111111111111111111111' +
      '@1.comm';
    scope.form.email.$setViewValue(email257);
    rootScope.$digest();
    expect(scope.form.email.$valid).toBe(false);
  });

  it('almost too long - should set email field to valid', function () {
    var email256 =
      '11111111111111111111111111111111111111111111111111' +
      '11111111111111111111111111111111111111111111111111' +
      '11111111111111111111111111111111111111111111111111' +
      '11111111111111111111111111111111111111111111111111' +
      '11111111111111111111111111111111111111111111111111' +
      '@1.com';
    scope.form.email.$setViewValue(email256);
    rootScope.$digest();
    expect(scope.form.email.$valid).toBe(true);
  });
});
