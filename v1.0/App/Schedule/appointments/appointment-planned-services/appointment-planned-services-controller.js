(function () {
    'use strict';

    angular
        .module('Soar.Schedule')
        .controller(
            'AppointmentPlannedServicesController',
            AppointmentPlannedServicesController
        );

    AppointmentPlannedServicesController.$inject = [
        '$scope',
        '$rootScope',
        'patSecurityService',
        'ModalFactory',
        'localize',
        'ListHelper',
        'StaticData',
        'SurfaceHelper',
        'RootHelper',
        'UsersFactory',
        'AmfaKeys',
        'referenceDataService',
    ];

    function AppointmentPlannedServicesController(
        $scope,
        $rootScope,
        patSecurityService,
        modalFactory,
        localize,
        listHelper,
        staticData,
        surfaceHelper,
        rootHelper,
        usersFactory,
        AmfaKeys,
        referenceDataService
    ) {
        BaseCtrl.call(this, $scope, 'AppointmentPlannedServicesController');

        //#region Variables
        var ctrl = this;
        // need to ensure this is loaded early we need to move the location setup to the beginning of fuse but that is not simple and would take more time right now.
        // going try this for today instead.
        ctrl.locations = referenceDataService.get(
            referenceDataService.entityNames.locations
        );

        ctrl.location = JSON.parse(sessionStorage.getItem('userLocation'));
        ctrl.soarAuthServiceTransactionViewKey = AmfaKeys.SoarAcctActsrvView;
        ctrl.soarAuthServiceTransactionUpdateKey = AmfaKeys.SoarAcctActsrvEdit;
        $scope.hasServiceTransactionViewAccess = false;
        $scope.hasServiceTransactionUpdateAccess = false;
        $scope.today = new Date();
        $scope.defaultDay = function (service) {
            var toCheckValue = _.cloneDeep(service.DateModified);
            if (!(toCheckValue instanceof Date)) {
                toCheckValue = new Date(toCheckValue);
            }
            var defaultValue = _.cloneDeep($scope.today);
            toCheckValue.setHours(0, 0, 0, 0);
            defaultValue.setHours(0, 0, 0, 0);
            if (toCheckValue < defaultValue) {
                service.DateEntered = angular.copy($scope.today);
            }
        };
        $scope.providers = usersFactory.LoadedProviders.filter(function (serv) {
            var correct = false;
            _.forEach(serv.Locations, function (location) {
                if (location.LocationId == ctrl.location.id) {
                    correct = true;
                }
            });
            return serv.ProviderTypeId != 4 && correct;
        });

        ctrl.getTeethDefinitions = function () {
            staticData.TeethDefinitions().then(function (res) {
                if (res && res.Value && res.Value.Teeth) {
                    $scope.allTeeth = res.Value.Teeth;
                }
            });
        };
        ctrl.getTeethDefinitions();

        $scope.updateService = function (service, isSurface) {
            service.ObjectState = 'Update';
            $scope.getTotal();
            var needsTooth = false;
            if (service) {
                service.Tooth = service.Tooth
                    ? service.Tooth.replace(/^0+/, '').toUpperCase()
                    : service.Tooth;
                if (service.AffectedAreaId != 2)
                    service.Tooth = service.Tooth
                        ? service.Tooth.replace(/[^A-T0-9]/gi, '')
                        : service.Tooth;
                else
                    service.Tooth = service.Tooth
                        ? service.Tooth.replace(/[^UR|UL|LR|LL]/gi, '')
                        : service.Tooth;
            }
            if (
                angular.isDefined(service.AffectedAreaId) &&
                (service.AffectedAreaId == 4 || service.AffectedAreaId == 3)
            ) {
                if (angular.isDefined(service.Tooth)) {
                    if (service.Tooth.length <= 0 && isSurface) {
                        needsTooth = true;
                    } else {
                        needsTooth = false;
                    }
                } else {
                    if (service.AffectedAreaId == 4) {
                        needsTooth =
                            _.isDefined(service.Surface) && service.Surface.length > 0;
                    } else if (service.AffectedAreaId == 3) {
                        needsTooth = _.isDefined(service.Roots) && service.Roots.length > 0;
                    }
                }
                if (angular.isDefined(isSurface)) {
                    if (needsTooth) {
                        service.Surface = '';
                        service.Roots = '';
                    }
                }
            }
            service.isSurfaceEditing = true;
            service.invalidTooth = !ctrl.validateServiceCodeTooth(service);
            service.invalidSurface = !ctrl.validateServiceCodeSurface(service);
            service.invalidRoot = !ctrl.validateServiceCodeRoot(service);
        };

        ctrl.validateServiceCodeTooth = function (serviceTransaction) {
            if (serviceTransaction.AffectedAreaId == 1) {
                return true;
            } else if (serviceTransaction.AffectedAreaId != 2) {
                var tooth = listHelper.findItemByFieldValue(
                    $scope.allTeeth,
                    'USNumber',
                    serviceTransaction.Tooth
                );
                if (tooth) {
                    return true;
                } else {
                    return false;
                }
            }
            return true;
        };

        ctrl.validateServiceCodeSurface = function (serviceTransaction) {
            if (serviceTransaction) {
                var selectedTooth = serviceTransaction.Tooth;
                if (selectedTooth) {
                    var tooth = listHelper.findItemByFieldValue(
                        $scope.allTeeth,
                        'USNumber',
                        selectedTooth
                    );
                    if (tooth) {
                        return ctrl.setValidSelectedSurfaces(
                            serviceTransaction,
                            tooth.SummarySurfaceAbbreviations,
                            false
                        );
                    }
                }
                return false;
            }
            return false;
        };

        ctrl.validateServiceCodeRoot = function (serviceTransaction) {
            if (serviceTransaction) {
                var selectedTooth = serviceTransaction.Tooth;
                var tooth = listHelper.findItemByFieldValue(
                    $scope.allTeeth,
                    'USNumber',
                    selectedTooth
                );
                if (tooth) {
                    return ctrl.setValidSelectedRoots(
                        serviceTransaction,
                        tooth.RootAbbreviations,
                        $scope.isSaveButtonclicked
                    );
                }
                return true;
            }
            return true;
        };

        ctrl.setValidSelectedSurfaces = function (
            serviceTransaction,
            summarySurfaces,
            flag
        ) {
            return surfaceHelper.setValidSelectedSurfaces(
                serviceTransaction,
                summarySurfaces,
                flag
            );
        };

        ctrl.validateServiceCodeRoot = function (serviceTransaction) {
            if (serviceTransaction) {
                var selectedTooth = serviceTransaction.Tooth;
                var tooth = listHelper.findItemByFieldValue(
                    $scope.allTeeth,
                    'USNumber',
                    selectedTooth
                );
                if (tooth) {
                    return ctrl.setValidSelectedRoots(
                        serviceTransaction,
                        tooth.RootAbbreviations,
                        $scope.isSaveButtonclicked
                    );
                }
                return true;
            }
            return true;
        };

        ctrl.setValidSelectedRoots = function (
            serviceTransaction,
            RootAbbreviations,
            isSaveButtonclicked
        ) {
            return rootHelper.setValidSelectedRoots(
                serviceTransaction,
                RootAbbreviations,
                isSaveButtonclicked
            );
        };

        $scope.feeTotal = 0.0;
        // #endregion

        //#region Authorization

        // Check if logged in user has view access to service transactions
        ctrl.authViewAccessToServiceTransactions = function () {
            return patSecurityService.IsAuthorizedByAbbreviation(
                ctrl.soarAuthServiceTransactionViewKey
            );
        };

        // Check if logged in user has update access to service transactions
        ctrl.authUpdateAccessToServiceTransactions = function () {
            return patSecurityService.IsAuthorizedByAbbreviation(
                ctrl.soarAuthServiceTransactionUpdateKey
            );
        };

        // Check view access for displaying appointment services
        ctrl.authAccess = function () {
            if (ctrl.authViewAccessToServiceTransactions()) {
                $scope.hasServiceTransactionViewAccess = true;
            }
            if (ctrl.authUpdateAccessToServiceTransactions()) {
                $scope.hasServiceTransactionUpdateAccess = true;
            }
        };

        // Check view access for appointment services
        ctrl.authAccess();

        //#endregion

        //#region Functions

        // Returns the total fee of all the planned services for an appointment
        $scope.getTotal = function () {
            $scope.feeTotal = 0;
            if ($scope.plannedServices) {
                angular.forEach($scope.plannedServices, function (plannedService) {
                    $scope.feeTotal += plannedService.Amount
                        ? plannedService.Amount
                        : 0.0;

                    let ofcLocation = listHelper.findItemByFieldValue(
                        ctrl.locations,
                        'LocationId',
                        plannedService.LocationId
                    );
                    plannedService.LocationName = ofcLocation.NameLine1;
                });
            }
        };

        //#endregion

        // scope variable that holds ordering details
        $scope.orderBy = {
            field: 'Tooth',
            asc: true,
        };

        // function to apply orderBy functionality
        $scope.changeSortingForGrid = function (field) {
            var asc = $scope.orderBy.field === field ? !$scope.orderBy.asc : false;
            $scope.orderBy = { field: field, asc: asc };
        };

        //#region delete appointment service

        // Show user a confirmation message before proceeding to remove proposed service from appointment
        $scope.removeAppointmentService = function (service) {
            var message = localize.getLocalizedString(
                'Are you sure you want to remove {0} from appointment?',
                ['proposed service']
            );

            var title = localize.getLocalizedString('Remove Service');
            var buttonOkText = localize.getLocalizedString('Yes');
            var buttonCancelText = localize.getLocalizedString('No');

            modalFactory
                .ConfirmModal(title, message, buttonOkText, buttonCancelText, service)
                .then(ctrl.continueWithRemove);
        };

        // Proceed to remove proposed service from an appointment
        ctrl.continueWithRemove = function (service) {
            $scope.onRemoveService(service);
        };
        //#endregion

        //#region Startup Functions

        // Calculate total of Fee for all the planned services
        $scope.$watch('plannedServices', function (nv, ov) {
            $scope.getTotal();
        });

        $rootScope.$on('reloadProposedServices', function (event, plannedServices) {
            $scope.plannedServices.forEach((x, index) => {
                plannedServices.forEach((y) => {
                    if (x.ServiceTransactionId === y.ServiceTransactionId) {
                        Object.assign($scope.plannedServices[index], y);
                    }
                });
            });
            $scope.getTotal();
        });

        //#endregion
    }
    AppointmentPlannedServicesController.prototype = Object.create(BaseCtrl);
})();
