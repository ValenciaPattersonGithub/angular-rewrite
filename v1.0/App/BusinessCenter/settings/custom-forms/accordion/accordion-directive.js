'use strict';
angular
  .module('common.directives')
  .directive('angularAccordion', function () {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        showFooterPage: '@',
        customForm: '=',
        formType: '@',
        canEditForm: '=',
      },
      templateUrl:
        'App/BusinessCenter/settings/custom-forms/accordion/accordion.html',
      controller: 'SectionsAccordionController',
    };
  })
  .directive('paneHeader', [
    '$window',
    function ($window) {
      return {
        restrict: 'EA',
        require: '^angularAccordion',
        replace: true,
        link: function (scope, iElement, iAttrs, controller) {
          scope.expanded = true;
          scope.passOnExpand = iAttrs.passOnExpand;
          scope.disabled = iAttrs.disabled;
          controller.addPane(scope);

          // TODO: figure out how to trigger this without interpolation in the template
          iAttrs.$observe('disabled', function (value) {
            // attributes always get passed as strings
            if (value === 'true') {
              scope.disabled = true;
            } else {
              scope.disabled = false;
            }
          });

          var computed = function (rawDomElement, property) {
            var computedValueAsString = $window
              .getComputedStyle(rawDomElement)
              .getPropertyValue(property)
              .replace('px', '');
            return parseFloat(computedValueAsString);
          };

          var computeExpandedPaneHeight = function () {
            var parentContainer = iElement.parent().parent()[0];
            var header = iElement[0];
            var paneWrapper = iElement.parent()[0];
            var contentPane = iElement.next()[0];
            var headerCount = iElement.parent().parent().children().length;

            var containerHeight = computed(parentContainer, 'height');
            var headersHeight =
              (computed(header, 'height') +
                computed(header, 'padding-top') +
                computed(header, 'padding-bottom') +
                computed(header, 'margin-top') +
                computed(header, 'margin-bottom') +
                computed(header, 'border-top') +
                computed(header, 'border-bottom') +
                computed(paneWrapper, 'padding-top') +
                computed(paneWrapper, 'padding-bottom') +
                computed(paneWrapper, 'margin-top') +
                computed(paneWrapper, 'margin-bottom') +
                computed(paneWrapper, 'border-top') +
                computed(paneWrapper, 'border-bottom')) *
                headerCount +
              (computed(contentPane, 'padding-top') +
                computed(contentPane, 'padding-bottom') +
                computed(contentPane, 'margin-top') +
                computed(contentPane, 'margin-bottom') +
                computed(contentPane, 'border-top') +
                computed(contentPane, 'border-bottom'));

            return containerHeight - headersHeight;
          };

          // Function to toggle display of accodion's body
          scope.toggleAccordion = function () {
            if (!scope.disabled) {
              scope.expanded = !scope.expanded;

              if (scope.expanded) {
                iElement
                  .next()
                  .css('height', computeExpandedPaneHeight() + 'px');
                scope.$emit('angular-accordion-expand', scope.passOnExpand);
              }

              controller.expandPane(scope);
            }
          };

          // Function to display accodion's body
          scope.openAccordion = function (allowOpen) {
            if (!scope.disabled) {
              if (allowOpen == false) {
                return;
              } else {
                if (!scope.expanded) {
                  scope.expanded = !scope.expanded;

                  iElement
                    .next()
                    .css('height', computeExpandedPaneHeight() + 'px');
                  scope.$emit('angular-accordion-expand', scope.passOnExpand);
                }
              }
              controller.expandPane(scope);
            }
          };

          // Function to hide accodion's body
          scope.closeAccordion = function () {
            scope.expanded = false;
            scope.showme = true;
            scope.hideme = false;

            scope.expandPane(scope);
          };

          scope.$on('expand', function (event, eventArguments) {
            if (eventArguments === scope.passOnExpand) {
              // only toggle if we are loading a deeplinked route
              if (!scope.expanded) {
                scope.toggleAccordion();
              }
            }
          });

          iElement.on('$destroy', function () {
            scope.$destroy();
          });
        },
      };
    },
  ]);
