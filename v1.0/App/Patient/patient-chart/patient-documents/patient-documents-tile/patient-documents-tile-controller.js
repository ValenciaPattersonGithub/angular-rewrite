'use strict';
angular.module('Soar.Patient').controller('PatientDocumentsTileController', [
  '$scope',
  '$http',
  'tabLauncher',
  '$sce',
  '$window',
  'patSecurityService',
  'toastrFactory',
  'localize',
  'DocumentsLoadingService',
  '$filter',
  'FormsDocumentsFactory',
  function (
    $scope,
    $http,
    tabLauncher,
    $sce,
    $window,
    patSecurityService,
    toastrFactory,
    localize,
    documentsLoadingService,
    $filter,
    formsDocumentsFactory
  ) {
    var ctrl = this;
    var filegetUri = '_fileapiurl_/api/files/content/';
    $scope.title = '';
    $scope.truncatedTitle = '';
    $scope.truncatedName = '';

    //#region Authorization
    ctrl.soarAuthClinicalDocumentsViewKey = 'soar-doc-docimp-view';
    ctrl.soarAuthClinicalDocumentsAddKey = 'soar-doc-docimp-add';

    $scope.hasClinicalDocumentsAddAccess = false;
    $scope.hasClinicalDocumentsViewAccess = false;

    // Check if logged in user has view access to patient notes
    ctrl.authAddAccessToDocuments = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        ctrl.soarAuthClinicalDocumentsAddKey
      );
    };
    ctrl.authViewAccessToDocuments = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        ctrl.soarAuthClinicalDocumentsViewKey
      );
    };

    // Check view access for time-line items
    ctrl.authAccess = function () {
      if (ctrl.authViewAccessToDocuments()) {
        $scope.hasClinicalDocumentsViewAccess = true;
      }

      if (ctrl.authAddAccessToDocuments()) {
        $scope.hasClinicalDocumentsAddAccess = true;
      }
    };

    // Check view access for time-line items
    ctrl.authAccess();

    // #end region

    // Handle the addition of subGroups
    ctrl.setDocumentTitle = function () {
      if ($scope.patientDocument.$$subGroup) {
        $scope.title = $scope.patientDocument.$$subGroup;
        $scope.truncatedTitle = $filter('truncate')(
          $scope.patientDocument.$$subGroup,
          30
        );
      } else {
        $scope.title = $scope.patientDocument.recordType;
        $scope.truncatedTitle = $filter('truncate')(
          $scope.patientDocument.recordType,
          30
        );
      }

      $scope.truncatedName = $filter('truncate')(
        $scope.patientDocument.record.Name,
        30
      );
    };
    ctrl.setDocumentTitle();

    // would rather do this with a bound function but this is nested inside the kendo 'content' object of a kendo window,
    // it appears to create its own scope and breaks the binding
    $scope.edit = function (document, event) {
      if (document.$$EditingDisabled !== true) {
        $scope.$emit(
          'soar:edit-document-properties',
          document.DocumentId,
          true,
          document.ParentId
        );
      }
      event.stopPropagation();
      $window.event.cancelBubble;
    };

    $scope.openDocument = function (item) {
      $scope.Download(item);
    };

    $scope.Download = function (item) {
      var targetUri = filegetUri + item.FileAllocationId;
      ctrl.window = {};
      documentsLoadingService.executeDownload(targetUri, item, ctrl.window);
      ctrl.updateRecentDocuments(item);
    };

    // store recently viewed documents

    // Update recent documents
    ctrl.updateRecentDocuments = function (doc) {
      if ($scope.hasClinicalDocumentsAddAccess) {
        formsDocumentsFactory.UpdateRecentDocuments(doc).then(function (res) {
          $scope.recentDocsList = res;
        });
      }
    };
  },
]);
