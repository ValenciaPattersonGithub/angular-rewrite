import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientsClinicalNotesComponent } from './patients-clinical-notes.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/@shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

describe('PatientsClinicalNotesComponent', () => {
  let component: PatientsClinicalNotesComponent;
  let fixture: ComponentFixture<PatientsClinicalNotesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientsClinicalNotesComponent],
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
    fixture = TestBed.createComponent(PatientsClinicalNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
