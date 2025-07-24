'use strict';

angular
    .module('Soar.BusinessCenter')
    .controller('DentalChangeAnswersController', [
        'toastrFactory',
        'localize',
        '$scope',
        '$routeParams',
        '$location',
        '$q',
        'ModalFactory',
        'ClaimsService',
        'CommonServices',
        'patSecurityService',
        'StaticData',
        'ClaimEnumService',
        'PlaceOfTreatmentEnums',
        'FeatureFlagService',
        'FuseFlag',
        function (
            toastrFactory,
            localize,
            $scope,
            $routeParams,
            $location,
            $q,
            modalFactory,
            claimsService,
            commonServices,
            patSecurityService,
            staticData,
            claimEnumService,
            placeOfTreatmentEnums,
            featureFlagService,
            fuseFlag
        ) {
            //On page load:
            //get claim
            //get claimEntity
            //get benefitPlan - needs benefitPlanId from claimEntity

            var ctrl = this;
            $scope.claim = {};
            $scope.claimEntity = {};
            $scope.benefitPlan = {};
            $scope.isLoading = true;
            $scope.invalidDiagPointer = false;
            $scope.patientName = '';
            $scope.isReadOnly = true;
            $scope.canEdit = true;
            $scope.states = [];
            $scope.isTreatmentForOrthodontics = null;
            $scope.isReplacementOfProsthesis = null;
            $scope.isOccupationalInjury = null;
            $scope.isAutoAccident = null;
            $scope.isOtherAccident = null;
            $scope.DateAppliancePlaced = null;
            $scope.DateOfPriorPlacement = null;
            $scope.DateOfAccident = null;
            $scope.editClaimAmfa = 'soar-ins-iclaim-edit';
            ctrl.tempTotalMonthsOfTreatmentRemaining = null;
            ctrl.tempTotalMonthsOfTreatment = null;
            ctrl.claimBackup = null;
            $scope.placeOfTreatmentEnums = placeOfTreatmentEnums;

            featureFlagService.getOnce$(fuseFlag.MedicareAdministrativeModifier).subscribe((value) => {
                $scope.showMedicareModifier =  value;
            });

            //get methods
            ctrl.getPageData = function () {
                var service = [
                    {
                        Call: commonServices.Insurance.Claim.getJ430DClaimById,
                        Params: { claimId: $routeParams.claimId },
                        OnSuccess: ctrl.getClaimSuccess,
                        OnError: ctrl.failureToastr('get claim'),
                    },
                    {
                        Call: claimsService.getClaimEntityByClaimId,
                        Params: { claimId: $routeParams.claimId },
                        OnSuccess: ctrl.getClaimEntitySuccess,
                        OnError: ctrl.failureToastr('get claim entity'),
                    },
                ];

                return service;
            };

            ctrl.getBenefitPlan = function () {
                commonServices.Insurance.BenefitPlan.getById(
                    { BenefitId: $scope.claimEntity.BenefitPlanId },
                    ctrl.getBenefitPlanSuccess,
                    ctrl.failureToastr('get benefit plan')
                );
            };

            //success methods
            ctrl.getClaimSuccess = function (result) {
                $scope.claim = result.Value;
                ctrl.claimBackup = _.cloneDeep($scope.claim);
                $scope.claim.J430DMain.TotalMonthsOfTreatment = parseInt(
                    $scope.claim.J430DMain.TotalMonthsOfTreatment
                );
                ctrl.setTreatmentResultOfCheckboxes();

                $scope.calculatedFees = ctrl.calculateFees();
                $scope.patientName = ctrl.getPatientDisplayName();
                $scope.isReadOnly =
                    $scope.claim.ClaimCommon.Status !== 1 &&
                    $scope.claim.ClaimCommon.Status !== 3; // can't edit if not unsubmitted
                ctrl.setupKendoGrid();

                $scope.placeOfTreatment = ($scope.placeOfTreatmentList.findIndex(x => x.code == $scope.claim.J430DMain.PlaceOfTreatment) < 0) ? placeOfTreatmentEnums.Other : $scope.claim.J430DMain.PlaceOfTreatment;

                if ($scope.claim.J430DMain.PlaceOfTreatment == placeOfTreatmentEnums.Office) {
                    ctrl.clearTreatingDentistFields();
                }
                $scope.claim.J430DMain.PlaceOfTreatment = $scope.fixValueLength(
                    $scope.claim.J430DMain.PlaceOfTreatment
                );
            };

            $scope.fixPlaceOfTreatmentLength = function () {
                $scope.claim.J430DMain.PlaceOfTreatment = $scope.fixValueLength(
                    $scope.claim.J430DMain.PlaceOfTreatment
                );
            };

            $scope.fixValueLength = function (value) {
                if (_.isNumber(value)) {
                    if (value < 10) {
                        return ('0' + value).toString();
                    } else {
                        return value.toString();
                    }
                } else {
                    if (value != undefined) {
                        if (value.length < 2) {
                            return '0' + value;
                        } else {
                            return value;
                        }
                    }
                }
            };

            ctrl.getClaimEntitySuccess = function (result) {
                if (result.Value) {
                    $scope.claimEntity = result.Value;
                    ctrl.getBenefitPlan();
                } else {
                    ctrl.failureToastr('get claim entity')();
                }
            };

            ctrl.getBenefitPlanSuccess = function (result) {
                if (result.Value) {
                    $scope.benefitPlan = result.Value;
                    ctrl.setAuthPaymentTrackClaimChkBoxes();
                } else {
                    ctrl.failureToastr('get benefit plan')();
                }
                $scope.isLoading = false;
            };

            ctrl.updateClaimSuccess = function (result) {
                $scope.claim = result.Value;
                toastrFactory.success(
                    localize.getLocalizedString(
                        'Successfully updated claim information.'
                    ),
                    'Success'
                );
                $location.path(_.escape('BusinessCenter/Insurance'));
            };

            //failure methods
            ctrl.failureToastr = function (item) {
                return function () {
                    toastrFactory.error(
                        localize.getLocalizedString('Failed to ' + item + '.'),
                        'Failure'
                    );
                    $scope.isLoading = false;
                };
            };

            ctrl.updateClaimFailure = function (result) {
                if (result.status !== 400) {
                    ctrl.failureToastr('update claim')();
                } else {
                    toastrFactory.error(
                        localize.getLocalizedString(
                            result.data.InvalidProperties[0].ValidationMessage
                        ),
                        localize.getLocalizedString('Error')
                    );
                }
            };

            ctrl.getStatesFailure = function (res) {
                toastrFactory.error(
                    localize.getLocalizedString(
                        'Failed to retrieve {0}. Please try again.',
                        ['states']
                    )
                );
                $scope.isLoading = false;
            };

            ctrl.updateClaimEntity = function () {
                claimsService.updateClaimEntity(
                    $scope.claimEntity,
                    ctrl.updateClaimSuccess,
                    ctrl.failureToastr('updating claim entity')
                );
            };

            //button methods
            $scope.saveChanges = function () {
                if (ctrl.validateClaim()) {
                    ctrl.applyObjectChangesForChkBoxs();
                    if ($scope.placeOfTreatment == placeOfTreatmentEnums.Office) {
                        // indicates TreatingDentistAddress data hasn't changed and should be restored from backup
                        ctrl.setTreatingDentistToBillingDentist();
                    }
                    else {
                        if ($scope.placeOfTreatment != placeOfTreatmentEnums.Other)
                            $scope.claim.J430DMain.PlaceOfTreatment = $scope.placeOfTreatment;
                    }
                    commonServices.Insurance.Claim.updateJ430DClaim(
                        { claimId: $routeParams.claimId },
                        $scope.claim,
                        ctrl.updateClaimEntity,
                        ctrl.updateClaimFailure
                    );
                }
            };

            $scope.cancel = function () {
                $location.path(_.escape('BusinessCenter/Insurance'));
            };

            //utility methods
            ctrl.calculateFees = function () {
                //Finds the fee total
                var sumOfFees = 0;
                angular.forEach($scope.claim.J430DDetails, function (item) {
                    sumOfFees += item.Fee;
                });
                return sumOfFees;
            };

            $scope.removeOrthoData = function () {
                if (!$scope.isTreatmentForOrthodontics) {
                    $scope.DateAppliancePlaced = Date.now();
                    ctrl.tempTotalMonthsOfTreatmentRemaining =
                        $scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining;
                    $scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining = null;
                    ctrl.tempTotalMonthsOfTreatment =
                        $scope.claim.J430DMain.TotalMonthsOfTreatment;
                    $scope.claim.J430DMain.TotalMonthsOfTreatment = null;
                } else {
                    $scope.DateAppliancePlaced = $scope.claim.J430DMain
                        .DateAppliancePlaced
                        ? $scope.claim.J430DMain.DateAppliancePlaced
                        : Date.now();
                    $scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining =
                        ctrl.tempTotalMonthsOfTreatmentRemaining;
                    $scope.claim.J430DMain.TotalMonthsOfTreatment =
                        ctrl.tempTotalMonthsOfTreatment;
                }
            };

            $scope.validateTotalMonthsTreatment = function () {
                if ($scope.claim.J430DMain.IsTreatmentForOrthodontics) {
                    if ($scope.claim.J430DMain.TotalMonthsOfTreatment > 99) {
                        $scope.claim.J430DMain.TotalMonthsOfTreatment = 99;
                    }
                    if ($scope.claim.J430DMain.TotalMonthsOfTreatment < 1) {
                        $scope.claim.J430DMain.TotalMonthsOfTreatment = 1;
                    }
                }
            };

            $scope.validateTotalMonthsRemaining = function () {
                if ($scope.claim.J430DMain.IsTreatmentForOrthodontics) {
                    if ($scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining > 99) {
                        $scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining = 99;
                    }
                    if ($scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining < 1) {
                        $scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining = 1;
                    }
                }
            };

            $scope.removeProsthesisData = function () {
                if (!$scope.isReplacementOfProsthesis) {
                    $scope.DateOfPriorPlacement = Date.now();
                } else {
                    $scope.DateOfPriorPlacement = $scope.claim.J430DMain
                        .DateOfPriorPlacement
                        ? $scope.claim.J430DMain.DateOfPriorPlacement
                        : Date.now();
                }
            };

            $scope.removeAccidentData = function () {
                if (
                    !$scope.isOccupationalInjury &&
                    !$scope.isAutoAccident &&
                    !$scope.isOtherAccident
                ) {
                    $scope.DateOfAccident = Date.now();
                } else {
                    $scope.DateOfAccident = $scope.claim.J430DMain.DateOfAccident
                        ? $scope.claim.J430DMain.DateOfAccident
                        : Date.now();
                }
            };

            ctrl.setAuthPaymentTrackClaimChkBoxes = function () {
                if ($scope.claimEntity.AuthorizePaymentToOffice !== null) {
                    $scope.authorizePayment = $scope.claimEntity.AuthorizePaymentToOffice;
                } else {
                    $scope.authorizePayment = $scope.benefitPlan.AuthorizePaymentToOffice;
                }
                if ($scope.claimEntity.TrackClaim !== null) {
                    $scope.trackClaim = $scope.claimEntity.TrackClaim;
                } else {
                    $scope.trackClaim = $scope.benefitPlan.TrackClaims;
                }
            };

            ctrl.setTreatmentResultOfCheckboxes = function () {
                $scope.isTreatmentForOrthodontics =
                    $scope.claim.J430DMain.IsTreatmentForOrthodontics;
                $scope.isReplacementOfProsthesis =
                    $scope.claim.J430DMain.IsReplacementOfProsthesis;
                $scope.isOccupationalInjury =
                    $scope.claim.J430DMain.IsOccupationalInjury;
                $scope.isAutoAccident = $scope.claim.J430DMain.IsAutoAccident;
                $scope.isOtherAccident = $scope.claim.J430DMain.IsOtherAccident;
                $scope.DateAppliancePlaced = $scope.claim.J430DMain.DateAppliancePlaced
                    ? $scope.claim.J430DMain.DateAppliancePlaced
                    : Date.now();
                $scope.DateOfPriorPlacement = $scope.claim.J430DMain
                    .DateOfPriorPlacement
                    ? $scope.claim.J430DMain.DateOfPriorPlacement
                    : Date.now();
                $scope.DateOfAccident = $scope.claim.J430DMain.DateOfAccident
                    ? $scope.claim.J430DMain.DateOfAccident
                    : Date.now();
            };

            ctrl.applyObjectChangesForChkBoxs = function () {
                if (
                    $scope.authorizePayment &&
                    !$scope.claim.ClaimCommon.IsPolicyHolderSignatureOnFile
                ) {
                    $scope.claim.ClaimCommon.IsPolicyHolderSignatureOnFile = true;
                    $scope.claim.ClaimCommon.PolicyHolderSignatureDate =
                        new Date().toUTCString();
                } else if (!$scope.authorizePayment) {
                    $scope.claim.ClaimCommon.IsPolicyHolderSignatureOnFile = false;
                    $scope.claim.ClaimCommon.PolicyHolderSignatureDate = null;
                }
                $scope.claimEntity.AuthorizePaymentToOffice = $scope.authorizePayment;
                $scope.claimEntity.TrackClaim = $scope.trackClaim;
                $scope.claim.J430DMain.IsTreatmentForOrthodontics =
                    $scope.isTreatmentForOrthodontics;
                $scope.claim.J430DMain.DateAppliancePlaced =
                    $scope.isTreatmentForOrthodontics ? $scope.DateAppliancePlaced.toDateString() : null;
                $scope.claim.J430DMain.IsReplacementOfProsthesis =
                    $scope.isReplacementOfProsthesis;
                $scope.claim.J430DMain.DateOfPriorPlacement =
                    $scope.isReplacementOfProsthesis ? $scope.DateOfPriorPlacement.toDateString() : null;
                $scope.claim.J430DMain.IsOccupationalInjury =
                    $scope.isOccupationalInjury;
                $scope.claim.J430DMain.IsAutoAccident = $scope.isAutoAccident;
                $scope.claim.J430DMain.IsOtherAccident = $scope.isOtherAccident;
                $scope.claim.J430DMain.DateOfAccident =
                    $scope.isOccupationalInjury ||
                        $scope.isAutoAccident ||
                        $scope.isOtherAccident
                        ? $scope.DateOfAccident.toDateString()
                        : null;
                $scope.claim.J430DMain.AutoAccidentState = $scope.isAutoAccident
                    ? $scope.claim.J430DMain.AutoAccidentState
                    : null;
            };

            ctrl.validateClaim = function () {
                if (
                    $scope.claim == null ||
                    $scope.claim.J430DMain == null ||
                    ($scope.claim.J430DMain.Remarks != null &&
                        $scope.claim.J430DMain.Remarks.length > 80) ||
                    ($scope.claim.J430DMain.DiagnosisCodeA != null &&
                        $scope.claim.J430DMain.DiagnosisCodeA.length > 7) ||
                    ($scope.claim.J430DMain.DiagnosisCodeB != null &&
                        $scope.claim.J430DMain.DiagnosisCodeB.length > 7) ||
                    ($scope.claim.J430DMain.DiagnosisCodeC != null &&
                        $scope.claim.J430DMain.DiagnosisCodeC.length > 7) ||
                    ($scope.claim.J430DMain.DiagnosisCodeD != null &&
                        $scope.claim.J430DMain.DiagnosisCodeD.length > 7)
                ) {
                    return false;
                }

                if (
                    (!$scope.claim.J430DMain.DiagnosisCodeA &&
                        ($scope.claim.J430DMain.DiagnosisCodeB ||
                            $scope.claim.J430DMain.DiagnosisCodeC ||
                            $scope.claim.J430DMain.DiagnosisCodeD)) ||
                    (!$scope.claim.J430DMain.DiagnosisCodeB &&
                        ($scope.claim.J430DMain.DiagnosisCodeC ||
                            $scope.claim.J430DMain.DiagnosisCodeD)) ||
                    (!$scope.claim.J430DMain.DiagnosisCodeC &&
                        $scope.claim.J430DMain.DiagnosisCodeD)
                ) {
                    $scope.showErrors = true;
                    $scope.invalidDiagnosisCode = true;
                    $('#diagCodeA').focus();
                    return false;
                }

                var validLetters = ctrl.getValidLettersForDiagnosisPointer();
                if ($scope.claim.J430DDetails) {
                    for (var i = 0; i < $scope.claim.J430DDetails.length; i++) {
                        var diagPointer = $scope.claim.J430DDetails[i].DiagnosisPointer;
                        if (diagPointer != null) {
                            // check for valid letters
                            for (var j = 0; j < diagPointer.length; j++) {
                                if (validLetters.indexOf(diagPointer[j]) === -1) {
                                    $scope.invalidDiagPointer = true;
                                    return false;
                                }
                            }
                            // check valid letters for duplicates
                            for (var k = 0; k < diagPointer.length; k++) {
                                if (
                                    diagPointer.lastIndexOf(diagPointer[k]) !==
                                    diagPointer.indexOf(diagPointer[k])
                                ) {
                                    $scope.invalidDiagPointer = true;
                                    return false;
                                }
                            }
                        }
                    }
                }

                if ($scope.placeOfTreatment != placeOfTreatmentEnums.Office) {
                    var hasErrors = false;

                    if (!$scope.claim.J430DMain.TreatingDentistAddress1) {
                        hasErrors = true;
                        $scope.invalidAddress = true;
                    }
                    if (!$scope.claim.J430DMain.TreatingDentistCity) {
                        hasErrors = true;
                        $scope.invalidCity = true;
                    }
                    if (!$scope.claim.J430DMain.TreatingDentistStateProvince) {
                        hasErrors = true;
                        $scope.invalidState = true;
                    }
                    if (!$scope.claim.J430DMain.TreatingDentistPostalCode) {
                        hasErrors = true;
                        $scope.invalidZip = true;
                    }
                    if (!$scope.claim.J430DMain.TreatingDentistLocationPrimaryPhone) {
                        hasErrors = true;
                        $scope.invalidPhone = true;
                    }

                    if (hasErrors) {
                        return false;
                    }
                    // remove dash from zip
                    if ($scope.claim.J430DMain.TreatingDentistPostalCode) {
                        $scope.claim.J430DMain.TreatingDentistPostalCode =
                            $scope.claim.J430DMain.TreatingDentistPostalCode.replace('-', '');
                    }
                }
                if ($scope.isTreatmentForOrthodontics) {
                    if (
                        !$scope.DateAppliancePlaced ||
                        !$scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining ||
                        !$scope.claim.J430DMain.TotalMonthsOfTreatment
                    ) {
                        $scope.showErrors = true;
                        return false;
                    }
                }
                return true;
            };

            // the J430DMain TreatingDentistAddress info is cleared when this page is initialized
            // this method resets it to the original data because the user did not modify it.
            ctrl.setTreatingDentistToBillingDentist = function () {
                $scope.claim.J430DMain.PlaceOfTreatment = placeOfTreatmentEnums.Office;
                $scope.claim.J430DMain.TreatingDentistAddress1 =
                    ctrl.claimBackup.J430DMain.TreatingDentistAddress1;
                $scope.claim.J430DMain.TreatingDentistAddress2 =
                    ctrl.claimBackup.J430DMain.TreatingDentistAddress2;
                $scope.claim.J430DMain.TreatingDentistCity =
                    ctrl.claimBackup.J430DMain.TreatingDentistCity;
                $scope.claim.J430DMain.TreatingDentistStateProvince =
                    ctrl.claimBackup.J430DMain.TreatingDentistStateProvince;
                $scope.claim.J430DMain.TreatingDentistPostalCode =
                    ctrl.claimBackup.J430DMain.TreatingDentistPostalCode;
                $scope.claim.J430DMain.TreatingDentistLocationPrimaryPhone =
                    ctrl.claimBackup.J430DMain.TreatingDentistLocationPrimaryPhone;
            };

            ctrl.clearTreatingDentistFields = function () {
                $scope.claim.J430DMain.PlaceOfTreatment = null;
                $scope.claim.J430DMain.TreatingDentistAddress1 = null;
                $scope.claim.J430DMain.TreatingDentistAddress2 = null;
                $scope.claim.J430DMain.TreatingDentistCity = null;
                $scope.claim.J430DMain.TreatingDentistStateProvince = null;
                $scope.claim.J430DMain.TreatingDentistPostalCode = null;
                $scope.claim.J430DMain.TreatingDentistLocationPrimaryPhone = null;
            };

            $scope.clearErrorMessages = function () {
                $scope.invalidAddress = false;
                $scope.invalidCity = false;
                $scope.invalidState = false;
                $scope.invalidZip = false;
                $scope.invalidPhone = false;
            };

            ctrl.getPatientDisplayName = function () {
                var string = '';
                if ($scope.claim && $scope.claim.ClaimCommon) {
                    var claim = $scope.claim.ClaimCommon;
                    string =
                        (claim.PatientFirstName ? claim.PatientFirstName + ' ' : '') +
                        (claim.PatientPreferredName
                            ? claim.PatientPreferredName + ' '
                            : '') +
                        (claim.PatientMiddleName ? claim.PatientMiddleName + ' ' : '') +
                        (claim.PatientLastName ? claim.PatientLastName + ' ' : '') +
                        (claim.PatientSuffix ? claim.PatientSuffix : '');
                    return string;
                }
            };

            ctrl.getValidLettersForDiagnosisPointer = function () {
                var validLetters = [];
                if ($scope.claim.J430DMain.DiagnosisCodeA) {
                    validLetters.push('A');
                }
                if ($scope.claim.J430DMain.DiagnosisCodeB) {
                    validLetters.push('B');
                }
                if ($scope.claim.J430DMain.DiagnosisCodeC) {
                    validLetters.push('C');
                }
                if ($scope.claim.J430DMain.DiagnosisCodeD) {
                    validLetters.push('D');
                }
                return validLetters;
            };

            ctrl.statesSetup = function (res) {
                $scope.states = res[0].Value;
            };

            //unfortunately we have to manually update the $scope's detail row because
            //kendo grid doesn't play nice with angular
            $scope.updateDiagnosisPointer = function (row) {
                $scope.invalidDiagPointer = false;
                angular.forEach($scope.claim.J430DDetails, function (detail) {
                    if (detail.J430DDetailId === row.J430DDetailId) {
                        detail.DiagnosisPointer = row.DiagnosisPointer;
                    }
                });
            };

            $scope.onDropdownChange = function (row) {
                angular.forEach($scope.claim.J430DDetails, function (detail) {
                    if (detail.J430DDetailId === row.J430DDetailId) {
                        detail.ProcedureCodeModifier = row.ProcedureCodeModifier;
                    }
                });
            };

            $scope.checkValidKeypress = function (event, row) {
                $scope.invalidDiagPointer = false;
                var validLetters = ctrl.getValidLettersForDiagnosisPointer();
                var key = event.key.toUpperCase();

                if (
                    key !== 'BACKSPACE' &&
                    key !== 'DELETE' &&
                    key !== 'ARROWRIGHT' &&
                    key !== 'ARROWLEFT'
                ) {
                    if (row.DiagnosisPointer === null) {
                        row.DiagnosisPointer = '';
                    }

                    if (
                        validLetters.indexOf(key) === -1 ||
                        row.DiagnosisPointer.includes(key)
                    ) {
                        event.preventDefault();
                    } else {
                        row.DiagnosisPointer += key;
                        $scope.updateDiagnosisPointer(row);
                        event.preventDefault();
                    }
                }
            };

            //Kendo Grid
            ctrl.setupKendoGrid = function () {
                $scope.gridData = new kendo.data.DataSource({
                    data: $scope.claim.J430DDetails,
                    schema: {
                        model: {
                            fields: {
                                Date: {
                                    editable: false,
                                },
                                Patient: {
                                    editable: false,
                                },
                                ProcedureCode: {
                                    editable: false,
                                },
                                Description: {
                                    editable: false,
                                },
                                Provider: {
                                    editable: false,
                                },
                                ToothNumbers: {
                                    editable: false,
                                },
                                Area: {
                                    editable: false,
                                },
                                DiagnosisPointer: {
                                    editable: false,
                                },
                                MedicareModifier: {
                                    editable: true,
                                },
                            },
                        },
                    },
                });
            };

            $scope.changeAnswersDetailGrid = {
                sortable: false,
                pageable: false,
                editable: false,
                columns: [
                    {
                        field: 'Date',
                        title: 'Date',
                        template: kendo.template('{{dataItem.Date | toShortDisplayDate}}'),
                    },
                    {
                        field: 'Patient',
                        title: 'Patient',
                        template: kendo.template('{{patientName}}'),
                    },
                    {
                        field: 'Provider',
                        title: 'Provider',
                        template: kendo.template(
                            '{{claim.J430DMain.TreatingDentistSignature}}'
                        ),
                    },
                    {
                        field: 'ProcedureCode',
                        title: 'Service Code',
                    },
                    {
                        field: 'Description',
                        title: 'Description',
                    },
                    {
                        field: 'ToothNumbers',
                        title: 'Tooth',
                    },
                    {
                        field: 'Area',
                        title: 'Area',
                        template: kendo.template(
                            '{{dataItem.Area != 0 ? dataItem.Area : ""}}'
                        ),
                    },
                    {
                        field: 'DiagnosisPointer',
                        title: 'Diagnosis Pointer',
                        template: kendo.template(
                            '<input class=form-control check-auth-z="soar-ins-iclaim-edit" ng-disabled="isReadOnly || !canEdit" ng-model="dataItem.DiagnosisPointer" ng-change="updateDiagnosisPointer(dataItem)" ng-keypress="checkValidKeypress($event, dataItem)" style="width: 100%;" maxlength="4"/>'
                        ),
                    }
                ],
            };

            if ($scope.showMedicareModifier) {
                $scope.changeAnswersDetailGrid.columns.push(
                    {
                        field: 'MedicareModifier',
                        title: 'Medicare Modifier',
                        template: kendo.template(
                            `<input kendo-drop-down-list check-auth-z="soar-ins-iclaim-edit" ng-disabled="isReadOnly || !canEdit" k-data-text-field="'description'" k-data-value-field="'code'" k-data-source="procedureCodeModifierTypes" k-ng-model="dataItem.ProcedureCodeModifier" k-value-primitive="true" k-on-change="onDropdownChange(dataItem)"></input>`
                        ),
                    }
                );
            }

            //page initialization
            ctrl.init = function () {
                modalFactory.LoadingModal(ctrl.getPageData);
                var promises = [];
                promises.push(
                    staticData.States().then(undefined, ctrl.getStatesFailure)
                );
                $q.all(promises).then(ctrl.statesSetup);
                $scope.canEdit = patSecurityService.IsAuthorizedByAbbreviation(
                    $scope.editClaimAmfa
                );
                $scope.placeOfTreatmentList = [...claimEnumService.getPlaceOfTreatment(), { code: -1, description: 'Enter a new code' }];
                if ($scope.showMedicareModifier) {
                    $scope.procedureCodeModifierTypes = [...claimEnumService.getprocedureCodeModifierTypes()];
                }
                $scope.clearErrorMessages();
            };

            ctrl.init();
        },
    ]);
