angular
  .module('Soar.Patient')
  .controller('HipaaAuthorizationUploaderController', [
    '$scope',
    'localize',
    'toastrFactory',
    '$rootScope',
    'FileUploadFactory',
    '$routeParams',
    function (
      $scope,
      localize,
      toastrFactory,
      $rootScope,
      fileUploadFactory,
      $routeParams
    ) {
      var ctrl = this;

      // init
      ctrl.$onInit = function () {
        $scope.selectedFile = null;
        ctrl.directoryAllocationId = null;
        var buttonText = localize.getLocalizedString(
          'Select HIPAA Authorization Form...'
        );
        $scope.localizationObject = {
          select: buttonText,
        };
      };

      // call the close method with the appropriate params
      $scope.cancel = function () {
        $scope.close({ uploadAttempted: false, fileAllocationId: null });
      };

      // before allocating file, create a signature directory if one isn't already created
      $scope.createDirectory = function () {
        $scope.saving = true;
        if (ctrl.directoryAllocationId === null) {
          // creating the signatures directory under the practice level directory
          fileUploadFactory
            .CreateSignaturesDirectory('soar-per-perhst-add')
            .then(function (res) {
              if (res) {
                ctrl.directoryAllocationId = res;
                ctrl.allocateFile();
              } else {
                $scope.saving = false;
              }
            });
        } else {
          ctrl.allocateFile();
        }
      };

      // calling the allocate file api, calling upload file on success
      ctrl.allocateFile = function () {
        fileUploadFactory
          .AllocateFile(
            ctrl.directoryAllocationId,
            $scope.selectedFile.rawFile.name,
            $scope.selectedFile.rawFile.type,
            'soar-per-perhst-add',
            false
          )
          .then(function (res) {
            if (res && res.data && res.data.Result) {
              ctrl.uploadFile(res.data.Result.FileAllocationId);
            } else {
              $scope.saving = false;
            }
          });
      };

      // calling the upload api, if we get a failure, delete the previously created file allocation
      ctrl.uploadFile = function (fileAllocationId) {
        var formData = new FormData();
        formData.append('file', $scope.selectedFile.rawFile);
        fileUploadFactory
          .UploadFile(
            fileAllocationId,
            formData,
            'soar-per-perhst-add',
            true,
            $routeParams.patientId,
            $scope.selectedFile.size,
            'HIPAA Authorization'
          )
          .then(function (res) {
            if (res && res.Value) {
              $scope.saving = false;
              $scope.close({
                uploadAttempted: true,
                fileAllocationId: res.Value.FileAllocationId,
              });
              toastrFactory.success(
                localize.getLocalizedString(
                  'HIPAA Authorization Form uploaded successfully.'
                ),
                localize.getLocalizedString('Success')
              );
              $rootScope.$broadcast('soar:patient-documents-changed');
            } else {
              $scope.saving = false;
              $scope.close({ uploadAttempted: true, fileAllocationId: null });
            }
          });
      };

      // clearing the object on k-remove
      $scope.remove = function (e) {
        // if the deleted file matches the selectedFile, it is okay to clear it and the errorMessage
        if (e.files[0].uid === $scope.selectedFile.uid) {
          $scope.selectedFile = null;
          $scope.errorMessage = '';
          $scope.$apply();
        }
      };

      // fired on k-select, validation, etc.
      $scope.onSelect = function (e) {
        $scope.selectedFile = e.files[0];
        $scope.errorMessage = fileUploadFactory.GetErrorMessage(
          $scope.selectedFile
        );
        $scope.$apply();
      };
    },
  ]);
