'use strict';

angular.module('Soar.Patient').controller('ImagingFullscreenController', [
    '$scope',
    '$routeParams',
    '$sce',
    'ImagingMasterService',
    'localize',
    'PatientServices',
    function ($scope, $routeParams, $sce, imagingMasterService, localize, patientServices) {
        var ctrl = this;        
        ctrl.init = function () {
            if ($routeParams.patient && $routeParams.patient !== 'undefined') {
                angular.element('body').attr('style', 'padding:0;');
                angular
                    .element('.view-container')
                    .attr('style', 'background-color:#fff;padding:0;');
                angular.element('.top-header').remove();
                angular.element('.feedback-container').remove();                


                imagingMasterService.getReadyServices().then(res => {
                    var imagingProvider = $routeParams.imagingProvider;
                    if (res[imagingProvider] && res[imagingProvider].status === 'ready') {
                        var patientId = $routeParams.patient;
                        patientServices.Patients.getWithoutAccount({ Id: $routeParams.patient })
                            .$promise.then(function (res) {
                                if (res && res.Value) {
                                    $scope.patientInfo = res.Value;
                                }

                                imagingMasterService
                                    .getPatientByFusePatientId(patientId, patientId, imagingProvider)
                                    .then(function (results) {
                                        var res =
                                            results && results[imagingProvider]
                                                ? results[imagingProvider].result
                                                : null;

                                        // TODO: unwrap apteryx return data in apteryx services
                                        if (
                                            res &&
                                            ((res.data &&
                                                res.data.Records &&
                                                res.data.Records.length > 0) ||
                                                res.Value)
                                        ) {
                                            var imagingPatient = res.data
                                                ? res.data.Records[0]
                                                : res.Value;
                                            
                                            var patientData = {
                                                lastName: $scope.patientInfo.LastName,
                                                firstName: $scope.patientInfo.FirstName,
                                                gender: $scope.patientInfo.Sex,
                                                birthDate: $scope.patientInfo.DateOfBirth,
                                                primLocation: $scope.patientInfo.PreferredLocation
                                            };                                            


                                            if ($routeParams.exam && $routeParams.exam !== 'undefined') {
                                                imagingMasterService
                                                    .getUrlForExamByPatientIdExamId(
                                                        patientId,
                                                        imagingProvider,
                                                        $routeParams.exam,
                                                        patientData
                                                    )
                                                    .then(function (res) {
                                                        if (res && res.result) {
                                                            $scope.frameSource = $sce.trustAsResourceUrl(
                                                                res.result
                                                            ); // Fusion TBD: use resourceUrlWhitelist
                                                            $scope.showImaging = true;
                                                            $scope.$digest();
                                                        } else {
                                                            ctrl.error();
                                                        }
                                                    });
                                            } else {
                                                imagingMasterService
                                                    .getUrlForPatientByExternalPatientId(
                                                        imagingPatient.Id,
                                                        patientId,
                                                        imagingProvider,
                                                        patientData
                                                    )
                                                    .then(function (res) {
                                                        if (res && res.result) {
                                                            $scope.frameSource = $sce.trustAsResourceUrl(
                                                                res.result
                                                            ); // Fusion TBD: use resourceUrlWhitelist
                                                            $scope.showImaging = true;
                                                            $scope.$digest();
                                                        } else {
                                                            ctrl.error();
                                                        }
                                                    });
                                            }
                                        } else {
                                            ctrl.error();
                                        }
                                    });
                            });
                    } else {
                        ctrl.error();
                    }
                });
            } else {
                ctrl.error();
            }
        };

        ctrl.error = function () {
            $scope.errorMessage = localize.getLocalizedString(
                'An error occurred. Please return to the previous tab and try again'
            );
        };

        ctrl.init();
    },
]);
