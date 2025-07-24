var AppointmentControl = angular
  .module('Soar.Schedule')
  .controller(
    'AppointmentViewAppointmentTypeDropdownController',
    AppointmentViewAppointmentTypeDropdownController
  );
AppointmentViewAppointmentTypeDropdownController.$inject = [
  '$scope',
  '$timeout',
  '$filter',
  'localize',
  'PatientLandingFactory',
  'locationService',
  'referenceDataService',
  'ProviderShowOnScheduleFactory',
];

function AppointmentViewAppointmentTypeDropdownController(
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
    'AppointmentViewAppointmentTypeDropdownController'
  );
  var ctrl = this;

  $scope.isOpen = false;

  ctrl.init = init;
  function init() {
    let selection = _.find($scope.appointmentTypes, function (item) {
      return item.AppointmentTypeId === $scope.selectedAppointmentType;
    });

    $scope.selectedItem = selection;
  }

  $scope.btnClick = btnClick;
  function btnClick() {
    if ($scope.isOpen) {
      $scope.isOpen = false;
    } else {
      $scope.isOpen = true;
      $scope.selectedTypeFound = false;
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
      $scope.selectedAppointmentType = selectedItem.AppointmentTypeId;
    }
    $scope.isOpen = false;
  }

  //Filter dropdown by key input
  $scope.tempfilteredTypeChar = ''; //variable to track last entry
  $scope.repeatedTypeSearch = 0; //variable to see how many repeated key inputs of same value to continue filter
  $scope.keyFilter = function keyFilter(keyEvent) {
    if ($scope.isOpen) {
      var filteredChar = String.fromCharCode(keyEvent.keyCode);
      //checking to add aditional repeat or set global to new value
      if ($scope.tempfilteredTypeChar === filteredChar.toLowerCase()) {
        $scope.repeatedTypeSearch += 1;
      }
      if ($scope.tempfilteredTypeChar !== filteredChar.toLowerCase()) {
        $scope.repeatedTypeSearch = 0;
      }
      var tempRepeatValue = $scope.repeatedTypeSearch;

      //loop through types list and search for name match & repeat match
      for (let element of $scope.appointmentTypes) {
        if (
          element &&
          element.Name &&
          element.Name.trim().substring(0, 1).toLowerCase() ===
            filteredChar.toLowerCase()
        ) {
          if (tempRepeatValue === 0) {
            $scope.tempfilteredTypeChar = filteredChar.toLowerCase();
            $scope.selectedAppointmentType = element.AppointmentTypeId;
            $scope.selectedItem = element;
            $scope.selectedTypeFound = false;
            break;
          }
          tempRepeatValue -= 1;
        }
      }
    }
  };

  //scroll to type filtered by typing
  $scope.scrollToSelectedType = function (
    dropdownListBox,
    index,
    lblOptionName
  ) {
    if (document.getElementById(lblOptionName + index)) {
      var topPos = document.getElementById(lblOptionName + index).offsetTop;
      //console.log(topPos);
      document.getElementById(dropdownListBox).scrollTop = topPos - 5;
      //Set to true so the scrollToSelectedStartTime function doesn't keep getting executed after it finds the selected time in the dropdown
      $scope.selectedTypeFound = true;
    }
  };

  ctrl.init();
}
AppointmentViewAppointmentTypeDropdownController.prototype = Object.create(
  BaseSchedulerCtrl.prototype
);
