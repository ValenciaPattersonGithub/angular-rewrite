'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('claimsManagement', function () {
    return {
      restrict: 'E',
      templateUrl:
        'App/BusinessCenter/insurance/claims/claims-management/claims-management.html',
      controller: 'ClaimsManagementController as $ctrl',
      scope: {
        activeTab: '=',
        claimsSummary: '=',
        accountMemberOption: '=',
        claimMgmtsLists: '=',
        getTabCount: '&',
        selectedLocations: '=',
      },
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
