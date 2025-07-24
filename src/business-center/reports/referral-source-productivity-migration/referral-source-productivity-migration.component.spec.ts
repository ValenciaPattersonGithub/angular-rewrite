import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralSourceProductivityMigrationComponent } from './referral-source-productivity-migration.component';

describe('ReferralSourceProductivityMigrationComponent', () => {
  let component: ReferralSourceProductivityMigrationComponent;
  let fixture: ComponentFixture<ReferralSourceProductivityMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReferralSourceProductivityMigrationComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralSourceProductivityMigrationComponent);
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
