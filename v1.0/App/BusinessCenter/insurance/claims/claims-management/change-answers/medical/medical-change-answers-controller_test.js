describe('medical-change-answers', function () {
    var routeParams,
        location,
        localize,
        toastrFactory,
        patSecurityService,
        commonServices,
        staticData,
        timeout,
        $q,
        scope,
        ctrl,
        claimEnumService,
        mockPlaceOfTreatmentOption;
        
    beforeEach(module('Soar.BusinessCenter'));

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        routeParams = {
            claimId: 1,
        };

        location = {
            path: jasmine.createSpy('$location.path'),
        };

        localize = {
            getLocalizedString: jasmine.createSpy('localize.getLocalizedString'),
        };

        toastrFactory = {
            error: jasmine.createSpy('toastrFactory.error'),
            success: jasmine.createSpy('toastrFactory.success'),
        };

        patSecurityService = {
            IsAuthorizedByAbbreviation: jasmine
                .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
                .and.callFake(function () {
                    return true;
                }),
        };

        timeout = function (callback) {
            callback();
        };

        commonServices = {
            Insurance: {
                Claim: {
                    getMedicalCMS1500ById: jasmine
                        .createSpy('commonServices.Insurance.Claim.getMedicalCMS1500ById')
                        .and.returnValue({ $promise: null }),
                    updateMedicalCMS1500ById: jasmine.createSpy(
                        'commonServices.Insurance.Claim.updateMedicalCMS1500ById'
                    ),
                },
            },
        };

        $q = {
            all: jasmine
                .createSpy('$q.all')
        .and.returnValue({ then: function () {} }),
        };

        staticData = {
            States: jasmine
                .createSpy('staticData.States')
                .and.returnValue({ then: function () {} }),
        };

        mockPlaceOfTreatmentOption = [            
            { Text: '01 - Pharmacy', Value: 1 },
            { Text: '11 - Office', Value: 11 },
            { Text: '98 - Unspecified', Value: 98 },
            { Text: '99 - Other Place of Service', Value: 99 },
        ];

       
        ClaimsPlaceOfTreatment: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })

        let mockPlaceOfTreatmentList = [
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

        ctrl = $controller('MedicalChangeAnswersController', {
            $scope: scope,
            $routeParams: routeParams,
            $location: location,
            localize: localize,
            toastrFactory: toastrFactory,
            patSecurityService: patSecurityService,
            CommonServices: commonServices,
            StaticData: staticData,
            $timeout: timeout,
            $q: $q,
            ClaimEnumService: claimEnumService
        });
    }));

    describe('initial values -> ', function () {
        it('controller should exist', function () {
            expect(ctrl).not.toBeNull();
        });
        it('should have injected service', function () {
            expect(commonServices).not.toBeNull();
        });
        it('should have initialized', function () {
            expect(
                commonServices.Insurance.Claim.getMedicalCMS1500ById
            ).toHaveBeenCalled();
            expect(staticData.States).toHaveBeenCalled();
            expect(scope.canEdit).toEqual(true);
            expect(scope.loadingClaim).toEqual(true);
        });
    });

    describe('scope.cancel ->', function () {
        it('should call location.path', function () {
            scope.cancel();
            expect(location.path).toHaveBeenCalled();
        });
    });

    describe('ctrl.finishSetup ->', function () {
        it('should set claim and states', function () {
            var result = [
                { Value: { testdata: 'new test', Details: [{}] } },
                { Value: [{}, {}] },
            ];
            ctrl.finishSetup(result);
            expect(scope.claim).toEqual(result[0].Value);
            expect(scope.states).toEqual(result[1].Value);
            expect(scope.loadingClaim).toEqual(false);
            expect(scope.claim.Details).toEqual([{ IsFamilyPlanningString: 'N' }]);
        });
    });

    describe('ctrl.getClaimFailure ->', function () {
        it('should call toastrFactory', function () {
            ctrl.getClaimFailure();
            expect(toastrFactory.error).toHaveBeenCalled();
            expect(scope.loadingClaim).toEqual(false);
        });
    });

    describe('ctrl.getStatesFailure ->', function () {
        it('should call toastrFactory', function () {
            ctrl.getStatesFailure();
            expect(toastrFactory.error).toHaveBeenCalled();
            expect(scope.loadingClaim).toEqual(false);
        });
    });

    describe('ctrl.updateClaimSuccess ->', function () {
        it('should call toastrFactory and redirect', function () {
            ctrl.updateClaimSuccess();
            expect(toastrFactory.success).toHaveBeenCalled();
            expect(location.path).toHaveBeenCalled();
        });
    });

    describe(' ctrl.updateClaimFailure ->', function () {
        it('should call toastrFactory', function () {
            scope.claim = {};
            ctrl.updateClaimFailure();
            expect(toastrFactory.error).toHaveBeenCalled();
        });
    });

    describe('scope.save ->', function () {
        it('should set call update', function () {
            scope.claim = { CoverageType: 1, Details: [{}] };
            spyOn(ctrl, 'validate').and.callFake(function () {
                return true;
            });
            scope.save();
            expect(
                commonServices.Insurance.Claim.updateMedicalCMS1500ById
            ).toHaveBeenCalled();
            expect(scope.claim.Details).toEqual([{ IsFamilyPlanning: false }]);
        });
    });

    describe('scope.setupWatches -> ', function () {
        it('should update CurrentConditionQualifier when CurrentConditionDate is changed to null', function () {
            ctrl.setupWatches();
            scope.claim = { CurrentConditionQualifier: '2' };
            scope.CurrentConditionDate = new Date();
            scope.$digest();
            scope.CurrentConditionDate = null;
            scope.$digest();
            expect(scope.claim.CurrentConditionQualifier).toEqual('0');
        });
        it('should not update CurrentConditionQualifier when CurrentConditionDate is changed to not null', function () {
            scope.claim = { CurrentConditionQualifier: '2' };
            scope.CurrentConditionDate = null;
            ctrl.setupWatches();
            scope.CurrentConditionDate = new Date();
            scope.$digest();
            expect(scope.claim.CurrentConditionQualifier).toEqual('2');
        });
        it('should update OtherConditionQualifier when OtherConditionDate is changed to null', function () {
            ctrl.setupWatches();
            scope.claim = { OtherConditionQualifier: '2' };
            scope.OtherConditionDate = new Date();
            scope.$digest();
            scope.OtherConditionDate = null;
            scope.$digest();
            expect(scope.claim.OtherConditionQualifier).toEqual('0');
        });
        it('should not update CurrentConditionQualifier when CurrentConditionDate is changed to not null', function () {
            scope.claim = { OtherConditionQualifier: '2' };
            scope.OtherConditionDate = null;
            ctrl.setupWatches();
            scope.OtherConditionDate = new Date();
            scope.$digest();
            expect(scope.claim.OtherConditionQualifier).toEqual('2');
        });
    });

    describe('ctrl.fillCodes ->', function () {
        it('should set fill DiagnosisCodes to 12 values', function () {
            scope.claim = {};
            ctrl.fillCodes(scope.claim);
            expect(scope.claim.DiagnosisCodes).toEqual([
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
            ]);
            scope.claim = { DiagnosisCodes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] };
            ctrl.fillCodes(scope.claim);
            expect(scope.claim.DiagnosisCodes).toEqual([
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
            ]);
            scope.claim = { DiagnosisCodes: [1, 2, 3, 4, 5] };
            ctrl.fillCodes(scope.claim);
            expect(scope.claim.DiagnosisCodes).toEqual([
                1,
                2,
                3,
                4,
                5,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
            ]);
        });
    });

    describe('scope.isAutoAccidentChange ->', function () {
        it('should set AutoAccidentState to null if false', function () {
            scope.claim = { IsAutoAccident: false, AutoAccidentState: 'stuff' };
            scope.isAutoAccidentChange();
            expect(scope.claim.AutoAccidentState).toEqual(null);
        });
        it('should not set AutoAccidentState to null if true', function () {
            scope.claim = { IsAutoAccident: true, AutoAccidentState: 'stuff' };
            scope.isAutoAccidentChange();
            expect(scope.claim.AutoAccidentState).toEqual('stuff');
        });
    });

    describe('scope.outsideLabChanged ->', function () {
        it('should set OutsideLabCharge to 0 if false', function () {
            scope.claim = { OutsideLab: true, OutsideLabCharge: 10 };
            scope.outsideLabChanged(false);
            expect(scope.claim.OutsideLabCharge).toEqual(0);
        });
        it('should not set OutsideLabCharge to 0 if true', function () {
            scope.claim = { OutsideLab: false, OutsideLabCharge: 10 };
            scope.outsideLabChanged(true);
            expect(scope.claim.OutsideLabCharge).toEqual(10);
        });
    });

    describe('scope.isPolicyHolderSignatureOnFileChanged ->', function () {
        it('should set PolicyHolderSignatureDate to null if false', function () {
            scope.claim = {
                IsPolicyHolderSignatureOnFile: true,
                PolicyHolderSignatureDate: new Date(),
            };
            scope.isPolicyHolderSignatureOnFileChanged(false);
            expect(scope.claim.PolicyHolderSignatureDate).toEqual(null);
        });
        it('should set PolicyHolderSignatureDate to null if true', function () {
            scope.claim = {
                IsPolicyHolderSignatureOnFile: false,
                PolicyHolderSignatureDate: null,
            };
            scope.isPolicyHolderSignatureOnFileChanged(true);
            expect(scope.claim.PolicyHolderSignatureDate);
        });
    });

    describe('scope.referringProviderBlur ->', function () {
        it('should clear out ReferringPhysicianQualifier and ReferringPhysicianNpi if ReferringPhysicianName is emptied', function () {
            scope.claim = {
                ReferringPhysicianName: '',
                ReferringPhysicianQualifier: '1',
                ReferringPhysicianNpi: 1234,
            };
            scope.referringProviderBlur();
            expect(scope.claim.ReferringPhysicianQualifier).toEqual('0');
            expect(scope.claim.ReferringPhysicianNpi).toEqual(null);
        });
        it('should do nothing if ReferringPhysicianName is not empty', function () {
            scope.claim = {
                ReferringPhysicianName: 'Name',
                ReferringPhysicianQualifier: '1',
                ReferringPhysicianNpi: 1234,
            };
            scope.referringProviderBlur();
            expect(scope.claim.ReferringPhysicianQualifier).toEqual('1');
            expect(scope.claim.ReferringPhysicianNpi).toEqual(1234);
        });
    });

    describe('scope.otherReferringPhysicianBlur ->', function () {
        it('should clear out ReferringPhysicianOtherIdType if ReferringPhysicianOtherId is emptied', function () {
            scope.claim = {
                ReferringPhysicianOtherId: '',
                ReferringPhysicianOtherIdType: '1',
            };
            scope.otherReferringPhysicianBlur();
            expect(scope.claim.ReferringPhysicianOtherIdType).toEqual('0');
        });
        it('should do nothing if ReferringPhysicianOtherId is not empty', function () {
            scope.claim = {
                ReferringPhysicianOtherId: 'Name',
                ReferringPhysicianOtherIdType: '1',
            };
            scope.referringProviderBlur();
            expect(scope.claim.ReferringPhysicianOtherIdType).toEqual('1');
        });
    });

    describe('scope.modifierKeyPress ->', function () {
        var event;

        beforeEach(function () {
            event = {
                key: 'A',
                preventDefault: jasmine.createSpy('event.preventDefault'),
            };
        });
        it('should add letter to DiagnosisPointer if it is valid', function () {
            scope.claim = {
                DiagnosisCodes: ['abc', null],
                Details: [{ DiagnosisPointer: 'BCD' }],
            };
            scope.modifierKeyPress(event, scope.claim.Details[0]);
            expect(scope.claim.Details[0].DiagnosisPointer).toEqual('BCDA');
            expect(event.preventDefault).toHaveBeenCalled();
        });
        it('should not add letter to DiagnosisPointer if it is not valid', function () {
            scope.claim = {
                DiagnosisCodes: ['abc', null],
                Details: [{ DiagnosisPointer: 'A' }],
            };
            scope.modifierKeyPress(event, scope.claim.Details[0]);
            expect(scope.claim.Details[0].DiagnosisPointer).toEqual('A');
            expect(event.preventDefault).toHaveBeenCalled();
        });
        it('should not add letter to DiagnosisPointer there are already four characters', function () {
            scope.claim = {
                DiagnosisCodes: ['abc', null],
                Details: [{ DiagnosisPointer: 'BCDE' }],
            };
            scope.modifierKeyPress(event, scope.claim.Details[0]);
            expect(scope.claim.Details[0].DiagnosisPointer).toEqual('BCDE');
            expect(event.preventDefault).toHaveBeenCalled();
        });
        it('should allow through the backspace character', function () {
            event.key = 'backspace';
            scope.claim = {
                DiagnosisCodes: ['abc', null],
                Details: [{ DiagnosisPointer: 'B' }],
            };
            scope.modifierKeyPress(event, scope.claim.Details[0]);
            expect(scope.claim.Details[0].DiagnosisPointer).toEqual('B');
            expect(event.preventDefault).not.toHaveBeenCalled();
        });
    });

    describe('scope.emgKeyPress ->', function () {
        var event;
        beforeEach(function () {
            event = {
                key: 'Y',
                preventDefault: jasmine.createSpy('event.preventDefault'),
            };
        });
        it('should allow Y', function () {
            scope.claim = { Details: [{}] };
            scope.emgKeyPress(event, scope.claim.Details[0]);
            expect(scope.claim.Details[0].EmergencyService).toEqual('Y');
            expect(event.preventDefault).toHaveBeenCalled();
        });
        it('should not allow S', function () {
            event.key = 's';
            scope.claim = { Details: [{}] };
            scope.emgKeyPress(event, scope.claim.Details[0]);
            expect(scope.claim.Details[0].EmergencyService).toEqual(undefined);
            expect(event.preventDefault).toHaveBeenCalled();
        });
        it('should allow backspace', function () {
            event.key = 'backspace';
            scope.claim = { Details: [{ EmergencyService: 'Y' }] };
            scope.emgKeyPress(event, scope.claim.Details[0]);
            expect(scope.claim.Details[0].EmergencyService).toEqual('Y');
            expect(event.preventDefault).not.toHaveBeenCalled();
        });
    });

    describe('scope.planningKeyPress ->', function () {
        var event;
        beforeEach(function () {
            event = {
                key: 'Y',
                preventDefault: jasmine.createSpy('event.preventDefault'),
            };
        });
        it('should allow Y', function () {
            scope.claim = { Details: [{}] };
            scope.planningKeyPress(event, scope.claim.Details[0]);
            expect(scope.claim.Details[0].IsFamilyPlanningString).toEqual('Y');
            expect(event.preventDefault).toHaveBeenCalled();
        });
        it('should allow N', function () {
            scope.claim = { Details: [{}] };
            event.key = 'N';
            scope.planningKeyPress(event, scope.claim.Details[0]);
            expect(scope.claim.Details[0].IsFamilyPlanningString).toEqual('N');
            expect(event.preventDefault).toHaveBeenCalled();
        });
        it('should not allow S', function () {
            event.key = 's';
            scope.claim = { Details: [{}] };
            scope.planningKeyPress(event, scope.claim.Details[0]);
            expect(scope.claim.Details[0].IsFamilyPlanningString).toEqual(undefined);
            expect(event.preventDefault).toHaveBeenCalled();
        });
        it('should allow backspace', function () {
            event.key = 'backspace';
            scope.claim = { Details: [{ IsFamilyPlanningString: 'Y' }] };
            scope.planningKeyPress(event, scope.claim.Details[0]);
            expect(scope.claim.Details[0].IsFamilyPlanningString).toEqual('Y');
            expect(event.preventDefault).not.toHaveBeenCalled();
        });
    });

    describe('ctrl.validate ->', function () {
        var claim;
        beforeEach(function () {
            claim = {
                CoverageType: 1,
                ClaimCodes: 'W2 - Duplicate',
                IsOccupationalInjury: true,
                IsOtherAccident: true,
                IsAutoAccident: true,
                AutoAccidentState: 'AK',
                OtherAgencyClaimId: 'First Last',
                UnableToWorkStartDate: new Date(1999, 1, 1),
                UnableToWorkEndDate: new Date(2000, 1, 1),
                HosipitalizationStartDate: new Date(1999, 1, 1),
                HosipitalizationEndDate: new Date(2000, 1, 1),
                OutsideLab: true,
                OutsideLabCharge: 10.0,
                IsPolicyHolderSignatureOnFile: true,
                PolicyHolderSignatureDate: new Date(),
                ProviderAcceptAssignment: true,
                CurrentConditionDate: new Date(1999, 1, 1),
                OtherConditionDate: new Date(1999, 1, 1),
                CurrentConditionQualifier: '431',
                OtherConditionQualifier: '454',
                ReferringPhysicianName: 'Kyle Codeslayer Deak',
                ReferringPhysicianNpi: '1234567890',
                ReferringPhysicianQualifier: '1',
                ReferringPhysicianOtherId: 'numbah1',
                ReferringPhysicianOtherIdType: '1',
                DiagnosisCodes: [
                    'asf',
                    'asdf',
                    'asdfg',
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                ],
                Details: [
                    {
                        PlaceOfService: 11,
                        EmergencyService: 'Y',
                        ProcedureCodeModifiers: ['ad', 'ba', 'cd', null],
                        DiagnosisPointer: 'ABC',
                        EPSDT: 'S2',
                        IsFamilyPlanningString: 'Y',
                    },
                ],
            };
        });
        it('should return true when valid', function () {
            scope.states = [{ Abbreviation: 'AK' }];
            scope.placeOfTreatmentOptions = mockPlaceOfTreatmentOption;
            var result = ctrl.validate(claim);
            expect(result).toEqual(true);
        });
        it("should return false when CoverageType isn't valid", function () {
            claim.CoverageType = -1;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when AutoAccident true and no AutoAccidentState', function () {
            claim.AutoAccidentDate = null;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when AutoAccident false and some AutoAccidentState', function () {
            claim.IsAutoAccident = false;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when ClaimCodes not null and not in claimCodes list', function () {
            claim.ClaimCodes = 'something';
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when OtherAgencyClaimId greater than 28 characters', function () {
            claim.OtherAgencyClaimId = 'abcdefghijklmnopqrstuvwxyzabc';
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when UnableToWorkStartDate and no UnableToWorkEndDate', function () {
            claim.UnableToWorkEndDate = null;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when UnableToWorkEndDate and no UnableToWorkStartDate', function () {
            claim.UnableToWorkStartDate = null;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when UnableToWorkStartDate greater than UnableToWorkEndDate', function () {
            claim.UnableToWorkStartDate = new Date(2000, 1, 1);
            claim.UnableToWorkEndDate = new Date(1999, 1, 1);
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when HosipitalizationStartDate and no HosipitalizationEndDate', function () {
            claim.HosipitalizationEndDate = null;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when HosipitalizationEndDate and no HosipitalizationStartDate', function () {
            claim.HosipitalizationStartDate = null;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when HosipitalizationStartDate greater than HosipitalizationEndDate', function () {
            claim.HosipitalizationStartDate = new Date(2000, 1, 1);
            claim.HosipitalizationEndDate = new Date(1999, 1, 1);
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when CurrentConditionDate is filled out and CurrentConditionQualifier is not', function () {
            claim.CurrentConditionQualifier = null;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when OtherConditionDate is filled out and OtherConditionQualifier is not', function () {
            claim.OtherConditionQualifier = null;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when CurrentConditionDate is later than today', function () {
            claim.CurrentConditionDate = new Date(2099, 1, 1);
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when OtherConditionDate is later than today', function () {
            claim.OtherConditionDate = new Date(2099, 1, 1);
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when ReferringPhysicianName is filled out and ReferringPhysicianQualifier is not', function () {
            claim.ReferringPhysicianQualifier = null;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when ReferringPhysicianName is filled out and ReferringPhysicianNpi is not', function () {
            claim.ReferringPhysicianNpi = null;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when ReferringPhysicianName is filled out and ReferringPhysicianNpi is not 10 characters', function () {
            claim.ReferringPhysicianNpi = '12345678';
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when ReferringPhysicianOtherId is filled out and ReferringPhysicianOtherIdType is not', function () {
            claim.ReferringPhysicianOtherIdType = null;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when OutsideLab true and OutsideLabCharge is zero', function () {
            claim.OutsideLabCharge = 0;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when OutsideLab true and OutsideLabCharge is too big', function () {
            claim.OutsideLabCharge = 1000000;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when OutsideLab false and OutsideLabCharge is not zero', function () {
            claim.OutsideLab = false;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when IsPolicyHolderSignatureOnFile and no PolicyHolderSignatureDate', function () {
            claim.PolicyHolderSignatureDate = null;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when IsPolicyHolderSignatureOnFile is false and PolicyHolderSignatureDate', function () {
            claim.IsPolicyHolderSignatureOnFile = false;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when IsPolicyHolderSignatureOnFile is false and PolicyHolderSignatureDate', function () {
            claim.IsPolicyHolderSignatureOnFile = false;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when Diagnosis Codes have null gaps', function () {
            claim.DiagnosisCodes = [null, 'asf', 'asdf'];
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when PlaceOfService is illegal', function () {
            claim.Details[0].PlaceOfService = 10;
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when EmergencyService is illegal', function () {
            claim.Details[0].EmergencyService = 'S';
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when ProcedureCodeModifiers is illegal', function () {
            claim.Details[0].ProcedureCodeModifiers[0] = 'ABC';
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when DiagnosisPointer letter is not filled in DiagnosisCodes', function () {
            claim.Details[0].DiagnosisPointer = 'E';
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when DiagnosisPointer has illegal letters', function () {
            claim.Details[0].DiagnosisPointer = 'ABCX';
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when EPSDT is illegal', function () {
            claim.Details[0].EPSDT = 's200';
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
        it('should return false when IsFamilyPlanningString is illegal', function () {
            claim.Details[0].IsFamilyPlanningString = 'L';
            var result = ctrl.validate(claim);
            expect(result).toEqual(false);
        });
    });


    describe('addMissingValues function', function() {
        it('should add missing values with descriptions when input list is incomplete', function() {
            let placeOfTreatmentList = [
                { code: 1, description: 'Hospital' },
                { code: 3, description: 'Clinic' },
                { code: 5, description: 'Health Center' }
            ];
            let result = ctrl.addMissingValues(placeOfTreatmentList);
            expect(result.length).toEqual(99); 
            expect(result[0]).toEqual({ Value: 1, Text: 'Hospital' }); 
            expect(result[1]).toEqual({ Value: 2, Text: '2 - Unspecified' }); 
            expect(result[2]).toEqual({ Value: 3, Text: 'Clinic' }); 
            
        });
    
        it('should add all values with descriptions when input list is complete', function() {
          
            let placeOfTreatmentList = [
                { code: 1, description: 'Hospital' },
                { code: 2, description: 'Home' },
            ];
            let result = ctrl.addMissingValues(placeOfTreatmentList);
            expect(result.length).toEqual(99);
        });
    
        it('should return an empty array when input list is empty', function() {
            let placeOfTreatmentList = [];
            let result = ctrl.addMissingValues(placeOfTreatmentList);
            expect(result.length).toEqual(99); 
        });
    });
    
});
