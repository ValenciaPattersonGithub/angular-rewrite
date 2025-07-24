'use strict';

var app = angular.module('Soar.Patient');

var PatientInsuranceInfoController = app.controller(
    'PatientInsuranceInfoController',
    [
        '$scope',
        '$rootScope',
        'patSecurityService',
        '$routeParams',
        '$filter',
        'localize',
        'ListHelper',
        '$timeout',
        'PatientServices',
        'BusinessCenterServices',
        'toastrFactory',
        '$location',
        'ModalFactory',
        'PatSharedServices',
        'PatientBenefitPlansFactory',
        'BenefitPlansFactory',
        '$q',
        'CustomConfirmModal',
        'ClaimsService',
        'tabLauncher',
        'PatCacheFactory',
        'PatientClaimInfoOptions',
        'RealTimeEligibilityFactory',
        'locationService',
        'LocationServices',
        'ShareData',
        'AddPatientBenefitPlansModalService',
        'FeatureService',
        '$httpParamSerializer',
        'FeatureFlagService',
        'FuseFlag',
        function (
            $scope,
            $rootScope,
            patSecurityService,
            $routeParams,
            $filter,
            localize,
            listHelper,
            $timeout,
            patientServices,
            businessCenterServices,
            toastrFactory,
            $location,
            modalFactory,
            patSharedServices,
            patientBenefitPlansFactory,
            benefitPlansFactory,
            $q,
            customConfirmModal,
            claimsService,
            tabLauncher,
            patCacheFactory,
            PatientClaimInfoOptions,
            realTimeEligibilityFactory,
            locationService,
            locationServices,
            shareData,
            addPatientBenefitPlansModalService,
            featureService,
            $httpParamSerializer,
            featureFlagService,
            fuseFlag
        ) {
            // Get controller's object
            var ctrl = this;

            //#region init
            $scope.IsIndividualAccount = false;
            $scope.tileSort = 'Priority';
            $scope.patSharedServices = patSharedServices;
            $scope.openClaims = [];
            $scope.locationEnrolledInRTE = false;
            $scope.loggedInLocation = locationService.getCurrentLocation();
            $scope.disableAddInsurance = false;

            ctrl.patientBenefitPlanMarkedForDeletion = null;
            ctrl.allowRTE = false;
            ctrl.rteDisabledMessage = '';

            $scope.PatientClaimInfoOptions = PatientClaimInfoOptions;
            $scope.firstGet = true;

            $scope.openFeeSchedule = function (feeScheduleId) {
                tabLauncher.launchNewTab(
                    _.escape(
                        '#/BusinessCenter/Insurance/FeeSchedule/FeeScheduleDetails/' +
                        feeScheduleId
                    )
                );
            };

            $scope.openInsurancePlan = function (benefitPlanId) {
                tabLauncher.launchNewTab(
                    _.escape(
                        '#/BusinessCenter/Insurance/Plans/Edit?guid=' + benefitPlanId
                    )
                );
            };

            $scope.viewInsDocuments = function () {
                $location
                    .url(_.escape('/BusinessCenter/FormsDocuments/'))
                    .search({ patientId: $routeParams.patientId });
            };

            $scope.months = [
                { Text: localize.getLocalizedString('January'), Value: 1 },
                { Text: localize.getLocalizedString('February'), Value: 2 },
                { Text: localize.getLocalizedString('March'), Value: 3 },
                { Text: localize.getLocalizedString('April'), Value: 4 },
                { Text: localize.getLocalizedString('May'), Value: 5 },
                { Text: localize.getLocalizedString('June'), Value: 6 },
                { Text: localize.getLocalizedString('July'), Value: 7 },
                { Text: localize.getLocalizedString('August'), Value: 8 },
                { Text: localize.getLocalizedString('September'), Value: 9 },
                { Text: localize.getLocalizedString('October'), Value: 10 },
                { Text: localize.getLocalizedString('November'), Value: 11 },
                { Text: localize.getLocalizedString('December'), Value: 12 },
            ];

            //#endregion

            //#region claims
            ctrl.getClaimsList = function () {
                patientServices.Claim.getClaimEntitiesByAccountId(
                    {
                        accountId: $scope.$parent.patient.Data.PersonAccount.AccountId,
                    },
                    function (res) {
                        //this name is misleading as claimMgmtsLists actually contains ALL claims AND predeterminations.
                        $scope.claimMgmtsLists = res.Value;
                        $scope.unSubmittedClaims = _.filter(res.Value, function (claim) {
                            return claim.Status === 1 || claim.Status === 3;
                        });
                        $scope.openClaims = _.filter(res.Value, function (claim) {
                            return claim.Status !== 7 && claim.Status !== 8;
                        });
                        $scope.unsubmittedClaimsTotalFees = _.reduce(
                            $scope.unSubmittedClaims,
                            function (sum, claim) {
                                return sum + claim.TotalFees;
                            },
                            0
                        );
                    }
                );
            };

            $scope.getClaims = function (filterType) {
                patientServices.Account.getAllAccountMembersByAccountId(
                    {
                        accountId: $scope.$parent.patient.Data.PersonAccount.AccountId,
                    },
                    function (res) {
                        var claimInformation = {
                            url: $location.path(),
                            accountId: $scope.$parent.patient.Data.PatientId,
                            claimFilterType:
                                filterType === $scope.PatientClaimInfoOptions.UnsubmittedPreds
                                    ? $scope.PatientClaimInfoOptions.All
                                    : filterType,
                            responsiblePersonName: $scope.responsiblePerson ?? '',
                            accountMembers: res.Value,
                            selectedIds: _.map(res.Value, 'PatientId'),
                            locationIds: _.uniq(_.map($scope.claimMgmtsLists, 'LocationId')),
                        };
                        if (
                            filterType === $scope.PatientClaimInfoOptions.UnsubmittedPreds
                        ) {
                            claimInformation.predsOnly = true;
                        }

                        var accountId = $scope.$parent.patient.Data.PersonAccount.AccountId;

                        var params = {
                            patientId: $scope.$parent.patient.Data.PatientId
                        };

                        // Serialize parameters
                        var parameters = $httpParamSerializer(params);

                        patientServices.SetClaimInformation(claimInformation);
                        $location.url(_.escape(`/BusinessCenter/Insurance/Claims/${accountId}`) + '?' + parameters);
                    }
                );
            };

            //#endregion

            //#region Authorization

            // view access
            ctrl.authViewAccess = function () {
                return patSecurityService.IsAuthorizedByAbbreviation(
                    'soar-ins-ibplan-view'
                );
            };

            ctrl.authAccess = function () {
                if (!ctrl.authViewAccess()) {
                    toastrFactory.error(
                        patSecurityService.generateMessage('soar-ins-ibplan-view'),
                        'Not Authorized'
                    );
                    event.preventDefault();
                    $location.path(_.escape('/'));
                } else {
                    $scope.hasViewAccess = true;
                }
            };

            // authorization
            ctrl.authAccess();

            //#endregion

            $scope.initialize = function () {
                if ($scope.$parent.patient.Data) {
                    document.title =
                        $scope.$parent.patient.Data.PatientCode +
                        ' - ' +
                        localize.getLocalizedString('Insurance');
                }
                $scope.benefitPlans = [];

                // start button out as disabled
                $scope.hasBenefitPlans = true;
                $scope.patientBenefitPlans = [];
                $scope.insuranceInfoTiles = [];
                $scope.dependentList = [];
                $scope.carriers = [];
                $scope.currentPatientId = null;
                $scope.patient = null;
                $scope.patientFromHeader = null;
                ctrl.emptyGuid = '00000000-0000-0000-0000-000000000000';

                $scope.loading = false;
                ctrl.checkFeatureFlags();
                $scope.patientFromHeaderId = $routeParams.patientId;
                ctrl.getPatientFromHeader($scope.patientFromHeaderId);
                ctrl.getClaimsList();
                ctrl.checkLocationRteEnrollmentStatus();
                ctrl.applyAccountMemberFilter();
            };

            ctrl.checkFeatureFlags = function () {

                featureFlagService.getOnce$(fuseFlag.AllowRealTimeEligibilityVerification).subscribe((value) => {
                    ctrl.allowRTE = value;
                });

                featureFlagService.getOnce$(fuseFlag.ConfigureRealTimeEligibilityDisabledMessage).subscribe((value) => {
                    ctrl.rteDisabledMessage = value;
                });

            };

            //#region add patient benefit plan

            $scope.openInsuranceModal = function (patientBenefitPlan) {
                // if not editing existing insurance open migrated add insurance modal
                if (!patientBenefitPlan) {
                    ctrl.openAddInsuranceModal();
                } else {
                    ctrl.openInsuranceModal(patientBenefitPlan);
                }
            };

            var modalSubscription;
            // dont forget to translate text
            ctrl.openAddInsuranceModal = function () {
                var patient = $scope.patient;
                ctrl.resetAllowSetPriority();
                var nextAvailablePriority = ctrl.calcNextAvailablePriority();
                if (patient) {
                    $scope.disableAddInsurance = true;
                    this.disableSummary = true;
                    let data = {
                        header: 'Header here',
                        confirm: 'Save',
                        cancel: 'Close',
                        size: 'md',
                        patient: $scope.patient,
                        nextAvailablePriority: nextAvailablePriority,
                    };
                    let modalDialog = addPatientBenefitPlansModalService.open({ data });

                    $scope.modalSubscription = modalDialog.events.subscribe(events => {
                        if (events && events.type) {
                            switch (events.type) {
                                case 'confirm':
                                    modalDialog.close();
                                    // refresh the page
                                    ctrl.newPlanAdded();
                                    this.disableAddInsurance = false;
                                    break;
                                case 'close':
                                    ctrl.onClose();
                                    modalDialog.close();
                                    break;
                            }
                        }
                    });
                }
            };

            // disable property doesn't always get handled by digest
            ctrl.onClose = function () {
                $timeout(function () {
                    $scope.disableAddInsurance = false;
                });
            };

            // after plan added
            ctrl.newPlanAdded = function () {
                // disable property doesn't always get handled by digest
                $scope.hasBenefitPlans = true;
                // do a fresh get on patient benefit plans
                $timeout(function () {
                    $scope.disableAddInsurance = false;
                    // Reset patient benefit plans
                    $scope.insuranceInfoTiles = [];
                    ctrl.doneDelay();
                }, 300);
            };

            $scope.$on('$destroy', function () {
                if (modalSubscription) {
                    modalSubscription.unsubscribe();
                }
            });

            ctrl.openInsuranceModal = function (patientBenefitPlan) {
                var benefitPlanClaims = _.find($scope.openClaims, function (claim) {
                    return (
                        claim.PatientBenefitPlanId ===
                        (patientBenefitPlan ? patientBenefitPlan.PatientBenefitPlanId : '')
                    );
                });
                var patient = patientBenefitPlan
                    ? $scope.patient
                    : $scope.patientFromHeader;
                ctrl.resetAllowSetPriority();
                var nextAvailablePriority = ctrl.calcNextAvailablePriority();
                if (patient) {
                    if (patientBenefitPlan) {
                        patientBenefitPlan.hasOpenClaims = benefitPlanClaims ? true : false;
                    }
                    modalFactory
                        .Modal({
                            templateUrl:
                                'App/Patient/components/insurance-modal/insurance-modal.html',
                            backdrop: 'static',
                            keyboard: false,
                            size: 'lg',
                            windowClass: 'center-modal',
                            controller: 'InsuranceModalController',
                            amfa: 'soar-acct-insinf-view',
                            resolve: {
                                insurance: function () {
                                    return patientBenefitPlan
                                        ? angular.copy(patientBenefitPlan)
                                        : {
                                            PolicyHolderId: null,
                                            PatientId: patient.PatientId,
                                            BenefitPlanId: null,
                                            PolicyHolderStringId: null,
                                            DependentChildOnly: false,
                                            RelationshipToPolicyHolder: null,
                                            RequiredIdentification: null,
                                            Priority: nextAvailablePriority,
                                            Editing: true,
                                        };
                                },
                                allowedPlans: function () {
                                    return 6 - $scope.insuranceInfoTiles.length;
                                },
                                patient: function () {
                                    return patient;
                                },
                            },
                        })
                        .result.then(ctrl.planAdded, ctrl.cancelButton);
                }
            };

            ctrl.cancelButton = function (args) {
                if (args && args.removePlan && args.benefitPlanToRemove) {
                    var index = listHelper.findIndexByFieldValue(
                        $scope.insuranceInfoTiles,
                        'BenefitPlanId',
                        args.benefitPlanToRemove.PolicyHolderBenefitPlanDto.BenefitPlanId
                    );
                    $scope.removePlan($scope.insuranceInfoTiles[index]);
                }
            };

            // after plan added
            ctrl.planAdded = function (plan) {
                if ($scope.patientFromHeader.PatientId == plan.PatientId) {
                    $scope.hasBenefitPlans = true;
                }

                // do a fresh get on patient benefit plans
                $timeout(function () {
                    // Reset patient benefit plans
                    $scope.insuranceInfoTiles = [];

                    ctrl.doneDelay();
                }, 300);
            };

            //#endregion

            //#region delete patient benefit plan

            // success handler
            ctrl.insurancePlanDeletionSuccess = function (res) {
                toastrFactory.success(
                    localize.getLocalizedString('Delete successful.'),
                    localize.getLocalizedString('Success')
                );

                if (
                    ctrl.patientBenefitPlanMarkedForDeletion.$patientBenefitPlan
                        .PatientId == $scope.patientFromHeaderId
                ) {
                    ctrl.getPatientFromHeader($scope.patientFromHeaderId);
                }
                // reset priority after plan is removed

                ctrl.patientBenefitPlanMarkedForDeletion = null;
                $scope.insuranceInfoTiles = [];
                ctrl.getPatientBenefitPlans($scope.patient.PatientId);
                ctrl.getClaimsList();

                patCacheFactory.ClearCache(
                    patCacheFactory.GetCache('patientOverviewCache')
                );
            };

            // failure handler
            ctrl.insurancePlanDeletionFailure = function (res) {
                toastrFactory.error(
                    localize.getLocalizedString(
                        'Failed to delete the {0}. Please try again.',
                        ['Insurance Plan']
                    ),
                    localize.getLocalizedString('Server Error')
                );
                ctrl.patientBenefitPlanMarkedForDeletion = null;
            };

            ctrl.getDependentsSuccess = function (isForReprioritizing) {
                return function (res) {
                    var patientHasDependents = false;
                    var title = localize.getLocalizedString('Remove Benefit Plan');
                    var upperMessage = '';
                    var lowerMessage = '';
                    var buttonYes = localize.getLocalizedString('Yes');
                    var buttonNo = localize.getLocalizedString('No');
                    var sourceUrl =
                        'App/Patient/patient-account/patient-insurance-info/patient-insurance-info-dependent-list.html';
                    var dependentListForModal = [];

                    var claims = [];
                    //claims where the patient is the policyholder, including self
                    //get only for policy holder benefit plan id if removing a plan
                    //skip if reprioritizing, those claims won't be affected by reprioritizing patient benefit plans
                    if (!isForReprioritizing) {
                        angular.forEach(res.Value, function (plan) {
                            if (
                                plan.PatientBenefitPlanDto &&
                                plan.PatientBenefitPlanDto.PolicyHolderBenefitPlanId ===
                                ctrl.patientBenefitPlanMarkedForDeletion.$patientBenefitPlan
                                    .PolicyHolderBenefitPlanId
                            ) {
                                claims = claims.concat(
                                    _.filter(plan.Claims, function (claim) {
                                        return claim.Status !== 7 && claim.Status !== 8;
                                    })
                                );
                                if (
                                    plan.PersonLiteDto.PatientId !==
                                    $scope.$parent.currentPatientId
                                ) {
                                    patientHasDependents = true;
                                    dependentListForModal.push(plan);
                                }
                            }
                        });
                    }
                    //add claims where the patient is not the policy holder and claim hasn't already been added
                    //only for the patient benefit plan being deleted if delete
                    //all claims for patient if reprioritizing
                    claims = claims.concat(
                        _.filter($scope.openClaims, function (claim) {
                            return (
                                ((isForReprioritizing &&
                                    claim.PatientId === $scope.$parent.currentPatientId) ||
                                    (ctrl.patientBenefitPlanMarkedForDeletion &&
                                        claim.PatientBenefitPlanId ===
                                        ctrl.patientBenefitPlanMarkedForDeletion
                                            .$patientBenefitPlan.PatientBenefitPlanId)) &&
                                !_.find(claims, function (depClaim) {
                                    return depClaim.ClaimId === claim.ClaimId;
                                })
                            );
                        })
                    );
                    if (claims.length > 0 || patientHasDependents) {
                        if (patientHasDependents) {
                            // patient has no dependents for the sake of closing before reprioritizing
                            upperMessage = localize.getLocalizedString(
                                'Removing this benefit plan from {0} will remove it from each dependent on this benefit plan.',
                                [patSharedServices.Format.PatientName($scope.patient)]
                            );
                            if (claims.length === 0) {
                                lowerMessage = localize.getLocalizedString(
                                    'There are no open claims with this benefit plan.'
                                );
                            } else if (claims.length === 1) {
                                lowerMessage = localize.getLocalizedString(
                                    'The following patient has an open claim with this benefit plan, how would you like to handle this claim?'
                                );
                            } else {
                                lowerMessage = localize.getLocalizedString(
                                    'The following patients have open claims with this benefit plan, how would you like to handle those claims?'
                                );
                            }
                        } else {
                            if (claims.length > 1) {
                                upperMessage = localize.getLocalizedString(
                                    '{0} has open claims{1}, how would you like to handle those claims?',
                                    [
                                        patSharedServices.Format.PatientName($scope.patient),
                                        isForReprioritizing ? '' : ' with this benefit plan',
                                    ]
                                );
                            } else if (claims.length === 1) {
                                upperMessage = localize.getLocalizedString(
                                    '{0} has an open claim{1}, how would you like to handle that claim?',
                                    [
                                        patSharedServices.Format.PatientName($scope.patient),
                                        isForReprioritizing ? '' : ' with this benefit plan',
                                    ]
                                );
                            } else {
                                upperMessage = localize.getLocalizedString(
                                    '{0} has no open claims{1}.',
                                    [
                                        patSharedServices.Format.PatientName($scope.patient),
                                        isForReprioritizing ? '' : ' with this benefit plan',
                                    ]
                                );
                                lowerMessage = localize.getLocalizedString(
                                    'Are you sure you want to {0}?',
                                    [
                                        isForReprioritizing
                                            ? 'reprioritize these plans'
                                            : 'remove benefit plan ' +
                                            ctrl.patientBenefitPlanMarkedForDeletion
                                                .BenefitPlanName,
                                    ]
                                );
                            }
                        }

                        customConfirmModal
                            .ConfirmModalWithIncludeAndClaimGrid(
                                title,
                                upperMessage,
                                lowerMessage,
                                buttonYes,
                                buttonNo,
                                sourceUrl,
                                dependentListForModal,
                                claims
                            )
                            .then(
                                isForReprioritizing
                                    ? ctrl.continueReprioritize
                                    : ctrl.confirmDelete(patientHasDependents),
                                ctrl.cancelDelete
                            );
                    } else {
                        if (isForReprioritizing) {
                            ctrl.continueReprioritize();
                        } else {
                            ctrl.confirmDelete(false)();
                        }
                    }
                };
            };

            // un-mark insurance plan for deletion
            ctrl.cancelDelete = function () {
                ctrl.patientBenefitPlanMarkedForDeletion = null;
            };

            $scope.removePlan = function (patientBenefitPlan) {
                ctrl.patientBenefitPlanMarkedForDeletion = patientBenefitPlan;
                patientServices.PatientBenefitPlan.getDependentsForPolicyHolder(
                    {
                        patientId: patientBenefitPlan.$patientBenefitPlan.PatientId,
                        benefitPlanId: patientBenefitPlan.$patientBenefitPlan.BenefitPlanId,
                    },
                    ctrl.getDependentsSuccess(),
                    ctrl.getDependentsFailure
                );
            };

            ctrl.getDependentsFailure = function () {
                toastrFactory.error(
                    localize.getLocalizedString(
                        'Failed to retrieve the list of {0}. Please try again.',
                        ['dependents']
                    ),
                    'Error'
                );
            };

            // make call to api for deletion
            ctrl.confirmDelete = function (hasDependents) {
                return function () {
                    var params = {};

                    if (hasDependents) {
                        params.policyHolderBenefitPlanId =
                            ctrl.patientBenefitPlanMarkedForDeletion.$patientBenefitPlan.PolicyHolderBenefitPlanDto.PolicyHolderBenefitPlanId;

                        patientServices.PatientBenefitPlan.deletePolicyHolderBenefitPlan(
                            params,
                            ctrl.insurancePlanDeletionSuccess,
                            ctrl.insurancePlanDeletionFailure
                        );
                    } else {
                        params.patientId =
                            ctrl.patientBenefitPlanMarkedForDeletion.$patientBenefitPlan.PatientId;
                        params.benefitPlanId =
                            ctrl.patientBenefitPlanMarkedForDeletion.$patientBenefitPlan.PatientBenefitPlanId;

                        patientServices.PatientBenefitPlan.deletePatientBenefitPlan(
                            params,
                            ctrl.insurancePlanDeletionSuccess,
                            ctrl.insurancePlanDeletionFailure
                        );
                    }
                };
            };
            //#endregion

            //#region get benefit plans

            ctrl.getPatientBenefitPlans = function (patientId) {
                $scope.loading = true;
                if ($scope.IsIndividualAccount === false) {
                    // set orderBy
                    $scope.tileSort = 'SubTitle';
                    // get patientBenefitPlans by account id when for all or subset
                    patientBenefitPlansFactory
                        .PatientBenefitPlansForAccount(
                            $scope.$parent.patient.Data.PersonAccount.AccountId
                        )
                        .then(function (res) {
                            var patientBenefitPlans = [];
                            if (_.isEqual(patientId, '0')) {
                                patientBenefitPlans = res.Value;
                            } else {
                                _.each(res.Value, function (plan) {
                                    if (
                                        _.includes(patientId, plan.PatientBenefitPlanDto.PatientId)
                                    ) {
                                        patientBenefitPlans.push(plan);
                                    }
                                });
                            }
                            angular.forEach(
                                patientBenefitPlans,
                                function (patientBenefitPlan) {
                                    ctrl.populateInsuranceTiles(patientBenefitPlan);
                                }
                            );
                            // add merged Priority Labels for 'All' Accounts
                            angular.forEach($scope.insuranceInfoTiles, function (infoTile) {
                                ctrl.createMergedPriorityLabels(patientBenefitPlans, infoTile);
                            });
                            $scope.loading = false;
                        });
                } else {
                    // set orderBy
                    $scope.tileSort = 'Priority';
                    // get patientBenefitPlans by patient id when for individual
                    patientBenefitPlansFactory
                        .PatientBenefitPlans(patientId, true)
                        .then(function (res) {
                            var patientBenefitPlans = res.Value;
                            angular.forEach(
                                patientBenefitPlans,
                                function (patientBenefitPlan) {
                                    ctrl.populateInsuranceTiles(patientBenefitPlan);
                                }
                            );
                            $scope.loading = false;
                        });
                }
                if ($scope.firstGet) {
                    $scope.firstGet = false;
                } else {
                    $rootScope.$broadcast('EligibilityPatientBenefitPlansUpdated');
                }
            };

            ctrl.populateInsuranceTiles = function (patientBenefitPlan) {
                $scope.responsiblePerson =
                    ctrl.getResponsiblePerson(patientBenefitPlan);

                // create basic tile
                var infoTile = ctrl.createInfoTile(patientBenefitPlan);
                // add or merge with list
                ctrl.loadPatientBenefitPlanToTiles(infoTile);

                // order tiles before calling priority labels
                $scope.insuranceInfoTiles = $filter('orderBy')(
                    $scope.insuranceInfoTiles,
                    'Priority'
                );
                // add Priorities
                patientBenefitPlansFactory.SetPriorityLabels($scope.insuranceInfoTiles);
            };

            // create base tile for tiles list
            ctrl.createInfoTile = function (patientBenefitPlan) {
                // determine patientBenefitPlan
                var newPatientBenefitPlan = !$scope.IsIndividualAccount
                    ? patientBenefitPlan.PatientBenefitPlanDto
                    : patientBenefitPlan;

                // format policy holder name
                var policyHolderName = $filter('getPatientNameAsPerBestPractice')(
                    newPatientBenefitPlan.PolicyHolderDetails
                );

                var subTitle = ctrl.getSubTitle(newPatientBenefitPlan);
                // carrier name
                var carrierName = '';
                var benefitPlanName = '';
                var planGroupNumber = '';
                var renewalMonth = '';
                if (
                    newPatientBenefitPlan.PolicyHolderBenefitPlanDto &&
                    newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
                ) {
                    carrierName = newPatientBenefitPlan.PolicyHolderBenefitPlanDto
                        .BenefitPlanDto.CarrierName
                        ? newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
                            .CarrierName
                        : '';
                    benefitPlanName = newPatientBenefitPlan.PolicyHolderBenefitPlanDto
                        .BenefitPlanDto.Name
                        ? newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
                            .Name
                        : '';
                    renewalMonth = listHelper.findItemByFieldValue(
                        $scope.months,
                        'Value',
                        newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
                            .RenewalMonth
                    );
                    planGroupNumber = newPatientBenefitPlan.PolicyHolderBenefitPlanDto
                        .BenefitPlanDto.PlanGroupNumber
                        ? newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
                            .PlanGroupNumber
                        : '';
                }

                return {
                    AdditionalBenefits: newPatientBenefitPlan.AdditionalBenefits,
                    BenefitPlanId: newPatientBenefitPlan.BenefitPlanId, // Need for updates on insurances
                    BenefitPlanName: benefitPlanName,
                    Priority: newPatientBenefitPlan.Priority,
                    BenefitPlanGroupNumber: planGroupNumber,
                    PolicyHolderStringId: newPatientBenefitPlan.PolicyHolderStringId
                        ? newPatientBenefitPlan.PolicyHolderStringId
                        : '',
                    Relationship: newPatientBenefitPlan.RelationshipToPolicyHolder
                        ? newPatientBenefitPlan.RelationshipToPolicyHolder
                        : 'Self',
                    EffectiveDate: newPatientBenefitPlan.EffectiveDate
                        ? newPatientBenefitPlan.EffectiveDate
                        : '',
                    PolicyHolderName: policyHolderName,
                    RenewalMonth: renewalMonth ? renewalMonth.Text : '',
                    CarrierName: carrierName,
                    SubTitle: subTitle,
                    IndividualAnnualMax:
                        newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
                            .AnnualBenefitMaxPerIndividual,
                    IndividualAnnualMaxUsed: newPatientBenefitPlan.IndividualMaxUsed,
                    IndividualAnnualMaxRemaining: Math.max(
                        0,
                        newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
                            .AnnualBenefitMaxPerIndividual +
                        newPatientBenefitPlan.AdditionalBenefits -
                        newPatientBenefitPlan.IndividualMaxUsed
                    ),
                    IndividualDeductible:
                        newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
                            .IndividualDeductible,
                    IndividualDeductibleUsed:
                        newPatientBenefitPlan.IndividualDeductibleUsed,
                    IndividualDeductibleRemaining: Math.max(
                        0,
                        newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
                            .IndividualDeductible -
                        newPatientBenefitPlan.IndividualDeductibleUsed
                    ),
                    FamilyDeductible:
                        newPatientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
                            .FamilyDeductible,
                    FamilyDeductibleUsed: newPatientBenefitPlan.PolicyHolderBenefitPlanDto
                        ? newPatientBenefitPlan.PolicyHolderBenefitPlanDto
                            .FamilyDeductibleUsed
                        : 0,
                    FamilyDeductibleRemaining:
                        newPatientBenefitPlan.PolicyHolderBenefitPlanDto
                            ? Math.max(
                                0,
                                newPatientBenefitPlan.PolicyHolderBenefitPlanDto
                                    .BenefitPlanDto.FamilyDeductible -
                                newPatientBenefitPlan.PolicyHolderBenefitPlanDto
                                    .FamilyDeductibleUsed
                            )
                            : 0,
                    $patientBenefitPlan: newPatientBenefitPlan,
                    PolicyHolderDOB: newPatientBenefitPlan.PolicyHolderDetails.DateOfBirth
                        ? newPatientBenefitPlan.PolicyHolderDetails.DateOfBirth
                        : '',
                };
            };

            // load or replace tiles in list of insuranceInfoTiles
            ctrl.loadPatientBenefitPlanToTiles = function (infoTile) {
                if ($scope.insuranceInfoTiles) {
                    var index = listHelper.findIndexByFieldValue(
                        $scope.insuranceInfoTiles,
                        'BenefitPlanId',
                        infoTile.BenefitPlanId
                    );
                    if (index > -1 && $scope.IsIndividualAccount === false) {
                        $scope.insuranceInfoTiles.splice(index, 1, infoTile);
                    } else {
                        $scope.insuranceInfoTiles.push(infoTile);
                    }
                    $scope.insuranceInfoTiles = $filter('orderBy')(
                        $scope.insuranceInfoTiles,
                        'Priority'
                    );
                }
            };

            //#region patient info

            ctrl.getPatient = function (patientId) {
                patientServices.Patients.get(
                    { Id: patientId },
                    function (res) {
                        var patient = res.Value;
                        $scope.patient = patient;
                        $scope.patient.$name =
                            patSharedServices.Format.PatientName(patient);
                    },
                    function (err) {
                        toastrFactory.error(
                            localize.getLocalizedString(
                                'Failed to retrieve the {0}. Please try again.',
                                ['patient']
                            ),
                            'Error'
                        );
                    }
                );
            };

            ctrl.getPatientFromHeader = function (patientId) {
                if (patientId) {
                    patientServices.Patients.get(
                        {
                            Id: patientId,
                        },
                        function (res) {
                            var patient = res.Value;

                            $scope.patientFromHeader = patient;

                            $scope.patientFromHeader.$name =
                                patSharedServices.Format.PatientName(patient);

                            patientServices.PatientBenefitPlan.get(
                                { patientId: patientId },
                                function (res) {
                                    var patientBenefitPlans = res.Value;

                                    $scope.hasBenefitPlans = patientBenefitPlans.length > 0;
                                },
                                function (err) {
                                    /** set to true so we can disable the button */
                                    $scope.hasBenefitPlans = true;
                                    toastrFactory.error(
                                        localize.getLocalizedString(
                                            'Failed to retrieve the list of {0}. Please try again.',
                                            ['patient benefit plans']
                                        ),
                                        'Error'
                                    );
                                }
                            );
                        },
                        function (err) {
                            toastrFactory.error(
                                localize.getLocalizedString(
                                    'Failed to retrieve the  {0}. Please try again.',
                                    ['patient from header']
                                ),
                                'Error'
                            );
                        }
                    );
                }
            };

            //#endregion

            $scope.$on('apply-account-filters', function () {
                $timeout(function () {
                    ctrl.applyAccountMemberFilter();
                }, 300);
            });

            //#endregion
            ctrl.applyAccountMemberFilter = function () {
                // When viewing Insurance Information by All Account Members or subset, do not display Add Document unless only one member on account
                $scope.showAddDocuments =
                    $scope.showEligibility =
                    $scope.IsIndividualAccount =
                    ($scope.filterObject.members !== '0' &&
                        _.isEqual(_.size($scope.filterObject.members), 1)) ||
                    ($scope.filterObject.members === '0' &&
                        _.isEqual(_.size($scope.accountMembersOptionsTemp), 1));
                // Reset patient benefit plans on patient change
                $scope.insuranceInfoTiles = [];

                ctrl.doneDelay();
            };

            ctrl.doneDelay = function () {
                ctrl.resetAllowSetPriority();
                if ($scope.filterObject.members) {
                    if ($scope.IsIndividualAccount) {
                        // 0 is for showing all account information
                        if ($scope.filterObject.members === '0') {
                            // one account member on account
                            ctrl.getPatient(shareData.currentPatientId);
                            ctrl.getPatientBenefitPlans(shareData.currentPatientId);
                        } else {
                            ctrl.getPatient($scope.filterObject.members[0]);
                            ctrl.getPatientBenefitPlans($scope.filterObject.members[0]);
                        }
                    } else {
                        ctrl.getPatientBenefitPlans($scope.filterObject.members);
                    }
                }
            };

            //#region handling priorities functionality
            $scope.canChangePriority = false;
            // event fired by kendo-sortable
            $scope.sortableOptions = {
                end: function (e) {
                    ctrl.resetPriority(e);
                },
                hint: function (element) {
                    return element.clone().addClass('hint');
                },
                start: function (e) {
                    // disable drag if not individual account or only one tile
                    if (
                        !$scope.IsIndividualAccount ||
                        $scope.insuranceInfoTiles.length === 1 ||
                        $scope.canChangePriority === false
                    ) {
                        e.preventDefault();
                        return false;
                    }
                },
            };

            // reset labels when list changes
            $scope.$watch(
                'insuranceInfoTiles',
                function (nv, ov) {
                    if (nv && nv.length != ov.length) {
                        patientBenefitPlansFactory.SetPriorityLabels(nv);
                    }
                },
                true
            );

            // Reset the priority for each member of list after resorting
            ctrl.resetPriority = function (e) {
                // only reset the priority if the old index is not the same as new index
                if (e.oldIndex != e.newIndex) {
                    // reset new priorities
                    patientBenefitPlansFactory.ResetPriority(
                        $scope.insuranceInfoTiles,
                        e.oldIndex,
                        e.newIndex
                    );
                    // reset labels based based on new priorities
                    patientBenefitPlansFactory.SetPriorityLabels(
                        $scope.insuranceInfoTiles
                    );
                    // resort list based on new priorities
                    $scope.insuranceInfoTiles = $filter('orderBy')(
                        $scope.insuranceInfoTiles,
                        'Priority'
                    );

                    // call apply to update the template ? may not need after update
                    $timeout(function () {
                        $scope.$apply();
                    }, 0);

                    // TODO UPDATE and reload after api is available
                    ctrl.updateBenefitPlans($scope.insuranceInfoTiles);
                }
            };

            // update the patient benefit plans priority attached to the insuranceInfoTiles
            ctrl.updateBenefitPlans = function (insuranceInfoTiles) {
                var patientBenefitPlans = [];
                angular.forEach(insuranceInfoTiles, function (infoTile) {
                    patientBenefitPlans.push(infoTile.$patientBenefitPlan);
                });
                // update the priorities and then refresh the info tiles
                patientBenefitPlansFactory
                    .Update($scope.patient.PatientId, patientBenefitPlans)
                    .then(function (res) {
                        var patientBenefitPlans = res.Value;
                        $scope.insuranceInfoTiles = [];

                        //TODO? Refresh didn't reload the tiles correctly so for now reload page
                        //ctrl.refreshPatientBenefitPlans(patientBenefitPlans);
                        ctrl.getPatientBenefitPlans($scope.patient.PatientId);
                    });
            };

            ctrl.calcNextAvailablePriority = function () {
                var nextAvailablePriority = 0;
                angular.forEach($scope.insuranceInfoTiles, function (infoTile) {
                    if (infoTile.$patientBenefitPlan.Priority >= nextAvailablePriority) {
                        nextAvailablePriority = infoTile.$patientBenefitPlan.Priority + 1;
                    }
                });
                return nextAvailablePriority;
            };

            //#endregion

            // create merged Priority labels for 'All' Account Members
            ctrl.createMergedPriorityLabels = function (
                patientBenefitPlans,
                infoTile
            ) {
                var label0 = '';
                var label1 = '';
                var label2 = '';
                var label3 = '';
                var label4 = '';
                var label5 = '';

                patientBenefitPlans = $filter('orderBy')(
                    patientBenefitPlans,
                    'PatientBenefitPlanDto.Priority'
                );
                var localizedFor = localize.getLocalizedString(' for: ');

                infoTile.MergedPriorityLabel = '';
                angular.forEach(patientBenefitPlans, function (plan) {
                    if (
                        plan.PatientBenefitPlanDto.PolicyHolderBenefitPlanDto.BenefitPlanDto
                            .BenefitId === infoTile.$patientBenefitPlan.BenefitPlanId
                    ) {
                        var policyHolderName = $filter('getPatientNameAsPerBestPractice')(
                            plan.PatientLiteDto
                        );

                        switch (plan.PatientBenefitPlanDto.Priority) {
                            case 0:
                                if (label0.indexOf(policyHolderName) === -1) {
                                    label0 +=
                                        label0 === ''
                                            ? plan.PatientBenefitPlanDto.PriorityLabel +
                                            localizedFor +
                                            policyHolderName +
                                            ', '
                                            : policyHolderName + ', ';
                                }
                                break;
                            case 1:
                                if (label1.indexOf(policyHolderName) === -1) {
                                    label1 +=
                                        label1 === ''
                                            ? plan.PatientBenefitPlanDto.PriorityLabel +
                                            localizedFor +
                                            policyHolderName +
                                            ', '
                                            : policyHolderName + ', ';
                                }
                                break;
                            case 2:
                                if (label2.indexOf(policyHolderName) === -1) {
                                    label2 +=
                                        label2 === ''
                                            ? plan.PatientBenefitPlanDto.PriorityLabel +
                                            localizedFor +
                                            policyHolderName +
                                            ', '
                                            : policyHolderName + ', ';
                                }
                                break;
                            case 3:
                                if (label3.indexOf(policyHolderName) === -1) {
                                    label3 +=
                                        label3 === ''
                                            ? plan.PatientBenefitPlanDto.PriorityLabel +
                                            localizedFor +
                                            policyHolderName +
                                            ', '
                                            : policyHolderName + ', ';
                                }
                                break;
                            case 4:
                                if (label4.indexOf(policyHolderName) === -1) {
                                    label4 +=
                                        label4 === ''
                                            ? plan.PatientBenefitPlanDto.PriorityLabel +
                                            localizedFor +
                                            policyHolderName +
                                            ', '
                                            : policyHolderName + ', ';
                                }
                                break;
                            case 5:
                                if (label5.indexOf(policyHolderName) === -1) {
                                    label5 +=
                                        label5 === ''
                                            ? plan.PatientBenefitPlanDto.PriorityLabel +
                                            localizedFor +
                                            policyHolderName +
                                            ', '
                                            : policyHolderName + ', ';
                                }
                                break;
                        }
                    }
                });
                infoTile.MergedPriorityLabel =
                    label0 + label1 + label2 + label3 + label4 + label5;
                // remove trailing comma
                if (infoTile.MergedPriorityLabel.slice(-2) == ', ') {
                    infoTile.MergedPriorityLabel =
                        infoTile.MergedPriorityLabel.slice(0, -2) + '';
                }
            };

            // get responsible person name either from PatientLiteDto if IsResponsiblePerson or ResponsiblePersonDto if not
            ctrl.getResponsiblePerson = function (plan) {
                var responsiblePersonName = '';
                if (plan.PatientLiteDto) {
                    if (
                        plan.PatientLiteDto &&
                        plan.PatientLiteDto.IsResponsiblePerson === true
                    ) {
                        responsiblePersonName = $filter('getPatientNameAsPerBestPractice')(
                            plan.PatientLiteDto
                        );
                    } else {
                        responsiblePersonName = $filter('getPatientNameAsPerBestPractice')(
                            plan.ResponsiblePersonDto
                        );
                    }
                }

                $scope.responsiblePerson = responsiblePersonName;
                return responsiblePersonName;
            };

            //#region benefit plan / carrier

            // create subtitle
            ctrl.getSubTitle = function (patientBenefitPlan) {
                var subTitle = '';
                var carrierName = '';
                var benefitName = '';
                var groupNumber = '';
                if (
                    patientBenefitPlan.PolicyHolderBenefitPlanDto &&
                    patientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto
                ) {
                    var benefitPlanDto =
                        patientBenefitPlan.PolicyHolderBenefitPlanDto.BenefitPlanDto;
                    carrierName = benefitPlanDto.CarrierName
                        ? benefitPlanDto.CarrierName
                        : 'No Carrier Assigned';
                    benefitName = benefitPlanDto.Name
                        ? benefitPlanDto.Name
                        : 'No Carrier Assigned';
                    groupNumber = benefitPlanDto.PlanGroupNumber
                        ? localize.getLocalizedString(' (Plan/Group Number: {0})', [
                            { skip: benefitPlanDto.PlanGroupNumber },
                        ])
                        : '';
                } else {
                    carrierName = 'No Carrier Assigned';
                }
                // build subtitle
                var subTitle =
                    carrierName + (carrierName != '' ? ' - ' + benefitName : benefitName);
                subTitle += groupNumber;
                return subTitle;
            };

            $scope.checkAndUpdateUrlProtocol = function (carrierWebsite) {
                var subString1 = 'https://';
                var subString2 = 'http://';

                if (carrierWebsite.indexOf(subString1) !== -1 || carrierWebsite.indexOf(subString2) !== -1)
                    return carrierWebsite;
                else
                    return 'http://' + carrierWebsite;
            };
            //#endregion

            // set the priority button label based on state
            $scope.resetPriorityLabel = 'Re-Prioritize Benefit Plans';
            $scope.allowSetPriority = function () {
                if (!$scope.canChangePriority) {
                    ctrl.getDependentsSuccess(true)();
                } else {
                    $scope.canChangePriority = !$scope.canChangePriority;
                    $scope.resetPriorityLabel = $scope.canChangePriority
                        ? 'Done with Re-Prioritize Benefit Plans'
                        : 'Re-Prioritize Benefit Plans';
                }
            };

            ctrl.continueReprioritize = function () {
                $scope.insuranceInfoTiles = [];
                ctrl.getPatientBenefitPlans($scope.patient.PatientId);
                ctrl.getClaimsList();
                $scope.canChangePriority = !$scope.canChangePriority;
                $scope.resetPriorityLabel = $scope.canChangePriority
                    ? 'Done with Re-Prioritize Benefit Plans'
                    : 'Re-Prioritize Benefit Plans';
            };

            // reset allow reset priority button
            ctrl.resetAllowSetPriority = function () {
                $scope.canChangePriority = false;
                $scope.resetPriorityLabel = 'Re-Prioritize Benefit Plans';
            };

            //Returns a placeholder element while sorting in the list
            $scope.sortablePlaceholder = function () {
                var htmlPlaceholder =
                    '<div class="grid-cell-base hide-drag-btn">drop here</div>';
                return htmlPlaceholder;
            };

            //#region add document

            $scope.setUploadDocument = function () {
                $scope.uploadDocument = true;
            };
            $scope.showAddDocuments = false;

            // check Eligibility

            $scope.checkEligibility = function (plan) {

                if (!ctrl.allowRTE) {
                    modalFactory.ConfirmModal('Eligibility', ctrl.rteDisabledMessage, 'OK');

                } else {
                    realTimeEligibilityFactory.checkRTE(
                        plan.PatientId,
                        plan.PatientBenefitPlanId
                    );
                }
            };

            ctrl.checkLocationRteEnrollmentStatus = function () {
                if ($scope.loggedInLocation) {
                    locationServices.getLocationRteEnrollmentStatus(
                        { locationId: $scope.loggedInLocation.id },
                        function (res) {
                            if (res) {
                                $scope.locationEnrolledInRTE = res.Result;
                            }
                        }
                    );
                }
            };

            $rootScope.$on('patCore:initlocation', function () {
                var selectedLocation = locationService.getCurrentLocation();
                if (selectedLocation.id !== $scope.loggedInLocation.id) {
                    $scope.loggedInLocation = selectedLocation;
                    ctrl.checkLocationRteEnrollmentStatus();
                }
            });
            //#endregion
        },
    ]
);
