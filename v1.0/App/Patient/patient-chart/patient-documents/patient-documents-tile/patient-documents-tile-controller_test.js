describe('PatientDocumentsTileController tests ->', function () {
  var scope, documentsLoadingService, formsDocumentsFactory, ctrl;

  var patientDocumentMock = {
    $$subGroup: 'My Document',
    DocumentId: 123456,
    $$DocumentGroup: 'Treatment Plans',
    PatientId: '1',
    recordType: 'Clinical',
    record: { Name: 'My Document' },
  };

  beforeEach(module('Soar.Patient'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      //formsDocumentsFactory
      documentsLoadingService = {
        executeDownload: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('DocumentsLoadingService', documentsLoadingService);

      //formsDocumentsFactory
      formsDocumentsFactory = {
        UpdateRecentDocuments: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('FormsDocumentsFactory', formsDocumentsFactory);
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    scope.patientDocument = patientDocumentMock;
    ctrl = $controller('PatientDocumentsTileController', {
      $scope: scope,
    });

    spyOn(ctrl, 'setDocumentTitle').and.callFake(function () {});
  }));

  describe('scope.Download function -> ', function () {
    beforeEach(function () {
      scope.hasClinicalDocumentsAddAccess = true;
      scope.patientDocument = patientDocumentMock;
      spyOn(ctrl, 'updateRecentDocuments');
    });

    it('should call documentsLoadingService.executeDownload', function () {
      scope.Download(scope.patientDocument);
      expect(documentsLoadingService.executeDownload).toHaveBeenCalled();
    });

    it('should call ctrl.updateRecentDocuments with scope.patientDocument', function () {
      scope.Download(scope.patientDocument);
      expect(ctrl.updateRecentDocuments).toHaveBeenCalledWith(
        scope.patientDocument
      );
    });
  });

  describe('ctrl.updateRecentDocuments function -> ', function () {
    beforeEach(function () {
      scope.hasClinicalDocumentsAddAccess = true;
      scope.patientDocument = patientDocumentMock;
    });

    it('should call formsDocumentsFactory.UpdateRecentDocuments with scope.patientDocument', function () {
      ctrl.updateRecentDocuments(scope.patientDocument);
      expect(formsDocumentsFactory.UpdateRecentDocuments).toHaveBeenCalledWith(
        scope.patientDocument
      );
    });
  });
});
