'use strict';
angular.module('Soar.Patient').controller('PaymentFieldController', [
  '$scope',
  'localize',
  'ListHelper',
  function ($scope, localize, listHelper) {
    var ctrl = this;
    $scope.hidePrompt = true;

    // Toggle prompt field input depending on passed value
    ctrl.setPaymentDescription = function (paymentTypePromptValue) {
      if (paymentTypePromptValue == null || paymentTypePromptValue == '') {
        $scope.hidePrompt = true;
        $scope.payment.PromptTitle = null;
        $scope.payment.PaymentTypePromptValue = '';
      } else {
        $scope.hidePrompt = false;
        $scope.payment.PromptTitle = paymentTypePromptValue;
        $scope.payment.PaymentTypePromptValue = '';
      }
    };

    // Returns object of Payment Types Combobox
    ctrl.getPaymentTypesCombobox = function () {
      var elem = angular.element('#lstPaymentType');
      return elem.data('kendoComboBox');
    };

    // adjust result-list width as per requirement
    $scope.$on('kendoWidgetCreated', function (event, widget) {
      var element = widget.element;

      if (
        widget.ns == '.kendoComboBox' &&
        element.attr('id').indexOf('lstPaymentType') > -1
      ) {
        widget.list.width(200);
      }
    });

    //Blur event handler for payment type input field
    $scope.paymentTypeOnBlur = function () {
      var comboBox = ctrl.getPaymentTypesCombobox();
      // Find item by its display text as find by id will not provide proper results if user inputs guid ids.
      var item = listHelper.findItemByFieldValue(
        $scope.paymentTypes,
        'Description',
        comboBox.text()
      );
      if (item == null) {
        // Clear the display value in combobox and its corresponding id
        $scope.payment.PaymentTypeId = null;
        $scope.payment.PaymentTypeDescription = '';
        ctrl.setPaymentDescription(null);
      } else {
        ctrl.setPaymentDescription(item.Prompt);
        $scope.payment.PaymentTypeDescription = item.Description;
      }
    };

    //Change event handler for payment type input field
    $scope.paymentTypeOnChange = function () {
      var comboBox = ctrl.getPaymentTypesCombobox();
      // Find item by its display text as find by id will not provide proper results if user inputs guid ids.
      var item = listHelper.findItemByFieldValue(
        $scope.paymentTypes,
        'Description',
        comboBox.text()
      );
      if (item != null) {
        ctrl.setPaymentDescription(item.Prompt);
        $scope.payment.PaymentTypeDescription = item.Description;
      }
    };
  },
]);
