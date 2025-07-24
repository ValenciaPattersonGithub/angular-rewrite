import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { event } from 'jquery';

import { PatientAccountSummaryGridComponent } from './patient-account-summary-grid.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { ViewClaimService } from 'src/@shared/providers/view-claim.service';

describe('PatientAccountSummaryGridComponent', () => {
  let component: PatientAccountSummaryGridComponent;
  let fixture: ComponentFixture<PatientAccountSummaryGridComponent>;
  let rows: any;
  let mockViewClaimServiceMock, mockFeatureFlagService;  
  let mockAccountSummaryFactory = {
    getRowDetails: (a: any, b: any) => {},
    getEncounterDetails: jasmine
      .createSpy('mockAccountSummaryFactory.getEncounterDetails')
      .and.returnValue({
        then: function (callback) {
          callback(rows);
        },
      }),
  };
  beforeEach(() => {    
    mockViewClaimServiceMock = {
      viewOrPreviewPdf: jasmine.createSpy().and.returnValue(of({}))
    };    
    mockFeatureFlagService = {
      getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(of(true)),
    };
  });
 
  let patSecurityService: any;
  const mockpatSecurityService = {
    IsAuthorizedByAbbreviation: (authtype: string) => {},
  };

  let mockAccountServiceTransactionFactory = {
    deleteServiceTransaction: (a: any, b: any, c: any, d: any, e: any) => {},
  };

  let mockAccountDebitTransactionFactory = {
    deleteDebit: (a: any, b: any, c: any) => {},
  };

  let mockAccountSummaryDeleteFactory = {
    deleteAccountSummaryRowDetail: (a: any, b: any, c: any, d: any) => {},
  };

  let mockaccountNoteFactory = {
    openClaimNoteModal: (a: any, b: any, c: any, d: any) => {},
  };
  let commonServices = {
    ClaimPdf: (a: any) => {},
  };

  const mockPatientServices = {
    PatientBenefitPlan: {
      getPatientBenefitPlansByAccountId: (accountId: '1122') => {
        return {
          $promise: {
            then(callback) {},
          },
        };
      },
    },
  };
  const mockLocalizeService: any = {
    getLocalizedString: () => 'translated text',
  };

  const mockModalFactory = {
    ConfirmModal: jasmine
      .createSpy('ModalFactory.ConfirmModal')
      .and.returnValue({ then: () => {} }),
  };

  const mockTabLauncher = jasmine.createSpy();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      declarations: [PatientAccountSummaryGridComponent],      
      providers: [
        {
          provide: 'AccountSummaryFactory',
          useValue: mockAccountSummaryFactory,
        },
        { provide: 'patSecurityService', useValue: mockpatSecurityService },
        {
          provide: 'AccountServiceTransactionFactory',
          useValue: mockAccountServiceTransactionFactory,
        },
        {
          provide: 'AccountDebitTransactionFactory',
          useValue: mockAccountDebitTransactionFactory,
        },
        {
          provide: 'AccountSummaryDeleteFactory',
          useValue: mockAccountSummaryDeleteFactory,
        },
        { provide: 'AccountNoteFactory', useValue: mockaccountNoteFactory },
        { provide: 'CommonServices', useValue: commonServices },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'PatientServices', useValue: mockPatientServices },
        { provide: 'ModalFactory', useValue: mockModalFactory },
        { provide: 'tabLauncher', useValue: mockTabLauncher },
        { provide: ViewClaimService, useValue: mockViewClaimServiceMock },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService}  
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAccountSummaryGridComponent);
    component = fixture.componentInstance;
    patSecurityService = TestBed.get('patSecurityService');
    component.patient = { Data: { PersonAccount: { AccountId: '1122' } } };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('should call getEncounterDetailsBeta', () => {
    it('should call getEncounterDetailsBeta function', () => {
      rows = [{ PersonId: '1234' }, { PersonId: '1234' }, { PersonId: '1235' }];
      component.patient = { Data: { PersonAccount: { AccountId: '1122' } } };
      component.getRowDetails(rows[0], null);
      expect(mockAccountSummaryFactory.getEncounterDetails).toHaveBeenCalled();
    });
  });

  describe('refreshData function', () => {
    it('should call parent function to refreshData for latest rows', () => {
      spyOn(component.refreshDataTx, 'emit');
      component.refreshData(event);
      expect(component.refreshDataTx.emit).toHaveBeenCalled();
    });
  });

  describe('edit account summary row detail function', () => {
    it('should edit the account summary row detail', () => {
      spyOn(component.editAccountSummaryRowDetail, 'emit');
      let rows = [
        { ObjectType: 'EncounterBo' },
        { ObjectType: 'DebitTransaction', PersonId: 4 },
      ];
      let items = [
        { ObjectType: 'ServiceTransaction', TransactionTypeId: 1 },
        { ObjectType: 'DebitTransaction', TransactionTypeId: 5, ObjectId: 2 },
      ];
      component.editRowDetail(rows[0], items[0]);
      expect(component.editAccountSummaryRowDetail.emit).toHaveBeenCalled();
    });
  });

  describe('editEncounter function', () => {
    it('should check whether encounter location matches user location', () => {
      component.hasSoarAuthEnctrEditKey = true;
      var encounter = { LocationId: '2' };
      var newLocation = { id: 1, name: 'New Location' };
      sessionStorage.setItem('userLocation', JSON.stringify(newLocation));
      component.editEncounter(encounter);
      jasmine.createSpy('component.setRouteParams').and.returnValue({
        $promise: {
          then: function () {
            expect(component.setRouteParams).toHaveBeenCalledWith(
              encounter,
              'EncountersCart/AccountSummary'
            );
          },
        },
      });
      jasmine
        .createSpy('component.changeCheckoutEncounterLocation')
        .and.returnValue({
          $promise: {
            then: function () {
              expect(
                component.changeCheckoutEncounterLocation
              ).toHaveBeenCalled();
            },
          },
        });
    });
  });

  describe('deleteAccountSummaryRowDetail function', () => {
    it('should check whether encounter location matches user location', () => {
      var encounter = { LocationId: '2', $$isPending: true };
      var newLocation = { id: 1, name: 'New Location' };
      sessionStorage.setItem('userLocation', JSON.stringify(newLocation));
      component.deleteAccountSummaryRowDetail(encounter, null);
      jasmine
        .createSpy(
          'mockAccountSummaryDeleteFactory.deleteAccountSummaryRowDetail'
        )
        .and.returnValue({
          $promise: {
            then: function () {
              expect(
                mockAccountSummaryDeleteFactory.deleteAccountSummaryRowDetail
              ).toHaveBeenCalledWith(
                encounter,
                null,
                undefined,
                newLocation.id
              );
            },
          },
        });
    });
  });

  describe('checkoutPendingEncounter function', () => {
    it('should check whether encounter location matches user location', () => {
      var encounter = { LocationId: '2' };
      var newLocation = { id: 1, name: 'New Location' };
      sessionStorage.setItem('userLocation', JSON.stringify(newLocation));
      component.checkoutPendingEncounter(encounter, 0);
      jasmine.createSpy('component.setRouteParams').and.returnValue({
        $promise: {
          then: function () {
            expect(component.setRouteParams).toHaveBeenCalledWith(
              encounter,
              'Checkout/AccountSummary'
            );
          },
        },
      });
      jasmine
        .createSpy('component.changeCheckoutEncounterLocation')
        .and.returnValue({
          $promise: {
            then: function () {
              expect(
                component.changeCheckoutEncounterLocation
              ).toHaveBeenCalled();
            },
          },
        });
    });
  });

  describe('delete insurance payment function', () => {
    it('should delete insurance payment', () => {
      spyOn(component.deleteInsurancePayment, 'emit');
      let insurancePaymentTypes = [{ PaymentTypeId: 1, CurrencyTypeId: 3 }];
      var detail = {
        Claims: [{ ClaimId: 999 }],
        IsAuthorized: true,
        PaymentTypeId: 1,
        ObjectId: 1,
      };
      component.deleteInsPayment(detail);
      expect(component.deleteInsurancePayment.emit).toHaveBeenCalled();
    });
  });

  describe('edit account payment or negative adjustment modal function', () => {
    it('should edit account payment or negative adjustment modal', () => {
      spyOn(component.editAcctPaymentOrNegAdjustmentModal, 'emit');
      var detail = {
        TransactionTypeId: 2,
        LocationId: 1,
        Date: '06-09-2021',
        AccountMemberId: 99,
        PaymentTypeId: 1,
        $$patientInfo: {
          PersonAccount: {
            AccountId: '234234-23432-23423-234',
          },
        },
      };
      var allAccountPaymentTypes = [
        { PaymentTypeId: 1, Name: 'ActAcc', IsActive: true },
        { PaymentTypeId: 3, Name: 'InActAcc2', IsActive: false },
        { PaymentTypeId: 2, Name: 'ActAcc3', IsActive: true },
        { PaymentTypeId: 4, Name: 'InActAcc4', IsActive: false },
      ];
      component.editacctPayorNegAdj(detail);
      expect(
        component.editAcctPaymentOrNegAdjustmentModal.emit
      ).toHaveBeenCalled();
    });
  });

  describe('apply payment function', () => {
    it('should apply payment', () => {
      spyOn(component.applyPayment, 'emit');
      var item = null;
      component.applyPaymnt(item);
      expect(component.applyPayment.emit).toHaveBeenCalled();
    });
  });

  describe('apply adjustment function', () => {
    it('should apply adjustment', () => {
      spyOn(component.applyAdjustment, 'emit');
      var item = null;
      component.applyAdj(item);
      expect(component.applyAdjustment.emit).toHaveBeenCalled();
    });
  });

  describe('create claim function', () => {
    it('should create claim', () => {
      spyOn(component.createClaim, 'emit');
      var item = null;
      component.createClm(item);
      expect(component.createClaim.emit).toHaveBeenCalled();
    });
  });

  describe('view account note function', () => {
    it('should view account note', () => {
      spyOn(component.viewAccountNote, 'emit');
      var item = null;
      component.viewAcctNote(item);
      expect(component.viewAccountNote.emit).toHaveBeenCalled();
    });
  });

  describe('edit account note function', () => {
    it('should edit account note', () => {
      spyOn(component.editAccountNote, 'emit');
      var item = null;
      component.editAcctNote(item);
      expect(component.editAccountNote.emit).toHaveBeenCalled();
    });
  });

  describe('delete account note function', () => {
    it('should delete account note', () => {
      spyOn(component.deleteAccountNote, 'emit');
      var deleteAccountNote = { Id: 5, NoteType: 1 };
      component.deleteAcctNote(deleteAccountNote);
      expect(component.deleteAccountNote.emit).toHaveBeenCalled();
    });
  });

  describe('view EOB function', () => {
    it('should call account note factory viewEob function if not an insurance payment', function () {
      var item = null;
      var row = null;
      spyOn(component.viewEob, 'emit');
      component.vieweob(item, row);
      expect(component.viewEob.emit).toHaveBeenCalled();
    });
    it('should call credit transaction factory viewEob function if an insurance payment', function () {
      var row = { PersonId: 100 };
      var item = {
        EraTransactionSetHeaderId: 4,
        ObjectIdLong: 7,
        PersonId: null,
        TransactionTypeId: 3,
        Claims: [{ ClaimId: 300 }],
      };
      spyOn(component.viewEob, 'emit');
      component.vieweob(item, row);
      expect(component.viewEob.emit).toHaveBeenCalled();
    });
  });

  describe('view invoice function', () => {
    it('should view invoice', () => {
      spyOn(component.viewInvoice, 'emit');
      var row = null;
      component.viewInv({});
      expect(component.viewInvoice.emit).toHaveBeenCalled();
    });
  });

  describe('create current invoice function', () => {
    it('should create current invoice', () => {
      spyOn(component.createCurrentInvoice, 'emit');
      var row = null;
      component.createCurrentInv([]);
      expect(component.createCurrentInvoice.emit).toHaveBeenCalled();
    });
  });

  describe("previewPdf function ->", function () {    
    it ("should call viewClaimService.viewOrPreviewPdf", function () {
      component.enableEliminateStaleClaims = true;
      const claim = { Status: 1, Type: 1, ClaimId: 1, PatientName: "Patient" };
      component.previewPdf(claim);
      expect(mockViewClaimServiceMock.viewOrPreviewPdf).toHaveBeenCalledWith(claim, "Patient", component.enableEliminateStaleClaims);
    });
  });
});
