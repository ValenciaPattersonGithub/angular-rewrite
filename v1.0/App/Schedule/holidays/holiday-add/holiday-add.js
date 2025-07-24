'use strict';

angular.module('Soar.Schedule').controller('HolidayAddController', [
  '$scope',
  '$uibModalInstance',
  'holiday',
  'toastrFactory',
  'ModalFactory',
  'localize',
  'HolidaysService',
  function (
    $scope,
    mInstance,
    holiday,
    toastrFactory,
    modalFactory,
    localize,
    holidaysService
  ) {
    var ctrl = this;

    $scope.cancelChanges = function () {
      mInstance.close(null);
    };

    ctrl.backupHoliday = angular.copy(holiday);
    $scope.editMode = holiday.Description ? true : false;
    $scope.holiday = holiday;
    $scope.hasErrors = false;
    $scope.isSaving = false;

    $scope.maxDate = moment().add(100, 'years').startOf('day').toDate();

    $scope.ValidDate = true;

    if (!$scope.holiday.Date) {
      $scope.holiday.Date = new Date();
    }

    ctrl.IsValid = function () {
      return (
        $scope.frmHolidaySave.$valid &&
        $scope.frmHolidaySave.inpDescription.$valid &&
        $scope.validDate &&
        $scope.holiday.Date != null
      );
    };

    $scope.saveHoliday = function () {
      $scope.hasErrors = !ctrl.IsValid();
      
      if (!$scope.hasErrors) {
        $scope.isSaving = true;
        var params = _.clone($scope.holiday);
        params.Date = moment(params.Date).format('YYYY-MM-DD');
        params.Description = _.escape(_.unescape(params.Description));

        if (!$scope.editMode) {
          holidaysService.create(params)
            .subscribe(h => ctrl.HolidaySaveOnSuccess(h), err => ctrl.HolidaySaveOnError());
        } else {
          holidaysService.update(holiday)
            .subscribe(h => ctrl.HolidaySaveOnSuccess(h), err => ctrl.HolidaySaveOnError());
        }
      }
    };

    ctrl.HolidaySaveOnSuccess = function (res) {
      $scope.isSaving = false;

      var msg = !$scope.editMode
        ? 'Successfully added the {0}.'
        : 'Successfully updated the {0}.';
      toastrFactory.success(
        localize.getLocalizedString(msg, ['holiday']),
        'Success'
      );
      mInstance.close(res);
    };

    ctrl.HolidaySaveOnError = function () {
      $scope.isSaving = false;
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to save the {0}. Please try again.',
          ['holiday']
        ),
        'Error'
      );
    };

    $scope.cancelChanges = function () {
      if ($scope.holiday.Description != ctrl.backupHoliday.Description) {
        modalFactory.CancelModal().then(ctrl.confirmCancel);
      } else {
        mInstance.close(null);
      }
    };

    ctrl.confirmCancel = function () {
      mInstance.close(null);
    };
  },
]);
