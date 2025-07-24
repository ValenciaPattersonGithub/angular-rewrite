'use strict';

angular.module('common.controllers').controller('SchedulerSlideoutContoller', [
  '$scope',
  function ($scope) {
    var ctrl = this;

    $('#sp-open').on('click', function () {
      $('.slidePanel').addClass('open');
    });

    $('#sp-close').on('click', function () {
      $('.slidePanel').removeClass('open');
    });
  },
]);
