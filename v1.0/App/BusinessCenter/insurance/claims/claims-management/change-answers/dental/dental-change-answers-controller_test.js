describe('dental-change-answers', function () {
    var ctrl,
        scope,
        q,
        location,
        toastrFactory,
        localize,
        routeParams,
        modalFactory,
        claimsService,
        deferred,
        commonServices,
        basicReturnObject,
        staticData,
        featureFlagService,
        fuseFlag;

    var claimEnumService, mockPlaceOfTreatmentList;

    beforeEach(module('Soar.Patient'));
    beforeEach(
        module('Soar.BusinessCenter', function ($provide) {
            //mock modal factory
            modalFactory = {
                Modal: jasmine
                    .createSpy('modalFactory.ConfirmModal')
                    .and.callFake(function () {
                        deferred = q.defer();
                        deferred.resolve(1);
                        return {
                            result: deferred.promise,
                            then: function () { },
                        };
                    }),
                LoadingModal: jasmine.createSpy(),
            };
            $provide.value('ModalFactory', modalFactory);

            mockPlaceOfTreatmentList = [
                { code: 1, description: 'Pharmacy' },
                { code: 11, description: '11 - Office' },
                { code: -1, description: 'Enter a new code' }
            ];
            claimEnumService = {
                getPlaceOfTreatment: jasmine.createSpy()
                    .and.returnValue([
                        { placeOfTreatments: mockPlaceOfTreatmentList },
                    ])
            };
            $provide.value('ClaimEnumService', claimEnumService)
        })
    );


    featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    fuseFlag = {
        MedicareAdministrativeModifier: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),        
    };

    beforeEach(inject(function ($rootScope, $controller, $q) {
        scope = $rootScope.$new();
        routeParams = {};
        q = $q;

        //mock commonServices
        commonServices = {
            Insurance: {
                Claim: {
                    getJ430DClaimById: jasmine.createSpy(
                        'CommonServices.Insurance.Claim.getJ430DClaimById'
                    ),
                    updateJ430DClaim: jasmine.createSpy(
                        'CommonServices.Insurance.Claim.updateJ430DClaimById'
                    ),
                },
                BenefitPlan: {
                    getById: jasmine.createSpy(
                        'CommonServices.Insurance.BenefitPlan.getById'
                    ),
                },
            },
        };

        //mock claimService
        claimsService = {
            getClaimById: jasmine
                .createSpy('claimsService.getClaimById')
                .and.callFake(function () {
                    deferred = q.defer();
                    deferred.resolve(1);
                    return {
                        result: deferred.promise,
                        then: function () { },
                    };
                }),
            getClaimEntityByClaimId: jasmine.createSpy(
                'claimsService.getClaimEntityByClaimId'
            ),
            updateClaimEntity: jasmine.createSpy('claimsService.updateClaimEntity'),
        };

        //mock for toastrFactory
        toastrFactory = {
            success: jasmine.createSpy('toastrFactory.success'),
            error: jasmine.createSpy('toastrFactory.error'),
        };

        //mock for localize
        localize = {
            getLocalizedString: jasmine
                .createSpy('localize.getLocalizedString')
                .and.callFake(function (val) {
                    return val;
                }),
        };

        //mock for location
        location = {
            path: jasmine.createSpy('$location.path'),
        };

        basicReturnObject = {
            Value: {
                J430DMain: { PlaceOfTreatment: 11 },
                ClaimCommon: { Status: 2 },
            },
        };

        staticData = {
            States: jasmine
                .createSpy('staticData.States')
                .and.returnValue({ then: function () { } }),
        };

        ctrl = $controller('DentalChangeAnswersController', {
            $scope: scope,
            $location: location,
            toastrFactory: toastrFactory,
            localize: localize,
            $routeParams: routeParams,
            CommonServices: commonServices,
            ClaimsService: claimsService,
            ClaimEnumService: claimEnumService,
            StaticData: staticData,
            FeatureFlagService: featureFlagService,
            fuseFlag: fuseFlag
        });
    }));

    describe('initial values -> ', function () {
        it('controller should exist', function () {
            expect(ctrl).not.toBeNull();
        });
        it('should have injected service', function () {
            expect(commonServices).not.toBeNull();
        });
        it('should have injected service', function () {
            expect(claimsService).not.toBeNull();
        });
    });

    describe('ctrl.getPageData ->', function () {
        it('should return two service calls', function () {
            var calls = ctrl.getPageData();
            expect(calls.length).toEqual(2);
        });
    });

    describe('ctrl.getBenefitPlan ->', function () {
        it('should call common services to get the benefit plan', function () {
            ctrl.claimEntity = {
                ClaimId: '',
            };
            ctrl.getBenefitPlan();
            expect(commonServices.Insurance.BenefitPlan.getById).toHaveBeenCalled();
        });
    });

    describe('ctrl.getClaimSuccess ->', function () {
        var originalClaim = {};
        beforeEach(function () {
            originalClaim = {
                Value: {
                    J430DMain: {
                        PlaceOfTreatment: 'PlaceOfTreatmentValue',
                        TreatingDentistAddress1: 'TreatingDentistAddress1Value',
                        TreatingDentistAddress2: 'TreatingDentistAddress2Value',
                        TreatingDentistCity: 'TreatingDentistCityValue',
                        TreatingDentistStateProvince: 'TreatingDentistStateProvinceValue',
                        TreatingDentistPostalCode: 'TreatingDentistPostalCodeValue',
                        TreatingDentistLocationPrimaryPhone:
                            'TreatingDentistLocationPrimaryPhoneValue',
                    },
                    ClaimCommon: { Status: 2 },
                },
            };
        });

        it('should set ctrl.claim to result object', function () {
            ctrl.getClaimSuccess(basicReturnObject);
            expect(scope.claim).toEqual(basicReturnObject.Value);
        });
        it('should call calculateFees', function () {
            spyOn(ctrl, 'calculateFees');
            ctrl.getClaimSuccess(basicReturnObject);
            expect(ctrl.calculateFees).toHaveBeenCalled();
        });
        it('should call setTreatmentResultOfCheckboxes', function () {
            spyOn(ctrl, 'setTreatmentResultOfCheckboxes');
            ctrl.getClaimSuccess(basicReturnObject);
            expect(ctrl.setTreatmentResultOfCheckboxes).toHaveBeenCalled();
        });
        it('should call getPatientDisplayName', function () {
            spyOn(ctrl, 'getPatientDisplayName');
            ctrl.getClaimSuccess(basicReturnObject);
            expect(ctrl.getPatientDisplayName).toHaveBeenCalled();
        });
        it('should set $scope.isReadOnly to true if status is 2', function () {
            basicReturnObject.Value.ClaimCommon.Status = 2;
            ctrl.getClaimSuccess(basicReturnObject);
            expect(scope.isReadOnly).toEqual(true);
        });
        it('should call setupKendoGrid', function () {
            spyOn(ctrl, 'setupKendoGrid');
            ctrl.getClaimSuccess(basicReturnObject);
            expect(ctrl.setupKendoGrid).toHaveBeenCalled();
        });
        it('should call ctrl.clearTreatingDentistFields if PlaceOfTreatment is 11', function () {
            spyOn(ctrl, 'clearTreatingDentistFields');
            scope.placeOfTreatmentList = mockPlaceOfTreatmentList;
            ctrl.getClaimSuccess(basicReturnObject);
            expect(scope.placeOfTreatment).toBe(11);
            expect(ctrl.clearTreatingDentistFields).toHaveBeenCalled();
        });

        it('should set scope.placeOfTreatment to -1 if PlaceOfTreatment property is not in placeOfTreatmentList', function () {
            basicReturnObject = {
                Value: {
                    J430DMain: { PlaceOfTreatment: 22 },
                    ClaimCommon: { Status: 2 },
                },
            };
            scope.placeOfTreatmentList = mockPlaceOfTreatmentList;
            ctrl.getClaimSuccess(basicReturnObject);
            expect(scope.placeOfTreatment).toBe(-1);
        });
        it('should create a backupCopy of scope.claim if PlaceOfTreatment is 11', function () {
            spyOn(ctrl, 'clearTreatingDentistFields');
            ctrl.getClaimSuccess(originalClaim);
            expect(ctrl.claimBackup.J430DMain.PlaceOfTreatmentValue).toEqual(
                scope.claim.J430DMain.PlaceOfTreatmentValue
            );
            expect(ctrl.claimBackup.J430DMain.TreatingDentistAddress1).toEqual(
                scope.claim.J430DMain.TreatingDentistAddress1
            );
            expect(ctrl.claimBackup.J430DMain.TreatingDentistAddress2).toEqual(
                scope.claim.J430DMain.TreatingDentistAddress2
            );
            expect(ctrl.claimBackup.J430DMain.TreatingDentistCity).toEqual(
                scope.claim.J430DMain.TreatingDentistCity
            );
            expect(ctrl.claimBackup.J430DMain.TreatingDentistStateProvince).toEqual(
                scope.claim.J430DMain.TreatingDentistStateProvince
            );
            expect(
                ctrl.claimBackup.J430DMain.TreatingDentistLocationPrimaryPhone
            ).toEqual(scope.claim.J430DMain.TreatingDentistLocationPrimaryPhone);
        });
    });

    describe('ctrl.getClaimEntitySuccess ->', function () {
        it('should set ctrl.claimEntity to result object when there is a result', function () {
            ctrl.getClaimEntitySuccess(basicReturnObject);
            expect(scope.claimEntity).toEqual(basicReturnObject.Value);
        });
        it('should call getBenefitPlan when there is a result', function () {
            spyOn(ctrl, 'getBenefitPlan');
            ctrl.getClaimEntitySuccess(basicReturnObject);
            expect(ctrl.getBenefitPlan).toHaveBeenCalled();
        });
        it("should call failureToastr when there isn't a result", function () {
            spyOn(ctrl, 'failureToastr').and.callThrough();
            ctrl.getClaimEntitySuccess({});
            expect(ctrl.failureToastr).toHaveBeenCalled();
        });
    });

    describe('ctrl.getBenefitPlanSuccess ->', function () {
        it('should set ctrl.benefitPlan to result value and call ctrl.setAuthPaymentTrackClaimChkBoxes', function () {
            ctrl.setAuthPaymentTrackClaimChkBoxes = jasmine.createSpy();
            var benefitPlan = {
                Test: 1,
            };
            ctrl.getBenefitPlanSuccess({ Value: benefitPlan });
            expect(scope.benefitPlan).toEqual(benefitPlan);
        });
        it('should call toastrFailure when the result has no value', function () {
            spyOn(ctrl, 'failureToastr').and.callThrough();
            ctrl.getBenefitPlanSuccess({ Value: null });
            expect(ctrl.failureToastr).toHaveBeenCalled();
        });
        it('should set scope.isLoading to false', function () {
            ctrl.getBenefitPlanSuccess({ Value: [basicReturnObject] });
            expect(scope.isLoading).toEqual(false);
        });
    });

    describe('ctrl.updateClaimSuccess ->', function () {
        it('should set ctrl.claim to result object', function () {
            ctrl.updateClaimSuccess(basicReturnObject);
            expect(scope.claim).toEqual(basicReturnObject.Value);
        });
        it('should call toastrFactory', function () {
            ctrl.updateClaimSuccess(basicReturnObject);
            expect(toastrFactory.success).toHaveBeenCalled();
        });
        it('should call $location.path to redirect', function () {
            ctrl.updateClaimSuccess(basicReturnObject);
            expect(location.path).toHaveBeenCalled();
        });
    });

    describe('ctrl.failureToastr ->', function () {
        it('should call toastrFactory', function () {
            ctrl.failureToastr('string')();
            expect(toastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('ctrl.getStatesFailure ->', function () {
        it('should call toastrFactory', function () {
            ctrl.getStatesFailure('string');
            expect(toastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('ctrl.saveChanges ->', function () {
        it('should call applyObjectChangesForChkBoxs and commonServices.Insurance.Claim.updateJ430DClaim when validation succeeds', function () {
            ctrl.applyObjectChangesForChkBoxs = jasmine.createSpy();
            scope.claim = {
                J430DMain: {
                    Remarks: '123',
                    TreatingDentistAddress1: 'TreatingDentistAddress1Value',
                    TreatingDentistAddress2: 'TreatingDentistAddress2Value',
                    TreatingDentistCity: 'TreatingDentistCityValue',
                    TreatingDentistStateProvince: 'TreatingDentistStateProvinceValue',
                    TreatingDentistPostalCode: 'TreatingDentistPostalCodeValue',
                    TreatingDentistLocationPrimaryPhone:
                        'TreatingDentistLocationPrimaryPhoneValue',
                },
                ClaimCommon: { IsPolicyHolderSignatureOnFile: true },
            };
            scope.placeOfTreatment = -1;
            scope.saveChanges();
            expect(ctrl.applyObjectChangesForChkBoxs).toHaveBeenCalled();
            expect(
                commonServices.Insurance.Claim.updateJ430DClaim
            ).toHaveBeenCalled();
        });
        it('should not call commonServices.Insurance.Claim.updateJ430DClaim when validation fails', function () {
            scope.claim = {
                J430DMain: {
                    Remarks:
                        '123456789012345678901234567890123456789012345678901234567980123456789012345678901', //81 chars                    
                },
            };
            scope.saveChanges();
            expect(
                commonServices.Insurance.Claim.updateJ430DClaim
            ).not.toHaveBeenCalled();
        });
        it('should call ctrl.setTreatingDentistToBillingDentist if scope.placeOfTreatment is 11', function () {
            scope.claim = { J430DMain: {}, ClaimCommon: {} };
            spyOn(ctrl, 'setTreatingDentistToBillingDentist');
            scope.placeOfTreatment = 11;
            scope.saveChanges();
            expect(ctrl.setTreatingDentistToBillingDentist).toHaveBeenCalled();
        });
    });

    describe('ctrl.cancel ->', function () {
        it('should call $location.path to redirect', function () {
            scope.cancel();
            expect(location.path).toHaveBeenCalled();
        });
    });

    describe('ctrl.calculateFees ->', function () {
        it('should return sum of all fees', function () {
            scope.claim = {
                J430DDetails: [{ Fee: 12 }, { Fee: 22 }, { Fee: 33 }],
            };
            var fees = ctrl.calculateFees();
            expect(fees).toEqual(67);
        });
    });

    describe('ctrl.validateClaim ->', function () {
        it('should return true when values are valid', function () {
            scope.claim = {
                J430DMain: {
                    Remarks: '11',
                    DiagnosisCodeA: '11',
                    DiagnosisCodeB: '11',
                    DiagnosisCodeC: '11',
                    DiagnosisCodeD: '11',
                },
            };
            scope.placeOfTreatment = 11;
            var valid = ctrl.validateClaim();
            expect(valid).toEqual(true);
        });
        it('should return false when Remarks too long', function () {
            scope.claim = {
                J430DMain: {
                    Remarks:
                        '123456789012345678901234567890123456789012345678901234567980123456789012345678901', //81 chars
                },
            };
            var valid = ctrl.validateClaim();
            expect(valid).toEqual(false);
        });
        it('should return false when DiagnosisCodeA too long', function () {
            scope.claim = {
                J430DMain: {
                    DiagnosisCodeA: '12345678', //8 chars
                },
            };
            var valid = ctrl.validateClaim();
            expect(valid).toEqual(false);
        });
        it('should return false when DiagnosisCodeB too long', function () {
            scope.claim = {
                J430DMain: {
                    DiagnosisCodeB: '12345678', //8 chars
                },
            };
            var valid = ctrl.validateClaim();
            expect(valid).toEqual(false);
        });
        it('should return false when DiagnosisCodeC too long', function () {
            scope.claim = {
                J430DMain: {
                    DiagnosisCodeC: '12345678', //8 chars
                },
            };
            var valid = ctrl.validateClaim();
            expect(valid).toEqual(false);
        });
        it('should return false when DiagnosisCodeD too long', function () {
            scope.claim = {
                J430DMain: {
                    DiagnosisCodeD: '12345678', //8 chars
                },
            };
            var valid = ctrl.validateClaim();
            expect(valid).toEqual(false);
        });
        it('should return true when fields are null', function () {
            scope.claim = {
                J430DMain: {},
            };
            scope.placeOfTreatment = 11;
            var valid = ctrl.validateClaim();
            expect(valid).toEqual(true);
        });
        it('should return false when objects are null', function () {
            scope.claim = {};
            var valid = ctrl.validateClaim();
            expect(valid).toEqual(false);
        });
        it('should return true when diagnosis pointer has valid characters', function () {
            scope.claim = {
                J430DMain: {
                    DiagnosisCodeA: 'Code',
                },
                J430DDetails: [
                    {
                        DiagnosisPointer: 'A',
                    },
                ],
            };
            scope.placeOfTreatment = 11;
            var valid = ctrl.validateClaim();
            expect(valid).toEqual(true);
        });
        it('should return false when diagnosis pointer has invalid characters', function () {
            scope.claim = {
                J430DMain: {
                    DiagnosisCodeA: 'Code',
                },
                J430DDetails: [
                    {
                        DiagnosisPointer: 'E',
                    },
                ],
            };
            var valid = ctrl.validateClaim();
            expect(valid).toEqual(false);
        });
        it('should return false when diagnosis pointer has valid characters but duplicates', function () {
            scope.claim = {
                J430DMain: {
                    DiagnosisCodeA: 'Code',
                },
                J430DDetails: [
                    {
                        DiagnosisPointer: 'AA',
                    },
                ],
            };
            var valid = ctrl.validateClaim();
            expect(valid).toEqual(false);
        });
        it('should return false when scope.placeOfTreatment is -1 and TreatingDentistAddress1 is null', function () {
            scope.placeOfTreatment = -1;
            scope.claim = {
                J430DMain: {
                    TreatingDentistAddress1: null,
                    PlaceOfTreatment: 86
                },
            };
            var valid = ctrl.validateClaim();
            expect(scope.invalidAddress).toEqual(true);
            expect(valid).toEqual(false);
        });
        it('should return false when scope.placeOfTreatment is -1 and TreatingDentistCity is null', function () {
            scope.placeOfTreatment = -1;
            scope.claim = {
                J430DMain: {
                    PlaceOfTreatment: 86,
                    TreatingDentistCity: null,
                },
            };
            var valid = ctrl.validateClaim();
            expect(scope.invalidCity).toEqual(true);
            expect(valid).toEqual(false);
        });
        it('should return false when scope.placeOfTreatment is -1 and TreatingDentistStateProvince is null', function () {
            scope.placeOfTreatment = -1;
            scope.claim = {
                J430DMain: {
                    TreatingDentistStateProvince: null,
                    PlaceOfTreatment: 86
                },
            };
            var valid = ctrl.validateClaim();
            expect(scope.invalidState).toEqual(true);
            expect(valid).toEqual(false);
        });
        it('should return false when scope.placeOfTreatment is -1 and TreatingDentistPostalCode is null', function () {
            scope.placeOfTreatment = -1;
            scope.claim = {
                J430DMain: {
                    TreatingDentistPostalCode: null,
                    PlaceOfTreatment: 86
                },
            };
            var valid = ctrl.validateClaim();
            expect(scope.invalidZip).toEqual(true);
            expect(valid).toEqual(false);
        });
        it('should return false when scope.placeOfTreatment is -1 and TreatingDentistLocationPrimaryPhone is null', function () {
            scope.placeOfTreatment = -1;
            scope.claim = {
                J430DMain: {
                    TreatingDentistLocationPrimaryPhone: null,
                    PlaceOfTreatment: 86
                },
            };
            var valid = ctrl.validateClaim();
            expect(scope.invalidPhone).toEqual(true);
            expect(valid).toEqual(false);
        });
    });

    describe('ctrl.updateClaimEntity ->', function () {
        it('should call claimsService.updateClaimEntity', function () {
            ctrl.updateClaimEntity();
            expect(claimsService.updateClaimEntity).toHaveBeenCalled();
        });
    });

    describe('ctrl.setAuthPaymentTrackClaimChkBoxes ->', function () {
        it('should set scope.authorizePayment to claimEntity AuthorizePaymentToOffice value', function () {
            scope.claimEntity = {
                AuthorizePaymentToOffice: true,
            };
            ctrl.setAuthPaymentTrackClaimChkBoxes();
            expect(scope.authorizePayment).toBe(true);
        });
        it('should set scope.authorizePayment to benefitPlan AuthorizePaymentToOffice value', function () {
            scope.claimEntity = {
                AuthorizePaymentToOffice: null,
            };
            scope.benefitPlan = {
                AuthorizePaymentToOffice: false,
            };
            ctrl.setAuthPaymentTrackClaimChkBoxes();
            expect(scope.authorizePayment).toBe(false);
        });
        it('should set scope.trackClaim to claimEntity TrackClaim value', function () {
            scope.claimEntity = {
                TrackClaim: true,
            };
            ctrl.setAuthPaymentTrackClaimChkBoxes();
            expect(scope.trackClaim).toBe(true);
        });
        it('should set scope.trackClaim to benefitPlan TrackClaim value', function () {
            scope.claimEntity = {
                TrackClaim: null,
            };
            scope.benefitPlan = {
                TrackClaims: false,
            };
            ctrl.setAuthPaymentTrackClaimChkBoxes();
            expect(scope.trackClaim).toBe(false);
        });
    });

    describe('ctrl.setTreatmentResultOfCheckboxes ->', function () {
        it('should set scope.isTreatmentForOrthodontics to value of scope.claim.J430DMain.IsTreatmentForOrthodontics', function () {
            scope.claim = { J430DMain: { IsTreatmentForOrthodontics: true } };
            ctrl.setTreatmentResultOfCheckboxes();
            expect(scope.isTreatmentForOrthodontics).toBe(true);
        });
        it('should set scope.isReplacementOfProsthesis to value of scope.claim.J430DMain.IsReplacementOfProsthesis', function () {
            scope.claim = { J430DMain: { IsReplacementOfProsthesis: true } };
            ctrl.setTreatmentResultOfCheckboxes();
            expect(scope.isReplacementOfProsthesis).toBe(true);
        });
        it('should set scope.isOccupationalInjury to value of scope.claim.J430DMain.IsOccupationalInjury', function () {
            scope.claim = { J430DMain: { IsOccupationalInjury: true } };
            ctrl.setTreatmentResultOfCheckboxes();
            expect(scope.isOccupationalInjury).toBe(true);
        });
        it('should set scope.isAutoAccident to value of scope.claim.J430DMain.IsAutoAccident', function () {
            scope.claim = { J430DMain: { IsAutoAccident: true } };
            ctrl.setTreatmentResultOfCheckboxes();
            expect(scope.isAutoAccident).toBe(true);
        });
        it('should set scope.isOtherAccident to value of scope.claim.J430DMain.IsOtherAccident', function () {
            scope.claim = { J430DMain: { IsOtherAccident: true } };
            ctrl.setTreatmentResultOfCheckboxes();
            expect(scope.isOtherAccident).toBe(true);
        });
        it('should set scope.DateAppliancePlaced to value of scope.claim.J430DMain.DateAppliancePlaced', function () {
            scope.claim = { J430DMain: { DateAppliancePlaced: '01/25/2011' } };
            ctrl.setTreatmentResultOfCheckboxes();
            expect(scope.DateAppliancePlaced).toBe('01/25/2011');
        });
        it('should set scope.DateOfPriorPlacement to value of scope.claim.J430DMain.DateOfPriorPlacement', function () {
            scope.claim = { J430DMain: { DateOfPriorPlacement: '01/25/2011' } };
            ctrl.setTreatmentResultOfCheckboxes();
            expect(scope.DateOfPriorPlacement).toBe('01/25/2011');
        });
        it('should set scope.DateOfAccident to value of scope.claim.J430DMain.DateOfAccident', function () {
            scope.claim = { J430DMain: { DateOfAccident: '01/25/2011' } };
            ctrl.setTreatmentResultOfCheckboxes();
            expect(scope.DateOfAccident).toBe('01/25/2011');
        });
    });

    describe('ctrl.applyObjectChangesForChkBoxs ->', function () {
        it('should set claim entity authorize payment to office to scope.authorizePayment value of true', function () {
            scope.claim = {
                ClaimCommon: { IsPolicyHolderSignatureOnFile: true },
                J430DMain: {
                    IsOccupationalInjury: {},
                    IsAutoAccident: {},
                    IsOtherAccident: {},
                },
            };
            scope.authorizePayment = true;
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claimEntity.AuthorizePaymentToOffice).toBe(true);
        });
        it('should set IsPolicyHolderSignatureOnFile to true and PolicyHolderSignatureDate to UTC Now', function () {
            var utcDateTime = new Date().toUTCString();
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsOccupationalInjury: {},
                    IsAutoAccident: {},
                    IsOtherAccident: {},
                },
            };
            scope.authorizePayment = true;
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.ClaimCommon.IsPolicyHolderSignatureOnFile).toBe(true);
            expect(scope.claim.ClaimCommon.PolicyHolderSignatureDate).toBe(
                utcDateTime
            );
        });
        it('should set IsPolicyHolderSignatureOnFile to false and PolicyHolderSignatureDate to null', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: true,
                    PolicyHolderSignatureDate: new Date().toUTCString(),
                },
                J430DMain: {
                    IsOccupationalInjury: {},
                    IsAutoAccident: {},
                    IsOtherAccident: {},
                },
            };
            scope.authorizePayment = false;
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.ClaimCommon.IsPolicyHolderSignatureOnFile).toBe(false);
            expect(scope.claim.ClaimCommon.PolicyHolderSignatureDate).toBe(null);
        });
        it('should set scope.claimEntity.TrackClaim to value of scope.trackClaim', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsOccupationalInjury: {},
                    IsAutoAccident: {},
                    IsOtherAccident: {},
                },
            };
            scope.claimEntity = { TrackClaim: null };
            scope.trackClaim = true;
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claimEntity.TrackClaim).toBe(true);
        });
        it('should set scope.claim.J430DMain.IsTreatmentForOrthodontics to value of scope.isTreatmentForOrthodontics', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsTreatmentForOrthodontics: {},
                },
            };
            scope.isTreatmentForOrthodontics = true;
            scope.DateAppliancePlaced = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.IsTreatmentForOrthodontics).toBe(true);
        });
        it('should set scope.claim.J430DMain.IsReplacementOfProsthesis to value of scope.isReplacementOfProsthesis', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsReplacementOfProsthesis: {},
                },
            };
            scope.isReplacementOfProsthesis = true;
            scope.DateOfPriorPlacement = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.IsReplacementOfProsthesis).toBe(true);
        });
        it('should set scope.claim.J430DMain.IsOccupationalInjury to value of scope.isOccupationalInjury', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsOccupationalInjury: {},
                    IsAutoAccident: {},
                    IsOtherAccident: {},
                },
            };
            scope.isOccupationalInjury = true;
            scope.DateOfAccident = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.IsOccupationalInjury).toBe(true);
        });
        it('should set scope.claim.J430DMain.IsOtherAccident to value of scope.isOtherAccident', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsOccupationalInjury: {},
                    IsAutoAccident: {},
                    IsOtherAccident: {},
                },
            };
            scope.isOtherAccident = true;
            scope.DateOfAccident = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.IsOtherAccident).toBe(true);
        });
        it('should set scope.claim.J430DMain.IsAutoAccident to value of scope.isAutoAccident', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsOccupationalInjury: {},
                    IsAutoAccident: {},
                    IsOtherAccident: {},
                },
            };
            scope.isAutoAccident = true;
            scope.DateOfAccident = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.IsAutoAccident).toBe(true);
        });
        it('should set scope.claim.J430DMain.DateAppliancePlaced to value of scope.DateAppliancePlaced if isTreatmentForOrthodontics checkbox checked', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsTreatmentForOrthodontics: {},
                    DateAppliancePlaced: {},
                },
            };
            scope.isTreatmentForOrthodontics = true;
            scope.DateAppliancePlaced = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.DateAppliancePlaced).toBe(
                scope.DateAppliancePlaced.toDateString()
            );
        });
        it('should set scope.claim.J430DMain.DateOfAccident to null if isTreatmentForOrthodontics checkbox is not checked', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsTreatmentForOrthodontics: {},
                    DateAppliancePlaced: {},
                },
            };
            scope.DateAppliancePlaced = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.DateAppliancePlaced).toBe(null);
        });
        it('should set scope.claim.J430DMain.DateOfPriorPlacement to value of scope.DateOfPriorPlacement if isReplacementOfProsthesis checkbox checked', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsReplacementOfProsthesis: {},
                    DateOfPriorPlacement: {},
                },
            };
            scope.isReplacementOfProsthesis = true;
            scope.DateOfPriorPlacement = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.DateOfPriorPlacement).toBe(
                scope.DateOfPriorPlacement.toDateString()
            );
        });
        it('should set scope.claim.J430DMain.DateOfPriorPlacement to null if isReplacementOfProsthesis checkbox is not checked', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsReplacementOfProsthesis: {},
                    DateOfPriorPlacement: {},
                },
            };
            scope.DateOfPriorPlacement = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.DateOfPriorPlacement).toBe(null);
        });
        it('should set scope.claim.J430DMain.DateOfAccident to value of scope.DateOfAccident if at least one treatment checkbox checked', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsOccupationalInjury: {},
                    IsAutoAccident: {},
                    IsOtherAccident: {},
                    DateOfAccident: {},
                },
            };
            scope.isAutoAccident = true;
            scope.DateOfAccident = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.DateOfAccident).toBe(scope.DateOfAccident.toDateString());
        });
        it('should set scope.claim.J430DMain.DateOfAccident to null if none of the treatment checkboxes checked', function () {
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsOccupationalInjury: {},
                    IsAutoAccident: {},
                    IsOtherAccident: {},
                    DateOfAccident: {},
                },
            };
            scope.DateOfAccident = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.DateOfAccident).toBe(null);
        });
        it('should set scope.claim.J430DMain.AutoAccidentState to value of scope.claim.J430DMain.AutoAccidentState if at least one treatment checkbox checked', function () {
            var accidentState = 'AK';
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsOccupationalInjury: {},
                    IsAutoAccident: {},
                    IsOtherAccident: {},
                    AutoAccidentState: accidentState,
                },
            };
            scope.isAutoAccident = true;
            scope.DateOfAccident = new Date('01/25/2011');
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.AutoAccidentState).toBe(accidentState);
        });
        it('should set scope.claim.J430DMain.AutoAccidentState to null if none of the treatment checkboxes checked', function () {
            var accidentState = 'AK';
            scope.claim = {
                ClaimCommon: {
                    IsPolicyHolderSignatureOnFile: false,
                    PolicyHolderSignatureDate: null,
                },
                J430DMain: {
                    IsOccupationalInjury: {},
                    IsAutoAccident: {},
                    IsOtherAccident: {},
                    AutoAccidentState: accidentState,
                },
            };
            ctrl.applyObjectChangesForChkBoxs();
            expect(scope.claim.J430DMain.AutoAccidentState).toBe(null);
        });
    });

    describe('ctrl.getPatientDisplayName ->', function () {
        it("should return a string matching the patient's name per the standards document", function () {
            scope.claim = {
                ClaimCommon: {
                    PatientFirstName: 'Test',
                    PatientPreferredName: '(T)',
                    PatientMiddleName: 'A.',
                    PatientLastName: 'Patient,',
                    PatientSuffix: 'Jr.',
                },
            };
            var result = ctrl.getPatientDisplayName();
            expect(result).toEqual('Test (T) A. Patient, Jr.');
        });
    });

    describe('$scope.updateDiagnosisPointer ->', function () {
        it('should set scope.claim.J430DDetails.DiagnosisPointer', function () {
            scope.claim = {
                J430DDetails: [
                    {
                        DiagnosisPointer: '',
                        J430DDetailId: '1',
                    },
                ],
            };
            var row = {
                J430DDetailId: '1',
                DiagnosisPointer: '123',
            };
            scope.updateDiagnosisPointer(row);
            expect(scope.claim.J430DDetails[0].DiagnosisPointer).toEqual('123');
        });
    });

    describe('ctrl.statesSetup ->', function () {
        it('should call staticData.States', function () {
            ctrl.init();
            expect(staticData.States).toHaveBeenCalled();
        });
    });

    describe('ctrl.setupKendoGrid ->', function () {
        it('should set $scope.gridData', function () {
            ctrl.setupKendoGrid();
            expect(scope.gridData).not.toEqual(null);
        });
    });
    describe('ctrl.getValidLettersForDiagnosisPointer ->', function () {
        it('should return array of diagnosis code letters', function () {
            scope.claim = {
                J430DMain: {
                    DiagnosisCodeA: 'Code',
                    DiagnosisCodeB: 'Code',
                },
            };
            var letters = ctrl.getValidLettersForDiagnosisPointer();
            expect(letters).toEqual(['A', 'B']);
        });
    });
    describe('scope.checkValidKeypress ->', function () {
        it('should not allow invalid key to be pressed by calling event.preventDefault', function () {
            scope.claim = {
                J430DMain: {
                    DiagnosisCodeA: 'Code',
                    DiagnosisCodeB: 'Code',
                },
            };
            var event = { key: 'C', preventDefault: jasmine.createSpy() };
            var row = { DiagnosisPointer: null };
            scope.checkValidKeypress(event, row);
            expect(event.preventDefault).toHaveBeenCalled();
        });
    });
    describe('ctrl.setTreatingDentistToBillingDentist ->', function () {
        var originalClaim = {};
        beforeEach(function () {
            ctrl.claimBackup = {
                J430DMain: {
                    PlaceOfTreatment: 'PlaceOfTreatmentValue',
                    TreatingDentistAddress1: 'TreatingDentistAddress1Value',
                    TreatingDentistAddress2: 'TreatingDentistAddress2Value',
                    TreatingDentistCity: 'TreatingDentistCityValue',
                    TreatingDentistStateProvince: 'TreatingDentistStateProvinceValue',
                    TreatingDentistPostalCode: 'TreatingDentistPostalCodeValue',
                    TreatingDentistLocationPrimaryPhone:
                        'TreatingDentistLocationPrimaryPhoneValue',
                },
            };
        });
        it('should reset treating dentist address to original values', function () {
            scope.claim = {
                J430DMain: {
                    PlaceOfTreatment: null,
                    TreatingDentistAddress1: null,
                    TreatingDentistAddress2: null,
                    TreatingDentistCity: null,
                    TreatingDentistStateProvince: null,
                    TreatingDentistPostalCode: null,
                    TreatingDentistLocationPrimaryPhone: null,
                },
            };
            ctrl.setTreatingDentistToBillingDentist();
            expect(scope.claim.J430DMain.PlaceOfTreatment).toBe(11);
            expect(scope.claim.J430DMain.PlaceOfTreatmentValue).toEqual(
                ctrl.claimBackup.J430DMain.PlaceOfTreatmentValue
            );
            expect(scope.claim.J430DMain.TreatingDentistAddress1).toEqual(
                ctrl.claimBackup.J430DMain.TreatingDentistAddress1
            );
            expect(scope.claim.J430DMain.TreatingDentistAddress2).toEqual(
                ctrl.claimBackup.J430DMain.TreatingDentistAddress2
            );
            expect(scope.claim.J430DMain.TreatingDentistCity).toEqual(
                ctrl.claimBackup.J430DMain.TreatingDentistCity
            );
            expect(scope.claim.J430DMain.TreatingDentistStateProvince).toEqual(
                ctrl.claimBackup.J430DMain.TreatingDentistStateProvince
            );
            expect(scope.claim.J430DMain.TreatingDentistLocationPrimaryPhone).toEqual(
                ctrl.claimBackup.J430DMain.TreatingDentistLocationPrimaryPhone
            );
        });
    });
    describe('ctrl.clearTreatingDentistFields ->', function () {
        it('should set treating dentist address fields to null', function () {
            scope.claim = {
                J430DMain: {
                    PlaceOfTreatment: 'value',
                    TreatingDentistAddress1: 'value',
                    TreatingDentistAddress2: 'value',
                    TreatingDentistCity: 'value',
                    TreatingDentistStateProvince: 'value',
                    TreatingDentistPostalCode: 'value',
                    TreatingDentistLocationPrimaryPhone: 'value',
                },
            };
            ctrl.clearTreatingDentistFields();
            expect(scope.claim.J430DMain.PlaceOfTreatment).toBe(null);
            expect(scope.claim.J430DMain.TreatingDentistAddress1).toBe(null);
            expect(scope.claim.J430DMain.TreatingDentistAddress2).toBe(null);
            expect(scope.claim.J430DMain.TreatingDentistCity).toBe(null);
            expect(scope.claim.J430DMain.TreatingDentistStateProvince).toBe(null);
            expect(scope.claim.J430DMain.TreatingDentistPostalCode).toBe(null);
            expect(scope.claim.J430DMain.TreatingDentistLocationPrimaryPhone).toBe(
                null
            );
        });
    });
    describe('scope.clearErrorMessages ->', function () {
        it('should set error messages to false', function () {
            scope.clearErrorMessages();
            expect(scope.invalidAddress).toBe(false);
            expect(scope.invalidCity).toBe(false);
            expect(scope.invalidState).toBe(false);
            expect(scope.invalidZip).toBe(false);
            expect(scope.invalidPhone).toBe(false);
        });
    });

    describe('scope.clearOrthoData ->', function () {
        it('should clear data when ortho flag is off', function () {
            var today = Date.now();
            scope.claim.J430DMain = {};
            scope.DateAppliancePlaced = new Date();
            scope.claim.J430DMain.TotalMonthsOfTreatment = 1;
            scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining = 1;
            scope.isTreatmentForOrthodontics = false;
            scope.removeOrthoData();
            expect(scope.DateAppliancePlaced).toBeGreaterThanOrEqual(today);
            expect(scope.DateAppliancePlaced).toBeLessThanOrEqual(Date.now());
            expect(scope.claim.J430DMain.TotalMonthsOfTreatment).toBe(null);
            expect(scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining).toBe(null);
        });

        it('should reset old data when retoggling', function () {
            var date = new Date();
            scope.claim.J430DMain = {};
            scope.DateAppliancePlaced = date;
            scope.claim.J430DMain.DateAppliancePlaced = date;
            scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining = 2;
            scope.isTreatmentForOrthodontics = false;
            scope.removeOrthoData();
            scope.isTreatmentForOrthodontics = true;
            scope.removeOrthoData();
            expect(scope.DateAppliancePlaced).toBe(date);
            expect(scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining).toBe(2);
        });
    });

    describe('scope.validateTotalMonthsTreatment ->', function () {
        it('should change to 1 when setting TotalMonthsOfTreatment to a negitive number', function () {
            var date = new Date();
            scope.claim.J430DMain = {};
            scope.claim.J430DMain.DateAppliancePlaced = date;
            scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining = -1;
            scope.claim.J430DMain.TotalMonthsOfTreatment = -10;
            scope.claim.J430DMain.IsTreatmentForOrthodontics = true;

            scope.validateTotalMonthsTreatment();

            expect(scope.claim.J430DMain.TotalMonthsOfTreatment).toBe(1);
        });

        it('should change to 99 when setting TotalMonthsOfTreatment to a number higher than 99', function () {
            var date = new Date();
            scope.claim.J430DMain = {};
            scope.claim.J430DMain.DateAppliancePlaced = date;
            scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining = -1;
            scope.claim.J430DMain.TotalMonthsOfTreatment = 120;
            scope.claim.J430DMain.IsTreatmentForOrthodontics = true;

            scope.validateTotalMonthsTreatment();

            expect(scope.claim.J430DMain.TotalMonthsOfTreatment).toBe(99);
        });

        it('should stay the same when value is between 1 and 99', function () {
            var date = new Date();
            scope.claim.J430DMain = {};
            scope.claim.J430DMain.DateAppliancePlaced = date;
            scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining = -1;
            scope.claim.J430DMain.TotalMonthsOfTreatment = 42;
            scope.claim.J430DMain.IsTreatmentForOrthodontics = true;

            scope.validateTotalMonthsTreatment();

            expect(scope.claim.J430DMain.TotalMonthsOfTreatment).toBe(42);
        });
    });

    describe('scope.validateTotalMonthsRemaining ->', function () {
        it('should change to 1 when setting TotalMonthsOfTreatmentRemaining to a negitive number', function () {
            var date = new Date();
            scope.claim.J430DMain = {};
            scope.claim.J430DMain.DateAppliancePlaced = date;
            scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining = -1;
            scope.claim.J430DMain.TotalMonthsOfTreatment = 99;
            scope.claim.J430DMain.IsTreatmentForOrthodontics = true;

            scope.validateTotalMonthsRemaining();

            expect(scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining).toBe(1);
        });

        it('should change to 99 when setting TotalMonthsOfTreatmentRemaining to a number higher than 99', function () {
            var date = new Date();
            scope.claim.J430DMain = {};
            scope.claim.J430DMain.DateAppliancePlaced = date;
            scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining = 9001;
            scope.claim.J430DMain.TotalMonthsOfTreatment = 99;
            scope.claim.J430DMain.IsTreatmentForOrthodontics = true;

            scope.validateTotalMonthsRemaining();

            expect(scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining).toBe(99);
        });

        it('should stay the same if the value is between 1 and 99', function () {
            var date = new Date();
            scope.claim.J430DMain = {};
            scope.claim.J430DMain.DateAppliancePlaced = date;
            scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining = 42;
            scope.claim.J430DMain.TotalMonthsOfTreatment = 99;
            scope.claim.J430DMain.IsTreatmentForOrthodontics = true;

            scope.validateTotalMonthsRemaining();

            expect(scope.claim.J430DMain.TotalMonthsOfTreatmentRemaining).toBe(42);
        });
    });

    describe('scope.removeProsthesisData ->', function () {
        it('should clear data when pros flag is off', function () {
            var today = Date.now();
            scope.DateOfPriorPlacement = new Date();
            scope.isReplacementOfProsthesis = false;
            scope.removeProsthesisData();
            expect(scope.DateOfPriorPlacement).toBeGreaterThanOrEqual(today);
            expect(scope.DateOfPriorPlacement).toBeLessThanOrEqual(Date.now());
        });

        it('should reset old data when retoggling', function () {
            var date = new Date();
            scope.claim.J430DMain = {};
            scope.DateOfPriorPlacement = date;
            scope.claim.J430DMain.DateOfPriorPlacement = date;
            scope.isReplacementOfProsthesis = false;
            scope.removeProsthesisData();
            scope.isReplacementOfProsthesis = true;
            scope.removeProsthesisData();
            expect(scope.DateOfPriorPlacement).toBe(date);
        });
    });

    describe('scope.removeAccidentData ->', function () {
        it('should clear data when accident flag is off', function () {
            var today = Date.now();
            scope.DateOfAccident = new Date();
            scope.isOccupationalInjury = false;
            scope.removeAccidentData();
            expect(scope.DateOfAccident).toBeGreaterThanOrEqual(today);
            expect(scope.DateOfAccident).toBeLessThanOrEqual(Date.now());
        });

        it('should reset old data when retoggling', function () {
            var date = new Date();
            scope.claim.J430DMain = {};
            scope.DateOfAccident = date;
            scope.claim.J430DMain.DateOfAccident = date;
            scope.isOccupationalInjury = false;
            scope.removeAccidentData();
            scope.isOccupationalInjury = true;
            scope.removeAccidentData();
            expect(scope.DateOfAccident).toBe(date);
        });
    });

    describe('scope.fixValueLength ->', function () {
        it('should change the value to be two characters, instead of a 1 digit int', function () {
            var result = scope.fixValueLength(2);

            expect(result).toBe('02');
        });

        it('should change the value to be two characters, instead of 1', function () {
            var result = scope.fixValueLength('2');

            expect(result).toBe('02');
        });

        it('should change the two digit value into a two char value', function () {
            var result = scope.fixValueLength(11);

            expect(result).toBe('11');
        });

        it('should not change the two character value', function () {
            var result = scope.fixValueLength('11');

            expect(result).toBe('11');
        });

        it('should not change the undefined value', function () {
            var result = scope.fixValueLength(undefined);

            expect(result).toBe(undefined);
        });
    });
});
