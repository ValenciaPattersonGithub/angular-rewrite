describe('set focus directive ->', function () {
  var parentScope, scope, element, $document, $timeout;

  beforeEach(module('common.directives'));

  beforeEach(inject(function ($rootScope, $compile, _$timeout_) {
    $timeout = _$timeout_;
    $document = angular.element(document);
    parentScope = $rootScope.$new();

    element = angular.element('<input set-focus /><a></a>');
    $document.find('body').append(element);

    $compile(element)(parentScope);
    parentScope.$digest();

    scope = element.scope();
  }));

  afterEach(function () {
    $document.find('body').html('');
  });

  it('should focus on input element', function () {
    scope.setTimeout();
    $timeout.flush();
    expect(document.activeElement.localName).toBe('input');
  });
});

describe('focus Enter  ->', function () {
  var parentScope, scope, element, $document;

  beforeEach(module('common.directives'));

  beforeEach(inject(function ($rootScope, $compile) {
    $document = angular.element(document);
    parentScope = $rootScope.$new();

    element = angular.element('<input focus-enter/><a></a>');
    $document.find('body').append(element);

    $compile(element)(parentScope);
    parentScope.$digest();

    scope = element.scope();
  }));

  afterEach(function () {
    $document.find('body').html('');
  });

  describe('focus enter ->', function () {
    var item;
    beforeEach(function () {
      item = $document.find('body > input');
    });

    it('should call activate with item', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');
      var keyArray = [13, 14];

      angular.forEach(keyArray, function (value) {
        e.keyCode = value;
        e.which = value;
        item.trigger(e);
        expect(e.preventDefault).toHaveBeenCalled();
      });
    });
  });
});
