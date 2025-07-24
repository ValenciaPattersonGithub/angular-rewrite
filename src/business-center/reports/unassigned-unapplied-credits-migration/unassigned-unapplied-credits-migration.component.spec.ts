import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { UnassignedUnappliedCreditsMigrationComponent } from './unassigned-unapplied-credits-migration.component';

describe('UnassignedUnappliedCreditsMigrationComponent', () => {
  let component: UnassignedUnappliedCreditsMigrationComponent;
  let fixture: ComponentFixture<UnassignedUnappliedCreditsMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UnassignedUnappliedCreditsMigrationComponent],
      imports:[TranslateModule.forRoot()]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnassignedUnappliedCreditsMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        "ResponsiblePersonDetails": [
          {
            "ResponsiblePerson": "Account, Note T. - ACCNO1",
            "TransactionDetails": [
              {
                "Date": "2022-04-01T00:00:00",
                "Patient": "Account, Note T. - ACCNO1",
                "Provider": "MARCA2",
                "Location": "Innovators",
                "TransactionType": "Negative Adjustment",
                "Description": "AutoNegCol - Test",
                "TransactionAmount": 33333,
                "UnappliedAmount": 33333
              },
              {
                "Date": "2022-04-01T00:00:00",
                "Patient": "Account, Note T. - ACCNO1",
                "Provider": "MARCA2",
                "Location": "Innovators",
                "TransactionType": "Negative Adjustment",
                "Description": "AutoNegAdjust - test",
                "TransactionAmount": 44444,
                "UnappliedAmount": 44444
              },
              {
                "Date": "2022-04-01T00:00:00",
                "Patient": "Account, Note T. - ACCNO1",
                "Provider": "MARCA2",
                "Location": "Innovators",
                "TransactionType": "Negative Adjustment",
                "Description": "new - tete",
                "TransactionAmount": 22222,
                "UnappliedAmount": 22222
              },
            ],
            "AccountBalance": -4365.39
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
