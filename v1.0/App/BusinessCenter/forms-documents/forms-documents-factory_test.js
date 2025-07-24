describe('FormsDocumentsFactory tests ->', function () {
  var toastrFactory, factory, patientServices, recentDocumentsService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      recentDocumentsService = {
        update: jasmine
          .createSpy()
          .and.returnValue({ $promise: { then: jasmine.createSpy() } }),
      };
      $provide.value('RecentDocumentsService', recentDocumentsService);

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

  beforeEach(inject(function ($injector, $q) {
    factory = $injector.get('FormsDocumentsFactory');
  }));

  describe('UpdateRecentDocuments function -> ', function () {
    var documents = [];
    beforeEach(function () {
      documents = [
        { DocumentId: 1 },
        { DocumentId: 3 },
        { DocumentId: 6 },
        { DocumentId: 8 },
      ];
    });

    it('should call recentDocumentsService.update with a list of documentIds', function () {
      factory.UpdateRecentDocuments(documents);
      expect(recentDocumentsService.update).toHaveBeenCalledWith(
        Object({ returnList: true }),
        [1, 3, 6, 8]
      );
    });

    it('should call recentDocumentsService.update with a list of unique documentIds, removing any duplicates', function () {
      documents = [
        { DocumentId: 1 },
        { DocumentId: 3 },
        { DocumentId: 6 },
        { DocumentId: 8 },
        { DocumentId: 8 },
        { DocumentId: 8 },
      ];
      factory.UpdateRecentDocuments(documents);
      expect(recentDocumentsService.update).toHaveBeenCalledWith(
        { returnList: true },
        [1, 3, 6, 8]
      );
    });
  });
});
