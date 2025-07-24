describe('account-summary-factory-controller->', function () {
  var patientAccountFilterBarFactory, newStatus;

  beforeEach(module('Soar.Patient', function ($provide) {}));

  beforeEach(inject(function ($injector) {
    patientAccountFilterBarFactory = $injector.get(
      'PatientAccountFilterBarFactory'
    );
    this.observerFunction = function (status) {
      newStatus = status;
    };
  }));

  describe('initial values -> ', function () {
    it('factory should exist and have methods available', function () {
      expect(patientAccountFilterBarFactory).not.toBe(undefined);
    });
  });

  describe('setFilterBarStatus function -> ', function () {
    it('should set the newStatus to false', function () {
      newStatus = undefined;
      patientAccountFilterBarFactory.observeFilterBarStatus(
        this.observerFunction
      );
      patientAccountFilterBarFactory.setFilterBarStatus(false);

      expect(newStatus).toBe(false);
    });

    it('should set the newStatus to true', function () {
      newStatus = undefined;
      patientAccountFilterBarFactory.observeFilterBarStatus(
        this.observerFunction
      );
      patientAccountFilterBarFactory.setFilterBarStatus(true);

      expect(newStatus).toBe(true);
    });

    it('should NOT set the newStatus when no observer is registered', function () {
      newStatus = undefined;
      patientAccountFilterBarFactory.setFilterBarStatus(true);

      expect(newStatus).toBe(undefined);
    });

    it('should set factory.obseervers to [] when resetFilterBarObservers is called', function () {
      patientAccountFilterBarFactory.observeFilterBarStatus(
        this.observerFunction
      );
      var currentObservers = patientAccountFilterBarFactory.getObserversList();
      expect(currentObservers.length).toBe(1);
      patientAccountFilterBarFactory.resetFilterBarObservers();

      patientAccountFilterBarFactory.setFilterBarStatus(true);
      currentObservers = patientAccountFilterBarFactory.getObserversList();
      expect(currentObservers.length).toBe(0);
    });
  });

  describe('resetFilterBarObservers function -> ', function () {
    it('should set factory.observers to empty list', function () {
      patientAccountFilterBarFactory.observeFilterBarStatus(
        this.observerFunction
      );
      var currentObservers = patientAccountFilterBarFactory.getObserversList();
      expect(currentObservers.length).toBe(1);
      patientAccountFilterBarFactory.resetFilterBarObservers();

      currentObservers = patientAccountFilterBarFactory.getObserversList();
      expect(currentObservers.length).toBe(0);
    });
  });

  describe('getObserversList function -> ', function () {
    it('should return current observers', function () {
      patientAccountFilterBarFactory.observeFilterBarStatus(
        this.observerFunction
      );
      var currentObservers = patientAccountFilterBarFactory.getObserversList();
      expect(currentObservers[0]).toBe(this.observerFunction);
    });
    it('should return an empty list', function () {
      var currentObservers = patientAccountFilterBarFactory.getObserversList();
      expect(currentObservers.length).toBe(0);
    });
  });
});
