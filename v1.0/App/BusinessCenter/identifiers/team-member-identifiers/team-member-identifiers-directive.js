'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('teamMemberIdentifierCrud', function () {
    return {
      restrict: 'E',
      templateUrl:
        'App/BusinessCenter/identifiers/team-member-identifiers/team-member-identifiers-crud.html',
      controller: 'TeamMemberIdentifierController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
