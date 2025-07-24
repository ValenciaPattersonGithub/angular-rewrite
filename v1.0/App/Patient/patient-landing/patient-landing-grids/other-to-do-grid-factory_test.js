describe('other-to-do-grid-factory ->', function () {
  var factory;

  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($injector) {
    factory = $injector.get('OtherToDoGridFactory');
  }));

  // inject the factory
  beforeEach(inject(function ($injector) {
    factory.gridOptionsFactory = $injector.get('GridOptionsFactory');
  }));

  describe('initial values ->', function () {
    it('factory should exist', function () {
      expect(factory).not.toBeUndefined();
      expect(factory).not.toBeNull();
    });

    it('GridOptionsFactory should exist', function () {
      expect(factory.gridOptionsFactory).not.toBeUndefined();
      expect(factory.gridOptionsFactory).not.toBeNull();
    });
  });

  //TODO test the Other To Do Grid columns
});
