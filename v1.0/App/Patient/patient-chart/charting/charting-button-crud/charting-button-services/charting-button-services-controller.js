(function () {
  'use strict';
  angular
    .module('Soar.Patient')
    .controller(
      'ChartingButtonServicesController',
      ChartingButtonServicesController
    );

  ChartingButtonServicesController.$inject = [
    '$rootScope',
    '$scope',
    'ListHelper',
    'toastrFactory',
    'localize',
    'referenceDataService',
    'ChartingFavoritesFactory',
    'ServiceTypesService',
    'FeatureFlagService',
    'FuseFlag',
  ];

  function ChartingButtonServicesController(
    $rootScope,
    $scope,
    listHelper,
    toastrFactory,
    localize,
    referenceDataService,
    chartingFavoritesFactory,
    serviceTypesService,
    featureFlagService,
    fuseFlag,
  ) {
    var ctrl = this;

    $scope.serviceTypes = [];

    ctrl.$onInit = function () {
      ctrl.layoutItemType = $scope.type === 'services' ? '2' : '3';
      $scope.services = [];
      $scope.filterBy = {
        text: '',
        serviceTypeId: '',
        showInactive: false,
      };
      ctrl.getServices();
      if ($scope.type === 'services') {
        ctrl.getServiceTypes();
      }
    };

    // filtering function
    $scope.servicesFilter = function (item) {
      var result = false;
      var text = $scope.filterBy.text.toLowerCase();

      // checking against the text in search box
      if (
        (item.DisplayAs && item.DisplayAs.toLowerCase().indexOf(text) !== -1) ||
        (item.Code && item.Code.toLowerCase().indexOf(text) !== -1) ||
        text.length == 0
      ) {
        result = true;
      }
      // if filterBy.serviceTypeId is set and item's ServiceTypeId doesn't match, don't show it
      if (
        $scope.filterBy.serviceTypeId &&
        $scope.filterBy.serviceTypeId !== item.ServiceTypeId
      ) {
        result = false;
      }
      // toggle inactive services
      if (!$scope.filterBy.showInactive && !item.IsActive) {
        result = false;
      }
      return result;
    };

    //#region services api

    /**
     * getting the list of services.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getServices = function () {
      return referenceDataService
        .getData(referenceDataService.entityNames.serviceCodes)
        .then(function (serviceCodes) {
          var services = [];
          $scope.loadingServices = false;
          _.forEach(serviceCodes, function (svc) {
            if ($scope.type === 'swiftCodes' && svc.IsSwiftPickCode === true) {
              svc.$$ButtonClass = 'swiftCodeBtnColor';
              svc.IconUrl = $scope.getServiceChartIconUrl(svc);
              ctrl.setServiceProperties(svc, ctrl.layoutItemType);
              services.push(svc);
            } else if (
              $scope.type === 'services' &&
              svc.IsSwiftPickCode === false
            ) {
              svc.$$ButtonClass = 'svcBtnColor';
              svc.IconUrl = $scope.getServiceChartIconUrl(svc);
              ctrl.setServiceProperties(svc, ctrl.layoutItemType);
              services.push(svc);
            }
          });

          $scope.servicesBackup = angular.copy(services);
          $scope.services = angular.copy(services);
          $scope.filterServices();
        });
    };

    ctrl.setServiceProperties = function (service, layoutItemType) {
      service.$$LayoutItemId = layoutItemType;
      service.$$button = {
        ItemTypeId: service.$$LayoutItemId,
        ItemId: service.ServiceCodeId,
      };
    };

    //#endregion

    //#region service types api

    /**
     * getting the list of service types.
     *
     * @returns {angular.IPromise}
     */
    ctrl.getServiceTypes = function () {
      return serviceTypesService.getAll()
          .then(function (serviceTypes) {
            $scope.serviceTypes = serviceTypes;
          });
    };

    //#endregion

    //#region drag directive functions

    // used by k-hint to draw duplicate button to display while dragging
    $scope.draggableHint = function (e) {
      return angular.element(e).clone();
    };

    // used by k-dragend to cleanup up hollow class
    $scope.onDragEnd = function (e) {
      var draggable = angular.element(e);
      draggable.removeClass('hollow');
    };

    // used by k-dragstart to add hollow class
    $scope.onDragStart = function () {
      $scope.$apply(function () {
        $scope.draggableClass = 'hollow';
      });
    };

    //#endregion

    //#region Button icons

    $scope.getServiceChartIconUrl = function (service) {
      var url = 'Images/ChartIcons/';
      var path = angular.copy(service.IconName);
      if (!path || path === null) {
        url += service.IsSwiftPickCode
          ? 'default_swift_code.svg'
          : 'default_service_code.svg';
      } else {
        url += path + '.svg';
      }
      return url;
    };

    //#endregion

    $scope.getTemplateType = function (service) {
      var template = 'chartingButtonServicesTooltipTemplate.html';
      var type = service.ServiceTypeDescription;
      if (type == 'Swift Code') {
        template = 'chartingButtonSwiftCodeTooltipTemplate.html';
      } else {
        template = 'chartingButtonServicesTooltipTemplate.html';
      }
      return template;
    };

    // setting background class based on button type
    $scope.getButtonColorClass = function (layoutItemId) {
      var cssClass = '';
      switch (layoutItemId) {
        case '1':
          cssClass = 'condBtnColor';
          break;
        case '2':
          cssClass = 'svcBtnColor';
          break;
        case '3':
          cssClass = 'swiftCodeBtnColor';
          break;
      }
      return cssClass;
    };

    // listen for the charting favorites update
    $scope.$watch(
      function () {
        return chartingFavoritesFactory.SelectedChartingFavorites;
      },
      function (nv) {
        $scope.filterServices();
      },
      true
    );

    $scope.filterServices = function () {
      var selectedSvcIds = [];
      angular.forEach(
        chartingFavoritesFactory.SelectedChartingFavorites,
        function (page) {
          angular.forEach(page.Favorites, function (layoutItem) {
            // only looking for services or swift codes
            if (layoutItem.Button != null) {
              var svcId = layoutItem.Button.ItemId;
              selectedSvcIds.push(svcId);
              var index = listHelper.findIndexByFieldValue(
                $scope.services,
                'ServiceCodeId',
                svcId
              );
              if (index >= 0) {
                // if we find in conditions we need to refresh the iconUrl
                layoutItem.IconUrl = $scope.getServiceChartIconUrl(
                  $scope.services[index]
                );
                // if we find it in services, then it needs to be removed
                $scope.services.splice(index, 1);
              }
            } else if (layoutItem.ButtonGroup != null) {
              angular.forEach(
                layoutItem.ButtonGroup.Buttons,
                function (button) {
                  var svcId = button.ItemId;
                  selectedSvcIds.push(svcId);
                  var index = listHelper.findIndexByFieldValue(
                    $scope.services,
                    'ServiceCodeId',
                    svcId
                  );
                  if (index >= 0) {
                    // if we find it in services, then it needs to be removed
                    $scope.services.splice(index, 1);
                  }
                }
              );
            }
          });
        }
      );
      angular.forEach($scope.servicesBackup, function (svc) {
        var indexInSvcs = listHelper.findIndexByFieldValue(
          $scope.services,
          'ServiceCodeId',
          svc.ServiceCodeId
        );
        var indexInSelectedSvcs = selectedSvcIds.indexOf(svc.ServiceCodeId);
        if (indexInSvcs === -1 && indexInSelectedSvcs === -1) {
          // if service from servicesBackup is not in services or selectedSvcIds, we need to add it back to services (remove scenario)
          $scope.services.push(svc);
        }
      });
    };
  }

  ChartingButtonServicesController.prototype = Object.create(BaseCtrl);
})();
