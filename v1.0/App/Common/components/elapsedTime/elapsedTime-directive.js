// ***************************************
// This file is obsolete, has been migrated to Angular and is only here for reference
// Please see src\@shared\components\elapsed-time\elapsed-time.component.ts for the new version
// ***************************************

// 'use strict';

// angular.module("common.directives")
//     .directive('elapsedTime', ['$interval', function ($interval) {
//         return {
//             restrict: 'E',
//             scope: {
//                 // Start time from when elapsed time should be calculated
//                 startTime: '=',
//                 // End time after which elapsed time calculation should stop
//                 endTime: '=?'
//             },
//             templateUrl: 'App/Common/components/elapsedTime/elapsedTime.html',
//             controller: 'ElapsedTimeController',
//             link: function link(scope, element, attrs) {
//                 element.on('$destroy', function elementOnDestroy() {
//                     scope.$destroy();
//                 });
//             }
//         };
//     }]);
