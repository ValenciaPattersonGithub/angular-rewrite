'use strict';
angular.module('Soar.Patient').controller('MedicalHistoryController', [
  '$scope',
  'ListHelper',
  'localize',
  '$timeout',
  '$routeParams',
  'MedicalHistoryFactory',
  'tabLauncher',
  'toastrFactory',
  'patSecurityService',
  '$location',
  'userSettingsDataService',
  'FuseFlag',
  'FeatureFlagService',
  function (
    $scope,
    listHelper,
    localize,
    $timeout,
    $routeParams,
    medicalHistoryFactory,
    tabLauncher,
    toastrFactory,
    patSecurityService,
    $location,
    userSettingsDataService,
    fuseFlag,
    featureFlagService,
  ) {
    var ctrl = this;

    const MEDICAL_HISTORY_V2_ROUTES = {
      view: (patientId) => `#/Patient/${patientId}/Clinical/v2/health/medical-history/view`,
      update: (patientId) => `#/Patient/${patientId}/Clinical/v2/health/medical-history/update`,
      new: (patientId) => `#/Patient/${patientId}/Clinical/v2/health/medical-history/new`,
      print: (patientId) => `#/Patient/${patientId}/Clinical/v2/health/medical-history/print`,
      printblank: (patientId) => `#/Patient/${patientId}/Clinical/v2/health/medical-history/printblank`
    };
    
    $scope.mostRecentHistory = {};
    // can update medical history to new form
    $scope.canUpdateForm = false;
    // can view current medical history
    $scope.canViewForm = false;
    $scope.expandForm = false;
    $scope.loadingMedicalHistoryMessage = localize.getLocalizedString(
      'No Medical History form on file.'
    );
    $scope.medicalHistoryFormDateModified = null;
    $scope.hasMedicalHistoryFormOnFile = false;
    $scope.EnableClinicalMedHxV2Navigation = false;
    $scope.showMedicalHistoryV2 = false;

    $scope.toggleMedicalHistoryV2 = (toggled) => {
      $scope.showMedicalHistoryV2 = toggled;
    }

    $scope.openClinicalHealthV2 = () => {
      window.location.href = '#/patientv2/'
      + $scope.patientInfo.PatientId
       + '/Clinical?tab=0&activeSubTab=0';
    }

    //#region access

    ctrl.getAccess = function () {
      $scope.access = medicalHistoryFactory.access();
      if (!$scope.access.View) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-per-perhst-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      }
    };
    ctrl.getAccess();

    //#endregion

    ctrl.$onInit = function () {
      $scope.loadingMedicalHistoryForm = true;
      $scope.getMedicalHistoryForm();
      medicalHistoryFactory.ViewingForm = false;
      medicalHistoryFactory.UpdatingForm = false;

      featureFlagService.getOnce$(fuseFlag.EnableClinicalMedHxV2Navigation).subscribe((value) => {
        $scope.EnableClinicalMedHxV2Navigation = value;
      });
    };

    // gets a pristine version of the medical history form for adding answers
    $scope.getNewMedicalHistoryForm = function () {
      if ($scope.EnableClinicalMedHxV2Navigation && $scope.showMedicalHistoryV2) {
        window.location.href = MEDICAL_HISTORY_V2_ROUTES.new($scope.patientInfo.PatientId);
      } else {
        $scope.loadingNewMedicalHistoryForm = true;
        medicalHistoryFactory.create().then(function (res) {
          var newMedicalHistoryForm = res.Value;
          newMedicalHistoryForm.DateModified = moment();
          medicalHistoryFactory.SetNewMedicalHistoryForm(newMedicalHistoryForm);
          medicalHistoryFactory.SetActiveMedicalHistoryForm(false);
          $scope.loadingNewMedicalHistoryForm = false;
          $scope.canUpdateForm = true;
        });
      }
    };
    
    // get the current medical history if it exists
    $scope.getMedicalHistoryForm = function () {
      $scope.loadingMedicalHistoryForm = true;
      medicalHistoryFactory
        .getById($scope.patientInfo.PatientId)
        .then(function (res) {
          if (res.Value === null) {
            // no form on file
            $scope.medicalHistoryFormDateModified = null;
            $scope.hasMedicalHistoryFormOnFile = false;
            $scope.loadingMedicalHistoryForm = false;
            $scope.canViewForm = $scope.hasForm = false;
            $scope.getNewMedicalHistoryForm();
          } else {
            // set active medical history form
            $scope.medicalHistoryForm = res.Value;
            $scope.hasMedicalHistoryFormOnFile = true;
            $scope.medicalHistoryFormDateModified =
              $scope.medicalHistoryForm.DateModified;
            $scope.medicalHistoryFormDateModified += 'Z';
            medicalHistoryFactory.SetActiveMedicalHistoryForm(
              $scope.medicalHistoryForm
            );
            $scope.loadingMedicalHistoryForm = false;
            $scope.canUpdateForm = $scope.canViewForm = $scope.hasForm = true;
          }
        });
    };

    $scope.updateMedicalHistory = function () {
      if ($scope.EnableClinicalMedHxV2Navigation && $scope.showMedicalHistoryV2) {
        window.location.href = $scope.hasForm ?
          MEDICAL_HISTORY_V2_ROUTES.update($scope.patientInfo.PatientId)
          : MEDICAL_HISTORY_V2_ROUTES.new($scope.patientInfo.PatientId);
      } else if ($scope.canUpdateForm) {
        $timeout(function () {
          $scope.$apply();
        });
        $scope.viewSettings.expandView = true;
        $scope.viewSettings.activeExpand = 5;
        medicalHistoryFactory.SetUpdatingForm(true);
        medicalHistoryFactory.SetViewingForm(false);
      }
    };
    
    
    $scope.viewMedicalHistory = function () {
      if ($scope.canViewForm) {
        if ($scope.EnableClinicalMedHxV2Navigation && $scope.showMedicalHistoryV2) {
          window.location.href = MEDICAL_HISTORY_V2_ROUTES.view($scope.patientInfo.PatientId);
          return;
        }
        $scope.loadingMedicalHistoryForm = true;
        $timeout(function () {
          $scope.$apply();
        });
        $scope.viewSettings.expandView = true;
        $scope.viewSettings.activeExpand = 5;
        medicalHistoryFactory.SetUpdatingForm(false);
        medicalHistoryFactory.SetViewingForm(true);
      }
    };

    $scope.printMedicalHistory = function () {
      if ($scope.EnableClinicalMedHxV2Navigation && $scope.showMedicalHistoryV2 && $scope.canViewForm) {
        tabLauncher.launchNewTab(
            MEDICAL_HISTORY_V2_ROUTES.printblank($scope.patientInfo.PatientId),
        )
        return;
      }
      const patientPath = '#/Patient/';
      tabLauncher.launchNewTab(
        patientPath + $scope.patientInfo.PatientId + '/Clinical/MedicalHistoryForm/blank'
      );
    };

    // TODO, update button should be disabled when user doesn't have amfa

    // disable buttons while form is viewed or updated
    $scope.$watch(
      function () {
        return medicalHistoryFactory.UpdatingForm;
      },
      function (nv) {
        $scope.disableForm(nv);
      }
    );

    $scope.$watch(
      function () {
        return medicalHistoryFactory.ViewingForm;
      },
      function (nv) {
        $scope.disableForm(nv);
      }
    );

    $scope.$watch(
      function () {
        return medicalHistoryFactory.ActiveMedicalHistoryForm;
      },
      function (nv) {
        if (!!nv) {
          $scope.medicalHistoryForm =
            medicalHistoryFactory.ActiveMedicalHistoryForm;
          $scope.canUpdateForm = $scope.canViewForm = $scope.hasForm = true;
          $scope.hasMedicalHistoryFormOnFile = true;
        } else {
          $scope.canViewForm = $scope.hasForm = false;
        }
      }
    );

    $scope.disableForm = function (disableForm) {
      $scope.expandForm = disableForm;
      $timeout(function () {
        $scope.$apply();
      });
    };

    $scope.$on(
      'soar:medical-history-form-created',
      function (e, medicalHistoryForm) {
        $scope.medicalHistoryFormDateModified = medicalHistoryForm.DateModified;
      }
    );
  },
]);
