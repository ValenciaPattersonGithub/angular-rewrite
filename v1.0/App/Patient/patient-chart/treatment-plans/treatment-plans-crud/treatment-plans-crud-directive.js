'use strict';

angular
    .module('Soar.Patient')
    .directive('treatmentPlansCrud', function () {
      return {
        restrict: 'E',
        scope: {
          personId: '=',
          patientInfo: '=',
          viewSettings: '=',
        },
        templateUrl:
          'App/Patient/patient-chart/treatment-plans/treatment-plans-crud/treatment-plans-crud.html',
        controller: 'TreatmentPlansCrudController',
        link: function link(scope, element, attrs) {
          element.on('$destroy', function elementOnDestroy() {
            scope.$destroy();
          });
        },
      };
    })
    .directive('sanitizeInput', ['$sanitize', function($sanitize) {
      return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelCtrl) {
          let sanitize = function (value) {
            const ret = $sanitize(value);
            return ret.replace(/&amp;/g, '&');
          };

          ngModelCtrl.$formatters.push(sanitize);
          ngModelCtrl.$parsers.push(sanitize);

          ngModelCtrl.$viewChangeListeners.push(function() {
            ngModelCtrl.$setViewValue(ngModelCtrl.$viewValue);
            ngModelCtrl.$render();
          });
        }
      };
    }]);
