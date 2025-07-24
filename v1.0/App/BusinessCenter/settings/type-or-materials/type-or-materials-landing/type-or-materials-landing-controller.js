'use strict';

var app = angular.module('Soar.BusinessCenter');
var TypeOrMaterialsLandingController = app.controller(
  'TypeOrMaterialsLandingController',
  [
    '$scope',
    'localize',
    'patSecurityService',
    '$location',
    'TypeOrMaterials',
    'TypeOrMaterialsService',
    'ListHelper',
    'ModalFactory',
    'toastrFactory',
    function (
      $scope,
      localize,
      patSecurityService,
      $location,
      typeOrMaterials,
      typeOrMaterialsService,
      listHelper,
      modalFactory,
      toastrFactory
    ) {
      var ctrl = this;

      // #region AMFA codes

      ctrl.viewTypeOrMaterialAuthAbbrev = 'soar-biz-typmat-view';
      $scope.addTypeOrMaterialAuthAbbrev = 'soar-biz-typmat-add';
      $scope.editTypeOrMaterialAuthAbbrev = 'soar-biz-typmat-edit';
      $scope.deleteTypeOrMaterialAuthAbbrev = 'soar-biz-typmat-delete';

      // #endregion

      $scope.loadingList = true;
      $scope.filteringList = false;
      $scope.filteringMessageNoResults = localize.getLocalizedString(
        'There are no {0} that match the filter.',
        ['Type / Materials']
      );
      $scope.loadingMessageNoResults = localize.getLocalizedString(
        'There are no {0}.',
        ['Type / Materials']
      );

      ctrl.typeOrMaterialMarkedForDeletion = null;

      // getting the type/materials from the resolve
      $scope.typeOrMaterials = [];
      if (typeOrMaterials.Value) {
        $scope.typeOrMaterials = typeOrMaterials.Value;
        $scope.loadingList = false;
      }

      // ensure that only one modal can open at once
      $scope.modalIsOpen = false;
      // instantiate add/edit modal and pass data to it, etc.
      $scope.addOrEditTypeOrMaterial = function (typeOrMaterialSelected) {
        var hasAddOrEditAccess = false;
        if (typeOrMaterialSelected) {
          hasAddOrEditAccess = ctrl.authEditAccess();
        } else {
          hasAddOrEditAccess = ctrl.authAddAccess();
        }

        if (hasAddOrEditAccess) {
          if ($scope.modalIsOpen == false) {
            $scope.modalIsOpen = true;

            var typeOrMaterial;
            if (!typeOrMaterialSelected) {
              typeOrMaterial = {
                TypeOrMaterialId: '',
                Description: '',
              };
            } else {
              typeOrMaterial = angular.copy(typeOrMaterialSelected);
            }

            var modalInstance = modalFactory.Modal({
              templateUrl:
                'App/BusinessCenter/settings/type-or-materials/type-or-materials-crud/type-or-materials-crud.html',
              controller: 'TypeOrMaterialsCrudController',
              windowClass: 'modal-65',
              backdrop: 'static',
              amfa: !typeOrMaterialSelected
                ? $scope.addTypeOrMaterialAuthAbbrev
                : $scope.editTypeOrMaterialAuthAbbrev,
              resolve: {
                TypeOrMaterial: function () {
                  return typeOrMaterial;
                },
                TypeOrMaterials: function () {
                  return $scope.typeOrMaterials;
                },
              },
            });
            modalInstance.result.then(ctrl.typeOrMaterialEditedOrAdded);
          }
        } else {
          ctrl.notifyNotAuthorized();
        }
      };

      // modal is done
      ctrl.typeOrMaterialEditedOrAdded = function (
        typeOrMaterialReturnedFromModal
      ) {
        ctrl.typeOrMaterialReturnedFromModal = typeOrMaterialReturnedFromModal;
        $scope.modalIsOpen = false;
        // if we don't get back a type/material from the modal, there was no create/update, no need to refresh the list
        if (typeOrMaterialReturnedFromModal) {
          typeOrMaterialsService.get(
            ctrl.typeOrMaterialGetSuccess,
            ctrl.typeOrMaterialGetFailure
          );
        }
        ctrl.typeOrMaterialReturnedFromModal = null;
      };

      // success handler
      ctrl.typeOrMaterialGetSuccess = function (res) {
        if (res.Value) {
          // refreshing the list on successful get all, should have new/updated type/material
          $scope.typeOrMaterials = res.Value;
        }
      };

      // Error handler
      ctrl.typeOrMaterialGetFailure = function (res) {
        // manually updating the type/materials list if get all fails
        var index = listHelper.findIndexByFieldValue(
          $scope.typeOrMaterials,
          'TypeOrMaterialId',
          ctrl.typeOrMaterialReturnedFromModal.Value.TypeOrMaterialId
        );
        if (index !== -1) {
          $scope.typeOrMaterials[index] =
            ctrl.typeOrMaterialReturnedFromModal.Value;
        } else {
          $scope.typeOrMaterials.push(
            ctrl.typeOrMaterialReturnedFromModal.Value
          );
        }
      };

      // instantiate delete modal, etc.
      $scope.deleteTypeOrMaterial = function (typeOrMaterialSelected) {
        if (ctrl.authDeleteAccess()) {
          ctrl.typeOrMaterialMarkedForDeletion = typeOrMaterialSelected;
          modalFactory
            .DeleteModal(
              'Type / Material',
              typeOrMaterialSelected.Description,
              true,
              'This type / material will be deleted from all service codes.'
            )
            .then(ctrl.confirmDelete, ctrl.cancelDelete);
        } else {
          ctrl.notifyNotAuthorized();
        }
      };

      // make call to api for deletion
      ctrl.confirmDelete = function () {
        var params = {};
        params.typeOrMaterialId =
          ctrl.typeOrMaterialMarkedForDeletion.TypeOrMaterialId;
        typeOrMaterialsService.delete(
          params,
          ctrl.typeOrMaterialDeletionSuccess,
          ctrl.typeOrMaterialDeletionFailure
        );
      };

      // success handler
      ctrl.typeOrMaterialDeletionSuccess = function (res) {
        toastrFactory.success(
          localize.getLocalizedString('Delete successful.'),
          localize.getLocalizedString('Success')
        );
        $scope.typeOrMaterials.splice(
          listHelper.findIndexByFieldValue(
            $scope.typeOrMaterials,
            'TypeOrMaterialId',
            ctrl.typeOrMaterialMarkedForDeletion.TypeOrMaterialId
          ),
          1
        );
        ctrl.typeOrMaterialMarkedForDeletion = null;
      };

      // failure handler
      ctrl.typeOrMaterialDeletionFailure = function (res) {
        toastrFactory.error(
          localize.getLocalizedString(
            'Failed to delete the {0}. Please try again.',
            ['type / material']
          ),
          localize.getLocalizedString('Server Error')
        );
        ctrl.typeOrMaterialMarkedForDeletion = null;
      };

      // un-mark type/material for deletion
      ctrl.cancelDelete = function () {
        ctrl.typeOrMaterialMarkedForDeletion = null;
      };

      // #region sorting

      // scope variable that holds ordering details
      $scope.orderBy = {
        field: 'Description',
        asc: true,
      };

      // function to apply orderBy functionality
      $scope.changeSortingForGrid = function (field) {
        var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
        $scope.orderBy = {
          field: field,
          asc: asc,
        };
      };

      // #endregion

      // #region authorization

      // Check view type or material access
      ctrl.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          ctrl.viewTypeOrMaterialAuthAbbrev
        );
      };

      // Check add type or material access
      ctrl.authAddAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.addTypeOrMaterialAuthAbbrev
        );
      };

      // Check edit type or material access
      ctrl.authEditAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.editTypeOrMaterialAuthAbbrev
        );
      };

      // Check delete type or material access
      ctrl.authDeleteAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          $scope.deleteTypeOrMaterialAuthAbbrev
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

      // Check if user have view access for type or material, if not notify user
      ctrl.authAccess = function () {
        if (!ctrl.authViewAccess()) {
          ctrl.notifyNotAuthorized();
          $location.path('/');
        }
      };

      ctrl.authAccess();

      // #endregion

      //#region filter

      $scope.filteredTypeOrMaterials = $scope.TypeOrMaterials;

      // contains filter
      $scope.filterBy = '';
      $scope.typeOrMaterialsFilter = function (item) {
        var filter = $scope.filterBy;
        filter = filter.toLowerCase();
        if (
          (item.Description &&
            item.Description.toLowerCase().indexOf(filter) != -1) ||
          filter.length == 0
        ) {
          return true;
        }
        return false;
      };

      $scope.$watch(
        'filterBy',
        function (nv) {
          $scope.filteringList = true;
        },
        true
      );

      //#endregion
    },
  ]
);

TypeOrMaterialsLandingController.resolveTypeOrMaterials = {
  TypeOrMaterials: [
    'TypeOrMaterialsService',
    function (typeOrMaterialsService) {
      return typeOrMaterialsService.get().$promise;
    },
  ],
};
