'use strict';

angular
  .module('common.directives')
  .directive('scrollToOffset', function () {
    return {
      scope: {
        offset: '=',
      },
      link: function ($scope, element, attrs) {
        element.bind('click', function (event) {
          // Prevent the default event for this
          event.preventDefault();
          // Set default offset
          if (!$scope.offset) {
            $scope.offset = 75;
          }

          // If the HREF is present, scroll to that element (offset from header)
          if (attrs.href) {
            // If negative offset is present, adjust scroll offset.
            if (attrs.negativeOffset) {
              var negativeOffset = attrs.negativeOffset;
            } else {
              var negativeOffset = 0;
            }

            $('html, body').animate(
              {
                scrollTop:
                  $(attrs.href).offset().top - $scope.offset - negativeOffset,
              },
              300
            );
          }
        });
      },
    };
  })
  .directive('scrollTo', function () {
    return function (scope, element, attrs) {
      element.bind('click', function (event) {
        // Prevent the default event for this
        event.preventDefault();
        angular.element(attrs.href).focus();
        angular.element(attrs.href).get(0).scrollIntoView(true);
      });
    };
  });
//.directive('scrollTo', function () {
//    return function (scope, element, attrs) {
//        element.bind("click", function (event) {
//            // Prevent the default event for this
//            event.preventDefault();

//            // If the HREF is present, scroll to that element (offset from header)
//            if (attrs.href) {
//               $('html, body').stop().animate({
//                    scrollTop: $(attrs.href).offset().top - 75
//               }, 300);
//            }
//        });
//    }
//});
