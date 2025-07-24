'use strict';
var app = angular.module('Soar.Patient');

var patientAccountInsuranceWrapperController = app
    .controller('PatientAccountInsuranceWrapperController', [
        '$scope',
        'FeatureFlagService',
        'FuseFlag',
        'person',
        'currentPatient',
        'phones',
        function ($scope, featureFlagService, fuseFlag, person, currentPatient, phones) {

            $scope.person = person.Value;
            $scope.currentPatient = currentPatient;
            $scope.phones = phones;
        },
    ]);

// resolve

patientAccountInsuranceWrapperController.resolvePatientAccountInsuranceWrapperController = {
    currentPatient: [
      '$route',
      'PatientServices',
      function ($route, patientServices) {
        var id = $route.current.params.patientId;
  
        if (id) {
          return patientServices.Patients.get({
            Id: $route.current.params.patientId,
          }).$promise;
        } else {
          return {
            Value: {
              IsActive: true,
              ContactInformation: [],
              PatientGroups: [],
              CustomLabelValueDtos: [],
              PatientId: 0,
              IsPatient: true,
            },
          };
        }
      },
    ],
    phones: [
      '$route',
      'PatientServices',
      'SaveStates',
      function ($route, patientServices, saveStates) {
        var id = $route.current.params.patientId;
        if (id) {
          return patientServices.Contacts.get({
            Id: $route.current.params.patientId,
          }).$promise;
        } else {
          return {
            Value: {
              ContactId: null,
              PhoneNumber: '',
              TextOk: false,
              ObjectState: saveStates.None,
            },
          };
        }
      },
    ],
    person: [
      '$route',
      'PatientServices',
      'PersonFactory',
      function ($route, patientServices, personFactory) {
          var id = $route.current.params.patientId;
          // if id is same as ActivePatient.Profile.PatientId just use the ActivePatient
          if (
              id &&
              personFactory.ActivePatient &&
              personFactory.ActivePatient.Profile.PatientId === id
          ) {
              return { Value: personFactory.ActivePatient };
          }
          // otherwise if we have to retrieve this data, clear the personFactory.ActivePatient, HippaSummaries, and AccountOverview
          // the dashboard and patientHeader will reload these
          if (id) {
              personFactory.ClearActivePatient();
              return patientServices.Patients.dashboard({
                  patientId: $route.current.params.patientId,
              }).$promise;
          } else {
              return {
                  Value: {},
              };
          }
      },
  ],
  };