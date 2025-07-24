'use strict';
angular.module('Soar.Patient').controller('PatientConditionTileController', [
  '$scope',
  '$rootScope',
  '$filter',
  '$routeParams',
  'ModalFactory',
  'UsersFactory',
  'PatientServices',
  'PatientOdontogramFactory',
  'PatientServicesFactory',
  'patSecurityService',
  'ListHelper',
  'localize',
  'PatientConditionsFactory',
  'soarAnimation',
  'toastrFactory',
  function (
    $scope,
    $rootScope,
    $filter,
    $routeParams,
    modalFactory,
    usersFactory,
    patientServices,
    patientOdontogramFactory,
    patientServicesFactory,
    patSecurityService,
    listHelper,
    localize,
    patientConditionsFactory,
    soarAnimation,
    toastrFactory
  ) {
    var ctrl = this;
    $scope.conditionEdited = null;
    $scope.showEllipsesMenu = false;
    $scope.canEditCondition = true;
    $scope.canDeleteCondition = true;
    $scope.editToolTip = '';
    $scope.deleteToolTip = '';
    $scope.conditions = [];
    $scope.conditionStatus = '';

    ctrl.$onInit = function onInit() {
      $scope.patientCondition.truncatedDescription = $filter('truncate')(
        $scope.patientCondition.Description,
        30
      );

      switch ($scope.patientCondition.StatusId) {
        case 1:
          $scope.conditionStatus = 'Present';
          break;
        case 2:
          $scope.conditionStatus = 'Resolved';
          break;
        default:
          $scope.conditionStatus = '';
          break;
      }

      if ($scope.patientCondition.PatientId !== $routeParams.patientId) {
        $scope.canEditCondition = false;
        $scope.canDeleteCondition = false;
        $scope.editToolTip = localize.getLocalizedString(
          'Cannot edit a condition for a duplicate patient.'
        );
        $scope.deleteToolTip = localize.getLocalizedString(
          'Cannot delete a condition for a duplicate patient.'
        );
      }
    };

    $scope.editCondition = editCondition;
    function editCondition(condition) {
      $scope.canEditCondition = patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-cpsvc-edit'
      );

      if ($scope.canEditCondition) {
        $scope.conditionEdited = condition;
        ctrl.initializePatientConditionCreateUpdate();
      }
    }

    $scope.deleteCondition = deleteCondition;
    function deleteCondition(condition) {
      $scope.canDeleteCondition = patSecurityService.IsAuthorizedByAbbreviation(
        'soar-clin-cpsvc-delete'
      );

      if ($scope.canDeleteCondition) {
        var cautionMessage =
          'Are you sure you want to delete the selected condition?';
        modalFactory
          .ConfirmModal('Deletion', cautionMessage, 'Yes', 'No')
          .then(function () {
            ctrl.deleteConditionsConfirmed(condition);
          });
      }
    }

    ctrl.deleteConditionSuccess = function (results) {
      _.forEach(results, function (condition) {
        // api returns a list of conditions that were deleted
        // RecordId has to be set because not in conditions list
        condition.RecordId = condition.PatientConditionId;
        // timeline uses RecordId to remove condition...
        $rootScope.$broadcast(
          'chart-ledger:patient-condition-deleted',
          condition
        );
        // remove condition from the chartLedgerServices
        $scope.patientCondition.IsDeleted = true;
      });

      $rootScope.$broadcast('soar:chart-services-reload-ledger');
      toastrFactory.success(
        localize.getLocalizedString('Delete successful.', 'Success')
      );
    };

    ctrl.deleteConditionsConfirmed = function (condition) {
      patientServices.Conditions.batchDelete(
        { patientId: $scope.patientCondition.PatientId },
        [condition.RecordId]
      ).$promise.then(
        function (res) {
          ctrl.deleteConditionSuccess(res.Value);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to delete the {0}. Please try again.',
              'selected condition'
            ),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    };

    $scope.toggleEllipsesMenu = function (event) {
      $scope.showEllipsesMenu = !$scope.showEllipsesMenu;
      $scope.orientTop = soarAnimation.soarVPos(event.currentTarget);
    };

    ctrl.initializePatientConditionCreateUpdate =
      initializePatientConditionCreateUpdate;
    function initializePatientConditionCreateUpdate() {
      patientOdontogramFactory.setselectedChartButton(
        $scope.conditionEdited.ConditionId
      );
      patientConditionsFactory.setActivePatientConditionId(
        $scope.conditionEdited.RecordId
      );
      // patient condition create update need selected chart button
      patientOdontogramFactory.setselectedChartButton(
        $scope.conditionEdited.ConditionId
      );
      // Open kendo window to add service

      var modalObject = {
        mode: 'Condition',
        title: $scope.conditionEdited.Description,
      };

      $rootScope.$broadcast('show-condition-modal', modalObject);
    }
  },
]);
