'use strict';
// update to use new api
angular.module('common.directives').directive('openTimeSearch', function () {
  return {
    restrict: 'E',
    scope: {
      minutesString: '=',
      appointmentTypes: '=',
      treatmentRooms: '=',
      clipboardData: '=',
      clearSlots: '=',
      currentScheduleView: '=',
      selectedLocations: '=',
      previewParam: '=',
      providersByLocation: '=',
      providers: '=',
      onPreview: '&?',
      onSchedule: '&?',
    },
    templateUrl: 'App/Common/components/searchForOpenTime/openTimeSearch.html',
    controller: 'OpenTimeSearchController',
    link: function link(scope, element, attrs) {
      element.on('$destroy', function elementOnDestroy() {
        scope.$destroy();
      });
    },
  };
});
