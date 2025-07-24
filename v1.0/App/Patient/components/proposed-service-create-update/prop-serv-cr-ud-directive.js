(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .directive('proposedServiceCreateUpdate', proposedServiceCreateUpdate);

  proposedServiceCreateUpdate.$inject = [];

  function proposedServiceCreateUpdate() {
    var directive = {
      restrict: 'E',
      scope: {
        mode: '=',
        buttonId: '=',
        isswiftcode: '=?',
        isfirstcode: '=?',
        islastcode: '=?',
        isedit: '=?',
        passinfo: '=?',
        servicetransaction: '=?',
        treatmentPlanId: '@?',
        isNewTreatmentPlan: '@?',
        stageNumber: '@?',
        isEditTreatmentPlan: '@?',
        isFromAccountSummary: '=?',
        isFromAppointmentModal: '@?',
      },
      templateUrl: function (elem, attrs) {
        return (
          'App/Patient/components/proposed-service-create-update/prop-serv-cr-ud-' +
          attrs.mode +
          '-panel.html'
        );
      },
      controller: 'ProposedServiceCreateUpdateController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
    return directive;
  }
})();
