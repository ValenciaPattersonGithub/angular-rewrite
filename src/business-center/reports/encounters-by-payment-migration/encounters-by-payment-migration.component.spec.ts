import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsHelper } from '../reports-helper';

import { EncountersByPaymentMigrationComponent } from './encounters-by-payment-migration.component';

describe('EncountersByPaymentMigrationComponent', () => {
  let component: EncountersByPaymentMigrationComponent;
  let fixture: ComponentFixture<EncountersByPaymentMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EncountersByPaymentMigrationComponent ],
      providers: [ReportsHelper]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EncountersByPaymentMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        "Locations": [
          {
            "Location": "Innovators",
            "TotalPatients": 3,
            "TotalFeeCharged": 18933.58,
            "TotalAllowedAmount": 11313,
            "Difference": 7620.58,
            "Payments": [
              {
                "Payment": "Inno Health Alliance",
                "TotalPatients": 2,
                "TotalFeeCharged": 17890.08,
                "TotalAllowedAmount": 11124,
                "Difference": 6766.08,
                "Dates": [
                  {
                    "Date": "2021-08-23T00:00:00",
                    "TotalPatients": 1,
                    "TotalFeeCharged": 165,
                    "TotalAllowedAmount": 0,
                    "Difference": 165,
                    "Patients": [
                      {
                        "Patient": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                        "DateOfBirth": "1988-01-01T23:59:00",
                        "PolicyHolder": "AdjustOffReceiptOfPayment, Invoice - ADJIN1",
                        "PolicyHolderId": "AjstOffRecptPmt01",
                        "GroupNumber": "GRP007",
                        "TotalFeeCharged": 165,
                        "TotalAllowedAmount": 0,
                        "Difference": 165,
                        "Services": [
                          {
                            "Service": "D0383: cone beam CT image capture with field of view of both jaws, with or without cranium (D0383)",
                            "Tooth": "",
                            "Area": null,
                            "FeeCharged": 165,
                            "AllowedAmount": 0,
                            "Difference": 165
                          }
                        ]
                      }
                    ]

                  }
                ]
              },
            ]
          },
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
