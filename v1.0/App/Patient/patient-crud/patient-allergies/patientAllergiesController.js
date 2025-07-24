(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller('PatientAllergiesController', patientAllergiesController);

  patientAllergiesController.$inject = ['$location', '$scope'];

  function patientAllergiesController($location, $scope) {
    /* jshint validthis:true */
    var vm = this;
    vm.title = 'PatientAllergiesController';

    $scope.allergies = [
      { name: 'Aspirin', value: false },
      { name: 'Penicilin', value: false },
      { name: 'Codeine', value: false },
      { name: 'Acrylic', value: false },
      { name: 'Metal', value: false },
      { name: 'Latex', value: false },
      { name: 'Sulfa Drugs', value: false },
      { name: 'Local Anesthetics', value: false },
      { name: 'Other?', value: false },
    ];

    activate();

    function activate() {}
  }
})();
