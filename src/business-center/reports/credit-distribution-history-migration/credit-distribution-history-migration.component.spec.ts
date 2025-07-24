import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { CreditDistributionHistoryMigrationComponent } from './credit-distribution-history-migration.component';

describe('CreditDistributionHistoryMigrationComponent', () => {
  let component: CreditDistributionHistoryMigrationComponent;
  let fixture: ComponentFixture<CreditDistributionHistoryMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreditDistributionHistoryMigrationComponent],
      imports:[TranslateModule.forRoot()]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditDistributionHistoryMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        "creditDistributionHistoryReportDto": [
          {
            "TransactionType": "- Adjustment",
            "ResponsibleParty": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
            "Location": "Innovators",
            "Amount": 20,
            "Date": "2021-04-16T00:00:00",
            "Description": "Deleted: Negative_Adjustments - Verifying the invoice.. Also print receipt.",
            "Impaction": "Adjustment",
            "AppliedToTransactions": [
              {
                "PostedDate": "2021-04-16T00:00:00",
                "ServiceDate": "2021-04-16T00:00:00",
                "DateOfService": null,
                "Patient": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                "Provider": "Administrator, Fuse - ADMFU1",
                "Location": "Innovators",
                "TeamMember": "Administrator, Fuse - ADMFU1",
                "Description": "Unapplied amount",
                "Tooth": "",
                "Area": "",
                "Amount": 20,
                "IsDeleted": true
              },
              {
                "PostedDate": "2021-09-16T00:00:00",
                "ServiceDate": "2021-09-16T00:00:00",
                "DateOfService": null,
                "Patient": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                "Provider": "Admin, Innovators - ADMIN1",
                "Location": "Innovators",
                "TeamMember": "Administrator, Fuse - ADMFU1",
                "Description": "Unapplied amount",
                "Tooth": "",
                "Area": "",
                "Amount": 20,
                "IsDeleted": true
              },
              {
                "PostedDate": "2021-09-16T00:00:00",
                "ServiceDate": "2021-09-16T00:00:00",
                "DateOfService": null,
                "Patient": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                "Provider": "Admin, Innovators - ADMIN1",
                "Location": "Innovators",
                "TeamMember": "Administrator, Fuse - ADMFU1",
                "Description": "Unapplied amount",
                "Tooth": "",
                "Area": "",
                "Amount": -20,
                "IsDeleted": true
              },
            ],
            "IsDeleted": true,
            "Total": 0,
            "AppliedToDeletedTransactions": null,
            "ReportTitle": null,
            "GeneratedAtDateTime": "0001-01-01T00:00:00",
            "GeneratedByUserCode": null,
            "LocationOrPracticeName": null,
            "LocationOrPracticePhone": null,
            "LocationOrPracticeEmail": null,
            "FilterInfo": null,
            "ReportRunDate": null
          }
        ]
      }

      component.data = data;
      component.refreshData = jasmine.createSpy();
      component.ngOnChanges();
      expect(component.refreshData).toHaveBeenCalled();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
