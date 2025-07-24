'use strict';

angular
  .module('common.directives')
  .directive('highlightRelevantItems', function () {
    return {
      scope: {
        detectPos: '&',
      },
      link: function link(scope, element, attrs) {
        scope.detectPos = function () {
          var distanceScrolled = $(window).scrollTop();

          // If negative offset is present, adjust top of element.
          if (attrs.negativeOffset) {
            var offset = attrs.negativeOffset;
          } else {
            var offset = 0;
          }

          var topOfElement = element.offset().top - 125 - offset;
          var height = element.height();
          var link = '[href="#' + element.attr('id') + '"]';
          var delta = topOfElement - distanceScrolled;
          var offScreen = delta + height;

          if (delta < 0 && offScreen > 0) {
            $(link).addClass('active');
          } else if (delta >= 0) {
            $(link).removeClass('active');
          } else if (offScreen <= 0) {
            $(link).removeClass('active');
          }
          //console.log(element.attr('id') + ' ' + topOfElement);
        };

        $(window).bind('scroll', function () {
          scope.detectPos();
        });
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
