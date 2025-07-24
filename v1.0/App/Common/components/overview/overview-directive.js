'use strict';

angular.module('common.directives').directive('overview', [
  '$timeout',
  function ($timeout) {
    return {
      restrict: 'E',
      transclude: 'true',
      scope: {
        height: '=',
        width: '=',
        overrideOpen: '=?',
        overrideClose: '=?',
        target:
          '=?' /** can specify a target to make it a more reusable component */,
        hideArrow: '=?',
      },
      templateUrl: 'App/Common/components/overview/overview.html',
      controller: 'OverviewController',
      link: function link(scope, elem, attrs, ctrl) {
        scope.$overview = elem;
        scope.$target = scope.target ? scope.target : elem.parent();
        scope.$target.attr('tabindex', 1);
        scope.$arrow = elem.find('#arrow');
        scope.dblClicked = false;

        scope.$target.bind('focus', function () {
          scope.visible = true;
          scope.$target.css({ outline: 'none' });

          if (
            !angular.isUndefined(scope.overrideOpen) &&
            scope.overrideOpen !== null
          ) {
            scope.overrideOpen = !scope.overrideOpen;
          }

          $timeout(function () {
            scope.$overview.css(ctrl.applyCss());
          }, 100);
        });

        scope.$target.bind('blur', function () {
          /** we set visible to false if we force it manually or overrideClose doesn't manage the hide state */
          if (scope.forceHide || angular.isUndefined(scope.overrideClose)) {
            scope.visible = false;
            scope.$target.removeAttr('tabindex');

            $timeout(function () {
              scope.$overview.css(ctrl.applyCss());
            }, 250);
          }
        });

        scope.$target.bind('click', function (e) {
          $timeout(function () {
            if (!scope.visible && !scope.forceHide && !scope.dblClicked) {
              scope.$target.focus();
            } else {
              scope.dblClicked = false;
            }
          }, 100);

          scope.forceHide = false;
        });

        scope.$target.bind('dblclick', function (e) {
          if (!scope.overrideOpen && !scope.visible) {
            scope.forceHide = true;
            scope.$target.blur();
            scope.dblClicked = true;
          }
        });

        elem.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });

        scope.$overview.css(ctrl.applyCss());
        scope.$target.focus();
      },
    };
  },
]);
