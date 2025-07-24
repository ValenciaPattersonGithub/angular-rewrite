'use strict';

angular.module('Soar.BusinessCenter').controller('GroupTypeCrudController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'GroupTypeFactory',
  'GroupTypeService',
  'localize',
  'patSecurityService',
  function (
    $scope,
    $timeout,
    toastrFactory,
    groupTypeFactory,
    groupTypeService,
    localize,
    patSecurityService
  ) {
    $scope.hasErrors = false;
    $scope.isDuplicate = false;

    // initialize empty alert for create
    $scope.groupTypes = [];
    $scope.groupType = null;

    $scope.initGroupType = function () {
      $scope.groupType = {
        GroupTypeId: null,
        GroupTypeName: null,
      };
    };
    $scope.initGroupType();

    $scope.initPage = function () {
      $scope.groupTypeId = null;
      $scope.initGroupType();
      $scope.editMode = false;
      $scope.editing = false;
      $scope.hasErrors = false;
      $scope.isDuplicate = false;
    };

    // Determine if we are in edit or create mode
    $scope.editing = $scope.groupTypeId ? true : false;

    $scope.$watch(
      'groupTypeId',
      function (nv, ov) {
        if (nv) {
          $scope.getGroupType();
        }
        if (nv != null) {
          $timeout(angular.element('#inpGroupTypeName').focus(), 0);
        }
      },
      true
    );

    // TODO Authorization
    //#region Authorization
    //#endregion

    //#region get master list
    // Method to get the master list
    $scope.getGroupTypes = function () {
      groupTypeService.get(
        $scope.groupTypesGetSuccess,
        $scope.groupTypesGetFailure
      );
    };

    $scope.groupTypesGetSuccess = function (res) {
      // indicate we are getting the list
      $scope.loading = false;
      $scope.groupTypes = res.Value;
    };

    $scope.groupTypesGetFailure = function () {
      $scope.loading = false;
      $scope.groupTypes = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of group types. Refresh the page to try again.'
        ),
        localize.getLocalizedString('Error')
      );
    };
    $scope.getGroupTypes();
    //#endregion

    // Get the master alert from the factory
    $scope.getGroupType = function () {
      if ($scope.groupTypeId) {
        $scope.editing = true;
        $scope.groupType = groupTypeFactory.get();
        if ($scope.groupType.GroupTypeId == null) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the patient group type. Refresh the page to try again.'
            ),
            localize.getLocalizedString('Error')
          );
        }
      }
    };
    $scope.getGroupType();

    // Build instance
    $scope.buildInstance = function (currentGroupType) {
      $scope.backupGroupType = JSON.stringify(currentGroupType);
    };
    $scope.buildInstance($scope.groupType);

    // Revert groupType if changes are not saved.
    $scope.discardChanges = function () {
      $scope.confirmingDiscard = false;
      $scope.initPage();
    };

    // confirm discard
    $scope.confirmingDiscard = false;
    $scope.confirmDiscard = function () {
      $scope.confirmingDiscard = true;
    };

    // cancel discard
    $scope.cancelDiscard = function () {
      $scope.confirmingDiscard = false;
    };

    // Check for a duplicate alert
    $scope.checkForDuplicates = function (groupType) {
      $scope.frmGroupTypeCrud.inpGroupTypeName.$setValidity(
        'uniqueGroupTypeName',
        true
      );
      $scope.isDuplicate = false;
      for (var i = 0; i < $scope.groupTypes.length; i++) {
        if (
          $scope.groupTypes[i].GroupTypeName.toLowerCase() ==
          groupType.GroupTypeName.toLowerCase()
        ) {
          $scope.isDuplicate = true;
          $scope.formIsValid = false;
          $scope.frmGroupTypeCrud.inpGroupTypeName.$setValidity(
            'uniqueGroupTypeName',
            false
          );
        }
      }
      return null;
    };

    $scope.formIsValid = true;
    // validate required and any attributes
    $scope.validateForm = function (nv, ov) {
      $scope.formIsValid = false;
      if (nv && ov !== nv) {
        $scope.checkForDuplicates(nv);
        if (nv.GroupTypeName) {
          $scope.formIsValid = !(
            nv.GroupTypeName === null ||
            nv.GroupTypeName.length == 0 ||
            $scope.isDuplicate == true
          );
        }
      }
    };

    // Watch the data, if any changes validate and enable/disable save
    $scope.$watch(
      'groupType',
      function (nv, ov) {
        $scope.validateForm(nv, ov);
      },
      true
    );

    //#region save group type
    $scope.saveGroupType = function () {
      // disable buttons while saving
      $scope.savingGroupType = true;
      // check for errors
      $scope.hasErrors = !$scope.formIsValid;

      if (!$scope.hasErrors) {
        if ($scope.editing == true) {
          // update
          groupTypeService.update(
            $scope.groupType,
            function (res) {
              $scope.groupTypeUpdateSuccess(res);
            },
            $scope.groupTypeUpdateFailure()
          );
        } else {
          // insert
          groupTypeService.save(
            $scope.groupType,
            function (res) {
              $scope.groupTypeSaveSuccess(res);
            },
            $scope.groupTypeSaveFailure
          );
        }
      } else {
        // enable button after save
        $scope.savingGroupType = false;
      }
    };

    $scope.groupTypeUpdateSuccess = function (res) {
      toastrFactory.success(
        localize.getLocalizedString('Update {0}.', ['successful']),
        localize.getLocalizedString('Success')
      );
      // replace the edited alert in list
      $scope.types.splice($scope.types.indexOf($scope.groupType), 1);
      $scope.types.push(res.Value);
      // reset
      $scope.initPage();
      // enable button after save
      $scope.savingGroupType = false;
    };

    $scope.groupTypeUpdateFailure = function () {
      //error on update
      toastrFactory.error(
        localize.getLocalizedString(
          'Update was unsuccessful. Please retry your save.'
        ),
        localize.getLocalizedString('Server Error')
      );
      // enable button after save
      $scope.savingGroupType = false;
    };

    $scope.groupTypeSaveSuccess = function (res) {
      toastrFactory.success(
        localize.getLocalizedString(
          'Your patient group type has been created.'
        ),
        localize.getLocalizedString('Success')
      );
      $scope.types.push(res.Value);
      // reset
      $scope.initPage();
      // enable button after save
      $scope.savingGroupType = false;
    };

    $scope.groupTypeSaveFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error and your patient group type was not created.'
        ),
        localize.getLocalizedString('Server Error')
      );
      // enable button after save
      $scope.savingGroupType = false;
    };

    //#endregion

    $scope.$watch(
      'editMode',
      function (nv, ov) {
        if (nv) {
          $scope.getGroupTypes();
        }
      },
      true
    );
  },
]);
