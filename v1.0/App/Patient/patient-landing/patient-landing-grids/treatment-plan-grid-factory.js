'use strict';

angular.module('Soar.Patient').factory('TreatmentPlanGridFactory', [
  '$resource',
  '$filter',
  'localize',
  'GridOptionsFactory',
  'TimeZoneFactory',
  function ($resource, $filter, localize, gridOptionsFactory, timeZoneFactory) {
    var options = gridOptionsFactory.createOptions();

    options.id = 'TreatmentGrid';

    // Grid Definition
    options.query = $resource(
      '_soarapi_/patients/TreatmentPlans',
      {},
      { getData: { method: 'POST' } }
    );

    options.failAction = function (data) {
      var errorMessage = localize.getLocalizedString(
        'Failed to retrieve the list of {0}. Refresh the page to try again.',
        ['treatment plans']
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

    options.rowStyle = function (row) {
      if (row['IsActive'] == false) {
        return 'inactivePatient';
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
                tiptitle +
                '">&nbsp;</span><a class="wrapButtonText" ng-click="actions.navToPatientProfile(\'' +
                _.escape(row['PatientId']) +
                '\')">' +
                _.escape(data) +
                '</a>'
              );
            }
            return (
              '<div ng-click="actions.navToPatientProfile(\'' +
              _.escape(row['PatientId']) +
              '\')"><a ng-non-bindable class="wrapButtonText" >' +
              _.escape(data) +
              '</a><div>'
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
              _.escape(row['ResponsiblePartyId']) +
              '\')"><a ng-non-bindable class="wrapButtonText" >' +
              _.escape(data) +
              '</a><div>'
            );
          },
        ],
        ifEmpty: 'N/A',
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
                row['AppointmentStartTime'],
                row['PreviousAppointmentTimezone']
              )
            );
            var endTime = $filter('toDisplayTime')(
              timeZoneFactory.ConvertDateTZ(
                row['AppointmentEndTime'],
                row['PreviousAppointmentTimezone']
              )
            );
            var duration = row['AppointmentDuration'];
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
              _.escape(startTime) +
              ' - ' +
              _.escape(endTime) +
              ' ' +
              _.escape(tzAbbr) +
              ' (' +
              _.escape(duration) +
              'm)">';
            template += _.escape(type) + '<br />';
            template += _.escape(date);
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
        size: '1',
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
            var tzAbbr = timeZoneFactory.GetTimeZoneAbbr(
              row['NextAppointmentTimezone'],
              data
            );
            var dateTZ = timeZoneFactory.ConvertDateTZ(
              data,
              row['NextAppointmentTimezone']
            );
            var type = row['NextAppointmentType'] || ifEmpty;
            var date = $filter('toShortDisplayDate')(dateTZ);
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
              _.escape(row['NextAppointmentId']) +
              "', '" +
              _.escape(row['PatientAccountId']) +
              '\')" ';
            template += 'class="btn btn-link btn-link-left wrapButtonText" ';
            template += 'check-auth-z="soar-per-perdem-view" ';
            template +=
              'tooltip-append-to-body="true" uib-tooltip="' +
              _.escape(startTime) +
              ' - ' +
              _.escape(endTime) +
              ' ' +
              _.escape(tzAbbr) +
              ' (' +
              _.escape(duration) +
              'm)">';
            template += _.escape(type) + '<br />';
            template += _.escape(date);
            template += '</button>';
            return template;
          },
        ],
        ifEmpty: 'N/A',
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
        title: 'Treatment Plans',
        field: 'TreatmentPlanTotalBalance',
        fieldFrom: 'TreatmentPlanCountTotalFrom',
        fieldTo: 'TreatmentPlanCountTotalTo',
        type: 'number-range',
        filterable: true,
        sortable: true,
        size: '1',
        printable: true,
        printTemplate: function (data, row) {
          return $filter('currency')(data, '$', 2);
        },
        template: [
          function (data, row) {
            var item = $filter('currency')(
              row['TreatmentPlanTotalBalance'],
              '$',
              2
            );
            return (
              "<div class='pull-right' ng-mouseover=\"actions.displayTxPlans($event, '" +
              _.escape(row['PatientId']) +
              "','" +
              _.escape(row['TreatmentPlanId']) +
              '\')" ng-mouseleave="actions.hideTxPlans()"> ' +
              _.escape(item) +
              '</div>'
            );
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
        size: '3',
        printable: true,
        printTemplate: function (data) {
          return data != null ? $filter('toShortDisplayDateUtc')(data) : 'N/A';
        },
        template: [
          function (data, row) {
            var date = $filter('toShortDisplayDateUtc')(data);
            return (
              '<button name="' +
              _.escape(row['PatientId']) +
              '" ng-click="actions.openModal(\'' +
              _.escape(row['PatientId']) +
              "', null, 3,true" +
              ')" class="btn btn-link enableRow" title="' +
              _.escape(date) +
              '">' +
              _.escape(date) +
              '</button>'
            );
          },
        ],
        ifEmpty: function (row) {
          return (
            '<button name="' +
            _.escape(row['PatientId']) +
            '" ng-click="actions.openModal(\'' +
            _.escape(row['PatientId']) +
            "', null, 3,false" +
            ')" class="btn btn-link enableRow" title="Create Communication">Create Communication</button>'
          );
        },
      },
      {
        title: 'Schedule',
        size: '1',
        ifEmpty: function (row) {
          return (
            '<button class="btn btn-link ng-binding ng-scope" ng-click="actions.createAppointment(\'' +
            _.escape(row['PatientId']) +
            '\')"><span id="schedule-setup-icon" class="practiceSetup__icon far fa-calendar-alt" ng-class="iconClass" title="Create new appointment"></span></button>'
          );
        },
      },
    ];
    return options;
  },
]);
