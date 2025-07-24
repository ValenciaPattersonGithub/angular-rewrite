import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/@shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NetCollectionByProviderMigrationComponent } from './collection-by-provider-migration.component';

describe('NetCollectionByProviderMigrationComponent', () => {
  let component: NetCollectionByProviderMigrationComponent;
  let fixture: ComponentFixture<NetCollectionByProviderMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NetCollectionByProviderMigrationComponent],
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
    fixture = TestBed.createComponent(NetCollectionByProviderMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        "Providers": [
          {
            "Provider": "Admin, Innovators - ADMIN1",
            "Collection": 5408.32,
            "Adjustments": 28.00,
            "NetCollection": 5436.32,
            "Transactions": [
              {
                "IsAdjustment": false,
                "Date": "2021-02-05",
                "Patient": "Demon, Ryan T. - DEMRY1",
                "Description": "Account Payment - Cash",
                "Location": "Innovators",
                "OriginalDate": null,
                "Collection": 1.00,
                "Adjustment": 0,
                "NetCollection": 1.00
              },
              {
                "IsAdjustment": false,
                "Date": "2021-03-05",
                "Patient": "Demon, Ryan T. - DEMRY2",
                "Description": "Account Payment - Cash",
                "Location": "Innovators",
                "OriginalDate": null,
                "Collection": 4.00,
                "Adjustment": 0,
                "NetCollection": 7.00
              }
            ]
          }, 
          {
            "Provider": "Admin, Innovators - ADMIN2",
            "Collection": 549.32,
            "Adjustments": 23.00,
            "NetCollection": 5432.32,
            "Transactions": [
              {
                "IsAdjustment": false,
                "Date": "2021-01-05",
                "Patient": "Demon, Ryan T. - DEMRY1",
                "Description": "Account Payment - Cash",
                "Location": "Innovators",
                "OriginalDate": null,
                "Collection": 1.00,
                "Adjustment": 0,
                "NetCollection": 1.00
              },
              {
                "IsAdjustment": false,
                "Date": "2021-01-05",
                "Patient": "Demon, Ryan T. - DEMRY1",
                "Description": "Account Payment - Cash",
                "Location": "Innovators",
                "OriginalDate": null,
                "Collection": 2.00,
                "Adjustment": 0,
                "NetCollection": 2.00
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
