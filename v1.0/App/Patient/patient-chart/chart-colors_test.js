describe('ChartColors ->', function () {
  var service, chartColorData;

  //#region before each

  beforeEach(module('Soar.Patient'));

  // inject the factory
  beforeEach(inject(function ($injector) {
    service = $injector.get('ChartColors');

    chartColorData = {
      conditions: [
        ['', ''],
        ['#2c97dd', 'cond-pres'], // 1 - Present
        ['#14527a', 'cond-rslv'], // 2 - Resolved
      ],
      services: [
        // index corresponds to service status id
        ['', ''],
        ['#ea4b35', 'prop'], // 1 - Proposed
        ['#9c56b9', 'ref'], // 2 - Referred
        ['#6c5547', 'rej'], // 3 - Rejected
        ['#1aaf5d', 'comp'], // 4 - Completed
        ['#ea4b35', 'pend'], // 5 - Pending
        ['#000000', 'exis'], // 6 - Existing
        ['#9d2c1c', 'acc'], // 7 - Accepted
        ['#5a2670', 'rcomp'], // 8 - ReferredCompleted
      ],
    };
  }));

  //#endregion

  it('should exist', function () {
    expect(service).toBeDefined();
  });

  describe('getChartColorData function ->', function () {
    describe('when recordType is Condition ->', function () {
      var recordType;
      beforeEach(function () {
        recordType = 'Condition';
      });

      it('should return conditions[status]', function () {
        var status = 1;

        var retVal = service.getChartColorData(recordType, status);

        expect(retVal).toEqual(chartColorData.conditions[status]);
      });

      it('should return conditions.resolved if status is invalid', function () {
        var status = 'junk';

        var retVal = service.getChartColorData(recordType, status);

        expect(retVal).toEqual(['', '']);
      });
    });

    describe('when recordType is ServiceTransaction ->', function () {
      var recordType;
      beforeEach(function () {
        recordType = 'ServiceTransaction';
      });

      it('should return services[status]', function () {
        var status = 5;

        var retVal = service.getChartColorData(recordType, status);

        expect(retVal).toEqual(chartColorData.services[status]);
      });

      it('should return empty strings if status is invalid', function () {
        var status = 'junk';

        var retVal = service.getChartColorData(recordType, status);

        expect(retVal).toEqual(['', '']);
      });
    });

    describe('when recordType is invalid ->', function () {
      it('should return empty strings', function () {
        var recordType = 'junk';
        var status = 5;

        var retVal = service.getChartColorData(recordType, status);

        expect(retVal).toEqual(['', '']);
      });
    });
  });

  describe('getChartColor function ->', function () {
    var retVal;
    beforeEach(function () {
      retVal = ['first', 'second'];
      service.getChartColorData = jasmine.createSpy().and.returnValue(retVal);
    });

    it('should call getChartColorData and return result[0]', function () {
      var recordType = 'recordType';
      var status = 'status';

      var result = service.getChartColor(recordType, status);

      expect(service.getChartColorData).toHaveBeenCalledWith(
        recordType,
        status
      );
      expect(result).toEqual(retVal[0]);
    });
  });

  describe('getChartClass function ->', function () {
    var retVal;
    beforeEach(function () {
      retVal = ['first', 'second'];
      service.getChartColorData = jasmine.createSpy().and.returnValue(retVal);
    });

    it('should call getChartColorData and return result[0]', function () {
      var recordType = 'recordType';
      var status = 'status';

      var result = service.getChartClass(recordType, status);

      expect(service.getChartColorData).toHaveBeenCalledWith(
        recordType,
        status
      );
      expect(result).toEqual(retVal[1]);
    });
  });
});
