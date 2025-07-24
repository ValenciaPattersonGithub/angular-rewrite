describe('PatientEncounterEstinsController ->', function () {
    let ctrl, scope, $q,
        mockReferenceDataService;

    beforeEach(module('Soar.Common'));
    beforeEach(module('common.factories'));
    beforeEach(module('Soar.Patient', function ($provide) {
        mockReferenceDataService = {
            getData: jasmine.createSpy('mockReferenceDataService.get'),
            entityNames: {
                locations: 'locations',
            },
        };
        $provide.value('referenceDataService', mockReferenceDataService);
    }));

    beforeEach(inject(function ($controller, $rootScope, $q) {
        $q = $q;
        scope = $rootScope.$new();
        scope.$watch = jasmine.createSpy();

        mockReferenceDataService.getData.and.returnValue(
            $q.resolve([{ LocationId: 3, Timezone: 'Central Standard Time' }])
        );

        ctrl = $controller('PatientEncounterEstinsController', {
            $scope: scope,
            $q: $q,
            referenceDataService: mockReferenceDataService,
        });

    }));

    describe('verifyMaxAmount -> ', function () {
        beforeEach(function () {

            scope.inputData = {
                Fee: 271.7,
                Tax: 4.89,
                Discount: 27.17,
                InsuranceEstimates: [
                    { EstInsurance: 11, AdjEst: 222.53, PatientBenefitPlanId: 1, AllowedAmount: 22 },
                    { EstInsurance: 0, AdjEst: 0, PatientBenefitPlanId: 2 },
                ],
            };
        });

        it('should set validInsAmount to true when estimate is same as fee schedule', function () {
            let estimate = {
                InputEstInsurance: 26.89,
                LatestEstInsurance: 15,
                validInsAmount: false,
            };

            scope.verifyMaxAmount('ins', estimate);

            expect(estimate.validInsAmount).toBe(true);
        });
        it('should set validInsAmount to true when estimate is smaller than fee schedule', function () {
            let estimate = {
                InputEstInsurance: 26.88,
                LatestEstInsurance: 15,
                validInsAmount: false,
            };

            scope.verifyMaxAmount('ins', estimate);

            expect(estimate.validInsAmount).toBe(true);
        });
        it('should set validInsAmount to true when estimate is greater than fee schedule', function () {
            let estimate = {
                InputEstInsurance: 27.00,
                LatestEstInsurance: 15,
                validInsAmount: true,
            };

            scope.verifyMaxAmount('ins', estimate);

            expect(estimate.validInsAmount).toBe(false);
        });

        it('should set scope validInsAmount to true when InputTotalEstInsurance is same as fee schedule', function () {
            scope.inputData.InputTotalEstInsurance = 49.17;
            scope.verifyMaxAmount('adj', {});

            expect(scope.validInsAmount).toBe(true);
        });
        it('should set scope validInsAmount to true when InputTotalEstInsurance is greater than fee schedule', function () {
            scope.inputData.InputTotalEstInsurance = 49.18;
            scope.verifyMaxAmount('adj', {});

            expect(scope.validInsAmount).toBe(false);
        });

        it('should set scope validInsAmount to true when InputTotalEstInsurance is smaller than fee schedule', function () {
            scope.inputData.InputTotalEstInsurance = 47.18;
            scope.verifyMaxAmount('adj', {});

            expect(scope.validInsAmount).toBe(true);
        });
    });
});