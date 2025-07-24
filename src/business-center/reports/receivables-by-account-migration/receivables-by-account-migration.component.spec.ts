import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsHelper } from '../reports-helper';

import { ReceivablesByAccountMigrationComponent } from './receivables-by-account-migration.component';

describe('ReceivablesByAccountMigrationComponent', () => {
  let component: ReceivablesByAccountMigrationComponent;
  let fixture: ComponentFixture<ReceivablesByAccountMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceivablesByAccountMigrationComponent ],  providers: [ReportsHelper]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivablesByAccountMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  let data =
  {
    "ThirtyDays": 7.32,
    "SixtyDays": 7.32,
    "NinetyDays": 7.32,
    "MoreThanNinetyDays": 7.32,
    "InCollection": 7.32,
    "TotalAccountBalance": 0.00,
    "TotalEstInsurance": 3.32,
    "TotalEstInsuranceAdjustment": 6.32,
    "TotalPatientPortion": 5.32,
    "Locations": [
      {
        "Location": "Innovators",
        "ThirtyDays": 7.32,
        "SixtyDays": 7.32,
        "NinetyDays": 7.32,
        "MoreThanNinetyDays": 7.32,
        "InCollection": 7.32,
        "TotalAccountBalance": 0.00,
        "TotalEstInsurance": 3.32,
        "TotalEstInsuranceAdjustment": 6.32,
        "TotalPatientPortion": 5.32,
        "ResponsibleParties": [
          {
            "ResponsibleParty":"Smith, Samuel - SMISA4",
            "ThirtyDays": 7.32,
            "SixtyDays": 7.32,
            "NinetyDays": 7.32,
            "MoreThanNinetyDays": 7.32,
            "InCollection": 7.32,
            "TotalAccountBalance": 0.00,
            "TotalEstInsurance": 3.32,
            "TotalEstInsuranceAdjustment": 6.32,
            "TotalPatientPortion": 5.32,
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
