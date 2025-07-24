(function () {
  'use strict';

  angular.module('common.directives').directive('radioGroup', radioGroup);

  radioGroup.$inject = ['$window'];

  function radioGroup($window) {
    var directive = {
      link: link,
      restrict: 'EA',
      scope: {
        uniqueId: '@',
        value: '=',
        options: '=' /** array of objects */,
        onChange: '&?',
        disabled: '=?',
      },
      templateUrl: 'App/Common/components/radio-group/radioGroup.html',
      controller: 'RadioGroupController',
    };
    return directive;

    function link(scope, element, attrs) {
      // grabs tabindex form parent element to keep fluid tabbing through page
      scope.tabIndex = element.attr('tabindex');
      // removes parent tab index, no longer necessary
      element.attr('tabindex', '');

      if (!angular.isArray(attrs.options)) {
        console.log('options is not an array');
      }
    }
  }
})();
