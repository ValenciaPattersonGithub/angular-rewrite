import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { DateStampComponent } from './date-stamp.component';

describe('DateStampComponent', () => {
  let component: DateStampComponent;
  let fixture: ComponentFixture<DateStampComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateStampComponent ],
      imports: [TranslateModule.forRoot()],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateStampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
