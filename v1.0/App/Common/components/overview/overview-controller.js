'use strict';

angular.module('common.controllers').controller('OverviewController', [
  '$scope',
  '$window',
  '$timeout',
  function ($scope, $window, $timeout) {
    var ctrl = this;

    $scope.window = $window;
    $scope.visible = false;

    $scope.canOpen = true;
    $scope.forceHide = false;

    ctrl.initialized = false;
    ctrl.arrowPlacement = null;
    $scope.arrowClass = null;

    ctrl.target = {
      Height: 0,
      Width: 0,
      Top: 0,
      Left: 0,
    };

    // placement enum
    ctrl.placement = {
      Top: 'Top',
      Bottom: 'Bottom',
      Left: 'Left',
      Right: 'Right',
      Center: 'Center',
    };

    ctrl.resize = function () {
      // if it hasn't been initialized we skip, otherwise re-initialize
      if (ctrl.initialized) {
        ctrl.initialization();
      }
    };

    $scope.$watch('window.resize', function () {
      $timeout(function () {
        ctrl.resize();
      }, 250);
    });

    ctrl.initialization = function () {
      ctrl.target.Width = Number($scope.$target.css('width').replace('px', ''));
      ctrl.target.Height = Number(
        $scope.$target.css('height').replace('px', '')
      );

      var box = $scope.$target[0].getBoundingClientRect();

      /** 50 is for global nav */
      ctrl.target.Top = box.top - 50;
      ctrl.target.Left = box.left;

      ctrl.target.Top = ctrl.target.Top;
      ctrl.centeredTop = $scope.height / 2 - ctrl.target.Height / 2;

      ctrl.initialized = true;
    };

    ctrl.getPosition = function () {
      var top = 0;
      var left = 0;
      var placement = ctrl.getPlacement();
      var topOffset = ctrl.target.Top;
      var leftOffset = ctrl.target.Left;
      var arrowOffset = 15;
      ctrl.docScroll = $(window).scrollTop();

      /* Get Top Position*/

      // Top
      if (placement.Top == ctrl.placement.Top) {
        top = -1 * ($scope.height + arrowOffset) + topOffset;

        // set arrow placement to Bottom
        ctrl.arrowPlacement = ctrl.placement.Bottom;
      }
      // Bottom
      else if (placement.Top == ctrl.placement.Bottom) {
        top = ctrl.target.Height + arrowOffset + topOffset;

        // set arrow placement to Top
        ctrl.arrowPlacement = ctrl.placement.Top;
      }
      // TopCenter
      else if (placement.Top == ctrl.placement.Top + ctrl.placement.Center) {
        top = -1 * ctrl.centeredTop + topOffset;
      }

      /* Calculate Left Position */

      // Left
      if (placement.Left == ctrl.placement.Left) {
        left = -1 * ($scope.width + arrowOffset) + leftOffset;

        // set arrow placement to RightCenter
        ctrl.arrowPlacement = ctrl.placement.Right + ctrl.placement.Center;
      }
      // Right
      else if (placement.Left == ctrl.placement.Right) {
        left = 1 * (ctrl.target.Width + arrowOffset) + leftOffset;

        // set arrow placement to LeftCenter
        ctrl.arrowPlacement = ctrl.placement.Left + ctrl.placement.Center;
      }
      // LeftCenter
      else if (placement.Left == ctrl.placement.Left + ctrl.placement.Center) {
        left =
          -1 * ($scope.width / 2 - ctrl.target.Width / 2 + $scope.width / 2) +
          leftOffset;

        // set arrow placement to TopRight or BottomRight
        ctrl.arrowPlacement = ctrl.arrowPlacement + ctrl.placement.Right;
      }
      // RightCenter
      else if (placement.Left == ctrl.placement.Right + ctrl.placement.Center) {
        left = ctrl.target.Width / 2 + leftOffset;

        // set arrow placement to TopLeft or BottomLeft
        ctrl.arrowPlacement = ctrl.arrowPlacement + ctrl.placement.Left;
      }

      return {
        Top: top,
        Left: left,
      };
    };

    ctrl.getPlacement = function () {
      // priorotize to left placement
      var topPlacement, leftPlacement;
      ctrl.docScroll = $(window).scrollTop();

      /* Find Left Placement */

      if (
        (ctrl.target.Left + ctrl.target.Width + $scope.width) /
          $window.innerWidth <
        1.0
      ) {
        // Right
        leftPlacement = ctrl.placement.Right;
      } else if (ctrl.target.Left > $scope.width) {
        // Left
        leftPlacement = ctrl.placement.Left;
      } else {
        // RightCenter
        leftPlacement = ctrl.placement.Right + ctrl.placement.Center;
      }

      /* Find Top Placement */

      if (
        leftPlacement != ctrl.placement.Right + ctrl.placement.Center &&
        ctrl.target.Top - ctrl.centeredTop > ctrl.docScroll &&
        ctrl.target.Top + ctrl.target.Height + ctrl.centeredTop <
          $window.innerHeight + ctrl.docScroll
      ) {
        // TopCenter
        topPlacement = ctrl.placement.Top + ctrl.placement.Center;
      } else if (ctrl.target.Top - ctrl.centeredTop < ctrl.docScroll) {
        // Bottom
        topPlacement = ctrl.placement.Bottom;
      } else if (
        ctrl.target.Top + ctrl.target.Height + ctrl.centeredTop >
        $window.innerHeight + ctrl.docScroll
      ) {
        // Top
        topPlacement = ctrl.placement.Top;
      } else {
        // TopCenter
        topPlacement = ctrl.placement.Top + ctrl.placement.Center;
      }

      // placement overrides
      if (topPlacement != ctrl.placement.Top + ctrl.placement.Center) {
        // LeftCenter or RightCenter
        leftPlacement =
          leftPlacement == ctrl.placement.Left
            ? ctrl.placement.Left + ctrl.placement.Center
            : ctrl.placement.Right + ctrl.placement.Center;
      }

      return {
        Top: topPlacement,
        Left: leftPlacement,
      };
    };

    ctrl.getArrowClass = function () {
      var leftRight = ctrl.target.Width / 2 > 100 ? '50px' : '20px';
      ctrl.arrowPlacement =
        $scope.hideArrow == true ? null : ctrl.arrowPlacement;

      if (ctrl.arrowPlacement == ctrl.placement.Right + ctrl.placement.Center) {
        $scope.$arrow.css({
          top: $scope.height / 2,
          right: '-20px',
        });

        return 'overview-arrow-right';
      } else if (
        ctrl.arrowPlacement ==
        ctrl.placement.Left + ctrl.placement.Center
      ) {
        $scope.$arrow.css({
          top: $scope.height / 2,
          left: '-20px',
        });

        return 'overview-arrow-left';
      } else if (
        ctrl.arrowPlacement ==
        ctrl.placement.Top + ctrl.placement.Right
      ) {
        $scope.$arrow.css({
          top: '-20px',
          right: leftRight,
        });

        return 'overview-arrow-up';
      } else if (
        ctrl.arrowPlacement ==
        ctrl.placement.Top + ctrl.placement.Left
      ) {
        $scope.$arrow.css({
          top: '-20px',
          left: leftRight,
        });

        return 'overview-arrow-up';
      } else if (
        ctrl.arrowPlacement ==
        ctrl.placement.Bottom + ctrl.placement.Right
      ) {
        $scope.$arrow.css({
          bottom: '-20px',
          right: leftRight,
        });

        return 'overview-arrow-down';
      } else if (
        ctrl.arrowPlacement ==
        ctrl.placement.Bottom + ctrl.placement.Left
      ) {
        $scope.$arrow.css({
          bottom: '-20px',
          left: leftRight,
        });

        return 'overview-arrow-down';
      } else {
        return null;
      }
    };

    ctrl.getCssProperties = function () {
      var position = ctrl.getPosition();

      $scope.arrowClass = ctrl.getArrowClass();

      return {
        position: 'absolute',
        'z-index': 1000,
        'background-color': 'white',
        color: 'black',
        top: position.Top + 'px',
        left: position.Left + 'px',
        display: 'block',
        height: $scope.height,
        width: $scope.width,
        '-webkit-filter': 'drop-shadow(3px -1px 4px #AAA)',
      };
    };

    ctrl.applyCss = function () {
      if (!ctrl.initialized) {
        ctrl.initialization();
      }

      if ($scope.visible) {
        return ctrl.getCssProperties();
      } else {
        return { display: 'none' };
      }
    };

    $scope.$watch('overrideOpen', function (nv, ov) {
      if (nv == true || nv == null) {
        $scope.canOpen = true;
      } else {
        $scope.canOpen = false;
      }
    });

    $scope.$watch('overrideClose', function (nv) {
      if (nv == true) {
        $scope.forceHide = true;
        $scope.$target.blur();
      } else {
        $scope.forceHide = false;
      }
    });
  },
]);
