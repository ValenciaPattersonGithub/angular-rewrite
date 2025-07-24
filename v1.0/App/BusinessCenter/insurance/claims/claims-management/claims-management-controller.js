'use strict';

angular
    .module('Soar.BusinessCenter')
    .controller('ClaimsManagementController', [
        '$scope',
        '$window',
        'ClaimsService',
        'CommonServices',
        '$rootScope',
        '$filter',
        '$http',
        'toastrFactory',
        'localize',
        'PatientServices',
        '$sce',
        'ModalFactory',
        '$timeout',
        '$interval',
        '$location',
        'patSecurityService',
        'PatientLandingFactory',
        'locationService',
        'ListHelper',
        '$anchorScroll',
        'ReportsFactory',
        '$q',
        'ValidateClaimMessagesFactory',
        'userSettingsDataService',
        'PersonFactory',
        'PatientValidationFactory',
        'GlobalSearchFactory',
        'tabLauncher',
        'ClaimAlertHistoryModalService',
        'FeatureFlagService',
        'FuseFlag',
        '$uibModal',
        'InsuranceErrorMessageGeneratorService',
        'ViewClaimService',
        function (
            $scope,
            $window,
            claimService,
            commonServices,
            $rootScope,
            $filter,
            $http,
            toastrFactory,
            localize,
            patientServices,
            $sce,
            modalFactory,
            $timeout,
            $interval,
            $location,
            patSecurityService,
            patientLandingFactory,
            locationService,
            listHelper,
            $anchorScroll,
            reportsFactory,
            $q,
            validateClaimMessagesFactory,
            userSettingsDataService,
            personFactory,
            patientValidationFactory,
            globalSearchFactory,
            tabLauncher,
            claimAlertHistoryModalService,
            featureFlagService,
            fuseFlag,
            $uibModal,
            insuranceErrorMessageGeneratorService,
            viewClaimService
        ) {
            //TODO add predetermination auth
            var ctrl = this;
            $scope.isLoadingPdf = false;    
            $scope.submissionMethodOptions = [
                { name: 'eClaims - Dental', value: 1 },
                { name: 'ADA 2019 - Paper', value: 2 },
                { name: 'CMS 1500 - Paper', value: 3 },
            ];
            $scope.predSubmissionMethodOptions = [
                { name: 'eClaims - Dental', value: 1 },
                { name: 'ADA 2019 - Paper', value: 2 },
            ];
            $scope.submissionHistoryClaimStatusList = [ 4, 5, 6, 7, 8, 9 ];
            $scope.selectAll = false;
            $scope.isFilteredByCarrier = false;
            $scope.selectAllLabel = 'Select All';
            ctrl.window = null;
            $scope.claimInformation = patientServices.GetClaimInformation();
            ctrl.previousRow = { highlighted: false };
            ctrl.soarAuthInsPaymentViewKey = 'soar-acct-aipmt-view';
            ctrl.soarAuthClaimViewKey = 'soar-ins-iclaim-view';
            $scope.claimMgmtsLists = [];

            $scope.currentPage = 0;
            $scope.pageCount = 30;
            $scope.allDataDisplayed = false;
            ctrl.sortCriteria = { DateOfService: 1 };
            $scope.searchText = '';
            ctrl.sortOrder = 1;
            $scope.isUpdating = true;
            ctrl.resetGrid = false;
            $scope.submitButtonDisabled = false;
            $scope.enableClaimStatusHistory = false;
            ctrl.allowClaimAttachments = false;
            ctrl.claimAttachmentsDisabledMessage = '';
            ctrl.allowVendorEligibilityCheckForAttachmentDialog = false;
            $scope.enableEliminateStaleClaims = false;
            ctrl.modalSubscription;
            /***********************
             * Authorization Start
             ***********************/

            ctrl.authClaimViewAccess = function () {
                return patSecurityService.IsAuthorizedByAbbreviation(
                    ctrl.soarAuthClaimViewKey
                );
            };

            ctrl.authClaimEditAccess = function () {
                return patSecurityService.IsAuthorizedByAbbreviation(
                    'soar-ins-iclaim-edit'
                );
            };

            ctrl.authAccess = function () {
                if (!ctrl.authClaimViewAccess()) {
                    ctrl.notifyNotAuthorized($scope.soarAuthTrHxViewKey);
                } else {
                    $scope.hasViewAccess = true;
                }
            };

            $scope.hasPatientInsurancePaymentViewAccess = false;

            ctrl.authPatientInsurancePaymentViewAccess = function () {
                $scope.hasPatientInsurancePaymentViewAccess =
                    patSecurityService.IsAuthorizedByAbbreviation(
                        ctrl.soarAuthInsPaymentViewKey
                    );
            };

            ctrl.authPatientInsurancePaymentViewAccess();

            ctrl.notifyNotAuthorized = function (authMessageKey) {
                toastrFactory.error(
                    patSecurityService.generateMessage(authMessageKey),
                    'Not Authorized'
                );
                $location.path('/');
            };
            $scope.authRptpndclmViewAccess = function () {
                if (
                    patSecurityService.IsAuthorizedByAbbreviation(
                        'soar-report-ins-pndclm'
                    )
                ) {
                    return true;
                } else {
                    return false;
                }
            };
            $scope.authRptpndencViewAccess = function () {
                if (
                    patSecurityService.IsAuthorizedByAbbreviation(
                        'soar-report-pat-pndenc'
                    )
                ) {
                    return true;
                } else {
                    return false;
                }
            };
            ctrl.authAccess();

            //Initialize
            $scope.initialize = function () {
                // TODO Marking this now...after release of feature we will need to remove this
                ctrl.checkFeatureFlags();
                $scope.submittedStatuses = [
                    { Text: localize.getLocalizedString('Printed'), Value: 2 },
                    {
                        Text: localize.getLocalizedString('Accepted Electronic'),
                        Value: 5,
                    },
                    { Text: localize.getLocalizedString('In Process'), Value: 4 },
                    { Text: localize.getLocalizedString('Rejected'), Value: 6 },
                ];

                $scope.statuses = [
                    { Text: localize.getLocalizedString('Unsubmitted'), Value: 1 },
                    { Text: localize.getLocalizedString('Submitted'), Value: 2 },
                    { Text: localize.getLocalizedString('Claim Alerts'), Value: 3 },
                    { Text: localize.getLocalizedString('Closed'), Value: 4 },
                    { Text: localize.getLocalizedString('Closed - Paid'), Value: 5 },
                    { Text: localize.getLocalizedString('Received'), Value: 6 },
                ];

                $scope.submissionMethodList = [
                    {
                        Text: localize.getLocalizedString('All Submission Methods'),
                        Value: 4,
                        Selected: true,
                    },
                    { Text: localize.getLocalizedString('ADA 2019 - Paper'), Value: 2 },
                    { Text: localize.getLocalizedString('CMS 1500 - Paper'), Value: 3 },
                    { Text: localize.getLocalizedString('eClaims - Dental'), Value: 1 },
                ];

                $scope.carrierList = [{ CarrierName: 'All Carriers', Selected: true }];

                $scope.selectedCarriers = $scope.carrierList[0];
                $scope.selectedSubmissionMethods = $scope.submissionMethodList[0];

                $scope.filterProperties = {
                    selectedDateFilter: null,
                    selectedClaimPredoption:
                        $scope.claimInformation && $scope.claimInformation.predsOnly
                            ? '2'
                            : '3',
                    selectedLocations: [],
                    selectedSubmittedStatuses: $scope.submittedStatuses,
                    selectedGeneralStatuses: [
                        $scope.statuses[0],
                        $scope.statuses[1],
                        $scope.statuses[2],
                    ],
                };

                $scope.sortProp = {
                    field: 'MinServiceDate',
                    asc: false,
                };

                $scope.multiSortProp = ['minDate', '-PatientLastName'];

                ctrl.lastElement = angular
                    .element('#coldateOfService')
                    .addClass('active');
                ctrl.lastElement.find('span').addClass('fa-caret-down');
                ctrl.lastElement.find('span').removeClass('fa-sort');

                $scope.claimPredoptions = [
                    { Text: 'Claims', Value: 1 },
                    { Text: 'Predeterminations', Value: 2 },
                    { Text: 'Claims & Predeterminations', Value: 3 },
                ];

                $scope.maxDate = moment().add(100, 'years').startOf('day').toDate();

                $scope.submittedStatusList = new kendo.data.DataSource();
                $scope.submittedStatusList.data($scope.submittedStatuses);

                $scope.statusList = new kendo.data.DataSource();
                $scope.statusList.data($scope.statuses);
            };

            ctrl.checkFeatureFlags = async function () {
                featureFlagService.getOnce$(fuseFlag.EnableClaimStatusHistory).subscribe((value) => {
                    $scope.enableClaimStatusHistory = value ;
                });
                featureFlagService.getOnce$(fuseFlag.EClaimSubmissionDisabledMessage).subscribe((value) => {
                    ctrl.eclaimSubmissionDisabledMessage = value;
                });
                featureFlagService.getOnce$(fuseFlag.AllowClaimAttachments).subscribe((value) => {
                    ctrl.allowClaimAttachments = value;
                });
                featureFlagService.getOnce$(fuseFlag.ConfigureClaimAttachmentsDisabledMessage).subscribe((value) => {
                    ctrl.claimAttachmentsDisabledMessage = value;
                });
                featureFlagService.getOnce$(fuseFlag.AllowVendorEligibilityCheckForAttachmentDialog).subscribe((value) => {
                    ctrl.allowVendorEligibilityCheckForAttachmentDialog = value;
                });
                featureFlagService.getOnce$(fuseFlag.EnableEliminateStaleClaims).subscribe((value) => {
                    $scope.enableEliminateStaleClaims = value;
                });
            };

            $scope.$on('ClaimLocationsLoaded', function () {
                $scope.$watch('activeTab', function (nv, ov) {
                    if (nv !== ov) {
                        ctrl.resetInfiniteScroll();
                    }
                });

                $scope.$watch(
                    'filterProperties',
                    function (nv, ov) {
                        if (nv !== ov) {
                            ctrl.resetInfiniteScroll();
                            ctrl.getCounts();
                        }
                    },
                    true
                );

                //This needs to wait until $scope.selectedLocations is populated
                //these calls get made when filterproperties.selectedlocations gets set, so we will not do these here
                //if the watches ever get removed from filterproperties, these will need to be called again
                $scope.getAllClaims();
                ctrl.getCounts();
            });

            $scope.$on('ClaimLocationsChanged', function () {
                if ($scope.selectedLocations.length > 0) {
                    ctrl.resetInfiniteScroll();
                    ctrl.getCounts();
                }
            });

            $scope.$on('ClaimMasterLocationsLoaded', function (evt, data) {
                $scope.masterLocations = data;
            });

            $scope.$on('selectedAccountMemberChanged', function () {
                ctrl.resetInfiniteScroll();
                ctrl.getCounts();
            });

            ctrl.resetInfiniteScroll = function () {
                $scope.isUpdating = true;
                $scope.allDataDisplayed = false;
                $scope.currentPage = 0;
                $scope.isUpdating = false;
                $scope.claimMgmtsLists = [];
                ctrl.unSelectAllClaims();
                $scope.getAllClaims();
            };

            ctrl.getCounts = function (tabs) {
                if (!tabs) {
                    tabs = ['unsubmitted', 'submitted', 'alerts', 'all'];
                }
                angular.forEach(tabs, function (tab) {
                    $scope.getTabCount({
                        tab: tab,
                        filters: {
                            FilterCriteria: ctrl.getPostFilters(tab),
                            ReturnRows: false,
                            ReturnCount: true,
                            ReturnTotalFees: tab === 'all' ? false : true,
                        },
                    });
                });
            };

            $scope.searchTextChanged = function () {
                ctrl.resetInfiniteScroll();
                ctrl.getCounts();
            };

            $scope.getAllClaims = function () {
                if (
                    patSecurityService.IsAuthorizedByAbbreviation(
                        ctrl.soarAuthClaimViewKey
                    )
                ) {
                    $scope.isUpdating = true;
                    $scope.initialized = false;
                    claimService.search(
                        {
                            FilterCriteria: ctrl.getPostFilters(),
                            ReturnRows: true,
                            PageCount: $scope.pageCount,
                            CurrentPage: $scope.currentPage,
                            SortCriteria: ctrl.sortCriteria,
                        },
                        function (res) {
                            if (res.Value.Rows.length != $scope.pageCount) {
                                $scope.allDataDisplayed = true;
                            }

                            if (res && res.Value && res.Value.Rows) {
                                // load dynamic properties before adding to scope
                                res.Value.Rows.forEach(claim => {
                                    //if select all is checked, as new rows come in set them to selected if possible
                                    if ($scope.selectAll) {
                                        claim.Selected = $filter('canBeSubmitted')(claim);
                                    }
                                    ctrl.getPatientName(claim);
                                    ctrl.getMinMaxDates(claim);
                                    ctrl.getStatusNames(claim);
                                    // set local display date for SubmittedDate
                                    if (
                                        claim.DateSubmitted != null &&
                                        !claim.DateSubmitted.toString().toLowerCase().endsWith('z')
                                    ) {
                                        claim.DateSubmitted += 'Z';
                                    }
                                });
                                $scope.claimMgmtsLists = $scope.claimMgmtsLists.concat(
                                    res.Value.Rows
                                );
                            }

                            /* Carriers are only sent on page 0 and we also don't want to update
                                  Carriers if we're currently filtered by a Carrier */
                            if ($scope.currentPage === 0 && !$scope.isFilteredByCarrier) {
                                ctrl.getCarriers(
                                    res.Value.CarriersOnClaims,
                                    res.Value.FilterCriteria.CarrierIds
                                );
                            }
                            $scope.initialized = true;
                            ctrl.resetTop();

                            $timeout(function () {
                                $scope.isUpdating = false;
                            });
                            $scope.currentPage++;
                        }
                    );
                }
            };

            ctrl.resetTop = function () {
                //recalculate the point at which the keeptop directive will fix the header
                $rootScope.$broadcast('reset-top');
            };

            $scope.backToTop = function () {
                $anchorScroll();
                $scope.hasScrolled = false;
            };

            angular.element($window).bind('scroll', function () {
                if (this.pageYOffset > 350) {
                    $scope.$apply(function () {
                        $scope.hasScrolled = true;
                    });
                } else {
                    $scope.$apply(function () {
                        $scope.hasScrolled = false;
                    });
                }
            });

            ctrl.getPostFilters = function (tab) {
                var claimInformation = patientServices.GetClaimInformation();
                let selectedLocationIds = [];
                if ($scope.selectedLocations)
                    selectedLocationIds = $scope.selectedLocations
                        .filter(x => x.LocationId != null)
                        .map(x => x.LocationId);

                var filter = {
                    ClaimTypes: ctrl.getClaimTypes(),
                    CarrierIds: ctrl.getSelectedCarriers(),
                    LocationIds: selectedLocationIds,
                    PatientIds:
                        claimInformation != null ? claimInformation.selectedIds : null,
                    SearchText: $scope.searchText,
                };

                if (sessionStorage.getItem('pendingclaims') == 'true') {
                    $scope.activeTab = 'submitted';
                    $scope.filterProperties.selectedClaimPredoption = '1';
                    filter.ClaimTypes = [1];
                    sessionStorage.setItem('pendingclaims', 'false');
                } else if (
                    sessionStorage.getItem('unSubmittedClaims') == 'unSubmitted'
                ) {
                    $scope.activeTab = 'unsubmitted';
                    $scope.filterProperties.selectedClaimPredoption = '1';
                    filter.ClaimTypes = [1];
                    sessionStorage.removeItem('unSubmittedClaims');
                } else if (sessionStorage.getItem('unSubmittedClaims') == 'alerts') {
                    $scope.activeTab = 'alerts';
                    $scope.filterProperties.selectedClaimPredoption = '1';
                    filter.ClaimTypes = [1];
                    sessionStorage.removeItem('unSubmittedClaims');
                } else if (sessionStorage.getItem('predetermination')) {
                    $scope.filterProperties.selectedClaimPredoption = '2';
                    filter.ClaimTypes = [2];
                    var predeterminationValue =
                        sessionStorage.getItem('predetermination');
                    if (predeterminationValue === 'submitted') {
                        $scope.activeTab = 'submitted';
                    } else if (predeterminationValue === 'unsubmitted') {
                        $scope.activeTab = 'unsubmitted';
                    } else {
                        $scope.activeTab = 'alerts';
                    }
                    sessionStorage.removeItem('predetermination');
                }
                var filterTab = tab ? tab : $scope.activeTab;
                switch (filterTab) {
                    case 'unsubmitted':
                        filter.ClaimStatuses = [1, 3];
                        break;
                    case 'submitted':
                        filter.DateSubmitted = $scope.filterProperties.selectedDateFilter;
                        filter.ClaimMethods = ctrl.getSubmissionMethods();
                        filter.ClaimStatuses = ctrl.getSubmittedStatuses();
                        break;
                    case 'alerts':
                        filter.ClaimStatuses = [6];
                        filter.HasErrors = true;
                        break;
                    case 'all':
                        filter.DateSubmitted = $scope.filterProperties.selectedDateFilter;
                        filter.ClaimStatuses = ctrl.getGeneralStatuses();
                        filter.HasErrors =
                            _.filter(
                                $scope.filterProperties.selectedGeneralStatuses,
                                function (item) {
                                    return item.Value === 3;
                                }
                            ).length > 0;
                        filter.IsReceived =
                            _.filter(
                                $scope.filterProperties.selectedGeneralStatuses,
                                function (item) {
                                    return item.Value === 6;
                                }
                            ).length > 0;
                        break;
                    default:
                        break;
                }
                return filter;
            };

            ctrl.getSubmissionMethods = function () {
                var methods = [];
                if (
                    $scope.selectedSubmissionMethods.length === 1 &&
                    $scope.selectedSubmissionMethods[0].Value === 4
                ) {
                    methods.push(1);
                    methods.push(2);
                    methods.push(3);
                } else {
                    angular.forEach($scope.selectedSubmissionMethods, function (method) {
                        if (method.Selected !== false) methods.push(method.Value);
                    });
                }
                return methods;
            };

            ctrl.getClaimTypes = function () {
                switch ($scope.filterProperties.selectedClaimPredoption) {
                    case '1':
                        return [1];
                    case '2':
                        return [2];
                    case '3':
                        return [1, 2];
                    default:
                        return [];
                }
            };

            ctrl.getSelectedCarriers = function () {
                var selectedCarriers = [];
                $scope.isFilteredByCarrier = false;
                if ($scope.selectedCarriers.length > 0) {
                    if (
                        $scope.selectedCarriers.length === 0 ||
                        ($scope.selectedCarriers.length === 1 &&
                            $scope.selectedCarriers[0].CarrierName ===
                            $scope.carrierList[0].CarrierName)
                    ) {
                        return selectedCarriers;
                    } else {
                        angular.forEach($scope.selectedCarriers, function (carrier) {
                            if (carrier.Selected !== false) {
                                selectedCarriers.push(carrier.CarrierId);
                                $scope.isFilteredByCarrier = true;
                            }
                        });
                    }
                }
                return selectedCarriers;
            };

            ctrl.getCarriers = function (carriers, selectedCarrierIds) {
                $scope.carrierList = [
                    {
                        CarrierName: 'All Carriers',
                        Selected:
                            !selectedCarrierIds || selectedCarrierIds.length === 0
                                ? true
                                : false,
                    },
                ];
                if (carriers) {
                    carriers.sort(function (a, b) {
                        let aName = a.Name ? a.Name : '';
                        let bName = b.Name ? b.Name : '';

                        return aName.localeCompare(bName, undefined, {
                            sensitivity: 'base',
                        });
                    });

                    angular.forEach(carriers, function (carrier) {
                        $scope.carrierList.push({
                            CarrierName: carrier.Name,
                            CarrierId: carrier.CarrierId,
                            Selected:
                                selectedCarrierIds &&
                                    selectedCarrierIds.includes(carrier.CarrierId)
                                    ? true
                                    : false,
                        });
                    });
                }
            };

            $scope.updateCarrier = function () {
                ctrl.resetInfiniteScroll();
                ctrl.getCounts();
            };

            $scope.updateSubmissionMethod = function () {
                ctrl.resetInfiniteScroll();
                ctrl.getCounts();
            };

            ctrl.getSubmittedStatuses = function () {
                var statuses = [];
                angular.forEach(
                    $scope.filterProperties.selectedSubmittedStatuses,
                    function (item) {
                        if (item.Value === 4) {
                            statuses.push(4);
                            statuses.push(9); //queued
                        } else {
                            statuses.push(item.Value);
                        }
                    }
                );
                return statuses;
            };

            ctrl.getGeneralStatuses = function () {
                var statuses = [];
                angular.forEach(
                    $scope.filterProperties.selectedGeneralStatuses,
                    function (item) {
                        switch (item.Value) {
                            case 1:
                                statuses.push(1);
                                statuses.push(3);
                                break;
                            case 2:
                                statuses.push(2);
                                statuses.push(4);
                                statuses.push(9);
                                statuses.push(5);
                                statuses.push(6);
                                break;
                            case 3:
                                statuses.push(6);
                                break;
                            case 4:
                                statuses.push(7);
                                break;
                            case 5:
                                statuses.push(8);
                                break;
                            default:
                                break;
                        }
                    }
                );
                return statuses;
            };

            //calculating the Service Start and end Date
            ctrl.getMinMaxDates = function (claim) {
                if (claim.Type !== 1) {
                    claim.startDatetoEndDate = '';
                } else {
                    var min = $filter('toShortDisplayDateUtc')(claim.MinServiceDate);
                    var max = $filter('toShortDisplayDateUtc')(claim.MaxServiceDate);
                    claim.startDatetoEndDate = min === max ? min : min + ' -- \n' + max;
                }
            };

            ctrl.getPatientName = function (claim) {
                if (claim) {
                    var patientName =
                        [claim.PatientLastName, claim.PatientSuffix]
                            .filter(function (text) {
                                return text;
                            })
                            .join(' ') +
                        ', ' +
                        [claim.PatientFirstName, claim.PatientMiddleName]
                            .filter(function (text) {
                                return text;
                            })
                            .join(' ');
                    claim.patientName = patientName;
                }
            };

            ctrl.getStatusNames = function (claim) {
                claim.StatusName = $filter('statusDefinition')(claim.Status);
            };

            $scope.changeSorting = function (elemId, field) {
                ctrl.lastElement.removeClass('active');
                ctrl.lastElement.find('span').removeClass('fa-caret-up');
                ctrl.lastElement.find('span').removeClass('fa-caret-down');
                ctrl.lastElement.find('span').addClass('fa-sort');

                var asc = $scope.sortProp.field === field ? !$scope.sortProp.asc : true;

                $scope.sortProp = {
                    field: field,
                    asc: asc,
                };

                switch (field) {
                    case 'PatientName':
                        if (ctrl.sortCriteria.PatientName === 1) {
                            ctrl.sortCriteria.PatientName = 2;
                        } else {
                            ctrl.sortCriteria = { PatientName: 1 };
                        }
                        break;

                    case 'Type':
                        if (ctrl.sortCriteria.Type === 1) {
                            ctrl.sortCriteria.Type = 2;
                        } else {
                            ctrl.sortCriteria = { Type: 1 };
                        }
                        break;

                    case 'ProviderName':
                        if (ctrl.sortCriteria.ProviderName === 1) {
                            ctrl.sortCriteria.ProviderName = 2;
                        } else {
                            ctrl.sortCriteria = { ProviderName: 1 };
                        }
                        break;

                    case 'Priority':
                        if (ctrl.sortCriteria.Priority === 1) {
                            ctrl.sortCriteria.Priority = 2;
                        } else {
                            ctrl.sortCriteria = { Priority: 1 };
                        }
                        break;

                    case 'CarrierName':
                        if (ctrl.sortCriteria.CarrierName === 1) {
                            ctrl.sortCriteria.CarrierName = 2;
                        } else {
                            ctrl.sortCriteria = { CarrierName: 1 };
                        }
                        break;

                    case 'DateOfService':
                        if (ctrl.sortCriteria.DateOfService === 1) {
                            ctrl.sortCriteria.DateOfService = 2;
                        } else {
                            ctrl.sortCriteria = { DateOfService: 1 };
                        }
                        break;

                    case 'SubmittalMethod':
                        if (ctrl.sortCriteria.SubmittalMethod === 1) {
                            ctrl.sortCriteria.SubmittalMethod = 2;
                        } else {
                            ctrl.sortCriteria = { SubmittalMethod: 1 };
                        }
                        break;

                    case 'TotalFees':
                        if (ctrl.sortCriteria.TotalFees === 1) {
                            ctrl.sortCriteria.TotalFees = 2;
                        } else {
                            ctrl.sortCriteria = { TotalFees: 1 };
                        }
                        break;

                    case 'Status':
                        if (ctrl.sortCriteria.Status === 1) {
                            ctrl.sortCriteria.Status = 2;
                        } else {
                            ctrl.sortCriteria = { Status: 1 };
                        }
                        break;

                    case 'DateSubmitted':
                        if (ctrl.sortCriteria.DateSubmitted === 1) {
                            ctrl.sortCriteria.DateSubmitted = 2;
                        } else {
                            ctrl.sortCriteria = { DateSubmitted: 1 };
                        }
                        break;
                }
                ctrl.resetInfiniteScroll();

                var elem = angular.element('#' + elemId).addClass('active');
                elem.find('span').removeClass('fa-sort');
                elem.find('span').addClass(asc ? 'fa-caret-up' : 'fa-caret-down');
                ctrl.lastElement = elem;
            };

            //Preview
            $scope.previewPdf = function(claim) {
                $scope.isLoadingPdf = true;
                viewClaimService.viewOrPreviewPdf(claim, claim.patientName,  $scope.enableEliminateStaleClaims)
                    .toPromise()
                    .finally(function() {
                        $scope.isLoadingPdf = false;
                    });
            };
               
            // Close Claim
            $scope.closeClaimModal = function (
                claimId,
                status,
                patientId,
                patientName,
                dataTag
            ) {
                ctrl.closeDropDown();
                var closeClaimObject = {
                    patientId: patientId,
                    claimId: claimId,
                    hasMultipleTransactions: true,
                    fromPatitentSummary: false,
                    isPrintedAndClosed: false,
                    patientName: patientName,
                    DataTag: dataTag,
                    CheckDataTag: true,
                };
                if (
                    status === 2 ||
                    status === 1 ||
                    status === 3 ||
                    status === 5 ||
                    status === 6
                ) {
                    modalFactory
                        .Modal({
                            templateUrl:
                                'App/BusinessCenter/insurance/claims/claims-management/close-claim-modal/close-claim-modal.html',
                            backdrop: 'static',
                            keyboard: false,
                            size: 'lg',
                            windowClass: 'center-modal',
                            controller: 'CloseClaimModalController',
                            amfa: 'soar-acct-insinf-view',
                            resolve: {
                                closeClaimObject: function () {
                                    return closeClaimObject;
                                },
                            },
                        })
                        .result.then(function () {
                            ctrl.getCounts();
                            ctrl.resetInfiniteScroll();
                        });
                } else {
                    toastrFactory.error(
                        localize.getLocalizedString(
                            'Failed to close  {0}, Only Printed and Unsubmitted claims can be closed.',
                            ['Claim']
                        ),
                        'Failure'
                    );
                }
            };

            //Apply Insurance Payment
            $scope.applyInsurance = function (claim) {
                if (claim.Status !== 4 && claim.Status !== 9) {
                    claimService.getClaimById(
                        { claimId: claim.ClaimId },
                        ctrl.getInsuranceSuccess,
                        ctrl.getInsuranceFailure
                    );
                }
            };

            ctrl.getInsuranceSuccess = function (response) {
                var pstientId = response.Value.PatientId;
                var accountId = response.Value.AccountId;
                var calimId = response.Value.ClaimId;
                let patientPath = 'Patient/';
                var prevLocation = 'businesscenter_insurance';
                var path =
                    patientPath +
                    pstientId +
                    '/Account/' +
                    accountId +
                    '/Payment/' +
                    prevLocation +
                    '/' +
                    calimId;
                $location.path(path);
            };

            ctrl.getInsuranceFailure = function () {
                toastrFactory.error(
                    localize.getLocalizedString('Failed to get claim.'),
                    'Failure'
                );
            };

            //Change Answers
            $scope.changeAnswers = function (claim) {
                var hasAccess = patSecurityService.IsAuthorizedByAbbreviation(
                    claim.Type == 1 ? 'soar-ins-iclaim-edit' : 'soar-ins-ipred-edit'
                );
                if (hasAccess) {
                    var path =
                        '/BusinessCenter/Insurance/Claim/' +
                        claim.ClaimId +
                        '/ChangeAnswers/' +
                        (claim.SubmittalMethod !== 3 ? 'Dental' : 'Medical');
                    $location.path(path);
                }
            };

            //Enter Carrier Response
            $scope.enterCarrierResponse = function (claim) {
                if (
                    claim.PatientBenefitPlanPriority === 0 ||
                    claim.PatientBenefitPlanPriority === 1
                ) {
                    var path =
                        '/BusinessCenter/Insurance/Claims/CarrierResponse/' +
                        claim.ClaimId +
                        '/Patient/' +
                        claim.PatientId;
                    $location.path(path);
                }
            };

            // close predetermination
            $scope.closePredetermination = function (claimId) {
                ctrl.closeDropDown();
                var closePredeterminationObject = {
                    ClaimId: claimId,
                    Note: null,
                    NoInsurancePayment: true,
                    RecreateClaim: false,
                    CloseClaimAdjustment: null,
                    UpdateServiceTransactions: true,
                };
                modalFactory
                    .Modal({
                        templateUrl:
                            'App/BusinessCenter/insurance/claims/claims-management/close-predetermination-modal/close-predetermination-modal.html',
                        backdrop: 'static',
                        keyboard: false,
                        size: 'lg',
                        windowClass: 'center-modal',
                        controller: 'ClosePredeterminationModalController',
                        amfa: 'soar-ins-iclaim-edit',
                        resolve: {
                            closePredeterminationObject: function () {
                                return closePredeterminationObject;
                            },
                        },
                    })
                    .result.then(function () {
                        ctrl.getCounts();
                        ctrl.resetInfiniteScroll();
                    });
            };

            // Select Claims
            $scope.toggleSelectAllClaims = function () {
                if ($scope.selectAll) {
                    ctrl.unSelectAllClaims();
                } else {
                    ctrl.selectAllClaims();
                }
                $scope.selectedAllClaims = false;
            };

            ctrl.selectAllClaims = function () {
                // filter for currently visible claims
                angular.forEach(
                    $scope.claimMgmtsLists,
                    function (claimOrPredetermination) {
                        claimOrPredetermination.Selected = $filter('canBeSubmitted')(
                            claimOrPredetermination
                        );
                    }
                );
                $scope.selectAllLabel = 'Deselect All';
                $scope.selectAll = true;
            };

            ctrl.unSelectAllClaims = function () {
                angular.forEach(
                    $scope.claimMgmtsLists,
                    function (claimOrPredetermination) {
                        claimOrPredetermination.Selected = false;
                    }
                );
                $scope.selectAllLabel = 'Select All';
                $scope.selectAll = false;
            };

            //preview claims
            ctrl.printValidClaim = function (claim) {
                var internetexplorer;

                if (window.navigator.msSaveOrOpenBlob) {
                    internetexplorer = true;
                } else {
                    internetexplorer = false;
                    var myWindow = $window.open('');
                    var titleHtml =
                        '<html><head><title>View Claim for ' +
                        _.escape(claim.patientName) +
                        '</title></head></html>';
                    myWindow.document.write(titleHtml);
                }

                commonServices.Insurance.ClaimPdf(
                    '_soarapi_/insurance/claims/pdf?claimCommondId=' + claim.ClaimId
                ).then(function (res) {
                    var file = new Blob([res.data], {
                        type: 'application/pdf',
                    });

                    if (internetexplorer) {
                        window.navigator.msSaveOrOpenBlob(file, claim.PatientName + '.pdf');
                    } else {
                        var fileURL = URL.createObjectURL(file);
                        var pdfData = $sce.trustAsResourceUrl(fileURL);
                        var html =
                            '<html><head><title>View Claim for ' +
                            _.escape(claim.patientName) +
                            '</title></head><body><iframe id="pdfContent" name="pdfContent" src=' +
                            pdfData +
                            ' style="width:100%;height:100%;"/></body></div></html>';
                        myWindow.document.write(html);
                        var print = myWindow.frames['pdfContent'].print();

                        myWindow.frames['pdfContent'].print = function () {
                            myWindow.frames['pdfContent'].focus();
                            myWindow.document.close();
                            print();
                        };
                    }
                    ctrl.resetInfiniteScroll();
                });
            };

            ctrl.printValidClaims = function (claimIds) {
                if (ctrl.authClaimEditAccess) {
                    var claimCommonClaimIds = claimIds;
                    if (claimCommonClaimIds.length > 0) {
                        // determine browser type
                        if (ctrl.isBrowserIE() === false) {
                            ctrl.window = $window.open('');
                            var titleHtml = 'Loading...';
                            ctrl.window.document.write(titleHtml);
                        }

                        // get the pdf batch
                        commonServices.Insurance.PrintClaimBatch(claimCommonClaimIds).then(
                            function (res) {
                                $scope.getBatchSuccess(res);
                            },
                            function () {
                                $scope.getBatchFailure();
                            }
                        );
                    }
                }
            };

            $scope.getBatchSuccess = function (res) {
                // update the claim status since getBatch was successful
                // load file with pdf
                var file = new Blob([res.data], {
                    type: 'application/pdf',
                });

                // NOTE most of this should be moved to common class
                // if IE special handling
                if (ctrl.isBrowserIE()) {
                    ctrl.window.navigator.msSaveOrOpenBlob(
                        file,
                        'View Selected Claims' + '.pdf'
                    );
                } else {
                    var fileURL = URL.createObjectURL(file);
                    var pdfData = $sce.trustAsResourceUrl(fileURL);

                    var html =
                        '<html><head><title>View Selected Claims</title></head><body><iframe id="pdfContent" name="pdfContent" src=' +
                        pdfData +
                        ' style="width:100%;height:100%;"/></body></div></html>';
                    ctrl.window.document.write(html);
                    var print = ctrl.window.frames['pdfContent'].print();

                    ctrl.window.frames['pdfContent'].print = function () {
                        ctrl.window.frames['pdfContent'].focus();
                        ctrl.window.document.close();
                        print();
                    };
                }
                ctrl.unSelectAllClaims();
            };

            $scope.getBatchFailure = function () {
                toastrFactory.error(
                    localize.getLocalizedString('Failed to print {0}.', ['Claims']),
                    'Failure'
                );
            };

            $scope.submitSelectedClaims = function () {
                if (_.isEqual($scope.submitButtonDisabled, false)) {
                    $scope.submitButtonDisabled = true;
                    if ($scope.checkSelected()) {
                        return;
                    }

                    var postObject = {
                        AllSelected: $scope.selectAll,
                        ClaimIdKeyValuePairs: [],
                        Query: {
                            FilterCriteria: ctrl.getPostFilters(),
                        },
                    };
                    angular.forEach($scope.claimMgmtsLists, function (claim) {
                        postObject.ClaimIdKeyValuePairs.push({
                            Key: claim.ClaimId,
                            Value: claim.Selected,
                        });
                    });
                    patientServices.ClaimsAndPredeterminations.submitGrid(
                        postObject,
                        function (response) {
                            if (
                                (response.Value &&
                                    response.Value.ClaimStatusDtos.length === 0) ||
                                response.Value.InvalidClaims.length > 0
                            ) {
                                angular.forEach(
                                    response.Value.InvalidClaims,
                                    function (invalidClaim) {
                                        var claimOrPred = _.find(
                                            $scope.claimMgmtsLists,
                                            function (claim) {
                                                return claim.ClaimId === invalidClaim.ClaimId;
                                            }
                                        );
                                        if (claimOrPred && !claimOrPred.HasErrors) {
                                            claimOrPred.HasErrors = true;
                                            claimOrPred.DataTag = invalidClaim.DataTag;
                                        }
                                    }
                                );
                                $scope.claimStatusDtos = [];
                                ctrl.openInvalidClaimsModal(
                                    response.Value,
                                    $scope.claimStatusDtos,
                                    true
                                );
                            } else {
                                ctrl.claimsSubmittedSuccessfully(
                                    response.Value.ClaimStatusDtos
                                );
                            }
                            $scope.submitButtonDisabled = false;
                        },
                        function (response) {
                            var failedProperty =
                                response &&
                                response.status === 400 &&
                                response.data.InvalidProperties &&
                                response.data.InvalidProperties[0];

                            if (
                                failedProperty &&
                                failedProperty.PropertyName === 'Status' &&
                                failedProperty.ValidationMessage.startsWith(
                                    'There are no eligible claims to submit'
                                )
                            ) {
                                toastrFactory.error(
                                    localize.getLocalizedString(
                                        'One or more claim(s) have already been submitted - please refresh the page to see the latest information.'
                                    ),
                                    localize.getLocalizedString('Server Error')
                                );
                            } else if (
                                ctrl.eclaimSubmissionDisabledMessage &&
                                failedProperty.ValidationMessage &&
                                failedProperty.ValidationMessage.startsWith(
                                    'Electronic Claim Submission is currently disabled'
                                ) == true ) {
                                var title = 'Electronic Claim Submission';
                                var message = ctrl.eclaimSubmissionDisabledMessage;
                                var button1Text = 'OK';
                                modalFactory.ConfirmModal(title, message, button1Text);
                            } else {
                                toastrFactory.error(
                                    localize.getLocalizedString(
                                        'An error occurred on Submission'
                                    ),
                                    'Failure'
                                );
                            }

                            $scope.submitButtonDisabled = false;
                        }
                    );
                }
            };

            ctrl.claimsSubmittedSuccessfully = function (
                claimStatusDtos,
                claimsToRePrint
            ) {
                var validIdsPrint = [];

                $timeout(function () {
                    ctrl.resetInfiniteScroll();
                });

                angular.forEach(
                    $scope.claimMgmtsLists,
                    function (claimOrPredetermination) {
                        angular.forEach(claimStatusDtos, function (claim) {
                            if (
                                claimOrPredetermination.ClaimCommonId === claim.ClaimCommonId
                            ) {
                                claimOrPredetermination.Status = claim.Status;
                                claimOrPredetermination.DateSubmitted = moment
                                    .utc()
                                    .format('MM/DD/YYYY');
                                if (claimOrPredetermination.HasErrors) {
                                    claimOrPredetermination.HasErrors = false;
                                }
                                if (claim.Status === 2) {
                                    validIdsPrint.push(claim.ClaimId);
                                }
                            }
                        });
                    }
                );

                angular.forEach(claimsToRePrint, function (claim) {
                    validIdsPrint.push(claim.ClaimId);
                });

                ctrl.getCounts();

                toastrFactory.success(
                    localize.getLocalizedString('Submission Successful'),
                    'Success'
                );

                if (validIdsPrint.length > 0) {
                    if (validIdsPrint.length === 1) {
                        var claimForPrint = _.find(
                            $scope.claimMgmtsLists,
                            function (claim) {
                                return claim.ClaimId === validIdsPrint[0];
                            }
                        );
                        ctrl.printValidClaim(claimForPrint);
                    } else {
                        ctrl.printValidClaims(validIdsPrint);
                    }
                }

                var claimsToClose = _.filter(claimStatusDtos, function (claim) {
                    return (
                        claim.TrackClaim === false &&
                        claim.Status === 2 &&
                        (claim.Type === 1 || claim.Type === 2)
                    ); //skip non printed and those that have already been printed
                });
                ctrl.closeDoNotTrackClaims(claimsToClose)();
            };

            //loop through each claim that needs to be closed.
            //upon successful close of claim/pred, this method is called again with a list one item shorter than before
            //each loop we pull a claim off the beginning of the list, so claims are closed in the same order they were submitted with the exception
            //that all dental claims are closed before any medical claims
            ctrl.closeDoNotTrackClaims = function (claims) {
                return function () {
                    if (claims.length === 0) return;
                    var current = claims.splice(0, 1)[0];
                    if (current.Type === 1) {
                        modalFactory
                            .Modal({
                                templateUrl:
                                    'App/BusinessCenter/insurance/claims/claims-management/close-claim-modal/close-claim-modal.html',
                                backdrop: 'static',
                                keyboard: false,
                                size: 'lg',
                                windowClass: 'center-modal',
                                controller: 'CloseClaimModalController',
                                amfa: 'soar-acct-insinf-view',
                                resolve: {
                                    closeClaimObject: function () {
                                        return {
                                            patientId: current.PatientId,
                                            patientName: current.PatientName,
                                            claimId: current.ClaimId,
                                            hasMultipleTransactions: true,
                                            fromPatitentSummary: false,
                                            isPrintedAndClosed: true,
                                            DataTag: current.DataTag,
                                            CheckDataTag: true,
                                        };
                                    },
                                },
                            })
                            .result.then(
                                () => {
                                    ctrl.getCounts();
                                    ctrl.closeDoNotTrackClaims(claims)();
                                },
                                () => {
                                    ctrl.getCounts();
                                    ctrl.closeDoNotTrackClaims(claims)();
                                }
                            );
                    } else {
                        modalFactory
                            .Modal({
                                templateUrl:
                                    'App/BusinessCenter/insurance/claims/claims-management/close-predetermination-modal/close-predetermination-modal.html',
                                backdrop: 'static',
                                keyboard: false,
                                size: 'lg',
                                windowClass: 'center-modal',
                                controller: 'ClosePredeterminationModalController',
                                amfa: 'soar-ins-iclaim-edit',
                                resolve: {
                                    closePredeterminationObject: function () {
                                        return {
                                            ClaimId: current.ClaimId,
                                            Note: null,
                                            NoInsurancePayment: true,
                                            RecreateClaim: false,
                                            CloseClaimAdjustment: null,
                                            UpdateServiceTransactions: true,
                                            isPrintedAndClosed: true,
                                        };
                                    },
                                },
                            })
                            .result.then(
                                () => {
                                    ctrl.getCounts();
                                    ctrl.closeDoNotTrackClaims(claims)();
                                },
                                () => {
                                    ctrl.getCounts();
                                    ctrl.closeDoNotTrackClaims(claims)();
                                }
                            );
                    }
                };
            };

            ctrl.openInvalidClaimsModal = function (
                claimSubmissionResultsDto,
                isSubmissionMode
            ) {
                claimSubmissionResultsDto.IsSubmissionMode = isSubmissionMode;
                modalFactory
                    .Modal({
                        templateUrl:
                            'App/BusinessCenter/insurance/claims/claims-management/invalid-claims-modal/invalid-claims-modal.html',
                        backdrop: 'static',
                        keyboard: false,
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        controller: 'InvalidClaimsModalController',
                        amfa: 'soar-ins-iclaim-edit',
                        resolve: {
                            claimSubmissionResultsDto: function () {
                                return claimSubmissionResultsDto;
                            },
                            claimStatusDtos: function () {
                                return $scope.claimStatusDtos;
                            },
                        },
                    })
                    .result.then(function () {
                        if ($scope.claimStatusDtos && $scope.claimStatusDtos.length > 0) {
                            ctrl.claimsSubmittedSuccessfully($scope.claimStatusDtos);
                        }
                    });
            };

            ctrl.openInvalidAttachmentsModal = function (
                claimSubmissionResultsDto,
                isSubmissionMode
            ) {
                claimSubmissionResultsDto.IsSubmissionMode = isSubmissionMode;
                modalFactory
                    .Modal({
                        templateUrl:
                            'App/BusinessCenter/insurance/claims/claims-management/invalid-attachment-modal/invalid-attachment-modal.html',
                        backdrop: 'static',
                        keyboard: false,
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        controller: 'InvalidAttachmentModalController',
                        amfa: 'soar-ins-iclaim-edit',
                        resolve: {
                            claimSubmissionResultsDto: function () {
                                return claimSubmissionResultsDto;
                            },
                            claimStatusDtos: function () {
                                return $scope.claimStatusDtos;
                            },
                        },
                    })
                    .result.then(function () {
                        if ($scope.claimStatusDtos && $scope.claimStatusDtos.length > 0) {
                            ctrl.claimsSubmittedSuccessfully($scope.claimStatusDtos);
                        }
                    });
            };

            $scope.openClaimNotesModal = function (claimSubmissionResultsDto) {
                ctrl.resetGrid =
                    claimSubmissionResultsDto.HasUserGenaratedNotes === true
                        ? false
                        : true;
                ctrl.closeDropDown();
                modalFactory
                    .Modal({
                        templateUrl:
                            'App/BusinessCenter/insurance/claims/claims-management/claim-notes-modal/claim-notes-modal.html',
                        backdrop: 'static',
                        keyboard: false,
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        controller: 'ClaimNotesModalController',
                        amfa: 'soar-ins-iclaim-view',
                        resolve: {
                            claimSubmissionResultsDto: function () {
                                return claimSubmissionResultsDto;
                            },
                            claimStatusDtos: function () {
                                return $scope.claimStatusDtos;
                            },
                        },
                    })
                    .result.then(function (res) {
                        if (ctrl.resetGrid && res === true) {
                            ctrl.resetInfiniteScroll();
                        }
                    });
            };

            ctrl.openRejectedClaimModal = function (rejectionMessageDto, claimDto) {
                modalFactory
                    .Modal({
                        templateUrl:
                            'App/BusinessCenter/insurance/claims/claims-management/rejected-claim-modal/rejected-claim-modal.html',
                        backdrop: 'static',
                        keyboard: false,
                        size: 'lg',
                        windowClass: 'warning-modal-center',
                        controller: 'RejectedClaimModalController',
                        amfa: 'soar-ins-iclaim-edit',
                        resolve: {
                            claim: function () {
                                return claimDto;
                            },
                            rejectionMessageDto: function () {
                                return rejectionMessageDto;
                            },
                        },
                    })
                    .result.then(function () {
                        if ($scope.claimStatusDtos && $scope.claimStatusDtos.length > 0) {
                            ctrl.claimsSubmittedSuccessfully($scope.claimStatusDtos);
                        }
                    });
            };

            ctrl.getLocationTimezone = function (locationId) {
                const locationTemp = $scope.masterLocations.find(
                    location => location.LocationId == locationId
                );
                return locationTemp ? locationTemp.Timezone : '';
            }

            ctrl.openClaimAlertHistoryModal = function (claim) {
                let claimTimezone = ctrl.getLocationTimezone(claim.LocationId)

                //claim.LocationId
                let data = {
                    cancel: 'Close',
                    claimId: claim.ClaimId,
                    claimTimezone: claimTimezone
                };
                let modalDialog = claimAlertHistoryModalService.open({data});

                ctrl.modalSubscription = modalDialog.events.subscribe((events) => {
                    if (events && events.type) {
                        switch (events.type) {
                            case 'close':
                                modalDialog.close();
                                break;
                        }
                    }
                });
            }

            $scope.$on('$destroy', function () {

                if (ctrl.modalSubscription) {
                    console.log(ctrl.modalSubscription)
                    ctrl.modalSubscription.unsubscribe();
                }
            });

            //clean up method after FF is removed, currently confusing
            $scope.viewAlerts = function (claim) {
                if (claim.Status === 6) {
                    if ($scope.enableClaimStatusHistory) {
                        ctrl.openClaimAlertHistoryModal(claim);
                    } else {
                        ctrl.viewRejectedClaimAlert(claim);
                    }
                } else {
                    ctrl.viewClaimAlerts(claim);
                }
                ctrl.closeDropDown();
            };

            $scope.viewSubmissionHistory = function (claim) {
                ctrl.openClaimAlertHistoryModal(claim);
            };

            ctrl.viewClaimAlerts = function (claim) {
                patientServices.ClaimsAndPredeterminations.validateById(
                    { claimId: claim.ClaimId },
                    function (response) {
                        if (response.Value === null) {
                            var claimSubmissionResultsDto = {
                                ClaimStatusDtos: [],
                                InvalidClaims: [],
                                ValidClaims: [],
                            };
                            ctrl.openInvalidClaimsModal(claimSubmissionResultsDto, false);
                        } else {
                            ctrl.openInvalidClaimsModal(response.Value, false);
                        }
                    },
                    function () {
                        toastrFactory.error(
                            localize.getLocalizedString('An error occurred getting Alerts'),
                            'Failure'
                        );
                    }
                );
            };

            ctrl.viewRejectedClaimAlert = function (claim) {
                claimService.getClaimRejectionMessage(
                    { claimId: claim.ClaimId },
                    function (response) {
                        ctrl.openRejectedClaimModal(response.Value, claim);
                    },
                    function () {
                        toastrFactory.error(
                            localize.getLocalizedString(
                                'An error occurred getting the Rejection Message'
                            ),
                            'Failure'
                        );
                    }
                );
            };

            //Browser
            ctrl.isBrowserIE = function () {
                if (window.navigator.msSaveOrOpenBlob) {
                    return true;
                } else {
                    return false;
                }
            };

            ctrl.closeDropDown = function () {
                //this is a hack because bootstrap dropdown doesn't close when you click one of the options
                $('body').trigger('click');
            };

            //Go to treatment plan
            $scope.NavigateToTreatmentPlan = function (selectedStatusClaim) {
                if (
                    selectedStatusClaim.TreatmentPlanId &&
                    selectedStatusClaim.Type == 2 &&
                    selectedStatusClaim.PatientId
                ) {
                    let patientPath = 'Patient/';
                    var url = patientPath + selectedStatusClaim.PatientId + '/Clinical';
                    $location.path(url).search({
                        activeExpand: 2,
                        txPlanId: selectedStatusClaim.TreatmentPlanId,
                        activeSubTab: 2,
                    });
                }
            };

            //SubmissionMethod
            $scope.updateClaimSubmissionMethod = function (claim) {
                // can only update if unsubmitted, //preds can't switch to medical
                if (
                    claim.Status === 1 ||
                    (claim.Status === 3 &&
                        !(claim.Type === 2 && claim.SubmittalMethod === 3))
                ) {
                    $scope.submitButtonDisabled = true;
                    $scope.initialized = false;
                    commonServices.Insurance.Claim.changeSubmissionMethod(
                        { claimId: claim.ClaimId },
                        {
                            ClaimId: claim.ClaimId,
                            SubmittalMethod: claim.SubmittalMethod,
                            DataTag: claim.DataTag,
                        },
                        function (res) {
                            $scope.submitButtonDisabled = false;
                            $scope.initialized = true;
                            claim.Status = res.Value.Status;
                            claim.DataTag = res.Value.DataTag;
                            toastrFactory.success(
                                localize.getLocalizedString('{0} updated successfully.', [
                                    'Claim',
                                ]),
                                'Success'
                            );
                        },
                        function () {
                            toastrFactory.error(
                                localize.getLocalizedString('An error has occurred while {0}', [
                                    'updating claim',
                                ]),
                                localize.getLocalizedString('Error')
                            );
                            $scope.submitButtonDisabled = false;
                            $scope.initialized = true;
                        }
                    );
                }
            };

            $scope.highlightRow = function (currentRow) {
                ctrl.previousRow.highlighted = !ctrl.previousRow.highlighted;
                currentRow.highlighted = !currentRow.highlighted;
                ctrl.previousRow = currentRow;
            };


            // if successful call endpoint returns
            // True = if CHCPayer Accepts attachments
            // False = if CHCPayer does not accept attachments message appropriately
            // if failure endpoint returns
            // res.data.Result.Errors with list of errors
            ctrl.checkPayerAcceptsAttachment = function (claim) {
                var defer = $q.defer();
                var promise = defer.promise;
                if (!ctrl.allowClaimAttachments) {
                    modalFactory.ConfirmModal('eAttachments', ctrl.claimAttachmentsDisabledMessage, 'OK').then(function () { defer.resolve(false); });
                }
                else if (ctrl.allowVendorEligibilityCheckForAttachmentDialog) {
                    var params = {};
                    let modal = null;
                    let modalTimeout = null;

                    (params.locationId = claim.LocationId),
                        (params.claimId = claim.ClaimCommonId);
                    modalTimeout = $timeout(function () {
                        modal = $uibModal.open({
                            template:
                                '<div>' +
                                '  <i class="fa fa-spinner fa-4x fa-spin"></i><br/>' +
                                '</div>',
                            size: 'sm',
                            windowClass: 'modal-loading',
                            backdrop: 'static',
                            keyboard: false,
                        });
                    }, 750);

                    patientServices.Claim.CheckPayerAcceptsAttachments(
                        params
                    ).$promise.then(
                        function (res) {
                            $timeout.cancel(modalTimeout);
                            if (modal) {
                                modal.dismiss();
                            }

                            if (res.Result === false) {
                                ctrl.openPayerDoesNotAcceptAttachmentsModal(claim.CarrierName);
                            }
                            defer.resolve(res.Result);
                        },
                        function (res) {
                            $timeout.cancel(modalTimeout);
                            if (modal) {
                                modal.dismiss();
                            }
                            ctrl.missingRequirementsModal(res);
                            defer.resolve(false);
                        }
                    );
                }
                else {
                    defer.resolve(true);
                }
                return promise;
            };

            // attachment menu item only shows for claims with status of AcceptedElectronic, Rejected or when claim has an Attachment
            // or has a rejected attachment
            // attachment menu item is disabled if claim.EAttachmentEnabled is false or claim.Status is not UnsubmittedElectronic
            $scope.attachments = function (claim) {
                if (!claim.EAttachmentEnabled) {
                    return;
                }
                ctrl.closeDropDown();
                ctrl
                    .checkPayerAcceptsAttachment(claim)
                    .then(function (acceptsAttachments) {
                        if (acceptsAttachments === true) {
                            ctrl.validateForAttachments(claim).then(function (res) {
                                if (
                                    res.Value === null ||
                                    res.Value.InvalidClaims.length === 0
                                ) {
                                    $scope.continueAttachments(claim);
                                } else {
                                    ctrl.openInvalidAttachmentsModal(res.Value, false);
                                }
                            });
                        }
                    });
            };

            // validation for attachments
            ctrl.validateForAttachments = function (claim) {
                var defer = $q.defer();
                var promise = defer.promise;
                patientServices.ClaimsAndPredeterminations.validateForAttachments({
                    claimId: claim.ClaimId,
                }).$promise.then(
                    function (res) {
                        promise = $.extend(promise, {
                            values: res.Value,
                        });
                        defer.resolve(res);
                    },
                    function () {
                        toastrFactory.error(
                            localize.getLocalizedString(
                                'Failed to get validation for attachments.',
                                localize.getLocalizedString('Server Error')
                            )
                        );
                    }
                );
                return promise;
            };

            // if call to patientServices.Claim.CheckPayerAcceptsAttachments fails the
            // return may contain data.Result.Errors.  If so, parse these and display to user
            // otherwise throw toastr message
            ctrl.missingRequirementsModal = function (res) {
                let message = '';
                if (res.data && res.data.Result && res.data.Result.Errors) {
                    _.forEach(res.data.Result.Errors, function (errorResult) {
                        var validationMessage = validateClaimMessagesFactory.Message(
                            errorResult.PropertyName,
                            errorResult.ValidationCode
                        );
                        if (validationMessage) {
                            message += validationMessage.Message + '\n\r';
                        }
                    });
                    var title = localize.getLocalizedString('eAttachments');
                    var button1Text = 'OK';
                    modalFactory.ConfirmModal(title, message, button1Text);
                }
                else if (res.data && res.data.Result && res.data.Result.errorCode) {
                    message = insuranceErrorMessageGeneratorService.createErrorMessageForCheckPayer(res.data.Result);
                    var title = localize.getLocalizedString('eAttachments');
                    var button1Text = 'OK';
                    modalFactory.ConfirmModal(title, message, button1Text);
                }
                else {
                    toastrFactory.error(
                        localize.getLocalizedString(
                            'Could not confirm carrier attachment eligibility with the clearinghouse.  Please retry or contact Support.',
                            localize.getLocalizedString('Unexpected error')
                        )
                    );
                }
            };

            // message to indicate that the payer does not accept attachments
            ctrl.openPayerDoesNotAcceptAttachmentsModal = function (carrierName) {
                var title = localize.getLocalizedString('eAttachments');
                var message = localize.getLocalizedString(
                    'Carrier {0} does not accept electronic attachments.  See the resource titled \'Attachment Error: Carrier Not Supported\' to validate the Payer ID.',
                    [carrierName]
                );
                var button1Text = 'OK';
                modalFactory.ConfirmModal(title, message, button1Text);
            };

            $scope.continueAttachments = function (claim) {
                modalFactory.AttachmentsModal(claim).then(ctrl.attachmentsSuccess);
            };

            ctrl.attachmentsSuccess = function (obj) {
                var claim = _.find($scope.claimMgmtsLists, function (claim) {
                    return obj.claimId === claim.ClaimId;
                });
                if (claim) {
                    claim.HasAttachemnt = obj.hasAttachment;
                    claim.HasAcceptedOrRejectedAttachment = obj.hasSubmittedAttachment;
                }
            };
            $scope.selected = false;
            $scope.checkSelected = function () {
                var count = 0;
                angular.forEach($scope.claimMgmtsLists, function (selectedStatusClaim) {
                    if (selectedStatusClaim.Selected) {
                        count++;
                    }
                });
                if (count > 0) {
                    return false;
                } else {
                    return true;
                }
            };

            //#region Initialize Report Data
            $scope.reports = [];
            $scope.isReportDataLoaded = false;
            $scope.accessReportIds = [];
            $scope.selectedReport = { ReportId: 0 };
            ctrl.PatientsWithRemainingBenefitsReportId = 40;
            ctrl.PendingClaimsReportId = 36;

            if (
                $scope.authRptpndclmViewAccess() &&
                $scope.authRptpndencViewAccess()
            ) {
                $scope.accessReportIds = [
                    ctrl.PatientsWithRemainingBenefitsReportId,
                    ctrl.PendingClaimsReportId,
                ];
            } else if ($scope.authRptpndencViewAccess()) {
                $scope.accessReportIds = [ctrl.PatientsWithRemainingBenefitsReportId];
            } else if ($scope.authRptpndclmViewAccess()) {
                $scope.accessReportIds = [ctrl.PendingClaimsReportId];
            }

            if ($scope.accessReportIds.length > 0) {
                reportsFactory
                    .getReportArrayPromise($scope.accessReportIds)
                    .then(data => {
                        $scope.reports = data;
                        $scope.isReportDataLoaded = true;
                    });
            } else {
                $scope.reports = null;
                $scope.isReportDataLoaded = true;
            }

            //#endregion

            //#region Generate Reports

            // function to open the selected report
            $scope.$watch('selectedReport.ReportId', function (nv, ov) {
                if (nv != ov && nv > 0) {
                    var currentReport =
                        $scope.reports[$scope.selectedReport.ReportId - 1];
                    if (currentReport.Id === ctrl.PendingClaimsReportId) {
                        var patientIds = $scope.claimInformation
                            ? [$scope.claimInformation.accountId]
                            : null;
                        var locationIds = _.map($scope.selectedLocations, 'LocationId');
                        if (locationIds.length > 0 && locationIds[0] === null) {
                            locationIds = _.map($scope.masterLocations, 'LocationId'); //Use masterLocationList
                            if (locationIds.length > 0 && locationIds[0] === null)
                                locationIds[0] = 0;
                        }
                        var carrierIds = ctrl.getSelectedCarriers();
                        if (carrierIds.length === 0) {
                            carrierIds = _.map($scope.carrierList, 'CarrierId');
                        }
                        if (carrierIds.length > 0 && !carrierIds[0]) {
                            carrierIds.splice(0, 1); // Remove the 'All' option, we don't want it
                        }

                        if (patientIds) {
                            var context = {
                                PresetFilterDto: {
                                    PatientIds: patientIds,
                                    LocationIds: locationIds,
                                    CarrierIds: carrierIds,
                                },
                            };
                            reportsFactory.OpenReportPageWithContext(
                                currentReport,
                                '/BusinessCenter/Insurance/' +
                                currentReport.ReportTitle.replace(/\s/g, ''),
                                context
                            );
                        } else {
                            reportsFactory.OpenReportPage(
                                currentReport,
                                '/BusinessCenter/Insurance/' +
                                currentReport.ReportTitle.replace(/\s/g, ''),
                                true
                            );
                        }
                    } else
                        reportsFactory.OpenReportPage(
                            currentReport,
                            '/BusinessCenter/Insurance/' +
                            currentReport.ReportTitle.replace(/\s/g, ''),
                            true
                        );
                    $scope.selectedReport.ReportId = 0;
                }
            });

            $scope.navToPatientProfile = function (personId) {
                personFactory.getById(personId).then(function (result) {
                    var patientInfo = result.Value;
                    patientValidationFactory
                        .PatientSearchValidation(patientInfo)
                        .then(function (res) {
                            patientInfo = res;
                            if (
                                !patientInfo.authorization
                                    .UserIsAuthorizedToAtLeastOnePatientLocation
                            ) {
                                patientValidationFactory.LaunchPatientLocationErrorModal(
                                    patientInfo
                                );
                                return '';
                            } else {
                                globalSearchFactory.SaveMostRecentPerson(personId);
                                var patientLocation = '#/Patient/';
                                $location.search('newTab', null);
                                tabLauncher.launchNewTab(
                                    patientLocation + personId + '/Overview'
                                );
                                return '';
                            }
                        });
                });
            };

            //#endregion

            $scope.initialize();
        },
    ])
    .filter('canBeSubmitted', function () {
        return function (claim) {
            if (
                claim.Status === 4 ||
                claim.Status === 5 ||
                claim.Status === 7 ||
                claim.Status === 8 ||
                claim.Status === 9
            ) {
                return false;
            }
            if (
                claim.PatientBenefitPlanPriority !== 0 &&
                claim.PatientBenefitPlanPriority !== 1 &&
                claim.SubmittalMethod === 1
            ) {
                return false;
            }
            return true;
        };
    })
    .filter('canEditSubmissionMethod', function () {
        return function (claim) {
            if (claim.Status !== 1 && claim.Status !== 3) return false;
            if (claim.PatientBenefitPlanPriority > 1 && claim.SubmittalMethod === 2) {
                return false;
            }
            return true;
        };
    });
