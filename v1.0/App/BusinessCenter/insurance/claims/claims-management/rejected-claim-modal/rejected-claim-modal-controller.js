'use strict';
angular
  .module('Soar.BusinessCenter')
  .controller('RejectedClaimModalController', [
    '$scope',
    '$location',
    '$uibModalInstance',
    'toastrFactory',
    'localize',
    'claim',
    'rejectionMessageDto',
    function (
      $scope,
      $location,
      $uibModalInstance,
      toastrFactory,
      localize,
      claim,
      rejectionMessageDto
    ) {
      var ctrl = this;
      //$scope.claimId =
      $scope.claim = claim;
      $scope.rejectionMessageDto = rejectionMessageDto;

      $scope.getPatientName = function (first, middle, last, suffix) {
        var name = [];
        if (first) {
          name.push(first);
        }
        if (middle) {
          name.push(middle + '.');
        }
        if (last && !suffix) {
          name.push(last);
        }
        if (last && suffix) {
          name.push(last + ',');
        }
        if (suffix) {
          name.push(suffix);
        }
        return name.join(' ');
      };

      $scope.getDate = function (start, end) {
        var date = '';
        if (start && end) {
          var startDate = new Date(start);
          var endDate = new Date(end);
          if (
            moment(startDate).format('MM/DD/YYYY') ===
            moment(endDate).format('MM/DD/YYYY')
          ) {
            date = moment(startDate).format('MM/DD/YYYY');
          } else {
            date =
              moment(startDate).format('MM/DD/YYYY') +
              ' - ' +
              moment(endDate).format('MM/DD/YYYY');
          }
        }
        return date;
      };

      $scope.cancel = function () {
        $('body').removeClass('modal-open');
        $uibModalInstance.dismiss();
      };
    },
  ]);
