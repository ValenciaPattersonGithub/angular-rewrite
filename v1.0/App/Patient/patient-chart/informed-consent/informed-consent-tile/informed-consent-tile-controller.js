'use strict';
angular.module('Soar.Patient').controller('InformedConsentTileController', [
  '$scope',
  'patSecurityService',
  'toastrFactory',
  'localize',
  'InformedConsentFactory',
  'FormsDocumentsFactory',
  'InformedConsentMessageService',
  function (
    $scope,
    patSecurityService,
    toastrFactory,
    localize,
    informedConsentFactory,
    formsDocumentsFactory,
    informedConsentMessageService
  ) {
    var vm = this;

    //#region Authorization
    $scope.access = informedConsentMessageService.access();

    // #end region

    $scope.viewInformedConsent = function (item) {
      if ($scope.access.View) {
        informedConsentFactory.view(item).then(function (res) {
          formsDocumentsFactory.UpdateRecentDocuments(item);
        });
      } else {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-biz-icmsg-view'),
          'Not Authorized'
        );
      }
    };
  },
]);
