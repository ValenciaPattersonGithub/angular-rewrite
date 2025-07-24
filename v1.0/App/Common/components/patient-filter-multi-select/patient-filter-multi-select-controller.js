angular
  .module('common.directives')
  .controller('PatientFilterMultiSelectController', [
    '$scope',
    '$filter',
    MultiSelectNewController,
  ]);

/**
 * 
 * @param {ng.IRootScopeService} $scope 
 * @param {ng.IFilterService} $filter 
 */
function MultiSelectNewController($scope, $filter) {
  var ctrl = this;
  $scope.showStatus = false;

  $scope.$watch('options', function (newVal) {
    updateShowStatus(newVal);
  });

  $scope.click = function (option, $event) {
    //only update selected if click event was outside of the checkbox area
    if (_.includes($event.target.classList, 'option')) {
      option[$scope.valueField] = !option[$scope.valueField];
    }
    //handle All option if exists
    if (_.some($scope.options, x => x.IsAllOption)) {
      if (option.IsAllOption) {
        //changed is All option, change all others to match
        _.each($scope.options, x => {
          x[$scope.valueField] = option[$scope.valueField];
        });
      } else if (
        _.every(
          $scope.options,
          x =>
            x.IsAllOption ||
            x[$scope.valueField] ===
              _.find($scope.options, x => !x.IsAllOption)[$scope.valueField]
        )
      ) {
        //all non All options match, change all option to match
        _.each($scope.options, x => {
          if (x.IsAllOption) {
            x[$scope.valueField] = _.find($scope.options, x => !x.IsAllOption)[
              $scope.valueField
            ];
          }
        });
      } else {
        //all non options don't match, change all option to false
        _.each($scope.options, x => {
          if (x.IsAllOption) {
            x[$scope.valueField] = false;
          }
        });
      }
    }

    $event.stopPropagation();
    if ($scope.changeEvent && typeof $scope.changeEvent === 'function') {
      $scope.changeEvent({ option: option });
    }
  };

  $scope.hasStatus = function (options, status) {
    return $scope.options && _.some(options, ['Status', status]);
  };

  $scope.getSelectedOption = function () {
    var selectedOption = $filter('multiSelectLabel')(
      $scope.options,
      $scope.valueField,
      $scope.textField,
      $scope.dropDownLabel
    );
    return selectedOption.length > 26
      ? $filter('truncate')(selectedOption, 26) + '...'
      : selectedOption;
  };

  ctrl.init = function () {
    if (
      $scope.maxVisibleOptions &&
      !_.isNaN(parseInt($scope.maxVisibleOptions))
    ) {
      $scope.dropDownStyle = {
        'max-height': $scope.maxVisibleOptions * 29 + 'px',
        'overflow-y': 'scroll',
      };
    }

    updateShowStatus($scope.options);
  };
  ctrl.init();

  /**
   * 
   * @param {{ Status?: string; }[]} options 
   */
  function updateShowStatus(options) {
    if (options && _.has(options[0], 'Status')) {
      $scope.showStatus = true;
    }
  }
}
MultiSelectNewController.prototype = Object.create(BaseCtrl);
