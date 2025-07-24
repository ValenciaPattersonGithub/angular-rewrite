'use strict';
angular.module('Soar.Patient').controller('PerioCompareController', [
  '$scope',
  '$location',
  '$routeParams',
  'PatientPerioExamFactory',
  'toastrFactory',
  'patSecurityService',
  'tabLauncher',
  'ModalFactory',
  'userSettingsDataService',
  function (
    $scope,
    $location,
    $routeParams,
    patientPerioExamFactory,
    toastrFactory,
    patSecurityService,
    tabLauncher,
    modalFactory,
    userSettingsDataService
  ) {
    var ctrl = this;

    ctrl.$onInit = function () {
      ctrl.authorize();
      $scope.dpAlertLevel = patientPerioExamFactory.AlertLevels.DepthPocket;
      $scope.gmAlertLevel =
        patientPerioExamFactory.AlertLevels.GingivalMarginPocket;
      $scope.getExams();
      // pill-bar items
      $scope.readings = [
        { Id: 1, Title: 'Pocket Depth', Selected: true },
        { Id: 2, Title: 'Gingival Margin', Selected: false },
        { Id: 3, Title: 'M-G Junction', Selected: false },
      ];
      $scope.selectedExamType = 'Pocket Depth';
    };

    //#region auth

    ctrl.authorize = function () {
      if (!patientPerioExamFactory.access()) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-clin-cperio-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      }
    };

    //#endregion

    //#region exams by quadrant

    // get the exams
    $scope.getExams = function (selectedExamIds) {
      patientPerioExamFactory
        .PerioComparisonInfo($routeParams.patientId, selectedExamIds)
        .then(function (res) {
          $scope.exams = res.Value;
          ctrl.positionLabels();
        });
    };

    // hard code label and quadrant break based on # of exams
    ctrl.positionLabels = function () {
      switch ($scope.exams.length / 4) {
        case 1:
          $scope.labelPos = [0, 1, 2, 3];
          $scope.quadrantGap = [0, 1, 2];
          break;
        case 2:
          $scope.labelPos = [1, 3, 5, 7];
          $scope.quadrantGap = [1, 3, 5];
          break;
        case 3:
          $scope.labelPos = [1, 4, 7, 10];
          $scope.quadrantGap = [2, 5, 8];
          break;
        case 4:
          $scope.labelPos = [2, 6, 10, 14];
          $scope.quadrantGap = [3, 7, 11];
          break;
        case 5:
          $scope.labelPos = [2, 7, 12, 17];
          $scope.quadrantGap = [4, 9, 14];
          break;
        case 6:
          $scope.labelPos = [3, 9, 15, 21];
          $scope.quadrantGap = [5, 11, 17];
          break;
      }
    };

    // region filtering by exam type

    // pill-bar click handler
    $scope.select = function (reading) {
      $scope.selectedExamType = reading.Title;
      angular.forEach($scope.readings, function (rdg) {
        rdg.Selected = rdg.Id === reading.Id ? true : false;
      });
    };

    //#endregion

    // close button handler
    $scope.backToPerioLanding = function () {
      let patientPath = '/Patient/';

      $location
        .path(patientPath + $routeParams.patientId + '/Clinical/')
        .search({ tab: 3 });
    };

    //#region print perio comparison report

    $scope.printComparison = function () {
      $scope.perioAccess = patientPerioExamFactory.access();
      if ($scope.perioAccess.View) {
        var storageItem = {
          ExamType: $scope.selectedExamType,
          Exams: $scope.exams,
        };
        localStorage.setItem(
          'perio_compare_' + $routeParams.patientId,
          JSON.stringify(storageItem)
        );
        let patientPath = '#/Patient/';
        tabLauncher.launchNewTab(
          patientPath +
            $routeParams.patientId +
            '/Clinical/ComparePerioExams/Print'
        );
      }
    };

    //#endregion

    //#region edit

    //
    $scope.editExams = function () {
      var modalInstance = modalFactory.Modal({
        amfa: 'soar-clin-cperio-view',
        backdrop: 'static',
        controller: 'PerioCompareEditExamsController',
        templateUrl:
          'App/Patient/patient-chart/perio/perio-compare/perio-compare-edit-exams.html',
        windowClass: 'modal-50',
      });
      modalInstance.result.then(function (result) {
        if (!angular.isUndefined(result)) {
          $scope.getExams(result);
        }
      });
    };

    //#endregion

    //
    ctrl.$onInit();
  },
]);
