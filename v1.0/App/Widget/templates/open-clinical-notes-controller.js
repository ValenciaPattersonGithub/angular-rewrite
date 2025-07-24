'use strict';

angular
  .module('Soar.Widget')
  .controller('OpenClinicalNotesController', [
    '$scope',
    '$window',
    'WidgetInitStatus',
    'WidgetFactory',
    'tabLauncher',
    '$rootScope',
    'locationService',
    'TimeZoneFactory',
    '$filter',
    '$timeout',
    'FeatureFlagService',
    'FuseFlag',
    OpenClinicalNotesController,
  ]);

function OpenClinicalNotesController(
  $scope,
  $window,
  widgetInitStatus,
  widgetFactory,
  tabLauncher,
  $rootScope,
  locationService,
  timeZoneFactory,
  $filter,
  $timeout,
  featureFlagService,
  fuseFlag
) {
  BaseCtrl.call(this, $scope, 'OpenClinicalNotesController');

  var ctrl = this;
  var launchDarklyStatus = false;

  $scope.openClinicalNotes = [];
  $scope.currentUserId = $rootScope.patAuthContext.userInfo.userid;
  $scope.selectedProvider = {
    ProviderId: $rootScope.patAuthContext.userInfo.userid,
  };
  $scope.providerPlaceHolder = 'All Providers';
  $scope.selectedLocation = { LocationId: '0' };
  $scope.locationOptions = [];
  $scope.locationIdsForProviderDropdown = [];
  $scope.changedLocation = false;
  $scope.initialLoadComplete = false;

  $scope.$watch('data.initMode', function (nv) {
    ctrl.processInitMode(nv);
  });

  ctrl.$onInit = function () {
    $scope.selectedProvider.ProviderId =
      $rootScope.patAuthContext.userInfo.userid;
    $scope.selectedLocation.LocationId =
      locationService.getCurrentLocation().id;
    ctrl.getUserLocations();
  };

  $scope.$watch('selectedLocation.LocationId', function (nv, ov) {
    if (nv != ov) {
      $scope.selectedLocation.LocationId = nv;
      if (
        $scope.selectedLocation.LocationId &&
        $scope.selectedLocation.LocationId != '0'
      ) {
        $scope.locationIdsForProviderDropdown = [
          $scope.selectedLocation.LocationId,
        ];
      } else {
        var tempLocations = [];
        for (var x = 0; x < $scope.locationOptions.length; x++) {
          tempLocations.push($scope.locationOptions[x].Value);
        }
        $scope.locationIdsForProviderDropdown = tempLocations;
      }
      if (
        $scope.selectedProvider.ProviderId !=
        $rootScope.patAuthContext.userInfo.userid
      ) {
        //When the current selected provider in dropdown is different from logged in user, set this to true.
        //This will ensure proper handling when change detection triggers the assignedProviderChanged call
        //If the values are the same, don't set this as the assignedProviderChanged method won't be called
        $scope.changedLocation = true;
      }

      $scope.selectedProvider.ProviderId =
        $rootScope.patAuthContext.userInfo.userid;
      $timeout(function () { }, 100);
      ctrl.getDataFromServer();
    }
  });

  ctrl.processInitMode = function (initMode) {
    if (initMode === widgetInitStatus.Loaded) {
      ctrl.processData($scope.data.initData);
    } else if (initMode === widgetInitStatus.ToLoad) {
      ctrl.getDataFromServer();
    }
  };

  $scope.assignedProviderChanged = function (assignedProviderId) {
    if (!$scope.changedLocation) {
      $scope.selectedProvider.ProviderId = assignedProviderId;
      ctrl.getDataFromServer();
    } else {
      $timeout(function () {
        $scope.selectedProvider.ProviderId =
          $rootScope.patAuthContext.userInfo.userid;
      }, 100);
      $scope.selectedProvider.ProviderId =
        $rootScope.patAuthContext.userInfo.userid;
      $scope.changedLocation = false;
    }
  };

  ctrl.processData = function (data) {
    $scope.openClinicalNotes = data;
  };

  ctrl.getUserLocations = function () {
    if ($scope.locationOptions.length == 0) {
      var tempLocationList = [];
      var activeLocations = locationService.getActiveLocations();
      $scope.locationOptions.push({ Text: 'All Locations', Value: 0 });
      if (activeLocations) {
        activeLocations = ctrl.groupLocations(activeLocations);
        for (var x = 0; x < activeLocations.length; x++) {
          $scope.locationOptions.push({
            Text: activeLocations[x].name,
            Value: activeLocations[x].id,
          });
          tempLocationList.push(activeLocations[x].id);
        }
      }

      $scope.locationIdsForProviderDropdown = tempLocationList;
    }
  };

  ctrl.groupLocations = function (locs) {
    ctrl.resLocs = [];
    ctrl.pendingInactiveLocs = [];
    ctrl.inactiveLocs = [];

    var dateNow = moment().format('MM/DD/YYYY');
    _.each(locs, function (obj) {
      if (obj.deactivationTimeUtc) {
        var toCheck = moment(obj.deactivationTimeUtc).format('MM/DD/YYYY');

        if (
          moment(toCheck).isBefore(dateNow) ||
          moment(toCheck).isSame(dateNow)
        ) {
          obj.status = 'Inactive';
          obj.sort = 3;
          ctrl.inactiveLocs.push(obj);
        } else {
          obj.status = 'Pending Inactive';
          obj.sort = 2;
          ctrl.pendingInactiveLocs.push(obj);
        }
      } else {
        obj.status = 'Active';
        obj.sort = 1;
        ctrl.resLocs.push(obj);
      }
    });
    ctrl.resLocs = $filter('orderBy')(ctrl.resLocs, 'name');
    ctrl.pendingInactiveLocs = $filter('orderBy')(
      ctrl.pendingInactiveLocs,
      'deactivationTimeUtc',
      false
    );
    ctrl.inactiveLocs = $filter('orderBy')(
      ctrl.inactiveLocs,
      'deactivationTimeUtc',
      true
    );

    _.each(ctrl.pendingInactiveLocs, function (obj) {
      ctrl.resLocs.push(obj);
    });
    _.each(ctrl.inactiveLocs, function (obj) {
      ctrl.resLocs.push(obj);
    });
    return ctrl.resLocs;
  };

  ctrl.getLocationsForFilter = function () {
    //Used to return list of locations to filter,
    //returns 1 location unless All Locations is selected
    //If All Locations is selected, return all locations the user has access to
    var locationList = [];
    if ($scope.selectedLocation.LocationId != '0') {
      locationList.push($scope.selectedLocation.LocationId);
    } else {
      for (var x = 0; x < $scope.locationOptions.length; x++) {
        locationList.push($scope.locationOptions[x].Value);
      }
    }
    return locationList;
  };

  ctrl.getDataFromServer = function () {
    $scope.$emit('WidgetLoadingStarted');
    //ctrl.getUserLocations();
    var locationFilters = ctrl.getLocationsForFilter();

    featureFlagService.getOnce$(fuseFlag.DashboardClinicalNotesWidgetMvp).subscribe((value) => {
      launchDarklyStatus = value;
    });
    var filterProviderId = $scope.selectedProvider.ProviderId
      ? $scope.selectedProvider.ProviderId
      : '00000000-0000-0000-0000-000000000000';
    var filters = {
      LocationIds: locationFilters,
      ProviderIds: [filterProviderId],
      LaunchDarklyStatus: launchDarklyStatus
    };
    widgetFactory.GetOpenClinicalNotes(filters).then(
      function (res) {
        ctrl.processData(res.Value);
        $scope.$emit('WidgetLoadingDone');
      },
      function () {
        $scope.$emit('WidgetLoadingError', 'Failed to load data.');
      }
    );
  };

  $scope.$watch('data.Refresh', function () {
    if ($scope.data.Refresh) {
      ctrl.getDataFromServer();
      $scope.data.Refresh = false;
    }
  });

  $scope.openPatientTab = function (patientId) {
    var params = 'tab=1&activeSubTab=3&currentPatientId=' + patientId;
    tabLauncher.launchNewTab(
      '#/Patient/' + patientId + '/Clinical/' + '?' + params
    );
  };
}

OpenClinicalNotesController.prototype = Object.create(BaseCtrl.prototype);
