(function () {
  'use strict';

  angular
    .module('Soar.Patient')
    .controller('PatientMedicalInfoController', PatientMedicalInfoController);

  PatientMedicalInfoController.$inject = ['$location', '$scope'];

  function PatientMedicalInfoController($location, $scope) {
    /* jshint validthis:true */
    var vm = this;
    vm.title = 'PatientMedicalInfoController';

    $scope.boolOpt = function () {
      return [
        {
          name: 'Yes',
          value: true,
        },
        {
          name: 'No',
          value: false,
        },
        {
          name: 'Unknown',
          value: 'unknown',
        },
      ];
    };

    $scope.medInfoFields = [
      {
        className: 'form-row',
        fieldGroup: [
          {
            key: 'primaryPhys',
            type: 'radio',
            className: 'form-col-12',
            templateOptions: {
              label: 'Are you currently under the care of a physician?',
              options: new $scope.boolOpt(),
              inline: true,
            },
          },
        ],
      },
      {
        key: 'physData',
        hideExpression: 'model.primaryPhys != true',
        fieldGroup: [
          {
            className: 'form-row',
            fieldGroup: [
              {
                key: 'physName',
                type: 'input',
                className: 'form-col-12',
                templateOptions: {
                  label: 'Physician Name',
                  type: 'text',
                },
              },
            ],
          },
          {
            className: 'form-row',
            fieldGroup: [
              {
                key: 'physAddress',
                type: 'input',
                className: 'form-col-12',
                templateOptions: {
                  label: 'Address',
                  type: 'text',
                },
              },
            ],
          },
          {
            className: 'form-row',
            fieldGroup: [
              {
                key: 'physCity',
                type: 'input',
                className: 'form-col-6',
                templateOptions: {
                  label: 'City',
                  type: 'text',
                },
              },
              {
                key: 'physState',
                type: 'input',
                className: 'form-col-3',
                templateOptions: {
                  label: 'State',
                  type: 'text',
                },
              },
              {
                key: 'physZip',
                type: 'input',
                className: 'form-col-3',
                templateOptions: {
                  label: 'Zip',
                  type: 'text',
                },
              },
            ],
          },
        ],
      },
    ];

    $scope.makeOpt = function () {
      var bools = new $scope.boolOpt();
      return bools;
    };

    $scope.physCareOpt = [
      { text: 'Yes', value: true },
      { text: 'No', value: false },
    ];

    $scope.goodHealth = [
      { text: 'Yes', value: true },
      { text: 'No', value: false },
    ];

    activate();

    function activate() {}
  }
})();
