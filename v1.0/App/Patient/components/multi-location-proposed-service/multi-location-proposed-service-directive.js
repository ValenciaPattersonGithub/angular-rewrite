(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .directive('multiLocationProposedService', multiLocationProposedService);

  multiLocationProposedService.$inject = [];

  function multiLocationProposedService() {
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
          'App/Patient/components/multi-location-proposed-service/multi-location-proposed-service-' +
          attrs.mode +
          '-panel.html'
        );
      },
      controller: 'MultiLocationProposedServiceController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
    return directive;
  }
})();
