'use strict';
angular.module('common.directives').directive('searchBar', [
  function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        baseId: '@',
        header: '=',
        selectMode: '=',
        selected: '=?',
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
        fromAptModal: '=?',
        aptLocation: '=?',
        filteredLocations: '=?',
        headerSearch: '=?',
        placeholderText: '=?',
        defaultSearchTerm: '=?',
        onSelect: '=?',
      },
      templateUrl: 'App/Common/components/searchBar/searchBar.html ',
      controller: 'SearchBarController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
