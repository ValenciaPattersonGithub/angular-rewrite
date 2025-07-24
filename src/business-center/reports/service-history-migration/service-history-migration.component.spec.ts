import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceHistoryMigrationComponent } from './service-history-migration.component';

describe('ServiceHistoryMigrationComponent', () => {
  let component: ServiceHistoryMigrationComponent;
  let fixture: ComponentFixture<ServiceHistoryMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ServiceHistoryMigrationComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceHistoryMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        "ServiceHistory": {
            "TotalFee": 12010.00,
            "Transactions": [
                {
                    "Date": "2025-04-09T00:00:00",
                    "Provider": "Arjun, Karan - ARJKA1",
                    "Patient": "etest, test - ETETE1",
                    "Tooth": "3",
                    "Area": "B5",
                    "Fee": 5880.00,
                    "Location": "29 Test"
                },
                {
                    "Date": "2025-04-17T00:00:00",
                    "Provider": "B, Megha - BME1",
                    "Patient": "Rec, Rec - RECRE1",
                    "Tooth": "",
                    "Area": "",
                    "Fee": 6080.00,
                    "Location": "29 Test"
                },
                {
                    "Date": "2025-04-23T00:00:00",
                    "Provider": "Arjun, Karan - ARJKA1",
                    "Patient": "Specter, Harvey A. - SPEHA7",
                    "Tooth": "",
                    "Area": "",
                    "Fee": 50.00,
                    "Location": "29 Test"
                }
              ],
            "ReportTitle": "Service History",
            "GeneratedAtDateTime": "2025-04-23T14:00:58.6610217Z",
            "GeneratedByUserCode": "KUMAJ2",
            "LocationOrPracticeName": "PracticePerf26899",
            "LocationOrPracticePhone": "11111-222",
            "LocationOrPracticeEmail": "info@test.com"
        },
    };

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
