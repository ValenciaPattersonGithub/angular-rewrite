describe('account-note-factory-controller ->', function () {
    var accountNoteFactory,
        q,
        mockModalFactory,
        patientServices,
        mockReferenceDataService,
        mockTimeZoneFactory,
        mockToastrFactory,
        tabLauncher,
        patSecurityService,
        mockInsuranceErrorMessageGeneratorService;

    var refreshMethod, success;

    beforeEach(
        module('Soar.Patient', function ($provide) {
            mockToastrFactory = {
                success: jasmine.createSpy('toastrFactory.success'),
                error: jasmine.createSpy('toastrFactory.error'),
            };
            $provide.value('ToastrFactory', mockToastrFactory);

            mockInsuranceErrorMessageGeneratorService = {
                determineErrorMessages: jasmine
                    .createSpy('InsuranceErrorMessageGeneratorService.determineErrorMessages')
                    .and.returnValue({
                        primaryMessage: 'Primary Message',
                        detailMessage: 'Detail Message',
                    }),
            };
            $provide.value('InsuranceErrorMessageGeneratorService', mockInsuranceErrorMessageGeneratorService);


            mockReferenceDataService = {
                get: jasmine
                    .createSpy('mockReferenceDataService.get')
                    .and.returnValue([
                        { LocationId: 3, Timezone: 'Central Standard Time' },
                    ]),
                entityNames: {
                    locations: 'locations',
                },
            };
            $provide.value('referenceDataService', mockReferenceDataService);

            mockTimeZoneFactory = {
                ConvertDateToMomentTZ: jasmine
                    .createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
                    .and.callFake(function (date) {
                        return moment(date);
                    }),
                ConvertDateTZString: jasmine
                    .createSpy('mockTimeZoneFactory.ConvertDateTZString')
                    .and.callFake(function (date) {
                        return date;
                    }),
            };
            $provide.value('TimeZoneFactory', mockTimeZoneFactory);

            refreshMethod = function () { };

            mockModalFactory = {
                Modal: jasmine.createSpy('modalFactory.Modal').and.returnValue({
                    result: {
                        then: function () {
                            refreshMethod();
                        },
                    },
                }),
                ConfirmModal: jasmine
                    .createSpy('modalFactory.ConfirmModal')
                    .and.returnValue({
                        then: function (callback) {
                            callback();
                        },
                    }),
            };
            $provide.value('ModalFactory', mockModalFactory);

            tabLauncher = {
                launchNewTab: jasmine.createSpy(),
            };
            $provide.value('tabLauncher', tabLauncher);

            patientServices = {
                Patients: {
                    get: jasmine
                        .createSpy('patientServices.Patients.get')
                        .and.returnValue({
                            $promise: {
                                then: function (callback) {
                                    callback({
                                        Value: { PatientCode: 'DOEJO1' },
                                    });
                                },
                            },
                        }),
                },
                AccountNote: {
                    deleteAccountNote: jasmine
                        .createSpy('patientServices.AccountNote.deleteAccountNote')
                        .and.returnValue({
                            then: function (callback, failureCallback) {
                                if (success) callback();
                                else failureCallback();
                            },
                        }),
                    getByAccountNoteId: jasmine.createSpy(
                        'patientServices.AccountNote.getByAccountNoteId'
                    ),
                    create: jasmine
                        .createSpy('patientServices.AccountNote.create')
                        .and.returnValue({
                            $promise: {
                                then: function (callback, failureCallback) {
                                    if (success) callback();
                                    else failureCallback();
                                },
                            },
                        }),
                    update: jasmine
                        .createSpy('patientServices.AccountNote.update')
                        .and.returnValue({
                            $promise: {
                                then: function (callback, failureCallback) {
                                    if (success) callback();
                                    else failureCallback();
                                },
                            },
                        }),
                    getEraClaimByAccountNoteId: jasmine
                        .createSpy('patientServices.Patients.getEraClaimByAccountNoteId')
                        .and.returnValue({
                            $promise: {
                                then: function (callback) {
                                    callback({
                                        Value: {
                                            ClaimCommonId: 45,
                                        },
                                    });
                                },
                            },
                        }),
                },
                AccountStatementSettings: {
                    GetAccountStatementPdf: jasmine
                        .createSpy(
                            'patientServices.AccountStatementSettings.GetAccountStatementPdf'
                        )
                        .and.returnValue({
                            then: function () { },
                        }),
                },
            };
            $provide.value('PatientServices', patientServices);

            patSecurityService = {
                IsAuthorizedByAbbreviation: jasmine
                    .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                    .and.returnValue(true),
                logout: jasmine.createSpy('patSecurityService.logout'),
                generateMessage: jasmine.createSpy(
                    'patSecurityService.generateMessage'
                ),
            };
            $provide.value('patSecurityService', patSecurityService);
        })
    );

    beforeEach(inject(function ($injector) {
        accountNoteFactory = $injector.get('AccountNoteFactory');
        q = $injector.get('$q');
    }));

    describe('factory.openClaimNotes -> ', function () {
        it('should call the modal factory', function () {
            accountNoteFactory.openClaimNoteModal({ Status: 1 }, 4, 5, refreshMethod);
            expect(mockModalFactory.Modal).toHaveBeenCalled();
        });
    });

    describe('factory.getAccountNote -> ', function () {
        it('should throw toastr when not authorized', function () {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.returnValue(false);
            accountNoteFactory.getAccountNote(4);
            expect(
                patientServices.AccountNote.getByAccountNoteId
            ).not.toHaveBeenCalled();
            expect(patSecurityService.generateMessage).toHaveBeenCalled();
        });
        it('should call the API to get account note data', function () {
            accountNoteFactory.getAccountNote(4);
            expect(patientServices.AccountNote.getByAccountNoteId).toHaveBeenCalled();
        });
    });

    describe('factory.createAccountNote -> ', function () {
        it('should throw toastr when not authorized', function () {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.returnValue(false);
            accountNoteFactory.createAccountNote({}, refreshMethod);
            expect(
                patientServices.AccountNote.getByAccountNoteId
            ).not.toHaveBeenCalled();
            expect(patSecurityService.generateMessage).toHaveBeenCalled();
        });
        it('should call the API to get account note data', function () {
            accountNoteFactory.createAccountNote({}, refreshMethod);
            expect(patientServices.AccountNote.create).toHaveBeenCalled();
        });
    });

    describe('factory.editAccountNote -> ', function () {
        it('should throw toastr when not authorized', function () {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.returnValue(false);
            accountNoteFactory.editAccountNote({}, refreshMethod);
            expect(
                patientServices.AccountNote.getByAccountNoteId
            ).not.toHaveBeenCalled();
            expect(patSecurityService.generateMessage).toHaveBeenCalled();
        });
        it('should call the API to get account note data', function () {
            accountNoteFactory.editAccountNote({}, refreshMethod);
            expect(patientServices.AccountNote.update).toHaveBeenCalled();
        });
    });

    describe('factory.deleteAccountNote ->', function () {
        it('should throw toastr when not authorized', function () {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.returnValue(false);
            accountNoteFactory.deleteAccountNote(1, 100, refreshMethod);
            expect(
                patientServices.AccountNote.deleteAccountNote
            ).not.toHaveBeenCalled();
            expect(patSecurityService.generateMessage).toHaveBeenCalled();
        });
        it('should do nothing if type is two', function () {
            accountNoteFactory.deleteAccountNote(2, 100, refreshMethod);
            expect(
                patientServices.AccountNote.deleteAccountNote
            ).not.toHaveBeenCalled();
        });
        it('should call delete method after confirm modal', function () {
            accountNoteFactory.deleteAccountNote(1, 100, refreshMethod);
            expect(mockModalFactory.ConfirmModal).toHaveBeenCalledWith(
                'Delete Account Note',
                'Are you sure you want to delete this Account Note?',
                'Yes',
                'No'
            );
            expect(patientServices.AccountNote.deleteAccountNote).toHaveBeenCalled();
        });
    });

    describe('factory.viewEob', function () {
        var res;
        beforeEach(function () {
            res = [
                { Value: { PatientCode: 'DOEJO1' } },
                { Value: { ClaimCommonId: '45' } },
            ];
            q.all = jasmine.createSpy('q.all').and.callFake(function () {
                return {
                    then: function (callback) {
                        callback(res);
                    },
                };
            });
        });
        it('should throw toastr when not authorized', function () {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.returnValue(false);
            accountNoteFactory.viewEob(1, 2, 100);
            expect(q.all).not.toHaveBeenCalled();
            expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
            expect(patSecurityService.generateMessage).toHaveBeenCalled();
        });
        it('should call tabLauncher', function () {
            accountNoteFactory.viewEob(1, 2, 100);
            expect(q.all).toHaveBeenCalledWith([
                patientServices.Patients.get({ Id: 100 }).$promise,
                patientServices.AccountNote.getEraClaimByAccountNoteId({
                    personAccountNoteId: 2,
                }).$promise,
            ]);
            expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
                '#/BusinessCenter/Insurance/ERA/1/Claim/45?carrier=&patient=DOEJO1'
            );
        });
    });

    describe('factory.viewStatement ->', function () {
        it('should throw toastr when not authorized', function () {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.returnValue(false);
            accountNoteFactory.viewStatement(45);
            expect(
                patientServices.AccountStatementSettings.GetAccountStatementPdf
            ).not.toHaveBeenCalled();
            expect(patSecurityService.generateMessage).toHaveBeenCalled();
        });
        it('should call API to get statement', function () {
            var accountStatmentId = 45;
            accountNoteFactory.viewStatement(accountStatmentId);
            expect(
                patientServices.AccountStatementSettings.GetAccountStatementPdf
            ).toHaveBeenCalledWith(
                '_soarapi_/accounts/accountstatement/45/GetAccountStatementPdf'
            );
        });
    });
});
