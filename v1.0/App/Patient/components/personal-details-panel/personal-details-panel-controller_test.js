describe('PersonalDetailsPanelController ->', function () {
  var toastrFactory, patientServices, modalFactory, scope;
  var ctrl, patientInfo, q, modalFactoryDeferred, patientAppointmentsFactory;

  var mockPatient = {
    Profile: {
      PatientId: '1234',
      DateOfBirth: new Date('1996-09-23'),
      Sex: 'M',
      FirstName: 'Bob',
      LastName: 'Frapples',
      MiddleName: '',
      Prefix: '',
      Suffix: '',
      IsValid: true,
      PreferredName: '',
      IsPatient: 1,
      IsActive: 1,
      IsSignatureOnFile: 0,
      ResponsiblePersonType: 1,
    },
  };
  beforeEach(module('Soar.Common'));

  // eslint-disable-next-line quotes
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientInfo = {};
      $provide.value('PatientInfo', patientInfo);

      patientServices = {};
      $provide.value('PatientServices', patientServices);

      patientAppointmentsFactory = {};
      $provide.value('PatientAppointmentsFactory', patientAppointmentsFactory);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('ToastrFactory', toastrFactory);

      $provide.value('PersonFactory', {});
    })
  );

  //#endregion

  // create controller and scope
  beforeEach(inject(function ($rootScope, $controller, $injector) {
    q = $injector.get('$q');

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

    scope.patientData = _.cloneDeep(mockPatient);

    scope.frmPersonalInfo = {
      $valid: true,
      inpFirstName: { $valid: true },
      inpLastName: { $valid: true },
    };
    scope.validResponsiblePerson = true;
    scope.validDob = true;
    scope.responsiblePerson = '';

    ctrl = $controller('PersonalDetailsPanelController', {
      $scope: scope,
      ModalFactory: modalFactory,
    });
  }));

  describe('scope.validateInfo method -> ', function () {
    var nv;
    beforeEach(function () {
      nv = _.cloneDeep(mockPatient);
      nv.Profile.IsValid = true;
    });

    it('should set Profile.IsValid to false if any failed validation', function () {
      scope.validateInfo(nv);
      expect(scope.patientData.Profile.IsValid).toBe(true);
      scope.validDob = false;
      scope.validateInfo(nv);
      expect(scope.patientData.Profile.IsValid).toBe(false);
    });

    it('should set hasErrors based on scope.patientData.Profile.IsValid if editing is true', function () {
      scope.editing = true;
      scope.validDob = true;
      scope.validateInfo(nv);
      expect(scope.hasErrors).toBe(false);

      scope.validDob = false;
      scope.validateInfo(nv);
      expect(scope.hasErrors).toBe(true);
    });

    it('should not set hasErrors based on scope.patientData.Profile.IsValid if editing is false', function () {
      scope.hasErrors = false;
      scope.editing = false;
      scope.validDob = true;
      scope.validateInfo(nv);
      expect(scope.hasErrors).toBe(false);

      scope.validDob = false;
      scope.validateInfo(nv);
      expect(scope.hasErrors).toBe(false);
    });
  });

  describe('ctrl.setHasChanges method -> ', function () {
    beforeEach(function () {
      scope.patientDataBackup = _.cloneDeep(mockPatient);
      scope.patientData = _.cloneDeep(mockPatient);
    });

    it('should set hasChanges to false if no properties change', function () {
      ctrl.setHasChanges();
      expect(scope.hasChanges).toBe(false);
    });

    it('should set hasChanges to true if any properties change', function () {
      scope.patientData.Profile.FirstName += 'the 3rd';
      ctrl.setHasChanges();
      expect(scope.hasChanges).toBe(true);
    });

    it('should set hasChanges to true if day value of date of birth changes', function () {
      scope.patientData.Profile.DateOfBirth = new Date('1996-09-11');
      ctrl.setHasChanges();
      expect(scope.hasChanges).toBe(true);
    });

    it('should set hasChanges to true if month value of date of birth changes', function () {
      scope.patientData.Profile.DateOfBirth = new Date('1996-11-23');
      ctrl.setHasChanges();
      expect(scope.hasChanges).toBe(true);
    });

    it('should set hasChanges to true if year value of date of birth changes', function () {
      scope.patientData.Profile.DateOfBirth = new Date('1995-09-23');
      ctrl.setHasChanges();
      expect(scope.hasChanges).toBe(true);
    });
  });

  describe('watch validDob -> ', function () {
    beforeEach(function () {
      scope.validDob = true;
      scope.$apply();
      spyOn(ctrl, 'setHasChanges');
      spyOn(scope, 'validateInfo');
      scope.patientDataBackup = _.cloneDeep(mockPatient);
      scope.patientData = _.cloneDeep(mockPatient);
    });

    it('should call scope.validateInfo when change', function () {
      scope.validDob = false;
      scope.$apply();
      expect(scope.validateInfo).toHaveBeenCalledWith(scope.patientData);
    });

    it('should call ctrl.setHasChanges when change', function () {
      scope.validDob = false;
      scope.$apply();
      expect(ctrl.setHasChanges).toHaveBeenCalled();
    });
  });
});
