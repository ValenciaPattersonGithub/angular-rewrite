import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferredPatientsBetaMigrationComponent } from './referred-patient-migration.component';

describe('ReferredPatientsMigrationComponent', () => {
  let component: ReferredPatientsBetaMigrationComponent;
  let fixture: ComponentFixture<ReferredPatientsBetaMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferredPatientsBetaMigrationComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferredPatientsBetaMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        "ReferralTypes": [
          {
            "ReferralType": "Other",
            "ReferralSources": [
              {
                "ReferralSource": "DemoReferral",
                "Patients": [
                  {
                    "ReferredPatientName": "AdjustmentBy, Provider T.",
                    "ReferredPatientCode": "ADJPR1",
                    "ReferredPatientLocation": "Innovators"
                  },
                  {
                    "ReferredPatientName": "Bqugdsuw, Ukbxfelk",
                    "ReferredPatientCode": "BQUUK1",
                    "ReferredPatientLocation": "Innovators"
                  }
                ]
              },
              {
                "ReferralSource": "Flyer",
                "Patients": [
                  {
                    "ReferredPatientName": "Referral, My",
                    "ReferredPatientCode": "REFMY1",
                    "ReferredPatientLocation": "Innovators"
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
