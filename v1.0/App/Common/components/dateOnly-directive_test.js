describe('date only directive ->', function () {
  var compile, scope;

  var element, inputElement;

  beforeEach(module('common.directives'));

  beforeEach(inject(function (_$compile_, $rootScope) {
    compile = _$compile_;
    scope = $rootScope.$new();
  }));

  beforeEach(function () {
    scope.inputValue = '';
    scope.tempDate = '';
    element = compile(
      '<form>' +
        '<input id="{{inputId}}" placeholder="{{placeholder}}" type="text" name="datePicker" date-only ' +
        'ng-class="{error: !valid && onBlurCalled}" maxlength="10" class="date-selector-input" uib-datepicker-popup="{{format}}" ' +
        'datepicker-mode="mode" show-button-bar="false" ng-model="tempDate" is-open="opened" datepicker-options="dateOptions" ' +
        'ng-blur="onBlurCalled = true" min-date="{{min}}" max-date="{{max}}" ng-disabled="disableDateInput == false" />' +
        '</form>'
    )(scope);

    inputElement = element.find('input');
  });

  describe('preventDefault function -> ', function () {
    it('should not call when backspace, delete, tab, escape, enter', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      var keyArray = [46, 8, 9, 27, 13];

      angular.forEach(keyArray, function (value) {
        e.keyCode = value;
        inputElement.trigger(e);

        expect(e.preventDefault).not.toHaveBeenCalled();
      });
    });

    it('should not call when ctrl+A is pressed down', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      e.ctrlKey = true;
      e.keyCode = 65;
      inputElement.trigger(e);

      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('should not call when home, end, left, right', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      var keyArray = [35, 36, 37, 38, 39];

      angular.forEach(keyArray, function (value) {
        e.keyCode = value;
        inputElement.trigger(e);

        expect(e.preventDefault).not.toHaveBeenCalled();
      });
    });

    it('should not call when number is pressed', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      e.keyCode = 48;
      inputElement.trigger(e);

      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('should call when shiftKey and not a number is pressed', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      e.shiftKey = true;
      e.keyCode = 60;
      inputElement.trigger(e);

      expect(e.preventDefault).toHaveBeenCalled();
    });

    it('should call when shiftKey and a number is pressed', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      e.shiftKey = true;
      e.keyCode = 48;
      inputElement.trigger(e);

      expect(e.preventDefault).toHaveBeenCalled();
    });
  });

  describe('When length is greater than 2 -> ', function () {
    it('should call when shiftKey and a number is pressed', function () {
      var e = $.Event('keydown');

      e.target = { value: '01' };
      e.keyCode = 48;
      inputElement.trigger(e);

      expect(e.target.value).toEqual('01/');
    });
  });

  describe('When length is greater than 5 -> ', function () {
    it('should call when shiftKey and a number is pressed', function () {
      var e = $.Event('keydown');

      e.target = { value: '01/04' };
      e.keyCode = 50;
      inputElement.trigger(e);

      expect(e.target.value).toEqual('01/04/');
    });
  });
});
