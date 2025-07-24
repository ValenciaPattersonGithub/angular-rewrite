'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('userLocationsSetup', function () {
    return {
      restrict: 'E',
      scope: {
        // formName: '=',
        user: '=',
        userLocationSetups: '=',
        userLocationsErrors: '=',
        userLocationSetupsDataChanged: '=',
        userActivated: '=',
      },
      templateUrl:
        'App/BusinessCenter/users/user-crud/user-locations-setup/user-locations-setup.html',
      controller: 'UserLocationsSetupController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });

// TODO reevaluate what is needed here
