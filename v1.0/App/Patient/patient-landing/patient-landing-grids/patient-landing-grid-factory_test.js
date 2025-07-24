describe('patient-landing-grid-factory ->', function () {
  var factory;

  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($injector) {
    factory = $injector.get('PatientLandingGridFactory');
  }));

  describe('initial values ->', function () {
    it('factory should exist', function () {
      expect(factory).not.toBeUndefined();
      expect(factory).not.toBeNull();
    });

    it('AllPatientsGridFactory should exist', function () {
      expect(factory.allPatientsGridFactory).not.toBeUndefined();
      expect(factory.allPatientsGridFactory).not.toBeNull();
    });

    it('PreventiveCareGridFactory should exist', function () {
      expect(factory.preventiveCareGridFactory).not.toBeUndefined();
      expect(factory.preventiveCareGridFactory).not.toBeNull();
    });

    it('TreatmentPlansGridFactory should exist', function () {
      expect(factory.treatmentPlansGridFactory).not.toBeUndefined();
      expect(factory.treatmentPlansGridFactory).not.toBeNull();
    });

    it('AppointmentsGridFactory should exist', function () {
      expect(factory.appointmentsGridFactory).not.toBeUndefined();
      expect(factory.appointmentsGridFactory).not.toBeNull();
    });

    it('OtherToDoGridFactory should exist', function () {
      expect(factory.otherToDoGridFactory).not.toBeUndefined();
      expect(factory.otherToDoGridFactory).not.toBeNull();
    });
  });
});
