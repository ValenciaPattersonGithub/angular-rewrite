'use strict';

var app = angular.module('Soar.Patient');

var PatientPerioController = app.controller('PerioLandingController', [
  '$scope',
  '$routeParams',
  '$timeout',
  'localize',
  'PatientPerioExamFactory',
  'ModalFactory',
  'ExamState',
  'toastrFactory',
  'patSecurityService',
  '$location',
  'patientPerioService',
  function (
    $scope,
    $routeParams,
    $timeout,
    localize,
    patientPerioExamFactory,
    modalFactory,
    examState,
    toastrFactory,
    patSecurityService,
    $location,
    patientPerioService
  ) {
    var ctrl = this;
    $scope.examStarted = false;
    $scope.completeExam = false;
    $scope.initializingExam = true;
    $scope.viewOrEditMode = false;
    $scope.currentExamId = null;
    $scope.hasSavePermissions = patSecurityService.IsAuthorizedByAbbreviation(
      'soar-clin-cperio-add'
    );
    $scope.hasEditPermissions = patSecurityService.IsAuthorizedByAbbreviation(
      'soar-clin-cperio-edit'
    );
    $scope.hasDeletePermissions = patSecurityService.IsAuthorizedByAbbreviation(
      'soar-clin-cperio-delete'
    );

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

    $scope.perioOptionList = [
      { text: 'New Exam (blank)', value: -1 },
      { text: 'New Exam w Prev Recordings', value: 1 },
    ];

    $scope.examOptionClicked = function (option) {
      if (option == $scope.perioOptionList[0]) {
        $scope.initExam(false, false);
      } else if (option == $scope.perioOptionList[1]) {
        $scope.initExam(false, true);
      }
    };

    //#endregion

    $scope.initExam = function (editMode, loadPrevious) {
      $scope.examStarted = true;

      //AngularJS didn't want to play nice when this method was being called from the Angular Start New Exam buttons/menu
      //Following the example in the link below, the setInterval was added to force AngularJS to update:
      //https://stackoverflow.com/questions/20070077/angularjs-view-not-updating-on-model-change
      setInterval(function () {
        $scope.$apply();
      }, 500);
      patientPerioExamFactory.setExamState(examState.Loading);
      $timeout(function () {
        $scope.perioGraphActive.flag = false;
        $scope.startExam(editMode, loadPrevious);
      }, 3000);
    };

    $scope.startExam = function (editMode, loadPrevious) {
      if (editMode) {
        patientPerioExamFactory.setExamState(examState.EditMode);
      } else if (loadPrevious) {
        patientPerioService.setLoadPreviousOption(true);
        patientPerioExamFactory.setExamState(examState.Start);
      } else {
        patientPerioService.setLoadPreviousOption(false);
        patientPerioExamFactory.setExamState(examState.Start);
      }
    };

    $scope.deleteExam = function () {
      // instantiate delete modal, etc.
      $scope.perioGraphActive.flag = false;
      var data = patientPerioExamFactory.SelectedExamHeader;
      var title = localize.getLocalizedString('Remove');

      var local = moment.utc(data.ExamDate).toDate();
      var message = localize.getLocalizedString(
        'Are you sure you want to delete the exam from {0}?',
        [moment(local).format('MM/DD/YYYY')]
      );
      var button1Text = localize.getLocalizedString('Yes');
      var button2Text = localize.getLocalizedString('No');
      modalFactory
        .ConfirmModal(title, message, button1Text, button2Text, data)
        .then(ctrl.confirmDelete);
    };

    // calling factory method to handle deletion call
    ctrl.confirmDelete = function () {
      patientPerioExamFactory
        .deleteExam(patientPerioExamFactory.SelectedExamHeader)
        .then(function (res) {
          patientPerioExamFactory.setExamState(examState.Cancel);
          patientPerioExamFactory.setSelectedExamId(null);
        });
    };

    $scope.$watch(
      function () {
        return patientPerioExamFactory.ExamState;
      },
      function (nv) {
        var status = nv;
        $scope.currentExamId = patientPerioExamFactory.SelectedExamId;
        ctrl.setViewOrEditMode();
        switch (status) {
          case examState.Save:
            break;
          case examState.SaveComplete:
            $scope.examStarted = false;
            $scope.showPerioNav = false;
            $scope.initializingExam = false;
            break;
          case examState.Cancel:
            $scope.examStarted = false;
            $scope.showPerioNav = false;
            $scope.initializingExam = false;
            break;
          case examState.Continue:
            $scope.examStarted = true;
            $scope.initializingExam = false;
            $scope.showPerioNav = true;
            break;
          case examState.Start:
            $scope.examStarted = true;
            $scope.initializingExam = false;
            $scope.showPerioNav = true;
            break;
          case examState.EditMode:
            $scope.examStarted = true;
            $scope.initializingExam = false;
            $scope.showPerioNav = true;
            break;
          case examState.None:
            $scope.initializingExam = false;
            $scope.examStarted = false;
            $scope.showPerioNav = false;
            break;
          case examState.Initializing:
            $scope.initializingExam = true;
            $scope.examStarted = false;
            break;
          case examState.Loading:
            $scope.initializingExam = true;
            $scope.showPerioNav = false;
            break;
          case examState.ViewMode:
            $scope.initializingExam = false;
            $scope.showPerioNav = false;
            $scope.examStarted = false;
            break;
        }
      }
    );

    $scope.cancelExam = function () {
      patientPerioExamFactory.setExamState(examState.Cancel);
    };

    $scope.$watch(
      function () {
        return patientPerioExamFactory.DataChanged;
      },
      function (nv) {
        $scope.examHasChanges = patientPerioExamFactory.DataChanged;
      }
    );

    $scope.$watch(
      function () {
        return patientPerioExamFactory.SelectedExamId;
      },
      function (nv) {
        $scope.examSelected = nv != null && nv.length > 0;
      }
    );

    ctrl.setViewOrEditMode = function () {
      if ($scope.currentExamId !== null) {
        $scope.viewOrEditMode = true;
        $scope.initializingExam = true;
      } else {
        $scope.viewOrEditMode = false;
      }
    };

    //TODO remove after init dev
    $scope.$watch(
      'examStarted',
      function (nv, ov) {
        if (nv && nv != ov && nv === true) {
        }
      },
      true
    );
  },
]);
