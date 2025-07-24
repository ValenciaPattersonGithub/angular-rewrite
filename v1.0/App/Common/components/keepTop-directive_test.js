describe('keepTop tests -> ', function () {
  var compile, scope, element, headerElement, el;

  beforeEach(inject(function (_$compile_, $rootScope) {
    compile = _$compile_;
    scope = $rootScope.$new();
    element = compile(
      '<form name="form"><div id="header" class="" style="height:50px;" keep-top></form>'
    )(scope);
    headerElement = element.find('#header');
  }));

  describe('keepTop -> ', function () {
    beforeEach(inject(function () {
      el = compile(
        '<form name="form2"><div id="element" class="" keep-top></form>'
      )(scope);
      el = el.find('#element');
    }));

    it('should set defaults', function () {
      expect(headerElement.height()).toBe(50);
    });

    it('should set top to scrollTop', function () {
      el.offset({ top: 50 });
      scope.keepTop(30);
      var top = el.css('top');
      expect(top).toBe('50px');
    });

    it('should set top to scrollTop', function () {
      el.offset({ top: 150 });
      scope.keepTop(60);
      var top = el.css('top');
      expect(top).toBe('150px');
    });
  });
});

describe('keepTopNoOffset tests -> ', function () {
  var compile, scope, element, headerElement;

  beforeEach(inject(function (_$compile_, $rootScope) {
    compile = _$compile_;
    scope = $rootScope.$new();
    element = compile(
      '<form name="form"><div id="header" class="" keep-top-no-offset></form>'
    )(scope);
    headerElement = element.find('#header');
  }));

  describe('initial values -> ', function () {
    it('should set css', function () {
      var zIndex = headerElement.css('z-index');
      var pos = headerElement.css('position');
      expect(zIndex).toBe('20');
      expect(pos).toBe('relative');
    });
  });

  describe('keepTop -> ', function () {
    it('should set top', function () {
      scope.keepTop(200);
      var top = headerElement.css('top');
      expect(top).toBe('200px');
    });
  });
});

describe('keepTopFull tests -> ', function () {
  var compile, scope, element, headerElement;

  beforeEach(inject(function (_$compile_, $rootScope) {
    compile = _$compile_;
    scope = $rootScope.$new();
    element = compile(
      '<form name="form"><div id="header" class="" style="height:50px;" keep-top-full></form>'
    )(scope);
    headerElement = element.find('#header');
  }));

  it('should set defaults', function () {
    expect(headerElement.height()).toBe(50);
  });

  it('should set top to scrollTop', function () {
    element.offset({ top: 50 });
    scope.keepTop(30);
    var top = element.css('top');
    expect(top).toBe('50px');
  });

  it('should set top to scrollTop', function () {
    element.offset({ top: 150 });
    scope.keepTop(60);
    var top = element.css('top');
    expect(top).toBe('150px');
  });
});

describe('resize tests -> ', function () {
  var compile, scope, element, headerElement;

  beforeEach(inject(function (_$compile_, $rootScope, $window) {
    $window.innerHeight = 1920;
    compile = _$compile_;
    scope = $rootScope.$new();
  }));

  describe('resize -> ', function () {
    it('should calculate and set element height when window res is 1920X 1080 when initial-height=500', function () {
      // set initial height of header element to 500
      element = compile(
        '<form name="form"><div id="header" class="" resize initial-width="500" initial-height="500"></form>'
      )(scope);
      headerElement = element.find('#header');
      // use compile to render the html and get the isolate scope
      compile(element)(scope);
      scope.$digest();
      scope = element.isolateScope() || element.scope();

      var pos = headerElement.css('height');
      expect(pos).toBe(1340 - 38 + 'px');
    });

    it('should calculate and set element height when window res is 1920X 1080 when initial-height=975', function () {
      // set initial height of header element to 900
      element = compile(
        '<form name="form"><div id="header" class="" resize initial-width="500" initial-height="975"></form>'
      )(scope);
      headerElement = element.find('#header');
      // use compile to render the html and get the isolate scope
      compile(element)(scope);
      scope.$digest();
      scope = element.isolateScope() || element.scope();

      var pos = headerElement.css('height');
      expect(pos).toBe(1815 - 38 + 'px');
    });
  });
});
