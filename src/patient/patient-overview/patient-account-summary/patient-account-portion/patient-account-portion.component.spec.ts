import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAccountPortionComponent } from './patient-account-portion.component';

describe('PatientAccountPortionComponent', () => {
  let component: PatientAccountPortionComponent;
  let fixture: ComponentFixture<PatientAccountPortionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAccountPortionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAccountPortionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
