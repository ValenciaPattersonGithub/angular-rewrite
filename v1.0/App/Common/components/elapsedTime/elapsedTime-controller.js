// ***************************************
// This file is obsolete, has been migrated to Angular and is only here for reference
// Please see src\@shared\components\elapsed-time\elapsed-time.component.ts for the new version
// ***************************************

// 'use strict';

// angular.module("common.controllers")
//     .controller('ElapsedTimeController', ['$scope', '$interval','localize','$timeout', function ($scope, $interval,localize, $timeout) {
//         var ctrl = this;
//         ctrl.stop = undefined;

//         // Calculate the elapsed time every 1 minute
//         ctrl.setElapsedTime = function () {
//             $scope.elapsedTimeString = "";

//             if (!$scope.startTime) return;

//             // handle utc
//             $scope.startTime = ($scope.startTime.lastIndexOf('Z') === $scope.startTime.length -1) ? $scope.startTime: $scope.startTime + 'Z';

//             var elapsedTime = "";
//             var time = Date.parse($scope.startTime),
//                 timeNow = new Date().getTime(),
//                 difference = timeNow - time,
//                 seconds = Math.floor(difference / 1000),
//                 minutes = Math.floor(seconds / 60);

//             if (minutes > 1) {
//                 elapsedTime = elapsedTime + minutes + " " + localize.getLocalizedString('Minutes Elapsed');
//                 $scope.elapsedTimeString = "(" + elapsedTime + ")";
//             }

//             if (minutes == 1) {
//                 elapsedTime = elapsedTime + minutes + " " + localize.getLocalizedString('Minute Elapsed');
//                 $scope.elapsedTimeString = "(" + elapsedTime + ")";
//             }

//             // this was added for bug in IE and FF which never updates the page
//             if ($scope.elapsedTimeString) {
//                 $timeout(function () {
//                     $scope.$apply();
//                 }, 0);
//             }
//         };

//         // Start calculating elapsed time of an InTreatment appointment
//         if (!$scope.endTime && $scope.startTime) {
//             ctrl.stop = $interval(function () { ctrl.setElapsedTime(); }, 3000);
//         }

//         // Stop calculating elapsed time for InTreatment appointment once appointment has finished and actual end time is provided
//         if ($scope.endTime) {
//             $interval.cancel(ctrl.stop);
//             ctrl.stop = undefined;
//         }

//         // Stop calculation of elapsed time
//         $scope.$on('$destroy', function () {
//             $interval.cancel(ctrl.stop);
//             ctrl.stop = undefined;
//         });

//     }]);
