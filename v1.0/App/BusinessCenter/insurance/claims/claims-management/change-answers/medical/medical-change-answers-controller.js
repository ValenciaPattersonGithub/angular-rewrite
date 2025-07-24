'use strict';
angular
    .module('Soar.BusinessCenter')
    .controller('MedicalChangeAnswersController', [
        '$scope',
        '$routeParams',
        '$location',
        '$q',
        '$timeout',
        '$filter',
        'localize',
        'toastrFactory',
        'patSecurityService',
        'CommonServices',
        'StaticData',
        'ClaimEnumService',
        function (
            $scope,
            $routeParams,
            $location,
            $q,
            $timeout,
            $filter,
            localize,
            toastrFactory,
            patSecurityService,
            commonServices,
            staticData,
            claimEnumService
        ) {
            var ctrl = this;
            $scope.loadingClaim = true;
            $scope.canEdit = false;
            $scope.states = [];
            $scope.today = moment();
            $scope.UnableToWorkStartDate = null;
            $scope.UnableToWorkEndDate = null;
            $scope.HosipitalizationStartDate = null;
            $scope.HosipitalizationEndDate = null;
            $scope.CurrentConditionDate = null;
            $scope.OtherConditionDate = null;

            $scope.coverageTypes = [
                { Text: localize.getLocalizedString('Medicare'), Value: 1 },
                { Text: localize.getLocalizedString('Medicaid'), Value: 2 },
                { Text: localize.getLocalizedString('Tricare'), Value: 3 },
                { Text: localize.getLocalizedString('ChampVA'), Value: 4 },
                { Text: localize.getLocalizedString('Group Health Plan'), Value: 5 },
                { Text: localize.getLocalizedString('FECA BLK LUNG'), Value: 6 },
                { Text: localize.getLocalizedString('Other'), Value: 7 },
            ];

            $scope.claimCodes = [
                {
                    Text: localize.getLocalizedString('W2 - Duplicate'),
                    Value: 'W2 - Duplicate',
                },
                {
                    Text: localize.getLocalizedString('W3 - Level 1 appeal'),
                    Value: 'W3 - Level 1 appeal',
                },
                {
                    Text: localize.getLocalizedString('W4 - Level 2 appeal'),
                    Value: 'W4 - Level 2 appeal',
                },
                {
                    Text: localize.getLocalizedString('W5 - Level 3 appeal'),
                    Value: 'W5 - Level 3 appeal',
                },
            ];

            $scope.currentQualifiers = [
                {
                    Text: localize.getLocalizedString(
                        '431 - Onset of Current Symptoms or Illness'
                    ),
                    Value: '431',
                },
                {
                    Text: localize.getLocalizedString('484 - Last Menstrual Period'),
                    Value: '484',
                },
            ];

            $scope.otherQualifiers = [
                {
                    Text: localize.getLocalizedString('454 - Initial Treatment'),
                    Value: '454',
                },
                {
                    Text: localize.getLocalizedString(
                        '304 - Latest Visit or Consultation'
                    ),
                    Value: '304',
                },
                {
                    Text: localize.getLocalizedString(
                        '453 - Acute Manifestation of a Chronic Condition'
                    ),
                    Value: '453',
                },
                { Text: localize.getLocalizedString('439 - Accident'), Value: '439' },
                { Text: localize.getLocalizedString('455 - Last X-ray'), Value: '455' },
                {
                    Text: localize.getLocalizedString('471 - Prescription'),
                    Value: '471',
                },
                {
                    Text: localize.getLocalizedString(
                        '090 - Report Start (Assumed Care Date)'
                    ),
                    Value: '090',
                },
                {
                    Text: localize.getLocalizedString(
                        '091 - Report End (Relinquished Care Date)'
                    ),
                    Value: '091',
                },
                {
                    Text: localize.getLocalizedString(
                        '444 - First Visit or Consultation'
                    ),
                    Value: '444',
                },
            ];

            $scope.referingProviderQualifiers = [
                {
                    Text: localize.getLocalizedString('DN - Referring Provider'),
                    Value: '1',
                },
                {
                    Text: localize.getLocalizedString('DK - Ordering Provider'),
                    Value: '2',
                },
                {
                    Text: localize.getLocalizedString('DQ - Supervising Provider'),
                    Value: '3',
                },
            ];

            $scope.referingProviderIdTypes = [
                {
                    Text: localize.getLocalizedString('0B - State License Number'),
                    Value: '1',
                },
                {
                    Text: localize.getLocalizedString('1G - Provider UPIN Number'),
                    Value: '2',
                },
                {
                    Text: localize.getLocalizedString('G2 - Provider Commercial Number'),
                    Value: '3',
                },
                {
                    Text: localize.getLocalizedString('LU - Location Number'),
                    Value: '4',
                },
            ];

            ctrl.addMissingValues = function (placeOfTreatmentList) {
                let result = [];
                for (let i = 1; i <= 99; i++) {
                    let placeOfTreatmentItem = placeOfTreatmentList.find(item => item.code === i);
                    if (placeOfTreatmentItem) {
                        result.push({ Value: placeOfTreatmentItem.code, Text: placeOfTreatmentItem.description });
                    } else {
                        result.push({ Value: i, Text: i + ' - Unspecified' });
                    }
                }
                return result;
            }

            $scope.placeOfTreatmentOptions = ctrl.addMissingValues(claimEnumService.getPlaceOfTreatment());

            $scope.codeLabels = [
                'A',
                'B',
                'C',
                'D',
                'E',
                'F',
                'G',
                'H',
                'I',
                'J',
                'K',
                'L',
            ];

            $scope.cancel = function () {
                $location.path('BusinessCenter/Insurance');
            };

            $scope.save = function () {
                ctrl.applyFixDates();

                if (ctrl.validate($scope.claim)) {
                    angular.forEach($scope.claim.Details, function (detail) {
                        detail.IsFamilyPlanning =
                            detail.IsFamilyPlanningString &&
                                detail.IsFamilyPlanningString === 'Y'
                                ? true
                                : false;
                    });
                    //remove null/empty diagnosis codes
                    $scope.claim.DiagnosisCodes = _.filter(
                        $scope.claim.DiagnosisCodes,
                        function (code) {
                            return code;
                        }
                    );
                    commonServices.Insurance.Claim.updateMedicalCMS1500ById(
                        { claimId: ctrl.claimId },
                        $scope.claim,
                        ctrl.updateClaimSuccess,
                        ctrl.updateClaimFailure
                    );
                }
            };

            ctrl.updateClaimSuccess = function (res) {
                toastrFactory.success(
                    localize.getLocalizedString(
                        'Successfully updated claim information.'
                    ),
                    'Success'
                );
                $scope.cancel();
            };

            ctrl.updateClaimFailure = function (res) {
                toastrFactory.error(
                    localize.getLocalizedString('Failed to update Claim'),
                    'Failure'
                );
                ctrl.fillCodes($scope.claim);
            };

            ctrl.getClaimFailure = function (res) {
                toastrFactory.error(
                    localize.getLocalizedString(
                        'Failed to retrieve {0}. Please try again.',
                        ['claim']
                    )
                );
                $scope.loadingClaim = false;
            };

            ctrl.getStatesFailure = function (res) {
                toastrFactory.error(
                    localize.getLocalizedString(
                        'Failed to retrieve {0}. Please try again.',
                        ['states']
                    )
                );
                $scope.loadingClaim = false;
            };

            ctrl.setupWatches = function () {
                $scope.$watch('CurrentConditionDate', function (nv, ov) {
                    if (nv !== ov && nv === null) {
                        $scope.claim.CurrentConditionQualifier = '0';
                    }
                });
                $scope.$watch('OtherConditionDate', function (nv, ov) {
                    if (nv !== ov && nv === null) {
                        $scope.claim.OtherConditionQualifier = '0';
                    }
                });
            };

            //add null values to get DiagnosisCodes to twelve values
            ctrl.fillCodes = function (claim) {
                claim.DiagnosisCodes = claim.DiagnosisCodes ? claim.DiagnosisCodes : [];
                while (claim.DiagnosisCodes.length < 12) {
                    claim.DiagnosisCodes.push(null);
                }
            };

            ctrl.finishSetup = function (res) {
                $scope.states = res[1].Value;
                res[0].Value.CoverageType =
                    res[0].Value.CoverageType === 0 ? 7 : res[0].Value.CoverageType;
                ctrl.fillCodes(res[0].Value);
                angular.forEach(res[0].Value.Details, function (detail) {
                    detail.IsFamilyPlanningString = detail.IsFamilyPlanning ? 'Y' : 'N';
                });
                $timeout(function () {
                    $scope.claim = res[0].Value;
                    ctrl.assignTimes();
                    $scope.loadingClaim = false;
                    ctrl.setupWatches();
                    if ($scope.claim.Status !== 1 && $scope.claim.Status !== 3) {
                        $scope.disabled = true;
                    }
                });
            };

            $scope.isAutoAccidentChange = function () {
                if (!$scope.claim.IsAutoAccident) {
                    $scope.claim.AutoAccidentState = null;
                }
            };

            $scope.outsideLabChanged = function (value) {
                if (!value) {
                    $scope.claim.OutsideLabCharge = 0;
                }
            };

            $scope.isPolicyHolderSignatureOnFileChanged = function (value) {
                if (value) {
                    $scope.claim.PolicyHolderSignatureDate = new Date().toUTCString();
                } else {
                    $scope.claim.PolicyHolderSignatureDate = null;
                }
            };

            $scope.referringProviderBlur = function () {
                if (!$scope.claim.ReferringPhysicianName) {
                    $scope.claim.ReferringPhysicianQualifier = '0';
                    $scope.claim.ReferringPhysicianNpi = null;
                }
            };

            $scope.otherReferringPhysicianBlur = function () {
                if (!$scope.claim.ReferringPhysicianOtherId) {
                    $scope.claim.ReferringPhysicianOtherIdType = '0';
                }
            };

            $scope.modifierKeyPress = function (event, detail) {
                var key = event.key.toUpperCase();
                if (
                    key !== 'BACKSPACE' &&
                    key !== 'DELETE' &&
                    key !== 'ARROWRIGHT' &&
                    key !== 'ARROWLEFT'
                ) {
                    var pointer = $scope.codeLabels.indexOf(key);
                    //key is one of the allowed letters, corresponds to code that has a value, code is not already in the pointer and pointer is less than four codes
                    if (
                        pointer !== -1 &&
                        $scope.claim.DiagnosisCodes[pointer] &&
                        (!detail.DiagnosisPointer ||
                            (detail.DiagnosisPointer.indexOf(key) === -1 &&
                                detail.DiagnosisPointer.length < 4))
                    ) {
                        detail.DiagnosisPointer = detail.DiagnosisPointer
                            ? detail.DiagnosisPointer + key
                            : key;
                    }
                    event.preventDefault();
                }
            };

            $scope.diagnosisCodeBlur = function (index) {
                if (!$scope.claim.DiagnosisCodes[index]) {
                    angular.forEach($scope.claim.Details, function (detail) {
                        if (detail.DiagnosisPointer) {
                            detail.DiagnosisPointer = detail.DiagnosisPointer.replace(
                                $scope.codeLabels[index],
                                ''
                            );
                        }
                    });
                }
            };

            $scope.emgKeyPress = function (event, detail) {
                var key = event.key.toUpperCase();
                if (
                    key !== 'BACKSPACE' &&
                    key !== 'DELETE' &&
                    key !== 'ARROWRIGHT' &&
                    key !== 'ARROWLEFT'
                ) {
                    if (key === 'Y' && !detail.EmergencyService) {
                        detail.EmergencyService = key;
                    }
                    event.preventDefault();
                }
            };

            $scope.planningKeyPress = function (event, detail) {
                var key = event.key.toUpperCase();
                if (
                    key !== 'BACKSPACE' &&
                    key !== 'DELETE' &&
                    key !== 'ARROWRIGHT' &&
                    key !== 'ARROWLEFT'
                ) {
                    if ((key === 'Y' || key === 'N') && !detail.IsFamilyPlanningString) {
                        detail.IsFamilyPlanningString = key;
                    }
                    event.preventDefault();
                }
            };

            $scope.toggleSelect = function (detail, index) {
                if (!detail.showPlaceOfService && !$scope.disabled) {
                    detail.showPlaceOfService = true;
                    $timeout(function () {
                        angular.element('#poshidden' + index).focus();
                    });
                }
            };

            //Timezone adjustment area
            ctrl.applyFixDates = function () {
                if ($scope.UnableToWorkStartDate) {
                    $scope.claim.UnableToWorkStartDate = ctrl.timeFix(
                        $scope.UnableToWorkStartDate
                    );
                } else {
                    $scope.claim.UnableToWorkStartDate = null;
                }

                if ($scope.UnableToWorkEndDate) {
                    $scope.claim.UnableToWorkEndDate = ctrl.timeFix(
                        $scope.UnableToWorkEndDate
                    );
                } else {
                    $scope.claim.UnableToWorkEndDate = null;
                }

                if ($scope.HosipitalizationStartDate) {
                    $scope.claim.HosipitalizationStartDate = ctrl.timeFix(
                        $scope.HosipitalizationStartDate
                    );
                } else {
                    $scope.claim.HosipitalizationStartDate = null;
                }

                if ($scope.HosipitalizationEndDate) {
                    $scope.claim.HosipitalizationEndDate = ctrl.timeFix(
                        $scope.HosipitalizationEndDate
                    );
                } else {
                    $scope.claim.HosipitalizationEndDate = null;
                }

                if ($scope.CurrentConditionDate) {
                    $scope.claim.CurrentConditionDate = ctrl.timeFix(
                        $scope.CurrentConditionDate
                    );
                } else {
                    $scope.claim.CurrentConditionDate = null;
                }

                if ($scope.OtherConditionDate) {
                    $scope.claim.OtherConditionDate = ctrl.timeFix(
                        $scope.OtherConditionDate
                    );
                } else {
                    $scope.claim.OtherConditionDate = null;
                }
            };

            ctrl.assignTimes = function () {
                if ($scope.claim.UnableToWorkStartDate) {
                    $scope.UnableToWorkStartDate = angular.copy(
                        $scope.claim.UnableToWorkStartDate
                    );
                }
                if ($scope.claim.UnableToWorkEndDate) {
                    $scope.UnableToWorkEndDate = angular.copy(
                        $scope.claim.UnableToWorkEndDate
                    );
                }
                if ($scope.claim.HosipitalizationStartDate) {
                    $scope.HosipitalizationStartDate = angular.copy(
                        $scope.claim.HosipitalizationStartDate
                    );
                }
                if ($scope.claim.HosipitalizationEndDate) {
                    $scope.HosipitalizationEndDate = angular.copy(
                        $scope.claim.HosipitalizationEndDate
                    );
                }
                if ($scope.claim.CurrentConditionDate) {
                    $scope.CurrentConditionDate = angular.copy(
                        $scope.claim.CurrentConditionDate
                    );
                }
                if ($scope.claim.OtherConditionDate) {
                    $scope.OtherConditionDate = angular.copy(
                        $scope.claim.OtherConditionDate
                    );
                }
            };

            ctrl.timeFix = function (dateTime) {
                return moment(dateTime).format('LL');
            };

            ctrl.validate = function (claim) {
                var valid = true;
                if (
                    !_.find($scope.coverageTypes, function (type) {
                        return type.Value == claim.CoverageType;
                    })
                ) {
                    valid = false;
                }
                if (
                    claim.IsAutoAccident &&
                    !_.find($scope.states, function (st) {
                        return st.Abbreviation == claim.AutoAccidentState;
                    })
                ) {
                    valid = false;
                }
                if (!claim.IsAutoAccident && claim.AutoAccidentState) {
                    valid = false;
                }
                if (
                    claim.ClaimCodes &&
                    !_.find($scope.claimCodes, function (code) {
                        return code.Value === claim.ClaimCodes;
                    })
                ) {
                    valid = false;
                }
                if (claim.OtherAgencyClaimId && claim.OtherAgencyClaimId.length > 28) {
                    valid = false;
                }
                if (
                    (claim.UnableToWorkStartDate && !claim.UnableToWorkEndDate) ||
                    (!claim.UnableToWorkStartDate && claim.UnableToWorkEndDate)
                ) {
                    valid = false;
                }
                if (
                    claim.UnableToWorkStartDate &&
                    claim.UnableToWorkEndDate &&
                    moment(new Date(claim.UnableToWorkStartDate)) >
                    moment(new Date(claim.UnableToWorkEndDate))
                ) {
                    valid = false;
                }
                if (
                    (claim.HosipitalizationStartDate && !claim.HosipitalizationEndDate) ||
                    (!claim.HosipitalizationStartDate && claim.HosipitalizationEndDate)
                ) {
                    valid = false;
                }
                if (claim.CurrentConditionDate && !claim.CurrentConditionQualifier) {
                    valid = false;
                }
                if (
                    claim.CurrentConditionDate &&
                    moment(new Date(claim.CurrentConditionDate)) > $scope.today
                ) {
                    valid = false;
                }
                if (claim.OtherConditionDate && !claim.OtherConditionQualifier) {
                    valid = false;
                }
                if (
                    claim.OtherConditionDate &&
                    moment(new Date(claim.OtherConditionDate)) > $scope.today
                ) {
                    valid = false;
                }
                if (
                    claim.HosipitalizationStartDate &&
                    claim.HosipitalizationEndDate &&
                    moment(new Date(claim.HosipitalizationStartDate)) >
                    moment(new Date(claim.HosipitalizationEndDate))
                ) {
                    valid = false;
                }
                if (
                    claim.OutsideLab &&
                    (claim.OutsideLabCharge < 0.001 || claim.OutsideLabCharge > 999999.99)
                ) {
                    valid = false;
                }
                if (!claim.OutsideLab && claim.OutsideLabCharge !== 0) {
                    valid = false;
                }
                if (
                    claim.ReferringPhysicianName &&
                    !claim.ReferringPhysicianQualifier
                ) {
                    valid = false;
                }
                if (
                    claim.ReferringPhysicianName &&
                    (!claim.ReferringPhysicianNpi ||
                        claim.ReferringPhysicianNpi.length !== 10)
                ) {
                    valid = false;
                }
                if (
                    claim.ReferringPhysicianOtherId &&
                    !claim.ReferringPhysicianOtherIdType
                ) {
                    valid = false;
                }
                if (
                    claim.IsPolicyHolderSignatureOnFile &&
                    !claim.PolicyHolderSignatureDate
                ) {
                    valid = false;
                }
                if (
                    !claim.IsPolicyHolderSignatureOnFile &&
                    claim.PolicyHolderSignatureDate
                ) {
                    valid = false;
                }
                if (!$filter('medicalClaimDiagnosisCodesAreValid')(claim)) {
                    valid = false;
                    $('#codeLabelsA').focus();
                }
                angular.forEach(claim.Details, function (detail) {
                    if (
                        !_.find($scope.placeOfTreatmentOptions, function (option) {
                            return option.Value === detail.PlaceOfService;
                        })
                    ) {
                        valid = false;
                    }
                    if (detail.EmergencyService && detail.EmergencyService != 'Y') {
                        valid = false;
                    }
                    angular.forEach(detail.ProcedureCodeModifiers, function (modifier) {
                        if (modifier && modifier.length > 2) {
                            valid = false;
                        }
                    });
                    if (detail.DiagnosisPointer) {
                        angular.forEach(detail.DiagnosisPointer, function (char) {
                            if (!claim.DiagnosisCodes[$scope.codeLabels.indexOf(char)]) {
                                valid = false;
                            }
                        });
                    }
                    if (detail.EPSDT && detail.EPSDT.length > 2) {
                        valid = false;
                    }
                    if (
                        detail.IsFamilyPlanningString &&
                        detail.IsFamilyPlanningString !== 'Y' &&
                        detail.IsFamilyPlanningString !== 'N'
                    ) {
                        valid = false;
                    }
                });
                $scope.showErrors = !valid;
                return valid;
            };

            ctrl.init = function () {
                if (
                    patSecurityService.IsAuthorizedByAbbreviation(
                        'soar-ins-iclaim-view'
                    ) &&
                    $routeParams.claimId
                ) {
                    ctrl.claimId = $routeParams.claimId;
                    var promises = [];
                    promises.push(
                        commonServices.Insurance.Claim.getMedicalCMS1500ById(
                            { claimId: ctrl.claimId },
                            angular.noop,
                            ctrl.getClaimFailure
                        ).$promise
                    );
                    promises.push(
                        staticData.States().then(undefined, ctrl.getStatesFailure)
                    );
                    $q.all(promises).then(ctrl.finishSetup);
                    $scope.canEdit = patSecurityService.IsAuthorizedByAbbreviation(
                        'soar-ins-iclaim-edit'
                    );
                } else {
                    $scope.cancel();
                }
            };

            ctrl.init();
        },
    ]);
