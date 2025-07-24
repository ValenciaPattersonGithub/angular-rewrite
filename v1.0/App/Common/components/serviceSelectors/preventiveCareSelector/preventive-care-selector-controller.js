'use strict';
angular
  .module('common.controllers')
  .controller('PreventiveCareSelectorController', [
    '$scope',
    '$filter',
    'ListHelper',
    'PatientPreventiveCareFactory',
    'localize',
    '$timeout',
    'ModalFactory',
    '$routeParams',
    'SaveStates',
    'patSecurityService',
    'FinancialService',
    'toastrFactory',
    '$location',
    function (
      $scope,
      $filter,
      listHelper,
      patientPreventiveCareFactory,
      localize,
      $timeout,
      modalFactory,
      $routeParams,
      saveStates,
      patSecurityService,
      financialService,
      toastrFactory,
      $location
    ) {
      var ctrl = this;

      ctrl.dateToday = new Date();
      $scope.soarAuthEnctrAddSvcKey =
        $scope.serviceFilter == 'appointment'
          ? 'soar-sch-apt-svcs'
          : 'soar-acct-enctr-asvcs';
      $scope.serviceTransactions = [];
      $scope.plannedServices = [];
      $scope.serviceCodesTransactions = [];
      $scope.mainGridDataSource = [];
      $scope.selectedPreventiveServices = [];
      $scope.appointmentData =
        $scope.appointment && $scope.appointment.Data
          ? angular.copy($scope.appointment.Data)
          : $scope.appointment;
      $scope.allowInactive = false;
      ctrl.location = null;

      $scope.$on('openPreventiveCareFlyout', function (event, sender) {
        $scope.setFee($scope.data);
        if (sender) {
          $scope.showMatchingFilters(sender);
        } else {
          $scope.showFilters();
        }
      });

      $scope.$on('closeFlyouts', function (event, sender) {
        if (sender) {
          $scope.hideMatchingFilters(sender);
        } else {
          $scope.hideFilters();
        }
      });

      $scope.showMatchingFilters = function (sender) {
        if (sender === $scope.serviceFilter) {
          angular.element('.prevCareTxPlan').addClass('open');
        }
      };

      $scope.showFilters = function () {
        if ($scope.flyout && $scope.serviceFilter == 'appointment') {
          angular.element('.prevCareAppointment').addClass('open');
        }
        if ($scope.flyout && $scope.serviceFilter == 'txplan') {
          angular.element('.prevCareTxPlan').addClass('open');
        }
        if (
          $scope.flyout &&
          ($scope.serviceFilter == 'encounter' ||
            $scope.serviceFilter == 'encounter-refactored')
        ) {
          angular.element('.prevCareEncounter').addClass('open');
        }
        if (!$scope.flyout && $scope.serviceFilter == 'appointment') {
          angular.element('.prevCareRunningApt').addClass('open');
        }
      };

      $scope.hideMatchingFilters = function (sender) {
        if (sender === $scope.serviceFilter) {
          angular.element('.prevCareTxPlan').removeClass('open');
        }
      };

      $scope.hideFilters = function () {
        if ($scope.flyout && $scope.serviceFilter == 'appointment') {
          angular.element('.prevCareAppointment').removeClass('open');
        }
        if ($scope.flyout && $scope.serviceFilter == 'txplan') {
          angular.element('.prevCareTxPlan').removeClass('open');
        }
        if (
          $scope.flyout &&
          ($scope.serviceFilter == 'encounter' ||
            $scope.serviceFilter == 'encounter-refactored')
        ) {
          angular.element('.prevCareEncounter').removeClass('open');
        }
        if (!$scope.flyout && $scope.serviceFilter == 'appointment') {
          angular.element('.prevCareRunningApt').removeClass('open');
        }
      };

      $scope.setFee = function (data) {
        ctrl.location = JSON.parse(sessionStorage.getItem('userLocation'));
        angular.forEach(data, function (dataItem) {
          angular.forEach(
            dataItem.LocationSpecificInfo,
            function (dataLocation) {
              if (
                dataLocation.ServiceCodeId == dataItem.ServiceCodeId &&
                dataLocation.LocationId == ctrl.location.id
              ) {
                dataItem.Fee = dataLocation.Fee;
              }
            }
          );
        });
      };

      $scope.setDueDate = function (data) {
        var trump = false;
        var closest = data[0] != null ? data[0].DueDate : null;
        angular.forEach(data, function (check) {
          if (check.IsTrumpService) {
            trump = true;
            closest = check.DueDate;
          }
          if (!trump) {
            if (closest == null) {
              closest = check.DueDate;
            } else if (check.DueDate != null) {
              if (check.DueDate < closest) {
                closest = check.DueDate;
              }
            }
          }
        });
        $scope.dueDate.dueDate = closest;
      };

      //gets grid data source
      ctrl.setGridData = function (data) {
        var grid = $('#prevCareApptGridInner').data('kendoGrid');
        var gridSource = [];
        $scope.setDueDate(data);
        angular.forEach(data, function (item) {
          var exist = false;
          angular.forEach(gridSource, function (gridItem) {
            if (gridItem.Order == item.Order) {
              exist = true;
            }
          });
          if (!exist) {
            gridSource.push(angular.copy(item));
          }
        });
        if (grid) {
          grid.dataSource.data(gridSource);
          grid.dataSource.sort({ field: 'Order', dir: 'asc' });
        }
      };
      //gets grid data source
      ctrl.setGridDataFirstTime = function (data) {
        var gridSource = [];
        angular.forEach(data, function (item) {
          var exist = false;
          angular.forEach(gridSource, function (gridItem) {
            if (gridItem.Order == item.Order) {
              exist = true;
            }
          });
          if (!exist) {
            gridSource.push(angular.copy(item));
          }
        });
        return gridSource;
      };

      //gets grid data source
      ctrl.getGridData = function () {
        var grid = $('#prevCareApptGridInner').data('kendoGrid');
        if (grid) {
          return grid.dataSource.data();
        } else {
          return null;
        }
      };

      //gets grid data item
      ctrl.getGridDataItem = function () {
        var grid = $('#prevCareApptGridInner').data('kendoGrid');
        if (grid) {
          return grid.dataItems();
        } else {
          return null;
        }
      };

      //gets detail grid data source
      ctrl.getDetailGridData = function (order) {
        var grid = $('#prevCareApptGridInnerDetail' + order.toString()).data(
          'kendoGrid'
        );
        if (grid) return grid.dataSource.data();
        else return null;
      };

      //gets detail grid data source
      ctrl.getDetailGridDataSource = function (order) {
        var grid = $('#prevCareApptGridInnerDetail' + order.toString()).data(
          'kendoGrid'
        );
        if (grid) return grid.dataSource;
        else return null;
      };

      //gets detail grid data items
      ctrl.getDetailGridDataItems = function (order) {
        var grid = $('#prevCareApptGridInnerDetail' + order.toString()).data(
          'kendoGrid'
        );
        if (grid) return grid.dataItems();
        else return null;
      };

      // refreshing grid every time data updates
      $scope.$watch(
        'data',
        function (nv, ov) {
          if (nv && !angular.equals(nv, ov)) {
            ctrl.setGridData(nv);
            ctrl.prevCareGridDataBound();
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
          _.escape(ctrl.preventiveCareApptColgroup) +
          '<tbody><tr>' +
          '<td role="gridcell"></td>' +
          '<td role="gridcell"><checkbox></checkbox></td>' +
          '<td role="gridcell">' +
          _.escape(preventiveTypeName) +
          '</td>' +
          '</tr></tbody></table>'
        );
      };

      // configuration for the preventive care appointment grid

      $scope.preventiveCareApptGridDataSource = {
        data: $filter('orderBy')(
          ctrl.setGridDataFirstTime($scope.data),
          'Order'
        ),
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
      };

      $scope.detailGridOptions = function (dataItem) {
        return {
          dataSource: {
            data: $scope.data,
            filter: [
              { field: 'Order', operator: 'eq', value: dataItem.Order },
              { field: 'IsActive', value: true },
            ],
          },
          // autoBind: false,
          sortable: false,
          pageable: false,
          editable: false,
          dataBound: ctrl.detailGridDataBound,
          columns: [
            {
              title: '',
              width: ctrl.smlIndent,
              attributes: {
                class: 'serviceindent',
              },
            },
            {
              title: ' ',
              template: kendo.template(
                '<button class="btn btn-link ng-binding" ng-disabled="selectedPreventiveServices.length>0" ng-click="addRemoveServiceCode(dataItem, true)">+ quick add</button>'
              ),
              width: ctrl.smlQuickWidth + '%',
            },
            {
              title: '',
              template: kendo.template(
                '<checkbox checkbox-value="dataItem.$$CheckboxValue" change-function="addRemoveServiceCode(dataItem, false)" ></checkbox>'
              ),
              width: ctrl.smlCheckWidth + '%',
              attributes: {
                class: 'grid-checkbox order-#:data.Order#',
              },
            },
            {
              title: ' ',
              template: kendo.template(
                '<i ng-if="!dataItem.IsActive" class="fa fa-exclamation-triangle inactive-service-warning"' +
                  'popover-trigger="' +
                  "'" +
                  'mouseenter' +
                  "'" +
                  '"' +
                  'popover-placement="auto bottom" popover-append-to-body="false"' +
                  'uib-popover="Inactive as of {{dataItem.InactivationDate|date:\'MM/dd/yyyy\'}}"></i>'
              ),
              width: '3%',
              attributes: {
                class: 'warning-container',
              },
            },
            {
              field: 'Code',
              title: localize.getLocalizedString('Service Code'),
              width: ctrl.smlCodeWidth + '%',
            },
            {
              field: 'CdtCodeName',
              title: localize.getLocalizedString('CDT Code'),
              width: ctrl.smlCdtWidth + '%',
            },
            {
              field: 'Description',
              title: localize.getLocalizedString('Description'),
              width: ctrl.smlDescWidth + '%',
            },
            {
              field: 'Fee',
              template: kendo.template(
                '<span>{{dataItem.Fee | currency}}</span>'
              ),
              title: localize.getLocalizedString('Fee'),
              width: ctrl.smlFeeWidth + '%',
              attributes: {
                class: 'fee',
                style: 'text-align: right',
              },
            },
            {
              field: 'DueDate',
              title: localize.getLocalizedString('Due Date'),
              width: ctrl.smlDueDateWidth + '%',
              template: kendo.template(
                "<span ng-if='dataItem.DueDate'>{{dataItem.DueDate | date:'MM/dd/yyyy'}}</span><span ng-if='!dataItem.DueDate'>NA</span>"
              ),
            },
            {
              field: 'LastPerformed',
              title: localize.getLocalizedString('Last Performed'),
              width: ctrl.smlLastDateWidth + '%',
              template: kendo.template(
                "<span ng-if='dataItem.LastPerformed'>{{dataItem.LastPerformed | date:'MM/dd/yyyy'}}</span><span ng-if='!dataItem.LastPerformed'>00/00/00</span>"
              ),
            },
          ],
        };
      };
      $scope.detailGridOptionsSmall = function (dataItem) {
        return {
          dataSource: {
            data: $scope.data,
            filter: [
              { field: 'Order', operator: 'eq', value: dataItem.Order },
              { field: 'IsActive', value: true },
            ],
          },
          // autoBind: false,
          sortable: false,
          pageable: false,
          editable: false,
          dataBound: ctrl.detailGridDataBound,
          columns: [
            {
              title: '',
              width: ctrl.smlIndent,
              attributes: {
                class: 'serviceindent',
              },
            },
            {
              title: ' ',
              template: kendo.template(
                '<button class="btn btn-link ng-binding" ng-disabled="selectedPreventiveServices.length>0" ng-click="addRemoveServiceCode(dataItem, true)">+ quick add</button>'
              ),
              width: ctrl.smlQuickWidth + '%',
            },
            {
              title: '',
              template: kendo.template(
                '<checkbox checkbox-value="dataItem.$$CheckboxValue" change-function="addRemoveServiceCode(dataItem, false)" ></checkbox>'
              ),
              width: ctrl.smlCheckWidth + '%',
              attributes: {
                class: 'grid-checkbox order-#:data.Order#',
              },
            },
            {
              field: 'Code',
              title: localize.getLocalizedString('Service Code'),
              width: ctrl.smlCodeWidth + '%',
            },
            {
              field: 'Description',
              title: localize.getLocalizedString('Description'),
              width: ctrl.smlDescWidth + '%',
            },
            {
              field: 'Fee',
              template: kendo.template(
                '<span>{{dataItem.Fee | currency}}</span>'
              ),
              title: localize.getLocalizedString('Fee'),
              width: ctrl.smlFeeWidth + '%',
              attributes: {
                class: 'fee',
                style: 'text-align: right',
              },
            },
            {
              field: 'DueDate',
              title: localize.getLocalizedString('Due Date'),
              width: ctrl.smlDueDateWidth + '%',
              template: kendo.template(
                "<span ng-if='dataItem.DueDate'>{{dataItem.DueDate | date:'MM/dd/yyyy'}}</span><span ng-if='!dataItem.DueDate'>NA</span>"
              ),
            },
            {
              field: 'LastPerformed',
              title: localize.getLocalizedString('Last Performed'),
              width: ctrl.smlLastDateWidth + '%',
              template: kendo.template(
                "<span ng-if='dataItem.LastPerformed'>{{dataItem.LastPerformed | date:'MM/dd/yyyy'}}</span><span ng-if='!dataItem.LastPerformed'>00/00/00</span>"
              ),
            },
          ],
        };
      };
      ctrl.smlIndent;
      ctrl.smlQuickWidth;
      ctrl.smlCheckWidth;
      ctrl.smlCodeWidth;
      ctrl.smlDescWidth;
      ctrl.smlFeeWidth;
      ctrl.smlDueDateWidth;
      ctrl.smlLastDateWidth;
      ctrl.setGridVariables = function () {
        if ($scope.flyout && $scope.serviceFilter == 'encounter') {
          $scope.gridHeight = 506;
          ctrl.smlIndent = 50;
          ctrl.smlQuickWidth = 8;
          ctrl.smlCheckWidth = 3.3;
          ctrl.smlCodeWidth = 10;
          ctrl.smlCdtWidth = 10;
          ctrl.smlDescWidth = 39;
          ctrl.smlFeeWidth = 7;
          ctrl.smlDueDateWidth = 11;
          ctrl.smlLastDateWidth = 11;
        }
        if ($scope.flyout && $scope.serviceFilter == 'encounter-refactored') {
          $scope.gridHeight = 506;
          ctrl.smlIndent = 20;
          ctrl.smlQuickWidth = 11;
          ctrl.smlCheckWidth = 3;
          ctrl.smlCodeWidth = 10;
          ctrl.smlCdtWidth = 10;
          ctrl.smlDescWidth = 23;
          ctrl.smlFeeWidth = 9;
          ctrl.smlDueDateWidth = 10;
          ctrl.smlLastDateWidth = 10;
        }
        if ($scope.flyout && $scope.serviceFilter == 'appointment') {
          //appointment modal
          $scope.gridHeight = 310;
          ctrl.smlIndent = 20;
          ctrl.smlQuickWidth = 11;
          ctrl.smlCheckWidth = 3;
          ctrl.smlCodeWidth = 10;
          ctrl.smlCdtWidth = 10;
          ctrl.smlDescWidth = 23;
          ctrl.smlFeeWidth = 9;
          ctrl.smlDueDateWidth = 10;
          ctrl.smlLastDateWidth = 10;
        }
        if (!$scope.flyout && $scope.serviceFilter == 'appointment') {
          //running appointment
          $scope.gridHeight = 346;
          ctrl.smlIndent = 20;
          ctrl.smlQuickWidth = 9;
          ctrl.smlCheckWidth = 2.5;
          ctrl.smlCodeWidth = 10;
          ctrl.smlDescWidth = 31;
          ctrl.smlFeeWidth = 11;
          ctrl.smlDueDateWidth = 12;
          ctrl.smlLastDateWidth = 12;
        }
        if ($scope.flyout && $scope.serviceFilter == 'txplan') {
          //add services modal
          $scope.gridHeight = 506;
          ctrl.smlIndent = 20;
          ctrl.smlQuickWidth = 11;
          ctrl.smlCheckWidth = 3;
          ctrl.smlCodeWidth = 10;
          ctrl.smlCdtWidth = 10;
          ctrl.smlDescWidth = 23;
          ctrl.smlFeeWidth = 9;
          ctrl.smlDueDateWidth = 10;
          ctrl.smlLastDateWidth = 10;
        }
      };
      ctrl.setGridVariables();

      $scope.addRemoveServiceCode = function (dataService, quickAdd) {
        var service = $scope.data.filter(d => d.ServiceCodeId == dataService.ServiceCodeId)[0];
        var selectedCodes = $scope.selectedPreventiveServices.filter(
          function (code) {
            return (
              code.ServiceCodeId == service.ServiceCodeId &&
              code.Order == service.Order
            );
          }
        );
        if (selectedCodes.length == 0) {
          $scope.selectedPreventiveServices.push(service);
        } else {
          var delete_index = $scope.selectedPreventiveServices.indexOf(
            selectedCodes[0]
          );
          $scope.selectedPreventiveServices.splice(delete_index, 1);

          var mainGridData = ctrl.getGridData();
          if (mainGridData) {
            angular.forEach(mainGridData, function (data) {
              if (data.Order == service.Order && data.$$CheckboxValue == true) {
                data.$$CheckboxValue = false;
              }
            });
          }
        }

        var selectedCodeLength = $scope.selectedPreventiveServices.filter(
          function (code) {
            return code.Order == service.Order;
          }
        ).length;

        var codeLength = $scope.data.filter(function (code) {
          return code.Order == service.Order;
        }).length;
        var gridItem = $.grep(ctrl.getGridDataItem(), function (item) {
          return item.Order == service.Order;
        });
        if (gridItem.length > 0) {
          gridItem[0].$$CheckboxValue = codeLength == selectedCodeLength;
        }
        if (quickAdd) {
          $scope.addSrvcCodesToPrev();
          $scope.$emit('soar:appt-tab-action-canceled');
        }
      };

      $scope.addRemovePreventiveCareServices = function (order, quickAdd) {
        var preventiveCareServices = $scope.data.filter(function (code) {
          return code.Order == order;
        });

        var selectedCodes = $scope.selectedPreventiveServices.filter(
          function (code) {
            return code.Order == order;
          }
        );
        var dataItems = ctrl.getDetailGridDataItems(order);

        if (selectedCodes.length == preventiveCareServices.length) {
          angular.forEach(selectedCodes, function (code) {
            var delete_index = $scope.selectedPreventiveServices.indexOf(code);
            $scope.selectedPreventiveServices.splice(delete_index, 1);
          });
          angular.forEach(dataItems, function (dataItem) {
            dataItem.$$CheckboxValue = false;
          });
        } else {
          angular.forEach(preventiveCareServices, function (service) {
            selectedCodes = $scope.selectedPreventiveServices.filter(
              function (code) {
                return code.ServiceCodeId == service.ServiceCodeId;
              }
            );
            if (selectedCodes.length == 0) {
              $scope.selectedPreventiveServices.push(service);
            }
          });
          angular.forEach(dataItems, function (dataItem) {
            dataItem.$$CheckboxValue = true;
          });
        }
        if (quickAdd) {
          $scope.addSrvcCodesToPrev();
          $scope.$emit('soar:appt-tab-action-canceled');
        }
      };

      $scope.addSrvcCodesToPrev = function () {
        $scope.serviceTransactions = [];
        $scope.plannedServices = [];
        $scope.serviceCodesTransactions = [];
        $scope.noSwiftCodeList = []; //used to check for swift codes

        angular.forEach($scope.selectedPreventiveServices, function (service) {
          if (service.IsSwiftPickCode) {
            angular.forEach(service.SwiftPickServiceCodes, function (serv) {
              $scope.noSwiftCodeList.push(serv);
            });
          } else {
            $scope.noSwiftCodeList.push(service);
          }
        });
        angular.forEach($scope.noSwiftCodeList, function (service) {
          $scope.addToServiceTransactions(service);
        });

        angular.forEach(
          $scope.serviceTransactions,
          function (serviceTransaction) {
            var service = listHelper.findItemByFieldValue(
              $scope.data,
              'ServiceCodeId',
              serviceTransaction.ServiceCodeId
            );
            if (service != null) {
              serviceTransaction.CompleteDescription = service.Description;
              // add not empty cdt code to description for service codes of swift pick code
              if (
                service.CdtCodeName != null &&
                service.CdtCodeName != '' &&
                service.CdtCodeName != undefined
              )
                serviceTransaction.CompleteDescription =
                  service.Description + ' (' + service.CdtCodeName + ')';
            } else {
              serviceTransaction.CompleteDescription =
                serviceTransaction.Description;
              if (
                serviceTransaction.CdtCodeName != null &&
                serviceTransaction.CdtCodeName != '' &&
                serviceTransaction.CdtCodeName != undefined
              )
                serviceTransaction.CompleteDescription =
                  serviceTransaction.Description +
                  ' (' +
                  serviceTransaction.CdtCodeName +
                  ')';
            }
          }
        );

        if (
          patSecurityService.IsAuthorizedByAbbreviation(
            $scope.soarAuthEnctrAddSvcKey
          )
        ) {
          ctrl.elementIndex = -1;
          var isValid = true;
          var validatedServiceTransactions = [];
          var selectedCount = 0;
          angular.forEach(
            $scope.serviceTransactions,
            function (serviceTransaction) {
              if (isValid) {
                serviceTransaction.invalidTooth = false;
                isValid = ctrl.serviceTransactionIsValid(serviceTransaction);
                validatedServiceTransactions.push(serviceTransaction);
              }
              ++selectedCount;
            }
          );
          if (
            isValid &&
            validatedServiceTransactions.length === selectedCount
          ) {
            $scope.addToPlannedServicesList(validatedServiceTransactions);
          }
          if ($scope.flyout && $scope.plannedServices.length > 0) {
            $scope.sendDataToAppointment();
          } else if ($scope.plannedServices.length > 0) {
            var message = localize.getLocalizedString(
              'Are you sure you want to add {0} to appointment?',
              ['preventive service']
            );

            var title = localize.getLocalizedString('+Preventive Care');
            var buttonOkText = localize.getLocalizedString('Yes');
            var buttonCancelText = localize.getLocalizedString('No');

            modalFactory
              .ConfirmModal(
                title,
                message,
                buttonOkText,
                buttonCancelText,
                null
              )
              .then($scope.sendDataToAppointment);
          }
        } else {
          toastrFactory.error(
            patSecurityService.generateMessage($scope.soarAuthEnctrAddSvcKey),
            'Not Authorized'
          );
          $location.path('/');
        }
      };
      $scope.AddSelectedText = 'Add Services';
      $scope.mainGridOptions = {
        dataSource: $scope.preventiveCareApptGridDataSource,
        toolbar: [
          {
            template: kendo.template(
              '<button class="btn btn-primary" icon="fa-plus" ng-disabled="selectedPreventiveServices.length==0" ng-click="addSrvcCodesToPrev();showPreventiveService=false;">{{\'' +
                $scope.AddSelectedText +
                '\' | i18n}}</button><input id="showPreventiveCareSelector" style="margin-left: 58%;" type="checkbox" ng-model="allowInactive" ng-change="setStatus()">   Show Inactive'
            ),
          },
        ],
        // autoBind: false,
        sortable: false,
        pageable: false,
        dataBound: ctrl.prevCareGridDataBound,
        editable: false,
        columns: [
          {
            field: 'TypeOfService',
            title: localize.getLocalizedString(' '),
            template: kendo.template(
              "<span>{{dataItem.TypeOfService}} {{(dataItem.DueDate) ? dataItem.DueDate : '(Due NA)' | date : '(Due MM/dd/yyyy)'}} </span>"
            ),
          },
        ],
      };

      ctrl.detailGridDataBound = function (e) {
        var order = e.sender.element
          .attr('id')
          .replace('prevCareApptGridInnerDetail', '');
        var dataItems = ctrl.getDetailGridDataItems(order);
        var selectedCodes = $scope.selectedPreventiveServices.filter(
          function (code) {
            return code.Order == order;
          }
        );

        angular.forEach(selectedCodes, function (service) {
          angular.forEach(dataItems, function (dataItem) {
            if (service.ServiceCodeId == dataItem.ServiceCodeId) {
              dataItem.$$CheckboxValue = true;
            }
          });
        });
      };

      ctrl.prevCareGridDataBound = function () {
        var dataSource = ctrl.getGridData();

        angular.forEach(dataSource, function (prevCareItem) {
          var preventiveCareServices = $scope.data.filter(function (code) {
            return code.Order == prevCareItem.Order;
          });

          var selectedCodes = $scope.selectedPreventiveServices.filter(
            function (code) {
              return code.Order == prevCareItem.Order;
            }
          );

          prevCareItem.$$CheckboxValue =
            preventiveCareServices.length == selectedCodes.length;
        });
      };

      $scope.preventiveCareApptGridOptions = {
        dataSource: $scope.preventiveCareApptGridDataSource,
        toolbar: [
          {
            template: kendo.template(
              '<button class="btn btn-primary" icon="fa-plus" ng-disabled="SelectedServiceCodes.length==0" ng-click="addSrvcCodesToPrev();showPreventiveService=false;">{{\'Add Selected to Appointment\' | i18n}}</button>'
            ),
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
            template: kendo.template(
              '<checkbox checkbox-value="dataItem.$$CheckboxValue" change-function="addRemoveServiceCode(dataItem)" ></checkbox>'
            ),
            width: '5%',
            attributes: {
              class: 'grid-checkbox',
            },
            title: ' ',
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

      $scope.sendDataToAppointment = function () {
        var returnedData = {
          PlannedServices: angular.copy($scope.plannedServices),
          ServiceCodes: angular.copy($scope.serviceCodesTransactions),
        };
        if ($scope.flyout) {
          $scope.hideFilters();
        }
        ctrl.resetPrevCareItems();
        //passing true to use the extra modal
        $scope.addSelectedServices(returnedData, true);
      };

      ctrl.resetPrevCareItems = function () {
        $scope.serviceTransactions = [];
        $scope.plannedServices = [];
        $scope.serviceCodesTransactions = [];
        $scope.selectedPreventiveServices = [];
        angular.forEach(ctrl.getGridData(), function (dataItem) {
          var detailData = ctrl.getDetailGridDataItems(dataItem.Order);
          angular.forEach(detailData, function (detailItem) {
            if (detailItem.$$CheckboxValue) {
              detailItem.$$CheckboxValue = false;
            }
          });
        });
      };

      $scope.addToPlannedServicesList = function (newServices) {
        if (angular.isArray(newServices)) {
          angular.forEach(newServices, function (item) {
            $scope.plannedServices.push(item);
          });
        } else {
          $scope.plannedServices.push(newServices);
        }
      };

      $scope.addToServiceTransactions = function (serviceCode) {
        if (serviceCode) {
          serviceCode.ObjectState = saveStates.Add;

          if ($scope.appointmentData) {
            $scope.serviceTransactions.push(
              $scope.FormatServiceTransaction(
                serviceCode,
                $scope.appointmentData,
                $scope.appointmentData.appointmentType
              )
            );
          } else
            $scope.serviceTransactions.push(
              $scope.FormatServiceTransaction(serviceCode, null, null)
            );

          $scope.serviceCodesTransactions.push(angular.copy(serviceCode));
        }
      };

      $scope.FormatServiceTransaction = function (
        serviceCode,
        appointment,
        appointmentType
      ) {
        var serviceTransaction = {
          SequenceNumber: 1,
          PersonId: ctrl.PersonId,
          Code: serviceCode ? serviceCode.Code : '',
          DisplayAs: serviceCode
            ? serviceCode.DisplayAs
              ? serviceCode.DisplayAs
              : serviceCode.Code
            : '',
          Description: serviceCode ? serviceCode.Description : '',
          CdtCodeName: serviceCode ? serviceCode.CdtCodeName : '',
          ServiceTypeDescription: serviceCode
            ? serviceCode.ServiceTypeDescription
            : '',
          ServiceCodeId: serviceCode ? serviceCode.ServiceCodeId : '',
          DateEntered:
            $scope.$parent.appointmentDate == null ||
            $scope.$parent.appointmentDate >= ctrl.dateToday
              ? ctrl.dateToday
              : $scope.$parent.appointmentDate,
          EnteredByUserId: null,
          ServiceTransactionStatusId: 1,
          AccountMemberId: ctrl.getAccountMemberId(serviceCode, appointment),
          TransactionTypeId: 1,
          Note: '',
          AppointmentId: appointment != null ? appointment.AppointmentId : null,
          ProviderUserId: ctrl.getDefaultProviderIdForServiceCode(
            serviceCode,
            appointment,
            appointmentType
          ),
          Surface: '',
          Roots: '',
          Tooth: '',
          AffectedAreaId: serviceCode ? serviceCode.AffectedAreaId : null,
          Fee: serviceCode.$$locationFee
            ? serviceCode.$$locationFee
            : serviceCode.Fee,
          ValidDate: true,
          ToothFirst: false,
          ObjectState: serviceCode
            ? serviceCode.ObjectState
              ? serviceCode.ObjectState
              : saveStates.None
            : '',
          Selected: true,
          TransactionType: serviceCode ? serviceCode.TransactionType : '',
          UsuallyPerformedByProviderTypeId: serviceCode
            ? serviceCode.UsuallyPerformedByProviderTypeId
            : '',
          IsActive: serviceCode.IsActive,
          InactivationDate: serviceCode.InactivationDate,
        };
        serviceTransaction.InsuranceEstimates =
          financialService.CreateInsuranceEstimateObject(serviceTransaction);
        return serviceTransaction;
      };

      ctrl.getAccountMemberId = function (serviceCode, appointment) {
        if (appointment != null) {
          if (
            appointment.Patient &&
            appointment.Patient.PersonAccount &&
            appointment.Patient.PersonAccount.PersonAccountMember
          )
            var AccountMemberId =
              appointment.Patient.PersonAccount.PersonAccountMember
                .AccountMemberId;
          if (AccountMemberId) return AccountMemberId;
          else return appointment.PersonId;
        } else if (serviceCode != null) {
          return serviceCode.AccountMemberId;
        } else {
          return null;
        }
      };

      ctrl.getDefaultProviderIdForServiceCode = function (
        serviceCode,
        appointment,
        appointmentType
      ) {
        if (serviceCode != null && appointment != null) {
          var providerOnAppointment =
            appointment.ProviderAppointments != null &&
            appointment.ProviderAppointments.length > 0
              ? appointment.ProviderAppointments[0].UserId
              : null;
          var examiningDentist = appointment.ExaminingDentist;

          var hasAppointmentType = appointmentType != null;
          var serviceCodePerformedByHygienist =
            serviceCode.UsuallyPerformedByProviderTypeId == 2;
          var serviceCodePerformedByDentist =
            serviceCode.UsuallyPerformedByProviderTypeId == 1;

          if (hasAppointmentType) {
            var isHygieneAppointment =
              appointmentType.PerformedByProviderTypeId == 2;
            var isRegularAppointment =
              appointmentType.PerformedByProviderTypeId == 1;

            if (isHygieneAppointment) {
              if (serviceCodePerformedByHygienist) {
                return providerOnAppointment;
              } else if (serviceCodePerformedByDentist) {
                return examiningDentist;
              } else {
                return null;
              }
            } else if (isRegularAppointment) {
              if (serviceCodePerformedByHygienist) {
                return null;
              } else if (serviceCodePerformedByDentist) {
                return providerOnAppointment;
              } else {
                return providerOnAppointment;
              }
            } else {
              return providerOnAppointment;
            }
          } else {
            return providerOnAppointment;
          }
        } else if (
          serviceCode != null &&
          appointment == null &&
          $scope.currentPatient
        ) {
          //For encounter services
          if (
            serviceCode.UsuallyPerformedByProviderTypeId == 1 &&
            $scope.currentPatient.PreferredDentist
          ) {
            //If service is usually performed by dentist and the preferred dentist for a patient exists, set the provider user id for the service to preferred dentist
            return $scope.currentPatient.PreferredDentist;
          } else if (
            serviceCode.UsuallyPerformedByProviderTypeId == 2 &&
            $scope.currentPatient.PreferredHygienist
          ) {
            //If service is usually performed by hygienist and the preferred hygienist for a patient exists, set the provider user id for the service to preferred dentist
            return $scope.currentPatient.PreferredHygienist;
          } else {
            return null;
          }
        } else {
          return null;
        }
      };

      // validate service transaction instance
      ctrl.serviceTransactionIsValid = function (serviceTransaction) {
        ctrl.elementIndex++;
        serviceTransaction.invalidTooth = false;
        var isValidDate =
          angular.isDefined(serviceTransaction.DateEntered) &&
          serviceTransaction.ValidDate;
        var isValidProvider =
          true || $scope.hideProvider || serviceTransaction.ProviderUserId > '';
        var isValidFee =
          serviceTransaction.Fee == undefined ||
          serviceTransaction.Fee == null ||
          (serviceTransaction.Fee >= 0 && serviceTransaction.Fee <= 999999.99);
        if (!isValidDate) {
          $timeout(function () {
            angular
              .element('#inpServiceCodeDate' + ctrl.elementIndex)
              .find('input')
              .focus();
          }, 0);
          return false;
        }
        if (!isValidProvider) {
          $timeout(function () {
            angular
              .element('#lstProvider' + ctrl.elementIndex)
              .find('span')
              .focus();
          }, 0);
          return false;
        }
        if (!isValidFee) {
          $timeout(function () {
            angular.element('#inpFee' + ctrl.elementIndex).focus();
          }, 0);
          return false;
        }
        return true;
      };

      ctrl.setDisplayMessage = function () {
        switch ($scope.serviceFilter) {
          case 'appointment':
            $scope.displayMessage = localize.getLocalizedString('Appointment');
            break;
          case 'txplan':
            $scope.displayMessage =
              localize.getLocalizedString('Treatment Plan');
            break;
          default:
            $scope.displayMessage = localize.getLocalizedString('Encounter');
            break;
        }
      };
      ctrl.setDisplayMessage();

      $scope.setStatus = function () {
        var detailDataSource = null;
        $scope.allowInactive = !$scope.allowInactive;

        angular.forEach(ctrl.getGridData(), function (dataItem) {
          detailDataSource = ctrl.getDetailGridDataSource(dataItem.Order);

          if (detailDataSource != null) {
            if ($scope.allowInactive) {
              detailDataSource.filter().filters.pop();
            } else {
              var filter = { field: 'IsActive', value: true };
              detailDataSource.filter().filters.push(filter);
            }

            detailDataSource.read();
          }
        });
      };

      $scope.$on('kendoWidgetCreated', function (event, widget) {
        var detailId = widget.element.find('.k-detail-row').context.id;
        var grid = $('#' + detailId).data('kendoGrid');
        // need to check if the grid item exists because during page transitions we were seeing exceptions
        // because it was being destroyed or was not done being created yet
        if (grid !== null && grid !== undefined) {
          var detailDs = grid.dataSource;

          if (detailDs.filter() != null || detailDs.filter() != undefined) {
            if ($scope.allowInactive) {
              detailDs.filter().filters.pop();
            }

            detailDs.read();
          }
        }
      });
    },
  ]);
