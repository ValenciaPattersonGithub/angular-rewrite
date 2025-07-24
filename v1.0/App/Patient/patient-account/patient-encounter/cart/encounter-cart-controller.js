(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller(
      'PatientEncounterCartController',
      PatientEncounterCartController
    );

  PatientEncounterCartController.$inject = [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$location',
    'localize',
    'PatientServices',
    'ShareData',
    'referenceDataService',
    'FeatureFlagService',
    'FuseFlag'
  ];
  function PatientEncounterCartController(
    $scope,
    $rootScope,
    $routeParams,
    $location,
    localize,
    patientServices,
    shareData,
    referenceDataService,
    featureFlagService,
    fuseFlag,
  ) {
    BaseCtrl.call(this, $scope, 'PatientEncounterCartController');

    var ctrl = this;

    $scope.hasChanges = false;
    $scope.patientId = $routeParams.patientId;
    $scope.encounterId = $routeParams.encounterId;
    $scope.appointmentId = $routeParams.appt;
    $scope.accountId = $routeParams.accountId;
    $routeParams.disableSecondaryNavigation = true;
    $routeParams.Category = 'Summary';

    /**
     * Init controller.
     *
     * @returns {angular.IPromise}
     */
    ctrl.init = function () {
      featureFlagService.getOnce$(fuseFlag.ShowScheduleV2).subscribe((value) => {
        $scope.ShowScheduleV2 = value;
      });
      return referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          ctrl.locations = locations;
          return ctrl.getCurrentPatientById().then(function (res) {
            shareData.patientInfo = res.Value;
            $scope.patientHeaderObj = shareData.patientInfo;
            $scope.patientHeaderObj.$$DisplayStatus =
              shareData.patientInfo.IsPatient === true
                ? localize.getLocalizedString('Active Patient')
                : localize.getLocalizedString('Active Person');
            patientServices.Contacts.getAllPhonesWithLinks(
              { Id: $scope.patientHeaderObj.PatientId },
              ctrl.getPatientPhonesSuccess,
              ctrl.getPatientPhonesFailure
            );

            $scope.patientHeaderObj.ResponsibleParty =
              res.Value.ResponsiblePersonName;
            $scope.patientHeaderObj.ResponsiblePersonName =
              res.Value.ResponsiblePersonName;
            $scope.patientHeaderObj.PrimaryLocation = _.find(
              ctrl.locations,
              function (location) {
                return (
                  location.LocationId ===
                  $scope.patientHeaderObj.PreferredLocation
                );
              }
            );
          });
        });
    };

    ctrl.getCurrentPatientById = function () {
      return patientServices.Patients.get({ Id: $routeParams.patientId })
        .$promise;
    };

    ctrl.getPatientPhonesSuccess = function (res) {
      if ($scope.patientHeaderObj) {
        $scope.patientHeaderObj.primaryPhone = res.Value[0];
      }
    };

    ctrl.getPatientPhonesFailure = function () {};

    $scope.cancelClicked = function () {
      let patientPath = '/Patient/';

      if ($routeParams.PrevLocation === 'Schedule') {
        $location.url(ctrl.getScheduleLink());
      } else if ($routeParams.PrevLocation === 'AccountSummary') {
        $location.url(
          patientPath + $scope.patientId + '/Summary/?tab=Account Summary'
        );
      } else if ($routeParams.PrevLocation === 'PatientOverview') {
        $location.url(patientPath + $scope.patientId + '/Overview/');
      }

      $rootScope.$digest();
    };

    ctrl.getScheduleLink = function() {
      let scheduleLink = '';
      if ($scope.ShowScheduleV2) {
        scheduleLink = '/schedule/v2';
      }
      else {
        scheduleLink = '/Schedule?date=' +
          $routeParams.date +
          '&view=' +
          $routeParams.view +
          '&group=' +
          $routeParams.group +
          '&providers=' +
          $routeParams.providers +
          '&location=' +
          $routeParams.location +
          '&index=' +
          $routeParams.index;
        if ($routeParams.open) {
          scheduleLink += '&open=' + $routeParams.open;
        }
      }
      return scheduleLink;
    };

    ctrl.init();
  }

  PatientEncounterCartController.prototype = Object.create(BaseCtrl);
})();
