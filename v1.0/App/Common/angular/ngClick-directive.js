// // If you are thinking about putting this back into the application you need to talk to someone about that first.
//
// if you want to do this ... put the below code in an outer element from the click that you do not want to bubble.
// onclick="event.stopPropagation(); window.event.cancelBubble = true;"
//
// // Added back in until we figure out what is happening with click through on the icons for the schedule page.
//
// // look at this example instead
// //https://stackoverflow.com/questions/20300866/angularjs-ng-click-stoppropagation
//
// 'use strict';
// //var numberOfClick = 0;
// //var numberOfDestroy = 0;
// angular.module("angular.directives")
//     .directive('ngClick',['$timeout', function ($timeout) {
//         var delay = 10;
//         var disabled = false;
//         return {
//             restrict: 'A',
//             priority: -1,
//             link: function (scope, elem) {
//
//                 function onClick(evt) {
//                     //numberOfClick++;
//                     //console.log('Num Of Click: ' + numberOfClick);
//                     if (disabled && elem.parents('[use-default-click]').length == 0) {
//                         evt.preventDefault();
//                         evt.stopImmediatePropagation();
//                     } else {
//                         disabled = true;
//                         $timeout(function () { disabled = false; }, delay, false);
//                     }
//                 }
//
//                 // scope.$on('$destroy', function () {
//                 //     numberOfDestroy++;
//                 //     console.log('Num Of Destroy: ' + numberOfDestroy);
//                 //     elem.off('click', onClick); });
//                 elem.on('click', onClick);
//             }
//         };
//     }
//     ]
// );
