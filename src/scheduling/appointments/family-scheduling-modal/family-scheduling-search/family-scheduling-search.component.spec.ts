import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FamilySchedulingSearchComponent } from './family-scheduling-search.component';
import { TranslateService } from '@ngx-translate/core';

describe('FamilySchedulingSearchComponent', () => {
  let component: FamilySchedulingSearchComponent;
  let fixture: ComponentFixture<FamilySchedulingSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [FamilySchedulingSearchComponent],
        imports: [HttpClientTestingModule],
        providers: [{ provide: 'toastrFactory', useValue: {} },
            { provide: 'SoarConfig', useValue: {} },
            { provide: TranslateService, useValue: {} },
            { provide: 'PatientServices', useValue: {} },
        ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilySchedulingSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
