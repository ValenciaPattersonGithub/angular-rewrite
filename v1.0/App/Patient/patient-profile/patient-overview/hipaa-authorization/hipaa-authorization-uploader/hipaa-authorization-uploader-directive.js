'use strict';

angular
  .module('Soar.Patient')
  .directive('hipaaAuthorizationUploader', function () {
    return {
      restrict: 'E',
      scope: {
        close: '&',
      },
      templateUrl:
        'App/Patient/patient-profile/patient-overview/hipaa-authorization/hipaa-authorization-uploader/hipaa-authorization-uploader.html',
      controller: 'HipaaAuthorizationUploaderController',
    };
  });
