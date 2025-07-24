'use strict';

// parts are renamed to stages
// Define Services
angular.module('Soar.Patient').service('ImagingUtilities', [
  '$window',
  '$http',
  '$q',
  'ImagingMasterService',
  'ImagingProviders',
  function ($window, $http, $q, imagingMasterService, imagingProviders) {
    var translateImageToDataUrl = function (image) {
      var binary = '';
      var bytes = new Uint8Array(image);
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return $window.btoa(binary);
    };

    var getExternalImageAsDataUrl = function (image) {
      var deferred = $q.defer();
      var filegetUri =
        '_fileapiurl_/api/files/content/' + image.FileAllocationId;
      var config = {
        headers: { Accept: 'application/octet-stream' },
        responseType: 'arraybuffer',
      };
      $http.get(filegetUri, config).then(
        function (res) {
          if (res.data) {
            deferred.resolve({
              imageId: image.ImageId,
              data: translateImageToDataUrl(res.data),
            });
          }
        },
        function () {
          deferred.reject();
        }
      );
      return deferred.promise;
    };

    var getImageAsDataUrl = function (imageId, provider, patientId) {
      var deferred = $q.defer();

      imagingMasterService
        .getImageThumbnailByImageId(imageId, provider, patientId, 'jpg')
        .then(function (res) {
          if (res && res.success && res.result) {
            if (provider === imagingProviders.Blue) {
              deferred.resolve({
                imageId: imageId,
                data: translateImageToDataUrl(res.result),
              });
            } else {
              let thumbnailUrl = res.result;
              $http.get(thumbnailUrl, { responseType: 'arraybuffer' }).then(
                function (res) {
                  if (res.data) {
                    deferred.resolve({
                      imageId: imageId,
                      data: translateImageToDataUrl(res.data),
                    });
                  }
                },
                function () {
                  deferred.reject();
                }
              );
            }
          } else {
            deferred.reject();
          }
        });

      return deferred.promise;
    };

    var retrieveImagesForExam = function (exam) {
      var deferred = $q.defer();
      var promises = [];
      if (exam.Description && exam.Description === 'Sidexis Exam') {
        _.forEach(exam.Series, function (series) {
          angular.forEach(series.Images, function (image) {
            promises.push(getExternalImageAsDataUrl(image));
          });
        });
      } else {
        angular.forEach(exam.Series, function (series) {
          angular.forEach(series.Images, function (image) {
            promises.push(
              getImageAsDataUrl(image.Id, exam.Provider, exam.Patient)
            );
          });
        });
      }

      $q.all(promises).then(
        function (results) {
          var dictionary = {};
          angular.forEach(results, function (result) {
            dictionary[result.imageId] = 'data:image/png;base64,' + result.data;
          });
          deferred.resolve(dictionary);
        },
        function () {
          deferred.reject();
        }
      );

      return deferred.promise;
    };

    return {
      retrieveImagesForExam: retrieveImagesForExam,
    };
  },
]);
