var AppointmentControl = angular
  .module('Soar.Schedule')
  .controller(
    'AppointmentViewLocationDropdownController',
    AppointmentViewLocationDropdownController
  );
AppointmentViewLocationDropdownController.$inject = [
  '$scope',
  '$timeout',
  '$filter',
  'localize',
  'PatientLandingFactory',
  'locationService',
  'referenceDataService',
  'ProviderShowOnScheduleFactory',
];

function AppointmentViewLocationDropdownController(
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
    'AppointmentViewProviderDropdownController'
  );
  var ctrl = this;

  $scope.isOpen = false;

  ctrl.init = init;
  function init() {
    //debugger;

    let selection = null;
    for (let i = 0; i < $scope.locations.length; i++) {
      let group = $scope.locations[i].Data;
      for (let x = 0; x < group.length; x++) {
        if (group[x].LocationId === $scope.selectedLocation) {
          selection = group[x];
        }
      }
    }

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
    //debugger;
    $scope.selectedItem = selectedItem;
    if (selectedItem !== null) {
      $scope.selectedLocation = selectedItem.LocationId;
    }
    $scope.isOpen = false;
  }

  ctrl.init();
}
AppointmentViewLocationDropdownController.prototype = Object.create(
  BaseSchedulerCtrl.prototype
);
