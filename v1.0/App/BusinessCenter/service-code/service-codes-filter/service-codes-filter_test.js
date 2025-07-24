describe('ServiceCodesFilterController ->', function () {
  var timeout, scope, ctrl, element, compile, localize;

  //#region mocks

  var mockServiceTypes = [
    {
      ServiceTypeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947',
      IsSystemType: true,
      Description: 'Adjunctive General Services',
      IsAssociatedWithServiceCode: false,
    },
    {
      ServiceTypeId: 'c44c441e-d3c5-47ff-83b3-617e7c59804c',
      IsSystemType: false,
      Description: 'custom servicetype',
      IsAssociatedWithServiceCode: false,
    },
    {
      ServiceTypeId: '9f8e66fa-350b-4970-8dfa-873a69e7f10f',
      IsSystemType: false,
      Description: 'custom servicetype2',
      IsAssociatedWithServiceCode: false,
    },
    {
      ServiceTypeId: 'cc08eb08-425d-43af-9d9d-ce976a208489',
      IsSystemType: true,
      Description: 'Diagnostic',
      IsAssociatedWithServiceCode: false,
    },
  ];

  //#endregion

  //#region ctrl

  beforeEach(module('Soar.Common'));
  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(module('soar.templates'));

  describe('when user is authorized -> ', function () {
    // Create controller and scope
    beforeEach(inject(function (
      $rootScope,
      $controller,
      $injector,
      $route,
      $routeParams,
      $compile,
      $timeout,
      $templateCache
    ) {
      timeout = $timeout;
      compile = $compile;
      scope = $rootScope.$new();

      ctrl = $controller('ServiceCodesFilterController', {
        $scope: scope,
      });
    }));

    //#region html

    var loadHtml = function () {
      element = angular.element(
        '<form name="frmTemp" role="form" novalidate>' +
          '<div class="serviceCodeSearch__filter-col">' +
          '<button id="btnShowFilters" ng-disabled="backupServiceCodes.length==0" type="button" class="btn btn-default" ng-click="showFilters()">{{ "Filter" | i18n }}</button>' +
          '<service-codes-filter sort-method="changeSortingForGrid" filtering="filteringServices" service-types="serviceTypes" items="serviceCodes" original-items="backupServiceCodes" filters-visible="filtersVisible"></service-codes-filter>' +
          '</div>' +
          '</form>'
      );

      // use compile to render the html
      compile(element)(scope);
      scope = element.isolateScope() || element.scope();
      scope.$digest();
    };

    //#endregion

    describe('controller ->', function () {
      it('should check if controller exists', function () {
        expect(ctrl).not.toBeNull();
      });

      it('should set scope properties', function () {
        expect(scope.showFiltering).toBe(true);
        expect(scope.sortField).toBe(null);
        expect(scope.filterObject).toEqual({
          ServiceTypes: [],
          IsSwiftPickCode: false,
          IsServiceCode: false,
          IsActive: false,
          IsInactive: false,
        });
      });
    });

    describe(' initializeController function->', function () {
      it('should call setDefaultFilter', function () {
        spyOn(scope, 'setDefaultFilter');
        ctrl.initializeController();
        scope.$apply();
        expect(scope.setDefaultFilter).toHaveBeenCalled();
      });
    });

    describe('data.SortField watch -> ', function () {
      it('should call sortMethod', function () {
        //loadHtml()
        //spyOn(scope, 'sortMethod');
        //scope.data = {
        //    SortByTypes: $scope.sortByTypes,
        //    SortField: $scope.sortField
        //};
        //scope.data.SortField = 'field1';
        //scope.$apply();
        //expect(scope.sortMethod).toHaveBeenCalled();
      });
    });

    describe('setDefaultFilter function ->', function () {
      it('should create filter object ', function () {
        scope.serviceTypes = angular.copy(mockServiceTypes);
        scope.setDefaultFilter();
        expect(scope.filterObject.ServiceTypes.length).toEqual(
          mockServiceTypes.length
        );
        expect(scope.filterObject.IsSwiftPickCode).toBe(false);
        expect(scope.filterObject.IsServiceCode).toBe(false);
        expect(scope.filterObject.IsActive).toBe(false);
        expect(scope.filterObject.IsInactive).toBe(false);
      });

      it('should make backup of filter object ', function () {
        scope.serviceTypes = angular.copy(mockServiceTypes);
        scope.setDefaultFilter();

        expect(scope.originalFilterObject.ServiceTypes.length).toEqual(
          mockServiceTypes.length
        );
        expect(scope.originalFilterObject.IsSwiftPickCode).toBe(false);
        expect(scope.originalFilterObject.IsServiceCode).toBe(false);
        expect(scope.originalFilterObject.IsActive).toBe(false);
        expect(scope.originalFilterObject.IsInactive).toBe(false);
      });

      it('should add FilterBy field to service Types ', function () {
        scope.serviceTypes = angular.copy(mockServiceTypes);
        scope.setDefaultFilter();
        expect(scope.filterObject.ServiceTypes[0].FilterBy).toBe(false);
      });
    });

    describe(' filterServiceCodes function->', function () {
      it('should return true if serviceCode.IsActive matches filterObject.IsActive', function () {
        scope.setDefaultFilter();
        scope.filterObject.IsActive = false;
        var serviceCode = {
          ServiceTypeId: 1,
          IsSwiftPickCode: false,
          IsActive: true,
        };
        var returnValue = scope.filterServiceCodes(serviceCode);

        expect(returnValue).toBe(true);
      });

      it('should return false if serviceCode.IsActive matches filterObject.IsInactive', function () {
        scope.setDefaultFilter();
        scope.filterObject.IsInactive = true;
        var serviceCode = {
          ServiceTypeId: 1,
          IsSwiftPickCode: false,
          IsActive: true,
        };
        var returnValue = scope.filterServiceCodes(serviceCode);

        expect(returnValue).toBe(false);
      });

      it('should return true if serviceCode.IsSwiftPickCode matches filterObject.IsInactive', function () {
        scope.setDefaultFilter();
        scope.filterObject.IsSwiftPickCode = true;
        var serviceCode = {
          ServiceTypeId: 1,
          IsSwiftPickCode: true,
          IsActive: true,
        };
        var returnValue = scope.filterServiceCodes(serviceCode);

        expect(returnValue).toBe(true);
      });

      it('should return true if serviceCode.IsSwiftPickCode does not match filterObject.IsServiceCode', function () {
        scope.setDefaultFilter();
        scope.filterObject.IsSwiftPickCode = true;
        var serviceCode = {
          ServiceTypeId: 1,
          IsSwiftPickCode: false,
          IsActive: true,
        };
        var returnValue = scope.filterServiceCodes(serviceCode);

        expect(returnValue).toBe(false);
      });

      it('should return true if serviceCode.ServiceTypeId matches any filterObject.ServiceType', function () {
        scope.serviceTypes = angular.copy(mockServiceTypes);
        scope.setDefaultFilter();
        scope.filterObject.ServiceTypes[0].FilterBy = true;
        var serviceCode = {
          ServiceTypeId: 'e928ed50-1c73-4836-8a07-11d4ac39e947',
          IsSwiftPickCode: false,
          IsActive: true,
        };
        var returnValue = scope.filterServiceCodes(serviceCode);
        expect(returnValue).toBe(true);
      });

      it('should return false if serviceCode.ServiceTypeId does not match any filterObject.ServiceType', function () {
        scope.serviceTypes = angular.copy(mockServiceTypes);
        scope.setDefaultFilter();
        scope.filterObject.ServiceTypes[0].FilterBy = true;
        var serviceCode = {
          ServiceTypeId: 'e928ed50-1c73-4836-8a07-11d4ac39e94',
          IsSwiftPickCode: false,
          IsActive: true,
        };
        var returnValue = scope.filterServiceCodes(serviceCode);
        expect(returnValue).toBe(false);
      });
    });

    describe('serviceTypes watch ->', function () {
      it('should call initializeController after service types loaded', function () {
        spyOn(ctrl, 'initializeController');
        scope.serviceTypes = angular.copy(mockServiceTypes);
        scope.$apply();
        expect(ctrl.initializeController).toHaveBeenCalled();
      });

      it('should not call initializeController if service types not loaded', function () {
        spyOn(ctrl, 'initializeController');
        expect(ctrl.initializeController).not.toHaveBeenCalled();
      });
    });
  });

  //#endregion
});
