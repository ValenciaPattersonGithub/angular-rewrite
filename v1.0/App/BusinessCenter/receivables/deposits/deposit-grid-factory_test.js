describe('deposit-grid-factory ->', function () {
  var factory;

  // #region Setup

  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($injector) {
    factory = $injector.get('DepositGridFactory');
  }));

  // #endregion

  // #region Tests

  it('should exist', function () {
    expect(factory).toBeDefined();
  });

  describe('getOptions function ->', function () {
    it('should contain Payee and Payment Type columns', function () {
      var results = factory.getOptions();

      var payeeColumn = _.find(
        results.expandableColumnDefinition[1].columnDefinition,
        { title: 'Payee' }
      );
      var paymentTypeColumn = _.find(
        results.expandableColumnDefinition[1].columnDefinition,
        { title: 'Payment Type' }
      );

      expect(payeeColumn).toBeDefined();
      expect(paymentTypeColumn).toBeDefined();
    });

    it('should escape Payee and Payment Type columns', function () {
      var results = factory.getOptions();

      var payeeColumn = _.find(
        results.expandableColumnDefinition[1].columnDefinition,
        { title: 'Payee' }
      );
      var paymentTypeColumn = _.find(
        results.expandableColumnDefinition[1].columnDefinition,
        { title: 'Payment Type' }
      );

      var payeeTest = payeeColumn.template[0]('<img />');
      var paymentTypeTest = paymentTypeColumn.template[0]('<img />');

      expect(payeeTest).toBe(_.escape('<img />'));
      expect(paymentTypeTest).toBe(_.escape('<img />'));
    });
  });

  //#endregion
});
