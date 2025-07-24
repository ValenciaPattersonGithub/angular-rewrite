'use strict';
angular
  .module('Soar.Patient')
  .controller('PerioReadingsController', [
    '$scope',
    'localize',
    '$routeParams',
    'patSecurityService',
    'toastrFactory',
    '$filter',
    'PatientPerioExamFactory',
    '$timeout',
    'ListHelper',
    'ExamState',
    '$location',
    PerioReadingsController,
  ]);
function PerioReadingsController(
  $scope,
  localize,
  $routeParams,
  patSecurityService,
  toastrFactory,
  $filter,
  patientPerioExamFactory,
  $timeout,
  listHelper,
  examState,
  $location
) {
  BaseCtrl.call(this, $scope, 'PerioReadingsController');
  // for queuing, perio-controller is listening for this in order to load the next one of these directives
  $timeout(function () {
    $scope.$emit('soar:perio-reading-directive-loaded');
  });

  var ctrl = this;
  $scope.filteredExam = [];
  $scope.inputArray = [0, 1, 2];
  $scope.viewOnly = false;

  //#region auth

  $scope.authAccess = patientPerioExamFactory.access();
  if (!$scope.authAccess.View) {
    toastrFactory.error(
      patSecurityService.generateMessage('soar-clin-cperio-view'),
      'Not Authorized'
    );
    event.preventDefault();
    $location.path('/');
  }

  //TODO do we need this?
  ctrl.determineAccess = function () {
    if ($scope.exam.ExamId === null) {
      $scope.viewOnly = !$scope.authAccess.Create;
    } else {
      $scope.viewOnly = !$scope.authAccess.Edit;
    }
  };

  //#endregion

  //#region determine which part of perio exam we are handling

  $scope.getToothRange = function (toothExam, from, to) {
    return function (exam) {
      return exam.ToothNumber > from && exam.ToothNumber <= to;
    };
  };

  // for dynamically drawing the correct amount of furcation inputs based on allowed furcation readings
  $scope.readingAllowed = function (totalAllowedReadings, x) {
    var result;
    switch (totalAllowedReadings) {
      case 3:
        result = true;
        break;
      case 2:
        result = x === 2 ? false : true;
        break;
      default:
        result = false;
    }
    return result;
  };

  $scope.dynamicToothOrder = 'ToothNumber';

  ctrl.filterExam = function () {
    switch ($scope.quadrant) {
      case 'UB':
        $scope.rangeStart = 0;
        $scope.rangeEnd = 16;
        $scope.dynamicToothOrder = 'ToothNumber';
        break;
      case 'UL':
        $scope.rangeStart = 0;
        $scope.rangeEnd = 16;
        $scope.dynamicToothOrder = 'ToothNumber';
        break;
      case 'LL':
        $scope.rangeStart = 16;
        $scope.rangeEnd = 32;
        if ($scope.examType === 'FurcationGradeRoot') {
          $scope.inputArray = [0, 1, 2];
        }
        $scope.dynamicToothOrder = '-ToothNumber';
        break;
      case 'LB':
        $scope.rangeStart = 16;
        $scope.rangeEnd = 32;
        if ($scope.examType === 'FurcationGradeRoot') {
          $scope.inputArray = [0, 1, 2];
        }
        $scope.dynamicToothOrder = '-ToothNumber';
        break;
    }
  };

  //
  $scope.isVisible = function (inputType) {
    var result = false;
    switch (inputType) {
      case 'default':
        result =
          $scope.examType !== 'BleedingPocket' &&
          $scope.examType !== 'SuppurationPocket' &&
          $scope.examType !== 'Mobility' &&
          $scope.examType !== 'FurcationGradeRoot';
        break;
      case 'bldg_supp':
        result =
          $scope.examType === 'BleedingPocket' ||
          $scope.examType === 'SuppurationPocket';
        break;
      case 'mobility':
        result = $scope.examType === 'Mobility';
        break;
      case 'furcation':
        result = $scope.examType === 'FurcationGradeRoot';
        break;
    }
    return result;
  };

  //#endregion

  $scope.isActiveExam = function (exam) {
    return patientPerioExamFactory.ActiveExam === exam;
  };

  $scope.examToggle = function (exam) {
    patientPerioExamFactory.setActiveExamType(
      listHelper.findItemByFieldValue(
        patientPerioExamFactory.ExamTypes,
        'Type',
        exam
      )
    );
  };

  ctrl.setDisabledFlags = function () {
    if ($scope.disabledInputs) {
      $scope.disabledInputs = $scope.disabledInputs;
    } else {
      $scope.disabledInputs = false;
    }
  };

  $scope.isGreaterThanAlertLevel = function (examType, value) {
    var result = false;
    if (value) {
      switch (examType) {
        case 'DepthPocket':
          result =
            value >= patientPerioExamFactory.AlertLevels.DepthPocket
              ? true
              : false;
          break;
        case 'GingivalMarginPocket':
          if (value < 0) {
            result =
              value <=
              patientPerioExamFactory.AlertLevels.GingivalMarginPocket * -1
                ? true
                : false;
          } else {
            result =
              value >= patientPerioExamFactory.AlertLevels.GingivalMarginPocket
                ? true
                : false;
          }
          break;
        case 'AttachmentLvl':
          if (value < 0) {
            result =
              value <= patientPerioExamFactory.AlertLevels.AttachmentLevel * -1
                ? true
                : false;
          } else {
            result =
              value >= patientPerioExamFactory.AlertLevels.AttachmentLevel
                ? true
                : false;
          }
          break;
      }
    }
    return result;
  };

  //
  $scope.isActiveTooth = function (toothId) {
    return patientPerioExamFactory.ActiveTooth === toothId;
  };

  //
  $scope.isActiveToothIndex = function (index) {
    return patientPerioExamFactory.ActiveToothIndex === index;
  };

  // this is called via ng-click on the inputs (divs), updated activeExamType and patientPerioExamFactory.FocusedIndex
  $scope.inputClicked = function (examType, toothId, index, toothNumber) {
    if ($scope.examStarted) {
      patientPerioExamFactory.setActiveExamType(
        listHelper.findItemByFieldValue(
          patientPerioExamFactory.ExamTypes,
          'Type',
          examType
        )
      );
      $timeout(function () {
        var focusedIndex =
          patientPerioExamFactory.ActiveExamPath.ToothPockets.indexOf(
            toothNumber + ',' + index
              );

        if (focusedIndex != patientPerioExamFactory.FocusedIndex) {
            //We're clicking on a different tooth pocket, reset isNegativeNumber to false
            //If we click on the same tooth, then leave isNegativeNumber alone            
            patientPerioExamFactory.IsGMNegativeMode = false;
        }
        patientPerioExamFactory.setFocusedIndex(focusedIndex);

        // patientPerioExamFactory.FocusedIndex >= 0 indicates a valid selection
        // only allow bleeding / suppuration inputs on valid tooth selections
        if (patientPerioExamFactory.FocusedIndex >= 0) {
          if (
            (examType && examType === 'BleedingPocket') ||
            examType === 'SuppurationPocket'
          ) {
            $scope.updateBleedingSuppuration(toothId, index);
          }
        }
      }, 0);
    }
  };

  $scope.updateBleedingSuppuration = function (toothId, index) {
    var toothReadings = listHelper.findItemByFieldValue(
      $scope.exam,
      'ToothId',
      toothId
    );
    if (toothReadings) {
      if (
        !toothReadings.BleedingPocket[index] &&
        !toothReadings.SuppurationPocket[index]
      ) {
        toothReadings.BleedingPocket[index] = true;
      } else if (
        toothReadings.BleedingPocket[index] &&
        !toothReadings.SuppurationPocket[index]
      ) {
        toothReadings.SuppurationPocket[index] = true;
        toothReadings.BleedingPocket[index] = false;
      } else if (
        !toothReadings.BleedingPocket[index] &&
        toothReadings.SuppurationPocket[index]
      ) {
        toothReadings.SuppurationPocket[index] = true;
        toothReadings.BleedingPocket[index] = true;
      } else {
        toothReadings.SuppurationPocket[index] = false;
        toothReadings.BleedingPocket[index] = false;
      }
      patientPerioExamFactory.ActiveTooth = toothId;
    }
  };

  //
  $scope.$watch(
    function () {
      return patientPerioExamFactory.ExamTypes;
    },
    function () {
      $scope.activeExamType = $filter('filter')(
        patientPerioExamFactory.ExamTypes,
        { Active: true }
      )[0];
    },
    true
  );

  //TODO most of these can be handled as default
  $scope.$watch(
    function () {
      return patientPerioExamFactory.ExamState;
    },
    function (nv) {
      var status = nv;
      switch (status) {
        case examState.Save:
          break;
        case examState.SaveComplete:
          $scope.examStarted = false;
          $scope.viewOnly = true;
          break;
        case examState.Cancel:
          break;
        case examState.Start:
          $scope.viewOnly = false;
          $scope.examStarted = true;
          break;
        case examState.EditMode:
          $scope.viewOnly = false;
          $scope.examStarted = true;
          break;
        case examState.None:
          $scope.initializingExam = false;
          $scope.examStarted = false;
          break;
        case examState.Initializing:
          $scope.initializingExam = true;
          $scope.examStarted = false;
          break;
        case examState.Loading:
          $scope.examStarted = true;
          break;
        case examState.ViewMode:
          $scope.viewOnly = true;
          break;
      }
    }
  );

  // returns the css classes for coloring the bleeding/suppuration circle
  $scope.getBleedingSuppClasses = function (toothId, examType, index) {
    var cssClasses = '';
    if ($scope.isActiveExam(examType) && !$scope.isActiveTooth(toothId)) {
      cssClasses = cssClasses.concat('activeExam ');
    } else if ($scope.isActiveTooth(toothId)) {
      cssClasses = cssClasses.concat('activeTooth ');
    }
    if (examType === 'BleedingPocket' || examType === 'SuppurationPocket') {
      var toothReadings = listHelper.findItemByFieldValue(
        $scope.exam,
        'ToothId',
        toothId
      );
      if (toothReadings) {
        if (
          toothReadings.BleedingPocket[index] === true &&
          toothReadings.SuppurationPocket[index] === true
        ) {
          cssClasses = cssClasses.concat('both');
        } else if (toothReadings.BleedingPocket[index] === true) {
          cssClasses = cssClasses.concat('bleeding');
        } else if (toothReadings.SuppurationPocket[index] === true) {
          cssClasses = cssClasses.concat('suppuration');
        }
      }
    }
    return cssClasses;
  };

  //
  ctrl.$onInit = function () {
    ctrl.ua = window.navigator.userAgent;
    ctrl.setDisabledFlags();
    ctrl.filterExam();
    ctrl.determineAccess();
  };
}

PerioReadingsController.prototype = Object.create(BaseCtrl.prototype);
