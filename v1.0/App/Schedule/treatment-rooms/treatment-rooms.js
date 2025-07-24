'use strict';

var app = angular.module('Soar.Schedule');

var TreatmentRoomControl = app.controller('TreatmentRoomsController', [
  '$scope',
  'ModalFactory',
  'ListHelper',
  'ScheduleServices',
  'toastrFactory',
  'patSecurityService',
  'locations',
  'localize',
  'LocationServices',
  '$location',
  '$routeParams',
  'PracticesApiService',
  function (
    $scope,
    modalFactory,
    listHelper,
    scheduleServices,
    toastrFactory,
    patSecurityService,
    locations,
    localize,
    locationServices,
    $location,
    $routeParams,
    practicesApiService
  ) {
    var ctrl = this;

    //#region Authorization

    ctrl.authViewAccess = function () {
      return patSecurityService.IsAuthorizedByAbbreviation(
        'soar-sch-stmtrm-view'
      );
    };

    ctrl.authAccess = function () {
      if (!ctrl.authViewAccess()) {
        toastrFactory.error(
          patSecurityService.generateMessage('soar-sch-stmtrm-view'),
          'Not Authorized'
        );
        event.preventDefault();
        $location.path('/');
      } else {
        $scope.hasViewAccess = true;
      }
    };

    ctrl.authAccess();

    // #endregion

    //#region breadcrumb

    ctrl.buildBreadcrumb = function () {
      $scope.breadCrumbs = [
        {
          name: localize.getLocalizedString('Schedule'),
          path: '/Schedule/',
        },
        {
          name: localize.getLocalizedString('Treatment Rooms'),
          path: 'Schedule/Locations/TreatmentRooms/',
        },
      ];
    };

    $scope.changePath = function (breadcrumb) {
      $location.url(breadcrumb.path);
    };

    ctrl.buildBreadcrumb();

    //#endregion

    ctrl.selectedTreatmentRoom = null;

    $scope.treatmentRooms = [];
    $scope.locations = locations;

    $scope.orderBy = {
      field: 'Name',
      asc: true,
    };

    $scope.selectLocation = function (location) {
      $scope.selectedLocation = location;
      ctrl.getTreatmentRooms($scope.selectedLocation.LocationId);
      $scope.filterBy = '';
    };

    // function to apply orderBy functionality on grid
    $scope.changeSortingForGrid = function (field) {
      var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : true;
      $scope.orderBy = { field: field, asc: asc };
    };

    $scope.createTreatmentRoom = function (treatmentRoom) {
      if (treatmentRoom) {
        // Prepare Edit
        ctrl.selectedTreatmentRoom = treatmentRoom;
      } else {
        // Prepare Add
        ctrl.selectedTreatmentRoom = {
          Name: null,
          LocationId: $scope.selectedLocation.LocationId,
        };
      }

      modalFactory
        .Modal({
          templateUrl:
            'App/Schedule/treatment-rooms/treatment-room-add/treatment-room-add.html',
          controller: 'TreatmentRoomAddController',
          size: 'lg',
          windowClass: 'center-modal',
          backdrop: 'static',
          keyboard: false,
          amfa: treatmentRoom ? 'soar-sch-stmtrm-edit' : 'soar-sch-stmtrm-add',
          resolve: {
            treatmentRoom: function () {
              return angular.copy(ctrl.selectedTreatmentRoom);
            },
            treatmentRooms: function () {
              return $scope.treatmentRooms;
            },
          },
        })
        .result.then(ctrl.updateTreatmentRooms);
    };

    ctrl.updateTreatmentRooms = function (value) {
      if (value) {
        if (ctrl.selectedTreatmentRoom.Name != null) {
          var index = listHelper.findIndexByFieldValue(
            $scope.treatmentRooms,
            'RoomId',
            ctrl.selectedTreatmentRoom.RoomId
          );
          $scope.treatmentRooms.splice(index, 1, value);
        } else {
          $scope.treatmentRooms.push(value);
        }
        ctrl.selectedTreatmentRoom = null;
      }
    };

    //#region get rooms

    ctrl.getTreatmentRooms = function (id) {
      practicesApiService
        .getRoomsByLocationId(id)
        .then(ctrl.GetRoomsOnSuccess, ctrl.GetRoomsOnError);
      //scheduleServices.Dtos.TreatmentRooms.get({ LocationId: id }, ctrl.GetRoomsOnSuccess, ctrl.GetRoomsOnError);
    };

    ctrl.GetRoomsOnSuccess = function (res) {
      //debugger;
      $scope.treatmentRooms = res.data;
      //$scope.treatmentRooms = res.Value;
    };

    ctrl.GetRoomsOnError = function () {
      $scope.treatmentRooms = [];
      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again',
          ['treatment rooms']
        ),
        'Error'
      );
    };

    //#endregion

    //#region delete room

    ctrl.getAppointmentsByRoom = function (id) {
      locationServices.getRoomScheduleStatus(
        { locationId: $scope.selectedLocation.LocationId },
        ctrl.AppointmentsGetOnSuccess,
        ctrl.AppointmentsGetOnError
      );
    };

    ctrl.AppointmentsGetOnSuccess = function (res) {
      if (res && res.Value) {
        var roomScheduleStatus = listHelper.findItemByFieldValue(
          res.Value,
          'RoomId',
          ctrl.selectedTreatmentRoom.RoomId
        );
        if (roomScheduleStatus) {
          if (
            roomScheduleStatus.HasRoomAppointments ||
            roomScheduleStatus.HasProviderRoomOccurrences
          ) {
            modalFactory
              .DeleteModal(
                'treatment room',
                'has provider scheduled open time and/or scheduled appointments',
                false
              )
              .then(ctrl.cancelDelete);
          } else {
            modalFactory
              .DeleteModal('treatment room', ctrl.selectedTreatmentRoom.Name)
              .then(ctrl.confirmDelete, ctrl.cancelDelete);
          }
        }
      }
    };

    ctrl.AppointmentsGetOnError = function () {
      ctrl.cancelDelete();

      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to retrieve the list of {0}. Refresh the page to try again',
          ['appointments for the treatment room']
        ),
        'Error'
      );
    };

    $scope.deleteTreatmentRoom = function (treatmentRoom) {
      ctrl.selectedTreatmentRoom = treatmentRoom;

      ctrl.getAppointmentsByRoom(treatmentRoom.RoomId);
    };

    ctrl.confirmDelete = function () {
      var params = {
        LocationId: ctrl.selectedTreatmentRoom.LocationId,
        RoomId: ctrl.selectedTreatmentRoom.RoomId,
      };

      scheduleServices.Dtos.TreatmentRooms.delete(
        params,
        ctrl.TreatmentRoomsDeleteOnSuccess,
        ctrl.TreatmentRoomsDeleteOnError
      );
    };

    ctrl.cancelDelete = function () {
      ctrl.selectedTreatmentRoom = null;
    };

    ctrl.TreatmentRoomsDeleteOnSuccess = function () {
      var index = listHelper.findIndexByFieldValue(
        $scope.treatmentRooms,
        'RoomId',
        ctrl.selectedTreatmentRoom.RoomId
      );
      $scope.treatmentRooms.splice(index, 1);
      ctrl.selectedTreatmentRoom = null;

      toastrFactory.success(
        localize.getLocalizedString('Successfully deleted the {0}.', [
          'treatment room',
        ]),
        'Success'
      );
    };

    ctrl.TreatmentRoomsDeleteOnError = function () {
      ctrl.selectedTreatmentRoom = null;

      toastrFactory.error(
        localize.getLocalizedString(
          'Failed to delete the {0}. Please try again.',
          ['treatment room']
        ),
        'Error'
      );
    };

    //#endregion
    // auto-selecting location if we get the param, otherwise just selecting the first one in the list
    if ($routeParams.locationId) {
      var index = listHelper.findIndexByFieldValue(
        $scope.locations,
        'LocationId',
        $routeParams.locationId
      );
      if (index !== -1) {
        $scope.selectLocation($scope.locations[index]);
      }
    } else if ($scope.locations.length > 0) {
      $scope.selectLocation($scope.locations[0]);
    }
  },
]);

TreatmentRoomControl.resolveTreatmentRoomControl = {
  locations: [
    '$route',
    'referenceDataService',
    function ($route, referenceDataService) {
      return referenceDataService.get(
        referenceDataService.entityNames.locations
      );
    },
  ],
};
