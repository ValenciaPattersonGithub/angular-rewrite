(function () {
  angular.module('Soar.Patient').service('ChartColors', function () {
    var service = this;
    var chartColorData = {
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

    service.getChartColorData = function (recordType, status) {
      var data;
      if (recordType === 'Condition') {
        data = chartColorData.conditions[status];
      } else if (recordType === 'ServiceTransaction') {
        data = chartColorData.services[status];
      }

      return _.isNil(data) ? ['', ''] : data;
    };

    service.getChartColor = function (recordType, status) {
      return service.getChartColorData(recordType, status)[0];
    };

    service.getChartClass = function (recordType, status) {
      return service.getChartColorData(recordType, status)[1];
    };
  });
})();
