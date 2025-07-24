describe('OdontogramUtilities', function () {
  var service;

  beforeEach(module('Soar.Patient'));
  beforeEach(inject(function ($injector) {
    //creating controller
    service = $injector.get('OdontogramUtilities');

    var teethList = [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      '11',
      'A',
    ];
    var teethDefs = [];
    angular.forEach(teethList, function (tooth) {
      teethDefs.push({ USNumber: tooth });
    });
    service.setTeethDefinitions({ Teeth: teethDefs });
  }));

  describe('isRange function -->', function () {
    it('should return true if tooth is a range', function () {
      expect(service.isRange('1-8')).toBe(true);
      expect(service.isRange('A-B')).toBe(true);
      expect(service.isRange('1-16')).toBe(true);
      expect(service.isRange('17-18')).toBe(true);
    });

    it('should return false if tooth is not a range', function () {
      expect(service.isRange('8')).toBe(false);
      expect(service.isRange('8-')).toBe(false);
      expect(service.isRange('-A')).toBe(false);
    });

    it('should return false if a falsy value is passed', function () {
      expect(service.isRange(null)).toBe(false);
      expect(service.isRange('')).toBe(false);
      expect(service.isRange(undefined)).toBe(false);
    });

    it('should handle numbers as well as strings', function () {
      expect(service.isRange(8)).toBe(false);
    });
  });

  describe('isToothInRange function -->', function () {
    it('should return true if selectedTooth is in range', function () {
      expect(service.isToothInRange('1-8', 1)).toBe(true);
      expect(service.isToothInRange('1-8', 4)).toBe(true);
      expect(service.isToothInRange('1-8', 8)).toBe(true);
    });

    it('should return false if selectedTooth is not in range', function () {
      expect(service.isToothInRange('1-8', 9)).toBe(false);
      expect(service.isToothInRange('1-8', 10)).toBe(false);
      expect(service.isToothInRange('1-8', 'A')).toBe(false);
    });

    it('should return false if selectedTooth is not in service.teethList', function () {
      expect(service.isToothInRange('1-8', 14)).toBe(false);
      expect(service.isToothInRange('1-8', 'J')).toBe(false);
    });
  });

  describe('getTeethInRange function ->', function () {
    describe('when parameter is not a range ->', function () {
      it('should return an array with the parameter as the only element', function () {
        var tooth = '5';
        var result = service.getTeethInRange(tooth);
        expect(result).not.toBeNull();
        expect(result.length).toBe(1);
        expect(result[0]).toBe(tooth);
      });
    });

    describe('when parameter is a range ->', function () {
      it('should return all teeth in the range', function () {
        var range = '1-5';
        var result = service.getTeethInRange(range);
        expect(result).not.toBeNull();
        expect(result.length).toBe(5);
        expect(result).toEqual(['1', '2', '3', '4', '5']);
      });
    });
  });

  describe('getOrderGroup function ->', function () {
    // copy of orderGroupMap from service
    var expects = {
        services: {
            1: 1, // Proposed
            2: 3, // Referred
            3: 9, // Rejected
            4: 6, // Completed
            5: 4, // Pending
            6: 8, // Existing
            7: 2, // Accepted
            8: 7, // ReferredCompleted
        },
        conditions: {
            1: 5, // Present
            2: 10, // Resolved
        },

    };

    it('should return correct values', function () {
      var types = { service: 'ServiceTransaction', condition: 'Condition' };
      var testRuns = [
        { RecordType: types.service, StatusId: 1, expect: expects.services[1] },
        { RecordType: types.service, StatusId: 2, expect: expects.services[2] },
        { RecordType: types.service, StatusId: 3, expect: expects.services[3] },
        { RecordType: types.service, StatusId: 4, expect: expects.services[4] },
        { RecordType: types.service, StatusId: 5, expect: expects.services[5] },
        { RecordType: types.service, StatusId: 6, expect: expects.services[6] },
        { RecordType: types.service, StatusId: 7, expect: expects.services[7] },
        { RecordType: types.service, StatusId: 8, expect: expects.services[8] },
        {
          RecordType: types.condition,
          StatusId: 1,
          expect: expects.conditions[1],
        },
        {
          RecordType: types.condition,
          StatusId: 2,
          expect: expects.conditions[2],
        },
      ];
      testRuns.forEach(run => {
        var result = service.getOrderGroup(run);
        expect(result).toBe(run.expect);
      });
    });
  });
});
