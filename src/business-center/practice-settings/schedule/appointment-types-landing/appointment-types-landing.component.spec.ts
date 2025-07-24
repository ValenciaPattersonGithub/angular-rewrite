import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentTypesLandingComponent } from './appointment-types-landing.component';

describe('AppointmentTypesLandingComponent', () => {
  let component: AppointmentTypesLandingComponent;
  let fixture: ComponentFixture<AppointmentTypesLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentTypesLandingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentTypesLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
