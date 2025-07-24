'use strict';
angular.module('Soar.Patient').controller('PerioReadingsPrintController', [
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
  function (
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

    //
    $scope.getInputArray = function (toothExam) {
      var surface;
      switch ($scope.quadrant) {
        case 'UB':
        case 'LB':
          surface = 'B';
          break;
        case 'UL':
        case 'LL':
          surface = 'L';
          break;
      }
      return patientPerioExamFactory.getInputArrayForTooth(
        $scope.examType,
        surface,
        toothExam
      );
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

    $scope.examToggle = function (exam, quadrant) {
      if (exam !== 'AttachmentLvl') {
        patientPerioExamFactory.setActiveExam(exam);
        // notify tooth nav that exam was toggled from main perio
        switch (quadrant) {
          case 'UB':
            patientPerioExamFactory.setActiveExamParameters(
              'upper',
              'buccal',
              exam
            );
            break;
          case 'UL':
            patientPerioExamFactory.setActiveExamParameters(
              'upper',
              'lingual',
              exam
            );
            break;
          case 'LL':
            patientPerioExamFactory.setActiveExamParameters(
              'lower',
              'lingual',
              exam
            );
            break;
          case 'LB':
            patientPerioExamFactory.setActiveExamParameters(
              'lower',
              'buccal',
              exam
            );
            break;
        }
        patientPerioExamFactory.setToggleExam(true);
      }
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
                value >=
                patientPerioExamFactory.AlertLevels.GingivalMarginPocket
                  ? true
                  : false;
            }
            break;
          case 'AttachmentLvl':
            if (value < 0) {
              result =
                value <=
                patientPerioExamFactory.AlertLevels.AttachmentLevel * -1
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

    // Teeth 1-16 Buccal (top), 16-1 Lingual (bottom), 32-17 Buccal (top), 17-32 Lingual (bottom)
    // default path object
    ctrl.defaultPath = [
      {
        arch: 'upper',
        side: 'buccal',
        direction: 'forward',
        row: 'UB_DepthPocket',
        examType: 'DepthPocket',
      },
      {
        arch: 'upper',
        side: 'lingual',
        direction: 'reverse',
        row: 'UL_DepthPocket',
        examType: 'DepthPocket',
      },
      {
        arch: 'lower',
        side: 'buccal',
        direction: 'forward',
        row: 'LB_DepthPocket',
        examType: 'DepthPocket',
      },
      {
        arch: 'lower',
        side: 'lingual',
        direction: 'reverse',
        row: 'LL_DepthPocket',
        examType: 'DepthPocket',
      },
      {
        arch: 'upper',
        side: 'buccal',
        direction: 'forward',
        row: 'UB_GingivalMarginPocket',
        examType: 'GingivalMarginPocket',
      },
      {
        arch: 'upper',
        side: 'lingual',
        direction: 'reverse',
        row: 'UL_GingivalMarginPocket',
        examType: 'GingivalMarginPocket',
      },
      {
        arch: 'lower',
        side: 'buccal',
        direction: 'forward',
        row: 'LB_GingivalMarginPocket',
        examType: 'GingivalMarginPocket',
      },
      {
        arch: 'lower',
        side: 'lingual',
        direction: 'reverse',
        row: 'LL_GingivalMarginPocket',
        examType: 'GingivalMarginPocket',
      },
      {
        arch: 'upper',
        side: 'buccal',
        direction: 'forward',
        row: 'UB_BleedingPocket',
        examType: 'BleedingPocket',
      },
      {
        arch: 'upper',
        side: 'lingual',
        direction: 'reverse',
        row: 'UL_BleedingPocket',
        examType: 'BleedingPocket',
      },
      {
        arch: 'lower',
        side: 'buccal',
        direction: 'forward',
        row: 'LB_BleedingPocket',
        examType: 'BleedingPocket',
      },
      {
        arch: 'lower',
        side: 'lingual',
        direction: 'reverse',
        row: 'LL_BleedingPocket',
        examType: 'BleedingPocket',
      },
      {
        arch: 'upper',
        side: 'buccal',
        direction: 'forward',
        row: 'UB_SuppurationPocket',
        examType: 'SuppurationPocket',
      },
      {
        arch: 'upper',
        side: 'lingual',
        direction: 'reverse',
        row: 'UL_SuppurationPocket',
        examType: 'SuppurationPocket',
      },
      {
        arch: 'lower',
        side: 'buccal',
        direction: 'forward',
        row: 'LB_SuppurationPocket',
        examType: 'SuppurationPocket',
      },
      {
        arch: 'lower',
        side: 'lingual',
        direction: 'reverse',
        row: 'LL_SuppurationPocket',
        examType: 'SuppurationPocket',
      },
      {
        arch: 'upper',
        side: 'buccal',
        direction: 'forward',
        row: 'UB_MgjPocket',
        examType: 'MgjPocket',
      },
      {
        arch: 'upper',
        side: 'lingual',
        direction: 'reverse',
        row: 'UL_MgjPocket',
        examType: 'MgjPocket',
      },
      {
        arch: 'lower',
        side: 'buccal',
        direction: 'forward',
        row: 'LB_MgjPocket',
        examType: 'MgjPocket',
      },
      {
        arch: 'lower',
        side: 'lingual',
        direction: 'reverse',
        row: 'LL_MgjPocket',
        examType: 'MgjPocket',
      },
      {
        arch: 'upper',
        side: 'buccal',
        direction: 'forward',
        row: 'UB_Mobility',
        examType: 'Mobility',
      },
      {
        arch: 'lower',
        side: 'buccal',
        direction: 'reverse',
        row: 'LB_Mobility',
        examType: 'Mobility',
      },
      {
        arch: 'upper',
        side: 'buccal',
        direction: 'forward',
        row: 'UB_FurcationGradeRoot',
        examType: 'FurcationGradeRoot',
      },
      {
        arch: 'lower',
        side: 'buccal',
        direction: 'reverse',
        row: 'LB_FurcationGradeRoot',
        examType: 'FurcationGradeRoot',
      },
    ];

    //
    $scope.isActiveTooth = function (toothId) {
      return patientPerioExamFactory.ActiveTooth === toothId;
    };

    //
    $scope.isActiveToothIndex = function (index) {
      return patientPerioExamFactory.ActiveToothIndex === index;
    };

    // this is called via ng-focus on the inputs,
    // activeTooth needs to be set before ng-keyup fires to keep input and chart active state in sync
    $scope.activate = function (toothId, quadrant, exam, index) {
      if (exam !== 'AttachmentLvl') {
        patientPerioExamFactory.setActiveExam(exam);
        patientPerioExamFactory.setActiveTooth(toothId);
        patientPerioExamFactory.setActiveQuadrant(quadrant);
        patientPerioExamFactory.setActiveToothIndex(index);
        switch (quadrant) {
          case 'UB':
            patientPerioExamFactory.setActiveExamParameters(
              'upper',
              'buccal',
              exam
            );
            break;
          case 'UL':
            patientPerioExamFactory.setActiveExamParameters(
              'upper',
              'lingual',
              exam
            );
            break;
          case 'LL':
            patientPerioExamFactory.setActiveExamParameters(
              'lower',
              'lingual',
              exam
            );
            break;
          case 'LB':
            patientPerioExamFactory.setActiveExamParameters(
              'lower',
              'buccal',
              exam
            );
            break;
        }
        patientPerioExamFactory.setToggleExam(true);
      }
      // this is only used to notify the tooth nav to change focus
      patientPerioExamFactory.setActivePerioFocus(true);
    };

    // helper method for finding inputs that are not disabled, used for skipped missing/disabled teeth
    ctrl.getNextEnabledInput = function (parent, path, directionOverride) {
      var input;
      var direction = directionOverride ? directionOverride : path.direction;
      var parentsNextSiblings =
        direction === 'forward' ? parent.nextAll() : parent.prevAll();
      var index =
        direction === 'forward' || path.examType === 'Mobility' ? 0 : 2;
      angular.forEach(parentsNextSiblings, function (sib) {
        sib = angular.element(sib);
        if (!input && sib.children()[index].disabled !== true) {
          input = sib.children()[index];
        } else if (
          !input &&
          sib.children()[index - 1] &&
          sib.children()[index - 1].disabled !== true
        ) {
          // furcation might have a disabled input in the 3rd position, looking for an enabled input in the second position
          input = sib.children()[index - 1];
        }
      });
      return input;
    };

    // used for keyboard navigation to find the previous or next perio readings row
    ctrl.getNextIndex = function (perioReadsDivs, path, direction, increment) {
      var nextIndex;
      angular.forEach(perioReadsDivs, function (div, $index) {
        var div = angular.element(div);
        var row = div.find('.perioInputs__row');
        if (row && row[0].id === path.row) {
          if (direction === 'up' && $index !== 0) {
            nextIndex = $index - (1 + increment);
          } else if (direction === 'down' && $index !== 27) {
            nextIndex = $index + (1 + increment);
          }
        }
      });
      return nextIndex;
    };

    // used for keyboard navigation to find the next input to focus on when moving up and down
    ctrl.getNextInput = function (
      perioReadsDivs,
      nextIndex,
      event,
      path,
      index,
      direction
    ) {
      var nextPerioReadDiv = angular.element(perioReadsDivs[nextIndex]);
      var prefix = event.target.id.slice(
        0,
        event.target.id.indexOf(path.examType)
      );
      // getting the examType of the div that we are navigating to
      var cls;
      angular.forEach(ctrl.defaultPath, function (item) {
        if (nextPerioReadDiv.hasClass(item.examType)) {
          cls = item.examType;
        }
      });
      var idx = !angular.isUndefined(index) ? index : 1;
      var idOfDestinationInput = prefix + cls + idx;
      // special case for mobility because it only has one input per tooth
      if (cls === 'Mobility') {
        idOfDestinationInput = idOfDestinationInput.slice(
          0,
          idOfDestinationInput.length - 1
        );
      }
      var nextInput = nextPerioReadDiv.find('#' + idOfDestinationInput);
      if (nextInput.length === 0) {
        // drilling down into next side
        idx = direction === 'down' ? idx + 3 : idx - 3;
        idOfDestinationInput = prefix + cls + idx;
        nextInput = nextPerioReadDiv.find('#' + idOfDestinationInput);
        if (nextInput.length === 0) {
          // jumping to the next arch
          idx = direction === 'down' ? index - 3 : index + 3;
          var toothNumberFromPrefix = prefix.slice(3);
          var newNumber =
            direction === 'down'
              ? parseInt(toothNumberFromPrefix) + 16
              : parseInt(toothNumberFromPrefix) - 16;
          prefix = prefix.slice(0, 3) + newNumber;
          idOfDestinationInput = prefix + cls + idx;
          nextInput = nextPerioReadDiv.find('#' + idOfDestinationInput);
        }
      }
      return nextInput;
    };

    $scope.numberIsNegative = false;
    $scope.ieQueue = [];

    // calculate Cal
    ctrl.calcAttachmentLvl = function (toothExam, examType, index) {
      if (
        toothExam.ToothId != null &&
        (examType === 'DepthPocket' || examType === 'GingivalMarginPocket')
      ) {
        // make sure the AttachmentLvl field exists
        if (!toothExam.AttachmentLvl) {
          toothExam.AttachmentLvl = [];
        }
        // loop through exam to set each in array of values
        for (var i = 0; i < 6; i++) {
          // if both values are null so is the AttachmentLvl
          if (
            toothExam.GingivalMarginPocket[i] === null &&
            toothExam.DepthPocket[i] === null
          ) {
            toothExam.AttachmentLvl[i] = null;
          } else {
            var gm = !toothExam.GingivalMarginPocket[i]
              ? 0
              : parseInt(toothExam.GingivalMarginPocket[i], 10);
            var dp = !toothExam.DepthPocket[i]
              ? 0
              : parseInt(toothExam.DepthPocket[i], 10);
            var attachment = 0;
            attachment = dp + gm;
            toothExam.AttachmentLvl[i] = attachment !== 0 ? attachment : '';
          }
        }
      }
    };

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

    // if a minus sign is pressed, set the numberIsNegative
    ctrl.setNumberIsNegative = function (event) {
      if (
        event &&
        event.keyCode &&
        (event.keyCode === 109 || event.keyCode === 189)
      ) {
        $scope.numberIsNegative = true;
      }
    };

    // when numberIsNegative=true, set input to negative number and reset numberIsNegative
    ctrl.setNegativeInput = function (toothExam, examType, index) {
      if ($scope.numberIsNegative && examType === 'GingivalMarginPocket') {
        var negativeValue = toothExam.GingivalMarginPocket[index] * -1;
        toothExam.GingivalMarginPocket[index] = negativeValue;
        $scope.numberIsNegative = false;
      }
    };

    // returns the css classes for coloring the bleeding/suppuration circle
    $scope.getBleedingSuppClasses = function (
      toothId,
      examType,
      index,
      toothState
    ) {
      var cssClasses = '';
      if ($scope.isActiveExam(examType) && !$scope.isActiveTooth(toothId)) {
        cssClasses = cssClasses.concat('activeExam ');
      } else if ($scope.isActiveTooth(toothId)) {
        cssClasses = cssClasses.concat('activeTooth ');
      }
      if (toothState === 'MissingPrimary') {
        cssClasses = cssClasses.concat('missing ');
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
  },
]);
