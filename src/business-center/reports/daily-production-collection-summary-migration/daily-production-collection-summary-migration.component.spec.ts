import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/@shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { DailyProductionCollectionSummaryMigrationComponent } from './daily-production-collection-summary-migration.component';
import { ReportsHelper } from '../reports-helper';

describe('DailyProductionCollectionSummaryMigrationComponent', () => {
  let component: DailyProductionCollectionSummaryMigrationComponent;
  let fixture: ComponentFixture<DailyProductionCollectionSummaryMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DailyProductionCollectionSummaryMigrationComponent],
      imports: [
        ScrollingModule,
        CommonModule,
        SharedModule,
        TranslateModule,
      ],  providers: [ReportsHelper],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyProductionCollectionSummaryMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  let data =
  {
    "TotalProduction": 7.32,
    "TotalCollections": 7.32,
    "TotalAdjustments": 7.32,
    "Locations": [
      {
        "Location": "Innovators",
        "Collections": 5.32,
        "Adjustments": 5.00,
        "Production": 4.00,
        "Dates": [
          {
            "Date": "2021-02-05",
            "Collections": 1.00,
            "Adjustments": 0,
            "Production": 1.00
          },
          {
            "Date": "2021-03-05",
            "Collections": 4.32,
            "Adjustments": 5.00,
            "Production": 3.00
          }
        ]
      },
      {
        "Location": "Innovators",
        "Collections": 2.00,
        "Adjustments": 0,
        "Production": 2.00,
        "Dates": [
          {
            "Date": "2021-04-05",
            "Collections": 1.00,
            "Adjustments": 0,
            "Production": 1.00
          },
          {
            "Date": "2021-06-05",
            "Collections": 1.00,
            "Adjustments": 0,
            "Production": 1.00
          }
        ]
      },
       
    ]
  }

  describe('Refresh the data', () => {
    it('Should refresh report data', () => {
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
