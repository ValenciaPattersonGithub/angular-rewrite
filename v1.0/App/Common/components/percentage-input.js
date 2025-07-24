'use strict';

angular.module('common.directives').directive('percentageInput', [
  '$filter',
  function ($filter) {
    return {
      restrict: 'A',
      require: 'ngModel',
      scope: {
        // currencyIncludeDecimals: '&',
      },
      link: function (scope, element, attr, ngModel) {
        attr['percentageMaxValue'] = attr['percentageMaxValue'] || 100;
        attr['percentageMaxDecimals'] = attr['percentageMaxDecimals'] || 2;

        $(element).css({ 'text-align': 'right' });

        // function called when parsing the inputted url
        // this validation may not be rfc compliant, but is more
        // designed to catch common url input issues.
        function into(input) {
          var valid;

          if (input == '') {
            ngModel.$setValidity('valid', true);
            return '';
          }

          // if the user enters something that's not even remotely a number, reject it
          if (
            !input.match(
              /^-?[0-9]{0,2}(\.[0-9]{1,2})?$|^-?(100)(\.[0]{1,2})?$/gi
            )
          ) {
            ngModel.$setValidity('valid', false);
            return '';
          }

          // strip everything but numbers from the input
          //input = input.replace(/[^0-9\.]/gi, '');

          input = parseFloat(input);

          var power = Math.pow(10, attr['percentageMaxDecimals']);

          input = Math.round(input * power) / power;

          if (input > attr['percentageMaxValue'])
            input = attr['percentageMaxValue'];

          // valid!
          ngModel.$setValidity('valid', true);

          return input;
        }

        ngModel.$parsers.push(into);

        function out(input) {
          if (ngModel.$valid && input !== undefined && input !== '') {
            return input + '%';
          }
          return '';
        }

        ngModel.$formatters.push(out);

        $(element).bind('click', function () {
          //$( element ).val( ngModel.$modelValue );
          $(element).select();
        });

        $(element).bind('blur', function () {
          $(element).val(out(ngModel.$modelValue));
        });
      },
    };
  },
]);
