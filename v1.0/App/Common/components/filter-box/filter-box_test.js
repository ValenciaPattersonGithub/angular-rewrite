describe('filter-box ->', function () {
  var localize, scope, ctrl, filter;

  var list1Mock = [{}, {}];

  var list2Mock = [{}, {}];

  var filterObjectMock = {};

  var originalFilterObjectMock = {};

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.directives'));

  beforeEach(
    module('Soar.Common', function ($provide) {
      localize = {
        getLocalizedString: jasmine.createSpy(),
      };
      $provide.value('localize', localize);
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $filter) {
    filter = $injector.get('$filter');
    scope = $rootScope.$new();
    scope.list1 = angular.copy(list1Mock);
    scope.list2 = angular.copy(list2Mock);
    scope.filterObject = angular.copy(filterObjectMock);
    scope.originalFilterObject = angular.copy(originalFilterObjectMock);
    ctrl = $controller('FilterBoxController', {
      $scope: scope,
      $filter: filter,
    });
  }));

  describe('controller ->', function () {
    it('should initialize the controller', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('initial setup ->', function () {
    it('should set text values', function () {
      expect(ctrl.originalList1).toEqual(scope.list1);
      expect(ctrl.originalList2).toEqual(scope.list2);
      expect(ctrl.hasLoaded).toBe(false);
    });
  });

  describe('clearFilters function ->', function () {
    it('should reset filterObject to originalFilterObject', function () {
      expect(scope.filterObject).toEqual(scope.originalFilterObject);
      scope.filterObject.something = '10';
      expect(scope.filterObject).not.toEqual(scope.originalFilterObject);
      scope.clearFilters();
      expect(scope.filterObject).toEqual(scope.originalFilterObject);
    });
  });

  describe('hideFilters function ->', function () {
    it('should call angular.element', function () {
      var angularElement = { removeClass: jasmine.createSpy() };
      var temp = angular.element;
      angular.element = jasmine.createSpy().and.returnValue(angularElement);
      scope.hideFilters();
      expect(angular.element).toHaveBeenCalledWith('.slidePanel');
      expect(angularElement.removeClass).toHaveBeenCalledWith('open');
      angular.element = temp;
    });
  });

  describe('filterObject watch ->', function () {
    it('should set hasLoaded flag and emit', function () {
      spyOn(ctrl, 'runFilters');
      scope.filterObject.something = '14';
      scope.$apply();
      expect(ctrl.hasLoaded).toBe(true);
      expect(ctrl.runFilters).toHaveBeenCalledWith(scope.filterObject);
    });
  });

  describe('list1 watch ->', function () {
    it('should set ctrl.originalList1', function () {
      scope.$apply();
      expect(ctrl.originalList1).toEqual(scope.list1);
      scope.list1.push({});
      ctrl.originalList1.splice(0, ctrl.originalList1.length);
      scope.$apply();
      expect(ctrl.originalList1).toEqual(scope.list1);
    });
  });
});
