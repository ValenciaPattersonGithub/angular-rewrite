'use strict';

var app = angular.module('Soar.BusinessCenter');
app.controller('DocumentGroupsCrudController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'localize',
  'patSecurityService',
  'ModalFactory',
  'DocumentGroupsFactory',
  '$location',
  function (
    $scope,
    $timeout,
    toastrFactory,
    localize,
    patSecurityService,
    modalFactory,
    documentGroupsFactory,
    $location
  ) {
    var ctrl = this;

    ctrl.$onInit = function () {
      $scope.formIsValid = true;
      $scope.saving = false;
      $scope.dataHasChanged = false;
      // NOTE at some point these may need to be dynamic if we also can edit groups
      $scope.pageTitle = localize.getLocalizedString('Document Group Name');
      $scope.actionText = localize.getLocalizedString('Enter a {0} ', [
        'Document Group Name',
      ]);

      $scope.originalDescription = $scope.documentGroupDto.Description;

      $scope.authAccess = documentGroupsFactory.access();
      if (!$scope.authAccess.View) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-doc-docorg-vgroup'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      }
    };

    //#region handle cancel

    // reset data
    $scope.resetData = function () {
      $scope.cancelChanges();
    };

    $scope.cancelChanges = function () {
      $scope.documentGroupDto.Description = $scope.originalDescription;
      if ($scope.cancel) {
        $scope.dataHasChanged = false;
        $scope.cancel();
      }
    };

    // confirm cancel if changes
    $scope.cancelListChanges = function () {
      if ($scope.dataHasChanged === true) {
        modalFactory.CancelModal().then($scope.cancelChanges, function () {});
      } else {
        $scope.cancelChanges();
      }
    };

    //#endregion

    //#region validation

    ctrl.validateForm = function () {
      $scope.formIsValid = true;
      if (
        !$scope.documentGroupDto.Description ||
        !$scope.documentGroupDto.Description.length > 0
      ) {
        $scope.formIsValid = false;
      }

      // check to see if name is duplicate and set $scope.duplicateNameError based on that
      _.forEach($scope.documentGroups, function (documentGroup) {
        if (
          documentGroup.Description === $scope.documentGroupDto.Description &&
          (_.isNil($scope.documentGroupDto.DocumentGroupId) ||
            documentGroup.DocumentGroupId !==
              $scope.documentGroupDto.DocumentGroupId)
        ) {
          $scope.duplicateNameError = true;
          $scope.formIsValid = false;
        }
      });
      ctrl.setFocusOnElement();
      return $scope.formIsValid;
    };

    // reset focus
    ctrl.setFocusOnElement = function () {
      if (
        $scope.frmDocumentGroupCrud.inpDocumentGroupDescription.$valid == false
      ) {
        $timeout(function () {
          angular.element('#inpDocumentGroupDescription').focus();
        }, 0);
        return true;
      }
    };

    //#endregion

    //#region documentGroup crud

    // if save error is because name is duplicate, suppress error message and show inline error message
    // otherwise just show standard failure message
    ctrl.handleErrorOnSave = function (msg) {
      var nameIsDuplicate = _.find(
        msg.data.InvalidProperties,
        function (invalidProperty) {
          return (
            invalidProperty.PropertyName ===
            'DocumentGroup.DocumentGroup_PracticeId_Description_Unique'
          );
        }
      );
      if (nameIsDuplicate) {
        // duplicate name error
        $scope.formIsValid = false;
        $scope.duplicateNameError = true;
      } else {
        // default message
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to save the {0} {1}. Please try again.',
            ['Document Group', $scope.documentGroupDto.Description]
          ),
          localize.getLocalizedString('Server Error')
        );
      }
    };

    $scope.saveDocumentGroup = function (documentGroupDto) {
      // check auth
      var isCreate = _.isNil(documentGroupDto.DocumentGroupId);
      var auth = isCreate ? $scope.authAccess.Create : $scope.authAccess.Edit;
      if (auth) {
        if (ctrl.validateForm()) {
          $scope.saving = true;
          documentGroupsFactory.SaveDocumentGroup(documentGroupDto).then(
            function (res) {
              var documentGroup = res.Value;
              // update list
              $scope.saving = false;
              if ($scope.savedDocumentGroup) {
                $scope.savedDocumentGroup(
                  documentGroup,
                  isCreate
                    ? documentGroupsFactory.Actions.Create
                    : documentGroupsFactory.Actions.Update
                );
              }
            },
            function (msg) {
              ctrl.handleErrorOnSave(msg);
              $scope.saving = false;
            }
          );
        }
      }
    };

    //#endregion

    $scope.$watch('documentGroupDto.Description', function (nv, ov) {
      if (nv && nv != ov && nv.length > 0) {
        $scope.duplicateNameError = false;
        $scope.dataHasChanged = true;
      } else {
        $scope.dataHasChanged = false;
      }
    });

    //#endregion
  },
]);
