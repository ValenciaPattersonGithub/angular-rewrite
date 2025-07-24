'use strict';

var app = angular.module('Soar.Patient');

app.controller('PerioNavReadingsController', [
  '$scope',
  '$routeParams',
  '$filter',
  '$timeout',
  'localize',
  'PatientPerioExamFactory',
  'ModalFactory',
  'ExamState',
  'ListHelper',
  '$location',
  'toastrFactory',
  'patSecurityService',
  PerioNavReadingsController,
]);
function PerioNavReadingsController(
  $scope,
  $routeParams,
  $filter,
  $timeout,
  localize,
  patientPerioExamFactory,
  modalFactory,
  examState,
  listHelper,
  $location,
  toastrFactory,
  patSecurityService
) {
  BaseCtrl.call(this, $scope, 'PerioNavReadingsController');
  var ctrl = this;

  ctrl.$onInit = function () {
    ctrl.isIE =
      window.navigator.userAgent.indexOf('MSIE ') > 0 ||
      window.navigator.userAgent.indexOf('Trident/') > 0;
    $scope.authAccess = patientPerioExamFactory.access();
    if (!$scope.authAccess.View) {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-clin-cperio-view'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    }
    $scope.viewOnly = false;
    $scope.disableInputs = true;
    ctrl.setExamTitle($scope.examType);
    ctrl.acceptableKeyCodesForExam = patientPerioExamFactory.AcceptableKeyCodes(
      $scope.examType
    );
    ctrl.getDefaultInputArray();
    patientPerioExamFactory.observeFocusedIndex(
      ctrl.respondToFactoryPropertyChange
    );
  };

  //#region watchers

  //
  $scope.$watch(
    function () {
      return patientPerioExamFactory.ActiveExamPath;
    },
    function (nv, ov) {
      if (nv && ov && !angular.equals(nv, ov)) {
        //When the examtype changes it stores the index of the current tooth
        //if that index exists in the pockets of the new exam type it will set the focus appropriately
        var toothNumber = ctrl.getToothNumberFromToothId(
          patientPerioExamFactory.ActiveTooth
        );
        var index = nv.ToothPockets.indexOf(toothNumber + ',0');
        if (index < 0) {
          patientPerioExamFactory.setFocusedIndex(0);
          patientPerioExamFactory.ActiveTooth = '1';
          $scope.activeTooth = '1';
        } else {
          var focusedIndex = nv.ToothPockets.indexOf(toothNumber + ',0');
          patientPerioExamFactory.setFocusedIndex(focusedIndex);
        }
      }
      ctrl.respondToFactoryPropertyChange(nv);
    },
    true
  );

  //
  $scope.$watch(
    function () {
      return patientPerioExamFactory.ActivePerioExam;
    },
    function (nv) {
      ctrl.respondToFactoryPropertyChange(nv);
    },
    true
  );

  //
  $scope.$watch(
    function () {
      return patientPerioExamFactory.ExamTypes;
    },
    function (nv) {
      $scope.activeExamType = $filter('filter')(nv, { Active: true })[0];
      if (
        nv &&
        patientPerioExamFactory.ActivePerioExam &&
        $scope.activeExamType &&
        angular.equals($scope.activeExamType.Abbrev, $scope.examTypeAbbrev) &&
        $scope.arch === $scope.activeArch
      ) {
        patientPerioExamFactory.filterActiveExamPath(
          $scope.activeExamType.Type
        );
      }
      ctrl.respondToFactoryPropertyChange(nv);
    },
    true
  );

  // listening for changes to ExamState for disabling/enabling inputs
  $scope.$watch(
    function () {
      return patientPerioExamFactory.ExamState;
    },
    function (nv) {
      var status = nv;
      switch (status) {
        case examState.Start:
          $scope.disabledInputs = false;
          break;
        case examState.SaveComplete:
          $scope.disabledInputs = false;
          break;
        case examState.EditMode:
          $scope.disabledInputs = false;
          $timeout(function () {
            ctrl.respondToFactoryPropertyChange(nv);
          }, 200);
          break;
        default:
          $scope.disableInputs = true;
          break;
      }
    }
  );

  // furcation array updated on toothExam changes
  $scope.$watch(
    'toothExam',
    function (nv) {
      if (nv) {
        ctrl.setInputArrayForFurcation();
        ctrl.setInputArray();
      }
    },
    true
  );

  //#endregion

  //#region private/helpers

  //
  ctrl.respondToFactoryPropertyChange = function (nv) {
    if (
      (nv || nv === 0) &&
      $scope.activeExamType &&
      angular.equals($scope.activeExamType.Abbrev, $scope.examTypeAbbrev) &&
      $scope.arch === $scope.activeArch
    ) {
      ctrl.assignSelectorAndActiveTooth();
    }
  };

  var fgTeeth = '1;2;3;4;5;12;13;14;15;16;17;18;19;20;21;28;29;30;31;32';
  var fgTeethArray = fgTeeth.split(';');

  ctrl.getNextExam = function (currentExam) {
    if (currentExam && patientPerioExamFactory) {
      var nextExam = patientPerioExamFactory.ExamTypes[
        patientPerioExamFactory.ExamTypes.indexOf(currentExam) + 1
      ]
        ? patientPerioExamFactory.ExamTypes[
            patientPerioExamFactory.ExamTypes.indexOf(currentExam) + 1
          ]
        : patientPerioExamFactory.ExamTypes[0];
      // If next exam is fg and no fg isn't allowed, get the next
      if (nextExam && nextExam.Abbrev == 'fg') {
        let found = $scope.chartedTeeth.some(r => fgTeethArray.indexOf(r) >= 0);
        if (!found) {
          var nextExam = patientPerioExamFactory.ExamTypes[
            patientPerioExamFactory.ExamTypes.indexOf(nextExam) + 1
          ]
            ? patientPerioExamFactory.ExamTypes[
                patientPerioExamFactory.ExamTypes.indexOf(nextExam) + 1
              ]
            : patientPerioExamFactory.ExamTypes[0];

          return nextExam;
        }
      }
      return nextExam;
    }
  };

  //
  ctrl.assignSelectorAndActiveTooth = function (index) {
    if (patientPerioExamFactory.ActiveExamPath) {
      var toothPocket =
        patientPerioExamFactory.ActiveExamPath.ToothPockets[
          patientPerioExamFactory.FocusedIndex
        ];
      if (toothPocket === undefined) {
        toothPocket = $scope.activeTooth + ',0';
      }
      var toothId = ctrl.getToothIdFromToothNumber(
        toothPocket.substring(0, toothPocket.indexOf(','))
      );
      ctrl.nextSelector =
        $scope.quadrant +
        '_' +
        $scope.activeExamType.Abbrev +
        '_' +
        toothId +
        '_' +
        toothPocket.slice(toothPocket.indexOf(',') + 1);
      if ($scope.activeTooth != toothId) {
        patientPerioExamFactory.setActiveTooth(toothId);
      }

      index = index
        ? index
            : ctrl.nextSelector.substr(ctrl.nextSelector.lastIndexOf('_') + 1);        
      ctrl.focusInput(index);
    }
  };

  //
  ctrl.focusInput = function (index) {
    // getting the input array for tooth, different for each side of mouth
    if (patientPerioExamFactory.ActivePerioExam) {
      $scope.$$postDigest(function () {
        if (document.getElementById(ctrl.nextSelector)) {
          document.getElementById(ctrl.nextSelector).focus();
          if (
            $scope.activeTooth > 16 ||
            'KLMNOPQRST'.indexOf($scope.activeTooth) > -1
          ) {
            window.scrollTo(0, document.body.scrollHeight);
          } else {
            window.scrollTo(0, 0);
          }
          ctrl.updateKeypadModel($scope.activeTooth, $scope.examType);
        }
      });
      // for side chamge ie
      if (ctrl.isIE) {
        $timeout(function () {
          document.getElementById(ctrl.nextSelector).focus();
        }, 500);
      }
    }
  };

  //
  ctrl.updateKeypadModel = function (toothId, examType) {
    $scope.keypadModel.activeTooth = toothId;
    $scope.keypadModel.examType = examType;
    $scope.keypadModel.surface = $scope.surface;
    $scope.keypadModel.id = $scope.$id;
  };

  //
  ctrl.getDefaultInputArray = function () {
    switch ($scope.surface) {
      case 'B':
        $scope.inputArray = [0, 1, 2];
        $scope.inputArrayForFurcation = [0, 1, 2];
        break;
      case 'L':
        $scope.inputArray = [3, 4, 5];
        break;
    }
  };

  //
  ctrl.getExamTitleByType = function initGetExamTitleByType(examType) {
    var examTitlesByType = {
      DepthPocket: localize.getLocalizedString('Pocket Depth'),
      GingivalMarginPocket: localize.getLocalizedString('Gingival Margin'),
      MgjPocket: localize.getLocalizedString('M-G Junction'),
      Mobility: localize.getLocalizedString('Mobility'),
      SuppurationPocket: localize.getLocalizedString('Suppuration'),
      FurcationGradeRoot: localize.getLocalizedString('FG'),
      BleedingPocket: localize.getLocalizedString('Bleeding'),
      AttachmentLvl: localize.getLocalizedString('Attachment LVL'),
    };
    ctrl.getExamTitleByType = function getExamTitleByType(examType) {
      return examTitlesByType[examType];
    };
    return ctrl.getExamTitleByType(examType);
  };

  //
  ctrl.setExamTitle = function setExamTitle(examType) {
    $scope.examTitle = ctrl.getExamTitleByType(examType);
  };

  // input array for furcation
  ctrl.setInputArrayForFurcation = function () {
    switch ($scope.quadrant) {
      case 'UB':
        switch ($scope.toothExam.$$FurcationReadingsAllowed) {
          case 2:
            $scope.inputArrayForFurcation = [0, 1];
            break;
          case 3:
            $scope.inputArrayForFurcation = [0, 1, 2];
            break;
          default:
            $scope.inputArrayForFurcation = [];
            break;
        }
        break;
      case 'LB':
        switch ($scope.toothExam.$$FurcationReadingsAllowed) {
          case 2:
            $scope.inputArrayForFurcation = [0, 1];
            break;
          case 3:
            $scope.inputArrayForFurcation = [0, 1, 2];
            break;
          default:
            $scope.inputArrayForFurcation = [];
            break;
        }
        break;
    }
  };

  // input array
  ctrl.setInputArray = function () {
    if (
      patientPerioExamFactory &&
      patientPerioExamFactory.ActivePerioExam &&
      patientPerioExamFactory.ActivePerioExam.ExamDetails
    ) {
      var examForActiveTooth = listHelper.findItemByFieldValue(
        patientPerioExamFactory.ActivePerioExam.ExamDetails,
        'ToothId',
        $scope.activeTooth
      );
      $scope.inputArray = patientPerioExamFactory.getInputArrayForTooth(
        $scope.examType,
        $scope.surface,
        examForActiveTooth
      );
    }
  };

  ctrl.getToothIdFromToothNumber = function (toothNumber) {
    if (
      patientPerioExamFactory &&
      patientPerioExamFactory.ActivePerioExam &&
      patientPerioExamFactory.ActivePerioExam.ExamDetails
    ) {
      var examForActiveTooth = listHelper.findItemByFieldValue(
        patientPerioExamFactory.ActivePerioExam.ExamDetails,
        'ToothNumber',
        toothNumber
      );
      return examForActiveTooth ? examForActiveTooth.ToothId : null;
    }
  };

  ctrl.getToothNumberFromToothId = function (toothId) {
    if (
      patientPerioExamFactory &&
      patientPerioExamFactory.ActivePerioExam &&
      patientPerioExamFactory.ActivePerioExam.ExamDetails
    ) {
      var examForActiveTooth = listHelper.findItemByFieldValue(
        patientPerioExamFactory.ActivePerioExam.ExamDetails,
        'ToothId',
        toothId
      );
      return examForActiveTooth ? examForActiveTooth.ToothNumber : null;
    }
  };

  //#endregion

  //#region used by the view

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

  $scope.inputBlur = function (readings, index) {
    if (readings && readings[index] && isNaN(parseInt(readings[index]))) {
      readings[index] = null;
    }
  };

  // used for advancing to next input and validation, etc.
  // this function has been "flattened" intentionally to try and improve performance - sg
  $scope.advance = function (
    event,
    index,
    examTypeParam,
    examTypeAbbrev,
    keypadModelValue
  ) {
      var examType = examTypeParam ? examTypeParam : $scope.examType;
      if (examType !== 'GingivalMarginPocket') {
          //We don't allow negative numbers on anything except Gingival Margin          
          patientPerioExamFactory.IsGMNegativeMode = false;
      }
    // if a minus sign is pressed, set numberIsNegative and don't advance
    if (event.keyCode === 109 || event.keyCode === 189) {

        //At this point if we are on Gingival Margin, we need to make keypad buttons 11-19 invalid
        if (examType === 'GingivalMarginPocket') {
            //Again, only Gingival Margin can be negative            
            patientPerioExamFactory.IsGMNegativeMode = true;            
        }


      // clearing input if negative was entered for anything other than GM
      if (ctrl.isIE) {
        // ie won't stay updated without this
        $timeout(function () {
          if (examType === 'Mobility') {
            $scope.toothExam[examType] = null;
          } else if (examType !== 'GingivalMarginPocket') {
            $scope.toothExam[examType][index] = null;
          }
        }, 100);
      } else {
        if (examType === 'Mobility') {
          $scope.toothExam[examType] = null;
        } else if (examType !== 'GingivalMarginPocket') {
          $scope.toothExam[examType][index] = null;
        }
      }
    } else {
      // only advance on acceptable input for exam
      if (
        ctrl.acceptableKeyCodesForExam.indexOf(event.keyCode) !== -1 ||
        keypadModelValue ||
        event.keyCode === 8 ||
        event.keyCode === 46 ||
        event.keyCode === 110
      ) {
        var valueFromCode = patientPerioExamFactory.ValueByKeyCode(
          event.keyCode
        )
          ? patientPerioExamFactory.ValueByKeyCode(event.keyCode)
          : keypadModelValue;
        // normal input handling, and allowing backspace and deletes (8, 46, 110) through so that CAL can be recalculated even when input is cleared
        if (
          valueFromCode ||
          event.keyCode === 8 ||
          event.keyCode === 46 ||
          event.keyCode === 110
        ) {
          // assigning values
          if (examType === 'Mobility') {
            $scope.toothExam[examType] = valueFromCode;
          } else {
            $scope.toothExam[examType][index] = valueFromCode;
          }
          // when numberIsNegative is true, set input to negative number and reset numberIsNegative          
          if (patientPerioExamFactory.IsGMNegativeMode == true && examType === 'GingivalMarginPocket') {
              var negativeValue = $scope.toothExam.GingivalMarginPocket[index] * -1;
              if (negativeValue == 0) {
                  $scope.toothExam.GingivalMarginPocket[index] = null;
              }
              else {
                  $scope.toothExam.GingivalMarginPocket[index] = negativeValue;
              }
                          
              patientPerioExamFactory.IsGMNegativeMode = false;              
          }
          // calculate attachment for DepthPocket and GingivalMarginPocket only
          if (
            $scope.toothExam.ToothId !== null &&
            (examType === 'DepthPocket' || examType === 'GingivalMarginPocket')
          ) {
            // make sure the AttachmentLvl field exists
            if (!$scope.toothExam.AttachmentLvl) {
              $scope.toothExam.AttachmentLvl = [];
            }
            // loop through exam to set each in array of values
            for (var i = 0; i < 6; i++) {
              // if both values are null so is the AttachmentLvl
              if (
                !$scope.toothExam.GingivalMarginPocket[i] &&
                !$scope.toothExam.DepthPocket[i]
              ) {
                $scope.toothExam.AttachmentLvl[i] = null;
              } else {
                var gm = !$scope.toothExam.GingivalMarginPocket[i]
                  ? 0
                  : parseInt($scope.toothExam.GingivalMarginPocket[i], 10);
                var dp = !$scope.toothExam.DepthPocket[i]
                  ? 0
                  : parseInt($scope.toothExam.DepthPocket[i], 10);
                var attachment = 0;
                attachment = dp + gm;
                $scope.toothExam.AttachmentLvl[i] = attachment;
              }
            }
          }
          // determine next target based on patientPerioExamFactory.ActiveExamPath.ToothPockets
          var focusedIndex = patientPerioExamFactory.FocusedIndex + 1;
          patientPerioExamFactory.setFocusedIndex(focusedIndex);

          if (
            !_.isNil(patientPerioExamFactory.ActiveExamPath) &&
            !patientPerioExamFactory.ActiveExamPath.ToothPockets[focusedIndex]
          ) {
            // starting over
            var currentExam = listHelper.findItemByFieldValue(
              patientPerioExamFactory.ExamTypes,
              'Abbrev',
              examTypeAbbrev
            );
            var nextExam = ctrl.getNextExam(currentExam);
            patientPerioExamFactory.setActiveExamType(nextExam);
            patientPerioExamFactory.setFocusedIndex(0);
          }
          ctrl.assignSelectorAndActiveTooth(index);
        } else if (event.keyCode === 66 || event.keyCode === 83) {
          // handle shortcut keys for bleeding and suppuration
          if ($scope.examType === 'Mobility') {
            $scope.toothExam[$scope.examType] = null;
          } else if (
            angular.equals(
              event.target.value,
              $scope.toothExam[$scope.examType][index]
            )
          ) {
            $scope.toothExam[$scope.examType][index] = null;
          }
          switch (event.keyCode) {
            case 66:
              $scope.toothExam['BleedingPocket'][index] =
                $scope.toothExam['BleedingPocket'][index] === true
                  ? false
                  : true;
              break;
            case 83:
              $scope.toothExam['SuppurationPocket'][index] =
                $scope.toothExam['SuppurationPocket'][index] === true
                  ? false
                  : true;
              break;
          }
        } else if (event.keyCode === 37 || event.keyCode === 39) {
          // arrow key navigation
          var focusedInvoice = 0;
          switch (event.keyCode) {
            case 37:
              focusedInvoice = patientPerioExamFactory.FocusedIndex - 1;
              patientPerioExamFactory.setFocusedIndex(focusedInvoice);
              break;
            case 39:
              //patientPerioExamFactory.FocusedIndex++;
              focusedInvoice = patientPerioExamFactory.FocusedIndex + 1;
              patientPerioExamFactory.setFocusedIndex(focusedInvoice);
              break;
          }
          if (
            !_.isNil(patientPerioExamFactory.ActiveExamPath) &&
            !patientPerioExamFactory.ActiveExamPath.ToothPockets[
              patientPerioExamFactory.FocusedIndex
            ]
          ) {
            // starting over
            var currentExam = listHelper.findItemByFieldValue(
              patientPerioExamFactory.ExamTypes,
              'Abbrev',
              examTypeAbbrev
            );
            var nextExam = patientPerioExamFactory.ExamTypes[
              patientPerioExamFactory.ExamTypes.indexOf(currentExam) + 1
            ]
              ? patientPerioExamFactory.ExamTypes[
                  patientPerioExamFactory.ExamTypes.indexOf(currentExam) + 1
                ]
              : patientPerioExamFactory.ExamTypes[0];
            patientPerioExamFactory.setActiveExamType(nextExam);
            patientPerioExamFactory.setFocusedIndex(0);
          }
          ctrl.assignSelectorAndActiveTooth(index);
        }
      } else if (event.target) {
        if (ctrl.isIE) {
          // ie won't stay updated without this
          $timeout(function () {
            if (examType === 'Mobility') {
              $scope.toothExam[examType] = null;
            } else {
              $scope.toothExam[examType][index] = null;
            }
          }, 100);
        } else {
          if (examType === 'Mobility') {
            $scope.toothExam[examType] = null;
          } else {
            $scope.toothExam[examType][index] = null;
          }
        }
      }
    }
  };

  $scope.bleedingSupparationChange = function (examType, index) {
    $scope.toothExam[examType][index] =
      $scope.toothExam[examType][index] === true ? false : true;
  };

  // this is called via ng-click on the inputs/checkboxes, updated activeExamType and patientPerioExamFactory.FocusedIndex
  $scope.inputClicked = function (examType, toothId, index, toothNumber) {
    if (!_.isNil(patientPerioExamFactory.ActiveExamPath)) {
      var focusedIndex = patientPerioExamFactory.ActiveExamPath.ToothPockets.indexOf(
        toothNumber + ',' + index
        );
        if (focusedIndex != patientPerioExamFactory.FocusedIndex) {
            //We're clicking on a different tooth pocket            
            patientPerioExamFactory.IsGMNegativeMode = false;
        }

      patientPerioExamFactory.setFocusedIndex(focusedIndex);
      patientPerioExamFactory.setActiveExamType(
        listHelper.findItemByFieldValue(
          patientPerioExamFactory.ExamTypes,
          'Type',
          examType
        )
      );
        ctrl.updateKeypadModel(toothId, examType);        
    }
  };

  //
  $scope.examToggle = function (examType) {
    patientPerioExamFactory.setActiveExamType(
      listHelper.findItemByFieldValue(
        patientPerioExamFactory.ExamTypes,
        'Type',
        examType
      )
    );
  };

  //#endregion

  //#region keypad

  //
  $scope.$watch('keypadModel.onInput', function () {
    if ($scope.keypadModel.id === $scope.$id) {
      var toothPocket =
        patientPerioExamFactory.ActiveExamPath.ToothPockets[
          patientPerioExamFactory.FocusedIndex
        ];
      if (toothPocket === undefined) {
        toothPocket = $scope.activeTooth + ',0';
      }
      var currentPocket = toothPocket.slice(toothPocket.indexOf(',') + 1);

      if ($scope.keypadModel.inputType === 'numericInput') {
        $scope.keypadModel.value =
          $scope.keypadModel.value === 0
            ? $scope.keypadModel.value.toString()
            : $scope.keypadModel.value;
        $scope.advance(
          {},
          currentPocket,
          $scope.examType,
          $scope.examTypeAbbrev,
          $scope.keypadModel.value
        );
      } else if ($scope.keypadModel.inputType === 'pocketInput') {
        var mockEvent = {};
        if ($scope.keypadModel.value === 'bleedInput') {
          mockEvent.keyCode = 66;
          mockEvent.target = { value: 'b' };
        } else if ($scope.keypadModel.value === 'suppInput') {
          mockEvent.keyCode = 83;
          mockEvent.target = { value: 's' };
        }
        $scope.advance(
          mockEvent,
          currentPocket,
          $scope.examType,
          $scope.examTypeAbbrev,
          null
        );
      }
    }
  });

  //#endregion
}
