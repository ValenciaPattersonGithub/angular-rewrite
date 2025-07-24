(function () {
  'use strict';

  angular
    .module('common.controllers')
    .controller('CardServiceDisabledController', cardServiceDisabledController);

  cardServiceDisabledController.$inject = [
    '$scope',
    '$uibModalInstance',
    'toastrFactory',
    'localize',
    'UserServices',
    'LocationName',
    'User',
  ];

  function cardServiceDisabledController(
    $scope,
    $uibModalInstance,
    toastrFactory,
    localize,
    userServices,
    locationName,
    user
  ) {
    $scope.title = localize.getLocalizedString('Warning');

    $scope.message1 = localize.getLocalizedString(
      'You are about to make a credit/debit card payment, but the integration with the credit card service is disabled for this location.'
    );
    $scope.message2 = localize.getLocalizedString(
      'If you continue, the credit/debit card will NOT be charged.'
    );
    $scope.message3 =
      localize.getLocalizedString(
        'If you want to charge the credit/debit card using the credit card integration service, you will need to enable the Credit Card integration from the Location: '
      ) +
      locationName +
      localize.getLocalizedString("'s edit page.");
    $scope.message4 = localize.getLocalizedString(
      'Do you want to continue with the payment?'
    );

    $scope.checkboxLabel = localize.getLocalizedString(
      'Do not show me this message again.'
    );
    $scope.doNotShowMessageAgain = false;

    $scope.button1Text = localize.getLocalizedString('Yes');
    $scope.button2Text = localize.getLocalizedString('No');

    $scope.button1Click = function () {
      if (user.ShowCardServiceDisabledMessage && $scope.doNotShowMessageAgain) {
        user.ShowCardServiceDisabledMessage = false;

        userServices.Users.update(
          user,
          function () {
            toastrFactory.success(
              localize.getLocalizedString('Update user successful.'),
              localize.getLocalizedString('Success')
            );
          },
          function () {
            toastrFactory.error(
              localize.getLocalizedString('Update user failed.'),
              localize.getLocalizedString('Error')
            );
          }
        );
      }

      $uibModalInstance.close();
    };

    $scope.button2Click = function () {
      $uibModalInstance.dismiss();
    };
  }
})();
