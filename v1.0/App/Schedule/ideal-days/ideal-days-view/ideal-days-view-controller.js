'use strict';

var app = angular.module('Soar.Schedule');
var idealDaysViewController = app.controller('IdealDaysViewController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'localize',
  'patSecurityService',
  '$location',
  'ModalFactory',
  '$filter',
  'IdealDayTemplatesFactory',
  'ColorUtilities',
  'idealDaysTemplate',
  'practiceSettings',
  'appointmentTypes',
  '$uibModalInstance',
  function (
    $scope,
    $timeout,
    toastrFactory,
    localize,
    patSecurityService,
    $location,
    modalFactory,
    $filter,
    idealDayTemplatesFactory,
    colorUtilities,
    idealDaysTemplate,
    practiceSettings,
    appointmentTypes,
    $uibModalInstance
  ) {
    var ctrl = this;
    $scope.loading = false;
    ctrl.endTimeString = '2015/1/1 11:00 PM';

    //#region authentication

    $scope.authAccess = idealDayTemplatesFactory.access();
    if (!$scope.authAccess.View) {
      toastrFactory.error(
        patSecurityService.generateMessage('soar-clin-cplan-icview'),
        'Not Authorized'
      );
      event.preventDefault();
      $location.path('/');
    }

    //#endregion

    ctrl.init = function () {
      $scope.idealDaysOccurrences = [];
      $scope.idealDaysOccurrences = new kendo.data.ObservableArray([]);
      // get default template
      $scope.idealDaysTemplateDto = idealDaysTemplate;
      // setup default increment and endtime
      $scope.defaultTimeIncrement = practiceSettings.DefaultTimeIncrement;
      $scope.ticksPerHour = 60 / practiceSettings.DefaultTimeIncrement;
      ctrl.setEndTime();
      $scope.appointmentTypes = appointmentTypes;
      $timeout(function () {
        $scope.viewIdealDaysScheduler.view(
          $scope.viewIdealDaysScheduler.view().name
        ); // updating the current view
      }, 100);
      $scope.schedulerViewIdealDaysOptions = ctrl.createScheduleOptions();
      ctrl.setupOccurrences();
    };

    //#region handle close

    $scope.closeModal = function () {
      $uibModalInstance.close();
    };

    //#endregion

    //#region idealDayTemplate objects

    // calculate Endtime
    ctrl.setEndTime = function () {
      var maxDateTime = Math.max.apply(
        Math,
        $scope.idealDaysTemplateDto.Details.map(function (o) {
          return new Date(o.EndTime);
        })
      );
      var max = moment(maxDateTime).add(30, 'minutes');
      ctrl.endTimeString =
        moment('2015-01-01').format('MM/DD/YYYY') +
        ' ' +
        moment(new Date(max)).format('HH:mm');
    };

    // transforming the objects for display on the schedule and setting the data source
    ctrl.setupOccurrences = function () {
      $timeout(function () {
        angular.forEach($scope.idealDaysTemplateDto.Details, function (detail) {
          // get the appointment type and set dataItem for event
          // convert dates to today since all we really care about is the time element
          var startDate =
            moment('2015-01-01').format('MM/DD/YYYY') +
            ' ' +
            moment(detail.StartTime).format('HH:mm');
          var endDate =
            moment('2015-01-01').format('MM/DD/YYYY') +
            ' ' +
            moment(detail.EndTime).format('HH:mm');

          var apptType = ctrl.getAppointmentType(detail.AppointmentTypeId);
          var newEvent = {
            start: new Date(startDate),
            end: new Date(endDate),
            AppointmentTypeId: detail.AppointmentTypeId,
            Name: apptType.Name,
          };
          $scope.dataHasChanged = false;
          $scope.formIsValid = true;
          // add event to datasource
          $scope.idealDaysOccurrences.push(
            new kendo.data.SchedulerEvent(newEvent)
          );
        });
        var dataSource = new kendo.data.SchedulerDataSource({
          data: $scope.idealDaysOccurrences,
        });
        $scope.viewIdealDaysScheduler.setDataSource(dataSource);
        $scope.viewIdealDaysScheduler.refresh();
      }, 100);
      $scope.loading = false;
    };

    //#endregiion

    //#region schedule supporting methods
    // reference http://demos.telerik.com/kendo-ui/scheduler/restriction

    // get AppointmentType object based on id
    ctrl.getAppointmentType = function (apptTypeId) {
      var apptType = $filter('filter')(
        $scope.appointmentTypes,
        { AppointmentTypeId: apptTypeId },
        true
      )[0];
      return apptType;
    };

    // set the css for an individual event
    $scope.setEventCss = function (view, event) {
      //get event element
      var eventElement = view.element.find('[data-uid=' + event.uid + ']');

      // event has an element to style
      if (eventElement[0]) {
        eventElement.css({
          'border-radius': '0',
          'border-color': 'transparent',
          left: eventElement[0].offsetLeft + 10,
          background: 'rgba(200, 200, 200, 0.75)',
          color: 'rgb(0, 0, 0)',
        });

        if (
          event.AppointmentTypeId &&
          event.AppointmentTypeId != $scope.emptyGuid
        ) {
          var apptType = ctrl.getAppointmentType(event.AppointmentTypeId);
          var rgb = colorUtilities.hexToRgb(apptType.AppointmentTypeColor);
          eventElement.css({
            background:
              'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.5)',
            color: apptType.FontColor,
          });
        }
      }
    };

    //#region scheduler

    // schedule configuration object
    ctrl.createScheduleOptions = function () {
      return {
        footer: false,
        autobind: false,
        date: new Date('2015/1/1'),
        startTime: new Date('2015/1/1 1:00 AM'),
        endTime: new Date(ctrl.endTimeString),
        dateHeaderTemplate: kendo.template('<strong></strong>'),
        majorTimeHeaderTemplate: kendo.template(
          "<strong>#=kendo.toString(date, 'h')#</strong>"
        ),
        timezone: 'Etc/UTC',
        views: ['day'],
        minorTickCount: $scope.ticksPerHour,
        currentTimeMarker: false,
        allDaySlot: false,
        snap: true,
        //height: 500,
        workDayStart: new Date('2015/1/1 1:00 AM'),
        workDayEnd: new Date(ctrl.endTimeString),
        editable: false,
        showWorkHours: true,
        dataBinding: function (e) {
          var view = this.view();
          view.timesHeader.hide();
          $('.k-scheduler-header-wrap > table > tbody > tr:eq(1)').hide();
          $('.k-nav-day').hide();
        },
        dataSource: $scope.idealDaysOccurrences,
        dataBound: function () {
          var view = this.view();
          var events = this.dataSource.view();

          // style each event based on appointment type
          for (var i = 0, length = events.length; i < length; i++) {
            var event = events[i];
            $scope.setEventCss(view, event);
          }
        },
      };
    };

    //#endregion

    ctrl.init();
  },
]);
