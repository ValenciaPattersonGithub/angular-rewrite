import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCodeByServiceTypeProductivityMigrationComponent } from './service-code-by-service-type-productivity-migration.component';

describe('ServiceCodeByServiceTypeProductivityMigrationComponent', () => {
  let component: ServiceCodeByServiceTypeProductivityMigrationComponent;
  let fixture: ComponentFixture<ServiceCodeByServiceTypeProductivityMigrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceCodeByServiceTypeProductivityMigrationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceCodeByServiceTypeProductivityMigrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
