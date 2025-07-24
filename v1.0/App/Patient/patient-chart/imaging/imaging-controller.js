'use strict';

angular.module('Soar.Patient').controller('PatientImagingController', [
  '$scope',
  '$sce',
  '$timeout',
  'patSecurityService',
  'tabLauncher',
  'toastrFactory',
  'localize',
  'PatientImagingExamFactory',
  'LocationServices',
  '$q',
  'ImagingMasterService',
  'ImagingProviders',
  '$window',
  'ModalFactory',
  'IndexedDbCacheService',
  '$routeParams',
  function (
    $scope,
    $sce,
    $timeout,
    patSecurityService,
    tabLauncher,
    toastr,
    localize,
    patientImagingExamFactory,
    locationServices,
    $q,
    imagingMasterService,
    imagingProviders,
    $window,
    modalFactory,
    indexedDbCacheService,
    $routeParams,
  ) {
    var ctrl = this;
    ctrl.modalInstance = null;
    ctrl.imagingPatient = {};
    ctrl.permissionsFlag = false;
    ctrl.selectedPatientId = '';    

    // does this user have permission to view images
    ctrl.checkUserAuthorization = function () {
      var defer = $q.defer();
      var amfa = 'soar-clin-cimgs-view';
      if (patSecurityService.IsAuthorizedByAbbreviationAtPractice(amfa)) {
        defer.resolve(true);
      } else {
        // return call for permissions
        locationServices.get().$promise.then(function (res) {
          if (res && res.Value) {
            var hasAccess = true;
            res.Value.forEach(function (location) {
              if (hasAccess) {
                hasAccess = patSecurityService.IsAuthorizedByAbbreviationAtLocation(
                  amfa,
                  location.LocationId
                );
              }
            });
            defer.resolve(hasAccess);
          }
        });
      }
      return defer.promise;
    };

    ctrl.blueEventListener = function (msg) {
      let split = msg.data.split(':');
      if (split[0] === 'captureRedirect') {
        $scope.blueCapture(split[1]);
      } else if (split[0] === 'imagingRedirect') {
        $scope.refreshImagingData();
      } else if (split[0] === 'showPatientLookup') {
        $scope.transferBluePatient();
      }
    };

    $scope.$on('$destroy', function () {
      $window.removeEventListener('message', ctrl.blueEventListener, true);
      //var frame = document.getElementById('imagingFrame');
      //frame.src = "";
      //frame.parentNode.removeChild(frame);
      ctrl.modalInstance = null;
    });

    ctrl.$onInit = function () {
      $scope.iframeHeight = '642px';
      $scope.calculateIframeHeight();
      $scope.loading = true;
      $scope.imagingPatientNotFound = false;
      $scope.showCaptureButton = false;
      $scope.imagingProvider =
      $scope.imagingProvider || imagingProviders.Apteryx2;
      $scope.launchBlueCapture = $routeParams.launchCapture;
      ctrl.checkUserAuthorization().then(function (res) {
        ctrl.permissionsFlag = res;
        ctrl.imagingService = null;
        $scope.loadingMessage = localize.getLocalizedString('Loading images.');
        imagingMasterService.getReadyServices().then(res => {
          if (
            $scope.imagingProvider === imagingProviders.Blue &&
            res.blue &&
            res.blue.status === 'ready'
          ) {
            $scope.showCaptureButton = true;
            ctrl.imagingService = res.blue.service;
            ctrl.setFrameSource();
          } else if (
            $scope.imagingProvider === imagingProviders.Apteryx2 &&
            res.apteryx2 &&
            res.apteryx2.status === 'ready'
          ) {
            ctrl.imagingService = res.apteryx2.service;
            ctrl.setFrameSource();
          } else if (
            $scope.imagingProvider === imagingProviders.Apteryx &&
            res.apteryx &&
            res.apteryx.status === 'ready'
          ) {
            ctrl.imagingService = res.apteryx.service;
            ctrl.setFrameSource();
          }
          if (!_.isEmpty(ctrl.imagingService)) {
            $scope.loadingMessage = localize.getLocalizedString(
              'Loading images.'
            );
          } else {
            ctrl.getSiteNameFailure();
            //!!! It might make more sense to add a try finally clause to remove spinner if another error is returned.
            // No imaging service is active
            $scope.loadingMessage =
              'No Imaging Provider is Active for this Practice';
            $scope.loading = false;
          }
          if ($scope.personId) {
            indexedDbCacheService.remove(`PatientPhotoThumbnail:${$scope.personId}`);
          }
        });
      });
      if ($scope.imagingProvider === imagingProviders.Blue) {
        $window.addEventListener('message', ctrl.blueEventListener, true);
      }
    };

      $(window).resize(function () {          
          $scope.calculateIframeHeight();
      });

      $scope.calculateIframeHeight = function () {
          //AWM - Copilot generated from comments

          var iframe = document.getElementById('imagingFrame');
          //Get the height of the viewport
          var viewportHeight = $window.innerHeight;

          //Get the top Y coordinate of the iframe
          var iframeY = iframe.getBoundingClientRect().top;

          //Calculate the difference between the viewport height and the iframe Y coordinate
          var difference = viewportHeight - iframeY;          

          //If the difference is less than 642px, set the iframe height to 642px. Else, set the iframe height to the difference minus 10px
          if (difference < 642) {
                $scope.iframeHeight = '642px';
            } else {
                $scope.iframeHeight = (difference-10) + 'px';
          }                    

          //Assign iframe height to the iframe
          iframe.style.height = $scope.iframeHeight;
      }

    ctrl.setFrameSource = function () {
      if (!ctrl.imagingPatient.Id) {
        imagingMasterService
          .getPatientByFusePatientId(
            $scope.personId,
            $scope.personId,
            $scope.imagingProvider
          )
          .then(ctrl.getImagingPatientSuccess, ctrl.getImagingPatientFailure)
          .then(ctrl.setFrameSource_getUrlForExam);
      }
      else {
        ctrl.setFrameSource_getUrlForExam();
      }
    };

    ctrl.setFrameSource_getUrlForExam = function () {
      if (ctrl.imagingPatient.Id) {
        ctrl.fullscreenParams = {
          patient: $scope.personId,
          imagingProvider: $scope.imagingProvider,
        };
        var patientData = {
          lastName: $scope.patient.LastName,
          firstName: $scope.patient.FirstName,
          gender: $scope.patient.Sex,
          birthDate: $scope.patient.DateOfBirth,
          primLocation: $scope.patient.PreferredLocation
        };
        if (patientImagingExamFactory.SelectedExamId) {
          ctrl.fullscreenParams.exam = patientImagingExamFactory.SelectedExamId;
          imagingMasterService
            .getUrlForExamByPatientIdExamId(
              ctrl.imagingPatient.Id,
              $scope.imagingProvider,
              patientImagingExamFactory.SelectedExamId,
              patientData
            )
            .then(function (res) {
              if (res && res.result) {
                $scope.frameSource = $sce.trustAsResourceUrl(res.result); // Fusion TBD: use resourceUrlWhitelist
                patientImagingExamFactory.SelectedExamId = null;
                if ($scope.launchBlueCapture && $scope.loading) {
                  $scope.blueCapture()
                }
                $scope.$digest();
                $scope.loading = false;
              }
            });
        } else {
          imagingMasterService
            .getUrlForPatientByExternalPatientId(
              ctrl.imagingPatient.Id,
              $scope.personId,
              $scope.imagingProvider,
              patientData
            )
            .then(function (res) {
              if (res && res.result) {
                $scope.frameSource = $sce.trustAsResourceUrl(res.result); // Fusion TBD: use resourceUrlWhitelist
                if ($scope.launchBlueCapture && $scope.loading) {
                  $scope.blueCapture()
                }
                $scope.$digest();
                $scope.loading = false;
              }
            })
        }
      }
    };

    ctrl.loadImagingForNewPatient = function () {
      $scope.imagingPatientNotFound = false;

      // NOTE: When going live with this, need to handle this situation in the full screen view
      imagingMasterService
        .getUrlForNewPatient(
          {
            patientId: $scope.personId,
            lastName: encodeURIComponent($scope.patient.LastName),
            firstName: encodeURIComponent($scope.patient.FirstName),
            gender: $scope.patient.Sex,
            birthDate: $scope.patient.DateOfBirth,
            primLocation: $scope.patient.PreferredLocation
          },
          $scope.imagingProvider
        )
        .then(function (res) {
          if (res && res.result) {
            if ($scope.launchBlueCapture && $scope.loading) {
              $scope.blueCapture()
            }
            $scope.frameSource = $sce.trustAsResourceUrl(res.result);
            $scope.$digest();
            $scope.loading = false;
          }
        });
    };

    ctrl.getSiteNameFailure = function () {
      toastr.error('Failed to connect to imaging provider.', 'Error');
    };

    ctrl.getImagingPatientSuccess = function (results) {
      var providerResults = results ? results[$scope.imagingProvider] : null;
      if (!providerResults || !providerResults.success) {
        ctrl.getImagingPatientFailure();
        return;
      }

      var res = providerResults.result;

      // TODO: unwrap apteryx return data in apteryx services
      if (
        res &&
        ((res.data && res.data.Records && res.data.Records.length > 0) ||
          res.Value)
      ) {
        $scope.imagingPatientNotFound = false;
        ctrl.imagingPatient = res.data ? res.data.Records[0] : res.Value;
        return true;
      }

      // user has permissions at all locations
      if (
        ctrl.permissionsFlag === true ||
        $scope.imagingProvider === imagingProviders.Blue
      ) {
        ctrl.loadImagingForNewPatient();
        return;
      }
      // user doesn't have permissions at all locations
      $scope.imagingPatientNotFound = true;
      $scope.notFoundMessage = localize.getLocalizedString(
        'There are no saved images for {0}.',
        [{ skip: $scope.patient.FirstName + ' ' + $scope.patient.LastName }]
      );
      return false;
    };

    ctrl.getImagingPatientFailure = function () {
      toastr.error(
        'Failed to retrieve patient data from imaging server.',
        'Error'
      );
      $scope.loadingMessage = ''; // some better messasge?? ... what that might be is not something I need to handle in my story right now.
      $scope.loading = false;
      return false;
    };

    $scope.$watch(
      function () {
        return patientImagingExamFactory.SelectedExamId;
      },
      function (nv, ov) {
          if (nv && nv !== ov) {            
          $scope.frameSource = $sce.trustAsResourceUrl('about:blank');
          $timeout(function () {
              ctrl.setFrameSource();
              
          }, 1);
              
        }
      }
    );

    $scope.launchFullscreen = function () {
      // look at how treatment-plan-print is handled
      if (ctrl.fullscreenParams && ctrl.fullscreenParams.patient) {
        var query = `?patient=${ctrl.fullscreenParams.patient}&imagingProvider=${ctrl.fullscreenParams.imagingProvider}`;
        if (ctrl.fullscreenParams.exam) {
          query = `${query}&exam=${ctrl.fullscreenParams.exam}`;
        }
        let patientPath = '#/Patient/';
        tabLauncher.launchNewTab(
          `${patientPath}${$scope.personId}/Imaging/FullScreen${query}`
        );
      }
    };

    $scope.launchCapture = function () {
      ctrl.imagingService.captureImage(
        {
          patientId: $scope.personId,
          lastName: encodeURIComponent($scope.patient.LastName),
          firstName: encodeURIComponent($scope.patient.FirstName),
          gender: $scope.patient.Sex,
          birthDate: $scope.patient.DateOfBirth,
          primLocation: $scope.patient.PreferredLocation
        },
        true,
        true
      );
    };

    $scope.refreshImagingData = function () {
      $scope.frameSource = $sce.trustAsResourceUrl('about:blank');
      $timeout(function () {
        ctrl.setFrameSource();
      });
      patientImagingExamFactory.notifyRefresh();
    };

    $scope.refreshNewPatient = function () {
      ctrl.setFrameSource();
      patientImagingExamFactory.notifyRefresh();
    };

    $scope.$watch('imagingProvider', ctrl.$onInit);

    $scope.blueCapture = function (studyId) {
      if ($scope.imagingProvider !== imagingProviders.Blue) return;
      if ($scope.personId) {
        indexedDbCacheService.remove(`PatientPhotoThumbnail:${$scope.personId}`);
      }

      imagingMasterService
        .getUrlForNewPatient(
          {
            patientId: $scope.personId,            
            lastName: $scope.patient.LastName,
            firstName: $scope.patient.FirstName,
            gender: $scope.patient.Sex,
            birthDate: $scope.patient.DateOfBirth,
            primLocation: $scope.patient.PreferredLocation
          },
          $scope.imagingProvider
        )
        .then(function (res) {
          if (res && res.result) {
            let url = res.result;
            if (studyId && studyId != '') {
              url = `${url}&initTpId=${studyId}`;
            }
            $scope.frameSource = $sce.trustAsResourceUrl(url);
            $scope.$digest();
          }
        });
    };

    $scope.transferBluePatient = function () {
      if (ctrl.modalInstance === null) {
        ctrl.modalInstance = modalFactory.Modal({
          windowTemplateUrl: 'uib/template/modal/window.html',
          templateUrl:
            'App/Patient/patient-chart/imaging/patient-lookup/patient-lookup.html',
          controller: 'PatientLookupController',
          amfa: 'soar-clin-cplan-view',
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          windowClass: 'center-modal',
        });
        ctrl.modalInstance.result.then(result => {
          if (!_.isNil(result)) {
            let apiResponse = JSON.parse(
              JSON.stringify({ msg: 'targetPatIdSelected', patId: result })
            );
            let iwindow = document.getElementById('imagingFrame').contentWindow;

            iwindow.postMessage(apiResponse, '*');
          }
          ctrl.modalInstance = null;
        });
      }
    };
  },
]);
