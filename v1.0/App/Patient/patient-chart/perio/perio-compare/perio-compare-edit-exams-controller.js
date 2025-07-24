'use strict';
angular.module('Soar.Patient').controller('PerioCompareEditExamsController', [
  '$scope',
  '$routeParams',
  'PatientPerioExamFactory',
  '$uibModalInstance',
  '$filter',
  'ModalFactory',
  'localize',
  function (
    $scope,
    $routeParams,
    patientPerioExamFactory,
    $uibModalInstance,
    $filter,
    modalFactory,
    localize
  ) {
    var ctrl = this;

    ctrl.$onInit = function () {
      ctrl.getExamHeaders();
      $scope.perioExamHeaders = [];
      $scope.selectedExamIds = [];
    };

    // dynamically assigning columns to try and have an even amout in each
    ctrl.assignColumn = function (index, maxColumnCount, perioExam) {
      if (index < maxColumnCount) {
        perioExam.$$Column = 1;
      } else if (index >= maxColumnCount && index < maxColumnCount * 2) {
        perioExam.$$Column = 2;
      } else if (index >= maxColumnCount * 2 && index < maxColumnCount * 3) {
        perioExam.$$Column = 3;
      } else {
        perioExam.$$Column = 4;
      }
    };

    // sorting, creating title, etc.
    ctrl.processResponse = function (res) {
      $scope.perioExamHeaders = $filter('filter')(res.Value, {
        IsDeleted: false,
      });
      $scope.perioExamHeaders = $filter('orderBy')($scope.perioExamHeaders, [
        '-ExamDate',
      ]);
      var maxColumnCount =
        $scope.perioExamHeaders.length / 4 < 3
          ? 3
          : Math.ceil($scope.perioExamHeaders.length / 4);
      angular.forEach($scope.perioExamHeaders, function (perioExam, $index) {
        var local = moment.utc(perioExam.ExamDate).toDate();
        perioExam.$$Title = moment(local).format('MM/DD/YYYY');
        ctrl.assignColumn($index, maxColumnCount, perioExam);
      });
      $scope.checkBoxChanged();
    };

    // making the call to get the headers
    ctrl.getExamHeaders = function () {
      patientPerioExamFactory.get($routeParams.patientId).then(function (res) {
        if (res && res.Value) {
          ctrl.processResponse(res);
        }
      });
    };

    // checkbox directive change handler, updating $scope.selectedExamIds and disabling when appropriate
    $scope.checkBoxChanged = function () {
      $scope.selectedExamIds.length = 0;
      var i = 0;
      angular.forEach($scope.perioExamHeaders, function (hdr) {
        if (hdr.$$Selected === true) {
          $scope.selectedExamIds.push(hdr.ExamId);
          i++;
        }
      });
      $scope.checkboxesDisabled = i === 6 ? true : false;
    };

    // cancel button handler
    $scope.cancel = function () {
      $uibModalInstance.close();
    };

    // save button handler
    $scope.save = function () {
      if ($scope.selectedExamIds.length === 0) {
        var title = localize.getLocalizedString('Confirm Edit');
        var message = localize.getLocalizedString(
          'By not selecting any exams, all exams will be selected. Do you want to continue?'
        );
        var button1Text = localize.getLocalizedString('Yes');
        var button2Text = localize.getLocalizedString('No');
        modalFactory
          .ConfirmModal(title, message, button1Text, button2Text)
          .then($scope.confirmSuccess.bind());
      } else {
        $scope.confirmSuccess();
      }
    };

    $scope.confirmSuccess = function () {
      $uibModalInstance.close($scope.selectedExamIds);
    };

    //
    ctrl.$onInit();
  },
]);
