import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdjustmentsByProviderMigrationComponent } from './adjustments-by-provider-migration.component';

describe('AdjustmentsByProviderMigrationComponent', () => {
  let component: AdjustmentsByProviderMigrationComponent;
  let fixture: ComponentFixture<AdjustmentsByProviderMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdjustmentsByProviderMigrationComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustmentsByProviderMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        "Providers": [
          {
            "Provider": "Admin, Innovators - ADMIN1",
            "Amount": 0,
            "Transactions": [
              {
                "AdjustmentType": "Negative_Adjustments",
                "Date": "2021-02-05",
                "Patient": "Demon, Ryan T. - DEMRY1",
                "Description": "Void Payment: Negative_Adjustments",
                "Impaction": "Adjustment",
                "Location": "Innovators",
                "OrigTransDate": "2021-08-09",
                "Amount": 20,
                "PositiveNegative": "Negative"
              },
              {
                "AdjustmentType": "Negative_Adjustments",
                "Date": "2021-10-11",
                "Patient": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                "Description": "Void Payment: Positive_Adjustments",
                "Impaction": "Adjustment",
                "Location": "Innovators",
                "OrigTransDate": "2021-05-09",
                "Amount": 9,
                "PositiveNegative": "Positive"
              }
            ]
          },
          {
            "Provider": "Administrator, Fuse - ADMFU1",
            "Amount": -551,
            "Transactions": [
              {
                "AdjustmentType": "Positive_Adjustments",
                "Amount": -285,
                "Date": "2021-10-11",
                "Description": "Void Payment: Positive_Adjustments",
                "Impaction": "Adjustment",
                "Location": "Innovators",
                "OrigTransDate": "2021-05-09",
                "Patient": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN2",
                "PositiveNegative": "Negative"
              },
              {
                "AdjustmentType": "Negative_Adjustments",
                "Amount": -200,
                "Date": "2021-01-09",
                "Description": "Void Payment: Negative_Adjustments",
                "Impaction": "Adjustment",
                "Location": "Innovators",
                "OrigTransDate": "2021-04-10",
                "Patient": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN3",
                "PositiveNegative": "Positive"
              }
            ]
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
