import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureBoxComponent } from './signature-box.component';

describe('SignatureBoxComponent', () => {
  let component: SignatureBoxComponent;
  let fixture: ComponentFixture<SignatureBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignatureBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatureBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
