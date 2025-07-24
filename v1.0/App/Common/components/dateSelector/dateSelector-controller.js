'use strict';

angular.module('common.controllers').controller('DateSelectorCtrl', [
  '$scope',
  '$timeout',
  function ($scope, $timeout) {
    // Boolean to control validation
    $scope.valid = true;
    $scope.isValid = true;

    // Initial mode
    $scope.mode = $scope.mode || 'year';
    $scope.disableModeSwitch = $scope.disableModeSwitch ? true : false;

    // Date options for the picker
    $scope.dateOptions = {
      format: $scope.format || 'MM/dd/yyyy',
      minDate: $scope.minDate || new Date('January 1, 1900'),
      maxDate: $scope.maxDate,
      showWeeks: false,
    };
    if ($scope.dateVar === undefined) {
      $scope.dateVar = moment().local().toDate();
    }
    // Use a temp date for the directive, then pass this back up to parent scope on validation
    $scope.tempDate = null;
    $scope.setInitialDate = function () {
      if ($scope.dateVar) {
        if (
          $scope.tempDate === null ||
          $scope.tempDate === undefined ||
          $scope.tempDate !== $scope.dateVar
        ) {
          $scope.tempDate = moment($scope.dateVar).local().toDate();
        }
      }
    };
    $scope.setInitialDate();

    // Watch changes in maxDate and change dateOptions if it changes
    $scope.$watch('maxDate', function (nv) {
      $scope.dateOptions.maxDate = nv;
    });

    // Watch changes in datevar and set the temp date
    $scope.$watch(
      'dateVar',
      function (nv) {
        $scope.mode = nv != null ? 'day' : 'year';
        $scope.setInitialDate();
      },
      true
    );

    /** Watch mode because in particular unknown cases it gets set to undefined and breaks date-selector */
    $scope.$watch('mode', function (nv) {
      if (angular.isUndefined(nv) || nv == null) {
        $scope.mode = $scope.dateVar ? 'day' : 'year';
      }
    });

    // Watch changes in tempDate to pass value up to parent scope

    $scope.$watch('tempDate', function (nv, ov) {
      if (nv !== ov) {
        $scope.validate();
      } else {
        $scope.valid = $scope.dateForm.datePicker.$valid; // Sets outward validity
      }
    });

    // Validate the date
    $scope.validateTimeout = null;
    $scope.validate = function () {
      if ($scope.validateTimeout != null) {
        $timeout.cancel($scope.validateTimeout);
      }
      // Timeout is necessary to guarantee proper error message handling when date selectors have prepopulated dates ex. Editing a Condition 
      $scope.validateTimeout = $timeout($scope.validateTimeoutFunction, 0);
    };

    $scope.validateTimeoutFunction = function () {
      var viewValue = $scope.dateForm.datePicker.$viewValue;
      var viewValueLength = viewValue ? viewValue.length : 0;

      // Allow for the user to complete remove the date
      if (
        $scope.tempDate ||
        ($scope.tempDate && viewValue && viewValueLength > 0)
      ) {
        // If the view value is a date, we know it came from the date picker and is valid!
        if (!(viewValue instanceof Date) && viewValue !== null) {
          // Check to make sure the date falls in between the min/max and is a valid date
          var isMaxValid = true;
          var specifiedDate = new Date(
            moment($scope.tempDate).format('MM') +
              '/' +
              moment($scope.tempDate).format('DD') +
              '/' +
              moment($scope.tempDate).format('YYYY')
          );

          if ($scope.maxDate != null && $scope.maxDate != undefined) {
            var maxDate = new Date(
              moment($scope.dateOptions.maxDate).format('MM') +
                '/' +
                moment($scope.dateOptions.maxDate).format('DD') +
                '/' +
                moment($scope.dateOptions.maxDate).format('YYYY')
            );

            isMaxValid = maxDate >= specifiedDate;
          }

          var minDate = new Date(
            moment($scope.dateOptions.minDate).format('MM') +
              '/' +
              moment($scope.dateOptions.minDate).format('DD') +
              '/' +
              moment($scope.dateOptions.minDate).format('YYYY')
          );

          /* When parsing dates <100, JavaScript will assume the date is 1900 + the <100 year, so we can compare 
          specifiedDate's year to viewValue's year and guarantee they're the same to ensure the date is valid. */
          var specifiedDateFullYear = specifiedDate.getFullYear();
          var viewValueFullYear = viewValue.substring(viewValue.length - 4);

          // When time allows adjust this possibly removing moment js.
          $scope.isValid =
            minDate <= specifiedDate &&
            isMaxValid &&
            viewValueLength === 10 &&
            specifiedDateFullYear == viewValueFullYear;
        } else {
          $scope.isValid = true;
        }

        // Pass up the date to the parent (if undefined = invalid date)
        if ($scope.isValid) {
          $scope.dateVar = moment.utc($scope.tempDate).toDate();
        } else {
          // Null it out this way to make sure we can invoke the change when we null it out on cancel or such
          $scope.dateVar = null;
        }
      } else {
        $scope.isValid = true;
        $scope.dateVar = null;
      }
      $scope.dateForm.datePicker.$setValidity('wrong', $scope.isValid);
      $scope.valid = $scope.dateForm.datePicker.$valid; // Sets outward validity
    };

    // Open function to open the picker
    $scope.open = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $('.uib-datepicker-popup').hide();
      $scope.opened = !$scope.opened;
    };

    $scope.$on('dateSelector.clear', function (e) {
      $scope.dateVar = null;
      $scope.tempDate = null;
    });
  },
]);
