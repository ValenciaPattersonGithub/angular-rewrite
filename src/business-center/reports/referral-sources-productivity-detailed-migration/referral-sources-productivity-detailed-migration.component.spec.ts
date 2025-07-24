import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsHelper } from '../reports-helper';

import { ReferralSourcesProductivityDetailedMigrationComponent } from './referral-sources-productivity-detailed-migration.component';

describe('ReferralSourcesProductivityDetailedMigrationComponent', () => {
  let component: ReferralSourcesProductivityDetailedMigrationComponent;
  let fixture: ComponentFixture<ReferralSourcesProductivityDetailedMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferralSourcesProductivityDetailedMigrationComponent ],  providers: [ReportsHelper]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralSourcesProductivityDetailedMigrationComponent);
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
            "RangeSelected": "23967.55",
            "ThisMonth": "0",
            "ThisYear": "23967.55",
            "Sources":[
              {
              "RangeSelected": "0",
              "ReferralSource": "AAT, CSTPT2 T. Sr - AATCS1",
              "ThisMonth": "0",
              "ThisYear": "5160",
              "Patients":[
                {
                  "FirstVisit": "2021-01-03T00:00:00",
                  "Patient": "Elessa, Morgan T. - ELEMO1",
                  "RangeSelected": "0",
                  "ThisMonth": "0",
                  "ThisYear": "5120"
              },
              {
                "FirstVisit": "2021-04-09T00:00:00",
                "Patient": "K, Mappe K. - KMA1",
                "RangeSelected": "0",
                "ThisMonth": "0",
                "ThisYear": "40"
            }
            ]
              },
              {
                "RangeSelected": "0",
                "ReferralSource": "Facebook Page",
                "ThisMonth": "0",
                "ThisYear": "4435",
                "Patients":[
                  {
                    "FirstVisit": "2021-01-03T00:00:00",
                    "Patient": "Elessa, Morgan T. - ELEMO1",
                    "RangeSelected": "0",
                    "ThisMonth": "0",
                    "ThisYear": "4400"
                },
                {
                  "FirstVisit": "2021-04-09T00:00:00",
                  "Patient": "K, Mappe K. - KMA1",
                  "RangeSelected": "0",
                  "ThisMonth": "0",
                  "ThisYear": "35"
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
