describe('service-transaction-crud-close-claim-controller tests -> ', function () {
  var scope,
    mockUibModalInstance,
    mockFilter,
    mockLocalize,
    inputData,
    mockModalFactory;
  beforeEach(module('Soar.Patient'));
  beforeEach(inject(function ($controller) {
    scope = {};
    inputData = {
      isEdit: true,
      willAffectFeeScheduleWriteOff: true,
      willAffectOtherPayment: true,
      otherClaimServices: [
        {
          Description: 'Description1',
          DateEntered: '2018-01-02',
          Fee: 100,
          What: 'how',
        },
        { Description: 'Description1', DateEntered: '2018-01-01', Fee: 200 },
      ],
    };
    mockFilter = jasmine.createSpy('$filter').and.callFake(function () {
      return function () {};
    });
    mockLocalize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.returnValue('localized'),
    };
    mockUibModalInstance = {
      close: jasmine.createSpy('$uibModalInstance.close'),
      dismiss: jasmine.createSpy('$uibModalInstance.dismiss'),
    };
    mockModalFactory = {
      CancelModal: jasmine
        .createSpy('ModalFactory.CancelModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        }),
    };
    $controller('ServiceTransactionCrudCloseClaimController', {
      $scope: scope,
      localize: mockLocalize,
      inputData: inputData,
      $filter: mockFilter,
      $uibModalInstance: mockUibModalInstance,
      ModalFactory: mockModalFactory,
    });
  }));

  describe('initialize', function () {
    it('should have methods and fields initialized', function () {
      expect(scope.confirm).toBeDefined();
      expect(scope.cancel).toBeDefined();
      expect(scope.data.isEdit).toEqual(true);
      expect(scope.data.willAffectFeeScheduleWriteOff).toEqual(true);
      expect(scope.data.willAffectOtherPayment).toEqual(true);
      expect(scope.data.otherClaimServices[0].Fee).toEqual(200);
      expect(scope.data.otherClaimServices[1].What).toBeUndefined();
    });
  });

  describe('confirm', function () {
    it('should return values', function () {
      scope.data.recreate = true;
      scope.data.note = 'Note';
      scope.confirm();
      expect(mockUibModalInstance.close).toHaveBeenCalledWith({
        recreate: true,
        note: 'Note',
      });
    });
  });

  describe('cancel', function () {
    it('should call modal factory cancel then dismiss when there are changes', function () {
      scope.data.recreate = true;
      scope.cancel();
      expect(mockModalFactory.CancelModal).toHaveBeenCalled();
      expect(mockUibModalInstance.dismiss).toHaveBeenCalled();
    });
    it('should call dismiss when there are no changes', function () {
      scope.cancel();
      expect(mockModalFactory.CancelModal).not.toHaveBeenCalled();
      expect(mockUibModalInstance.dismiss).toHaveBeenCalled();
    });
  });
});
