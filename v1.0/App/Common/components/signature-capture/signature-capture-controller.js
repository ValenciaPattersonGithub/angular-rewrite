'use strict';
angular.module('Soar.Common').controller('SignatureCaptureController', [
  '$scope',
  'localize',
  '$timeout',
  'toastrFactory',
  'FileUploadFactory',
  function ($scope, localize, $timeout, toastrFactory, fileUploadFactory) {
    var ctrl = this;

    ctrl.directoryName = 'signatures';

    // enableSave and enableLoad when directoryAllocationId
    $scope.enableSave = false;
    $scope.enableLoad = false;
    $scope.loadingSignature = true;

    ctrl.$onInit = function () {
      ctrl.directoryAllocationId = null;
      ctrl.createDirectories();
      ctrl.setSignatureTitle();
    };

    ctrl.setSignatureTitle = function () {
      $scope.formTitle = $scope.sigTitle
        ? $scope.sigTitle
        : 'Signature Capture';
    };

    //#region access

    //ctrl.getAccess = function () {
    //    $scope.access = medicalHistoryFactory.access();
    //    if (!$scope.access.View) {
    //        toastrFactory.error(patSecurityService.generateMessage('soar-per-perhst-view'), 'Not Authorized');
    //        event.preventDefault();
    //        $location.path('/');
    //    }
    //}
    //ctrl.getAccess();

    //#endregion

    //#region create a signature directory if one isn't already created and get the directoryAllocationId

    ctrl.createDirectories = function () {
      if (ctrl.directoryAllocationId === null) {
        // creating the signatures directory under the practice level directory
        fileUploadFactory
          .CreateSignaturesDirectory('soar-per-perhst-add')
          .then(function (res) {
            if (res) {
              ctrl.directoryAllocationId = res;
              // enable signature capture
              $scope.enableSave = true;
              // $scope.enableLoad = true;
            }
          });
      }
    };

    //#endregion

    //#region uploadFile calling the upload api, if we get a failure, delete the previously created file allocation

    ctrl.uploadFile = function (fileAllocationId, file) {
      $scope.loadingSignature = true;
      var formData = new FormData();
      formData.append('file', file);
      fileUploadFactory
        .UploadFile(
          fileAllocationId,
          formData,
          'soar-per-perhst-add',
          false,
          null,
          null,
          null
        )
        .then(function (res) {
          if (res && res.data && res.data.Result) {
            $scope.loadingSignature = false;
            // set scope.FileAllocationId for form
            $scope.fileAllocationId = fileAllocationId;
            $scope.signatureDate = res.data.Result.DateModified;
            toastrFactory.success(
              localize.getLocalizedString('Signature uploaded successfully.'),
              localize.getLocalizedString('Success')
            );
          } else {
            $scope.loadingSignature = false;
          }
        });
    };

    //#endregion

    //#region load signature NOT DONE

    // load current signature

    //#endregion

    //#region save signature

    ctrl.createUniqueFileName = function () {
      return (
        $scope.patientInfo.PatientId + '_signatureOnFile_' + moment.now('x') + '.png'
      );
    };

    // save the signature
    $scope.saveSignature = function (signatureData) {
      // get allocationId
      fileUploadFactory
        .AllocateFile(
          ctrl.directoryAllocationId,
          ctrl.createUniqueFileName(),
          'application/octet-stream',
          'soar-per-perhst-add',
          false
        )
        .then(function (res) {
          if (res && res.data && res.data.Result) {
            var allocationId = res.data.Result.FileAllocationId;
            // uploadFile
            ctrl.uploadFile(allocationId, signatureData);
          }
        });
    };

    // clear the signature on child control
    $scope.clearSignature = function () {};

    //#endregion

    // handle dynamic title change
    $scope.$watch('sigTitle', function (nv, ov) {
      if (nv && nv !== ov) {
        ctrl.setSignatureTitle();
      }
    });

    $scope.$watch('clearEntry', function (nv) {
      if (nv === true) {
        $scope.clearSignature();
      }
    });

    $scope.onClearSignature = function () {
      $scope.fileAllocationId = null;
    };
  },
]);
