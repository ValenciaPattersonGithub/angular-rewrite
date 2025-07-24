describe('textAutoGrow directive ->', function () {
  var compile, parentScope, scope, exceptionHandler, compileProvider;

  var element, inputElement;

  beforeEach(module('common.directives'));

  beforeEach(
    module(function (_$compileProvider_) {
      compileProvider = _$compileProvider_;
    })
  );

  beforeEach(inject(function (_$compile_, $rootScope, _$exceptionHandler_) {
    compile = _$compile_;
    exceptionHandler = _$exceptionHandler_;
    parentScope = $rootScope.$new();
  }));

  beforeEach(function () {
    element = compile(
      '<form name="form"><textarea text-auto-grow type="number" class="form-control" ng-model="number" name="aNumber" id="aNumber" /></form>'
    )(parentScope);

    inputElement = element.find('textarea');
    scope = inputElement.scope();
  });

  //it('should capture the mousedown event', function () {
  //    spyOn(scope, 'handleKeydownEvent');

  //    var e = $.Event('keydown');
  //    e.which = 49;
  //    inputElement.trigger(e);

  //    expect(scope.handleKeydownEvent).toHaveBeenCalled();
  //});

  describe('Keydown event -> ', function () {
    it('should call preventDefault function when enter is pressed', function () {
      var e = $.Event('keydown');
      e.preventDefault = jasmine.createSpy();
      e.which = 13;
      inputElement.trigger(e);

      expect(e.preventDefault).toHaveBeenCalled();
    });

    it('should not call preventDefault function when enter is not pressed', function () {
      var e = $.Event('keydown');
      e.preventDefault = jasmine.createSpy();
      e.which = 49;
      inputElement.trigger(e);

      expect(e.preventDefault).not.toHaveBeenCalled();
    });
  });
});
