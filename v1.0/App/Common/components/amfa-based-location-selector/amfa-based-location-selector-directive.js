angular
  .module('common.directives')
  .directive('amfaBasedLocationSelector', function () {
    return {
      restrict: 'E',
      scope: {
        id: '@',
        list: '=',
        selectedList: '=',
        open: '=',
        msDisabled: '=?',
        authZ: '=?',
        onBlurFn: '&?',
        amfa: '@',
        onLoadCompleteFn: '&?',
        dropDownClass: '@?',
        tagsClass: '@?',
      },
      templateUrl:
        'App/Common/components/amfa-based-location-selector/amfa-based-location-selector.html',
      controller: 'AmfaBasedLocationSelectorController',
      link: function link(scope, elem) {
        scope.element = elem;
        elem.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
