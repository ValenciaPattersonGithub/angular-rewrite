describe('EditPersonalInfoModalController ->', function () {
  var toastrFactory,
    patientServices,
    modalInstance,
    $uibModal,
    modalFactory,
    modalFactoryDeferred,
    scope;
  var ctrl, imagingPatientService, patSharedServices, patientInfo, q;

  var imagingPatient = {
    Id: 1234,
    PrimaryId: '123456',
    Gender: 'M',
    FirstName: 'Bob',
    LastName: 'Frapples',
    Birthdate: new Date('1996-09-23'),
    comments: '',
  };
  var updatedPatient = {
    Profile: {
      DateOfBirth: new Date('1996-09-23'),
      Sex: 'M',
      FirstName: 'Bob',
      LastName: 'Frapples',
      MiddleName: '',
      Prefix: '',
      Suffix: '',
    },
  };

  var hasChanges = true;
  beforeEach(module('Soar.Common'));

  // eslint-disable-next-line quotes
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientInfo = {};
      $provide.value('PatientInfo', patientInfo);

      patientServices = {};
      $provide.value('PatientServices', patientServices);

      patSharedServices = {};
      $provide.value('PatSharedServices', patSharedServices);

      imagingPatientService = {
        getImagingPatient: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        compareImagingPatient: jasmine.createSpy().and.returnValue(hasChanges),
        updateImagingPatient: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };
      $provide.value('ImagingPatientService', imagingPatientService);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('ToastrFactory', toastrFactory);
      $provide.value('PersonFactory', {});
      $provide.value('PatientValidationFactory', {
        GetPatientData: jasmine.createSpy().and.returnValue([])
      });
    })
  );

  //#endregion

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller, _$uibModal_, $injector) {
    q = $injector.get('$q');
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

    ctrl = $controller('EditPersonalInfoModalController', {
      $scope: scope,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
    });
  }));

  describe('onSuccess method -> ', function () {
    var res = { Value: {} };
    beforeEach(function () {
      spyOn(ctrl, 'syncImagingPatient').and.returnValue({
        then: jasmine.createSpy().and.returnValue({}),
      });
      res.Value = { PatientId: '1234', FirstName: 'Sam', LastName: 'Iam' };
    });

    it('should call ctrl.syncImagingPatient with the updated patient', function () {
      ctrl.onSuccess(res);
      expect(ctrl.syncImagingPatient).toHaveBeenCalledWith(res.Value);
    });
  });

  describe('ctrl.syncImagingPatient method -> ', function () {
    it('should call imagingPatientService.getImagingPatient with the updated patient', function () {
      ctrl.syncImagingPatient(updatedPatient);
      expect(imagingPatientService.getImagingPatient).toHaveBeenCalledWith(
        updatedPatient
      );
    });
  });
});
