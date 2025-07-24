describe('AppointmentHistoryDirectiveController tests ->', function () {
  var ctrl, scope, filter, routeParams, patientAppointmentsFactory;

  var mockCounts = [
    {
      PersonId: 'ebfa2074-bdcb-487a-8012-123123123ddd',
      Missed: 28,
      Canceled: 10,
      Completed: 1,
    },
    {
      PersonId: 'ebfa2074-bdcb-487a-8012-456456456ddd',
      Missed: 2,
      Canceled: 1,
      Completed: 3,
    },
    {
      PersonId: 'ebfa2074-bdcb-487a-8012-7879789789dd',
      Missed: 3,
      Canceled: 2,
      Completed: 1,
    },
  ];

  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientAppointmentsFactory = {
        access: jasmine.createSpy().and.returnValue({
          View: true,
        }),
      };
      $provide.value('PatientAppointmentsFactory', patientAppointmentsFactory);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $filter,
    $routeParams
  ) {
    scope = $rootScope.$new();
    filter = $filter;
    routeParams = $routeParams;

    ctrl = $controller('AppointmentHistoryDirectiveController', {
      $scope: scope,
      $filter: filter,
      $routeParams: routeParams,
      PatientAppointmentsFactory: patientAppointmentsFactory,
    });
    scope.data = { PatientId: 'ebfa2074-bdcb-487a-8012-456456456ddd' };
    routeParams = { patientId: '123' };
    ctrl.$onInit();
  }));

  describe('$onInit function -> ', function () {
    it('should call filterAppointmentHistory', function () {
      spyOn(ctrl, 'filterAppointmentHistory');
      ctrl.$onInit();
      expect(ctrl.filterAppointmentHistory).toHaveBeenCalled();
    });

    it('should set ctrl.patientId to scope.data.PatientId', function () {
      spyOn(ctrl, 'filterAppointmentHistory');
      ctrl.$onInit();
      expect(ctrl.patientId).toEqual(scope.data.PatientId);
    });
  });

  describe('filterAppointmentHistory function -> ', function () {
    it('should filter counts for ctrl.patient', function () {
      scope.counts = angular.copy(mockCounts);
      ctrl.filterAppointmentHistory();
      expect(scope.apptHistory).toEqual(scope.counts[1]);
    });
  });

  describe('counts $watch ->', function () {
    it('should call filterAppointmentHistory', function () {
      spyOn(ctrl, 'filterAppointmentHistory');
      scope.counts = angular.copy(mockCounts);
      scope.$apply();
      scope.counts.splice(0, 1);
      scope.$apply();

      expect(ctrl.filterAppointmentHistory).toHaveBeenCalled();
    });
  });
});
