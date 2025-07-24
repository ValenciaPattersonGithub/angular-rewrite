(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller('EmergencyContactController', emergencyContactController);

  emergencyContactController.$inject = ['$location'];

  function emergencyContactController($location) {
    /* jshint validthis:true */
    var vm = this;
    vm.title = 'emergencyContactController';

    activate();

    function activate() {}
  }
})();
