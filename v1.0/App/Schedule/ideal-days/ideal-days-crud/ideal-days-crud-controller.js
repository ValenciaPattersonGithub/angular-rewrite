'use strict';

var app = angular.module('Soar.Schedule');
var idealDaysCrudController = app.controller('IdealDaysCrudController', [
  '$scope',
  '$timeout',
  'toastrFactory',
  'localize',
  'patSecurityService',
  '$location',
  'ListHelper',
  'ModalFactory',
  '$filter',
  'IdealDayTemplatesFactory',
  'ColorUtilities',
  function (
    $scope,
    $timeout,
    toastrFactory,
    localize,
    patSecurityService,
    $location,
    listHelper,
    modalFactory,
    $filter,
    idealDayTemplatesFactory,
    colorUtilities
  ) {
    var ctrl = this;
    $scope.formIsValid = true;
    $scope.saving = false;
    $scope.dataHasChanged = false;
    $scope.loading = false;
    $scope.actionText = localize.getLocalizedString('Create {0} ', [
      'Template',
    ]);
    $scope.actionTitle = localize.getLocalizedString('Create {0} ', [
      'an Ideal Day Template',
    ]);

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
      $scope.idealDaysTemplateDto = idealDayTemplatesFactory.IdealDayTemplateDto();
      $scope.defaultTimeIncrement =
        $scope.data.practiceSettings.DefaultTimeIncrement;
      $scope.ticksPerHour =
        60 / $scope.data.practiceSettings.DefaultTimeIncrement;
      $scope.appointmentTypes = $scope.data.appointmentTypes;
      $timeout(function () {
        $scope.idealDaysScheduler.view($scope.idealDaysScheduler.view().name); // updating the current view
      }, 100);

      if (
        $scope.data.selectedTemplateId !== null &&
        $scope.data.mode === 'edit'
      ) {
        ctrl.getExistingTemplate($scope.data.selectedTemplateId);
        $scope.actionText = localize.getLocalizedString('Save');
      }
      $scope.schedulerIdealDaysOptions = ctrl.createScheduleOptions();
    };

    //#region handle cancel

    // reset data
    $scope.resetData = function () {
      $scope.cancelChanges();
    };

    $scope.cancelChanges = function () {
      if ($scope.cancel) {
        $scope.dataHasChanged = false;
        $scope.cancel();
      }
    };

    // confirm cancel if changes
    $scope.cancelListChanges = function () {
      if ($scope.dataHasChanged === true) {
        modalFactory.CancelModal().then($scope.cancelChanges, function () {});
      } else {
        $scope.cancelChanges();
      }
    };

    //#endregion

    //#region validation

    ctrl.validateForm = function () {
      $scope.formIsValid = true;
      if (
        !$scope.idealDaysTemplateDto.Name ||
        !$scope.idealDaysTemplateDto.Name.length > 0
      ) {
        $scope.formIsValid = false;
      }
      if (
        $scope.idealDaysTemplateDto.Details &&
        $scope.idealDaysTemplateDto.Details.length === 0
      ) {
        $scope.formIsValid = false;
      }
      $scope.setFocusOnElement();
      return $scope.formIsValid;
    };

    // reset focus
    $scope.setFocusOnElement = function () {
      if ($scope.frmIdealDaysCrud.inpIdealDayTemplateName.$valid == false) {
        $timeout(function () {
          angular.element('#inpIdealDayTemplateName').focus();
        }, 0);
        return true;
      }
    };

    //#endregion

    $scope.$watch('idealDaysOccurrences', function (nv, ov) {});

    //#region draggable appointment type

    // used by k-hint to draw duplicate object to display while dragging
    $scope.draggableHint = function (e) {
      var clone = angular.element(e[0]).clone();
      clone.css({
        opacity: 0.75,
        width: '300px',
      });
      clone.attr({
        id: 'event-hint',
      });
      return clone;
    };

    // used by k-dragend to cleanup up hollow class
    $scope.onDragEnd = function (e) {
      var draggable = angular.element(e);
      draggable.removeClass('hollow');
    };

    // used by k-dragstart to add hollow class
    $scope.onDragStart = function (e) {
      $scope.currentAppointmentType = ctrl.getAppointmentType(
        e.initialTarget.id
      );
      $scope.$apply(function () {
        $scope.draggableClass = 'hollow';
      });
    };

    $scope.dropToSchedule = function (e) {
      if (!$scope.allowDrop) {
        return;
      }
      // get the appointment type and set dataItem for ev
      var apptType = ctrl.getAppointmentType(e.draggable.element[0].id);
      var dataItem = angular.copy(apptType);

      // can we drop here?

      var hint = angular.element('#event-hint');
      if (angular.isUndefined(hint[0])) {
        return;
      }

      // NOTE can't use e.ClientX for IE, doesn't have clientX or clientY
      //var slot = $scope.scheduler.slotByPosition(e.clientX, e.clientY);
      var slot = $scope.idealDaysScheduler.slotByPosition(
        e.target.offsetLeft + 10,
        e.target.offsetTop + 10
      );

      if (dataItem && slot) {
        var newEvent = {
          start: slot.startDate,
          end: ctrl.getEndDate(dataItem, slot),
          AppointmentTypeId: dataItem.AppointmentTypeId,
          Name: dataItem.Name,
        };
        $scope.dataHasChanged = true;
        $scope.formIsValid = true;
        // add event to datasource
        $scope.idealDaysScheduler.dataSource.add(newEvent);
      }
    };

    //#endregion

    //#region idealDayTemplate objects

    ctrl.getExistingTemplate = function (templateId) {
      if ($scope.authAccess.View) {
        idealDayTemplatesFactory.getById(templateId).then(function (res) {
          $scope.idealDaysTemplateDto = res.Value;
          ctrl.setupOccurrences();
          $scope.actionTitle = localize.getLocalizedString('Edit {0}', [
            $scope.idealDaysTemplateDto.Name,
          ]);
        });
      }
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
        $scope.idealDaysScheduler.setDataSource(dataSource);
        $scope.idealDaysScheduler.refresh();
      }, 100);
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

    // calculate end time using appointment type defaults
    ctrl.getEndDate = function (dataItem, slot) {
      var endDate = new Date(slot.startDate.getTime());
      endDate.setMinutes(endDate.getMinutes() + dataItem.DefaultDuration);
      return endDate;
    };

    $scope.occurrencesInRange = function (start, end, event) {
      // list of all occurrences
      var occurrences = $scope.idealDaysScheduler.occurrencesInRange(
        start,
        end,
        event
      );
      var ndx = occurrences.indexOf(event);
      if (ndx > -1) {
        occurrences.splice(ndx, 1);
      }
      //
      event = angular.extend({}, event);
      //
      return $scope.filterOccurences(occurrences);
    };

    $scope.filterOccurences = function (occurrences) {
      var result = [];
      var occurrence;

      for (var ndx = 0, length = occurrences.length; ndx < length; ndx++) {
        occurrence = occurrences[ndx];
        result.push(occurrence);
      }
      return result;
    };

    // does this slot already have an event
    $scope.occurrencesConflict = function (start, end, event) {
      var occurrences = $scope.occurrencesInRange(start, end, event);
      return occurrences.length > 0 ? true : false;
    };

    $scope.inDayRange = function (start, end, event) {
      var view = $scope.idealDaysScheduler.view();
      var endTime = view.endTime();
      if (end > endTime) {
        return false;
      }
      return true;
    };

    $scope.checkAvailability = function (start, end, event) {
      $scope.allowDrop = true;
      if ($scope.occurrencesConflict(start, end, event)) {
        $scope.allowDrop = false;
        return false;
      }
      if (!$scope.inDayRange(start, end, event)) {
        $scope.allowDrop = false;
        return false;
      }
      return true;
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

    // remove occurrence from schedule after confirm
    $scope.occurrenceToDelete = null;
    $scope.removeOccurrence = function (dataItem) {
      $scope.occurrenceToDelete = dataItem;
      modalFactory
        .DeleteModal('appointment type', $scope.occurrenceToDelete.Name)
        .then($scope.confirmDelete);
    };

    $scope.confirmDelete = function () {
      var occurrence = listHelper.findIndexByFieldValue(
        $scope.idealDaysOccurrences,
        'start',
        $scope.occurrenceToDelete.start
      );
      $scope.idealDaysOccurrences.splice(occurrence, 1);
      $scope.occurrenceToDelete = null;
    };

    $scope.checkPosition = function (e) {
      var element;

      // Fix for IE, doesn't have clientX or clientY
      var slot = $scope.idealDaysScheduler.slotByPosition(
        e.x.client,
        e.y.client
      );
      var isOkToDrop = false;

      if (slot) {
        slot.endDate.setTime(
          slot.startDate.getTime() +
            $scope.currentAppointmentType.DefaultDuration * 60000
        );
        slot.endDate.setMilliseconds(0);
        isOkToDrop = $scope.checkAvailability(
          slot.startDate,
          slot.endDate,
          slot
        );
      } else {
        element = angular.element('#event-hint');
        element.css(
          'background',
          $scope.currentAppointmentType.AppointmentTypeColor
        );
        //reset since it went outside the scheduler
        $scope.isNewDragger = true;
      }

      // need isNewDragger to determine draggerState
      if (
        isOkToDrop == true &&
        ($scope.draggerState == false || $scope.isNewDragger == true)
      ) {
        $scope.draggerState = true;
        $scope.isNewDragger = false;
        element = angular.element('#event-hint');
        element.css('background', 'green');
      } else if (
        isOkToDrop == false &&
        ($scope.draggerState == true || $scope.isNewDragger == true)
      ) {
        $scope.draggerState = false;
        $scope.isNewDragger = false;
        element = angular.element('#event-hint');
        element.css('background', 'red');
        e.preventDefault;
      }
    };
    //#endregion

    //#region crud methods

    ctrl.buildIdealDaysDetails = function () {
      var format = 'YYYY-MM-DD[T]HH:mm:ss[.00Z]'; // strange but true, sending local time with zero offset
      $scope.idealDaysTemplateDto.Details = [];
      angular.forEach($scope.idealDaysOccurrences, function (idealDaysEvent) {
        var idealDayDetailDto = idealDayTemplatesFactory.IdealDayDetailDto();
        idealDayDetailDto.StartTime = moment(idealDaysEvent.start).format(
          format
        );
        idealDayDetailDto.EndTime = moment(idealDaysEvent.end).format(format);
        idealDayDetailDto.AppointmentTypeId = idealDaysEvent.AppointmentTypeId;
        $scope.idealDaysTemplateDto.Details.push(idealDayDetailDto);
      });
    };

    $scope.saveIdealDayTemplate = function () {
      // build dto
      ctrl.buildIdealDaysDetails();

      // check auth
      if ($scope.authAccess.Create) {
        if (ctrl.validateForm()) {
          idealDayTemplatesFactory
            .save($scope.idealDaysTemplateDto)
            .then(function (res) {
              // update list
              $scope.idealDaysScheduler.destroy();
              $scope.cancel();
            });
        }
      }
    };

    //#endregion

    //#region scheduler

    // schedule configuration object
    ctrl.createScheduleOptions = function () {
      return {
        footer: false,
        autobind: false,
        date: new Date('2015/1/1'),
        startTime: new Date('2015/1/1 1:00 AM'),
        endTime: new Date('2015/1/1 1:00 PM'),
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
        workDayEnd: new Date('2015/1/1 1:00 PM'),
        editable: {
          destroy: false,
          update: false,
        },
        showWorkHours: true,
        dataBinding: function (e) {
          var view = this.view();
          view.timesHeader.hide();
          $('.k-scheduler-header-wrap > table > tbody > tr:eq(1)').hide();
          $('.k-nav-day').hide();
        },
        dataSource: $scope.idealDaysOccurrences,
        dataBound: function (e) {
          var view = this.view();
          var events = this.dataSource.view();

          // add an id to the scheduler rows for use in automation tests
          $('.k-scheduler-layout .k-scheduler-table td').each(function (
            key,
            element
          ) {
            var slot = e.sender.slotByElement(element);
            if (!_.isNil(slot)) {
              var slotElement = angular.element(slot.element);
              var slotStart = new Date(slot.startDate);
              slotElement.attr(
                'id',
                'slot_' + $filter('date')(slotStart, 'HHmm')
              );
            }
          });

          // style each event based on appointment type
          for (var i = 0, length = events.length; i < length; i++) {
            var event = events[i];
            $scope.setEventCss(view, event);
          }
        },
        add: function (e) {
          if (!$scope.checkAvailability(e.event.start, e.event.end, e.event)) {
            e.preventDefault();
          }
        },
        edit: function (e) {
          e.preventDefault();
        },
        resize: function (e) {
          if ($scope.occurrencesConflict(e.start, e.end, e.event)) {
            this.wrapper.find('.k-event-drag-hint').css('background', 'red');
          }
        },
        resizeEnd: function (e) {
          if (!$scope.checkAvailability(e.start, e.end, e.event)) {
            e.preventDefault();
          }
        },
        move: function (e) {
          if ($scope.occurrencesConflict(e.start, e.end, e.event)) {
            this.wrapper.find('.k-event-drag-hint').css('background', 'red');
          }
        },
        moveEnd: function (e) {
          if (!$scope.checkAvailability(e.start, e.end, e.event)) {
            e.preventDefault();
          }
        },
      };
    };

    $scope.$watch('idealDaysTemplateDto', function (nv, ov) {
      if (nv && nv != ov) {
        $scope.dataHasChanged = true;
      }
    });

    //#endregion

    ctrl.init();
  },
]);
