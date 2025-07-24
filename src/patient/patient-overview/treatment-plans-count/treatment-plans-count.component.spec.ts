import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreatmentPlansCountComponent } from './treatment-plans-count.component';

describe('TreatmentPlansCountComponent', () => {
  let component: TreatmentPlansCountComponent;
  let fixture: ComponentFixture<TreatmentPlansCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreatmentPlansCountComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentPlansCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
