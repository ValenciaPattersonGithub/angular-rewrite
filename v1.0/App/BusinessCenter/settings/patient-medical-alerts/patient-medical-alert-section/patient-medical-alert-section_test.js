describe('PatientMedicalAlertsSectionController ->', function () {
  var scope, toastrFactory, medicalHistoryAlertsFactory, listHelper, ctrl;

  //#region
  var medicalAlertsMock = [
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
  ];

  //#endregion

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      medicalHistoryAlertsFactory = {
        ChangeGenerateAlert: jasmine.createSpy().and.returnValue({}),
        ProcessQueue: jasmine.createSpy().and.returnValue({}),
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
    $location
  ) {
    scope = $rootScope.$new();
    ctrl = $controller('PatientMedicalAlertsSectionController', {
      $scope: scope,
      $location: $location,
      MedicalHistoryAlertsFactory: medicalHistoryAlertsFactory,
      medicalAlerts: angular.copy(medicalAlertsMock),
      ListHelper: listHelper,
    });
    scope.patientInfo = { PatientId: '999' };
  }));

  describe('intitial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('setGenerateAlert function -> ', function () {
    it('should call medicalHistoryAlertsFactory.ChangeGenerateAlert', function () {
      scope.medicalAlerts = angular.copy(medicalAlertsMock);
      var item = scope.medicalAlerts[0];
      scope.setGenerateAlert(item);
      expect(
        medicalHistoryAlertsFactory.ChangeGenerateAlert
      ).toHaveBeenCalled();
    });

    it('should call medicalHistoryAlertsFactory.ProcessQueue', function () {
      scope.medicalAlerts = angular.copy(medicalAlertsMock);
      var item = scope.medicalAlerts[0];
      scope.setGenerateAlert(item);
      expect(medicalHistoryAlertsFactory.ProcessQueue).toHaveBeenCalled();
    });
  });

  describe('ctrl.setSectionTitle function -> ', function () {
    it('should set sectionTitle based on alertTypeId', function () {
      scope.alertTypeId = '1';
      ctrl.setSectionTitle();
      expect(scope.sectionTitle).toBe('Allergies');

      scope.alertTypeId = '2';
      ctrl.setSectionTitle();
      expect(scope.sectionTitle).toBe('Medical');

      scope.alertTypeId = '3';
      ctrl.setSectionTitle();
      expect(scope.sectionTitle).toBe('Other');
    });
  });

  describe('updateMedicalHistoryAlerts function -> ', function () {
    it('should update the list of medical alert with saved alert', function () {
      scope.medicalAlerts = angular.copy(medicalAlertsMock);
      var updatedMedicalAlert = angular.copy(scope.medicalAlerts[0]);
      updatedMedicalAlert.GenerateAlert = false;
      expect(updatedMedicalAlert.GenerateAlert).not.toEqual(
        scope.medicalAlerts[0].GenerateAlert
      );
      scope.updateMedicalHistoryAlerts(updatedMedicalAlert);
      expect(updatedMedicalAlert.GenerateAlert).toEqual(
        scope.medicalAlerts[0].GenerateAlert
      );
    });
  });
});
