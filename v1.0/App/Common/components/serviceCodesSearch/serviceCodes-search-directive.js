'use strict';

angular.module('common.directives').directive('serviceCodesSearch', [
  '$rootScope',
  function ($rootScope) {
    return {
      restrict: 'E',
      scope: {
        // Callback function to handle event when user select a record from the displayed result
        onSelect: '=',
        // Text to be searched
        searchTerm: '=',
        // Id of Service Button to filter service codes associated with that Service Button
        serviceButtonId: '=?',
        // Id of Type Or Material to filter service codes associated with that Type Or Material
        typeOrMaterialId: '=?',
        // Flag to allow focus on search box
        bFocus: '=?',
        // Optional object. Contains a boolean property 'value' - if value is true auto-select item in typeahead when there is a single item, else auto-focus the typeahead control and display list of items
        selectAutoFocus: '=?',
      },
      templateUrl:
        'App/Common/components/serviceCodesSearch/serviceCodes-search.html',
      controller: 'ServiceCodesSearchController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  },
]);
