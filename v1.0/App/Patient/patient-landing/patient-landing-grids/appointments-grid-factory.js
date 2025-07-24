'use strict';

angular.module('Soar.Patient').factory('AppointmentsGridFactory', [
  '$resource',
  '$filter',
  'localize',
  'GridOptionsFactory',
  'TimeZoneFactory',
  function ($resource, $filter, localize, gridOptionsFactory, timeZoneFactory) {
    var options = gridOptionsFactory.createOptions();

    options.id = 'AppointmentsGrid';

    // Grid Definition
    options.query = $resource(
      '_sapischeduleapi_/patients/AppointmentTab',
      {},
      { getData: { method: 'POST' } }
    );

    options.failAction = function (data) {
      var errorMessage = localize.getLocalizedString(
        'Failed to retrieve the list of {0}. Refresh the page to try again.',
        ['appointments for the account']
      );
      console.log(errorMessage);
      //ctrl.ShowErrorMessage(errorMessage);
    };

    options.additionalFilters = [
      {
        field: 'LocationId',
        filter: null,
      },
    ];

    options.rowStyle = function (data) {
      if (data.IsDeletedFromPatientFile === true) {
        return 'disabledRow';
      }
      if (data['IsActive'] === false && data['Classification'] !== 1) {
        return 'inactivePatient';
      }
      if (data['Classification'] === 1) {
        return 'inactivePatient blockAppointment';
      }
      return '';
    };
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
            if (row['IsActive'] == false) {
              var tiptitle = 'Patient';
              if (row['IsPatient'] == false) var tiptitle = 'Non-Patient';
              return (
                '<span class="fa fa-user" title="Inactive ' +
                _.escape(tiptitle) +
                '">&nbsp;</span><a class="wrapButtonText" ng-click="actions.navToPatientProfile(\'' +
                row['PatientId'] +
                '\')">' +
                _.escape(data) +
                '</a>'
              );
            }
            return (
              '<div ng-click="actions.navToPatientProfile(\'' +
              row['PatientId'] +
              '\')"><a ng-non-bindable class="wrapButtonText" >' +
              _.escape(data) +
              '</a></div>'
            );
          },
        ],
      },
      {
        title: 'Date of Birth',
        field: 'PatientDateOfBirth',
        fieldFrom: 'PatientDateOfBirthFrom',
        fieldTo: 'PatientDateOfBirthTo',
        type: 'date-range',
        filterable: true,
        sortable: true,
        size: '1',
        printable: true,
        template: [
          function (data) {
            return (
              $filter('toShortDisplayDateUtc')(data) +
              '<br />' +
              '(Age: ' +
              $filter('age')(data) +
              ')'
            );
          },
        ],
        ifEmpty: 'N/A',
      },
      {
        title: 'Responsible Party',
        field: 'ResponsiblePartyName',
        filterable: true,
        sortable: true,
        size: '1',
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
              '</a></div>'
            );
          },
        ],
      },
      {
        title: 'Last Appt',
        field: 'PreviousAppointmentDate',
        fieldFrom: 'PreviousAppointmentDateFrom',
        fieldTo: 'PreviousAppointmentDateTo',
        type: 'date-range',
        filterable: true,
        sortable: true,
        size: '1',
        printable: true,
        printTemplate: function (data, row) {
          if (data != null) {
            var type =
              row['PreviousAppointmentType'] != null
                ? row['PreviousAppointmentType']
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
            var tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
              row['PreviousAppointmentTimezone'],
              data
            );
            var dateTZ = timeZoneFactory.ConvertDateTZ(
              data,
              row['PreviousAppointmentTimezone']
            );
            var type = row['PreviousAppointmentType'] || ifEmpty;
            var date = $filter('toShortDisplayDate')(dateTZ);
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
              "', '" +
              row['Classification'] +
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
        title: 'Appt Date',
        field: 'AppointmentDate',
        fieldFrom: 'AppointmentDateFrom',
        fieldTo: 'AppointmentDateTo',
        type: 'date-range',
        filterable: true,
        sortable: true,
        size: '1',
        printable: true,
        printTemplate: function (data, row) {
          if (data != null) {
            var type =
              row['AppointmentType'] != null ? row['AppointmentType'] : 'N/A';
            return (
              _.escape(type) + '<br />' + $filter('toShortDisplayDateUtc')(data)
            );
          } else {
            return 'N/A';
          }
        },
        template: [
          function (data, row) {
            var tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
              row['AppointmentTimezone'],
              data
            );
            var dateTZ = timeZoneFactory.ConvertDateTZ(
              data,
              row['AppointmentTimezone']
            );
            var type = row['AppointmentType'] || 'N/A';
            var date = $filter('toShortDisplayDate')(dateTZ);
            var startTime = $filter('toDisplayTime')(
              timeZoneFactory.ConvertDateTZ(
                row['AppointmentStartTime'],
                row['AppointmentTimezone']
              )
            );
            var endTime = $filter('toDisplayTime')(
              timeZoneFactory.ConvertDateTZ(
                row['AppointmentEndTime'],
                row['AppointmentTimezone']
              )
            );
            var duration = row['AppointmentDuration'];
            var template =
              '<button ng-click="actions.navToAppointment(\'' +
              row['AppointmentId'] +
              "', '" +
              row['PatientAccountId'] +
              "', '" +
              row['Classification'] +
              '\')" ';
            if (
              row['AppointmentStatus'] == 'Missed' ||
              row['AppointmentStatus'] == 'Cancelled'
            ) {
              template = '<div ';
            } else {
              template += 'class="btn btn-link btn-link-left wrapButtonText" ';
              template += 'check-auth-z="soar-per-perdem-view" ';
            }
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
            if (
              row['AppointmentStatus'] == 'Missed' ||
              row['AppointmentStatus'] == 'Cancelled'
            ) {
              template += '</div>';
            } else template += '</button>';
            return template;
          },
        ],
        ifEmpty: function (row) {
          var template =
            '<button ng-click="actions.navToAppointment(\'' +
            row['AppointmentId'] +
            "', '" +
            row['PatientAccountId'] +
            "', '" +
            row['Classification'] +
            '\')" ';
          template += 'class="btn btn-link btn-link-left wrapButtonText" ';
          template += 'check-auth-z="soar-per-perdem-view" >';
          template +=
            row['AppointmentType'] != null ? row['AppointmentType'] : 'N/A';
          template += '<br />' + 'N/A';
          template += '</button>';
          return template;
        },
      },
      {
        title: 'Preventive Care Due Date',
        field: 'PreventiveCareDueDate',
        fieldFrom: 'PreventiveCareDueDateFrom',
        fieldTo: 'PreventiveCareDueDateTo',
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
        field: 'AppointmentStatus',
        type: 'dropdown',
        dropDown: 'AppointmentStatusOptions',
        filterable: true,
        sortable: true,
        size: '1',
        printable: true,
        printTemplate: function (data) {
          return data;
        },
      },
      {
        title: 'Last Communication',
        field: 'LastCommunicationDate',
        fieldFrom: 'LastCommunicationFrom',
        fieldTo: 'LastCommunicationTo',
        type: 'date-range',
        filterable: true,
        sortable: true,
        size: '3',
        printable: true,
        printTemplate: function (data) {
          return data != null ? $filter('toShortDisplayDateUtc')(data) : 'N/A';
        },
        template: [
          function (data, row) {
            var date = $filter('toShortDisplayDateUtc')(data);
            var enableLink = '\')" class="btn btn-link enableLink" title="';
            if (row['IsActive'] == false) {
              enableLink = '\',4,true)" class="btn btn-link" title="';
            }
            return (
              '<button name="' +
              row['PatientId'] +
              '" ng-click="actions.openModal(\'' +
              row['PatientId'] +
              "', '" +
              row['AppointmentId'] +
              enableLink +
              date +
              '">' +
              date +
              '</button>'
            );
          },
        ],
        ifEmpty: function (row) {
          var commLink =
            '\',4,false)" class="btn btn-link enableLink" title="Create Communication">Create Communication</button>';
          if (row['IsActive'] === false) {
            commLink =
              '\',4,false)" class="btn btn-link" title="Create Communication">Create Communication</button>';
          }
          if (row['Classification'] === 1) {
            return 'N/A';
          }

          return (
            '<button name="' +
            row['PatientId'] +
            '" ng-click="actions.openModal(\'' +
            row['PatientId'] +
            "', '" +
            row['AppointmentId'] +
            commLink
          );
        },
      },
      {
        title: 'Schedule',
        size: '1',
        ifEmpty: function (row) {
          if (row['Classification'] === 1) {
            return 'N/A';
          }
          return (
            '<button class="btn btn-link ng-binding ng-scope" ng-click="actions.createAppointment(\'' +
            row['PatientId'] +
            '\')"><span id="schedule-setup-icon" class="practiceSetup__icon far fa-calendar-alt" ng-class="iconClass"></span></button>'
          );
        },
      },
    ];

    return options;
  },
]);
