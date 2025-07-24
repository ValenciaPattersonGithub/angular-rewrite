'use strict';

angular.module('Soar.Patient').factory('OtherToDoGridFactory', [
  '$resource',
  '$filter',
  'localize',
  'GridOptionsFactory',
  'TimeZoneFactory',
  function ($resource, $filter, localize, gridOptionsFactory, timeZoneFactory) {
    var options = gridOptionsFactory.createOptions();

    options.id = 'OtherToDoGrid';

    // Grid Definition
    options.query = $resource(
      '_soarapi_/patients/OtherToDoTab',
      {},
      { getData: { method: 'POST' } }
    );

    options.failAction = function (data) {
      var errorMessage = localize.getLocalizedString(
        'Failed to retrieve the list of {0}. Refresh the page to try again.',
        ['other to do']
      );
      console.log(errorMessage);
      //ctrl.ShowErrorMessage(errorMessage);
    };

    options.additionalFilters = [
      {
        field: 'LocationId',
        filter: null,
      },
      {
        field: 'IsActive',
        filter: [true],
      },
      {
        field: 'IsPatient',
        filter: [true],
      },
    ];

    options.columnDefinition = [
      {
        title: 'Name',
        field: 'PatientName',
        fieldId: 'PatientId',
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
              '<div ng-click="actions.navToPatientProfile(\'' +
              row['PatientId'] +
              '\')"><a ng-non-bindable class="wrapButtonText" >' +
              _.escape(data) +
              '</a><div>'
            );
          },
        ],
      },
      {
        title: 'Responsible Party',
        field: 'ResponsiblePartyName',
        filterable: true,
        sortable: true,
        size: '2',
        printable: true,
        printTemplate: function (data) {
          return data != null ? _.escape(data) : 'N/A';
        },
        template: [
          function (data, row) {
            return (
              '<div ng-click="actions.navToPatientProfile(\'' +
              row['ResponsiblePartyId'] +
              '\')"><a ng-non-bindable class="wrapButtonText" >' +
              _.escape(data) +
              '</a><div>'
            );
          },
        ],
        ifEmpty: 'N/A',
      },
      {
        title: 'Due Date',
        field: 'DueDate',
        fieldFrom: 'DueDateFrom',
        fieldTo: 'DueDateTo',
        type: 'date-range',
        filterable: true,
        sortable: true,
        size: '1',
        printable: true,
        template: [
          function (data) {
            return $filter('toShortDisplayDateUtc')(data);
          },
        ],
        ifEmpty: 'N/A',
      },
      {
        title: 'Status',
        field: 'IsComplete',
        fieldFrom: 'IsCompleteFrom',
        fieldTo: 'IsCompleteTo',
        filterable: true,
        sortable: true,
        size: '1',
        printable: true,
        template: [
          function (data) {
            return '<span>Incomplete</span>';
          },
        ],
        ifEmpty: '<span>Incomplete</span>',
      },
      {
        title: 'Last Appt',
        field: 'PreviousAppointmentDate',
        fieldFrom: 'PreviousAppointmentDateFrom',
        fieldTo: 'PreviousAppointmentDateTo',
        type: 'date-range',
        filterable: true,
        sortable: true,
        size: '2',
        printable: true,
        printTemplate: function (data, row) {
          if (data != null) {
            var type =
              row['PreviousAppointmentType'] != null
                ? row['PreviousAppointmentType']
                : 'N/A';
            return (
              type + '<br />' + $filter('toShortDisplayDateUtc')(_.escape(data))
            );
          } else {
            return 'N/A';
          }
        },
        template: [
          function (data, row, ifEmpty) {
            var type = row['PreviousAppointmentType'] || ifEmpty;
            var tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
              row['PreviousAppointmentTimezone'],
              data
            );
            var dateTZ = timeZoneFactory.ConvertDateTZ(
              data,
              row['PreviousAppointmentTimezone']
            );
            var date = $filter('toShortDisplayDateUtc')(dateTZ);
            var startTime = $filter('toDisplayTime')(
              timeZoneFactory.ConvertDateTZ(
                row['PreviousAppointmentStartTime'],
                row['PreviousAppointmentTimezone']
              )
            );
            var endTime = $filter('toDisplayTime')(
              timeZoneFactory.ConvertDateTZ(
                row['PreviousAppointmentEndTime'],
                row['PreviousAppointmentTimezone']
              )
            );
            var duration = row['PreviousAppointmentDuration'];
            var template =
              '<button ng-click="actions.navToAppointment(\'' +
              row['PreviousAppointmentId'] +
              "', '" +
              row['PatientAccountId'] +
              '\')" ';
            template += 'class="btn btn-link btn-link-left wrapButtonText" ';
            template += 'check-auth-z="soar-per-perdem-view" ';
            template +=
              'tooltip-append-to-body="true" uib-tooltip="' +
              startTime +
              ' - ' +
              endTime +
              ' ' +
              tzAbbr +
              ' (' +
              duration +
              'm)">';
            template += _.escape(type) + '<br />';
            template += date;
            template += '</button>';
            return template;
          },
        ],
        ifEmpty: 'N/A',
      },
      {
        title: 'Next Appt',
        field: 'NextAppointmentDate',
        fieldFrom: 'NextAppointmentDateFrom',
        fieldTo: 'NextAppointmentDateTo',
        type: 'date-range',
        filterable: true,
        sortable: true,
        size: '2',
        printable: true,
        printTemplate: function (data, row) {
          if (data != null) {
            var type =
              row['NextAppointmentType'] != null
                ? row['NextAppointmentType']
                : 'N/A';
            return (
              _.escape(type) + '<br />' + $filter('toShortDisplayDateUtc')(data)
            );
          } else {
            return 'N/A';
          }
        },
        template: [
          function (data, row, ifEmpty) {
            var type = row['NextAppointmentType'] || ifEmpty;
            var tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
              row['NextAppointmentTimezone'],
              data
            );
            var dateTZ = timeZoneFactory.ConvertDateTZ(
              data,
              row['NextAppointmentTimezone']
            );
            var date = $filter('toShortDisplayDateUtc')(dateTZ);
            var startTime = $filter('toDisplayTime')(
              timeZoneFactory.ConvertDateTZ(
                row['NextAppointmentStartTime'],
                row['NextAppointmentTimezone']
              )
            );
            var endTime = $filter('toDisplayTime')(
              timeZoneFactory.ConvertDateTZ(
                row['NextAppointmentEndTime'],
                row['NextAppointmentTimezone']
              )
            );
            var duration = row['NextAppointmentDuration'];
            var template =
              '<button ng-click="actions.navToAppointment(\'' +
              row['NextAppointmentId'] +
              "', '" +
              row['PatientAccountId'] +
              '\')" ';
            template += 'class="btn btn-link btn-link-left wrapButtonText" ';
            template += 'check-auth-z="soar-per-perdem-view" ';
            template +=
              'tooltip-append-to-body="true" uib-tooltip="' +
              startTime +
              ' - ' +
              endTime +
              ' ' +
              tzAbbr +
              ' (' +
              duration +
              'm)">';
            template += _.escape(type) + '<br />';
            template += date;
            template += '</button>';
            return template;
          },
        ],
        ifEmpty: 'N/A',
      },
      {
        title: 'Last Communication',
        field: 'LastCommunicationDate',
        fieldFrom: 'LastCommunicationFrom',
        fieldTo: 'LastCommunicationTo',
        type: 'date-range',
        filterable: true,
        sortable: true,
        size: '2',
        printable: true,
        printTemplate: function (data) {
          return data != null ? $filter('toShortDisplayDateUtc')(data) : 'N/A';
        },
        template: [
          function (data, row) {
            var date = $filter('toShortDisplayDateUtc')(data);
            return (
              '<button name="' +
              row['PatientId'] +
              '" ng-click="actions.openModal(\'' +
              row['PatientId'] +
              "', null, 5," +
              row['PatientCommunicationId'] +
              ')" class="btn btn-link" title="' +
              date +
              '">' +
              date +
              '</button>'
            );
          },
        ],
        ifEmpty: function (row) {
          return (
            '<button name="' +
            row['PatientId'] +
            '" ng-click="actions.openModal(\'' +
            row['PatientId'] +
            "', null, 5," +
            row['PatientCommunicationId'] +
            ')" class="btn btn-link" title="Create Communication">Create Communication</button>'
          );
        },
      },
    ];

    return options;
  },
]);
