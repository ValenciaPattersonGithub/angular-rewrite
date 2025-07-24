var AppointmentControl = angular
  .module('Soar.Schedule')
  .controller(
    'AppointmentViewRoomDropdownController',
    AppointmentViewRoomDropdownController
  );
AppointmentViewRoomDropdownController.$inject = [
  '$scope',
  '$timeout',
  '$filter',
  'localize',
  'PatientLandingFactory',
  'locationService',
  'referenceDataService',
  'ProviderShowOnScheduleFactory',
];

function AppointmentViewRoomDropdownController(
  $scope,
  $timeout,
  $filter,
  localize,
  patientLandingfactory,
  locationService,
  referenceDataService,
  showOnScheduleFactory
) {
  BaseSchedulerCtrl.call(this, $scope, 'AppointmentViewRoomDropdownController');
  var ctrl = this;

  $scope.isOpen = false;
  $scope.placeHolder = $scope.placeHolder
    ? $scope.placeHolder
    : '- Select a Room -';

  ctrl.resetSelectedItem = resetSelectedItem;
  function resetSelectedItem() {
    let selection = null;
    if ($scope.selectedRoom !== null) {
      selection = _.find($scope.rooms, function (item) {
        return item.RoomId === $scope.selectedRoom;
      });
    }
    $scope.selectedItem = selection;
  }
  $scope.$watch('selectedRoom', function (nv, ov) {
    if (!_.isNil(nv) && nv !== ov) {
      ctrl.resetSelectedItem();
    }
  });

  ctrl.init = init;
  function init() {
    ctrl.resetSelectedItem();
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
      $scope.selectedRoom = selectedItem.RoomId;
    } else {
      $scope.selectedRoom = null;
    }

    $scope.isOpen = false;
  }

  ctrl.init();
}
AppointmentViewRoomDropdownController.prototype = Object.create(
  BaseSchedulerCtrl.prototype
);
