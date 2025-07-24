describe('ImagingFullscreenController ->', function () {    
    var scope, ctrl;
    var imagingMasterService, routeParams, sce, patientServices;

    beforeEach(module('Soar.Common'));
    beforeEach(module('Soar.Patient'));

    // create spies for services
    beforeEach(
        module('Soar.Patient', function ($provide) {
            imagingMasterService = {};
            $provide.value('ImagingMasterService', imagingMasterService);

            patientServices = {
                Patients: {
                    getWithoutAccount: jasmine.createSpy(),
                },
            };
            $provide.value('PatientServices', patientServices);
        })
    );

    // Create controller and scope
    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();

        routeParams = {};

        sce = {
            trustAsResourceUrl: jasmine.createSpy().and.callFake(val => `sce_${val}`),
        };

        ctrl = $controller('ImagingFullscreenController', {
            $scope: scope,
            $routeParams: routeParams,
            $sce: sce,
        });
    }));

    it('should exist', function () {
        expect(ctrl).not.toBeNull();
    });

    describe('ctrl.init function ->', function () {
        var results;
        beforeEach(function () {
            ctrl.error = jasmine.createSpy();

            results = {};
            imagingMasterService.getReadyServices = jasmine
                .createSpy()
                .and.returnValue({ then: cb => cb(results) });

            var patient = {
                Value: {
                    LastName: 'last',
                    FirstName: 'first',
                    Sex: 'gender',
                    DateOfBirth: 'birthdate',
                    Id: 'id',
                    PreferredLocation: 'primLocation',
                }
            };
            patientServices.Patients.getWithoutAccount = jasmine.createSpy().and.returnValue({ $promise: { then: cb => cb(patient) } });
        });

        describe('when routeParams.patient is null ->', function () {
            beforeEach(function () {
                routeParams = {};
            });

            it('should call ctrl.error', function () {
                ctrl.init();

                expect(ctrl.error).toHaveBeenCalled();
            });

            it('should not call imagingMasterService.getReadyServices', function () {
                ctrl.init();

                expect(imagingMasterService.getReadyServices).not.toHaveBeenCalled();
            });
        });

        describe('when routeParams.patient is "undefined" ->', function () {
            beforeEach(function () {
                routeParams.patient = 'undefined';
            });

            it('should call ctrl.error', function () {
                ctrl.init();

                expect(ctrl.error).toHaveBeenCalled();
            });

            it('should not call imagingMasterService.getReadyServices', function () {
                ctrl.init();

                expect(imagingMasterService.getReadyServices).not.toHaveBeenCalled();
            });
        });

        describe('when routeParams.patient is defined ->', function () {
            beforeEach(function () {
                routeParams.patient = 'patient';
                routeParams.imagingProvider = 'imagingProvider';
            });

            it('should call imagingMasterService.getReadyServices', function () {
                ctrl.init();

                expect(imagingMasterService.getReadyServices).toHaveBeenCalled();
            });

            describe('when imagingMasterService does not return data for routeParams.imagingProvider ->', function () {
                beforeEach(function () {
                    results[routeParams.imagingProvider + 'x'] = { status: 'ready' };
                });

                it('should call ctrl.error', function () {
                    ctrl.init();

                    expect(ctrl.error).toHaveBeenCalled();
                });
            });

            describe('when imagingMasterService returns not ready for routeParams.imagingProvider ->', function () {
                beforeEach(function () {
                    results[routeParams.imagingProvider] = { status: 'error' };
                });

                it('should call ctrl.error', function () {
                    ctrl.init();

                    expect(ctrl.error).toHaveBeenCalled();
                });
            });

            describe('when imagingMasterService returns ready for routeParams.imagingProvider ->', function () {
                var examUrl, patientUrl, getUrlResult, getPatientResult;
                beforeEach(function () {
                    examUrl = 'examUrl';
                    patientUrl = 'patientUrl';

                    getPatientResult = {};
                    imagingMasterService.getPatientByFusePatientId = jasmine
                        .createSpy()
                        .and.returnValue({ then: cb => cb(getPatientResult) });

                    getUrlResult = {};
                    imagingMasterService.getUrlForExamByPatientIdExamId = jasmine
                        .createSpy()
                        .and.returnValue({ then: cb => cb(getUrlResult) });
                    imagingMasterService.getUrlForPatientByExternalPatientId = jasmine
                        .createSpy()
                        .and.returnValue({ then: cb => cb(getUrlResult) });

                    results[routeParams.imagingProvider] = { status: 'ready' };

                    ctrl.error = jasmine.createSpy();
                });

                it('should call getPatientByFusePatientId', function () {
                    ctrl.init();

                    expect(
                        imagingMasterService.getPatientByFusePatientId
                    ).toHaveBeenCalledWith(
                        routeParams.patient,
                        routeParams.patient,
                        routeParams.imagingProvider
                    );
                });

                describe('getPatient callback ->', function () {
                    describe('when result contains data ->', function () {
                        var patient;
                        beforeEach(function () {
                            patient = {
                                LastName: 'last',
                                FirstName: 'first',
                                Gender: 'gender',
                                Birthdate: 'birthdate',
                                Id: 'id',
                                PreferredLocation: 'primLocation',
                            };
                            getPatientResult[routeParams.imagingProvider] = {
                                result: { Value: patient },
                            };
                        });

                        describe('when routeParams.exam is defined ->', function () {
                            beforeEach(function () {
                                routeParams.exam = 'exam';
                            });

                            it('should call imagingMasterService.getUrlForExamByPatientIdExamId with correct parameters', function () {
                                getUrlResult.result = patientUrl;

                                ctrl.init();

                                var expPatientData = {
                                    lastName: patient.LastName,
                                    firstName: patient.FirstName,
                                    gender: patient.Gender,
                                    birthDate: patient.Birthdate,
                                    primLocation: patient.PreferredLocation,
                                };
                                expect(
                                    imagingMasterService.getUrlForExamByPatientIdExamId
                                ).toHaveBeenCalledWith(
                                    routeParams.patient,
                                    routeParams.imagingProvider,
                                    routeParams.exam,
                                    expPatientData
                                );
                                expect(sce.trustAsResourceUrl).toHaveBeenCalledWith(patientUrl);
                                expect(scope.frameSource).toBe(`sce_${patientUrl}`);
                                expect(scope.showImaging).toBe(true);
                            });

                            it('should call ctrl.error when result contains no data', function () {
                                ctrl.init();

                                expect(ctrl.error).toHaveBeenCalled();
                            });
                        });

                        describe('when routParams.exam is null ->', function () {
                            beforeEach(function () {
                                routeParams.exam = null;
                            });

                            it('should call imagingMasterService.getUrlForPatientByExternalPatientId with correct parameters', function () {
                                getUrlResult.result = patientUrl;

                                ctrl.init();

                                var expPatientData = {
                                    lastName: patient.LastName,
                                    firstName: patient.FirstName,
                                    gender: patient.Gender,
                                    birthDate: patient.Birthdate,
                                    primLocation: patient.PreferredLocation,
                                };
                                expect(
                                    imagingMasterService.getUrlForPatientByExternalPatientId
                                ).toHaveBeenCalledWith(
                                    patient.Id,
                                    routeParams.patient,
                                    routeParams.imagingProvider,
                                    expPatientData
                                );
                                expect(sce.trustAsResourceUrl).toHaveBeenCalledWith(patientUrl);
                                expect(scope.frameSource).toBe(`sce_${patientUrl}`);
                                expect(scope.showImaging).toBe(true);
                            });

                            //it('should call imagingMasterService.getUrlForPatientByExternalPatientId with correct parameters', function () {
                            //    getUrlResult.result = patientUrl;

                            //    ctrl.init();

                            //    var expPatientData = {
                            //        lastName: patient.LastName,
                            //        firstName: patient.FirstName,
                            //        gender: patient.Gender,
                            //        birthDate: patient.Birthdate,
                            //    };
                            //    expect(
                            //        imagingMasterService.getUrlForPatientByExternalPatientId
                            //    ).toHaveBeenCalledWith(
                            //        patient.Id,
                            //        routeParams.patient,
                            //        routeParams.imagingProvider,
                            //        expPatientData
                            //    );
                            //    expect(sce.trustAsResourceUrl).toHaveBeenCalledWith(patientUrl);
                            //    expect(scope.frameSource).toBe(`sce_${patientUrl}`);
                            //    expect(scope.showImaging).toBe(true);
                            //});

                            it('should call methods and set scope.frameSource when result contains data', function () {
                                getUrlResult.result = patientUrl;

                                ctrl.init();
                            });

                            it('should call ctrl.error when result contains no data', function () {
                                ctrl.init();

                                expect(ctrl.error).toHaveBeenCalled();
                            });
                        });
                    });

                    describe('when result contains no data ->', function () {
                        it('should call ctrl.error', function () {
                            ctrl.init();

                            expect(ctrl.error).toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });

    describe('ctrl.error function ->', function () {
        it('should set scope.errorMessage', function () {
            scope.errorMessage = null;

            ctrl.error();

            expect(scope.errorMessage).not.toBeNull();
        });
    });
});
