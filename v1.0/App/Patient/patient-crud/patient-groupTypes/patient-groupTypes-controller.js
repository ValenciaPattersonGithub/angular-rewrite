'use strict';

angular.module('Soar.Patient').controller('PatientGroupTypesController', [
  '$scope',
  '$routeParams',
  '$filter',
  '$location',
  'localize',
  '$timeout',
  'toastrFactory',
  'PatientServices',
  'GroupTypeService',
  function (
    $scope,
    $routeParams,
    $filter,
    $location,
    localize,
    $timeout,
    toastrFactory,
    patientServices,
    groupTypeService
  ) {
    $scope.editMode = $routeParams.patientId ? true : false;
    $scope.groupTypeList = [];
    $scope.patientGroupTypes = [];
    $scope.patientGroupType = {};

    // groupTypeList
    $scope.getGroupTypes = function () {
      groupTypeService.get(
        $scope.groupTypeServiceGetSuccess,
        $scope.groupTypeServiceGetFailure
      );
    };
    $scope.groupTypeServiceGetSuccess = function (res) {
      $scope.groupTypeList = res.Value;
    };
    $scope.groupTypeServiceGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Group types failed to load.'),
        localize.getLocalizedString('Server Error')
      );
    };

    // patient groupTypes
    $scope.getPatientGroupTypes = function () {
      patientServices.GroupTypes.get(
        { Id: $routeParams.patientId },
        $scope.patientGroupTypesServiceGetSuccess,
        $scope.patientGroupTypesServiceGetFailure
      );
    };
    $scope.patientGroupTypesServiceGetSuccess = function (res) {
      $scope.patientGroupTypes = res.Value;
    };
    $scope.patientGroupTypesServiceGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Patient group types failed to load.'),
        localize.getLocalizedString('Server Error')
      );
    };

    if ($scope.editMode) {
      // get group types
      $scope.getGroupTypes();

      // get patient's group types
      $scope.getPatientGroupTypes();
    }

    // save patient group type

    $scope.AddPatientGroupType = function (groupType) {
      var params = {
        PatientId: $routeParams.patientId,
        MasterGroupId: groupType.GroupTypeId,
        Description: groupType.GroupTypeName,
      };
      params.Id = $routeParams.patientId;

      patientServices.GroupTypes.create(
        params,
        $scope.patientGroupTypesServiceCreateSuccess,
        $scope.patientGroupTypesServiceCreateFailure
      );
    };

    $scope.patientGroupTypesServiceCreateSuccess = function (res) {
      toastrFactory.success(
        localize.getLocalizedString('Your patient group type has been added.'),
        localize.getLocalizedString('Success')
      );
      $scope.patientGroupTypes.push(res.Value);
    };
    $scope.patientGroupTypesServiceCreateFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error adding your patient group type.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };
    //#endregion

    // delete patient group type
    $scope.RemovePatientGroupType = function (index, groupType) {
      $scope.deleteMode = true;
      $scope.groupTypeToDelete = groupType;
      $scope.indexToRemove = index;
    };

    $scope.GroupTypesAreEqual = function (groupType, patientGroup) {
      return (
        (!groupType && !patientGroup) ||
        (groupType &&
          patientGroup &&
          groupType.GroupTypeId == patientGroup.MasterGroupId)
      );
    };

    $scope.ConfirmRemove = function () {
      patientServices.GroupTypes.delete(
        {
          Id: $scope.groupTypeToDelete.PatientId,
          PatientGroupTypeId: $scope.groupTypeToDelete.PatientGroupId,
        },
        function () {
          $scope.patientGroupTypesServiceDeleteSuccess();
        },
        $scope.patientGroupTypesServiceDeleteFailure
      );
    };
    $scope.patientGroupTypesServiceDeleteSuccess = function (alert) {
      toastrFactory.success(
        localize.getLocalizedString(
          'Your patient group type has been removed.'
        ),
        localize.getLocalizedString('Success')
      );
      $scope.patientGroupTypes.splice($scope.indexToRemove, 1);
      $scope.ExitDeleteMode();
    };
    $scope.patientGroupTypesServiceDeleteFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error removing your patient group type.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    $scope.ExitDeleteMode = function () {
      $scope.deleteMode = false;
      $scope.groupTypeToDelete = null;
      $scope.indexToRemove = -1;
    };
  },
]);
