import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientEncounterMenuComponent } from './patient-encounter-menu.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TransactionEditDisabledReason } from 'src/patient/common/models/enums/transaction-edit-disabled-reason.enum';

describe('PatientEncounterMenuComponent', () => {
  let component: PatientEncounterMenuComponent;
  let fixture: ComponentFixture<PatientEncounterMenuComponent>;
  let mockservice;
  let mockTabLauncher;
  let patSecurityServiceMock;
  let mockLocalizeService: any;
  let mockToastrFactory: any;

  beforeEach(async () => {
    mockservice = {
      getDepositIdByCreditTransactionId: jasmine.createSpy(),
      viewStatement: (a: any) => { },
      launchNewTab: (a: any) => { },
      getLocalizedString: (a: any) => { },
    };
    mockTabLauncher = { launchNewTab: jasmine.createSpy() };
    patSecurityServiceMock = {
      generateMessage: jasmine.createSpy().and.returnValue(''),
      IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
    };
    mockLocalizeService = {
      getLocalizedString: () => 'translated text'
    };
    mockToastrFactory = {
      error: jasmine.createSpy(),
      success: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      declarations: [PatientEncounterMenuComponent]
      , imports: [
        TranslateModule.forRoot()],
      providers: [
        { provide: 'DepositService', useValue: mockservice },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'tabLauncher', useValue: mockTabLauncher },
        { provide: 'AccountNoteFactory', useValue: mockservice },
        { provide: 'patSecurityService', useValue: patSecurityServiceMock },
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientEncounterMenuComponent);
    component = fixture.componentInstance;
    component.hasViewDepositAccess = true;
    component.hasPrintInvoiceAccess = true;
    component.hasDeleteEncounterAccess = true;
    component.hasEditClaimAccess = true;
    component.hasViewClaimAccess = true;
    component.hasEditEncounterAccess = true;
    component.hasEditEncounterAccess1 = true;
    component.hasApplyPaymentAccess = true;
    component.hasApplyAdjAccess = true;
    component.hasCdtAdjAccess = true;
    component.encounter = { 'Date': '0001-01-01T00:00:00', 'EncounterId': 'eec28b55-d01e-442e-b78c-e758b3e19dd7', 'Description': null, 'AccountMemberId': 'b323812f-ab5c-4e04-9ddf-9203484e7ab9', 'Status': 0, 'ServiceTransactionDtos': [{ 'AccountMemberId': 'b323812f-ab5c-4e04-9ddf-9203484e7ab9', 'Amount': 0, 'AppointmentId': null, 'ClaimId': null, 'DateCompleted': null, 'DateEntered': '0001-01-01T00:00:00', 'Description': null, 'Discount': 0, 'EncounterId': 'eec28b55-d01e-442e-b78c-e758b3e19dd7', 'EnteredByUserId': '00000000-0000-0000-0000-000000000000', 'Fee': 0, 'LocationId': null, 'Note': null, 'ProviderUserId': null, 'RejectedReason': null, 'ServiceCodeId': '00000000-0000-0000-0000-000000000000', 'ServiceTransactionId': '43d1d952-9f0a-4100-868a-25ab457184c5', 'ServiceTransactionStatusId': 4, 'Surface': null, 'Tax': 0, 'Tooth': null, 'TransactionTypeId': 0, 'ObjectState': 'None', 'FailedMessage': null, 'Balance': 0, 'DataTag': '{"Timestamp":"2015-10-05T11:50:10.5071229+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A50%3A10.5071229Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '0001-01-01T00:00:00' }, { 'AccountMemberId': 'b323812f-ab5c-4e04-9ddf-9203484e7ab9', 'Amount': 0, 'AppointmentId': null, 'ClaimId': null, 'DateCompleted': null, 'DateEntered': '0001-01-01T00:00:00', 'Description': null, 'Discount': 0, 'EncounterId': 'eec28b55-d01e-442e-b78c-e758b3e19dd7', 'EnteredByUserId': '00000000-0000-0000-0000-000000000000', 'Fee': 0, 'LocationId': null, 'Note': null, 'ProviderUserId': null, 'RejectedReason': null, 'ServiceCodeId': '00000000-0000-0000-0000-000000000000', 'ServiceTransactionId': 'f35223ef-9553-4868-8d7a-65553d14c2fb', 'ServiceTransactionStatusId': 4, 'Surface': null, 'Tax': 0, 'Tooth': null, 'TransactionTypeId': 0, 'ObjectState': 'None', 'FailedMessage': null, 'Balance': 0, 'DataTag': '{"Timestamp":"2015-10-05T11:50:10.5071229+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A50%3A10.5071229Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '0001-01-01T00:00:00' }, { 'AccountMemberId': 'b323812f-ab5c-4e04-9ddf-9203484e7ab9', 'Amount': 0, 'AppointmentId': null, 'ClaimId': null, 'DateCompleted': null, 'DateEntered': '0001-01-01T00:00:00', 'Description': null, 'Discount': 0, 'EncounterId': 'eec28b55-d01e-442e-b78c-e758b3e19dd7', 'EnteredByUserId': '00000000-0000-0000-0000-000000000000', 'Fee': 0, 'LocationId': null, 'Note': null, 'ProviderUserId': null, 'RejectedReason': null, 'ServiceCodeId': '00000000-0000-0000-0000-000000000000', 'ServiceTransactionId': 'fa254525-7938-4799-9399-42bc38529825', 'ServiceTransactionStatusId': 4, 'Surface': null, 'Tax': 0, 'Tooth': null, 'TransactionTypeId': 0, 'ObjectState': 'None', 'FailedMessage': null, 'Balance': 0, 'DataTag': '{"Timestamp":"2015-10-05T11:50:10.5071229+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A50%3A10.5071229Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '0001-01-01T00:00:00' }], 'CreditTransactionDto': null, 'ObjectState': null, 'FailedMessage': null, 'DataTag': '{"Timestamp":"2015-10-05T11:47:10.3982243+00:00","RowVersion":"W/\\"datetime\'2015-10-05T11%3A47%3A10.3982243Z\'\\""}', 'UserModified': '00000000-0000-0000-0000-000000000000', 'DateModified': '0001-01-01T00:00:00' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('ngOnInit function', () => {
    it('should set the disableEditMessage to empty string if disableEditButton is 0', () => {
      component.disableEditButton = 0;
      component.ngOnInit()
      expect(component.disableEditMessage).toEqual('');
      expect(component.disableDeleteMessage).toEqual('');
    });

    it('should set the disableEditMessage and disableDeleteMessage to \'This service is attached to a claim that is InProcess and it cannot be edited or deleted\' if disableEditButton is 1', () => {
      component.disableEditButton = TransactionEditDisabledReason.ClaimInProcess;
      component.ngOnInit()
      expect(component.disableEditMessage).toEqual('This service is attached to a claim that is InProcess and it cannot be edited or deleted');
      expect(component.disableDeleteMessage).toEqual('This service is attached to a claim that is InProcess and it cannot be edited or deleted');
    });

    it('should set the disableEditMessage and disableDeleteMessage to \'Credit/Debit Card Payments cannot be edited\' if disableEditButton is 2', () => {
      component.disableEditButton = TransactionEditDisabledReason.CreditOrDebitCardPayment;
      component.ngOnInit()
      expect(component.disableEditMessage).toEqual('Credit/Debit Card Payments cannot be edited');
      expect(component.disableDeleteMessage).toEqual('Credit/Debit Card Payments cannot be deleted');
    });

    it('should set the disableEditMessage and disableDeleteMessage to \'Credit/Debit card returns cannot be edited or deleted\' if disableEditButton is 3', () => {
      component.disableEditButton = TransactionEditDisabledReason.CreditOrDebitCardReturn;
      component.ngOnInit()
      expect(component.disableEditMessage).toEqual('Credit/Debit card returns cannot be edited or deleted');
      expect(component.disableDeleteMessage).toEqual('Credit/Debit card returns cannot be edited or deleted');
    });

    it('should set the disableEditMessage and disableDeleteMessage to \'This payment is already deposited and it cannot be edited or deleted.\' if disableEditButton is 4', () => {
      component.disableEditButton = TransactionEditDisabledReason.PaymentDeposited;
      component.ngOnInit()
      expect(component.disableEditMessage).toEqual('This payment is already deposited and it cannot be edited or deleted.');
      expect(component.disableDeleteMessage).toEqual('This payment is already deposited and it cannot be edited or deleted.');
    });

    it('should set the disableEditMessage to \'This payment originated from a third party vendor and it cannot be edited.\' if disableEditButton is 5', () => {
      component.disableEditButton = TransactionEditDisabledReason.IsVendorPayment;
      component.ngOnInit()
      expect(component.disableEditMessage).toEqual('This payment originated from a third party vendor and it cannot be edited.');
    });

    it('should set the disableDeleteMessage to an empty string if disableEditButton is 5', () => {
      component.disableEditButton = TransactionEditDisabledReason.IsVendorPayment;
      component.ngOnInit()
      expect(component.disableDeleteMessage).toEqual('');
    });

    it('should set the disableDeleteMessage to \'Your current location does not match this adjustment\'s location.\' if disableEditButton is 6', () => {
      component.disableEditButton = TransactionEditDisabledReason.CurrentLocationDoesNotMatchAdjustmentLocation;
      component.ngOnInit()
      expect(component.disableDeleteMessage).toEqual('Your current location does not match this adjustment\'s location.');
      expect(component.disableEditMessage).toEqual('Your current location does not match this adjustment\'s location.');
    });

    it('should set the disableEditMessage to \'This debit originated from a third party vendor and it cannot be edited.\' if disableEditButton is 7', () => {
      component.disableEditButton = TransactionEditDisabledReason.IsVendorPaymentRefund;
      component.ngOnInit()
      expect(component.disableEditMessage).toEqual('This debit originated from a third party vendor and it cannot be edited.');
    });

    it('should set the disableDeleteMessage to an empty string if disableEditButton is 7', () => {
      component.disableEditButton = TransactionEditDisabledReason.IsVendorPaymentRefund;
      component.ngOnInit()
      expect(component.disableDeleteMessage).toEqual('');
    });
  });

  describe('expandEncounter function', () => {
    it('should call parent function to expand the encounter', () => {
      spyOn(component.viewDetailsActionFunction, 'emit');
      component.expandEncounter();
      expect(component.viewDetailsActionFunction.emit).toHaveBeenCalled();
    });
  });

  describe('deleteEncounter function ', function () {
    it('should call parent function to delete the encounter', () => {
      spyOn(component.deleteActionFunction, 'emit');
      component.deleteEncounter();
      expect(component.deleteActionFunction.emit).toHaveBeenCalled();
    });
  });

  describe('toggleMenu function ->', function () {
    it('should not call parent function to collapse the encounter if showDetails is false', () => {
      component.encounter.showDetail = false;
      spyOn(component.viewDetailsActionFunction, 'emit');
      component.toggleMenu();
      expect(component.viewDetailsActionFunction.emit).not.toHaveBeenCalled();
    });

    it('should call parent function to collapse the encounter if showDetails is true', () => {
      component.encounter.showDetail = true;
      spyOn(component.viewDetailsActionFunction, 'emit');
      component.toggleMenu();
      expect(component.viewDetailsActionFunction.emit).toHaveBeenCalled();
    });
  });

  describe('applyAdjustment function ->', function () {
    it('should call function to apply adjustment', function () {
      spyOn(component.applyAdjustmentActionFunction, 'emit');
      component.applyAdjustment();
      expect(component.applyAdjustmentActionFunction.emit).toHaveBeenCalled();
    });
  });

  describe('applyPayment function ->', function () {

    it('should call function to applyPaymentActionFunction', function () {
      spyOn(component.applyPaymentActionFunction, 'emit');
      component.applyPayment();
      expect(component.applyPaymentActionFunction.emit).toHaveBeenCalled();
    });
  });

  describe('editTransaction function ->', function () {
    it('should call parent function to edit the encounter', function () {
      spyOn(component.editActionFunction, 'emit');
      component.editTransaction();
      expect(component.editActionFunction.emit).toHaveBeenCalled();
    });
  });

  describe('viewEncounter function ->', function () {
    it('should call parent function to open the complete encounter', function () {
      spyOn(component.viewCompleteEncounterActionFunction, 'emit');
      component.viewEncounter();
      expect(component.viewCompleteEncounterActionFunction.emit).toHaveBeenCalled();
    });
  });

  describe('changePaymentOrAdjustment function', function () {
    it('should call parent function to edit payment/adjustment', function () {
      spyOn(component.changePaymentOrAdjustmentActionFunction, 'emit');
      component.changePaymentOrAdjustment();
      expect(component.changePaymentOrAdjustmentActionFunction.emit).toHaveBeenCalled();
    });
  });

  describe('$component.viewCarrierResponse =>', function () {
    it('should call $component.viewCarrierResponseFunction', function () {
      spyOn(component.viewCarrierResponseFunction, 'emit');
      component.viewCarrierResponse();
      expect(component.viewCarrierResponseFunction.emit).toHaveBeenCalled();
    });
  });

  describe('viewEob function ->', function () {
    it('should call function viewEobActionFunction', function () {
      spyOn(component.viewEobActionFunction, 'emit');
      component.viewEob();
      expect(component.viewEobActionFunction.emit).toHaveBeenCalled();
    });
  });

  describe('viewDeposit ->', function () {
    it('when DepositId and depositCreditTransactionId are both undefined should not call window.open', function () {
      component.viewDeposit({});
      expect(mockTabLauncher.launchNewTab).not.toHaveBeenCalled();
    });
    it('when DepositId and depositCreditTransactionId are both null should not call window.open', function () {
      component.depositCreditTransactionId = null;
      component.viewDeposit({ DepositId: null });
      expect(mockTabLauncher.launchNewTab).not.toHaveBeenCalled();
    });
    it('when DepositId and depositCreditTransactionId are both undefined should not call depositService.getDepositIdByCreditTransactionId', function () {
      component.viewDeposit({});
      expect(mockservice.getDepositIdByCreditTransactionId).not.toHaveBeenCalled();
    });
    it('when DepositId and depositCreditTransactionId are both null should not call depositService.getDepositIdByCreditTransactionId', function () {
      component.depositCreditTransactionId = null;
      component.viewDeposit({ DepositId: null });
      expect(mockservice.getDepositIdByCreditTransactionId).not.toHaveBeenCalled();
    });
    it('when DepositId is defined should call window.open with DepositId', function () {
      component.encounter = { LocationId: 5 };
      component.viewDeposit({ DepositId: 123 });
      expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith('#/BusinessCenter/Receivables/Deposits/5/ViewDeposit/123');
    });
    it('when DepositId is not defined should call depositService.getDepositIdByCreditTransactionId with component.depositCreditTransactionId', function () {
      mockservice.getDepositIdByCreditTransactionId = jasmine.createSpy().and
        .returnValue({ $promise: { then: function (callback) { callback({ Value: 8 }); } } });
      component.encounter = { LocationId: 5 };
      component.depositCreditTransactionId = 321;
      component.viewDeposit({});
      expect(mockservice.getDepositIdByCreditTransactionId).toHaveBeenCalledWith(jasmine.objectContaining({ creditTransactionId: 321 }));
    });
    it('when DepositId is not defined should call window.open with component.depositCreditTransactionId', function () {
      mockservice.getDepositIdByCreditTransactionId = jasmine.createSpy().and
        .returnValue({ $promise: { then: function (callback) { callback({ Value: 8 }); } } });
      component.encounter = { LocationId: 5 };
      component.depositCreditTransactionId = 321;
      component.viewDeposit({});
      expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith('#/BusinessCenter/Receivables/Deposits/5/ViewDeposit/8');
    });
  });

});
