'use strict';

var app = angular.module('Soar.Patient');

var PerioNavController = app.controller('PerioNavController', [
    '$scope',
    '$routeParams',
    '$timeout',
    '$filter',
    'localize',
    'PatientPerioExamFactory',
    'ModalFactory',
    'ExamState',
    'ListHelper',
    'PatientOdontogramFactory',
    function (
        $scope,
        $routeParams,
        $timeout,
        $filter,
        localize,
        patientPerioExamFactory,
        modalFactory,
        examState,
        listHelper,
        patientOdontogramFactory
    ) {
        var ctrl = this;
        //#region init
        ctrl.initProperties = function () {
            patientPerioExamFactory.setActiveTooth('1');
            $scope.activeQuadrant = 'UB';
            $scope.arch = 'upper';
            $scope.filterExam();
            ctrl.loadMouthStatus();
        };

        //#endregion

        //#region perio keypad

        $scope.keypadModel = {
            examType: '',
            onInputChange: Date.now(),
            value: false,
            numericInputLimit: 20,
            pocketInputRestricted: false,
            incrementationLimit: false,
        };

        var keypadRules = (function initKeypadRules() {
            function setDefault() {
                $scope.keypadModel.numericInputLimit = 20;
                $scope.keypadModel.numericInputMin = 0;
                $scope.keypadModel.pocketInputRestricted = false;
                $scope.keypadModel.incrementationLimit = false;
            }

            return {
                BleedingPocket: function () {
                    setDefault();
                    $scope.keypadModel.numericInputMin = 0;
                },
                SuppurationPocket: function () {
                    setDefault();
                    $scope.keypadModel.numericInputMin = 0;
                },
                DepthPocket: setDefault,
                GingivalMarginPocket: setDefault,
                MgjPocket: function setMgjPocketRules() {
                    $scope.keypadModel.numericInputLimit = 10;
                    $scope.keypadModel.numericInputMin = 0;
                    $scope.keypadModel.pocketInputRestricted = false;
                    $scope.keypadModel.incrementationLimit = true;
                },
                FurcationGradeRoot: function setFurcationGradeRootRules() {
                    $scope.keypadModel.numericInputLimit = 4;
                    $scope.keypadModel.numericInputMin = 0;
                    $scope.keypadModel.pocketInputRestricted = true;
                    $scope.keypadModel.incrementationLimit = true;
                },
                Mobility: function setMobilityRules() {
                    $scope.keypadModel.numericInputLimit = 4;
                    $scope.keypadModel.numericInputMin = 0;
                    $scope.keypadModel.pocketInputRestricted = true;
                    $scope.keypadModel.incrementationLimit = true;
                },
            };
        })();

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

        $scope.$watch(
            'keypadModel.examType',
            function handleKeypadModelExamChange(newExamType) {
                if (keypadRules.hasOwnProperty(newExamType)) {
                    keypadRules[newExamType]();
                }

                $scope.keypadModel.onInputRestriction = Date.now();
            }
        );

        // listening for changes to ActiveTooth
        $scope.$watch(
            function () {
                return patientPerioExamFactory.ActiveTooth;
            },
            function (nv) {
                if (nv && $scope.activeTooth !== nv) {
                    $scope.activeTooth = nv;
                }
            },
            true
        );

        // listening for changes to ActiveQuadrant
        $scope.$watch(
            function () {
                return patientPerioExamFactory.ActiveQuadrant;
            },
            function (nv) {
                if (nv) {
                    if ($scope.activeQuadrant !== nv) {
                        $scope.activeQuadrant = nv;
                        switch ($scope.activeQuadrant) {
                            case 'UB':
                            case 'UL':
                                $scope.arch = 'upper';
                                break;
                            case 'LB':
                            case 'LL':
                                $scope.arch = 'lower';
                                break;
                        }
                    }
                }
            },
            true
        );

        $scope.activePerioExam = null;
        // listening for changes to ActiveTooth
        $scope.$watch(
            function () {
                return patientPerioExamFactory.ActivePerioExam;
            },
            function (nv) {
                if (nv && $scope.activePerioExam != nv) {
                    $scope.activePerioExam = nv;
                    $scope.activeTooth = '1';
                    $scope.filterExam();

                    // initialize the exam settings
                    var nextValidTooth = patientPerioExamFactory.getNextValidTooth(
                        $scope.chartedTeeth,
                        '-1',
                        true
                    );
                    if (!nextValidTooth) {
                        $scope.chartedTeethLoaded = false;
                        $scope.toothExam = null;
                        $scope.activeTooth = null;
                    } else {
                        patientPerioExamFactory.setActiveTooth(nextValidTooth);
                        patientPerioExamFactory.setActiveExam('DepthPocket');
                        patientPerioExamFactory.setActiveQuadrant('UB');
                    }
                }
            },
            true
        );

        $scope.chartedTeethLoaded = false;
        ctrl.loadMouthStatus = function () {
            $scope.authAccess = patientOdontogramFactory.access();
            if ($scope.authAccess.View) {
                patientOdontogramFactory
                    .getMouthStatus($scope.personId)
                    .then(function (res) {
                        $scope.mouthStatus = res.Value;
                        $scope.chartedTeeth = patientOdontogramFactory.getChartedTeeth(
                            $scope.mouthStatus
                        );
                        $scope.chartedTeethLoaded = true;
                    });
            }
        };

        $scope.$watch(
            'activeTooth',
            function (nv, ov) {
                if (nv && nv !== ov) {
                    $scope.filterExam();
                }
            },
            true
        );

        ctrl.getToothNumberFromToothId = function (toothNumber) {
            if (
                patientPerioExamFactory &&
                patientPerioExamFactory.ActivePerioExam &&
                patientPerioExamFactory.ActivePerioExam.ExamDetails
            ) {
                var examForActiveTooth = listHelper.findItemByFieldValue(
                    patientPerioExamFactory.ActivePerioExam.ExamDetails,
                    'ToothId',
                    toothNumber
                );
                return examForActiveTooth ? examForActiveTooth.ToothNumber : null;
            }
        };

        $scope.filterExam = function () {
            if ($scope.activePerioExam && $scope.activePerioExam.ExamDetails) {
                angular.forEach($scope.activePerioExam.ExamDetails, function (exam) {
                    if (exam.ToothId.toString() === $scope.activeTooth.toString()) {
                        $scope.toothExam = exam;
                        $scope.activeToothId = exam.ToothId;
                    }
                });
            }
        };
        ctrl.initProperties();

        //#region tooth nav

        // navigate to next valid tooth and set active tooth
        $scope.navToNextValidTooth = function (fwdDirection) {
            patientPerioExamFactory.IsGMNegativeMode = false;

            if ($scope.chartedTeeth) {
                // initialize the exam settings
                var direction = fwdDirection ? 'forward' : 'reverse';
                var nextValidTooth =
                    patientPerioExamFactory.ArrowAdvanceToNextValidTooth(
                        $scope.activePerioExam.ExamDetails,
                        $scope.activeTooth,
                        direction
                    );
                patientPerioExamFactory.setActiveTooth(nextValidTooth);
                var nextToothNumber = ctrl.getToothNumberFromToothId(nextValidTooth);                                            
                
                let pocketIndex = $scope.findPocketIndex(nextToothNumber);
                var focusedIndex = patientPerioExamFactory.ActiveExamPath.ToothPockets.indexOf(nextToothNumber + ',' + pocketIndex);
                patientPerioExamFactory.setFocusedIndex(focusedIndex);

                $scope.activeTooth = nextValidTooth;
            }
        };
        //#endregion

        $scope.findPocketIndex = function (nextToothNumber) {
            let pocketIndex;            
            //These are the only exam types where the indexes flipflop on teeth 9-24
            let isFlippedExamType = ($scope.activeExamType.Abbrev == 'dp'
                || $scope.activeExamType.Abbrev == 'gm'
                || $scope.activeExamType.Abbrev == 'mgj');            

            if (isFlippedExamType) {
                //Get the patientPerioExamFactory.FocusedIndex and strip out the tooth number and comma, leaving only the index
                let focusedIndexString = patientPerioExamFactory.ActiveExamPath
                    .ToothPockets[patientPerioExamFactory.FocusedIndex].split(',')[1];
                let nextToothOnLeftSide = nextToothNumber >= 9 && nextToothNumber <= 24;
                //We need the last index for 9-24 because the tooth pockets are flipped                
                if (focusedIndexString == '2' || focusedIndexString == '1' || focusedIndexString == '0') {
                    //We are on the Buccal side
                    if (nextToothOnLeftSide) {
                        pocketIndex = 2;
                    }
                    else {
                        pocketIndex = 0;
                    }
                }
                else {
                    //We are on the Lingual side
                    if (nextToothOnLeftSide) {
                        pocketIndex = 5;
                    }
                    else {
                        pocketIndex = 3;
                    }
                }
            } else {
                //For MOB and FG, we always want the 0 index
                pocketIndex = 0;
            }

            return pocketIndex
        };

    $scope.examHasFurcationReadings = function (toothId) {
      var selectedExam = null;
      var hasReadings = false;
      if ($scope.activePerioExam && $scope.activePerioExam.ExamDetails) {
        angular.forEach($scope.activePerioExam.ExamDetails, function (exam) {
          if (exam.ToothId === toothId) {
            selectedExam = exam;
            hasReadings = selectedExam.$$FurcationReadingsAllowed > 0;
          }
        });
      }
      return hasReadings;
    };
  },
]);
