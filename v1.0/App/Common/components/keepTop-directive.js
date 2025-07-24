'use strict';

angular
  .module('common.directives')
  .directive('keepTop', function () {
    return function (scope, element, attrs) {
      // Set disance from top
      var ktEtop = null;
      // setTimeout "pause" the execution to let the rendering threads catch up in queue.
      // This is to get the correct element offset value on UI render.
      setTimeout(function () {
        ktEtop = element.offset().top;
      }, 0);

      element.on('$destroy', function () {
        scope.$destroy();
      });

      scope.keepTop = function () {
        if (ktEtop === null) {
          return;
        }
        // Set distance for window.scrollTop
        var ktW = $(window).scrollTop();
        // Get height of header
        var ktHeader = $('header').height();
        var ktNav = attrs.keepTopNavbar
          ? $('.secondaryNavigation').height()
          : 0;
        if (ktW > ktEtop - ktHeader - ktNav) {
          element.addClass('keepTop').css('top', ktHeader + ktNav);
        } else if (ktW - ktHeader < ktEtop) {
          element.removeClass('keepTop');
          element.css('top', '');
        }
      };

      var onScroll = function () {
        scope.keepTop();
      };

      // Bind the scroll event
      $(window).bind('scroll', onScroll);

      var onResize = function () {
        scope.keepTop();
      };

      $(window).resize(onResize);

      scope.$on('reset-top', function () {
        ktEtop = element.offset().top;
      });
      scope.$on('$destroy', function () {
        $(window).unbind('scroll', onScroll);
        $(window).off('resize', onResize);

        for (var scopeItem in scope) {
          if (
            scopeItem &&
            scope.hasOwnProperty(scopeItem) &&
            !scopeItem.startsWith('$')
          ) {
            scope[scopeItem] = null;
          }
        }

        if (scope.$$watchers && scope.$$watchers.length) {
          for (var i = 0; i < scope.$$watchers.length; i++) {
            scope.$$watchers[i].fn = null;
          }
        }

        scope.$$watchers = [];
        scope.$$listeners.$destroy = null;
        scope.$$listeners.kendoWidgetCreated = null;
        scope.$$listeners = {};
      });
    };
  })

  .directive('keepTopNoOffset', function () {
    return function (scope, element, attrs) {
      element.css('position', 'relative');
      element.css('z-index', 20);
      element.on('$destroy', function () {
        scope.$destroy();
      });
      scope.keepTop = function (top) {
        element.css('top', top);
      };
      // Bind the scroll event
      $(window).bind('scroll', function () {
        scope.keepTop();
      });
      scope.$on('$destroy', function () {
        for (var scopeItem in scope) {
          if (
            scopeItem &&
            scope.hasOwnProperty(scopeItem) &&
            !scopeItem.startsWith('$')
          ) {
            scope[scopeItem] = null;
          }
        }

        if (scope.$$watchers && scope.$$watchers.length) {
          for (var i = 0; i < scope.$$watchers.length; i++) {
            scope.$$watchers[i].fn = null;
          }
        }

        scope.$$watchers = [];
        scope.$$listeners.$destroy = null;
        scope.$$listeners.kendoWidgetCreated = null;
        scope.$$listeners = {};
      });
    };
  })

  .directive('keepTopFull', function () {
    return function (scope, element, attrs) {
      // Set disance from top
      var ktEtop = null;
      // setTimeout "pause" the execution to let the rendering threads catch up in queue.
      // This is to get the correct element offset value on UI render.
      setTimeout(function () {
        ktEtop = element.offset().top;
      }, 0);

      element.on('$destroy', function () {
        scope.$destroy();
      });

      scope.keepTop = function () {
        // Set distance for window.scrollTop
        var ktW = $(window).scrollTop();
        // Get height of header
        var ktHeader = $('header').height();

        if (250 - ktW < ktHeader + 20) {
          element.addClass('keepTop').css('top', ktHeader + 20);
        } else {
          element.addClass('keepTop').css('top', 250 - ktW);
        }
      };

      var onScroll = function () {
        scope.keepTop();
      };

      // Bind the scroll event
      $(window).bind('scroll', onScroll);

      var onResize = function () {
        scope.keepTop();
      };

      $(window).resize(onResize);

      scope.$on('reset-top', function () {
        ktEtop = element.offset().top;
      });

      scope.$on('$destroy', function () {
        $(window).unbind('scroll', onScroll);
        $(window).off('resize', onResize);
        for (var scopeItem in scope) {
          if (
            scopeItem &&
            scope.hasOwnProperty(scopeItem) &&
            !scopeItem.startsWith('$')
          ) {
            scope[scopeItem] = null;
          }
        }

        if (scope.$$watchers && scope.$$watchers.length) {
          for (var i = 0; i < scope.$$watchers.length; i++) {
            scope.$$watchers[i].fn = null;
          }
        }

        scope.$$watchers = [];
        scope.$$listeners.$destroy = null;
        scope.$$listeners.kendoWidgetCreated = null;
        scope.$$listeners = {};
      });
    };
  })

  .directive('resize', [
    '$window',
    function ($window) {
      return {
        scope: {
          initialWidth: '=', // Currently, not used. Kept in because there may be a call for it. This is the width of the element when the screen width is 1920.
          initialHeight: '=', // This is the height of the element when the screen size is 1080.
        },
        link: function (scope, elem, attrs) {
          scope.baseWidth = 1920;
          scope.baseHeight = 1080;

          scope.width = angular.copy(scope.initialWidth);
          scope.height = angular.copy(scope.initialHeight);

          scope.resize = function () {
            scope.width =
              scope.initialWidth + ($window.innerWidth - scope.baseWidth);
            scope.height =
              scope.initialHeight +
              ($window.innerHeight - scope.baseHeight) -
              38;

            elem.css('height', scope.height + 'px');
          };

          $window.onresize = scope.resize;

          scope.resize();
        },
      };
    },
  ]);
