describe('business-center-filters tests -> ', function () {
  var scope, parentScope, filter;
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $filter) {
    scope = $rootScope.$new();
    parentScope = $rootScope.$new();
    scope.$parent = parentScope;
    filter = $filter;
  }));

  describe('unsubmittedClaimCount ->', function () {
    it('should count the number of unsubmitted claims and PreDs', function () {
      var claims = [
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 1 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 2 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 3 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 4 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 5 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 6 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 7 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 1 },
          inLocation: false,
        },
      ];
      parentScope.selectedaccountMemberOption = 1;

      var count = filter('unsubmittedClaimCount')(claims, scope);

      expect(count).toEqual(2);
    });
  });

  describe('submittedClaimCount ->', function () {
    it('should count the number of submitted claims and PreDs', function () {
      var claims = [
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 1 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 2 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 3 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 4 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 5 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 6 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 7 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 7 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 9 },
          inLocation: true,
        },
      ];
      parentScope.selectedaccountMemberOption = 1;

      var count = filter('submittedClaimCount')(claims, scope);

      expect(count).toEqual(5);
    });
  });

  describe('allClaimCount ->', function () {
    it('should count the number of all claims and PreDs', function () {
      var claims = [
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 1 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 2 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 3 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 4 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 5 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 6 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 7 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 9 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 1 },
          inLocation: false,
        },
      ];
      parentScope.selectedaccountMemberOption = 1;

      var count = filter('allClaimCount')(claims, scope);

      expect(count).toEqual(8);
    });
  });

  describe('allClaimCountWithDefault ->', function () {
    it('should filter out default statuses and return the count remaining', function () {
      var claims = [
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 1 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 2 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 3 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 4 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 5 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 6 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 7 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 9 },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 1 },
          inLocation: false,
        },
      ];
      parentScope.selectedaccountMemberOption = 1;

      var count = filter('allClaimCountWithDefault')(claims, scope);

      expect(count).toEqual(7);
    });
  });

  describe('submittedClaimFee ->', function () {
    it('should sum the fee of submitted claims and PreDs', function () {
      var claims = [
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 1 },
          inLocation: true,
          feesCalculated: 10,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 2 },
          inLocation: true,
          feesCalculated: 10,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 3 },
          inLocation: true,
          feesCalculated: 10,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 4 },
          inLocation: true,
          feesCalculated: 10,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 5 },
          inLocation: true,
          feesCalculated: 10,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 6 },
          inLocation: true,
          feesCalculated: 10,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 7 },
          inLocation: true,
          feesCalculated: 10,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 9 },
          inLocation: true,
          feesCalculated: 10,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 1 },
          inLocation: false,
          feesCalculated: 10,
        },
      ];
      parentScope.selectedaccountMemberOption = 1;

      var fee = filter('submittedClaimFee')(claims, scope);

      expect(fee).toEqual(50);
    });
  });

  describe('alertClaimCount ->', function () {
    it('should count the number of claims and PreDs with alerts', function () {
      var claims = [
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 2 },
          ClaimEntity: { HasErrors: true },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 2 },
          ClaimEntity: { HasErrors: false },
          inLocation: true,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 6 },
          ClaimEntity: { HasErrors: false },
          inLocation: true,
        },
      ];
      parentScope.selectedaccountMemberOption = 1;

      var count = filter('alertClaimCount')(claims, scope);

      expect(count).toEqual(2);
    });
  });

  describe('alertClaimFee ->', function () {
    it('should sum the fee of claims and PreDs with alerts', function () {
      var claims = [
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 2 },
          ClaimEntity: { HasErrors: true },
          inLocation: true,
          feesCalculated: 10,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 2 },
          ClaimEntity: { HasErrors: false },
          inLocation: true,
          feesCalculated: 10,
        },
        {
          ClaimCommon: { ApplicationPatientId: 1, Status: 6 },
          ClaimEntity: { HasErrors: false },
          inLocation: true,
          feesCalculated: 10,
        },
      ];

      parentScope.selectedaccountMemberOption = 1;

      var fee = filter('alertClaimFee')(claims, scope);

      expect(fee).toEqual(20);
    });
  });

  describe('getActivityAction ->', function () {
    var enumCount = 15;
    it('should convert invalid ActivityAction enum value to empty string', function () {
      expect(filter('getActivityAction')(0).length).toEqual(0);
    });
    it('should convert invalid ActivityAction enum value to empty string', function () {
      expect(filter('getActivityAction')(enumCount + 1).length).toEqual(0);
    });
    it('should convert ActivityAction enum values to localized string values', function () {
      for (var i = 1; i <= enumCount; i++) {
        expect(filter('getActivityAction')(i).length).toBeGreaterThan(0);
      }
    });
  });

  describe('getActivityArea ->', function () {
    var enumCount = 19;
    it('should convert invalid ActivityArea enum value to empty string', function () {
      expect(filter('getActivityArea')(0).length).toEqual(0);
    });
    it('should convert invalid ActivityArea enum value to empty string', function () {
      expect(filter('getActivityArea')(enumCount + 1).length).toEqual(0);
    });
    it('should convert ActivityArea enum values to localized string values', function () {
      for (var i = 1; i <= enumCount; i++) {
        expect(filter('getActivityArea')(i).length).toBeGreaterThan(0);
      }
    });
  });

  describe('getActivityType ->', function () {
    var enumCount = 55;
    it('should convert invalid ActivityType enum value to empty string', function () {
      expect(filter('getActivityType')(0).length).toEqual(0);
    });
    it('should convert invalid ActivityType enum value to empty string', function () {
      expect(filter('getActivityType')(enumCount + 1).length).toEqual(0);
    });
    it('should convert ActivityType enum values to localized string values', function () {
      for (var i = 1; i <= enumCount; i++) {
        expect(filter('getActivityType')(i).length).toBeGreaterThan(0);
      }
    });
  });

  describe('claimPatientName ->', function () {
    it('should return correctly formatted name when all fields filled', function () {
      var claim = {
        PatientFirstName: 'First',
        PatientLastName: 'Last',
        PatientSuffix: 'Jr',
      };
      expect(filter('claimPatientName')(claim)).toEqual("First Last Jr's");
    });
    it('should return correctly formatted name when last name missing', function () {
      var claim = { PatientFirstName: 'First', PatientSuffix: 'Jr' };
      expect(filter('claimPatientName')(claim)).toEqual("First Jr's");
    });
    it('should return correctly formatted name when suffix missing', function () {
      var claim = { PatientFirstName: 'First', PatientLastName: 'Last' };
      expect(filter('claimPatientName')(claim)).toEqual("First Last's");
    });
    it('should return correctly formatted name when first name missing', function () {
      var claim = { PatientLastName: 'Last', PatientSuffix: 'Jr' };
      expect(filter('claimPatientName')(claim)).toEqual("Last Jr's");
    });
    it('should return unknown name when no fields', function () {
      var claim = {};
      expect(filter('claimPatientName')(claim)).toEqual("Unknown's");
    });
  });

  describe('claimTotalFees ->', function () {
    it('should return sum when details exist', function () {
      var claim = { Details: [{ Fee: 12 }, { Fee: 13 }] };
      expect(filter('claimTotalFees')(claim)).toEqual('$25.00');
    });
    it('should return zero when no details', function () {
      var claim = {};
      expect(filter('claimTotalFees')(claim)).toEqual('$0.00');
    });
  });

  describe('medicalClaimDiagnosisCodesAreValid ->', function () {
    it('should return true when no gaps', function () {
      var claim = { DiagnosisCodes: ['asf', 'asdf', null, null] };
      expect(filter('medicalClaimDiagnosisCodesAreValid')(claim)).toEqual(true);
    });
    it('should return true when all empty', function () {
      var claim = { DiagnosisCodes: [null, null, null, null] };
      expect(filter('medicalClaimDiagnosisCodesAreValid')(claim)).toEqual(true);
    });
    it('should return true when all full', function () {
      var claim = { DiagnosisCodes: ['asf', 'asdf', 'fddf', 'sdkh'] };
      expect(filter('medicalClaimDiagnosisCodesAreValid')(claim)).toEqual(true);
    });
    it('should return false when there are gaps', function () {
      var claim = { DiagnosisCodes: [null, 'asdf', null, null] };
      expect(filter('medicalClaimDiagnosisCodesAreValid')(claim)).toEqual(
        false
      );
    });
  });
});
