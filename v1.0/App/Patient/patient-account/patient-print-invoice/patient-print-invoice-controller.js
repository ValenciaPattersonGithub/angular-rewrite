'use strict';
angular.module('Soar.Patient').controller('PatientPrintInvoiceController', [
  '$scope',
  '$routeParams',
  '$timeout',
  '$filter',
  function ($scope, $routeParams, $timeout, $filter) {
    var ctrl = this;

    // all things that need to happen on init
    ctrl.$onInit = function () {
      ctrl.localStorageIdentifier = 'invoice_' + $routeParams.invoiceId;
      // getting the invoice from local storage and them removing it
      $scope.invoiceDto = JSON.parse(
        localStorage.getItem(ctrl.localStorageIdentifier)
      );

      $scope.hasPreviousBalance = $scope.invoiceDto.IncludePreviousBalance;
      $scope.hasEstimatedInsurance = true;
      $scope.hasFutureAppointment = $scope.invoiceDto.IncludeFutureAppointments;

      if (
        $scope.invoiceDto.InvoiceDate &&
        $scope.invoiceDto.InvoiceDate.slice(-1).toLowerCase() !== 'z'
      ) {
        $scope.invoiceDto.InvoiceDate = new Date(
          $scope.invoiceDto.InvoiceDate + 'Z'
        );
      }
      _.forEach(
        $scope.invoiceDto.Details && $scope.invoiceDto.Details,
        detail => {
          if (detail.TransactionDate.slice(-1).toLowerCase() !== 'z') {
            detail.TransactionDate = new Date(detail.TransactionDate + 'Z');
          }
        }
      );

      if ($scope.invoiceDto.isCustomInvoice) {
        $scope.invoiceDto.Details = $filter('orderBy')(
          $scope.invoiceDto.Details,
          'TransactionDate',
          false
        );
        $scope.hasEstimatedInsurance =
          $scope.invoiceDto.IncludeEstimatedInsurance;
      }
      $scope.hCharges = 'Charges';
      $scope.hPayments = 'Payments';
      $scope.hAdjustments = 'Adjustments';
      $scope.invoiceDate = 'Date';

      if ($scope.invoiceDto && $scope.invoiceDto.FutureAppointments !== null) {
        ctrl.formatApptDates();
      }
      // convert tooth ranges to abbrev for display
      if ($scope.invoiceDto && $scope.invoiceDto.Details !== null) {
        ctrl.convertToothRangeToAbbrev();
      }
      $scope.equationFormattedPrevBalance = ctrl.formatVal(
        $scope.invoiceDto.PreviousBalance
      );
      $scope.equationFormattedDueNow = ctrl.formatVal($scope.invoiceDto.DueNow);
      localStorage.removeItem(ctrl.localStorageIdentifier);
      // cleaning up the page for print/display
      angular.element('body').attr('style', 'padding-top:0;');
      angular.element('.view-container').attr('style', 'background-color:#fff');
      angular.element('.top-header').remove();
      angular.element('.feedback-container').remove();
      $timeout(function () {
        angular.element('#walkme-player').remove();
      }, 2000);
    };

    // formatting dats - 12/25/2016 - 3:30pm
    ctrl.formatApptDates = function () {
      angular.forEach($scope.invoiceDto.FutureAppointments, function (fa) {
        fa.StartTime = new Date(fa.StartTime + 'Z');
        fa.StartTime = $filter('date')(fa.StartTime, 'MM/dd/yyyy - h:mma');
      });
    };

    // used to display the quad or arch abbrev when appilcable (i.e Th 1-8 => Th UR, etc.)
    ctrl.convertToothRangeToAbbrev = function () {
      angular.forEach($scope.invoiceDto.Details, function (det) {
        if (
          det.TransactionDescription &&
          det.TransactionDescription.lastIndexOf('Th') !== -1 &&
          det.TransactionDescription.substring(
            det.TransactionDescription.lastIndexOf('Th') + 2,
            det.TransactionDescription.lastIndexOf('Th') + 3
          ) === ' '
        ) {
          var desc = det.TransactionDescription.slice(
            0,
            det.TransactionDescription.lastIndexOf('Th') + 2
          );
          var tooth = det.TransactionDescription.slice(
            det.TransactionDescription.lastIndexOf('Th') + 2
          );
          tooth = tooth.trim();
          tooth = $filter('convertToothRangeToQuadrantOrArchCode')(tooth);
          det.TransactionDescription = desc + ' ' + tooth;
        }
      });
    };

    ctrl.getCalcSymbolForVal = function (val) {
      return ctrl.isNegative(val) ? '-' : '+';
    };

    ctrl.isNegative = function isNegative(val) {
      return val < 0;
    };

    ctrl.formatAsCurrency = function formatAsCurrency(val) {
      return '$' + $filter('currency')(Math.abs(val), '');
    };

    ctrl.formatVal = function formatVal(val) {
      var currencyVal = ctrl.formatAsCurrency(val);

      if (ctrl.isNegative(val)) {
        var arrVal = currencyVal.split('');
        arrVal.splice(1, 0, '(');
        arrVal.push(')');
        return arrVal.join('');
      }

      return currencyVal;
    };

    // calling init because it won't do it automatically here
    ctrl.$onInit();
  },
]);
