'use strict';

angular.module('common.directives').directive('checkAuthZ', [
  'AuthZService',
  function (authZ) {
    return {
      restrict: 'A',
      controller: [
        '$scope',
        '$element',
        '$attrs',
        function ($scope, $element, $attrs) {
          var ctrl = this;

          ctrl.titleString = authZ.generateTitleMessage();
          ctrl.access = null;
          var element = angular.element($element);
          ctrl.forceDisable = false;

          $attrs.$observe('checkAuthZ', function (value) {
            if (_.isString(value)) {
              var valueLowerCase = value.toLowerCase();
              if (_.includes(['true', 'false'], valueLowerCase)) {
                ctrl.forceDisable = JSON.parse(valueLowerCase);
              } else {
                ctrl.access = value;
              }
            }
            ctrl.checkAuthZ();
          });

          // JRW - this is dummy functionality for now, need to fully implement
          ctrl.checkAuthZ = function () {
            if (ctrl.forceDisable) {
              ctrl.disableElement();
            } else if (ctrl.access) {
              var accessList = ctrl.access.split(',');
              var hasAccess = false;
              var hasAllAccess = true;

              // Check multiple AMFA access
              if (accessList && accessList.length > 1) {
                _.forEach(accessList, function (access) {
                  hasAllAccess = hasAllAccess && authZ.checkAuthZ(access);
                });

                hasAccess = hasAllAccess;
              } else {
                // Check single AMFA access
                hasAccess = authZ.checkAuthZ(ctrl.access);
              }
              if (!hasAccess) {
                ctrl.disableElement();
              }
            }
          };
          ctrl.checkAuthZ();

          ctrl.disableElement = function () {
            element.addClass('disabled');
            element.attr('disabled', 'disabled');

            //Display Tooltip on disabled element
            var elementTitle = element.attr('title');
            if (elementTitle) {
              elementTitle += ' - ' + ctrl.titleString;
            } else {
              elementTitle = ctrl.titleString;
            }
            element.attr('title', elementTitle);

            //Disable anchor element
            if (element.is('a') || element.is('i')) {
              element.removeAttr('href');
              element.removeAttr('ng-href');
            }

            element.removeAttr('ng-click');
            element.removeAttr('ng-mousedown');
            element.unbind('click');
            element.unbind('mousedown');

            //Remove ng-disable to prevent element from getting enable
            element.removeAttr('ng-disabled');
          };
        },
      ],
    };
  },
]);
