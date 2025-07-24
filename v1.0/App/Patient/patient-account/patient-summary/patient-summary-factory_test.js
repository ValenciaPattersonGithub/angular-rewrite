describe('patient-summary-factory ->', function () {
  var factory;
  var modalFactory;

  beforeEach(
    module('Soar.Common', function ($provide) {
      modalFactory = {
        ConfirmModal: jasmine
          .createSpy('modalFactory.ConfirmModal')
          .and.returnValue({
            then: function (callback) {
              callback();
            },
          }),
      };
      $provide.value('ModalFactory', modalFactory);
    })
  );

  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($injector) {
    factory = $injector.get('PatientSummaryFactory');
  }));

  describe('initialization -> ', function () {
    it('should exist', function () {
      expect(factory).toBeDefined();
      expect(factory.changeCheckoutEncounterLocation).toBeDefined();
      expect(factory.canCheckoutAllEncounters).toBeDefined();
    });
  });

  describe('changeCheckoutEncounterLocation -> ', function () {
    it('should call modal factory if overriding location', function () {
      factory.changeCheckoutEncounterLocation({
        overrideLocation: true,
      });
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });
  });

  describe('canCheckoutAllEncounters  -> ', function () {
    it('should return true if empty list', function () {
      var result = factory.canCheckoutAllEncounters([]);
      expect(result).toEqual(true);
    });
    it('should return false if one of the rows is multi location', function () {
      var result = factory.canCheckoutAllEncounters([
        {
          EncounterServiceLocationIds: [1, 2],
          $$authorizedForEditOrCheckoutAtLocation: true,
        },
        {
          EncounterServiceLocationIds: [1],
          $$authorizedForEditOrCheckoutAtLocation: true,
        },
      ]);
      expect(result).toEqual(false);
    });
    it("should return false if one of the rows is doesn't match the others", function () {
      var result = factory.canCheckoutAllEncounters([
        {
          EncounterServiceLocationIds: [1],
          $$authorizedForEditOrCheckoutAtLocation: true,
        },
        {
          EncounterServiceLocationIds: [1],
          $$authorizedForEditOrCheckoutAtLocation: true,
        },
        {
          EncounterServiceLocationIds: [2],
          $$authorizedForEditOrCheckoutAtLocation: true,
        },
      ]);
      expect(result).toEqual(false);
    });
    it("should return false if one of the rows isn't authorized", function () {
      var result = factory.canCheckoutAllEncounters([
        {
          EncounterServiceLocationIds: [1],
          $$authorizedForEditOrCheckoutAtLocation: true,
        },
        {
          EncounterServiceLocationIds: [1],
          $$authorizedForEditOrCheckoutAtLocation: false,
        },
        {
          EncounterServiceLocationIds: [1],
          $$authorizedForEditOrCheckoutAtLocation: true,
        },
      ]);
      expect(result).toEqual(false);
    });
  });
});
