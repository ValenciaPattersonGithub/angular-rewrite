describe('PatientNotesCrudController ->', function () {
  var routeParams,
    toastrFactory,
    $uibModal,
    timeout,
    scope,
    $httpBackend,
    ctrl,
    element,
    compile,
    tabLauncher;
  var patientServices;
  var modalInstance, modalFactory, modalFactoryDeferred, q;
  var patientNotesFactory, noteTemplatesHttpService;
  var trueFalseSwitch = false;
    var discardChangesService;
  var richTextSanitizerService;

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
    NoteId: null,
    NoteTitle: '',
    PatientId: '',
    DateModified: new Date(),
    UserId: 'placeholder',
    Note: '<span style="color:#093;font-weight:bold;font-style:italic;text-decoration:underline;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque pharetra facilisis mollis. Cras varius mi et sapien suscipit semper. Phasellus nec nulla ornare, molestie lorem eu, dictum tortor. Mauris et feugiat lacus. Proin enim eros, placerat ut ex vel, posuere aliquam ex. Pellentesque rhoncus, neque at sagittis porta, diam dui scelerisque ligula, sit amet tincidunt massa libero ac metus. Suspendisse bibendum, turpis a sollicitudin auctor, purus risus finibus nisi, eu gravida tellus nibh nec felis. Sed et odio pretium, commodo leo ac, dignissim turpis. Pellentesque accumsan faucibus diam a porta. Vivamus gravida vel sem ut varius. Nam venenatis arcu quis iaculis lobortis. Donec vitae malesuada purus. In pellentesque interdum imperdiet. Vivamus efficitur risus eu ipsum finibus, sit amet porttitor massa iaculis.</span>',
    Id: null,
    ToothNumbers: null,
    StatusTypeId: mockStatusTypes[0].Id,
    NoteTypeId: 3,
  };

  var mockExistingNote = {
    NoteId: '134',
    NoteTitle: 'the Note',
    PatientId: '134',
    DateModified: new Date(),
    UserId: 'placeholder',
    Note: '<span style="color:#093;font-weight:bold;font-style:italic;text-decoration:underline;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque pharetra facilisis mollis. Cras varius mi et sapien suscipit semper. Phasellus nec nulla ornare, molestie lorem eu, dictum tortor. Mauris et feugiat lacus. Proin enim eros, placerat ut ex vel, posuere aliquam ex. Pellentesque rhoncus, neque at sagittis porta, diam dui scelerisque ligula, sit amet tincidunt massa libero ac metus. Suspendisse bibendum, turpis a sollicitudin auctor, purus risus finibus nisi, eu gravida tellus nibh nec felis. Sed et odio pretium, commodo leo ac, dignissim turpis. Pellentesque accumsan faucibus diam a porta. Vivamus gravida vel sem ut varius. Nam venenatis arcu quis iaculis lobortis. Donec vitae malesuada purus. In pellentesque interdum imperdiet. Vivamus efficitur risus eu ipsum finibus, sit amet porttitor massa iaculis.</span>',
    Id: mockNoteTypes[0].Id,
    ToothNumbers: '2,3,4',
    StatusTypeId: mockStatusTypes[0].Id,
    NoteTypeId: 3,
  };

  var mockExistingNoteResponse = {
    Value: mockExistingNote,
  };

  const mockTeethDefinitions =
      [
        {
          ToothId: 1,
          USNumber: '1',
          UniversalNumber: 18,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Third Molar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Right Third Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 2,
          USNumber: '2',
          UniversalNumber: 17,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Second Molar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Right Second Molar',
          DetailedSurfaceGroupId: 1,
        },
        {
          ToothId: 3,
          USNumber: '3',
          UniversalNumber: 16,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'First Molar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Right First Molar',
          DetailedSurfaceGroupId: 2,
        },
        {
          ToothId: 4,
          USNumber: '4',
          UniversalNumber: 15,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Second Premolar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Right Second Premolar',
          DetailedSurfaceGroupId: 4,
        },
        {
          ToothId: 5,
          USNumber: '5',
          UniversalNumber: 14,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'First Premolar',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Posterior',
          Description: 'Permanent Maxillary Right First Premolar',
          DetailedSurfaceGroupId: 4,
        },
        {
          ToothId: 6,
          USNumber: '6',
          UniversalNumber: 13,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Canine',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Permanent Maxillary Right Canine',
          DetailedSurfaceGroupId: 5,
        },
        {
          ToothId: 7,
          USNumber: '7',
          UniversalNumber: 12,
          ToothStructure: 'Permanent',
          ArchName: 'Maxillary',
          MouthSide: 'Right',
          ToothType: 'Lateral Incisor',
          QuadrantName: 'Upper Right',
          ArchPosition: 'Upper',
          ToothPosition: 'Anterior',
          Description: 'Permanent Maxillary Right Lateral Incisor',
          DetailedSurfaceGroupId: 5,
        }
      ];


  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      tabLauncher = {
        launchNewTab: jasmine.createSpy(),
      };

      discardChangesService = {
        currentChangeRegistration: {
          controller: 'PatientNotesCrudController',
          hasChanges: true,
        },
        onRegisterController: jasmine.createSpy(),
      };
      $provide.value('DiscardChangesService', discardChangesService);

      patientServices = {
        ClinicalNotes: {
          get: jasmine.createSpy().and.returnValue({}),
          create: jasmine.createSpy().and.returnValue({}),
          update: jasmine.createSpy().and.returnValue({}),
        },
      };
      $provide.value('PatientServices', patientServices);

        richTextSanitizerService = {
            sanitizeRichText: jasmine.createSpy().and.returnValue('sanitized')        
      };
      $provide.value('RichTextSanitizerService', richTextSanitizerService);

      var mockModalFactory = {
        CancelModal: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };

      noteTemplatesHttpService = {
        ActiveNoteTemplate: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('NoteTemplatesHttpService', noteTemplatesHttpService);

      patientNotesFactory = {
        validateNote: jasmine.createSpy().and.returnValue({}),
        getNameAndDesignation: jasmine.createSpy().and.returnValue({}),
        setDataChanged: jasmine.createSpy().and.returnValue({}),
        setActiveNote: jasmine.createSpy().and.returnValue({}),
        setActiveNewNote: jasmine.createSpy().and.returnValue({}),
        setEditMode: jasmine.createSpy().and.returnValue({}),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        getById: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        deleteNote: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        access: jasmine
          .createSpy()
          .and.returnValue({
            View: true,
            Create: true,
            Delete: true,
            Edit: true,
          }),
      };
      $provide.value('PatientNotesFactory', patientNotesFactory);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
    })
  );

  //#endregion

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
    compile = $compile;
    routeParams = $routeParams;

    $uibModal = _$uibModal_;
    spyOn($uibModal, 'open').and.callThrough();

    modalInstance = {
      close: jasmine.createSpy('modalInstance.close').and.returnValue({}),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    //mock for modalFactory
    modalFactory = {
      ConfirmLockModal: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
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

    ctrl = $controller('PatientNotesCrudController', {
      $scope: scope,
      note: mockNote,
      noteId: null,

      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      tabLauncher: tabLauncher,
      PatientNotesFactory: patientNotesFactory,
      personId: '134',
    });

    scope.onSave = jasmine.createSpy('onSave');
    scope.onCancel = jasmine.createSpy('onCancel');
    scope.confirmCancel = jasmine.createSpy('confirmCancel');
  }));

  describe('intitial setup -> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
    });

    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should set editableNote to false if note.NoteId is null', function () {
      scope.noteVm.NodeId = null;
      expect(ctrl).not.toBeNull();
    });

    it('should set editableNote to true if note.NoteId is not null', function () {
      scope.noteVm.NodeId = 20;
      expect(ctrl).not.toBeNull();
    });

    it('should set editmode to false if note.NoteId is null', function () {
      scope.noteVm.NodeId = null;
      expect(ctrl).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(scope.savingNote).toBe(false);
    });
  });

  describe('save -> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
    });

    it('should call patientNotesFactory.validateNote', function () {
      scope.editMode = true;
      ctrl.save();
      expect(patientNotesFactory.validateNote).toHaveBeenCalled();
    });

    it('should call not call patientNotesFactory.save if validNote is false', function () {
      ctrl.lockChecked = true;
      scope.noteVm.NoteId = null;
      scope.editMode = false;
      ctrl.save();
      expect(patientNotesFactory.save).toHaveBeenCalled();
    });

    it('should call patientNotesFactory.save if new note and validNote is true', function () {
      scope.editMode = true;
      scope.validNote = true;
      ctrl.lockChecked = true;
      expect(scope.savingNote).toBe(false);
      ctrl.save();
      expect(scope.savingNote).toBe(false);
      expect(patientNotesFactory.save).toHaveBeenCalled();
    });

    it('should call patientNotesFactory.save if existing note and validNote is true', function () {
      scope.editMode = true;
      ctrl.lockChecked = true;
      scope.validNote = true;
      expect(scope.savingNote).toBe(false);
      ctrl.save();
      expect(scope.savingNote).toBe(false);
      expect(patientNotesFactory.save).toHaveBeenCalled();
    });

    it('should call ctrl.mapVmToClinicalNote if existing note and validNote is true', function () {
      spyOn(ctrl, 'mapVmToClinicalNote');
      scope.editMode = true;
      ctrl.lockChecked = true;
      scope.validNote = true;
      ctrl.save();
      expect(ctrl.mapVmToClinicalNote).toHaveBeenCalledWith(
        ctrl.note,
        scope.noteVm
      );
    });

    it('should set note.PatientId to scope.personId if note.PatientId is null or undefined', function () {
      spyOn(ctrl, 'mapVmToClinicalNote');
      ctrl.note.PatientId = null;
      scope.personId = '12234';
      scope.editMode = false;
      ctrl.lockChecked = true;
      scope.validNote = true;
      ctrl.save();
      expect(ctrl.note.PatientId).toEqual(scope.personId);
    });
  });

  describe('cancel -> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
    });

    it('should call onCancel if there are no changes', function () {
      scope.cancel();
      expect(scope.onCancel).toHaveBeenCalled();
    });

    it('should not close modal if there are changes', function () {
      scope.noteVm.Id = 4;
      patientNotesFactory.DataChanged = true;
      scope.cancel();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
      expect(scope.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('confirmCancel method-> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
      ctrl.originalNote = angular.copy(mockExistingNote);
    });

    it('should call onCancel', function () {
      ctrl.confirmCancel();
      expect(scope.onCancel).toHaveBeenCalled();
      expect(scope.templateSelected).toBe(false);
    });

    it('should set scope.noteVm back to original state', function () {
      var originalNoteVm = angular.copy(scope.noteVm);
      scope.noteVm.Note = 'New Note';
      expect(scope.noteVm).not.toEqual(originalNoteVm);
      ctrl.confirmCancel();
      expect(scope.noteVm).toEqual(originalNoteVm);
    });
  });

  describe('assignedProviderChanged method-> ', function () {
    it('should assign noteVm.assignedProviderId to passed value', function () {
      scope.noteVm = { AssignedProviderId: 'test' };

      scope.assignedProviderChanged('newValue');

      expect(scope.noteVm.AssignedProviderId).toBe('newValue');
    });
  });

  describe('setEditMode method-> ', function () {
    it('should call patientNotesFactory.setEditMode', function () {
      scope.setEditMode();
      expect(scope.editMode).toBe(true);
      expect(patientNotesFactory.setEditMode).toHaveBeenCalledWith(true);
    });
  });

  describe('getNote method-> ', function () {
    it('should call patientNotesFactory.getById', function () {
      ctrl.getNote(1);
      expect(patientNotesFactory.getById).toHaveBeenCalled();
    });
  });

  describe('noteBackup method -> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
    });

    it('should set original note equal ctrl.note', function () {
      ctrl.noteBackup(ctrl.note);
      expect(ctrl.originalNote).toEqual(ctrl.note);
    });
  });

  describe('deleteNote method -> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
      spyOn(ctrl, 'mapVmToClinicalNote');
    });

    it('should set noteMarkedForDeletion to ctrl.note', function () {
      ctrl.noteMarkedForDeletion = {};
      scope.deleteNote(scope.noteVm);
      expect(ctrl.noteMarkedForDeletion).toEqual(ctrl.note);
    });

    it('should call patientNotesFactory.deleteNote', function () {
      ctrl.noteMarkedForDeletion = {};
      scope.deleteNote(scope.noteVm);
      expect(modalFactory.DeleteModal).toHaveBeenCalled();
    });

    it('should set ctrl.noteMarkedForDeletion to ctrl.note before calling save', function () {
      ctrl.noteMarkedForDeletion = {};
      scope.deleteNote(scope.noteVm);
      expect(ctrl.noteMarkedForDeletion).toEqual(ctrl.note);
    });

    it('should call ctrl.mapVmToClinicalNote with ctrl.note and noteVm to map noteVm back to ctrl.note before deleting', function () {
      ctrl.noteMarkedForDeletion = {};

      scope.deleteNote(scope.noteVm);
      expect(ctrl.mapVmToClinicalNote).toHaveBeenCalledWith(
        ctrl.note,
        scope.noteVm
      );
    });
  });

  describe('confirmDelete method -> ', function () {
    it('should patientNotesFactory.deleteNote', function () {
      ctrl.noteMarkedForDeletion = angular.copy(mockExistingNote);
      ctrl.confirmDelete();
      expect(patientNotesFactory.deleteNote).toHaveBeenCalled();
    });
  });

  var mockSelectedTemplate = {
    TemplateName: 'Template Mock',
    TemplateBody: 'Template Mock Body',
  };

  describe('checkLockAndSave method -> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
    });

    it('should set lockChecked to true if existing note and LockNotePriorTo24Hours', function () {
      scope.noteVm.LockNotePriorTo24Hours = true;
      scope.noteVm.AutomaticLockTime = null;
      scope.checkLockAndSave();
      expect(ctrl.lockChecked).toBe(true);
    });

    it('should call save if existing note', function () {
      spyOn(ctrl, 'save');
      scope.noteVm.LockNotePriorTo24Hours = true;
      scope.noteVm.AutomaticLockTime = null;
      scope.checkLockAndSave();
      expect(ctrl.save).toHaveBeenCalled();
    });

    it('should call modalFactory.ConfirmLockModal if new note', function () {
      scope.checkLockAndSave();
      expect(modalFactory.ConfirmLockModal).toHaveBeenCalled();
    });

    it('should call modalFactory.ConfirmLockModal if existing note and LockNotePriorTo24Hours false', function () {
      scope.noteVm.LockNotePriorTo24Hours = false;
      scope.checkLockAndSave();
      expect(modalFactory.ConfirmLockModal).toHaveBeenCalled();
    });

    it('should call save if existing note and LockNotePriorTo24Hours false and checkLockAndSave called with true', function () {
      spyOn(ctrl, 'save');
      scope.noteVm.LockNotePriorTo24Hours = false;
      scope.checkLockAndSave(true);
      expect(scope.noteVm.LockNotePriorTo24Hours).toBe(true);
      expect(ctrl.lockChecked).toBe(true);
      expect(ctrl.save).toHaveBeenCalled();
    });
  });

  describe('finalizeNote method -> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
    });

    it('should call set note.LockNotePriorTo24Hours', function () {
      spyOn(ctrl, 'save');
      ctrl.finalizeNote(true);
      expect(scope.noteVm.LockNotePriorTo24Hours).toBe(true);

      ctrl.finalizeNote(false);
      expect(scope.noteVm.LockNotePriorTo24Hours).toBe(false);
      expect(ctrl.lockChecked).toBe(true);
    });

    it('should call save', function () {
      spyOn(ctrl, 'save');
      ctrl.finalizeNote(true);
      expect(ctrl.save).toHaveBeenCalled();
    });
  });

  describe('cancelSave method -> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
    });

    it('should call set note.LockNotePriorTo24Hours', function () {
      ctrl.cancelSave();
      expect(scope.noteVm.LockNotePriorTo24Hours).toBe(false);
      expect(ctrl.lockChecked).toBe(false);
    });
  });
  describe('ctrl.registerControllerHasChanges method -> ', function () {
    it('should set discardChangesService.currentChangeRegistration', function () {
      ctrl.registerControllerHasChanges();
      expect(discardChangesService.currentChangeRegistration.hasChanges).toBe(
        true
      );
      expect(discardChangesService.currentChangeRegistration.controller).toBe(
        'PatientNotesCrudController'
      );
    });
  });

  describe('ctrl.registerController method -> ', function () {
    it('should call ', function () {
      ctrl.registerController();
      expect(discardChangesService.onRegisterController).toHaveBeenCalled();
    });
  });

  describe('noteVm watch -> ', function () {
    beforeEach(function () {
      scope.noteVm = { Note: 'Bob', NoteTitle: 'Bobs Note' };
      spyOn(ctrl, 'registerControllerHasChanges');
    });

    it('should call patientNotesFactory.setDataChanged when discardChangesService.currentChangeRegistration.hasChanges is false', function () {
      scope.noteVm = { Note: 'Bob', NoteTitle: 'Bobs Note' };
      scope.$apply();
      scope.noteVm = { Note: 'Bob, Carol', NoteTitle: 'Bobs Note' };
      scope.$apply();
      expect(ctrl.registerControllerHasChanges).toHaveBeenCalledWith();
    });
  });

  describe('discardChangesService.currentChangeRegistration watch -> ', function () {
    it('should call patientNotesFactory.setDataChanged when discardChangesService.currentChangeRegistration.hasChanges is false', function () {
      discardChangesService.currentChangeRegistration.hasChanges = true;
      scope.$apply();
      discardChangesService.currentChangeRegistration.hasChanges = false;
      scope.$apply();
      expect(patientNotesFactory.setDataChanged).toHaveBeenCalledWith(false);
    });
  });

  describe('on tooth-selection-applied event -> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
      ctrl.teethDefinitions = angular.copy(mockTeethDefinitions);
    });

    it('should call ctrl.registerControllerHasChanges', function () {
      spyOn(ctrl, 'registerControllerHasChanges');
      let toothSelection = [];
      toothSelection.push(ctrl.teethDefinitions[1]);

      scope.$emit('tooth-selection-save', toothSelection);
      expect(ctrl.registerControllerHasChanges).toHaveBeenCalled();
    });

    it('should set note ToothNumbers', function () {
      let toothSelection = [];
      let individualTeeth = [];
      toothSelection.push({ TeethOrQuadrant: '2' });
      individualTeeth.push(ctrl.teethDefinitions[1]);
      scope.$emit('tooth-selection-save', individualTeeth);
      expect(scope.noteVm.ToothNumbers[0]).toEqual(
        toothSelection[0].TeethOrQuadrant
      );
      expect(patientNotesFactory.setDataChanged).toHaveBeenCalledWith(true);
    });

    it('should update IndividualToothNumbers correctly', function () {
      let individualTeeth = [];
      individualTeeth.push(ctrl.teethDefinitions[1]);

      scope.$emit('tooth-selection-save', individualTeeth);

      expect(scope.noteVm.IndividualToothNumbers[0]).toEqual(individualTeeth[0].USNumber);
      expect(patientNotesFactory.setDataChanged).toHaveBeenCalledWith(true);
    });
  });

  describe('noteTemplatesHttpService.ActiveNoteTemplate watch -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'registerControllerHasChanges');
    });

    it('should call ctrl.registerControllerHasChanges if not null', function () {
      noteTemplatesHttpService.ActiveNoteTemplate(null);
      scope.$apply();
      noteTemplatesHttpService.ActiveNoteTemplate = { Note: 'Note' };
      scope.$apply();
      expect(ctrl.registerControllerHasChanges).toHaveBeenCalled();
    });

    it('should reset discardChangesService.currentChangeRegistration.hasChanges to false if null and note has not been modified', function () {
      ctrl.originalNote = { NoteTitle: '', Note: '' };
      scope.noteVm = { NoteTitle: '', Note: '' };
      noteTemplatesHttpService.ActiveNoteTemplate({ Note: 'Note' });
      scope.$apply();
      noteTemplatesHttpService.ActiveNoteTemplate = null;
      scope.$apply();
      expect(discardChangesService.currentChangeRegistration.hasChanges).toBe(
        false
      );
    });

    it('should not reset discardChangesService.currentChangeRegistration.hasChanges to false if null and note has been modified', function () {
      ctrl.originalNote = { NoteTitle: '', Note: '' };
      scope.noteVm = { NoteTitle: '', Note: 'new Note' };
      noteTemplatesHttpService.ActiveNoteTemplate({ Note: 'Note' });
      scope.$apply();
      noteTemplatesHttpService.ActiveNoteTemplate = null;
      scope.$apply();
      expect(discardChangesService.currentChangeRegistration.hasChanges).toBe(
        true
      );
    });
  });

  describe('getToothNumbers method -> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
      ctrl.teethDefinitions = angular.copy(mockTeethDefinitions);
    });

    it('should return ToothNumbers string', function () {
      var note = angular.copy(mockExistingNote);
      note.ToothNumbers = "2, 3, 4, 5";
      expect(scope.getToothNumbers(note)).toEqual('2, 3, 4, 5');
    });

    it('should return empty ToothNumbers string if no note.ToothNumbers', function () {
      var note = angular.copy(mockExistingNote);
      note.ToothNumbers = "";
      expect(scope.getToothNumbers(note)).toEqual('');
    });
  });

  describe('mapClinicalNoteToVm method -> ', function () {
    beforeEach(function () {
        ctrl.note = angular.copy(mockExistingNote);
        ctrl.sanitizeNote = jasmine.createSpy().and.callFake(function (note) { return note; });
    });

    it('should map ctrl.note to noteVm', function () {
      scope.noteVm = null;
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
      expect(scope.noteVm.Note).toEqual(ctrl.note.Note);
      expect(scope.noteVm.NoteTitle).toEqual(ctrl.note.NoteTitle);
      expect(scope.noteVm.CreatedDate).toEqual(ctrl.note.CreatedDate);
      expect(scope.noteVm.NoteId).toEqual(ctrl.note.NoteId);
      expect(ctrl.sanitizeNote).toHaveBeenCalledWith(ctrl.note.Note);
    });
  });

    describe('ctrl.sanitizeNote method -> ', function () {
        beforeEach(function () {                        
        });

        it('should map ctrl.note to noteVm', function () {
            
            let sanitizedNote = ctrl.sanitizeNote(ctrl.note);
            expect(sanitizedNote).toBe('sanitized');
            expect(richTextSanitizerService.sanitizeRichText).toHaveBeenCalledWith(ctrl.note);
        });
    });
  describe('mapVmToClinicalNote method -> ', function () {
    beforeEach(function () {
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
    });

    it('should map noteVm to original note', function () {
      scope.noteVm.Note = 'This is the new note';
      scope.noteVm.NoteTitle = 'This is the new Note Title';

      expect(scope.noteVm.Note).not.toEqual(ctrl.note.Note);
      expect(scope.noteVm.NoteTitle).not.toEqual(ctrl.note.NoteTitle);

      ctrl.mapVmToClinicalNote(ctrl.note, scope.noteVm);

      expect(scope.noteVm.Note).toEqual(ctrl.note.Note);
      expect(scope.noteVm.NoteTitle).toEqual(ctrl.note.NoteTitle);
    });
  });

  describe('printNote method -> ', function () {
    var filteredNotes = [];
    var storageItem = {};

    beforeEach(function () {
      scope.personId = 'a6993a42-6fc9-45c6-ad89-007db488a355';
      ctrl.note = angular.copy(mockExistingNote);
      scope.noteVm = ctrl.mapClinicalNoteToVm(ctrl.note);
      spyOn(ctrl, 'mapVmToClinicalNote');
      filteredNotes.push(ctrl.note);
      scope.personId = '123456';
      storageItem = { DateFrom: null, DateTo: null, Notes: filteredNotes };
    });

    it('should create storage item and call localStorage.setItem', function () {
      scope.printNote();
      var temp = JSON.stringify(storageItem);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'clinicalNotes_' + ctrl.storageId,
        temp
      );
    });

    it('should call tabLauncher with the patientid from the note', function () {
      scope.printNote();
      var temp = JSON.stringify(storageItem);
      expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
        '#/Patient/' +
          ctrl.note.PatientId +
          '/Clinical/PrintNotes/' +
          ctrl.storageId
      );
    });
  });

  describe('Reset -> ', function () {
    it('should reset the note edit mode', function () {
      patientNotesFactory.EditMode = true;

      scope.resetData();
      expect(patientNotesFactory.EditMode).toBe(false);
    });
  });
});
