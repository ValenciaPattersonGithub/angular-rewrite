'use strict';

var app = angular.module('Soar.BusinessCenter');

app.controller('BenefitPlanCrudController', [
    '$scope',
    '$routeParams',
    '$q',
    '$timeout',
    '$location',
    '$anchorScroll',
    'BusinessCenterServices',
    'toastrFactory',
    'patSecurityService',
    'SaveStates',
    '$filter',
    'ModalFactory',
    'localize',
    'ListHelper',
    'tabLauncher',
    'referenceDataService',
    'PatientServices',
    'NewAdjustmentTypesService',
    'NewPaymentTypesService',
    'LocationIdentifierService',
    'TeamMemberIdentifierService',
    'serviceCodes',
    'ServiceTypesService',
    'FeatureFlagService',
    'FuseFlag',
    '$injector',
    function (
        $scope,
        $routeParams,
        $q,
        $timeout,
        $location,
        $anchorScroll,
        businessCenterServices,
        toastrFactory,
        patSecurityService,
        saveStates,
        $filter,
        modalFactory,
        localize,
        listHelper,
        tabLauncher,
        referenceDataService,
        patientServices,
        adjustmentTypesService,
        paymentTypesService,
        locationIdentifierService,
        teamMemberIdentifierService,
        serviceCodes,
        serviceTypesService,
        featureFlagService,
        fuseFlag,
        $injector
    ) {
        var ctrl = this;
        $scope.disableSaveButton = false;
        $scope.serviceTypes = [];
        $scope.coverageList = [];
        $scope.insurancePaymentTypes = [];
        $scope.negativeAdjustmentTypes = [];
        $scope.carriers = [];
        $scope.feeSchedules = [];
        $scope.displayFlags = {
            showContactInfo: false,
        };
        $scope.benefitPlan = {};
        $scope.allServiceCodes = serviceCodes;
        $scope.promises = [];
        ctrl.originalBenefitPlan = {};
        ctrl.isCarrierChanged = false;
        $scope.toggleServiceCodeExceptions = true;
        $scope.FirstCarrierSelect = true;
        $scope.FirstLoadFeeScheduleId = '';
        $scope.carriers = [];
        $scope.feeSchedules = [];
        $scope.hasErrors = false;
        $scope.validPhones = true;
        ctrl.duplicateCheckTimer = null;
        $scope.duplicates = [];
        $scope.checkingDuplicates = false;
        $scope.showDuplicates = false;
        document.title = 'Edit Plan';
        $scope.loading = true;
        $scope.noFeeSchedules = true;
        ctrl.paymentTypeCategories = { Account: 1, Insurance: 2 };
        $scope.websiteUrl = '';

        $scope.setAllStrings = [
            { Text: localize.getLocalizedString('Set All Coverage % to'), Value: 0 },
        ];
        $scope.selectedSetAllString = 0;
        $scope.setAllNumber = 0;
        $scope.values = { setAllNumber: 0 };

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

        $scope.doesNotHaveFeeSchedules = function () {
            var result = true;

            if (
                !_.isNil($scope.selectedCarrier) &&
                !_.isUndefined($scope.selectedCarrier.FeeScheduleList)
            ) {
                // if there is more than 1 Fee sched, return false
                if ($scope.selectedCarrier.FeeScheduleList.length > 1) {
                    result = false;
                } else {
                    // if the one Fee sched has a Fee sched id and it is not Guid.Empty, return false
                    if (
                        $scope.selectedCarrier.FeeScheduleList[0].FeeScheduleId !=
                        '00000000-0000-0000-0000-000000000000'
                    ) {
                        result = false;
                    }
                }
            }

            $scope.noFeeSchedules = result;
        };

        $scope.calculationMethods = [
            'Traditional',
            //'Non-Duplication',
            //'Maintenance of Benefits',
            'Do Not Estimate',
        ];
        $scope.calculationMethodDescriptions = [
            'Traditional coordination of benefits allows the beneficiary to receive up to 100% of expenses from a combination of the primary and secondary plans',
            //'In the case of non-duplication COB, if the primary carrier paid the same or more than what the secondary carrier would have paid if they had been primary, then the secondary carrier is not responsible for any payment at all',
            //'Maintenance of benefits reduces covered charges by the amount the primary plan has paid, and then applies the plan deductible and co-pay criteria.  Consequently the plan pays less than it would under traditional COB arrangement, and the beneficiary is typically left with some cost sharing',
            '',
        ];

        $scope.TaxCalculationStrategies = [
            localize.getLocalizedString('the location fee'),
            localize.getLocalizedString('the fee schedule allowed amount'),
        ];

        $scope.calculationMethodsOptions = [1, 4]; //TODO: Add 2, 3 back when needed

        $scope.benefitPlan = {
            CarrierId: $routeParams.carrierId, //if not included in route param will be null
            Name: null,
            IsActive: true,
            PlanGroupNumber: null,
            AddressLine1: null,
            AddressLine2: null,
            City: null,
            State: null,
            ZipCode: null,
            PhoneNumbers: [],
            FaxNumber: null,
            Website: null,
            Email: null,
            RenewalMonth: null,
            FeeScheduleId: null,
            ClaimMethod: '1',
            TrackClaims: null,
            ApplyAdjustments: '1',
            BenefitClause: false,
            AuthorizePaymentToOffice: true,
            FeesIns: '2',
            TaxPreference: '1',
            DataTag: null,
            InsurancePaymentTypeId: null,
            AdjustmentTypeId: null,
            Notes: '',
            CoverageList: [],
            ServiceCodeExceptions: [],
            AlternativeBenefits: [],
            SecondaryCalculationMethod: '1',
            BillingLocationAdditionalIdentifierId: null,
            ServiceLocationAdditionalIdentifierId: null,
            AdditionalProviderAdditionalIdentifierId: null,
            TaxCalculation: 1,
            TaxAssignment: 1,
            UseMemberIdOnClaim: false
        };

        //#region Authorization

        // watches benefitPlan.ClaimMethod for changes and update SubmitClaims and TrackClaims
        $scope.$watch('benefitPlan.ClaimMethod', function (nv) {
            if ($scope.benefitPlan.ClaimMethod == null) {
                $scope.benefitPlan.SubmitClaims = false;
            } else {
                $scope.benefitPlan.SubmitClaims = true;
            }
            ctrl.toggleTrackClaims();
        });

        // watches benefitPlan.FeesIns for changes and toggles $scope.toggleAdjustments()
        $scope.$watch('benefitPlan.FeesIns', function (nv) {
            $scope.toggleAdjustments();
        });

        $scope.checkTax = function (nv) {
            if ($scope.loading === false && !nv) {
                $scope.benefitPlan.TaxAssignment = 1;
                $scope.benefitPlan.TaxCalculation = 1;
            }
        };

        // view access
        ctrl.authViewAccess = function () {
            return patSecurityService.IsAuthorizedByAbbreviation(
                'soar-ins-ibplan-add'
            );
        };

        ctrl.authAccess = function () {
            if (!ctrl.authViewAccess()) {
                toastrFactory.error(
                    patSecurityService.generateMessage('soar-ins-ibplan-add'),
                    'Not Authorized'
                );
                event.preventDefault();
                $location.path('/');
            } else {
                $scope.hasViewAccess = true;
            }
        };

        // authorization
        ctrl.authAccess();

        // #endregion

        ctrl.validate = function (benefitPlan) {
            var form = $scope.frmPlan;
            var validCoverages = ctrl.validateCoverages(benefitPlan.CoverageList);

            return (
                form.$valid &&
                form.inpPlanName.$valid &&
                form.inpEmail.$valid &&
                form.inpZip.$valid &&
                form.inpGroupNumber.$valid &&
                $scope.validPhones &&
                validCoverages &&
                ctrl.validateAlternativeBenefits(benefitPlan) &&
                benefitPlan.SecondaryCalculationMethod &&
                0 < benefitPlan.SecondaryCalculationMethod < 5 &&
                !(
                    benefitPlan.IndivdualDeductible &&
                    (benefitPlan.IndivdualDeductible < 0 ||
                        benefitPlan.IndivdualDeductible > 999999.99)
                ) &&
                !(
                    benefitPlan.AnnualBenefitMaxPerIndividual &&
                    (benefitPlan.AnnualBenefitMaxPerIndividual < 0 ||
                        benefitPlan.CopayAnnualBenefitMaxPerIndividual > 999999.99)
                ) &&
                !(
                    benefitPlan.FamilyDeductible &&
                    (benefitPlan.FamilyDeductible < 0 ||
                        benefitPlan.FamilyDeductible > 999999.99)
                ) &&
                !(benefitPlan.TaxAssignment === 2 && !benefitPlan.FeeScheduleId) &&
                (benefitPlan.FeesIns == '2' ? benefitPlan.AdjustmentTypeId : true)
            );
        };

        ctrl.validateCoverages = function (coverages) {
            var isValid = true;

            for (var i = 0; i < coverages.length && isValid; i++) {
                // Set saveState
                if (
                    coverages[i].Copay &&
                    (coverages[i].Copay < 0 || coverages[i].Copay > 999999.99)
                ) {
                    isValid = false;
                }

                // Method of rounding floats in Javascript with no rounding errors
                // http://www.jacklmoore.com/notes/rounding-in-javascript/

                var coveragePercent = Number(
                    Math.round(coverages[i].CoveragePercent * 100 + 'e' + 2) + 'e-' + 2
                );
                if (
                    coverages[i].CoveragePercent &&
                    (coveragePercent % 1 != 0 ||
                        coveragePercent < 0 ||
                        coveragePercent > 100)
                ) {
                    isValid = false;
                }
            }

            return isValid;
        };

        ctrl.validateAlternativeBenefits = function (benefitPlan) {
            //Each service code can only be one child OR parent, cannot be exception or swiftpick, must have a CDT code, and must be able to submit on insurance

            angular.forEach(benefitPlan.AlternativeBenefits, function (alt) {
                //if parent matches child
                if (alt.ParentServiceCodeId === alt.ChildServiceCodeId) {
                    return false;
                }
                //if any other code contains this one's parent or child
                if (ctrl.findDupAltBens(benefitPlan, alt) > 1) {
                    return false;
                }
                //if parent code is swiftpick, doesn't have cdt, or doesn't submit on insurance
                if (
                    !_.find($scope.allServiceCodes, function (code) {
                        return (
                            alt.ParentServiceCodeId === code.ServiceCodeId &&
                            code.CdtCodeId &&
                            code.SubmitOnInsurance &&
                            !code.IsSwiftPickCode
                        );
                    })
                ) {
                    return false;
                }
                //if child code is swiftpick, doesn't have cdt, or doesn't submit on insurance
                if (
                    !_.find($scope.allServiceCodes, function (code) {
                        return (
                            alt.ChildServiceCodeId === code.ServiceCodeId &&
                            code.CdtCodeId &&
                            code.SubmitOnInsurance &&
                            !code.IsSwiftPickCode
                        );
                    })
                ) {
                    return false;
                }
                // if parent or child code is an exception code
                if (
                    _.find(benefitPlan.ServiceCodeExceptions, function (code) {
                        return (
                            alt.ChildServiceCodeId === code.ServiceCodeId ||
                            alt.ParentServiceCodeId === code.ServiceCodeId
                        );
                    })
                ) {
                    return false;
                }
            });
            return true;
        };

        ctrl.findDupAltBens = function (benefitPlan, alt) {
            _.filter(benefitPlan.AlternativeBenefits, function (code) {
                return (
                    code.ParentServiceCodeId === alt.ParentServiceCodeId ||
                    code.ParentServiceCodeId === alt.ChildServiceCodeId ||
                    code.ChildServiceCodeId === alt.ParentServiceCodeId ||
                    code.ChildServiceCodeId === alt.ChildServiceCodeId
                );
            });
        };

        ctrl.setHasErrors = function (isValid) {
            $scope.hasErrors = !isValid;
        };

        $scope.checkForDependents = function (benefitPlan) {
            $scope.saving = true;
            $scope.disableSaveButton = true;

            if (
                benefitPlan.$affectedAmounts &&
                benefitPlan.$affectedAmounts.length > 0
            ) {
                /** check for dependents */
                patientServices.PatientBenefitPlan.getDependentsForBenefitPlan(
                    {
                        benefitPlanId: benefitPlan.BenefitId,
                    },
                    function (res) {
                        /** we need to warn the user it could affect other people with the same plan */
                        if (res.Value.length > 0) {
                            var message =
                                'The following changes will be applied for all patients with this benefit plan: \n';
                            angular.forEach(
                                benefitPlan.$affectedAmounts,
                                function (affectedAmount) {
                                    message += localize.getLocalizedString(
                                        '- {0} ({1} to {2}) \n',
                                        [
                                            affectedAmount.Name,
                                            { skip: $filter('currency')(affectedAmount.Original) },
                                            { skip: $filter('currency')(affectedAmount.Current) },
                                        ]
                                    );
                                }
                            );

                            modalFactory
                                .ConfirmModal(
                                    'Amount(s) changed',
                                    message,
                                    'Continue',
                                    'Cancel'
                                )
                                .then(
                                    function () {
                                        $scope.save(benefitPlan);
                                    },
                                    function () {
                                        benefitPlan.$affectedAmounts = [];
                                        benefitPlan.IndividualDeductible = angular.copy(
                                            benefitPlan.$originalIndividualDeductible
                                        );
                                        benefitPlan.FamilyDeductible = angular.copy(
                                            benefitPlan.$originalFamilyDeductible
                                        );
                                        benefitPlan.AnnualBenefitMaxPerIndividual = angular.copy(
                                            benefitPlan.$originalAnnualBenefitMaxPerIndividual
                                        );
                                    }
                                );
                        } else {
                            $scope.save(benefitPlan);
                        }
                    },
                    function (err) {
                        toastrFactory.error(
                            localize.getLocalizedString(
                                'Failed to retrieve {0}. Please try again.',
                                ['dependents']
                            ),
                            'Error'
                        );
                        $scope.saving = false;
                    }
                );
            } else {
                $scope.save(benefitPlan);
            }
        };
        $scope.save = function (benefitPlan) {
            $scope.saving = true;
            $scope.disableSaveButton = true;
            var isEditing = $scope.editing;
            var resource = isEditing
                ? businessCenterServices.BenefitPlan.update
                : businessCenterServices.BenefitPlan.save;

            var isValid = ctrl.validate(benefitPlan);
            isValid = isValid && $scope.selectedCarrier;
            ctrl.setHasErrors(isValid);
            ctrl.setFocusOnFirstError();

            if (isValid) {
                angular.forEach(benefitPlan.CoverageList, function (coverage) {
                    // Set saveState of coverages
                    if (coverage.BenefitPlanId) {
                        coverage.ObjectState = saveStates.Update;
                    } else {
                        coverage.ObjectState = saveStates.Add;
                    }
                });
                angular.forEach(
                    benefitPlan.ServiceCodeExceptions,
                    function (exception) {
                        // Set saveState of exceptions
                        if (exception.BenefitPlanId) {
                            exception.ObjectState = saveStates.Update;
                        } else {
                            exception.ObjectState = saveStates.Add;
                        }
                    }
                );
                angular.forEach(benefitPlan.AlternativeBenefits, function (altBenefit) {
                    // Set saveState of alternative benefits
                    if (altBenefit.BenefitPlanId) {
                        altBenefit.ObjectState = saveStates.Update;
                    } else {
                        altBenefit.ObjectState = saveStates.Add;
                    }
                });

                //If "Calculate Tax Using" is set to "the fee schedule allowed amount" without a fee schedule, set "Calculate Tax Using" to "the location fee"
                if (benefitPlan.TaxCalculation === 2 && !benefitPlan.FeeScheduleId) {
                    benefitPlan.TaxCalculation = 1;
                }

                var params = angular.copy(benefitPlan);
                params.PhoneNumbers = $filter('filter')(params.PhoneNumbers, {
                    ObjectState: '!' + saveStates.Delete,
                });
                params.ZipCode = params.ZipCode
                    ? params.ZipCode.replace(/-/g, '')
                    : null;
                if (!params.RenewalMonth) params.RenewalMonth = 0;

                //Check for carrier change.
                if (
                    $scope.editing &&
                    ctrl.originalBenefitPlan.CarrierId !== benefitPlan.CarrierId
                ) {
                    ctrl.isCarrierChanged = true;
                }

                if (ctrl.isCarrierChanged && benefitPlan.CarrierId !== null) {
                    //Check for unsubmitted claims on this plan
                    var hasUnsubmittedClaims = false;
                    var parameters = {
                        BenefitId: params.BenefitId,
                    };
                    businessCenterServices.BenefitPlan.hasUnsubmittedClaims(
                        parameters,
                        function (res) {
                            hasUnsubmittedClaims = res.Value;
                            if (hasUnsubmittedClaims) {
                                modalFactory
                                    .Modal({
                                        templateUrl:
                                            'App/BusinessCenter/insurance/benefit-plans/dental-benefit-plan-crud/unsubmitted-claims-modal/unsubmitted-claims-modal.html',
                                        backdrop: 'static',
                                        keyboard: false,
                                        size: 'lg',
                                        windowClass: 'center-modal',
                                        controller: 'UnsubmittedClaimsModalController',
                                        amfa: 'soar-ins-ibplan-edit',
                                        resolve: {
                                            params: function () {
                                                return params;
                                            },
                                        },
                                    })
                                    .result.then(function () {
                                        businessCenterServices.BenefitPlan.updateCarrierChanged(
                                            params,
                                            ctrl.saveOnSuccess,
                                            ctrl.saveOnError
                                        );
                                    });
                            } else {
                                businessCenterServices.BenefitPlan.updateCarrierChanged(
                                    params,
                                    ctrl.saveOnSuccess,
                                    ctrl.saveOnError
                                );
                            }
                        },
                        function (err) {
                            toastrFactory.error('Failed to close modal properly', 'Error');
                        }
                    );
                } else {
                    if (ctrl.isCarrierChanged) {
                        businessCenterServices.BenefitPlan.updateCarrierChanged(
                            params,
                            ctrl.saveOnSuccess,
                            ctrl.saveOnError
                        );
                    } else {
                        resource(params, ctrl.saveOnSuccess, ctrl.saveOnError);
                    }
                }
            } else {
                $scope.disableSaveButton = false;
            }
        };

        $scope.setTitle = function (title) {
            document.title = title;
        };

        ctrl.saveOnSuccess = function (res) {
            $scope.disableSaveButton = false;
            var isEditing = $scope.editing;
            ctrl.isCarrierChanged = false;
            var msg = {
                Text: isEditing
                    ? '{0} saved successfully.'
                    : '{0} created successfully.',
                Params: ['Plan'],
            };
            ctrl.broadcastChannel('benefitPlan', res);
            toastrFactory.success(msg, 'Success');
            if (history.length > 1) {
                history.back();
            }
            else {
                console.log($location)
                $scope.setTitle('Plans');
                $location.path('BusinessCenter/Insurance/Plans');
            }
        };
        ctrl.broadcastChannel = function (broadcastType, broadcastPayLoad) {
            var broadCastService = $injector.get('BroadCastService');
            broadCastService.publish({
                type: broadcastType,
                payload: broadcastPayLoad,
            });
        };
        ctrl.saveOnError = function (err) {
            $scope.disableSaveButton = false;
            var isEditing = $scope.editing;
            var msg = {
                Text: isEditing
                    ? 'Failed to save {0}. Please try again.'
                    : 'Failed to create {0}. Please try again.',
                Params: ['plan'],
            };
            toastrFactory.error(msg, 'Error');
        };

        $scope.copyPlan = function (benefitPlan) {
            tabLauncher.launchNewTab(
                '#/BusinessCenter/Insurance/Plans/Create?guid=' +
                benefitPlan.BenefitId +
                '&isCopy=true'
            );
        };

        $scope.checkForDuplicates = function (benefitPlan) {
            $scope.checkingForDuplicates = true;

            $timeout.cancel(ctrl.duplicateCheckTimer);

            ctrl.duplicateCheckTimer = $timeout(function () {
                ctrl.findDuplicates(benefitPlan);
            }, 1000);
        };

        $scope.setActiveStatus = function (plan) {
            if (!plan.IsActive) {
                if (plan.IsLinkedToPatient) {
                    plan.IsActive = true;
                    var title = localize.getLocalizedString('Invalid Action');
                    var message = localize.getLocalizedString(
                        'This benefit plan has patients attached to it and cannot be inactivated until those patients are removed. View the "Patients by Benefit Plan" report for a list of patients.'
                    );
                    var button1Text = localize.getLocalizedString('OK');
                    modalFactory.ConfirmModal(title, message, button1Text);
                }
            } else if (
                $scope.selectedCarrier &&
                $scope.selectedCarrier.IsActive == false
            ) {
                var title = localize.getLocalizedString('Inactive Carrier');
                var message = localize.getLocalizedString(
                    'This benefit plan is attached to an inactive carrier. The carrier will be removed from this benefit plan. Continue?'
                );
                var button1Text = localize.getLocalizedString('Yes');
                var button2Text = localize.getLocalizedString('No');
                modalFactory
                    .ConfirmModal(title, message, button1Text, button2Text)
                    .then(ctrl.deleteCarrier, ctrl.revertActivity);
            }
        };
        ctrl.deleteCarrier = function () {
            $scope.carriers = _.filter($scope.carriers, function (carrier) {
                if (carrier.IsActive == true) {
                    return true;
                }
            });
            $scope.selectedCarrier = null;
            $scope.benefitPlan.CarrierId = null;
        };

        ctrl.revertActivity = function () {
            $scope.benefitPlan.IsActive = false;
        };

        ctrl.findDuplicates = function (benefitPlan) {
            ctrl.clearDuplicates();

            if (
                benefitPlan != null &&
                (benefitPlan.Name > '' || benefitPlan.PlanGroupNumber > '')
            ) {
                var params = {
                    name: benefitPlan.Name,
                    planGroupNumber: benefitPlan.PlanGroupNumber,
                    excludeId: benefitPlan.BenefitId,
                };

                businessCenterServices.BenefitPlan.findDuplicates(
                    params,
                    ctrl.findDuplicatesSuccess,
                    ctrl.findDuplicatesFailed
                );
            }
        };

        ctrl.findDuplicatesSuccess = function (result) {
            $scope.checkingForDuplicates = false;

            $scope.duplicates = result.Value;

            angular.forEach($scope.duplicates, ctrl.appendCarrierNameToPlan);
        };

        ctrl.appendCarrierNameToPlan = function (plan) {
            if (plan != null && plan.CarrierId > '') {
                var carrier = listHelper.findItemByFieldValue(
                    $scope.carriers,
                    'CarrierId',
                    plan.CarrierId
                );

                plan.CarrierName = carrier != null ? carrier.Name : '';
            }
        };

        ctrl.findDuplicatesFailed = function (error) {
            $scope.checkingForDuplicates = false;

            toastrFactory.error(
                { Text: 'Failed to retrieve list of {0}.', Params: ['duplicates'] },
                'Error'
            );
        };

        $scope.toggleDuplicateVisibilty = function () {
            $scope.showDuplicates = !$scope.showDuplicates;
        };

        ctrl.clearDuplicates = function () {
            $scope.duplicates = [];
        };

        $scope.cancel = function () {
            if ($scope.frmPlan.$pristine) {
                if (history.length > 1) {
                    history.back();
                }
                else {
                    $scope.setTitle('Plans');
                    $location.path('BusinessCenter/Insurance/Plans');
                }
            } else {
                modalFactory.CancelModal().then(ctrl.confirmCancel);
            }
        };

        ctrl.confirmCancel = function () {
            if (history.length > 1) {
                history.back();
            }
            else {
                $scope.setTitle('Plans');
                $location.path('BusinessCenter/Insurance/Plans');
            }
        };

        ctrl.hasContactInfo = function (benefitPlan) {
            return (
                benefitPlan != null &&
                (benefitPlan.AddressLine1 > '' ||
                    benefitPlan.AddressLine2 > '' ||
                    benefitPlan.City > '' ||
                    benefitPlan.State > '' ||
                    benefitPlan.ZipCode > '' ||
                    benefitPlan.Email > '' ||
                    benefitPlan.Website > '')
            );
        };

        ctrl.getInsuranceCarriersSuccess = function (result) {
            $scope.carriers = result.Value;
        };

        ctrl.getInsuranceCarriersFailed = function (error) {
            toastrFactory.error(
                { Text: 'Failed to retrieve list of {0}', Params: ['carriers'] },
                'Error'
            );
        };

        $scope.filterCarriers = function (searchTerm) {
            if (searchTerm > '') {
                $scope.filteredCarriers = $filter('filter')(
                    $scope.carriers,
                    ctrl.carrierFilter(searchTerm)
                );
            } else {
                $scope.filteredCarriers = [];
            }
        };

        ctrl.carrierFilter = function (searchTerm) {
            var toFind = searchTerm.toLowerCase();

            return function (carrier) {
                return (
                    carrier != null &&
                    ((carrier.Name && carrier.Name.toLowerCase().indexOf(toFind) > -1) ||
                        (carrier.PayerId &&
                            carrier.PayerId.toLowerCase().indexOf(toFind) > -1))
                );
            };
        };

        $scope.selectCarrier = function (carrier, firstTime) {
            if (carrier != null) {
                $scope.selectedCarrier = angular.copy(carrier);
                $scope.benefitPlan.CarrierId = carrier.CarrierId;
                $scope.searchTerm = '';
                $scope.feeSchedules = new kendo.data.ObservableArray(
                    carrier.FeeScheduleList
                );

                if (carrier.Website !== null) {

                    var subString1 = 'https://';
                    var subString2 = 'http://';

                    if (carrier.Website.indexOf(subString1) !== -1 || carrier.Website.indexOf(subString2) !== -1) {
                        $scope.websiteUrl = carrier.Website;

                    }
                    else {
                        $scope.websiteUrl = 'http://' + carrier.Website;
                    }
                }
                $scope.doesNotHaveFeeSchedules();
                if (firstTime) {
                    //wait two cycles before setting the FeeScheduleId.
                    //Seems to be necessary after the Angular upgrade, otherwise
                    //the kendo dropdown selected value reset to empty happens after we run this code instead of before
                    //it still seems to be happening even with nested timeouts, so I'm adding a 200 millisecond wait to the inner timeout
                    $timeout(function () {
                        $timeout(function () {
                            $scope.benefitPlan.FeeScheduleId =
                                $scope.benefitPlan.loadedFeeScheduleId;
                        }, 200);
                    });
                }
            } else {
                $scope.clearSelectedCarrier();
            }
        };

        $scope.clearSelectedCarrier = function () {
            $scope.selectedCarrier = null;
            $scope.benefitPlan.CarrierId = '00000000-0000-0000-0000-000000000000';
            $scope.searchTerm = '';
            $scope.feeSchedules = null;
            $scope.benefitPlan.FeeScheduleId = null;
            $scope.doesNotHaveFeeSchedules();
        };

        $scope.showContactInfoSection = function () {
            $scope.displayFlags.showContactInfo = !$scope.displayFlags
                .showContactInfo;
            if (!$scope.displayFlags.showContactInfo) {
                $scope.contactInfoLabel = $scope.editing
                    ? 'Edit contact information'
                    : 'Add contact information';
            } else {
                $scope.contactInfoLabel = 'Hide contact information';
            }
        };

        $scope.openCarrierTab = function (carrierId) {
            featureFlagService.getOnce$(fuseFlag.viewAddEditCarriersNewUi).subscribe((value) => {
                $scope.viewAddEditCarriersNewUi = value;
                if ($scope.viewAddEditCarriersNewUi) {
                    tabLauncher.launchNewTab(
                        '#/BusinessCenter/Insurance/v2/Insurance-Carrier/CarrierView/guid=' + carrierId
                    );
                }
                else {
                    tabLauncher.launchNewTab(
                        '#/BusinessCenter/Insurance/Carriers/Edit/?guid=' + carrierId
                    );
                }
            });
           
        };

        $scope.openFeeScheduleItem = function (feeScheduleId) {
            tabLauncher.launchNewTab(
                '#/BusinessCenter/Insurance/FeeSchedule/FeeScheduleDetails/' + feeScheduleId
            );
        };

        $scope.initialize = function () {
            var guid = $routeParams.guid ? $routeParams.guid : null;
            var isCopy = $routeParams.isCopy ? $routeParams.isCopy : null;
            var carrierId = $routeParams.carrierId ? $routeParams.carrierId : null;

            $scope.coveragesLoading = true;
            $scope.editing = guid != null && !isCopy;
            $scope.copying = isCopy;
            $scope.prefilledCarrier = carrierId !== null;
            $scope.displayFlags = {
                showContactInfo: false,
            };
            $scope.contactInfoLabel = guid
                ? 'Edit contact information'
                : 'Add contact information';
            $scope.promises.push(
                paymentTypesService
                    .getAllPaymentTypesMinimal(true, ctrl.paymentTypeCategories.Insurance)
                    .then(
                        function (res) {
                            ctrl.getInsurancePaymentTypesSuccess(res);
                        },
                        function () {
                            ctrl.getInsurancePaymentTypesFailure();
                        }
                    )
            );
            $scope.promises.push(
                adjustmentTypesService
                    .GetAllAdjustmentTypesWithOutCheckTransactions({ active: true })
                    .then(
                        function (res) {
                            ctrl.getAllAdjustmentTypesSuccess(res);
                        },
                        function () {
                            ctrl.getAllAdjustmentTypesFailure();
                        }
                    )
            );

            $scope.promises.push(
                locationIdentifierService.get().then(
                    function (res) {
                        ctrl.locationIdentifiersGetSuccess(res);
                    },
                    function () {
                        ctrl.locationIdentifiersGetFailure();
                    }
                )
            );

            $scope.promises.push(
                teamMemberIdentifierService.get().then(
                    function (res) {
                        ctrl.userIdentifiersGetSuccess(res);
                    },
                    function () {
                        ctrl.userIdentifiersGetFailure();
                    }
                )
            );

            $scope.promises.push(
                businessCenterServices.Carrier.get().$promise.then(
                    ctrl.getInsuranceCarriersSuccess,
                    ctrl.getInsuranceCarriersFailed
                )
            );
            $scope.promises.push(
                new Promise((resolve) => {
                    serviceTypesService.getAll().then(serviceTypes => {
                        $scope.serviceTypes = serviceTypes;
                        resolve();
                    });
                })
            )
            $scope.allServiceCodes = serviceCodes;

            if (guid) {
                var planPromise = businessCenterServices.BenefitPlan.get({
                    BenefitId: guid,
                    IsCopy: isCopy,
                });
                $scope.promises.push(
                    planPromise.$promise.then(
                        ctrl.prepareBenefitPlan,
                        ctrl.getBenefitPlanFailure
                    )
                );
            }

            $q.all($scope.promises).then(function () {
                //do all the stuff that needs more than one service call to be fully completed
                //do within a timeout to avoid kendo dropdown issues. By the time this code runs, all drop downs should be fully populated
                $timeout(function () {
                    // setting the benefit plan onto the scope this late in the page load ensures that all the kendo drop downs have been fully populated before
                    // their ng-models are updated, avoiding the ng-model reset that occurs after the options are done loading
                    if (planPromise) {
                        $scope.benefitPlan = planPromise.Value;
                    }
                    ctrl.populateCoverageListFromServiceTypes();
                    $scope.carriers = _.filter($scope.carriers, function (carrier) {
                        return (
                            carrier.IsActive ||
                            carrier.CarrierId == $scope.benefitPlan.CarrierId
                        );
                    });
                    if (
                        $scope.benefitPlan.CarrierId > '' &&
                        $scope.carriers != null &&
                        $scope.carriers.length > 0
                    ) {
                        $scope.selectCarrier(
                            _.find($scope.carriers, {
                                CarrierId: $scope.benefitPlan.CarrierId,
                            }),
                            true
                        );
                    }
                    _.each(
                        $scope.benefitPlan.ServiceCodeExceptions,
                        function (exception) {
                            var service = _.find($scope.allServiceCodes, {
                                ServiceCodeId: exception.ServiceCodeId,
                            });
                            exception.Name = service
                                ? service.Code + ' - ' + exception.Description
                                : exception.Description;
                            exception.CdtCode = exception.CdtCodeName;
                        }
                    );

                    $scope.loading = false;
                });
            });
        };

        ctrl.prepareBenefitPlan = function (res) {
            if (!res.Value.CoverageList) {
                res.Value.CoverageList = [];
            }

            if (!res.Value.ServiceCodeExceptions) {
                res.Value.ServiceCodeExceptions = [];
            }

            if (!res.Value.AlternativeBenefits) {
                res.Value.AlternativeBenefits = [];
            }
            if ($scope.copying) {
                angular.forEach(res.Value.CoverageList, function (coverage) {
                    delete coverage.BenefitCoverageId;
                    delete coverage.BenefitPlanId;
                });
                angular.forEach(res.Value.ServiceCodeExceptions, function (exception) {
                    exception.ServiceCodeExceptionId = null;
                    exception.BenefitPlanId = null;
                });
                angular.forEach(res.Value.AlternativeBenefits, function (altBenefit) {
                    altBenefit.AlternativeBenefitId = null;
                    altBenefit.BenefitPlanId = null;
                });
            }
            res.Value.loadedFeeScheduleId = res.Value.FeeScheduleId;
            res.Value.$originalIndividualDeductible = angular.copy(
                res.Value.IndividualDeductible
            );
            res.Value.$originalFamilyDeductible = angular.copy(
                res.Value.FamilyDeductible
            );
            res.Value.$originalAnnualBenefitMaxPerIndividual = angular.copy(
                res.Value.AnnualBenefitMaxPerIndividual
            );
            $scope.planName = angular.copy(res.Value.Name);
            ctrl.backupBenefitPlan(res.Value);
            $scope.checkTax();
        };

        ctrl.getBenefitPlanFailure = function (res) {
            toastrFactory.error(
                { Text: 'Failed to retrieve {0}.', Params: ['plan'] },
                'Error'
            );
        };

        ctrl.locationIdentifiersGetSuccess = function (res) {
            $scope.locationIdentifiers = res.Value;
        };

        ctrl.locationIdentifiersGetFailure = function () {
            toastrFactory.error(
                localize.getLocalizedString(
                    'Failed to retrieve the list of {0}. Refresh the page to try again.',
                    ['Location Identifiers']
                ),
                localize.getLocalizedString('Error')
            );
        };

        ctrl.userIdentifiersGetSuccess = function (res) {
            $scope.userIdentifiers = res.Value;
        };

        ctrl.userIdentifiersGetFailure = function () {
            toastrFactory.error(
                localize.getLocalizedString(
                    'Failed to retrieve the list of {0}. Refresh the page to try again.',
                    ['Location Identifiers']
                ),
                localize.getLocalizedString('Error')
            );
        };

        ctrl.getInsurancePaymentTypesSuccess = function (response) {
            $scope.insurancePaymentTypes = response.Value;
        };

        ctrl.getInsurancePaymentTypesFailure = function () {
            toastrFactory.error(
                localize.getLocalizedString(
                    'Failed to retrieve the list of {0}. Refresh the page to try again.',
                    ['Payment Types']
                ),
                localize.getLocalizedString('Error')
            );
        };

        // add negative adjustment types to scope.negativeAdjustmentTypes
        ctrl.getAllAdjustmentTypesSuccess = function (response) {
            $scope.negativeAdjustmentTypes = new kendo.data.ObservableArray(
                _.filter(response.Value, { IsPositive: false })
            );
        };

        ctrl.getAllAdjustmentTypesFailure = function () {
            toastrFactory.error(
                localize.getLocalizedString(
                    'Failed to retrieve the list of {0}. Refresh the page to try again.',
                    ['Adjustment Types']
                ),
                localize.getLocalizedString('Error')
            );
        };

        $scope.applySetAllNumber = function (setAllValue) {
            if (parseInt(setAllValue) <= 100 && parseInt(setAllValue) >= 0) {
                $scope.coverageAmtError = false;
                angular.forEach($scope.benefitPlan.CoverageList, function (coverage) {
                    coverage.CoveragePercent = setAllValue / 100;
                });
            } else {
                $scope.coverageAmtError = true;
            }
        };

        //#region store original variables for comparison

        ctrl.backupBenefitPlan = function (benefitPlan) {
            ctrl.originalBenefitPlan = angular.copy(benefitPlan);
        };

        //#endregion

        // Show/hide adjustments field
        $scope.toggleAdjustments = function () {
            var feesIns = $scope.benefitPlan.FeesIns;

            // Check to see if claims for this plan is marked 'yes', then show/hide the claim method field accordingly
            if (!$scope.editing) {
                if (feesIns == '2') {
                    $scope.benefitPlan.ApplyAdjustments = '1';
                } else {
                    $scope.benefitPlan.ApplyAdjustments = null;
                }
            } else {
                if (feesIns == '2' && $scope.benefitPlan.ApplyAdjustments == null) {
                    if (ctrl.originalBenefitPlan.ApplyAdjustments != null) {
                        $scope.benefitPlan.ApplyAdjustments =
                            ctrl.originalBenefitPlan.ApplyAdjustments;
                    } else {
                        $scope.benefitPlan.ApplyAdjustments = '1';
                    }
                }

                if (feesIns == '1') {
                    $scope.benefitPlan.ApplyAdjustments = null;
                }
            }
        };

        // Show/hide track claims field
        ctrl.toggleTrackClaims = function () {
            var claimMethod = $scope.benefitPlan.ClaimMethod;

            if (!$scope.editing) {
                if (claimMethod) {
                    $scope.benefitPlan.TrackClaims = true;
                } else {
                    $scope.benefitPlan.TrackClaims = null;
                }
            } else {
                if (claimMethod && $scope.benefitPlan.TrackClaims == null) {
                    if (ctrl.originalBenefitPlan.TrackClaims != null) {
                        $scope.benefitPlan.TrackClaims =
                            ctrl.originalBenefitPlan.TrackClaims;
                    } else {
                        $scope.benefitPlan.TrackClaims = true;
                    }
                }

                if (!claimMethod) {
                    $scope.benefitPlan.TrackClaims = null;
                }
            }
        };

        /** need to keep track if a deductible or maximum has changed to an existing plan */
        $scope.amountHasChanged = function (
            affectedAmount,
            originalAmount,
            currentAmount
        ) {
            if (!$scope.editing) return;

            var hasAffectedAmount = $scope.benefitPlan.$affectedAmounts
                ? $filter('filter')($scope.benefitPlan.$affectedAmounts, {
                    Name: affectedAmount,
                }).length > 0
                : false;

            if (!hasAffectedAmount) {
                if (!$scope.benefitPlan.$affectedAmounts)
                    $scope.benefitPlan.$affectedAmounts = [];

                $scope.benefitPlan.$affectedAmounts.push({
                    Name: affectedAmount,
                    Original: originalAmount,
                    Current: currentAmount,
                });
            } else {
                var index = listHelper.findIndexByFieldValue(
                    $scope.benefitPlan.$affectedAmounts,
                    'Name',
                    affectedAmount
                );
                affectedAmount = $scope.benefitPlan.$affectedAmounts[index];

                if (affectedAmount.Original != currentAmount) {
                    affectedAmount.Current = currentAmount;
                } else {
                    $scope.benefitPlan.$affectedAmounts.splice(index, 1);
                }
            }
        };

        //service code exceptions
        $scope.addServiceCodeException = function () {
            ctrl.filterServiceCodes();

            modalFactory
                .Modal({
                    templateUrl:
                        'App/BusinessCenter/insurance/benefit-plans/dental-benefit-plan-crud/service-code-exception-modal/service-code-exception-modal.html',
                    backdrop: 'static',
                    keyboard: false,
                    size: 'lg',
                    windowClass: 'center-modal',
                    controller: 'ServiceCodeExceptionModalController',
                    amfa: 'soar-ins-ibplan-edit',
                    resolve: {
                        availableCodes: function () {
                            return $scope.availableCodes;
                        },
                    },
                })
                .result.then(function (exception) {
                    var alreadyExists = false;
                    angular.forEach(
                        $scope.benefitPlan.ServiceCodeExceptions,
                        function (existingException) {
                            if (exception.ServiceCodeId == existingException.ServiceCodeId) {
                                alreadyExists = true;
                            }
                        }
                    );
                    if (!alreadyExists) {
                        var exceptionDto = {
                            Name: exception.Code + ' - ' + exception.Description,
                            CdtCode: exception.CdtCodeName,
                            Deductible: true,
                            CoveragePercent: 0,
                            Copay: 0,
                            ServiceCodeId: exception.ServiceCodeId,
                            ObjectState: saveStates.Add,
                        };
                        $scope.benefitPlan.ServiceCodeExceptions.push(exceptionDto);
                    }
                });
        };

        $scope.removeServiceCodeException = function (exception) {
            var index = $scope.benefitPlan.ServiceCodeExceptions.indexOf(exception);
            $scope.benefitPlan.ServiceCodeExceptions.splice(index, 1);
        };

        //Helper methods
        ctrl.filterServiceCodes = function () {
            $scope.availableCodes = _.filter($scope.allServiceCodes, function (sC) {
                return (
                    sC.SubmitOnInsurance === true &&
                    sC.IsSwiftPickCode === false &&
                    sC.CdtCodeId &&
                    !ctrl.isServiceCodeUsedInServiceCodeExceptions(sC.ServiceCodeId) &&
                    !ctrl.isServiceCodeUsedInAlternativeBenefits(sC.ServiceCodeId)
                );
            });
        };

        ctrl.isServiceCodeUsedInServiceCodeExceptions = function (serviceCodeId) {
            return _.some(
                $scope.benefitPlan.ServiceCodeExceptions,
                function (serviceCodeException) {
                    return _.isEqual(serviceCodeException.ServiceCodeId, serviceCodeId);
                }
            );
        };

        ctrl.isServiceCodeUsedInAlternativeBenefits = function (serviceCodeId) {
            return _.some(
                $scope.benefitPlan.AlternativeBenefits,
                function (alternativeBenefit) {
                    return _.isEqual(
                        alternativeBenefit.ChildServiceCodeId,
                        serviceCodeId
                    );
                }
            );
            // Note: it is okay if serviceCodeId matches ParentServiceCodeId
        };

        ctrl.populateCoverageListFromServiceTypes = function () {
            _.forEach($scope.serviceTypes, function (serviceType) {
                var coverage = _.find($scope.benefitPlan.CoverageList, {
                    ServiceTypeId: serviceType.ServiceTypeId,
                });
                if (!coverage) {
                    $scope.benefitPlan.CoverageList.push({
                        Deductible: true,
                        CoveragePercent: 0,
                        Copay: 0,
                        ServiceTypeId: serviceType.ServiceTypeId,
                        $serviceTypeName: serviceType.Description,
                        ObjectState: saveStates.Add,
                    });
                } else {
                    coverage.$serviceTypeName = serviceType.Description;
                }
            });

            $scope.coveragesLoading = false;
        };

        ctrl.setFocusOnFirstError = function () {
            $timeout(function () {
                var firstInvalidElement;
                // set the focus on the first error type input
                firstInvalidElement = angular.element('input.ng-invalid').first();
                if (firstInvalidElement.length > 0) {
                    firstInvalidElement.focus();
                } else if (
                    $scope.benefitPlan.FeesIns == '2'
                        ? !$scope.benefitPlan.AdjustmentTypeId
                        : false
                ) {
                    $($('#inpDefaultNegativeAdj .k-widget.k-dropdown').find('select')[0])
                        .data('kendoDropDownList')
                        .focus();
                } else {
                    firstInvalidElement = angular.element('textarea.ng-invalid').first();
                    if (firstInvalidElement.length > 0) {
                        firstInvalidElement.focus();
                    }
                }
            }, 500);
        };
    },
]);
