'use strict';

var app = angular.module('Soar.Patient');

app.controller('PerioKeypadController', [
  '$scope',
  'localize',
  'PatientPerioExamFactory',
  PerioKeypadController,
]);

function PerioKeypadController($scope, localize, patientPerioExamFactory) {
  PerioKeypadController.prototype.$scope = $scope;

  $scope.text = {
    bleed: 'bleed',
    supp: 'supp',
  };

  this.$onInit = function onInit() {
    $scope.values = getBaseValues();
    $scope.valuesMutationSymbol = '+';
  };

  var getBaseValues = function initGetBaseValues() {
    var bleed = localize.getLocalizedString($scope.text.bleed);
    var supp = localize.getLocalizedString($scope.text.supp);

    var baseValues = [
      [bleed, 0, supp],
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];

    getBaseValues = function getBaseValues() {
      return baseValues;
    };

    return baseValues;
  };

  function isInteger(value) {
    return (
      typeof value === 'number' &&
      isFinite(value) &&
      Math.floor(value) === value
    );
  }

  function updateValues(values) {
    return function (valueMutation) {
      return (values || getBaseValues()).map(function (row) {
        return row.map(function (value) {
          if (isInteger(Number(value))) {
            return (value += valueMutation);
          }

          return value;
        });
      });
    };
  }

  var isAtKeypadValueBoundary = (function isAtKeypadValueBoundary() {
    function check(boundary) {
      return $scope.values[1][0] === boundary;
    }

    return {
      decrementation: function checkDecrementationBoundary() {
        return check(1); // min keypad range is 0-9
      },
      incrementation: function checkIncrementationBoundary() {
        return check(11); // max keypad range is 10-19
      },
    };
  })();

  function handleDecrementation() {
    if (isAtKeypadValueBoundary.incrementation()) {
      $scope.values = updateValues($scope.values)(-10);
      $scope.valuesMutationSymbol = '+';
    }
  }

  $scope.onValueSelected = function onValueSelected($event, value) {
    if (isInteger(Number(value))) {
      $scope.keypadModel.inputType = 'numericInput';
      $scope.keypadModel.value = value;
    } else {
      $scope.keypadModel.inputType = 'pocketInput';
      $scope.keypadModel.value = $scope.text[value] + 'Input';
    }

    $scope.keypadModel.onInput = Date.now();

    handleDecrementation();

    $scope.$apply();
  };

  $scope.onValuesMutation = function onValuesMutation() {
    // If at lower values boundary, user is currently incrementing keypad
    if (isAtKeypadValueBoundary.decrementation()) {
      $scope.values = updateValues($scope.values)(10);
      $scope.valuesMutationSymbol = '-';
    } else {
      // If at upper values boundary, user is currently decrementing keypad
      handleDecrementation();
    }
  };

  $scope.isValidNumericInput = function isValidNumericInput(val) {
    return (
      val > $scope.keypadModel.numericInputLimit ||
      val < $scope.keypadModel.numericInputMin
    );
    };

    $scope.isButtonDisabled = function isButtonDisabled(val) {
        return $scope.isValidNumericInput(val) || $scope.isNegativeNumber(val);
        
    }

    $scope.isNegativeNumber = function isNegativeNumber(val) {        
        if ($scope.keypadModel.examType == 'GingivalMarginPocket' && patientPerioExamFactory.IsGMNegativeMode == true) {
            if (val > 10) {
                return true; //Disable the button
            }
        }
        else {
            return false; //Button is valid
        }

    }
    

  $scope.$watch('keypadModel.onInputRestriction', function (nv, ov) {
    if ($scope.keypadModel.incrementationLimit) {
      handleDecrementation();
    }
  });
  
  $scope.$watch(
    function () {
      return patientPerioExamFactory.ExamState;
    },
    function (examStatus) {
      $scope.activeExam = examStatus === 'EditMode';
    }
  );
}

PerioKeypadController.prototype.onValueSelected = function ($event, value) {
  this.$scope.onValueSelected($event, value);
};
