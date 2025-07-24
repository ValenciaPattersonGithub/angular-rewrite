'use strict';

var app = angular.module('Soar.Patient');

var PatientPerioController = app.controller('PatientPerioController', [
    '$scope',
    '$routeParams',
    'localize',
    'ListHelper',
    'PatientPerioExamFactory',
    'PatientOdontogramFactory',
    'ModalFactory',
    'toastrFactory',
    '$filter',
    'soarAnimation',
    'patSecurityService',
    'StaticData',
    'ToothSelectionService',
    'ExamState',
    '$timeout',
    '$location',
    'patientPerioService',
    'referenceDataService',
    'PatientServices',
    'ConditionsService',
    'FeatureFlagService',
    'FuseFlag',
    function (
        $scope,
        $routeParams,
        localize,
        listHelper,
        patientPerioExamFactory,
        patientOdontogramFactory,
        modalFactory,
        toastrFactory,
        $filter,
        soarAnimation,
        patSecurityService,
        staticData,
        toothSelector,
        examState,
        $timeout,
        $location,
        patientPerioService,
        referenceDataService,
        patientServices,
        conditionsService,
        featureFlagService,
        fuseFlag
    ) {
        var ctrl = this;

        ctrl.usePracticesApiForConditions = false;
        featureFlagService.getOnce$(fuseFlag.UsePracticeApiForConditions).subscribe(value => ctrl.usePracticesApiForConditions = value);

        ctrl.newExamTemplate = {};
        $scope.chartedTeeth = [];
        // initially indicates that page is loading...
        $scope.loadingExam = true;
        $scope.activePerioExam = null;

        // default state of perio readings directive queue
        $scope.loadingQueueBackup = [
            { load: true },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
            { load: false },
        ];

        // turning on one perio readings directive at a time
        $scope.$on('soar:perio-reading-directive-loaded', function () {
            var keepGoing = true;
            angular.forEach($scope.loadingQueue, function (item) {
                if (keepGoing === true && item.load === false) {
                    keepGoing = false;
                    item.load = true;
                }
            });
        });

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

        //#endregion

        //#region init
        ctrl.initProperties = function () {
            $scope.perioExam = {};
            $scope.activePerioExam = {};
            patientPerioExamFactory.SetActivePerioExam(null);
            $scope.examStarted = false;
            $scope.examHasChanges = false;
            $scope.examBackup = {};
            $scope.savingExam = false;
            $scope.viewOnly = false;
            $scope.loadingMessage = localize.getLocalizedString('Loading the exam.');
            $scope.loadingQueue = angular.copy($scope.loadingQueueBackup);
            patientPerioExamFactory.setDataChanged(false);

            patientPerioExamFactory.setActiveTooth('1');
            patientPerioExamFactory.setActiveToothIndex(0);
            $scope.bleedingPocketVisible = true;
            $scope.suppurationPocketVisible = false;
        };
        ctrl.initProperties();

        //
        $scope.$watch(
            function () {
                return patientPerioExamFactory.ExamTypes;
            },
            function (nv) {
                $scope.activeExamType = $filter('filter')(
                    patientPerioExamFactory.ExamTypes,
                    { Active: true }
                )[0];
            },
            true
        );


        ctrl.getConditions = async () => {
            if (ctrl.usePracticesApiForConditions) {
                return conditionsService.getAll()
                    .then(conditions => conditions);
            } else {
                return referenceDataService
                    .getData(referenceDataService.entityNames.conditions)
                    .then(function (conditions) {
                        return conditions
                    });
            }
        };

        ctrl.getClinicalOverviews = async () => {
            return patientServices.ClinicalOverviews.getAll([$scope.personId]).$promise.then((res) => {
                return res.Value.map((item) => item.ChartLedger).flat();
            });
        };
        //#endregion init

        ctrl.backupExam = function () {
            ctrl.originalExam = angular.copy($scope.activePerioExam);
            patientPerioExamFactory.setDataChanged(false);
        };

        //#endregion

        //#region exam new

        // get new exam for a patient
        ctrl.getNewExam = function (exam) {
            $scope.activePerioExam = patientPerioExamFactory.SetActivePerioExam(null);
            if (exam) {
                //Use previous values
                $scope.perioExam = patientPerioExamFactory.getNewExam(
                    $scope.personId,
                    $scope.chartedTeeth,
                    exam
                );
            } else {
                $scope.perioExam = angular.copy(ctrl.newExamTemplate);
            }
            patientPerioExamFactory.SetActivePerioExam($scope.perioExam);
            $scope.activePerioExam = patientPerioExamFactory.ActivePerioExam;

            ctrl.backupExam();
            $scope.loadingExam = false;
            patientPerioExamFactory.setDataChanged(false);
        };

        ctrl.initNewExam = function () {
            if (patientPerioExamFactory.DataChanged) {
                modalFactory.CancelModal().then(ctrl.startExam);
            } else {
                ctrl.startExam();
            }
        };

        ctrl.startExam = function () {
            ctrl.initProperties();
            $scope.loadingExam = true;
            patientPerioExamFactory.setExamState(examState.Start);
            $scope.examStarted = true;

            $timeout(function () {
                if (
                    patientPerioService.loadPreviousExamReading &&
                    $scope.perioExamHeaders &&
                    $scope.perioExamHeaders.length > 0
                ) {
                    //if ($scope.perioExamHeaders.length > 0) {
                    //    $scope.selectedExam.ExamId = $scope.perioExamHeaders[0].ExamId;
                    //} else {
                    //    $scope.selectedExam.ExamId = null;
                    //}
                    patientPerioExamFactory
                        .getById($scope.personId, $scope.perioExamHeaders[0].ExamId)
                        .then(function (res) {
                            var exam = res.Value;
                            ctrl.getNewExam(exam);
                            ctrl.calcAttachmentLvl();
                            $scope.getUsersPerioExamSettings();
                        });
                } else {
                    ctrl.getNewExam();
                    $scope.getUsersPerioExamSettings();
                }
            });
        };

        //#endregion

        //#region save exam

        $scope.saveExam = function () {
            // Deleting null ExamIds to avoid serialization issues.
            let perioExamToSave = _.cloneDeep($scope.activePerioExam);
            if (
                perioExamToSave.ExamHeader &&
                perioExamToSave.ExamHeader.ExamId === null
            )
                delete perioExamToSave.ExamHeader.ExamId;

            if (
                perioExamToSave.ExamDetails &&
                perioExamToSave.ExamDetails.length > 0
            ) {
                perioExamToSave.ExamDetails.forEach(x => {
                    if (x.ExamId === null) delete x.ExamId;
                });
            }

            $scope.valid = patientPerioExamFactory.validateExam(perioExamToSave);
            if ($scope.valid) {
                $scope.savingExam = true;
                patientPerioExamFactory.save(perioExamToSave).then(function (res) {
                    $scope.savedExam = res.Value;
                    $scope.perioExam = patientPerioExamFactory.merge(
                        $scope.savedExam,
                        $scope.perioExam
                    );
                    patientPerioExamFactory.SetActivePerioExam($scope.perioExam);
                    $scope.activePerioExam = patientPerioExamFactory.ActivePerioExam;

                    ctrl.calcAttachmentLvl();
                    ctrl.backupExam();
                    patientPerioExamFactory.setDataChanged(false);
                    if (patientPerioExamFactory.ExamState === examState.SaveComplete) {
                        // navigate away?
                        ctrl.initProperties();
                        ctrl.preLoadExam();
                    } else {
                        //TODO should this state be the same for editing or new
                        patientPerioExamFactory.setExamState(examState.EditMode);
                    }
                    $scope.savingExam = false;
                });
            }
        };

        //#endregion

        //#region cancel exam

        $scope.cancel = function () {
            if (patientPerioExamFactory.DataChanged) {
                modalFactory.CancelModal().then(ctrl.confirmCancel, ctrl.continueExam);
            } else {
                ctrl.confirmCancel();
            }
        };

        ctrl.continueExam = function () {
            patientPerioExamFactory.setExamState(examState.Continue);
        };

        // process cancel confirmation
        ctrl.confirmCancel = function () {
            ctrl.initProperties();

            $timeout(function () {
                if ($scope.currentExamId !== null) {
                    ctrl.preLoadExam();
                }
            }, 3000);
            // navigate away?
        };

        //#endregion

        //#region attachment calculation on new or existing exam when loaded

        // run when editing an existing exam
        ctrl.calcAttachmentLvl = function () {
            angular.forEach($scope.activePerioExam.ExamDetails, function (toothExam) {
                if (!toothExam.AttachmentLvl) {
                    toothExam.AttachmentLvl = [];
                }
                if (toothExam.ToothId != null) {
                    for (var i = 0; i < 6; i++) {
                        // if both values are null so is the AttachmentLvl
                        if (
                            toothExam.GingivalMarginPocket[i] === null &&
                            toothExam.DepthPocket[i] === null
                        ) {
                            toothExam.AttachmentLvl[i] = null;
                        } else {
                            var gm =
                                toothExam.GingivalMarginPocket[i] === null
                                    ? 0
                                    : parseInt(toothExam.GingivalMarginPocket[i], 10);
                            var dp =
                                toothExam.DepthPocket[i] === null
                                    ? 0
                                    : parseInt(toothExam.DepthPocket[i], 10);
                            var attachment = dp + gm;
                            toothExam.AttachmentLvl[i] = attachment;
                        }
                    }
                }
            });
        };

        ctrl.finishExam = function () {
            if (patientPerioExamFactory.DataChanged === true) {
                $scope.saveExam();
            } else {
                patientPerioExamFactory.setDataChanged(false);
                if (patientPerioExamFactory.ExamState === examState.SaveComplete) {
                    // navigate away?
                    ctrl.initProperties();
                    ctrl.preLoadExam();
                } else {
                    //TODO should this state be the same for editing or new
                    patientPerioExamFactory.setExamState(examState.EditMode);
                }
                $scope.savingExam = false;
            }
        };
        //#endregion

        //#region watches

        $scope.$watch(
            'activePerioExam.ExamDetails',
            function (nv, ov) {
                if (
                    nv &&
                    ov &&
                    nv !== ov &&
                    $scope.savingExam === false &&
                    patientPerioExamFactory.ExamState !== examState.ViewMode
                ) {
                    patientPerioExamFactory.setDataChanged(true);
                } else {
                    patientPerioExamFactory.setDataChanged(false);
                }
            },
            true
        );

        $scope.$watch(
            function () {
                return patientPerioExamFactory.ExamState;
            },
            function (nv) {
                var status = nv;
                switch (status) {
                    case examState.Save:
                        patientPerioExamFactory.IsGMNegativeMode = false;
                        $scope.saveExam();
                        break;
                    case examState.SaveComplete:
                        $scope.showPerioNav = false;
                        patientPerioExamFactory.IsGMNegativeMode = false;
                        ctrl.finishExam();
                        break;
                    case examState.Cancel:
                        $scope.showPerioNav = false;
                        $scope.cancel();
                        break;
                    case examState.Continue:
                        $scope.showPerioNav = true;
                        patientPerioExamFactory.IsGMNegativeMode = false;
                        break;
                    case examState.Start:
                        $scope.showPerioNav = true;
                        ctrl.initNewExam();
                        patientPerioExamFactory.IsGMNegativeMode = false;
                        patientPerioExamFactory.setDataChanged(false);
                        break;
                    case examState.EditMode:
                        $scope.showPerioNav = true;
                        $scope.viewOnly = false;
                        $scope.loadingExam = false;
                        patientPerioExamFactory.IsGMNegativeMode = false;
                        patientPerioExamFactory.setDataChanged(false);
                        break;
                    case examState.None:
                        $scope.showPerioNav = false;
                        $scope.loadingExam = false;
                        $scope.examStarted = false;
                        patientPerioExamFactory.IsGMNegativeMode = false;
                        patientPerioExamFactory.setDataChanged(false);
                        break;
                    case examState.Loading:
                        $scope.showPerioNav = false;
                        $scope.loadingExam = true;
                        patientPerioExamFactory.IsGMNegativeMode = false;
                        break;
                    case examState.ViewMode:
                        patientPerioExamFactory.IsGMNegativeMode = false;
                        $scope.showPerioNav = false;
                        break;
                }
            }
        );

        $scope.$watch(
            function () {
                return patientPerioExamFactory.DataChanged;
            },
            function (nv) {
                // TODO move this to a shared variable.
                $scope.$parent.$parent.$parent.$parent.dataHasChanged = nv;
            },
            true
        );

        // some special handling for bleeding and suppuration now they want those to appear in the same row
        $scope.$watch(
            function () {
                return patientPerioExamFactory.ActiveExam;
            },
            function (nv) {
                if (nv === 'SuppurationPocket') {
                    $scope.bleedingPocketVisible = false;
                    $scope.suppurationPocketVisible = true;
                } else if (nv === 'BleedingPocket') {
                    $scope.bleedingPocketVisible = true;
                    $scope.suppurationPocketVisible = false;
                }
            }
        );

        //#endregion

        //#region select an exam for view

        // on ctrl.init load exam template for new or editing an existing exam
        ctrl.loadExamTemplate = async function () {
            // get initial tooth chart array using mouth status for missing teeth, implants
            $scope.chartedTeeth = patientOdontogramFactory.getChartedTeeth(
                $scope.mouthStatus
            );
            // ensure missing teeth are marked as missing
            const chartLedgerServices = await ctrl.getClinicalOverviews();
            const conditions = await ctrl.getConditions();

            const missingTeeth = chartLedgerServices
                .filter((item) => item.ConditionId)
                .filter((item) => {
                    const condition = conditions.find((c) => c.ConditionId === item.ConditionId);
                    return condition && condition.Description.includes("Missing Tooth")
                })
                .map((item) => item.Tooth)

            if (missingTeeth.length) {
                $scope.chartedTeeth = $scope.chartedTeeth.map((tooth) => {
                    if (tooth.includes("Missing")) return tooth;
                    if (missingTeeth.includes(tooth)) return `${tooth},Missing`;
                    return tooth;
                });
            }

            // get exam template based on charted teeth array
            ctrl.newExamTemplate = patientPerioExamFactory.getNewExam(
                $scope.personId,
                $scope.chartedTeeth
            );
            // set exam state to none
            patientPerioExamFactory.setExamState(examState.None);
            if ($scope.currentExamId !== null) {
                ctrl.initLoadExam();
            }
            else {
                ctrl.startExam();
            }
        };

        $scope.currentExamId = null;
        $scope.$watch(
            function () {
                return patientPerioExamFactory.SelectedExamId;
            },
            function (nv) {
                $scope.currentExamId = nv;
                if (
                    $scope.currentExamId !== null &&
                    (patientPerioExamFactory.ExamState === examState.None ||
                        patientPerioExamFactory.ExamState === examState.ViewMode)
                ) {
                    ctrl.initLoadExam();
                }
            }
        );

        ctrl.initLoadExam = function () {
            if (patientPerioExamFactory.DataChanged) {
                modalFactory.CancelModal().then(ctrl.preLoadExam);
            } else {
                ctrl.preLoadExam();
            }
        };

        ctrl.preLoadExam = function () {
            ctrl.initProperties();
            $scope.loadingExam = true;
            patientPerioExamFactory.setExamState(examState.Loading);
            $timeout(function () {
                ctrl.loadExam();
            }, 3000);
        };

        ctrl.loadExam = function () {
            patientPerioExamFactory
                .getById($scope.personId, $scope.currentExamId)
                .then(function (res) {
                    var exam = res.Value;
                    patientPerioExamFactory.SetActivePerioExam(null);
                    $scope.perioExam = patientPerioExamFactory.process(exam);
                    patientPerioExamFactory.SetActivePerioExam($scope.perioExam);
                    $scope.activePerioExam = patientPerioExamFactory.ActivePerioExam;

                    $scope.loadingExam = false;
                    $scope.viewOnly = true;
                    ctrl.calcAttachmentLvl();
                    ctrl.backupExam();
                    patientPerioExamFactory.setDataChanged(false);
                    patientPerioExamFactory.setExamState(examState.ViewMode);
                });
        };
        ctrl.initProperties();

        //#endregion

        //#region mouth status
        // NOTE, for now i'm putting this in the odontogram factory because it seems like related data.
        // we may want to break it out into its own object factory.

        ctrl.loadMouthStatus = function () {
            // verify access
            $scope.authAccess = patientOdontogramFactory.access();
            if ($scope.authAccess.View) {
                patientOdontogramFactory
                    .getMouthStatus($scope.personId)
                    .then(function (res) {
                        $scope.mouthStatus = res.Value;
                        ctrl.loadExamTemplate();
                    });
            }
        };

        //#endregion

        ctrl.init = function () {
            ctrl.loadMouthStatus();
        };
        ctrl.init();

        /* TODO remove these watches ...
         */

        // listening for changes to ActivePerioExam
        $scope.$watch(
            function () {
                return patientPerioExamFactory.ActivePerioExam;
            },
            function (nv) {
                if (nv) {
                    if ($scope.activePerioExam != nv) {
                        $scope.activePerioExam = nv;
                    }
                }
            },
            true
        );

        //
        $scope.toggleGraphDataPoint = function (dataPoint) {
            if ($scope.activeDataPoints.indexOf(dataPoint) !== -1) {
                $scope.activeDataPoints.splice(
                    $scope.activeDataPoints.indexOf(dataPoint),
                    1
                );
            } else {
                $scope.activeDataPoints.push(dataPoint);
            }
        };
    },
]);
