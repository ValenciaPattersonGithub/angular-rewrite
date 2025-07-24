describe('addedit-notes-modal', function () {
  var ctrl,
    scope,
    mInstance,
    localize,
    toastrFactory,
    modalFactory,
    noteHistory,
    patientServices,
    claimSubmissionResultsDto,
    deferred,
    q,
    compile;

  beforeEach(module('Soar.Patient'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $compile,
    $q
  ) {
    q = $q;
    deferred = q.defer();
    scope = $rootScope.$new();
    compile = $compile;

    // mock patientServices
    patientServices = {
      ClaimNotes: {
        create: jasmine
          .createSpy('patientServices.ClaimNotes.create')
          .and.returnValue({ $promise: deferred.promise }),
        update: jasmine
          .createSpy('patientServices.ClaimNotes.update')
          .and.returnValue({ $promise: deferred.promise }),
      },
    };

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    noteHistory = {
      Note: 'Test',
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    //mock uibModalInstance
    mInstance = {
      close: jasmine.createSpy(),
      dismiss: jasmine.createSpy(),
    };

    //mock modalFactory
    modalFactory = {
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          var modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    claimSubmissionResultsDto = {
      PatientId: '00000000-0000-0000-0000-000000000000',
    };

    //mock controller
    ctrl = $controller('AddEditClaimNotesModalController', {
      $scope: scope,
      $uibModalInstance: mInstance,
      localize: localize,
      noteHistory: noteHistory,
      toastrFactory: toastrFactory,
      ModalFactory: modalFactory,
      PatientServices: patientServices,
      claimSubmissionResultsDto: claimSubmissionResultsDto,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('scope.close -> ', function () {
    it('modalFactory.CancelModal should be called', function () {
      scope.claimNote.Note = 'Test Note';
      scope.close();
      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  describe('scope.close -> ', function () {
    it('mInstance.close should be called', function () {
      scope.claimNote.Note = 'Test';
      scope.close();
      expect(mInstance.close).toHaveBeenCalled();
    });
  });

  describe('scope.closeModal -> ', function () {
    it('mInstance.close should be called', function () {
      scope.close();
      expect(mInstance.close).toHaveBeenCalled();
    });
  });

  describe('scope.save -> ', function () {
    it('patientServices.ClaimNotes.create should be called', function () {
      scope.claimNote.Type = 2;
      scope.claimNote.CreatedDate = new Date();
      scope.claimNote.Note = 'Test Note';
      scope.save();
      expect(patientServices.ClaimNotes.create).toHaveBeenCalled();
    });

    it('patientServices.ClaimNotes.update should be called', function () {
      scope.claimNote.Type = 2;
      scope.claimNote.CreatedDate = new Date();
      scope.claimNote.Note = 'Test Note';
      scope.claimNote.isEditClaim = true;
      scope.save();
      expect(patientServices.ClaimNotes.update).toHaveBeenCalled();
    });
  });
});
