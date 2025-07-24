'use strict';

angular.module('Soar.BusinessCenter').controller('ClaimsController', [
  '$scope',
  '$rootScope',
  'localize',
  'PatientServices',
  '$filter',
  '$location',
  'ClaimsService',
  'toastrFactory',
  'PatientClaimInfoOptions',
  '$timeout',
  function (
    $scope,
    $rootScope,
    localize,
    patientServices,
    $filter,
    $location,
    claimsService,
    toastrFactory,
    PatientClaimInfoOptions,
    $timeout
  ) {
    var ctrl = this;
    ctrl.init = function () {
      $scope.unsubmittedCount = '';
      $scope.submittedCount = '';
      $scope.alertCount = '';
      $scope.allCount = '';
      $scope.unsubmittedFee = 0;
      $scope.submittedFee = 0;
      $scope.alertFee = 0;
      $scope.loaded = false;
      $scope.claimInformation = patientServices.GetClaimInformation();
      if ($scope.claimInformation) {
        switch ($scope.claimInformation.claimFilterType) {
          case PatientClaimInfoOptions.UnsubmittedPreds:
          case PatientClaimInfoOptions.All:
            $scope.activeTab = 'all';
            break;
          default:
            $scope.activeTab = 'unsubmitted';
            break;
        }
      } else {
        $scope.activeTab = 'unsubmitted';
      }
      $scope.displayCount = true;

      if (
        $location.url() === '/BusinessCenter/Insurance/ClaimAlerts?newTab=false'
      ) {
        $scope.activeTab = 'alerts';
      }
    };

    $scope.claimsApplyFilter = function (filter) {
      if (sessionStorage.getItem('pendingclaims') == 'true') {
        $scope.activeTab = 'submitted';
        sessionStorage.setItem('pendingclaims', 'false');
      } else {
        $scope.activeTab = filter;
      }
    };

    $scope.locationsLoaded = function () {
      let claimInfo = patientServices.GetClaimInformation();

      if (
        claimInfo
        || (!claimInfo && $location.search().patientId && $location.path().indexOf('BusinessCenter/Insurance/Claims') >= 0)  //If ClaimInfo not available , check if this page is refresed using patientid
      ) {
        angular.forEach($scope.masterLocations, function (loc) {
          loc.Selected = !loc.LocationId;
        });
        $scope.selectedLocations = $scope.masterLocations[0];
      }
      $timeout(function () {
        $scope.$broadcast('ClaimMasterLocationsLoaded', $scope.masterLocations);
        $scope.$broadcast('ClaimLocationsLoaded', $scope.selectedLocations);
        $scope.loaded = true;
      });
    };

    $scope.locationChange = function () {
      if ($scope.loaded) {
        $scope.$broadcast('ClaimLocationsChanged', $scope.selectedLocations);
      }
    };

    ctrl.init();

    $scope.getTabCount = function (tab, filters) {
      switch (tab) {
        case 'unsubmitted':
          $scope.unsubmittedCount = '';
          $scope.unsubmittedFee = '';
          break;
        case 'submitted':
          $scope.submittedCount = '';
          $scope.submittedFee = '';
          break;
        case 'alerts':
          $scope.alertCount = '';
          $scope.alertFee = '';
          break;
        case 'all':
          $scope.allCount = '';
          break;
        default:
          break;
      }
      claimsService.search(
        filters,
        ctrl.getTabCountSuccess(tab),
        ctrl.getTabcountFailure
      );
    };

    ctrl.getTabCountSuccess = function (tab) {
      return function (res) {
        switch (tab) {
          case 'unsubmitted':
            $scope.unsubmittedCount = res.Value.TotalCount;
            $scope.unsubmittedFee = res.Value.TotalFees;
            break;
          case 'submitted':
            $scope.submittedCount = res.Value.TotalCount;
            $scope.submittedFee = res.Value.TotalFees;
            break;
          case 'alerts':
            $scope.alertCount = res.Value.TotalCount;
            $scope.alertFee = res.Value.TotalFees;
            break;
          case 'all':
            $scope.allCount = res.Value.TotalCount;
            break;
          default:
            break;
        }
      };
    };

    ctrl.getTabCountFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Failed to get count'),
        'Failure'
      );
    };
  },
]);
