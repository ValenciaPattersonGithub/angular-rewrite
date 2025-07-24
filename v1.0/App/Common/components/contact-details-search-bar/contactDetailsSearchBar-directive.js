'use strict';
angular.module('common.directives').directive('contactDetailsSearchBar', [
  function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        baseId: '@',
        header: '=',
        selectMode: '=',
        selected: '=',
        bFocus: '=',
        tabIndex: '=?',
        holdSearchTerm: '=?',
        showClearButton: '=?',
        showSearchButton: '=?',
        clear: '=?',
        globalSearch: '=?',
        viewResult: '=?',
        authZ: '@?',
        currentPatientId: '=?',
        documentPatients: '=?',
        patientInfo: '=',
      },
      templateUrl:
        'App/Common/components/contact-details-search-bar/contactDetailsSearchBar.html ',
      controller: 'ContactDetailsSearchBarController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
