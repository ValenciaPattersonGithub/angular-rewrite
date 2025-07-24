'use strict';

angular.module('Soar.BusinessCenter').factory('DepositPaymentsGridFactory', [
  '$resource',
  '$filter',
  'localize',
  'GridOptionsFactory',
  'TimeZoneFactory',
  function ($resource, $filter, localize, gridOptionsFactory, timeZoneFactory) {
    var GridOptions = function () {
      var options = gridOptionsFactory.createOptions();

      options.id = 'DepositPaymentsGrid';
      options.updateOnInit = false;
      options.pageSize = 0;
      options.enableScroll = true;
      options.scrollHeight = '300px';

      options.query = $resource(
        '_soarapi_/deposit/paymentsgrid',
        {},
        { getData: { method: 'POST' } }
      );

      options.failAction = function (data) {
        var errorMessage = localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['payments']
        );
        console.log(errorMessage);
      };

      options.additionalFilters = [
        {
          field: 'Locations',
          filter: null,
        },
      ];

      options.columnDefinition = [
        {
          title: 'Select',
          field: 'CreditTransactionId',
          filterable: true,
          sortable: false,
          type: 'check-box',
          size: '1',
          ifEmpty: [
            function (row) {
              var id = 'chkPayment' + row['BulkCreditTransactionId'];
              if (row.Selected) {
                return (
                  '<input type="checkbox" id="' +
                  id +
                  '"ng-click="actions.selectPayment(row)" class="depositCheckBox" checked>'
                );
              } else {
                return (
                  '<input type="checkbox" id="' +
                  id +
                  '"ng-click="actions.selectPayment(row)" class="depositCheckBox">'
                );
              }
            },
          ],
          template: [
            function (data, row) {
              var id = 'chkPayment' + data;
              return (
                '<input type="checkbox" id="' +
                id +
                '"ng-click="actions.selectPayment(row)" class="depositCheckBox" ng-model="row.Selected">'
              );
            },
          ],
        },
        {
          title: 'Payee',
          field: 'PatientName',
          fieldId: 'PatientId',
          filterable: true,
          sortable: true,
          size: '2',
          template: [
            function (data, row) {
              return (
                '<button ng-disabled="!row.UserCanEdit" tooltip-placement="left auto" tooltip-append-to-body="true" tooltip-enable="!row.UserCanEdit" uib-tooltip="You do not have access to all locations on this bulk insurance payment" ng-if="row.TransactionTypeId == 3" class="btn btn-link wrapButtonText" ng-click="actions.navigateToInsurancePayment(row)">' +
                _.escape(data) +
                '</button>' +
                '<span ng-if="row.TransactionTypeId !== 3">' +
                _.escape(data) +
                '</span>'
              );
            },
          ],
        },
        {
          title: 'Date',
          field: 'DateEntered',
          fieldFrom: 'DateEnteredFrom',
          fieldTo: 'DateEnteredTo',
          filterable: true,
          sortable: true,
          type: 'date-range',
          size: '3',
          printable: true,
          template: [
            function (data, row) {
              var date = $filter('toShortDisplayDate')(
                row.LocationTimezone
                  ? timeZoneFactory.ConvertDateTZString(
                      data,
                      row.LocationTimezone
                    )
                  : data
              );
              return date;
            },
          ],
        },
        {
          title: 'Type',
          field: 'TransactionTypeDescription',
          fieldId: 'TransactionTypeId',
          filterable: true,
          sortable: true,
          type: 'dropdown',
          dropDown: 'TransactionTypes',
          size: '1',
        },
        {
          title: 'Payment Type',
          field: 'PaymentTypeDescription',
          fieldId: 'PaymentTypeId',
          filterable: true,
          sortable: true,
          type: 'multiselect',
          multiselectitems: 'PaymentTypes',
          size: '2',
          template: [
            function (data) {
              return _.escape(data);
            },
          ],
        },
        {
          title: 'Additional Info',
          field: 'Note',
          fieldId: 'Note',
          filterable: true,
          sortable: true,
          size: '2',
          template: [
            function (data) {
              return _.escape(data);
            },
          ],
        },
        {
          title: 'Amount',
          field: 'Amount',
          fieldFrom: 'AmountFrom',
          fieldTo: 'AmountTo',
          filterable: true,
          sortable: true,
          type: 'number-range',
          size: '1',
          printable: true,
          template: [
            function (data) {
              var item = $filter('currency')(data, '$', 2);
              return '<span class="pull-right">' + item + '</span>';
            },
          ],
        },
      ];
      return options;
    };

    return {
      getOptions: function () {
        return new GridOptions();
      },
    };
  },
]);
