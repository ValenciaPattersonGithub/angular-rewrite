/* global providerHoursController, ScheduleControl, ScheduleControl, AppointmentControl, TreatmentRoomControl */

'use strict';

angular
  .module('Soar.Schedule', [
    'ngRoute',
    'ui.bootstrap',
    'ngAnimate',
    'ngResource',
    'ngSanitize',
    'common.directives',
    'ui.utils',
    'common.controllers',
    'common.factories',
    'common.filters',
    'common.services',
    'localytics.directives',
    'PatWebCore',
    'kendo.directives',
  ])
  .config([
    '$routeProvider',
    function ($routeProvider) {
      // Configure ng-view routing
      $routeProvider
        .when('/Schedule/ProviderHours/', {
          templateUrl: 'App/Schedule/provider-hours/provider-hours.html',
          controller: 'ProviderHoursController',
          data: {
            amf: 'soar-sch-swkstp-view',
          },
          resolve: providerHoursController.resolveProviderHoursControl,
          title: 'Provider Hours',
        })
        .when('/Schedule/Settings/', {
          templateUrl: 'App/Schedule/schedule-settings/schedule-settings.html',
          controller: 'ScheduleSettingsController',
          data: {
            amf: 'soar-sch-schset-modtim',
          },
        })
        .when('/Schedule/AppointmentTypes/', {
          templateUrl:
            'App/Schedule/appointment-types/appointment-types-landing/appointment-types-landing-w.html',
          controller: 'AppointmentTypesLandingWrapperController',
          title: 'Appointment Types',
          data: {
            amf: 'soar-sch-sapttp-view',
          },
        })
        .when('/Schedule/', {
          templateUrl: 'App/Schedule/scheduler/scheduler.html',
          controller: 'SchedulerController',
          resolve: ScheduleControl.resolveScheduleControl,
          reloadOnSearch: false,
          data: {
            amf: 'soar-sch-sch-view',
          },
        })
        .when('/Schedule/Locations/TreatmentRooms/', {
          templateUrl: 'App/Schedule/treatment-rooms/treatment-rooms.html',
          controller: 'TreatmentRoomsController',
          resolve: TreatmentRoomControl.resolveTreatmentRoomControl,
          data: {
            amf: 'soar-sch-stmtrm-view',
          },
        })
        .when('/Schedule/Holidays/', {
          templateUrl: 'App/Schedule/holidays/holidays.html',
          controller: 'HolidaysController',
          data: {
            amf: 'soar-sch-schhol-view',
          },
        })
        .when('/Schedule/SchedulerPrint/', {
          templateUrl: 'App/Schedule/scheduler-print/scheduler-print.html',
          controller: 'SchedulerPrintController',
          data: {
            amf: 'soar-sch-schhol-view',
          },
        })
        .when('/Schedule/Appointment/:id/', {
          templateUrl:
            'App/Schedule/appointments/appointment-view/appointment-view.html',
          controller: 'AppointmentViewController',
          resolve: AppointmentControl.resolveAppointmentControl,
          reloadOnSearch: false,
          data: {
            amf: 'soar-sch-sch-view',
          },
        })
        .when('/Schedule/Appointment/', {
          templateUrl:
            'App/Schedule/appointments/appointment-view/appointment-view.html',
          controller: 'AppointmentViewController',
          resolve: AppointmentControl.resolveAppointmentControl,
          reloadOnSearch: false,
          data: {
            amf: 'soar-sch-sch-view',
          },
        })
        .when('/Schedule/Block/', {
          templateUrl: 'App/Schedule/scheduler/scheduler.html',
          controller: 'SchedulerController',
          resolve: ScheduleControl.resolveScheduleControl,
          reloadOnSearch: false,
          data: {
            amf: 'soar-sch-sch-view',
          },
        })
        // Catch all redirects home
        .otherwise({
          redirectTo: '/',
        });
    },
  ]);
