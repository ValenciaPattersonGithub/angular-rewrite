(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller('PatientConditionsController', patientConditionsController);

  patientConditionsController.$inject = ['$location'];

  function patientConditionsController($location) {
    /* jshint validthis:true */
    var vm = this;
    vm.title = 'patientConditionsController';

    activate();

    function activate() {}
  }
})();
