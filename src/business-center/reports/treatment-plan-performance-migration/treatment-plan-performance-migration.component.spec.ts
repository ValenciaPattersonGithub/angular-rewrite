import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsHelper } from '../reports-helper';

import { TreatmentPlanPerformanceMigrationComponent } from './treatment-plan-performance-migration.component';

describe('TreatmentPlanPerformanceMigrationComponent', () => {
  let component: TreatmentPlanPerformanceMigrationComponent;
  let fixture: ComponentFixture<TreatmentPlanPerformanceMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreatmentPlanPerformanceMigrationComponent],
      providers: [ReportsHelper]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentPlanPerformanceMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
