var providerHoursController = angular
  .module('Soar.Schedule')
  .controller('ProviderHoursController', [
    '$scope',
    '$routeParams',
    '$location',
    'locations',
    'rooms',
    'locationService',
    'ScheduleServices',
    'ListHelper',
    '$timeout',
    'practiceSettings',
    'localize',
    'TimeZoneFactory',
    'toastrFactory',
    'providers',
    '$filter',
    'PatSharedServices',
    'patSecurityService',
    'ModalFactory',
    'providerRoomOccurences',
    'providerTypes',
    'IdealDayTemplatesFactory',
    '$q',
    'ProviderShowOnScheduleFactory',
    'referenceDataService',
    'PracticesApiService',
    function (
      $scope,
      $routeParams,
      $location,
      locations,
      rooms,
      locationService,
      scheduleServices,
      listHelper,
      $timeout,
      practiceSettings,
      localize,
      timeZoneFactory,
      toastrFactory,
      providers,
      $filter,
      patSharedServices,
      patSecurityService,
      modalFactory,
      providerRoomOccurences,
      providerTypes,
      idealDayTemplatesFactory,
      $q,
      providerShowOnScheduleFactory,
      referenceDataService,
      practicesApiService
    ) {
      rooms.data.forEach(room => {
        room.Name = _.escape(room.Name);
      });
      var ctrl = this;

      // everything that needs instantiated or called on load happens here
      ctrl.$onInit = function () {
        $scope.source = $routeParams.source;
        $scope.openIdealDays = $routeParams.toIdealDays
          ? $routeParams.toIdealDays
          : false;
        ctrl.today = moment().startOf('day');
        ctrl.maxDate = new Date(
          moment().add(3, 'years').subtract(1, 'days').endOf('day').valueOf()
        );
        ctrl.locations = locations ? locations : [];
        ctrl.setCurrentLocation();
        ctrl.rooms = rooms && rooms.data ? rooms.data : [];
        //ctrl.rooms = rooms && rooms.Value ? rooms.Value : [];
        ctrl.addPropertiesToRooms();
        ctrl.minorTickCount = practiceSettings
          ? 60 / practiceSettings.DefaultTimeIncrement
          : 4;
        ctrl.minMillDiffToAllowLunch =
          practiceSettings.DefaultTimeIncrement * 2 * 60000;
        $scope.schedulerOptions = ctrl.createSchedulerOptions();
        $scope.tooltipOptions = ctrl.createTooltipOptions();
        ctrl.scrollToStartTime();
        ctrl.showNoRoomsMessage();
        ctrl.updateTimezoneDisplay();
        // providers
        $scope.providers = [];
        ctrl.providerTypes =
          providerTypes && providerTypes.Value ? providerTypes.Value : [];
        ctrl.prepProvidersList();
        // occurences
        ctrl.providerRoomOccurences =
          providerRoomOccurences && providerRoomOccurences.Value
            ? providerRoomOccurences.Value
            : [];
        ctrl.setupOccurencesForSchedule();
        // ideal days tempates
        ctrl.getIdealDayTemplates();
        ctrl.getAppointmentTypes();
        ctrl.buildBreadcrumb();
        $scope.allowManageIdealDays = false;
        // subscribe to changes in templates list
        idealDayTemplatesFactory.observeTemplates($scope.updateTemplates);
        $scope.selectedIdealDaysTemplateId = null;
        $scope.disableShowOnSchedule = false;
      };

      //#region watchers

      // watch used for provider filtering
      $scope.$watch('providerFilterString', function (nv, ov) {
        $scope.providers = ctrl.providersBackup;
        if (nv) {
          $scope.providers = $filter('filter')(
            $scope.providers,
            function (prov) {
              return (
                prov.FirstName.toLowerCase().indexOf(nv.toLowerCase()) !== -1 ||
                prov.LastName.toLowerCase().indexOf(nv.toLowerCase()) !== -1
              );
            }
          );
        }
      });

      // listening for the location change broadcast from the header for updating rooms, etc.
      $scope.$on('patCore:initlocation', function () {
        ctrl.setCurrentLocation();
        ctrl.prepProvidersList();
        ctrl.getRoomsForLocation();
        ctrl.getProviderRoomOccurences();
      });

      //#endregion

      //#region helpers

      // helper for disabling lunch time selection
      ctrl.checkForEnoughTimeForLunch = function () {
        if (
          ctrl.endDateTimePicker.value() - ctrl.startDateTimePicker.value() <=
          ctrl.minMillDiffToAllowLunch
        ) {
          ctrl.startLunchTimePicker.enable(false);
          ctrl.endLunchTimePicker.enable(false);
        } else {
          ctrl.startLunchTimePicker.enable(true);
          ctrl.endLunchTimePicker.enable(true);
        }
      };

      // helper for finding the appropriate end date
      ctrl.getEndDate = function (startDate) {
        var endDate;
        var startDateCopy = new Date(startDate);
        if (24 - startDateCopy.getHours() > 9) {
          // plus 9 per ACs
          endDate = new Date(
            startDateCopy.setHours(startDateCopy.getHours() + 9)
          );
        } else {
          // if there aren't enough hours left, just set the end time to 11
          endDate = new Date(startDateCopy.setHours(23));
          endDate.setMinutes(0);
        }
        return endDate;
      };

      //#endregion

      //#region initial setup

      // transforming the objects for display on the schedule and setting the data source
      ctrl.setupOccurencesForSchedule = function () {
        var defer = $q.defer();
        $timeout(function () {
          angular.forEach(ctrl.providerRoomOccurences, function (occ) {
            var prov = listHelper.findItemByFieldValue(
              $scope.providers,
              'UserId',
              occ.UserId
            );
            if (prov) {
              occ.$$Provider = prov;
              occ.color = prov.Color;
              occ.title = prov.ProfessionalDesignation
                ? prov.FirstName +
                  ' ' +
                  prov.LastName +
                  ', ' +
                  prov.ProfessionalDesignation
                : prov.FirstName + ' ' + prov.LastName;
            }
            occ.start = timeZoneFactory.ConvertDateTZ(
              occ.StartTime,
              $scope.currentLocation.timezone
            );
            occ.end = timeZoneFactory.ConvertDateTZ(
              occ.EndTime,
              $scope.currentLocation.timezone
            );
            occ.lunchStart = occ.LunchStartTime
              ? timeZoneFactory.ConvertDateTZ(
                  occ.LunchStartTime,
                  $scope.currentLocation.timezone
                )
              : null;
            occ.lunchEnd = occ.LunchEndTime
              ? timeZoneFactory.ConvertDateTZ(
                  occ.LunchEndTime,
                  $scope.currentLocation.timezone
                )
              : null;
            occ.IdealDayTemplateId = occ.IdealDayTemplateId
              ? occ.IdealDayTemplateId
              : null;
            occ.ProviderId = occ.UserId ? occ.UserId : null;
            occ.recurrenceRule = occ.ProviderRoomSetupId ? '_' : null; // recurrenceRule is the way Kendo knows that it is a recurrence and there shows the recurring icon
          });
          var dataSource = new kendo.data.SchedulerDataSource({
            data: ctrl.providerRoomOccurences,
            schema: {
              model: {
                id: 'ProviderRoomOccurrenceId',
                fields: {
                  ProviderRoomOccurrenceId: {
                    from: 'ProviderRoomOccurrenceId',
                    type: 'number',
                  },
                  //ProviderId: {
                  //    type: "string",
                  //    validation: {
                  //        required: true,
                  //        customValidation: function(input, params) {
                  //           if (input.is("[name=ProviderId]")) {
                  //              console.log('helpe me')
                  //          }
                  //          //check for the rule attribute
                  //          return true;
                  //        }
                  //    }
                  //}
                },
              },
            },
          });
          $scope.scheduler.setDataSource(dataSource);
          defer.resolve();
        }, 500);
        return defer.promise;
      };

      // filtering the providers list based on providers that have either practice or a role at the selected location
      ctrl.prepProvidersList = function () {
        $scope.providers.length = 0;
        _.forEach(providers, function (user) {
          var locationId = $scope.currentLocation.id;
          if (user.LocationId === locationId) {
            $scope.providers.push(user);
          }
        });
        $scope.providers = $filter('orderBy')($scope.providers, 'LastName');
        ctrl.providersBackup = angular.copy($scope.providers);
        $scope.providerFilterString = '';
        $scope.setProvidersWithShowOnActive();
      };

      // temporary solution to meet ACs, this will change as part of future work
      ctrl.scrollToStartTime = function () {
        $timeout(function () {
          var view = $scope.scheduler.view();
          var elements = view.content.find('td');
          var i;
          var found = false;
          for (i = 0; i < elements.length; i++) {
            var slot = $scope.scheduler.slotByElement(elements[i]);
            var slotElement = angular.element(slot.element);
            if (
              slotElement[0] &&
              slot.startDate.getHours() === 8 &&
              found === false
            ) {
              patSharedServices.DOM.ScrollTo('.k-scheduler-content').Element(
                slotElement[0]
              );
              found = true;
            }
          }
        }, 500);
      };

      // adding 'kendo' properties to rooms objects and sort
      ctrl.addPropertiesToRooms = function () {
        ctrl.rooms.map(function (room) {
          room.text = room.Name;
          room.value = room.RoomId;
        });
        ctrl.rooms = $filter('orderBy')(ctrl.rooms, 'Name');
      };

      // refreshing the rooms columns
      ctrl.refreshRooms = function () {
        var resource = listHelper.findItemByFieldValue(
          $scope.scheduler.resources,
          'name',
          'Rooms'
        );
        if (resource) {
          resource.dataSource.data(ctrl.rooms); // setting the new rooms data
          $scope.scheduler.refresh(); // refreshing the data source
          $scope.scheduler.view($scope.scheduler.view().name); // updating the current view
          ctrl.scrollToStartTime();
          ctrl.updateTimezoneDisplay();
        }
      };

      // displaying the timezone in the header of the times column
      ctrl.updateTimezoneDisplay = function () {
        $timeout(function () {
          var target = angular.element(
            '.k-scheduler-times .k-scheduler-table tbody tr:first-of-type'
          )[0];
          if (target) {
            target.innerHTML =
              '<th><div class="provider-hours__customHeader">' +
              _.escape($scope.currentLocation.timezoneAbbrev) +
              '</div></th>';
          }
        }, 500);
      };

      // showing no rooms message
      ctrl.showNoRoomsMessage = function () {
        $timeout(function () {
          if (ctrl.rooms.length === 0) {
            var target = angular.element(
              '.k-scheduler-header .k-scheduler-table tbody tr:first-of-type'
            );
            if (target) {
              target.html(
                _.escape(
                  '<th><div>' +
                    localize.getLocalizedString(
                      'There are no {0} setup for this location.',
                      ['treatment rooms']
                    ) +
                    '</div></th>'
                )
              );
            }
          }
        }, 500);
      };

      // getting all treatment rooms for a location
      ctrl.getRoomsForLocation = function () {
        var success = function (res) {
          if (res && res.data) {
            ctrl.rooms = res.data;
            ctrl.addPropertiesToRooms();
            ctrl.refreshRooms();
            ctrl.showNoRoomsMessage();
          } else {
            failure();
          }
        };
        var failure = function (res) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the list of {0}. Refresh the page to try again',
              ['treatment rooms']
            ),
            'Error'
          );
        };

        practicesApiService
          .getRoomsByLocationId($scope.currentLocation.id)
          .then(success, failure);
        //scheduleServices.Dtos.TreatmentRooms.get({ LocationId: $scope.currentLocation.id }, success, failure);
        return {
          success: success,
          failure: failure,
        };
      };

      // get provider occurrences for a day and success and failure handlers
      ctrl.getProviderRoomOccurences = function () {
        var success = function (res) {
          if (res && res.Value) {
            ctrl.providerRoomOccurences = res.Value;
            ctrl.setupOccurencesForSchedule();
          } else {
            failure();
          }
        };
        var failure = function (res) {
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to retrieve the list of {0}. Refresh the page to try again',
              ['Provider Hours']
            ),
            'Error'
          );
        };
        scheduleServices.ProviderRoomOccurrences.get(
          {
            locationId: $scope.currentLocation.id,
            locationDate: moment(ctrl.selectedDay).format('YYYY-MM-DD'),
          },
          success,
          failure
        );
        return {
          success: success,
          failure: failure,
        };
      };

      // setting the current location
      ctrl.setCurrentLocation = function () {
        $scope.currentLocation = locationService.getCurrentLocation();
        var ofcLocation = listHelper.findItemByFieldValue(
          ctrl.locations,
          'LocationId',
          $scope.currentLocation.id
        );
        if (ofcLocation) {
          // can't trust the timezone that is returned by locationService.getCurrentLocation()
          $scope.currentLocation.timezone = ofcLocation.Timezone;
          $scope.currentLocation.timezoneAbbrev =
            timeZoneFactory.GetTimeZoneAbbr($scope.currentLocation.timezone);
        }
      };

      //#endregion

      // #region 'kendo' event window modifications

      // scrolling to selected time in kendo data time picker
      ctrl.scrollToSelectedTime = function () {
        $timeout(function () {
          var parent;
          angular.forEach(
            angular.element('.k-animation-container'),
            function (element) {
              if (angular.element(element).css('display') === 'block') {
                parent = angular.element(element);
              }
            }
          );
          if (parent) {
            parent
              .find('ul')
              .scrollTop(
                parent.find('ul').scrollTop() +
                  parent.find('li.k-state-selected').position().top
              );
          }
        }, 200);
      };

      // every time the start or end time change we have to update or disable the lunch time pickers
      ctrl.makeModsForStartEndTime = function (e) {
        var container = e.container;
        // start time
        container
          .find('[data-container-for=start]')
          .find('.k-datetimepicker')
          .css('width', '174px');
        container
          .find('[data-container-for=start]')
          .find('.k-datetimepicker .k-select')
          .css('width', '27px');
        ctrl.startDateTimePicker = container
          .find('[data-container-for=start]')
          .find('[data-role=datetimepicker]')
          .data('kendoDateTimePicker');
        ctrl.startDateTimePicker.setOptions({
          format: 'h:mm tt',
          interval: practiceSettings.DefaultTimeIncrement,
          max: moment(e.event.end)
            .subtract(practiceSettings.DefaultTimeIncrement, 'minutes')
            .format(),
          min: moment(e.event.start).startOf('day').format(),
        });
        ctrl.startDateTimePicker.bind('change', function () {
          // keeping start and end times from flipping
          var timeCopy1 = new Date(this.value());
          ctrl.endDateTimePicker.min(
            new Date(
              timeCopy1.setMinutes(
                timeCopy1.getMinutes() + practiceSettings.DefaultTimeIncrement
              )
            )
          );
          // making sure that lunch hours do not fall out of range of event times
          if (this.value() >= ctrl.startLunchTimePicker.value()) {
            ctrl.startLunchTimePicker.value(null);
            ctrl.endLunchTimePicker.value(null);
          }
          ctrl.checkForEnoughTimeForLunch();
          ctrl.startLunchTimePicker.min(this.value());
          var timeCopy2 = new Date(this.value());
          ctrl.endLunchTimePicker.min(
            new Date(
              timeCopy2.setMinutes(
                timeCopy2.getMinutes() + practiceSettings.DefaultTimeIncrement
              )
            )
          );
        });
        // scrolling to the selected time
        ctrl.startDateTimePicker.bind('open', function (e) {
          ctrl.scrollToSelectedTime();
        });
        // start - locking down the date pickers for 'today only' selection
        var startInput = container.find(
          '[data-container-for=start] .k-datetimepicker input'
        );
        startInput.prop('disabled', true);
        var startCalendar = container.find(
          '[data-container-for=start] .k-i-calendar'
        );
        startCalendar.css('display', 'none');
        // end time
        container
          .find('[data-container-for=end]')
          .find('.k-datetimepicker')
          .css('width', '174px');
        container
          .find('[data-container-for=end]')
          .find('.k-datetimepicker .k-select')
          .css('width', '27px');
        ctrl.endDateTimePicker = container
          .find('[data-container-for=end]')
          .find('[data-role=datetimepicker]')
          .data('kendoDateTimePicker');
        ctrl.endDateTimePicker.setOptions({
          format: 'h:mm tt',
          interval: practiceSettings.DefaultTimeIncrement,
          max: moment(e.event.end).endOf('day').format(),
          min: moment(e.event.start)
            .add(practiceSettings.DefaultTimeIncrement, 'minutes')
            .format(),
        });
        ctrl.endDateTimePicker.bind('change', function () {
          // keeping start and end times from flipping
          var timeCopy1 = new Date(this.value());
          ctrl.startDateTimePicker.max(
            new Date(
              timeCopy1.setMinutes(
                timeCopy1.getMinutes() - practiceSettings.DefaultTimeIncrement
              )
            )
          );
          // making sure that lunch hours do not fall out of range of event times
          if (this.value() <= ctrl.endLunchTimePicker.value()) {
            ctrl.startLunchTimePicker.value(null);
            ctrl.endLunchTimePicker.value(null);
          }
          ctrl.checkForEnoughTimeForLunch();
          var timeCopy2 = new Date(this.value());
          ctrl.startLunchTimePicker.max(
            new Date(
              timeCopy2.setMinutes(
                timeCopy2.getMinutes() - practiceSettings.DefaultTimeIncrement
              )
            )
          );
          ctrl.endLunchTimePicker.max(this.value());
        });
        // scrolling to the selected time
        ctrl.endDateTimePicker.bind('open', function (e) {
          ctrl.scrollToSelectedTime();
        });
        // end - locking down the date pickers for 'today only' selection
        var endInput = container.find(
          '[data-container-for=end] .k-datetimepicker input'
        );
        endInput.prop('disabled', true);
        var endCalendar = container.find(
          '[data-container-for=end] .k-i-calendar'
        );
        endCalendar.css('display', 'none');

        ctrl.startDateTimePicker.value(ctrl.startDateTimePicker.value());
        ctrl.endDateTimePicker.value(ctrl.endDateTimePicker.value());
      };

      // adding lunch time pickers to the event window
      ctrl.addLunchControls = function (e) {
        var selectedDate = ctrl.endDateTimePicker.value().getDate();
        var selectedMonth = ctrl.endDateTimePicker.value().getMonth();
        var selectedYear = ctrl.endDateTimePicker.value().getFullYear();
        var dateArray = [selectedDate, selectedMonth, selectedYear];
        var container = e.container;
        // lunch start config
        container
          .find('[data-container-for=end]')
          .after(
            '<div data-container-for="lunch_start" class="k-edit-field"><input id="lunch_start"></input></div>'
          );
        container
          .find('[data-container-for=end]')
          .after(
            '<div class="k-edit-label"><label for="lunch_start">' +
              localize.getLocalizedString('Lunch Start') +
              '</label></div>'
          );
        angular.element('#lunch_start').kendoTimePicker({
          change: function () {
            var time = new Date(
              dateArray[2],
              dateArray[1],
              dateArray[0],
              this.value().getHours(),
              this.value().getMinutes(),
              this.value().getSeconds()
            );
            if (!ctrl.endLunchTimePicker.value()) {
              // if end lunch time is null, set it to start lunch time plus 1 hour
              ctrl.endLunchTimePicker.value(
                new Date(time.setHours(time.getHours() + 1))
              );
              if (!ctrl.endLunchTimePicker.value()) {
                // if ctrl.endLunchTimePicker.value() is null after trying to set it, it means that there wasnt any time left an hour out, just setting ahead practice default
                ctrl.endLunchTimePicker.value(
                  new Date(
                    time.setMinutes(
                      time.getMinutes() + practiceSettings.DefaultTimeIncrement
                    )
                  )
                );
              }
            } else if (
              ctrl.endLunchTimePicker.value() <=
              ctrl.startLunchTimePicker.value()
            ) {
              // if end lunch time is now before start time, set it to start lunch time plus practice default increment
              ctrl.endLunchTimePicker.value(
                new Date(
                  time.setMinutes(
                    time.getMinutes() + practiceSettings.DefaultTimeIncrement
                  )
                )
              );
            }
          },
          interval: practiceSettings.DefaultTimeIncrement,
          max: moment(e.event.end)
            .subtract(practiceSettings.DefaultTimeIncrement, 'minutes')
            .format(),
          min: moment(e.event.start).format(),
          value: e.event.lunchStart,
        });
        ctrl.startLunchTimePicker = angular
          .element('#lunch_start')
          .data('kendoTimePicker');
        angular.element('#lunch_start').prop('disabled', true);
        // lunch end config
        container
          .find('[data-container-for=lunch_start]')
          .after(
            '<div data-container-for="lunch_end" class="k-edit-field"><input id="lunch_end"></input></div>'
          );
        container
          .find('[data-container-for=lunch_start]')
          .after(
            '<div class="k-edit-label"><label for="lunch_end">' +
              localize.getLocalizedString('Lunch End') +
              '</label></div>'
          );
        angular.element('#lunch_end').kendoTimePicker({
          change: function () {
            if (
              !ctrl.startLunchTimePicker.value() ||
              ctrl.startLunchTimePicker.value() >=
                ctrl.endLunchTimePicker.value()
            ) {
              // if start lunch time is null or now after end time, set it to end lunch time minus practice default increment
              var time = new Date(
                dateArray[2],
                dateArray[1],
                dateArray[0],
                this.value().getHours(),
                this.value().getMinutes(),
                this.value().getSeconds()
              );

              ctrl.startLunchTimePicker.value(
                new Date(
                  time.setMinutes(
                    time.getMinutes() - practiceSettings.DefaultTimeIncrement
                  )
                )
              );
            }
          },
          interval: practiceSettings.DefaultTimeIncrement,
          max: moment(e.event.end).format(),
          min: moment(e.event.start)
            .add(practiceSettings.DefaultTimeIncrement, 'minutes')
            .format(),
          value: e.event.lunchEnd,
        });
        ctrl.endLunchTimePicker = angular
          .element('#lunch_end')
          .data('kendoTimePicker');
        angular.element('#lunch_end').prop('disabled', true);
      };

      // customizing for both types of events
      ctrl.customizeNativeEventContainer = function (e) {
        var container = e.container;
        ctrl.makeModsForBothTypes(e);
        switch (ctrl.recurringEnabled) {
          case true:
            ctrl.makeModsForSeries(e);
            break;
          case false:
            ctrl.makeModsForOccurence(e);
            break;
        }
      };

      // updates for both one-time and recurrences
      ctrl.makeModsForBothTypes = function (e) {
        var container = e.container;
        // start/end
        ctrl.makeModsForStartEndTime(e);
        // updating the title
        var titleElem = container.prev().find('.k-window-title');
        titleElem.attr('id', 'ttlProvHours');
        if (e.event.$$Provider) {
          var prov = e.event.$$Provider.ProfessionalDesignation
            ? e.event.$$Provider.FirstName +
              ' ' +
              e.event.$$Provider.LastName +
              ', ' +
              e.event.$$Provider.ProfessionalDesignation
            : e.event.$$Provider.FirstName + ' ' + e.event.$$Provider.LastName;
          titleElem.text(
            localize.getLocalizedString('Provider Hours for') + ' ' + prov
          );
        } else {
          titleElem.text(localize.getLocalizedString('Provider Hours'));
        }
        // removing title label and input
        container.find('label[for=title]').parent().remove();
        container.find('input[name=title]').parent().remove();
        // removing isAllDay label and input
        container.find('label[for=isAllDay]').parent().remove();
        container.find('input[name=isAllDay]').parent().remove();
        // removing description label and input
        container.find('label[for=description]').parent().remove();
        container.find('textarea[name=description]').parent().remove();
        // removing timezone label and button
        container.find('label[for=timezone]').parent().remove();
        container.find('[data-container-for=timezone]').remove();
        // removing delete button
        container.find('.k-scheduler-delete').remove();
        // removing 'None' option from the rooms dropdown
        ctrl.roomDropdown = container
          .find('[data-container-for=RoomId]')
          .find('[data-role=dropdownlist]')
          .data('kendoDropDownList');
        ctrl.roomDropdown.optionLabel.remove();
        ctrl.roomDropdown.wrapper.attr('id', 'inpRoom');
        // updating the default selection text for the recurrence dropdown
        ctrl.recurrenceDropdown = container
          .find('[data-container-for=recurrenceRule]')
          .find('[data-role=dropdownlist]')
          .data('kendoDropDownList');
        ctrl.recurrenceDropdown.span[0].innerText =
          localize.getLocalizedString('None');
        ctrl.recurrenceDropdown.wrapper.attr('id', 'inpRepeat');
        // putting save button on the right to match best practice and updating text per ACs
        container
          .find('.k-edit-buttons .k-scheduler-update')
          .css('float', 'right');
        // lunch
        ctrl.addLunchControls(e);
        // ideal days dropdown to the event modal
        ctrl.addIdealDaysDropdown(e);
        // create provider dropdown
        ctrl.addProvidersDropdown(e);
        if (e.event.$$Provider) {
          // hide if we already have a provider
          e.container.find('[data-container-for=ProviderId]').hide();
          container.find('label[for=providers_template]').parent().hide();
        } else {
          // disable the save button until we do
          e.container.find('.k-scheduler-update').addClass('k-state-disabled');
        }
        // adding bootstrap styles to buttons
        e.container.find('.k-scheduler-update').addClass('btn btn-primary');
        e.container.find('.k-scheduler-cancel').addClass('btn btn-default');
      };

      // mods that happen whenever the user selects any series type from the dropdown
      ctrl.makeModsForSeriesAfterSelection = function (e) {
        var container = e.container;
        // label changes
        $.each(
          container.find('.k-recur-view .k-edit-label label'),
          function (key, value) {
            switch (value.innerText) {
              case 'Repeat every:':
                value.innerText = localize.getLocalizedString('Repeat every');
                break;
              case 'End:':
                value.innerText = localize.getLocalizedString('Ends');
                break;
            }
          }
        );
        // Repeat every
        ctrl.numericTextBoxWeeks = container
          .find('.k-recur-view')
          .find('[data-role=numerictextbox]')
          .data('kendoNumericTextBox');
        ctrl.numericTextBoxWeeks.max(30);
        // Starts on
        container
          .find('.k-recur-view .k-edit-label')
          .last()
          .before(
            '<div class="k-edit-label"><label>' +
              localize.getLocalizedString('Starts on') +
              '</label></div>'
          );
        container
          .find('.k-recur-view .k-edit-label')
          .last()
          .before(
            '<div class="k-edit-field"><input id="starts_on"></input></div>'
          );
        angular.element('#starts_on').kendoDatePicker({
          change: function () {
            ctrl.datePickerEndsOn.min(this.value());
            if (ctrl.datePickerEndsOn.value() < this.value()) {
              ctrl.datePickerEndsOn.value(this.value());
            }
          },
          max: ctrl.maxDate,
          min: new Date(),
          value: ctrl.selectedDay ? ctrl.selectedDay : new Date(),
        });
        ctrl.startsOnDatePicker = angular
          .element('#starts_on')
          .data('kendoDatePicker');
        // disabling manual input of date
        angular.element('#starts_on').prop('disabled', true);
        // Ends
        ctrl.numericTextBoxEndsAfter = container
          .find('.k-recur-count')
          .find('[data-role=numerictextbox]')
          .data('kendoNumericTextBox');
        ctrl.numericTextBoxEndsAfter.max(99);
        ctrl.datePickerEndsOn = container
          .find('.k-recur-until')
          .find('[data-role=datepicker]')
          .data('kendoDatePicker');
        container.find('.k-recur-end-until').on('change', function () {
          // disabling manual input of date
          container.find('.k-recur-until input').prop('disabled', true);
        });
      };

      // mods that just need to happen when weekly is selected from the dropdown
      ctrl.weeklySeries = function (e) {
        var container = e.container;
        // label changes
        $.each(
          container.find('.k-recur-view .k-edit-label label'),
          function (key, value) {
            switch (value.innerText) {
              case 'Repeat on:':
                value.innerText =
                  localize.getLocalizedString('Repeat on') + '*';
                break;
            }
          }
        );
        // Repeat on
        container.find('.k-recur-view .k-check').css('margin-right', '12px');
        ctrl.weekdaysChecked = 1;
        container
          .find('.k-edit-buttons .k-scheduler-update')
          .removeClass('k-state-disabled');
        var checks = container.find('.k-recur-view .k-check input');
        checks.on('change', function (e) {
          // weekday validation
          ctrl.weekdaysChecked =
            e.currentTarget.checked === false
              ? ctrl.weekdaysChecked - 1
              : ctrl.weekdaysChecked + 1;
          if (ctrl.weekdaysChecked === 0) {
            container
              .find('.k-edit-buttons .k-scheduler-update')
              .addClass('k-state-disabled');
          } else {
            container
              .find('.k-edit-buttons .k-scheduler-update')
              .removeClass('k-state-disabled');
          }
        });
        checks.each(function (index, elem) {
          var id = 'chk';
          switch (index) {
            case 0:
              id += 'Sunday';
              break;
            case 1:
              id += 'Monday';
              break;
            case 2:
              id += 'Tuesday';
              break;
            case 3:
              id += 'Wednesday';
              break;
            case 4:
              id += 'Thursday';
              break;
            case 5:
              id += 'Friday';
              break;
            case 6:
              id += 'Saturday';
              break;
          }
          elem.id = id;
        });
      };

      // mods that just need to happen when monthly is selected from the dropdown
      ctrl.monthlySeries = function (e) {
        var container = e.container;
        // label changes
        $.each(
          container.find('.k-recur-view .k-edit-label label'),
          function (key, value) {
            switch (value.innerText) {
              case 'Repeat on:':
                value.innerText = localize.getLocalizedString('Repeats on');
                break;
            }
          }
        );
        // Repeat on
        container.find('.k-recur-view .k-recur-monthday').remove();
        angular
          .element(container.find('.k-recur-view .k-recur-month-radio')[0])
          .after(
            '<label>' +
              localize.getLocalizedString('day of the month') +
              '</label>'
          );
        // clearing 'Day' text
        angular
          .element(container.find('.k-recur-view .k-recur-month-radio')[0])
          .parent()
          .contents()
          .filter(function () {
            return this.nodeType == 3;
          })
          .remove();
        container.find('.k-recur-view .k-recur-weekday-offset').remove();
        container.find('.k-recur-view .k-recur-weekday').remove();
        angular
          .element(container.find('.k-recur-view .k-recur-month-radio')[1])
          .after(
            '<label>' +
              localize.getLocalizedString('day of the week') +
              '</label>'
          );
      };

      // modifications specifically for series
      ctrl.makeModsForSeries = function (e) {
        ctrl.recurrenceDropdown.bind('change', function () {
          switch (this.value()) {
            case 'weekly':
              ctrl.makeModsForSeriesAfterSelection(e);
              ctrl.weeklySeries(e);
              break;
            case 'monthly':
              ctrl.makeModsForSeriesAfterSelection(e);
              ctrl.monthlySeries(e);
              break;
          }
        });
        if (ctrl.recurringEnabled && e.event.ProviderRoomSetupId) {
          var success = function (res) {
            if (res && res.Value) {
              ctrl.recurrenceDropdown.select(
                res.Value.RecurrenceSetup.FrequencyTypeId
              );
              ctrl.recurrenceDropdown.trigger('change');
              var occ = listHelper.findItemByFieldValue(
                $scope.scheduler.dataSource._data,
                'ProviderRoomSetupId',
                e.event.ProviderRoomSetupId
              );
              occ.DataTag = res.Value.DataTag;
              occ.$$RecurrenceSetup = res.Value.RecurrenceSetup;
              e.event.$$RecurrenceSetup = res.Value.RecurrenceSetup;
              ctrl.updateValuesForSeriesUpdate(e);
            }
          };
          scheduleServices.ProviderRoomSetup.get(
            { providerRoomSetupId: e.event.ProviderRoomSetupId },
            success
          );
        }
        // changing Never to None per ACs
        var n = listHelper.findItemByFieldValue(
          ctrl.recurrenceDropdown.dataSource.data(),
          'text',
          'Never'
        );
        n.text = localize.getLocalizedString('None');
        // culling the list of repeat options for now
        var d = listHelper.findItemByFieldValue(
          ctrl.recurrenceDropdown.dataSource.data(),
          'text',
          'Daily'
        );
        ctrl.recurrenceDropdown.dataSource.remove(d);
        var y = listHelper.findItemByFieldValue(
          ctrl.recurrenceDropdown.dataSource.data(),
          'text',
          'Yearly'
        );
        ctrl.recurrenceDropdown.dataSource.remove(y);
      };

      // locking down repeat for one-time occurrences
      ctrl.makeModsForOccurence = function (e) {
        // muting the reccurrence dropdown
        ctrl.recurrenceDropdown.enable(false);
      };

      //#endregion

      //#region DTO creation/tansformation

      // DTO builder
      ctrl.createRecurrenceSetupDto = function (e, format) {
        var dto;
        if (e.event.recurrenceRule && e.event.recurrenceRule !== '_') {
          // new
          dto = {
            Interval: 1,
            StartDate: moment(ctrl.startsOnDatePicker.value())
              .startOf('day')
              .format(format),
          };
          var ruleList = e.event.recurrenceRule.split(';');
          // weekly
          var weeklyRuleIndex = ruleList.indexOf('FREQ=WEEKLY');
          if (weeklyRuleIndex !== -1) {
            // e.event.recurrenceRule -> FREQ=WEEKLY;BYDAY=SU,MO,TU,WE,TH,FR,SA
            // e.event.recurrenceRule -> FREQ=WEEKLY;COUNT=4;BYDAY=SU,TH
            // e.event.recurrenceRule -> FREQ=WEEKLY;UNTIL=20171220T090000Z;BYDAY=MO,TU,WE
            dto.FrequencyTypeId = 1;
            angular.forEach(ruleList, function (rule) {
              if (rule.indexOf('BYDAY=') !== -1) {
                var weekdays = rule.slice(6).split(',');
                dto.RepeatOnSunday =
                  weekdays.indexOf('SU') !== -1 ? true : false;
                dto.RepeatOnMonday =
                  weekdays.indexOf('MO') !== -1 ? true : false;
                dto.RepeatOnTuesday =
                  weekdays.indexOf('TU') !== -1 ? true : false;
                dto.RepeatOnWednesday =
                  weekdays.indexOf('WE') !== -1 ? true : false;
                dto.RepeatOnThursday =
                  weekdays.indexOf('TH') !== -1 ? true : false;
                dto.RepeatOnFriday =
                  weekdays.indexOf('FR') !== -1 ? true : false;
                dto.RepeatOnSaturday =
                  weekdays.indexOf('SA') !== -1 ? true : false;
              }
              if (rule.indexOf('COUNT=') !== -1) {
                dto.Count = rule.slice(6);
              }
              if (rule.indexOf('INTERVAL=') !== -1) {
                dto.Interval = rule.slice(9);
              }
              if (rule.indexOf('UNTIL=') !== -1) {
                dto.EndDate = moment(rule.slice(6)).endOf('day').format(format);
              }
            });
          }
          // monthly
          var monthlyRuleIndex = ruleList.indexOf('FREQ=MONTHLY');
          if (monthlyRuleIndex !== -1) {
            // e.event.recurrenceRule -> FREQ=MONTHLY;BYMONTHDAY=2
            // e.event.recurrenceRule -> FREQ=MONTHLY;BYDAY=1FR
            dto.FrequencyTypeId = 2;
            angular.forEach(ruleList, function (rule) {
              if (rule.indexOf('BYMONTHDAY=') !== -1) {
                dto.RepeatOnDayOfMonth = true;
              }
              if (rule.indexOf('BYDAY=') !== -1) {
                dto.RepeatOnDayOfWeek = true;
              }
              if (rule.indexOf('COUNT=') !== -1) {
                dto.Count = rule.slice(6);
              }
              if (rule.indexOf('INTERVAL=') !== -1) {
                dto.Interval = rule.slice(9);
              }
              if (rule.indexOf('UNTIL=') !== -1) {
                dto.EndDate = moment(rule.slice(6)).endOf('day').format(format);
              }
            });
          }
        } else if (e.event.ProviderRoomSetupId && e.event.$$RecurrenceSetup) {
          // edit
          var container = e.container;
          dto = {
            Count: angular.element(
              container.find('.k-recur-view .k-recur-end-count')[0]
            )[0].checked
              ? ctrl.numericTextBoxEndsAfter.value()
              : null,
            DataTag: e.event.$$RecurrenceSetup.DataTag,
            EndDate: angular.element(
              container.find('.k-recur-view .k-recur-end-until')[0]
            )[0].checked
              ? moment(ctrl.datePickerEndsOn.value())
                  .endOf('day')
                  .format(format)
              : null,
            Interval: ctrl.numericTextBoxWeeks.value(),
            StartDate: moment(ctrl.startsOnDatePicker.value())
              .startOf('day')
              .format(format),
          };
          if (e.event.$$RecurrenceSetup.FrequencyTypeId === 1) {
            dto.FrequencyTypeId = 1;
            dto.RepeatOnSunday = angular.element(
              container.find('.k-recur-view .k-check input')[0]
            )[0].checked;
            dto.RepeatOnMonday = angular.element(
              container.find('.k-recur-view .k-check input')[1]
            )[0].checked;
            dto.RepeatOnTuesday = angular.element(
              container.find('.k-recur-view .k-check input')[2]
            )[0].checked;
            dto.RepeatOnWednesday = angular.element(
              container.find('.k-recur-view .k-check input')[3]
            )[0].checked;
            dto.RepeatOnThursday = angular.element(
              container.find('.k-recur-view .k-check input')[4]
            )[0].checked;
            dto.RepeatOnFriday = angular.element(
              container.find('.k-recur-view .k-check input')[5]
            )[0].checked;
            dto.RepeatOnSaturday = angular.element(
              container.find('.k-recur-view .k-check input')[6]
            )[0].checked;
          } else if (e.event.$$RecurrenceSetup.FrequencyTypeId === 2) {
            dto.FrequencyTypeId = 2;
            dto.RepeatOnDayOfMonth = angular.element(
              container.find('.k-recur-view .k-recur-month-radio')[0]
            )[0].checked;
            dto.RepeatOnDayOfWeek = angular.element(
              container.find('.k-recur-view .k-recur-month-radio')[1]
            )[0].checked;
          }
        } else {
          dto = {
            FrequencyTypeId: 0,
            StartDate: moment(e.event.start).format(format),
          };
        }
        return dto;
      };

      // DTO builder
      ctrl.createProviderRoomSetupDto = function (e) {
        var format = 'YYYY-MM-DD[T]HH:mm:ss[.00Z]'; // strange but true, sending local time with zero offset
        return {
          DataTag: e.event.DataTag,
          EndTime: moment(ctrl.endDateTimePicker.value()).format(format),
          IdealDayTemplateId: ctrl.idealDaysTemplateDropDownList.value()
            ? ctrl.idealDaysTemplateDropDownList.value()
            : null,
          LocationId: $scope.currentLocation.id,
          LunchEndTime: ctrl.endLunchTimePicker.value()
            ? moment(ctrl.endLunchTimePicker.value()).format(format)
            : null,
          LunchStartTime: ctrl.startLunchTimePicker.value()
            ? moment(ctrl.startLunchTimePicker.value()).format(format)
            : null,
          ProviderRoomSetupId: e.event.ProviderRoomSetupId,
          RecurrenceSetup: ctrl.createRecurrenceSetupDto(e, format),
          RoomId: ctrl.roomDropdown.value(),
          StartTime: moment(ctrl.startDateTimePicker.value()).format(format),
          UserId: e.event.$$Provider.UserId,
          $$ProviderId: e.event.ProviderId,
        };
      };

      // DTO builder
      ctrl.createProviderRoomOccurrenceDto = function (e) {
        var format = 'YYYY-MM-DD[T]HH:mm:ss[.00Z]';
        return {
          DataTag: e.event.DataTag,
          EndTime: moment(ctrl.endDateTimePicker.value()).utc().format(format),
          IdealDayTemplateId: ctrl.idealDaysTemplateDropDownList.value()
            ? ctrl.idealDaysTemplateDropDownList.value()
            : null,
          LocationId: $scope.currentLocation.id,
          LunchEndTime: ctrl.endLunchTimePicker.value()
            ? moment(ctrl.endLunchTimePicker.value()).utc().format(format)
            : null,
          LunchStartTime: ctrl.startLunchTimePicker.value()
            ? moment(ctrl.startLunchTimePicker.value()).utc().format(format)
            : null,
          ProviderRoomOccurrenceId: e.event.ProviderRoomOccurrenceId,
          RoomId: ctrl.roomDropdown.value(),
          StartTime: moment(ctrl.startDateTimePicker.value())
            .utc()
            .format(format),
          UserId: e.event.$$Provider.UserId,
          $$ProviderId: e.event.ProviderId,
        };
      };

      //#endregion

      //#region CRUD

      // setup type modal creator for edit and delete
      ctrl.createSetupTypeModalInstance = function (mode) {
        return modalFactory.Modal({
          amfa: 'soar-sch-swkstp-edit',
          animation: false,
          backdrop: 'static',
          controller: 'SetupTypeModalController',
          keyboard: false,
          resolve: {
            mode: function () {
              return mode;
            },
          },
          templateUrl:
            'App/Schedule/provider-hours/setup-type-modal/setup-type-modal.html',
          windowClass: 'setup-type-modal',
        });
      };

      // populating series data on edit series
      ctrl.updateValuesForSeriesUpdate = function (e) {
        var container = e.container;
        // Repeat every
        ctrl.numericTextBoxWeeks.value(e.event.$$RecurrenceSetup.Interval);
        if (e.event.$$RecurrenceSetup.FrequencyTypeId === 1) {
          // Repeat on
          angular
            .element(container.find('.k-recur-view .k-check input')[0])
            .attr('checked', e.event.$$RecurrenceSetup.RepeatOnSunday);
          angular
            .element(container.find('.k-recur-view .k-check input')[1])
            .attr('checked', e.event.$$RecurrenceSetup.RepeatOnMonday);
          angular
            .element(container.find('.k-recur-view .k-check input')[2])
            .attr('checked', e.event.$$RecurrenceSetup.RepeatOnTuesday);
          angular
            .element(container.find('.k-recur-view .k-check input')[3])
            .attr('checked', e.event.$$RecurrenceSetup.RepeatOnWednesday);
          angular
            .element(container.find('.k-recur-view .k-check input')[4])
            .attr('checked', e.event.$$RecurrenceSetup.RepeatOnThursday);
          angular
            .element(container.find('.k-recur-view .k-check input')[5])
            .attr('checked', e.event.$$RecurrenceSetup.RepeatOnFriday);
          angular
            .element(container.find('.k-recur-view .k-check input')[6])
            .attr('checked', e.event.$$RecurrenceSetup.RepeatOnSaturday);
          // for weekday validation
          var days = [
            'RepeatOnSunday',
            'RepeatOnMonday',
            'RepeatOnTuesday',
            'RepeatOnWednesday',
            'RepeatOnThursday',
            'RepeatOnFriday',
            'RepeatOnSaturday',
          ];
          ctrl.weekdaysChecked = 0;

          for (var i = 0; i < days.length; i++) {
            if (e.event.$$RecurrenceSetup[days[i]] === true) {
              ctrl.weekdaysChecked == ctrl.weekdaysChecked++;
            }
          }
        } else if (e.event.$$RecurrenceSetup.FrequencyTypeId === 2) {
          // Repeat on
          angular
            .element(container.find('.k-recur-view .k-recur-month-radio')[0])
            .attr('checked', e.event.$$RecurrenceSetup.RepeatOnDayOfMonth);
          angular
            .element(container.find('.k-recur-view .k-recur-month-radio')[1])
            .attr('checked', e.event.$$RecurrenceSetup.RepeatOnDayOfWeek);
        }
        // Ends - After
        if (e.event.$$RecurrenceSetup.Count) {
          angular
            .element(container.find('.k-recur-view .k-recur-end-count'))
            .attr('checked', true);
          ctrl.numericTextBoxEndsAfter.value(e.event.$$RecurrenceSetup.Count);
          ctrl.numericTextBoxEndsAfter.enable(true);
        }
        // Ends - On
        if (e.event.$$RecurrenceSetup.EndDate) {
          angular
            .element(container.find('.k-recur-view .k-recur-end-until'))
            .attr('checked', true);
          ctrl.datePickerEndsOn.value(
            new Date(e.event.$$RecurrenceSetup.EndDate)
          );
          ctrl.datePickerEndsOn.enable();
        }
      };

      // save call and success and failure handlers
      ctrl.save = function (e) {
        var success = function (res) {
          if (res && res.Value) {
            ctrl.getProviderRoomOccurences();
            toastrFactory.success(
              localize.getLocalizedString('Provider Hours') +
                ' ' +
                localize.getLocalizedString('have been saved'),
              localize.getLocalizedString('Success')
            );
          } else {
            failure();
          }
        };
        var failure = function (res) {
          ctrl.getProviderRoomOccurences();
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to save the {0}. Please try again.',
              ['Provider Hours']
            ),
            'Error'
          );
        };
        if (ctrl.recurringEnabled && e.event.ProviderRoomSetupId) {
          // updating a series
          scheduleServices.ProviderRoomSetup.update(
            ctrl.createProviderRoomSetupDto(e),
            success,
            failure
          );
        } else if (!e.event.ProviderRoomOccurrenceId) {
          // creating a series or occurrence
          scheduleServices.ProviderRoomSetup.save(
            ctrl.createProviderRoomSetupDto(e),
            success,
            failure
          );
        } else {
          // updating an occurrence
          scheduleServices.ProviderRoomOccurrences.update(
            ctrl.createProviderRoomOccurrenceDto(e),
            success,
            failure
          );
        }
        return {
          success: success,
          failure: failure,
        };
      };

      // delete call and success and failure handlers
      ctrl.delete = function (e, deletingSeries) {
        var success = function (res) {
          ctrl.getProviderRoomOccurences();
          toastrFactory.success(
            localize.getLocalizedString('Provider Hours') +
              ' ' +
              localize.getLocalizedString('have been deleted'),
            localize.getLocalizedString('Success')
          );
        };
        var failure = function (res) {
          ctrl.getProviderRoomOccurences();
          toastrFactory.error(
            localize.getLocalizedString(
              'Failed to delete the {0}. Please try again.',
              ['Provider Hours']
            ),
            'Error'
          );
        };
        if (deletingSeries === true) {
          // deleting a series
          scheduleServices.ProviderRoomSetup.delete(
            { providerRoomSetupId: e.event.ProviderRoomSetupId },
            success,
            failure
          );
        } else {
          // deleting an occurrence
          scheduleServices.ProviderRoomOccurrences.delete(
            { providerRoomOccurrenceId: e.event.ProviderRoomOccurrenceId },
            success,
            failure
          );
        }
        return {
          success: success,
          failure: failure,
        };
      };

      //#endregion

      //#region validation

      // validator
      ctrl.isValid = function (e) {
        var isValid = true;
        // lunch time validation - must fall within range of event or save will fail
        if (ctrl.startLunchTimePicker.value()) {
          isValid = ctrl.validateLunchHour();
        }
        if (
          ctrl.endDateTimePicker.value() <= ctrl.startDateTimePicker.value()
        ) {
          // end date is before start date
          isValid = false;
        }
        if (e.event.recurrenceRule) {
          var ruleList = e.event.recurrenceRule.split(';');
          var index = ruleList.indexOf('FREQ=WEEKLY');
          if (index !== -1) {
            angular.forEach(ruleList, function (rule) {
              if (rule.indexOf('BYDAY=') !== -1 && rule.length === 6) {
                // they have selected weekly but not selected at least one day of the week
                isValid = false;
              }
            });
          }
        }
        if (!e.event.$$Provider || !e.event.$$Provider.UserId) {
          isValid = false;
        }

        return isValid;
      };

      // in order to validate the lunch hour we must convert the values to today
      // and just validate the time portion of the datetime
      ctrl.validateLunchHour = function () {
        var startLunchTime = moment().startOf('day');
        startLunchTime = startLunchTime.set({
          hour: moment(ctrl.startLunchTimePicker.value()).hour(),
          minute: moment(ctrl.startLunchTimePicker.value()).minutes(),
        });
        var endLunchTime = moment().startOf('day');
        endLunchTime = endLunchTime.set({
          hour: moment(ctrl.endLunchTimePicker.value()).hour(),
          minute: moment(ctrl.endLunchTimePicker.value()).minutes(),
        });

        var startTime = moment().startOf('day');
        startTime = startTime.set({
          hour: moment(ctrl.startDateTimePicker.value()).hour(),
          minute: moment(ctrl.startDateTimePicker.value()).minutes(),
        });
        var endTime = moment().startOf('day');
        endTime = endTime.set({
          hour: moment(ctrl.endDateTimePicker.value()).hour(),
          minute: moment(ctrl.endDateTimePicker.value()).minutes(),
        });

        var isBetween =
          startLunchTime.isAfter(startTime) &&
          startLunchTime.isBefore(endTime) &&
          endLunchTime.isAfter(startTime) &&
          endLunchTime.isBefore(endTime);

        return isBetween;
      };

      //#endregion

      //#region Kendo config

      // schedule configuration object
      ctrl.createSchedulerOptions = function () {
        return {
          add: function (e) {
            if (ctrl.selectedDay < ctrl.today) {
              e.preventDefault();
            } else {
              // need this for skipping reccurring or series choice later
              ctrl.adding = true;
            }
          },
          allDaySlot: false,
          currentTimeMarker: false,
          dataBound: function (e) {
            // hiding date
            $('.k-scheduler-layout tr:first .k-scheduler-table')
              .not('.k-scheduler-header-all-day')
              .find('tr:nth-of-type(2)')
              .hide();

            var provHeaders = $('.k-scheduler-header th').map(function () {
              return this.innerHTML;
            });

            $('.k-scheduler-layout .k-scheduler-table td').each(
              function (key, element) {
                var slot = e.sender.slotByElement(element);
                var slotElement = angular.element(slot.element);
                var slotStart = new Date(slot.startDate);

                var columnName =
                  slot.groupIndex > -1 && provHeaders[slot.groupIndex]
                    ? provHeaders[slot.groupIndex]
                    : '';
                slotElement.attr(
                  'id',
                  columnName + $filter('date')(slotStart, '-MM-dd-yyyy-HH-mm')
                );
              }
            );

            $('.k-scheduler-content').attr('id', 'idSchedulerContentCtrl');
          },
          date: ctrl.today,
          edit: function (e) {
            if (ctrl.previousOccurrence(e.event.StartTime)) {
              e.preventDefault();
            } else {
              if (
                angular.isDefined(ctrl.modalResponse) ||
                !e.event.ProviderRoomSetupId ||
                ctrl.adding === true
              ) {
                // if there is a modalResponse, then they have chosen whether they want to edit the occurrence or the series, resume normal flow
                ctrl.recurringEnabled = true;
                if (ctrl.adding === true) {
                  // enable recurring for add
                  ctrl.recurringEnabled = true;
                } else if (
                  angular.isDefined(ctrl.modalResponse) ||
                  !e.event.ProviderRoomSetupId
                ) {
                  // they have chosen 'Edit Occurrence' or 'Edit Series' via edit flow
                  ctrl.recurringEnabled = !e.event.ProviderRoomSetupId
                    ? false
                    : ctrl.modalResponse;
                }
                // making the kendo event window lay on top of the fuse header (100000 > 99999) so that it is not covered up at lower resolutions
                angular.element(e.container).parent().css('z-index', '100000');
                ctrl.customizeNativeEventContainer(e);
                // cleanup
                delete ctrl.modalResponse;
                delete ctrl.adding;
                delete ctrl.isCustomEvent;
              } else {
                // if there is no modalResponse, then they have not chosen whether they want to edit the occurrence or the series yet
                ctrl.event = angular.copy(e.event);
                e.preventDefault();
                var modalInstance = ctrl.createSetupTypeModalInstance('Edit');
                modalInstance.result.then(function (res) {
                  ctrl.modalResponse = res;
                  // this will get us back into the edit event handler to resume normal flow now that a choice has been made
                  $scope.scheduler.editEvent(ctrl.event);
                  // cleanup
                  delete ctrl.event;
                });
              }
            }
          },
          editable: {
            confirmation: false,
            editRecurringMode: 'series',
            resize: false,
          },
          footer: false,
          group: {
            resources: ['Rooms'],
          },
          height: 800,
          messages: {
            editor: {
              end: localize.getLocalizedString('End Time'),
              start: localize.getLocalizedString('Start Time'),
            },
            save: localize.getLocalizedString('Save Hours'),
          },
          max: ctrl.maxDate,
          minorTickCount: ctrl.minorTickCount,
          moveStart: function (e) {
            // disabling this for now until we have determined what the correct behavior should be
            e.preventDefault();
          },
          navigate: function (e) {
            ctrl.selectedDay = e.date;
            ctrl.scrollToStartTime();
            ctrl.showNoRoomsMessage();
            ctrl.updateTimezoneDisplay();
            ctrl.getProviderRoomOccurences();
          },
          resources: [
            {
              field: 'RoomId',
              name: 'Rooms',
              dataSource: ctrl.rooms,
              title: 'Room',
            },
          ],
          remove: function (e) {
            if (ctrl.previousOccurrence(e.event.StartTime)) {
              e.preventDefault();
            } else {
              if (
                angular.isDefined(ctrl.modalResponse) ||
                !e.event.ProviderRoomSetupId
              ) {
                // if there is a modalResponse or no e.event.ProviderRoomSetupId,
                // then they have either chosen whether they want to delete the occurrence or the series, or it was just an occurrence that they chose to delete in the first place,
                // show them the confirmation modal and delete or don't delete accordingly
                e.preventDefault();
                var deletingSeries = ctrl.modalResponse;
                var type = !deletingSeries
                  ? localize.getLocalizedString('Occurrence')
                  : localize.getLocalizedString('Series');
                var title =
                  localize.getLocalizedString('Remove') +
                  ' ' +
                  localize.getLocalizedString('Provider Hours') +
                  ' ' +
                  type +
                  '?';
                modalFactory
                  .ConfirmModal(
                    title,
                    localize.getLocalizedString(
                      "Are you sure you want to remove this provider's assignment?"
                    ),
                    localize.getLocalizedString('Yes'),
                    localize.getLocalizedString('No')
                  )
                  .then(function () {
                    ctrl.delete(e, deletingSeries);
                  });
                delete ctrl.modalResponse;
              } else {
                // if there is no modalResponse, then they have not chosen whether they want to edit the occurrence or the series yet
                ctrl.event = angular.copy(e.event);
                e.preventDefault();
                var modalInstance = ctrl.createSetupTypeModalInstance('Delete');
                modalInstance.result.then(function (res) {
                  ctrl.modalResponse = res;
                  // this will get us back into the remove event handler to resume normal flow now that choice has been made
                  $scope.scheduler.removeEvent(ctrl.event);
                  // cleanup
                  delete ctrl.event;
                });
              }
            }
          },
          resize: function (e) {
            //placeholder for now
          },
          resizeEnd: function (e) {
            if (!e.event.$$Provider.UserId) {
              ctrl.openProviderModal(e);
            }
          },
          resizeStart: function (e) {},
          save: function (e) {
            if (
              patSecurityService.IsAuthorizedByAbbreviation(
                'soar-sch-swkstp-add'
              )
            ) {
              if (ctrl.isValid(e)) {
                ctrl.save(e);
              } else {
                e.preventDefault();
              }
            } else {
              e.preventDefault();
            }
          },
          timezone: 'Etc/UTC',
          views: [{ type: 'day', workWeekEnd: 7 }],
        };
      };

      //#endregion

      //#region drag and drop

      // fires when provider is dropped on to the schedule, get the slot, room, and provider that was dropped
      $scope.dropped = function (e) {
        if ($scope.scheduler.resources[0].dataSource._data.length > 0) {
          var slot = $scope.scheduler.slotByPosition(
            e.clientX,
            e.clientY - e.offsetY + $(window).scrollTop()
          );
          var prov = listHelper.findItemByFieldValue(
            $scope.providers,
            'UserId',
            e.draggable.currentTarget[0].id
          );
          if (slot && prov) {
            slot.endDate = ctrl.getEndDate(slot.startDate);
            var roomId = $scope.scheduler.resourcesBySlot(slot).RoomId;
            var idealDayTemplateId =
              $scope.scheduler.resourcesBySlot(slot).IdealDayTemplateId;
            var providerId = prov.UserId;
            var title = prov.ProfessionalDesignation
              ? prov.FirstName +
                ' ' +
                prov.LastName +
                ', ' +
                prov.ProfessionalDesignation
              : prov.FirstName + ' ' + prov.LastName;
            $scope.scheduler.addEvent({
              title: _.escape(title),
              start: slot.startDate,
              end: slot.endDate,
              RoomId: roomId,
              IdealDayTemplateId: idealDayTemplateId,
              ProviderId: providerId,
              $$Provider: prov,
              color: prov.Color,
            });
          }
        }
      };

      // hint html, used by k-hint
      $scope.hint = function (element) {
        var clone = angular.element(element[0]).clone();
        clone.css({
          opacity: 0.75,
          width: '300px',
        });
        clone.attr({
          id: 'event-hint',
        });
        return clone;
      };

      //#endregion

      //#region ideal days templates

      $scope.manageIdealDays = function () {
        // check security
        if (ctrl.authIdealDaysMangementViewAccess()) {
          ctrl.openManageIdealDaysModal();
        }
      };

      // view access for ideal days
      ctrl.authIdealDaysMangementViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-sch-schidl-idlprv'
        );
      };

      // open the manage modal after ideal day templates are loaded
      ctrl.openManageIdealDaysModal = function () {
        if (
          ctrl.authIdealDaysMangementViewAccess() &&
          $scope.allowManageIdealDays
        ) {
          // open modal
          var modalInstance = modalFactory.Modal({
            templateUrl: 'App/Schedule/ideal-days/ideal-days.html',
            controller: 'IdealDaysController',
            amfa: 'soar-clin-cplan-icadd',
            backdrop: 'static',
            keyboard: false,
            windowClass: 'modal-65 .modal-dialog',
            resolve: {
              idealDayTemplates: function () {
                return $scope.idealDayTempates;
              },
              manageIdealDaysCallback: function () {
                return ctrl.onManageIdealDaysClose;
              },
            },
          });
          modalInstance.result.then(ctrl.successHandler);
        }
      };

      ctrl.onManageIdealDaysClose = function (hasChanges) {};

      ctrl.successHandler = function () {
        // on close of ideal days, refresh page
        ctrl.getProviderRoomOccurences();
      };

      //#endregion

      //#region ideal day templates dropdown

      ctrl.viewIdealDaysTempatesAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-sch-schidl-idlprv'
        );
      };

      ctrl.getIdealDayTemplates = function () {
        if (ctrl.viewIdealDaysTempatesAccess()) {
          idealDayTemplatesFactory.get().then(function (res) {
            $scope.idealDayTempates = res.Value;
            // allow user to view ideal days list
            $scope.allowManageIdealDays = true;
            // called from scheduler
            if ($scope.openIdealDays) {
              ctrl.openManageIdealDaysModal();
            }
          });
        }
      };

      // update local list when it changes
      $scope.updateTemplates = function (templates) {
        $scope.idealDayTempates = templates;
      };

      // add the ideal days dropdown to the scheduler event and set default to None on a new or to selected value on existing
      ctrl.addIdealDaysDropdown = function (e) {
        var container = e.container;
        container
          .find('[data-container-for=lunch_end]')
          .after(
            '<div data-container-for="IdealDayTemplateId" class="k-edit-field" >' +
              '<span class="k-dropdown k-header" role="listbox">' +
              '<select id="ideal_days_template" databind="value:IdealDayTemplateId" data-role="dropdownlist" ></select>' +
              '</span></div>'
          );
        container
          .find('[data-container-for=lunch_end]')
          .after(
            '<span class="k-edit-label"><label for="ideal_days_template">' +
              localize.getLocalizedString('Ideal Day Template') +
              '</label></span>'
          );
        container.find('#ideal_days_template').kendoDropDownList({
          dataTextField: 'Name',
          dataValueField: 'TemplateId',
          dataSource: $scope.idealDayTempates,
          optionLabel: localize.getLocalizedString('None'),
        });
        angular.element('#ideal_days_template').kendoDropDownList({
          value: e.event.IdealDayTemplateId ? e.event.IdealDayTemplateId : null,
        });
        ctrl.idealDaysTemplateDropDownList = angular
          .element('#ideal_days_template')
          .data('kendoDropDownList');
        // detect change to ideal day template and call method to set event IdealDayTemplateId
        ctrl.idealDaysTemplateDropDownList.bind('change', function () {
          ctrl.onIdealDaysTemplateChange(
            e,
            ctrl.idealDaysTemplateDropDownList.value()
          );
        });
        // add the link to view ideal day template
        container
          .find('[data-container-for=IdealDayTemplateId]')
          .after(
            '<div><a data-container-for="IdealDayTemplateIdLink" ' +
              ' class="k-link pull-right padding-right-20" ' +
              ' role="k-button" >' +
              localize.getLocalizedString('View') +
              '</a ></div > '
          );
        // call view method when link is clicked
        container
          .find('[data-container-for=IdealDayTemplateIdLink]')
          .bind('click', function () {
            $scope.viewIdealDay(e, e.event.IdealDayTemplateId);
          });
        ctrl.onIdealDaysTemplateChange(e, e.event.IdealDayTemplateId);
      };

      // view ideal day template
      $scope.viewIdealDay = function (e, idealDayTemplateId) {
        if (ctrl.authIdealDaysMangementViewAccess()) {
          idealDayTemplatesFactory
            .getById(idealDayTemplateId)
            .then(function (res) {
              var idealDaysTemplateDto = res.Value;
              ctrl.openViewIdealDaysModal(idealDaysTemplateDto);
            });
        }
      };

      // handle change to ideal day templateId including hide / show link
      ctrl.onIdealDaysTemplateChange = function (e, idealDaySelected) {
        e.event.IdealDayTemplateId = idealDaySelected ? idealDaySelected : null;
        if (!idealDaySelected) {
          e.container
            .find('[data-container-for=IdealDayTemplateIdLink]')
            .hide();
        } else {
          e.container
            .find('[data-container-for=IdealDayTemplateIdLink]')
            .show();
        }
      };

      //#endregion

      //#region view ideal day

      // open the view modal for selected template
      ctrl.openViewIdealDaysModal = function (idealDaysTemplate) {
        if (
          ctrl.authIdealDaysMangementViewAccess() &&
          $scope.allowManageIdealDays
        ) {
          // open modal
          var modalInstance = modalFactory.ModalOnTop({
            templateUrl:
              'App/Schedule/ideal-days/ideal-days-view/ideal-days-view.html',
            controller: 'IdealDaysViewController',
            amfa: 'soar-clin-cplan-icview',
            backdrop: 'static',
            keyboard: false,
            windowClass: '.modal-dialog ideal-days-template-z-index',
            resolve: {
              practiceSettings: function () {
                return practiceSettings;
              },
              appointmentTypes: function () {
                return $scope.appointmentTypes;
              },
              idealDaysTemplate: function () {
                return idealDaysTemplate;
              },
            },
          });
          modalInstance.result.then(ctrl.closeModalHandler);
        }
      };

      ctrl.closeModalHandler = function () {
        $scope.selectedIdealDaysTemplateId = null;
      };

      ctrl.viewAppointmentTypesAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-sch-sapttp-view'
        );
      };

      ctrl.getAppointmentTypes = function () {
        if (ctrl.viewAppointmentTypesAccess()) {
          $scope.appointmentTypes = referenceDataService.get(
            referenceDataService.entityNames.appointmentTypes
          );
        }
      };

      //#endregion

      //#region Provider Occurrences

      $scope.showProviderOccurrences = function () {
        // check security
        if (ctrl.authProviderOccurrencesViewAccess()) {
          ctrl.openProviderOccurrencesModal();
        }
      };

      // view access for provider occurrences
      ctrl.authProviderOccurrencesViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          'soar-sch-sprvhr-view'
        );
      };

      // open modal to show provider occurrences
      ctrl.openProviderOccurrencesModal = function () {
        if (ctrl.authProviderOccurrencesViewAccess()) {
          // open modal
          modalFactory.Modal({
            templateUrl:
              'App/Schedule/provider-occurrences/provider-occurrences.html',
            controller: 'ProviderOccurrencesController',
            amfa: 'soar-sch-sprvhr-view',
            backdrop: 'static',
            keyboard: false,
            windowClass: 'modal-65 .modal-dialog',
            resolve: {
              providers: function () {
                return $scope.providers;
              },
              currentLocation: function () {
                return $scope.currentLocation;
              },
              rooms: function () {
                return ctrl.rooms;
              },
            },
          });
        }
      };

      //#endregion

      //#region showOnSchedule

      // filter list of providers for dropdown
      $scope.setProvidersWithShowOnActive = function () {
        $scope.providersWithShowOnActive = $filter('filter')($scope.providers, {
          ShowOnSchedule: true,
        });
      };

      // get matching user from original provider list
      ctrl.findMatchingProvider = function (prov) {
        var provider = $filter('filter')($scope.providers, function (u) {
          return u.UserId === prov.UserId;
        });
        return provider.length > 0 ? provider[0] : null;
      };

      // set the ShowOnScheduleExceptions
      ctrl.setProviderShowOnScheduleExceptionDto = function (prov, exception) {
        // get original provider instance
        var provider = ctrl.findMatchingProvider(prov);

        if (provider) {
          provider.ShowOnScheduleException = exception;
        }

        prov.ShowOnSchedule = exception.ShowOnSchedule;
      };

      ctrl.getProviderShowOnScheduleExceptionDto = function (prov) {
        // get default ProviderShowOnScheduleExceptionDto
        var providerShowOnScheduleExceptionDto =
          providerShowOnScheduleFactory.providerShowOnScheduleExceptionDto(
            prov.UserId,
            $scope.currentLocation.id
          );
        // get original provider instance
        var provider = ctrl.findMatchingProvider(prov);
        // if provider has ShowOnScheduleExceptions use this dto
        if (provider && provider.ShowOnScheduleException) {
          providerShowOnScheduleExceptionDto = angular.copy(
            provider.ShowOnScheduleException
          );
        }
        // toggle the value of the ShowOnSchedule
        providerShowOnScheduleExceptionDto.ShowOnSchedule =
          !providerShowOnScheduleExceptionDto.ShowOnSchedule;
        return providerShowOnScheduleExceptionDto;
      };

      // user toggles show on schedule
      $scope.toggleShowOnSchedule = function (prov) {
        var access = providerShowOnScheduleFactory.access();
        // load ProviderShowOnScheduleExceptionDto
        var providerShowOnScheduleExceptionDto =
          ctrl.getProviderShowOnScheduleExceptionDto(prov);
        providerShowOnScheduleExceptionDto.ShowOnSchedule =
          !prov.ShowOnSchedule;
        // persist
        providerShowOnScheduleFactory
          .save(prov.UserId, providerShowOnScheduleExceptionDto)
          .then(function (res) {
            // reload the providerShowOnScheduleExceptionDto.ShowOnSchedule
            ctrl.setProviderShowOnScheduleExceptionDto(prov, res.Value);
            $scope.setProvidersWithShowOnActive();
          });
      };

      // disable drag and drop if not ShowOnSchedule
      $scope.onDragStart = function (e) {
        var prov = listHelper.findItemByFieldValue(
          $scope.providers,
          'UserId',
          e.currentTarget[0].id
        );
        if (prov.ShowOnSchedule === false) {
          e.preventDefault();
        }
      };

      //#endregion

      //#region provider dropdown

      // handle change to provider dropdownlist
      ctrl.onProviderChange = function (e, userId) {
        var prov = listHelper.findItemByFieldValue(
          $scope.providers,
          'UserId',
          userId
        );
        if (prov) {
          e.event.$$Provider = prov;
          e.event.color = prov.Color;
          e.event.title = prov.ProfessionalDesignation
            ? prov.FirstName +
              ' ' +
              prov.LastName +
              ', ' +
              prov.ProfessionalDesignation
            : prov.FirstName + ' ' + prov.LastName;
          e.container
            .prev()
            .find('.k-window-title')
            .text(
              localize.getLocalizedString('Provider Hours for') +
                ' ' +
                e.event.title
            );
          // make sure the save button is enabled
          e.container
            .find('.k-scheduler-update')
            .removeClass('k-state-disabled');
        } else {
          // user has not selected a valid provider -disable the save button until we do
          e.container.find('.k-scheduler-update').addClass('k-state-disabled');
        }
        e.event.UserId = userId ? userId : null;
      };

      // add the provider dropdown to the scheduler event and set default to None
      ctrl.addProvidersDropdown = function (e) {
        var container = e.container;

        // filter out providers that can't be show on schedule
        var showOnScheduleProviders = $filter('filter')($scope.providers, {
          ShowOnSchedule: true,
        });

        container
          .find('.k-edit-label')
          .first()
          .before(
            '<div data-container-for="ProviderId" class="k-edit-field" >' +
              '<span class="k-dropdown k-header" role="listbox">' +
              '<select id="providers_template" databind="value:ProviderId" data-role="dropdownlist" ></select>' +
              '</span></div>'
          );
        container
          .find('[data-container-for=ProviderId]')
          .before(
            '<span class="k-edit-label"><label for="providers_template">' +
              localize.getLocalizedString('Provider') +
              '*</label></span>'
          );
        container.find('#providers_template').kendoDropDownList({
          dataTextField: 'FullName',
          dataValueField: 'UserId',
          dataSource: showOnScheduleProviders,
          optionLabel: localize.getLocalizedString('None'),
        });
        angular.element('#providers_template').kendoDropDownList({
          value: e.event.ProviderId ? e.event.ProviderId : null,
        });
        ctrl.providersDropDownList = angular
          .element('#providers_template')
          .data('kendoDropDownList');

        // detect change to providers and call method to set event $$Provider
        ctrl.providersDropDownList.bind('change', function () {
          ctrl.onProviderChange(e, ctrl.providersDropDownList.value());
        });
        ctrl.onProviderChange(e, e.event.ProviderId);
        // trigger start date change to set the lunch time enabled / disabled since it could be outside of the range of start date - end date
        ctrl.startDateTimePicker.trigger('change');
      };

      //#endregion

      //#region breadcrumb

      ctrl.buildBreadcrumb = function () {
        if ($scope.source === 'practiceSettings') {
          $scope.breadCrumbs = [
            {
              name: localize.getLocalizedString('Practice Settings'),
              path: '/BusinessCenter/PracticeSettings/',
            },
            {
              name: localize.getLocalizedString('Provider Hours'),
              path: '/Schedule/ProviderHours/',
            },
          ];
        } else {
          $scope.breadCrumbs = [
            {
              name: localize.getLocalizedString('Schedule'),
              path: '/Schedule/',
            },
            {
              name: localize.getLocalizedString('Provider Hours'),
              path: '/Schedule/ProviderHours/',
            },
          ];
        }
      };

      // handle URL  for breadcrumbs
      $scope.changePath = function (breadcrumb) {
        // Jump to parent
        $location.url(_.escape(breadcrumb.path));
      };

      ctrl.previousOccurrence = function (startTime) {
        var occurrenceStartTime = timeZoneFactory.ConvertDateTZ(
          startTime,
          $scope.currentLocation.timezone
        );
        var startOfDay = timeZoneFactory.ConvertDateTZ(
          ctrl.today,
          $scope.currentLocation.timezone
        );
        return occurrenceStartTime < startOfDay ? true : false;
      };

      // tooltip for when a user is blocked from editing or removing an occurrence or series because of it being in the past
      // conditionally hide based on date of event
      ctrl.createTooltipOptions = function () {
        return {
          filter: '.k-event',
          position: 'top',
          width: '200px',
          content: function (e) {
            var content = '';
            var slot = $scope.scheduler.slotByElement(e.target);
            if (ctrl.previousOccurrence(slot.startDate)) {
              var content = localize.getLocalizedString(
                'A past provider assignment cannot be edited or removed.'
              );
            }
            return content;
          },
          show: function (e) {
            if (this.content.text().length > 10) {
              this.content.parent().css('visibility', 'visible');
            } else {
              this.content.parent().css('visibility', 'hidden');
            }
          },
          hide: function (e) {
            this.content.parent().css('visibility', 'hidden');
          },
        };
      };

      //#endregion

      ctrl.$onInit();
    },
  ]);

providerHoursController.resolveProviderHoursControl = {
  locations: [
    'referenceDataService',
    function (referenceDataService) {
      return referenceDataService.get(
        referenceDataService.entityNames.locations
      );
    },
  ],
  practiceSettings: [
    'PracticesApiService',
    function (practicesApiService) {
        return practicesApiService
            .getPracticeSetting()
            .then(function (res) {
                return res.data.Value;
            });
    },
  ],
  providers: [
    'ProviderShowOnScheduleFactory',
    function (showOnScheduleFactory) {
      return showOnScheduleFactory.getProviderLocations(true);
    },
  ],
  providerRoomOccurences: [
    'ScheduleServices',
    'locationService',
    function (scheduleServices, locationService) {
      var currentLocation = locationService.getCurrentLocation();
      if (currentLocation && currentLocation.id) {
        return scheduleServices.ProviderRoomOccurrences.get({
          locationId: currentLocation.id,
          locationDate: moment().format('YYYY-MM-DD'),
        }).$promise;
      }
    },
  ],
  providerTypes: [
    'StaticData',
    function (staticData) {
      return staticData.ProviderTypes().then();
    },
  ],
  rooms: [
    'PracticesApiService',
    'locationService',
    function (practicesApiService, locationService) {
      var currentLocation = locationService.getCurrentLocation();
      if (currentLocation && currentLocation.id) {
        return practicesApiService
          .getRoomsByLocationId(currentLocation.id)
          .then();
      }
    },
  ],
  //rooms: ['ScheduleServices', 'locationService', function (scheduleServices, locationService) {
  //    var currentLocation = locationService.getCurrentLocation();
  //    if (currentLocation && currentLocation.id) {
  //        return scheduleServices.Dtos.TreatmentRooms.get({ LocationId: currentLocation.id }).$promise;
  //    }
  //}]
};
