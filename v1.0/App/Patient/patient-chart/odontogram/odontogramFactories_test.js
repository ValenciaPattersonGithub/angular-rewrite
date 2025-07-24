describe('odontogramFactories ->', function () {
  describe('PatientOdontogramFactory ->', function () {
    var patientServices, toastrFactory, patientOdontogramFactory;

    //#region before each

    // beforeEach(module("Soar.Common"));
    // beforeEach(module("common.factories"));
    beforeEach(
      module('Soar.Patient', function ($provide) {
        patientServices = {};
        $provide.value('PatientServices', patientServices);

        toastrFactory = {};
        toastrFactory.error = jasmine.createSpy();
        toastrFactory.success = jasmine.createSpy();
        $provide.value('toastrFactory', toastrFactory);
      })
    );

    // inject the factory
    beforeEach(inject(function ($injector) {
      patientOdontogramFactory = $injector.get('PatientOdontogramFactory');
    }));

    //#endregion

    describe('setCloseToothOptions method -> ', function () {
      it('should set CloseToothOptions to false', function () {
        patientOdontogramFactory.setCloseToothOptions(false);
        expect(patientOdontogramFactory.CloseToothOptions).toEqual(false);
      });

      it('should set CloseToothOptions to true', function () {
        patientOdontogramFactory.setCloseToothOptions(true);
        expect(patientOdontogramFactory.CloseToothOptions).toEqual(true);
      });
    });
  });
});
