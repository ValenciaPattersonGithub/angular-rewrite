'use strict';

angular.module('Soar.BusinessCenter').factory('DepositGridFactory', [
  '$resource',
  '$filter',
  'localize',
  'GridOptionsFactory',
  'TimeZoneFactory',
  function ($resource, $filter, localize, gridOptionsFactory, timeZoneFactory) {
    var GridOptions = function () {
      var options = gridOptionsFactory.createOptions();
      options.expandable = true;
      options.expandableRowIdFromColumn = 'DepositId';
      options.expandableRowSortColumn = 'PaymentType';
      options.expandableRowSortOrder = 0;
      options.id = 'DepositGrid';
      options.updateOnInit = false;
      options.rowTooltip = true;
      options.isEdited = false;
      options.isAddedPayments = false;
      options.expandableColumnDefinition = [];
      options.renderTooltip = function (row, index) {
        if (row['IsDeleted'] && index != 6) {
          var deletedDate = $filter('toShortDisplayDate')(
            row.LocationTimezone
              ? timeZoneFactory.ConvertDateTZString(
                  row['DeletedDate'],
                  row.LocationTimezone
                )
              : row['DeletedDate']
          );
          options.isEdited = false;
          return 'Deleted ' + deletedDate + ' By ' + row['UserModified'];
        }

        options.isEdited = false;
        return '';
      };
      options.renderToolTipDepositHistory = function (row, item) {
        var modifiedDate = $filter('toShortDisplayDate')(
          row.LocationTimezone
            ? timeZoneFactory.ConvertDateTZString(
                item.ModifiedDate,
                row.LocationTimezone
              )
            : item.ModifiedDate
        );
        var result = '';

        switch (item.Status) {
          case 0:
            result = 'Added on ' + modifiedDate + ' by ' + item.ModifiedUser;
            break;
          case 2:
            result = 'Modified on ' + modifiedDate + ' by ' + item.ModifiedUser;
            break;
        }

        return result;
      };
      options.renderToolTipDepositModified = function (row, item) {
        var modifiedDate = $filter('toShortDisplayDate')(
          row.LocationTimezone
            ? timeZoneFactory.ConvertDateTZString(
                row['LastModifiedDate'],
                row.LocationTimezone
              )
            : row['LastModifiedDate']
        );
        return (
          'Last Modified on ' + modifiedDate + ' by ' + row['UserModified']
        );
      };

      options.renderToolTipDeletedPayments = function (row, item, index) {
        var deletedDate = null;
        var modifiedUser = null;

        if (item['DepositDate'] != undefined || index == 6) {
          return '';
        } else if (row.IsDeleted && item.Status != 1) {
          deletedDate = $filter('toShortDisplayDate')(
            row.LocationTimezone
              ? timeZoneFactory.ConvertDateTZString(
                  row['DateModified'],
                  row.LocationTimezone
                )
              : row['DateModified']
          );
          modifiedUser = row['UserModified'];
          return 'Removed on ' + deletedDate + ' by ' + modifiedUser;
        } else if (item.Status != undefined && item.Status == 1) {
          deletedDate = $filter('toShortDisplayDate')(
            row.LocationTimezone
              ? timeZoneFactory.ConvertDateTZString(
                  item.DeletedDate,
                  row.LocationTimezone
                )
              : item.DeletedDate
          );
          modifiedUser = item.ModifiedUser;
          return 'Removed on ' + deletedDate + ' by ' + modifiedUser;
        }
      };

      options.renderToolTipPaymentHistory = function (row, item) {
        var addedDate = $filter('toShortDisplayDate')(
          row.LocationTimezone
            ? timeZoneFactory.ConvertDateTZString(
                item.DateAdded,
                row.LocationTimezone
              )
            : item.DateAdded
        );
        return 'Added on ' + addedDate + ' by ' + item.ModifiedUser;
      };

      options.query = $resource(
        '_soarapi_/deposit/depositgrid',
        {},
        { getData: { method: 'POST' } }
      );
      options.failAction = function (data) {
        var errorMessage = localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again.',
          ['deposits']
        );
        console.log(errorMessage);
      };
      options.rowStyle = function (data) {
        if (data.IsDeleted != undefined && data.IsDeleted === true) {
          return 'deletedRow rowWordWrap';
        }

        return 'rowWordWrap';
      };

      options.subGridRowStyle = function (item) {
        if (item.Status != undefined && item.Status == 1) {
          return 'deletedRow rowWordWrap';
        }
        return 'rowWordWrap';
      };

      options.additionalFilters = [
        {
          field: 'Location',
          filter: null,
        },
      ];

      options.columnDefinition = [
        {
          title: 'Date',
          field: 'DepositDate',
          fieldFrom: 'DepositDateFrom',
          fieldTo: 'DepositDateTo',
          filterable: true,
          sortable: true,
          type: 'date-range',
          size: '2',
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
              return (
                '<a id="' +
                row['DepositId'] +
                '" ng-click="actions.toggleIcon($event, row)"><i class="indicator soar-link font-weight-bold padding-left-5 padding-right-10 glyphicon glyphicon-chevron-right"></i></a>' +
                ' ' +
                date
              );
            },
          ],
        },
        {
          title: 'Bank',
          field: 'BankAccount',
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
          title: 'Account Number',
          field: 'BankAccountNumber',
          filterable: true,
          sortable: true,
          disabled: false,
          template: [
            function (data, row) {
              if (data === '***************')
                return (
                  '<span title="This information is restricted">' +
                  data +
                  '</span>'
                );
              else return '<span>' + data + '</span>';
            },
          ],
          size: '1',
        },
        {
          title: 'Routing Number',
          field: 'RoutingNumber',
          filterable: true,
          sortable: true,
          tooltipmsg: '',
          template: [
            function (data, row) {
              if (data === '*********')
                return (
                  '<span title="This information is restricted">' +
                  data +
                  '</span>'
                );
              else return '<span>' + data + '</span>';
            },
          ],
          size: '2',
        },
        {
          title: 'Deposited By',
          field: 'DepositedBy',
          filterable: true,
          sortable: true,
          size: '2',
        },
        {
          title: 'Total',
          field: 'Total',
          fieldFrom: 'TotalFrom',
          fieldTo: 'TotalTo',
          filterable: true,
          sortable: true,
          type: 'number-range',
          size: '2',
          template: [
            function (data, row) {
              var item = $filter('currency')(data, '$', 2);
              if (!row.IsDeleted) {
                return (
                  '<span class="pull-right padding-left-10"><deposit-menu deposit="row"></deposit-menu></span>' +
                  '<span class="pull-right">' +
                  item +
                  '</span>'
                );
              } else {
                return (
                  '<span class="pull-right padding-right-30">' +
                  item +
                  '</span>'
                );
              }
            },
          ],
        },
        {
          title: '',
          field: 'IsEdited',
          size: '1',
          template: [
            function (row, item) {
              //If edited show the tool tip
              if (item.IsEdited) {
                return '<i class="fa fa-exclamation-circle exclamationIcon" tooltip-append-to-body="true" tooltip-placement="top" uib-tooltip-html="options.renderToolTipDepositModified(row, item)"></i>';
              }
              return '';
            },
          ],
        },
      ];
      // child grid
      options.expandableColumnDefinition = [
        {
          //first sub grid column
          expandableRowColumn: 'DepositHistory',
          ifEmpty: 'Deposit History',
          field: 'DepositHistory',
          expanded: false,
          collapsible: true,
          template: [
            function (data, row) {
              return (
                '<a data-toggle="collapse" ng-click="actions.toggleIconDepositHistory($event)" data-target="#column' +
                data +
                row.DepositId +
                ',#row' +
                data +
                row.DepositId +
                '" data-parent="#accordion" ><i class="indicator soar-link font-weight-bold padding-left-5 padding-right-10 glyphicon glyphicon-chevron-right"></i></a> Deposit History'
              );
            },
          ],
          columnDefinition: [
            {
              title: 'Date',
              field: 'DepositDate',
              size: '2',
              sortable: false,
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
              title: 'Bank Name',
              field: 'BankName',
              size: '2',
              sortable: false,
              template: [
                function (data) {
                  return _.escape(data);
                },
              ],
            },
            {
              title: 'Account Number',
              field: 'AccountNumber',
              size: '2',
              sortable: false,
              template: [
                function (data) {
                  return data;
                },
              ],
            },
            {
              title: 'Routing Number',
              field: 'RoutingNumber',
              size: '2',
              sortable: false,
              template: [
                function (data, row) {
                  return (
                    '<span class="pull-left padding-left-30">' +
                    data +
                    '</span>'
                  );
                },
              ],
            },
            {
              title: '',
              field: 'ModifiedDate',
              size: '1',
              sortable: false,
              template: [
                function (data, row) {
                  return '<i class="fa fa-exclamation-circle exclamationIcon" tooltip-placement="top" tooltip-append-to-body="true" uib-tooltip-html="options.renderToolTipDepositHistory(row, item)"></i>';
                },
              ],
            },
          ],
        },
        //second sub grid column
        {
          ifEmpty: 'Payments',
          field: 'Payments',
          expandableRowColumn: 'CreditTransactions',
          collapsible: true,
          expanded: true,
          template: [
            function (data, row) {
              return (
                '<a data-toggle="collapse" ng-click="actions.toggleIconDepositHistory($event)" data-target="#column' +
                data +
                row.DepositId +
                ',#row' +
                data +
                row.DepositId +
                '" data-parent="#accordion" ><i class="indicator soar-link font-weight-bold padding-left-5 padding-right-10 glyphicon glyphicon-chevron-down"></i></a> Payments'
              );
            },
          ],
          columnDefinition: [
            {
              title: 'Payee',
              field: 'PatientName',
              size: '2',
              sortable: true,
              template: [
                function (data) {
                  return _.escape(data);
                },
              ],
            },
            {
              title: 'Payment Date',
              field: 'PaymentDate',
              size: '2',
              sortable: true,
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
              field: 'TransactionType',
              size: '2',
              sortable: true,
              template: [
                function (data) {
                  return data;
                },
              ],
            },
            {
              title: 'Payment Type',
              field: 'PaymentType',
              size: '1',
              sortable: true,
              template: [
                function (data) {
                  return _.escape(data);
                },
              ],
            },
            {
              title: 'Additional Info',
              field: 'Note',
              size: '2',
              sortable: true,
              template: [
                function (data) {
                  return _.escape(data);
                },
              ],
            },
            {
              title: 'Amount',
              titleClass: 'pull-right',
              field: 'Amount',
              size: '2',
              sortable: true,
              template: [
                function (data) {
                  var item = $filter('currency')(data, '$', 2);
                  return '<span class="pull-right">' + item + '</span>';
                },
              ],
            },
            {
              title: '',
              field: 'Status',
              size: '1',
              sortable: true,
              template: [
                function (data, row) {
                  if (data == 3 || (data == 1 && row.DateAdded != null)) {
                    return '<i class="fa fa-exclamation-circle exclamationIcon" tooltip-placement="top" tooltip-append-to-body="true" uib-tooltip-html="options.renderToolTipPaymentHistory(row, item)"></i>';
                  }
                  return '';
                },
              ],
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
