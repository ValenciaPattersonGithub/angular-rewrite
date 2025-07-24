'use strict';

var app = angular.module('Soar.BusinessCenter');

app.controller('ServiceCodeExceptionModalController', [
  '$scope',
  '$uibModalInstance',
  'localize',
  'toastrFactory',
  'referenceDataService',
  'availableCodes',
  'ServiceTypesService',
  'FeatureFlagService',
  'FuseFlag',
  function (
    $scope,
    $uibModalInstance,
    localize,
    toastrFactory,
    referenceDataService,
    availableCodes,
    serviceTypesService,
    featureFlagService,
    fuseFlag,
  ) {
    var ctrl = this;
    $scope.availableCodes = availableCodes;
    $scope.filterItem = '';
    $scope.filteringServices = false;
    $scope.filteringMessageNoResults = localize.getLocalizedString(
      'There are no {0} that match the filter.',
      ['service codes']
    );
    $scope.loadingMessageNoResults = localize.getLocalizedString(
      'There are no {0}.',
      ['service codes']
    );

    $scope.addException = function (index) {
      if (index > -1 && index < $scope.filteredServiceCodes.length) {
        $('body').removeClass('modal-open');
        $uibModalInstance.close($scope.filteredServiceCodes[index]);
      }
    };

    $scope.cancel = function () {
      $('body').removeClass('modal-open');
      $uibModalInstance.dismiss();
    };

    $scope.soarAuthEnctrAddSvcKey = 'soar-acct-enctr-asvcs';

    //Custom filter - filter based on the service type selected
    $scope.serviceTypeFilter = function (data) {
      if (data.ServiceTypeId === $scope.filterItem) {
        return true;
      } else if ($scope.filterItem == null || $scope.filterItem == '') {
        return true;
      } else {
        return false;
      }
    };

    $scope.serviceTypes = [];
    serviceTypesService.getAll()
      .then(function (serviceTypes) {
        $scope.serviceTypes = serviceTypes;
      });

    //#region fieldOptions
    ctrl.defaultFieldOptions = {
      ServiceTypeSelector: {
        Disabled: false,
        Hidden: false,
      },
      SearchBoxInput: {
        Disabled: false,
        Hidden: false,
      },
    };

    $scope.fieldOptions = $scope.fieldOptions
      ? $.extend(true, ctrl.defaultFieldOptions, $scope.fieldOptions)
      : ctrl.defaultFieldOptions;
    //#endregion
  },
]);
