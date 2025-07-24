var AppointmentControl = angular
  .module('Soar.Schedule')
  .controller(
    'AppointmentViewAppointmentStatusDropdownController',
    AppointmentViewAppointmentStatusDropdownController
  );
AppointmentViewAppointmentStatusDropdownController.$inject = [
  '$scope',
  '$timeout',
  '$filter',
  'localize',
  'PatientLandingFactory',
  'locationService',
  'referenceDataService',
  'ProviderShowOnScheduleFactory',
];

function AppointmentViewAppointmentStatusDropdownController(
  $scope,
  $timeout,
  $filter,
  localize,
  patientLandingfactory,
  locationService,
  referenceDataService,
  showOnScheduleFactory
) {
  BaseSchedulerCtrl.call(
    this,
    $scope,
    'AppointmentViewAppointmentStatusDropdownController'
  );
  var ctrl = this;

  $scope.isOpen = false;

  ctrl.init = init;
  function init() {
    let selection = _.find($scope.appointmentStatuses, function (item) {
      return item.AppointmentStatusId === $scope.selectedAppointmentStatus;
    });

    $scope.selectedItem = selection;
  }

  $scope.btnClick = btnClick;
  function btnClick() {
    if ($scope.isOpen) {
      $scope.isOpen = false;
    } else {
      $scope.isOpen = true;
    }
  }

  //close dropdown when it loses focus
  $scope.onBlur = onBlur;
  function onBlur() {
    if ($scope.isOpen) {
      $scope.isOpen = false;
    }
  }

  $scope.selectItem = selectItem;
  function selectItem(selectedItem) {
    $scope.selectedItem = selectedItem;
    if (selectedItem !== null) {
      $scope.selectedAppointmentStatus = selectedItem.AppointmentStatusId;
    }
    $scope.isOpen = false;
  }

  ctrl.init();
}
AppointmentViewAppointmentStatusDropdownController.prototype = Object.create(
  BaseSchedulerCtrl.prototype
);
