describe('soarInfiniteScroll directive ->', function () {
  var compile, scope, exceptionHandler, compileProvider;

  var element;
  var soarInfinteScrollFunction;

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
    scope.testFunction = function () {};
    spyOn(scope, 'testFunction');

    element = compile('<div soar-infinite-scroll="testFunction()"></div>')(
      scope
    );
    soarInfinteScrollFunction =
      element[0].attributes['soar-infinite-scroll'].value;

    scope.$digest();
  });

  it('should capture the scroll event', function () {
    spyOn(scope, 'handleScrollEvent');

    var e = $.Event('scroll');
    element.trigger(e);

    expect(scope.handleScrollEvent).toHaveBeenCalled();
    expect(soarInfinteScrollFunction).toBe('testFunction()');
  });

  describe('handleScrollEvent ->', function () {
    describe('when scrollTop + offsetHeight >= scrollHeight', function () {
      it('should apply the javascript specified to the scope', function () {
        spyOn(scope, '$apply');

        scope.handleScrollEvent();

        expect(scope.$apply).toHaveBeenCalledWith(soarInfinteScrollFunction);
      });
    });
  });
});
