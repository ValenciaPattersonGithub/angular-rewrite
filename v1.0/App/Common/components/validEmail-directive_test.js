describe('validEmail directive ->', function () {
  var compile, scope, exceptionHandler, compileProvider;

  var element, form, inputElement;

  beforeEach(module('common.directives'));

  beforeEach(
    module(function (_$compileProvider_) {
      compileProvider = _$compileProvider_;
    })
  );

  beforeEach(inject(function (_$compile_, $rootScope, _$exceptionHandler_) {
    compile = _$compile_;
    exceptionHandler = _$exceptionHandler_;
    scope = $rootScope.$new();
  }));

  describe('when view value is undefined or null', function () {
    describe('and validEmailRequired is undefined or false,', function () {
      beforeEach(function () {
        scope.inputValue = '';
        element = compile(
          '<form name="form"><input valid-email ng-model="inputValue" id="inputValue" name="inputValue"/></form>'
        )(scope);

        form = scope.form;
        inputElement = element.find('input');
      });

      it('should initialize the view value to an empty string and return it.', function () {
        form.inputValue.$setViewValue(null);
        scope.$digest();
        scope.$apply();

        expect(scope.inputValue).toEqual('');
      });

      it('should mark the element as valid.', function () {
        form.inputValue.$setViewValue(null);
        scope.$digest();

        expect(form.inputValue.$invalid).toBe(false);
      });
    });

    describe('and validEmailRequired is true,', function () {
      beforeEach(function () {
        scope.inputValue = '';
        element = compile(
          '<form name="form"><input valid-email valid-email-required="true" ng-model="inputValue" id="inputValue" name="inputValue"/></form>'
        )(scope);

        form = scope.form;
        inputElement = element.find('input');
      });

      it('should initialize the view value to an empty string and return it.', function () {
        form.inputValue.$setViewValue(null);
        scope.$digest();
        scope.$apply();

        expect(scope.inputValue).toBeNull();
      });

      it('should mark the element as invalid.', function () {
        form.inputValue.$setViewValue(null);
        scope.$digest();

        expect(form.inputValue.$invalid).toBe(true);
      });
    });
  });

  describe('when view value has a value', function () {
    beforeEach(function () {
      scope.inputValue = '';
      element = compile(
        '<form name="form"><input valid-email ng-model="inputValue" id="inputValue" name="inputValue"/></form>'
      )(scope);

      form = scope.form;
      inputElement = element.find('input');
    });

    describe('and its length is > 256 characters,', function () {
      it('should mark the element as invalid.', function () {
        // 260 characters
        form.inputValue.$setViewValue(
          'email@1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890.com'
        );
        scope.$digest();

        expect(form.inputValue.$invalid).toBe(true);
      });
    });

    describe('and its length is < 5 characters,', function () {
      it('should mark the element as invalid.', function () {
        // 4 characters
        form.inputValue.$setViewValue('1@2.');
        scope.$digest();

        expect(form.inputValue.$invalid).toBe(true);
      });
    });

    describe('when view value is an invalid email,', function () {
      it('should mark the element as invalid.', function () {
        form.inputValue.$setViewValue('one@@two.three');
        scope.$digest();

        expect(form.inputValue.$invalid).toBe(true);
      });
    });

    describe('when view value is a valid email,', function () {
      it('should mark the element as valid.', function () {
        form.inputValue.$setViewValue('one@two.three');
        scope.$digest();

        expect(form.inputValue.$invalid).toBe(false);
      });
    });
  });

  describe('when tenant attribute is passed', function () {
    it('should mark element as valid if valid tenant is passed', function () {
      scope.inputValue = 'test';
      element = compile(
        '<form name="form"><input valid-email tenant="this.com" ng-model="inputValue" name="inputValue"/></form>'
      )(scope);
      form = scope.form;
      inputElement = element.find('input');
      expect(form.inputValue.$invalid).toBe(false);
    });

    it('should mark element as invalid if invalid tenant is passed.', function () {
      scope.inputValue = 'test';
      element = compile(
        '<form name="form"><input valid-email tenant="bad" ng-model="inputValue" name="inputValue"/></form>'
      )(scope);
      form = scope.form;
      inputElement = element.find('input');
      expect(form.inputValue.$invalid).toBe(false);
    });
  });
});
