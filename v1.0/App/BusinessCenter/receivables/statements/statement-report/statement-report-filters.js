angular
  .module('Soar.BusinessCenter')
  .filter('statementReportAlertCityStateZip', function () {
    return function (alert) {
      var text = '';
      if (alert) {
        if (alert.StandarizedCity) {
          text += alert.StandarizedCity;
          if (
            alert.StandarizedState ||
            alert.StandarizedPostalCode ||
            alert.StandarizedPostalCode4
          ) {
            text += ', ';
          }
        }
        if (alert.StandarizedState) {
          text += alert.StandarizedState + ' ';
        }
        if (alert.StandarizedPostalCode) {
          text += alert.StandarizedPostalCode;
          if (alert.StandarizedPostalCode4) {
            text += '-';
          }
        }
        if (alert.StandarizedPostalCode4) {
          text += alert.StandarizedPostalCode4;
        }
      }
      return text.trim();
    };
  })
  .filter('statementReportAlertType', [
    'localize',
    function (localize) {
      return function (alert) {
        switch (alert) {
          case 0:
            return localize.getLocalizedString(
              'Printed Non-Standardized Address'
            );
          case 1:
            return localize.getLocalizedString(
              'Suppressed Non-Standard Address'
            );
          case 2:
            return localize.getLocalizedString('USPS COA Move Updates');
          case 3:
            return localize.getLocalizedString(
              'Non-Standardized Address Error'
            );
          case 4:
            return localize.getLocalizedString('USPS Non-Forwardable Address');
          case 5:
            return localize.getLocalizedString('Global Suppression List');
          case 6:
            return localize.getLocalizedString('Duplicate Record');
          case 7:
            return localize.getLocalizedString('Other Business Rule');
          default:
            return localize.getLocalizedString('Unknown');
        }
      };
    },
  ])
  .filter('statementReportProcessed', [
    'localize',
    function (localize) {
      return function (alert) {
        switch (alert) {
          case 0:
            return localize.getLocalizedString('Printed’');
          case 1:
            return localize.getLocalizedString('Suppressed');
          default:
            return localize.getLocalizedString('Unknown');
        }
      };
    },
  ]);
