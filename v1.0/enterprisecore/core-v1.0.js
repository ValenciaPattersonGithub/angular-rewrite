(function () {
  'use strict';
  var app = angular
    .module('PatWebCoreV1', ['PatWebCore', 'PatCoreUtility', 'ngIdle'])
    .constant('moment', moment);

  app.config([
    'IdleProvider',
    'INACTIVITY_TIMEOUT',
    'INACTIVITY_AUTO_TIMEOUT',
    'DISPLAY_AS',
    function (
      idleProvider,
      inactivityTimeout,
      inactivityAutoTimeout,
      windowTitle
    ) {
      idleProvider.idle(Number(inactivityTimeout)); // in seconds
      idleProvider.timeout(Number(inactivityAutoTimeout)); // in seconds
      window.document.Title = windowTitle;
    },
  ]);
  app.run([
    '$rootScope',
    'instanceIdentifier',
    '$uibModal',
    'manageSession',
    'patSecurityService',
    'practiceService',
    'platformSessionService',
    'ENTERPRISE_URL',
    'UserServices',
    'TimeZoneFactory',
    'EnterpriseSettingService',
    'FeatureService',
    '$q',
    'ultWarningService',
    'SoarConfig',
    function (
      $rootScope,
      instanceIdentifier,
      $uibModal,
      manageSession,
      patSecurityService,
      practiceService,
      platformSessionService,
      ENTERPRISE_URL,
      userServices,
      timeZoneFactory,
      enterpriseSettingService,
      featureService,
      $q,
      ultWarningService,
      soarConfig
    ) {
      manageSession.startIdle();
      // get user values for WalkMe
      var user = patSecurityService.getUser();
      if (!_.isNil(user)) {
        if (!_.isNil(user.UserName)) {
          window.username = user.UserName;
        }
        if (!_.isNil(user.UserId)) {
          window.userId = user.UserId;
        }
      }

      var timezoneOffsets = [
        { value: 'Alaskan Standard Time', offset: -9 },
        { value: 'Central Standard Time', offset: -6 },
        { value: 'Eastern Standard Time', offset: -5 },
        { value: 'Aleutian Standard Time', offset: -10 },
        { value: 'Hawaiian Standard Time', offset: -10 },
        { value: 'Mountain Standard Time', offset: -7 },
        { value: 'US Mountain Standard Time', offset: -7 },
        { value: 'Pacific Standard Time', offset: -8 },
      ];

      $rootScope.$on('patCore:initpractice', function () {
        var practice = practiceService.getCurrentPractice();
        if (practice) {
          window.practiceId = practice.id;
        }

        var convertFromUTCToTimezone = function (hour, ultTz) {
          var timezoneOffset = 0;
          var timezone = timezoneOffsets.find(tz => {
            return tz.value == ultTz;
          });

          if (timezone) {
            timezoneOffset = timezone.offset;
          }

          var returnHour = hour + timezoneOffset;
          if (returnHour < 0) {
            returnHour = returnHour + 24;
          } else if (returnHour > 23) {
            returnHour = returnHour - 24;
          }

          return returnHour;
        };

        var validateULT = function () {
          var practice = practiceService.getCurrentPractice();
          if (practice) {
            var day = moment().day();
            var practiceId = platformSessionService.getSessionStorage(
              'userPractice'
            ).id;
            var user = platformSessionService.getSessionStorage('userContext')
              .Result.User;

            userServices.UserLoginTimes.get({
              practiceId: practiceId,
              userId: user.UserId,
              day: day,
            }).$promise.then(
              function (res) {
                var ult = res.Result;
                var localTimeForUltTimezone = timeZoneFactory.ConvertDateToMomentTZ(
                  moment(),
                  ult.Timezone
                );

                //Convert the hours and minutes all to minutes
                var startHour = convertFromUTCToTimezone(
                  ult.StartTime24HourMilitaryTimeHour,
                  ult.Timezone
                );
                var endHour = convertFromUTCToTimezone(
                  ult.EndTime24HourMilitaryTimeHour,
                  ult.Timezone
                );

                var checkTime =
                  localTimeForUltTimezone.hour() * 60 +
                  localTimeForUltTimezone.minutes();
                var startTime =
                  startHour * 60 + ult.StartTime24HourMilitaryTimeMinute;
                var endTime =
                  endHour * 60 + ult.EndTime24HourMilitaryTimeMinute;

                if (!(checkTime < startTime || checkTime > endTime)) {
                  //Set the localstorage value for ULT end time
                  ultWarningService.setUltEndTime(endTime, ult.Timezone);
                  ultWarningService.startUltTimers();
                }
              },
              function () {
                //If the call fails, let the user into Fuse
              }
            );
          }
        };

        //If the ultEndTime is set that means we've already verified
        var ultEndTimeForWarning = localStorage.getItem('ultEndTime');
        if (ultEndTimeForWarning) {
          ultWarningService.startUltTimers();
        }

        var verifyLoginTime = localStorage.getItem('cachedULTVersion');
        if (verifyLoginTime !== 'true') {
          localStorage.setItem('cachedULTVersion', 'true');
          if (practice) {
            var enableUltPhase2 = soarConfig.enableUlt;

            if (enableUltPhase2 === 'true') {
              enterpriseSettingService.Enterprise.get({
                practiceId: practice.id,
              }).$promise.then(
                function (enterprise) {
                  if (enterprise) {
                    enterpriseSettingService
                      .EnterpriseSettings(enterprise.id)
                      .getById({
                        enterpriseId: enterprise.id,
                        enterpriseSettingName:
                          'PracticeLevelRestrictedUserTimes',
                      })
                      .$promise.then(
                        function (enterpriseSetting) {
                          if (
                            enterpriseSetting &&
                            enterpriseSetting.settingValue === 'true'
                          ) {
                            validateULT();
                          }
                        },
                        function () {
                          //If the call fails, let the user into Fuse
                        }
                      );
                  }
                },
                function () {
                  //If the call fails, let the user into Fuse
                }
              );
            }
          }
        }
      });

      $rootScope.$on('patwebcore:idleTimeout', function ($scope) {
        var modalHtml =
          '<div class="modal-content"><div class="modal-header"><h4 class="modal-title">Session Inactivity</h4></div><div class="modal-body"><p><div idle-countdown="countdown"  class="modal-body">You will be automatically logged out in <b>{{countdown| secondsToMinutesSeconds|date:"m:ss"}}</b> minute(s) due to inactivity.To remain logged in move your mouse over this window.</div></div><div class="modal-footer"></div></div>';
        $rootScope.warning = $uibModal.open({
          template: modalHtml,
          animation: true,
          controller: 'manageSessionModalController',
          windowClass: 'modal-loading',
          backdrop: 'static',
          keyboard: false,
          scope: $rootScope,
        });
      });
    },
  ]);

  app.filter('secondsToMinutesSeconds', [
    function () {
      return function (seconds) {
        return new Date(1970, 0, 1).setSeconds(seconds);
      };
    },
  ]);
})();
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('appHeaderInterceptor', [
    'applicationService',
    function (applicationService) {
      return {
        request: function ($config) {
          if ($config.noPatHeaders === true) {
            return $config;
          }
          var appId = applicationService.getApplicationId();
          $config.headers['PAT-Application-ID'] = appId;
          $config.headers['ApplicationId'] = appId;
          return $config;
        },
      };
    },
  ]);

  app.config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('appHeaderInterceptor');
    },
  ]);
})();
(function () {
  'use strict';
  var app = angular.module('PatWebCoreV1');
  app.factory('directoryModel', function () {
    function directoryModel(
      dirId,
      name,
      parentId,
      accessLevel,
      accessLevelParentIds
    ) {
      this.DirectoryAllocationId = dirId;
      this.Name = name;
      this.DirectoryState = 0;
      this.ParentDirectoryAllocationId = parentId;
      (this.AccessLevel = accessLevel),
        (this.AccessLevelParentIds = accessLevelParentIds);
    }
    directoryModel.build = function (
      dirId,
      name,
      parentId,
      accessLevel,
      accessLevelParentIds
    ) {
      return new directoryModel(
        dirId,
        name,
        parentId,
        accessLevel,
        accessLevelParentIds
      );
    };
    return directoryModel;
  });
})();

(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('directoryService', [
    '$http',
    'FILE_API_URL',
    'directoryModel',
    function ($http, FILE_API_URL, directoryModel) {
      var directoriesUri = FILE_API_URL + '/api/directories';

      function createDirectory(newDir) {
        return $http.post(directoriesUri, newDir);
      }

      function getRootDirectories() {
        var uri = directoriesUri + '/rootdirs';
        return $http.get(uri);
      }

      function getFiles(directoryId) {
        var uri = directoriesUri + '/' + directoryId + '/files';
        return $http.get(uri);
      }

      return {
        createDirectory: createDirectory,
        getRootDirectories: getRootDirectories,
        getFiles: getFiles,
      };
    },
  ]);
})();
(function () {
  'use strict';
  var app = angular.module('PatWebCoreV1');
  app.factory('fileModel', function () {
    function fileModel(fileId, dirId, fileState, fileName, mimeType) {
      this.FileAllocationId = fileId;
      this.DirectoryAllocationId = dirId;
      this.FileState = fileState;
      this.Version = 1;
      this.Filename = fileName;
      this.MimeType = mimeType;
    }
    fileModel.build = function (fileId, dirId, fileState, fileName, mimeType) {
      return new fileModel(fileId, dirId, fileState, fileName, mimeType);
    };
    return fileModel;
  });
})();
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('fileService', [
    '$rootScope',
    '$http',
    'FILE_API_URL',
    'fileModel',
    'directoryModel',
    function ($rootScope, $http, FILE_API_URL, fileModel, directoryModel) {
      var filesUri = FILE_API_URL + '/api/files';

      function allocateFile(item) {
        return $http.post(filesUri, item);
      }

      function uploadFile(allocationId, fileContent) {
        var uri = filesUri + '/' + allocationId;
        var formData = new FormData();
        formData.append('text', fileContent);
        return $http.post(uri, formData, {
          transformRequest: angular.identity,
          headers: { 'Content-Type': undefined },
        });
      }

      function downloadFile(allocationId) {
        var uri = filesUri + '/content/' + allocationId;
        return $http.get(uri);
      }

      function getMetadata(allocationId) {
        var uri = filesUri + '/' + allocationId;
        return $http.get(uri);
      }

      return {
        allocateFile: allocateFile,
        uploadFile: uploadFile,
        downloadFile: downloadFile,
        getMetadata: getMetadata,
      };
    },
  ]);
})();
(function () {
  'use strict';
  var app = angular.module('PatWebCoreV1');

  app.directive('imageUpload', function () {
    var template =
      '<div class="block image--upload">' +
      '<div>' +
      '<input type="text" readonly class="image-name" ng-model="vm.imageName" ng-click="vm.getImage($event)"/>' +
      '<input type="button" class="image-btn" value="Browse" ng-click="vm.getImage($event)"/>' +
      '<input type="button" class="image-btn" value="Clear" ng-click="vm.clearImage()" ng-show="vm.showImage"/>' +
      '<input type="file" class="image-file" style="display:none;" accept="image/*" ' +
      'onchange="angular.element(this).scope().vm.setImage(this)" />' +
      '</div>' +
      '<div ng-show="vm.message != \'\'" class="message">' +
      '<span ng-show="!vm.isValid" class="error">{{vm.message}}</span>' +
      '<span ng-show="vm.isValid" class="success" >{{vm.message}}</span>' +
      '</div>' +
      '<div class="image-loading" ng-show="vm.showLoading" >Loading...' +
      '</div>' +
      '<div class="image-display" ng-show="vm.showImage" ng-style="vm.loadingView">' +
      '<div class="image-size" style="display:block;" >' +
      '{{vm.imageWidth}}{{vm.imageSizeSpacer}}{{vm.imageHeight}}' +
      '</div>' +
      '<div class="preview-image" >' +
      '<img ng-src="{{vm.previewImage}}" />' +
      '</div>' +
      '<div class="image-upload-container" >' +
      '<input type="button" class="image-btn" value="Upload" ng-click="vm.uploadImage(vm.directory)" />' +
      '</div>' +
      '</div>' +
      '</div>';

    return {
      restrict: 'EA',
      scope: {
        directory: '=',
      },
      controller: 'imageUploadDirectiveController',
      controllerAs: 'vm',
      bindToController: true,
      template: template,
    };
  });
})();
(function () {
  angular
    .module('PatWebCoreV1')
    .controller(
      'imageUploadDirectiveController',
      function ($scope, imageUploadFactory) {
        var vm = this;

        // supported types
        var validExtensions = [
          'jpg',
          'jpeg',
          'bmp',
          'gif',
          'png',
          'tif',
          'tiff',
        ];

        vm.getImage = function ($event) {
          angular.element('input[type=file]').trigger('click');
        };

        function setup() {
          resetValidity();
          vm.clearImage();
          endLoading();
        }

        function resetValidity() {
          vm.isValid = true;
          vm.message = '';
        }

        vm.setImage = function (element) {
          resetValidity();

          vm.files = element.files; // store the files
          var file = element.files[0];
          vm.isValid = validateFileType(file);

          if (vm.isValid) {
            vm.imageName = file.name;

            var reader = new FileReader();
            reader.onload = function (e) {
              $scope.$apply(function () {
                var image = new Image();
                image.src = reader.result;

                vm.imageWidth = image.width;
                vm.imageSizeSpacer = ' x ';
                vm.imageHeight = image.height;
                vm.previewImage = e.target.result;
                vm.showImage = true;
              });
            };
            reader.readAsDataURL(file);
          } else {
            $scope.$apply(function () {
              vm.clearImage();
              setMessage(0);
            });
          }
        };

        vm.clearImage = function () {
          angular.element("input[type='file']").val(null);
          vm.files = [];
          vm.imageName = '';
          vm.previewImage = '';
          vm.message = '';
          vm.showImage = false;
        };

        function validateFileType(file) {
          var extension = file.name.split('.').pop().toLowerCase();
          return validExtensions.indexOf(extension) > -1;
        }

        vm.uploadImage = function (directoryId) {
          resetValidity();

          var item = {
            EnterpriseId: 1,
            DirectoryAllocationId: directoryId,
            Filename: vm.imageName,
          };

          // start load
          startLoading();
          imageUploadFactory
            .allocateFile(item)
            .then(function (res) {
              var file = vm.files[0]; // get file from file list
              var reader = new FileReader();
              reader.onloadend = function () {
                var formData = new FormData();
                formData.append('file', file);

                imageUploadFactory
                  .uploadImage(res.data.Result.FileAllocationId, formData)
                  .then(function () {
                    vm.clearImage();
                    setMessage(3);

                    endLoading();
                  })
                  .catch(function () {
                    setMessage(4);

                    endLoading();
                  });
              };
              reader.readAsArrayBuffer(file);
            })
            .catch(function (res) {
              if (res.status === 409) {
                setMessage(1);
              } else {
                setMessage(2);
              }
              endLoading();
            });
        };

        function startLoading() {
          vm.loadingView = { opacity: 0.5 };
          vm.showLoading = true;
        }

        function endLoading() {
          vm.loadingView = {};
          vm.showLoading = false;
        }

        function setMessage(code) {
          vm.isValid = false;
          var message = '';
          switch (code) {
            case 0:
              message =
                'The file selected is not a supported image format, please select a valid image.';
              break;
            case 1:
              message =
                'A conflict occurred while allocating the file, please contact your system administrator or rename the file and attempt to upload it again.';
              break;
            case 2:
              message =
                'An error occurred while trying to upload your image please try again';
              break;
            case 3:
              message = 'Image uploaded successfully.';
              vm.isValid = true;
              break;
            case 4:
              message =
                'An issue occurred while uploading the file after allocation, please rename your file and try again.';
              break;
            default:
              message =
                'An error occurred while trying to upload your image please try again'; // duplicate fall back value
          }

          vm.message = message;
        }

        setup();
      }
    );
})();
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('imageUploadFactory', [
    '$http',
    'FILE_API_URL',
    function ($http, FILE_API_URL) {
      var imageUploadUrl = FILE_API_URL + '/api/files';

      return {
        allocateFile: allocateFile,
        uploadImage: uploadImage,
      };

      function allocateFile(item) {
        return $http.post(imageUploadUrl, item, {});
      }

      function uploadImage(allocationId, image) {
        var uri = imageUploadUrl + '/' + allocationId;
        return $http.post(uri, image, {
          transformRequest: angular.identity,
          headers: { 'Content-Type': undefined },
        });
      }
    },
  ]);
})();
(function () {
  // Implementation of the Aptery Imaging provider service. Communicates directly with the common imaging api service.
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.service('apteryxImagingService', apteryxImagingService);
  apteryxImagingService.$inject = [
    '$http',
    '$q',
    '$window',
    'IdmConfig',
    'uriService',
    'apteryxPatAuthenticationService',
    'platformSessionService',
  ];

  function apteryxImagingService(
    $http,
    $q,
    $window,
    IdmConfig,
    uriService,
    apteryxPatAuthenticationService,
    platformSessionService
  ) {
    var http = 'https://';
    var apteryxToken = 'apteryx-imaging';

    function seeIfProviderIsReady() {
      var d = $q.defer();
      var resolved = false;

      // if the apteryx token is already populated do not attempt to set it again.
      //---
      //---
      //--- I am now thinking that if the token is loaded there needs to be an additional check to determine if the provider and or person are the same before continuing.

      var token = platformSessionService.getSessionStorage(apteryxToken);
      if (token === null) {
        var eventMethod = $window.addEventListener
          ? 'addEventListener'
          : 'attachEvent';
        var eventer = $window[eventMethod];
        var messageEvent =
          eventMethod === 'attachEvent' ? 'onmessage' : 'message';

        // Listen to message from child window --- code in generic OIDC ... onOAuthCallback
        // without this in upper environments the seeIfProviderIsReady call processes things before the token is returned causing issues loading components
        eventer(messageEvent, function (e) {
          if (e.data === 'Apteryx Token Process Completed') {
            resolved = true;

            var identifier = getPracticeIdentifier();
            d.resolve(identifier);
          }
        });

        setTimeout(function () {
          if (!resolved) {
            return $q.reject(new Error('Process took longer then expected'));
          } else {
            return d.promise;
          }
        }, 20000); // I get that this is a long amount of time but I do not want to have this fail out ever because of some network issue.
      } else {
        var identifier = getPracticeIdentifier();
        d.resolve(identifier);
      }
      return d.promise;
    }

    function getPracticeIdentifier() {
      if (IdmConfig.apteryxUsePracticeIdForSiteName.toLowerCase() === 'true') {
        var userPractice = platformSessionService.getSessionStorage(
          'userPractice'
        );
        if (userPractice !== null) {
          return userPractice.id;
        } else {
          console.log(
            'Practice was not found with practiceId mode enabled so returning default configuration value'
          );
          return IdmConfig.apteryxUrlSiteName;
        }
      } else {
        return IdmConfig.apteryxUrlSiteName;
      }
    }

    function getUrl() {
      return (
        http + getPracticeIdentifier() + '.' + IdmConfig.apteryxUrlPart + '/'
      );
    }

    function getApiUrl() {
      var url = getUrl() + 'api/';
      return url;
    }

    function getPatientByPDCOPatientId(pdcoPatientId) {
      var url =
        getApiUrl() + 'patient/?primaryId=' + pdcoPatientId.replace(/-/g, '');
      //console.log(url);
      return $http.get(url);
    }

    // same function must exist in both environments (apteryxImagingService and dapteryxImagingService2)
    function updatePatientData(patient) {
      var url = getApiUrl() + 'patient';
      return $http.post(url, patient);
    }

    function getUrlForPatientByPatientId(patientId) {
      return getUrl() + '?patient=' + patientId;
    }

    function getUrlForExamByExamId(examId) {
      return getUrl() + '?study=' + examId;
    }

    // For Apteryx 1.0 exactly the same
    // Different for Apteryx 2.0
    function getUrlForExamByPatientIdExamId(patientId, examId) {
      return getUrlForExamByExamId(examId);
    }

    function getUrlForPatientByImageId(imageId) {
      return getUrl() + '?image=' + imageId;
    }

    function getExamsByPatientId(patientId) {
      var url = getApiUrl() + 'study/?patient=' + patientId;
      return $http.get(url);
    }

    function getSeriesByExamId(examId) {
      var url = getApiUrl() + 'series/?study=' + examId;
      return $http.get(url);
    }

    function getImagesBySeriesId(seriesId) {
      var url = getApiUrl() + 'image/?series=' + seriesId;
      return $http.get(url);
    }

    function getAllByPatientId(patientId) {
      var deferred = $q.defer();

      var exams = [];
      var cancel = false;

      getExamsByPatientId(patientId).then(
        function (examRes) {
          var seriesPromises = [];
          exams = examRes.data.Records;
          _.forEach(exams, function (exam) {
            var deferredSeries = $q.defer();
            seriesPromises.push(deferredSeries.promise);
            getSeriesByExamId(exam.Id).then(
              function (seriesRes) {
                if (cancel) return;
                var imagePromises = [];
                exam.Series = seriesRes.data.Records;
                _.forEach(exam.Series, function (series) {
                  var imagePromise = getImagesBySeriesId(series.Id).then(
                    function (imagesRes) {
                      if (cancel) return;
                      series.Images = imagesRes.data.Records;
                    },
                    function () {
                      cancel = true;
                      deferred.reject();
                    }
                  );
                  imagePromises.push(imagePromise);
                });
                $q.all(imagePromises).then(function () {
                  deferredSeries.resolve();
                });
              },
              function () {
                cancel = true;
                deferred.reject();
              }
            );
          });
          $q.all(seriesPromises).then(function () {
            deferred.resolve({ Exams: exams });
          });
        },
        function () {
          cancel = true;
          deferred.reject();
        }
      );

      return deferred.promise;
    }

    function getImageThumbnailByImageId(imageId) {
      return getApiUrl() + 'bitmap/thumbnail/' + imageId;
    }

    function getImageBitmapByImageId(imageId, requestedEncoding) {
      var encoding = 'jpg';
      if (!_.isNil(requestedEncoding) && requestedEncoding !== '') {
        encoding = requestedEncoding;
      }
      return (
        getUrl() + 'external/bitmap?image=' + imageId + '&encoding=' + encoding
      );
    }

    function captureImage(data, autoCapture, autoClose) {
      var url =
        getUrl() +
        'external/?patientid=' +
        data.patientId +
        '&lastname=' +
        data.lastName +
        '&firstname=' +
        data.firstName +
        '&gender=' +
        data.gender +
        '&birthdate=' +
        data.birthDate +
        '&autoCapture=' +
        autoCapture +
        '&autoClose=' +
        autoClose;
      console.log(url);
      window.open(url);
    }

    function getUrlForNewPatient(data) {
      return (
        getUrl() +
        '/?primaryid=' +
        data.patientId.replace(/-/g, '') +
        '&lastname=' +
        data.lastName +
        '&firstname=' +
        data.firstName +
        '&gender=' +
        data.gender +
        '&birthdate=' +
        data.birthDate
      );
    }

    return {
      seeIfProviderIsReady: seeIfProviderIsReady,
      getPatientByPDCOPatientId: getPatientByPDCOPatientId,
      updatePatientData: updatePatientData,
      getUrlForPatientByPatientId: getUrlForPatientByPatientId,
      getUrlForExamByExamId: getUrlForExamByExamId,
      getUrlForExamByPatientIdExamId: getUrlForExamByPatientIdExamId,
      getUrlForPatientByImageId: getUrlForPatientByImageId,
      getUrlForNewPatient: getUrlForNewPatient,
      getExamsByPatientId: getExamsByPatientId,
      getAllByPatientId: getAllByPatientId,
      getImageThumbnailByImageId: getImageThumbnailByImageId,
      getImageBitmapByImageId: getImageBitmapByImageId,
      captureImage: captureImage,
      ClaimApiImagingVendor: 'Apteryx',
    };
  }
})();
(function () {
  // Implementation of the Aptery Imaging provider service. Communicates directly with the common imaging api service.
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.service('apteryxImagingService2', apteryxImagingService2);
  apteryxImagingService2.$inject = [
    '$http',
    '$q',
    '$window',
    'IdmConfig',
    'uriService',
    'apteryxPatAuthenticationService2',
    'platformSessionService',
      'platformSessionCachingService',
      '$injector',
  ];

  function apteryxImagingService2(
    $http,
    $q,
    $window,
    IdmConfig,
    uriService,
    apteryxPatAuthenticationService2,
    platformSessionService,
      platformSessionCachingService,
      $injector
  ) {
        var http = 'https://';
      var apteryxToken = 'apteryx-imaging2';
      var apteryxDevEnvironment = $injector.get('FuseFlag').ApteryxDevEnvironment;
      var apteryxDevUrl = 'false';
      var featureFlagService = $injector.get('FeatureFlagService');
      featureFlagService.getOnce$(apteryxDevEnvironment).subscribe((value) => {         
          apteryxDevUrl = value;
      });
    
    function seeIfProviderIsReady() {
      // if the apteryx token is already populated do not attempt to set it again.
      //---
      //---
      //--- I am now thinking that if the token is loaded there needs to be an additional check to determine if the provider and or person are the same before continuing.

      if (!apteryxPatAuthenticationService2.getIsLoggedIn()) {
        if (apteryxPatAuthenticationService2.loggingIn) {
          return apteryxPatAuthenticationService2.loggingIn;
        } else {
          console.log(
            'User is not logged in but attempted to load Apteryx 2.0'
          );
          return $q.reject();
        }
      } else {
        var identifier = getPracticeIdentifier();
        return $q.resolve(identifier);
      }
    }
    
    function getPracticeIdentifier() {
      if (IdmConfig.apteryxUsePracticeIdForSiteName.toLowerCase() === 'true') {
        var userPractice = platformSessionService.getSessionStorage(
          'userPractice'
        );
        if (userPractice !== null) {
          return userPractice.id;
        } else {
          console.log(
            'Practice was not found with practiceId mode enabled so returning default configuration value'
          );
          return IdmConfig.apteryx2UrlSiteName;
        }
      } else {
        return IdmConfig.apteryx2UrlSiteName;
      }
    }
    
    function getAppId() {
      var appResult = platformSessionCachingService.userContext.get();
      return appResult.Result.Application.ApplicationId;
    }
    
    function getUrl() {
    if (apteryxDevUrl != 'false') {              
          return apteryxDevUrl; //From the LD feature flag
      }
      else {
        return (          
          http + getPracticeIdentifier() + '.' + IdmConfig.apteryx2UrlPart + '/'
        );
      }          
    }
    
    function getApiUrl() {
      var url = getUrl() + 'api/';
      return url;
    }
    //1 used
    // only by primary id ... in 2.0
    function getPatientByPDCOPatientId(pdcoPatientId) {
      // get the application Id to add on to the request to get the data correctly from apteryx.
      var url =
        getApiUrl() +
        'patient/?primaryId=' +
        pdcoPatientId.replace(/-/g, '') +
        getAppId();
      //console.log(url);
      return $http.get(url);
    }
    
    function updatePatientData(patient) {
      var url = getApiUrl() + 'patient';
      return $http.post(url, patient);
    }

    //2 used
    // only by primary id ... in 2.0
      // no patient id ...    
    function getUrlForPatientByPatientId(patientId) {
      return getUrl() + '?patient=' + patientId;
    }

    //3 used
    // not apparent way to do this given the interface we have right now ...
    // need to see if this works out in the new one.    
    function getUrlForExamByExamId(examId) {
      return getUrl() + '?study=' + examId;
    }

    // For Apteryx 1.0 exactly the same
    // Different for Apteryx 2.0    
    function getUrlForExamByPatientIdExamId(patientId, examId) {
      return getUrl() + '?patient=' + patientId + '&study=' + examId;
    }

    //4 no apparent way to do this.
    // no image id on patient .or pat    
    function getUrlForPatientByImageId(imageId) {
      return getUrl() + '?image=' + imageId;
    }

    //5 appears to be the same
    // no apparent way to do this.    
    function getExamsByPatientId(patientId, nextRecord) {
      var url =
        getApiUrl() +
        'study/?patient=' +
        patientId +
        '&beginRange=&endRange=&teeth=&sort=date&direction=DESC&nextRecord=' +
        nextRecord +
        '&numRecords=100&referringDoctor=&readingDoctor=&modality=&anatomicRegion=';
      return $http.get(url);
    }

    //6 appears to be the same
    // should be fine    
    function getSeriesByExamId(examId) {
      var url = getApiUrl() + 'series/?study=' + examId;
      return $http.get(url);
    }

    //7 appears to be the same    
    function getImagesBySeriesId(seriesId) {
      var url = getApiUrl() + 'image/?series=' + seriesId;
      return $http.get(url);
    }
    
    function getAllByPatientId(patientId) {
      var deferred = $q.defer();

      var exams = [];
      var cancel = false;

      var nextRecord = 1;

      //Get the first 100 Apteryx records
      getExamsByPatientId(patientId, nextRecord).then(
        function (examRes) {
          exams = examRes.data.Records;

          //If the total number of records is greater than or equal to 101,
          //keep calling for the next pages of data (100 studies at a time)
          //until we have all of the Apteryx studies for the patient

          nextRecord = nextRecord + 100;
          var studiesPromises = [];
          while (examRes.data.TotalRecords >= nextRecord) {
            var studyPromise = getExamsByPatientId(patientId, nextRecord).then(
              function (examRes) {
                if (cancel) return;
                //Add the next page of data to the exam records
                if (examRes.data.Records && examRes.data.Records.length > 0) {
                  _.forEach(examRes.data.Records, function (exam) {
                    exams.push(exam);
                  });
                }
              },
              function () {
                cancel = true;
                deferred.reject();
              }
            );
            nextRecord = nextRecord + 100;
            studiesPromises.push(studyPromise);
          }

          $q.all(studiesPromises).then(function () {
            //When we finally have all of the studies for a patient,
            //Begin looping through, getting all series, then all images.
            var seriesPromises = [];
            _.forEach(exams, function (exam) {
              var deferredSeries = $q.defer();
              seriesPromises.push(deferredSeries.promise);
              getSeriesByExamId(exam.Id).then(
                function (seriesRes) {
                  if (cancel) return;
                  var imagePromises = [];
                  exam.Series = seriesRes.data.Records;
                  _.forEach(exam.Series, function (series) {
                    var imagePromise = getImagesBySeriesId(series.Id).then(
                      function (imagesRes) {
                        if (cancel) return;
                        series.Images = imagesRes.data.Records;
                      },
                      function () {
                        cancel = true;
                        deferred.reject();
                      }
                    );
                    imagePromises.push(imagePromise);
                  });
                  $q.all(imagePromises).then(function () {
                    deferredSeries.resolve();
                  });
                },
                function () {
                  cancel = true;
                  deferred.reject();
                }
              );
            });
            $q.all(seriesPromises).then(function () {
              deferred.resolve({ Exams: exams });
            });
          });
        },
        function () {
          cancel = true;
          deferred.reject();
        }
      );

      return deferred.promise;
    }
    
    function getImageThumbnailByImageId(imageId) {
      return getApiUrl() + 'bitmap/thumbnail/' + imageId;
    }

    // changes ...    
    function getImageBitmapByImageId(imageId, requestedEncoding) {
      var encoding = 'jpg';
      if (
        requestedEncoding !== null &&
        requestedEncoding !== undefined &&
        requestedEncoding !== ''
      ) {
        encoding = requestedEncoding;
      }
      return getApiUrl() + 'bitmap/' + imageId;
    }
    
    function captureImage(data, autoCapture, autoClose) {
      // create id for primary id in apteryx
      var primaryId = data.patientId + getAppId();
      var url =
        getUrl() +
        '?patientid=' +
        primaryId +
        '&lastname=' +
        data.lastName +
        '&firstname=' +
        data.firstName +
        '&gender=' +
        data.gender +
        '&birthdate=' +
        data.birthDate +
        '&autocapture=' +
        autoCapture +
        '&autoclose=' +
        autoClose;
      console.log(url);
      window.open(url);
    }
    
    function getUrlForNewPatient(data) {
      var primaryId = data.patientId.replace(/-/g, '') + getAppId();
      return (
        getUrl() +
        '/?primaryid=' +
        primaryId +
        '&lastname=' +
        data.lastName +
        '&firstname=' +
        data.firstName +
        '&gender=' +
        data.gender +
        '&birthdate=' +
        data.birthDate
      );
    }

    return {
      seeIfProviderIsReady: seeIfProviderIsReady,
      getPatientByPDCOPatientId: getPatientByPDCOPatientId,
      updatePatientData: updatePatientData,
      getUrlForPatientByPatientId: getUrlForPatientByPatientId,
      getUrlForExamByExamId: getUrlForExamByExamId,
      getUrlForExamByPatientIdExamId: getUrlForExamByPatientIdExamId,
      getUrlForPatientByImageId: getUrlForPatientByImageId,
      getUrlForNewPatient: getUrlForNewPatient,
      getExamsByPatientId: getExamsByPatientId,
      getAllByPatientId: getAllByPatientId,
      getImageThumbnailByImageId: getImageThumbnailByImageId,
      getImageBitmapByImageId: getImageBitmapByImageId,
      captureImage: captureImage,
      ClaimApiImagingVendor: 'Apteryx_XVWeb2',
    };
  }
})();
(function () {
  'use strict';

  angular
    .module('PatWebCoreV1')
    .service('practiceImagingVendorService', PracticeImagingVendorService);

  PracticeImagingVendorService.$inject = [
    '$http',
    '$window',
    '$q',
    'IdmConfig',
    'uriService',
    'platformSessionService',
  ];

  function PracticeImagingVendorService(
    $http,
    $window,
    $q,
    IdmConfig,
    uriService,
    platformSessionService
  ) {
    var practiceImagingUrl =
      uriService.getWebApiUri() + '/api/practiceImagingVendor/';
    var sidexisControlUrl =
      uriService.getWebApiUri() +
      '/api/locations/{locationId}/integration-control/features/Imaging/vendors/DentsplySirona/check';
    var blueControlUrl =
      uriService.getWebApiUri() +
      '/api/locations/{locationId}/integration-control/features/Imaging/vendors/BlueImaging/check';

    return {
      getActivePracticeImagingVendors: getActivePracticeImagingVendors,
    };

    function getActivePracticeImagingVendors(locationId) {
      var def = $q.defer();
      var currentPractice = getCurrentPractice();
      if (!_.isEmpty(currentPractice)) {
        var imagingVendorPromise = $http.get(
          practiceImagingUrl + 'active/' + currentPractice.id
        );
        var sidexisControlPromise = $http.get(
          sidexisControlUrl.replace('{locationId}', locationId)
        );
        var blueControlPromise = $http.get(
          blueControlUrl.replace('{locationId}', locationId)
        );
        $q.all([
          imagingVendorPromise,
          sidexisControlPromise,
          blueControlPromise,
        ]).then(
          function (responses) {
            var imagingVendorResponse = responses[0];
            var sidexisControlResponse = responses[1];
            var blueControlResponse = responses[2];
            var vendors = [];
            if (
              !_.isEmpty(imagingVendorResponse) &&
              !_.isEmpty(imagingVendorResponse.data) &&
              !_.isEmpty(imagingVendorResponse.data.Result)
            ) {
              vendors = imagingVendorResponse.data.Result;
            }
            if (
              !_.isEmpty(sidexisControlResponse) &&
              !_.isEmpty(sidexisControlResponse.data) &&
              sidexisControlResponse.data.Result
            ) {
              vendors.push({ VendorId: 4, PracticeId: currentPractice.id });
            }
            if (
              !_.isEmpty(blueControlResponse) &&
              !_.isEmpty(blueControlResponse.data) &&
              blueControlResponse.data.Result
            ) {
              vendors.push({ VendorId: 5, PracticeId: currentPractice.id });
            }
            platformSessionService.setSessionStorage(
              'practiceImagingVendors',
              vendors
            );
            def.resolve([]);
          },
          function (error) {
            def.reject(error);
          }
        );
      } else {
        def.resolve([]); // look at this again
      }
      return def.promise;
    }

    function getCurrentPractice() {
      return platformSessionService.getSessionStorage('userPractice');
    }
  }
})();
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('locationHeaderInterceptor', [
    '$injector',
    function ($injector) {
      return {
        request: function ($config) {
          if ($config.noPatHeaders == true) {
            return $config;
          }
          var locationService = $injector.get('locationService');
          var currentLocation = locationService.getCurrentLocation();
          var locationId = 0;
          var timezone = '';
          if (currentLocation != null) {
            locationId = currentLocation.id;
            timezone = currentLocation.timezone;
          }
          $config.headers['PAT-Location-ID'] = locationId;
          $config.headers['Location-TimeZone'] = timezone;
          $config.headers['TimeZone'] = timezone;

          var qaOdontogramSnapshotBypass = localStorage.getItem(
            'qaOdontogramSnapshotBypass'
          );
          if (qaOdontogramSnapshotBypass) {
            $config.headers['PAT-Fuse-QaSnapshotBypass'] = 'True';
          }

          return $config;
        },
      };
    },
  ]);

  app.config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('locationHeaderInterceptor');
    },
  ]);
})();
(function () {
  // apply running filter to this directive implementation

  //filter:custom"
  'use strict';
  var app = angular.module('PatWebCoreV1');
  app.directive(
    'locationSelector',
    function ($rootScope, locationService, $filter) {
      var template =
        '<div>' +
        '<div class="btn-group" uib-dropdown keyboard-nav>' +
        '<button type="button" class="btn btn-primary" uib-dropdown-toggle tabindex="2">' +
        '{{selectedLocationName}} <span class="top-nav-item"> change</span>' +
        '</button>' +
        '<ul class="dropdown-menu location-dropdown" uib-dropdown-menu role="menu">' +
        '<li class="list-header" tabindex="-1">Change your login location</li>' +
        '<li role="menuitem" ng-repeat="location in practicelocations"><a tabindex="2" href="javascript:void(0)" ng-click="pickLocation(location)">{{location.name}}</a></li>' +
        '</ul>' +
        '</div>' +
        '</div>';
      return {
        scope: {
          sorter: '=sorter',
          practicelocations: '=?practiceLocations',
        },
        restrict: 'E',
        template: template,
        bindToController: false,
        controller: 'locationSelectorController as $ctrl',
      };
    }
  );
})();
(function () {
  angular.module('PatWebCoreV1').controller('locationSelectorController', [
    '$rootScope',
    '$scope',
    'locationService',
    'platformSessionService',
    function ($rootScope, $scope, locationService, platformSessionService) {
      $scope.pickLocation = function (location) {
        locationService.selectLocation(location);
        $scope.selectedLocationName = location.name;

        $scope.selectedLocation = _.cloneDeep(location);
        locationService.showAppHeaderWarning(location.deactivationTimeUtc);
      };

      var selectedLocation = locationService.getCurrentLocation();
      if (selectedLocation) {
        $scope.selectedLocationName = selectedLocation.name;
        $scope.selectedLocation = _.cloneDeep(selectedLocation);
        locationService.showAppHeaderWarning(
          selectedLocation.deactivationTimeUtc
        );
      } else {
        $scope.selectedLocationName = 'Select item';
      }

      function getLocations() {
        locationService
          .getCurrentPracticeLocations()
          .then(function (locations) {
            if ($scope.practicelocations) {
              $scope.practicelocations.length = 0;

              // order the list if need be.
              if ($scope.sorter !== undefined) {
                locations.sort($scope.sorter);
              }

              _.forEach(locations, function (loc) {
                $scope.practicelocations.push(loc);
              });

              //get location ...
              $scope.selectedLocationName = $scope.practicelocations[0].name;
              platformSessionService.setSessionStorage(
                'userLocation',
                $scope.practicelocations[0]
              );
              platformSessionService.setSessionStorage(
                'activeLocations',
                $scope.practicelocations
              );
              $rootScope.$broadcast('practiceAndLocationsLoaded');
            } else {
              // order the list if need be.
              if ($scope.sorter !== undefined) {
                locations.sort($scope.sorter);
              }

              $scope.practicelocations = locations;

              // get location;
              $scope.selectedLocationName = $scope.practicelocations[0].name;
              platformSessionService.setSessionStorage(
                'userLocation',
                $scope.practicelocations[0]
              );
              platformSessionService.setSessionStorage(
                'activeLocations',
                $scope.practicelocations
              );
              $rootScope.$broadcast('practiceAndLocationsLoaded');
            }
          })
          .catch(function () {
            $scope.selectedLocationName = 'Select a Practice';
          });
      }

      $scope.$on('patCore:practiceAndLocationsLoaded', function (events, args) {
        var ofcLocation = platformSessionService.getSessionStorage(
          'userLocation'
        );
        $scope.practicelocations = platformSessionService.getSessionStorage(
          'activeLocations'
        );

        if (ofcLocation !== null) {
          $scope.selectedLocationName = ofcLocation.name;
          $scope.selectedLocation = ofcLocation;
        }
      });

      $scope.$on('update-locations-dropdown', function (events, args) {
        if (_.isNil($scope.selectedLocation)) {
          var currentLoc = locationService.getCurrentLocation();
          $scope.selectedLocation = _.cloneDeep(currentLoc);
        }

        if (args.LocationId === $scope.selectedLocation.id) {
          $scope.selectedLocation.name = args.NameLine1;
          $scope.selectedLocation.deactivationTimeUtc =
            args.DeactivationTimeUtc;
          locationService.selectLocation($scope.selectedLocation);
          locationService.showAppHeaderWarning(args.DeactivationTimeUtc);
        }
        getLocations();
      });

      $scope.$on('patCore:load-location-display', function (event, args) {
        var activeLocations = locationService.getActiveLocations();
        if (activeLocations) {
          $scope.practicelocations = activeLocations;
        }

        var currentLoc = locationService.getCurrentLocation();
        $scope.selectedLocation = _.cloneDeep(currentLoc);
      });

      // if locations are loaded ... load the locations data into the control and
      // default the selection to the selected item or the first in the list.
      var activeLocations = locationService.getActiveLocations();
      if (activeLocations !== null) {
        $scope.practicelocations = activeLocations;
        var currentLocation = locationService.getCurrentLocation();
        if (selectedLocation !== null) {
          $scope.selectedLocation = currentLocation;
        }
        //else // not sure if I want this as part of the control. UI is not changing after selection so requires a digest, need to consider more
        //{
        //    $scope.selectedLocation = $scope.practicelocations[0];
        //}
      }
    },
  ]);
})();
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('locationService', [
    '$rootScope',
    '$injector',
    '$filter',
    '$http',
    'uriService',
    '$q',
    'locationmodel',
    'platformSessionService',
    'platformSessionCachingService',
    'practiceImagingVendorService',
    function (
      $rootScope,
      $injector,
      $filter,
      $http,
      uriService,
      $q,
      locationmodel,
      platformSessionService,
      platformSessionCachingService,
      practiceImagingVendorService
    ) {
      var locationUrl = uriService.getWebApiUri() + '/api/locations/practice/';

      function showAppHeaderWarning(deactivationTime) {
        var dateNow = moment().format('MM/DD/YYYY');
        var toCheck = moment(deactivationTime).format('MM/DD/YYYY');

        if (deactivationTime) {
          if (
            moment(toCheck).isBefore(dateNow) ||
            moment(toCheck).isSame(dateNow)
          ) {
            $rootScope.$broadcast('show-globalAppHeader', 1); //location is Inactive
          } else {
            $rootScope.$broadcast('show-globalAppHeader', 2); //location is Pending Inactive
          }
        } else {
          $rootScope.$broadcast('show-globalAppHeader', 3); //location is Active
        }
      }

      function getRestrictedPracticeUserLocations() {
        var def = $q.defer();

        var userContext = platformSessionCachingService.userContext.get();
        if (userContext === null) {
          $q.reject('error occurred');
        }
        var access = userContext.Result.Access;
        if (!access) {
          $q.reject('error occurred.');
        } else {
          var currentPractice = getCurrentPractice();

          if (currentPractice) {
            $http
              .get(locationUrl + currentPractice.id)
              .then(function (res) {
                var locations = [];
                res.data.Result.forEach(function (item) {
                  var l = locationmodel.build(
                    item.LocationId,
                    item.Name,
                    item.PracticeId,
                    item.MerchantId,
                    item.Description,
                    item.Timezone,
                    item.DeactivationTimeUtc,
                    item.EnterpriseId
                  );
                  locations.push(l);
                });
                platformSessionService.setSessionStorage(
                  'activeLocations',
                  locations
                );
                def.resolve(locations);
              })
              .catch(function () {
                return $q.reject('error occurred.');
              });
          } else {
            $q.reject('error occurred');
          }
        }
        return def.promise;
      }

      function getUserLocations() {
        var currentPractice = getCurrentPractice();
        if (currentPractice) {
          return $http
            .get(locationUrl + currentPractice.id)
            .then(function (response) {
              var locations = [];
              response.data.Result.forEach(function (item) {
                var l = locationmodel.build(
                  item.LocationId,
                  item.Name,
                  item.PracticeId,
                  item.MerchantId,
                  item.Description,
                  item.Timezone,
                  item.DeactivationTimeUtc,
                  item.EnterpriseId
                );
                locations.push(l);
              });
              platformSessionService.setSessionStorage(
                'activeLocations',
                locations
              );
              return locations;
            });
        }
        return $q.resolve([]);
      }

      var getLocationsSorted = function () {
        var def = $q.defer();
        var currentPractice = getCurrentPractice();

        if (currentPractice) {
          $http
            .get(locationUrl + currentPractice.id + '/sorted')
            .then(function (res) {
              var activeLocations = [];
              var pendingLocations = [];
              var inactiveLocations = [];

              res.data.Result.ActiveLocations.forEach(function (item) {
                var active = locationmodel.build(
                  item.LocationId,
                  item.Name,
                  item.PracticeId,
                  item.MerchantId,
                  item.Description,
                  item.Timezone,
                  item.DeactivationTimeUtc,
                  item.EnterpriseId
                );
                activeLocations.push(active);
              });
              platformSessionService.setSessionStorage(
                'activeLocationsSorted',
                activeLocations
              );

              res.data.Result.PendingLocations.forEach(function (item) {
                var pending = locationmodel.build(
                  item.LocationId,
                  item.Name,
                  item.PracticeId,
                  item.MerchantId,
                  item.Description,
                  item.Timezone,
                  item.DeactivationTimeUtc,
                  item.EnterpriseId
                );
                pendingLocations.push(pending);
              });
              platformSessionService.setSessionStorage(
                'pendingLocationsSorted',
                pendingLocations
              );

              res.data.Result.InactiveLocations.forEach(function (item) {
                var inactive = locationmodel.build(
                  item.LocationId,
                  item.Name,
                  item.PracticeId,
                  item.MerchantId,
                  item.Description,
                  item.Timezone,
                  item.DeactivationTimeUtc,
                  item.EnterpriseId
                );
                inactiveLocations.push(inactive);
              });
              platformSessionService.setSessionStorage(
                'inactiveLocationsSorted',
                inactiveLocations
              );

              def.resolve([
                activeLocations,
                pendingLocations,
                inactiveLocations,
              ]);
            })
            .catch(function () {
              return $q.reject('error occurred');
            });
        } else {
          def.resolve({});
        }
        return def.promise;
      };

      function loadAllLocations() {
        switch ($rootScope.patAuthContext.accessLevel) {
          case 'RestrictedPractice':
          case 'Location':
            return getRestrictedPracticeUserLocations();
          default:
            return getUserLocations();
        }
      }

      function getImagingProviders(locationId) {
        practiceImagingVendorService
          .getActivePracticeImagingVendors(locationId)
          .then(function () {
            var imagingProviderFactory = $injector.get(
              'imagingProviderFactory'
            );
            imagingProviderFactory.resolveMultiple();
          });
      }

      $rootScope.$on('patCore:initlocation', function () {
        var ofcLocation = getCurrentLocation();
        if (ofcLocation && ofcLocation.id) {
          getImagingProviders(ofcLocation.id);
        }
      });

      function selectLocation(selectedLocation) {
        var currentPractice = getCurrentPractice();
        if (currentPractice === null) {
          throw Error('There is no practice selected');
        }

        if (selectedLocation === undefined) {
          // probably admin account
          loadAllLocations().then(function (locs) {
            selectedLocation = locs[0]; // set the value since one is not set by default in this instance.
            platformSessionService.setSessionStorage(
              'userLocation',
              selectedLocation
            );
            $rootScope.$broadcast('patCore:initlocation');
            $injector.get('LocationChangeService').emit();
          });
        } else {
          var locations = this.getActiveLocations();
          var bitStatus = 0;
          for (var i = locations.length - 1; i >= 0; i--) {
            var storedLocation = locations[i];
            if (storedLocation.id === selectedLocation.id) {
              bitStatus = 1;
              platformSessionService.setSessionStorage(
                'userLocation',
                selectedLocation
              );
              $rootScope.$broadcast('patCore:initlocation');
              $injector.get('LocationChangeService').emit();
              break;
            }
          }

          // need to ensure this is called if it was not called previously.
          if (bitStatus === 0) {
            console.log(
              'For some unknown reason the location was not set after the various checks so change the value anyway.'
            );
            platformSessionService.setSessionStorage(
              'userLocation',
              selectedLocation
            );
            $rootScope.$broadcast('patCore:initlocation');
            $injector.get('LocationChangeService').emit();
          }
        }
      }

      // called when you want to set the value but not do other checks first.
      // note that this method does not broadcast the change.
      function setLocation(location) {
        platformSessionService.setSessionStorage('userLocation', location);
        if (location && location.id) {
          getImagingProviders(location.id);
        }
      }

      var getCurrentLocation = function () {
        return platformSessionService.getSessionStorage('userLocation');
      };

      var getActiveLocations = function () {
        return platformSessionService.getSessionStorage('activeLocations');
      };

      var getActiveLocationsSorted = function () {
        return platformSessionService.getSessionStorage(
          'activeLocationsSorted'
        );
      };

      var getPendingLocationsSorted = function () {
        return platformSessionService.getSessionStorage(
          'pendingLocationsSorted'
        );
      };

      var getInactiveLocationsSorted = function () {
        return platformSessionService.getSessionStorage(
          'inactiveLocationsSorted'
        );
      };

      var getCurrentPractice = function () {
        return platformSessionService.getSessionStorage('userPractice');
      };

      function getCurrentPracticeLocations() {
        var def = $q.defer();
        var currentPractice = getCurrentPractice();
        if (currentPractice === null) {
          return $q.reject(new Error('There is no practice selected'));
        }
        loadAllLocations().then(function (locs) {
          var locations = locs;
          // not sure why this is here ... I will have to look at this later.
          locations.sort(sortBy('name'));
          def.resolve(locations);
        });
        return def.promise;
      }

      var getCurrentLocationEnterpriseId = function (){
        var currentLocation = JSON.parse(sessionStorage.getItem('userLocation'));
          if (currentLocation && currentLocation.enterpriseid) {
            return currentLocation.enterpriseid;
          }
      }

      var getLocationEnterpriseId = function (locationId) {
        var activeLocations = JSON.parse(sessionStorage.getItem('activeLocations'));
        var locationEnterpriseId;
        if (activeLocations && activeLocations.length > 0) {
          _.forEach(activeLocations, function (location) {
            if (location.id) {
              if (location.id === locationId && location.enterpriseid) {
                locationEnterpriseId = location.enterpriseid;
                return false;
              }
            }
          });
        }
        return locationEnterpriseId;
      }

      var refreshActiveLocations = function () {
        return loadAllLocations().then(
          function (locs) {
            platformSessionService.setSessionStorage('activeLocations', locs);
          },
          function (data) {}
        );
      }

      return {
        getAllLocations: loadAllLocations,
        selectLocation: selectLocation,
        setLocation: setLocation,
        getCurrentLocation: getCurrentLocation,
        getActiveLocations: getActiveLocations,
        getCurrentPracticeLocations: getCurrentPracticeLocations,
        showAppHeaderWarning: showAppHeaderWarning,
        getLocationsSorted: getLocationsSorted,
        getActiveLocationsSorted: getActiveLocationsSorted,
        getPendingLocationsSorted: getPendingLocationsSorted,
        getInactiveLocationsSorted: getInactiveLocationsSorted,
        getCurrentLocationEnterpriseId: getCurrentLocationEnterpriseId,
        getLocationEnterpriseId: getLocationEnterpriseId,
        refreshActiveLocations: refreshActiveLocations
      };
    },
  ]);
})();
(function () {
  'use strict';
  var app = angular.module('PatWebCoreV1');
  app.factory('locationmodel', function () {
    function locationmodel(
      id,
      name,
      practiceid,
      merchantid,
      description,
      timezone,
      deactivationTimeUtc,
      enterpriseid
    ) {
      this.id = id;
      this.name = name;
      this.practiceid = practiceid;
      this.merchantid = merchantid;
      this.description = description;
      this.timezone = timezone;
      this.deactivationTimeUtc = deactivationTimeUtc;
      this.enterpriseid = enterpriseid;
    }
    locationmodel.build = function (
      id,
      name,
      practiceid,
      merchantid,
      description,
      timezone,
      deactivationTimeUtc,
      enterpriseid
    ) {
      return new locationmodel(
        id,
        name,
        practiceid,
        merchantid,
        description,
        timezone,
        deactivationTimeUtc,
        enterpriseid
      );
    };
    return locationmodel;
  });
})();
(function () {
  'use strict';
  var app = angular.module('PatWebCoreV1');
  app.directive(
    'sortedLocationSelector',
    function ($rootScope, locationService) {
      var template =
        '<div>' +
        '<div class="btn-group" uib-dropdown keyboard-nav>' +
        '<button type="button" class="btn btn-primary" uib-dropdown-toggle tabindex="2">' +
        '{{selectedLocationName}} <span class="top-nav-item">Change Location</span>' +
        '</button>' +
        '<ul class="dropdown-menu location-dropdown" uib-dropdown-menu role="menu">' +
        '<li class="list-header" tabindex="-1"><b>Active Locations</b></li>' +
        '<li role="menuitem" ng-repeat="location in activeLocationsSorted"><a tabindex="2" href="javascript:void(0)" ng-click="pickLocation(location)">{{location.name}}</a></li>' +
        '<li class="list-header" tabindex="-1"><b>Pending Locations</b></li>' +
        '<li role="menuitem" ng-repeat="location in pendingLocationsSorted"> <a tabindex="2" href="javascript:void(0)" ng-click="pickLocation(location)">{{location.name}} - {{formatDate(location.deactivationTimeUtc)}}</a></li>' +
        '<li class="list-header" tabindex="-1"><b>Inactive Locations</b></li>' +
        '<li role="menuitem" ng-repeat="location in inactiveLocationsSorted"> <a tabindex="2" href="javascript:void(0)" ng-click="pickLocation(location)">{{location.name}} - {{formatDate(location.deactivationTimeUtc)}}</a></li>' +
        '</ul>' +
        '</div>' +
        '</div>';
      return {
        template: template,
        bindToController: true,
        controller: 'sortedLocationSelectorController as $ctrl',
      };
    }
  );
})();
(function () {
  angular
    .module('PatWebCoreV1')
    .controller(
      'sortedLocationSelectorController',
      function ($rootScope, $scope, locationService) {
        $scope.pickLocation = function (location) {
          locationService.selectLocation(location);
          $scope.selectedLocationName = location.name;

          $scope.selectedLocation = _.cloneDeep(location);
          locationService.showAppHeaderWarning(location.deactivationTimeUtc);
        };

        var selectedLocation = locationService.getCurrentLocation();
        if (selectedLocation) {
          $scope.selectedLocationName = selectedLocation.name;
          $scope.selectedLocation = _.cloneDeep(selectedLocation);
          locationService.showAppHeaderWarning(
            selectedLocation.deactivationTimeUtc
          );
        } else {
          $scope.selectedLocationName = 'Select item';
        }

        function getLocationsSorted() {
          locationService.getLocationsSorted().then(function (locations) {
            $scope.activeLocationsSorted = locationService.getActiveLocationsSorted();
            $scope.pendingLocationsSorted = locationService.getPendingLocationsSorted();
            $scope.inactiveLocationsSorted = locationService.getInactiveLocationsSorted();
          });
        }

        $scope.formatDate = function (oldDate) {
          return moment(oldDate).format('MM/DD/YYYY');
        };

        getLocationsSorted();
      }
    );
})();
(function (window, angular, undefined) {
  'use strict';
  angular.module('ngIdle', [
    'ngIdle.keepalive',
    'ngIdle.idle',
    'ngIdle.countdown',
    'ngIdle.title',
    'ngIdle.localStorage',
  ]);
  angular.module('ngIdle.keepalive', []).provider('Keepalive', function () {
    var options = {
      http: null,
      interval: 10 * 60,
    };

    this.http = function (value) {
      if (!value)
        throw new Error(
          'Argument must be a string containing a URL, or an object containing the HTTP request configuration.'
        );
      if (angular.isString(value)) {
        value = {
          url: value,
          method: 'GET',
        };
      }

      value.cache = false;

      options.http = value;
    };

    var setInterval = (this.interval = function (seconds) {
      seconds = parseInt(seconds);

      if (isNaN(seconds) || seconds <= 0)
        throw new Error(
          'Interval must be expressed in seconds and be greater than 0.'
        );
      options.interval = seconds;
    });

    this.$get = [
      '$rootScope',
      '$log',
      '$interval',
      '$http',
      function ($rootScope, $log, $interval, $http) {
        var state = {
          ping: null,
        };

        function handleResponse(res) {
          $rootScope.$broadcast('KeepaliveResponse', res.data, res.status);
        }

        function ping() {
          $rootScope.$broadcast('Keepalive');

          if (angular.isObject(options.http)) {
            $http(options.http).then(handleResponse).catch(handleResponse);
          }
        }

        return {
          _options: function () {
            return options;
          },
          setInterval: setInterval,
          start: function () {
            $interval.cancel(state.ping);

            state.ping = $interval(ping, options.interval * 1000);
            return state.ping;
          },
          stop: function () {
            $interval.cancel(state.ping);
          },
          ping: function () {
            ping();
          },
        };
      },
    ];
  });

  angular
    .module('ngIdle.idle', ['ngIdle.keepalive', 'ngIdle.localStorage'])
    .provider('Idle', function () {
      var options = {
        idle: 20 * 60, // in seconds (default is 20min)
        timeout: 30, // in seconds (default is 30sec)
        autoResume: 'idle', // lets events automatically resume (unsets idle state/resets warning)
        interrupt:
          'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove scroll',
        keepalive: true,
      };

      /**
       *  Sets the number of seconds a user can be idle before they are considered timed out.
       *  @param {Number|Boolean} seconds A positive number representing seconds OR 0 or false to disable this feature.
       */
      var setTimeout = (this.timeout = function (seconds) {
        if (seconds === false) options.timeout = 0;
        else if (angular.isNumber(seconds) && seconds >= 0)
          options.timeout = seconds;
        else
          throw new Error(
            'Timeout must be zero or false to disable the feature, or a positive integer (in seconds) to enable it.'
          );
      });

      this.interrupt = function (events) {
        options.interrupt = events;
      };

      var setIdle = (this.idle = function (seconds) {
        if (seconds <= 0)
          throw new Error('Idle must be a value in seconds, greater than 0.');

        options.idle = seconds;
      });

      this.autoResume = function (value) {
        if (value === true) options.autoResume = 'idle';
        else if (value === false) options.autoResume = 'off';
        else options.autoResume = value;
      };

      this.keepalive = function (enabled) {
        options.keepalive = enabled === true;
      };

      this.$get = [
        '$interval',
        '$log',
        '$rootScope',
        '$document',
        'Keepalive',
        'IdleLocalStorage',
        '$window',
        function (
          $interval,
          $log,
          $rootScope,
          $document,
          Keepalive,
          LocalStorage,
          $window
        ) {
          var state = {
            idle: null,
            timeout: null,
            idling: false,
            running: false,
            countdown: null,
          };

          var lastX;
          var lastY;

          var id = new Date().getTime();

          function startKeepalive() {
            if (!options.keepalive) return;

            if (state.running) Keepalive.ping();

            Keepalive.start();
          }

          function stopKeepalive() {
            if (!options.keepalive) return;

            Keepalive.stop();
          }

          function toggleState() {
            state.idling = !state.idling;
            var name = state.idling ? 'Start' : 'End';

            $rootScope.$broadcast('Idle' + name);

            if (state.idling) {
              stopKeepalive();
              if (options.timeout) {
                state.countdown = options.timeout;
                countdown();
                state.timeout = $interval(
                  countdown,
                  1000,
                  options.timeout,
                  false
                );
              }
            } else {
              startKeepalive();
            }

            $interval.cancel(state.idle);
          }

          function countdown() {
            // countdown has expired, so signal timeout
            if (state.countdown <= 0) {
              timeout();
              return;
            }

            // countdown hasn't reached zero, so warn and decrement
            $rootScope.$broadcast('IdleWarn', state.countdown);
            state.countdown--;
          }

          function timeout() {
            stopKeepalive();
            $interval.cancel(state.idle);
            $interval.cancel(state.timeout);

            state.idling = true;
            state.running = false;
            state.countdown = 0;

            $rootScope.$broadcast('IdleTimeout');
          }

          function changeOption(self, fn, value) {
            var reset = self.running();

            self.unwatch();
            fn(value);
            if (reset) self.watch();
          }

          function getExpiry() {
            var obj = LocalStorage.get('expiry');

            return obj && obj.time ? new Date(obj.time) : null;
          }

          function setExpiry(date) {
            if (!date) LocalStorage.remove('expiry');
            else LocalStorage.set('expiry', { id: id, time: date });
          }

          var svc = {
            _options: function () {
              return options;
            },
            _getNow: function () {
              return new Date();
            },
            getIdle: function () {
              return options.idle;
            },
            getTimeout: function () {
              return options.timeout;
            },
            setIdle: function (seconds) {
              changeOption(this, setIdle, seconds);
            },
            setTimeout: function (seconds) {
              changeOption(this, setTimeout, seconds);
            },
            isExpired: function () {
              var expiry = getExpiry();
              return expiry !== null && expiry <= this._getNow();
            },
            running: function () {
              return state.running;
            },
            idling: function () {
              return state.idling;
            },
            watch: function (noExpiryUpdate) {
              $interval.cancel(state.idle);
              $interval.cancel(state.timeout);

              // calculate the absolute expiry date, as added insurance against a browser sleeping or paused in the background
              var timeout = !options.timeout ? 0 : options.timeout;
              if (!noExpiryUpdate)
                setExpiry(
                  new Date(
                    new Date().getTime() + (options.idle + timeout) * 1000
                  )
                );

              if (state.idling) toggleState();
              // clears the idle state if currently idling
              else if (!state.running) startKeepalive(); // if about to run, start keep alive

              state.running = true;

              state.idle = $interval(
                toggleState,
                options.idle * 1000,
                0,
                false
              );
            },
            unwatch: function () {
              $interval.cancel(state.idle);
              $interval.cancel(state.timeout);

              state.idling = false;
              state.running = false;
              setExpiry(null);

              stopKeepalive();
            },
            interrupt: function (noExpiryUpdate) {
              if (!state.running) return;

              if (options.timeout && this.isExpired()) {
                timeout();
                return;
              }

              // note: you can no longer auto resume once we exceed the expiry; you will reset state by calling watch() manually
              if (
                options.autoResume === 'idle' ||
                (options.autoResume === 'notIdle' && !state.idling)
              )
                this.watch(noExpiryUpdate);
            },
          };

          $document.find('body').on(options.interrupt, function (ev) {
            // Look for a mouse move event by checking for the existence of clientX on the event.
            if (ev.clientX) {
              if (lastX === ev.clientX && lastY === ev.clientY) {
                // Mouse wasn't physically moved
                return;
              }
              lastX = ev.clientX;
              lastY = ev.clientY;
            }

            svc.interrupt();
          });

          var wrap = function (event) {
            if (
              event.key === 'ngIdle.expiry' &&
              event.newValue !== event.oldValue
            ) {
              var val = angular.fromJson(event.newValue);
              if (val.id === id) return;
              svc.interrupt(true);
            }
          };

          if ($window.addEventListener)
            $window.addEventListener('storage', wrap, false);
          else $window.attachEvent('onstorage', wrap);

          return svc;
        },
      ];
    });

  angular
    .module('ngIdle.countdown', ['ngIdle.idle'])
    .directive('idleCountdown', [
      'Idle',
      function (Idle) {
        return {
          restrict: 'A',
          scope: {
            value: '=idleCountdown',
          },
          link: function ($scope) {
            // Initialize the scope's value to the configured timeout.
            $scope.value = Idle.getTimeout();

            $scope.$on('IdleWarn', function (e, countdown) {
              $scope.$evalAsync(function () {
                $scope.value = countdown;
              });
            });

            $scope.$on('IdleTimeout', function () {
              $scope.$evalAsync(function () {
                $scope.value = 0;
              });
            });
          },
        };
      },
    ]);

  angular
    .module('ngIdle.title', [])
    .factory('Title', [
      '$document',
      '$interpolate',
      function ($document, $interpolate) {
        function padLeft(nr, n, str) {
          return new Array(n - String(nr).length + 1).join(str || '0') + nr;
        }

        var state = {
          original: null,
          idle: '{{minutes}}:{{seconds}} until your session times out!',
          timedout: 'Your session has expired.',
        };

        return {
          original: function (val) {
            if (angular.isUndefined(val)) return state.original;

            state.original = val;
          },
          store: function (overwrite) {
            if (overwrite || !state.original) state.original = this.value();
          },
          value: function (val) {
            if (angular.isUndefined(val)) return $document[0].title;

            $document[0].title = val;
          },
          idleMessage: function (val) {
            if (angular.isUndefined(val)) return state.idle;

            state.idle = val;
          },
          timedOutMessage: function (val) {
            if (angular.isUndefined(val)) return state.timedout;

            state.timedout = val;
          },
          setAsIdle: function (countdown) {
            this.store();

            var remaining = { totalSeconds: countdown };
            remaining.minutes = Math.floor(countdown / 60);
            remaining.seconds = padLeft(countdown - remaining.minutes * 60, 2);

            this.value($interpolate(this.idleMessage())(remaining));
          },
          setAsTimedOut: function () {
            this.store();

            this.value(this.timedOutMessage());
          },
          restore: function () {
            if (this.original()) this.value(this.original());
          },
        };
      },
    ])
    .directive('title', [
      'Title',
      function (Title) {
        return {
          restrict: 'E',
          link: function ($scope, $element, $attr) {
            if ($attr.idleDisabled) return;

            Title.store(true);

            $scope.$on('IdleStart', function () {
              Title.original($element[0].innerText);
            });

            $scope.$on('IdleWarn', function (e, countdown) {
              Title.setAsIdle(countdown);
            });

            $scope.$on('IdleEnd', function () {
              Title.restore();
            });

            $scope.$on('IdleTimeout', function () {
              Title.setAsTimedOut();
            });
          },
        };
      },
    ]);

  angular.module('ngIdle.localStorage', []).service('IdleLocalStorage', [
    '$window',
    function ($window) {
      var storage = $window.localStorage;

      return {
        set: function (key, value) {
          storage.setItem('ngIdle.' + key, angular.toJson(value));
        },
        get: function (key) {
          return angular.fromJson(storage.getItem('ngIdle.' + key));
        },
        remove: function (key) {
          storage.removeItem('ngIdle.' + key);
        },
      };
    },
  ]);
})(window, window.angular);
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('openEdgeService', [
    '$rootScope',
    '$http',
    '$window',
    'OPENEDGE_API_URL',
    'locationService',
    'practiceService',
    function (
      $rootScope,
      $http,
      $window,
      OPENEDGE_API_URL,
      locationService,
      practiceService
    ) {
      var vm = this;
      var childWindowHeight = undefined;
      var submittingTransaction = undefined;
      var myInterval = undefined;

      function createCredit(payerId, entryMode, amount, requireSignature) {
        var creditTrans = {
          PayerAccountId: payerId,
          MerchantId: getMerchantId(),
          EntryMode: entryMode,
          Amount: amount,
          RequireSignature: requireSignature,
        };

        if (creditTrans.MerchantId == null)
          return Promise.reject(new Error('No merchant id found!'));

        return $http({
          method: 'POST',
          url: OPENEDGE_API_URL + '/credit',
          data: creditTrans,
        });
      }

      function createDebitPurchase(
        payerId,
        entryMode,
        amount,
        requireSignature,
        accountType
      ) {
        var debitPurchaseTrans = {
          PayerAccountId: payerId,
          MerchantId: getMerchantId(),
          EntryMode: entryMode,
          Amount: amount,
          RequireSignature: requireSignature,
          AccountType: accountType,
        };

        if (debitPurchaseTrans.MerchantId == null)
          return Promise.reject(new Error('No merchant id found!'));

        return $http({
          method: 'POST',
          url: OPENEDGE_API_URL + '/debitpurchase',
          data: debitPurchaseTrans,
        });
      }

      function createDebitRefund(
        payerId,
        entryMode,
        amount,
        requireSignature,
        accountType
      ) {
        var debitRefundTrans = {
          PayerAccountId: payerId,
          MerchantId: getMerchantId(),
          EntryMode: entryMode,
          Amount: amount,
          RequireSignature: requireSignature,
          AccountType: accountType,
        };

        if (debitRefundTrans.MerchantId == null)
          return Promise.reject(new Error('No merchant id found!'));

        return $http({
          method: 'POST',
          url: OPENEDGE_API_URL + '/debitrefund',
          data: debitRefundTrans,
        });
      }

      function adjustTransaction(orderId, amount) {
        var adjustTrans = {
          OrderId: orderId,
          Amount: amount,
        };

        return $http({
          method: 'POST',
          url: OPENEDGE_API_URL + '/adjust',
          data: adjustTrans,
        });
      }

      function voidTransaction(orderId) {
        var voidTrans = {
          OrderId: orderId,
        };

        return $http({
          method: 'POST',
          url: OPENEDGE_API_URL + '/void',
          data: voidTrans,
        });
      }

      function submitTransaction(transId, windowHeight) {
        var body = '<html><head></head><body>';
        body += '<h3>Credit transaction in progress...</h3>';
        body +=
          '<form id=submitCredit method="post" action="' +
          OPENEDGE_API_URL +
          '/submit">';
        body +=
          '<input name="TransactionId" type="hidden" value="' + transId + '">';
        body +=
          '<script> document.getElementById("submitCredit").submit();</script>';
        body += '</form></body></html>';
        var params = 'top=0,width=400,height=' + windowHeight;

        var myWin = $window.open('', 'OpenEdge', params);
        if (myWin != null) {
          myWin.document.write(body);
          return true;
        } else {
          return false;
        }
      }

      function getTransaction(transId) {
        return $http({
          method: 'GET',
          url: OPENEDGE_API_URL + '/' + transId,
        });
      }

      function getTransactionDetails(transId) {
        return $http({
          method: 'GET',
          url: OPENEDGE_API_URL + '/details/' + transId,
        });
      }

      function getMerchantId() {
        var currentLocation = locationService.getCurrentLocation();

        if (currentLocation != null && currentLocation.merchantid) {
          return currentLocation.merchantid;
        } else {
          var currentPractice = practiceService.getCurrentPractice();

          if (currentPractice && currentPractice.merchantID) {
            return currentPractice.merchantID;
          }
        }

        return null;
      }

      return {
        createCredit: createCredit,
        createDebitPurchase: createDebitPurchase,
        createDebitRefund: createDebitRefund,
        submitTransaction: submitTransaction,
        adjustTransaction: adjustTransaction,
        voidTransaction: voidTransaction,
        getTransaction: getTransaction,
        getTransactionDetails: getTransactionDetails,
      };
    },
  ]);
})();

(function () {
  'use strict';
  var app = angular.module('PatWebCoreV1');
  app.factory('webshellOptionalFeatures', function () {
    const id = 'walkMe.js';

    return {
      loadWalkme: function () {
        var element = document.getElementById(id);
        if (!element) {
          var walkme = document.createElement('script');
          walkme.id = id;
          walkme.type = 'text/javascript';
          walkme.async = true;
          walkme.src = window.walkmeUrl;
          var s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(walkme, s);
          window._walkmeConfig = {
            smartLoad: true,
          };
        }
      },
    };
  });
})();
(function () {
  'use strict';

  angular.module('PatWebCoreV1').filter('orderObjectBy', orderObjectBy);

  function orderObjectBy() {
    return orderObjectByFilter;

    function orderObjectByFilter(items, field) {
      var filtered = [];
      _.forEach(items, function (item) {
        filtered.push(item);
      });
      filtered.sort(function (a, b) {
        return a[field] > b[field] ? 1 : -1;
      });
      return filtered;
    }
  }
})();
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');
  app.directive(
    'pdf',
    function (
      practiceService,
      applicationService,
      locationService,
      uniqueIdentifier,
      instanceIdentifier,
      patAuthenticationService,
      $http,
      CLAIM_API_URL
    ) {
      return {
        restrict: 'E',
        scope: {
          src: '@',
          height: '@',
          width: '@',
        },
        link: link,
      };

      function link(scope, element, attrs) {
        function loadPdf() {
          // The src attribute is required
          if (!scope.src) {
            element.replaceWith(
              "Error: Can't retrieve PDF.  The src attribute is missing."
            );
            return;
          }

          // Optional width and height parameters will default to 100%
          var height = scope.height ? scope.height : '100%';
          var width = scope.width ? scope.width : '100%';

          getUrl(scope.src).then(
            function (url) {
              element.html(
                '<object type="application/pdf" data="' +
                  url +
                  '" width="' +
                  width +
                  '" height="' +
                  height +
                  '"></object>'
              );
            },
            function () {
              element.replaceWith(
                "Error: Can't retrieve PDF.  There was an error formulating the PDF url."
              );
            }
          );
        }

        scope.$watchCollection('[src, height, width]', loadPdf);
      }

      function getUrl(src) {
        var currentPractice = practiceService.getCurrentPractice();
        var patPracticeId = 0;
        if (currentPractice != null) {
          patPracticeId = currentPractice.id;
        }

        var patApplicationId = applicationService.getApplicationId();

        var currentLocation = locationService.getCurrentLocation();
        var patLocationId = 0;
        if (currentLocation != null) {
          patLocationId = currentLocation.id;
        }

        var patRequestId = uniqueIdentifier.getId();
        var patApplicationInstanceId = instanceIdentifier.getIdentifier();

        // Make an http request for the purpose of setting the access_token cookie.
        // This cookie is needed for the browser's http request on the object tag
        return $http({
          withCredentials: true,
          method: 'GET',
          url:
            CLAIM_API_URL +
            '/api/v1/locations/' +
            patLocationId +
            '/j430dclaims/pdfSetup',
        }).then(
          function (data, status, headers, config) {
            return (
              src +
              '?PAT-Practice-ID=' +
              patPracticeId +
              '&PAT-Location-ID=' +
              patLocationId +
              '&PAT-Application-ID=' +
              patApplicationId +
              '&PAT-Request-ID=' +
              patRequestId +
              '&PAT-Application-Instance-ID=' +
              patApplicationInstanceId
            );
          },
          function (response) {
            console.log(response);
            throw response;
          }
        );
      }
    }
  );
})();
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('ULTModalService', [
    '$rootScope',
    '$filter',
    '$http',
    'uriService',
    '$q',
    'platformSessionService',
    '$injector',
    function (
      $rootScope,
      $filter,
      $http,
      uriService,
      $q,
      platformSessionService,
      $injector
    ) {
      var isUltMessageSet = false;

      var openUltMessage = function (rejection) {
        if (isUltMessageSet == false) {
          isUltMessageSet = true;
          $rootScope.ultMessage = rejection;
        }
      };

      return {
        openUltMessage: openUltMessage,
      };
    },
  ]);
})();
(function () {
  'use strict';
  var app = angular.module('PatWebCoreV1');
  app.factory('CreditHoldHandlerService', [
    '$injector',
    'SoarConfig',
    '$q',
    '$timeout',
    '$location',
    function ($injector, soarConfig, $q, $timeout, $location) {
      var modalService, patSecurityService;
      var requestError = function (rejection) {
        return $q.reject(rejection);
      };
      var request = function (config) {
        if (!modalService) modalService = $injector.get('$uibModal');
        if (!patSecurityService)
          patSecurityService = $injector.get('patSecurityService');
        return config;
      };
      var response = function (resp) {
        return resp;
      };
      var responseError = function (rejection) {
        if (
          rejection &&
          rejection.config &&
          rejection.status == 403 &&
          rejection.data &&
          rejection.data.Title ===
            'Unauthorized due to current Practice is on Credit hold.'
        ) {
          $location.path('/PracticeOnCreditHold');
          window.setTimeout(function () {
            patSecurityService.logout();
            $location.path('/');
          }, 20000);
        } else {
          return $q.reject(rejection);
        }
      };
      return {
        request: request,
        requestError: requestError,
        response: response,
        responseError: responseError,
      };
    },
  ]);
  app.config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('CreditHoldHandlerService');
    },
  ]);
})();
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('ULTHandlerService', [
    '$injector',
    'SoarConfig',
    '$q',
    '$timeout',
    '$location',
    function ($injector, soarConfig, $q, $timeout, $location) {
      var modalService, patSecurityService, ultModalService;

      var request = function (config) {
        if (!modalService) {
          modalService = $injector.get('$uibModal');
        }
        return config;
      };
      var requestError = function (rejection) {
        return $q.reject(rejection);
      };
      var response = function (resp) {
        return resp;
      };
      var responseError = function (rejection) {
        if (
          rejection &&
          rejection.config &&
          rejection.status == 403 &&
          rejection.data &&
          rejection.data.Title ===
            'Unauthorized due to login times restriction.'
        ) {
          if (!patSecurityService) {
            patSecurityService = $injector.get('patSecurityService');
          }
          if (!ultModalService) {
            ultModalService = $injector.get('ULTModalService');
          }

          ultModalService.openUltMessage(rejection.data.Detail);
        } else {
          return $q.reject(rejection);
        }
      };

      return {
        request: request,
        requestError: requestError,
        response: response,
        responseError: responseError,
      };
    },
  ]);

  app.config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('ULTHandlerService');
    },
  ]);
})();

(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('practiceHeaderInterceptor', [
    '$injector',
    'platformSessionCachingService',
    function ($injector, platformSessionCachingService) {
      return {
        request: function ($config) {
          if ($config.noPatHeaders === true) {
            return $config;
          }

          if ($config.noPatHeaders === true || $config.firstTimeLoad) {
            return $config;
          }
          var practiceService = $injector.get('practiceService');
          var currentPractice = practiceService.getCurrentPractice();
          var practiceId = 0;
          if (currentPractice !== null) {
            practiceId = currentPractice.id;
          }
          var userContext = platformSessionCachingService.userContext.get();
          if (userContext !== null) {
            var user = userContext.Result.User;
            if (user.AccessLevel === 2) {
              practiceId = user.AccessLevelId;
            }
          }

          $config.headers['PAT-Practice-ID'] = practiceId;
          return $config;
        },
      };
    },
  ]);

  app.config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('practiceHeaderInterceptor');
    },
  ]);
})();
(function () {
  'use strict';
  var app = angular.module('PatWebCoreV1');
  app.directive('practiceSelector', function ($rootScope, practiceService) {
    var template =
      '<div ><div class="btn-group" dropdown keyboard-nav><button type="button" class="btn btn-primary" data-toggle="dropdown">{{selectedPracticeName}}<span class="caret"></span></button><ul class="dropdown-menu" role="menu"><li role="menuitem" ng-repeat="practice in practices | orderBy:-name"><a href="javascript:void(0)" ng-click="pickPractice(practice)">{{practice.name}}</a></li></ul></div></div>';
    return {
      scope: {
        practices: '@',
      },
      restrict: 'E',
      template: template,
      bindToController: true,
      controller: 'practiceSelectorController as $ctrl',
    };
  });
})();
(function () {
  angular
    .module('PatWebCoreV1')
    .controller(
      'practiceSelectorController',
      function ($scope, practiceService) {
        $scope.pickPractice = function (practice) {
          if (practice.name === $scope.selectedPracticeName) {
            return;
          }
          practiceService.selectPractice(practice);
          $scope.selectedPracticeName = practice.name;
        };

        var selectedPractice = practiceService.getCurrentPractice();
        if (selectedPractice) {
          $scope.selectedPracticeName = selectedPractice.name;
        } else {
          $scope.selectedPracticeName = 'Select item';
        }

        function getpractices() {
          practiceService.getPractices().then(function (practices) {
            $scope.practices = practices;
            $scope.selectedPracticeName = $scope.practices[0].name;
          });
        }

        getpractices();
      }
    );
})();
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('practiceService', [
    '$rootScope',
    '$filter',
    '$http',
    'uriService',
    '$q',
    'practicemodel',
    'locationService',
    'practiceImagingVendorService',
    'platformSessionService',
    '$injector',
    'tokenSyncService',
    'platformSessionCachingService',
    function (
      $rootScope,
      $filter,
      $http,
      uriService,
      $q,
      practicemodel,
      locationService,
      practiceImagingVendorService,
      platformSessionService,
      $injector,
      tokenSyncService,
      platformSessionCachingService
    ) {
      // DO NOT REMOVE - tokenSyncService -- it is needed by the consumers of webshell!
      // it broadcasts an event after the auth token is renewed informing other parties so they can grab a new token value
      // think signal-r hub connections

      function loadEnterprisePractices() {
        var def = $q.defer();
        var practiceUrl = uriService.getWebApiUri() + '/api/practices';

        $http({
          method: 'GET',
          url: practiceUrl,
          firstTimeLoad: true,
        })
          .then(function (res) {
            var practices = [];
            res.data.Result.forEach(function (item) {
              var p = practicemodel.build(
                item.PracticeId,
                item.Name,
                item.CustomerId,
                item.PrimaryContactName,
                item.PrimaryContactAddress1,
                item.PrimaryContactAddress2,
                item.PrimaryContactCity,
                item.PrimaryContactStateProvince,
                item.PrimaryContactPostalCode,
                item.PrimaryContactPhone1,
                item.PrimaryContactPhone2,
                item.SecondaryContactPhone1,
                item.MerchantId
              );
              practices.push(p);
            });
            def.resolve(practices);
          })
          .catch(function () {
            return $q.reject('error occurred.');
          });
        return def.promise;
      }

      function getPracticeWhenItIsNotSet() {
        var def = $q.defer();

        var userContext = platformSessionCachingService.userContext.get();
        if (userContext === null) {
          $q.reject('error occurred');
        }

        var user = userContext.Result.User;
        if (!user) {
          $q.reject('error occurred.');
        } else {
          var accessLevelId = user.AccessLevelId;

          if (accessLevelId === 0) {
            accessLevelId = userContext.Result.Access[0].Id;
          }

          $http
            .get(uriService.getWebApiUri() + '/api/locations/' + accessLevelId)
            .then(function (res) {
              var item = res.data.Result;
              var practiceUrl =
                uriService.getWebApiUri() + '/api/practices/' + item.PracticeId;
              $http
                .get(practiceUrl)
                .then(function (res) {
                  var value = res.data.Result;
                  var p = practicemodel.build(
                    value.PracticeId,
                    value.Name,
                    value.CustomerId,
                    value.PrimaryContactName,
                    value.PrimaryContactAddress1,
                    value.PrimaryContactAddress2,
                    value.PrimaryContactCity,
                    value.PrimaryContactStateProvince,
                    value.PrimaryContactPostalCode,
                    value.PrimaryContactPhone1,
                    value.PrimaryContactPhone2,
                    value.SecondaryContactPhone1,
                    value.MerchantId
                  );
                  def.resolve(p);
                })
                .catch(function () {
                  return $q.reject('error occurred.');
                });
            })
            .catch(function () {
              return $q.reject('error occurred.');
            });
        }
        return def.promise;
      }

      function getNonEnterpriseUserPractice() {
        var def = $q.defer();

        var userContext = platformSessionCachingService.userContext.get();
        if (userContext === null) {
          return $q.reject('error occurred');
        }

        var user = userContext.Result.User;
        if (!user) {
          return $q.reject('error occurred.');
        }

        var accessLevelId = user.AccessLevelId;

        if (accessLevelId === 0) {
          accessLevelId = userContext.Result.Access[0].Id;
        }
        var practices = [];

        $http({
          method: 'GET',
          url: uriService.getWebApiUri() + '/api/locations/' + accessLevelId,
          firstTimeLoad: true,
        })
          .then(function (res) {
            var item = res.data.Result;
            var practiceUrl =
              uriService.getWebApiUri() + '/api/practices/' + item.PracticeId;
            $http({
              method: 'GET',
              url: practiceUrl,
              firstTimeLoad: true,
            })
              .then(function (res) {
                var value = res.data.Result;
                var p = practicemodel.build(
                  value.PracticeId,
                  value.Name,
                  value.CustomerId,
                  value.PrimaryContactName,
                  value.PrimaryContactAddress1,
                  value.PrimaryContactAddress2,
                  value.PrimaryContactCity,
                  value.PrimaryContactStateProvince,
                  value.PrimaryContactPostalCode,
                  value.PrimaryContactPhone1,
                  value.PrimaryContactPhone2,
                  value.SecondaryContactPhone1,
                  value.MerchantId
                );
                practices.push(p);
                def.resolve(practices);
              })
              .catch(function () {
                return $q.reject('error occurred.');
              });
          })
          .catch(function () {
            return $q.reject('error occurred.');
          });

        return def.promise;
      }

      function getPracticeForPracticeUser() {
        var def = $q.defer();
        var userContext = platformSessionCachingService.userContext.get();
        if (
          userContext === null ||
          userContext.Result === null ||
          userContext.Result.User === null
        ) {
          return $q.reject('error occurred');
        } else {
          var practices = [];
          var practiceUrl =
            uriService.getWebApiUri() +
            '/api/practices/' +
            userContext.Result.User.AccessLevelId;

          $http({
            method: 'GET',
            url: practiceUrl,
            firstTimeLoad: true,
          })
            .then(function (res) {
              var item = res.data.Result;
              var p = practicemodel.build(
                item.PracticeId,
                item.Name,
                item.CustomerId,
                item.PrimaryContactName,
                item.PrimaryContactAddress1,
                item.PrimaryContactAddress2,
                item.PrimaryContactCity,
                item.PrimaryContactStateProvince,
                item.PrimaryContactPostalCode,
                item.PrimaryContactPhone1,
                item.PrimaryContactPhone2,
                item.SecondaryContactPhone1,
                item.MerchantId
              );
              practices.push(p);
              def.resolve(practices);
            })
            .catch(function () {
              return $q.reject('error occurred.');
            });
        }
        return def.promise;
      }

      var getPractices = function () {
        var def = $q.defer();
        if (
          $rootScope.patAuthContext.accessLevel === 'Enterprise' ||
          $rootScope.patAuthContext.accessLevel === 'RestrictedEnterprise'
        ) {
            loadEnterprisePractices().then(function (practices) {

                //console.log(practices[0]);

                var useSelectedPracticeId = $injector.get('ENABLE_SET_PracticeId_FROM_TOKEN');

                console.log('EnableSetPracticeIdFromToken: ' + useSelectedPracticeId);


                if (useSelectedPracticeId === 'true') {
                    var practice = practices.find(x => x.id == getPracticeIdByVapiToken());
                    if (!practice) {
                        practice = practices[0];
                    }
                    selectPractice(practice);
                } else {
                    //ir al primero del array siempre 
                    selectPractice(practices[0]);
                }

           

            def.resolve(practices);
          });
        } else if ($rootScope.patAuthContext.accessLevel === 'Practice') {
          getPracticeForPracticeUser().then(function (practices) {
            //console.log(practices[0]);
            selectPractice(practices[0]);

            def.resolve(practices);
          });
        } else {
          getNonEnterpriseUserPractice().then(function (practices) {
            //console.log(practices[0]);
            selectPractice(practices[0]);

            def.resolve(practices);
          });
        }

        return def.promise;
      };

      var getCurrentPractice = function () {
        return platformSessionService.getSessionStorage('userPractice');
      };

        var getPracticeIdByVapiToken = function (vapiToken) {
            return platformSessionService.getSessionStorage('practiceIdSelected');
        };

      function selectPractice(selectedPractice) {
        var current = platformSessionService.getSessionStorage('userPractice');

        if (selectedPractice != current) {
          platformSessionService.setSessionStorage(
            'userPractice',
            selectedPractice
          );

          //application won't run with out a locationId at least existing
          locationService.getAllLocations().then(
            function (locs) {
              platformSessionService.setSessionStorage('userLocation', locs[0]);
              platformSessionService.setSessionStorage('activeLocations', locs);
              $rootScope.$broadcast('patCore:initpractice');
              $rootScope.$broadcast('patCore:practiceAndLocationsLoaded');
            },
            function (data) {}
          );
        }
      }

      function selectPracticeById(practiceId) {
        var p = practicemodel.build(practiceId, p);

        platformSessionService.setSessionStorage('userPractice', p);
        $rootScope.$broadcast('patCore:initpractice');
      }

      return {
        getPractices: getPractices,
        getPracticeWhenItIsNotSet: getPracticeWhenItIsNotSet,
        selectPractice: selectPractice,
        getCurrentPractice: getCurrentPractice,
        selectPracticeById: selectPracticeById,
      };
    },
  ]);
})();
(function () {
  'use strict';
  var app = angular.module('PatWebCoreV1');
  app.factory('practicemodel', function () {
    function practicemodel(
      id,
      name,
      custID,
      contactName,
      address1,
      address2,
      city,
      stateProvince,
      postalCode,
      phone1,
      phone2,
      fax,
      merchantID,
      timezone
    ) {
      this.id = id;
      this.name = name;
      this.merchantID = merchantID;
      this.custID = custID;
      this.contactName = contactName;
      this.address1 = address1;
      this.address2 = address2;
      this.city = city;
      this.stateProvince = stateProvince;
      this.postalCode = postalCode;
      this.phone1 = phone1;
      this.phone2 = phone2;
      this.fax = fax;
      this.timezone = timezone;
    }

    practicemodel.build = function (
      id,
      name,
      custID,
      contactName,
      address1,
      address2,
      city,
      stateProvince,
      postalCode,
      phone1,
      phone2,
      fax,
      merchantID,
      timezone
    ) {
      return new practicemodel(
        id,
        name,
        custID,
        contactName,
        address1,
        address2,
        city,
        stateProvince,
        postalCode,
        phone1,
        phone2,
        fax,
        merchantID,
        timezone
      );
    };
    return practicemodel;
  });
})();
(function () {
  'use strict';

  angular.module('PatWebCoreV1').service('tokenSyncService', tokenSyncService);
  tokenSyncService.$inject = [
    '$rootScope',
    '$http',
    '$q',
    '$window',
    'IdmConfig',
    'uriService',
    'patAuthenticationService',
    'platformSessionService',
  ];

  function tokenSyncService(
    $rootScope,
    $http,
    $q,
    $window,
    IdmConfig,
    uriService,
    patAuthenticationService,
    platformSessionService
  ) {
    var eventMethod = $window.addEventListener
      ? 'addEventListener'
      : 'attachEvent';
    var eventer = $window[eventMethod];
    var messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';

    // Listen to message from child window --- code in generic OIDC ... onOAuthCallback
    // without this in upper environments the seeIfProviderIsReady call processes things before the token is returned causing issues loading components
    eventer(messageEvent, function (e) {
      if (e.data === 'Login Process Completed') {
        // broadcast letting people know the token had been updated.
        //var token = patAuthenticationService.getCachedToken();
        //if (token) {
        //    var cookie = 'access_token=' + token + '; path=/;';
        //    if (location.hostname !== 'localhost') {
        //        cookie += getCookieDomain();
        //    }
        //    document.cookie = cookie;
        //    $rootScope.$broadcast('authService:tokenRenewed', token);
        //}
      }
    });

    function getCookieDomain() {
      var temp = location.host.split('.').reverse();
      return 'domain=.' + temp[1] + '.' + temp[0];
    }
  }
})();
(function () {
  'use strict';
  angular.module('PatWebCoreV1').controller('manageSessionModalController', [
    '$scope',
    '$uibModalInstance',
    'Idle',
    function ($scope, $uibModalInstance, idle) {
      $scope.ok = function () {
        idle.watch();
        $uibModalInstance.close();
      };

      $scope.$on('patwebcore:idleEnd', function () {
        $uibModalInstance.close();
      });
    },
  ]);
})();
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('manageSession', [
    '$rootScope',
    'Idle',
    'patSecurityService',
    'monitorLogoutService',
    function ($rootScope, Idle, patSecurityService, monitorLogoutService) {
      function startIdle() {
        Idle.watch();
      }

      $rootScope.$on('IdleStart', function () {
        $rootScope.$emit('patwebcore:idleTimeout');
      });

      $rootScope.$on('IdleEnd', function () {
        $rootScope.$broadcast('patwebcore:idleEnd');
      });

      $rootScope.$on('IdleTimeout', function () {
        patSecurityService.logout();
      });

      if (window === window.parent) {
        // Only do this if we are in the root window - not a nested iframe
        // If logout is hit on another tab or window, logout this page
        // Otherwise the page will continue to operate as the logged out user
        // until the oauth bearer tokens expire
        monitorLogoutService.onExternalLogout(function () {
          patSecurityService.logout();
        });
      }

      return {
        startIdle: startIdle,
      };
    },
  ]);
})();
(function () {
  'use strict';
  var app = angular.module('PatWebCoreV1');

  app.directive('signature', function () {
    return {
      template:
        '<div ng-show="vm.isSignaturePageLoaded">' +
        '<div id="signature-pad" class="m-signature-pad" ng-show="!vm.isTopazRunning && !vm.isTopazProblem">' +
        '<div class="m-signature-pad--body">' +
        '<canvas id="mouse-touch-cnv" style="border:1px solid #000000;"></canvas>' +
        '</div>' +
        '<div class="m-signature-pad--footer">' +
        '<div class="description">Sign above with mouse or touchpad</div>' +
        '<button type="button" ng-click="vm.onSaveMouseTouch()" ng-show="vm.enableSave">Save</button>' +
        '<button type="button" ng-click="vm.onLoadMouseTouch()" ng-show="vm.enableLoad">Load</button>' +
        '<button type="button" ng-click="vm.onClearMouseTouch()">Clear</button>' +
        '<signature-file get-sig="vm.getMouseTouchSig" set-sig="vm.setMouseTouchSig" clear-sig="vm.clearMouseTouchSig"></signature-file>' +
        '</div>' +
        '</div>' +
        '<div id="topaz-signature" class="m-topaz-signature" ng-show="vm.isTopazRunning">' +
        '<div class="m-topaz-body">' +
        '<canvas id="topaz-cnv" name="topaz-cnv" width="500" height="100" style="border:1px solid #000000;"></canvas>' +
        '</div>' +
        '<div class="m-topaz-footer">' +
        '<button type="button" ng-click="vm.onSignTopaz()" ng-show="!vm.isSigningTopaz">Sign Topaz Pad</button>' +
        '<button type="button" ng-click="vm.onSaveTopaz()" ng-show="vm.enableSave && !vm.isTopazEmpty">Save</button>' +
        '<button type="button" ng-click="vm.onLoadTopaz()" ng-show="vm.enableLoad">Load</button>' +
        '<button type="button" ng-click="vm.onClearTopaz()">Clear</button>' +
        '</div>' +
        '</div>' +
        '<div id="topaz-problem" ng-show="vm.isTopazProblem">' +
        '<label>Unable to establish communication with Topaz SigWeb Tablet Service</label>' +
        '<button type="button" ng-click="vm.onLoad()">Retry</button>' +
        '</div>' +
        '</div>',
      restrict: 'E',
      scope: {
        sigWidth: '@',
        sigHeight: '@',
        sigType: '@',
        enableLoad: '=',
        enableSave: '=',
        loadSigData: '&',
        saveSigData: '&',
        clearSigData: '&',
      },
      controller: 'signatureDirectiveController',
      controllerAs: 'vm',
      bindToController: true,
      link: function (scope, elem, attrs, controller) {
        scope.$parent.clearSignature = function () {
          if (controller.isTopazRunning) {
            controller.onClearTopaz();
          } else {
            controller.onClearMouseTouch();
          }
        };
      },
    };
  });
})();
(function () {
  angular
    .module('PatWebCoreV1')
    .controller('signatureDirectiveController', function (topazTabletService) {
      var vm = this;
      vm.myImage = null;
      vm.isTopazProblem = false;
      vm.topazCanvas = document.getElementById('topaz-cnv');
      vm.topazCanvas.width = 500;
      vm.topazCanvas.height = 100;
      vm.isTopazEmpty = true;
      vm.mouseTouchCanvas = document.getElementById('mouse-touch-cnv');
      vm.mouseTouchPad = new SignaturePad(vm.mouseTouchCanvas);
      vm.isSignaturePageLoaded = false;

      vm.alertError = function (response) {
        toastr.options = { positionClass: 'toast-top-right' };
        toastr.error('Error! ' + response.statusText);
      };

      vm.onSignTopaz = function () {
        vm.topazCanvas.width = 500;
        vm.topazCanvas.height = 100;
        topazTabletService.SetJustifyMode(
          0,
          function () {
            topazTabletService.ClearTablet(vm.alertError);
            // when setting the tablet state to 1 (polling active), the return value is
            // an interval handle to the object making the calls, the 50 is the time between calls
            vm.tmr = topazTabletService.SetTabletState(
              1,
              vm.topazCanvas.getContext('2d'),
              100,
              vm
            );
            vm.isSigningTopaz = true;
          },
          vm.alertError
        );
      };

      vm.onResetTopazState = function () {
        if (vm.isSigningTopaz) {
          vm.topazCanvas.width = 500;
          vm.topazCanvas.height = 100;
          topazTabletService.ClearTablet(vm.alertError);
          // when setting the tablet state to 0 (polling off), the second value is expected to
          // be the interval handle.  This is HORRIBLE practice as the type is radically
          // different from the context expected when setting to state '1' but that's the way the
          // original javascript from topaz was written and since I have no clue why,
          // I left it alone just in case there WAS a reason I couldn't fathom.
          topazTabletService.SetTabletState(0, vm.tmr, 100, vm);
          vm.isSigningTopaz = false;
        }
      };

      vm.onDoneSigningTopaz = function () {
        vm.onResetTopazState();
      };

      vm.onClearTopaz = function () {
        if (vm.isTopazRunning) {
          vm.topazCanvas.width = 500;
          vm.topazCanvas.height = 100;
          topazTabletService.ClearTablet();

          var ctx = vm.topazCanvas.getContext('2d');
          ctx.fillStyle = 'rgba(0,0,0,0)';
          ctx.clearRect(0, 0, 500, 100);
          ctx.fillRect(0, 0, 500, 100);
          vm.isTopazEmpty = true;
          vm.enableSave = true;
          vm.isSigningTopaz = false;
          vm.clear();
        }
      };

      vm.onSaveTopaz = function () {
        if (vm.isTopazEmpty) {
          toastr.options = { positionClass: 'toast-top-right' };
          toastr.error('Please sign before saving.');
          return null;
        }
        vm.enableSave = false;
        vm.saveSigData({ data: vm.topazCanvas.toDataURL() });
      };

      vm.onLoadTopaz = function () {
        vm.loadSigData().then(
          function (response) {
            vm.myImage = new Image();
            vm.myImage.src = response.data;
            vm.myImage.onload = function () {
              vm.topazCanvas.width = vm.myImage.naturalWidth;
              vm.topazCanvas.height = vm.myImage.naturalHeight;
              vm.topazCanvas.getContext('2d').drawImage(vm.myImage, 0, 0);
            };
            vm.isTopazEmpty = false;
          },
          function (error) {
            toastr.options = { positionClass: 'toast-top-right' };
            toastr.error('Error loading file ' + error.statusText);
          }
        );
      };

      // Adjust canvas coordinate space taking into account pixel ratio,
      // to make it look crisp on mobile devices.
      // This also causes canvas to be cleared.
      vm.resizeMouseTouchCanvas = function () {
        // When zoomed out to less than 100%, for some very strange reason,
        // some browsers report devicePixelRatio as less than 1
        // and only part of the canvas is cleared then.
        var ratio = Math.max(window.devicePixelRatio || 1, 1);
        var myWidth = vm.sigWidth == 'undefined' ? 500 : vm.sigWidth;
        var myHeight = vm.sigHeight == 'undefined' ? 100 : vm.sigHeight;
        vm.mouseTouchCanvas.width = myWidth * ratio;
        vm.mouseTouchCanvas.height = myHeight * ratio;
        vm.mouseTouchCanvas.getContext('2d').scale(ratio, ratio);
      };

      vm.onClearMouseTouch = function () {
        vm.mouseTouchPad.clear();
        vm.enableSave = true;
        vm.clear();
      };

      vm.onSaveMouseTouch = function () {
        if (vm.mouseTouchPad.isEmpty()) {
          toastr.options = { positionClass: 'toast-top-right' };
          toastr.error('Please sign before saving.');
          return null;
        } else {
          vm.enableSave = false;
          vm.saveSigData({
            data: vm.mouseTouchPad.toDataURL('image/png', 1.0),
          });
        }
      };

      vm.onLoadMouseTouch = function () {
        vm.loadSigData().then(
          function (response) {
            (vm.myImage = new Image()), (vm.myImage.src = response.data);
            vm.myImage.onload = new (function () {
              vm.sigWidth = vm.myImage.naturalWidth;
              vm.sigHeight = vm.myImage.naturalHeight;
              vm.resizeMouseTouchCanvas();
            })();
            vm.mouseTouchPad.fromDataURL(response.data);
          },
          function (error) {
            toastr.options = { positionClass: 'toast-top-right' };
            toastr.error('Error loading file ' + error.statusText);
          }
        );
      };

      vm.setupSignature = function (flag) {
        vm.isTopazRunning = flag;
        if (flag) {
          vm.tmr = null;
          vm.isTopazProblem = false;
          vm.isSigningTopaz = false;

          window.onunload = window.onbeforeunload = vm.onResetTopazState;
        } else {
          if (vm.sigType == 'Topaz') {
            vm.isTopazProblem = true;
          } else {
            window.onresize = vm.resizeMouseTouchCanvas;
            vm.resizeMouseTouchCanvas();
          }
        }
        vm.isSignaturePageLoaded = true;
      };

      vm.onLoad = function () {
        if (vm.sigType == 'MouseTouch') {
          vm.isTopazRunning = false;
          window.onresize = vm.resizeMouseTouchCanvas;
          vm.resizeMouseTouchCanvas();
          vm.isSignaturePageLoaded = true;
        } else {
          vm.isTopazRunning = undefined;
          topazTabletService.TabletConnectQuery(vm.setupSignature);
        }
      };

      vm.$onInit = function () {
        window.onload = vm.onLoad();
      };

      vm.clear = function () {
        if (vm.clearSigData) {
          vm.clearSigData();
        }
      };
    });
})();
(function () {
  'use strict';

  var app = angular.module('PatWebCoreV1');

  app.factory('topazTabletService', [
    '$rootScope',
    '$q',
    '$http',
    'TOPAZ_URL',
    function ($rootScope, $q, $http, TOPAZ_URL) {
      var getBlobURL =
        (window.URL && URL.createObjectURL.bind(URL)) ||
        (window.webkitURL && webkitURL.createObjectURL.bind(webkitURL)) ||
        window.createObjectURL;
      var revokeBlobURL =
        (window.URL && URL.revokeObjectURL.bind(URL)) ||
        (window.webkitURL && webkitURL.revokeObjectURL.bind(webkitURL)) ||
        window.revokeObjectURL;

      var baseUri = TOPAZ_URL;
      var ctx;
      var caller;

      function isIE() {
        return (
          navigator.appName == 'Microsoft Internet Explorer' ||
          (navigator.appName == 'Netscape' &&
            new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})').exec(
              navigator.userAgent
            ) != null)
        );
      }

      function isChrome() {
        var ua = navigator.userAgent;
        var chrome = false;

        //Javascript Browser Detection - Chrome
        if (ua.lastIndexOf('Chrome/') > 0) {
          //var version = ua.substr(ua.lastIndexOf('Chrome/') + 7, 2);
          return true;
        } else {
          return false;
        }
      }

      var Count = false;

      function SigWebSetProperty(prop, continueFn, errFn) {
        $http({
          method: 'POST',
          url: baseUri + prop,
          noPatHeaders: true,
        }).then(
          function (response) {
            if (continueFn != null) continueFn(response);
          },
          function (response) {
            if (errFn != null) errFn(response);
          }
        );
      }

      function SigWebGetProperty(prop, errFn) {
        var defVal = $q.defer();
        $http({
          method: 'GET',
          url: baseUri + prop,
          noPatHeaders: true,
        }).then(
          function (response) {
            defVal.resolve(response.data);
          },
          function (response) {
            toastr.options = { positionClass: 'toast-top-right' };
            toastr.error(prop + ' failed! - ' + response.statusText);
          }
        );
        return defVal.promise;
      }

      function SigWebSetDisplayTarget(obj) {
        ctx = obj;
      }

      var NumPointsLastTime = 0;

      function SigWebRefresh() {
        $http({
          method: 'GET',
          url: baseUri + 'TotalPoints',
          noPatHeaders: true,
        }).then(function (response) {
          var NumPoints = response.data;
          if (NumPoints != NumPointsLastTime) {
            if (NumPoints > NumPointsLastTime) {
              if (caller) {
                caller.isTopazEmpty = false;
              }
            }
            NumPointsLastTime = NumPoints;
            $http({
              method: 'GET',
              url: baseUri + 'SigImage/0',
              responseType: 'blob',
              noPatHeaders: true,
            }).then(function (response) {
              var img = new Image();
              img.src = getBlobURL(response.data);
              img.onload = function () {
                ctx.drawImage(img, 0, 0);
                revokeBlobURL(this.src);
                img = null;
              };
            });
          }
        });
      }

      //
      //
      //
      //
      //
      //
      //			Start of dll method wrappers
      //
      //
      //			SigPlusNETSig.cs
      //
      function ClearTablet(errFn) {
        var Prop = 'ClearSignature';

        Prop = Prop;
        return SigWebGetProperty(Prop, errFn);
      }

      function NumberOfTabletPoints(errFn) {
        var Prop = 'TotalPoints';

        Prop = Prop;
        return SigWebGetProperty(Prop, errFn);
      }

      function SetJustifyMode(v, continueFn, errFn) {
        var Prop = 'JustifyMode/';

        Prop = Prop + v;
        SigWebSetProperty(Prop, continueFn, errFn);
      }

      //
      //		SigPlusNETDisplay.cs
      //
      function SetDisplayXSize(v, continueFn, errFn) {
        var Prop = 'DisplayXSize/';

        Prop = Prop + v;
        SigWebSetProperty(Prop, continueFn, errFn);
      }

      function SetDisplayYSize(v, continueFn, errFn) {
        var Prop = 'DisplayYSize/';

        Prop = Prop + v;
        SigWebSetProperty(Prop, continueFn, errFn);
      }

      //
      //		SigPlusNETLCD.cs
      //

      function SetRealTabletState(v, continueFn, errFn) {
        var Prop = 'TabletState/';

        Prop = Prop + v;
        SigWebSetProperty(Prop, continueFn, errFn);
      }

      function GetTabletState(errFn) {
        var Prop = 'TabletState';

        Prop = Prop;
        return SigWebGetProperty(Prop, errFn);
      }

      function TabletConnectQuery(setupFn) {
        return $http({
          method: 'GET',
          url: baseUri + 'TabletConnectQuery',
          noPatHeaders: true,
        }).then(
          function (response) {
            setupFn(true);
          },
          function (response) {
            setupFn(false);
          }
        );
      }

      function SetTabletState(v, ctx, tv, cll) {
        var delay;

        if (cll) {
          caller = cll;
        }

        if (tv) {
          delay = tv;
        } else {
          delay = 100;
        }

        if (GetTabletState() != v) {
          if (v == 1) {
            if (ctx) {
              var can = ctx.canvas;
              SetDisplayXSize(can.width);
              SetDisplayYSize(can.height);
              SigWebSetDisplayTarget(ctx);
            }
            SetRealTabletState(v);
            if (ctx) {
              var tmr = setInterval(SigWebRefresh, delay);
            } else {
              var tmr = null;
            }

            return tmr;
          } else {
            if (ctx) {
              clearInterval(ctx);
            }
            SigWebSetDisplayTarget(null);
            SetRealTabletState(v);
          }
        }
        return null;
      }

      return {
        ClearTablet: ClearTablet,
        SetTabletState: SetTabletState,
        NumberOfTabletPoints: NumberOfTabletPoints,
        SetJustifyMode: SetJustifyMode,
        TabletConnectQuery: TabletConnectQuery,
      };
    },
  ]);
})();
