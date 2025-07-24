'use strict';

angular
  .module('Soar.BusinessCenter')
  .factory('ReceivablesByLocationGridFactory', [
    '$resource',
    '$filter',
    'localize',
    'GridOptionsFactory',
    function ($resource, $filter, localize, gridOptionsFactory) {
      var GridOptions = function () {
        var options = gridOptionsFactory.createOptions();

        options.id = 'ReceivablesByLocationGrid';
        options.updateOnInit = false;

        options.query = $resource(
          '_soarapi_/receivables/grid',
          {},
          { getData: { method: 'POST' } }
        );

        options.failAction = function (data) {
          var errorMessage = localize.getLocalizedString(
            'Failed to retrieve the list of {0}. Refresh the page to try again.',
            ['receivables']
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
            title: 'Status',
            field: 'ResponsiblePartyId',
            size: '1',
            printable: true,
            printTemplate: function (data, row) {
              var totalBalance =
                Math.abs(row['Balance30']) +
                Math.abs(row['Balance60']) +
                Math.abs(row['Balance90']) +
                Math.abs(row['BalanceCurrent']);

              var chartId = _.escape(data);

              var balanceCurrent = _.escape(
                Number(
                  (
                    (Math.abs(row['BalanceCurrent']) / totalBalance) *
                    100
                  ).toFixed(2)
                )
              );
              var balance30 = _.escape(
                Number(
                  ((Math.abs(row['Balance30']) / totalBalance) * 100).toFixed(2)
                )
              );
              var balance60 = _.escape(
                Number(
                  ((Math.abs(row['Balance60']) / totalBalance) * 100).toFixed(2)
                )
              );
              var balance90 = _.escape(
                Number(
                  ((Math.abs(row['Balance90']) / totalBalance) * 100).toFixed(2)
                )
              );

              return (
                '<div class="balanceGraph" id="' +
                chartId +
                '">' +
                '<div class="balanceCurrent" style="width:' +
                balanceCurrent +
                '%"></div>' +
                '<div class="balance30" style="width:' +
                balance30 +
                '%"></div>' +
                '<div class="balance60" style="width:' +
                balance60 +
                '%"></div>' +
                '<div class="balance90" style="width:' +
                balance90 +
                '%"></div></div>'
              );
            },
            template: [
              function (data, row) {
                var totalBalance =
                  Math.abs(row['Balance30']) +
                  Math.abs(row['Balance60']) +
                  Math.abs(row['Balance90']) +
                  Math.abs(row['BalanceCurrent']);

                var chartId = _.escape(data);

                var balanceCurrent = _.escape(
                  Number(
                    (
                      (Math.abs(row['BalanceCurrent']) / totalBalance) *
                      100
                    ).toFixed(2)
                  )
                );
                var balance30 = _.escape(
                  Number(
                    ((Math.abs(row['Balance30']) / totalBalance) * 100).toFixed(
                      2
                    )
                  )
                );
                var balance60 = _.escape(
                  Number(
                    ((Math.abs(row['Balance60']) / totalBalance) * 100).toFixed(
                      2
                    )
                  )
                );
                var balance90 = _.escape(
                  Number(
                    ((Math.abs(row['Balance90']) / totalBalance) * 100).toFixed(
                      2
                    )
                  )
                );

                return (
                  '<div class="progress balanceGraph" id="' +
                  chartId +
                  '">' +
                  '<div class="progress-bar balance-current" role="progressbar" style="width:' +
                  balanceCurrent +
                  '%"></div>' +
                  '<div class="progress-bar balance-overdue" role="progressbar" style="width:' +
                  balance30 +
                  '%"></div>' +
                  '<div class="progress-bar balance-overdue" role="progressbar" style="width:' +
                  balance60 +
                  '%"></div>' +
                  '<div class="progress-bar balance-delinquent" role="progressbar" style="width:' +
                  balance90 +
                  '%"></div></div>'
                );
              },
            ],
          },
          {
            title: 'Responsible Party',
            field: 'ResponsiblePartyName',
            fieldId: 'ResponsiblePartyId',
            filterable: true,
            sortable: true,
            size: '2',
            printable: true,
            printTemplate: function (data) {
              return _.escape(data);
            },
            template: [
              function (data, row) {
                return (
                  '<a class="wrapButtonText" ng-click="actions.navToPatientProfile(\'' +
                  row['ResponsiblePartyId'] +
                  '\')">' +
                  _.escape(data) +
                  '</a>'
                );
              },
            ],
          },
          {
            title: 'Account (Total Balance)',
            field: 'TotalAccountBalance',
            fieldFrom: 'TotalAccountBalanceFrom',
            fieldTo: 'TotalAccountBalanceTo',
            filterable: true,
            sortable: true,
            type: 'number-range',
            size: '1',
            printable: true,
            template: [
              function (data) {
                var item = $filter('currency')(data, '$', 2);
                return '<span class="pull-right">' + _.escape(item) + '</span>';
              },
            ],
          },
          {
            title: 'Unapplied (Total Account)',
            field: 'TotalAccountCreditAmount',
            fieldFrom: 'TotalAccountCreditAmountFrom',
            fieldTo: 'TotalAccountCreditAmountTo',
            filterable: true,
            sortable: true,
            type: 'number-range',
            size: '1',
            printable: true,
            template: [
              function (data) {
                var item = $filter('currency')(data, '$', 2);
                return '<span class="pull-right">' + _.escape(item) + '</span>';
              },
            ],
          },
          {
            title: 'Location',
            field: 'LocationName',
            fieldId: 'LocationId',
            filterable: false,
            sortable: true,
            size: '2',
            printable: true,
            printTemplate: function (data) {
              return _.escape(data);
            },
            template: [
              function (data) {
                return '<span class="pull-right">' + _.escape(data) + '</span>';
              },
            ],
          },
          {
            title: 'Location Total',
            field: 'Balance',
            fieldFrom: 'BalanceFrom',
            fieldTo: 'BalanceTo',
            filterable: true,
            sortable: true,
            type: 'number-range',
            size: '1',
            printable: true,
            template: [
              function (data) {
                var item = $filter('currency')(data, '$', 2);
                return '<span class="pull-right">' + _.escape(item) + '</span>';
              },
            ],
          },
          {
            title: 'Patient Portion',
            field: 'PatientPortion',
            fieldFrom: 'PatientPortionFrom',
            fieldTo: 'PatientPortionTo',
            filterable: true,
            sortable: true,
            type: 'number-range',
            size: '1',
            printable: true,
            template: [
              function (data) {
                var item = $filter('currency')(data, '$', 2);
                return '<span class="pull-right">' + _.escape(item) + '</span>';
              },
            ],
          },
          {
            title: 'Est. Ins.',
            field: 'EstimatedInsurance',
            fieldFrom: 'EstimatedInsuranceFrom',
            fieldTo: 'EstimatedInsuranceTo',
            filterable: true,
            sortable: true,
            type: 'number-range',
            size: '1',
            printable: true,
            template: [
              function (data) {
                var item = $filter('currency')(data, '$', 2);
                return '<span class="pull-right">' + _.escape(item) + '</span>';
              },
            ],
          },
          {
            title: 'Est. Ins. Adj.',
            field: 'EstimatedAdjInsurance',
            fieldFrom: 'EstimatedAdjInsuranceFrom',
            fieldTo: 'EstimatedAdjInsuranceTo',
            filterable: true,
            sortable: true,
            type: 'number-range',
            size: '1',
            printable: true,
            template: [
              function (data) {
                var item = $filter('currency')(data, '$', 2);
                return '<span class="pull-right">' + _.escape(item) + '</span>';
              },
            ],
          },
          {
            title: 'Latest Statement',
            field: 'LastStatementDate',
            fieldFrom: 'LastStatementDateFrom',
            fieldTo: 'LastStatementDateTo',
            type: 'date-range',
            filterable: true,
            sortable: true,
            size: '1',
            printable: true,
            printTemplate: function (data, row) {
              if (data === null) {
                return 'N/A';
              } else {
                var date = $filter('toShortDisplayDateUtc')(data);
                var balance = row['LastStatementBalance'];
                balance = $filter('currency')(balance, '$', 2);
                return (
                  '<span class="pull-right">' +
                  _.escape(balance) +
                  ' on ' +
                  _.escape(date) +
                  '</span>'
                );
              }
            },
            template: [
              function (data, row) {
                var date = $filter('toShortDisplayDateUtc')(data);
                var balance = row['LastStatementBalance'];
                balance = $filter('currency')(balance, '$', 2);
                return (
                  '<span class="pull-right padding-left-10"><receivable-menu receivable="row"></receivable-menu></span>' +
                  '<span class="pull-right"><a ng-click="actions.navToLastStatement(\'' +
                  row['LastStatementId'] +
                  '\')">' +
                  _.escape(balance) +
                  ' on ' +
                  _.escape(date) +
                  '</a></span>'
                );
              },
            ],
            ifEmpty:
              '<span class="pull-right padding-left-10"><receivable-menu receivable="row"></receivable-menu></span>' +
              '<span class="pull-right">N/A</span>',
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
