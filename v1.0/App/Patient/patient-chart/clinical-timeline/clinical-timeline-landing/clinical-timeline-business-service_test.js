describe('clinical-timeline-business-service ->', function () {
  var clinicalTimelineBusinessService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.services'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($injector) {
    clinicalTimelineBusinessService = $injector.get(
      'ClinicalTimelineBusinessService'
    );
  }));

  describe('initialization ->', function () {
    it('should exist', function () {
      expect(clinicalTimelineBusinessService).not.toBeNull();
    });
  });

  describe('setIsDeleted ->', function () {
    it('should ignore ServiceTransactions', function () {
      var timelineRecord = {
        StartTime: '2019-02-11 10:00:000',
        Status: 1,
        IsDeleted: true,
        ServiceTransactionId: '2222',
      };

      clinicalTimelineBusinessService.setIsDeleted(
        timelineRecord,
        'ServiceTransaction'
      );

      expect(timelineRecord.IsDeleted).toBe(true);
    });

    it('should not ignore non ServiceTransactions', function () {
      var timelineRecord = {
        StartTime: '2019-02-11 10:00:000',
        Status: 1,
        IsDeleted: true,
        ServiceTransactionId: '2222',
      };

      clinicalTimelineBusinessService.setIsDeleted(
        timelineRecord,
        'NonServiceTransaction'
      );

      expect(timelineRecord.IsDeleted).toBe(false);
    });
  });
});
