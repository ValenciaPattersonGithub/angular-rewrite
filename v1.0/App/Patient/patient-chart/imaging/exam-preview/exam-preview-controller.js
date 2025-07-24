'use strict';

var app = angular.module('Soar.Patient');

app.controller('ImagingExamPreviewController', [
  '$scope',
  '$uibModalInstance',
  '$filter',
  'activateTab',
  'exam',
  'patientInfo',
  'localize',
  'ImagingUtilities',
  'toastrFactory',
  'ImagingMasterService',
  'ImagingProviders',
  '$http',
  function (
    $scope,
    $uibModalInstance,
    $filter,
    activateTab,
    exam,
    patientInfo,
    localize,
    imagingUtilities,
    toastr,
    imagingMasterService,
    imagingProviders,
    $http
  ) {
    //exam = {
    //    Id: 1,
    //    Series: [
    //        {
    //            Images: [{ Id: 1 }, { Id: 2 }]
    //        }, {
    //            Images: [{ Id: 1 }, { Id: 2 }, { Id: 1 }, { Id: 2 }]
    //        }
    //    ]
    //};

    var ctrl = this;
    $scope.noImagesAvailableError = false;
    $scope.imagingProviderNotAvailable = false;
    $scope.imagingProviderMessage = '';

    ctrl.$onInit = function () {
      $scope.exam = exam;
      $scope.patientInfo = patientInfo;
      $scope.hasChanges = false;
      $scope.imagesLoaded = false;
      ctrl.loadImages(exam);
      ctrl.setTitle();
      ctrl.getImagingOptions();
    };

    // if this is a sidexis exam we need to determine if the server is ready and show a tooltip if not
    ctrl.getImagingOptions = function () {
      $scope.imagingProviderNotAvailable = false;
      $scope.imagingProviderMessage = '';
      if (exam.Description === 'Sidexis Exam') {
        imagingMasterService.getServiceStatus().then(res => {
          if (res.sidexis) {
            if (res.sidexis.status === 'error') {
              $scope.imagingProviderNotAvailable = true;
              $scope.imagingProviderMessage = localize.getLocalizedString(
                'Sidexis not available.'
              );
            }
          }
        });
      }
    };

    $scope.getThumbnailUrl = function (image) {
      // external images uses ImageId
      let imageId = image.Id ? image.Id : image.ImageId;
      if ($scope.imagesLoaded && ctrl.imagesData) {
        return ctrl.imagesData[imageId];
      }
      return '';
    };

    ctrl.loadImages = function (exam) {
      imagingUtilities
        .retrieveImagesForExam(exam)
        .then(ctrl.loadImagesSuccess, ctrl.loadImagesFailure);
    };

    ctrl.loadImagesSuccess = function (imagesData) {
      ctrl.imagesData = imagesData;
      $scope.imagesLoaded = true;
    };

    ctrl.loadImagesFailure = function () {
      $scope.imagesLoaded = true;
      $scope.noImagesAvailableError = true;
      toastr.error('Failed to retrieve images.', 'Error');
    };

    $scope.close = function () {
      $uibModalInstance.close();
    };

    ctrl.viewExternalImage = function () {
      var sidexis = imagingProviders.Sidexis;
      let imageId = $scope.exam.Series[0].Images[0].ImageId;
      imagingMasterService
        .getUrlForExamByPatientIdExamId(
          $scope.patientInfo.ThirdPartyPatientId,
          sidexis,
          imageId
        )
        .then(res => {
          if (res && res.result) {
            $http.get(res.result);
          }
        });
    };

    $scope.showExamInImaging = function () {
      if (exam.Description === 'Sidexis Exam') {
        ctrl.viewExternalImage();
      } else {
        // apteryx
        activateTab('imaging', { examId: exam.Id, provider: exam.Provider });
        $scope.close();
      }
    };

    ctrl.setTitle = function () {
      var countString = localize.getLocalizedString(
        exam.ImageCount == 1 ? '{0} Image' : '{0} Images',
        [{ skip: exam.ImageCount }]
      );
      // convert to local time
      var examDate = moment.utc(exam.Date).toDate();
      //replace exam.Description if null
      if (exam.Description == null) {
        exam.Description = '';
      }
      // format as date only
      $scope.title =
        $filter('toShortDisplayDateLocal')(examDate) +
        ' - ' +
        exam.Description +
        ' (' +
        countString +
        ')';
    };
  },
]);
