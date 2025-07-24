'use strict';
// parts are renamed to stages
angular.module('Soar.Patient').directive('treatmentPlansStage', function () {
  return {
    restrict: 'E',
    scope: {
      drawerState: '=',
      expandedView: '=',
      proposedServices: '=',
      lgBtn: '=',
      planStages: '=',
      stage: '=',
      planName: '=?',
      treatmentPlan: '=',
      stageIndex: '@',
      actions: '=',
      timelineView: '@?',
      disableAddServices: '=?',
      addServices: '=?',
      hasBenefitPlan: '=?',
      patient: '=',
      patientBenefitPlans: '=',
    },
    templateUrl:
      'App/Patient/patient-chart/treatment-plans/treatment-plans-part/treatment-plans-part.html',
    controller: 'TreatmentPlansStageController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
