'use strict';
angular.module('Soar.Patient').controller('letterTemplatePreviewController', [
  '$scope',
  '$uibModal',
  '$rootScope',
  'PatientServices',
  'toastrFactory',
  'localize',
  'ListHelper',
  '$filter',
  function (
    $scope,
    $uibModal,
    $rootScope,
    patientServices,
    toastrFactory,
    localize,
    listHelper,
    $filter
  ) {
    var $ctrl = this;
    $ctrl.uibModal = $uibModal;

    $scope.templateName = $scope.$parent.templateName;
    $scope.letterTemplate = $scope.$parent.letterTemplate;
    $scope.previewOnly = $scope.$parent.previewOnly;
    $scope.phones = $scope.$parent.phones;
    $scope.sendDisabled = false;
    $scope.patientEmailAddresses = $scope.$parent.patientEmailAddresses;
    $scope.patientName = $scope.$parent.patientName;
    $scope.selectedMediaTypeId = $scope.$parent.selectedMediaTypeId;

    $ctrl.setupEmailAddress = function () {
      _.each($scope.patientEmailAddresses, function (emailObj) {
        emailObj.IsSelected = emailObj.IsPrimary;
      });
    };

    $ctrl.setupEmailAddress();

    if (!$scope.previewOnly) {
      if ($scope.$parent.CommunicationTypeId === '5') {
        $scope.printSaveName = 'Print & Save';
      } else if ($scope.$parent.CommunicationTypeId === '6') {
        $scope.printSaveName = 'Save and Send';
      } else if ($scope.$parent.CommunicationTypeId === '7') {
        $scope.printSaveName = 'Send';
      }
      //$scope.printSaveName = $scope.$parent.CommunicationTypeId === '6' ? "Save and Send" : "Print & Save";
      $scope.closeButtonName = 'Cancel';
    } else {
      $scope.printSaveName = 'Print';
      $scope.closeButtonName = 'Close';
      $scope.templateName = $scope.$parent.templateTitle;
    }

    $scope.closePreview = function () {
      $rootScope.$broadcast('closePreviewModal', false);
    };

    $scope.printAndSave = function () {
      if (
        $scope.$parent.selectedMediaTypeId === 2 ||
        $scope.$parent.selectedMediaTypeId === 3
      ) {
        $rootScope.$broadcast(
          'saveUSMailCommunication',
          $scope.patientEmailAddresses
        );
      } else {
        var myWindow = window.open('', '', 'width=800,height=500');
        myWindow.document.write($scope.letterTemplate);

        myWindow.document.close();
        myWindow.focus();
        myWindow.print();
        myWindow.close();

        if (!$scope.previewOnly)
          $rootScope.$broadcast('saveUSMailCommunication', false);
      }
    };

    $ctrl.checkPhoneNumber = function () {
      if ($scope.$parent.selectedMediaTypeId === 2) {
        $scope.buttonTooltip = 'No cell number exists for patient';
        if (
          $filter('filter')($scope.phones, { Type: 'Mobile' }, true).length > 0
        ) {
          $scope.sendDisabled = false;
        } else {
          $scope.sendDisabled = true;
        }
      } else if ($scope.$parent.selectedMediaTypeId === 3) {
        $scope.sendDisabled = false;
        if ($scope.$parent.isActivePatient) {
          if ($scope.patientEmailAddresses.length === 0) {
            $scope.sendDisabled = true;
            $scope.buttonTooltip = 'This patient has no set email address';
          }
        } else {
          $scope.sendDisabled = true;
          $scope.buttonTooltip = 'Cannot send email to an inactive patient';
        }
      }
    };

    $scope.onEmailChange = function () {
      $scope.noSelectedEmail = false;
      if (
        $filter('filter')(
          $scope.patientEmailAddresses,
          { IsSelected: true },
          true
        ).length === 0
      ) {
        $scope.noSelectedEmail = true;
      } else {
        $scope.noSelectedEmail = false;
      }
    };

    $ctrl.checkPhoneNumber();
  },
]);
