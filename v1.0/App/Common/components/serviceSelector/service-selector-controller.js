'use strict';
angular.module('common.controllers').controller('ServiceSelectorController', [
  '$scope',
  'referenceDataService',
  function ($scope, referenceDataService) {
    var ctrl = this;

    ctrl.$onInit = function () {
      $scope.gridVisible = false;
      $scope.serviceCodes = [];
    };

    // if they cancel and close this, the tabset also needs to hide
    $scope.$watch('showAddNewService', function (nv, ov) {
      if (nv === false) {
        $scope.$emit('soar:appt-tab-action-canceled');
        // resetting this flag to true, so that it will ready to be displayed, if they re-select the add a service tab
        $scope.showAddNewService = true;
      }
    });

    // + add new service button click handler
    $scope.loadGrid = function () {
      $scope.gridVisible = true;
      ctrl.getServiceCodes();
    };

    // only fetching services codes list the first time they click + add new service button, or if refresh(true) param is passed
    ctrl.getServiceCodes = function (refresh) {
      if (_.isEmpty($scope.serviceCodes) || refresh === true) {
        $scope.serviceCodes = referenceDataService.get(
          referenceDataService.entityNames.serviceCodes
        );
      }
    };

    //Kendo Grid
    $scope.dummyGridData = new kendo.data.DataSource({
      data: [
        {
          service: 'ADPROPHY',
          tooth: '',
          area: '',
          provider: 'SPISH1',
          fee: '999,999.00',
        },
        {
          service: 'PORCROWN',
          tooth: '30',
          area: '',
          provider: 'SPISH1',
          fee: '999,999.00',
        },
        {
          service: '4BITEW',
          tooth: '',
          area: '',
          provider: 'SPISH1',
          fee: '999,999.00',
        },
        {
          service: 'AMAL25',
          tooth: '15',
          area: 'MODBL5',
          provider: 'SPISH1',
          fee: '999,999.00',
        },
        {
          service: 'D2140',
          tooth: '',
          area: '',
          provider: 'SPISH',
          fee: '999,999.00',
        },
      ],
      schema: {
        model: {
          fields: {
            service: {
              type: 'string',
            },
            tooth: {
              type: 'number',
            },
            area: {
              type: 'string',
            },
            provider: {
              type: 'string',
            },
            fee: {
              type: 'number',
            },
          },
        },
      },
    });

    $scope.apptAddSrvcGrid = {
      toolbar: [
        {
          template:
            '<button class="btn btn-primary" icon="fa-plus" ng-click="loadGrid()">{{ \'Add New Service\' | i18n }}</button> <button ng-click="showAddNewService=false;" class="btn btn-primary">Cancel</button>',
        },
      ],
      sortable: true,
      pageable: false,
      filterable: {
        mode: 'row',
        operators: {
          string: {
            startswith: 'Starts with',
            eq: 'Is equal to',
            neq: 'Is not equal to',
          },
        },
      },
      columns: [
        {
          template:
            '<checkbox checkbox-value="" change-function="" ></checkbox>',
          width: '6%',
          attributes: {
            class: 'grid-checkbox',
          },
          headerAttributes: {
            style: 'white-space: normal',
          },
        },
        {
          field: 'service',
          title: 'Service',
        },
        {
          field: 'tooth',
          title: 'Tooth',
        },
        {
          field: 'area',
          title: 'Area',
        },
        {
          field: 'provider',
          title: 'Provider',
        },
        {
          field: 'fee',
          title: 'Fee',
          format: '{0:c}',
        },
      ],
    };
  },
]);
