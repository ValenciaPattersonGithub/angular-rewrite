'use strict';

angular
  .module('common.controllers')
  .controller('AppointmentDeleteModalController', [
    '$scope',
    '$uibModalInstance',
    'item',
    'patSecurityService',
    'toastrFactory',
    function (modalScope, mInstance, item, patSecurityService, toastrFactory) {
      var ctrl = this;
      modalScope.item = item;

      modalScope.confirmDiscard = function () {
        mInstance.close();
      };

      modalScope.cancelDiscard = function () {
        mInstance.dismiss();
      };

      //#region Authorization
      // view access
      ctrl.authViewAccess = function () {
        return patSecurityService.IsAuthorizedByAbbreviation(
          modalScope.item.Amfa
        );
      };

      ctrl.authAccess = function () {
        if (!ctrl.authViewAccess()) {
          toastrFactory.error(
            patSecurityService.generateMessage(modalScope.item.Amfa),
            'Not Authorized'
          );
          event.preventDefault();
        } else {
          modalScope.hasViewAccess = true;
        }
      };

      // authorization
      ctrl.authAccess();
      // #endregion
    },
  ]);
