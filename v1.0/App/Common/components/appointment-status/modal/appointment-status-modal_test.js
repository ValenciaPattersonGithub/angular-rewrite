describe('AppointmentStatusModalController ->', function () {
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('common.directives'));

  var scope,
    ctrl,
    mInstance,
    mockStaticData,
    item,
    patientAppointmentsFactory,
    patientServices;

  var mockSaveStates = {
    None: 'None',
    Add: 'Add',
    Update: 'Update',
    Delete: 'Delete',
    Failed: 'Failed',
  };

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();

    mInstance = {
      close: function () {},
      dismiss: function () {},
    };

    item = {
      id: 'Reschedule',
      title: 'Reschedule this Appointment',
      appointment: null,
      reason: {
        id: 'RescheduleReason',
        labels: ['Cancellation', 'Missed', 'Other'],
        options: [0, 1, 2],
      },
      hasStatusNote: true,
      btns: [
        {
          Label: 'Reschedule Now',
          Class: 'btn-primary',
          Func: null,
          Promise: null,
          Action: null,
        },
      ],
    };

    patientAppointmentsFactory = {};

    patientServices = {};

    ctrl = $controller('AppointmentStatusModalController', {
      $scope: scope,
      $uibModalInstance: mInstance,
      item: item,
      StaticData: mockStaticData,
      SaveStates: mockSaveStates,
      PatientAppointmentsFactory: patientAppointmentsFactory,
      PatientServices: patientServices,
    });
  }));

  it('should exist', function () {
    expect(ctrl).toBeDefined();
  });

  it('should set scope properties', function () {
    expect(scope.deletedReason).toBe(2);
    expect(scope.addNote).toBe(false);
  });

  describe('confirmDiscard function ->', function () {
    it('should call close', function () {
      mInstance.close = jasmine.createSpy('close');
      var appointment = { AppointmentId: 1 };
      scope.confirmDiscard(appointment);

      expect(mInstance.close).toHaveBeenCalledWith(appointment);
    });
  });

  describe('cancelDiscard function ->', function () {
    it('should call dismiss', function () {
      mInstance.dismiss = jasmine.createSpy('dismiss');
      scope.cancelDiscard();

      expect(mInstance.dismiss).toHaveBeenCalled();
    });
  });
});
