'use strict';

var app = angular.module('Soar.BusinessCenter');
var TypeOrMaterialsCrudController = app.controller(
  'TypeOrMaterialsCrudController',
  [
    '$scope',
    '$uibModalInstance',
    'ModalFactory',
    'TypeOrMaterials',
    'ListHelper',
    'TypeOrMaterial',
    'TypeOrMaterialsService',
    'toastrFactory',
    'localize',
    'patSecurityService',
    '$location',
    function (
      $scope,
      $uibModalInstance,
      modalFactory,
      typeOrMaterials,
      listHelper,
      typeOrMaterial,
      typeOrMaterialsService,
      toastrFactory,
      localize,
      patSecurityService,
      $location
    ) {
      var ctrl = this;

      $scope.typeOrMaterial = typeOrMaterial;
      $scope.typeOrMaterials = typeOrMaterials;

      $scope.editMode = $scope.typeOrMaterial.TypeOrMaterialId ? true : false;
      $scope.currentlySaving = false;
      $scope.formIsValid = true;

      ctrl.originalTypeOrMaterial = angular.copy($scope.typeOrMaterial);

      // #region authorization

      $scope.hasAddOrEditAccessToTypeOrMaterial = false;
      ctrl.addTypeOrMaterialAuthAbbrev = 'soar-biz-typmat-add';
      ctrl.editTypeOrMaterialAuthAbbrev = 'soar-biz-typmat-edit';

      // Check add type or material access
      ctrl.authAddAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          ctrl.addTypeOrMaterialAuthAbbrev
        );
      };

      // Check edit type or material access
      ctrl.authEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          ctrl.editTypeOrMaterialAuthAbbrev
        );
      };

      // Notify user is not authorized
      ctrl.notifyNotAuthorized = function () {
        toastrFactory.error(
          localize.getLocalizedString(
            'User is not authorized to access this area.'
          ),
          localize.getLocalizedString('Not Authorized')
        );
      };

      // Check add/edit access for type or material
      ctrl.authAccess = function () {
        if ($scope.editMode) {
          if (ctrl.authEditAccess()) {
            $scope.hasAddOrEditAccessToTypeOrMaterial = true;
          }
        } else {
          if (ctrl.authAddAccess()) {
            $scope.hasAddOrEditAccessToTypeOrMaterial = true;
          }
        }

        // Notify user when add/edit access is not present
        if (!$scope.hasAddOrEditAccessToTypeOrMaterial) {
          ctrl.notifyNotAuthorized();
          $location.path('/');
        }
      };

      ctrl.authAccess();

      // #endregion

      // validation method
      ctrl.validateForm = function () {
        if (
          $scope.frmTypeOrMaterialCrud.inpDescription.$error.required ||
          $scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate
        ) {
          $scope.formIsValid = false;
        } else {
          $scope.formIsValid = true;
        }
      };

      // listening for description required error to disabled/enable the button2 accordingly
      $scope.$watch(
        'frmTypeOrMaterialCrud.inpDescription.$error.required',
        function (nv, ov) {
          if (nv === true) {
            $scope.requiredFieldError = true;
          } else {
            $scope.requiredFieldError = false;
          }
        }
      );

      // checking to see if the new description is already in the existing type or material list
      $scope.$watch('typeOrMaterial.Description', function (nv, ov) {
        if (nv) {
          var item = listHelper.findItemByFieldValueIgnoreCase(
            $scope.typeOrMaterials,
            'Description',
            nv
          );
          if (!item) {
            $scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate = false;
          } else if (
            item.TypeOrMaterialId ===
            ctrl.originalTypeOrMaterial.TypeOrMaterialId
          ) {
            $scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate = false;
          } else {
            $scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate = true;
          }
        } else {
          $scope.frmTypeOrMaterialCrud.inpDescription.$error.duplicate = false;
        }
      });

      // done button handler
      $scope.save = function () {
        if ($scope.hasAddOrEditAccessToTypeOrMaterial) {
          ctrl.validateForm();
          if ($scope.formIsValid) {
            $scope.currentlySaving = true;
            if ($scope.editMode) {
              typeOrMaterialsService.update(
                $scope.typeOrMaterial,
                function (res) {
                  var msg = 'Update successful.';
                  ctrl.typeOrMaterialAddUpdateSuccess(res, msg);
                },
                function (res) {
                  var msg = 'Update was unsuccessful. Please retry your save.';
                  ctrl.typeOrMaterialAddUpdateFailure(res, msg);
                }
              );
            } else {
              typeOrMaterialsService.save(
                $scope.typeOrMaterial,
                function (res) {
                  var msg = 'Your {0} has been created.';
                  ctrl.typeOrMaterialAddUpdateSuccess(res, msg);
                },
                function (res) {
                  var msg = 'There was an error and your {0} was not created.';
                  ctrl.typeOrMaterialAddUpdateFailure(res, msg);
                }
              );
            }
          }
        } else {
          ctrl.notifyNotAuthorized();
        }
      };

      // type or material add/update success handler
      ctrl.typeOrMaterialAddUpdateSuccess = function (res, msg) {
        toastrFactory.success(
          localize.getLocalizedString(msg, ['Type / Material']),
          localize.getLocalizedString('Success')
        );
        $scope.currentlySaving = false;
        $uibModalInstance.close(res);
      };

      // type or material add/update failure handler
      ctrl.typeOrMaterialAddUpdateFailure = function (res, msg) {
        toastrFactory.error(
          localize.getLocalizedString(msg, ['Type / Material']),
          localize.getLocalizedString('Server Error')
        );
        $scope.currentlySaving = false;
      };

      // cancel button handler
      $scope.cancel = function () {
        if (
          angular.equals($scope.typeOrMaterial, ctrl.originalTypeOrMaterial)
        ) {
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
