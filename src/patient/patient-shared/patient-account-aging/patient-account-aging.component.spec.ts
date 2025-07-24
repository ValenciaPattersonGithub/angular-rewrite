import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAccountAgingComponent } from './patient-account-aging.component';

describe('PatientAccountAgingComponent', () => {
  let component: PatientAccountAgingComponent;
  let fixture: ComponentFixture<PatientAccountAgingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAccountAgingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAccountAgingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
