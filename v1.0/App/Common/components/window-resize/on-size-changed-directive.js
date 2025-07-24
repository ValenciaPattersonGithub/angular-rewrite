///
/// This directive can be used to respond to window resize event on an element.
///   <div on-size-changed="onResize"></div>
///
angular.module('common.directives').directive('onSizeChanged', [
  '$window',
  function ($window) {
    return {
      restrict: 'A',
      scope: {
        onSizeChanged: '&',
      },
      link: function (scope, $element, attr) {
        var element = $element[0];

        cacheElementSize(scope, element);
        angular.element($window).on('resize', onWindowResize);

        function cacheElementSize(scope, element) {
          scope.cachedElementWidth = element.offsetWidth;
          scope.cachedElementHeight = element.offsetHeight;
        }

        function onWindowResize() {
          var isSizeChanged =
            scope.cachedElementWidth != element.offsetWidth ||
            scope.cachedElementHeight != element.offsetHeight;
          if (isSizeChanged) {
            var expression = scope.onSizeChanged();
            expression(element);
            cacheElementSize(scope, element);
          }
        }
        $element.on('$destroy', function elementOnDestroy() {
          angular.element($window).off('resize', onWindowResize);
        });
      },
    };
  },
]);
