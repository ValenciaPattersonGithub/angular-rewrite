describe('PatientMedicalAlertsController ->', function () {
  var scope,
    toastrFactory,
    medicalHistoryAlertsFactory,
    modalFactory,
    listHelper,
    ctrl;
  var q, modalFactoryDeferred;

  //#region
  var medicalHistoryAlertsMock = {
    Value: [
      {
        DataTag: 'AAAAAAAAKJ4=',
        DateModified: '2016-09-20T14:15:53.485539',
        Description: 'Other congenital heart defects',
        GenerateAlert: true,
        ItemSequenceNumber: 10,
        MedicalHistoryAlertId: 1,
        SectionSequenceNumber: 8,
        UserModified: '00000000-0000-0000-0000-000000000000',
      },
      {
        DataTag: 'AAAAAAAAKJ5=',
        DateModified: '2016-09-20T14:15:53.485539',
        Description: 'Autoimmune disease',
        GenerateAlert: true,
        ItemSequenceNumber: 22,
        MedicalHistoryAlertId: 2,
        SectionSequenceNumber: 8,
        UserModified: '00000000-0000-0000-0000-000000000000',
      },
      {
        DataTag: 'AAAAAAAAKJ6=',
        DateModified: '2016-09-20T14:15:53.485539',
        Description: 'Allergic to food',
        GenerateAlert: true,
        ItemSequenceNumber: 12,
        MedicalHistoryAlertId: 3,
        SectionSequenceNumber: 6,
        UserModified: '00000000-0000-0000-0000-000000000000',
      },
      {
        DataTag: 'AAAAAAAAKJ7=',
        DateModified: '2016-09-20T14:15:53.485539',
        Description: 'Alleric to aspirin',
        GenerateAlert: true,
        ItemSequenceNumber: 2,
        MedicalHistoryAlertId: 10,
        SectionSequenceNumber: 6,
        UserModified: '00000000-0000-0000-0000-000000000000',
      },
    ],
  };

  //#endregion

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      medicalHistoryAlertsFactory = {
        access: jasmine
          .createSpy()
          .and.returnValue({ View: true, Create: true }),
        SetActiveMedicalHistoryAlerts: jasmine.createSpy().and.returnValue({}),
        observeMedicalHistoryAlerts: jasmine.createSpy().and.returnValue({}),
        MedicalHistoryAlerts: jasmine.createSpy().and.returnValue({}),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };
      $provide.value(
        'MedicalHistoryAlertsFactory',
        medicalHistoryAlertsFactory
      );

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      //mock for listHelper service
      listHelper = {
        findItemByFieldValue: jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(0),
        findIndexByFieldValue: jasmine
          .createSpy('listHelper.findIndexByFieldValue')
          .and.returnValue(0),
      };
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

    ctrl = $controller('PatientMedicalAlertsController', {
      $scope: scope,
      ModalFactory: modalFactory,
      $location: $location,
      MedicalHistoryAlertsFactory: medicalHistoryAlertsFactory,
      medicalHistoryAlerts: medicalHistoryAlertsMock,
      ListHelper: listHelper,
    });
    scope.patientInfo = { PatientId: '999' };
  }));

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('createBreadCrumb function -> ', function () {
    it('should create BreadCrumbs', function () {
      scope.breadCrumbPaths = {};
      ctrl.createBreadCrumb();
      expect(scope.breadCrumbPaths.BreadCrumbs[0].name).toEqual(
        'Practice Settings'
      );
      expect(scope.breadCrumbPaths.BreadCrumbs[0].path).toEqual(
        '/BusinessCenter/PracticeSettings/'
      );
      expect(scope.breadCrumbPaths.BreadCrumbs[1].name).toEqual(
        scope.pageTitle
      );
      expect(scope.breadCrumbPaths.BreadCrumbs[1].path).toEqual(
        '/BusinessCenter/PatientAlerts/'
      );
    });
  });

  describe('closeForm function -> ', function () {
    it('should change path to business center', function () {
      spyOn(scope, 'changePath');
      scope.medicalHistoryAlerts = angular.copy(medicalHistoryAlertsMock);
      scope.closeForm();
      expect(scope.changePath).toHaveBeenCalledWith(
        scope.breadCrumbPaths.BreadCrumbs[0]
      );
    });
  });

  describe('updateMedicalHistoryAlerts function -> ', function () {
    it('should update the list of medical alert with saved alert', function () {
      scope.medicalHistoryAlerts = angular.copy(medicalHistoryAlertsMock.Value);
      var updatedMedicalAlert = angular.copy(scope.medicalHistoryAlerts[0]);
      updatedMedicalAlert.GenerateAlert = false;
      expect(updatedMedicalAlert.GenerateAlert).not.toEqual(
        scope.medicalHistoryAlerts[0].GenerateAlert
      );
      scope.updateMedicalHistoryAlerts(updatedMedicalAlert);
      expect(updatedMedicalAlert.GenerateAlert).toEqual(
        scope.medicalHistoryAlerts[0].GenerateAlert
      );
    });
  });
});
