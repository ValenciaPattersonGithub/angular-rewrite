'use strict';

var app = angular.module('Soar.BusinessCenter');
var ServiceButtonsCrudController = app.controller(
  'ServiceButtonsCrudController',
  [
    '$scope',
    '$uibModalInstance',
    'ModalFactory',
    'ServiceButtons',
    'ListHelper',
    '$filter',
    'ServiceButton',
    'ServiceButtonsService',
    'toastrFactory',
    'localize',
    'patSecurityService',
    '$location',
    function (
      $scope,
      $uibModalInstance,
      modalFactory,
      serviceButtons,
      listHelper,
      $filter,
      serviceButton,
      serviceButtonsService,
      toastrFactory,
      localize,
      patSecurityService,
      $location
    ) {
      var ctrl = this;

      $scope.serviceButton = serviceButton;
      $scope.serviceButtons = serviceButtons;

      $scope.editMode = $scope.serviceButton.ServiceButtonId ? true : false;
      $scope.currentlySaving = false;
      $scope.formIsValid = true;

      ctrl.originalServiceButton = angular.copy($scope.serviceButton);

      //#region  Authorization
      $scope.soarAuthServiceButtonAddKey = 'soar-biz-svcbtn-add';
      $scope.soarAuthServiceButtonEditKey = 'soar-biz-svcbtn-edit';
      $scope.hasAddOrEditAccess = false;

      // Check if user has access to view this area
      ctrl.authAddAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthServiceButtonAddKey
        );
      };

      // Check if user has access to view this area
      ctrl.authEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.soarAuthServiceButtonEditKey
        );
      };

      // Check user access for different actions available on screen
      ctrl.authAccess = function () {
        if ($scope.editMode) {
          $scope.hasAddOrEditAccess = ctrl.authEditAccess();
        } else {
          $scope.hasAddOrEditAccess = ctrl.authAddAccess();
        }

        if (!$scope.hasAddOrEditAccess) {
          ctrl.notifyNotAuthorized();
          $location.path('/');
        }
      };

      ctrl.authAccess();

      //Notify user, he is not authorized to access current area
      ctrl.notifyNotAuthorized = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'User is not authorized to access this area.'
          ),
          localize.getLocalizedString('Not Authorized')
        );
      };
      //#endregion

      // validation method
      ctrl.validateForm = function () {
        if (
          $scope.frmServiceButtonCrud.inpDescription.$error.required ||
          $scope.frmServiceButtonCrud.inpDescription.$error.duplicate
        ) {
          $scope.formIsValid = false;
        } else {
          $scope.formIsValid = true;
        }
      };

      // listening for description required error to disabled/enable the button2 accordingly
      $scope.$watch(
        'frmServiceButtonCrud.inpDescription.$error.required',
        function (nv, ov) {
          if (nv === true) {
            $scope.requiredFieldError = true;
          } else {
            $scope.requiredFieldError = false;
          }
        }
      );

      // checking to see if the new description is already in the existing type or material list
      $scope.$watch('serviceButton.Description', function (nv, ov) {
        if (nv) {
          var item = listHelper.findItemByFieldValueIgnoreCase(
            $scope.serviceButtons,
            'Description',
            nv
          );

          if (!item) {
            $scope.frmServiceButtonCrud.inpDescription.$error.duplicate = false;
          } else if (
            item.ServiceButtonId === ctrl.originalServiceButton.ServiceButtonId
          ) {
            $scope.frmServiceButtonCrud.inpDescription.$error.duplicate = false;
          } else {
            $scope.frmServiceButtonCrud.inpDescription.$error.duplicate = true;
          }
        } else {
          $scope.frmServiceButtonCrud.inpDescription.$error.duplicate = false;
        }
      });

      // done button handler
      $scope.save = function () {
        if ($scope.hasAddOrEditAccess) {
          ctrl.validateForm();
          if ($scope.formIsValid) {
            $scope.currentlySaving = true;
            if ($scope.editMode) {
              serviceButtonsService.update(
                $scope.serviceButton,
                ctrl.serviceButtonsUpdateSuccess,
                ctrl.serviceButtonsUpdateFailure
              );
            } else {
              serviceButtonsService.save(
                $scope.serviceButton,
                ctrl.serviceButtonsSaveSuccess,
                ctrl.serviceButtonsSaveFailure
              );
            }
          }
        } else {
          ctrl.notifyNotAuthorized();
        }
      };

      // Success callback for update service button
      ctrl.serviceButtonsUpdateSuccess = function (res) {
        var msg = 'Update successful.';
        ctrl.serviceButtonAddUpdateSuccess(res, msg);
      };

      // Error callback for update service button
      ctrl.serviceButtonsUpdateFailure = function (res) {
        var msg = 'Update was unsuccessful. Please retry your save.';
        ctrl.serviceButtonAddUpdateFailure(res, msg);
      };

      // Success callback for save service button
      ctrl.serviceButtonsSaveSuccess = function (res) {
        var msg = 'Your {0} has been created.';
        ctrl.serviceButtonAddUpdateSuccess(res, msg);
      };

      // Error callback for save service button
      ctrl.serviceButtonsSaveFailure = function (res) {
        var msg = 'There was an error and your {0} was not created.';
        ctrl.serviceButtonAddUpdateFailure(res, msg);
      };

      // type or material add/update success handler
      ctrl.serviceButtonAddUpdateSuccess = function (res, msg) {
        toastrFactory.success(
          localize.getLocalizedString(msg, ['Service Button']),
          localize.getLocalizedString('Success')
        );
        $scope.currentlySaving = false;
        $uibModalInstance.close(res);
      };

      // type or material add/update failure handler
      ctrl.serviceButtonAddUpdateFailure = function (res, msg) {
        toastrFactory.error(
          localize.getLocalizedString(msg),
          localize.getLocalizedString('Server Error')
        );
        $scope.currentlySaving = false;
      };

      // cancel button handler for modal window
      $scope.cancel = function () {
        if (angular.equals($scope.serviceButton, ctrl.originalServiceButton)) {
          $uibModalInstance.close(null);
        } else {
          modalFactory.CancelModal().then(ctrl.confirmCancel);
        }
      };

      // process cancel confirmation
      ctrl.confirmCancel = function () {
        $uibModalInstance.close(null);
      };
    },
  ]
);
