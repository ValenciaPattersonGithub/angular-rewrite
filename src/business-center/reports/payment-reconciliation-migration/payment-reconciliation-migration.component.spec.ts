import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsHelper } from '../reports-helper';

import { PaymentReconciliationMigrationComponent } from './payment-reconciliation-migration.component';

describe('PaymentReconciliationMigrationComponent', () => {
  let component: PaymentReconciliationMigrationComponent;
  let fixture: ComponentFixture<PaymentReconciliationMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentReconciliationMigrationComponent ],  providers: [ReportsHelper]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentReconciliationMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  let data =
  {
    "Locations": [
      {
        "Location": "Apollo",
        "Amount": 5.32,
        "PaymentTypes": [
          {
            "PaymentType": "insurance payment",
            "Payments": [
              {
                "ServiceDate": "2021-02-05",
                "PostedDate": "2021-02-05",
                "PostedBy": "Administrator's, Fuse - ADMFU1",
                "ResponsibleParty": "Bradman, Don T. - BRADO4",
                "PatientGroup": "Shivaya",
                "Description": "Insurance Payment - insurance payment - testing insurance: 3242 - Bulk payment Testing",
                "Amount": 3.00,
                "DistributedAmounts": [
                  {
                    "Patient": "Bradman, Don T. - BRADO",
                    "Amount": 3.00
                  }
                ]
              },
              {
                "ServiceDate": "2021-03-05",
                "PostedDate": "2021-05-05",
                "PostedBy": "455583, Testing T. - TE2",
                "ResponsibleParty": "DemoGroup",
                "PatientGroup": "Shivaya",
                "Description": "Insurance Payment - insurance payment - testing insurance: 3242 - Bulk payment Testing",
                "Amount": 6.00,
                "DistributedAmounts": [
                  {
                    "Patient": "Bradman, Don T. - BRADO",
                    "Amount": 3.00
                  },
                  {
                    "Patient": "Bradman, Don T. - BRADO1",
                    "Amount": 3.00
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "Location": "Innovators",
        "PaymentTypes": [
          {
            "PaymentType": "insurance payment",
            "Payments": [
              {
                "ServiceDate": "2021-02-05",
                "PostedDate": "2021-02-05",
                "PostedBy": "Administrator's, Fuse - ADMFU1",
                "ResponsibleParty": "Bradman, Don T. - BRADO4",
                "PatientGroup": "Shivaya",
                "Description": "Insurance Payment - insurance payment - testing insurance: 3242 - Bulk payment Testing",
                "Amount": 3.00,
                "DistributedAmounts": [
                  {
                    "Patient": "Bradman, Don T. - BRADO",
                    "Amount": 3.00
                  }
                ]
              },
              {
                "ServiceDate": "2021-03-05",
                "PostedDate": "2021-05-05",
                "PostedBy": "455583, Testing T. - TE2",
                "ResponsibleParty": "DemoGroup",
                "PatientGroup": "Shivaya",
                "Description": "Insurance Payment - insurance payment - testing insurance: 3242 - Bulk payment Testing",
                "Amount": 6.00,
                "DistributedAmounts": [
                  {
                    "Patient": "Bradman, Don T. - BRADO",
                    "Amount": 3.00
                  },
                  {
                    "Patient": "Bradman, Don T. - BRADO1",
                    "Amount": 3.00
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Refresh the data', () => {
    it('Should refresh report data', () => {
      component.data = data;
      component.refreshData = jasmine.createSpy();
      component.ngOnChanges();
      expect(component.refreshData).toHaveBeenCalled();
    });
  });

});
