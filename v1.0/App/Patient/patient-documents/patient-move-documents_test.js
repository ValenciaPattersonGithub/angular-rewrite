describe('Controller: MoveDocumentsController', function () {
  var ctrl, scope, location, localize, patientServices, toastrFactory;
  var sce,
    http,
    window,
    routeParams,
    timeout,
    patientDocumentsFactory,
    modalFactory,
    q,
    rootScope;
  var resource,
    patientLogic,
    personFactory,
    patientValidationFactory,
    locationService,
    uibModal,
    modalInstance,
    patientData,
    documents;

  var mockDocuments = [
    {
      FileAllocationId: 198741,
      DateUploaded: '2019-02-11T13:53:13.7632103',
      DocumentGroupId: 10,
      DocumentId: 198749,
      MimeType: 'Digital',
      Name: 'Medical History',
      OriginalFileName: 'Medical History',
      ParentId: 'f49229a6-919d-4f9a-828f-a4cd789163b0',
      ParentType: 'Patient',
      UploadedByUserId: 'c252df59-9604-4ebf-95b1-f1ca2095d241',
      NumberOfBytes: 1,
      ToothNumbers: null,
      Description: null,
      DataTag: 'AAAAAADiz7s=',
      UserModified: 'c252df59-9604-4ebf-95b1-f1ca2095d241',
      DateModified: '2019-02-11T13:53:13.7632103',
      $$FormattedDate: '02/11/2019',
      $$DocumentGroup: 'Medical History',
      selected: false,
    },
    {
      FileAllocationId: 198742,
      DateUploaded: '2019-02-11T13:53:13.7632103',
      DocumentGroupId: 10,
      DocumentId: 198749,
      MimeType: 'Digital',
      Name: 'America',
      OriginalFileName: 'Medical History',
      ParentId: 'f49229a6-919d-4f9a-828f-a4cd789163b0',
      ParentType: 'Patient',
      UploadedByUserId: 'c252df59-9604-4ebf-95b1-f1ca2095d241',
      NumberOfBytes: 1,
      ToothNumbers: null,
      Description: null,
      DataTag: 'AAAAAADiz7s=',
      UserModified: 'c252df59-9604-4ebf-95b1-f1ca2095d241',
      DateModified: '2019-02-11T13:53:13.7632103',
      $$FormattedDate: '02/11/2019',
      $$DocumentGroup: 'Medical History',
      selected: false,
    },
    {
      FileAllocationId: 198743,
      DateUploaded: '2019-09-11T13:53:13.7632103',
      DocumentGroupId: 11,
      DocumentId: 198749,
      MimeType: 'Static',
      Name: 'Xerox',
      OriginalFileName: 'Social History',
      ParentId: 'f49229a6-919d-4f9a-828f-a4cd789163b0',
      ParentType: 'Patient',
      UploadedByUserId: 'c252df59-9604-4ebf-95b1-f1ca2095d241',
      NumberOfBytes: 1,
      ToothNumbers: null,
      Description: null,
      DataTag: 'AAAAAADiz7s=',
      UserModified: 'c252df59-9604-4ebf-95b1-f1ca2095d241',
      DateModified: '2019-0-11T13:53:13.7632103',
      $$FormattedDate: '09/12/2019',
      $$DocumentGroup: 'Social History',
      selected: false,
    },
  ];
  //  beforeEach(module('Soar.Patient'));
  beforeEach(
    module('Soar.Patient', function ($provide) {
      modalInstance = {
        close: jasmine.createSpy(),
        dismiss: jasmine.createSpy(),
      };

      $provide.value('ModalInstance', modalInstance);
      $provide.value('PatientDocumentsFactory', {});
      $provide.value('PatientLogic', {});
      $provide.value('PersonFactory', {});
      $provide.value('PatientValidationFactory', {});
    })
  );

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    // Don't bother injecting a 'real' modal
    scope = $rootScope.$new();

    ctrl = $controller('MoveDocumentsController', {
      $scope: scope,
      $uibModalInstance: modalInstance,
      documents: function () {
        return ['a', 'b', 'c'];
      },
      patientData: { hell: 12344 },
    });
  }));
  // Move Documents modal test methods
  describe('scope.toggleSelect method', function () {
    beforeEach(function () {
      scope.Selected = {
        all: false,
      };
      scope.documents = mockDocuments;
    });

    it('select all', function () {
      scope.toggleSelect(true);
      expect(scope.documents[2].selected).toBe(true);
    });

    it('deselect all', function () {
      scope.documents[2].selected = true;
      scope.toggleSelect(false);
      expect(scope.documents[2].selected).toBe(false);
    });

    //single row select
    it('single row select', function () {
      var id = 198743;
      var select = true;
      scope.toggleSelect(select, id);
      expect(scope.documents[2].selected).toBe(true);
    });

    it('single row deselect', function () {
      scope.documents[2].selected = true;
      var id = 198743;
      var select = false;
      scope.toggleSelect(select, id);
      expect(scope.documents[2].selected).toBe(false);
    });
  });
});
