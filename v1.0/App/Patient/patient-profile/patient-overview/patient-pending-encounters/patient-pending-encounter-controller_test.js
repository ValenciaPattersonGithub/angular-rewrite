describe('PatientPendingEncounterController ->', function () {
    var ctrl,
        scope,
        rootScope,
        filter,
        location,
        toastrFactory,
        timeout,
        patSecurityService,
        referenceDataService,
        mockLocalize,
        personFactory,
        accountSummaryFactory,
        accountSummaryDeleteFactory,
        routeParams,
        patientSummaryFactory;

    beforeEach(module('Soar.Common'));
    beforeEach(module('common.factories'));
    beforeEach(module('Soar.Patient'));

    var $q;
    beforeEach(inject(function ($rootScope, $controller, _$q_) {
        $q = _$q_;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        scope.patient = {
            PatientId: 1,
            PersonAccount: {
                AccountId: 1,
                PersonAccountMember: { AccountId: 1, AccountMemberId: 1 },
            },
        };

        sessionStorage.setItem('userLocation', JSON.stringify({ id: 1 }));

        patientSummaryFactory = {
            changeCheckoutEncounterLocation: jasmine.createSpy(),
            canCheckoutAllEncounters: jasmine.createSpy(),
        };

        referenceDataService = {
            getData: jasmine
                .createSpy('referenceDataService.getData')
                .and.returnValue($q.resolve([{ LocationId: 1 }])),
            entityNames: {},
        };

        mockLocalize = {
            getLocalizedString: jasmine
                .createSpy('localize.getLocalizedString')
                .and.callFake(function (text, params) {
                    if (params) {
                        for (var i = 0; i < params.length; i++) {
                            text = text.replace('{' + i + '}', params[i]);
                        }
                    }
                    return text;
                }),
        };

        routeParams = {
            patientId: 'q234q-3giqu-4qjk2-5lk12',
            accountId: '12313',
            encounterId: '122',
            route: 'Checkout',
            location: 1,
            overrideLocation: false,
        };

        personFactory = {
            AccountMemberDetails: jasmine.createSpy().and.returnValue({
                then: jasmine.createSpy(),
            }),
            ActiveAccountOverview: {
                AccountMembersProfileInfo: [{ AccountMemberId: 1 }],
            },
            observeActiveAccountOverview: jasmine
                .createSpy()
                .and.returnValue(function () { }),
        };

        toastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error'),
        };

        var mockPendingEncounterResult = [{ AccountMemberId: 1, Date: '2019-01-01' }];
        accountSummaryFactory = {
            getPendingEncounters: jasmine
                .createSpy('accountSummaryFactory.getPendingEncounters')
                .and.returnValue($q.resolve(mockPendingEncounterResult)),
            getEncounterDetails: jasmine.createSpy(
                'accountSummaryFactory.getEncounterDetails'
            ),
        };

        accountSummaryDeleteFactory = {
            deleteAccountSummaryRowDetail: jasmine.createSpy(
                'accountSummaryDeleteFactory.deleteAccountSummaryRowDetail'
            ),
        };

        filter = function () {
            return function (obj) {
                return obj;
            };
        };
        patSecurityService = {
            IsAuthorizedByAbbreviationAtLocation: jasmine
                .createSpy('')
                .and.returnValue(true),
            IsAuthorizedByAbbreviation: jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.callFake(function () {
                    return true;
                }),
            generateMessage: jasmine.createSpy('patSecurityService.generateMessage'),
        };

        location = {
            path: jasmine.createSpy('location.path'),
            url: jasmine.createSpy('location.url'),
        };

        ctrl = $controller('PatientPendingEncounterController', {
            $scope: scope,
            $rootScope: rootScope,
            $filter: filter,
            $location: location,
            localize: mockLocalize,
            toastrFactory: toastrFactory,
            $timeout: timeout,
            patSecurityService: patSecurityService,
            PersonFactory: personFactory,
            referenceDataService: referenceDataService,
            AccountSummaryFactory: accountSummaryFactory,
            AccountSummaryDeleteFactory: accountSummaryDeleteFactory,
            PatientSummaryFactory: patientSummaryFactory,
            $routeParams: routeParams,
        });


        scope.$apply();
    }));

    afterAll(function () {
        sessionStorage.clear();
    });

    describe('initialize ->', function () {
        it('controller should exist', function () {
            expect(ctrl).toBeDefined();
            expect(scope.noDeleteAccessTooltipMessage).toBe(
                'You do not have permission to Delete encounters at the service location.'
            );
            rootScope.$digest();
            expect(ctrl.allPendingEncounters.length).toEqual(1);
            expect(scope.PendingEncounters.length).toEqual(1)
            expect(scope.sectionTitle).toBe('Pending Encounters  (1)');
        });
    });

    describe('scope.getRowDetails', function () {
        it('should call getEncounterDetails if not retrieved', function () {
            var row = {};
            scope.getRowDetails(row);
            expect(row.showDetail).toEqual(true);
            expect(accountSummaryFactory.getEncounterDetails).toHaveBeenCalled();
        });


        it('should not call getEncounterDetails if already retrieved', function () {
            var row = { retrieved: true };
            scope.getRowDetails(row);
            expect(row.showDetail).toEqual(true);
            expect(accountSummaryFactory.getEncounterDetails).not.toHaveBeenCalled();
        });
    });

    describe('checkoutAllPendingEncounters ->', function () {
        it('should throw error if not authorized', function () {
            patSecurityService.IsAuthorizedByAbbreviation.and.callFake(function () {
                return false;
            });
            scope.checkoutAllPendingEncounters();
            scope.$apply();
            expect(toastrFactory.error).toHaveBeenCalled();
            expect(patSecurityService.generateMessage).toHaveBeenCalled();
            expect(location.path).toHaveBeenCalled();
        });
        it('should redirect if authorized', function () {
            spyOn(ctrl, 'setRouteParams').and.returnValue($q.resolve(routeParams));
            scope.checkoutAllIsAllowed = true;
            scope.checkoutAllPendingEncounters();
            scope.$apply();
            expect(toastrFactory.error).not.toHaveBeenCalled();
            expect(patSecurityService.generateMessage).not.toHaveBeenCalled();
            expect(
                patientSummaryFactory.changeCheckoutEncounterLocation
            ).toHaveBeenCalledWith(routeParams);
        });
        it('should call setRouteParams with Checkout/PatientOverview', function () {
            patSecurityService.IsAuthorizedByAbbreviation.and.callFake(function () {
                return true;
            });
            spyOn(ctrl, 'setRouteParams').and.callThrough();
            scope.checkoutAllIsAllowed = true;
            scope.checkoutAllPendingEncounters();
            scope.$apply();
            expect(ctrl.setRouteParams).toHaveBeenCalledWith(
                { $$locationId: undefined, ObjectId: null },
                'Checkout/PatientOverview'
            );
        });
    });

    describe('checkoutPendingEncounter  ->', function () {
        it('should throw error if not authorized', function () {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.callFake(function () {
                    return false;
                });
            scope.checkoutPendingEncounter({ ObjectId: 2 });
            scope.$apply();
            expect(toastrFactory.error).toHaveBeenCalled();
            expect(patSecurityService.generateMessage).toHaveBeenCalled();
            expect(location.path).toHaveBeenCalled();
        });
        it('should redirect if authorized', function () {
            // spyOn(ctrl, 'setRouteParams');
            scope.checkoutPendingEncounter({ ObjectId: 2 });
            scope.$apply();
            expect(toastrFactory.error).not.toHaveBeenCalled();
            expect(patSecurityService.generateMessage).not.toHaveBeenCalled();
            expect(
                patientSummaryFactory.changeCheckoutEncounterLocation
            ).toHaveBeenCalled();
        });
        it('should call setRouteParams with Checkout/PatientOverview', function () {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.callFake(function () {
                    return true;
                });
            spyOn(ctrl, 'setRouteParams').and.callThrough();
            scope.checkoutAllIsAllowed = true;
            scope.checkoutPendingEncounter({ ObjectId: 2 });
            scope.$apply();
            expect(ctrl.setRouteParams).toHaveBeenCalledWith(
                { ObjectId: 2 },
                'Checkout/PatientOverview'
            );
        });
    });

    describe('editEncounter ->', function () {
        it('should throw error if not authorized', function () {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.callFake(function () {
                    return false;
                });
            scope.editEncounter({ EncounterId: 2 });
            scope.$apply();
            expect(toastrFactory.error).toHaveBeenCalled();
            expect(patSecurityService.generateMessage).toHaveBeenCalled();
            expect(location.path).toHaveBeenCalled();
        });
        it('should redirect if authorized', function () {
            // spyOn(ctrl, 'setRouteParams');
            scope.editEncounter({ EncounterId: 2 });
            scope.$apply();
            expect(toastrFactory.error).not.toHaveBeenCalled();
            expect(patSecurityService.generateMessage).not.toHaveBeenCalled();
            expect(
                patientSummaryFactory.changeCheckoutEncounterLocation
            ).toHaveBeenCalled();
        });
        it('should call setRouteParams with Checkout/PatientOverview', function () {
            patSecurityService.IsAuthorizedByAbbreviation = jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.callFake(function () {
                    return true;
                });
            spyOn(ctrl, 'setRouteParams').and.callThrough();
            scope.checkoutAllIsAllowed = true;
            scope.editEncounter({ EncounterId: 2 });
            scope.$apply();
            expect(ctrl.setRouteParams).toHaveBeenCalledWith(
                { EncounterId: 2 },
                'EncountersCart/PatientOverview'
            );
        });
    });

    describe('deleteEncounter ->', function () {
        it('should call account summary factory method', function () {
            scope.deleteEncounter({ EncounterId: 2 });
            scope.$apply();
            expect(
                accountSummaryDeleteFactory.deleteAccountSummaryRowDetail
            ).toHaveBeenCalled();
        });
    });

    describe('ctrl.setRouteParams ->', function () {
        it('should set the route params when checkoutAllPendingEncounters is called', function () {
            scope.checkoutAllIsAllowed = true;
            spyOn(ctrl, 'setRouteParams').and.returnValue($q.resolve(routeParams));
            scope.checkoutAllPendingEncounters();
            scope.$apply();
            expect(ctrl.setRouteParams).toHaveBeenCalled();
            expect(
                patientSummaryFactory.changeCheckoutEncounterLocation
            ).toHaveBeenCalledWith(routeParams);
        });

        it('should set the route params when editEncounter is called', function () {
            spyOn(ctrl, 'setRouteParams').and.returnValue($q.resolve(routeParams));
            scope.editEncounter();
            scope.$apply();
            expect(ctrl.setRouteParams).toHaveBeenCalled();
            expect(
                patientSummaryFactory.changeCheckoutEncounterLocation
            ).toHaveBeenCalledWith(routeParams);
        });

        it('should set the route params when checkoutPendingEncounter is called', function () {
            spyOn(ctrl, 'setRouteParams').and.returnValue($q.resolve(routeParams));
            scope.checkoutPendingEncounter();
            scope.$apply();
            expect(ctrl.setRouteParams).toHaveBeenCalled();
            expect(
                patientSummaryFactory.changeCheckoutEncounterLocation
            ).toHaveBeenCalledWith(routeParams);
        });
    });
});
