var app = angular.module('Soar.Schedule');

app.controller('ScheduleSettingsController', [
  '$scope',
  '$location',
  'CommonServices',
  'BoundObjectFactory',
  'ModalFactory',
  '$routeParams',
  function (
    $scope,
    $location,
    commonServices,
    boundObjectFactory,
    modalFactory,
    $routeParams,
  ) {
    var ctrl = this;

    $scope.fromSchedule = false;
    $scope.fromPracticeSettings = false;
    $scope.returnUrl = '/';

    ctrl.setBreadcrumbs = function () {
      if (typeof $routeParams.source !== 'undefined') {
        var source = $routeParams.source;

        if (source === 'schedule') {
          $scope.fromSchedule = true;

          var params = $location.search();
          var queryString = '';

          angular.forEach(params, function (value, key) {
            if (key !== 'newTab' && key !== 'newKey') {
              queryString += key + '=' + value + '&';
            }
          });

          $scope.returnUrl = '/Schedule/?' + queryString;
        } else if (source === 'scheduleV2') {
          $scope.fromSchedule = true;

          var params = $location.search();
          var queryString = '';

          angular.forEach(params, function (value, key) {
            if (key !== 'newTab' && key !== 'newKey') {
              queryString += key + '=' + value + '&';
            }
          });

          $scope.returnUrl = '/schedule/v2?' + queryString;
        } else if (source === 'practiceSettings') {
          $scope.fromPracticeSettings = true;
          $scope.returnUrl = '/BusinessCenter/PracticeSettings/';
        }
      }
    };

    ctrl.setBreadcrumbs();

    $scope.navigatePracticeSettings = function () {
      if (ctrl.hasChanges()) {
        modalFactory.CancelModal().then(ctrl.leavePage);
      } else {
        ctrl.leavePage();
      }
    };

    $scope.navigateSchedule = function () {
      if (ctrl.hasChanges()) {
        modalFactory.CancelModal().then(ctrl.leavePage);
      } else {
        ctrl.leavePage();
      }
    };

    ctrl.hasChanges = function () {
      var returnValue = false;

      if (
        $scope.settings &&
        $scope.settings.Data &&
        $scope.settings.OriginalData
      ) {
        var oldValue = '' + $scope.settings.OriginalData.DefaultTimeIncrement;
        var newValue = '' + $scope.settings.Data.DefaultTimeIncrement;

        if (oldValue !== newValue) {
          returnValue = true;
        }
      }

      return returnValue;
    };

    ctrl.handleDropDownKeyDown = function (e) {
      e.stopImmediatePropagation();
    };

    ctrl.handleDropDownCreated = function (event, widget) {
      if (widget.ns == '.kendoDropDownList') {
        widget.list.width(300);

        widget.wrapper.on('keydown', ctrl.handleDropDownKeyDown);
      }
    };

    $scope.$on('kendoWidgetCreated', ctrl.handleDropDownCreated);

    $scope.timeIncrements = [
      { Display: '5 minutes', Value: 5 },
      { Display: '10 minutes', Value: 10 },
      { Display: '15 minutes', Value: 15 },
      { Display: '20 minutes', Value: 20 },
      { Display: '30 minutes', Value: 30 },
    ];

    $scope.settings = boundObjectFactory.Create(
      commonServices.PracticeSettings
    );

    $scope.showCancelModal = function () {
      if ($scope.settings.HasChanges()) {
        modalFactory.CancelModal().then(ctrl.leavePage);
      } else {
        ctrl.leavePage();
      }
    };

    ctrl.leavePage = function () {
      $location.url($scope.returnUrl);
    };

    $scope.settings.AfterSaveSuccess = ctrl.leavePage;

    ctrl.initializeFocus = function () {
      angular
        .element('#inpTimeIncrements')
        .data('kendoDropDownList')
        .span.focus();
    };

    setTimeout(ctrl.initializeFocus, 500);

    $scope.valueTemplate = kendo.template(
      '<div id="valueTemplate" type="text/x-kendo-template">' +
        '<div ng-show="dataItem">' +
        '<span id="lblSettingsDisplay" class="value-template-input k-state-default">#: Display #</span>' +
        '</div>' +
        '</div>'
    );
  },
]);
