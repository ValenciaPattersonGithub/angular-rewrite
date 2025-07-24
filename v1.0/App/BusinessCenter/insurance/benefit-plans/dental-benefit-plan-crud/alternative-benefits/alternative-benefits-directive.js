'use strict';

angular
  .module('Soar.BusinessCenter')
  .directive('alternativeBenefits', function () {
    return {
      restrict: 'E',
      scope: {
        serviceCodeExceptions: '=',
        alternativeBenefits: '=',
        allServiceCodes: '=',
      },
      templateUrl:
        'App/BusinessCenter/insurance/benefit-plans/dental-benefit-plan-crud/alternative-benefits/alternative-benefits.html',
      controller: 'AlternativeBenefitsController',
      link: function link(scope, element, attrs) {
        element.on('$destroy', function elementOnDestroy() {
          scope.$destroy();
        });
      },
    };
  });
