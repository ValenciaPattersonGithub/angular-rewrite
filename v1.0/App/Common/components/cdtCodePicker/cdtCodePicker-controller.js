'use strict';

angular.module('common.controllers').controller('CdtCodePickerController', [
  '$scope',
  '$timeout',
  '$filter',
  '$rootScope',
  'localize',
  'toastrFactory',
  'patSecurityService',
  'CdtCodeService',
  function (
    $scope,
    $timeout,
    $filter,
    $rootScope,
    localize,
    toastrFactory,
    patSecurityService,
    cdtCodeService
  ) {
    var ctrl = this;
    $scope.orderBy = {
      field: '',
      asc: true,
    };
    //Success callback to load cdt codes list
    $scope.cdtCodes = [];
    ctrl.cdtCodeGetAllSuccess = function (successResponse) {
      $scope.loadingCodes = false;
      $scope.filteringCodes = true;
      $scope.cdtCodes = successResponse.Value;
    };

    $scope.loadingCodes = true;
    $scope.filteringCodes = false;
    $scope.filteringMessageNoResults = localize.getLocalizedString(
      'There are no {0} that match the filter.',
      ['CDT Codes']
    );
    $scope.loadingMessageNoResults = localize.getLocalizedString(
      'There are no {0}.',
      ['CDT Codes']
    );

    //Error callback to handle failure when cdt codes could not be loaded
    ctrl.cdtCodeGetAllFailure = function () {
      $scope.loadingCodes = false;
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['CDT Codes']
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    cdtCodeService.getList(
      ctrl.cdtCodeGetAllSuccess,
      ctrl.cdtCodeGetAllFailure
    );

    // function to apply orderBy functionality on grid
    $scope.changeSortingForGrid = function (field) {
      var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
      $scope.orderBy = { field: field, asc: asc };
    };
    $scope.onSelectCode = function (cdtCode) {
      $scope.onSelect(cdtCode);
    };
  },
]);
