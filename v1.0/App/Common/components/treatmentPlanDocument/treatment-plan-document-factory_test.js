describe('TreatmentPlanDocumentFactory tests ->', function () {
  var toastrFactory, factory, patientServices;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServices = {
        ClinicalNotes: {
          get: jasmine.createSpy().and.returnValue({}),
          create: jasmine.createSpy().and.returnValue({}),
          update: jasmine.createSpy().and.returnValue({}),
        },
      };
      $provide.value('PatientServices', patientServices);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      $provide.value('TreatmentConsentService', {});
    })
  );

  beforeEach(inject(function ($injector) {
    factory = $injector.get('TreatmentPlanDocumentFactory');
  }));

  describe('createSnapshotObject function -> ', function () {
    var treatmentPlanSnapshotDto;

    beforeEach(function () {
      treatmentPlanSnapshotDto = {};
      treatmentPlanSnapshotDto.AdjustmentEstimated = 'adjustmentEstimated';
      treatmentPlanSnapshotDto.Charges = 'charges';
      treatmentPlanSnapshotDto.CreatedDate = 'createdDate';
      treatmentPlanSnapshotDto.LocationNameLine2 = 'locationNameLine2';
      treatmentPlanSnapshotDto.LocationAddressLine2 = 'locationAddressLine2';
      treatmentPlanSnapshotDto.PatientName = 'patientName';
      treatmentPlanSnapshotDto.LocationNameLine1 = 'locationNameLine1';
      treatmentPlanSnapshotDto.LocationAddressLine1 = 'locationAddressLine1';
      treatmentPlanSnapshotDto.InsuranceEstimated = 'insuranceEstimated';
      treatmentPlanSnapshotDto.Note = 'note';
      treatmentPlanSnapshotDto.PatientBalance = 'patientBalance';
      treatmentPlanSnapshotDto.Stages = 'stages';
      treatmentPlanSnapshotDto.IsRecommended = 'isRecommended';
      treatmentPlanSnapshotDto.ConsentText = 'consentText';
      treatmentPlanSnapshotDto.SignatureFileAllocationId =
        'signatureFileAllocationId';
      treatmentPlanSnapshotDto.Status = 'status';
      treatmentPlanSnapshotDto.TreatmentPlanName = 'treatmentPlanName';
      treatmentPlanSnapshotDto.SnapshotDate = 'snapshotDate';
      treatmentPlanSnapshotDto.HiddenSnapshotColumns = 'hiddenSnapshotColumns';
    });

    it('should create snapshotObject', function () {
      expect(factory.CreateSnapshotObject(treatmentPlanSnapshotDto)).toEqual({
        adjustedEstimateTotal: 'adjustmentEstimated',
        charges: 'charges',
        date: 'Invalid date',
        header: Object({
          PatientName: 'patientName',
          LocationName: 'locationNameLine1 locationNameLine2',
          LocationAddress:
            'locationAddressLine1 locationAddressLine2 undefined',
        }),
        insuranceEstimateTotal: 'insuranceEstimated',
        notes: 'note',
        patientBalance: 'patientBalance',
        planStages: 'stages',
        recommendedOption: 'isRecommended',
        signatureConsent: 'consentText',
        signatureFileAllocationId: 'signatureFileAllocationId',
        status: 'status',
        title: 'treatmentPlanName',
        snapshotDate: 'snapshotDate',
        HiddenSnapshotColumns: 'hiddenSnapshotColumns',
      });
    });
  });
});
