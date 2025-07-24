'use strict';
// Optional controller to change the locale
angular.module('common.controllers').controller('LocaleCtrl', [
  '$scope',
  'localize',
  function ($scope, localize) {
    $scope.lang = 'English';
    //$scope.title = 'Localize App';
    // determine initial language settings from browser
    $scope.initLanguage = 'en_us';
    $scope.initLang = function () {
      localize.setLanguage($scope.initLanguage);
    };

    $scope.setLang = function (lang) {
      switch (lang) {
        case 'English':
          localize.setLanguage('en_us');
          break;
        case 'Español':
          localize.setLanguage('es_mx');
          break;
        case 'français':
          localize.setLanguage('fr_ca');
          break;
      }
      return ($scope.lang = lang);
    };
  },
]);
