describe('zipField directive ->', function () {
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

  beforeEach(function () {
    scope.inputValue = '';
    element = compile(
      '<form name="form"><input zip-field="inputValue" ng-model="inputValue" id="inputValue" name="inputValue"/></form>'
    )(scope);

    form = scope.form;
    inputElement = element.find('input');
  });

  describe('handleValueChange ->', function () {
    describe('when new value is >5 characters long and does NOT contain a hyphen', function () {
      describe('and the old value does NOT contain a hyphen', function () {
        it('should insert a hyphen between the 5th and 6th characters', function () {
          scope.inputValue = '12345';
          scope.$apply();
          scope.inputValue = '123456';
          scope.$apply();

          expect(inputElement[0].value).toEqual('12345-6');
        });
      });
    });
  });

  describe('handleKeydownEvent ->', function () {
    var e;
    beforeEach(function () {
      e = $.Event('keydown');
      spyOn(e, 'preventDefault');
    });

    describe('when acceptable keys are pressed,', function () {
      it('preventDefault should NOT be called', function () {
        var acceptableKeys = [
          { keyCode: 8, ctrlKey: false, shiftKey: false }, // backspace
          { keyCode: 9, ctrlKey: false, shiftKey: false }, // tab
          { keyCode: 13, ctrlKey: false, shiftKey: false }, // enter
          { keyCode: 27, ctrlKey: false, shiftKey: false }, // escape
          { keyCode: 46, ctrlKey: false, shiftKey: false }, // delete
          { keyCode: 48, ctrlKey: false, shiftKey: false }, // 0
          { keyCode: 49, ctrlKey: false, shiftKey: false }, // 1
          { keyCode: 50, ctrlKey: false, shiftKey: false }, // 2
          { keyCode: 51, ctrlKey: false, shiftKey: false }, // 3
          { keyCode: 52, ctrlKey: false, shiftKey: false }, // 4
          { keyCode: 53, ctrlKey: false, shiftKey: false }, // 5
          { keyCode: 54, ctrlKey: false, shiftKey: false }, // 6
          { keyCode: 55, ctrlKey: false, shiftKey: false }, // 7
          { keyCode: 56, ctrlKey: false, shiftKey: false }, // 8
          { keyCode: 57, ctrlKey: false, shiftKey: false }, // 9
          { keyCode: 65, ctrlKey: true, shiftKey: false }, // ctrl + a
          { keyCode: 173, ctrlKey: false, shiftKey: false }, // - (hyphen / minus sign)
        ];

        angular.forEach(acceptableKeys, function (key) {
          e = $.extend(e, key);
          inputElement.trigger(e);

          expect(e.preventDefault).not.toHaveBeenCalled();
        });
      });
    });

    describe('when unacceptable keys are pressed,', function () {
      it('preventDefault should be called', function () {
        var unacceptableKeys = [
          { keyCode: 0, ctrlKey: false, shiftKey: true }, // shit key pressed
          { keyCode: 40, ctrlKey: false, shiftKey: false }, // down arrow
          { keyCode: 65, ctrlKey: false, shiftKey: false }, // a
          { keyCode: 90, ctrlKey: false, shiftKey: false }, // z
          { keyCode: 106, ctrlKey: false, shiftKey: false }, // asterix
          { keyCode: 189, ctrlKey: false, shiftKey: true }, // underscore
        ];

        angular.forEach(unacceptableKeys, function (key) {
          e = $.extend(e, key);
          inputElement.trigger(e);

          expect(e.preventDefault).toHaveBeenCalled();
        });
      });
    });
  });

  describe('handleUnshift ->', function () {
    describe('when view value is undefined or null', function () {
      it('should initialize the view value to an empty string and return it', function () {
        form.inputValue.$viewValue = null;
        scope.$digest();
        scope.$apply();

        expect(scope.inputValue).toEqual('');
      });

      it('should mark the element as valid', function () {
        form.inputValue.$setViewValue(null);
        scope.$digest();

        expect(form.inputValue.$invalid).toBe(false);
      });
    });

    describe('when value is greater than 11 characters long', function () {
      it('should mark the element as invalid', function () {
        form.inputValue.$setViewValue('123456789012');

        expect(form.inputValue.$invalid).toBe(true);
      });
    });

    describe('when value is less than or equal to 11 characters long', function () {
      describe('and when it matches the pattern', function () {
        it('should mark the element as invalid', function () {
          form.inputValue.$setViewValue('12345-6789');

          expect(form.inputValue.$invalid).toBe(false);
        });
      });

      describe('and when it does NOT match the pattern', function () {
        it('should mark the element as invalid', function () {
          form.inputValue.$setViewValue('1-2-3-4-5-6');

          expect(form.inputValue.$invalid).toBe(true);
        });
      });
    });
  });
});
