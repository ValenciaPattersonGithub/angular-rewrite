'use strict';

angular.module('Soar.Patient').directive('clinicalTimeline', function () {
  return {
    restrict: 'E',
    scope: {
      //ChartLedgerServices Collection
      chartLedgerServices: '=',

      // data from the clinical overview object
      data: '=',

      //Patient Id
      personId: '=',

      // currently active subTab
      subtabs: '=',

      viewSettings: '=',

      //Function to navigate user to selected perio exam
      activateTab: '=?',
    },
    templateUrl:
      'App/Patient/patient-chart/clinical-timeline/clinical-timeline-landing/clinical-timeline-landing.html',
    controller: 'ClinicalTimelineLandingController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
