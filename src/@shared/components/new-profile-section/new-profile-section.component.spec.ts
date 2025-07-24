import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewProfileSectionComponent } from './new-profile-section.component';
import { TranslateModule } from '@ngx-translate/core';

describe('NewProfileSectionComponent', () => {
  let component: NewProfileSectionComponent;
  let fixture: ComponentFixture<NewProfileSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewProfileSectionComponent],
      imports: [TranslateModule.forRoot()]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewProfileSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
