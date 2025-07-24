'use strict';
//Taken from an example plunkr: https://embed.plnkr.co/plunk/gCkYts
angular.module('common.directives').directive('textAutoGrow', function () {
  return {
    restrict: 'A',
    scope: true,
    link: function (scope, element, attributes, ctrl) {
      var minHeight =
        parseInt(
          window.getComputedStyle(element[0]).getPropertyValue('min-height')
        ) || 0;

      // prevent newlines in textbox
      element.on('keydown', function (evt) {
        if (evt.which === 13) {
          evt.preventDefault();
        }
      });

      element.on('input', function (evt) {
        element.css({
          paddingTop: 0,
          height: 0,
          minHeight: 0,
        });

        var contentHeight = this.scrollHeight;
        var borderHeight = this.offsetHeight;

        element.css({
          paddingTop: ~~Math.max(0, minHeight - contentHeight) / 2 + 'px',
          minHeight: null,
          height: contentHeight + borderHeight + 'px',
        });
      });

      // watch model changes from the outside to adjust height
      scope.$watch(attributes.ngModel, trigger);

      // set initial size
      trigger();

      function trigger() {
        setTimeout(element.triggerHandler.bind(element, 'input'), 1);
      }
    },
  };
});
