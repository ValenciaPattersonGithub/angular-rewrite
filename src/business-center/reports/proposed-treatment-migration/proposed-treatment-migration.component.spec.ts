import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsHelper } from '../reports-helper';

import { ProposedTreatmentMigrationComponent } from './proposed-treatment-migration.component';

describe('ProposedTreatmentMigrationComponent', () => {
  let component: ProposedTreatmentMigrationComponent;
  let fixture: ComponentFixture<ProposedTreatmentMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProposedTreatmentMigrationComponent],
      providers: [ReportsHelper]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposedTreatmentMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        "NumberOfServices": 63,
        "Amount": 6280,
        "Locations": [
          {
            "Location": "Innovators",
            "NumberOfServices": 63,
            "Amount": 6280,
            "Patients": [
              {
                "Patient": "AdjustOffReceiptOfPayment, Invoice T. - ADJIN1",
                "NumberOfServices": 59,
                "Amount": 5940,
                "Plans": [
                  {
                    "DateProposed": "2021-08-25T00:00:00",
                    "TreatmentPlan": "No Plan",
                    "NumberOfServices": 1,
                    "Amount": 110,
                    "Services": [
                      {
                        "OriginalLocation": "Innovators",
                        "CurrentLocation": "Innovators",
                        "Description": "D0120: periodic oral evaluation - established patient (D0120)",
                        "ToothArea": "",
                        "Status": "Proposed",
                        "Provider": "Mark, Carls T. Jr - MARCA1",
                        "AppointmentDate": null,
                        "Fee": 110
                      }
                    ]
                  },
                  {
                    "DateProposed": "2021-08-27T00:00:00",
                    "TreatmentPlan": "No Plan",
                    "NumberOfServices": 2,
                    "Amount": 110,
                    "Services": [
                      {
                        "OriginalLocation": "Innovators",
                        "CurrentLocation": "Innovators",
                        "Description": "D Code: periodic oral evaluation - established patient (D0120)",
                        "ToothArea": "1",
                        "Status": "Proposed",
                        "Provider": "Mark, Carls T. Jr - MARCA1",
                        "AppointmentDate": null,
                        "Fee": 0
                      },
                      {
                        "OriginalLocation": "Innovators",
                        "CurrentLocation": "Innovators",
                        "Description": "D0120: periodic oral evaluation - established patient (D0120)",
                        "ToothArea": "",
                        "Status": "Proposed",
                        "Provider": "Mark, Carls T. Jr - MARCA1",
                        "AppointmentDate": null,
                        "Fee": 110
                      }
                    ]
                  }
                ]
              }
            ],
            "ReportTitle": "Proposed Treatment",
            "GeneratedAtDateTime": "2022-03-03T07:55:04.2321721Z",
            "GeneratedByUserCode": "ADMFU1",
            "LocationOrPracticeName": "PracticePerf26899",
            "LocationOrPracticePhone": "11111-222",
            "LocationOrPracticeEmail": "info@test.com",
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
