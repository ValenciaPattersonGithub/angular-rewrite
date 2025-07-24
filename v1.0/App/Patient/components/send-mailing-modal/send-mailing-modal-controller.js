'use strict';

angular.module('common.controllers').controller('SendMailingModalController', [
  '$scope',
  '$uibModalInstance',
  'item',
  'PatientServices',
  '$filter',
  '$rootScope',
  function ($scope, mInstance, item, patientServices, $filter, $rootScope) {
    var ctrl = this;
    $scope.item = item;
    $scope.selected = false;
    $scope.templateSource = [];
    $scope.checked = false;

    $rootScope.isPrintMailingLabel = $scope.checked;
    $scope.close = function () {
      mInstance.dismiss();
    };
    $scope.disabled = true;

    $rootScope.communicationTemplateId = null;
    $scope.communicationType = [
      { Id: 1, Name: 'US Mail Template' },
      { Id: 4, Name: 'Post Card Template' },
      { Id: 3, Name: 'Mailing Labels Only' },
    ];

    $scope.communicationTypeIdChanged = function (newValue) {
      if (!$rootScope.communicationTemplateId || newValue == '') {
        $rootScope.communicationTemplateId = null;
        $scope.communicationTemplateId = null;
        $scope.disabled = true;
      }
      //if (newValue == 4) {
      //    $rootScope.communicationTemplateId = null;
      //    $scope.communicationTemplateId = null;
      //    $scope.disabled = false;
      //}
      $scope.commTypeId = newValue;
      $rootScope.communicationTypeId = $scope.commTypeId;
      $rootScope.isPostcard =
        $scope.commTypeId == 4 || $scope.commTypeId == '4';
      $scope.groupId = $filter('filter')(
        $scope.categorySource,
        { tab: $scope.item.ActiveFltrTab },
        true
      )[0].id;
      $scope.patient = '00000000-0000-0000-0000-000000000000';

      var params = {
        Id: $scope.patient,
        mediaTypeId: $scope.commTypeId,
        GroupId: $scope.groupId,
      };
      patientServices.Communication.getTemplatesByGroupId(params).$promise.then(
        getTemplatesByGroupSuccess,
        getTemplatesByGroupFailure
      );
    };
    $scope.templateIdChanged = function (newValue) {
      $rootScope.communicationTemplateId = newValue;

      $scope.selected = false;

      if (
        newValue != '' &&
        ($scope.commTypeId == 1 || $scope.commTypeId == 4)
      ) {
        $scope.selected = true;
        $scope.disabled = false;
      } else {
        $rootScope.communicationTemplateId = null;
      }
    };

    var getTemplatesByGroupSuccess = function (res) {
      $scope.templateSource = [];
      angular.forEach(res.Value, function (val) {
        var item = {
          CommunicationTemplateId: val.CommunicationTemplateId,
          TemplateName: val.TemplateName,
        };
        $scope.templateSource.push(item);
      });

      // $rootScope.communicationTemplateId = $scope.templateSource[0].CommunicationTemplateId;
    };
    var getTemplatesByGroupFailure = function (res) {};

    $scope.categorySource = [
      { id: 1, tab: '0', name: 'Account' },
      { id: 3, tab: '2', name: 'Patient' },
      { id: 2, tab: '1', name: 'Appointments' },
      { id: 5, tab: '5', name: 'Other To Do' },
      { id: 4, tab: '7', name: 'Preventive Care' },
      { id: 5, tab: '6', name: 'Treatment Plans' },
    ];
    $scope.confirm = function () {
      var patientIds = [];

      $rootScope.isPrintMailingLabel = $scope.checked;
      mInstance.close(true);
    };
  },
]);
