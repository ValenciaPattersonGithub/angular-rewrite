(function () {
  'use strict';
  angular
    .module('Soar.Schedule')
    .service(
      'AppointmentViewDataLoadingService',
      appointmentViewDataLoadingService
    );

  appointmentViewDataLoadingService.$inject = [
    '$q',
    'toastrFactory',
    'AppointmentViewLoadingService',
    'PracticesApiService',
    'SchedulingApiService',
    'ProviderShowOnScheduleFactory',
    'PatientServices',
  ];

  function appointmentViewDataLoadingService(
    $q,
    toastrFactory,
    appointmentViewLoadingService,
    practicesApiService,
    schedulingApiService,
    providerShowOnScheduleFactory,
    patientServices
  ) {
    var service = this;

    service.getBlockDataFromOutSideOfTheSchedule = function (appointmentId) {
      let startUpPromises = [];

      startUpPromises.push(practicesApiService.getLocationsWithDetails(2135));
      startUpPromises.push(
        providerShowOnScheduleFactory.getProviderLocations(true)
      );

      // We will need to remove this and replace with a method that just gets you block appointment data.
      startUpPromises.push(
        patientServices.PatientAppointment.GetWithDetails({
          appointmentId: appointmentId,
          FillAppointmentType: true,
          FillLocation: true,
          FillPerson: true,
          FillProviders: true,
          FillRoom: true,
          FillProviderUsers: true,
          FillServices: true,
          FillServiceCodes: true,
        }).$promise
      );

      return loadBlockData(startUpPromises);
    };

    function loadBlockData(promises) {
      var defer = $q.defer();
      var promise = defer.promise;

      $q.all(promises).then(function (result) {
        let locations = result[0].data;
        let providersByLocation = result[1];
        let appointment = result[2].Value;

        let data = {
          locations: locations,
          providersByLocation: providersByLocation,
          appointment: appointment,
        };
        defer.resolve(data);
      });

      return promise;
    }

    // this method returns a promise.
    service.getViewData = function (dataItem, hasChanges, afterSaveEvent) {
      // load the appointment information then continue with the process to get all data the appointment view needs.
      appointmentViewLoadingService.loadAppointmentInformation(
        dataItem,
        hasChanges,
        afterSaveEvent
      );

      let startUpPromises = [];
      let state = {
        needsLocationAndProviderData: false,
        needsAppointmentData: false,
        needsPersonData: false,
      };

      // we need to grab data for this view in a performant fashion.
      // So setting up the calls for the data so that we are doing all the blocking items at the same time.
      // at this time we have 5 scenarios ... we need to flush out to ensure items are loaded and not double load items.
      let locations = appointmentViewLoadingService.loadedLocations;
      let providers = appointmentViewLoadingService.loadedProvidersByLocation;

      if (
        !locations ||
        locations.length === 0 ||
        !providers ||
        providers.length === 0
      ) {
        state.needsLocationAndProviderData = true;
        startUpPromises.push(practicesApiService.getLocationsWithDetails(2135));
        startUpPromises.push(
          providerShowOnScheduleFactory.getProviderLocations(true)
        );
      }

      let appointmentId = appointmentViewLoadingService.currentAppointmentId;
      if (appointmentId !== null && appointmentId !== undefined) {
        state.needsAppointmentData = true;
        startUpPromises.push(
          schedulingApiService.getAppointmentModalAndPatientData(appointmentId)
        );
        // run
        return loadViewData(startUpPromises, state);
      } else if (appointmentViewLoadingService.currentPerson) {
        state.needsPersonData = true;
        startUpPromises.push(
          schedulingApiService.getPatientDataForAppointmentModal(
            appointmentViewLoadingService.currentPerson
          )
        );
        // run
        return loadViewData(startUpPromises, state);
      } else {
        // new appointment no patient selected yet.
        return loadViewData(startUpPromises, state);
      }
    };

    function loadViewData(promises, state) {
      var defer = $q.defer();
      var promise = defer.promise;

      if (
        state.needsAppointmentData === false &&
        state.needsPersonData === false
      ) {
        // no calls are needed just load the data.
        if (state.needsLocationAndProviderData === true) {
          $q.all(promises).then(function (result) {
            appointmentViewLoadingService.loadedLocations = result[0].data;
            appointmentViewLoadingService.loadedProvidersByLocation = result[1];

            defer.resolve();
          });
        } else {
          defer.resolve();
        }
      } else {
        $q.all(promises).then(function (result) {
          if (state.needsLocationAndProviderData === true) {
            appointmentViewLoadingService.loadedLocations = result[0].data;
            appointmentViewLoadingService.loadedProvidersByLocation = result[1];

            if (state.needsAppointmentData === true) {
              appointmentViewLoadingService.currentAppointment = result[2];
            }

            if (state.needsPersonData === true) {
              appointmentViewLoadingService.currentPatient = result[2];
              appointmentViewLoadingService.currentPerson = result[2].PatientId;
            }
          } else {
            if (state.needsAppointmentData === true) {
              appointmentViewLoadingService.currentAppointment = result[0];
            }

            if (state.needsPersonData === true) {
              appointmentViewLoadingService.currentPatient = result[0];
              appointmentViewLoadingService.currentPerson = result[0].PatientId;
            }
          }

          defer.resolve();
        });
      }

      return promise;
    }

    return {
      getViewData: service.getViewData,
      getBlockDataFromOutSideOfTheSchedule:
        service.getBlockDataFromOutSideOfTheSchedule,
    };
  }
})();
