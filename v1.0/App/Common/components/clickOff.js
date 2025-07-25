﻿'use strict';

angular.module('common.directives').directive('clickOff', [
  '$rootScope',
  '$parse',
  function ($rootScope, $parse) {
    var id = 0;
    var listeners = {};
    // add variable to detect touch users moving..
    var touchMove = false;

    // Add event listeners to handle various events. Destop will ignore touch events
    document.addEventListener('touchmove', clickOffEventHandler, true);
    document.addEventListener('touchend', clickOffEventHandler, true);
    document.addEventListener('click', clickOffEventHandler, true);

    function targetInFilter(target, elms) {
      if (!target || !elms) return false;
      var elmsLen = elms.length;
      for (var i = 0; i < elmsLen; ++i) {
        var currentElem = elms[i];
        var containsTarget = false;
        try {
          containsTarget = currentElem.contains(target);
        } catch (e) {
          // If the node is not an Element (e.g., an SVGElement) node.contains() throws Exception in IE,
          // see https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
          // In this case we use compareDocumentPosition() instead.
          if (typeof currentElem.compareDocumentPosition !== 'undefined') {
            containsTarget =
              currentElem === target ||
              Boolean(currentElem.compareDocumentPosition(target) & 16);
          }
        }

        if (containsTarget) {
          return true;
        }
      }
      return false;
    }

    function clickOffEventHandler(event) {
      // If event is a touchmove adjust touchMove state
      if (event.type === 'touchmove') {
        touchMove = true;
        // And end function
        return false;
      }
      // This will always fire on the touchend after the touchmove runs...
      if (touchMove) {
        // Reset touchmove to false
        touchMove = false;
        // And end function
        return false;
      }
      var target = event.target || event.srcElement;
      angular.forEach(listeners, function (listener, i) {
        if (
          !(
            listener.elm.contains(target) ||
            targetInFilter(target, listener.clickOffFilter)
          )
        ) {
          $rootScope.$evalAsync(function () {
            listener.cb(listener.scope, {
              $event: event,
            });
          });
        }
      });
    }

    return {
      restrict: 'A',
      compile: function ($element, attr) {
        var fn = $parse(attr.clickOff);
        return function (scope, element) {
          var elmId = id++;
          var clickOffFilter;
          var removeWatcher;

          clickOffFilter = document.querySelectorAll(
            scope.$eval(attr.clickOffFilter)
          );

          if (attr.clickOffIf) {
            removeWatcher = $rootScope.$watch(
              function () {
                return $parse(attr.clickOffIf)(scope);
              },
              function (newVal) {
                if (newVal) {
                  on();
                } else if (!newVal) {
                  off();
                }
              }
            );
          } else {
            on();
          }

          attr.$observe('clickOffFilter', function (value) {
            clickOffFilter = document.querySelectorAll(scope.$eval(value));
          });

          scope.$on('$destroy', function () {
            off();
            if (removeWatcher) {
              removeWatcher();
            }
            element = null;
          });

          function on() {
            listeners[elmId] = {
              elm: element[0],
              cb: fn,
              scope: scope,
              clickOffFilter: clickOffFilter,
            };
          }

          function off() {
            listeners[elmId] = null;
            delete listeners[elmId];
          }
        };
      },
    };
  },
]);
