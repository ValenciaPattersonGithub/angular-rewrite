import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PatientTransactionGridComponent } from './patient-transaction-grid.component';
import { TransactionEditDisabledReason } from 'src/patient/common/models/enums/transaction-edit-disabled-reason.enum';


describe('PatientTransactionGridComponent', () => {
  let component: PatientTransactionGridComponent;
  let fixture: ComponentFixture<PatientTransactionGridComponent>;
  let mockPatientDocumentsFactory: any;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PatientTransactionGridComponent],
      providers: [
        { provide: 'PatientDocumentsFactory', useValue: mockPatientDocumentsFactory },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientTransactionGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
  describe('sortColumn function', () => {
    it('should call parent function to sort the rows', () => {
      spyOn(component.sortColumnField, 'emit');
      component.sortColumn('Date');
      expect(component.sortColumnField.emit).toHaveBeenCalled();
    });
  });

  describe('showMoreResults function', () => {
    it('should call parent function to showmore the list', () => {
      spyOn(component.showMoreGrid, 'emit');
      component.showMoreResults();
      expect(component.showMoreGrid.emit).toHaveBeenCalled();
    });
  });

  describe('refreshData function', () => {
    it('should call parent function to refreshData for latest rows', () => {
      spyOn(component.refreshDataTx, 'emit');
      component.refreshData();
      expect(component.refreshDataTx.emit).toHaveBeenCalled();
    });
  });

  describe('selectedCountChangeEvent function', () => {
    it('should call parent function to increase or decrease selectd count', () => {
      let rows = [
        { ObjectType: 'ServiceTransaction', TransactionTypeId: 1, Date: '2016-04-25T12:00:00Z', ObjectId: 33, ServiceManuallySelected: true },
        { ObjectType: 'ServiceTransaction', TransactionTypeId: 1, Date: '2015-03-25T12:00:00Z', ObjectId: 34, ServiceManuallySelected: false },
        { ObjectType: 'ServiceTransaction', TransactionTypeId: 1, Date: '2017-06-25T12:00:00Z', ObjectId: 35, ServiceManuallySelected: true },
    ];
      spyOn(component.selectedCountChange, 'emit');
      component.selectedCountChangeEvent(rows[0]);
      expect(component.selectedCountChange.emit).toHaveBeenCalled();
    });
  });

    describe('disableEditForMenu function', () => {
        it('should return DisabledEditTransaction.ClaimInProcess if InProcess is true', () => {
            let row = { ObjectType: 'CreditTransaction', InProcess: true , IsAuthorized: false, TransactionTypeId: 2, IsDeposited: false, Description: 'Vendor Payment ' };     
            expect(component.disableEditForMenu(row)).toEqual(TransactionEditDisabledReason.ClaimInProcess);
        }); 

        it('should return DisabledEditTransaction.CreditOrDebitCardReturn if Authorized and TransactionTypeId is 5', () => {
            let row = { ObjectType: 'CreditTransaction', InProcess: false , IsAuthorized: true, TransactionTypeId: 5, IsDeposited: true, Description: 'Vendor Payment ' };     
            expect(component.disableEditForMenu(row)).toEqual(TransactionEditDisabledReason.CreditOrDebitCardReturn);
        });

        it('should return DisabledEditTransaction.CreditOrDebitCardPayment if Authorized and TransactionTypeId is not 5', () => {
            let row = { ObjectType: 'CreditTransaction', InProcess: false , IsAuthorized: true, TransactionTypeId: 2, IsDeposited: true, Description: 'Vendor Payment ' };     
            expect(component.disableEditForMenu(row)).toEqual(TransactionEditDisabledReason.CreditOrDebitCardPayment);
        });

        it('should return DisabledEditTransaction.PaymentDeposited if IsDeposited is true and TransactionTypeId is not 5 and IsAuthorized is not true', () => {
            let row = { ObjectType: 'CreditTransaction', InProcess: false , IsAuthorized: false, TransactionTypeId: 2, IsDeposited: true, Description: 'Vendor Payment ' };     
            expect(component.disableEditForMenu(row)).toEqual(TransactionEditDisabledReason.PaymentDeposited);
        });
        
        it('should return DisabledEditTransaction.IsVendorPayment if Description is Vendor Payment and IsDeposit is false and InProcess is false and TransactionTypeId is not 5 and IsAuthorized is not true', () => {
            let row = { ObjectType: 'CreditTransaction', InProcess: false , IsAuthorized: false, TransactionTypeId: 2, IsDeposited: false, Description: 'Vendor Payment ' };     
            expect(component.disableEditForMenu(row)).toEqual(TransactionEditDisabledReason.IsVendorPayment);
        });

        it('should return DisabledEditTransaction.IsVendorPaymentRefund if Description is Vendor Payment Refund and IsDeposit is false and InProcess is false and IsServiceLocationMatch is true and IsAuthorized is not true', () => {
            let row = { ObjectType: 'DebitTransaction', InProcess: false , IsAuthorized: false, TransactionTypeId: 5, IsDeposited: false, IsServiceLocationMatch: true, Description: 'Vendor Payment Refund' };     
            expect(component.disableEditForMenu(row)).toEqual(TransactionEditDisabledReason.IsVendorPaymentRefund);
        });

        it('should return DisabledEditTransaction.CurrentLocationDoesNotMatchAdjustmentLocation if TransactionTypeId is 5 and IsServiceLocationMatch is false', () => {
          let row = { ObjectType: 'CreditTransaction', InProcess: false , IsAuthorized: false, TransactionTypeId: 5, IsServiceLocationMatch: false, IsDeposited: false, Description: ' ' };     
          expect(component.disableEditForMenu(row)).toEqual(TransactionEditDisabledReason.CurrentLocationDoesNotMatchAdjustmentLocation);
      }); 
    });

});
