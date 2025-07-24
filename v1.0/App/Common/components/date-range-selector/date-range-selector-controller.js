'use strict';

angular
  .module('common.controllers')
  .controller('DateRangeSelectorController', [
    '$scope',
    '$templateRequest',
    '$compile',
    '$filter',
    'TimeZoneFactory',
    DateRangeSelectorController,
  ]);
function DateRangeSelectorController(
  $scope,
  $templateRequest,
  $compile,
  $filter,
  timeZoneFactory
) {
  BaseCtrl.call(this, $scope, 'DateRangeSelectorController');
  var ctrl = this;
  $scope.visible = false;
  $scope.position = {
    top: '-1000px',
    left: '0',
  };

  $scope.dateFromValue = $scope.fromValue;
  $scope.dateToValue = $scope.toValue;

  $scope.dateRange = '';
  var updateDateRange = function () {
    var fromDisplay = $filter('toShortDisplayDate')($scope.dateFromValue);
    var toDisplay = $filter('toShortDisplayDate')($scope.dateToValue);
    if (fromDisplay !== '' && toDisplay !== '') {
      $scope.dateRange = fromDisplay + ' to ' + toDisplay;
    } else {
      if (fromDisplay !== '') {
        $scope.dateRange = '>= ' + fromDisplay;
      } else if (toDisplay !== '') {
        $scope.dateRange = '<= ' + toDisplay;
      } else {
        $scope.dateRange = '';
      }
    }
  };

  $scope.$watch('fromValue', function (nv) {
    if (typeof nv === 'undefined' || nv === null || nv === '') {
      $scope.dateFromValue = null;
    } else {
      $scope.dateFromValue = nv;
    }
    updateDateRange();
  });

  $scope.$watch('toValue', function (nv) {
    if (typeof nv === 'undefined' || nv === null || nv === '') {
      $scope.dateToValue = null;
    } else {
      $scope.dateToValue = nv;
    }
    updateDateRange();
  });

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
    $event.preventDefault();
    $event.stopPropagation();

    $scope.fromValue = $filter('toShortDisplayDate')($scope.dateFromValue);
    $scope.toValue = $filter('toShortDisplayDate')($scope.dateToValue);

    updateDateRange();

    $scope.close($event);
    $scope.$$postDigest(function () {
      $scope.applyAction();
    });
  };

  $scope.clear = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.$broadcast('dateSelector.clear');
  };

  $scope.close = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.visible = false;
  };

  $scope.onMouseLeave = function ($event) {
    $event.currentTarget.focus();
  };

  $scope.onBlur = function ($event) {
    var relatedTarget =
      $event.relatedTarget != null ? $event.relatedTarget : $(':focus')[0];
    if (
      $('.date-range-selector-popup').find(relatedTarget).length < 1 &&
      $('div[uib-datepicker-popup-wrap]').find(relatedTarget).length < 1
    ) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.dateFromValue = $scope.fromValue;
      $scope.dateToValue = $scope.toValue;
      $scope.visible = false;
    }
  };

  $templateRequest(
    'App/Common/components/date-range-selector/date-range-selector-popup-template.html'
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

DateRangeSelectorController.prototype = Object.create(BaseCtrl.prototype);
