'use strict';
angular.module('Soar.Patient').controller('PatientGroupTypeController', [
  '$scope',
  'localize',
  '$routeParams',
  '$timeout',
  'toastrFactory',
  'GroupTypeService',
  'PatientServices',
  'ListHelper',
  function (
    $scope,
    localize,
    $routeParams,
    $timeout,
    toastrFactory,
    groupTypeService,
    patientServices,
    listHelper
  ) {
    $scope.groupTypeList = [];
    $scope.patientGroupType = null;

    //#region Patient Group Types

    $scope.getPatientGroupTypes = function () {
      patientServices.GroupTypes.get(
        { Id: $routeParams.patientId },
        $scope.patientGroupTypesServiceGetSuccess,
        $scope.patientGroupTypesServiceGetFailure
      );
    };
    $scope.patientGroupTypesServiceGetSuccess = function (res) {
      $scope.patientGroupTypes = res.Value;
      $scope.filterGroupTypes();
    };
    $scope.patientGroupTypesServiceGetFailure = function () {
      $scope.patientGroupTypes = [];
      toastrFactory.error(
        'Patient group types failed to load.',
        'Server Error'
      );
    };

    $scope.getPatientGroupTypes();

    //#endregion

    // get master groupTypeList
    $scope.getGroupTypes = function () {
      groupTypeService.get(
        $scope.groupTypeServiceGetSuccess,
        $scope.groupTypeServiceGetFailure
      );
    };
    $scope.groupTypeServiceGetSuccess = function (res) {
      $scope.groupTypeList = res.Value;
      $scope.filterGroupTypes();
    };
    $scope.groupTypeServiceGetFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString('Group types failed to load.'),
        localize.getLocalizedString('Server Error')
      );
    };
    $scope.getGroupTypes();

    $scope.formIsValid = false;

    //#region validate required and any attributes
    $scope.validatePanel = function (nv, ov) {
      //if (nv && ov !== nv) {
      //    $scope.formIsValid = true
      //};
      //$scope.panelConfig.valid = $scope.formIsValid;
    };

    $scope.$watch(
      'patientGroupType',
      function (nv, ov) {
        if (nv && ov !== nv) {
          $scope.addPatientGroupType($scope.patientGroupType);
        }
      },
      true
    );

    // Validate
    $scope.$watch(
      'patientGroupTypes',
      function (nv, ov) {
        $scope.validatePanel(nv, ov);
      },
      true
    );
    //#endregion

    $scope.addPatientGroupType = function (e) {
      var params = {
        PatientId: $routeParams.patientId,
        MasterGroupId: $scope.patientGroupType,
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
      $scope.filterGroupTypes();
      $scope.patientGroupType = null;
    };
    $scope.patientGroupTypesServiceCreateFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error adding your patient group type.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    // delete patient group type
    $scope.removePatientGroupType = function (index, groupType) {
      $scope.deleteMode = true;
      $scope.groupTypeToDelete = groupType;
      $scope.indexToRemove = index;
    };

    $scope.groupTypesAreEqual = function (groupType, patientGroup) {
      return (
        (!groupType && !patientGroup) ||
        (groupType &&
          patientGroup &&
          groupType.GroupTypeId == patientGroup.MasterGroupId)
      );
    };

    $scope.confirmRemove = function () {
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
      $scope.exitDeleteMode();
      $scope.filterGroupTypes();
      $scope.patientGroupType = null;
    };
    $scope.patientGroupTypesServiceDeleteFailure = function () {
      toastrFactory.error(
        localize.getLocalizedString(
          'There was an error removing your patient group type.'
        ),
        localize.getLocalizedString('Server Error')
      );
    };

    $scope.exitDeleteMode = function () {
      $scope.deleteMode = false;
      $scope.groupTypeToDelete = null;
      $scope.indexToRemove = -1;
    };

    $scope.filteredGroupTypes = [];
    $scope.filterGroupTypes = function () {
      $scope.filteredGroupTypes = new kendo.data.ObservableArray([]);
      angular.forEach($scope.groupTypeList, function (val, key) {
        var groupType = angular.copy(
          listHelper.findItemByFieldValue(
            $scope.patientGroupTypes,
            'MasterGroupId',
            val.MasterPatientGroupId
          )
        );
        if (!groupType) {
          $scope.filteredGroupTypes.push(val);
        }
      });
    };
  },
]);
