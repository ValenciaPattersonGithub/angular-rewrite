'use strict';
// This directive is similar to the provider-selector except it is practice wide list of providers
// Not filtered by location
// Initial development is for showing a list of ProviderOnClaims based on UserLocationSetup

angular
  .module('common.directives')
  .directive('practiceProviderSelector', function () {
    return {
      restrict: 'E',
      scope: {
        placeHolder: '=?',
        className: '@?',
        sbChange: '=?',
        inputId: '@',
        required: '=?',
        selectedProvider: '=',
        providerInactive: '=?selectedProviderInactive',
        onlyActive: '=?',
        disableInput: '=?',
        providerOnClaimsOnly: '=?',
        objTrans: '=?',
      },
      templateUrl:
        'App/BusinessCenter/components/practiceProviderSelector/practice-provider-selector.html',
      controller: 'PracticeProviderSelectorController',
      link: function (scope, elem, attr) {
        // grabs tabindex form parent element to keep fluid tabbing through page
        scope.tabIndex = elem.attr('tabindex');
        // removes parent tab index, no longer necessary
        elem.attr('tabindex', '');
        elem.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
