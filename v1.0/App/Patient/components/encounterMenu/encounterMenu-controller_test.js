describe('EncounterMenuController ->', function () {
  //#region Variables
    var scope, ctrl, controller, element, timeout, toastrFactory, depositService, mockAccountNoteFactory;

    beforeEach(
        module('Soar.Patient', function ($provide) {
            mockAccountNoteFactory = {
                getAccountNote: jasmine.createSpy('accountNoteFactory.getAccountNote'),
            };
            $provide.value('AccountNoteFactory', mockAccountNoteFactory);
        })
    );

  //#endregion
  function createController() {
    ctrl = controller('EncounterMenuController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      DepositService: depositService,
    });
  }
  //#region before each
  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    controller = $controller;
    scope.viewDetailsActionFunction = jasmine.createSpy(
      'scope.viewDetailsActionFunction'
    );
    scope.deleteActionFunction = jasmine.createSpy(
      'scope.deleteActionFunction'
    );
    scope.applyAdjustmentActionFunction = jasmine.createSpy(
      'scope.applyAdjustmentActionFunction'
    );
    scope.editActionFunction = jasmine.createSpy('scope.editActionFunction');
    scope.changePaymentOrAdjustmentActionFunction = jasmine.createSpy(
      'scope.changePaymentOrAdjustmentActionFunction'
    );
    scope.applyPaymentActionFunction = jasmine.createSpy(
      'scope.applyPaymentActionFunction'
    );
    scope.viewEobActionFunction = jasmine.createSpy(
      'scope.viewEobActionFunction'
    );
    scope.viewStatementSuccess = jasmine.createSpy(
      'scope.viewStatementSuccess'
    );
    scope.viewStatementFailure = jasmine.createSpy(
      'scope.viewStatementFailure'
    );
    toastrFactory = {
      error: jasmine.createSpy('toastrFactory.error'),
    };
    scope.encounter = {
      Date: '0001-01-01T00:00:00',
      EncounterId: 'eec28b55-d01e-442e-b78c-e758b3e19dd7',
      Description: null,
      AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
      Status: 0,
      ServiceTransactionDtos: [
        {
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: 0,
          AppointmentId: null,
          ClaimId: null,
          DateCompleted: null,
          DateEntered: '0001-01-01T00:00:00',
          Description: null,
          Discount: 0,
          EncounterId: 'eec28b55-d01e-442e-b78c-e758b3e19dd7',
          EnteredByUserId: '00000000-0000-0000-0000-000000000000',
          Fee: 0,
          LocationId: null,
          Note: null,
          ProviderUserId: null,
          RejectedReason: null,
          ServiceCodeId: '00000000-0000-0000-0000-000000000000',
          ServiceTransactionId: '43d1d952-9f0a-4100-868a-25ab457184c5',
          ServiceTransactionStatusId: 4,
          Surface: null,
          Tax: 0,
          Tooth: null,
          TransactionTypeId: 0,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 0,
          DataTag:
            '{"Timestamp":"2015-10-05T11:50:10.5071229+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A50%3A10.5071229Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '0001-01-01T00:00:00',
        },
        {
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: 0,
          AppointmentId: null,
          ClaimId: null,
          DateCompleted: null,
          DateEntered: '0001-01-01T00:00:00',
          Description: null,
          Discount: 0,
          EncounterId: 'eec28b55-d01e-442e-b78c-e758b3e19dd7',
          EnteredByUserId: '00000000-0000-0000-0000-000000000000',
          Fee: 0,
          LocationId: null,
          Note: null,
          ProviderUserId: null,
          RejectedReason: null,
          ServiceCodeId: '00000000-0000-0000-0000-000000000000',
          ServiceTransactionId: 'f35223ef-9553-4868-8d7a-65553d14c2fb',
          ServiceTransactionStatusId: 4,
          Surface: null,
          Tax: 0,
          Tooth: null,
          TransactionTypeId: 0,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 0,
          DataTag:
            '{"Timestamp":"2015-10-05T11:50:10.5071229+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A50%3A10.5071229Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '0001-01-01T00:00:00',
        },
        {
          AccountMemberId: 'b323812f-ab5c-4e04-9ddf-9203484e7ab9',
          Amount: 0,
          AppointmentId: null,
          ClaimId: null,
          DateCompleted: null,
          DateEntered: '0001-01-01T00:00:00',
          Description: null,
          Discount: 0,
          EncounterId: 'eec28b55-d01e-442e-b78c-e758b3e19dd7',
          EnteredByUserId: '00000000-0000-0000-0000-000000000000',
          Fee: 0,
          LocationId: null,
          Note: null,
          ProviderUserId: null,
          RejectedReason: null,
          ServiceCodeId: '00000000-0000-0000-0000-000000000000',
          ServiceTransactionId: 'fa254525-7938-4799-9399-42bc38529825',
          ServiceTransactionStatusId: 4,
          Surface: null,
          Tax: 0,
          Tooth: null,
          TransactionTypeId: 0,
          ObjectState: 'None',
          FailedMessage: null,
          Balance: 0,
          DataTag:
            '{"Timestamp":"2015-10-05T11:50:10.5071229+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A50%3A10.5071229Z\'\\""}',
          UserModified: '00000000-0000-0000-0000-000000000000',
          DateModified: '0001-01-01T00:00:00',
        },
      ],
      CreditTransactionDto: null,
      ObjectState: null,
      FailedMessage: null,
      DataTag:
        '{"Timestamp":"2015-10-05T11:47:10.3982243+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A47%3A10.3982243Z\'\\""}',
      UserModified: '00000000-0000-0000-0000-000000000000',
      DateModified: '0001-01-01T00:00:00',
    };

    element = {
      removeClass: jasmine.createSpy(),
    };
    spyOn(angular, 'element').and.returnValue(element);
    timeout = $injector.get('$timeout');

    depositService = {
      getDepositIdByCreditTransactionId: jasmine
        .createSpy()
        .and.returnValue({ $promise: { then: function () {} } }),
    };
  }));

  //#endregion

  describe('controller ->', function () {
    beforeEach(function () {
      createController();
    });

    it('should exist', function () {
      expect(ctrl).not.toBeNull();
    });

    //expandEncounter
    describe('expandEncounter function ->', function () {
      beforeEach(function () {
        createController();
      });

      it('should call parent function to expand the encounter', function () {
        scope.expandEncounter();
        expect(scope.viewDetailsActionFunction).toHaveBeenCalled();
      });
    });

    //deleteEncounter
    describe('deleteEncounter function ->', function () {
      beforeEach(function () {
        createController();
      });

      it('should call parent function to delete the encounter', function () {
        scope.deleteEncounter();
        expect(scope.deleteActionFunction).toHaveBeenCalled();
      });
    });

    //toggleMenu
    describe('toggleMenu function ->', function () {
      beforeEach(function () {
        createController();
      });

      it('should not call parent function to collapse the encounter if showDetails is false', function () {
        scope.encounter.showDetail = false;
        scope.toggleMenu();
        expect(scope.viewDetailsActionFunction).not.toHaveBeenCalled();
      });

      it('should call parent function to collapse the encounter if showDetails is true', function () {
        scope.encounter.showDetail = true;

        scope.toggleMenu();
        expect(scope.viewDetailsActionFunction).toHaveBeenCalled();
      });
    });

    //applyAdjustment
    describe('applyAdjustment function ->', function () {
      beforeEach(function () {
        createController();
      });

      it('should call function to apply adjustment', function () {
        scope.applyAdjustment();
        expect(scope.applyAdjustmentActionFunction).toHaveBeenCalled();
      });
    });

    //applyPayment
    describe('applyPayment function ->', function () {
      beforeEach(function () {
        createController();
      });

      it('should call function to applyPaymentActionFunction', function () {
        scope.applyPayment();
        expect(scope.applyPaymentActionFunction).toHaveBeenCalled();
      });
    });

    //editTransaction
    describe('editTransaction function ->', function () {
      beforeEach(function () {
        createController();
      });

      it('should call parent function to edit the encounter', function () {
        scope.editTransaction();
        expect(scope.editActionFunction).toHaveBeenCalled();
      });
    });

    //viewEncounter
    describe('viewEncounter function ->', function () {
      beforeEach(function () {
        createController();
      });

      it('should call parent function to open the complete encounter', function () {
        scope.viewCompleteEncounterActionFunction = jasmine.createSpy(
          'scope.viewCompleteEncounterActionFunction'
        );
        scope.viewEncounter();
        expect(scope.viewCompleteEncounterActionFunction).toHaveBeenCalled();
      });
    });

    //changePaymentOrAdjustment
    describe('changePaymentOrAdjustment function', function () {
      beforeEach(function () {
        createController();
      });

      it('should call parent function to edit payment/adjustment', function () {
        scope.changePaymentOrAdjustment();
        expect(
          scope.changePaymentOrAdjustmentActionFunction
        ).toHaveBeenCalled();
      });
    });

    //watcher encounter.showDetail
    describe('watcher encounter.showDetail ->', function () {
      it('should call removeClass function to remove open call from div if encounter.showDetail new value is false', function () {
        scope.encounterIndex = 1;
        scope.encounter.showDetail = true;
        scope.$apply();
        scope.encounter.showDetail = false;
        scope.$apply();
        timeout.flush(0);
        expect(
          angular.element('#btnGroup' + scope.encounterIndex).removeClass
        ).toHaveBeenCalled();
      });

      it('should not call removeClass function to remove open call from div if encounter.showDetail new value is true', function () {
        scope.encounterIndex = 1;
        scope.encounter.showDetail = true;
        scope.$apply();
        scope.encounter.showDetail = true;
        scope.$apply();
        timeout.flush(0);
        expect(
          angular.element('#btnGroup' + scope.encounterIndex).removeClass
        ).not.toHaveBeenCalled();
      });
    });

    describe('$scope.viewCarrierResponse =>', function () {
      it('should call $scope.viewCarrierResponseFunction', function () {
        scope.viewCarrierResponseFunction = jasmine.createSpy(
          'scope.viewCarrierResponseFunction'
        );
        scope.viewCarrierResponse();
        expect(scope.viewCarrierResponseFunction).toHaveBeenCalled();
      });
    });

    //viewEob
    describe('viewEob function ->', function () {
      it('should call function viewEobActionFunction', function () {
        scope.viewEob();
        expect(scope.viewEobActionFunction).toHaveBeenCalled();
      });
    });

    describe('viewDeposit ->', function () {
      it('when DepositId and depositCreditTransactionId are both undefined should not call window.open', function () {
        scope.viewDeposit({});
        expect(_tabLauncher_.launchNewTab).not.toHaveBeenCalled();
      });
      it('when DepositId and depositCreditTransactionId are both null should not call window.open', function () {
        scope.depositCreditTransactionId = null;
        scope.viewDeposit({ DepositId: null });
        expect(_tabLauncher_.launchNewTab).not.toHaveBeenCalled();
      });
      it('when DepositId and depositCreditTransactionId are both undefined should not call depositService.getDepositIdByCreditTransactionId', function () {
        scope.viewDeposit({});
        expect(
          depositService.getDepositIdByCreditTransactionId
        ).not.toHaveBeenCalled();
      });
      it('when DepositId and depositCreditTransactionId are both null should not call depositService.getDepositIdByCreditTransactionId', function () {
        scope.depositCreditTransactionId = null;
        scope.viewDeposit({ DepositId: null });
        expect(
          depositService.getDepositIdByCreditTransactionId
        ).not.toHaveBeenCalled();
      });
      it('when DepositId is defined should call window.open with DepositId', function () {
        scope.encounter = { LocationId: 5 };
        scope.viewDeposit({ DepositId: 123 });
        expect(_tabLauncher_.launchNewTab).toHaveBeenCalledWith(
          '#/BusinessCenter/Receivables/Deposits/5/ViewDeposit/123'
        );
      });
      it('when DepositId is not defined should call depositService.getDepositIdByCreditTransactionId with scope.depositCreditTransactionId', function () {
        scope.encounter = { LocationId: 5 };
        scope.depositCreditTransactionId = 321;
        scope.viewDeposit({});
        expect(
          depositService.getDepositIdByCreditTransactionId
        ).toHaveBeenCalledWith(
          jasmine.objectContaining({ creditTransactionId: 321 })
        );
      });
      it('when DepositId is not defined should call window.open with scope.depositCreditTransactionId', function () {
        depositService.getDepositIdByCreditTransactionId = jasmine
          .createSpy()
          .and.returnValue({
            $promise: {
              then: function (callback) {
                callback({ Value: 8 });
              },
            },
          });
        scope.encounter = { LocationId: 5 };
        scope.depositCreditTransactionId = 321;
        scope.viewDeposit({});
        expect(_tabLauncher_.launchNewTab).toHaveBeenCalledWith(
          '#/BusinessCenter/Receivables/Deposits/5/ViewDeposit/8'
        );
      });
    });
  });
});
