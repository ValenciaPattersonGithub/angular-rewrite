(function () {
  'use strict';

  angular
    .module('common.controllers')
    .controller('RadioGroupController', radioGroupController);

  radioGroupController.$inject = ['$location', '$scope'];

  function radioGroupController($location, $scope) {
    /* jshint validthis:true */
    var vm = this;
    vm.title = 'radioGroupController';

    $scope.changeValue = function (e) {
      $scope.value = e.value;

      if (typeof e.click === 'function') {
        e.click();
      }

      if ($scope.onChange) {
        $scope.onChange($scope.value);
      }
    };

    activate();

    function activate() {}
  }
})();
