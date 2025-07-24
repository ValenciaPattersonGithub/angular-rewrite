'use strict';

angular
  .module('Soar.BusinessCenter')
  .controller('PracticeAtAGlanceController', [
    '$scope',
    '$filter',
    'DashboardService',
    'toastrFactory',
    'localize',
    'patSecurityService',
    'LocationServices',
    'AmfaInfo',
    'ListHelper',
    'locationService',
    'TimeZoneFactory',
    '$timeout',
    PracticeAtAGlanceController,
  ]);

function PracticeAtAGlanceController(
  $scope,
  $filter,
  dashboardService,
  toastrFactory,
  localize,
  patSecurityService,
  locationServices,
  amfaInfo,
  listHelper,
  locationService,
  timeZoneFactory,
  $timeout
) {
  BaseCtrl.call(this, $scope, 'PracticeAtAGlanceController');

  $scope.dayDateDisplay = $filter('date')(
    moment().toDate(),
    'EEEE, MMMM d, yyyy'
  );

  var ctrl = this;
  ctrl.listHelper = listHelper;
  var dashboardId = 1;
  var batchIds = []; // To load three batches
  var amfaAbbrev = 'soar-dsh-dsh-view';
  $scope.locationMultiSelectOpen = false;
  $scope.locations = [];
  $scope.selectedLocations = [];
  ctrl.initialLocationSelection = [];
  $scope.locationsLoading = false;
  ctrl.emptyGuid = '00000000-0000-0000-0000-000000000000';
  var definitionLoadedForLocationIds = [];
  ctrl.locationsUpdatedFlag = false;
  $scope.authorizeFailed = false;
  ctrl.tempLocations = [];

  // sending user to root if they don't have permission to view this report
  ctrl.checkAuth = function () {
    if (!patSecurityService.IsAuthorizedByAbbreviation(amfaAbbrev)) {
      return false;
    }
    return true;
  };

  ctrl.ComputeLocationStatusesWithTimezones = function (locations) {
    var dateNow = moment().format('MM/DD/YYYY');
    _.each(locations, function (obj) {
      if (obj.LocationId) {
        if (obj.DeactivationTimeUtc) {
          var toCheck = moment(obj.DeactivationTimeUtc).format('MM/DD/YYYY');
          if (
            moment(toCheck).isBefore(dateNow) ||
            moment(toCheck).isSame(dateNow)
          ) {
            obj.LocationStatus = 'Inactive';
            obj.SortOrder = 3;
          } else {
            obj.LocationStatus = 'Pending Inactive';
            obj.SortOrder = 2;
          }
        } else {
          obj.LocationStatus = 'Active';
          obj.SortOrder = 1;
        }
        obj.NameLine1 =
          obj.NameLine1 +
          ' (' +
          timeZoneFactory.GetTimeZoneAbbr(obj.Timezone) +
          ')';
      } else {
        obj.LocationStatus = 'All Status';
        obj.SortOrder = 1;
      }
    });
  };

  function init(location) {
    if (!ctrl.checkAuth()) {
      $scope.authorizeFailed = true;
      toastrFactory.error(
        localize.getLocalizedString(
          'User is not authorized to access this area.'
        ),
        localize.getLocalizedString('Not Authorized')
      );
      return;
    }

    if (_.isEqual(definitionLoadedForLocationIds, [location.id])) return;
    definitionLoadedForLocationIds = [];

    dashboardService.BatchLoader.Init(
      [location.id],
      null,
      dashboardId,
      batchIds,
      function (definition) {
        dashboardService.DashboardId = dashboardId;
        $scope.dashboardDefinition = definition;
        _.each($scope.dashboardDefinition.Items, function (widget) {
          widget.Locations = [location.id];
        });
        definitionLoadedForLocationIds = [location.id];
      },
      function () {
        // failed call back
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve the dashboard definition. Refresh the page to try again.'
          ),
          localize.getLocalizedString('Server Error')
        );
      }
    );
    $scope.locationsLoading = true;
    locationServices.getPermittedLocations(
      { actionId: amfaInfo[amfaAbbrev].ActionId },
      function (res) {
        $scope.locations = [
          {
            LocationId: null,
            NameLine1: 'All Locations',
            Selected: false,
          },
        ];
        $scope.locations = $scope.locations.concat(res.Value);
        ctrl.ComputeLocationStatusesWithTimezones($scope.locations);

        var loc = ctrl.listHelper.findItemByFieldValue(
          $scope.locations,
          'LocationId',
          location.id
        );
        loc.Selected = true;
        $scope.selectedLocations = ctrl.initialLocationSelection = location
          ? [loc]
          : [];
        ctrl.tempLocations = $scope.selectedLocations;
        $scope.locationsLoading = false;
      },
      function () {
        // failed call back
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to retrieve locations. Refresh the page to try again.'
          ),
          localize.getLocalizedString('Server Error')
        );
        $scope.locationsLoading = false;
      }
    );
    //Clear previously selected location if any.
    sessionStorage.removeItem('userSelectedLocationfromPAAG');
  }

  $scope.updateContents = function () {
    var masterLocationsSelected = _.filter($scope.locations, function (item) {
      return item.Selected;
    });
    if ($scope.selectedLocations.length === 0) {
      ctrl.locationsUpdatedFlag = false;
    } else {
      ctrl.locationsUpdatedFlag = true;
    }
    $scope.selectedLocations = masterLocationsSelected;
    ctrl.tempLocations = $scope.selectedLocations;
    sessionStorage.setItem(
      'userSelectedLocationfromPAAG',
      JSON.stringify(ctrl.tempLocations)
    );
  };

  $scope.removeLocation = function (location) {
    // Remove the location from selectedLocations list.
    location.Selected = false;
    $scope.updateContents();
  };

  $scope.locationChange = function (list) {
    if (!_.isEqual(ctrl.tempLocations, list)) {
      ctrl.tempLocations = list;
      var selectedIds = [];
      var selectAll = false;
      _.each($scope.selectedLocations, function (loc) {
        if (loc.Selected) {
          if (loc.LocationId) selectedIds.push(loc.LocationId);
          else selectAll = true;
        }
      });

      if (selectAll) {
        selectedIds = [];
        selectedIds.push(ctrl.emptyGuid);
        _.each($scope.locations, function (loc) {
          if (loc.LocationId) selectedIds.push(loc.LocationId);
        });
      }

      if (_.isEqual(definitionLoadedForLocationIds, selectedIds)) return;

      definitionLoadedForLocationIds = [];

      if (selectedIds.length > 0) {
        dashboardService.BatchLoader.Init(
          selectedIds,
          null,
          dashboardId,
          [], // don't load any batch here because the following refresh will take care of loading the data.
          function (definition) {
            dashboardService.DashboardId = dashboardId;
            ctrl.removeNotPermittedWidgetItems(definition);
            _.each($scope.dashboardDefinition.Items, function (widget) {
              widget.Locations = selectedIds;
              // below variable can be removed once all the data.refresh watchers are removed from the controllers
              widget.Refresh = true;
            });
            //to remove watcher, using broadcast event and it is firing only once after foreach loop instead of each widget item.
            $timeout(function () {
              if (ctrl.locationsUpdatedFlag) {
                $scope.$broadcast('locationsUpdated');
              }
            }, 0);

            ctrl.addNewPermittedWidgetItems(definition, selectedIds);
            definitionLoadedForLocationIds = selectedIds;
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString(
                'Failed to retrieve the dashboard definition. Refresh the page to try again.'
              ),
              localize.getLocalizedString('Server Error')
            );
          }
        );
      } else {
        $scope.dashboardDefinition.Items = [];
      }
    }
  };

  ctrl.removeNotPermittedWidgetItems = function (definition) {
    var itemsToRemove = [];
    _.each($scope.dashboardDefinition.Items, function (oldItem) {
      var shouldRemoveItem = true;
      _.each(definition.Items, function (item) {
        if (item.ItemId === oldItem.ItemId) {
          shouldRemoveItem = false;
          oldItem.Position = item.Position;
        }
      });

      if (shouldRemoveItem) {
        itemsToRemove.push(oldItem);
      }
    });
    _.each(itemsToRemove, function (item) {
      $scope.dashboardDefinition.Items.splice(
        $scope.dashboardDefinition.Items.indexOf(item),
        1
      );
    });
  };

  ctrl.addNewPermittedWidgetItems = function (definition, locationIds) {
    _.each(definition.Items, function (item) {
      var shouldAddItem = true;
      _.each($scope.dashboardDefinition.Items, function (oldItem) {
        if (item.ItemId === oldItem.ItemId) {
          shouldAddItem = false;
        }
      });
      if (shouldAddItem) {
        var index = definition.Items.indexOf(item);
        item.Locations = locationIds;
        $scope.dashboardDefinition.Items.splice(index, 0, item);
      }
    });
  };

  // deal with changing of the location.
  $scope.$on('patCore:initlocation', function () {
    var userLocation = locationService.getCurrentLocation();
    init(userLocation);
  });

  // deal with initialization of the location.
  var userLocation = locationService.getCurrentLocation();
  if (userLocation) {
    init(userLocation);
  } else {
    $scope.$on('patCore:load-location-display', function (event) {
      init(event.location);
    });
  }
}

PracticeAtAGlanceController.prototype = Object.create(BaseCtrl.prototype);
