'use strict';

var app = angular.module('Soar.Patient');

app.controller('PerioStatsToothTileController', [
  '$scope',
  function ($scope) {
    //#region Variables
    $scope.timelineView = true;
    var ctrl = this;

    //An array that holds attachment level values
    $scope.AttachmentLevel = [];

    //#endregion

    //#region Functions

    //Function to calculate attachment level
    ctrl.calculateAttachmentLevel = function () {
      var index = 0;
      var gingivalMarginPacket = 0;
      var attachmentLeveltotal = 0;

      //processing depth pocket and gingival margin pocket for proper attachment level calculation
      angular.forEach(
        $scope.perioStatsToothExam.DepthPocket,
        function (depthPocket) {
          if (depthPocket == null) {
            $scope.perioStatsToothExam.DepthPocket[index] = '';
          }

          gingivalMarginPacket =
            $scope.perioStatsToothExam.GingivalMarginPocket[index];
          if (gingivalMarginPacket == null) {
            $scope.perioStatsToothExam.GingivalMarginPocket[index] = '';
          }

          if (depthPocket == null && gingivalMarginPacket == null) {
            $scope.AttachmentLevel[index] = '';
          } else {
            $scope.AttachmentLevel[index] =
              (depthPocket == null ? 0 : depthPocket) +
              (gingivalMarginPacket == null ? 0 : gingivalMarginPacket);
            attachmentLeveltotal += $scope.AttachmentLevel[index];
          }

          index++;
        }
      );
    };

    //#endregion

    //#region Startup calls

    //Initializing perio tooth tile
    ctrl.init = function () {
      ctrl.calculateAttachmentLevel();
    };

    //calling initialization function
    ctrl.init();

    //#endregion
  },
]);
