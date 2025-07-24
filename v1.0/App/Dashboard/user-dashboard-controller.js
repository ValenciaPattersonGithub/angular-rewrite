'use strict';

angular
  .module('Soar.Dashboard')
  .controller('UserDashboardController', [
    '$scope',
    '$injector',
    '$rootScope',
    '$filter',
    'DashboardService',
    'UserServices',
    'toastrFactory',
    'localize',
    'locationService',
    'referenceDataService',
    'CommonServices',
     UserDashboardController,
  ]);

function UserDashboardController(
  $scope,
  $injector,
  $rootScope,
  $filter,
  dashboardService,
  userServices,
  toastrFactory,
  localize,
  locationService,
  referenceDataService,
  commonServices,
) {
  BaseCtrl.call(this, $scope, 'UserDashboardController');
  var ctrl = this;

  commonServices.PracticeSettings.Operations.Retrieve().$promise.then((res) => {
    $scope.TimeIncrement = res.Value.DefaultTimeIncrement;
  })

  $scope.dayDateDisplay = $filter('date')(
    moment().toDate(),
    'EEEE, MMMM d, yyyy'
  );
  $scope.displayName = null;
  $scope.dashboardGrossProduction = false; 
  $scope.isAppointmentViewVisible = false;
  $scope.isSecondaryAppointmentViewVisible = false;

  var dashboardId = 2;
  var batchIds = []; // To load batches

  ctrl.init = function (location) {
    let appointmentViewVisibleService = $injector.get(
      'AppointmentViewVisibleService'
    );
    ctrl.onAppointmentViewVisibleChange = function (
      isVisible,
      isSecondaryVisible
    ) {
      let appointmentViewLoadingService = $injector.get(
        'AppointmentViewLoadingService'
      );

      let data = appointmentViewLoadingService.currentAppointmentSaveResult;

      $scope.isAppointmentViewVisible = isVisible;
      $scope.isSecondaryAppointmentViewVisible = isSecondaryVisible;
      if (
        (!isVisible || !isSecondaryVisible) &&
        data !== null &&
        data !== undefined
      ) {
        if (appointmentViewLoadingService.afterSaveEvent) {
          $rootScope.$broadcast(
            appointmentViewLoadingService.afterSaveEvent,
            data
          );
        }
      }
    };
    appointmentViewVisibleService.registerObserver(
      ctrl.onAppointmentViewVisibleChange
    );

    var users = referenceDataService.get(
      referenceDataService.entityNames.users
    );
    var user = _.find(users, {
      UserId: $rootScope.patAuthContext.userInfo.userid,
    });
    if (!_.isNil(user)) {
      ctrl.userSuccess({ Value: user });
    } else {
      userServices.Users.get(
        { Id: $rootScope.patAuthContext.userInfo.userid },
        ctrl.userSuccess,
        ctrl.userFailed
      );
    }
  };

  ctrl.userSuccess = function (res) {
    if (!ctrl.location) {
      ctrl.location = locationService.getCurrentLocation();
    }
    var user = res.Value;
    $scope.displayName = $filter('getFullNameWithProfessionalDesignation')(
      user
    );
    dashboardService.BatchLoader.Init(
      [ctrl.location.id],
      user,
      dashboardId,
      batchIds,
      ctrl.dashboardLoadSuccess,
      ctrl.dashboardLoadFailed
    );

    //Create login event (if first visit)
    var firstVisit = localStorage.getItem('isFirstVisit');
    if (firstVisit !== 'false') {
      userServices.LoginActivityEvent.create('');
      localStorage.setItem('isFirstVisit', 'false');
    }
  };

  ctrl.userFailed = function () {
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the current user. Refresh the page to try again.'
      ),
      localize.getLocalizedString('Server Error')
    );
  };
  
  ctrl.dashboardLoadSuccess = function (definition) {
    dashboardService.DashboardId = dashboardId;
    $scope.dashboardDefinition = definition;
    $scope.dashboardDefinition.Items.forEach(function (widget) {
      widget.Locations = [ctrl.location.id];
    });
  };

  ctrl.dashboardLoadFailed = function () {
    toastrFactory.error(
      localize.getLocalizedString(
        'Failed to retrieve the dashboard definition. Refresh the page to try again.'
      ),
      localize.getLocalizedString('Server Error')
    );
  };

  // deal with changing of the location.
  $scope.$on('patCore:initlocation', function () {
    var userLocation = locationService.getCurrentLocation();
    ctrl.init(userLocation);
  });

  // deal with initialization of the location.
  var userLocation = locationService.getCurrentLocation();
  if (!_.isNull(userLocation)) ctrl.init(userLocation);
  else {
    $scope.$on('patCore:load-location-display', function (event) {
      ctrl.location = event.location;
      ctrl.init(event.location);
    });
  }

  $scope.$on('$destroy', function () {
    // unregister from observer for the appointment visibility
    let appointmentViewVisibleService = $injector.get(
      'AppointmentViewVisibleService'
    );
    appointmentViewVisibleService.clearObserver(
      ctrl.onAppointmentViewVisibleChange
    );
    appointmentViewVisibleService.setAppointmentViewVisible(false);
    appointmentViewVisibleService.setSecondaryAppointmentViewVisible(false);
  });
}

UserDashboardController.prototype = Object.create(BaseCtrl.prototype);
