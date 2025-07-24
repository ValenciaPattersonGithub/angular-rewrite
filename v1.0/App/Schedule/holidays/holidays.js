'use strict';

angular.module('Soar.Schedule').controller('HolidaysController', [
  '$scope',
  'ModalFactory',
  'ListHelper',
  'ScheduleServices',
  'toastrFactory',
  'patSecurityService',
  'localize',
  '$timeout',
  '$routeParams',
  '$location',
  'referenceDataService',
  'HolidaysService',
  'FeatureFlagService',
  'FuseFlag',
  function (
    $scope,
    modalFactory,
    listHelper,
    scheduleServices,
    toastrFactory,
    patSecurityService,
    localize,
    $timeout,
    $routeParams,
    $location,
    referenceDataService,
    holidaysService,
    featureFlagService,
    fuseFlag
  ) {
    var ctrl = this;

    $scope.hasViewAccess = false;
    $scope.loading = true;
    $scope.fromSchedule = false;
    $scope.fromPracticeSettings = false;
    $scope.holidays = [];

    ctrl.authAccess = function () {
      const hasAccess = patSecurityService.IsAuthorizedByAbbreviation('soar-sch-schhol-view');
      if (!hasAccess) {
        ctrl.showToast('Not Authorized', patSecurityService.generateMessage('soar-sch-schhol-view'), []);
        toastrFactory.error(
          patSecurityService.generateMessage('soar-sch-schhol-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      } else {
        $scope.hasViewAccess = true;
      }
    };

    //#region breadcrumbs

    ctrl.setBreadcrumbs = function () {
      if (typeof $routeParams.source !== 'undefined') {
        var source = $routeParams.source;

        $scope.fromSchedule = source === 'schedule';
        $scope.fromPracticeSettings = source === 'practiceSettings';
      }
    };

    $scope.navigatePracticeSettings = function () {
      $location.url(_.escape('/BusinessCenter/PracticeSettings/'));
    };

    $scope.navigateSchedule = function () {
      var params = $location.search();
      var queryString = '';

      angular.forEach(params, function (value, key) {
        if (key !== 'newTab' && key !== 'newKey') {
          queryString += key + '=' + value + '&';
        }
      });

      $location.url(_.escape('/Schedule/?' + queryString));
    };

    //#endregion

    $scope.defaultOrderBy = {
      field: 'Date',
      asc: true,
    };

    $scope.orderBy = {
      field: 'Date',
      asc: true,
    };

    // function to apply orderBy functionality on grid
    $scope.changeSortingForGrid = function (field, isDefault) {
      var asc;

      if (isDefault) {
        asc =
          $scope.defaultOrderBy.field === field
            ? !$scope.defaultOrderBy.asc
            : true;
        $scope.defaultOrderBy = { field: field, asc: asc };
      } else {
        asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
        $scope.orderBy = { field: field, asc: asc };
      }
    };

    $scope.createHoliday = function (holiday) {
      if (holiday) {
        // Prepare Edit
        ctrl.selectedHoliday = holiday;
      } else {
        // Prepare Add
        ctrl.selectedHoliday = {
          Description: null,
          Date: null,
          IsActive: true,
          IsDefaultHoliday: false,
        };
      }

      modalFactory
        .Modal({
          templateUrl: 'App/Schedule/holidays/holiday-add/holiday-add.html',
          controller: 'HolidayAddController',
          size: 'lg',
          windowClass: 'center-modal',
          backdrop: 'static',
          keyboard: false,
          amfa: holiday ? 'soar-sch-schhol-edit' : 'soar-sch-schhol-add',
          resolve: {
            holiday: function () {
              return angular.copy(ctrl.selectedHoliday);
            },
          },
        })
        .result.then(ctrl.updateHolidays);
    };

    ctrl.updateHolidays = function (value) {
      if (value) {
        if (!_.isNil(value.Date) && typeof value.Date === 'string') {
          value.Date = value.Date.replace('Z', '');
        }

        // see if we can find the holiday in the list we have
        const index = $scope.holidays.findIndex(h => h.HolidayId == value.HolidayId);
        if (index >= 0) { // if we found it, replace the data
          $scope.holidays.splice(index, 1, value);
        } else { // otherwise just add it
          $scope.holidays.push(value);
        }

        ctrl.selectedHoliday = null;
      }
    };

    ctrl.getHolidays = function () {
      holidaysService.getAll().subscribe((holidays) => {
        $scope.holidays = holidays.map(h => {
          h.Description = _.escape(_.unescape(h.Description));
          return h;
        });
        $scope.loading = false;
      });
    };

    $scope.saveHoliday = function (holiday) {
      if (holiday) {
        holidaysService.update(holiday).subscribe(h => ctrl.updateHolidays(h), err => ctrl.saveHolidayOnError(err));
      }
    };

    ctrl.saveHolidayOnSuccess = function (res) {
      ctrl.selectedHoliday = null;

      /** mainly used to update the data tag for saved default holiday */
      var index = listHelper.findIndexByFieldValue(
        $scope.holidays,
        'HolidayId',
        res.Value.HolidayId
      );
      if (index < 0) {
        index = listHelper.findIndexByFieldValue(
          $scope.holidays,
          'HolidayId',
          res.Value.HolidayId
        );
        $scope.holidays.splice(index, 1, res.Value);
      } else {
        $scope.holidays.splice(index, 1, res.Value);
      }
    };

    ctrl.saveHolidayOnError = function (err) {
      toastrFactory.error(
        localize.getLocalizedString(
          "Failed to save the {0} '{1}'. Please try again.",
          ['holiday', ctrl.selectedHoliday.Description]
        ),
        'Error'
      );
      ctrl.selectedHoliday = null;
    };

    $scope.deleteHoliday = function (holiday) {
      ctrl.selectedHoliday = holiday;
      modalFactory
        .DeleteModal('holiday', _.unescape(ctrl.selectedHoliday.Description))
        .then(ctrl.confirmDelete, ctrl.cancelDelete);
    };

    ctrl.confirmDelete = function () {
      holidaysService.delete(ctrl.selectedHoliday.HolidayId)
        .subscribe(() => ctrl.deleteHolidayOnSuccess(ctrl.selectedHoliday.HolidayId), err => ctrl.deleteHolidayOnError());
    };

    ctrl.cancelDelete = function () {
      ctrl.selectedHoliday = null;
    };

    ctrl.deleteHolidayOnSuccess = function (id) {
      // see if we can find the holiday in the list we have
      const deleteIndex = $scope.holidays.findIndex(h => h.HolidayId == id);
      if (deleteIndex >= 0) { // if we found it, delete it
        $scope.holidays.splice(deleteIndex, 1);
        $scope.$digest(); // for some reason we need to manually trigger the component update, maybe something to do with the observable
      }
      
      ctrl.selectedHoliday = null;
      toastrFactory.success(
        localize.getLocalizedString('Successfully deleted the {0}.', [
          'holiday',
        ]),
        'Success'
      );
    };

    ctrl.deleteHolidayOnError = function () {
      ctrl.selectedHoliday = null;

      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to delete the {0}. Please try again.',
          ['holiday']
        ),
        'Error'
      );
    };

    ctrl.authAccess();
    ctrl.setBreadcrumbs();
    ctrl.getHolidays();
  },
]);
