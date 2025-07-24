'use strict';

angular.module('Soar.Patient').factory('RealTimeEligibilityFactory', [
  '$window',
  'localize',
  'PatientServices',
  'ModalFactory',
  'toastrFactory',
  'locationService',
  'InsuranceErrorMessageGeneratorService',
  '$uibModal',
  function (
    $window,
    localize,
    patientServices,
    modalFactory,
    toastrFactory,
    locationService,
    insuranceErrorMessageGeneratorService,
    $uibModal,
  ) {
    function checkRTE(patientId, patientBenefitPlanId) {
      var modalInstance = getLoadingModal();
      var enterpriseId = locationService.getCurrentLocationEnterpriseId();
      patientServices.PatientBenefitPlan.checkRTE({
        patientId: patientId,
        patientBenefitPlanId: patientBenefitPlanId,
        enterpriseId: enterpriseId
      }).$promise.then(
        function (res) {
          var eligibilityId = res.Value.EligibilityId;
          var patientCode = res.Value.PatientCode;
          modalInstance.close();
          getRTE(enterpriseId, patientId, eligibilityId, patientCode);
        },
        function (res) {
          modalInstance.close();
          if (res.data.errorCode) {
            var message = insuranceErrorMessageGeneratorService.createErrorMessageForCheckPayer(res.data);
            var title = localize.getLocalizedString('Check Eligibility');
            var button1Text = 'OK';
            modalFactory.ConfirmModal(title, message, button1Text);
          } else if (res.data.InvalidProperties && res.data.InvalidProperties.length > 0) {
            modalFactory.EligibilityAlertModal(res);
          } else {
            toastrFactory.error(localize.getLocalizedString('Failed to check eligibility'));
          }
        }
      );
    }

    function getRTE(enterpriseId, patientId, eligibilityId, patientCode) {
      var userContext = JSON.parse(sessionStorage.getItem('userContext'));
      var applicationId = userContext.Result.Application.ApplicationId;
      patientServices.PatientBenefitPlan.getRTE({
        enterpriseId: enterpriseId,
        patientId: patientId,
        eligibilityId: eligibilityId,
        applicationId: applicationId
      }).$promise.then(function (res) {
        var content = res.responseHtml;
        var myWindow = $window.open('');
        myWindow.document.write(content);
        myWindow.document.title = 'RTE for ' + patientCode;
        myWindow.document.close();
      },
      function (res) {         
        toastrFactory.error(localize.getLocalizedString('Failed to retrieve Eligibility record'), 
        localize.getLocalizedString('View RTE Error'));
      });
    }

    function getLoadingModal() {
      return $uibModal.open({
        template:
          '<div>' +
          '  <i id="resolveLoadingSpinner" class="fa fa-spinner fa-4x fa-spin"></i><br/>' +
          '  <span> {{ \'Checking Eligibility with Carrier...\' }}</span>'+
          '</div>',
        size: 'sm',
        windowClass: 'modal-loading',
        backdrop: 'static',
        keyboard: false,
      });
    };

    return {
      checkRTE: checkRTE,
      getRTE: getRTE,
    };
  },
]);
