'use strict';

var app = angular.module('Soar.Schedule');

var AppointmentTypesCrudController = app.controller(
  'AppointmentTypesCrudController',
  [
    '$scope',
    '$routeParams',
    'toastrFactory',
    'StaticData',
    'localize',
    'BoundObjectFactory',
    'ScheduleServices',
    'editAppointmentType',
    'appointmentTypes',
    '$uibModalInstance',
    '$uibModal',
    'ModalFactory',
    function (
      $scope,
      $routeParams,
      toastrFactory,
      staticData,
      localize,
      boundObjectFactory,
      scheduleServices,
      editAppointmentType,
      appointmentTypes,
      $uibModalInstance,
      $uibModal,
      modalFactory
    ) {
      $scope.appointmentTypeNameIsDuplicate = false;

      // fix for bug 27849
      $scope.$on('kendoWidgetCreated', function (event, widget) {
        if (widget.ns === '.kendoDropDownList') {
          widget.wrapper.on('keydown', function (e) {
            e.stopImmediatePropagation();
          });
        }
      });

      // initialize appointment types, provider types and minutes
      $scope.appointmentTypes = [];

      // inject "Performed By" provider type into the list
      var performedByLocalizedString =
        localize.getLocalizedString('- Performed By -');

      $scope.providerTypes = [
        { Name: performedByLocalizedString, Order: 0, ProviderTypeId: null },
      ];

      $scope.minutes = [];

      for (var i = 5; i < 996; i += 5) {
        $scope.minutes.push(i.toString());
      }

      $scope.appointmentTypeMinutes = $scope.minutes[0];

      if (editAppointmentType == null) {
        editAppointmentType = {
          AppointmentTypeId: null,
          Name: '',
          AppointmentTypeColor: '#FFFFFF',
          FontColor: '#000000',
          PerformedByProviderTypeId: '0',
          DefaultDuration: 5,
          UsualAmount: 0,
        };
      }

      // bind appointment type
      $scope.appointmentType = boundObjectFactory.Create(
        scheduleServices.Dtos.AppointmentType
      );
      $scope.appointmentType.Data = editAppointmentType;
      $scope.backupAppointmentType = angular.copy($scope.appointmentType.Data);

      // pass appointmentTypes from list
      $scope.appointmentTypes = appointmentTypes;

      $scope.appointmentTypeMinutes =
        $scope.appointmentType.Data.DefaultDuration;

      // get provider types
      $scope.onProviderTypesLoaded = function (res) {
        angular.forEach(res.Value, function (item) {
          // filter out everything but "Dentist" and "Hygienist" for now
          if (
            item.Name.toLowerCase() == 'dentist' ||
            item.Name.toLowerCase() == 'hygienist'
          ) {
            $scope.providerTypes.push(item);
          }
        });
      };

      staticData.ProviderTypes().then($scope.onProviderTypesLoaded);

      // if we have an id, we're editing instead of adding
      $scope.editMode = $scope.appointmentType.Data.AppointmentTypeId
        ? true
        : false;

      // check for duplicate appointment type name
      $scope.checkForAppointmentTypeNameDuplicate = function (appointmentType) {
        $scope.frmAppointmentTypesCrud.inpAppointmentTypeName.$setValidity(
          'uniqueName',
          true
        );
        $scope.appointmentTypeNameIsDuplicate = false;

        if ($scope.appointmentType.Data.Name) {
          angular.forEach($scope.appointmentTypes, function (item) {
            if (
              $scope.appointmentType.Data.Name.toLowerCase() ==
                item.Name.toLowerCase() &&
              $scope.appointmentType.Data.AppointmentTypeId !=
                item.AppointmentTypeId
            ) {
              $scope.frmAppointmentTypesCrud.inpAppointmentTypeName.$setValidity(
                'uniqueName',
                false
              );
              $scope.appointmentTypeNameIsDuplicate = true;
            }
          });
        }
      };

      // check if provider is valid
      $scope.checkIsProviderTypeValid = function (e) {
        var elem = angular.element('#inpAppointmentTypePerformedBy');
        var comboBox = elem.data('kendoComboBox');
        if (this.value() != null && this.selectedIndex == -1) {
          // User types in same string it doesn't know to refresh to null value.
          // Manually have to set it to 0 than to -1 to get expected result
          comboBox.select(0);
          comboBox.select(-1);
        }
      };

      $scope.$watch('appointmentType.Data.Name', function (nv, ov) {
        if (nv != ov && $scope.appointmentTypeNameIsDuplicate) {
          $scope.checkForAppointmentTypeNameDuplicate($scope.appointmentType);
        }
      });

      // save appointment type
      $scope.saveAppointmentType = function () {
        // check for duplicate appointment types first
        $scope.checkForAppointmentTypeNameDuplicate();

        $scope.appointmentType.Validate();

        // if we're valid and don't have a duplicate name, save
        if (
          $scope.appointmentType.Valid &&
          !$scope.appointmentTypeNameIsDuplicate
        ) {
          $scope.appointmentType.Save();
        }
      };

      $scope.closeModal = function () {
        $uibModalInstance.close($scope.appointmentType.Data);
      };

      // after save
      $scope.appointmentType.AfterSaveSuccess = $scope.closeModal;

      // close dialog on cancel
      $scope.showCancelModal = function () {
        modalFactory.CancelModal().then($scope.confirmCancel);
      };

      $scope.confirmCancel = function () {
        $uibModalInstance.dismiss();
      };

      $scope.cancelChanges = function () {
        var isStrNull =
          $scope.appointmentType.Data.PerformedByProviderTypeId == 'null';
        $scope.appointmentType.Data.PerformedByProviderTypeId = isStrNull
          ? null
          : $scope.appointmentType.Data.PerformedByProviderTypeId;

        var backup = JSON.stringify($scope.backupAppointmentType);
        var current = JSON.stringify($scope.appointmentType.Data);

        if (backup.toLowerCase() != current.toLowerCase()) {
          $scope.showCancelModal();
        } else {
          $uibModalInstance.dismiss();
        }
      };

      // color picker methods
      $scope.toggleAdvancedFontColorPicker = function () {
        $scope.editingFontColor = !$scope.editingFontColor;
        $scope.editingAppointmentColor = false;
      };

      $scope.toggleAdvancedAppointmentTypeColorPicker = function () {
        $scope.editingAppointmentColor = !$scope.editingAppointmentColor;
        $scope.editingFontColor = false;
      };

      // duration changed event - convert to hours/minutes
      $scope.appointmentTypeDurationChanged = function () {
        var duration = parseInt($scope.appointmentTypeMinutes);

        $scope.appointmentType.Data.DefaultDuration = duration;
      };

      // get default duration in hours and minutes
      // This method is used in a weird way on the view otherwise I would set up the code to get the value form the newAppointmentType service. ... need to think about this more.
      $scope.getDurationString = function (duration) {
        var durationString = '';

        if (duration) {
          var hours = Math.floor(duration / 60);

          var minutes = duration % 60;

          if (hours > 0) {
            durationString = durationString.concat(hours.toString());
            durationString = durationString.concat(':');
          } else {
            durationString = durationString.concat('0:');
          }

          if (minutes > 0) {
            if (minutes == 5) {
              durationString = durationString.concat('0');
            }

            durationString = durationString.concat(minutes.toString());
          } else {
            durationString = durationString.concat('00');
          }
        }

        return durationString;
      };
    },
  ]
);
