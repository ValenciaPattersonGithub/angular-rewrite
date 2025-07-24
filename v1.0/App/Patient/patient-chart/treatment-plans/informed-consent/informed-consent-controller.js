'use strict';

var app = angular.module('Soar.Patient');

app.controller('InformedConsentController', [
  '$scope',
  '$rootScope',
  '$uibModalInstance',
  'localize',
  'toastrFactory',
  'informedConsentCallback',
  'patient',
  'treatmentPlan',
  'TreatmentPlansFactory',
  '$timeout',
  'patSecurityService',
  '$location',
  '$filter',
  'InformedConsentFactory',
  'InformedConsentMessageService',
  'StaticData',
  'ListHelper',
  'fileService',
  function (
    $scope,
    $rootScope,
    $uibModalInstance,
    localize,
    toastrFactory,
    informedConsentCallback,
    patient,
    treatmentPlan,
    treatmentPlansFactory,
    $timeout,
    patSecurityService,
    $location,
    $filter,
    informedConsentFactory,
    informedConsentMessageService,
    staticData,
    listHelper,
    fileService
  ) {
    var ctrl = this;
    $scope.mode = 'select';

    //#region auth

    $scope.authAccess = informedConsentFactory.access();
    if (!$scope.authAccess.View) {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-clin-cplan-icview'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    }

    //#endregion

    $scope.loading = true;
    $scope.treatmentPlan = treatmentPlan;
    $scope.patient = patient;
    //get todays date for the consent
    $scope.todaysDate = moment();

    //#region init

    ctrl.init = function () {
      ctrl.initializeComputedColumns();
      ctrl.getPatientInfo();
      ctrl.getServiceTransactionStatuses();
    };

    // default
    // $$AddToConsent to true for proposed services only,
    // $$StageSelected to true for all stages ,
    // $$SelectDisabled to false for proposed services only
    //$scope.noneSelected indicates at least one service is selected
    ctrl.initializeComputedColumns = function () {
      $scope.noneSelected = true;
      angular.forEach(
        $scope.treatmentPlan.TreatmentPlanServices,
        function (tps) {
          tps.$$StageSelected = true;
          tps.ServiceTransaction.$$AddToConsent = false;
          tps.$$Status = tps.ServiceTransaction.ScheduledStatus;
          // only check services with Proposed Statuses
          tps.$$SelectDisabled = true;
          if (
            tps.ServiceTransaction.ServiceTransactionStatusId === 1 ||
            tps.ServiceTransaction.ServiceTransactionStatusId === 7
          ) {
            tps.ServiceTransaction.$$AddToConsent = true;
            // indicates at least one service is selected
            $scope.noneSelected = false;
            tps.$$SelectDisabled = false;
          }
        }
      );
    };

    //#endregion

    //#region generate informed consent agreement

    $scope.generateInformedConsent = function () {
      // secure this method with amfa check
      if ($scope.authAccess.Create) {
        $scope.mode = 'create';
        $scope.informedConsent = informedConsentFactory.InformedConsentDto();
        $scope.informedConsent.PatientCode = $scope.patient.PatientCode;
        $scope.informedConsent.TreatmentPlanId =
          $scope.treatmentPlan.TreatmentPlanHeader.TreatmentPlanId;
        $scope.informedConsent.TreatmentPlanName =
          $scope.treatmentPlan.TreatmentPlanHeader.TreatmentPlanName;
        ctrl.addServicesToInformedConsent();
        ctrl.getInformedConsentMessage();
        $scope.informedConsent.SignatureFileAllocationId = null;
        $scope.hasSignatures = false;
      }
    };

    ctrl.addServicesToInformedConsent = function () {
      $scope.informedConsent.Services = [];
      angular.forEach(
        $scope.treatmentPlan.TreatmentPlanServices,
        function (tps) {
          if (tps.ServiceTransaction.$$AddToConsent === true) {
            var informedConsentServiceDto =
              informedConsentFactory.InformedConsentServiceDto();
            informedConsentServiceDto.$$ServiceTransaction =
              tps.ServiceTransaction;
            informedConsentServiceDto.ServiceTransactionId =
              tps.ServiceTransaction.ServiceTransactionId;
            $scope.informedConsent.Services.push(informedConsentServiceDto);
          }
        }
      );
    };

    ctrl.getInformedConsentMessage = function () {
      informedConsentMessageService
        .getInformedConsentMessage()
        .then(function (res) {
          var informedConsentMessage = res.Value;
          $scope.informedConsent.Message = informedConsentMessage.Text;
        });
    };

    //#endregion

    //#region save agreement

    $scope.createInformedConsent = function () {
      if ($scope.authAccess.Create) {
        var services = $scope.informedConsent.Services;
        informedConsentFactory
          .save($scope.informedConsent)
          .then(function (res) {
            // return the document to the parent
            var informedConsentDocument = res.Value;
            informedConsentCallback(informedConsentDocument, services);
            // close the form
            $uibModalInstance.close();
          });
      }
    };

    //#endregion

    //#region print unsigned / unsaved
    $scope.printUnsignedInformedConsent = function () {
      if ($scope.authAccess.View) {
        informedConsentFactory.printUnsigned(
          $scope.informedConsent,
          $scope.patient
        );
        $uibModalInstance.close();
      }
    };

    //#endregion

    //#region close

    $scope.closeModal = function () {
      $uibModalInstance.close();
    };

    //#endregion

    //#region set noneSelected

    $scope.noneSelected = false;
    $scope.checkSelected = function (stage, flag) {
      $scope.noneSelected = true;
      angular.forEach(
        $scope.treatmentPlan.TreatmentPlanServices,
        function (tps) {
          if (tps.ServiceTransaction.$$AddToConsent === true) {
            $scope.noneSelected = false;
          }
          if (
            tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber == stage
          ) {
            tps.$$StageSelected = flag;
          }
        }
      );
    };

    //#endregion

    //#region select all for stage

    // select all (only on proposed status)
    $scope.selectAllForStage = function (stage, flag) {
      angular.forEach(
        $scope.treatmentPlan.TreatmentPlanServices,
        function (tps) {
          if (
            tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber == stage &&
            (tps.ServiceTransaction.ServiceTransactionStatusId === 1 ||
              tps.ServiceTransaction.ServiceTransactionStatusId === 7)
          ) {
            tps.ServiceTransaction.$$AddToConsent = flag;
          }
        }
      );
    };

    //#endregion

    //#region patientInfo

    $scope.patientName = '';
    ctrl.getPatientInfo = function () {
      if ($scope.patient) {
        $scope.patientName = $filter('getPatientNameAsPerBestPractice')(
          $scope.patient
        );
      }
    };

    //#endregion

    //#region status

    ctrl.addStatusNameToService = function (tps) {
      var status = listHelper.findItemByFieldValue(
        $scope.serviceTransactionStatuses,
        'Id',
        tps.ServiceTransaction.ServiceTransactionStatusId
      );
      if (status) {
        tps.ServiceTransaction.$$ServiceTransactionStatusName = status.Name;
      }
    };

    ctrl.getServiceTransactionStatuses = function () {
      staticData.ServiceTransactionStatuses().then(function (res) {
        if (res && res.Value) {
          $scope.serviceTransactionStatuses = res.Value;
          angular.forEach(
            $scope.treatmentPlan.TreatmentPlanServices,
            function (tps) {
              ctrl.addStatusNameToService(tps);
            }
          );
        }
      });
    };

    //#endregion

    //#region signature
    $scope.patientSignatureTitle =
      localize.getLocalizedString('Patient Signature');
    $scope.witnessSignatureTitle =
      localize.getLocalizedString('Witness Signature');
    $scope.signatureTitle = localize.getLocalizedString('Patient Signature');
    $scope.clearSignature = false;

    $scope.$watch(
      'informedConsent.SignatureFileAllocationId',
      function (nv, ov) {
        if (nv) {
          if (
            $scope.informedConsent.PatientSignatureFileAllocationId === null
          ) {
            $scope.informedConsent.PatientSignatureFileAllocationId = nv;
            $scope.informedConsent.SignatureFileAllocationId = null;
            $scope.signatureTitle =
              localize.getLocalizedString('Witness Signature');
            $scope.clearSignature = true;
          } else {
            $scope.informedConsent.WitnessSignatureFileAllocationId = nv;
            $scope.informedConsent.SignatureFileAllocationId = null;
            $scope.hasSignatures = true;
          }
        }
      }
    );

    //#endregion

    ctrl.init();
  },
]);
