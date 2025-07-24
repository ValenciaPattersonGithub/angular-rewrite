import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientOverviewComponent } from './patient-overview.component';
import { ImagingProviderService } from '../imaging/services/imaging-provider.service';
import { TranslateService } from '@ngx-translate/core';

const mockTranslateService = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);
const imagingService = jasmine.createSpyObj<ImagingProviderService>('TranslateService', ['resolve']);

describe('PatientOverviewComponent', () => {
  let component: PatientOverviewComponent;
  let fixture: ComponentFixture<PatientOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PatientOverviewComponent],
      providers: [
        { provide: ImagingProviderService, useValue: imagingService },
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
