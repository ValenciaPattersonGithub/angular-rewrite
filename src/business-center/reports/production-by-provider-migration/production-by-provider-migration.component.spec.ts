import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/@shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { NetproductionByProviderMigrationComponent } from './production-by-provider-migration.component';

describe('NetproductionByProviderMigrationComponent', () => {
  let component: NetproductionByProviderMigrationComponent;
  let fixture: ComponentFixture<NetproductionByProviderMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NetproductionByProviderMigrationComponent],
      imports: [
        ScrollingModule,
        CommonModule,
        SharedModule,
        TranslateModule,
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetproductionByProviderMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  let data =
  {
    "Providers": [
      {
        "Provider": "Admin, Innovators - ADMIN1",
        "Production": 5408.32,
        "Adjustments": 28.00,
        "NetProduction": 5436.32,
        "Transactions": [
          {
            "Date": "2021-02-05",
            "Patient": "Demon, Ryan T. - DEMRY1",
            "Description": "Account Payment - Cash",
            "Location": "Innovators",
            "OriginalDate": null,
            "Production": 1.00,
            "Adjustment": 2.22,
            "NetProduction": 2.20
          },
          {
            "Date": "2021-03-05",
            "Patient": "Demon, Ryan T. - DEMRY2",
            "Description": "Account Payment - Cash",
            "Location": "Innovators",
            "OriginalDate": null,
            "Production": 3.00,
            "Adjustment": 1.25,
            "NetProduction": 6.85
          }
        ]
      },
      {
        "Provider": "Admin, Innovators - ADMIN2",
        "Production": 549.32,
        "Adjustments": 23.00,
        "NetProduction": 5432.32,
        "Transactions": [
          {
            "Date": "2021-01-05",
            "Patient": "Demon, Ryan T. - DEMRY1",
            "Description": "Account Payment - Cash",
            "Location": "Innovators",
            "OriginalDate": null,
            "Production": 3.35,
            "Adjustment": 0,
            "NetProduction": 2.25
          },
          {
            "Date": "2021-01-05",
            "Patient": "Demon, Ryan T. - DEMRY1",
            "Description": "Account Payment - Cash",
            "Location": "Innovators",
            "OriginalDate": null,
            "Production": 3.25,
            "Adjustment": 0,
            "NetProduction": 1.26
          }
        ]
      }
    ]
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  describe('Refresh report data', () => {
    it('Should refresh report data', () => {
      component.data = data;
      component.refreshData = jasmine.createSpy();
      component.ngOnChanges();
      expect(component.refreshData).toHaveBeenCalled();
    });

  });
});
