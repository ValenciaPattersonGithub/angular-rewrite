(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller('CheckoutController', CheckoutController);

  CheckoutController.$inject = [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$timeout',
    '$location',
    'localize',
    'PatientServices',
    'ShareData',
    'ClinicalDrawerStateService',
    'referenceDataService',
  ];
  function CheckoutController(
    $scope,
    $rootScope,
    $routeParams,
    $timeout,
    $location,
    localize,
    patientServices,
    shareData,
    clinicalDrawerStateService,
    referenceDataService
  ) {
    BaseCtrl.call(this, $scope, 'CheckoutController');

    var ctrl = this;
    $scope.enableNewClinicalNavigation = true;

    $scope.$emit('nav:showHideDrawerNav', true);

    $scope.patientId = $routeParams.patientId;
    $scope.encounterId = $routeParams.encounterId;
    $scope.accountId = $routeParams.accountId;
    $routeParams.disableSecondaryNavigation = true;
    $routeParams.Category = 'Summary';

    $scope.loading = true;

    /**
     * Inits controller.
     *
     * @returns {angular.IPromise}
     */
    ctrl.$onInit = function () {
      $scope.loading = true;
      return referenceDataService
        .getData(referenceDataService.entityNames.locations)
        .then(function (locations) {
          ctrl.locations = locations;
          ctrl.getCurrentPatientById().then(function (res) {
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
            $scope.loading = false;
          });
        });
    };

    ctrl.getCurrentPatientById = function () {
      return patientServices.Patients.get({ Id: $routeParams.patientId })
        .$promise;
    };

    ctrl.getPatientPhonesSuccess = function (res) {
      $scope.patientHeaderObj.primaryPhone = res.Value[0];
    };

    ctrl.getPatientPhonesFailure = function () {};

    $scope.cancelCheckout = function (data) {
      // if cancelCheckout is passed a data object use that to route to regardless of previous location
      // this is needed because the encounter selected may not be the same patient as current patient selected.
      if (data && data.EncounterId && data.PatientId) {
        // if this is a family checkout, append route property (encounterId is null if family checkout)
        if ($scope.encounterId) {
          $location.url(
            `/Patient/${data.PatientId}/Account/${$scope.accountId}/Encounter/${data.EncounterId}/EncountersCart/AccountSummary`
          );
        } else {
          $location.url(
            `/Patient/${data.PatientId}/Account/${$scope.accountId}/Encounter/${data.EncounterId}/EncountersCart/AccountSummary/?familyCheckout=true`
          );
        }
      } else {
        let patientPath = '/Patient/';

        if ($routeParams.PrevLocation === 'Schedule') {
          let scheduleLink =
            '/Schedule?date=' +
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
          $location.url(scheduleLink);
        } else if ($routeParams.PrevLocation === 'AccountSummary') {
          $location.url(
            patientPath + $scope.patientId + '/Summary/?tab=Account Summary'
          );
        } else if ($routeParams.PrevLocation === 'PatientOverview') {
          $location.url(patientPath + $scope.patientId + '/Overview/');
        } else if ($routeParams.PrevLocation === 'AccountSummaryEncounter') {
          let locationRoute = `/Patient/${$scope.patientId}/Account/${$scope.accountId}/Encounter/${$scope.encounterId}/Encounters/AccountSummary`;
          $location.url(locationRoute);
        } else if (
          $routeParams.PrevLocation === 'EncountersCartAccountSummary'
        ) {
          let locationRoute = `/Patient/${$scope.patientId}/Account/${$scope.accountId}/Encounter/${$scope.encounterId}/EncountersCart/AccountSummary`;
          $location.url(locationRoute);
        } else if (
          $routeParams.PrevLocation === 'EncounterCartAccountSummaryBeta'
        ) {
          let locationRoute = `/Patient/${$scope.patientId}/Account/${$scope.accountId}/Encounter/${$scope.encounterId}/EncountersCart/AccountSummaryBeta`;
          $location.url(locationRoute);
        } else if (
          $routeParams.PrevLocation === 'EncountersCartPatientOverview'
        ) {
          let locationRoute = `/Patient/${$scope.patientId}/Account/${$scope.accountId}/Encounter/${$scope.encounterId}/EncountersCart/PatientOverview`;
          $location.url(locationRoute);
        } else if ($routeParams.PrevLocation === 'Clinical') {
          let locationRoute = `/Patient/${$scope.patientId}/Clinical`;
          $location.url(locationRoute);
        }
      }

      // prevent errors with digest cycle
      $timeout(function () {
        $rootScope.$digest();
      }, 0);
    };

    $scope.navigateToSummary = function () {
      $location.url(
        '/Patient/' + $scope.patientId + '/Summary/?tab=Account Summary'
      );
    };

    $scope.selectedSummaryOption = 'Account Summary';

    //#region drawer
    $scope.showDrawerNav = false;
    $scope.drawerIsOpen = true;
    $scope.$on('nav:drawerChange', function (events, index) {
      if ($scope.currentDrawer === index && $scope.drawerIsOpen === true) {
        // set the drawer state
        $scope.drawerIsOpen = false;
        return; //close drawer
      } else if ($scope.drawerIsOpen === false) {
        // set the drawer state
        $scope.drawerIsOpen = true;
      }
      clinicalDrawerStateService.changeDrawerState($scope.drawerIsOpen);
      $scope.currentDrawer = index; // set new drawer selection
      ctrl.setSubTabs(index);
    });

    $scope.drawerIsOpen = false; //drawer starts closed
    clinicalDrawerStateService.changeDrawerState($scope.drawerIsOpen);
    $scope.currentDrawer = 1; // drawer starts on Timeline

    $scope.closeDrawer = function () {
      $scope.drawerIsOpen = false;
      // set the drawer state
      clinicalDrawerStateService.changeDrawerState($scope.drawerIsOpen);
    };

    ////#endregion

    ctrl.$onInit();
  }
  CheckoutController.prototype = Object.create(BaseCtrl);
})();
