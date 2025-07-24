'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('userIdentification', function () {
    return {
      restrict: 'E',
      templateUrl:
        'App/BusinessCenter/users/user-crud/user-identification/user-identification.html',
      scope: {
        user: '=',
        userLocationSetups: '=',
        userLocationSetupsDataChanged: '=',
        validIds: '=',
        validTaxId: '=',
        taxonomyDropdownTemplate: '=',
        hasErrors: '=',
        comboBoxBlur: '&',
        stateList: '=',
      },
      controller: 'UserIdentificationController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
