angular.module('common.directives').directive('tag', function () {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      baseId: '@',
      title: '@',
      removeFunction: '&',
      hideRemove: '=',
      isPrimary: '=?',
      truncate: '=?',
      isLocationInactive: '=?',
      deactivationTimeUtc: '=?',
      limitTo: '=?',
      numLimit: '=?',
    },
    templateUrl: 'App/Common/components/tag/tag.html',
  };
});
