'use strict';
angular.module('Soar.Patient').controller('TreatmentPlansSummary', [
  '$scope',
  'ListHelper',
  '$rootScope',
  'PatientPreventiveCareFactory',
  'localize',
  '$timeout',
  'ModalFactory',
  '$routeParams',
  'toastrFactory',
  'UserServices',
  'TreatmentPlansFactory',
  'userSettingsDataService',
  function (
    $scope,
    listHelper,
    $rootScope,
    patientPreventiveCareFactory,
    localize,
    $timeout,
    modalFactory,
    $routeParams,
    toastrFactory,
    userServices,
    treatmentPlansFactory,
    userSettingsDataService
  ) {
    var ctrl = this;

    ctrl.$onInit = function () {
      $scope.txPlansForAllAccountMembers = [];
      ctrl.getAllTxPlansForAccount();
    };

    //
    ctrl.processTxPlans = function (plans) {
      $scope.txPlansForAllAccountMembers = plans;
      angular.forEach($scope.txPlansForAllAccountMembers, function (tp) {
        tp.$$ServicesSummary =
          tp.ServicesCount > 1 ? '{0} Services' : '{0} Service';
        ctrl.createRouteProperty(tp);
      });
      ctrl.getCount($scope.patient.PatientId);
    };

    // listening for changes to AccountTreatmentPlans for updating $scope.txPlanHeadersForAllAccountMembers
    $scope.$watch(
      function () {
        return treatmentPlansFactory.AccountTreatmentPlans;
      },
      function (nv, ov) {
        if (nv && nv.length > 0 && !angular.equals(nv, ov)) {
          ctrl.processTxPlans(nv);
        }
      },
      true
    );

    // getting the data
    ctrl.getAllTxPlansForAccount = function () {
      treatmentPlansFactory.SetAccountTreatmentPlans([]);
      var accountHolder = listHelper.findItemByFieldValue(
        $scope.allAccountMembers,
        'IsResponsiblePerson',
        true
      );
      treatmentPlansFactory
        .GetAllAccountTreatmentPlans(accountHolder.PatientId)
        .then(function (res) {
          ctrl.processTxPlans(res.Value);
        });
    };

    // helper for create the link to the txPlan crud
    ctrl.createRouteProperty = function (txPlan) {
      if (txPlan !== null) {
        let patientPath = '#/Patient/';
        var route = patientPath;
        route += txPlan.TreatmentPlanHeader.PersonId;
        route += '/Clinical';
        route += '?activeExpand=2';
        route += '&txPlanId=' + txPlan.TreatmentPlanHeader.TreatmentPlanId;
        route += '&activeSubTab=2';
        txPlan.$$Route = route;
      }
    };

    // helper for calculating count
    ctrl.getCount = function (patientId) {
      var count = 0;
      if (patientId === 0) {
        count = $scope.txPlansForAllAccountMembers.length;
      } else {
        angular.forEach($scope.txPlansForAllAccountMembers, function (tp) {
          if ($scope.patient.PatientId === tp.TreatmentPlanHeader.PersonId) {
            count++;
          }
        });
      }
      $scope.listCount = localize.getLocalizedString('(' + count + ')');
    };

    // filter function to only show txPlans for selected patient or all account members
    $scope.displayBasedOnPatientSelected = function (txPlan) {
      return function (txPlan) {
        return $scope.patient.PatientId ===
          txPlan.TreatmentPlanHeader.PersonId || $scope.patient.PatientId === 0
          ? true
          : false;
      };
    };

    // every time the patient changes we need to update the count
    $scope.$watch(
      'patient',
      function (nv, ov) {
        if (nv && !angular.equals(nv.PatientId, ov.PatientId)) {
          ctrl.getCount(nv.PatientId);
        }
      },
      true
    );
  },
]);
