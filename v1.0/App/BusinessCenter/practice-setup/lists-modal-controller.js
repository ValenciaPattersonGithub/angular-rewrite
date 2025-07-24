'use strict';

angular.module('common.controllers').controller('ListsModalController', [
  '$scope',
  '$uibModalInstance',
  'title',
  'template',
  function (modalScope, mInstance, title, template) {
    modalScope.title = title;
    modalScope.template = template;

    modalScope.close = function () {
      mInstance.dismiss();
    };
  },
]);
