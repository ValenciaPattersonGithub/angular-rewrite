describe('NoResultsController tests ->', function () {
  var scope, ctrl, rootScope, localize, element, compile;
  beforeEach(module('common.controllers'));
  beforeEach(module('common.directives'));

  beforeEach(inject(function ($rootScope, $controller, $injector, $compile) {
    rootScope = $rootScope;
    compile = $compile;
    scope = $rootScope.$new();
    localize = $injector.get('localize');
    ctrl = $controller('NoResultsController', {
      localize: localize,
      $scope: scope,
    });
  }));

  var loadHtml = function () {
    element = angular.element(
      '<div id="lblDefaultMessage" class="text-align-center text-muted"> ' +
        '<div ng-show="!loading" ng-bind-html="message | i18n"></div> ' +
        '<i id="iDefaultMessage" ng-show="loading" class="fa fa-spinner fa-spin loading"></i>' +
        '</div>'
    );

    // use compile to render the html
    compile(element)(scope);
    scope.$digest();
    scope = element.isolateScope() || element.scope();
  };

  describe('setDefaultMessage function ->', function () {
    it('should set filteringMessage to default if no filteringMessage passed to directive ', function () {
      scope.filteringMessage = null;
      scope.setDefaultMessage();
      expect(scope.filteringMessage).toEqual(
        'There are no results that match the filter.'
      );
    });

    it('should set loadingMessage to default if no loadingMessage passed to directive ', function () {
      scope.loadingMessage = null;
      scope.setDefaultMessage();
      expect(scope.loadingMessage).toEqual('There are no results.');
    });
  });

  describe('filtering $watch ->', function () {
    it('should set message to filtering message if filtering', function () {
      scope.message = '';
      scope.filtering = false;
      scope.$apply();
      scope.filteringMessage = 'Now we are filtering';
      scope.filtering = true;

      scope.$apply();
      expect(scope.message).toEqual(scope.filteringMessage);
    });
  });

  describe('loading $watch ->', function () {
    it('should set message to loading message if loading', function () {
      scope.loadingMessage = 'Now we are loading';
      scope.loading = false;

      expect(scope.message).toBe(undefined);
      scope.loading = true;
      scope.$apply();
      expect(scope.message).toEqual(scope.loadingMessage);
    });

    it('should set message to filtering message if filtering', function () {
      scope.loadingMessage = 'Now we are filtering';
      scope.filtering = false;

      expect(scope.message).toBe(undefined);
      scope.filtering = true;
      scope.$apply();
      expect(scope.message).toEqual(scope.filteringMessage);
    });
  });

  describe('animation ->', function () {
    it('should set class if loading', function () {
      loadHtml();
      scope.loading = true;
      var iElement = element.find('i');
      expect(iElement.hasClass('fa fa-spinner fa-spin loading')).toBe(true);
    });

    it('should not display if not loading', function () {
      loadHtml();
      scope.loading = false;
      var iElement = element.find('i');
      expect(iElement.hasClass('ng-hide')).toBe(true);
    });
  });
});
