'use strict';
angular.module('Soar.Common').controller('SignatureDisplayController', [
  '$scope',
  'localize',
  'fileService',
  function SignatureDisplayControllerConstructor(
    $scope,
    localize,
    fileService
  ) {
    $scope.error = false;
    $scope.hasSignature = false;
    $scope.loading = false;
    $scope.loadingMessage = 'Loading Signature';
    var ctrl = this;

    this.$onInit = function onInit() {
      this.getSignature();
      this.initializeText();
    };

    this.validFileAllocationId = function validFileAllocationId() {
      return !!$scope.fileAllocationId || $scope.fileAllocationId == 0;
    };

    this.getSignature = function getSignature() {
      if (!this.validFileAllocationId()) {
        return false;
      }

      $scope.loading = true;

      fileService
        .downloadFile($scope.fileAllocationId)
        .then(this.onGetSignatureSuccess)
        .catch(this.onGetSignatureError)
        .finally(function () {
          $scope.loading = false;
        });
    };

    this.onGetSignatureSuccess = function onGetSignatureSuccess(res) {
      res = res || {};
      $scope.base64Signature = res.data || '';
      $scope.hasSignature = !!$scope.base64Signature;
    };

    this.onGetSignatureError = function onGetSignatureError(res) {
      $scope.error = true;
      $scope.hasSignature = false;
    };

    this.initializeText = function initializeText() {
      $scope.altText = $scope.titleText = localize.getLocalizedString(
        $scope.sigTitle || 'Signature'
      );
    };

    // handle reloading after fileAllocationId changes
    $scope.$watch('fileAllocationId', function (nv, ov) {
      // reset display properties when change
      $scope.hasSignature = false;
      $scope.base64Signature = '';

      if (nv && nv !== ov) {
        ctrl.getSignature();
      }
    });
  },
]);
