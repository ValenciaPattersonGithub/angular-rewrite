'use strict';

var app = angular.module('Soar.Patient');

app.controller('PatientImagingTileController', [
  '$scope',
  'localize',
  'ModalFactory',
  'ImagingProviders',
  function ($scope, localize, modalFactory, imagingProviders) {
    var ctrl = this;

    ctrl.$onInit = function () {
      $scope.imageExam.ImageCount = ctrl.calculateImageCount();
      $scope.imageCountMessage = localize.getLocalizedString('{0} Images', [
        $scope.imageExam.ImageCount,
      ]);
      if (
        $scope.previewExam &&
        $scope.previewExam.date === $scope.imageExam.date
      ) {
        $scope.showExamPreview($scope.imageExam);
      }
      $scope.imageDescription = $scope.imageExam.Description;
    };

    ctrl.calculateImageCount = function () {
      var count = 0;
      angular.forEach($scope.imageExam.Series, function (series) {
        if (series.Images) {
          count += series.Images.length;
        }
      });
      return count;
    };

    // determines whether Sidexis images have FileAllocationIds before trying to load
    ctrl.validateExam = function (exam) {
      let isValid = true;
      if (exam.Description && exam.Description === 'Sidexis Exam') {
        _.forEach(exam.Series, function (series) {
          angular.forEach(series.Images, function (image) {
            if (
              image.FileAllocationId === 0 ||
              image.FileAllocationId === null ||
              _.isUndefined(image.FileAllocationId)
            ) {
              isValid = false;
            }
          });
        });
      }
      if (isValid === false) {
        // get the latest records
        $scope.$emit('soar:update-external-images', exam);
      }
      return isValid;
    };

    // validates the exam before showing the preview
    $scope.showExamIfValid = function (exam) {
      if (ctrl.validateExam(exam) === true) {
        $scope.showExamPreview(exam);
      }
    };

    $scope.showExamPreview = function (exam) {
      modalFactory.Modal({
        windowTemplateUrl: 'uib/template/modal/window.html',
        templateUrl:
          'App/Patient/patient-chart/imaging/exam-preview/exam-preview.html',
        controller: 'ImagingExamPreviewController',
        backdrop: 'static',
        keyboard: false,
        size: 'lg',
        windowClass: 'center-modal',
        resolve: {
          exam: function () {
            return exam;
          },
          patientInfo: function () {
            return $scope.patientInfo;
          },
          activateTab: function () {
            return $scope.activateTab;
          },
        },
      });
    };
  },
]);
