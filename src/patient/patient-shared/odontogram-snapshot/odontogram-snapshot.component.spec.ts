import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OdontogramSnapshotComponent } from './odontogram-snapshot.component';

describe('OdontogramSnapshotComponent', () => {
  let component: OdontogramSnapshotComponent;
  let fixture: ComponentFixture<OdontogramSnapshotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OdontogramSnapshotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OdontogramSnapshotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
