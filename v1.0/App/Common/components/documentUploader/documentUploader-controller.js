'use strict';

angular.module('common.controllers').controller('DocumentUploaderController', [
  '$scope',
  '$timeout',
  'patSecurityService',
  'soarAnimation',
  'PatientDocumentsFactory',
  'localize',
  '$routeParams',
  function (
    $scope,
    $timeout,
    patSecurityService,
    soarAnimation,
    patientDocumentsFactory,
    localize,
    $routeParams
  ) {
    $scope.$watch('openUploader', function (nv, ov) {
      if (nv === true) {
        patientDocumentsFactory.selectedFilter = $scope.documentFilter;
        $scope.openDocUploader();
        $scope.openUploader = false;
      }
    });

    $scope.onUpLoadSuccess = function (doc) {
      $scope.docCtrls.close();
    };

    $scope.onUpLoadCancel = function () {
      $scope.docCtrls.close();
    };

    $scope.personId = $routeParams.patientId;
    $scope.openDocUploader = function () {
      $scope.docCtrls.content(
        '<doc-uploader [patient-id]="personId" (upload-cancel)="onUpLoadCancel($event)" (upload-success)="onUpLoadSuccess($event)"><doc-uploader>'
      );
      $scope.docCtrls.setOptions({
        resizable: false,
        position: {
          top: '20%',
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
  },
]);
