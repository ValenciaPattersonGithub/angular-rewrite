'use strict';

angular
  .module('common.controllers')
  .controller('NumberRangeSelectorController', [
    '$scope',
    '$templateRequest',
    '$compile',
    NumberRangeSelectorController,
  ]);
function NumberRangeSelectorController($scope, $templateRequest, $compile) {
  BaseCtrl.call(this, $scope, 'NumberRangeSelectorController');
  var ctrl = this;
  $scope.$watch('fromValue', function (nv) {
    if (nv === '' || nv === null) {
      $scope.currentFromValue = null;
      var toLabel =
        $scope.toValue !== '' && $scope.toValue !== null
          ? ' < = ' + $scope.toValue
          : '';
      $scope.filterValues = toLabel;
    }
  });

  $scope.$watch('toValue', function (nv) {
    if (nv === '' || nv === null) {
      $scope.currentToValue = null;
      var fromLabel =
        $scope.fromValue !== '' && $scope.fromValue !== null
          ? ' < = ' + $scope.fromValue
          : '';
      $scope.filterValues = fromLabel;
    }
  });

  $scope.currentFromValue = null;
  $scope.currentToValue = null;
  $scope.filterValues = '';

  $scope.visible = false;
  $scope.position = {
    top: '-1000px',
    left: '0',
  };

  $scope.toggle = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    var targetPos = $($event.currentTarget).offset();
    var height = $($event.currentTarget).outerHeight();
    $scope.position.top = targetPos.top + height + 'px';
    var maxLeft = $('body')[0].clientWidth - 350;
    $scope.position.left =
      targetPos.left > maxLeft ? maxLeft + 'px' : targetPos.left + 'px';
    $scope.visible = !$scope.visible;
  };

  $scope.apply = function ($event) {
    $scope.message = '';

    $event.preventDefault();
    $event.stopPropagation();

    if (
      $scope.currentFromValue !== null &&
      $scope.currentFromValue !== '' &&
      $scope.currentToValue !== null &&
      $scope.currentToValue !== '' &&
      $scope.currentFromValue > $scope.currentToValue
    ) {
      $scope.message = 'Invalid range value.';
    } else {
      $scope.fromValue = $scope.currentFromValue;
      $scope.toValue = $scope.currentToValue;

      var fromLabel =
        $scope.fromValue !== '' && $scope.fromValue !== null
          ? '> = ' + $scope.fromValue
          : '';
      var toLabel =
        $scope.toValue !== '' && $scope.toValue !== null
          ? ' < = ' + $scope.toValue
          : '';
      if (fromLabel !== '' && toLabel !== '') {
        $scope.filterValues = fromLabel + ' and ' + toLabel;
      } else {
        $scope.filterValues = fromLabel + toLabel;
      }
      $scope.close($event);
      $scope.$$postDigest(function () {
        $scope.applyAction();
      });
    }
  };

  $scope.clear = function () {
    $scope.currentFromValue = '';
    $scope.currentToValue = '';
    $scope.message = '';
  };

  $scope.close = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.currentFromValue = $scope.fromValue;
    $scope.currentToValue = $scope.toValue;
    $scope.visible = false;
  };

  $scope.onBlur = function ($event) {
    var relatedTarget =
      $event.relatedTarget != null ? $event.relatedTarget : $(':focus')[0];
    if ($('.number-selector-popup').find(relatedTarget).length < 1) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.currentFromValue = $scope.fromValue;
      $scope.currentToValue = $scope.toValue;
      $scope.message = '';
      $scope.visible = false;
    }
  };

  $templateRequest(
    'App/Common/components/number-range-selector/number-range-selector-popup-template.html'
  ).then(function (template) {
    ctrl.compiled = $compile(template)($scope);
    $('body').append(ctrl.compiled);
  });

  $scope.$on('$destroy', function () {
    if (ctrl && ctrl.compiled) {
      ctrl.compiled.remove();
    }
  });
}

NumberRangeSelectorController.prototype = Object.create(BaseCtrl.prototype);
