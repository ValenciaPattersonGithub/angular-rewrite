describe('typeahead controller->', function () {
  var element,
    compile,
    rootScope,
    scope,
    iso,
    ctrl,
    timeout,
    patientValidationFactory,
    locationsFactory,
    loadHtml;
  var mockItems = [
    { Id: 1, Item: 'ItemOne' },
    { Id: 2, Item: 'ItemTwo' },
    { Id: 3, Item: 'ItemThree' },
    { Id: 4, Item: 'ItemFour' },
  ];

  beforeEach(module('common.controllers'));
  beforeEach(module('common.directives'));
  beforeEach(module('soar.templates'));
  beforeEach(
    module('Soar.Common', function ($provide) {
      patientValidationFactory = {
        ObservePatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        GetPatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        CheckPatientLocation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      locationsFactory = {
        UserLocations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('LocationsFactory', locationsFactory);

      loadHtml = function () {
        element = angular.element(
          '<typeahead id="test" class="typeahead soar-typeahead" disable-input="items.length >= 4" ' +
            'cancel="cancelSearch()" search="search(term)" select="select(item)" items="items" term="searchText" ' +
            'loading="searchExecuting" placeholder="item search">' +
            '<ul id="lstItems" soar-infinite-scroll="search(searchText, true)" ng-show="items.length > 0">' +
            '    <li ng-repeat="item in items" typeahead-item="item">' +
            '</li></ul></typeahead>'
        );

        // use compile to render the html
        compile(element)(scope);
        scope.items = mockItems;
        scope.$digest();

        // get the controller for the directive
        ctrl = element.controller('typeahead');
        scope = element.isolateScope() || element.scope();
        scope.term = 'item';
      };
    })
  );
  beforeEach(inject(function ($compile, $rootScope, $templateCache, $timeout) {
    compile = $compile;
    rootScope = $rootScope;
    scope = rootScope.$new();
    timeout = $timeout;
    loadHtml();
  }));

  describe('directive ->', function () {
    it('should have a class of typeahead-form', function () {
      expect(element.length).toBe(1);
      expect(element.children().eq(0).hasClass('typeahead-form')).toBe(true);
    });
  });

  describe('controller ->', function () {
    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should initialize properties', function () {
      expect(scope.hide).toBe(false);
      scope.mouseover = false;
      scope.focused = true;
      expect(scope.isVisible()).toBe(true);
    });

    describe('activate function ->', function () {
      it('should set item to active ', function () {
        ctrl.activate(scope.items[1]);
        expect(scope.active).toBe(scope.items[1]);
      });

      it('should set isActive true if item is active', function () {
        ctrl.activate(scope.items[1]);
        expect(scope.active).toBe(scope.items[1]);
        expect(ctrl.isActive(scope.items[1])).toBe(true);
      });

      it('should set isActive false if item is not active', function () {
        ctrl.activate(scope.items[1]);
        expect(scope.active).toBe(scope.items[1]);
        expect(ctrl.isActive(scope.items[0])).toBe(false);
        expect(ctrl.isActive(scope.items[2])).toBe(false);
      });
    });

    describe('activateNextItem function ->', function () {
      it('should set next item to active ', function () {
        ctrl.activate(scope.items[1]);
        expect(scope.active).toBe(scope.items[1]);
        ctrl.activateNextItem();
        expect(scope.active).toBe(scope.items[2]);
      });
    });

    describe('activatePreviousItem function ->', function () {
      it('should set next item to active ', function () {
        ctrl.activate(scope.items[2]);
        expect(scope.active).toBe(scope.items[2]);
        ctrl.activatePreviousItem();
        expect(scope.active).toBe(scope.items[1]);
      });
    });

    describe('isActive function ->', function () {
      it('should set next item to active ', function () {
        ctrl.activate(scope.items[2]);
        expect(ctrl.isActive(scope.items[1])).toBe(false);
        expect(ctrl.isActive(scope.items[2])).toBe(true);
        expect(ctrl.isActive(scope.items[3])).toBe(false);
      });
    });

    describe('selectActive function ->', function () {
      it('should select active item and set focus ', function () {
        ctrl.activate(scope.items[2]);
        ctrl.selectActive();
        expect(scope.focused).toBe(true);
        expect(scope.hide).toBe(true);
      });
    });

    describe('select function ->', function () {
      it('should select item and set focus ', function () {
        ctrl.select(scope.items[2]);
        expect(scope.focused).toBe(true);
        expect(scope.hide).toBe(true);
      });
    });

    describe('query function ->', function () {
      it('should set hide to false when ', function () {
        spyOn(scope, 'search');
        ctrl.activate(scope.items[1]);
        scope.query();
        expect(scope.hide).toBe(false);
        expect(scope.search).toHaveBeenCalledWith({ term: scope.term });
      });
    });

    describe('cancel function ->', function () {
      it('should set hide to false and call parent cancel ', function () {
        spyOn(scope, 'cancel');
        ctrl.cancel();
        expect(scope.hide).toBe(true);
        expect(scope.cancel).toHaveBeenCalled();
      });
    });

    describe('isVisible function ->', function () {
      it('should return true if hide is false and focused or mouseover is true ', function () {
        scope.hide = false;
        scope.mouseover = false;
        scope.focused = true;
        var visible = scope.isVisible();
        expect(visible).toBe(true);
      });

      it('should return false if hide is true or focused and mouseover is false ', function () {
        scope.hide = true;
        scope.mouseover = false;
        scope.focused = false;
        var visible = scope.isVisible();
        expect(visible).toBe(false);

        scope.hide = false;
        scope.mouseover = false;
        scope.focused = false;
        visible = scope.isVisible();
        expect(visible).not.toBe(true);
      });
    });
  });
});

describe('typeahead directive link functions ->', function () {
  var element,
    compile,
    rootScope,
    scope,
    ctrl,
    inputElement,
    listElement,
    timeout,
    patientValidationFactory,
    locationsFactory;
  var mockItems = [
    { Id: 1, Item: 'ItemOne' },
    { Id: 2, Item: 'ItemTwo' },
    { Id: 3, Item: 'ItemThree' },
    { Id: 4, Item: 'ItemFour' },
  ];

  beforeEach(function () {
    jasmine.addMatchers({
      toHaveFocus: function () {
        this.message = function () {
          return (
            "Expected '" + angular.mock.dump(this.actual) + "' to have focus"
          );
        };

        return document.activeElement === this.actual[0];
      },
    });
  });

  beforeEach(module('common.controllers'));
  beforeEach(module('common.directives'));
  beforeEach(module('Soar.Common'));
  beforeEach(module('soar.templates'));
  beforeEach(
    module('Soar.Common', function ($provide) {
      patientValidationFactory = {
        ObservePatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        GetPatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        CheckPatientLocation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      locationsFactory = {
        UserLocations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('LocationsFactory', locationsFactory);
    })
  );

  var loadHtml = function () {
    element = angular.element(
      '<typeahead id="test" class="typeahead soar-typeahead" disable-input="items.length >= 4" ' +
        'cancel="cancelSearch()" search="search(term)" select="select(item)" items="items" term="searchText" ' +
        'loading="searchExecuting" placeholder="item search">' +
        '<ul id="lstItems" soar-infinite-scroll="search(searchText, true)" ng-show="items.length > 0">' +
        '    <li ng-repeat="item in items" typeahead-item="item">' +
        '</li></ul></typeahead>'
    );

    compile(element)(scope);
    scope.items = mockItems;
    scope.$digest();
    scope.focused = true;

    inputElement = element.find('input');
    listElement = element.find('> div');

    // get the controller for the directive
    ctrl = element.controller('typeahead');

    scope = element.isolateScope() || element.scope();
    scope.enterFunction = jasmine.createSpy();
  };
  beforeEach(inject(function ($compile, $rootScope, $templateCache, $timeout) {
    compile = $compile;
    rootScope = $rootScope;
    scope = rootScope.$new();
    timeout = $timeout;
    loadHtml();
    $templateCache.put('App/Common/components/typeahead/typeahead.html', '');
    $rootScope.$apply();
  }));

  it('should have its own scope', function () {
    expect(element.isolateScope()).toBeDefined();
  });

  describe('focus function -> ', function () {
    it('should set focused true', function () {
      var e = $.Event('focus');
      inputElement.triggerHandler(e);
      timeout.flush();
      expect(scope.focused).toBe(true);
    });
  });

  describe('blur function -> ', function () {
    it('should set focused false', function () {
      var e = $.Event('blur');
      inputElement.trigger(e);
      timeout.flush();
      expect(scope.focused).toBe(false);
    });
  });

  describe('mouseover function -> ', function () {
    it('should set mousedOver true', function () {
      var e = $.Event('mouseover');
      listElement.trigger(e);
      timeout.flush();
      expect(scope.mousedOver).toBe(true);
    });
  });

  describe('mouseleave function -> ', function () {
    it('should set mousedOver false', function () {
      var e = $.Event('mouseleave');
      listElement.trigger(e);
      timeout.flush();
      expect(scope.mousedOver).toBe(false);
    });
  });

  describe('keyup function -> ', function () {
    it('should call selectActive function when keyup enter', function () {
      var e = $.Event('keyup');
      spyOn(ctrl, 'selectActive');
      e.keyCode = 13;
      inputElement.trigger(e);
      expect(ctrl.selectActive).toHaveBeenCalled();
    });

    it('should call selectActive function when keyup exc', function () {
      var e = $.Event('keyup');
      //spyOn(scope, 'hide');
      e.keyCode = 27;
      inputElement.trigger(e);
      expect(scope.hide).toBe(true);
    });
  });

  describe('keydown function -> ', function () {
    it('should not call preventDefault function when backspace, escape, up, or down', function () {
      var e = $.Event('keydown');
      spyOn(e, 'preventDefault');
      var keyArray = [13, 27, 38, 40];

      angular.forEach(keyArray, function (value) {
        e.keyCode = value;
        inputElement.trigger(e);
        expect(e.preventDefault).toHaveBeenCalled();
      });
    });

    it('should call activateNextItem function when keydown down', function () {
      var e = $.Event('keydown');
      spyOn(ctrl, 'activateNextItem');
      e.keyCode = 40;
      inputElement.trigger(e);
      expect(ctrl.activateNextItem).toHaveBeenCalled();
    });

    it('should call activatePreviousItem function when keydown up', function () {
      var e = $.Event('keydown');
      spyOn(ctrl, 'activatePreviousItem');
      e.keyCode = 38;
      inputElement.trigger(e);
      expect(ctrl.activatePreviousItem).toHaveBeenCalled();
    });
  });

  describe('isVisible watch - >', function () {
    it('should call change list css if true', function () {
      // mock the input css
      scope.$digest();
      scope.hide = false;
      scope.focused = true;
      scope.isVisible();
      scope.$digest();
      expect(listElement.css('display')).toBe('block');
      expect(listElement.css('left')).toBe(inputElement.position().left + 'px');
      expect(listElement.css('min-width')).toBe(
        inputElement.prop('offsetWidth') + 'px'
      );
    });

    it('should call change list display to none if false', function () {
      // mock the input css
      scope.$digest();
      scope.hide = true;
      scope.focused = true;
      scope.isVisible();
      scope.$digest();
      expect(listElement.css('display')).toBe('none');
    });
  });

  describe('selectAutoFocus watch', function () {
    beforeEach(inject(function () {
      spyOn(ctrl, 'clickFunction');
    }));

    it("should not call controller's clickFunction when selectAutoFocus does not exists", function () {
      scope.selectAutoFocus = undefined;
      scope.$apply();
      timeout.flush(1);
      scope.selectAutoFocus = null;
      scope.$apply();
      timeout.flush(1);

      expect(ctrl.clickFunction).not.toHaveBeenCalled();
    });

    it("should not call controller's clickFunction when selectAutoFocus.value is false", function () {
      scope.selectAutoFocus = { value: null };
      scope.$apply();
      timeout.flush(1);
      scope.selectAutoFocus = { value: false };
      scope.$apply();
      timeout.flush(1);

      expect(ctrl.clickFunction).not.toHaveBeenCalled();
    });

    it("should call controller's clickFunction when selectAutoFocus.value is true", function () {
      scope.selectAutoFocus = { value: null };
      scope.$apply();
      timeout.flush(1);
      scope.selectAutoFocus = { value: true };
      scope.$apply();
      timeout.flush(1);

      expect(ctrl.clickFunction).toHaveBeenCalled();
    });
  });
});

describe('typeaheadItem directive link functions->', function () {
  var element,
    compile,
    rootScope,
    scope,
    ctrl,
    itemElements,
    timeout,
    patientValidationFactory,
    locationsFactory;
  var mockItems = [
    { Id: 1, Item: 'ItemOne' },
    { Id: 2, Item: 'ItemTwo' },
    { Id: 3, Item: 'ItemThree' },
    { Id: 4, Item: 'ItemFour' },
  ];

  beforeEach(module('common.controllers'));
  beforeEach(module('common.directives'));
  beforeEach(module('soar.templates'));
  beforeEach(
    module('Soar.Common', function ($provide) {
      patientValidationFactory = {
        ObservePatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        GetPatientData: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        CheckPatientLocation: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);

      locationsFactory = {
        UserLocations: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value('LocationsFactory', locationsFactory);
    })
  );

  beforeEach(inject(function ($compile, $rootScope, $templateCache, $timeout) {
    element = angular.element(
      '<typeahead id="test" class="typeahead soar-typeahead" disable-input="items.length >= 4" ' +
        'cancel="cancelSearch()" search="search(term)" select="select(item)" items="items" term="searchText" ' +
        'loading="searchExecuting" placeholder="item search">' +
        '<ul id="lstItems" soar-infinite-scroll="search(searchText, true)" ng-show="items.length > 0">' +
        '    <li ng-repeat="item in items" typeahead-item="item">' +
        '</li></ul></typeahead>'
    );

    rootScope = $rootScope;
    scope = rootScope.$new();
    compile = $compile;
    compile(element)(scope);
    scope.items = mockItems;
    $rootScope.$digest();
    ctrl = element.controller('typeahead');
    scope = element.isolateScope() || element.scope();
    itemElements = element.find('li');
    timeout = $timeout;
  }));

  describe('mouseenter event -> ', function () {
    var item;

    describe('if scope.enableMouseEnter is true ->', function () {
      beforeEach(function () {
        item = itemElements.eq(0);
        var e = $.Event('mousemove');
        item.trigger(e);
        timeout.flush();
      });

      it('should call activate with item', function () {
        spyOn(ctrl, 'activate');
        var e = $.Event('mouseenter');
        itemElements.eq(0).trigger(e);
        timeout.flush();
        expect(ctrl.activate).toHaveBeenCalled();
      });
    });

    describe('if scope.enableMouseEnter is not true ->', function () {
      it('should not call activate with item', function () {
        spyOn(ctrl, 'activate');
        var e = $.Event('mouseenter');
        itemElements.eq(0).trigger(e);
        timeout.flush();
        expect(ctrl.activate).not.toHaveBeenCalled();
      });
    });
  });

  describe('click event -> ', function () {
    it('should call select with item', function () {
      spyOn(ctrl, 'select');
      var e = $.Event('click');
      itemElements.eq(0).trigger(e);
      timeout.flush();
      expect(ctrl.select).toHaveBeenCalled();
    });
  });
});
