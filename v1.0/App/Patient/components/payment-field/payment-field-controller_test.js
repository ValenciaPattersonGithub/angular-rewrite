describe('Controller: PaymentFieldController', function () {
  var ctrl, scope, listHelper;
  var q, data, widget, element;

  function setPaymentObject() {
    return {
      CreditTransactionId: '00000000-0000-0000-0000-000000000000',
      // current location id
      LocationId: 1,
      // This should have some valid account id, If not payment will not get added.
      AccountId: '345be8ca-0dc7-4817-a8ee-85b8d30f87e6',
      AdjustmentTypeId: null,
      Amount: 0.0,
      ClaimId: null,
      DateCompleted: null,
      DateEntered: new Date(),
      Description: null,
      // PromptTitle property is used at client side only
      PromptTitle: null,
      PaymentTypeDescription: '',
      // user's patientid
      EnteredByUserId: '00000000-0000-0000-0000-000000000000',
      Note: null,
      PaymentTypeId: null,
      // Allowed transaction type id's are 2 - Account Payment, 3 - Insurance Payment, 4 - Credit Adjustment.
      TransactionTypeId: 2,
      CreditTransactionDetail: {
        CreditTransactionDetailId: '00000000-0000-0000-0000-000000000000',
        // user's account member id
        AccountMemberId: 'b8134d77-bade-4833-9b72-f482a29519c2',
        Amount: 0,
        AppliedToServiceTransationId: '00000000-0000-0000-0000-000000000000',
        CreditTransactionId: '00000000-0000-0000-0000-000000000000',
        DateEntered: new Date(),
        EncounterId: '7e263217-5353-4c6b-bc88-76cabadd6a62',
        ProviderUserId: '00000000-0000-0000-0000-000000000000',
      },
    };
  }
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller, $q) {
    scope = $rootScope.$new();
    q = $q;

    //mock for listHelper service
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(0),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0),
    };
    data = {
      value: jasmine.createSpy().and.returnValue(1),
      text: jasmine.createSpy().and.returnValue('a'),
      select: jasmine.createSpy(),
      focus: jasmine.createSpy(),
    };
    element = {
      data: jasmine.createSpy().and.returnValue(data),
    };
    spyOn(angular, 'element').and.returnValue(element);

    ctrl = $controller('PaymentFieldController', {
      $scope: scope,
      ListHelper: listHelper,
    });
  }));

  //controller
  it('PaymentFieldController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  describe('ctrl.setPaymentDescription ->', function () {
    it('should hide CheckNumber prompt for payment', function () {
      scope.payment = setPaymentObject();

      ctrl.setPaymentDescription(null);
      expect(scope.hidePrompt).toBe(true);
      expect(scope.payment.PromptTitle).toBe(null);
    });

    it('should show CheckNumber prompt for payment', function () {
      scope.payment = setPaymentObject();
      var paymentTypePromptValue = '#123';

      ctrl.setPaymentDescription(paymentTypePromptValue);
      expect(scope.hidePrompt).toBe(false);
      expect(scope.payment.PromptTitle).toBe(paymentTypePromptValue);
    });
  });

  describe('On kendoWidgetCreated event ->', function () {
    it('should call width function on widget list when ns is available and indexOf returns 1', function () {
      data = {
        indexOf: jasmine.createSpy('indexOf').and.returnValue(1),
      };

      // widget mock
      widget = {
        element: {
          attr: jasmine.createSpy('attr').and.returnValue(data),
        },
        list: {
          width: jasmine.createSpy('width').and.returnValue(1),
        },
        ns: '.kendoComboBox',
      };

      scope.$emit('kendoWidgetCreated', widget);
      expect(widget.list.width).toHaveBeenCalledWith(200);
    });

    it('should call width function on widget list when ns is empty and indexOf returns -1', function () {
      data = {
        indexOf: jasmine.createSpy('indexOf').and.returnValue(-1),
      };

      // widget mock
      widget = {
        element: {
          attr: jasmine.createSpy('attr').and.returnValue(data),
        },
        list: {
          width: jasmine.createSpy('width').and.returnValue(1),
        },
        ns: '',
      };

      scope.$emit('kendoWidgetCreated', widget);
      expect(widget.list.width).not.toHaveBeenCalled();
    });
  });

  describe('paymentTypeOnChange function ->', function () {
    beforeEach(inject(function () {
      scope.paymentTypes = [
        { Description: 'one', PaymentTypeId: 1, Prompt: '#1' },
        { Description: 'two', PaymentTypeId: 2, Prompt: '#2' },
      ];

      scope.payment = scope.payment = setPaymentObject();
    }));

    it('should show prompt input area and set Description to proper value', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.paymentTypes[1]);
      scope.paymentTypeOnChange();
      expect(scope.hidePrompt).toBe(false);
      expect(scope.payment.PromptTitle).toBe(scope.paymentTypes[1].Prompt);
    });

    it('should not call setPaymentDescription when payment type description does not exists in the payment type list', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);
      spyOn(ctrl, 'setPaymentDescription');
      scope.paymentTypeOnChange();
      expect(ctrl.setPaymentDescription).not.toHaveBeenCalled();
    });
  });

  describe('paymentTypeOnBlur function ->', function () {
    beforeEach(inject(function () {
      scope.paymentTypes = [
        { Description: 'one', PaymentTypeId: 1, Prompt: '#1' },
        { Description: 'two', PaymentTypeId: 2, Prompt: '#2' },
      ];

      scope.payment = scope.payment = setPaymentObject();
    }));

    it('should hide prompt input area and set Description to null', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);
      scope.paymentTypeOnBlur();
      expect(scope.hidePrompt).toBe(true);
      expect(scope.payment.PromptTitle).toBe(null);
    });

    it('should show prompt input area and set Description to proper value', function () {
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(scope.paymentTypes[1]);
      scope.paymentTypeOnBlur();
      expect(scope.hidePrompt).toBe(false);
      expect(scope.payment.PromptTitle).toBe(scope.paymentTypes[1].Prompt);
    });
  });
});
