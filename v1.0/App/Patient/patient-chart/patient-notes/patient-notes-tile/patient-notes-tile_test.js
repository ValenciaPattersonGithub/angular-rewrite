describe('PatientNotesTileController ->', function () {
  var toastrFactory, scope, ctrl, patientServices, patientNotesFactory;
  var modalInstance, modalFactory, modalFactoryDeferred, q, timeout;

  //#region mocks
  var mockNoteTypes = [
    { Id: 1, Name: 'Account/Insurance' },
    { Id: 2, Name: 'Appointment' },
    { Id: 3, Name: 'Clinical' },
    { Id: 4, Name: 'General Patient Notes' },
  ];

  var mockStatusTypes = [
    { Id: 1, Name: 'Unmodified' },
    { Id: 2, Name: 'Modified' },
    { Id: 3, Name: 'Deleted' },
  ];

  var mockNote = {
    NoteId: '999',
    PatientId: 'a6993a42-6fc9-45c6-ad89-007db488a355',
    DateModified: new Date(),
    UserId: 'placeholder',
    Note: '<span style="color:#093;">amet porttitor massa iaculis.</span>',
    Id: null,
    ToothNumbers: null,
    IsActive: false,
    StatusTypeId: mockStatusTypes[0].Id,
  };

  var mockSavedNote = {
    NoteId: '999',
    PatientId: 'a6993a42-6fc9-45c6-ad89-007db488a355',
    DateModified: new Date(),
    UserId: 'placeholder',
    Note: '<span style="color:#093;">amet porttitor massa iaculis.</span>',
    Id: null,
    ToothNumbers: null,
    IsActive: false,
    StatusTypeId: mockStatusTypes[0].Id,
    DataTag: 'xxx',
  };

  var mockNoteResponse = {
    Value: mockSavedNote,
  };

  //#endregion

  //#region before each test

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServices = {
        ClinicalNotes: {
          create: jasmine.createSpy().and.returnValue({}),
          update: jasmine.createSpy().and.returnValue({}),
        },
      };
      $provide.value('PatientServices', patientServices);

      patientNotesFactory = {
        validateNote: jasmine.createSpy().and.returnValue(true),
        getNameAndDesignation: jasmine.createSpy().and.returnValue({}),
        setDataChanged: jasmine.createSpy().and.returnValue(true),
        setActiveNote: jasmine.createSpy().and.returnValue({}),
        setActiveNewNote: jasmine.createSpy().and.returnValue({}),
        setEditMode: jasmine.createSpy().and.returnValue({}),
        ActiveNote: jasmine.createSpy().and.returnValue({}),
        DataChanged: jasmine.createSpy().and.returnValue({}),
        EditMode: jasmine.createSpy().and.returnValue(true),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(mockNoteResponse),
        }),
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(mockNoteResponse),
        }),
        access: jasmine
          .createSpy()
          .and.returnValue({
            View: true,
            Create: true,
            Delete: true,
            Edit: true,
          }),
        observeNotes: jasmine.createSpy().and.returnValue({}),
        setPreviewNote: jasmine.createSpy(),
      };
      $provide.value('PatientNotesFactory', patientNotesFactory);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  // create controller and scope
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $route,
    $routeParams,
    $compile,
    $timeout,
    $location,
    _$uibModal_,
    $q
  ) {
    q = $q;
    timeout = $timeout;

    //mock for modalFactory
    modalFactory = {
      DeleteModal: jasmine
        .createSpy('modalFactory.DeleteModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    scope = $rootScope.$new();
    ctrl = $controller('PatientNotesTileController', {
      personId: 'a6993a42-6fc9-45c6-ad89-007db488a355',
      $scope: scope,
      note: mockNote,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      PatientNotesFactory: patientNotesFactory,
    });

    scope.onChange = jasmine.createSpy('onChange');
    scope.onCancel = jasmine.createSpy('onCancel');
  }));

  //#endregion

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(scope.tileExpanded).toBe(false);
      expect(scope.noteIsActive).toBe(false);
    });
  });

  describe('menuToggle method -> ', function () {
    it('should set ActionsVisible', function () {
      //TODO
    });

    it('should set orientV', function () {
      //TODO
    });
  });

  describe('editNote method -> ', function () {
    beforeEach(function () {
      ctrl.confirmCancelEditNote = jasmine.createSpy();
      patientNotesFactory.ActiveNote = null;
    });

    it('should call ctrl.confirmCancelEditNote if data is not changed', function () {
      patientNotesFactory.DataChanged = false;
      scope.editNote();
      timeout.flush();
      expect(ctrl.confirmCancelEditNote).toHaveBeenCalled();
      expect(modalFactory.CancelModal).not.toHaveBeenCalled();
    });

    it('should call ModalFactory.CancelModal if data is changed', function () {
      patientNotesFactory.DataChanged = true;
      scope.editNote();
      timeout.flush();
      expect(ctrl.confirmCancelEditNote).not.toHaveBeenCalled();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  describe('previewNote method -> ', function () {
    beforeEach(function () {
      ctrl.confirmCancelEditNote = jasmine.createSpy();
      patientNotesFactory.ActiveNote = null;
    });

    it('should call patientNotesFactory.setPreviewNote', function () {
      var event = { stopPropagation: jasmine.createSpy() };
      patientNotesFactory.DataChanged = false;
      scope.previewNote(event);
      expect(patientNotesFactory.setPreviewNote).toHaveBeenCalled();
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should set tileExpanded to false when it is true', function () {
      var event = { stopPropagation: jasmine.createSpy() };
      scope.tileExpanded = true;
      scope.previewNote(event);
      expect(scope.tileExpanded).toBe(false);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should set tileExpanded to true when it is false', function () {
      var event = { stopPropagation: jasmine.createSpy() };
      scope.tileExpanded = false;
      scope.previewNote(event);
      expect(scope.tileExpanded).toBe(true);
      expect(event.stopPropagation).toHaveBeenCalled();
    });
  });

  describe('checkTileExpand method -> ', function () {
    beforeEach(function () {
      ctrl.confirmCancelEditNote = jasmine.createSpy();
      patientNotesFactory.ActiveNote = null;
    });

    it('should call stopPropagation', function () {
      var event = { stopPropagation: jasmine.createSpy() };
      patientNotesFactory.DataChanged = false;
      scope.checkTileExpand(event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should return false when tileExpanded false', function () {
      var event = { stopPropagation: jasmine.createSpy() };
      scope.tileExpanded = false;
      var result = scope.checkTileExpand(event);
      expect(result).toBe(false);
      expect(patientNotesFactory.setPreviewNote).not.toHaveBeenCalled();
    });

    it('should return true when tileExpanded true', function () {
      var event = { stopPropagation: jasmine.createSpy() };
      scope.tileExpanded = true;
      var result = scope.checkTileExpand(event);
      expect(result).toBe(true);
      expect(patientNotesFactory.setPreviewNote).toHaveBeenCalled();
      expect(scope.tileExpanded).toBe(false);
    });
  });
});
