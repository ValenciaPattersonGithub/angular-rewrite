angular.module('Soar.Patient').controller('MedicalHistoryUploaderController', [
  '$scope',
  'localize',
  'toastrFactory',
  '$rootScope',
  'FileUploadFactory',
  '$routeParams',
  'DocScanControlService',
  'DocumentGroupsService',
  'DocUploadService',
  'PatientValidationFactory',
  function (
    $scope,
    localize,
    toastrFactory,
    $rootScope,
    fileUploadFactory,
    $routeParams,
    docScanControlService,
    documentGroupsService,
    docUploadService,
    patientValidationFactory
  ) {
    var ctrl = this;
    const defaultScanDocName = 'scan.pdf';
    $scope.scanMode = false;
    $scope.scanComplete = false;
    $scope.selectedFile = null;
    $scope.saveDisabled = true;
    $scope.documentName = null;
    $scope.medicalHistoryGroupId = null;
    $scope.scannedFileValidationMessage = null;
    $scope.patientData = { Data: null, DirectoryAllocationId: null };
    $scope.patientId = null;
    $scope.patientLocations = null;
    $scope.patientData = null;

    // init
    ctrl.$onInit = function () {
      ctrl.directoryAllocationId = null;
      var buttonText = localize.getLocalizedString('Select File...');
      $scope.localizationObject = {
        select: buttonText,
      };

      // get the medical history group id
      documentGroupsService.get().$promise.then(
        function (res) {
          if (res && res.Value) {
            let medHistoryObject = res.Value.find(
              option =>
                option.Description.toLowerCase() ===
                'Medical History'.toLowerCase()
            );
            if (medHistoryObject) {
              $scope.medicalHistoryGroupId = medHistoryObject.DocumentGroupId;
            }
          }
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the {0}. Refresh the page to try again.',
              ['Document Groups']
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );

      $scope.patientId = $routeParams.patientId;
      $scope.patientData = patientValidationFactory.GetPatientData();

      if (
        $scope.patientData &&
        $scope.patientId &&
        $scope.patientData.PatientId === $scope.patientId
      ) {
        $scope.patientLocations = $scope.patientData.PatientLocations;
      }
    };

    // call the close method with the appropriate params
    $scope.onCancel = function () {
      $scope.close({ uploadAttempted: false, fileAllocationId: null });
    };

    $scope.onSave = function () {
      if ($scope.scanMode) {
        $scope.uploadScannedFile();
      } else {
        $scope.createDirectory();
      }
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
          'Medical History'
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
                'Medical History Form uploaded successfully.'
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

      if ($scope.errorMessage === '') {
        $scope.saveDisabled = false;
      }

      $scope.$apply();
    };

    //#region scan option

    $scope.addDocumentRecord = function (documentUploaded) {
      return new Promise((resolve, reject) => {
        docUploadService.addDocument(documentUploaded).then(
          res => {
            toastrFactory.success(
              localize.getLocalizedString('File uploaded successfully.'),
              localize.getLocalizedString('Success')
            );

            docUploadService.addRecentDocument(res.Value);
            resolve(res);
          },
          () => {
            $scope.scannedFileValidationMessage =
              'An issue occurred while uploading the file after allocation, please rename your file and try again.';
            reject();
          }
        );
      });
    };

    $scope.createDocumentObject = function (fileAllocated, fileToUpload) {
      return new Promise((resolve, reject) => {
        if ($scope.medicalHistoryGroupId !== null) {
          const document = {
            FileAllocationId: fileAllocated.FileAllocationId,
            DocumentGroupId: $scope.medicalHistoryGroupId, // always save to medical history group for this dialog
            MimeType: fileAllocated.MimeType,
            Name: $scope.documentName,
            NumberOfBytes: fileToUpload.size,
            ParentId: $scope.patientId,
            ParentType: 'Patient',
            ToothNumbers: [],
          };

          resolve(document);
        } else {
          $scope.scannedFileValidationMessage =
            'Please select a document group.';
          resolve(null);
        }
      });
    };

    $scope.uploadFile = function (fileAllocationId, fileToUpload) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const formData = new FormData();
        formData.append('file', fileToUpload);

        docUploadService.uploadFile(fileAllocationId, formData).then(res => {
          if (res && res.data && res.data.Result) {
            $scope
              .createDocumentObject(res.data.Result, fileToUpload)
              .then(res => {
                const documentUploaded = res;

                $scope
                  .addDocumentRecord(documentUploaded)
                  .then(uploadResult => {
                    $scope.scanMode = false;
                    docScanControlService.reset();
                    $scope.scannedFileValidationMessage = null;
                    $scope.saveDisabled = true;
                    $scope.close({
                      uploadAttempted: true,
                      fileAllocationId: fileAllocationId,
                    });
                  });
              });
          } else {
            $scope.scannedFileValidationMessage =
              'An issue occurred while uploading the file after allocation, please rename your file and try again.';
          }
        });
      };
      reader.readAsArrayBuffer(fileToUpload);
    };

    $scope.getFileForUpload = function () {
      return new Promise((resolve, reject) => {
        if (
          $scope.scanMode === true &&
          $scope.selectedFile.scanComplete === true
        ) {
          docScanControlService.retrieveFile().then(
            result => {
              resolve(result);
            },
            () => {
              reject();
            }
          );
        }
      });
    };

    $scope.getFileAllocationId = function (directoryId) {
      return new Promise((resolve, reject) => {
        docUploadService
          .allocateFile(directoryId, $scope.selectedFile)
          .then(res => {
            if (res && res.data && res.data.Result) {
              if (res.data.Result.Errors) {
                $scope.scannedFileValidationMessage =
                  'A conflict occurred while allocating the file, please contact your system administrator or rename the file and attempt to upload it again.';
                resolve(null);
              } else {
                const fileAllocationId = res.data.Result.FileAllocationId;
                resolve(fileAllocationId);
              }
            } else {
              $scope.scannedFileValidationMessage =
                'A conflict occurred while allocating the file, please contact your system administrator or rename the file and attempt to upload it again.';
              resolve(null);
            }
          });
      });
    };

    $scope.uploadScannedFile = function () {
      $scope.scannedFileValidationMessage = null;

      if ($scope.selectedFile && $scope.patientLocations.length > 0) {
        $scope.createPatientDirectory().then(res => {
          if (res) {
            const directoryAllocationId = res;
            $scope.getFileAllocationId(directoryAllocationId).then(res => {
              const fileAllocationId = res;

              if (fileAllocationId) {
                $scope.getFileForUpload().then(res => {
                  const fileToUpload = res;
                  if (res) {
                    $scope.uploadFile(fileAllocationId, fileToUpload);
                  }
                });
              }
            });
          }
        });
      } else {
        $scope.scannedFileValidationMessage = 'Please select a file to upload.';
      }
    };

    $scope.createPatientDirectory = function () {
      return new Promise((resolve, reject) => {
        const directoryAllocationId =
          $scope.patientData && $scope.patientData.DirectoryAllocationId
            ? $scope.patientData.DirectoryAllocationId
            : null;
        const patientLocationIds = $scope.patientLocations.map(
          a => a.LocationId
        );

        const patientInfo = {
          PatientId: $scope.patientId,
          LocationIds: patientLocationIds,
          DirectoryAllocationId: directoryAllocationId,
        };

        docUploadService.createPatientDirectory(patientInfo).then(
          res => {
            resolve(res);
          },
          err => {
            $scope.scannedFileValidationMessage =
              'An error occurred while trying to upload your file please try again.';
            resolve(null);
          }
        );
      });
    };

    $scope.validateScannedFile = function () {
      $scope.scannedFileValidationMessage = null;
      $scope.saveDisabled = true;

      if (
        !$scope.selectedFile ||
        $scope.selectedFile === '' ||
        $scope.selectedFile === null
      ) {
        $scope.scannedFileValidationMessage = 'Document must have a name.';
        return;
      }

      if ($scope.documentName.length > 128) {
        this.fileNameValidationMessage =
          'File name length exceeded. Limited to 128 characters.';
        return;
      }

      if (!/^([a-zA-Z0-9])([a-zA-Z0-9 ._-])*$/.test($scope.documentName)) {
        $scope.scannedFileValidationMessage =
          'Please use alphanumeric characters for filename.\nAllowed characters are (a-z, A-Z, 0-9, ., -, _)';
        return;
      }

      if ($scope.medicalHistoryGroupId == null) {
        // this should have been grabbed on init
        $scope.scannedFileValidationMessage =
          'Unable to save document, missing medical history group id.';
        return;
      }

      $scope.saveDisabled = false;
    };

    $scope.onScannedFileNameChange = function ($event) {
      $scope.documentName = $scope.selectedFile.name;
      $scope.validateScannedFile();
    };

    $scope.onRemoveScannedFile = function () {
      $scope.selectedFile = null;
      $scope.scannedFileValidationMessage = null;
      $scope.scanMode = false;
      docScanControlService.reset();
    };

    $scope.scanSuccess = function () {
      if ($scope.selectedFile) {
        let tempdocName = $scope.selectedFile.name;

        if (tempdocName != defaultScanDocName) {
          $scope.selectedFile = { name: tempdocName, scanComplete: true };
        } else {
          $scope.selectedFile = { name: 'scan.pdf', scanComplete: true };
        }
      } else {
        $scope.selectedFile = { name: 'scan.pdf', scanComplete: true };
      }

      $scope.documentName = $scope.selectedFile.name;
      docScanControlService.scrollFix();
      $scope.validateScannedFile();
    };

    $scope.scanFailure = function () {
      $scope.scanMode = false;
      $scope.documentName = null;
      $scope.selectedFile = null;
    };

    $scope.toggleScanMode = function () {
      $scope.scanMode = true;
      docScanControlService.startScan();
    };

    //#endregion scan option
  },
]);
