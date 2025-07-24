'use strict';

/*
 
 *** SOAR ANIMATIONS ***

    1. Register your animation to the object located in soarAnimate-factory.js
         - If possible, parameterize variables (such as color) to allowthe function 
           to expand it's use to differnt states such as success, error, etc.

    2. Register any CSS associated with the animation to soarAnimate.less
        - Add a Title to your CSS code that matches the JS function name
        - If possible, use the same name for the JS function, CSS class, and animation
          to promote continuity and standardization
        - If possible, create the animation as a mixin to allow it to be expand
          it's use to different states such as success, error, warning, etc.
        - Follow BEM naming conventions
        - 

*/

angular.module('common.factories').factory('soarAnimation', [
  '$http',
  '$rootScope',
  '$window',
  function ($http, $rootScope, $window) {
    var soarAnimation = {
      soarFlashBG: function (currentTarget, offTarget, state) {
        var offTarget = offTarget == undefined ? false : offTarget;
        var state = state == undefined ? 'success' : state;

        var aniClass = 'soarFlashBG--' + state;

        if (offTarget != false) {
          $(currentTarget)
            .closest(offTarget)
            .addClass(aniClass)
            .delay(1000)
            .queue(function (next) {
              $(this).removeClass(aniClass);
              next();
            });
        } else {
          $(currentTarget)
            .addClass(aniClass)
            .delay(1000)
            .queue(function (next) {
              $(this).removeClass(aniClass);
              next();
            });
        }
      },
      soarVPos: function (currentTarget) {
        var height = $window.innerHeight;
        var eVPos = currentTarget.getBoundingClientRect().bottom;
        var calcVPos = height - eVPos;
        var vDir = false;
        if (calcVPos < 300) {
          vDir = true;
        }
        return vDir;
      },
    };
    return soarAnimation;
  },
]);
