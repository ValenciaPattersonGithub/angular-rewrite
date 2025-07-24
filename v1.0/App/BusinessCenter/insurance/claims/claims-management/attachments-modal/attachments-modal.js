angular
  .module('Soar.BusinessCenter')
  .controller('AttachmentsModalController', [
    '$scope',
    '$rootScope',
    'claim',
    '$uibModalInstance',
    '$sce',
    '$http',
    '$window',
    '$routeParams',
    'DocumentGroupsService',
    'DocumentService',
    'ModalFactory',
    'PatientServices',
    'toastrFactory',
    'localize',
    '$filter',
    'PatientPerioExamFactory',
    'PatientOdontogramFactory',
    'ExamState',
    '$timeout',
    'FileUploadFactory',
    'ImagingMasterService',
    'ImagingProviders',
    '$q',
    'PatientNotesService',
    'ExternalImagingWorkerFactory',
    'SoarConfig',
    'ClaimAttachmentHttpService',
    'InsuranceErrorMessageGeneratorService',
    'StaticData',
    function (
      $scope,
      $rootScope,
      claim,
      uibModalInstance,
      $sce,
      $http,
      $window,
      $routeParams,
      documentGroupsService,
      documentService,
      modalFactory,
      patientServices,
      toastrFactory,
      localize,
      $filter,
      patientPerioExamFactory,
      patientOdontogramFactory,
      examState,
      $timeout,
      fileUploadFactory,
      imagingMasterService,
      imagingProviders,
      $q,
      patientNotesService,
      externalImagingWorkerFactory,
      soarConfig,
      claimAttachmentHttpService,
      insuranceErrorMessageGeneratorService,
      staticData
    ) {
      var ctrl = this;
      ctrl.attachmentTypeSelected = null;
      ctrl.orientationSelected = null;
      ctrl.inprogressModalInstance = null;

      $scope.claim = claim;
      $scope.currentDocument = null;
      $scope.selectedAttachments = [];
      $scope.originalSelectedAttachments = [];
      $scope.isReadOnly = false;
      $scope.referenceNumber = null;
      $scope.multiDocList = [];
      $scope.fileTooltip = '';
      $scope.sidexisImagesLoading = true;
      $scope.perioIsLoading = false;
      $scope.claimNarrative = null;

          $scope.imageExtensions = [
              '.jpeg',
              '.jpg',
              '.gif',
              '.png',
              '.bmp',
              '.svg',
              '.apteryx',
              '.sidexis',
              '.blue',
          ];
          $scope.previewExtensions = [];

          // top document groups list
          $scope.documentGroupsList = [
              {
                  Description: localize.getLocalizedString('DocumentManager'),
                  Children: [],
              },
              { Description: localize.getLocalizedString('XVWeb'), Children: [] },
              { Description: localize.getLocalizedString('Perio'), Children: [] },
              { Description: localize.getLocalizedString('Sidexis'), Children: [] },
              {
                  Description: localize.getLocalizedString('Clinical Notes'),
                  Children: [],
              },
              {
                  Description: localize.getLocalizedString('Blue Imaging'),
                  Children: [],
                  Hide: soarConfig.enableBlue !== 'true',
              },
          ];

          $scope.attachmentOrientationList = [
              { Description: 'Not Applicable', Value: '0' },
              { Description: 'Left', Value: '1' },
              { Description: 'Right', Value: '2' },
          ];

          $scope.ClaimAttachmentTypes = {
              DocumentManager: 1,
              ApteryxImage: 2,
              PerioExam: 3,
              SidexisImage: 4,
              UnallocatedDocument: 5,
              BlueImage: 6,
          };

          $scope.submit = function () {
              if ($scope.disableSubmit) {
                  return;
              }
              $scope.disableSubmit = true;
              var attachments = [];
              if (ctrl.validateList()) {
                  var newAttachments = _.filter(
                      $scope.selectedAttachments,
                      function (att) {
                          return !att.IsRejected && !att.IsUnsubmitted;
                      }
                  );
                  angular.forEach(newAttachments, function (attachment) {
                      let fileAllocationId =
                          attachment.ClaimAttachmentType ===
                              $scope.ClaimAttachmentTypes.SidexisImage
                              ? null
                              : attachment.FileAllocationId;
                      let sidexisImage =
                          attachment.ClaimAttachmentType ===
                              $scope.ClaimAttachmentTypes.SidexisImage
                              ? attachment.data
                              : null;
                      let sidexisImageId =
                          attachment.ClaimAttachmentType ===
                              $scope.ClaimAttachmentTypes.SidexisImage
                              ? attachment.SidexisImageId
                              : null;
                      let imagingVendor =
                          attachment.ClaimAttachmentType ===
                              $scope.ClaimAttachmentTypes.SidexisImage
                              ? null
                              : attachment.ClaimAttachmentType ===
                                  $scope.ClaimAttachmentTypes.ApteryxImage
                                  ? 'Apteryx_XVWeb2'
                                  : 'Blue_Imaging';
                      if (!attachment.ClaimAttachmentId) {
                          var postAttachment = {
                              ClaimAttachmentType: attachment.ClaimAttachmentType,
                              ClaimId: $scope.claim.ClaimId,
                              DocumentId: attachment.DocumentId,
                              ImageId: attachment.Id,
                              Filename: ctrl.getAttachmentName(attachment),
                              FileAllocationId: fileAllocationId,
                              Remarks: attachment.attachmentNotes,
                              ObjectState: 'Add',
                              DocumentType: null,
                              AttachmentDocumentType: attachment.attachmentType,
                              Orientation: attachment.attachmentOrientation ? attachment.attachmentOrientation: '0',
                              PerioExamId: attachment.ExamId,
                              PerioImage: attachment.perioImageData,
                              SidexisImage: sidexisImage,
                              SidexisImageId: sidexisImageId,
                              ClaimStatusWhenAttached: $scope.claim.Status,
                              ImagingVendor: imagingVendor,
                              UnallocatedDocumentId: attachment.UnallocatedDocumentId,
                              UnallocatedDocumentAttachment: attachment.UnallocatedDocumentAttachment,
                              ClearinghouseVendor: 'DentalXChange'
                          };
                          attachments.push(postAttachment);
                      }
                  });

                  // don't set a narrative value if removing the last file, else it will fail on the backend
                  // (because removing the last file will remove the attachment container)
                  if ($scope.originalSelectedAttachments.length > 0 && $scope.selectedAttachments.length == 0) {
                      $scope.claimNarrative = null;
                  } else if ($scope.originalClaimNarrative !== $scope.claimNarrative &&
                      (!$scope.claimNarrative || $scope.claimNarrative === "" || $scope.claimNarrative.match(/^\s+$/g))) {
                      // Temporary workaround... DXC will blow up if you send it an empty string (400) or whitespace (500) for a narrative!
                      $scope.claimNarrative = "--";
                  }

                  angular.forEach(
                      $scope.originalSelectedAttachments,
                      function (attachment) {
                          if (
                              !_.find($scope.selectedAttachments, function (att) {
                                  return att.ClaimAttachmentId === attachment.ClaimAttachmentId;
                              })
                          ) {
                              attachment.ObjectState = 'Delete';
                              attachments.push(attachment);
                          }
                      });

                  if (attachments.length > 0 || (attachments.length == 0 && $scope.originalClaimNarrative != $scope.claimNarrative)) {
                      var postObject = {
                          ClaimId: $scope.claim.ClaimId,
                          UnsubmittedPayerReferenceNumber:
                              $scope.claim.Status === 5 || $scope.claim.Status === 6
                                  ? $scope.originalUnsubmittedReferenceNumber
                                  : $scope.referenceNumber,
                          SubmittedPayerReferenceNumber:
                              $scope.claim.Status === 5 || $scope.claim.Status === 6
                                  ? $scope.referenceNumber
                                  : $scope.originalSubmittedReferenceNumber,
                          Attachments: attachments,
                          ClaimNarrative: $scope.claimNarrative !== $scope.originalClaimNarrative ? $scope.claimNarrative : null
                      };

                      ctrl.openInProgessModal();
                      patientServices.Claim.AttachFilesToClaim(
                          postObject,
                          ctrl.attachFilesSuccess,
                          ctrl.attachFilesFailure
                      );
                  } else {
                      $scope.disableSubmit = false;
                  }
              } else {
                  $scope.disableSubmit = false;
              }
          };

          ctrl.attachFilesSuccess = function (res) {
              ctrl.inprogressModalInstance.dismiss();
              // Not expected at all, but a little defensive coding here
              if (!res.Value.Attachments) {
                  ctrl.attachFilesFailure();
                  return;
              }

              const errorMessages =
                  insuranceErrorMessageGeneratorService.determineErrorMessages(res.Value);

              if (!errorMessages) {
                  // No errors - calc what to pass back to the parent grid & close the modal

                  //a new attachment has been added if the result contains a ClaimAttachmentId that wasn't there before
                  var newAttachments = _.filter(res.Value.Attachments, function (att) {
                      return !_.find($scope.originalSelectedAttachments, function (orig) {
                          return orig.ClaimAttachmentId === att.ClaimAttachmentId;
                      });
                  });
                  //and was successfully attached, i.e. no invalid properties
                  var successfulNewAttachments = _.find(newAttachments, function (att) {
                      return !att.ErrorDetail;
                  });

                  //an old attachment hasn't been deleted if it is not in the results as a successful deletion
                  var remainingOldAttachments = _.find(
                      $scope.originalSelectedAttachments,
                      function (old) {
                          return !_.find(res.Value.Attachments, function (att) {
                              return (
                                  att.ClaimAttachmentId === old.ClaimAttachmentId &&
                                  !att.ErrorDetail &&
                                  att.ObjectState === 'Delete'
                              );
                          });
                      }
                  );
                  uibModalInstance.close({
                      claimId: claim.ClaimId,
                      hasAttachment:
                          $scope.claim.Status === 3
                              ? successfulNewAttachments !== undefined ||
                              remainingOldAttachments !== undefined
                              : $scope.claim.HasAttachemnt,
                      hasSubmittedAttachment:
                          $scope.claim.Status === 5 || $scope.claim.Status === 6
                              ? successfulNewAttachments !== undefined ||
                              remainingOldAttachments !== undefined
                              : $scope.claim.HasAcceptedOrRejectedAttachment,
                  });
              } else {
                  let finalMessage = errorMessages.primaryMessage;
                  if (errorMessages.detailMessage) {
                      finalMessage += '  (' + errorMessages.detailMessage + ')';
                  }
                  $scope.disableSubmit = false;

                  modalFactory.ConfirmModal('Attachment Errors', finalMessage, 'OK'); // Future: Hook up handler to recognize scenarios where we should directly close the attach modal?
              }
          };

          ctrl.attachFilesFailure = function (error) {
              ctrl.inprogressModalInstance.dismiss();
              $scope.disableSubmit = false;
              if (error && error.status == 0)
                  modalFactory.ConfirmModal('Attachment Errors', 'Attachment operation timed out. Please try again.', 'OK');
              else
                  toastrFactory.error(
                      localize.getLocalizedString('An unexpected error has occurred.  Retry or contact Support.'),
                      localize.getLocalizedString('Error')
                  );
          };

          $scope.cancel = function () {
              //throw message if you have a document selected
              //OR aren't editing and list is greater than zero
              //OR are editing and list mismatches original (any in list that weren't orginally OR missing from original)
              //only show if isn't read only
              if (
                  !$scope.isReadOnly &&
                  ($scope.currentDocument ||
                      (!claim.HasAttachemnt && $scope.selectedAttachments.length > 0) ||
                      (claim.HasAttachemnt && $scope.misMatched()))
              ) {
                  modalFactory.CancelModal().then(uibModalInstance.dismiss);
              } else {
                  uibModalInstance.dismiss();
              }
          };

          ctrl.init = function () {
              // get a list of document types for this vendor -assuming DentalXChange for now
              // we need these lists before proceeding
              ctrl.getAttachmentDocumentTypes().then(res => {
                  if (claim.HasAttachemnt || claim.HasAcceptedOrRejectedAttachment) {
                      patientServices.Claim.GetFilesAttachedToClaim(
                          { claimId: $scope.claim.ClaimId },
                          ctrl.setupAttachedFiles,
                          ctrl.getAttachedFilesFailure
                      );
                  } else {
                      //if there are no attachments, the page is readonly if the claim is not in unsubmitted, accepted, or rejected status
                      if (
                          $scope.claim.Status !== 3 &&
                          $scope.claim.Status !== 5 &&
                          $scope.claim.Status !== 6
                      ) {
                          $scope.isReadOnly = true;
                      } else {
                          ctrl.getAllDocuments();
                          ctrl.getClinicalNotes();
                          ctrl.initExternalExams();
                      }
                  }
              })
          };

          ctrl.clearinghouseVendors = function () {
              return staticData.ClearinghouseVendors();
          };

          // when ThirdPartyImage is attached

          // before deciding how to get the images we need patientInfo and imagingProvider
          ctrl.initExternalExams = function () {
              var externalImageDependancies = [];
              externalImageDependancies.push(
                  ctrl.getPatientInfo($scope.claim.PatientId)
              );
              externalImageDependancies.push(ctrl.getImagingProvider());
              externalImageDependancies.push(
                  ctrl.getExternalImages($scope.claim.PatientId)
              );

              $q.all(externalImageDependancies).then(function () {
                  if (
                      $scope.imagingProvider &&
                      $scope.imagingProvider.name === 'Sidexis' &&
                      $scope.imagingProvider.error !== true
                  ) {
                      // get sidexis images from sidexis

                      $scope.sidexisImagesLoading = true;
                      if (
                          ctrl.patientInfo.Profile.ThirdPartyPatientId !== null &&
                          ctrl.patientInfo.Profile.ThirdPartyPatientId > 0
                      ) {
                          ctrl.getExternalPatientId(ctrl.patientInfo).then(res => {
                              ctrl.getSidexisExternalImageExams();
                          });
                      }
                  } else {
                      ctrl.processExternalImages(ctrl.existingExternalImages);
                      $scope.sidexisImagesLoading = true;
                  }
              });
          };

          ctrl.externalPatientId = null;

          ctrl.getExternalPatientId = function (patientInfo) {
              return new Promise((resolve, reject) => {
                  let sidexis = imagingProviders.Sidexis;
                  imagingMasterService
                      .getPatientByFusePatientId(
                          patientInfo.PatientId,
                          patientInfo.Profile.ThirdPartyPatientId,
                          [sidexis]
                      )
                      .then(
                          res => {
                              if (
                                  res &&
                                  res[sidexis] &&
                                  res[sidexis].success &&
                                  res[sidexis].result &&
                                  res[sidexis].result.id
                              ) {
                                  ctrl.externalPatientId = res[sidexis].result.id;
                                  resolve(res[sidexis].result.id);
                              }
                          },
                          () => {
                              resolve(null);
                          }
                      );
              });
          };

          // see if the sidexis service is available
          $scope.imagingProvider = {
              name: 'Sidexis',
              provider: 'Sidexis',
              error: true,
              message: localize.getLocalizedString('Sidexis not available.'),
          };
          ctrl.getImagingProvider = function () {
              return new Promise((resolve, reject) => {
                  imagingMasterService.getServiceStatus().then(
                      res => {
                          if (res.sidexis) {
                              if (res.sidexis.status === 'ready') {
                                  $scope.imagingProvider = {
                                      name: 'Sidexis',
                                      provider: 'Sidexis',
                                  };
                              } else if (res.sidexis.status === 'error') {
                                  $scope.imagingProvider = {
                                      name: 'Sidexis',
                                      provider: 'Sidexis',
                                      error: true,
                                      message: localize.getLocalizedString(
                                          'Sidexis not available.'
                                      ),
                                  };
                              }
                              resolve();
                          }
                      },
                      () => {
                          resolve();
                      }
                  );
              });
          };

          // ThirdParty
          ctrl.getPatientInfo = function (patientId) {
              return new Promise((resolve, reject) => {
                  patientServices.Patients.dashboard({
                      patientId: patientId,
                  }).$promise.then(
                      function (res) {
                          if (res.Value) {
                              ctrl.patientInfo = res.Value;
                              resolve();
                          }
                      },
                      () => {
                          resolve();
                      }
                  );
              });
          };

          // if we have connection to sidexis, get the studies from there
          ctrl.getSidexisExternalImageExams = function () {
              ctrl.externalImageStudies = [];
              var sidexis = imagingProviders.Sidexis;
              if (ctrl.externalPatientId !== null && ctrl.externalPatientId !== 0) {
                  imagingMasterService
                      .getAllByPatientId(ctrl.externalPatientId, sidexis)
                      .then(
                          res => {
                              if (res) {
                                  ctrl.externalImageStudies = res.result;
                                  let externalImageDtos = ctrl.processSidexisStudies(
                                      res.result
                                  );
                                  ctrl.processExternalImages(externalImageDtos);
                                  ctrl.syncExternalImages(
                                      ctrl.existingExternalImages,
                                      ctrl.externalImageStudies
                                  );
                              }
                          },
                          () => {}
                      );
              }
          };

          ctrl.processSidexisStudies = function (externalImageStudies) {
              let externalImageDtos = [];
              _.forEach(externalImageStudies, function (study) {
                  _.forEach(study.series, function (ser) {
                      if (ser.images.length > 0) {
                          _.forEach(ser.images, function (image) {
                              let toothNumbers = [];
                              if (image.toothNumbers && image.toothNumbers !== '') {
                                  _.forEach(
                                      image.toothNumbers.split(','),
                                      function (toothNumber) {
                                          toothNumbers.push(toothNumber);
                                      }
                                  );
                              }
                              // sidexis get uses ImageId (not number)
                              let externalImageDto = {
                                  ThirdPartyImagingRecordId: null,
                                  PatientId: $scope.personId,
                                  ImageCreatedDate: image.date,
                                  ImageId: image.imageId,
                                  OriginalImageFilename:
                                      image.description + '_' + image.imageNumber.toString(),
                                  ImagingProviderId: 1,
                                  ToothNumbers: toothNumbers,
                              };
                              externalImageDtos.push(externalImageDto);
                          });
                      }
                  });
              });
              return externalImageDtos;
          };

          ctrl.processExternalImages = function (externalImages) {
              // add calculated group date for bundling images as an exam
              _.forEach(externalImages, function (image) {
                  image.$$ExamDate = $filter('date')(
                      image.ImageCreatedDate,
                      'EEEE, MMMM d y'
                  );
              });

              externalImages = _.sortBy(externalImages, 'ImageCreatedDate').reverse();
              // an exam equals all images for this patient for a particular day
              // group the records
              let imageGroups = _.groupBy(externalImages, '$$ExamDate');
              // sort files desc in each group
              imageGroups.files = _.sortBy(
                  imageGroups.files,
                  'ImageCreatedDate'
              ).reverse();

              _.forEach(imageGroups, function (imageGroup) {
                  let exam = { files: [] };
                  if (imageGroup.length > 0) {
                      exam.Date = moment(imageGroup[0].$$ExamDate)
                          .utc()
                          .format('YYYY-MM-DDTHH:mm:ss');
                      exam.Description = $filter('date')(
                          new Date(exam.Date),
                          'MM/dd/yyyy'
                      );
                      _.forEach(imageGroup, function (image) {
                          image.UniqueListId = 'Image_' + image.ImageId;
                          image.Name = ctrl.createExternalImageDescription(image);
                          image.ClaimAttachmentType =
                              $scope.ClaimAttachmentTypes.SidexisImage;
                          image.ext = '.sidexis';
                          // images always valid for Claims
                          image.$$ValidAttachmentTypeForClaims = true;
                          image.$$AppendText = '';
                          image.SidexisImageId = image.ImageId;
                          exam.files.push(image);
                      });
                      $scope.documentGroupsList[3].Children.push(exam);
                      $scope.sidexisImagesLoading = false;
                  }
              });
          };

          // concat toothNumbers to image
          ctrl.createExternalImageDescription = function (image) {
              let description = image.OriginalImageFilename;
              if (image.ToothNumbers) {
                  description = description.concat(' ', image.ToothNumbers);
              }
              return description;
          };

          // get the ExternalImages if any
          ctrl.getExternalImages = function (patientId) {
              let promise = patientServices.ExternalImages.get({
                  patientId: patientId,
              }).$promise.then(function (res) {
                  ctrl.existingExternalImages = res.Value;
              });
              return promise;
          };

          ctrl.syncImagesFailure = function (res) {
              // I'm not sure we want to do anything here
          };

          ctrl.syncImagesSuccess = function (res) {
              // I'm not sure we want to do anything here
          };

          // calls the externalImagesFactory to synchronize the fuse externalImage data with the sidexis data
          ctrl.syncExternalImages = function () {
              if (
                  ctrl.externalImageStudies &&
                  ctrl.externalImageStudies.length > 0 &&
                  ctrl.existingExternalImages &&
                  ctrl.existingExternalImages.length > 0
              ) {
                  externalImagingWorkerFactory.syncImages(
                      ctrl.existingExternalImages,
                      ctrl.externalImageStudies,
                      ctrl.syncImagesSuccess,
                      ctrl.syncImagesFailure
                  );
              }
          };

          ctrl.getAllDocuments = function () {
              //get document manager documents
              documentService.get(
                  { parentId: $scope.claim.PatientId, parentType: 'patient' },
                  function (result) {
                      ctrl.processDocuments(result.Value);
                      documentGroupsService.getAll(function (res) {
                          //set up the groups so they match the way it's done on the document manager
                          var eob, insurance;
                          var documents = [{ Description: 'Clinical', Children: [] }];
                          _.forEach(res.Value, function (group) {
                              group.files = _.filter(result.Value, function (file) {
                                  return file.DocumentGroupId === group.DocumentGroupId;
                              });
                              // sort files desc in each group
                              group.files = _.sortBy(group.files, 'DateModified').reverse();
                              ctrl.setValidAttachmentTypeForClaims(group.files);
                              if (
                                  group.Description === 'Lab' ||
                                  group.Description === 'HIPPA' ||
                                  group.Description === 'Specialist' ||
                                  group.Description === 'Consent' ||
                                  group.Description === 'Other Clinical'
                              ) {
                                  documents[0].Children.push(group);
                              } else if (group.Description === 'EOB') {
                                  eob = group;
                              } else if (group.Description === 'Insurance') {
                                  insurance = group;
                                  documents.push(group);
                              } else {
                                  documents.push(group);
                              }
                          });
                          if (eob && insurance) {
                              insurance.Children = [eob];
                          }
                          $scope.documentGroupsList[0].Children = documents;
                      });
                  }
              );
              //get apteryx images

              imagingMasterService.getReadyServices().then(function (res) {
                  let providers = _.reduce(
                      res,
                      function (result, value, key) {
                          if (key !== imagingProviders.Sidexis) result.push(key);

                          return result;
                      },
                      []
                  );
                  imagingMasterService
                      .getPatientByFusePatientId(
                          $scope.claim.PatientId,
                          $scope.claim.PatientId,
                          providers
                      )
                      .then(function (patResults) {
                          for (let provider of providers) {
                              let patRes = patResults[provider];
                              if (patRes && patRes.success) {
                                  if (
                                      patRes.result &&
                                      ((patRes.result.data &&
                                          patRes.result.data.Records &&
                                          patRes.result.data.Records.length > 0) ||
                                          patRes.result.Value)
                                  ) {
                                      let patientId = patRes.result.data
                                          ? patRes.result.data.Records[0].Id
                                          : patRes.result.Value.Id;
                                      imagingMasterService
                                          .getAllByPatientId(patientId, provider)
                                          .then(function (res) {
                                              if (res && res.success && res.result) {
                                                  let exams = res.result.Exams || res.result.Value;
                                                  if (exams && exams.length > 0) {
                                                      ctrl.setupImages(exams, provider);
                                                  }
                                              }
                                          });
                                  }
                              }
                          }
                      });
              });

              //getperios
              patientPerioExamFactory.access();
              patientPerioExamFactory
                  .get($scope.claim.PatientId)
                  .then(ctrl.setupPerios);

              ctrl.createDirectoryBeforeDownload($scope.claim.PatientId);
          };

          ctrl.processDocuments = function (documents) {
              if (documents && documents.length > 0) {
                  angular.forEach(documents, function (file) {
                      var nameArray = file.Name.split('.');
                      file.ext = '.' + nameArray[nameArray.length - 1];
                      file.UniqueListId = 'Doc_' + file.DocumentId;
                      file.ClaimAttachmentType =
                          $scope.ClaimAttachmentTypes.DocumentManager;
                  });
              }
          };

          ctrl.createDirectoryPromise = null;
          ctrl.createDirectoryBeforeDownload = function (patientId) {
              ctrl.createDirectoryPromise = fileUploadFactory.CreatePatientDirectory(
                  { PatientId: patientId },
                  null,
                  'plapi-files-fsys-write'
              );
          };

          // concatenate modality, Permanent and Primary Teeth, and Comments
          ctrl.createImageDescription = function (modality, image) {
              var description = modality ? ' ' + modality : '';
              if (image.AdultTeeth) {
                  description = description.concat(' ', image.AdultTeeth);
              }
              if (image.DeciduousTeeth) {
                  description = description.concat(' ', image.DeciduousTeeth);
              }
              if (image.Comments) {
                  description = description.concat(' (' + image.Comments + ')');
              }
              return description;
          };

          //setup the apteryx images
          ctrl.setupImages = function (exams, provider) {
              let isBlue = provider === imagingProviders.Blue;
              let docGroupIndex = isBlue ? 5 : 1;
              angular.forEach(exams, function (exam) {
                  angular.forEach(exam.Series, function (series) {
                      if (isBlue) {
                          series.Date = exam.Date;
                      }
                      series.Description = $filter('date')(
                          new Date(series.Date),
                          'MM/dd/yyyy'
                      );
                      series.files = [];
                      angular.forEach(series.Images, function (image) {
                          image.UniqueListId = 'Image_' + image.Id;
                          image.Name = ctrl.createImageDescription(
                              isBlue ? image.ImageType : series.Modality,
                              image
                          );
                          image.ClaimAttachmentType = isBlue
                              ? $scope.ClaimAttachmentTypes.BlueImage
                              : $scope.ClaimAttachmentTypes.ApteryxImage;
                          image.ext = isBlue ? '.blue' : '.apteryx';
                          // images always valid for Claims
                          image.$$ValidAttachmentTypeForClaims = true;
                          image.$$AppendText = '';
                          series.files.push(image);
                      });
                      $scope.documentGroupsList[docGroupIndex].Children.push(series);
                  });
              });
              $scope.documentGroupsList[docGroupIndex].Children = _.sortBy(
                  $scope.documentGroupsList[docGroupIndex].Children,
                  'Date'
              ).reverse();
          };

          // setup the perio charts
          ctrl.setupPerios = function (res) {
              angular.forEach(res.Value, function (perio) {
                  perio.UniqueListId = 'Perio_' + perio.ExamId;
                  perio.Name = moment(moment.utc(perio.ExamDate).toDate()).format(
                      'MM/DD/YYYY h:mm a'
                  );
                  perio.ClaimAttachmentType = $scope.ClaimAttachmentTypes.PerioExam;
                  perio.ext = '.perio';
                  // perio always valid for Claims
                  perio.$$ValidAttachmentTypeForClaims = true;
                  perio.$$AppendText = '';
              });
              $scope.documentGroupsList[2].files = _.sortBy(
                  res.Value,
                  'ExamDate'
              ).reverse();
          };

          $scope.originalClaimNarrative = null;
          ctrl.setupAttachedFiles = function (res) {
              var wrongClearinghouseVendor = false;
              var clearinghouseVendorEnum = ctrl.clearinghouseVendors();
              for (var i = (res.Value.Attachments.length - 1); i >= 0; i--) {
                  if (clearinghouseVendorEnum[res.Value.Attachments[i].ClearinghouseVendor] !== clearinghouseVendorEnum.DentalXChange) {
                      res.Value.Attachments.splice(res.Value.Attachments[i], 1);
                      wrongClearinghouseVendor = true;
                  }
              }

              angular.forEach(res.Value.Attachments, function (file) {
                  file.Name = file.Filename;
                  file.UniqueListId = file.ClaimAttachmentId;
                  if (
                      file.ClaimAttachmentType ===
                      $scope.ClaimAttachmentTypes.DocumentManager
                  ) {
                      var nameArray = file.Filename.split('.');
                      file.ext = '.' + nameArray[nameArray.length - 1];
                  } else if (
                      file.ClaimAttachmentType ===
                      $scope.ClaimAttachmentTypes.ApteryxImage ||
                      file.ClaimAttachmentType ===
                      $scope.ClaimAttachmentTypes.SidexisImage ||
                      file.ClaimAttachmentType === $scope.ClaimAttachmentTypes.BlueImage
                  ) {
                      file.ext = '.jpg';
                  } else if (
                      file.ClaimAttachmentType === $scope.ClaimAttachmentTypes.PerioExam
                  ) {
                      file.ext = '.png';
                  } else if (
                      file.ClaimAttachmentType ===
                      $scope.ClaimAttachmentTypes.UnallocatedDocument
                  ) {
                      file.ext = '.pdf';
                  }
                  file.attachmentNotes = file.Remarks;
                  file.attachmentType = file.DocumentType;
                  file.attachmentOrientation = file.Orientation;
                  ctrl.determineTypeOfUnallocatedDocument(file);
              });
              if (wrongClearinghouseVendor === true) {
                  modalFactory.ConfirmModal('Invalid ClearinghouseVendor', "Attachments were previously saved on this claim with an old Clearinghouse. Please delete and recreate this claim, then add attachments for DentalXchange to process the claim.", 'OK');
              }
              $scope.selectedAttachments = res.Value.Attachments;
              $scope.originalSelectedAttachments = angular.copy(
                  res.Value.Attachments
              );

              if (res.Value.SubmittedPayerReferenceNumber) {
                  //if attachment has been made for submitted claim
                  $scope.referenceNumber = res.Value.SubmittedPayerReferenceNumber;
                  $scope.isReadOnly = true;
              } else if (res.Value.UnsubmittedPayerReferenceNumber) {
                  //if attachment has been made for unsubmitted claim
                  if ($scope.claim.Status === 5 || $scope.claim.Status === 6) {
                      ctrl.getReferenceNumber();
                  } else {
                      $scope.referenceNumber = res.Value.UnsubmittedPayerReferenceNumber;
                      $scope.isReadOnly = true;
                  }
              } else {
                  if ($scope.claim.Status === 5 || $scope.claim.Status === 6) {
                      ctrl.getReferenceNumber();
                  }
                  $scope.isReadOnly =
                      $scope.claim.Status !== 5 &&
                      $scope.claim.Status !== 6 &&
                      $scope.claim.Status !== 3;
              }

              if (!$scope.isReadOnly) {
                  ctrl.getAllDocuments();
                  ctrl.getClinicalNotes();
                  ctrl.initExternalExams();
              }
              angular.forEach(res.Value.Attachments, function (file) {
                  file.canNotDelete =
                      ($scope.claim.Status !== 3 && file.ClaimStatusWhenAttached === 3) ||
                      $scope.referenceNumber;
              });
              $scope.originalUnsubmittedReferenceNumber =
                  res.Value.UnsubmittedPayerReferenceNumber;
              $scope.originalSubmittedReferenceNumber =
                  res.Value.SubmittedPayerReferenceNumber;
              $scope.claimNarrative = res.Value.ClaimNarrative;
              $scope.originalClaimNarrative = res.Value.ClaimNarrative;
          };

          ctrl.getReferenceNumber = function () {
              patientServices.Claim.GetAttachmentPayerReferenceNumber(
                  { claimId: $scope.claim.ClaimId },
                  function (res) {
                      $scope.referenceNumber = res.Value;
                  }
              );
          };

          ctrl.setNoteProperties = function (file) {
              let matchingNote = _.find($scope.clinicalNotes, function (note) {
                  return note.UnallocatedDocumentId === file.UnallocatedDocumentId;
              });
              if (matchingNote) {
                  file.Note = matchingNote.Note;
                  file.NoteId = matchingNote.NoteId;
                  file.NoteTitle = matchingNote.NoteTitle;
                  file.ToothNumbers = matchingNote.ToothNumbers;
                  file.CreatedByName = matchingNote.CreatedByName;
                  file.CreatedByProfessionalDesignation =
                      matchingNote.CreatedByProfessionalDesignation;
                  file.NoteTypeId = matchingNote.NoteTypeId;
                  file.CreatedDate = matchingNote.CreatedDate;
                  file.$$ValidAttachmentTypeForClaims = true;
                  file.$$AppendText = '';
                  file.$$IsClinicalNote = true;
                  file.UniqueListId = 'Note_' + matchingNote.NoteId;
                  file.Name =
                      matchingNote.NoteTitle +
                      ' ' +
                      moment(moment.utc(matchingNote.CreatedDate).toDate()).format(
                          'MM/DD/YYYY h:mm a'
                      );
                  file.ClaimAttachmentType =
                      $scope.ClaimAttachmentTypes.UnallocatedDocument;
                  file.data = {};
              }
          };

          $scope.setCurrentDocument = function (file) {
              $scope.showUploadInvalidTypeMessage = false;
              let config = {};
              // do not process files with invalid attachment types for claims and
              // do not process files if they are sidexis and imaging provider is not available
              file.$$ValidAttachmentTypeForClaims = ctrl.validAttachmentTypeForClaims(
                  file.ext, file.ClaimAttachmentType
              );
              if (
                  file.$$ValidAttachmentTypeForClaims === false ||
                  (file.ClaimAttachmentType ===
                      $scope.ClaimAttachmentTypes.SidexisImage &&
                      $scope.imagingProvider.error === true)
              ) {
                  return;
              }
              var existingFile = _.find(
                  $scope.selectedAttachments,
                  function (attachment) {
                      if (attachment.ClaimAttachmentType !== file.ClaimAttachmentType) {
                          return false;
                      }
                      switch (attachment.ClaimAttachmentType) {
                          case $scope.ClaimAttachmentTypes.DocumentManager:
                              return attachment.DocumentId === file.DocumentId;
                          case $scope.ClaimAttachmentTypes.ApteryxImage:
                              if (
                                  !_.isNil(file.Id) &&
                                  attachment.ImageId === file.Id.toString()
                              ) {
                                  return true;
                              } else if (
                                  !_.isNil(file.ClaimAttachmentId) &&
                                  attachment.ImageId === file.ClaimAttachmentId.toString()
                              ) {
                                  return true;
                              } else {
                                  return false;
                              }
                          case $scope.ClaimAttachmentTypes.PerioExam:
                              return attachment.PerioExamId === file.ExamId;
                          case $scope.ClaimAttachmentTypes.SidexisImage:
                              return attachment.SidexisImageId === file.SidexisImageId;
                          case $scope.ClaimAttachmentTypes.BlueImage:
                              return attachment.ImageId === file.Id;
                          case $scope.ClaimAttachmentTypes.UnallocatedDocument:
                              return (
                                  attachment.UnallocatedDocumentId ===
                                  file.UnallocatedDocumentId
                              );
                      }
                      return false;
                  }
              );
              file = existingFile ? existingFile : file;
              // if file ClaimAttachmentType is UnallocatedDocument transfer note Properties to existing file
              if (
                  file.ClaimAttachmentType ===
                  $scope.ClaimAttachmentTypes.UnallocatedDocument &&
                  file.UnallocatedDocumentId !== null &&
                  file.UnallocatedDocumentId.substring(
                      0,
                      file.UnallocatedDocumentId.indexOf('_')
                  ) === 'ClinicalNote'
              ) {
                  ctrl.setNoteProperties(file);
                  ctrl.buildNoteText(file);
              }

              $scope.currentDocument = file;

              if (_.isNil(file.$$selected)) {
                  file.$$selected = true;
                  if (
                      $scope.selectedAttachments.some(
                          x => x.UniqueListId === file.UniqueListId
                      )
                  ) {
                      file.$$selected = null;
                  }
              } else {
                  file.$$selected = null;
              }

              if (
                  _.toLower(file.ext) === '.pdf' && file.ClaimAttachmentType == $scope.ClaimAttachmentTypes.UnallocatedDocument) {
                  ctrl.getAttachment(file);

              }

              //if item clicked is in multi document list, remove from list
              //else add to list
              if ($filter('isInList')(file, $scope.multiDocList)) {
                  $scope.multiDocList = _.remove($scope.multiDocList, function (n) {
                      return n.UniqueListId !== file.UniqueListId;
                  });
              } else {
                  //do not add to multi document list if already attached
                  if (!$filter('isInList')(file, $scope.selectedAttachments)) {
                      //set perioIsLoading to true to wait for exam to be finished
                      if (file.ext === '.perio') {
                          $scope.perioIsLoading = true;
                      }
                      $scope.multiDocList.push(file);
                  }
              }

              //reset types and notes if not viewing an image currently in the list of attachments
              if (
                  !$filter('isInList')(
                      $scope.currentDocument,
                      $scope.selectedAttachments
                  )
              ) {
                  $scope.currentDocument.attachmentType =
                      $scope.currentDocument.ClaimAttachmentType ===
                          $scope.ClaimAttachmentTypes.PerioExam
                          ? 'PeriodontalCharts'
                          : 'OtherAttachments';
                  $scope.currentDocument.attachmentOrientation = '0';
                  $scope.currentDocument.attachmentNotes = '';
              }
              if (file.ClaimAttachmentType == $scope.ClaimAttachmentTypes.DocumentManager
                  && _.toLower(file.ext) == '.txt' && $scope.currentVendor == $scope.vendorEnum.DentalXChange) {
                  ctrl.getTextFile(file);
              }
              else if (
                  file.ClaimAttachmentId &&
                  !file.data &&
                  ($filter('canPreview')(_.toLower(file.ext), $scope.imageExtensions) ||
                      _.toLower(file.ext) === '.pdf' ||
                      _.toLower(file.ext) === '.apteryx' ||
                      _.toLower(file.ext) === '.blue' ||
                      _.toLower(file.ext) === '.perio')
              ) {
                  ctrl.getAttachment(file);
              } else if (
                  ($filter('canPreview')(_.toLower(file.ext), $scope.imageExtensions) ||
                      _.toLower(file.ext) === '.pdf') &&
                  _.toLower(file.ext) !== '.apteryx' &&
                  _.toLower(file.ext) !== '.blue' &&
                  _.toLower(file.ext) !== '.sidexis' &&
                  !file.data
              ) {
                  ctrl.getFile(file);
              } else if (_.toLower($scope.currentDocument.ext) === '.perio') {
                  ctrl.getPerio(file);
              } else if (_.toLower(file.ext) === '.sidexis' && !file.data) {
                  let sidexis = imagingProviders.Sidexis;
                  file.gettingData = true;
                  config = {
                      headers: { Accept: 'application/octet-stream' },
                      responseType: 'arraybuffer',
                  };
                  // until Thomas gets his api changes hard code this value
                  //file.ImageId = 'f9a7bdea-b2e7-4721-be06-be5fdcb3a243_-143095439';
                  imagingMasterService
                      .getImageBitmapByImageId(
                          file.ImageId,
                          sidexis,
                          ctrl.externalPatientId,
                          'jpeg'
                      )
                      .then(
                          res => {
                              $http.get(res.result, config).then(
                                  function (res) {
                                      if (res.data) {
                                          let binary = '';
                                          let bytes = new Uint8Array(res.data);
                                          let len = bytes.byteLength;
                                          for (let i = 0; i < len; i++) {
                                              binary += String.fromCharCode(bytes[i]);
                                          }
                                          file.data =
                                              'data:image/jpeg;base64,' + $window.btoa(binary);
                                          file.gettingData = false;
                                      }
                                  },
                                  function () {
                                      file.gettingData = false;
                                  }
                              );
                          },
                          () => {
                              file.gettingData = false;
                          }
                      );
              } else if (_.toLower(file.ext) === '.apteryx' && !file.data) {
                  let apteryx = imagingProviders.Apteryx2;
                  config = {
                      headers: { Accept: 'image/jpeg' },
                      responseType: 'arraybuffer',
                  };
                  imagingMasterService
                      .getImageBitmapByImageId(
                          file.Id,
                          apteryx,
                          ctrl.externalPatientId,
                          'jpeg'
                      )
                      .then(function (urlRes) {
                          if (urlRes && urlRes.success) {
                              $http
                                  .get(urlRes.result.replace('/thumbnail', ''), config)
                                  .then(function (res) {
                                      if (res.data) {
                                          var binary = '';
                                          var bytes = new Uint8Array(res.data);
                                          var len = bytes.byteLength;
                                          for (var i = 0; i < len; i++) {
                                              binary += String.fromCharCode(bytes[i]);
                                          }
                                          file.data =
                                              'data:image/jpeg;base64,' + $window.btoa(binary);
                                      }
                                  });
                          }
                      });
              } else if (_.toLower(file.ext) === '.blue' && !file.data) {
                  let blue = imagingProviders.Blue;
                  file.gettingData = true;
                  config = {
                      headers: { Accept: 'application/octet-stream' },
                      responseType: 'arraybuffer',
                  };
                  imagingMasterService
                      .getImageBitmapByImageId(
                          file.Id,
                          blue,
                          $scope.claim.PatientId,
                          'jpeg'
                      )
                      .then(
                          res => {
                              if (res && res.success) {
                                  let binary = '';
                                  let bytes = new Uint8Array(res.result);
                                  let len = bytes.byteLength;
                                  for (let i = 0; i < len; i++) {
                                      binary += String.fromCharCode(bytes[i]);
                                  }
                                  file.data = 'data:image/jpeg;base64,' + $window.btoa(binary);
                                  file.gettingData = false;
                              } else {
                                  file.gettingData = false;
                              }
                          },
                          () => {
                              file.gettingData = false;
                          }
                      );
              }

              if ($scope.isReadOnly) {
                  $scope.referenceNumber =
                      file.ClaimStatusWhenAttached === 3
                          ? $scope.originalUnsubmittedReferenceNumber
                          : $scope.originalSubmittedReferenceNumber;
              }
          };

          //begin processing perio image only when loading is complete
          $rootScope.$on('$perioLoadingComplete', function () {
              if (!_.isNil($scope.currentDocument)) {
                  ctrl.processPerioImage($scope.currentDocument);
              }
          });

          $scope.addCurrentAttachment = function () {

              if (
                  $scope.currentDocument &&
                  !$scope.currentDocument.UniqueListId &&
                  $scope.currentDocument.attachmentNotes &&
                  $scope.currentDocument.attachmentNotes !== ''
              ) {
                  ctrl.setNarrativeProperties($scope.currentDocument);
              }

              //can't add to the list unless it isn't already in the list
              for (let doc of $scope.multiDocList) {
                  if (
                      !_.find($scope.selectedAttachments, function (file) {
                          return file.UniqueListId === doc.UniqueListId;
                      })
                  ) {
                      doc.$$selected = null;
                      if (doc.ext !== '.perio') {
                          doc.attachmentType = ctrl.attachmentTypeSelected;
                          doc.attachmentOrientation = ctrl.orientationSelected;
                      } else {
                          doc.attachmentType = 'PeriodontalCharts';
                          doc.attachmentOrientation = null;
                      }

                      $scope.selectedAttachments.push(doc);
                  }
                  $scope.currentDocument = null;
                  //clear list after attachment is added
                  $scope.multiDocList = [];
              }
          };

          ctrl.processPerioImage = function (doc) {
              let perioId = doc.UniqueListId;
              kendo.drawing
                  .drawDOM($('#perio-include'))
                  .then(function (group) {
                      // Render the result as a PNG image
                      return kendo.drawing.exportImage(group);
                  })
                  .done(function (data) {
                      // Save the image file
                      var perio = _.find(
                          $scope.documentGroupsList[2].files,
                          function (file) {
                              return file.UniqueListId === perioId;
                          }
                      );
                      perio.perioImageData = data;
                      $scope.perioIsLoading = false;
                  });
          };

          $scope.deleteAttachment = function (file) {
              if (
                  $scope.currentDocument &&
                  file.UniqueListId === $scope.currentDocument.UniqueListId
              ) {
                  $scope.currentDocument = null;
              }
              $scope.selectedAttachments = _.reject(
                  $scope.selectedAttachments,
                  function (attachment) {
                      return file.UniqueListId === attachment.UniqueListId;
                  }
              );
          };

          ctrl.validateList = function () {
              var isValid = true;
              if (
                  ($scope.claim.Status === 5 || $scope.claim.Status === 6) &&
                  !$scope.referenceNumber
              ) {
                  isValid = false;
                  $scope.showErrors = true;
              }
              angular.forEach($scope.selectedAttachments, function (attachment) {
                  if (!attachment.ClaimAttachmentId) {
                      // validate that the attachmentDocumentType is in attachmentDocumentTypesList 
                      if (
                          !_.find($scope.attachmentDocumentTypesList, function (listItem) {
                              return attachment.attachmentType === listItem.attachmentDocumentType;
                          })
                      ) {
                          isValid = false;
                      }
                      // validate if attachment has attachmentOrientation but doesn't require it 
                      if (
                          attachment.attachmentOrientation === '1' ||
                          attachment.attachmentOrientation === '2'
                      ) {
                          if (!$filter('needsOrientation')(attachment.attachmentType, $scope.attachmentDocumentTypesList)) {
                              isValid = false;
                          }
                      }
                      if (
                          attachment.ClaimAttachmentType ===
                          $scope.ClaimAttachmentTypes.PerioExam &&
                          attachment.attachmentType !== 'PeriodontalCharts'
                      ) {
                          isValid = false;
                      }
                  }
              });
              return isValid;
          };

          $scope.misMatched = function () {
              var notOriginal = _.find($scope.selectedAttachments, function (att) {
                  return !att.ClaimAttachmentId;
              });
              var unremoved = _.filter($scope.selectedAttachments, function (att) {
                  return att.ClaimAttachmentId;
              });
              return (
                  notOriginal ||
                  unremoved.length !== $scope.originalSelectedAttachments.length
              );
          };

          ctrl.getAttachmentName = function (attachment) {
              switch (attachment.ClaimAttachmentType) {
                  case $scope.ClaimAttachmentTypes.PerioExam:
                      return (
                          moment(moment.utc(attachment.ExamDate).toDate()).format(
                              'MM-DD-YYYY h-mm a'
                          ) + '.png'
                      );
                  case $scope.ClaimAttachmentTypes.ApteryxImage:
                  case $scope.ClaimAttachmentTypes.BlueImage:
                      return attachment.Name + '.jpg';
                  case $scope.ClaimAttachmentTypes.SidexisImage:
                      return attachment.OriginalImageFilename + '.jpg';
                  case $scope.ClaimAttachmentTypes.UnallocatedDocument:
                      return attachment.OriginalImageFilename + '.txt';
                  case $scope.ClaimAttachmentTypes.DocumentManager:
                      return attachment.Name;
              }
              return attachment.Name;
          };

          ctrl.getAttachment = function (file) {
              var params = {
                  locationId: $scope.claim.LocationId,
                  claimCommonId: $scope.claim.ClaimCommonId,
                  attachmentFileId: file.EAttachmentFileId,
              };
              file.gettingData = true;
              patientServices.Claim.GetAttachedFileForClaim(
                  params,
                  function (res) {
                      file.data = $sce.trustAsResourceUrl(
                          ctrl.getEncodingHeader(file) + res.Result.attachmentFile
                      );
                      file.gettingData = false;
                  },
                  function () {
                      toastrFactory.error(
                          localize.getLocalizedString('Could not find attachment'),
                          localize.getLocalizedString('Error')
                      );
                      file.gettingData = false;
                  }
              );
          };


          ctrl.getEncodingHeader = function (file) {
              if (_.toLower(file.ext) == '.pdf' && _.toLower(file.ClearinghouseVendor) == 'dentalxchange') {
                  return 'data:image/jpeg;base64,';
              }

              switch (_.toLower(file.ext)) {
                  case '.jpeg':
                  case '.jpg':
                      return 'data:image/jpeg;base64,';
                  case '.gif':
                      return 'data:image/gif;base64,';
                  case '.png':
                      return 'data:image/png;base64,';
                  case '.bmp':
                      return 'data:image/bmp;base64,';
                  case '.svg':
                      return 'data:image/svg+xml;base64,';
                  case '.pdf':
                      return 'data:application/pdf;base64,';
                  default:
                      return '';
              }
          };

          //Get Document Manager File Content for preview
          ctrl.getFile = function (file) {
              file.gettingData = true;
              var filegetUri =
                  '_fileapiurl_/api/files/content/' + file.FileAllocationId;
              var config = {
                  headers: { Accept: 'application/octet-stream' },
                  responseType: 'arraybuffer',
              };
              ctrl.createDirectoryPromise.then(
                  function () {
                      $http
                          .get(filegetUri, config)
                          .then(function (res) {
                              var octetStreamMime = 'application/octet-stream';
                              var filename = file.Name;
                              var contentType =
                                  res.headers('Content-Type') || octetStreamMime;
                              // Get the blob url creator
                              var urlCreator =
                                  $window.URL ||
                                  $window.webkitURL ||
                                  $window.mozURL ||
                                  $window.msURL;
                              if (urlCreator) {
                                  var blob = new Blob([res.data], { type: contentType });
                                  if ($window.navigator.msSaveOrOpenBlob) {
                                      $window.navigator.msSaveOrOpenBlob(blob, filename);
                                  } else {
                                      var url = urlCreator.createObjectURL(blob);
                                      var fileData = $sce.trustAsResourceUrl(url);
                                      file.data = fileData;
                                  }
                              }
                              file.gettingData = false;
                          })
                          .catch(function () {
                              file.gettingData = false;
                          });
                  },
                  function () {
                      file.gettingData = false;
                  }
              );
          };

          ctrl.getTextFile = function (file) {
              file.gettingData = true;
              var filegetUri =
                  '_fileapiurl_/api/files/content/' + file.FileAllocationId;
              var config = {
                  headers: { Accept: 'text/plain' },
                  responseType: 'text',
              };
              ctrl.createDirectoryPromise.then(
                  function () {
                      $http
                          .get(filegetUri, config)
                          .then(function (res) {
                              file.data = res.data;
                              file.gettingData = false;
                          })
                          .catch(function () {
                              toastrFactory.error(
                                  localize.getLocalizedString('Failed to get file.'),
                                  localize.getLocalizedString('Error')
                              );
                              file.gettingData = false;
                          });
                  },
                  function () {
                      file.gettingData = false;
                  }
              );
          };

          //Get Perio Data for preview - next four methods
          ctrl.getPerio = function (file) {
              if (!$scope.currentDocument.data) {
                  $scope.currentDocument.gettingData = true;
                  $scope.authAccess = patientOdontogramFactory.access();
                  if ($scope.authAccess.View) {
                      ctrl.loadExam();
                  }
              } else {
                  $scope.currentDocument = null;
                  //use a timeout to force the ng-include to disappear and repopulate the chart view
                  $timeout(function () {
                      $scope.currentDocument = file;
                      //reset types and notes if not viewing an image currently in the list of attachments
                      if (
                          !$filter('isInList')(
                              $scope.currentDocument,
                              $scope.selectedAttachments
                          )
                      ) {
                          $scope.currentDocument.attachmentType =
                              $scope.currentDocument.ClaimAttachmentType ===
                                  $scope.ClaimAttachmentTypes.PerioExam
                                  ? 'PeriodontalCharts'
                                  : 'OtherAttachments';
                          $scope.currentDocument.attachmentOrientation = '0';
                          $scope.currentDocument.attachmentNotes = '';
                      }
                  });
              }
          };

          ctrl.loadExam = function () {
              patientPerioExamFactory
                  .getById($scope.claim.PatientId, $scope.currentDocument.ExamId)
                  .then(function (res) {
                      var exam = res.Value;
                      patientPerioExamFactory.SetActivePerioExam(null);
                      var perioExam = patientPerioExamFactory.process(exam);
                      patientPerioExamFactory.SetActivePerioExam(perioExam);
                      var activePerioExam = patientPerioExamFactory.ActivePerioExam;
                      ctrl.calcAttachmentLvl(activePerioExam);
                      patientPerioExamFactory.setDataChanged(false);
                      patientPerioExamFactory.setExamState(examState.ViewMode);
                      $scope.currentDocument.url =
                          'App/Patient/patient-chart/perio/perio-chart-print/perio-chart-print.html?updated=' +
                          Date.now();
                      $scope.currentDocument.data = perioExam;
                      $scope.currentDocument.gettingData = false;
                  });
          };

          ctrl.calcAttachmentLvl = function (activePerioExam) {
              angular.forEach(activePerioExam.ExamDetails, function (toothExam) {
                  if (!toothExam.AttachmentLvl) {
                      toothExam.AttachmentLvl = [];
                  }
                  if (toothExam.ToothId != null) {
                      for (var i = 0; i < 6; i++) {
                          // if both values are null so is the AttachmentLvl
                          if (
                              toothExam.GingivalMarginPocket[i] === null &&
                              toothExam.DepthPocket[i] === null
                          ) {
                              toothExam.AttachmentLvl[i] = null;
                          } else {
                              var gm =
                                  toothExam.GingivalMarginPocket[i] === null
                                      ? 0
                                      : parseInt(toothExam.GingivalMarginPocket[i], 10);
                              var dp =
                                  toothExam.DepthPocket[i] === null
                                      ? 0
                                      : parseInt(toothExam.DepthPocket[i], 10);
                              var attachment = dp + gm;
                              toothExam.AttachmentLvl[i] = attachment;
                          }
                      }
                  }
              });
          };

          //#region valid extensions for attachments

          ctrl.invalidTypeText = localize.getLocalizedString(' (Invalid Type)');

          // set $$ValidAttachmentTypeForClaims on each file and append Invalid Type to text on attachments
          // where $$ValidAttachmentTypeForClaims is false
          ctrl.setValidAttachmentTypeForClaims = function (files) {
              _.forEach(files, function (file) {
                  file.$$AppendText = '';
                  file.$$ValidAttachmentTypeForClaims = ctrl.validAttachmentTypeForClaims(
                      file.ext, file.ClaimAttachmentType
                  );
                  if (file.$$ValidAttachmentTypeForClaims === false) {
                      file.$$AppendText = ctrl.invalidTypeText;
                  }
              });
          };

          // returns true if passed in extension is valid for claims
          ctrl.validAttachmentTypeForClaims = function (fileExt, claimAttachmentType) {

              //For Claim Notes, SAPI will convert the TXT to PDF during submission
              if ((claimAttachmentType == $scope.ClaimAttachmentTypes.UnallocatedDocument || claimAttachmentType == $scope.ClaimAttachmentTypes.DocumentManager)
                  && fileExt.toLowerCase() == '.txt' && $scope.currentVendor == $scope.vendorEnum.DentalXChange) {
                  return true;
              }
              var isValidExtension = false;
              if (fileExt) {
                  var foundInList = _.find(
                      ctrl.validExtensionsForClaims,
                      function (ext) {
                          return ext.toLowerCase() === fileExt.toLowerCase();
                      }
                  );
                  isValidExtension = foundInList ? true : false;
              }
              return isValidExtension;
          };

          //#endregion

          //#region uploading docs

          $scope.launchDocumentUpload = function () {
              ctrl.openDocUploader();
              $routeParams.patientId = $scope.claim.PatientId;
          };

          $scope.onUpLoadSuccess = function (doc) {
              if (doc) {
                  ctrl.insertUploadedDocument(doc);
                  // if valid either attach or select, else show message
                  if (doc.$$ValidAttachmentTypeForClaims) {
                      $scope.setCurrentDocument(doc);
                  } else {
                      $scope.showUploadInvalidTypeMessage = true;
                  }
              }
              $scope.docCtrls.close();
          };

          $scope.onUpLoadCancel = function () {
              $scope.docCtrls.close();
          };

          ctrl.openDocUploader = function () {
              $scope.docCtrls.content(
                  '<doc-uploader [patient-id]="claim.PatientId" (upload-cancel)="onUpLoadCancel($event)" (upload-success)="onUpLoadSuccess($event)"><doc-uploader>'
              );
              $scope.docCtrls.setOptions({
                  resizable: false,
                  position: {
                      top: '10%',
                      left: '35%',
                  },
                  minWidth: 300,
                  scrollable: false,
                  iframe: false,
                  actions: ['Close'],
                  title: localize.getLocalizedString('Upload a document'),
                  modal: true,
              });
              $scope.docCtrls.open();
          };

          ctrl.insertUploadedDocument = function (newDoc) {
              ctrl.processDocuments([newDoc]);
              ctrl.setValidAttachmentTypeForClaims([newDoc]);
              var docGroups = $scope.documentGroupsList[0].Children;
              var found = false;
              _.each(docGroups, group => {
                  if (
                      group.DocumentGroupId &&
                      group.DocumentGroupId === newDoc.DocumentGroupId
                  ) {
                      group.files.push(newDoc);
                      group.open = true;
                      found = true;
                      return false;
                  } else if (group.Children && group.Children.length > 0) {
                      _.each(group.Children, subGroup => {
                          if (subGroup.DocumentGroupId === newDoc.DocumentGroupId) {
                              subGroup.files.push(newDoc);
                              group.open = true;
                              subGroup.open = true;
                              found = true;
                              return false;
                          }
                      });
                      if (found) return false;
                  }
              });
              if (found) {
                  $scope.documentGroupsList[0].open = true;
              }
          };

          //#endregion

          //#region Clinical Notes

          ctrl.buildNoteText = function (note) {
              note.gettingData = true;
              // recreate not title area
              if (note && note.NoteTypeId === 5) {
                  note.$$DisplayNameAndDesignation = localize.getLocalizedString(
                      'System generated'
                  );
              } else {
                  note.$$DisplayNameAndDesignation = note.CreatedByName
                      ? note.CreatedByProfessionalDesignation
                          ? note.CreatedByName +
                          ', ' +
                          note.CreatedByProfessionalDesignation
                          : note.CreatedByName
                      : '';
              }
              let noteText = '';
              let createdDate = moment.utc(note.CreatedDate).toDate();

              // add header information to note
              let noteDate = $filter('toShortDisplayDate')(createdDate);
              noteText = note.NoteTitle + ' - ' + noteDate;
              noteText = noteText.concat('\r\n\r\n');

              // last note action
              let lastNoteAction = 'last update by ';
              if (note.StatusTypeId === 3) {
                  lastNoteAction = 'deleted by ';
              } else if (note.NoteTypeId === 5) {
                  lastNoteAction = '';
              }

              // format subtitle and date information
              noteText = noteText.concat(lastNoteAction);
              noteText = noteText.concat(note.$$DisplayNameAndDesignation);
              noteText = noteText.concat(' on ');
              let dateFormatted = $filter('toDisplayDate')(createdDate);
              let timeFormatted = $filter('date')(createdDate, 'h:mm a');
              noteText = noteText.concat(dateFormatted);
              noteText = noteText.concat(' at ');
              noteText = noteText.concat(timeFormatted);
              noteText = noteText.concat('\r\n\r\n');

              // format tooth numbers and add to note header
              let formattedToothNumbers = '';
              _.forEach(note.ToothNumbers, function (tooth) {
                  formattedToothNumbers += tooth + ', ';
              });
              if (formattedToothNumbers.length > 1) {
                  formattedToothNumbers = formattedToothNumbers.substring(
                      0,
                      formattedToothNumbers.length - 2
                  );
                  noteText = noteText.concat('Teeth: ');
                  noteText = noteText.concat(formattedToothNumbers);
                  noteText = noteText.concat('\r\n\r\n');
              }

              // format note text
              let value = note.Note;
              // replace paragraphs with newlines
              let plainText = value.replace(/(<\/p>)/g, '\n');
              // replace fixed space
              let plainText1 = plainText.replace(/&nbsp;/g, ' ');
              // remove markup
              let finalText = plainText1.replace(/<[^>]*>/g, '');
              // add to note title
              noteText = noteText.concat(finalText);
              note.UnallocatedDocumentAttachment = noteText;
              note.gettingData = false;
          };

          // add notes to document group
          ctrl.addNotesToDocumentGroup = function (clinicalNotes) {
              _.forEach(clinicalNotes, function (note) {
                  note.data = {};
                  note.UniqueListId = 'Note_' + note.NoteId;
                  note.OriginalImageFilename = note.NoteTitle;
                  note.Name =
                      note.NoteTitle +
                      ' ' +
                      moment(moment.utc(note.CreatedDate).toDate()).format(
                          'MM/DD/YYYY h:mm a'
                      );
                  note.ClaimAttachmentType =
                      $scope.ClaimAttachmentTypes.UnallocatedDocument;
                  note.ext = '.txt';
                  note.$$ValidAttachmentTypeForClaims = true;
                  note.UnallocatedDocumentId = 'ClinicalNote_' + note.NoteId;
                  note.$$AppendText = '';
              });
              $scope.documentGroupsList[4].files = _.sortBy(
                  clinicalNotes,
                  'CreatedDate'
              ).reverse();
          };

          // filter notes to only show current version (no history) and notes that have not been deleted and are finalized
          ctrl.filterCurrentNotes = function (clinicalNotes) {
              var notes = [];
              let finalizedNotes = _.filter(clinicalNotes, function (note) {
                  return note.StatusTypeId !== 3 && note.AutomaticLockTime === null;
              });
              // group by NoteId
              var noteGroups = _.groupBy(finalizedNotes, 'NoteId');
              // capture most recent
              _.forEach(noteGroups, function (group) {
                  notes.push(group[0]);
              });
              // sort by CreatedDate
              let sortedNotes = _.sortBy(notes, 'CreatedDate').reverse();
              return sortedNotes;
          };

          ctrl.getClinicalNotes = function () {
              patientNotesService.getClinicalNotes($scope.claim.PatientId).then(
                  res => {
                      $scope.clinicalNotes = res.Value;
                      let currentNotes = ctrl.filterCurrentNotes(res.Value);
                      ctrl.addNotesToDocumentGroup(currentNotes);
                  },
                  () => {
                      // handled by service
                  }
              );
          };

          //#endregion

          //#region narrative

          // if an attachment type of Narrative is selected and the $scope.currentDocument is null,
          // create a document that will allow us to perist just the narrative note
          // if another document is selected it will overwrite this  $scope.currentDocument
          $scope.attachmentTypeSelected = function (e) {
              ctrl.attachmentTypeSelected = e;
              if ($scope.currentDocument === null) {
                  let narrativeAttachmentType = $scope.attachmentDocumentTypesList.find(
                      x => x.attachmentDocumentType === 'Narrative'
                  );
                  if (e === narrativeAttachmentType.attachmentDocumentType) {
                      $scope.currentDocument = {
                          attachmentType: e,
                      };
                  }
              } else {
                  $scope.currentDocument.attachmentType = e;

                  // clear orientation if not needed for the selected attachment type
                  if ( !$filter('needsOrientation')(e, $scope.attachmentDocumentTypesList)) {
                      $scope.currentDocument.attachmentOrientation = null;
                      ctrl.orientationSelected = null;
                  }
              }
          };

          ctrl.setNarrativeProperties = function (document) {
              let formattedDateTime = moment(moment.utc(new Date()).toDate()).format(
                  'MM/DD/YYYY h:mm a'
              );
              let uniqueId = moment.utc().valueOf();
              (document.UnallocatedDocumentId = 'Narrative_' + uniqueId),
                  (document.$$IsNarrative = true);
              document.data = {};
              document.UniqueListId = 'Narrative_' + uniqueId;
              document.Name = 'Narrative ' + formattedDateTime;
              document.OriginalImageFilename = 'Narrative ' + formattedDateTime;
              document.UnallocatedDocumentAttachment = document.attachmentNotes;
              document.ext = '.txt';
              document.$$IsNarrative = true;
              document.$$ValidAttachmentTypeForClaims = true;
              document.$$AppendText = '';
              document.ClaimAttachmentType =
                  $scope.ClaimAttachmentTypes.UnallocatedDocument;
              // since we are bypassing the setCurrentDocument method we need to set this here
              $scope.selectedAttachments.push(document);
          };

          // determines type of UnallocatedDocument
          ctrl.determineTypeOfUnallocatedDocument = function (document) {
              document.$$IsNarrative = false;
              document.$$IsClinicalNote = false;
              // if file ClaimAttachmentType is UnallocatedDocument transfer note Properties to existing file)))
              if (
                  document.ClaimAttachmentType ===
                  $scope.ClaimAttachmentTypes.UnallocatedDocument &&
                  document.UnallocatedDocumentId !== null &&
                  document.UnallocatedDocumentId.substring(
                      0,
                      document.UnallocatedDocumentId.indexOf('_')
                  ) === 'ClinicalNote'
              ) {
                  document.$$IsClinicalNote = true;
              }

              if (
                  document.ClaimAttachmentType ===
                  $scope.ClaimAttachmentTypes.UnallocatedDocument &&
                  document.UnallocatedDocumentId !== null &&
                  document.UnallocatedDocumentId.substring(
                      0,
                      document.UnallocatedDocumentId.indexOf('_')
                  ) === 'Narrative'
              ) {
                  document.$$IsNarrative = true;
              }
          };

          //#endregion

          //#region DentalXChange AttachmentDocumentTypes      

          ctrl.getAttachmentDocumentTypes = () => {
              return new Promise((resolve, reject) => {
                  const requestArgs = {
                      locationId : $scope.claim.LocationId,
                      vendor : 'DentalXChange'
                  }
                  claimAttachmentHttpService.getAttachmentTypes(requestArgs)
                      .subscribe(res => {
                          let attachmentDocumentTypes = res.Result;
                          $scope.attachmentDocumentTypesList = attachmentDocumentTypes.documentTypes;;
                          ctrl.validExtensionsForClaims = attachmentDocumentTypes.validFileExtensions;
                          resolve(attachmentDocumentTypes);
                      }, (err) => {
                          this.toastrFactory.error(this.translate.instant('Failed to get document attachment types. '),
                              this.translate.instant('Server Error'));
                          reject({});
                      });
              })
          }



          ctrl.openInProgessModal = function () {
              ctrl.inprogressModalInstance = modalFactory
                  .Modal({
                      templateUrl:
                          'App/BusinessCenter/insurance/claims/claims-management/file-sending-inprogress-modal/file-sending-inprogress-modal.html',
                      backdrop: 'static',
                      keyboard: false,
                      size: 'md',
                      windowClass: 'warning-modal-center',
                      controller: 'FileSendingInProgressModalController',
                      amfa: 'soar-ins-iclaim-edit',
                      resolve: {
                      },
                  });
          };

          $scope.attachmentOrientationSelected  = function (e) {
              ctrl.orientationSelected = e;
              if ($scope.currentDocument !== null) {
                  $scope.currentDocument.attachmentOrientation = e;
              }
          }

          //#engregion

          ctrl.init();
          $scope.vendorEnum = ctrl.clearinghouseVendors();

          //Set vendor as DentalXChange atleast for now
          $scope.currentVendor = $scope.vendorEnum.DentalXChange;
      },
  ])
    .filter('isInList', function () {
        return function (file, list) {
            return _.find(list, function (doc) {
                return doc.UniqueListId === file.UniqueListId;
            });
        };
    })
    .filter('needsOrientation', function () {
        return function (attachmentType,attachmentDocumentTypesList ) {
            if (attachmentType && attachmentDocumentTypesList) {
                const found = attachmentDocumentTypesList.find(x => x.attachmentDocumentType === attachmentType);
                return found ? found.orientationRequired : false;
            }
            return false;
        };
    })
    .filter('canPreview', function () {
        return function (extension, extensionList) {
            return extensionList.indexOf(_.toLower(extension)) !== -1;
        };
    });
