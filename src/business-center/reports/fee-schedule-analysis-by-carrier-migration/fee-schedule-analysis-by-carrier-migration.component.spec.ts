import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { FeeScheduleAnalysisByCarrierMigrationComponent } from './fee-schedule-analysis-by-carrier-migration.component';

describe('FeeScheduleAnalysisByCarrierMigrationComponent', () => {
    let component: FeeScheduleAnalysisByCarrierMigrationComponent;
    let fixture: ComponentFixture<FeeScheduleAnalysisByCarrierMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [FeeScheduleAnalysisByCarrierMigrationComponent],
      imports:[TranslateModule.forRoot()]
    })
      .compileComponents();
  });

  beforeEach(() => {
      fixture = TestBed.createComponent(FeeScheduleAnalysisByCarrierMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Refresh the data', () => {
    it('should create the component', () => {
      let data =
      {
        
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
