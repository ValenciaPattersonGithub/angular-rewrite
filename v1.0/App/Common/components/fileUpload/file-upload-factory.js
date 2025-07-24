'use strict';

angular.module('common.factories').factory('FileUploadFactory', [
  'practiceService',
  'directoryModel',
  'directoryService',
  'localize',
  'patSecurityService',
  '$q',
  'toastrFactory',
  'fileModel',
  'fileService',
  'locationService',
  '$http',
  'PatientServices',
  'PatientValidationFactory',
  'imageUploadFactory',
  'DocumentGroupsService',
  'ListHelper',
  function (
    practiceService,
    directoryModel,
    directoryService,
    localize,
    patSecurityService,
    $q,
    toastrFactory,
    fileModel,
    fileService,
    locationService,
    $http,
    patientServices,
    patientValidationFactory,
    imageUploadFactory,
    documentGroupsService,
    listHelper
  ) {
    var documentGroups;

    // getting document groups to set otherClinicalDocumentGroupId
    documentGroupsService.get().$promise.then(function (res) {
      if (res && res.Value) {
        documentGroups = res.Value;
      }
    });

    // getting DocumentGroupId based on Description
    var getDocumentGroupId = function (docGroupDesc) {
      var documentGroup = listHelper.findItemByFieldValue(
        documentGroups,
        'Description',
        docGroupDesc
      );
      return documentGroup ? documentGroup.DocumentGroupId : null;
    };

    var createSignaturesDirectory = function (amfa) {
      var deferred = $q.defer();

      createPracticeDirectory(amfa).then(
        function (res) {
          if (res && res.data && res.data.Result) {
            createDirectory(
              'signatures',
              res.data.Result.DirectoryAllocationId,
              amfa,
              false,
              2
            ).then(
              function (res) {
                if (res && res.data && res.data.Result) {
                  deferred.resolve(res.data.Result.DirectoryAllocationId);
                } else {
                  deferred.reject();
                }
              },
              function () {
                deferred.reject();
              }
            );
          } else {
            deferred.reject();
          }
        },
        function () {
          deferred.reject();
        }
      );

      return deferred.promise;
    };

    var createPatientDirectory = function (patient, patientLocations, amfa) {
      var deferred = $q.defer();

      if (!patient || !patient.PatientId) {
        deferred.reject();
        return deferred.promise;
      }

      if (
        patient.DirectoryAllocationId &&
        patient.DirectoryAllocationId != '00000000-0000-0000-0000-000000000000'
      ) {
        deferred.resolve(patient.DirectoryAllocationId);
        return deferred.promise;
      }

      var patientId = patient.PatientId;

      getPatientLocations(patientId, patientLocations).then(
        function (patientLocationsResult) {
          if (patientLocationsResult && patientLocationsResult.length > 0) {
            createPracticeDirectory(amfa).then(
              function (res) {
                if (res && res.data && res.data.Result) {
                  locationService
                    .getAllLocations()
                    .then(function (locationResult) {
                      var userLocations = locationResult.map(function (l) {
                        return l.id;
                      });
                      var userAndPatientLocations = _.intersection(
                        userLocations,
                        patientLocationsResult
                      );
                      createDirectory(
                        'patient_' + patientId,
                        res.data.Result.DirectoryAllocationId,
                        amfa,
                        false,
                        3,
                        userAndPatientLocations
                      ).then(
                        function (res) {
                          if (res && res.data && res.data.Result) {
                            var directoryId =
                              res.data.Result.DirectoryAllocationId;
                            patientServices.Patients.updateDirectoryId(
                              {
                                patientId: patientId,
                                directoryId: directoryId,
                              },
                              function (res) {
                                if (res) {
                                  deferred.resolve(directoryId);
                                } else {
                                  deferred.reject();
                                }
                              },
                              function () {
                                deferred.reject();
                              }
                            );
                          } else {
                            deferred.reject();
                          }
                        },
                        function () {
                          deferred.reject();
                        }
                      );
                    });
                } else {
                  deferred.reject();
                }
              },
              function () {
                deferred.reject();
              }
            );
          } else {
            deferred.reject();
          }
        },
        function () {
          deferred.reject();
        }
      );

      return deferred.promise;
    };

    var getPatientLocations = function (patientId, patientLocations) {
      var deferred = $q.defer();

      if (patientLocations && patientLocations.length > 0) {
        deferred.resolve(patientLocations);
      } else {
        var patientData = patientValidationFactory.GetPatientData();
        if (
          patientData &&
          patientData.PatientLocations &&
          patientData.PatientLocations.length > 0
        ) {
          deferred.resolve(
            patientData.PatientLocations.map(function (pl) {
              return pl.LocationId;
            })
          );
        } else {
          patientServices.PatientLocations.get(
            { Id: patientId },
            function (res) {
              if (res && res.Value) {
                deferred.resolve(
                  res.Value.map(function (pl) {
                    return pl.LocationId;
                  })
                );
              } else {
                deferred.reject();
              }
            },
            function () {
              deferred.reject();
            }
          );
        }
      }

      return deferred.promise;
    };

    var createPracticeDirectory = function (amfa) {
      return createDirectory(null, null, amfa, true);
    };

    // create directory call, etc.
    var createDirectory = function (
      directoryName,
      parentDirectoryAllocationId,
      amfa,
      isPracticeDirectory,
      accessLevel,
      accessLevelParentIds
    ) {
      if (
        !isPracticeDirectory &&
        (!directoryName || directoryName == '' || !accessLevel)
      )
        throw new Error(
          'Directory name and access level must be supplied for all directories except the practice root'
        );
      if (
        !isPracticeDirectory &&
        accessLevel != 2 &&
        (!accessLevelParentIds || accessLevelParentIds.length < 1)
      )
        throw new Error(
          'Access level parent IDs must be supplied for location level directories'
        );

      if (patSecurityService.IsAuthorizedByAbbreviation(amfa)) {
        var defer = $q.defer();
        var promise = defer.promise;
        var currentPractice = practiceService.getCurrentPractice();
        if (currentPractice && currentPractice.id) {
          // just use default practice directory, if no directoryName is passed
          directoryName = !isPracticeDirectory
            ? directoryName
            : currentPractice.id;
          var directory = directoryModel.build(null, directoryName, null);
          directory.AccessLevel = isPracticeDirectory ? 2 : accessLevel;
          directory.AccessLevelParentIds =
            directory.AccessLevel == 2
              ? [currentPractice.id]
              : accessLevelParentIds;
          directory.ParentDirectoryAllocationId = parentDirectoryAllocationId;
          directoryService.createDirectory(directory).then(
            function (res) {
              promise = $.extend(promise, { values: res.data.Result });
              defer.resolve(res);
            },
            function (res) {
              let result = null;
              if (res && res.data) {
                result = res.data.Result;
              }
              promise = $.extend(promise, { values: result });
              defer.resolve();
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to create the directory. Refresh the page to try again.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          );
        }
        return promise;
      }
    };

    // allocate file call, etc.
    var allocateFile = function (
      directoryAllocationId,
      rawFileName,
      rawFileMimeType,
      amfa,
      canBeOverwritten
    ) {
      if (patSecurityService.IsAuthorizedByAbbreviation(amfa)) {
        var defer = $q.defer();
        var promise = defer.promise;
        var file = fileModel.build(
          null,
          directoryAllocationId,
          2,
          rawFileName,
          rawFileMimeType
        );

        if (canBeOverwritten) {
          file.CanBeOverwritten = true;
        }

        fileService.allocateFile(file).then(
          function (res) {
            promise = $.extend(promise, { values: res.data.Result });
            defer.resolve(res);
          },
          function (res) {
            // capture error when FileAllocationId in an AllocatedState is blocking the file allocation
            if (
              res &&
              res.data &&
              res.data.Result &&
              res.data.Result.Errors &&
              res.data.Result.Errors.length == 1 &&
              res.data.Result.Errors[0].ValidationMessage &&
              res.data.Result.Errors[0].ValidationMessage ==
                'File already being uploaded. Please try again later.' &&
              res.data.Result.Errors[0].CustomState &&
              res.data.Result.Errors[0].CustomState.FileAllocationId
            ) {
              res.data.Result.FileAllocationId =
                res.data.Result.Errors[0].CustomState.FileAllocationId;
              res.data.Result.Errors = null;
              promise = $.extend(promise, { values: res.data.Result });
              defer.resolve(res);
            } else {
              defer.resolve();
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to allocate the file. Refresh the page to try again.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          }
        );
        return promise;
      }
    };

    // creates a document object when passed the file object returned by the file api
    var createDocumentObject = function (
      fileAllocated,
      fileSize,
      patientId,
      docGroupDesc
    ) {
      return {
        FileAllocationId: fileAllocated.FileAllocationId,
        DocumentGroupId: getDocumentGroupId(docGroupDesc),
        MimeType: fileAllocated.MimeType,
        Name: fileAllocated.Filename,
        NumberOfBytes: fileSize,
        ParentId: patientId,
        ParentType: 'Patient',
        ToothNumbers: null,
      };
    };

    // upload file call, creates a 'soar' document as well if createDocument is true
    var uploadFile = function (
      fileAllocationId,
      formData,
      amfa,
      createDocument,
      patientId,
      fileSize,
      docGroupDesc,
      suppressFailureMessage
    ) {
      if (patSecurityService.IsAuthorizedByAbbreviation(amfa)) {
        var defer = $q.defer();
        var promise = defer.promise;
        imageUploadFactory.uploadImage(fileAllocationId, formData).then(
          function (res) {
            if (createDocument) {
              var documentObject = createDocumentObject(
                res.data.Result,
                fileSize,
                patientId,
                docGroupDesc
              );
              patientServices.Documents.Add(documentObject).$promise.then(
                function (res) {
                  promise = $.extend(promise, { values: res.Value });
                  defer.resolve(res);
                }
              );
            } else {
              promise = $.extend(promise, { values: res.data.Result });
              defer.resolve(res);
            }
          },
          function (res) {
            // if the upload attempt fails, remove the orphaned allocation
            $http.delete(
              '_fileapiurl_/api/files/' + fileAllocationId,
              fileAllocationId
            );
            promise = $.extend(promise, { values: res.data.Result });
            defer.resolve();
            if (!suppressFailureMessage) {
              toastrFactory.error(
                localize.getLocalizedString(
                  'Failed to upload the file. Refresh the page to try again.'
                ),
                localize.getLocalizedString('Server Error')
              );
            }
          }
        );
        return promise;
      }
    };

    // validation
    var getErrorMessage = function (selectedFile) {
      var message = '';
      if (selectedFile) {
        // Allows files less than 100MB
        if (selectedFile.size > 104857600) {
          message = 'File size exceeded. Limit 100 MB.';
        }
        // Allows file with names 35 characters or less
        else if (selectedFile.name.length > 35) {
          message = 'File name length exceeded. Limited to 35 characters.';
        }
        // Allows file with name that only contains best practice alphanumeric characters
        // Using &#39; because the app converts the single quote into unicode
        else if (!/^([a-zA-Z0-9])([a-zA-Z0-9 ._-])*$/.test(selectedFile.name)) {
          message =
            'Please use alphanumeric characters for filename.\nAllowed characters are (a-z, A-Z, 0-9, ., -, _)';
        }
      }
      return localize.getLocalizedString(message);
    };

    // get file metadata
    var getFileMetadata = function (fileAllocationId) {
      var defer = $q.defer();
      var promise = defer.promise;
      fileService.getMetadata(fileAllocationId).then(
        function (res) {
          promise = $.extend(promise, { values: res.data.Result });
          defer.resolve(res);
        },
        function (res) {
          promise = $.extend(promise, { values: res.data.Result });
          defer.resolve();
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the file information. Refresh the page to try again.'
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };

    return {
      CreatePatientDirectory: function (patientId, patientLocations, amfa) {
        return createPatientDirectory(patientId, patientLocations, amfa);
      },
      CreateSignaturesDirectory: function (amfa) {
        return createSignaturesDirectory(amfa);
      },
      AllocateFile: function (
        directoryAllocationId,
        rawFileName,
        rawFileMimeType,
        amfa,
        canBeOverwritten
      ) {
        return allocateFile(
          directoryAllocationId,
          rawFileName,
          rawFileMimeType,
          amfa,
          canBeOverwritten
        );
      },
      UploadFile: function (
        fileAllocationId,
        formData,
        amfa,
        createDocument,
        patientId,
        fileSize,
        docGroupDesc,
        suppressFailureMessage
      ) {
        return uploadFile(
          fileAllocationId,
          formData,
          amfa,
          createDocument,
          patientId,
          fileSize,
          docGroupDesc,
          suppressFailureMessage
        );
      },
      GetErrorMessage: function (selectedFile) {
        return getErrorMessage(selectedFile);
      },
      GetFileMetadata: function (fileAllocationId) {
        return getFileMetadata(fileAllocationId);
      },
    };
  },
]);
