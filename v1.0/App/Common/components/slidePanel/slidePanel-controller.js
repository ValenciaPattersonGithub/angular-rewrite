'use strict';

angular.module('common.controllers').controller('SlidePanelController', [
  '$scope',
  '$filter',
  function ($scope, $filter) {
    var ctrl = this;

    $('#sp-open').on('click', function () {
      $('.slidePanel').addClass('open');
    });

    $('#sp-close').on('click', function () {
      $('.slidePanel').removeClass('open');
    });
  },
]);
