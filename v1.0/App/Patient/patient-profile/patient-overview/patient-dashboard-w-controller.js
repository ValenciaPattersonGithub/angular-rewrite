'use strict';
var app = angular.module('Soar.Patient');

var patientDashboardWrapperController = app
    .controller('PatientDashboardWrapperController', [
        '$scope',
        'FeatureService',
        'person',
        'serviceCodes',
        function ($scope, featureService, person, serviceCodes) {
            var ctrl = this;

            // used to control whether to use converted view or not.
            $scope.useConverted = false;
            $scope.migrationFeatureFlagsLoaded = false;
            $scope.person = person.Value;
            $scope.serviceCodes = serviceCodes;
            $scope.activeTemplateUrl = {
                overview : "App/Patient/patient-profile/patient-overview/patient-overview.html",
                appointments : "App/Patient/patient-appointments/patient-appointments-tab.html",
                clinical : "App/Patient/patient-chart/patient-chart.html",
                summary : "App/Patient/patient-account/patient-account-options/patient-account-options.html",
                communication : "App/Patient/communication-center/communication-center.html"
            }

            //#region conversion feature control
            ctrl.getConversionFlags = function () {
                featureService
                    .isMigrationEnabled('NgMigration_PatientDashboard')
                    .then(function (res) {
                        $scope.useConverted = res;
                        $scope.migrationFeatureFlagsLoaded = true;
                    });
            };

            $scope.activeUrlPath = function (url) {
                $scope.activeUrlTab = url;
            };

            ctrl.getConversionFlags();
            //#endregion
        },
    ])
    .directive('patientDashboardTemplateOriginal', function () {
        return {
            restrict: 'E',
            scope: { person: '=', serviceCodes: '=' },
            templateUrl: 'App/Patient/patient-profile/patient-profile.html',
            controller: 'PatientDashboardController',
        };
    });
//#region Resolve
patientDashboardWrapperController.resolvePatientDashboardControl = {
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
    serviceCodes: [
        'referenceDataService',
        function (referenceDataService) {
            return referenceDataService
                .getData(referenceDataService.entityNames.serviceCodes)
                .then(function (res) {
                    return res;
                });
        },
    ],
    title: [
        '$route',
        function (route) {
            return route.current.params.Category;
        }
    ]
};
