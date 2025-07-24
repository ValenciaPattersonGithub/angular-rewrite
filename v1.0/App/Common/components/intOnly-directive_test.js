describe('int only directive ->', function () {
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
      '<form name="form"><input type="number" class="form-control" ints-only ng-model="number" name="aNumber" id="aNumber" /></form>'
    )(scope);

    form = scope.form;
    inputElement = element.find('input');
  });

  it('should capture the mousedown event', function () {
    spyOn(scope, 'handleKeydownEvent');

    var e = $.Event('keydown');
    e.which = 49;
    inputElement.trigger(e);

    expect(scope.handleKeydownEvent).toHaveBeenCalled();
  });

  describe('handleKeydownEvent function -> ', function () {
    it('should not call preventDefault function when backspace, delete, tab, escape, enter and .', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      var keyArray = [46, 8, 9, 27, 13, 110, 190];

      angular.forEach(keyArray, function (value) {
        e.keyCode = value;
        scope.handleKeydownEvent(e);

        expect(e.preventDefault).not.toHaveBeenCalled();
      });
    });

    it('should not call preventDefault function when ctrl+A is pressed down', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      e.ctrlKey = true;
      e.keyCode = 65;
      scope.handleKeydownEvent(e);

      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('should not call preventDefault function when home, end, left, right', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      var keyArray = [35, 36, 37, 38, 39];

      angular.forEach(keyArray, function (value) {
        e.keyCode = value;
        scope.handleKeydownEvent(e);

        expect(e.preventDefault).not.toHaveBeenCalled();
      });
    });

    it('should not call preventDefault function when number is pressed', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      e.keyCode = 48;
      scope.handleKeydownEvent(e);

      expect(e.preventDefault).not.toHaveBeenCalled();
    });

    it('should call preventDefault function when shiftKey and not a number is pressed', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      e.shiftKey = true;
      e.keyCode = 60;
      scope.handleKeydownEvent(e);

      expect(e.preventDefault).toHaveBeenCalled();
    });

    it('should call preventDefault function when shiftKey and a number is pressed', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');

      e.shiftKey = true;
      e.keyCode = 48;
      scope.handleKeydownEvent(e);

      expect(e.preventDefault).toHaveBeenCalled();
    });
  });
});
