'use strict';

angular.module('Soar.Patient').controller('PatientSlideoutController', [
  '$scope',
  function ($scope) {
    angular.element('#patient-wrapper').toggleClass('toggled');

    $scope.$on('appliedFiltersCount', function (events, args) {
      $scope.appliedFiltersCount = args;
    });

    $scope.applyFilters = function () {
      $scope.appliedFilters = $('.prvntvCareFilters:checked');
      $scope.appliedFiltersCombined = $(
        '.prvntvCareFilters:checked, .prvntvCareFiltersEqual, .prvntvCareFiltersDateRange'
      );
      $scope.appliedFiltersText = $('.prvntvCareFiltersEqual');
      $scope.$emit('displayAppliedFilters', $scope.appliedFiltersCombined);
    };

    $scope.resetFilters = function () {
      $scope.$broadcast('resetSlideOutFilter', true);
      $scope.$emit(
        'resetFilters',
        $('.prvntvCareFilters:checked .prvntvCareFiltersEqual')
      );
    };

    $scope.collapsePanel = function () {
      $scope.$broadcast('collapseExpandPanel', true);
    };

    $('.expand-all').click(function () {
      var $this = $(this);
      if ($this.hasClass('expand-all')) {
        $this.text('Collapse All');
        $('.panel-collapse:not(".in")').collapse('show');
        $this.removeClass('expand-all');
      } else {
        $this.text('Expand All');
        $('.panel-collapse.in').collapse('hide');
        $this.addClass('expand-all');
      }
    });
  },
]);
