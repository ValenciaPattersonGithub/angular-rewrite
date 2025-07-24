'use strict';
angular
  .module('Soar.Patient')
  .controller('PreventiveCareApptDirectiveController', [
    '$scope',
    '$filter',
    'ListHelper',
    'PatientPreventiveCareFactory',
    'localize',
    '$timeout',
    'ModalFactory',
    '$routeParams',
    'SaveStates',
    function (
      $scope,
      $filter,
      listHelper,
      patientPreventiveCareFactory,
      localize,
      $timeout,
      modalFactory,
      $routeParams,
      saveStates
    ) {
      var ctrl = this;

      //gets grid data source
      ctrl.setGridData = function (data) {
        var grid = $('#prevCareApptGridInner').data('kendoGrid');
        grid.dataSource.data(data);
      };

      // refreshing grid every time data updates
      $scope.$watch(
        'data',
        function (nv, ov) {
          if (nv && !angular.equals(nv, ov)) {
            ctrl.setGridData(nv);
          }
        },
        true
      );

      // if they cancel and close this, the tabset also needs to hide
      $scope.$watch('showPreventiveService', function (nv, ov) {
        if (nv === false) {
          $scope.$emit('soar:appt-tab-action-canceled');
          // resetting this flag to true, so that it will ready to be displayed, if they re-select the preventive care tab
          $scope.showPreventiveService = true;
        }
      });

      //sets grid data source
      ctrl.getGridData = function () {
        var grid = $('#prevCareApptGridInner').data('kendoGrid');
        return grid.dataSource.data();
      };

      // Column group object for custom header
      ctrl.preventiveCareApptColgroup =
        '<colgroup><col class="k-group-col"><col style="width:100px"><col style="width:200px"><col style="width:100px"></colgroup>';

      // header with group properties
      $scope.preventiveCareApptHeader = function (dataItem) {
        var preventiveTypeName = $filter('filter')($scope.data, {
          Order: dataItem.value,
        })[0].TypeOfService;
        return (
          '<table>' +
          ctrl.preventiveCareApptColgroup +
          '<tbody><tr>' +
          '<td role="gridcell"></td>' +
          '<td role="gridcell">' +
          preventiveTypeName +
          '</td>' +
          '<td role="gridcell">' +
          '</td>' +
          '</tr></tbody></table>'
        );
      };

      // configuration for the preventive care appointment grid

      $scope.preventiveCareApptGridDataSource = {
        data: $filter('orderBy')($scope.data, 'Order'),
        schema: {
          model: {
            fields: {
              Code: {
                editable: false,
              },
              Description: {
                editable: false,
              },
            },
          },
        },
        group: {
          field: 'Order',
          aggregates: [{ field: 'Order', aggregate: 'count' }],
        },
      };
      $scope.selectedPreventiveServices = [];
      $scope.addRemoveServiceCode = function (service) {
        var selectedCodes = $scope.selectedPreventiveServices.filter(
          function (code) {
            return code.ServiceCodeId == service.ServiceCodeId;
          }
        );
        if (selectedCodes.length == 0) {
          $scope.selectedPreventiveServices.push(service);
        } else {
          var delete_index = $scope.selectedPreventiveServices.indexOf(
            selectedCodes[0]
          );
          $scope.selectedPreventiveServices.splice(delete_index, 1);
        }
      };
      $scope.addSrvcCodesToPrev = function () {
        angular.forEach($scope.selectedPreventiveServices, function (service) {
          service.ServiceTransactionStatusId = 1;
          service.TransactionTypeId = 1;
          $scope.appointment.Data.ServiceCodes.push(service);
          service.ObjectState = saveStates.Add;
          $scope.plannedServices.push(service);
          $scope.appointment.Data.PlannedServices.push(service);
        });
      };
      $scope.preventiveCareApptGridOptions = {
        dataSource: $scope.preventiveCareApptGridDataSource,
        toolbar: [
          {
            template:
              '<button class="btn btn-primary" icon="fa-plus" ng-disabled="SelectedServiceCodes.length==0" ng-click="addSrvcCodesToPrev();showPreventiveService=false;">{{\'Add Selected to Appointment\' | i18n}}</button> <button ng-click="showPreventiveService=false;" class="btn btn-primary">Cancel</button>',
          },
        ],
        // autoBind: false,
        sortable: false,
        pageable: false,
        editable: true,
        columns: [
          {
            field: 'Order',
            title: localize.getLocalizedString('Type Of Service'),
            groupable: true,
            groupHeaderTemplate: function (dataItem) {
              return $scope.preventiveCareApptHeader(dataItem);
            },
            hidden: true,
          },
          {
            title: localize.getLocalizedString('Appointments'),
            template:
              '<checkbox checkbox-value="dataItem.$$CheckboxValue" change-function="addRemoveServiceCode(dataItem)" ></checkbox>',
            width: '5%',
            attributes: {
              class: 'grid-checkbox',
            },
          },
          {
            field: 'Code',
            title: localize.getLocalizedString(' Code'),
            width: '100px',
          },
          {
            field: 'Description',
            title: localize.getLocalizedString('Description '),
            width: '150px',
          },
        ],
      };
    },
  ]);
