import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsHelper } from '../reports-helper';

import { AdjustmentsByTypeMigrationComponent } from './adjustments-by-type-migration.component';

describe('AdjustmentsByTypeMigrationComponent', () => {
  let component: AdjustmentsByTypeMigrationComponent;
  let fixture: ComponentFixture<AdjustmentsByTypeMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdjustmentsByTypeMigrationComponent],
      providers: [ReportsHelper]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdjustmentsByTypeMigrationComponent);
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
            "Amount": 0,
            "AdjustmentTypes": [
              {
                "AdjustmentType": "Negative_Adjustments",
                "Impaction": "Adjustment",
                "AdjustmentCount": 3,
                "Amount": 20,
                "PositiveNegative": "Negative",
                "Dates": [
                  {
                    "Date": "2021-09-10T00:00:00",
                    "Amount": 1,
                    "AdjustmentCount": 2,
                    "AdjustmentRecords": [
                      {
                        "ResponsibleParty": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                        "Provider": "Mark, Carls T. Jr - MARCA1",
                        "Description": "Void Payment: AutoNegCol - Test",
                        "OrigTransDate": "2021-05-10T00:00:00",
                        "Amount": 328
                      },
                      {
                        "ResponsibleParty": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                        "Provider": "Mark, Carls T. Jr - MARCA1",
                        "Description": "Deleted: AutoNegCol - Test",
                        "OrigTransDate": null,
                        "Amount": -327
                      }
                    ]
                  },
                  {
                    "Date": "2021-09-16T00:00:00",
                    "Amount": 327,
                    "AdjustmentCount": 1,
                    "AdjustmentRecords": [
                      {
                        "ResponsibleParty": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                        "Provider": "Mark, Carls T. Jr - MARCA1",
                        "Description": "Void Payment: AutoNegCol - Test",
                        "OrigTransDate": "2021-05-10T00:00:00",
                        "Amount": 327
                      }
                    ]
                  }
                ]
              },
              {
                  "AdjustmentType": "AutoNegProd",
                  "PositiveNegative": "Negative",
                  "Impaction": "Production",
                  "Amount": 0,
                  "AdjustmentCount": 4,
                  "Dates": [
                      {
                          "Date": "2021-09-11T00:00:00",
                          "Amount": -330,
                          "AdjustmentCount": 1,
                          "AdjustmentRecords": [
                              {
                                  "ResponsibleParty": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                                  "Provider": "Administrator, Fuse - ADMFU1",
                                  "Description": "Deleted: AutoNegProd - demo",
                                  "OrigTransDate": null,
                                  "Amount": -330
                              }
                          ]
                      },
                      {
                          "Date": "2021-09-16T00:00:00",
                          "Amount": 330,
                          "AdjustmentCount": 3,
                          "AdjustmentRecords": [
                              {
                                  "ResponsibleParty": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                                  "Provider": "Administrator, Fuse - ADMFU1",
                                  "Description": "Void Payment: AutoNegProd - demo",
                                  "OrigTransDate": "2021-09-11T00:00:00",
                                  "Amount": 330
                              },
                              {
                                  "ResponsibleParty": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                                  "Provider": "Administrator, Fuse - ADMFU1",
                                  "Description": "Deleted: AutoNegProd - demo",
                                  "OrigTransDate": null,
                                  "Amount": -330
                              },
                              {
                                  "ResponsibleParty": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                                  "Provider": "Administrator, Fuse - ADMFU1",
                                  "Description": "Void Payment: AutoNegProd - demo",
                                  "OrigTransDate": "2021-09-10T00:00:00",
                                  "Amount": 330
                              }
                          ]
                      }
                  ]
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
